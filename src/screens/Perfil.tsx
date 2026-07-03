import { useAuth } from '../lib/auth'
import { useStore } from '../store'
import { c, serif } from '../theme'

export default function Perfil() {
  const { user, profile, household, members, signOut } = useAuth()
  const { dispatch } = useStore()

  return (
    <div
      className="scroll"
      style={{ position: 'fixed', inset: 0, zIndex: 50, background: c.cream, color: c.ink, display: 'flex', flexDirection: 'column' }}
    >
      {/* Header */}
      <div style={{ padding: '52px 22px 12px 22px' }}>
        <button
          className="reset tap"
          onClick={() => dispatch({ type: 'CLOSE_PERFIL' })}
          style={{ display: 'flex', alignItems: 'center', gap: 4, color: c.muted2, fontSize: 13, fontWeight: 600, marginBottom: 8 }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>‹</span> Inicio
        </button>
        <h1 style={{ fontFamily: serif, fontWeight: 500, fontSize: 26, margin: 0 }}>Mi perfil</h1>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '0 22px 40px 22px' }}>

        {/* Profile card */}
        <div style={{ background: c.ink, color: c.cream, borderRadius: 18, padding: '24px 20px', marginBottom: 16, textAlign: 'center' }}>
          <div style={{
            width: 64, height: 64, borderRadius: 999,
            background: profile?.avatar_color ?? c.clay, color: c.cream,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, fontWeight: 700, margin: '0 auto 12px auto',
          }}>
            {profile?.avatar_initial ?? 'U'}
          </div>
          <p style={{ fontFamily: serif, fontSize: 22, fontWeight: 500, margin: '0 0 4px 0' }}>
            {profile?.display_name ?? 'Usuario'}
          </p>
          <p style={{ fontSize: 13, color: c.sage, margin: 0 }}>
            {user?.email}
          </p>
          {profile?.phone && (
            <p style={{ fontSize: 12, color: c.sage, margin: '4px 0 0 0' }}>
              {profile.phone_country === 'MX' ? '🇲🇽' : '📱'} {profile.phone}
            </p>
          )}
        </div>

        {/* Family section */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Mi familia</h2>
            <span style={{ fontSize: 12, color: c.muted, fontWeight: 600 }}>{members.length} miembro{members.length !== 1 ? 's' : ''}</span>
          </div>

          {/* Family name */}
          {household && (
            <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 14, padding: '14px 16px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 20, flex: 'none' }}>🏠</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 700, margin: '0 0 2px 0' }}>Familia {household.family_name}</p>
                <p style={{ fontSize: 12, color: c.muted, margin: 0 }}>
                  {household.country === 'MX' ? '🇲🇽 México' : household.country} · {household.currency}
                </p>
              </div>
            </div>
          )}

          {/* Members list */}
          <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
            {members.map((member, i) => {
              const isMe = member.id === profile?.id
              return (
                <div
                  key={member.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '14px 16px',
                    borderBottom: i < members.length - 1 ? `1px solid ${c.cardBorder}` : 'none',
                  }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: 999,
                    background: member.avatar_color, color: c.cream,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 15, fontWeight: 700, flex: 'none',
                  }}>
                    {member.avatar_initial}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, margin: '0 0 1px 0' }}>
                      {member.display_name}
                      {isMe && <span style={{ fontSize: 11, color: c.clay, fontWeight: 600, marginLeft: 6 }}>(Tú)</span>}
                    </p>
                    <p style={{ fontSize: 12, color: c.muted, margin: 0 }}>Miembro de la familia</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Invite family */}
        {household && (
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 10px 0' }}>Invitar a un familiar</h2>
            <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 14, padding: '16px 16px' }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
                <span style={{ fontSize: 28, flex: 'none' }}>💌</span>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, margin: '0 0 4px 0' }}>Invita a tu pareja o familia</p>
                  <p style={{ fontSize: 12.5, color: c.muted, margin: 0, lineHeight: 1.45 }}>
                    Al abrir el link, tu familiar podrá crear su cuenta y automáticamente se unirá a tu familia <strong>{household.family_name}</strong>. Ambos verán los mismos gastos e ingresos.
                  </p>
                </div>
              </div>

              {/* Steps */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16, padding: '0 8px' }}>
                {[
                  'Tú envías el link por WhatsApp o mensaje',
                  'Tu familiar abre el link y se registra',
                  'Automáticamente se une a la familia',
                  '¡Empiezan a registrar gastos juntos!',
                ].map((step, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 999, background: c.ink, color: c.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flex: 'none' }}>
                      {i + 1}
                    </div>
                    <span style={{ fontSize: 12.5, color: '#43544A' }}>{step}</span>
                  </div>
                ))}
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  className="reset tap"
                  onClick={() => {
                    const url = `${window.location.origin}?invite=${household.invite_code}`
                    const text = `¡Hola! Te invito a que nos unamos en Geny para llevar las finanzas juntos. 💰\n\nAbre este link para crear tu cuenta y unirte a la familia ${household.family_name}:\n${url}`
                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
                  }}
                  style={{ width: '100%', padding: 14, borderRadius: 999, background: '#25D366', color: '#fff', fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  <span style={{ fontSize: 18 }}>📲</span> Invitar por WhatsApp
                </button>
                <button
                  className="reset tap"
                  onClick={() => {
                    const url = `${window.location.origin}?invite=${household.invite_code}`
                    if (navigator.share) {
                      navigator.share({ title: 'Únete a nuestra familia en Geny', url }).catch(() => {})
                    } else {
                      navigator.clipboard?.writeText(url).then(() => alert('¡Link copiado!'))
                    }
                  }}
                  style={{ width: '100%', padding: 14, borderRadius: 999, border: `1px solid ${c.cardBorder}`, fontSize: 14, fontWeight: 700, color: c.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  🔗 Copiar link de invitación
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Account info */}
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 10px 0' }}>Cuenta</h2>
          <div style={{ background: c.card, border: `1px solid ${c.cardBorder}`, borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: `1px solid ${c.cardBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: c.muted, fontWeight: 600 }}>Email</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{user?.email}</span>
            </div>
            <div style={{ padding: '14px 16px', borderBottom: `1px solid ${c.cardBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: c.muted, fontWeight: 600 }}>Moneda</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{household?.currency ?? 'MXN'}</span>
            </div>
            <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: c.muted, fontWeight: 600 }}>País</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{household?.country === 'MX' ? '🇲🇽 México' : household?.country ?? '—'}</span>
            </div>
          </div>
        </div>

        {/* Sign out */}
        <button
          className="reset tap"
          onClick={signOut}
          style={{ width: '100%', padding: 15, borderRadius: 999, border: `1px solid rgba(196,98,45,0.5)`, color: c.clay, fontSize: 14, fontWeight: 700, textAlign: 'center' }}
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
