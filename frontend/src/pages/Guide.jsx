// Guide.jsx — 앱 사용법 가이드 (콘텐츠 섹션)
// AdFit/AdSense 심사용 콘텐츠 페이지 + 실제 사용자 유입 SEO 목적

const s = {
  page: { minHeight: '100vh', background: '#0f0f13', color: '#e0e0e0', fontFamily: "'Pretendard','Apple SD Gothic Neo',sans-serif", padding: '0 0 80px' },
  hero: { background: 'linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f0f13 100%)', borderBottom: '1px solid #2a2a3e', padding: '64px 24px 48px', textAlign: 'center' },
  heroEyebrow: { fontSize: '12px', fontWeight: '600', color: '#a78bfa', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' },
  heroTitle: { fontSize: '36px', fontWeight: '800', color: '#fff', margin: '0 0 16px', lineHeight: 1.2 },
  heroSub: { fontSize: '16px', color: '#888', maxWidth: '560px', margin: '0 auto 32px', lineHeight: 1.7 },
  heroBadges: { display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' },
  badge: { background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '20px', padding: '5px 14px', fontSize: '12px', color: '#c4b5fd' },
  wrap: { maxWidth: '860px', margin: '0 auto', padding: '56px 24px 0' },
  stepGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '16px', marginBottom: '60px' },
  stepCard: { background: '#16161f', border: '1px solid #2a2a3e', borderRadius: '12px', padding: '24px', position: 'relative', overflow: 'hidden' },
  stepNum: { fontSize: '48px', fontWeight: '900', color: 'rgba(139,92,246,0.12)', position: 'absolute', top: '12px', right: '16px', lineHeight: 1 },
  stepIcon: { fontSize: '28px', marginBottom: '12px' },
  stepTitle: { fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '8px' },
  stepDesc: { fontSize: '13.5px', color: '#888', lineHeight: '1.7', margin: 0 },
  stepTag: { display: 'inline-block', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '6px', padding: '2px 8px', fontSize: '11px', color: '#a78bfa', marginTop: '10px' },
  sectionHeader: { marginBottom: '24px' },
  sectionLabel: { fontSize: '11px', fontWeight: '700', color: '#a78bfa', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' },
  sectionTitle: { fontSize: '22px', fontWeight: '700', color: '#fff', margin: 0 },
  faqWrap: { marginBottom: '60px' },
  faqItem: { background: '#16161f', border: '1px solid #2a2a3e', borderRadius: '10px', padding: '20px 24px', marginBottom: '12px' },
  faqQ: { fontSize: '14px', fontWeight: '700', color: '#c4b5fd', marginBottom: '8px', display: 'flex', alignItems: 'flex-start', gap: '8px' },
  faqQMark: { background: 'rgba(139,92,246,0.2)', color: '#a78bfa', borderRadius: '50%', width: '20px', height: '20px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', flexShrink: 0, marginTop: '1px' },
  faqA: { fontSize: '13.5px', color: '#888', lineHeight: '1.75', margin: 0, paddingLeft: '28px' },
  tipGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '14px', marginBottom: '60px' },
  tipCard: { background: '#16161f', border: '1px solid #2a2a3e', borderRadius: '10px', padding: '20px' },
  tipIcon: { fontSize: '22px', marginBottom: '10px' },
  tipTitle: { fontSize: '13px', fontWeight: '700', color: '#fff', marginBottom: '6px' },
  tipDesc: { fontSize: '13px', color: '#777', lineHeight: '1.65', margin: 0 },
  cta: { background: 'linear-gradient(135deg,rgba(139,92,246,0.12),rgba(139,92,246,0.04))', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '16px', padding: '40px 32px', textAlign: 'center', marginBottom: '60px' },
  ctaTitle: { fontSize: '22px', fontWeight: '700', color: '#fff', marginBottom: '10px' },
  ctaDesc: { fontSize: '14px', color: '#888', marginBottom: '24px' },
  ctaBtn: { display: 'inline-block', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 32px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', textDecoration: 'none' },
};

const steps = [
  { icon: '✍️', title: '대본 생성', tag: 'STEP 1', desc: '키워드와 타겟 톤을 입력하면 AI가 15~60초 분량의 쇼츠 대본을 자동으로 작성합니다. GPT와 Claude 중 원하는 모델을 선택할 수 있어요.' },
  { icon: '🎙️', title: '음성 & 자막', tag: 'STEP 2', desc: 'gTTS로 한국어 음성을 바로 생성하거나, 직접 녹음한 파일을 업로드하면 Whisper AI가 자막 타이밍을 자동으로 맞춰줍니다.' },
  { icon: '✂️', title: '자막 편집', tag: 'STEP 3', desc: '자동 인식된 자막을 타임코드 단위로 수동 조정할 수 있습니다. 추가·삭제·순서 변경 후 SRT 파일로 바로 저장하세요.' },
  { icon: '📋', title: '메타데이터 생성', tag: 'STEP 4', desc: 'AI가 제목 5개, 설명, 해시태그, 썸네일 문구까지 한 번에 생성합니다. YouTube 업로드 시 바로 붙여넣기만 하면 끝!' },
];

const faqs = [
  { q: 'API 키가 필요한가요?', a: '네, OpenAI 또는 Anthropic API 키가 필요합니다. 키는 브라우저에만 저장되며 서버로 전송되지 않아 안전합니다. 각 플랫폼 공식 사이트에서 발급받을 수 있어요.' },
  { q: 'API 사용 비용은 얼마나 드나요?', a: '대본 1개 생성 기준 GPT-4.1 약 ₩5~15원, Claude Sonnet 약 ₩5~20원 수준입니다. 일반적인 사용 패턴에서는 한 달에 몇백 원 수준입니다.' },
  { q: '생성한 콘텐츠의 저작권은 누구에게 있나요?', a: 'AI가 생성한 콘텐츠의 활용 책임은 이용자 본인에게 있습니다. 상업적 사용 전 OpenAI, Anthropic 각 사의 이용약관을 확인하시기 바랍니다.' },
  { q: 'SRT 파일을 Premiere Pro나 CapCut에서 쓸 수 있나요?', a: '네! 표준 SRT 형식으로 다운로드되기 때문에 Premiere Pro, CapCut, DaVinci Resolve, Final Cut Pro 등 대부분의 영상 편집 툴에서 바로 불러올 수 있습니다.' },
  { q: '모바일에서도 사용할 수 있나요?', a: '700px 이하 화면에서도 사용할 수 있도록 모바일 반응형으로 설계되었습니다. 다만 자막 편집은 데스크탑 환경에서 더 편리합니다.' },
  { q: '어떤 AI 모델을 추천하나요?', a: '빠른 초안 작성에는 GPT-4.1-mini 또는 Claude 3.5 Haiku, 완성도 높은 대본에는 GPT-5.4 또는 Claude Sonnet 4.5를 추천합니다.' },
];

const tips = [
  { icon: '🎯', title: '키워드는 구체적으로', desc: '"요리"보다 "직장인 점심 혼밥 레시피"처럼 타겟을 좁힐수록 대본 품질이 높아집니다.' },
  { icon: '⏱️', title: '15~30초가 최적', desc: '유튜브 쇼츠 알고리즘은 짧고 끝까지 시청되는 영상을 선호합니다. 처음엔 20초 내외로 시작해보세요.' },
  { icon: '🔄', title: '템플릿 저장 활용', desc: '자주 쓰는 프롬프트 스타일을 템플릿으로 저장해두면 같은 시리즈의 영상을 빠르게 만들 수 있습니다.' },
  { icon: '🏷️', title: '메타데이터도 A/B 테스트', desc: '제목 5개 중 클릭률이 높은 것을 실제로 올려보고, 성과를 비교해 자신만의 패턴을 찾아보세요.' },
];

export default function Guide() {
  return (
    <div style={s.page}>
      <div style={s.hero}>
        <p style={s.heroEyebrow}>사용법 가이드</p>
        <h1 style={s.heroTitle}>쇼츠 영상, 이제<br />4단계로 끝냅니다</h1>
        <p style={s.heroSub}>AI 대본 생성부터 자막 편집, 메타데이터까지 — 촬영 없이도 콘텐츠를 만들 수 있는 워크플로우를 소개합니다.</p>
        <div style={s.heroBadges}>
          {['GPT / Claude 지원', 'Whisper 자막 자동화', 'SRT 다운로드', '메타데이터 생성'].map(b => (
            <span key={b} style={s.badge}>{b}</span>
          ))}
        </div>
      </div>
      <div style={s.wrap}>
        <div style={s.sectionHeader}>
          <p style={s.sectionLabel}>Workflow</p>
          <h2 style={s.sectionTitle}>4단계 자동화 워크플로우</h2>
        </div>
        <div style={s.stepGrid}>
          {steps.map((step, i) => (
            <div key={i} style={s.stepCard}>
              <span style={s.stepNum}>{i + 1}</span>
              <div style={s.stepIcon}>{step.icon}</div>
              <div style={s.stepTitle}>{step.title}</div>
              <p style={s.stepDesc}>{step.desc}</p>
              <span style={s.stepTag}>{step.tag}</span>
            </div>
          ))}
        </div>
        <div style={s.sectionHeader}>
          <p style={s.sectionLabel}>Pro Tips</p>
          <h2 style={s.sectionTitle}>쇼츠 조회수를 높이는 실전 팁</h2>
        </div>
        <div style={s.tipGrid}>
          {tips.map((tip, i) => (
            <div key={i} style={s.tipCard}>
              <div style={s.tipIcon}>{tip.icon}</div>
              <div style={s.tipTitle}>{tip.title}</div>
              <p style={s.tipDesc}>{tip.desc}</p>
            </div>
          ))}
        </div>
        <div style={s.sectionHeader}>
          <p style={s.sectionLabel}>FAQ</p>
          <h2 style={s.sectionTitle}>자주 묻는 질문</h2>
        </div>
        <div style={s.faqWrap}>
          {faqs.map((faq, i) => (
            <div key={i} style={s.faqItem}>
              <div style={s.faqQ}>
                <span style={s.faqQMark}>Q</span>
                {faq.q}
              </div>
              <p style={s.faqA}>{faq.a}</p>
            </div>
          ))}
        </div>
        <div style={s.cta}>
          <h2 style={s.ctaTitle}>지금 바로 시작해보세요</h2>
          <p style={s.ctaDesc}>API 키만 있으면 무료로 사용할 수 있습니다. 가입 없이 바로 시작!</p>
          <a href="/" style={s.ctaBtn}>🚀 앱 시작하기</a>
        </div>
      </div>
    </div>
  );
}
