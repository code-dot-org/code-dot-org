# A client for invoking the NewRelic V2 REST API.
# TODO re-sync/merge with cdo/newrelic.rb

require 'json'
require 'net/http'
require 'pp'

class NewRelicClient
  ENV_ATTRS = {
    'enabled_alert_policy_id' => ENV['ENABLED_ALERT_POLICY_ID'],
    'disabled_alert_policy_id' => ENV['DISABLED_ALERT_POLICY_ID'],
    'api-key' => ENV['NEWRELIC_API_KEY']
  }.freeze

  attr_reader :attributes

  # Base URL for the NewRelic V2 REST API
  NEWRELIC_URL = 'https://api.newrelic.com/v2'.freeze

  def initialize(attributes=ENV_ATTRS)
    @attributes = attributes
  end

  # Disables alerts to the given server name.
  def disable_alerts(server_name)
    assign_alert_policy(attributes['disabled_alert_policy_id'], server_name, 10)
  end

  # Enables alerts to the given server name.
  def enable_alerts(server_name)
    assign_alert_policy(attributes['enabled_alert_policy_id'], server_name, 120)
  end

  # Disables alerts for the given server
  # param String server_name A new relic server name (not id).
  def assign_alert_policy(policy_id, server_name, timeout)
    policy = alert_policy(policy_id)

    retry_with_timeout(timeout) do
      server_id = get_server_id(server_name)
      raise "NewRelic server ID not found for #{server_name}" unless server_id
      policy['links']['servers'] << server_id
    end

    body = {alert_policy: policy}.to_json
    call_newrelic_rest("alert_policies/#{policy_id}.json", 'PUT', body)
  end

  # Wait/retry up to `timeout` seconds with exponential backoff, then re-raise the last error thrown.
  def retry_with_timeout(timeout)
    wait_total = 0
    tries = 0
    begin
      yield
    rescue => e
      raise e if wait_total >= timeout
      tries += 1
      sleep_time = [timeout - wait_total, 2**tries].min # Exponential backoff
      Kernel.sleep sleep_time
      wait_total += sleep_time
      retry
    end
  end

  # Returning a map from alert policy id to alert hash as described at
  # https://rpm.newrelic.com/api/explore/alert_policies/list
  def get_alert_policies_map
    policies = call_newrelic_rest('alert_policies.json')['alert_policies']
    index(policies, 'id')
  end

  # Returning a hash describing the specified alert policies as described at
  # https://rpm.newrelic.com/api/explore/alert_policies/show
  def alert_policy(alert_policy_id)
    call_newrelic_rest("alert_policies/#{alert_policy_id}.json")['alert_policy']
  end

  # Returns a hash describing the disabled server alert policy.
  def disabled_alert_policy
    alert_policy(attributes['disabled_alert_policy_id'])
  end

  # Returns a hash describing the enabled server alert policy.
  def enabled_alert_policy
    alert_policy(attributes['enabled_alert_policy_id'])
  end

  # Invokes a NewRelic REST action, parsing the JSON result and returning a hash.
  # @throws a runtime exception if an HTTP or JSON parsing error occurs
  def call_newrelic_rest(path, method = 'GET', body = nil)
    uri = newrelic_uri(path)

    case method.upcase
      when 'GET'
        req = Net::HTTP::Get.new(uri)
      when 'PUT'
        req = Net::HTTP::Put.new(uri)
      when 'POST'
        req = Net::HTTP::Post.new(uri)
      else
        raise "Unknown method #{method}"
    end

    req['X-Api-Key'] = attributes['api-key']
    req['Content-Type'] = 'application/json'

    req.body = body if body

    http = Net::HTTP.new(uri.hostname, uri.port)
    http.use_ssl = true

    response = http.start {http.request(req)}

    if response.code == "200"
      JSON.parse(response.body)
    else
      raise "HTTP Error #{response.code}: #{response.message} #{response.body}"
    end
  end

  def newrelic_uri(path)
    URI("#{NEWRELIC_URL}/#{path}")
  end

  # "Index" an array of hashes by return a map from the value of the given field
  # to the corresponding record. Field should be unique to avoid collisions.
  def index(array, field)
    {}.tap do |result|
      array.each do |item|
        raise "#{field} is not unique" unless result[item[field]].nil?
        result[item[field]] = item
      end
    end
  end

  # Returns the NewRelic server id for the given server name.
  # https://rpm.newrelic.com/api/explore/servers/list
  def get_server_id(server_name)
    rest = call_newrelic_rest("servers.json?#{URI.encode_www_form('filter[name]' => server_name)}")
    rest['servers'].first {|server| server['name'] == server_name}['id']
  end
end
