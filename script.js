// script.js

// 1. Sistema de Acessibilidade (Alto Contraste)
function toggleAccessibility() {
    const body = document.body;
    body.classList.toggle('accessibility-mode');
    
    // Salva a preferência do usuário
    const isAccessible = body.classList.contains('accessibility-mode');
    localStorage.setItem('acessibilidade', isAccessible);
}

// Carrega a preferência de acessibilidade ao abrir a página
function loadAccessibilityPref() {
    if (localStorage.getItem('acessibilidade') === 'true') {
        document.body.classList.add('accessibility-mode');
    }
}

// 2. Sistema de Login Simples
function handleLogin(event) {
    event.preventDefault(); // Impede o recarregamento do form
    
    const email = document.getElementById('email').value;
    const nome = email.split('@')[0]; // Pega o nome antes do @ para o avatar
    
    localStorage.setItem('userLogado', 'true');
    localStorage.setItem('userName', nome);
    
    calcularOfensiva();
    window.location.href = 'home.html';
}

function handleLogout() {
    localStorage.removeItem('userLogado');
    window.location.href = 'index.html';
}

// Verifica se o usuário pode acessar a tela protegida
function checkAuth() {
    if (localStorage.getItem('userLogado') !== 'true') {
        window.location.href = 'index.html';
    } else {
        updateNavbarUI();
    }
}

// 3. Sistema de Ofensivas (Streak)
function calcularOfensiva() {
    const dataAtual = new Date().toDateString();
    let ultimaData = localStorage.getItem('ultimaDataLogin');
    let streak = parseInt(localStorage.getItem('userStreak')) || 0;

    if (ultimaData === dataAtual) {
        // Já logou hoje, não muda nada
    } else if (ultimaData) {
        // Verifica se logou ontem
        let ontem = new Date();
        ontem.setDate(ontem.getDate() - 1);
        
        if (ultimaData === ontem.toDateString()) {
            streak += 1; // Logou dias seguidos
        } else {
            streak = 1; // Quebrou a sequência
        }
    } else {
        streak = 1; // Primeiro login
    }

    localStorage.setItem('ultimaDataLogin', dataAtual);
    localStorage.setItem('userStreak', streak);
}

// 4. Atualiza a Interface do Usuário (Nome e Fogo)
function updateNavbarUI() {
    const nome = localStorage.getItem('userName') || 'Aluno';
    const streak = localStorage.getItem('userStreak') || '0';
    
    const avatarEl = document.getElementById('user-avatar');
    const nameEl = document.getElementById('user-name');
    const streakEl = document.getElementById('user-streak');
    
    if (avatarEl) avatarEl.textContent = nome.charAt(0).toUpperCase();
    if (nameEl) nameEl.textContent = nome;
    if (streakEl) streakEl.textContent = `${streak} Dias`;
}

// Inicializações automáticas
document.addEventListener('DOMContentLoaded', () => {
    loadAccessibilityPref();
});
// --- SISTEMA INTERNO DA UNIDADE (opcoes-unidade.html) ---
function verificarProgressoInterno() {
    // 1. Verifica Material de Estudo (Vem da página material-estudo.html)
    if (localStorage.getItem('uni1_conteudo') === 'true') {
        marcarCheckbox('check-conteudo');
        desbloquearCard('card-exercicios');
        document.getElementById('txt-exercicios').innerText = "(Liberado! Clique para acessar)";
    }

    // 2. Verifica Trilha de Exercícios (Vem da página exercicios.html)
    // Se você completou o exercício 2 (o prático), vamos considerar a trilha feita para o teste
    if (localStorage.getItem('ex2_done') === 'true' || localStorage.getItem('uni1_exercicios') === 'true') {
        marcarCheckbox('check-exercicios');
        desbloquearCard('card-avaliacao');
        localStorage.setItem('uni1_exercicios', 'true'); // Garante que a flag está salva
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

// Utilitários visuais para as opções da unidade
function marcarCheckbox(id) {
    const el = document.getElementById(id);
    if(el) el.className = 'fas fa-check-square check-icon marcado';
}

function desbloquearCard(id) {
    const el = document.getElementById(id);
    if(el) el.classList.remove('locked');
}

// --- AVALIAÇÃO FINAL ---
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
        alert("Sua nota foi " + nota + "%. Para avançar, é necessário tirar no mínimo 80%.\nRevise o material e tente novamente!");
    }
}

