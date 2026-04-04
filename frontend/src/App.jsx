import { useState, useEffect } from 'react'
import WorkspacePage from './pages/WorkspacePage'
import AudioPage from './pages/AudioPage'
import MetaPage from './pages/MetaPage'

const AI_LINKS = [
  { label: 'ChatGPT', url: 'https://chat.openai.com', color: '#10a37f' },
  { label: 'Grok', url: 'https://grok.x.ai', color: '#1d9bf0' },
  { label: 'Claude', url: 'https://claude.ai', color: '#d4936a' },
]

const TABS = [
  { id: 'workspace', label: '📝 대본 & 자막' },
  { id: 'youtube', label: '🎬 YouTube' },
  { id: 'audio', label: '🎙️ 음성 처리' },
]

function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem('shorts-settings')) || {
      provider: 'openai', openaiKey: '', claudeKey: '',
    }
  } catch {
    return { provider: 'openai', openaiKey: '', claudeKey: '' }
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState('workspace')
  const [segments, setSegments] = useState([])
  const [script, setScript] = useState('')
  const [workspaceMode, setWorkspaceMode] = useState(null)
  const [settings, setSettings] = useState(loadSettings)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    localStorage.setItem('shorts-settings', JSON.stringify(settings))
  }, [settings])

  function updateSettings(patch) {
    setSettings(prev => ({ ...prev, ...patch }))
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        html, body { background: #0f0f0f; color: #fff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; display: flex; justify-content: center; width: 100%; }
        #root { width: 100%; max-width: 1100px; }
        button { border: none; border-radius: 8px; cursor: pointer; padding: 10px 18px; font-size: 14px; transition: opacity 0.15s; }
        button:hover:not(:disabled) { opacity: 0.85; }
        button:disabled { opacity: 0.4; cursor: not-allowed; }
        input, textarea, select {
          background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px;
          color: #fff; padding: 10px 12px; font-size: 14px; width: 100%;
          outline: none; resize: vertical;
        }
        input:focus, textarea:focus, select:focus { border-color: #6c63ff; }
        select option { background: #1a1a1a; }
        audio { border-radius: 8px; background: #1a1a1a; }

        @media (max-width: 700px) {
          .workspace-split { flex-direction: column !important; }
          .left-panel { position: static !important; max-height: 60vh !important; width: 100% !important; }
          .ai-links-label { display: none; }
          .header-ai { gap: 6px !important; }
          .tab-label-full { display: none; }
          .tab-label-short { display: inline !important; }
        }
        @media (min-width: 701px) {
          .tab-label-short { display: none; }
        }
      `}</style>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px', width: '100%' }}>

        {/* ── Header ── */}
        <header style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 0', borderBottom: '1px solid #1e1e1e', marginBottom: 0,
          flexWrap: 'wrap', gap: 10,
        }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: 0 }}>✂️ 쇼츠 자동화</h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div className="header-ai" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="ai-links-label" style={{ fontSize: 11, color: '#444' }}>AI 바로가기</span>
              {AI_LINKS.map(link => (
                <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer"
                  style={{
                    color: link.color, fontSize: 13, fontWeight: 600,
                    textDecoration: 'none', padding: '5px 11px',
                    border: `1px solid ${link.color}44`,
                    borderRadius: 20, background: `${link.color}11`,
                    whiteSpace: 'nowrap',
                  }}>
                  {link.label} ↗
                </a>
              ))}
            </div>

            {/* Settings button */}
            <button
              onClick={() => setShowSettings(true)}
              style={{ background: '#1e1e1e', color: '#888', padding: '7px 14px', fontSize: 13, border: '1px solid #2a2a2a' }}
            >
              ⚙️ 설정
            </button>
          </div>
        </header>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid #2a2a2a', paddingTop: 12 }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              background: activeTab === tab.id ? '#6c63ff' : 'transparent',
              color: activeTab === tab.id ? '#fff' : '#666',
              borderRadius: '8px 8px 0 0',
              padding: '9px 16px', fontSize: 14,
            }}>
              <span className="tab-label-full">{tab.label}</span>
              <span className="tab-label-short">{tab.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        {activeTab === 'workspace' && (
          <WorkspacePage
            segments={segments} setSegments={setSegments}
            script={script} setScript={setScript}
            settings={settings}
            mode={workspaceMode} setMode={setWorkspaceMode}
          />
        )}
        {activeTab === 'audio' && (
          <AudioPage setSegments={setSegments} />
        )}
        {activeTab === 'youtube' && (
          <MetaPage script={script} settings={settings} />
        )}
      </div>

      {/* ── Settings Modal ── */}
      {showSettings && (
        <div
          onClick={() => setShowSettings(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: 16,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#1a1a1a', borderRadius: 16, padding: '28px 24px',
              width: '100%', maxWidth: 440,
              border: '1px solid #2a2a2a',
              display: 'flex', flexDirection: 'column', gap: 20,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>⚙️ 설정</h2>
              <button onClick={() => setShowSettings(false)}
                style={{ background: 'transparent', color: '#666', padding: '4px 8px', fontSize: 18 }}>✕</button>
            </div>

            {/* 현재 사용 중 표시 */}
            <div style={{ background: '#111', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: '#555' }}>현재 사용 중</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: settings.provider === 'claude' ? '#d4936a' : '#10a37f' }}>
                {settings.provider === 'claude' ? '🟠 Claude' : '🤖 OpenAI GPT-4o'}
              </span>
            </div>

            {/* OpenAI Key */}
            <div style={{ border: `1px solid ${settings.provider === 'openai' ? '#6c63ff55' : '#2a2a2a'}`, borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#10a37f', margin: 0 }}>🤖 OpenAI API Key</p>
                <button
                  onClick={() => updateSettings({ provider: 'openai' })}
                  style={{
                    background: settings.provider === 'openai' ? '#10a37f22' : 'transparent',
                    color: settings.provider === 'openai' ? '#10a37f' : '#555',
                    border: `1px solid ${settings.provider === 'openai' ? '#10a37f55' : '#2a2a2a'}`,
                    padding: '3px 10px', fontSize: 12, borderRadius: 12,
                  }}
                >
                  {settings.provider === 'openai' ? '✓ 사용 중' : '사용하기'}
                </button>
              </div>
              <input
                type="password"
                placeholder="sk-proj-..."
                value={settings.openaiKey}
                onChange={e => updateSettings({ openaiKey: e.target.value })}
              />
              <p style={{ fontSize: 11, color: '#444', margin: 0 }}>platform.openai.com · 비워두면 서버 환경변수 키 사용</p>
            </div>

            {/* Claude Key */}
            <div style={{ border: `1px solid ${settings.provider === 'claude' ? '#d4936a55' : '#2a2a2a'}`, borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#d4936a', margin: 0 }}>🟠 Claude API Key</p>
                <button
                  onClick={() => updateSettings({ provider: 'claude' })}
                  style={{
                    background: settings.provider === 'claude' ? '#d4936a22' : 'transparent',
                    color: settings.provider === 'claude' ? '#d4936a' : '#555',
                    border: `1px solid ${settings.provider === 'claude' ? '#d4936a55' : '#2a2a2a'}`,
                    padding: '3px 10px', fontSize: 12, borderRadius: 12,
                  }}
                >
                  {settings.provider === 'claude' ? '✓ 사용 중' : '사용하기'}
                </button>
              </div>
              <input
                type="password"
                placeholder="sk-ant-..."
                value={settings.claudeKey}
                onChange={e => updateSettings({ claudeKey: e.target.value })}
              />
              <p style={{ fontSize: 11, color: '#444', margin: 0 }}>console.anthropic.com · Claude 선택 시 필요</p>
            </div>

            <button
              onClick={() => setShowSettings(false)}
              style={{ background: '#6c63ff', color: '#fff', width: '100%' }}
            >
              저장
            </button>
          </div>
        </div>
      )}
    </>
  )
}
