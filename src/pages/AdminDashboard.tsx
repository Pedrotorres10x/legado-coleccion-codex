import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { crmProxyUrl } from "@/lib/crm";
import AdminAuthGate from "@/components/AdminAuthGate";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NativeSelect } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  LayoutDashboard,
  Users,
  Building2,
  Bell,
  Mail,
  TrendingUp,
  LogOut,
  ShieldAlert,
  Eye,
  BarChart3,
  RefreshCw,
  Clock3,
  ArrowRight,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

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

interface PageView {
  id: string;
  session_id: string;
  path: string;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  device_type: string | null;
  screen_width: number | null;
  property_id: string | null;
  property_title: string | null;
  duration_seconds: number | null;
  created_at: string;
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

type DeviceType = "mobile" | "tablet" | "desktop";

const ANALYTICS_PERIOD_OPTIONS = [
  { value: "7", label: "7 dias" },
  { value: "30", label: "30 dias" },
  { value: "90", label: "90 dias" },
];

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
  return "Sin senal";
}

function intentBadgeClass(stage?: string | null) {
  if (stage === "late") return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  if (stage === "mid") return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  if (stage === "early") return "bg-slate-500/15 text-slate-300 border-slate-500/30";
  return "bg-muted text-muted-foreground border-border";
}

function simplifyPath(path: string) {
  if (path === "/") return "Inicio";
  if (path === "/propiedades") return "Propiedades";
  if (path === "/blog") return "Blog";
  if (path.startsWith("/propiedad/")) return "Propiedad";
  if (path.startsWith("/blog/")) return "Articulo";
  if (path === "/gracias") return "Gracias";
  return path;
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
    properties = [...properties, ...responses.flatMap((json) => json.properties || [])];
  }

  const uniqueProperties = Array.from(
    new Map(properties.map((property) => [property.id, property])).values(),
  );
  const availableCount = uniqueProperties.filter(
    (property) => String(property.status || "").toLowerCase() === "disponible",
  ).length;

  return {
    total: firstPage.total || uniqueProperties.length,
    available: availableCount,
  };
}

