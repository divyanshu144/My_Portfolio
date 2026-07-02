export const navLinks = [
    {
      id: 1,
      name: 'Home',
      href: '#home',
    },
    {
      id: 2,
      name: 'About',
      href: '#about',
    },
    {
      id: 3,
      name: 'Work',
      href: '#work',
    },
    {
      id: 4,
      name: 'Contact',
      href: '#contact',
    },
  ];
  
  export const clientReviews = [
    {
      id: 1,
      name: 'Emily Johnson',
      position: 'Marketing Director at GreenLeaf',
      img: 'assets/review1.png',
      review:
        'Working with Adrian was a fantastic experience. He transformed our outdated website into a modern, user-friendly platform. His attention to detail and commitment to quality are unmatched. Highly recommend him for any web dev projects.',
    },
    {
      id: 2,
      name: 'Mark Rogers',
      position: 'Founder of TechGear Shop',
      img: 'assets/review2.png',
      review:
        'Adrian’s expertise in web development is truly impressive. He delivered a robust and scalable solution for our e-commerce site, and our online sales have significantly increased since the launch. He’s a true professional! Fantastic work.',
    },
    {
      id: 3,
      name: 'John Dohsas',
      position: 'Project Manager at UrbanTech ',
      img: 'assets/review3.png',
      review:
        'I can’t say enough good things about Adrian. He was able to take our complex project requirements and turn them into a seamless, functional website. His problem-solving abilities are outstanding.',
    },
    {
      id: 4,
      name: 'Ether Smith',
      position: 'CEO of BrightStar Enterprises',
      img: 'assets/review4.png',
      review:
        'Adrian was a pleasure to work with. He understood our requirements perfectly and delivered a website that exceeded our expectations. His skills in both frontend backend dev are top-notch.',
    },
  ];
  
