# Informe de Problemes Potencials - NextBank

## Resum Executiu

Aquest informe documenta els problemes potencials identificats en el codi base de NextBank, organitzats per categoria de severitat i tipus d'impacte.

---

## 🔴 Problemes Crítics de Seguretat

### 1. Credencials Hardcoded Exposades
**Ubicació:** `src/components/agentforceClient/libs/sfAgentApi.js`
```javascript
const salesforceParameters = {
    urlMyDomain: 'https://orgfarm-a5b40e9c5b-dev-ed.develop.my.salesforce.com',
    connectedAppClientId: '3MVG9rZjd7MXFdLhSKI7aMVDTapUmHhDlg4uv8l._iSgHKmMrYP0ND3kjdVo3bkwCXrzQAHq6V5qGSsftVEH6',
    connectedAppClientSecret: '49799F9C19F97B8CE413894C5387F5C8AA34E9B0FAB35C051F88FB1F810B71E4',
    agentId: '0XxgK000000D2KDSA0'
};
```
**Risc:** Exposició de credencials de Salesforce sensibles al codi client.
**Impacte:** Alt - Accés no autoritzat a sistemes Salesforce.
**Solució:** Moure aquestes credencials a variables d'entorn o configuració del servidor.

### 2. Credencials de Login Hardcoded
**Ubicació:** `src/components/login/login.js`
```javascript
const validCredentials = [
    {username: 'elizabeth', password: 'elizabeth'}
];
```
**Risc:** Credencials de prova exposades al codi client.
**Impacte:** Mitjà - Accés no autoritzat amb credencials conegudes.
**Solució:** Implementar autenticació adequada al servidor backend.

### 3. CORS Overly Permissive
**Ubicació:** `src/utils/proxy-server/proxy-server.js`
```javascript
app.use(cors({
    origin: true, // reflects the origin that makes the request
    methods: ['GET', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
```
**Risc:** Configuració CORS massa permissiva.
**Impacte:** Mitjà - Possible vulnerabilitat Cross-Origin.
**Solució:** Restringir origins a dominis específics.

### 4. URLs Localhost Hardcoded
**Ubicació:** Múltiples fitxers
- `src/components/agentforceClient/libs/sfAgentApi.js` (línies 30, 66, 127, 167, 199)
- `src/components/StockView old/StockView.js` (línia 34)

**Risc:** URLs de desenvolupament en codi de producció.
**Impacte:** Mitjà - Aplicació no funcionarà en producció.
**Solució:** Usar variables d'entorn per configurar URLs.

---

## 🟡 Problemes de Configuració

### 5. Configuració ESLint Duplicada
**Ubicació:** `eslint.config.js` i `.eslintrc.cjs`
**Problema:** Existeixen dues configuracions d'ESLint diferents.
**Impacte:** Baix - Confusió en regles de linting.
**Solució:** Usar només una configuració d'ESLint (preferiblement `eslint.config.js`).

### 6. Console.log Statements en Proxy Server
**Ubicació:** `src/utils/proxy-server/proxy-server.js`
```javascript
console.log();
console.log();
console.log(url);
console.log(JSON.stringify(headers));
// ... més console.log statements
```
**Problema:** Múltiples console.log statements que haurien de ser eliminats en producció.
**Impacte:** Baix - Informació sensible pot filtrar-se als logs.
**Solució:** Usar un sistema de logging adequat o eliminar els console.log.

---

## 🔵 Problemes de Rendiment

### 7. Ús Intensiu de Transform3D
**Ubicació:** `src/main.js`
```javascript
chatDetached.style.transform = `translate3d(${dragState.xOffset}px, ${dragState.yOffset}px, 0)`;
```
**Problema:** Transformacions 3D intensives sense optimització.
**Impacte:** Mitjà - Possible impacte en rendiment en dispositius baixa gamma.
**Solució:** Implementar throttling o debouncing per les animacions.

