// Inicializa ícones
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    const savedTheme = localStorage.getItem('theme') || 'dark';
    aplicarTema(savedTheme);
});

function trocarPagina(id) {
    // Esconde conteúdos
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    // Remove active dos links
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

    // Ativa os novos
    document.getElementById('content-' + id).classList.add('active');
    document.getElementById('link-' + id).classList.add('active');
}

// Lógica de Tema
const themeBtn = document.getElementById('theme-toggle');

function aplicarTema(theme) {
    const body = document.body;
    const logo = document.getElementById('main-logo');
    const icon = document.getElementById('theme-icon');

    if (theme === 'light') {
        body.classList.add('light-mode');
        logo.src = "../static/img/logo_preta.png";
        icon.setAttribute('data-lucide', 'sun');
    } else {
        body.classList.remove('light-mode');
        logo.src = "../static/img/logo_branca.png";
        icon.setAttribute('data-lucide', 'moon');
    }
    lucide.createIcons();
}

if (themeBtn) {
    themeBtn.addEventListener('click', () => {
        const novoTema = document.body.classList.contains('light-mode') ? 'dark' : 'light';
        localStorage.setItem('theme', novoTema);
        aplicarTema(novoTema);
    });
}