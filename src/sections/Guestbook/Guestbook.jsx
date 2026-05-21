'use client'

import { useMemo, useState } from 'react'
import useScrollReveal from '../../hooks/useScrollReveal.js'
import styles from './Guestbook.module.css'

const DEFAULTS = { title: 'Leave a Note', subtitle: '', initialNotes: [] }

const COLOR_CYCLE = ['gold', 'coral', 'sky', 'emerald', 'purple']

export default function Guestbook(props) {
  const { title, subtitle, initialNotes } = { ...DEFAULTS, ...props }
  const { ref, isVisible } = useScrollReveal()

  const [notes, setNotes] = useState(() =>
    (initialNotes || []).map((n) => ({ ...n }))
  )
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')

  const rotations = useMemo(
    () => notes.map(() => (Math.random() * 6 - 3).toFixed(2)),
    [notes.length],
  )

  const submit = (e) => {
    e.preventDefault()
    if (!name.trim() || !message.trim()) return
    const next = {
      id: `note-${Date.now()}`,
      name: name.trim(),
      message: message.trim(),
      color: COLOR_CYCLE[notes.length % COLOR_CYCLE.length],
    }
    setNotes((prev) => [next, ...prev])
    setName('')
    setMessage('')
  }

  return (
    <section
      ref={ref}
      className={`${styles.section} ${isVisible ? styles.visible : ''}`}
      aria-label="Guestbook"
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>From the heart</p>
          <h2 className={styles.title}>{title}</h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </header>

        <form className={styles.form} onSubmit={submit}>
          <input
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            aria-label="Your name"
            maxLength={40}
            required
          />
          <textarea
            className={styles.textarea}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write a short wish…"
            aria-label="Your message"
            rows={3}
            maxLength={240}
            required
          />
          <button type="submit" className={styles.submit}>Pin my note</button>
        </form>

        <div className={styles.grid}>
          {notes.map((note, idx) => (
            <article
              key={note.id}
              className={`${styles.note} ${styles[`color-${note.color || 'gold'}`]}`}
              style={{ '--rot': `${rotations[idx] ?? 0}deg` }}
            >
              <p className={styles.noteMessage}>“{note.message}”</p>
              <p className={styles.noteName}>— {note.name}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
