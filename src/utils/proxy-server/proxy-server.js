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
    origin: true, // reflects the origin that makes the request
    methods: ['GET', 'POST', 'DELETE'],
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

// Llista blanca de dominis permesos per evitar SSRF
const ALLOWED_DOMAINS = [
    'api.salesforce.com',
    'api.twelvedata.com',
    'login.salesforce.com'
];

// Funció per validar si una URL és segura
function isValidUrl(urlString) {
    try {
        const url = new URL(urlString);

        // Verificar que sigui HTTPS (excepte per Salesforce login que pot ser HTTP)
        if (url.protocol !== 'https:' && !url.hostname.includes('salesforce.com')) {
            return false;
        }

        // Verificar que el domini estigui a la llista blanca
        return ALLOWED_DOMAINS.includes(url.hostname);
    } catch (error) {
        return false;
    }
}

app.post('/proxy', async (req, res) => {
    try {
        const { url, method = 'POST', headers = {}, body } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'Falta el camp "url" al body' });
        }

        // Validar que la URL sigui segura per evitar SSRF
        if (!isValidUrl(url)) {
            return res.status(403).json({
                error: 'URL no permesa. Només es permeten URLs de dominis autoritzats.'
            });
        }

        // Serialize body only if Content-Type is application/json and body is not a string
        const formattedBody =
            headers['Content-Type'] === 'application/json' && typeof body !== 'string'
                ? JSON.stringify(body)
                : body;

        const response = await fetch(url, {
            method,
            headers,
            body: formattedBody
        });

        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));