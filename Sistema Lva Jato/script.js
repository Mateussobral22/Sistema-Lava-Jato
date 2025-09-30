// Dados em memória
let servicos = [];
let produtos = [];
let receitas = [];
let despesas = [];
let clientesHistorico = [];

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
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(sectionId).classList.add('active');
    event.target.classList.add('active');
    
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

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// Função para adicionar um novo serviço
function adicionarServico(event) {
    event.preventDefault();
    
    const cliente = document.getElementById('nomeCliente').value;
    const placa = document.getElementById('placaVeiculo').value.toUpperCase();
    
    const servico = {
        id: Date.now(),
        cliente: cliente,
        veiculo: document.getElementById('veiculo').value,
        placa: placa,
        tipo: document.getElementById('tipoServico').value,
        valor: parseFloat(document.getElementById('valorServico').value),
        status: 'Pendente',
        data: new Date().toLocaleDateString()
    };
    
    servicos.push(servico);
    
    const clienteLower = cliente.toLowerCase();
    if (!clientesHistorico.includes(clienteLower)) {
        clientesHistorico.push(clienteLower);
    }
    
    // Atualizar tudo automaticamente
    atualizarTabelaServicos();
    atualizarDashboard();
    atualizarInsightsAutomatico();
    
    closeModal('modalServico');
    event.target.reset();
    
    // Mostrar notificação de sucesso
    mostrarNotificacao('Serviço adicionado com sucesso!', 'success');
}

