// Bộ xuất báo cáo Excel (.xlsx) chuyên nghiệp trình Sếp & tải file BOQ mẫu (Bao gồm Lịch Thứ 7 - CN & Lưu ý Tòa nhà)
import { TRADES, WEEKEND_TAGS } from './norms-data.js';

export function exportFullReportToExcel(calcResult, projectMeta) {
  if (!window.XLSX) {
    alert('Thư viện xuất Excel đang tải, vui lòng thử lại sau giây lát.');
    return;
  }

  const wb = window.XLSX.utils.book_new();

  // SHEET 1: BẢNG DỰ TOÁN HAO PHÍ NHÂN CÔNG CHI TIẾT THEO BOQ
  const sheet1Rows = [
    ['CRYSTAL INTERIOR QS - BẢNG DỰ TOÁN NHÂN CÔNG & ĐIỀU PHỐI THỢ THI CÔNG FITOUT - NỘI THẤT TRONG TÒA NHÀ'],
    [
      `Dự án: ${projectMeta.title}`,
      '',
      `Khởi công: ${calcResult.startDateFormatted}`,
      '',
      `Hoàn thành: ${calcResult.endDateFormatted}`,
      '',
      `Số ngày làm việc: ${calcResult.workingDaysCount} ngày (Tổng lịch: ${calcResult.totalCalendarDays} ngày)`,
      '',
      `Chế độ T7-CN: ${projectMeta.weekendModeLabel}`
    ],
    [],
    [
      'STT',
      'Mã ĐM',
      'Nội dung công việc / Hạng mục BOQ',
      'Tổ đội chuyên môn',
      'Lưu ý Thi công Tòa nhà (Thứ 7 - CN)',
      'ĐVT',
      'Khối lượng',
      'Định mức chuẩn (KL/công 8h)',
      'Tổng số công (Man-days)',
      'Số thợ bố trí/ngày (Người)',
      'Thời gian hoàn thành (Ngày)',
      'Đơn giá ngày công (VNĐ)',
      'Thành tiền nhân công (VNĐ)'
    ]
  ];

  calcResult.enrichedItems.forEach((item, idx) => {
    const tradeInfo = TRADES[item.trade] || TRADES.FURNITURE;
    const wkTag = WEEKEND_TAGS[item.weekendTag] || WEEKEND_TAGS.QUIET_WEEKDAY;
    sheet1Rows.push([
      idx + 1,
      item.code || 'CUSTOM',
      item.name,
      tradeInfo.name,
      wkTag.label,
      item.unit,
      Number(item.quantity.toFixed(2)),
      Number(item.productivityPerManDay.toFixed(2)),
      Number(item.manDays.toFixed(1)),
      item.crewSize,
      Number(item.durationDays.toFixed(1)),
      item.dailyWage,
      Math.round(item.laborCost)
    ]);
  });

  sheet1Rows.push([]);
  sheet1Rows.push([
    '',
    '',
    'TỔNG CỘNG TOÀN DỰ ÁN',
    '',
    '',
    '',
    '',
    '',
    Number(calcResult.totalManDays.toFixed(1)),
    `Đỉnh: ${calcResult.peakWorkers} thợ/ngày`,
    `${calcResult.workingDaysCount} ngày làm (${calcResult.totalCalendarDays} ngày lịch)`,
    '',
    Math.round(calcResult.totalLaborCost)
  ]);

  const ws1 = window.XLSX.utils.aoa_to_sheet(sheet1Rows);
  ws1['!cols'] = [
    { wch: 6 },
    { wch: 10 },
    { wch: 44 },
    { wch: 28 },
    { wch: 34 },
    { wch: 8 },
    { wch: 12 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 18 },
    { wch: 22 }
  ];
  window.XLSX.utils.book_append_sheet(wb, ws1, '1_Du_Toan_BOQ_Nhan_Cong');

  // SHEET 2: BẢNG TỔNG HỢP PHÂN BỔ THỢ THEO TỔ ĐỘI & CHIẾN LƯỢC T7-CN
  const sheet2Rows = [
    ['BẢNG TỔNG HỢP PHÂN BỔ NHÂN LỰC THEO TỔ ĐỘI & KẾ HOẠCH TRANH THỦ THỨ 7 - CHỦ NHẬT'],
    [`Dự án: ${projectMeta.title} | Khởi công: ${calcResult.startDateFormatted} -> Bàn giao: ${calcResult.endDateFormatted}`],
    [],
    [
      'STT',
      'Tổ đội thi công',
      'Số đầu việc',
      'Tổng số công (Man-days)',
      'Tỷ trọng (%)',
      'Lịch vào việc (Từ ngày -> Đến ngày)',
      'Số ngày làm thực tế',
      'Số thợ cần điều phối / ngày',
      'Số thợ tối đa (Peak)',
      'Chi phí nhân công tổ đội (VNĐ)',
      'Lưu ý Tranh thủ Thứ 7 - Chủ Nhật trong Tòa nhà'
    ]
  ];

  calcResult.tradeSummaries.forEach((ts, idx) => {
    sheet2Rows.push([
      idx + 1,
      ts.tradeName,
      ts.itemCount,
      Number(ts.totalManDays.toFixed(1)),
      Number(ts.sharePct.toFixed(1)),
      `${ts.startCalendarStr} -> ${ts.endCalendarStr} (N${ts.startDay}-N${ts.endDay})`,
      ts.activeDays,
      ts.recommendedDailyCrew,
      ts.peakCrew,
      Math.round(ts.totalCost),
      ts.weekendStrategy
    ]);
  });

  sheet2Rows.push([]);
  sheet2Rows.push([
    '',
    'TỔNG CỘNG',
    calcResult.enrichedItems.length,
    Number(calcResult.totalManDays.toFixed(1)),
    100,
    `${calcResult.startDateFormatted} -> ${calcResult.endDateFormatted}`,
    `${calcResult.workingDaysCount} ngày làm việc`,
    `TB: ${calcResult.avgDailyWorkers.toFixed(1)} người/ngày`,
    `Peak: ${calcResult.peakWorkers} người/ngày`,
    Math.round(calcResult.totalLaborCost),
    ''
  ]);

  const ws2 = window.XLSX.utils.aoa_to_sheet(sheet2Rows);
  ws2['!cols'] = [
    { wch: 6 },
    { wch: 30 },
    { wch: 12 },
    { wch: 16 },
    { wch: 12 },
    { wch: 32 },
    { wch: 16 },
    { wch: 20 },
    { wch: 18 },
    { wch: 22 },
    { wch: 65 }
  ];
  window.XLSX.utils.book_append_sheet(wb, ws2, '2_Phan_Bo_To_Doi_T7_CN');

  // SHEET 3: LỊCH ĐIỀU PHỐI THỢ THEO TỪNG NGÀY CÓ THỨ 7 & CHỦ NHẬT (GANTT MATRIX)
  const dayHeaders = ['Tổ đội chuyên môn', 'Tổng công', 'Thợ TB/ngày'];
  calcResult.calendarDays.forEach((cd) => {
    dayHeaders.push(`N${cd.dayIndex} ${cd.dowShort} (${cd.dateShort})`);
  });

  const sheet3Rows = [
    ['BẢNG KẾ HOẠCH ĐIỀU PHỐI SỐ LƯỢNG THỢ TRÊN CÔNG TRƯỜNG THEO NGÀY (BAO GỒM THỨ 7 & CHỦ NHẬT)'],
    [`Dự án: ${projectMeta.title} | Từ ${calcResult.startDateFormatted} đến ${calcResult.endDateFormatted}`],
    [],
    dayHeaders
  ];

  calcResult.tradeSummaries.forEach(ts => {
    const row = [
      ts.tradeName,
      Number(ts.totalManDays.toFixed(1)),
      ts.recommendedDailyCrew
    ];
    for (let d = 0; d < calcResult.totalCalendarDays; d++) {
      const count = ts.dailyWorkers[d] || 0;
      row.push(count > 0 ? count : '');
    }
    sheet3Rows.push(row);
  });

  const totalDayRow = ['TỔNG THỢ TRÊN CÔNG TRƯỜNG MỖI NGÀY', Number(calcResult.totalManDays.toFixed(1)), `Peak: ${calcResult.peakWorkers}`];
  for (let d = 0; d < calcResult.totalCalendarDays; d++) {
    totalDayRow.push(calcResult.dailyTotalWorkers[d] || 0);
  }
  sheet3Rows.push([]);
  sheet3Rows.push(totalDayRow);

  const ws3 = window.XLSX.utils.aoa_to_sheet(sheet3Rows);
  window.XLSX.utils.book_append_sheet(wb, ws3, '3_Lich_Dieu_Phoi_T7_CN');

  const safeName = (projectMeta.title || 'Crystal_QS_Report')
    .replace(/[^a-zA-Z0-9\u00C0-\u1EF9\s_-]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .slice(0, 40);

  window.XLSX.writeFile(wb, `Crystal_QS_NhanCong_${safeName}.xlsx`);
}

export function downloadSampleBOQExcel() {
  if (!window.XLSX) return;
  const rows = [
    ['BẢNG KHỐI LƯỢNG CÔNG VIỆC (BOQ) - THI CÔNG NỘI THẤT & FITOUT CRYSTAL INTERIOR'],
    ['STT', 'Nội dung công việc', 'ĐVT', 'Khối lượng', 'Ghi chú thi công trong tòa nhà'],
    [1, 'Tháo dỡ vách thạch cao và trần cũ mặt bằng', 'm2', 95, 'Làm Thứ 7 - CN (Ồn & chuyển xà bần thang tải)'],
    [2, 'Thi công vách thạch cao 2 mặt khung xương Vĩnh Tường', 'm2', 120, 'Khoan tắc kê sàn/trần vào T7-CN, bắn tấm T2-T6'],
    [3, 'Thi công trần thạch cao khung chìm giật cấp', 'm2', 150, 'Khoan bắn ty treo lên sàn bê tông vào T7-CN'],
    [4, 'Bả bột matit 2 lớp và sơn nước hoàn thiện Dulux', 'm2', 380, 'Công việc êm, làm T2-T6 bình thường'],
    [5, 'Lát gạch nền Porcelain 600x600 hoàn thiện chà ron', 'm2', 85, 'Cắt gạch ồn ưu tiên T7-CN'],
    [6, 'Ốp gạch tường phòng vệ sinh 300x600', 'm2', 42, 'Cắt khoét lỗ thiết bị vào T7-CN'],
    [7, 'Thi công hệ thống điện nguồn, dây mạng và chiếu sáng (tính theo m2 sàn)', 'm2', 160, 'Cắt đục rãnh tường T7-CN, luồn dây T2-T6'],
    [8, 'Lắp đặt đèn Downlight âm trần 9W & đèn rọi Spotlight', 'bộ', 64, 'Làm trong tuần T2-T6'],
    [9, 'Lát sàn gỗ công nghiệp 12mm chống ẩm (kèm xốp lót)', 'm2', 75, 'Làm trong tuần T2-T6'],
    [10, 'Lắp đặt tủ bếp dưới và tủ bếp trên MDF chống ẩm phủ Acrylic', 'md', 8.5, 'Chuyển thang tải & khoan treo tủ T7-CN'],
    [11, 'Lắp đặt tủ quần áo âm tường & tủ hồ sơ kịch trần', 'm2', 32, 'Đăng ký thang hàng chuyển ván khổ lớn T7-CN'],
    [12, 'Thi công vách ốp gỗ Laminate kết hợp lam sóng trang trí', 'm2', 28, 'Khoan khung xương T7-CN, ốp tấm T2-T6'],
    [13, 'Lắp đặt cửa gỗ công nghiệp MDF / Composite hoàn chỉnh', 'bộ', 5, 'Làm trong tuần T2-T6'],
    [14, 'Vệ sinh công nghiệp chuyên sâu toàn bộ mặt bằng trước bàn giao', 'm2', 160, 'Chốt làm Chủ Nhật để sáng Thứ 2 bàn giao']
  ];

  const wb = window.XLSX.utils.book_new();
  const ws = window.XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{ wch: 6 }, { wch: 56 }, { wch: 10 }, { wch: 14 }, { wch: 42 }];
  window.XLSX.utils.book_append_sheet(wb, ws, 'BOQ_Mau_Crystal_Interior');
  window.XLSX.writeFile(wb, 'BOQ_Mau_Fitout_Crystal_Interior.xlsx');
}
