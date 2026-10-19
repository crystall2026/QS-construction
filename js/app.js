// Logic trung tâm: Dashboard gọn gàng, Modal Nhập liệu & Thiết lập, Phân loại dự án (Tòa nhà, Căn hộ, Nhà phố, Shophouse), Lịch Thứ 7 - CN & Xuất PDF hoàn hảo
import {
  TRADES,
  LABOR_NORMS,
  PROJECT_TEMPLATES,
  WEEKEND_TAGS,
  PROJECT_TYPES,
  getActiveLaborNorms,
  saveActiveLaborNorms,
  resetLaborNormsToDefault
} from './norms-data.js';
import {
  getActiveApiKey,
  setCustomApiKey,
  matchLaborNorm,
  detectWeekendPolicyFromText,
  parseQuickTextLocal,
  analyzeWithGeminiAI,
  generateAIConsultingReport,
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

// --- 2. HỖ TRỢ LỊCH THỨ 7 - CHỦ NHẬT & NGÀY KHỞI CÔNG ---
function getTodayISOString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const DOW_NAMES_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const DOW_NAMES_FULL = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];

export const WEEKEND_MODES = {
  FULL_WITH_WEEKEND_BOOST: {
    id: 'FULL_WITH_WEEKEND_BOOST',
    label: 'Có làm cả Thứ 7 & Chủ Nhật (Tranh thủ dồn việc ồn/khoan đục/thang hàng vào T7-CN)',
    shortDesc: 'Làm xuyên suốt 7 ngày/tuần — Ưu tiên việc ồn cuối tuần'
  },
  WEEKEND_NOISY_FOCUS: {
    id: 'WEEKEND_NOISY_FOCUS',
    label: 'Tòa nhà Văn phòng nghiêm ngặt (T2–T6 chỉ làm êm, DỒN VIỆC ỒN/KHOAN CẮT VÀO T7 & CN)',
    shortDesc: 'T2-T6 làm việc êm, T7-CN tổng lực khoan đục & chuyển vật tư'
  },
  SAT_WORK_SUN_OFF: {
    id: 'SAT_WORK_SUN_OFF',
    label: 'Làm Thứ 2 đến Thứ 7 — Nghỉ Chủ Nhật (Tranh thủ làm việc ồn vào Thứ 7)',
    shortDesc: 'Nghỉ Chủ Nhật (Tự động cộng bù ngày CN vào ngày kết thúc)'
  },
  MON_FRI_ONLY: {
    id: 'MON_FRI_ONLY',
    label: 'Không làm Thứ 7 & Chủ Nhật (Tòa nhà cấm thi công cuối tuần — Chỉ làm T2 đến T6)',
    shortDesc: 'Nghỉ T7 & CN (Tự động lùi ngày kết thúc qua các ngày cuối tuần)'
  }
};

function buildProjectCalendar(startDateISO, targetWorkingDays, weekendMode) {
  const parts = (startDateISO || getTodayISOString()).split('-').map(Number);
  const startObj = new Date(parts[0], (parts[1] || 1) - 1, parts[2] || 1);
  if (isNaN(startObj.getTime())) {
    startObj.setTime(Date.now());
  }

  const calendarDays = [];
  let workingDaysAccum = 0;
  let cursor = new Date(startObj);
  let safetyCounter = 0;

  while (workingDaysAccum < targetWorkingDays && safetyCounter < 500) {
    safetyCounter++;
    const dow = cursor.getDay();
    const isSat = dow === 6;
    const isSun = dow === 0;
    const isWeekend = isSat || isSun;

    let isWorkingDay = true;
    if (weekendMode === 'MON_FRI_ONLY' && isWeekend) {
      isWorkingDay = false;
    } else if (weekendMode === 'SAT_WORK_SUN_OFF' && isSun) {
      isWorkingDay = false;
    }

    if (isWorkingDay) {
      workingDaysAccum++;
    }

    const dd = String(cursor.getDate()).padStart(2, '0');
    const mm = String(cursor.getMonth() + 1).padStart(2, '0');
    const yyyy = cursor.getFullYear();

    calendarDays.push({
      dayIndex: calendarDays.length + 1,
      workingDayIndex: isWorkingDay ? workingDaysAccum : null,
      dateObj: new Date(cursor),
      dateShort: `${dd}/${mm}`,
      dateFull: `${DOW_NAMES_FULL[dow]}, ${dd}/${mm}/${yyyy}`,
      dow,
      dowShort: DOW_NAMES_SHORT[dow],
      isSat,
      isSun,
      isWeekend,
      isWorkingDay
    });

    cursor.setDate(cursor.getDate() + 1);
  }

  const firstDay = calendarDays[0];
  const lastDay = calendarDays[calendarDays.length - 1] || firstDay;
  const weekendCount = calendarDays.filter(d => d.isWeekend).length;
  const weekendWorkingCount = calendarDays.filter(d => d.isWeekend && d.isWorkingDay).length;
  const weekendOffCount = calendarDays.filter(d => d.isWeekend && !d.isWorkingDay).length;

  return {
    calendarDays,
    totalCalendarDays: calendarDays.length,
    workingDaysCount: targetWorkingDays,
    weekendCount,
    weekendWorkingCount,
    weekendOffCount,
    startDateFormatted: firstDay ? firstDay.dateFull : '',
    endDateFormatted: lastDay ? lastDay.dateFull : '',
    endDateShort: lastDay ? `${lastDay.dowShort}, ${lastDay.dateShort}/${lastDay.dateObj.getFullYear()}` : ''
  };
}

// --- 3. APPLICATION STATE ---
const state = {
  hasProject: false,
  projectTitle: 'Chưa có dự án thi công',
  projectType: 'OFFICE_BUILDING',
  startDate: getTodayISOString(),
  targetDays: 10,
  weekendMode: 'WEEKEND_NOISY_FOCUS',
  difficultyFactor: 1.1,
  hoursPerDay: 8,
  autoScaleCrewToTargetDays: true,
  executiveNote: 'Vui lòng nhập dữ liệu để tính toán nhân sự, chi phí nhân công và lịch Thứ 7 - Chủ Nhật.',
  tradeWages: Object.fromEntries(
    Object.entries(TRADES).map(([k, v]) => [k, v.defaultDailyWage])
  ),
  items: [],
  lastUploadedRawText: ''
};

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