// Atualizar tabela de serviços
function atualizarTabelaServicos() {
    const tbody = document.getElementById('tabelaServicos');
    
    if (servicos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 30px;">Nenhum serviço cadastrado</td></tr>';
        return;
    }
    
    tbody.innerHTML = servicos.map(servico => `
        <tr>
            <td>${servico.cliente}</td>
            <td>${servico.veiculo}</td>
            <td><strong style="color: #00ffff;">${servico.placa || 'N/A'}</strong></td>
            <td>${servico.tipo}</td>
            <td>R$ ${servico.valor.toFixed(2)}</td>
            <td><span class="status-badge status-${servico.status.toLowerCase().replace(' ', '').replace('í', 'i')}">${servico.status}</span></td>
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
        
        // Atualizar tudo automaticamente
        atualizarTabelaServicos();
        atualizarDashboard();
        atualizarInsightsAutomatico();
        
        mostrarNotificacao(`Status alterado para: ${servico.status}`, 'info');
    }
}

// Excluir serviço
function excluirServico(id) {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
        servicos = servicos.filter(s => s.id !== id);
        
        // Atualizar tudo automaticamente
        atualizarTabelaServicos();
        atualizarDashboard();
        atualizarInsightsAutomatico();
        
        mostrarNotificacao('Serviço excluído com sucesso!', 'success');
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
    
    // Atualizar tudo automaticamente
    atualizarTabelaProdutos();
    atualizarDashboard();
    atualizarAlertas();
    
    closeModal('modalProduto');
    event.target.reset();
    
    mostrarNotificacao('Produto adicionado com sucesso!', 'success');
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
            
            // Atualizar tudo automaticamente
            atualizarTabelaProdutos();
            atualizarDashboard();
            atualizarAlertas();
            
            mostrarNotificacao('Estoque atualizado com sucesso!', 'success');
        }
    }
}

// Excluir produto
function excluirProduto(id) {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
        produtos = produtos.filter(p => p.id !== id);
        
        // Atualizar tudo automaticamente
        atualizarTabelaProdutos();
        atualizarDashboard();
        atualizarAlertas();
        
        mostrarNotificacao('Produto excluído com sucesso!', 'success');
    }
}

// Orçamento
function adicionarReceita() {
    const item = document.getElementById('itemReceita').value;
    const valor = parseFloat(document.getElementById('valorReceita').value);
    
    if (item && !isNaN(valor)) {
        receitas.push({ id: Date.now(), item, valor });
        
        // Atualizar tudo automaticamente
        atualizarOrcamento();
        atualizarDashboard();
        
        document.getElementById('itemReceita').value = '';
        document.getElementById('valorReceita').value = '';
        
        mostrarNotificacao('Receita adicionada com sucesso!', 'success');
    }
}

function adicionarDespesa() {
    const item = document.getElementById('itemDespesa').value;
    const valor = parseFloat(document.getElementById('valorDespesa').value);
    
    if (item && !isNaN(valor)) {
        despesas.push({ id: Date.now(), item, valor });
        
        // Atualizar tudo automaticamente
        atualizarOrcamento();
        atualizarDashboard();
        
        document.getElementById('itemDespesa').value = '';
        document.getElementById('valorDespesa').value = '';
        
        mostrarNotificacao('Despesa adicionada com sucesso!', 'success');
    }
}

function atualizarOrcamento() {
    const listaReceitas = document.getElementById('listaReceitas');
    const listaDespesas = document.getElementById('listaDespesas');
    
    listaReceitas.innerHTML = receitas.map(receita => `
        <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #333;">
            <span>${receita.item}</span>
            <span>R$ ${receita.valor.toFixed(2)} 
                <button onclick="removerReceita(${receita.id})" style="background: none; border: none; color: red; cursor: pointer; margin-left: 10px;">✖</button>
            </span>
        </div>
    `).join('');
    
    listaDespesas.innerHTML = despesas.map(despesa => `
        <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #333;">
            <span>${despesa.item}</span>
            <span>R$ ${despesa.valor.toFixed(2)} 
                <button onclick="removerDespesa(${despesa.id})" style="background: none; border: none; color: red; cursor: pointer; margin-left: 10px;">✖</button>
            </span>
        </div>
    `).join('');
    
    const totalReceitas = receitas.reduce((total, receita) => total + receita.valor, 0);
    const totalDespesas = despesas.reduce((total, despesa) => total + despesa.valor, 0);
    const lucro = totalReceitas - totalDespesas;
    
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
    atualizarDashboard();
    mostrarNotificacao('Receita removida!', 'info');
}

function removerDespesa(id) {
    despesas = despesas.filter(d => d.id !== id);
    atualizarOrcamento();
    atualizarDashboard();
    mostrarNotificacao('Despesa removida!', 'info');
}

// Atualizar alertas de estoque
function atualizarAlertas() {
    const produtosBaixa = produtos.filter(p => p.estoque <= p.estoqueMinimo);
    const produtosBaixaDiv = document.getElementById('produtosBaixa');
    
    if (produtosBaixaDiv) {
        if (produtosBaixa.length > 0) {
            produtosBaixaDiv.innerHTML = produtosBaixa.map(p => `
                <div style="padding: 12px; border-left: 3px solid #ff0000; margin: 8px 0; background: rgba(255, 0, 0, 0.1); border-radius: 5px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong style="color: #ff0000;">${p.nome}</strong><br>
                            <span style="color: #ffffff; font-size: 0.9rem;">Categoria: ${p.categoria}</span>
                        </div>
                        <div style="text-align: right; color: #ff0000; font-weight: bold;">
                            ${p.estoque}/${p.estoqueMinimo}<br>
                            <small style="color: #00ffff;">CRÍTICO</small>
                        </div>
                    </div>
                </div>
            `).join('');
            
            const alertaElement = document.getElementById('insightAlerta');
            if (alertaElement) {
                alertaElement.textContent = `${produtosBaixa.length} produto${produtosBaixa.length > 1 ? 's' : ''} próximo${produtosBaixa.length > 1 ? 's' : ''} do estoque mínimo`;
            }
        } else {
            produtosBaixaDiv.innerHTML = '<p style="text-align: center; color: #00ff00; padding: 20px;">Todos os produtos em estoque adequado.</p>';
            const alertaElement = document.getElementById('insightAlerta');
            if (alertaElement) {
                alertaElement.textContent = 'Todos os estoques estão adequados';
            }
        }
    }
}

// Atualizar insights automaticamente
function atualizarInsightsAutomatico() {
    const hoje = new Date().toLocaleDateString();
    const servicosHoje = servicos.filter(s => s.data === hoje);
    const servicosConcluidos = servicos.filter(s => s.status === 'Concluído');
    const faturamentoMes = servicosConcluidos.reduce((total, s) => total + s.valor, 0);
    const progressoMeta = Math.min((faturamentoMes / metas.faturamento) * 100, 100);
    
    const insightPositivo = document.getElementById('insightPositivo');
    if (progressoMeta > 80) {
        insightPositivo.textContent = `Excelente! Você já atingiu ${Math.round(progressoMeta)}% da meta mensal!`;
    } else if (servicosHoje.length >= 8) {
        insightPositivo.textContent = `Dia produtivo! ${servicosHoje.length} serviços realizados hoje.`;
    } else if (faturamentoMes > 1000) {
        insightPositivo.textContent = `Faturamento acumulado de R$ ${faturamentoMes.toFixed(2)} no mês.`;
    } else {
        insightPositivo.textContent = `Continue assim! Cada serviço te aproxima da meta.`;
    }
    
    const insightDica = document.getElementById('insightDica');
    const hora = new Date().getHours();
    
    if (hora >= 14 && hora <= 17) {
        insightDica.textContent = `Horário de pico! Aproveite para oferecer serviços premium.`;
    } else if (hora >= 8 && hora <= 11) {
        insightDica.textContent = `Manhã tranquila. Considere promoções para atrair clientes.`;
    } else {
        insightDica.textContent = `Dica: Clientes satisfeitos voltam. Foque na qualidade do serviço!`;
    }
}

// Função para ranking de serviços
function atualizarRankingServicos(contagemServicos) {
    const rankingContainer = document.getElementById('rankingServicos');
    const servicosOrdenados = Object.entries(contagemServicos)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3);
    
    const posicoes = ['1º', '2º', '3º'];
    const todosServicos = ['Lavagem Completa', 'Lavagem Simples', 'Enceramento', 'Lavagem + Enceramento'];
    
    while (servicosOrdenados.length < 3) {
        const servicoFaltante = todosServicos.find(s => !servicosOrdenados.some(([nome]) => nome === s));
        if (servicoFaltante) {
            servicosOrdenados.push([servicoFaltante, 0]);
        } else {
            break;
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

// Atualizar barras de meta
function atualizarBarrasMeta(faturamentoMes, totalServicos, clientesUnicos) {
    const progressoFaturamento = Math.min((faturamentoMes / metas.faturamento) * 100, 100);
    document.getElementById('metaFaturamento').style.width = `${progressoFaturamento}%`;
    document.getElementById('metaFaturamentoPercent').textContent = `${Math.round(progressoFaturamento)}%`;
    
    const progressoServicos = Math.min((totalServicos / metas.servicos) * 100, 100);
    document.getElementById('metaServicos').style.width = `${progressoServicos}%`;
    document.getElementById('metaServicosPercent').textContent = `${Math.round(progressoServicos)}%`;
    
    const progressoClientes = Math.min((clientesUnicos / metas.clientes) * 100, 100);
    document.getElementById('metaClientes').style.width = `${progressoClientes}%`;
    document.getElementById('metaClientesPercent').textContent = `${Math.round(progressoClientes)}%`;
}

// Dashboard principal - Atualização completa
function atualizarDashboard() {
    const hoje = new Date().toLocaleDateString();
    const servicosHoje = servicos.filter(s => s.data === hoje);
    const servicosConcluidos = servicos.filter(s => s.status === 'Concluído');
    const servicosPendentes = servicos.filter(s => s.status === 'Pendente');
    const servicosAndamento = servicos.filter(s => s.status === 'Em Andamento');
    
    const faturamentoHoje = servicosConcluidos
        .filter(s => s.data === hoje)
        .reduce((total, s) => total + s.valor, 0);
    
    const faturamentoMes = servicosConcluidos
        .reduce((total, s) => total + s.valor, 0);
    
    document.getElementById('faturamentoHoje').textContent = `R$ ${faturamentoHoje.toFixed(2)}`;
    document.getElementById('servicosHoje').textContent = servicosHoje.length;
    document.getElementById('faturamentoMes').textContent = `R$ ${faturamentoMes.toFixed(2)}`;
    
    const progressoMeta = Math.min((faturamentoMes / metas.faturamento) * 100, 100);
    const progressoElement = document.getElementById('progressMeta');
    const percentualElement = document.getElementById('percentualMeta');
    
    if (progressoElement && percentualElement) {
        progressoElement.style.width = `${progressoMeta}%`;
        percentualElement.textContent = `${Math.round(progressoMeta)}%`;
    }
    
    const hoje_date = new Date();
    const ultimoDiaMes = new Date(hoje_date.getFullYear(), hoje_date.getMonth() + 1, 0);
    const diasRestantes = Math.ceil((ultimoDiaMes - hoje_date) / (1000 * 60 * 60 * 24));
    const diasElement = document.getElementById('diasRestantes');
    if (diasElement) {
        diasElement.textContent = `Restam ${diasRestantes} dias no mês`;
    }
    
    const ticketMedio = servicosConcluidos.length > 0 ? 
        faturamentoMes / servicosConcluidos.length : 0;
    const ticketElement = document.getElementById('ticketMedio');
    if (ticketElement) {
        ticketElement.textContent = `R$ ${ticketMedio.toFixed(2)}`;
    }
    
    const clientesUnicos = [...new Set(servicos.map(s => s.cliente.toLowerCase()))].length;
    const clientesElement = document.getElementById('clientesUnicos');
    if (clientesElement) {
        clientesElement.textContent = clientesUnicos;
    }
    
    const clientesRepetidos = servicos.reduce((acc, servico) => {
        const cliente = servico.cliente.toLowerCase();
        acc[cliente] = (acc[cliente] || 0) + 1;
        return acc;
    }, {});
    const clientesQueVoltaram = Object.values(clientesRepetidos).filter(count => count > 1).length;
    const taxaRetorno = clientesUnicos > 0 ? (clientesQueVoltaram / clientesUnicos * 100) : 0;
    const taxaElement = document.getElementById('taxaRetorno');
    if (taxaElement) {
        taxaElement.textContent = `${Math.round(taxaRetorno)}%`;
    }
    
    const pendentesElement = document.getElementById('servicosPendentes');
    const andamentoElement = document.getElementById('servicosAndamento');
    const concluidosElement = document.getElementById('servicosConcluidos');
    
    if (pendentesElement) pendentesElement.textContent = servicosPendentes.length;
    if (andamentoElement) andamentoElement.textContent = servicosAndamento.length;
    if (concluidosElement) concluidosElement.textContent = servicosConcluidos.filter(s => s.data === hoje).length;
    
    const eficiencia = servicosHoje.length > 0 ? 
        (servicosHoje.filter(s => s.status === 'Concluído').length / servicosHoje.length * 100) : 0;
    const eficienciaElement = document.getElementById('eficiencia');
    if (eficienciaElement) {
        eficienciaElement.textContent = `${Math.round(eficiencia)}%`;
    }
    
    const contagemServicos = servicosConcluidos.reduce((acc, s) => {
        acc[s.tipo] = (acc[s.tipo] || 0) + 1;
        return acc;
    }, {});
    const servicoMaisPopular = Object.entries(contagemServicos)
        .sort(([,a], [,b]) => b - a)[0];
    
    if (servicoMaisPopular) {
        const popularElement = document.getElementById('servicoPopular');
        const quantidadeElement = document.getElementById('quantidadePopular');
        
        if (popularElement) popularElement.textContent = servicoMaisPopular[0];
        if (quantidadeElement) quantidadeElement.textContent = `${servicoMaisPopular[1]} realizações este mês`;
    } else {
        const popularElement = document.getElementById('servicoPopular');
        const quantidadeElement = document.getElementById('quantidadePopular');
        if (popularElement) popularElement.textContent = 'Nenhum serviço';
        if (quantidadeElement) quantidadeElement.textContent = '0 realizações';
    }
    
    atualizarRankingServicos(contagemServicos);
    atualizarBarrasMeta(faturamentoMes, servicosConcluidos.length, clientesUnicos);
    
    const servicosRecentes = document.getElementById('servicosRecentes');
    if (servicosRecentes) {
        if (servicosHoje.length > 0) {
            servicosRecentes.innerHTML = servicosHoje.slice(-5).reverse().map(s => `
                <div style="padding: 12px; border-left: 3px solid #00ffff; margin: 8px 0; background: #001a1a; border-radius: 5px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong style="color: #00ffff;">${s.cliente}</strong> - ${s.tipo}<br>
                            <span style="color: #cccccc; font-size: 0.9rem;">${s.veiculo}</span><br>
                            <span style="color: #00ffff; font-size: 0.8rem; font-weight: bold;">${s.placa || 'N/A'}</span>
                        </div>
                        <div style="text-align: right;">
                            <div style="color: #ffffff; font-weight: bold;">R$ ${s.valor.toFixed(2)}</div>
                            <span class="status-badge status-${s.status.toLowerCase().replace(' ', '').replace('í', 'i')}">${s.status}</span>
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            servicosRecentes.innerHTML = '<p style="text-align: center; color: #cccccc; padding: 20px;">Nenhum serviço registrado hoje.</p>';
        }
    }
    
    atualizarAlertas();
    atualizarInsightsAutomatico();
}

