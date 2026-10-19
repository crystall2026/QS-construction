// Logic trung tâm: Tính toán định mức nhân công, phân bổ tổ đội theo giai đoạn & điều khiển giao diện
import { TRADES, LABOR_NORMS, PROJECT_TEMPLATES } from './norms-data.js';
import {
  getActiveApiKey,
  setCustomApiKey,
  matchLaborNorm,
  parseQuickTextLocal,
  analyzeWithGeminiAI,
  parseExcelBOQFile,
  fileToBase64
} from './ai-parser.js';
import { exportFullReportToExcel, downloadSampleBOQExcel } from './exporter.js';

// --- 1. POLYFILLS & MODERN WEB GUIDANCE INITIALIZATION ---
if (!('commandForElement' in HTMLButtonElement.prototype)) {
  (async () => {
    try {
      await import('https://esm.run/invokers-polyfill');
    } catch (err) {
      console.error('Error loading invokers-polyfill:', err);
    }
  })();
}

if (!('popover' in HTMLElement.prototype)) {
  (async () => {
    try {
      await import('https://unpkg.com/@oddbird/popover-polyfill@latest/dist/popover.min.js');
    } catch (err) {
      console.error('Error loading popover-polyfill:', err);
    }
  })();
}

// Fallback & ARIA sync for :user-invalid (required-field-feedback guide)
const UserInvalidFallback = (() => {
  const dirtyState = new WeakMap();

  const updateState = (input) => {
    const isValid = input.checkValidity();
    input.classList.toggle('user-invalid-fallback', !isValid);
    input.classList.toggle('user-valid-fallback', isValid);
    if (!isValid) {
      input.setAttribute('aria-invalid', 'true');
    } else {
      input.removeAttribute('aria-invalid');
    }
  };

  const handleEvent = (event) => {
    const input = event.target;
    if (event.type === 'reset') {
      const controls = input.elements || [];
      for (const control of controls) {
        dirtyState.delete(control);
        control.classList.remove('user-invalid-fallback', 'user-valid-fallback');
        control.removeAttribute('aria-invalid');
      }
      return;
    }
    if (!input || !input.checkValidity) return;

    if (event.type === 'input' || event.type === 'change') {
      const state = dirtyState.get(input) || { hasInteracted: false, hasBlurred: false };
      state.hasInteracted = true;
      dirtyState.set(input, state);
      if (state.hasBlurred) updateState(input);
    } else if (event.type === 'blur') {
      const state = dirtyState.get(input) || { hasInteracted: false, hasBlurred: false };
      state.hasBlurred = true;
      dirtyState.set(input, state);
      if (state.hasInteracted) updateState(input);
    }
  };

  const init = (root = document) => {
    // Sync aria-invalid for all browsers on blur/input
    root.addEventListener('blur', (e) => {
      if (e.target && e.target.matches && e.target.matches('input[required]')) {
        if (!e.target.checkValidity()) {
          e.target.setAttribute('aria-invalid', 'true');
        } else {
          e.target.removeAttribute('aria-invalid');
        }
      }
    }, true);

    root.addEventListener('input', (e) => {
      if (e.target && e.target.matches && e.target.matches('input[required]') && e.target.checkValidity()) {
        e.target.removeAttribute('aria-invalid');
      }
    });

    if (typeof CSS !== 'undefined' && CSS.supports && CSS.supports('selector(:user-invalid)')) return;
    root.addEventListener('blur', handleEvent, true);
    root.addEventListener('input', handleEvent);
    root.addEventListener('change', handleEvent);
    root.addEventListener('reset', handleEvent, true);
  };

  return { init };
})();

// --- 2. APPLICATION STATE ---
const state = {
  projectTitle: PROJECT_TEMPLATES.quickSample.title,
  targetDays: PROJECT_TEMPLATES.quickSample.targetDays,
  difficultyFactor: PROJECT_TEMPLATES.quickSample.difficultyFactor,
  hoursPerDay: 8,
  autoScaleCrewToTargetDays: true,
  executiveNote: 'Định mức đang tính theo năng suất thi công Fitout thực tế của Crystal Interior. Sếp có thể đổi "Tổng số ngày mục tiêu" để hệ thống tự động co giãn số thợ mỗi ngày.',
  tradeWages: Object.fromEntries(
    Object.entries(TRADES).map(([k, v]) => [k, v.defaultDailyWage])
  ),
  items: structuredClone(PROJECT_TEMPLATES.quickSample.items),
  lastUploadedRawText: ''
};

// Hệ số tăng năng suất ngày khi làm thêm giờ (8h = 1.0, 10h = 1.22, 12h = 1.45)
function getShiftMultiplier(hours) {
  const h = Number(hours) || 8;
  if (h <= 8) return 1.0;
  if (h === 10) return 1.22;
  if (h >= 12) return 1.45;
  return h / 8;
}

function formatVND(num) {
  return Math.round(num || 0).toLocaleString('vi-VN') + ' đ';
}

function formatNum(num, decimals = 1) {
  const val = Number(num || 0);
  return Number.isInteger(val) ? val.toString() : val.toFixed(decimals);
}

