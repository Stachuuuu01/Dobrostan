const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
    const { type, filter } = req.query;

    if (type === 'list') {
        db.query("SELECT DISTINCT kto FROM Wyniki", (err, results) => {
            if (err) return res.status(500).send(err);
            res.json(results.map(r => r.kto));
        });
    } else {
        let query = "SELECT * FROM Wyniki"; // Pobieramy wszystko, żeby mieć historię
        let params = [];

        if (filter && filter !== 'all') {
            query += " WHERE kto = ?";
            params.push(filter);
        }

        db.query(query, params, (err, results) => {
            if (err) return res.status(500).send(err);

            // Obliczamy statystyki na podstawie pobranych danych
            const stats = {
                dobrze: results.filter(r => r.nastroj === 'dobrze').length,
                zle: results.filter(r => r.nastroj === 'zle').length,
                fatalnie: results.filter(r => r.nastroj === 'fatalnie').length,
                historia: results // DODAJEMY TO: cała lista dla popupu
            };
            res.json(stats);
        });
    }
});

module.exports = router;