// Função para mostrar notificações
function mostrarNotificacao(mensagem, tipo) {
    const notificacao = document.createElement('div');
    notificacao.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${tipo === 'success' ? '#00ffff' : tipo === 'info' ? '#0099ff' : '#ff8800'};
        color: #000000;
        border-radius: 8px;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 4px 15px rgba(0, 255, 255, 0.5);
        animation: slideIn 0.3s ease-out;
    `;
    notificacao.textContent = mensagem;
    document.body.appendChild(notificacao);
    
    setTimeout(() => {
        notificacao.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notificacao.remove(), 300);
    }, 3000);
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
        <h4>Relatório do Período</h4>
        <p><strong>Total de Serviços:</strong> ${servicosPeriodo.length}</p>
        <p><strong>Serviços Concluídos:</strong> ${servicosConcluidos.length}</p>
        <p><strong>Faturamento Total:</strong> R$ ${faturamentoTotal.toFixed(2)}</p>
        <p><strong>Ticket Médio:</strong> R$ ${servicosConcluidos.length ? (faturamentoTotal / servicosConcluidos.length).toFixed(2) : '0.00'}</p>
        <br>
        <h4>Serviços por Tipo</h4>
        ${gerarResumoTipos(servicosConcluidos)}
    `;
}

function gerarResumoTipos(servicos) {
    const tipos = {};
    servicos.forEach(s => {
        tipos[s.tipo] = (tipos[s.tipo] || 0) + 1;
    });
    
    if (Object.keys(tipos).length === 0) {
        return '<p>Nenhum serviço concluído no período.</p>';
    }
    
    return Object.entries(tipos).map(([tipo, quantidade]) => 
        `<p><strong>${tipo}:</strong> ${quantidade} serviços</p>`
    ).join('');
}

