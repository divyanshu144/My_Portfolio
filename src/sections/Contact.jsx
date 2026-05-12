import emailjs from '@emailjs/browser'
import { useRef, useState } from 'react'

const Contact = () => {
    const formRef = useRef()
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState('idle') // 'idle' | 'success' | 'error'
    const [form, setForm] = useState({
        name: '',
        email: '',
        message: ''
    })

    const handleChange = ({target: {name, value}}) => {
        setForm({ ...form, [name]: value})

    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        // emailjs.send(serviceId, templateId, options{})

        try {
            // Use emailjs.send to send the email
            await emailjs.send(
                'service_ohzn687',  // Service ID
                'template_qgar6fd',  // Template ID
                {
                    from_name: form.name,       // Sender's name
                    to_name: 'Divyanshu Charak', // Receiver's name
                    from_email: form.email,     // Sender's email
                    to_email: 'divyanshucharak1407@gmail.com', // Receiver's email
                    message: form.message       // Message content
                },
                'HvkIJyo2oMNIiGQTa' // Public Key
            );
    
            setLoading(false);
            setStatus('success');
            setForm({ name: '', email: '', message: '' });
            setTimeout(() => setStatus('idle'), 5000);
        } catch (error) {
            setLoading(false);
            console.error(error);
            setStatus('error');
            setTimeout(() => setStatus('idle'), 5000);
        }


    }

  return (
    <section className='c-space my-20' id="contact">
        <div className="relative min-h-screen flex items-center justify-center flex-col">
            <img src="/assets/terminal.png" alt="terminal background" className="absolute inset-0 min-h-screen" />

            <div className="contact-container">
            <h3 className="head-text">Contact Me</h3>
            <p className="text-lg text-white-600 mt-3">
                Open to data science and software engineering opportunities, research collaborations, and impactful projects.
            </p>

            <form ref={formRef} onSubmit={handleSubmit} className="mt-12 flex flex-col space-y-7">
                <label className="space-y-3">
                    <span className='field-label'>Full Name</span>
                    <input 
                        type="text" 
                        name="name" 
                        value={form.name} 
                        onChange={handleChange} 
                        className="field-input" 
                        placeholder="John Doe" 
                    />
                </label>
                <label className="space-y-3">
                    <span className='field-label'>Email</span>
                    <input 
                        type="email" 
                        name="email" 
                        value={form.email} 
                        onChange={handleChange} 
                        className="field-input" 
                        placeholder="johndoe@example.com" 
                    />
                </label>
                <label className="space-y-3">
                    <span className='field-label'>Enter your message</span>
                    <textarea
                        name="message" 
                        value={form.message} 
                        onChange={handleChange} 
                        required
                        row={5}
                        className="field-input" 
                        placeholder="Hi, I'm interested in ....." 
                    />
                </label>
                <button className="field-btn" type="submit" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Message'}
                    <img src="/assets/arrow-up.png" alt="arrow-up" className="field-btn_arrow" />
                </button>
                {status === 'success' && (
                  <p className="text-sm text-green-400 text-center">Message sent — I&apos;ll be in touch soon.</p>
                )}
                {status === 'error' && (
                  <p className="text-sm text-red-400 text-center">Something went wrong. Please try again or email me directly.</p>
                )}
            </form>
        </div>
        </div>

    </section>
  )
}

export default Contact
