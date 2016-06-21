require 'net/http'
require 'uri'
require 'cgi'
require 'open-uri'

VAAS_URL = "http://vaas.acapela-group.com/Services/Synthesizer"
VAAS_HASH = {
  prot_vers: "2",
  cl_env: "APACHE_2.2.9_PHP_5.5",
  cl_vers: "1-00",
  cl_login: CDO.acapela_login,
  cl_app: CDO.acapela_app,
  cl_pwd: CDO.acapela_password
}

def acapela_text_to_audio_url(text, voice="rachel22k")
  url = URI.parse(VAAS_URL)
  res = Net::HTTP.post_form(url, VAAS_HASH.merge({
    req_voice: voice,
    req_text: text
  }))
  CGI.parse(res.body)["snd_url"][0]
end
