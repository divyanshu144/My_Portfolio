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
    title: 'Fooder: Restaurant Discovery and Online Ordering',
    desc: 'Fooder lets users sign in, browse nearby restaurants, explore menus, and place orders online through a clean, responsive experience.',
    subdesc:
      'Built with React.js, Redux, Tailwind CSS, TypeScript, and Firebase for authentication and scalable performance.',
    href: 'https://github.com/divyanshu144/Fooder',
    texture: '/textures/project/Fooder.mp4',
    logo: '/assets/project-logo1.png',
    logoStyle: {
      backgroundColor: '#2A1816',
      border: '0.2px solid #36201D',
      boxShadow: '0px 0px 60px 0px #AA3C304D',
    },
    spotlight: '/assets/spotlight1.png',
    tags: [
      {
        id: 1,
        name: 'React.js',
        path: '/assets/react.svg',
      },
      {
        id: 2,
        name: 'TailwindCSS',
        path: 'assets/tailwindcss.png',
      },
      {
        id: 3,
        name: 'TypeScript',
        path: '/assets/typescript.png',
      },
      {
        id: 4,
        name: 'Redux',
        path: '/assets/redux.png',
      },
      {
        id: 5,
        name: 'SQL',
        path: '/assets/sql.png',
      },
    ],
  },
  {
    title: 'Lumen-flow: ClientOps Workflow Engine',
    desc: 'An intelligent ClientOps engine that turns chat intent into workflows: detect, draft, approve, and advance.',
    subdesc:
      'Designed to route intent through a structured automation pipeline for faster client operations.',
    href: 'https://github.com/divyanshu144/Lumen-flow',
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
        name: 'ClientOps',
        path: '/assets/git.png',
      },
      {
        id: 2,
        name: 'Automation',
        path: '/assets/docker.png',
      },
      {
        id: 3,
        name: 'Workflow',
        path: '/assets/nodejs.png',
      },
    ],
  },
  {
    title: 'MSc Dissertation: UK Housing Energy Performance (EPC)',
    desc: 'Analysed 1.8M UK EPC records to study long-term trends in SAP scores, CO2 emissions, and EPC bands.',
    subdesc:
      'Built scalable data pipelines, applied fixed-effects regression for policy-era analysis, and evaluated ML models for predictive performance.',
    href: 'https://github.com/divyanshu144?tab=repositories',
    texture: '/textures/project/project4.mp4',
    logo: '/assets/project-logo4.png',
    logoStyle: {
      backgroundColor: '#0E1F38',
      border: '0.2px solid #0E2D58',
      boxShadow: '0px 0px 60px 0px #2F67B64D',
    },
    spotlight: '/assets/spotlight4.png',
    tags: [
      {
        id: 1,
        name: 'Python',
        path: '/assets/sql.png',
      },
      {
        id: 2,
        name: 'SQL',
        path: '/assets/sql.png',
      },
      {
        id: 3,
        name: 'Statistical Modelling',
        path: '/assets/git.png',
      },
      {
        id: 4,
        name: 'Machine Learning',
        path: '/assets/docker.png',
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
    duration: 'Oct, 2023 - Dec, 2024',
    title:
      'Architected and delivered a module from scratch using JavaScript, React.js, Redux, React Query, and Material-UI in Agile Scrum. Implemented code splitting, lazy loading, and memoization with React Query to boost performance and response time by 20%. Owned features end-to-end and collaborated with QA, backend, and DB teams for seamless integration.',
    icon: '/assets/Mphasis.png',
    animation: 'victory',
  },
  {
    id: 2,
    name: 'Mphasis',
    pos: 'Software Engineer',
    duration: 'Sep, 2021 - Sep, 2023',
    title:
      'Designed and implemented user-centric interfaces using React.js, Redux, and JavaScript for routing, dashboards, user management, and download workflows. Improved responsiveness by resolving state-management analytics and event-driven issues, contributing to a €12k+ revenue increase for clients.',
    icon: '/assets/Mphasis.png',
    animation: 'clapping',
  },
  {
    id: 3,
    name: 'Hermitcrabs',
    pos: 'Web Developer Intern',
    duration: 'Feb, 2021 - Apr, 2021',
    title:
      'Supported CMS-driven web builds and front-end enhancements for B2B marketing sites, with a focus on CSS and JavaScript for rapid iteration and page performance.',
    icon: '/assets/hermit.jfif',
    animation: 'salute',
  },
  ];
