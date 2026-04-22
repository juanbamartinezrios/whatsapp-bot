const { MessagingResponse } = require("twilio").twiml;
const { processMessage, normalizeCategory } = require("../services/groq.service");
const { inferDate } = require("../utils/date.utils");
const Gasto = require("../models/Gasto");

async function getTotal(period) {
    const start = new Date();
    if (period === "yesterday") start.setDate(start.getDate() - 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);

    const gastos = await Gasto.aggregate([
        { $match: { date: { $gte: start, $lte: end } } },
        {
            $group: {
                _id: "$currency",
                total: { $sum: "$amount" },
            },
        },
    ]);

    if (!gastos.length) return `Sin gastos ${period}.`;
    return `👉 Total gastado \n 📅 ${period}: 💰 ${gastos.map((e) => `${e._id}${e.total}`).join(", ")}`;
}

async function getTotalByCategory(category) {
    const gastos = await Gasto.aggregate([
        { $match: { category: category } },
        {
            $group: {
                _id: { category: "$category", currency: "$currency" },
                total: { $sum: "$amount" },
            },
        },
    ]);

    if (!gastos.length) return `Sin gastos encontrados para ${category}.`;
    return `👉 Total gastado en: \n 📊 ${category}: 💰 ${gastos.map((e) => `${e._id.currency}${e.total}`).join(", ")}`;
}

async function getAllExpenses() {
    const gastos = await Gasto.find().sort({ date: -1 });
    return gastos.length ? gastos.map((exp) => `${exp.date.toISOString().split("T")[0]}: ${exp.currency}${exp.amount} en ${exp.category}`).join("\n") : "✔️ Sin gastos guardados.";
}

function getInstructions() {
    return `🙋‍♂️ Ayuda en camino.\n
  📋 Comandos disponibles:\n
  ▪️Agregar gasto: "Gasté $500 en restaurante ayer"
  ▪️Consultar total: "¿Cuánto gasté hoy?"
  ▪️Consultar por categoría: "¿Cuánto gasté en salidas?"
  ▪️Mostrar todas las categorías: "Mostrar desglose de gastos"
  ▪️Editar gasto: "Cambiar gasto de salidas de $500 a $600"
  ▪️Eliminar gasto: "Eliminar gasto de supermercado de $300 de ayer"
  ▪️Mostrar todos los gastos: "Listar todos mis gastos"
  ▪️Ayuda: "¿Qué puedes hacer?"`;
}

async function addExpenses(expenses, date, user) {
    const expenseDate = inferDate(date);
    const gastosGuardados = [];

    for (const exp of expenses) {
        const normalizedCategory = await normalizeCategory(exp.category);
        const gasto = new Gasto({
            amount: exp.amount,
            category: normalizedCategory,
            date: expenseDate,
            currency: exp.currency || "$",
            user: user
        });
        await gasto.save();
        gastosGuardados.push(`${gasto.currency}${exp.amount} para 📊 ${normalizedCategory}`);
    }

    return `✅ Agregados gastos el ${expenseDate.toISOString().split("T")[0]}:\n${gastosGuardados.join("\n")}`;
}

/* async function editExpense(oldAmount, oldCategory, newAmount) {
  if (!oldAmount || !oldCategory || !newAmount) {
    return `❌ Missing required fields. Format: "Change $500 food expense to $600"`;
  }

  const expense = await Gasto.findOne({
    amount: oldAmount,
    category: oldCategory
  }).sort({ date: -1 }); // Get the most recent matching expense

  if (!expense) {
    return `❌ Couldn't find a ${oldCategory} expense of $${oldAmount}. Please verify the amount and category.`;
  }

  Gasto.amount = newAmount;
  await Gasto.save();
  return `✅ Updated ${oldCategory} expense from $${oldAmount} to $${newAmount} (dated ${Gasto.date.toISOString().split('T')[0]})`;
} */

