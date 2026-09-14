import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../../database/index.js';
import { WalletService } from '../wallet/wallet.service.js';

export class PaymentService {
  /**
   * To'lov sessiyasini yaratish (Payme / Click / Uzum / Crypto)
   */
  static createPayment(
    userId: string,
    amount: number, // tiyinlarda
    gateway: string,
    promoCode?: string
  ) {
    if (amount < 500000) { // Minimal 5,000 UZS (500,000 tiyin)
      throw new Error('Minimal depozit summasi 5,000 UZS');
    }

    if (amount > 500000000) { // Maksimal 5,000,000 UZS
      throw new Error('Maksimal bitta depozit summasi 5,000,000 UZS');
    }

    const db = getDatabase();
    const depositId = uuidv4();
    const idempotencyKey = `dep_${depositId}`;

    let bonusPercent = 0;
    if (promoCode) {
      const promo = db.prepare(`
        SELECT * FROM promo_codes WHERE code = ? AND is_active = 1
      `).get(promoCode.toUpperCase()) as any;
      if (promo) bonusPercent = promo.bonus_percent;
    }

    const bonusAmount = Math.floor(amount * (bonusPercent / 100));

    // To'lov shlyuziga yo'naltiruvchi havola generatsiyasi
    let paymentUrl = '';
    const amountInUzs = Math.floor(amount / 100);

    switch (gateway.toUpperCase()) {
      case 'PAYME':
        paymentUrl = `https://checkout.paycom.uz/${Buffer.from(`m=merchant_id;ac.deposit_id=${depositId};a=${amount}`).toString('base64')}`;
        break;
      case 'CLICK':
        paymentUrl = `https://my.click.uz/services/pay?service_id=12345&merchant_id=67890&amount=${amountInUzs}&transaction_param=${depositId}`;
        break;
      case 'UZUM':
        paymentUrl = `https://www.apelsin.uz/open-service?serviceId=9876&depositId=${depositId}&amount=${amountInUzs}`;
        break;
      case 'CRYPTO_USDT':
        paymentUrl = `https://cryptopay.me/invoice/${depositId}`;
        break;
      case 'TELEGRAM_STARS':
        paymentUrl = `tg://invoice?slug=${depositId}`;
        break;
      default:
        paymentUrl = `/deposit/mock-gateway?deposit_id=${depositId}&amount=${amountInUzs}`;
    }

    db.prepare(`
      INSERT INTO deposits (
        id, user_id, gateway, amount, bonus_amount, promo_code, status, payment_url, idempotency_key
      ) VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?, ?)
    `).run(depositId, userId, gateway.toUpperCase(), amount, bonusAmount, promoCode || null, paymentUrl, idempotencyKey);

    return {
      depositId,
      amount,
      bonusAmount,
      totalCredit: amount + bonusAmount,
      gateway,
      paymentUrl,
    };
  }

  /**
   * To'lovni tasdiqlash (Webhook or Instant Simulator)
   */
  static confirmDeposit(depositId: string, externalId?: string) {
    const db = getDatabase();
    const deposit = db.prepare('SELECT * FROM deposits WHERE id = ?').get(depositId) as any;

    if (!deposit) {
      throw new Error('Depozit topilmadi');
    }

    if (deposit.status === 'SUCCESS') {
      return { success: true, message: 'Depozit allaqachon bajarilgan' };
    }

    return WalletService.processDeposit(
      deposit.user_id,
      deposit.amount,
      deposit.gateway,
      deposit.promo_code,
      deposit.idempotency_key
    );
  }
}
