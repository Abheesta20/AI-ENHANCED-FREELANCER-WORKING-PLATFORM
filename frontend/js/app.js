/**
 * FreelanceAI - Main Application
 */

let currentUser = null;
let currentPage = 'home';
let selectedProject = null;

// Sample Data for immediate display
const sampleFreelancers = [
    { id: 101, name: 'Rahul Sharma', title: 'Full Stack Developer', skills: ['React', 'Node.js', 'Python', 'MongoDB', 'TypeScript'], experience: 7, hourly_rate: 45, rating: 4.8, completed_projects: 45, bio: 'Experienced full-stack developer with expertise in modern web technologies.', education: 'B.Tech Computer Science, IIT Delhi' },
    { id: 102, name: 'Priya Reddy', title: 'Frontend Developer', skills: ['React', 'Vue.js', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Tailwind'], experience: 5, hourly_rate: 40, rating: 4.7, completed_projects: 38, bio: 'Passionate frontend developer creating beautiful user interfaces.', education: 'B.Sc IT, Hyderabad University' },
    { id: 103, name: 'Arjun Kumar', title: 'AI/ML Engineer', skills: ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Deep Learning', 'NLP'], experience: 6, hourly_rate: 55, rating: 4.9, completed_projects: 32, bio: 'AI/ML specialist with focus on NLP and computer vision.', education: 'M.Tech AI, IIT Bombay' },
    { id: 104, name: 'Sneha Patel', title: 'UI/UX Designer', skills: ['Figma', 'Adobe XD', 'Photoshop', 'UI Design', 'UX Research', 'Prototyping'], experience: 4, hourly_rate: 35, rating: 4.6, completed_projects: 42, bio: 'Creative designer focused on user-centered design principles.', education: 'B.Des Design, NID Ahmedabad' },
    { id: 105, name: 'Vikram Singh', title: 'Backend Developer', skills: ['Python', 'Java', 'Go', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes'], experience: 8, hourly_rate: 50, rating: 4.8, completed_projects: 55, bio: 'Backend architect specializing in scalable microservices.', education: 'B.Tech CS, BITS Pilani' },
    { id: 106, name: 'Ananya Gupta', title: 'Digital Marketer', skills: ['SEO', 'Google Ads', 'Facebook Ads', 'Content Marketing', 'Analytics'], experience: 5, hourly_rate: 38, rating: 4.5, completed_projects: 50, bio: 'Digital marketing expert with proven ROI optimization.', education: 'MBA Marketing, IIM Bangalore' },
    { id: 107, name: 'Kiran Rao', title: 'Data Scientist', skills: ['Python', 'SQL', 'Machine Learning', 'Pandas', 'NumPy', 'Tableau'], experience: 6, hourly_rate: 48, rating: 4.7, completed_projects: 35, bio: 'Data scientist passionate about extracting insights from data.', education: 'M.Sc Data Science, Stanford' },
    { id: 108, name: 'Neha Verma', title: 'Mobile Developer', skills: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Firebase', 'iOS', 'Android'], experience: 4, hourly_rate: 42, rating: 4.6, completed_projects: 28, bio: 'Mobile app developer creating cross-platform applications.', education: 'B.Tech CS, VIT Vellore' }
];

const sampleProjects = [
    { id: 1001, title: 'AI Resume Screening System', description: 'Build an AI-powered system to automatically screen and rank resumes based on job requirements. Should include NLP for skill extraction.', budget: 15000, category: 'ai-ml', skills: ['Python', 'TensorFlow', 'NLP', 'FastAPI'], experience_level: 'expert', deadline: '2026-04-30', client_name: 'TechCorp Solutions', status: 'open', applicant_count: 12 },
    { id: 1002, title: 'E-Commerce Website Development', description: 'Full e-commerce platform with product catalog, cart, checkout, and admin dashboard. Must support payment integration.', budget: 12000, category: 'full-stack', skills: ['React', 'Node.js', 'MongoDB', 'Stripe'], experience_level: 'intermediate', deadline: '2026-03-31', client_name: 'ShopEasy Inc', status: 'open', applicant_count: 8 },
    { id: 1003, title: 'React Dashboard Application', description: 'Create a modern admin dashboard with charts, tables, and real-time data visualization.', budget: 8000, category: 'frontend', skills: ['React', 'TypeScript', 'Chart.js', 'Tailwind'], experience_level: 'intermediate', deadline: '2026-03-15', client_name: 'DataViz Corp', status: 'open', applicant_count: 15 },
    { id: 1004, title: 'Mobile Banking App', description: 'Develop a secure mobile banking application with fund transfer, bill payments, and account management.', budget: 20000, category: 'mobile', skills: ['React Native', 'Firebase', 'Node.js', 'Security'], experience_level: 'expert', deadline: '2026-05-30', client_name: 'FinSecure Bank', status: 'open', applicant_count: 6 },
    { id: 1005, title: 'Digital Marketing Campaign', description: 'Plan and execute comprehensive digital marketing campaign including SEO, PPC, and social media.', budget: 5000, category: 'marketing', skills: ['SEO', 'Google Ads', 'Social Media', 'Analytics'], experience_level: 'intermediate', deadline: '2026-02-28', client_name: 'GrowthHub', status: 'open', applicant_count: 10 },
    { id: 1006, title: 'Portfolio Website Design', description: 'Design and develop a creative portfolio website for a photography studio.', budget: 4000, category: 'frontend', skills: ['HTML', 'CSS', 'JavaScript', 'Figma'], experience_level: 'beginner', deadline: '2026-02-15', client_name: 'ArtVisions Studio', status: 'open', applicant_count: 20 },
    { id: 1007, title: 'Inventory Management System', description: 'Build complete inventory management with barcode scanning, stock alerts, and reporting.', budget: 10000, category: 'full-stack', skills: ['Python', 'Django', 'PostgreSQL', 'React'], experience_level: 'intermediate', deadline: '2026-04-15', client_name: 'LogiTrack', status: 'open', applicant_count: 7 },
    { id: 1008, title: 'ML Prediction System', description: 'Develop ML models for sales prediction with data visualization dashboard.', budget: 18000, category: 'ai-ml', skills: ['Python', 'Scikit-learn', 'Pandas', 'Tableau'], experience_level: 'expert', deadline: '2026-05-15', client_name: 'PredictTech', status: 'open', applicant_count: 5 }
];

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    // Check for existing session - auto login if token exists
    const savedUser = localStorage.getItem('current_user');
    const savedToken = localStorage.getItem('auth_token');
    
    if (savedUser && savedToken) {
        currentUser = JSON.parse(savedUser);
        api.setToken(savedToken);
        updateUIForLoggedInUser();
        // Don't navigate automatically, stay on home
    }
    
    setupForms();
    navigateTo('home');
    
    // Pre-load projects and freelancers for faster access
    preloadData();
});

// Pre-load data for faster page transitions
function preloadData() {
    // Cache sample data in window for quick access
    window.cachedFreelancers = sampleFreelancers;
    window.cachedProjects = sampleProjects;
}

// ============================================================
// NAVIGATION
// ============================================================

function navigateTo(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.add('d-none'));
    const target = document.getElementById(`page-${page}`);
    if (target) target.classList.remove('d-none');
    
    currentPage = page;
    
    // Load data immediately for each page
    if (page === 'freelancer-dashboard' && currentUser) {
        loadFreelancerDashboard();
    } else if (page === 'client-dashboard' && currentUser) {
        loadClientDashboard();
    } else if (page === 'projects') {
        loadPublicProjects(); // Shows sample projects immediately
    } else if (page === 'freelancers') {
        loadPublicFreelancersPage(); // Shows sample freelancers immediately
    }
    
    window.scrollTo(0, 0);
}

function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.add('d-none'));
    const target = document.getElementById(sectionId);
    if (target) target.classList.remove('d-none');
    
    // Update sidebar active state
    document.querySelectorAll('.sidebar .nav-link').forEach(link => link.classList.remove('active'));
    event.target.closest('.nav-link').classList.add('active');
    
    // Load section data
    if (sectionId === 'freelancer-profile') loadProfile();
    if (sectionId === 'freelancer-projects') loadProjects();
    if (sectionId === 'freelancer-applications') loadMyApplications();
    if (sectionId === 'freelancer-ai-tools') loadAIProjects();
    if (sectionId === 'client-freelancers') loadFreelancers();
    if (sectionId === 'client-applications') loadClientApplications();
    if (sectionId === 'client-projects') loadClientProjects();
}

// ============================================================
// FORMS SETUP
// ============================================================

function setupForms() {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleLogin();
    });
    
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleRegister();
    });
    
    document.getElementById('profileForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleSaveProfile();
    });
    
    document.getElementById('projectForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleCreateProject();
    });
}

