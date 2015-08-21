#! /usr/bin/env ruby
require 'fileutils'

langtolocale = {
  'Albanian' => 'sq-AL',
  'Arabic' => 'ar-SA',
  'Armenian' => 'hy-AM',
  'Azerbaijani' => 'az-AZ',
  'Basque' => 'eu-ES',
  'Bengali' => 'bn-BD',
  'Bosnian' => 'bs-BA',
  'Bulgarian' => 'bg-BG',
  'Catalan' => 'ca-ES',
  'Chinese Simplified' => 'zh-CN',
  'Chinese Traditional' => 'zh-TW',
  'Croatian' => 'hr-HR',
  'Czech' => 'cs-CZ',
  'Danish' => 'da-DK',
  'Dari' => 'fa-AF',
  'Dutch' => 'nl-NL',
  'English, United States' => 'en-US',
  'English, United Kingdom' => 'en-GB',
  'Estonian' => 'et-EE',
  'Filipino' => 'fil-PH',
  'Finnish' => 'fi-FI',
  'French' => 'fr-FR',
  'Galician' => 'gl-ES',
  'Georgian' => 'ka-GE',
  'German' => 'de-DE',
  'Greek' => 'el-GR',
  'Hebrew' => 'he-IL',
  'Hindi' => 'hi-IN',
  'Hungarian' => 'hu-HU',
  'Icelandic' => 'is-IS',
  'Indonesian' => 'id-ID',
  'Irish' => 'ga-IE',
  'Italian' => 'it-IT',
  'Japanese' => 'ja-JP',
  'Khmer' => 'km-KH',
  'Korean' => 'ko-KR',
  'Kurdish' => 'ku-IQ',
  'Latvian' => 'lv-LV',
  'Lithuanian' => 'lt-LT',
  'Macedonian (FYROM)' => 'mk-MK',
  'Malay' => 'ms-MY',
  'Maltese' => 'mt-MT',
  'Marathi' => 'mr-IN',
  'Nepali' => 'ne-NP',
  'Norwegian' => 'no-NO',
  'Norwegian Nynorsk' => 'nn-NO',
  'Pashto' => 'ps-AF',
  'Persian' => 'fa-IR',
  'Polish' => 'pl-PL',
  'Portuguese' => 'pt-PT',
  'Portuguese, Brazilian' => 'pt-BR',
  'Romanian' => 'ro-RO',
  'Russian' => 'ru-RU',
  'Serbian (Cyrillic)' => 'sr-SP',
  'Slovak' => 'sk-SK',
  'Slovenian' => 'sl-SI',
  'Spanish' => 'es-ES',
  'Spanish, Mexico' => 'es-MX',
  'Swedish' => 'sv-SE',
  'Tamil' => 'ta-IN',
  'Thai' => 'th-TH',
  'Turkish' => 'tr-TR',
  'Ukrainian' => 'uk-UA',
  'Urdu (Pakistan)' => 'ur-PK',
  'Vietnamese' => 'vi-VN'
}

localetocode = {
  'sq-AL' => 'sq',
  'ar-SA' => 'ar',
  'hy-AM' => 'hy',
  'az-AZ' => 'az',
  'eu-ES' => 'eu',
  'bn-BD' => 'bn',
  'bs-BA' => 'bs',
  'bg-BG' => 'bg',
  'ca-ES' => 'ca',
  'zh-CN' => 'cn',
  'zh-TW' => 'zh',
  'hr-HR' => 'hr',
  'cs-CZ' => 'cs',
  'da-DK' => 'da',
  'fa-AF' => 'af',
  'nl-NL' => 'nl',
  'en-US' => 'en',
  'en-GB' => 'gb',
  'et-EE' => 'et',
  'fil-PH' => 'ph',
  'fi-FI' => 'fi',
  'fr-FR' => 'fr',
  'gl-ES' => 'gl',
  'ka-GE' => 'ka',
  'de-DE' => 'de',
  'el-GR' => 'el',
  'he-IL' => 'he',
  'hi-IN' => 'hi',
  'hu-HU' => 'hu',
  'is-IS' => 'is',
  'id-ID' => 'id',
  'ga-IE' => 'ga',
  'it-IT' => 'it',
  'ja-JP' => 'ja',
  'km-KH' => 'km',
  'ko-KR' => 'ko',
  'ku-IQ' => 'ku',
  'lv-LV' => 'lv',
  'lt-LT' => 'lt',
  'mk-MK' => 'mk',
  'ms-MY' => 'ms',
  'mt-MT' => 'mt',
  'mr-IN' => 'mr',
  'ne-NP' => 'ne',
  'no-NO' => 'no',
  'nn-NO' => 'nn',
  'ps-AF' => 'ps',
  'fa-IR' => 'fa',
  'pl-PL' => 'pl',
  'pt-PT' => 'po',
  'pt-BR' => 'pt',
  'ro-RO' => 'ro',
  'ru-RU' => 'ru',
  'sr-SP' => 'sr',
  'sk-SK' => 'sk',
  'sl-SI' => 'sl',
  'es-ES' => 'es',
  'es-MX' => 'la',
  'sv-SE' => 'sv',
  'ta-IN' => 'ta',
  'th-TH' => 'th',
  'tr-TR' => 'tr',
  'uk-UA' => 'uk',
  'ur-PK' => 'ur',
  'vi-VN' => 'vi'
}

langtolocale.each_pair do |language, locale|
  if File.directory?("../locales/#{language}/")
    FileUtils.cp_r "../locales/#{language}/.", "../locales/#{locale}"
    FileUtils.rm_r "../locales/#{language}"
  end
end


# # copy xx.yml files to hourofcode.com/i18n
# my_dir = Dir["../locales/**/hourofcode/*.yml"]
# my_dir.each do |file|
#   dest = "../../pegasus/sites.v3/hourofcode.com/i18n"
#   FileUtils.cp(file, dest)
# end

# # remove all metadata
# Dir.glob("../../pegasus/sites.v3/hourofcode.com/public/us/**/*.md").each do |file|
#   File.write(file, File.read(file).gsub(/^.*\*\s\*\s\*/m, ""))
# end

# # remove broken social tags from thanks.md
# Dir.glob("../../pegasus/sites.v3/hourofcode.com/public/us/**/thanks.md").each do |file|
#   File.write(file, File.read(file).gsub(/<% facebook.+?\%>/m, ""))
# end

# # add social tags to thanks.md
# Dir.glob("../../pegasus/sites.v3/hourofcode.com/public/us/**/thanks.md").each do |file|
#   File.write(file, '<% facebook = {:u=>"http://#{request.host}/us"}
#                       twitter = {:url=>"http://hourofcode.com", :related=>"codeorg", :hashtags=>"", :text=>hoc_s(:twitter_default_text)}
#                       twitter[:hashtags] = "HourOfCode" unless hoc_s(:twitter_default_text).include? "#HourOfCode" %>' + File.read(file))
# end

# # add metadata to resources.md
# Dir.glob("../../pegasus/sites.v3/hourofcode.com/public/us/**/resources.md").each do |file|
#   File.write(file, "---\nlayout: wide\nnav: resources_nav\n---" + File.read(file))
# end
