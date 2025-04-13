import { carregarTarefasUsuario } from './scripts.js';

document.addEventListener("DOMContentLoaded", function() {
    console.log("O documento está pronto: painel Usuário!");
    carregarTarefasUsuario(); 

    document.getElementById('logoutBtn').addEventListener('click', function() {
        window.location.href = '.././index.html';      
    });

});