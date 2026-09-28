import emailjs from '@emailjs/browser'
import { useState } from 'react'
import portfolioData from '../../data/portfolioData.json'
import { isContactValid } from '../lib/validateContact'

const EMPTY = { name: '', email: '', message: '' }

const Contact = () => {
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('idle') // 'idle' | 'success' | 'error'

  const canSubmit = isContactValid(form) && !loading

  const handleChange = ({ target: { name, value } }) =>
    setForm((f) => ({ ...f, [name]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    try {
      await emailjs.send(
        'service_ohzn687',   // Service ID
        'template_qgar6fd',  // Template ID
        {
          from_name: form.name.trim(),
          to_name: portfolioData.name,
          from_email: form.email.trim(),
          to_email: portfolioData.contact.email,
          message: form.message.trim(),
        },
        'HvkIJyo2oMNIiGQTa', // Public Key
      )
      setStatus('success')
      setForm(EMPTY)
    } catch (error) {
      console.error(error)
      setStatus('error')
    } finally {
      setLoading(false)
      setTimeout(() => setStatus('idle'), 5000)
    }
  }

  return (
    <>
      <address className="contact-location">
        <div className="icon-box"><ion-icon name="location-outline"></ion-icon></div>
        <span>{portfolioData.location}</span>
      </address>

      <section className="contact-form">
        <h3 className="h3 form-title">Contact Form</h3>

        <form className="form" onSubmit={handleSubmit}>
          <div className="input-wrapper">
            <input type="text" name="name" className="form-input" placeholder="Full name"
              value={form.name} onChange={handleChange} required />
            <input type="email" name="email" className="form-input" placeholder="Email address"
              value={form.email} onChange={handleChange} required />
          </div>

          <textarea name="message" className="form-input" placeholder="Your message"
            value={form.message} onChange={handleChange} required></textarea>

          <button className="form-btn" type="submit" disabled={!canSubmit}>
            <ion-icon name="paper-plane"></ion-icon>
            <span>{loading ? 'Sending…' : 'Send Message'}</span>
          </button>

          {status === 'success' && <p className="status-ok" role="status">Message sent. I&apos;ll be in touch soon.</p>}
          {status === 'error' && (
            <p className="status-err" role="status">Something went wrong. Please try again or email me directly.</p>
          )}
        </form>
      </section>
    </>
  )
}

export default Contact
