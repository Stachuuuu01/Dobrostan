export async function onRequestPost(context) {
  try {
    const { tabela, kod } = await context.request.json();

    // 1. Sprawdzamy czy baza jest podpięta
    if (!context.env.baza) {
      return new Response(JSON.stringify({ error: "Błąd konfiguracji bazy (Binding)" }), { status: 500 });
    }

    // 2. Logowanie - używamy nazwy tabeli przekazanej z frontendu (np. 1TEG1)
    // SQL potrzebuje cudzysłowu przy nazwach tabel zaczynających się od cyfr
    const query = `SELECT * FROM "${tabela}" WHERE kod = ?`;
    
    const { results } = await context.env.baza.prepare(query)
      .bind(kod)
      .all();

    if (results && results.length > 0) {
      return new Response(JSON.stringify({ success: true }), { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    } else {
      return new Response(JSON.stringify({ error: "Błędny kod dla klasy " + tabela }), { 
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

  } catch (err) {
    // Jeśli tabela nie istnieje, wywali ten błąd
    return new Response(JSON.stringify({ error: "Błąd systemu: " + err.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
