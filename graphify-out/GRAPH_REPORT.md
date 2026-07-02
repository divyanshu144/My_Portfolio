# Graph Report - .  (2026-05-13)

## Corpus Check
- 102 files · ~276,521 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 184 nodes · 192 edges · 21 communities detected
- Extraction: 73% EXTRACTED · 27% INFERRED · 0% AMBIGUOUS · INFERRED: 52 edges (avg confidence: 0.81)
- Token cost: 15,300 input · 5,150 output

## Community Hubs (Navigation)
- [[_COMMUNITY_AI Assistant & API Layer|AI Assistant & API Layer]]
- [[_COMMUNITY_3D Scene Components|3D Scene Components]]
- [[_COMMUNITY_Core UI Sections|Core UI Sections]]
- [[_COMMUNITY_About Section Assets|About Section Assets]]
- [[_COMMUNITY_Projects & Demo Computer|Projects & Demo Computer]]
- [[_COMMUNITY_HackerRoom Textures|HackerRoom Textures]]
- [[_COMMUNITY_DevOps Tech Stack Logos|DevOps Tech Stack Logos]]
- [[_COMMUNITY_Express Server & GitHub|Express Server & GitHub]]
- [[_COMMUNITY_Frontend Framework Logos|Frontend Framework Logos]]
- [[_COMMUNITY_GitHub Explainer API|GitHub Explainer API]]
- [[_COMMUNITY_Hero Section Logic|Hero Section Logic]]
- [[_COMMUNITY_Backend Tech Stack Logos|Backend Tech Stack Logos]]
- [[_COMMUNITY_Utility Icons|Utility Icons]]
- [[_COMMUNITY_Social Links|Social Links]]
- [[_COMMUNITY_Background Visual Effects|Background Visual Effects]]
- [[_COMMUNITY_Testimonial Assets|Testimonial Assets]]
- [[_COMMUNITY_Testimonials Section|Testimonials Section]]
- [[_COMMUNITY_UI Navigation Icons|UI Navigation Icons]]
- [[_COMMUNITY_Health Route|Health Route]]
- [[_COMMUNITY_ESLint Module|ESLint Module]]
- [[_COMMUNITY_HTML Entry|HTML Entry]]

## God Nodes (most connected - your core abstractions)
1. `Hero Section` - 13 edges
2. `App Component` - 10 edges
3. `Projects Section` - 10 edges
4. `AIAssistant Component` - 8 edges
5. `Express AI Server` - 8 edges
6. `Shared AI Context Library (_lib/context.js)` - 7 edges
7. `portfolioData.json (AI context data)` - 6 edges
8. `HackerRoom Desk CPU Material Texture` - 6 edges
9. `Tech Stack Collage Image` - 5 edges
10. `Framer Motion Logo` - 5 edges

## Surprising Connections (you probably didn't know these)
- `myProjects static data array` --semantically_similar_to--> `portfolioData.json (AI context data)`  [INFERRED] [semantically similar]
  src/constants/index.js → data/portfolioData.json
- `workExperiences static data array` --semantically_similar_to--> `portfolioData.json (AI context data)`  [INFERRED] [semantically similar]
  src/constants/index.js → data/portfolioData.json
- `Movie/Film App Logo` --used_in--> `Projects Section`  [INFERRED]
  public/assets/movie-logo.jpg → src/sections/Projects.jsx
- `Spotlight Effect 1 – Warm Glow` --used_in--> `Hero Section`  [EXTRACTED]
  public/assets/spotlight1.png → src/sections/Hero.jsx
- `Spotlight Effect 5 – Lavender/Purple Glow` --used_in--> `Hero Section`  [EXTRACTED]
  public/assets/spotlight5.png → src/sections/Hero.jsx

## Hyperedges (group relationships)
- **he_ai_pipeline** — ai_assistant, api_lib_context, portfolio_data_json [EXTRACTED 1.00]
- **he_hero_3d_scene** — hero_section, hero_camera, hacker_room, target_component, cube_component, rings_component, react_logo_component [EXTRACTED 1.00]
- **he_server_dual_deploy** — server_index, api_lib_context, vite_proxy [INFERRED 0.85]
- **HackerRoom 3D Desk Scene Texture Set** —  [INFERRED 0.90]
- **Developer Portfolio Tech Skill Icon Set** —  [EXTRACTED 1.00]
- **Tech Skill Logo Assets Group** —  [INFERRED 0.90]
- **UI Action / Interactive Icon Group** —  [INFERRED 0.90]
- **About Section Bento Grid Decorative Images** —  [INFERRED 0.90]
- **Social Media Icon Group** —  [EXTRACTED 1.00]
- **Work Experience Company Logo Group** —  [INFERRED 0.90]
- **Tech Stack Logo Group** —  [INFERRED 0.88]
- **Social Media Icons Group** —  [INFERRED 0.90]
- **Testimonials / Reviews Section Assets** —  [INFERRED 0.88]
- **Decorative Spotlight / Glow Background Effects** —  [EXTRACTED 1.00]

## Communities

### Community 0 - "AI Assistant & API Layer"
Cohesion: 0.18
Nodes (19): AIAssistant Component, Vercel API Route: /api/chat, Vercel API Route: /api/coach, Vercel API Route: /api/explain, Shared AI Context Library (_lib/context.js), Vercel API Route: /api/resume, buildPortfolioContext() function, fetchGitHubReadme() function (+11 more)

### Community 1 - "3D Scene Components"
Cohesion: 0.14
Nodes (18): calculateSizes() responsive helper, CanvasLoader Component (CanvasLoader.jsx), Constants & Static Data (index.js), Cube 3D Component, Developer 3D Model Component, Experience Section, HackerRoom 3D Component, HeroCamera Component (+10 more)

