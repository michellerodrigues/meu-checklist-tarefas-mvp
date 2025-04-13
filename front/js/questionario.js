// Variáveis globais
let perguntaAtual = 0;
let respostas = {};
let questionarioUsuario = null;

// Função para inicializar o app quando ambos estiverem prontos
async function inicializarPainelUsuario() {
    // Verifica se o DOM já está pronto
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        await carregarQuestionario();
    } else {
        document.addEventListener('DOMContentLoaded', carregarQuestionario);
    }
}

async function carregarQuestionario() {
    console.log('DOMContentLoaded ou documento já pronto');
    
    try {
        const emailUsuario = localStorage.getItem('emailUsuario');
        if (!emailUsuario) {
            throw new Error('Usuário não autenticado');
        }

        questionarioUsuario = await obterQuestionarioUsuario(emailUsuario);
        console.log('Dados carregados:', questionarioUsuario);

        console.log('Inicializando questionário com dados:', questionarioUsuario);
        inicializarQuestionario();
        configurarNavegacaoQuestionario();

    } catch (error) {
        console.error('Falha na inicialização:', error);
    }
}

inicializarPainelUsuario();

function inicializarQuestionario() {
    const container = document.getElementById('perguntas-container');
       
    
    questionarioUsuario.perguntas.forEach((pergunta, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'pergunta-container';
        questionDiv.innerHTML = `
            <h3>${pergunta.texto}</h3>
            <div class="options-container">
                ${pergunta.opcoes.map(option => `
                    <label class="option-label">
                        <input 
                            type="${pergunta.tipo}" 
                            name="pergunta-${index}" 
                            value="${option.id}"
                            ${option.selecionada ? 'checked' : ''}
                        >
                        ${option.texto}
                    </label>
                `).join('')}
            </div>
        `;
        container.appendChild(questionDiv);
    });

    mostrarQuestaoAtual(perguntaAtual);
    atualizarProgresso();
    atualizarContadorRespostas();
}
function configurarNavegacaoQuestionario() {
    document.getElementById('next-btn').addEventListener('click', proximaPergunta);
    document.getElementById('prev-btn').addEventListener('click', perguntaAnterior);
    
    // Verificar respostas já selecionadas ao carregar
    verificarRespostasAnteriores();
    
    // Evento para novos inputs
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('change', function() {
            const perguntaIndice = parseInt(this.name.split('-')[1]);
            atualizarRespostas(perguntaIndice, this);
        });
    });
}

// Nova função para verificar respostas pré-existentes
function verificarRespostasAnteriores() {
    document.querySelectorAll('input:checked').forEach(input => {
        const perguntaIndice = parseInt(input.name.split('-')[1]);
        const fakeEvent = {
            target: input,
            checked: input.checked
        };
        atualizarRespostas(perguntaIndice, fakeEvent);
    });
}

// Função atualizarRespostas modificada
function atualizarRespostas(perguntaIndice, element) {
    const tipoPergunta = questionarioUsuario.perguntas[perguntaIndice].tipo;
    const input = element.target ? element.target : element;
    const value = input.value;
    const isChecked = input.checked;

    if (tipoPergunta === 'radio') {
        if (isChecked) {
            respostas[perguntaIndice] = [value];
        }
    } else {
        respostas[perguntaIndice] = respostas[perguntaIndice] || [];
        
        if (isChecked) {
            respostas[perguntaIndice].push(value);
        } else {
            respostas[perguntaIndice] = respostas[perguntaIndice].filter(v => v !== value);
        }
    }
}



// Função para mostrar a questão atual
function mostrarQuestaoAtual(index) {
    const perguntas = document.querySelectorAll('.pergunta-container');
    
    // Esconde todas as perguntas
    perguntas.forEach(pergunta => {
        pergunta.classList.remove('active');
    });
    
    // Mostra a pergunta atual
    perguntas[index].classList.add('active');
    
    // Atualiza estado dos botões
    document.getElementById('prev-btn').disabled = index === 0;
    document.getElementById('next-btn').textContent = 
        index === questionarioUsuario.perguntas.length - 1 ? 'Enviar' : 'Próxima';
}

// Atualiza a barra de progresso
function atualizarProgresso() {
    const progress = ((perguntaAtual + 1) / questionarioUsuario.perguntas.length) * 100;
    document.querySelector('.progress').style.width = `${progress}%`;
}

// Atualiza o contador de perguntas
function atualizarContadorRespostas() {
    document.getElementById('pergunta-contador').textContent = 
        `Pergunta ${perguntaAtual + 1} de ${questionarioUsuario.perguntas.length}`;
}

// Valida a questão atual
function validarPerguntaAtual() {
    const respostasAtuais = respostas[perguntaAtual];
    const tipoPergunta = questionarioUsuario.perguntas[perguntaAtual].tipo;
    let isValid = true;

    if (tipoPergunta === 'radio' && (!respostasAtuais || respostasAtuais.length === 0)) {
        showError('Por favor, selecione uma opção antes de continuar');
        isValid = false;
    }
    else if (tipoPergunta === 'checkbox' && (!respostasAtuais || respostasAtuais.length === 0)) {
        showError('Por favor, selecione pelo menos uma opção antes de continuar');
        isValid = false;
    }
    else {
        hideError();
    }

    return isValid;
}

// Navegação para próxima questão
function proximaPergunta() {
    if (!validarPerguntaAtual()) return;

    if (perguntaAtual < questionarioUsuario.perguntas.length - 1) {
        perguntaAtual++;
        mostrarQuestaoAtual(perguntaAtual);
        atualizarProgresso();
        atualizarContadorRespostas();
    } else {
        enviarQuestionário();
    }
}

// Navegação para questão anterior
function perguntaAnterior() {
    if (perguntaAtual > 0) {
        perguntaAtual--;
        mostrarQuestaoAtual(perguntaAtual);
        atualizarProgresso();
        atualizarContadorRespostas();
    }
}

// Exibe mensagem de erro
function showError(message) {
    const errorEl = document.getElementById('error-message');
    errorEl.textContent = message;
    errorEl.style.display = 'block';
}

// Oculta mensagem de erro
function hideError() {
    document.getElementById('error-message').style.display = 'none';
}


async function obterQuestionarioUsuario(emailUsuario)
       {
           try {

                const encodedEmail = encodeURIComponent(emailUsuario);
                const url = `http://127.0.0.1:8002/api/questionarios/${encodedEmail}`;

                const response = await fetch(url, {
                    mode: 'cors', 
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

               
               if (!response.ok) {
                   throw new Error('Erro na requisição');
               }
               
               return await response.json();
       
           } catch (error) {
               console.error('Erro ao buscar dados:', error);
               return [];
           }
       
       }

// Envia o questionário
async function enviarQuestionário() {
    try {
                
        const respostasDadas = questionarioUsuario.perguntas.map((pergunta, index) => ({
            pergunta_id: pergunta.id,
            opcoes_selecionadas: respostas[index] || []
        }));

        const response = await fetch('http://127.0.0.1:8002/api/questionarios', {
            mode: 'cors', 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id: questionarioUsuario.id,
                respostas: respostasDadas
            })

        });

        if (response.ok) {
            alert('Questionário enviado com sucesso!');
            
            const dadosQuestionarioRespondido = await response.json();

            localStorage.setItem('tagsUsuario', dadosQuestionarioRespondido.tags_usuario);
            window.location.href = '.././painelUsuario.html';
        } else {
            throw new Error('Falha ao enviar respostas');
        }
    } catch (error) {
        console.error('Erro:', error);
        showError('Ocorreu um erro ao enviar suas respostas. Tente novamente.');
    }
}
