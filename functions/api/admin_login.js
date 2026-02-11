export async function onRequestPost(context) {
  try {
    const { user, pass } = await context.request.json();

    // Używamy dokładnej nazwy tabeli z Twojego screena: Administratorzy
    // Zakładam, że kolumny to 'login' i 'haslo'
    const { results } = await context.env.baza.prepare(
      "SELECT * FROM Administratorzy WHERE login = ? AND haslo = ?"
    )
    .bind(user, pass)
    .all();

    if (results && results.length > 0) {
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ error: "Błędny login lub hasło" }), { status: 401 });
    }
  } catch (err) {
    // Ten komunikat powie Ci dokładnie, czy np. kolumna się inaczej nazywa
    return new Response(JSON.stringify({ error: "Błąd bazy: " + err.message }), { status: 500 });
  }
}
