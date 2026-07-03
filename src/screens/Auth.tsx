import { useState, useEffect } from 'react'
import { useAuth } from '../lib/auth'
import { c, serif } from '../theme'

// Country codes for LatAm + USA + Canada
const COUNTRY_PHONES = [
  { code: 'MX', flag: '🇲🇽', dial: '+52', name: 'México' },
  { code: 'US', flag: '🇺🇸', dial: '+1', name: 'Estados Unidos' },
  { code: 'CA', flag: '🇨🇦', dial: '+1', name: 'Canadá' },
  { code: 'GT', flag: '🇬🇹', dial: '+502', name: 'Guatemala' },
  { code: 'HN', flag: '🇭🇳', dial: '+504', name: 'Honduras' },
  { code: 'SV', flag: '🇸🇻', dial: '+503', name: 'El Salvador' },
  { code: 'NI', flag: '🇳🇮', dial: '+505', name: 'Nicaragua' },
  { code: 'CR', flag: '🇨🇷', dial: '+506', name: 'Costa Rica' },
  { code: 'PA', flag: '🇵🇦', dial: '+507', name: 'Panamá' },
  { code: 'DO', flag: '🇩🇴', dial: '+1', name: 'Rep. Dominicana' },
  { code: 'CO', flag: '🇨🇴', dial: '+57', name: 'Colombia' },
  { code: 'VE', flag: '🇻🇪', dial: '+58', name: 'Venezuela' },
  { code: 'EC', flag: '🇪🇨', dial: '+593', name: 'Ecuador' },
  { code: 'PE', flag: '🇵🇪', dial: '+51', name: 'Perú' },
  { code: 'BO', flag: '🇧🇴', dial: '+591', name: 'Bolivia' },
  { code: 'BR', flag: '🇧🇷', dial: '+55', name: 'Brasil' },
  { code: 'PY', flag: '🇵🇾', dial: '+595', name: 'Paraguay' },
  { code: 'UY', flag: '🇺🇾', dial: '+598', name: 'Uruguay' },
  { code: 'AR', flag: '🇦🇷', dial: '+54', name: 'Argentina' },
  { code: 'CL', flag: '🇨🇱', dial: '+56', name: 'Chile' },
  { code: 'CU', flag: '🇨🇺', dial: '+53', name: 'Cuba' },
  { code: 'PR', flag: '🇵🇷', dial: '+1', name: 'Puerto Rico' },
]

function detectCountryByTimezone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    const tzMap: Record<string, string> = {
      'America/Mexico_City': 'MX', 'America/Cancun': 'MX', 'America/Monterrey': 'MX',
      'America/Chihuahua': 'MX', 'America/Mazatlan': 'MX', 'America/Hermosillo': 'MX',
      'America/Tijuana': 'MX', 'America/Merida': 'MX',
      'America/New_York': 'US', 'America/Chicago': 'US', 'America/Denver': 'US',
      'America/Los_Angeles': 'US', 'America/Phoenix': 'US', 'America/Anchorage': 'US',
      'Pacific/Honolulu': 'US',
      'America/Toronto': 'CA', 'America/Vancouver': 'CA', 'America/Edmonton': 'CA',
      'America/Winnipeg': 'CA', 'America/Halifax': 'CA',
      'America/Guatemala': 'GT',
      'America/Tegucigalpa': 'HN',
      'America/El_Salvador': 'SV',
      'America/Managua': 'NI',
      'America/Costa_Rica': 'CR',
      'America/Panama': 'PA',
      'America/Santo_Domingo': 'DO',
      'America/Bogota': 'CO',
      'America/Caracas': 'VE',
      'America/Guayaquil': 'EC',
      'America/Lima': 'PE',
      'America/La_Paz': 'BO',
      'America/Sao_Paulo': 'BR', 'America/Recife': 'BR', 'America/Fortaleza': 'BR',
      'America/Asuncion': 'PY',
      'America/Montevideo': 'UY',
      'America/Argentina/Buenos_Aires': 'AR', 'America/Buenos_Aires': 'AR',
      'America/Santiago': 'CL',
      'America/Havana': 'CU',
      'America/Puerto_Rico': 'PR',
    }
    return tzMap[tz] ?? 'MX'
  } catch {
    return 'MX'
  }
}

