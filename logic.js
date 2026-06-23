/**
 * logic.js — Pure utility functions extracted from the Pomodoro Study Tracker.
 * These are imported by the test suite and kept in sync with index.html's <script> block.
 */

/**
 * Formats a total number of seconds into a "MM:SS" string.
 * @param {number} totalSeconds - Non-negative integer number of seconds.
 * @returns {string} Zero-padded MM:SS, e.g. "25:00", "01:05".
 */
export function formatMMSS(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
}

/**
 * Formats a total number of seconds into a "HH:MM:SS" string.
 * @param {number} totalSeconds - Non-negative integer, 0 – 359999.
 * @returns {string} Zero-padded HH:MM:SS, e.g. "01:01:01", "00:00:00".
 */
export function formatHHMMSS(totalSeconds) {
  const hh = Math.floor(totalSeconds / 3600);
  const mm = Math.floor((totalSeconds % 3600) / 60);
  const ss = totalSeconds % 60;
  return (
    String(hh).padStart(2, '0') + ':' +
    String(mm).padStart(2, '0') + ':' +
    String(ss).padStart(2, '0')
  );
}