// --- 3. CORE ENGINE: TÍNH SỐ CÔNG, PHÂN BỔ TỔ ĐỘI & LỊCH BIỂU THEO NGÀY ---
export function calculateProjectManpower() {
  const shiftMult = getShiftMultiplier(state.hoursPerDay);
  const diffFactor = Number(state.difficultyFactor) || 1.0;
  const targetDays = Math.max(1, Math.round(Number(state.targetDays) || 15));

  // Bước 1: Tính hao phí công (Man-days) cho từng hạng mục BOQ
  const enrichedItems = state.items.map((item, idx) => {
    const tradeKey = TRADES[item.trade] ? item.trade : 'FURNITURE';
    const baseProd = Math.max(0.05, Number(item.productivityPerManDay) || 10);
    // Năng suất thực tế 1 người/ngày = (Năng suất chuẩn 8h * Hệ số ca) / Hệ số độ khó mặt bằng
    const effectiveProductivity = (baseProd * shiftMult) / diffFactor;
    const quantity = Math.max(0, Number(item.quantity) || 0);
    const manDays = quantity / effectiveProductivity;

    // Nếu bật chế độ tự động cân đối số thợ theo tiến độ của Sếp:
    const tradeMeta = TRADES[tradeKey];
    const tradeWindowRatio = Math.max(0.25, tradeMeta.endPct - tradeMeta.startPct);
    const maxAllowedItemDays = Math.max(1, Math.round(targetDays * tradeWindowRatio));

    let crewSize = Math.max(1, Math.round(Number(item.crewSize) || 2));
    if (state.autoScaleCrewToTargetDays && manDays > 0) {
      // Nếu số ngày của hạng mục vượt quá khung thời gian của tổ đội, tự động tăng số thợ
      const idealCrew = Math.ceil(manDays / maxAllowedItemDays);
      crewSize = Math.max(1, idealCrew);
      item.crewSize = crewSize;
    }

    const durationDays = crewSize > 0 ? manDays / crewSize : 0;
    const dailyWage = Number(state.tradeWages[tradeKey] || tradeMeta.defaultDailyWage);
    // Nếu tăng ca 10h/12h thì đơn giá ngày công điều chỉnh tương ứng nhưng tính theo công chuẩn đã quy đổi
    const wageWithOvertime = dailyWage * (state.hoursPerDay > 8 ? (state.hoursPerDay === 10 ? 1.25 : 1.5) : 1.0);
    const laborCost = manDays * wageWithOvertime;

    return {
      ...item,
      index: idx + 1,
      trade: tradeKey,
      effectiveProductivity,
      manDays,
      crewSize,
      durationDays,
      dailyWage: Math.round(wageWithOvertime),
      laborCost
    };
  });

  const totalManDays = enrichedItems.reduce((sum, it) => sum + it.manDays, 0);
  const totalLaborCost = enrichedItems.reduce((sum, it) => sum + it.laborCost, 0);

  // Bước 2: Gom nhóm theo Tổ đội chuyên môn (Trade Allocation Summary) & Lập lịch theo ngày
  const dailyTotalWorkers = new Array(targetDays).fill(0);
  const tradeSummaries = [];

  for (const [tradeKey, tradeMeta] of Object.entries(TRADES)) {
    const tradeItems = enrichedItems.filter(it => it.trade === tradeKey && it.quantity > 0);
    if (tradeItems.length === 0) continue;

    const tradeManDays = tradeItems.reduce((s, it) => s + it.manDays, 0);
    const tradeCost = tradeItems.reduce((s, it) => s + it.laborCost, 0);
    const sharePct = totalManDays > 0 ? (tradeManDays / totalManDays) * 100 : 0;

    // Xác định ngày bắt đầu và kết thúc của tổ đội dựa trên trình tự thi công Fitout
    let startDay = Math.max(1, Math.floor(tradeMeta.startPct * targetDays) + 1);
    let endDay = Math.min(targetDays, Math.max(startDay, Math.ceil(tradeMeta.endPct * targetDays)));

    // Nếu dự án chỉ có 1-2 tổ đội (VD: chỉ làm thạch cao + sơn nước), tự động giãn phủ kín tiến độ
    const activeTradeKeys = new Set(enrichedItems.map(i => i.trade));
    if (activeTradeKeys.size <= 2) {
      if (activeTradeKeys.size === 1) {
        startDay = 1;
        endDay = targetDays;
      } else if (tradeKey === 'GYPSUM' || tradeKey === 'MASON' || tradeKey === 'DEMO') {
        startDay = 1;
        endDay = Math.max(1, Math.ceil(targetDays * 0.65));
      } else {
        startDay = Math.max(1, Math.floor(targetDays * 0.35) + 1);
        endDay = targetDays;
      }
    }

    const activeWindowDays = Math.max(1, endDay - startDay + 1);
    // Số thợ trung bình cần bố trí mỗi ngày trong giai đoạn của tổ đội
    const recommendedDailyCrew = Math.max(1, Math.ceil(tradeManDays / activeWindowDays));

    // Phân bổ số thợ từng ngày từ startDay -> endDay sao cho tổng số công khớp thực tế
    const dailyWorkers = new Array(targetDays).fill(0);
    let remainingManDays = Math.ceil(tradeManDays);

    if (tradeKey === 'MEP' && activeWindowDays >= 5 && activeTradeKeys.size >= 3) {
      // Đặc thù Tổ Điện nước MEP: Tập trung đầu kỳ (đi ống âm) và cuối kỳ (lắp đèn, thiết bị)
      for (let d = startDay; d <= endDay; d++) {
        const progressInWindow = (d - startDay) / Math.max(1, activeWindowDays - 1);
        const isPeakMEP = progressInWindow <= 0.35 || progressInWindow >= 0.70;
        const workersToday = isPeakMEP ? recommendedDailyCrew : Math.max(1, Math.floor(recommendedDailyCrew * 0.5));
        dailyWorkers[d - 1] = workersToday;
        dailyTotalWorkers[d - 1] += workersToday;
      }
    } else {
      for (let d = startDay; d <= endDay; d++) {
        if (remainingManDays <= 0) break;
        const daysLeft = endDay - d + 1;
        const workersToday = Math.max(1, Math.min(recommendedDailyCrew + 1, Math.ceil(remainingManDays / daysLeft)));
        dailyWorkers[d - 1] = workersToday;
        dailyTotalWorkers[d - 1] += workersToday;
        remainingManDays -= workersToday;
      }
    }

    const activeDaysCount = dailyWorkers.filter(w => w > 0).length || 1;
    const peakCrew = Math.max(...dailyWorkers, recommendedDailyCrew);

    tradeSummaries.push({
      tradeKey,
      tradeName: tradeMeta.name,
      shortName: tradeMeta.shortName,
      icon: tradeMeta.icon,
      color: tradeMeta.color,
      bgLight: tradeMeta.bgLight,
      roleDesc: tradeMeta.roleDesc,
      itemCount: tradeItems.length,
      totalManDays: tradeManDays,
      sharePct,
      startDay,
      endDay,
      activeDays: activeDaysCount,
      recommendedDailyCrew,
      peakCrew,
      dailyWage: tradeItems[0]?.dailyWage || tradeMeta.defaultDailyWage,
      baseDailyWage: state.tradeWages[tradeKey] || tradeMeta.defaultDailyWage,
      totalCost: tradeCost,
      dailyWorkers
    });
  }

  const peakWorkers = dailyTotalWorkers.length > 0 ? Math.max(...dailyTotalWorkers, 0) : 0;
  const avgDailyWorkers = targetDays > 0 ? totalManDays / targetDays : 0;

  return {
    targetDays,
    totalManDays,
    totalLaborCost,
    peakWorkers,
    avgDailyWorkers,
    enrichedItems,
    tradeSummaries,
    dailyTotalWorkers
  };
}

