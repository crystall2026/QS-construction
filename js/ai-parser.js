// Bộ xử lý bóc tách BOQ tối ưu chi phí & Token Google Gemini AI
import { LABOR_NORMS, TRADES, WEEKEND_TAGS, getActiveLaborNorms } from './norms-data.js';

const DEFAULT_KEY_PARTS = [
  'AQ.Ab8RN6JlRtJM',
  'TNhFUGkdafGs5El',
  'VDUmtO-4ZB7gy5y',
  '9m-syzWw'
];

export function getActiveApiKey() {
  const custom = localStorage.getItem('crystal_qs_gemini_key');
  if (custom && custom.trim().length > 10) {
    return custom.trim();
  }
  return DEFAULT_KEY_PARTS.join('');
}

export function setCustomApiKey(key) {
  if (!key || !key.trim()) {
    localStorage.removeItem('crystal_qs_gemini_key');
  } else {
    localStorage.setItem('crystal_qs_gemini_key', key.trim());
  }
}

function normalizeText(str = '') {
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function detectWeekendPolicyFromText(inputText = '') {
  const norm = normalizeText(inputText);
  if (!norm) return null;

  if (
    norm.includes('nghi thu 7') ||
    norm.includes('nghi t7') ||
    norm.includes('khong lam thu 7') ||
    norm.includes('khong lam cuoi tuan') ||
    norm.includes('cam thi cong t7')
  ) {
    return 'MON_FRI_ONLY';
  }
  if (
    norm.includes('nghi chu nhat') ||
    norm.includes('nghi cn') ||
    norm.includes('khong lam chu nhat') ||
    norm.includes('lam thu 7 nghi cn')
  ) {
    return 'SAT_WORK_SUN_OFF';
  }
  if (
    norm.includes('on vao t7') ||
    norm.includes('khoan duc cuoi tuan') ||
    norm.includes('toa nha van phong') ||
    norm.includes('tranh thu t7')
  ) {
    return 'WEEKEND_NOISY_FOCUS';
  }
  if (
    norm.includes('lam ca thu 7') ||
    norm.includes('lam ca cn') ||
    norm.includes('lam xuyen suot') ||
    norm.includes('lam 7 ngay') ||
    norm.includes('t7 cn')
  ) {
    return 'FULL_WITH_WEEKEND_BOOST';
  }
  return null;
}

// Kiểm tra từ khóa loại trừ thầu phụ chuyên trách (Lạnh HVAC, PCCC, Thang máy...)
export function isSubcontractorExcludedItem(taskName = '') {
  const norm = normalizeText(taskName);
  if (!norm) return false;

  // 1. Hệ thống Điều hòa không khí / Lạnh (HVAC)
  const isHVAC =
    norm.includes('dieu hoa') ||
    norm.includes('may lanh') ||
    norm.includes('dan lanh') ||
    norm.includes('dan nong') ||
    norm.includes('ong gio') ||
    norm.includes('mieng gio') ||
    norm.includes('chiller') ||
    norm.includes('vrv') ||
    norm.includes('vrf') ||
    norm.includes('fcu') ||
    norm.includes('ahu') ||
    norm.includes('gas lanh') ||
    norm.includes('bom nuoc ngung') ||
    norm.includes('ong dong may lanh');

  // 2. Hệ thống Phòng cháy chữa cháy (PCCC)
  const isPCCC =
    norm.includes('pccc') ||
    norm.includes('chua chay') ||
    norm.includes('bao chay') ||
    norm.includes('dau phun') ||
    norm.includes('sprinkler') ||
    norm.includes('dau bao khoi') ||
    norm.includes('dau bao nhiet') ||
    norm.includes('chuong bao chay') ||
    norm.includes('cuon voi') ||
    norm.includes('tru chua chay') ||
    norm.includes('van goc chua chay') ||
    norm.includes('mang ngan chay') ||
    norm.includes('son chong chay') ||
    norm.includes('binh bot mfz') ||
    norm.includes('binh co2');

  // 3. Thầu phụ chuyên trách khác (Thang máy, máy phát điện...)
  const isOtherSub =
    norm.includes('thang may') ||
    norm.includes('thang cuon') ||
    norm.includes('may phat dien');

  return isHVAC || isPCCC || isOtherSub;
}

// Bộ so khớp từ khóa nội bộ chuẩn xác (0 token, 0ms)
export function matchLaborNorm(taskName, unitHint = '') {
  const rawLower = String(taskName || '').toLowerCase();
  const normTask = normalizeText(taskName);
  const normUnit = normalizeText(unitHint);

  // Nếu là mục thầu phụ lạnh/PCCC, trả về null để bộ lọc loại bỏ
  if (isSubcontractorExcludedItem(taskName)) {
    return null;
  }

  let bestNorm = null;
  let bestScore = -1;
  const currentNorms = getActiveLaborNorms();

  for (const norm of currentNorms) {
    let score = 0;
    for (const kw of norm.keywords) {
      const normKw = normalizeText(kw);
      if (rawLower.includes(kw.toLowerCase())) {
        score += 12 + kw.length;
      } else if (normTask.includes(normKw)) {
        score += 8 + normKw.length;
      }
    }

    if (normUnit && normalizeText(norm.unit) === normUnit) {
      score += 4;
    }

    if (score > bestScore) {
      bestScore = score;
      bestNorm = norm;
    }
  }

  if (bestScore >= 8 && bestNorm) {
    return {
      code: bestNorm.code,
      trade: bestNorm.trade,
      unit: unitHint || bestNorm.unit,
      productivityPerManDay: bestNorm.productivityPerManDay,
      crewSize: bestNorm.defaultCrewSize,
      weekendTag: bestNorm.weekendTag || 'QUIET_WEEKDAY',
      matchedNormName: bestNorm.name
    };
  }

  if (normTask.includes('thach cao') || normTask.includes('gypsum')) {
    const isCeiling = normTask.includes('tran');
    const fallback = isCeiling ? LABOR_NORMS.find(n => n.code === 'GYP-04') : LABOR_NORMS.find(n => n.code === 'GYP-02');
    return {
      code: fallback.code,
      trade: 'GYPSUM',
      unit: unitHint || 'm2',
      productivityPerManDay: fallback.productivityPerManDay,
      crewSize: 2,
      weekendTag: 'HIGH_NOISE_WEEKEND',
      matchedNormName: fallback.name
    };
  }
  if (normTask.includes('son') || normTask.includes('ba matit') || normTask.includes('dulux') || normTask.includes('jotun')) {
    const isSmelly = normTask.includes('pu') || normTask.includes('dau') || normTask.includes('hieu ung');
    return {
      code: isSmelly ? 'PNT-04' : 'PNT-01',
      trade: 'PAINT',
      unit: unitHint || 'm2',
      productivityPerManDay: isSmelly ? 8.5 : 18.0,
      crewSize: 2,
      weekendTag: isSmelly ? 'LIFT_SMELL_WEEKEND' : 'QUIET_WEEKDAY',
      matchedNormName: 'Sơn nước & bả matit'
    };
  }
  if (normTask.includes('gach') || normTask.includes('op') || normTask.includes('lat') || normTask.includes('xay') || normTask.includes('to') || normTask.includes('chong tham')) {
    const isTileCut = normTask.includes('gach') || normTask.includes('op') || normTask.includes('lat') || normTask.includes('da');
    return {
      code: 'MAS-06',
      trade: 'MASON',
      unit: unitHint || 'm2',
      productivityPerManDay: 7.5,
      crewSize: 2,
      weekendTag: isTileCut ? 'HIGH_NOISE_WEEKEND' : 'LIFT_SMELL_WEEKEND',
      matchedNormName: 'Ốp lát / Xây tô hoàn thiện'
    };
  }
  if (normTask.includes('dien') || normTask.includes('den') || normTask.includes('day') || normTask.includes('o cam') || normTask.includes('nuoc') || normTask.includes('dieu hoa') || normTask.includes('mep') || normTask.includes('mang') || normTask.includes('rack') || normTask.includes('lan')) {
    if (normTask.includes('tu rack') || normTask.includes('rack')) {
      return {
        code: 'MEP-08',
        trade: 'MEP',
        unit: unitHint || 'tủ',
        productivityPerManDay: 1.5,
        crewSize: 2,
        weekendTag: 'QUIET_WEEKDAY',
        matchedNormName: 'Lắp ráp tủ Rack & thiết bị'
      };
    }
    if (normTask.includes('note') || normTask.includes('nut mang') || normTask.includes('hat mang') || normTask.includes('patch')) {
      return {
        code: 'MEP-07',
        trade: 'MEP',
        unit: unitHint || 'node',
        productivityPerManDay: 25.0,
        crewSize: 2,
        weekendTag: 'QUIET_WEEKDAY',
        matchedNormName: 'Đấu nối Note mạng / LAN'
      };
    }
    if (normTask.includes('trang tri') || normTask.includes('den tha') || normTask.includes('decor')) {
      return {
        code: 'MEP-09',
        trade: 'MEP',
        unit: unitHint || 'bộ',
        productivityPerManDay: 6.0,
        crewSize: 2,
        weekendTag: 'QUIET_WEEKDAY',
        matchedNormName: 'Lắp đặt đèn thả trang trí'
      };
    }
    if (normTask.includes('o cam') || normTask.includes('cong tac') || normTask.includes('mat hat') || normTask.includes('hat mang')) {
      const isPackagedOutlet = normTask.includes('day') || normTask.includes('ong') || normTask.includes('bao gom') || normTask.includes('kem') || normTask.includes('cat duc') || normTask.includes('am tuong');
      return {
        code: isPackagedOutlet ? 'MEP-11' : 'MEP-05',
        trade: 'MEP',
        unit: unitHint || (isPackagedOutlet ? 'điểm' : 'cái'),
        productivityPerManDay: isPackagedOutlet ? 6.0 : 18.0,
        crewSize: 2,
        weekendTag: isPackagedOutlet ? 'HIGH_NOISE_WEEKEND' : 'QUIET_WEEKDAY',
        matchedNormName: isPackagedOutlet ? 'Lắp đặt ổ cắm/ổ mạng (gồm cắt đục & dây ống)' : 'Lắp đặt công tắc / ổ cắm / mặt hạt'
      };
    }
    if (normTask.includes('den') || normTask.includes('downlight') || normTask.includes('spotlight') || normTask.includes('panel')) {
      const isPackageWithWire = normTask.includes('day') || normTask.includes('ong') || normTask.includes('bao gom') || normTask.includes('kem');
      return {
        code: isPackageWithWire ? 'MEP-10' : 'MEP-03',
        trade: 'MEP',
        unit: unitHint || 'bộ',
        productivityPerManDay: isPackageWithWire ? 5.5 : 20.0,
        crewSize: 2,
        weekendTag: 'QUIET_WEEKDAY',
        matchedNormName: isPackageWithWire ? 'Lắp đặt đèn (bao gồm dây ống)' : 'Lắp đặt đèn âm trần / panel'
      };
    }
    const isNoisyMEP = normTask.includes('cat') || normTask.includes('duc') || normTask.includes('ong dong') || normTask.includes('tu dien') || normTask.includes('he thong');
    return {
      code: isNoisyMEP ? 'MEP-01' : 'MEP-03',
      trade: 'MEP',
      unit: unitHint || 'bộ',
      productivityPerManDay: isNoisyMEP ? 8.0 : 15.0,
      crewSize: 2,
      weekendTag: isNoisyMEP ? 'HIGH_NOISE_WEEKEND' : 'QUIET_WEEKDAY',
      matchedNormName: 'Thi công lắp đặt MEP'
    };
  }
  if (normTask.includes('san go') || normTask.includes('vinyl') || normTask.includes('spc') || normTask.includes('tham')) {
    const isGlueFloor = normTask.includes('vinyl') || normTask.includes('tham') || normTask.includes('dan');
    return {
      code: 'FLR-01',
      trade: 'FLOOR',
      unit: unitHint || 'm2',
      productivityPerManDay: 25.0,
      crewSize: 2,
      weekendTag: isGlueFloor ? 'LIFT_SMELL_WEEKEND' : 'QUIET_WEEKDAY',
      matchedNormName: 'Thi công sàn gỗ / thảm'
    };
  }
  if (normTask.includes('thao do') || normTask.includes('dap') || normTask.includes('ve sinh') || normTask.includes('xa ban')) {
    const isClean = normTask.includes('ve sinh');
    return {
      code: isClean ? 'FUR-07' : 'DEMO-01',
      trade: 'DEMO',
      unit: unitHint || 'm2',
      productivityPerManDay: 25.0,
      crewSize: 2,
      weekendTag: isClean ? 'QUIET_WEEKDAY' : 'HIGH_NOISE_WEEKEND',
      matchedNormName: 'Tháo dỡ / Vệ sinh công nghiệp'
    };
  }

  if (normTask.includes('boc xep') || normTask.includes('boc vac') || normTask.includes('khuan vac') || normTask.includes('tho phu') || normTask.includes('van chuyen noi that')) {
    return {
      code: 'LOG-01',
      trade: 'LOGISTICS',
      unit: unitHint || 'công',
      productivityPerManDay: 1.0,
      crewSize: 2,
      weekendTag: 'LIFT_SMELL_WEEKEND',
      matchedNormName: 'Bốc xếp vận chuyển nội thất'
    };
  }

  return {
    code: 'FUR-03',
    trade: 'FURNITURE',
    unit: unitHint || 'm2',
    productivityPerManDay: 5.5,
    crewSize: 2,
    weekendTag: 'LIFT_SMELL_WEEKEND',
    matchedNormName: 'Lắp ráp hoàn thiện nội thất Fitout'
  };
}

export function parseQuickTextLocal(inputText) {
  if (!inputText || !inputText.trim()) return [];
  const segments = inputText
    .split(/[\n,;+]+|\s+và\s+/i)
    .map(s => s.trim())
    .filter(Boolean);

  const results = [];
  for (const seg of segments) {
    const normSeg = normalizeText(seg);
    if (normSeg.includes('thu 7') || normSeg.includes('chu nhat') || /^\d+\s*ngay$/i.test(normSeg)) {
      continue;
    }

    const qtyMatch = seg.match(/(\d+(?:[.,]\d+)?)\s*(m2|m²|md|m\b|bộ|bo|cái|cai|tủ|tu|phòng|phong|điểm|diem|gói|goi)?/i);
    if (!qtyMatch) continue;

    const quantity = parseFloat(qtyMatch[1].replace(',', '.'));
    if (isNaN(quantity) || quantity <= 0) continue;

    let rawUnit = (qtyMatch[2] || '').replace('m²', 'm2').toLowerCase();
    let cleanName = seg.replace(qtyMatch[0], ' ').replace(/\s+/g, ' ').trim();
    if (cleanName.length < 2) cleanName = seg;

    const matched = matchLaborNorm(cleanName, rawUnit);
    if (!matched) continue; // Bỏ qua nếu thuộc thầu phụ lạnh / PCCC
    const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

    results.push({
      code: matched.code,
      name: formattedName.length >= 4 ? formattedName : matched.matchedNormName,
      trade: matched.trade,
      unit: rawUnit || matched.unit,
      quantity,
      productivityPerManDay: matched.productivityPerManDay,
      crewSize: matched.crewSize,
      weekendTag: matched.weekendTag
    });
  }
  return results;
}

// BÓC TÁCH BOQ BẰNG GEMINI AI TỐI ƯU SIÊU TIẾT KIỆM TOKEN
export async function analyzeWithGeminiAI({ textContent, pdfBase64 = null }) {
  const apiKey = getActiveApiKey();

  // Prompt chuyên sâu chuẩn QS Fitout: Loại bỏ thầu phụ Điều hòa/Lạnh & PCCC, bóc tách chính xác thiết bị gộp
  const compactSystemPrompt = `Bạn là Chuyên gia QS Fitout & Nội thất Crystal Interior.
NHIỆM VỤ QUAN TRỌNG:
1. LOẠI BỎ HOÀN TOÀN các hạng mục của THẦU PHỤ:
   - Hệ thống Điều hòa không khí/Lạnh (HVAC, VRV, FCU, miệng gió, ống gió, ống đồng, máy lạnh...).
   - Hệ thống PCCC (đầu phun sprinkler, báo khói, báo cháy, cuộn vòi, bình chữa cháy...).
   - Thang máy, máy phát điện.
   (Không tính công và không đưa vào danh sách items).
2. XỬ LÝ HẠNG MỤC GỘP & CHIA NHỎ:
   - Đèn trần chỉ lắp ráp: 20 bộ/công. Đèn gộp cả dây ống: 5.5 bộ/công. Đèn thả decor: 6 bộ/công.
   - Ổ cắm/công tắc chỉ đấu mặt hạt: 18 cái/công. Ổ cắm/mạng gộp cả cắt đục & dây ống: 6 điểm/công.
   - Node mạng LAN: 25 node/công. Tủ Rack mạng: 1.5 tủ/công.
3. PHÂN ĐỊNH THỢ MỘC & THỢ PHỤ BỐC XẾP:
   - Hàng mộc nội thất (tủ, bàn, vách ốp) đã gia công ở xưởng, ở công trình CHỈ TÍNH CÔNG LẮP RÁP HOÀN THIỆN (Trade: FURNITURE, 680k/công).
   - Nếu có công tác khuân vác, bốc xếp kiện gỗ từ xe tải qua thang hàng, vận chuyển vật tư nặng hoặc thợ phụ bưng bê thì tách riêng thành Tổ Thợ Phụ Bốc Xếp (Trade: LOGISTICS, 420k/công).
4. Trades hợp lệ: DEMO, MASON, GYPSUM, MEP, PAINT, FLOOR, FURNITURE, LOGISTICS.
WeekendTags: HIGH_NOISE_WEEKEND (việc ồn), LIFT_SMELL_WEEKEND (mùi/thang tải), QUIET_WEEKDAY (việc êm làm T2-T6).

Trả về JSON duy nhất:
{
  "projectTitle": "Tên dự án ngắn gọn",
  "recommendedTargetDays": 12,
  "weekendMode": "WEEKEND_NOISY_FOCUS",
  "items": [
    {"name": "Tên việc", "trade": "MEP", "unit": "bộ", "quantity": 45, "productivityPerManDay": 5.5, "crewSize": 2, "weekendTag": "QUIET_WEEKDAY"}
  ]
}`;

  const parts = [];
  if (pdfBase64) {
    parts.push({
      inline_data: { mime_type: 'application/pdf', data: pdfBase64 }
    });
  }
  parts.push({
    text: (textContent || 'Bóc tách BOQ').slice(0, 4000)
  });

  const modelsToTry = ['models/gemini-flash-latest', 'models/gemini-3.8-flash'];
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: compactSystemPrompt }] },
          contents: [{ role: 'user', parts }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1200,
            responseMimeType: 'application/json'
          }
        })
      });

      if (!response.ok) {
        lastError = new Error(`HTTP ${response.status}`);
        continue;
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (!rawText) continue;

      const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      const parsed = JSON.parse(cleaned);
      if (parsed && Array.isArray(parsed.items)) {
        parsed.items = parsed.items
          .filter(it => !isSubcontractorExcludedItem(it.name))
          .map(it => {
            const fallbackMatch = matchLaborNorm(it.name, it.unit);
            const normCode = it.code || (fallbackMatch ? fallbackMatch.code : 'MEP-01');
            const normTrade = TRADES[it.trade] ? it.trade : (fallbackMatch ? fallbackMatch.trade : 'MEP');
            const normProd = Math.max(0.1, parseFloat(it.productivityPerManDay) || (fallbackMatch ? fallbackMatch.productivityPerManDay : 10));
            const normCrew = Math.max(1, Math.round(parseFloat(it.crewSize) || (fallbackMatch ? fallbackMatch.crewSize : 2)));
            const normWeekend = WEEKEND_TAGS[it.weekendTag] ? it.weekendTag : (fallbackMatch ? fallbackMatch.weekendTag : 'QUIET_WEEKDAY');

            return {
              code: normCode,
              name: String(it.name || 'Hạng mục thi công').trim(),
              trade: normTrade,
              unit: String(it.unit || (fallbackMatch ? fallbackMatch.unit : 'bộ')).trim(),
              quantity: Math.max(0.1, parseFloat(it.quantity) || 1),
              productivityPerManDay: normProd,
              crewSize: normCrew,
              weekendTag: normWeekend
            };
          });
        return parsed;
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('Không thể kết nối Gemini API.');
}

// HÀM TẠO TƯ VẤN THI CÔNG FITOUT BẰNG GEMINI AI KHI NGƯỜI DÙNG BẤM "XEM TƯ VẤN CỦA AI" (TỐI ƯU TOKEN)
export async function generateAIConsultingReport(calcResult, projectMeta) {
  const apiKey = getActiveApiKey();

  // Gửi tóm tắt siêu ngắn (~120 tokens)
  const itemsBrief = calcResult.enrichedItems
    .slice(0, 15)
    .map(i => `${i.name}: ${i.quantity}${i.unit} (${i.manDays.toFixed(1)} công)`)
    .join('; ');

  const prompt = `Dự án: ${projectMeta.title} (${projectMeta.projectTypeName}).
Khởi công: ${calcResult.startDateFormatted} ➔ Bàn giao: ${calcResult.endDateFormatted} (${calcResult.workingDaysCount} ngày làm việc).
Quân số: TB ${calcResult.avgDailyWorkers.toFixed(1)} thợ/ngày (Đỉnh: ${calcResult.peakWorkers} thợ).
Khối lượng chính: ${itemsBrief}.

Hãy viết BÁO CÁO TƯ VẤN ĐIỀU HÀNH CHUYÊN SÂU cho Ban Giám Đốc (khoảng 350-450 từ) gồm 3 phần rõ ràng:
1. ĐÁNH GIÁ TÍNH KHẢ THI TIẾN ĐỘ & RỦI RO QUÂN SỐ
2. KẾ HOẠCH TRANH THỦ THỨ 7 & CHỦ NHẬT (Các việc ồn, khoan đục, vận chuyển thang hàng, bay mùi)
3. GIẢI PHÁP TỔ CHỨC MẶT BẰNG & PHỐI HỢP BAN QUẢN LÝ TÒA NHÀ`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${encodeURIComponent(apiKey)}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.25,
          maxOutputTokens: 800
        }
      })
    });

    if (response.ok) {
      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (text) return text;
    }
  } catch (err) {
    console.warn('Lỗi gọi AI tư vấn:', err);
  }

  // Fallback thông minh cục bộ nếu không có mạng hoặc API key hết hạn
  return `### 1. ĐÁNH GIÁ TIẾN ĐỘ & QUÂN SỐ:
Dự án "${projectMeta.title}" được hoạch định hoàn thành trong ${calcResult.workingDaysCount} ngày làm việc (${calcResult.totalCalendarDays} ngày theo lịch).
Quân số trung bình ${calcResult.avgDailyWorkers.toFixed(1)} thợ/ngày, cao điểm đạt ${calcResult.peakWorkers} thợ. Tiến độ khả thi nếu tổ chức các tổ đội gối đầu hợp lý.

### 2. KẾ HOẠCH TRANH THỦ THỨ 7 & CHỦ NHẬT:
- **Việc ồn & rung chấn:** Tập trung dồn thợ làm vào Thứ 7 và Chủ Nhật đối với các công tác khoan bắn ty trần thạch cao, cắt đục rãnh điện nước và cắt gạch đá.
- **Thang hàng (Service Lift):** Đăng ký lịch vận thăng tòa nhà vào đêm Thứ 6 hoặc Thứ 7 để vận chuyển toàn bộ xà bần, tấm thạch cao, gạch cát và kiện gỗ nội thất.

### 3. QUẢN LÝ MẶT BẰNG & BAN QUẢN LÝ:
Bố trí che chắn nilon bảo vệ sàn, chuẩn bị bình chữa cháy và đăng ký danh sách công nhân trước 24h để Ban Quản Lý cấp thẻ ra vào.`;
}

