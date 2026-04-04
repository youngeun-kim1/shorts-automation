import { useState, useRef } from 'react'

function formatTime(sec) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = Math.floor(sec % 60)
  const ms = Math.round((sec % 1) * 1000)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`
}

// SRT 타임코드 "00:00:02,500" → 초(float)
function srtTimeToSec(str) {
  const [hms, ms] = str.trim().split(',')
  const [h, m, s] = hms.split(':').map(Number)
  return h * 3600 + m * 60 + s + (parseInt(ms) || 0) / 1000
}

// SRT 파일 텍스트 파싱 → segments 배열
function parseSRT(text) {
  const blocks = text.trim().split(/\n\s*\n/)
  const result = []
  for (const block of blocks) {
    const lines = block.trim().split('\n')
    if (lines.length < 2) continue
    const index = parseInt(lines[0])
    const timeLine = lines[1]
    const match = timeLine.match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/)
    if (!match) continue
    const start = srtTimeToSec(match[1])
    const end = srtTimeToSec(match[2])
    const textContent = lines.slice(2).join(' ').trim()
    if (!isNaN(index) && textContent) {
      result.push({ index, start, end, text: textContent })
    }
  }
  return result
}

// SRT 다운로드 (프론트에서 직접 생성)
function buildSRTText(segments) {
  return segments.map(seg =>
    `${seg.index}\n${formatTime(seg.start)} --> ${formatTime(seg.end)}\n${seg.text}\n`
  ).join('\n')
}

export default function SubtitlePage({ segments, setSegments }) {
  const [uploadError, setUploadError] = useState('')
  const fileRef = useRef()

  function updateSegment(index, field, value) {
    setSegments(prev => prev.map((seg, i) =>
      i === index ? { ...seg, [field]: field === 'text' ? value : parseFloat(value) || 0 } : seg
    ))
  }

  function addSegment() {
    const last = segments[segments.length - 1]
    const newStart = last ? last.end + 0.1 : 0
    setSegments(prev => [
      ...prev,
      { index: prev.length + 1, start: newStart, end: newStart + 2, text: '' }
    ])
  }

  function removeSegment(index) {
    setSegments(prev =>
      prev.filter((_, i) => i !== index)
          .map((seg, i) => ({ ...seg, index: i + 1 }))
    )
  }

  function downloadSRT() {
    const text = buildSRTText(segments)
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'subtitles.srt'
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleSRTUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploadError('')
    if (!file.name.endsWith('.srt')) {
      setUploadError('.srt 파일만 업로드할 수 있습니다.')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = parseSRT(ev.target.result)
        if (parsed.length === 0) {
          setUploadError('자막을 읽을 수 없습니다. SRT 형식이 맞는지 확인해주세요.')
          return
        }
        setSegments(parsed)
      } catch {
        setUploadError('파일 파싱 중 오류가 발생했습니다.')
      }
    }
    reader.readAsText(file, 'utf-8')
    // input 초기화 (같은 파일 재업로드 가능하도록)
    e.target.value = ''
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* SRT 업로드 */}
      <div style={card}>
        <h2 style={title}>SRT 파일 불러오기</h2>
        <p style={{ fontSize: 13, color: '#666' }}>
          기존 .srt 파일을 업로드하면 자막 목록으로 자동 변환됩니다.
        </p>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            ref={fileRef}
            type="file"
            accept=".srt"
            onChange={handleSRTUpload}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileRef.current.click()}
            style={{ background: '#2a2a2a', color: '#ccc' }}
          >
            📂 SRT 업로드
          </button>
          {segments.length > 0 && (
            <span style={{ fontSize: 13, color: '#555' }}>현재 {segments.length}개 자막 로드됨</span>
          )}
        </div>
        {uploadError && <p style={{ color: '#ff6b6b', fontSize: 13 }}>{uploadError}</p>}
      </div>

      {/* 자막 없을 때 */}
      {segments.length === 0 ? (
        <div style={{ ...card, alignItems: 'center', padding: '40px 24px', textAlign: 'center' }}>
          <p style={{ color: '#555', fontSize: 15, marginBottom: 8 }}>아직 자막이 없습니다.</p>
          <p style={{ color: '#444', fontSize: 13, lineHeight: 1.7 }}>
            대본 탭에서 자막 타이밍 자동 생성,<br />
            음성 처리 탭에서 Whisper 분석,<br />
            또는 위에서 SRT 파일을 업로드하세요.
          </p>
          <button
            onClick={addSegment}
            style={{ background: '#6c63ff', color: '#fff', marginTop: 16 }}
          >
            + 자막 직접 추가
          </button>
        </div>
      ) : (
        <>
          {/* 액션 바 */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ color: '#666', fontSize: 13 }}>{segments.length}개 자막</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={addSegment} style={{ background: '#2a2a2a', color: '#ccc' }}>
                + 추가
              </button>
              <button
                onClick={downloadSRT}
                style={{ background: '#6c63ff', color: '#fff' }}
              >
                ⬇️ SRT 다운로드
              </button>
            </div>
          </div>

          {/* 자막 목록 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {segments.map((seg, i) => (
              <div
                key={`${seg.index}-${i}`}
                style={{
                  background: '#1a1a1a',
                  borderRadius: 10,
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  border: '1px solid #222',
                }}
              >
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ color: '#555', fontSize: 12, minWidth: 24, fontWeight: 700 }}>
                    #{seg.index}
                  </span>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flex: 1, flexWrap: 'wrap' }}>
                    <TimeInput label="시작" value={seg.start} onChange={v => updateSegment(i, 'start', v)} />
                    <span style={{ color: '#444' }}>→</span>
                    <TimeInput label="종료" value={seg.end} onChange={v => updateSegment(i, 'end', v)} />
                    <span style={{ color: '#444', fontSize: 12 }}>
                      {(seg.end - seg.start).toFixed(1)}s
                    </span>
                  </div>
                  <button
                    onClick={() => removeSegment(i)}
                    style={{ background: 'transparent', color: '#444', padding: '4px 8px', fontSize: 16 }}
                  >
                    ✕
                  </button>
                </div>

                <input
                  value={seg.text}
                  onChange={e => updateSegment(i, 'text', e.target.value)}
                  placeholder="자막 텍스트"
                  style={{ fontSize: 16, fontWeight: 600, background: '#111', border: '1px solid #2a2a2a' }}
                />

                <p style={{ color: '#333', fontSize: 11, fontFamily: 'monospace' }}>
                  {formatTime(seg.start)} → {formatTime(seg.end)}
                </p>
              </div>
            ))}
          </div>

          {/* 하단 다운로드 */}
          <button
            onClick={downloadSRT}
            style={{ background: '#6c63ff', color: '#fff', padding: '14px', fontSize: 15 }}
          >
            ⬇️ SRT 파일 다운로드
          </button>
        </>
      )}
    </div>
  )
}

function TimeInput({ label, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <span style={{ color: '#555', fontSize: 11 }}>{label}</span>
      <input
        type="number"
        step="0.1"
        min="0"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ width: 72, fontSize: 13, padding: '4px 8px', textAlign: 'center' }}
      />
    </div>
  )
}

const card = {
  background: '#1a1a1a',
  borderRadius: 12,
  padding: '20px 24px',
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
}
const title = { fontSize: 15, fontWeight: 600, color: '#ccc' }
