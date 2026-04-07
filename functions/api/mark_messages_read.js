export async function onRequestPost(context) {
  try {
    const { kod, klasa } = await context.request.json();

    if (!kod && !klasa) {
      return new Response(JSON.stringify({ error: "Brak kodu lub klasy" }), { status: 400 });
    }

    const db = context.env.baza;

    if (kod) {
      await db.prepare(
        "UPDATE Wiadomosci SET przeczytana = 1 WHERE kod_odbiorcy = ? AND przeczytana = 0"
      ).bind(kod).run();
    }

    if (klasa) {
      await db.prepare(
        "UPDATE Wiadomosci SET przeczytana = 1 WHERE klasa_odbiorcy = ? AND przeczytana = 0"
      ).bind(klasa).run();
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
