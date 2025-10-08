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
        console.log();
        console.log(JSON.stringify(headers, null, 4));
        console.log();
        console.log(JSON.stringify(formattedBody, null, 4));
        console.log();
        console.log();
        console.log(JSON.stringify(req.formattedBody, null, 4));
        const response = await fetch(url, {
            method,
            headers,
            body: formattedBody
        });
        console.log();
        console.log();
        console.log(JSON.stringify(response, null, 4));

        // Comprova el content-type de la resposta
        const contentType = response.headers.get('content-type') || '';
        if (contentType.startsWith('text/event-stream')) {
            // Configura els headers per SSE
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            console.log('Streaming response');
            console.log(response.body);
            // Retransmet el flux tal qual
            response.body.pipe(res);
        } else {
            // Per la resta de casos, primer llegim el text i després intentem parsejar com JSON
            const textData = await response.text();
            console.log();
            console.log();
            console.log(response.status + ' ' + response.statusText);
            console.log('Response text:', textData);

            try {
                const data = JSON.parse(textData);
                res.status(response.status).json(data);
            } catch (jsonError) {
                // Si no és JSON vàlid, retorna el text
                res.status(response.status).send(textData);
            }
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));