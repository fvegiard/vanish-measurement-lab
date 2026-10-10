@echo off
rem Sandbox test runner: portable exe cold start + Electron dev loop + correction cycle
setlocal
set NODE_DIR=C:\Users\wdagUtilityAccount\Desktop\24.21.0
set PATH=%NODE_DIR%;%PATH%
set LAB=C:\Users\wdagUtilityAccount\Desktop\electron-lab
cd /d %LAB%
set OUT=%LAB%\sandbox-results.txt

echo === SANDBOX RUN %date% %time% === > %OUT%

rem --- 1. Portable exe cold start (proxy: wall time minus 1500ms quit delay) ---
echo --- TEMP BEFORE --- >> %OUT%
dir /b "%TEMP%" | findstr /i "vanish" >> %OUT% 2>&1
for /L %%i in (1,1,3) do (
  powershell -NoProfile -Command "$sw=[Diagnostics.Stopwatch]::StartNew(); Start-Process -FilePath '%LAB%\dist\vanish-lab 1.0.0.exe' -Wait; $sw.Stop(); Write-Output ('PORTABLE_RUN' + '%%i' + '_WALL_MS=' + $sw.ElapsedMilliseconds)"
) >> %OUT% 2>&1
echo --- TEMP AFTER --- >> %OUT%
dir /b "%TEMP%" | findstr /i "vanish" >> %OUT% 2>&1

rem --- 2. Electron dev loop x3 ---
node loop-electron.js 3 >> %OUT% 2>&1

rem --- 3. Correction cycle (bug inject -> FAIL, revert -> PASS) ---
node correction-electron.js >> %OUT% 2>&1

echo === SANDBOX RUN COMPLETE === >> %OUT%
exit