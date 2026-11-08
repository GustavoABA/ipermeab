# Importa as fotografias e montagens entregues com o projeto para a branch de revisão.
# Uso: .\scripts\importar-imagens.ps1 -ZipPath "$env:USERPROFILE\Downloads\impermeabilize_fotos_e_montagens.zip" -Publicar
[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)]
  [ValidateNotNullOrEmpty()]
  [string]$ZipPath,
  [switch]$Publicar
)
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw "Git não encontrado no PATH." }
if (-not (Test-Path -LiteralPath $ZipPath -PathType Leaf)) { throw "Arquivo ZIP não encontrado: $ZipPath" }

$repo = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Push-Location $repo
$temp = Join-Path ([System.IO.Path]::GetTempPath()) ("impermeabilize-" + [guid]::NewGuid().ToString("N"))
try {
  $root = (& git rev-parse --show-toplevel 2>$null)
  if ($LASTEXITCODE -ne 0) { throw "Execute este script dentro do clone Git da Impermeabilize." }
  $branch = (& git branch --show-current).Trim()
  if ($branch -ne "ai-working") {
    throw "A branch atual é '$branch'. Use 'git switch ai-working' antes de importar."
  }
  New-Item -ItemType Directory -Path $temp -Force | Out-Null
  Expand-Archive -LiteralPath (Resolve-Path -LiteralPath $ZipPath).Path -DestinationPath $temp -Force
  $source = Join-Path $temp "assets"
  if (-not (Test-Path -LiteralPath $source -PathType Container)) { throw "O ZIP não contém a pasta assets/." }

  $required = @(
    "empresa/fachada-impermeabilize.webp",
    "montagens/piscinas.webp", "montagens/baldrames.webp", "montagens/lajes.webp",
    "montagens/banheiros.webp", "montagens/capilaridade.webp", "montagens/fundacoes.webp",
    "produtos/sikatop-flex-fibras.webp", "produtos/sikatop-100.webp",
    "produtos/drykoelastic-pro.webp", "produtos/sika-baldrame.webp",
    "produtos/sikashield.webp", "produtos/sikafill-rapido-branco.webp",
    "produtos/mc-proof-multi.webp", "produtos/mc-proof-900-el.webp",
    "produtos/sika-1.webp", "produtos/mc-hydro-1.webp",
    "produtos/vedacit-aditivo.webp", "produtos/drykocril-d9.webp"
  )
  foreach ($relative in $required) {
    $relativeNative = $relative.Replace("/", [System.IO.Path]::DirectorySeparatorChar)
    if (-not (Test-Path -LiteralPath (Join-Path $source $relativeNative) -PathType Leaf)) {
      throw "Arquivo obrigatório ausente no ZIP: $relative"
    }
  }

  foreach ($relative in $required) {
    $native = $relative.Replace("/", [System.IO.Path]::DirectorySeparatorChar)
    $destination = Join-Path (Join-Path $repo "assets") $native
    New-Item -ItemType Directory -Path (Split-Path -Path $destination -Parent) -Force | Out-Null
    Copy-Item -LiteralPath (Join-Path $source $native) -Destination $destination -Force
  }
  & git add -- assets/empresa/ assets/montagens/ assets/produtos/
  if ($LASTEXITCODE -ne 0) { throw "Falha ao adicionar imagens ao Git." }

  & git diff --cached --quiet -- assets/
  if ($LASTEXITCODE -eq 1) {
    & git commit -m "assets: adicionar fotos reais e montagens da Impermeabilize" -- assets/
    if ($LASTEXITCODE -ne 0) { throw "Falha ao criar commit das imagens." }
  } elseif ($LASTEXITCODE -ne 0) {
    throw "Falha ao verificar alterações no Git."
  } else {
    Write-Host "Imagens já estão atualizadas no repositório local."
  }

  if ($Publicar) {
    & git push origin ai-working
    if ($LASTEXITCODE -ne 0) { throw "Falha ao enviar alterações ao GitHub." }
    Write-Host "Imagens publicadas na branch ai-working. Revise o PR #1."
  } else {
    Write-Host "Imagens importadas localmente. Para enviar: git push origin ai-working"
  }
} finally {
  Pop-Location
  if (Test-Path -LiteralPath $temp) { Remove-Item -LiteralPath $temp -Recurse -Force }
}
