// Cơ sở dữ liệu Định mức Nhân công Thực tế Ngành Thi công Nội thất & Fitout Trong Tòa Nhà (Crystal Interior QS)
// Đơn vị năng suất: Khối lượng hoàn thành bởi 1 công (1 thợ làm việc 8h/ngày)

export const WEEKEND_TAGS = {
  HIGH_NOISE_WEEKEND: {
    id: 'HIGH_NOISE_WEEKEND',
    label: '🔴 Ưu tiên T7-CN (Ồn/Khoan đục)',
    shortLabel: '🔥 Làm T7-CN (Ồn)',
    bg: '#fef2f2',
    color: '#dc2626',
    border: '#fca5a5',
    reason: 'Gây tiếng ồn lớn/rung sàn (khoan bê tông, đục phá, cắt gạch đá). BQL tòa nhà thường cấm làm giờ hành chính T2-T6, bắt buộc tranh thủ dồn quân làm Thứ 7 & Chủ Nhật.'
  },
  LIFT_SMELL_WEEKEND: {
    id: 'LIFT_SMELL_WEEKEND',
    label: '🟠 Tranh thủ T7-CN (Thang hàng/Mùi)',
    shortLabel: '🛗 T7-CN (Vật tư/Mùi)',
    bg: '#fff7ed',
    color: '#ea580c',
    border: '#fdba74',
    reason: 'Cần đăng ký thang tải (Service Lift) vận chuyển vật tư cồng kềnh/xà bần hoặc có mùi keo/sơn/chống thấm cần bay mùi cuối tuần trước sáng Thứ 2.'
  },
  QUIET_WEEKDAY: {
    id: 'QUIET_WEEKDAY',
    label: '🟢 Làm T2-T6 (Êm/Lắp đặt trong nhà)',
    shortLabel: '✅ T2-T6 (Êm)',
    bg: '#f0fdf4',
    color: '#16a34a',
    border: '#86efac',
    reason: 'Thi công êm bên trong mặt bằng (bả bột, lăn sơn nước, kéo dây điện, lắp ráp tủ gỗ module sẵn, ghép sàn). Có thể làm xuyên suốt Thứ 2 – Thứ 6 không ảnh hưởng tòa nhà.'
  }
};

export const TRADES = {
  DEMO: {
    id: 'DEMO',
    name: 'Tổ Tháo dỡ & Vận chuyển Xà bần',
    shortName: 'Tháo dỡ / Phụ',
    icon: '🔨',
    color: '#dc2626',
    bgLight: '#fef2f2',
    phase: 1,
    startPct: 0.0,
    endPct: 0.20,
    defaultDailyWage: 480000,
    weekendBoost: true, // Rất cần tranh thủ T7-CN để đập phá & chuyển xà bần bằng thang hàng
    weekendStrategy: 'Bắt buộc tranh thủ tối đa Thứ 7 & Chủ Nhật để đập phá, khoan đục và dùng thang hàng chuyển xà bần ra khỏi tòa nhà.',
    roleDesc: 'Thợ tháo dỡ hiện trạng, đục gạch, vận chuyển xà bần qua thang tải & vệ sinh'
  },
  MASON: {
    id: 'MASON',
    name: 'Tổ Xây tô - Ốp lát - Chống thấm',
    shortName: 'Thợ Hồ / Ốp lát',
    icon: '🧱',
    color: '#ea580c',
    bgLight: '#fff7ed',
    phase: 2,
    startPct: 0.10,
    endPct: 0.55,
    defaultDailyWage: 620000,
    weekendBoost: true, // Cắt gạch đá, vận chuyển cát xi gạch bằng thang hàng vào T7-CN
    weekendStrategy: 'Tranh thủ T7-CN để vận chuyển cát, xi măng, gạch lên mặt bằng và cắt gạch/đá gây ồn; ngày thường T2-T6 tập trung xây trát, dán gạch, chà ron êm.',
    roleDesc: 'Thợ nề xây trát, cán nền, chống thấm WC, ốp lát gạch đá nội thất'
  },
  GYPSUM: {
    id: 'GYPSUM',
    name: 'Tổ Trần & Vách Thạch Cao',
    shortName: 'Thợ Thạch cao',
    icon: '🏗️',
    color: '#0284c7',
    bgLight: '#f0f9ff',
    phase: 2,
    startPct: 0.15,
    endPct: 0.55,
    defaultDailyWage: 600000,
    weekendBoost: true, // Khoan bê tông bắn ty trần & tắc kê khung xương rất ồn, cần tranh thủ T7-CN
    weekendStrategy: 'Ưu tiên khoan bê tông bắn ty treo trần & bắn tắc kê sàn/tường vào Thứ 7 - CN (vì khoan búa truyền âm toàn tòa nhà); ngày thường T2-T6 ghép khung xương và bắn tấm thạch cao.',
    roleDesc: 'Thợ bắn ty treo, dựng khung xương Vĩnh Tường, đóng trần chìm & vách thạch cao'
  },
  MEP: {
    id: 'MEP',
    name: 'Tổ Điện - Nước - Điều hòa (MEP)',
    shortName: 'Thợ Điện nước (MEP)',
    icon: '⚡',
    color: '#ca8a04',
    bgLight: '#fefce8',
    phase: 2,
    startPct: 0.10,
    endPct: 0.90,
    defaultDailyWage: 650000,
    weekendBoost: true, // Cắt rãnh tường, khoan rút lõi xuyên sàn/dầm & đấu nối tủ điện tổng cần làm T7-CN
    weekendStrategy: 'Tranh thủ T7-CN để cắt đục rãnh tường, khoan rút lõi ống đồng/ống nước và cúp điện đấu nối tủ tổng tòa nhà; ngày T2-T6 luồn dây, lắp đèn Downlight, LED, ổ cắm.',
    roleDesc: 'Thợ cắt rãnh âm, kéo dây nguồn/mạng, lắp đèn chiếu sáng, cấp thoát nước & ĐHKK'
  },
  PAINT: {
    id: 'PAINT',
    name: 'Tổ Sơn Nước & Bả Matit',
    shortName: 'Thợ Sơn bả',
    icon: '🎨',
    color: '#7c3aed',
    bgLight: '#f5f3ff',
    phase: 3,
    startPct: 0.45,
    endPct: 0.85,
    defaultDailyWage: 580000,
    weekendBoost: false, // Bả matit & lăn sơn nước êm, làm T2-T6 tốt; riêng sơn PU/hiệu ứng có mùi làm T7-CN
    weekendStrategy: 'Xử lý mối nối, bả matit và lăn sơn nước không mùi làm bình thường T2-T6; các hạng mục xả nhám bụi nhiều hoặc sơn dầu/PU/hiệu ứng có mùi nên làm chiều T7 & CN.',
    roleDesc: 'Thợ dán lưới mối nối, bả bột matit 2 lớp, xả nhám máy hút bụi, sơn lót & sơn phủ'
  },
  FLOOR: {
    id: 'FLOOR',
    name: 'Tổ Sàn Gỗ - Vinyl - Thảm',
    shortName: 'Thợ Sàn gỗ / Thảm',
    icon: '🪵',
    color: '#059669',
    bgLight: '#ecfdf5',
    phase: 4,
    startPct: 0.65,
    endPct: 0.90,
    defaultDailyWage: 600000,
    weekendBoost: false,
    weekendStrategy: 'Lát sàn gỗ hèm khóa & trải thảm văn phòng ít ồn, thi công T2-T6 bình thường; nếu dán keo sàn Vinyl diện rộng có mùi keo thì ưu tiên làm T7-CN.',
    roleDesc: 'Thợ lát sàn gỗ công nghiệp, xương cá, dán sàn nhựa SPC/Vinyl, trải thảm văn phòng'
  },
  FURNITURE: {
    id: 'FURNITURE',
    name: 'Tổ Mộc & Lắp Đặt Nội Thất Fitout',
    shortName: 'Thợ Nội thất / Mộc',
    icon: '🚪',
    color: '#2563eb',
    bgLight: '#eff6ff',
    phase: 4,
    startPct: 0.60,
    endPct: 1.00,
    defaultDailyWage: 680000,
    weekendBoost: true, // Cần tranh thủ T7-CN để chuyển ván gỗ, tủ lớn, kính cường lực qua thang hàng & khoan bắt vít tường
    weekendStrategy: 'Tranh thủ T7-CN đăng ký thang tải chuyển toàn bộ kiện gỗ nội thất, vách kính lớn lên mặt bằng và khoan bắt bát treo tủ âm tường; T2-T6 lắp ráp module tủ, gắn cánh, chỉnh bản lề êm.',
    roleDesc: 'Thợ lắp đặt tủ bếp, tủ áo, vách ốp gỗ, cửa, vách kính, bàn ghế & hoàn thiện bàn giao'
  }
};

