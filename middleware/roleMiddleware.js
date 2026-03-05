const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Access denied. Admin role required.' });
    }
};

const isAnyAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'sub-admin')) {
        next();
    } else {
        res.status(403).json({ error: 'Access denied. Admin or Sub-admin role required.' });
    }
};

// Specifically for Catalog which sub-admins should NOT access
const restrictToAdminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Access denied. Catalog is restricted to main administrators.' });
    }
};

module.exports = {
    isAdmin,
    isAnyAdmin,
    restrictToAdminOnly
};
