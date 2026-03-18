import LeadForm from "@/components/LeadForm";

const HomeContactSection = () => {
  return (
    <section id="contacto" className="py-14 md:py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/40 to-background" />

      <div className="container relative px-4 sm:px-6">
        <div className="text-center mb-8 md:mb-14 enter-fade-up">
          <p className="text-primary font-medium tracking-[0.2em] uppercase text-xs sm:text-sm mb-2 sm:mb-3">
            Hablemos
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mb-3 md:mb-4">
            ¿Buscas tu{" "}
            <span className="text-gradient-gold">propiedad ideal</span>?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm leading-relaxed px-2 sm:px-0">
            Si aún no has encontrado una vivienda concreta, cuéntanos qué necesitas y te ayudamos a llegar a fichas que sí encajen contigo antes de dar el siguiente paso.
          </p>
        </div>

        <div className="max-w-lg mx-auto">
          <div className="glass-dark rounded-2xl p-5 sm:p-8 enter-fade-up">
            <LeadForm propertyId="general" propertyTitle="Consulta general" />
          </div>

          <p className="mt-4 text-center text-xs leading-6 text-muted-foreground">
            Cuando ya tengas una propiedad clara, la mejor conversión sigue estando en su propia ficha y su formulario específico.
          </p>

          <div className="mt-6 text-center enter-fade-in">
            <a href="https://maps.google.com/?q=C/+Esperanto+15,+03501+Benidorm,+Alicante,+Spain" target="_blank" rel="noopener noreferrer" className="text-muted-foreground text-xs hover:text-primary transition-colors">
              📍 C/ Esperanto 15, Benidorm (Alicante)
            </a>
            <p className="text-muted-foreground text-xs mt-1">
              Lunes a Jueves 10:00 – 18:00 · Viernes 10:00 – 16:00
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeContactSection;
