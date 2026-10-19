// Bộ xuất báo cáo Excel (.xlsx) chuyên nghiệp trình Sếp & tải file BOQ mẫu
import { TRADES } from './norms-data.js';

export function exportFullReportToExcel(calcResult, projectMeta) {
  if (!window.XLSX) {
    alert('Thư viện xuất Excel đang tải, vui lòng thử lại sau giây lát.');
    return;
  }

  const wb = window.XLSX.utils.book_new();

  // SHEET 1: BẢNG DỰ TOÁN HAO PHÍ NHÂN CÔNG CHI TIẾT THEO BOQ
  const sheet1Rows = [
    ['CRYSTAL INTERIOR QS - BẢNG DỰ TOÁN NHÂN CÔNG & ĐIỀU PHỐI THỢ THI CÔNG FITOUT - NỘI THẤT'],
    [`Dự án: ${projectMeta.title}`, '', '', `Tiến độ mục tiêu: ${projectMeta.targetDays} ngày`, '', `Hệ số mặt bằng: x${projectMeta.difficultyFactor}`, '', `Giờ làm/ca: ${projectMeta.hoursPerDay}h/ngày`],
    [],
    [
      'STT',
      'Mã ĐM',
      'Nội dung công việc / Hạng mục BOQ',
      'Tổ đội chuyên môn',
      'ĐVT',
      'Khối lượng',
      'Định mức chuẩn (KL/công 8h)',
      'Năng suất thực tế (KL/công)',
      'Tổng số công (Man-days)',
      'Số thợ bố trí/ngày (Người)',
      'Thời gian hoàn thành (Ngày)',
      'Đơn giá ngày công (VNĐ)',
      'Thành tiền nhân công (VNĐ)'
    ]
  ];

  calcResult.enrichedItems.forEach((item, idx) => {
    const tradeInfo = TRADES[item.trade] || TRADES.FURNITURE;
    sheet1Rows.push([
      idx + 1,
      item.code || 'CUSTOM',
      item.name,
      tradeInfo.name,
      item.unit,
      Number(item.quantity.toFixed(2)),
      Number(item.productivityPerManDay.toFixed(2)),
      Number(item.effectiveProductivity.toFixed(2)),
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
    `${calcResult.targetDays} ngày`,
    '',
    Math.round(calcResult.totalLaborCost)
  ]);

  const ws1 = window.XLSX.utils.aoa_to_sheet(sheet1Rows);
  ws1['!cols'] = [
    { wch: 6 },
    { wch: 10 },
    { wch: 46 },
    { wch: 28 },
    { wch: 8 },
    { wch: 12 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 16 },
    { wch: 18 },
    { wch: 22 }
  ];
  window.XLSX.utils.book_append_sheet(wb, ws1, '1_Du_Toan_BOQ_Nhan_Cong');

  // SHEET 2: BẢNG TỔNG HỢP PHÂN BỔ THỢ THEO TỔ ĐỘI
  const sheet2Rows = [
    ['BẢNG TỔNG HỢP PHÂN BỔ NHÂN LỰC THEO TỔ ĐỘI CHUYÊN MÔN'],
    [`Dự án: ${projectMeta.title} | Tổng tiến độ: ${calcResult.targetDays} ngày`],
    [],
    [
      'STT',
      'Tổ đội thi công',
      'Số đầu việc',
      'Tổng số công (Man-days)',
      'Tỷ trọng công (%)',
      'Giai đoạn vào việc',
      'Số ngày thi công tại công trình',
      'Số thợ cần điều phối / ngày (Người)',
      'Số thợ tối đa lúc cao điểm (Người)',
      'Đơn giá công bình quân (VNĐ/ngày)',
      'Chi phí nhân công tổ đội (VNĐ)'
    ]
  ];

  calcResult.tradeSummaries.forEach((ts, idx) => {
    sheet2Rows.push([
      idx + 1,
      ts.tradeName,
      ts.itemCount,
      Number(ts.totalManDays.toFixed(1)),
      Number(ts.sharePct.toFixed(1)),
      `Ngày ${ts.startDay} -> Ngày ${ts.endDay}`,
      ts.activeDays,
      ts.recommendedDailyCrew,
      ts.peakCrew,
      ts.dailyWage,
      Math.round(ts.totalCost)
    ]);
  });

  sheet2Rows.push([]);
  sheet2Rows.push([
    '',
    'TỔNG CỘNG',
    calcResult.enrichedItems.length,
    Number(calcResult.totalManDays.toFixed(1)),
    100,
    `Ngày 1 -> Ngày ${calcResult.targetDays}`,
    calcResult.targetDays,
    `TB: ${calcResult.avgDailyWorkers.toFixed(1)} người/ngày`,
    `Peak: ${calcResult.peakWorkers} người/ngày`,
    '',
    Math.round(calcResult.totalLaborCost)
  ]);

  const ws2 = window.XLSX.utils.aoa_to_sheet(sheet2Rows);
  ws2['!cols'] = [
    { wch: 6 },
    { wch: 32 },
    { wch: 12 },
    { wch: 18 },
    { wch: 15 },
    { wch: 24 },
    { wch: 18 },
    { wch: 22 },
    { wch: 22 },
    { wch: 22 },
    { wch: 24 }
  ];
  window.XLSX.utils.book_append_sheet(wb, ws2, '2_Phan_Bo_To_Doi');

  // SHEET 3: LỊCH ĐIỀU PHỐI THỢ THEO TỪNG NGÀY (GANTT MATRIX)
  const dayHeaders = ['Tổ đội chuyên môn', 'Tổng công', 'Thợ TB/ngày'];
  for (let d = 1; d <= calcResult.targetDays; d++) {
    dayHeaders.push(`N${d}`);
  }

  const sheet3Rows = [
    ['BẢNG KẾ HOẠCH ĐIỀU PHỐI SỐ LƯỢNG THỢ TRÊN CÔNG TRƯỜNG THEO NGÀY'],
    [`Dự án: ${projectMeta.title} (Đơn vị trong ô: Số người làm việc trong ngày đó)`],
    [],
    dayHeaders
  ];

  calcResult.tradeSummaries.forEach(ts => {
    const row = [
      ts.tradeName,
      Number(ts.totalManDays.toFixed(1)),
      ts.recommendedDailyCrew
    ];
    for (let d = 1; d <= calcResult.targetDays; d++) {
      const count = ts.dailyWorkers[d - 1] || 0;
      row.push(count > 0 ? count : '');
    }
    sheet3Rows.push(row);
  });

  const totalDayRow = ['TỔNG THỢ TRÊN CÔNG TRƯỜNG MỖI NGÀY', Number(calcResult.totalManDays.toFixed(1)), `Peak: ${calcResult.peakWorkers}`];
  for (let d = 1; d <= calcResult.targetDays; d++) {
    totalDayRow.push(calcResult.dailyTotalWorkers[d - 1] || 0);
  }
  sheet3Rows.push([]);
  sheet3Rows.push(totalDayRow);

  const ws3 = window.XLSX.utils.aoa_to_sheet(sheet3Rows);
  window.XLSX.utils.book_append_sheet(wb, ws3, '3_Lich_Dieu_Phoi_Theo_Ngay');

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
    ['STT', 'Nội dung công việc', 'ĐVT', 'Khối lượng', 'Ghi chú kỹ thuật'],
    [1, 'Tháo dỡ vách thạch cao và trần cũ mặt bằng', 'm2', 95, 'Bao gồm thu gom xà bần'],
    [2, 'Thi công vách thạch cao 2 mặt khung xương Vĩnh Tường', 'm2', 120, 'Tấm Gyproc 9mm tiêu chuẩn'],
    [3, 'Thi công trần thạch cao khung chìm giật cấp', 'm2', 150, 'Có khe đèn LED hắt sáng'],
    [4, 'Bả bột matit 2 lớp và sơn nước hoàn thiện Dulux', 'm2', 380, '1 lớp sơn lót + 2 lớp sơn phủ'],
    [5, 'Lát gạch nền Porcelain 600x600 hoàn thiện chà ron', 'm2', 85, 'Gạch chống trượt'],
    [6, 'Ốp gạch tường phòng vệ sinh 300x600', 'm2', 42, 'Ke cân bằng phẳng'],
    [7, 'Thi công hệ thống điện nguồn, dây mạng và chiếu sáng (tính theo m2 sàn)', 'm2', 160, 'Ống luồn dây Sino + cáp Cadivi'],
    [8, 'Lắp đặt đèn Downlight âm trần 9W & đèn rọi Spotlight', 'bộ', 64, 'Khoét lỗ và đấu nối'],
    [9, 'Lát sàn gỗ công nghiệp 12mm chống ẩm (kèm xốp lót)', 'm2', 75, 'Khu vực phòng làm việc / phòng ngủ'],
    [10, 'Lắp đặt tủ bếp dưới và tủ bếp trên MDF chống ẩm phủ Acrylic', 'md', 8.5, 'Bao gồm phụ kiện bản lề, ray kéo'],
    [11, 'Lắp đặt tủ quần áo âm tường & tủ hồ sơ kịch trần', 'm2', 32, 'Gỗ MDF An Cường'],
    [12, 'Thi công vách ốp gỗ Laminate kết hợp lam sóng trang trí', 'm2', 28, 'Vách lễ tân & phòng họp'],
    [13, 'Lắp đặt cửa gỗ công nghiệp MDF / Composite hoàn chỉnh', 'bộ', 5, 'Bao gồm khung bao, nẹp chỉ, khóa'],
    [14, 'Vệ sinh công nghiệp chuyên sâu toàn bộ mặt bằng trước bàn giao', 'm2', 160, 'Bàn giao chìa khóa trao tay']
  ];

  const wb = window.XLSX.utils.book_new();
  const ws = window.XLSX.utils.aoa_to_sheet(rows);
  ws['!cols'] = [{ wch: 6 }, { wch: 56 }, { wch: 10 }, { wch: 14 }, { wch: 30 }];
  window.XLSX.utils.book_append_sheet(wb, ws, 'BOQ_Mau_Crystal_Interior');
  window.XLSX.writeFile(wb, 'BOQ_Mau_Fitout_Crystal_Interior.xlsx');
}
