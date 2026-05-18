const API_URL = "http://localhost:8000";

let clientes = [];
let paginaAtualClientes = 1;
const clientesPorPagina = 10;

let pedidos = [];
let paginaAtualPedidos = 1;
const pedidosPorPagina = 10;

let categorias = [];

document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();

  const savedTheme = localStorage.getItem("theme") || "dark";
  aplicarTema(savedTheme);

  const fileInputClientes = document.getElementById("file-input");
  if (fileInputClientes) {
    fileInputClientes.addEventListener("change", (e) => importarPlanilha(e, "/clientes/importar-planilha", carregarClientes));
  }

  const fileInputPedidos = document.getElementById("file-input-pedidos");
  if (fileInputPedidos) {
    fileInputPedidos.addEventListener("change", (e) => importarPlanilha(e, "/pedidos/importar-planilha", carregarPedidos));
  }

  const formEditarCliente = document.getElementById("form-editar-cliente");
  if (formEditarCliente) {
    formEditarCliente.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = document.getElementById("edit-cliente-id").value;
      const dados = {
        nome: document.getElementById("edit-nome").value,
        email: document.getElementById("edit-email").value,
        telefone: document.getElementById("edit-telefone").value,
      };

      try {
        const response = await fetch(`${API_URL}/clientes/atualizar/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dados),
        });

        if (!response.ok) throw new Error();
        alert("Cliente updated successfully!");
        fecharModalEditar();
        carregarClientes();
      } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao atualizar cliente.");
      }
    });
  }

  const formEvento = document.getElementById("form-evento");
  if (formEvento) {
    formEvento.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = document.getElementById("evento-id").value;
      const data_input = document.getElementById("evento-data").value;

      const dadosEvento = {
        nome: document.getElementById("evento-nome").value,
        categoria_id: parseInt(document.getElementById("evento-categoria").value),
        data_evento: new Date(data_input).toISOString(),
        local: document.getElementById("evento-local").value,
        valor_passagem: parseFloat(document.getElementById("evento-valor").value),
        imagem: document.getElementById("evento-imagem-url").value || null
      };

      try {
        const url = id ? `${API_URL}/eventos/atualizar/${id}` : `${API_URL}/eventos/cadastrar`;
        const method = id ? "PUT" : "POST";

        const response = await fetch(url, {
          method: method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dadosEvento)
        });

        if (!response.ok) throw new Error();
        alert(id ? "Evento atualizado!" : "Evento cadastrado!");
        fecharModalEvento();
        carregarEventos();
      } catch (error) {
        console.error("Erro ao salvar evento:", error);
        alert("Erro ao salvar o evento.");
      }
    });
  }

  const prevBtn = document.getElementById("prev-page");
  const nextBtn = document.getElementById("next-page");
  if (prevBtn) prevBtn.addEventListener("click", () => { if (paginaAtualClientes > 1) { paginaAtualClientes--; mostrarPaginaClientes(); } });
  if (nextBtn) nextBtn.addEventListener("click", () => { if (paginaAtualClientes < Math.ceil(clientes.length / clientesPorPagina)) { paginaAtualClientes++; mostrarPaginaClientes(); } });

  const prevBtnPed = document.getElementById("prev-page-pedidos");
  const nextBtnPed = document.getElementById("next-page-pedidos");
  if (prevBtnPed) prevBtnPed.addEventListener("click", () => { if (paginaAtualPedidos > 1) { paginaAtualPedidos--; mostrarPaginaPedidos(); } });
  if (nextBtnPed) nextBtnPed.addEventListener("click", () => { if (paginaAtualPedidos < Math.ceil(pedidos.length / pedidosPorPagina)) { paginaAtualPedidos++; mostrarPaginaPedidos(); } });

  const themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const novoTema = document.body.classList.contains("light-mode") ? "dark" : "light";
      localStorage.setItem("theme", novoTema);
      aplicarTema(novoTema);
    });
  }

  carregarClientes();
});

async function importarPlanilha(event, endpoint, callbackSucesso) {
  const arquivo = event.target.files[0];
  if (!arquivo) return;

  const formData = new FormData();
  formData.append("file", arquivo);

  try {
    alert("Importando planilha...");
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error();
    const resultado = await response.json();
    alert(`Importação finalizada!\nRegistros afetados: ${resultado.total_importados || resultado.length}`);
    
    callbackSucesso();
    event.target.value = "";
  } catch (error) {
    console.error("Erro na importação:", error);
    alert("Erro ao importar planilha.");
  }
}

async function carregarClientes() {
  try {
    const response = await fetch(`${API_URL}/clientes/listar`);
    if (!response.ok) throw new Error();
    clientes = await response.json();
    clientes.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" }));
    paginaAtualClientes = 1;
    mostrarPaginaClientes();
  } catch (error) {
    console.error("Erro:", error);
    const tabela = document.getElementById("tabela-clientes-body");
    if (tabela) tabela.innerHTML = "<tr><td colspan='7' style='text-align:center;'>Erro ao carregar dados.</td></tr>";
  }
}

function mostrarPaginaClientes() {
  const tabela = document.getElementById("tabela-clientes-body");
  if (!tabela) return;
  tabela.innerHTML = "";

  const inicio = (paginaAtualClientes - 1) * clientesPorPagina;
  const fim = inicio + clientesPorPagina;
  const clientesPagina = clientes.slice(inicio, fim);

  clientesPagina.forEach((cliente) => {
    const dataNasc = cliente.data_nascimento
      ? new Date(cliente.data_nascimento).toLocaleDateString("pt-BR", { timeZone: "UTC" })
      : "---";
    const clienteJson = JSON.stringify(cliente).replace(/"/g, "&quot;");

    tabela.innerHTML += `
      <tr>
        <td><strong>${cliente.nome}</strong></td>
        <td>${cliente.cpf || "---"}</td>
        <td>${dataNasc}</td>
        <td>${cliente.email}</td>
        <td>${cliente.telefone || "---"}</td>
        <td><span class="status paid">Ativo</span></td>
        <td style="text-align: center;">
          <button class="btn-edit-table" onclick="abrirModalEditar(${clienteJson})">
            <i data-lucide="pencil" style="width: 16px;"></i>
          </button>
        </td>
      </tr>
    `;
  });

  const totalPaginas = Math.ceil(clientes.length / clientesPorPagina) || 1;
  if(document.getElementById("current-page")) document.getElementById("current-page").textContent = paginaAtualClientes;
  if(document.getElementById("total-pages")) document.getElementById("total-pages").textContent = totalPaginas;
  if(document.getElementById("prev-page")) document.getElementById("prev-page").disabled = paginaAtualClientes === 1;
  if(document.getElementById("next-page")) document.getElementById("next-page").disabled = paginaAtualClientes === totalPaginas;

  lucide.createIcons();
}

function abrirModalEditar(cliente) {
  document.getElementById("edit-cliente-id").value = cliente.id;
  document.getElementById("edit-nome").value = cliente.nome;
  document.getElementById("edit-email").value = cliente.email;
  document.getElementById("edit-telefone").value = cliente.telefone || "";
  document.getElementById("modal-editar-cliente").style.display = "flex";
}

function fecharModalEditar() {
  document.getElementById("modal-editar-cliente").style.display = "none";
}

async function carregarCategorias() {
  try {
    const response = await fetch(`${API_URL}/categorias/listar`);
    if (!response.ok) throw new Error();
    categorias = await response.json();
    
    const selectCategoria = document.getElementById("evento-categoria");
    if (!selectCategoria) return;

    selectCategoria.innerHTML = `
      <option value="" disabled selected hidden>
        Selecione uma categoria
      </option>
    `;

    categorias.forEach(cat => {
      selectCategoria.innerHTML += `<option value="${cat.id}">${cat.nome}</option>`;
    });
  } catch (error) {
    console.error("Erro ao sincronizar categorias com o backend:", error);
  }
}

async function carregarEventos() {
  try {
    if (categorias.length === 0) {
      await carregarCategorias();
    }

    const response = await fetch(`${API_URL}/eventos/listar`);
    if (!response.ok) return;
    const eventos = await response.json();
    const gridContainer = document.getElementById('tabela-eventos-body');
    if (!gridContainer) return;
    gridContainer.innerHTML = '';

    eventos.forEach(evento => {
      const dataFormatada = new Date(evento.data_evento).toLocaleDateString('pt-BR') + ' ' + 
                            new Date(evento.data_evento).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});

      // Modificado aqui: Se houver imagem cadastrada, cria a tag <img>, senão deixa vazio
      const tagImagem = evento.imagem ? `<img src="${evento.imagem}" alt="${evento.nome}">` : '';
      
      // Modificado aqui: Se não tiver imagem, adiciona a classe css 'no-image'
      const classeNoImage = evento.imagem ? '' : 'no-image';

      const objCategoria = categorias.find(c => c.id === evento.categoria_id);
      const nomeCategoria = objCategoria ? objCategoria.nome : `ID: ${evento.categoria_id}`;

      gridContainer.innerHTML += `
        <div class="event-card">
          <div class="event-card-banner ${classeNoImage}">
            ${tagImagem}
            <span class="event-card-category">${nomeCategoria}</span>
            <div class="event-card-actions">
              <button class="btn-edit-table" onclick="prepararEdicaoEvento(${evento.id})" title="Editar">
                <i data-lucide="pencil" style="width: 16px;"></i>
              </button>
              <button class="btn-edit-table btn-delete-table" onclick="deletarEvento(${evento.id})" title="Excluir">
                <i data-lucide="trash-2" style="width: 16px;"></i>
              </button>
            </div>
          </div>
          <div class="event-card-body">
            <h3 class="event-card-title">${evento.nome}</h3>
            <div class="event-card-info-item">
              <i data-lucide="calendar"></i>
              <span>${dataFormatada}</span>
            </div>
            <div class="event-card-info-item">
              <i data-lucide="map-pin"></i>
              <span>${evento.local}</span>
            </div>
            <div class="event-card-footer">
              <div>
                <div class="event-card-price-label">Passagem</div>
                <div class="event-card-price-value">R$ ${evento.valor_passagem.toFixed(2).replace('.', ',')}</div>
              </div>
            </div>
          </div>
        </div>
      `;
    });
    lucide.createIcons();
  } catch (error) {
    console.error("Erro ao carregar eventos:", error);
  }
}

async function fazerUploadImagem(input) {
  const file = input.files[0];
  if (!file) return;

  const statusLabel = document.getElementById('upload-status');
  if (statusLabel) {
    statusLabel.style.color = 'var(--text-dim)';
    statusLabel.innerText = "Enviando para o Supabase...";
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_URL}/upload/`, { method: 'POST', body: formData });
    const resultado = await response.json();
    
    if (resultado.url) {
      document.getElementById('evento-imagem-url').value = resultado.url;
      if (statusLabel) { statusLabel.style.color = '#00ff88'; statusLabel.innerText = "Upload concluído!"; }
    } else {
      if (statusLabel) { statusLabel.style.color = '#ff4d4d'; statusLabel.innerText = "Falha no envio."; }
    }
  } catch (error) {
    console.error("Erro no upload:", error);
  }
}

