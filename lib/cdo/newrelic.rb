# A client for invoking the NewRelic V2 REST API.
require 'json'
require "net/http"
require "pp"

class NewRelicClient

  attr_reader :api_key

  # Base URL for the NewRelic V2 REST API
  NEWRELIC_URL = 'https://api.newrelic.com/v2'

  # The disabled alert policy id for Code.org servers.
  DISABLED_ALERT_POLICY_ID = 355700

  # The production alert policy id for Code.org servers.
  PRODUCTION_ALERT_POLICY_ID = 368270

  def initialize(api_key = ENV['NEWRELIC_API_KEY'])
    @api_key = api_key
  end

  # Disables alerts to the given server names.
  def disable_alerts(server_names)
    assign_alert_policy(DISABLED_ALERT_POLICY_ID, server_names)
  end

  # Disables alerts to the given server names.
  def enable_alerts(server_names)
    assign_alert_policy(PRODUCTION_ALERT_POLICY_ID, server_names)
  end

  # Disables alerts for the given servers
  # param [Array<String>] server_names A list of new relic server names (not ids).
  def assign_alert_policy(policy_id, server_names)
    policy = alert_policy(policy_id)
    map = server_name_to_id_map

    server_names.each do |name|
      server_id = map[name]
      if server_id
        policy['links']['servers'] << server_id
      else
        next
      end
    end

    body = {'alert_policy': policy}.to_json
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
    alert_policy(DISABLED_ALERT_POLICY_ID)
  end

  # Returns a hash describing the production server alert policy.
  def production_alert_policy
    alert_policy(PRODUCTION_ALERT_POLICY_ID)
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

    req['X-Api-Key'] = api_key
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

  # Return a map from server names to new relic ids.
  def server_name_to_id_map
    {}.tap do |hash|
      get_server_map.each do |id, value|
        hash["#{value['host']}.ec2.internal"] = id
      end
    end
  end

end

NewRelic = NewRelicClient.new
