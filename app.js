const projectDeadline = parseDate("2026-09-30");
const projectToday = parseDate("2026-06-02");

const sampleCsv = `id,name,category,panel,start,end,depends,owner,reviewer,status,priority,milestone,deliverable,done_criteria,blocker,next_action,updated,impact,risk
T001,キックオフと役割確定,企画,ALL,2026-06-03,2026-06-05,,chief_a,chief_b,未着手,高,no,体制表,全員の役割と連絡経路が確定,,初回MTGを設定,2026-06-02,全工程の開始が遅れる,事業部参加者が未確定
T002,パネル構成案作成,企画,ALL,2026-06-06,2026-06-14,T001,chief_a,chief_b,未着手,高,no,構成案,10枚前後のタイトルと主メッセージが揃う,若手メンバー参加有無が未確定,構成案のたたきを作る,2026-06-02,後続の文章とデザインが止まる,意思決定者の稼働不足
M001,パネル構成案Fix,マイルストーン,ALL,2026-06-17,2026-06-17,T002,chief_a,chief_b,未着手,高,yes,構成Fix,全パネルの狙いと順番が承認される,,レビュー会を確保,2026-06-02,全パネル制作の開始遅延,承認遅れ
T003,掲載文章ドラフト作成,文章,P01|P02|P03,2026-06-18,2026-06-30,M001,writer_a,chief_a,未着手,高,no,掲載文ドラフト,各パネルの見出しと本文が仮置きされる,専門用語の粒度が未確定,事業部に用語確認を依頼,2026-06-02,初稿デザインが薄くなる,認識ずれ
T004,画像素材収集,素材,P01|P02|P03|P04|P05,2026-06-18,2026-07-04,M001,chief_b,chief_a,遅延,高,no,素材一覧,掲載候補画像と権利確認が揃う,画像の所在が不明な領域あり,不足素材の候補を洗い出す,2026-06-02,デザイン初稿と入稿品質に影響,素材不足
T005,パネル1-5デザイン初稿,デザイン,P01|P02|P03|P04|P05,2026-07-01,2026-07-18,T003|T004,designer_a,chief_a,未着手,高,no,Illustrator初稿,5枚分のレイアウトと掲載文が入る,,テンプレートを先行作成,2026-06-02,レビュー期間を圧迫,素材待ち
T006,説明原稿ドラフト前半,原稿,P01|P02|P03|P04|P05,2026-07-01,2026-07-21,T003,writer_b,chief_a,未着手,中,no,説明原稿前半,説明員が読める流れになっている,,パネル構成に沿って章立て,2026-06-02,説明品質に影響,パネル文との不整合
M002,前半パネル初稿レビュー完了,マイルストーン,P01|P02|P03|P04|P05,2026-07-25,2026-07-25,T005|T006,chief_a,chief_b,未着手,高,yes,レビュー結果,前半5枚と原稿の主要指摘が出揃う,,レビュー枠を仮押さえ,2026-06-02,後半制作への学びが遅れる,レビュー遅延
T007,掲載文章ドラフト後半,文章,P06|P07|P08|P09|P10,2026-07-15,2026-07-31,M001,writer_c,chief_a,未着手,高,no,掲載文ドラフト後半,後半パネルの見出しと本文が仮置きされる,,P6-P10の主メッセージを確認,2026-06-02,後半デザインが止まる,構成変更
T008,パネル6-10デザイン初稿,デザイン,P06|P07|P08|P09|P10,2026-08-01,2026-08-19,T004|T007,designer_b,chief_a,未着手,高,no,Illustrator初稿後半,5枚分のレイアウトと掲載文が入る,,前半テンプレートを流用,2026-06-02,全体レビューが遅れる,素材待ち
T009,説明原稿ドラフト後半,原稿,P06|P07|P08|P09|P10,2026-08-01,2026-08-22,T007,writer_d,chief_b,未着手,中,no,説明原稿後半,後半5枚の説明原稿が揃う,,説明時間を仮設定,2026-06-02,説明品質に影響,原稿とパネルの差分
M003,全パネル初稿完了,マイルストーン,ALL,2026-08-23,2026-08-23,T005|T008|T006|T009,chief_a,chief_b,未着手,高,yes,初稿一式,全パネルと説明原稿の初稿が揃う,,全体レビューを設定,2026-06-02,最終修正期間が削れる,初稿品質不足
T010,全体レビューと指摘整理,レビュー,ALL,2026-08-24,2026-09-04,M003,chief_a,chief_b,未着手,高,no,指摘一覧,パネルと原稿の指摘が優先度付きで整理される,,レビュー観点を配布,2026-06-02,修正工程が混乱,指摘の重複
T011,修正反映と再提出,修正,ALL,2026-09-05,2026-09-16,T010,designer_a|designer_b,chief_a,未着手,高,no,修正版AIデータ,重要指摘が反映され再確認できる,,修正担当の分担を決める,2026-06-02,承認と入稿に影響,修正量過多
M004,最終承認,マイルストーン,ALL,2026-09-18,2026-09-18,T011,chief_a,chief_b,未着手,高,yes,承認済み一式,パネルと原稿が承認済になる,,承認会議を確保,2026-06-02,入稿準備が始められない,意思決定遅れ
T012,入稿データ作成,入稿,ALL,2026-09-19,2026-09-25,M004,designer_a,designer_b,未着手,高,no,入稿データ,印刷仕様に合うデータができる,,印刷仕様を確認,2026-06-02,入稿期限に直撃,印刷仕様差戻し
T013,最終校正と入稿,入稿,ALL,2026-09-26,2026-09-30,T012,designer_b,designer_a,未着手,高,no,入稿完了,9月末までに印刷入稿が完了する,,校正チェックリストを作成,2026-06-02,最終納期遅延,校正漏れ`;

