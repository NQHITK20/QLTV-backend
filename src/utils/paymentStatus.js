// Utility to translate order/payment statuses to Vietnamese for frontend display
export function translatePaymentStatus(status) {
  if (status === undefined || status === null) return 'Không xác định';
  let s = String(status).trim().toLowerCase();
  // normalize spaces and dashes to underscores (e.g. 'cod-pending' or 'cod pending' -> 'cod_pending')
  s = s.replace(/[\s\-]+/g, '_');

  const map = {
    // generic
    pending: 'Đang chờ',
    pending_payment: 'Chờ thanh toán',
    processing: 'Đang xử lý',
    paid: 'Đã thanh toán',
    completed: 'Hoàn tất',
    success: 'Thành công',
    failed: 'Thanh toán thất bại',
    cancelled: 'Đã hủy',
    canceled: 'Đã hủy',
    refunded: 'Đã hoàn tiền',
    partially_refunded: 'Đã hoàn tiền một phần',
    on_hold: 'Tạm giữ',
    shipped: 'Đã gửi',
    delivered: 'Đã giao',
    created: 'Đã tạo',
    draft: 'Nháp',
    unknown: 'Không xác định',

    // payment-specific
    authorized: 'Đã ủy quyền',
    captured: 'Đã thu tiền',
    payment_pending: 'Thanh toán đang xử lý',
    payment_declined: 'Thanh toán bị từ chối',

    // COD-specific
    cod: 'Thanh toán khi nhận (COD)',
    cod_pending: 'Đang chờ xác nhận',
    cod_success: 'Đã xác nhận COD',
    cod_failed: 'Thanh toán COD thất bại',
    cod_cancelled: 'COD bị hủy',

    // common variations
    awaiting_confirmation: 'Chờ xác nhận',
    wait_for_payment: 'Chờ thanh toán'
  };

  return map[s] || map[status] || String(status);
}

export default { translatePaymentStatus };
