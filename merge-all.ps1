$branches = @(
  'feat/booking-system',
  'feat/swagger-docs',
  'feat/pagination-metadata',
  'feat/admin-facilities',
  'feat/sse-notifications',
  'feat/error-boundary',
  'feat/bookings-skeleton',
  'feat/booking-form-reset',
  'feat/payment-calendar',
  'feat/security-hardening',
  'fix/heroui-v3-api'
)

# Already done by script: calendar-colors, code-splitting
# devops: nothing to commit (empty merge)
# Already done manually: auth-system, role-management, database-migrations, facility-management

$ErrorActionPreference = 'Continue'

foreach ($branch in $branches) {
  Write-Host "`n=== Merging $branch ===" -ForegroundColor Cyan

  # Try merge
  $output = git merge $branch --no-ff --no-commit 2>&1
  $exitCode = $LASTEXITCODE

  if ($exitCode -eq 0) {
    Write-Host "Merge succeeded without conflicts, committing..." -ForegroundColor Green
    git add . 2>&1 | Out-Null
    git commit --no-edit 2>&1 | Out-Null
    git push 2>&1 | Out-Null
    Write-Host "Merged and pushed $branch" -ForegroundColor Green
    continue
  }

  # Get unmerged files
  $unmerged = @(git diff --name-only --diff-filter=U)
  
  if ($unmerged.Count -eq 0) {
    Write-Host "No conflicted files, checking status..." -ForegroundColor Yellow
    git merge --abort
    continue
  }

  Write-Host "Found $($unmerged.Count) conflicted files, resolving with HEAD version" -ForegroundColor Yellow

  $allResolved = $true
  foreach ($file in $unmerged) {
    # Get the HEAD (stage 2) version and write it
    $content = git show ":2:$file" 2>&1
    if ($LASTEXITCODE -eq 0) {
      # Use Set-Content with the file content
      [System.IO.File]::WriteAllText("$pwd/$file", $content, [System.Text.UTF8Encoding]::new($false))
      git add -- $file 2>&1 | Out-Null
      Write-Host "  Resolved: $file" -ForegroundColor Gray
    } else {
      Write-Host "  FAILED: $file - $content" -ForegroundColor Red
      $allResolved = $false
    }
  }

  if (-not $allResolved) {
    Write-Host "Aborting merge for $branch due to unresolved files" -ForegroundColor Red
    git merge --abort
    continue
  }

  # Verify no remaining conflicts
  $remaining = @(git diff --name-only --diff-filter=U)
  if ($remaining.Count -gt 0) {
    Write-Host "Still has $($remaining.Count) unmerged files, aborting" -ForegroundColor Red
    git merge --abort
    continue
  }

  # Commit and push
  git add . 2>&1 | Out-Null
  git commit --no-edit 2>&1 | Out-Null
  if ($LASTEXITCODE -ne 0) {
    Write-Host "Commit failed for $branch" -ForegroundColor Red
    git merge --abort
    continue
  }

  git push 2>&1 | Out-Null
  if ($LASTEXITCODE -ne 0) {
    Write-Host "Push failed for $branch" -ForegroundColor Red
    continue
  }

  Write-Host "Merged and pushed $branch" -ForegroundColor Green
}

Write-Host "`n=== All merges complete ===" -ForegroundColor Cyan
