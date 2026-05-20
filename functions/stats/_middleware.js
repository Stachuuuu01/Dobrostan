export async function onRequest(context) {
  const { request, next, env } = context;
  const url = new URL(request.url);
  const cookie = request.headers.get("Cookie") || "";

  // 1. Sprawdzamy ciastko
  if (cookie.includes("auth=zalogowany")) {
    return next();
  }

  // 2. Obsługa logowania
  if (request.method === "POST") {
    const formData = await request.formData();
    const user = formData.get("user");
    const pass = formData.get("pass");

    // SPRAWDZENIE POŁĄCZENIA - To tu wywala Ci błąd!
    if (!env.DB) {
      return new Response("BŁĄD KONFIGURACJI: Wejdź w Settings -> Functions -> D1 Bindings i dodaj bazę pod nazwą 'DB'.", { status: 500 });
    }

    try {
      // Logika pobrana z Twojej tabeli Administratorzy
      const admin = await env.DB.prepare(
        "SELECT * FROM Administratorzy WHERE login = ? AND haslo = ?"
      ).bind(user, pass).first();

      if (admin) {
        // Jeśli logowanie pyknie, ustawiamy ciastko
        return new Response(null, {
          status: 302,
          headers: {
            "Location": url.pathname,
            "Set-Cookie": "auth=zalogowany; Path=/; HttpOnly; SameSite=Strict; Max-Age=3600"
          }
        });
      } else {
        return new Response("Nieprawidłowe dane administratora.", { status: 403 });
      }
    } catch (e) {
      return new Response("Błąd zapytania do bazy: " + e.message, { status: 500 });
    }
  }

  // 3. Prosty formularz logowania (Twoja bramka)
  return new Response(`
    <!DOCTYPE html>
    <html lang="pl">
    <head><meta charset="UTF-8"><title>Dobrostan - Logowanie</title></head>
    <body style="display:flex;justify-content:center;align-items:center;height:100vh;background:#1a1a1a;color:white;font-family:sans-serif;">
      <form method="POST" style="background:#2a2a2a;padding:30px;border-radius:10px;width:300px;text-align:center;">
        <h2>Dostęp zastrzeżony</h2>
        <input type="text" name="user" placeholder="Login" required style="width:100%;padding:10px;margin-bottom:10px;border-radius:5px;border:none;">
        <input type="password" name="pass" placeholder="Hasło" required style="width:100%;padding:10px;margin-bottom:20px;border-radius:5px;border:none;">
        <button type="submit" style="width:100%;padding:10px;background:#007bff;color:white;border:none;border-radius:5px;cursor:pointer;">Zaloguj jako Admin</button>
      </form>
    </body>
    </html>
  `, { headers: { "Content-Type": "text/html;charset=UTF-8" } });
}
