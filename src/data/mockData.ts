import { FreelancerProfile, ClientProfile, Project, Application, ProjectCategory } from '../types';

export const mockFreelancers: FreelancerProfile[] = [
  {
    id: 'f1',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    role: 'freelancer',
    title: 'Senior Full-Stack Developer',
    skills: ['React', 'Node.js', 'Python', 'TypeScript', 'PostgreSQL', 'AWS'],
    experience: 7,
    hourlyRate: 85,
    rating: 4.9,
    completedProjects: 48,
    bio: 'Experienced full-stack developer with expertise in modern web technologies. Passionate about building scalable applications.',
    education: 'M.S. Computer Science, Stanford University',
    availability: 'full-time',
    portfolio: [
      {
        id: 'p1',
        title: 'E-commerce Platform',
        description: 'Built a complete e-commerce solution with React and Node.js',
        technologies: ['React', 'Node.js', 'MongoDB']
      }
    ]
  },
  {
    id: 'f2',
    name: 'Michael Chen',
    email: 'michael@example.com',
    role: 'freelancer',
    title: 'UI/UX Designer & Frontend Developer',
    skills: ['React', 'Vue.js', 'Figma', 'CSS', 'JavaScript', 'Tailwind CSS'],
    experience: 5,
    hourlyRate: 65,
    rating: 4.7,
    completedProjects: 35,
    bio: 'Creative designer with a passion for beautiful, user-friendly interfaces.',
    education: 'B.A. Graphic Design, Rhode Island School of Design',
    availability: 'part-time',
    portfolio: [
      {
        id: 'p2',
        title: 'Mobile App UI',
        description: 'Designed complete UI for a fitness tracking app',
        technologies: ['Figma', 'React Native']
      }
    ]
  },
  {
    id: 'f3',
    name: 'Emily Rodriguez',
    email: 'emily@example.com',
    role: 'freelancer',
    title: 'AI/ML Engineer',
    skills: ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Data Science', 'SQL'],
    experience: 6,
    hourlyRate: 120,
    rating: 4.8,
    completedProjects: 22,
    bio: 'Specialized in machine learning and AI solutions with a focus on NLP and computer vision.',
    education: 'Ph.D. Artificial Intelligence, MIT',
    availability: 'contract',
    portfolio: [
      {
        id: 'p3',
        title: 'Sentiment Analysis System',
        description: 'Developed ML model for real-time sentiment analysis',
        technologies: ['Python', 'TensorFlow', 'NLP']
      }
    ]
  },
  {
    id: 'f4',
    name: 'David Park',
    email: 'david@example.com',
    role: 'freelancer',
    title: 'Mobile App Developer',
    skills: ['React Native', 'Flutter', 'iOS', 'Android', 'Firebase', 'TypeScript'],
    experience: 4,
    hourlyRate: 75,
    rating: 4.6,
    completedProjects: 28,
    bio: 'Passionate mobile developer creating seamless cross-platform experiences.',
    education: 'B.S. Computer Science, UC Berkeley',
    availability: 'full-time',
    portfolio: [
      {
        id: 'p4',
        title: 'Food Delivery App',
        description: 'Cross-platform food delivery application',
        technologies: ['React Native', 'Firebase']
      }
    ]
  },
  {
    id: 'f5',
    name: 'Lisa Wang',
    email: 'lisa@example.com',
    role: 'freelancer',
    title: 'DevOps Engineer',
    skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'Linux'],
    experience: 8,
    hourlyRate: 95,
    rating: 4.9,
    completedProjects: 41,
    bio: 'Infrastructure specialist focused on cloud-native solutions and automation.',
    education: 'M.S. Information Systems, Carnegie Mellon',
    availability: 'full-time',
    portfolio: [
      {
        id: 'p5',
        title: 'Cloud Migration',
        description: 'Migrated enterprise application to AWS with zero downtime',
        technologies: ['AWS', 'Docker', 'Kubernetes']
      }
    ]
  },
  {
    id: 'f6',
    name: 'James Wilson',
    email: 'james@example.com',
    role: 'freelancer',
    title: 'Backend Developer',
    skills: ['Python', 'Django', 'FastAPI', 'PostgreSQL', 'Redis', 'Microservices'],
    experience: 6,
    hourlyRate: 80,
    rating: 4.7,
    completedProjects: 37,
    bio: 'Backend specialist building scalable APIs and microservices architecture.',
    education: 'B.S. Software Engineering, Georgia Tech',
    availability: 'contract',
    portfolio: [
      {
        id: 'p6',
        title: 'Real-time Chat System',
        description: 'Built scalable WebSocket-based chat system',
        technologies: ['Python', 'Django', 'Redis']
      }
    ]
  }
];

export const mockClients: ClientProfile[] = [
  {
    id: 'c1',
    name: 'TechStart Inc.',
    email: 'hire@techstart.com',
    role: 'client',
    company: 'TechStart Inc.',
    industry: 'Technology',
    projectsPosted: 12
  },
  {
    id: 'c2',
    name: 'Digital Dynamics',
    email: 'jobs@digitaldynamics.com',
    role: 'client',
    company: 'Digital Dynamics',
    industry: 'Digital Marketing',
    projectsPosted: 8
  },
  {
    id: 'c3',
    name: 'HealthTech Solutions',
    email: 'talent@healthtech.com',
    role: 'client',
    company: 'HealthTech Solutions',
    industry: 'Healthcare',
    projectsPosted: 6
  }
];

