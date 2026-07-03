/**
 * Shared neon palette + XML escaping for the painted splash-cover pipeline.
 * Tiny and dependency-free so tests and SVG builders can both import it.
 */

export const NEON = {
  bg0: '#0A0A12',
  bg1: '#1a0a2e',
  cyan: '#00F0FF',
  magenta: '#FF00AA',
  yellow: '#FFE600',
  green: '#39FF14',
  orange: '#FF6B00',
  red: '#FF2244',
  text: '#E0E0E8',
  dark: '#0A0A12',
};

/** Escape the five XML entities so dynamic text is safe inside SVG. */
export { escapeXml } from './escape.mjs';
