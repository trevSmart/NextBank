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

// Allow-list for outbound proxy requests (hostnames)
// Example: add all trusted API endpoint domains here
const ALLOWED_HOSTNAMES = [
  "api.twelvedata.com",
  "login.salesforce.com",
  "test.salesforce.com",
  // Add other trusted domains as needed
];
// Configure CORS with more permissive settings for development
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        const allowedOrigins = [
            'http://localhost:60566',
            'http://localhost:3000',
            'http://localhost:5500',
            'http://127.0.0.1:60566',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5500'
        ];

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 200
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Explicitly handle preflight requests for all routes
app.options('*', (req, res) => {
    console.log('Handling preflight request for:', req.url);
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.status(200).end();
});

// Configurem el servei de fitxers estàtics
app.use(express.static(path.join(__dirname, '..', 'src')));
// app.use('/node_modules', express.static(path.join(__dirname, '..', 'node_modules')));

// Ruta principal per servir l'aplicació SPA
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, '..', 'src', 'index.html'));
// });

app.post('/proxy', async (req, res) => {
    try {
        console.log('Proxy request received from origin:', req.headers.origin);
        console.log('Request headers:', req.headers);

        let { url, method = 'POST', headers = {}, body } = req.body;

        if (!url) {
            console.log('Missing URL in request body');
            return res.status(400).json({ error: 'Falta el camp "url" al body' });
        }

        // SSRF Protection: Accept only requests to allow-listed hostnames
        let urlObj;
        try {
            urlObj = new URL(url);
        } catch (err) {
            console.log('Malformed URL rejected:', url);
            return res.status(400).json({ error: "Malformed URL" });
        }
        if (!ALLOWED_HOSTNAMES.includes(urlObj.hostname)) {
            console.log('Proxy SSRF blocked:', urlObj.hostname, 'not allow-listed');
            return res.status(403).json({ error: "Target hostname not allowed" });
        }

        // Inject TwelveData API key if needed (avoid exposing it client-side)
        try {
            if (urlObj.hostname === 'api.twelvedata.com' && urlObj.pathname.includes('/time_series')) {
                if (!urlObj.searchParams.has('apikey') && process.env.TWELVEDATA_API_KEY) {
                    urlObj.searchParams.set('apikey', process.env.TWELVEDATA_API_KEY);
                    url = urlObj.toString();
                }
            }
        } catch (e) {
            console.log('URL parse error, leaving URL as-is:', e?.message);
        }

        // Serialize/adjust body
        let formattedBody = body;
        const contentType = (headers['Content-Type'] || headers['content-type'] || '').toLowerCase();
        if (contentType.includes('application/json') && typeof body !== 'string') {
            formattedBody = JSON.stringify(body);
        }

        // Inject Salesforce Connected App credentials on OAuth token requests
        try {
            const urlObj2 = new URL(url);
            if (urlObj2.pathname.endsWith('/services/oauth2/token') && contentType.includes('application/x-www-form-urlencoded')) {
                const params = new URLSearchParams(formattedBody || '');
                if (process.env.SF_CONNECTED_APP_CLIENT_ID) {
                    params.set('client_id', process.env.SF_CONNECTED_APP_CLIENT_ID);
                }
                if (process.env.SF_CONNECTED_APP_CLIENT_SECRET) {
                    params.set('client_secret', process.env.SF_CONNECTED_APP_CLIENT_SECRET);
                }
                formattedBody = params.toString();
            }
        } catch (e) {
            console.log('OAuth body injection error:', e?.message);
        }

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
        const respContentType = response.headers.get('content-type') || '';
        if (respContentType.startsWith('text/event-stream')) {
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