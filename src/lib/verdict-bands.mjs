/**
 * The canonical verdict bands — single source for the rubric thresholds that
 * previously lived in three places (content.config.ts, build-creators.mjs,
 * CLAUDE.md prose) with nothing enforcing agreement.
 * 90–100 ESSENTIAL · 80–89 EXCELLENT · 70–79 GOOD · 60–69 AVERAGE ·
 * 50–59 MEDIOCRE · <50 GAME OVER.
 */

export const VERDICTS = ['ESSENTIAL', 'EXCELLENT', 'GOOD', 'AVERAGE', 'MEDIOCRE', 'GAME OVER'];

export const VERDICT_BANDS = [
  { min: 90, verdict: 'ESSENTIAL' },
  { min: 80, verdict: 'EXCELLENT' },
  { min: 70, verdict: 'GOOD' },
  { min: 60, verdict: 'AVERAGE' },
  { min: 50, verdict: 'MEDIOCRE' },
  { min: 0, verdict: 'GAME OVER' },
];

export function verdictFor(score) {
  if (score == null) return null;
  return VERDICT_BANDS.find((b) => score >= b.min).verdict;
}
