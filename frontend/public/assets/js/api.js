/**
 * Módulo de API
 * Centraliza todas as chamadas HTTP para o backend
 */

const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Classe para gerenciar requisições HTTP
 */
class ApiClient {
    /**
     * Fazer requisição GET
     */
    static async get(endpoint) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erro na requisição GET:', error);
            throw error;
        }
    }

    /**
     * Fazer requisição POST
     */
    static async post(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erro na requisição POST:', error);
            throw error;
        }
    }

    /**
     * Fazer requisição PUT
     */
    static async put(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erro na requisição PUT:', error);
            throw error;
        }
    }

    /**
     * Fazer requisição DELETE
     */
    static async delete(endpoint) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }

            return response.ok;
        } catch (error) {
            console.error('Erro na requisição DELETE:', error);
            throw error;
        }
    }
}

/**
 * API de Funcionários
 */
class EmployeeApi {
    /**
     * Obter todos os funcionários
     */
    static async getAll() {
        return ApiClient.get('/employees');
    }

    /**
     * Obter funcionário por ID
     */
    static async getById(id) {
        return ApiClient.get(`/employees/${id}`);
    }

    /**
     * Criar novo funcionário
     */
    static async create(data) {
        return ApiClient.post('/employees', data);
    }

    /**
     * Atualizar funcionário
     */
    static async update(id, data) {
        return ApiClient.put(`/employees/${id}`, data);
    }

    /**
     * Deletar funcionário
     */
    static async delete(id) {
        return ApiClient.delete(`/employees/${id}`);
    }
}

/**
 * Funções utilitárias
 */
class Utils {
    /**
     * Formatar data para padrão brasileiro
     */
    static formatDate(dateString) {
        if (!dateString) return '-';
        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
        return new Date(dateString).toLocaleDateString('pt-BR', options);
    }

    /**
     * Formatar moeda em real
     */
    static formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }

    /**
     * Traduzir status
     */
    static translateStatus(status) {
        const translations = {
            'ACTIVE': 'Ativo',
            'INACTIVE': 'Inativo',
            'ON_LEAVE': 'De Licença'
        };
        return translations[status] || status;
    }

    /**
     * Mostrar notificação de sucesso
     */
    static showSuccess(message) {
        alert(message);
    }

    /**
     * Mostrar notificação de erro
     */
    static showError(message) {
        alert(`Erro: ${message}`);
    }
}