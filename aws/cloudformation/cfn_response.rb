require 'net/http'
require 'json'
require 'uri'

module CfnResponse
  def self.send(
    event,
    context,
    response_status = 'SUCCESS',
    response_data: {},
    physical_resource_id: nil,
    message: nil
  )
    response_body = {
      Status: response_status,
      Reason: message || "See the details in CloudWatch Log Stream: " + context.log_stream_name,
      PhysicalResourceId: physical_resource_id,
      StackId: event['StackId'],
      RequestId: event['RequestId'],
      LogicalResourceId: event['LogicalResourceId'],
      Data: response_data
    }.to_json

    puts "Response body:\n#{response_body}"

    url = event['ResponseURL']
    uri = URI(url)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true if uri.scheme == 'https'
    http.open_timeout = http.read_timeout = 30

    req = Net::HTTP::Put.new(url)
    req.body = response_body
    req.content_length = response_body.bytesize

    res = http.request(req)
    [res.code, res.each_header.to_h, res.body]
  end
end