// --- 4. RENDERING FUNCTIONS ---
function renderAll() {
  const calc = calculateProjectManpower();

  // Cập nhật các input điều khiển trên Header/Control Bar
  const titleInput = document.getElementById('project-title-input');
  if (titleInput && document.activeElement !== titleInput) {
    titleInput.value = state.projectTitle;
  }
  const daysInput = document.getElementById('target-days-input');
  if (daysInput && document.activeElement !== daysInput) {
    daysInput.value = state.targetDays;
  }
  const diffSelect = document.getElementById('difficulty-select');
  if (diffSelect) diffSelect.value = String(state.difficultyFactor);

  const shiftSelect = document.getElementById('shift-select');
  if (shiftSelect) shiftSelect.value = String(state.hoursPerDay);

  const autoScaleCheckbox = document.getElementById('auto-scale-crew');
  if (autoScaleCheckbox) autoScaleCheckbox.checked = state.autoScaleCrewToTargetDays;

  // Cập nhật lời nhắn QS Trưởng
  const execNoteEl = document.getElementById('executive-note-text');
  if (execNoteEl) execNoteEl.textContent = state.executiveNote;

  // 1. Render 4 Thẻ KPI Tổng quan cho Sếp
  document.getElementById('kpi-total-mandays').textContent = `${formatNum(calc.totalManDays, 1)} công`;
  document.getElementById('kpi-mandays-sub').textContent =
    `${calc.enrichedItems.length} hạng mục | ${calc.tradeSummaries.length} tổ đội chuyên môn`;

  document.getElementById('kpi-target-days').textContent = `${calc.targetDays} ngày`;
  const urgencyBadge = document.getElementById('kpi-urgency-badge');
  if (calc.peakWorkers > 22) {
    urgencyBadge.textContent = '⚠️ Mật độ thợ cao - Cần chia ca';
    urgencyBadge.className = 'status-pill pill-warn';
  } else {
    urgencyBadge.textContent = '✅ Tiến độ khả thi & an toàn';
    urgencyBadge.className = 'status-pill pill-ok';
  }

  document.getElementById('kpi-crew-allocation').textContent =
    `${Math.ceil(calc.avgDailyWorkers)} – ${calc.peakWorkers} thợ/ngày`;
  document.getElementById('kpi-crew-sub').textContent =
    `Trung bình ${formatNum(calc.avgDailyWorkers, 1)} người/ngày | Cao điểm: ${calc.peakWorkers} người`;

  document.getElementById('kpi-total-cost').textContent = formatVND(calc.totalLaborCost);
  document.getElementById('kpi-cost-sub').textContent =
    `Bình quân ~${formatVND(calc.totalManDays > 0 ? calc.totalLaborCost / calc.totalManDays : 0)}/công (${state.hoursPerDay}h/ngày)`;

  // 2. Render Bảng Tổng Hợp Phân Bổ Thợ Theo Tổ Đội (Executive Summary Table)
  renderTradeSummaryTable(calc);

  // 3. Render Bảng Lịch Điều Phối Thợ Theo Ngày (Gantt / Heatmap Matrix)
  renderDailyScheduleMatrix(calc);

  // 4. Render Bảng Chi Tiết Khối Lượng BOQ & Hao Phí Nhân Công
  renderBOQDetailTable(calc);

  // Lưu trạng thái gần nhất vào window để nút Xuất Excel truy cập tức thì
  window.__latestCalcResult = calc;
}

