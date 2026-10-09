# GitHub repository review — 9 October 2026

Reviewed all 58 public repositories returned by the [GitHub API](https://api.github.com/users/divyanshu144/repos?per_page=100&sort=updated): 41 non-forks and 17 forks. Sources: public repository metadata, available README files, file listings, and selected implementation files. This was a purpose/positioning review, not an execution test or complete code audit. Missing, template-only and ambiguous documentation is called out below. No private repositories were reviewed.

## What informed the About rewrite

The clearest positioning is applied AI engineering with a full-stack and statistical foundation. The five highlighted projects demonstrate information retrieval, stateful job-application workflows, domain-constrained retail tools, permission-controlled desktop actions, and reproducible data/ML pipelines. PromptOps adds systematic evaluation. Older web apps establish breadth but do not need to become a list in the bio.

Concrete implementation checks: [DocChat graph](https://github.com/divyanshu144/DocChat/blob/master/app/agent/graph.py), [JobFit orchestrator](https://github.com/divyanshu144/Job_Agent/blob/main/backend/services/orchestrator.py), [SuperOps tool allowlist](https://github.com/divyanshu144/supermarket-ops-agent/blob/main/src/tools/index.ts), [JARVIS safety gates](https://github.com/divyanshu144/Jarvis/blob/master/jarvis/core/tool_safety.py), and [EPC dependencies](https://github.com/divyanshu144/EPC/blob/main/pyproject.toml).

## Owned repositories (GitHub non-forks)

| Repository | Purpose and evidence limits |
| --- | --- |
| [supermarket-ops-agent](https://github.com/divyanshu144/supermarket-ops-agent) | Telegram-operated kirana store: inventory receipts, multi-turn bills, GST calculations, customer credit (khata), daily close, PDF invoices and analysis decks. Claude Agent SDK selects allowlisted tools; domain code and database transactions enforce stock and billing rules. The README explicitly says there is no accepted live agent-quality baseline; offline safety replays do not establish live model reliability. |
| [Job_Agent](https://github.com/divyanshu144/Job_Agent) | JobFit: CV/profile ingestion, semantic profile recall, job discovery, fit scoring, gap analysis, learning resources, tailored cover letters and downloadable resumes. Persists workflow state, streams progress, tracks cost, and supports background application campaigns. README describes AWS staging and local deployment options; this review did not exercise them. |
| [DocChat](https://github.com/divyanshu144/DocChat) | Multi-source question answering over PDFs, YouTube transcripts and web pages. A LangGraph planner/retriever/synthesizer/grounding/critic pipeline can replan; answers carry source citations. Includes source filters, saved conversations, Qdrant retrieval, PostgreSQL persistence, evaluation and inference benchmarking. Grounding checks are implemented mechanisms, not a guarantee of correctness. |
| [promptOps_framework](https://github.com/divyanshu144/promptOps_framework) | Prompt and RAG evaluation platform: versioned configurations, test suites, judge-based scoring, A/B comparisons, regression detection, optimization, CI quality gates and MLflow tracking. Supports offline fixtures and multiple live model providers; fixture results should not be presented as general live-model accuracy. |
| [divyanshu144](https://github.com/divyanshu144/divyanshu144) | GitHub profile README presenting the applied AI portfolio and selected projects. |
| [EPC](https://github.com/divyanshu144/EPC) | Dissertation data/ML platform examining domestic energy efficiency across policy periods in South West England using 1.8M+ EPC records. Ingestion and cleaning, fixed-effects analysis, wild cluster bootstrap, XGBoost/SHAP, property-level train/test separation, Prefect orchestration and API/dashboard serving. S3/Snowflake, PostgreSQL and MLflow are optional layers. No causal certainty or model accuracy is inferred from architecture alone. |
| [My_Portfolio](https://github.com/divyanshu144/My_Portfolio) | Personal React/Vite portfolio. Public README is template text; the current local application supplies About, Experience, Portfolio, Blog, Contact and an AI portfolio assistant. |
| [Jarvis](https://github.com/divyanshu144/Jarvis) | macOS desktop assistant with voice input/output, floating UI, local and Google tools, persistent and semantic memory, and Ollama → Groq → Claude routing. Model-dispatched sensitive actions have permission gates. Optional wake-word support is documented as a template, not an established working feature. |
| [Fooder](https://github.com/divyanshu144/Fooder) | Food discovery and ordering interface: restaurant/menu browsing, search, favorites, cart, Firebase authentication, grocery catalog and LLM recommendation explanations. README says grocery data is mocked; this is not evidence of payment processing or fulfilled orders. |
| [Lumen-flow](https://github.com/divyanshu144/Lumen-flow) | ClientOps workflow described as detecting lead intent in chat, drafting email/task/notification automations, obtaining human approval, and advancing lead status. Short README; implementation completeness was not established. |
| [priyanshu](https://github.com/divyanshu144/priyanshu) | Standalone interactive Valentine invitation webpage, confirmed by index.html. |
| [Airbnb-Project](https://github.com/divyanshu144/Airbnb-Project) | Notebook for London Airbnb listing analysis and price-prediction preparation. Inspected markdown documents cleaning, imputation, outlier inspection and exploratory analysis. A validated predictive model was not established by this review. |
| [python-test](https://github.com/divyanshu144/python-test) | No README or visible file tree was returned. Purpose could not be established; do not infer functionality from the name. |
| [Assignment](https://github.com/divyanshu144/Assignment) | React quotes application with login, quote listing and quote creation routes, confirmed by src/App.jsx. |
| [True-feedback](https://github.com/divyanshu144/True-feedback) | Next.js anonymous-feedback application with account routes and public user pages. Landing-page code explicitly describes anonymous feedback. |
| [movieTime](https://github.com/divyanshu144/movieTime) | Movie browsing application with Firebase login, TMDB movie data, Redux state, and GPT search features described in the README. |
| [File-upload](https://github.com/divyanshu144/File-upload) | React file-upload interface; App.jsx mounts the FileUpload component. Storage backend and persistence were not verified. |
| [FeedBack-Form](https://github.com/divyanshu144/FeedBack-Form) | React feedback-form management UI with dashboard, create, edit and form-detail routes. |
| [Medium-blog](https://github.com/divyanshu144/Medium-blog) | No README returned and scrape did not expose useful source content. Purpose remains unverified; the repository name alone is insufficient. |
| [aws-backend](https://github.com/divyanshu144/aws-backend) | Minimal Hono HTTP backend exercise. Inspected handler reads request JSON, headers and query parameters and returns a greeting. Wrangler configuration is present; the name does not establish AWS deployment. |
| [PayTM](https://github.com/divyanshu144/PayTM) | README describes a basic PayTM-style application exercise. Financial transfer behavior and completeness were not verified. |
| [ToDo](https://github.com/divyanshu144/ToDo) | Basic task app: create tasks, view existing tasks and mark tasks done, according to the README. |
| [Tasks](https://github.com/divyanshu144/Tasks) | Java/JSTL exercise structure under Agentjstl/Agentjstl. Exact business behavior is undocumented in the material reviewed. |
| [javatraining](https://github.com/divyanshu144/javatraining) | Training exercises spanning Java, JavaScript and Oracle, organized into day-specific folders. |
| [Fasion-Point](https://github.com/divyanshu144/Fasion-Point) | Placeholder repository containing only a title README in the public file listing. Distinct from fashion-point. |
| [sidport](https://github.com/divyanshu144/sidport) | React portfolio with introduction, technology stack, projects and contact components. |
| [ColorGame-GitHUB](https://github.com/divyanshu144/ColorGame-GitHUB) | HTML/CSS/JavaScript color-guessing game. |
| [Blog_app](https://github.com/divyanshu144/Blog_app) | Blog website for reading, writing and creating articles, using HTML/CSS/JavaScript, Node, Express and MongoDB. |
| [Yelp_Camp](https://github.com/divyanshu144/Yelp_Camp) | Course project for creating and reviewing campgrounds, with user accounts and CRUD operations; Node, Express and MongoDB. |
| [F-Movies](https://github.com/divyanshu144/F-Movies) | Netflix-style movie discovery UI with category rows, banner and navigation. App.js loads trending, top-rated and genre categories; streaming playback was not established. |
| [fashion-point](https://github.com/divyanshu144/fashion-point) | Shopping application frontend with product/category administration, authentication, user/admin dashboards and cart routes. |
| [final-year-project](https://github.com/divyanshu144/final-year-project) | React interface for a text-to-image GAN project. On-page explanatory copy states the aim; the inspected frontend does not establish a functioning trained GAN backend. |
| [MyDate-front](https://github.com/divyanshu144/MyDate-front) | React frontend with landing page, sidebar and swipe interface. Appears to be a dating-style UI; matchmaking/backend behavior was not verified. |
| [On-Com](https://github.com/divyanshu144/On-Com) | Authenticated room-based chat frontend with sidebar and room routes. |
| [WeStox](https://github.com/divyanshu144/WeStox) | Cryptocurrency market browser using CoinGecko, with search and saved coin data. Confirmed in Book.js and Main.js; not inferred to be a trading platform. |
| [create-react-app-lambda](https://github.com/divyanshu144/create-react-app-lambda) | Reference demo integrating Create React App, Netlify Lambda and local Netlify development. GitHub does not flag it as a fork, but README presents it as a reference template; not treated as an original product. |
| [JPDB](https://github.com/divyanshu144/JPDB) | JsonPowerDB CRUD learning project. |
| [Authentication](https://github.com/divyanshu144/Authentication) | Frontend/backend authentication setup exercise. README provides installation/configuration instructions; security properties were not assessed. |
| [Food-Finder](https://github.com/divyanshu144/Food-Finder) | Restaurant discovery and reviews application, per README: location-based browsing, restaurant/cuisine details and ratings. |
| [Chatbox](https://github.com/divyanshu144/Chatbox) | Real-time multi-room chat using WebSockets, Express, Node and vanilla JavaScript. |
| [wealth42](https://github.com/divyanshu144/wealth42) | Frontend/backend exercise. Inspected React entry contains a name-search/filter interface with apparent incomplete or erroneous identifiers; broader financial functionality was not established. |

## Forks and learning resources

Fork status identifies upstream work; it does not assess whether local contributions exist. These are not presented as original portfolio products.

| Repository | Purpose |
| --- | --- |
| [algorithms](https://github.com/divyanshu144/algorithms) | Fork of an algorithms and data-structures collection. |
| [developer-roadmap](https://github.com/divyanshu144/developer-roadmap) | Fork of developer learning roadmaps and educational guides. |
| [interview_questions](https://github.com/divyanshu144/interview_questions) | Fork of a curated AI-role interview question collection. |
| [openclaw](https://github.com/divyanshu144/openclaw) | Fork of the OpenClaw personal AI assistant. Not evidence that the upstream assistant was authored here. |
| [Python_learning](https://github.com/divyanshu144/Python_learning) | Fork of TheAlgorithms Python implementations. |
| [mthm503](https://github.com/divyanshu144/mthm503) | Fork of an Applications of Data Science and Statistics course template. |
| [gemini-fullstack-langgraph-quickstart](https://github.com/divyanshu144/gemini-fullstack-langgraph-quickstart) | Fork of Google’s Gemini/LangGraph research-agent starter application. |
| [generative-ai-for-beginners](https://github.com/divyanshu144/generative-ai-for-beginners) | Fork of Microsoft’s introductory generative-AI course. |
| [LLMInterviewQuestions](https://github.com/divyanshu144/LLMInterviewQuestions) | Fork of an LLM interview-question collection. |
| [500-AI-Machine-learning-Deep-learning-Computer-vision-NLP-Projects-with-code](https://github.com/divyanshu144/500-AI-Machine-learning-Deep-learning-Computer-vision-NLP-Projects-with-code) | Fork of a curated collection of AI/ML project links and examples. |
| [ds-cheatsheets](https://github.com/divyanshu144/ds-cheatsheets) | Fork of a data-science cheatsheet collection. |
| [IBM-Data-Science-Professional-Certification](https://github.com/divyanshu144/IBM-Data-Science-Professional-Certification) | Fork of course materials and assignment solutions for the IBM data-science certificate. |
| [namaste-react](https://github.com/divyanshu144/namaste-react) | Fork containing React course notes and application exercises. |
| [spring](https://github.com/divyanshu144/spring) | Fork of Spring/Spring Boot/JPA/Hibernate course examples. |
| [interviews](https://github.com/divyanshu144/interviews) | Fork of software-engineering interview preparation resources. |
| [The-Complete-FAANG-Preparation](https://github.com/divyanshu144/The-Complete-FAANG-Preparation) | Fork of DSA, technical-subject and interview preparation resources. |
| [BookWorm](https://github.com/divyanshu144/BookWorm) | Fork containing bookstore-style HTML assets, including login, registration and shopping pages (many gzip-compressed). Full behavior was not verified. |

## Existing portfolio details to revisit separately

The current public DocChat README uses Qdrant, while the local project card still lists ChromaDB. EPC now documents Prefect, while the local card and skills list mention Airflow. This change updates About only; these findings are recorded for a separate project-card refresh.
