$body = '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
$result = Invoke-WebRequest -Uri "https://rpc.testnet.arc.network" -Method POST -ContentType "application/json" -Body $body -TimeoutSec 10
Write-Host "Status: $($result.StatusCode)"
Write-Host "Content: $($result.Content)"
