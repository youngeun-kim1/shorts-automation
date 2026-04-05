/**
 * YouTube Upload Tool — API Server
 * http://localhost:3333
 */

const express = require('express');
const { google } = require('googleapis');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// ── 경로 ──
const SETTINGS_PATH = path.join(__dirname, 'settings.json');
const CHANNELS_PATH = path.join(__dirname, 'data', 'channels.json');
const LOGS_PATH     = path.join(__dirname, 'data', 'logs.json');
const THUMB_DIR     = path.join(__dirname, 'data', 'thumbnails');
if (!fs.existsSync(THUMB_DIR)) fs.mkdirSync(THUMB_DIR, { recursive: true });

// ── JSON 헬퍼 ──
function load(p, fallback) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return fallback; }
}
function save(p, data) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
}

// ── OAuth 클라이언트 ──
function createClient() {
  const { oauth } = load(SETTINGS_PATH, {});
  if (!oauth?.client_id || !oauth?.client_secret) throw new Error('OAuth 설정이 없습니다. 설정 탭에서 입력하세요.');
  return new google.auth.OAuth2(oauth.client_id, oauth.client_secret, oauth.redirect_uri);
}

const SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube.force-ssl'
];

// ── multer ──
const thumbUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, THUMB_DIR),
    filename: (req, file, cb) => cb(null, `thumb_${Date.now()}${path.extname(file.originalname)}`)
  }),
  fileFilter: (req, file, cb) => {
    const ok = ['.png','.jpg','.jpeg','.webp'].includes(path.extname(file.originalname).toLowerCase());
    cb(null, ok);
  },
  limits: { fileSize: 10 * 1024 * 1024 }
});

// ═══════════════════════════════
// 설정
// ═══════════════════════════════

app.get('/api/settings', (req, res) => {
  const s = load(SETTINGS_PATH, { oauth: {} });
  const { client_id, client_secret, redirect_uri } = s.oauth || {};
  res.json({
    client_id: client_id || '',
    client_secret: client_secret ? '••••••' : '',
    redirect_uri: redirect_uri || 'http://localhost:3333/api/oauth/callback',
    configured: !!(client_id && client_secret)
  });
});

app.post('/api/settings', (req, res) => {
  const { client_id, client_secret, redirect_uri } = req.body;
  const current = load(SETTINGS_PATH, { oauth: {} });
  current.oauth = {
    client_id: client_id || current.oauth?.client_id || '',
    client_secret: client_secret && client_secret !== '••••••' ? client_secret : current.oauth?.client_secret || '',
    redirect_uri: redirect_uri || 'http://localhost:3333/api/oauth/callback'
  };
  save(SETTINGS_PATH, current);
  res.json({ ok: true });
});

