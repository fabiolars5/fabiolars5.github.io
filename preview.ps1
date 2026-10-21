param([int]$Port = 8765)

$ErrorActionPreference = 'Stop'
$python = Get-Command python -ErrorAction SilentlyContinue
if (-not $python) {
    Write-Output "Open $PSScriptRoot\index.html directly in your browser."
    exit 0
}
for ($candidate = $Port; $candidate -lt $Port + 20; $candidate++) {
    $url = "http://127.0.0.1:$candidate/index.html"
    try {
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2
        if ($response.Content -match 'data-project-tabs') {
            Write-Output "$url#projects"
            exit 0
        }
        continue
    } catch {
        if (Get-NetTCPConnection -LocalPort $candidate -State Listen -ErrorAction SilentlyContinue) { continue }
    }
    Start-Process -FilePath $python.Source -ArgumentList @('-m', 'http.server', "$candidate", '--bind', '127.0.0.1') -WorkingDirectory $PSScriptRoot -WindowStyle Hidden
    for ($attempt = 0; $attempt -lt 10; $attempt++) {
        Start-Sleep -Milliseconds 350
        try {
            $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2
            if ($response.StatusCode -eq 200) {
                Write-Output "$url#projects"
                exit 0
            }
        } catch { }
    }
    throw 'Unable to start the local preview server.'
}
throw 'No free local preview port was found.'
