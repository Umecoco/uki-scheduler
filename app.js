const projectDeadline = parseDate("2026-09-30");
const projectToday = parseDate("2026-06-02");
const storageKey = "uki-scheduler-panel-production-v1";
const taskSchemaVersion = 3;
const panelSchemaVersion = 2;
const statusOptions = ["未着手", "作業中", "確認待ち", "修正中", "承認済", "完了", "保留", "遅延"];
const priorityOptions = ["高", "中", "低"];
const defaultMembers = ["designer_a", "designer_b", "writer_a", "writer_b", "writer_c", "writer_d", "chief_a", "chief_b", "未設定"];
const doneStatuses = new Set(["承認済", "完了"]);
const riskStatuses = new Set(["遅延", "保留"]);
const dayMs = 24 * 60 * 60 * 1000;
const fmt = new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric" });

let allTasks = [];
let sampleTasks = [];
let panels = defaultPanels();
let members = [...defaultMembers];
let analysis = new Map();

const els = {
  csvInput: q("#csvInput"), downloadCsvButton: q("#downloadCsvButton"), downloadPanelsButton: q("#downloadPanelsButton"), resetButton: q("#resetButton"), addPanelButton: q("#addPanelButton"), addTaskButton: q("#addTaskButton"), newMemberName: q("#newMemberName"), addMemberButton: q("#addMemberButton"), memberCaption: q("#memberCaption"), memberList: q("#memberList"), ownerFilter: q("#ownerFilter"), panelFilter: q("#panelFilter"), statusFilter: q("#statusFilter"), criticalOnly: q("#criticalOnly"), ganttChart: q("#ganttChart"), projectRange: q("#projectRange"), overallProgress: q("#overallProgress"), completedPanelCount: q("#completedPanelCount"), thisWeekCount: q("#thisWeekCount"), delayedCount: q("#delayedCount"), waitingCount: q("#waitingCount"), chartCaption: q("#chartCaption"), criticalCaption: q("#criticalCaption"), criticalPath: q("#criticalPath"), milestoneList: q("#milestoneList"), panelBoard: q("#panelBoard"), blockerCaption: q("#blockerCaption"), blockerList: q("#blockerList"), reviewCaption: q("#reviewCaption"), reviewList: q("#reviewList"), taskTable: q("#taskTable"), emptyTemplate: q("#emptyTemplate"), taskDialog: q("#taskDialog"), taskForm: q("#taskForm"), dialogTitle: q("#dialogTitle"), closeDialogButton: q("#closeDialogButton"), cancelTaskButton: q("#cancelTaskButton"), deleteTaskButton: q("#deleteTaskButton"), editTaskId: q("#editTaskId"), editName: q("#editName"), editCategory: q("#editCategory"), editPanel: q("#editPanel"), editOwner: q("#editOwner"), editReviewer: q("#editReviewer"), editStatus: q("#editStatus"), editStart: q("#editStart"), editEnd: q("#editEnd"), editPriority: q("#editPriority"), editDepends: q("#editDepends"), editDeliverable: q("#editDeliverable"), editUpdated: q("#editUpdated"), editDoneCriteria: q("#editDoneCriteria"), editBlocker: q("#editBlocker"), editNextAction: q("#editNextAction"), editImpact: q("#editImpact"), editRisk: q("#editRisk")
};

const reviews = [
  ["構成案レビュー", "ALL", "chief_a", "2026-06-14", "2026-06-17", "未着手"],
  ["前半パネル初稿レビュー", "P01|P02|P03|P04|P05", "chief_a", "2026-07-21", "2026-07-25", "未着手"],
  ["後半パネル初稿レビュー", "P06|P07|P08|P09|P10", "chief_b", "2026-08-19", "2026-08-23", "未着手"],
  ["全体レビュー", "ALL", "chief_a|chief_b", "2026-08-24", "2026-09-04", "未着手"],
  ["最終承認", "ALL", "chief_a", "2026-09-16", "2026-09-18", "未着手"]
];

