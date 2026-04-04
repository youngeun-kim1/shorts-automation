import { useState, useRef } from 'react'
import { API_BASE } from '../api'

export default function AudioPage({ script, setSegments }) {
  const [mode, setMode] = useState('upload') // 'upload' | 'tts'
  const [audioUrl, setAudioUrl] = useState(null)
  const [audioFile, setAudioFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const fileRef = useRef()

  async function handleTTS() {
    if (!script.trim()) return
    setLoading(true)
    setError('')
    setAudioUrl(null)
    setAudioFile(null)
    try {
      const res = await fetch(`${API_BASE}/api/tts/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: script }),
      })
      if (!res.ok) throw new Error((await res.json()).detail || 'TTS 오류')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setAudioUrl(url)
      setAudioFile(new File([blob], 'tts_output.mp3', { type: 'audio/mpeg' }))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setAudioFile(file)
    setAudioUrl(URL.createObjectURL(file))
    setDone(false)
  }

  async function handleTranscribe() {
    if (!audioFile) return
    setTranscribing(true)
    setError('')
    setDone(false)
    try {
      const form = new FormData()
      form.append('file', audioFile)
      const res = await fetch(`${API_BASE}/api/subtitle/transcribe`, { method: 'POST', body: form })
      if (!res.ok) throw new Error((await res.json()).detail || '변환 오류')
      const data = await res.json()
      setSegments(data.segments)
      setDone(true)
    } catch (e) {
      setError(e.message)
    } finally {
      setTranscribing(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* 모드 선택 */}
      <div style={{ background: '#1a1a1a', borderRadius: 12, padding: '20px 24px' }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#ccc', marginBottom: 14 }}>음성 소스 선택</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <ModeButton active={mode === 'upload'} onClick={() => { setMode('upload'); setAudioUrl(null); setAudioFile(null) }}>
            📁 파일 업로드
          </ModeButton>
          <ModeButton active={mode === 'tts'} onClick={() => { setMode('tts'); setAudioUrl(null); setAudioFile(null) }}>
            🤖 TTS 자동 생성
          </ModeButton>
        </div>
      </div>

      {/* 업로드 모드 */}
      {mode === 'upload' && (
        <div style={{ background: '#1a1a1a', borderRadius: 12, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#ccc' }}>오디오/영상 업로드</h2>
          <p style={{ fontSize: 12, color: '#666' }}>지원 형식: MP3, MP4, WAV, M4A, OGG, WebM</p>
          <input
            ref={fileRef}
            type="file"
            accept=".mp3,.mp4,.wav,.m4a,.ogg,.webm"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileRef.current.click()}
            style={{ background: '#2a2a2a', color: '#ccc', width: 'fit-content' }}
          >
            파일 선택
          </button>
          {audioFile && <p style={{ fontSize: 13, color: '#888' }}>선택됨: {audioFile.name}</p>}
        </div>
      )}

      {/* TTS 모드 */}
      {mode === 'tts' && (
        <div style={{ background: '#1a1a1a', borderRadius: 12, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#ccc' }}>TTS 음성 생성</h2>
          {!script.trim()
            ? <p style={{ fontSize: 13, color: '#ff6b6b' }}>먼저 대본 탭에서 대본을 작성하거나 생성해주세요.</p>
            : <p style={{ fontSize: 13, color: '#888' }}>대본 탭의 내용을 기반으로 한국어 음성을 생성합니다.</p>
          }
          <button
            onClick={handleTTS}
            disabled={loading || !script.trim()}
            style={{ background: '#6c63ff', color: '#fff', width: 'fit-content' }}
          >
            {loading ? '생성 중...' : '🔊 음성 생성'}
          </button>
          {error && <p style={{ color: '#ff6b6b', fontSize: 13 }}>{error}</p>}
        </div>
      )}

      {/* 플레이어 */}
      {audioUrl && (
        <div style={{ background: '#1a1a1a', borderRadius: 12, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#ccc' }}>미리 듣기</h2>
          <audio controls src={audioUrl} style={{ width: '100%' }} />

          <button
            onClick={handleTranscribe}
            disabled={transcribing}
            style={{ background: '#22c55e', color: '#fff', width: 'fit-content', marginTop: 4 }}
          >
            {transcribing ? 'Whisper 분석 중...' : '🎯 Whisper로 자막 타이밍 자동 생성'}
          </button>
          {error && <p style={{ color: '#ff6b6b', fontSize: 13 }}>{error}</p>}
          {done && (
            <p style={{ color: '#22c55e', fontSize: 13 }}>
              ✅ 자막 타이밍 생성 완료! 자막 편집 탭으로 이동하세요.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function ModeButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? '#6c63ff' : '#2a2a2a',
        color: active ? '#fff' : '#888',
        padding: '10px 20px',
      }}
    >
      {children}
    </button>
  )
}
