export async function onRequestGet(context) {
  try {
    const db = context.env.baza;
    const { searchParams } = new URL(context.request.url);
    const filter = searchParams.get('filter') || 'all';
    const type = searchParams.get('type');
    const details = searchParams.get('details') === 'true';

    // Lista klas do dropdowna
    if (type === 'list') {
      const { results } = await db.prepare(
        "SELECT DISTINCT kto FROM Wyniki WHERE kto IS NOT NULL"
      ).all();
      const list = results.map(row => row.kto);
      return new Response(JSON.stringify(list), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // Statystyki zbiorcze (liczniki)
    let countQuery = "SELECT nastroj, COUNT(*) as count FROM Wyniki";
    let params = [];

    if (filter !== 'all') {
      countQuery += " WHERE kto = ?";
      params.push(filter);
    }

    countQuery += " GROUP BY nastroj";

    const countResult = await db.prepare(countQuery).bind(...params).all();

    const stats = { dobrze: 0, zle: 0, fatalnie: 0 };
    countResult.results.forEach(row => {
      if (stats.hasOwnProperty(row.nastroj)) {
        stats[row.nastroj] = row.count;
      }
    });

    // Szczegółowe głosy (dla panelu admina)
    if (details) {
      let rawQuery = "SELECT kto, nastroj, powod, data_dodania FROM Wyniki";
      let rawParams = [];

      if (filter !== 'all') {
        rawQuery += " WHERE kto = ?";
        rawParams.push(filter);
      }

      rawQuery += " ORDER BY data_dodania DESC";

      const rawResult = await db.prepare(rawQuery).bind(...rawParams).all();

      // Mapujemy kolumnę data_dodania -> kiedy, żeby frontend działał
      const raw_votes = rawResult.results.map(row => ({
        kto: row.kto,
        nastroj: row.nastroj,
        powod: row.powod || null,
        kiedy: row.data_dodania
      }));

      return new Response(JSON.stringify({ ...stats, raw_votes }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify(stats), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