async function fetchLeadSnapshot() {
  try {
    const response = await fetch(
      crmProxyUrl("web-leads-admin", { scope: "legado", limit: 50 }),
    );

    if (response.ok) {
      const json = (await response.json()) as CrmLeadSnapshotResponse;
      if (Array.isArray(json.leads)) {
        return json.leads.map((lead) => ({
          id: lead.id,
          name: lead.full_name || lead.name || "Sin nombre",
          email: lead.email || "-",
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

type KPIItem = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  accent?: boolean;
};

function KPIGrid({ items }: { items: KPIItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-7">
      {items.map((item) => (
        <Card key={item.label} className={item.accent ? "border-primary/30 bg-primary/5" : ""}>
          <CardContent className="px-4 pb-4 pt-5 text-center">
            <item.icon className={`mx-auto mb-2 h-6 w-6 ${item.accent ? "text-primary" : "text-muted-foreground"}`} />
            <p className="text-2xl font-bold text-foreground">
              {typeof item.value === "number" ? item.value.toLocaleString("es-ES") : item.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{item.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function MiniBarChart({ data }: { data: { label: string; value: number }[] }) {
  if (!data.length) {
    return <p className="py-6 text-center text-sm text-muted-foreground">Sin datos suficientes</p>;
  }

  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="space-y-4">
      <div className="flex h-[180px] items-end gap-2 rounded-xl bg-muted/30 p-3">
        {data.map((item) => (
          <div key={item.label} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2">
            <span className="text-[10px] text-muted-foreground">{item.value}</span>
            <div
              className="w-full rounded-t bg-primary/85"
              style={{ height: `${Math.max((item.value / maxValue) * 100, item.value > 0 ? 6 : 0)}%` }}
              title={`${item.label}: ${item.value}`}
            />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2 text-center text-[10px] text-muted-foreground md:grid-cols-10">
        {data.map((item) => (
          <div key={item.label} className="truncate">
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function DeviceSplit({ views }: { views: PageView[] }) {
  const counts: Record<DeviceType, number> = { mobile: 0, tablet: 0, desktop: 0 };
  const iconMap: Record<DeviceType, React.ComponentType<{ className?: string }>> = {
    mobile: Smartphone,
    tablet: Tablet,
    desktop: Monitor,
  };

  views.forEach((view) => {
    const device: DeviceType =
      view.device_type === "mobile" || view.device_type === "tablet" || view.device_type === "desktop"
        ? view.device_type
        : "desktop";
    counts[device] += 1;
  });

  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);

  if (!total) {
    return <p className="py-6 text-center text-sm text-muted-foreground">Sin datos suficientes</p>;
  }

  return (
    <div className="space-y-3">
      {(Object.entries(counts) as [DeviceType, number][]).map(([device, count]) => {
        const Icon = iconMap[device];
        const pct = Math.round((count / total) * 100);
        return (
          <div key={device} className="rounded-xl bg-muted/40 p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm capitalize text-foreground">{device}</span>
              </div>
              <span className="text-sm font-semibold text-foreground">
                {count} · {pct}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div className="h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

const AdminDashboardContent = ({ handleLogout }: { handleLogout: () => void }) => {
  const navigate = useNavigate();
  const [leadFilter, setLeadFilter] = useState<"all" | "late" | "mid" | "early">("all");
  const [analyticsPeriod, setAnalyticsPeriod] = useState("30");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const [totalProperties, setTotalProperties] = useState(0);
  const [propertiesAvailable, setPropertiesAvailable] = useState(0);
  const [totalLeads, setTotalLeads] = useState(0);
  const [leadsThisMonth, setLeadsThisMonth] = useState(0);
  const [highIntentLeadsThisMonth, setHighIntentLeadsThisMonth] = useState(0);
  const [totalPushSubs, setTotalPushSubs] = useState(0);
  const [totalNotifSent, setTotalNotifSent] = useState(0);
  const [recentLeads, setRecentLeads] = useState<LeadRow[]>([]);
  const [priorityLeads, setPriorityLeads] = useState<LeadRow[]>([]);
  const [pageViews, setPageViews] = useState<PageView[]>([]);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString();
      const analyticsSince = new Date();
      analyticsSince.setDate(analyticsSince.getDate() - Number.parseInt(analyticsPeriod, 10));

      const [crmMetrics, allLeads, pushSubsRes, notifRes, viewsRes] = await Promise.all([
        fetchCrmPropertyMetrics(),
        fetchLeadSnapshot(),
        supabase.from("push_subscriptions").select("id", { count: "exact", head: true }),
        supabase.from("push_notification_log").select("total_sent").gte("sent_at", startOfYear),
        supabase
          .from("page_views")
          .select("*")
          .gte("created_at", analyticsSince.toISOString())
          .order("created_at", { ascending: false })
          .limit(5000),
      ]);

      if (viewsRes.error) throw viewsRes.error;

      const leadsThisYear = allLeads.filter((lead) => lead.created_at >= startOfYear);
      const leadsInMonth = allLeads.filter((lead) => lead.created_at >= startOfMonth);
      const highIntentInMonth = leadsInMonth.filter((lead) => lead.metadata?.stage === "late");
      const prioritized = [...allLeads].sort((a, b) => {
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
      setTotalNotifSent((notifRes.data || []).reduce((sum, row) => sum + (row.total_sent || 0), 0));
      setRecentLeads(allLeads.slice(0, 10));
      setPriorityLeads(prioritized.slice(0, 6));
      setPageViews((viewsRes.data || []) as PageView[]);
      setLastUpdated(new Date().toISOString());
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "No se pudo cargar el panel");
    } finally {
      setLoading(false);
    }
  }, [analyticsPeriod]);

  useEffect(() => {
    void fetchAllData();
  }, [fetchAllData]);

  const trafficStats = useMemo(() => {
    if (!pageViews.length) return null;

    const totalViewsPeriod = pageViews.length;
    const uniqueSessions = new Set(pageViews.map((view) => view.session_id)).size;
    const propertyViews = pageViews.filter((view) => view.path.startsWith("/propiedad/"));
    const avgDurationEntries = pageViews.filter((view) => (view.duration_seconds || 0) > 0);
    const avgDurationSec = avgDurationEntries.length
      ? Math.round(avgDurationEntries.reduce((sum, view) => sum + (view.duration_seconds || 0), 0) / avgDurationEntries.length)
      : 0;

    const sessions: Record<string, string[]> = {};
    pageViews.forEach((view) => {
      if (!sessions[view.session_id]) sessions[view.session_id] = [];
      sessions[view.session_id].push(view.path);
    });

    const totalSessions = Object.keys(sessions).length;
    const bounceSessions = Object.values(sessions).filter((paths) => new Set(paths).size <= 1).length;
    const bounceRate = totalSessions ? Math.round((bounceSessions / totalSessions) * 100) : 0;

    const leadsInWindow = recentLeads.filter((lead) => {
      const leadDate = new Date(lead.created_at).getTime();
      const sinceDate = new Date();
      sinceDate.setDate(sinceDate.getDate() - Number.parseInt(analyticsPeriod, 10));
      return leadDate >= sinceDate.getTime();
    });

    const conversionRate = uniqueSessions
      ? Math.round((leadsInWindow.length / uniqueSessions) * 1000) / 10
      : 0;

    const topPagesMap: Record<string, number> = {};
    pageViews.forEach((view) => {
      topPagesMap[view.path] = (topPagesMap[view.path] || 0) + 1;
    });

    const topPages = Object.entries(topPagesMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([path, count]) => ({
        path,
        count,
        pct: Math.round((count / totalViewsPeriod) * 100),
      }));

    const topSourcesMap: Record<string, number> = {};
    pageViews.forEach((view) => {
      let source = "Directo";
      if (view.utm_source) source = view.utm_source;
      else if (view.referrer) {
        try {
          source = new URL(view.referrer).hostname;
        } catch {
          source = view.referrer.slice(0, 30);
        }
      }
      topSourcesMap[source] = (topSourcesMap[source] || 0) + 1;
    });

    const topSources = Object.entries(topSourcesMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([source, count]) => ({ source, count }));

    const topPropertiesMap: Record<string, { title: string; count: number }> = {};
    propertyViews.forEach((view) => {
      const key = view.property_id || view.property_title || view.path;
      if (!topPropertiesMap[key]) {
        topPropertiesMap[key] = {
          title: decodeURIComponent(view.property_title || view.path.replace("/propiedad/", "")),
          count: 0,
        };
      }
      topPropertiesMap[key].count += 1;
    });

    const topProperties = Object.entries(topPropertiesMap)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 6)
      .map(([id, value]) => ({ id, ...value }));

    const dailyMap: Record<string, number> = {};
    pageViews.forEach((view) => {
      const day = view.created_at.slice(0, 10);
      dailyMap[day] = (dailyMap[day] || 0) + 1;
    });

    const dailyTrend = Object.entries(dailyMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-10)
      .map(([date, count]) => ({
        label: new Date(date).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" }),
        value: count,
      }));

    const topFlowsMap: Record<string, number> = {};
    Object.values(sessions).forEach((paths) => {
      for (let index = 0; index < paths.length - 1; index += 1) {
        const from = simplifyPath(paths[index]);
        const to = simplifyPath(paths[index + 1]);
        if (from === to) continue;
        const key = `${from} -> ${to}`;
        topFlowsMap[key] = (topFlowsMap[key] || 0) + 1;
      }
    });

    const topFlows = Object.entries(topFlowsMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([flow, count]) => ({ flow, count }));

    return {
      totalViewsPeriod,
      uniqueSessions,
      propertyViewsCount: propertyViews.length,
      avgDurationSec,
      bounceRate,
      conversionRate,
      topPages,
      topSources,
      topProperties,
      dailyTrend,
      topFlows,
    };
  }, [analyticsPeriod, pageViews, recentLeads]);

  const businessKpis: KPIItem[] = [
    { icon: Building2, label: "Propiedades totales", value: totalProperties },
    { icon: Eye, label: "Disponibles", value: propertiesAvailable },
    { icon: Mail, label: `Leads ${new Date().getFullYear()}`, value: totalLeads, accent: true },
    { icon: TrendingUp, label: "Leads este mes", value: leadsThisMonth, accent: true },
    { icon: ShieldAlert, label: "Alta intencion este mes", value: highIntentLeadsThisMonth, accent: true },
    { icon: Users, label: "Suscriptores push", value: totalPushSubs },
    { icon: Bell, label: `Push enviados ${new Date().getFullYear()}`, value: totalNotifSent },
  ];

  const trafficKpis: KPIItem[] = trafficStats
    ? [
        { icon: BarChart3, label: `Visitas ${analyticsPeriod}d`, value: trafficStats.totalViewsPeriod, accent: true },
        { icon: Users, label: "Sesiones unicas", value: trafficStats.uniqueSessions },
        { icon: Eye, label: "Fichas visitadas", value: trafficStats.propertyViewsCount },
        { icon: TrendingUp, label: "Conversion lead", value: `${trafficStats.conversionRate}%` },
        { icon: Clock3, label: "Duracion media", value: `${trafficStats.avgDurationSec}s` },
        { icon: ArrowRight, label: "Rebote", value: `${trafficStats.bounceRate}%` },
      ]
    : [];

  const filteredRecentLeads = recentLeads.filter((lead) =>
    leadFilter === "all" ? true : lead.metadata?.stage === leadFilter,
  );

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <AdminBreadcrumb />

        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Panel de Administracion</h1>
              <p className="text-sm text-muted-foreground">Negocio, trafico y leads en una sola vista</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <NativeSelect
              value={analyticsPeriod}
              onChange={(event) => setAnalyticsPeriod(event.target.value)}
              className="w-[140px]"
              aria-label="Periodo de analytics"
            >
              {ANALYTICS_PERIOD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </NativeSelect>
            <Button variant="outline" size="sm" onClick={() => navigate("/admin/push")}>
              <Bell className="mr-2 h-4 w-4" /> Push
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/admin/seo")}>
              SEO
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/admin/blog")}>
              Blog
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/admin/newsletter")}>
              <Mail className="mr-2 h-4 w-4" /> Newsletter
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate("/admin/analytics")}>
              <BarChart3 className="mr-2 h-4 w-4" /> Vista detallada
            </Button>
            <Button variant="ghost" size="sm" onClick={() => void fetchAllData()}>
              <RefreshCw className="mr-2 h-4 w-4" /> Actualizar
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Salir
            </Button>
          </div>
        </div>

        {lastUpdated ? (
          <p className="text-xs text-muted-foreground">
            Actualizado: {new Date(lastUpdated).toLocaleString("es-ES")}
          </p>
        ) : null}

        {loading ? (
          <p className="py-16 text-center text-muted-foreground">Cargando panel...</p>
        ) : errorMessage ? (
          <Card className="border-destructive/30">
            <CardContent className="py-8 text-center">
              <p className="font-medium text-destructive">No se pudo cargar el panel</p>
              <p className="mt-2 text-sm text-muted-foreground">{errorMessage}</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <section className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Resumen de negocio</h2>
                <p className="text-sm text-muted-foreground">Inventario, captacion y prioridad comercial</p>
              </div>
              <KPIGrid items={businessKpis} />
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Resumen digital</h2>
                  <p className="text-sm text-muted-foreground">Trafico real capturado por la app, sin entrar en Vercel</p>
                </div>
              </div>

              {!trafficStats ? (
                <Card>
                  <CardContent className="py-10 text-center text-muted-foreground">
                    Aun no hay datos de navegacion suficientes.
                  </CardContent>
                </Card>
              ) : (
                <>
                  <KPIGrid items={trafficKpis} />

                  <div className="grid gap-6 xl:grid-cols-3">
                    <Card className="xl:col-span-2">
                      <CardHeader>
                        <CardTitle className="text-lg">Tendencia de visitas</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <MiniBarChart data={trafficStats.dailyTrend} />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Dispositivos</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <DeviceSplit views={pageViews} />
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid gap-6 xl:grid-cols-3">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Globe className="h-5 w-5" /> Fuentes de trafico
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Fuente</TableHead>
                              <TableHead className="text-right">Visitas</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {trafficStats.topSources.map((item) => (
                              <TableRow key={item.source}>
                                <TableCell className="text-sm">{item.source}</TableCell>
                                <TableCell className="text-right font-medium">{item.count}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Paginas top</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Pagina</TableHead>
                              <TableHead className="text-right">Visitas</TableHead>
                              <TableHead className="text-right">%</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {trafficStats.topPages.map((item) => (
                              <TableRow key={item.path}>
                                <TableCell className="max-w-[220px] truncate font-mono text-xs">{item.path}</TableCell>
                                <TableCell className="text-right font-medium">{item.count}</TableCell>
                                <TableCell className="text-right text-muted-foreground">{item.pct}%</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Propiedades con mas interes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {trafficStats.topProperties.length === 0 ? (
                          <p className="py-6 text-center text-sm text-muted-foreground">Sin visitas a propiedades todavia</p>
                        ) : (
                          <div className="space-y-3">
                            {trafficStats.topProperties.map((item) => (
                              <div key={item.id} className="rounded-xl bg-muted/40 p-3">
                                <div className="flex items-start justify-between gap-3">
                                  <p className="line-clamp-2 text-sm font-medium text-foreground">{item.title}</p>
                                  <span className="text-sm font-semibold text-primary">{item.count}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Flujos de navegacion mas repetidos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {trafficStats.topFlows.length === 0 ? (
                        <p className="py-6 text-center text-sm text-muted-foreground">Sin suficientes datos de flujo</p>
                      ) : (
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                          {trafficStats.topFlows.map((item) => (
                            <div key={item.flow} className="rounded-xl bg-muted/40 p-3">
                              <p className="text-sm font-mono text-foreground">{item.flow}</p>
                              <p className="mt-2 text-sm font-semibold text-primary">{item.count} repeticiones</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </section>

            <section className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="h-5 w-5" /> Leads a priorizar hoy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {priorityLeads.length === 0 ? (
                    <p className="py-6 text-center text-muted-foreground">No hay senales de prioridad todavia</p>
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
                            <p><span className="text-foreground">Score:</span> {lead.metadata?.score != null ? `${lead.metadata.score}/100` : "-"}</p>
                            <p><span className="text-foreground">Propiedad:</span> {lead.property_title || "General"}</p>
                            <p><span className="text-foreground">Zona top:</span> {lead.metadata?.topAreaSlug || "-"}</p>
                            <p><span className="text-foreground">Tema top:</span> {lead.metadata?.topTopic || "-"}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Mail className="h-5 w-5" /> Ultimos leads recibidos
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
                    <p className="py-6 text-center text-muted-foreground">No hay leads aun</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Telefono</TableHead>
                          <TableHead>Propiedad</TableHead>
                          <TableHead>Intento</TableHead>
                          <TableHead>CRM</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRecentLeads.map((lead) => (
                          <TableRow key={lead.id}>
                            <TableCell className="whitespace-nowrap text-sm">
                              {new Date(lead.created_at).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit" })}
                            </TableCell>
                            <TableCell className="text-sm font-medium">{lead.name}</TableCell>
                            <TableCell className="text-sm">{lead.email}</TableCell>
                            <TableCell className="text-sm">{lead.phone || "-"}</TableCell>
                            <TableCell className="max-w-[150px] truncate text-sm">{lead.property_title || "General"}</TableCell>
                            <TableCell className="text-sm">
                              {lead.metadata?.stage ? (
                                <div className="flex flex-col gap-1">
                                  <span className={`inline-flex w-fit rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.18em] ${intentBadgeClass(lead.metadata.stage)}`}>
                                    {formatIntentStage(lead.metadata.stage)}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {lead.metadata.score != null ? `${lead.metadata.score}/100` : "-"}
                                    {lead.metadata.topAreaSlug ? ` · ${lead.metadata.topAreaSlug}` : ""}
                                    {lead.metadata.topTopic ? ` · ${lead.metadata.topTopic}` : ""}
                                  </span>
                                </div>
                              ) : "-"}
                            </TableCell>
                            <TableCell>
                              <span className={`rounded-full px-2 py-0.5 text-xs ${lead.synced_to_crm ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                                {lead.synced_to_crm ? "Si" : "No"}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

const AdminDashboard = () => (
  <AdminAuthGate>
    {(auth) => <AdminDashboardContent handleLogout={auth.handleLogout} />}
  </AdminAuthGate>
);

export default AdminDashboard;