async function deleteExpense(amount, category, date) {
    if (!amount || !category) {
        return `❌ Por favor, especificá ambos el monto y la categoría. Ejemplo: 'Borrar $300 de supermercado de ayer.'`;
    }

    const startDate = inferDate(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setHours(23, 59, 59, 999);

    const result = await Gasto.findOneAndDelete({
        amount: amount,
        category: category,
        date: { $gte: startDate, $lte: endDate },
    });

    if (!result) {
        return `❌ No se encontró un gasto de 📊 ${category} por 💰 $${amount}${date ? ` el 📅 ${startDate.toISOString().split("T")[0]}` : ""}`;
    }

    return `✅ Eliminado ${category} gasto de 💰 $${amount} del 📅 ${startDate.toISOString().split("T")[0]}`;
}

async function handleWhatsappMessage(req, res) {
    const twiml = new MessagingResponse();

    try {
        const processed = await processMessage(req.body.Body);
        const user = {
            phone: req.body.WaId,
            name: req.body.WaId === process.env.WHATSAPP_SENDER_WAID_1 ? "JUANBA" : "AILIN",
        }
        const { intent, extracted_fields } = processed;

        if (intent === "agregar_gastos") {
            if (extracted_fields.gastos && extracted_fields.gastos.length > 0) {
                twiml.message(
                    await addExpenses(
                        extracted_fields.gastos,
                        extracted_fields.date,
                        user
                    ),
                );
            } else {
                twiml.message("❌ Por favor, especificá los montos y categorías. Ejemplo: '100 café, 200 chocolate'");
            }
        } else if (intent === "agregar_gasto") {
            if (extracted_fields.amount && extracted_fields.category) {
                const expenseDate = inferDate(extracted_fields.date);
                const normalizedCategory = await normalizeCategory(extracted_fields.category);
                const gasto = new Gasto({
                    amount: extracted_fields.amount,
                    category: normalizedCategory,
                    date: expenseDate,
                    user: user
                });
                await gasto.save();

                twiml.message(`✅ Agregado $${extracted_fields.amount} para \n📊 ${normalizedCategory} el 📅 ${expenseDate.toISOString().split("T")[0]}`);
            } else {
                twiml.message("❌ Por favor, especificá el monto y la categoría. Ejemplo: 'Gasté $500 en comida ayer'");
            }
        } else if (intent === "query") {
            if (extracted_fields.type === "total") {
                twiml.message(await getTotal(extracted_fields.period));
            } else if (extracted_fields.type === "category" && extracted_fields.category) {
                twiml.message(await getTotalByCategory(extracted_fields.category));
            } else {
                twiml.message("❌ Por favor, proporcioná una consulta válida. Ejemplo: '¿Cuánto gasté en comidas?'");
            }
        } else if (intent === "listar_gastos") {
            twiml.message(`📜 Todos los Gastos:\n${await getAllExpenses()}`);
        } else if (intent === "ayuda") {
            twiml.message(getInstructions());
        } else if (intent === "editar_gasto") {
            if (
                extracted_fields.previous_amount &&
                extracted_fields.previous_category &&
                extracted_fields.new_amount
            ) {
                twiml.message(
                    await editExpense(
                        extracted_fields.previous_amount,
                        extracted_fields.previous_category,
                        extracted_fields.new_amount,
                    ),
                );
            } else {
                twiml.message("❌ Por favor, especificá el gasto a editar. Ejemplo: 'Cambiar gasto de 500 en comida a 600'");
            }
        } else if (intent === "eliminar_gasto") {
            if (extracted_fields.amount && extracted_fields.category) {
                twiml.message(
                    await deleteExpense(
                        extracted_fields.amount,
                        extracted_fields.category,
                        extracted_fields.date,
                    ),
                );
            } else {
                twiml.message("❌ Por favor, especificá el gasto a eliminar. Ejemplo: 'Eliminar gasto de 300 en comestibles de ayer'");
            }
        } else {
            twiml.message("❌ Perdón, no entendí. Escribí 🙋‍♂️ 'ayuda' para ver los comandos disponibles.");
        }
    } catch (error) {
        console.error("❌ Error:", error);
        twiml.message("⚠️ Por favor, intentá de nuevo.");
    }

    res.type("text/xml").send(twiml.toString());
}

module.exports = { handleWhatsappMessage };