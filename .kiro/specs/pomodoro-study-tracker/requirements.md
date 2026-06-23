# Requirements Document

## Introduction

A single-page Pomodoro study tracker web application built with HTML5, Tailwind CSS (via CDN), and Vanilla JavaScript — all contained in a single HTML file. The app helps students manage focused study sessions using the Pomodoro technique, tracking time spent on individual subjects with a visually rich dark glassmorphism interface featuring a university-inspired aesthetic.

## Glossary

- **App**: The single-page Pomodoro study tracker web application
- **Pomodoro_Timer**: The central countdown timer that starts at 25:00 and counts down to 0:00
- **Subject_Timer**: The per-subject elapsed time counter that starts at 0:00:00 and counts upward
- **Active_Subject**: The study subject currently selected by the user and accumulating time
- **Session**: A single Pomodoro countdown cycle from 25:00 to 0:00
- **Theme**: A visual mode (Focus, Classic, or Dark Academia) that changes the color palette and styling of the App
- **Controls**: The Start/Pause and Reset buttons that operate the Pomodoro_Timer

## Requirements

---

### Requirement 1: Pomodoro Countdown Timer

**User Story:** As a student, I want a central countdown timer that starts at 25:00, so that I can time my focused study sessions using the Pomodoro technique.

#### Acceptance Criteria

1. THE App SHALL display the Pomodoro_Timer as the first visible element above all other page content, showing the time in MM:SS format.
2. THE Pomodoro_Timer SHALL initialize to 25:00 when the App first loads.
3. WHILE the Pomodoro_Timer is running, THE App SHALL decrement the displayed time by one second each second.
4. WHEN the Pomodoro_Timer reaches 00:00, THE App SHALL stop the countdown and not decrement below 00:00.
5. WHEN the Pomodoro_Timer reaches 00:00, THE App SHALL display a visual notification banner that persists until the user dismisses it or the timer is reset.
6. WHEN the Pomodoro_Timer reaches 00:00, THE App SHALL play an audible alert sound exactly once.
7. THE App SHALL keep the visual notification visible regardless of subsequent state changes (pause, theme switch, subject selection) until explicitly dismissed or timer is reset.

---

### Requirement 2: Timer Controls

**User Story:** As a student, I want Start/Pause and Reset buttons, so that I can control my Pomodoro session as needed.

#### Acceptance Criteria

1. THE App SHALL display a Start/Pause button and a Reset button below the Pomodoro_Timer.
2. WHEN the Pomodoro_Timer is stopped and the user activates the Start/Pause button, THE App SHALL begin counting down the Pomodoro_Timer.
3. WHEN the Pomodoro_Timer is running and the user activates the Start/Pause button, THE App SHALL pause the Pomodoro_Timer without resetting it.
4. WHEN the user activates the Reset button, THE App SHALL reset the Pomodoro_Timer to the configured work session duration (25:00) and ensure the timer is in a stopped state.
5. WHEN the user activates the Reset button, THE App SHALL stop any running Subject_Timer for the Active_Subject; if no Subject_Timer is running, the Reset button SHALL have no effect on Subject_Timers.
6. WHILE the Pomodoro_Timer is in a stopped or never-started state, THE App SHALL display the Start/Pause button label as "Start".
7. WHILE the Pomodoro_Timer is running, THE App SHALL display the Start/Pause button label as "Pause".

---

### Requirement 3: Subject List Display

**User Story:** As a student, I want to see a list of study subjects, so that I can select which subject I am currently studying.

#### Acceptance Criteria

1. THE App SHALL display a list of four study subjects below the Controls: Matematika, Bahasa Indonesia, Bahasa Inggris, and Coding.
2. THE App SHALL render each subject as an item that responds to click or tap interaction to become the Active_Subject.
3. WHEN no subject has been selected, THE App SHALL display all subjects with no selection indicator present and all subjects appearing visually identical to one another.
4. WHEN the user selects a subject, THE App SHALL apply a visible selection indicator to the Active_Subject and ensure no selection indicator is present on any other subject.
5. WHEN the user selects a different subject while one is already Active, THE App SHALL remove the selection indicator from the previously Active_Subject and apply it to the newly selected subject.
6. WHEN the user selects the subject that is already the Active_Subject, THE App SHALL keep the selection indicator on that subject with no change to any other subject.

---

