const projectDeadline = parseDate("2026-09-30");
const projectToday = parseDate("2026-06-02");
const statuses = ["未着手", "作業中", "確認待ち", "修正中", "承認済", "完了", "保留", "遅延"];
const priorities = ["高", "中", "低"];
const done = new Set(["承認済", "完了"]);
const storageKey = "uki-scheduler-panel-production-v1";
const dayMs = 86400000;
const fmt = new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric" });

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

let tasks = [];
let cpm = new Map();
let panels = [
  p("P01", "事業全体像", "顧客課題から提供価値までを一枚で掴ませる", "製品UI全体の操作モック", "designer_a", "writer_a", "確認待ち", "未着手", "確認待ち", "未着手", "未着手", "冒頭で使う基準パネル", "主メッセージの粒度"),
  p("P02", "技術の強み", "競合との差分を技術要素で説明する", "技術デモ画面の静止モック", "designer_a", "writer_a", "未着手", "未着手", "確認待ち", "未着手", "未着手", "図解中心", "素材候補不足"),
  p("P03", "導入効果", "toB顧客にとっての効果を定量・定性で示す", "", "designer_a", "writer_b", "未着手", "未着手", "未着手", "未着手", "未着手", "数値の扱い注意", ""),
  p("P04", "利用シーン", "お客の現場でどう使われるかを具体化する", "現場利用イメージの簡易モック", "designer_a", "writer_b", "未着手", "未着手", "保留", "未着手", "未着手", "写真が必要", "掲載可能写真の確認"),
  p("P05", "導入プロセス", "検討から運用開始までの流れを説明する", "", "designer_a", "writer_c", "未着手", "未着手", "未着手", "未着手", "未着手", "フロー図候補", ""),
  p("P06", "事例紹介", "実績から信頼感を作る", "事例紹介用の匿名化画面モック", "designer_b", "writer_c", "未着手", "未着手", "確認待ち", "未着手", "未着手", "匿名化が必要", "事例画像の権利確認"),
  p("P07", "運用体制", "導入後の支援体制を安心材料として見せる", "", "designer_b", "writer_d", "未着手", "未着手", "未着手", "未着手", "未着手", "組織図を検討", ""),
  p("P08", "将来展開", "今後の拡張性と事業の伸びを伝える", "将来画面のコンセプトモック", "designer_b", "writer_d", "未着手", "未着手", "未着手", "未着手", "未着手", "抽象度高め", ""),
  p("P09", "FAQ", "説明員が質問対応しやすい論点を整理する", "", "designer_b", "writer_a", "未着手", "未着手", "未着手", "未着手", "未着手", "原稿と連動", ""),
  p("P10", "クロージング", "次アクションにつながる締めを作る", "", "designer_b", "writer_d", "未着手", "未着手", "未着手", "未着手", "未着手", "連絡先表記確認", "")
];

const reviews = [
  ["構成案レビュー", "ALL", "chief_a", "2026-06-14", "2026-06-17", "未着手"],
  ["前半パネル初稿レビュー", "P01|P02|P03|P04|P05", "chief_a", "2026-07-21", "2026-07-25", "未着手"],
  ["後半パネル初稿レビュー", "P06|P07|P08|P09|P10", "chief_b", "2026-08-19", "2026-08-23", "未着手"],
  ["全体レビュー", "ALL", "chief_a|chief_b", "2026-08-24", "2026-09-04", "未着手"],
  ["最終承認", "ALL", "chief_a", "2026-09-16", "2026-09-18", "未着手"]
];

