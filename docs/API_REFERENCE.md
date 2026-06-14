# API Reference Documentation

## Overview

This document describes the internal APIs and functions used in the AI-Enhanced Freelancer Works Platform.

## 1. ML Matching API (`src/ml/matchPredictor.ts`)

### predictFreelancerJobMatch

Predicts the match score between a freelancer and a project.

```typescript
function predictFreelancerJobMatch(
  freelancer: FreelancerProfile,
  project: Project
): MatchResult
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| freelancer | FreelancerProfile | Freelancer data object |
| project | Project | Project data object |

**Returns:**
```typescript
{
  score: number;      // 0-100 match percentage
  level: string;      // 'Strong Match' | 'Moderate Match' | 'Low Match'
  factors: {
    skillsMatch: number;        // Skills alignment percentage
    experienceRelevance: number; // Experience level match
    ratingScore: number;        // Normalized rating (0-100)
    categoryRelevance: number;  // Category alignment
    technologiesMatch: number;  // Tech stack match
  }
}
```

**Example:**
```typescript
const freelancer = mockFreelancers[0];
const project = mockProjects[0];

const result = predictFreelancerJobMatch(freelancer, project);
console.log(result.score);  // 85
console.log(result.level);  // 'Strong Match'
```

### predictAllFreelancersMatch

Batch prediction for all freelancers against a project.

```typescript
function predictAllFreelancersMatch(
  freelancers: FreelancerProfile[],
  project: Project
): Array<{ freelancer: FreelancerProfile; match: MatchResult }>
```

**Returns:** Sorted array of freelancer-match pairs (highest match first).

### getRecommendedProjects

Get project recommendations for a freelancer.

```typescript
function getRecommendedProjects(
  freelancer: FreelancerProfile,
  projects: Project[]
): Array<{ project: Project; match: MatchResult }>
```

**Returns:** Sorted array of project-match pairs (highest match first).

### getModelMetrics

Returns ML model performance metrics.

```typescript
function getModelMetrics(): {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  trainingSamples: number;
  testSamples: number;
  features: number;
  trees: number;
  maxDepth: number;
  lastTrained: string;
}
```

## 2. AI Content Generation API (`src/ai/contentGenerator.ts`)

### generateProposal

Generates a personalized project proposal.

```typescript
async function generateProposal(
  freelancer: FreelancerProfile,
  project: Project
): Promise<string>
```

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| freelancer | FreelancerProfile | Freelancer data |
| project | Project | Target project |

**Returns:** Generated proposal text.

**Example:**
```typescript
const proposal = await generateProposal(freelancer, project);
console.log(proposal);
// "I have extensive experience in full-stack web development..."
```

### generateProfileSummary

Generates a professional profile summary.

```typescript
async function generateProfileSummary(
  freelancer: FreelancerProfile
): Promise<string>
```

**Returns:** Generated profile summary text.

### analyzeProposalQuality

Analyzes the quality of a generated proposal.

```typescript
function analyzeProposalQuality(proposal: string): {
  score: number;        // 0-100 quality score
  strengths: string[];  // List of strengths
  suggestions: string[]; // Improvement suggestions
}
```

**Example:**
```typescript
const analysis = analyzeProposalQuality(proposal);
console.log(analysis.score);      // 85
console.log(analysis.strengths);  // ['Good length', 'Includes skills']
console.log(analysis.suggestions); // ['Add call-to-action']
```

### getAIModelInfo

Returns information about the AI model.

```typescript
function getAIModelInfo(): {
  model: string;
  version: string;
  capabilities: string[];
  maxTokens: number;
  temperature: number;
  lastUpdated: string;
}
```

## 3. Data Models (`src/types/index.ts`)

### FreelancerProfile

```typescript
interface FreelancerProfile extends User {
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
}
```

### Project

```typescript
interface Project {
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
```

### MatchResult

```typescript
interface MatchResult {
  score: number;
  level: 'Strong Match' | 'Moderate Match' | 'Low Match';
  factors: MatchFactors;
}

interface MatchFactors {
  skillsMatch: number;
  experienceRelevance: number;
  ratingScore: number;
  categoryRelevance: number;
  technologiesMatch: number;
}
```

## 4. Mock Data (`src/data/mockData.ts`)

### Exported Data

```typescript
export const mockFreelancers: FreelancerProfile[];
export const mockClients: ClientProfile[];
export const mockProjects: Project[];
export const mockApplications: Application[];
export const projectCategories: CategoryOption[];
export const allSkills: string[];
```

### Sample Usage

```typescript
import { mockFreelancers, mockProjects } from './data/mockData';

// Get first freelancer
const freelancer = mockFreelancers[0];

// Get all open projects
const openProjects = mockProjects.filter(p => p.status === 'open');

// Get all unique skills
const skills = [...new Set(mockFreelancers.flatMap(f => f.skills))];
```

## 5. Utility Functions

### cn (ClassName Merge)

```typescript
import { cn } from './utils/cn';

// Merges Tailwind classes intelligently
const className = cn(
  'px-4 py-2',
  isActive && 'bg-indigo-600',
  isDisabled && 'opacity-50'
);
```

## 6. Future REST API (Backend Integration)

### Authentication Endpoints

```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Freelancer Endpoints

```
GET    /api/freelancers
GET    /api/freelancers/:id
PUT    /api/freelancers/:id
DELETE /api/freelancers/:id
GET    /api/freelancers/:id/portfolio
POST   /api/freelancers/:id/portfolio
```

### Project Endpoints

```
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
DELETE /api/projects/:id
GET    /api/projects/:id/applications
```

### Application Endpoints

```
POST   /api/applications
GET    /api/applications/:id
PUT    /api/applications/:id
DELETE /api/applications/:id
```

### ML Endpoints

```
POST   /api/ml/match
GET    /api/ml/metrics
POST   /api/ml/batch-match
```

### AI Endpoints

```
POST   /api/ai/generate-proposal
POST   /api/ai/generate-summary
POST   /api/ai/analyze-quality
```

## 7. Error Handling

### API Error Response Format

```typescript
interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| AUTH_001 | Invalid credentials |
| AUTH_002 | Token expired |
| VAL_001 | Invalid input |
| ML_001 | Model prediction failed |
| AI_001 | Content generation failed |
