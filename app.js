(function () {
  const form = document.getElementById("decoy-form");
  const formError = document.getElementById("form-error");
  const colorInput = document.getElementById("accent-color");
  const fontSelect = document.getElementById("arabic-font");

  function showError(text) {
    formError.textContent = text;
    formError.hidden = false;
  }

  function clearError() {
    formError.hidden = true;
    formError.textContent = "";
  }

  /** Same folder rule as before: works on GitHub Pages with or without trailing slash. */
  function arViewDirectoryUrl() {
    let path = window.location.pathname || "/";
    if (/\.html?$/i.test(path)) {
      path = path.slice(0, path.lastIndexOf("/") + 1);
    } else if (!path.endsWith("/")) {
      path = path + "/";
    }
    if (!path.endsWith("/")) {
      path = path + "/";
    }
    return window.location.origin + path;
  }

  function buildArViewUrl() {
    const opt = fontSelect.selectedOptions[0];
    const gen = (opt && opt.dataset && opt.dataset.generic) || "sans-serif";
    const c = colorInput.value.replace(/^#/, "");
    const q = new URLSearchParams({
      c: c,
      font: fontSelect.value,
      gen: gen,
    });
    return arViewDirectoryUrl() + "ar-view.html?" + q.toString();
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    clearError();

    if (!form.checkValidity()) {
      showError("يرجى تعبئة جميع الحقول قبل المتابعة.");
      form.reportValidity();
      return;
    }

    window.location.assign(buildArViewUrl());
  });
})();
