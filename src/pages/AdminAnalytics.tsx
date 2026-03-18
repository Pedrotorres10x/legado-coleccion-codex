import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NativeSelect } from "@/components/ui/native-select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, Eye, Smartphone, Monitor, Tablet, TrendingUp, Users, Clock, ArrowRight, RefreshCw, LogOut, Globe } from "lucide-react";
import AdminAuthGate from "@/components/AdminAuthGate";
import AdminBreadcrumb from "@/components/AdminBreadcrumb";

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

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2, 160 60% 45%))",
  "hsl(var(--chart-3, 30 80% 55%))",
  "hsl(var(--chart-4, 280 65% 60%))",
  "hsl(var(--chart-5, 340 75% 55%))",
];

const PERIOD_OPTIONS = [
  { value: "7", label: "Últimos 7 días" },
  { value: "30", label: "Últimos 30 días" },
  { value: "90", label: "Últimos 90 días" },
  { value: "365", label: "Este año" },
];

type DeviceType = "mobile" | "tablet" | "desktop";
type DeviceCounts = Record<DeviceType, number>;
type DeviceDatum = { name: string; value: number };
type SeriesDatum = { label: string; value: number };
type KPICardProps = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  accent?: boolean;
};

const AdminAnalyticsContent = ({ handleLogout }: { handleLogout: () => void }) => {
  const [views, setViews] = useState<PageView[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const since = new Date();
    since.setDate(since.getDate() - parseInt(period));

    const { data, error } = await supabase
      .from("page_views")
      .select("*")
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: false })
      .limit(5000);

    if (!error && data) setViews(data as unknown as PageView[]);
    setLoading(false);
  }, [period]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Computed analytics ──
  const stats = useMemo(() => {
    if (!views.length) return null;

    const totalViews = views.length;
    const uniqueSessions = new Set(views.map(v => v.session_id)).size;
    const propertyViews = views.filter(v => v.path.startsWith("/propiedad/"));
    const avgDuration = views.filter(v => v.duration_seconds && v.duration_seconds > 0);
    const avgDurationSec = avgDuration.length
      ? Math.round(avgDuration.reduce((s, v) => s + (v.duration_seconds || 0), 0) / avgDuration.length)
      : 0;

    // Pages by views
    const pageCounts: Record<string, number> = {};
    views.forEach(v => { pageCounts[v.path] = (pageCounts[v.path] || 0) + 1; });
    const topPages = Object.entries(pageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([path, count]) => ({ path, count, pct: Math.round((count / totalViews) * 100) }));

    // Top properties
    const propCounts: Record<string, { count: number; title: string }> = {};
    propertyViews.forEach(v => {
      const key = v.property_id || v.property_title || v.path;
      const title = v.property_title || v.path.replace("/propiedad/", "");
      if (!propCounts[key]) propCounts[key] = { count: 0, title };
      propCounts[key].count++;
    });
    const topProperties = Object.entries(propCounts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .map(([id, { count, title }]) => ({ id, title: decodeURIComponent(title), count }));

    // Device breakdown
    const devices: DeviceCounts = { mobile: 0, tablet: 0, desktop: 0 };
    views.forEach(v => {
      const device: DeviceType =
        v.device_type === "mobile" || v.device_type === "tablet" || v.device_type === "desktop"
          ? v.device_type
          : "desktop";
      devices[device] += 1;
    });
    const deviceData = Object.entries(devices).map(([name, value]) => ({ name, value }));

    // Views per day
    const dailyCounts: Record<string, number> = {};
    views.forEach(v => {
      const day = v.created_at.slice(0, 10);
      dailyCounts[day] = (dailyCounts[day] || 0) + 1;
    });
    const dailyData = Object.entries(dailyCounts)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString("es-ES", { day: "2-digit", month: "short" }),
        views: count,
      }));

    // Referrer sources
    const refCounts: Record<string, number> = {};
    views.forEach(v => {
      let source = "Directo";
      if (v.utm_source) source = v.utm_source;
      else if (v.referrer) {
        try { source = new URL(v.referrer).hostname; } catch { source = v.referrer.slice(0, 30); }
      }
      refCounts[source] = (refCounts[source] || 0) + 1;
    });
    const topReferrers = Object.entries(refCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([source, count]) => ({ source, count }));

    // User journeys (session flows)
    const sessions: Record<string, { paths: string[]; times: number[] }> = {};
    views.forEach(v => {
      if (!sessions[v.session_id]) sessions[v.session_id] = { paths: [], times: [] };
      sessions[v.session_id].paths.push(v.path);
      sessions[v.session_id].times.push(new Date(v.created_at).getTime());
    });
    // Sort each session by time and build flow
    const flowCounts: Record<string, number> = {};
    Object.values(sessions).forEach(({ paths, times }) => {
      const sorted = paths.map((p, i) => ({ p, t: times[i] })).sort((a, b) => a.t - b.t);
      for (let i = 0; i < sorted.length - 1; i++) {
        const from = simplifyPath(sorted[i].p);
        const to = simplifyPath(sorted[i + 1].p);
        if (from !== to) {
          const key = `${from} → ${to}`;
          flowCounts[key] = (flowCounts[key] || 0) + 1;
        }
      }
    });
    const topFlows = Object.entries(flowCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([flow, count]) => ({ flow, count }));

    // Bounce rate (sessions with 1 page only)
    const totalSessions = Object.keys(sessions).length;
    const bounceSessions = Object.values(sessions).filter(s => {
      const unique = new Set(s.paths);
      return unique.size <= 1;
    }).length;
    const bounceRate = totalSessions ? Math.round((bounceSessions / totalSessions) * 100) : 0;

    // Hourly distribution
    const hourly: number[] = new Array(24).fill(0);
    views.forEach(v => {
      const h = new Date(v.created_at).getHours();
      hourly[h]++;
    });
    const hourlyData = hourly.map((count, hour) => ({
      hour: `${hour.toString().padStart(2, "0")}h`,
      views: count,
    }));

    return {
      totalViews, uniqueSessions, propertyViewsCount: propertyViews.length,
      avgDurationSec, bounceRate,
      topPages, topProperties, deviceData, dailyData, topReferrers, topFlows, hourlyData,
    };
  }, [views]);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminBreadcrumb />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
              <p className="text-muted-foreground text-sm">Análisis de tráfico y comportamiento de usuarios</p>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <NativeSelect
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-[180px]"
              aria-label="Periodo de analytics"
            >
              {PERIOD_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </NativeSelect>
            <Button variant="ghost" size="sm" onClick={fetchData}><RefreshCw className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}><LogOut className="h-4 w-4 mr-2" /> Salir</Button>
          </div>
        </div>

        {loading ? (
          <p className="text-muted-foreground text-center py-20">Cargando analytics...</p>
        ) : !stats ? (
          <p className="text-muted-foreground text-center py-20">No hay datos aún. Las visitas se registran automáticamente.</p>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <KPICard icon={Eye} label="Páginas vistas" value={stats.totalViews} />
              <KPICard icon={Users} label="Sesiones únicas" value={stats.uniqueSessions} />
              <KPICard icon={TrendingUp} label="Vistas propiedades" value={stats.propertyViewsCount} accent />
              <KPICard icon={Clock} label="Duración media" value={`${stats.avgDurationSec}s`} />
              <KPICard icon={ArrowRight} label="Tasa de rebote" value={`${stats.bounceRate}%`} />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily views */}
              <Card>
                <CardHeader><CardTitle className="text-lg">Visitas por día</CardTitle></CardHeader>
                <CardContent>
                  <SimpleLineChart data={stats.dailyData.map((item) => ({ label: item.date, value: item.views }))} />
                </CardContent>
              </Card>

              {/* Device breakdown */}
              <Card>
                <CardHeader><CardTitle className="text-lg">Dispositivos</CardTitle></CardHeader>
                <CardContent className="flex items-center justify-center">
                  <SimpleDonutChart data={stats.deviceData} />
                </CardContent>
              </Card>
            </div>

            {/* Hourly distribution */}
            <Card>
              <CardHeader><CardTitle className="text-lg">Distribución horaria</CardTitle></CardHeader>
              <CardContent>
                <SimpleBarChart data={stats.hourlyData.map((item) => ({ label: item.hour, value: item.views }))} />
              </CardContent>
            </Card>

            {/* Tables Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Properties */}
              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center gap-2">🏠 Propiedades más visitadas</CardTitle></CardHeader>
                <CardContent>
                  {stats.topProperties.length === 0 ? (
                    <p className="text-muted-foreground text-center py-6">Sin visitas a propiedades</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>#</TableHead>
                          <TableHead>Propiedad</TableHead>
                          <TableHead className="text-right">Visitas</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stats.topProperties.map((p, i) => (
                          <TableRow key={p.id}>
                            <TableCell className="font-bold text-primary">{i + 1}</TableCell>
                            <TableCell className="text-sm max-w-[200px] truncate">{p.title}</TableCell>
                            <TableCell className="text-right font-medium">{p.count}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              {/* Top Pages */}
              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center gap-2">📄 Páginas más visitadas</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Página</TableHead>
                        <TableHead className="text-right">Visitas</TableHead>
                        <TableHead className="text-right">%</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.topPages.map((p) => (
                        <TableRow key={p.path}>
                          <TableCell className="text-sm font-mono max-w-[200px] truncate">{p.path}</TableCell>
                          <TableCell className="text-right font-medium">{p.count}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{p.pct}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Journeys */}
              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center gap-2">🗺️ Flujos de navegación</CardTitle></CardHeader>
                <CardContent>
                  {stats.topFlows.length === 0 ? (
                    <p className="text-muted-foreground text-center py-6">Sin suficientes datos de flujo</p>
                  ) : (
                    <div className="space-y-2">
                      {stats.topFlows.map((f, i) => (
                        <div key={i} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-muted/50">
                          <span className="text-sm font-mono truncate max-w-[250px]">{f.flow}</span>
                          <span className="text-sm font-bold text-primary ml-3">{f.count}×</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Referrers */}
              <Card>
                <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Globe className="h-5 w-5" /> Fuentes de tráfico</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fuente</TableHead>
                        <TableHead className="text-right">Visitas</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stats.topReferrers.map((r) => (
                        <TableRow key={r.source}>
                          <TableCell className="text-sm">{r.source}</TableCell>
                          <TableCell className="text-right font-medium">{r.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ── Helper components ──

function KPICard({ icon: Icon, label, value, accent }: KPICardProps) {
  return (
    <Card className={accent ? "border-primary/30 bg-primary/5" : ""}>
      <CardContent className="pt-5 pb-4 text-center">
        <Icon className={`h-6 w-6 mx-auto mb-2 ${accent ? "text-primary" : "text-muted-foreground"}`} />
        <p className="text-2xl font-bold text-foreground">{typeof value === "number" ? value.toLocaleString("es-ES") : value}</p>
        <p className="text-xs text-muted-foreground mt-1">{label}</p>
      </CardContent>
    </Card>
  );
}

function simplifyPath(path: string): string {
  if (path === "/") return "Inicio";
  if (path === "/propiedades") return "Propiedades";
  if (path === "/blog") return "Blog";
  if (path.startsWith("/propiedad/")) return "Propiedad";
  if (path.startsWith("/blog/")) return "Artículo";
  if (path === "/gracias") return "Gracias";
  if (path === "/privacidad") return "Privacidad";
  if (path === "/cookies") return "Cookies";
  if (path === "/aviso-legal") return "Aviso Legal";
  return path;
}

function SimpleLineChart({ data }: { data: SeriesDatum[] }) {
  if (!data.length) {
    return <p className="text-muted-foreground text-center py-10">Sin datos suficientes</p>;
  }

  const width = 640;
  const height = 250;
  const padding = 24;
  const maxValue = Math.max(...data.map((item) => item.value), 1);
  const stepX = data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0;

  const points = data
    .map((item, index) => {
      const x = padding + index * stepX;
      const y = height - padding - (item.value / maxValue) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="space-y-3">
      <div className="h-[250px] w-full rounded-xl bg-muted/30 p-3">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full">
          {[0.25, 0.5, 0.75].map((tick) => {
            const y = height - padding - tick * (height - padding * 2);
            return (
              <line
                key={tick}
                x1={padding}
                x2={width - padding}
                y1={y}
                y2={y}
                stroke="hsl(var(--border))"
                strokeDasharray="4 4"
              />
            );
          })}
          <polyline
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
            points={points}
          />
          {data.map((item, index) => {
            const x = padding + index * stepX;
            const y = height - padding - (item.value / maxValue) * (height - padding * 2);
            return (
              <circle key={`${item.label}-${index}`} cx={x} cy={y} r="3.5" fill="hsl(var(--primary))">
                <title>{`${item.label}: ${item.value}`}</title>
              </circle>
            );
          })}
        </svg>
      </div>
      <div className="grid grid-cols-4 gap-2 text-[11px] text-muted-foreground sm:grid-cols-6 md:grid-cols-8">
        {data.map((item) => (
          <div key={item.label} className="truncate">
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function SimpleBarChart({ data }: { data: SeriesDatum[] }) {
  if (!data.length) {
    return <p className="text-muted-foreground text-center py-10">Sin datos suficientes</p>;
  }

  const maxValue = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="space-y-4">
      <div className="flex h-[200px] items-end gap-1 rounded-xl bg-muted/30 p-3">
        {data.map((item) => {
          const height = `${Math.max((item.value / maxValue) * 100, item.value > 0 ? 4 : 0)}%`;
          return (
            <div key={item.label} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2">
              <div className="text-[10px] text-muted-foreground">{item.value}</div>
              <div className="w-full rounded-t bg-primary/85 transition-all" style={{ height }} title={`${item.label}: ${item.value}`} />
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-6 gap-1 text-center text-[10px] text-muted-foreground md:grid-cols-12 lg:grid-cols-24">
        {data.map((item) => (
          <div key={item.label}>{item.label.replace("h", "")}</div>
        ))}
      </div>
    </div>
  );
}

function SimpleDonutChart({ data }: { data: DeviceDatum[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (!total) {
    return <p className="text-muted-foreground text-center py-10">Sin datos suficientes</p>;
  }

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    mobile: Smartphone,
    tablet: Tablet,
    desktop: Monitor,
  };

  return (
    <div className="flex w-full flex-col items-center gap-6 lg:flex-row lg:justify-center">
      <div className="relative h-48 w-48">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="12" />
          {data.map((item, index) => {
            const segment = (item.value / total) * circumference;
            const strokeDasharray = `${segment} ${circumference - segment}`;
            const strokeDashoffset = -offset;
            offset += segment;
            return (
              <circle
                key={item.name}
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={COLORS[index % COLORS.length]}
                strokeWidth="12"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="butt"
              >
                <title>{`${item.name}: ${item.value}`}</title>
              </circle>
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-foreground">{total}</span>
          <span className="text-xs uppercase tracking-wide text-muted-foreground">dispositivos</span>
        </div>
      </div>

      <div className="space-y-3">
        {data.map((item, index) => {
          const Icon = iconMap[item.name] || Globe;
          const pct = Math.round((item.value / total) * 100);
          return (
            <div key={item.name} className="flex items-center gap-3 rounded-lg bg-muted/40 px-3 py-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
              <Icon className="h-4 w-4 text-muted-foreground" />
              <span className="min-w-20 text-sm capitalize text-foreground">{item.name}</span>
              <span className="text-sm font-semibold text-foreground">{item.value}</span>
              <span className="text-xs text-muted-foreground">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const AdminAnalytics = () => (
  <AdminAuthGate>
    {(auth) => <AdminAnalyticsContent handleLogout={auth.handleLogout} />}
  </AdminAuthGate>
);

export default AdminAnalytics;
