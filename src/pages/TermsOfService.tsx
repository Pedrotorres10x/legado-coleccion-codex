import { Link } from "react-router-dom";

const TermsOfService = () => (
  <main className="min-h-screen bg-background pt-28 pb-20">
    <div className="container max-w-3xl">
      <h1 className="font-serif text-4xl font-bold mb-8 text-foreground">Aviso Legal</h1>

      <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground text-sm leading-relaxed">
        <p>Última actualización: {new Date().toLocaleDateString("es-ES")}</p>

        <h2 className="font-serif text-xl font-semibold text-foreground mt-8">1. Datos identificativos</h2>
        <p>
          <strong className="text-foreground">Legado Inmobiliaria</strong><br />
          Domicilio: C/ Esperanto 15, 03501 Benidorm, Alicante, España<br />
          Teléfono: +34 965 065 921
        </p>

        <h2 className="font-serif text-xl font-semibold text-foreground mt-8">2. Objeto</h2>
        <p>Este sitio web tiene como finalidad la promoción y comercialización de propiedades inmobiliarias en la Costa Blanca y facilitar el contacto con potenciales compradores o arrendatarios.</p>

        <h2 className="font-serif text-xl font-semibold text-foreground mt-8">3. Propiedad intelectual</h2>
        <p>Todos los contenidos de este sitio web (textos, imágenes, logotipos, diseño gráfico, código fuente) están protegidos por las leyes de propiedad intelectual e industrial. Queda prohibida su reproducción, distribución o transformación sin autorización expresa.</p>

        <h2 className="font-serif text-xl font-semibold text-foreground mt-8">4. Limitación de responsabilidad</h2>
        <p>Legado Inmobiliaria no se hace responsable de los posibles errores u omisiones en los contenidos publicados, ni de la disponibilidad o continuidad del acceso al sitio web. Los precios y características de las propiedades son orientativos y pueden sufrir modificaciones.</p>

        <h2 className="font-serif text-xl font-semibold text-foreground mt-8">5. Enlaces externos</h2>
        <p>Este sitio web puede contener enlaces a sitios de terceros sobre los cuales Legado Inmobiliaria no ejerce control alguno y, por tanto, no asume responsabilidad sobre sus contenidos o políticas de privacidad.</p>

        <h2 className="font-serif text-xl font-semibold text-foreground mt-8">6. Legislación aplicable</h2>
        <p>Para la resolución de cualquier controversia derivada del uso de este sitio web serán competentes los juzgados y tribunales de Benidorm, Alicante, España, aplicándose la legislación española.</p>
      </div>

      <div className="mt-12">
        <Link to="/" className="text-primary hover:underline text-sm">← Volver al inicio</Link>
      </div>
    </div>
  </main>
);

export default TermsOfService;
