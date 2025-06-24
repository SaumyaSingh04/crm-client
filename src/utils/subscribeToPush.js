export const subscribeToPush = async (event) => {
    console.log("📥 Push received", event);
    const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || "BNBdWAarZ9L7teJhcjSjSrbqKkATfqLxPyQsETO8A-TvPaSI3fpW1LJ9igcnSD6JCbKO8tkf5L-qvUYExoVnG7Q";
    
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("🚫 Notification permission not granted");
      return;
    }
    
    if ("serviceWorker" in navigator && "PushManager" in window) {
      try {
        const registration = await navigator.serviceWorker.register("/service-worker.js");
  
        const existingSubscription = await registration.pushManager.getSubscription();
        if (existingSubscription) return; // Already subscribed
  
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
  
        // Save to backend
        await fetch("http://localhost:5000/api/push/subscribe", {
          method: "POST",
          body: JSON.stringify(subscription),
          headers: {
            "Content-Type": "application/json",
          },
        });
  
        console.log("✅ Push subscribed and sent to backend");
      } catch (err) {
        console.error("❌ Push subscription failed:", err);
      }
    } else {
      console.warn("🚫 Push messaging is not supported");
    }
  };
  
  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }