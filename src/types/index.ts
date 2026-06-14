export type UserRole = 'freelancer' | 'client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface FreelancerProfile extends User {
  role: 'freelancer';
  title: string;
  skills: string[];
  experience: number;
  hourlyRate: number;
  rating: number;
  completedProjects: number;
  bio: string;
  education: string;
  availability: 'full-time' | 'part-time' | 'contract';
  portfolio: PortfolioItem[];
  resume?: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  link?: string;
  technologies: string[];
}

export interface ClientProfile extends User {
  role: 'client';
  company: string;
  industry: string;
  projectsPosted: number;
  budget?: number;
}

export interface Project {
  id: string;
  clientId: string;
  title: string;
  description: string;
  requirements: string[];
  skills: string[];
  category: ProjectCategory;
  budget: number;
  deadline: string;
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  experienceLevel: 'beginner' | 'intermediate' | 'expert';
  postedAt: string;
  applicants: number;
}

export type ProjectCategory = 
  | 'web-development'
  | 'mobile-development'
  | 'ui-ux-design'
  | 'data-science'
  | 'ai-ml'
  | 'backend-development'
  | 'frontend-development'
  | 'devops'
  | 'content-writing'
  | 'digital-marketing';

export interface Application {
  id: string;
  projectId: string;
  freelancerId: string;
  status: 'pending' | 'shortlisted' | 'accepted' | 'rejected';
  proposedBudget: number;
  coverLetter: string;
  submittedAt: string;
  matchScore?: MatchResult;
}

export interface MatchResult {
  score: number;
  level: 'Strong Match' | 'Moderate Match' | 'Low Match';
  factors: {
    skillsMatch: number;
    experienceRelevance: number;
    ratingScore: number;
    categoryRelevance: number;
    technologiesMatch: number;
  };
}

export interface AIProposal {
  id: string;
  projectId: string;
  freelancerId: string;
  content: string;
  generatedAt: string;
}

export interface AIProfileSummary {
  id: string;
  freelancerId: string;
  content: string;
  generatedAt: string;
}

export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalEarnings: number;
  averageRating: number;
}
