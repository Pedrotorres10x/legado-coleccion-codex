import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Send, Bell, History, RefreshCw, LogOut } from "lucide-react";
import AdminAuthGate from "@/components/AdminAuthGate";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";

interface NotificationLog {
  id: string;
  notification_type: string;
  title: string;
  body: string;
  url: string | null;
  total_sent: number;
  metadata: Record<string, unknown> | null;
  sent_at: string;
}

const NOTIFICATION_TYPES = [
  { value: "manual", label: "Personalizado" },
  { value: "new_property", label: "Nueva propiedad" },
  { value: "price_drop", label: "Bajada de precio" },
  { value: "weekly", label: "Destacados semanales" },
  { value: "promo", label: "Promoción" },
];

const AdminPushContent = ({ handleLogout }: { handleLogout: () => void }) => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState("manual");
  const [sending, setSending] = useState(false);
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  const fetchLogs = async () => {
    setLoadingLogs(true);
    const { data, error } = await supabase
      .from("push_notification_log")
      .select("*")
      .order("sent_at", { ascending: false })
      .limit(50);
    if (!error && data) setLogs(data as unknown as NotificationLog[]);
    setLoadingLogs(false);
  };

  useEffect(() => { fetchLogs(); }, []);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      toast({ title: "Error", description: "Título y mensaje son obligatorios", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const res = await supabase.functions.invoke("send-push", {
        body: { title, body, url: url || "/", icon: "/favicon.ico" },
      });
      if (res.error) throw res.error;
      const result = res.data;
      await supabase.from("push_notification_log").insert([{
        notification_type: type, title, body, url: url || "/",
        total_sent: result?.sent || 0,
        metadata: JSON.parse(JSON.stringify({ type })),
      }]);
      toast({ title: "Notificación enviada", description: `Enviada a ${result?.sent || 0} de ${result?.total || 0} suscriptores` });
      setTitle(""); setBody(""); setUrl("");
      fetchLogs();
    } catch (error) {
      console.error("Send error:", error);
      toast({ title: "Error", description: "No se pudo enviar la notificación", variant: "destructive" });
    } finally { setSending(false); }
  };

  const handleTriggerWeekly = async () => {
    setSending(true);
    try {
      const res = await supabase.functions.invoke("push-weekly-highlights");
      if (res.error) throw res.error;
      toast({ title: "Resumen semanal enviado", description: `Enviado a ${res.data?.sent || 0} suscriptores` });
      fetchLogs();
    } catch (error) {
      toast({ title: "Error", description: "No se pudo enviar el resumen semanal", variant: "destructive" });
    } finally { setSending(false); }
  };

  const typeLabel = (t: string) => NOTIFICATION_TYPES.find((nt) => nt.value === t)?.label || t;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <AdminBreadcrumb />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Panel de Notificaciones Push</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" /> Salir
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Send className="h-5 w-5" /> Enviar notificación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Tipo</label>
                <NativeSelect value={type} onChange={(e) => setType(e.target.value)} aria-label="Tipo de notificación">
                  {NOTIFICATION_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </NativeSelect>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">URL destino</label>
                <Input placeholder="/propiedades" value={url} onChange={(e) => setUrl(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Título</label>
              <Input placeholder="🏠 Nueva propiedad disponible" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Mensaje</label>
              <Textarea placeholder="Descubre nuestra nueva villa en Marbella..." value={body} onChange={(e) => setBody(e.target.value)} rows={3} />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleSend} disabled={sending}>
                <Send className="h-4 w-4 mr-2" />
                {sending ? "Enviando..." : "Enviar a todos"}
              </Button>
              <Button variant="outline" onClick={handleTriggerWeekly} disabled={sending}>
                🌟 Enviar resumen semanal
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2"><History className="h-5 w-5" /> Historial de notificaciones</span>
              <Button variant="ghost" size="sm" onClick={fetchLogs}><RefreshCw className="h-4 w-4" /></Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingLogs ? (
              <p className="text-muted-foreground text-center py-8">Cargando...</p>
            ) : logs.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No hay notificaciones enviadas aún</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Enviados</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">
                        {new Date(log.sent_at).toLocaleString("es-ES", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" })}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                          {typeLabel(log.notification_type)}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm">{log.title}</TableCell>
                      <TableCell className="text-sm font-medium">{log.total_sent}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const AdminPush = () => (
  <AdminAuthGate>
    {(auth) => <AdminPushContent handleLogout={auth.handleLogout} />}
  </AdminAuthGate>
);

export default AdminPush;
