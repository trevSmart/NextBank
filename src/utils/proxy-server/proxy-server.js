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

// Defineix una allow-list de destins vàlids pel proxy
// Clau: nom lògic per l'usuari; Valor: URL base a la qual es permet el proxy
const ALLOWED_TARGETS = {
    'salesforce-api': 'https://api.salesforce.com',
    'salesforce-login': 'https://login.salesforce.com',
    'twelvedata-api': 'https://api.twelvedata.com'
};

// Defineix endpoints predefinits per evitar construcció dinàmica d'URLs
// Seguint la recomanació de CodeQL: usar input d'usuari per seleccionar de strings fixos
const PREDEFINED_ENDPOINTS = {
    // Salesforce endpoints
    'salesforce-oauth': 'https://api.salesforce.com/services/oauth2/token',
    'salesforce-agent-sessions': 'https://api.salesforce.com/einstein/ai-agent/v1/agents',
    'salesforce-agent-messages': 'https://api.salesforce.com/einstein/ai-agent/v1/sessions',
    'salesforce-login': 'https://login.salesforce.com/services/oauth2/token',
    'salesforce-domain-services': 'https://orgfarm-a5b40e9c5b-dev-ed.develop.my.salesforce.com/services/data/v59.0/einstein/copilot/agent/sessions',
    
    // TwelveData endpoints
    'twelvedata-quote': 'https://api.twelvedata.com/quote',
    'twelvedata-time-series': 'https://api.twelvedata.com/time_series',
    'twelvedata-symbol-search': 'https://api.twelvedata.com/symbol_search'
};

// Funció per construir URLs segures amb paràmetres dinàmics validats
function buildSecureUrl(endpointKey, dynamicParams = {}) {
    const baseUrl = PREDEFINED_ENDPOINTS[endpointKey];
    if (!baseUrl) {
        throw new Error(`Endpoint no permès: ${endpointKey}`);
    }

    // Construcció segura d'URLs amb paràmetres dinàmics
    switch (endpointKey) {
        case 'salesforce-agent-sessions':
            if (!dynamicParams.agentId || typeof dynamicParams.agentId !== 'string') {
                throw new Error('agentId és requerit per salesforce-agent-sessions');
            }
            // Validar que agentId sigui un ID vàlid de Salesforce (format: 0Xx...)
            if (!/^0Xx[A-Za-z0-9]{15}$/.test(dynamicParams.agentId)) {
                throw new Error('agentId no té un format vàlid');
            }
            return `${baseUrl}/${dynamicParams.agentId}/sessions`;

        case 'salesforce-agent-messages':
            if (!dynamicParams.sessionId || typeof dynamicParams.sessionId !== 'string') {
                throw new Error('sessionId és requerit per salesforce-agent-messages');
            }
            // Validar que sessionId sigui un ID vàlid
            if (!/^[A-Za-z0-9_-]+$/.test(dynamicParams.sessionId)) {
                throw new Error('sessionId no té un format vàlid');
            }
            return `${baseUrl}/${dynamicParams.sessionId}/messages`;
            
        case 'salesforce-domain-services':
            if (!dynamicParams.sessionId || typeof dynamicParams.sessionId !== 'string') {
                throw new Error('sessionId és requerit per salesforce-domain-services');
            }
            // Validar que sessionId sigui un ID vàlid
            if (!/^[A-Za-z0-9_-]+$/.test(dynamicParams.sessionId)) {
                throw new Error('sessionId no té un format vàlid');
            }
            return `${baseUrl}/${dynamicParams.sessionId}`;
            
        default:
            return baseUrl;
    }
}

app.post('/proxy', async (req, res) => {
    try {
        const { endpoint, method = 'POST', headers = {}, body, url } = req.body;

        let destinationUrl;

        // Nova API segura: usar endpoint predefinit (recomanació exacta de CodeQL)
        if (endpoint && typeof endpoint === 'string') {
            try {
                // Seguint la recomanació de CodeQL: usar input d'usuari per seleccionar de strings fixos
                const dynamicParams = req.body.dynamicParams || {};
                destinationUrl = buildSecureUrl(endpoint, dynamicParams);
            } catch (error) {
                return res.status(400).json({
                    error: error.message + '. Endpoints vàlids: ' + Object.keys(PREDEFINED_ENDPOINTS).join(', ')
                });
            }
        }
        // Suport per l'API antiga (url directa) - DEPRECATED però mantingut per compatibilitat
        else if (url && typeof url === 'string') {
            // Validar que la URL sigui d'un domini permès
            try {
                const urlObj = new URL(url);
                const isValidDomain = Object.values(ALLOWED_TARGETS).some(allowedUrl => {
                    const allowedObj = new URL(allowedUrl);
                    return urlObj.hostname === allowedObj.hostname;
                });

                if (!isValidDomain) {
                    return res.status(403).json({ error: 'URL no permès. Només es permeten URLs dels dominis: ' + Object.values(ALLOWED_TARGETS).map(u => new URL(u).hostname).join(', ') });
                }

                destinationUrl = url;
            } catch (error) {
                return res.status(400).json({ error: 'URL invàlida.' });
            }
        } else {
            return res.status(400).json({ error: 'Falta el camp "endpoint" o "url" al body.' });
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

        const response = await fetch(destinationUrl, {
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