// --- LÓGICA DA TELA DE MATERIAL DE ESTUDO (material-estudo.html) ---
document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('video-aula');
    if (video) {
        video.addEventListener('ended', function() {
            if (localStorage.getItem('video_concluido') !== 'true') {
                localStorage.setItem('video_concluido', 'true');
                alert("Ótimo! Você concluiu a videoaula.");
                atualizarStatusMaterial();
            }
        });
    }
});

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

// --- UTILITÁRIOS ---
function abrirConfiguracoes() { alert("Configurações em desenvolvimento."); }
function handleLogout() { alert("Saindo do sistema..."); }
function toggleAccessibility() { document.body.classList.toggle('accessibility-mode'); }

// --- SISTEMA DA TRILHA PRINCIPAL (unidades.html) ---
function verificarProgressoUnidades() {
    // Se a Unidade 1 inteira foi completada (nota >= 80 na avaliação)
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

// --- SISTEMA INTERNO DA UNIDADE (opcoes-unidade.html) ---
function verificarProgressoInterno() {
    // 1. Verifica Material de Estudo
    if (localStorage.getItem('uni1_conteudo') === 'true') {
        marcarCheckbox('check-conteudo');
        desbloquearCard('card-exercicios');
        document.getElementById('txt-exercicios').innerText = "(Liberado! Clique para simular)";
    }

    // 2. Verifica Trilha de Exercícios
    if (localStorage.getItem('uni1_exercicios') === 'true') {
        marcarCheckbox('check-exercicios');
        desbloquearCard('card-avaliacao');
        document.getElementById('txt-avaliacao').innerText = "(Liberado! Clique para fazer a prova)";
    }

    // 3. Verifica Avaliação Final
    if (localStorage.getItem('uni1_avaliacao') === 'true') {
        marcarCheckbox('check-avaliacao');
        document.getElementById('txt-avaliacao').innerText = "Aprovado! Unidade 2 desbloqueada na trilha.";
    }
}

// Utilitários visuais para as opções da unidade
function marcarCheckbox(id) {
    const el = document.getElementById(id);
    if(el) el.className = 'fas fa-check-square check-icon marcado';
}

function desbloquearCard(id) {
    const el = document.getElementById(id);
    if(el) el.classList.remove('locked');
}

// --- SIMULADORES (Atuam como o "Back-End" do sistema) ---

function simularTerminoConteudo() {
    alert("Sistema: Você assistiu as videoaulas e leu o material. Exercícios liberados!");
    localStorage.setItem('uni1_conteudo', 'true');
    verificarProgressoInterno();
}

function simularTerminoExercicios() {
    if(document.getElementById('card-exercicios').classList.contains('locked')) return;
    alert("Sistema: Você terminou todos os exercícios. A Avaliação Final foi liberada!");
    localStorage.setItem('uni1_exercicios', 'true');
    verificarProgressoInterno();
}

function simularAvaliacao() {
    if(document.getElementById('card-avaliacao').classList.contains('locked')) return;
    
    // Pergunta a nota ao aluno simulando o fim do quiz
    let nota = prompt("Simulação: Qual foi a sua nota na Avaliação Final? (Digite de 0 a 100)");
    
    // Verifica se cancelou ou digitou algo inválido
    if (nota === null || nota === "") return;
    
    nota = parseInt(nota);

    if (nota >= 80) {
        alert("Parabéns! Sua nota foi " + nota + "%. Você concluiu a Unidade 1!\nA Unidade 2 (Fluxogramas) já está desbloqueada na trilha principal.");
        
        // Salva que passou na avaliação da unidade internamente
        localStorage.setItem('uni1_avaliacao', 'true');
        
        // Salva que a unidade 1 inteira foi completada (Para a tela unidades.html)
        localStorage.setItem('unidade1Completed', 'true');
        
        verificarProgressoInterno();
    } else {
        alert("Sua nota foi " + nota + "%. Para avançar, é necessário tirar no mínimo 80%.\nRevise o material e tente novamente!");
    }
}

// --- UTILITÁRIOS EXTRAS ---
function resetarProgresso() {
    if(confirm("Tem certeza que deseja apagar todo o progresso para testar novamente?")) {
        localStorage.clear();
        location.reload();
    }
}

function abrirConfiguracoes() {
    alert("Configurações: Painel em desenvolvimento.");
}

function handleLogout() {
    alert("Saindo do sistema...");
    // window.location.href = 'login.html';
}

function toggleAccessibility() {
    document.body.classList.toggle('alto-contraste');
    alert("Acessibilidade ativada/desativada.");
}
// --- LÓGICA DA TELA DE MATERIAL DE ESTUDO ---

// 1. Detectar o fim do vídeo
document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('video-aula');
    
    // Verifica se a página contém o vídeo antes de adicionar o listener
    if (video) {
        video.addEventListener('ended', function() {
            // Quando o vídeo termina, marca como concluído no sistema
            if (localStorage.getItem('video_concluido') !== 'true') {
                localStorage.setItem('video_concluido', 'true');
                alert("Ótimo! Você concluiu a videoaula.");
                atualizarStatusMaterial();
            }
        });
    }
});

