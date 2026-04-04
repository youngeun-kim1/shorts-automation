// Terms.jsx
// 📌 [서비스명], [이메일] 을 실제 값으로 교체하세요

const s = {
  page: { minHeight: '100vh', background: '#0f0f13', color: '#e0e0e0', fontFamily: "'Pretendard','Apple SD Gothic Neo',sans-serif", padding: '0 0 80px' },
  header: { background: 'linear-gradient(180deg,#1a1a2e 0%,#0f0f13 100%)', borderBottom: '1px solid #2a2a3e', padding: '48px 24px 36px', textAlign: 'center' },
  badge: { display: 'inline-block', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.4)', borderRadius: '20px', padding: '4px 14px', fontSize: '12px', color: '#a78bfa', marginBottom: '16px', letterSpacing: '0.05em' },
  title: { fontSize: '28px', fontWeight: '700', color: '#fff', margin: '0 0 10px' },
  sub: { fontSize: '14px', color: '#555', margin: 0 },
  wrap: { maxWidth: '760px', margin: '0 auto', padding: '48px 24px 0' },
  sec: { marginBottom: '40px' },
  secTitle: { fontSize: '15px', fontWeight: '700', color: '#c4b5fd', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid #1e1e2e', display: 'flex', alignItems: 'center', gap: '8px' },
  num: { background: 'rgba(139,92,246,0.2)', color: '#a78bfa', borderRadius: '50%', width: '22px', height: '22px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', flexShrink: 0 },
  card: { background: '#16161f', border: '1px solid #2a2a3e', borderRadius: '10px', padding: '20px 24px' },
  p: { fontSize: '14px', lineHeight: '1.85', color: '#b0b0c0', margin: '0 0 10px' },
  pL: { fontSize: '14px', lineHeight: '1.85', color: '#b0b0c0', margin: 0 },
  hl: { color: '#c4b5fd', fontWeight: '600' },
  warn: { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', padding: '14px 18px', marginBottom: '12px' },
  warnText: { fontSize: '13.5px', color: '#fca5a5', margin: 0, lineHeight: '1.7' },
  foot: { margin: '48px 0 0', padding: '24px', background: '#16161f', border: '1px solid #2a2a3e', borderRadius: '10px', textAlign: 'center' },
  footP: { fontSize: '13px', color: '#555', margin: '0 0 6px' },
  footD: { fontSize: '12px', color: '#444', margin: 0 },
};

const Section = ({ n, title, children }) => (
  <div style={s.sec}>
    <div style={s.secTitle}><span style={s.num}>{n}</span>{title}</div>
    <div style={s.card}>{children}</div>
  </div>
);

export default function Terms() {
  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.badge}>법적 문서</div>
        <h1 style={s.title}>이용약관</h1>
        <p style={s.sub}>시행일: 2026년 4월 5일 &nbsp;·&nbsp; 최종 수정: 2026년 4월 5일</p>
      </div>
      <div style={s.wrap}>

        <Section n="1" title="목적">
          <p style={s.pL}>본 약관은 <span style={s.hl}>[서비스명]</span>(이하 '서비스')이 제공하는 쇼츠 자동화 웹 서비스의 이용 조건 및 절차, 이용자와 서비스 간의 권리·의무 및 책임 사항을 규정함을 목적으로 합니다.</p>
        </Section>

        <Section n="2" title="서비스의 내용">
          <p style={s.p}>서비스는 다음 기능을 제공합니다.</p>
          <p style={s.p}>① AI 기반 쇼츠 대본 자동 생성 (OpenAI GPT, Anthropic Claude API 활용)</p>
          <p style={s.p}>② TTS(Text-to-Speech) 음성 생성 및 Whisper 기반 자막 자동 인식</p>
          <p style={s.p}>③ SRT 자막 편집 및 다운로드</p>
          <p style={s.pL}>④ YouTube 메타데이터(제목·설명·태그) 자동 생성</p>
        </Section>

        <Section n="3" title="이용자의 의무">
          <div style={s.warn}>
            <p style={s.warnText}>⚠️ 이용자는 본인 명의의 유효한 API 키를 사용해야 하며, 타인의 API 키를 무단으로 사용하는 행위는 엄격히 금지됩니다.</p>
          </div>
          <p style={s.p}>이용자는 다음 행위를 해서는 안 됩니다.</p>
          <p style={s.p}>① 서비스를 이용한 불법·음란·혐오 콘텐츠 생성</p>
          <p style={s.p}>② 서비스의 비정상적 사용을 통한 서버 과부하 유발</p>
          <p style={s.p}>③ 서비스의 소스코드·디자인을 무단으로 복제·배포</p>
          <p style={s.pL}>④ 기타 관련 법령에 위반되는 행위</p>
        </Section>

        <Section n="4" title="API 키 및 비용">
          <p style={s.p}>서비스는 이용자가 직접 발급받은 OpenAI 또는 Anthropic API 키를 사용하는 구조입니다.</p>
          <p style={s.p}>AI 기능 이용에 따라 발생하는 <span style={s.hl}>API 비용은 전적으로 이용자 본인이 부담</span>하며, 서비스는 이에 대해 어떠한 책임도 지지 않습니다.</p>
          <p style={s.pL}>API 키는 브라우저의 localStorage에만 저장되며, 서버에는 전송·저장되지 않습니다.</p>
        </Section>

        <Section n="5" title="서비스 제공의 제한 및 중단">
          <p style={s.p}>서비스는 다음의 경우 사전 통보 없이 서비스 제공을 제한하거나 중단할 수 있습니다.</p>
          <p style={s.p}>① 시스템 점검·업데이트·긴급 장애 대응</p>
          <p style={s.p}>② 외부 API(OpenAI, Anthropic, Kakao 등) 장애</p>
          <p style={s.pL}>③ 기타 불가항력적 사유</p>
        </Section>

        <Section n="6" title="면책조항">
          <p style={s.p}>서비스는 AI가 생성한 콘텐츠의 정확성, 저작권 침해 여부, 제3자와의 분쟁에 대해 책임을 지지 않습니다.</p>
          <p style={s.pL}>생성된 콘텐츠의 사용 및 배포에 대한 책임은 전적으로 이용자에게 있습니다.</p>
        </Section>

        <Section n="7" title="광고">
          <p style={s.pL}>서비스는 Kakao AdFit을 통한 광고를 게재할 수 있습니다. 광고는 이용자 경험을 해치지 않는 범위 내에서 제공됩니다.</p>
        </Section>

        <Section n="8" title="약관의 변경">
          <p style={s.pL}>서비스는 필요 시 약관을 변경할 수 있으며, 변경된 약관은 서비스 내 공지 또는 이메일을 통해 안내합니다. 변경 후 계속 서비스를 이용하는 경우 변경된 약관에 동의한 것으로 간주합니다.</p>
        </Section>

        <Section n="9" title="문의">
          <p style={s.pL}>이용약관에 관한 문의: <span style={s.hl}>[이메일]</span></p>
        </Section>

        <div style={s.foot}>
          <p style={s.footP}>본 약관은 대한민국 법률에 따라 해석되며, 분쟁 발생 시 관할 법원은 민사소송법에 따릅니다.</p>
          <p style={s.footD}>공고일: 2026년 4월 5일 &nbsp;·&nbsp; 시행일: 2026년 4월 5일</p>
        </div>

      </div>
    </div>
  );
}
