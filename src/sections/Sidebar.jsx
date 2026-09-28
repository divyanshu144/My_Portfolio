import { useState } from 'react'
import portfolioData from '../../data/portfolioData.json'

const { name, location, contact, targetRoles } = portfolioData

const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2)

const Sidebar = () => {
  const [open, setOpen] = useState(false)
  const [imgFailed, setImgFailed] = useState(false)

  return (
    <aside className={`sidebar${open ? ' active' : ''}`}>
      <div className="sidebar-info">
        <figure className="avatar-box">
          {imgFailed ? (
            <span className="avatar-initials">{initials}</span>
          ) : (
            <img src="/assets/div-avatar.jpg" alt={name} width="80" onError={() => setImgFailed(true)} />
          )}
        </figure>

        <div className="info-content">
          <h1 className="name" title={name}>{name}</h1>
          <p className="title">{targetRoles[0]}</p>
        </div>

        <button className="info_more-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label="Show contacts">
          <span>Show Contacts</span>
          <ion-icon name="chevron-down" aria-hidden="true"></ion-icon>
        </button>
      </div>

      <div className="sidebar-info_more">
        <div className="separator"></div>

        <ul className="contacts-list">
          <li className="contact-item">
            <div className="icon-box"><ion-icon name="mail-outline"></ion-icon></div>
            <div className="contact-info">
              <p className="contact-title">Email</p>
              <a href={`mailto:${contact.email}`} className="contact-link">{contact.email}</a>
            </div>
          </li>
          <li className="contact-item">
            <div className="icon-box"><ion-icon name="phone-portrait-outline"></ion-icon></div>
            <div className="contact-info">
              <p className="contact-title">Phone</p>
              <a href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`} className="contact-link">{contact.phone}</a>
            </div>
          </li>
          <li className="contact-item">
            <div className="icon-box"><ion-icon name="location-outline"></ion-icon></div>
            <div className="contact-info">
              <p className="contact-title">Location</p>
              <address>{location}</address>
            </div>
          </li>
        </ul>

        <div className="separator"></div>

        <ul className="social-list">
          <li className="social-item">
            <a href={contact.github} className="social-link" target="_blank" rel="noreferrer" aria-label="GitHub">
              <ion-icon name="logo-github"></ion-icon>
            </a>
          </li>
          <li className="social-item">
            <a href={contact.linkedin} className="social-link" target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <ion-icon name="logo-linkedin"></ion-icon>
            </a>
          </li>
        </ul>
      </div>
    </aside>
  )
}

export default Sidebar
