import { useNavigate } from 'react-router-dom'

export default function Terms() {
  const navigate = useNavigate()
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 16px 80px' }}>
      <button onClick={() => navigate('/')} style={{ background: 'transparent', color: '#555', fontSize: 13, border: '1px solid #2a2a2a', borderRadius: 20, padding: '6px 14px', marginBottom: 32 }}>
        ← 돌아가기
      </button>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 8 }}>이용약관</h1>
      <p style={{ color: '#555', fontSize: 13, marginBottom: 36 }}>최종 업데이트: 2026년 4월</p>

      {[
        {
          title: '1. 서비스 개요',
          body: `쇼츠 자동화 앱은 YouTube Shorts 제작을 위한 대본 생성, 자막 편집, 메타데이터 생성을 보조하는 도구입니다.\n본 서비스는 개인 및 비상업적 목적으로 자유롭게 사용할 수 있습니다.`,
        },
        {
          title: '2. API 키 사용 책임',
          body: `사용자는 본인 명의의 OpenAI / Anthropic API 키를 직접 입력하여 사용합니다.\nAPI 키 사용에 따른 비용 및 책임은 전적으로 사용자에게 있습니다.\n타인의 API 키를 무단으로 사용하는 행위는 금지됩니다.`,
        },
        {
          title: '3. 생성 콘텐츠',
          body: `AI가 생성한 대본, 제목, 설명 등의 콘텐츠는 사용자가 검토 후 책임지고 사용해야 합니다.\n생성된 콘텐츠가 제3자의 권리를 침해하거나 플랫폼 정책을 위반할 경우, 그 책임은 사용자에게 있습니다.`,
        },
        {
          title: '4. 서비스 가용성',
          body: `본 서비스는 별도의 SLA(서비스 수준 계약) 없이 제공됩니다.\n서비스 중단, 데이터 손실 등에 대해 운영자는 책임을 지지 않습니다.`,
        },
        {
          title: '5. 약관 변경',
          body: `본 약관은 사전 공지 없이 변경될 수 있습니다.\n변경된 약관은 페이지에 게시된 시점부터 효력이 발생합니다.`,
        },
      ].map((s, i) => (
        <div key={i} style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#ccc', marginBottom: 10 }}>{s.title}</h2>
          <p style={{ color: '#666', fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-line' }}>{s.body}</p>
        </div>
      ))}
    </div>
  )
}