export const myProjects = [
  {
    title: 'JobFit Agent — AI Job-Application System',
    desc: 'Full-stack AI assistant that scores job fit, runs structured gap analysis, and generates tailored cover letters and DOCX resumes — built as a real workflow system with persisted state, validated LLM outputs, and SSE-streamed progress.',
    subdesc:
      'Multi-agent pipeline (parse → score → gap → generate) with Pydantic v2 schemas, pgvector semantic profile memory, Celery background jobs, per-call cost tracking, and a Prometheus metrics endpoint. Ships with Docker Compose, local Kubernetes manifests, and AWS ECS Fargate CI/CD.',
    href: 'https://github.com/divyanshu144/Job_Agent',
    logo: '/assets/project-logo1.png',
    logoStyle: {
      backgroundColor: '#0D1117',
      border: '0.2px solid #1e2a36',
      boxShadow: '0px 0px 60px 0px rgba(14,165,233,0.18)',
    },
    tags: ['FastAPI', 'Anthropic', 'Celery', 'pgvector', 'React', 'AWS ECS'],
  },
  {
    title: 'DocChat — Agentic Research Assistant',
    desc: 'Multi-source research assistant: ingest PDFs, YouTube videos, and web pages into a shared Qdrant vector store and ask questions across all of them — answers stream token-by-token with inline citation chips.',
    subdesc:
      'Five-node LangGraph agent (Planner → Retriever → Synthesizer → Grounding → Critic) with replan loop, per-source filtering, conversation folders with drag-and-drop, JWT auth with silent refresh, and LangSmith tracing.',
    href: 'https://github.com/divyanshu144/DocChat',
    logo: '/assets/project-logo2.png',
    logoStyle: {
      backgroundColor: '#0a1628',
      border: '0.2px solid #1e2a36',
      boxShadow: '0px 0px 60px 0px rgba(14,165,233,0.18)',
    },
    tags: ['FastAPI', 'LangGraph', 'Qdrant', 'Groq', 'React', 'PostgreSQL'],
  },
  {
    title: 'PromptOps — Prompt-as-Code MLOps',
    desc: 'Prompt engineering as a software discipline: version prompts by SHA-256 hash, run automated LLM-as-judge evaluation across a test suite, detect regressions, and optimize via parallel candidate generation.',
    subdesc:
      'Pluggable EvalHarness ABC (LLM judge or DeepEval G-Eval), 9× parallel mutation optimizer with SSE streaming, pass-rate tracking, A/B diff view, MLflow experiment logging, and multi-provider support (Ollama, OpenAI, Anthropic).',
    href: 'https://github.com/divyanshu144/promptOps_framework',
    logo: '/assets/project-logo3.png',
    logoStyle: {
      backgroundColor: '#13202F',
      border: '0.2px solid #17293E',
      boxShadow: '0px 0px 60px 0px rgba(14,165,233,0.18)',
    },
    tags: ['FastAPI', 'Next.js', 'MLflow', 'Anthropic', 'Ollama', 'SQLite'],
  },
  {
    title: 'EPC South West — Large-Scale ML Pipeline',
    desc: 'End-to-end ETL and ML pipeline processing 1.8M+ UK EPC records (2008–2025) — causal modelling, XGBoost prediction, and SHAP explainability for energy policy analysis.',
    subdesc:
      'Reproducible CLI-driven workflow with Airflow DAG orchestration, MLflow experiment tracking, and a FastAPI service layer — documented end-to-end for handoff and scaling.',
    href: 'https://github.com/divyanshu144/EPC',
    logo: '/assets/project-logo4.png',
    logoStyle: {
      backgroundColor: '#0E1F38',
      border: '0.2px solid #0E2D58',
      boxShadow: '0px 0px 60px 0px rgba(14,165,233,0.18)',
    },
    tags: ['Python', 'XGBoost', 'Airflow', 'MLflow', 'FastAPI', 'SHAP'],
  },
];
  
  export const calculateSizes = (isSmall, isMobile, isTablet) => {
    return {
      deskScale: isSmall ? 0.05 : isMobile ? 0.06 : 0.065,
      deskPosition: isMobile ? [0.5, -4.5, 0] : [0.25, -5.5, 0],
      cubePosition: isSmall ? [4, -5, 0] : isMobile ? [5, -5, 0] : isTablet ? [5, -5, 0] : [9, -5.5, 0],
      reactLogoPosition: isSmall ? [3, 4, 0] : isMobile ? [5, 4, 0] : isTablet ? [5, 4, 0] : [12, 3, 0],
      ringPosition: isSmall ? [-5, 7, 0] : isMobile ? [-10, 10, 0] : isTablet ? [-12, 10, 0] : [-24, 10, 0],
      targetPosition: isSmall ? [-5, -10, -10] : isMobile ? [-9, -10, -10] : isTablet ? [-11, -7, -10] : [-13, -13, -10],
    };
  };
  
export const workExperiences = [
  {
    id: 1,
    name: 'Mphasis',
    pos: 'Senior Software Engineer',
    duration: 'Oct 2023 – Dec 2024',
    title:
      'Designed and delivered production-grade backend modules and REST API integrations within enterprise banking platforms. Improved application performance by 20% through profiling and optimisation of API patterns and state management. Led refactoring with SOLID/DRY principles and designed a Jenkins-based CI/CD pipeline. Mentored junior engineers in a Scrum team.',
    icon: '/assets/Mphasis.png',
    animation: 'victory',
  },
  {
    id: 2,
    name: 'Mphasis',
    pos: 'Software Engineer',
    duration: 'Sep 2021 – Sep 2023',
    title:
      'Translated client business requirements into bespoke workflow systems and dashboards integrating SQL databases, finance platform APIs, and third-party services. Engineered a performance-optimised document processing pipeline that resolved a critical bottleneck and contributed to €12k+ additional revenue. Maintained system stability through structured debugging and automated testing.',
    icon: '/assets/Mphasis.png',
    animation: 'clapping',
  },
  {
    id: 3,
    name: 'Hermitcrabs',
    pos: 'Web Developer Intern',
    duration: 'Feb 2021 – Apr 2021',
    title:
      'Supported CMS-driven web builds and front-end enhancements for B2B marketing sites, with a focus on CSS and JavaScript for rapid iteration and page performance.',
    icon: '/assets/hermit.jfif',
    animation: 'salute',
  },
];
