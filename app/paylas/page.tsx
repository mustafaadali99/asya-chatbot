'use client'
import { useEffect, useState } from 'react'

export default function PaylasPage() {
  const [refUrl, setRefUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [igCopied, setIgCopied] = useState(false)
  const [canShare, setCanShare] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const url = params.get('url') || ''
    setRefUrl(url)
    setCanShare(typeof navigator !== 'undefined' && 'share' in navigator)
  }, [])

  const message = `Sana özel bir hediyem var 🎁 ASYA yapay zeka koku asistanıyla koku testini tamamlarsan ikiniz de %50 indirim kazanıyoruz! Ücretsiz dene 👉 ${refUrl}`

  const handleCopy = () => {
    navigator.clipboard.writeText(refUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  const handleInstagram = () => {
    navigator.clipboard.writeText(message).then(() => {
      setIgCopied(true)
      setTimeout(() => {
        setIgCopied(false)
        // Mobilde Instagram uygulamasını aç, masaüstünde web'i aç
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
        if (isMobile) {
          window.location.href = 'instagram://direct-inbox'
          setTimeout(() => {
            window.open('https://www.instagram.com/direct/inbox/', '_blank')
          }, 1200)
        } else {
          window.open('https://www.instagram.com/direct/inbox/', '_blank')
        }
      }, 1000)
    })
  }

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'ASYA Koku Asistanı — Ücretsiz Koku Testi',
        text: message,
        url: refUrl,
      }).catch(() => {})
    }
  }

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(refUrl)}&text=${encodeURIComponent('ASYA ile ücretsiz koku testi yap, ikiniz de %50 indirim kazan! 🎁')}`

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(155deg,#F5F2FC 0%,#EDE8F8 50%,#E8EEF8 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      fontFamily: 'Inter,Arial,sans-serif',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 28,
        padding: '40px 32px',
        maxWidth: 420,
        width: '100%',
        boxShadow: '0 20px 60px rgba(43,38,64,0.14)',
        textAlign: 'center',
      }}>
        {/* Logo */}
        <img
          src="/koku-asistani/elegance logo.png"
          alt="Elegance VIP"
          style={{ width: 150, marginBottom: 24, opacity: 0.9 }}
        />


        {/* Başlık */}
        <div style={{ fontSize: 10, letterSpacing: '0.28em', color: '#8A7FAA', fontWeight: 600, textTransform: 'uppercase', marginBottom: 10 }}>
          Arkadaşını Davet Et
        </div>
        <h1 style={{ fontFamily: 'Georgia,serif', fontWeight: 400, fontSize: 26, color: '#2B2640', margin: '0 0 10px', lineHeight: 1.25 }}>
          İkiniz de <em style={{ fontStyle: 'italic' }}>%50 indirim</em> kazanın!
        </h1>
        <p style={{ fontSize: 14, color: '#5E5878', lineHeight: 1.65, margin: '0 0 28px' }}>
          Arkadaşın ASYA ile koku testini tamamlarsa ikiniz de 2. üründe %50 indirim kazanıyorsunuz.
        </p>

        {/* Link Kutusu */}
        <div style={{
          background: '#F5F2FC',
          border: '1.5px solid rgba(185,165,232,.35)',
          borderRadius: 14,
          padding: '12px 16px',
          marginBottom: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <span style={{ flex: 1, fontSize: 12, color: '#5B4A82', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'left' }}>
            {refUrl || 'Yükleniyor...'}
          </span>
          <button
            onClick={handleCopy}
            style={{
              flexShrink: 0,
              padding: '7px 16px',
              borderRadius: 999,
              border: 'none',
              background: copied ? '#5B4A82' : 'linear-gradient(135deg,#B9A5E8,#9FB4E0)',
              color: '#fff',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all .2s',
              whiteSpace: 'nowrap',
            }}
          >
            {copied ? '✓ Kopyalandı' : 'Kopyala'}
          </button>
        </div>

        {/* Paylaşım Butonları */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>

          {/* WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              padding: '14px',
              borderRadius: 14,
              background: '#25D366',
              color: '#fff',
              textDecoration: 'none',
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp ile Gönder
          </a>

          {/* Telegram */}
          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              padding: '14px',
              borderRadius: 14,
              background: '#2AABEE',
              color: '#fff',
              textDecoration: 'none',
              fontSize: 15,
              fontWeight: 600,
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
            </svg>
            Telegram ile Gönder
          </a>

          {/* Instagram */}
          <button
            onClick={handleInstagram}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              padding: '14px',
              borderRadius: 14,
              background: igCopied
                ? '#5B4A82'
                : 'linear-gradient(135deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)',
              color: '#fff',
              border: 'none',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all .2s',
            }}
          >
            {igCopied ? (
              <>✓ Mesaj kopyalandı — Instagram açılıyor...</>
            ) : (
              <>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Instagram DM ile Gönder
              </>
            )}
          </button>

          {/* Native Share (mobilde çalışır) */}
          {canShare && (
            <button
              onClick={handleNativeShare}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                padding: '14px',
                borderRadius: 14,
                background: 'linear-gradient(135deg,#5B4A82,#8B6FB5)',
                color: '#fff',
                border: 'none',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              Diğer Uygulamalarla Paylaş
            </button>
          )}
        </div>

        <p style={{ fontSize: 11, color: '#B0A8C8', lineHeight: 1.6, margin: 0 }}>
          Instagram DM butonuna basınca mesaj otomatik kopyalanır, Instagram açılır — yapıştır ve gönder! 📲
        </p>
      </div>
    </div>
  )
}
