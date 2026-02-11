export async function onRequestPost(context) {
    const { request, env } = context;
    const { mood, who } = await request.json();

    await env.DB.prepare("INSERT INTO Wyniki (nastroj, kto) VALUES (?, ?)")
        .bind(mood, who)
        .run();

    return new Response(JSON.stringify({ success: true }), { status: 200 });
}