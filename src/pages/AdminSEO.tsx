import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import {
  Search, CheckCircle2, AlertTriangle, XCircle, ExternalLink,
  LogOut, Globe, RefreshCw
} from "lucide-react";
import AdminAuthGate from "@/components/AdminAuthGate";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";

interface PropertySEO {
  id: string;
  title: string;
  description: string | null;
  location: string;
  images: string[] | null;
  price: number;
  property_type: string;
}

type SEOIssue = { type: "error" | "warning" | "ok"; message: string };

function auditProperty(p: PropertySEO): SEOIssue[] {
  const issues: SEOIssue[] = [];
  if (!p.title || p.title.length < 10) issues.push({ type: "error", message: "Título demasiado corto (<10 chars)" });
  else if (p.title.length > 70) issues.push({ type: "warning", message: `Título largo (${p.title.length} chars, ideal <70)` });
  else issues.push({ type: "ok", message: `Título OK (${p.title.length} chars)` });

  if (!p.description || p.description.length < 50) issues.push({ type: "error", message: "Descripción ausente o muy corta (<50 chars)" });
  else if (p.description.length < 120) issues.push({ type: "warning", message: `Descripción corta (${p.description.length} chars, ideal >120)` });
  else issues.push({ type: "ok", message: `Descripción OK (${p.description.length} chars)` });

  if (!p.images || p.images.length === 0) issues.push({ type: "error", message: "Sin imágenes (crítico para OG y Schema)" });
  else if (p.images.length < 3) issues.push({ type: "warning", message: `Solo ${p.images.length} imagen(es), ideal ≥3` });
  else issues.push({ type: "ok", message: `${p.images.length} imágenes` });

  if (!p.location) issues.push({ type: "error", message: "Sin ubicación (afecta SEO local)" });
  else issues.push({ type: "ok", message: "Ubicación OK" });

  return issues;
}

const AdminSEOContent = ({ handleLogout }: { handleLogout: () => void }) => {
  const [properties, setProperties] = useState<PropertySEO[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "errors" | "warnings">("all");

  const fetchProperties = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("properties")
      .select("id, title, description, location, images, price, property_type")
      .order("created_at", { ascending: false })
      .limit(200);
    if (!error && data) setProperties(data as unknown as PropertySEO[]);
    setLoading(false);
  };

  useEffect(() => { fetchProperties(); }, []);

  const audited = properties.map((p) => ({ property: p, issues: auditProperty(p) }));
  const totalErrors = audited.reduce((s, a) => s + a.issues.filter((i) => i.type === "error").length, 0);
  const totalWarnings = audited.reduce((s, a) => s + a.issues.filter((i) => i.type === "warning").length, 0);
  const totalOk = audited.filter((a) => a.issues.every((i) => i.type === "ok")).length;

  const filtered = filter === "all"
    ? audited
    : filter === "errors"
      ? audited.filter((a) => a.issues.some((i) => i.type === "error"))
      : audited.filter((a) => a.issues.some((i) => i.type === "warning"));

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <AdminBreadcrumb />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Auditoría SEO</h1>
              <p className="text-muted-foreground text-sm">Análisis on-page de propiedades</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={fetchProperties}><RefreshCw className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut className="h-4 w-4 mr-2" /> Salir</Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card className="cursor-pointer border-destructive/30" onClick={() => setFilter("errors")}>
            <CardContent className="pt-5 pb-4 text-center">
              <XCircle className="h-6 w-6 mx-auto mb-2 text-destructive" />
              <p className="text-2xl font-bold text-foreground">{totalErrors}</p>
              <p className="text-xs text-muted-foreground">Errores críticos</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer border-yellow-500/30" onClick={() => setFilter("warnings")}>
            <CardContent className="pt-5 pb-4 text-center">
              <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
              <p className="text-2xl font-bold text-foreground">{totalWarnings}</p>
              <p className="text-xs text-muted-foreground">Advertencias</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer border-green-500/30" onClick={() => setFilter("all")}>
            <CardContent className="pt-5 pb-4 text-center">
              <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold text-foreground">{totalOk}/{properties.length}</p>
              <p className="text-xs text-muted-foreground">Sin problemas</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-lg">Checklist SEO técnico</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {[
              "Sitemap.xml dinámico con hreflang",
              "JSON-LD Organization + WebSite + FAQPage en homepage",
              "JSON-LD RealEstateListing por propiedad",
              "BreadcrumbList schema en todas las páginas",
              "Open Graph + Twitter Card meta tags",
              "Hreflang tags (ES/EN/FR/DE)",
              "Canonical URLs",
              "robots.txt + admin bloqueado",
              "Google Search Console verificado",
              "Favicon + Apple Touch Icon",
            ].map((label) => (
              <div key={label} className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                <span className="text-foreground">{label}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2"><Search className="h-5 w-5" /> Auditoría por propiedad ({filtered.length})</span>
              <div className="flex gap-1">
                {(["all", "errors", "warnings"] as const).map((f) => (
                  <Button key={f} variant={filter === f ? "default" : "ghost"} size="sm" onClick={() => setFilter(f)}>
                    {f === "all" ? "Todas" : f === "errors" ? "Errores" : "Warnings"}
                  </Button>
                ))}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-center py-8">Cargando propiedades...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Propiedad</TableHead>
                    <TableHead>Estado SEO</TableHead>
                    <TableHead>Problemas</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.slice(0, 50).map(({ property: p, issues }) => {
                    const hasError = issues.some((i) => i.type === "error");
                    const hasWarning = issues.some((i) => i.type === "warning");
                    return (
                      <TableRow key={p.id}>
                        <TableCell>
                          <p className="font-medium text-sm truncate max-w-[200px]">{p.title}</p>
                          <p className="text-xs text-muted-foreground">{p.location}</p>
                        </TableCell>
                        <TableCell>
                          {hasError ? (
                            <span className="flex items-center gap-1 text-destructive text-xs"><XCircle className="h-3 w-3" /> Errores</span>
                          ) : hasWarning ? (
                            <span className="flex items-center gap-1 text-yellow-500 text-xs"><AlertTriangle className="h-3 w-3" /> Warnings</span>
                          ) : (
                            <span className="flex items-center gap-1 text-green-500 text-xs"><CheckCircle2 className="h-3 w-3" /> OK</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            {issues.filter((i) => i.type !== "ok").map((i, idx) => (
                              <p key={idx} className={`text-xs ${i.type === "error" ? "text-destructive" : "text-yellow-500"}`}>
                                {i.message}
                              </p>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <a href={`/propiedad/${p.id}`} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary" />
                          </a>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const AdminSEO = () => (
  <AdminAuthGate>
    {(auth) => <AdminSEOContent handleLogout={auth.handleLogout} />}
  </AdminAuthGate>
);

export default AdminSEO;
