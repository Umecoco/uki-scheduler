(function () {
  const storageKey = "uki-scheduler-panel-production-v1";
  const manualCriticalKey = `${storageKey}-manual-critical`;
  const categoriesKey = `${storageKey}-categories`;
  let decorateScheduled = false;

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "null");
    } catch {
      return null;
    }
  }

  function manualCriticalIds() {
    try {
      return new Set(JSON.parse(localStorage.getItem(manualCriticalKey) || "[]"));
    } catch {
      return new Set();
    }
  }

  function saveManualCriticalIds(ids) {
    localStorage.setItem(manualCriticalKey, JSON.stringify([...ids]));
  }

  function categoryValues(currentValue = "") {
    let saved = [];
    try {
      saved = JSON.parse(localStorage.getItem(categoriesKey) || "[]");
    } catch {
      saved = [];
    }
    const taskCategories = loadState()?.tasks?.map((task) => task.category).filter(Boolean) || [];
    return [...new Set([...saved, ...taskCategories, currentValue].filter(Boolean))].sort((a, b) => a.localeCompare(b, "ja"));
  }

  function saveCategoryValues(values) {
    localStorage.setItem(categoriesKey, JSON.stringify([...new Set(values)].sort((a, b) => a.localeCompare(b, "ja"))));
  }

  function categoryOptionHtml(currentValue = "") {
    return categoryValues(currentValue)
      .map((value) => `<option value="${escapeHtml(value)}"${value === currentValue ? " selected" : ""}>${escapeHtml(value)}</option>`)
      .join("");
  }

  function setupCategorySelect() {
    const input = document.querySelector("#editCategory");
    if (!input) return;
    let select = document.querySelector("#editCategoryChoice");
    if (!select) {
      select = document.createElement("select");
      select.id = "editCategoryChoice";
      select.addEventListener("change", () => {
        input.value = select.value;
      });
      input.hidden = true;
      input.insertAdjacentElement("afterend", select);
    }
    select.innerHTML = categoryOptionHtml(input.value);
    select.value = input.value;
  }

  function addCategory() {
    const input = document.querySelector("#newCategoryName");
    const name = input?.value.trim();
    if (!name) return;
    saveCategoryValues([...categoryValues(), name]);
    input.value = "";
    refreshCategoryCaption();
    setupCategorySelect();
  }

  function refreshCategoryCaption() {
    const caption = document.querySelector("#categoryCaption");
    if (caption) caption.textContent = `${categoryValues().length}件の候補`;
  }

  function addEditorControls() {
    const grid = document.querySelector("#taskForm .form-grid");
    const category = document.querySelector("#editCategory");
    if (!grid || !category || document.querySelector("#editMilestoneChoice")) return;

    const typeLabel = document.createElement("label");
    typeLabel.dataset.taskMetaControl = "true";
    typeLabel.innerHTML = `<span>種別</span><select id="editMilestoneChoice"><option value="no">タスク</option><option value="yes">マイルストーン</option></select>`;

    const criticalLabel = document.createElement("label");
    criticalLabel.dataset.taskMetaControl = "true";
    criticalLabel.innerHTML = `<span>クリティカルパス</span><select id="editCriticalChoice"><option value="auto">自動判定（期間・依存関係）</option><option value="yes">手動でクリティカルに追加</option></select>`;

    category.closest("label").insertAdjacentElement("afterend", criticalLabel);
    category.closest("label").insertAdjacentElement("afterend", typeLabel);
    setupCategorySelect();
  }

  function syncEditorControls() {
    addEditorControls();
    const taskId = document.querySelector("#editTaskId")?.value;
    if (!taskId) return;
    const task = loadState()?.tasks?.find((item) => item.id === taskId);
    const milestone = document.querySelector("#editMilestoneChoice");
    const critical = document.querySelector("#editCriticalChoice");
    if (milestone) milestone.value = task?.milestone ? "yes" : "no";
    if (critical) critical.value = manualCriticalIds().has(taskId) ? "yes" : "auto";
    const category = document.querySelector("#editCategory");
    if (category && task?.category) category.value = task.category;
    setupCategorySelect();
    syncMilestoneDates();
  }

  function syncMilestoneDates() {
    const milestone = document.querySelector("#editMilestoneChoice")?.value === "yes";
    const start = document.querySelector("#editStart");
    const end = document.querySelector("#editEnd");
    if (!start || !end) return;
    if (milestone && end.value) start.value = end.value;
    start.disabled = milestone;
    start.closest("label")?.classList.toggle("milestone-date-locked", milestone);
  }

  function saveEditorControls() {
    const dialog = document.querySelector("#taskDialog");
    if (dialog?.open) return;

    const taskId = document.querySelector("#editTaskId")?.value;
    const milestone = document.querySelector("#editMilestoneChoice")?.value === "yes";
    const critical = document.querySelector("#editCriticalChoice")?.value === "yes";
    const state = loadState();
    const task = state?.tasks?.find((item) => item.id === taskId);
    if (!task) return;

    task.milestone = milestone;
    if (milestone) task.start = task.end;
    localStorage.setItem(storageKey, JSON.stringify(state));

    const manualIds = manualCriticalIds();
    if (critical) manualIds.add(taskId);
    else manualIds.delete(taskId);
    saveManualCriticalIds(manualIds);
    location.reload();
  }

  function decorateManualCritical() {
    const manualIds = manualCriticalIds();
    if (!manualIds.size) return;

    document.querySelectorAll("#taskTable tr").forEach((row) => {
      const id = row.children[1]?.textContent?.trim();
      if (!manualIds.has(id)) return;
      row.classList.add("critical-row");
      const bufferCell = row.lastElementChild;
      if (bufferCell) bufferCell.textContent = "Critical（指定）";
    });

    document.querySelectorAll(".task-bar .bar-text").forEach((label) => {
      if (manualIds.has(label.textContent.trim())) label.closest(".task-bar")?.classList.add("critical");
    });

    const state = loadState();
    const list = document.querySelector("#criticalPath");
    if (!state?.tasks || !list) return;
    const existing = list.textContent;
    state.tasks
      .filter((task) => manualIds.has(task.id) && !["完了", "承認済"].includes(task.status) && !existing.includes(task.id))
      .forEach((task) => {
        const item = document.createElement("li");
        item.dataset.manualCritical = task.id;
        item.innerHTML = `<strong>${escapeHtml(task.name)}</strong><span>${escapeHtml(task.id)} / ${escapeHtml(task.panel || "ALL")} / ${escapeHtml(task.start)} - ${escapeHtml(task.end)} / 手動指定</span><p>${escapeHtml(task.nextAction || task.impact || "-")}</p>`;
        list.appendChild(item);
      });
  }

  function scheduleDecorate() {
    if (decorateScheduled) return;
    decorateScheduled = true;
    requestAnimationFrame(() => {
      decorateScheduled = false;
      decorateManualCritical();
    });
  }

  function csvCell(value) {
    const text = String(value ?? "");
    return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  }

  function downloadTasksCsv() {
    const tasks = loadState()?.tasks || [];
    const manualIds = manualCriticalIds();
    const headers = ["id", "name", "category", "panel", "start", "end", "depends", "owner", "reviewer", "status", "priority", "milestone", "critical_override", "deliverable", "done_criteria", "blocker", "next_action", "updated", "impact", "risk"];
    const rows = tasks.map((task) => [
      task.id, task.name, task.category, task.panel, task.start, task.end,
      Array.isArray(task.depends) ? task.depends.join("|") : task.depends,
      task.owner, task.reviewer, task.status, task.priority,
      task.milestone ? "yes" : "no", manualIds.has(task.id) ? "yes" : "no",
      task.deliverable, task.doneCriteria, task.blocker, task.nextAction,
      task.updated, task.impact, task.risk,
    ]);
    const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `panel-production-tasks-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function parseCsvRows(text) {
    const rows = [];
    let row = [];
    let cell = "";
    let quoted = false;
    for (let index = 0; index < text.length; index += 1) {
      const char = text[index];
      const next = text[index + 1];
      if (char === '"' && quoted && next === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        quoted = !quoted;
      } else if (char === "," && !quoted) {
        row.push(cell.trim());
        cell = "";
      } else if ((char === "\n" || char === "\r") && !quoted) {
        if (char === "\r" && next === "\n") index += 1;
        row.push(cell.trim());
        if (row.some(Boolean)) rows.push(row);
        row = [];
        cell = "";
      } else {
        cell += char;
      }
    }
    row.push(cell.trim());
    if (row.some(Boolean)) rows.push(row);
    return rows;
  }

  async function restoreManualCriticalFromCsv(file) {
    const rows = parseCsvRows(await file.text());
    const headers = rows.shift()?.map((header) => header.replace(/^\uFEFF/, "").toLowerCase()) || [];
    const idIndex = headers.indexOf("id");
    const criticalIndex = headers.indexOf("critical_override");
    if (idIndex < 0 || criticalIndex < 0) return;
    const ids = rows
      .filter((row) => ["yes", "true", "1", "y", "はい", "指定する"].includes(String(row[criticalIndex]).toLowerCase()))
      .map((row) => row[idIndex])
      .filter(Boolean);
    saveManualCriticalIds(new Set(ids));
    scheduleDecorate();
  }

  document.addEventListener("DOMContentLoaded", () => {
    addEditorControls();
    refreshCategoryCaption();
    scheduleDecorate();

    document.querySelector("#taskForm")?.addEventListener("submit", syncMilestoneDates, true);
    document.querySelector("#taskForm")?.addEventListener("submit", () => setTimeout(saveEditorControls, 50));
    document.querySelector("#taskTable")?.addEventListener("click", () => setTimeout(syncEditorControls, 0));
    document.querySelector("#addTaskButton")?.addEventListener("click", () => setTimeout(syncEditorControls, 0));
    document.querySelector("#editMilestoneChoice")?.addEventListener("change", syncMilestoneDates);
    document.querySelector("#editEnd")?.addEventListener("input", syncMilestoneDates);
    document.querySelector("#addCategoryButton")?.addEventListener("click", addCategory);
    document.querySelector("#newCategoryName")?.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      addCategory();
    });

    document.querySelector("#downloadCsvButton")?.addEventListener("click", (event) => {
      event.stopImmediatePropagation();
      downloadTasksCsv();
    }, true);

    document.querySelector("#csvInput")?.addEventListener("change", async (event) => {
      const [file] = event.target.files || [];
      if (!file) return;
      await restoreManualCriticalFromCsv(file);
    }, true);

    new MutationObserver(scheduleDecorate).observe(document.querySelector("main"), { childList: true, subtree: true });
  });

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
})();
