export async function onRequestPost(context) {
  try {
    const { user, pass } = await context.request.json();

    // Zmieniono na 'Administratorzy' zgodnie z Twoim screenem
    const { results } = await context.env.baza.prepare(
      "SELECT * FROM Administratorzy WHERE login = ? AND haslo = ?"
    )
    .bind(user, pass)
    .all();

    if (results && results.length > 0) {
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ error: "Błędne dane" }), { status: 401 });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: "Błąd bazy: " + err.message }), { status: 500 });
  }
}
