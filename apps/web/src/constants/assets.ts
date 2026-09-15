import React from 'react';

// Sleek high-tech CS2 weapon placeholder with subtle gradient and glow
export const SVG_FALLBACK_SKIN = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120" fill="none"><rect width="200" height="120" rx="16" fill="%230e111a"/><path d="M40 70L80 50L130 50L165 42L160 55L140 60L125 58L105 75L70 75L55 85L40 70Z" fill="%23f59e0b" fill-opacity="0.2" stroke="%23f59e0b" stroke-width="2" stroke-linejoin="round"/><circle cx="100" cy="60" r="40" fill="%23f59e0b" fill-opacity="0.05"/></svg>`;

export const SVG_FALLBACK_CASE = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 140" fill="none"><rect width="160" height="140" rx="20" fill="%230e111a"/><rect x="25" y="35" width="110" height="75" rx="12" fill="%23171b28" stroke="%23f59e0b" stroke-width="2.5"/><path d="M25 60H135M80 35V110" stroke="%23f59e0b" stroke-width="2" stroke-dasharray="4 3"/><circle cx="80" cy="72" r="10" fill="%23f59e0b" fill-opacity="0.3"/></svg>`;

export const DEFAULT_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none"><rect width="80" height="80" rx="16" fill="%23151824"/><circle cx="40" cy="32" r="14" fill="%23f59e0b" fill-opacity="0.8"/><path d="M18 64C18 52 28 48 40 48C52 48 62 52 62 64" fill="%23f59e0b" fill-opacity="0.6"/></svg>`;

export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>, isCase: boolean = false) => {
  const target = e.currentTarget;
  target.onerror = null; // Infinite loop bo'lishini 100% to'xtatadi
  target.src = isCase ? SVG_FALLBACK_CASE : SVG_FALLBACK_SKIN;
};