function q(selector) { return document.querySelector(selector); }
function p(id, title, message, mockup, designer, writer, panelTextStatus, scriptStatus, imageStatus, designStatus, approvalStatus, note, blocker) { return { id, title, message, mockup, designer, writer, panelTextStatus, scriptStatus, imageStatus, designStatus, approvalStatus, note, blocker }; }
function defaultPanels() { return [
  p("P01", "事業全体像", "顧客課題から提供価値までを一枚で掴ませる", "製品UI全体の操作モック", "designer_a", "writer_a", "未着手", "未着手", "確認待ち", "未着手", "未着手", "冒頭で使う基準パネル", "主メッセージの粒度"),
  p("P02", "技術の強み", "競合との差分を技術要素で説明する", "技術デモ画面の静止モック", "designer_a", "writer_a", "未着手", "未着手", "確認待ち", "未着手", "未着手", "図解中心", "素材候補不足"),
  p("P03", "導入効果", "toB顧客にとっての効果を定量・定性で示す", "", "designer_a", "writer_b", "未着手", "未着手", "未着手", "未着手", "未着手", "数値の扱い注意", ""),
  p("P04", "利用シーン", "お客の現場でどう使われるかを具体化する", "現場利用イメージの簡易モック", "designer_a", "writer_b", "未着手", "未着手", "保留", "未着手", "未着手", "写真が必要", "掲載可能写真の確認"),
  p("P05", "導入プロセス", "検討から運用開始までの流れを説明する", "", "designer_a", "writer_c", "未着手", "未着手", "未着手", "未着手", "未着手", "フロー図候補", ""),
  p("P06", "事例紹介", "実績から信頼感を作る", "事例紹介用の匿名化画面モック", "designer_b", "writer_c", "未着手", "未着手", "確認待ち", "未着手", "未着手", "匿名化が必要", "事例画像の権利確認"),
  p("P07", "運用体制", "導入後の支援体制を安心材料として見せる", "", "designer_b", "writer_d", "未着手", "未着手", "未着手", "未着手", "未着手", "組織図を検討", ""),
  p("P08", "将来展開", "今後の拡張性と事業の伸びを伝える", "将来画面のコンセプトモック", "designer_b", "writer_d", "未着手", "未着手", "未着手", "未着手", "未着手", "抽象度高め", ""),
  p("P09", "FAQ", "説明員が質問対応しやすい論点を整理する", "", "designer_b", "writer_a", "未着手", "未着手", "未着手", "未着手", "未着手", "原稿と連動", ""),
  p("P10", "クロージング", "次アクションにつながる締めを作る", "", "designer_b", "writer_d", "未着手", "未着手", "未着手", "未着手", "未着手", "連絡先表記確認", ""),
  p("P11", "追加パネル", "", "", "未設定", "未設定", "未着手", "未着手", "未着手", "未着手", "未着手", "", "")
]; }

function parseDate(value) { const date = new Date(`${value}T00:00:00`); if (Number.isNaN(date.getTime())) throw new Error(`日付を読み取れません: ${value}`); return date; }
function toIso(date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
function daysBetween(a, b) { return Math.round((new Date(b.getFullYear(), b.getMonth(), b.getDate()) - new Date(a.getFullYear(), a.getMonth(), a.getDate())) / dayMs); }
function addDays(date, days) { const next = new Date(date); next.setDate(next.getDate() + days); return next; }
function splitList(value) { return String(value || "").split(/[|;]/).map((item) => item.trim()).filter(Boolean); }
function html(value) { return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }
function attr(value) { return html(value).replaceAll("`", "&#096;"); }
function unique(values) { return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, "ja")); }
function csvCell(value) { const text = String(value ?? ""); return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text; }
function statusClass(status) { if (doneStatuses.has(status)) return "done"; if (status === "遅延") return "late"; if (status === "確認待ち") return "wait"; if (riskStatuses.has(status)) return "risk"; if (status === "作業中" || status === "修正中") return "active"; return ""; }
function isWeekend(date) { return date.getDay() === 0 || date.getDay() === 6; }
function sortedTasks(tasks) { return [...tasks].sort((a, b) => a.start - b.start || a.end - b.end || a.id.localeCompare(b.id, "ja", { numeric: true })); }