// --- 4. CORE ENGINE ---
export function calculateProjectManpower() {
  const shiftMult = getShiftMultiplier(state.hoursPerDay);
  const diffFactor = Number(state.difficultyFactor) || 1.0;
  const targetWorkingDays = Math.max(1, Math.round(Number(state.targetDays) || 10));

  const cal = buildProjectCalendar(state.startDate, targetWorkingDays, state.weekendMode);
  const totalCalendarDays = cal.totalCalendarDays;

  const enrichedItems = state.items.map((item, idx) => {
    const tradeKey = TRADES[item.trade] ? item.trade : 'FURNITURE';
    const baseProd = Math.max(0.05, Number(item.productivityPerManDay) || 10);
    const effectiveProductivity = (baseProd * shiftMult) / diffFactor;
    const quantity = Math.max(0, Number(item.quantity) || 0);
    const manDays = quantity / effectiveProductivity;

    const tradeMeta = TRADES[tradeKey];
    const tradeWindowRatio = Math.max(0.25, tradeMeta.endPct - tradeMeta.startPct);
    const maxAllowedItemDays = Math.max(1, Math.round(targetWorkingDays * tradeWindowRatio));

    let crewSize = Math.max(1, Math.round(Number(item.crewSize) || 2));
    if (state.autoScaleCrewToTargetDays && manDays > 0) {
      const idealCrew = Math.ceil(manDays / maxAllowedItemDays);
      crewSize = Math.max(1, idealCrew);
      item.crewSize = crewSize;
    }

    const durationDays = crewSize > 0 ? manDays / crewSize : 0;
    const dailyWage = Number(state.tradeWages[tradeKey] || tradeMeta.defaultDailyWage);
    const wageWithOvertime = dailyWage * (state.hoursPerDay > 8 ? (state.hoursPerDay === 10 ? 1.25 : 1.5) : 1.0);
    const laborCost = manDays * wageWithOvertime;

    const weekendTag = WEEKEND_TAGS[item.weekendTag]
      ? item.weekendTag
      : matchLaborNorm(item.name, item.unit).weekendTag;

    return {
      ...item,
      index: idx + 1,
      trade: tradeKey,
      weekendTag,
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

  const dailyTotalWorkers = new Array(totalCalendarDays).fill(0);
  const tradeSummaries = [];
  const activeTradeKeys = new Set(enrichedItems.map(i => i.trade));

  for (const [tradeKey, tradeMeta] of Object.entries(TRADES)) {
    const tradeItems = enrichedItems.filter(it => it.trade === tradeKey && it.quantity > 0);
    if (tradeItems.length === 0) continue;

    const tradeManDays = tradeItems.reduce((s, it) => s + it.manDays, 0);
    const tradeCost = tradeItems.reduce((s, it) => s + it.laborCost, 0);
    const sharePct = totalManDays > 0 ? (tradeManDays / totalManDays) * 100 : 0;

    const noisyManDays = tradeItems
      .filter(it => it.weekendTag === 'HIGH_NOISE_WEEKEND' || it.weekendTag === 'LIFT_SMELL_WEEKEND')
      .reduce((s, it) => s + it.manDays, 0);
    const hasWeekendPriorityWork = noisyManDays > 0 || tradeMeta.weekendBoost;

    let startWorkDay = Math.max(1, Math.floor(tradeMeta.startPct * targetWorkingDays) + 1);
    let endWorkDay = Math.min(targetWorkingDays, Math.max(startWorkDay, Math.ceil(tradeMeta.endPct * targetWorkingDays)));

    if (activeTradeKeys.size <= 2) {
      if (activeTradeKeys.size === 1) {
        startWorkDay = 1;
        endWorkDay = targetWorkingDays;
      } else if (tradeKey === 'GYPSUM' || tradeKey === 'MASON' || tradeKey === 'DEMO') {
        startWorkDay = 1;
        endWorkDay = Math.max(1, Math.ceil(targetWorkingDays * 0.65));
      } else {
        startWorkDay = Math.max(1, Math.floor(targetWorkingDays * 0.35) + 1);
        endWorkDay = targetWorkingDays;
      }
    }

    const activeWindowWorkDays = Math.max(1, endWorkDay - startWorkDay + 1);
    const recommendedDailyCrew = Math.max(1, Math.ceil(tradeManDays / activeWindowWorkDays));

    const dailyWorkers = new Array(totalCalendarDays).fill(0);
    let remainingManDays = Math.ceil(tradeManDays);

    let firstCalIdx = -1;
    let lastCalIdx = -1;

    for (let cIdx = 0; cIdx < totalCalendarDays; cIdx++) {
      const calDay = cal.calendarDays[cIdx];
      if (!calDay.isWorkingDay) {
        dailyWorkers[cIdx] = 0;
        continue;
      }

      const wIdx = calDay.workingDayIndex;
      if (wIdx < startWorkDay || wIdx > endWorkDay) continue;
      if (remainingManDays <= 0) break;

      const workDaysLeftInWindow = Math.max(1, endWorkDay - wIdx + 1);
      let workersToday = Math.max(1, Math.min(recommendedDailyCrew + 1, Math.ceil(remainingManDays / workDaysLeftInWindow)));

      if (calDay.isWeekend && hasWeekendPriorityWork) {
        if (state.weekendMode === 'WEEKEND_NOISY_FOCUS') {
          workersToday = Math.min(remainingManDays, Math.max(recommendedDailyCrew + 2, Math.ceil(recommendedDailyCrew * 1.4)));
        } else if (state.weekendMode === 'FULL_WITH_WEEKEND_BOOST' || state.weekendMode === 'SAT_WORK_SUN_OFF') {
          workersToday = Math.min(remainingManDays, recommendedDailyCrew + 1);
        }
      } else if (!calDay.isWeekend && state.weekendMode === 'WEEKEND_NOISY_FOCUS' && tradeKey === 'DEMO') {
        workersToday = Math.max(1, Math.floor(recommendedDailyCrew * 0.6));
      }

      dailyWorkers[cIdx] = workersToday;
      dailyTotalWorkers[cIdx] += workersToday;
      remainingManDays -= workersToday;

      if (firstCalIdx === -1) firstCalIdx = cIdx;
      lastCalIdx = cIdx;
    }

    if (firstCalIdx === -1) firstCalIdx = 0;
    if (lastCalIdx === -1) lastCalIdx = totalCalendarDays - 1;

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
      weekendStrategy: tradeMeta.weekendStrategy,
      hasWeekendPriorityWork,
      noisyManDays,
      itemCount: tradeItems.length,
      totalManDays: tradeManDays,
      sharePct,
      startDay: firstCalIdx + 1,
      endDay: lastCalIdx + 1,
      startCalendarStr: `${cal.calendarDays[firstCalIdx].dowShort} (${cal.calendarDays[firstCalIdx].dateShort})`,
      endCalendarStr: `${cal.calendarDays[lastCalIdx].dowShort} (${cal.calendarDays[lastCalIdx].dateShort})`,
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
  const avgDailyWorkers = targetWorkingDays > 0 ? totalManDays / targetWorkingDays : 0;

  return {
    ...cal,
    projectTypeInfo: PROJECT_TYPES[state.projectType] || PROJECT_TYPES.OFFICE_BUILDING,
    targetDays: targetWorkingDays,
    totalManDays,
    totalLaborCost,
    peakWorkers,
    avgDailyWorkers,
    enrichedItems,
    tradeSummaries,
    dailyTotalWorkers
  };
}

// --- 5. RENDERING FUNCTIONS ---
function renderAll() {
  const calc = calculateProjectManpower();

  // 1. Cập nhật Thanh Tổng Quan Dự Án Gọn Gàng trên đầu trang
  document.getElementById('display-project-title').textContent = state.projectTitle;
  const typeInfo = calc.projectTypeInfo;
  const pTypeBadge = document.getElementById('display-project-type');
  if (pTypeBadge) {
    pTypeBadge.textContent = typeInfo.name;
    pTypeBadge.title = typeInfo.description;
  }

  const pTimelineBadge = document.getElementById('display-project-timeline');
  if (pTimelineBadge) {
    pTimelineBadge.textContent = `📅 Bắt đầu: ${calc.calendarDays[0]?.dateShort} ➔ Bàn giao: ${calc.endDateShort} (${calc.workingDaysCount} ngày làm / ${calc.totalCalendarDays} ngày lịch)`;
  }

  const pWeekendBadge = document.getElementById('display-project-weekend');
  if (pWeekendBadge) {
    const wm = WEEKEND_MODES[state.weekendMode] || WEEKEND_MODES.FULL_WITH_WEEKEND_BOOST;
    pWeekendBadge.textContent = `🏢 ${wm.shortDesc}`;
  }

  // Cập nhật giá trị vào 2 Modal Thiết Lập
  const modalStartDate = document.getElementById('m-start-date-input');
  if (modalStartDate) modalStartDate.value = state.startDate;

  const modalTargetDays = document.getElementById('m-target-days-input');
  if (modalTargetDays) modalTargetDays.value = state.targetDays;

  const modalWeekendMode = document.getElementById('m-weekend-mode-select');
  if (modalWeekendMode) modalWeekendMode.value = state.weekendMode;

  const modalShift = document.getElementById('m-shift-select');
  if (modalShift) modalShift.value = String(state.hoursPerDay);

  const modalDifficulty = document.getElementById('m-difficulty-select');
  if (modalDifficulty) modalDifficulty.value = String(state.difficultyFactor);

  const modalProjectType = document.getElementById('m-project-type-select');
  if (modalProjectType) modalProjectType.value = state.projectType;

  const modalAutoScale = document.getElementById('m-auto-scale-crew');
  if (modalAutoScale) modalAutoScale.checked = state.autoScaleCrewToTargetDays;

  // Cập nhật thẻ kết quả tự động tính ngày trong Modal 2
  const mCalcSummary = document.getElementById('m-calc-date-summary');
  if (mCalcSummary) {
    mCalcSummary.innerHTML = `
      <div><strong>Khởi công:</strong> ${calc.startDateFormatted || 'Chưa thiết lập'}</div>
      <div style="font-size:15px; font-weight:800; color:#0f4c81; margin-top:2px;">🏁 Bàn giao: ${calc.endDateFormatted || '...'} (${calc.totalCalendarDays || 0} ngày theo lịch)</div>
    `;
  }

  // KIỂM TRA TRẠNG THÁI CÓ DỮ LIỆU DỰ ÁN HAY CHƯA
  const emptyCard = document.getElementById('empty-state-card');
  const dashboardContent = document.getElementById('project-dashboard-content');
  const hasData = (state.hasProject || state.items.length > 0) && calc.enrichedItems.length > 0;

  if (!hasData) {
    if (emptyCard) emptyCard.style.display = 'block';
    if (dashboardContent) dashboardContent.style.display = 'none';
    window.__latestCalcResult = calc;
    return;
  }

  if (emptyCard) emptyCard.style.display = 'none';
  if (dashboardContent) dashboardContent.style.display = 'flex';

  // 2. 4 Thẻ KPI Tổng quan
  document.getElementById('kpi-total-mandays').textContent = `${formatNum(calc.totalManDays, 1)} công`;
  document.getElementById('kpi-mandays-sub').textContent =
    `${calc.enrichedItems.length} hạng mục | ${calc.tradeSummaries.length} tổ đội chuyên môn`;

  document.getElementById('kpi-target-days').textContent = `${calc.workingDaysCount} ngày làm`;
  const urgencyBadge = document.getElementById('kpi-urgency-badge');
  urgencyBadge.textContent = `🏁 Bàn giao: ${calc.endDateShort}`;
  urgencyBadge.className = calc.peakWorkers > 22 ? 'status-pill pill-warn' : 'status-pill pill-ok';

  document.getElementById('kpi-crew-allocation').textContent =
    `${Math.ceil(calc.avgDailyWorkers)} – ${calc.peakWorkers} thợ/ngày`;
  document.getElementById('kpi-crew-sub').textContent =
    `Trung bình ${formatNum(calc.avgDailyWorkers, 1)} ng/ngày | Đỉnh: ${calc.peakWorkers} ng`;

  document.getElementById('kpi-total-cost').textContent = formatVND(calc.totalLaborCost);
  document.getElementById('kpi-cost-sub').textContent =
    `Bình quân ~${formatVND(calc.totalManDays > 0 ? calc.totalLaborCost / calc.totalManDays : 0)}/công (${state.hoursPerDay}h/ngày)`;

  // 3. Khối Tư Vấn & Kế Hoạch Tranh Thủ Làm Thứ 7 - Chủ Nhật
  renderWeekendActionPlan(calc);

  // 4. Bảng 1: Phân Bổ Tổ Đội & Chi Phí
  renderTradeSummaryTable(calc);

  // 5. Bảng 2: Biểu Đồ Lịch Điều Phối Theo Ngày (Có T7 - CN)
  renderDailyScheduleMatrix(calc);

  // 6. Bảng 3: Chi Tiết BOQ Tiền Nhân Công & Định Mức
  renderBOQDetailTable(calc);

  window.__latestCalcResult = calc;
}

function renderWeekendActionPlan(calc) {
  const noisyContainer = document.getElementById('weekend-noisy-list');
  const liftContainer = document.getElementById('weekend-lift-list');
  const quietContainer = document.getElementById('weekday-quiet-list');
  if (!noisyContainer || !liftContainer || !quietContainer) return;

  const noisyItems = calc.enrichedItems.filter(it => it.weekendTag === 'HIGH_NOISE_WEEKEND');
  const liftItems = calc.enrichedItems.filter(it => it.weekendTag === 'LIFT_SMELL_WEEKEND');
  const quietItems = calc.enrichedItems.filter(it => it.weekendTag === 'QUIET_WEEKDAY');

  const formatItemBullet = (it) => {
    const tr = TRADES[it.trade] || TRADES.FURNITURE;
    return `<li>
      <strong>${it.name}</strong> (${it.quantity} ${it.unit} — <em>${formatNum(it.manDays, 1)} công ${tr.shortName}</em>)
    </li>`;
  };

  noisyContainer.innerHTML = noisyItems.length > 0
    ? noisyItems.map(formatItemBullet).join('')
    : `<li><em>Không có hạng mục khoan đục/đập phá gây ồn lớn trong BOQ hiện tại.</em></li>`;

  liftContainer.innerHTML = liftItems.length > 0
    ? liftItems.map(formatItemBullet).join('')
    : `<li><em>Vật tư nhỏ gọn hoặc có thể bố trí chuyển linh hoạt theo giờ của tòa nhà.</em></li>`;

  quietContainer.innerHTML = quietItems.length > 0
    ? quietItems.map(formatItemBullet).join('')
    : `<li><em>Các công đoạn hoàn thiện lắp ráp êm bên trong mặt bằng.</em></li>`;
}

function renderTradeSummaryTable(calc) {
  const tbody = document.getElementById('trade-summary-tbody');
  const tfoot = document.getElementById('trade-summary-tfoot');
  if (!tbody || !tfoot) return;

  if (calc.tradeSummaries.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="empty-cell">Chưa có hạng mục nào. Hãy bấm nút "Nhập khối lượng hoặc tải BOQ" ở trên.</td></tr>`;
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
        <span class="phase-tag">${ts.startCalendarStr} ➔ ${ts.endCalendarStr}</span>
        <div class="sub-text">Làm thực tế <strong>${ts.activeDays} ngày</strong> (N${ts.startDay}–N${ts.endDay})</div>
      </td>
      <td class="text-center highlight-col">
        <div class="worker-count-badge" style="background:${ts.color};">
          👷 ${ts.recommendedDailyCrew} thợ / ngày
        </div>
        <div class="sub-text">Cao điểm T7/CN: <strong>${ts.peakCrew} người</strong></div>
      </td>
      <td>
        <div class="weekend-strategy-note">
          ${ts.hasWeekendPriorityWork ? '<span class="wk-fire-badge">🔥 Ưu tiên T7-CN</span> ' : '<span class="wk-calm-badge">✅ Làm êm T2-T6</span> '}
          ${ts.weekendStrategy}
        </div>
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
      <td class="text-center"><strong>${calc.startDateFormatted} ➔ ${calc.endDateFormatted}</strong></td>
      <td class="text-center highlight-col">
        <strong>TB: ${formatNum(calc.avgDailyWorkers, 1)} thợ/ngày (Đỉnh: ${calc.peakWorkers} người)</strong>
      </td>
      <td><strong>Tổng ${calc.workingDaysCount} ngày làm (${calc.totalCalendarDays} ngày lịch)</strong></td>
      <td class="text-right">Đơn giá ca ${state.hoursPerDay}h</td>
      <td class="text-right cost-total-highlight"><strong>${formatVND(calc.totalLaborCost)}</strong></td>
    </tr>
  `;

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

  let headerHTML = `<tr>
    <th class="sticky-col-left">Tổ đội chuyên môn</th>
    <th class="text-center">Tổng công</th>
    <th class="text-center">Thợ TB</th>`;

  calc.calendarDays.forEach((cd) => {
    const wkClass = cd.isSun ? 'col-sunday' : (cd.isSat ? 'col-saturday' : '');
    const offClass = !cd.isWorkingDay ? 'col-dayoff' : '';
    headerHTML += `
      <th class="day-col-header ${wkClass} ${offClass}" title="${cd.dateFull}${!cd.isWorkingDay ? ' (Nghỉ theo quy định tòa nhà)' : ''}">
        <div class="cal-n">N${cd.dayIndex}</div>
        <div class="cal-dow ${cd.isSun ? 'dow-sun' : (cd.isSat ? 'dow-sat' : '')}">${cd.dowShort}</div>
        <div class="cal-date">${cd.dateShort}</div>
      </th>`;
  });
  headerHTML += `</tr>`;
  thead.innerHTML = headerHTML;

  tbody.innerHTML = calc.tradeSummaries.map(ts => {
    let rowHTML = `<tr>
      <td class="sticky-col-left">
        <span class="matrix-trade-name" style="color:${ts.color}; font-weight:700;">
          ${ts.icon} ${ts.shortName}
        </span>
      </td>
      <td class="text-center font-semibold">${formatNum(ts.totalManDays, 1)}</td>
      <td class="text-center"><span class="mini-crew-pill">${ts.recommendedDailyCrew} ng</span></td>`;

    calc.calendarDays.forEach((cd, idx) => {
      const w = ts.dailyWorkers[idx] || 0;
      const wkCellClass = cd.isSun ? 'cell-sunday' : (cd.isSat ? 'cell-saturday' : '');

      if (!cd.isWorkingDay) {
        rowHTML += `<td class="day-cell cell-dayoff ${wkCellClass}" title="${cd.dateFull}: Nghỉ theo quy định tòa nhà">Nghỉ</td>`;
      } else if (w > 0) {
        const isWeekendSurge = cd.isWeekend && ts.hasWeekendPriorityWork;
        rowHTML += `<td class="day-cell active-day-cell ${wkCellClass}" style="background:${ts.color}${isWeekendSurge ? '38' : '20'}; color:${ts.color}; border-color:${ts.color}66;" title="${ts.tradeName} - ${cd.dateFull}: ${w} thợ${isWeekendSurge ? ' (Tranh thủ làm việc ồn/thang hàng T7-CN)' : ''}">
          <strong>${w}</strong>${isWeekendSurge ? '<span class="surge-dot" title="Tranh thủ T7-CN">🔥</span>' : ''}
        </td>`;
      } else {
        rowHTML += `<td class="day-cell empty-day-cell ${wkCellClass}">·</td>`;
      }
    });
    rowHTML += `</tr>`;
    return rowHTML;
  }).join('');

  let footHTML = `<tr class="matrix-total-row">
    <td class="sticky-col-left"><strong>TỔNG THỢ TRÊN CÔNG TRƯỜNG</strong></td>
    <td class="text-center"><strong>${formatNum(calc.totalManDays, 1)}</strong></td>
    <td class="text-center"><strong>Đỉnh: ${calc.peakWorkers}</strong></td>`;

  calc.calendarDays.forEach((cd, idx) => {
    const totalDay = calc.dailyTotalWorkers[idx] || 0;
    const isPeak = totalDay === calc.peakWorkers && totalDay > 0;
    const wkFootClass = cd.isWeekend ? 'foot-weekend' : '';
    footHTML += `<td class="day-cell total-day-cell ${wkFootClass} ${isPeak ? 'peak-day-cell' : ''}" title="Tổng quân số ${cd.dateFull}: ${totalDay} người">
      <strong>${!cd.isWorkingDay ? 'Nghỉ' : totalDay}</strong>
    </td>`;
  });
  footHTML += `</tr>`;
  tfoot.innerHTML = footHTML;
}

function renderBOQDetailTable(calc) {
  const tbody = document.getElementById('boq-detail-tbody');
  const tfoot = document.getElementById('boq-detail-tfoot');
  if (!tbody || !tfoot) return;

  if (calc.enrichedItems.length === 0) {
    tbody.innerHTML = `<tr><td colspan="12" class="empty-cell">Danh sách BOQ trống. Vui lòng bấm nút "Nhập khối lượng hoặc tải BOQ" ở trên.</td></tr>`;
    tfoot.innerHTML = '';
    return;
  }

  const tradeOptionsHTML = (selectedTrade) =>
    Object.entries(TRADES).map(([k, v]) =>
      `<option value="${k}" ${k === selectedTrade ? 'selected' : ''}>${v.icon} ${v.shortName}</option>`
    ).join('');

  const weekendTagOptionsHTML = (selectedTag) =>
    Object.entries(WEEKEND_TAGS).map(([k, v]) =>
      `<option value="${k}" ${k === selectedTag ? 'selected' : ''}>${v.shortLabel}</option>`
    ).join('');

  tbody.innerHTML = calc.enrichedItems.map((item, idx) => {
    const tradeInfo = TRADES[item.trade] || TRADES.FURNITURE;
    const wkTag = WEEKEND_TAGS[item.weekendTag] || WEEKEND_TAGS.QUIET_WEEKDAY;
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
        <td>
          <select
            class="table-inline-select item-wktag-select"
            data-idx="${idx}"
            title="${wkTag.reason}"
            aria-label="Phân loại làm Thứ 7 - CN cho dòng ${idx + 1}"
            style="background:${wkTag.bg}; color:${wkTag.color}; border:1px solid ${wkTag.border}; font-weight:700; font-size:12px;"
          >
            ${weekendTagOptionsHTML(item.weekendTag)}
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
        <td class="text-center no-print">
          <button type="button" class="btn-icon-delete" data-delete-idx="${idx}" title="Xóa dòng này" aria-label="Xóa dòng ${idx + 1}">✕</button>
        </td>
      </tr>
    `;
  }).join('');

  tfoot.innerHTML = `
    <tr class="summary-footer-row">
      <td colspan="7"><strong>TỔNG CỘNG HAO PHÍ NHÂN CÔNG THEO BOQ (${calc.enrichedItems.length} HẠNG MỤC)</strong></td>
      <td class="text-right highlight-mandays"><strong>${formatNum(calc.totalManDays, 1)} công</strong></td>
      <td class="text-center"><strong>Peak: ${calc.peakWorkers} thợ</strong></td>
      <td class="text-center"><strong>${calc.workingDaysCount} ngày làm</strong></td>
      <td class="text-right cost-total-highlight"><strong>${formatVND(calc.totalLaborCost)}</strong></td>
      <td class="no-print"></td>
    </tr>
  `;

  tbody.querySelectorAll('.item-name-input').forEach(el => {
    el.addEventListener('change', (e) => {
      const i = Number(e.target.dataset.idx);
      state.items[i].name = e.target.value.trim() || 'Hạng mục thi công';
      const matched = matchLaborNorm(state.items[i].name, state.items[i].unit);
      state.items[i].trade = matched.trade;
      state.items[i].productivityPerManDay = matched.productivityPerManDay;
      state.items[i].unit = matched.unit;
      state.items[i].weekendTag = matched.weekendTag;
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

  tbody.querySelectorAll('.item-wktag-select').forEach(el => {
    el.addEventListener('change', (e) => {
      const i = Number(e.target.dataset.idx);
      state.items[i].weekendTag = e.target.value;
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

function renderNormsLibraryModal(filterQuery = '') {
  const tbody = document.getElementById('norms-library-tbody');
  if (!tbody) return;

  const allNorms = getActiveLaborNorms();
  const query = filterQuery.trim().toLowerCase();

  const filtered = query
    ? allNorms.filter(n =>
        n.name.toLowerCase().includes(query) ||
        n.code.toLowerCase().includes(query) ||
        (n.note && n.note.toLowerCase().includes(query)) ||
        (TRADES[n.trade]?.name && TRADES[n.trade].name.toLowerCase().includes(query))
      )
    : allNorms;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty-cell" style="padding:24px; text-align:center; color:#64748b;">
      Không tìm thấy định mức phù hợp với từ khóa "${filterQuery}". Bấm "Bổ Sung Định Mức Mới" để tạo ngay!
    </td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(norm => {
    const tr = TRADES[norm.trade] || TRADES.FURNITURE;
    const wk = WEEKEND_TAGS[norm.weekendTag] || WEEKEND_TAGS.QUIET_WEEKDAY;
    return `
      <tr data-norm-code="${norm.code}">
        <td><code style="font-weight:700; color:#0f4c81;">${norm.code}</code></td>
        <td>
          <input
            type="text"
            class="table-inline-input norm-edit-name"
            data-code="${norm.code}"
            value="${norm.name}"
            title="Nhấp để sửa tên công việc"
          />
          <div class="sub-text">
            <input
              type="text"
              class="table-inline-input norm-edit-note"
              data-code="${norm.code}"
              value="${norm.note || ''}"
              placeholder="Ghi chú điều phối..."
              style="font-size:11px; color:#64748b;"
            />
          </div>
        </td>
        <td>
          <select class="table-inline-select norm-edit-trade" data-code="${norm.code}">
            ${Object.keys(TRADES).map(k => `
              <option value="${k}" ${norm.trade === k ? 'selected' : ''}>${TRADES[k].shortName}</option>
            `).join('')}
          </select>
        </td>
        <td>
          <select class="table-inline-select norm-edit-weekend" data-code="${norm.code}">
            ${Object.keys(WEEKEND_TAGS).map(k => `
              <option value="${k}" ${norm.weekendTag === k ? 'selected' : ''}>${WEEKEND_TAGS[k].shortLabel}</option>
            `).join('')}
          </select>
        </td>
        <td class="text-center">
          <input
            type="text"
            class="table-inline-input text-center norm-edit-unit"
            data-code="${norm.code}"
            value="${norm.unit}"
            style="width:50px;"
          />
        </td>
        <td class="text-right">
          <div style="display:flex; align-items:center; justify-content:flex-end; gap:4px;">
            <input
              type="number"
              step="any"
              min="0.1"
              class="table-inline-input text-right norm-edit-prod"
              data-code="${norm.code}"
              value="${norm.productivityPerManDay}"
              style="width:65px; font-weight:800; color:#0f4c81;"
            />
            <span class="sub-text">${norm.unit}/công</span>
          </div>
        </td>
        <td class="text-center">
          <div style="display:flex; align-items:center; justify-content:center; gap:6px;">
            <button type="button" class="btn-primary btn-sm add-norm-to-boq" data-code="${norm.code}" title="Thêm hạng mục này vào bảng dự toán hiện tại">
              + Đưa vào BOQ
            </button>
            <button type="button" class="btn-icon-delete delete-norm-btn" data-code="${norm.code}" title="Xóa định mức này">
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // 1. Thêm vào BOQ
  tbody.querySelectorAll('.add-norm-to-boq').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const code = e.currentTarget.getAttribute('data-code');
      const currentNorms = getActiveLaborNorms();
      const found = currentNorms.find(n => n.code === code);
      if (found) {
        state.items.push({
          code: found.code,
          name: found.name,
          trade: found.trade,
          unit: found.unit,
          quantity: 50,
          productivityPerManDay: found.productivityPerManDay,
          crewSize: found.defaultCrewSize || 2,
          weekendTag: found.weekendTag
        });
        renderAll();
        showToast(`Đã thêm "${found.name}" vào bảng dự toán BOQ!`);
      }
    });
  });

  // 2. Chỉnh sửa trực tiếp tên, năng suất, đvt, tổ thợ
  const updateNormProperty = (code, field, value) => {
    const currentNorms = getActiveLaborNorms();
    const target = currentNorms.find(n => n.code === code);
    if (target) {
      target[field] = value;
      saveActiveLaborNorms(currentNorms);
      showToast(`Đã lưu thay đổi định mức "${target.code}"!`);
    }
  };

  tbody.querySelectorAll('.norm-edit-name').forEach(inp => {
    inp.addEventListener('change', (e) => {
      updateNormProperty(e.target.dataset.code, 'name', e.target.value.trim());
    });
  });

  tbody.querySelectorAll('.norm-edit-note').forEach(inp => {
    inp.addEventListener('change', (e) => {
      updateNormProperty(e.target.dataset.code, 'note', e.target.value.trim());
    });
  });

  tbody.querySelectorAll('.norm-edit-unit').forEach(inp => {
    inp.addEventListener('change', (e) => {
      updateNormProperty(e.target.dataset.code, 'unit', e.target.value.trim());
    });
  });

  tbody.querySelectorAll('.norm-edit-prod').forEach(inp => {
    inp.addEventListener('change', (e) => {
      const val = parseFloat(e.target.value);
      if (!isNaN(val) && val > 0) {
        updateNormProperty(e.target.dataset.code, 'productivityPerManDay', val);
      }
    });
  });

  tbody.querySelectorAll('.norm-edit-trade').forEach(sel => {
    sel.addEventListener('change', (e) => {
      updateNormProperty(e.target.dataset.code, 'trade', e.target.value);
    });
  });

  tbody.querySelectorAll('.norm-edit-weekend').forEach(sel => {
    sel.addEventListener('change', (e) => {
      updateNormProperty(e.target.dataset.code, 'weekendTag', sel.value);
    });
  });

  // 3. Xóa định mức
  tbody.querySelectorAll('.delete-norm-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const code = e.currentTarget.dataset.code;
      if (confirm(`Bạn có chắc muốn xóa định mức mã "${code}" khỏi thư viện?`)) {
        const currentNorms = getActiveLaborNorms();
        const updated = currentNorms.filter(n => n.code !== code);
        saveActiveLaborNorms(updated);
        renderNormsLibraryModal(filterQuery);
        showToast(`Đã xóa định mức "${code}"!`);
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

// XỬ LÝ IN / XUẤT PDF HOÀN HẢO (Khắc phục lỗi in chỉ ra tiêu đề)
function handlePrintPDF() {
  // Đồng bộ giá trị của tất cả inputs vào thuộc tính DOM để render khi in
  document.querySelectorAll('input, select').forEach(el => {
    if (el.type === 'checkbox') {
      if (el.checked) el.setAttribute('checked', '');
      else el.removeAttribute('checked');
    } else {
      el.setAttribute('value', el.value);
    }
  });

  // Tạm thời mở bung toàn bộ overflow để bảng không bị cuộn/cắt
  const tables = document.querySelectorAll('.table-responsive');
  tables.forEach(t => t.classList.add('print-expanded'));

  showToast('Đang mở hộp thoại In / Lưu PDF (chọn Layout: Landscape / Khổ Ngang để xem đẹp nhất)...');
  setTimeout(() => {
    window.print();
    tables.forEach(t => t.classList.remove('print-expanded'));
  }, 150);
}

// --- 6. EVENT LISTENERS & WORKFLOWS ---
function setupEventListeners() {
  UserInvalidFallback.init(document);

  // 1. MODAL TẠO DỰ ÁN MỚI
  const formNewProj = document.getElementById('form-new-project');
  formNewProj?.addEventListener('submit', (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('new-proj-name');
    const typeSelect = document.getElementById('new-proj-type');
    const templateSelect = document.getElementById('new-proj-template');

    const title = nameInput?.value?.trim() || 'Dự Án Fitout Nội Thất Mới';
    const pType = typeSelect?.value || 'OFFICE_BUILDING';
    const tplKey = templateSelect?.value;

    const typeConfig = PROJECT_TYPES[pType] || PROJECT_TYPES.OFFICE_BUILDING;

    state.projectTitle = title;
    state.projectType = pType;
    state.difficultyFactor = typeConfig.defaultDifficulty;
    state.weekendMode = typeConfig.defaultWeekendMode;
    state.hoursPerDay = typeConfig.defaultShift;
    state.autoScaleCrewToTargetDays = true;

    state.hasProject = true;
    if (tplKey && PROJECT_TEMPLATES[tplKey]) {
      const tpl = PROJECT_TEMPLATES[tplKey];
      state.targetDays = tpl.targetDays;
      state.items = structuredClone(tpl.items);
      state.executiveNote = `Đã tạo dự án mới cho "${typeConfig.name}". Nạp khối lượng mẫu từ "${tpl.title}".`;
    } else {
      state.targetDays = 10;
      state.items = [];
      state.executiveNote = `Đã khởi tạo dự án mới cho "${typeConfig.name}". Hãy bấm "Nhập khối lượng hoặc tải BOQ" để bắt đầu.`;
    }

    renderAll();
    document.getElementById('modal-new-project')?.close();
    if (state.items.length === 0) {
      showToast(`Đã tạo dự án "${state.projectTitle}". Hãy bấm "Nhập khối lượng hoặc tải BOQ" để bắt đầu!`);
    } else {
      showToast(`Đã tạo dự án mới: ${state.projectTitle}`);
    }
  });

  // 2. MODAL KHỐI 1: NHẬP KHỐI LƯỢNG TỔNG HOẶC TẢI BOQ
  const quickGridForm = document.getElementById('quick-grid-form');
  quickGridForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const quickConfigs = [
      { id: 'q-gypsum-wall', code: 'GYP-02', name: 'Thi công vách tường thạch cao 2 mặt khung xương Vĩnh Tường', trade: 'GYPSUM', unit: 'm2', prod: 9.0, crew: 3, weekendTag: 'HIGH_NOISE_WEEKEND' },
      { id: 'q-gypsum-ceil', code: 'GYP-04', name: 'Thi công trần thạch cao khung chìm hoàn thiện', trade: 'GYPSUM', unit: 'm2', prod: 11.0, crew: 3, weekendTag: 'HIGH_NOISE_WEEKEND' },
      { id: 'q-paint', code: 'PNT-01', name: 'Bả bột matit 2 lớp + xả nhám + sơn nước hoàn thiện', trade: 'PAINT', unit: 'm2', prod: 18.0, crew: 3, weekendTag: 'QUIET_WEEKDAY' },
      { id: 'q-tile', code: 'MAS-06', name: 'Thi công ốp lát gạch nền & tường hoàn thiện chà ron', trade: 'MASON', unit: 'm2', prod: 7.5, crew: 2, weekendTag: 'HIGH_NOISE_WEEKEND' },
      { id: 'q-mep', code: 'MEP-01', name: 'Thi công hệ thống Điện - Chiếu sáng MEP trọn gói (theo m2 sàn)', trade: 'MEP', unit: 'm2', prod: 8.0, crew: 3, weekendTag: 'HIGH_NOISE_WEEKEND' },
      { id: 'q-floor', code: 'FLR-01', name: 'Lát sàn gỗ công nghiệp / sàn nhựa SPC hoàn thiện', trade: 'FLOOR', unit: 'm2', prod: 25.0, crew: 2, weekendTag: 'QUIET_WEEKDAY' },
      { id: 'q-furniture', code: 'FUR-02', name: 'Lắp đặt nội thất gỗ (tủ áo, tủ bếp, vách ốp gỗ Fitout)', trade: 'FURNITURE', unit: 'm2', prod: 4.0, crew: 3, weekendTag: 'LIFT_SMELL_WEEKEND' },
      { id: 'q-demo', code: 'DEMO-01', name: 'Tháo dỡ hiện trạng cũ & chuyển xà bần qua thang tải', trade: 'DEMO', unit: 'm2', prod: 25.0, crew: 3, weekendTag: 'HIGH_NOISE_WEEKEND' }
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
          crewSize: cfg.crew,
          weekendTag: cfg.weekendTag
        });
      }
    }

    if (newItems.length === 0) {
      showToast('Vui lòng nhập ít nhất 1 khối lượng lớn hơn 0.', true);
      return;
    }

    const replaceMode = document.getElementById('quick-replace-checkbox')?.checked ?? true;
    state.hasProject = true;
    if (state.projectTitle === 'Chưa có dự án thi công') {
      state.projectTitle = `Dự toán bóc tách khối lượng (${newItems.length} hạng mục)`;
    }
    if (replaceMode) {
      state.items = newItems;
    } else {
      state.items.push(...newItems);
    }

    state.autoScaleCrewToTargetDays = true;
    renderAll();
    document.getElementById('modal-input-boq')?.close();
    showToast(`Đã áp dụng ${newItems.length} hạng mục khối lượng tổng!`);
  });

  const nlForm = document.getElementById('nl-prompt-form');
  nlForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputEl = document.getElementById('nl-prompt-input');
    if (!inputEl || !inputEl.checkValidity()) return;

    const text = inputEl.value.trim();
    const detectedWeekend = detectWeekendPolicyFromText(text);
    if (detectedWeekend) {
      state.weekendMode = detectedWeekend;
    }

    const parsedItems = parseQuickTextLocal(text);
    if (parsedItems.length > 0) {
      state.hasProject = true;
      state.items = parsedItems;
      state.projectTitle = `Dự toán từ mô tả nhanh (${parsedItems.length} hạng mục)`;
      state.executiveNote = `Đã bóc tách ${parsedItems.length} hạng mục từ câu nhập nhanh của Sếp.`;
      renderAll();
      document.getElementById('modal-input-boq')?.close();
      showToast(`Đã bóc tách tức thì ${parsedItems.length} hạng mục!`);
    } else {
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

  // 3. MODAL KHỐI 2: THIẾT LẬP CHẾ ĐỘ LÀM VIỆC & NGÀY KHỞI CÔNG
  const formScheduleConfig = document.getElementById('form-schedule-config');
  formScheduleConfig?.addEventListener('submit', (e) => {
    e.preventDefault();
    state.startDate = document.getElementById('m-start-date-input')?.value || state.startDate;
    state.targetDays = parseInt(document.getElementById('m-target-days-input')?.value, 10) || state.targetDays;
    state.weekendMode = document.getElementById('m-weekend-mode-select')?.value || state.weekendMode;
    state.projectType = document.getElementById('m-project-type-select')?.value || state.projectType;
    state.hoursPerDay = parseInt(document.getElementById('m-shift-select')?.value, 10) || state.hoursPerDay;
    state.difficultyFactor = parseFloat(document.getElementById('m-difficulty-select')?.value) || state.difficultyFactor;
    state.autoScaleCrewToTargetDays = document.getElementById('m-auto-scale-crew')?.checked ?? true;

    renderAll();
    document.getElementById('modal-schedule-config')?.close();
    showToast('Đã lưu thiết lập tiến độ & lịch Thứ 7 - Chủ Nhật!');
  });

  // Tương tác đổi giá trị trong Modal 2 để xem trước ngày kết thúc
  ['m-start-date-input', 'm-target-days-input', 'm-weekend-mode-select'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', () => {
      const sDate = document.getElementById('m-start-date-input')?.value || state.startDate;
      const tDays = parseInt(document.getElementById('m-target-days-input')?.value, 10) || state.targetDays;
      const wMode = document.getElementById('m-weekend-mode-select')?.value || state.weekendMode;
      const previewCal = buildProjectCalendar(sDate, tDays, wMode);
      const mCalcSummary = document.getElementById('m-calc-date-summary');
      if (mCalcSummary) {
        mCalcSummary.innerHTML = `
          <div><strong>Khởi công:</strong> ${previewCal.startDateFormatted}</div>
          <div style="font-size:15px; font-weight:800; color:#b45309; margin-top:2px;">🏁 Bàn giao: ${previewCal.endDateFormatted} (${previewCal.totalCalendarDays} ngày theo lịch)</div>
        `;
      }
    });
  });

  // Khi đổi Loại hình công trình trong Modal 2, tự động gợi ý hệ số và chế độ T7-CN
  document.getElementById('m-project-type-select')?.addEventListener('change', (e) => {
    const pType = e.target.value;
    const cfg = PROJECT_TYPES[pType];
    if (cfg) {
      const diffSel = document.getElementById('m-difficulty-select');
      if (diffSel) diffSel.value = String(cfg.defaultDifficulty);
      const wkSel = document.getElementById('m-weekend-mode-select');
      if (wkSel) wkSel.value = cfg.defaultWeekendMode;
      const shiftSel = document.getElementById('m-shift-select');
      if (shiftSel) shiftSel.value = String(cfg.defaultShift);
    }
  });

  // 4. CÁC NÚT THAO TÁC KHÁC
  document.getElementById('btn-add-blank-row')?.addEventListener('click', () => {
    state.items.push({
      code: 'GYP-02',
      name: 'Thi công hạng mục mới (nhấp để sửa tên)',
      trade: 'GYPSUM',
      unit: 'm2',
      quantity: 50,
      productivityPerManDay: 9.0,
      crewSize: 2,
      weekendTag: 'HIGH_NOISE_WEEKEND'
    });
    renderAll();
  });

  document.getElementById('btn-export-excel')?.addEventListener('click', () => {
    const calc = window.__latestCalcResult || calculateProjectManpower();
    const wkModeInfo = WEEKEND_MODES[state.weekendMode] || WEEKEND_MODES.FULL_WITH_WEEKEND_BOOST;
    exportFullReportToExcel(calc, {
      title: state.projectTitle,
      targetDays: state.targetDays,
      difficultyFactor: state.difficultyFactor,
      hoursPerDay: state.hoursPerDay,
      weekendModeLabel: wkModeInfo.shortDesc
    });
    showToast('Đã xuất file Excel Báo cáo Dự toán & Lịch Thứ 7 - CN!');
  });

  document.getElementById('btn-download-sample-boq')?.addEventListener('click', () => {
    downloadSampleBOQExcel();
    showToast('Đã tải xuống file BOQ_Mau_Fitout_Crystal_Interior.xlsx!');
  });

  document.getElementById('btn-print-report')?.addEventListener('click', () => {
    handlePrintPDF();
  });

  document.getElementById('btn-open-ai-consulting')?.addEventListener('click', () => {
    loadAIConsultingReport(false);
  });

  document.getElementById('btn-refresh-ai-consult')?.addEventListener('click', () => {
    loadAIConsultingReport(true);
  });

  const loadDemoDataHandler = () => {
    const demo = PROJECT_TEMPLATES.quickSample;
    state.hasProject = true;
    state.projectTitle = demo.title;
    state.projectType = demo.projectType || 'OFFICE_BUILDING';
    state.targetDays = demo.targetDays;
    state.difficultyFactor = demo.difficultyFactor;
    state.weekendMode = demo.weekendMode;
    state.hoursPerDay = 8;
    state.autoScaleCrewToTargetDays = true;
    state.items = structuredClone(demo.items);
    state.executiveNote = 'Đang hiển thị dữ liệu dự án mẫu (Demo): 100m² Vách thạch cao + 200m² Sơn nước + 60m² Ốp lát.';
    renderAll();
    showToast('Đã nạp thành công bộ dữ liệu Demo Fitout mẫu để sếp xem!');
  };

  document.getElementById('btn-load-demo-project')?.addEventListener('click', loadDemoDataHandler);
  document.getElementById('btn-load-demo-empty')?.addEventListener('click', loadDemoDataHandler);

  // 4. QUẢN LÝ & BỔ SUNG THƯ VIỆN ĐỊNH MỨC
  const normsSearchInput = document.getElementById('norms-search-input');
  normsSearchInput?.addEventListener('input', (e) => {
    renderNormsLibraryModal(e.target.value);
  });

  const addNormPanel = document.getElementById('add-norm-panel');
  document.getElementById('btn-toggle-add-norm')?.addEventListener('click', () => {
    if (!addNormPanel) return;
    const isHidden = addNormPanel.style.display === 'none';
    addNormPanel.style.display = isHidden ? 'block' : 'none';
    if (isHidden) {
      document.getElementById('new-norm-name')?.focus();
    }
  });

  document.getElementById('btn-cancel-add-norm')?.addEventListener('click', () => {
    if (addNormPanel) addNormPanel.style.display = 'none';
  });

  const formAddNewNorm = document.getElementById('form-add-new-norm');
  formAddNewNorm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('new-norm-name')?.value?.trim();
    const trade = document.getElementById('new-norm-trade')?.value || 'GYPSUM';
    const unit = document.getElementById('new-norm-unit')?.value?.trim() || 'm2';
    const prod = parseFloat(document.getElementById('new-norm-prod')?.value || '10');
    const crew = parseInt(document.getElementById('new-norm-crew')?.value || '2', 10);
    const weekendTag = document.getElementById('new-norm-weekend')?.value || 'QUIET_WEEKDAY';
    const note = document.getElementById('new-norm-note')?.value?.trim() || '';

    if (!name) return;

    const currentNorms = getActiveLaborNorms();
    const newCode = `${trade.slice(0, 3)}-${String(currentNorms.length + 1).padStart(2, '0')}`;

    const newNormItem = {
      code: newCode,
      name,
      trade,
      unit,
      productivityPerManDay: prod > 0 ? prod : 10,
      defaultCrewSize: crew > 0 ? crew : 2,
      weekendTag,
      keywords: [name.toLowerCase()],
      note: note || `Định mức bổ sung mới cho ${name}`
    };

    currentNorms.unshift(newNormItem);
    saveActiveLaborNorms(currentNorms);

    formAddNewNorm.reset();
    if (addNormPanel) addNormPanel.style.display = 'none';
    renderNormsLibraryModal(normsSearchInput?.value || '');
    showToast(`Đã bổ sung thành công định mức mới: ${newCode} - ${name}!`);
  });

  document.getElementById('btn-reset-norms-default')?.addEventListener('click', () => {
    if (confirm('Bạn có chắc muốn khôi phục toàn bộ Thư viện định mức về nguyên bản mặc định của Crystal Interior?')) {
      resetLaborNormsToDefault();
      renderNormsLibraryModal();
      showToast('Đã khôi phục thư viện định mức về mặc định!');
    }
  });

  const apiKeyForm = document.getElementById('api-key-form');
  apiKeyForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const inp = document.getElementById('custom-api-key-input');
    setCustomApiKey(inp?.value || '');
    showToast('Đã lưu cấu hình Google Gemini API Key!');
    document.getElementById('settings-dialog')?.close();
  });
}

