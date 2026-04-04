// PrivacyPolicy.jsx
// 📌 [이름], [이메일], [서비스명] 을 실제 값으로 교체하세요

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
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13.5px' },
  th: { background: '#1e1e2e', color: '#a78bfa', padding: '10px 14px', textAlign: 'left', fontWeight: '600', borderBottom: '1px solid #2a2a3e' },
  td: { padding: '10px 14px', color: '#b0b0c0', borderBottom: '1px solid #1e1e2e', lineHeight: '1.6', verticalAlign: 'top' },
  tdL: { padding: '10px 14px', color: '#b0b0c0', borderBottom: 'none', lineHeight: '1.6', verticalAlign: 'top' },
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

export default function PrivacyPolicy() {
  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.badge}>법적 문서</div>
        <h1 style={s.title}>개인정보처리방침</h1>
        <p style={s.sub}>시행일: 2026년 4월 5일 &nbsp;·&nbsp; 최종 수정: 2026년 4월 5일</p>
      </div>
      <div style={s.wrap}>

        <Section n="1" title="총칙">
          <p style={s.p}><span style={s.hl}>[서비스명]</span>(이하 '서비스')은 이용자의 개인정보를 소중히 여깁니다. 본 방침은 서비스 이용 과정에서 어떤 정보가 수집되고, 어떻게 이용·보호되는지를 안내합니다.</p>
          <p style={s.pL}>서비스는 <span style={s.hl}>이용자의 API 키를 서버에 저장하지 않으며</span>, 생성된 대본·자막·음성 파일 또한 서버에 영구 보관하지 않습니다.</p>
        </Section>

        <Section n="2" title="수집하는 개인정보 항목 및 수집 방법">
          <table style={s.table}>
            <thead>
              <tr><th style={s.th}>구분</th><th style={s.th}>항목</th><th style={s.th}>수집 방법</th></tr>
            </thead>
            <tbody>
              <tr><td style={s.td}>필수</td><td style={s.td}>OpenAI / Anthropic API 키</td><td style={s.td}>이용자 직접 입력 (브라우저 localStorage에만 저장)</td></tr>
              <tr><td style={s.td}>자동 수집</td><td style={s.td}>접속 IP, 브라우저 종류, 접속 시간, 서비스 이용 기록</td><td style={s.td}>서버 로그 자동 수집</td></tr>
              <tr><td style={s.tdL}>광고</td><td style={s.tdL}>광고 클릭·노출 정보</td><td style={s.tdL}>Kakao AdFit SDK 자동 수집</td></tr>
            </tbody>
          </table>
        </Section>

        <Section n="3" title="개인정보의 이용 목적">
          <p style={s.p}>수집된 개인정보는 다음 목적으로만 이용됩니다.</p>
          <p style={s.p}>① AI 대본 생성, TTS 음성 합성, Whisper 자막 변환 등 핵심 서비스 제공</p>
          <p style={s.p}>② 서비스 품질 개선 및 오류 분석</p>
          <p style={s.pL}>③ 광고 서비스 제공 (Kakao AdFit)</p>
        </Section>

        <Section n="4" title="개인정보의 보유 및 파기">
          <table style={s.table}>
            <thead>
              <tr><th style={s.th}>항목</th><th style={s.th}>보유 기간</th><th style={s.th}>파기 방법</th></tr>
            </thead>
            <tbody>
              <tr><td style={s.td}>API 키</td><td style={s.td}>이용자 삭제 시 즉시</td><td style={s.td}>localStorage 삭제</td></tr>
              <tr><td style={s.td}>서버 로그</td><td style={s.td}>최대 30일</td><td style={s.td}>자동 삭제</td></tr>
              <tr><td style={s.tdL}>생성 파일 (음성·자막)</td><td style={s.tdL}>세션 종료 후 즉시</td><td style={s.tdL}>서버 자동 삭제</td></tr>
            </tbody>
          </table>
        </Section>

        <Section n="5" title="개인정보의 제3자 제공">
          <p style={s.p}>서비스는 이용자의 개인정보를 원칙적으로 제3자에게 제공하지 않습니다. 다만, 아래 경우는 예외입니다.</p>
          <p style={s.p}>① <span style={s.hl}>OpenAI / Anthropic</span>: 이용자가 입력한 텍스트가 각 API 서버로 전송됨 (각 사의 개인정보처리방침 적용)</p>
          <p style={s.p}>② <span style={s.hl}>Kakao AdFit</span>: 광고 노출·클릭 관련 정보 (카카오 개인정보처리방침 적용)</p>
          <p style={s.pL}>③ 법령에 의한 요청이 있는 경우</p>
        </Section>

        <Section n="6" title="이용자의 권리">
          <p style={s.p}>이용자는 언제든지 다음 권리를 행사할 수 있습니다.</p>
          <p style={s.p}>· 개인정보 열람, 정정, 삭제 요청</p>
          <p style={s.p}>· 개인정보 처리 정지 요청</p>
          <p style={s.pL}>· 문의: <span style={s.hl}>[이메일]</span> (요청 후 5영업일 이내 처리)</p>
        </Section>

        <Section n="7" title="개인정보 보호책임자">
          <p style={s.p}>성명: <span style={s.hl}>[이름]</span></p>
          <p style={s.p}>이메일: <span style={s.hl}>[이메일]</span></p>
          <p style={s.pL}>개인정보 관련 불만·분쟁은 개인정보분쟁조정위원회(www.kopico.go.kr) 또는 개인정보침해신고센터(privacy.kisa.or.kr)에 문의하실 수 있습니다.</p>
        </Section>

        <div style={s.foot}>
          <p style={s.footP}>본 방침은 관련 법령 또는 서비스 정책 변경 시 사전 공지 후 개정됩니다.</p>
          <p style={s.footD}>공고일: 2026년 4월 5일 &nbsp;·&nbsp; 시행일: 2026년 4월 5일</p>
        </div>

      </div>
    </div>
  );
}
