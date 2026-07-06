$target = "0xde31a25CE2420313D95E8fec237E6a3F9f11970e"
$domain = 7
$GATEWAY_API = "https://gateway-api-testnet.circle.com"

$body = @{
    token = "USDC"
    sources = @(
        @{ depositor = $target; domain = $domain }
    )
} | ConvertTo-Json -Depth 5

Write-Host "POST $GATEWAY_API/balances"
Write-Host "Body: $body"
try {
    $balResult = Invoke-WebRequest -Uri "$GATEWAY_API/balances" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body `
        -TimeoutSec 15
    Write-Host "Status: $($balResult.StatusCode)"
    Write-Host "Response: $($balResult.Content)"
} catch {
    Write-Host "Fetch failed: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        Write-Host "Error body: $($reader.ReadToEnd())"
    }
}
