# Instrumenting Analytics

We measure site health and activity using a few different tools:

- [Redshift] is where we track Key Performance Indicators and analyze learning outcomes.
- [Google Analytics] we use for simple event counting and traffic.
- [New Relic] is for application-layer health indicators.
- [CloudWatch] is for infrastructure-layer health indicators.

Redshift and Google Analytics are product tools. Work with your PM to decide whether Redshift or Google Analytics are right for your feature.

New Relic and CloudWatch are engineering tools. Use them when instrumenting a site-health metric, or one that should be able to trigger a PagerDuty alert.

## Redshift

[Redshift] is used for tracking Key Performance Indicators and learning outcomes.  It's also the only service where we correlate gathered analytics with DB data. We send events directly to Redshift via [Firehose].  See the wrapper classes for documentation and example code.

- In Ruby use [`FirehoseClient.instance.put_record`][redshift-ruby-docs] ([Example][redshift-ruby-example])
- In JavaScript use [`firehoseClient.putRecord`][redshift-js-docs]

## Google Analytics

In JavaScript, you can use the function [`trackEvent`][ga-js-code] ([Example][ga-js-example]) to report an event to [Google Analytics]. For more information, see the [ga.js docs on event tracking][ga-js-docs].

### Testing your Google Analytics call

1. Install the [Google Analytics debugger]
2. Test locally
3. Look for the analytics call in the Chrome debugger

## New Relic

[New Relic] should be used for recording application-layer metrics in cases where we want to be able to monitor and alert based on the metric's value over time. An example alerting rule based on metrics can be seen here: [FilesApi policy](https://alerts.newrelic.com/accounts/501463/policies/36).

[New Relic] has separate APIs for recording "events" and "metrics."  It's a little hard to find good resources on the distinction; [this thread][new-relic-events-vs-metrics] may be helpful. We plan to sunset New Relic "custom events" by saving them instead to Redshift.

- In Ruby, use [`NewRelic::Agent.record_custom_event`] and [`NewRelic::Agent.record_metric`] ([Example][new-relic-ruby-example])
- In JavaScript, we record custom events with [`logToCloud.addPageAction`][new-relic-js-docs] ([Example][new-relic-js-example]).  We haven't set up any custom metrics from JavaScript yet.

## CloudWatch

[CloudWatch] should be used for recording infrastructure-layer metrics in cases where we want to be able to monitor and alert based on the metric's value over time. In Ruby, use [`Aws::CloudWatch::Client.new.put_metric_data`][cloudwatch-ruby-docs] ([Example][cloudwatch-ruby-example]) to record a custom metric.

If you create metrics for CloudWatch, you'll probably want to add them to one of the dashboards that we look at there, and possibly configure alarms around that metric - otherwise there are *so* many tracked that nobody will ever notice yours.

[CloudWatch]: https://aws.amazon.com/cloudwatch/
[cloudwatch-ruby-docs]: http://docs.aws.amazon.com/sdkforruby/api/Aws/CloudWatch/Client.html#put_metric_data-instance_method
[cloudwatch-ruby-example]: ../bin/cron/mysql-metrics#L355
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
[new-relic-ruby-example]: https://github.com/code-dot-org/code-dot-org/blob/d2a7bb5cf19271cbc4d147d79b64302f884e48eb/shared/middleware/files_api.rb#L77
[new-relic-js-docs]: ../apps/src/logToCloud.js#L28
[new-relic-js-example]: ../apps/src/JavaScriptModeErrorHandler.js#L85
[Redshift]: https://aws.amazon.com/redshift/
[redshift-ruby-docs]: ../lib/cdo/firehose.rb
[redshift-ruby-example]: ../dashboard/app/controllers/api/v1/users_controller.rb#L25
[redshift-js-docs]: ../apps/src/lib/util/firehose.js
