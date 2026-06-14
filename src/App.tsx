import { useState, useEffect } from 'react';

// ============================================================
// TYPES
// ============================================================
type UserRole = 'freelancer' | 'client';
type AppStatus = 'Pending' | 'Shortlisted' | 'Accepted' | 'Rejected';

interface Profile {
  title: string;
  skills: string[];
  experience: number;
  hourlyRate: number;
  bio: string;
  education: string;
  rating: number;
  completedProjects: number;
  availability: string;
  portfolio: { title: string; description: string; link: string }[];
  summary?: string;
  // Client-specific fields
  companyName?: string;
  companyDescription?: string;
  companyWebsite?: string;
  location?: string;
  budgetRange?: string;
  contactNumber?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  profileCompleted: boolean;
  profile?: Profile;
}

interface Project {
  id: string;
  clientId: string;
  clientName: string;
  title: string;
  description: string;
  skills: string[];
  category: string;
  budget: number;
  deadline: string;
  experienceLevel: string;
  postedAt: string;
  status: string;
  applicants: number;
}

interface Application {
  id: string;
  projectId: string;
  freelancerId: string;
  freelancerName: string;
  freelancerTitle: string;
  freelancerSkills: string[];
  freelancerExperience: number;
  freelancerRating: number;
  budget: number;
  proposal: string;
  status: AppStatus;
  appliedAt: string;
  matchScore?: number;
  matchLevel?: string;
}

// ============================================================
// STORAGE & UTILS
// ============================================================
const SK = { USERS: 'fm_users_v2', PROJECTS: 'fm_projects_v2', APPS: 'fm_apps_v2', CUR: 'fm_cur_v2', ML: 'fm_ml_v2', HIRED: 'fm_hired_v2' };
const getLS = (k: string, def: any = []) => { try { return JSON.parse(localStorage.getItem(k) || 'null') || def; } catch { return def; } };
const setLS = (k: string, v: any) => localStorage.setItem(k, JSON.stringify(v));

function getUsers(): User[] { return getLS(SK.USERS, []); }
function saveUsers(u: User[]) { setLS(SK.USERS, u); }
function getProjects(): Project[] { return getLS(SK.PROJECTS, []); }
function saveProjects(p: Project[]) { setLS(SK.PROJECTS, p); }
function getApps(): Application[] { return getLS(SK.APPS, []); }
function saveApps(a: Application[]) { setLS(SK.APPS, a); }
function getHired(): HiredFreelancer[] { return getLS(SK.HIRED, []); }
function saveHired(h: HiredFreelancer[]) { setLS(SK.HIRED, h); }

interface HiredFreelancer {
  id: string;
  freelancerId: string;
  freelancerName: string;
  freelancerTitle: string;
  clientId: string;
  clientName: string;
  projectId: string;
  projectName: string;
  matchScore: number;
  matchLevel: string;
  hiredDate: string;
  status: 'Hired' | 'Active' | 'Completed';
}

// Fixed password hashing - DETERMINISTIC (no Date.now so verification works)
function hashPw(p: string): string {
  const salt = 'freelancerai_fixed_salt_v2';
  const salted = salt + p + salt;
  let hash = 0;
  // 100 rounds of hashing
  for (let round = 0; round < 100; round++) {
    for (let i = 0; i < salted.length; i++) {
      hash = ((hash << 5) - hash) + salted.charCodeAt(i);
      hash = hash | 0; // force 32-bit int
    }
  }
  // Deterministic hash - same input always produces same output
  return 'hash$' + Math.abs(hash).toString(36) + '$' + p.length;
}

function verifyPw(password: string, storedHash: string): boolean {
  return hashPw(password) === storedHash;
}

// Profile completion is now tracked via profileCompleted flag in User object

// ============================================================
// ML MATCHING (Random Forest Simulation)
// ============================================================
function calculateMLMatch(freelancerSkills: string[], projectSkills: string[], freelancerExperience: number, freelancerRating: number, projectCategory: string): { score: number; level: 'Strong Match' | 'Moderate Match' | 'Low Match' } {
  // Calculate skills match percentage
  const skillsMatch = projectSkills.length > 0 
    ? (freelancerSkills.filter(skill => 
        projectSkills.some(projSkill => projSkill.toLowerCase() === skill.toLowerCase())
      ).length / projectSkills.length) * 100
    : 0;

  // Experience relevance (0-100)
  const expScore = Math.min(100, (freelancerExperience / 10) * 100);

  // Rating score (0-100)
  const ratingScore = (freelancerRating / 5) * 100;

  // Category relevance
  const categoryMap: Record<string, string[]> = {
    'Full Stack': ['React', 'Node', 'MongoDB', 'Express', 'TypeScript', 'JavaScript'],
    'Frontend': ['React', 'Vue', 'Angular', 'HTML', 'CSS', 'JavaScript', 'TypeScript'],
    'Backend': ['Node', 'Python', 'Java', 'PostgreSQL', 'MongoDB', 'AWS', 'Docker'],
    'Mobile': ['React Native', 'Flutter', 'Swift', 'Kotlin', 'iOS', 'Android'],
    'AI/ML': ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Data Science'],
    'UI/UX': ['Figma', 'UI Design', 'UX Research', 'Prototyping', 'Adobe XD'],
  };
  const relevantSkills = categoryMap[projectCategory] || [];
  const categoryMatch = relevantSkills.length > 0
    ? (freelancerSkills.filter(skill =>
        relevantSkills.some(relSkill => skill.toLowerCase().includes(relSkill.toLowerCase()))
      ).length / relevantSkills.length) * 100
    : 50;

  // Random Forest weighted scoring (simulating ensemble of decision trees)
  const weights = {
    skills: 0.40,
    experience: 0.20,
    rating: 0.20,
    category: 0.20
  };

  const totalScore = (skillsMatch * weights.skills) + 
                     (expScore * weights.experience) + 
                     (ratingScore * weights.rating) + 
                     (categoryMatch * weights.category);

  const finalScore = Math.round(Math.min(100, Math.max(0, totalScore)));

  // Determine match level based on score thresholds
  let level: 'Strong Match' | 'Moderate Match' | 'Low Match';
  if (finalScore >= 70) {
    level = 'Strong Match';
  } else if (finalScore >= 45) {
    level = 'Moderate Match';
  } else {
    level = 'Low Match';
  }

  return { score: finalScore, level };
}

