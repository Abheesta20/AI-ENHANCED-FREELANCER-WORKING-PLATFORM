import { FreelancerProfile, Project } from '../types';

/**
 * Generative AI Module
 * Simulates LLM-based content generation for project proposals and profile summaries
 */

// Proposal templates based on project categories
const proposalTemplates: Record<string, string[]> = {
  'web-development': [
    "I have extensive experience in full-stack web development, specializing in {skills}. I've successfully delivered {projects} projects with similar requirements.",
    "With my {years} years of experience building modern web applications, I can deliver a robust solution using {skills}.",
    "My expertise in {skills} makes me an ideal candidate for this project. I've worked on comparable {category} projects before."
  ],
  'mobile-development': [
    "As a mobile development specialist with expertise in {skills}, I can create a seamless cross-platform experience.",
    "I've developed {projects} mobile applications using {skills} and understand the unique challenges of mobile development.",
    "My background in {skills} combined with {years} years of mobile experience positions me perfectly for this project."
  ],
  'ui-ux-design': [
    "With my passion for user-centered design and expertise in {skills}, I can create an intuitive and visually appealing interface.",
    "I believe great design is invisible - it just works. My experience with {skills} will help achieve this goal.",
    "Having designed for {projects} similar projects, I understand how to balance aesthetics with functionality."
  ],
  'ai-ml': [
    "With my {years} years of experience in AI/ML and expertise in {skills}, I can develop sophisticated machine learning solutions.",
    "My background in {skills} and academic research in AI makes me well-suited for this challenging project.",
    "I've successfully deployed {projects} ML models in production environments using {skills}."
  ],
  'backend-development': [
    "I specialize in building scalable backend systems using {skills}. My experience includes handling millions of requests.",
    "With expertise in {skills} and {years} years of backend development, I can architect a robust and maintainable solution.",
    "My focus on performance and security in {skills} will ensure your backend meets enterprise standards."
  ],
  'frontend-development': [
    "As a frontend specialist, I create performant and accessible user interfaces using {skills}.",
    "My attention to detail and expertise in {skills} will bring your designs to life with pixel-perfect accuracy.",
    "I've built {projects} responsive web applications that delight users across all devices."
  ],
  'devops': [
    "With my {years} years of DevOps experience and expertise in {skills}, I can optimize your infrastructure for reliability and scale.",
    "I've successfully implemented CI/CD pipelines and cloud solutions for {projects} companies using {skills}.",
    "My focus on automation and best practices will help streamline your development and deployment processes."
  ],
  'data-science': [
    "With expertise in {skills}, I can extract valuable insights from your data to drive business decisions.",
    "I've completed {projects} data science projects, transforming raw data into actionable intelligence.",
    "My background in {skills} and statistical analysis makes me ideal for this data-driven project."
  ],
  'content-writing': [
    "I'm an experienced content writer who crafts engaging, SEO-optimized content tailored to your audience.",
    "With {years} years of writing experience, I deliver compelling content that drives results.",
    "My expertise in creating content for {category} will help achieve your business objectives."
  ],
  'digital-marketing': [
    "I specialize in data-driven digital marketing strategies that maximize ROI across all channels.",
    "With {years} years in digital marketing, I've helped {projects} businesses grow their online presence.",
    "My experience with {skills} will help you reach and engage your target audience effectively."
  ]
};

// Profile summary templates
const summaryTemplates = [
  "Experienced {title} with {years} years of professional experience. Proficient in {skills}. Successfully completed {projects} projects with a {rating}/5 client rating.",
  "Passionate {title} specializing in {skills}. Known for delivering high-quality solutions on time. {projects} successful project completions.",
  "Results-driven {title} with expertise in {skills}. Committed to excellence with a proven track record of {projects} completed projects and {rating}/5 average rating.",
  "Dedicated {title} bringing {years} years of industry experience. Core competencies include {skills}. Consistently rated {rating}/5 by satisfied clients.",
  "Professional {title} with a strong background in {skills}. Completed {projects} projects successfully, maintaining a {rating}/5 client satisfaction rate."
];

