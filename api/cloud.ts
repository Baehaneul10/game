// 클라우드 저장 API (Vercel Serverless Function, TypeScript)
// GET  /api/cloud?id=ABC123        → 저장 데이터 로드
// POST /api/cloud {id, data}      → 저장 (upsert)
//
// 백엔드: Notion 데이터베이스
// 필요한 Vercel 환경변수:
//   NOTION_TOKEN — Notion 통합(Integration) 시크릿. https://www.notion.so/my-integrations 에서 생성
//                  후 대상 데이터베이스에 통합을 '연결(Connections)'해야 함
//   NOTION_DB    — (선택) 데이터베이스 ID. 기본값은 아래 DEFAULT_DB
// 데이터베이스 요구 속성: 제목(title) 속성 1개 (이름 무관). 'Data'(서식 있는 텍스트)와
// 'Updated'(텍스트) 속성은 없으면 API가 자동으로 추가함.

const DEFAULT_DB = '39b598b7dea480518ff7d5243bea5c2d';
const NOTION = 'https://api.notion.com/v1';
const NV = '2022-06-28';

type Json = Record<string, any>;

// Node 런타임 전역 (Vercel은 @types/node 없이 빌드하므로 직접 선언)
declare const process: { env: Record<string, string | undefined> };

function headers(token: string): Record<string, string> {
  return {
    'Authorization': `Bearer ${token}`,
    'Notion-Version': NV,
    'Content-Type': 'application/json',
  };
}

async function notion(token: string, path: string, method: string, body?: Json): Promise<Json> {
  const r = await fetch(`${NOTION}${path}`, {
    method,
    headers: headers(token),
    body: body ? JSON.stringify(body) : undefined,
  });
  const j = await r.json();
  if (!r.ok) throw new Error(`notion ${r.status}: ${(j as Json)?.message || 'error'}`);
  return j as Json;
}

// 제목 속성 이름 찾기 + Data 속성 없으면 생성
async function ensureSchema(token: string, db: string): Promise<{ titleProp: string }> {
  const meta = await notion(token, `/databases/${db}`, 'GET');
  let titleProp = 'Name';
  let hasData = false;
  for (const [name, prop] of Object.entries(meta.properties as Json)) {
    if ((prop as Json).type === 'title') titleProp = name;
    if (name === 'Data' && (prop as Json).type === 'rich_text') hasData = true;
  }
  if (!hasData) {
    await notion(token, `/databases/${db}`, 'PATCH', {
      properties: { Data: { rich_text: {} } },
    });
  }
  return { titleProp };
}

async function findPage(token: string, db: string, titleProp: string, id: string): Promise<string | null> {
  const q = await notion(token, `/databases/${db}/query`, 'POST', {
    filter: { property: titleProp, title: { equals: id } },
    page_size: 1,
  });
  return q.results?.length ? q.results[0].id : null;
}

// Notion rich_text 항목당 2000자 제한 → 조각으로 분할
function chunks(s: string): Json[] {
  const out: Json[] = [];
  for (let i = 0; i < s.length; i += 1900) out.push({ text: { content: s.slice(i, i + 1900) } });
  return out.slice(0, 100);
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'content-type');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = process.env.NOTION_TOKEN;
  const db = (process.env.NOTION_DB || DEFAULT_DB).replace(/-/g, '');
  if (!token) {
    return res.status(501).json({ error: 'NOT_CONFIGURED', message: 'Vercel 환경변수 NOTION_TOKEN을 설정하세요' });
  }

  try {
    const { titleProp } = await ensureSchema(token, db);

    if (req.method === 'GET') {
      const id = String(req.query.id || '').trim().toUpperCase();
      if (!/^[A-Z0-9]{4,12}$/.test(id)) return res.status(400).json({ error: 'BAD_ID' });
      const pageId = await findPage(token, db, titleProp, id);
      if (!pageId) return res.status(404).json({ error: 'NOT_FOUND' });
      const page = await notion(token, `/pages/${pageId}`, 'GET');
      const rich = page.properties?.Data?.rich_text || [];
      const data = rich.map((r: Json) => r.plain_text || r.text?.content || '').join('');
      return res.status(200).json({ id, data });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const id = String(body.id || '').trim().toUpperCase();
      const data = String(body.data || '');
      if (!/^[A-Z0-9]{4,12}$/.test(id)) return res.status(400).json({ error: 'BAD_ID' });
      if (!data || data.length > 150000) return res.status(400).json({ error: 'BAD_DATA' });
      const props: Json = {
        Data: { rich_text: chunks(data) },
      };
      const pageId = await findPage(token, db, titleProp, id);
      if (pageId) {
        await notion(token, `/pages/${pageId}`, 'PATCH', { properties: props });
      } else {
        props[titleProp] = { title: [{ text: { content: id } }] };
        await notion(token, `/pages`, 'POST', { parent: { database_id: db }, properties: props });
      }
      return res.status(200).json({ ok: true, id });
    }

    return res.status(405).json({ error: 'METHOD' });
  } catch (e: any) {
    return res.status(500).json({ error: 'SERVER', message: e?.message || String(e) });
  }
}
