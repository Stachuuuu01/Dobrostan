export async function onRequestPost(context) {
    const { request, env } = context;
    const { user, pass } = await request.json();

    try {
        // Używamy "baza", bo tak nazwałeś to w panelu Cloudflare
        const admin = await env.baza.prepare("SELECT * FROM Administratorzy WHERE login = ? AND haslo = ?")
            .bind(user, pass)
            .first();

        if (admin) {
            // W prawdziwym systemie tutaj ustawia się ciasteczko sesji
            return new Response(JSON.stringify({ success: true }), { status: 200 });
        }
        return new Response(JSON.stringify({ success: false }), { status: 401 });
    } catch (e) {
        return new Response(e.message, { status: 500 });
    }
}
