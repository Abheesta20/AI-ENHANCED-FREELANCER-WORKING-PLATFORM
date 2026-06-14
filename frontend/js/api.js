/**
 * API Client for FreelanceAI Platform
 */

const API_BASE = 'http://localhost:5000/api';

class ApiClient {
    constructor() {
        this.token = localStorage.getItem('auth_token');
    }

    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('auth_token', token);
        } else {
            localStorage.removeItem('auth_token');
        }
    }

    async request(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (this.token) {
            headers['X-User-Id'] = this.token;
}

        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                ...options,
                headers,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            return data;
        } catch (error) {
            if (error.message === 'Failed to fetch') {
                throw new Error('Unable to connect to server');
            }
            throw error;
        }
    }

    // Auth
    async register(email, password, name, role) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name, role }),
        });
    }

    async login(email, password) {
    const data = await this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });

    if (data.user) {
        this.setToken(data.user.id);
    }

    return data;
}

    logout() {
        this.setToken(null);
        localStorage.removeItem('current_user');
    }

    // Freelancer
    async getFreelancerProfile() {
        return [];
    }

    async saveFreelancerProfile(profile) {
        return this.request('/freelancer/profile', {
            method: 'POST',
            body: JSON.stringify(profile),
        });
    }

    async getAllFreelancers(category = '') {
        const params = category ? `?category=${category}` : '';
        return this.request(`/freelancers${params}`);
    }

    async getFreelancerById(id) {
        return this.request(`/freelancers/${id}`);
    }

    // Client
    async getClientProfile() {
        return this.request('/client/profile');
    }

    // Projects
    async getProjects(category = '') {
        const params = category ? `?category=${category}` : '';
        return this.request(`/projects${params}`);
    }

    async getMyProjects() {
        return [];
    }

    async createProject(project) {
        return this.request('/projects', {
            method: 'POST',
            body: JSON.stringify(project),
        });
    }

    async deleteProject(id) {
        return this.request(`/projects/${id}`, { method: 'DELETE' });
    }

    // Applications
    async applyToProject(projectId, budget, proposal) {

    const user = JSON.parse(localStorage.getItem('current_user'));

    return this.request('/applications', {
        method: 'POST',
        body: JSON.stringify({
            project_id: projectId,
            freelancer_id: user.id,
            budget: budget,
            proposal: proposal
        }),
    });
}

    async getMyApplications() {
    const user = JSON.parse(localStorage.getItem('current_user'));

    if (!user) return [];

    if (user.role === 'freelancer') {
        return this.request(`/applications?freelancer_id=${user.id}`);
    }

    return this.request(`/applications?client_id=${user.id}`);
}

    async updateApplication(id, status) {
        return this.request(`/applications/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
    }

    // ML
    async predictMatch(freelancerId, projectId) {
        return this.request('/ml/predict', {
            method: 'POST',
            body: JSON.stringify({ freelancer_id: freelancerId, project_id: projectId }),
        });
    }

    async matchFreelancers(projectId) {
        return this.request('/ml/match-all', {
            method: 'POST',
            body: JSON.stringify({ project_id: projectId }),
        });
    }

    async recommendProjects() {
        return [];
    }

    // AI
    async generateProposal(projectId) {
        return this.request('/ai/generate-proposal', {
            method: 'POST',
            body: JSON.stringify({ project_id: projectId }),
        });
    }

    async generateSummary() {
        return this.request('/ai/generate-summary', {
            method: 'POST',
        });
    }
}

const api = new ApiClient();
