#!/usr/bin/env ruby

# Pulls in all strings that need to be translated. Pulls source
# files from blockly-core, apps, pegasus, and dashboard
# as well as instructions for levelbuilder supported levels and
# collects them to the single source folder i18n/locales/source.

require File.expand_path('../../../dashboard/config/environment', __FILE__)
require 'fileutils'
require 'json'
require 'digest/md5'

require_relative 'hoc_sync_utils'
require_relative 'i18n_script_utils'
require_relative 'redact_restore_utils'
require_relative '../animation_assets/manifest_builder'

def sync_in
  puts "Sync in starting"
  CurriculumSyncUtils.sync_in
  HocSyncUtils.sync_in
  localize_level_and_project_content
  localize_block_content
  localize_animation_library
  localize_shared_functions
  puts "Copying source files"
  I18nScriptUtils.run_bash_script "bin/i18n-codeorg/in.sh"
  redact_level_content
  redact_block_content
  redact_script_and_course_content
  localize_markdown_content
  puts "Sync in completed successfully"
rescue => e
  puts "Sync in failed from the error: #{e}"
  raise e
end

def localize_level_and_project_content
  variable_strings = {}
  parameter_strings = {}
  localize_level_content(variable_strings, parameter_strings)
  localize_project_content(variable_strings, parameter_strings)
  write_to_yml("variable_names", variable_strings)
  write_to_yml("parameter_names", parameter_strings)
end

def get_i18n_strings(level)
  i18n_strings = {}

  if level.is_a?(DSLDefined)
    text = level.dsl_text
    i18n_strings["dsls"] = level.class.dsl_class.parse(text, '')[1] if text
  elsif level.is_a?(Level)
    %w(
      display_name
      bubble_choice_description
      short_instructions
      long_instructions
      failure_message_overrides
      teacher_markdown
      placeholder
      title
    ).each do |prop|
      i18n_strings[prop] = level.try(prop)
    end

    # authored_hints
    if level.authored_hints
      authored_hints = JSON.parse(level.authored_hints)
      i18n_strings['authored_hints'] = Hash.new unless authored_hints.empty?
      authored_hints.each do |hint|
        i18n_strings['authored_hints'][hint['hint_id']] = hint['hint_markdown']
      end
    end

    # callouts
    if level.callout_json
      callouts = JSON.parse(level.callout_json)
      i18n_strings['callouts'] = Hash.new unless callouts.empty?
      callouts.each do |callout|
        i18n_strings['callouts'][callout['localization_key']] = callout['callout_text']
      end
    end

    level_xml = Nokogiri::XML(level.to_xml, &:noblanks)
    blocks = level_xml.xpath('//blocks').first
    if blocks
      ## Categories
      block_categories = blocks.xpath('//category')
      i18n_strings['block_categories'] = Hash.new unless block_categories.empty?
      block_categories.each do |category|
        name = category.attr('name')
        i18n_strings['block_categories'][name] = name if name
      end

      ## Function Names
      functions = blocks.xpath("//block[@type=\"procedures_defnoreturn\"]")
      i18n_strings['function_definitions'] = Hash.new unless functions.empty?
      functions.each do |function|
        name = function.at_xpath('./title[@name="NAME"]')
        description = function.at_xpath('./mutation/description')
        parameters = function.xpath('./mutation/arg').map do |parameter|
          [parameter["name"], parameter["name"]]
        end.to_h
        function_definition = Hash.new
        function_definition["name"] = name.content if name
        function_definition["description"] = description.content if description
        function_definition["parameters"] = parameters unless parameters.empty?
        i18n_strings['function_definitions'][name.content] = function_definition
      end

      # Spritelab behaviors
      behaviors = blocks.xpath("//block[@type=\"behavior_definition\"]")
      i18n_strings['behavior_names'] = Hash.new unless behaviors.empty?
      behaviors.each do |behavior|
        name = behavior.at_xpath('./title[@name="NAME"]')
        i18n_strings['behavior_names'][name.content] = name.content if name
      end

      ## Variable Names
      variables_get = blocks.xpath("//block[@type=\"variables_get\"]")
      variables_set = blocks.xpath("//block[@type=\"variables_set\"]")
      variables = variables_get + variables_set
      i18n_strings['variable_names'] = Hash.new unless variables.empty?
      variables.each do |variable|
        name = variable.at_xpath('./title[@name="VAR"]')
        i18n_strings['variable_names'][name.content] = name.content if name
      end

      ## Parameter Names
      parameters = blocks.xpath("//block[@type=\"parameters_get\"]")
      i18n_strings['parameter_names'] = Hash.new unless parameters.empty?
      parameters.each do |parameter|
        name = parameter.at_xpath('./title[@name="VAR"]')
        i18n_strings['parameter_names'][name.content] = name.content if name
      end

      ## Placeholder texts
      i18n_strings['placeholder_texts'] = Hash.new
      i18n_strings['placeholder_texts'].merge! get_placeholder_texts(blocks, 'text', ['TEXT'])
      i18n_strings['placeholder_texts'].merge! get_placeholder_texts(blocks, 'studio_ask', ['TEXT'])
      i18n_strings['placeholder_texts'].merge! get_placeholder_texts(blocks, 'studio_showTitleScreen', %w(TEXT TITLE))
    end
  end

  if level.is_a? BubbleChoice
    i18n_strings["sublevels"] = {}
    level.sublevels.map do |sublevel|
      i18n_strings["sublevels"][sublevel.name] = get_i18n_strings sublevel
      # Block categories, variables, and parameters are handled differently below and are generally covered by the script levels
      %w[block_categories variable_names parameter_names].each do |type|
        i18n_strings["sublevels"][sublevel.name].delete(type) if i18n_strings["sublevels"][sublevel.name].key? type
      end
    end
  end

  i18n_strings["contained levels"] = level.contained_levels.map do |contained_level|
    get_i18n_strings(contained_level)
  end

  i18n_strings.delete_if {|_, value| value.blank?}
