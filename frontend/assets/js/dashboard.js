document.addEventListener("DOMContentLoaded", () => {
    const dataElement = document.getElementById("dataAtual");
    if (dataElement) {
        const hoje = new Date();
        dataElement.textContent = hoje.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
            year: "numeric"
        });
    }

    const funcionariosRecentes = [
        { nome: "Ana Silva", cargo: "Desenvolvedora Front-end", depto: "TI", status: "Ativo" },
        { nome: "Carlos Eduardo", cargo: "Analista de RH", depto: "RH", status: "Ativo" },
        { nome: "Mariana Costa", cargo: "Gerente de Projetos", depto: "TI", status: "Ativo" },
        { nome: "Lucas Lima", cargo: "Contador", depto: "Financeiro", status: "Em Treinamento" },
        { nome: "Beatriz Souza", cargo: "Designer UX/UI", depto: "Design", status: "Ativo" }
    ];

    const tabelaBody = document.getElementById("tabelaRecentes");
    if (tabelaBody) {
        tabelaBody.innerHTML = funcionariosRecentes.map(func => `
      <tr>
        <td class="fw-semibold">${func.nome}</td>
        <td class="text-secondary small">${func.cargo}</td>
        <td><span class="badge bg-light text-dark border">${func.depto}</span></td>
        <td>
          <span class="badge ${func.status === 'Ativo' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}">
            ${func.status}
          </span>
        </td>
      </tr>
    `).join('');
    }

    const ctx = document.getElementById('chartDepartamentos');
    if (ctx) {
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['TI', 'RH', 'Financeiro', 'Design', 'Vendas', 'Marketing'],
                datasets: [{
                    label: 'Funcionários',
                    data: [42, 12, 18, 15, 26, 15],
                    backgroundColor: '#0d6efd',
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }


    const aniversariantes = [
        { nome: "Camila Rocha", tipo: "Aniversário", data: "12/08", detalhe: "Completando 29 anos" },
        { nome: "Roberto Alves", tipo: "Empresa", data: "18/08", detalhe: "Completa 3 anos de empresa 🎉" },
        { nome: "Fernanda Lima", tipo: "Aniversário", data: "25/08", detalhe: "Completando 34 anos" }
    ];

    const listaAnivEl = document.getElementById("listaAniversariantes");
    if (listaAnivEl) {
        listaAnivEl.innerHTML = aniversariantes.map(item => `
      <li class="list-group-item d-flex justify-content-between align-items-center py-3 border-light">
        <div class="d-flex align-items-center gap-3">
          <div class="p-2 ${item.tipo === 'Empresa' ? 'bg-primary-subtle text-primary' : 'bg-warning-subtle text-warning'} rounded-circle">
            <i class="bi ${item.tipo === 'Empresa' ? 'bi-award' : 'bi-gift'}"></i>
          </div>
          <div>
            <h6 class="mb-0 fw-semibold">${item.nome}</h6>
            <small class="text-muted">${item.detalhe}</small>
          </div>
        </div>
        <span class="badge bg-light text-dark border">${item.data}</span>
      </li>
    `).join('');
    }

    const alertasFerias = [
        { nome: "Marcos Vinicius", evento: "Férias a Vencer (2º período)", limite: "Em 15 dias", urgencia: "danger" },
        { nome: "Juliana Mendes", evento: "Término Contrato de Experiência (90 dias)", limite: "Em 5 dias", urgencia: "warning" },
        { nome: "Gabriel Santos", evento: "Em férias até 20/08", limite: "Ativo", urgencia: "info" }
    ];

    const listaAlertasEl = document.getElementById("listaAlertasFerias");
    if (listaAlertasEl) {
        listaAlertasEl.innerHTML = alertasFerias.map(alerta => `
      <div class="list-group-item d-flex justify-content-between align-items-center py-3 border-light">
        <div class="d-flex align-items-center gap-3">
          <span class="badge bg-${alerta.urgencia}-subtle text-${alerta.urgencia} p-2 rounded-circle">
            <i class="bi bi-clock-history"></i>
          </span>
          <div>
            <h6 class="mb-0 fw-semibold">${alerta.nome}</h6>
            <small class="text-muted">${alerta.evento}</small>
          </div>
        </div>
        <span class="badge bg-${alerta.urgencia} bg-opacity-10 text-${alerta.urgencia} border border-${alerta.urgencia}-subtle">
          ${alerta.limite}
        </span>
      </div>
    `).join('');
    }

});