param([int]$Port = 8871)

$ErrorActionPreference = 'Stop'
$bundled = Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe'
$python = if (Test-Path -LiteralPath $bundled) { $bundled } else { (Get-Command python -ErrorAction SilentlyContinue).Source }
if (!$python) {
    Write-Output "Open $PSScriptRoot/index.html directly in your browser."
    exit 0
}
for ($candidate = $Port; $candidate -lt $Port + 20; $candidate++) {
    if (Get-NetTCPConnection -LocalPort $candidate -State Listen -ErrorAction SilentlyContinue) { continue }
    Write-Output "http://127.0.0.1:${candidate}/index.html?lang=es"
    Write-Output 'Local review only. Press Ctrl+C to stop.'
    & $python -m http.server $candidate --bind 127.0.0.1 --directory $PSScriptRoot
    exit $LASTEXITCODE
}
throw 'No free local preview port was found.'
