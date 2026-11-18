// Deeper example runs for the Projects page case studies, including one failure and its recovery.
// Same format as demoScripts.js. Values are made-up example data; the stage, agent, event, tool and
// field names come from the real repositories (DocChat, Job_Agent, supermarket-ops-agent).

export const deepScripts = {
  DocChat: {
    window: 'DocChat · 3 sources',
    beats: [
      {
        step: 0,
        front: [
          { type: 'chips', items: ['tenancy-agreement.pdf', 'deposit-guide (web)'] },
          { type: 'msg', from: 'user', text: 'Can my landlord keep the deposit to repaint, and what about the poster marks?' },
        ],
        pending: true,
        readout: 'planner → sources_to_use: pdf, web',
        trace: [
          { src: 'planner', text: 'sources_to_use=["pdf","web"]' },
          { src: 'planner', text: 'rewritten_query="deposit deduction repainting wear and tear"' },
        ],
      },
      {
        step: 1,
        front: [
          { type: 'passage', text: '…normal wear and tear is not chargeable…' },
          { type: 'passage', text: '…deductions must be backed by the check-in inventory…' },
        ],
        pending: true,
        readout: '12 chunks after overlap rerank',
        trace: [
          { src: 'retriever', text: 'dense search · min_score=0.3 · 8 per source' },
          { src: 'retriever', text: 'term-overlap rerank → 12 chunks' },
        ],
      },
      {
        step: 2,
        front: [],
        pending: true,
        readout: 'draft grounded',
        trace: [
          { src: 'synthesizer', text: 'draft answer from 12 chunks' },
          { src: 'grounding', text: 'removed 1 unsupported sentence · grounding_passed=true' },
        ],
      },
      {
        step: 2,
        front: [{ type: 'alert', tone: 'fail', text: 'Critic rejected the draft: it skipped the poster question. Re-planning…' }],
        pending: true,
        tone: 'fail',
        readout: 'critic: quality="poor" → replan',
        trace: [
          { src: 'critic', text: 'quality="poor" · dropped part of the query without saying so', tone: 'fail' },
          { src: 'graph', text: 'needs_replan=true · iteration=1 (<2) → planner', tone: 'fail' },
        ],
      },
      {
        step: 0,
        front: [],
        pending: true,
        readout: 'replan · query now covers both parts',
        trace: [{ src: 'planner', text: 'rewritten_query += "tenant damage, poster marks"' }],
      },
      {
        step: 1,
        front: [{ type: 'passage', text: '…damage beyond fair wear, such as adhesive marks, may be deducted…' }],
        pending: true,
        readout: '12 chunks · 3 new',
        trace: [{ src: 'retriever', text: 'dense search + rerank → 12 chunks (3 new)' }],
      },
      {
        step: 2,
        front: [],
        pending: true,
        tone: 'ok',
        readout: 'critic: quality="good"',
        trace: [
          { src: 'synthesizer', text: 'draft covers both parts of the question' },
          { src: 'grounding', text: 'grounding_passed=true' },
          { src: 'critic', text: 'quality="good" → END', tone: 'ok' },
        ],
      },
      {
        step: 3,
        front: [
          { type: 'msg', from: 'app', text: 'Repainting after normal wear and tear isn’t a valid deduction. Poster marks can be, if they go beyond fair wear and the check-in inventory shows the walls were undamaged.' },
          { type: 'sources', items: ['PDF — tenancy-agreement.pdf', 'Web — deposit-guide'] },
        ],
        readout: 'answer + Sources section',
        trace: [{ src: 'api', text: 'answer returned · citations listed under "Sources:"', tone: 'ok' }],
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
        readout: 'cache miss → run phase 1',
        trace: [
          { src: 'api', text: 'POST /analyse' },
          { src: 'cache', text: 'hash(job description + profile) → miss' },
        ],
      },
      {
        step: 1,
        front: [{ type: 'score', value: 78, label: 'Match' }],
        pending: true,
        readout: 'score=78 · validated',
        trace: [
          { src: 'job_parser', text: 'required_skills[9] · seniority="mid"' },
          { src: 'match_scorer', text: 'score=78 · missing_skills=["Kubernetes","model monitoring"]' },
        ],
      },
      {
        step: 1,
        front: [{ type: 'note', text: 'critical gap: Kubernetes · nice to have: model monitoring' }],
        pending: true,
        readout: 'gaps identified · outputs schema-checked',
        trace: [
          { src: 'gap_analyst', text: 'critical_gaps[1] · nice_to_have_gaps[1]' },
          { src: 'pydantic', text: 'all phase 1 outputs validated', tone: 'ok' },
        ],
      },
      {
        step: 2,
        front: [{ type: 'checklist', items: ['Learning resources'] }],
        pending: true,
        readout: 'resource_planner done · two agents in parallel',
        trace: [
          { src: 'sse', text: 'agent_done resource_planner' },
          { src: 'sse', text: 'agent_start cover_letter, resume_tailorer (asyncio.gather)' },
        ],
      },
      {
        step: 2,
        front: [
          { type: 'checklist', items: ['Tailored resume'] },
          { type: 'alert', tone: 'fail', text: 'Cover letter failed: the model provider was overloaded. Retry?' },
        ],
        tone: 'fail',
        readout: 'cover_letter failed · analysis partial',
        trace: [
          { src: 'sse', text: 'agent_done resume_tailorer', tone: 'ok' },
          { src: 'sse', text: 'pipeline_error cover_letter · overloaded after retries', tone: 'fail' },
          { src: 'db', text: 'analysis.partial=true' },
        ],
      },
      {
        step: 2,
        front: [
          { type: 'msg', from: 'user', text: 'Retry' },
          { type: 'checklist', items: ['Cover letter'] },
        ],
        pending: true,
        tone: 'ok',
        readout: 'retry re-ran cover_letter only',
        trace: [
          { src: 'api', text: 'POST /analysis/{id}/retry · scope="failed"' },
          { src: 'retry', text: 'succeeded steps skipped → [cover_letter]' },
          { src: 'sse', text: 'agent_done cover_letter', tone: 'ok' },
        ],
      },
      {
        step: 3,
        front: [{ type: 'msg', from: 'app', text: 'Analysis saved. Cover letter and tailored resume are ready to review and export.' }],
        readout: 'pipeline_done · partial=false',
        trace: [{ src: 'sse', text: 'pipeline_done · analysis.partial=false', tone: 'ok' }],
      },
    ],
  },
  SuperOps: {
    window: 'Sharma Kirana · Telegram',
    beats: [
      {
        step: 0,
        front: [{ type: 'msg', from: 'user', text: '20 packets rice 5kg for Ramesh, on khata' }],
        pending: true,
        readout: 'update claimed · store from verified chat',
        trace: [
          { src: 'telegram', text: 'update 88123 · claimUpdate → "claimed"' },
          { src: 'scope', text: 'store_id from the verified chat, never from the model' },
        ],
      },
      {
        step: 1,
        front: [],
        pending: true,
        readout: 'open_bill · add_bill_item',
        trace: [
          { src: 'tool', text: 'open_bill(customer_name="Ramesh") → bill 1043' },
          { src: 'tool', text: 'add_bill_item(product_query="rice 5kg", qty=20, unit="packet")' },
          { src: 'key', text: '88123:add_bill_item:<args-hash>:1' },
        ],
      },
      {
        step: 2,
        front: [{ type: 'msg', from: 'app', text: 'Only 18 packets of Rice 5kg in stock. Bill 18 instead?' }],
        tone: 'fail',
        readout: 'finalize_bill refused: insufficient_stock',
        trace: [{ src: 'tool', text: 'finalize_bill(payment_mode="khata") → insufficient_stock (18 left)', tone: 'fail' }],
      },
      {
        step: 0,
        front: [{ type: 'msg', from: 'user', text: 'Yes, make it 18' }],
        pending: true,
        readout: 'new update claimed',
        trace: [{ src: 'telegram', text: 'update 88124 · claimUpdate → "claimed"' }],
      },
      {
        step: 1,
        front: [],
        pending: true,
        readout: 'update_bill_item qty=18',
        trace: [{ src: 'tool', text: 'update_bill_item(bill_id=1043, product_query="rice 5kg", qty=18, unit="packet")' }],
      },
      {
        step: 2,
        front: [],
        pending: true,
        tone: 'ok',
        readout: 'one transaction · COMMIT',
        trace: [
          { src: 'tool', text: 'finalize_bill(payment_mode="khata", customer_name="Ramesh")' },
          { src: 'money', text: '18 × 42000 paise = 756000 paise (₹7,560)' },
          { src: 'db', text: 'BEGIN · stock_movements −18 · khata_entries +₹7,560 · COMMIT', tone: 'ok' },
        ],
      },
      {
        step: 3,
        front: [{ type: 'msg', from: 'app', text: '🧾 Bill #1043 · 18 × Rice 5kg · ₹7,560. Added to Ramesh’s khata (now ₹8,810). Stock left: 0.' }],
        readout: 'bill sent',
        trace: [{ src: 'telegram', text: 'reply sent · update 88124 marked done' }],
      },
      {
        step: 0,
        front: [],
        tone: 'ok',
        readout: 'redelivered update ignored',
        trace: [{ src: 'telegram', text: 'update 88124 redelivered · claimUpdate → "duplicate" · skipped, nothing charged twice', tone: 'ok' }],
      },
    ],
  },
}