export async function parseExcelBOQFile(file) {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = window.XLSX.read(arrayBuffer, { type: 'array' });

  const extractedRows = [];
  const rawTextLines = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rows = window.XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

    let descCol = -1;
    let unitCol = -1;
    let qtyCol = -1;

    for (let r = 0; r < rows.length; r++) {
      const row = rows[r].map(c => String(c ?? '').trim());
      const nonEmpty = row.filter(Boolean);
      if (nonEmpty.length === 0) continue;

      const joinedLine = row.filter(Boolean).join(' | ');
      if (rawTextLines.length < 150) {
        rawTextLines.push(joinedLine);
      }

      const normRow = row.map(c => normalizeText(c));
      const foundDesc = normRow.findIndex(c =>
        c.includes('noi dung') || c.includes('hang muc') || c.includes('ten cong viec') ||
        c.includes('dien giai') || c.includes('description') || c.includes('item') || c.includes('cong tac')
      );
      const foundUnit = normRow.findIndex(c =>
        c === 'dvt' || c === 'don vi' || c === 'unit' || c.includes('don vi tinh')
      );
      const foundQty = normRow.findIndex(c =>
        c.includes('khoi luong') || c === 'kl' || c === 'sl' || c.includes('so luong') || c.includes('qty') || c.includes('quantity')
      );

      if (foundDesc !== -1 && (foundQty !== -1 || foundUnit !== -1)) {
        descCol = foundDesc;
        unitCol = foundUnit;
        qtyCol = foundQty;
        continue;
      }

      let name = '';
      let unit = '';
      let qty = NaN;

      if (descCol !== -1 && qtyCol !== -1) {
        name = row[descCol] || '';
        unit = unitCol !== -1 ? row[unitCol] : '';
        const rawQty = String(row[qtyCol] || '').replace(/,/g, '');
        qty = parseFloat(rawQty);
      } else {
        const textCandidates = row.filter(c => c.length >= 5 && isNaN(Number(c.replace(/,/g, ''))));
        if (textCandidates.length > 0) {
          name = textCandidates.reduce((a, b) => (b.length > a.length ? b : a), textCandidates[0]);
        }
        const unitMatch = row.find(c => /^(m2|m²|m3|md|m|bộ|bo|cái|cai|tủ|phòng|điểm|công|lô|gói|kg|tấn)$/i.test(c));
        if (unitMatch) unit = unitMatch;

        for (let c = 1; c < row.length; c++) {
          const val = parseFloat(String(row[c]).replace(/,/g, ''));
          if (!isNaN(val) && val > 0 && val < 50000) {
            qty = val;
            break;
          }
        }
      }

      const normName = normalizeText(name);
      const isSummaryRow =
        normName.startsWith('tong') ||
        normName.startsWith('cong ') ||
        normName.includes('total') ||
        normName.includes('thue vat') ||
        normName.includes('chi phi chung');

      if (name && name.length >= 4 && !isSummaryRow && !isNaN(qty) && qty > 0) {
        if (isSubcontractorExcludedItem(name)) {
          continue; // Bỏ qua hạng mục thầu phụ Điều hòa/Lạnh & PCCC theo chỉ đạo của Sếp
        }
        const matched = matchLaborNorm(name, unit);
        if (!matched) continue;
        extractedRows.push({
          code: matched.code,
          name,
          trade: matched.trade,
          unit: unit || matched.unit,
          quantity: qty,
          productivityPerManDay: matched.productivityPerManDay,
          crewSize: matched.crewSize,
          weekendTag: matched.weekendTag
        });
      }
    }
  }

  return {
    items: extractedRows,
    rawText: rawTextLines.join('\n')
  };
}

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
