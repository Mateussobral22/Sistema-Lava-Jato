// Dados em memória
let servicos = [];
let produtos = [];
let receitas = [];
let despesas = [];

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
            <td><span class="status-badge status-${servico.status.toLowerCase().replace(' ', '')}">${servico.status}</span></td>
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
        <tr style="${produto.estoque <= produto.estoqueMinimo ? 'background-color: #fed7d7;' : ''}">
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