let panels = [
  panel("P01", "事業全体像", "顧客課題から提供価値までを一枚で掴ませる", "製品UI全体の操作モック", "designer_a", "writer_a", "未着手", "未着手", "確認待ち", "未着手", "未着手", "冒頭で使う基準パネル", "主メッセージの粒度"),
  panel("P02", "技術の強み", "競合との差分を技術要素で説明する", "技術デモ画面の静止モック", "designer_a", "writer_a", "未着手", "未着手", "確認待ち", "未着手", "未着手", "図解中心", "素材候補不足"),
  panel("P03", "導入効果", "toB顧客にとっての効果を定量・定性で示す", "", "designer_a", "writer_b", "未着手", "未着手", "未着手", "未着手", "未着手", "数値の扱い注意", ""),
  panel("P04", "利用シーン", "お客の現場でどう使われるかを具体化する", "現場利用イメージの簡易モック", "designer_a", "writer_b", "未着手", "未着手", "保留", "未着手", "未着手", "写真が必要", "掲載可能写真の確認"),
  panel("P05", "導入プロセス", "検討から運用開始までの流れを説明する", "", "designer_a", "writer_c", "未着手", "未着手", "未着手", "未着手", "未着手", "フロー図候補", ""),
  panel("P06", "事例紹介", "実績から信頼感を作る", "事例紹介用の匿名化画面モック", "designer_b", "writer_c", "未着手", "未着手", "確認待ち", "未着手", "未着手", "匿名化が必要", "事例画像の権利確認"),
  panel("P07", "運用体制", "導入後の支援体制を安心材料として見せる", "", "designer_b", "writer_d", "未着手", "未着手", "未着手", "未着手", "未着手", "組織図を検討", ""),
  panel("P08", "将来展開", "今後の拡張性と事業の伸びを伝える", "将来画面のコンセプトモック", "designer_b", "writer_d", "未着手", "未着手", "未着手", "未着手", "未着手", "抽象度高め", ""),
  panel("P09", "FAQ", "説明員が質問対応しやすい論点を整理する", "", "designer_b", "writer_a", "未着手", "未着手", "未着手", "未着手", "未着手", "原稿と連動", ""),
  panel("P10", "クロージング", "次アクションにつながる締めを作る", "", "designer_b", "writer_d", "未着手", "未着手", "未着手", "未着手", "未着手", "連絡先表記確認", ""),
  panel("P11", "追加パネル", "", "", "未設定", "未設定", "未着手", "未着手", "未着手", "未着手", "未着手", "", ""),
];

const reviews = [
  review("構成案レビュー", "ALL", "chief_a", "2026-06-14", "2026-06-17", "未着手", "", "", ""),
  review("前半パネル初稿レビュー", "P01|P02|P03|P04|P05", "chief_a", "2026-07-21", "2026-07-25", "未着手", "", "", ""),
  review("後半パネル初稿レビュー", "P06|P07|P08|P09|P10", "chief_b", "2026-08-19", "2026-08-23", "未着手", "", "", ""),
  review("全体レビュー", "ALL", "chief_a|chief_b", "2026-08-24", "2026-09-04", "未着手", "", "", ""),
  review("最終承認", "ALL", "chief_a", "2026-09-16", "2026-09-18", "未着手", "", "", ""),
];

let allTasks = [];
let analysis = new Map();
let members = [];

const statusOptions = ["未着手", "作業中", "確認待ち", "修正中", "承認済", "完了", "保留", "遅延"];
const priorityOptions = ["高", "中", "低"];
const storageKey = "uki-scheduler-panel-production-v1";
const backupStorageKey = `${storageKey}-backup`;
const panelSchemaVersion = 2;
const taskSchemaVersion = 2;
const defaultMembers = ["designer_a", "designer_b", "writer_a", "writer_b", "writer_c", "writer_d", "chief_a", "chief_b", "未設定"];

