import { Shield, BadgeCheck, Scale } from "lucide-react";

import certCrs from "@/assets/cert-crs.jpg";
import certMeta from "@/assets/cert-meta.webp";
import certApi from "@/assets/cert-api.webp";
import certAsicval from "@/assets/cert-asicval.png";
import certRaicv from "@/assets/cert-raicv.webp";

const credentials = [
  {
    image: certApi,
    name: "API — Agente de la Propiedad Inmobiliaria",
    description: "Colegiados oficiales con licencia activa para intermediación inmobiliaria en España.",
  },
  {
    image: certRaicv,
    name: "RAICV — Registro Oficial",
    description: "Inscritos en el Registro de Agentes de Intermediación Inmobiliaria de la Comunitat Valenciana (RAICV0014).",
  },
  {
    image: certAsicval,
    name: "ASICVAL",
    description: "Miembros de la Asociación de Inmobiliarias de la Comunitat Valenciana.",
  },
  {
    image: certCrs,
    name: "CRS — Certified Residential Specialist",
    description: "Especialistas residenciales certificados con el estándar internacional más exigente del sector.",
  },
  {
    image: certMeta,
    name: "Meta Certified Digital Marketing",
    description: "Certificación oficial de Meta en marketing digital para máxima visibilidad de tus propiedades.",
  },
];

const TrustCredentials = () => {
  return (
    <section className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/30 to-background" />

      <div className="container relative">
        <div className="text-center mb-14 enter-fade-up">
          <p className="text-primary font-medium tracking-[0.2em] uppercase text-sm mb-3">
            Confianza y transparencia
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            Certificaciones{" "}
            <span className="text-gradient-gold">& Afiliaciones</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm leading-relaxed">
            Operamos bajo los más altos estándares profesionales del sector inmobiliario
            europeo, garantizando seguridad jurídica y excelencia en cada operación.
          </p>
          <p className="mt-4 text-muted-foreground/90 max-w-2xl mx-auto text-sm leading-7">
            Esta confianza no es decorativa: está para que puedas revisar fichas de viviendas y enviar tu consulta con más seguridad cuando una propiedad encaje.
          </p>
        </div>

        {/* Logo strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 items-center justify-items-center mb-12">
          {credentials.map((cred, i) => (
            <div
              key={cred.name}
              className="group flex flex-col items-center text-center gap-3 enter-fade-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="w-24 h-24 rounded-2xl bg-white/90 border border-border p-3 flex items-center justify-center group-hover:border-primary/40 transition-colors shadow-sm">
                <img
                  src={cred.image}
                  alt={cred.name}
                  className="max-w-full max-h-full object-contain"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-xs mb-0.5 leading-tight">{cred.name}</h3>
                <p className="text-muted-foreground text-[11px] leading-relaxed max-w-[180px]">
                  {cred.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Trust bar */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-muted-foreground text-xs enter-fade-in">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-primary/60" /> Seguro de responsabilidad civil
          </span>
          <span className="hidden sm:inline text-border">|</span>
          <span className="flex items-center gap-1.5">
            <BadgeCheck className="w-3.5 h-3.5 text-primary/60" /> Protección de datos RGPD
          </span>
          <span className="hidden sm:inline text-border">|</span>
          <span className="flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-primary/60" /> Asesoramiento legal incluido
          </span>
        </div>
      </div>
    </section>
  );
};

export default TrustCredentials;
