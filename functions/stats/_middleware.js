export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);
  const cookie = request.headers.get("Cookie") || "";

  // 1. Sprawdź czy użytkownik ma już ciastko sesji
  if (cookie.includes("auth=zalogowany")) {
    return next();
  }

  // 2. Obsługa logowania (POST)
  if (request.method === "POST") {
    const formData = await request.formData();
    const user = formData.get("user");
    const pass = formData.get("pass");

    try {
      // Szukamy administratora w tabeli Administratorzy
      const admin = await env.DB.prepare(
        "SELECT * FROM Administratorzy WHERE login = ? AND haslo = ?"
      ).bind(user, pass).first();

      if (admin) {
        // OPCJONALNIE: Aktualizacja daty "ostatnie_logowanie"
        const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
        await env.DB.prepare(
          "UPDATE Administratorzy SET ostatnie_logowanie = ? WHERE id = ?"
        ).bind(now, admin.id).run();

        // Sukces: ustawiamy ciastko i przekierowujemy na /stats
        return new Response(null, {
          status: 302,
          headers: {
            "Location": url.pathname,
            "Set-Cookie": "auth=zalogowany; Path=/stats; HttpOnly; SameSite=Strict; Max-Age=3600"
          }
        });
      } else {
        return new Response("Błędne dane logowania!", { status: 403 });
      }
    } catch (e) {
      return new Response("Błąd bazy D1: " + e.message, { status: 500 });
    }
  }

  // 3. Formularz logowania (możesz ostylować go pod kolorystykę Dobrostanu)
  return new Response(`
    <html>
      <head>
        <title>Dobrostan - Logowanie</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
      </head>
      <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #eef2f3; margin: 0;">
        <form method="POST" style="background: white; padding: 30px; border-radius: 15px; box-shadow: 0 8px 20px rgba(0,0,0,0.1); width: 100%; max-width: 350px;">
          <h2 style="text-align: center; color: #2c3e50; margin-top: 0;">Panel Admina</h2>
          <label style="font-size: 14px; color: #7f8c8d;">Login</label>
          <input type="text" name="user" required style="display:block; margin-bottom: 15px; padding: 12px; width: 100%; border: 1px solid #dcdde1; border-radius: 8px; box-sizing: border-box;">
          <label style="font-size: 14px; color: #7f8c8d;">Hasło</label>
          <input type="password" name="pass" required style="display:block; margin-bottom: 25px; padding: 12px; width: 100%; border: 1px solid #dcdde1; border-radius: 8px; box-sizing: border-box;">
          <button type="submit" style="width: 100%; padding: 12px; background: #27ae60; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.3s;">Zaloguj się</button>
        </form>
      </body>
    </html>
  `, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
}
