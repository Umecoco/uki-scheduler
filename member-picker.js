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
    if (!input || input.id === "newMemberName" || input.type === "hidden" || input.dataset.memberPickerPatched === "true") return;

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

(function () {
  const storageKey = "uki-scheduler-panel-production-v1";
  let scheduled = false;

  function loadTasks() {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "null")?.tasks || [];
    } catch {
      return [];
    }
  }

  function categoryClass(category) {
    if (category === "デザイン") return "category-design";
    if (category === "原稿") return "category-script";
    return "category-business";
  }

  function decorateBars() {
    const tasksById = new Map(loadTasks().map((task) => [task.id, task]));
    document.querySelectorAll(".task-bar").forEach((bar) => {
      bar.classList.remove("category-design", "category-script", "category-business");
      if (bar.classList.contains("milestone")) return;
      const task = tasksById.get(bar.querySelector(".bar-text")?.textContent.trim());
      bar.classList.add(categoryClass(task?.category));
    });
  }

  function addLegend() {
    const caption = document.querySelector("#chartCaption");
    if (!caption || document.querySelector(".schedule-legend")) return;
    const legend = document.createElement("div");
    legend.className = "schedule-legend";
    legend.innerHTML = `<span><i class="category-design"></i>デザイン</span><span><i class="category-script"></i>原稿</span><span><i class="category-business"></i>事業部・その他</span>`;
    caption.insertAdjacentElement("beforebegin", legend);
  }

  function removeMilestoneCategoryOption() {
    const select = document.querySelector("#editCategoryChoice");
    const option = select?.querySelector('option[value="マイルストーン"]');
    if (!option) return;
    if (option.selected) {
      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = "カテゴリを選択";
      placeholder.disabled = true;
      placeholder.selected = true;
      select.prepend(placeholder);
    }
    option.remove();
  }

  function preventMilestoneCategoryAddition(event) {
    const input = document.querySelector("#newCategoryName");
    if (input?.value.trim() !== "マイルストーン") return;
    event.preventDefault();
    event.stopImmediatePropagation();
    input.value = "";
    const caption = document.querySelector("#categoryCaption");
    if (caption) caption.textContent = "「マイルストーン」は種別で指定します";
  }

  function scheduleDecorate() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      decorateBars();
      addLegend();
      removeMilestoneCategoryOption();
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    const style = document.createElement("style");
    style.textContent = `.schedule-legend{display:flex;align-items:center;flex-wrap:wrap;justify-content:flex-end;gap:10px;margin-left:auto}.schedule-legend span{display:flex;align-items:center;gap:5px;color:#667085;font-size:.78rem;font-weight:700}.schedule-legend i{width:20px;height:8px;border-radius:3px}.task-bar.category-design,.schedule-legend .category-design{background:#315fba}.task-bar.category-script,.schedule-legend .category-script{background:#237c78}.task-bar.category-business,.schedule-legend .category-business{background:#b7791f}.task-bar.critical{outline:3px solid #b42318;outline-offset:1px}.task-bar.late{outline:3px dashed #b42318;outline-offset:1px}.task-bar.milestone{background:#7a5af8;outline:none}`;
    document.head.appendChild(style);
    document.querySelector("#addCategoryButton")?.addEventListener("click", preventMilestoneCategoryAddition, true);
    document.querySelector("#newCategoryName")?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") preventMilestoneCategoryAddition(event);
    }, true);
    scheduleDecorate();
    new MutationObserver(scheduleDecorate).observe(document.querySelector("main"), { childList: true, subtree: true });
  });
})();
