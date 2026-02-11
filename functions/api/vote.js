export async function onRequestPost(context) {
  try {
    const { nastroj, tabela } = await context.request.json();
    const db = context.env.baza; 

    if (!db) {
      return new Response(JSON.stringify({ error: "Brak połączenia z bazą 'baza'" }), { status: 500 });
    }

    // Używamy nazwy 'Wyniki' zgodnie z Twoim screenem
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
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
