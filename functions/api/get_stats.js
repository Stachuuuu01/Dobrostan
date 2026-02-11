export async function onRequestGet(context) {
  try {
    // Zmieniono na 'Wyniki' zgodnie z Twoim screenem
    const dobrze = await context.env.baza.prepare("SELECT COUNT(*) as count FROM Wyniki WHERE nastroj = 'dobrze'").first('count');
    const zle = await context.env.baza.prepare("SELECT COUNT(*) as count FROM Wyniki WHERE nastroj = 'zle'").first('count');
    const fatalnie = await context.env.baza.prepare("SELECT COUNT(*) as count FROM Wyniki WHERE nastroj = 'fatalnie'").first('count');

    return new Response(JSON.stringify({
      dobrze: dobrze || 0,
      zle: zle || 0,
      fatalnie: fatalnie || 0
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
