function readMetaTag(html: string, key: string, isProperty = false): string | null {
  const attr = isProperty ? 'property' : 'name';
  const rx = new RegExp(`<meta[^>]+${attr}=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>`, 'i');
  const match = html.match(rx);
  return match?.[1]?.trim() ?? null;
}

function readTitle(html: string): string | null {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match?.[1]?.replace(/\s+/g, ' ').trim() ?? null;
}

export async function extractMetadata(url: string) {
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'ReadLaterBot/1.0 (+https://localhost)'
      }
    });

    if (!res.ok) {
      return {
        title: url,
        description: null,
        author: null,
        siteName: null,
        content: null
      };
    }

    const html = await res.text();
    const title = readMetaTag(html, 'og:title', true) ?? readTitle(html) ?? url;
    const description = readMetaTag(html, 'description') ?? readMetaTag(html, 'og:description', true);
    const author = readMetaTag(html, 'author');
    const siteName = readMetaTag(html, 'og:site_name', true);

    const bodyText = html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 20000);

    return {
      title,
      description,
      author,
      siteName,
      content: bodyText
    };
  } catch {
    return {
      title: url,
      description: null,
      author: null,
      siteName: null,
      content: null
    };
  }
}
