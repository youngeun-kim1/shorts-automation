import { useState } from 'react'
import WorkspacePage from './pages/WorkspacePage'
import AudioPage from './pages/AudioPage'

const AI_LINKS = [
  { label: 'ChatGPT', url: 'https://chat.openai.com', color: '#10a37f' },
  { label: 'Grok', url: 'https://grok.x.ai', color: '#1d9bf0' },
  { label: 'Claude', url: 'https://claude.ai', color: '#d4936a' },
]

export default function App() {
  const [activeTab, setActiveTab] = useState('workspace')
  const [segments, setSegments] = useState([])

  return (
    <>
      <style>{`
        @media (max-width: 700px) {
          .workspace-split { flex-direction: column !important; }
          .left-panel { position: static !important; max-height: none !important; width: 100% !important; }
          .ai-links span { display: none; }
        }
      `}</style>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px' }}>
        {/* Header */}
        <header style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '14px 0', borderBottom: '1px solid #1e1e1e', marginBottom: 24,
          flexWrap: 'wrap', gap: 10,
        }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>✂️ 쇼츠 자동화</h1>

          <div className="ai-links" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, color: '#444', alignSelf: 'center' }}>AI 바로가기</span>
            {AI_LINKS.map(link => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: link.color, fontSize: 13, fontWeight: 600,
                  textDecoration: 'none', padding: '6px 12px',
                  border: `1px solid ${link.color}44`,
                  borderRadius: 20, background: `${link.color}11`,
                  whiteSpace: 'nowrap',
                }}
              >
                {link.label} ↗
              </a>
            ))}
          </div>
        </header>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid #2a2a2a' }}>
          {[
            { id: 'workspace', label: '📝 대본 & 자막' },
            { id: 'audio', label: '🎙️ 음성 처리' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? '#6c63ff' : 'transparent',
                color: activeTab === tab.id ? '#fff' : '#888',
                borderRadius: '8px 8px 0 0',
                padding: '10px 18px', fontSize: 14,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'workspace' && (
          <WorkspacePage segments={segments} setSegments={setSegments} />
        )}
        {activeTab === 'audio' && (
          <AudioPage script="" setSegments={setSegments} />
        )}
      </div>
    </>
  )
}
