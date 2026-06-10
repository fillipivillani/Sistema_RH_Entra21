/**
 * Gerenciamento de Funcionários
 */

let employees = [];
let selectedEmployeeId = null;
const modal = new bootstrap.Modal(document.getElementById('addEmployeeModal'));

// Elementos DOM
const employeesTable = document.getElementById('employeesTable');
const employeesBody = document.getElementById('employeesBody');
const noDataAlert = document.getElementById('noData');
const searchInput = document.getElementById('searchInput');
const statusFilter = document.getElementById('statusFilter');
const employeeForm = document.getElementById('employeeForm');
const modalTitle = document.getElementById('modalTitle');

/**
 * Inicializar página
 */
document.addEventListener('DOMContentLoaded', async () => {
    loadEmployees();
    setupEventListeners();
});

/**
 * Configurar event listeners
 */
function setupEventListeners() {
    searchInput.addEventListener('input', filterEmployees);
    statusFilter.addEventListener('change', filterEmployees);
    employeeForm.addEventListener('submit', handleFormSubmit);
    
    // Limpar formulário ao abrir modal de novo funcionário
    document.getElementById('addEmployeeModal').addEventListener('show.bs.modal', (e) => {
        if (!e.relatedTarget?.dataset.employeeId) {
            employeeForm.reset();
            selectedEmployeeId = null;
            modalTitle.textContent = 'Adicionar Funcionário';
        }
    });
}

/**
 * Carregar funcionários do servidor
 */
async function loadEmployees() {
    try {
        employees = await EmployeeApi.getAll();
        renderEmployees(employees);
    } catch (error) {
        Utils.showError('Erro ao carregar funcionários');
        console.error(error);
    }
}

/**
 * Renderizar tabela de funcionários
 */
function renderEmployees(data) {
    employeesBody.innerHTML = '';

    if (data.length === 0) {
        employeesTable.style.display = 'none';
        noDataAlert.style.display = 'block';
        return;
    }

    employeesTable.style.display = 'table';
    noDataAlert.style.display = 'none';

    data.forEach(employee => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <strong>${employee.name}</strong>
            </td>
            <td>${employee.email}</td>
            <td>${employee.position}</td>
            <td>${Utils.formatCurrency(employee.salary)}</td>
            <td>${Utils.formatDate(employee.hiringDate)}</td>
            <td>
                <span class="badge bg-${getStatusColor(employee.status)}">
                    ${Utils.translateStatus(employee.status)}
                </span>
            </td>
            <td>
                <button 
                    class="btn btn-sm btn-outline-primary" 
                    onclick="editEmployee(${employee.id})"
                    title="Editar"
                >
                    ✏️
                </button>
                <button 
                    class="btn btn-sm btn-outline-danger" 
                    onclick="deleteEmployee(${employee.id})"
                    title="Deletar"
                >
                    🗑️
                </button>
            </td>
        `;
        employeesBody.appendChild(row);
    });
}

/**
 * Filtrar funcionários por busca e status
 */
function filterEmployees() {
    const searchTerm = searchInput.value.toLowerCase();
    const statusValue = statusFilter.value;

    const filtered = employees.filter(employee => {
        const matchesSearch = employee.name.toLowerCase().includes(searchTerm) ||
                            employee.email.toLowerCase().includes(searchTerm);
        const matchesStatus = !statusValue || employee.status === statusValue;
        return matchesSearch && matchesStatus;
    });

    renderEmployees(filtered);
}

/**
 * Editar funcionário
 */
async function editEmployee(id) {
    try {
        const employee = await EmployeeApi.getById(id);
        selectedEmployeeId = id;

        // Preencher formulário
        document.getElementById('name').value = employee.name;
        document.getElementById('email').value = employee.email;
        document.getElementById('phone').value = employee.phone || '';
        document.getElementById('position').value = employee.position;
        document.getElementById('salary').value = employee.salary;
        document.getElementById('hiringDate').value = employee.hiringDate;
        document.getElementById('status').value = employee.status;

        modalTitle.textContent = 'Editar Funcionário';
        modal.show();
    } catch (error) {
        Utils.showError('Erro ao carregar funcionário');
        console.error(error);
    }
}

/**
 * Deletar funcionário
 */
async function deleteEmployee(id) {
    if (!confirm('Tem certeza que deseja deletar este funcionário?')) {
        return;
    }

    try {
        await EmployeeApi.delete(id);
        Utils.showSuccess('Funcionário deletado com sucesso!');
        loadEmployees();
    } catch (error) {
        Utils.showError('Erro ao deletar funcionário');
        console.error(error);
    }
}

/**
 * Processar submissão do formulário
 */
async function handleFormSubmit(e) {
    e.preventDefault();

    const employeeData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        position: document.getElementById('position').value,
        salary: parseFloat(document.getElementById('salary').value),
        hiringDate: document.getElementById('hiringDate').value,
        status: document.getElementById('status').value
    };

    try {
        if (selectedEmployeeId) {
            // Atualizar
            await EmployeeApi.update(selectedEmployeeId, employeeData);
            Utils.showSuccess('Funcionário atualizado com sucesso!');
        } else {
            // Criar novo
            await EmployeeApi.create(employeeData);
            Utils.showSuccess('Funcionário criado com sucesso!');
        }

        modal.hide();
        selectedEmployeeId = null;
        loadEmployees();
    } catch (error) {
        Utils.showError('Erro ao salvar funcionário');
        console.error(error);
    }
}

/**
 * Obter cor do badge baseado no status
 */
function getStatusColor(status) {
    const colors = {
        'ACTIVE': 'success',
        'INACTIVE': 'secondary',
        'ON_LEAVE': 'warning'
    };
    return colors[status] || 'secondary';
}