export const mockProjects: Project[] = [
  {
    id: 'proj1',
    clientId: 'c1',
    title: 'Full-Stack E-commerce Platform',
    description: 'Build a modern e-commerce platform with product catalog, cart, checkout, and admin dashboard. Must support payment integration and inventory management.',
    requirements: ['User authentication', 'Payment integration', 'Admin dashboard', 'Mobile responsive'],
    skills: ['React', 'Node.js', 'PostgreSQL', 'Stripe', 'TypeScript'],
    category: 'web-development',
    budget: 15000,
    deadline: '2026-03-15',
    status: 'open',
    experienceLevel: 'expert',
    postedAt: '2026-01-20',
    applicants: 5
  },
  {
    id: 'proj2',
    clientId: 'c2',
    title: 'Mobile App UI/UX Redesign',
    description: 'Redesign our existing mobile app with modern UI/UX principles. Need wireframes, prototypes, and final design files.',
    requirements: ['Wireframes', 'Interactive prototype', 'Design system', 'Handoff documentation'],
    skills: ['Figma', 'UI Design', 'UX Research', 'Prototyping'],
    category: 'ui-ux-design',
    budget: 8000,
    deadline: '2026-02-28',
    status: 'open',
    experienceLevel: 'intermediate',
    postedAt: '2026-01-22',
    applicants: 12
  },
  {
    id: 'proj3',
    clientId: 'c3',
    title: 'AI-Powered Patient Diagnosis System',
    description: 'Develop an ML model for assisting in preliminary patient diagnosis based on symptoms and medical history.',
    requirements: ['Data preprocessing', 'Model training', 'API development', 'Documentation'],
    skills: ['Python', 'TensorFlow', 'Machine Learning', 'FastAPI', 'Healthcare'],
    category: 'ai-ml',
    budget: 25000,
    deadline: '2026-04-30',
    status: 'open',
    experienceLevel: 'expert',
    postedAt: '2026-01-18',
    applicants: 8
  },
  {
    id: 'proj4',
    clientId: 'c1',
    title: 'Cross-Platform Fitness App',
    description: 'Build a fitness tracking app for iOS and Android with workout plans, progress tracking, and social features.',
    requirements: ['Cross-platform compatibility', 'Offline support', 'Push notifications', 'Social features'],
    skills: ['React Native', 'Firebase', 'TypeScript', 'Mobile Development'],
    category: 'mobile-development',
    budget: 12000,
    deadline: '2026-03-30',
    status: 'open',
    experienceLevel: 'intermediate',
    postedAt: '2026-01-25',
    applicants: 15
  },
  {
    id: 'proj5',
    clientId: 'c2',
    title: 'Cloud Infrastructure Setup',
    description: 'Set up and configure AWS infrastructure for our SaaS application with CI/CD pipeline.',
    requirements: ['AWS setup', 'Docker containers', 'CI/CD pipeline', 'Monitoring'],
    skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform'],
    category: 'devops',
    budget: 10000,
    deadline: '2026-02-15',
    status: 'open',
    experienceLevel: 'expert',
    postedAt: '2026-01-10',
    applicants: 6
  },
  {
    id: 'proj6',
    clientId: 'c1',
    title: 'Python Backend API Development',
    description: 'Develop RESTful APIs for our existing frontend application using Python and Django.',
    requirements: ['REST API design', 'Database optimization', 'Authentication', 'Documentation'],
    skills: ['Python', 'Django', 'PostgreSQL', 'REST API', 'Docker'],
    category: 'backend-development',
    budget: 9000,
    deadline: '2026-02-28',
    status: 'open',
    experienceLevel: 'intermediate',
    postedAt: '2026-01-23',
    applicants: 10
  }
];

export const mockApplications: Application[] = [
  {
    id: 'app1',
    projectId: 'proj1',
    freelancerId: 'f1',
    status: 'shortlisted',
    proposedBudget: 14500,
    coverLetter: 'I have extensive experience building e-commerce platforms...',
    submittedAt: '2026-01-21'
  },
  {
    id: 'app2',
    projectId: 'proj2',
    freelancerId: 'f2',
    status: 'accepted',
    proposedBudget: 7500,
    coverLetter: 'As a UI/UX specialist, I can transform your app...',
    submittedAt: '2026-01-23'
  },
  {
    id: 'app3',
    projectId: 'proj3',
    freelancerId: 'f3',
    status: 'pending',
    proposedBudget: 24000,
    coverLetter: 'With my PhD in AI, I am uniquely qualified...',
    submittedAt: '2026-01-19'
  }
];

export const projectCategories: { value: ProjectCategory; label: string }[] = [
  { value: 'web-development', label: 'Web Development' },
  { value: 'mobile-development', label: 'Mobile Development' },
  { value: 'ui-ux-design', label: 'UI/UX Design' },
  { value: 'data-science', label: 'Data Science' },
  { value: 'ai-ml', label: 'AI & Machine Learning' },
  { value: 'backend-development', label: 'Backend Development' },
  { value: 'frontend-development', label: 'Frontend Development' },
  { value: 'devops', label: 'DevOps' },
  { value: 'content-writing', label: 'Content Writing' },
  { value: 'digital-marketing', label: 'Digital Marketing' }
];

export const allSkills = [
  'React', 'Vue.js', 'Angular', 'Node.js', 'Python', 'JavaScript', 'TypeScript',
  'Java', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin',
  'React Native', 'Flutter', 'iOS', 'Android', 'Firebase',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform',
  'PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'GraphQL', 'REST API',
  'TensorFlow', 'PyTorch', 'Machine Learning', 'Deep Learning', 'NLP', 'Data Science',
  'Figma', 'UI Design', 'UX Research', 'Prototyping', 'Adobe XD',
  'HTML', 'CSS', 'Tailwind CSS', 'SASS', 'Bootstrap',
  'Django', 'FastAPI', 'Flask', 'Express', 'Spring',
  'Git', 'Linux', 'Agile', 'Scrum'
];
