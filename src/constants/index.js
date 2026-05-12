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
    title: 'DocChat — Intelligent Document Assistant',
    desc: 'AI assistant for natural language querying of documents (PDF, DOCX, TXT) — hybrid BM25 + dense embedding retrieval fused via RRF, delivering sub-second results across 1,000+ chunks.',
    subdesc:
      'Async ingestion pipeline with WAL-mode SQLite, Redis background queue, and token-level SSE streaming. Fully documented REST API with FastAPI, containerised with Docker.',
    href: 'https://github.com/divyanshu144/DocChat',
    texture: '/textures/project/anonymous.mp4',
    logo: '/assets/project-logo1.png',
    logoStyle: {
      backgroundColor: '#0D1117',
      border: '0.2px solid #1F2937',
      boxShadow: '0px 0px 60px 0px #6366F14D',
    },
    spotlight: '/assets/spotlight1.png',
    tags: [
      {
        id: 1,
        name: 'Python',
        path: '/assets/sql.png',
      },
      {
        id: 2,
        name: 'FastAPI',
        path: '/assets/nodejs.png',
      },
      {
        id: 3,
        name: 'Docker',
        path: '/assets/docker.png',
      },
      {
        id: 4,
        name: 'Redis',
        path: '/assets/git.png',
      },
    ],
  },
  {
    title: 'PromptOps — LLM Evaluation & Automation',
    desc: 'Full-stack system for prompt versioning, automated LLM regression detection, and multi-provider AI evaluation (OpenAI GPT-4o, Ollama) — repeatable, auditable AI workflows.',
    subdesc:
      'Parallel evaluation with asyncio.gather across providers; TypeScript/Next.js frontend, FastAPI backend, deployed to Railway with full documentation.',
    href: 'https://github.com/divyanshu144/promptOps_framework',
    texture: '/textures/project/project5.mp4',
    logo: '/assets/project-logo2.png',
    logoStyle: {
      backgroundColor: '#13202F',
      border: '0.2px solid #17293E',
      boxShadow: '0px 0px 60px 0px #2F6DB54D',
    },
    spotlight: '/assets/spotlight2.png',
    tags: [
      {
        id: 1,
        name: 'Python',
        path: '/assets/sql.png',
      },
      {
        id: 2,
        name: 'FastAPI',
        path: '/assets/nodejs.png',
      },
      {
        id: 3,
        name: 'Next.js',
        path: '/assets/react.svg',
      },
      {
        id: 4,
        name: 'TypeScript',
        path: '/assets/typescript.png',
      },
    ],
  },
  {
    title: 'EPC South West — Large-Scale ML Pipeline',
    desc: 'End-to-end ETL and ML pipeline processing 1.8M+ UK EPC records (2008–2025) — causal modelling, XGBoost prediction, and SHAP explainability for energy policy analysis.',
    subdesc:
      'Reproducible CLI-driven workflow with Airflow DAG orchestration, MLflow experiment tracking, and a FastAPI service layer — documented end-to-end for handoff and scaling.',
    href: 'https://github.com/divyanshu144/EPC',
    texture: '/textures/project/project4.mp4',
    logo: '/assets/project-logo4.png',
    logoStyle: {
      backgroundColor: '#0E1F38',
      border: '0.2px solid #0E2D58',
      boxShadow: '0px 0px 60px 0px #2F67B64D',
    },
    spotlight: '/assets/spotlight3.png',
    tags: [
      {
        id: 1,
        name: 'Python',
        path: '/assets/sql.png',
      },
      {
        id: 2,
        name: 'XGBoost',
        path: '/assets/docker.png',
      },
      {
        id: 3,
        name: 'Airflow',
        path: '/assets/git.png',
      },
      {
        id: 4,
        name: 'MLflow',
        path: '/assets/nodejs.png',
      },
    ],
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
