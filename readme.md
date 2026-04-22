# WhatsApp JARVIS Bot 📱💰

Un bot de seguimiento de gastos para WhatsApp que ayuda a gestionar gastos diarios mediante simples comandos de chat. 

---

## 🚀 Funcionalidades
- **Agregar gastos**: Registra gastos con monto, categoría y fecha
- **Consultar gastos**:
  - Ver gastos totales de hoy/ayer
  - Consultar gastos por categoría
  - Listar todos los gastos registrados
- **Gestionar gastos**:
  - Editar gastos existentes
  - Eliminar gastos registrados
- **Manejo inteligente de fechas**: Soporte para hoy, ayer y fechas personalizadas
- **Gestión de categorías**: Seguimiento de gastos por diferentes categorías
- **Procesamiento de lenguaje natural**: Entiende y procesa comandos en lenguaje natural

---

## 💻 Stack

- **Backend**: Node.js con Express
- **Base de datos**: MongoDB
- **Mensajería**: Twilio WhatsApp API
- **IA/NLP**: Groq API (modelo LLaMA 3.3 70B)
- **Entorno**: dotenv para configuración
- **Parseo de datos**: body-parser para manejo de requests

---

## 🛠️ Instalación

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd whatsapp-expense-tracker
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Crear archivo .env
```bash
GROQ_API_KEY=your_groq_api_key
MONGO_URI=your_mongodb_connection_string
TWILIO_ACCOUNT_SID=connection_string
TWILIO_AUTH_TOKEN=connection token
TWILIO_WHATSAPP_NUMBER=whatsapp:+91xxxxxxxxxx
WHATSAPP_BOT_NAME="Jarvis Gastos Bot"
WHATSAPP_SENDER_WAID_1="54911xxxxxxxx" # Admin
WHATSAPP_SENDER_WAID_2="54911xxxxxxxx" # Usuario
```

### 4. Iniciar el servidor
```bash
node server.js
```

### 5. Usar ngrok o localtunnel para obtener la url local o deployar el código
```bash
ngrok http 3000
|
lt --port 3000
```

### 6. Configurar webhook en Twilio
```bash
Pega la URL generada en el sandbox de WhatsApp.
```

## ⚙️ Configuración
1. Configurar Twilio WhatsApp Sandbox
2. Conectar MongoDB
3. Obtener API Key de Groq
4. Configurar webhook en Twilio

## 🔒 Seguridad
- No subir `.env` al repositorio
- Usar variables de entorno
- Implementar autenticación en producción

## 📱 Cómo usar:
1. **xx xx xx**:
  -`primer commit`
2. **xx xx xx**:
  -`primer commit`
3. **xx xx xx**:
  -`primer commit`
4. **xx xx xx**:
  -`primer commit`
5. **xx xx xx**:
  -`primer commit`
6. **xx xx xx**:
  -`primer commit`

## Casos border:

## Técnicas de prompting:
1. Zero shot prompting 
2. Few shot prompting
3. Chain of thoughts
4. Self consistency Prompting
5. Instruction Based Prompting   