// Inicialização do sistema
document.addEventListener('DOMContentLoaded', function() {
    // Atualizar preço do serviço automaticamente
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
    // Máscara para placa do veículo
    const placaInput = document.getElementById('placaVeiculo');
    if (placaInput) {
        placaInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
            
            if (value.length <= 3) {
                e.target.value = value;
            } else if (value.length <= 7) {
                e.target.value = value.substring(0, 3) + '-' + value.substring(3);
            } else {
                e.target.value = value.substring(0, 3) + '-' + value.substring(3, 7);
            }
        });
        
        placaInput.addEventListener('blur', function(e) {
            const placa = e.target.value;
            const formatoAntigo = /^[A-Z]{3}-\d{4}$/;
            const formatoMercosul = /^[A-Z]{3}\d[A-Z]\d{2}$/;
            
            if (placa && !formatoAntigo.test(placa) && !formatoMercosul.test(placa.replace('-', ''))) {
                alert('Formato de placa inválido. Use: ABC-1234 ou ABC1D23');
                e.target.focus();
            }
        });
    }
    
    // Adicionar estilos para animações de notificação
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // SISTEMA INICIA LIMPO - SEM DADOS DE EXEMPLO
    // Apenas inicializar as visualizações vazias
    atualizarDashboard();
    atualizarTabelaServicos();
    atualizarTabelaProdutos();
    atualizarOrcamento();
    
    // Definir datas padrão para relatório
    const hoje = new Date();
    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const dataInicialInput = document.getElementById('dataInicial');
    const dataFinalInput = document.getElementById('dataFinal');
    
    if (dataInicialInput) {
        dataInicialInput.value = primeiroDiaMes.toISOString().split('T')[0];
    }
    if (dataFinalInput) {
        dataFinalInput.value = hoje.toISOString().split('T')[0];
    }
    
    // Atualizar dashboard automaticamente a cada 30 segundos
    setInterval(function() {
        if (document.getElementById('dashboard').classList.contains('active')) {
            atualizarDashboard();
        }
    }, 30000);
    
    console.log('%c Sistema CB ESTETICAR iniciado com sucesso! ', 'background: #00ffff; color: #000000; font-weight: bold; padding: 5px 10px; border-radius: 5px;');
    console.log('%c Sistema limpo e pronto para uso.', 'color: #00ffff;');
});