async function prepararEdicaoEvento(id) {
  try {
    await carregarCategorias();

    const response = await fetch(`${API_URL}/eventos/consultar/${id}`);
    if (!response.ok) return;
    const evento = await response.json();
    
    document.getElementById('modal-evento-titulo').innerText = "Editar Evento";
    document.getElementById('evento-id').value = evento.id;
    document.getElementById('evento-nome').value = evento.nome;
    document.getElementById('evento-categoria').value = evento.categoria_id;
    if(evento.data_evento) document.getElementById('evento-data').value = evento.data_evento.substring(0, 16);
    document.getElementById('evento-local').value = evento.local;
    document.getElementById('evento-valor').value = evento.valor_passagem;
    document.getElementById('evento-imagem-url').value = evento.imagem || '';
    
    document.getElementById('modal-evento').style.display = 'flex';
  } catch (error) {
    console.error(error);
  }
}

async function deletarEvento(id) {
  if (!confirm("Remover este evento de forma permanente?")) return;
  try {
    const response = await fetch(`${API_URL}/eventos/deletar/${id}`, { method: 'DELETE' });
    if (response.ok) carregarEventos();
  } catch (error) {
    console.error(error);
  }
}

async function abrirModalEvento() {
  document.getElementById('form-evento').reset();
  document.getElementById('evento-id').value = '';
  document.getElementById('evento-imagem-url').value = '';
  if(document.getElementById('upload-status')) document.getElementById('upload-status').innerText = '';
  
  await carregarCategorias();

  document.getElementById('modal-evento-titulo').innerText = "Cadastrar Evento";
  document.getElementById('modal-evento').style.display = 'flex';
}

