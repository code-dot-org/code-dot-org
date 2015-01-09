#! /usr/bin/env ruby
require 'fileutils'

locales = {
	'ar' => 'ar-SA',
	'as' => 'as-IN',
	'az' => 'az-AZ',
	'bg' => 'bg-BG',
	'bn' => 'bn-BD',
	'bs' => 'bs-BA',
	'ca' => 'ca-ES',
	'cs' => 'cs-CZ',
	'da' => 'da-DK',
	'de' => 'de-DE',
	'el' => 'el-GR',
	'en' => 'en-US',
	'et' => 'et-EE',
	'eu' => 'eu-ES',
	'fa' => 'fa-IR',
	'fi' => 'fi-FI',
	'fil' => 'fil-PH',
	'fr' => 'fr-FR',
	'he' => 'he-IL',
	'hi' => 'hi-IN',
	'hr' => 'hr-HR',
	'hu' => 'hu-HU',
	'id' => 'id-ID',
	'is' => 'is-IS',
	'it' => 'it-IT',
	'ja' => 'ja-JP',
	'kk' => 'kk-KZ',
	'km' => 'km-KH',
	'ko' => 'ko-KR',
	'lt' => 'lt-LT',
	'lv' => 'lv-LV',
	'mk' => 'mk-MK',
	'ms' => 'ms-MY',
	'mt' => 'mt-MT',
	'nl' => 'nl-NL',
	'no' => 'no-NO',
	'pl' => 'pl-PL',
	'ps' => 'ps-AF',
	'ro' => 'ro-RO',
	'ru' => 'ru-RU',
	'sk' => 'sk-SK',
	'sl' => 'sl-SI',
	'sq' => 'sq-AL',
	'sr' => 'sr-SP',
	'ta' => 'ta-IN',
	'th' => 'th-TH',
	'tr' => 'tr-TR',
	'uk' => 'uk-UA',
	'vi' => 'vi-VN'
}

locales.each_pair do |two_letters_code, locale_code|
	FileUtils.cp_r "../locales/#{two_letters_code}/.", "../locales/#{locale_code}"
	FileUtils.rm_r "../locales/#{two_letters_code}"
end