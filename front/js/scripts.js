document.addEventListener("DOMContentLoaded", function() {
    console.log("O documento está pronto! scripts");
});

function criarComponenteTarefas(categoria, tarefas, posX = 0, posY = 0) {
    // Criar container
    const container = document.createElement('div');
    container.className = 'floating-table';
    container.style.left = `${posX}px`;
    container.style.top = `${posY}px`;

    // Cabeçalho
    const header = document.createElement('div');
    header.className = 'table-header';
    
    // Título
    const title = document.createElement('span');
    title.textContent = categoria;

    // Botão de minimizar
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'toggle-visibility';
    toggleBtn.textContent = '−';
    toggleBtn.onclick = () => {
        content.style.display = content.style.display === 'none' ? 'block' : 'none';
    };

    // Conteúdo
    const content = document.createElement('div');
    content.className = 'table-content';

    // Montar estrutura
    header.appendChild(title);
    header.appendChild(toggleBtn);
    container.appendChild(header);
    container.appendChild(content);
    document.body.appendChild(container);

    // Adicionar tabela
    content.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Tarefa</th>
                    <th>Frequencia</th>
                    <th>ÚltimaExeucao</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${tarefas.map(tarefa => `
                    <tr>
                        <td>${tarefa.descricao}</td>
                        <td>${tarefa.recorrencia}</td>
                        <td>TODO: colocar a execucao</td>
                        <td>
                            <div class="custom-control custom-switch">
                                <input 
                                    type="checkbox" 
                                    class="custom-control-input" 
                                    id="customSwitch${tarefa.id}"
                                    onclick="salvarExecucao(${tarefa.id},${localStorage.getItem('emailUsuario')} this.checked)"
                                    checked
                                >
                                <label class="custom-control-label" for="customSwitch${tarefa.id}"></label>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    // Tornar arrastável
    let isDragging = false;
    let currentX = 0;
    let currentY = 0;

    header.addEventListener('mousedown', startDragging);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDragging);

    function startDragging(e) {
        isDragging = true;
        currentX = e.clientX;
        currentY = e.clientY;
        container.style.zIndex = 1001;
    }

    function drag(e) {
        if (isDragging) {
            const deltaX = e.clientX - currentX;
            const deltaY = e.clientY - currentY;
            
            container.style.left = `${container.offsetLeft + deltaX}px`;
            container.style.top = `${container.offsetTop + deltaY}px`;
            
            currentX = e.clientX;
            currentY = e.clientY;
        }
    }

    function stopDragging() {
        isDragging = false;
        container.style.zIndex = 1000;
    }
}

export async function salvarExecucao(tarefaId, emailUsuario, checked)
{
    try {
        const response = await fetch('http://localhost:8002/api/tarefas/execucoes', { //TODO: criar rota no backend
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                tarefa_id: tarefaId,
                usuario_email: emailUsuario,
                checked: checked //TODO: Se desmarcar a data da ultima execução não muda, se marcar sim. 
                // Talvez criar essa flag mas controlar ultima execução para desflagar
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Erro ao registrar execução da tarefa');
        }
        
        alert('Uh huuu! Mais uma tarefa concluída, parabéns pelo empenho :)');
        window.location.href = ".././index.html";
    } catch (error) {
        document.getElementById('error-message').textContent = error.message;
    }
}


export async function carregarTarefasUsuario()
{
    try {
        const response = await fetch(`http://127.0.0.1:8002/api/categorias/`, {
            mode: 'cors', 
            headers: {
              'Content-Type': 'application/json',
            }
          });

        if (!response.ok) {
            throw new Error('Erro na requisição');
        }
        const tarefas_cadastradas = await response.json();
        
        const tagsUsuario = localStorage.getItem("tagsUsuario")
                                    .split(',')

        const tarefas_usuario = filtrarTarefasDoUsuario(tarefas_cadastradas, tagsUsuario);
        
        tarefas_usuario.forEach((categoria, index) => {
                // Posicionar tabelas em locais diferentes
                console.log('lista tarefas recebidas', categoria);
                console.log('lista tarefas index', index);
                const posX = 50 + (index * 320);
                const posY = 50 + (index * 50);
                criarComponenteTarefas(categoria.categoria, categoria.tarefas, posX, posY);
            });

    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        return [];
    }

}


function filtrarTarefasDoUsuario(data, tags) {
    return data.map(categoria => {
     
        const tarefasFiltradas = categoria.tarefas.filter(tarefa => 
            tarefa.tags.some(tag => tags.includes(tag)))
        
        if (tarefasFiltradas.length > 0) {
            return {
                categoria : categoria.categoria,
                tarefas: tarefasFiltradas
            };
        }
        return null;
    }).filter(categoria => categoria !== null);
}
