import { hasGroqApiKey, callGroq } from './groq';
import { hasGeminiApiKey, extractJobRequirementsWithAI as extractGemini, generateInterviewQuestionsWithAI as generateGemini } from './gemini';
import type { SkillRequirement, InterviewQuestion } from '@/types';

export interface AIExtractionResult {
  skills: SkillRequirement[];
  minExperienceYears: number;
  qualification: string;
  provider: 'Groq (LPU Speed)' | 'Google Gemini' | 'Local NLP Engine';
}

export interface AIQuestionResult {
  questions: InterviewQuestion[];
  provider: 'Groq (LPU Speed)' | 'Google Gemini' | 'Local NLP Engine';
}

/**
 * High-speed job requirement extraction
 * Prioritizes Groq for near-instant inference, then Gemini, then local NLP engine.
 */
export async function extractJobRequirementsUnified(description: string): Promise<AIExtractionResult> {
  // 1. Try Groq (Fastest: ~200-400ms)
  if (hasGroqApiKey()) {
    try {
      const prompt = `Analyze this job description and return ONLY valid JSON matching this schema:
{
  "skills": [
    { "skill": "Python", "weight": 5, "required": true, "category": "backend" }
  ],
  "minExperienceYears": 3,
  "qualification": "Bachelor's degree in Computer Science or related"
}

Job Description:
"""${description}"""`;

      const raw = await callGroq(prompt, 'You are an expert technical talent recruiter extracting structured requirements as strict JSON.');
      const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      if (parsed.skills && Array.isArray(parsed.skills)) {
        return {
          skills: parsed.skills,
          minExperienceYears: parsed.minExperienceYears || 3,
          qualification: parsed.qualification || "Bachelor's Degree",
          provider: 'Groq (LPU Speed)',
        };
      }
    } catch (err) {
      console.warn('Groq extraction failed, falling back to Gemini:', err);
    }
  }

  // 2. Try Gemini
  if (hasGeminiApiKey()) {
    try {
      const res = await extractGemini(description);
      if (res.isLiveAI) {
        return {
          skills: res.skills,
          minExperienceYears: res.minExperienceYears,
          qualification: res.qualification,
          provider: 'Google Gemini',
        };
      }
    } catch (err) {
      console.warn('Gemini extraction failed, falling back to local engine:', err);
    }
  }

  // 3. Deterministic Local NLP Fallback
  const res = await extractGemini(description);
  return {
    skills: res.skills,
    minExperienceYears: res.minExperienceYears,
    qualification: res.qualification,
    provider: 'Local NLP Engine',
  };
}

/**
 * Fast interview question generation
 * Prioritizes Groq for instant generation, then Gemini, then local templates.
 */
export async function generateInterviewQuestionsUnified(
  jobTitle: string,
  candidateName: string,
  candidateProjects: string[]
): Promise<AIQuestionResult> {
  // 1. Try Groq
  if (hasGroqApiKey()) {
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

      const raw = await callGroq(prompt, 'You are a senior hiring architect drafting structured technical interviews in strict JSON.');
      const cleaned = raw.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      if (Array.isArray(parsed) && parsed.length > 0) {
        return {
          questions: parsed.map((q: any, i: number) => ({
            id: `groq_q_${Date.now()}_${i}`,
            difficulty: q.difficulty || (i === 0 ? 'beginner' : i === 1 ? 'intermediate' : 'advanced'),
            category: q.category || 'Technical',
            text: q.text,
            expectedAnswerGuidelines: q.expectedAnswerGuidelines || 'Look for clear architectural rationale and hands-on familiarity.',
            projectContext: q.projectContext || `Anchored in ${candidateProjects[0] || 'candidate experience'}`,
          })),
          provider: 'Groq (LPU Speed)',
        };
      }
    } catch (err) {
      console.warn('Groq question generation failed, falling back to Gemini:', err);
    }
  }

  // 2. Try Gemini
  if (hasGeminiApiKey()) {
    try {
      const res = await generateGemini(jobTitle, candidateName, candidateProjects);
      if (res.isLiveAI) {
        return {
          questions: res.questions,
          provider: 'Google Gemini',
        };
      }
    } catch (err) {
      console.warn('Gemini question generation fallback to local:', err);
    }
  }

  // 3. Local templates
  const res = await generateGemini(jobTitle, candidateName, candidateProjects);
  return {
    questions: res.questions,
    provider: 'Local NLP Engine',
  };
}
