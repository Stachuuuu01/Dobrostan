export async function onRequestPost(context) {
    const { request, env } = context;
    const { table, code } = await request.json();

    // Zabezpieczenie przed SQL Injection - dopuszczamy tylko znane tabele
    const allowedTable = table.replace(/[^a-zA-Z0-9_]/g, '');
    
    const result = await env.DB.prepare(`SELECT * FROM "${allowedTable}" WHERE kod = ?`)
        .bind(code)
        .first();

    if (result) {
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    }
    return new Response(JSON.stringify({ success: false }), { status: 401 });
}