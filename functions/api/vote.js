export async function onRequestPost(context) {
  try {
    const { nastroj, tabela, powod } = await context.request.json();
    const db = context.env.baza;

    await db.prepare(
      "INSERT INTO Wyniki (nastroj, kto, powod, data_dodania) VALUES (?, ?, ?, ?)"
    )
    .bind(nastroj, tabela, powod || null, new Date().toISOString())
    .run();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