const els = {
  csvInput: document.querySelector("#csvInput"),
  panelCsvInput: document.querySelector("#panelCsvInput"),
  downloadCsvButton: document.querySelector("#downloadCsvButton"),
  downloadPanelsButton: document.querySelector("#downloadPanelsButton"),
  restoreBackupButton: document.querySelector("#restoreBackupButton"),
  resetButton: document.querySelector("#resetButton"),
  addPanelButton: document.querySelector("#addPanelButton"),
  addTaskButton: document.querySelector("#addTaskButton"),
  newMemberName: document.querySelector("#newMemberName"),
  addMemberButton: document.querySelector("#addMemberButton"),
  memberCaption: document.querySelector("#memberCaption"),
  memberList: document.querySelector("#memberList"),
  ownerFilter: document.querySelector("#ownerFilter"),
  panelFilter: document.querySelector("#panelFilter"),
  statusFilter: document.querySelector("#statusFilter"),
  criticalOnly: document.querySelector("#criticalOnly"),
  ganttChart: document.querySelector("#ganttChart"),
  projectRange: document.querySelector("#projectRange"),
  overallProgress: document.querySelector("#overallProgress"),
  completedPanelCount: document.querySelector("#completedPanelCount"),
  thisWeekCount: document.querySelector("#thisWeekCount"),
  delayedCount: document.querySelector("#delayedCount"),
  waitingCount: document.querySelector("#waitingCount"),
  chartCaption: document.querySelector("#chartCaption"),
  criticalCaption: document.querySelector("#criticalCaption"),
  criticalPath: document.querySelector("#criticalPath"),
  milestoneList: document.querySelector("#milestoneList"),
  panelBoard: document.querySelector("#panelBoard"),
  blockerCaption: document.querySelector("#blockerCaption"),
  blockerList: document.querySelector("#blockerList"),
  reviewCaption: document.querySelector("#reviewCaption"),
  reviewList: document.querySelector("#reviewList"),
  taskTable: document.querySelector("#taskTable"),
  emptyTemplate: document.querySelector("#emptyTemplate"),
  taskDialog: document.querySelector("#taskDialog"),
  taskForm: document.querySelector("#taskForm"),
  dialogTitle: document.querySelector("#dialogTitle"),
  closeDialogButton: document.querySelector("#closeDialogButton"),
  cancelTaskButton: document.querySelector("#cancelTaskButton"),
  deleteTaskButton: document.querySelector("#deleteTaskButton"),
  editTaskId: document.querySelector("#editTaskId"),
  editName: document.querySelector("#editName"),
  editCategory: document.querySelector("#editCategory"),
  editPanel: document.querySelector("#editPanel"),
  editOwner: document.querySelector("#editOwner"),
  editReviewer: document.querySelector("#editReviewer"),
  editStatus: document.querySelector("#editStatus"),
  editStart: document.querySelector("#editStart"),
  editEnd: document.querySelector("#editEnd"),
  editPriority: document.querySelector("#editPriority"),
  editDepends: document.querySelector("#editDepends"),
  editDeliverable: document.querySelector("#editDeliverable"),
  editUpdated: document.querySelector("#editUpdated"),
  editDoneCriteria: document.querySelector("#editDoneCriteria"),
  editBlocker: document.querySelector("#editBlocker"),
  editNextAction: document.querySelector("#editNextAction"),
  editImpact: document.querySelector("#editImpact"),
  editRisk: document.querySelector("#editRisk"),
};

const dayMs = 24 * 60 * 60 * 1000;
const fmt = new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric" });
const doneStatuses = new Set(["承認済", "完了"]);
const riskStatuses = new Set(["遅延", "保留"]);

function panel(
  id,
  title,
  message,
  mockup,
  designer,
  writer,
  panelTextStatus,
  scriptStatus,
  imageStatus,
  designStatus,
  approvalStatus,
  note,
  blocker
) {
  return { id, title, message, mockup, designer, writer, panelTextStatus, scriptStatus, imageStatus, designStatus, approvalStatus, note, blocker };
}

function review(target, panelIds, reviewer, requested, due, status, comments, resubmit, approved) {
  return {
    target,
    panelIds,
    reviewer,
    requested: parseDate(requested),
    due: parseDate(due),
    status,
    comments,
    resubmit: resubmit ? parseDate(resubmit) : null,
    approved: approved ? parseDate(approved) : null,
  };
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"' && quoted && next === '"') {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell.trim());
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i += 1;
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

  const headers = rows.shift().map((header) => header.toLowerCase());
  return rows.map((values) => normalizeTask(Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]))));
}

function parseCsvRows(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"' && quoted && next === '"') {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell.trim());
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i += 1;
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

function parsePanelsCsv(text) {
  const rows = parseCsvRows(text);
  const headers = rows.shift().map((header) => header.toLowerCase());
  return rows.map((values) => {
    const item = Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
    return panel(
      item.panel_id || item.id || nextPanelId(),
      item.title || "",
      item.message || "",
      item.mockup || "",
      item.designer || "未設定",
      item.writer || "未設定",
      item.panel_text_status || "未着手",
      item.script_status || "未着手",
      item.image_status || "未着手",
      item.design_status || "未着手",
      item.approval_status || "未着手",
      item.note || "",
      item.blocker || ""
    );
  });
}

function normalizeTask(item) {
  const start = parseDate(item.start);
  const end = parseDate(item.end);
  const milestone = ["yes", "true", "1", "y", "はい"].includes(String(item.milestone).toLowerCase());
  const duration = Math.max(1, daysBetween(start, end) + 1);

  return {
    id: item.id,
    name: item.name,
    category: item.category || (milestone ? "マイルストーン" : "タスク"),
    panel: item.panel || "ALL",
    start,
    end,
    depends: splitList(item.depends),
    owner: item.owner || "未設定",
    reviewer: item.reviewer || "未設定",
    status: item.status || "未設定",
    priority: item.priority || "中",
    milestone,
    deliverable: item.deliverable || "",
    doneCriteria: item.done_criteria || item.donecriteria || "",
    blocker: item.blocker || "",
    nextAction: item.next_action || item.nextaction || "",
    updated: item.updated || "",
    impact: item.impact || "",
    risk: item.risk || "",
    duration,
  };
}

function splitList(value) {
  return String(value || "")
    .split(/[|;]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseDate(value) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) throw new Error(`日付を読み取れません: ${value}`);
  return date;
}

function daysBetween(a, b) {
  return Math.round((stripTime(b) - stripTime(a)) / dayMs);
}

function stripTime(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function analyzeTasks(tasks) {
  const byId = new Map(tasks.map((task) => [task.id, task]));
  const successors = new Map(tasks.map((task) => [task.id, []]));
  const missing = [];

  tasks.forEach((task) => {
    task.depends.forEach((depId) => {
      if (byId.has(depId)) successors.get(depId).push(task.id);
      else missing.push(`${task.id} -> ${depId}`);
    });
  });

  if (missing.length) throw new Error(`依存先が見つかりません: ${missing.join(", ")}`);

  const order = [];
  const visiting = new Set();
  const visited = new Set();

  function visit(id) {
    if (visited.has(id)) return;
    if (visiting.has(id)) throw new Error(`依存関係が循環しています: ${id}`);
    visiting.add(id);
    byId.get(id).depends.forEach(visit);
    visiting.delete(id);
    visited.add(id);
    order.push(id);
  }

  tasks.forEach((task) => visit(task.id));

  const cpm = new Map();
  order.forEach((id) => {
    const task = byId.get(id);
    const es = Math.max(0, ...task.depends.map((depId) => cpm.get(depId).ef));
    cpm.set(id, { es, ef: es + task.duration, ls: 0, lf: 0, slack: 0, critical: false, successors: successors.get(id) });
  });

  const projectDuration = Math.max(0, ...Array.from(cpm.values()).map((item) => item.ef));
  [...order].reverse().forEach((id) => {
    const task = byId.get(id);
    const nextIds = successors.get(id);
    const lf = nextIds.length ? Math.min(...nextIds.map((nextId) => cpm.get(nextId).ls)) : projectDuration;
    const ls = lf - task.duration;
    const item = cpm.get(id);
    item.lf = lf;
    item.ls = ls;
    item.slack = ls - item.es;
    item.critical = item.slack === 0;
  });

  return cpm;
}

function populateFilters(tasks) {
  refreshMembersFromData();
  fillSelect(els.ownerFilter, ["すべて", ...unique(tasks.flatMap((task) => splitList(task.owner)))]);
  fillSelect(els.panelFilter, ["すべて", ...unique(["ALL", ...tasks.flatMap((task) => splitList(task.panel))])]);
  fillSelect(els.statusFilter, ["すべて", ...unique(tasks.map((task) => task.status))]);
  renderMemberOptions();
}

function fillSelect(select, values) {
  const current = select.value;
  select.innerHTML = values.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("");
  if (values.includes(current)) select.value = current;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, "ja"));
}