### Community 2 - "Core UI Sections"
Cohesion: 0.17
Nodes (13): About Section, App Component, Button Component, Contact Section, EmailJS send service, Footer Section, App Entry Point (main.jsx), Hamburger Menu Icon (+5 more)

### Community 3 - "About Section Assets"
Cohesion: 0.31
Nodes (10): Grid 1 - 3D Avatar Portrait Decorative Image, Grid 2 - Tech Stack Orbit / JSMastery Decorative Image, Grid 3 - Framer/Render Tool Decorative Image, JavaScript Logo Icon, Mphasis Company Logo, Notion App Icon, PostgreSQL Logo, Azure SQL / Cloud SQL Logo (+2 more)

### Community 4 - "Projects & Demo Computer"
Cohesion: 0.43
Nodes (8): DemoComputer 3D Component, Movie/Film App Logo, Project Logo 1 – Podcast/Audio App, Project Logo 2 – File/Document Manager, Project Logo 3 – Healthcare/Medical App, Project Logo 4 – Analytics/Trading App, Project Logo 5 – Sparkle/AI Feature, Projects Section

### Community 5 - "HackerRoom Textures"
Cohesion: 0.36
Nodes (8): Cube 3D Material Texture Map, HackerRoom Desk Chair Material Texture, HackerRoom Desk CPU Material Texture, HackerRoom Desk Chair Cushion Material Texture, HackerRoom Desk Monitor Material Texture, HackerRoom Monitor Screen Content Texture, HackerRoom Desk Table Material Texture, Rings 3D Material Texture Map

### Community 6 - "DevOps Tech Stack Logos"
Cohesion: 0.33
Nodes (7): Docker Container Platform Logo, Figma Design Tool Logo, Git Version Control Logo, GitHub Platform Logo, Left Arrow Navigation Icon, Next.js Framework Logo, Vite Build Tool Logo

### Community 7 - "Express Server & GitHub"
Cohesion: 0.4
Nodes (2): fetchGitHubReadme(), safeRepoFromUrl()

### Community 8 - "Frontend Framework Logos"
Cohesion: 0.87
Nodes (6): Aceternity UI Logo, Framer Motion Logo, React Logo SVG, Redux Logo, Tailwind CSS Logo, TypeScript Logo

### Community 10 - "GitHub Explainer API"
Cohesion: 0.83
Nodes (3): fetchGitHubReadme(), handler(), safeRepoFromUrl()

### Community 11 - "Hero Section Logic"
Cohesion: 0.5
Nodes (2): calculateSizes(), Hero()

### Community 12 - "Backend Tech Stack Logos"
Cohesion: 0.83
Nodes (4): Framer Motion Logo, MongoDB Logo, Node.js Logo, Tech Stack Section

### Community 14 - "Utility Icons"
Cohesion: 0.67
Nodes (3): Close / Dismiss X Icon, Copy to Clipboard Icon, Instagram Social Media Icon

### Community 15 - "Social Links"
Cohesion: 0.67
Nodes (3): Arrow Up Icon, LinkedIn Social Icon, Twitter / X Social Icon SVG

### Community 16 - "Background Visual Effects"
Cohesion: 0.67
Nodes (3): Carousel / Slider UI Graphic (grid4), Spotlight Glow Effect 2, Spotlight Glow Effect 3

### Community 17 - "Testimonial Assets"
Cohesion: 1.0
Nodes (3): Testimonial Avatar 2, Testimonial Avatar 3, Star Rating Icon

### Community 18 - "Testimonials Section"
Cohesion: 1.0
Nodes (3): Testimonial Avatar – Review 1, Testimonial Avatar – Review 4, Testimonials Section

### Community 41 - "UI Navigation Icons"
Cohesion: 1.0
Nodes (2): Right Arrow Navigation Icon, Green Tick / Checkmark Icon

### Community 47 - "Health Route"
Cohesion: 1.0
Nodes (1): Vercel API Route: /api/health

### Community 48 - "ESLint Module"
Cohesion: 1.0
Nodes (1): ESLint Config

### Community 49 - "HTML Entry"
Cohesion: 1.0
Nodes (1): HTML Entry Point

## Knowledge Gaps
- **33 isolated node(s):** `App Entry Point (main.jsx)`, `Footer Section`, `DemoComputer 3D Component`, `HeroCamera Component`, `Cube 3D Component` (+28 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Express Server & GitHub`** (6 nodes): `buildPortfolioContext()`, `fetchGitHubReadme()`, `index.js`, `refreshProjectReadmes()`, `safeRepoFromUrl()`, `toText()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Hero Section Logic`** (4 nodes): `calculateSizes()`, `Hero()`, `index.js`, `Hero.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `UI Navigation Icons`** (2 nodes): `Right Arrow Navigation Icon`, `Green Tick / Checkmark Icon`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Health Route`** (1 nodes): `Vercel API Route: /api/health`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `ESLint Module`** (1 nodes): `ESLint Config`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `HTML Entry`** (1 nodes): `HTML Entry Point`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `App Component` connect `Core UI Sections` to `AI Assistant & API Layer`, `3D Scene Components`, `Projects & Demo Computer`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `AIAssistant Component` connect `AI Assistant & API Layer` to `Core UI Sections`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `Hero Section` connect `3D Scene Components` to `Core UI Sections`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **What connects `App Entry Point (main.jsx)`, `Footer Section`, `DemoComputer 3D Component` to the rest of the system?**
  _33 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `3D Scene Components` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._