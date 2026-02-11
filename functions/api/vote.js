export async function onRequestPost(context) {
  try {
    const { nastroj, tabela } = await context.request.json();

    // Wstawiamy głos do tabeli Wyniki (z wielkiej litery!)
    await context.env.baza.prepare(
      "INSERT INTO Wyniki (nastroj, klasa, data) VALUES (?, ?, ?)"
    )
    .bind(nastroj, tabela, new Date().toLocaleString("pl-PL"))
    .run();

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Nie udało się zapisać głosu: " + err.message }), { status: 500 });
  }
}