function parseCsv(text) {
  const rows = []; let row = []; let cell = ""; let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]; const next = text[i + 1];
    if (char === '"' && quoted && next === '"') { cell += '"'; i += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { row.push(cell.trim()); cell = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) { if (char === "\r" && next === "\n") i += 1; row.push(cell.trim()); if (row.some(Boolean)) rows.push(row); row = []; cell = ""; }
    else cell += char;
  }
  row.push(cell.trim()); if (row.some(Boolean)) rows.push(row);
  const headers = rows.shift().map((header) => header.toLowerCase());
  return rows.map((values) => normalizeTask(Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]))));
}
function normalizeTask(item) {
  const start = parseDate(item.start); const end = parseDate(item.end); const milestone = ["yes", "true", "1", "y", "はい"].includes(String(item.milestone).toLowerCase());
  return { id: item.id, name: item.name, category: item.category || (milestone ? "マイルストーン" : "タスク"), panel: item.panel || "ALL", start, end, depends: splitList(item.depends), owner: item.owner || "未設定", reviewer: item.reviewer || "未設定", status: item.status || "未着手", priority: item.priority || "中", milestone, deliverable: item.deliverable || "", doneCriteria: item.done_criteria || item.doneCriteria || "", blocker: item.blocker || "", nextAction: item.next_action || item.nextAction || "", updated: item.updated || "", impact: item.impact || "", risk: item.risk || "", duration: Math.max(1, daysBetween(start, end) + 1) };
}
function analyzeTasks(tasks) {
  const byId = new Map(tasks.map((task) => [task.id, task])); const successors = new Map(tasks.map((task) => [task.id, []]));
  tasks.forEach((task) => task.depends.forEach((depId) => { if (byId.has(depId)) successors.get(depId).push(task.id); }));
  const order = []; const visiting = new Set(); const visited = new Set();
  function visit(id) { if (visited.has(id) || !byId.has(id)) return; if (visiting.has(id)) throw new Error(`依存関係が循環しています: ${id}`); visiting.add(id); byId.get(id).depends.forEach(visit); visiting.delete(id); visited.add(id); order.push(id); }
  tasks.forEach((task) => visit(task.id));
  const result = new Map();
  order.forEach((id) => { const task = byId.get(id); const es = Math.max(0, ...task.depends.filter((depId) => result.has(depId)).map((depId) => result.get(depId).ef)); result.set(id, { es, ef: es + task.duration, ls: 0, lf: 0, slack: 0, critical: false, successors: successors.get(id) }); });
  const projectDuration = Math.max(0, ...Array.from(result.values()).map((item) => item.ef));
  [...order].reverse().forEach((id) => { const item = result.get(id); const nextIds = successors.get(id); item.lf = nextIds.length ? Math.min(...nextIds.map((nextId) => result.get(nextId).ls)) : projectDuration; item.ls = item.lf - byId.get(id).duration; item.slack = item.ls - item.es; item.critical = item.slack === 0; });
  return result;
}

function refreshMembersFromData() { members = unique([...defaultMembers, ...members, ...allTasks.flatMap((task) => [...splitList(task.owner), ...splitList(task.reviewer)]), ...panels.flatMap((item) => [item.designer, item.writer])]); }
function renderMemberOptions() { els.memberList.innerHTML = members.map((name) => `<option value="${attr(name)}"></option>`).join(""); els.memberCaption.textContent = `${members.length}人の候補`; }
function fillSelect(select, values) { const current = select.value; select.innerHTML = values.map((value) => `<option value="${attr(value)}">${html(value)}</option>`).join(""); if (values.includes(current)) select.value = current; }
function populateFilters() { refreshMembersFromData(); fillSelect(els.ownerFilter, ["すべて", ...unique(allTasks.flatMap((task) => splitList(task.owner)))]); fillSelect(els.panelFilter, ["すべて", ...unique(["ALL", ...panels.map((item) => item.id), ...allTasks.flatMap((task) => splitList(task.panel))])]); fillSelect(els.statusFilter, ["すべて", ...unique(allTasks.map((task) => task.status))]); renderMemberOptions(); }
function filteredTasks() { return allTasks.filter((task) => { const meta = analysis.get(task.id); return (els.ownerFilter.value === "すべて" || splitList(task.owner).includes(els.ownerFilter.value)) && (els.panelFilter.value === "すべて" || task.panel === "ALL" || splitList(task.panel).includes(els.panelFilter.value)) && (els.statusFilter.value === "すべて" || task.status === els.statusFilter.value) && (!els.criticalOnly.checked || meta?.critical); }); }
function refreshAnalysisAndRender() { analysis = analyzeTasks(allTasks); populateFilters(); render(); }