function renderTradeSummaryTable(calc) {
  const tbody = document.getElementById('trade-summary-tbody');
  const tfoot = document.getElementById('trade-summary-tfoot');
  if (!tbody || !tfoot) return;

  if (calc.tradeSummaries.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="empty-cell">Chưa có hạng mục nào. Hãy nhập khối lượng hoặc tải file BOQ ở trên.</td></tr>`;
    tfoot.innerHTML = '';
    return;
  }

  tbody.innerHTML = calc.tradeSummaries.map((ts, i) => `
    <tr>
      <td class="text-center font-semibold">${i + 1}</td>
      <td>
        <div class="trade-cell">
          <span class="trade-badge" style="background:${ts.bgLight}; color:${ts.color}; border:1px solid ${ts.color}40;">
            ${ts.icon} ${ts.tradeName}
          </span>
          <div class="trade-desc">${ts.roleDesc} (${ts.itemCount} đầu việc)</div>
        </div>
      </td>
      <td class="text-right">
        <div class="manday-strong">${formatNum(ts.totalManDays, 1)} công</div>
        <div class="progress-mini-wrap" title="Chiếm ${formatNum(ts.sharePct, 1)}% tổng nhân công">
          <div class="progress-mini-bar" style="width:${Math.min(100, ts.sharePct)}%; background:${ts.color};"></div>
        </div>
      </td>
      <td class="text-center">
        <span class="phase-tag">Ngày ${ts.startDay} ➔ Ngày ${ts.endDay}</span>
        <div class="sub-text">Làm trong <strong>${ts.activeDays} ngày</strong></div>
      </td>
      <td class="text-center highlight-col">
        <div class="worker-count-badge" style="background:${ts.color};">
          👷 ${ts.recommendedDailyCrew} thợ / ngày
        </div>
        <div class="sub-text">Lúc đông nhất: ${ts.peakCrew} người</div>
      </td>
      <td class="text-right">
        <input
          type="number"
          class="table-inline-input wage-input"
          data-trade="${ts.tradeKey}"
          value="${ts.baseDailyWage}"
          step="10000"
          min="100000"
          aria-label="Đơn giá công 8h của ${ts.tradeName}"
        />
        <div class="sub-text">VNĐ / công 8h</div>
      </td>
      <td class="text-right font-bold cost-cell">${formatVND(ts.totalCost)}</td>
    </tr>
  `).join('');

  tfoot.innerHTML = `
    <tr class="summary-footer-row">
      <td colspan="2"><strong>TỔNG HỢP NHÂN LỰC TOÀN DỰ ÁN</strong></td>
      <td class="text-right"><strong>${formatNum(calc.totalManDays, 1)} công</strong></td>
      <td class="text-center"><strong>Tổng tiến độ: ${calc.targetDays} ngày</strong></td>
      <td class="text-center highlight-col">
        <strong>TB: ${formatNum(calc.avgDailyWorkers, 1)} thợ/ngày (Đỉnh: ${calc.peakWorkers} người)</strong>
      </td>
      <td class="text-right">Đơn giá ca ${state.hoursPerDay}h</td>
      <td class="text-right cost-total-highlight"><strong>${formatVND(calc.totalLaborCost)}</strong></td>
    </tr>
  `;

  // Gắn sự kiện đổi đơn giá ngày công theo tổ đội
  tbody.querySelectorAll('.wage-input').forEach(inp => {
    inp.addEventListener('change', (e) => {
      const tk = e.target.getAttribute('data-trade');
      const val = Math.max(50000, parseFloat(e.target.value) || 500000);
      state.tradeWages[tk] = val;
      renderAll();
    });
  });
}

function renderDailyScheduleMatrix(calc) {
  const thead = document.getElementById('schedule-matrix-thead');
  const tbody = document.getElementById('schedule-matrix-tbody');
  const tfoot = document.getElementById('schedule-matrix-tfoot');
  if (!thead || !tbody || !tfoot) return;

  const days = calc.targetDays;
  let headerHTML = `<tr>
    <th class="sticky-col-left">Tổ đội chuyên môn</th>
    <th class="text-center">Tổng công</th>
    <th class="text-center">Cần bố trí</th>`;

  for (let d = 1; d <= days; d++) {
    headerHTML += `<th class="day-col-header">N${d}</th>`;
  }
  headerHTML += `</tr>`;
  thead.innerHTML = headerHTML;

  tbody.innerHTML = calc.tradeSummaries.map(ts => {
    let rowHTML = `<tr>
      <td class="sticky-col-left">
        <span class="matrix-trade-name" style="color:${ts.color}; font-weight:600;">
          ${ts.icon} ${ts.shortName}
        </span>
      </td>
      <td class="text-center font-semibold">${formatNum(ts.totalManDays, 1)}</td>
      <td class="text-center"><span class="mini-crew-pill">${ts.recommendedDailyCrew} người</span></td>`;

    for (let d = 1; d <= days; d++) {
      const w = ts.dailyWorkers[d - 1] || 0;
      if (w > 0) {
        rowHTML += `<td class="day-cell active-day-cell" style="background:${ts.color}22; color:${ts.color}; border-color:${ts.color}55;" title="${ts.tradeName} - Ngày ${d}: ${w} thợ">
          <strong>${w}</strong>
        </td>`;
      } else {
        rowHTML += `<td class="day-cell empty-day-cell">·</td>`;
      }
    }
    rowHTML += `</tr>`;
    return rowHTML;
  }).join('');

  let footHTML = `<tr class="matrix-total-row">
    <td class="sticky-col-left"><strong>TỔNG THỢ TRÊN CÔNG TRƯỜNG</strong></td>
    <td class="text-center"><strong>${formatNum(calc.totalManDays, 1)}</strong></td>
    <td class="text-center"><strong>Đỉnh: ${calc.peakWorkers}</strong></td>`;

  for (let d = 1; d <= days; d++) {
    const totalDay = calc.dailyTotalWorkers[d - 1] || 0;
    const isPeak = totalDay === calc.peakWorkers && totalDay > 0;
    footHTML += `<td class="day-cell total-day-cell ${isPeak ? 'peak-day-cell' : ''}" title="Tổng quân số Ngày ${d}: ${totalDay} người">
      <strong>${totalDay}</strong>
    </td>`;
  }
  footHTML += `</tr>`;
  tfoot.innerHTML = footHTML;
}

function renderBOQDetailTable(calc) {
  const tbody = document.getElementById('boq-detail-tbody');
  const tfoot = document.getElementById('boq-detail-tfoot');
  if (!tbody || !tfoot) return;

  if (calc.enrichedItems.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" class="empty-cell">Danh sách BOQ trống. Vui lòng thêm công việc hoặc tải file BOQ.</td></tr>`;
    tfoot.innerHTML = '';
    return;
  }

  const tradeOptionsHTML = (selectedTrade) =>
    Object.entries(TRADES).map(([k, v]) =>
      `<option value="${k}" ${k === selectedTrade ? 'selected' : ''}>${v.icon} ${v.shortName}</option>`
    ).join('');

  tbody.innerHTML = calc.enrichedItems.map((item, idx) => {
    const tradeInfo = TRADES[item.trade] || TRADES.FURNITURE;
    return `
      <tr data-row-index="${idx}">
        <td class="text-center font-semibold">${idx + 1}</td>
        <td>
          <input
            type="text"
            class="table-inline-input item-name-input"
            data-idx="${idx}"
            value="${item.name.replace(/"/g, '&quot;')}"
            aria-label="Tên hạng mục ${idx + 1}"
          />
        </td>
        <td>
          <select class="table-inline-select item-trade-select" data-idx="${idx}" aria-label="Tổ đội hạng mục ${idx + 1}" style="border-left: 3px solid ${tradeInfo.color};">
            ${tradeOptionsHTML(item.trade)}
          </select>
        </td>
        <td class="text-center">
          <input
            type="text"
            class="table-inline-input item-unit-input text-center"
            data-idx="${idx}"
            value="${item.unit}"
            aria-label="Đơn vị tính dòng ${idx + 1}"
          />
        </td>
        <td class="text-right">
          <input
            type="number"
            class="table-inline-input item-qty-input text-right font-bold"
            data-idx="${idx}"
            value="${item.quantity}"
            min="0.1"
            step="any"
            aria-label="Khối lượng dòng ${idx + 1}"
          />
        </td>
        <td class="text-right">
          <input
            type="number"
            class="table-inline-input item-prod-input text-right"
            data-idx="${idx}"
            value="${item.productivityPerManDay}"
            min="0.1"
            step="0.5"
            title="Khối lượng 1 thợ làm xong trong 1 công 8h"
            aria-label="Định mức năng suất dòng ${idx + 1}"
          />
          <div class="sub-text">${item.unit}/công</div>
        </td>
        <td class="text-right highlight-mandays">
          <strong>${formatNum(item.manDays, 1)}</strong> công
        </td>
        <td class="text-center">
          <input
            type="number"
            class="table-inline-input item-crew-input text-center"
            data-idx="${idx}"
            value="${item.crewSize}"
            min="1"
            max="50"
            step="1"
            aria-label="Số thợ bố trí dòng ${idx + 1}"
          />
          <div class="sub-text">người</div>
        </td>
        <td class="text-center">
          <span class="days-pill">${formatNum(item.durationDays, 1)} ngày</span>
        </td>
        <td class="text-right font-semibold">${formatVND(item.laborCost)}</td>
        <td class="text-center">
          <button type="button" class="btn-icon-delete" data-delete-idx="${idx}" title="Xóa dòng này" aria-label="Xóa dòng ${idx + 1}">✕</button>
        </td>
      </tr>
    `;
  }).join('');

  tfoot.innerHTML = `
    <tr class="summary-footer-row">
      <td colspan="6"><strong>TỔNG CỘNG HAO PHÍ NHÂN CÔNG THEO BOQ (${calc.enrichedItems.length} HẠNG MỤC)</strong></td>
      <td class="text-right highlight-mandays"><strong>${formatNum(calc.totalManDays, 1)} công</strong></td>
      <td class="text-center"><strong>Peak: ${calc.peakWorkers} thợ</strong></td>
      <td class="text-center"><strong>${calc.targetDays} ngày</strong></td>
      <td class="text-right cost-total-highlight"><strong>${formatVND(calc.totalLaborCost)}</strong></td>
      <td></td>
    </tr>
  `;

  // Sự kiện chỉnh sửa trực tiếp trên từng dòng BOQ
  tbody.querySelectorAll('.item-name-input').forEach(el => {
    el.addEventListener('change', (e) => {
      const i = Number(e.target.dataset.idx);
      state.items[i].name = e.target.value.trim() || 'Hạng mục thi công';
      // Tự động gợi ý lại tổ đội nếu người dùng gõ tên công việc mới
      const matched = matchLaborNorm(state.items[i].name, state.items[i].unit);
      state.items[i].trade = matched.trade;
      state.items[i].productivityPerManDay = matched.productivityPerManDay;
      state.items[i].unit = matched.unit;
      renderAll();
    });
  });

  tbody.querySelectorAll('.item-trade-select').forEach(el => {
    el.addEventListener('change', (e) => {
      const i = Number(e.target.dataset.idx);
      state.items[i].trade = e.target.value;
      renderAll();
    });
  });

  tbody.querySelectorAll('.item-unit-input').forEach(el => {
    el.addEventListener('change', (e) => {
      const i = Number(e.target.dataset.idx);
      state.items[i].unit = e.target.value.trim() || 'm2';
      renderAll();
    });
  });

  tbody.querySelectorAll('.item-qty-input').forEach(el => {
    el.addEventListener('input', (e) => {
      const i = Number(e.target.dataset.idx);
      const val = parseFloat(e.target.value);
      if (!isNaN(val) && val >= 0) {
        state.items[i].quantity = val;
        renderAll();
      }
    });
  });

  tbody.querySelectorAll('.item-prod-input').forEach(el => {
    el.addEventListener('change', (e) => {
      const i = Number(e.target.dataset.idx);
      const val = parseFloat(e.target.value);
      if (!isNaN(val) && val > 0) {
        state.items[i].productivityPerManDay = val;
        renderAll();
      }
    });
  });

  tbody.querySelectorAll('.item-crew-input').forEach(el => {
    el.addEventListener('change', (e) => {
      const i = Number(e.target.dataset.idx);
      const val = parseInt(e.target.value, 10);
      if (!isNaN(val) && val >= 1) {
        // Khi người dùng tự chỉnh số thợ tay trên dòng, tắt chế độ auto-scale để tôn trọng số thợ vừa nhập
        state.autoScaleCrewToTargetDays = false;
        state.items[i].crewSize = val;
        renderAll();
      }
    });
  });

  tbody.querySelectorAll('.btn-icon-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const i = Number(e.currentTarget.dataset.deleteIdx);
      state.items.splice(i, 1);
      renderAll();
    });
  });
}

