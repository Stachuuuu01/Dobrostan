export async function onRequestPost(context) {
  try {
    const db = context.env.baza;
    const { filter } = await context.request.json();

    let query = "DELETE FROM Wyniki";
    let params = [];

    if (filter && filter !== 'all') {
      query += " WHERE kto = ?";
      params.push(filter);
    }

    await db.prepare(query).bind(...params).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