function refreshMembersFromData() {
  members = unique([
    ...defaultMembers,
    ...members,
    ...allTasks.flatMap((task) => [...splitList(task.owner), ...splitList(task.reviewer)]),
    ...panels.flatMap((item) => [item.designer, item.writer]),
  ]);
}

function renderMemberOptions() {
  els.memberList.innerHTML = members.map((name) => `<option value="${escapeAttr(name)}"></option>`).join("");
  els.memberCaption.textContent = `${members.length}人の候補`;
}

function addMember() {
  const name = els.newMemberName.value.trim();
  if (!name) return;
  if (!members.includes(name)) {
    members.push(name);
    members = unique(members);
  }
  els.newMemberName.value = "";
  saveLocalState();
  populateFilters(allTasks);
}

function sortedTasks(tasks) {
  return [...tasks].sort((a, b) => a.start - b.start || a.end - b.end || a.id.localeCompare(b.id, "ja", { numeric: true }));
}

function filteredTasks() {
  return allTasks.filter((task) => {
    const cpm = analysis.get(task.id);
    const ownerMatch = els.ownerFilter.value === "すべて" || splitList(task.owner).includes(els.ownerFilter.value);
    const panelMatch = els.panelFilter.value === "すべて" || task.panel === "ALL" || splitList(task.panel).includes(els.panelFilter.value);
    return ownerMatch && panelMatch && (els.statusFilter.value === "すべて" || task.status === els.statusFilter.value) && (!els.criticalOnly.checked || cpm.critical);
  });
}

function render() {
  const tasks = sortedTasks(filteredTasks());
  renderSummary();
  renderGantt(tasks);
  renderCriticalPath();
  renderMilestones();
  renderPanels();
  renderBlockers();
  renderReviews();
  renderTable(tasks);
}

function renderSummary() {
  const workTasks = allTasks.filter((task) => !task.milestone);
  const completedTasks = workTasks.filter((task) => doneStatuses.has(task.status));
  const completedPanels = panels.filter((item) => item.approvalStatus === "承認済" || item.designStatus === "完了");
  const delayedTasks = allTasks.filter((task) => task.status === "遅延" || isOverdue(task));
  const waitingTasks = allTasks.filter((task) => task.status === "確認待ち");
  const thisWeekTasks = allTasks.filter((task) => isThisWeek(task.end));

  els.projectRange.textContent = toIso(projectDeadline);
  els.overallProgress.textContent = `${Math.round((completedTasks.length / Math.max(1, workTasks.length)) * 100)}%`;
  els.completedPanelCount.textContent = `${completedPanels.length}/${panels.length}枚`;
  els.thisWeekCount.textContent = `${thisWeekTasks.length}件`;
  els.delayedCount.textContent = `${delayedTasks.length}件`;
  els.waitingCount.textContent = `${waitingTasks.length}件`;
}

