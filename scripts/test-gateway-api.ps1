# test-gateway-api.ps1
# Directly calls the Circle Gateway API to check balance and attempt deposit
# for the buyer EOA using raw HTTP — no Node.js needed.

# Read private key and address from .env.local
$envContent = Get-Content ".env.local" -Raw
$pkMatch = [regex]::Match($envContent, '(?m)^BUYER_PRIVATE_KEY=(.*)$')
$addrMatch = [regex]::Match($envContent, '(?m)^BUYER_ADDRESS=(.*)$')
$BUYER_ADDR = $addrMatch.Groups[1].Value.Trim()
Write-Host "Buyer address: $BUYER_ADDR"

# Check Gateway balance via API
$GATEWAY_API = "https://gateway-api-testnet.circle.com"
Write-Host ""
Write-Host "=== Checking Gateway balance ==="
try {
    $balResult = Invoke-WebRequest -Uri "$GATEWAY_API/v2/gateway-wallets/$BUYER_ADDR/balances" `
        -Method GET `
        -TimeoutSec 15
    Write-Host "Status: $($balResult.StatusCode)"
    Write-Host "Balance response: $($balResult.Content)"
} catch {
    Write-Host "Balance check failed: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        Write-Host "Error body: $($reader.ReadToEnd())"
    }
}

# Check raw on-chain USDC balance via Arc Testnet RPC
Write-Host ""
Write-Host "=== Checking on-chain ERC-20 USDC balance ==="
# USDC contract on Arc Testnet: 0x3600000000000000000000000000000000000000
# balanceOf(address) = 0x70a08231 + padded address
$paddedAddr = $BUYER_ADDR.Replace("0x","").ToLower().PadLeft(64, '0')
$callData = "0x70a08231$paddedAddr"
$rpcBody = "{`"jsonrpc`":`"2.0`",`"method`":`"eth_call`",`"params`":[{`"to`":`"0x3600000000000000000000000000000000000000`",`"data`":`"$callData`"},`"latest`"],`"id`":1}"
try {
    $rpcResult = Invoke-WebRequest -Uri "https://rpc.testnet.arc.network" `
        -Method POST `
        -ContentType "application/json" `
        -Body $rpcBody `
        -TimeoutSec 10
    $rpcJson = $rpcResult.Content | ConvertFrom-Json
    $hexBalance = $rpcJson.result
    Write-Host "Raw hex balance: $hexBalance"
    if ($hexBalance -and $hexBalance -ne "0x0") {
        $decBalance = [Convert]::ToInt64($hexBalance, 16)
        $usdcBalance = $decBalance / 1000000
        Write-Host "USDC balance (ERC-20, 6 decimals): $usdcBalance USDC"
    } else {
        Write-Host "USDC balance: 0"
    }
} catch {
    Write-Host "RPC call failed: $($_.Exception.Message)"
}

# Check native balance
Write-Host ""
Write-Host "=== Checking native gas balance ==="
$nativeBody = "{`"jsonrpc`":`"2.0`",`"method`":`"eth_getBalance`",`"params`":[`"$BUYER_ADDR`",`"latest`"],`"id`":2}"
try {
    $nativeResult = Invoke-WebRequest -Uri "https://rpc.testnet.arc.network" `
        -Method POST `
        -ContentType "application/json" `
        -Body $nativeBody `
        -TimeoutSec 10
    $nativeJson = $nativeResult.Content | ConvertFrom-Json
    $hexNative = $nativeJson.result
    Write-Host "Raw native hex: $hexNative"
    if ($hexNative -and $hexNative -ne "0x0") {
        $decNative = [bigint]::Parse($hexNative.Replace("0x",""), [System.Globalization.NumberStyles]::HexNumber)
        $nativeEth = [double]$decNative / 1e18
        Write-Host "Native balance (for gas): $nativeEth"
    } else {
        Write-Host "Native balance: 0  <--- THIS IS THE PROBLEM (no gas!)"
    }
} catch {
    Write-Host "Native balance check failed: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "=== Summary ==="
Write-Host "If USDC > 0 but native = 0: need gas tokens. Get from faucet:"
Write-Host "https://faucet.testnet.arc.network"
Write-Host "Send native USDC to: $BUYER_ADDR"
