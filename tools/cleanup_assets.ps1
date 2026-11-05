[CmdletBinding()]
param([string]$GameRoot = (Split-Path -Parent $PSScriptRoot), [switch]$CheckOnly)
Set-StrictMode -Version 2.0
$ErrorActionPreference = 'Stop'
try {
    $root = [IO.Path]::GetFullPath($GameRoot).TrimEnd([IO.Path]::DirectorySeparatorChar)
    if (!(Test-Path -LiteralPath (Join-Path $root 'index.html') -PathType Leaf)) { throw 'Game entry is missing; no files were moved.' }
    $manifestPath = Join-Path $root 'tools/runtime-files.json'
    if (!(Test-Path -LiteralPath $manifestPath -PathType Leaf)) { throw 'Update manifest is missing; extract all update files before cleanup.' }
    $manifest = [IO.File]::ReadAllText($manifestPath, [Text.Encoding]::UTF8) | ConvertFrom-Json
    $entries = @($manifest.files)
    if (($entries.Count -lt 1) -or (@($entries | Where-Object { $_.path -eq 'index.html' }).Count -ne 1)) { throw 'Invalid update manifest.' }
    $files = @()
    foreach ($entry in $entries) {
        $relative = [string]$entry.path
        $path = [IO.Path]::GetFullPath((Join-Path $root $relative))
        if (!$path.StartsWith($root + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { throw 'Invalid manifest path.' }
        if (!(Test-Path -LiteralPath $path -PathType Leaf)) { throw ('Update file is missing: ' + $relative) }
        if ((Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash -ine $entry.sha256) { throw ('Update file differs: ' + $relative + '. Extract the complete update first.') }
        $file = Get-Item -LiteralPath $path
        if ($file.Extension -in @('.html', '.js', '.css')) { $files += $file }
    }
    # Read complete files: minified lines may exceed FINDSTR's limits.
    $source = [string]::Join("`n", @(foreach ($file in $files) { [IO.File]::ReadAllText($file.FullName, [Text.Encoding]::UTF8) }))
    $targets = @(
        'assets/application_paper.png', 'assets/classroom_chair.png', 'assets/corridor_reflection.png',
        'assets/corridor_closed.png', 'assets/corridor_back.png', 'assets/courtyard_memory.png',
        'assets/stairs_2.png', 'assets/stairs_3.png', 'assets/stairs_4.png',
        'assets/face_dark.jpg', 'assets/silhouette_tree.jpg', 'assets/stairwell.jpg',
        'assets/duty_room.jpg', 'assets/id_photo.jpg', 'assets/bg_corridor.jpg',
        'assets/fonts/archive-song.woff', 'assets/fonts/archive-core.woff', 'assets/fonts/archive-original.woff',
        'assets/fonts/archive-evidence.woff', 'assets/fonts/archive-extra.woff',
        'assets/fonts/archive-core-v2.woff2', 'assets/fonts/archive-original-v2.woff2',
        'assets/fonts/archive-evidence-v2.woff2', 'assets/fonts/archive-extra-v2.woff2',
        'assets/audio/tape01.wav', 'assets/audio/tape02.wav', 'assets/audio/tape03.wav',
        'assets/audio/tape04.wav', 'assets/audio/tape05.wav', 'assets/audio/tape06.wav',
        'css/portal.css'
    )
    $eligible = @()
    $kept = 0
    foreach ($relative in $targets) {
        $path = Join-Path $root $relative
        if (!(Test-Path -LiteralPath $path -PathType Leaf)) { continue }
        $name = [IO.Path]::GetFileName($path)
        $pattern = '(?<![A-Za-z0-9_.-])' + [regex]::Escape($name) + '(?![A-Za-z0-9_.-])'
        if ($source -match $pattern) { $kept++; continue }
        if ($name.EndsWith('.wav')) {
            if (($source -match '\.wav(?![A-Za-z0-9_-])') -or !(Test-Path -LiteralPath ([IO.Path]::ChangeExtension($path, '.opus')) -PathType Leaf)) { $kept++; continue }
        }
        $eligible += $relative
    }
    if ($CheckOnly) { Write-Host ('Eligible: {0}; protected: {1}' -f $eligible.Count, $kept); exit 0 }
    if ($eligible.Count -eq 0) { Write-Host ('No unused legacy files to move. Protected: {0}' -f $kept); exit 0 }
    $temp = [IO.Path]::GetFullPath([IO.Path]::GetTempPath()).TrimEnd([IO.Path]::DirectorySeparatorChar)
    if (($temp -ieq $root) -or $temp.StartsWith($root + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { throw 'Backup must be outside the game folder; no files were moved.' }
    $backup = Join-Path $temp ('old4_unused_' + [guid]::NewGuid().ToString('N'))
    New-Item -ItemType Directory -Path $backup | Out-Null
    Write-Host ('Backup: ' + $backup)
    $moved = @()
    foreach ($relative in $eligible) {
        $from = Join-Path $root $relative
        $to = Join-Path $backup ([IO.Path]::GetFileName($from))
        Move-Item -LiteralPath $from -Destination $to
        $moved += $relative
    }
    @{ game = $root; files = $moved } | ConvertTo-Json -Depth 3 | Set-Content -LiteralPath (Join-Path $backup 'restore-map.json') -Encoding UTF8
    Write-Host ('Archived {0} unused legacy files outside the game folder.' -f $moved.Count)
    Write-Host ('Protected references: ' + $kept)
    exit 0
} catch {
    Write-Host ('Cleanup stopped: ' + $_.Exception.Message)
    Write-Host 'Existing game progress was not changed. Any moved assets remain in the external backup.'
    exit 1
}
