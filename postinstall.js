// postinstall.js — applies patches that must survive npm install
// Run automatically via "postinstall" script in package.json

const fs = require('fs')
const path = require('path')

function patchFile(filePath, oldStr, newStr, description) {
  const full = path.join(__dirname, 'node_modules', filePath)
  if (!fs.existsSync(full)) {
    console.log(`[patch] SKIP (not found): ${filePath}`)
    return
  }
  let content = fs.readFileSync(full, 'utf8')
  if (content.includes(newStr)) {
    console.log(`[patch] Already applied: ${description}`)
    return
  }
  if (!content.includes(oldStr)) {
    console.log(`[patch] WARN target not found: ${description}`)
    return
  }
  fs.writeFileSync(full, content.replace(oldStr, newStr), 'utf8')
  console.log(`[patch] Applied: ${description}`)
}

// Fix 1: Circle Gateway minValiditySeconds is 604800 (7 days).
// The default maxTimeoutSeconds of 345600 (4 days) causes "authorization_validity_too_short".
// Bumped to 691200 (8 days) to satisfy the requirement with buffer.
patchFile(
  '@circle-fin/x402-batching/dist/server/index.mjs',
  'maxTimeoutSeconds: 345600,\n      // 4 days (same as digital-dungeon)',
  'maxTimeoutSeconds: 691200,\n      // 8 days — Circle minValiditySeconds is 604800 (7 days)',
  'x402-batching: maxTimeoutSeconds 4d -> 8d (satisfies Circle minValiditySeconds)'
)

console.log('[patch] All patches applied.')
