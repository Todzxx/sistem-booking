$branches = @(
  'feat/booking-system',
  'feat/swagger-docs',
  'feat/pagination-metadata',
  'feat/admin-facilities',
  'feat/sse-notifications',
  'feat/error-boundary',
  'feat/bookings-skeleton',
  'feat/booking-form-reset',
  'feat/calendar-colors',
  'feat/devops',
  'feat/code-splitting',
  'feat/payment-calendar',
  'feat/security-hardening',
  'fix/heroui-v3-api'
)

$ErrorActionPreference = 'Continue'

foreach ($branch in $branches) {
  Write-Host "`n=== Merging $branch ===" -ForegroundColor Cyan

  # Try merge
  $output = git merge $branch --no-ff --no-commit 2>&1
  $exitCode = $LASTEXITCODE

  if ($exitCode -eq 0) {
    Write-Host "Merge succeeded without conflicts, committing..." -ForegroundColor Green
    git add .
    git commit --no-edit
    git push
    continue
  }

  # Get unmerged files
  $unmerged = @(git diff --name-only --diff-filter=U)
  
  if ($unmerged.Count -eq 0) {
    Write-Host "Merge failed but no unmerged files found, aborting." -ForegroundColor Red
    git merge --abort
    continue
  }

  Write-Host "Found $($unmerged.Count) conflicted files, resolving all with --ours" -ForegroundColor Yellow

  # Resolve all with ours (keep develop version)
  foreach ($file in $unmerged) {
    git checkout --ours -- $file 2>&1 | Out-Null
  }

  # Check for remaining conflict markers (safety)
  $conflictFiles = git diff --name-only --diff-filter=U
  if ($conflictFiles.Count -gt 0) {
    Write-Host "Warning: Still has unmerged files after --ours: $conflictFiles" -ForegroundColor Red
    git merge --abort
    Write-Host "Aborted merge for $branch" -ForegroundColor Red
    continue
  }

  # Stage, commit, push
  git add .
  git commit --no-edit 2>&1 | Out-Null
  if ($LASTEXITCODE -ne 0) {
    Write-Host "Commit failed for $branch, aborting." -ForegroundColor Red
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
