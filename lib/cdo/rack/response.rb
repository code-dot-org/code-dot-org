# Patch Rack::Response with extra utility methods.
module Rack
  class Response
    # From Rack 2.0 alpha: rack/rack#957
    def has_header?(key);   headers.key? key;   end

    def get_header(key);    headers[key];       end

    def set_header(key, v); headers[key] = v;   end

    def add_header(key, v)
      if v.nil?
        get_header key
      elsif has_header? key
        set_header key, "#{get_header key},#{v}"
      else
        set_header key, v
      end
    end
  end
end