function renderGantt(tasks) {
  if (!tasks.length) {
    renderEmpty(els.ganttChart);
    return;
  }

  const minDate = new Date(Math.min(...allTasks.map((task) => task.start)));
  const maxDate = new Date(Math.max(...allTasks.map((task) => task.end)));
  const totalDays = daysBetween(minDate, maxDate) + 1;
  const dates = Array.from({ length: totalDays }, (_, index) => addDays(minDate, index));
  els.chartCaption.textContent = `${totalDays}日間 / ${tasks.length}件を表示`;

  const grid = document.createElement("div");
  grid.className = "gantt-grid";
  grid.style.setProperty("--days", totalDays);
  grid.appendChild(headerCell("タスク"));
  dates.forEach((date) => grid.appendChild(dateCell(date)));

  tasks.forEach((task) => {
    const meta = analysis.get(task.id);
    const label = document.createElement("div");
    label.className = "task-label";
    label.innerHTML = `<strong>${escapeHtml(task.name)}</strong><span>${escapeHtml(task.panel)} / ${escapeHtml(task.owner)} / ${escapeHtml(task.status)}</span>`;
    grid.appendChild(label);

    const row = document.createElement("div");
    row.className = "timeline-row";
    dates.forEach((date) => {
      const cell = document.createElement("div");
      cell.className = `gantt-cell${isWeekend(date) ? " weekend" : ""}`;
      row.appendChild(cell);
    });

    const left = daysBetween(minDate, task.start);
    const width = Math.max(1, daysBetween(task.start, task.end) + 1);
    const bar = document.createElement("div");
    bar.className = `task-bar${meta.critical ? " critical" : ""}${task.milestone ? " milestone" : ""}${task.status === "遅延" ? " late" : ""}`;
    bar.style.left = `calc(${left} * 100% / ${totalDays})`;
    bar.style.width = task.milestone ? "" : `calc(${width} * 100% / ${totalDays})`;
    bar.title = `${task.name}: ${toIso(task.start)} - ${toIso(task.end)}`;
    if (!task.milestone) bar.innerHTML = `<span class="bar-text">${escapeHtml(task.id)}</span>`;
    row.appendChild(bar);
    grid.appendChild(row);
  });

  els.ganttChart.innerHTML = "";
  els.ganttChart.appendChild(grid);
}

function headerCell(text) {
  const cell = document.createElement("div");
  cell.className = "date-cell task-label";
  cell.textContent = text;
  return cell;
}

function dateCell(date) {
  const cell = document.createElement("div");
  cell.className = `date-cell${isWeekend(date) ? " weekend" : ""}${sameDay(date, projectToday) ? " today" : ""}`;
  cell.textContent = fmt.format(date);
  return cell;
}

function renderCriticalPath() {
  const critical = allTasks.filter((task) => analysis.get(task.id).critical);
  const risky = critical.filter((task) => task.status !== "完了" && task.status !== "承認済");
  els.criticalCaption.textContent = risky.length ? `${risky.length}件 / ${critical.map((task) => task.id).join(" → ")}` : "該当なし";
  els.criticalPath.innerHTML = risky
    .map((task) => {
      const meta = analysis.get(task.id);
      return `<li>
        <strong>${escapeHtml(task.name)}</strong>
        <span>${escapeHtml(task.id)} / ${escapeHtml(task.panel)} / ${toIso(task.start)} - ${toIso(task.end)} / バッファ${meta.slack}日</span>
        <p>${escapeHtml(task.nextAction || task.impact || "-")}</p>
      </li>`;
    })
    .join("");
}

function renderMilestones() {
  const milestones = allTasks.filter((task) => task.milestone);
  els.milestoneList.innerHTML = milestones
    .map((task) => {
      const meta = analysis.get(task.id);
      return `<div class="milestone-item">
        <strong>${escapeHtml(task.name)}</strong>
        <span>${toIso(task.end)} / 責任者: ${escapeHtml(task.owner)} / 関連: ${escapeHtml(task.panel)}</span>
        <span>${escapeHtml(task.doneCriteria)}</span>
        <span class="badge ${meta.critical ? "critical" : ""}">${meta.critical ? "Critical" : `${meta.slack}日余裕`}</span>
      </div>`;
    })
    .join("");
}

function renderPanels() {
  refreshMembersFromData();
  renderMemberOptions();
  els.panelBoard.innerHTML = panels
    .map((item) => {
      const statuses = [item.panelTextStatus, item.scriptStatus, item.imageStatus, item.designStatus, item.approvalStatus];
      const completed = statuses.filter((status) => doneStatuses.has(status)).length;
      const progress = Math.round((completed / statuses.length) * 100);
      return `<article class="panel-card">
        <div class="panel-card-head">
          <strong>${escapeHtml(item.id)}</strong>
          <div class="toolbar">
            <span class="badge">${progress}%</span>
            <button class="small-button danger-button" type="button" data-delete-panel="${escapeAttr(item.id)}">削除</button>
          </div>
        </div>
        <label class="panel-field">
          <span>タイトル</span>
          <input data-panel-id="${escapeHtml(item.id)}" data-panel-field="title" value="${escapeAttr(item.title)}" />
        </label>
        <label class="panel-field">
          <span>主メッセージ</span>
          <textarea data-panel-id="${escapeHtml(item.id)}" data-panel-field="message">${escapeHtml(item.message)}</textarea>
        </label>
        <label class="panel-field">
          <span>モックアップ</span>
          <textarea data-panel-id="${escapeHtml(item.id)}" data-panel-field="mockup">${escapeHtml(item.mockup || "")}</textarea>
        </label>
        <div class="mini-meta">
          <label>デザイン <input data-panel-id="${escapeHtml(item.id)}" data-panel-field="designer" list="memberList" value="${escapeAttr(item.designer)}" /></label>
          <label>原稿 <input data-panel-id="${escapeHtml(item.id)}" data-panel-field="writer" list="memberList" value="${escapeAttr(item.writer)}" /></label>
        </div>
        <div class="status-grid">
          ${statusSelect(item.id, "掲載文", "panelTextStatus", item.panelTextStatus)}
          ${statusSelect(item.id, "原稿", "scriptStatus", item.scriptStatus)}
          ${statusSelect(item.id, "画像", "imageStatus", item.imageStatus)}
          ${statusSelect(item.id, "デザイン", "designStatus", item.designStatus)}
          ${statusSelect(item.id, "承認", "approvalStatus", item.approvalStatus)}
        </div>
        <label class="panel-field">
          <span>備考</span>
          <textarea data-panel-id="${escapeHtml(item.id)}" data-panel-field="note">${escapeHtml(item.note)}</textarea>
        </label>
        <label class="panel-field blocker-note">
          <span>ブロッカー</span>
          <textarea data-panel-id="${escapeHtml(item.id)}" data-panel-field="blocker">${escapeHtml(item.blocker)}</textarea>
        </label>
      </article>`;
    })
    .join("");
}

