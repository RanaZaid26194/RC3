import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Plus,
  Trash2,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react';
import { ExtractionEvidence } from '@/components/ui/CustomIcons';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { load, save, uid } from '@/lib/storage';
import { extractJobRequirementsUnified } from '@/lib/ai/orchestrator';
import type { Job, SkillRequirement } from '@/types';

export default function NewJobPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [existing] = useState<Job | undefined>(() =>
    id ? load<Job[]>('jobs', []).find((job) => job.id === id) : undefined
  );

  const [title, setTitle] = useState(existing?.title ?? '');
  const [department, setDepartment] = useState(existing?.department ?? 'Engineering');
  const [location, setLocation] = useState(existing?.location ?? 'Remote');
  const [jobType, setJobType] = useState<Job['type']>(existing?.type ?? 'Full-time');
  const [salary, setSalary] = useState(existing?.salary ?? '$115,000 - $145,000');
  const [description, setDescription] = useState(
    existing?.description ??
      'We are looking for a Senior Backend Developer proficient in Python and Django to lead our microservices architecture. Candidates must have solid experience with PostgreSQL database optimization and containerizing services with Docker. 3+ years experience required.'
  );
  const [minExp, setMinExp] = useState(existing?.minExperienceYears ?? 3);
  const [qualification, setQualification] = useState(
    existing?.qualification ?? "Bachelor's in Computer Science or equivalent"
  );
  const [preferredSkillsText, setPreferredSkillsText] = useState(
    (existing?.preferredSkills ?? ['REST APIs', 'Git', 'Agile']).join(', ')
  );

  const [skills, setSkills] = useState<SkillRequirement[]>(
    existing?.requiredSkills ?? [
      { skill: 'Python', weight: 5, required: true, category: 'backend' },
      { skill: 'Django', weight: 5, required: true, category: 'backend' },
      { skill: 'PostgreSQL', weight: 4, required: true, category: 'database' },
      { skill: 'Docker', weight: 4, required: true, category: 'devops' },
    ]
  );

  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillWeight, setNewSkillWeight] = useState(4);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedNotice, setExtractedNotice] = useState<string | null>(null);

  if (id && !existing) {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold text-neutral-900 dark:text-white">
          Vacancy not found
        </h1>
        <p className="text-sm text-neutral-500">
          This vacancy may have been removed. Return to the jobs list to continue.
        </p>
        <Button onClick={() => navigate('/jobs')}>Back to Jobs</Button>
      </div>
    );
  }

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
        if (result.qualification) {
          setQualification(result.qualification);
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

    const preferredSkills = preferredSkillsText
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean);

    const job: Job = {
      id: existing?.id ?? uid('job'),
      title: title.trim(),
      department: department.trim(),
      location: location.trim(),
      type: jobType,
      salary: salary.trim(),
      description: description.trim(),
      status: existing?.status ?? 'open',
      requiredSkills: skills,
      preferredSkills,
      minExperienceYears: minExp,
      qualification: qualification.trim(),
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const existingJobs = load<Job[]>('jobs', []);
    const updated = existing
      ? existingJobs.map((item) => (item.id === existing.id ? job : item))
      : [job, ...existingJobs];
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
            {existing ? 'Edit Vacancy' : 'Create New Vacancy'}
          </h1>
          <p className="text-sm text-neutral-500">
            {existing
              ? 'Update the role parameters, requirements, and scoring weights. Changes apply to new evaluations immediately.'
              : 'Define role parameters, paste job description for AI requirement extraction, and configure skill importance.'}
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

            <div>
              <label
                htmlFor="job-type"
                className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Employment Type
              </label>
              <select
                id="job-type"
                value={jobType}
                onChange={(e) => setJobType(e.target.value as Job['type'])}
                className="h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm text-neutral-900 focus:border-brand-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div>
              <Input
                label="Minimum Experience (years)"
                type="number"
                min={0}
                max={30}
                value={minExp}
                onChange={(e) => setMinExp(Math.max(0, parseInt(e.target.value, 10) || 0))}
              />
            </div>

            <div className="sm:col-span-2">
              <Input
                label="Qualification"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                placeholder="e.g. Bachelor's in Computer Science or equivalent"
              />
            </div>

            <div className="sm:col-span-2">
              <Input
                label="Preferred Skills (comma-separated)"
                value={preferredSkillsText}
                onChange={(e) => setPreferredSkillsText(e.target.value)}
                placeholder="e.g. REST APIs, Git, Agile"
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
              <ExtractionEvidence className="h-4 w-4" />
              {isExtracting ? 'Analyzing...' : 'Extract Requirements with AI'}
            </Button>
          </div>

          <textarea
            aria-label="Job description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-neutral-300 bg-white p-3 text-sm focus:border-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
            placeholder="Paste detailed job description here..."
            required
          />

          {extractedNotice && (
            <div className="flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-xs font-medium text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <ExtractionEvidence className="h-4 w-4 text-blue-600" />
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
                      aria-label={`Weight for ${s.skill}`}
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
                    aria-label={`Remove ${s.skill}`}
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
              aria-label="Add additional skill"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="Add skill (e.g. Redis, GraphQL)..."
              className="flex-1"
            />
            <select
              aria-label="New skill weight"
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
            <CheckCircle className="h-4 w-4" /> {existing ? 'Save Changes' : 'Publish Vacancy'}
          </Button>
        </div>
      </form>
    </div>
  );
}
