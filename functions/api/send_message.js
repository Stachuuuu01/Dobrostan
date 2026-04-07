export async function onRequestPost(context) {
  try {
    const { kod_odbiorcy, klasa_odbiorcy, tresc, od } = await context.request.json();

    if (!tresc || tresc.trim() === "") {
      return new Response(JSON.stringify({ error: "Brak treści wiadomości" }), { status: 400 });
    }

    if (!kod_odbiorcy && !klasa_odbiorcy) {
      return new Response(JSON.stringify({ error: "Brak identyfikatora odbiorcy" }), { status: 400 });
    }

    const db = context.env.baza;

    // Tworzymy tabelę jeśli nie istnieje (idempotentne)
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS Wiadomosci (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        kod_odbiorcy TEXT,
        klasa_odbiorcy TEXT,
        tresc TEXT NOT NULL,
        od TEXT DEFAULT 'Szkoła',
        przeczytana INTEGER DEFAULT 0,
        kiedy TEXT NOT NULL
      )
    `).run();

    await db.prepare(
      "INSERT INTO Wiadomosci (kod_odbiorcy, klasa_odbiorcy, tresc, od, przeczytana, kiedy) VALUES (?, ?, ?, ?, 0, ?)"
    )
    .bind(
      kod_odbiorcy || null,
      klasa_odbiorcy || null,
      tresc.trim(),
      od || "Szkoła",
      new Date().toISOString()
    )
    .run();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
