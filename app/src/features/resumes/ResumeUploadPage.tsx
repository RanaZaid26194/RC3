import { useState } from 'react';
import { Upload, FileText, User, MapPin, GraduationCap, Briefcase, Code, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { load } from '@/lib/storage';
import type { CandidateProfile } from '@/types';
import { SEED_CANDIDATES } from '@/data/seed.b';

const skillSynonyms: Record<string, string[]> = {
  javascript: ['js', 'es6', 'ecmascript'],
  typescript: ['ts'],
  react: ['react.js', 'reactjs'],
  node: ['nodejs', 'node.js'],
  python: ['py'],
  java: [],
  go: ['golang'],
  rust: [],
  aws: ['amazon web services', 'amazon web service'],
  gcp: ['google cloud platform', 'google cloud'],
  azure: ['microsoft azure'],
};

function normalizeSkill(skill: string): string {
  const normalized = skill.toLowerCase().trim();
  for (const [canonical, aliases] of Object.entries(skillSynonyms)) {
    if (normalized === canonical || aliases.includes(normalized)) {
      return canonical;
    }
  }
  return normalized;
}

export default function ResumeUploadPage() {
  const candidates = load<CandidateProfile[]>('candidates', []);
  const seedCandidates = SEED_CANDIDATES;
  const allCandidates = [...candidates, ...seedCandidates];
  const [parsedName, setParsedName] = useState('');
  const [parsedEmail, setParsedEmail] = useState('');
  const [parsedSkills, setParsedSkills] = useState<string[]>([]);
  const [parsedExp, setParsedExp] = useState<number>(0);
  const [parsedLoc, setParsedLoc] = useState('');
  const [parsedSum, setParsedSum] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);

    // Simulate PDF parsing with mock data
    setTimeout(() => {
      const randomCandidate = seedCandidates[Math.floor(Math.random() * seedCandidates.length)];
      setParsedName(randomCandidate.name);
      setParsedEmail(randomCandidate.email);
      setParsedSkills(randomCandidate.skills.map(normalizeSkill));
      setParsedExp(randomCandidate.experienceYears);
      setParsedLoc(randomCandidate.location);
      setParsedSum(randomCandidate.summary);
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Resume Upload & Parsing
        </h1>
        <p className="text-sm text-neutral-500">
          Upload candidate resumes (PDF), auto-extract fields, and validate before submission.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload Section */}
        <Card className="p-6 space-y-4">
          <h2 className="font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
            <Upload className="h-5 w-5" /> Upload Resume
          </h2>
          <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              aria-label="Upload resume"
              onChange={handleFileUpload}
              className="hidden"
              id="resume-upload"
            />
            <label htmlFor="resume-upload" className="cursor-pointer">
              <FileText className="h-10 w-10 mx-auto text-neutral-400 mb-3" />
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Click to upload or drag & drop a resume (PDF, DOC, DOCX)
              </p>
              <p className="text-xs text-neutral-500 mt-1">Max file size: 5MB</p>
            </label>
          </div>

          {loading && (
            <div className="flex items-center justify-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
              Parsing resume...
            </div>
          )}
        </Card>

        {/* Parsed Fields Section */}
        <Card className="p-6 space-y-4">
          <h2 className="font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" /> Extracted Fields
          </h2>

          <div className="space-y-3">
            {parsedName && (
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 mt-0.5 text-blue-500" />
                <div className="flex-1">
                  <label className="text-xs text-neutral-500">Full Name</label>
                  <p className="font-medium text-neutral-900 dark:text-white">{parsedName}</p>
                </div>
              </div>
            )}

            {parsedEmail && (
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 mt-0.5 text-blue-500" />
                <div className="flex-1">
                  <label className="text-xs text-neutral-500">Email</label>
                  <p className="font-medium text-neutral-900 dark:text-white">{parsedEmail}</p>
                </div>
              </div>
            )}

            {parsedSkills.length > 0 && (
              <div className="flex items-start gap-3">
                <Code className="h-5 w-5 mt-0.5 text-blue-500" />
                <div className="flex-1">
                  <label className="text-xs text-neutral-500">Skills (Normalized)</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {parsedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/60 dark:text-blue-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {parsedExp > 0 && (
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 mt-0.5 text-blue-500" />
                <div className="flex-1">
                  <label className="text-xs text-neutral-500">Experience</label>
                  <p className="font-medium text-neutral-900 dark:text-white">{parsedExp} years</p>
                </div>
              </div>
            )}

            {parsedLoc && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-0.5 text-blue-500" />
                <div className="flex-1">
                  <label className="text-xs text-neutral-500">Location</label>
                  <p className="font-medium text-neutral-900 dark:text-white">{parsedLoc}</p>
                </div>
              </div>
            )}

            {parsedSum && (
              <div className="flex items-start gap-3">
                <GraduationCap className="h-5 w-5 mt-0.5 text-blue-500" />
                <div className="flex-1">
                  <label className="text-xs text-neutral-500">Professional Summary</label>
                  <p className="text-sm text-neutral-700 dark:text-neutral-300 italic">{parsedSum}</p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Candidate List */}
      <Card className="p-6">
        <h2 className="font-semibold text-neutral-900 dark:text-white mb-4">Recent Candidates</h2>
        {allCandidates.length === 0 ? (
          <p className="text-sm text-neutral-500">No candidates uploaded yet.</p>
        ) : (
          <div className="space-y-3">
            {allCandidates.slice(0, 5).map((candidate) => (
              <div
                key={candidate.id}
                className="flex items-center justify-between border-b border-neutral-200 pb-3 dark:border-neutral-800 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                    {candidate.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-white">{candidate.name}</p>
                    <p className="text-xs text-neutral-500">{candidate.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-neutral-700 dark:text-neutral-300">
                    {candidate.experienceYears} yrs • {candidate.skills.length} skills
                  </p>
                  <p className="text-xs text-neutral-500">{candidate.location}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
