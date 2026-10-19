// Bộ xử lý bóc tách BOQ thông minh (Hybrid: Rule-based tốc độ cao + Google Gemini AI)
import { LABOR_NORMS, TRADES, WEEKEND_TAGS } from './norms-data.js';

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

// Tự động phát hiện chế độ làm việc Thứ 7 - Chủ Nhật từ câu mô tả của khách/Sếp
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

// Tìm định mức & nhãn lưu ý Thứ 7 - Chủ nhật phù hợp nhất cho tên công việc
export function matchLaborNorm(taskName, unitHint = '') {
  const rawLower = String(taskName || '').toLowerCase();
  const normTask = normalizeText(taskName);
  const normUnit = normalizeText(unitHint);

  let bestNorm = null;
  let bestScore = -1;

  for (const norm of LABOR_NORMS) {
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

  // Fallback heuristics theo từ khóa ngắn
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
  if (normTask.includes('dien') || normTask.includes('den') || normTask.includes('day') || normTask.includes('o cam') || normTask.includes('nuoc') || normTask.includes('dieu hoa') || normTask.includes('mep')) {
    const isNoisyMEP = normTask.includes('cat') || normTask.includes('duc') || normTask.includes('ong dong') || normTask.includes('tu dien') || normTask.includes('he thong');
    return {
      code: isNoisyMEP ? 'MEP-01' : 'MEP-03',
      trade: 'MEP',
      unit: unitHint || 'bộ',
      productivityPerManDay: 12.0,
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

  return {
    code: 'FUR-03',
    trade: 'FURNITURE',
    unit: unitHint || 'm2',
    productivityPerManDay: 5.5,
    crewSize: 2,
    weekendTag: 'LIFT_SMELL_WEEKEND',
    matchedNormName: 'Thi công lắp đặt nội thất Fitout'
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
    // Bỏ qua cụm chỉ nói về số ngày hoặc thứ 7 chủ nhật
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

export async function analyzeWithGeminiAI({ textContent, pdfBase64 = null }) {
  const apiKey = getActiveApiKey();
  const normsSummary = LABOR_NORMS.map(n =>
    `${n.code} | ${n.name} | trade:${n.trade} | unit:${n.unit} | năng_suất:${n.productivityPerManDay}/công | weekendTag:${n.weekendTag}`
  ).join('\n');

  const systemInstruction = `Bạn là Kỹ sư QS Trưởng (Quantity Surveyor) chuyên nghiệp của Crystal Interior (qs.crystal-interior.com), chuyên lập dự toán nhân công và điều phối thợ cho dự án thi công nội thất, fitout bên trong tòa nhà văn phòng, chung cư, showroom.

Danh mục Tổ đội hợp lệ (trade):
- DEMO: Tổ Tháo dỡ & Vận chuyển Xà bần
- MASON: Tổ Xây tô - Ốp lát - Chống thấm
- GYPSUM: Tổ Trần & Vách Thạch Cao
- MEP: Tổ Điện - Nước - Điều hòa (MEP)
- PAINT: Tổ Sơn Nước & Bả Matit
- FLOOR: Tổ Sàn Gỗ - Vinyl - Thảm
- FURNITURE: Tổ Mộc & Lắp Đặt Nội Thất Fitout

Danh mục Phân loại Lưu ý Thứ 7 - Chủ Nhật trong Tòa nhà (weekendTag):
- HIGH_NOISE_WEEKEND: Việc gây ồn/rung/bụi lớn (đập phá, tháo dỡ, khoan bê tông bắn ty trần thạch cao, cắt đục rãnh điện nước, cắt gạch đá, khoan bắt vách gỗ). Bắt buộc/Ưu tiên tranh thủ làm Thứ 7 & Chủ Nhật.
- LIFT_SMELL_WEEKEND: Việc cần đăng ký thang tải (Service Lift) vận chuyển vật tư lớn (tủ gỗ, vách kính, xà bần, cát xi) hoặc có mùi keo/sơn PU/chống thấm cần bay mùi cuối tuần.
- QUIET_WEEKDAY: Việc thi công êm bên trong mặt bằng (bả bột, lăn sơn nước, kéo dây điện, lắp đèn, ghép sàn gỗ, lắp ráp module tủ/bàn ghế). Làm T2-T6 bình thường.

Danh mục Chế độ làm việc cuối tuần (weekendMode):
- FULL_WITH_WEEKEND_BOOST: Làm cả T7 & CN (ưu tiên dồn việc ồn/khoan cắt/thang hàng vào T7-CN)
- SAT_WORK_SUN_OFF: Làm Thứ 2 đến Thứ 7, nghỉ Chủ Nhật
- MON_FRI_ONLY: Chỉ làm Thứ 2 đến Thứ 6, nghỉ Thứ 7 & Chủ Nhật
- WEEKEND_NOISY_FOCUS: Tòa nhà văn phòng nghiêm ngặt (T2-T6 chỉ làm việc êm, toàn bộ việc ồn/khoan cắt dồn vào T7-CN)

Danh mục Định mức Năng suất Chuẩn:
${normsSummary}

Trả về DUY NHẤT một JSON object hợp lệ:
{
  "projectTitle": "Tên dự án gợi ý",
  "recommendedTargetDays": 15,
  "weekendMode": "FULL_WITH_WEEKEND_BOOST",
  "executiveNote": "Nhận xét của QS Trưởng cho Sếp về số thợ và lưu ý các việc cần tranh thủ làm Thứ 7 - Chủ Nhật trong tòa nhà",
  "items": [
    {
      "code": "GYP-02",
      "name": "Thi công vách thạch cao 2 mặt khung xương Vĩnh Tường",
      "trade": "GYPSUM",
      "unit": "m2",
      "quantity": 100,
      "productivityPerManDay": 9.0,
      "crewSize": 3,
      "weekendTag": "HIGH_NOISE_WEEKEND"
    }
  ]
}`;

  const parts = [];
  if (pdfBase64) {
    parts.push({
      inline_data: {
        mime_type: 'application/pdf',
        data: pdfBase64
      }
    });
  }
  parts.push({
    text: textContent || 'Hãy bóc tách bảng khối lượng BOQ từ tài liệu đính kèm và phân loại lịch làm việc Thứ 7 - Chủ Nhật trong tòa nhà.'
  });

  const modelsToTry = ['models/gemini-flash-latest', 'models/gemini-3.8-flash', 'models/gemini-3.5-flash'];
  let lastError = null;

  for (const modelName of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: [{ role: 'user', parts }],
          generationConfig: {
            temperature: 0.15,
            responseMimeType: 'application/json'
          }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        lastError = new Error(`HTTP ${response.status}: ${errText.slice(0, 200)}`);
        continue;
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (!rawText) continue;

      const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      const parsed = JSON.parse(cleaned);
      if (parsed && Array.isArray(parsed.items)) {
        parsed.items = parsed.items.map(it => {
          const fallbackMatch = matchLaborNorm(it.name, it.unit);
          return {
            code: it.code || fallbackMatch.code,
            name: String(it.name || 'Hạng mục thi công').trim(),
            trade: TRADES[it.trade] ? it.trade : fallbackMatch.trade,
            unit: String(it.unit || fallbackMatch.unit || 'm2').trim(),
            quantity: Math.max(0.1, parseFloat(it.quantity) || 1),
            productivityPerManDay: Math.max(0.1, parseFloat(it.productivityPerManDay) || fallbackMatch.productivityPerManDay),
            crewSize: Math.max(1, Math.round(parseFloat(it.crewSize) || 2)),
            weekendTag: WEEKEND_TAGS[it.weekendTag] ? it.weekendTag : fallbackMatch.weekendTag
          };
        });
        return parsed;
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('Không thể kết nối tới Google Gemini API.');
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
      if (rawTextLines.length < 250) {
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
        const matched = matchLaborNorm(name, unit);
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
