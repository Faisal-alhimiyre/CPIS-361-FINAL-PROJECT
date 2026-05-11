(function () {
  const landing = document.getElementById("app-landing");
  const arStage = document.getElementById("ar-stage");
  const arSceneRoot = document.getElementById("ar-scene-root");
  const form = document.getElementById("decoy-form");
  const formError = document.getElementById("form-error");
  const colorInput = document.getElementById("accent-color");
  const fontSelect = document.getElementById("arabic-font");
  const btnBack = document.getElementById("btn-back");
  const btnReloadAr = document.getElementById("btn-reload-ar");

  let windowResizeHandler = null;

  function setArPageLock(on) {
    const root = document.documentElement;
    if (on) {
      root.classList.add("is-ar-open");
      document.body.classList.add("is-ar-open");
    } else {
      root.classList.remove("is-ar-open");
      document.body.classList.remove("is-ar-open");
    }
  }

  function syncArRootDimensions() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (arSceneRoot) {
      arSceneRoot.style.width = w + "px";
      arSceneRoot.style.height = h + "px";
    }
  }

  function arIframe() {
    return arSceneRoot && arSceneRoot.querySelector("iframe.ar-iframe");
  }

  function postUpdateToArIframe() {
    if (arStage.hidden) return;
    const iframe = arIframe();
    if (!iframe || !iframe.contentWindow) return;
    const opt = fontSelect.selectedOptions[0];
    const gen = (opt && opt.dataset && opt.dataset.generic) || "sans-serif";
    iframe.contentWindow.postMessage(
      {
        type: "propbuild-update",
        color: colorInput.value,
        font: fontSelect.value,
        gen: gen,
      },
      "*"
    );
  }

  function showError(text) {
    formError.textContent = text;
    formError.hidden = false;
  }

  function clearError() {
    formError.hidden = true;
    formError.textContent = "";
  }

  async function ensureFontsLoaded() {
    if (!document.fonts || !document.fonts.ready) {
      return;
    }
    await document.fonts.ready;
    const opt = fontSelect.selectedOptions[0];
    const family = fontSelect.value;
    const generic = (opt && opt.dataset && opt.dataset.generic) || "sans-serif";
    try {
      await document.fonts.load('700 48px "' + family + '", ' + generic);
    } catch (_) {}
  }

  function buildArViewUrl() {
    const base = new URL("ar-view.html", window.location.href).href;
    const opt = fontSelect.selectedOptions[0];
    const gen = (opt && opt.dataset && opt.dataset.generic) || "sans-serif";
    const c = colorInput.value.replace(/^#/, "");
    const q = new URLSearchParams({
      c: c,
      font: fontSelect.value,
      gen: gen,
    });
    return base + "?" + q.toString();
  }

  function mountArIframe() {
    if (!arSceneRoot) return;
    arSceneRoot.innerHTML = "";
    const iframe = document.createElement("iframe");
    iframe.className = "ar-iframe";
    iframe.setAttribute("title", "معاينة AR");
    iframe.setAttribute("allow", "camera; microphone");
    iframe.setAttribute("loading", "eager");
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.addEventListener("load", function () {
      syncArRootDimensions();
    });
    iframe.src = buildArViewUrl();
    arSceneRoot.appendChild(iframe);
  }

  async function enterAr() {
    await ensureFontsLoaded();

    landing.hidden = true;
    landing.setAttribute("aria-hidden", "true");
    arStage.hidden = false;
    arStage.setAttribute("aria-hidden", "false");
    setArPageLock(true);

    if (!windowResizeHandler) {
      windowResizeHandler = function () {
        if (arStage.hidden) return;
        syncArRootDimensions();
      };
      window.addEventListener("resize", windowResizeHandler);
    }

    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        mountArIframe();
        syncArRootDimensions();
      });
    });
  }

  function exitAr() {
    const iframe = arIframe();
    if (iframe) {
      try {
        iframe.src = "about:blank";
      } catch (_) {}
    }
    if (arSceneRoot) {
      arSceneRoot.innerHTML = "";
      arSceneRoot.style.width = "";
      arSceneRoot.style.height = "";
    }
    if (windowResizeHandler) {
      window.removeEventListener("resize", windowResizeHandler);
      windowResizeHandler = null;
    }
    setArPageLock(false);
    arStage.hidden = true;
    arStage.setAttribute("aria-hidden", "true");
    landing.hidden = false;
    landing.setAttribute("aria-hidden", "false");
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearError();

    if (!form.checkValidity()) {
      showError("يرجى تعبئة جميع الحقول قبل المتابعة.");
      form.reportValidity();
      return;
    }

    void enterAr();
  });

  if (btnBack) {
    btnBack.addEventListener("click", exitAr);
  }

  if (btnReloadAr) {
    btnReloadAr.addEventListener("click", function () {
      window.location.reload();
    });
  }

  colorInput.addEventListener("input", function () {
    postUpdateToArIframe();
  });

  fontSelect.addEventListener("change", function () {
    void ensureFontsLoaded().then(postUpdateToArIframe);
  });
})();
