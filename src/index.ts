// ===================================================
//  Telegram Tech News Bot — Cloudflare Worker
//  Sources: The Guardian  +  Hacker News
// ===================================================

export interface Env {
  TELEGRAM_BOT_TOKEN: string;
  GUARDIAN_API_KEY: string;
}

// ---------- Telegram types ----------
interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

interface TelegramMessage {
  message_id: number;
  from?: { id: number; first_name: string; username?: string };
  chat: { id: number; type: string };
  date: number;
  text?: string;
}

// ---------- Guardian types ----------
interface GuardianResult {
  webTitle: string;
  webUrl: string;
  webPublicationDate: string;
}

interface GuardianResponse {
  response: { status: string; results: GuardianResult[] };
}

// ---------- Hacker News types ----------
interface HNStory {
  id: number;
  title?: string;
  url?: string;
  score?: number;
}

// ===================================================
//  MarkdownV2 helpers
// ===================================================

/** Escape every character that Telegram MarkdownV2 treats as special. */
function esc(text: string): string {
  return text.replace(/[_*[\]()~`>#+=|{}.!\-]/g, '\\$&');
}

/** Escape only ) inside URLs (the only char that breaks link syntax). */
function escUrl(url: string): string {
  return url.replace(/\)/g, '\\)');
}

/**
 * Renders one news item:
 *   **Bold title**
 *   [Source Name](article URL)
 */
function formatItem(title: string, url: string, sourceName: string): string {
  return `*${esc(title)}*\n[${esc(sourceName)}](${escUrl(url)})\n`;
}

// ===================================================
//  News fetchers
// ===================================================

async function fetchGuardian(apiKey: string, count = 5): Promise<string> {
  try {
    const endpoint = new URL('https://content.guardianapis.com/search');
    endpoint.searchParams.set('section', 'technology');
    endpoint.searchParams.set('order-by', 'newest');
    endpoint.searchParams.set('page-size', String(count));
    endpoint.searchParams.set('api-key', apiKey);

    const res = await fetch(endpoint.toString());
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data: GuardianResponse = await res.json();

    let msg = `📰 *${esc('The Guardian — Tech News')}*\n\n`;
    for (const article of data.response.results) {
      msg += formatItem(article.webTitle, article.webUrl, 'The Guardian') + '\n';
    }
    return msg;
  } catch (err) {
    console.error('Guardian fetch error:', err);
    return `❌ ${esc('خطا در دریافت اخبار The Guardian')}\n`;
  }
}

async function fetchHackerNews(count = 5): Promise<string> {
  try {
    const idsRes = await fetch(
      'https://hacker-news.firebaseio.com/v0/topstories.json',
    );
    if (!idsRes.ok) throw new Error(`HTTP ${idsRes.status}`);

    const allIds: number[] = await idsRes.json();
    const ids = allIds.slice(0, count);

    // Fetch all stories in parallel
    const stories = await Promise.all(
      ids.map((id) =>
        fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(
          (r) => r.json() as Promise<HNStory>,
        ),
      ),
    );

    let msg = `🔥 *${esc('Hacker News — Top Stories')}*\n\n`;
    for (const story of stories) {
      if (!story?.title) continue;
      const url =
        story.url ?? `https://news.ycombinator.com/item?id=${story.id}`;
      msg += formatItem(story.title, url, 'Hacker News') + '\n';
    }
    return msg;
  } catch (err) {
    console.error('HN fetch error:', err);
    return `❌ ${esc('خطا در دریافت اخبار Hacker News')}\n`;
  }
}

// ===================================================
//  Telegram sender
// ===================================================

async function sendMessage(
  token: string,
  chatId: number,
  text: string,
): Promise<void> {
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: 'MarkdownV2',
      disable_web_page_preview: true,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error('Telegram API error:', body);
  }
}

// ===================================================
//  Command router
// ===================================================

async function handleCommand(
  command: string,
  chatId: number,
  env: Env,
): Promise<void> {
  switch (command) {
    case '/start':
    case '/help': {
      const help =
        `🤖 *${esc('ربات اخبار تکنولوژی')}*\n\n` +
        `دستورات موجود:\n\n` +
        `/guardian \\- آخرین اخبار از The Guardian\n` +
        `/hackernews \\- داغ\\‌ترین مطالب Hacker News\n` +
        `/all \\- هر دو منبع با هم`;
      await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, help);
      break;
    }

    case '/guardian': {
      const news = await fetchGuardian(env.GUARDIAN_API_KEY);
      await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, news);
      break;
    }

    case '/hackernews': {
      const news = await fetchHackerNews();
      await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, news);
      break;
    }

    case '/all': {
      // Fetch both in parallel, send sequentially
      const [guardian, hn] = await Promise.all([
        fetchGuardian(env.GUARDIAN_API_KEY),
        fetchHackerNews(),
      ]);
      await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, guardian);
      await sendMessage(env.TELEGRAM_BOT_TOKEN, chatId, hn);
      break;
    }

    default: {
      await sendMessage(
        env.TELEGRAM_BOT_TOKEN,
        chatId,
        `❓ دستور ناشناخته\\. برای راهنمایی /help را بزنید\\.`,
      );
    }
  }
}

// ===================================================
//  Worker entry point
// ===================================================

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Health-check for GET requests
    if (request.method !== 'POST') {
      return new Response('🚀 Telegram News Bot is running!', { status: 200 });
    }

    try {
      const update: TelegramUpdate = await request.json();
      const msg = update.message;

      if (!msg?.text) {
        return new Response('OK', { status: 200 });
      }

      const chatId = msg.chat.id;
      // Handle /command@BotUsername format
      const command = msg.text.trim().split(' ')[0].split('@')[0].toLowerCase();

      // Run command handler without blocking the response
      await handleCommand(command, chatId, env);

      return new Response('OK', { status: 200 });
    } catch (err) {
      console.error('Worker error:', err);
      return new Response('Internal Error', { status: 500 });
    }
  },
};