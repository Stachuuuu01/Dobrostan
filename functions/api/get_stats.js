export async function onRequestGet(context) {
  try {
    const db = context.env.baza;
    const { searchParams } = new URL(context.request.url);
    const filter = searchParams.get('filter') || 'all';

    let query = "SELECT nastroj, COUNT(*) as count FROM Wyniki";
    let params = [];

    // Używamy kolumny 'kto' zamiast 'klasa'
    if (filter !== 'all') {
      query += " WHERE kto = ?";
      params.push(filter);
    }

    query += " GROUP BY nastroj";

    const results = await db.prepare(query).bind(...params).all();
    
    // Tworzymy obiekt z wynikami, upewniając się, że nazwy nastrojów pasują (dobrze, zle, fatalnie)
    const stats = { dobrze: 0, zle: 0, fatalnie: 0 };
    results.results.forEach(row => {
      if (stats.hasOwnProperty(row.nastroj)) {
        stats[row.nastroj] = row.count;
      }
    });

    return new Response(JSON.stringify(stats), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
