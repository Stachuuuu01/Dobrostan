export async function onRequestPost(context) {
  try {
    // 1. Pobranie loginu i hasła z żądania (wysłane przez fetch w index.html)
    const { user, pass } = await context.request.json();

    // 2. Zapytanie do bazy D1 (podpiętej pod nazwę 'baza')
    // SZUKAMY W TABELI 'admini' - upewnij się, że tak ją nazwałeś w Cloudflare D1!
    const { results } = await context.env.baza.prepare(
      "SELECT * FROM admini WHERE login = ? AND haslo = ?"
    )
    .bind(user, pass)
    .all();

    // 3. Logika weryfikacji
    if (results && results.length > 0) {
      // ZNALEZIONO ADMINA
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } else {
      // NIE ZNALEZIONO ADMINA (błędne dane)
      return new Response(JSON.stringify({ error: "Błędne dane logowania" }), { 
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

  } catch (err) {
    // BŁĄD TECHNICZNY (np. brak tabeli 'admini' lub błąd Bindingu 'baza')
    return new Response(JSON.stringify({ error: "Błąd serwera: " + err.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
