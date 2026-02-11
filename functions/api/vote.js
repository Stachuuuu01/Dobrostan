export async function onRequestPost(context) {
  try {
    // 1. Pobieramy dane wysłane z formularza
    const { nastroj, tabela } = await context.request.json();
    
    // 2. Łączymy się z bazą (używając nazwy 'baza')
    const db = context.env.baza; 

    if (!db) {
      return new Response(JSON.stringify({ error: "Nie znaleziono połączenia 'baza' w ustawieniach Cloudflare." }), { status: 500 });
    }

    // 3. Wstawiamy głos do tabeli 'Wyniki'
    // Upewnij się, że tabela w D1 nazywa się 'Wyniki' (z dużej litery)
    await db.prepare(
      "INSERT INTO Wyniki (nastroj, klasa, data) VALUES (?, ?, ?)"
    )
    .bind(nastroj, tabela, new Date().toISOString())
    .run();

    return new Response(JSON.stringify({ success: true }), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    // Jeśli tu trafimy, w konsoli zobaczymy dokładny opis błędu
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
