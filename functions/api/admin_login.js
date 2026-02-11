export async function onRequestPost(context) {
  try {
    const { user, pass } = await context.request.json();

    // To zapytanie jest "bezpieczniejsze" - sprawdza czy w ogóle tabela odpowiada
    // Zmieniłem nazwy kolumn na najczęstsze angielskie. 
    // JEŚLI MASZ INNE, ZMIEŃ JE W LINII PONIŻEJ (po WHERE)
    const stmt = context.env.baza.prepare("SELECT * FROM Administratorzy WHERE login = ? AND haslo = ?");
    
    const { results } = await stmt.bind(user, pass).all();

    if (results && results.length > 0) {
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    } else {
      return new Response(JSON.stringify({ 
        // To wyśle informację, że tabela jest OK, ale login/hasło nie pasuje
        error: "Nie znaleziono takiego admina (sprawdź wielkość liter w loginie/haśle)" 
      }), { status: 401 });
    }

  } catch (err) {
    // TO JEST NAJWAŻNIEJSZE:
    // Ten kod odeśle Ci DOKŁADNĄ treść błędu SQL.
    // Jeśli zobaczysz "no such column: login", to znaczy że kolumna nazywa się inaczej!
    return new Response(JSON.stringify({ error: "BŁĄD SQL: " + err.message }), { status: 500 });
  }
}
