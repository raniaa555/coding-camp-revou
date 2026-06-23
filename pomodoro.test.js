// Feature: pomodoro-study-tracker
// Tests for pure utility functions defined in logic.js (mirrored in index.html)

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { formatHHMMSS, formatMMSS } from './logic.js';

// ─── Unit Tests: formatHHMMSS ────────────────────────────────────────────────

describe('formatHHMMSS – unit tests', () => {
  it('formatHHMMSS(3661) === "01:01:01"', () => {
    expect(formatHHMMSS(3661)).toBe('01:01:01');
  });

  it('formatHHMMSS(0) === "00:00:00"', () => {
    expect(formatHHMMSS(0)).toBe('00:00:00');
  });

  it('formatHHMMSS(3600) === "01:00:00"', () => {
    expect(formatHHMMSS(3600)).toBe('01:00:00');
  });

  it('formatHHMMSS(59) === "00:00:59"', () => {
    expect(formatHHMMSS(59)).toBe('00:00:59');
  });

  it('formatHHMMSS(3599) === "00:59:59"', () => {
    expect(formatHHMMSS(3599)).toBe('00:59:59');
  });

  it('formatHHMMSS(359999) === "99:59:59" (maximum valid input)', () => {
    expect(formatHHMMSS(359999)).toBe('99:59:59');
  });
});

// ─── Property-Based Test: formatHHMMSS ──────────────────────────────────────
// Feature: pomodoro-study-tracker, Property 6: HH:MM:SS Format Correctness
// Validates: Requirements 4.1

describe('formatHHMMSS – property-based tests', () => {
  it('Property 6: result matches HH:MM:SS pattern and round-trips back to the input seconds', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 359999 }),
        (totalSeconds) => {
          const result = formatHHMMSS(totalSeconds);

          // Must match two-digit HH:MM:SS pattern
          expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);

          // Round-trip: parsing the output back must equal the input
          const [hh, mm, ss] = result.split(':').map(Number);
          expect(hh * 3600 + mm * 60 + ss).toBe(totalSeconds);

          // Each segment must be in its valid range
          expect(mm).toBeGreaterThanOrEqual(0);
          expect(mm).toBeLessThanOrEqual(59);
          expect(ss).toBeGreaterThanOrEqual(0);
          expect(ss).toBeLessThanOrEqual(59);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// ─── Unit Tests: formatMMSS ──────────────────────────────────────────────────

describe('formatMMSS – unit tests', () => {
  it('formatMMSS(1500) === "25:00"', () => {
    expect(formatMMSS(1500)).toBe('25:00');
  });

  it('formatMMSS(0) === "00:00"', () => {
    expect(formatMMSS(0)).toBe('00:00');
  });

  it('formatMMSS(65) === "01:05"', () => {
    expect(formatMMSS(65)).toBe('01:05');
  });
});
