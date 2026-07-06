import fetch from 'node-fetch';

const publishers = [
  {
    name: "TechCrunch",
    slug: "techcrunch",
    rss_url: "https://techcrunch.com/feed/",
    email: "seed@techcrunch.com",
    wallet_address: "0x805f25445febeda4f8a42a6b92c966e0767dc3f2"
  },
  {
    name: "The Verge",
    slug: "the-verge",
    rss_url: "https://www.theverge.com/rss/index.xml",
    email: "seed@theverge.com",
    wallet_address: "0x805f25445febeda4f8a42a6b92c966e0767dc3f2"
  },
  {
    name: "Decrypt",
    slug: "decrypt",
    rss_url: "https://decrypt.co/feed",
    email: "seed@decrypt.com",
    wallet_address: "0x805f25445febeda4f8a42a6b92c966e0767dc3f2"
  },
  {
    name: "Wired",
    slug: "wired",
    rss_url: "https://www.wired.com/feed/rss",
    email: "seed@wired.com",
    wallet_address: "0x805f25445febeda4f8a42a6b92c966e0767dc3f2"
  },
  {
    name: "MIT Tech Review",
    slug: "mit-tech-review",
    rss_url: "https://www.technologyreview.com/feed/",
    email: "seed@technologyreview.com",
    wallet_address: "0x805f25445febeda4f8a42a6b92c966e0767dc3f2"
  },
  {
    name: "CoinDesk",
    slug: "coindesk",
    rss_url: "https://www.coindesk.com/arc/outboundfeeds/rss/",
    email: "seed@coindesk.com",
    wallet_address: "0x805f25445febeda4f8a42a6b92c966e0767dc3f2"
  },
  {
    name: "Rest of World",
    slug: "rest-of-world",
    rss_url: "https://restofworld.org/feed/",
    email: "seed@restofworld.com",
    wallet_address: "0x805f25445febeda4f8a42a6b92c966e0767dc3f2"
  },
  {
    name: "African Business",
    slug: "african-business",
    rss_url: "https://african.business/feed",
    email: "seed@africanbusiness.com",
    wallet_address: "0x805f25445febeda4f8a42a6b92c966e0767dc3f2"
  },
  {
    name: "NYT Technology",
    slug: "nyt-tech",
    rss_url: "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml",
    email: "seed@nytimes.com",
    wallet_address: "0x805f25445febeda4f8a42a6b92c966e0767dc3f2"
  },
  {
    name: "Ars Technica",
    slug: "ars-technica",
    rss_url: "https://feeds.arstechnica.com/arstechnica/index",
    email: "seed@arstechnica.com",
    wallet_address: "0x805f25445febeda4f8a42a6b92c966e0767dc3f2"
  },
  {
    name: "Engadget",
    slug: "engadget",
    rss_url: "https://www.engadget.com/rss.xml",
    email: "seed@engadget.com",
    wallet_address: "0x805f25445febeda4f8a42a6b92c966e0767dc3f2"
  }
];

const BASE_URL = 'http://localhost:3000';

async function seed() {
  console.log('Starting publisher seeding process...');
  let totalArticles = 0;
  
  for (const pub of publishers) {
    try {
      console.log(`\nRegistering ${pub.name}...`);
      const response = await fetch(`${BASE_URL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pub),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Failed to register ${pub.name}: ${response.status} - ${errorText}`);
        continue;
      }

      const data: any = await response.json();
      
      if (data.articles_ingested !== undefined) {
        console.log(`✅ Success: ${pub.name} registered. Ingested ${data.articles_ingested} articles.`);
        totalArticles += data.articles_ingested;
      } else {
        console.log(`✅ Success: ${pub.name} registered (response didn't specify article count)`);
        console.log('Response:', data);
      }
      
    } catch (err: any) {
      console.error(`❌ Network error while registering ${pub.name}:`, err.message);
    }
    
    // Slight delay to be kind to the backend and avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n🎉 Seeding complete! Total estimated new articles ingested: ${totalArticles}`);
}

seed().catch(console.error);
