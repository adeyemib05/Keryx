export interface Publisher {
  id: string
  created_at: string
  name: string
  email: string
  wallet_address: string
  rss_url: string | null
  website_url: string | null
  slug: string
  total_earned_usdc: number
  citation_count: number
}

export interface Article {
  id: string
  created_at: string
  publisher_id: string
  title: string
  url: string
  content_fingerprint: string
  price_usdc: number
  citation_count: number
  total_earned_usdc: number
}

export interface CitationPayment {
  id: string
  created_at: string
  article_id: string
  publisher_id: string
  payer_address: string
  amount_usdc: number
  arc_tx_hash: string | null
  query_context: string | null
}

// For API responses
export interface CitationPaymentWithArticle extends CitationPayment {
  articles: Pick<Article, 'title' | 'url'>
  publishers: Pick<Publisher, 'name' | 'slug'>
}
