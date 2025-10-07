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

// Configuració CORS més restrictiva per evitar CSRF
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:8080',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:8080'
];

app.use(cors({
    origin: function (origin, callback) {
        // Permetre requests sense origin (aplicacions mòbils, Postman, etc.)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
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

// Funció per validar si una URL és segura amb verificació estricta
function isValidUrl(urlString) {
    try {
        const url = new URL(urlString);

        // Verificar que el protocol sigui HTTPS (excepte per Salesforce login que pot ser HTTP)
        const isHttps = url.protocol === 'https:';
        const isSalesforceLogin = url.hostname === 'login.salesforce.com';

        if (!isHttps && !isSalesforceLogin) {
            return false;
        }

        // Verificació estricta del hostname - exacte match amb la llista blanca
        // Això evita bypass com "evil-salesforce.com" o "salesforce.com.evil.com"
        const isValidHostname = ALLOWED_DOMAINS.includes(url.hostname);

        if (!isValidHostname) {
            return false;
        }

        // Verificació addicional per evitar path traversal i altres atacs
        // Rebutjar URLs amb caràcters sospitosos al path
        const suspiciousPatterns = [
            /\.\./,  // Path traversal
            /%2e%2e/i,  // URL encoded path traversal
            /%2f/i,  // URL encoded slash
            /<script/i,  // XSS attempts
            /javascript:/i  // JavaScript protocol
        ];

        const fullUrl = url.toString();
        for (const pattern of suspiciousPatterns) {
            if (pattern.test(fullUrl)) {
                return false;
            }
        }

        return true;
    } catch (error) {
        return false;
    }
}

app.post('/proxy', async (req, res) => {
    try {
        const { url, method = 'POST', headers = {}, body } = req.body;

        // Validacions bàsiques d'entrada
        if (!url) {
            return res.status(400).json({ error: 'Falta el camp "url" al body' });
        }

        if (typeof url !== 'string') {
            return res.status(400).json({ error: 'El camp "url" ha de ser una cadena de text' });
        }

        // Validar que la URL sigui segura per evitar SSRF
        if (!isValidUrl(url)) {
            return res.status(403).json({
                error: 'URL no permesa. Només es permeten URLs de dominis autoritzats.'
            });
        }

        // Validar mètodes HTTP permesos
        const allowedMethods = ['GET', 'POST', 'DELETE'];
        if (!allowedMethods.includes(method.toUpperCase())) {
            return res.status(405).json({
                error: `Mètode HTTP no permès. Mètodes permesos: ${allowedMethods.join(', ')}`
            });
        }

        // Validar headers per evitar injecció
        const allowedHeaders = ['Content-Type', 'Authorization', 'Accept'];
        const sanitizedHeaders = {};
        for (const [key, value] of Object.entries(headers)) {
            if (allowedHeaders.includes(key)) {
                sanitizedHeaders[key] = value;
            }
        }

        // Serialize body only if Content-Type is application/json and body is not a string
        const formattedBody =
            sanitizedHeaders['Content-Type'] === 'application/json' && typeof body !== 'string'
                ? JSON.stringify(body)
                : body;

        // Configurar timeout per evitar atacs de denegació de servei
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segons timeout

        const response = await fetch(url, {
            method,
            headers: sanitizedHeaders,
            body: formattedBody,
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Validar que la resposta sigui JSON vàlid
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            return res.status(400).json({
                error: 'La resposta del servidor no és JSON vàlid'
            });
        }

        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        if (error.name === 'AbortError') {
            return res.status(408).json({ error: 'Timeout de la petició' });
        }
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));