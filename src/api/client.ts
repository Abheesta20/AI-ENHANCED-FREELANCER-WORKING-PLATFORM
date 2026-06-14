/**
 * API Client for communicating with Flask backend
 * Includes demo mode fallback when backend is not available
 */

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

// Demo mode storage
let demoMode = false;
let demoUsers: any[] = [];
let demoProjects: any[] = [];
let demoApplications: any[] = [];
let demoCurrentUser: any = null;

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
    // Load demo data from localStorage
    const savedUsers = localStorage.getItem('demo_users');
    const savedProjects = localStorage.getItem('demo_projects');
    const savedApps = localStorage.getItem('demo_applications');
    const savedCurrentUser = localStorage.getItem('demo_current_user');
    if (savedUsers) demoUsers = JSON.parse(savedUsers);
    if (savedProjects) demoProjects = JSON.parse(savedProjects);
    if (savedApps) demoApplications = JSON.parse(savedApps);
    if (savedCurrentUser) demoCurrentUser = JSON.parse(savedCurrentUser);
    
    // If we have a token but no demo current user, check if backend is available
    if (this.token && !demoCurrentUser) {
      // Will be handled by request method
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // If in demo mode, use local storage
    if (demoMode) {
      return this.demoRequest<T>(endpoint, options);
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data as T;
    } catch (error) {
      console.warn('Backend not available, switching to demo mode');
      demoMode = true;
      return this.demoRequest<T>(endpoint, options);
    }
  }

  private demoRequest<T>(endpoint: string, options: RequestInit = {}): T {
    const method = options.method || 'GET';
    const body = options.body ? JSON.parse(options.body as string) : null;
    
    // Auth endpoints
    if (endpoint === '/auth/register' && method === 'POST') {
      const existing = demoUsers.find((u: any) => u.email === body.email);
      if (existing) throw new Error('Email already registered');
      
      const newUser = {
        id: Date.now(),
        email: body.email,
        name: body.name,
        role: body.role,
        password: body.password
      };
      demoUsers.push(newUser);
      localStorage.setItem('demo_users', JSON.stringify(demoUsers));
      return { message: 'Registration successful', user_id: newUser.id } as T;
    }
    
    if (endpoint === '/auth/login' && method === 'POST') {
      const user = demoUsers.find((u: any) => u.email === body.email && u.password === body.password);
      if (!user) throw new Error('Invalid credentials');
      
      const token = 'demo_token_' + Date.now();
      this.setToken(token);
      demoCurrentUser = { id: user.id, name: user.name, email: user.email, role: user.role };
      localStorage.setItem('demo_current_user', JSON.stringify(demoCurrentUser));
      return { token, user: demoCurrentUser } as T;
    }
    
    if (endpoint === '/auth/me') {
      return demoCurrentUser as T;
    }
    
    // Freelancer endpoints
    if (endpoint === '/freelancer/profile' && method === 'POST') {
      const profile = { ...demoCurrentUser, ...body };
      localStorage.setItem('demo_freelancer_profile', JSON.stringify(profile));
      return { message: 'Profile saved' } as T;
    }
    
    if (endpoint === '/freelancer/profile') {
      const profile = localStorage.getItem('demo_freelancer_profile');
      if (profile) return JSON.parse(profile) as T;
      throw new Error('Profile not found');
    }
    
    if (endpoint === '/freelancers') {
      return demoUsers.filter((u: any) => u.role === 'freelancer').map(u => ({
        ...u,
        skills: u.skills || [],
        portfolio: u.portfolio || [],
        title: u.title || 'Freelancer',
        experience: u.experience || 0,
        hourly_rate: u.hourly_rate || 50,
        rating: u.rating || 4.0,
        bio: u.bio || '',
        education: u.education || '',
        availability: u.availability || 'full-time'
      })) as T;
    }
    
    // Project endpoints
    if (endpoint === '/projects' && method === 'POST') {
      const project = {
        id: Date.now(),
        client_id: demoCurrentUser.id,
        client_name: demoCurrentUser.name,
        created_at: new Date().toISOString(),
        applicant_count: 0,
        ...body
      };
      demoProjects.push(project);
      localStorage.setItem('demo_projects', JSON.stringify(demoProjects));
      return { message: 'Project created', project_id: project.id } as T;
    }
    
    if (endpoint.startsWith('/projects?') || endpoint === '/projects') {
      return demoProjects.filter((p: any) => p.status === 'open') as T;
    }
    
    if (endpoint === '/projects/my') {
      return demoProjects.filter((p: any) => p.client_id === demoCurrentUser?.id) as T;
    }
    
    // Application endpoints
    if (endpoint === '/applications' && method === 'POST') {
      const existing = demoApplications.find((a: any) => 
        a.project_id === body.project_id && a.freelancer_id === demoCurrentUser?.id
      );
      if (existing) throw new Error('Already applied');
      
      const project = demoProjects.find((p: any) => p.id === body.project_id);
      const app = {
        id: Date.now(),
        project_id: body.project_id,
        freelancer_id: demoCurrentUser?.id,
        project_title: project?.title || 'Project',
        proposed_budget: body.proposed_budget,
        cover_letter: body.cover_letter,
        status: 'pending',
        created_at: new Date().toISOString()
      };
      demoApplications.push(app);
      localStorage.setItem('demo_applications', JSON.stringify(demoApplications));
      return { message: 'Application submitted', application_id: app.id } as T;
    }
    
    if (endpoint === '/applications/my') {
      if (demoCurrentUser?.role === 'freelancer') {
        return demoApplications.filter((a: any) => a.freelancer_id === demoCurrentUser.id) as T;
      }
      const clientProjects = demoProjects.filter((p: any) => p.client_id === demoCurrentUser?.id);
      const projectIds = clientProjects.map((p: any) => p.id);
      return demoApplications.filter((a: any) => projectIds.includes(a.project_id)) as T;
    }
    
    // ML endpoints
    if (endpoint === '/ml/predict') {
      const score = Math.floor(Math.random() * 60) + 40;
      return {
        score,
        level: score >= 70 ? 'Strong Match' : score >= 45 ? 'Moderate Match' : 'Low Match',
        factors: {
          skills_match: Math.floor(Math.random() * 40) + 60,
          technologies_match: Math.floor(Math.random() * 40) + 60,
          experience_relevance: Math.floor(Math.random() * 40) + 60,
          category_relevance: Math.floor(Math.random() * 40) + 60,
          rating_score: Math.floor(Math.random() * 30) + 70
        }
      } as T;
    }
    
    // AI endpoints
    if (endpoint === '/ai/generate-proposal') {
      const project = demoProjects.find((p: any) => p.id === body.project_id);
      return {
        proposal: `I am excited to apply for "${project?.title || 'this project'}". With my extensive experience in the required technologies, I can deliver a high-quality solution that meets your needs.\n\nI have successfully completed similar projects and am confident in my ability to deliver on time and within budget. I look forward to discussing how I can contribute to your project's success.`
      } as T;
    }
    
    if (endpoint === '/ai/generate-summary') {
      return {
        summary: `Experienced professional with a strong background in software development. Skilled in modern technologies with a track record of delivering successful projects.`
      } as T;
    }
    
    throw new Error('Unknown endpoint');
  }

  // Auth endpoints
  async register(email: string, password: string, name: string, role: string) {
    return this.request<{ message: string; user_id: number }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role }),
    });
  }

  async login(email: string, password: string) {
    const data = await this.request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async getMe() {
    if (demoMode && demoCurrentUser) {
      return demoCurrentUser as User;
    }
    return this.request<User>('/auth/me');
  }

  logout() {
    this.setToken(null);
    localStorage.removeItem('current_user');
    localStorage.removeItem('demo_current_user');
    demoCurrentUser = null;
  }

  // Freelancer endpoints
  async getFreelancerProfile() {
    return this.request<FreelancerProfile>('/freelancer/profile');
  }

  async saveFreelancerProfile(profile: Partial<FreelancerProfile>) {
    return this.request<{ message: string }>('/freelancer/profile', {
      method: 'POST',
      body: JSON.stringify(profile),
    });
  }

  async getAllFreelancers() {
    return this.request<FreelancerProfile[]>('/freelancers');
  }

  async getFreelancerById(id: number) {
    return this.request<FreelancerProfile>(`/freelancers/${id}`);
  }

  // Client endpoints
  async getClientProfile() {
    return this.request<ClientProfile>('/client/profile');
  }

  async saveClientProfile(profile: Partial<ClientProfile>) {
    return this.request<{ message: string }>('/client/profile', {
      method: 'POST',
      body: JSON.stringify(profile),
    });
  }

  // Project endpoints
  async getProjects(status = 'open', category = '') {
    const params = new URLSearchParams({ status });
    if (category) params.append('category', category);
    return this.request<Project[]>(`/projects?${params}`);
  }

  async getMyProjects() {
    return this.request<Project[]>('/projects/my');
  }

  async createProject(project: Partial<Project>) {
    return this.request<{ message: string; project_id: number }>('/projects', {
      method: 'POST',
      body: JSON.stringify(project),
    });
  }

  async getProject(id: number) {
    return this.request<Project>(`/projects/${id}`);
  }

  async updateProject(id: number, data: Partial<Project>) {
    return this.request<{ message: string }>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProject(id: number) {
    return this.request<{ message: string }>(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Application endpoints
  async applyToProject(projectId: number, budget: number, coverLetter: string) {
    return this.request<{ message: string; application_id: number }>('/applications', {
      method: 'POST',
      body: JSON.stringify({
        project_id: projectId,
        proposed_budget: budget,
        cover_letter: coverLetter,
      }),
    });
  }

  async getMyApplications() {
    return this.request<Application[]>('/applications/my');
  }

  async updateApplication(id: number, status: string) {
    return this.request<{ message: string }>(`/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // ML endpoints
  async predictMatch(freelancerId: number, projectId: number) {
    return this.request<MatchResult>('/ml/predict', {
      method: 'POST',
      body: JSON.stringify({ freelancer_id: freelancerId, project_id: projectId }),
    });
  }

  async matchAllFreelancers(projectId: number) {
    return this.request<MatchResult[]>('/ml/match-all', {
      method: 'POST',
      body: JSON.stringify({ project_id: projectId }),
    });
  }

  // AI endpoints
  async generateProposal(projectId: number) {
    return this.request<{ proposal: string }>('/ai/generate-proposal', {
      method: 'POST',
      body: JSON.stringify({ project_id: projectId }),
    });
  }

  async generateSummary() {
    return this.request<{ summary: string }>('/ai/generate-summary', {
      method: 'POST',
    });
  }
}

// Types
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'freelancer' | 'client';
}

export interface FreelancerProfile extends User {
  title: string;
  skills: string[];
  experience: number;
  hourly_rate: number;
  rating: number;
  completed_projects: number;
  bio: string;
  education: string;
  availability: string;
  portfolio: PortfolioItem[];
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  link?: string;
}

export interface ClientProfile extends User {
  company: string;
  industry: string;
  website: string;
}

export interface Project {
  id: number;
  client_id: number;
  client_name?: string;
  client_email?: string;
  title: string;
  description: string;
  requirements: string[];
  skills: string[];
  category: string;
  budget: number;
  deadline: string;
  experience_level: string;
  status: string;
  applicant_count?: number;
  application_status?: string;
  created_at: string;
}

export interface Application {
  id: number;
  project_id: number;
  freelancer_id: number;
  project_title: string;
  project_budget: number;
  project_skills: string[];
  client_name?: string;
  freelancer_name?: string;
  freelancer_skills?: string[];
  proposed_budget: number;
  cover_letter: string;
  status: string;
  created_at: string;
}

export interface MatchResult {
  score: number;
  level: string;
  factors: {
    skills_match: number;
    technologies_match: number;
    experience_relevance: number;
    category_relevance: number;
    rating_score: number;
  };
}

export interface FreelancerMatch {
  freelancer: FreelancerProfile;
  match: MatchResult;
}

export const api = new ApiClient();
export default api;
