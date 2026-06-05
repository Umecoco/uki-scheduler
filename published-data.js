(function () {
  const publishedDataVersion = "2026-06-05-csv-1";
  const storageKey = "uki-scheduler-panel-production-v1";
  const versionKey = `${storageKey}-published-version`;

  async function fetchText(path) {
    const response = await fetch(`${path}?v=${publishedDataVersion}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`${path} を読み込めませんでした`);
    return response.text();
  }

  async function loadPublishedData() {
    if (localStorage.getItem(versionKey) === publishedDataVersion) return;
    const [taskCsv, panelCsv] = await Promise.all([fetchText("sample-schedule.csv"), fetchText("sample-panels.csv")]);
    if (typeof loadCsv !== "function" || typeof loadPanelsCsv !== "function") return;
    loadCsv(taskCsv);
    loadPanelsCsv(panelCsv);
    localStorage.setItem(versionKey, publishedDataVersion);
  }

  window.addEventListener("DOMContentLoaded", () => {
    loadPublishedData().catch((error) => {
      console.error(error);
    });
  });
})();
