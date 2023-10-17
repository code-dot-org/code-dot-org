require 'cdo/aws/metrics'

# A controller for reporting browser logs and metrics to Cloudwatch
class BrowserEventsController < ApplicationController
  EXPERIMENT_FLAG_NAME = 'browser-cloudwatch-metrics'
  FIREHOSE_STUDY_NAME = 'browser-cloudwatch-metrics-errors'

  LOGS_CLIENT = Aws::CloudWatchLogs::Client.new
  ENV_PREFIX = rack_env?(:adhoc) ? CDO.stack_name : rack_env
  LOG_GROUP_NAME = "#{ENV_PREFIX}-browser-events"
  LOG_STREAM_NAME = ENV_PREFIX
  METRIC_NAMESPACE = "#{ENV_PREFIX}-browser-metrics"

  before_action :check_preconditions

  # POST /put_logs
  def put_logs
    body = JSON.parse(request.body.read)

    return render status :bad_request, json: {message: 'missing required params: logs'} unless body["logs"]

    logs = body["logs"].map do |log_payload|
      {timestamp: (Time.now.to_f * 1000).to_i, message: decorate_log_payload(log_payload)}
    end

    resp = LOGS_CLIENT.put_log_events(
      {
        log_group_name: LOG_GROUP_NAME,
        log_stream_name: LOG_STREAM_NAME,
        log_events: logs
      }
    )

    if resp.rejected_log_events_info
      fallback_log_to_firehose('rejected-log-events', resp.rejected_log_events_info)
    end

    render status: :ok, json: {}
  rescue => exception
    Honeybadger.notify(
      exception,
      error_message: "Error publishing logs to Cloudwatch"
    )
    render status: :internal_server_error, json: {error: exception}
  end

  # POST /put_metric_data
  def put_metric_data
    body = JSON.parse(request.body.read)

    return render status :bad_request, json: {message: 'missing required params: metricData'} unless body["metricData"]

    metrics = body["metricData"].map {|datum| convert_metric_datum(datum)}
    Cdo::Metrics.push(METRIC_NAMESPACE, metrics)

    render status: :ok, json: {}
  rescue => exception
    Honeybadger.notify(
      exception,
      error_message: "Error publishing metrics to Cloudwatch"
    )
    render status: :internal_server_error, json: {error: exception}
  end

  private def convert_metric_datum(metric_datum)
    return nil unless metric_datum["name"]

    # Replace the 'name' key with 'metric_name'
    # (AWS Ruby SDK requires a 'metric_name' parameter)
    metric_datum["metric_name"] = metric_datum["name"]
    metric_datum.delete("name")
    # put_metric_data uses ISO timestamps
    metric_datum["timestamp"] = Time.now

    metric_datum.deep_symbolize_keys
  end

  # Adds shared params to all log objects and convert to stringified JSON
  private def decorate_log_payload(log_payload)
    if log_payload.is_a?(String)
      log_payload = {message: log_payload}
    end

    log_payload['userId'] = current_user.id if current_user
    log_payload['release'] = GitUtils.git_revision

    return log_payload.to_json.to_s
  end

  private def fallback_log_to_firehose(event, data)
    FirehoseClient.instance.put_record(
      :analysis,
      {
        study: FIREHOSE_STUDY_NAME,
        event: event,
        data_json: data.to_json
      }
    )
  end

  def check_preconditions
    return render status: :unauthorized, json: {error: "Browser Cloudwatch logging is currently disabled"} unless
      Gatekeeper.allows(EXPERIMENT_FLAG_NAME, default: true) && DCDO.get(EXPERIMENT_FLAG_NAME, true)
  end
end
