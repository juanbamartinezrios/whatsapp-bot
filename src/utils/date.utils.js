function inferDate(dateStr) {
    if (!dateStr || dateStr.toLowerCase() === "today") return new Date(); // Default hoy

    if (dateStr.toLowerCase() === "yesterday") {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday;
    }

    // formatos comunes de fecha
    const formats = ["DD/MM/YY", "D/M/YY", "YYYY-MM-DD", "MM/DD/YYYY"];
    for (const format of formats) {
        const parsedDate = new Date(dateStr);
        if (!isNaN(parsedDate)) return parsedDate;
    }

    console.warn("⚠️ Formato de fecha inválido:", dateStr);
    return new Date();
}

module.exports = { inferDate };