function statusSelect(panelId, label, field, status) {
  const options = statusOptions
    .map((value) => `<option value="${escapeAttr(value)}"${value === status ? " selected" : ""}>${escapeHtml(value)}</option>`)
    .join("");
  return `<label class="status-pill ${statusClass(status)}">
    <b>${escapeHtml(label)}</b>
    <select data-panel-id="${escapeHtml(panelId)}" data-panel-field="${escapeHtml(field)}">${options}</select>
  </label>`;
}

function renderBlockers() {
  const blockedTasks = allTasks.filter((task) => task.blocker);
  const blockedPanels = panels.filter((item) => item.blocker);
  els.blockerCaption.textContent = `${blockedTasks.length + blockedPanels.length}件`;
  els.blockerList.innerHTML = [
    ...blockedTasks.map((task) => `<div class="blocker-item"><strong>${escapeHtml(task.id)} ${escapeHtml(task.name)}</strong><span>${escapeHtml(task.blocker)}</span><p>${escapeHtml(task.nextAction)}</p></div>`),
    ...blockedPanels.map((item) => `<div class="blocker-item"><strong>${escapeHtml(item.id)} ${escapeHtml(item.title)}</strong><span>${escapeHtml(item.blocker)}</span><p>${escapeHtml(item.note)}</p></div>`),
  ].join("");
}

function renderReviews() {
  const waiting = reviews.filter((item) => item.status === "確認待ち" || item.status === "未着手");
  els.reviewCaption.textContent = `${waiting.length}件が未完了`;
  els.reviewList.innerHTML = reviews
    .map(
      (item) => `<div class="review-item">
        <strong>${escapeHtml(item.target)}</strong>
        <span>${escapeHtml(item.panelIds)} / 確認者: ${escapeHtml(item.reviewer)}</span>
        <span>依頼: ${toIso(item.requested)} / 期限: ${toIso(item.due)}</span>
        <span class="badge ${statusClass(item.status)}">${escapeHtml(item.status)}</span>
      </div>`
    )
    .join("");
}

function renderTable(tasks) {
  if (!tasks.length) {
    els.taskTable.innerHTML = `<tr><td colspan="14">表示できるタスクがありません</td></tr>`;
    return;
  }

  els.taskTable.innerHTML = tasks
    .map((task) => {
      const meta = analysis.get(task.id);
      return `<tr class="${meta.critical ? "critical-row" : ""}">
        <td><button class="small-button" type="button" data-edit-task="${escapeAttr(task.id)}">編集</button></td>
        <td>${escapeHtml(task.id)}</td>
        <td>${escapeHtml(task.name)}</td>
        <td>${escapeHtml(task.category)}</td>
        <td>${escapeHtml(task.panel)}</td>
        <td>${escapeHtml(task.owner)}</td>
        <td>${escapeHtml(task.reviewer)}</td>
        <td>${toIso(task.start)} - ${toIso(task.end)}</td>
        <td><span class="badge ${statusClass(task.status)}">${escapeHtml(task.status)}</span></td>
        <td>${escapeHtml(task.priority)}</td>
        <td>${escapeHtml(task.depends.join(", ") || "-")}</td>
        <td>${escapeHtml(task.blocker || "-")}</td>
        <td>${escapeHtml(task.nextAction || "-")}</td>
        <td>${meta.critical ? "Critical" : `${meta.slack}日`}</td>
      </tr>`;
    })
    .join("");
}

function statusClass(status) {
  if (doneStatuses.has(status)) return "done";
  if (status === "遅延") return "late";
  if (status === "確認待ち") return "wait";
  if (riskStatuses.has(status)) return "risk";
  if (status === "作業中" || status === "修正中") return "active";
  return "";
}

function isOverdue(task) {
  return task.end < projectToday && !doneStatuses.has(task.status);
}

function isThisWeek(date) {
  const diff = daysBetween(projectToday, date);
  return diff >= 0 && diff <= 7;
}

function sameDay(a, b) {
  return toIso(a) === toIso(b);
}

