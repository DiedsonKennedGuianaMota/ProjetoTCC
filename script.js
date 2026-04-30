/* ==========================================================================
   LÓGICA GERAL & UTILITÁRIOS
   ========================================================================== */

function resetarProgresso() {
    if(confirm("Tem certeza que deseja apagar todo o progresso para testar novamente?")) {
        localStorage.clear();
        location.reload();
    }
}

function abrirConfiguracoes() { alert("Configurações: Painel em desenvolvimento."); }
function handleLogout() { alert("Saindo do sistema..."); }
function toggleAccessibility() { document.body.classList.toggle('alto-contraste'); alert("Modo acessibilidade alternado."); }

/* ==========================================================================
   SISTEMA DA TRILHA PRINCIPAL (unidades.html)
   ========================================================================== */

function verificarProgressoUnidades() {
    if (localStorage.getItem('unidade1Completed') === 'true') {
        const uni2 = document.getElementById('unidade-2');
        const linha1 = document.getElementById('linha-1');
        
        if (uni2) {
            uni2.classList.remove('locked');
            uni2.classList.add('unlocked');
            uni2.outerHTML = uni2.outerHTML.replace('<div', '<a href="#"').replace('</div', '</a');
            
            const newUni2 = document.getElementById('unidade-2');
            if(newUni2) newUni2.querySelector('.trilha-icon i').className = 'fas fa-project-diagram'; 
        }
        if (linha1) linha1.classList.remove('locked');
    }
}

/* ==========================================================================
   SISTEMA INTERNO DA UNIDADE (opcoes-unidade.html)
   ========================================================================== */

function verificarProgressoInterno() {
    // 1. Verifica Material de Estudo
    if (localStorage.getItem('uni1_conteudo') === 'true') {
        marcarCheckbox('check-conteudo');
        desbloquearCard('card-exercicios');
        const txtExe = document.getElementById('txt-exercicios');
        if(txtExe) txtExe.innerText = "(Liberado! Clique para acessar)";
    }

    // 2. Verifica Trilha de Exercícios
    if (localStorage.getItem('uni1_exercicios') === 'true') {
        marcarCheckbox('check-exercicios');
        desbloquearCard('card-avaliacao');
        const txtAva = document.getElementById('txt-avaliacao');
        if(txtAva) txtAva.innerText = "(Liberado! Clique para fazer a prova)";
    }

    // 3. Verifica Avaliação Final
    if (localStorage.getItem('uni1_avaliacao') === 'true') {
        marcarCheckbox('check-avaliacao');
        const txtAva = document.getElementById('txt-avaliacao');
        if(txtAva) txtAva.innerText = "Aprovado! Unidade 2 desbloqueada na trilha.";
    }
}

function marcarCheckbox(id) {
    const el = document.getElementById(id);
    if(el) el.className = 'fas fa-check-square check-icon marcado';
}

function desbloquearCard(id) {
    const el = document.getElementById(id);
    if(el) el.classList.remove('locked');
}

function simularAvaliacao() {
    if(document.getElementById('card-avaliacao').classList.contains('locked')) return;
    
    let nota = prompt("Simulação: Qual foi a sua nota na Avaliação Final? (Digite de 0 a 100)");
    if (nota === null || nota === "") return;
    
    nota = parseInt(nota);

    if (nota >= 80) {
        alert("Parabéns! Sua nota foi " + nota + "%. Você concluiu a Unidade 1!\nA Unidade 2 já está desbloqueada na trilha principal.");
        localStorage.setItem('uni1_avaliacao', 'true');
        localStorage.setItem('unidade1Completed', 'true');
        verificarProgressoInterno();
    } else {
        alert("Sua nota foi " + nota + "%. Para avançar, é necessário tirar no mínimo 80%.");
    }
}

/* ==========================================================================
   SISTEMA MATERIAL DE ESTUDO (material-estudo.html)
   ========================================================================== */

