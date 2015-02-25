# Dev of the Week Overview

So you want to learn about Dev of the Week!  Maybe it's your first time as DotW, or it's been a few months and you want a refresher on everything you need to cover.  This document is written as a TODO list, with items look at 2-3x per week or in response to alerts (usually in the Developer HipChat room).

Dev of the Week is on point for any issues that arise in the Production, Test, or Staging environments.  You don't have to personally fix every issue, but DotW is responsible for delegating and coordinating fixes.  

This is a living document.  Please update it to help the next DotW, and to help future-you next time you're DotW.  You can edit directly in GitHub via the pencil icon at the top right.

### [Schedule](https://docs.google.com/a/code.org/spreadsheets/d/1Fplt568RCaeXjomfRgBxdO0Z5bu8MFG0abMxfDRIurk/edit#gid=0)

### Areas of responsibility

* Every day
  * [Check New & Existing Zendesk Tickets](#zendesk)
  * [Merge Levelbuilder](#merge-levelbuilder)
  * [Ensure we DTT and DTP](#dtt-and-dtp)
* 2-3x per week
  * [Investigate Slow DB Queries](#investigate-slow-db-queries)
* As notified in the Developers HipChat room
  * [Investigate Build Failures](#build-failures)
  * [Level Activity Monitor](#level-activity-monitor)
  * [HoneyBadger Notifications](#honeybadger-notifications)
  * [New Relic Alerts](#new-relic-alerts)

### Zendesk

See the [Zendesk doc](https://github.com/code-dot-org/code-dot-org/blob/staging/docs/dev-of-the-week-zendesk.md) for specific steps.  Check for new issues and follow up on pending items 2-3x over the course of the week.

### Merge Levelbuilder

See the [Levelbuilder doc](https://github.com/code-dot-org/code-dot-org/blob/staging/docs/update-levelbuilder.md) for specific steps. Alert level builders before you merge so they don't lose their changes.

### DTT and DTP
Make sure we're deploying to prod daily during the ramp-up to HoC.  There's no action needed if someone is already planning to DTP.  Otherwise it's up to DotW to ensure we deploy daily. Make sure you did daily levelbuilder merge before daily DTP.
  * DTT: Create and merge PR for [test...staging](https://github.com/code-dot-org/code-dot-org/compare/test...staging)
  * Check that there are no UI test failures
  * DTP: Create and merge a PR for [production...test](https://github.com/code-dot-org/code-dot-org/compare/production...test)

UI tests failing after DTT?

![UI tests failing](https://cloud.githubusercontent.com/assets/1920530/6073132/09a54654-ad5f-11e4-9a9f-d58ae89ff024.png)

Tests will automatically re-run if something failed. If it fails again, try this:
  * Run the test again locally `ubuntu@test:~/test/dashboard/test/ui$ ./runner.rb -p2 -c iPad3,iPhone5S #runs two tests in parallel` 
  * Try it yourself in [Browserstack](http://www.browserstack.com/start), match the operating system and browser version then re-enact the failing scenario. See the HTML output in the error message for the failing scenarios.
  * Check the [Browserstack logs/screenshots](http://www.browserstack.com/automate). Select the test in the left menu. Investiage in the tabs: Text Logs, Visual Logs, or Exceptions.
  * It might be a Browserstack error, try running the tests on production `ubuntu@test:~/test/dashboard/test/ui$ ./runner.rb -p2 -c iPad3,iPhone5S -d studio.code.org`

Did eye tests/applitools tests fail?

![Eye tests failed](https://cloud.githubusercontent.com/assets/1920530/6073179/bdf7a4d0-ad5f-11e4-8cad-3a9d4fe3e4f6.png)

View the console to see what tests failed. Eye tests will find discrepancies on screenshots of the site and highlight them in pink. Look carefully, the changes are often very small.
  * If the change is acceptable (i.e. the copyright in the footer was updated from 2014 to 2015), click Accept in the upper right hand corner
  * Adjust the baseline so that the screenshot will expect the change next time around
  * If there is a questionable error, verify with @Developers if the change is expected. Otherwise, fix error.
  * For more info, see the [UI tests with Applitools Eyes](https://github.com/code-dot-org/code-dot-org/blob/staging/docs/testing-with-applitools-eyes.md) doc

### Investigate Slow DB Queries
This is a temporary item leading up to the HoC launch.  [Follow the steps to access error/mysql-error-running.log] (http://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_LogAccess.Procedural.Viewing.html), then address each slow query:
  * Always slow: run it via script (every 5 min, every day, etc.)
  * Not indexed: add indexes
  * Unoptimized: optimize query directly
  * Big complicated joins: improve data model
  * Not sure: ask in the Developers HipChat room

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
1. Update the [blocky per-level-alert outliers](https://docs.google.com/a/code.org/spreadsheets/d/1Va5hKlT6-uQJ0mZ6_QpDIaeBIhAjem-n1egWn316tJM/) gsheet if the level needs to be redesigned to address difficulty.

An attempt is defined as the user loading the page and a success is the user solving the puzzle so the "Congratulations" dialog appears.  See `activity_start` in `ScriptLevelsController::show` and `activity_finish` in `ActivitiesController::milestone`.

### HoneyBadger Notifications

![Honeybadger notification](https://cloud.githubusercontent.com/assets/413693/4362965/3c829c04-4291-11e4-9354-3df9e178be45.png)

See the [Using Honeybadger](https://github.com/code-dot-org/code-dot-org/blob/staging/docs/honeybadger.md) doc for workflow.

### New Relic Alerts

![New Relic Alert](https://cloud.githubusercontent.com/assets/1920530/6067148/40c14ef4-ad27-11e4-8b34-94a064c76cf8.png)

Most of the time, these alerts will close themselves by just downgrading to a warning. You can check back in on the error after about 2 hours if it hasn't closed itself. See if there is an actual impact to users:

1. Click on the SERVERS tab. Check the server that the error was alerting. If the memory chart shows high growth to 90/95% and plateaus, this is OK. It is bad if it continues to grow.

![Server Dashboard](https://cloud.githubusercontent.com/assets/1920530/6067153/4d0ba308-ad27-11e4-8189-90ea7ee5e8e9.png)

2. Click the BROWSER tab. Look at the pageload time column. Dashboard is typically ~1.6sec and Pegasus is ~4.5sec. If it's much higher, this is bad.
3. Click on Dashboard and/or Pegasus to see more details. At the top, you can change the Time Picker to change the range to last 6 hours. If there's a significant jump in page load times, this is bad.
