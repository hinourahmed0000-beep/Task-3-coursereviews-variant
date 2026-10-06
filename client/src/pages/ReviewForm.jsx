import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = { courseCode: '', rating: 5, comment: '' }

export default function ReviewForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(Boolean(id))
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    setError('')
    setForm(defaults)
    setLoading(Boolean(id))

    if (!id) return

    async function loadReview() {
      try {
        const { data } = await api.get(`/reviews/${id}`)
        if (active) {
          setForm({
            courseCode: data.review.courseCode,
            rating: Number(data.review.rating),
            comment: data.review.comment ?? ''
          })
        }
      } catch (err) {
        if (active) {
          setError(err.response?.data?.message || 'Could not load review.')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadReview()
    return () => { active = false }
  }, [id])

  function onChange(e) {
    const { name, value } = e.target
    setForm(previous => ({
      ...previous,
      [name]: name === 'rating' ? Number(value) : value
    }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)

    const payload = {
      courseCode: form.courseCode,
      rating: form.rating,
      comment: form.comment
    }

    try {
      if (id) {
        await api.patch(`/reviews/${id}`, payload)
      } else {
        await api.post('/reviews', payload)
      }
      nav('/reviews')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save review.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">
        {id ? 'Edit' : 'Write'} Review
      </h1>

      {loading && <p>Loading review...</p>}

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full border rounded px-3 py-2"
          name="courseCode"
          placeholder="Course code (e.g. CS101)"
          aria-label="Course code"
          value={form.courseCode}
          onChange={onChange}
          required
          disabled={loading || saving}
        />

        <select
          className="w-full border rounded px-3 py-2"
          name="rating"
          aria-label="Rating"
          value={form.rating}
          onChange={onChange}
          disabled={loading || saving}
        >
          {[1, 2, 3, 4, 5].map(rating => (
            <option key={rating} value={rating}>
              {rating} / 5
            </option>
          ))}
        </select>

        <textarea
          className="w-full border rounded px-3 py-2"
          name="comment"
          placeholder="Comment (optional)"
          aria-label="Comment"
          value={form.comment}
          onChange={onChange}
          rows={3}
          disabled={loading || saving}
        />

        {error && (
          <div className="text-red-600 text-sm" role="alert">
            {error}
          </div>
        )}

        <button
          className="btn"
          type="submit"
          disabled={loading || saving}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  )
}
