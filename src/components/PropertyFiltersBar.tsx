import { useState } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { NativeSelect } from "@/components/ui/native-select";
import { useIsMobile } from "@/hooks/use-mobile";
import type { ExternalPropertyFilters, ExternalPropertySort } from "@/hooks/useExternalProperties";

const PROPERTY_TYPES = [
  { value: "piso", label: "Piso" },
  { value: "casa", label: "Casa" },
  { value: "villa", label: "Villa" },
  { value: "atico", label: "Ático" },
  { value: "duplex", label: "Dúplex" },
  { value: "chalet", label: "Chalet" },
  { value: "estudio", label: "Estudio" },
  { value: "local", label: "Local" },
  { value: "otro", label: "Otro" },
];

const PROVINCES = [
  { value: "Alicante", label: "Alicante" },
  { value: "Valencia", label: "Valencia" },
  { value: "Murcia", label: "Murcia" },
  { value: "Almería", label: "Almería" },
  { value: "Málaga", label: "Málaga" },
];

type Props = {
  filters: ExternalPropertyFilters;
  sort: ExternalPropertySort;
  onFiltersChange: (f: ExternalPropertyFilters) => void;
  onSortChange: (s: ExternalPropertySort) => void;
  total: number;
  cities?: string[];
};

const formatPrice = (v: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);

type FilterValue = ExternalPropertyFilters[keyof ExternalPropertyFilters];

const PropertyFiltersBar = ({ filters, sort, onFiltersChange, onSortChange, total, cities = [] }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.minPrice || 0,
    filters.maxPrice || 3000000,
  ]);

  const updateFilter = (key: keyof ExternalPropertyFilters, value: FilterValue) => {
    onFiltersChange({ ...filters, [key]: value || undefined });
  };

  const clearFilters = () => {
    onFiltersChange({});
    setPriceRange([0, 3000000]);
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined);
  const activeCount = Object.values(filters).filter((v) => v !== undefined).length;

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <p className="text-muted-foreground text-sm">
            <span className="text-foreground font-semibold">{total}</span> propiedades
          </p>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-primary hover:text-primary/80 h-7 px-2">
              <X className="w-3 h-3 mr-1" /> Limpiar
            </Button>
          )}
        </div>
        <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-[auto_minmax(0,1fr)] lg:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpanded((v) => !v)}
            className="border-border text-xs h-9 px-3 w-full sm:w-auto"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5" />
            Filtrar
            {activeCount > 0 && (
              <span className="ml-1.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </Button>
          <NativeSelect
            value={sort}
            onChange={(e) => onSortChange(e.target.value as ExternalPropertySort)}
            className="w-full sm:min-w-[180px] bg-card border-border text-xs sm:text-sm"
            aria-label="Ordenar propiedades"
          >
            <option value="newest">Más recientes</option>
            <option value="price_asc">Precio: menor</option>
            <option value="price_desc">Precio: mayor</option>
            <option value="area_desc">Superficie: mayor</option>
          </NativeSelect>
        </div>
      </div>

      {/* Filters panel — collapsed on mobile by default */}
      {expanded && (
          <div
            className="glass-dark rounded-xl p-4 sm:p-6 overflow-hidden enter-fade-up"
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 sm:gap-6">
              {/* Country / scope */}
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">País</label>
                <NativeSelect
                  value={filters.country || "all"}
                  onChange={(e) => updateFilter("country", e.target.value === "all" ? undefined : e.target.value)}
                  className="bg-background/50 border-border/50"
                  aria-label="Filtrar por país"
                >
                  <option value="all">Todos</option>
                  <option value="España">España</option>
                  <option value="__international">Internacional</option>
                </NativeSelect>
              </div>

              {/* Province */}
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Provincia</label>
                <NativeSelect
                  value={filters.province || "all"}
                  onChange={(e) => {
                    const value = e.target.value;
                    onFiltersChange({ ...filters, province: value === "all" ? undefined : value, city: undefined });
                  }}
                  className="bg-background/50 border-border/50"
                  aria-label="Filtrar por provincia"
                >
                  <option value="all">Todas</option>
                  {PROVINCES.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </NativeSelect>
              </div>

              {/* City */}
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Ciudad</label>
                {cities.length > 0 ? (
                  <NativeSelect
                    value={filters.city || "all"}
                    onChange={(e) => updateFilter("city", e.target.value === "all" ? undefined : e.target.value)}
                    className="bg-background/50 border-border/50"
                    aria-label="Filtrar por ciudad"
                  >
                    <option value="all">Todas</option>
                    {cities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </NativeSelect>
                ) : (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar ciudad..."
                      value={filters.city || ""}
                      onChange={(e) => updateFilter("city", e.target.value)}
                      className="pl-10 bg-background/50 border-border/50"
                    />
                  </div>
                )}
              </div>

              {/* Type */}
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Tipo</label>
                <NativeSelect
                  value={filters.type || "all"}
                  onChange={(e) => updateFilter("type", e.target.value === "all" ? undefined : e.target.value)}
                  className="bg-background/50 border-border/50"
                  aria-label="Filtrar por tipo"
                >
                  <option value="all">Todos</option>
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </NativeSelect>
              </div>

              {/* Bedrooms */}
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Habitaciones mín.</label>
                <NativeSelect
                  value={String(filters.minBeds || "any")}
                  onChange={(e) => updateFilter("minBeds", e.target.value === "any" ? undefined : Number(e.target.value))}
                  className="bg-background/50 border-border/50"
                  aria-label="Filtrar por habitaciones mínimas"
                >
                  <option value="any">Cualquiera</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={String(n)}>{n}+</option>
                  ))}
                </NativeSelect>
              </div>
            </div>

            {/* Price range */}
              <div className="mt-6">
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <label className="text-xs text-muted-foreground uppercase tracking-wider">Rango de precio</label>
                <span className="text-primary text-sm font-medium break-words">
                  {formatPrice(priceRange[0])} — {formatPrice(priceRange[1])}
                </span>
              </div>
              <Slider
                value={priceRange}
                onValueChange={(v) => setPriceRange(v as [number, number])}
                onValueCommit={(v) => {
                  updateFilter("minPrice", v[0] > 0 ? v[0] : undefined);
                  updateFilter("maxPrice", v[1] < 3000000 ? v[1] : undefined);
                }}
                min={0}
                max={3000000}
                step={10000}
                className="[&_[role=slider]]:border-primary [&_[role=slider]]:bg-primary"
              />
            </div>
          </div>
        )}
    </div>
  );
};

export default PropertyFiltersBar;
