# Implementation Plan: Pomodoro Study Tracker

## Overview

Implement a self-contained single-page Pomodoro study tracker as a single HTML file using Vanilla JavaScript and Tailwind CSS via CDN. The implementation follows a state → render loop pattern, building up from pure logic functions, through state management, to the full UI and theming system.

## Tasks

- [-] 1. Set up project file and core constants
  - Create `index.html` with the basic HTML5 scaffold, Tailwind CSS CDN link, and a `<script>` block for all application logic
  - Define the `WORK_DURATION_SECONDS`, `SUBJECTS`, and `THEMES` constants matching the design specification
  - Define the initial `state` object with all fields: `pomodoroSecondsLeft`, `isRunning`, `activeSubject`, `subjectTimes`, `currentTheme`, `sessionComplete`, `notificationVisible`
  - _Requirements: 1.2, 2.4, 3.1, 4.2, 5.2_

- [ ] 2. Implement pure formatting and logic functions
  - [-] 2.1 Implement `formatMMSS(totalSeconds)` function
    - Returns a two-digit minute and two-digit second string separated by a colon
    - Handles inputs from 0 to 1500 (and beyond) correctly
    - _Requirements: 1.1_

  - [ ]* 2.2 Write property test for `formatMMSS` correctness
    - **Property 6 (MM:SS variant)**: `formatMMSS` returns a correctly structured `MM:SS` string for any non-negative integer input
    - Use `fc.integer({ min: 0, max: 5999 })` as arbitrary
    - Assert pattern match `/^\d{2}:\d{2}$/` and round-trip: `MM * 60 + SS === seconds`
    - **Validates: Requirements 1.1**

  - [-] 2.3 Implement `formatHHMMSS(totalSeconds)` function
    - Returns a two-digit hour, two-digit minute, two-digit second string separated by colons
    - Handles inputs from 0 to 359999 (99:59:59) correctly
    - _Requirements: 4.1_

  - [ ]* 2.4 Write property test for `formatHHMMSS` correctness
    - **Property 6: HH:MM:SS Format Correctness**
    - Use `fc.integer({ min: 0, max: 359999 })` as arbitrary
    - Assert pattern match `/^\d{2}:\d{2}:\d{2}$/` and round-trip: `HH * 3600 + MM * 60 + SS === seconds`
    - **Validates: Requirements 4.1**

- [ ] 3. Implement timer tick and session completion logic
  - [~] 3.1 Implement `onTick()` function
    - Decrements `pomodoroSecondsLeft` by 1 when `isRunning` and `pomodoroSecondsLeft > 0`; holds at 0 otherwise
    - Increments `subjectTimes[activeSubject]` by 1 only when `isRunning`, `activeSubject !== null`, and `pomodoroSecondsLeft > 0`
    - Triggers session completion (sets `isRunning = false`, `sessionComplete = true`, `notificationVisible = true`, calls `playAlertSound`, calls `clearInterval`) when `pomodoroSecondsLeft === 0` and `!sessionComplete`
    - _Requirements: 1.3, 1.4, 1.5, 4.3, 4.5, 4.6, 4.7_

  - [ ]* 3.2 Write property test for timer tick decrement and floor (Property 1)
    - **Property 1: Timer Tick Decrement and Floor**
    - Use `fc.integer({ min: 0, max: 1500 })` for `pomodoroSecondsLeft`, `fc.boolean()` for `isRunning`
    - Assert: if `isRunning` and `N > 0`, after one tick `pomodoroSecondsLeft === N - 1`; if `N === 0`, stays at 0
    - **Validates: Requirements 1.3, 1.4**

  - [ ]* 3.3 Write property test for subject timer increments (Property 5)
    - **Property 5: Subject Timer Increments Only Under Active Conditions**
    - Use `fc.record({ isRunning: fc.boolean(), activeSubject: fc.option(fc.constantFrom(...SUBJECTS)), pomodoroSecondsLeft: fc.integer({ min: 0, max: 1500 }) })`
    - Assert: only `subjectTimes[activeSubject]` increments (by exactly 1) when conditions are met; all others unchanged
    - **Validates: Requirements 4.3, 4.5, 4.6, 4.7**

