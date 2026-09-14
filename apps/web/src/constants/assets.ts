export const SVG_FALLBACK_SKIN = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="none"><rect width="120" height="120" rx="20" fill="%2312151e"/><circle cx="60" cy="60" r="38" fill="%23f59e0b" fill-opacity="0.1"/><path d="M40 78L78 40M78 40L84 46M78 40L72 34M40 78L34 72M40 78L46 84" stroke="%23f59e0b" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export const SVG_FALLBACK_CASE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 140" fill="none"><rect width="140" height="140" rx="24" fill="%23141722"/><rect x="25" y="40" width="90" height="65" rx="10" stroke="%23f59e0b" stroke-width="4" fill="%231c202d"/><path d="M25 60H115M70 40V105" stroke="%23f59e0b" stroke-width="3" stroke-dasharray="4 2"/></svg>`;

export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, isCase: boolean = false) => {
  const target = e.currentTarget;
  target.onerror = null; // Infinite loop bo'lishini 100% to'xtatadi
  target.src = isCase ? SVG_FALLBACK_CASE : SVG_FALLBACK_SKIN;
};
