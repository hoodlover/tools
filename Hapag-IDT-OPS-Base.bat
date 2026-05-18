@echo off
REM Silent installer for Hapag-IDT-OPS-Base.
REM Downloads the .msi from hapagidt.com, installs it to LocalAppData,
REM creates Desktop + Startup shortcuts, launches the orb, exits.
REM No interactive prompts, no descriptive output, no Press-any-key.

setlocal
set "APP_NAME=Hapag-IDT-OPS-Base"
set "MSI_URL=https://github.com/hoodlover/tools/raw/main/Hapag-IDT-OPS-Base.msi"
set "INSTALL_DIR=%LOCALAPPDATA%\%APP_NAME%"
set "STAGE_DIR=%LOCALAPPDATA%\%APP_NAME%_Install"
set "MSI_FILE=%STAGE_DIR%\%APP_NAME%.msi"
set "ORB_EXE=%INSTALL_DIR%\PFiles\OPS-BASE Tiny\app.exe"
set "SETTINGS_DIR=%APPDATA%\OPS-BASE"
set "SETTINGS_FILE=%SETTINGS_DIR%\settings.json"
set "DEFAULT_DATA_DIR=%USERPROFILE%\Documents\OPS-BASE"

mkdir "%SETTINGS_DIR%" >nul 2>&1

powershell -NoProfile -ExecutionPolicy Bypass -Command "Add-Type -AssemblyName System.Windows.Forms; $default='%DEFAULT_DATA_DIR%'; New-Item -ItemType Directory -Force -Path $default | Out-Null; $dialog=New-Object System.Windows.Forms.FolderBrowserDialog; $dialog.Description='Choose where OPS-BASE should save your data'; $dialog.SelectedPath=$default; $dialog.ShowNewFolderButton=$true; if ($dialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) { $dialog.SelectedPath } else { $default }" > "%TEMP%\opsbase_data_dir.txt"

set /p DATA_DIR=<"%TEMP%\opsbase_data_dir.txt"
del /q "%TEMP%\opsbase_data_dir.txt" >nul 2>&1

if "%DATA_DIR%"=="" set "DATA_DIR=%DEFAULT_DATA_DIR%"
mkdir "%DATA_DIR%" >nul 2>&1

powershell -NoProfile -ExecutionPolicy Bypass -Command "$settingsDir='%SETTINGS_DIR%'; $settingsFile='%SETTINGS_FILE%'; $dataDir='%DATA_DIR%'; New-Item -ItemType Directory -Force -Path $settingsDir | Out-Null; [pscustomobject]@{ appName='OPS-BASE'; dataDir=$dataDir; createdAt=(Get-Date).ToString('o') } | ConvertTo-Json | Set-Content -Encoding UTF8 -Path $settingsFile" >nul 2>&1
setx OPSBRIDGE_DATA_DIR "%DATA_DIR%" >nul

mkdir "%STAGE_DIR%" >nul 2>&1
cd /d "%STAGE_DIR%"

curl.exe -sSL -o "%MSI_FILE%" "%MSI_URL%" >nul 2>&1
if not exist "%MSI_FILE%" exit /b 1

REM Release file locks from any running orb (msiexec /a silently skips locked
REM files), and wipe stale WebView2 state. A leftover Service Worker from a
REM prior install can intercept fetches and prevent React from mounting --
REM the process runs but the orb is invisible. Verified on HLAG corp machines.
taskkill /F /IM app.exe >nul 2>&1
if exist "%LOCALAPPDATA%\com.opsbase.tiny" rmdir /s /q "%LOCALAPPDATA%\com.opsbase.tiny" >nul 2>&1
if exist "%INSTALL_DIR%" rmdir /s /q "%INSTALL_DIR%" >nul 2>&1

msiexec /a "%MSI_FILE%" /qn TARGETDIR="%INSTALL_DIR%" >nul 2>&1

powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -Command "$s=(New-Object -COM WScript.Shell).CreateShortcut([System.Environment]::GetFolderPath('Desktop') + '\%APP_NAME%.lnk'); $q=[char]34; $s.TargetPath='%ORB_EXE%'; $s.Arguments='--data-dir ' + $q + '%DATA_DIR%' + $q; $s.WorkingDirectory=Split-Path '%ORB_EXE%'; $s.Save()" >nul 2>&1

powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -Command "$s=(New-Object -COM WScript.Shell).CreateShortcut('%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\%APP_NAME%.lnk'); $q=[char]34; $s.TargetPath='%ORB_EXE%'; $s.Arguments='--data-dir ' + $q + '%DATA_DIR%' + $q; $s.WorkingDirectory=Split-Path '%ORB_EXE%'; $s.Save()" >nul 2>&1

cd /d "%LOCALAPPDATA%"
rmdir /s /q "%STAGE_DIR%" >nul 2>&1

set "OPSBRIDGE_DATA_DIR=%DATA_DIR%"
start "" "%ORB_EXE%" --data-dir "%DATA_DIR%"

endlocal
exit /b 0