const $ = (id) => document.querySelector(id);
const el = {
  csv: $("#csvInput"), taskCsv: $("#downloadCsvButton"), panelCsv: $("#downloadPanelsButton"), reset: $("#resetButton"), owner: $("#ownerFilter"), panel: $("#panelFilter"), status: $("#statusFilter"), crit: $("#criticalOnly"),
  range: $("#projectRange"), overall: $("#overallProgress"), completePanels: $("#completedPanelCount"), week: $("#thisWeekCount"), late: $("#delayedCount"), wait: $("#waitingCount"), chartCaption: $("#chartCaption"), chart: $("#ganttChart"),
  criticalCaption: $("#criticalCaption"), criticalPath: $("#criticalPath"), milestoneList: $("#milestoneList"), panelBoard: $("#panelBoard"), blockerCaption: $("#blockerCaption"), blockerList: $("#blockerList"), reviewCaption: $("#reviewCaption"), reviewList: $("#reviewList"), taskTable: $("#taskTable"),
  dialog: $("#taskDialog"), form: $("#taskForm"), title: $("#dialogTitle"), close: $("#closeDialogButton"), cancel: $("#cancelTaskButton"),
  editTaskId: $("#editTaskId"), editName: $("#editName"), editCategory: $("#editCategory"), editPanel: $("#editPanel"), editOwner: $("#editOwner"), editReviewer: $("#editReviewer"), editStatus: $("#editStatus"), editStart: $("#editStart"), editEnd: $("#editEnd"), editPriority: $("#editPriority"), editDepends: $("#editDepends"), editDeliverable: $("#editDeliverable"), editUpdated: $("#editUpdated"), editDoneCriteria: $("#editDoneCriteria"), editBlocker: $("#editBlocker"), editNextAction: $("#editNextAction"), editImpact: $("#editImpact"), editRisk: $("#editRisk")
};

function p(id, title, message, mockup, designer, writer, panelTextStatus, scriptStatus, imageStatus, designStatus, approvalStatus, note, blocker) {
  return { id, title, message, mockup, designer, writer, panelTextStatus, scriptStatus, imageStatus, designStatus, approvalStatus, note, blocker };
}

