# PHASE 1 SECURITE - SCRIPT D'AUTOMATISATION COMPLETE
# ALWAFRA WEB3 - Installation et deploiement instantanes
# Executer : .\phase1-setup.ps1

param(
    [switch]$SkipTests = $false,
    [switch]$SkipBuild = $false,
    [switch]$DeployVercel = $false
)

# Couleurs
$Green = 'Green'
$Red = 'Red'
$Yellow = 'Yellow'
$Cyan = 'Cyan'

function Write-Status {
    param([string]$message, [string]$color = $Green)
    Write-Host "[OK] $message" -ForegroundColor $color
}

function Write-Error-Status {
    param([string]$message)
    Write-Host "[ERROR] $message" -ForegroundColor $Red
    exit 1
}

function Write-Info {
    param([string]$message)
    Write-Host "[INFO] $message" -ForegroundColor $Cyan
}

Write-Host ""
Write-Host "Phase 1 SECURITE - SETUP" -ForegroundColor Green
Write-Host ""

# 1. VERIFICATIONS PRELIMINAIRES
Write-Info "ETAPE 1 : Verifications preliminaires..."

# Verifier Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error-Status "Node.js n'est pas installe. Telecharger depuis nodejs.org"
}
$nodeVersion = (node -v)
Write-Status "Node.js trouve: $nodeVersion"

# Verifier npm
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Error-Status "npm n'est pas installe"
}
$npmVersion = (npm -v)
Write-Status "npm trouve: $npmVersion"

# Verifier repertoire projet
if (-not (Test-Path "package.json")) {
    Write-Error-Status "package.json non trouve. Etre dans le repertoire du projet!"
}
Write-Status "Repertoire projet trouve"

# 2. INSTALLATION DEPENDANCES
Write-Info ""
Write-Info "ETAPE 2 : Installation des dependances..."

$deps = @(
    "crypto-js",
    "wagmi@1.3.8",
    "viem@1.19.0",
    "@rainbow-me/rainbowkit@1.1.3"
)

$devDeps = @(
    "@testing-library/react",
    "@testing-library/jest-dom"
)

foreach ($dep in $deps) {
    Write-Info "Installation: $dep"
    npm install $dep
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Status "Installation echouee: $dep"
    }
}

Write-Status "Dependances installees"

# Dev dependencies
foreach ($dep in $devDeps) {
    Write-Info "Installation dev: $dep"
    npm install --save-dev $dep
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Status "Installation dev echouee: $dep"
    }
}

Write-Status "Dependances de developpement installees"

# 3. VERIFICATION FICHIERS CREES
Write-Info ""
Write-Info "ETAPE 3 : Verification des fichiers Phase 1..."

$requiredFiles = @(
    "src/utils/encryption.js",
    "src/utils/validation.js",
    "src/hooks/useWeb3Wallet.js",
    "src/components/ErrorBoundary.jsx"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Status "OK: $file"
    } else {
        Write-Error-Status "$file manquant!"
    }
}

# 4. CONFIGURATION .ENV.LOCAL
Write-Info ""
Write-Info "ETAPE 4 : Configuration environnement..."

if (-not (Test-Path ".env.local")) {
    if (Test-Path ".env.local.example") {
        Copy-Item ".env.local.example" ".env.local"
        Write-Status ".env.local cree depuis exemple"
    } else {
        Write-Error-Status ".env.local.example non trouve"
    }
} else {
    Write-Status ".env.local existe deja"
}

# 5. BUILD DE COMPILATION
if (-not $SkipBuild) {
    Write-Info ""
    Write-Info "ETAPE 5 : Compilation build..."
    
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Status "Build echouee!"
    }
    Write-Status "Build reussi"
}
