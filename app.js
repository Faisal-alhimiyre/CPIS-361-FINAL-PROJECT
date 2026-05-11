(function () {
  const MESSAGE = "احبك اكثر";

  const landing = document.getElementById("app-landing");
  const arStage = document.getElementById("ar-stage");
  const arSceneRoot = document.getElementById("ar-scene-root");
  const arSceneTemplate = document.getElementById("ar-scene-template");
  const form = document.getElementById("decoy-form");
  const formError = document.getElementById("form-error");
  const colorInput = document.getElementById("accent-color");
  const fontSelect = document.getElementById("arabic-font");
  const btnBack = document.getElementById("btn-back");

  function getMessagePlane() {
    return document.getElementById("message-plane");
  }

  function showError(text) {
    formError.textContent = text;
    formError.hidden = false;
  }

  function clearError() {
    formError.hidden = true;
    formError.textContent = "";
  }

  function getFontStack() {
    const opt = fontSelect.selectedOptions[0];
    const family = fontSelect.value;
    const generic = (opt && opt.dataset && opt.dataset.generic) || "sans-serif";
    return '"' + family + '", ' + generic;
  }

  function buildTextTexture(hexColor, fontStack) {
    const w = 2048;
    const h = 512;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(0, 0, w, h);

    ctx.direction = "rtl";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = hexColor;
    ctx.font = "bold 140px " + fontStack;
    ctx.shadowColor = "rgba(0,0,0,0.55)";
    ctx.shadowBlur = 18;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 6;

    ctx.fillText(MESSAGE, w / 2, h / 2 + 8);

    return canvas.toDataURL("image/png");
  }

  function applyPlaneTexture(dataUrl) {
    const plane = getMessagePlane();
    if (!plane) return;
    plane.setAttribute("material", {
      src: dataUrl,
      transparent: true,
      shader: "flat",
    });
  }

  async function ensureFontsLoaded() {
    if (!document.fonts || !document.fonts.ready) {
      return;
    }
    await document.fonts.ready;
    try {
      await document.fonts.load("700 48px " + getFontStack());
    } catch (_) {
      /* ignore if Font Loading API rejects */
    }
  }

  function mountArScene(onReady) {
    if (!arSceneRoot || !arSceneTemplate) {
      return;
    }
    arSceneRoot.innerHTML = "";
    arSceneRoot.appendChild(arSceneTemplate.content.cloneNode(true));
    const scene = arSceneRoot.querySelector("a-scene");
    if (!scene) {
      return;
    }
    function finish() {
      onReady(scene);
    }
    if (scene.hasLoaded) {
      finish();
      return;
    }
    scene.addEventListener("loaded", finish, { once: true });
  }

  function resizeScene(scene) {
    if (!scene) return;
    function tick() {
      if (typeof scene.resize === "function") {
        scene.resize();
      }
      window.dispatchEvent(new Event("resize"));
    }
    tick();
    window.setTimeout(tick, 100);
    window.setTimeout(tick, 400);
    window.setTimeout(tick, 1000);
  }

  async function enterAr() {
    const color = colorInput.value;
    await ensureFontsLoaded();
    const dataUrl = buildTextTexture(color, getFontStack());

    landing.hidden = true;
    landing.setAttribute("aria-hidden", "true");
    arStage.hidden = false;
    arStage.setAttribute("aria-hidden", "false");

    /* Let the stage leave display:none before AR.js measures the viewport and opens the camera. */
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        mountArScene(function (scene) {
          applyPlaneTexture(dataUrl);
          resizeScene(scene);
        });
      });
    });
  }

  function exitAr() {
    if (arSceneRoot) {
      arSceneRoot.innerHTML = "";
    }
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

  colorInput.addEventListener("input", function () {
    if (arStage.hidden) return;
    applyPlaneTexture(buildTextTexture(colorInput.value, getFontStack()));
  });

  fontSelect.addEventListener("change", function () {
    if (arStage.hidden) return;
    void ensureFontsLoaded().then(function () {
      applyPlaneTexture(buildTextTexture(colorInput.value, getFontStack()));
    });
  });
})();
