#!/bin/bash

# Script per iniciar el servidor proxy de NextBank
# Aquest script s'executa des de VS Code per iniciar el servidor proxy

# Canviar al directori del projecte
cd "$(dirname "$0")/../../.."

# Verificar que Node.js estigui instal·lat
if ! command -v node &> /dev/null; then
    echo "Error: Node.js no està instal·lat o no està al PATH"
    exit 1
fi

# Verificar que npm estigui instal·lat
if ! command -v npm &> /dev/null; then
    echo "Error: npm no està instal·lat o no està al PATH"
    exit 1
fi

# Verificar que el fitxer package.json existeixi
if [ ! -f "package.json" ]; then
    echo "Error: package.json no trobat al directori del projecte"
    exit 1
fi

# Verificar que les dependències estiguin instal·lades
if [ ! -d "node_modules" ]; then
    echo "Instal·lant dependències..."
    npm install
fi

# Iniciar el servidor proxy
echo "Iniciant servidor proxy NextBank..."
echo "Port: 3000"
echo "Per aturar el servidor, prem Ctrl+C"
echo ""

# Executar el servidor proxy amb Node.js
node src/utils/proxy-server/proxy-server.js
