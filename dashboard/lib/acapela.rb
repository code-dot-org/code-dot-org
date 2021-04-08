require 'net/http'
require 'uri'
require 'cgi'
require 'open-uri'
require 'logger'
require 'cdo/aws/metrics'

VAAS_URL = "http://vaas.acapela-group.com/Services/Synthesizer".freeze
VAAS_HASH = {
  prot_vers: "2",
  cl_login: CDO.acapela_login,
  cl_app: CDO.acapela_storage_app,
  cl_pwd: CDO.acapela_storage_password
}.freeze

def acapela_text_to_audio_url(text, voice="rosie22k", speed=180, shape=100, context=nil)
  params = {
    req_voice: voice,
    req_text: text,
    req_spd: speed,
    req_vct: shape
  }
  Rails.logger.info "TTS: requesting conversion with request data #{params}"

  request = VAAS_HASH.merge(params)
  response = Net::HTTP.post_form(URI.parse(VAAS_URL), request)

  # CloudWatch dashboard to monitor Acapela-TTS-Service
  # https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=Acapela-TTS-Service
  metrics = [
    # The first metric has no dimension. It simply counts the total number
    # of Acapela API calls across all scenarios.
    {
      metric_name: :AcapelaAPICallTotal,
      value: 1
    },
    # The second metric is more granular. It counts the number of Acapela API
    # calls in a unique combination of environment, context and voice.
    # CloudWatch treats each unique combination of dimensions as a separate metric,
    # even if the metrics have the same metric name. So later, we have to use
    # Search expression and Metric math to aggregate those metrics.
    #
    # @see the following links for more details
    # https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_concepts.html#Metric
    # https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_concepts.html#Dimension
    # https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/using-search-expressions.html
    # https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/using-metric-math.html
    {
      metric_name: :AcapelaAPICall,
      dimensions: [
        {name: "Environment", value: CDO.rack_env},
        {name: "Context", value: context},
        {name: "Voice", value: voice}
      ],
      value: 1
    }
  ]
  Cdo::Metrics.push 'TTS', metrics

  Rails.logger.info "TTS: response with status code #{response.code}"
  if response.code == '200'
    CGI.parse(response.body)["snd_url"][0]
  else
    body = CGI.parse(response.body)
    Rails.logger.error "TTS: error with error code #{body['err_code']}: #{body['err_msg']}"
    return nil
  end
end
