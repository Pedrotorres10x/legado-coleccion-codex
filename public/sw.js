// Service Worker for Push Notifications - RK Legado

const SITE_ORIGIN = self.location.origin;

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = { title: "RK Legado", body: "Tienes una nueva notificación" };

  try {
    if (event.data) {
      const text = event.data.text();
      data = JSON.parse(text);
    }
  } catch (e) {
    console.error("Error parsing push data:", e);
  }

  const urlRaw = data.url || "/";
  // Ensure absolute URL for openWindow
  const absoluteUrl = urlRaw.startsWith("http") ? urlRaw : SITE_ORIGIN + urlRaw;

  const options = {
    body: data.body || "",
    icon: data.icon || "/favicon.ico",
    badge: "/favicon.ico",
    vibrate: [100, 50, 100],
    data: {
      url: absoluteUrl,
      ...data.data,
    },
    actions: [
      { action: "open", title: "Ver" },
      { action: "close", title: "Cerrar" },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "RK Legado", options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "close") return;

  const url = event.notification.data?.url || SITE_ORIGIN;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        // Try to focus an existing window and navigate it
        for (const client of clients) {
          if ("focus" in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        // No existing window — open a new one
        return self.clients.openWindow(url);
      })
  );
});