end

def get_placeholder_texts(blocks, block_type, title_names)
  results = {}
  blocks.xpath("//block[@type=\"#{block_type}\"]").each do |block|
    title_names.each do |title_name|
      title = block.at_xpath("./title[@name=\"#{title_name}\"]")

      # Skip empty or untranslatable string.
      # A translatable string must have at least 3 consecutive alphabetic characters.
      next unless title&.content =~ /[a-zA-Z]{3,}/

      # Use only alphanumeric characters in lower cases as string key
      text_key = Digest::MD5.hexdigest title.content
      results[text_key] = title.content
    end
  end

  results
end

def localize_project_content(variable_strings, parameter_strings)
  puts "Preparing project content"
  project_content_file = "../#{I18N_SOURCE_DIR}/course_content/projects.json"
  project_strings = {}

  Dir.chdir(Rails.root) do
    ProjectsController::STANDALONE_PROJECTS.each do |key, value|
      next unless value["i18n"]
      level = Level.find_by_name(value["name"])
      url = "https://studio.code.org/p/#{key}"
      project_strings[url] = get_i18n_strings(level)
      # Block categories are handled differently below and are generally covered by the script levels
      project_strings[url].delete("block_categories") if project_strings[url].key? "block_categories"

      # add project-level variables to the flattened hash structures of
      # all variable & parameter strings
      if project_strings[url].key? "variable_names"
        variable_strings.merge! project_strings[url].delete("variable_names")
      end
      if project_strings[url].key? "parameter_names"
        parameter_strings.merge! project_strings[url].delete("parameter_names")
      end
    end
    project_strings.delete_if {|_, value| value.blank?}

    File.open(project_content_file, "w") do |file|
      file.write(JSON.pretty_generate(project_strings))
    end
  end
end

