export async function onRequestPost(context) {
  try {
    const { tabela, kod } = await context.request.json();

    // Dynamicznie wybieramy tabelę (np. 1TEG1 lub Nauczyciele)
    // UWAGA: kod musi być w kolumnie o nazwie 'kod'
    const { results } = await context.env.baza.prepare(
      `SELECT * FROM ${tabela} WHERE kod = ?`
    )
    .bind(kod)
    .all();

    if (results && results.length > 0) {
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ error: "Błędny kod" }), { status: 401 });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
