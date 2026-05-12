
const Footer = () => {
  return (
        <section className="c-space pt-12 pb-3 border-t border-black-300 flex justify-between items-center flex-wrap gap-5">
        <p className="text-white-500 text-sm">Built with React, Three.js &amp; AI</p>

        <div className="flex gap-3">
            <div className="social-icon">
                <a href="https://github.com/divyanshu144" target="_blank" rel="noreferrer" aria-label="GitHub">
                    <img src="/assets/github.svg" alt="GitHub" className="w-5 h-5 opacity-70 hover:opacity-100 transition-opacity" />
                </a>
            </div>
            <div className="social-icon">
                <a href="https://www.linkedin.com/in/divyanshu-charak-a1820516a/" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                    <img src="/assets/linkedin.png" alt="LinkedIn" className="w-5 h-5 opacity-70 hover:opacity-100 transition-opacity" />
                </a>
            </div>
            <div className="social-icon">
                <a href="mailto:divyanshucharak1407@gmail.com" aria-label="Email">
                    <svg className="w-5 h-5 opacity-70 hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24" style={{color:'#AFB0B6'}}>
                      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/>
                    </svg>
                </a>
            </div>
        </div>
        <p className="text-white-500 text-sm">© 2026 Divyanshu Charak</p>
    </section>
  )
}

export default Footer
