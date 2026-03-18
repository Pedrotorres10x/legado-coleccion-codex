import { Link } from "react-router-dom";

const CookiePolicy = () => (
  <main className="min-h-screen bg-background pt-28 pb-20">
    <div className="container max-w-3xl">
      <h1 className="font-serif text-4xl font-bold mb-8 text-foreground">Política de Cookies</h1>

      <div className="prose prose-invert max-w-none space-y-6 text-muted-foreground text-sm leading-relaxed">
        <p>Última actualización: {new Date().toLocaleDateString("es-ES")}</p>

        <h2 className="font-serif text-xl font-semibold text-foreground mt-8">1. ¿Qué son las cookies?</h2>
        <p>Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web. Se utilizan para recordar preferencias, mejorar la experiencia de navegación y, en algunos casos, con fines analíticos.</p>

        <h2 className="font-serif text-xl font-semibold text-foreground mt-8">2. Cookies que utilizamos</h2>
        
        <h3 className="font-serif text-lg font-semibold text-foreground mt-4">Cookies técnicas (necesarias)</h3>
        <p>Son imprescindibles para el funcionamiento del sitio web. Permiten la navegación y el uso de funciones básicas como la sesión de usuario y las preferencias de idioma.</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong className="text-foreground">cookie_consent</strong> — Almacena tu preferencia de cookies. Duración: 1 año.</li>
          <li><strong className="text-foreground">language</strong> — Guarda la preferencia de idioma seleccionada. Duración: sesión.</li>
        </ul>

        <h3 className="font-serif text-lg font-semibold text-foreground mt-4">Cookies analíticas (opcionales)</h3>
        <p>Nos permiten entender cómo los visitantes interactúan con el sitio web, ayudándonos a mejorar su funcionamiento y contenido.</p>

        <h2 className="font-serif text-xl font-semibold text-foreground mt-8">3. Gestión de cookies</h2>
        <p>Puedes aceptar o rechazar las cookies no esenciales desde el banner que aparece al visitar nuestro sitio por primera vez. También puedes configurar tu navegador para bloquear o eliminar cookies en cualquier momento.</p>
        <p>Ten en cuenta que desactivar algunas cookies puede afectar la funcionalidad del sitio web.</p>

        <h2 className="font-serif text-xl font-semibold text-foreground mt-8">4. Cómo eliminar cookies</h2>
        <p>Puedes eliminar las cookies almacenadas en tu navegador accediendo a la configuración de privacidad del mismo:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong className="text-foreground">Chrome:</strong> Configuración → Privacidad y seguridad → Cookies</li>
          <li><strong className="text-foreground">Firefox:</strong> Opciones → Privacidad y seguridad → Cookies</li>
          <li><strong className="text-foreground">Safari:</strong> Preferencias → Privacidad → Gestionar datos</li>
        </ul>

        <h2 className="font-serif text-xl font-semibold text-foreground mt-8">5. Más información</h2>
        <p>Para más información sobre el tratamiento de tus datos, consulta nuestra <Link to="/privacidad" className="text-primary hover:underline">Política de Privacidad</Link>.</p>
      </div>

      <div className="mt-12">
        <Link to="/" className="text-primary hover:underline text-sm">← Volver al inicio</Link>
      </div>
    </div>
  </main>
);

export default CookiePolicy;
