export function getFishImage(name: string): string {
  const normalized = (name || '').toLowerCase().trim();
  
  if (normalized.includes('rohu')) return '/img/rohu.png';
  if (normalized.includes('catla')) return '/img/catla.png';
  if (normalized.includes('pomfret') || normalized.includes('ponfret')) return '/img/ponfret.png';
  if (normalized.includes('basa') && normalized.includes('fillet')) return '/img/bonless_basa_fillet.png';
  if (normalized.includes('basa') || normalized.includes('pangasius')) return '/img/pangasiusorbasa.png';
  if (normalized.includes('common carp')) return '/img/common_carp.png';
  if (normalized.includes('grass carp')) return '/img/grass_carp.png';
  if (normalized.includes('silver carp')) return '/img/silver_carp.png';
  if (normalized.includes('tilapia')) return '/img/tilapia.png';
  if (normalized.includes('magur')) return '/img/magur.png';
  if (normalized.includes('singhi')) return '/img/singhi.png';
  if (normalized.includes('mrigal')) return '/img/mrigal.png';
  if (normalized.includes('dry fish') || normalized.includes('dry')) return '/img/dry-fish-assortment.png';

  // default fallback
  return '/img/rohu.png';
}