// ============================================================
// AUTHENTICATION
// ============================================================

async function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        showLoading();
        const data = await api.login(email, password);

currentUser = data.user;

localStorage.setItem(
    'current_user',
    JSON.stringify(currentUser)
);

// Store user id instead of token
localStorage.setItem(
    'auth_token',
    currentUser.id
);
        updateUIForLoggedInUser();
        showToast('Login Successful', 'success');
        
        // Navigate immediately after short delay for toast visibility
        setTimeout(() => {
            navigateTo(currentUser.role === 'freelancer' ? 'freelancer-dashboard' : 'client-dashboard');
        }, 300);
    } catch (error) {
        showAlert('loginAlert', error.message, 'danger');
    } finally {
        hideLoading();
    }
}

async function handleRegister() {
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const role = document.querySelector('input[name="role"]:checked').value;
    
    try {
        showLoading();
        await api.register(email, password, name, role);
        showToast('Registration Successful', 'success');
        
        setTimeout(() => navigateTo('login'), 500);
    } catch (error) {
        showAlert('registerAlert', error.message, 'danger');
    } finally {
        hideLoading();
    }
}

function logout() {
    api.logout();
    currentUser = null;
    updateUIForLoggedOutUser();
    navigateTo('home');
    showToast('Logged out successfully', 'success');
}

