import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Plus,
  Trash2,
  CheckCircle,
  ArrowLeft,
  Wand2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { load, save, uid } from '@/lib/storage';
import { extractJobRequirementsUnified } from '@/lib/ai/orchestrator';
import type { Job, SkillRequirement } from '@/types';

export default function NewJobPage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [location, setLocation] = useState('Remote');
  const [salary, setSalary] = useState('$115,000 - $145,000');
  const [description, setDescription] = useState(
    'We are looking for a Senior Backend Developer proficient in Python and Django to lead our microservices architecture. Candidates must have solid experience with PostgreSQL database optimization and containerizing services with Docker. 3+ years experience required.'
  );
  const [minExp, setMinExp] = useState(3);
  const [qualification] = useState("Bachelor's in Computer Science or equivalent");

  const [skills, setSkills] = useState<SkillRequirement[]>([
    { skill: 'Python', weight: 5, required: true, category: 'backend' },
    { skill: 'Django', weight: 5, required: true, category: 'backend' },
    { skill: 'PostgreSQL', weight: 4, required: true, category: 'database' },
    { skill: 'Docker', weight: 4, required: true, category: 'devops' },
  ]);

  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillWeight, setNewSkillWeight] = useState(4);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedNotice, setExtractedNotice] = useState<string | null>(null);

  // AI Extraction logic from free-text description
  const handleAIExtract = async () => {
    if (!description.trim()) return;
    setIsExtracting(true);
    try {
      const result = await extractJobRequirementsUnified(description);
      if (result.skills && result.skills.length > 0) {
        setSkills(result.skills);
        if (result.minExperienceYears) {
          setMinExp(result.minExperienceYears);
        }
        setExtractedNotice(
          `Extracted ${result.skills.length} requirements and ${result.minExperienceYears || 3} years experience via ${result.provider}!`
        );
      } else {
        setExtractedNotice('No structured skills detected. You can add them manually below.');
      }
    } catch (err) {
      console.error('Extraction error:', err);
      setExtractedNotice('Extraction encountered an issue, fallback completed.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    setSkills([
      ...skills,
      {
        skill: newSkillName.trim(),
        weight: newSkillWeight,
        required: true,
        category: 'backend',
      },
    ]);
    setNewSkillName('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s.skill !== skillToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newJob: Job = {
      id: uid('job'),
      title: title.trim(),
      department,
      location,
      type: 'Full-time',
      salary,
      description,
      status: 'open',
      requiredSkills: skills,
      preferredSkills: ['REST APIs', 'Git', 'Agile'],
      minExperienceYears: minExp,
      qualification,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const existingJobs = load<Job[]>('jobs', []);
    const updated = [newJob, ...existingJobs];
    save('jobs', updated);
    navigate('/jobs');
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/jobs')} className="gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to Jobs
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Create New Vacancy
          </h1>
          <p className="text-sm text-neutral-500">
            Define role parameters, paste job description for AI requirement extraction, and configure skill importance.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 space-y-4">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
            Role Overview
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Input
                label="Job Title *"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Backend Developer"
                required
              />
            </div>

            <div>
              <Input
                label="Department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Engineering"
              />
            </div>

            <div>
              <Input
                label="Location & Workplace Type"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Remote / Hybrid"
              />
            </div>

            <div>
              <Input
                label="Salary Range"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="e.g. $110,000 - $140,000"
              />
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
                Job Description & AI Extractor
              </h2>
              <p className="text-xs text-neutral-500">
                Paste natural language job description. The AI engine parses skills, weights, and minimum experience.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAIExtract}
              disabled={isExtracting}
              className="gap-2 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800"
            >
              <Wand2 className="h-4 w-4" />
              {isExtracting ? 'Analyzing...' : 'Extract Requirements with AI'}
            </Button>
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-neutral-300 bg-white p-3 text-sm focus:border-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
            placeholder="Paste detailed job description here..."
            required
          />

          {extractedNotice && (
            <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-xs font-medium text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <Sparkles className="h-4 w-4 text-blue-600" />
              {extractedNotice}
            </div>
          )}
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
            Skill Importance & Criteria
          </h2>

          <div className="space-y-2">
            {skills.map((s) => (
              <div
                key={s.skill}
                className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-800/50"
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-neutral-900 dark:text-white">
                    {s.skill}
                  </span>
                  <span className="rounded bg-neutral-200 px-2 py-0.5 text-[10px] uppercase font-bold text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300">
                    {s.category || 'skill'}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-neutral-500">Weight:</span>
                    <select
                      value={s.weight}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setSkills(skills.map(item => item.skill === s.skill ? { ...item, weight: val } : item));
                      }}
                      className="rounded border border-neutral-300 bg-white px-2 py-1 text-xs dark:border-neutral-700 dark:bg-neutral-900"
                    >
                      <option value={5}>5 (Critical / Required)</option>
                      <option value={4}>4 (High Importance)</option>
                      <option value={3}>3 (Medium)</option>
                      <option value={2}>2 (Low)</option>
                      <option value={1}>1 (Optional)</option>
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(s.skill)}
                    className="text-neutral-400 hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Input
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="Add skill (e.g. Redis, GraphQL)..."
              className="flex-1"
            />
            <select
              value={newSkillWeight}
              onChange={(e) => setNewSkillWeight(parseInt(e.target.value, 10))}
              className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            >
              <option value={5}>Weight 5</option>
              <option value={4}>Weight 4</option>
              <option value={3}>Weight 3</option>
              <option value={2}>Weight 2</option>
            </select>
            <Button type="button" variant="outline" onClick={handleAddSkill}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => navigate('/jobs')}>
            Cancel
          </Button>
          <Button type="submit" className="gap-2">
            <CheckCircle className="h-4 w-4" /> Publish Vacancy
          </Button>
        </div>
      </form>
    </div>
  );
}
