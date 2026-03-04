const express = require('express');
const router = express.Router();
const db = require('../db'); // Upewnij się, że ścieżka do db.js jest poprawna

router.get('/', (req, res) => {
    const { type, filter } = req.query;

    if (type === 'list') {
        db.query("SELECT DISTINCT kto FROM Wyniki", (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results.map(r => r.kto));
        });
    } else {
        // Pobieramy nastroj, kto i date, aby popup miał co wyświetlić
        let query = "SELECT nastroj, kto, data_dodania FROM Wyniki";
        let params = [];

        if (filter && filter !== 'all') {
            query += " WHERE kto = ?";
            params.push(filter);
        }

        db.query(query, params, (err, results) => {
            if (err) return res.status(500).json({ error: err.message });

            // Formujemy obiekt JSON, który zrozumie frontend
            res.json({
                dobrze: results.filter(r => r.nastroj === 'dobrze').length,
                zle: results.filter(r => r.nastroj === 'zle').length,
                fatalnie: results.filter(r => r.nastroj === 'fatalnie').length,
                historia: results // To wypełni popup
            });
        });
    }
});

module.exports = router;
