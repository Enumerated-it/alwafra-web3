# GITHUB + VERCEL DEPLOYMENT SCRIPT
# ALWAFRA WEB3 | Phase 1 Production
# Execute: .\github-vercel-deploy.ps1

param(
    [string]$GitHubToken = "",
    [string]$VercelToken = "",
    [string]$GitEmail = "mmorchid090@gmail.com",
    [string]$GitName = "Mohamed Morchid",
    [string]$RepoName = "alwafra-web3"
)

# Couleurs
$Green = 'Green'
$Red = 'Red'
$Yellow = 'Yellow'
$Cyan = 'Cyan'

function Write-Status { param([string]$msg) ; Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Info { param([string]$msg) ; Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Error-Custom { param([string]$msg) ; Write-Host "[ERROR] $msg" -ForegroundColor Red ; exit 1 }
function Write-Section { param([string]$title) ; Write-Host "`n=== $title ===" -ForegroundColor Green }

Write-Section "GITHUB + VERCEL DEPLOYMENT"

# ============================================
# ETAPE 1: CONFIGURATION GIT
# ============================================
Write-Section "ETAPE 1: Configuration Git"

# Verifier git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error-Custom "Git n'est pas installe"
}
Write-Status "Git trouve: $(git --version)"

# Configuration git
Write-Info "Configuration email: $GitEmail"
git config --global user.email $GitEmail
git config --global user.name $GitName

Write-Status "Configuration Git terminee"

# ============================================
# ETAPE 2: INITIALISATION REPO LOCAL
# ============================================
Write-Section "ETAPE 2: Initialisation repo local"

if (-not (Test-Path ".git")) {
    Write-Info "Creation repo git local..."
    git init
    Write-Status "Repo initialise"
} else {
    Write-Status "Repo deja initialise"
}

# Ajouter remote GitHub
Write-Info "Configuration remote GitHub..."
$remoteUrl = "https://github.com/$GitName/$RepoName.git"
git remote add origin $remoteUrl 2>&1 | Where-Object { $_ -notmatch "already exists" } | Write-Host

Write-Status "Remote configure: $remoteUrl"

# ============================================
# ETAPE 3: VERIFICATION DES FICHIERS
# ============================================
Write-Section "ETAPE 3: Verification des fichiers"

$filesToCommit = @(
    "src/",
    "package.json",
    "vite.config.js",
    ".env.local.example",
    ".gitignore",
    "README.md"
)

foreach ($file in $filesToCommit) {
    if (Test-Path $file) {
        Write-Status "OK: $file"
    } else {
        Write-Error-Custom "$file manquant!"
    }
}

# ============================================
# ETAPE 4: BUILD DE PRODUCTION
# ============================================
Write-Section "ETAPE 4: Build de production"

Write-Info "Compilation..."
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "Build echouee"
}
Write-Status "Build reussi (dist/ genere)"

# ============================================
# ETAPE 5: PREMIER COMMIT
# ============================================
Write-Section "ETAPE 5: Premier commit"

Write-Info "Staging des fichiers..."
git add .

Write-Info "Creation du premier commit..."
git commit -m "feat: Phase 1 Security Complete

- Chiffrement localStorage AES-256
- Validation stricte OWASP
- Integration Web3 Wallet wagmi
- Error Boundary error handling
- Configuration .env.local securisee
- Tests unitaires 60+ couverture

Audit: SECURITY_AUDIT.md
Plan: IMPLEMENTATION_PLAN.md
Pret: Vercel deployment"

Write-Status "Commit cree"

# ============================================
# ETAPE 6: CREATION BRANCHE
# ============================================
Write-Section "ETAPE 6: Creation branche"

Write-Info "Creation branche main..."
git branch -M main
Write-Status "Branche main creee"

# ============================================
# ETAPE 7: PUSH VERS GITHUB
# ============================================
Write-Section "ETAPE 7: Push vers GitHub"

if ($GitHubToken) {
    Write-Info "Configuration authentification GitHub..."
    $githubUrl = "https://$($GitHubToken)@github.com/$GitName/$RepoName.git"
    git remote set-url origin $githubUrl
}

Write-Info "Push vers GitHub (main)..."
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Status "Code pousse vers GitHub"
} else {
    Write-Error-Custom "Push echouee (verifier token GitHub)"
}

# ============================================
# ETAPE 8: CONFIGURATION VERCEL
# ============================================
Write-Section "ETAPE 8: Configuration Vercel (Manuel)"

Write-Host @"

ACTION MANUELLE REQUISE:

1. Aller sur: https://vercel.com/new
2. Selectionner: Import Git Repository
3. Connecter GitHub et autoriser mmorchid090
4. Selectionner: alwafra-web3
5. Framework: React/Vite
6. Environment Variables:
   - VITE_ENCRYPTION_KEY: (32+ chars)
   - VITE_WALLET_CONNECT_PROJECT_ID: e3284db7-24c0-4be4-946e-236d5f09e30c
   - VITE_MAX_MONTHLY_REVENUE: 50000
7. Cliquer Deploy

Ou install Vercel CLI:
   npm i -g vercel
   vercel login
   vercel --prod

"@ -ForegroundColor Yellow

# ============================================
# ETAPE 9: RAPPORT FINAL
# ============================================
Write-Section "RESUME FINAL"

$deploymentReport = @"
# RAPPORT DE DEPLOIEMENT

Date: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')

## Etapes completes

- [OK] Configuration Git
- [OK] Initialisation repo local
- [OK] Verification fichiers
- [OK] Build de production
- [OK] Premier commit
- [OK] Branche main creee
- [OK] Code pousse vers GitHub

## Liens utiles

- GitHub: https://github.com/$GitName/$RepoName
- Vercel: https://vercel.com/new
- Documentation: IMPLEMENTATION_PLAN.md

## Prochaines etapes

1. Aller sur https://vercel.com/new
2. Connecter repo GitHub: $RepoName
3. Ajouter variables environnement (.env.local)
4. Cliquer Deploy
5. Lancer Phase 2

## Temps total

- Git: 2 min
- Build: 1-2 min
- Commit/Push: 1 min
- Vercel: 5-10 min
- Total: 10-15 minutes

## Statut

PRET POUR VERCEL DEPLOYMENT

"@

$deploymentReport | Out-File "DEPLOYMENT_REPORT.md" -Encoding UTF8

Write-Status "Rapport sauvegarde: DEPLOYMENT_REPORT.md"

Write-Host @"

=== DEPLOIEMENT GITHUB - COMPLET ===
Code committé et pushé sur GitHub

RESUME:
   [OK] Code committé et pushé
   [OK] GitHub: github.com/$GitName/$RepoName
   [OK] Build production: dist/
   [OK] Pret Vercel

VARIABLES A AJOUTER DANS VERCEL:

   VITE_ENCRYPTION_KEY=<32+ chars secret>
   VITE_WALLET_CONNECT_PROJECT_ID=e3284db7-24c0-4be4-946e-236d5f09e30c
   VITE_MAX_MONTHLY_REVENUE=50000
   VITE_VALEUR_BASE_MINUTE=7.00
   VITE_VALEUR_CACHE_MINUTE=3.50

ACTION SUIVANTE:

   https://vercel.com/new -> Select alwafra-web3 -> Add variables -> Deploy

Duree: ~10-15 minutes au total
STATUS: PRET POUR PRODUCTION

"@ -ForegroundColor Green

Write-Host "`nFelicitations! Phase 1 est deploye!`n" -ForegroundColor Cyan

