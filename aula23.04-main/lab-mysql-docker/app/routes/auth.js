const express = require('express');

const router = express.Router();

router.post('/login', (req, res) => {
  const { usuario, senha } = req.body;

  if (usuario === 'admin' && senha === '123456') {
    req.session.usuario = { nome: 'admin' };
    return res.json({ mensagem: 'Login realizado com sucesso' });
  }

  return res.status(401).json({ erro: 'Credenciais invalidas' });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ mensagem: 'Logout realizado com sucesso' });
  });
});

module.exports = router;