const axios = require("axios");

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

async function processMessage(userMessage) {
    try {
        console.log("📩 Mensaje del usuario:", userMessage);

        const response = await axios.post(
            GROQ_API_URL,
            {
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: `
            Eres un sistema de extracción de información.
            Tu tarea es analizar el mensaje del usuario y devolver ÚNICAMENTE un JSON válido, sin texto adicional.

            Formato de salida:
            {
              "intent": "agregar_gastos" | "query" | "listar_categorias" | "editar_gasto" | "eliminar_gasto" | "listar_gastos" | "ayuda",
              "extracted_fields": {
                "gastos": [
                  {
                    "amount": number,
                    "category": string,
                    "currency": string
                  }
                ],
                "amount": number,
                "new_amount": number,
                "category": string,
                "previous_amount": number,
                "previous_category": string,
                "date": "YYYY-MM-DD" | "today" | "yesterday",
                "period": "today" | "yesterday",
                "type": "total" | "category",
                "currency": string
              }
            }

            Reglas:
            - Devuelve SIEMPRE JSON válido.
            - NO incluyas explicaciones ni texto fuera del JSON.
            - Si hay múltiples gastos en el mensaje, usa SOLO el array "gastos" y deja los demás campos vacíos o ausentes.
            - Si hay un solo gasto, usa "amount", "category" y "currency".
            - Detecta monedas a partir de símbolos: $ → $, $USD → USD, € → EUR, £ → GBP, ¥ → JPY.
            - Si no se especifica moneda, usa "$".
            - Usa categorías en minúsculas.
            - No inventes datos faltantes.
            - Convierte fechas relativas:
              - "hoy" → "today"
              - "ayer" → "yesterday"
            - Si se menciona una fecha explícita, conviértela a formato "YYYY-MM-DD".
            - Si no hay información suficiente para un campo, omítelo.

            Ejemplos:
            Entrada: "Gasté $50 en comida"
            Salida: {"intent":"agregar_gasto","extracted_fields":{"amount":50,"category":"comida","currency":"USD"}}

            Entrada: "€20 café y $10 transporte"
            Salida: {"intent":"agregar_gastos","extracted_fields":{"gastos":[{"amount":20,"category":"café","currency":"EUR"},{"amount":10,"category":"transporte","currency":"USD"}]}}

            Entrada: "¿Cuánto gasté hoy?"
            Salida: {"intent":"query","extracted_fields":{"period":"today","type":"total"}}
            `,
                    },
                    { role: "user", content: userMessage },
                ],
                response_format: { type: "json_object" },
                temperature: 0.1,
                max_tokens: 200,
            },
            {
                headers: {
                    Authorization: `Bearer ${GROQ_API_KEY}`,
                    "Content-Type": "application/json",
                },
            },
        );

        const result = JSON.parse(response.data.choices[0].message.content.trim(),
        );
        console.log("📝 Data:", result);
        return result;
    } catch (error) {
        console.error("❌ Groq API Error: ", error.response?.data || error.message);
        throw new Error("Fallo al procesar el mensaje. Por favor, inténtalo de nuevo.");
    }
}

async function normalizeCategory(category) {
    try {
        const response = await axios.post(
            GROQ_API_URL,
            {
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: `Normaliza las categorías de gastos en categorías estándar. Asigna la entrada del usuario a estas categorías fijas:
                        - Salidas (restaurantes, comer fuera, comida para llevar, Rappi, PedidosYa, delivery, café, té, bebidas, batidos)
                        - Supermercado (supermercado, alimentos, artículos del hogar, dietetica, carrefour, coto, DIA, jumbo)
                        - Carnicería (carnicería, pollo, carne, pescado)
                        - Transporte (uber, colectivo, bondi, taxi, autobús, tren, combustible, nafta, estacionamiento, peaje, ypf, shell, axion)
                        - Shopping (ropa, electrónicos, accesorios)
                        - Entretenimiento (películas, juegos, streaming, Netflix, Spotify, cine, teatro, eventos)
                        - Farmacia (médico, farmacia, doctor)
                        - Servicios (electricidad, agua, internet, teléfono, AySa, ABL, flow, gas, alquiler)
                        - Otros (gastos varios)

                        Devuelve solo el nombre de la categoría normalizada sin ninguna explicación.
                        Ejemplos:
                        - "café" -> "Salidas"
                        - "bondi a la oficina" -> "Transporte"
                        - "Pizzería" -> "Salidas"
                        - "almuerzo en el restaurante" -> "Salidas"
                        - "Showcase" -> "Entretenimiento"
                        `,
                    },
                    { role: "user", content: category },
                ],
                temperature: 0.1,
                max_tokens: 50,
            },
            {
                headers: {
                    Authorization: `Bearer ${GROQ_API_KEY}`,
                    "Content-Type": "application/json",
                },
            },
        );

        const normalizedCategory = response.data.choices[0].message.content.trim();
        console.log(`📝 Categoría normalizada: ${category} -> ${normalizedCategory}`);
        return normalizedCategory;
    } catch (error) {
        console.error("❌ Error en la normalización de categoría:", error.response?.data || error.message);
        // Retorno de la categoría original si la normalización falla
        return category;
    }
}

module.exports = { processMessage, normalizeCategory };