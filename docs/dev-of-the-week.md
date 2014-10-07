# Dev of the Week Overview

So you want to learn about Dev of the Week!  Maybe it's your first time as DotW, or it's been a few months and you want a refresher on everything you need to cover.  This document is written as a TODO list, with items look at 2-3x per week or in response to alerts (usually in the Developer HipChat room).

Dev of the Week is on point for any issues that arise in the Production, Test, or Staging environments.  You don't have to personally fix every issue, but DotW is responsible for delegating and coordinating fixes.  

### [Schedule](https://docs.google.com/a/code.org/spreadsheets/d/1Fplt568RCaeXjomfRgBxdO0Z5bu8MFG0abMxfDRIurk/edit#gid=0)

### Areas of responsibility

* 2-3x per week
  * [Check New & Existing Zendesk Tickets](#zendesk)
* As notified in the Developers HipChat room
  * [Investigate Build Failures](#build-failures)
  * [Level Activity Monitor](#level-activity-monitor)
  * [HoneyBadger Notifications](#honeybadger-notifications)

This is a living document.  Please update it to help the next DotW, and to help future-you next time you're DotW.  You can edit directly in GitHub via the pencil icon at the top right.

### Zendesk

See the [Zendesk doc](https://github.com/code-dot-org/code-dot-org/blob/staging/docs/dev-of-the-week-zendesk.md) for specific steps.  Check for new issues and follow up on pending items 2-3x over the course of the week.

### Build Failures

![Build failed notification](https://cloud.githubusercontent.com/assets/413693/4363001/947ec0ae-4291-11e4-91fb-470981956e31.png)

The fastest way to track these down is to look at the commits that have occurred since the last successful build.  If nothing jumps out as the culprit, pull the latest changes and try building them locally to find the breakage.

When in doubt, ask in the Developers HipChat room.

### Level Activity Monitor

![Activity monitor alert](https://cloud.githubusercontent.com/assets/413693/4362964/3b435c5c-4291-11e4-82d7-6864ce727b91.png)

These notifications are generated when a blockly level has received `MinimumAttemptsPerHour` (default: 5 attempts) in the past `HoursToTest` (default: 2 hours) with zero successes.  Some levels are known to be more difficult and have higher tolerances in [activity-monitor](https://github.com/code-dot-org/code-dot-org/blob/staging/bin/activity-monitor).

1. When a level shows up in HipChat it's in the format `/level/n` which is the direct link to the level by ID.  Open this link in your browser.
1. If the link is an unplugged level, add it to the excluded list.  Done!
1. Otherwise, _ensure you are logged in as an admin_ then look at the bottom of the left sidebar to edit the level and view public-facing links (under "This level is in the following scripts:").
1. Use the public-facing link to load the level in the target browser via <http://www.browserstack.com/>.
1. Play through the level to see if it's passable.
  1. Passing the level on BrowserStack via the public-facing link will register as a success and stop the HipChat notifications.  Consider increasing the tolerance for common false-positives.
  1. If the level is unplayable, fix the level by clicking the edit link (for levels created in levelbuilder — must be logged in as an admin) or by editing the corresponding .level file.
1. Update the [blocky per-level-alert outliers](https://docs.google.com/a/code.org/spreadsheets/d/1Va5hKlT6-uQJ0mZ6_QpDIaeBIhAjem-n1egWn316tJM/) ghseet if the level needs to be redesigned to address difficulty.

An attempt is defined as the user loading the page and a success is the user solving the puzzle so the "Congratulations" dialog appears.  See `activity_start` in `ScriptLevelsController::show` and `activity_finish` in `ActivitiesController::milestone`.

### HoneyBadger Notifications

![Honeybadger notification](https://cloud.githubusercontent.com/assets/413693/4362965/3c829c04-4291-11e4-9354-3df9e178be45.png)

See the [Using Honeybadger](https://github.com/code-dot-org/code-dot-org/blob/staging/docs/honeybadger.md) doc for workflow.
