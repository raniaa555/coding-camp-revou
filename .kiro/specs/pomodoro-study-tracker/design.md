# Design Document: Pomodoro Study Tracker

## Overview

The Pomodoro Study Tracker is a self-contained single-page web application delivered as one HTML file. It implements the Pomodoro technique — 25-minute focused work sessions — with per-subject time tracking and a visually rich dark glassmorphism UI. The entire application runs client-side with no build step, no server, and no external JavaScript dependencies beyond Tailwind CSS loaded from CDN.

The design prioritizes:
- **Simplicity**: All logic in a single HTML file using Vanilla JS
- **Correctness**: Clear separation between timer state, subject state, and rendering
- **Aesthetics**: Dark glassmorphism design with three selectable themes

---

## Architecture

The application follows a simple **state → render** loop pattern common in Vanilla JS single-file apps:

```
User Event → State Mutation → Re-render UI
```

There is no virtual DOM or reactive framework. State is held in a plain JavaScript object. Each user interaction mutates that state object, then a `render()` function reads it and updates the DOM accordingly.

A `setInterval` tick drives both the Pomodoro countdown and the per-subject count-up timer, firing every 1000ms while the timer is running.

```
┌─────────────────────────────────────────┐
│                App State                │
│  pomodoroSecondsLeft  (number)          │
│  isRunning            (boolean)         │
│  activeSubject        (string | null)   │
│  subjectTimes         (Record<string,   │
│                          number>)       │
│  currentTheme         (ThemeName)       │
│  sessionComplete      (boolean)         │
│  notificationVisible  (boolean)         │
└──────────────┬──────────────────────────┘
               │  mutated by
               ▼
┌─────────────────────────────────────────┐
│              Event Handlers             │
│  onStartPause(), onReset()              │
│  onSelectSubject(name)                  │
│  onSelectTheme(theme)                   │
│  onDismissNotification()                │
│  onTick()    ← setInterval every 1000ms │
└──────────────┬──────────────────────────┘
               │  calls
               ▼
┌─────────────────────────────────────────┐
│               render()                  │
│  Updates DOM based on current state     │
│  (timer display, button label,          │
│   subject list, theme classes,          │
│   notification banner)                  │
└─────────────────────────────────────────┘
```

---

## Components and Interfaces

### 1. Pomodoro Timer Display

- Renders `pomodoroSecondsLeft` as `MM:SS` string
- Font size ≥ 48px, prominent center position
- Updates on every tick

**Format function interface:**
```js
// formatMMSS(totalSeconds: number): string
// e.g. formatMMSS(1500) → "25:00"
// e.g. formatMMSS(65)   → "01:05"
// e.g. formatMMSS(0)    → "00:00"
```

### 2. Timer Controls

- **Start/Pause button**: label reflects `isRunning` state
  - `isRunning === true` → label = "Pause"
  - `isRunning === false` → label = "Start"
- **Reset button**: always visible, resets timer and stops all subject timers

### 3. Theme Selector

- Three buttons: Focus, Classic, Dark Academia
- Active theme button has a distinct visual marker (underline / ring)
- Clicking a button calls `onSelectTheme(name)` which:
  1. Updates `currentTheme` in state
  2. Swaps CSS custom property overrides or Tailwind classes on `<body>` / root element

**Theme color palettes:**

