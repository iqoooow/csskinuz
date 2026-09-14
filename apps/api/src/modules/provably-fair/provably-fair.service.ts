import crypto from 'crypto';

export interface ProvablyFairResult {
  rollNumber: number; // 0.000000 dan 100.000000 gacha
  serverSeedHash: string;
  serverSeedPlain: string;
  clientSeed: string;
  nonce: number;
}

export class ProvablyFairService {
  /**
   * Server Seed generatsiyasi (256-bit kriptografik tasodifiy)
   */
  static generateServerSeed(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Server Seed ning SHA256 xeshini chiqarish (Commitment)
   */
  static hashServerSeed(serverSeed: string): string {
    return crypto.createHash('sha256').update(serverSeed).digest('hex');
  }

  /**
   * Klient tasodifiy urug'i
   */
  static generateClientSeed(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * HMAC-SHA256 orqali 0.000000 dan 100.000000 gacha aniq roll sonini hisoblash
   */
  static calculateRoll(serverSeed: string, clientSeed: string, nonce: number): number {
    const message = `${clientSeed}:${nonce}`;
    const hmac = crypto.createHmac('sha256', serverSeed).update(message).digest('hex');

    // Dastlabki 8 ta hex belgini olish (32-bit butun son)
    const subHash = hmac.substring(0, 8);
    const intVal = parseInt(subHash, 16);

    // 0 dan 100% gacha bo'lgan son
    const roll = (intVal / 0xffffffff) * 100;
    return parseFloat(roll.toFixed(6));
  }

  /**
   * Olingan roll natijasini keys ichidagi skinlar ehtimollik shkalasiga moslashtirish
   */
  static selectItemFromPool<T extends { drop_weight: number }>(items: T[], rollPercent: number): T {
    const totalWeight = items.reduce((sum, item) => sum + item.drop_weight, 0);
    if (totalWeight <= 0) {
      throw new Error('Case items pool weight is invalid');
    }

    // Roll foizini (0..100) og'irlik shkalasiga (0..totalWeight) o'tkazish
    const targetWeight = (rollPercent / 100) * totalWeight;

    let currentWeight = 0;
    for (const item of items) {
      currentWeight += item.drop_weight;
      if (targetWeight <= currentWeight) {
        return item;
      }
    }

    return items[items.length - 1];
  }

  /**
   * Natijani mustaqil tekshirish funksiyasi
   */
  static verify(serverSeed: string, clientSeed: string, nonce: number, expectedRoll: number): boolean {
    const calculated = this.calculateRoll(serverSeed, clientSeed, nonce);
    return Math.abs(calculated - expectedRoll) < 0.00001;
  }
}
