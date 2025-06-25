// public/service-worker.js

self.addEventListener("push", (event) => {
  console.log("✅ Push event received");

  event.waitUntil(
    (async () => {
      try {
        const payloadText = event.data ? await event.data.text() : "{}";
        console.log("📦 Push payload:", payloadText);

        // Parse JSON safely
        const data = JSON.parse(payloadText);

        // Prepare notification
        const title = data.title || "CRM Notification";
        const options = {
          body: data.body || "You have an update.",
          // Uncomment and update if you have icons
          // icon: "/icons/icon-192x192.png",
          // badge: "/icons/badge.png",
          data: data,
        };

        await self.registration.showNotification(title, options);
      } catch (err) {
        console.error("❌ Error parsing push payload:", err.message);
      }
    })()
  );
});
