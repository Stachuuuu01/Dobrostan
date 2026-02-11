export async function onRequestGet(context) {
    const { env } = context;

    try {
        // Pobieramy wszystkie dane z tabeli Wyniki
        const { results } = await env.baza.prepare("SELECT nastroj, kto, COUNT(*) as ilosc FROM Wyniki GROUP BY nastroj, kto").all();

        const stats = { dobrze: 0, zle: 0, fatalnie: 0, total: 0 };
        const classWise = {};

        results.forEach(row => {
            const m = row.nastroj;
            const kto = row.kto;
            const ile = row.ilosc;

            stats[m] += ile;
            stats.total += ile;

            if (!classWise[kto]) classWise[kto] = { dobrze: 0, zle: 0, fatalnie: 0 };
            classWise[kto][m] = ile;
        });

        return new Response(JSON.stringify({ stats, classWise }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (e) {
        return new Response(e.message, { status: 500 });
    }
}
