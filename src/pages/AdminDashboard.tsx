import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { crmProxyUrl } from "@/lib/crm";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import {
  LayoutDashboard, Users, Building2, Bell, Mail, TrendingUp,
  LogIn, LogOut, ShieldAlert, Eye, BarChart3
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";

interface LeadRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  metadata?: {
    score?: number;
    stage?: string;
    topAreaSlug?: string;
    topTopic?: string;
  } | null;
  property_title: string | null;
  source: string | null;
  created_at: string;
  synced_to_crm: boolean | null;
}

interface CrmPropertySummary {
  id: string;
  status?: string | null;
}

interface CrmPropertyMetricsResponse {
  total?: number;
  total_pages?: number;
  properties?: CrmPropertySummary[];
}

interface CrmLeadItem {
  id: string;
  full_name?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  created_at: string;
  lead_source?: string | null;
  metadata?: {
    score?: number;
    stage?: string;
    topAreaSlug?: string;
    topTopic?: string;
  } | null;
  linked_property?: {
    title?: string | null;
  } | null;
}

interface CrmLeadSnapshotResponse {
  leads?: CrmLeadItem[];
}

function leadIntentWeight(lead: LeadRow) {
  const stage = lead.metadata?.stage || "";
  const score = lead.metadata?.score || 0;
  const stageWeight = stage === "late" ? 200 : stage === "mid" ? 100 : 0;
  return stageWeight + score;
}

function formatIntentStage(stage?: string | null) {
  if (stage === "late") return "Alta";
  if (stage === "mid") return "Media";
  if (stage === "early") return "Inicial";
  return "Sin señal";
}

function intentBadgeClass(stage?: string | null) {
  if (stage === "late") return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  if (stage === "mid") return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  if (stage === "early") return "bg-slate-500/15 text-slate-300 border-slate-500/30";
  return "bg-muted text-muted-foreground border-border";
}

async function fetchCrmPropertyMetrics() {
  const limit = 1000;

  const fetchPage = async (page: number) => {
    const res = await fetch(crmProxyUrl("public-properties", { page, limit }));
    if (!res.ok) throw new Error("Failed to fetch CRM property metrics");
    return (await res.json()) as CrmPropertyMetricsResponse;
  };

  const firstPage = await fetchPage(1);
  let properties = firstPage.properties || [];

  if ((firstPage.total_pages || 1) > 1) {
    const pages = Array.from({ length: firstPage.total_pages - 1 }, (_, i) => i + 2);
    const responses = await Promise.all(pages.map((page) => fetchPage(page)));
    properties = [
      ...properties,
      ...responses.flatMap((json) => json.properties || []),
    ];
  }

  const uniqueProperties = Array.from(
    new Map(properties.map((property) => [property.id, property])).values()
  );
  const availableCount = uniqueProperties.filter(
    (property) => String(property.status || "").toLowerCase() === "disponible"
  ).length;

  return {
    total: firstPage.total || uniqueProperties.length,
    available: availableCount,
  };
}

