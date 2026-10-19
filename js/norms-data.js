// Cơ sở dữ liệu Định mức Nhân công Thực tế Ngành Thi công Nội thất & Fitout (Crystal Interior QS)
// Đơn vị năng suất: Khối lượng hoàn thành bởi 1 công (1 thợ làm việc 8h/ngày)

export const TRADES = {
  DEMO: {
    id: 'DEMO',
    name: 'Tổ Tháo dỡ & Chuẩn bị',
    shortName: 'Tháo dỡ / Phụ',
    icon: '🔨',
    color: '#ef4444',
    bgLight: '#fef2f2',
    phase: 1, // Giai đoạn 1: 0% -> 20% tiến độ
    startPct: 0.0,
    endPct: 0.20,
    defaultDailyWage: 480000,
    roleDesc: 'Thợ tháo dỡ, đập phá, vận chuyển xà bần & dọn mặt bằng'
  },
  MASON: {
    id: 'MASON',
    name: 'Tổ Xây tô - Ốp lát - Chống thấm',
    shortName: 'Thợ Hồ / Ốp lát',
    icon: '🧱',
    color: '#f97316',
    bgLight: '#fff7ed',
    phase: 2, // Giai đoạn 2: 10% -> 55% tiến độ
    startPct: 0.10,
    endPct: 0.55,
    defaultDailyWage: 620000,
    roleDesc: 'Thợ nề xây trát, cán nền, chống thấm, ốp lát gạch đá'
  },
  GYPSUM: {
    id: 'GYPSUM',
    name: 'Tổ Trần & Vách Thạch Cao',
    shortName: 'Thợ Thạch cao',
    icon: '🏗️',
    color: '#0ea5e9',
    bgLight: '#f0f9ff',
    phase: 2, // Giai đoạn 2: 15% -> 55% tiến độ
    startPct: 0.15,
    endPct: 0.55,
    defaultDailyWage: 600000,
    roleDesc: 'Thợ đóng khung xương trần chìm, trần thả, vách thạch cao 1-2 mặt'
  },
  MEP: {
    id: 'MEP',
    name: 'Tổ Điện - Nước - Điều hòa (MEP)',
    shortName: 'Thợ Điện nước (MEP)',
    icon: '⚡',
    color: '#eab308',
    bgLight: '#fefce8',
    phase: 2, // Đi âm đầu kỳ & lắp thiết bị cuối kỳ (10% -> 90%)
    startPct: 0.10,
    endPct: 0.90,
    defaultDailyWage: 650000,
    roleDesc: 'Thợ đi ống luồn dây âm, kéo dây, lắp đèn, ổ cắm, cấp thoát nước & ĐHKK'
  },
  PAINT: {
    id: 'PAINT',
    name: 'Tổ Sơn Nước & Bả Matit',
    shortName: 'Thợ Sơn bả',
    icon: '🎨',
    color: '#8b5cf6',
    bgLight: '#f5f3ff',
    phase: 3, // Giai đoạn 3: 45% -> 85% tiến độ
    startPct: 0.45,
    endPct: 0.85,
    defaultDailyWage: 580000,
    roleDesc: 'Thợ xử lý mối nối, bả bột matit 2 lớp, xả nhám, sơn lót & sơn phủ hoàn thiện'
  },
  FLOOR: {
    id: 'FLOOR',
    name: 'Tổ Sàn Gỗ - Vinyl - Thảm',
    shortName: 'Thợ Sàn gỗ / Thảm',
    icon: '🪵',
    color: '#10b981',
    bgLight: '#ecfdf5',
    phase: 4, // Giai đoạn 4: 65% -> 90% tiến độ
    startPct: 0.65,
    endPct: 0.90,
    defaultDailyWage: 600000,
    roleDesc: 'Thợ lát sàn gỗ công nghiệp, xương cá, sàn nhựa SPC/Vinyl, trải thảm, đóng len'
  },
  FURNITURE: {
    id: 'FURNITURE',
    name: 'Tổ Mộc & Lắp Đặt Nội Thất',
    shortName: 'Thợ Nội thất / Mộc',
    icon: '🚪',
    color: '#2563eb',
    bgLight: '#eff6ff',
    phase: 4, // Giai đoạn 4-5: 60% -> 100% tiến độ
    startPct: 0.60,
    endPct: 1.00,
    defaultDailyWage: 680000,
    roleDesc: 'Thợ lắp đặt tủ bếp, tủ áo, vách ốp gỗ, cửa, kính, đồ rời & hoàn thiện bàn giao'
  }
};

