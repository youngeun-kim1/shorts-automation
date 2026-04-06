import { useState, useEffect, useRef } from 'react'

const S = {
  card: { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12, padding: 20, marginBottom: 16 },
  cardTitle: { fontSize: 13, fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 },
  input: { width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: 8, color: '#fff', padding: '9px 12px', fontSize: 13, outline: 'none' },
  select: { width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: 8, color: '#fff', padding: '9px 12px', fontSize: 13, outline: 'none' },
  textarea: { width: '100%', background: '#111', border: '1px solid #2a2a2a', borderRadius: 8, color: '#fff', padding: '9px 12px', fontSize: 13, outline: 'none', resize: 'vertical', minHeight: 80, fontFamily: 'inherit' },
  label: { display: 'block', fontSize: 12, color: '#666', marginBottom: 5 },
  row: { marginBottom: 14 },
  btn: (bg = '#6c63ff', color = '#fff') => ({ background: bg, color, border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }),
  btnSm: (bg = '#222', color = '#aaa') => ({ background: bg, color, border: '1px solid #2a2a2a', borderRadius: 6, padding: '5px 10px', fontSize: 12, cursor: 'pointer' }),
  badge: (bg, color) => ({ display: 'inline-block', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: bg, color }),
}

async function api(method, path, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } }
  if (body) opts.body = JSON.stringify(body)
  const res = await fetch('/api' + path, opts)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || '오류가 발생했습니다.')
  return data
}

// ═══════════════════════════════
// Toast
// ═══════════════════════════════
function useToast() {
  const [toasts, setToasts] = useState([])
  const add = (msg, type = 'info') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, msg, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }
  const el = toasts.length > 0 && (
    <div style={{ position: 'fixed', top: 70, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '12px 16px', fontSize: 13,
          minWidth: 200, maxWidth: 320, boxShadow: '0 4px 20px rgba(0,0,0,.5)',
          borderLeft: `3px solid ${t.type === 'success' ? '#10b981' : t.type === 'error' ? '#ef4444' : '#6c63ff'}`,
        }}>{t.msg}</div>
      ))}
    </div>
  )
  return { toast: add, ToastContainer: () => el }
}

// ═══════════════════════════════
// Main
// ═══════════════════════════════
export default function UploadPage() {
  const [subTab, setSubTab] = useState('upload')
  const { toast, ToastContainer } = useToast()

  const SUB_TABS = [
    { id: 'upload', label: '📤 업로드' },
    { id: 'logs', label: '📋 이력' },
    { id: 'settings', label: '⚙️ 설정' },
  ]

  return (
    <div>
      <ToastContainer />
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #2a2a2a', paddingTop: 12, marginBottom: 24 }}>
        {SUB_TABS.map(tab => (
          <button key={tab.id} onClick={() => setSubTab(tab.id)} style={{
            background: subTab === tab.id ? '#ef4444' : 'transparent',
            color: subTab === tab.id ? '#fff' : '#666',
            border: 'none', borderRadius: '8px 8px 0 0', padding: '9px 16px', fontSize: 14, cursor: 'pointer',
          }}>{tab.label}</button>
        ))}
      </div>

      {subTab === 'upload' && <UploadTab toast={toast} />}
      {subTab === 'logs' && <LogsTab toast={toast} />}
      {subTab === 'settings' && <SettingsTab toast={toast} />}
    </div>
  )
}

