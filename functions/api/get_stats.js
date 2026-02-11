export async function onRequestGet(context) {
  try {
    // Sprawdzamy połączenie (na wszelki wypadek)
    if (!context.env.baza) {
      return new Response(JSON.stringify({ error: "Brak bazy" }), { status: 500 });
    }

    // Pobieramy zliczanie głosów z Twojej tabeli 'Wyniki'
    // Zwróć uwagę na wielką literę w nazwie tabeli!
    const stats = await context.env.baza.prepare(`
      SELECT 
        SUM(CASE WHEN nastroj = 'dobrze' THEN 1 ELSE 0 END) as dobrze,
        SUM(CASE WHEN nastroj = 'zle' THEN 1 ELSE 0 END) as zle,
        SUM(CASE WHEN nastroj = 'fatalnie' THEN 1 ELSE 0 END) as fatalnie
      FROM Wyniki
    `).first();

    // Jeśli tabela jest pusta, zwracamy zera, żeby się nic nie wywaliło
    const result = {
      dobrze: stats.dobrze || 0,
      zle: stats.zle || 0,
      fatalnie: stats.fatalnie || 0
    };

    return new Response(JSON.stringify(result), {
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "no-cache" // Żeby przeglądarka nie pamiętała starych zer
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: "Błąd statystyk: " + err.message }), { status: 500 });
  }
}
