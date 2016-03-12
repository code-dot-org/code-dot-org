#! /usr/bin/env ruby
require 'fileutils'
require 'tempfile'

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
  'Kazakh' => ['kk-KZ', 'kk'],
  'Khmer' => ['km-KH', 'km'],
  'Korean' => ['ko-KR', 'ko'],
  'Kurdish' => ['ku-IQ', 'ku'],
  'Latvian' => ['lv-LV', 'lv'],
  'Lithuanian' => ['lt-LT', 'lt'],
  'Maori' => ['mi-NZ', 'mi'],
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
  'Portuguese, Brazilian' => ['pt-BR', 'pt', 'pt-BR'],
  'Romanian' => ['ro-RO', 'ro'],
  'Russian' => ['ru-RU', 'ru'],
  'Serbian (Cyrillic)' => ['sr-SP', 'sr'],
  'Sinhala' => ['si-LK', 'si'],
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
  'Uzbek' => ['uz-UZ', 'uz'],
  'Vietnamese' => ['vi-VN', 'vi'],
  'Zulu' => ['zu-ZA', 'zu']
}

locale_index = 0
code_index = 1
crowdincode_index = 2

#########################################################################################
##                                                                                     ##
## rename folders and files from crowdin codes to our codes                            ##
##                                                                                     ##
#########################################################################################

