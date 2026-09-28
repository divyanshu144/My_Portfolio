const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const isContactValid = ({ name, email, message }) =>
  name.trim().length > 0 && EMAIL_RE.test(email.trim()) && message.trim().length > 0
