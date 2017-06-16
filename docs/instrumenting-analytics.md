# Instrumenting Analytics

We measure site health and activity using a few different tools:

- [Redshift] is where we track KPIs and analyze learning outcomes.
- [Google Analytics] we use for simple event counting and traffic.
- [New Relic] is for site health and anything that might trigger an alert.

As a dev, if you're instrumenting a site health metric, use New Relic.  Otherwise, work with your PM to decide whether to use Redshift or GA.

## Redshift

We send events directly to [Redshift] via [Firehose].  See the wrapper classes for documentation and example code.

- In Ruby use [`FirehoseClient.instance.put_record`][redshift-ruby-docs] ([Example][redshift-ruby-example])
- In JavaScript use [`firehoseClient.putRecord`][redshift-js-docs]

## Google Analytics

In JavaScript, you can use the function [`trackEvent`][ga-js-code] ([Example][ga-js-example]) to report an event to Google Analytics. For more information, see the [ga.js docs on event tracking][ga-js-docs].

### Testing your Google Analytics call

1. Install the [Google Analytics debugger]
2. Test locally
3. Look for the analytics call in the Chrome debugger

## New Relic

[New Relic] has separate APIs for recording "events" and "metrics."  It's a little hard to find good resources on the distinction; [this thread][new-relic-events-vs-metrics] may be helpful.

- In Ruby, use [`NewRelic::Agent.record_custom_event`] and [`NewRelic::Agent.record_metric`] ([Example][new-relic-ruby-example])
- In JavaScript, we record custom events with [`logToCloud.addPageAction`][new-relic-js-docs] ([Example][new-relic-js-example]).  We haven't set up any custom metrics from JavaScript yet.

[Firehose]: https://aws.amazon.com/kinesis/firehose/
[Google Analytics]: https://analytics.google.com/
[Google Analytics debugger]: https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna
[ga-js-code]: ../apps/src/util/trackEvent.js
[ga-js-docs]: https://developers.google.com/analytics/devguides/collection/gajs/eventTrackerGuide
[ga-js-example]: ../apps/src/util/experiments.js#L54
[New Relic]: https://newrelic.com/
[new-relic-events-vs-metrics]: https://discuss.newrelic.com/t/what-is-the-difference-between-custom-metrics-and-custom-events/907
[`NewRelic::Agent.record_custom_event`]: http://www.rubydoc.info/github/newrelic/rpm/NewRelic/Agent:record_custom_event
[`NewRelic::Agent.record_metric`]: http://www.rubydoc.info/github/newrelic/rpm/NewRelic/Agent:record_metric
[new-relic-ruby-example]: ../lib/cdo/rack/attack.rb#L160-L179
[new-relic-js-docs]: ../apps/src/logToCloud.js#L28
[new-relic-js-example]: ../apps/src/JavaScriptModeErrorHandler.js#L85
[Redshift]: https://aws.amazon.com/redshift/
[redshift-ruby-docs]: ../lib/cdo/firehose.rb
[redshift-ruby-example]: ../dashboard/app/controllers/api/v1/users_controller.rb#L25
[redshift-js-docs]: ../apps/src/lib/util/firehose.js