let cachedAIConsultReport = null;

async function loadAIConsultingReport(forceRefresh = false) {
  const contentBox = document.getElementById('ai-consulting-content');
  const loadingIndicator = document.getElementById('ai-consulting-loading');
  if (!contentBox) return;

  const calc = window.__latestCalcResult || calculateProjectManpower();
  const projTypeInfo = PROJECT_TYPES[state.projectType] || PROJECT_TYPES.OFFICE_BUILDING;

  if (cachedAIConsultReport && !forceRefresh) {
    contentBox.innerHTML = formatMarkdownToHTML(cachedAIConsultReport);
    return;
  }

  if (loadingIndicator) loadingIndicator.style.display = 'flex';
  contentBox.style.display = 'none';

  try {
    const rawReport = await generateAIConsultingReport(calc, {
      title: state.projectTitle,
      projectTypeName: projTypeInfo.name
    });
    cachedAIConsultReport = rawReport;
    contentBox.innerHTML = formatMarkdownToHTML(rawReport);
  } catch (err) {
    console.error('Lỗi sinh báo cáo AI:', err);
    contentBox.innerHTML = `<div style="color:#b91c1c; font-weight:700;">Không thể tạo báo cáo AI: ${err.message}</div>`;
  } finally {
    if (loadingIndicator) loadingIndicator.style.display = 'none';
    contentBox.style.display = 'block';
  }
}

