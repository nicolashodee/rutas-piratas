import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setStatus('sending')
    setErrorMsg('')

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setStatus('error')
      setErrorMsg(error.message)
    } else {
      setStatus('sent')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-paper">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-bone p-8">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="font-kara text-3xl tracking-wider">Rutas Piratas</h1>
          <span className="text-gold text-xl leading-none mt-1">⚓</span>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Recibe un enlace mágico para conectarte
        </p>

        {status === 'sent' ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">
            ✓ Enlace enviado a <strong>{email}</strong>.<br />
            Revisa tu correo (incluido spam).
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-bone rounded-lg px-3 py-2 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
                placeholder="tu@email.com"
                disabled={status === 'sending'}
              />
            </div>

            {status === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'sending'}
              className="w-full bg-ink text-parchment border border-ink shadow-stamp rounded py-2.5 font-medium hover:bg-ink_soft hover:shadow-md active:translate-y-[1px] transition disabled:opacity-50"
            >
              {status === 'sending' ? 'Enviando…' : 'Recibir enlace mágico'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
