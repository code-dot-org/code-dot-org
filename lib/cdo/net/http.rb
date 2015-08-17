require "net/http"

class Net::HTTP
  def self.get_with_basic_auth(url, username, password)
    uri = URI.parse(url)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = uri.scheme == 'https'
    request = Net::HTTP::Get.new(uri.request_uri)
    request.basic_auth(username, password)
    http.request(request)
  end
end
