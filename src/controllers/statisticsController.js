import db from '../models';

/**
 * GET /api/statistics/revenue?view=year|month&year=2025&month=0|1..12
 * Returns JSON suitable for Chart.js as specified by frontend
 */
let revenue = async (req, res) => {
  try {
    const view = (req.query.view || 'year').toString();
    const year = parseInt(req.query.year || new Date().getFullYear(), 10);
    const month = parseInt(req.query.month || 0, 10); // 0 means full year

    // Build where clause: if view === 'year' -> filter by year; if month view -> filter by year+month
    const { Op } = require('sequelize');
    const start = new Date(year, (view === 'month' ? (month || 1) - 1 : 0), 1);
    let end;
    if (view === 'month') {
      // month param expected 1..12
      const m = (month && month >= 1 && month <= 12) ? month - 1 : 0;
      end = new Date(year, m + 1, 1); // exclusive
    } else {
      end = new Date(year + 1, 0, 1);
    }

    // fetch relevant orders in range
    const orders = await db.Order.findAll({ where: { createdAt: { [Op.gte]: start, [Op.lt]: end } }, raw: true });

    if (view === 'month') {
      // split into 4 week-buckets inside the month: 1-7,8-14,15-21,22-end
      const labels = ['Tuần 1','Tuần 2','Tuần 3','Tuần 4'];
      const totals = [0,0,0,0];

      for (const o of orders) {
        const d = new Date(o.createdAt);
        const day = d.getDate();
        let idx = 3;
        if (day <= 7) idx = 0;
        else if (day <= 14) idx = 1;
        else if (day <= 21) idx = 2;
        else idx = 3;

        const val = Number(o.total || 0);
        totals[idx] += val;
      }

      // prepare friendly message when there's no data
      const msg = totals.every(v => Number(v) === 0) ? 'Không có dữ liệu doanh thu trong tháng này.' : '';
      // return a clean shape (totals) while keeping backward-compatible fields
      return res.status(200).json({ success: true, labels, totals, datasets: { total: totals }, dataStatistic: totals, datasttic: totals, message: msg });
    }

    // view === 'year' (default): aggregate per month
    const labels = ['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];
    const totals = Array(12).fill(0);
    for (const o of orders) {
      const d = new Date(o.createdAt);
      const m = d.getMonth(); // 0..11
      const val = Number(o.total || 0);
      totals[m] += val;
    }

    // prepare friendly message when there's no data
    const msg = totals.every(v => Number(v) === 0) ? 'Không có dữ liệu doanh thu trong năm này.' : '';
    // return a clean shape (totals) while keeping backward-compatible fields
    return res.status(200).json({ success: true, labels, totals, datasets: { total: totals }, dataStatistic: totals, datasttic: totals, message: msg });
  } catch (err) {
    console.error('statistics.revenue error', err);
    return res.status(500).json({ errCode: -1, errMessage: 'Lỗi khi lấy thống kê doanh thu' });
  }
};

module.exports = { revenue };
