import Parser from 'rss-parser';
import { createHash } from 'crypto';

export function computeFingerprint(title: string, url: string): string {
  return createHash('sha256')
    .update(title.trim().toLowerCase() + '|' + url.trim().toLowerCase())
    .digest('hex');
}

export async function ingestRSS(rssUrl: string): Promise<Array<{title: string, url: string, fingerprint: string}>> {
  const parser = new Parser({
    timeout: 10000,
  });
  
  let feed;
  try {
    feed = await parser.parseURL(rssUrl);
  } catch (error) {
    throw new Error(`Failed to fetch RSS feed: ${(error as Error).message}`);
  }

  if (!feed.items || feed.items.length === 0) {
    throw new Error('RSS feed returned 0 items.');
  }

  const items = feed.items.slice(0, 50).map(item => {
    const title = item.title || 'Untitled';
    const url = item.link || item.guid || '';
    if (!url) throw new Error('RSS item missing link/guid');
    
    return {
      title,
      url,
      fingerprint: computeFingerprint(title, url)
    };
  });

  return items;
}
