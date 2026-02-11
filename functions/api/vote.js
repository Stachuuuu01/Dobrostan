export async function onRequestPost(context) {
  try {
    const { nastroj, tabela } = await context.request.json();
    const db = context.env.baza; 

    // Poprawione nazwy kolumn: kto, data_dodania
    await db.prepare(
      "INSERT INTO Wyniki (nastroj, kto, data_dodania) VALUES (?, ?, ?)"
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