function render() { const tasks = sortedTasks(filteredTasks()); renderSummary(); renderGantt(tasks); renderCriticalPath(); renderMilestones(); renderPanels(); renderBlockers(); renderReviews(); renderTable(tasks); }
function renderSummary() { const workTasks = allTasks.filter((task) => !task.milestone); const completedTasks = workTasks.filter((task) => doneStatuses.has(task.status)); els.projectRange.textContent = toIso(projectDeadline); els.overallProgress.textContent = `${Math.round((completedTasks.length / Math.max(1, workTasks.length)) * 100)}%`; els.completedPanelCount.textContent = `${panels.filter((item) => item.approvalStatus === "承認済" || item.designStatus === "完了").length}/${panels.length}枚`; els.thisWeekCount.textContent = `${allTasks.filter((task) => { const diff = daysBetween(projectToday, task.end); return diff >= 0 && diff <= 7; }).length}件`; els.delayedCount.textContent = `${allTasks.filter((task) => task.status === "遅延" || (task.end < projectToday && !doneStatuses.has(task.status))).length}件`; els.waitingCount.textContent = `${allTasks.filter((task) => task.status === "確認待ち").length}件`; }
function renderGantt(tasks) {
  if (!tasks.length) { renderEmpty(els.ganttChart); return; }
  const minDate = new Date(Math.min(...allTasks.map((task) => task.start))); const maxDate = new Date(Math.max(...allTasks.map((task) => task.end))); const totalDays = daysBetween(minDate, maxDate) + 1; const dates = Array.from({ length: totalDays }, (_, index) => addDays(minDate, index));
  els.chartCaption.textContent = `${totalDays}日間 / ${tasks.length}件を表示`; const grid = document.createElement("div"); grid.className = "gantt-grid"; grid.style.setProperty("--days", totalDays); grid.innerHTML = `<div class="date-cell task-label">タスク</div>`;
  dates.forEach((date) => grid.insertAdjacentHTML("beforeend", `<div class="date-cell${isWeekend(date) ? " weekend" : ""}${toIso(date) === toIso(projectToday) ? " today" : ""}">${fmt.format(date)}</div>`));
  tasks.forEach((task) => { const meta = analysis.get(task.id); const left = daysBetween(minDate, task.start); const width = Math.max(1, daysBetween(task.start, task.end) + 1); grid.insertAdjacentHTML("beforeend", `<div class="task-label"><strong>${html(task.name)}</strong><span>${html(task.panel)} / ${html(task.owner)} / ${html(task.status)}</span></div>`); const row = document.createElement("div"); row.className = "timeline-row"; row.innerHTML = dates.map((date) => `<div class="gantt-cell${isWeekend(date) ? " weekend" : ""}"></div>`).join(""); row.insertAdjacentHTML("beforeend", `<div class="task-bar${meta.critical ? " critical" : ""}${task.milestone ? " milestone" : ""}${task.status === "遅延" ? " late" : ""}" style="left:calc(${left} * 100% / ${totalDays});${task.milestone ? "" : `width:calc(${width} * 100% / ${totalDays});`}" title="${attr(task.name)}">${task.milestone ? "" : `<span class="bar-text">${html(task.id)}</span>`}</div>`); grid.appendChild(row); });
  els.ganttChart.innerHTML = ""; els.ganttChart.appendChild(grid);
}
function renderCriticalPath() { const critical = allTasks.filter((task) => analysis.get(task.id)?.critical); const risky = critical.filter((task) => !doneStatuses.has(task.status)); els.criticalCaption.textContent = risky.length ? `${risky.length}件 / ${critical.map((task) => task.id).join(" → ")}` : "該当なし"; els.criticalPath.innerHTML = risky.map((task) => `<li><strong>${html(task.name)}</strong><span>${html(task.id)} / ${html(task.panel)} / ${toIso(task.start)} - ${toIso(task.end)} / バッファ${analysis.get(task.id).slack}日</span><p>${html(task.nextAction || task.impact || "-")}</p></li>`).join(""); }
function renderMilestones() { els.milestoneList.innerHTML = allTasks.filter((task) => task.milestone).map((task) => { const meta = analysis.get(task.id); return `<div class="milestone-item"><strong>${html(task.name)}</strong><span>${toIso(task.end)} / 責任者: ${html(task.owner)} / 関連: ${html(task.panel)}</span><span>${html(task.doneCriteria)}</span><span class="badge ${meta.critical ? "critical" : ""}">${meta.critical ? "Critical" : `${meta.slack}日余裕`}</span></div>`; }).join(""); }
function statusSelect(panelId, label, field, status) { return `<label class="status-pill ${statusClass(status)}"><b>${html(label)}</b><select data-panel-id="${attr(panelId)}" data-panel-field="${attr(field)}">${statusOptions.map((value) => `<option value="${attr(value)}"${value === status ? " selected" : ""}>${html(value)}</option>`).join("")}</select></label>`; }
function renderPanels() { refreshMembersFromData(); renderMemberOptions(); els.panelBoard.innerHTML = panels.map((item) => { const statuses = [item.panelTextStatus, item.scriptStatus, item.imageStatus, item.designStatus, item.approvalStatus]; const progress = Math.round((statuses.filter((status) => doneStatuses.has(status)).length / statuses.length) * 100); return `<article class="panel-card"><div class="panel-card-head"><strong>${html(item.id)}</strong><div class="toolbar"><span class="badge">${progress}%</span><button class="small-button danger-button" type="button" data-delete-panel="${attr(item.id)}">削除</button></div></div><label class="panel-field"><span>タイトル</span><input data-panel-id="${attr(item.id)}" data-panel-field="title" value="${attr(item.title)}" /></label><label class="panel-field"><span>主メッセージ</span><textarea data-panel-id="${attr(item.id)}" data-panel-field="message">${html(item.message)}</textarea></label><label class="panel-field"><span>モックアップ</span><textarea data-panel-id="${attr(item.id)}" data-panel-field="mockup">${html(item.mockup || "")}</textarea></label><div class="mini-meta"><label>デザイン <input data-panel-id="${attr(item.id)}" data-panel-field="designer" list="memberList" value="${attr(item.designer)}" /></label><label>原稿 <input data-panel-id="${attr(item.id)}" data-panel-field="writer" list="memberList" value="${attr(item.writer)}" /></label></div><div class="status-grid">${statusSelect(item.id, "掲載文", "panelTextStatus", item.panelTextStatus)}${statusSelect(item.id, "原稿", "scriptStatus", item.scriptStatus)}${statusSelect(item.id, "画像", "imageStatus", item.imageStatus)}${statusSelect(item.id, "デザイン", "designStatus", item.designStatus)}${statusSelect(item.id, "承認", "approvalStatus", item.approvalStatus)}</div><label class="panel-field"><span>備考</span><textarea data-panel-id="${attr(item.id)}" data-panel-field="note">${html(item.note)}</textarea></label><label class="panel-field blocker-note"><span>ブロッカー</span><textarea data-panel-id="${attr(item.id)}" data-panel-field="blocker">${html(item.blocker)}</textarea></label></article>`; }).join(""); }
function renderBlockers() { const blockedTasks = allTasks.filter((task) => task.blocker); const blockedPanels = panels.filter((item) => item.blocker); els.blockerCaption.textContent = `${blockedTasks.length + blockedPanels.length}件`; els.blockerList.innerHTML = [...blockedTasks.map((task) => `<div class="blocker-item"><strong>${html(task.id)} ${html(task.name)}</strong><span>${html(task.blocker)}</span><p>${html(task.nextAction)}</p></div>`), ...blockedPanels.map((item) => `<div class="blocker-item"><strong>${html(item.id)} ${html(item.title)}</strong><span>${html(item.blocker)}</span><p>${html(item.note)}</p></div>`)].join(""); }
function renderReviews() { els.reviewCaption.textContent = `${reviews.filter((item) => item[5] === "確認待ち" || item[5] === "未着手").length}件が未完了`; els.reviewList.innerHTML = reviews.map((item) => `<div class="review-item"><strong>${html(item[0])}</strong><span>${html(item[1])} / 確認者: ${html(item[2])}</span><span>依頼: ${html(item[3])} / 期限: ${html(item[4])}</span><span class="badge ${statusClass(item[5])}">${html(item[5])}</span></div>`).join(""); }
function renderTable(tasks) { els.taskTable.innerHTML = tasks.length ? tasks.map((task) => { const meta = analysis.get(task.id); return `<tr class="${meta.critical ? "critical-row" : ""}"><td><button class="small-button" type="button" data-edit-task="${attr(task.id)}">編集</button></td><td>${html(task.id)}</td><td>${html(task.name)}</td><td>${html(task.category)}</td><td>${html(task.panel)}</td><td>${html(task.owner)}</td><td>${html(task.reviewer)}</td><td>${toIso(task.start)} - ${toIso(task.end)}</td><td><span class="badge ${statusClass(task.status)}">${html(task.status)}</span></td><td>${html(task.priority)}</td><td>${html(task.depends.join(", ") || "-")}</td><td>${html(task.blocker || "-")}</td><td>${html(task.nextAction || "-")}</td><td>${meta.critical ? "Critical" : `${meta.slack}日`}</td></tr>`; }).join("") : `<tr><td colspan="14">表示できるタスクがありません</td></tr>`; }
function renderEmpty(target) { target.innerHTML = ""; target.appendChild(els.emptyTemplate.content.cloneNode(true)); }

