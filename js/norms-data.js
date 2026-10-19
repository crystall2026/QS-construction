// Cơ sở dữ liệu Định mức Nhân công Thực tế Ngành Thi công Nội thất & Fitout (Crystal Interior QS)
// Đơn vị năng suất: Khối lượng hoàn thành bởi 1 công (1 thợ làm việc 8h/ngày)

export const PROJECT_TYPES = {
  OFFICE_BUILDING: {
    id: 'OFFICE_BUILDING',
    name: 'Tòa Nhà Văn Phòng',
    shortName: 'Tòa nhà văn phòng',
    defaultDifficulty: 1.10,
    defaultWeekendMode: 'WEEKEND_NOISY_FOCUS',
    defaultShift: 8,
    description: 'Quy định gắt gao về tiếng ồn giờ hành chính. Bắt buộc dồn các việc khoan bê tông, đập phá, cắt gạch đá và dùng thang hàng vào Thứ 7 & Chủ Nhật.'
  },
  APARTMENT: {
    id: 'APARTMENT',
    name: 'Khu Căn Hộ Chung Cư',
    shortName: 'Căn hộ chung cư',
    defaultDifficulty: 1.05,
    defaultWeekendMode: 'SAT_WORK_SUN_OFF',
    defaultShift: 8,
    description: 'BQL chung cư thường cấm thi công gây ồn vào Chủ Nhật và giờ nghỉ trưa (11h30 - 13h30). Tranh thủ làm việc ồn vào Thứ 7.'
  },
  TOWNHOUSE: {
    id: 'TOWNHOUSE',
    name: 'Nhà Phố / Biệt Thự',
    shortName: 'Nhà phố / Biệt thự',
    defaultDifficulty: 1.00,
    defaultWeekendMode: 'FULL_WITH_WEEKEND_BOOST',
    defaultShift: 8,
    description: 'Mặt bằng độc lập, thuận tiện tập kết vật tư và vận chuyển. Có thể thi công xuyên suốt cả Thứ 7 và Chủ Nhật.'
  },
  SHOPHOUSE_MALL: {
    id: 'SHOPHOUSE_MALL',
    name: 'Shophouse / TTTM',
    shortName: 'Shophouse / TTTM',
    defaultDifficulty: 1.20,
    defaultWeekendMode: 'FULL_WITH_WEEKEND_BOOST',
    defaultShift: 8,
    description: 'Nhiều TTTM chỉ cho phép thi công sau 22h đêm và kiểm tra PCCC cực kỳ nghiêm ngặt. Hệ số hao phí nhân công cao hơn.'
  }
};

export const WEEKEND_TAGS = {
  HIGH_NOISE_WEEKEND: {
    id: 'HIGH_NOISE_WEEKEND',
    label: 'Ưu tiên T7-CN (Ồn/Khoan đục)',
    shortLabel: 'T7-CN (Ồn)',
    bg: '#f8fafc',
    color: '#b91c1c',
    border: '#cbd5e1',
    reason: 'Gây tiếng ồn lớn/rung sàn (khoan bê tông, đục phá, cắt gạch đá). BQL tòa nhà cấm làm giờ hành chính T2-T6, dồn quân làm Thứ 7 & Chủ Nhật.'
  },
  LIFT_SMELL_WEEKEND: {
    id: 'LIFT_SMELL_WEEKEND',
    label: 'Tranh thủ T7-CN (Thang hàng/Mùi)',
    shortLabel: 'T7-CN (Thang/Mùi)',
    bg: '#f8fafc',
    color: '#c2410c',
    border: '#cbd5e1',
    reason: 'Đăng ký thang tải (Service Lift) vận chuyển vật tư lớn hoặc có mùi keo/sơn cần bay mùi cuối tuần trước sáng Thứ 2.'
  },
  QUIET_WEEKDAY: {
    id: 'QUIET_WEEKDAY',
    label: 'Làm T2-T6 (Êm trong nhà)',
    shortLabel: 'T2-T6 (Êm)',
    bg: '#f8fafc',
    color: '#15803d',
    border: '#cbd5e1',
    reason: 'Thi công êm trong phòng kín (bả bột, lăn sơn nước, kéo dây điện, lắp module tủ gỗ, ghép sàn). Làm đều đặn T2-T6.'
  }
};