function demoLogin(email) {
    document.getElementById('loginEmail').value = email;
    document.getElementById('loginPassword').value = 'demo123';
    handleLogin();
}

// Quick login for returning users
function quickLogin(role) {
    if (role === 'freelancer') {
        currentUser = { id: 101, name: 'Rahul Sharma', email: 'rahul@demo.com', role: 'freelancer' };
    } else {
        currentUser = { id: 1001, name: 'TechCorp Solutions', email: 'client@demo.com', role: 'client' };
    }
    localStorage.setItem('current_user', JSON.stringify(currentUser));
    updateUIForLoggedInUser();
    navigateTo(role === 'freelancer' ? 'freelancer-dashboard' : 'client-dashboard');
}

function updateUIForLoggedInUser() {
    document.getElementById('authButtons').classList.add('d-none');
    document.getElementById('userMenu').classList.remove('d-none');
    document.getElementById('userName').textContent = currentUser.name;
    
    const navLinks = document.getElementById('navLinks');
    if (currentUser.role === 'freelancer') {
        navLinks.innerHTML = `
            <li class="nav-item"><a class="nav-link" href="#" onclick="navigateTo('freelancer-dashboard')">Dashboard</a></li>
        `;
    } else {
        navLinks.innerHTML = `
            <li class="nav-item"><a class="nav-link" href="#" onclick="navigateTo('client-dashboard')">Dashboard</a></li>
        `;
    }
}

function updateUIForLoggedOutUser() {
    document.getElementById('authButtons').classList.remove('d-none');
    document.getElementById('userMenu').classList.add('d-none');
    document.getElementById('navLinks').innerHTML = `
        <li class="nav-item"><a class="nav-link" href="#" onclick="navigateTo('home')">Home</a></li>
    `;
}

// ============================================================
// FREELANCER DASHBOARD
// ============================================================

async function loadFreelancerDashboard() {
    try {
        const [projects, applications, recommendations] = await Promise.all([
            api.getProjects(),
            api.getMyApplications(),
            api.recommendProjects().catch(() => [])
        ]);
        
        document.getElementById('statProjects').textContent = projects.length;
        document.getElementById('statApplications').textContent = applications.length;
        document.getElementById('statPending').textContent = applications.filter(a => a.status === 'pending').length;
        document.getElementById('statHired').textContent = applications.filter(a => a.status === 'accepted').length;
        
        const container = document.getElementById('recommendedProjects');
        if (recommendations.length > 0) {
            container.innerHTML = recommendations.slice(0, 3).map(r => createProjectCard(r.project, r.match)).join('');
        } else {
            container.innerHTML = '<p class="text-muted">Complete your profile to get recommendations</p>';
        }
    } catch (error) {
        console.error('Dashboard error:', error);
    }
}

// ============================================================
// CLIENT DASHBOARD
// ============================================================

async function loadClientDashboard() {
    try {
        const [projects, applications] = await Promise.all([
            api.getMyProjects(),
            api.getMyApplications()
        ]);
        
        document.getElementById('clientStatProjects').textContent = projects.length;
        document.getElementById('clientStatApps').textContent = applications.length;
        document.getElementById('clientStatPending').textContent = applications.filter(a => a.status === 'pending').length;
        document.getElementById('clientStatHired').textContent = applications.filter(a => a.status === 'accepted').length;
    } catch (error) {
        console.error('Dashboard error:', error);
    }
}

// ============================================================
// PROJECTS
// ============================================================

