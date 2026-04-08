import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  try {
    // Pobieramy unikalne kody odbiorców z tabeli wiadomości lub osobnej tabeli użytkowników
    const { rows } = await sql`SELECT DISTINCT kod_odbiorcy FROM Messages ORDER BY kod_odbiorcy ASC;`;
    
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(rows);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
