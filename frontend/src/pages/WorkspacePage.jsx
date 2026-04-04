import { useState, useEffect, useRef } from 'react'
import { API_BASE } from '../api'
import SettingsModal, { getModelLabel } from '../components/SettingsModal'

// ── helpers ──────────────────────────────────────────────
function pad(n, len = 2) { return String(n).padStart(len, '0') }

function formatSRTTime(sec) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = Math.floor(sec % 60)
  const ms = Math.round((sec % 1) * 1000)
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(ms, 3)}`
}

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
const PROMPT_TEMPLATES = [
  {
    label: '빈 페이지',
    keyword: '',
    tone: '진지한',
    customPrompt: '',
  },
  {
    label: '10대·20대 타겟',
    keyword: '요즘 MZ 트렌드',
    tone: '유머러스',
    customPrompt: '10대~20대 초반 타겟으로 트렌디한 언어로 작성해줘. 이모지를 자연스럽게 활용해.',
  },
  {
    label: '직장인 공감',
    keyword: '퇴근 후 루틴',
    tone: '진지한',
    customPrompt: '2030 직장인 타겟으로 퇴근 후 현실 공감되는 내용으로 작성해줘.',
  },
  {
    label: '질문 형식 훅',
    keyword: '번아웃 극복',
    tone: '동기부여',
    customPrompt: '첫 문장을 강렬한 질문으로 시작해서 시청자의 호기심을 즉시 자극해줘.',
  },
  {
    label: '숫자·데이터 활용',
    keyword: '생산성 향상',
    tone: '진지한',
    customPrompt: '구체적인 숫자와 통계를 활용해서 신뢰감 있게 작성해줘.',
  },
  {
    label: '감성적 스타일',
    keyword: '혼자만의 시간',
    tone: '진지한',
    customPrompt: '감성적이고 시적인 표현을 사용해서 감정을 자극하는 방식으로 작성해줘.',
  },
  {
    label: '영어 믹스',
    keyword: '자기계발 루틴',
    tone: '동기부여',
    customPrompt: '자연스럽게 영어 단어를 섞어서 힙하고 세련된 느낌으로 작성해줘.',
  },
]

const TONES = ['진지한', '유머러스', '동기부여']
const LENGTHS = [
  { value: '30s', label: '30초', sec: 30 },
  { value: '45s', label: '45초', sec: 45 },
  { value: '60s', label: '60초', sec: 60 },
]
const MODES = [
  { id: 'gpt', icon: '✨', label: 'GPT 생성', desc: '대본 자동 생성 (GPT / Claude)' },
  { id: 'paste', icon: '✏️', label: '직접 입력', desc: '대본 복붙 또는 직접 작성' },
  { id: 'upload', icon: '📂', label: 'SRT 업로드', desc: '기존 SRT 파일 불러오기' },
]

function loadUserTemplates() {
  try { return JSON.parse(localStorage.getItem('user-templates')) || [] } catch { return [] }
}

// ── main component ────────────────────────────────────────
export default function WorkspacePage({ segments, setSegments, script, setScript, settings, updateSettings, mode, setMode }) {
  const [totalSec, setTotalSec] = useState(30)
  const [keyword, setKeyword] = useState('')
  const [tone, setTone] = useState('진지한')
  const [gptLength, setGptLength] = useState('30s')
  const [customPrompt, setCustomPrompt] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [userTemplates, setUserTemplates] = useState(loadUserTemplates)
  const [showTemplates, setShowTemplates] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [saveNameInput, setSaveNameInput] = useState('')
  const [showSaveInput, setShowSaveInput] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [uploadError, setUploadError] = useState('')
  const [ttsLoading, setTtsLoading] = useState(false)
  const [ttsUrl, setTtsUrl] = useState(null)
  const [originalScript, setOriginalScript] = useState('')
  const [originalSegments, setOriginalSegments] = useState([])
  const fileRef = useRef()

  // userTemplates → localStorage 동기화
  useEffect(() => {
    localStorage.setItem('user-templates', JSON.stringify(userTemplates))
  }, [userTemplates])

  const allTemplates = [...PROMPT_TEMPLATES, ...userTemplates]

  function saveTemplate() {
    const name = saveNameInput.trim()
    if (!name) return
    const t = { label: name, keyword, tone, customPrompt, isUser: true }
    setUserTemplates(prev => [...prev.filter(x => x.label !== name), t])
    setSelectedTemplate(name)
    setSaveNameInput('')
    setShowSaveInput(false)
  }

  function deleteUserTemplate(label, e) {
    e.stopPropagation()
    setUserTemplates(prev => prev.filter(x => x.label !== label))
    if (selectedTemplate === label) setSelectedTemplate(null)
  }

  function resetUserTemplates() {
    setUserTemplates([])
    setShowTemplates(false)
  }

  const lines = script.split('\n').map(l => l.trim()).filter(Boolean)
  const currentMode = MODES.find(m => m.id === mode)

  // 스크립트 변경 시 자막 목록 실시간 반영
  useEffect(() => {
    if (!mode || mode === null) return
    if (mode === 'upload') {
      // SRT 모드: 타이밍은 유지하고 텍스트만 동기화
      const lines = script.split('\n').map(l => l.trim()).filter(Boolean)
      if (!lines.length) { setSegments([]); return }
      setSegments(prev => {
        const avgDur = prev.length > 0 ? (prev[prev.length - 1]?.end || 2) / prev.length : 2
        return lines.map((line, i) => ({
          index: i + 1,
          start: prev[i]?.start ?? parseFloat((i * avgDur).toFixed(2)),
          end: prev[i]?.end ?? parseFloat(((i + 1) * avgDur).toFixed(2)),
          text: line,
        }))
      })
    } else {
      setSegments(distribute(script, totalSec))
    }
  }, [script, totalSec, mode])

  function resetMode() {
    setMode(null)
    setScript('')
    setSegments([])
    setOriginalScript('')
    setOriginalSegments([])
    setTtsUrl(null)
    setError('')
  }

  // 초기화: 수정 이전 상태로 복구
  function handleRestore() {
    setScript(originalScript)
    setSegments(originalSegments)
  }

  // 빈 페이지: 전체 삭제
  function handleClear(extra = {}) {
    setScript('')
    setSegments([])
    if (extra.gpt) { setKeyword(''); setCustomPrompt('') }
    if (extra.srt) { setUploadError('') }
  }

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

  function getApiKey() {
    return settings?.provider === 'claude' ? settings?.claudeKey : settings?.openaiKey
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
        body: JSON.stringify({
          keyword, tone, length: gptLength,
          custom_prompt: customPrompt,
          provider: settings?.provider || 'openai',
          api_key: getApiKey() || '',
          model: settings?.provider === 'claude' ? (settings?.claudeModel || '') : (settings?.openaiModel || ''),
        }),
      })
      if (!res.ok) throw new Error((await res.json()).detail || '오류 발생')
      const data = await res.json()
      setScript(data.script)
      const sec = LENGTHS.find(l => l.value === gptLength)?.sec || 30
      setOriginalScript(data.script)
      setOriginalSegments(distribute(data.script, sec))
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
      const extractedScript = parsed.map(s => s.text).join('\n')
      setSegments(parsed)
      setScript(extractedScript)
      setOriginalScript(extractedScript)
      setOriginalSegments(parsed)
    }
    reader.readAsText(file, 'utf-8')
    e.target.value = ''
  }

  async function handleTTS() {
    if (!script.trim()) return
    setTtsLoading(true)
    setTtsUrl(null)
    try {
      const res = await fetch(`${API_BASE}/api/tts/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: script }),
      })
      if (!res.ok) throw new Error('TTS 생성 실패')
      const blob = await res.blob()
      setTtsUrl(URL.createObjectURL(blob))
    } catch (e) { setError(e.message) }
    finally { setTtsLoading(false) }
  }

  // ── mode selector ─────────────────────────────────────
  if (!mode) {
    return (<>
      {showSettings && <SettingsModal settings={settings} updateSettings={updateSettings} onClose={() => setShowSettings(false)} />}
      <div style={{ maxWidth: 520, margin: '60px auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ color: '#555', fontSize: 14, textAlign: 'center', marginBottom: 4 }}>시작 방법을 선택하세요</p>
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
              <p style={{ color: '#555', fontSize: 13 }}>{m.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </>)
  }

  // ── workspace ─────────────────────────────────────────
  return (<>
    {showSettings && <SettingsModal settings={settings} updateSettings={updateSettings} onClose={() => setShowSettings(false)} />}
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      <style>{`
        @media (max-width: 700px) {
          .workspace-split { flex-direction: column !important; }
          .right-panel { order: -1; }
          .left-panel { width: 100% !important; max-width: 100% !important; min-width: 0 !important; position: static !important; max-height: none !important; }
        }
      `}</style>

      {/* 서브 탭 + 처음으로 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {MODES.map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            style={{
              background: mode === m.id ? '#6c63ff' : '#1e1e1e',
              color: mode === m.id ? '#fff' : '#666',
              border: `1px solid ${mode === m.id ? '#6c63ff' : '#2a2a2a'}`,
              padding: '7px 14px', fontSize: 13, borderRadius: 20,
            }}
          >
            {m.icon} {m.label}
          </button>
        ))}
        <div style={{ width: 1, height: 18, background: '#2a2a2a', margin: '0 2px' }} />
        <button
          onClick={resetMode}
          style={{ background: 'transparent', color: '#444', fontSize: 12, padding: '6px 12px', border: '1px solid #2a2a2a', borderRadius: 20 }}
        >
          ✕ 처음으로
        </button>
      </div>

      <div className="workspace-split" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>

        {/* ── LEFT: subtitle list (sticky) ── */}
        <div className="left-panel" style={{
          width: '45%', minWidth: 260, maxWidth: 480, flexShrink: 0,
          position: 'sticky', top: 16,
          maxHeight: 'calc(100vh - 100px)', overflowY: 'auto',
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ color: '#555', fontSize: 11, fontWeight: 700 }}>#{seg.index}</span>
                    <button onClick={() => removeSegment(i)} style={{ background: 'transparent', color: '#333', padding: '2px 6px', fontSize: 13 }}>✕</button>
                  </div>
                  <input
                    value={seg.text}
                    onChange={e => updateSegment(i, 'text', e.target.value)}
                    placeholder="자막 텍스트"
                    style={{ fontSize: 13, fontWeight: 600, background: '#111', border: '1px solid #2a2a2a', marginBottom: 8 }}
                  />
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 10, color: '#555', marginBottom: 3 }}>시작 (초)</p>
                      <input type="number" step="0.1" min="0" value={seg.start}
                        onChange={e => updateSegment(i, 'start', e.target.value)}
                        style={{ fontSize: 13, padding: '5px 8px', textAlign: 'center' }}
                      />
                    </div>
                    <span style={{ color: '#333', fontSize: 12, marginTop: 14 }}>→</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 10, color: '#555', marginBottom: 3 }}>종료 (초)</p>
                      <input type="number" step="0.1" min="0" value={seg.end}
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

        </div>

        {/* ── RIGHT: mode content ── */}
        <div className="right-panel" style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* SRT 업로드 모드 */}
          {mode === 'upload' && (
            <>
              <div style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2 style={title}>SRT 파일 업로드</h2>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={handleRestore} disabled={!originalScript}
                      style={{ background: 'transparent', color: originalScript ? '#6c63ff' : '#333', fontSize: 12, border: `1px solid ${originalScript ? '#6c63ff44' : '#222'}`, padding: '4px 10px' }}>
                      초기화
                    </button>
                    <button onClick={() => handleClear({ srt: true })}
                      style={{ background: 'transparent', color: '#555', fontSize: 12, border: '1px solid #2a2a2a', padding: '4px 10px' }}>
                      빈 페이지
                    </button>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: '#555' }}>업로드하면 왼쪽 자막 목록과 아래 대본에 자동으로 반영됩니다.</p>
                <input ref={fileRef} type="file" accept=".srt" onChange={handleSRTUpload} style={{ display: 'none' }} />
                <button onClick={() => fileRef.current.click()} style={{ background: '#2a2a2a', color: '#ccc', width: 'fit-content' }}>
                  📂 파일 선택
                </button>
                {uploadError && <p style={{ color: '#ff6b6b', fontSize: 13 }}>{uploadError}</p>}
              </div>
              {script && (
                <div style={card}>
                  <h2 style={title}>📄 대본 (SRT에서 추출)</h2>
                  <textarea
                    value={script}
                    onChange={e => setScript(e.target.value)}
                    rows={10}
                    style={{ lineHeight: 1.8, fontSize: 15 }}
                  />
                  <p style={{ fontSize: 12, color: '#555' }}>{script.split('\n').filter(Boolean).length}줄</p>
                </div>
              )}
            </>
          )}

          {/* GPT 생성 모드 */}
          {mode === 'gpt' && (
            <div style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={title}>대본 자동 생성</h2>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: settings?.provider === 'claude' ? '#d4936a' : '#10a37f', background: '#2a2a2a', padding: '3px 10px', borderRadius: 12 }}>
                    {getModelLabel(settings)}
                  </span>
                  <button onClick={() => setShowSettings(true)} style={{ background: '#1e1e1e', color: '#666', padding: '4px 10px', fontSize: 12, border: '1px solid #2a2a2a' }}>⚙️</button>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={handleRestore} disabled={!originalScript}
                      style={{ background: 'transparent', color: originalScript ? '#6c63ff' : '#333', fontSize: 12, border: `1px solid ${originalScript ? '#6c63ff44' : '#222'}`, padding: '4px 10px' }}>
                      초기화
                    </button>
                    <button onClick={() => handleClear({ gpt: true })}
                      style={{ background: 'transparent', color: '#555', fontSize: 12, border: '1px solid #2a2a2a', padding: '4px 10px' }}>
                      빈 페이지
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ flex: 1, minWidth: 150 }}>
                  <p style={lbl}>키워드 / 주제</p>
                  <input
                    placeholder="예) 번아웃 극복, 아침 루틴"
                    value={keyword}
                    onChange={e => { setKeyword(e.target.value); setSelectedTemplate(null) }}
                    onKeyDown={e => e.key === 'Enter' && handleGPT()}
                  />
                </div>
                <div>
                  <p style={lbl}>분위기</p>
                  <select value={tone} onChange={e => { setTone(e.target.value); setSelectedTemplate(null) }}>
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

              {/* 자유 프롬프트 */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <p style={lbl}>추가 지시사항 (선택)</p>
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => { setShowTemplates(v => !v); setShowSaveInput(false) }}
                      style={{ background: '#2a2a2a', color: selectedTemplate ? '#6c63ff' : '#aaa', fontSize: 12, padding: '4px 12px', border: `1px solid ${selectedTemplate ? '#6c63ff44' : '#333'}` }}
                    >
                      📋 {selectedTemplate || '저장된 프롬프트'} {showTemplates ? '▲' : '▼'}
                    </button>
                    {showTemplates && (
                      <div style={{
                        position: 'absolute', right: 0, top: '110%', zIndex: 100,
                        background: '#1e1e1e', border: '1px solid #333', borderRadius: 10,
                        minWidth: 260, boxShadow: '0 8px 24px rgba(0,0,0,0.5)', overflow: 'hidden',
                      }}>
                        {allTemplates.map(t => {
                          const active = selectedTemplate === t.label
                          return (
                            <div
                              key={t.label}
                              onClick={() => { setKeyword(t.keyword); setTone(t.tone); setCustomPrompt(t.customPrompt); setSelectedTemplate(t.label); setShowTemplates(false) }}
                              style={{
                                padding: '10px 14px', fontSize: 13,
                                color: active ? '#6c63ff' : '#ccc',
                                background: active ? '#221f3a' : 'transparent',
                                cursor: 'pointer', borderBottom: '1px solid #2a2a2a',
                                display: 'flex', alignItems: 'center', gap: 8,
                              }}
                              onMouseEnter={e => { if (!active) e.currentTarget.style.background = '#2a2a2a' }}
                              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
                            >
                              <span style={{ width: 14, flexShrink: 0, color: '#6c63ff' }}>{active ? '✓' : ''}</span>
                              <span style={{ flex: 1 }}>{t.label}</span>
                              {t.isUser && (
                                <span
                                  onClick={e => deleteUserTemplate(t.label, e)}
                                  style={{ color: '#555', fontSize: 12, padding: '0 2px', lineHeight: 1 }}
                                  onMouseEnter={e => e.currentTarget.style.color = '#ff6b6b'}
                                  onMouseLeave={e => e.currentTarget.style.color = '#555'}
                                >✕</span>
                              )}
                            </div>
                          )
                        })}
                        {userTemplates.length > 0 && (
                          <div
                            onClick={resetUserTemplates}
                            style={{ padding: '8px 14px', fontSize: 12, color: '#555', cursor: 'pointer', textAlign: 'center' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#ff6b6b'}
                            onMouseLeave={e => e.currentTarget.style.color = '#555'}
                          >
                            ⟳ 내 템플릿 초기화
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <textarea
                  rows={3}
                  placeholder="예) 10대 타겟으로 작성해줘 / 영어 단어를 섞어서 / 질문 형식으로 시작해줘"
                  value={customPrompt}
                  onChange={e => { setCustomPrompt(e.target.value); setSelectedTemplate(null) }}
                  style={{ fontSize: 13, lineHeight: 1.6 }}
                />
                {/* 현재 설정 저장 */}
                {!showSaveInput ? (
                  <button
                    onClick={() => { setShowSaveInput(true); setSaveNameInput(selectedTemplate || '') }}
                    style={{ alignSelf: 'flex-start', background: 'transparent', color: '#555', fontSize: 12, border: '1px solid #2a2a2a', padding: '4px 10px', marginTop: 4 }}
                  >
                    💾 현재 설정 저장
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 4 }}>
                    <input
                      autoFocus
                      placeholder="템플릿 이름"
                      value={saveNameInput}
                      onChange={e => setSaveNameInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveTemplate(); if (e.key === 'Escape') setShowSaveInput(false) }}
                      style={{ flex: 1, fontSize: 13, padding: '5px 10px' }}
                    />
                    <button onClick={saveTemplate} style={{ background: '#6c63ff', color: '#fff', fontSize: 12, padding: '5px 12px' }}>저장</button>
                    <button onClick={() => setShowSaveInput(false)} style={{ background: 'transparent', color: '#555', fontSize: 12, border: '1px solid #2a2a2a', padding: '5px 10px' }}>취소</button>
                  </div>
                )}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={title}>대본</h2>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={handleRestore} disabled={!originalScript}
                    title={!originalScript ? '직접입력은 원본이 없습니다' : ''}
                    style={{ background: 'transparent', color: originalScript ? '#6c63ff' : '#333', fontSize: 12, border: `1px solid ${originalScript ? '#6c63ff44' : '#222'}`, padding: '4px 10px' }}>
                    초기화
                  </button>
                  <button onClick={() => handleClear({})}
                    style={{ background: 'transparent', color: '#555', fontSize: 12, border: '1px solid #2a2a2a', padding: '4px 10px' }}>
                    빈 페이지
                  </button>
                </div>
              </div>
              <p style={{ fontSize: 12, color: '#555' }}>줄바꿈(Enter) 기준으로 자막이 나뉩니다.</p>
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

          {/* 영상 길이 (paste + gpt) */}
          {(mode === 'paste' || mode === 'gpt') && lines.length > 0 && (
            <div style={card}>
              <h2 style={title}>영상 길이 설정</h2>
              <p style={{ fontSize: 12, color: '#555' }}>
                총 길이를 정하면 {lines.length}줄을 균등 배분합니다.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input
                  type="range" min={15} max={60} step={1}
                  value={totalSec}
                  onChange={e => setTotalSec(parseInt(e.target.value))}
                  style={{ flex: 1, accentColor: '#6c63ff' }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                  <input
                    type="number" min={15} max={60} step={1}
                    value={totalSec}
                    onChange={e => {
                      const v = Math.min(60, Math.max(15, parseInt(e.target.value) || 15))
                      setTotalSec(v)
                    }}
                    style={{ width: 64, textAlign: 'center', padding: '6px 8px', fontSize: 15, fontWeight: 700, color: '#6c63ff' }}
                  />
                  <span style={{ fontSize: 13, color: '#555' }}>초</span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#444' }}>
                <span>15초</span><span>60초</span>
              </div>
              <p style={{ fontSize: 12, color: '#555' }}>
                줄당 자동 {(totalSec / lines.length).toFixed(1)}초 배분
              </p>
            </div>
          )}

          {/* SRT 저장 */}
          {(mode === 'paste' || mode === 'gpt') && segments.length > 0 && (
            <div style={card}>
              <h2 style={title}>💾 SRT 파일 저장</h2>
              <p style={{ fontSize: 12, color: '#555' }}>현재 자막 목록을 SRT 파일로 로컬에 저장합니다.</p>
              <button
                onClick={() => downloadSRT(segments)}
                style={{ background: '#6c63ff', color: '#fff', width: 'fit-content' }}
              >
                💾 SRT 파일 로컬에 저장하기
              </button>
            </div>
          )}

          {/* TTS 음성 생성 (paste + gpt) */}
          {(mode === 'paste' || mode === 'gpt') && script.trim() && (
            <div style={card}>
              <h2 style={title}>🔊 TTS 음성 생성</h2>
              <p style={{ fontSize: 12, color: '#555' }}>대본을 기반으로 한국어 음성을 자동 생성합니다.</p>
              <button
                onClick={handleTTS}
                disabled={ttsLoading}
                style={{ background: '#22c55e', color: '#fff', width: 'fit-content' }}
              >
                {ttsLoading ? '생성 중...' : '🔊 음성 생성하기'}
              </button>
              {ttsUrl && (
                <audio controls src={ttsUrl} style={{ width: '100%', marginTop: 4 }} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  </>)
}

const card = {
  background: '#1a1a1a', borderRadius: 12, padding: '20px 24px',
  display: 'flex', flexDirection: 'column', gap: 14,
}
const title = { fontSize: 15, fontWeight: 600, color: '#ccc', margin: 0 }
const lbl = { fontSize: 12, color: '#666', marginBottom: 6 }