// Danh mục Định mức Năng suất Chuẩn (productivityPerManDay = Khối lượng 1 thợ làm được trong 1 ngày 8h)
export const LABOR_NORMS = [
  // 1. THÁO DỠ & CHUẨN BỊ
  {
    code: 'DEMO-01',
    name: 'Tháo dỡ vách thạch cao, trần thạch cao cũ trong tòa nhà',
    trade: 'DEMO',
    unit: 'm2',
    productivityPerManDay: 25.0,
    defaultCrewSize: 2,
    weekendTag: 'HIGH_NOISE_WEEKEND',
    keywords: ['tháo dỡ thạch cao', 'dỡ vách thạch cao', 'dỡ trần', 'phá vách thạch cao'],
    note: 'Ồn & bụi khi hạ khung xương: Nên dồn quân làm Thứ 7 - CN'
  },
  {
    code: 'DEMO-02',
    name: 'Đập phá tường gạch cũ (dày 100-200mm)',
    trade: 'DEMO',
    unit: 'm2',
    productivityPerManDay: 7.5,
    defaultCrewSize: 2,
    weekendTag: 'HIGH_NOISE_WEEKEND',
    keywords: ['đập tường', 'phá tường gạch', 'tháo dỡ tường gạch', 'đập vách gạch'],
    note: 'Bắt buộc làm T7-CN trong tòa nhà văn phòng/chung cư vì tiếng đục rất lớn'
  },
  {
    code: 'DEMO-03',
    name: 'Đục bóc gạch nền, gạch ốp tường cũ bằng máy chuyên dụng',
    trade: 'DEMO',
    unit: 'm2',
    productivityPerManDay: 12.0,
    defaultCrewSize: 2,
    weekendTag: 'HIGH_NOISE_WEEKEND',
    keywords: ['đục gạch', 'bóc gạch nền', 'đục nền', 'bóc gạch tường', 'tháo sàn cũ'],
    note: 'Rung chấn sàn bê tông mạnh: Ưu tiên tuyệt đối làm vào Thứ 7 & Chủ Nhật'
  },
  {
    code: 'DEMO-04',
    name: 'Vận chuyển xà bần qua thang tải & vệ sinh mặt bằng thô',
    trade: 'DEMO',
    unit: 'm2',
    productivityPerManDay: 35.0,
    defaultCrewSize: 2,
    weekendTag: 'LIFT_SMELL_WEEKEND',
    keywords: ['xà bần', 'vận chuyển phế thải', 'dọn mặt bằng', 'trạc thải'],
    note: 'Đăng ký thang hàng (Service Lift) tòa nhà vào tối T7 hoặc Chủ Nhật'
  },

  // 2. XÂY TÔ - ỐP LÁT - CHỐNG THẤM
  {
    code: 'MAS-01',
    name: 'Xây tường gạch ống / gạch thẻ dày 100mm',
    trade: 'MASON',
    unit: 'm2',
    productivityPerManDay: 7.0,
    defaultCrewSize: 2,
    weekendTag: 'LIFT_SMELL_WEEKEND',
    keywords: ['xây tường 100', 'xây tường gạch', 'xây tường ngăn', 'xây gạch ống', 'xây tường'],
    note: 'Tập kết gạch/cát/xi bằng thang hàng T7-CN, xây tường làm T2-T6 bình thường'
  },
  {
    code: 'MAS-02',
    name: 'Xây tường gạch dày 200mm',
    trade: 'MASON',
    unit: 'm2',
    productivityPerManDay: 4.2,
    defaultCrewSize: 2,
    weekendTag: 'LIFT_SMELL_WEEKEND',
    keywords: ['xây tường 200', 'tường đôi', 'xây gạch 200'],
    note: 'Tập kết vật tư cuối tuần, xây trong tuần'
  },
  {
    code: 'MAS-03',
    name: 'Tô trát tường nội thất phẳng đẹp (dày 1.5cm)',
    trade: 'MASON',
    unit: 'm2',
    productivityPerManDay: 10.0,
    defaultCrewSize: 2,
    weekendTag: 'QUIET_WEEKDAY',
    keywords: ['tô tường', 'trát tường', 'tô trát', 'trát vữa'],
    note: 'Công việc êm, làm từ Thứ 2 - Thứ 6 bên trong tòa nhà'
  },
  {
    code: 'MAS-04',
    name: 'Cán nền vữa xi măng lấy cốt phẳng (dày 3-5cm)',
    trade: 'MASON',
    unit: 'm2',
    productivityPerManDay: 14.0,
    defaultCrewSize: 2,
    weekendTag: 'LIFT_SMELL_WEEKEND',
    keywords: ['cán nền', 'cán vữa', 'láng nền', 'cán sàn'],
    note: 'Nên cán nền vào T7 để Chủ Nhật khô vữa, đầu tuần T2 đi lại thi công tiếp được ngay'
  },
  {
    code: 'MAS-05',
    name: 'Thi công chống thấm sàn WC, khu Pantry/Bếp (2-3 lớp)',
    trade: 'MASON',
    unit: 'm2',
    productivityPerManDay: 16.0,
    defaultCrewSize: 2,
    weekendTag: 'LIFT_SMELL_WEEKEND',
    keywords: ['chống thấm', 'sika', 'korsil', 'chống thấm wc', 'chống thấm sàn'],
    note: 'Tranh thủ quét chống thấm & ngâm thử nước 24h qua ngày Chủ Nhật'
  },
  {
    code: 'MAS-06',
    name: 'Lát gạch nền (600x600, 800x800) hoàn thiện chà ron',
    trade: 'MASON',
    unit: 'm2',
    productivityPerManDay: 7.5,
    defaultCrewSize: 2,
    weekendTag: 'HIGH_NOISE_WEEKEND',
    keywords: ['lát gạch', 'lát nền', 'gạch nền', 'ốp lát nền', 'lát sàn gạch', 'ốp lát'],
    note: 'Khâu cắt gạch bằng máy cầm tay gây ồn (nên cắt tập trung T7-CN), trải keo dán gạch êm'
  },
  {
    code: 'MAS-07',
    name: 'Ốp gạch tường WC, bếp (300x600, 600x1200)',
    trade: 'MASON',
    unit: 'm2',
    productivityPerManDay: 5.5,
    defaultCrewSize: 2,
    weekendTag: 'HIGH_NOISE_WEEKEND',
    keywords: ['ốp gạch', 'ốp tường', 'gạch ốp tường', 'ốp wc', 'ốp nhà vệ sinh'],
    note: 'Khoét lỗ gạch bằng máy mài ồn: Ưu tiên cắt khoét vào T7-CN'
  },
  {
    code: 'MAS-08',
    name: 'Ốp len chân tường gạch',
    trade: 'MASON',
    unit: 'md',
    productivityPerManDay: 22.0,
    defaultCrewSize: 1,
    weekendTag: 'QUIET_WEEKDAY',
    keywords: ['len gạch', 'len chân tường gạch'],
    note: 'Dán len gạch đã cắt sẵn êm, làm trong tuần T2-T6'
  },
  {
    code: 'MAS-09',
    name: 'Ốp lát đá Granite / Marble mặt bếp, lavabo, quầy lễ tân',
    trade: 'MASON',
    unit: 'm2',
    productivityPerManDay: 3.5,
    defaultCrewSize: 2,
    weekendTag: 'HIGH_NOISE_WEEKEND',
    keywords: ['đá bếp', 'đá hoa cương', 'đá granite', 'đá marble', 'mặt đá', 'đá nung kết'],
    note: 'Cắt mài đá bụi & cực ồn: Bắt buộc gia công tại xưởng hoặc cắt khoét tại chỗ vào T7-CN'
  },

  // 3. TRẦN & VÁCH THẠCH CAO
  {
    code: 'GYP-01',
    name: 'Thi công vách thạch cao 1 mặt khung xương Vĩnh Tường',
    trade: 'GYPSUM',
    unit: 'm2',
    productivityPerManDay: 12.0,
    defaultCrewSize: 2,
    weekendTag: 'HIGH_NOISE_WEEKEND',
    keywords: ['vách thạch cao 1 mặt', 'vách 1 mặt', 'thạch cao 1 mặt'],
    note: 'Tranh thủ T7-CN khoan bê tông bắn tắc kê U sàn/trần; ngày thường T2-T6 dựng xương & bắn tấm'
  },
  {
    code: 'GYP-02',
    name: 'Thi công vách thạch cao 2 mặt khung xương Vĩnh Tường',
    trade: 'GYPSUM',
    unit: 'm2',
    productivityPerManDay: 9.0,
    defaultCrewSize: 2,
    weekendTag: 'HIGH_NOISE_WEEKEND',
    keywords: ['vách thạch cao', 'tường thạch cao', 'vách thạch cao 2 mặt', 'ngăn vách thạch cao'],
    note: 'Khâu khoan sàn/trần lấy dấu ồn làm T7-CN; khâu bắn vít tấm thạch cao êm làm T2-T6'
  },
  {
    code: 'GYP-03',
    name: 'Thi công vách thạch cao 2 mặt có bông cách âm phòng họp/phòng ngủ',
    trade: 'GYPSUM',
    unit: 'm2',
    productivityPerManDay: 7.5,
    defaultCrewSize: 2,
    weekendTag: 'HIGH_NOISE_WEEKEND',
    keywords: ['vách thạch cao cách âm', 'vách cách âm', 'bông khoáng', 'bông thủy tinh'],
    note: 'Khoan định vị thanh U vào T7-CN; nhét bông tiêu âm & bắn tấm làm T2-T6'
  },
  {
    code: 'GYP-04',
    name: 'Thi công trần thạch cao khung chìm phẳng',
    trade: 'GYPSUM',
    unit: 'm2',
    productivityPerManDay: 11.0,
    defaultCrewSize: 2,
    weekendTag: 'HIGH_NOISE_WEEKEND',
    keywords: ['trần thạch cao phẳng', 'trần thạch cao chìm', 'trần thạch cao', 'đóng trần thạch cao'],
    note: 'QUAN TRỌNG: Khoan bê tông bắn nở đạn ty treo trần cực ồn -> Phải tranh thủ làm hết vào T7-CN!'
  },
  {
    code: 'GYP-05',
    name: 'Thi công trần thạch cao giật cấp / khe đèn LED hắt sáng',
    trade: 'GYPSUM',
    unit: 'm2',
    productivityPerManDay: 7.5,
    defaultCrewSize: 2,
    weekendTag: 'HIGH_NOISE_WEEKEND',
    keywords: ['trần giật cấp', 'trần thạch cao giật cấp', 'khe hắt sáng', 'trần trang trí'],
    note: 'Bắn ty treo lên sàn bê tông vào T7-CN; ghép khung & tấm giật cấp làm T2-T6'
  },
  {
    code: 'GYP-06',
    name: 'Thi công trần thạch cao thả (khung nổi 600x600 văn phòng)',
    trade: 'GYPSUM',
    unit: 'm2',
    productivityPerManDay: 18.0,
    defaultCrewSize: 2,
    weekendTag: 'HIGH_NOISE_WEEKEND',
    keywords: ['trần thả', 'trần nổi', 'trần 600x600', 'trần tấm thả'],
    note: 'Bắn ty treo vào T7-CN, thả tấm 600x600 làm T2-T6 rất êm và nhanh'
  },
  {
    code: 'GYP-07',
    name: 'Đóng hộp kỹ thuật thạch cao che ống MEP / làm hộc rèm',
    trade: 'GYPSUM',
    unit: 'md',
    productivityPerManDay: 10.0,
    defaultCrewSize: 2,
    weekendTag: 'QUIET_WEEKDAY',
    keywords: ['hộp kỹ thuật', 'hộp thạch cao', 'hộc rèm', 'khe rèm'],
    note: 'Bắn vít vào khung trần có sẵn êm, làm trong tuần T2-T6'
  },

  // 4. SƠN NƯỚC & BẢ MATIT
  {
    code: 'PNT-01',
    name: 'Bả bột matit 2 lớp + xả nhám máy hút bụi + 1 sơn lót + 2 sơn phủ',
    trade: 'PAINT',
    unit: 'm2',
    productivityPerManDay: 18.0,
    defaultCrewSize: 2,
    weekendTag: 'QUIET_WEEKDAY',
    keywords: ['sơn nước', 'sơn bả', 'bả matit', 'sơn tường', 'sơn vách', 'thi công sơn nước'],
    note: 'Công việc êm trong nhà: Làm xuyên suốt T2-T6 (nếu xả nhám bụi nhiều có thể dồn vào T7)'
  },
  {
    code: 'PNT-02',
    name: 'Bả bột matit + sơn nước hoàn thiện trần thạch cao',
    trade: 'PAINT',
    unit: 'm2',
    productivityPerManDay: 15.0,
    defaultCrewSize: 2,
    weekendTag: 'QUIET_WEEKDAY',
    keywords: ['sơn trần', 'sơn bả trần', 'bả trần thạch cao'],
    note: 'Hoàn toàn không gây tiếng ồn: Thi công T2-T6 thoải mái trong tòa nhà'
  },
  {
    code: 'PNT-03',
    name: 'Sơn dặm vá & lăn sơn mới tường cũ (1 lót + 2 phủ, không bả)',
    trade: 'PAINT',
    unit: 'm2',
    productivityPerManDay: 32.0,
    defaultCrewSize: 2,
    weekendTag: 'QUIET_WEEKDAY',
    keywords: ['sơn lại', 'sơn dặm', 'lăn sơn không bả', 'sơn phủ'],
    note: 'Thi công cực êm, có thể làm T2-T6 hoặc làm cuốn chiếu cuối tuần'
  },
  {
    code: 'PNT-04',
    name: 'Sơn hiệu ứng bê tông / Sơn trang trí / Sơn dặm PU có mùi',
    trade: 'PAINT',
    unit: 'm2',
    productivityPerManDay: 8.5,
    defaultCrewSize: 2,
    weekendTag: 'LIFT_SMELL_WEEKEND',
    keywords: ['sơn hiệu ứng', 'sơn giả bê tông', 'sơn pukaco', 'sơn nghệ thuật', 'sơn giả đá', 'sơn pu'],
    note: 'Lớp phủ bóng/sơn PU có mùi dung môi: Nên làm T7-CN để bay hết mùi trước sáng Thứ 2'
  },

  // 5. ĐIỆN - NƯỚC - ĐIỀU HÒA (MEP)
  {
    code: 'MEP-01',
    name: 'Thi công hệ thống Điện & Chiếu sáng trọn gói (theo m2 sàn Fitout)',
    trade: 'MEP',
    unit: 'm2',
    productivityPerManDay: 8.0,
    defaultCrewSize: 2,
    weekendTag: 'HIGH_NOISE_WEEKEND',
    keywords: ['điện trọn gói', 'hệ thống điện', 'thi công điện', 'mep sàn', 'nhân công điện'],
    note: 'Cắt đục tường/khoan bắn kẹp ống vào T7-CN; luồn dây cáp và đấu thiết bị làm T2-T6'
  },
  {
    code: 'MEP-02',
    name: 'Đặt ống luồn dây & kéo dây điện nguồn / mạng LAN âm vách-trần',
    trade: 'MEP',
    unit: 'md',
    productivityPerManDay: 35.0,
    defaultCrewSize: 2,
    weekendTag: 'QUIET_WEEKDAY',
    keywords: ['ống luồn dây', 'kéo dây điện', 'dây cáp', 'dây mạng', 'ống ruột gà', 'ống pvc điện'],
    note: 'Luồn ống ruột gà & kéo dây trong vách thạch cao rất êm, làm T2-T6'
  },
  {
    code: 'MEP-03',
    name: 'Khoét lỗ thạch cao & lắp đặt đèn Downlight, Spotlight, đèn Panel',
    trade: 'MEP',
    unit: 'bộ',
    productivityPerManDay: 20.0,
    defaultCrewSize: 2,
    weekendTag: 'QUIET_WEEKDAY',
    keywords: ['đèn downlight', 'đèn âm trần', 'lắp đèn', 'đèn spotlight', 'đèn rọi', 'đèn panel'],
    note: 'Khoét thạch cao bằng mũi khoét tròn & đấu đèn êm, làm T2-T6 bình thường'
  },
  {
    code: 'MEP-04',
    name: 'Dán & đấu nối đèn LED dây / thanh nhôm định hình (hắt trần, tủ)',
    trade: 'MEP',
    unit: 'md',
    productivityPerManDay: 18.0,
    defaultCrewSize: 2,
    weekendTag: 'QUIET_WEEKDAY',
    keywords: ['led dây', 'đèn led thanh', 'nhôm định hình', 'đèn hắt', 'led tủ'],
    note: 'Hàn dây LED và dán thanh nhôm vào tủ nội thất êm, làm T2-T6'
  },
  {
    code: 'MEP-05',
    name: 'Lắp đặt ổ cắm, công tắc, mặt hạt mạng, ổ cắm âm bàn họp',
    trade: 'MEP',
    unit: 'bộ',
    productivityPerManDay: 18.0,
    defaultCrewSize: 2,
    weekendTag: 'QUIET_WEEKDAY',
    keywords: ['ổ cắm', 'công tắc', 'đế âm', 'aptomat', 'thiết bị điện'],
    note: 'Đấu nối thiết bị hoàn thiện êm, làm T2-T6'
  },
  {
    code: 'MEP-06',
    name: 'Đấu nối tủ điện tổng & đóng cắt nguồn trục chính tòa nhà',
    trade: 'MEP',
    unit: 'tủ',
    productivityPerManDay: 1.0,
    defaultCrewSize: 2,
    weekendTag: 'HIGH_NOISE_WEEKEND',
    keywords: ['tủ điện', 'lắp tủ điện', 'đấu tủ điện'],
    note: 'Đấu cáp nguồn tổng thường phải xin BQL tòa nhà cúp điện trục nhánh vào chiều T7 hoặc CN'
  },
  {
    code: 'MEP-07',
    name: 'Thi công đường ống cấp thoát nước phòng WC / khu Pantry',
    trade: 'MEP',
    unit: 'phòng',
    productivityPerManDay: 0.4,
    defaultCrewSize: 2,
    weekendTag: 'HIGH_NOISE_WEEKEND',
    keywords: ['cấp thoát nước', 'ống nước', 'điện nước wc', 'ống ppr', 'ống pvc thoát'],
    note: 'Khoan rút lõi bê tông/đục sàn đi ống nước ồn: Nên đăng ký BQL làm vào T7-CN'
  },
  {
    code: 'MEP-08',
    name: 'Lắp đặt thiết bị vệ sinh (bồn cầu, lavabo, sen tắm, chậu rửa Pantry)',
    trade: 'MEP',
    unit: 'bộ',
    productivityPerManDay: 3.5,
    defaultCrewSize: 2,
    weekendTag: 'QUIET_WEEKDAY',
    keywords: ['thiết bị vệ sinh', 'bồn cầu', 'lavabo', 'sen tắm', 'chậu rửa', 'vòi bếp'],
    note: 'Lắp đặt thiết bị & đi silicon hoàn thiện trong tuần T2-T6'
  },
  {
    code: 'MEP-09',
    name: 'Đi ống đồng âm & treo lắp dàn lạnh điều hòa âm trần / treo tường',
    trade: 'MEP',
    unit: 'bộ',
    productivityPerManDay: 1.5,
    defaultCrewSize: 2,
    weekendTag: 'HIGH_NOISE_WEEKEND',
    keywords: ['điều hòa', 'máy lạnh', 'ống đồng', 'dàn lạnh', 'dàn nóng'],
    note: 'Khoan ty treo dàn lạnh FCU/VRV và khoan xuyên tường đi ống đồng nên tranh thủ T7-CN'
  },

  // 6. SÀN GỖ - VINYL - THẢM
  {
    code: 'FLR-01',
    name: 'Lắp đặt sàn gỗ công nghiệp lát thẳng (kèm trải xốp lót)',
    trade: 'FLOOR',
    unit: 'm2',
    productivityPerManDay: 25.0,
    defaultCrewSize: 2,
    weekendTag: 'QUIET_WEEKDAY',
    keywords: ['sàn gỗ', 'sàn gỗ công nghiệp', 'lát sàn gỗ', 'sàn spc'],
    note: 'Ghép hèm khóa êm, dùng máy cắt bàn có túi hút bụi thi công T2-T6'
  },
  {
    code: 'FLR-02',
    name: 'Lắp đặt sàn gỗ công nghiệp / tự nhiên lát xương cá',
    trade: 'FLOOR',
    unit: 'm2',
    productivityPerManDay: 14.0,
    defaultCrewSize: 2,
    weekendTag: 'QUIET_WEEKDAY',
    keywords: ['sàn xương cá', 'sàn gỗ xương cá', 'lát xương cá'],
    note: 'Thi công trong mặt bằng kín, làm T2-T6 kết hợp cắt ván gọn'
  },
  {
    code: 'FLR-03',
    name: 'Dán sàn nhựa giả gỗ Vinyl / Trải thảm tấm văn phòng 500x500',
    trade: 'FLOOR',
    unit: 'm2',
    productivityPerManDay: 32.0,
    defaultCrewSize: 2,
    weekendTag: 'LIFT_SMELL_WEEKEND',
    keywords: ['sàn nhựa', 'sàn vinyl', 'thảm văn phòng', 'trải thảm', 'thảm tấm'],
    note: 'Quét keo sữa/keo dán thảm diện rộng có mùi nhẹ: Tranh thủ làm T6-T7-CN rất hiệu quả'
  },
  {
    code: 'FLR-04',
    name: 'Đóng phào / len chân tường gỗ, nhựa & nẹp kết thúc sàn',
    trade: 'FLOOR',
    unit: 'md',
    productivityPerManDay: 35.0,
    defaultCrewSize: 1,
    weekendTag: 'QUIET_WEEKDAY',
    keywords: ['len chân tường', 'phào chân tường', 'nẹp sàn', 'len nhựa', 'len gỗ'],
    note: 'Dán keo kết hợp súng đinh hơi êm, làm T2-T6'
  },

  // 7. MỘC & LẮP ĐẶT NỘI THẤT GỖ (FITOUT CARPENTRY)
  {
    code: 'FUR-01',
    name: 'Lắp đặt tủ bếp dưới & tủ bếp trên hoàn chỉnh (module sản xuất tại xưởng)',
    trade: 'FURNITURE',
    unit: 'md',
    productivityPerManDay: 1.6,
    defaultCrewSize: 2,
    weekendTag: 'LIFT_SMELL_WEEKEND',
    keywords: ['tủ bếp', 'tủ bếp trên', 'tủ bếp dưới', 'bếp gỗ', 'lắp tủ bếp'],
    note: 'Chuyển thùng tủ lên bằng thang tải & khoan treo tủ bếp trên vào T7-CN; lắp cánh & phụ kiện T2-T6'
  },
  {
    code: 'FUR-02',
    name: 'Lắp đặt tủ quần áo / tủ trang trí / tủ hồ sơ cao kịch trần',
    trade: 'FURNITURE',
    unit: 'm2',
    productivityPerManDay: 3.5,
    defaultCrewSize: 2,
    weekendTag: 'LIFT_SMELL_WEEKEND',
    keywords: ['tủ quần áo', 'tủ áo', 'tủ trang trí', 'tủ hồ sơ', 'tủ âm tường', 'tủ giày'],
    note: 'Ván dài 2.4m-2.7m cần đăng ký thang hàng T7-CN để vận chuyển; lắp dựng module làm T2-T6'
  },
  {
    code: 'FUR-03',
    name: 'Thi công vách ốp gỗ trang trí, lam sóng, Backdrop lễ tân',
    trade: 'FURNITURE',
    unit: 'm2',
    productivityPerManDay: 5.5,
    defaultCrewSize: 2,
    weekendTag: 'HIGH_NOISE_WEEKEND',
    keywords: ['vách ốp gỗ', 'lam gỗ', 'vách trang trí', 'ốp vách', 'lam sóng', 'vách đầu giường', 'nội thất'],
    note: 'Khoan tường bắt khung xương gỗ và bắn súng đinh hơi nên ưu tiên T7-CN; dán tấm Laminate làm T2-T6'
  },
  {
    code: 'FUR-04',
    name: 'Lắp đặt cửa gỗ công nghiệp / cửa nhựa Composite (khung + cánh + khóa)',
    trade: 'FURNITURE',
    unit: 'bộ',
    productivityPerManDay: 2.2,
    defaultCrewSize: 2,
    weekendTag: 'QUIET_WEEKDAY',
    keywords: ['cửa gỗ', 'cửa phòng', 'cửa composite', 'cửa nhựa', 'lắp cửa'],
    note: 'Bơm foam khung bao, đóng nẹp chỉ và lắp khóa tay gạt êm, làm T2-T6'
  },
  {
    code: 'FUR-05',
    name: 'Lắp đặt vách kính cường lực văn phòng / cabin tắm kính',
    trade: 'FURNITURE',
    unit: 'm2',
    productivityPerManDay: 7.0,
    defaultCrewSize: 3,
    weekendTag: 'LIFT_SMELL_WEEKEND',
    keywords: ['vách kính', 'kính cường lực', 'cabin tắm', 'cửa kính'],
    note: 'Khổ kính cường lực lớn bắt buộc đăng ký thang hàng/vận thăng vào T7-CN & cắt sàn chôn bản lề sàn'
  },
  {
    code: 'FUR-06',
    name: 'Lắp đặt nội thất rời (giường ngủ, bàn làm việc, kệ tivi, bàn họp, ghế)',
    trade: 'FURNITURE',
    unit: 'cái',
    productivityPerManDay: 3.0,
    defaultCrewSize: 2,
    weekendTag: 'QUIET_WEEKDAY',
    keywords: ['giường ngủ', 'giường', 'bàn làm việc', 'kệ tivi', 'bàn họp', 'bàn ăn', 'quầy lễ tân', 'đồ rời'],
    note: 'Bắt vít cam liên kết hoàn toàn êm ái: Lắp đặt T2-T6 bình thường'
  },
  {
    code: 'FUR-07',
    name: 'Vệ sinh công nghiệp chuyên sâu toàn bộ công trình trước bàn giao',
    trade: 'DEMO',
    unit: 'm2',
    productivityPerManDay: 35.0,
    defaultCrewSize: 3,
    weekendTag: 'QUIET_WEEKDAY',
    keywords: ['vệ sinh công nghiệp', 'vệ sinh bàn giao', 'dọn vệ sinh hoàn thiện'],
    note: 'Làm ngày cuối cùng (thường chốt vào Chủ Nhật để sáng Thứ 2 bàn giao Sếp/Chủ đầu tư khai trương)'
  }
];