export const TRADES = {
  DEMO: {
    id: 'DEMO',
    name: 'Tổ Tháo dỡ & Xà bần',
    shortName: 'Tháo dỡ / Phụ',
    icon: '',
    color: '#475569',
    bgLight: '#f1f5f9',
    phase: 1,
    startPct: 0.0,
    endPct: 0.20,
    defaultDailyWage: 480000,
    weekendBoost: true,
    weekendStrategy: 'Tranh thủ tối đa Thứ 7 & Chủ Nhật để đập phá, khoan đục và dùng thang hàng chuyển xà bần ra khỏi tòa nhà.',
    roleDesc: 'Thợ tháo dỡ hiện trạng, đục gạch, vận chuyển xà bần qua thang tải & vệ sinh'
  },
  MASON: {
    id: 'MASON',
    name: 'Tổ Xây tô - Ốp lát - Chống thấm',
    shortName: 'Thợ Nề / Ốp lát',
    icon: '',
    color: '#475569',
    bgLight: '#f1f5f9',
    phase: 2,
    startPct: 0.10,
    endPct: 0.55,
    defaultDailyWage: 620000,
    weekendBoost: true,
    weekendStrategy: 'Tranh thủ T7-CN tập kết cát xi gạch bằng thang hàng và cắt gạch đá; T2-T6 dán gạch, chà ron êm.',
    roleDesc: 'Thợ nề xây trát, cán nền, chống thấm WC, ốp lát gạch đá nội thất'
  },
  GYPSUM: {
    id: 'GYPSUM',
    name: 'Tổ Trần & Vách Thạch Cao',
    shortName: 'Thợ Thạch cao',
    icon: '',
    color: '#0f4c81',
    bgLight: '#f1f5f9',
    phase: 2,
    startPct: 0.15,
    endPct: 0.55,
    defaultDailyWage: 600000,
    weekendBoost: true,
    weekendStrategy: 'Ưu tiên khoan bê tông bắn ty treo trần & bắn tắc kê sàn/tường vào Thứ 7 - CN; T2-T6 ghép khung xương và bắn tấm.',
    roleDesc: 'Thợ bắn ty treo, dựng khung xương Vĩnh Tường, đóng trần chìm & vách thạch cao'
  },
  MEP: {
    id: 'MEP',
    name: 'Tổ Điện - Nước - Điều hòa (MEP)',
    shortName: 'Thợ Điện nước (MEP)',
    icon: '',
    color: '#0f4c81',
    bgLight: '#f1f5f9',
    phase: 2,
    startPct: 0.10,
    endPct: 0.90,
    defaultDailyWage: 650000,
    weekendBoost: true,
    weekendStrategy: 'Tranh thủ T7-CN cắt đục rãnh tường, khoan rút lõi và cúp điện đấu tủ tổng; T2-T6 luồn dây, lắp đèn, ổ cắm.',
    roleDesc: 'Thợ cắt rãnh âm, kéo dây nguồn/mạng, lắp đèn chiếu sáng, cấp thoát nước & ĐHKK'
  },
  PAINT: {
    id: 'PAINT',
    name: 'Tổ Sơn Nước & Bả Matit',
    shortName: 'Thợ Sơn bả',
    icon: '',
    color: '#334155',
    bgLight: '#f1f5f9',
    phase: 3,
    startPct: 0.45,
    endPct: 0.85,
    defaultDailyWage: 580000,
    weekendBoost: false,
    weekendStrategy: 'Bả matit và lăn sơn nước không mùi làm bình thường T2-T6; khâu xả nhám bụi nhiều hoặc sơn PU nên làm cuối tuần.',
    roleDesc: 'Thợ dán lưới mối nối, bả bột matit 2 lớp, xả nhám máy hút bụi, sơn lót & sơn phủ'
  },
  FLOOR: {
    id: 'FLOOR',
    name: 'Tổ Sàn Gỗ - Vinyl - Thảm',
    shortName: 'Thợ Sàn gỗ / Thảm',
    icon: '',
    color: '#334155',
    bgLight: '#f1f5f9',
    phase: 4,
    startPct: 0.65,
    endPct: 0.90,
    defaultDailyWage: 600000,
    weekendBoost: false,
    weekendStrategy: 'Lát sàn gỗ hèm khóa & trải thảm ít ồn, thi công T2-T6; nếu dán keo sàn Vinyl diện rộng thì dán vào T7-CN để bay mùi.',
    roleDesc: 'Thợ lát sàn gỗ công nghiệp, xương cá, dán sàn nhựa SPC/Vinyl, trải thảm văn phòng'
  },
  FURNITURE: {
    id: 'FURNITURE',
    name: 'Tổ Mộc & Lắp Đặt Nội Thất Fitout',
    shortName: 'Thợ Nội thất / Mộc',
    icon: '',
    color: '#0f4c81',
    bgLight: '#f1f5f9',
    phase: 4,
    startPct: 0.60,
    endPct: 1.00,
    defaultDailyWage: 680000,
    weekendBoost: true,
    weekendStrategy: 'Tranh thủ T7-CN đăng ký thang tải chuyển kiện gỗ nội thất, vách kính lớn và khoan treo tủ; T2-T6 lắp ráp module êm.',
    roleDesc: 'Thợ lắp đặt tủ bếp, tủ áo, vách ốp gỗ, cửa, vách kính, bàn ghế & hoàn thiện bàn giao'
  }
};