### Requirement 4: Per-Subject Time Tracking

**User Story:** As a student, I want each subject to have its own time counter, so that I can see how much total time I have spent studying each subject.

#### Acceptance Criteria

1. THE App SHALL display a Subject_Timer in HH:MM:SS format next to each subject in the list.
2. WHEN the App first loads, THE App SHALL initialize each Subject_Timer to 00:00:00; Subject_Timers then accumulate time and are not reset automatically.
3. WHILE the Pomodoro_Timer is in an active work session (counting down) and a subject is the Active_Subject, THE App SHALL increment that subject's Subject_Timer by one second each second.
4. WHEN the Pomodoro_Timer is paused, THE App SHALL stop incrementing the Active_Subject's Subject_Timer.
5. WHEN the user changes the Active_Subject while the Pomodoro_Timer is in an active work session, THE App SHALL stop incrementing the previous subject's Subject_Timer and begin incrementing the new Active_Subject's Subject_Timer.
6. IF the Pomodoro_Timer is not in an active work session (stopped, paused, or completed), THEN THE App SHALL not increment any Subject_Timer regardless of which subject is selected.
7. IF the Pomodoro_Timer starts an active work session and no Active_Subject has been selected, THEN THE App SHALL not increment any Subject_Timer until the user selects a subject.

---

### Requirement 5: Visual Theming System

**User Story:** As a student, I want to choose from three visual themes, so that I can personalize the app to match my study environment and mood.

#### Acceptance Criteria

1. THE App SHALL provide three selectable themes: Focus, Classic, and Dark Academia.
2. WHEN the App first loads, THE App SHALL apply the Focus theme as the active theme.
3. WHEN the user selects a theme, THE App SHALL update the entire page's color palette and visual style to reflect the chosen theme within 300ms without a page reload.
4. IF a theme selection fails to apply, THEN THE App SHALL retain the currently active theme and display an error message stating that the theme could not be applied.
5. THE App SHALL display a distinct visual marker (such as a highlight, underline, or active indicator) on the currently active theme in the theme selector, and this marker SHALL be absent on all other themes.
6. WHILE the Focus theme is active, THE App SHALL apply the Focus predefined color palette (dark slate background with deep red/maroon accent colors).
7. WHILE the Classic theme is active, THE App SHALL apply the Classic predefined color palette (neutral muted tones evoking a traditional academic aesthetic).
8. WHILE the Dark Academia theme is active, THE App SHALL apply the Dark Academia predefined color palette (warm dark brown and gold tones evoking a vintage university library aesthetic).
9. WHEN the user selects a theme, THE App SHALL retain that theme as the active theme for the remainder of the session unless the user selects a different theme.

---

### Requirement 6: Glassmorphism UI Design

**User Story:** As a student, I want an elegant dark glassmorphism interface, so that the app provides a focused and visually appealing study environment.

#### Acceptance Criteria

1. THE App SHALL use a background color drawn from a dark color range (HSL lightness ≤ 20%) across the entire page.
2. THE App SHALL render all primary content containers with a semi-transparent dark fill (alpha ≤ 0.85), a CSS backdrop-filter blur of at least 8px, corner radii of at least 8px, and a visible border with opacity ≤ 0.3.
3. THE App SHALL use a sans-serif typeface for all text, with body text rendered at a minimum of 16px and a contrast ratio of at least 4.5:1 against its background.
4. THE App SHALL render the Pomodoro_Timer digits at a minimum font size of 48px, larger than any other text element on the page.
5. THE App SHALL be fully contained within a single HTML file, with Tailwind CSS loaded via CDN and all behavior implemented in Vanilla JavaScript with no external JavaScript libraries.

---

### Requirement 7: Single-Page Layout and Responsiveness

**User Story:** As a student, I want the app to be well-organized and work on my screen, so that I can use it comfortably during study sessions.

#### Acceptance Criteria

1. THE App SHALL present all content — the Pomodoro_Timer, Controls, theme selector, and subject list — on a single page without navigation or page transitions.
2. THE App SHALL arrange the layout in the following top-to-bottom vertical order: Pomodoro_Timer, Controls, theme selector, and subject list.
3. THE App SHALL center the main content area horizontally on the page.
4. WHEN the App is viewed on a screen narrower than 640px, THE App SHALL reflow the layout so that no horizontal scrolling is required and all interactive controls are reachable without zooming.