- [~] 4. Checkpoint — Ensure all logic function tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement event handlers for timer controls and notification
  - [~] 5.1 Implement `onStartPause()` handler
    - Toggles `isRunning`: starts `setInterval(onTick, 1000)` and stores handle when starting; calls `clearInterval` when pausing
    - Does nothing if `sessionComplete === true`
    - _Requirements: 2.2, 2.3_

  - [ ]* 5.2 Write property test for Start/Pause button label (Property 3)
    - **Property 3: Start/Pause Button Label Reflects Running State**
    - Use `fc.boolean()` for `isRunning`
    - Assert: button label is exactly `"Pause"` when `isRunning === true`, exactly `"Start"` when `isRunning === false`
    - **Validates: Requirements 2.6, 2.7**

  - [~] 5.3 Implement `onReset()` handler
    - Resets `pomodoroSecondsLeft` to `WORK_DURATION_SECONDS`, sets `isRunning = false`, `sessionComplete = false`, `notificationVisible = false`
    - Calls `clearInterval` to stop any running tick interval
    - _Requirements: 2.4, 2.5, 1.7_

  - [~] 5.4 Implement `onDismissNotification()` handler
    - Sets `notificationVisible = false` and calls `render()`
    - _Requirements: 1.5_

  - [ ]* 5.5 Write property test for notification persistence (Property 2)
    - **Property 2: Notification Persistence Through Arbitrary Actions**
    - Use `fc.array(fc.oneof(fc.constant('pause'), fc.constantFrom(...Object.keys(THEMES)), fc.constantFrom(...SUBJECTS)))` as action sequence
    - Assert: if `notificationVisible === true` before the sequence, it remains `true` after all non-dismiss, non-reset actions
    - **Validates: Requirements 1.7**

- [ ] 6. Implement subject selection and theme selection handlers
  - [~] 6.1 Implement `onSelectSubject(name)` handler
    - Sets `activeSubject = name` only if `name` is in `SUBJECTS`; ignores invalid names
    - _Requirements: 3.2, 3.4, 3.5, 3.6_

  - [ ]* 6.2 Write property test for subject selection exclusivity and idempotence (Property 4)
    - **Property 4: Subject Selection Exclusivity and Idempotence**
    - Use `fc.constantFrom(...SUBJECTS)` for subject name
    - Assert: after `onSelectSubject(S)`, `activeSubject === S`; calling twice gives identical result
    - **Validates: Requirements 3.4, 3.5, 3.6**

  - [~] 6.3 Implement `onSelectTheme(theme)` handler
    - Sets `currentTheme = theme` when `theme` is a valid key in `THEMES`; logs warning and leaves state unchanged for invalid keys
    - _Requirements: 5.3, 5.4, 5.9_

  - [ ]* 6.4 Write property test for theme selection correctness (Property 7)
    - **Property 7: Theme Selection Correctness**
    - Use `fc.constantFrom(...Object.keys(THEMES))` for valid themes and `fc.string()` for potentially invalid names
    - Assert: valid theme → `currentTheme === T`; invalid theme → `currentTheme` unchanged
    - **Validates: Requirements 5.4, 5.5, 5.9**

- [~] 7. Implement `playAlertSound()` using Web Audio API
  - Create an `AudioContext` and generate a brief oscillator tone (~440 Hz, ~0.5s) that plays exactly once on session completion
  - Wrap in try/catch so audio failure is silently swallowed without affecting notification display
  - _Requirements: 1.6_

