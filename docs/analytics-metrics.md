# Analytics Reporter Usage Documentation

## Frontend Metrics

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
- **Development/Local**: Events are logged to console only (unless `ALWAYS_SEND` is toggled to `true`)
- **Managed Test Environment**: Events are sent to Statsig

## Best Practices

1. **Payload Structure**: Keep payloads flat and include relevant context
2. **User Privacy**: Avoid sending personally identifiable information in payloads

## Integration Notes

- The reporter automatically initializes on import
- User properties are typically set during login/authentication flows
- Experiments are configured server-side in Statsig
- In local development, events are logged to dev tools console for debugging

## Send Events From Development

In development mode, you'll see console logs like:
```
[STATSIG ANALYTICS EVENT]: button_clicked. Payload: {"feature": "navigation"}
```

To force sending events in local mode:

1. Set `statsig_api_client_key: <non-prod-statsig-api-client-key>` in your `locals.yml` file. This API key can be obtained from the Statsig dashboard. NOTE: You shouldn't need to do this often, as you can see the logs in the dev tools console when developing locally.
2. Toggle `ALWAYS_SEND = true;` constant at the top of the file.

## Server-side Metrics

The `Metrics::Events` module provides a wrapper for the Statsig SDK to log events with environment-specific handling.

## Overview

This module automatically routes events to different handlers based on the current environment:
- **Development**: Logs events to stdout for debugging
- **Production/Test**: Logs events to Statsig
- **Other environments**: Silently ignores events

## Usage

### Basic Event Logging

```ruby
# Log a simple event
Metrics::Events.log_event(event_name: 'button_click')

# Log event with metadata
metadata = {
  page: 'dashboard',
  button_type: 'primary'
}
Metrics::Events.log_event(
  event_name: 'button_click',
  metadata: metadata
)
```

### User-Associated Events

```ruby
# Log event for a specific user
Metrics::Events.log_event(
  user: current_user,
  event_name: 'lesson_completed',
  event_value: 'lesson_1'
)

# Include session to include statsig_stable_id for signed-out user scenarios
Metrics::Events.log_event(
  user: current_user,
  event_name: 'page_view',
  session: session
)
```

### Advanced Options

```ruby
# Include user's enabled experiments
Metrics::Events.log_event(
  user: current_user,
  event_name: 'feature_used',
  get_enabled_experiments: true
)
```

## Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user` | User object | No | The logged-in user instance |
| `event_name` | String | **Yes** | Name of the event to log |
| `event_value` | String | No | Value associated with the event (defaults to `event_name`) |
| `metadata` | Hash | No | Additional event data (default: `{}`) |
| `get_enabled_experiments` | Boolean | No | Include user's enabled experiments (default: `false`) |
| `session` | Hash | No | Session data containing `statsig_stable_id` |

## Environment Behavior

### Development Environment
- Events are logged to stdout as JSON for easy debugging
- Errors are printed to console
- No data is sent to external services

### Production/Test Environment
- Events are sent to Statsig for analytics
- User information is automatically included if available
- Stable IDs from session are preserved

### Other Environments
- Events are silently ignored
- No logging or external calls are made

## Send Events From Development

1. Set `statsig_server_secret_key: <non-prod-statsig-server-secret-key>` in your `locals.yml` file. This API key can be obtained from the Statsig dashboard. NOTE: You shouldn't need to do this often, as you can see the logs in the dev tools console when developing locally.
2. In `dashboard/lib/cdo/statsig.rb`, set `local_mode` to false (defaults to `true` in non-prod/non-test server environments).