// Render Bảng Thư Viện Định Mức Chuẩn trong Modal Dialog
function renderNormsLibraryModal() {
  const tbody = document.getElementById('norms-library-tbody');
  if (!tbody) return;

  tbody.innerHTML = LABOR_NORMS.map(norm => {
    const tr = TRADES[norm.trade] || TRADES.FURNITURE;
    return `
      <tr>
        <td><code>${norm.code}</code></td>
        <td><strong>${norm.name}</strong><div class="sub-text">${norm.note}</div></td>
        <td><span class="trade-badge" style="background:${tr.bgLight}; color:${tr.color};">${tr.icon} ${tr.shortName}</span></td>
        <td class="text-center">${norm.unit}</td>
        <td class="text-right"><strong>${norm.productivityPerManDay} ${norm.unit}/công</strong></td>
        <td class="text-center">
          <button type="button" class="btn-secondary btn-sm add-norm-to-boq" data-code="${norm.code}">+ Đưa vào BOQ</button>
        </td>
      </tr>
    `;
  }).join('');

  tbody.querySelectorAll('.add-norm-to-boq').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const code = e.currentTarget.getAttribute('data-code');
      const found = LABOR_NORMS.find(n => n.code === code);
      if (found) {
        state.items.push({
          code: found.code,
          name: found.name,
          trade: found.trade,
          unit: found.unit,
          quantity: 50,
          productivityPerManDay: found.productivityPerManDay,
          crewSize: found.defaultCrewSize
        });
        renderAll();
        showToast(`Đã thêm "${found.name}" vào bảng dự toán!`);
      }
    });
  });
}