def localize_level_content(variable_strings, parameter_strings)
  puts "Preparing level content"

  block_category_strings = {}
  progression_strings = {}
  level_content_directory = "../#{I18N_SOURCE_DIR}/course_content"

  # We have to run this specifically from the Rails directory because
  # get_i18n_strings relies on level.dsl_text which relies on level.filename
  # which relies on running a shell command
  Dir.chdir(Rails.root) do
    Script.all.each do |script|
      next unless ScriptConstants.i18n? script.name
      script_strings = {}
      script.script_levels.each do |script_level|
        level = script_level.oldest_active_level
        # Don't localize encrypted levels; the whole point of encryption is to
        # keep the contents of certain levels secret.
        next if level.encrypted?

        url = I18nScriptUtils.get_level_url_key(script, level)
        script_strings[url] = get_i18n_strings(level)
        progression_strings[script_level.progression] = script_level.progression if script_level.progression

        # extract block category strings; although these are defined for each
        # level, the expectation here is that there is a massive amount of
        # overlap between levels, so we actually want to just present these all
        # as a single group rather than breaking them up by script
        if script_strings[url].key? "block_categories"
          block_category_strings.merge! script_strings[url].delete("block_categories")
        end

        # do the same for variables and parameters
        if script_strings[url].key? "variable_names"
          variable_strings.merge! script_strings[url].delete("variable_names")
        end

        if script_strings[url].key? "parameter_names"
          parameter_strings.merge! script_strings[url].delete("parameter_names")
        end
      end
      script_strings.delete_if {|_, value| value.blank?}

      # We want to make sure to categorize HoC scripts as HoC scripts even if
      # they have a version year, so this ordering is important
      script_i18n_directory =
        if ScriptConstants.script_in_category?(:hoc, script.name)
          File.join(level_content_directory, "Hour of Code")
        elsif script.version_year
          File.join(level_content_directory, script.version_year)
        else
          File.join(level_content_directory, "other")
        end

      FileUtils.mkdir_p script_i18n_directory
      script_i18n_name = "#{script.name}.json"
      script_i18n_filename = File.join(script_i18n_directory, script_i18n_name)

      next if I18nScriptUtils.script_directory_change?(script_i18n_name, script_i18n_filename)

      File.write(script_i18n_filename, JSON.pretty_generate(script_strings))
    end
  end

  write_to_yml("block_categories", block_category_strings)
  write_to_yml("progressions", progression_strings)
end

def write_to_yml(type, strings)
  File.open(File.join(I18N_SOURCE_DIR, "dashboard/#{type}.yml"), 'w') do |file|
    # Format strings for consumption by the rails i18n engine
    formatted_data = {
      "en" => {
        "data" => {
          type => strings.sort.to_h
        }
      }
    }
    file.write(I18nScriptUtils.to_crowdin_yaml(formatted_data))
  end
end

# Pull in various fields for custom blocks from .json files and save them to
# blocks.en.yml.
def localize_block_content
  puts "Preparing block content"

  blocks = {}

  Dir.glob('dashboard/config/blocks/**/*.json').sort.each do |file|
    name = File.basename(file, '.*')
    config = JSON.parse(File.read(file))['config']
    blocks[name] = {
      'text' => config['blockText'],
    }

    next unless config['args']

    args_with_options = {}
    config['args'].each do |arg|
      next if !arg['options'] || arg['options'].empty?

      options = args_with_options[arg['name']] = {}
      arg['options'].each do |option_tuple|
        options[option_tuple.last] = option_tuple.first
      end
    end
    blocks[name]['options'] = args_with_options unless args_with_options.empty?
  end

  File.open("dashboard/config/locales/blocks.en.yml", "w+") do |f|
    f.write(I18nScriptUtils.to_crowdin_yaml({"en" => {"data" => {"blocks" => blocks}}}))
  end
end

def localize_animation_library
  spritelab_animation_source_file = "#{I18N_SOURCE_DIR}/animations/spritelab_animation_library.json"
  FileUtils.mkdir_p(File.dirname(spritelab_animation_source_file))
  File.open(spritelab_animation_source_file, "w") do |file|
    animation_strings = ManifestBuilder.new({spritelab: true, silent: true}).get_animation_strings
    file.write(JSON.pretty_generate(animation_strings))
  end
end

def localize_shared_functions
  puts "Preparing shared functions"

  shared_functions = SharedBlocklyFunction.where(level_type: 'GamelabJr').pluck(:name)
  hash = {}
  shared_functions.sort.each do |func|
    hash[func] = func
  end
  File.open("i18n/locales/source/dashboard/shared_functions.yml", "w+") do |f|
    f.write(I18nScriptUtils.to_crowdin_yaml({"en" => {"data" => {"shared_functions" => hash}}}))
  end
end

