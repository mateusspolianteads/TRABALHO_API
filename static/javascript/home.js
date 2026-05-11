document.addEventListener('DOMContentLoaded', () => {

    lucide.createIcons();

    const savedTheme = localStorage.getItem('theme') || 'dark';
    aplicarTema(savedTheme);

    // IMPORTAÇÃO DE PLANILHA
    const fileInput = document.getElementById("file-input");

    if (fileInput) {

        fileInput.addEventListener("change", async (event) => {

            const arquivo = event.target.files[0];

            if (!arquivo) {
                return;
            }

            const formData = new FormData();
            formData.append("file", arquivo);

            try {

                alert("Importando planilha...");

                const response = await fetch(
                    "http://localhost:8000/clientes/importar-planilha",
                    {
                        method: "POST",
                        body: formData
                    }
                );

                if (!response.ok) {
                    throw new Error("Erro ao importar planilha");
                }

                const resultado = await response.json();

                console.log(resultado);

                alert(
                    `Importação finalizada!\n\n` +
                    `Importados: ${resultado.total_importados}\n` +
                    `Erros: ${resultado.total_erros}`
                );

                // Atualiza tabela
                carregarClientes();

                // Limpa input
                fileInput.value = "";

            } catch (error) {

                console.error("Erro:", error);

                alert("Erro ao importar planilha.");

            }

        });

    }

});

function trocarPagina(id) {

    document.querySelectorAll('.tab-content')
        .forEach(c => c.classList.remove('active'));

    document.querySelectorAll('.nav-link')
        .forEach(l => l.classList.remove('active'));

    const tab = document.getElementById('content-' + id);
    const link = document.getElementById('link-' + id);

    if (tab) tab.classList.add('active');
    if (link) link.classList.add('active');

    if (id === "clientes") {
        carregarClientes();
    }

}

async function carregarClientes() {

    try {

        const response = await fetch(
            "http://localhost:8000/clientes/listar"
        );

        if (!response.ok) {
            throw new Error("Erro na API");
        }

        const clientes = await response.json();

        const tabela = document.querySelector(
            "#content-clientes tbody"
        );

        if (!tabela) return;

        tabela.innerHTML = "";

        clientes.forEach(cliente => {

            const dataNasc = cliente.data_nascimento
                ? new Date(cliente.data_nascimento)
                    .toLocaleDateString(
                        'pt-BR',
                        { timeZone: 'UTC' }
                    )
                : '---';

            tabela.innerHTML += `
                <tr>
                    <td><strong>${cliente.nome}</strong></td>
                    <td>${cliente.cpf || '---'}</td>
                    <td>${dataNasc}</td>
                    <td>${cliente.email}</td>
                    <td>${cliente.telefone || '---'}</td>
                    <td><span class="status paid">Ativo</span></td>
                </tr>
            `;
        });

    } catch (error) {

        console.error(
            "Erro ao carregar clientes:",
            error
        );

        const tabela = document.querySelector(
            "#content-clientes tbody"
        );

        if (tabela) {

            tabela.innerHTML = `
                <tr>
                    <td colspan='7' style='text-align:center;'>
                        Erro ao carregar dados da API.
                    </td>
                </tr>
            `;
        }

    }

}

// LÓGICA DE TEMA

const themeBtn = document.getElementById('theme-toggle');

function aplicarTema(theme) {

    const body = document.body;
    const logo = document.getElementById('main-logo');
    const icon = document.getElementById('theme-icon');

    if (theme === 'light') {

        body.classList.add('light-mode');

        if (logo)
            logo.src = "../static/img/logo_preta.png";

        if (icon)
            icon.setAttribute('data-lucide', 'sun');

    } else {

        body.classList.remove('light-mode');

        if (logo)
            logo.src = "../static/img/logo_branca.png";

        if (icon)
            icon.setAttribute('data-lucide', 'moon');

    }

    lucide.createIcons();

}

if (themeBtn) {

    themeBtn.addEventListener('click', () => {

        const novoTema =
            document.body.classList.contains('light-mode')
                ? 'dark'
                : 'light';

        localStorage.setItem('theme', novoTema);

        aplicarTema(novoTema);

    });

}