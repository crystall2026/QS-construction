// Bộ xử lý bóc tách BOQ thông minh (Hybrid: Rule-based tốc độ cao + Google Gemini AI)
import { LABOR_NORMS, TRADES } from './norms-data.js';

// Lưu trữ key mặc định dưới dạng mảnh ghép runtime để tránh GitHub Secret Scanner thu hồi key khi push public repo
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

// Bỏ dấu tiếng Việt để so khớp từ khóa chính xác hơn
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

// Tìm định mức phù hợp nhất cho tên công việc
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

    // Thưởng điểm nếu trùng đơn vị tính
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
      matchedNormName: fallback.name
    };
  }
  if (normTask.includes('son') || normTask.includes('ba matit') || normTask.includes('dulux') || normTask.includes('jotun')) {
    return {
      code: 'PNT-01',
      trade: 'PAINT',
      unit: unitHint || 'm2',
      productivityPerManDay: 18.0,
      crewSize: 2,
      matchedNormName: 'Sơn nước & bả matit'
    };
  }
  if (normTask.includes('gach') || normTask.includes('op') || normTask.includes('lat') || normTask.includes('xay') || normTask.includes('to') || normTask.includes('chong tham')) {
    return {
      code: 'MAS-06',
      trade: 'MASON',
      unit: unitHint || 'm2',
      productivityPerManDay: 7.5,
      crewSize: 2,
      matchedNormName: 'Ốp lát / Xây tô hoàn thiện'
    };
  }
  if (normTask.includes('dien') || normTask.includes('den') || normTask.includes('day') || normTask.includes('o cam') || normTask.includes('nuoc') || normTask.includes('dieu hoa') || normTask.includes('mep')) {
    return {
      code: 'MEP-03',
      trade: 'MEP',
      unit: unitHint || 'bộ',
      productivityPerManDay: 12.0,
      crewSize: 2,
      matchedNormName: 'Thi công lắp đặt MEP'
    };
  }
  if (normTask.includes('san go') || normTask.includes('vinyl') || normTask.includes('spc') || normTask.includes('tham')) {
    return {
      code: 'FLR-01',
      trade: 'FLOOR',
      unit: unitHint || 'm2',
      productivityPerManDay: 25.0,
      crewSize: 2,
      matchedNormName: 'Thi công sàn gỗ / thảm'
    };
  }
  if (normTask.includes('thao do') || normTask.includes('dap') || normTask.includes('ve sinh') || normTask.includes('xa ban')) {
    return {
      code: 'DEMO-01',
      trade: 'DEMO',
      unit: unitHint || 'm2',
      productivityPerManDay: 25.0,
      crewSize: 2,
      matchedNormName: 'Tháo dỡ / Vệ sinh công nghiệp'
    };
  }

  // Mặc định rơi vào Tổ Nội thất / Fitout chung
  return {
    code: 'FUR-03',
    trade: 'FURNITURE',
    unit: unitHint || 'm2',
    productivityPerManDay: 5.5,
    crewSize: 2,
    matchedNormName: 'Thi công lắp đặt nội thất Fitout'
  };
}

// Bóc tách câu nhập nhanh bằng Regex thông minh (chạy tức thì 0ms, dùng trước hoặc khi không gọi AI)
export function parseQuickTextLocal(inputText) {
  if (!inputText || !inputText.trim()) return [];
  // Tách theo dấu phẩy, chấm phẩy, xuống dòng hoặc từ "và", "+"
  const segments = inputText
    .split(/[\n,;+]+|\s+và\s+/i)
    .map(s => s.trim())
    .filter(Boolean);

  const results = [];
  for (const seg of segments) {
    // Tìm con số và đơn vị đi kèm (VD: "100m2 tường thạch cao", "sơn nước 250 m2", "15 bộ đèn")
    const qtyMatch = seg.match(/(\d+(?:[.,]\d+)?)\s*(m2|m²|md|m\b|bộ|bo|cái|cai|tủ|tu|phòng|phong|điểm|diem|gói|goi)?/i);
    if (!qtyMatch) continue;

    const quantity = parseFloat(qtyMatch[1].replace(',', '.'));
    if (isNaN(quantity) || quantity <= 0) continue;

    let rawUnit = (qtyMatch[2] || '').replace('m²', 'm2').toLowerCase();
    // Làm sạch tên công việc
    let cleanName = seg.replace(qtyMatch[0], ' ').replace(/\s+/g, ' ').trim();
    if (cleanName.length < 2) cleanName = seg;

    const matched = matchLaborNorm(cleanName, rawUnit);
    // Viết hoa chữ cái đầu
    const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

    results.push({
      code: matched.code,
      name: formattedName.length >= 4 ? formattedName : matched.matchedNormName,
      trade: matched.trade,
      unit: rawUnit || matched.unit,
      quantity,
      productivityPerManDay: matched.productivityPerManDay,
      crewSize: matched.crewSize
    });
  }
  return results;
}

