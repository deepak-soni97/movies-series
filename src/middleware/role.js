

const roles = {
    ADMIN: 'admin',
    USER: 'user',
};


const requireAdmin = (req, res, next) => {
    if (req.user.role === roles.ADMIN) {
        next();
    } else {
        res.status(403).json({ message: 'Access forbidden. Admin role required.' });
    }
};

const requireUser = (req, res, next) => {
    if (req.user.role === roles.USER) {
        next();
    } else {
        res.status(403).json({ message: 'Access forbidden. User role required.' });
    }
};


module.exports = { requireAdmin, requireUser }  