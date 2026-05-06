document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('.login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(loginForm);
            const dados = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('http://127.0.0.1:8000/usuarios/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dados)
                });

                const resultado = await response.json();

                if (response.ok) {
                    alert("Sucesso: " + (resultado.mensagem || "Operação realizada!"));
                    window.location.href = "home.html"; 
                } else {
                    alert("Atenção: " + (resultado.detail || "Erro ao processar dados"));
                }
            } catch (error) {
                console.error("Erro na requisição:", error);
                alert("Servidor Offline. Verifique se o Python está rodando.");
            }
        });
    }
});