async function loadProjects() {
    const category = document.getElementById('projectCategoryFilter')?.value || '';
    
    try {
        const projects = await api.getProjects(category);
        const container = document.getElementById('projectsList');
        
        if (projects.length === 0) {
            container.innerHTML = '<div class="col-12 text-center py-5"><p class="text-muted">No projects found</p></div>';
        } else {
            container.innerHTML = projects.map(p => `
                <div class="col-md-6 col-lg-4">
                    ${createProjectCard(p)}
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Projects error:', error);
    }
}

function filterPublicProjects() {
    const category = document.getElementById('projectFilterPublic')?.value || '';
    const container = document.getElementById('projectsList');
    if (!container) return;
    
    let filteredProjects = sampleProjects;
    if (category) {
        filteredProjects = sampleProjects.filter(p => p.category === category);
    }
    
    container.innerHTML = filteredProjects.map(p => `
        <div class="col-md-6 col-lg-4">${createProjectCard(p)}</div>
    `).join('');
}

async function loadPublicProjects() {
    // Show sample projects immediately
    const container = document.getElementById('projectsList');
    if (!container) return;
    
    // First show sample data
    container.innerHTML = sampleProjects.map(p => `
        <div class="col-md-6 col-lg-4">${createProjectCard(p)}</div>
    `).join('');
    
    // Then try to load real projects from backend
    try {
        const projects = await api.getProjects();
        if (projects && projects.length > 0) {
            // Combine sample and real projects, avoiding duplicates
            const allProjects = [...sampleProjects];
            projects.forEach(p => {
                if (!allProjects.find(sp => sp.id === p.id)) {
                    allProjects.push(p);
                }
            });
            container.innerHTML = allProjects.map(p => `
                <div class="col-md-6 col-lg-4">${createProjectCard(p)}</div>
            `).join('');
        }
    } catch (error) {
        // Keep showing sample data if backend unavailable
        console.log('Using sample projects');
    }
}

async function loadPublicFreelancersPage() {
    // Show sample freelancers immediately
    const container = document.getElementById('freelancersPublicList');
    if (!container) return;
    
    // First show sample data
    container.innerHTML = sampleFreelancers.map(f => `
        <div class="col-md-6 col-lg-4">
            <div class="card freelancer-card h-100 border-0 shadow-sm">
                <div class="card-body">
                    <div class="d-flex align-items-center mb-3">
                        <div class="avatar me-3">${f.name.charAt(0)}</div>
                        <div>
                            <h5 class="card-title mb-0">${f.name}</h5>
                            <small class="text-muted">${f.title}</small>
                        </div>
                    </div>
                    <p class="small text-muted mb-2">${truncate(f.bio, 80)}</p>
                    <div class="mb-2">
                        ${f.skills.slice(0, 3).map(s => `<span class="skill-tag">${s}</span>`).join('')}
                        ${f.skills.length > 3 ? `<span class="skill-tag">+${f.skills.length - 3}</span>` : ''}
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <span class="rating-stars">${renderStars(f.rating)}</span>
                            <small class="text-muted ms-1">${f.rating}</small>
                        </div>
                        <span class="fw-bold text-primary">$${f.hourly_rate}/hr</span>
                    </div>
                    <button class="btn btn-outline-primary w-100 mt-3" onclick="viewSampleFreelancer(${f.id})">
                        View Profile
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Then try to load real freelancers from backend
    try {
        const freelancers = await api.getAllFreelancers();
        if (freelancers && freelancers.length > 0) {
            // Combine sample and real freelancers
            const allFreelancers = [...sampleFreelancers];
            freelancers.forEach(f => {
                if (!allFreelancers.find(sf => sf.id === f.id)) {
                    allFreelancers.push(f);
                }
            });
            container.innerHTML = allFreelancers.map(f => `
                <div class="col-md-6 col-lg-4">
                    <div class="card freelancer-card h-100 border-0 shadow-sm">
                        <div class="card-body">
                            <div class="d-flex align-items-center mb-3">
                                <div class="avatar me-3">${f.name.charAt(0)}</div>
                                <div>
                                    <h5 class="card-title mb-0">${f.name}</h5>
                                    <small class="text-muted">${f.title || 'Freelancer'}</small>
                                </div>
                            </div>
                            <p class="small text-muted mb-2">${truncate(f.bio || 'No bio', 80)}</p>
                            <div class="mb-2">
                                ${(f.skills || []).slice(0, 3).map(s => `<span class="skill-tag">${s}</span>`).join('')}
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <span class="rating-stars">${renderStars(f.rating || 0)}</span>
                                    <small class="text-muted ms-1">${f.rating || 0}</small>
                                </div>
                                <span class="fw-bold text-primary">$${f.hourly_rate || 0}/hr</span>
                            </div>
                            <button class="btn btn-outline-primary w-100 mt-3" onclick="viewFreelancer(${f.id})">
                                View Profile
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.log('Using sample freelancers');
    }
}

function filterPublicFreelancers() {
    const category = document.getElementById('freelancerFilterPublic')?.value || '';
    const container = document.getElementById('freelancersPublicList');
    if (!container) return;
    
    let filteredFreelancers = sampleFreelancers;
    if (category) {
        const categorySkillMap = {
            'full-stack': ['React', 'Node.js', 'Python', 'MongoDB'],
            'frontend': ['React', 'Vue.js', 'JavaScript', 'HTML', 'CSS'],
            'backend': ['Python', 'Java', 'Go', 'PostgreSQL', 'Redis'],
            'ai-ml': ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning'],
            'mobile': ['React Native', 'Flutter', 'Swift', 'Kotlin'],
            'design': ['Figma', 'Adobe XD', 'Photoshop', 'UI Design'],
            'marketing': ['SEO', 'Google Ads', 'Social Media']
        };
        const relevantSkills = categorySkillMap[category] || [];
        filteredFreelancers = sampleFreelancers.filter(f => 
            f.skills.some(s => relevantSkills.includes(s))
        );
    }
    
    container.innerHTML = filteredFreelancers.map(f => `
        <div class="col-md-6 col-lg-4">
            <div class="card freelancer-card h-100 border-0 shadow-sm">
                <div class="card-body">
                    <div class="d-flex align-items-center mb-3">
                        <div class="avatar me-3">${f.name.charAt(0)}</div>
                        <div>
                            <h5 class="card-title mb-0">${f.name}</h5>
                            <small class="text-muted">${f.title}</small>
                        </div>
                    </div>
                    <p class="small text-muted mb-2">${truncate(f.bio, 80)}</p>
                    <div class="mb-2">
                        ${f.skills.slice(0, 3).map(s => `<span class="skill-tag">${s}</span>`).join('')}
                        ${f.skills.length > 3 ? `<span class="skill-tag">+${f.skills.length - 3}</span>` : ''}
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <span class="rating-stars">${renderStars(f.rating)}</span>
                            <small class="text-muted ms-1">${f.rating}</small>
                        </div>
                        <span class="fw-bold text-primary">$${f.hourly_rate}/hr</span>
                    </div>
                    <button class="btn btn-outline-primary w-100 mt-3" onclick="viewSampleFreelancer(${f.id})">
                        View Profile
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function viewSampleFreelancer(id) {
    const freelancer = sampleFreelancers.find(f => f.id === id);
    if (!freelancer) return;
    
    document.getElementById('freelancerModalContent').innerHTML = `
        <div class="text-center mb-4">
            <div class="avatar mx-auto mb-3" style="width:80px;height:80px;font-size:2rem;">${freelancer.name.charAt(0)}</div>
            <h4>${freelancer.name}</h4>
            <p class="text-muted">${freelancer.title}</p>
            <div class="rating-stars mb-2">${renderStars(freelancer.rating)} <span class="text-muted">(${freelancer.rating})</span></div>
        </div>
        <div class="row text-center mb-4">
            <div class="col-4"><h5 class="mb-0">$${freelancer.hourly_rate}</h5><small class="text-muted">Hourly</small></div>
            <div class="col-4"><h5 class="mb-0">${freelancer.experience}</h5><small class="text-muted">Years Exp</small></div>
            <div class="col-4"><h5 class="mb-0">${freelancer.completed_projects}</h5><small class="text-muted">Projects</small></div>
        </div>
        <div class="mb-3"><h6>About</h6><p class="text-muted mb-0">${freelancer.bio}</p></div>
        <div class="mb-3"><h6>Skills</h6><div>${freelancer.skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}</div></div>
        <div class="mb-3"><h6>Education</h6><p class="mb-0">${freelancer.education}</p></div>
    `;
    
    new bootstrap.Modal(document.getElementById('freelancerModal')).show();
}

function createProjectCard(project, match = null) {
    const skills = Array.isArray(project.skills) ? project.skills : JSON.parse(project.skills || '[]');
    
    return `
        <div class="card project-card h-100 border-0 shadow-sm">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <span class="status-badge status-${project.status}">${project.status}</span>
                    ${match ? `<span class="match-badge match-${match.level.toLowerCase().replace(' ', '-')}">${match.score}% - ${match.level}</span>` : ''}
                </div>
                <h5 class="card-title">${project.title}</h5>
                <p class="text-muted small mb-2"><i class="fas fa-user me-1"></i>${project.client_name || 'Client'}</p>
                <p class="card-text small">${truncate(project.description, 100)}</p>
                <div class="mb-3">
                    ${skills.slice(0, 3).map(s => `<span class="skill-tag">${s}</span>`).join('')}
                    ${skills.length > 3 ? `<span class="skill-tag">+${skills.length - 3}</span>` : ''}
                </div>
                <div class="d-flex justify-content-between align-items-center">
                    <span class="budget">$${Number(project.budget).toLocaleString()}</span>
                    ${currentUser?.role === 'freelancer' ? 
                        `<button class="btn btn-primary btn-sm" onclick="openApplyModal(${project.id})">Apply</button>` :
                        `<button class="btn btn-outline-primary btn-sm" onclick="viewFreelancersForProject(${project.id})">View Freelancers</button>`
                    }
                </div>
            </div>
        </div>
    `;
}

// ============================================================
// FREELANCERS
// ============================================================

async function loadFreelancers() {
    const category = document.getElementById('freelancerCategoryFilter')?.value || '';
    
    try {
        const freelancers = await api.getAllFreelancers(category);
        const container = document.getElementById('freelancersList');
        
        if (freelancers.length === 0) {
            container.innerHTML = '<div class="col-12 text-center py-5"><p class="text-muted">No freelancers found</p></div>';
        } else {
            container.innerHTML = freelancers.map(f => `
                <div class="col-md-6 col-lg-4">
                    <div class="card freelancer-card h-100 border-0 shadow-sm">
                        <div class="card-body">
                            <div class="d-flex align-items-center mb-3">
                                <div class="avatar me-3">${f.name.charAt(0)}</div>
                                <div>
                                    <h5 class="card-title mb-0">${f.name}</h5>
                                    <small class="text-muted">${f.title || 'Freelancer'}</small>
                                </div>
                            </div>
                            <p class="small text-muted mb-2">${truncate(f.bio || 'No bio', 80)}</p>
                            <div class="mb-2">
                                ${(f.skills || []).slice(0, 3).map(s => `<span class="skill-tag">${s}</span>`).join('')}
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <span class="rating-stars">${renderStars(f.rating || 0)}</span>
                                    <small class="text-muted ms-1">${f.rating || 0}</small>
                                </div>
                                <span class="fw-bold text-primary">$${f.hourly_rate || 0}/hr</span>
                            </div>
                            <button class="btn btn-outline-primary w-100 mt-3" onclick="viewFreelancer(${f.id})">
                                View Profile
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Freelancers error:', error);
    }
}

async function viewFreelancer(id) {
    try {
        const f = await api.getFreelancerById(id);
        const skills = Array.isArray(f.skills) ? f.skills : JSON.parse(f.skills || '[]');
        
        document.getElementById('freelancerModalContent').innerHTML = `
            <div class="text-center mb-4">
                <div class="avatar mx-auto mb-3" style="width:80px;height:80px;font-size:2rem;">${f.name.charAt(0)}</div>
                <h4>${f.name}</h4>
                <p class="text-muted">${f.title || 'Freelancer'}</p>
                <div class="rating-stars mb-2">${renderStars(f.rating || 0)} <span class="text-muted">(${f.rating || 0})</span></div>
            </div>
            <div class="row text-center mb-4">
                <div class="col-4"><h5 class="mb-0">$${f.hourly_rate || 0}</h5><small class="text-muted">Hourly</small></div>
                <div class="col-4"><h5 class="mb-0">${f.experience || 0}</h5><small class="text-muted">Years Exp</small></div>
                <div class="col-4"><h5 class="mb-0">${f.completed_projects || 0}</h5><small class="text-muted">Projects</small></div>
            </div>
            <div class="mb-3"><h6>About</h6><p class="text-muted mb-0">${f.bio || 'No bio provided'}</p></div>
            <div class="mb-3"><h6>Skills</h6><div>${skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}</div></div>
            ${f.education ? `<div class="mb-3"><h6>Education</h6><p class="mb-0">${f.education}</p></div>` : ''}
        `;
        
        new bootstrap.Modal(document.getElementById('freelancerModal')).show();
    } catch (error) {
        showToast('Failed to load profile', 'error');
    }
}

// ============================================================
// APPLICATIONS
// ============================================================

async function openApplyModal(projectId) {
    if (!currentUser) {
        navigateTo('login');
        return;
    }
    
    try {
        const projects = await api.getProjects();
        const project = projects.find(p => p.id === projectId);
        
        if (!project) return;
        
        selectedProject = project;
        const skills = Array.isArray(project.skills) ? project.skills : JSON.parse(project.skills || '[]');
        
        document.getElementById('applyProjectId').value = projectId;
        document.getElementById('applyProjectInfo').innerHTML = `
            <h5>${project.title}</h5>
            <p class="text-muted mb-2">${project.description}</p>
            <div><strong>Budget:</strong> $${Number(project.budget).toLocaleString()}</div>
            <div><strong>Skills:</strong> ${skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}</div>
        `;
        
        // Get ML match
        try {
            const match = await api.predictMatch(currentUser.id, projectId);
            document.getElementById('matchScoreDisplay').classList.remove('d-none');
            document.getElementById('matchScoreContent').innerHTML = `
                <div class="d-flex align-items-center mb-2">
                    <span class="match-badge match-${match.level.toLowerCase().replace(' ', '-')}">${match.level}</span>
                    <span class="ms-2 fw-bold">${match.score}%</span>
                </div>
                <div class="match-progress">
                    <div class="match-progress-bar bg-${match.score >= 70 ? 'success' : match.score >= 45 ? 'warning' : 'danger'}" style="width:${match.score}%"></div>
                </div>
            `;
        } catch (e) {
            document.getElementById('matchScoreDisplay').classList.add('d-none');
        }
        
        document.getElementById('applyBudget').value = project.budget;
        document.getElementById('applyCoverLetter').value = '';
        
        new bootstrap.Modal(document.getElementById('applyModal')).show();
    } catch (error) {
        showToast('Error loading project', 'error');
    }
}

async function generateAIProposal() {
    if (!selectedProject) return;
    
    try {
        showLoading();
        const data = await api.generateProposal(selectedProject.id);
        document.getElementById('applyCoverLetter').value = data.proposal;
        showToast('Proposal generated', 'success');
    } catch (error) {
        showToast('Failed to generate proposal', 'error');
    } finally {
        hideLoading();
    }
}

async function generateProposal() {
    const projectId = document.getElementById('aiProposalProject').value;
    if (!projectId) {
        showToast('Please select a project', 'error');
        return;
    }
    
    try {
        showLoading();
        const data = await api.generateProposal(parseInt(projectId));
        document.getElementById('proposalContent').textContent = data.proposal;
        document.getElementById('generatedProposal').classList.remove('d-none');
        showToast('Proposal generated', 'success');
    } catch (error) {
        showToast('Failed to generate proposal', 'error');
    } finally {
        hideLoading();
    }
}

async function generateSummary() {
    try {
        showLoading();
        const data = await api.generateSummary();
        document.getElementById('summaryContent').textContent = data.summary;
        document.getElementById('generatedSummary').classList.remove('d-none');
        showToast('Summary generated', 'success');
    } catch (error) {
        showToast('Failed to generate summary', 'error');
    } finally {
        hideLoading();
    }
}

function copyProposal() {
    navigator.clipboard.writeText(document.getElementById('proposalContent').textContent);
    showToast('Copied to clipboard', 'success');
}

function copySummary() {
    navigator.clipboard.writeText(document.getElementById('summaryContent').textContent);
    showToast('Copied to clipboard', 'success');
}

async function submitApplication() {
    const projectId = parseInt(document.getElementById('applyProjectId').value);
    const budget = parseFloat(document.getElementById('applyBudget').value);
    const coverLetter = document.getElementById('applyCoverLetter').value;
    
    if (!coverLetter) {
        showToast('Please enter a cover letter', 'error');
        return;
    }
    
    try {
        showLoading();
        await api.applyToProject(projectId, budget, coverLetter);
        bootstrap.Modal.getInstance(document.getElementById('applyModal')).hide();
        showToast('Application Submitted Successfully', 'success');
        loadProjects();
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
}

async function loadMyApplications() {
    try {
        const applications = await api.getMyApplications();
        const container = document.getElementById('myApplications');
        
        if (applications.length === 0) {
            container.innerHTML = '<div class="text-center py-5"><p class="text-muted">No applications yet</p></div>';
        } else {
            container.innerHTML = applications.map(app => `
                <div class="card application-card mb-3 border-0 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h5>${app.project_title}</h5>
                                <p class="text-muted mb-1">Client: ${app.client_name || 'Unknown'}</p>
                            </div>
                            <span class="status-badge status-${app.status}">${app.status}</span>
                        </div>
                        <p class="small mb-2">${truncate(app.cover_letter, 150)}</p>
                        <div class="d-flex justify-content-between">
                            <span>Budget: $${Number(app.proposed_budget).toLocaleString()}</span>
                            <small class="text-muted">${formatDate(app.created_at)}</small>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Applications error:', error);
    }
}

async function loadClientApplications() {
    try {
        const applications = await api.getMyApplications();
        const container = document.getElementById('clientApplications');
        
        if (applications.length === 0) {
            container.innerHTML = '<div class="text-center py-5"><p class="text-muted">No applications received</p></div>';
        } else {
            container.innerHTML = applications.map(app => {
                const skills = Array.isArray(app.freelancer_skills) ? app.freelancer_skills : JSON.parse(app.freelancer_skills || '[]');
                
                return `
                    <div class="card mb-3 border-0 shadow-sm">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start">
                                <div>
                                    <h5>${app.project_title}</h5>
                                    <p class="mb-1"><strong>${app.freelancer_name}</strong> - ${app.freelancer_title || 'Freelancer'}</p>
                                    <small class="text-muted">${app.freelancer_experience || 0} years experience</small>
                                </div>
                                <span class="status-badge status-${app.status}">${app.status}</span>
                            </div>
                            <p class="small my-2">${truncate(app.cover_letter, 200)}</p>
                            <div class="mb-2">${skills.slice(0, 4).map(s => `<span class="skill-tag">${s}</span>`).join('')}</div>
                            ${app.status === 'pending' ? `
                                <div class="d-flex gap-2">
                                    <button class="btn btn-success btn-sm" onclick="updateAppStatus(${app.id}, 'shortlisted')"><i class="fas fa-star me-1"></i>Shortlist</button>
                                    <button class="btn btn-primary btn-sm" onclick="updateAppStatus(${app.id}, 'accepted')"><i class="fas fa-check me-1"></i>Accept</button>
                                    <button class="btn btn-danger btn-sm" onclick="updateAppStatus(${app.id}, 'rejected')"><i class="fas fa-times me-1"></i>Reject</button>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('Applications error:', error);
    }
}

async function updateAppStatus(id, status) {
    try {
        showLoading();
        await api.updateApplication(id, status);
        showToast('Application Updated Successfully', 'success');
        loadClientApplications();
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
}

// ============================================================
// PROFILE
// ============================================================

async function loadProfile() {
    try {
        const profile = await api.getFreelancerProfile();
        if (profile) {
            const skills = Array.isArray(profile.skills) ? profile.skills : JSON.parse(profile.skills || '[]');
            document.getElementById('profileTitle').value = profile.title || '';
            document.getElementById('profileBio').value = profile.bio || '';
            document.getElementById('profileExperience').value = profile.experience || 0;
            document.getElementById('profileHourlyRate').value = profile.hourly_rate || 0;
            document.getElementById('profileEducation').value = profile.education || '';
            document.getElementById('profileAvailability').value = profile.availability || 'full-time';
            document.getElementById('profileSkills').value = skills.join(', ');
        }
    } catch (error) {
        console.log('No existing profile');
    }
}

async function handleSaveProfile() {
    const profile = {
        title: document.getElementById('profileTitle').value,
        bio: document.getElementById('profileBio').value,
        experience: parseInt(document.getElementById('profileExperience').value) || 0,
        hourly_rate: parseFloat(document.getElementById('profileHourlyRate').value) || 0,
        education: document.getElementById('profileEducation').value,
        availability: document.getElementById('profileAvailability').value,
        skills: document.getElementById('profileSkills').value.split(',').map(s => s.trim()).filter(s => s),
    };
    
    try {
        showLoading();
        await api.saveFreelancerProfile(profile);
        showToast('Profile Saved Successfully', 'success');
    } catch (error) {
        showAlert('profileAlert', error.message, 'danger');
    } finally {
        hideLoading();
    }
}

// ============================================================
// CLIENT - PROJECTS
// ============================================================

async function handleCreateProject() {
    const project = {
        title: document.getElementById('projectTitle').value,
        description: document.getElementById('projectDescription').value,
        budget: parseFloat(document.getElementById('projectBudget').value),
        deadline: document.getElementById('projectDeadline').value,
        category: document.getElementById('projectCategory').value,
        experience_level: document.getElementById('projectExpLevel').value,
        skills: document.getElementById('projectSkills').value.split(',').map(s => s.trim()).filter(s => s),
    };
    
    try {
        showLoading();
        await api.createProject(project);
        showToast('Project Posted Successfully', 'success');
        document.getElementById('projectForm').reset();
        setTimeout(() => showSection('client-projects'), 500);
    } catch (error) {
        showAlert('projectAlert', error.message, 'danger');
    } finally {
        hideLoading();
    }
}

async function loadClientProjects() {
    try {
        const projects = await api.getMyProjects();
        const container = document.getElementById('clientProjectsList');
        
        if (projects.length === 0) {
            container.innerHTML = '<div class="text-center py-5"><p class="text-muted">No projects yet</p></div>';
        } else {
            container.innerHTML = projects.map(p => `
                <div class="card mb-3 border-0 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h5>${p.title}</h5>
                                <p class="text-muted mb-1">${p.applicant_count || 0} applicants</p>
                            </div>
                            <span class="status-badge status-${p.status}">${p.status}</span>
                        </div>
                        <p class="small mb-2">${truncate(p.description, 150)}</p>
                        <div class="d-flex justify-content-between">
                            <span class="budget">$${Number(p.budget).toLocaleString()}</span>
                            <button class="btn btn-danger btn-sm" onclick="deleteProject(${p.id})">Delete</button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Projects error:', error);
    }
}

async function deleteProject(id) {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
        showLoading();
        await api.deleteProject(id);
        showToast('Project Deleted Successfully', 'success');
        loadClientProjects();
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        hideLoading();
    }
}

// ============================================================
// AI TOOLS
// ============================================================

async function loadAIProjects() {
    try {
        const projects = await api.getProjects();
        const select = document.getElementById('aiProposalProject');
        select.innerHTML = '<option value="">Select a project</option>' +
            projects.map(p => `<option value="${p.id}">${p.title}</option>`).join('');
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

// ============================================================
// UTILITIES
// ============================================================

function truncate(text, max) {
    if (!text) return '';
    return text.length > max ? text.substring(0, max) + '...' : text;
}

function formatDate(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function renderStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += i <= Math.floor(rating) ? '<i class="fas fa-star"></i>' : 
                 (i - 0.5 <= rating ? '<i class="fas fa-star-half-alt"></i>' : '<i class="far fa-star"></i>');
    }
    return stars;
}

function showLoading() {
    document.getElementById('loadingOverlay').classList.remove('d-none');
}

function hideLoading() {
    document.getElementById('loadingOverlay').classList.add('d-none');
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('appToast');
    const toastMessage = document.getElementById('toastMessage');
    
    toast.className = `toast align-items-center border-0 ${type}`;
    toastMessage.textContent = message;
    
    new bootstrap.Toast(toast).show();
}

function showAlert(elementId, message, type = 'danger') {
    const alert = document.getElementById(elementId);
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    alert.classList.remove('d-none');
    
    setTimeout(() => alert.classList.add('d-none'), 5000);
}

function viewFreelancersForProject(projectId) {
    navigateTo('client-dashboard');
    showSection('client-freelancers');
}
