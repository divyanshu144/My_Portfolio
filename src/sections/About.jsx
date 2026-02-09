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
      <div className="grid xl:grid-cols-3 xl:grid-rows-6 md:grid-cols-2 grid-cols-1 gap-5 h-full">
        <div className="col-span-1 xl:row-span-3">
          <div className="grid-container">
            <img src="assets/grid1.png" alt="grid-1" className="w-full sm:h-[276px] h-fit object-contain" />

            <div>
              <p className="grid-headtext">Hi, I’m Divyanshu Charak</p>
              <p className="grid-subtext">
                MSc Statistical Data Science candidate at the University of Exeter with a background in software
                engineering and data-driven product development. Received the Kudos & Fearless Award at Mphasis and
                mentor undergraduates in Python and data structures.
              </p>
            </div>
          </div>
        </div>

        <div className="col-span-1 xl:row-span-3">
          <div className="grid-container">
            <img src="assets/techstack.png" alt="grid-2" className="w-full sm:h-[276px] h-fit object-contain rounded-lg" />

            <div>
              <p className="grid-headtext">Technical Skills</p>
              <p className="grid-subtext">
                Python, R, SQL, C/C++, pandas, NumPy, scikit-learn, Power BI, Tableau, Streamlit, React.js, REST APIs,
                Git, Docker, and Agile Scrum.
              </p>
            </div>
          </div>
        </div>

        <div className="col-span-1 xl:row-span-4">
          <div className="grid-container">
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
            <div>
              <p className="grid-headtext">Flexible with time zones & locations</p>
              <p className="grid-subtext">Based in Exeter, UK and open to remote work worldwide.</p>
              <Button name="Contact Me" isBeam containerClass="w-full mt-10" />
            </div>
          </div>
        </div>

        <div className="xl:col-span-2 xl:row-span-3">
          <div className="grid-container">
            <img src="assets/grid3.png" alt="grid-3" className="w-full sm:h-[266px] h-fit object-contain" />

            <div>
              <p className="grid-headtext">Education</p>
              <p className="grid-subtext">
                University of Exeter, UK — MSc Statistical Data Science (Expected Jan 2026).
                PES University, Bangalore — BE Computer Science & Engineering (Jul 2021), GPA 8/10.
              </p>
            </div>
          </div>
        </div>

        <div className="xl:col-span-1 xl:row-span-2">
          <div className="grid-container">
            <img
              src="assets/grid4.png"
              alt="grid-4"
              className="w-full md:h-[126px] sm:h-[276px] h-fit object-cover sm:object-top"
            />

            <div className="space-y-2">
              <p className="grid-subtext text-center">Contact me</p>
              <div className="copy-container" onClick={handleCopy}>
                <img src={hasCopied ? 'assets/tick.svg' : 'assets/copy.svg'} alt="copy" />
                <p className="lg:text-xl md:text-md font-medium text-gray_gradient text-white">divyanshucharak1407@gmail.com</p>
              </div>
              <p className="grid-subtext text-center">+44 7407 103 440</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