type Mode = 'login' | 'register' | 'join'

export default function Auth() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [familyName, setFamilyName] = useState('')
  const [phone, setPhone] = useState('')
  const [countryCode, setCountryCode] = useState('MX')
  const [inviteCode, setInviteCode] = useState('')
  const [showCountries, setShowCountries] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  // Detect country on mount
  useEffect(() => {
    const detected = detectCountryByTimezone()
    setCountryCode(detected)

    // Also check URL for invite code
    const params = new URLSearchParams(window.location.search)
    const invite = params.get('invite')
    if (invite) {
      setInviteCode(invite)
      setMode('join')
    }
  }, [])

  const country = COUNTRY_PHONES.find((c) => c.code === countryCode) ?? COUNTRY_PHONES[0]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (mode === 'login') {
        const { error: err } = await signIn(email, password)
        if (err) setError(err)
      } else if (mode === 'register') {
        if (!name.trim()) { setError('Ingresa tu nombre'); setLoading(false); return }
        if (password !== confirmPassword) { setError('Las contraseñas no coinciden'); setLoading(false); return }
        const { error: err } = await signUp(email, password, {
          display_name: name.trim(),
          family_name: familyName.trim() || 'Mi Hogar',
          phone: `${country.dial}${phone}`,
          phone_country: countryCode,
        })
        if (err) {
          setError(err)
        } else {
          setSuccess('¡Cuenta creada! Revisa tu email para confirmar.')
        }
      } else if (mode === 'join') {
        // First register, then join
        if (!name.trim()) { setError('Ingresa tu nombre'); setLoading(false); return }
        if (password !== confirmPassword) { setError('Las contraseñas no coinciden'); setLoading(false); return }
        const { error: regErr } = await signUp(email, password, {
          display_name: name.trim(),
          family_name: '',
          phone: `${country.dial}${phone}`,
          phone_country: countryCode,
        })
        if (regErr) {
          setError(regErr)
        } else {
          // Note: joining will happen after email confirmation + login
          setSuccess('¡Cuenta creada! Confirma tu email y luego inicia sesión para unirte al hogar.')
        }
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="scroll"
      style={{
        minHeight: '100dvh',
        background: c.ink,
        color: c.cream,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              background: c.clay,
              color: c.cream,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: serif,
              fontSize: 30,
              margin: '0 auto 16px auto',
            }}
          >
            G
          </div>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: c.clay, margin: '0 0 6px 0' }}>
            Geny <span style={{ color: c.sage }}>by INGRESARIOS</span>
          </p>
          <h1 style={{ fontFamily: serif, fontWeight: 500, fontSize: 28, margin: 0 }}>
            {mode === 'login' ? 'Bienvenido de vuelta' : mode === 'join' ? 'Únete al hogar' : 'Crea tu cuenta gratis'}
          </h1>
          <p style={{ fontSize: 14, color: c.sage, margin: '8px 0 0 0' }}>
            {mode === 'login'
              ? 'Tu ruta del dinero familiar te espera.'
              : mode === 'join'
                ? 'Vincula tu cuenta al hogar de tu pareja.'
                : 'Empieza a ordenar el dinero de tu familia.'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode !== 'login' && (
            <>
              {/* Name */}
              <div>
                <label style={labelStyle}>Nombre</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  required
                  style={inputStyle}
                />
              </div>

              {/* Family name (only for new registration, not join) */}
              {mode === 'register' && (
                <div>
                  <label style={labelStyle}>Nombre de tu equipo familiar</label>
                  <input
                    type="text"
                    value={familyName}
                    onChange={(e) => setFamilyName(e.target.value)}
                    placeholder="Ej: Equipo García"
                    style={inputStyle}
                  />
                </div>
              )}

              {/* Invite code (for join mode) */}
              {mode === 'join' && (
                <div>
                  <label style={labelStyle}>Código de invitación</label>
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    placeholder="Pega el código aquí"
                    required
                    style={inputStyle}
                  />
                </div>
              )}

              {/* Phone with country code */}
              <div>
                <label style={labelStyle}>Teléfono</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    className="tap"
                    onClick={() => setShowCountries(!showCountries)}
                    style={{
                      background: c.onInkSurface,
                      border: `1px solid ${c.onInkBorder}`,
                      borderRadius: 12,
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      color: c.cream,
                      fontSize: 15,
                      cursor: 'pointer',
                      flex: 'none',
                    }}
                  >
                    <span style={{ fontSize: 20 }}>{country.flag}</span>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{country.dial}</span>
                    <span style={{ fontSize: 10, color: c.sage }}>▾</span>
                  </button>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="10 dígitos"
                    required
                    style={{ ...inputStyle, flex: 1 }}
                  />
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              style={inputStyle}
            />
          </div>

          {/* Password */}
          <div>
            <label style={labelStyle}>Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'login' ? '••••••••' : 'Mínimo 6 caracteres'}
                required
                minLength={6}
                style={{ ...inputStyle, paddingRight: 48 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: c.sage,
                  fontSize: 18,
                }}
                tabIndex={-1}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password (only for register/join) */}
          {mode !== 'login' && (
            <div>
              <label style={labelStyle}>Confirmar Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu contraseña"
                  required
                  minLength={6}
                  style={{ ...inputStyle, paddingRight: 48 }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: c.sage,
                    fontSize: 18,
                  }}
                  tabIndex={-1}
                  aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showConfirmPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Error / Success */}
          {error && (
            <div style={{ background: 'rgba(196,98,45,0.2)', border: '1px solid rgba(196,98,45,0.4)', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: c.clay }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ background: 'rgba(30,107,78,0.2)', border: '1px solid rgba(30,107,78,0.4)', borderRadius: 12, padding: '10px 14px', fontSize: 13, color: '#7FBF9C' }}>
              {success}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="tap"
            style={{
              background: c.clay,
              color: c.cream,
              border: 'none',
              borderRadius: 999,
              padding: 16,
              fontSize: 16,
              fontWeight: 700,
              cursor: loading ? 'wait' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginTop: 8,
            }}
          >
            {loading
              ? 'Cargando…'
              : mode === 'login'
                ? 'Iniciar sesión'
                : mode === 'join'
                  ? 'Crear cuenta y unirme'
                  : 'Crear cuenta gratis'}
          </button>
        </form>

        {/* Toggle login/register */}
        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: c.sage }}>
          {mode === 'login' ? (
            <>
              ¿No tienes cuenta?{' '}
              <button className="reset tap" onClick={() => { setMode('register'); setError(''); setSuccess('') }} style={{ color: c.clay, fontWeight: 700, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}>
                Regístrate gratis
              </button>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{' '}
              <button className="reset tap" onClick={() => { setMode('login'); setError(''); setSuccess('') }} style={{ color: c.clay, fontWeight: 700, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}>
                Inicia sesión
              </button>
            </>
          )}
        </div>

        {/* Country selector overlay */}
        {showCountries && (
          <div
            className="scroll"
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
              background: c.ink,
              padding: '50px 24px 30px 24px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h2 style={{ fontFamily: serif, fontSize: 22, margin: 0 }}>Selecciona tu país</h2>
              <button className="reset tap" onClick={() => setShowCountries(false)} style={{ fontSize: 22, color: c.sage }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
              {COUNTRY_PHONES.map((cp) => {
                const on = cp.code === countryCode
                return (
                  <button
                    key={cp.code}
                    className="reset tap"
                    onClick={() => { setCountryCode(cp.code); setShowCountries(false) }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      background: on ? c.clay : c.onInkSurface,
                      border: on ? 'none' : `1px solid ${c.onInkBorder}`,
                      borderRadius: 14,
                      padding: '14px 16px',
                      color: c.cream,
                    }}
                  >
                    <span style={{ fontSize: 22 }}>{cp.flag}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, flex: 1, textAlign: 'left' }}>{cp.name}</span>
                    <span style={{ fontSize: 14, color: on ? c.cream : c.sage, fontWeight: 600 }}>{cp.dial}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#9DBBA9',
  display: 'block',
  marginBottom: 6,
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(245,241,233,0.07)',
  border: '1px solid rgba(245,241,233,0.15)',
  borderRadius: 12,
  padding: '14px 16px',
  fontSize: 15,
  color: '#F5F1E9',
  outline: 'none',
  boxSizing: 'border-box',
}