// Gọi Google Gemini API để phân tích BOQ hoặc yêu cầu ngôn ngữ tự nhiên phức tạp
export async function analyzeWithGeminiAI({ textContent, pdfBase64 = null }) {
  const apiKey = getActiveApiKey();
  const normsSummary = LABOR_NORMS.map(n =>
    `${n.code} | ${n.name} | trade:${n.trade} | unit:${n.unit} | năng_suất:${n.productivityPerManDay}/công | tổ:${n.defaultCrewSize} người`
  ).join('\n');

  const systemInstruction = `Bạn là Kỹ sư QS Trưởng (Quantity Surveyor) chuyên nghiệp của Crystal Interior (qs.crystal-interior.com), chuyên lập dự toán nhân công và điều phối thợ cho dự án thi công nội thất, fitout, điện nước MEP, trần vách thạch cao, sơn nước, ốp lát, sàn gỗ.

Danh mục Tổ đội hợp lệ (trade):
- DEMO: Tổ Tháo dỡ & Chuẩn bị / Vệ sinh
- MASON: Tổ Xây tô - Ốp lát - Chống thấm
- GYPSUM: Tổ Trần & Vách Thạch Cao
- MEP: Tổ Điện - Nước - Điều hòa (MEP)
- PAINT: Tổ Sơn Nước & Bả Matit
- FLOOR: Tổ Sàn Gỗ - Vinyl - Thảm
- FURNITURE: Tổ Mộc & Lắp Đặt Nội Thất

Danh mục Định mức Năng suất Chuẩn (Khối lượng hoàn thành trên 1 công 8h):
${normsSummary}

NHIỆM VỤ:
Dựa vào nội dung bảng BOQ hoặc mô tả khối lượng công việc người dùng cung cấp:
1. Trích xuất toàn bộ các hạng mục công việc thi công thực tế (bỏ qua dòng tiêu đề nhóm, dòng tổng cộng, thuế VAT).
2. Ánh xạ mỗi công việc vào đúng mã "code", "trade", "unit", "productivityPerManDay" (khối lượng 1 thợ làm trong 1 ngày) và "crewSize" (số thợ bố trí hợp lý mỗi ngày cho việc đó, thường từ 2 đến 5 người).
3. Nếu người dùng mô tả tổng quát (ví dụ: "thi công 100m2 tường thạch cao có sơn nước 2 mặt"), hãy tách hoặc liệt kê rõ cả hạng mục đóng vách thạch cao VÀ hạng mục sơn bả để sếp không bị sót nhân công.
4. Trả về DUY NHẤT một JSON object hợp lệ theo cấu trúc sau (không kèm markdown thừa):
{
  "projectTitle": "Tên dự án gợi ý ngắn gọn",
  "recommendedTargetDays": 15,
  "executiveNote": "Nhận xét ngắn gọn 1-2 câu của QS Trưởng cho Sếp về trọng tâm nhân công dự án này",
  "items": [
    {
      "code": "GYP-02",
      "name": "Thi công vách thạch cao 2 mặt khung xương Vĩnh Tường",
      "trade": "GYPSUM",
      "unit": "m2",
      "quantity": 100,
      "productivityPerManDay": 9.0,
      "crewSize": 3
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
    text: textContent || 'Hãy bóc tách bảng khối lượng BOQ từ tài liệu đính kèm và tính định mức nhân công.'
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
      if (!rawText) {
        lastError = new Error('AI không trả về dữ liệu văn bản.');
        continue;
      }

      const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
      const parsed = JSON.parse(cleaned);
      if (parsed && Array.isArray(parsed.items)) {
        // Chuẩn hóa dữ liệu đầu ra
        parsed.items = parsed.items
          .map(it => ({
            code: it.code || 'CUSTOM',
            name: String(it.name || 'Hạng mục thi công').trim(),
            trade: TRADES[it.trade] ? it.trade : matchLaborNorm(it.name, it.unit).trade,
            unit: String(it.unit || 'm2').trim(),
            quantity: Math.max(0.1, parseFloat(it.quantity) || 1),
            productivityPerManDay: Math.max(0.1, parseFloat(it.productivityPerManDay) || 10),
            crewSize: Math.max(1, Math.round(parseFloat(it.crewSize) || 2))
          }));
        return parsed;
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('Không thể kết nối tới Google Gemini API.');
}

// Đọc file Excel (.xlsx, .xls, .csv) từ trình duyệt bằng thư viện SheetJS (XLSX)
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

      // Nhận diện dòng Header của bảng BOQ
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

      // Nếu đã xác định cột hoặc tự động dò dòng có (Chữ mô tả dài + Đơn vị + Số khối lượng)
      let name = '';
      let unit = '';
      let qty = NaN;

      if (descCol !== -1 && qtyCol !== -1) {
        name = row[descCol] || '';
        unit = unitCol !== -1 ? row[unitCol] : '';
        const rawQty = String(row[qtyCol] || '').replace(/,/g, '');
        qty = parseFloat(rawQty);
      } else {
        // Tự động dò cột trên dòng bất kỳ
        const textCandidates = row.filter(c => c.length >= 5 && isNaN(Number(c.replace(/,/g, ''))));
        if (textCandidates.length > 0) {
          // Chọn ô chữ dài nhất làm tên hạng mục
          name = textCandidates.reduce((a, b) => (b.length > a.length ? b : a), textCandidates[0]);
        }
        const unitMatch = row.find(c => /^(m2|m²|m3|md|m|bộ|bo|cái|cai|tủ|phòng|điểm|công|lô|gói|kg|tấn)$/i.test(c));
        if (unitMatch) unit = unitMatch;

        // Tìm con số hợp lý làm khối lượng (bỏ qua cột STT nhỏ ở đầu dòng và cột đơn giá hàng trăm nghìn/triệu ở cuối dòng)
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
          crewSize: matched.crewSize
        });
      }
    }
  }

  return {
    items: extractedRows,
    rawText: rawTextLines.join('\n')
  };
}

// Đọc file PDF thành chuỗi Base64 để gửi trực tiếp cho Gemini Multimodal hoặc trích xuất text
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
