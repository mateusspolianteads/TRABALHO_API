document.addEventListener("DOMContentLoaded", () => {
  lucide.createIcons();

  const savedTheme = localStorage.getItem("theme") || "dark";
  aplicarTema(savedTheme);

  const fileInput = document.getElementById("file-input");

  if (fileInput) {
    fileInput.addEventListener("change", async (event) => {
      const arquivo = event.target.files[0];
      if (!arquivo) return;

      const formData = new FormData();
      formData.append("file", arquivo);

      try {
        alert("Importando planilha...");

        const response = await fetch(
          "http://localhost:8000/clientes/importar-planilha",
          {
            method: "POST",
            body: formData,
          },
        );

        if (!response.ok) throw new Error("Erro ao importar planilha");

        const resultado = await response.json();

        alert(
          `Importação finalizada!\nImportados: ${resultado.total_importados}`,
        );

        carregarClientes();
        fileInput.value = "";
      } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao importar planilha.");
      }
    });
  }

  const formEditar = document.getElementById("form-editar-cliente");

  if (formEditar) {
    formEditar.addEventListener("submit", async (e) => {
      e.preventDefault();

      const id = document.getElementById("edit-cliente-id").value;

      const dados = {
        nome: document.getElementById("edit-nome").value,
        email: document.getElementById("edit-email").value,
        telefone: document.getElementById("edit-telefone").value,
      };

      try {
        const response = await fetch(
          `http://localhost:8000/clientes/atualizar/${id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(dados),
          },
        );

        if (!response.ok) throw new Error("Erro ao atualizar");

        alert("Cliente atualizado com sucesso!");
        fecharModalEditar();
        carregarClientes();
      } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao atualizar cliente.");
      }
    });
  }

  carregarClientes();
});

let clientes = [];
let paginaAtual = 1;
const clientesPorPagina = 10;

const currentPageSpan = document.getElementById("current-page");
const totalPagesSpan = document.getElementById("total-pages");
const prevBtn = document.getElementById("prev-page");
const nextBtn = document.getElementById("next-page");

async function carregarClientes() {
  try {
    const response = await fetch("http://localhost:8000/clientes/listar");

    if (!response.ok) throw new Error("Erro na API");

    clientes = await response.json();

    clientes.sort((a, b) =>
      a.nome.localeCompare(b.nome, "pt-BR", {
        sensitivity: "base",
      }),
    );

    paginaAtual = 1;
    mostrarPagina();
  } catch (error) {
    console.error("Erro:", error);

    const tabela = document.getElementById("tabela-clientes-body");

    if (tabela) {
      tabela.innerHTML =
        "<tr><td colspan='7' style='text-align:center;'>Erro ao carregar dados.</td></tr>";
    }
  }
}

function mostrarPagina() {
  const tabela = document.getElementById("tabela-clientes-body");

  if (!tabela) return;

  tabela.innerHTML = "";

  const inicio = (paginaAtual - 1) * clientesPorPagina;
  const fim = inicio + clientesPorPagina;

  const clientesPagina = clientes.slice(inicio, fim);

  clientesPagina.forEach((cliente) => {
    const dataNasc = cliente.data_nascimento
      ? new Date(cliente.data_nascimento).toLocaleDateString("pt-BR", {
          timeZone: "UTC",
        })
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

  currentPageSpan.textContent = paginaAtual;
  totalPagesSpan.textContent = totalPaginas;

  prevBtn.disabled = paginaAtual === 1;
  nextBtn.disabled = paginaAtual === totalPaginas;

  lucide.createIcons();
}

prevBtn.addEventListener("click", () => {
  if (paginaAtual > 1) {
    paginaAtual--;
    mostrarPagina();
  }
});

nextBtn.addEventListener("click", () => {
  const totalPaginas = Math.ceil(clientes.length / clientesPorPagina);

  if (paginaAtual < totalPaginas) {
    paginaAtual++;
    mostrarPagina();
  }
});

function abrirModalEditar(cliente) {
  document.getElementById("edit-cliente-id").value = cliente.id;
  document.getElementById("edit-nome").value = cliente.nome;
  document.getElementById("edit-email").value = cliente.email;
  document.getElementById("edit-telefone").value = cliente.telefone || "";

  document.getElementById("modal-editar-cliente").style.display = "flex";

  lucide.createIcons();
}

function fecharModalEditar() {
  document.getElementById("modal-editar-cliente").style.display = "none";
}

function trocarPagina(id) {
  document
    .querySelectorAll(".tab-content")
    .forEach((c) => c.classList.remove("active"));

  document
    .querySelectorAll(".nav-link")
    .forEach((l) => l.classList.remove("active"));

  const tab = document.getElementById("content-" + id);
  const link = document.getElementById("link-" + id);

  if (tab) tab.classList.add("active");
  if (link) link.classList.add("active");

  if (id === "clientes") carregarClientes();
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

const themeBtn = document.getElementById("theme-toggle");

if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    const novoTema = document.body.classList.contains("light-mode")
      ? "dark"
      : "light";

    localStorage.setItem("theme", novoTema);
    aplicarTema(novoTema);
  });
}
