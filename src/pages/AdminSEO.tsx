import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import {
  Search, CheckCircle2, AlertTriangle, XCircle, ExternalLink,
  LogOut, Globe, RefreshCw, BarChart3, FileWarning, ShieldCheck, Download, Copy
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

type RouteSeoScore = {
  path: string;
  score: number;
  titleLength: number;
  descriptionLength: number;
  priority: number;
  checks: {
    canonical: boolean;
    og: boolean;
    schema: boolean;
    noscript: boolean;
  };
};

type RouteFilter = "all" | "money" | "needs-work";

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

function getRoutePriorityLabel(priority: number) {
  if (priority >= 0.9) return "Money";
  if (priority >= 0.75) return "Core";
  return "Support";
}

function getRouteStatus(route: RouteSeoScore) {
  if (route.score >= 95) return { label: "Elite", tone: "text-emerald-500" };
  if (route.score >= 90) return { label: "Strong", tone: "text-green-500" };
  if (route.score >= 80) return { label: "Needs polish", tone: "text-yellow-500" };
  return { label: "Weak", tone: "text-destructive" };
}

function getRouteRecommendations(route: RouteSeoScore) {
  const notes: string[] = [];

  if (route.titleLength > 70) notes.push(`recortar title (${route.titleLength})`);
  else if (route.titleLength < 45) notes.push(`ampliar title (${route.titleLength})`);

  if (route.descriptionLength > 165) notes.push(`recortar description (${route.descriptionLength})`);
  else if (route.descriptionLength < 120) notes.push(`ampliar description (${route.descriptionLength})`);

  if (!route.checks.canonical) notes.push("revisar canonical");
  if (!route.checks.og) notes.push("revisar Open Graph");
  if (!route.checks.schema) notes.push("revisar JSON-LD");
  if (!route.checks.noscript) notes.push("revisar fallback noscript");

  return notes.length ? notes.join(" · ") : "sin cambios urgentes";
}

function getRouteActionPriority(route: RouteSeoScore) {
  const businessWeight = route.priority >= 0.9 ? 40 : route.priority >= 0.75 ? 24 : 12;
  const scoreGap = Math.max(0, 100 - route.score);
  const titlePenalty = route.titleLength > 70 || route.titleLength < 45 ? 8 : 0;
  const descriptionPenalty = route.descriptionLength > 165 || route.descriptionLength < 120 ? 8 : 0;
  const structuralPenalty =
    (route.checks.canonical ? 0 : 12) +
    (route.checks.og ? 0 : 10) +
    (route.checks.schema ? 0 : 12) +
    (route.checks.noscript ? 0 : 6);

  return businessWeight + scoreGap + titlePenalty + descriptionPenalty + structuralPenalty;
}

function routePathToLabel(path: string) {
  if (path === "/") return "Legado Inmobiliaria";
  return path
    .replace(/^\/+/, "")
    .replace(/\/+/g, " ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function trimToLength(text: string, max: number) {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}…`;
}

function buildSuggestedTitle(route: RouteSeoScore) {
  const label = routePathToLabel(route.path);

  if (route.path === "/") {
    return "Legado Inmobiliaria | Residencias singulares en Benidorm y Costa Blanca";
  }

  if (route.priority >= 0.9) {
    return trimToLength(`${label} | Legado Inmobiliaria`, 68);
  }

  if (route.path.includes("/guides/")) {
    return trimToLength(`${label} | Guia Legado Inmobiliaria`, 68);
  }

  if (route.path === "/blog") {
    return "Blog Inmobiliario | Legado Inmobiliaria";
  }

  return trimToLength(`${label} | Costa Blanca | Legado Inmobiliaria`, 68);
}

function buildSuggestedDescription(route: RouteSeoScore) {
  const label = routePathToLabel(route.path);

  if (route.path === "/") {
    return "Boutique inmobiliaria en Benidorm y Costa Blanca con propiedades singulares, soporte de compra, coordinacion legal y acompanamiento integral para compradores exigentes.";
  }

  if (route.path === "/propiedades") {
    return "Explora propiedades en venta en Benidorm, Alicante y Costa Blanca con filtros, fichas completas y contexto de compra para decidir mejor antes de contactar.";
  }

  if (route.path === "/blog") {
    return "Guias y analisis para comprar propiedad en Costa Blanca con mejor criterio de ubicacion, presupuesto, proceso legal y decision inmobiliaria.";
  }

  if (route.path.includes("/guides/")) {
    return trimToLength(`Aprende sobre ${label} con una guia clara para compradores que necesitan contexto, criterio y siguiente paso real en Costa Blanca.`, 160);
  }

  return trimToLength(`Descubre ${label} con enfoque de compra real: contexto de mercado, siguiente paso claro y soporte inmobiliario de Legado en Costa Blanca.`, 160);
}

function downloadTextFile(filename: string, content: string, mime = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const AdminSEOContent = ({ handleLogout }: { handleLogout: () => void }) => {
  const [properties, setProperties] = useState<PropertySEO[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "errors" | "warnings">("all");
  const [routeFilter, setRouteFilter] = useState<RouteFilter>("all");
  const [routeScores, setRouteScores] = useState<RouteSeoScore[]>([]);
  const [routeLoading, setRouteLoading] = useState(true);
  const [routeError, setRouteError] = useState<string | null>(null);

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

  const fetchRouteScores = async () => {
    setRouteLoading(true);
    setRouteError(null);
    try {
      const response = await fetch(`/seo/scorecard.json?ts=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) {
        throw new Error("No se encontro el scorecard generado.");
      }
      const data = (await response.json()) as RouteSeoScore[];
      setRouteScores(data);
    } catch (error) {
      setRouteError(
        error instanceof Error
          ? `${error.message} Ejecuta npm run build:enterprise-seo:verify y despliega dist/ completo.`
          : "No se pudo cargar el scorecard enterprise."
      );
    } finally {
      setRouteLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
    fetchRouteScores();
  }, []);

  const audited = properties.map((p) => ({ property: p, issues: auditProperty(p) }));
  const totalErrors = audited.reduce((s, a) => s + a.issues.filter((i) => i.type === "error").length, 0);
  const totalWarnings = audited.reduce((s, a) => s + a.issues.filter((i) => i.type === "warning").length, 0);
  const totalOk = audited.filter((a) => a.issues.every((i) => i.type === "ok")).length;

  const filtered = filter === "all"
    ? audited
    : filter === "errors"
      ? audited.filter((a) => a.issues.some((i) => i.type === "error"))
      : audited.filter((a) => a.issues.some((i) => i.type === "warning"));

  const routeMetrics = useMemo(() => {
    const moneyPages = routeScores.filter((route) => route.priority >= 0.9);
    const needsWork = routeScores.filter((route) => route.score < 90);
    const elite = routeScores.filter((route) => route.score >= 95);
    const average = routeScores.length
      ? Math.round(routeScores.reduce((sum, route) => sum + route.score, 0) / routeScores.length)
      : 0;

    return {
      moneyPages,
      needsWork,
      elite,
      average,
    };
  }, [routeScores]);

  const filteredRoutes = useMemo(() => {
    if (routeFilter === "money") return routeScores.filter((route) => route.priority >= 0.9);
    if (routeFilter === "needs-work") return routeScores.filter((route) => route.score < 90);
    return routeScores;
  }, [routeFilter, routeScores]);

  const topActionRoutes = useMemo(
    () =>
      [...routeScores]
        .filter((route) => getRouteActionPriority(route) > 20)
        .sort((a, b) => getRouteActionPriority(b) - getRouteActionPriority(a))
        .slice(0, 10),
    [routeScores]
  );

  const exportableRoutes = useMemo(
    () =>
      [...routeScores]
        .filter((route) => route.score < 90)
        .sort((a, b) => getRouteActionPriority(b) - getRouteActionPriority(a)),
    [routeScores]
  );

  const exportMarkdown = () => {
    const lines = [
      "# Backlog editorial SEO",
      "",
      `Generado: ${new Date().toISOString()}`,
      "",
      ...exportableRoutes.flatMap((route, index) => [
        `## ${index + 1}. ${route.path}`,
        "",
        `- Score actual: ${route.score}`,
        `- Prioridad: ${getRoutePriorityLabel(route.priority)}`,
        `- Acción recomendada: ${getRouteRecommendations(route)}`,
        `- Title sugerido: ${buildSuggestedTitle(route)}`,
        `- Description sugerida: ${buildSuggestedDescription(route)}`,
        "",
      ]),
    ];

    downloadTextFile("seo-editorial-backlog.md", lines.join("\n"), "text/markdown;charset=utf-8");
  };

  const exportCsv = () => {
    const escapeCsv = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
    const rows = [
      ["path", "score", "priority", "action", "suggested_title", "suggested_description"],
      ...exportableRoutes.map((route) => [
        route.path,
        route.score,
        getRoutePriorityLabel(route.priority),
        getRouteRecommendations(route),
        buildSuggestedTitle(route),
        buildSuggestedDescription(route),
      ]),
    ];

    const csv = rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
    downloadTextFile("seo-editorial-backlog.csv", csv, "text/csv;charset=utf-8");
  };

  const copyForSheets = async () => {
    const rows = [
      ["path", "score", "priority", "action", "suggested_title", "suggested_description"],
      ...exportableRoutes.map((route) => [
        route.path,
        String(route.score),
        getRoutePriorityLabel(route.priority),
        getRouteRecommendations(route),
        buildSuggestedTitle(route),
        buildSuggestedDescription(route),
      ]),
    ];

    const tsv = rows
      .map((row) => row.map((cell) => String(cell).replace(/\t/g, " ").replace(/\r?\n/g, " ")).join("\t"))
      .join("\n");

    try {
      await navigator.clipboard.writeText(tsv);
      toast({
        title: "Backlog copiado",
        description: "Ya puedes pegarlo directamente en Google Sheets o Notion.",
      });
    } catch {
      toast({
        title: "No se pudo copiar",
        description: "Usa la exportación CSV si el portapapeles falla en este navegador.",
        variant: "destructive",
      });
    }
  };

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
            <Button variant="ghost" size="sm" onClick={() => { fetchProperties(); fetchRouteScores(); }}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut className="h-4 w-4 mr-2" /> Salir</Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-primary/20">
            <CardContent className="pt-5 pb-4 text-center">
              <BarChart3 className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-foreground">{routeMetrics.average || "—"}</p>
              <p className="text-xs text-muted-foreground">Media score rutas</p>
            </CardContent>
          </Card>
          <Card className="border-emerald-500/30">
            <CardContent className="pt-5 pb-4 text-center">
              <ShieldCheck className="h-6 w-6 mx-auto mb-2 text-emerald-500" />
              <p className="text-2xl font-bold text-foreground">{routeMetrics.elite.length}</p>
              <p className="text-xs text-muted-foreground">Rutas elite 95+</p>
            </CardContent>
          </Card>
          <Card className="border-amber-500/30">
            <CardContent className="pt-5 pb-4 text-center">
              <FileWarning className="h-6 w-6 mx-auto mb-2 text-amber-500" />
              <p className="text-2xl font-bold text-foreground">{routeMetrics.needsWork.length}</p>
              <p className="text-xs text-muted-foreground">Rutas bajo 90</p>
            </CardContent>
          </Card>
          <Card className="border-sky-500/30">
            <CardContent className="pt-5 pb-4 text-center">
              <Globe className="h-6 w-6 mx-auto mb-2 text-sky-500" />
              <p className="text-2xl font-bold text-foreground">{routeMetrics.moneyPages.length}</p>
              <p className="text-xs text-muted-foreground">Money pages</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Enterprise SEO Scorecard
              </span>
              <div className="flex flex-wrap gap-1">
                <Button variant="outline" size="sm" onClick={copyForSheets} disabled={routeLoading || !!routeError || exportableRoutes.length === 0}>
                  <Copy className="h-4 w-4 mr-2" />
                  Sheets
                </Button>
                <Button variant="outline" size="sm" onClick={exportMarkdown} disabled={routeLoading || !!routeError || exportableRoutes.length === 0}>
                  <Download className="h-4 w-4 mr-2" />
                  Markdown
                </Button>
                <Button variant="outline" size="sm" onClick={exportCsv} disabled={routeLoading || !!routeError || exportableRoutes.length === 0}>
                  <Download className="h-4 w-4 mr-2" />
                  CSV
                </Button>
                {([
                  ["all", "Todas"],
                  ["money", "Money"],
                  ["needs-work", "Prioridad"],
                ] as const).map(([value, label]) => (
                  <Button
                    key={value}
                    variant={routeFilter === value ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setRouteFilter(value)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border border-border/50 bg-card/40 p-4 text-sm leading-7 text-muted-foreground">
              Este bloque lee el scorecard generado por el pipeline enterprise. Si falta, el problema no es de UI:
              hay que regenerar `dist/seo/scorecard.json` con `npm run build:enterprise-seo:verify` y desplegarlo.
            </div>

            {!routeLoading && !routeError && topActionRoutes.length > 0 ? (
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 md:p-5">
                <div className="flex items-center gap-2 mb-3">
                  <FileWarning className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold tracking-wide text-foreground">Top 10 URLs a tocar hoy</p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {topActionRoutes.map((route, index) => (
                    <div key={route.path} className="rounded-xl border border-border/50 bg-background px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground">#{index + 1} · {getRoutePriorityLabel(route.priority)}</p>
                          <p className="font-medium text-sm text-foreground break-all">{route.path}</p>
                        </div>
                        <a
                          href={route.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                          aria-label={`Abrir ${route.path}`}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        Score {route.score} · prioridad {getRouteActionPriority(route)}
                      </p>
                      <p className="mt-2 text-xs leading-6 text-muted-foreground">
                        {getRouteRecommendations(route)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {routeLoading ? (
              <p className="text-muted-foreground text-center py-8">Cargando scorecard...</p>
            ) : routeError ? (
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                {routeError}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ruta</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Checks</TableHead>
                    <TableHead>Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRoutes.slice(0, 60).map((route) => {
                    const status = getRouteStatus(route);
                    return (
                      <TableRow key={route.path}>
                        <TableCell>
                          <p className="font-medium text-sm">{route.path}</p>
                          <p className="text-xs text-muted-foreground">
                            {getRoutePriorityLabel(route.priority)} · title {route.titleLength} · description {route.descriptionLength}
                          </p>
                        </TableCell>
                        <TableCell>
                          <span className={`text-sm font-semibold ${status.tone}`}>{route.score}</span>
                        </TableCell>
                        <TableCell>
                          <span className={`text-xs ${status.tone}`}>{status.label}</span>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <p>Canonical: {route.checks.canonical ? "ok" : "no"}</p>
                            <p>OG: {route.checks.og ? "ok" : "no"}</p>
                            <p>Schema: {route.checks.schema ? "ok" : "no"}</p>
                            <p>NoScript: {route.checks.noscript ? "ok" : "no"}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-xs leading-6 text-muted-foreground max-w-[280px]">
                            {getRouteRecommendations(route)}
                          </p>
                          {route.score < 90 ? (
                            <div className="mt-3 space-y-2 rounded-lg border border-border/50 bg-card/50 p-3">
                              <div>
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-foreground">Title sugerido</p>
                                <p className="text-xs leading-5 text-muted-foreground">{buildSuggestedTitle(route)}</p>
                              </div>
                              <div>
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-foreground">Description sugerida</p>
                                <p className="text-xs leading-5 text-muted-foreground">{buildSuggestedDescription(route)}</p>
                              </div>
                            </div>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

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
              "Prerender enterprise para rutas comerciales",
              "Scorecard JSON y Markdown por build",
              "Sitemap.xml estático + sitemap dinámico",
              "JSON-LD Organization + WebSite + FAQPage en homepage",
              "JSON-LD RealEstateListing por propiedad",
              "BreadcrumbList y WebPage schema en rutas core",
              "Open Graph + Twitter Card meta tags",
              "Guardrails X-Robots-Tag en admin y gracias",
              "Canonical URLs",
              "robots.txt + fallback SPA + score verify",
              "Search Console listo para lanzamiento",
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
