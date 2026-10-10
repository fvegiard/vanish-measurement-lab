(() => {
  (async () => {
    const out = [];
    const el = document.getElementById("out");
    const log = (s, cls) => {
      out.push(s);
      el.textContent = out.join("\n");
      if (cls) el.className = cls;
    };
    const chromeAny = chrome;
    if (new URLSearchParams(location.search).get("do") === "reload") {
      document.title = "PROBE-RELOADING";
      chromeAny.runtime.reload();
      return;
    }
    log("=== TEST A: direct OS access from extension page (no bridge) ===", "info");
    const ns = Object.keys(chromeAny).sort();
    log("chrome.* namespaces present: " + ns.join(", "));
    for (const c of ["fileSystem", "fileBrowserHandler", "fileSystemProvider", "downloads", "management"]) {
      log(`chrome.${c} = ${typeof chromeAny[c]}`);
    }
    let opfs = "n/a";
    try {
      await navigator.storage.getDirectory();
      opfs = "available \u2014 but it is a SANDBOXED virtual FS, not the real disk";
    } catch (e) {
      opfs = "error: " + e.message;
    }
    log("navigator.storage.getDirectory() (OPFS): " + opfs);
    log("RESULT A: no chrome.* API can read/delete arbitrary OS files, registry, or processes.", "bad");
    log("");
    log("=== TEST B: same extension, but through a native messaging host bridge ===", "info");
    const file = new URLSearchParams(location.search).get("file");
    log('asking native host "com.vanish.test" to delete: ' + file);
    const result = await new Promise((resolve) => {
      try {
        const port = chromeAny.runtime.connectNative("com.vanish.test");
        let got = false;
        port.onMessage.addListener((m) => {
          got = true;
          resolve(m);
          port.disconnect();
        });
        port.onDisconnect.addListener(() => {
          if (!got) resolve({ ok: false, error: chromeAny.runtime.lastError && chromeAny.runtime.lastError.message || "host disconnected" });
        });
        port.postMessage({ cmd: "delete", file });
      } catch (e) {
        resolve({ ok: false, error: String(e) });
      }
    });
    log("native host response: " + JSON.stringify(result));
    const ok = result.ok && result.deleted;
    log("RESULT B: " + (ok ? "SUCCESS \u2014 the extension deleted a real OS file THROUGH the native host bridge." : "FAILED \u2014 " + JSON.stringify(result)), ok ? "good" : "bad");
    log("");
    log("VERDICT: extension alone = sandboxed (cannot touch OS). Extension + native bridge = full OS reach.", ok ? "good" : "bad");
    document.title = "PROBE-DONE";
  })();
})();
