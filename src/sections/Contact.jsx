import emailjs from '@emailjs/browser'
import React, { useRef, useState } from 'react'

const Contact = () => {
    const formRef = useRef()
    const [loading, setLoading] = useState(false)
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
                    to_email: 'divyanshucharak14@gmail.com', // Receiver's email
                    message: form.message       // Message content
                },
                'HvkIJyo2oMNIiGQTa' // Public Key
            );
    
            setLoading(false);   // Stop loading state
            alert('Your message has been sent!'); // Success message

            setForm({
                name: '',
                email: '',
                message: ''
            })
    
        } catch (error) {
            setLoading(false);   // Stop loading state
    
            console.log(error);  // Log the error
            alert("Something went wrong"); // Error message
        }


    }

  return (
    <section className='c-space my-20'>
        <div className="relative min-h-screen flex items-center justify-center flex-col">
            <img src="/assets/terminal.png" alt="terminal background" className="absolute inset-0 min-h-screen" />

            <div className="contact-container">
            <h3 className="head-text">Contact Me</h3>
            <p className="text=lg text-white-600 mt-3">
                Whether you're looking to build a new website, improve your existing platform, or bring a unique project to life, I'm here to help.
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
            </form>
        </div>
        </div>

    </section>
  )
}

export default Contact
