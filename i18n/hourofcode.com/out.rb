#! /usr/bin/env ruby
require 'fileutils'

# language => [locale, code, crowdincode]
languages = {
  'Albanian' => ['sq-AL', 'sq'],
  'Arabic' => ['ar-SA', 'ar'],
  'Armenian' => ['hy-AM', 'hy'],
  'Azerbaijani' => ['az-AZ', 'az'],
  'Basque' => ['eu-ES', 'eu'],
  'Bengali' => ['bn-BD', 'bn'],
  'Bosnian' => ['bs-BA', 'bs'],
  'Bulgarian' => ['bg-BG', 'bg'],
  'Catalan' => ['ca-ES', 'ca'],
  'Chinese Simplified' => ['zh-CN', 'cn', 'zh'],
  'Chinese Traditional' => ['zh-TW', 'zh'],
  'Croatian' => ['hr-HR', 'hr'],
  'Czech' => ['cs-CZ', 'cs'],
  'Danish' => ['da-DK', 'da'],
  'Dari' => ['fa-AF', 'af', 'fa-AF'],
  'Dutch' => ['nl-NL', 'nl'],
  'English, United States' => ['en-US', 'en'],
  'English, United Kingdom' => ['en-GB', 'gb', 'en-GB'],
  'Estonian' => ['et-EE', 'et'],
  'Filipino' => ['fil-PH', 'ph', 'fil'],
  'Finnish' => ['fi-FI', 'fi'],
  'French' => ['fr-FR', 'fr'],
  'Galician' => ['gl-ES', 'gl'],
  'Georgian' => ['ka-GE', 'ka'],
  'German' => ['de-DE', 'de'],
  'Greek' => ['el-GR', 'el'],
  'Hebrew' => ['he-IL', 'he'],
  'Hindi' => ['hi-IN', 'hi'],
  'Hungarian' => ['hu-HU', 'hu'],
  'Icelandic' => ['is-IS', 'is'],
  'Indonesian' => ['id-ID', 'id'],
  'Irish' => ['ga-IE', 'ga'],
  'Italian' => ['it-IT', 'it'],
  'Japanese' => ['ja-JP', 'ja'],
  'Khmer' => ['km-KH', 'km'],
  'Korean' => ['ko-KR', 'ko'],
  'Kurdish' => ['ku-IQ', 'ku'],
  'Latvian' => ['lv-LV', 'lv'],
  'Lithuanian' => ['lt-LT', 'lt'],
  'Macedonian (FYROM)' => ['mk-MK', 'mk'],
  'Malay' => ['ms-MY', 'ms'],
  'Maltese' => ['mt-MT', 'mt'],
  'Marathi' => ['mr-IN', 'mr'],
  'Nepali' => ['ne-NP', 'ne'],
  'Norwegian' => ['no-NO', 'no'],
  'Norwegian Nynorsk' => ['nn-NO', 'nn'],
  'Pashto' => ['ps-AF', 'ps'],
  'Persian' => ['fa-IR', 'fa'],
  'Polish' => ['pl-PL', 'pl'],
  'Portuguese' => ['pt-PT', 'po', 'pt'],
  'Portuguese, Brazilian' => ['pt-BR', 'pt'],
  'Romanian' => ['ro-RO', 'ro'],
  'Russian' => ['ru-RU', 'ru'],
  'Serbian (Cyrillic)' => ['sr-SP', 'sr'],
  'Slovak' => ['sk-SK', 'sk'],
  'Slovenian' => ['sl-SI', 'sl'],
  'Spanish' => ['es-ES', 'es'],
  'Spanish, Mexico' => ['es-MX', 'la', 'es-MX'],
  'Swedish' => ['sv-SE', 'sv'],
  'Tamil' => ['ta-IN', 'ta'],
  'Thai' => ['th-TH', 'th'],
  'Turkish' => ['tr-TR', 'tr'],
  'Ukrainian' => ['uk-UA', 'uk'],
  'Urdu (Pakistan)' => ['ur-PK', 'ur'],
  'Vietnamese' => ['vi-VN', 'vi']
}


#########################################################################################
##                                                                                     ##
## rename folders and files from crowdin codes to our codes                            ##
##                                                                                     ##
#########################################################################################

languages.each_pair do |name, codes|
  # rename downloaded folders from language to locale
  if File.directory?("../locales/#{name}/")
    FileUtils.cp_r "../locales/#{name}/.", "../locales/#{codes[0]}"
    FileUtils.rm_r "../locales/#{name}"
  end

  # rename yml file from en.yml to code
  File.rename("../locales/#{codes[0]}/hourofcode/en.yml", "../locales/#{codes[0]}/hourofcode/#{codes[1]}.yml")

  # edit the code in the yml file for special coded languages
  unless codes[2].nil?
  	file = "../locales/#{codes[0]}/hourofcode/#{codes[1]}.yml"
		File.write(file, File.read(file).gsub(/#{codes[2]}:/, "#{codes[1]}:"))
  end
end



# #########################################################################################
# ##                                                                                     ##
# ## copy files from i18n to hoc.com                                                     ##
# ##                                                                                     ##
# #########################################################################################

# languages.each_pair do |name, codes|
# 	i18n_dir = Dir["../locales/#{codes[0]}/hourofcode"]
# 	hoc_dir = Dir["../../pegasus/sites.v3/hourofcode.com/i18n"]

# 	FileUtils.cp(i18n_dir + "#{codes[1]}.yml", hoc_dir)

# 	i18n_dir.each do |file|
# 		FileUtils.cp(i18n_dir + "/**/*.md", hoc_dir + "/public/#{codes[1]}")
# 	end
# end



# #########################################################################################
# ##                                                                                     ##
# ## clean up crowdin markdown errors                                                    ##
# ##                                                                                     ##
# #########################################################################################

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
