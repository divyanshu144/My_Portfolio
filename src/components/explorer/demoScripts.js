// Illustrative example runs for the Overview's System explorer. The values (questions, prices, names)
// are made-up example data and the UI labels them as such; stage, tool and field names follow the
// real repositories. The full step descriptions stay in data/portfolioData.json.
//
// A run is a list of beats. Each beat belongs to one workflow stage (`step`, an index into the
// project's caseStudy.workflow) and may add:
//   front:   items for the "what the user sees" panel (they accumulate across beats)
//   pending: show a typing/working indicator after this beat's items
//   readout: one short line of what happened behind the scenes, shown on its stage
//   tone:    'fail' or 'ok' to colour the readout (used by the deeper runs)
//   trace:   log lines for the deeper runs' trace panel ({ src, text, tone })

export const DEMO_ORDER = ['DocChat', 'JobFit', 'SuperOps']

export const demoScripts = {
  DocChat: {
    window: 'DocChat · 3 sources',
    beats: [
      {
        step: 0,
        front: [
          { type: 'chips', items: ['tenancy-agreement.pdf', 'deposit-guide (web)', 'landlord Q&A (YouTube)'] },
          { type: 'msg', from: 'user', text: 'Can my landlord keep the deposit to repaint the flat?' },
        ],
        pending: true,
        readout: 'planner picks sources · rewrites query',
      },
      {
        step: 1,
        front: [
          { type: 'passage', text: '…normal wear and tear is not chargeable…' },
          { type: 'passage', text: '…deductions must be backed by the check-in inventory…' },
        ],
        pending: true,
        readout: 'dense search → overlap rerank → top passages',
      },
      {
        step: 2,
        front: [{ type: 'note', text: 'checking the answer against the sources…' }],
        pending: true,
        readout: 'draft · grounding · critic',
      },
      {
        step: 3,
        front: [
          { type: 'msg', from: 'app', text: 'Usually not. Repainting after normal wear and tear isn’t a valid deduction, unless the check-in inventory shows the walls were in better condition.' },
          { type: 'sources', items: ['PDF — tenancy-agreement.pdf', 'Web — deposit-guide'] },
        ],
        readout: 'answer + Sources section',
      },
    ],
  },
  JobFit: {
    window: 'JobFit · new analysis',
    beats: [
      {
        step: 0,
        front: [
          { type: 'chips', items: ['ML Engineer · job description', 'Saved profile'] },
          { type: 'msg', from: 'user', text: 'Analyse this role against my profile.' },
        ],
        pending: true,
        readout: 'job description + saved profile loaded',
      },
      {
        step: 1,
        front: [
          { type: 'score', value: 78, label: 'Match' },
          { type: 'note', text: 'gaps: Kubernetes · model monitoring' },
        ],
        pending: true,
        readout: 'job_parser → match_scorer → gap_analyst',
      },
      {
        step: 2,
        front: [{ type: 'checklist', items: ['Learning resources', 'Cover letter', 'Tailored resume'] }],
        pending: true,
        readout: 'resource_planner · cover_letter ∥ resume_tailorer',
      },
      {
        step: 3,
        front: [{ type: 'msg', from: 'app', text: 'Analysis saved. Cover letter and tailored resume are ready to review and export.' }],
        readout: 'progress streamed · saved to analyses',
      },
    ],
  },
  SuperOps: {
    window: 'Sharma Kirana · Telegram',
    beats: [
      {
        step: 0,
        front: [{ type: 'msg', from: 'user', text: '2 packets rice 5kg for Ramesh, on khata' }],
        pending: true,
        readout: 'store taken from the verified chat',
      },
      {
        step: 1,
        front: [{ type: 'note', text: 'open_bill · add_bill_item' }],
        pending: true,
        readout: 'rice 5kg · ₹420.00 · 18 in stock',
      },
      {
        step: 2,
        front: [],
        pending: true,
        readout: 'finalize_bill · stock 18→16 · khata +₹840 · COMMIT',
      },
      {
        step: 3,
        front: [{ type: 'msg', from: 'app', text: '🧾 Bill #1043 · 2 × Rice 5kg · ₹840. Added to Ramesh’s khata (now ₹2,090). Stock left: 16.' }],
        readout: 'bill sent · each tool call has an idempotency key',
      },
    ],
  },
}
