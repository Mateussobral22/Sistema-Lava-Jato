// Dashboard expandido
function atualizarDashboard() {
    const hoje = new Date().toLocaleDateString();
    const servicosHoje = servicos.filter(s => s.data === hoje);
    const servicosConcluidos = servicos.filter(s => s.status === 'Concluído');
    const servicosPendentes = servicos.filter(s => s.status === 'Pendente');
    const servicosAndamento = servicos.filter(s => s.status === 'Em Andamento');
    
    // Faturamento
    const faturamentoHoje = servicosConcluidos
        .filter(s => s.data === hoje)
        .reduce((total, s) => total + s.valor, 0);
    
    const faturamentoMes = servicosConcluidos
        .reduce((total, s) => total + s.valor, 0);
    
    // Atualizar cards principais
    document.getElementById('faturamentoHoje').textContent = `R$ ${faturamentoHoje.toFixed(2)}`;
    document.getElementById('servicosHoje').textContent = servicosHoje.length;
    document.getElementById('faturamentoMes').textContent = `R$ ${faturamentoMes.toFixed(2)}`;
    
    // Calcular progresso da meta
    const progressoMeta = Math.min((faturamentoMes / metas.faturamento) * 100, 100);
    document.getElementById('progressMeta').style.width = `${progressoMeta}%`;
    document.getElementById('percentualMeta').textContent = `${Math.round(progressoMeta)}%`;
    
    // Dias restantes no mês
    const hoje_date = new Date();
    const ultimoDiaMes = new Date(hoje_date.getFullYear(), hoje_date.getMonth() + 1, 0);
    const diasRestantes = Math.ceil((ultimoDiaMes - hoje_date) / (1000 * 60 * 60 * 24));
    document.getElementById('diasRestantes').textContent = `Restam ${diasRestantes} dias no mês`;
    
    // Ticket médio
    const ticketMedio = servicosConcluidos.length > 0 ? 
        faturamentoMes / servicosConcluidos.length : 0;
    document.getElementById('ticketMedio').textContent = `R$ ${ticketMedio.toFixed(2)}`;
    
    // Clientes únicos
    const clientesUnicos = [...new Set(servicos.map(s => s.cliente.toLowerCase()))].length;
    document.getElementById('clientesUnicos').textContent = clientesUnicos;
    
    // Taxa de retorno (clientes que voltaram)
    const clientesRepetidos = servicos.reduce((acc, servico) => {
        const cliente = servico.cliente.toLowerCase();
        acc[cliente] = (acc[cliente] || 0) + 1;
        return acc;
    }, {});
    const clientesQueVoltaram = Object.values(clientesRepetidos).filter(count => count > 1).length;
    const taxaRetorno = clientesUnicos > 0 ? (clientesQueVoltaram / clientesUnicos * 100) : 0;
    document.getElementById('taxaRetorno').textContent = `${Math.round(taxaRetorno)}%`;
    
    // Estatísticas detalhadas
    document.getElementById('servicosPendentes').textContent = servicosPendentes.length;
    document.getElementById('servicosAndamento').textContent = servicosAndamento.length;
    document.getElementById('servicosConcluidos').textContent = servicosConcluidos.filter(s => s.data === hoje).length;
    
    // Eficiência diária (serviços concluídos vs total do dia)
    const eficiencia = servicosHoje.length > 0 ? 
        (servicosHoje.filter(s => s.status === 'Concluído').length / servicosHoje.length * 100) : 0;
    document.getElementById('eficiencia').textContent = `${Math.round(eficiencia)}%`;
    
    // Serviço mais popular
    const contagemServicos = servicosConcluidos.reduce((acc, s) => {
        acc[s.tipo] = (acc[s.tipo] || 0) + 1;
        return acc;
    }, {});
    const servicoMaisPopular = Object.entries(contagemServicos)
        .sort(([,a], [,b]) => b - a)[0];
    
    if (servicoMaisPopular) {
        document.getElementById('servicoPopular').textContent = servicoMaisPopular[0];
        document.getElementById('quantidadePopular').textContent = `${servicoMaisPopular[1]} realizações este mês`;
    }
    
    // Atualizar ranking de serviços
    atualizarRankingServicos(contagemServicos);
    
    // Atualizar barras de meta
    atualizarBarrasMeta(faturamentoMes, servicosConcluidos.length, clientesUnicos);
    
    // Serviços recentes
    const servicosRecentes = document.getElementById('servicosRecentes');
    if (servicosHoje.length > 0) {
        servicosRecentes.innerHTML = servicosHoje.slice(-5).map(s => `
            <div style="padding: 12px; border-left: 3px solid #ffd700; margin: 8px 0; background: #1a1a1a; border-radius: 5px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong style="color: #ffd700;">${s.cliente}</strong> - ${s.tipo}<br>
                        <span style="color: #cccccc; font-size: 0.9rem;">${s.veiculo}</span>
                    </div>
                    <div style="text-align: right;">
                        <div style="color: #ffffff; font-weight: bold;">R$ ${s.valor.toFixed(2)}</div>
                        <span class="status-badge status-${s.status.toLowerCase().replace(' ', '').replace('ã', 'a')}">${s.status}</span>
                    </div>
                </div>
            </div>
        `).join('');
    } else {
        servicosRecentes.innerHTML = '<p style="text-align: center; color: #cccccc; padding: 20px;">Nenhum serviço registrado hoje.</p>';
    }
    
    // Produtos em baixa (alertas)
    const produtosBaixa = produtos.filter(p => p.estoque <= p.estoqueMinimo);
    const produtosBaixaDiv = document.getElementById('produtosBaixa');
    
    if (produtosBaixa.length > 0) {
        produtosBaixaDiv.innerHTML = produtosBaixa.map(p => `
            <div style="padding: 12px; border-left: 3px solid #ff0000; margin: 8px 0; background: rgba(255, 0, 0, 0.1); border-radius: 5px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong style="color: #ff0000;">⚠️ ${p.nome}</strong><br>
                        <span style="color: #ffffff; font-size: 0.9rem;">Categoria: ${p.categoria}</span>
                    </div>
                    <div style="text-align: right; color: #ff0000; font-weight: bold;">
                        ${p.estoque}/${p.estoqueMinimo}<br>
                        <small style="color: #ffd700;">CRÍTICO</small>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Atualizar insight de alerta
        document.getElementById('insightAlerta').textContent = 
            `${produtosBaixa.length} produtos próximos do estoque mínimo`;
    } else {
        produtosBaixaDiv.innerHTML = '<p style="text-align: center; color: #00ff00; padding: 20px;">✅ Todos os produtos em estoque adequado.</p>';
        document.getElementById('insightAlerta').textContent = 'Todos os estoques estão adequados';
    }
    
    // Atualizar insights dinâmicos
    atualizarInsights(faturamentoMes, progressoMeta, servicosHoje.length);
}

function atualizarRankingServicos(contagemServicos) {
    const rankingContainer = document.getElementById('rankingServicos');
    const servicosOrdenados = Object.entries(contagemServicos)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3);
    
    const posicoes = ['1º', '2º', '3º'];
    
function atualizarRankingServicos(contagemServicos) {
    const rankingContainer = document.getElementById('rankingServicos');
    const servicosOrdenados = Object.entries(contagemServicos)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3);
    
    const posicoes = ['1º', '2º', '3º'];
    const todosServicos = ['Lavagem Completa', 'Lavagem Simples', 'Enceramento', 'Lavagem + Enceramento'];
    
    // Garantir que sempre temos 3 itens no ranking
    while (servicosOrdenados.length < 3) {
        const servicoFaltante = todosServicos.find(s => !servicosOrdenados.some(([nome]) => nome === s));
        if (servicoFaltante) {
            servicosOrdenados.push([servicoFaltante, 0]);
        } else {
            break;
        }
    }
     }
    
    rankingContainer.innerHTML = servicosOrdenados.map(([servico, quantidade], index) => `
        <div class="ranking-item">
            <span class="ranking-pos">${posicoes[index]}</span>
            <span class="ranking-service">${servico}</span>
            <span class="ranking-count">${quantidade}</span>
        </div>
    `).join('');
}

function atualizarBarrasMeta(faturamentoMes, totalServicos, clientesUnicos) {
    // Meta de faturamento
    const progressoFaturamento = Math.min((faturamentoMes / metas.faturamento) * 100, 100);
    document.getElementById('metaFaturamento').style.width = `${progressoFaturamento}%`;
    document.getElementById('metaFaturamentoPercent').textContent = `${Math.round(progressoFaturamento)}%`;
    
    // Meta de serviços
    const progressoServicos = Math.min((totalServicos / metas.servicos) * 100, 100);
    document.getElementById('metaServicos').style.width = `${progressoServicos}%`;
    document.getElementById('metaServicosPercent').textContent = `${Math.round(progressoServicos)}%`;
    
    // Meta de clientes
    const progressoClientes = Math.min((clientesUnicos / metas.clientes) * 100, 100);
    document.getElementById('metaClientes').style.width = `${progressoClientes}%`;
    document.getElementById('metaClientesPercent').textContent = `${Math.round(progressoClientes)}%`;
}

function atualizarInsights(faturamentoMes, progressoMeta, servicosHoje) {
    // Insight positivo dinâmico
    const insightPositivo = document.getElementById('insightPositivo');
    if (progressoMeta > 80) {
        insightPositivo.textContent = `🎉 Excelente! Você já atingiu ${Math.round(progressoMeta)}% da meta mensal!`;
    } else if (servicosHoje >= 8) {
        insightPositivo.textContent = `🚀 Dia produtivo! ${servicosHoje} serviços realizados hoje.`;
    } else if (faturamentoMes > 1000) {
        insightPositivo.textContent = `💰 Faturamento acumulado de R$ ${faturamentoMes.toFixed(2)} no mês.`;
    } else {
        insightPositivo.textContent = `📈 Continue assim! Cada serviço te aproxima da meta.`;
    }
    
    // Insight de dica baseado na performance
    const insightDica = document.getElementById('insightDica');
    const hoje = new Date();
    const hora = hoje.getHours();
    
    if (hora >= 14 && hora <= 17) {
        insightDica.textContent = `⏰ Horário de pico! Aproveite para oferecer serviços premium.`;
    } else if (hora >= 8 && hora <= 11) {
        insightDica.textContent = `🌅 Manhã tranquila. Considere promoções para atrair clientes.`;
    } else {
        insightDica.textContent = `💡 Dica: Clientes satisfeitos voltam. Foque na qualidade do serviço!`;
    }
}

// Função para simular dados de exemplo (para demonstração)
function gerarDadosExemplo() {
    // Adicionar alguns serviços de exemplo
    const clientesExemplo = ['João Silva', 'Maria Santos', 'Pedro Costa', 'Ana Lima', 'Carlos Rocha'];
    const veiculosExemplo = ['Honda Civic 2020', 'Toyota Corolla 2019', 'Volkswagen Polo 2021', 'Chevrolet Onix 2022', 'Ford Ka 2020'];
    const tiposServico = ['Lavagem Simples', 'Lavagem Completa', 'Enceramento', 'Lavagem + Enceramento'];
    
    // Adicionar serviços dos últimos dias
    for (let i = 0; i < 15; i++) {
        const dataServico = new Date();
        dataServico.setDate(dataServico.getDate() - Math.floor(Math.random() * 7));
        
        const tipoServico = tiposServico[Math.floor(Math.random() * tiposServico.length)];
        const servico = {
            id: Date.now() + Math.random(),
            cliente: clientesExemplo[Math.floor(Math.random() * clientesExemplo.length)],
            veiculo: veiculosExemplo[Math.floor(Math.random() * veiculosExemplo.length)],
            tipo: tipoServico,
            valor: precos[tipoServico],
            status: ['Pendente', 'Em Andamento', 'Concluído'][Math.floor(Math.random() * 3)],
            data: dataServico.toLocaleDateString()
        };
        servicos.push(servico);
    }
    
    // Adicionar alguns produtos de exemplo
    const produtosExemplo = [
        { nome: 'Shampoo Automotivo', categoria: 'Shampoo', estoque: 25, estoqueMinimo: 10, preco: 15.00 },
        { nome: 'Cera Carnaúba', categoria: 'Cera', estoque: 8, estoqueMinimo: 10, preco: 35.00 },
        { nome: 'Pneu Shine', categoria: 'Pneu', estoque: 15, estoqueMinimo: 5, preco: 12.00 },
        { nome: 'Microfibra', categoria: 'Acessórios', estoque: 3, estoqueMinimo: 5, preco: 8.00 }
    ];
    
    produtosExemplo.forEach(produto => {
        produtos.push({
            ...produto,
            id: Date.now() + Math.random()
        });
    });
}

// Event listeners e inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Atualizar preço do serviço
    const tipoServicoSelect = document.getElementById('tipoServico');
    if (tipoServicoSelect) {
        tipoServicoSelect.addEventListener('change', function() {
            const valorInput = document.getElementById('valorServico');
            const servicoSelecionado = this.value;
            if (servicoSelecionado && precos[servicoSelecionado]) {
                valorInput.value = precos[servicoSelecionado].toFixed(2);
            }
        });
    }
    
    // Gerar dados de exemplo para demonstração
    gerarDadosExemplo();
    
    atualizarDashboard();
    atualizarTabelaServicos();
    atualizarTabelaProdutos();
    
    // Definir datas padrão para relatório
    const hoje = new Date();
    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    document.getElementById('dataInicial').value = primeiroDiaMes.toISOString().split('T')[0];
    document.getElementById('dataFinal').value = hoje.toISOString().split('T')[0];
    
    // Atualizar dashboard a cada 30 segundos
    setInterval(atualizarDashboard, 30000);
});

// Função para adicionar um novo serviço (incluindo registro do cliente)
function adicionarServico(event) {
    event.preventDefault();
    
    const cliente = document.getElementById('nomeCliente').value;
    const servico = {
        id: Date.now(),
        cliente: cliente,
        veiculo: document.getElementById('veiculo').value,
        tipo: document.getElementById('tipoServico').value,
        valor: parseFloat(document.getElementById('valorServico').value),
        status: 'Pendente',
        data: new Date().toLocaleDateString()
    };
    
    servicos.push(servico);
    
    // Registrar cliente se for novo
    const clienteLower = cliente.toLowerCase();
    if (!clientesHistorico.includes(clienteLower)) {
        clientesHistorico.push(clienteLower);
    }
    
    atualizarTabelaServicos();
    closeModal('modalServico');
    event.target.reset();
    atualizarDashboard();
}

// Função para criar gráfico simples (placeholder)
function criarGraficoFaturamento() {
    const canvas = document.getElementById('chartFaturamento');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Texto placeholder
    ctx.fillStyle = '#ffd700';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Gráfico de Faturamento', canvas.width/2, canvas.height/2 - 10);
    ctx.fillStyle = '#cccccc';
    ctx.font = '12px Arial';
    ctx.fillText('(Em desenvolvimento)', canvas.width/2, canvas.height/2 + 10);
}

// Navegação
function showSection(sectionId) {
    // Esconder todas as seções
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remover classe active de todos os botões
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostrar seção selecionada
    document.getElementById(sectionId).classList.add('active');
    
    // Adicionar classe active no botão clicado
    event.target.classList.add('active');
    
    // Atualizar dashboard se necessário
    if (sectionId === 'dashboard') {
        atualizarDashboard();
    }
}

// Modais
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Fechar modal clicando fora
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// Atualizar tabela de serviços
function atualizarTabelaServicos() {
    const tbody = document.getElementById('tabelaServicos');
    
    if (servicos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 30px;">Nenhum serviço cadastrado</td></tr>';
        return;
    }
    
    tbody.innerHTML = servicos.map(servico => `
        <tr>
            <td>${servico.cliente}</td>
            <td>${servico.veiculo}</td>
            <td>${servico.tipo}</td>
            <td>R$ ${servico.valor.toFixed(2)}</td>
            <td><span class="status-badge status-${servico.status.toLowerCase().replace(' ', '').replace('ã', 'a')}">${servico.status}</span></td>
            <td>
                <button class="btn" onclick="alterarStatusServico(${servico.id})">Alterar Status</button>
                <button class="btn btn-danger" onclick="excluirServico(${servico.id})">Excluir</button>
            </td>
        </tr>
    `).join('');
}

// Alterar status do serviço
function alterarStatusServico(id) {
    const servico = servicos.find(s => s.id === id);
    if (servico) {
        const status = ['Pendente', 'Em Andamento', 'Concluído'];
        const currentIndex = status.indexOf(servico.status);
        servico.status = status[(currentIndex + 1) % status.length];
        atualizarTabelaServicos();
        atualizarDashboard();
    }
}

// Excluir serviço
function excluirServico(id) {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
        servicos = servicos.filter(s => s.id !== id);
        atualizarTabelaServicos();
        atualizarDashboard();
    }
}

// Adicionar produto
function adicionarProduto(event) {
    event.preventDefault();
    
    const produto = {
        id: Date.now(),
        nome: document.getElementById('nomeProduto').value,
        categoria: document.getElementById('categoriaProduto').value,
        estoque: parseInt(document.getElementById('estoqueProduto').value),
        estoqueMinimo: parseInt(document.getElementById('estoqueMinimo').value),
        preco: parseFloat(document.getElementById('precoProduto').value)
    };
    
    produtos.push(produto);
    atualizarTabelaProdutos();
    closeModal('modalProduto');
    event.target.reset();
    atualizarDashboard();
}

// Atualizar tabela de produtos
function atualizarTabelaProdutos() {
    const tbody = document.getElementById('tabelaProdutos');
    
    if (produtos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 30px;">Nenhum produto cadastrado</td></tr>';
        return;
    }
    
    tbody.innerHTML = produtos.map(produto => `
        <tr class="${produto.estoque <= produto.estoqueMinimo ? 'produto-baixo-estoque' : ''}">
            <td>${produto.nome}</td>
            <td>${produto.categoria}</td>
            <td>${produto.estoque}</td>
            <td>${produto.estoqueMinimo}</td>
            <td>R$ ${produto.preco.toFixed(2)}</td>
            <td>
                <button class="btn" onclick="editarEstoque(${produto.id})">Editar Estoque</button>
                <button class="btn btn-danger" onclick="excluirProduto(${produto.id})">Excluir</button>
            </td>
        </tr>
    `).join('');
}

// Editar estoque
function editarEstoque(id) {
    const produto = produtos.find(p => p.id === id);
    if (produto) {
        const novoEstoque = prompt('Novo estoque:', produto.estoque);
        if (novoEstoque !== null && !isNaN(novoEstoque)) {
            produto.estoque = parseInt(novoEstoque);
            atualizarTabelaProdutos();
            atualizarDashboard();
        }
    }
}

// Excluir produto
function excluirProduto(id) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        produtos = produtos.filter(p => p.id !== id);
        atualizarTabelaProdutos();
        atualizarDashboard();
    }
}

// Orçamento
function adicionarReceita() {
    const item = document.getElementById('itemReceita').value;
    const valor = parseFloat(document.getElementById('valorReceita').value);
    
    if (item && !isNaN(valor)) {
        receitas.push({ id: Date.now(), item, valor });
        atualizarOrcamento();
        document.getElementById('itemReceita').value = '';
        document.getElementById('valorReceita').value = '';
    }
}

function adicionarDespesa() {
    const item = document.getElementById('itemDespesa').value;
    const valor = parseFloat(document.getElementById('valorDespesa').value);
    
    if (item && !isNaN(valor)) {
        despesas.push({ id: Date.now(), item, valor });
        atualizarOrcamento();
        document.getElementById('itemDespesa').value = '';
        document.getElementById('valorDespesa').value = '';
    }
}

function atualizarOrcamento() {
    const listaReceitas = document.getElementById('listaReceitas');
    const listaDespesas = document.getElementById('listaDespesas');
    
    // Atualizar lista de receitas
    listaReceitas.innerHTML = receitas.map(receita => `
        <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #333;">
            <span>${receita.item}</span>
            <span>R$ ${receita.valor.toFixed(2)} 
                <button onclick="removerReceita(${receita.id})" style="background: none; border: none; color: red; cursor: pointer; margin-left: 10px;">❌</button>
            </span>
        </div>
    `).join('');
    
    // Atualizar lista de despesas
    listaDespesas.innerHTML = despesas.map(despesa => `
        <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #333;">
            <span>${despesa.item}</span>
            <span>R$ ${despesa.valor.toFixed(2)} 
                <button onclick="removerDespesa(${despesa.id})" style="background: none; border: none; color: red; cursor: pointer; margin-left: 10px;">❌</button>
            </span>
        </div>
    `).join('');
    
    // Calcular totais
    const totalReceitas = receitas.reduce((total, receita) => total + receita.valor, 0);
    const totalDespesas = despesas.reduce((total, despesa) => total + despesa.valor, 0);
    const lucro = totalReceitas - totalDespesas;
    
    // Atualizar valores na tela
    document.getElementById('totalReceitas').textContent = totalReceitas.toFixed(2);
    document.getElementById('totalDespesas').textContent = totalDespesas.toFixed(2);
    document.getElementById('resumoReceitas').textContent = totalReceitas.toFixed(2);
    document.getElementById('resumoDespesas').textContent = totalDespesas.toFixed(2);
    
    const lucroElement = document.getElementById('lucro');
    lucroElement.textContent = `R$ ${lucro.toFixed(2)}`;
    lucroElement.style.color = lucro >= 0 ? '#00ff00' : '#ff0000';
}

function removerReceita(id) {
    receitas = receitas.filter(r => r.id !== id);
    atualizarOrcamento();
}

function removerDespesa(id) {
    despesas = despesas.filter(d => d.id !== id);
    atualizarOrcamento();
}

// Relatórios
function gerarRelatorio() {
    const dataInicial = new Date(document.getElementById('dataInicial').value);
    const dataFinal = new Date(document.getElementById('dataFinal').value);
    
    if (!dataInicial || !dataFinal) {
        alert('Selecione as datas inicial e final');
        return;
    }
    
    const servicosPeriodo = servicos.filter(s => {
        const dataServico = new Date(s.data.split('/').reverse().join('-'));
        return dataServico >= dataInicial && dataServico <= dataFinal;
    });
    
    const servicosConcluidos = servicosPeriodo.filter(s => s.status === 'Concluído');
    const faturamentoTotal = servicosConcluidos.reduce((total, s) => total + s.valor, 0);
    
    const resumo = document.getElementById('resumoPeriodo');
    resumo.innerHTML = `
        <h4>📊 Relatório do Período</h4>
        <p><strong>Total de Serviços:</strong> ${servicosPeriodo.length}</p>
        <p><strong>Serviços Concluídos:</strong> ${servicosConcluidos.length}</p>
        <p><strong>Faturamento Total:</strong> R$ ${faturamentoTotal.toFixed(2)}</p>
        <p><strong>Ticket Médio:</strong> R$ ${servicosConcluidos.length ? (faturamentoTotal / servicosConcluidos.length).toFixed(2) : '0.00'}</p>
        <br>
        <h4>📈 Serviços por Tipo</h4>
        ${gerarResumoTipos(servicosConcluidos)}
    `;
}

function gerarResumoTipos(servicos) {
    const tipos = {};
    servicos.forEach(s => {
        tipos[s.tipo] = (tipos[s.tipo] || 0) + 1;
    });
    
    return Object.entries(tipos).map(([tipo, quantidade]) => 
        `<p><strong>${tipo}:</strong> ${quantidade} serviços</p>`
    ).join('');
}// Dados em memória
let servicos = [];
let produtos = [];
let receitas = [];
let despesas = [];
let clientesHistorico = []; // Para rastrear clientes únicos

// Metas mensais configuráveis
const metas = {
    faturamento: 8000,
    servicos: 200,
    clientes: 100
};

// Preços dos serviços
const precos = {
    'Lavagem Simples': 15.00,
    'Lavagem Completa': 25.00,
    'Enceramento': 40.00,
    'Lavagem + Enceramento': 50.00
};

// Navegação
function showSection(sectionId) {
    // Esconder todas as seções
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remover classe active de todos os botões
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostrar seção selecionada
    document.getElementById(sectionId).classList.add('active');
    
    // Adicionar classe active no botão clicado
    event.target.classList.add('active');
    
    // Atualizar dashboard se necessário
    if (sectionId === 'dashboard') {
        atualizarDashboard();
    }
}

// Modais
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Fechar modal clicando fora
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Atualizar preço do serviço
    const tipoServicoSelect = document.getElementById('tipoServico');
    if (tipoServicoSelect) {
        tipoServicoSelect.addEventListener('change', function() {
            const valorInput = document.getElementById('valorServico');
            const servicoSelecionado = this.value;
            if (servicoSelecionado && precos[servicoSelecionado]) {
                valorInput.value = precos[servicoSelecionado].toFixed(2);
            }
        });
    }
    
    atualizarDashboard();
    
    // Definir datas padrão para relatório (último mês)
    const hoje = new Date();
    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    document.getElementById('dataInicial').value = primeiroDiaMes.toISOString().split('T')[0];
    document.getElementById('dataFinal').value = hoje.toISOString().split('T')[0];
});

// Adicionar serviço
function adicionarServico(event) {
    event.preventDefault();
    
    const servico = {
        id: Date.now(),
        cliente: document.getElementById('nomeCliente').value,
        veiculo: document.getElementById('veiculo').value,
        tipo: document.getElementById('tipoServico').value,
        valor: parseFloat(document.getElementById('valorServico').value),
        status: 'Pendente',
        data: new Date().toLocaleDateString()
    };
    
    servicos.push(servico);
    atualizarTabelaServicos();
    closeModal('modalServico');
    event.target.reset();
    atualizarDashboard();
}

// Atualizar tabela de serviços
function atualizarTabelaServicos() {
    const tbody = document.getElementById('tabelaServicos');
    
    if (servicos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 30px;">Nenhum serviço cadastrado</td></tr>';
        return;
    }
    
    tbody.innerHTML = servicos.map(servico => `
        <tr>
            <td>${servico.cliente}</td>
            <td>${servico.veiculo}</td>
            <td>${servico.tipo}</td>
            <td>R$ ${servico.valor.toFixed(2)}</td>
            <td><span class="status-badge status-${servico.status.toLowerCase().replace(' ', '').replace('ã', 'a')}">${servico.status}</span></td>
            <td>
                <button class="btn" onclick="alterarStatusServico(${servico.id})">Alterar Status</button>
                <button class="btn btn-danger" onclick="excluirServico(${servico.id})">Excluir</button>
            </td>
        </tr>
    `).join('');
}

// Alterar status do serviço
function alterarStatusServico(id) {
    const servico = servicos.find(s => s.id === id);
    if (servico) {
        const status = ['Pendente', 'Em Andamento', 'Concluído'];
        const currentIndex = status.indexOf(servico.status);
        servico.status = status[(currentIndex + 1) % status.length];
        atualizarTabelaServicos();
        atualizarDashboard();
    }
}

// Excluir serviço
function excluirServico(id) {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
        servicos = servicos.filter(s => s.id !== id);
        atualizarTabelaServicos();
        atualizarDashboard();
    }
}

// Adicionar produto
function adicionarProduto(event) {
    event.preventDefault();
    
    const produto = {
        id: Date.now(),
        nome: document.getElementById('nomeProduto').value,
        categoria: document.getElementById('categoriaProduto').value,
        estoque: parseInt(document.getElementById('estoqueProduto').value),
        estoqueMinimo: parseInt(document.getElementById('estoqueMinimo').value),
        preco: parseFloat(document.getElementById('precoProduto').value)
    };
    
    produtos.push(produto);
    atualizarTabelaProdutos();
    closeModal('modalProduto');
    event.target.reset();
    atualizarDashboard();
}

// Atualizar tabela de produtos
function atualizarTabelaProdutos() {
    const tbody = document.getElementById('tabelaProdutos');
    
    if (produtos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 30px;">Nenhum produto cadastrado</td></tr>';
        return;
    }
    
    tbody.innerHTML = produtos.map(produto => `
        <tr class="${produto.estoque <= produto.estoqueMinimo ? 'produto-baixo-estoque' : ''}">
            <td>${produto.nome}</td>
            <td>${produto.categoria}</td>
            <td>${produto.estoque}</td>
            <td>${produto.estoqueMinimo}</td>
            <td>R$ ${produto.preco.toFixed(2)}</td>
            <td>
                <button class="btn" onclick="editarEstoque(${produto.id})">Editar Estoque</button>
                <button class="btn btn-danger" onclick="excluirProduto(${produto.id})">Excluir</button>
            </td>
        </tr>
    `).join('');
}

// Editar estoque
function editarEstoque(id) {
    const produto = produtos.find(p => p.id === id);
    if (produto) {
        const novoEstoque = prompt('Novo estoque:', produto.estoque);
        if (novoEstoque !== null && !isNaN(novoEstoque)) {
            produto.estoque = parseInt(novoEstoque);
            atualizarTabelaProdutos();
            atualizarDashboard();
        }
    }
}

// Excluir produto
function excluirProduto(id) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        produtos = produtos.filter(p => p.id !== id);
        atualizarTabelaProdutos();
        atualizarDashboard();
    }
}

// Orçamento
function adicionarReceita() {
    const item = document.getElementById('itemReceita').value;
    const valor = parseFloat(document.getElementById('valorReceita').value);
    
    if (item && !isNaN(valor)) {
        receitas.push({ id: Date.now(), item, valor });
        atualizarOrcamento();
        document.getElementById('itemReceita').value = '';
        document.getElementById('valorReceita').value = '';
    }
}

function adicionarDespesa() {
    const item = document.getElementById('itemDespesa').value;
    const valor = parseFloat(document.getElementById('valorDespesa').value);
    
    if (item && !isNaN(valor)) {
        despesas.push({ id: Date.now(), item, valor });
        atualizarOrcamento();
        document.getElementById('itemDespesa').value = '';
        document.getElementById('valorDespesa').value = '';
    }
}

function atualizarOrcamento() {
    const listaReceitas = document.getElementById('listaReceitas');
    const listaDespesas = document.getElementById('listaDespesas');
    
    // Atualizar lista de receitas
    listaReceitas.innerHTML = receitas.map(receita => `
        <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee;">
            <span>${receita.item}</span>
            <span>R$ ${receita.valor.toFixed(2)} 
                <button onclick="removerReceita(${receita.id})" style="background: none; border: none; color: red; cursor: pointer; margin-left: 10px;">❌</button>
            </span>
        </div>
    `).join('');
    
    // Atualizar lista de despesas
    listaDespesas.innerHTML = despesas.map(despesa => `
        <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee;">
            <span>${despesa.item}</span>
            <span>R$ ${despesa.valor.toFixed(2)} 
                <button onclick="removerDespesa(${despesa.id})" style="background: none; border: none; color: red; cursor: pointer; margin-left: 10px;">❌</button>
            </span>
        </div>
    `).join('');
    
    // Calcular totais
    const totalReceitas = receitas.reduce((total, receita) => total + receita.valor, 0);
    const totalDespesas = despesas.reduce((total, despesa) => total + despesa.valor, 0);
    const lucro = totalReceitas - totalDespesas;
    
    // Atualizar valores na tela
    document.getElementById('totalReceitas').textContent = totalReceitas.toFixed(2);
    document.getElementById('totalDespesas').textContent = totalDespesas.toFixed(2);
    document.getElementById('resumoReceitas').textContent = totalReceitas.toFixed(2);
    document.getElementById('resumoDespesas').textContent = totalDespesas.toFixed(2);
    
    const lucroElement = document.getElementById('lucro');
    lucroElement.textContent = `R$ ${lucro.toFixed(2)}`;
    lucroElement.style.color = lucro >= 0 ? '#25855a' : '#c53030';
}

function removerReceita(id) {
    receitas = receitas.filter(r => r.id !== id);
    atualizarOrcamento();
}

function removerDespesa(id) {
    despesas = despesas.filter(d => d.id !== id);
    atualizarOrcamento();
}

// Dashboard
function atualizarDashboard() {
    const hoje = new Date().toLocaleDateString();
    const servicosHoje = servicos.filter(s => s.data === hoje);
    const servicosConcluidos = servicos.filter(s => s.status === 'Concluído');
    
    const faturamentoHoje = servicosConcluidos
        .filter(s => s.data === hoje)
        .reduce((total, s) => total + s.valor, 0);
    
    const faturamentoMes = servicosConcluidos
        .reduce((total, s) => total + s.valor, 0);
    
    document.getElementById('faturamentoHoje').textContent = `R$ ${faturamentoHoje.toFixed(2)}`;
    document.getElementById('servicosHoje').textContent = servicosHoje.length;
    document.getElementById('faturamentoMes').textContent = `R$ ${faturamentoMes.toFixed(2)}`;
    
    // Serviços recentes
    const servicosRecentes = document.getElementById('servicosRecentes');
    if (servicosHoje.length > 0) {
        servicosRecentes.innerHTML = servicosHoje.slice(-3).map(s => `
            <div style="padding: 8px; border-left: 3px solid #667eea; margin: 5px 0; background: #f7fafc;">
                <strong>${s.cliente}</strong> - ${s.tipo}<br>
                <span style="color: #666;">${s.veiculo} - R$ ${s.valor.toFixed(2)}</span>
            </div>
        `).join('');
    } else {
        servicosRecentes.innerHTML = '<p>Nenhum serviço registrado hoje.</p>';
    }
    
    // Produtos em baixa
    const produtosBaixa = produtos.filter(p => p.estoque <= p.estoqueMinimo);
    const produtosBaixaDiv = document.getElementById('produtosBaixa');
    
    if (produtosBaixa.length > 0) {
        produtosBaixaDiv.innerHTML = produtosBaixa.map(p => `
            <div style="padding: 8px; border-left: 3px solid #e53e3e; margin: 5px 0; background: #fed7d7;">
                <strong>${p.nome}</strong><br>
                <span style="color: #c53030;">Estoque: ${p.estoque} (Mín: ${p.estoqueMinimo})</span>
            </div>
        `).join('');
    } else {
        produtosBaixaDiv.innerHTML = '<p>Todos os produtos em estoque adequado.</p>';
    }
}

// Relatórios
function gerarRelatorio() {
    const dataInicial = new Date(document.getElementById('dataInicial').value);
    const dataFinal = new Date(document.getElementById('dataFinal').value);
    
    if (!dataInicial || !dataFinal) {
        alert('Selecione as datas inicial e final');
        return;
    }
    
    const servicosPeriodo = servicos.filter(s => {
        const dataServico = new Date(s.data.split('/').reverse().join('-'));
        return dataServico >= dataInicial && dataServico <= dataFinal;
    });
    
    const servicosConcluidos = servicosPeriodo.filter(s => s.status === 'Concluído');
    const faturamentoTotal = servicosConcluidos.reduce((total, s) => total + s.valor, 0);
    
    const resumo = document.getElementById('resumoPeriodo');
    resumo.innerHTML = `
        <h4>📊 Relatório do Período</h4>
        <p><strong>Total de Serviços:</strong> ${servicosPeriodo.length}</p>
        <p><strong>Serviços Concluídos:</strong> ${servicosConcluidos.length}</p>
        <p><strong>Faturamento Total:</strong> R$ ${faturamentoTotal.toFixed(2)}</p>
        <p><strong>Ticket Médio:</strong> R$ ${servicosConcluidos.length ? (faturamentoTotal / servicosConcluidos.length).toFixed(2) : '0.00'}</p>
        <br>
        <h4>📈 Serviços por Tipo</h4>
        ${gerarResumoTipos(servicosConcluidos)}
    `;
}

function gerarResumoTipos(servicos) {
    const tipos = {};
    servicos.forEach(s => {
        tipos[s.tipo] = (tipos[s.tipo] || 0) + 1;
    });
    
    return Object.entries(tipos).map(([tipo, quantidade]) => 
        `<p><strong>${tipo}:</strong> ${quantidade} serviços</p>`
    ).join('');
}
