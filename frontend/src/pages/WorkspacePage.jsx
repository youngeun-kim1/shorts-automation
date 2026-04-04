import { useState, useEffect, useRef } from 'react'
import { API_BASE } from '../api'

// ── helpers ──────────────────────────────────────────────
function formatSRTTime(sec) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = Math.floor(sec % 60)
  const ms = Math.round((sec % 1) * 1000)
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(ms, 3)}`
}
function pad(n, len = 2) { return String(n).padStart(len, '0') }

function toMMSS(sec) {
  const m = Math.floor(sec / 60), s = Math.floor(sec % 60)
  return `${pad(m)}:${pad(s)}`
}

function srtTimeToSec(str) {
  const [hms, ms] = str.trim().split(',')
  const [h, m, s] = hms.split(':').map(Number)
  return h * 3600 + m * 60 + s + (parseInt(ms) || 0) / 1000
}

function parseSRT(text) {
  const blocks = text.trim().split(/\n\s*\n/)
  return blocks.flatMap(block => {
    const lines = block.trim().split('\n')
    if (lines.length < 2) return []
    const match = lines[1]?.match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/)
    if (!match) return []
    return [{
      index: parseInt(lines[0]) || 1,
      start: srtTimeToSec(match[1]),
      end: srtTimeToSec(match[2]),
      text: lines.slice(2).join(' ').trim(),
    }]
  })
}

function buildSRTText(segments) {
  return segments.map(seg =>
    `${seg.index}\n${formatSRTTime(seg.start)} --> ${formatSRTTime(seg.end)}\n${seg.text}\n`
  ).join('\n')
}

function downloadSRT(segments, filename = 'subtitles.srt') {
  const blob = new Blob([buildSRTText(segments)], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

function distribute(script, totalSec) {
  const lines = script.split('\n').map(l => l.trim()).filter(Boolean)
  if (!lines.length) return []
  const spL = totalSec / lines.length
  return lines.map((line, i) => ({
    index: i + 1,
    start: parseFloat((i * spL).toFixed(2)),
    end: parseFloat(((i + 1) * spL).toFixed(2)),
    text: line,
  }))
}

// ── constants ─────────────────────────────────────────────
const TONES = ['진지한', '유머러스', '동기부여']
const LENGTHS = [{ value: '30s', label: '30초', sec: 30 }, { value: '45s', label: '45초', sec: 45 }, { value: '60s', label: '60초', sec: 60 }]
const MODES = [
  { id: 'upload', icon: '📂', label: 'SRT 업로드', desc: '기존 SRT 파일 불러오기' },
  { id: 'paste', icon: '✏️', label: '직접 입력', desc: '대본 복붙 또는 직접 작성' },
  { id: 'gpt', icon: '✨', label: 'GPT 생성', desc: 'GPT-4o로 대본 자동 생성' },
]

// ── main component ────────────────────────────────────────
export default function WorkspacePage({ segments, setSegments }) {
  const [mode, setMode] = useState(null)
  const [script, setScript] = useState('')
  const [totalSec, setTotalSec] = useState(30)
  const [keyword, setKeyword] = useState('')
  const [tone, setTone] = useState('진지한')
  const [gptLength, setGptLength] = useState('30s')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadError, setUploadError] = useState('')
  const fileRef = useRef()

  const lines = script.split('\n').map(l => l.trim()).filter(Boolean)

  // Auto-distribute on script or totalSec change (paste/gpt modes)
  useEffect(() => {
    if (mode !== 'paste' && mode !== 'gpt') return
    setSegments(distribute(script, totalSec))
  }, [script, totalSec, mode])

  function updateSegment(i, field, val) {
    setSegments(prev => prev.map((seg, idx) =>
      idx === i ? { ...seg, [field]: field === 'text' ? val : parseFloat(val) || 0 } : seg
    ))
  }

  function addSegment() {
    const last = segments[segments.length - 1]
    const start = last ? last.end + 0.1 : 0
    setSegments(prev => [...prev, { index: prev.length + 1, start, end: start + 2, text: '' }])
  }

  function removeSegment(i) {
    setSegments(prev => prev.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, index: idx + 1 })))
  }

  async function handleGPT() {
    if (!keyword.trim()) return
    setLoading(true); setError('')
    const sec = LENGTHS.find(l => l.value === gptLength)?.sec || 30
    setTotalSec(sec)
    try {
      const res = await fetch(`${API_BASE}/api/script/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, tone, length: gptLength }),
      })
      if (!res.ok) throw new Error((await res.json()).detail || '오류 발생')
      const data = await res.json()
      setScript(data.script)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  function handleSRTUpload(e) {
    const file = e.target.files[0]; if (!file) return
    setUploadError('')
    if (!file.name.endsWith('.srt')) { setUploadError('.srt 파일만 업로드 가능합니다.'); return }
    const reader = new FileReader()
    reader.onload = ev => {
      const parsed = parseSRT(ev.target.result)
      if (!parsed.length) { setUploadError('자막을 읽을 수 없습니다.'); return }
      setSegments(parsed)
    }
    reader.readAsText(file, 'utf-8')
    e.target.value = ''
  }

  // ── mode selector ─────────────────────────────────────
  if (!mode) {
    return (
      <div style={{ maxWidth: 520, margin: '60px auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ color: '#666', fontSize: 14, textAlign: 'center', marginBottom: 8 }}>시작 방법을 선택하세요</p>
        {MODES.map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            style={{
              background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12,
              padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16,
              cursor: 'pointer', textAlign: 'left', color: '#fff',
            }}
          >
            <span style={{ fontSize: 28 }}>{m.icon}</span>
            <div>
              <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{m.label}</p>
              <p style={{ color: '#666', fontSize: 13 }}>{m.desc}</p>
            </div>
          </button>
        ))}
      </div>
    )
  }

  // ── workspace ─────────────────────────────────────────
  return (
    <div className="workspace-split" style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

      {/* ── LEFT: subtitle list (sticky) ── */}
      <div className="left-panel" style={{
        width: 340, flexShrink: 0,
        position: 'sticky', top: 80,
        maxHeight: 'calc(100vh - 120px)', overflowY: 'auto',
        background: '#111', borderRadius: 12, padding: '16px 14px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#888' }}>
            자막 목록 {segments.length > 0 && <span style={{ color: '#6c63ff' }}>({segments.length})</span>}
          </p>
          <button onClick={addSegment} style={{ background: '#2a2a2a', color: '#aaa', padding: '4px 10px', fontSize: 12 }}>+ 추가</button>
        </div>

        {segments.length === 0 ? (
          <p style={{ color: '#333', fontSize: 13, textAlign: 'center', padding: '30px 0' }}>
            {mode === 'upload' ? 'SRT 파일을 업로드하세요' : '우측에 대본을 입력하세요'}
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {segments.map((seg, i) => (
              <div key={i} style={{ background: '#1a1a1a', borderRadius: 8, padding: '10px 12px', border: '1px solid #222' }}>
                {/* index + remove */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ color: '#555', fontSize: 11, fontWeight: 700 }}>#{seg.index}</span>
                  <button onClick={() => removeSegment(i)} style={{ background: 'transparent', color: '#333', padding: '2px 6px', fontSize: 13 }}>✕</button>
                </div>
                {/* text */}
                <input
                  value={seg.text}
                  onChange={e => updateSegment(i, 'text', e.target.value)}
                  placeholder="자막 텍스트"
                  style={{ fontSize: 13, fontWeight: 600, background: '#111', border: '1px solid #2a2a2a', marginBottom: 8 }}
                />
                {/* timing inputs */}
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 10, color: '#555', marginBottom: 3 }}>시작 (초)</p>
                    <input
                      type="number" step="0.1" min="0"
                      value={seg.start}
                      onChange={e => updateSegment(i, 'start', e.target.value)}
                      style={{ fontSize: 13, padding: '5px 8px', textAlign: 'center' }}
                    />
                  </div>
                  <span style={{ color: '#333', fontSize: 12, marginTop: 14 }}>→</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 10, color: '#555', marginBottom: 3 }}>종료 (초)</p>
                    <input
                      type="number" step="0.1" min="0"
                      value={seg.end}
                      onChange={e => updateSegment(i, 'end', e.target.value)}
                      style={{ fontSize: 13, padding: '5px 8px', textAlign: 'center' }}
                    />
                  </div>
                </div>
                <p style={{ fontSize: 10, color: '#333', fontFamily: 'monospace', marginTop: 6 }}>
                  {toMMSS(seg.start)} → {toMMSS(seg.end)} · {(seg.end - seg.start).toFixed(1)}s
                </p>
              </div>
            ))}
          </div>
        )}

        {/* SRT 다운로드 */}
        {segments.length > 0 && (
          <button
            onClick={() => downloadSRT(segments)}
            style={{ width: '100%', background: '#6c63ff', color: '#fff', marginTop: 12, padding: '10px' }}
          >
            ⬇️ SRT 다운로드
          </button>
        )}
      </div>

      {/* ── RIGHT: mode content ── */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* 모드 변경 */}
        <button
          onClick={() => { setMode(null); setScript(''); setSegments([]) }}
          style={{ background: 'transparent', color: '#555', fontSize: 13, padding: '6px 0', width: 'fit-content' }}
        >
          ← 시작 화면으로
        </button>

        {/* SRT 업로드 모드 */}
        {mode === 'upload' && (
          <div style={card}>
            <h2 style={title}>SRT 파일 업로드</h2>
            <p style={{ fontSize: 13, color: '#666' }}>업로드하면 왼쪽 자막 목록에 자동으로 반영됩니다.</p>
            <input ref={fileRef} type="file" accept=".srt" onChange={handleSRTUpload} style={{ display: 'none' }} />
            <button onClick={() => fileRef.current.click()} style={{ background: '#2a2a2a', color: '#ccc', width: 'fit-content' }}>
              📂 파일 선택
            </button>
            {uploadError && <p style={{ color: '#ff6b6b', fontSize: 13 }}>{uploadError}</p>}
          </div>
        )}

        {/* GPT 생성 모드 */}
        {mode === 'gpt' && (
          <div style={card}>
            <h2 style={title}>GPT-4o 대본 생성</h2>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <p style={lbl}>키워드 / 주제</p>
                <input
                  placeholder="예) 번아웃 극복, 아침 루틴"
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleGPT()}
                />
              </div>
              <div>
                <p style={lbl}>분위기</p>
                <select value={tone} onChange={e => setTone(e.target.value)}>
                  {TONES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <p style={lbl}>길이</p>
                <select value={gptLength} onChange={e => setGptLength(e.target.value)}>
                  {LENGTHS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
            </div>
            <button
              onClick={handleGPT}
              disabled={loading || !keyword.trim()}
              style={{ background: '#6c63ff', color: '#fff', width: 'fit-content' }}
            >
              {loading ? '생성 중...' : '✨ 대본 생성'}
            </button>
            {error && <p style={{ color: '#ff6b6b', fontSize: 13 }}>{error}</p>}
          </div>
        )}

        {/* 대본 편집 (paste + gpt) */}
        {(mode === 'paste' || mode === 'gpt') && (
          <div style={card}>
            <h2 style={title}>대본</h2>
            <p style={{ fontSize: 12, color: '#555' }}>줄바꿈(Enter) 기준으로 자막이 나뉩니다. 수정하면 왼쪽에 즉시 반영됩니다.</p>
            <textarea
              value={script}
              onChange={e => setScript(e.target.value)}
              rows={10}
              placeholder="대본을 여기에 입력하거나 붙여넣으세요."
              style={{ lineHeight: 1.8, fontSize: 15 }}
            />
            {lines.length > 0 && (
              <p style={{ fontSize: 12, color: '#555' }}>{lines.length}줄 입력됨</p>
            )}
          </div>
        )}

        {/* 타이밍 배분 (paste + gpt) */}
        {(mode === 'paste' || mode === 'gpt') && lines.length > 0 && (
          <div style={card}>
            <h2 style={title}>영상 길이 설정</h2>
            <p style={{ fontSize: 12, color: '#666' }}>
              총 길이를 정하면 {lines.length}줄을 균등 배분합니다. 왼쪽에서 개별 조정 가능합니다.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={lbl}>영상 총 길이</p>
                <span style={{ color: '#6c63ff', fontWeight: 700, fontSize: 22 }}>{totalSec}초</span>
              </div>
              <input
                type="range" min={15} max={60} step={1}
                value={totalSec}
                onChange={e => setTotalSec(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#6c63ff' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#444' }}>
                <span>15초</span><span>60초</span>
              </div>
              <p style={{ fontSize: 12, color: '#555' }}>
                줄당 자동 {(totalSec / lines.length).toFixed(1)}초 배분
              </p>
            </div>

            {/* 타이밍 미리보기 */}
            <div style={{ background: '#0d0d0d', borderRadius: 8, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {segments.slice(0, 5).map((seg, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, fontSize: 12 }}>
                  <span style={{ color: '#6c63ff', fontFamily: 'monospace', flexShrink: 0 }}>
                    {toMMSS(seg.start)} → {toMMSS(seg.end)}
                  </span>
                  <span style={{ color: '#666', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {seg.text}
                  </span>
                </div>
              ))}
              {segments.length > 5 && (
                <p style={{ color: '#333', fontSize: 11 }}>... 외 {segments.length - 5}줄</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const card = { background: '#1a1a1a', borderRadius: 12, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }
const title = { fontSize: 15, fontWeight: 600, color: '#ccc' }
const lbl = { fontSize: 12, color: '#777', marginBottom: 6 }
