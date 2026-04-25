'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        router.push('/admin')
      } else {
        const data = await res.json()
        setError(data.error || 'Contraseña incorrecta')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-ink text-white grid place-items-center mx-auto text-lg font-semibold">
            M&amp;F
          </div>
          <h1 className="mt-6 text-display">Admin</h1>
          <p className="mt-2 text-[15px] text-ink-soft">Panel de administración</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="input-apple"
            required
            disabled={loading}
            autoFocus
          />
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Accediendo…' : 'Entrar'}
          </button>
        </form>

        {error && (
          <div className="mt-4 rounded-2xl px-4 py-3 text-[14px] bg-red-50 text-red-900 border border-red-200">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