// ═══════════════════════════════
// 업로드 탭
// ═══════════════════════════════
function UploadTab({ toast }) {
  const [channels, setChannels] = useState([])
  const [selectedChannel, setSelectedChannel] = useState(null)
  const [folder, setFolder] = useState(() => localStorage.getItem('upload-folder') || '')
  const [files, setFiles] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [tags, setTags] = useState('')
  const [privacy, setPrivacy] = useState('private')
  const [uploadType, setUploadType] = useState('롱폼')
  const [schedule, setSchedule] = useState('')
  const [comment, setComment] = useState('')
  const [thumbPath, setThumbPath] = useState(null)
  const [thumbName, setThumbName] = useState('')
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)
  const thumbRef = useRef()

  useEffect(() => {
    api('GET', '/channels').then(data => setChannels(Array.isArray(data) ? data : [])).catch(() => {})
    if (folder) loadFiles(folder)
  }, [])

  async function loadFiles(f) {
    if (!f) return
    localStorage.setItem('upload-folder', f)
    try {
      const res = await fetch('/api/files/videos?folder=' + encodeURIComponent(f))
      setFiles(await res.json())
    } catch { setFiles([]) }
  }

  function handleFolderChange(val) {
    setFolder(val)
    // 경로 변경 시 디바운스 자동 탐색
    clearTimeout(window._folderTimer)
    window._folderTimer = setTimeout(() => loadFiles(val), 800)
  }

  function selectFile(file) {
    setSelectedFile(file)
    if (!title) setTitle(file.name.replace(/\.mp4$/i, ''))
  }

  async function handleThumb(e) {
    const file = e.target.files[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch('/api/files/thumbnail', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setThumbPath(data.path)
      setThumbName(data.name)
      toast('썸네일 업로드 완료', 'success')
    } catch (e) { toast('썸네일 실패: ' + e.message, 'error') }
    e.target.value = ''
  }

  async function startUpload() {
    if (uploading) return
    if (!selectedChannel) return toast('채널을 선택하세요.', 'error')
    if (!selectedFile) return toast('영상 파일을 선택하세요.', 'error')
    if (!title.trim()) return toast('제목을 입력하세요.', 'error')

    setUploading(true)
    setResult(null)
    try {
      const res = await api('POST', '/upload', {
        channel_id: selectedChannel,
        source_file: selectedFile.path,
        title: title.trim(),
        description: desc,
        tags,
        privacy,
        type: uploadType,
        scheduled_at: schedule || null,
        pinned_comment: comment,
        thumbnail_path: thumbPath,
      })
      setResult(res)
      if (res.video_url) toast('업로드 완료!', 'success')
      else toast('백그라운드 업로드 시작', 'info')
    } catch (e) {
      setResult({ error: e.message })
      toast('업로드 실패: ' + e.message, 'error')
    }
    setUploading(false)
  }

  function reset() {
    setSelectedFile(null); setTitle(''); setDesc(''); setTags(''); setSchedule(''); setComment('')
    setThumbPath(null); setThumbName(''); setResult(null)
  }

  const connected = channels.filter(c => c.refresh_token)

  // ── 업로드 결과 ──
  if (result?.video_url) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#10b981', marginBottom: 8 }}>업로드 완료!</h2>
        <p style={{ color: '#888', marginBottom: 16 }}>{title}</p>
        <a href={result.video_url} target="_blank" rel="noreferrer" style={{ ...S.btn('#ef4444'), textDecoration: 'none', display: 'inline-block', marginBottom: 16 }}>🔗 YouTube에서 보기</a>
        <br />
        <button onClick={reset} style={S.btn('#222', '#aaa')}>새 업로드</button>
      </div>
    )
  }

  if (result?.error) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>❌</div>
        <h2 style={{ fontSize: 18, color: '#ef4444', marginBottom: 8 }}>업로드 실패</h2>
        <p style={{ color: '#888', fontSize: 13, marginBottom: 16 }}>{result.error}</p>
        <button onClick={() => setResult(null)} style={S.btn('#222', '#aaa')}>다시 시도</button>
      </div>
    )
  }

  if (result?.status === '진행중') {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⏫</div>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>백그라운드 업로드 중</h2>
        <p style={{ color: '#888', fontSize: 13 }}>이력 탭에서 진행 상황을 확인하세요.</p>
      </div>
    )
  }

  return (
    <div>
      {/* 1. 채널 선택 */}
      <div style={S.card}>
        <div style={S.cardTitle}><span>1</span> 채널 선택</div>
        {connected.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: '#666', fontSize: 13 }}>
            📺 연결된 채널이 없습니다. 설정 탭에서 채널을 추가하세요.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {connected.map(ch => {
              const sel = selectedChannel === ch.id
              return (
                <div key={ch.id} onClick={() => setSelectedChannel(ch.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: 12,
                  background: sel ? 'rgba(239,68,68,.1)' : '#111', borderRadius: 8, cursor: 'pointer',
                  border: `2px solid ${sel ? '#ef4444' : 'transparent'}`,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 14, background: sel ? '#ef4444' : '#333',
                  }}>{(ch.yt_title || ch.name).charAt(0).toUpperCase()}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{ch.yt_title || ch.name}</div>
                    <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>연결됨</div>
                  </div>
                  {sel && <span style={{ color: '#ef4444', fontSize: 18 }}>✓</span>}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 2. 파일 선택 */}
      <div style={S.card}>
        <div style={{ ...S.cardTitle, justifyContent: 'space-between' }}>
          <span><span style={{ marginRight: 6 }}>2</span>영상 파일 선택</span>
          <button onClick={() => loadFiles(folder)} style={S.btnSm()}>🔄 새로고침</button>
        </div>
        <div style={S.row}>
          <label style={S.label}>📁 영상 폴더</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              style={{ ...S.input, flex: 1, border: '1px solid #444', background: '#0a0a0a' }}
              value={folder}
              onChange={e => handleFolderChange(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') loadFiles(folder) }}
              placeholder="폴더 경로를 입력하세요 (예: C:\Videos)"
            />
            <button onClick={() => loadFiles(folder)} style={{ ...S.btn('#333', '#ddd'), padding: '8px 14px', whiteSpace: 'nowrap' }}>📂 탐색</button>
          </div>
          <div style={{ fontSize: 11, color: '#555', marginTop: 4 }}>전체 경로를 입력하세요 (예: C:\Users\이름\Videos) → 탐색 또는 Enter</div>
        </div>
        <div>
          {files.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: '#555', fontSize: 13 }}>
              {folder ? '영상 파일이 없습니다.' : '폴더 경로를 입력하고 탐색을 누르세요.'}
            </div>
          ) : files.map(f => {
            const sel = selectedFile?.path === f.path
            return (
              <div key={f.path} onClick={() => selectFile(f)} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 6, cursor: 'pointer',
                border: `2px solid ${sel ? '#ef4444' : 'transparent'}`, background: sel ? 'rgba(239,68,68,.1)' : 'transparent',
              }}>
                <span style={{ fontSize: 18 }}>🎬</span>
                <span style={{ flex: 1, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                <span style={{ fontSize: 11, color: '#666', flexShrink: 0 }}>{f.sizeLabel}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* 3. 메타정보 */}
      <div style={S.card}>
        <div style={S.cardTitle}><span style={{ marginRight: 6 }}>3</span>영상 정보</div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
          <div style={{ flex: 1 }}>
            <label style={S.label}>유형</label>
            <select style={S.select} value={uploadType} onChange={e => setUploadType(e.target.value)}>
              <option value="롱폼">롱폼 (일반)</option>
              <option value="쇼츠">쇼츠</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={S.label}>공개 설정</label>
            <select style={S.select} value={privacy} onChange={e => setPrivacy(e.target.value)}>
              <option value="private">비공개</option>
              <option value="unlisted">일부 공개</option>
              <option value="public">공개</option>
            </select>
          </div>
        </div>

        <div style={S.row}>
          <label style={S.label}>제목 <span style={{ color: '#ef4444' }}>*</span></label>
          <input style={S.input} value={title} onChange={e => setTitle(e.target.value)} placeholder="영상 제목을 입력하세요" maxLength={100} />
        </div>
        <div style={S.row}>
          <label style={S.label}>설명</label>
          <textarea style={S.textarea} value={desc} onChange={e => setDesc(e.target.value)} placeholder="영상 설명 (선택)" rows={4} />
        </div>
        <div style={S.row}>
          <label style={S.label}>태그 (쉼표로 구분)</label>
          <input style={S.input} value={tags} onChange={e => setTags(e.target.value)} placeholder="태그1, 태그2, 태그3" />
        </div>
        <div style={S.row}>
          <label style={S.label}>예약 발행 (선택)</label>
          <input type="datetime-local" style={S.input} value={schedule} onChange={e => setSchedule(e.target.value)} />
        </div>
        <div style={S.row}>
          <label style={S.label}>고정 댓글 (선택)</label>
          <textarea style={S.textarea} value={comment} onChange={e => setComment(e.target.value)} placeholder="고정할 댓글 내용" rows={2} />
        </div>
      </div>

      {/* 4. 썸네일 */}
      <div style={S.card}>
        <div style={S.cardTitle}><span style={{ marginRight: 6 }}>4</span>썸네일 (선택)</div>
        {thumbPath ? (
          <div>
            <img src={'/api/files/serve?path=' + encodeURIComponent(thumbPath)} alt="thumb"
              style={{ width: '100%', maxHeight: 180, objectFit: 'contain', borderRadius: 6, background: '#111' }} />
            <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: '#666' }}>{thumbName}</span>
              <button onClick={() => { setThumbPath(null); setThumbName('') }} style={S.btnSm()}>🗑️ 제거</button>
            </div>
          </div>
        ) : (
          <div onClick={() => thumbRef.current?.click()} style={{
            border: '2px dashed #2a2a2a', borderRadius: 8, padding: 28, textAlign: 'center', cursor: 'pointer', color: '#666', fontSize: 13,
          }}>
            🖼️ 클릭하여 이미지 업로드 (PNG, JPG, WEBP · 최대 10MB)
          </div>
        )}
        <input ref={thumbRef} type="file" accept=".png,.jpg,.jpeg,.webp" onChange={handleThumb} style={{ display: 'none' }} />
      </div>

      {/* 버튼 */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginBottom: 40 }}>
        <button onClick={reset} style={S.btn('#222', '#aaa')}>초기화</button>
        <button onClick={startUpload} disabled={uploading} style={{ ...S.btn('#ef4444'), opacity: uploading ? 0.5 : 1 }}>
          {uploading ? '⏳ 업로드 중...' : '📤 업로드 시작'}
        </button>
      </div>
    </div>
  )
}