function renderEmpty(target) {
  target.innerHTML = "";
  target.appendChild(els.emptyTemplate.content.cloneNode(true));
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function toIso(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}\n
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

function refreshAnalysisAndRender() {
  analysis = analyzeTasks(allTasks);
  populateFilters(allTasks);
  render();
}

function createBlankPanel(id) {
  return panel(id, "新規パネル", "", "", "未設定", "未設定", "未着手", "未着手", "未着手", "未着手", "未着手", "", "");
}

function nextPanelId() {
  const max = Math.max(0, ...panels.map((item) => Number(item.id.replace(/^P/i, ""))).filter(Number.isFinite));
  return `P${String(max + 1).padStart(2, "0")}`;
}

function ensurePanelMigration(state) {
  if (state.panelSchemaVersion >= panelSchemaVersion) return;
  if (!panels.some((item) => item.id === "P11")) {
    panels.push(createBlankPanel("P11"));
  }
}

function addPanel() {
  panels.push(createBlankPanel(nextPanelId()));
  saveLocalState();
  render();
}

function deletePanel(panelId) {
  const item = panels.find((panelItem) => panelItem.id === panelId);
  if (!item) return;
  if (!confirm(`${item.id} ${item.title || "このパネル"}を削除しますか？`)) return;
  panels = panels.filter((panelItem) => panelItem.id !== panelId);
  saveLocalState();
  render();
}

function nextTaskId() {
  const max = Math.max(
    0,
    ...allTasks
      .filter((task) => /^T\d+$/i.test(task.id))
      .map((task) => Number(task.id.replace(/^T/i, "")))
      .filter(Number.isFinite)
  );
  return `T${String(max + 1).padStart(3, "0")}`;
}

function addTask() {
  const id = nextTaskId();
  const start = toIso(projectToday);
  const end = toIso(addDays(projectToday, 7));
  const task = normalizeTask({
    id,
    name: "新規タスク",
    category: "タスク",
    panel: "ALL",
    start,
    end,
    depends: "",
    owner: "未設定",
    reviewer: "未設定",
    status: "未着手",
    priority: "中",
    milestone: "no",
    deliverable: "",
    done_criteria: "",
    blocker: "",
    next_action: "",
    updated: start,
    impact: "",
    risk: "",
  });
  allTasks.push(task);
  refreshAnalysisAndRender();
  saveLocalState();
  openTaskEditor(id);
}

function restoreMissingSampleTasks(state) {
  if (state.taskSchemaVersion >= taskSchemaVersion) return;
  const existingIds = new Set(allTasks.map((task) => task.id));
  const sampleTasks = parseCsv(sampleCsv);
  const missingTasks = sampleTasks.filter((task) => !existingIds.has(task.id));
  if (missingTasks.length) {
    allTasks.push(...missingTasks);
  }
}

function deleteCurrentTask() {
  const taskId = els.editTaskId.value;
  const task = allTasks.find((item) => item.id === taskId);
  if (!task) return;
  if (!confirm(`${task.id} ${task.name || "このタスク"}を削除しますか？`)) return;
  allTasks = allTasks.filter((item) => item.id !== taskId);
  allTasks.forEach((item) => {
    item.depends = item.depends.filter((depId) => depId !== taskId);
  });
  refreshAnalysisAndRender();
  saveLocalState();
  els.taskDialog.close();
}

function saveLocalState() {
  const previous = localStorage.getItem(storageKey);
  if (previous) {
    localStorage.setItem(backupStorageKey, previous);
  }
  const state = {
    tasks: allTasks.map((task) => ({
      ...task,
      start: toIso(task.start),
      end: toIso(task.end),
    })),
    panels,
    panelSchemaVersion,
    taskSchemaVersion,
    members,
  };
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function restoreBackup() {
  const backup = localStorage.getItem(backupStorageKey);
  if (!backup) {
    alert("直前保存のバックアップがまだありません。");
    return;
  }
  if (!confirm("直前保存の状態に戻しますか？現在の状態は上書きされます。")) return;
  localStorage.setItem(storageKey, backup);
  loadLocalState();
}

function loadLocalState() {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return false;
  try {
    const state = JSON.parse(raw);
    allTasks = state.tasks.map((task) =>
      normalizeTask({
        ...task,
        start: task.start,
        end: task.end,
        depends: Array.isArray(task.depends) ? task.depends.join("|") : task.depends,
        milestone: task.milestone ? "yes" : "no",
        done_criteria: task.doneCriteria,
        next_action: task.nextAction,
      })
    );
    if (Array.isArray(state.panels)) {
      panels.splice(0, panels.length, ...state.panels);
    }
    if (Array.isArray(state.members)) {
      members = state.members;
    }
    ensurePanelMigration(state);
    restoreMissingSampleTasks(state);
    refreshAnalysisAndRender();
    saveLocalState();
    return true;
  } catch {
    return false;
  }
}

function openTaskEditor(taskId) {
  const task = allTasks.find((item) => item.id === taskId);
  if (!task) return;
  els.dialogTitle.textContent = `${task.id} ${task.name}`;
  els.editTaskId.value = task.id;
  els.editName.value = task.name;
  els.editCategory.value = task.category;
  els.editPanel.value = task.panel;
  els.editOwner.value = task.owner;
  els.editReviewer.value = task.reviewer;
  els.editStatus.value = task.status;
  els.editStart.value = toIso(task.start);
  els.editEnd.value = toIso(task.end);
  els.editPriority.value = task.priority;
  els.editDepends.value = task.depends.join("|");
  els.editDeliverable.value = task.deliverable;
  els.editUpdated.value = task.updated || toIso(projectToday);
  els.editDoneCriteria.value = task.doneCriteria;
  els.editBlocker.value = task.blocker;
  els.editNextAction.value = task.nextAction;
  els.editImpact.value = task.impact;
  els.editRisk.value = task.risk;
  els.taskDialog.showModal();
}

function saveTaskFromDialog() {
  const task = allTasks.find((item) => item.id === els.editTaskId.value);
  if (!task) return;
  const start = parseDate(els.editStart.value);
  const end = parseDate(els.editEnd.value);
  task.name = els.editName.value.trim();
  task.category = els.editCategory.value.trim();
  task.panel = els.editPanel.value.trim() || "ALL";
  task.owner = els.editOwner.value.trim() || "未設定";
  task.reviewer = els.editReviewer.value.trim() || "未設定";
  task.status = els.editStatus.value;
  task.start = start;
  task.end = end;
  task.priority = els.editPriority.value;
  task.depends = splitList(els.editDepends.value);
  task.deliverable = els.editDeliverable.value.trim();
  task.updated = els.editUpdated.value;
  task.doneCriteria = els.editDoneCriteria.value.trim();
  task.blocker = els.editBlocker.value.trim();
  task.nextAction = els.editNextAction.value.trim();
  task.impact = els.editImpact.value.trim();
  task.risk = els.editRisk.value.trim();
  task.duration = Math.max(1, daysBetween(start, end) + 1);
  try {
    refreshAnalysisAndRender();
    saveLocalState();
    els.taskDialog.close();
  } catch (error) {
    alert(error.message);
  }
}

function downloadTasksCsv() {
  const headers = ["id", "name", "category", "panel", "start", "end", "depends", "owner", "reviewer", "status", "priority", "milestone", "deliverable", "done_criteria", "blocker", "next_action", "updated", "impact", "risk"];
  const rows = allTasks.map((task) => [
    task.id,
    task.name,
    task.category,
    task.panel,
    toIso(task.start),
    toIso(task.end),
    task.depends.join("|"),
    task.owner,
    task.reviewer,
    task.status,
    task.priority,
    task.milestone ? "yes" : "no",
    task.deliverable,
    task.doneCriteria,
    task.blocker,
    task.nextAction,
    task.updated,
    task.impact,
    task.risk,
  ]);
  const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `panel-production-tasks-${toIso(new Date())}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadPanelsCsv() {
  const headers = ["panel_id", "title", "message", "mockup", "designer", "writer", "panel_text_status", "script_status", "image_status", "design_status", "approval_status", "note", "blocker"];
  const rows = panels.map((item) => [
    item.id,
    item.title,
    item.message,
    item.mockup || "",
    item.designer,
    item.writer,
    item.panelTextStatus,
    item.scriptStatus,
    item.imageStatus,
    item.designStatus,
    item.approvalStatus,
    item.note,
    item.blocker,
  ]);
  downloadCsvFile(headers, rows, `panel-production-panels-${toIso(new Date())}.csv`);
}

function downloadCsvFile(headers, rows, filename) {
  const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function csvCell(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

function loadCsv(text) {
  try {
    allTasks = parseCsv(text);
    refreshAnalysisAndRender();
    saveLocalState();
  } catch (error) {
    alert(error.message);
  }
}

function loadPanelsCsv(text) {
  try {
    const nextPanels = parsePanelsCsv(text);
    if (!nextPanels.length) throw new Error("パネルCSVに読み込める行がありません。");
    panels = nextPanels;
    refreshAnalysisAndRender();
    saveLocalState();
  } catch (error) {
    alert(error.message);
  }
}

fillSelect(els.editStatus, statusOptions);
fillSelect(els.editPriority, priorityOptions);

els.csvInput.addEventListener("change", async (event) => {
  const [file] = event.target.files;
  if (!file) return;
  loadCsv(await file.text());
});

els.panelCsvInput.addEventListener("change", async (event) => {
  const [file] = event.target.files;
  if (!file) return;
  loadPanelsCsv(await file.text());
});

els.resetButton.addEventListener("click", () => {
  els.csvInput.value = "";
  localStorage.removeItem(storageKey);
  loadCsv(sampleCsv);
});

els.downloadCsvButton.addEventListener("click", downloadTasksCsv);
els.downloadPanelsButton.addEventListener("click", downloadPanelsCsv);
els.restoreBackupButton.addEventListener("click", restoreBackup);
els.addPanelButton.addEventListener("click", addPanel);
els.addTaskButton.addEventListener("click", addTask);
els.addMemberButton.addEventListener("click", addMember);
els.newMemberName.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  addMember();
});

els.taskTable.addEventListener("click", (event) => {
  const button = event.target.closest("[data-edit-task]");
  if (!button) return;
  openTaskEditor(button.dataset.editTask);
});

els.taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  saveTaskFromDialog();
});

els.closeDialogButton.addEventListener("click", () => els.taskDialog.close());
els.cancelTaskButton.addEventListener("click", () => els.taskDialog.close());
els.deleteTaskButton.addEventListener("click", deleteCurrentTask);

els.panelBoard.addEventListener("change", (event) => {
  const deleteButton = event.target.closest("[data-delete-panel]");
  if (deleteButton) {
    deletePanel(deleteButton.dataset.deletePanel);
    return;
  }
  const field = event.target.dataset.panelField;
  const panelId = event.target.dataset.panelId;
  if (!field || !panelId) return;
  const item = panels.find((panelItem) => panelItem.id === panelId);
  if (!item) return;
  item[field] = event.target.value;
  saveLocalState();
  render();
});

els.panelBoard.addEventListener("input", (event) => {
  const field = event.target.dataset.panelField;
  const panelId = event.target.dataset.panelId;
  if (!field || !panelId) return;
  const item = panels.find((panelItem) => panelItem.id === panelId);
  if (!item) return;
  item[field] = event.target.value;
  saveLocalState();
  renderSummary();
  renderBlockers();
});

els.panelBoard.addEventListener("click", (event) => {
  const deleteButton = event.target.closest("[data-delete-panel]");
  if (!deleteButton) return;
  deletePanel(deleteButton.dataset.deletePanel);
});

[els.ownerFilter, els.panelFilter, els.statusFilter, els.criticalOnly].forEach((control) => {
  control.addEventListener("change", render);
});

if (!loadLocalState()) {
  loadCsv(sampleCsv);
}