| Theme         | Background           | Accent              |
|---------------|----------------------|---------------------|
| Focus         | Dark slate (#0f172a) | Deep red (#991b1b)  |
| Classic       | Neutral dark (#1c1917)| Muted taupe (#78716c)|
| Dark Academia | Warm brown (#1c1009) | Gold (#b45309)      |

### 4. Subject List

- Four hardcoded subjects: `["Matematika", "Bahasa Indonesia", "Bahasa Inggris", "Coding"]`
- Each item displays:
  - Subject name
  - Subject_Timer in `HH:MM:SS` format
  - Active indicator (highlighted border / background) if it is the `activeSubject`
- Click/tap calls `onSelectSubject(name)`

**Format function interface:**
```js
// formatHHMMSS(totalSeconds: number): string
// e.g. formatHHMMSS(3661) → "01:01:01"
// e.g. formatHHMMSS(0)    → "00:00:00"
```

### 5. Notification Banner

- Appears when `notificationVisible === true`
- "Session complete! Great work 🎉" message with dismiss (×) button
- Persists across state changes (pause, theme switch, subject selection)
- Dismissed by clicking × or activating Reset

### 6. Audio Alert

- A short beep/chime played exactly once when `pomodoroSecondsLeft` reaches 0
- Implemented using the Web Audio API (`AudioContext`) — no external audio file needed
- Generated programmatically: a brief oscillator tone (~440Hz, ~0.5s)

---

## Data Models

### Application State

```js
const state = {
  // Pomodoro timer: remaining seconds, 1500 = 25:00
  pomodoroSecondsLeft: 1500,

  // Whether the interval tick is active
  isRunning: false,

  // Name of currently selected subject, or null if none selected
  activeSubject: null, // "Matematika" | "Bahasa Indonesia" | "Bahasa Inggris" | "Coding" | null

  // Accumulated elapsed seconds per subject
  subjectTimes: {
    "Matematika": 0,
    "Bahasa Indonesia": 0,
    "Bahasa Inggris": 0,
    "Coding": 0,
  },

  // Active visual theme
  currentTheme: "focus", // "focus" | "classic" | "dark-academia"

  // Whether the session-complete notification should be shown
  notificationVisible: false,

  // Whether the pomodoro has reached 00:00 in this cycle
  sessionComplete: false,
};
```

### Constants

```js
const WORK_DURATION_SECONDS = 1500; // 25 minutes
const SUBJECTS = ["Matematika", "Bahasa Indonesia", "Bahasa Inggris", "Coding"];

const THEMES = {
  focus: {
    name: "Focus",
    bgColor: "#0f172a",
    accentColor: "#991b1b",
  },
  classic: {
    name: "Classic",
    bgColor: "#1c1917",
    accentColor: "#78716c",
  },
  "dark-academia": {
    name: "Dark Academia",
    bgColor: "#1c1009",
    accentColor: "#b45309",
  },
};
```

### Timer Tick Logic

```js
function onTick() {
  if (!state.isRunning) return;

  // Countdown
  if (state.pomodoroSecondsLeft > 0) {
    state.pomodoroSecondsLeft -= 1;
  }

  // Count-up subject timer
  if (state.pomodoroSecondsLeft > 0 && state.activeSubject !== null) {
    state.subjectTimes[state.activeSubject] += 1;
  }

  // Session complete trigger
  if (state.pomodoroSecondsLeft === 0 && !state.sessionComplete) {
    state.isRunning = false;
    state.sessionComplete = true;
    state.notificationVisible = true;
    playAlertSound();
    clearInterval(tickInterval);
  }

  render();
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Timer Tick Decrement and Floor

*For any* Pomodoro timer state with `isRunning = true` and `pomodoroSecondsLeft = N`, after one tick:
- If `N > 0`, then `pomodoroSecondsLeft` SHALL equal `N - 1`
- If `N = 0`, then `pomodoroSecondsLeft` SHALL remain `0` (never negative)

**Validates: Requirements 1.3, 1.4**

---

### Property 2: Notification Persistence Through Arbitrary Actions

*For any* app state where `notificationVisible = true`, applying any sequence of non-dismiss and non-reset actions (pause, theme change, subject selection) SHALL leave `notificationVisible` still `true`.

**Validates: Requirements 1.7**

---

### Property 3: Start/Pause Button Label Reflects Running State

*For any* app state, the Start/Pause button label SHALL be exactly `"Pause"` when `isRunning = true`, and exactly `"Start"` when `isRunning = false`. No other label values are valid.

**Validates: Requirements 2.6, 2.7**

---

### Property 4: Subject Selection Exclusivity and Idempotence

*For any* valid subject name `S` in the subjects list, calling `onSelectSubject(S)`:
- Sets `activeSubject = S`
- All other subjects have no active indicator
- Calling `onSelectSubject(S)` again (selecting the same subject) produces an identical state (idempotence)

**Validates: Requirements 3.4, 3.5, 3.6**

---

### Property 5: Subject Timer Increments Only Under Active Conditions

*For any* app state after one tick:
- If `isRunning = true` AND `activeSubject = S` (not null) AND `pomodoroSecondsLeft > 0`, then `subjectTimes[S]` SHALL be incremented by exactly 1 and no other subject timer SHALL change
- If `isRunning = false` OR `activeSubject = null`, then ALL `subjectTimes` values SHALL remain unchanged

**Validates: Requirements 4.3, 4.5, 4.6, 4.7**

---

### Property 6: HH:MM:SS Format Correctness

*For any* non-negative integer `seconds`, `formatHHMMSS(seconds)` SHALL return a string that:
- Matches the pattern `HH:MM:SS` (two-digit hours, two-digit minutes, two-digit seconds separated by colons)
- Correctly represents the total number of seconds (i.e., `HH * 3600 + MM * 60 + SS = seconds`)

**Validates: Requirements 4.1**

---

### Property 7: Theme Selection Correctness

*For any* valid theme name `T`, after `onSelectTheme(T)`:
- `currentTheme = T`
- Exactly one theme in the theme selector has the active marker (the one matching `T`)
- For any invalid theme name (not one of the three defined themes), `currentTheme` SHALL remain unchanged

**Validates: Requirements 5.4, 5.5, 5.9**

---

## Error Handling

### Theme Application Failure
- If `onSelectTheme` is called with an unrecognized theme key, the function SHALL log a warning to the console and leave `currentTheme` unchanged
- The UI SHALL remain in its current valid state

### Audio Playback Failure
- If `AudioContext` is unavailable (e.g., browser policy blocks autoplay), the alert sound is silently skipped
- The notification banner still appears — audio is enhancement only, not required for session completion
- No error is shown to the user for audio failure

### Invalid Subject Selection
- If `onSelectSubject` is called with a name not in `SUBJECTS`, the function SHALL ignore the call and leave `activeSubject` unchanged
- This handles any edge case from programmatic calls or keyboard navigation

### Timer Edge Cases
- `onTick` is a no-op when `isRunning = false` (guard clause at top)
- If `sessionComplete = true` and tick fires before the interval is cleared, the floor guard ensures `pomodoroSecondsLeft` stays at 0
- `setInterval` handle is stored in a variable; `clearInterval` is always called in `onReset` and on session completion to prevent multiple intervals running simultaneously

---

## Testing Strategy

This feature is a single-file Vanilla JS app with no build toolchain. Testing strategy uses:

### Unit + Property-Based Tests (Logic Layer)

The pure logic functions and state mutation handlers are extracted and testable in isolation using a test harness like [fast-check](https://fast-check.dev) (or Hypothesis if ported to Python for demonstration). Since the app is Vanilla JS, tests run using Node.js with a minimal test runner (e.g., `node --test` built-in runner or Vitest).

**PBT library**: [fast-check](https://fast-check.dev) for JavaScript/Node.js

Each property test runs a minimum of **100 iterations** with randomly generated inputs.

**Property tests** (from Correctness Properties section):

| Property | Test Description | fast-check Arbitraries |
|---|---|---|
| Property 1 | Timer tick decrement + floor | `fc.integer({min: 0, max: 1500})` for pomodoroSecondsLeft |
| Property 2 | Notification persists through actions | `fc.array(fc.oneof(pauseAction, themeAction, subjectAction))` |
| Property 3 | Button label matches isRunning | `fc.boolean()` for isRunning |
| Property 4 | Subject selection exclusivity + idempotence | `fc.constantFrom(...SUBJECTS)` |
| Property 5 | Subject timer increments correctly | `fc.record({isRunning: fc.boolean(), activeSubject: fc.option(fc.constantFrom(...SUBJECTS)), pomodoroSecondsLeft: fc.integer({min: 0, max: 1500})})` |
| Property 6 | formatHHMMSS correctness | `fc.integer({min: 0, max: 359999})` (up to 99:59:59) |
| Property 7 | Theme selection correctness | `fc.constantFrom(...Object.keys(THEMES))` plus `fc.string()` for invalid names |

Tag format for each test: `// Feature: pomodoro-study-tracker, Property N: <property_text>`

**Unit tests** (example-based, for specific behaviors):

- Initial state: `pomodoroSecondsLeft === 1500`, `isRunning === false`, `activeSubject === null`, all subject timers at 0, `currentTheme === "focus"`
- `onStartPause()` from stopped → `isRunning === true`
- `onStartPause()` from running → `isRunning === false`, timer value unchanged
- `onReset()` → `pomodoroSecondsLeft === 1500`, `isRunning === false`, `notificationVisible === false`
- `playAlertSound` mock called exactly once when `pomodoroSecondsLeft` reaches 0
- `formatMMSS(1500) === "25:00"`, `formatMMSS(0) === "00:00"`, `formatMMSS(65) === "01:05"`
- `formatHHMMSS(3661) === "01:01:01"`, `formatHHMMSS(0) === "00:00:00"`

### Smoke / Visual Tests

Visual and layout requirements (Requirement 6, 7, and UI aspects of 1–5) are verified manually or via browser-based inspection:

- Single HTML file loads without errors in a modern browser (Chrome/Firefox/Safari)
- Timer displays at ≥ 48px font size
- All three themes visibly change the color palette
- App is functional on mobile viewport (< 640px width) — no horizontal scroll
- Glassmorphism containers have backdrop-filter blur visible
- Contrast ratio of text meets 4.5:1 (verified with browser accessibility tools or Lighthouse)
- Audio alert fires exactly once on session completion

### Integration Checks

- `setInterval` does not accumulate duplicates across multiple Start/Pause cycles (verified by inspecting tick count in browser dev tools)
- `AudioContext` fallback is graceful in environments that block autoplay
