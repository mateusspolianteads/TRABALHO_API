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
            headers: { "Content-Type": "application/json" },
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
});

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

async function carregarClientes() {
  try {
    const response = await fetch("http://localhost:8000/clientes/listar");
    if (!response.ok) throw new Error("Erro na API");

    const clientes = await response.json();
    const tabela = document.getElementById("tabela-clientes-body");

    if (!tabela) return;
    tabela.innerHTML = "";

    clientes.forEach((cliente) => {
      const dataNasc = cliente.data_nascimento
        ? new Date(cliente.data_nascimento).toLocaleDateString("pt-BR", {
            timeZone: "UTC",
          })
        : "---";

      // Escapa aspas para evitar quebra no atributo onclick
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

    lucide.createIcons();
  } catch (error) {
    console.error("Erro:", error);
    const tabela = document.getElementById("tabela-clientes-body");
    if (tabela)
      tabela.innerHTML =
        "<tr><td colspan='7' style='text-align:center;'>Erro ao carregar dados.</td></tr>";
  }
}

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