async function fetchLeadSnapshot() {
  try {
    const response = await fetch(
      crmProxyUrl("web-leads-admin", { scope: "legado", limit: 50 })
    );

    if (response.ok) {
      const json = (await response.json()) as CrmLeadSnapshotResponse;
      if (Array.isArray(json.leads)) {
        return json.leads.map((lead) => ({
          id: lead.id,
          name: lead.full_name || lead.name || "Sin nombre",
          email: lead.email || "—",
          phone: lead.phone || null,
          metadata: lead.metadata || null,
          property_title: lead.linked_property?.title || null,
          source: lead.lead_source || null,
          created_at: lead.created_at,
          synced_to_crm: true,
        })) as LeadRow[];
      }
    }
  } catch {
    // Fall back to local DB below if CRM leads are not available yet.
  }

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as LeadRow[];
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);

  // KPIs
  const [totalProperties, setTotalProperties] = useState(0);
  const [totalLeads, setTotalLeads] = useState(0);
  const [leadsThisMonth, setLeadsThisMonth] = useState(0);
  const [totalPushSubs, setTotalPushSubs] = useState(0);
  const [totalNotifSent, setTotalNotifSent] = useState(0);
  const [propertiesAvailable, setPropertiesAvailable] = useState(0);
  const [highIntentLeadsThisMonth, setHighIntentLeadsThisMonth] = useState(0);
  const [recentLeads, setRecentLeads] = useState<LeadRow[]>([]);
  const [priorityLeads, setPriorityLeads] = useState<LeadRow[]>([]);
  const [leadFilter, setLeadFilter] = useState<"all" | "late" | "mid" | "early">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) checkAdmin(s.user.id);
      else { setIsAdmin(null); setAuthLoading(false); }
    });
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) checkAdmin(s.user.id);
      else setAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (isAdmin) fetchAllData();
  }, [isAdmin]);

  const checkAdmin = async (userId: string) => {
    const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    setIsAdmin(!!data);
    setAuthLoading(false);
  };

  const handleLogin = async () => {
    setLoginLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/admin`,
      },
    });
    if (error) toast({ title: "Error de acceso", description: error.message, variant: "destructive" });
    setLoginLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setIsAdmin(null);
  };

  const fetchAllData = async () => {
    setLoading(true);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString();

    const [
      crmMetrics,
      allLeads,
      pushSubsRes,
      notifRes,
    ] = await Promise.all([
      fetchCrmPropertyMetrics(),
      fetchLeadSnapshot(),
      supabase.from("push_subscriptions").select("id", { count: "exact", head: true }),
      supabase.from("push_notification_log").select("total_sent").gte("sent_at", startOfYear),
    ]);

    const leadsThisYear = allLeads.filter((lead) => lead.created_at >= startOfYear);
    const leadsInMonth = allLeads.filter((lead) => lead.created_at >= startOfMonth);
    const highIntentInMonth = leadsInMonth.filter((lead) => lead.metadata?.stage === "late");
    const prioritized = [...allLeads]
      .sort((a, b) => {
        const weightDiff = leadIntentWeight(b) - leadIntentWeight(a);
        if (weightDiff !== 0) return weightDiff;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

    setTotalProperties(crmMetrics.total || 0);
    setPropertiesAvailable(crmMetrics.available || 0);
    setTotalLeads(leadsThisYear.length);
    setLeadsThisMonth(leadsInMonth.length);
    setHighIntentLeadsThisMonth(highIntentInMonth.length);
    setTotalPushSubs(pushSubsRes.count || 0);
    setTotalNotifSent(
      (notifRes.data || []).reduce((sum, r) => sum + (r.total_sent || 0), 0)
    );
    setRecentLeads(allLeads.slice(0, 10));
    setPriorityLeads(prioritized.slice(0, 6));
    setLoading(false);
  };

  // Auth gates
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogIn className="h-5 w-5" /> Acceso administrador
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">Inicia sesión con tu cuenta de Google autorizada.</p>
            <Button onClick={handleLogin} disabled={loginLoading} className="w-full">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              {loginLoading ? "Accediendo..." : "Iniciar sesión con Google"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6 space-y-4">
            <ShieldAlert className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-xl font-bold text-foreground">Acceso denegado</h2>
            <p className="text-muted-foreground">No tienes permisos de administrador.</p>
            <Button variant="outline" onClick={handleLogout}>Cerrar sesión</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const kpis = [
    { icon: Building2, label: "Propiedades totales", value: totalProperties, accent: false },
    { icon: Eye, label: "Disponibles", value: propertiesAvailable, accent: false },
    { icon: Mail, label: `Leads ${new Date().getFullYear()}`, value: totalLeads, accent: true },
    { icon: TrendingUp, label: "Leads este mes", value: leadsThisMonth, accent: true },
    { icon: ShieldAlert, label: "Alta intención este mes", value: highIntentLeadsThisMonth, accent: true },
    { icon: Users, label: "Suscriptores push", value: totalPushSubs, accent: false },
    { icon: Bell, label: `Push enviados ${new Date().getFullYear()}`, value: totalNotifSent, accent: false },
  ];
  const filteredRecentLeads = recentLeads.filter((lead) =>
    leadFilter === "all" ? true : lead.metadata?.stage === leadFilter
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
      <AdminBreadcrumb />
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Panel de Administración</h1>
              <p className="text-muted-foreground text-sm">Legado Inmobiliaria — {new Date().getFullYear()}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/admin/push")}>
              <Bell className="h-4 w-4 mr-2" /> Push
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/admin/seo")}>
              SEO
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/admin/blog")}>
              Blog
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/admin/newsletter")}>
              <Mail className="h-4 w-4 mr-2" /> Newsletter
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/admin/analytics")}>
              <BarChart3 className="h-4 w-4 mr-2" /> Analytics
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" /> Salir
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        {loading ? (
          <p className="text-muted-foreground text-center py-12">Cargando datos...</p>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4">
              {kpis.map((kpi) => (
                <Card key={kpi.label} className={kpi.accent ? "border-primary/30 bg-primary/5" : ""}>
                  <CardContent className="pt-5 pb-4 px-4 text-center">
                    <kpi.icon className={`h-6 w-6 mx-auto mb-2 ${kpi.accent ? "text-primary" : "text-muted-foreground"}`} />
                    <p className="text-2xl font-bold text-foreground">{kpi.value.toLocaleString("es-ES")}</p>
                    <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5" /> Leads a priorizar hoy
                </CardTitle>
              </CardHeader>
              <CardContent>
                {priorityLeads.length === 0 ? (
                  <p className="text-muted-foreground text-center py-6">No hay señales de prioridad todavía</p>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {priorityLeads.map((lead) => (
                      <div key={lead.id} className="rounded-2xl border border-border/50 bg-card/40 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-foreground">{lead.name}</p>
                            <p className="text-sm text-muted-foreground">{lead.email}</p>
                          </div>
                          <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${intentBadgeClass(lead.metadata?.stage)}`}>
                            {formatIntentStage(lead.metadata?.stage)}
                          </span>
                        </div>
                        <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                          <p><span className="text-foreground">Score:</span> {lead.metadata?.score != null ? `${lead.metadata.score}/100` : "—"}</p>
                          <p><span className="text-foreground">Propiedad:</span> {lead.property_title || "General"}</p>
                          <p><span className="text-foreground">Zona top:</span> {lead.metadata?.topAreaSlug || "—"}</p>
                          <p><span className="text-foreground">Tema top:</span> {lead.metadata?.topTopic || "—"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Leads */}
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Mail className="h-5 w-5" /> Últimos leads recibidos
                  </CardTitle>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: "all", label: "Todos" },
                      { value: "late", label: "Alta" },
                      { value: "mid", label: "Media" },
                      { value: "early", label: "Inicial" },
                    ].map((filter) => (
                      <Button
                        key={filter.value}
                        variant={leadFilter === filter.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setLeadFilter(filter.value as "all" | "late" | "mid" | "early")}
                        className={leadFilter === filter.value ? "bg-gradient-gold text-primary-foreground" : ""}
                      >
                        {filter.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredRecentLeads.length === 0 ? (
                  <p className="text-muted-foreground text-center py-6">No hay leads aún</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Teléfono</TableHead>
                        <TableHead>Propiedad</TableHead>
                        <TableHead>Intento</TableHead>
                        <TableHead>CRM</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecentLeads.map((lead) => (
                        <TableRow key={lead.id}>
                          <TableCell className="text-sm whitespace-nowrap">
                            {new Date(lead.created_at).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" })}
                          </TableCell>
                          <TableCell className="font-medium text-sm">{lead.name}</TableCell>
                          <TableCell className="text-sm">{lead.email}</TableCell>
                          <TableCell className="text-sm">{lead.phone || "—"}</TableCell>
                          <TableCell className="text-sm max-w-[150px] truncate">{lead.property_title || "General"}</TableCell>
                          <TableCell className="text-sm">
                            {lead.metadata?.stage ? (
                              <div className="flex flex-col gap-1">
                                <span className={`inline-flex w-fit rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.18em] ${intentBadgeClass(lead.metadata.stage)}`}>
                                  {formatIntentStage(lead.metadata.stage)}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {lead.metadata.score != null ? `${lead.metadata.score}/100` : "—"}
                                  {lead.metadata.topAreaSlug ? ` · ${lead.metadata.topAreaSlug}` : ""}
                                  {lead.metadata.topTopic ? ` · ${lead.metadata.topTopic}` : ""}
                                </span>
                              </div>
                            ) : "—"}
                          </TableCell>
                          <TableCell>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${lead.synced_to_crm ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                              {lead.synced_to_crm ? "Sí" : "No"}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
