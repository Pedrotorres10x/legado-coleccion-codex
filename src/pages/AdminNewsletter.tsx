import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import {
  Mail, Users, Send, ArrowLeft, Trash2, LogOut,
  RefreshCw, Search, MailCheck, BarChart3,
  Upload, Eye, MousePointerClick, AlertTriangle, CheckCircle2, Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminAuthGate from "@/components/AdminAuthGate";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";
import { SITE_URL } from "@/lib/site";
import { sanitizeHtml } from "@/lib/sanitizeHtml";

interface Subscriber {
  id: string;
  email: string;
  name: string | null;
  language: string | null;
  source: string | null;
  is_active: boolean;
  subscribed_at: string;
}

interface Campaign {
  id: number;
  name: string;
  subject: string;
  status: string;
  sentDate?: string;
  statistics?: {
    globalStats?: {
      delivered?: number;
      opens?: number;
      uniqueOpens?: number;
      clicks?: number;
      uniqueClicks?: number;
      unsubscriptions?: number;
    };
  };
}

type BrevoAccount = {
  companyName?: string;
  email?: string;
  plan?: Array<{
    type?: string;
    credits?: number;
  }>;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Error desconocido";
}

const NEWSLETTER_TEMPLATES = [
  {
    id: "new_article",
    name: "📰 Nuevo artículo del blog",
    subject: "Nuevo artículo: {{title}}",
    template: (title: string, excerpt: string, url: string, coverImage: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f9f7f4;margin:0;padding:0;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h2 style="color:#b8860b;font-size:13px;letter-spacing:3px;text-transform:uppercase;margin:0;">Legado Inmobiliaria</h2>
      <p style="color:#999;font-size:11px;margin:4px 0 0;">Costa Blanca · Inmobiliaria de lujo</p>
    </div>
    ${coverImage ? `<img src="${coverImage}" alt="${title}" style="width:100%;max-width:600px;border-radius:12px;margin-bottom:24px;" />` : ""}
    <h1 style="color:#1a1a1a;font-size:24px;line-height:1.3;margin-bottom:16px;font-family:Georgia,serif;">${title}</h1>
    <p style="color:#555;font-size:16px;line-height:1.6;margin-bottom:24px;">${excerpt}</p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${url}" style="background:#b8860b;color:#fff;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;display:inline-block;">Leer artículo completo</a>
    </div>
    <hr style="border:none;border-top:1px solid #e0d5c5;margin:32px 0;" />
    <p style="color:#999;font-size:11px;text-align:center;">
      Recibes este email porque te suscribiste al newsletter de Legado Inmobiliaria.<br/>
      <a href="${SITE_URL}" style="color:#b8860b;">Visitar web</a>
    </p>
  </div>
</body>
</html>`,
  },
  {
    id: "properties",
    name: "🏠 Propiedades destacadas",
    subject: "Propiedades exclusivas en la Costa Blanca",
    template: () => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:'Helvetica Neue',Arial,sans-serif;background:#f9f7f4;margin:0;padding:0;">
  <div style="max-width:600px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:32px;">
      <h2 style="color:#b8860b;font-size:13px;letter-spacing:3px;text-transform:uppercase;margin:0;">Legado Inmobiliaria</h2>
      <p style="color:#999;font-size:11px;margin:4px 0 0;">Selección semanal de propiedades</p>
    </div>
    <h1 style="color:#1a1a1a;font-size:24px;line-height:1.3;margin-bottom:8px;font-family:Georgia,serif;text-align:center;">Propiedades exclusivas esta semana</h1>
    <p style="color:#555;font-size:15px;line-height:1.6;margin-bottom:24px;text-align:center;">Descubre las últimas incorporaciones a nuestro catálogo de obra nueva en la Costa Blanca.</p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${SITE_URL}/propiedades" style="background:#b8860b;color:#fff;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:600;font-size:15px;display:inline-block;">Ver propiedades</a>
    </div>
    <hr style="border:none;border-top:1px solid #e0d5c5;margin:32px 0;" />
    <p style="color:#999;font-size:11px;text-align:center;">
      <a href="${SITE_URL}" style="color:#b8860b;">Legado Inmobiliaria</a> · Costa Blanca, España
    </p>
  </div>
</body>
</html>`,
  },
  {
    id: "custom",
    name: "✏️ Personalizado",
    subject: "",
    template: () => "",
  },
];

const AdminNewsletterContent = ({ handleLogout }: { handleLogout: () => void }) => {
  const navigate = useNavigate();

  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [subsLoading, setSubsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedTemplate, setSelectedTemplate] = useState("new_article");
  const [subject, setSubject] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [sending, setSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const [syncing, setSyncing] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignsLoading, setCampaignsLoading] = useState(false);
  const [brevoAccount, setBrevoAccount] = useState<BrevoAccount | null>(null);
  const [activeTab, setActiveTab] = useState<"subscribers" | "compose" | "campaigns">("subscribers");

  const [totalActive, setTotalActive] = useState(0);
  const [totalInactive, setTotalInactive] = useState(0);

  useEffect(() => {
    fetchSubscribers();
    fetchCampaigns();
  }, []);

  const fetchSubscribers = async () => {
    setSubsLoading(true);
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("subscribed_at", { ascending: false });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSubscribers(data || []);
      setTotalActive((data || []).filter(s => s.is_active).length);
      setTotalInactive((data || []).filter(s => !s.is_active).length);
    }
    setSubsLoading(false);
  };

  const fetchCampaigns = async () => {
    setCampaignsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("brevo-manager", { body: { action: "get_stats" } });
      if (error) throw error;
      setCampaigns(data?.campaigns || []);
      setBrevoAccount(data?.account || null);
    } catch (error: unknown) {
      console.error("Failed to fetch campaigns:", error);
    }
    setCampaignsLoading(false);
  };

  const handleSyncContacts = async () => {
    setSyncing(true);
    try {
      const { data, error } = await supabase.functions.invoke("brevo-manager", { body: { action: "sync_contacts" } });
      if (error) throw error;
      toast({ title: "Contactos sincronizados", description: `${data?.synced || 0} activos sincronizados, ${data?.blacklisted || 0} inactivos bloqueados` });
    } catch (error: unknown) {
      toast({ title: "Error de sincronización", description: getErrorMessage(error), variant: "destructive" });
    }
    setSyncing(false);
  };

  const handleDeleteSubscriber = async (id: string) => {
    const { error } = await supabase.from("newsletter_subscribers").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Suscriptor eliminado" }); fetchSubscribers(); }
  };

  const handleSendCampaign = async () => {
    if (!subject.trim() || !htmlContent.trim()) {
      toast({ title: "Faltan campos", description: "Asunto y contenido son obligatorios", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("brevo-manager", {
        body: { action: "send_campaign", subject, html_content: htmlContent, preview_text: previewText },
      });
      if (error) throw error;
      if (data?.success) {
        toast({ title: "🚀 Campaña enviada", description: `Campaña #${data.campaignId} enviada a ${data.recipients} suscriptores vía Brevo` });
        setSubject(""); setHtmlContent(""); setPreviewText("");
        fetchCampaigns();
      } else throw new Error(JSON.stringify(data?.error || "Error desconocido"));
    } catch (error: unknown) {
      toast({ title: "Error al enviar campaña", description: getErrorMessage(error), variant: "destructive" });
    }
    setSending(false);
  };

  const applyTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    const tpl = NEWSLETTER_TEMPLATES.find(t => t.id === templateId);
    if (tpl && tpl.id !== "custom") {
      setSubject(tpl.subject);
      if (tpl.id === "new_article") {
        setHtmlContent(tpl.template("Título del artículo", "Extracto del artículo aquí...", `${SITE_URL}/blog/slug`, ""));
      } else {
        setHtmlContent((tpl.template as () => string)());
      }
    }
  };

  const filteredSubscribers = subscribers.filter(s =>
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );
  const sanitizedPreviewHtml = useMemo(() => sanitizeHtml(htmlContent), [htmlContent]);

  const getCampaignStatusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      sent: { label: "Enviada", variant: "default" },
      draft: { label: "Borrador", variant: "secondary" },
      queued: { label: "En cola", variant: "outline" },
      suspended: { label: "Suspendida", variant: "destructive" },
    };
    const info = map[status] || { label: status, variant: "outline" as const };
    return <Badge variant={info.variant}>{info.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <AdminBreadcrumb />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Mail className="h-6 w-6 text-primary" /> Newsletter & Brevo
              </h1>
              <p className="text-muted-foreground text-sm">Gestión completa de email marketing</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSyncContacts} disabled={syncing}>
              {syncing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
              Sincronizar Brevo
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" /> Salir
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="pt-5 pb-4 text-center"><Users className="h-6 w-6 mx-auto mb-2 text-primary" /><p className="text-2xl font-bold text-foreground">{totalActive}</p><p className="text-xs text-muted-foreground">Activos</p></CardContent></Card>
          <Card><CardContent className="pt-5 pb-4 text-center"><Mail className="h-6 w-6 mx-auto mb-2 text-muted-foreground" /><p className="text-2xl font-bold text-foreground">{totalInactive}</p><p className="text-xs text-muted-foreground">Inactivos</p></CardContent></Card>
          <Card><CardContent className="pt-5 pb-4 text-center"><MailCheck className="h-6 w-6 mx-auto mb-2 text-muted-foreground" /><p className="text-2xl font-bold text-foreground">{subscribers.length}</p><p className="text-xs text-muted-foreground">Total registrados</p></CardContent></Card>
          <Card><CardContent className="pt-5 pb-4 text-center"><BarChart3 className="h-6 w-6 mx-auto mb-2 text-primary" /><p className="text-2xl font-bold text-foreground">{campaigns.length}</p><p className="text-xs text-muted-foreground">Campañas Brevo</p></CardContent></Card>
        </div>

        {brevoAccount && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-4 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Brevo conectado — {brevoAccount.companyName || brevoAccount.email}</p>
                  <p className="text-xs text-muted-foreground">Plan: {brevoAccount.plan?.[0]?.type || "Free"} · Créditos: {brevoAccount.plan?.[0]?.credits ?? "∞"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
            <button
              type="button"
              onClick={() => setActiveTab("subscribers")}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${
                activeTab === "subscribers" ? "bg-background text-foreground shadow-sm" : ""
              }`}
            >
              <Users className="h-4 w-4 mr-2" /> Suscriptores
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("compose")}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${
                activeTab === "compose" ? "bg-background text-foreground shadow-sm" : ""
              }`}
            >
              <Send className="h-4 w-4 mr-2" /> Enviar campaña
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("campaigns")}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${
                activeTab === "campaigns" ? "bg-background text-foreground shadow-sm" : ""
              }`}
            >
              <BarChart3 className="h-4 w-4 mr-2" /> Campañas
            </button>
          </div>

          {activeTab === "subscribers" ? (
            <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar por email o nombre..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
              <Button variant="outline" size="icon" onClick={fetchSubscribers}><RefreshCw className="h-4 w-4" /></Button>
            </div>
            <Card>
              <CardContent className="p-0">
                {subsLoading ? (
                  <p className="text-muted-foreground text-center py-8">Cargando...</p>
                ) : filteredSubscribers.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No hay suscriptores</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead><TableHead>Nombre</TableHead><TableHead>Idioma</TableHead>
                        <TableHead>Fuente</TableHead><TableHead>Estado</TableHead><TableHead>Fecha</TableHead><TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSubscribers.map((sub) => (
                        <TableRow key={sub.id}>
                          <TableCell className="text-sm font-medium">{sub.email}</TableCell>
                          <TableCell className="text-sm">{sub.name || "—"}</TableCell>
                          <TableCell className="text-sm">{sub.language || "es"}</TableCell>
                          <TableCell className="text-sm">{sub.source || "—"}</TableCell>
                          <TableCell><Badge variant={sub.is_active ? "default" : "secondary"}>{sub.is_active ? "Activo" : "Inactivo"}</Badge></TableCell>
                          <TableCell className="text-sm whitespace-nowrap">{new Date(sub.subscribed_at).toLocaleDateString("es-ES")}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteSubscriber(sub.id)} className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
            </div>
          ) : null}

          {activeTab === "compose" ? (
            <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {NEWSLETTER_TEMPLATES.map((tpl) => (
                <Card key={tpl.id} className={`cursor-pointer transition-all hover:border-primary/50 ${selectedTemplate === tpl.id ? "border-primary ring-1 ring-primary/30" : ""}`} onClick={() => applyTemplate(tpl.id)}>
                  <CardContent className="pt-4 pb-3">
                    <p className="font-medium text-sm text-foreground">{tpl.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {tpl.id === "new_article" && "Enviar nuevo artículo del blog"}
                      {tpl.id === "properties" && "Destacar propiedades de la semana"}
                      {tpl.id === "custom" && "Escribe tu propio contenido HTML"}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Send className="h-5 w-5" /> Componer campaña</CardTitle>
                <CardDescription>Se creará y enviará como campaña en Brevo con tracking de aperturas y clics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Asunto</label>
                  <Input placeholder="Ej: 🏠 Nuevas propiedades de lujo en la Costa Blanca" value={subject} onChange={(e) => setSubject(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Texto de previsualización</label>
                  <Input placeholder="Texto que aparece junto al asunto en la bandeja de entrada" value={previewText} onChange={(e) => setPreviewText(e.target.value)} />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-foreground">Contenido HTML</label>
                    <Button variant="ghost" size="sm" onClick={() => setShowPreview(!showPreview)}>
                      <Eye className="h-4 w-4 mr-1" /> {showPreview ? "Editor" : "Preview"}
                    </Button>
                  </div>
                  {showPreview ? (
                    <div className="border rounded-lg p-4 min-h-[300px] bg-white" dangerouslySetInnerHTML={{ __html: sanitizedPreviewHtml }} />
                  ) : (
                    <Textarea placeholder="<h1>Título</h1><p>Contenido del newsletter...</p>" value={htmlContent} onChange={(e) => setHtmlContent(e.target.value)} rows={14} className="font-mono text-sm" />
                  )}
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <div>
                    <p className="text-sm text-muted-foreground">Se enviará como campaña Brevo a <strong>{totalActive}</strong> suscriptores activos</p>
                    <p className="text-xs text-muted-foreground mt-1">Tracking de aperturas, clics y bajas incluido automáticamente</p>
                  </div>
                  <Button onClick={handleSendCampaign} disabled={sending} className="bg-primary">
                    {sending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                    {sending ? "Enviando..." : "Enviar campaña"}
                  </Button>
                </div>
              </CardContent>
            </Card>
            </div>
          ) : null}

          {activeTab === "campaigns" ? (
            <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-foreground">Historial de campañas</h3>
              <Button variant="outline" size="sm" onClick={fetchCampaigns} disabled={campaignsLoading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${campaignsLoading ? "animate-spin" : ""}`} /> Actualizar
              </Button>
            </div>
            {campaignsLoading ? (
              <p className="text-muted-foreground text-center py-8">Cargando campañas de Brevo...</p>
            ) : campaigns.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No hay campañas en Brevo aún</p>
                  <p className="text-xs text-muted-foreground mt-1">Envía tu primera campaña desde la pestaña "Enviar campaña"</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {campaigns.map((campaign) => {
                  const stats = campaign.statistics?.globalStats;
                  return (
                    <Card key={campaign.id}>
                      <CardContent className="pt-4 pb-3">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-medium text-foreground text-sm">{campaign.name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Asunto: {campaign.subject}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {campaign.sentDate && (
                              <span className="text-xs text-muted-foreground">
                                {new Date(campaign.sentDate).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}
                              </span>
                            )}
                            {getCampaignStatusBadge(campaign.status)}
                          </div>
                        </div>
                        {stats && (
                          <div className="grid grid-cols-4 gap-4 pt-2 border-t">
                            <div className="text-center">
                              <p className="text-lg font-bold text-foreground">{stats.delivered || 0}</p>
                              <p className="text-xs text-muted-foreground">Entregados</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-bold text-primary">{stats.uniqueOpens || 0}</p>
                              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><Eye className="h-3 w-3" /> Aperturas</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-bold text-foreground">{stats.uniqueClicks || 0}</p>
                              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><MousePointerClick className="h-3 w-3" /> Clics</p>
                            </div>
                            <div className="text-center">
                              <p className="text-lg font-bold text-destructive">{stats.unsubscriptions || 0}</p>
                              <p className="text-xs text-muted-foreground flex items-center justify-center gap-1"><AlertTriangle className="h-3 w-3" /> Bajas</p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const AdminNewsletter = () => (
  <AdminAuthGate>
    {(auth) => <AdminNewsletterContent handleLogout={auth.handleLogout} />}
  </AdminAuthGate>
);

export default AdminNewsletter;
