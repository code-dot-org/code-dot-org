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
  }

  attr_reader :attributes

  # Base URL for the NewRelic V2 REST API
  NEWRELIC_URL = 'https://api.newrelic.com/v2'

  def initialize(attributes=ENV_ATTRS)
    @attributes = attributes
  end

  # Disables alerts to the given server name.
  def disable_alerts(server_name)
    assign_alert_policy(attributes['disabled_alert_policy_id'], server_name)
  end

  # Disables alerts to the given server name.
  def enable_alerts(server_name)
    assign_alert_policy(attributes['enabled_alert_policy_id'], server_name)
  end

  # Disables alerts for the given server
  # param String server_name A new relic server name (not id).
  def assign_alert_policy(policy_id, server_name)
    policy = alert_policy(policy_id)

    # Wait/retry up to 30 seconds for a new server ID to be registered by NewRelic.
    max_tries = 10
    tries = 0
    begin
      map = server_name_to_id_map
      server_id = map[server_name]
      raise "NewRelic server ID not found for #{server_name}" unless server_id
      policy['links']['servers'] << server_id
    rescue => e
      raise e if tries >= max_tries
      tries += 1
      sleep 3
      retry
    end

    body = {alert_policy: policy}.to_json
    call_newrelic_rest("alert_policies/#{policy_id}.json", 'PUT', body)
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

    response = http.start { http.request(req) }

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

  # Returning a map from NewRelic server id to server hash as described at
  # https://rpm.newrelic.com/api/explore/servers/list
  def get_server_map
    servers = call_newrelic_rest('servers.json')['servers']
    index(servers, 'id')
  end

  # Return a map from server hostnames to new relic ids.
  def server_name_to_id_map
    {}.tap do |hash|
      get_server_map.each do |id, value|
        hash[value['host']] = id
      end
    end
  end

end