### 8. Event Listeners No Optimitzats
**Ubicació:** `src/main.js`
**Problema:** Event listeners per drag sense throttling adequat.
**Impacte:** Baix - Ús excessiu de CPU durant drag operations.
**Solució:** Implementar requestAnimationFrame adequadament (ja implementat parcialment).

---

## 🟢 Problemes de Qualitat del Codi

### 9. Codi Comentat No Utilitzat
**Ubicació:** Múltiples fitxers
- `public/index.html` (línies 42-44, 322-366)
- `src/main.js` (línia 252)

**Problema:** Grans blocs de codi comentat que no s'utilitzen.
**Impacte:** Baix - Codi base més difícil de mantenir.
**Solució:** Eliminar codi comentat innecessari.

### 10. Funcions Complexes
**Ubicació:** `src/main.js`
**Problema:** Funció `main.js` té alta complexitat (374 línies en un sol fitxer).
**Impacte:** Mitjà - Dificultat de manteniment i testing.
**Solució:** Dividir en mòduls més petits i especialitzats.

### 11. Comentaris en Múltiples Idiomes
**Ubicació:** Diversos fitxers
**Problema:** Comentaris barrejats en català, castellà i anglès.
**Impacte:** Baix - Inconsistència en la documentació.
**Solució:** Establir un idioma consistent per comentaris.

---

## 🔒 Problemes d'Accessibilitat

### 12. Alt Attributes Inadequats
**Ubicació:** `public/index.html`
```html
<img src="../src/assets/images/chip.webp" alt="chip">
<img src="../src/assets/images/under_age.webp" alt="Under age" class="card-under-age">
```
**Problema:** Alguns alt attributes poden ser més descriptius.
**Impacte:** Baix - Experiència subòptima per usuaris amb lectors de pantalla.
**Solució:** Millorar descriptions d'alt attributes.

### 13. Manca d'Atributs ARIA
**Ubicació:** `public/index.html`
**Problema:** Poques implementacions d'atributs ARIA per millor accessibilitat.
**Impacte:** Mitjà - Accessibilitat limitada per usuaris amb discapacitats.
**Solució:** Afegir atributs ARIA adequats.

---

## 📱 Problemes de Manteniment

### 14. Estructura de Directoris Inconsistent
**Ubicació:** `src/components/`
**Problema:** Alguns components tenen estructures de directoris inconsistents.
- `StockView/`, `StockView new init/`, `StockView old/`
**Impacte:** Baix - Confusió en organització del codi.
**Solució:** Netejar directoris obsolets i establir convenció consistent.

### 15. Fitxers Temporals i de Backup
**Ubicació:** 
- `src/components/creditCard/temp.html`
- `src/components/StockView old/`
- `src/assets/images/old/`

**Problema:** Fitxers temporals i de backup en el repositori.
**Impacte:** Baix - Confusió i mida innecessària del repositori.
**Solució:** Eliminar fitxers temporals i usar .gitignore adequadament.

---

## 📋 Recomanacions Prioritàries

### Immediatament (Severitat Alta)
1. **Moure credencials sensibles a variables d'entorn**
2. **Implementar autenticació adequada**
3. **Configurar CORS adequadament**

### A Curt Termini (Severitat Mitjana)
1. **Netejar configuració ESLint duplicada**
2. **Optimitzar event listeners de drag**
3. **Millorar accessibilitat amb ARIA**
4. **Eliminar console.log statements**

### A Llarg Termini (Millores)
1. **Refactoritzar main.js en mòduls més petits**
2. **Netejar directoris i fitxers obsolets**
3. **Establir convencions de coding consistents**
4. **Implementar testing unitari**

---

## 📊 Estadístiques del Codi

- **Línies de codi analitzades:** ~2,500+ línies
- **Fitxers JavaScript:** 15+
- **Problemes crítics:** 4
- **Problemes mitjans:** 6
- **Problemes baixos:** 5

Aquest informe proporciona una base sòlida per prioritzar les tasques de manteniment i millorar la qualitat, seguretat i rendiment de l'aplicació NextBank.