def select_redactable(i18n_strings)
  redactable_content = %w(
    authored_hints
    long_instructions
    short_instructions
    teacher_markdown
  )

  redactable = i18n_strings.select do |key, _|
    redactable_content.include? key
  end

  if i18n_strings.key? "contained levels"
    contained_levels = i18n_strings["contained levels"].map do |contained_level|
      select_redactable(contained_level)
    end
    contained_levels.select! do |result|
      !result.blank?
    end
    redactable["contained levels"] = contained_levels unless contained_levels.empty?
  end

  redactable.delete_if {|_k, v| v.blank?}
end

def redact_level_file(source_path)
  return unless File.exist? source_path
  source_data = JSON.load(File.open(source_path))
  return if source_data.blank?

  redactable_data = source_data.map do |level_url, i18n_strings|
    [level_url, select_redactable(i18n_strings)]
  end.to_h

  backup_path = source_path.sub("source", "original")
  FileUtils.mkdir_p File.dirname(backup_path)
  File.open(backup_path, "w") do |file|
    file.write(JSON.pretty_generate(redactable_data))
  end

  redacted_data = RedactRestoreUtils.redact_data(redactable_data, ['blockly'])

  File.open(source_path, 'w') do |source_file|
    source_file.write(JSON.pretty_generate(source_data.deep_merge(redacted_data)))
  end
end

def redact_level_content
  puts "Redacting level content"

  Dir.glob(File.join(I18N_SOURCE_DIR, "course_content/**/*.json")).each do |source_path|
    redact_level_file(source_path)
  end
end

def redact_block_content
  puts "Redacting block content"

  source = File.join(I18N_SOURCE_DIR, "dashboard/blocks.yml")
  backup = source.sub("source", "original")
  FileUtils.mkdir_p(File.dirname(backup))
  FileUtils.cp(source, backup)
  RedactRestoreUtils.redact(source, source, ['blockfield'], 'txt')
end

def redact_script_and_course_content
  plugins = %w(resourceLink vocabularyDefinition)
  fields = %w(description student_description description_student description_teacher)

  %w(script course).each do |type|
    puts "Redacting #{type} content"
    source = File.join(I18N_SOURCE_DIR, "dashboard/#{type}s.yml")

    # Save the original data, for restoration
    original = source.sub("source", "original")
    FileUtils.mkdir_p(File.dirname(original))
    FileUtils.cp(source, original)

    # Redact the specific subset of fields within each script that we care about.
    data = YAML.load_file(source)
    data['en']['data'][type]['name'].values.each do |datum|
      markdown_data = datum.slice(*fields)
      redacted_data = RedactRestoreUtils.redact_data(markdown_data, plugins, 'md')
      datum.merge!(redacted_data)
    end

    # Overwrite source file with redacted data
    File.write(source, I18nScriptUtils.to_crowdin_yaml(data))
  end
end

def localize_markdown_content
  markdown_files_to_localize = %w[
    international/about.md.partial
    educate/curriculum/csf-transition-guide.md
    ai.md.partial
    athome.md.partial
    break.md.partial
    csforgood.md
    hourofcode/artist.md.partial
    hourofcode/flappy.md.partial
    hourofcode/frozen.md.partial
    hourofcode/hourofcode.md.partial
    hourofcode/infinity.md.partial
    hourofcode/mc.md.partial
    hourofcode/playlab.md.partial
    hourofcode/starwars.md.partial
    hourofcode/unplugged-conditionals-with-cards.md.partial
  ]
  markdown_files_to_localize.each do |path|
    original_path = File.join('pegasus/sites.v3/code.org/public', path)
    original_path_exists = File.exist?(original_path)
    puts "#{original_path} does not exist" unless original_path_exists
    next unless original_path_exists
    # Remove the .partial if it exists
    source_path = File.join(I18N_SOURCE_DIR, 'markdown/public', File.dirname(path), File.basename(path, '.partial'))
    FileUtils.mkdir_p(File.dirname(source_path))
    FileUtils.cp(original_path, source_path)
  end
  Dir.glob(File.join(I18N_SOURCE_DIR, "markdown/**/*.md")).each do |path|
    header, content, _line = Documents.new.helpers.parse_yaml_header(path)
    I18nScriptUtils.sanitize_header!(header)
    I18nScriptUtils.write_markdown_with_header(content, header, path)
  end
end

sync_in if __FILE__ == $0
