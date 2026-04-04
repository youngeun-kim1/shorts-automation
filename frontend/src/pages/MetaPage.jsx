import { useState } from 'react'
import { API_BASE } from '../api'

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }
  return (
    <button onClick={handleCopy}
      style={{ background: copied ? '#22c55e' : '#2a2a2a', color: copied ? '#fff' : '#888', padding: '4px 12px', fontSize: 12, borderRadius: 6 }}>
      {copied ? '✓ 복사됨' : '복사'}
    </button>
  )
}

export default function MetaPage({ script, settings }) {
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [selectedTitle, setSelectedTitle] = useState(0)

  const hasScript = script && script.trim().length > 0
  const activeKey = settings?.provider === 'claude' ? settings?.claudeKey : settings?.openaiKey

  async function handleGenerate() {
    if (!hasScript) return
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await fetch(`${API_BASE}/api/meta/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script,
          keyword,
          provider: settings?.provider || 'openai',
          api_key: settings?.provider === 'claude' ? settings?.claudeKey : settings?.openaiKey,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).detail || '오류 발생')
      setResult(await res.json())
      setSelectedTitle(0)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 720 }}>

      {/* 입력 카드 */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={title}>🎬 YouTube 메타데이터 생성</h2>
          {activeKey && (
            <span style={{ fontSize: 11, color: settings?.provider === 'claude' ? '#d4936a' : '#10a37f', background: '#2a2a2a', padding: '3px 10px', borderRadius: 12 }}>
              {settings?.provider === 'claude' ? '🟠 Claude' : '🤖 GPT-4o'}
            </span>
          )}
        </div>

        {/* 대본 상태 표시 */}
        {hasScript ? (
          <div style={{ background: '#0d1a0d', border: '1px solid #1a3a1a', borderRadius: 8, padding: '10px 14px' }}>
            <p style={{ fontSize: 12, color: '#4ade80', marginBottom: 4 }}>✅ 대본 & 자막 탭의 대본이 연동됩니다</p>
            <p style={{ fontSize: 12, color: '#555', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              {script.slice(0, 80)}...
            </p>
          </div>
        ) : (
          <div style={{ background: '#1a1010', border: '1px solid #3a1a1a', borderRadius: 8, padding: '10px 14px' }}>
            <p style={{ fontSize: 12, color: '#ff6b6b' }}>⚠️ 대본 & 자막 탭에서 대본을 먼저 작성하세요.</p>
          </div>
        )}

        <div>
          <p style={lbl}>추가 키워드 (선택)</p>
          <input
            placeholder="예) 직장인, 20대, 퇴근 후 루틴"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleGenerate()}
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !hasScript}
          style={{ background: '#ef4444', color: '#fff', width: 'fit-content', fontWeight: 600 }}
        >
          {loading ? '생성 중...' : '▶️ 메타데이터 생성'}
        </button>
        {error && <p style={{ color: '#ff6b6b', fontSize: 13 }}>{error}</p>}
      </div>

      {/* 결과 */}
      {result && (
        <>
          {/* 제목 */}
          <div style={card}>
            <h3 style={sectionTitle}>📌 제목 추천 (클릭해서 선택)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {result.titles.map((t, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedTitle(i)}
                  style={{
                    background: selectedTitle === i ? '#1a1640' : '#1a1a1a',
                    border: `1px solid ${selectedTitle === i ? '#6c63ff' : '#2a2a2a'}`,
                    borderRadius: 8, padding: '12px 14px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    cursor: 'pointer', gap: 10,
                  }}
                >
                  <span style={{ fontSize: 14, color: selectedTitle === i ? '#fff' : '#ccc' }}>{t}</span>
                  <CopyButton text={t} />
                </div>
              ))}
            </div>
          </div>

          {/* 설명 */}
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={sectionTitle}>📝 설명란</h3>
              <CopyButton text={result.description} />
            </div>
            <textarea
              readOnly
              value={result.description}
              rows={5}
              style={{ fontSize: 13, lineHeight: 1.7, color: '#ccc', cursor: 'text' }}
            />
          </div>

          {/* 태그 */}
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={sectionTitle}>🏷️ 태그</h3>
              <CopyButton text={result.tags.join(', ')} />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {result.tags.map((tag, i) => (
                <span key={i} style={{
                  background: '#1e1e2e', border: '1px solid #3a3a5a',
                  borderRadius: 20, padding: '4px 12px', fontSize: 12, color: '#a0a0ff',
                }}>
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* 썸네일 */}
          <div style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={sectionTitle}>🖼️ 썸네일 문구</h3>
              <CopyButton text={result.thumbnail} />
            </div>
            <div style={{
              background: '#111', border: '2px solid #333', borderRadius: 10,
              padding: '28px', textAlign: 'center',
            }}>
              <p style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: -0.5 }}>
                {result.thumbnail}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const card = {
  background: '#1a1a1a', borderRadius: 12, padding: '20px 24px',
  display: 'flex', flexDirection: 'column', gap: 14,
}
const title = { fontSize: 15, fontWeight: 600, color: '#ccc', margin: 0 }
const sectionTitle = { fontSize: 13, fontWeight: 600, color: '#888', margin: 0 }
const lbl = { fontSize: 12, color: '#666', marginBottom: 6 }
