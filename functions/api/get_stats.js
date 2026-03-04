export async function onRequestGet(context) {
  try {
    const db = context.env.baza;
    const { searchParams } = new URL(context.request.url);
    const filter = searchParams.get('filter') || 'all';
    const type = searchParams.get('type');

    // NOWOŚĆ: Pobieranie listy wszystkich klas/osób do dropdowna
    if (type === 'list') {
      const { results } = await db.prepare("SELECT DISTINCT kto FROM Wyniki WHERE kto IS NOT NULL").all();
      const list = results.map(row => row.kto);
      return new Response(JSON.stringify(list), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // Logika statystyk (bez zmian, tylko dopasowana do Twojej bazy)
    let query = "SELECT nastroj, COUNT(*) as count FROM Wyniki";
    let params = [];

    if (filter !== 'all') {
      query += " WHERE kto = ?";
      params.push(filter);
    }

    query += " GROUP BY nastroj";

    const results = await db.prepare(query).bind(...params).all();
    
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
  // Fragment get_stats.js
// ... (logika połączenia z bazą MySQL)

router.get('/get_stats', async (req, res) => {
    const filter = req.query.filter;
    let query = "SELECT * FROM Wyniki";
    let params = [];

    if (filter && filter !== 'all') {
        query += " WHERE kto = ?";
        params.push(filter);
    }

    db.query(query, params, (err, results) => {
        if (err) return res.status(500).json({ error: err });

        // Obliczamy sumy dla kart statystyk
        const dobrze = results.filter(r => r.nastroj === 'dobrze').length;
        const zle = results.filter(r => r.nastroj === 'zle').length;
        const fatalnie = results.filter(r => r.nastroj === 'fatalnie').length;

        // WYSYŁAMY WSZYSTKO: sumy ORAZ pełną listę (results)
        res.json({
            dobrze: dobrze,
            zle: zle,
            fatalnie: fatalnie,
            historia: results // To jest kluczowe dla popupu!
        });
    });
});
}
