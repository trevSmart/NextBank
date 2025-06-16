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

app.post('/proxy', async (req, res) => {
    try {
        const { url, method = 'POST', headers = {}, body } = req.body;

        if (!url) {
            return res.status(400).json({ error: 'Falta el camp "url" al body' });
        }

        // Serialize body only if Content-Type is application/json and body is not a string
        const formattedBody =
            headers['Content-Type'] === 'application/json' && typeof body !== 'string'
                ? JSON.stringify(body)
                : body;

        console.log();
        console.log();
        console.log(url);
        console.log(JSON.stringify(headers));
        console.log(JSON.stringify(formattedBody));
        console.log();
        console.log();
        console.log(JSON.stringify(req.formattedBody));
        const response = await fetch(url, {
            method,
            headers,
            body: formattedBody
        });
        console.log();
        console.log();
        console.log(JSON.stringify(response));

        // Comprova el content-type de la resposta
        const contentType = response.headers.get('content-type') || '';
        if (contentType.startsWith('text/event-stream')) {
            // Configura els headers per SSE
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            // Retransmet el flux tal qual
            response.body.pipe(res);
        } else {
            // Per la resta de casos, processa com a JSON
            const data = await response.json();
            console.log();
            console.log();
            console.log(response.status + ' ' + response.statusText);
            console.log(JSON.stringify(data));

            res.status(response.status).json(data);
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));