// Danh mục Định mức Năng suất Chuẩn
export const LABOR_NORMS = [
  {
    code: 'DEMO-01',
    name: 'Tháo dỡ vách thạch cao, trần thạch cao cũ',
    trade: 'DEMO',
    unit: 'm2',
    productivityPerManDay: 25.0,
    defaultCrewSize: 2,
    weekendTag: 'HIGH_NOISE_WEEKEND',
    keywords: ['tháo dỡ thạch cao', 'dỡ vách thạch cao', 'dỡ trần', 'phá vách thạch cao'],
    note: 'Ồn & bụi khi hạ khung: Nên dồn quân làm Thứ 7 - CN'
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
    note: 'Bắt buộc làm T7-CN trong tòa nhà vì tiếng đục lớn'
  },
  {
    code: 'DEMO-03',
    name: 'Đục bóc gạch nền, gạch ốp tường cũ bằng máy',
    trade: 'DEMO',
    unit: 'm2',
    productivityPerManDay: 12.0,
    defaultCrewSize: 2,
    weekendTag: 'HIGH_NOISE_WEEKEND',
    keywords: ['đục gạch', 'bóc gạch nền', 'đục nền', 'bóc gạch tường', 'tháo sàn cũ'],
    note: 'Rung sàn mạnh: Bố trí làm vào Thứ 7 & Chủ Nhật'
  },
  {
    code: 'DEMO-04',
    name: 'Vận chuyển xà bần qua thang tải & dọn mặt bằng',
    trade: 'DEMO',
    unit: 'm2',
    productivityPerManDay: 35.0,
    defaultCrewSize: 2,
    weekendTag: 'LIFT_SMELL_WEEKEND',
    keywords: ['xà bần', 'vận chuyển phế thải', 'dọn mặt bằng', 'trạc thải'],
    note: 'Đăng ký thang hàng (Service Lift) tòa nhà vào cuối tuần'
  },
  {
    code: 'MAS-01',
    name: 'Xây tường gạch ống / gạch thẻ dày 100mm',
    trade: 'MASON',
    unit: 'm2',
    productivityPerManDay: 7.0,
    defaultCrewSize: 2,
    weekendTag: 'LIFT_SMELL_WEEKEND',
    keywords: ['xây tường 100', 'xây tường gạch', 'xây tường ngăn', 'xây gạch ống', 'xây tường'],
    note: 'Tập kết gạch cát xi thang hàng T7-CN, xây làm T2-T6'
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
    note: 'Công việc êm, làm Thứ 2 - Thứ 6 bình thường'
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
    note: 'Nên cán nền vào T7 để CN khô vữa, T2 đi lại thi công tiếp'
  },
  {
    code: 'MAS-05',
    name: 'Thi công chống thấm sàn WC, bếp (2-3 lớp)',
    trade: 'MASON',
    unit: 'm2',
    productivityPerManDay: 16.0,
    defaultCrewSize: 2,
    weekendTag: 'LIFT_SMELL_WEEKEND',
    keywords: ['chống thấm', 'sika', 'korsil', 'chống thấm wc', 'chống thấm sàn'],
    note: 'Quét chống thấm & ngâm thử nước 24h qua Chủ Nhật'
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
    note: 'Khâu cắt gạch máy mài ồn làm T7-CN, dán gạch chà ron êm làm T2-T6'
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
    note: 'Khoét lỗ gạch thiết bị ồn: Cắt khoét vào T7-CN'
  },
  {
    code: 'MAS-09',
    name: 'Ốp lát đá Granite / Marble mặt bếp, lavabo, quầy bar',
    trade: 'MASON',
    unit: 'm2',
    productivityPerManDay: 3.5,
    defaultCrewSize: 2,
    weekendTag: 'HIGH_NOISE_WEEKEND',
    keywords: ['đá bếp', 'đá hoa cương', 'đá granite', 'đá marble', 'mặt đá', 'đá nung kết'],
    note: 'Cắt mài đá bụi & ồn: Gia công tại xưởng hoặc cắt vào T7-CN'
  },
  {
    code: 'GYP-01',
    name: 'Thi công vách thạch cao 1 mặt khung xương Vĩnh Tường',
    trade: 'GYPSUM',
    unit: 'm2',
    productivityPerManDay: 12.0,
    defaultCrewSize: 2,
    weekendTag: 'HIGH_NOISE_WEEKEND',
    keywords: ['vách thạch cao 1 mặt', 'vách 1 mặt', 'thạch cao 1 mặt'],
    note: 'Khoan bê tông bắn tắc kê U sàn trần vào T7-CN; bắn tấm làm T2-T6'
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
    note: 'Khoan sàn/trần ồn làm T7-CN; bắn vít tấm thạch cao làm T2-T6'
  },
  {
    code: 'GYP-03',
    name: 'Thi công vách thạch cao 2 mặt có bông cách âm tiêu âm',
    trade: 'GYPSUM',
    unit: 'm2',
    productivityPerManDay: 7.5,
    defaultCrewSize: 2,
    weekendTag: 'HIGH_NOISE_WEEKEND',
    keywords: ['vách thạch cao cách âm', 'vách cách âm', 'bông khoáng', 'bông thủy tinh'],
    note: 'Khoan định vị U vào T7-CN; nhét bông & bắn tấm làm T2-T6'
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
    note: 'Khoan bê tông bắn ty treo trần cực ồn -> Bắt buộc dồn làm T7-CN'
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
    note: 'Bắn ty treo vào T7-CN; ghép khung xương & tấm làm T2-T6'
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
    note: 'Bắn ty treo T7-CN, thả tấm làm T2-T6 rất êm và nhanh'
  },
  {
    code: 'PNT-01',
    name: 'Bả bột matit 2 lớp + xả nhám + 1 sơn lót + 2 sơn phủ tường/vách',
    trade: 'PAINT',
    unit: 'm2',
    productivityPerManDay: 18.0,
    defaultCrewSize: 2,
    weekendTag: 'QUIET_WEEKDAY',
    keywords: ['sơn nước', 'sơn bả', 'bả matit', 'sơn tường', 'sơn vách', 'thi công sơn nước'],
    note: 'Công việc êm: Làm xuyên suốt T2-T6 trong phòng kín'
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
    note: 'Không gây ồn: Làm bình thường T2-T6 trong tòa nhà'
  },
  {
    code: 'PNT-04',
    name: 'Sơn hiệu ứng bê tông / Sơn dặm PU có mùi',
    trade: 'PAINT',
    unit: 'm2',
    productivityPerManDay: 8.5,
    defaultCrewSize: 2,
    weekendTag: 'LIFT_SMELL_WEEKEND',
    keywords: ['sơn hiệu ứng', 'sơn giả bê tông', 'sơn pukaco', 'sơn nghệ thuật', 'sơn giả đá', 'sơn pu'],
    note: 'Có mùi dung môi: Làm T7-CN để bay mùi trước sáng Thứ 2'
  },
  {
    code: 'MEP-01',
    name: 'Thi công hệ thống Điện & Chiếu sáng MEP trọn gói (theo m2 sàn)',
    trade: 'MEP',
    unit: 'm2',
    productivityPerManDay: 8.0,
    defaultCrewSize: 2,
    weekendTag: 'HIGH_NOISE_WEEKEND',
    keywords: ['điện trọn gói', 'hệ thống điện', 'thi công điện', 'mep sàn', 'nhân công điện'],
    note: 'Cắt đục rãnh tường/khoan kẹp ống T7-CN; luồn dây và đấu nối làm T2-T6'
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
    note: 'Kéo dây trong vách thạch cao rất êm, làm T2-T6'
  },
  {
    code: 'MEP-03',
    name: 'Khoét lỗ thạch cao & lắp đặt đèn Downlight, Spotlight, Panel',
    trade: 'MEP',
    unit: 'bộ',
    productivityPerManDay: 20.0,
    defaultCrewSize: 2,
    weekendTag: 'QUIET_WEEKDAY',
    keywords: ['đèn downlight', 'đèn âm trần', 'lắp đèn', 'đèn spotlight', 'đèn rọi', 'đèn panel'],
    note: 'Khoét thạch cao bằng mũi tròn & đấu đèn êm, làm T2-T6'
  },
  {
    code: 'MEP-04',
    name: 'Dán & đấu nối đèn LED dây / thanh nhôm định hình hắt trần/tủ',
    trade: 'MEP',
    unit: 'md',
    productivityPerManDay: 18.0,
    defaultCrewSize: 2,
    weekendTag: 'QUIET_WEEKDAY',
    keywords: ['led dây', 'đèn led thanh', 'nhôm định hình', 'đèn hắt', 'led tủ'],
    note: 'Lắp thanh nhôm & dán LED êm, làm T2-T6'
  },
  {
    code: 'MEP-05',
    name: 'Lắp đặt công tắc, ổ cắm, mặt hạt mạng, aptomat',
    trade: 'MEP',
    unit: 'bộ',
    productivityPerManDay: 18.0,
    defaultCrewSize: 2,
    weekendTag: 'QUIET_WEEKDAY',
    keywords: ['ổ cắm', 'công tắc', 'đế âm', 'aptomat', 'thiết bị điện'],
    note: 'Đấu nối thiết bị êm, làm T2-T6'
  },
  {
    code: 'MEP-06',
    name: 'Đấu nối tủ điện tổng & cúp điện chuyển nguồn tòa nhà',
    trade: 'MEP',
    unit: 'tủ',
    productivityPerManDay: 1.0,
    defaultCrewSize: 2,
    weekendTag: 'HIGH_NOISE_WEEKEND',
    keywords: ['tủ điện', 'lắp tủ điện', 'đấu tủ điện'],
    note: 'Cúp điện đấu nguồn tổng tòa nhà vào chiều T7 hoặc Chủ Nhật'
  },
  {
    code: 'FLR-01',
    name: 'Lắp đặt sàn gỗ công nghiệp lát thẳng (kèm xốp lót)',
    trade: 'FLOOR',
    unit: 'm2',
    productivityPerManDay: 25.0,
    defaultCrewSize: 2,
    weekendTag: 'QUIET_WEEKDAY',
    keywords: ['sàn gỗ', 'sàn gỗ công nghiệp', 'lát sàn gỗ', 'sàn spc'],
    note: 'Ghép hèm khóa êm, máy cắt có túi hút bụi làm T2-T6'
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
    note: 'Ghép xương cá làm T2-T6 trong phòng kín'
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
    note: 'Dán keo diện rộng có mùi nhẹ: Tranh thủ làm T6-T7-CN'
  },
  {
    code: 'FUR-01',
    name: 'Lắp đặt tủ bếp trên & tủ bếp dưới hoàn chỉnh',
    trade: 'FURNITURE',
    unit: 'md',
    productivityPerManDay: 1.6,
    defaultCrewSize: 2,
    weekendTag: 'LIFT_SMELL_WEEKEND',
    keywords: ['tủ bếp', 'tủ bếp trên', 'tủ bếp dưới', 'bếp gỗ', 'lắp tủ bếp'],
    note: 'Chuyển thùng tủ thang tải & khoan treo T7-CN; lắp cánh phụ kiện T2-T6'
  },
  {
    code: 'FUR-02',
    name: 'Lắp đặt tủ quần áo / tủ âm tường / tủ hồ sơ kịch trần',
    trade: 'FURNITURE',
    unit: 'm2',
    productivityPerManDay: 3.5,
    defaultCrewSize: 2,
    weekendTag: 'LIFT_SMELL_WEEKEND',
    keywords: ['tủ quần áo', 'tủ áo', 'tủ trang trí', 'tủ hồ sơ', 'tủ âm tường', 'tủ giày'],
    note: 'Ván khổ lớn 2.4-2.7m cần thang hàng T7-CN; lắp dựng module làm T2-T6'
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
    note: 'Khoan tường bắt khung xương gỗ ưu tiên T7-CN; ốp tấm làm T2-T6'
  },
  {
    code: 'FUR-04',
    name: 'Lắp đặt cửa gỗ công nghiệp / cửa nhựa Composite',
    trade: 'FURNITURE',
    unit: 'bộ',
    productivityPerManDay: 2.2,
    defaultCrewSize: 2,
    weekendTag: 'QUIET_WEEKDAY',
    keywords: ['cửa gỗ', 'cửa phòng', 'cửa composite', 'cửa nhựa', 'lắp cửa'],
    note: 'Bơm foam, đóng nẹp chỉ, lắp khóa êm, làm T2-T6'
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
    note: 'Khổ kính lớn chuyển thang hàng T7-CN & cắt sàn chôn bản lề'
  },
  {
    code: 'FUR-06',
    name: 'Lắp đặt nội thất rời (giường, bàn làm việc, kệ tivi, bàn họp)',
    trade: 'FURNITURE',
    unit: 'cái',
    productivityPerManDay: 3.0,
    defaultCrewSize: 2,
    weekendTag: 'QUIET_WEEKDAY',
    keywords: ['giường ngủ', 'giường', 'bàn làm việc', 'kệ tivi', 'bàn họp', 'bàn ăn', 'quầy lễ tân', 'đồ rời'],
    note: 'Lắp ráp module êm ái: Làm T2-T6 bình thường'
  },
  {
    code: 'FUR-07',
    name: 'Vệ sinh công nghiệp chuyên sâu trước bàn giao',
    trade: 'DEMO',
    unit: 'm2',
    productivityPerManDay: 35.0,
    defaultCrewSize: 3,
    weekendTag: 'QUIET_WEEKDAY',
    keywords: ['vệ sinh công nghiệp', 'vệ sinh bàn giao', 'dọn vệ sinh hoàn thiện'],
    note: 'Thường chốt vào Chủ Nhật để sáng Thứ 2 bàn giao Sếp / CĐT'
  }
];

