import { useNavigate } from 'react-router-dom'

export default function PrivacyPolicy() {
  const navigate = useNavigate()
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 16px 80px' }}>
      <button onClick={() => navigate('/')} style={{ background: 'transparent', color: '#555', fontSize: 13, border: '1px solid #2a2a2a', borderRadius: 20, padding: '6px 14px', marginBottom: 32 }}>
        ← 돌아가기
      </button>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 8 }}>개인정보 처리방침</h1>
      <p style={{ color: '#555', fontSize: 13, marginBottom: 36 }}>최종 업데이트: 2026년 4월</p>

      {[
        {
          title: '1. 수집하는 정보',
          body: `본 서비스는 별도의 회원가입 없이 사용할 수 있으며, 서버에 개인정보를 저장하지 않습니다.\n사용자가 입력한 API 키, 설정, 커스텀 템플릿은 사용자의 브라우저 localStorage에만 저장되며, 외부 서버로 전송되지 않습니다.`,
        },
        {
          title: '2. API 키 처리',
          body: `입력된 OpenAI / Anthropic API 키는 대본·메타데이터 생성 요청 시에만 해당 AI 제공사의 서버로 전송됩니다.\n당사 서버(Railway)는 API 키를 저장하거나 기록하지 않습니다.`,
        },
        {
          title: '3. 제3자 서비스',
          body: `본 앱은 OpenAI API, Anthropic Claude API, Google TTS(gTTS)를 활용합니다.\n각 서비스의 개인정보처리방침은 해당 서비스 제공사의 정책을 따릅니다.`,
        },
        {
          title: '4. 쿠키 및 추적',
          body: `본 서비스는 별도의 쿠키나 사용자 추적 기술을 사용하지 않습니다.`,
        },
        {
          title: '5. 문의',
          body: `개인정보 관련 문의사항은 GitHub 저장소의 Issues 탭을 통해 문의해 주세요.`,
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