- [~] 8. Checkpoint — Ensure all handler and audio tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement the `render()` function and DOM structure
  - [~] 9.1 Build the HTML skeleton inside `<body>`
    - Add a full-page background `<div>` driven by `currentTheme`
    - Add a centered main content column containing: timer display, controls row, theme selector row, and subject list section
    - Apply Tailwind utility classes for layout, spacing, and glassmorphism containers (semi-transparent background, `backdrop-blur`, rounded corners, low-opacity border)
    - _Requirements: 6.1, 6.2, 7.1, 7.2, 7.3_

  - [~] 9.2 Implement `render()` — timer and controls section
    - Write the `render()` function that reads `state` and updates the DOM imperatively (no framework)
    - Update the timer display element with `formatMMSS(state.pomodoroSecondsLeft)` at ≥ 48px font size
    - Update Start/Pause button label to `"Pause"` or `"Start"` based on `state.isRunning`
    - _Requirements: 1.1, 2.6, 2.7, 6.4_

  - [~] 9.3 Implement `render()` — notification banner
    - Show the notification banner `<div>` when `state.notificationVisible === true`, hide it otherwise
    - Include a dismiss `×` button that calls `onDismissNotification()`
    - _Requirements: 1.5, 1.7_

  - [~] 9.4 Implement `render()` — subject list
    - Render each subject in `SUBJECTS` with its `formatHHMMSS(state.subjectTimes[subject])` time
    - Apply active indicator styles (highlighted border/background) to the item matching `state.activeSubject`
    - Attach `onclick` calling `onSelectSubject(name)` to each item
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1_

  - [~] 9.5 Implement `render()` — theme selector
    - Render three theme buttons (Focus, Classic, Dark Academia)
    - Apply active marker (ring, underline, or highlight) to the button matching `state.currentTheme`
    - Attach `onclick` calling `onSelectTheme(key)` to each button
    - _Requirements: 5.1, 5.4, 5.5_

- [~] 10. Implement the theming system (CSS custom properties / class swaps)
  - Define CSS custom properties or Tailwind arbitrary-value classes for each theme's `bgColor` and `accentColor`
  - Apply the active theme by swapping a class or data attribute on `<body>` (or a root wrapper) in `onSelectTheme` and on initial load
  - Ensure theme transition is visually instantaneous (well within 300ms)
  - Apply the Focus theme palette on initial load
  - _Requirements: 5.2, 5.3, 5.6, 5.7, 5.8, 5.9_

- [~] 11. Apply responsive layout and accessibility
  - Add a Tailwind responsive breakpoint so layout reflows gracefully below 640px (no horizontal scroll, all controls reachable)
  - Ensure body text is ≥ 16px and timer digits are the largest text on the page at ≥ 48px
  - Verify all glassmorphism containers use `backdrop-filter: blur(8px+)`, corner radii ≥ 8px, and border opacity ≤ 0.3
  - _Requirements: 6.2, 6.3, 6.4, 7.4_

- [~] 12. Wire everything together and initialize the app
  - Call `render()` once on page load to populate the initial UI from `state`
  - Confirm all event handlers are attached to their respective DOM elements
  - Confirm `setInterval` / `clearInterval` lifecycle is correct across multiple Start → Pause → Reset cycles (no duplicate intervals)
  - _Requirements: 1.2, 2.1, 4.2, 5.2_

- [~] 13. Final checkpoint — Ensure all tests pass and the app runs correctly in a browser
  - Ensure all automated tests pass, ask the user if questions arise.
  - Verify the single HTML file opens in a modern browser with no console errors and all features working end-to-end.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- The design specifies **fast-check** as the PBT library; run tests with Node.js (`node --test` or Vitest `--run` mode)
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation throughout the build
- Property tests validate universal correctness properties; unit tests validate specific examples and edge cases
- The entire deliverable is a **single HTML file** — no build step, no bundler, no server required

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["2.1", "2.3"] },
    { "id": 1, "tasks": ["2.2", "2.4", "3.1"] },
    { "id": 2, "tasks": ["3.2", "3.3", "5.1", "5.3", "5.4", "6.1", "6.3", "7"] },
    { "id": 3, "tasks": ["5.2", "5.5", "6.2", "6.4", "9.1"] },
    { "id": 4, "tasks": ["9.2", "9.3", "9.4", "9.5", "10"] },
    { "id": 5, "tasks": ["11"] },
    { "id": 6, "tasks": ["12"] }
  ]
}
```
