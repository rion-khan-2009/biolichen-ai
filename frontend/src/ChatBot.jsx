import { useState, useRef, useEffect } from 'react'

function ChatBot({ districtData, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: '🌿 আসসালামু আলাইকুম! আমি **Lichen AI Assistant** — by Rion Khan। বাংলাদেশের পরিবেশ, AQI, আবহাওয়া সম্পর্কে প্রশ্ন করুন! lichen এর ছবি দিলে চিনতে পারবো! 📸'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [image, setImage] = useState(null)
  const [imageBase64, setImageBase64] = useState(null)
  const bottomRef = useRef(null)
  const fileRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImage(URL.createObjectURL(file))
    const reader = new FileReader()
    reader.onload = () => setImageBase64(reader.result.split(',')[1])
    reader.readAsDataURL(file)
  }

  const sendMessage = async () => {
    if (!input.trim() && !imageBase64) return

    const currentInput = input
    const currentImage = image
    const currentImageBase64 = imageBase64

    const userMsg = {
      role: 'user',
      text: currentInput || '📸 এই lichen টা চিনতে পারবে?',
      image: currentImage
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setImage(null)
    setImageBase64(null)
    setLoading(true)

    try {
      // Build full chat history
      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.text
      }))

      const res = await fetch('http://localhost:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentInput || 'এই lichen টা চিনতে পারবে? বিস্তারিত বলো।',
          districtData,
          imageBase64: currentImageBase64,
          history,
        })
      })

      const data = await res.json()
      setMessages(prev => [...prev, { role: 'bot', text: data.response }])
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: '❌ সংযোগ সমস্যা। Backend চালু আছে কিনা দেখুন।' }])
    } finally {
      setLoading(false)
    }
  }

  const formatText = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>')
  }

  const quickQuestions = [
    'AQI কেমন?', 'Lichen কী?', 'সেরা জেলা কোনটি?', 'তুমি কে?'
  ]

  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px',
      width: '420px', height: '600px',
      background: '#0f172a', border: '1px solid #166534',
      borderRadius: '20px', boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
      display: 'flex', flexDirection: 'column', zIndex: 9999,
      fontFamily: 'system-ui, sans-serif'
    }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #14532d, #166534)',
        padding: '14px 16px', borderRadius: '20px 20px 0 0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: '#22c55e', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '18px'
          }}>🌿</div>
          <div>
            <p style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px', margin: 0 }}>
              Lichen AI Assistant
            </p>
            <p style={{ color: '#86efac', fontSize: '11px', margin: 0 }}>
              by Rion Khan • Environmental Intelligence
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: '#22c55e', boxShadow: '0 0 6px #22c55e'
          }} />
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.15)', border: 'none',
            color: '#fff', width: '28px', height: '28px',
            borderRadius: '50%', cursor: 'pointer', fontSize: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>×</button>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '16px',
        display: 'flex', flexDirection: 'column', gap: '10px',
        scrollbarWidth: 'thin', scrollbarColor: '#374151 transparent'
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            alignItems: 'flex-end', gap: '6px'
          }}>
            {msg.role === 'bot' && (
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: '#14532d', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '14px', flexShrink: 0
              }}>🌿</div>
            )}
            <div style={{
              maxWidth: '82%',
              padding: '10px 14px',
              borderRadius: msg.role === 'user'
                ? '18px 18px 4px 18px'
                : '18px 18px 18px 4px',
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, #166534, #15803d)'
                : '#1e293b',
              border: msg.role === 'bot' ? '1px solid #334155' : 'none',
              fontSize: '13px', lineHeight: '1.7',
              color: '#f1f5f9', wordBreak: 'break-word',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}>
              {msg.image && (
                <img src={msg.image} alt="uploaded" style={{
                  width: '100%', borderRadius: '10px',
                  marginBottom: '8px', maxHeight: '160px', objectFit: 'cover'
                }} />
              )}
              <div dangerouslySetInnerHTML={{ __html: formatText(msg.text) }} />
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-end', gap: '6px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: '#14532d', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: '14px'
            }}>🌿</div>
            <div style={{
              background: '#1e293b', border: '1px solid #334155',
              padding: '12px 16px', borderRadius: '18px 18px 18px 4px',
              display: 'flex', gap: '5px', alignItems: 'center'
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: '7px', height: '7px', borderRadius: '50%',
                  background: '#4ade80',
                  animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Image preview */}
      {image && (
        <div style={{
          padding: '8px 12px', display: 'flex',
          alignItems: 'center', gap: '8px',
          background: '#1e293b', borderTop: '1px solid #334155'
        }}>
          <img src={image} alt="preview" style={{
            height: '48px', width: '48px',
            borderRadius: '8px', objectFit: 'cover'
          }} />
          <span style={{ color: '#94a3b8', fontSize: '12px', flex: 1 }}>
            ছবি ready ✅
          </span>
          <button onClick={() => { setImage(null); setImageBase64(null) }} style={{
            background: '#ef4444', border: 'none', color: 'white',
            borderRadius: '50%', width: '22px', height: '22px',
            cursor: 'pointer', fontSize: '12px', fontWeight: 'bold'
          }}>×</button>
        </div>
      )}

      {/* Quick buttons */}
      <div style={{
        padding: '8px 12px 6px',
        display: 'flex', gap: '6px', flexWrap: 'wrap'
      }}>
        {quickQuestions.map((q, i) => (
          <button key={i} onClick={() => setInput(q)} style={{
            fontSize: '11px', background: '#1e293b',
            border: '1px solid #166534', color: '#4ade80',
            padding: '4px 10px', borderRadius: '20px',
            cursor: 'pointer', transition: 'all 0.2s'
          }}>{q}</button>
        ))}
      </div>

      {/* Input */}
      <div style={{
        padding: '10px 12px 14px',
        borderTop: '1px solid #1e293b',
        display: 'flex', gap: '8px', alignItems: 'center'
      }}>
        <button onClick={() => fileRef.current.click()} title="ছবি দিন" style={{
          background: '#1e293b', border: '1px solid #334155',
          borderRadius: '12px', padding: '9px 11px',
          cursor: 'pointer', fontSize: '16px', color: '#94a3b8',
          transition: 'all 0.2s'
        }}>📸</button>
        <input
          ref={fileRef} type="file" accept="image/*"
          style={{ display: 'none' }} onChange={handleImageChange}
        />
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="প্রশ্ন করুন বা ছবি দিন..."
          style={{
            flex: 1, background: '#1e293b',
            border: '1px solid #334155', color: '#f1f5f9',
            fontSize: '13px', padding: '10px 14px',
            borderRadius: '12px', outline: 'none',
            transition: 'border 0.2s'
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          style={{
            background: loading ? '#374151' : 'linear-gradient(135deg, #16a34a, #15803d)',
            border: 'none', color: 'white',
            padding: '10px 16px', borderRadius: '12px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold', fontSize: '15px',
            transition: 'all 0.2s'
          }}>➤</button>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default ChatBot