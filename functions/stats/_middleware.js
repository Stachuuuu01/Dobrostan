export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);
  const cookie = request.headers.get("Cookie") || "";

  // Sprawdzamy, czy użytkownik już jest zalogowany
  if (cookie.includes("auth=zalogowany")) {
    return next();
  }

  if (request.method === "POST") {
    const formData = await request.formData();
    const user = formData.get("user");
    const pass = formData.get("pass");

    // Sprawdzamy, czy 'env.DB' w ogóle istnieje (czy Binding zadziałał)
    if (!env.DB) {
      return new Response("Błąd: Brak połączenia z bazą danych (Binding DB nie został ustawiony w panelu Cloudflare).", { status: 500 });
    }

    try {
      // Szukamy w tabeli Administratorzy (zgodnie z Twoim screenem)
      const admin = await env.DB.prepare(
        "SELECT * FROM Administratorzy WHERE login = ? AND haslo = ?"
      ).bind(user, pass).first();

      if (admin) {
        // Aktualizacja daty logowania (zgodnie z kolumną ostatnie_logowanie na screenie)
        const now = new Date().toLocaleString('pl-PL'); 
        await env.DB.prepare(
          "UPDATE Administratorzy SET ostatnie_logowanie = ? WHERE id = ?"
        ).bind(now, admin.id).run();

        return new Response(null, {
          status: 302,
          headers: {
            "Location": url.pathname,
            "Set-Cookie": "auth=zalogowany; Path=/; HttpOnly; SameSite=Strict; Max-Age=3600"
          }
        });
      } else {
        return new Response("Błędne dane! Spróbuj ponownie.", { status: 403 });
      }
    } catch (e) {
      return new Response("Błąd bazy: " + e.message, { status: 500 });
    }
  }

  // Prosty formularz logowania
  return new Response(`
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>Logowanie - Dobrostan</title></head>
    <body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;background:#2c3e50;color:white;margin:0;">
      <form method="POST" style="background:#34495e;padding:40px;border-radius:10px;box-shadow:0 10px 25px rgba(0,0,0,0.3);width:300px;">
        <h2 style="text-align:center;margin-bottom:20px;">Admin Panel</h2>
        <input type="text" name="user" placeholder="Login" required style="width:100%;padding:10px;margin-bottom:10px;border-radius:5px;border:none;">
        <input type="password" name="pass" placeholder="Hasło" required style="width:100%;padding:10px;margin-bottom:20px;border-radius:5px;border:none;">
        <button type="submit" style="width:100%;padding:10px;background:#27ae60;color:white;border:none;border-radius:5px;cursor:pointer;font-weight:bold;">Zaloguj</button>
      </form>
    </body>
    </html>
  `, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
}
