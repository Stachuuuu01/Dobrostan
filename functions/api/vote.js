export async function onRequestPost(context) {
  try {
    const { nastroj, tabela } = await context.request.json();
    const db = context.env.baza;

    // Dodajemy wpis do bazy
    await db.prepare(
      "INSERT INTO Wyniki (nastroj, klasa, data) VALUES (?, ?, ?)"
    )
    .bind(nastroj, tabela, new Date().toISOString())
    .run();

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Błąd zapisu: " + err.message }), { status: 500 });
  }
}