export const PROJECT_TEMPLATES = {
  office250: {
    title: 'Fitout Văn Phòng Hạng A Trong Tòa Nhà - 250m²',
    targetDays: 20,
    difficultyFactor: 1.1,
    weekendMode: 'FULL_WITH_WEEKEND_BOOST',
    items: [
      { code: 'DEMO-01', name: 'Tháo dỡ vách thạch cao & trần cũ mặt bằng thuê', trade: 'DEMO', unit: 'm2', quantity: 140, productivityPerManDay: 25.0, crewSize: 3, weekendTag: 'HIGH_NOISE_WEEKEND' },
      { code: 'GYP-03', name: 'Thi công vách thạch cao 2 mặt có bông cách âm phòng họp & GĐ', trade: 'GYPSUM', unit: 'm2', quantity: 165, productivityPerManDay: 7.5, crewSize: 4, weekendTag: 'HIGH_NOISE_WEEKEND' },
      { code: 'GYP-04', name: 'Thi công trần thạch cao khung chìm + bắn ty treo sàn bê tông', trade: 'GYPSUM', unit: 'm2', quantity: 230, productivityPerManDay: 11.0, crewSize: 4, weekendTag: 'HIGH_NOISE_WEEKEND' },
      { code: 'MEP-01', name: 'Thi công hệ thống Điện nguồn, Mạng LAN & Chiếu sáng văn phòng', trade: 'MEP', unit: 'm2', quantity: 250, productivityPerManDay: 8.0, crewSize: 4, weekendTag: 'HIGH_NOISE_WEEKEND' },
      { code: 'PNT-01', name: 'Bả bột matit 2 lớp & sơn nước không mùi hoàn thiện vách, trần', trade: 'PAINT', unit: 'm2', quantity: 520, productivityPerManDay: 18.0, crewSize: 4, weekendTag: 'QUIET_WEEKDAY' },
      { code: 'FLR-03', name: 'Trải thảm tấm văn phòng 500x500 & dán sàn nhựa khu Pantry', trade: 'FLOOR', unit: 'm2', quantity: 245, productivityPerManDay: 32.0, crewSize: 3, weekendTag: 'LIFT_SMELL_WEEKEND' },
      { code: 'FUR-05', name: 'Vận chuyển thang hàng & lắp vách kính cường lực 10mm phòng họp', trade: 'FURNITURE', unit: 'm2', quantity: 68, productivityPerManDay: 7.0, crewSize: 3, weekendTag: 'LIFT_SMELL_WEEKEND' },
      { code: 'FUR-03', name: 'Ốp vách gỗ Laminate khu vực Backdrop Lễ tân & phòng họp', trade: 'FURNITURE', unit: 'm2', quantity: 42, productivityPerManDay: 5.5, crewSize: 3, weekendTag: 'HIGH_NOISE_WEEKEND' },
      { code: 'FUR-02', name: 'Lắp đặt hệ tủ Pantry, tủ hồ sơ âm tường & quầy Reception', trade: 'FURNITURE', unit: 'm2', quantity: 38, productivityPerManDay: 3.5, crewSize: 4, weekendTag: 'LIFT_SMELL_WEEKEND' },
      { code: 'FUR-06', name: 'Lắp đặt cụm bàn làm việc nhân viên, bàn họp lớn, bàn GĐ', trade: 'FURNITURE', unit: 'cái', quantity: 28, productivityPerManDay: 3.0, crewSize: 3, weekendTag: 'QUIET_WEEKDAY' },
      { code: 'FUR-07', name: 'Vệ sinh công nghiệp bàn giao văn phòng', trade: 'DEMO', unit: 'm2', quantity: 250, productivityPerManDay: 35.0, crewSize: 4, weekendTag: 'QUIET_WEEKDAY' }
    ]
  },
  apartment85: {
    title: 'Hoàn Thiện & Nội Thất Căn Hộ Chung Cư 2PN - 85m²',
    targetDays: 18,
    difficultyFactor: 1.05,
    weekendMode: 'SAT_WORK_SUN_OFF',
    items: [
      { code: 'MAS-05', name: 'Chống thấm 2 phòng WC & ban công', trade: 'MASON', unit: 'm2', quantity: 24, productivityPerManDay: 16.0, crewSize: 2, weekendTag: 'LIFT_SMELL_WEEKEND' },
      { code: 'MAS-06', name: 'Lát gạch nền phòng khách, bếp, WC & ốp tường 2 WC', trade: 'MASON', unit: 'm2', quantity: 78, productivityPerManDay: 6.5, crewSize: 3, weekendTag: 'HIGH_NOISE_WEEKEND' },
      { code: 'GYP-02', name: 'Đóng vách thạch cao 2 mặt cải tạo phòng ngủ', trade: 'GYPSUM', unit: 'm2', quantity: 32, productivityPerManDay: 9.0, crewSize: 2, weekendTag: 'HIGH_NOISE_WEEKEND' },
      { code: 'GYP-05', name: 'Thi công trần thạch cao giật cấp + khe đèn LED + hộc rèm', trade: 'GYPSUM', unit: 'm2', quantity: 82, productivityPerManDay: 7.5, crewSize: 3, weekendTag: 'HIGH_NOISE_WEEKEND' },
      { code: 'MEP-03', name: 'Đi dây điện bổ sung, lắp đèn Downlight, LED dây & công tắc ổ cắm', trade: 'MEP', unit: 'bộ', quantity: 65, productivityPerManDay: 12.0, crewSize: 2, weekendTag: 'QUIET_WEEKDAY' },
      { code: 'PNT-01', name: 'Bả matit 2 lớp & sơn nước Dulux toàn bộ tường, trần căn hộ', trade: 'PAINT', unit: 'm2', quantity: 265, productivityPerManDay: 18.0, crewSize: 3, weekendTag: 'QUIET_WEEKDAY' },
      { code: 'FLR-01', name: 'Lát sàn gỗ công nghiệp 12mm cho 2 phòng ngủ + đóng len chân tường', trade: 'FLOOR', unit: 'm2', quantity: 42, productivityPerManDay: 22.0, crewSize: 2, weekendTag: 'QUIET_WEEKDAY' },
      { code: 'FUR-01', name: 'Lắp đặt tủ bếp trên + tủ bếp dưới MDF lõi xanh phủ Acrylic', trade: 'FURNITURE', unit: 'md', quantity: 9.5, productivityPerManDay: 1.6, crewSize: 2, weekendTag: 'LIFT_SMELL_WEEKEND' },
      { code: 'FUR-02', name: 'Lắp đặt 2 tủ quần áo kịch trần, tủ giày & kệ trang trí', trade: 'FURNITURE', unit: 'm2', quantity: 26, productivityPerManDay: 3.5, crewSize: 3, weekendTag: 'LIFT_SMELL_WEEKEND' },
      { code: 'FUR-03', name: 'Ốp vách gỗ + lam sóng trang trí phòng khách & vách đầu giường', trade: 'FURNITURE', unit: 'm2', quantity: 22, productivityPerManDay: 5.5, crewSize: 2, weekendTag: 'HIGH_NOISE_WEEKEND' },
      { code: 'FUR-04', name: 'Lắp đặt cửa gỗ phòng ngủ & cửa WC Composite', trade: 'FURNITURE', unit: 'bộ', quantity: 4, productivityPerManDay: 2.2, crewSize: 2, weekendTag: 'QUIET_WEEKDAY' },
      { code: 'FUR-06', name: 'Lắp đặt 2 giường ngủ, kệ tivi, bàn trang điểm, bàn ăn', trade: 'FURNITURE', unit: 'cái', quantity: 7, productivityPerManDay: 3.0, crewSize: 2, weekendTag: 'QUIET_WEEKDAY' }
    ]
  },
  showroom120: {
    title: 'Cải Tạo & Fitout Showroom TTTM - 120m²',
    targetDays: 14,
    difficultyFactor: 1.1,
    weekendMode: 'FULL_WITH_WEEKEND_BOOST',
    items: [
      { code: 'DEMO-01', name: 'Tháo dỡ trần vách cũ & dọn mặt bằng qua thang tải', trade: 'DEMO', unit: 'm2', quantity: 90, productivityPerManDay: 25.0, crewSize: 3, weekendTag: 'HIGH_NOISE_WEEKEND' },
      { code: 'GYP-02', name: 'Thi công vách thạch cao 2 mặt khu vực phòng thử đồ & kho', trade: 'GYPSUM', unit: 'm2', quantity: 85, productivityPerManDay: 9.0, crewSize: 3, weekendTag: 'HIGH_NOISE_WEEKEND' },
      { code: 'GYP-04', name: 'Thi công trần thạch cao phẳng kết hợp rãnh đèn nam châm', trade: 'GYPSUM', unit: 'm2', quantity: 115, productivityPerManDay: 10.0, crewSize: 3, weekendTag: 'HIGH_NOISE_WEEKEND' },
      { code: 'PNT-01', name: 'Bả matit & sơn nước hoàn thiện trần, vách thạch cao', trade: 'PAINT', unit: 'm2', quantity: 240, productivityPerManDay: 18.0, crewSize: 3, weekendTag: 'QUIET_WEEKDAY' },
      { code: 'PNT-04', name: 'Thi công sơn hiệu ứng bê tông mảng tường điểm nhấn', trade: 'PAINT', unit: 'm2', quantity: 55, productivityPerManDay: 8.5, crewSize: 2, weekendTag: 'LIFT_SMELL_WEEKEND' },
      { code: 'MEP-03', name: 'Lắp đặt hệ đèn rọi ray, đèn âm trần & LED hắt kệ trưng bày', trade: 'MEP', unit: 'bộ', quantity: 80, productivityPerManDay: 16.0, crewSize: 3, weekendTag: 'QUIET_WEEKDAY' },
      { code: 'FLR-02', name: 'Lát sàn gỗ xương cá toàn bộ khu vực trưng bày', trade: 'FLOOR', unit: 'm2', quantity: 110, productivityPerManDay: 14.0, crewSize: 3, weekendTag: 'QUIET_WEEKDAY' },
      { code: 'FUR-02', name: 'Lắp đặt hệ tủ kệ trưng bày âm tường, quầy thu ngân & bục đảo', trade: 'FURNITURE', unit: 'm2', quantity: 45, productivityPerManDay: 3.5, crewSize: 4, weekendTag: 'LIFT_SMELL_WEEKEND' }
    ]
  },
  quickSample: {
    title: 'Ví dụ Nhập nhanh: 100m² Tường Thạch Cao + 200m² Sơn Nước + 60m² Ốp Lát',
    targetDays: 10,
    difficultyFactor: 1.0,
    weekendMode: 'FULL_WITH_WEEKEND_BOOST',
    items: [
      { code: 'GYP-02', name: 'Thi công vách tường thạch cao 2 mặt khung xương Vĩnh Tường', trade: 'GYPSUM', unit: 'm2', quantity: 100, productivityPerManDay: 9.0, crewSize: 3, weekendTag: 'HIGH_NOISE_WEEKEND' },
      { code: 'PNT-01', name: 'Bả bột matit 2 lớp + xả nhám + sơn nước hoàn thiện (2 mặt vách)', trade: 'PAINT', unit: 'm2', quantity: 200, productivityPerManDay: 18.0, crewSize: 3, weekendTag: 'QUIET_WEEKDAY' },
      { code: 'MAS-06', name: 'Thi công ốp lát gạch nền 600x600 hoàn thiện chà ron', trade: 'MASON', unit: 'm2', quantity: 60, productivityPerManDay: 7.5, crewSize: 2, weekendTag: 'HIGH_NOISE_WEEKEND' },
      { code: 'MEP-01', name: 'Đi dây điện âm vách thạch cao & lắp đèn, công tắc ổ cắm', trade: 'MEP', unit: 'm2', quantity: 100, productivityPerManDay: 10.0, crewSize: 2, weekendTag: 'QUIET_WEEKDAY' }
    ]
  }
};
