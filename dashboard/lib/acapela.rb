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

  metrics = [
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