function showToast(msg, isError = false) {
  const toast = document.getElementById('app-toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = `app-toast show ${isError ? 'toast-error' : 'toast-success'}`;
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => {
    toast.className = 'app-toast';
  }, 4200);
}

function setLoadingStatus(isLoading, message = '') {
  const statusBox = document.getElementById('ai-status-banner');
  if (!statusBox) return;
  if (!isLoading) {
    statusBox.hidden = true;
    return;
  }
  statusBox.hidden = false;
  statusBox.innerHTML = `<span class="spinner"></span> <span>${message}</span>`;
}

// --- 5. EVENT LISTENERS & WORKFLOWS ---
function setupEventListeners() {
  UserInvalidFallback.init(document);

  // 1. Điều chỉnh thông số dự án (Tên, Tổng số ngày mục tiêu, Ca làm việc, Độ khó)
  document.getElementById('project-title-input')?.addEventListener('input', (e) => {
    state.projectTitle = e.target.value;
  });

  document.getElementById('target-days-input')?.addEventListener('input', (e) => {
    const d = parseInt(e.target.value, 10);
    if (!isNaN(d) && d >= 1 && d <= 365) {
      state.targetDays = d;
      renderAll();
    }
  });

  document.getElementById('difficulty-select')?.addEventListener('change', (e) => {
    state.difficultyFactor = parseFloat(e.target.value) || 1.0;
    renderAll();
  });

  document.getElementById('shift-select')?.addEventListener('change', (e) => {
    state.hoursPerDay = parseInt(e.target.value, 10) || 8;
    renderAll();
  });

  document.getElementById('auto-scale-crew')?.addEventListener('change', (e) => {
    state.autoScaleCrewToTargetDays = e.target.checked;
    renderAll();
  });

  // 2. Chọn Dự án Mẫu (Templates)
  document.querySelectorAll('[data-template]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const key = e.currentTarget.getAttribute('data-template');
      const tpl = PROJECT_TEMPLATES[key];
      if (!tpl) return;
      state.projectTitle = tpl.title;
      state.targetDays = tpl.targetDays;
      state.difficultyFactor = tpl.difficultyFactor;
      state.autoScaleCrewToTargetDays = true;
      state.items = structuredClone(tpl.items);
      state.executiveNote = `Đã nạp mẫu "${tpl.title}". Sếp có thể xem ngay phân bổ số thợ từng tổ đội bên dưới hoặc chỉnh sửa khối lượng bất kỳ.`;
      renderAll();
      showToast(`Đã nạp dự án mẫu: ${tpl.title}`);
    });
  });

  // 3. Form Nhập Nhanh Khối Lượng Tổng (Ví dụ: 100m2 tường thạch cao, 200m2 sơn nước...)
  const quickGridForm = document.getElementById('quick-grid-form');
  quickGridForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const quickConfigs = [
      { id: 'q-gypsum-wall', code: 'GYP-02', name: 'Thi công vách tường thạch cao 2 mặt khung xương Vĩnh Tường', trade: 'GYPSUM', unit: 'm2', prod: 9.0, crew: 3 },
      { id: 'q-gypsum-ceil', code: 'GYP-04', name: 'Thi công trần thạch cao khung chìm hoàn thiện', trade: 'GYPSUM', unit: 'm2', prod: 11.0, crew: 3 },
      { id: 'q-paint', code: 'PNT-01', name: 'Bả bột matit 2 lớp + xả nhám + sơn nước hoàn thiện', trade: 'PAINT', unit: 'm2', prod: 18.0, crew: 3 },
      { id: 'q-tile', code: 'MAS-06', name: 'Thi công ốp lát gạch nền & tường hoàn thiện chà ron', trade: 'MASON', unit: 'm2', prod: 7.5, crew: 2 },
      { id: 'q-mep', code: 'MEP-01', name: 'Thi công hệ thống Điện - Chiếu sáng MEP trọn gói (theo m2 sàn)', trade: 'MEP', unit: 'm2', prod: 8.0, crew: 3 },
      { id: 'q-floor', code: 'FLR-01', name: 'Lát sàn gỗ công nghiệp / sàn nhựa SPC hoàn thiện', trade: 'FLOOR', unit: 'm2', prod: 25.0, crew: 2 },
      { id: 'q-furniture', code: 'FUR-02', name: 'Lắp đặt nội thất gỗ (tủ áo, tủ bếp, vách ốp gỗ Fitout)', trade: 'FURNITURE', unit: 'm2', prod: 4.0, crew: 3 },
      { id: 'q-demo', code: 'DEMO-01', name: 'Tháo dỡ hiện trạng cũ & vệ sinh công nghiệp bàn giao', trade: 'DEMO', unit: 'm2', prod: 25.0, crew: 3 }
    ];

    const newItems = [];
    for (const cfg of quickConfigs) {
      const val = parseFloat(document.getElementById(cfg.id)?.value || '0');
      if (!isNaN(val) && val > 0) {
        newItems.push({
          code: cfg.code,
          name: cfg.name,
          trade: cfg.trade,
          unit: cfg.unit,
          quantity: val,
          productivityPerManDay: cfg.prod,
          crewSize: cfg.crew
        });
      }
    }

    if (newItems.length === 0) {
      showToast('Vui lòng nhập ít nhất 1 khối lượng lớn hơn 0 (VD: 100 m2 vách thạch cao).', true);
      return;
    }

    const replaceMode = document.getElementById('quick-replace-checkbox')?.checked ?? true;
    if (replaceMode) {
      state.items = newItems;
      state.projectTitle = `Dự toán Nhanh (${newItems.map(i => `${i.quantity}${i.unit} ${TRADES[i.trade].shortName}`).slice(0, 3).join(' + ')})`;
    } else {
      state.items.push(...newItems);
    }

    state.autoScaleCrewToTargetDays = true;
    state.executiveNote = `Đã tính toán từ bảng Nhập Khối Lượng Tổng (${newItems.length} hạng mục chính).`;
    renderAll();
    showToast(`Đã tính toán nhân công cho ${newItems.length} hạng mục khối lượng tổng!`);
  });

  // 4. Ô Nhập Câu Tự Nhiên (Quick Natural Text / AI Prompt)
  const nlForm = document.getElementById('nl-prompt-form');
  nlForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputEl = document.getElementById('nl-prompt-input');
    if (!inputEl || !inputEl.checkValidity()) return;

    const text = inputEl.value.trim();
    const parsedItems = parseQuickTextLocal(text);
    if (parsedItems.length > 0) {
      state.items = parsedItems;
      state.projectTitle = `Dự toán từ yêu cầu nhanh (${parsedItems.length} hạng mục)`;
      state.executiveNote = `Đã bóc tách nhanh ${parsedItems.length} hạng mục từ mô tả của Sếp. Có thể bấm "Phân tích sâu bằng Gemini AI" nếu muốn AI tách chi tiết hơn.`;
      renderAll();
      showToast(`Đã bóc tách tức thì ${parsedItems.length} hạng mục công việc!`);
    } else {
      // Nếu câu quá phức tạp không có số rõ ràng, tự động gọi Gemini AI
      triggerGeminiTextAnalysis(text);
    }
  });

  document.getElementById('btn-ai-deep-parse')?.addEventListener('click', () => {
    const inputEl = document.getElementById('nl-prompt-input');
    const text = inputEl?.value?.trim() || state.lastUploadedRawText;
    if (!text) {
      if (inputEl) {
        inputEl.focus();
        inputEl.setAttribute('aria-invalid', 'true');
        inputEl.classList.add('user-invalid-fallback');
      }
      showToast('Hãy nhập yêu cầu khối lượng công việc hoặc tải file BOQ trước khi gọi Gemini AI.', true);
      return;
    }
    triggerGeminiTextAnalysis(text);
  });

  // 5. Upload File BOQ Excel (.xlsx, .xls, .csv) hoặc PDF (.pdf)
  const fileInput = document.getElementById('boq-file-input');
  const dropZone = document.getElementById('boq-dropzone');

  fileInput?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (file) await handleUploadedBOQFile(file);
    fileInput.value = '';
  });

  if (dropZone) {
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('drag-active');
    });
    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('drag-active');
    });
    dropZone.addEventListener('drop', async (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-active');
      const file = e.dataTransfer?.files?.[0];
      if (file) await handleUploadedBOQFile(file);
    });
  }

  // 6. Thêm dòng công việc thủ công & Xóa hết
  document.getElementById('btn-add-blank-row')?.addEventListener('click', () => {
    state.items.push({
      code: 'GYP-02',
      name: 'Thi công hạng mục mới (nhấp để sửa tên)',
      trade: 'GYPSUM',
      unit: 'm2',
      quantity: 50,
      productivityPerManDay: 9.0,
      crewSize: 2
    });
    renderAll();
  });

  // 7. Xuất Excel, Tải BOQ Mẫu & In Báo Cáo PDF trình Sếp
  document.getElementById('btn-export-excel')?.addEventListener('click', () => {
    const calc = window.__latestCalcResult || calculateProjectManpower();
    exportFullReportToExcel(calc, {
      title: state.projectTitle,
      targetDays: state.targetDays,
      difficultyFactor: state.difficultyFactor,
      hoursPerDay: state.hoursPerDay
    });
    showToast('Đã xuất file Excel Báo cáo Dự toán & Phân bổ Thợ!');
  });

  document.getElementById('btn-download-sample-boq')?.addEventListener('click', () => {
    downloadSampleBOQExcel();
    showToast('Đã tải xuống file BOQ_Mau_Fitout_Crystal_Interior.xlsx!');
  });

  document.getElementById('btn-print-report')?.addEventListener('click', () => {
    window.print();
  });

  // 8. Lưu cài đặt Google API Key
  const apiKeyForm = document.getElementById('api-key-form');
  apiKeyForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const inp = document.getElementById('custom-api-key-input');
    setCustomApiKey(inp?.value || '');
    showToast('Đã lưu cấu hình Google Gemini API Key!');
    document.getElementById('settings-dialog')?.close();
  });
}