function lerApostila() {
    window.open('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '_blank');
    if (localStorage.getItem('apostila_concluida') !== 'true') {
        localStorage.setItem('apostila_concluida', 'true');
        atualizarStatusMaterial();
    }
}

function atualizarStatusMaterial() {
    const checkVideo = document.getElementById('check-video');
    const checkApostila = document.getElementById('check-apostila');
    
    if(!checkVideo || !checkApostila) return;

    const videoFeito = localStorage.getItem('video_concluido') === 'true';
    const apostilaFeita = localStorage.getItem('apostila_concluida') === 'true';

    if (videoFeito) checkVideo.className = 'fas fa-check-square check-icon marcado';
    if (apostilaFeita) checkApostila.className = 'fas fa-check-square check-icon marcado';

    if (videoFeito && apostilaFeita) {
        if (localStorage.getItem('uni1_conteudo') !== 'true') {
            localStorage.setItem('uni1_conteudo', 'true');
            setTimeout(() => {
                alert("Parabéns! Você concluiu o material de estudo.\nA Trilha de Exercícios foi liberada!");
            }, 500);
        }
    }
}

/* ==========================================================================
   SISTEMA DE EXERCÍCIOS GAMIFICADO E SIMULADOR C (exercicios.html)
   ========================================================================== */

const perguntasFase1 = [
    { p: "O que é um algoritmo?", op: ["Linguagem", "Passos finitos", "Hardware"], c: 1 },
    { p: "Tipo de dado para '10.5'?", op: ["int", "float/double", "char"], c: 1 },
    { p: "Variável booleana?", op: ["Letras", "Verdadeiro/Falso", "0 a 100"], c: 1 },
    { p: "Função do IF?", op: ["Repetir", "Decisão baseada em condição", "Imprimir"], c: 1 },
    { p: "Em C, como termina uma instrução?", op: [ "Ponto e vírgula (;)", "Dois pontos (:)", "Ponto (.)"], c: 0 }
];

function carregarQuizFase1() {
    const container = document.getElementById('quiz-fase1');
    if (!container) return; 

    let html = '';
    perguntasFase1.forEach((q, index) => {
        html += `<div class="questao-quiz"><p><strong>${index+1}. ${q.p}</strong></p><div>`;
        q.op.forEach((opcao, opIndex) => {
            html += `<label class="opcao-quiz"><input type="radio" name="q${index}" value="${opIndex}"> ${opcao}</label>`;
        });
        html += `</div></div>`;
    });
    container.innerHTML = html;
}

function irParaFase(faseAtualId, proximaFaseId) {
    const atual = document.getElementById(faseAtualId);
    const proxima = document.getElementById(proximaFaseId);
    
    atual.classList.remove('active');
    
    setTimeout(() => {
        atual.classList.add('hidden');
        proxima.classList.remove('hidden');
        requestAnimationFrame(() => {
            proxima.classList.add('active');
        });
    }, 400);
}

function corrigirFase1() {
    let acertos = 0;
    let todas = true;

    perguntasFase1.forEach((q, index) => {
        const selecionada = document.querySelector(`input[name="q${index}"]:checked`);
        if (!selecionada) todas = false;
        else if (parseInt(selecionada.value) === q.c) acertos++;
    });

    const boxResult = document.getElementById('resultado-fase1');
    boxResult.classList.remove('hidden', 'resultado-sucesso', 'resultado-erro');

    if (!todas) {
        boxResult.innerText = "Responda todas as questões!";
        boxResult.classList.add('resultado-erro');
        return;
    }

    const nota = (acertos / perguntasFase1.length) * 100;

    if (nota >= 80) {
        boxResult.innerText = `Nota: ${nota}%. Destravando Fase 2...`;
        boxResult.classList.add('resultado-sucesso');
        setTimeout(() => irParaFase('fase1-container', 'fase2-container'), 1500);
    } else {
        boxResult.innerText = `Nota: ${nota}%. Mínimo de 80%. Tente novamente!`;
        boxResult.classList.add('resultado-erro');
    }
}

function executarCodigoC_Fase2() {
    const code = document.getElementById('editor-fase2').value;
    const consoleOut = document.getElementById('console-fase2');
    
    consoleOut.className = 'console-output'; 
    consoleOut.innerText = "$ gcc main.c -o main\n$ ./main\n";
    
    setTimeout(() => {
        const cleanCode = code.replace(/\s+/g, '');
        
        if (!code.includes(';')) {
            consoleOut.innerText += "main.c: erro: esperava ';' antes do fim da instrução.\n";
            consoleOut.className += ' console-error';
            return;
        }

        const hasSumLogic = cleanCode.includes('returna+b;') || cleanCode.includes('returnb+a;') || cleanCode.includes('return(a+b);');
        
        if (hasSumLogic) {
            consoleOut.innerText += "[Test Case 1: soma(5, 5)] -> 10: PASSOU ✅\n[Test Case 2: soma(-2, 8)] -> 6: PASSOU ✅\n\n🎉 BUILD SUCESS! Código Aprovado.";
            setTimeout(() => irParaFase('fase2-container', 'fase3-container'), 2500);
        } else {
            consoleOut.innerText += "❌ Erro Lógico: A função não retornou a soma de 'a' e 'b'. Lembre-se do operador '+'.";
            consoleOut.className += ' console-error';
        }
    }, 800);
}

function avaliarDesafioFinalC() {
    const questaoA = document.getElementById('select-fase3').value;
    const codeB = document.getElementById('editor-fase3').value;
    const consoleOut = document.getElementById('console-fase3');
    
    consoleOut.className = 'console-output';
    consoleOut.classList.remove('hidden');
    consoleOut.innerText = "Analisando Sistema...\n";

    if (questaoA !== '%d') {
        consoleOut.innerText += "❌ Parte A: Erro. '%d' ou '%i' são usados para inteiros.\n";
        consoleOut.className += ' console-error';
        return;
    }
    consoleOut.innerText += "✅ Parte A: %d é Correto!\n\n$ gcc boss.c -o boss\n$ ./boss\n";

    setTimeout(() => {
        const cleanCode = codeB.replace(/\s+/g, '');
        const usedModulo = cleanCode.includes('%2');
        const correctLogic = cleanCode.includes('%2==0') || cleanCode.includes('%2===0');
        
        if (usedModulo && correctLogic) {
            consoleOut.innerText += "✅ Teste [ehPar(4)] -> 1: PASSOU\n✅ Teste [ehPar(7)] -> 0: PASSOU\n\n🏆 PARABÉNS! COMPILADO COM SUCESSO. Você venceu a unidade!";
            
            localStorage.setItem('uni1_exercicios', 'true');
            
            setTimeout(() => {
                alert("Nível Concluído! Retornando ao Menu da Unidade.");
                window.location.href = "opcoes-unidade.html";
            }, 3000);
        } else {
            consoleOut.innerText += "❌ Parte B: Erro. A função falhou. Dica: Use o operador de resto de divisão '%' por 2.";
            consoleOut.className += ' console-error';
        }
    }, 1000);
}

/* ==========================================================================
   EVENT LISTENERS INICIAIS
   ========================================================================== */
document.addEventListener('DOMContentLoaded', function() {
    // Para unidades.html
    verificarProgressoUnidades();
    
    // Para opcoes-unidade.html
    if(document.getElementById('card-avaliacao')) {
        verificarProgressoInterno();
    }
    
    // Para material-estudo.html
    const video = document.getElementById('video-aula');
    if (video) {
        atualizarStatusMaterial();
        video.addEventListener('ended', function() {
            if (localStorage.getItem('video_concluido') !== 'true') {
                localStorage.setItem('video_concluido', 'true');
                alert("Ótimo! Você concluiu a videoaula.");
                atualizarStatusMaterial();
            }
        });
    }

    // Para exercicios.html
    carregarQuizFase1();
});