// Danh mục Định mức Năng suất Chuẩn (productivityPerManDay = Khối lượng 1 thợ làm được trong 1 ngày 8h)
export const LABOR_NORMS = [
  // 1. THÁO DỠ & CHUẨN BỊ
  {
    code: 'DEMO-01',
    name: 'Tháo dỡ vách thạch cao, trần thạch cao cũ',
    trade: 'DEMO',
    unit: 'm2',
    productivityPerManDay: 25.0,
    defaultCrewSize: 2,
    keywords: ['tháo dỡ thạch cao', 'dỡ vách thạch cao', 'dỡ trần', 'phá vách thạch cao'],
    note: 'Bao gồm hạ khung xương, tấm và gom gọn trong mặt bằng'
  },
  {
    code: 'DEMO-02',
    name: 'Đập phá tường gạch cũ (dày 100-200mm)',
    trade: 'DEMO',
    unit: 'm2',
    productivityPerManDay: 7.5,
    defaultCrewSize: 2,
    keywords: ['đập tường', 'phá tường gạch', 'tháo dỡ tường gạch', 'đập vách gạch'],
    note: 'Đập tường gạch và đóng bao xà bần tại chỗ'
  },
  {
    code: 'DEMO-03',
    name: 'Đục bóc gạch nền, gạch ốp tường cũ',
    trade: 'DEMO',
    unit: 'm2',
    productivityPerManDay: 12.0,
    defaultCrewSize: 2,
    keywords: ['đục gạch', 'bóc gạch nền', 'đục nền', 'bóc gạch tường', 'tháo sàn cũ'],
    note: 'Đục bằng máy chuyên dụng và thu gom xà bần'
  },
  {
    code: 'DEMO-04',
    name: 'Vận chuyển xà bần & vệ sinh mặt bằng thô',
    trade: 'DEMO',
    unit: 'm2',
    productivityPerManDay: 35.0,
    defaultCrewSize: 2,
    keywords: ['xà bần', 'vận chuyển phế thải', 'dọn mặt bằng', 'trạc thải'],
    note: 'Tính theo m2 diện tích sàn xây dựng/cải tạo'
  },

  // 2. XÂY TÔ - ỐP LÁT - CHỐNG THẤM
  {
    code: 'MAS-01',
    name: 'Xây tường gạch ống / gạch thẻ dày 100mm',
    trade: 'MASON',
    unit: 'm2',
    productivityPerManDay: 7.0,
    defaultCrewSize: 2,
    keywords: ['xây tường 100', 'xây tường gạch', 'xây tường ngăn', 'xây gạch ống', 'xây tường'],
    note: '1 thợ chính + phụ trộn vữa tính quy đổi bình quân 7m2/công'
  },
  {
    code: 'MAS-02',
    name: 'Xây tường gạch dày 200mm',
    trade: 'MASON',
    unit: 'm2',
    productivityPerManDay: 4.2,
    defaultCrewSize: 2,
    keywords: ['xây tường 200', 'tường đôi', 'xây gạch 200'],
    note: 'Tường gạch dày 200mm'
  },
  {
    code: 'MAS-03',
    name: 'Tô trát tường nội thất phẳng đẹp (dày 1.5cm)',
    trade: 'MASON',
    unit: 'm2',
    productivityPerManDay: 10.0,
    defaultCrewSize: 2,
    keywords: ['tô tường', 'trát tường', 'tô trát', 'trát vữa'],
    note: 'Tô tường trong nhà có ghém mốc chuẩn'
  },
  {
    code: 'MAS-04',
    name: 'Cán nền vữa xi măng lấy cốt phẳng (dày 3-5cm)',
    trade: 'MASON',
    unit: 'm2',
    productivityPerManDay: 14.0,
    defaultCrewSize: 2,
    keywords: ['cán nền', 'cán vữa', 'láng nền', 'cán sàn'],
    note: 'Cán nền chuẩn bị lát gạch hoặc lát sàn gỗ'
  },
  {
    code: 'MAS-05',
    name: 'Thi công chống thấm sàn WC, ban công (2-3 lớp)',
    trade: 'MASON',
    unit: 'm2',
    productivityPerManDay: 16.0,
    defaultCrewSize: 2,
    keywords: ['chống thấm', 'sika', 'korsil', 'chống thấm wc', 'chống thấm sàn'],
    note: 'Vệ sinh mài sàn, bo góc cổ ống và quét 2-3 lớp chống thấm'
  },
  {
    code: 'MAS-06',
    name: 'Lát gạch nền (600x600, 800x800) hoàn thiện chà ron',
    trade: 'MASON',
    unit: 'm2',
    productivityPerManDay: 7.5,
    defaultCrewSize: 2,
    keywords: ['lát gạch', 'lát nền', 'gạch nền', 'ốp lát nền', 'lát sàn gạch', 'ốp lát'],
    note: 'Bao gồm trải keo/hồ dầu, cân ke phẳng và chà ron hoàn thiện'
  },
  {
    code: 'MAS-07',
    name: 'Ốp gạch tường WC, bếp (300x600, 600x1200)',
    trade: 'MASON',
    unit: 'm2',
    productivityPerManDay: 5.5,
    defaultCrewSize: 2,
    keywords: ['ốp gạch', 'ốp tường', 'gạch ốp tường', 'ốp wc', 'ốp nhà vệ sinh'],
    note: 'Ốp gạch tường đòi hỏi cắt khoét lỗ thiết bị và căn chỉnh mạch'
  },
  {
    code: 'MAS-08',
    name: 'Ốp len chân tường gạch',
    trade: 'MASON',
    unit: 'md',
    productivityPerManDay: 22.0,
    defaultCrewSize: 1,
    keywords: ['len gạch', 'len chân tường gạch'],
    note: 'Ốp nổi hoặc âm chân tường và chà ron'
  },
  {
    code: 'MAS-09',
    name: 'Ốp lát đá Granite / Marble mặt bếp, lavabo, tam cấp',
    trade: 'MASON',
    unit: 'm2',
    productivityPerManDay: 3.5,
    defaultCrewSize: 2,
    keywords: ['đá bếp', 'đá hoa cương', 'đá granite', 'đá marble', 'mặt đá', 'đá nung kết'],
    note: 'Cắt khoét chậu rửa, bếp từ, mài bo cạnh và gắn keo'
  },

  // 3. TRẦN & VÁCH THẠCH CAO
  {
    code: 'GYP-01',
    name: 'Thi công vách thạch cao 1 mặt khung xương Vĩnh Tường',
    trade: 'GYPSUM',
    unit: 'm2',
    productivityPerManDay: 12.0,
    defaultCrewSize: 2,
    keywords: ['vách thạch cao 1 mặt', 'vách 1 mặt', 'thạch cao 1 mặt'],
    note: 'Đi khung xương U75/76 và bắn tấm thạch cao 1 mặt (chưa gồm sơn bả)'
  },
  {
    code: 'GYP-02',
    name: 'Thi công vách thạch cao 2 mặt khung xương Vĩnh Tường',
    trade: 'GYPSUM',
    unit: 'm2',
    productivityPerManDay: 9.0,
    defaultCrewSize: 2,
    keywords: ['vách thạch cao', 'tường thạch cao', 'vách thạch cao 2 mặt', 'ngăn vách thạch cao'],
    note: 'Định mức chuẩn 9m2/công cho vách thạch cao 2 mặt cao <= 3.2m'
  },
  {
    code: 'GYP-03',
    name: 'Thi công vách thạch cao 2 mặt có bông cách âm / tiêu âm',
    trade: 'GYPSUM',
    unit: 'm2',
    productivityPerManDay: 7.5,
    defaultCrewSize: 2,
    keywords: ['vách thạch cao cách âm', 'vách cách âm', 'bông khoáng', 'bông thủy tinh'],
    note: 'Bao gồm nhét bông khoáng/bông thủy tinh ở giữa khung xương'
  },
  {
    code: 'GYP-04',
    name: 'Thi công trần thạch cao khung chìm phẳng',
    trade: 'GYPSUM',
    unit: 'm2',
    productivityPerManDay: 11.0,
    defaultCrewSize: 2,
    keywords: ['trần thạch cao phẳng', 'trần thạch cao chìm', 'trần thạch cao', 'đóng trần thạch cao'],
    note: 'Bắn ty treo, đi khung xương chìm và bắn tấm thạch cao tiêu chuẩn/chống ẩm'
  },
  {
    code: 'GYP-05',
    name: 'Thi công trần thạch cao giật cấp / khe đèn hắt',
    trade: 'GYPSUM',
    unit: 'm2',
    productivityPerManDay: 7.5,
    defaultCrewSize: 2,
    keywords: ['trần giật cấp', 'trần thạch cao giật cấp', 'khe hắt sáng', 'trần trang trí'],
    note: 'Trần giật cấp hoặc tạo rãnh đèn LED, khe rèm phức tạp hơn trần phẳng'
  },
  {
    code: 'GYP-06',
    name: 'Thi công trần thạch cao thả (khung nổi 600x600)',
    trade: 'GYPSUM',
    unit: 'm2',
    productivityPerManDay: 18.0,
    defaultCrewSize: 2,
    keywords: ['trần thả', 'trần nổi', 'trần 600x600', 'trần tấm thả'],
    note: 'Thi công nhanh cho văn phòng, nhà xưởng, showroom'
  },
  {
    code: 'GYP-07',
    name: 'Đóng hộp kỹ thuật thạch cao / làm khe rèm',
    trade: 'GYPSUM',
    unit: 'md',
    productivityPerManDay: 10.0,
    defaultCrewSize: 2,
    keywords: ['hộp kỹ thuật', 'hộp thạch cao', 'hộc rèm', 'khe rèm'],
    note: 'Tính theo mét dài hộp che ống hoặc hộc rèm'
  },

  // 4. SƠN NƯỚC & BẢ MATIT
  {
    code: 'PNT-01',
    name: 'Bả bột matit 2 lớp + xả nhám + 1 sơn lót + 2 sơn phủ tường/vách',
    trade: 'PAINT',
    unit: 'm2',
    productivityPerManDay: 18.0,
    defaultCrewSize: 2,
    keywords: ['sơn nước', 'sơn bả', 'bả matit', 'sơn tường', 'sơn vách', 'thi công sơn nước'],
    note: 'Quy trình trọn gói từ xử lý bề mặt, bả 2 lớp, xả nhám đến lăn 3 lớp sơn hoàn thiện'
  },
  {
    code: 'PNT-02',
    name: 'Bả bột matit + sơn nước hoàn thiện trần thạch cao',
    trade: 'PAINT',
    unit: 'm2',
    productivityPerManDay: 15.0,
    defaultCrewSize: 2,
    keywords: ['sơn trần', 'sơn bả trần', 'bả trần thạch cao'],
    note: 'Bao gồm dán băng keo lưới mối nối thạch cao, bả 2 lớp và sơn trắng trần'
  },
  {
    code: 'PNT-03',
    name: 'Sơn lại tường cũ (dặm vá, 1 sơn lót + 2 sơn phủ, không bả toàn bộ)',
    trade: 'PAINT',
    unit: 'm2',
    productivityPerManDay: 32.0,
    defaultCrewSize: 2,
    keywords: ['sơn lại', 'sơn dặm', 'lăn sơn không bả', 'sơn phủ'],
    note: 'Dành cho bề mặt tường/vách cũ đã có lớp bả phẳng, chỉ dặm vá và lăn sơn mới'
  },
  {
    code: 'PNT-04',
    name: 'Sơn hiệu ứng bê tông / sơn giả đá / sơn trang trí',
    trade: 'PAINT',
    unit: 'm2',
    productivityPerManDay: 8.5,
    defaultCrewSize: 2,
    keywords: ['sơn hiệu ứng', 'sơn giả bê tông', 'sơn pukaco', 'sơn nghệ thuật', 'sơn giả đá'],
    note: 'Thi công tạo vân thủ công + phủ wax bảo vệ'
  },

  // 5. ĐIỆN - NƯỚC - ĐIỀU HÒA (MEP)
  {
    code: 'MEP-01',
    name: 'Thi công hệ thống Điện & Chiếu sáng trọn gói (theo m2 sàn Fitout)',
    trade: 'MEP',
    unit: 'm2',
    productivityPerManDay: 8.0,
    defaultCrewSize: 2,
    keywords: ['điện trọn gói', 'hệ thống điện', 'thi công điện', 'mep sàn', 'nhân công điện'],
    note: 'Tính quy đổi theo m2 sàn xây dựng: đi ống gen, kéo dây nguồn/mạng, lắp thiết bị'
  },
  {
    code: 'MEP-02',
    name: 'Đặt ống luồn dây & kéo dây điện nguồn / mạng LAN âm tường-trần',
    trade: 'MEP',
    unit: 'md',
    productivityPerManDay: 35.0,
    defaultCrewSize: 2,
    keywords: ['ống luồn dây', 'kéo dây điện', 'dây cáp', 'dây mạng', 'ống ruột gà', 'ống pvc điện'],
    note: 'Cắt rãnh/cố định ống gen và luồn dây điện/dây mạng'
  },
  {
    code: 'MEP-03',
    name: 'Khoét lỗ & lắp đặt đèn Downlight âm trần / đèn Spotlight / đèn Panel',
    trade: 'MEP',
    unit: 'bộ',
    productivityPerManDay: 20.0,
    defaultCrewSize: 2,
    keywords: ['đèn downlight', 'đèn âm trần', 'lắp đèn', 'đèn spotlight', 'đèn rọi', 'đèn panel'],
    note: 'Bao gồm khoét lỗ thạch cao, đấu nối nguồn driver và cân chỉnh đèn'
  },
  {
    code: 'MEP-04',
    name: 'Dán & đấu nối đèn LED dây / thanh nhôm định hình (hắt trần, tủ)',
    trade: 'MEP',
    unit: 'md',
    productivityPerManDay: 18.0,
    defaultCrewSize: 2,
    keywords: ['led dây', 'đèn led thanh', 'nhôm định hình', 'đèn hắt', 'led tủ'],
    note: 'Lắp thanh nhôm profile, dán LED dây, hàn điểm đấu nguồn 12V/24V'
  },
  {
    code: 'MEP-05',
    name: 'Lắp đặt ổ cắm, công tắc, mặt hạt mạng, CB nhánh',
    trade: 'MEP',
    unit: 'bộ',
    productivityPerManDay: 18.0,
    defaultCrewSize: 2,
    keywords: ['ổ cắm', 'công tắc', 'đế âm', 'aptomat', 'thiết bị điện'],
    note: 'Chôn đế âm, đấu nối hạt công tắc/ổ cắm và cân chỉnh mặt che'
  },
  {
    code: 'MEP-06',
    name: 'Đấu nối tủ điện tổng / tủ điện tầng hoàn chỉnh',
    trade: 'MEP',
    unit: 'tủ',
    productivityPerManDay: 1.0,
    defaultCrewSize: 2,
    keywords: ['tủ điện', 'lắp tủ điện', 'đấu tủ điện'],
    note: 'Lắp vỏ tủ, thanh cái, MCB/RCCB, bấm cos và đánh nhãn lộ dây'
  },
  {
    code: 'MEP-07',
    name: 'Thi công đường ống cấp thoát nước phòng WC / khu bếp',
    trade: 'MEP',
    unit: 'phòng',
    productivityPerManDay: 0.4,
    defaultCrewSize: 2,
    keywords: ['cấp thoát nước', 'ống nước', 'điện nước wc', 'ống ppr', 'ống pvc thoát'],
    note: 'Tương đương ~2.5 công/phòng WC hoàn chỉnh phần ống âm và thử áp'
  },
  {
    code: 'MEP-08',
    name: 'Lắp đặt thiết bị vệ sinh (bồn cầu, lavabo, sen tắm, chậu rửa bếp)',
    trade: 'MEP',
    unit: 'bộ',
    productivityPerManDay: 3.5,
    defaultCrewSize: 2,
    keywords: ['thiết bị vệ sinh', 'bồn cầu', 'lavabo', 'sen tắm', 'chậu rửa', 'vòi bếp'],
    note: 'Lắp đặt hoàn thiện, đi keo chống mốc và kiểm tra rò rỉ'
  },
  {
    code: 'MEP-09',
    name: 'Đi ống đồng âm & lắp đặt máy điều hòa treo tường / âm trần',
    trade: 'MEP',
    unit: 'bộ',
    productivityPerManDay: 1.5,
    defaultCrewSize: 2,
    keywords: ['điều hòa', 'máy lạnh', 'ống đồng', 'dàn lạnh', 'dàn nóng'],
    note: 'Bao gồm đi ống đồng/nước ngưng và treo lắp dàn nóng - dàn lạnh'
  },

  // 6. SÀN GỖ - VINYL - THẢM
  {
    code: 'FLR-01',
    name: 'Lắp đặt sàn gỗ công nghiệp lát thẳng (kèm trải xốp lót)',
    trade: 'FLOOR',
    unit: 'm2',
    productivityPerManDay: 25.0,
    defaultCrewSize: 2,
    keywords: ['sàn gỗ', 'sàn gỗ công nghiệp', 'lát sàn gỗ', 'sàn spc'],
    note: 'Trải foam lót và ghép hèm khóa sàn gỗ thẳng'
  },
  {
    code: 'FLR-02',
    name: 'Lắp đặt sàn gỗ công nghiệp / tự nhiên lát xương cá',
    trade: 'FLOOR',
    unit: 'm2',
    productivityPerManDay: 14.0,
    defaultCrewSize: 2,
    keywords: ['sàn xương cá', 'sàn gỗ xương cá', 'lát xương cá'],
    note: 'Sàn xương cá hao công cắt ghép góc 45 độ nhiều hơn lát thẳng'
  },
  {
    code: 'FLR-03',
    name: 'Dán sàn nhựa giả gỗ Vinyl / Trải thảm tấm văn phòng 500x500',
    trade: 'FLOOR',
    unit: 'm2',
    productivityPerManDay: 32.0,
    defaultCrewSize: 2,
    keywords: ['sàn nhựa', 'sàn vinyl', 'thảm văn phòng', 'trải thảm', 'thảm tấm'],
    note: 'Quét keo chuyên dụng và dán sàn vinyl hoặc thảm gạch văn phòng'
  },
  {
    code: 'FLR-04',
    name: 'Đóng phào / len chân tường gỗ, nhựa & nẹp kết thúc sàn',
    trade: 'FLOOR',
    unit: 'md',
    productivityPerManDay: 35.0,
    defaultCrewSize: 1,
    keywords: ['len chân tường', 'phào chân tường', 'nẹp sàn', 'len nhựa', 'len gỗ'],
    note: 'Cắt góc 45 độ, bắn đinh/keo và đi silicon mép tường'
  },

  // 7. MỘC & LẮP ĐẶT NỘI THẤT GỖ (FITOUT CARPENTRY)
  {
    code: 'FUR-01',
    name: 'Lắp đặt tủ bếp dưới & tủ bếp trên hoàn chỉnh (gồm phụ kiện)',
    trade: 'FURNITURE',
    unit: 'md',
    productivityPerManDay: 1.6,
    defaultCrewSize: 2,
    keywords: ['tủ bếp', 'tủ bếp trên', 'tủ bếp dưới', 'bếp gỗ', 'lắp tủ bếp'],
    note: 'Lắp thùng tủ, cánh Acrylic/Melamine, bản lề giảm chấn, ray kéo (tính theo md đơn)'
  },
  {
    code: 'FUR-02',
    name: 'Lắp đặt tủ quần áo / tủ trang trí / tủ hồ sơ cao kịch trần',
    trade: 'FURNITURE',
    unit: 'm2',
    productivityPerManDay: 3.5,
    defaultCrewSize: 2,
    keywords: ['tủ quần áo', 'tủ áo', 'tủ trang trí', 'tủ hồ sơ', 'tủ âm tường', 'tủ giày'],
    note: 'Lắp đặt tại công trình tính theo m2 mặt đứng tủ (rộng x cao)'
  },
  {
    code: 'FUR-03',
    name: 'Thi công vách ốp gỗ trang trí, lam sóng, vách đầu giường',
    trade: 'FURNITURE',
    unit: 'm2',
    productivityPerManDay: 5.5,
    defaultCrewSize: 2,
    keywords: ['vách ốp gỗ', 'lam gỗ', 'vách trang trí', 'ốp vách', 'lam sóng', 'vách đầu giường', 'nội thất'],
    note: 'Bao gồm khung xương/keo, tấm ốp gỗ MDF/Laminate/Veneer và nẹp chỉ'
  },
  {
    code: 'FUR-04',
    name: 'Lắp đặt cửa gỗ công nghiệp / cửa nhựa Composite (khung + cánh + khóa)',
    trade: 'FURNITURE',
    unit: 'bộ',
    productivityPerManDay: 2.2,
    defaultCrewSize: 2,
    keywords: ['cửa gỗ', 'cửa phòng', 'cửa composite', 'cửa nhựa', 'lắp cửa'],
    note: 'Dựng khung bao, bơm foam, treo cánh, đóng nẹp chỉ 2 mặt và khoét lắp khóa'
  },
  {
    code: 'FUR-05',
    name: 'Lắp đặt vách kính cường lực văn phòng / cabin tắm kính',
    trade: 'FURNITURE',
    unit: 'm2',
    productivityPerManDay: 7.0,
    defaultCrewSize: 3,
    keywords: ['vách kính', 'kính cường lực', 'cabin tắm', 'cửa kính'],
    note: 'Đi đế sập nhôm, dựng kính cường lực 10-12mm, lắp bản lề sàn & bơm keo'
  },
  {
    code: 'FUR-06',
    name: 'Lắp đặt nội thất rời (giường ngủ, bàn làm việc, kệ tivi, bàn họp, bàn ăn)',
    trade: 'FURNITURE',
    unit: 'cái',
    productivityPerManDay: 3.0,
    defaultCrewSize: 2,
    keywords: ['giường ngủ', 'giường', 'bàn làm việc', 'kệ tivi', 'bàn họp', 'bàn ăn', 'quầy lễ tân', 'đồ rời'],
    note: 'Lắp ráp hoàn thiện tại công trình và căn chỉnh phụ kiện'
  },
  {
    code: 'FUR-07',
    name: 'Vệ sinh công nghiệp chuyên sâu toàn bộ công trình trước bàn giao',
    trade: 'DEMO',
    unit: 'm2',
    productivityPerManDay: 35.0,
    defaultCrewSize: 3,
    keywords: ['vệ sinh công nghiệp', 'vệ sinh bàn giao', 'dọn vệ sinh hoàn thiện'],
    note: 'Hút bụi, tẩy sơn/xi măng, lau kính, lau toàn bộ bên trong tủ nội thất'
  }
];

