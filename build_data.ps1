# 1. Configuration
$password = 'hw2nQV69@uXb8aV@66S@4d&3*5!%MNdLPMd^fWiqJ9g#u52cgEEH2AY9%u*36zucSxt3msBSkt7Zw3oi!x7i@acJDcHNuB*zM$H*$4u7JaWi%7K4DiwD8$Yxa5DmDj6z'
$dataFile = "js\data.js"
$backupDir = "LinkedinData\backups"

# 2. Encryption Helper (AES-256-CBC, Pkcs7) - CryptoJS Compatible
function Protect-Data ($jsonString, $pass) {
    if (-not $jsonString -or $jsonString -eq "[]" -or $jsonString -eq "") {
        return "{ iv: '', ct: '' }"
    }

    # Generate Key from Password (SHA256)
    $sha256 = [System.Security.Cryptography.SHA256]::Create()
    $keyBytes = $sha256.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($pass))

    $aes = [System.Security.Cryptography.Aes]::Create()
    $aes.KeySize = 256
    $aes.BlockSize = 128
    $aes.Mode = [System.Security.Cryptography.CipherMode]::CBC
    $aes.Padding = [System.Security.Cryptography.PaddingMode]::PKCS7
    $aes.Key = $keyBytes
    $aes.GenerateIV()
    
    $encryptor = $aes.CreateEncryptor()
    $plainBytes = [System.Text.Encoding]::UTF8.GetBytes($jsonString)
    $encryptedBytes = $encryptor.TransformFinalBlock($plainBytes, 0, $plainBytes.Length)
    
    $ivStr = [Convert]::ToBase64String($aes.IV)
    $ctStr = [Convert]::ToBase64String($encryptedBytes)
    
    return "{ iv: '$ivStr', ct: '$ctStr' }"
}

# 3. Extract and Encrypt Data
$skills = Get-Content Skills.csv -ErrorAction SilentlyContinue -Raw | ConvertFrom-Csv | ConvertTo-Json -Compress
$positions = Get-Content Positions.csv -ErrorAction SilentlyContinue -Raw | ConvertFrom-Csv | ConvertTo-Json -Compress
$projects = Get-Content Projects.csv -ErrorAction SilentlyContinue -Raw | ConvertFrom-Csv | ConvertTo-Json -Compress
$certs = Get-Content Certifications.csv -ErrorAction SilentlyContinue -Raw | ConvertFrom-Csv | ConvertTo-Json -Compress

$recsText = Get-Content Recommendations_Received.csv -ErrorAction SilentlyContinue -Raw
if ($recsText) { $recs = $recsText | ConvertFrom-Csv | ConvertTo-Json -Compress } else { $recs = "[]" }

$eduText = Get-Content Education.csv -ErrorAction SilentlyContinue -Raw
if ($eduText) { $edu = $eduText | ConvertFrom-Csv | ConvertTo-Json -Compress } else { $edu = "[]" }

$skillsEnc = Protect-Data $skills $password
$positionsEnc = Protect-Data $positions $password
$projectsEnc = Protect-Data $projects $password
$certsEnc = Protect-Data $certs $password
$recsEnc = Protect-Data $recs $password
$eduEnc = Protect-Data $edu $password

# 4. Generate JS Content
$jsContent = @"
const skillsDataEnc = $skillsEnc;
const positionsDataEnc = $positionsEnc;
const projectsDataEnc = $projectsEnc;
const certsDataEnc = $certsEnc;
const recsDataEnc = $recsEnc;
const eduDataEnc = $eduEnc;
"@

# 5. Backup and Write
if (-not (Test-Path $backupDir)) { New-Item -ItemType Directory $backupDir }
if (Test-Path $dataFile) {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    Copy-Item $dataFile "$backupDir\data_$timestamp.js"
    
    # Keep only 3 latest backups
    Get-ChildItem "$backupDir\data_*.js" | Sort-Object CreationTime -Descending | Select-Object -Skip 3 | Remove-Item
}

$jsContent | Out-File $dataFile -Encoding utf8
Write-Host "Successfully encrypted data and rotated backups for $dataFile."
