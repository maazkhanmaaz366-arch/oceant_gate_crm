const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../../db/postgresModels');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'fallback_secret_key', {
    expiresIn: '30d',
  });
};

class AuthController {
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }

      await user.update({ updatedAt: new Date() });

      res.json({
        success: true,
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          token: generateToken(user.id, user.role),
        }
      });
    } catch (error) {
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      let user = await User.findByPk(req.user.id);
      if (user) {
        user = user.toJSON();
        delete user.password;
        res.json({ success: true, data: user });
      } else {
        res.status(404).json({ success: false, message: 'User not found' });
      }
    } catch (error) {
      next(error);
    }
  }

  async createUser(req, res, next) {
    try {
      const { name, email, password, role } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'name, email, and password are required.' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = await User.create({ name, email, password: hashedPassword, role: role || 'sales' });

      res.status(201).json({
        success: true,
        data: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role }
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
