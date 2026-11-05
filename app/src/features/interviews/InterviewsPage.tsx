import { Calendar, Plus, Clock, Video } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { load } from '@/lib/storage';
import type { Interview } from '@/types';

export default function InterviewsPage() {
  const interviews = load<Interview[]>('interviews', []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Interview Schedules & Question Generation
          </h1>
          <p className="text-sm text-neutral-500">
            Schedule candidate interviews, avoid calendar conflicts, and review AI-generated role questions.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Schedule Interview
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {interviews.map((intv) => (
          <Card key={intv.id} className="p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                  {intv.interviewType}
                </span>
                <h3 className="mt-2 font-semibold text-neutral-900 dark:text-white">
                  {intv.candidateName}
                </h3>
                <p className="text-xs text-neutral-500">{intv.jobTitle}</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 dark:bg-neutral-800">
                <Video className="h-4 w-4" />
              </div>
            </div>

            <div className="border-t border-neutral-100 pt-3 text-xs text-neutral-600 dark:border-neutral-800 dark:text-neutral-400 space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-neutral-400" />
                <span>{intv.scheduledDate} at {intv.scheduledTime} ({intv.durationMinutes} min)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-neutral-400" />
                <span>Interviewer: {intv.interviewer}</span>
              </div>
            </div>

            <div className="border-t border-neutral-100 pt-3 text-xs dark:border-neutral-800">
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                Prepared Questions ({intv.questions.length}):
              </span>
              <ul className="mt-1 space-y-1 text-neutral-500 list-disc list-inside">
                {intv.questions.slice(0, 2).map((q) => (
                  <li key={q.id} className="truncate">{q.text}</li>
                ))}
              </ul>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
