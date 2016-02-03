#! /usr/bin/env ruby
require 'fileutils'

locales = {
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
  'English' => 'en-US',
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
  'Kazakh' => 'kk-KZ',
  'Khmer' => 'km-KH',
  'Korean' => 'ko-KR',
  'Kurdish' => 'ku-IQ',
  'Latvian' => 'lv-LV',
  'Lithuanian' => 'lt-LT',
  'Maori' => 'mi-NZ',
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
  'Sinhala' => 'si-LK',
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
  'Uzbek' => 'uz-UZ',
  'Vietnamese' => 'vi-VN',
  'Zulu' => 'zu-ZA'
}

untranslated_apps = [
  'applab',
  'calc',
  'eval',
  'netsim'
]

locales.each_pair do |language, locale|
  if File.directory?("../locales/#{language}/")
    FileUtils.cp_r "../locales/#{language}/.", "../locales/#{locale}"
    FileUtils.rm_r "../locales/#{language}"
  end

  if locale != 'en-US'
    untranslated_apps.each do |app|
      app_locale = locale.sub '-', '_'
      app_locale.downcase!
      FileUtils.cp_r "../../apps/i18n/#{app}/en_us.json", "../../apps/i18n/#{app}/#{app_locale}.json"
    end
  end
end
