import { useRef, useState } from 'react';
import { FileText, Upload, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, Badge } from '@/components/ui/Card';
import { load, save, uid } from '@/lib/storage';
import type { CandidateProfile } from '@/types';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const SKILL_ALIASES: Record<string, string> = {
  python: 'Python',
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  react: 'React',
  node: 'Node.js',
  nodejs: 'Node.js',
  fastapi: 'FastAPI',
  django: 'Django',
  docker: 'Docker',
  kubernetes: 'Kubernetes',
  postgresql: 'PostgreSQL',
  postgres: 'PostgreSQL',
  redis: 'Redis',
  graphql: 'GraphQL',
  aws: 'AWS',
  sql: 'SQL',
};

function extractPdfText(buffer: ArrayBuffer) {
  const decoded = new TextDecoder('latin1').decode(buffer);
  return decoded
    .replace(/\\\(([^)]*)\\\)/g, '$1 ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[^\x20-\x7E\n]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseResume(text: string, fileName: string): CandidateProfile {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const firstName = lines.find((line) => /^[A-Z][A-Z .'-]{3,}$/.test(line));
  const name = firstName || fileName.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ') || 'Imported Candidate';
  const email = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/)?.[0] || '';
  const phone = text.match(/(?:\+?\d[\d ()-]{7,}\d)/)?.[0]?.trim() || '';
  const normalizedText = text.toLowerCase();
  const skills = Object.entries(SKILL_ALIASES)
    .filter(([alias]) => new RegExp(`\\b${alias}\\b`, 'i').test(normalizedText))
    .map(([, label]) => label)
    .filter((skill, index, list) => list.indexOf(skill) === index);
  const summary = lines.find((line) => /experience|engineer|developer|specialist|professional/i.test(line)) || lines.slice(1, 3).join(' ');
  const projectLines = lines.filter((line) => /project|built|developed|implemented|platform/i.test(line)).slice(0, 3);
  const projects = projectLines.map((description, index) => ({
    id: uid('project'),
    name: `Resume project ${index + 1}`,
    description,
    techStack: skills.slice(0, 4),
  }));
  const excerpts = Object.fromEntries(skills.map((skill) => {
    const line = lines.find((candidateLine) => candidateLine.toLowerCase().includes(skill.toLowerCase())) || skill;
    return [skill, line];
  }));

  return {
    id: uid('cand'),
    name,
    email,
    phone,
    location: '',
    summary: summary || 'Imported resume awaiting recruiter review.',
    skills,
    experienceYears: Number(text.match(/(\d+)\+?\s+years?/i)?.[1] || 0),
    education: lines.find((line) => /university|college|bachelor|master|phd/i.test(line)) || '',
    projects,
    rawResumeText: text,
    excerpts,
    createdAt: new Date().toISOString(),
  };
}

async function readFile(file: File) {
  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    return extractPdfText(await file.arrayBuffer());
  }
  return file.text();
}

export default function ResumesPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [candidates, setCandidates] = useState<CandidateProfile[]>(() => load<CandidateProfile[]>('candidates', []));
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [status, setStatus] = useState<{ tone: 'success' | 'danger'; message: string } | null>(null);
  const [isParsing, setIsParsing] = useState(false);

  const handleFile = async (file?: File) => {
    if (!file) return;
    setStatus(null);
    if (file.size > MAX_FILE_SIZE) {
      setStatus({ tone: 'danger', message: 'Resume files must be smaller than 5 MB.' });
      return;
    }
    if (!/\.(pdf|txt|md)$/i.test(file.name)) {
      setStatus({ tone: 'danger', message: 'Upload a PDF, TXT, or Markdown resume.' });
      return;
    }

    setSelectedFile(file.name);
    setIsParsing(true);
    try {
      const text = (await readFile(file)).trim();
      if (!text) throw new Error('No readable text was found in that file.');
      const candidate = parseResume(text, file.name);
      const updated = [candidate, ...candidates];
      setCandidates(updated);
      save('candidates', updated);
      setStatus({ tone: 'success', message: `${candidate.name} was parsed and added to the candidate pool.` });
    } catch (error) {
      setStatus({ tone: 'danger', message: error instanceof Error ? error.message : 'Resume parsing failed.' });
    } finally {
      setIsParsing(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removeCandidate = (id: string) => {
    const updated = candidates.filter((candidate) => candidate.id !== id);
    setCandidates(updated);
    save('candidates', updated);
    setStatus({ tone: 'success', message: 'Candidate removed from the imported resume list.' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">Resume Intake</h1>
        <p className="text-sm text-neutral-500">Upload resumes for local parsing, normalized skills, and evidence-backed candidate profiles.</p>
      </div>

      <Card className="border-dashed p-6">
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <div className="rounded-full bg-blue-50 p-3 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"><Upload className="h-5 w-5" /></div>
          <div>
            <h2 className="font-semibold text-neutral-900 dark:text-white">Add a resume</h2>
            <p className="mt-1 text-xs text-neutral-500">PDF, TXT, or Markdown up to 5 MB. Parsing stays in this browser.</p>
          </div>
          <input
            ref={inputRef}
            aria-label="Upload resume file"
            className="sr-only"
            type="file"
            accept=".pdf,.txt,.md,application/pdf,text/plain,text/markdown"
            onChange={(event) => void handleFile(event.target.files?.[0])}
          />
          <Button type="button" onClick={() => inputRef.current?.click()} loading={isParsing} className="gap-2"><Upload className="h-4 w-4" /> Choose resume</Button>
          {selectedFile && <p className="text-xs text-neutral-500">Selected: {selectedFile}</p>}
        </div>
      </Card>

      {status && (
        <div className={`flex items-center gap-2 rounded-md border p-3 text-sm ${status.tone === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' : 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300'}`} role="status">
          {status.tone === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {status.message}
        </div>
      )}

      <section className="space-y-3" aria-labelledby="imported-resumes-heading">
        <div className="flex items-center justify-between"><h2 id="imported-resumes-heading" className="text-sm font-semibold uppercase tracking-wider text-neutral-500">Imported candidates ({candidates.length})</h2></div>
        {candidates.length === 0 ? (
          <Card className="p-8 text-center text-sm text-neutral-500"><FileText className="mx-auto mb-2 h-8 w-8 text-neutral-400" />No imported resumes yet.</Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {candidates.map((candidate) => (
              <Card key={candidate.id} className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-neutral-900 dark:text-white">{candidate.name}</h3><p className="text-xs text-neutral-500">{candidate.email || 'Email not detected'}{candidate.experienceYears ? ` • ${candidate.experienceYears} years experience` : ''}</p></div><button type="button" aria-label={`Remove ${candidate.name}`} title="Remove candidate" className="rounded p-1 text-neutral-400 hover:bg-red-50 hover:text-red-600" onClick={() => removeCandidate(candidate.id)}><Trash2 className="h-4 w-4" /></button></div>
                <p className="line-clamp-2 text-sm text-neutral-600 dark:text-neutral-300">{candidate.summary}</p>
                <div className="flex flex-wrap gap-1.5">{candidate.skills.length ? candidate.skills.map((skill) => <Badge key={skill} tone="info">{skill}</Badge>) : <span className="text-xs text-neutral-500">No known skills detected</span>}</div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
