// api/reset_stats.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Tylko metoda POST' });
    }

    const { filter } = req.body;

    try {
        // TUTAJ WSTAW SWOJĄ LOGIKĘ CZYSZCZENIA BAZY
        // Przykład dla bazy SQL: 
        // if(filter === 'all') await db.query('DELETE FROM votes');
        // else await db.query('DELETE FROM votes WHERE klasa = ?', [filter]);

        console.log(`Resetowanie danych dla: ${filter}`);
        
        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
