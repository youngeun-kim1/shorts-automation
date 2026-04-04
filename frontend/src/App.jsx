import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import WorkspacePage from './pages/WorkspacePage'
import AudioPage from './pages/AudioPage'
import MetaPage from './pages/MetaPage'
import Guide from './pages/Guide'
import PrivacyPolicy from './pages/PrivacyPolicy'
import Terms from './pages/Terms'

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
      openaiModel: 'gpt-5.4-mini', claudeModel: 'claude-3-5-sonnet-20241022',
    }
  } catch {
    return { provider: 'openai', openaiKey: '', claudeKey: '', openaiModel: 'gpt-5.4-mini', claudeModel: 'claude-3-5-sonnet-20241022' }
  }
}

export default function App() {
  return <BrowserRouter><AppInner /></BrowserRouter>
}

function AppInner() {
  const location = useLocation()
  const isSubPage = ['/guide', '/privacy', '/terms'].includes(location.pathname)
  const [activeTab, setActiveTab] = useState('workspace')
  const [segments, setSegments] = useState([])
  const [script, setScript] = useState('')
  const [workspaceMode, setWorkspaceMode] = useState(null)
  const [settings, setSettings] = useState(loadSettings)
  const [metaResult, setMetaResult] = useState(null)
  const [metaKeyword, setMetaKeyword] = useState('')
  const [metaSelectedTitle, setMetaSelectedTitle] = useState(0)

  useEffect(() => {
    localStorage.setItem('shorts-settings', JSON.stringify(settings))
  }, [settings])

  function updateSettings(patch) {
    setSettings(prev => ({ ...prev, ...patch }))
  }

  const globalStyle = `
    * { box-sizing: border-box; }
    html, body { background: #0f0f0f; color: #fff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; display: flex; justify-content: center; width: 100%; }
    #root { width: 100%; max-width: 1100px; }
    button { border: none; border-radius: 8px; cursor: pointer; padding: 10px 18px; font-size: 14px; transition: opacity 0.15s; }
    button:hover:not(:disabled) { opacity: 0.85; }
    button:disabled { opacity: 0.4; cursor: not-allowed; }
    input, textarea, select { background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 8px; color: #fff; padding: 10px 12px; font-size: 14px; width: 100%; outline: none; resize: vertical; }
    input:focus, textarea:focus, select:focus { border-color: #6c63ff; }
    select option { background: #1a1a1a; }
    audio { border-radius: 8px; background: #1a1a1a; }
    a { color: inherit; }
    @media (max-width: 700px) {
      .workspace-split { flex-direction: column !important; }
      .left-panel { position: static !important; max-height: 60vh !important; width: 100% !important; }
      .ai-links-label { display: none; }
      .header-ai { gap: 6px !important; }
      .tab-label-full { display: none; }
      .tab-label-short { display: inline !important; }
    }
    @media (min-width: 701px) { .tab-label-short { display: none; } }
  `

  const footer = (
    <footer style={{ borderTop: '1px solid #2a2a3e', padding: '20px 24px', textAlign: 'center', fontSize: 13, color: '#6b7280', display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', marginTop: 60 }}>
      <span>© 2026 ShortsAI</span>
      <Link to="/guide" style={{ color: '#9ca3af', textDecoration: 'none' }}>사용 가이드</Link>
      <Link to="/privacy" style={{ color: '#9ca3af', textDecoration: 'none' }}>개인정보처리방침</Link>
      <Link to="/terms" style={{ color: '#9ca3af', textDecoration: 'none' }}>이용약관</Link>
    </footer>
  )

  return (
    <>
      <style>{globalStyle}</style>
      <Routes>
        <Route path="/guide" element={<><Guide />{footer}</>} />
        <Route path="/privacy" element={<><PrivacyPolicy />{footer}</>} />
        <Route path="/terms" element={<><Terms />{footer}</>} />
        <Route path="*" element={
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px', width: '100%' }}>
            {/* ── Header ── */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid #1e1e1e', flexWrap: 'wrap', gap: 10 }}>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: 0 }}>✂️ 쇼츠 자동화</h1>
              <div className="header-ai" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <span className="ai-links-label" style={{ fontSize: 11, color: '#444' }}>AI 바로가기</span>
                {AI_LINKS.map(link => (
                  <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer"
                    style={{ color: link.color, fontSize: 13, fontWeight: 600, textDecoration: 'none', padding: '5px 11px', border: `1px solid ${link.color}44`, borderRadius: 20, background: `${link.color}11`, whiteSpace: 'nowrap' }}>
                    {link.label} ↗
                  </a>
                ))}
              </div>
            </header>

            {/* ── Tabs ── */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid #2a2a2a', paddingTop: 12 }}>
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                  background: activeTab === tab.id ? '#6c63ff' : 'transparent',
                  color: activeTab === tab.id ? '#fff' : '#666',
                  borderRadius: '8px 8px 0 0', padding: '9px 16px', fontSize: 14,
                }}>
                  <span className="tab-label-full">{tab.label}</span>
                  <span className="tab-label-short">{tab.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>

            {/* ── Content ── */}
            {activeTab === 'workspace' && (
              <WorkspacePage segments={segments} setSegments={setSegments} script={script} setScript={setScript} settings={settings} updateSettings={updateSettings} mode={workspaceMode} setMode={setWorkspaceMode} />
            )}
            {activeTab === 'audio' && <AudioPage setSegments={setSegments} />}
            {activeTab === 'youtube' && (
              <MetaPage script={script} settings={settings} updateSettings={updateSettings} metaResult={metaResult} setMetaResult={setMetaResult} metaKeyword={metaKeyword} setMetaKeyword={setMetaKeyword} metaSelectedTitle={metaSelectedTitle} setMetaSelectedTitle={setMetaSelectedTitle} />
            )}

            {footer}
          </div>
        } />
      </Routes>
    </>
  )
}
