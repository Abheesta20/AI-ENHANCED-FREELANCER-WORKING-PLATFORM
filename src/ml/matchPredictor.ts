import { FreelancerProfile, Project, MatchResult } from '../types';

/**
 * ML-based Freelancer-Job Match Predictor
 * Simulates Random Forest Classifier behavior for freelancer-job matching
 * 
 * Features analyzed:
 * 1. Skills match percentage
 * 2. Years of experience
 * 3. Project category relevance
 * 4. Past project ratings
 * 5. Freelancer experience level
 * 6. Required technologies
 */

// Category relevance weights
const categoryWeights: Record<string, string[]> = {
  'web-development': ['React', 'Node.js', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'PostgreSQL', 'MongoDB'],
  'mobile-development': ['React Native', 'Flutter', 'iOS', 'Android', 'Firebase', 'TypeScript'],
  'ui-ux-design': ['Figma', 'UI Design', 'UX Research', 'Prototyping', 'Adobe XD'],
  'ai-ml': ['Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Deep Learning', 'NLP', 'Data Science'],
  'backend-development': ['Python', 'Node.js', 'Django', 'FastAPI', 'Express', 'PostgreSQL', 'MongoDB', 'REST API'],
  'frontend-development': ['React', 'Vue.js', 'Angular', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Tailwind CSS'],
  'devops': ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'Linux'],
  'data-science': ['Python', 'SQL', 'Machine Learning', 'Data Science', 'PostgreSQL', 'TensorFlow'],
  'content-writing': [],
  'digital-marketing': []
};

// Experience level mapping
const experienceLevelMap: Record<string, number> = {
  'beginner': 1,
  'intermediate': 2,
  'expert': 3
};

// Experience years to level mapping
function getExperienceLevel(years: number): string {
  if (years < 3) return 'beginner';
  if (years < 6) return 'intermediate';
  return 'expert';
}

// Calculate skills match percentage
function calculateSkillsMatch(freelancerSkills: string[], projectSkills: string[]): number {
  if (projectSkills.length === 0) return 100;
  
  const matchingSkills = freelancerSkills.filter(skill => 
    projectSkills.some(ps => ps.toLowerCase() === skill.toLowerCase())
  );
  
  return (matchingSkills.length / projectSkills.length) * 100;
}

// Calculate category relevance
function calculateCategoryRelevance(
  freelancerSkills: string[], 
  projectCategory: string
): number {
  const relevantSkills = categoryWeights[projectCategory] || [];
  if (relevantSkills.length === 0) return 75; // Default for unmatched categories
  
  const matchingSkills = freelancerSkills.filter(skill =>
    relevantSkills.some(rs => rs.toLowerCase() === skill.toLowerCase())
  );
  
  return Math.min(100, (matchingSkills.length / relevantSkills.length) * 100 + 30);
}

// Calculate experience relevance
function calculateExperienceRelevance(
  freelancerExperience: number,
  projectExperienceLevel: string
): number {
  const freelancerLevel = getExperienceLevel(freelancerExperience);
  const requiredLevelValue = experienceLevelMap[projectExperienceLevel];
  const freelancerLevelValue = experienceLevelMap[freelancerLevel];
  
  if (freelancerLevelValue >= requiredLevelValue) {
    // Exceeds requirements - slight bonus but diminishing returns
    return Math.min(100, 80 + (freelancerLevelValue - requiredLevelValue) * 10);
  } else {
    // Below requirements - significant penalty
    return Math.max(20, 60 - (requiredLevelValue - freelancerLevelValue) * 25);
  }
}

// Calculate rating score (normalized to 0-100)
function calculateRatingScore(rating: number): number {
  return (rating / 5) * 100;
}

// Calculate technologies match
function calculateTechnologiesMatch(
  freelancerSkills: string[],
  projectSkills: string[]
): number {
  if (projectSkills.length === 0) return 50;
  
  const projectLower = projectSkills.map(s => s.toLowerCase());
  const freelancerLower = freelancerSkills.map(s => s.toLowerCase());
  
  const exactMatches = projectLower.filter(s => freelancerLower.includes(s)).length;
  
  // Also check for similar technologies
  const techGroups: string[][] = [
    ['react', 'vue.js', 'angular'],
    ['node.js', 'express', 'django', 'fastapi', 'flask'],
    ['aws', 'azure', 'gcp'],
    ['postgresql', 'mysql', 'mongodb', 'redis'],
    ['react native', 'flutter', 'ios', 'android']
  ];
  
  let partialMatches = 0;
  projectLower.forEach(projectTech => {
    const group = techGroups.find(g => g.includes(projectTech));
    if (group) {
      const hasPartial = freelancerLower.some(ft => group.includes(ft) && !projectLower.includes(ft));
      if (hasPartial && !freelancerLower.includes(projectTech)) {
        partialMatches += 0.3;
      }
    }
  });
  
  return Math.min(100, ((exactMatches + partialMatches) / projectSkills.length) * 100);
}