// 2. Ação de ler a apostila
function lerApostila() {
    // Abre um PDF de demonstração em uma nova aba
    window.open('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '_blank');
    
    // Se ainda não estava marcada como concluída, marca agora
    if (localStorage.getItem('apostila_concluida') !== 'true') {
        localStorage.setItem('apostila_concluida', 'true');
        atualizarStatusMaterial();
    }
}

// 3. Atualizar o visual das caixinhas e liberar a próxima etapa
function atualizarStatusMaterial() {
    const checkVideo = document.getElementById('check-video');
    const checkApostila = document.getElementById('check-apostila');
    
    if(!checkVideo || !checkApostila) return; // Só roda na página certa

    const videoFeito = localStorage.getItem('video_concluido') === 'true';
    const apostilaFeita = localStorage.getItem('apostila_concluida') === 'true';

    // Pinta as caixinhas de verde
    if (videoFeito) {
        checkVideo.className = 'fas fa-check-square check-icon marcado';
    }
    
    if (apostilaFeita) {
        checkApostila.className = 'fas fa-check-square check-icon marcado';
    }

    // Se ambos foram feitos, o material de estudo da unidade 1 está 100%
    if (videoFeito && apostilaFeita) {
        // Se ainda não tinha liberado a etapa geral, avisa e libera
        if (localStorage.getItem('uni1_conteudo') !== 'true') {
            localStorage.setItem('uni1_conteudo', 'true');
            // Dá um pequeno atraso de meio segundo para dar tempo do ícone ficar verde
            setTimeout(() => {
                alert("Parabéns! Você concluiu todo o material de estudo desta unidade.\nVocê já pode voltar e acessar a Trilha de Exercícios!");
            }, 500);
        }
    }
}
// --- DADOS DO QUIZ ---
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

// --- CONTROLE DE MUDANÇA DE TELA ANIMADA ---
function irParaFase(faseAtualId, proximaFaseId) {
    const atual = document.getElementById(faseAtualId);
    const proxima = document.getElementById(proximaFaseId);
    
    // Remove a classe active da atual, fazendo ela sumir
    atual.classList.remove('active');
    
    // Espera a animação de saída (500ms) e mostra a próxima
    setTimeout(() => {
        atual.classList.add('hidden');
        proxima.classList.remove('hidden');
        
        // Pega o próximo frame para a animação de entrada funcionar
        requestAnimationFrame(() => {
            proxima.classList.add('active');
        });
    }, 400); // 400ms para dar overlap suave
}

// --- FASE 1 ---
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

// --- FASE 2: SIMULADOR DE COMPILADOR C (SOMA) ---
function executarCodigoC_Fase2() {
    const code = document.getElementById('editor-fase2').value;
    const consoleOut = document.getElementById('console-fase2');
    
    consoleOut.className = 'console-output'; // Reseta cor
    consoleOut.innerText = "$ gcc main.c -o main\n$ ./main\n";
    
    setTimeout(() => {
        // Limpa espaços vazios e formatações para análise estática
        const cleanCode = code.replace(/\s+/g, '');
        
        // Verificações básicas de sintaxe C
        if (!code.includes(';')) {
            consoleOut.innerText += "main.c: erro: esperava ';' antes do fim do retorno.\n";
            consoleOut.className += ' console-error';
            return;
        }

        // Lógica de verificação da Soma
        // Procura por "return a+b;" ou parecidos
        const hasSumLogic = cleanCode.includes('returna+b;') || cleanCode.includes('returnb+a;') || cleanCode.includes('return(a+b);');
        
        if (hasSumLogic) {
            consoleOut.innerText += "[Test Case 1: soma(5, 5)] -> 10: PASSOU ✅\n[Test Case 2: soma(-2, 8)] -> 6: PASSOU ✅\n\n🎉 BUILD SUCESS! Código Aprovado.";
            setTimeout(() => irParaFase('fase2-container', 'fase3-container'), 2500);
        } else {
            consoleOut.innerText += "❌ Erro Lógico: A função não retornou a soma de 'a' e 'b'. Lembre-se do operador '+'.";
            consoleOut.className += ' console-error';
        }
    }, 800); // Delay falso para parecer que está compilando no servidor
}

// --- FASE 3: SIMULADOR C (PAR/ÍMPAR) ---
function avaliarDesafioFinalC() {
    const questaoA = document.getElementById('select-fase3').value;
    const codeB = document.getElementById('editor-fase3').value;
    const consoleOut = document.getElementById('console-fase3');
    
    consoleOut.className = 'console-output';
    consoleOut.classList.remove('hidden');
    consoleOut.innerText = "Analisando Sistema...\n";

    if (questaoA !== '%d') {
        consoleOut.innerText += "❌ Parte A: Erro. '%d' ou '%i' são usados para inteiros (decimal).\n";
        consoleOut.className += ' console-error';
        return;
    }
    consoleOut.innerText += "✅ Parte A: %d é Correto!\n\n$ gcc boss.c -o boss\n$ ./boss\n";

    setTimeout(() => {
        const cleanCode = codeB.replace(/\s+/g, '');
        
        // Verifica se usou o operador Módulo (%) e retornou 1 para par e 0 para ímpar
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
   SISTEMA DA AVALIAÇÃO FINAL (avaliacao.html)
   ========================================================================== */

const questoesProva = [
    { p: "Qual estrutura de repetição executa o bloco pelo menos uma vez antes de testar a condição?", op: ["for", "while", "do-while"], c: 2 },
    { p: "Em C, como declaramos uma variável do tipo caractere?", op: ["char letra;", "string letra;", "character letra;"], c: 0 },
    { p: "Qual é o operador lógico para 'OU' (OR) em C?", op: ["&&", "||", "!"], c: 1 },
    { p: "O que o comando 'return 0;' faz na função main()?", op: ["Gera um erro no código", "Indica que o programa terminou com sucesso", "Reinicia o computador"], c: 1 },
    { p: "Como adicionamos um comentário de uma linha em C?", op: ["// Comentário", "/* Comentário */", "# Comentário"], c: 0 }
];

let tempoProva = 3600; // 1 Hora em segundos
let timerInterval;

function carregarProva() {
    const container = document.getElementById('quiz-prova');
    if (!container) return; 

    let html = '';
    questoesProva.forEach((q, index) => {
        html += `<div class="questao-quiz"><p><strong>${index+1}. ${q.p}</strong> (10 pts)</p><div>`;
        q.op.forEach((opcao, opIndex) => {
            html += `<label class="opcao-quiz" style="display:block; margin: 8px 0;"><input type="radio" name="p${index}" value="${opIndex}"> ${opcao}</label>`;
        });
        html += `</div></div>`;
    });
    container.innerHTML = html;
}

function iniciarProva() {
    carregarProva();
    irParaFase('intro-prova', 'area-prova');
    
    // Inicia o Timer
    timerInterval = setInterval(atualizarTimer, 1000);
}

function atualizarTimer() {
    tempoProva--;
    
    const minutos = Math.floor(tempoProva / 60);
    const segundos = tempoProva % 60;
    
    const display = document.getElementById('timer-display');
    if(display) {
        display.innerHTML = `<i class="fas fa-clock"></i> ${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
        
        // Alerta nos últimos 5 minutos (300 segundos)
        if (tempoProva <= 300) {
            display.classList.add('warning');
        }
    }

    // Tempo esgotado
    if (tempoProva <= 0) {
        clearInterval(timerInterval);
        alert("O tempo esgotou! Entregando a prova automaticamente...");
        finalizarProva(true); // true indica que finalizou por tempo
    }
}

function avaliarCodigoProvaC() {
    const code = document.getElementById('editor-prova').value;
    const cleanCode = code.replace(/\s+/g, '');
    
    // Lógica simples de correção: Verifica se o aluno multiplicou a base pela altura
    const containsMultiplication = cleanCode.includes('returnbase*altura;') || 
                                   cleanCode.includes('returnaltura*base;') ||
                                   cleanCode.includes('return(base*altura);');
                                   
    return containsMultiplication ? 50 : 0; // Se acertar ganha 50 pontos
}

function finalizarProva(porTempo = false) {
    if (!porTempo) {
        const confirmar = confirm("Tem certeza que deseja entregar a prova? Não será possível alterar as respostas.");
        if (!confirmar) return;
    }

    clearInterval(timerInterval); // Para o cronômetro

    let notaObjetivas = 0;
    // Corrige as objetivas
    questoesProva.forEach((q, index) => {
        const selecionada = document.querySelector(`input[name="p${index}"]:checked`);
        if (selecionada && parseInt(selecionada.value) === q.c) {
            notaObjetivas += 10; // Cada uma vale 10 pontos
        }
    });

    // Corrige a prática
    const notaPratica = avaliarCodigoProvaC();
    
    // Calcula nota total
    const notaFinal = notaObjetivas + notaPratica;

    exibirResultado(notaFinal, notaObjetivas, notaPratica);
}

function exibirResultado(notaTotal, objPts, pratPts) {
    irParaFase('area-prova', 'resultado-prova');

    const icone = document.getElementById('resultado-icone');
    const titulo = document.getElementById('resultado-titulo');
    const msg = document.getElementById('resultado-mensagem');
    const detalhes = document.getElementById('resultado-detalhes');
    
    detalhes.classList.remove('hidden');
    detalhes.innerHTML = `Objetivas: <strong>${objPts}/50</strong> | Prática C: <strong>${pratPts}/50</strong>`;

    if (notaTotal >= 80) {
        icone.innerHTML = '<i class="fas fa-trophy" style="color: #f1c40f;"></i>';
        titulo.innerText = "Aprovado com Excelência!";
        titulo.style.color = "var(--success-green)";
        msg.innerText = `Sua nota final foi ${notaTotal}%. Você concluiu a Unidade 1 com maestria e desbloqueou a Unidade 2!`;
        detalhes.className = 'resultado-box resultado-sucesso';
        
        // Salva o progresso no banco
        localStorage.setItem('uni1_avaliacao', 'true');
        localStorage.setItem('unidade1Completed', 'true');
        
    } else {
        icone.innerHTML = '<i class="fas fa-times-circle" style="color: #e74c3c;"></i>';
        titulo.innerText = "Não foi dessa vez...";
        titulo.style.color = "#e74c3c";
        msg.innerText = `Sua nota final foi ${notaTotal}%. Você precisa de no mínimo 80% para aprovação. Revise o material e tente novamente!`;
        detalhes.className = 'resultado-box resultado-erro';
    }
}

function voltarParaUnidade() {
    window.location.href = "opcoes-unidade.html";
}