function createBlankPanel(id) { return p(id, "新規パネル", "", "", "未設定", "未設定", "未着手", "未着手", "未着手", "未着手", "未着手", "", ""); }
function nextPanelId() { const max = Math.max(0, ...panels.map((item) => Number(item.id.replace(/^P/i, ""))).filter(Number.isFinite)); return `P${String(max + 1).padStart(2, "0")}`; }
function addPanel() { panels.push(createBlankPanel(nextPanelId())); saveLocalState(); render(); }
function deletePanel(panelId) { const item = panels.find((panelItem) => panelItem.id === panelId); if (!item || !confirm(`${item.id} ${item.title || "このパネル"}を削除しますか？`)) return; panels = panels.filter((panelItem) => panelItem.id !== panelId); saveLocalState(); render(); }
function nextTaskId() { const max = Math.max(0, ...allTasks.filter((task) => /^T\d+$/i.test(task.id)).map((task) => Number(task.id.replace(/^T/i, ""))).filter(Number.isFinite)); return `T${String(max + 1).padStart(3, "0")}`; }
function addTask() { const id = nextTaskId(); const start = toIso(projectToday); const end = toIso(addDays(projectToday, 7)); allTasks.push(normalizeTask({ id, name: "新規タスク", category: "タスク", panel: "ALL", start, end, depends: "", owner: "未設定", reviewer: "未設定", status: "未着手", priority: "中", milestone: "no", deliverable: "", done_criteria: "", blocker: "", next_action: "", updated: start, impact: "", risk: "" })); refreshAnalysisAndRender(); saveLocalState(); openTaskEditor(id); }
function addMember() { const name = els.newMemberName.value.trim(); if (!name) return; members = unique([...members, name]); els.newMemberName.value = ""; saveLocalState(); populateFilters(); }
function deleteCurrentTask() { const taskId = els.editTaskId.value; const task = allTasks.find((item) => item.id === taskId); if (!task || !confirm(`${task.id} ${task.name || "このタスク"}を削除しますか？`)) return; allTasks = allTasks.filter((item) => item.id !== taskId); allTasks.forEach((item) => { item.depends = item.depends.filter((depId) => depId !== taskId); }); refreshAnalysisAndRender(); saveLocalState(); els.taskDialog.close(); }

