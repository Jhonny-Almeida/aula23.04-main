const form = document.getElementById('usuario-form');
const idInput = document.getElementById('usuario-id');
const nomeInput = document.getElementById('nome');
const emailInput = document.getElementById('email');
const tabela = document.getElementById('usuarios-tabela');
const mensagem = document.getElementById('mensagem');
const cancelarEdicaoBtn = document.getElementById('cancelar-edicao');

const API_URL = '/usuarios';
const STORAGE_KEY = 'usuarioDraft';

function mostrarMensagem(texto, erro = false) {
  mensagem.textContent = texto;
  mensagem.style.color = erro ? '#b42318' : '#0b5b55';
}

function salvarDadosLocalmente(dados) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
}

function carregarDadosSalvos() {
  const dados = localStorage.getItem(STORAGE_KEY);

  if (!dados) {
    return;
  }

  try {
    const usuario = JSON.parse(dados);

    idInput.value = usuario.id || '';
    nomeInput.value = usuario.nome || '';
    emailInput.value = usuario.email || '';

    mostrarMensagem('Dados carregados do navegador. Clique em Salvar para persistir.');
  } catch (error) {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function limparDadosLocais() {
  localStorage.removeItem(STORAGE_KEY);
}

function limparFormulario() {
  idInput.value = '';
  nomeInput.value = '';
  emailInput.value = '';
  limparDadosLocais();
}

async function carregarUsuarios() {
  try {
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
  } catch (error) {
    mostrarMensagem('Não foi possível carregar os usuários do servidor.', true);
  }
}

async function salvarUsuario(event) {
  event.preventDefault();

  const id = idInput.value;
  const payload = {
    id,
    nome: nomeInput.value.trim(),
    email: emailInput.value.trim()
  };

  if (!payload.nome || !payload.email) {
    mostrarMensagem('Nome e email são obrigatórios.', true);
    return;
  }

  salvarDadosLocalmente(payload);

  try {
    const metodo = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/${id}` : API_URL;

    const resposta = await fetch(url, {
      method: metodo,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nome: payload.nome, email: payload.email })
    });

    if (!resposta.ok) {
      const erro = await resposta.json();
      mostrarMensagem(erro.erro || 'Falha ao salvar usuário.', true);
      return;
    }

    mostrarMensagem(id ? 'Usuário atualizado com sucesso.' : 'Usuário criado com sucesso.');
    limparFormulario();
    carregarUsuarios();
  } catch (error) {
    mostrarMensagem('Dados salvos localmente, mas não foi possível conectar ao servidor.', true);
  }
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

carregarDadosSalvos();
carregarUsuarios();