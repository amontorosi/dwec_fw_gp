//const fs = require("fs");
const fs = require("fs").promises; //Se emplea async/await (basado en Promesas) para evitar el bloqueo del Event Loop en operaciones de E/S, optimizando la concurrencia
const path = require("path");

const DATA_FILENAME = "houses.json";
const DATA_DIR = "data";

module.exports = async function handler(req, res) {
    // Cabeceras CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    // Solo permitir GET
    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        // Leer el JSON
        const dataPath = path.join(process.cwd(), DATA_DIR, DATA_FILENAME);
        //const fileContent = fs.readFileSync(dataPath, "utf8");
        const fileContent = await fs.readFile(dataPath, "utf8");
        const jsonData = JSON.parse(fileContent);

        const housesData = jsonData.locations;

        // Obtener parámetro id
        const { id } = req.query;

        // Filtrar por ID si existe
        if (id) {
            const houseId = parseInt(id, 10);

            if (isNaN(houseId)) {
                return res.status(400).json({ error: "Invalid ID format" });
            }

            const house = housesData.find((h) => h.id === houseId);

            if (!house) {
                return res.status(404).json({ error: "House not found" });
            }

            return res.status(200).json([house]);
        }

        // Devolver todas
        return res.status(200).json(housesData);
    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({
            error: "Error with the data file",
            message: error.message,
            //stack: error.stack,
        });
    }
};
