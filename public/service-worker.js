// public/service-worker.js
self.addEventListener("push", (event) => {
    console.log("✅ Subscribed to push successfully");
  
    event.waitUntil(
      (async () => {
        try {
          const payloadText = event.data ? await event.data.text() : "{}";
          console.log("📦 Payload text:", payloadText);
  
          const data = JSON.parse(payloadText);
  
          const title = data.title || "CRM Notification";
          const options = {
            body: data.body || "You have an upcoming meeting.",
            // Remove icons if not needed or don't exist
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
  