import { useEffect, useState } from 'react'
import { SUBSTACK_URL } from '../constants'

const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })

const Fallback = ({ message }) => (
  <section className="blog-posts">
    <p className="state-note">
      {message}{' '}
      <a className="state-link" href={SUBSTACK_URL} target="_blank" rel="noreferrer">Read on Substack →</a>
    </p>
  </section>
)

const Blog = () => {
  const [state, setState] = useState({ status: 'loading', posts: [] })

  useEffect(() => {
    let cancelled = false
    fetch('/api/blog')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data) => { if (!cancelled) setState({ status: 'ready', posts: data.posts ?? [] }) })
      .catch(() => { if (!cancelled) setState({ status: 'error', posts: [] }) })
    return () => { cancelled = true }
  }, [])

  if (state.status === 'loading') return <p className="state-note">Loading posts…</p>
  if (state.status === 'error') return <Fallback message="Couldn't load posts right now." />
  if (state.posts.length === 0) return <Fallback message="No posts yet." />

  return (
    <section className="blog-posts">
      <ul className="blog-posts-list">
        {state.posts.map((post) => (
          <li className="blog-post-item" key={post.url}>
            <a href={post.url} target="_blank" rel="noreferrer">
              {post.image && (
                <figure className="blog-banner-box">
                  <img src={post.image} alt={post.title} loading="lazy" />
                </figure>
              )}
              <div className="blog-content">
                <div className="blog-meta">
                  <p className="blog-category">Substack</p>
                  {post.date && (
                    <>
                      <span className="dot"></span>
                      <time dateTime={post.date}>{dateFmt.format(new Date(post.date))}</time>
                    </>
                  )}
                </div>
                <h3 className="h3 blog-item-title">{post.title}</h3>
                {post.excerpt && <p className="blog-text">{post.excerpt}</p>}
              </div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Blog