app.post('/api/settings/parse-json', (req, res) => {
  try {
    const json = req.body;
    const creds = json.installed || json.web;
    if (!creds) return res.status(400).json({ error: '올바른 OAuth JSON 파일이 아닙니다.' });
    const current = load(SETTINGS_PATH, { oauth: {} });
    current.oauth = {
      client_id: creds.client_id,
      client_secret: creds.client_secret,
      redirect_uri: 'http://localhost:3333/api/oauth/callback'
    };
    save(SETTINGS_PATH, current);
    res.json({ ok: true, client_id: creds.client_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════
// 채널 관리
// ═══════════════════════════════

app.get('/api/channels', (req, res) => {
  res.json(load(CHANNELS_PATH, []));
});

app.post('/api/channels', (req, res) => {
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: '채널명을 입력하세요.' });
  const channels = load(CHANNELS_PATH, []);
  const newCh = {
    id: crypto.randomUUID(),
    name: name.trim(),
    refresh_token: null,
    connected_at: null,
    created_at: new Date().toISOString()
  };
  channels.push(newCh);
  save(CHANNELS_PATH, channels);
  res.json(newCh);
});

app.delete('/api/channels/:id', (req, res) => {
  let channels = load(CHANNELS_PATH, []);
  channels = channels.filter(c => c.id !== req.params.id);
  save(CHANNELS_PATH, channels);
  res.json({ ok: true });
});

// ═══════════════════════════════
// OAuth
// ═══════════════════════════════

app.get('/api/oauth/url/:channelId', (req, res) => {
  try {
    const client = createClient();
    const url = client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'select_account consent',
      state: req.params.channelId
    });
    res.json({ url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/oauth/callback', async (req, res) => {
  const { code, state: channelId, error: oauthError } = req.query;
  if (oauthError) return res.send(oauthPage(false, `인증 거부: ${oauthError}`));
  if (!code || !channelId) return res.send(oauthPage(false, '잘못된 콜백'));

  try {
    const client = createClient();
    const { tokens } = await client.getToken(code);
    if (!tokens.refresh_token) return res.send(oauthPage(false, 'refresh_token 없음. Google 계정 설정에서 앱 접근을 해제 후 다시 시도하세요.'));

    client.setCredentials(tokens);
    let channelTitle = '';
    try {
      const yt = google.youtube({ version: 'v3', auth: client });
      const r = await yt.channels.list({ part: 'snippet', mine: true });
      channelTitle = r.data.items?.[0]?.snippet?.title || '';
    } catch {}

    const channels = load(CHANNELS_PATH, []);
    const idx = channels.findIndex(c => c.id === channelId);
    if (idx === -1) return res.send(oauthPage(false, '채널을 찾을 수 없습니다.'));

    channels[idx].refresh_token = tokens.refresh_token;
    channels[idx].connected_at = new Date().toISOString();
    channels[idx].yt_title = channelTitle;
    save(CHANNELS_PATH, channels);

    res.send(oauthPage(true, `연결 완료! (${channelTitle || channels[idx].name})`));
  } catch (err) {
    res.send(oauthPage(false, err.message));
  }
});

app.delete('/api/oauth/:channelId', (req, res) => {
  const channels = load(CHANNELS_PATH, []);
  const idx = channels.findIndex(c => c.id === req.params.channelId);
  if (idx === -1) return res.status(404).json({ error: '채널 없음' });
  channels[idx].refresh_token = null;
  channels[idx].connected_at = null;
  channels[idx].yt_title = null;
  save(CHANNELS_PATH, channels);
  res.json({ ok: true });
});

function oauthPage(success, message) {
  const escaped = message.replace(/'/g, "\\'");
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
  <body style="font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#0f0f0f;color:white;">
    <div style="text-align:center;max-width:400px;padding:24px;">
      <div style="font-size:48px;margin-bottom:16px;">${success ? '✅' : '❌'}</div>
      <h2 style="color:${success ? '#10b981' : '#ef4444'};font-size:16px;">${message}</h2>
      <p style="color:#888;margin-top:12px;">이 탭을 닫고 돌아가세요.</p>
      <script>if(window.opener){window.opener.postMessage({type:'oauth-complete',success:${success},error:${success ? 'null' : `'${escaped}'`}},'*');}</script>
    </div>
  </body></html>`;
}

// ═══════════════════════════════
// 파일 탐색
// ═══════════════════════════════

const VIDEO_EXTS = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.flv', '.wmv', '.m4v', '.ts', '.mts'];

app.get('/api/files/videos', (req, res) => {
  const folder = req.query.folder;
  if (!folder || !fs.existsSync(folder)) return res.json([]);
  try {
    const files = fs.readdirSync(folder)
      .filter(f => VIDEO_EXTS.includes(path.extname(f).toLowerCase()))
      .map(f => {
        const full = path.join(folder, f);
        const stat = fs.statSync(full);
        const mb = stat.size / (1024 * 1024);
        return { name: f, path: full, size: stat.size, sizeLabel: mb.toFixed(1) + ' MB', modifiedAt: stat.mtime.toISOString() };
      })
      .sort((a, b) => new Date(b.modifiedAt) - new Date(a.modifiedAt));
    res.json(files);
  } catch { res.json([]); }
});

app.post('/api/files/thumbnail', thumbUpload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: '이미지 파일 필요 (png, jpg, webp)' });
  res.json({ path: req.file.path, name: req.file.originalname });
});

app.get('/api/files/serve', (req, res) => {
  const p = req.query.path;
  if (!p || !fs.existsSync(p)) return res.status(404).send('Not found');
  res.sendFile(path.resolve(p));
});

// ═══════════════════════════════
// 업로드
// ═══════════════════════════════

const activeUploads = new Map();

app.post('/api/upload', async (req, res) => {
  const data = req.body;
  if (!data.channel_id) return res.status(400).json({ error: '채널을 선택하세요.' });
  if (!data.source_file) return res.status(400).json({ error: '영상 파일을 선택하세요.' });
  if (!data.title?.trim()) return res.status(400).json({ error: '제목을 입력하세요.' });
  if (!fs.existsSync(data.source_file)) return res.status(400).json({ error: '영상 파일을 찾을 수 없습니다.' });

  const log = {
    id: crypto.randomUUID(),
    channel_id: data.channel_id,
    title: data.title,
    status: '진행중',
    created_at: new Date().toISOString()
  };
  const logs = load(LOGS_PATH, []);
  logs.unshift(log);
  save(LOGS_PATH, logs);

  const isShorts = data.type === '쇼츠';

  if (isShorts) {
    try {
      const result = await executeUpload(log.id, data);
      res.json(result);
    } catch (err) {
      updateLog(log.id, { status: '실패', error: err.message });
      res.status(500).json({ error: err.message });
    }
  } else {
    res.json({ id: log.id, status: '진행중', message: '백그라운드 업로드 시작' });
    executeUpload(log.id, data).catch(err => {
      updateLog(log.id, { status: '실패', error: err.message });
    });
  }
});

async function executeUpload(logId, data) {
  const channels = load(CHANNELS_PATH, []);
  const ch = channels.find(c => c.id === data.channel_id);
  if (!ch?.refresh_token) throw new Error('OAuth 연결이 필요합니다.');

  const client = createClient();
  client.setCredentials({ refresh_token: ch.refresh_token });
  await client.getAccessToken();

  const youtube = google.youtube({ version: 'v3', auth: client });

  const ac = new AbortController();
  activeUploads.set(logId, ac);

  const params = {
    part: ['snippet', 'status'],
    requestBody: {
      snippet: {
        title: data.title,
        description: data.description || '',
        tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        defaultLanguage: 'ko',
        categoryId: '22'
      },
      status: {
        privacyStatus: data.scheduled_at ? 'private' : (data.privacy || 'private'),
        selfDeclaredMadeForKids: false
      }
    },
    media: { body: fs.createReadStream(data.source_file) }
  };

  if (data.scheduled_at) {
    params.requestBody.status.privacyStatus = 'private';
    params.requestBody.status.publishAt = new Date(data.scheduled_at).toISOString();
  }

  const response = await youtube.videos.insert(params);
  const videoId = response.data.id;
  const videoUrl = `https://youtu.be/${videoId}`;

  if (data.thumbnail_path && fs.existsSync(data.thumbnail_path)) {
    try {
      await youtube.thumbnails.set({ videoId, media: { body: fs.createReadStream(data.thumbnail_path) } });
    } catch (e) { console.error('[thumb]', e.message); }
  }

  if (data.pinned_comment?.trim()) {
    try {
      const cr = await youtube.commentThreads.insert({
        part: ['snippet'],
        requestBody: { snippet: { videoId, topLevelComment: { snippet: { textOriginal: data.pinned_comment } } } }
      });
      await youtube.comments.setModerationStatus({
        id: cr.data.snippet.topLevelComment.id,
        moderationStatus: 'published'
      });
    } catch (e) { console.error('[comment]', e.message); }
  }

  updateLog(logId, { status: '성공', video_id: videoId, video_url: videoUrl, uploaded_at: new Date().toISOString() });
  activeUploads.delete(logId);
  return { id: logId, status: '성공', video_id: videoId, video_url: videoUrl };
}

function updateLog(id, fields) {
  const logs = load(LOGS_PATH, []);
  const idx = logs.findIndex(l => l.id === id);
  if (idx !== -1) { Object.assign(logs[idx], fields); save(LOGS_PATH, logs); }
}

// ═══════════════════════════════
// 이력
// ═══════════════════════════════

app.get('/api/logs', (req, res) => {
  const logs = load(LOGS_PATH, []);
  const channels = load(CHANNELS_PATH, []);
  const result = logs.slice(0, 50).map(l => ({
    ...l,
    channel_name: channels.find(c => c.id === l.channel_id)?.name || '-'
  }));
  res.json(result);
});

// ═══════════════════════════════
// CORS (개발용)
// ═══════════════════════════════
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

const PORT = 3333;
app.listen(PORT, () => {
  console.log(`\n✅ YouTube Upload API`);
  console.log(`   http://localhost:${PORT}\n`);
});
