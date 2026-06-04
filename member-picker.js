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
      if (!select.dataset.panelField) input.dispatchEvent(new Event("change", { bubbles: true }));
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
    if (nextValues.join("\u0000") !== currentValues.join("\u0000")) select.innerHTML = optionHtml(input);
    if (select.value !== input.value) select.value = input.value;
  }

  function patchAll() {
    document.querySelectorAll(`input[list="${sourceListId}"]`).forEach(patchInput);
    document.querySelectorAll(`input[list="${sourceListId}"]`).forEach(syncInput);
  }

  function escapeHtml(value) {
    return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  }
  function escapeAttr(value) { return escapeHtml(value).replaceAll("`", "&#096;"); }

  document.addEventListener("DOMContentLoaded", patchAll);
  document.addEventListener("click", () => setTimeout(patchAll, 0));
  document.addEventListener("focusin", patchAll);
  new MutationObserver(patchAll).observe(document.documentElement, { childList: true, subtree: true });
})();

(function () {
  const storageKey = "uki-scheduler-panel-production-v1";
  const backupStorageKey = `${storageKey}-backup`;
  let scheduled = false;
  let dragState = null;

  function loadTasks() { try { return JSON.parse(localStorage.getItem(storageKey) || "null")?.tasks || []; } catch { return []; } }
  function categoryClass(category) { if (category === "デザイン") return "category-design"; if (category === "原稿") return "category-script"; return "category-business"; }

  function decorateBars() {
    const tasks = loadTasks();
    const tasksById = new Map(tasks.map((task) => [task.id, task]));
    document.querySelectorAll(".task-bar").forEach((bar) => {
      bar.classList.remove("category-design", "category-script", "category-business");
      const task = taskForBar(bar, tasksById, tasks);
      if (!task) return;
      bar.dataset.taskId = task.id;
      bar.classList.add("schedule-editable");
      if (!bar.classList.contains("milestone")) {
        bar.classList.add(categoryClass(task.category));
        addResizeHandle(bar, "start");
        addResizeHandle(bar, "end");
      }
    });
  }

  function taskForBar(bar, tasksById, tasks) {
    const id = bar.querySelector(".bar-text")?.textContent.trim();
    if (id) return tasksById.get(id);
    const name = bar.closest(".timeline-row")?.previousElementSibling?.querySelector("strong")?.textContent.trim();
    return tasks.find((task) => task.milestone && task.name === name);
  }

  function addResizeHandle(bar, edge) {
    if (bar.querySelector(`[data-resize-edge="${edge}"]`)) return;
    const handle = document.createElement("span");
    handle.className = `schedule-resize-handle ${edge}`;
    handle.dataset.resizeEdge = edge;
    handle.title = edge === "start" ? "開始日を変更" : "期限を変更";
    bar.appendChild(handle);
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
      placeholder.value = ""; placeholder.textContent = "カテゴリを選択"; placeholder.disabled = true; placeholder.selected = true; select.prepend(placeholder);
    }
    option.remove();
  }

  function preventMilestoneCategoryAddition(event) {
    const input = document.querySelector("#newCategoryName");
    if (input?.value.trim() !== "マイルストーン") return;
    event.preventDefault(); event.stopImmediatePropagation(); input.value = "";
    const caption = document.querySelector("#categoryCaption"); if (caption) caption.textContent = "「マイルストーン」は種別で指定します";
  }

  function scheduleDecorate() { if (scheduled) return; scheduled = true; requestAnimationFrame(() => { scheduled = false; decorateBars(); addLegend(); removeMilestoneCategoryOption(); }); }
  function isoToDate(value) { const [year, month, day] = String(value).split("-").map(Number); return new Date(year, month - 1, day, 12); }
  function toIso(date) { const year = date.getFullYear(); const month = String(date.getMonth() + 1).padStart(2, "0"); const day = String(date.getDate()).padStart(2, "0"); return `${year}-${month}-${day}`; }
  function shiftIso(value, days) { const date = isoToDate(value); date.setDate(date.getDate() + days); return toIso(date); }
  function dayWidth(bar) { const row = bar.closest(".timeline-row"); const cells = row?.querySelectorAll(".gantt-cell").length || 1; return row.getBoundingClientRect().width / cells; }

  function startDrag(event) {
    const bar = event.target.closest(".task-bar.schedule-editable");
    if (!bar || event.button !== 0) return;
    const task = loadTasks().find((item) => item.id === bar.dataset.taskId);
    if (!task) return;
    event.preventDefault();
    const edge = event.target.closest("[data-resize-edge]")?.dataset.resizeEdge;
    dragState = { bar, task, mode: task.milestone ? "move" : edge || "move", startX: event.clientX, dayWidth: dayWidth(bar), days: 0 };
    bar.classList.add("schedule-dragging");
    bar.setPointerCapture?.(event.pointerId);
  }

  function moveDrag(event) {
    if (!dragState) return;
    const days = Math.round((event.clientX - dragState.startX) / dragState.dayWidth);
    if (days === dragState.days) return;
    dragState.days = days;
    dragState.bar.style.transform = dragState.task.milestone ? `translateX(${4 + days * dragState.dayWidth}px) rotate(45deg)` : `translateX(${days * dragState.dayWidth}px)`;
    dragState.bar.dataset.dragDays = `${days > 0 ? "+" : ""}${days}日`;
  }

  function endDrag() {
    if (!dragState) return;
    const { task, days, mode } = dragState;
    dragState.bar.classList.remove("schedule-dragging"); dragState.bar.style.transform = ""; delete dragState.bar.dataset.dragDays; dragState = null;
    if (!days) return;
    const raw = localStorage.getItem(storageKey); if (!raw) return;
    const state = JSON.parse(raw); const savedTask = state.tasks?.find((item) => item.id === task.id); if (!savedTask) return;
    const start = savedTask.start; const end = savedTask.end;
    if (mode === "move") { savedTask.start = shiftIso(start, days); savedTask.end = shiftIso(end, days); }
    else if (mode === "start") { const nextStart = shiftIso(start, days); if (isoToDate(nextStart) > isoToDate(end)) return; savedTask.start = nextStart; }
    else { const nextEnd = shiftIso(end, days); if (isoToDate(nextEnd) < isoToDate(start)) return; savedTask.end = nextEnd; }
    localStorage.setItem(backupStorageKey, raw); localStorage.setItem(storageKey, JSON.stringify(state)); location.reload();
  }

  document.addEventListener("DOMContentLoaded", () => {
    const style = document.createElement("style");
    style.textContent = `.schedule-legend{display:flex;align-items:center;flex-wrap:wrap;justify-content:flex-end;gap:10px;margin-left:auto}.schedule-legend span{display:flex;align-items:center;gap:5px;color:#667085;font-size:.78rem;font-weight:700}.schedule-legend i{width:20px;height:8px;border-radius:3px}.task-bar.category-design,.schedule-legend .category-design{background:#315fba}.task-bar.category-script,.schedule-legend .category-script{background:#237c78}.task-bar.category-business,.schedule-legend .category-business{background:#b7791f}.task-bar.critical{outline:3px solid #b42318;outline-offset:1px}.task-bar.late{outline:3px dashed #b42318;outline-offset:1px}.task-bar.milestone{background:#7a5af8;outline:none}.task-bar.schedule-editable{cursor:grab;touch-action:none}.task-bar.schedule-dragging{cursor:grabbing;z-index:8;opacity:.82}.task-bar.schedule-dragging::after{content:attr(data-drag-days);position:absolute;left:50%;bottom:calc(100% + 8px);transform:translateX(-50%);padding:3px 7px;border-radius:4px;background:#23272f;color:#fff;font-size:11px;font-weight:700;white-space:nowrap}.schedule-resize-handle{position:absolute;top:0;width:8px;height:100%;cursor:ew-resize;background:rgba(255,255,255,.42)}.schedule-resize-handle.start{left:0;border-radius:5px 0 0 5px}.schedule-resize-handle.end{right:0;border-radius:0 5px 5px 0}.task-bar.milestone.schedule-dragging::after{transform:translateX(-50%) rotate(-45deg)}`;
    document.head.appendChild(style);
    document.querySelector("#addCategoryButton")?.addEventListener("click", preventMilestoneCategoryAddition, true);
    document.querySelector("#newCategoryName")?.addEventListener("keydown", (event) => { if (event.key === "Enter") preventMilestoneCategoryAddition(event); }, true);
    document.querySelector("#ganttChart")?.addEventListener("pointerdown", startDrag);
    document.addEventListener("pointermove", moveDrag);
    document.addEventListener("pointerup", endDrag);
    document.addEventListener("pointercancel", endDrag);
    scheduleDecorate();
    new MutationObserver(scheduleDecorate).observe(document.querySelector("main"), { childList: true, subtree: true });
  });
})();
