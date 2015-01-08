#! /usr/bin/env ruby

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

#rename folders to two letter code so crowdin sorts the translations according to their codes
locales.each_pair do |two_letters_code, locale_code|
	File.rename "../locales/#{locale_code}/", "../locales/#{two_letters_code}/"
end

`crowdin-cli download`

#rename folders to four letter code to match our locale code system
locales.each_pair do |two_letters_code, locale_code|
	File.rename "../locales/#{two_letters_code}/", "../locales/#{locale_code}/"
end