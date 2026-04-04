import { useState } from 'react'

const TONES = ['진지한', '유머러스', '동기부여']
const LENGTHS = [
  { value: '30s', label: '30초' },
  { value: '45s', label: '45초' },
  { value: '60s', label: '60초' },
]

function toTimeStr(sec) {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function formatSRTTime(sec) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = Math.floor(sec % 60)
  const ms = Math.round((sec % 1) * 1000)
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')},${String(ms).padStart(3,'0')}`
}

function buildSegments(lines, totalSec) {
  const count = lines.length
  const secPerLine = totalSec / count
  return lines.map((line, i) => ({
    index: i + 1,
    start: parseFloat((i * secPerLine).toFixed(2)),
    end: parseFloat(((i + 1) * secPerLine).toFixed(2)),
    text: line,
  }))
}

function downloadSRT(segments, filename = 'script.srt') {
  const text = segments.map(seg =>
    `${seg.index}\n${formatSRTTime(seg.start)} --> ${formatSRTTime(seg.end)}\n${seg.text}\n`
  ).join('\n')
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function ScriptPage({ script, setScript, setSegments, goToSubtitle }) {
  const [keyword, setKeyword] = useState('')
  const [tone, setTone] = useState('진지한')
  const [length, setLength] = useState('60s')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 자막 타이밍
  const [totalSec, setTotalSec] = useState(30)
  // 줄별 개별 조정: { [lineIndex]: deltaSec }
  const [lineDeltas, setLineDeltas] = useState({})

  const lines = script.split('\n').map(l => l.trim()).filter(l => l.length > 0)
  const lineCount = lines.length
  const secPerLine = lineCount > 0 ? totalSec / lineCount : 0

  // delta 적용한 세그먼트 계산
  function getAdjustedSegments() {
    if (lineCount === 0) return []
    const base = buildSegments(lines, totalSec)
    // delta 적용: 각 줄의 end를 delta만큼 이동, 다음 줄 start도 연동
    const adjusted = base.map((seg, i) => {
      const delta = lineDeltas[i] || 0
      return { ...seg, end: parseFloat((seg.end + delta).toFixed(2)) }
    })
    // start는 이전 줄의 end와 맞춤
    for (let i = 1; i < adjusted.length; i++) {
      adjusted[i] = { ...adjusted[i], start: adjusted[i - 1].end }
    }
    return adjusted
  }

  const adjustedSegments = getAdjustedSegments()

  function setLineDelta(i, delta) {
    setLineDeltas(prev => ({ ...prev, [i]: parseFloat(delta) }))
  }

  async function handleGenerate() {
    if (!keyword.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/script/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, tone, length }),
      })
      if (!res.ok) throw new Error((await res.json()).detail || '오류 발생')
      const data = await res.json()
      setScript(data.script)
      setLineDeltas({})
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function handleGoSubtitle() {
    setSegments(adjustedSegments)
    goToSubtitle()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* 자동 생성 */}
      <div style={card}>
        <h2 style={title}>대본 자동 생성</h2>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <p style={label}>키워드 / 주제</p>
            <input
              placeholder="예) 스트레스 관리, 번아웃 극복, 아침 루틴"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGenerate()}
            />
          </div>
          <div>
            <p style={label}>분위기</p>
            <select value={tone} onChange={e => setTone(e.target.value)}>
              {TONES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <p style={label}>길이</p>
            <select value={length} onChange={e => setLength(e.target.value)}>
              {LENGTHS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading || !keyword.trim()}
          style={{ background: '#6c63ff', color: '#fff', width: 'fit-content' }}
        >
          {loading ? '생성 중...' : '✨ GPT-4o로 대본 생성'}
        </button>
        {error && <p style={{ color: '#ff6b6b', fontSize: 13 }}>{error}</p>}
      </div>

      {/* 대본 편집 */}
      <div style={card}>
        <h2 style={title}>대본 편집</h2>
        <textarea
          value={script}
          onChange={e => { setScript(e.target.value); setLineDeltas({}) }}
          rows={12}
          placeholder={'대본을 직접 작성하거나, 위에서 자동 생성하세요.\n\n※ 줄바꿈(Enter) 기준으로 자막이 나뉩니다.'}
          style={{ lineHeight: 1.8, fontSize: 15 }}
        />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigator.clipboard.writeText(script)}
            disabled={!script.trim()}
            style={{ background: '#2a2a2a', color: '#ccc' }}
          >
            📋 복사
          </button>
          <button
            onClick={() => downloadSRT(adjustedSegments, 'script.srt')}
            disabled={lineCount === 0}
            style={{ background: '#2a2a2a', color: '#ccc' }}
          >
            ⬇️ SRT 다운로드
          </button>
          <button
            onClick={() => { setScript(''); setLineDeltas({}) }}
            disabled={!script.trim()}
            style={{ background: '#2a2a2a', color: '#666' }}
          >
            초기화
          </button>
          {script.trim() && (
            <span style={{ color: '#555', fontSize: 12 }}>
              {script.length}자 · {lineCount}줄
            </span>
          )}
        </div>
      </div>

      {/* 자막 타이밍 */}
      {lineCount > 0 && (
        <div style={card}>
          <h2 style={title}>자막 타이밍 설정</h2>

          {/* 영상 총 길이 Range */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={label}>영상 총 길이</p>
              <span style={{ color: '#6c63ff', fontWeight: 700, fontSize: 20 }}>
                {totalSec}초
              </span>
            </div>
            <input
              type="range" min={15} max={60} step={1}
              value={totalSec}
              onChange={e => { setTotalSec(parseInt(e.target.value)); setLineDeltas({}) }}
              style={{ width: '100%', accentColor: '#6c63ff' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#444' }}>
              <span>15초</span><span>60초</span>
            </div>
            <p style={{ fontSize: 12, color: '#555' }}>
              {lineCount}줄 → 줄당 자동 {secPerLine.toFixed(1)}초 배분
            </p>
          </div>

          {/* 줄별 개별 조정 */}
          <div style={{ marginTop: 4 }}>
            <p style={{ ...label, marginBottom: 10 }}>줄별 세부 조정</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {adjustedSegments.map((seg, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: '#111', borderRadius: 8, padding: '8px 12px',
                }}>
                  {/* 타임코드 */}
                  <span style={{ color: '#6c63ff', fontSize: 11, fontFamily: 'monospace', minWidth: 110, flexShrink: 0 }}>
                    {toTimeStr(seg.start)} → {toTimeStr(seg.end)}
                  </span>
                  {/* 텍스트 */}
                  <span style={{ color: '#ccc', fontSize: 13, flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {seg.text}
                  </span>
                  {/* delta range */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    <input
                      type="range" min={-secPerLine * 0.8} max={secPerLine * 0.8} step={0.1}
                      value={lineDeltas[i] || 0}
                      onChange={e => setLineDelta(i, e.target.value)}
                      style={{ width: 80, accentColor: '#22c55e' }}
                    />
                    <span style={{
                      fontSize: 11, color: (lineDeltas[i] || 0) > 0 ? '#22c55e' : (lineDeltas[i] || 0) < 0 ? '#ff6b6b' : '#444',
                      minWidth: 36, textAlign: 'right',
                    }}>
                      {(lineDeltas[i] || 0) > 0 ? '+' : ''}{(lineDeltas[i] || 0).toFixed(1)}s
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button
              onClick={handleGoSubtitle}
              style={{ background: '#22c55e', color: '#fff' }}
            >
              🎬 자막 편집 탭으로 이동
            </button>
            <button
              onClick={() => downloadSRT(adjustedSegments, 'subtitles.srt')}
              style={{ background: '#6c63ff', color: '#fff' }}
            >
              ⬇️ SRT 바로 다운로드
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const card = {
  background: '#1a1a1a', borderRadius: 12,
  padding: '20px 24px', display: 'flex',
  flexDirection: 'column', gap: 14,
}
const title = { fontSize: 15, fontWeight: 600, color: '#ccc' }
const label = { fontSize: 12, color: '#777', marginBottom: 0 }
