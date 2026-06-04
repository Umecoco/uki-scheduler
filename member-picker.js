(function () {
  const sourceListId = "memberList";
  const patched = new WeakMap();

  function memberValues(input) {
    const list = document.querySelector(`#${sourceListId}`);
    const values = Array.from(list?.options || []).map((option) => option.value).filter(Boolean);
    if (input.value && !values.includes(input.value)) values.push(input.value);
    return [...new Set(values)].sort((a, b) => a.localeCompare(b, "ja"));
  }

  function optionHtml(input) {
    return memberValues(input)
      .map((value) => `<option value="${escapeAttr(value)}"${value === input.value ? " selected" : ""}>${escapeHtml(value)}</option>`)
      .join("");
  }

  function patchInput(input) {
    if (!input || input.type === "hidden" || input.dataset.memberPickerPatched === "true") return;

    const select = document.createElement("select");
    select.className = "member-choice-select";
    select.dataset.memberPicker = "true";
    if (input.dataset.panelId) select.dataset.panelId = input.dataset.panelId;
    if (input.dataset.panelField) select.dataset.panelField = input.dataset.panelField;
    select.innerHTML = optionHtml(input);

    select.addEventListener("change", () => {
      input.value = select.value;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      if (!select.dataset.panelField) {
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });

    input.dataset.memberPickerPatched = "true";
    input.hidden = true;
    input.insertAdjacentElement("afterend", select);
    patched.set(input, select);
  }

  function syncInput(input) {
    const select = patched.get(input);
    if (!select) return;
    const nextValues = memberValues(input);
    const currentValues = Array.from(select.options).map((option) => option.value);
    if (nextValues.join("\u0000") !== currentValues.join("\u0000")) {
      select.innerHTML = optionHtml(input);
    }
    if (select.value !== input.value) select.value = input.value;
  }

  function patchAll() {
    document.querySelectorAll(`input[list="${sourceListId}"]`).forEach(patchInput);
    document.querySelectorAll(`input[list="${sourceListId}"]`).forEach(syncInput);
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttr(value) {
    return escapeHtml(value).replaceAll("`", "&#096;");
  }

  document.addEventListener("DOMContentLoaded", patchAll);
  document.addEventListener("click", () => setTimeout(patchAll, 0));
  document.addEventListener("focusin", patchAll);
  new MutationObserver(patchAll).observe(document.documentElement, { childList: true, subtree: true });
})();
