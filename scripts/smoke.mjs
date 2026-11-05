// Journey smoke tests (one function per MUST requirement). Usage: node scripts/smoke.mjs [baseUrl]
// Each step records PASS/FAIL with evidence. Exit code 1 if any FAIL.
import { chromium } from 'playwright';

const base = (process.argv.find((a) => a.startsWith('http')) || 'http://localhost:4173').replace(/\/$/, '');
const results = [];
const step = async (name, fn) => {
  try { await fn(); results.push({ name, ok: true }); console.log('PASS', name); }
  catch (e) { results.push({ name, ok: false, err: e.message }); console.log('FAIL', name, '-', e.message.split('\n')[0]); }
};
const assert = (cond, msg) => { if (!cond) throw new Error(msg); };
const futureDate = (days) => {
  const d = new Date(Date.now() + days * 86_400_000);
  return d.toISOString().split('T')[0];
};

const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
const page = await browser.newPage();
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(String(e)));

const goto = async (hash) => {
  await page.goto(base + '/' + hash, { waitUntil: 'networkidle' });
  // Hash-only navigations can resolve before React commits the new route; wait for the shell.
  await page.locator('main').first().waitFor({ timeout: 8000 });
  await page.waitForTimeout(150);
};

await step('App loads and renders content', async () => {
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  assert((await page.locator('body').innerText()).trim().length > 20, 'blank page');
  // Start every run from a deterministic seeded profile.
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: 'networkidle' });
});
await step('Refresh keeps the app working (persistence smoke)', async () => {
  await page.reload({ waitUntil: 'networkidle' });
  assert((await page.locator('main').count()) > 0, 'main landmark missing');
});
await step('Unknown route shows a friendly 404 (no crash)', async () => {
  await page.goto(base + '/#/does-not-exist', { waitUntil: 'networkidle' });
  assert((await page.locator('body').innerText()).trim().length > 5, 'blank on unknown route');
});

await step('R1 job list shows seeded vacancies', async () => {
  await goto('#/jobs');
  await page.getByText('Senior Backend Developer').first().waitFor({ timeout: 8000 });
  const body = await page.locator('body').innerText();
  assert(body.includes('Senior Backend Developer'), 'seeded vacancy missing');
  assert(/Job Openings/i.test(body), 'jobs heading missing');
});

