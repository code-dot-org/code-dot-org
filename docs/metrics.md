# AnalyticsReporter Usage Documentation

The `AnalyticsReporter` is a Statsig-based analytics service that provides event tracking, user management, and A/B testing capabilities for the Code.org platform.

## Overview

The reporter automatically initializes with user information and provides methods for:
- Sending custom events
- Managing user properties
- A/B testing and experiments
- Auto-capturing web analytics

## Import

```javascript
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
```

## Basic Usage

### Sending Events

Send custom analytics events with optional payload data:

```javascript
// Simple event
analyticsReporter.sendEvent('button_clicked');

// Event with payload
analyticsReporter.sendEvent('lesson_completed', {
  lessonId: 123,
  duration: 450,
  score: 85
});

// User interaction event
analyticsReporter.sendEvent('video_played', {
  videoId: 'intro-to-coding',
  timestamp: Date.now(),
  userAgent: navigator.userAgent
});
```

### Setting User Properties

Update user information when a user signs in or their properties change:

```javascript
await analyticsReporter.setUserProperties({
  userId: 12345,
  userType: 'student',
  isVerifiedInstructor: false,
  enabledExperiments: ['new_ui_experiment', 'ai_tutor_test'],
  educatorRole: null
});

// For a teacher
await analyticsReporter.setUserProperties({
  userId: 67890,
  userType: 'teacher',
  isVerifiedInstructor: true,
  enabledExperiments: ['teacher_dashboard_v2'],
  educatorRole: 'facilitator'
});
```

### A/B Testing and Experiments

Check if a user is in a specific experiment:

```javascript
// Check if user is in experiment with default fallback
const isInNewUI = analyticsReporter.getIsInExperiment(
  'new_ui_experiment',
  'enabled',
  false
);

if (isInNewUI) {
  // Show new UI
  renderNewInterface();
} else {
  // Show default UI
  renderDefaultInterface();
}

// Check experiment parameter with custom default
const buttonColor = analyticsReporter.getIsInExperiment(
  'button_color_test',
  'color',
  'blue'
);
```

### Auto-Capturing Web Analytics

Enable automatic tracking of user interactions:

```javascript
// Usually called during app initialization
await analyticsReporter.runAutoCapture();
```

## Environment Behavior

The reporter behaves differently based on environment:

- **Production**: All events are sent to Statsig
- **Development/Local**: Events are logged to console only (unless `STATSIG_LOCAL_MODE_OFF` is set)
- **Managed Test Environment**: Events are sent to Statsig

## Event Examples

### Learning Progress Events

```javascript
// Lesson start
analyticsReporter.sendEvent('lesson_started', {
  lessonId: 'hour-of-code-1',
  courseId: 'cs-fundamentals',
  unitId: 'unit-1'
});

// Puzzle completion
analyticsReporter.sendEvent('puzzle_completed', {
  puzzleId: 'maze_2_3',
  attempts: 3,
  hintsUsed: 1,
  timeSpent: 120,
  success: true
});

// Course completion
analyticsReporter.sendEvent('course_completed', {
  courseId: 'cs-principles',
  totalLessons: 20,
  completionRate: 0.95,
  finalGrade: 'A'
});
```

### User Interface Events

```javascript
// Navigation
analyticsReporter.sendEvent('page_viewed', {
  page: 'student_dashboard',
  referrer: 'course_catalog',
  loadTime: 850
});

// Feature usage
analyticsReporter.sendEvent('feature_used', {
  feature: 'code_sharing',
  action: 'share_project',
  projectId: 'abc123'
});

// Error tracking
analyticsReporter.sendEvent('error_encountered', {
  errorType: 'runtime_error',
  errorMessage: 'Cannot read property of undefined',
  component: 'blockly_workspace',
  userId: 12345
});
```

### Social/Collaboration Events

```javascript
// Project sharing
analyticsReporter.sendEvent('project_shared', {
  projectId: 'xyz789',
  shareMethod: 'social_media',
  platform: 'twitter'
});

// Peer interaction
analyticsReporter.sendEvent('peer_help_requested', {
  helpType: 'code_review',
  subject: 'javascript_functions',
  responseTime: 300
});
```

## Best Practices

1. **Event Naming**: Use snake_case for event names and be descriptive
2. **Payload Structure**: Keep payloads flat and include relevant context
3. **User Privacy**: Avoid sending personally identifiable information in payloads
4. **Error Handling**: The reporter handles errors internally, but ensure event names are provided

## Integration Notes

- The reporter automatically initializes on import
- User properties are typically set during login/authentication flows
- Experiments are configured server-side in Statsig
- In local development, events are logged to console for debugging

## Debugging

In development mode, you'll see console logs like:
```
[STATSIG ANALYTICS EVENT]: button_clicked. Payload: {"feature": "navigation"}
```

To force sending events in local mode:

1. Set `statsig_api_client_key: <non-prod-statsig-api-client-key>` in your `locals.yml` file. This API key can be obtained from the Statsig dashboard. NOTE: You shouldn't need to do this often, as you can see the logs in the dev tools console when developing locally.
2. Toggle `ALWAYS_SEND = true;` constant at the top of the file.
