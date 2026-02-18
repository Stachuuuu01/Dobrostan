// functions/stats/_middleware.js
export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);
  const cookie = request.headers.get("Cookie") || "";

  if (cookie.includes("auth=zalogowany")) {
    return next();
  }

  if (request.method === "POST") {
    const formData = await request.formData();
    const user = formData.get("user");
    const pass = formData.get("pass");

    try {
      // Używamy env.DB, które właśnie podpiąłeś w panelu
      const admin = await env.DB.prepare(
        "SELECT * FROM Administratorzy WHERE login = ? AND haslo = ?"
      ).bind(user, pass).first();

      if (admin) {
        // Aktualizacja daty ostatniego logowania (skoro masz taką kolumnę na screenie)
        const now = new Date().toISOString();
        await env.DB.prepare(
          "UPDATE Administratorzy SET ostatnie_logowanie = ? WHERE id = ?"
        ).bind(now, admin.id).run();

        return new Response(null, {
          status: 302,
          headers: {
            "Location": url.pathname,
            "Set-Cookie": "auth=zalogowany; Path=/stats; HttpOnly; SameSite=Strict; Max-Age=3600"
          }
        });
      } else {
        return new Response("Błędny login lub hasło!", { status: 403 });
      }
    } catch (e) {
      // Jeśli tu wejdzie, to znaczy że Binding wciąż nie działa
      return new Response("Błąd: " + e.message + ". Sprawdź Binding DB w panelu Cloudflare!", { status: 500 });
    }
  }

  // Formularz logowania
  return new Response(`
    <body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;background:#f4f4f4">
      <form method="POST" style="background:#fff;padding:40px;border-radius:10px;box-shadow:0 4px-10px rgba(0,0,0,0.1)">
        <h2 style="margin-top:0">Dobrostan Admin</h2>
        <input type="text" name="user" placeholder="Login" required style="display:block;width:100%;margin-bottom:10px;padding:10px"><br>
        <input type="password" name="pass" placeholder="Hasło" required style="display:block;width:100%;margin-bottom:20px;padding:10px"><br>
        <button type="submit" style="width:100%;padding:10px;background:#28a745;color:#fff;border:none;border-radius:5px;cursor:pointer">Zaloguj</button>
      </form>
    </body>
  `, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
}
