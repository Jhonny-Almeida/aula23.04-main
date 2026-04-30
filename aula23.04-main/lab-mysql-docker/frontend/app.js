const form = document.getElementById('usuario-form');
const idInput = document.getElementById('usuario-id');
const nomeInput = document.getElementById('nome');
const emailInput = document.getElementById('email');
const tabela = document.getElementById('usuarios-tabela');
const mensagem = document.getElementById('mensagem');
const cancelarEdicaoBtn = document.getElementById('cancelar-edicao');

const API_URL = 'http://localhost:3000/usuarios';

function mostrarMensagem(texto, erro = false) {
  mensagem.textContent = texto;
  mensagem.style.color = erro ? '#b42318' : '#0b5b55';
}

function limparFormulario() {
  idInput.value = '';
  nomeInput.value = '';
  emailInput.value = '';
}

async function carregarUsuarios() {
  const resposta = await fetch(API_URL);
  const usuarios = await resposta.json();

  tabela.innerHTML = '';

  usuarios.forEach((usuario) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${usuario.id}</td>
      <td>${usuario.nome}</td>
      <td>${usuario.email}</td>
      <td>
        <button class="acao" data-editar="${usuario.id}">Editar</button>
        <button class="acao btn-excluir" data-excluir="${usuario.id}">Excluir</button>
      </td>
    `;

    tabela.appendChild(tr);
  });
}

async function salvarUsuario(event) {
  event.preventDefault();

  const id = idInput.value;
  const payload = {
    nome: nomeInput.value.trim(),
    email: emailInput.value.trim()
  };

  const metodo = id ? 'PUT' : 'POST';
  const url = id ? `${API_URL}/${id}` : API_URL;

  const resposta = await fetch(url, {
    method: metodo,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!resposta.ok) {
    const erro = await resposta.json();
    mostrarMensagem(erro.erro || 'Falha ao salvar usuario', true);
    return;
  }

  mostrarMensagem(id ? 'Usuario atualizado com sucesso' : 'Usuario criado com sucesso');
  limparFormulario();
  carregarUsuarios();
}

async function excluirUsuario(id) {
  const confirmar = window.confirm('Deseja excluir este usuario?');

  if (!confirmar) {
    return;
  }

  const resposta = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE'
  });

  if (!resposta.ok) {
    mostrarMensagem('Falha ao excluir usuario', true);
    return;
  }

  mostrarMensagem('Usuario excluido com sucesso');
  carregarUsuarios();
}

async function editarUsuario(id) {
  const resposta = await fetch(`${API_URL}/${id}`);
  const usuario = await resposta.json();

  idInput.value = usuario.id;
  nomeInput.value = usuario.nome;
  emailInput.value = usuario.email;
}

form.addEventListener('submit', salvarUsuario);

cancelarEdicaoBtn.addEventListener('click', () => {
  limparFormulario();
  mostrarMensagem('Edicao cancelada');
});

tabela.addEventListener('click', (event) => {
  const editarId = event.target.getAttribute('data-editar');
  const excluirId = event.target.getAttribute('data-excluir');

  if (editarId) {
    editarUsuario(editarId);
  }

  if (excluirId) {
    excluirUsuario(excluirId);
  }
});

carregarUsuarios();