// ═══════════════════════════════
// 이력 탭
// ═══════════════════════════════
function LogsTab({ toast }) {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadLogs() }, [])

  async function loadLogs() {
    setLoading(true)
    try { const data = await api('GET', '/logs'); setLogs(Array.isArray(data) ? data : []) } catch {}
    setLoading(false)
  }

  const statusBadge = (s) => {
    if (s === '성공') return <span style={S.badge('rgba(16,185,129,.15)', '#10b981')}>성공</span>
    if (s === '실패') return <span style={S.badge('rgba(239,68,68,.15)', '#ef4444')}>실패</span>
    if (s === '진행중') return <span style={S.badge('rgba(245,158,11,.15)', '#f59e0b')}>진행중</span>
    return <span style={S.badge('#222', '#888')}>{s}</span>
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <button onClick={loadLogs} style={S.btnSm()}>🔄 새로고침</button>
      </div>
      <div style={S.card}>
        {logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#666', fontSize: 13 }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
            업로드 이력이 없습니다.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['상태', '채널', '제목', '링크', '날짜'].map(h => (
                  <th key={h} style={{ textAlign: 'left', fontSize: 11, color: '#666', padding: '8px 12px', borderBottom: '1px solid #2a2a2a', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map(l => (
                <tr key={l.id}>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid #2a2a2a', fontSize: 12 }}>{statusBadge(l.status)}</td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid #2a2a2a', fontSize: 12 }}>{l.channel_name || '-'}</td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid #2a2a2a', fontSize: 12, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title}</td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid #2a2a2a', fontSize: 12 }}>
                    {l.video_url ? <a href={l.video_url} target="_blank" rel="noreferrer" style={{ color: '#ef4444', textDecoration: 'none' }}>보기</a> : '-'}
                  </td>
                  <td style={{ padding: '10px 12px', borderBottom: '1px solid #2a2a2a', fontSize: 12, whiteSpace: 'nowrap' }}>
                    {l.created_at ? new Date(l.created_at).toLocaleString('ko') : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════
// 설정 탭
// ═══════════════════════════════
function SettingsTab({ toast }) {
  const [configured, setConfigured] = useState(false)
  const [clientIdPreview, setClientIdPreview] = useState('')
  const [channels, setChannels] = useState([])
  const [newName, setNewName] = useState('')
  const jsonRef = useRef()

  useEffect(() => {
    loadSettingsStatus()
    loadChannels()
  }, [])

  async function loadSettingsStatus() {
    try {
      const s = await api('GET', '/settings')
      setConfigured(s.configured)
      setClientIdPreview(s.client_id ? s.client_id.substring(0, 20) + '...' : '')
    } catch {}
  }

  async function loadChannels() {
    try { const data = await api('GET', '/channels'); setChannels(Array.isArray(data) ? data : []) } catch {}
  }

  async function handleJson(e) {
    const file = e.target.files[0]
    if (!file) return
    const text = await file.text()
    try {
      const json = JSON.parse(text)
      const data = await api('POST', '/settings/parse-json', json)
      setConfigured(true)
      setClientIdPreview(data.client_id ? data.client_id.substring(0, 20) + '...' : '')
      toast('자격증명 등록 완료', 'success')
    } catch (e) { toast('JSON 파싱 오류: ' + e.message, 'error') }
    e.target.value = ''
  }

  async function resetCredentials() {
    if (!confirm('자격증명을 초기화하시겠습니까?')) return
    try {
      await api('POST', '/settings', { client_id: '', client_secret: '' })
      setConfigured(false)
      setClientIdPreview('')
      toast('초기화됨', 'success')
    } catch (e) { toast(e.message, 'error') }
  }

  async function addChannel() {
    if (!newName.trim()) return toast('채널 이름을 입력하세요.', 'error')
    try {
      await api('POST', '/channels', { name: newName.trim() })
      setNewName('')
      await loadChannels()
      toast('채널 추가됨', 'success')
    } catch (e) { toast(e.message, 'error') }
  }

  async function deleteChannel(id) {
    if (!confirm('채널을 삭제하시겠습니까?')) return
    try {
      await api('DELETE', '/channels/' + id)
      await loadChannels()
      toast('삭제됨', 'success')
    } catch (e) { toast(e.message, 'error') }
  }

  async function connectOAuth(channelId) {
    try {
      const { url } = await api('GET', '/oauth/url/' + channelId)
      const w = window.open(url, '_blank', 'width=500,height=700')
      const handler = async (e) => {
        if (e.data?.type !== 'oauth-complete') return
        window.removeEventListener('message', handler)
        if (e.data.success) { toast('OAuth 연결 완료!', 'success'); await loadChannels() }
        else toast('OAuth 실패: ' + (e.data.error || ''), 'error')
      }
      window.addEventListener('message', handler)
    } catch (e) { toast(e.message, 'error') }
  }

  async function disconnectOAuth(channelId) {
    if (!confirm('연결을 해제하시겠습니까?')) return
    try {
      await api('DELETE', '/oauth/' + channelId)
      await loadChannels()
      toast('연결 해제됨', 'success')
    } catch (e) { toast(e.message, 'error') }
  }

  return (
    <div>
      {/* OAuth 자격증명 */}
      <div style={S.card}>
        <div style={S.cardTitle}>🔑 앱 자격증명</div>
        <p style={{ fontSize: 12, color: '#666', marginBottom: 14 }}>
          Google Cloud Console에서 OAuth 2.0 클라이언트 ID를 생성 후 credentials.json 파일을 업로드하세요.
          <br />리디렉션 URI: <code style={{ color: '#ef4444' }}>http://localhost:3333/api/oauth/callback</code>
        </p>

        {configured ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.2)', borderRadius: 8 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#10b981', marginBottom: 2 }}>✅ 등록 완료</div>
              <div style={{ fontSize: 11, color: '#666' }}>{clientIdPreview}</div>
            </div>
            <button onClick={resetCredentials} style={S.btnSm()}>초기화</button>
          </div>
        ) : (
          <div>
            <div onClick={() => jsonRef.current?.click()} style={{
              border: '2px dashed #2a2a2a', borderRadius: 8, padding: 24, textAlign: 'center', cursor: 'pointer', color: '#666', fontSize: 13,
            }}>
              📄 credentials.json 파일을 클릭하여 업로드
            </div>
            <div style={{ marginTop: 8, textAlign: 'center' }}>
              <span style={{ ...S.badge('rgba(239,68,68,.15)', '#ef4444') }}>❌ 미등록</span>
            </div>
          </div>
        )}
        <input ref={jsonRef} type="file" accept=".json" onChange={handleJson} style={{ display: 'none' }} />
      </div>

      {/* 채널 관리 */}
      <div style={S.card}>
        <div style={{ ...S.cardTitle, justifyContent: 'space-between' }}>
          <span>📺 채널 관리</span>
          <button onClick={loadChannels} style={S.btnSm()}>🔄</button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input style={{ ...S.input, flex: 1 }} value={newName} onChange={e => setNewName(e.target.value)} placeholder="채널 이름 (ex: 내 채널)"
            onKeyDown={e => { if (e.key === 'Enter') addChannel() }} />
          <button onClick={addChannel} style={S.btn('#10b981')}>+ 추가</button>
        </div>

        {channels.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0', color: '#666', fontSize: 13 }}>채널이 없습니다. 위에서 추가하세요.</div>
        ) : channels.map(ch => {
          const connected = !!ch.refresh_token
          return (
            <div key={ch.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, background: '#111', borderRadius: 8, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: connected ? '#ef4444' : '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                {(ch.yt_title || ch.name).charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{ch.yt_title || ch.name}</div>
                <div style={{ fontSize: 11, color: '#666', marginTop: 2 }}>
                  {connected ? `✅ 연결됨 · ${ch.connected_at ? new Date(ch.connected_at).toLocaleDateString('ko') : ''}` : '⚪ 미연결'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                {connected
                  ? <button onClick={() => disconnectOAuth(ch.id)} style={S.btnSm()}>연결 해제</button>
                  : <button onClick={() => connectOAuth(ch.id)} style={S.btnSm('#10b981', '#fff')}>🔗 연결</button>
                }
                <button onClick={() => deleteChannel(ch.id)} style={{ ...S.btnSm(), color: '#ef4444' }}>✕</button>
              </div>
            </div>
          )
        })}
      </div>

      {/* 사용 안내 */}
      <div style={S.card}>
        <div style={S.cardTitle}>📖 사용 방법</div>
        <ol style={{ lineHeight: 2, color: '#888', fontSize: 13, paddingLeft: 20 }}>
          <li>Google Cloud Console에서 OAuth 2.0 클라이언트 ID를 생성합니다.</li>
          <li>리디렉션 URI에 <code style={{ color: '#ef4444' }}>http://localhost:3333/api/oauth/callback</code> 을 추가합니다.</li>
          <li>credentials.json을 업로드하면 자동 등록됩니다.</li>
          <li>채널을 추가하고 🔗 연결 버튼으로 YouTube 계정과 연결합니다.</li>
          <li>업로드 탭에서 채널, 영상 파일, 메타정보를 입력하고 업로드합니다.</li>
        </ol>
      </div>
    </div>
  )
}
