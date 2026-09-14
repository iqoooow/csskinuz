export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const body = req.body || {};
  const userId = `tg_${Date.now()}`;
  
  const user = {
    id: userId,
    username: 'Telegram_Gamer',
    role: 'USER',
    avatar_url: 'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg',
  };

  const wallet = {
    balance: 10000000, // 100,000 UZS
    bonus_balance: 2000000,
    currency: 'UZS',
    wager_required: 0,
    wager_current: 0,
  };

  return res.status(200).json({
    success: true,
    data: {
      token: `jwt_${userId}`,
      user,
      wallet,
    },
  });
}
