const db = context.env.baza;
const { searchParams } = new URL(context.request.url);
const filter = searchParams.get('filter') || 'all';
    const type = searchParams.get('type');

    // NOWOŚĆ: Pobieranie listy wszystkich klas/osób do dropdowna
    if (type === 'list') {
      const { results } = await db.prepare("SELECT DISTINCT kto FROM Wyniki WHERE kto IS NOT NULL").all();
      const list = results.map(row => row.kto);
      return new Response(JSON.stringify(list), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // Logika statystyk (bez zmian, tylko dopasowana do Twojej bazy)
let query = "SELECT nastroj, COUNT(*) as count FROM Wyniki";
let params = [];

    // Używamy kolumny 'kto' zamiast 'klasa'
if (filter !== 'all') {
query += " WHERE kto = ?";
params.push(filter);
@@ -17,7 +27,6 @@ export async function onRequestGet(context) {

const results = await db.prepare(query).bind(...params).all();

    // Tworzymy obiekt z wynikami, upewniając się, że nazwy nastrojów pasują (dobrze, zle, fatalnie)
const stats = { dobrze: 0, zle: 0, fatalnie: 0 };
results.results.forEach(row => {
if (stats.hasOwnProperty(row.nastroj)) {
