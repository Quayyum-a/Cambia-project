const router = require('express').Router();
const AuthServiceImpl = require('../services/authServiceImpl');
const RegisterValidator = require('../validators/registerValidator');
const LoginValidator = require('../validators/loginValidator');

const authService = new AuthServiceImpl();

router.post('/register', async (req, res) => {
  try {
    const data = RegisterValidator.validate(req.body);
    const out = await authService.register(data);
    res.status(201).json(out);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const data = LoginValidator.validate(req.body);
    const out = await authService.login(data);
    res.json(out);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

module.exports = router;
