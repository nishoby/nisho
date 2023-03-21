const BE_BY_MONTHS = [
    'студзеня',
    'лютага',
    'сакавіка',
    'красавіка',
    'мая',
    'чэрвеня',
    'ліпеня',
    'жніўня',
    'верасня',
    'кастрычніка',
    'лістапада',
    'снежня',
];

// Fallback for browsers that don't have be-BY locale
const fallbackLocale = 'en-US';
const fallbackYearFormatter = new Intl.DateTimeFormat(fallbackLocale, {
    year: 'numeric',
});
const fallbackMonthFormatter = new Intl.DateTimeFormat(fallbackLocale, {
    month: 'numeric',
});
const fallbackDayFormatter = new Intl.DateTimeFormat(fallbackLocale, {
    day: 'numeric',
});

function formatShortDate(raw) {
    const date = new Date(raw);
    const dateFormatter = new Intl.DateTimeFormat('be-BY', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
    });

    if (dateFormatter.resolvedOptions().locale === 'be-BY') {
        return dateFormatter.format(date);
    }

    const year = fallbackYearFormatter.format(date);
    const month = fallbackMonthFormatter.format(date);
    const day = fallbackDayFormatter.format(date);

    return `${day.padStart(2, '0')}.${month.padStart(2, '0')}.${year}`;
}

function formatLongDate(raw) {
    const date = new Date(raw);
    const dateFormatter = new Intl.DateTimeFormat('be-BY', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    if (dateFormatter.resolvedOptions().locale === 'be-BY') {
        return dateFormatter.format(date);
    }

    const year = fallbackYearFormatter.format(date);
    const shortMonth = fallbackMonthFormatter.format(date);
    const day = fallbackDayFormatter.format(date);

    return `${day} ${BE_BY_MONTHS[shortMonth]} ${year}`;
}

export { formatShortDate, formatLongDate };
