import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: true, // reflecteix l'origen que fa la petició
    methods: ['POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurem el servei de fitxers estàtics
app.use(express.static(path.join(__dirname, '..', 'src')));
// app.use('/node_modules', express.static(path.join(__dirname, '..', 'node_modules')));

// Ruta principal per servir l'aplicació SPA
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, '..', 'src', 'index.html'));
// });

app.post('/proxy', async (req, res) => {
    try {
        const { url, method = 'POST', headers = {}, body } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'Falta el camp "url" al body' });
        }

        const response = await fetch(url, {
            method,
            headers,
            // body: JSON.stringify(body)
            body
        });

        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));