@echo off
setlocal enabledelayedexpansion

:: Extract the current version from package.json
for /f "tokens=2 delims=:," %%i in ('findstr "version" package.json') do (
    set version=%%i
)

:: Remove quotes and trim spaces
set version=%version:"=%
set version=%version: =%

:: Split version into major, minor, and patch
for /f "tokens=1-3 delims=." %%a in ("%version%") do (
    set major=%%a
    set minor=%%b
    set patch=%%c
)

:: Increment the patch version
set /a patch+=1

:: Combine into new version
set new_version=%major%.%minor%.%patch%

:: Update package.json with the new version
powershell -Command "(gc package.json) -replace '%version%', '%new_version%' | Out-File -encoding UTF8 package.json"

:: Add changes to git and commit
git add package.json
git commit -m "Bump version to %new_version%"

:: Create a new git tag and push
git tag v%new_version%
git push origin v%new_version%

echo Version updated to %new_version% and pushed to git.
endlocal