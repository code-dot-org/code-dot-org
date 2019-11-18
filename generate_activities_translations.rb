require 'csv'
require 'yaml'
require_relative './pegasus/src/env'
require 'cdo/languages'

language_alt = {
  "Spanish (Mexico)" => "Spanish, Mexico",
  "Spanish (Spain)" => "Spanish",
  "Chinese (Traditional)" => "Chinese Traditional",
  "Chinese (Simplified)" => "Chinese Simplified",
  "Norwegian (Bokmål)" => "Norwegian",
  "Portuguese (Brazil)" => "Portuguese, Brazilian",
  "Portuguese (Portugal)" => "Portuguese",
}

CSV.table(ARGV[0]).each do |translation|
  target_language = translation[:which_language_are_you_submitting_translations_for]
  lang = Languages.get_hoc_languages.find do |row|
    row[:crowdin_name_s] == target_language || row[:crowdin_name_s] == language_alt[target_language]
  end

  unless lang
    puts "cannot find #{target_language}"
    next
  end

  new_data = {
    lang[:crowdin_code_s] => {
      "tutorial_#{translation[:short_code_s]}_name" => translation[:translated_name_of_activity],
      "tutorial_#{translation[:short_code_s]}_longdescription" => translation[:translated_description],
      "tutorial_#{translation[:short_code_s]}_string_detail_grades" => translation[:translated_grade_level],
      "tutorial_#{translation[:short_code_s]}_string_platforms" => translation[:translated_platform],
      "tutorial_#{translation[:short_code_s]}_string_detail_programming_languages" => translation[:translated_programming_language],
      "tutorial_#{translation[:short_code_s]}_language" => translation[:translated_foreign_language]
    }
  }

  lang_dir = "i18n/locales/source/hourofcode/#{lang[:crowdin_name_s]}/hourofcode"
  FileUtils.mkdir_p lang_dir
  translation_file = File.join(lang_dir, "en.yml")
  translation_data = File.exist?(translation_file) ? YAML.load_file(translation_file) : {}
  translation_data.deep_merge!(new_data)
  File.write(translation_file, translation_data.to_yaml(line_width: -1))
end
