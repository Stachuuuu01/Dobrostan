export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);
  const cookie = request.headers.get("Cookie") || "";

  // 1. Sprawdź czy użytkownik ma już ciastko sesji
  if (cookie.includes("auth=zalogowany")) {
    return next(); // Pokaż statystyki
  }

  // 2. Obsługa wysłanego formularza (metoda POST)
  if (request.method === "POST") {
    const formData = await request.formData();
    const user = formData.get("user");
    const pass = formData.get("pass");

    // TUTAJ USTAW SWOJE DANE:
    if (user === "admin" && pass === "TwojeHaslo123") {
      return new Response(null, {
        status: 302,
        headers: {
          "Location": url.pathname,
          "Set-Cookie": "auth=zalogowany; Path=/stats; HttpOnly; SameSite=Strict"
        }
      });
    } else {
      return new Response("Błędny login lub hasło!", { status: 403 });
    }
  }

  // 3. Jeśli nie zalogowany, pokaż prosty formularz logowania
  return new Response(`
    <html>
      <body style="font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #f0f2f5;">
        <form method="POST" style="background: white; padding: 2rem; border-radius: 8px; shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2>Panel Statystyk</h2>
          <input type="text" name="user" placeholder="Login" required style="display:block; margin-bottom: 10px; padding: 8px; width: 200px;"><br>
          <input type="password" name="pass" placeholder="Hasło" required style="display:block; margin-bottom: 10px; padding: 8px; width: 200px;"><br>
          <button type="submit" style="width: 100%; padding: 10px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">Zaloguj</button>
        </form>
      </body>
    </html>
  `, {
    headers: { "Content-Type": "text/html;charset=UTF-8" }
  });
}