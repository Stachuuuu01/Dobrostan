export async function onRequestPost(context) {
  try {
    const { nastroj, tabela } = await context.request.json();

    if (!context.env.baza) {
      return new Response(JSON.stringify({ error: "Błąd bindingu bazy" }), { status: 500 });
    }

    // Wstawiamy rekord do tabeli 'Wyniki'
    // Używamy formatu daty, który SQLite lubi najbardziej
    await context.env.baza.prepare(
      "INSERT INTO Wyniki (nastroj, klasa, data) VALUES (?, ?, ?)"
    )
    .bind(nastroj, tabela, new Date().toISOString())
    .run();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: "Błąd zapisu: " + err.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
