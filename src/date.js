const BE_BY_MONTHS = [
    "студзеня",
    "лютага",
    "сакавіка",
    "красавіка",
    "мая",
    "чэрвеня",
    "ліпеня",
    "жніўня",
    "верасня",
    "кастрычніка",
    "лістапада",
    "снежня"
];

function formatDate(raw) {
    const date = new Date(raw);
    const dateFormatter = new Intl.DateTimeFormat('be-BY', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    if (dateFormatter.resolvedOptions().locale === 'be-BY') {
        return dateFormatter.format(date);
    }

    // Fallback for browsers that don't have be-BY locale
    const fallbackLocale = 'en-US';
    const year = new Intl.DateTimeFormat(fallbackLocale, { year: 'numeric' }).format(date);
    const shortMonth = new Intl.DateTimeFormat(fallbackLocale, { month: 'numeric' }).format(date);
    const day = new Intl.DateTimeFormat(fallbackLocale, { day: 'numeric' }).format(date);

    return `${day} ${BE_BY_MONTHS[shortMonth]} ${year}`;
}

export {formatDate}
