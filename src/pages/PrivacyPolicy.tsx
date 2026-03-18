import { Link } from "react-router-dom";

const PrivacyPolicy = () => (
  <main className="min-h-screen bg-background pt-28 pb-20">
    <div className="container max-w-3xl">
      <h1 className="font-serif text-4xl font-bold mb-8 text-foreground">Política de Privacidad</h1>

      <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground text-sm leading-relaxed">
        <p>Última actualización: {new Date().toLocaleDateString("es-ES")}</p>

        <h2 className="font-serif text-xl font-semibold text-foreground mt-8">1. Responsable del tratamiento</h2>
        <p>
          <strong className="text-foreground">Legado Inmobiliaria</strong><br />
          C/ Esperanto 15, 03501 Benidorm, Alicante, España<br />
          Teléfono: +34 965 065 921
        </p>

        <h2 className="font-serif text-xl font-semibold text-foreground mt-8">2. Datos que recopilamos</h2>
        <p>Recopilamos los datos personales que nos proporcionas voluntariamente a través de nuestros formularios de contacto:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Nombre completo</li>
          <li>Dirección de correo electrónico</li>
          <li>Número de teléfono</li>
          <li>Mensaje o consulta</li>
          <li>Propiedad de interés</li>
        </ul>

        <h2 className="font-serif text-xl font-semibold text-foreground mt-8">3. Finalidad del tratamiento</h2>
        <p>Los datos recogidos se utilizan para:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Atender y responder a tus consultas inmobiliarias</li>
          <li>Gestionar las solicitudes de información sobre propiedades</li>
          <li>Enviar información comercial relacionada con nuestros servicios (solo con consentimiento previo)</li>
        </ul>

        <h2 className="font-serif text-xl font-semibold text-foreground mt-8">4. Base legal</h2>
        <p>El tratamiento de tus datos se basa en tu consentimiento expreso al rellenar nuestros formularios, así como en el interés legítimo de atender tu solicitud (Art. 6.1.a y 6.1.f del RGPD).</p>

        <h2 className="font-serif text-xl font-semibold text-foreground mt-8">5. Conservación de datos</h2>
        <p>Tus datos personales se conservarán mientras sean necesarios para la finalidad para la que fueron recogidos y durante los plazos legalmente exigidos.</p>

        <h2 className="font-serif text-xl font-semibold text-foreground mt-8">6. Derechos del interesado</h2>
        <p>Puedes ejercer tus derechos de acceso, rectificación, supresión, limitación, portabilidad y oposición contactándonos en la dirección indicada anteriormente.</p>

        <h2 className="font-serif text-xl font-semibold text-foreground mt-8">7. Seguridad</h2>
        <p>Aplicamos medidas técnicas y organizativas adecuadas para proteger tus datos personales contra el acceso no autorizado, la alteración o la destrucción.</p>
      </div>

      <div className="mt-12">
        <Link to="/" className="text-primary hover:underline text-sm">← Volver al inicio</Link>
      </div>
    </div>
  </main>
);

export default PrivacyPolicy;
