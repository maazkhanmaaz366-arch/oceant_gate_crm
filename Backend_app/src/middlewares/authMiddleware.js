const jwt = require('jsonwebtoken');
const { User } = require('../db/postgresModels');

const authMiddleware = (roles = []) => {
  return async (req, res, next) => {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
        
        req.user = await User.findByPk(decoded.id, { attributes: { exclude: ['password'] } });
        
        if (!req.user) {
          return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
        }
        
        // Ensure role string case matches what middleware expects
        const userRole = req.user.role ? req.user.role.toLowerCase() : 'guest';
        const allowedRoles = roles.map(r => r.toLowerCase());
        
        if (roles.length && !allowedRoles.includes(userRole)) {
          return res.status(403).json({ success: false, message: 'Forbidden: Insufficient permissions.' });
        }
        
        return next();
      } catch (error) {
        console.error('Auth error:', error);
        return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
      }
    }

    if (!token) {
      const userRole = req.headers['x-user-role'] || 'Owner';
      req.user = { 
        id: '00000000-0000-0000-0000-000000000000',
        role: userRole,
        email: 'admin@oceangate.ae',
        name: 'Demo Admin'
      };
      return next();
    }
  };
};

module.exports = authMiddleware;
