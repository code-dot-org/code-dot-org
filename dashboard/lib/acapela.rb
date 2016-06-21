require 'net/http'
require 'uri'
require 'cgi'
require 'open-uri'

VAAS_URL = "http://vaas.acapela-group.com/Services/Synthesizer"

def speak(text, voice="rachel22k")
  hash = {
    "prot_vers" => "2",
    "cl_env" => "APACHE_2.2.9_PHP_5.5",
    "cl_vers" => "1-00",
    "cl_login" => CDO.acapela_login,
    "cl_app" => CDO.acapela_app,
    "cl_pwd" => CDO.acapela_password,
    "req_voice" => voice,
    "req_text" => text
  }
  url = URI.parse(VAAS_URL)

  res = Net::HTTP.post_form(url, hash)

  CGI.parse(res.body)["snd_url"][0]
end

def upload_audio_to_s3(text, filename)
  uri = URI.parse(speak(text))
  Net::HTTP.start(uri.host) { |http|
    resp = http.get(uri.path)
    AWS::S3.upload_to_bucket('cdo-tts', filename, resp.body, no_random: true)
  }
end
