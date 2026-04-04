import { useState, useRef } from 'react'
import { API_BASE } from '../api'

export default function AudioPage({ setSegments }) {
  const [audioUrl, setAudioUrl] = useState(null)
  const [audioFile, setAudioFile] = useState(null)
  const [transcribing, setTranscribing] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const fileRef = useRef()

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setAudioFile(file)
    setAudioUrl(URL.createObjectURL(file))
    setDone(false)
    setError('')
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 680 }}>

      {/* 파일 업로드 */}
      <div style={{ background: '#1a1a1a', borderRadius: 12, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#ccc', margin: 0 }}>🎵 오디오 / 영상 파일 업로드</h2>
        <p style={{ fontSize: 12, color: '#555' }}>지원 형식: MP3, MP4, WAV, M4A, OGG, WebM</p>
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
          📁 파일 선택
        </button>
        {audioFile && <p style={{ fontSize: 13, color: '#888' }}>선택됨: {audioFile.name}</p>}
      </div>

      {/* 플레이어 + Whisper */}
      {audioUrl && (
        <div style={{ background: '#1a1a1a', borderRadius: 12, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#ccc', margin: 0 }}>미리 듣기</h2>
          <audio controls src={audioUrl} style={{ width: '100%' }} />

          <div style={{ background: '#111', borderRadius: 10, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ fontSize: 13, color: '#aaa', fontWeight: 600 }}>🎯 Whisper로 자막 타이밍 자동 생성</p>
            <p style={{ fontSize: 12, color: '#555' }}>
              AI가 음성을 분석해 자막 타이밍을 자동으로 맞춰줍니다. 완료 후 대본 & 자막 탭에서 확인하세요.
            </p>
            <button
              onClick={handleTranscribe}
              disabled={transcribing}
              style={{ background: '#22c55e', color: '#fff', width: 'fit-content', marginTop: 4 }}
            >
              {transcribing ? '분석 중...' : '🎯 자막 타이밍 자동 생성'}
            </button>
          </div>

          {error && <p style={{ color: '#ff6b6b', fontSize: 13 }}>{error}</p>}
          {done && (
            <p style={{ color: '#22c55e', fontSize: 13 }}>
              ✅ 완료! 대본 & 자막 탭에서 결과를 확인하세요.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