export const PROJECT_TEMPLATES = {
  office250: {
    title: 'Fitout Văn Phòng Hạng A - 250m²',
    projectType: 'OFFICE_BUILDING',
    targetDays: 20,
    difficultyFactor: 1.1,
    weekendMode: 'WEEKEND_NOISY_FOCUS',
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
    projectType: 'APARTMENT',
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
    projectType: 'SHOPHOUSE_MALL',
    targetDays: 14,
    difficultyFactor: 1.2,
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
    title: 'Dự án: 100m² Vách Thạch Cao + 200m² Sơn Nước + 60m² Ốp Lát',
    projectType: 'OFFICE_BUILDING',
    targetDays: 10,
    difficultyFactor: 1.1,
    weekendMode: 'WEEKEND_NOISY_FOCUS',
    items: [
      { code: 'GYP-02', name: 'Thi công vách tường thạch cao 2 mặt khung xương Vĩnh Tường', trade: 'GYPSUM', unit: 'm2', quantity: 100, productivityPerManDay: 9.0, crewSize: 3, weekendTag: 'HIGH_NOISE_WEEKEND' },
      { code: 'PNT-01', name: 'Bả bột matit 2 lớp + xả nhám + sơn nước hoàn thiện (2 mặt vách)', trade: 'PAINT', unit: 'm2', quantity: 200, productivityPerManDay: 18.0, crewSize: 3, weekendTag: 'QUIET_WEEKDAY' },
      { code: 'MAS-06', name: 'Thi công ốp lát gạch nền 600x600 hoàn thiện chà ron', trade: 'MASON', unit: 'm2', quantity: 60, productivityPerManDay: 7.5, crewSize: 2, weekendTag: 'HIGH_NOISE_WEEKEND' },
      { code: 'MEP-01', name: 'Đi dây điện âm vách thạch cao & lắp đèn, công tắc ổ cắm', trade: 'MEP', unit: 'm2', quantity: 100, productivityPerManDay: 10.0, crewSize: 2, weekendTag: 'QUIET_WEEKDAY' }
    ]
  }
};
