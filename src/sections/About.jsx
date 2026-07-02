import { useState } from 'react';
import Globe from 'react-globe.gl';

import Button from '../components/Button.jsx';

const About = () => {

  const [hasCopied, setHasCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('divyanshucharak1407@gmail.com');
    setHasCopied(true);

    setTimeout(() => {
      setHasCopied(false);
    }, 2000);
  };

  return (
    <section className="c-space my-20" id="about">
      <div className="about-masonry">
        <div className="col-span-1 xl:row-span-3">
          <div className="about-card about-card_compact">
            <div className="space-y-3">
              <p className="about-kicker">About</p>
              <p className="about-heading">Divyanshu Charak</p>
              <p className="about-body">
                Software engineer and MSc Statistical Data Science graduate (Merit, University of Exeter) with 3+ years
                at Mphasis. I build production-grade AI systems, data pipelines, and full-stack applications —
                combining engineering rigour with a data-first mindset.
              </p>
              <div className="about-meta">Exeter, UK · Open to remote · UK Graduate Route visa (applied)</div>
            </div>
          </div>
        </div>

        <div className="col-span-1 xl:row-span-3">
          <div className="about-card about-card_compact">
            <div className="space-y-3">
              <p className="about-kicker">Technical Strengths</p>
              <p className="about-heading">AI · Data · Full-Stack</p>
              <p className="about-body">
                Python, FastAPI, RAG/LLMs, XGBoost, Airflow, MLflow — plus React, Next.js, TypeScript, and Docker
                for production systems end-to-end.
              </p>
              <div className="about-chips">
                <span className="about-chip about-chip--ai">Python</span>
                <span className="about-chip about-chip--ai">FastAPI</span>
                <span className="about-chip about-chip--ai">LLMs / RAG</span>
                <span className="about-chip about-chip--ai">XGBoost</span>
                <span className="about-chip about-chip--ai">Airflow</span>
                <span className="about-chip about-chip--fe">React</span>
                <span className="about-chip about-chip--fe">Next.js</span>
                <span className="about-chip about-chip--fe">TypeScript</span>
                <span className="about-chip about-chip--ops">Docker</span>
                <span className="about-chip about-chip--ops">PostgreSQL</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="about-card about-card_compact">
            <div className="space-y-3">
              <p className="about-kicker">Impact</p>
              <p className="about-heading">By the numbers</p>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <p className="text-3xl font-bold text-white tracking-tight">1.8M</p>
                  <p className="about-meta mt-0.5">EPC records processed</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white tracking-tight">9×</p>
                  <p className="about-meta mt-0.5">eval engine speedup</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white tracking-tight">20%</p>
                  <p className="about-meta mt-0.5">app perf improvement</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white tracking-tight">40%</p>
                  <p className="about-meta mt-0.5">test coverage increase</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-1 xl:row-span-4">
          <div className="about-card about-card_compact">
            <div className="rounded-3xl w-full sm:h-[326px] h-fit flex justify-center items-center">
              <Globe
                height={326}
                width={326}
                backgroundColor="rgba(0, 0, 0, 0)"
                backgroundImageOpacity={0.5}
                showAtmosphere
                showGraticules
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
              />
            </div>
            <div className="space-y-3">
              <p className="about-kicker">Availability</p>
              <p className="about-heading">Flexible across time zones</p>
              <p className="about-body">Based in Exeter, UK and open to remote work worldwide.</p>
              <Button name="Contact Me" isBeam containerClass="w-full mt-6" />
            </div>
          </div>
        </div>

        <div>
          <div className="about-card about-card_compact">
            <div className="space-y-3">
              <p className="about-kicker">Beyond Work</p>
              <p className="about-heading">Free time</p>
              <p className="about-body">
                I work part-time as a barista at Starbucks and unwind with table tennis, badminton, reading, running,
                gym sessions, and cycling.
              </p>
            </div>
          </div>
        </div>

        <div>
          <div className="about-card about-card_compact">
            <div className="space-y-3">
              <p className="about-kicker">Education</p>
              <p className="about-heading">Academic focus</p>
              <div className="about-list">
                <div className="about-list_item">
                  <p className="about-body">
                    University of Exeter — MSc Statistical Data Science
                  </p>
                  <p className="about-meta">Jan 2025 – Jan 2026 · Merit</p>
                </div>
                <div className="about-divider" />
                <div className="about-list_item">
                  <p className="about-body">PES University — B.E. Computer Science</p>
                  <p className="about-meta">2017 – 2021 · GPA 8.0/10</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="about-card">
            <div className="space-y-3">
              <p className="about-kicker">Leadership</p>
              <p className="about-heading">Ownership & collaboration</p>
              <ul className="about-list">
                <li className="about-body">Owned modules end-to-end and shipped production features.</li>
                <li className="about-body">Partnered with QA, backend, and DB for integration quality.</li>
                <li className="about-body">Mentored teammates and supported delivery planning.</li>
              </ul>
              <div className="copy-container" onClick={handleCopy}>
                <img src={hasCopied ? 'assets/tick.svg' : 'assets/copy.svg'} alt="copy" />
                <p className="lg:text-xl md:text-md font-medium text-gray_gradient text-white">divyanshucharak1407@gmail.com</p>
              </div>
              <p className="about-meta text-center">+44 7407 103 440</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
