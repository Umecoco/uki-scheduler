(function () {
  const storagePrefix = "uki-scheduler-panel-production-v1";

  function clearSavedSchedulerState() {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(storagePrefix))
      .forEach((key) => localStorage.removeItem(key));
  }

  function shouldResetFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("reset") === "1" || params.get("fresh") === "1";
  }

  if (shouldResetFromUrl()) {
    clearSavedSchedulerState();
    const cleanUrl = `${window.location.pathname}?v=20260605-3`;
    window.location.replace(cleanUrl);
    return;
  }

  function escapeSvg(value) {
    return String(value || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
  }

  function svgText(text, x, y, size = 12, weight = 500, color = "#23272f") {
    return `<text x="${x}" y="${y}" font-family="system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="${size}" font-weight="${weight}" fill="${color}">${escapeSvg(text)}</text>`;
  }

  function barColor(bar) {
    if (bar.classList.contains("milestone")) return "#7a5af8";
    if (bar.classList.contains("category-design")) return "#315fba";
    if (bar.classList.contains("category-script")) return "#237c78";
    if (bar.classList.contains("category-business")) return "#b7791f";
    return "#237c78";
  }

  function parseDate(value) {
    const match = String(value || "").match(/(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return null;
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12);
  }

  function daysBetween(start, end) {
    return Math.round((end - start) / 86400000);
  }

  function readBarDates(bar) {
    const matches = String(bar.title || "").match(/\d{4}-\d{2}-\d{2}/g) || [];
    const start = parseDate(matches[0]);
    const end = parseDate(matches[1] || matches[0]);
    return start && end ? { start, end } : null;
  }

  function readFirstVisibleTaskStart(labels) {
    const starts = labels
      .map((label) => readBarDates(label.nextElementSibling?.querySelector(".task-bar"))?.start)
      .filter(Boolean);
    return starts.length ? new Date(Math.min(...starts)) : null;
  }

  function readScheduleStart(dateCells, fallbackDate) {
    const match = String(dateCells[0]?.textContent || "").match(/(\d{1,2})\/(\d{1,2})/);
    if (!match || !fallbackDate) return fallbackDate;
    let start = new Date(fallbackDate.getFullYear(), Number(match[1]) - 1, Number(match[2]), 12);
    if (daysBetween(start, fallbackDate) > 180) start = new Date(start.getFullYear() - 1, start.getMonth(), start.getDate(), 12);
    if (daysBetween(fallbackDate, start) > 180) start = new Date(start.getFullYear() + 1, start.getMonth(), start.getDate(), 12);
    return start;
  }

  function exportScheduleImage() {
    const grid = document.querySelector(".gantt-grid");
    if (!grid) return;

    const dateCells = Array.from(grid.children).filter((child) => child.classList.contains("date-cell") && !child.classList.contains("task-label"));
    const labels = Array.from(grid.children).filter((child) => child.classList.contains("task-label") && !child.classList.contains("date-cell") && !child.hidden);
    const leftWidth = 260;
    const dayWidth = 30;
    const headerHeight = 48;
    const rowHeight = 58;
    const width = leftWidth + dateCells.length * dayWidth;
    const height = headerHeight + labels.length * rowHeight + 26;
    const todayIndex = dateCells.findIndex((cell) => cell.classList.contains("today"));
    const firstVisibleTaskStart = readFirstVisibleTaskStart(labels);
    const scheduleStart = readScheduleStart(dateCells, firstVisibleTaskStart);

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#ffffff"/>`;
    svg += `<rect x="0" y="0" width="${leftWidth}" height="${height}" fill="#ffffff"/><rect x="${leftWidth}" y="0" width="${width - leftWidth}" height="${height}" fill="#fbfcfd"/>`;

    dateCells.forEach((cell, index) => {
      const x = leftWidth + index * dayWidth;
      const isWeekendCell = cell.classList.contains("weekend");
      const isTodayCell = index === todayIndex;
      if (isWeekendCell) svg += `<rect x="${x}" y="0" width="${dayWidth}" height="${height}" fill="#f8f0e7"/>`;
      if (isTodayCell) svg += `<rect x="${x}" y="0" width="${dayWidth}" height="${height}" fill="#fff6f6"/>`;
      svg += `<line x1="${x}" y1="0" x2="${x}" y2="${height}" stroke="#d8dde3" stroke-width="1"/>`;
      svg += svgText(cell.textContent.trim(), x + 4, 28, 11, isTodayCell ? 800 : 600, isTodayCell ? "#d64545" : "#667085");
    });

    svg += `<line x1="${width}" y1="0" x2="${width}" y2="${height}" stroke="#d8dde3"/><line x1="0" y1="${headerHeight}" x2="${width}" y2="${headerHeight}" stroke="#d8dde3"/>`;
    svg += svgText("タスク", 12, 28, 12, 800, "#23272f");

    labels.forEach((label, rowIndex) => {
      const row = label.nextElementSibling;
      const y = headerHeight + rowIndex * rowHeight;
      svg += `<rect x="0" y="${y}" width="${leftWidth}" height="${rowHeight}" fill="#ffffff"/><line x1="0" y1="${y + rowHeight}" x2="${width}" y2="${y + rowHeight}" stroke="#d8dde3"/>`;
      svg += svgText(label.querySelector("strong")?.textContent.trim() || "", 12, y + 23, 12, 800);
      svg += svgText(label.querySelector("span")?.textContent.trim() || "", 12, y + 42, 11, 500, "#667085");

      const bar = row?.querySelector(".task-bar");
      if (!bar) return;
      const dates = readBarDates(bar);
      if (!dates || !scheduleStart) return;
      const leftDays = daysBetween(scheduleStart, dates.start);
      const widthDays = Math.max(1, daysBetween(dates.start, dates.end) + 1);
      const x = leftWidth + leftDays * dayWidth;
      const fill = barColor(bar);

      if (bar.classList.contains("milestone")) {
        svg += `<rect x="${x + 6}" y="${y + 21}" width="16" height="16" rx="3" fill="${fill}" transform="rotate(45 ${x + 14} ${y + 29})"/>`;
      } else {
        const barWidth = Math.max(18, widthDays * dayWidth);
        svg += `<rect x="${x}" y="${y + 18}" width="${barWidth}" height="22" rx="5" fill="${fill}"/>`;
        if (bar.classList.contains("critical")) svg += `<rect x="${x - 1}" y="${y + 17}" width="${barWidth + 2}" height="24" rx="6" fill="none" stroke="#b42318" stroke-width="3"/>`;
        if (bar.classList.contains("late")) svg += `<rect x="${x - 1}" y="${y + 17}" width="${barWidth + 2}" height="24" rx="6" fill="none" stroke="#b42318" stroke-width="3" stroke-dasharray="6 4"/>`;
        svg += svgText(bar.querySelector(".bar-text")?.textContent.trim() || "", x + 8, y + 33, 11, 800, "#ffffff");
      }
    });

    svg += "</svg>";
    const svgUrl = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0);
      URL.revokeObjectURL(svgUrl);
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = `schedule-${new Date().toISOString().slice(0, 10)}.png`;
      link.click();
    };
    image.src = svgUrl;
  }

  function addExportButton() {
    const title = document.querySelector(".gantt-section .section-title");
    if (!title) return;
    const existing = document.querySelector("#scheduleImageButton");
    if (existing?.dataset.scheduleExportBound === "true") return;
    const button = existing ? existing.cloneNode(true) : document.createElement("button");
    if (existing) existing.replaceWith(button);
    button.id = "scheduleImageButton";
    button.type = "button";
    button.dataset.scheduleExportBound = "true";
    button.textContent = "画像を書き出す";
    button.addEventListener("click", exportScheduleImage);
    if (!button.parentElement) title.appendChild(button);
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelector("#resetButton")?.addEventListener("click", () => {
      clearSavedSchedulerState();
      window.location.replace(`${window.location.pathname}?v=20260605-3`);
    });
    addExportButton();
    new MutationObserver(addExportButton).observe(document.querySelector("main"), { childList: true, subtree: true });
  });
})();
