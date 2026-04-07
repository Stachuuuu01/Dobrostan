export async function onRequestPost(context) {
  try {
    const { kod, klasa } = await context.request.json();

    if (!kod && !klasa) {
      return new Response(JSON.stringify({ error: "Brak kodu lub klasy" }), { status: 400 });
    }

    const db = context.env.baza;

    // Tworzymy tabelę jeśli nie istnieje
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

    // Szukamy wiadomości pasujących po kodzie LUB klasie
    let results = [];

    if (kod) {
      // Najpierw sprawdzamy: czy kod istnieje w jakiejkolwiek tabeli klas?
      // Pobieramy wiadomości po kodzie odbiorcy
      const byKod = await db.prepare(
        "SELECT * FROM Wiadomosci WHERE kod_odbiorcy = ? ORDER BY kiedy DESC"
      ).bind(kod).all();
      results = byKod.results || [];
    }

    // Jeśli podano klasę (po zalogowaniu), też szukamy po klasie
    if (klasa) {
      const byKlasa = await db.prepare(
        "SELECT * FROM Wiadomosci WHERE klasa_odbiorcy = ? ORDER BY kiedy DESC"
      ).bind(klasa).all();
      const byKlasaResults = byKlasa.results || [];

      // Łączymy i deduplikujemy po id
      const ids = new Set(results.map(r => r.id));
      for (const r of byKlasaResults) {
        if (!ids.has(r.id)) results.push(r);
      }
      // Sortujemy ponownie po dacie
      results.sort((a, b) => new Date(b.kiedy) - new Date(a.kiedy));
    }

    // Zliczamy nieprzeczytane
    const unread = results.filter(m => !m.przeczytana).length;

    return new Response(JSON.stringify({
      success: true,
      messages: results,
      unread
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