async function triggerGeminiTextAnalysis(text) {
  try {
    setLoadingStatus(true, 'Đang dùng Google Gemini AI phân tích khối lượng & định mức nhân công...');
    const aiRes = await analyzeWithGeminiAI({ textContent: text });
    if (aiRes?.items?.length > 0) {
      state.items = aiRes.items;
      if (aiRes.projectTitle) state.projectTitle = aiRes.projectTitle;
      if (aiRes.recommendedTargetDays) state.targetDays = aiRes.recommendedTargetDays;
      if (aiRes.executiveNote) state.executiveNote = `✨ Gemini AI QS: ${aiRes.executiveNote}`;
      state.autoScaleCrewToTargetDays = true;
      renderAll();
      showToast(`Gemini AI đã bóc tách thành công ${aiRes.items.length} hạng mục công việc!`);
    } else {
      showToast('AI không tìm thấy hạng mục khối lượng nào rõ ràng.', true);
    }
  } catch (err) {
    console.error(err);
    showToast(`Lỗi gọi AI: ${err.message}. Đã dùng bộ phân tích định mức nội bộ.`, true);
  } finally {
    setLoadingStatus(false);
  }
}

async function handleUploadedBOQFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  try {
    if (['xlsx', 'xls', 'csv'].includes(ext)) {
      setLoadingStatus(true, `Đang đọc bảng BOQ Excel "${file.name}"...`);
      const { items, rawText } = await parseExcelBOQFile(file);
      state.lastUploadedRawText = rawText;

      if (items.length > 0) {
        state.items = items;
        state.projectTitle = `BOQ: ${file.name.replace(/\.[^.]+$/, '')}`;
        state.autoScaleCrewToTargetDays = true;
        state.executiveNote = `Đã bóc tách tự động ${items.length} hạng mục từ file "${file.name}". Sếp có thể bấm "✨ Phân Tích Sâu Bằng Gemini AI" nếu muốn AI rà soát lại các dòng mô tả phức tạp.`;
        renderAll();
        showToast(`Đã đọc thành công ${items.length} hạng mục từ file Excel "${file.name}"!`);
      } else if (rawText) {
        // Nếu file Excel có cấu trúc lạ, chuyển sang Gemini AI bóc tách
        await triggerGeminiTextAnalysis(`Hãy bóc tách bảng BOQ sau từ file ${file.name}:\n${rawText}`);
      } else {
        showToast('Không tìm thấy dữ liệu hợp lệ trong file Excel.', true);
      }
    } else if (ext === 'pdf') {
      setLoadingStatus(true, `Đang gửi file PDF "${file.name}" tới Google Gemini AI để đọc bảng BOQ...`);
      const base64Data = await fileToBase64(file);
      const aiRes = await analyzeWithGeminiAI({
        textContent: `Đọc bảng BOQ từ file PDF "${file.name}" và trích xuất toàn bộ các hạng mục công việc kèm khối lượng, đơn vị, tổ đội và định mức nhân công.`,
        pdfBase64: base64Data
      });
      if (aiRes?.items?.length > 0) {
        state.items = aiRes.items;
        state.projectTitle = aiRes.projectTitle || `BOQ PDF: ${file.name.replace(/\.pdf$/i, '')}`;
        if (aiRes.recommendedTargetDays) state.targetDays = aiRes.recommendedTargetDays;
        state.executiveNote = aiRes.executiveNote || `Đã trích xuất ${aiRes.items.length} hạng mục từ file PDF "${file.name}" bằng Gemini AI.`;
        state.autoScaleCrewToTargetDays = true;
        renderAll();
        showToast(`Đã bóc tách ${aiRes.items.length} hạng mục từ PDF "${file.name}"!`);
      } else {
        showToast('Không tìm thấy bảng khối lượng trong file PDF.', true);
      }
    } else {
      showToast('Vui lòng chọn file định dạng Excel (.xlsx, .xls, .csv) hoặc PDF (.pdf).', true);
    }
  } catch (err) {
    console.error(err);
    showToast(`Lỗi xử lý file "${file.name}": ${err.message}`, true);
  } finally {
    setLoadingStatus(false);
  }
}

// Khởi chạy ứng dụng khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
  renderNormsLibraryModal();
  setupEventListeners();
  renderAll();
});
