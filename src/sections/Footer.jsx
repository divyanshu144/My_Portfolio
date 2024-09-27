import React from 'react'

const Footer = () => {
  return (
        <section className="c-space pt-12 pb-3 border-t border-black-300 flex justify-between items-center flex-wrap gap-5">
        <div className="text-white-500 flex gap-2">
            <p>Terms & Conditions</p>
            <p>|</p>
            <p> Privacy Policy</p>
        </div>

        <div className="flex gap-3">
            <div className="social-icon">
                <a
                className="flex items-center gap-2 cursor-pointer text-white-600"
                href="https://github.com/divyanshu144"
                target="_blank"
                rel="noreferrer">
                    <img src="/assets/github.svg" alt="twitter" className="w-8 h-8" />
                </a>
            </div>
            <div className="social-icon">
                <a
                className="flex items-center gap-2 cursor-pointer text-white-600"
                href="https://www.linkedin.com/in/divyanshu-charak-a1820516a/"
                target="_blank"
                rel="noreferrer">
                    <img src="/assets/linkedin.png" alt="linkedin" className="w-8 h-8" />
                </a>
            </div>
            <div className="social-icon">
                <a
                className="flex items-center gap-2 cursor-pointer text-white-600"
                href="https://www.instagram.com/divyanshu_charak/"
                target="_blank"
                rel="noreferrer">
                    <img src="/assets/instagram.svg" alt="instagram" className="w-8 h-8" />
                </a>
            </div>
        </div>
        <p className="text-white-500">@ 2024 Divyanshu. All rights reserved</p>
    </section>
  )
}

export default Footer