function fecharModalEvento() { document.getElementById('modal-evento').style.display = 'none'; }

async function carregarPedidos() {
  try {
    const response = await fetch(`${API_URL}/pedidos/listar`);
    if (!response.ok) throw new Error();
    pedidos = await response.json();
    paginaAtualPedidos = 1;
    mostrarPaginaPedidos();
  } catch (error) {
    console.error(error);
  }
}

function mostrarPaginaPedidos() {
  const tabela = document.getElementById("tabela-pedidos-body");
  if (!tabela) return;
  tabela.innerHTML = "";

  const inicio = (paginaAtualPedidos - 1) * pedidosPorPagina;
  const fim = inicio + pedidosPorPagina;
  const pedidosPagina = pedidos.slice(inicio, fim);

  pedidosPagina.forEach((pedido) => {
    const dataVenda = pedido.data_venda ? new Date(pedido.data_venda).toLocaleDateString("pt-BR") : "---";
    tabela.innerHTML += `
      <tr>
        <td>#${pedido.id}</td>
        <td>ID: ${pedido.cliente_id}</td>
        <td>ID: ${pedido.evento_id}</td>
        <td>${dataVenda}</td>
        <td><span class="status paid">${pedido.status || "Pago"}</span></td>
        <td>R$ ${parseFloat(pedido.valor_lote).toFixed(2).replace('.', ',')}</td>
        <td style="text-align: center;">
           <button class="btn-edit-table" onclick="alert('Pedido ID: ' + ${pedido.id})" title="Visualizar">
             <i data-lucide="eye" style="width: 16px;"></i>
           </button>
        </td>
      </tr>
    `;
  });

  const totalPaginas = Math.ceil(pedidos.length / pedidosPorPagina) || 1;
  if(document.getElementById("current-page-pedidos")) document.getElementById("current-page-pedidos").textContent = paginaAtualPedidos;
  if(document.getElementById("total-pages-pedidos")) document.getElementById("total-pages-pedidos").textContent = totalPaginas;
  if(document.getElementById("prev-page-pedidos")) document.getElementById("prev-page-pedidos").disabled = paginaAtualPedidos === 1;
  if(document.getElementById("next-page-pedidos")) document.getElementById("next-page-pedidos").disabled = paginaAtualPedidos === totalPaginas;

  lucide.createIcons();
}

function trocarPagina(id) {
  document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));
  document.querySelectorAll(".nav-link").forEach((l) => l.classList.remove("active"));

  const tab = document.getElementById("content-" + id);
  const link = document.getElementById("link-" + id);

  if (tab) tab.classList.add("active");
  if (link) link.classList.add("active");

  if (id === "clientes") carregarClientes();
  if (id === "pedidos") carregarPedidos();
  if (id === "eventos") carregarEventos();
}

function aplicarTema(theme) {
  const body = document.body;
  const logo = document.getElementById("main-logo");
  const icon = document.getElementById("theme-icon");

  if (theme === "light") {
    body.classList.add("light-mode");
    if (logo) logo.src = "../static/img/logo_preta.png";
    if (icon) icon.setAttribute("data-lucide", "sun");
  } else {
    body.classList.remove("light-mode");
    if (logo) logo.src = "../static/img/logo_branca.png";
    if (icon) icon.setAttribute("data-lucide", "moon");
  }

  lucide.createIcons();
}