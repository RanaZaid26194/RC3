import { load, save } from '../storage';
import type { SkillRequirement, InterviewQuestion } from '@/types';

const GEMINI_KEY_STORAGE = 'config:gemini_api_key';

export function getGeminiApiKey(): string {
  const localKey = load<string>(GEMINI_KEY_STORAGE, '');
  if (localKey && localKey.trim().length > 5) return localKey.trim();
  const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
  return envKey ? envKey.trim() : '';
}

export function setGeminiApiKey(key: string): void {
  save(GEMINI_KEY_STORAGE, key.trim());
}

export function hasGeminiApiKey(): boolean {
  return getGeminiApiKey().length > 5;
}

/**
 * Call Gemini API using direct REST (zero external dependencies required)
 */
async function callGemini(prompt: string, systemInstruction?: string): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('No Gemini API Key configured. Using local fallback.');
  }

  // Model cascade: try gemini-2.5-flash / gemini-1.5-flash on v1beta endpoint
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    ...(systemInstruction && {
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
    }),
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 1024,
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API Error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Empty response from Gemini API');
  }
  return text;
}

/**
 * Extract Job Requirements with Gemini, falling back to local extractor
 */
export async function extractJobRequirementsWithAI(description: string): Promise<{
  skills: SkillRequirement[];
  minExperienceYears: number;
  qualification: string;
  isLiveAI: boolean;
}> {
  if (hasGeminiApiKey()) {
    try {
      const prompt = `Analyze this job description and extract requirements as pure JSON.
Job Description:
"""${description}"""

Return ONLY a valid JSON object matching this schema:
{
  "skills": [
    { "skill": "Python", "weight": 5, "required": true, "category": "backend" }
  ],
  "minExperienceYears": 3,
  "qualification": "Bachelor's degree in Computer Science or related"
}
Categories can be: "backend", "frontend", "database", "devops", "general". Weights from 1 to 5.`;

      const raw = await callGemini(prompt, 'You are an expert technical talent recruiter extracting structured requirements.');
      const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      if (parsed.skills && Array.isArray(parsed.skills)) {
        return {
          skills: parsed.skills,
          minExperienceYears: parsed.minExperienceYears || 3,
          qualification: parsed.qualification || "Bachelor's Degree",
          isLiveAI: true,
        };
      }
    } catch (err) {
      console.warn('Gemini extraction failed or offline, switching to deterministic local engine:', err);
    }
  }

  // Deterministic local NLP fallback
  const text = description.toLowerCase();
  const detected: SkillRequirement[] = [];

  const skillDict: Record<string, { weight: number; category: SkillRequirement['category'] }> = {
    python: { weight: 5, category: 'backend' },
    django: { weight: 5, category: 'backend' },
    postgresql: { weight: 4, category: 'database' },
    docker: { weight: 4, category: 'devops' },
    react: { weight: 4, category: 'frontend' },
    typescript: { weight: 4, category: 'frontend' },
    fastapi: { weight: 4, category: 'backend' },
    redis: { weight: 3, category: 'database' },
    kubernetes: { weight: 4, category: 'devops' },
    aws: { weight: 4, category: 'devops' },
  };

  Object.entries(skillDict).forEach(([k, meta]) => {
    if (text.includes(k)) {
      const name = k === 'postgresql' ? 'PostgreSQL' : k.charAt(0).toUpperCase() + k.slice(1);
      detected.push({
        skill: name,
        weight: meta.weight,
        required: true,
        category: meta.category,
      });
    }
  });

  const expMatch = text.match(/(\d+)\+?\s*years?/);
  const minExp = expMatch ? parseInt(expMatch[1], 10) : 3;

  return {
    skills: detected.length > 0 ? detected : [
      { skill: 'Python', weight: 5, required: true, category: 'backend' },
      { skill: 'Django', weight: 5, required: true, category: 'backend' },
      { skill: 'PostgreSQL', weight: 4, required: true, category: 'database' },
      { skill: 'Docker', weight: 4, required: true, category: 'devops' },
    ],
    minExperienceYears: minExp,
    qualification: "Bachelor's in Computer Science or Software Engineering",
    isLiveAI: false,
  };
}

/**
 * Generate 3 difficulty tiers of role questions and candidate-project questions
 */
export async function generateInterviewQuestionsWithAI(
  jobTitle: string,
  candidateName: string,
  candidateProjects: string[]
): Promise<{ questions: InterviewQuestion[]; isLiveAI: boolean }> {
  if (hasGeminiApiKey()) {
    try {
      const prompt = `Generate technical interview questions for:
Role: ${jobTitle}
Candidate: ${candidateName}
Candidate's Verified Projects: ${candidateProjects.join(', ')}

Return ONLY a JSON array with 3 questions (beginner, intermediate, advanced):
[
  {
    "id": "q1",
    "difficulty": "beginner",
    "category": "Core Knowledge",
    "text": "Question here",
    "expectedAnswerGuidelines": "What recruiter should look for",
    "projectContext": "How it links to candidate project"
  }
]`;

      const raw = await callGemini(prompt, 'You are a senior hiring architect drafting structured technical interviews.');
      const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      if (Array.isArray(parsed) && parsed.length > 0) {
        return {
          questions: parsed.map((q: any, i: number) => ({
            id: `gemini_q_${Date.now()}_${i}`,
            difficulty: q.difficulty || (i === 0 ? 'beginner' : i === 1 ? 'intermediate' : 'advanced'),
            category: q.category || 'Technical',
            text: q.text,
            expectedAnswerGuidelines: q.expectedAnswerGuidelines || 'Look for clear architectural rationale and hands-on familiarity.',
            projectContext: q.projectContext || `Anchored in ${candidateProjects[0] || 'candidate experience'}`,
          })),
          isLiveAI: true,
        };
      }
    } catch (err) {
      console.warn('Gemini interview generation fallback to local:', err);
    }
  }

  // High quality local questions generator
  return {
    questions: [
      {
        id: `q_beg_${Date.now()}`,
        difficulty: 'beginner',
        category: 'Language & Framework Fundamentals',
        text: `In ${jobTitle.includes('Backend') ? 'Python/Django' : 'the core stack'}, explain how requests flow from the entrypoint to the database handler.`,
        expectedAnswerGuidelines: 'Candidate should describe routing, view controller/handler, ORM abstraction, and response serialization.',
        projectContext: `Verifies baseline foundational skills for ${candidateName}.`,
      },
      {
        id: `q_int_${Date.now()}`,
        difficulty: 'intermediate',
        category: 'Performance & Database Tuning',
        text: 'How do you detect and resolve N+1 query bottlenecks in relational databases like PostgreSQL?',
        expectedAnswerGuidelines: 'Candidate should mention query profiling, explain analyze, and pre-fetching/eager-loading related records.',
        projectContext: `Relevant to candidate project: ${candidateProjects[0] || 'Enterprise API Development'}.`,
      },
      {
        id: `q_adv_${Date.now()}`,
        difficulty: 'advanced',
        category: 'Systems Architecture & Docker',
        text: 'Explain how you would design a zero-downtime rolling deployment of containerized microservices behind a reverse proxy.',
        expectedAnswerGuidelines: 'Look for health checks, blue/green or canary strategy, graceful connection draining, and backward-compatible schema migrations.',
        projectContext: `Directly assesses ${candidateName}'s verified Docker and microservices credentials.`,
      },
    ],
    isLiveAI: false,
  };
}
