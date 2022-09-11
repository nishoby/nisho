function formatDate(raw) {
    let d = new Date(raw);
    return d.toLocaleDateString('be-BY', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

export {formatDate}