// Helper function to fill template
function fillTemplate(template: string, values: Record<string, string>): string {
  let filled = template;
  for (const [key, value] of Object.entries(values)) {
    filled = filled.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }
  return filled;
}

// Simulate AI processing delay
function simulateProcessing(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
}

// Generate project proposal
export async function generateProposal(
  freelancer: FreelancerProfile,
  project: Project
): Promise<string> {
  await simulateProcessing();
  
  const templates = proposalTemplates[project.category] || proposalTemplates['web-development'];
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  const topSkills = freelancer.skills.slice(0, 4).join(', ');
  
  const proposal = fillTemplate(template, {
    skills: topSkills,
    years: freelancer.experience.toString(),
    projects: freelancer.completedProjects.toString(),
    category: project.category.replace('-', ' ')
  });
  
  // Add personalized closing
  const closings = [
    `\n\nI'm excited about the opportunity to work on "${project.title}" and am confident I can exceed your expectations. I'm available to start immediately and can work within your budget of $${project.budget.toLocaleString()}.`,
    `\n\nYour project "${project.title}" aligns perfectly with my skill set and interests. I'd love to discuss how I can contribute to its success within your timeline and budget.`,
    `\n\nI'm eager to bring my expertise to "${project.title}". Let's schedule a call to discuss the details and how I can add value to your project.`
  ];
  
  return proposal + closings[Math.floor(Math.random() * closings.length)];
}

// Generate profile summary
export async function generateProfileSummary(
  freelancer: FreelancerProfile
): Promise<string> {
  await simulateProcessing();
  
  const template = summaryTemplates[Math.floor(Math.random() * summaryTemplates.length)];
  
  const topSkills = freelancer.skills.slice(0, 5).join(', ');
  
  return fillTemplate(template, {
    title: freelancer.title,
    years: freelancer.experience.toString(),
    skills: topSkills,
    projects: freelancer.completedProjects.toString(),
    rating: freelancer.rating.toString()
  });
}

// Generate multiple proposals for different projects
export async function generateBulkProposals(
  freelancer: FreelancerProfile,
  projects: Project[]
): Promise<Array<{ projectId: string; proposal: string }>> {
  const proposals = await Promise.all(
    projects.map(async project => ({
      projectId: project.id,
      proposal: await generateProposal(freelancer, project)
    }))
  );
  
  return proposals;
}

// AI analysis of proposal quality
export function analyzeProposalQuality(proposal: string): {
  score: number;
  strengths: string[];
  suggestions: string[];
} {
  const wordCount = proposal.split(' ').length;
  const hasSkills = proposal.includes('experience') || proposal.includes('expertise');
  const hasCallToAction = proposal.toLowerCase().includes('contact') || proposal.toLowerCase().includes('discuss') || proposal.toLowerCase().includes('schedule');
  
  let score = 50;
  const strengths: string[] = [];
  const suggestions: string[] = [];
  
  if (wordCount >= 100) {
    score += 10;
    strengths.push('Good length - comprehensive proposal');
  } else {
    suggestions.push('Consider adding more details about your approach');
  }
  
  if (hasSkills) {
    score += 15;
    strengths.push('Highlights relevant experience');
  } else {
    suggestions.push('Mention your specific skills and expertise');
  }
  
  if (hasCallToAction) {
    score += 10;
    strengths.push('Includes clear call-to-action');
  } else {
    suggestions.push('Add a call-to-action to encourage client response');
  }
  
  if (proposal.includes('$') || proposal.includes('budget')) {
    score += 5;
    strengths.push('Addresses budget considerations');
  }
  
  score = Math.min(100, score);
  
  return { score, strengths, suggestions };
}

// Model configuration for display
export function getAIModelInfo() {
  return {
    model: 'GPT-4 Inspired',
    version: '1.0.0',
    capabilities: [
      'Proposal Generation',
      'Profile Summary',
      'Content Analysis',
      'Skill Matching'
    ],
    maxTokens: 2000,
    temperature: 0.7,
    lastUpdated: '2026-01-20'
  };
}
