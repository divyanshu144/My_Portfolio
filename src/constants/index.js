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
      title: 'Fooder: A Restaurant Discovery and Online Ordering Web App',
      desc: 'Fooder is a web application that allows users to seamlessly sign in or register, browse a curated list of nearby restaurants, and explore detailed menus for each establishment. The app also enables users to add items to their cart and place orders online, making dining convenient and enjoyable. Through its user-friendly interface, Fooder simplifies the restaurant discovery and online ordering experience.',
      subdesc:
        'Built as a unique web app with React.js, Redux, Tailwind CSS, TypeScript, and Firebase, Fooder is designed for optimal performance and scalability.',
      href: 'https://fooder-two.vercel.app/',
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
      ],
    },
    {
      title: 'Anonymous : Post Messages Anonymously',
      desc: 'I have developed an anonymous web application where users can post messages without revealing their identity. The app integrates OpenAI API to provide message suggestions, enhancing the user experience. User authentication is implemented using NextAuth for secure and seamless login. Built with modern technologies like Next.js, React.js, Shadcn-UI, Tailwind CSS, and MongoDB, this web app offers both a clean design and a smooth, privacy-focused messaging platform.',
      subdesc:
        'Built with Next.js and React.js for seamless UI, Shadcn-UI and Tailwind CSS for modern design, and MongoDB for data storage. NextAuth handles secure authentication, while OpenAI API powers intelligent message suggestions.',
      href: 'https://github.com/divyanshu144/True-feedback',
      texture: '/textures/project/anonymous.mp4',
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
          name: 'Next.js',
          path: '/assets/nextjs.png',
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
          name: 'MongoDB',
          path: '/assets/mongodb.png',
        },
      ],
    },
    {
      title: 'movieTime - Online Movie Streaming Web App',
      desc: 'I developed an online movie streaming web app that leverages the TMDB API to display a vast collection of movies. Users must log in to access the movie library, which is organized into multiple categories for easy navigation. Additionally, users can watch movie trailers directly on the platform, enhancing the browsing experience.',
      subdesc: 'Developed with React.js, Redux for state management, and Tailwind CSS for a responsive design. Firebase is used for secure user authentication, and the TMDB API powers the movie collection and trailer features.',
      href: 'https://movie-time-olive-seven.vercel.app/',
      texture: '/textures/project/movieTime.mp4',
      logo: '/assets/movie-logo.jpg',
      logoStyle: {
        backgroundColor: '#60f5a1',
        background:
          'linear-gradient(0deg, #60F5A150, #60F5A150), linear-gradient(180deg, rgba(255, 255, 255, 0.9) 0%, rgba(208, 213, 221, 0.8) 100%)',
        border: '0.2px solid rgba(208, 213, 221, 1)',
        boxShadow: '0px 0px 60px 0px rgba(35, 131, 96, 0.3)',
      },
      spotlight: '/assets/spotlight3.png',
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
      ],
    },
    {
      title: 'MusicLearners: Online Learning Platform for Aspiring Musicians',
      desc: 'MusicLearners an online web app designed for music learners to explore a variety of available courses. This project showcases the integration of Aceternity-UI, utilizing its features to enhance the user interface and overall user experience. Through this platform, aspiring musicians can easily discover and enroll in courses to advance their musical journey.',
      subdesc:
        'Built with Next.js for a dynamic user experience, Aceternity-UI for sleek and modern UI components, and JavaScript to power the apps functionality and interactivity.',
      href: 'https://music-school-five-pi.vercel.app/',
      texture: '/textures/project/music.mp4',
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
          name: 'Next.js',
          path: '/assets/nextjs.png',
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
          name: 'Aceternity - UI',
          path: '/assets/aceternity.png',
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
      pos: 'Senior Software Developer',
      duration: 'Oct, 2023 - Present',
      title: " Architected and engineered the development of a module from scratch, utilizing cutting edge technologies including JavaScript, React.js, Redux, React-Query and Material-UI, while following the Agile Scrum methodologies to facilitate efficient delivery through sprint planning and execution. Implemented Code Splitting, Lazy Loading, and Memoization techniques, along with React Query to achieve a 20% boost in application performance and response time, enhancing the overall user experience.",
      icon: '/assets/Mphasis.png',
      animation: 'victory',
    },
    {
      id: 2,
      name: 'Mphasis',
      pos: 'Software Developer',
      duration: 'Sept, 2021 - Oct, 2023',
      title: "Designed and implemented user-centric interfaces using React.js, Redux and JavaScript, incorporating key features such as routing, dashboard, user management, download manager which was implemented using lazy loading and code splitting techniques, which contributed to a revenue increase of 12k+ Euros for a diverse clientele",
      icon: '/assets/Mphasis.png',
      animation: 'clapping',
    },
    {
      id: 3,
      name: 'Hermitcrabs Inc',
      pos: 'Web Developer intern',
      duration: 'Feb, 2021 - May, 2021',
      title: "Contributed to various web development projects, optimizing websites for faster loading and implementing SEO strategies to improve organic search visibility. Gained hands-on experience with industry standard HubSpot, CMS and plugins, streamlining website development process.",
      icon: '/assets/hermit.jfif',
      animation: 'salute',
    },
  ];