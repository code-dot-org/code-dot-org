require 'open-uri'
require 'json'

module WebPurify
  ISO_639_1_TO_WEBPURIFY = {
      'es' => 'sp',
      'ko' => 'kr',
      'ja' => 'jp'
  }

  def self.find_potential_profanity(text, language_codes = ['en'])
    return nil unless CDO.webpurify_key
    # convert language codes to 2 character, comma separated
    language_codes = language_codes
      .map{|language_code| language_code[0..1]}
      .map{|code| ISO_639_1_TO_WEBPURIFY[code] || code}
      .uniq
      .join(',')
    result = JSON.parse(open("http://api1.webpurify.com/services/rest/?api_key=#{CDO.webpurify_key}&method=webpurify.live.return&text=#{URI.encode(text)}&lang=#{language_codes}&format=json").read)
    if result['rsp'] && result['rsp']['expletive']
      expletive = result['rsp']['expletive']
      expletive = expletive.first if expletive.is_a? Array
      return expletive
    end
    nil
  end
end