function parseDate(value) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) throw new Error(`日付を読み取れません: ${value}`);
  return date;
}
function iso(date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
function days(a, b) { return Math.round((new Date(b.getFullYear(), b.getMonth(), b.getDate()) - new Date(a.getFullYear(), a.getMonth(), a.getDate())) / dayMs); }
function list(v) { return String(v || "").split(/[|;]/).map((x) => x.trim()).filter(Boolean); }
function html(v) { return String(v ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }
function csvCell(v) { const t = String(v ?? ""); return /[",\n\r]/.test(t) ? `"${t.replaceAll('"', '""')}"` : t; }
function statusClass(s) { return done.has(s) ? "done" : s === "遅延" ? "late" : s === "確認待ち" ? "wait" : s === "保留" ? "risk" : ["作業中", "修正中"].includes(s) ? "active" : ""; }
function addDays(date, n) { const d = new Date(date); d.setDate(d.getDate() + n); return d; }

function parseCsv(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i], next = text[i + 1];
    if (ch === '"' && quoted && next === '"') { cell += '"'; i += 1; }
    else if (ch === '"') quoted = !quoted;
    else if (ch === "," && !quoted) { row.push(cell.trim()); cell = ""; }
    else if ((ch === "\n" || ch === "\r") && !quoted) { if (ch === "\r" && next === "\n") i += 1; row.push(cell.trim()); if (row.some(Boolean)) rows.push(row); row = []; cell = ""; }
    else cell += ch;
  }
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  const head = rows.shift().map((x) => x.toLowerCase());
  return rows.map((r) => norm(Object.fromEntries(head.map((h, i) => [h, r[i] ?? ""]))));
}

function norm(x) {
  const start = parseDate(x.start), end = parseDate(x.end);
  const milestone = ["yes", "true", "1", "y", "はい"].includes(String(x.milestone).toLowerCase());
  return { id: x.id, name: x.name, category: x.category || (milestone ? "マイルストーン" : "タスク"), panel: x.panel || "ALL", start, end, depends: list(x.depends), owner: x.owner || "未設定", reviewer: x.reviewer || "未設定", status: x.status || "未着手", priority: x.priority || "中", milestone, deliverable: x.deliverable || "", doneCriteria: x.done_criteria || x.doneCriteria || "", blocker: x.blocker || "", nextAction: x.next_action || x.nextAction || "", updated: x.updated || "", impact: x.impact || "", risk: x.risk || "", duration: Math.max(1, days(start, end) + 1) };
}

function analyze() {
  const byId = new Map(tasks.map((t) => [t.id, t]));
  const next = new Map(tasks.map((t) => [t.id, []]));
  tasks.forEach((t) => t.depends.forEach((d) => { if (byId.has(d)) next.get(d).push(t.id); }));
  const order = [], visiting = new Set(), seen = new Set();
  function visit(id) { if (seen.has(id)) return; if (visiting.has(id)) throw new Error(`依存関係が循環しています: ${id}`); visiting.add(id); byId.get(id).depends.filter((d) => byId.has(d)).forEach(visit); visiting.delete(id); seen.add(id); order.push(id); }
  tasks.forEach((t) => visit(t.id));
  cpm = new Map();
  order.forEach((id) => { const t = byId.get(id); const es = Math.max(0, ...t.depends.filter((d) => cpm.has(d)).map((d) => cpm.get(d).ef)); cpm.set(id, { es, ef: es + t.duration, ls: 0, lf: 0, slack: 0, critical: false, successors: next.get(id) }); });
  const total = Math.max(0, ...Array.from(cpm.values()).map((x) => x.ef));
  [...order].reverse().forEach((id) => { const t = byId.get(id), m = cpm.get(id), ns = next.get(id); m.lf = ns.length ? Math.min(...ns.map((n) => cpm.get(n).ls)) : total; m.ls = m.lf - t.duration; m.slack = m.ls - m.es; m.critical = m.slack === 0; });
}

function fill(select, values) { const old = select.value; select.innerHTML = values.map((v) => `<option value="${html(v)}">${html(v)}</option>`).join(""); if (values.includes(old)) select.value = old; }
function unique(values) { return [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, "ja")); }
function refreshFilters() { fill(el.owner, ["すべて", ...unique(tasks.flatMap((t) => list(t.owner)))]); fill(el.panel, ["すべて", ...unique(["ALL", ...tasks.flatMap((t) => list(t.panel))])]); fill(el.status, ["すべて", ...unique(tasks.map((t) => t.status))]); }
function filtered() { return tasks.filter((t) => (el.owner.value === "すべて" || list(t.owner).includes(el.owner.value)) && (el.panel.value === "すべて" || t.panel === "ALL" || list(t.panel).includes(el.panel.value)) && (el.status.value === "すべて" || t.status === el.status.value) && (!el.crit.checked || cpm.get(t.id).critical)); }

function render() { renderSummary(); renderGantt(filtered()); renderCritical(); renderMilestones(); renderPanels(); renderBlockers(); renderReviews(); renderTable(filtered()); }
function renderSummary() {
  const work = tasks.filter((t) => !t.milestone), complete = work.filter((t) => done.has(t.status));
  el.range.textContent = iso(projectDeadline);
  el.overall.textContent = `${Math.round((complete.length / Math.max(1, work.length)) * 100)}%`;
  el.completePanels.textContent = `${panels.filter((p) => done.has(p.approvalStatus) || p.designStatus === "完了").length}/${panels.length}枚`;
  el.week.textContent = `${tasks.filter((t) => { const d = days(projectToday, t.end); return d >= 0 && d <= 7; }).length}件`;
  el.late.textContent = `${tasks.filter((t) => t.status === "遅延" || (t.end < projectToday && !done.has(t.status))).length}件`;
  el.wait.textContent = `${tasks.filter((t) => t.status === "確認待ち").length}件`;
}

function renderGantt(view) {
  if (!view.length) { el.chart.innerHTML = `<div class="empty-state"><strong>表示できるタスクがありません</strong><span>フィルターを変更してください。</span></div>`; return; }
  const min = new Date(Math.min(...tasks.map((t) => t.start))), max = new Date(Math.max(...tasks.map((t) => t.end))), total = days(min, max) + 1;
  el.chartCaption.textContent = `${total}日間 / ${view.length}件を表示`;
  const dates = Array.from({ length: total }, (_, i) => addDays(min, i));
  const grid = document.createElement("div"); grid.className = "gantt-grid"; grid.style.setProperty("--days", total);
  grid.innerHTML = `<div class="date-cell task-label">タスク</div>` + dates.map((d) => `<div class="date-cell${[0, 6].includes(d.getDay()) ? " weekend" : ""}${iso(d) === iso(projectToday) ? " today" : ""}">${fmt.format(d)}</div>`).join("");
  view.forEach((t) => {
    const m = cpm.get(t.id), left = days(min, t.start), width = Math.max(1, days(t.start, t.end) + 1);
    grid.insertAdjacentHTML("beforeend", `<div class="task-label"><strong>${html(t.name)}</strong><span>${html(t.panel)} / ${html(t.owner)} / ${html(t.status)}</span></div>`);
    const row = document.createElement("div"); row.className = "timeline-row"; row.innerHTML = dates.map((d) => `<div class="gantt-cell${[0, 6].includes(d.getDay()) ? " weekend" : ""}"></div>`).join("");
    row.insertAdjacentHTML("beforeend", `<div class="task-bar${m.critical ? " critical" : ""}${t.milestone ? " milestone" : ""}${t.status === "遅延" ? " late" : ""}" style="left:calc(${left} * 100% / ${total});${t.milestone ? "" : `width:calc(${width} * 100% / ${total})`}" title="${html(t.name)}">${t.milestone ? "" : `<span class="bar-text">${html(t.id)}</span>`}</div>`);
    grid.appendChild(row);
  });
  el.chart.innerHTML = ""; el.chart.appendChild(grid);
}

function renderCritical() {
  const risky = tasks.filter((t) => cpm.get(t.id).critical && !done.has(t.status));
  el.criticalCaption.textContent = risky.length ? `${risky.length}件 / ${tasks.filter((t) => cpm.get(t.id).critical).map((t) => t.id).join(" → ")}` : "該当なし";
  el.criticalPath.innerHTML = risky.map((t) => `<li><strong>${html(t.name)}</strong><span>${html(t.id)} / ${html(t.panel)} / ${iso(t.start)} - ${iso(t.end)} / バッファ${cpm.get(t.id).slack}日</span><p>${html(t.nextAction || t.impact || "-")}</p></li>`).join("");
}
function renderMilestones() { el.milestoneList.innerHTML = tasks.filter((t) => t.milestone).map((t) => `<div class="milestone-item"><strong>${html(t.name)}</strong><span>${iso(t.end)} / 責任者: ${html(t.owner)} / 関連: ${html(t.panel)}</span><span>${html(t.doneCriteria)}</span><span class="badge ${cpm.get(t.id).critical ? "critical" : ""}">${cpm.get(t.id).critical ? "Critical" : `${cpm.get(t.id).slack}日余裕`}</span></div>`).join(""); }

function statusSelect(id, label, field, value) { return `<label class="status-pill ${statusClass(value)}"><b>${html(label)}</b><select data-panel-id="${html(id)}" data-panel-field="${field}">${statuses.map((s) => `<option value="${html(s)}"${s === value ? " selected" : ""}>${html(s)}</option>`).join("")}</select></label>`; }
function renderPanels() {
  el.panelBoard.innerHTML = panels.map((x) => {
    const values = [x.panelTextStatus, x.scriptStatus, x.imageStatus, x.designStatus, x.approvalStatus];
    const progress = Math.round((values.filter((s) => done.has(s)).length / values.length) * 100);
    return `<article class="panel-card"><div class="panel-card-head"><strong>${html(x.id)}</strong><span class="badge">${progress}%</span></div><label class="panel-field"><span>タイトル</span><input data-panel-id="${html(x.id)}" data-panel-field="title" value="${html(x.title)}" /></label><label class="panel-field"><span>主メッセージ</span><textarea data-panel-id="${html(x.id)}" data-panel-field="message">${html(x.message)}</textarea></label><label class="panel-field"><span>モックアップ</span><textarea data-panel-id="${html(x.id)}" data-panel-field="mockup">${html(x.mockup || "")}</textarea></label><div class="mini-meta"><label>デザイン <input data-panel-id="${html(x.id)}" data-panel-field="designer" value="${html(x.designer)}" /></label><label>原稿 <input data-panel-id="${html(x.id)}" data-panel-field="writer" value="${html(x.writer)}" /></label></div><div class="status-grid">${statusSelect(x.id, "掲載文", "panelTextStatus", x.panelTextStatus)}${statusSelect(x.id, "原稿", "scriptStatus", x.scriptStatus)}${statusSelect(x.id, "画像", "imageStatus", x.imageStatus)}${statusSelect(x.id, "デザイン", "designStatus", x.designStatus)}${statusSelect(x.id, "承認", "approvalStatus", x.approvalStatus)}</div><label class="panel-field"><span>備考</span><textarea data-panel-id="${html(x.id)}" data-panel-field="note">${html(x.note)}</textarea></label><label class="panel-field blocker-note"><span>ブロッカー</span><textarea data-panel-id="${html(x.id)}" data-panel-field="blocker">${html(x.blocker)}</textarea></label></article>`;
  }).join("");
}
function renderBlockers() { const blockedTasks = tasks.filter((t) => t.blocker), blockedPanels = panels.filter((p) => p.blocker); el.blockerCaption.textContent = `${blockedTasks.length + blockedPanels.length}件`; el.blockerList.innerHTML = [...blockedTasks.map((t) => `<div class="blocker-item"><strong>${html(t.id)} ${html(t.name)}</strong><span>${html(t.blocker)}</span><p>${html(t.nextAction)}</p></div>`), ...blockedPanels.map((p) => `<div class="blocker-item"><strong>${html(p.id)} ${html(p.title)}</strong><span>${html(p.blocker)}</span><p>${html(p.note)}</p></div>`)].join(""); }
function renderReviews() { el.reviewCaption.textContent = `${reviews.filter((r) => ["未着手", "確認待ち"].includes(r[5])).length}件が未完了`; el.reviewList.innerHTML = reviews.map((r) => `<div class="review-item"><strong>${html(r[0])}</strong><span>${html(r[1])} / 確認者: ${html(r[2])}</span><span>依頼: ${html(r[3])} / 期限: ${html(r[4])}</span><span class="badge ${statusClass(r[5])}">${html(r[5])}</span></div>`).join(""); }
function renderTable(view) { el.taskTable.innerHTML = view.length ? view.map((t) => `<tr class="${cpm.get(t.id).critical ? "critical-row" : ""}"><td><button class="small-button" type="button" data-edit-task="${html(t.id)}">編集</button></td><td>${html(t.id)}</td><td>${html(t.name)}</td><td>${html(t.category)}</td><td>${html(t.panel)}</td><td>${html(t.owner)}</td><td>${html(t.reviewer)}</td><td>${iso(t.start)} - ${iso(t.end)}</td><td><span class="badge ${statusClass(t.status)}">${html(t.status)}</span></td><td>${html(t.priority)}</td><td>${html(t.depends.join(", ") || "-")}</td><td>${html(t.blocker || "-")}</td><td>${html(t.nextAction || "-")}</td><td>${cpm.get(t.id).critical ? "Critical" : `${cpm.get(t.id).slack}日`}</td></tr>`).join("") : `<tr><td colspan="14">表示できるタスクがありません</td></tr>`; }

function save() { localStorage.setItem(storageKey, JSON.stringify({ tasks: tasks.map((t) => ({ ...t, start: iso(t.start), end: iso(t.end) })), panels })); }
function load() { try { const raw = localStorage.getItem(storageKey); if (!raw) return false; const s = JSON.parse(raw); tasks = s.tasks.map((t) => norm({ ...t, start: t.start, end: t.end, depends: Array.isArray(t.depends) ? t.depends.join("|") : t.depends, milestone: t.milestone ? "yes" : "no", done_criteria: t.doneCriteria, next_action: t.nextAction })); if (Array.isArray(s.panels)) panels = s.panels; analyze(); refreshFilters(); render(); return true; } catch { localStorage.removeItem(storageKey); return false; } }
function loadCsv(text) { try { tasks = parseCsv(text); analyze(); refreshFilters(); render(); save(); } catch (e) { alert(e.message); } }
function download(headers, rows, name) { const csv = [headers, ...rows].map((r) => r.map(csvCell).join(",")).join("\n"); const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = name; a.click(); URL.revokeObjectURL(url); }
function downloadTasks() { download(["id", "name", "category", "panel", "start", "end", "depends", "owner", "reviewer", "status", "priority", "milestone", "deliverable", "done_criteria", "blocker", "next_action", "updated", "impact", "risk"], tasks.map((t) => [t.id, t.name, t.category, t.panel, iso(t.start), iso(t.end), t.depends.join("|"), t.owner, t.reviewer, t.status, t.priority, t.milestone ? "yes" : "no", t.deliverable, t.doneCriteria, t.blocker, t.nextAction, t.updated, t.impact, t.risk]), `panel-production-tasks-${iso(new Date())}.csv`); }
function downloadPanels() { download(["panel_id", "title", "message", "mockup", "designer", "writer", "panel_text_status", "script_status", "image_status", "design_status", "approval_status", "note", "blocker"], panels.map((p) => [p.id, p.title, p.message, p.mockup || "", p.designer, p.writer, p.panelTextStatus, p.scriptStatus, p.imageStatus, p.designStatus, p.approvalStatus, p.note, p.blocker]), `panel-production-panels-${iso(new Date())}.csv`); }

function openEditor(id) { const t = tasks.find((x) => x.id === id); if (!t) return; el.title.textContent = `${t.id} ${t.name}`; el.editTaskId.value = t.id; el.editName.value = t.name; el.editCategory.value = t.category; el.editPanel.value = t.panel; el.editOwner.value = t.owner; el.editReviewer.value = t.reviewer; el.editStatus.value = t.status; el.editStart.value = iso(t.start); el.editEnd.value = iso(t.end); el.editPriority.value = t.priority; el.editDepends.value = t.depends.join("|"); el.editDeliverable.value = t.deliverable; el.editUpdated.value = t.updated || iso(projectToday); el.editDoneCriteria.value = t.doneCriteria; el.editBlocker.value = t.blocker; el.editNextAction.value = t.nextAction; el.editImpact.value = t.impact; el.editRisk.value = t.risk; el.dialog.showModal(); }
function saveEditor() { const t = tasks.find((x) => x.id === el.editTaskId.value); if (!t) return; Object.assign(t, { name: el.editName.value.trim(), category: el.editCategory.value.trim(), panel: el.editPanel.value.trim() || "ALL", owner: el.editOwner.value.trim() || "未設定", reviewer: el.editReviewer.value.trim() || "未設定", status: el.editStatus.value, start: parseDate(el.editStart.value), end: parseDate(el.editEnd.value), priority: el.editPriority.value, depends: list(el.editDepends.value), deliverable: el.editDeliverable.value.trim(), updated: el.editUpdated.value, doneCriteria: el.editDoneCriteria.value.trim(), blocker: el.editBlocker.value.trim(), nextAction: el.editNextAction.value.trim(), impact: el.editImpact.value.trim(), risk: el.editRisk.value.trim() }); t.duration = Math.max(1, days(t.start, t.end) + 1); analyze(); refreshFilters(); render(); save(); el.dialog.close(); }

fill(el.editStatus, statuses); fill(el.editPriority, priorities);
el.csv.addEventListener("change", async (e) => { const [file] = e.target.files; if (file) loadCsv(await file.text()); });
el.reset.addEventListener("click", () => { localStorage.removeItem(storageKey); el.csv.value = ""; loadCsv(sampleCsv); });
el.taskCsv.addEventListener("click", downloadTasks); el.panelCsv.addEventListener("click", downloadPanels);
el.taskTable.addEventListener("click", (e) => { const b = e.target.closest("[data-edit-task]"); if (b) openEditor(b.dataset.editTask); });
el.form.addEventListener("submit", (e) => { e.preventDefault(); saveEditor(); });
el.close.addEventListener("click", () => el.dialog.close()); el.cancel.addEventListener("click", () => el.dialog.close());
[el.owner, el.panel, el.status, el.crit].forEach((x) => x.addEventListener("change", render));
el.panelBoard.addEventListener("input", (e) => { const id = e.target.dataset.panelId, field = e.target.dataset.panelField; const item = panels.find((p) => p.id === id); if (item && field) { item[field] = e.target.value; save(); renderSummary(); renderBlockers(); } });
el.panelBoard.addEventListener("change", (e) => { const id = e.target.dataset.panelId, field = e.target.dataset.panelField; const item = panels.find((p) => p.id === id); if (item && field) { item[field] = e.target.value; save(); render(); } });
if (!load()) loadCsv(sampleCsv);