function formatMarkdownToHTML(mdText = '') {
  let html = mdText
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h3>$1</h3>')
    .replace(/^# (.*$)/gim, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/^\d+\.\s+(.*$)/gim, '<li>$1</li>');

  html = html.replace(/(<li>.*?<\/li>(\s*<li>.*?<\/li>)*)/gis, '<ul>$1</ul>');
  html = html.replace(/\n\n+/g, '<br/><br/>');
  return html;
}

async function triggerGeminiTextAnalysis(text) {
  try {
    setLoadingStatus(true, 'Đang dùng Google Gemini AI phân tích khối lượng & lịch làm việc Thứ 7 - CN...');
    const aiRes = await analyzeWithGeminiAI({ textContent: text });
    if (aiRes?.items?.length > 0) {
      state.hasProject = true;
      state.items = aiRes.items;
      if (aiRes.projectTitle) state.projectTitle = aiRes.projectTitle;
      if (aiRes.recommendedTargetDays) state.targetDays = aiRes.recommendedTargetDays;
      if (aiRes.weekendMode && WEEKEND_MODES[aiRes.weekendMode]) {
        state.weekendMode = aiRes.weekendMode;
      }
      if (aiRes.executiveNote) state.executiveNote = `✨ Gemini AI QS: ${aiRes.executiveNote}`;
      state.autoScaleCrewToTargetDays = true;
      renderAll();
      document.getElementById('modal-input-boq')?.close();
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
        state.hasProject = true;
        state.items = items;
        state.projectTitle = `BOQ: ${file.name.replace(/\.[^.]+$/, '')}`;
        state.autoScaleCrewToTargetDays = true;
        state.executiveNote = `Đã bóc tách tự động ${items.length} hạng mục từ file "${file.name}" và phân loại việc Thứ 7 - CN.`;
        renderAll();
        document.getElementById('modal-input-boq')?.close();
        showToast(`Đã đọc thành công ${items.length} hạng mục từ file Excel "${file.name}"!`);
      } else if (rawText) {
        await triggerGeminiTextAnalysis(`Hãy bóc tách bảng BOQ sau từ file ${file.name}:\n${rawText}`);
      } else {
        showToast('Không tìm thấy dữ liệu hợp lệ trong file Excel.', true);
      }
    } else if (ext === 'pdf') {
      setLoadingStatus(true, `Đang gửi file PDF "${file.name}" tới Google Gemini AI để đọc bảng BOQ...`);
      const base64Data = await fileToBase64(file);
      const aiRes = await analyzeWithGeminiAI({
        textContent: `Đọc bảng BOQ từ file PDF "${file.name}" và trích xuất toàn bộ các hạng mục công việc kèm khối lượng, đơn vị, tổ đội, định mức nhân công và phân loại việc cần làm Thứ 7 - CN.`,
        pdfBase64: base64Data
      });
      if (aiRes?.items?.length > 0) {
        state.hasProject = true;
        state.items = aiRes.items;
        state.projectTitle = aiRes.projectTitle || `BOQ PDF: ${file.name.replace(/\.pdf$/i, '')}`;
        if (aiRes.recommendedTargetDays) state.targetDays = aiRes.recommendedTargetDays;
        if (aiRes.weekendMode && WEEKEND_MODES[aiRes.weekendMode]) {
          state.weekendMode = aiRes.weekendMode;
        }
        state.executiveNote = aiRes.executiveNote || `Đã trích xuất ${aiRes.items.length} hạng mục từ file PDF "${file.name}" bằng Gemini AI.`;
        state.autoScaleCrewToTargetDays = true;
        renderAll();
        document.getElementById('modal-input-boq')?.close();
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

document.addEventListener('DOMContentLoaded', () => {
  renderNormsLibraryModal();
  setupEventListeners();
  renderAll();
});