puts "Updating crowdin codes to our codes..."
languages.each_pair do |name, codes|
  # rename downloaded folders from language to locale
  if File.directory?("../locales/#{name}/")
    FileUtils.cp_r "../locales/#{name}/.", "../locales/#{codes[locale_index]}"
    FileUtils.rm_r "../locales/#{name}"
  end

  # rename yml file from en.yml to code
  old_path = "../locales/#{codes[locale_index]}/hourofcode/en.yml"
  new_path = "../locales/#{codes[locale_index]}/hourofcode/#{codes[code_index]}.yml"
  File.rename(old_path, new_path)
  puts "Renaming #{codes[locale_index]}.yml to #{codes[code_index]}.yml"

  # edit the code in the yml file for special coded languages
  unless codes[crowdincode_index].nil?
    file = "../locales/#{codes[locale_index]}/hourofcode/#{codes[code_index]}.yml"
    File.write(file, File.read(file).gsub(/#{codes[crowdincode_index]}:/, "#{codes[code_index]}:"))
    puts "Fixed special locale #{codes[crowdincode_index]} to #{codes[code_index]}"
  end
end

#########################################################################################
##                                                                                     ##
## copy files from i18n to hoc.com                                                     ##
##                                                                                     ##
#########################################################################################

puts "Copying files from cdo/i18n to hoc.com/i18n..."
languages.each_value do |codes|
  unless codes[locale_index] == "en-US"
    puts "Copied locale #{codes[code_index]}"

    i18n_path = "../locales/#{codes[locale_index]}/hourofcode"
    hoc_path = "../../pegasus/sites.v3/hourofcode.com/i18n"
    FileUtils.cp(i18n_path + "/#{codes[code_index]}.yml", hoc_path)

    language_folder = hoc_path + "/public/#{codes[code_index]}"
    unless File.directory?(language_folder)
      FileUtils.mkdir_p(language_folder)
      FileUtils.mkdir_p(language_folder + "/files")
      FileUtils.mkdir_p(language_folder + "/images")
      FileUtils.mkdir_p(language_folder + "/how-to")
      FileUtils.mkdir_p(language_folder + "/promote")
      FileUtils.mkdir_p(language_folder + "/prizes")
    end

    i18n_dir = Dir["../locales/#{codes[locale_index]}/hourofcode/*.md"]
    i18n_dir.each do |file|
      FileUtils.cp(file, hoc_path + "/public/#{codes[code_index]}/#{File.basename(file)}")
    end

    i18n_dir = Dir["../locales/#{codes[locale_index]}/hourofcode/how-to/*.md"]
    i18n_dir.each do |file|
      FileUtils.cp(file, hoc_path + "/public/#{codes[code_index]}/how-to/#{File.basename(file)}")
    end

    i18n_dir = Dir["../locales/#{codes[locale_index]}/hourofcode/promote/*.md"]
    i18n_dir.each do |file|
      FileUtils.cp(file, hoc_path + "/public/#{codes[code_index]}/promote/#{File.basename(file)}")
    end

    i18n_dir = Dir["../locales/#{codes[locale_index]}/hourofcode/prizes/*.md"]
    i18n_dir.each do |file|
      FileUtils.cp(file, hoc_path + "/public/#{codes[code_index]}/prizes/#{File.basename(file)}")
    end
  end
end

#########################################################################################
##                                                                                     ##
## clean up crowdin markdown errors                                                    ##
##                                                                                     ##
#########################################################################################

puts "Fixing crowdin markdown errors..."
# replace * * * with ---
Dir.glob("../../pegasus/sites.v3/hourofcode.com/i18n/public/**/*.md").each do |file|
  File.write(file, File.read(file).gsub(/^.*\*\s\*\s\*/, "---"))
end

# fix metadata to be multiline
Dir.glob("../../pegasus/sites.v3/hourofcode.com/i18n/public/**/*.md").each do |file|
  puts file
  metadata_pattern = /(---.*?---)/m
  metadata_matches = File.read(file).match metadata_pattern
  if metadata_matches
    original_metadata = metadata_matches.captures.first
    fixed_metadata = original_metadata.gsub(/ ([a-z]*:)/m, "\n\\1")
    File.write(file, File.read(file).gsub(original_metadata, fixed_metadata))
  end
end

# fix social media buttons in promote/index
Dir.glob("../../pegasus/sites.v3/hourofcode.com/i18n/public/**/promote/index.md").each do |file|
  puts file
  string_replacement = '#{request.host}'
  social_media_buttons = "<%
  facebook = {:u=>\"http://#{string_replacement}/us\"}\n
  twitter = {:url=>\"http://hourofcode.com\", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
  twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode'\n%>"
  File.write(file, File.read(file).gsub(/^<% facebook.*?%>/m, social_media_buttons))
end

# fix social media buttons in public/thanks
Dir.glob("../../pegasus/sites.v3/hourofcode.com/i18n/public/**/thanks.md").each do |file|
  puts file
  string_replacement = '#{request.host}'
  social_media_buttons = "<%
  facebook = {:u=>\"http://#{string_replacement}/us\"}\n
  twitter = {:url=>\"http://hourofcode.com\", :related=>'codeorg', :hashtags=>'', :text=>hoc_s(:twitter_default_text)}
  twitter[:hashtags] = 'HourOfCode' unless hoc_s(:twitter_default_text).include? '#HourOfCode'\n%>"
  File.write(file, File.read(file).gsub(/^<% facebook.*?%>/m, social_media_buttons))
end

# fix social media metadata in public/thanks
Dir.glob("../../pegasus/sites.v3/hourofcode.com/i18n/public/**/thanks.md").each do |file|
  puts file
  social_media_metada = "---
title: <%= hoc_s(:title_signup_thanks) %>
layout: wide
nav: how_to_nav

social:
  \"og:title\": \"<%= hoc_s(:meta_tag_og_title) %>\"
  \"og:description\": \"<%= hoc_s(:meta_tag_og_description) %>\"
  \"og:image\": \"http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png\"
  \"og:image:width\": 1440
  \"og:image:height\": 900
  \"og:url\": \"http://<%=request.host%>\"

  \"twitter:card\": player
  \"twitter:site\": \"@codeorg\"
  \"twitter:url\": \"http://<%=request.host%>\"
  \"twitter:title\": \"<%= hoc_s(:meta_tag_twitter_title) %>\"
  \"twitter:description\": \"<%= hoc_s(:meta_tag_twitter_description) %>\"
  \"twitter:image:src\": \"http://<%=request.host%>/images/hourofcode-2015-video-thumbnail.png\"
---"
  if file.split('/').last(2).first.size == 2
    File.write(file, File.read(file).gsub(/^---.*?---/m, social_media_metada))
  end
end

# fix embedded ruby in markdown
Dir.glob("../../pegasus/sites.v3/hourofcode.com/i18n/public/**/*.md").each do |file|
  puts file
  File.write(file, File.read(file).gsub(/\((%[^%]*%)\)/, "(<\\1>)"))
end

#########################################################################################
##                                                                                     ##
## check for bad translations                                                          ##
##                                                                                     ##
#########################################################################################

def compare_files
  Dir.glob("../../pegasus/sites.v3/hourofcode.com/i18n/public/**/*.md").each do |i18n_file|
    pattern = /..\/..\/pegasus\/sites.v3\/hourofcode.com\/i18n\/public\/[a-z][a-z]/
    source_file = i18n_file.gsub(pattern, "../locales/source/hourofcode")

    puts "checking: " + i18n_file
    system("./diff_code.rb", i18n_file, source_file)
  end
end
compare_files
