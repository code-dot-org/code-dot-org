require 'net/http'
require 'json'
require 'date'
require 'le'
require 'rack'

def hash_to_query(hash, namespace=nil)
  hash.collect do |key, value|
    key = "#{namespace}[#{key}]" unless namespace.nil?
    "#{Rack::Utils.escape(key)}=#{Rack::Utils.escape(value.to_s)}"
  end.sort * '&'
end

module Slog

  class Writer

    def initialize(params)
      @secret = params[:secret]
      @logger = Le.new(@secret) unless @secret.nil?
    end

    def write(h)
      json = h.to_json # Do this even when we have nowhere to write to ensure h is always convertible.
      @logger.info(json) unless @logger.nil?
    end
  end

  class Reader

    def initialize(params)
      @secret = params[:secret]
      @api_host = params[:api_host] || 'pull.logentries.com'
      @log_name = params[:log_name] || 'slog'
      @hosts = params[:hosts] || CDO.hostnames_by_env(params[:env] || rack_env)
      @log_keys = {}
    end

    def get(params=nil)
      logs = @hosts.map{|host| parse(http_get(uri_for(host, params)))}
      logs.flatten!
      logs.sort!{|a, b| a[:timestamp] <=> b[:timestamp]}
      logs
    end

    def http_get(uri)
      Net::HTTP.get(@api_host, uri)
    end

    def key_for(host)
      log = File.join(host, @log_name)
      key = @log_keys[log]
      return key unless key.nil?

      uri = File.join('/', @secret, 'hosts', log)
      raw = http_get(uri)
      json = JSON.parse(raw)
      @log_keys[log] = json['key']
    end

    def parse(buffer)
      buffer.split("\n").map do |entry|
        info, payload = entry.split(', ', 2)
        date_time = info.split(' ')[0..2].join(' ')
        ({timestamp: DateTime.parse(date_time)}).merge(JSON.parse(payload))
      end
    end

    def uri_for(host, params)
      uri = File.join('/', @secret, 'hosts', host, key_for(host))
      uri += params.nil? ? '/' : "/?#{hash_to_query(params)}"
      uri
    end

  end

end