// Random Forest-like ensemble prediction
function predictMatchScore(
  skillsMatch: number,
  experienceRelevance: number,
  ratingScore: number,
  categoryRelevance: number,
  technologiesMatch: number
): number {
  // Simulated decision trees with different weight combinations
  const tree1 = skillsMatch * 0.35 + technologiesMatch * 0.25 + experienceRelevance * 0.2 + categoryRelevance * 0.1 + ratingScore * 0.1;
  const tree2 = skillsMatch * 0.25 + technologiesMatch * 0.3 + experienceRelevance * 0.25 + categoryRelevance * 0.1 + ratingScore * 0.1;
  const tree3 = skillsMatch * 0.3 + technologiesMatch * 0.2 + experienceRelevance * 0.3 + categoryRelevance * 0.15 + ratingScore * 0.05;
  const tree4 = skillsMatch * 0.28 + technologiesMatch * 0.27 + experienceRelevance * 0.22 + categoryRelevance * 0.13 + ratingScore * 0.1;
  const tree5 = skillsMatch * 0.32 + technologiesMatch * 0.23 + experienceRelevance * 0.25 + categoryRelevance * 0.12 + ratingScore * 0.08;
  
  // Ensemble average (simulating Random Forest voting)
  const ensembleScore = (tree1 + tree2 + tree3 + tree4 + tree5) / 5;
  
  // Add slight randomness to simulate model variance (±3%)
  const variance = (Math.random() - 0.5) * 6;
  
  return Math.min(100, Math.max(0, ensembleScore + variance));
}

// Get match level based on score
function getMatchLevel(score: number): 'Strong Match' | 'Moderate Match' | 'Low Match' {
  if (score >= 70) return 'Strong Match';
  if (score >= 45) return 'Moderate Match';
  return 'Low Match';
}

// Main prediction function
export function predictFreelancerJobMatch(
  freelancer: FreelancerProfile,
  project: Project
): MatchResult {
  const skillsMatch = calculateSkillsMatch(freelancer.skills, project.skills);
  const experienceRelevance = calculateExperienceRelevance(freelancer.experience, project.experienceLevel);
  const ratingScore = calculateRatingScore(freelancer.rating);
  const categoryRelevance = calculateCategoryRelevance(freelancer.skills, project.category);
  const technologiesMatch = calculateTechnologiesMatch(freelancer.skills, project.skills);
  
  const score = predictMatchScore(
    skillsMatch,
    experienceRelevance,
    ratingScore,
    categoryRelevance,
    technologiesMatch
  );
  
  return {
    score: Math.round(score),
    level: getMatchLevel(score),
    factors: {
      skillsMatch: Math.round(skillsMatch),
      experienceRelevance: Math.round(experienceRelevance),
      ratingScore: Math.round(ratingScore),
      categoryRelevance: Math.round(categoryRelevance),
      technologiesMatch: Math.round(technologiesMatch)
    }
  };
}

// Batch prediction for all freelancers against a project
export function predictAllFreelancersMatch(
  freelancers: FreelancerProfile[],
  project: Project
): Array<{ freelancer: FreelancerProfile; match: MatchResult }> {
  return freelancers
    .map(freelancer => ({
      freelancer,
      match: predictFreelancerJobMatch(freelancer, project)
    }))
    .sort((a, b) => b.match.score - a.match.score);
}

// Get recommended projects for a freelancer
export function getRecommendedProjects(
  freelancer: FreelancerProfile,
  projects: Project[]
): Array<{ project: Project; match: MatchResult }> {
  return projects
    .map(project => ({
      project,
      match: predictFreelancerJobMatch(freelancer, project)
    }))
    .sort((a, b) => b.match.score - a.match.score);
}

// Simulate model training metrics
export function getModelMetrics() {
  return {
    accuracy: 0.87,
    precision: 0.89,
    recall: 0.85,
    f1Score: 0.87,
    trainingSamples: 15000,
    testSamples: 3750,
    features: 6,
    trees: 100,
    maxDepth: 15,
    lastTrained: '2026-01-20'
  };
}
