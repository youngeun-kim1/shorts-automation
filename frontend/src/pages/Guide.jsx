import { useNavigate } from 'react-router-dom'

const sections = [
  {
    icon: '✨',
    title: 'GPT 대본 생성',
    steps: [
      '상단 "대본 & 자막" 탭 → GPT 생성 선택',
      '키워드/주제 입력 (예: 번아웃 극복, 아침 루틴)',
      '분위기·길이 선택, 추가 지시사항 입력 (선택)',
      '"대본 생성" 클릭 → 자막 목록 자동 생성',
    ],
  },
  {
    icon: '📋',
    title: '프롬프트 템플릿',
    steps: [
      '"저장된 프롬프트" 드롭다운에서 원하는 템플릿 선택',
      '선택 시 키워드·분위기·지시사항이 자동 입력됨',
      '직접 수정 후 "💾 현재 설정 저장"으로 나만의 템플릿 저장 가능',
    ],
  },
  {
    icon: '✏️',
    title: '직접 입력 / SRT 업로드',
    steps: [
      '직접 입력: 대본을 붙여넣으면 줄바꿈 기준으로 자막 분할',
      'SRT 업로드: 기존 .srt 파일을 불러와 자막 목록에 반영',
      '자막 목록에서 타임코드·텍스트 수동 편집 가능',
    ],
  },
  {
    icon: '💾',
    title: 'SRT 저장 & TTS',
    steps: [
      '영상 길이 설정: 슬라이더 또는 숫자 직접 입력 (15~60초)',
      '"SRT 파일 로컬에 저장하기" 클릭 → 자막 파일 다운로드',
      '"음성 생성하기" 클릭 → 한국어 TTS 오디오 생성 및 재생',
    ],
  },
  {
    icon: '🎬',
    title: 'YouTube 메타데이터',
    steps: [
      '"YouTube" 탭으로 이동 (대본이 자동 연동됨)',
      '추가 키워드 입력 후 "메타데이터 생성" 클릭',
      '제목 5개 추천 / 설명 / 태그 / 썸네일 문구 자동 생성',
      '각 항목 옆 "복사" 버튼으로 클립보드에 복사',
    ],
  },
  {
    icon: '⚙️',
    title: 'AI 설정',
    steps: [
      '각 탭의 ⚙️ 버튼 클릭 → AI 설정 모달 열기',
      'OpenAI / Claude 중 사용할 프로바이더 선택',
      'API 키 입력 (platform.openai.com 또는 console.anthropic.com)',
      '사용할 모델 선택 (GPT-5.4-mini 기본)',
    ],
  },
]

export default function Guide() {
  const navigate = useNavigate()
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 16px 80px' }}>
      <button onClick={() => navigate('/')} style={{ background: 'transparent', color: '#555', fontSize: 13, border: '1px solid #2a2a2a', borderRadius: 20, padding: '6px 14px', marginBottom: 32 }}>
        ← 돌아가기
      </button>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 8 }}>사용 가이드</h1>
      <p style={{ color: '#555', fontSize: 14, marginBottom: 36 }}>쇼츠 자동화 앱 사용 방법을 단계별로 안내합니다.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {sections.map((s, i) => (
          <div key={i} style={{ background: '#1a1a1a', borderRadius: 12, padding: '20px 24px', border: '1px solid #2a2a2a' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#ccc', marginBottom: 14 }}>{s.icon} {s.title}</h2>
            <ol style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {s.steps.map((step, j) => (
                <li key={j} style={{ color: '#888', fontSize: 13, lineHeight: 1.6 }}>{step}</li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  )
}