await step('R2 create job: AI extracts requirements and vacancy persists', async () => {
  await goto('#/jobs/new');
  await page.getByLabel(/Job Title/i).fill('QA Automation Engineer');
  await page.getByRole('button', { name: /Extract Requirements with AI/i }).click();
  await page.getByText(/Extracted \d+ requirements/i).waitFor({ timeout: 8000 });
  await page.getByRole('button', { name: /Publish Vacancy/i }).click();
  await page.waitForURL(/#\/jobs/, { timeout: 8000 });
  await page.waitForTimeout(300);
  assert((await page.locator('body').innerText()).includes('QA Automation Engineer'), 'new vacancy not listed');
  await page.reload({ waitUntil: 'networkidle' });
  assert((await page.locator('body').innerText()).includes('QA Automation Engineer'), 'vacancy lost after refresh');
});

await step('R3 create job: empty title blocks publish', async () => {
  await goto('#/jobs/new');
  await page.getByRole('button', { name: /Publish Vacancy/i }).click();
  await page.waitForTimeout(400);
  assert(/#\/jobs\/new/.test(page.url()), 'publish should be blocked without a title');
});

await step('R2b edit job: existing vacancy updates in place and persists', async () => {
  await goto('#/jobs');
  await page.getByRole('button', { name: 'Edit QA Automation Engineer' }).click();
  await page.waitForURL(/#\/jobs\/.+\/edit/, { timeout: 8000 });
  await page.getByRole('heading', { name: 'Edit Vacancy' }).waitFor({ timeout: 8000 });
  await page.getByLabel(/Job Title/i).fill('QA Automation Engineer II');
  await page.getByRole('button', { name: /Save Changes/i }).click();
  await page.waitForURL(/#\/jobs$/, { timeout: 8000 });
  await page.waitForTimeout(300);
  const body = await page.locator('body').innerText();
  assert(body.includes('QA Automation Engineer II'), 'edited vacancy not listed');
  const jobs = await page.evaluate(() => JSON.parse(localStorage.getItem('app:v1:jobs')));
  assert(jobs.filter((j) => j.title.startsWith('QA Automation Engineer')).length === 1, 'edit created a duplicate vacancy');
  await page.reload({ waitUntil: 'networkidle' });
  assert((await page.locator('body').innerText()).includes('QA Automation Engineer II'), 'edited vacancy lost after refresh');
});

await step('R4 resume intake: TXT parsed, editable, saved and persistent', async () => {
  await goto('#/resumes');
  const resume = [
    'Nia Brooks',
    'nia.brooks@example.com | +1 (312) 555-0188 | Chicago, IL',
    'Senior Backend Engineer with 7 years of experience building Python services.',
    'Skills: Python, Django, PostgreSQL, Docker, Kubernetes, AWS, Redis',
    'Education: B.S. in Computer Science, Northwestern University',
    'Built a distributed payments platform processing 2M requests per day.',
  ].join('\n');
  await page.setInputFiles('input[type="file"]', {
    name: 'nia-brooks.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from(resume, 'utf8'),
  });
  await page.getByText(/Parsed Entities & Candidate Corrections/i).waitFor({ timeout: 8000 });
  const nameValue = await page.getByLabel('Full Name').inputValue();
  assert(nameValue === 'Nia Brooks', `parsed name was "${nameValue}"`);
  const emailValue = await page.getByLabel('Email Address').inputValue();
  assert(emailValue === 'nia.brooks@example.com', `parsed email was "${emailValue}"`);
  const expValue = await page.getByLabel(/Experience \(Years\)/i).inputValue();
  assert(Number(expValue) === 7, `parsed experience was "${expValue}"`);
  await page.getByRole('button', { name: /Save to Candidate Pool/i }).click();
  await page.getByText(/was parsed and saved to the candidate pool/i).waitFor({ timeout: 5000 });
  assert((await page.locator('body').innerText()).includes('Nia Brooks'), 'candidate missing from pool');
  await page.reload({ waitUntil: 'networkidle' });
  assert((await page.locator('body').innerText()).includes('Nia Brooks'), 'candidate lost after refresh');
});

await step('R5 pipeline: ranked scores and stage advance with audit trail', async () => {
  await goto('#/pipeline?jobId=job_backend_101');
  await page.waitForTimeout(300);
  const body = await page.locator('body').innerText();
  assert(body.includes('Alex Rivera') && body.includes('92%'), 'seeded ranked candidates missing');
  const before = await page.evaluate(() => JSON.parse(localStorage.getItem('app:v1:applications'))
    .map((a) => ({ id: a.id, status: a.status, audits: a.auditTrail.length })));
  await page.getByRole('button', { name: /Advance/i }).first().click();
  await page.waitForTimeout(300);
  const after = await page.evaluate(() => JSON.parse(localStorage.getItem('app:v1:applications'))
    .map((a) => ({ id: a.id, status: a.status, audits: a.auditTrail.length })));
  const changed = after.filter((a) => {
    const old = before.find((b) => b.id === a.id);
    return old && old.status !== a.status && a.audits >= old.audits + 1;
  });
  assert(changed.length > 0, 'no application advanced with an audit trail entry');
});

await step('R6 candidate review: evidence, gaps and shortlist action', async () => {
  await goto('#/candidates');
  await page.getByLabel(/Filter Vacancy/i).selectOption('job_backend_101');
  await page.waitForTimeout(300);
  const body = await page.locator('body').innerText();
  assert(/RANKED CANDIDATES/i.test(body), 'ranking heading missing');
  assert(body.includes('Skills Evidence'), 'evidence block missing');
  assert(/Absent/i.test(body), 'skill gap markers missing');
  const shortlist = page.getByRole('button', { name: /^Shortlist$/i }).first();
  await shortlist.click();
  await page.waitForTimeout(300);
  const statuses = await page.evaluate(() => JSON.parse(localStorage.getItem('app:v1:applications'))
    .map((a) => a.status));
  assert(statuses.includes('Shortlisted'), 'shortlist action did not persist');
});

await step('R7 interviews: overlap blocked, free slot confirmed, questions persist', async () => {
  await goto('#/interviews');
  const day = futureDate(3);
  await page.getByRole('button', { name: /Schedule Interview/i }).first().click();
  await page.locator('#sched-date-input').fill(day);
  await page.locator('#sched-time-input').fill('09:00');
  await page.getByRole('button', { name: /Confirm Schedule/i }).click();
  await page.waitForTimeout(400);
  assert(!(await page.locator('[role="dialog"]').count()), 'first interview did not save');

  await page.getByRole('button', { name: /Schedule Interview/i }).first().click();
  await page.locator('#sched-date-input').fill(day);
  await page.locator('#sched-time-input').fill('09:15');
  await page.waitForTimeout(250);
  const dialogText = await page.locator('[role="dialog"]').innerText();
  assert(/conflict/i.test(dialogText), 'overlapping interview not flagged');
  assert(await page.getByRole('button', { name: /Confirm Schedule/i }).isDisabled(), 'confirm enabled during conflict');

  await page.locator('#sched-time-input').fill('10:30');
  await page.waitForTimeout(250);
  assert(!(await page.getByRole('button', { name: /Confirm Schedule/i }).isDisabled()), 'confirm stayed disabled for free slot');
  await page.getByRole('button', { name: /Generate 3-Tier Questions/i }).click();
  await page.getByText(/Successfully generated via/i).waitFor({ timeout: 8000 });

  const dialog = page.locator('[role="dialog"]');
  // R6.3 edit -> save
  await dialog.getByRole('button', { name: 'Edit question' }).first().click();
  const editBox = dialog.getByLabel('Question text');
  await editBox.fill('Edited: walk me through your hardest backend migration.');
  await dialog.getByRole('button', { name: 'Save question' }).click();
  await page.waitForTimeout(200);
  assert((await dialog.innerText()).includes('Edited: walk me through your hardest backend migration.'), 'edited question not saved');

  // R6.3 regenerate one question
  await dialog.getByRole('button', { name: 'Regenerate question' }).nth(1).click();
  await page.waitForFunction(
    () => !document.querySelector('[role="dialog"] button[aria-label="Regenerate question"]:disabled'),
    null,
    { timeout: 10000 }
  );

  // R6.3 remove one question
  await dialog.getByRole('button', { name: 'Remove question' }).nth(2).click();
  await page.waitForTimeout(150);
  assert((await dialog.getByRole('button', { name: 'Remove question' }).count()) === 2, 'remove question did not reduce the list');

  // Restore a full 3-tier set before saving
  await dialog.getByRole('button', { name: /Generate 3-Tier Questions/i }).click();
  await page.waitForTimeout(600);
  assert((await dialog.getByRole('button', { name: 'Remove question' }).count()) === 3, 'regeneration did not restore three questions');
  await page.getByRole('button', { name: /Confirm Schedule/i }).click();
  await page.waitForTimeout(400);
  const saved = await page.evaluate((d) => JSON.parse(localStorage.getItem('app:v1:interviews'))
    .filter((i) => i.scheduledDate === d), day);
  assert(saved.some((i) => i.scheduledTime === '10:30' && i.questions?.length === 3), 'scheduled interview/questions missing');
});

await step('R6.5 final interview decision syncs the application status and audit trail', async () => {
  await goto('#/interviews');
  const scheduledCount = await page.evaluate(
    () => JSON.parse(localStorage.getItem('app:v1:interviews') || '[]').filter((i) => i.status === 'scheduled').length
  );
  assert(scheduledCount > 0, 'no scheduled interview available for feedback');
  await page.getByRole('button', { name: /Record Feedback/i }).first().click();
  await page.getByLabel('Hiring Decision').selectOption('Strong Hire');
  await page.getByRole('button', { name: /Save Evaluation/i }).click();
  await page.waitForTimeout(400);
  const synced = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('app:v1:applications') || '[]').filter((a) =>
      a.auditTrail.some((entry) => /Interview outcome recorded/.test(entry.note || ''))
    )
  );
  assert(synced.length > 0, 'no application received the interview decision');
  assert(synced.some((a) => a.status === 'Selected'), `synced status was "${synced[0].status}"`);
});

await step('R8 portal: resume-fit recommendations, one-click apply creates a scored application', async () => {
  await goto('#/portal');
  const portalText = await page.locator('body').innerText();
  assert(/Your resume fit:/i.test(portalText), 'resume-fit recommendations missing');
  assert(/Best fit/i.test(portalText), 'best-fit marker missing');
  await page.getByRole('button', { name: /1-Click Apply/i }).first().click();
  await page.getByText(/Application successfully submitted for/i).waitFor({ timeout: 5000 });
  const scored = await page.evaluate(() => JSON.parse(localStorage.getItem('app:v1:applications'))
    .some((a) => typeof a.matchScore === 'number' && a.scoreBreakdown));
  assert(scored, 'portal application missing a match score');
  await page.getByRole('button', { name: /My Applications/i }).click();
  assert((await page.locator('body').innerText()).includes('SUBMITTED APPLICATIONS'), 'tracker view missing');
});

await step('R9 analytics: funnel loads and report downloads', async () => {
  await goto('#/analytics');
  const analyticsText = await page.locator('body').innerText();
  assert(/Hiring Conversion Funnel/i.test(analyticsText), 'funnel missing');
  assert(/Pending Reviews/i.test(analyticsText), 'pending reviews KPI missing');
  assert(/interviews scheduled/i.test(analyticsText), 'scheduled interviews KPI detail missing');
  const download = page.waitForEvent('download', { timeout: 8000 });
  await page.getByRole('button', { name: /Export Report/i }).click();
  const file = await download;
  assert(/analytics|report/i.test(file.suggestedFilename()), `unexpected download name: ${file.suggestedFilename()}`);
});

await step('R10 intelligence: natural-language search ranks, duplicates detected, blind mode', async () => {
  await goto('#/intelligence');
  const input = page.getByRole('textbox', { name: /SEMANTIC TALENT QUERY/i });
  await input.fill('Kubernetes and Docker microservices');
  await page.getByRole('button', { name: /Run Search/i }).click();
  await page.waitForTimeout(300);
  const body = await page.locator('body').innerText();
  assert(/SEMANTIC TALENT RESULTS/i.test(body), 'results section missing');
  assert(/% concept match/.test(body), 'concept match badges missing');
  await goto('#/intelligence?q=Kubernetes%20Docker');
  assert(
    (await page.getByRole('textbox', { name: /SEMANTIC TALENT QUERY/i }).inputValue()) === 'Kubernetes Docker',
    'talent-pool deep link did not preset the query'
  );
  await page.getByRole('button', { name: /Enable Blind Evaluation/i }).click();
  await page.waitForTimeout(200);
  assert(/Candidate #1 \(Anonymous\)/.test(await page.locator('body').innerText()), 'blind mode did not anonymize identities');
});

await step('R12 accounts: register, sign out, survive demo reset, and log back in', async () => {
  const email = `smoke.${Date.now()}@example.com`;
  const password = 'testpass123';
  await goto('#/register');
  await page.getByLabel(/Full Name/i).fill('Smoke Tester');
  await page.getByLabel(/Work Email Address/i).fill(email);
  await page.getByLabel(/^Password/i).fill(password);
  await page.getByLabel(/Confirm Password/i).fill(password);
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: /Create Account/i }).click();
  await page.waitForURL(/#\/portal/, { timeout: 8000 });

  const storedAfterRegister = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('app:v1:auth:users') || '[]').map((u) => u.email)
  );
  assert(storedAfterRegister.includes(email), 'registered account was not persisted');

  await page.getByRole('button', { name: /^Sign Out$/ }).first().click();
  await page.waitForURL(/#\/login/, { timeout: 8000 });
  await page.getByLabel(/Work Email Address/i).fill(email);
  await page.getByLabel(/^Password/i).fill(password);
  await page.getByRole('button', { name: /^Sign In/i }).click();
  await page.waitForURL(/#\/portal/, { timeout: 8000 });

  await goto('#/settings');
  await page.locator('#main').getByRole('button', { name: /Reset Demo Data/i }).click();
  await page.getByRole('button', { name: /^Reset$/ }).click();
  await page.waitForTimeout(1500);

  const storedAfterReset = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('app:v1:auth:users') || '[]').map((u) => u.email)
  );
  assert(storedAfterReset.includes(email), 'demo reset deleted the registered account');

  await goto('#/login');
  await page.getByLabel(/Work Email Address/i).fill(email);
  await page.getByLabel(/^Password/i).fill(password);
  await page.getByRole('button', { name: /^Sign In/i }).click();
  await page.waitForURL(/#\/portal/, { timeout: 8000 });

  // Restore the recruiter session for the remaining route checks
  await page.evaluate(() => {
    const users = JSON.parse(localStorage.getItem('app:v1:auth:users') || '[]');
    const recruiter = users.find((u) => u.role === 'recruiter');
    localStorage.setItem('app:v1:auth:current_user', JSON.stringify({
      id: recruiter.id, name: recruiter.name, email: recruiter.email, role: recruiter.role,
    }));
  });
});

await step('R11 no horizontal overflow at 375px on primary routes', async () => {
  await page.setViewportSize({ width: 375, height: 812 });
  for (const route of ['#/jobs', '#/pipeline', '#/candidates', '#/interviews', '#/analytics', '#/resumes', '#/intelligence']) {
    await goto(route);
    await page.waitForTimeout(200);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert(overflow <= 2, `${route} overflows horizontally by ${overflow}px`);
  }
  await page.setViewportSize({ width: 1280, height: 800 });
});

await step('No console errors during the run', async () => { assert(errors.length === 0, errors.slice(0, 3).join(' | ')); });
await browser.close();
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
