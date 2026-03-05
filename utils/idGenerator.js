const generateShortId = (prefix) => {
    // Generate a 6-digit random number
    const randomNumber = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}-${randomNumber}`;
};

module.exports = {
    generateShortId
};