// ============================================================
// DEMO DATA
// ============================================================
const DEMO_FREELANCERS: User[] = [
  { id: 'd1', name: 'Rahul Sharma', email: 'rahul@demo.com', password: hashPw('demo123'), role: 'freelancer', profileCompleted: true,
    profile: { title: 'Senior Full-Stack Developer', skills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'Express'], experience: 6, hourlyRate: 85, rating: 4.9, completedProjects: 48, bio: 'Experienced full-stack developer specializing in modern web technologies.', education: 'B.Tech, IIT Delhi', availability: 'full-time', portfolio: [{ title: 'E-commerce Platform', description: 'Built full-stack e-commerce solution', link: '#' }] } },
  { id: 'd2', name: 'Priya Reddy', email: 'priya@demo.com', password: hashPw('demo123'), role: 'freelancer', profileCompleted: true,
    profile: { title: 'Frontend Developer', skills: ['React', 'Vue.js', 'JavaScript', 'HTML', 'CSS', 'Tailwind'], experience: 4, hourlyRate: 65, rating: 4.7, completedProjects: 35, bio: 'Passionate frontend developer creating beautiful user interfaces.', education: 'B.Sc IT, Hyderabad University', availability: 'full-time', portfolio: [] } },
  { id: 'd3', name: 'Arjun Kumar', email: 'arjun@demo.com', password: hashPw('demo123'), role: 'freelancer', profileCompleted: true,
    profile: { title: 'AI/ML Engineer', skills: ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Data Science'], experience: 5, hourlyRate: 120, rating: 4.8, completedProjects: 22, bio: 'AI/ML specialist with focus on NLP and computer vision.', education: 'M.Tech AI, IIT Bombay', availability: 'full-time', portfolio: [] } },
  { id: 'd4', name: 'Sneha Patel', email: 'sneha@demo.com', password: hashPw('demo123'), role: 'freelancer', profileCompleted: true,
    profile: { title: 'UI/UX Designer', skills: ['Figma', 'Adobe XD', 'UI Design', 'UX Research', 'Prototyping'], experience: 5, hourlyRate: 75, rating: 4.9, completedProjects: 40, bio: 'Creative designer focused on user-centered design principles.', education: 'B.Des, NID Ahmedabad', availability: 'full-time', portfolio: [] } },
  { id: 'd5', name: 'Vikram Singh', email: 'vikram@demo.com', password: hashPw('demo123'), role: 'freelancer', profileCompleted: true,
    profile: { title: 'Backend Developer', skills: ['Node.js', 'Python', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes'], experience: 7, hourlyRate: 90, rating: 4.8, completedProjects: 55, bio: 'Backend architect specializing in scalable microservices.', education: 'B.Tech, BITS Pilani', availability: 'full-time', portfolio: [] } },
  { id: 'd6', name: 'Neha Verma', email: 'neha@demo.com', password: hashPw('demo123'), role: 'freelancer', profileCompleted: true,
    profile: { title: 'Mobile Developer', skills: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Firebase'], experience: 4, hourlyRate: 80, rating: 4.6, completedProjects: 28, bio: 'Mobile app developer creating cross-platform applications.', education: 'B.Tech, VIT Vellore', availability: 'full-time', portfolio: [] } },
];

// Demo client ID
const DEMO_CLIENT_ID = 'dc1';
const DEMO_CLIENT_NAME = 'TechCorp Solutions';

// Preloaded Demo Projects as specified
const DEMO_PROJECTS: Project[] = [
  { id: 'p1', clientId: DEMO_CLIENT_ID, clientName: DEMO_CLIENT_NAME, title: 'AI Freelancer Marketplace', description: 'Build a complete AI-powered freelancer marketplace with React frontend, Flask backend, MySQL database, and Machine Learning for freelancer-job matching.', skills: ['React', 'Flask', 'MySQL', 'Machine Learning'], category: 'Full Stack', budget: 5000, deadline: '2026-04-30', experienceLevel: 'expert', postedAt: '2026-01-15', status: 'open', applicants: 3 },
  { id: 'p2', clientId: DEMO_CLIENT_ID, clientName: DEMO_CLIENT_NAME, title: 'React Frontend Dashboard', description: 'Create a modern admin dashboard with React, TypeScript, and Tailwind CSS. Must include charts, data tables, and responsive design.', skills: ['React', 'TypeScript', 'Tailwind'], category: 'Frontend', budget: 2000, deadline: '2026-03-15', experienceLevel: 'intermediate', postedAt: '2026-01-18', status: 'open', applicants: 2 },
  { id: 'p3', clientId: DEMO_CLIENT_ID, clientName: DEMO_CLIENT_NAME, title: 'Machine Learning Recommendation System', description: 'Develop a recommendation system using Python, Scikit-learn, and Flask API. Must predict freelancer-job matches with high accuracy.', skills: ['Python', 'Scikit-learn', 'Flask'], category: 'AI/ML', budget: 3500, deadline: '2026-05-15', experienceLevel: 'expert', postedAt: '2026-01-20', status: 'open', applicants: 4 },
];

// Preloaded Applicants with ML Match Scores
const DEMO_APPLICATIONS: Application[] = [
  // Project 1: AI Freelancer Marketplace applicants
  { id: 'a1', projectId: 'p1', freelancerId: 'd1', freelancerName: 'Rahul Sharma', freelancerTitle: 'Senior Full-Stack Developer', freelancerSkills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'Express'], freelancerExperience: 6, freelancerRating: 4.9, budget: 4800, proposal: 'I have 6 years of full-stack experience. I can build this AI marketplace with React frontend, Flask backend, and integrate ML models for smart matching.', status: 'Pending', appliedAt: '2026-01-16T10:00:00Z', matchScore: 92, matchLevel: 'Strong Match' },
  { id: 'a2', projectId: 'p1', freelancerId: 'd2', freelancerName: 'Priya Reddy', freelancerTitle: 'Frontend Developer', freelancerSkills: ['React', 'Vue.js', 'JavaScript', 'HTML', 'CSS', 'Tailwind'], freelancerExperience: 4, freelancerRating: 4.7, budget: 4500, proposal: 'I specialize in React development and can create an excellent user interface for the marketplace. I have experience with dashboard applications.', status: 'Shortlisted', appliedAt: '2026-01-17T14:30:00Z', matchScore: 88, matchLevel: 'Strong Match' },
  { id: 'a3', projectId: 'p1', freelancerId: 'd5', freelancerName: 'Vikram Singh', freelancerTitle: 'Backend Developer', freelancerSkills: ['Node.js', 'Python', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes'], freelancerExperience: 7, freelancerRating: 4.8, budget: 4200, proposal: 'I can handle the backend architecture with Flask and MySQL. I have experience building scalable APIs and integrating ML models.', status: 'Pending', appliedAt: '2026-01-18T09:15:00Z', matchScore: 74, matchLevel: 'Moderate Match' },
  // Project 2: React Frontend Dashboard applicants
  { id: 'a4', projectId: 'p2', freelancerId: 'd2', freelancerName: 'Priya Reddy', freelancerTitle: 'Frontend Developer', freelancerSkills: ['React', 'Vue.js', 'JavaScript', 'HTML', 'CSS', 'Tailwind'], freelancerExperience: 4, freelancerRating: 4.7, budget: 1900, proposal: 'Perfect match! I have built 10+ React dashboards with TypeScript and Tailwind. I can deliver a modern, responsive admin panel.', status: 'Accepted', appliedAt: '2026-01-19T11:00:00Z', matchScore: 95, matchLevel: 'Strong Match' },
  { id: 'a5', projectId: 'p2', freelancerId: 'd4', freelancerName: 'Sneha Patel', freelancerTitle: 'UI/UX Designer', freelancerSkills: ['Figma', 'Adobe XD', 'UI Design', 'UX Research', 'Prototyping'], freelancerExperience: 5, freelancerRating: 4.9, budget: 1500, proposal: 'I can design the dashboard UI/UX with Figma and provide design system. While I focus on design, I have basic React knowledge.', status: 'Pending', appliedAt: '2026-01-20T16:20:00Z', matchScore: 65, matchLevel: 'Moderate Match' },
  // Project 3: ML Recommendation System applicants
  { id: 'a6', projectId: 'p3', freelancerId: 'd3', freelancerName: 'Arjun Kumar', freelancerTitle: 'AI/ML Engineer', freelancerSkills: ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Data Science'], freelancerExperience: 5, freelancerRating: 4.8, budget: 3400, proposal: 'Perfect fit! I have built 5+ recommendation systems using Python and Scikit-learn. I can deliver 90%+ accuracy with collaborative filtering.', status: 'Accepted', appliedAt: '2026-01-21T10:00:00Z', matchScore: 94, matchLevel: 'Strong Match' },
  { id: 'a7', projectId: 'p3', freelancerId: 'd5', freelancerName: 'Vikram Singh', freelancerTitle: 'Backend Developer', freelancerSkills: ['Node.js', 'Python', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes'], freelancerExperience: 7, freelancerRating: 4.8, budget: 3200, proposal: 'I can build the Flask API and handle deployment. I have Python experience but ML is not my primary expertise.', status: 'Shortlisted', appliedAt: '2026-01-22T13:45:00Z', matchScore: 68, matchLevel: 'Moderate Match' },
  { id: 'a8', projectId: 'p3', freelancerId: 'd6', freelancerName: 'Neha Verma', freelancerTitle: 'Mobile Developer', freelancerSkills: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Firebase'], freelancerExperience: 4, freelancerRating: 4.6, budget: 2800, proposal: 'I can help with mobile integration if needed, but my expertise is in mobile apps rather than ML systems.', status: 'Rejected', appliedAt: '2026-01-23T15:30:00Z', matchScore: 35, matchLevel: 'Low Match' },
  { id: 'a9', projectId: 'p3', freelancerId: 'd1', freelancerName: 'Rahul Sharma', freelancerTitle: 'Senior Full-Stack Developer', freelancerSkills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'Express'], freelancerExperience: 6, freelancerRating: 4.9, budget: 3000, proposal: 'I can build the full-stack application and integrate ML models. I have experience with Python and data processing.', status: 'Pending', appliedAt: '2026-01-24T11:20:00Z', matchScore: 72, matchLevel: 'Moderate Match' },
];

// Demo Hired Freelancers
const DEMO_HIRED: HiredFreelancer[] = [
  { id: 'h1', freelancerId: 'd2', freelancerName: 'Priya Reddy', freelancerTitle: 'Frontend Developer', clientId: DEMO_CLIENT_ID, clientName: DEMO_CLIENT_NAME, projectId: 'p2', projectName: 'React Frontend Dashboard', matchScore: 95, matchLevel: 'Strong Match', hiredDate: '2026-01-20', status: 'Active' },
  { id: 'h2', freelancerId: 'd3', freelancerName: 'Arjun Kumar', freelancerTitle: 'AI/ML Engineer', clientId: DEMO_CLIENT_ID, clientName: DEMO_CLIENT_NAME, projectId: 'p3', projectName: 'ML Recommendation System', matchScore: 94, matchLevel: 'Strong Match', hiredDate: '2026-01-22', status: 'Hired' },
];

function ensureDemoData() {
  const users = getUsers();
  
  // Add demo freelancers if no users exist
  if (users.length === 0) {
    saveUsers(DEMO_FREELANCERS);
  }
  
  // CRITICAL FIX: Add demo client if it doesn't exist
  const demoClient = users.find(u => u.email === 'client@demo.com');
  if (!demoClient) {
    const clientUser: User = {
      id: DEMO_CLIENT_ID,
      name: DEMO_CLIENT_NAME,
      email: 'client@demo.com',
      password: hashPw('demo123'),
      role: 'client',
      profileCompleted: true,
      profile: {
        companyName: DEMO_CLIENT_NAME,
        companyDescription: 'Leading technology solutions provider',
        companyWebsite: 'https://techcorp.example.com',
        location: 'Bangalore, India',
        budgetRange: '$10,000 - $25,000',
        contactNumber: '+91 9876543210',
        title: '', skills: [], experience: 0, hourlyRate: 0,
        rating: 0, completedProjects: 0, bio: '', education: '',
        availability: 'full-time', portfolio: []
      }
    };
    saveUsers([...users, clientUser]);
  }
  
  if (getProjects().length === 0) saveProjects(DEMO_PROJECTS);
  if (getApps().length === 0) saveApps(DEMO_APPLICATIONS);
  if (getHired().length === 0) saveHired(DEMO_HIRED);
}

// ============================================================
// ML & AI
// ============================================================
function generateProposal(skills: string[], exp: number, summary: string, projectTitle: string, projectSkills: string[]): string {
  return `I am excited to apply for "${projectTitle}". With ${exp} years of experience in ${skills.slice(0, 4).join(', ')}, I am confident I can deliver exceptional results.\n\n${summary || 'I have a strong track record of delivering high-quality projects.'}\n\nI understand you need expertise in ${projectSkills.slice(0, 3).join(', ')}. My background aligns perfectly, and I can deliver within your timeline and budget.`;
}

function generateSummary(title: string, skills: string[], exp: number, completed: number, education: string): string {
  return `Experienced ${title} with ${exp}+ years of expertise in ${skills.slice(0, 4).join(', ')}. ${education ? education + '.' : ''} Successfully completed ${completed} projects with strong client satisfaction ratings. Strong problem-solving abilities and commitment to delivering high-quality solutions on time.`;
}

// ============================================================
// ICONS
// ============================================================
const Ic = {
  Lightning: (c = "w-5 h-5") => <svg className={c} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  Search: (c = "w-5 h-5") => <svg className={c} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  Clock: (c = "w-4 h-4") => <svg className={c} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Plus: (c = "w-5 h-5") => <svg className={c} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>,
  Robot: (c = "w-5 h-5") => <svg className={c} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
  Star: (f = true, c = "w-4 h-4") => <svg className={c} fill={f ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
  Folder: (c = "w-5 h-5") => <svg className={c} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>,
  Check: (c = "w-5 h-5") => <svg className={c} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>,
  Alert: (c = "w-5 h-5") => <svg className={c} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
};

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState('login');
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  // CRITICAL FIX: Auto-login on app load with proper role handling
  useEffect(() => {
    ensureDemoData();
    const savedUser = localStorage.getItem(SK.CUR);
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        // Verify user still exists in database and has role
        const users = getUsers();
        const existingUser = users.find(x => x.id === u.id);
        if (existingUser && existingUser.role) {
          setUser(existingUser);
          setPage('dashboard');
        } else {
          localStorage.removeItem(SK.CUR);
        }
      } catch {
        localStorage.removeItem(SK.CUR);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); }
  }, [toast]);

  const showToast = (msg: string, type = 'success') => setToast({ msg, type });

  // CRITICAL FIX: Update user in state AND localStorage AND database
  const updateUser = (updated: User) => {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === updated.id);
    if (idx >= 0) {
      users[idx] = updated;
      saveUsers(users);
    }
    setUser(updated);
    localStorage.setItem(SK.CUR, JSON.stringify(updated));
  };

  // CRITICAL FIX: Proper login with verification
  const handleLogin = (email: string, password: string): { success: boolean; error?: string } => {
    const users = getUsers();
    const u = users.find(x => x.email.toLowerCase() === email.toLowerCase());
    if (!u) return { success: false, error: 'Invalid credentials' };
    
    // Verify password
    if (!verifyPw(password, u.password)) {
      return { success: false, error: 'Invalid credentials' };
    }
    
    // CRITICAL FIX: Ensure role is always present
    const userWithRole: User = {
      ...u,
      role: u.role || 'freelancer'
    };
    
    // Save to localStorage for persistence
    setUser(userWithRole);
    localStorage.setItem(SK.CUR, JSON.stringify(userWithRole));
    showToast('Login Successful');
    
    // Route to correct dashboard based on role
    setPage('dashboard');
    return { success: true };
  };

  // CRITICAL FIX: Registration with permanent storage
  const handleRegister = (name: string, email: string, password: string, role: UserRole): { success: boolean; error?: string } => {
    const users = getUsers();
    if (users.find(x => x.email.toLowerCase() === email.toLowerCase())) {
      showToast('Account already exists. Please login.', 'error');
      setTimeout(() => setPage('login'), 1500);
      return { success: false, error: 'Account already exists. Please login.' };
    }
    
    // CRITICAL FIX: Ensure role is explicitly set
    const newUser: User = {
      id: 'u' + Date.now(),
      name,
      email,
      password: hashPw(password),
      role: role || 'freelancer', // Explicit role assignment
      profileCompleted: false,
      profile: role === 'freelancer' ? {
        title: '', skills: [], experience: 0, hourlyRate: 0,
        rating: 0, completedProjects: 0, bio: '', education: '',
        availability: 'full-time', portfolio: []
      } : {
        companyName: '', companyDescription: '', companyWebsite: '',
        location: '', budgetRange: '', contactNumber: '',
        title: '', skills: [], experience: 0, hourlyRate: 0,
        rating: 0, completedProjects: 0, bio: '', education: '',
        availability: 'full-time', portfolio: []
      }
    };
    
    // Permanently save to database (localStorage)
    saveUsers([...users, newUser]);
    showToast('Registration Successful');
    setPage('login');
    return { success: true };
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(SK.CUR);
    setPage('login');
    showToast('Logged out');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl shadow-lg shadow-purple-200 mx-auto mb-4 flex items-center justify-center">
            {Ic.Lightning("w-8 h-8 text-white")}
          </div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return (<><AuthPage onLogin={handleLogin} onRegister={handleRegister} page={page} setPage={setPage} />{toast && <Toast msg={toast.msg} type={toast.type} />}</>);

  // CRITICAL FIX: Ensure role is always present for routing
  const userRole = user.role || 'freelancer';

  return (
    <div className="min-h-screen bg-slate-50">
      <Header user={user} page={page} setPage={setPage} onLogout={handleLogout} />
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      <main className="max-w-[1400px] mx-auto px-6 py-8">
        {userRole === 'freelancer' && (
          <>
            {page === 'dashboard' && <FreelancerDashboard user={user} setPage={setPage} />}
            {page === 'profile' && <ProfilePage user={user} onSave={updateUser} showToast={showToast} setPage={setPage} />}
            {page === 'projects' && <ProjectsPage user={user} showToast={showToast} />}
            {page === 'applications' && <MyApplicationsPage user={user} />}
            {page === 'hired-projects' && <MyHiredProjectsPage user={user} />}
            {page === 'ai-tools' && <AIToolsPage user={user} onUpdate={updateUser} showToast={showToast} setPage={setPage} />}
          </>
        )}
        {userRole === 'client' && (
          <>
            {page === 'dashboard' && <ClientDashboard user={user} setPage={setPage} />}
            {page === 'profile' && <ClientProfilePage user={user} onSave={updateUser} showToast={showToast} />}
            {page === 'browse-freelancers' && <BrowseFreelancersPage />}
            {page === 'post-project' && <PostProjectPage user={user} showToast={showToast} setPage={setPage} />}
            {page === 'my-projects' && <MyProjectsPage user={user} setPage={setPage} setSelectedProject={setSelectedProject} />}
            {page === 'ml-matches' && selectedProject && <MLMatchesPage project={selectedProject} onBack={() => setPage('my-projects')} setPage={setPage} />}
            {page === 'applicants' && <ApplicantsPage user={user} showToast={showToast} />}
            {page === 'hired-freelancers' && <HiredFreelancersPage user={user} />}
          </>
        )}
      </main>
    </div>
  );
}

// ============================================================
// SHARED UI
// ============================================================
function Toast({ msg, type }: { msg: string; type: string }) {
  return (<div className={`fixed top-4 right-4 z-[100] ${type === 'error' ? 'bg-red-500' : 'bg-emerald-500'} text-white px-6 py-3 rounded-lg shadow-lg`}>{msg}</div>);
}

function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const s: Record<string, string> = { sm: "w-8 h-8 text-sm", md: "w-10 h-10 text-base", lg: "w-12 h-12 text-lg" };
  return (<div className={`${s[size]} rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold flex-shrink-0`}>{name.charAt(0).toUpperCase()}</div>);
}

function SkillTag({ skill }: { skill: string }) { return (<span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full border border-slate-200">{skill}</span>); }
function Stars({ rating }: { rating: number }) { return (<div className="flex items-center gap-1"><div className="flex text-amber-400">{[1,2,3,4,5].map(i => Ic.Star(i <= Math.floor(rating), "w-3.5 h-3.5"))}</div><span className="text-sm font-medium text-slate-700">{rating.toFixed(1)}</span></div>); }
function StatusBadge({ status }: { status: string }) {
  const s: Record<string, string> = { open: 'bg-emerald-100 text-emerald-700', Pending: 'bg-amber-100 text-amber-700', Accepted: 'bg-emerald-100 text-emerald-700', Rejected: 'bg-red-100 text-red-700', Shortlisted: 'bg-indigo-100 text-indigo-700' };
  return (<span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${s[status] || s.open}`}>{status}</span>);
}
function StatCard({ label, value, color = 'text-slate-900' }: any) { return (<div className="bg-white rounded-xl border border-slate-200 p-4"><div className="text-sm text-slate-500">{label}</div><div className={`text-2xl font-bold ${color} mt-1`}>{value}</div></div>); }

// ============================================================
// HEADER
// ============================================================
function Header({ user, page, setPage, onLogout }: any) {
  const userRole = user.role || 'freelancer';
  const menuItems = userRole === 'freelancer' ? [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'profile', label: 'Profile' },
    { id: 'projects', label: 'Browse Projects' },
    { id: 'applications', label: 'My Applications' },
    { id: 'hired-projects', label: 'My Hired Projects' },
    { id: 'ai-tools', label: 'AI Tools', badge: 'AI' },
  ] : [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'profile', label: 'Profile' },
    { id: 'browse-freelancers', label: 'Browse Freelancers' },
    { id: 'post-project', label: 'Post Project' },
    { id: 'my-projects', label: 'My Projects' },
    { id: 'applicants', label: 'Applicants' },
    { id: 'hired-freelancers', label: 'Hired Freelancers' },
  ];
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <button onClick={() => setPage('dashboard')} className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-md shadow-purple-200">{Ic.Lightning("w-5 h-5 text-white")}</div>
              <span className="text-xl font-bold text-slate-900">FreelanceAI</span>
            </button>
            <nav className="hidden lg:flex items-center gap-1">
              {menuItems.map((item: any) => (
                <button key={item.id} onClick={() => setPage(item.id)} className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${page === item.id ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>
                  {item.label}{item.badge && <span className="ml-1.5 px-1.5 py-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-bold rounded-full">{item.badge}</span>}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500">{user.email} • {user.role}</p>
            </div>
            <Avatar name={user.name} size="md" />
            <button onClick={onLogout} className="px-4 py-2 text-sm font-medium text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-50">Logout</button>
          </div>
        </div>
      </div>
    </header>
  );
}

// ============================================================
// AUTH PAGE
// ============================================================
function AuthPage({ onLogin, onRegister, page, setPage }: any) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl shadow-lg shadow-purple-200 mb-4">{Ic.Lightning("w-8 h-8 text-white")}</div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome to FreelanceAI</h1>
          <p className="text-slate-600 mt-2">AI-powered freelancer marketplace</p>
        </div>
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          {page === 'register' ? <RegisterForm onSubmit={onRegister} onSwitch={() => setPage('login')} /> : <LoginForm onSubmit={onLogin} onSwitch={() => setPage('register')} />}
        </div>
      </div>
    </div>
  );
}

function LoginForm({ onSubmit, onSwitch }: any) {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState('');
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); const res = onSubmit(email, password); if (!res.success) setError(res.error || ''); };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
      <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500" placeholder="you@example.com" required /></div>
      <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500" placeholder="••••••••" required /></div>
      <button type="submit" className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-200">Sign In</button>
      <p className="text-center text-sm text-slate-600">Don't have an account? <button type="button" onClick={onSwitch} className="text-purple-600 font-medium hover:underline">Sign up</button></p>
      <div className="pt-4 border-t border-slate-200">
        <p className="text-xs text-center text-slate-500 mb-3">Demo Accounts (password: demo123)</p>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => { setEmail('rahul@demo.com'); setPassword('demo123'); }} className="py-2 border border-purple-200 text-purple-700 rounded-lg text-sm hover:bg-purple-50 font-medium">Demo Freelancer</button>
          <button type="button" onClick={() => { setEmail('client@demo.com'); setPassword('demo123'); }} className="py-2 border border-purple-200 text-purple-700 rounded-lg text-sm hover:bg-purple-50 font-medium">Demo Client</button>
        </div>
      </div>
    </form>
  );
}

function RegisterForm({ onSubmit, onSwitch }: any) {
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [role, setRole] = useState<UserRole>('freelancer'); const [error, setError] = useState('');
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); const res = onSubmit(name, email, password, role); if (!res.success) setError(res.error || ''); };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
        <button type="button" onClick={() => setRole('freelancer')} className={`flex-1 py-2 rounded-md text-sm font-medium ${role === 'freelancer' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600'}`}>Freelancer</button>
        <button type="button" onClick={() => setRole('client')} className={`flex-1 py-2 rounded-md text-sm font-medium ${role === 'client' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600'}`}>Client</button>
      </div>
      <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500" required /></div>
      <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500" required /></div>
      <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500" required minLength={6} /></div>
      <button type="submit" className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-200">Create Account</button>
      <p className="text-center text-sm text-slate-600">Already have an account? <button type="button" onClick={onSwitch} className="text-purple-600 font-medium hover:underline">Sign in</button></p>
    </form>
  );
}

// ============================================================
// PROFILE PAGE (FREELANCER) - CRITICAL FIX
// ============================================================
function ProfilePage({ user, onSave, showToast, setPage }: any) {
  const [form, setForm] = useState<Profile>(user.profile || { title: '', skills: [], experience: 0, hourlyRate: 0, bio: '', education: '', rating: 0, completedProjects: 0, availability: 'full-time', portfolio: [] });
  const [skillSearch, setSkillSearch] = useState('');
  const [validationError, setValidationError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const ALL_SKILLS = ['React', 'Vue.js', 'Angular', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'Java', 'MongoDB', 'PostgreSQL', 'MySQL', 'AWS', 'Docker', 'Kubernetes', 'Firebase', 'React Native', 'Flutter', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Figma', 'Adobe XD', 'HTML', 'CSS', 'Tailwind', 'Django', 'Flask', 'Express', 'REST API', 'GraphQL', 'Redis', 'CI/CD'];
  const filtered = ALL_SKILLS.filter(s => s.toLowerCase().includes(skillSearch.toLowerCase()) && !form.skills.includes(s));

  const handleSave = () => {
    // Validate all required fields
    if (!form.title || form.title.trim().length === 0) { setValidationError('Please enter your professional title'); return; }
    if (!form.skills || form.skills.length === 0) { setValidationError('Please add at least one skill'); return; }
    if (!form.experience || form.experience <= 0) { setValidationError('Please enter your years of experience'); return; }
    if (!form.bio || form.bio.trim().length === 0) { setValidationError('Please write a bio'); return; }
    if (!form.hourlyRate || form.hourlyRate <= 0) { setValidationError('Please enter your hourly rate'); return; }
    if (!form.education || form.education.trim().length === 0) { setValidationError('Please enter your education'); return; }
    if (!form.availability || form.availability.trim().length === 0) { setValidationError('Please select availability'); return; }

    setValidationError('');
    
    // CRITICAL FIX: Mark profile as completed
    const updatedUser = {
      ...user,
      profile: form,
      profileCompleted: true  // This immediately unlocks all features
    };
    
    // Save to database (localStorage) and update state
    onSave(updatedUser);
    setSaveSuccess(true);
    showToast('Profile Saved Successfully - All features unlocked!');
    
    // Auto-redirect to AI Tools after 1.5 seconds
    setTimeout(() => {
      setPage('ai-tools');
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
      {validationError && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">{validationError}</div>}
      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          <span><strong>Profile Complete!</strong> All AI features are now unlocked. Redirecting to AI Tools...</span>
        </div>
      )}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Professional Title *</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500" placeholder="e.g., Full-Stack Developer" /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Availability *</label><select value={form.availability} onChange={e => setForm({ ...form, availability: e.target.value })} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white"><option>full-time</option><option>part-time</option><option>contract</option></select></div>
        </div>
        <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Bio *</label><textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} rows={3} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500" placeholder="Tell us about yourself..." /></div>
        <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Education *</label><input value={form.education} onChange={e => setForm({ ...form, education: e.target.value })} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500" placeholder="e.g., B.Tech Computer Science" /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Experience (years) *</label><input type="number" value={form.experience || ''} onChange={e => setForm({ ...form, experience: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500" /></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Hourly Rate ($) *</label><input type="number" value={form.hourlyRate || ''} onChange={e => setForm({ ...form, hourlyRate: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500" /></div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Skills * <span className="text-slate-400 font-normal">(Add at least 1)</span></label>
          <input placeholder="Search skills..." value={skillSearch} onChange={e => setSkillSearch(e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 mb-2" />
          {skillSearch && filtered.length > 0 && (<div className="max-h-32 overflow-y-auto border border-slate-200 rounded-lg mb-2">{filtered.slice(0, 6).map(s => <button key={s} type="button" onClick={() => { setForm({ ...form, skills: [...form.skills, s] }); setSkillSearch(''); }} className="w-full text-left px-4 py-2 hover:bg-slate-100 text-sm">{s}</button>)}</div>)}
          <div className="flex flex-wrap gap-2">{form.skills.map(s => <span key={s} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-1">{s}<button onClick={() => setForm({ ...form, skills: form.skills.filter(x => x !== s) })} className="hover:text-purple-900">×</button></span>)}</div>
        </div>
        <button onClick={handleSave} className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700">Save Profile</button>
      </div>
    </div>
  );
}

// ============================================================
// BROWSE FREELANCERS PAGE (CLIENT)
// ============================================================
function BrowseFreelancersPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  
  const categories = ['All Categories', 'Frontend', 'Backend', 'Full Stack', 'AI/ML', 'Marketing', 'Finance', 'Mobile Development', 'UI/UX'];
  
  // Get all freelancers (demo + registered)
  const allFreelancers = [...DEMO_FREELANCERS, ...getUsers().filter(u => u.role === 'freelancer' && u.profileCompleted)];
  
  // Filter freelancers
  const filteredFreelancers = allFreelancers.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase()) ||
                         f.profile?.title?.toLowerCase().includes(search.toLowerCase()) ||
                         f.profile?.skills?.some(s => s.toLowerCase().includes(search.toLowerCase()));
    
    if (selectedCategory === 'All Categories') return matchesSearch;
    
    const categorySkillMap: Record<string, string[]> = {
      'Frontend': ['React', 'Angular', 'Vue', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Tailwind'],
      'Backend': ['Python', 'Flask', 'Django', 'Node.js', 'Express', 'MySQL', 'MongoDB'],
      'Full Stack': ['React', 'Angular', 'Vue', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Tailwind', 'Python', 'Flask', 'Django', 'Node.js', 'Express', 'MySQL', 'MongoDB'],
      'AI/ML': ['Python', 'Machine Learning', 'Deep Learning', 'TensorFlow', 'Scikit-learn', 'Data Science', 'PyTorch'],
      'Marketing': ['SEO', 'Content Marketing', 'Social Media', 'Digital Marketing'],
      'Finance': ['Financial Analysis', 'Accounting', 'Excel', 'Investment'],
      'Mobile Development': ['React Native', 'Flutter', 'iOS', 'Android', 'Swift', 'Kotlin'],
      'UI/UX': ['Figma', 'Adobe XD', 'UI Design', 'UX Research', 'Prototyping'],
    };
    
    const categorySkills = categorySkillMap[selectedCategory] || [];
    const matchesCategory = f.profile?.skills?.some(skill =>
      categorySkills.some(catSkill => skill.toLowerCase().includes(catSkill.toLowerCase()))
    );
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Browse Freelancers</h1>
      
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Search</label>
            <input
              type="text"
              placeholder="Search by name, title, or skills..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Category Filter</label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredFreelancers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-500">No freelancers found matching your criteria</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredFreelancers.map(f => (
            <div key={f.id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <Avatar name={f.name} size="lg" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900">{f.name}</h3>
                  <p className="text-slate-600 text-sm">{f.profile?.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Stars rating={f.profile?.rating || 0} />
                    <span className="text-sm text-slate-500">• {f.profile?.experience} yrs</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="text-sm font-medium text-slate-700 mb-2">Skills</div>
                <div className="flex flex-wrap gap-1.5">
                  {f.profile?.skills?.slice(0, 4).map((skill, i) => (
                    <SkillTag key={i} skill={skill} />
                  ))}
                  {f.profile?.skills && f.profile.skills.length > 4 && (
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-full">
                      +{f.profile.skills.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              {f.profile?.summary && (
                <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <div className="text-xs font-semibold text-purple-700 mb-1">AI Summary</div>
                  <p className="text-sm text-slate-700 line-clamp-3">{f.profile.summary}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div>
                  <div className="text-xs text-slate-500">Hourly Rate</div>
                  <div className="font-bold text-purple-600">${f.profile?.hourlyRate}/hr</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">Availability</div>
                  <div className="font-medium text-slate-900 capitalize">{f.profile?.availability}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// FREELANCER DASHBOARD
// ============================================================
function FreelancerDashboard({ user, setPage }: any) {
  const apps = getApps().filter(a => a.freelancerId === user.id);
  const projects = getProjects().filter((p: Project) => p.status === 'open');
  
  // CRITICAL FIX: Use profileCompleted flag from user object
  const profileComplete = user.profileCompleted === true;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold">Welcome back, {user.name.split(' ')[0]}!</h1><p className="text-purple-100 mt-1">Here's your dashboard overview</p></div>
          {profileComplete && user.profile?.rating ? (<div className="text-right"><div className="text-4xl font-bold">{user.profile.rating}</div><div className="flex items-center justify-end mt-1"><Stars rating={user.profile.rating} /></div></div>) : null}
        </div>
      </div>
      
      {/* CRITICAL FIX: Show warning only if profile NOT completed */}
      {!profileComplete && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-amber-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900">Complete Your Profile</h3>
              <p className="text-sm text-amber-700">Please complete your profile to unlock AI features and apply for projects.</p>
            </div>
            <button onClick={() => setPage('profile')} className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium">Complete Now</button>
          </div>
        </div>
      )}
      
      {/* Show success message when profile is complete */}
      {profileComplete && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <div className="flex-1">
              <h3 className="font-semibold text-emerald-900">Profile Complete!</h3>
              <p className="text-sm text-emerald-700">All AI features are now unlocked. You can generate summaries, proposals, and apply for projects.</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Completed Projects" value={user.profile?.completedProjects || 0} />
        <StatCard label="Applications" value={apps.length} color="text-purple-600" />
        <StatCard label="Pending" value={apps.filter(a => a.status === 'Pending').length} color="text-amber-600" />
        <StatCard label="Hired" value={apps.filter(a => a.status === 'Accepted').length} color="text-emerald-600" />
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Recommended Projects</h2>
          <button onClick={() => setPage('projects')} className="px-4 py-2 text-sm font-medium text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-50">View All</button>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {projects.slice(0, 3).map((p: any) => (
            <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3"><StatusBadge status={p.status} /><span className="text-xs text-slate-500">{new Date(p.postedAt).toLocaleDateString('en-GB')}</span></div>
              <h3 className="font-bold text-slate-900 mb-2">{p.title}</h3>
              <p className="text-sm text-slate-600 line-clamp-2 mb-3">{p.description}</p>
              <div className="flex flex-wrap gap-1.5 mb-3">{p.skills.slice(0, 4).map((s: string, i: number) => <SkillTag key={i} skill={s} />)}</div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100"><span className="font-bold text-purple-600">${p.budget.toLocaleString()}</span><span className="text-sm text-slate-500">{p.applicants} applicants</span></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PROJECTS PAGE (FREELANCER) - CRITICAL FIX
// ============================================================
function ProjectsPage({ user, showToast }: any) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [applyProject, setApplyProject] = useState<any>(null);
  const [applyForm, setApplyForm] = useState({ budget: '', proposal: '' });
  const CATEGORIES = ['All Categories', 'Full Stack', 'Frontend', 'Backend', 'Mobile', 'AI/ML', 'UI/UX'];
  const projects = getProjects().filter(p => p.status === 'open');
  const filtered = projects.filter(p => (category === 'All Categories' || p.category === category) && (p.title.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase())));
  
  // CRITICAL FIX: Check profileCompleted flag
  const profileComplete = user.profileCompleted === true;

  const handleApply = () => {
    // CRITICAL FIX: Block application if profile not complete
    if (!profileComplete) { showToast('Please complete your profile before applying', 'error'); return; }
    if (!applyForm.proposal) { showToast('Please enter a proposal', 'error'); return; }
    if (!applyProject) return;
    
    const apps = getApps();
    const newApp: Application = {
      id: 'a' + Date.now(), projectId: applyProject.id, freelancerId: user.id,
      freelancerName: user.name, freelancerTitle: user.profile?.title || '',
      freelancerSkills: user.profile?.skills || [], freelancerExperience: user.profile?.experience || 0, freelancerRating: user.profile?.rating || 0,
      budget: parseInt(applyForm.budget) || applyProject.budget, proposal: applyForm.proposal,
      status: 'Pending', appliedAt: new Date().toISOString()
    };
    saveApps([newApp, ...apps]);
    showToast('Application Submitted Successfully');
    setApplyProject(null);
    setApplyForm({ budget: '', proposal: '' });
  };

  const handleGenerate = () => {
    // CRITICAL FIX: Block AI generation if profile not complete
    if (!profileComplete) { showToast('Please complete your profile before using AI features', 'error'); return; }
    if (!applyProject) return;
    const proposal = generateProposal(user.profile?.skills || [], user.profile?.experience || 3, user.profile?.summary || '', applyProject.title, applyProject.skills);
    setApplyForm({ ...applyForm, proposal });
    showToast('Proposal Generated Successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Browse Projects</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">{Ic.Search("w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400")}<input type="text" placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 w-full sm:w-64" /></div>
          <select value={category} onChange={e => setCategory(e.target.value)} className="px-4 py-2.5 border border-slate-300 rounded-lg bg-white font-medium text-slate-700 min-w-[180px]">{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select>
        </div>
      </div>
      
      {/* CRITICAL FIX: Show warning if profile not complete */}
      {!profileComplete && <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5"><p className="text-amber-700"><strong>Please complete your profile</strong> to apply for projects and use AI features.</p></div>}
      
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p: any) => (
          <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3"><StatusBadge status={p.status} /><span className="text-xs text-slate-500">{new Date(p.postedAt).toLocaleDateString('en-GB')}</span></div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">{p.title}</h3>
            <p className="text-sm text-slate-600 line-clamp-2 mb-4">{p.description}</p>
            <div className="flex flex-wrap gap-1.5 mb-4">{p.skills.slice(0, 4).map((s: string, i: number) => <SkillTag key={i} skill={s} />)}</div>
            <div className="flex items-center justify-between text-sm text-slate-500 mb-4 pb-4 border-b border-slate-100"><span className="flex items-center gap-1.5">{Ic.Clock("w-4 h-4")}Due {new Date(p.deadline).toLocaleDateString('en-GB')}</span><span>{p.applicants} applicants</span></div>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-purple-600">${p.budget.toLocaleString()}</span>
              <button onClick={() => { setApplyProject(p); setApplyForm({ budget: p.budget.toString(), proposal: '' }); }} className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-700 shadow-md shadow-purple-200">Apply</button>
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && <div className="text-center py-16 bg-white rounded-2xl border border-slate-200"><p className="text-slate-500">No projects found</p></div>}
      
      {applyProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setApplyProject(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between"><h2 className="text-xl font-bold text-slate-900">Apply to Project</h2><button onClick={() => setApplyProject(null)} className="text-slate-400 text-2xl hover:text-slate-600">×</button></div>
            <div className="p-6 space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg"><h3 className="font-bold text-slate-900">{applyProject.title}</h3><p className="text-sm text-slate-600 mt-1">{applyProject.description}</p><div className="flex flex-wrap gap-1.5 mt-3">{applyProject.skills.map((s: string, i: number) => <SkillTag key={i} skill={s} />)}</div></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Your Budget ($)</label><input type="number" value={applyForm.budget} onChange={e => setApplyForm({ ...applyForm, budget: e.target.value })} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500" /></div>
              <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Cover Letter / Proposal <span className="text-red-500">*</span></label><textarea value={applyForm.proposal} onChange={e => setApplyForm({ ...applyForm, proposal: e.target.value })} rows={6} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500" placeholder="Explain why you're the best fit..." /></div>
              <button onClick={handleGenerate} className="w-full py-3 bg-white text-purple-700 font-semibold border-2 border-purple-200 rounded-lg hover:bg-purple-50 flex items-center justify-center gap-2">{Ic.Robot("w-5 h-5")}Generate AI Proposal</button>
              <button onClick={handleApply} disabled={!applyForm.proposal} className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 disabled:opacity-50">Submit Application</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// AI TOOLS PAGE - CRITICAL FIX
// ============================================================
function AIToolsPage({ user, onUpdate, showToast, setPage }: any) {
  const [tab, setTab] = useState<'proposal' | 'summary'>('summary');
  const projects = getProjects().filter(p => p.status === 'open');
  const [projectId, setProjectId] = useState('');
  const [content, setContent] = useState(user.profile?.summary || '');
  const [loading, setLoading] = useState(false);
  
  // CRITICAL FIX: Check profileCompleted flag
  const profileComplete = user.profileCompleted === true;

  const handleGenerate = () => {
    // CRITICAL FIX: Block AI generation if profile not complete
    if (!profileComplete) { showToast('Please complete your profile before using AI features', 'error'); return; }
    setLoading(true);
    setTimeout(() => {
      if (tab === 'proposal') {
        if (!projectId) { showToast('Select a project first', 'error'); setLoading(false); return; }
        const project = projects.find((p: Project) => p.id === projectId);
        if (project) {
          const proposal = generateProposal(user.profile?.skills || [], user.profile?.experience || 3, user.profile?.summary || '', project.title, project.skills);
          setContent(proposal);
          showToast('Proposal Generated Successfully');
        }
      } else {
        const summary = generateSummary(user.profile?.title || 'Professional', user.profile?.skills || [], user.profile?.experience || 3, user.profile?.completedProjects || 0, user.profile?.education || '');
        setContent(summary);
        showToast('Summary Generated Successfully');
      }
      setLoading(false);
    }, 800);
  };

  const handleSave = () => {
    if (tab === 'summary') {
      const updatedUser = { ...user, profile: { ...user.profile, summary: content } };
      onUpdate(updatedUser);
      showToast('Summary Saved Successfully');
    } else {
      showToast('Proposal ready to submit with application');
    }
  };

  if (!profileComplete) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">AI Tools</h1>
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4"><svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Profile Incomplete</h3>
          <p className="text-slate-600 mb-4">Please complete your profile before using AI features.</p>
          <button onClick={() => setPage('profile')} className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700">Complete Profile</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">AI Tools</h1>
      <div className="flex gap-2 p-1 bg-slate-100 rounded-lg w-fit">
        <button onClick={() => { setTab('summary'); setContent(user.profile?.summary || ''); }} className={`px-4 py-2 rounded-md text-sm font-medium ${tab === 'summary' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600'}`}>Profile Summary</button>
        <button onClick={() => { setTab('proposal'); setContent(''); }} className={`px-4 py-2 rounded-md text-sm font-medium ${tab === 'proposal' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600'}`}>Proposal Generator</button>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-4">{tab === 'proposal' ? 'Select Project' : 'Your Profile'}</h2>
          {tab === 'proposal' ? (
            <select value={projectId} onChange={e => setProjectId(e.target.value)} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white mb-4"><option value="">Select a project...</option>{projects.map((p: Project) => <option key={p.id} value={p.id}>{p.title}</option>)}</select>
          ) : (
            <div className="p-4 bg-slate-50 rounded-lg"><div className="font-semibold text-slate-900">{user.name}</div><div className="text-sm text-slate-600">{user.profile?.title}</div></div>
          )}
          <button onClick={handleGenerate} disabled={loading} className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 disabled:opacity-50">{loading ? 'Generating...' : 'Generate with AI'}</button>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-slate-900 mb-4">Generated Content</h2>
          {content ? (
            <div className="space-y-3">
              <textarea value={content} onChange={e => setContent(e.target.value)} rows={10} className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm" />
              <button onClick={handleSave} className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg">Save</button>
            </div>
          ) : (
            <div className="text-center py-12"><p className="text-slate-500">Click generate to create content</p></div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// OTHER PAGES (Simplified)
// ============================================================
function ClientDashboard({ user, setPage }: any) {
  const myProjects = getProjects().filter(p => p.clientId === user.id);
  const apps = getApps().filter(a => myProjects.map(p => p.id).includes(a.projectId));
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white"><h1 className="text-2xl font-bold">Welcome, {user.name}!</h1><p className="text-emerald-100 mt-1">Manage your projects</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Projects Posted" value={myProjects.length} />
        <StatCard label="Total Applicants" value={apps.length} color="text-purple-600" />
        <StatCard label="Open Projects" value={myProjects.filter(p => p.status === 'open').length} color="text-emerald-600" />
        <StatCard label="Hired" value={apps.filter(a => a.status === 'Accepted').length} color="text-indigo-600" />
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid gap-3 md:grid-cols-3">
          <button onClick={() => setPage('post-project')} className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700">{Ic.Plus("w-5 h-5")}Post New Project</button>
          <button onClick={() => setPage('applicants')} className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-purple-700 font-semibold border-2 border-purple-200 rounded-lg hover:bg-purple-50">{Ic.Folder("w-5 h-5")}View Applicants</button>
          <button onClick={() => setPage('profile')} className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-purple-700 font-semibold border-2 border-purple-200 rounded-lg hover:bg-purple-50">Edit Profile</button>
        </div>
      </div>
    </div>
  );
}

function ClientProfilePage({ user, onSave, showToast }: any) {
  const [form, setForm] = useState({
    companyName: user.profile?.companyName || '',
    companyDescription: user.profile?.companyDescription || '',
    companyWebsite: user.profile?.companyWebsite || '',
    location: user.profile?.location || '',
    budgetRange: user.profile?.budgetRange || '',
    contactNumber: user.profile?.contactNumber || '',
  });

  const handleSave = () => {
    if (!form.companyName || !form.contactNumber) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    const updatedUser = { ...user, profile: { ...user.profile, ...form }, profileCompleted: true };
    onSave(updatedUser);
    showToast('Profile Saved Successfully');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Client Profile</h1>
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
          <input value={user.name} disabled className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
          <input value={user.email} disabled className="w-full px-4 py-2.5 border border-slate-200 bg-slate-50 rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Company Name *</label>
          <input value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500" placeholder="e.g., TechCorp Solutions" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Company Description</label>
          <textarea value={form.companyDescription} onChange={e => setForm({ ...form, companyDescription: e.target.value })} rows={3} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500" placeholder="Tell us about your company..." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Company Website</label>
            <input value={form.companyWebsite} onChange={e => setForm({ ...form, companyWebsite: e.target.value })} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500" placeholder="https://example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Location</label>
            <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500" placeholder="e.g., Bangalore, India" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Budget Range</label>
            <select value={form.budgetRange} onChange={e => setForm({ ...form, budgetRange: e.target.value })} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white">
              <option value="">Select budget range</option>
              <option value="$1,000 - $5,000">$1,000 - $5,000</option>
              <option value="$5,000 - $10,000">$5,000 - $10,000</option>
              <option value="$10,000 - $25,000">$10,000 - $25,000</option>
              <option value="$25,000+">$25,000+</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Contact Number *</label>
            <input value={form.contactNumber} onChange={e => setForm({ ...form, contactNumber: e.target.value })} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500" placeholder="+91 9876543210" />
          </div>
        </div>
        <button onClick={handleSave} className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-indigo-700">Save Profile</button>
      </div>
    </div>
  );
}

function PostProjectPage({ user, showToast, setPage }: any) {
  const [form, setForm] = useState({ title: '', description: '', category: 'Full Stack', budget: '', deadline: '', skills: [] as string[], skillSearch: '' });
  const ALL_SKILLS = ['React', 'Vue.js', 'Angular', 'Node.js', 'Python', 'JavaScript', 'TypeScript', 'MongoDB', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes', 'Firebase', 'React Native', 'Flutter', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Figma', 'Adobe XD', 'HTML', 'CSS', 'Tailwind', 'Django', 'Flask', 'Express', 'REST API'];
  const filtered = ALL_SKILLS.filter(s => s.toLowerCase().includes(form.skillSearch.toLowerCase()) && !form.skills.includes(s));
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProject: Project = { id: 'p' + Date.now(), clientId: user.id, clientName: user.name, title: form.title, description: form.description, category: form.category, skills: form.skills, budget: parseFloat(form.budget), deadline: form.deadline, experienceLevel: 'intermediate', postedAt: new Date().toISOString(), status: 'open', applicants: 0 };
    saveProjects([newProject, ...getProjects()]);
    showToast('Project Posted Successfully');
    setPage('my-projects');
  };
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Post a New Project</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Title *</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg" required /></div>
        <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Description *</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg" required /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label><select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white"><option>Full Stack</option><option>Frontend</option><option>Backend</option><option>Mobile</option><option>AI/ML</option><option>UI/UX</option></select></div>
          <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Budget ($) *</label><input type="number" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg" required /></div>
        </div>
        <div><label className="block text-sm font-medium text-slate-700 mb-1.5">Deadline *</label><input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg" required /></div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Required Skills</label>
          <input placeholder="Search skills..." value={form.skillSearch} onChange={e => setForm({ ...form, skillSearch: e.target.value })} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg mb-2" />
          {form.skillSearch && filtered.length > 0 && (<div className="max-h-32 overflow-y-auto border border-slate-200 rounded-lg mb-2">{filtered.slice(0, 6).map(s => <button key={s} type="button" onClick={() => { setForm({ ...form, skills: [...form.skills, s], skillSearch: '' }); }} className="w-full text-left px-4 py-2 hover:bg-slate-100 text-sm">{s}</button>)}</div>)}
          <div className="flex flex-wrap gap-2">{form.skills.map(s => <span key={s} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-1">{s}<button type="button" onClick={() => setForm({ ...form, skills: form.skills.filter(x => x !== s) })} className="hover:text-purple-900">×</button></span>)}</div>
        </div>
        <button type="submit" className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg">Post Project</button>
      </form>
    </div>
  );
}

function MyProjectsPage({ user, setPage, setSelectedProject }: any) {
  const myProjects = getProjects().filter(p => p.clientId === user.id);
  
  const handleViewFreelancers = (project: Project) => {
    setSelectedProject(project);
    setPage('ml-matches');
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">My Projects</h1>
      {myProjects.length === 0 ? <div className="text-center py-16 bg-white rounded-2xl border border-slate-200"><p className="text-slate-500">No projects posted yet</p></div> : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {myProjects.map(p => (
            <div key={p.id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3"><StatusBadge status={p.status} /><span className="text-xs text-slate-500">{new Date(p.postedAt).toLocaleDateString('en-GB')}</span></div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{p.title}</h3>
              <p className="text-sm text-slate-600 line-clamp-2 mb-4">{p.description}</p>
              <div className="flex flex-wrap gap-1.5 mb-4">{p.skills.slice(0, 3).map((s: string, i: number) => <SkillTag key={i} skill={s} />)}</div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div>
                  <span className="font-bold text-purple-600">${p.budget.toLocaleString()}</span>
                  <span className="text-sm text-slate-500 ml-2">{p.applicants} applicants</span>
                </div>
                <button 
                  onClick={() => handleViewFreelancers(p)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-700 hover:to-indigo-700"
                >
                  View ML Matches
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MyApplicationsPage({ user }: any) {
  const apps = getApps().filter(a => a.freelancerId === user.id);
  const projects = getProjects();
  
  const getMatchBadgeColor = (level?: string) => {
    if (level === 'Strong Match') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (level === 'Moderate Match') return 'bg-amber-100 text-amber-700 border-amber-200';
    if (level === 'Low Match') return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">My Applications</h1>
      {apps.length === 0 ? <div className="text-center py-16 bg-white rounded-2xl border border-slate-200"><p className="text-slate-500">No applications yet</p></div> : (
        <div className="space-y-4">
          {apps.map(app => {
            const project = projects.find(p => p.id === app.projectId);
            return (
              <div key={app.id} className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900">{project?.title || 'Project'}</h3>
                    <p className="text-sm text-slate-600 mt-1">Client: {project?.clientName}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {app.matchScore && (
                      <div className={`px-3 py-1.5 rounded-lg border-2 ${getMatchBadgeColor(app.matchLevel)}`}>
                        <div className="text-lg font-bold">{app.matchScore}%</div>
                        <div className="text-xs font-semibold">{app.matchLevel}</div>
                      </div>
                    )}
                    <StatusBadge status={app.status} />
                  </div>
                </div>
                <p className="text-sm text-slate-600 line-clamp-2 mb-3">{app.proposal}</p>
                <div className="flex items-center justify-between text-sm text-slate-500"><span>Budget: ${app.budget.toLocaleString()}</span><span>{new Date(app.appliedAt).toLocaleDateString('en-GB')}</span></div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function MLMatchesPage({ project, onBack, setPage }: { project: Project; onBack: () => void; setPage: (page: string) => void }) {
  const [confirmHire, setConfirmHire] = useState<{freelancer: User; match: {score: number; level: string}} | null>(null);
  
  // Get all freelancers (demo + registered with complete profile)
  const allFreelancers = [...DEMO_FREELANCERS, ...getUsers().filter(u => u.role === 'freelancer' && u.profileCompleted)];
  
  // Calculate ML match for each freelancer
  const matchedFreelancers = allFreelancers.map(freelancer => {
    const match = calculateMLMatch(
      freelancer.profile?.skills || [],
      project.skills,
      freelancer.profile?.experience || 0,
      freelancer.profile?.rating || 0,
      project.category
    );
    return { freelancer, match };
  })
  .filter(m => m.match.score >= 50) // Only show freelancers with score >= 50
  .sort((a, b) => b.match.score - a.match.score);

  const strongMatches = matchedFreelancers.filter(m => m.match.level === 'Strong Match');
  const moderateMatches = matchedFreelancers.filter(m => m.match.level === 'Moderate Match');

  const getBadgeColor = (level: string) => {
    if (level === 'Strong Match') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (level === 'Moderate Match') return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-emerald-600';
    if (score >= 45) return 'text-amber-600';
    return 'text-red-600';
  };

  const handleHire = (freelancer: User, match: {score: number; level: string}) => {
    const hired: HiredFreelancer = {
      id: 'h' + Date.now(),
      freelancerId: freelancer.id,
      freelancerName: freelancer.name,
      freelancerTitle: freelancer.profile?.title || '',
      clientId: project.clientId,
      clientName: project.clientName,
      projectId: project.id,
      projectName: project.title,
      matchScore: match.score,
      matchLevel: match.level,
      hiredDate: new Date().toISOString().split('T')[0],
      status: 'Hired'
    };
    saveHired([...getHired(), hired]);
    setConfirmHire(null);
    alert(`Successfully hired ${freelancer.name}!`);
    setPage('hired-freelancers');
  };

  const FreelancerCard = ({ freelancer, match }: { freelancer: User; match: {score: number; level: string} }) => (
    <div className="bg-white rounded-2xl border-2 border-slate-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <Avatar name={freelancer.name} size="lg" />
          <div>
            <h3 className="text-lg font-bold text-slate-900">{freelancer.name}</h3>
            <p className="text-slate-600">{freelancer.profile?.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <Stars rating={freelancer.profile?.rating || 0} />
              <span className="text-sm text-slate-500">• {freelancer.profile?.experience} years exp</span>
            </div>
          </div>
        </div>
        <div className={`inline-block px-4 py-2 rounded-lg border-2 ${getBadgeColor(match.level)}`}>
          <div className={`text-2xl font-bold ${getScoreColor(match.score)}`}>{match.score}%</div>
          <div className="text-xs font-semibold">{match.level}</div>
        </div>
      </div>
      <div className="mb-4">
        <div className="text-sm font-medium text-slate-700 mb-2">Skills</div>
        <div className="flex flex-wrap gap-2">
          {freelancer.profile?.skills?.map((skill, i) => (
            <SkillTag key={i} skill={skill} />
          ))}
        </div>
      </div>
      {freelancer.profile?.summary && (
        <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
          <div className="text-xs font-semibold text-purple-700 mb-1">AI Summary</div>
          <p className="text-sm text-slate-700 line-clamp-2">{freelancer.profile.summary}</p>
        </div>
      )}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <span className="text-sm text-slate-600">Hourly Rate: <span className="font-bold text-purple-600">${freelancer.profile?.hourlyRate}/hr</span></span>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-sm font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50">View Profile</button>
          <button className="px-4 py-2 text-sm font-medium text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-50">Contact</button>
          <button onClick={() => setConfirmHire({freelancer, match})} className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg hover:from-emerald-700">Hire Freelancer</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {confirmHire && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirm Hire</h3>
            <p className="text-slate-600 mb-6">Are you sure you want to hire <strong>{confirmHire.freelancer.name}</strong> for <strong>{project.title}</strong>?</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmHire(null)} className="px-4 py-2 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={() => handleHire(confirmHire.freelancer, confirmHire.match)} className="px-4 py-2 text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg hover:from-emerald-700">Yes, Hire</button>
            </div>
          </div>
        </div>
      )}
      
      <button onClick={onBack} className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        Back to Projects
      </button>
      
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">ML-Matched Freelancers</h1>
            <p className="text-slate-600 mt-1">For: <span className="font-semibold">{project.title}</span></p>
          </div>
          <div className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg">
            <div className="text-xs font-semibold">Random Forest Model</div>
            <div className="text-sm font-bold">87% Accuracy</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200">
            <div className="text-2xl font-bold text-emerald-700">{strongMatches.length}</div>
            <div className="text-xs text-emerald-600 font-medium">Strong Matches</div>
          </div>
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
            <div className="text-2xl font-bold text-amber-700">{moderateMatches.length}</div>
            <div className="text-xs text-amber-600 font-medium">Moderate Matches</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <div className="text-2xl font-bold text-slate-700">{matchedFreelancers.length}</div>
            <div className="text-xs text-slate-600 font-medium">Total (≥50% match)</div>
          </div>
        </div>
      </div>

      {matchedFreelancers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-500">No freelancers match your project requirements (≥50% match score)</p>
        </div>
      ) : (
        <div className="space-y-6">
          {strongMatches.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                Strong Matches ({strongMatches.length})
              </h2>
              <div className="space-y-4">
                {strongMatches.map(({ freelancer, match }) => (
                  <FreelancerCard key={freelancer.id} freelancer={freelancer} match={match} />
                ))}
              </div>
            </div>
          )}

          {moderateMatches.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                Moderate Matches ({moderateMatches.length})
              </h2>
              <div className="space-y-4">
                {moderateMatches.map(({ freelancer, match }) => (
                  <FreelancerCard key={freelancer.id} freelancer={freelancer} match={match} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function HiredFreelancersPage({ user }: any) {
  const hired = getHired().filter(h => h.clientId === user.id);
  const updateStatus = (id: string, status: 'Hired' | 'Active' | 'Completed') => {
    saveHired(getHired().map(h => h.id === id ? { ...h, status } : h));
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Hired Freelancers</h1>
      {hired.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-500">No hired freelancers yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {hired.map(h => (
            <div key={h.id} className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Avatar name={h.freelancerName} size="lg" />
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{h.freelancerName}</h3>
                    <p className="text-slate-600">{h.freelancerTitle}</p>
                    <p className="text-sm text-slate-500 mt-1">Project: {h.projectName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="inline-block px-4 py-2 rounded-lg border-2 bg-emerald-100 text-emerald-700 border-emerald-200">
                    <div className="text-2xl font-bold text-emerald-600">{h.matchScore}%</div>
                    <div className="text-xs font-semibold">{h.matchLevel}</div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                <div>
                  <div className="text-slate-500">Hire Date</div>
                  <div className="font-semibold">{new Date(h.hiredDate).toLocaleDateString('en-GB')}</div>
                </div>
                <div>
                  <div className="text-slate-500">Status</div>
                  <select 
                    value={h.status} 
                    onChange={(e) => updateStatus(h.id, e.target.value as any)}
                    className="font-semibold px-2 py-1 border border-slate-300 rounded-lg"
                  >
                    <option value="Hired">Hired</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <div className="text-slate-500">Freelancer ID</div>
                  <div className="font-semibold">{h.freelancerId}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MyHiredProjectsPage({ user }: any) {
  const hired = getHired().filter(h => h.freelancerId === user.id);
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">My Hired Projects</h1>
      {hired.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <p className="text-slate-500">You haven't been hired for any projects yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {hired.map(h => (
            <div key={h.id} className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{h.projectName}</h3>
                  <p className="text-slate-600">Client: {h.clientName}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="inline-block px-4 py-2 rounded-lg border-2 bg-emerald-100 text-emerald-700 border-emerald-200">
                    <div className="text-2xl font-bold text-emerald-600">{h.matchScore}%</div>
                    <div className="text-xs font-semibold">{h.matchLevel}</div>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                    h.status === 'Hired' ? 'bg-purple-100 text-purple-700' :
                    h.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {h.status}
                  </span>
                </div>
              </div>
              <div className="text-sm text-slate-500">Hired on: {new Date(h.hiredDate).toLocaleDateString('en-GB')}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ApplicantsPage({ user, showToast }: any) {
  const myProjectIds = getProjects().filter(p => p.clientId === user.id).map(p => p.id);
  const apps = getApps().filter(a => myProjectIds.includes(a.projectId));
  const updateStatus = (id: string, status: AppStatus) => {
    saveApps(getApps().map(a => a.id === id ? { ...a, status } : a));
    showToast(`Application ${status}`);
  };
  
  const getMatchBadgeColor = (level?: string) => {
    if (level === 'Strong Match') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    if (level === 'Moderate Match') return 'bg-amber-100 text-amber-700 border-amber-200';
    if (level === 'Low Match') return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Applicants</h1>
      {apps.length === 0 ? <div className="text-center py-16 bg-white rounded-2xl border border-slate-200"><p className="text-slate-500">No applicants yet</p></div> : (
        <div className="space-y-4">
          {apps.map(app => (
            <div key={app.id} className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-slate-900">{app.freelancerName}</h3>
                  <p className="text-sm text-slate-600">{app.freelancerTitle}</p>
                </div>
                <div className="flex items-center gap-3">
                  {app.matchScore && (
                    <div className={`px-3 py-1.5 rounded-lg border-2 ${getMatchBadgeColor(app.matchLevel)}`}>
                      <div className="text-lg font-bold">{app.matchScore}%</div>
                      <div className="text-xs font-semibold">{app.matchLevel}</div>
                    </div>
                  )}
                  <StatusBadge status={app.status} />
                </div>
              </div>
              
              <div className="mb-3">
                <div className="text-sm font-medium text-slate-700 mb-2">Skills</div>
                <div className="flex flex-wrap gap-1.5">
                  {app.freelancerSkills.slice(0, 5).map((skill, i) => (
                    <SkillTag key={i} skill={skill} />
                  ))}
                </div>
              </div>
              
              <div className="mb-3">
                <div className="text-sm font-medium text-slate-700 mb-1">Proposal</div>
                <p className="text-sm text-slate-600 line-clamp-2">{app.proposal}</p>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                <span><strong>Experience:</strong> {app.freelancerExperience} years</span>
                <span><strong>Rating:</strong> {app.freelancerRating}/5</span>
                <span><strong>Budget:</strong> ${app.budget.toLocaleString()}</span>
              </div>
              
              {app.status === 'Pending' && (
                <div className="flex gap-2 pt-4 border-t border-slate-100">
                  <button onClick={() => updateStatus(app.id, 'Shortlisted')} className="px-4 py-2 text-sm font-medium text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-50">Shortlist</button>
                  <button onClick={() => updateStatus(app.id, 'Accepted')} className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg">Accept</button>
                  <button onClick={() => updateStatus(app.id, 'Rejected')} className="px-4 py-2 text-sm font-medium text-red-700 border border-red-200 rounded-lg hover:bg-red-50">Reject</button>
                  <button onClick={() => updateStatus(app.id, 'Accepted')} className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg">Hire</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
