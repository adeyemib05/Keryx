import { supabaseAdmin } from './supabase'
import type { Article } from './types'
import { GatewayClient } from '@circle-fin/x402-batching/client'
import * as fs from 'fs'
import * as path from 'path'

// ---------------------------------------------------------------------------
// Module-level GatewayClient singleton — initialised once, reused per request.
// Only created when BUYER_PRIVATE_KEY is present; otherwise payments degrade
// gracefully to demo_pending.
// ---------------------------------------------------------------------------
let _gatewayClient: GatewayClient | null = null
function getGatewayClient(): GatewayClient | null {
  if (_gatewayClient) return _gatewayClient
  // Try env first; fall back to reading .env.local directly (bypasses Next.js cache)
  let pk = (process.env.BUYER_PRIVATE_KEY || '').trim()
  if (!pk || pk.length < 10) {
    try {
      const envPath = path.join(process.cwd(), '.env.local')
      const envContent = fs.readFileSync(envPath, 'utf8')
      const match = envContent.match(/^BUYER_PRIVATE_KEY=(.*)$/m)
      if (match) pk = match[1].trim()
    } catch { /* ignore */ }
  }
  if (!pk || pk.length < 10) return null
  try {
    _gatewayClient = new GatewayClient({
      chain: 'arcTestnet',
      privateKey: pk as `0x${string}`,
    })
  } catch (e) {
    console.error('[GatewayClient] Failed to initialise:', e)
    return null
  }
  return _gatewayClient
}

