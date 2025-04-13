document.addEventListener("DOMContentLoaded", function() {
    console.log("O documento está pronto! script cadastro");

    const formCadastro = document.getElementById("cadastroForm")
    
    if (formCadastro) {
    
        formCadastro.addEventListener("submit", async function(event) {
            event.preventDefault();
        
            const nome = document.getElementById("nome").value;
            const email = document.getElementById("email").value;
            const senha = document.getElementById("senha").value;
            const confirmarSenha = document.getElementById("confirmarSenha").value;
        
            // Validações
            if (!nome || !email || !senha || !confirmarSenha) {
                alert("Preencha todos os campos!");
                return;
            }
        
            if (senha !== confirmarSenha) {
                alert("As senhas não coincidem!");
                return;
            }
        
            if (senha.length < 6) {
                alert("A senha deve ter pelo menos 6 caracteres!");
                return;
            }
        
           
            try {
                const response = await fetch('http://localhost:8002/api/auth/cadastro', {
                    mode: 'cors', 
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        nome: nome,
                        email: email,
                        senha: senha
                    })
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.detail || 'Erro no cadastro do usuário');
                }
                
                alert('Cadastro realizado com sucesso! Vamos la!');
                window.location.href = ".././index.html";
            } catch (error) {
                document.getElementById('error-message').textContent = error.message;
            }
        });
    }
});