// 4 Dự án Mẫu (Templates) giúp Sếp & QS trải nghiệm ngay lập tức
export const PROJECT_TEMPLATES = {
  office250: {
    title: 'Fitout Văn Phòng Hạng A - 250m² (Trọn gói)',
    targetDays: 25,
    difficultyFactor: 1.1, // Thi công tòa nhà văn phòng
    items: [
      { code: 'DEMO-01', name: 'Tháo dỡ vách thạch cao & trần cũ mặt bằng thuê', trade: 'DEMO', unit: 'm2', quantity: 140, productivityPerManDay: 25.0, crewSize: 3 },
      { code: 'GYP-03', name: 'Thi công vách thạch cao 2 mặt có bông cách âm phòng họp & GĐ', trade: 'GYPSUM', unit: 'm2', quantity: 165, productivityPerManDay: 7.5, crewSize: 4 },
      { code: 'GYP-04', name: 'Thi công trần thạch cao khung chìm + khu vực trần thả', trade: 'GYPSUM', unit: 'm2', quantity: 230, productivityPerManDay: 11.0, crewSize: 4 },
      { code: 'MEP-01', name: 'Thi công hệ thống Điện nguồn, Mạng LAN & Chiếu sáng văn phòng', trade: 'MEP', unit: 'm2', quantity: 250, productivityPerManDay: 8.0, crewSize: 4 },
      { code: 'PNT-01', name: 'Bả bột matit 2 lớp & sơn nước hoàn thiện vách, trần', trade: 'PAINT', unit: 'm2', quantity: 520, productivityPerManDay: 18.0, crewSize: 4 },
      { code: 'FLR-03', name: 'Trải thảm tấm văn phòng 500x500 & sàn nhựa khu Pantry', trade: 'FLOOR', unit: 'm2', quantity: 245, productivityPerManDay: 32.0, crewSize: 3 },
      { code: 'FUR-05', name: 'Lắp đặt vách kính cường lực 10mm phòng họp & phòng Giám đốc', trade: 'FURNITURE', unit: 'm2', quantity: 68, productivityPerManDay: 7.0, crewSize: 3 },
      { code: 'FUR-03', name: 'Ốp vách gỗ Laminate khu vực Backdrop Lễ tân & phòng họp', trade: 'FURNITURE', unit: 'm2', quantity: 42, productivityPerManDay: 5.5, crewSize: 3 },
      { code: 'FUR-02', name: 'Lắp đặt hệ tủ Pantry, tủ hồ sơ âm tường & quầy Reception', trade: 'FURNITURE', unit: 'm2', quantity: 38, productivityPerManDay: 3.5, crewSize: 4 },
      { code: 'FUR-06', name: 'Lắp đặt cụm bàn làm việc nhân viên, bàn họp lớn, bàn GĐ', trade: 'FURNITURE', unit: 'cái', quantity: 28, productivityPerManDay: 3.0, crewSize: 3 },
      { code: 'FUR-07', name: 'Vệ sinh công nghiệp bàn giao văn phòng', trade: 'DEMO', unit: 'm2', quantity: 250, productivityPerManDay: 35.0, crewSize: 4 }
    ]
  },
  apartment85: {
    title: 'Hoàn Thiện & Nội Thất Căn Hộ 2PN - 85m²',
    targetDays: 20,
    difficultyFactor: 1.05, // Chung cư
    items: [
      { code: 'MAS-05', name: 'Chống thấm 2 phòng WC & ban công', trade: 'MASON', unit: 'm2', quantity: 24, productivityPerManDay: 16.0, crewSize: 2 },
      { code: 'MAS-06', name: 'Lát gạch nền phòng khách, bếp, WC & ốp tường 2 WC', trade: 'MASON', unit: 'm2', quantity: 78, productivityPerManDay: 6.5, crewSize: 3 },
      { code: 'GYP-02', name: 'Đóng vách thạch cao 2 mặt cải tạo phòng ngủ', trade: 'GYPSUM', unit: 'm2', quantity: 32, productivityPerManDay: 9.0, crewSize: 2 },
      { code: 'GYP-05', name: 'Thi công trần thạch cao giật cấp + khe đèn LED + hộc rèm', trade: 'GYPSUM', unit: 'm2', quantity: 82, productivityPerManDay: 7.5, crewSize: 3 },
      { code: 'MEP-03', name: 'Đi dây điện bổ sung, lắp đèn Downlight, LED dây & công tắc ổ cắm', trade: 'MEP', unit: 'bộ', quantity: 65, productivityPerManDay: 12.0, crewSize: 2 },
      { code: 'PNT-01', name: 'Bả matit 2 lớp & sơn nước Dulux toàn bộ tường, trần căn hộ', trade: 'PAINT', unit: 'm2', quantity: 265, productivityPerManDay: 18.0, crewSize: 3 },
      { code: 'FLR-01', name: 'Lát sàn gỗ công nghiệp 12mm cho 2 phòng ngủ + đóng len chân tường', trade: 'FLOOR', unit: 'm2', quantity: 42, productivityPerManDay: 22.0, crewSize: 2 },
      { code: 'FUR-01', name: 'Lắp đặt tủ bếp trên + tủ bếp dưới MDF lõi xanh phủ Acrylic', trade: 'FURNITURE', unit: 'md', quantity: 9.5, productivityPerManDay: 1.6, crewSize: 2 },
      { code: 'FUR-02', name: 'Lắp đặt 2 tủ quần áo kịch trần, tủ giày & kệ trang trí', trade: 'FURNITURE', unit: 'm2', quantity: 26, productivityPerManDay: 3.5, crewSize: 3 },
      { code: 'FUR-03', name: 'Ốp vách gỗ + lam sóng trang trí phòng khách & vách đầu giường', trade: 'FURNITURE', unit: 'm2', quantity: 22, productivityPerManDay: 5.5, crewSize: 2 },
      { code: 'FUR-04', name: 'Lắp đặt cửa gỗ phòng ngủ & cửa WC Composite', trade: 'FURNITURE', unit: 'bộ', quantity: 4, productivityPerManDay: 2.2, crewSize: 2 },
      { code: 'FUR-06', name: 'Lắp đặt 2 giường ngủ, kệ tivi, bàn trang điểm, bàn ăn', trade: 'FURNITURE', unit: 'cái', quantity: 7, productivityPerManDay: 3.0, crewSize: 2 }
    ]
  },
  showroom120: {
    title: 'Cải Tạo & Fitout Showroom Thời Trang - 120m²',
    targetDays: 14,
    difficultyFactor: 1.0,
    items: [
      { code: 'DEMO-01', name: 'Tháo dỡ trần vách cũ & dọn mặt bằng', trade: 'DEMO', unit: 'm2', quantity: 90, productivityPerManDay: 25.0, crewSize: 3 },
      { code: 'GYP-02', name: 'Thi công vách thạch cao 2 mặt khu vực phòng thử đồ & kho', trade: 'GYPSUM', unit: 'm2', quantity: 85, productivityPerManDay: 9.0, crewSize: 3 },
      { code: 'GYP-04', name: 'Thi công trần thạch cao phẳng kết hợp rãnh đèn nam châm', trade: 'GYPSUM', unit: 'm2', quantity: 115, productivityPerManDay: 10.0, crewSize: 3 },
      { code: 'PNT-01', name: 'Bả matit & sơn nước hoàn thiện trần, vách thạch cao', trade: 'PAINT', unit: 'm2', quantity: 240, productivityPerManDay: 18.0, crewSize: 3 },
      { code: 'PNT-04', name: 'Thi công sơn hiệu ứng bê tông mảng tường điểm nhấn', trade: 'PAINT', unit: 'm2', quantity: 55, productivityPerManDay: 8.5, crewSize: 2 },
      { code: 'MEP-03', name: 'Lắp đặt hệ đèn rọi ray, đèn âm trần & LED hắt kệ trưng bày', trade: 'MEP', unit: 'bộ', quantity: 80, productivityPerManDay: 16.0, crewSize: 3 },
      { code: 'FLR-02', name: 'Lát sàn gỗ xương cá toàn bộ khu vực trưng bày', trade: 'FLOOR', unit: 'm2', quantity: 110, productivityPerManDay: 14.0, crewSize: 3 },
      { code: 'FUR-02', name: 'Lắp đặt hệ tủ kệ trưng bày âm tường, quầy thu ngân & bục đảo', trade: 'FURNITURE', unit: 'm2', quantity: 45, productivityPerManDay: 3.5, crewSize: 4 }
    ]
  },
  quickSample: {
    title: 'Ví dụ Nhập nhanh: 100m² Tường Thạch Cao + 200m² Sơn Nước + 60m² Ốp Lát',
    targetDays: 10,
    difficultyFactor: 1.0,
    items: [
      { code: 'GYP-02', name: 'Thi công vách tường thạch cao 2 mặt khung xương Vĩnh Tường', trade: 'GYPSUM', unit: 'm2', quantity: 100, productivityPerManDay: 9.0, crewSize: 3 },
      { code: 'PNT-01', name: 'Bả bột matit 2 lớp + xả nhám + sơn nước hoàn thiện (2 mặt vách)', trade: 'PAINT', unit: 'm2', quantity: 200, productivityPerManDay: 18.0, crewSize: 3 },
      { code: 'MAS-06', name: 'Thi công ốp lát gạch nền 600x600 hoàn thiện chà ron', trade: 'MASON', unit: 'm2', quantity: 60, productivityPerManDay: 7.5, crewSize: 2 },
      { code: 'MEP-01', name: 'Đi dây điện âm vách thạch cao & lắp đèn, công tắc ổ cắm', trade: 'MEP', unit: 'm2', quantity: 100, productivityPerManDay: 10.0, crewSize: 2 }
    ]
  }
};