async function callGroq(systemPrompt: string, userMessage: string, maxTokens: number = 512): Promise<string> {
  let groqKey = (process.env.GROQ_API_KEY || '').trim();
  if (!groqKey || groqKey.length < 10) {
    try {
      const envPath = path.join(process.cwd(), '.env.local');
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/^GROQ_API_KEY=(.*)$/m);
      if (match) groqKey = match[1].trim();
    } catch (e) {
      console.error('Failed to manually load GROQ_API_KEY from .env.local', e);
    }
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${groqKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Groq API error: ${response.status} — ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export interface AgentCitation {
  article_id: string
  title: string
  url: string
  publisher_name: string
  publisher_slug: string
  amount_paid_usdc: number
  arc_tx_hash: string | null
  fingerprint: string
  reason: string
}

export interface AgentResult {
  answer: string
  reasoning_trace: string[]
  citations: AgentCitation[]
  total_spent_usdc: number
  budget_remaining_usdc: number
  gaps_identified: string[]
  free_draft_produced: boolean
  sources_evaluated: number
  sources_paid: number
  estimated_llm_tokens_used: number
}

// Keep the fetch logic purely for candidate metadata
export async function findRelevantArticles(query: string, limit = 5): Promise<Article[]> {
  const keywords = query.toLowerCase().split(' ').filter(w => w.length > 3)
  
  const { data, error } = await supabaseAdmin
    .from('articles')
    .select('*, publishers(name, slug)')
    .limit(100)
  
  if (error || !data) return []
  
  const scored = data.map(article => ({
    article,
    score: keywords.filter(kw => article.title.toLowerCase().includes(kw)).length
  }))
  .filter(s => s.score > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, limit)
  
  return scored.map(s => s.article)
}

export async function runKeryxAgent(
  question: string,
  budgetUsdc: number = 0.05
): Promise<AgentResult> {
  let budgetRemaining = budgetUsdc
  const reasoningTrace: string[] = []
  const citations: AgentCitation[] = []
  let knowledgeGaps: string[] = []
  let freeDraft = ''
  let gapCoverage: Record<string, string> = {}
  let sourcesEvaluated = 0
  const paidContent: string[] = []
  let estimatedTokensUsed = 0

  let isDemoMode = process.env.DEMO_MODE === 'true'

  // Get candidate articles
  const candidates = await findRelevantArticles(question, 5)
  // Step 2 truncation rule: max 5 candidates
  const topCandidates = candidates.slice(0, 5)
  const candidateMetadata = topCandidates.map(a => `- "${a.title}" (${a.url})`).join('\n')

  // ==========================================
  // STEP 1 — PLAN
  // ==========================================
  if (!isDemoMode) {
    try {
      const sys = `You are a research planning agent. Given a question and a list of available article titles and URLs, identify the specific knowledge gaps that need to be filled to answer the question thoroughly. Return a JSON array of gap descriptions. Be concise. Maximum 4 gaps.\nExample output: ["regulatory landscape unclear", "no data on adoption rates", "missing publisher economics context"]`
      const msg = `Question: ${question}\n\nAvailable Articles:\n${candidateMetadata}`
      
      const rawPlan = await callGroq(sys, msg, 150)
      estimatedTokensUsed += 150
      knowledgeGaps = JSON.parse(rawPlan.replace(/```json|```/g, '').trim())
      if (!Array.isArray(knowledgeGaps)) throw new Error('Not an array')
      reasoningTrace.push(`Identified ${knowledgeGaps.length} knowledge gaps: ${knowledgeGaps.join(', ')}`)
    } catch (err) {
      console.error('STEP 1 GROQ ERROR:', err instanceof Error ? err.message : err);
      isDemoMode = true // Fall back to demo mode for this and subsequent steps
    }
  }

  if (isDemoMode) {
    const words = question.replace(/[^\w\s]/gi, '').toLowerCase().split(/\s+/).filter(w => w.length > 3)
    const topKeywords = words.slice(0, 3)
    knowledgeGaps = topKeywords.map(kw => `need information about ${kw}`)
    if (knowledgeGaps.length === 0) knowledgeGaps = ["need information about topic"]
    reasoningTrace.push(`[DEMO] Extracted keywords: ${knowledgeGaps.join(', ')}`)
  }

  // ==========================================
  // STEP 2 — FREE DRAFT
  // ==========================================
  if (!isDemoMode) {
    try {
      const sys = `You are a research agent writing a first draft. Use only your general knowledge and the article titles provided (you do not have access to the full content yet). Write a draft answer, then for each knowledge gap provided, rate how well the draft currently addresses it: STRONG, PARTIAL, or WEAK. Return JSON: { "draft": "...", "gap_coverage": { "gap description": "STRONG|PARTIAL|WEAK" } }`
      const msg = `Question: ${question}\n\nKnowledge Gaps:\n${JSON.stringify(knowledgeGaps)}\n\nArticle Titles:\n${candidateMetadata}`
      
      const rawDraft = await callGroq(sys, msg, 400)
      estimatedTokensUsed += 400
      const draftData = JSON.parse(rawDraft.replace(/```json|```/g, '').trim() || '{}')
      
      freeDraft = draftData.draft || 'Unable to produce draft'
      gapCoverage = draftData.gap_coverage || {}
      
      const weakGaps = Object.entries(gapCoverage).filter(([_, v]) => v === 'WEAK' || v === 'PARTIAL').map(([k]) => k)
      const strongGaps = Object.entries(gapCoverage).filter(([_, v]) => v === 'STRONG').map(([k]) => k)
      
      let draftLog = "Drafted free answer"
      if (strongGaps.length > 0) draftLog += ` — strong on ${strongGaps.length} gaps`
      if (weakGaps.length > 0) draftLog += `, WEAK on ${weakGaps.length} gaps`
      reasoningTrace.push(draftLog)
    } catch (err) {
      console.error('STEP 2 GROQ ERROR:', err instanceof Error ? err.message : err);
      isDemoMode = true
    }
  }

  if (isDemoMode) {
    freeDraft = `Based on general knowledge: "${question}" is a complex topic involving multiple factors. This draft is based on pre-training knowledge only and would benefit from current, cited sources.`
    gapCoverage = {}
    knowledgeGaps.forEach(gap => {
      gapCoverage[gap] = 'WEAK'
    })
    reasoningTrace.push(`[DEMO] Drafted template free answer. Marked all gaps as WEAK.`)
  }

  // ==========================================
  // STEP 3 — SOURCE SELECTION LOOP
  // ==========================================

  // Pre-flight: check Gateway balance so we know whether real payments can flow
  const gateway = getGatewayClient()
  let gatewayReady = false
  if (!isDemoMode && gateway) {
    try {
      const balances = await gateway.getBalances()
      const available = balances.gateway.available
      console.log(`[Gateway] Balance: ${balances.gateway.formattedAvailable} | Wallet: ${balances.wallet.formatted}`)
      if (available === BigInt(0)) {
        reasoningTrace.push(`[Gateway] Balance is zero — attempting auto-deposit of 1 USDC before payments`)
        try {
          console.log('[Gateway] Attempting deposit. Wallet:', process.env.BUYER_ADDRESS)
          console.log('[Gateway] Wallet ERC-20 balance before deposit:', balances.wallet.formatted)
          const depositResult = await gateway.deposit('1')
          console.log('[Gateway] Deposit result:', JSON.stringify(depositResult))
          const refreshed = await gateway.getBalances()
          console.log('[Gateway] Balance after deposit:', refreshed.gateway.formattedAvailable)
          if (refreshed.gateway.available > BigInt(0)) {
            gatewayReady = true
            reasoningTrace.push(`[Gateway] Deposited 1 USDC — real x402 payments enabled (balance: ${refreshed.gateway.formattedAvailable})`)
          } else {
            reasoningTrace.push(`[Gateway] Deposit confirmed but balance still zero — falling back to demo_pending`)
          }
        } catch (depositErr) {
          const errMsg = depositErr instanceof Error ? depositErr.message : String(depositErr)
          console.error('[Gateway] Deposit FAILED:', errMsg)
          console.error('[Gateway] Full deposit error:', depositErr)
          reasoningTrace.push(`[Gateway] Auto-deposit failed (${errMsg}) — falling back to demo_pending`)
        }
      } else {
        gatewayReady = true
        reasoningTrace.push(`[Gateway] Balance OK (${balances.gateway.formattedAvailable}) — real x402 payments enabled`)
      }
    } catch (balErr) {
      reasoningTrace.push(`[Gateway] Balance check failed (${(balErr as Error).message}) — falling back to demo_pending`)
    }
  }

  if (budgetRemaining <= 0) {
    reasoningTrace.push("Budget exhausted before source evaluation — answer based on general knowledge only")
  } else {
    for (const article of topCandidates) {
      if (sourcesEvaluated >= 3) {
        reasoningTrace.push(`Source limit reached (3 max) — skipping remaining`)
        break
      }

      if (budgetRemaining <= 0) {
        reasoningTrace.push(`Budget exhausted — would have evaluated '${article.title}'`)
        continue
      }
      
      sourcesEvaluated++
      const weakPartialGaps = Object.entries(gapCoverage).filter(([_, v]) => v === 'WEAK' || v === 'PARTIAL').map(([k]) => k)
      
      if (weakPartialGaps.length === 0) {
        reasoningTrace.push(`Skipped '${article.title}' — all gaps are already STRONG`)
        continue
      }
      
      let decision = ''
      let reason = ''
      let reasonLog = ''

      if (!isDemoMode) {
        try {
          const sys = `You are a budget-conscious research agent deciding whether to pay for a source. You will be given: your remaining USDC budget, the cost of this source, your current draft answer, the knowledge gaps that are still WEAK or PARTIAL, and the title + URL of the candidate source. Decide: PAY or SKIP. If the budget is less than the source cost, you must answer SKIP. If the gap this source addresses is already STRONG, answer SKIP. Otherwise weigh the marginal value against the cost. Return JSON: { "decision": "PAY|SKIP", "reasoning": "one sentence explanation" }`
          
          const shortDraft = freeDraft.slice(0, 300)
          const msg = `Remaining Budget: $${budgetRemaining} USDC\nSource Cost: $${article.price_usdc} USDC\nCurrent Draft:\n${shortDraft}\n\nWeak/Partial Gaps:\n${JSON.stringify(weakPartialGaps)}\n\nCandidate Source:\nTitle: ${article.title}\nURL: ${article.url}`
          
          const rawDecision = await callGroq(sys, msg, 100)
          estimatedTokensUsed += 100
          const decisionData = JSON.parse(rawDecision.replace(/```json|```/g, '').trim() || '{}')
          decision = decisionData.decision
          reason = decisionData.reasoning || 'no reason provided'
        } catch (err) {
          isDemoMode = true
        }
      }

      if (isDemoMode) {
        const words = question.replace(/[^\w\s]/gi, '').toLowerCase().split(/\s+/).filter(w => w.length > 3)
        const match = words.find(w => article.title.toLowerCase().includes(w))
        if (match) {
          decision = 'PAY'
          reason = `contains '${match}'`
          reasonLog = `Keyword match: paying for '${article.title}' — contains '${match}'`
        } else {
          decision = 'SKIP'
          reason = 'no keyword match'
          reasonLog = `No keyword match: skipping '${article.title}'`
        }
      }
      
      if (decision === 'PAY' && budgetRemaining >= article.price_usdc) {
        const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000').trim()
        const citeUrl = `${baseUrl}/api/cite/${article.content_fingerprint}`

        let citedContent: any = null
        let arcTxHash: string = 'demo_pending'

        // ---------------------------------------------------------------
        // REAL PATH: GatewayClient.pay() — full EIP-3009 x402 flow
        // ---------------------------------------------------------------
        if (!isDemoMode && gateway && gatewayReady) {
          try {
            console.log('[x402] BUYER_ADDRESS:', process.env.BUYER_ADDRESS);
            console.log('[x402] Base URL:', process.env.NEXT_PUBLIC_BASE_URL);
            console.log('[x402] Full cite URL:', citeUrl);
            console.log('[x402] Attempting real payment for:', citeUrl);

            const payResult = await gateway.pay(citeUrl)
            console.log('[x402] Payment SUCCESS:', JSON.stringify(payResult).slice(0, 200)); // slice to avoid huge logs
            // payResult.data contains the JSON body returned by /api/cite/[fingerprint]
            citedContent = payResult.data as any
            // Prefer arc_tx_hash from the response body, else use payment-response header info
            arcTxHash = (citedContent as any)?.arc_tx_hash
              || (citedContent as any)?.tx_hash
              || `gw_${payResult.formattedAmount}_${Date.now()}`
            reasoningTrace.push(
              `Real x402 payment cleared for '${article.title}' — arc_tx_hash: ${arcTxHash}`
            )
          } catch (payErr) {
            console.error('[x402] Payment FAILED — full error:', payErr);
            console.error('[x402] Error message:', payErr instanceof Error ? payErr.message : String(payErr));
            console.error('[x402] Error stack:', payErr instanceof Error ? payErr.stack : 'no stack');
            
            const msg = (payErr as Error).message || String(payErr)
            reasoningTrace.push(
              `Payment attempted for '${article.title}' — Gateway error: ${msg} — arc_tx_hash: settlement_failed`
            )
            arcTxHash = 'settlement_failed'
            // Fall back to demo mock so the citation still appears
            citedContent = {
              fingerprint: article.content_fingerprint || 'fp_unknown',
              cite_as: `${article.title} — ${article.url}`,
              _isMock: true,
            }
          }
        }

        // ---------------------------------------------------------------
        // DEMO / FALLBACK PATH: mock citation object
        // ---------------------------------------------------------------
        if (!citedContent) {
          try {
            // Try a plain fetch first (works if the server is in dev/permissive mode)
            const resp = await fetch(citeUrl)
            if (resp.ok) {
              citedContent = await resp.json()
              arcTxHash = citedContent?.arc_tx_hash || 'demo_pending'
            } else {
              throw new Error(`HTTP ${resp.status}`)
            }
          } catch {
            citedContent = {
              fingerprint: article.content_fingerprint || 'demo_pending_fp',
              cite_as: `${article.title} — ${article.url}`,
              _isMock: true,
            }
            arcTxHash = 'demo_pending'
            reasoningTrace.push(
              `Payment attempted for '${article.title}' — Gateway settlement pending (demo mode: returning article metadata)`
            )
          }
        }
        
        if (citedContent && citedContent.fingerprint) {
          if (!citedContent._isMock) {
            budgetRemaining -= article.price_usdc
          }

          const shortContent = (citedContent.cite_as || '').slice(0, 500)
          paidContent.push(`Title: ${article.title}\nContent: ${shortContent}`)

          citations.push({
            article_id: article.id,
            title: article.title,
            url: article.url,
            publisher_name: (article as any).publishers?.name || (article as any).publisher_name || 'Unknown',
            publisher_slug: (article as any).publishers?.slug || (article as any).publisher_slug || 'unknown',
            amount_paid_usdc: article.price_usdc,
            arc_tx_hash: arcTxHash,
            fingerprint: article.content_fingerprint,
            reason: reason
          })
          
          if (isDemoMode) {
            reasoningTrace.push(reasonLog)
          } else {
            reasoningTrace.push(`Evaluated '${article.title}' ($${article.price_usdc}, ${Math.round((article.price_usdc / budgetUsdc) * 100)}% of budget) — PAY — ${reason}`)
          }

          if (citedContent._isMock) {
            reasoningTrace.push(`Payment attempted for '${article.title}' — Gateway settlement pending (demo mode: returning article metadata)`)
          }
          
          // Re-evaluate gaps with newly acquired content
          if (!isDemoMode) {
            try {
              const sysUpdate = `You are a research agent. Given the previous weak/partial knowledge gaps and a newly acquired source, determine the new status of each gap. Return JSON: { "gap_coverage": { "gap description": "STRONG|PARTIAL|WEAK" } }`
              const msgUpdate = `Current Gaps:\n${JSON.stringify(weakPartialGaps)}\n\nNew Source Content:\n${shortContent}`
              
              const rawGapUpdate = await callGroq(sysUpdate, msgUpdate, 100)
              estimatedTokensUsed += 100
              const gapUpdateData = JSON.parse(rawGapUpdate.replace(/```json|```/g, '').trim() || '{}')
              gapCoverage = { ...gapCoverage, ...gapUpdateData.gap_coverage }
              reasoningTrace.push(`Paid $${article.price_usdc} — gap coverage updated`)
            } catch {
              isDemoMode = true
            }
          }

          if (isDemoMode) {
            reasoningTrace.push(`[DEMO] Paid $${article.price_usdc} — skipping gap coverage update`)
          }
        } else {
          reasoningTrace.push(`Payment failed for '${article.title}' — skipping`)
        }
      } else {
        if (isDemoMode) {
          reasoningTrace.push(reasonLog)
        } else {
          reasoningTrace.push(`Evaluated '${article.title}' ($${article.price_usdc}) — SKIP — ${reason}`)
        }
      }
    }
  }

  // ==========================================
  // STEP 4 — INTEGRATION
  // ==========================================
  let finalAnswer = freeDraft
  if (!isDemoMode) {
    try {
      const paidContext = paidContent.length > 0 ? paidContent.join('\n\n') : 'No paid sources retrieved.'
      const sys = `You are a research agent writing a final answer. You have a draft answer written from general knowledge, and additional content from paid sources. Rewrite the answer incorporating the paid content where it improves the draft. Cite each paid source inline by title. Be clear and direct. Do not pad the answer.`
      const msg = `Original Question: ${question}\n\nFree Draft:\n${freeDraft}\n\nPaid Content:\n${paidContext}`
      
      const rawIntegration = await callGroq(sys, msg, 500)
      estimatedTokensUsed += 500
      finalAnswer = rawIntegration || freeDraft
      reasoningTrace.push(`Integrated ${citations.length} paid source(s) into final answer`)
    } catch (err) {
      console.error('STEP 4 GROQ ERROR:', err instanceof Error ? err.message : err);
      isDemoMode = true
    }
  }

  if (isDemoMode) {
    if (citations.length > 0) {
      const titles = citations.map(c => `"${c.title}"`).join(' and ')
      finalAnswer = `${freeDraft}\n\nAdditionally, according to ${titles}, this topic involves specific considerations detailed in these cited works.`
    } else {
      finalAnswer = freeDraft
    }
    reasoningTrace.push(`[DEMO] Integrated ${citations.length} paid source(s) into final answer via template`)
  }

  // ==========================================
  // STEP 5 — REFLECTION
  // ==========================================
  if (!isDemoMode) {
    try {
      const sys = `You are a research agent reflecting on your work. Given the question, the final answer, and a log of pay/skip decisions made, write a 2-3 sentence reflection: how confident are you in this answer, what would have made it better, and was the budget used wisely? Be honest and specific.`
      const shortLog = reasoningTrace.join('\n').slice(0, 300)
      const msg = `Question: ${question}\n\nFinal Answer:\n${finalAnswer}\n\nDecision Log:\n${shortLog}`
      
      const reflection = await callGroq(sys, msg, 150)
      estimatedTokensUsed += 150
      reasoningTrace.push(`Reflection: ${reflection}`)
    } catch (err) {
      console.error('STEP 5 GROQ ERROR:', err instanceof Error ? err.message : err);
      isDemoMode = true
    }
  }

  if (isDemoMode) {
    const m = citations.length
    const extra = m > 0 ? 'Paid sources added specific cited context.' : 'No sources matched the query within budget — answer relies on general knowledge.'
    const reflection = `Answer confidence: moderate. Based on ${sourcesEvaluated} sources evaluated, ${m} purchased within budget of $${budgetUsdc}. ${extra}`
    reasoningTrace.push(`Reflection: ${reflection}`)
  }

  return {
    answer: finalAnswer,
    reasoning_trace: reasoningTrace,
    citations,
    total_spent_usdc: budgetUsdc - budgetRemaining,
    budget_remaining_usdc: budgetRemaining,
    gaps_identified: knowledgeGaps,
    free_draft_produced: freeDraft !== "Unable to produce draft" && freeDraft !== '',
    sources_evaluated: sourcesEvaluated,
    sources_paid: citations.length,
    estimated_llm_tokens_used: estimatedTokensUsed
  }
}
