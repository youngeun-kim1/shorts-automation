// 로컬 개발: Vite 프록시 사용 (빈 문자열 = 상대경로)
// 프로덕션: VITE_API_URL 환경변수에 Railway URL 설정
export const API_BASE = import.meta.env.VITE_API_URL || ''