function mergeMissingSampleTasks(state) { if (state.taskSchemaVersion >= taskSchemaVersion) return; const existingIds = new Set(allTasks.map((task) => task.id)); allTasks.push(...sampleTasks.filter((task) => !existingIds.has(task.id))); }
function ensurePanelMigration(state) { if (state.panelSchemaVersion >= panelSchemaVersion) return; if (!panels.some((item) => item.id === "P11")) panels.push(createBlankPanel("P11")); }
function saveLocalState() { localStorage.setItem(storageKey, JSON.stringify({ tasks: allTasks.map((task) => ({ ...task, start: toIso(task.start), end: toIso(task.end) })), panels, members, panelSchemaVersion, taskSchemaVersion })); }
function loadLocalState() { const raw = localStorage.getItem(storageKey); if (!raw) return false; try { const state = JSON.parse(raw); allTasks = state.tasks.map((task) => normalizeTask({ ...task, start: task.start, end: task.end, depends: Array.isArray(task.depends) ? task.depends.join("|") : task.depends, milestone: task.milestone ? "yes" : "no", done_criteria: task.doneCriteria, next_action: task.nextAction })); if (Array.isArray(state.panels)) panels = state.panels; if (Array.isArray(state.members)) members = state.members; ensurePanelMigration(state); mergeMissingSampleTasks(state); refreshAnalysisAndRender(); saveLocalState(); return true; } catch { localStorage.removeItem(storageKey); return false; } }
function loadCsv(text) { allTasks = parseCsv(text); refreshAnalysisAndRender(); saveLocalState(); }
async function loadInitial() { try { sampleTasks = parseCsv(await (await fetch("sample-schedule.csv", { cache: "no-store" })).text()); } catch { sampleTasks = [normalizeTask({ id: "T001", name: "新規タスク", category: "タスク", panel: "ALL", start: "2026-06-03", end: "2026-06-10", owner: "未設定", reviewer: "未設定", status: "未着手", priority: "中", milestone: "no" })]; } if (!loadLocalState()) { allTasks = sampleTasks.map((task) => ({ ...task })); refreshAnalysisAndRender(); saveLocalState(); } }
function downloadCsvFile(headers, rows, filename) { const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n"); const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url); }
function downloadTasksCsv() { downloadCsvFile(["id", "name", "category", "panel", "start", "end", "depends", "owner", "reviewer", "status", "priority", "milestone", "deliverable", "done_criteria", "blocker", "next_action", "updated", "impact", "risk"], allTasks.map((task) => [task.id, task.name, task.category, task.panel, toIso(task.start), toIso(task.end), task.depends.join("|"), task.owner, task.reviewer, task.status, task.priority, task.milestone ? "yes" : "no", task.deliverable, task.doneCriteria, task.blocker, task.nextAction, task.updated, task.impact, task.risk]), `panel-production-tasks-${toIso(new Date())}.csv`); }
function downloadPanelsCsv() { downloadCsvFile(["panel_id", "title", "message", "mockup", "designer", "writer", "panel_text_status", "script_status", "image_status", "design_status", "approval_status", "note", "blocker"], panels.map((item) => [item.id, item.title, item.message, item.mockup || "", item.designer, item.writer, item.panelTextStatus, item.scriptStatus, item.imageStatus, item.designStatus, item.approvalStatus, item.note, item.blocker]), `panel-production-panels-${toIso(new Date())}.csv`); }

function openTaskEditor(taskId) { const task = allTasks.find((item) => item.id === taskId); if (!task) return; els.dialogTitle.textContent = `${task.id} ${task.name}`; els.editTaskId.value = task.id; els.editName.value = task.name; els.editCategory.value = task.category; els.editPanel.value = task.panel; els.editOwner.value = task.owner; els.editReviewer.value = task.reviewer; els.editStatus.value = task.status; els.editStart.value = toIso(task.start); els.editEnd.value = toIso(task.end); els.editPriority.value = task.priority; els.editDepends.value = task.depends.join("|"); els.editDeliverable.value = task.deliverable; els.editUpdated.value = task.updated || toIso(projectToday); els.editDoneCriteria.value = task.doneCriteria; els.editBlocker.value = task.blocker; els.editNextAction.value = task.nextAction; els.editImpact.value = task.impact; els.editRisk.value = task.risk; els.taskDialog.showModal(); }
function saveTaskFromDialog() { const task = allTasks.find((item) => item.id === els.editTaskId.value); if (!task) return; const start = parseDate(els.editStart.value); const end = parseDate(els.editEnd.value); Object.assign(task, { name: els.editName.value.trim(), category: els.editCategory.value.trim(), panel: els.editPanel.value.trim() || "ALL", owner: els.editOwner.value.trim() || "未設定", reviewer: els.editReviewer.value.trim() || "未設定", status: els.editStatus.value, start, end, priority: els.editPriority.value, depends: splitList(els.editDepends.value), deliverable: els.editDeliverable.value.trim(), updated: els.editUpdated.value, doneCriteria: els.editDoneCriteria.value.trim(), blocker: els.editBlocker.value.trim(), nextAction: els.editNextAction.value.trim(), impact: els.editImpact.value.trim(), risk: els.editRisk.value.trim(), duration: Math.max(1, daysBetween(start, end) + 1) }); refreshAnalysisAndRender(); saveLocalState(); els.taskDialog.close(); }

fillSelect(els.editStatus, statusOptions); fillSelect(els.editPriority, priorityOptions);
els.csvInput.addEventListener("change", async (event) => { const [file] = event.target.files; if (file) loadCsv(await file.text()); });
els.resetButton.addEventListener("click", () => { if (!confirm("保存済みの編集内容を消してサンプルに戻しますか？")) return; els.csvInput.value = ""; localStorage.removeItem(storageKey); allTasks = sampleTasks.map((task) => ({ ...task })); panels = defaultPanels(); members = [...defaultMembers]; refreshAnalysisAndRender(); saveLocalState(); });
els.downloadCsvButton.addEventListener("click", downloadTasksCsv); els.downloadPanelsButton.addEventListener("click", downloadPanelsCsv); els.addPanelButton.addEventListener("click", addPanel); els.addTaskButton.addEventListener("click", addTask); els.addMemberButton.addEventListener("click", addMember); els.newMemberName.addEventListener("keydown", (event) => { if (event.key === "Enter") { event.preventDefault(); addMember(); } });
els.taskTable.addEventListener("click", (event) => { const button = event.target.closest("[data-edit-task]"); if (button) openTaskEditor(button.dataset.editTask); });
els.taskForm.addEventListener("submit", (event) => { event.preventDefault(); saveTaskFromDialog(); });
els.closeDialogButton.addEventListener("click", () => els.taskDialog.close()); els.cancelTaskButton.addEventListener("click", () => els.taskDialog.close()); els.deleteTaskButton.addEventListener("click", deleteCurrentTask);
els.panelBoard.addEventListener("input", (event) => { const field = event.target.dataset.panelField; const panelId = event.target.dataset.panelId; const item = panels.find((panelItem) => panelItem.id === panelId); if (item && field) { item[field] = event.target.value; saveLocalState(); renderSummary(); renderBlockers(); } });
els.panelBoard.addEventListener("change", (event) => { const field = event.target.dataset.panelField; const panelId = event.target.dataset.panelId; const item = panels.find((panelItem) => panelItem.id === panelId); if (item && field) { item[field] = event.target.value; saveLocalState(); render(); } });
els.panelBoard.addEventListener("click", (event) => { const button = event.target.closest("[data-delete-panel]"); if (button) deletePanel(button.dataset.deletePanel); });
[els.ownerFilter, els.panelFilter, els.statusFilter, els.criticalOnly].forEach((control) => control.addEventListener("change", render));
loadInitial();
