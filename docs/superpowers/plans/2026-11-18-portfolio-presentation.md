# Portfolio presentation implementation plan

## Agreed direction
Implement the five improvements proposed in the portfolio review and accepted by the user: evidence-led project presentation, three case studies, contextual metrics, experience before education, and clear introductory actions. Preserve the React/Vite app and dark/gold vCard styling. Work locally; no deployment or unrelated changes.

## Implementation
- [x] Expand JobFit, DocChat and SuperOps in the existing JSON with problem, contribution, tradeoff, result, limitations, workflow and source links.
- [x] Replace unsupported/stale metrics with verified local-repository evidence. Publish a small, sanitized evidence note rather than private raw datasets.
- [x] Render featured case studies with labelled workflow diagrams, accessible native disclosure controls and repository links. Keep the other projects compact.
- [x] Add View my work, Contact me and a working CV download, using the user's preferred CV source when supplied.
- [x] Put professional experience before education.
- [x] Build and run the existing tests; check rendered markup, static asset paths and the final diff. Browser verification is limited by unavailable browser integration.

## Decisions
Use workflow diagrams instead of fabricated screenshots. Keep data in portfolioData.json; style additions only in src/index.css. Native disclosure controls keep the case studies readable without a new dependency. Intro actions use existing page selection. A generated CV, if needed, uses only the portfolio's supported facts.

## Review focus
No dead download links; no inaccessible hidden-page navigation; readable single-column mobile layout; no unqualified benchmark claims; no private source data published.

## Verification
Production build passed; all 57 existing tests passed. Server-rendered About, Portfolio and Experience sections were checked for actions, three disclosures, experience order and built local asset availability. The generated CV has two pages, both rendered and visually inspected. Browser integration was unavailable, so responsive layout and client interactions were not visually verified.

## Evidence updates
Local project documentation superseded stale JobFit deployment and savings claims, the old DocChat retrieval percentages, and PromptOps pass-rate/token claims. An existing PromptOps dashboard capture is included with its offline-fixture context. No raw evaluation datasets or private CV files were copied.

Final independent code review: no critical, important or minor findings. Browser verification remains outstanding.
