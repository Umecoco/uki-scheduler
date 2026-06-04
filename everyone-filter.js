(function () {
  const storageKey = "uki-scheduler-panel-production-v1";
  let selectedMember = "";
  let scheduled = false;
  function loadTasks() { try { return JSON.parse(localStorage.getItem(storageKey) || "null")?.tasks || []; } catch { return []; } }
  function matches(task) { const owners = String(task.owner || "").split("|").map((name) => name.trim()); return selectedMember === "全員" || owners.includes(selectedMember) || owners.includes("全員"); }
  function applyFilter() {
    if (!selectedMember) return;
    const byId = new Map(loadTasks().map((task) => [task.id, task])); let visibleCount = 0;
    document.querySelectorAll(".task-bar[data-task-id]").forEach((bar) => { const visible = matches(byId.get(bar.dataset.taskId) || {}); const row = bar.closest(".timeline-row"); if (row) row.hidden = !visible; if (row?.previousElementSibling?.classList.contains("task-label")) row.previousElementSibling.hidden = !visible; if (visible) visibleCount += 1; });
    document.querySelectorAll("#taskTable tr").forEach((row) => { const task = byId.get(row.children[1]?.textContent.trim()); if (task) row.hidden = !matches(task); });
    const caption = document.querySelector("#chartCaption"); if (caption) caption.textContent = caption.textContent.replace(/\/ \d+件を表示$/, `/ ${visibleCount}件を表示`);
  }
  function scheduleFilter() { if (scheduled) return; scheduled = true; requestAnimationFrame(() => { scheduled = false; applyFilter(); }); }
  function prepareFilter(event) {
    const ownerFilter = document.querySelector("#ownerFilter"); if (!ownerFilter) return;
    const selected = event.target === ownerFilter ? ownerFilter.value : selectedMember || ownerFilter.value;
    if (!selected || selected === "すべて") { selectedMember = ""; return; }
    selectedMember = selected; ownerFilter.value = "すべて";
    setTimeout(() => { ownerFilter.value = selected; scheduleFilter(); }, 0);
  }
  document.addEventListener("DOMContentLoaded", () => { document.addEventListener("change", prepareFilter, true); new MutationObserver(scheduleFilter).observe(document.querySelector("main"), { childList: true, subtree: true }); });
})();
