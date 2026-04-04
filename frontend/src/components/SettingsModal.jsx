export const OPENAI_MODELS = [
  { value: 'gpt-5.4',      label: 'GPT-5.4' },
  { value: 'gpt-5.4-mini', label: 'GPT-5.4 mini' },
  { value: 'gpt-5.4-nano', label: 'GPT-5.4 nano' },
  { value: 'gpt-4.1',      label: 'GPT-4.1' },
  { value: 'gpt-4.1-mini', label: 'GPT-4.1 mini' },
  { value: 'gpt-4.1-nano', label: 'GPT-4.1 nano' },
  { value: 'gpt-4o',       label: 'GPT-4o' },
  { value: 'gpt-4o-mini',  label: 'GPT-4o mini' },
  { value: 'o3',           label: 'o3' },
  { value: 'o4-mini',      label: 'o4-mini' },
]

export const CLAUDE_MODELS = [
  { value: 'claude-opus-4-5',            label: 'Claude Opus 4.5' },
  { value: 'claude-sonnet-4-5',          label: 'Claude Sonnet 4.5' },
  { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
  { value: 'claude-3-5-haiku-20241022',  label: 'Claude 3.5 Haiku' },
  { value: 'claude-3-opus-20240229',     label: 'Claude 3 Opus' },
]

export function getModelLabel(settings) {
  if (settings?.provider === 'claude') {
    const m = CLAUDE_MODELS.find(m => m.value === (settings.claudeModel || ''))
    return `🟠 ${m?.label || settings.claudeModel || 'Claude'}`
  }
  const m = OPENAI_MODELS.find(m => m.value === (settings?.openaiModel || ''))
  return `🤖 ${m?.label || settings?.openaiModel || 'OpenAI'}`
}

export default function SettingsModal({ settings, updateSettings, onClose }) {
  const isOpenAI = settings.provider !== 'claude'
  const isClaude = settings.provider === 'claude'

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#1a1a1a', borderRadius: 16, padding: '24px', width: '100%', maxWidth: 420, border: '1px solid #2a2a2a', display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#fff', margin: 0 }}>⚙️ AI 설정</h2>
          <button onClick={onClose} style={{ background: 'transparent', color: '#666', padding: '4px 8px', fontSize: 18 }}>✕</button>
        </div>

        {/* OpenAI */}
        <div style={{ border: `1px solid ${isOpenAI ? '#6c63ff55' : '#2a2a2a'}`, borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#10a37f', margin: 0 }}>🤖 OpenAI</p>
            <button
              onClick={() => updateSettings({ provider: 'openai' })}
              style={{ background: isOpenAI ? '#10a37f22' : 'transparent', color: isOpenAI ? '#10a37f' : '#555', border: `1px solid ${isOpenAI ? '#10a37f55' : '#2a2a2a'}`, padding: '3px 10px', fontSize: 12, borderRadius: 12 }}
            >
              {isOpenAI ? '✓ 사용 중' : '사용하기'}
            </button>
          </div>
          <input type="password" placeholder="sk-proj-..." value={settings.openaiKey || ''} onChange={e => updateSettings({ openaiKey: e.target.value })} />
          <select value={settings.openaiModel || 'gpt-5.4-mini'} onChange={e => updateSettings({ openaiModel: e.target.value })}>
            {OPENAI_MODELS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <p style={{ fontSize: 11, color: '#444', margin: 0 }}>platform.openai.com · 비워두면 서버 환경변수 키 사용</p>
        </div>

        {/* Claude */}
        <div style={{ border: `1px solid ${isClaude ? '#d4936a55' : '#2a2a2a'}`, borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#d4936a', margin: 0 }}>🟠 Claude</p>
            <button
              onClick={() => updateSettings({ provider: 'claude' })}
              style={{ background: isClaude ? '#d4936a22' : 'transparent', color: isClaude ? '#d4936a' : '#555', border: `1px solid ${isClaude ? '#d4936a55' : '#2a2a2a'}`, padding: '3px 10px', fontSize: 12, borderRadius: 12 }}
            >
              {isClaude ? '✓ 사용 중' : '사용하기'}
            </button>
          </div>
          <input type="password" placeholder="sk-ant-..." value={settings.claudeKey || ''} onChange={e => updateSettings({ claudeKey: e.target.value })} />
          <select value={settings.claudeModel || 'claude-3-5-sonnet-20241022'} onChange={e => updateSettings({ claudeModel: e.target.value })}>
            {CLAUDE_MODELS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <p style={{ fontSize: 11, color: '#444', margin: 0 }}>console.anthropic.com · Claude 선택 시 필요</p>
        </div>

        <button onClick={onClose} style={{ background: '#6c63ff', color: '#fff', width: '100%' }}>저장</button>
      </div>
    </div>
  )
}
