import React from 'react'
import Navbar from './sections/Navbar'
import Hero from './sections/Hero'
import About from './sections/About'
import Projects from './sections/Projects'
import Contact from './sections/Contact'
import Footer from './sections/Footer'
import Experience from './sections/Experience'

const App = () => {
  return (
   <main className="max-w-7xl mx-auto relative">
      <Navbar/>
      <Hero/>
      <About/>
      <Projects/>
      <Experience />

      <Contact/>
      <br/>
      <br/>
      <Footer/>
   </main>
  )
}

export default App
