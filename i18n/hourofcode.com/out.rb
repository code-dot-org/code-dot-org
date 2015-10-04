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
  'Portuguese, Brazilian' => ['pt-BR', 'pt', 'pt-BR'],
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
languages.each_pair do |name, codes|
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

# fix twitter tags
Dir.glob("../../pegasus/sites.v3/hourofcode.com/i18n/public/**/promote/index.md").each do |file|
  puts file
  File.write(file, File.read(file).gsub(/\stwitter\[:hashtags\]/, "\ntwitter[:hashtags]"))
end

Dir.glob("../../pegasus/sites.v3/hourofcode.com/i18n/public/**/thanks.md").each do |file|
  puts file
  File.write(file, File.read(file).gsub(/\stwitter\[:hashtags\]/, "\ntwitter[:hashtags]"))
end

# fix social media metadata
Dir.glob("../../pegasus/sites.v3/hourofcode.com/i18n/public/**/thanks.md").each do |file|
  puts file
  social_media_metada = "---\ntitle: <%= hoc_s(:title_signup_thanks) %>\nlayout: wide\nsocial:
'og:title': '<%= hoc_s(:meta_tag_og_title) %>'\n'og:description': '<%= hoc_s(:meta_tag_og_description) %>'
'og:image': 'http://<%=request.host%>/images/code-video-thumbnail.jpg'\n'og:image:width': 1705\n'og:image:height': 949
'og:url': 'http://<%=request.host%>'\n'og:video': 'https://youtube.googleapis.com/v/rH7AjDMz_dc'\n'twitter:card': player
'twitter:site': '@codeorg'\n'twitter:url': 'http://<%=request.host%>'\n'twitter:title': '<%= hoc_s(:meta_tag_twitter_title) %>'
'twitter:description': '<%= hoc_s(:meta_tag_twitter_description) %>'\n'twitter:image:src': 'http://<%=request.host%>/images/code-video-thumbnail.jpg'
'twitter:player': 'https://www.youtubeeducation.com/embed/rH7AjDMz_dc?iv_load_policy=3&rel=0&autohide=1&showinfo=0'
'twitter:player:width': 1920\n'twitter:player:height': 1080\n---"
  File.write(file, File.read(file).gsub(/^---.*?---/m, social_media_metada))
end

# fix embedded ruby in markdown
Dir.glob("../../pegasus/sites.v3/hourofcode.com/i18n/public/**/*.md").each do |file|
  puts file
  File.write(file, File.read(file).gsub(/\((%[^%]*%)\)/, "(<\\1>)"))
end
