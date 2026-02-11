export async function onRequestGet(context) {
  try {
    const db = context.env.baza; // Twoja nazwa bindingu

    // Pobieramy dane z Twojej tabeli 'Wyniki'
    const data = await db.prepare(`
      SELECT 
        COUNT(*) as suma,
        SUM(CASE WHEN nastroj = 'dobrze' THEN 1 ELSE 0 END) as dobrze,
        SUM(CASE WHEN nastroj = 'zle' THEN 1 ELSE 0 END) as zle,
        SUM(CASE WHEN nastroj = 'fatalnie' THEN 1 ELSE 0 END) as fatalnie
      FROM Wyniki
    `).first();

    const result = {
      suma: data.suma || 0,
      dobrze: data.suma ? Math.round((data.dobrze / data.suma) * 100) : 0,
      zle: data.suma ? Math.round((data.zle / data.suma) * 100) : 0,
      fatalnie: data.suma ? Math.round((data.fatalnie / data.suma) * 100) : 0
    };

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
