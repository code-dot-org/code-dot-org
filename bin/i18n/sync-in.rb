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
  Services::I18n::CurriculumSyncUtils.sync_in
  HocSyncUtils.sync_in
  localize_level_and_project_content
  localize_block_content
  localize_animation_library
  localize_shared_functions
  localize_course_offerings
  localize_standards
  localize_docs
  puts "Copying source files"
  I18nScriptUtils.run_bash_script "bin/i18n-codeorg/in.sh"
  localize_external_sources
  redact_level_content
  redact_block_content
  redact_script_and_course_content
  redact_labs_content
  localize_markdown_content
  puts "Sync in completed successfully"
rescue => e
  puts "Sync in failed from the error: #{e}"
  raise e
end

# Takes strings describing and naming Framework, StandardCategory, and Standard
# and places them in the source pool to be sent to crowdin.
def localize_standards
  puts "Preparing standards content"
  standards_content_path = File.join(I18N_SOURCE_DIR, "standards")

  frameworks = {}

  # Localize all frameworks.
  Framework.all.each do |framework|
    frameworks[framework.shortcode] = {
      'name' => framework.name,
      'categories' => {},
      'standards' => {}
    }
  end

  # Localize all categories.
  StandardCategory.all.each do |category|
    framework = category.framework

    categories = frameworks[framework.shortcode]['categories']
    categories[category.shortcode] = {
      'description' => category.description
    }
  end

  # Localize all standards.
  Standard.all.each do |standard|
    framework = standard.framework

    standards = frameworks[framework.shortcode]['standards']
    standards[standard.shortcode] = {
      'description' => standard.description
    }
  end

  FileUtils.mkdir_p(standards_content_path)

  # Then, for each framework, generate a file for it.
  frameworks.keys.each do |framework|
    File.open(File.join(standards_content_path, "#{framework}.json"), "w") do |file|
      file.write(JSON.pretty_generate(frameworks[framework]))
    end
  end
end

# This function localizes all content in studio.code.org/docs
def localize_docs
  puts "Preparing docs content"
  docs_content_file = File.join(I18N_SOURCE_DIR, "docs", "programming_environments.json")
  programming_env_docs = {}
  ProgrammingEnvironment.all.each do |env|
    name = env.name
    programming_env_docs[name] = {
      'name' => env.properties["title"],
      'description' => env.properties["description"],
      'categories' => {},
    }
    env.categories_for_navigation.each do |category|
      programming_env_docs[name]["categories"].store(
        category[:key], {'name' => category[:name]}
      )
    end
  end
  FileUtils.mkdir_p(File.dirname(docs_content_file))
  File.open(docs_content_file, "w") do |file|
    file.write(JSON.pretty_generate(programming_env_docs))
  end
end

# These files are synced in using the `bin/i18n-codeorg/in.sh` script.
def localize_external_sources
  puts "Preparing external sources"
  external_sources_dir = File.join(I18N_SOURCE_DIR, "external-sources")

  # ml-playground files
  # These are overwritten in this format so the properties that use
  # arrays have unique identifiers for translation.
  dataset_files = File.join(external_sources_dir, 'ml-playground', 'datasets', '*')
  Dir.glob(dataset_files).each do |dataset_file|
    original_dataset = JSON.parse(File.read(dataset_file))

    # Converts array to map and uses the field id as a unique identifier.
    fields_as_hash = original_dataset["fields"].map do |field|
      [
        field["id"],
        {
          "id" => field["id"],
          "description" => field["description"]
        }
      ]
    end.to_h

    final_dataset = {
      "fields" => fields_as_hash,
      "card" => {
        "description" => original_dataset.dig("card", "description"),
        "context" => {
          "potentialUses" => original_dataset.dig("card", "context", "potentialUses"),
          "potentialMisuses" => original_dataset.dig("card", "context", "potentialMisuses")
        }
      }
    }

    File.open(dataset_file, "w") do |f|
      f.write(JSON.pretty_generate(final_dataset))
    end
  end
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
        markdown = hint['hint_markdown']
        i18n_strings['authored_hints'][hint['hint_id']] = markdown
        # parse and store placeholder texts
        processed_markdown = Nokogiri::HTML(markdown, &:noblanks)
        placeholders = get_all_placeholder_text_types(processed_markdown)
        if placeholders.present?
          i18n_strings['placeholder_texts'] = Hash.new
          i18n_strings['placeholder_texts'].merge! placeholders
        end
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

    # rubric
    if level.mini_rubric&.to_bool
      rubric_properties = Hash.new
      %w(
        rubric_key_concept
        rubric_performance_level_1
        rubric_performance_level_2
        rubric_performance_level_3
        rubric_performance_level_4
      ).each do |prop|
        prop_value = level.try(prop)
        rubric_properties[prop] = prop_value unless prop_value.nil?
      end
      i18n_strings['mini_rubric'] = Hash.new unless rubric_properties.empty?
      i18n_strings['mini_rubric'].merge! rubric_properties
    end

    # dynamic_instructions
    if level.dynamic_instructions
      dynamic_instructions = JSON.parse(level.dynamic_instructions)
      i18n_strings['dynamic_instructions'] = dynamic_instructions unless dynamic_instructions.empty?
    end

    # parse markdown properties for potential placeholder texts
    documents = []
    %w(
      short_instructions
      long_instructions
    ).each do |prop|
      documents.push level.try(prop) if level.try(prop)
    end
    i18n_strings['placeholder_texts'] = i18n_strings['placeholder_texts'] || Hash.new unless documents.empty?
    documents.each do |document|
      processed_doc = Nokogiri::HTML(document, &:noblanks)
      i18n_strings['placeholder_texts'].merge! get_all_placeholder_text_types(processed_doc)
    end

    # start_html
    if level.start_html
      start_html = Nokogiri::XML(level.start_html, &:noblanks)
      i18n_strings['start_html'] = Hash.new unless level.start_html.empty?

      # match any element that contains text
      start_html.xpath('//*[text()[normalize-space()]]').each do |element|
        puts "element: " + element.text
        i18n_strings['start_html'][element.text] = element.text
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
        # The name is used to uniquely identify the function. Skip if there is no name.
        next unless name
        description = function.at_xpath('./mutation/description')
        parameters = function.xpath('./mutation/arg').map do |parameter|
          [parameter["name"], parameter["name"]]
        end.to_h
        function_definition = Hash.new
        function_definition["name"] = name.content
        function_definition["description"] = description.content if description
        function_definition["parameters"] = parameters unless parameters.empty?
        i18n_strings['function_definitions'][name.content] = function_definition
      end

      # Spritelab behaviors
      behaviors = blocks.xpath("//block[@type=\"behavior_definition\"]")
      unless behaviors.empty?
        i18n_strings['behavior_names'] = Hash.new
        i18n_strings['behavior_descriptions'] = Hash.new
      end
      behaviors.each do |behavior|
        name = behavior.at_xpath('./title[@name="NAME"]')
        description = behavior.at_xpath('./mutation/description')
        i18n_strings['behavior_names'][name.content] = name.content if name
        i18n_strings['behavior_descriptions'][description.content] = description.content if description
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
      i18n_strings['placeholder_texts'] = i18n_strings['placeholder_texts'] || Hash.new
      i18n_strings['placeholder_texts'].merge! get_all_placeholder_text_types(blocks)
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

  if level.is_a? LevelGroup
    i18n_strings["sublevels"] = {}
    level.child_levels.map do |sublevel|
      i18n_strings["sublevels"][sublevel.name] = get_i18n_strings sublevel
    end
  end

  i18n_strings["contained levels"] = level.contained_levels.map do |contained_level|
    get_i18n_strings(contained_level)
  end

  i18n_strings.delete_if {|_, value| value.blank?}
end

def get_all_placeholder_text_types(blocks)
  results = {}
  results.merge! get_placeholder_texts(blocks, 'text', ['TEXT'])
  results.merge! get_placeholder_texts(blocks, 'studio_ask', ['TEXT'])
  results.merge! get_placeholder_texts(blocks, 'studio_showTitleScreen', %w(TEXT TITLE))
  results
end

def get_placeholder_texts(document, block_type, title_names)
  results = {}
  document.xpath("//block[@type=\"#{block_type}\"]").each do |block|
    title_names.each do |title_name|
      title = block.at_xpath("./title[@name=\"#{title_name}\"]")

      # Skip empty or untranslatable string.
      # A translatable string must have at least 3 consecutive alphabetic characters.
      next unless /[a-zA-Z]{3,}/.match?(title&.content)

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
    Unit.all.each do |script|
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
        if Unit.unit_in_category?('hoc', script.name)
          File.join(level_content_directory, "Hour of Code")
        elsif script.unversioned?
          File.join(level_content_directory, "other")
        else
          File.join(level_content_directory, script.version_year)
        end

      FileUtils.mkdir_p script_i18n_directory
      script_i18n_name = "#{script.name}.json"
      script_i18n_filename = File.join(script_i18n_directory, script_i18n_name)

      next if I18nScriptUtils.unit_directory_change?(script_i18n_name, script_i18n_filename)

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
    animation_strings = ManifestBuilder.new({spritelab: true, quiet: true}).get_animation_strings
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

# Aggregate every CourseOffering record's `key` as the translation key, and
# each record's `display_name` as the translation string.
def localize_course_offerings
  puts "Preparing course offerings"

  hash = {}
  CourseOffering.all.sort.each do |co|
    hash[co.key] = co.display_name
  end
  write_dashboard_json('course_offerings', hash)
end

def write_dashboard_json(location, hash)
  File.open(File.join(I18N_SOURCE_DIR, "dashboard/#{location}.json"), "w+") do |f|
    f.write(JSON.pretty_generate(hash))
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
  source_data = JSON.parse(File.read(source_path))
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

# These files are synced in using the `bin/i18n-codeorg/in.sh` script.
def redact_labs_content
  puts "Redacting *labs content"

  # Only CSD labs are redacted, since other labs were already part of the i18n pipeline and redaction would edit
  # strings existing in crowdin already
  redactable_labs = %w(applab gamelab weblab)

  redactable_labs.each do |lab_name|
    source_path = File.join(I18N_SOURCE_DIR, "blockly-mooc", lab_name + ".json")
    backup_path = source_path.sub("source", "original")
    FileUtils.mkdir_p(File.dirname(backup_path))
    FileUtils.cp(source_path, backup_path)
    RedactRestoreUtils.redact(source_path, source_path, ['link'])
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
    ai.md.partial
    athome.md.partial
    break.md.partial
    coldplay.md.partial
    csforgood.md
    curriculum/unplugged.md.partial
    educate/csc.md.partial
    educate/curriculum/csf-transition-guide.md
    educate/it.md
    helloworld.md.partial
    hourofcode/artist.md.partial
    hourofcode/flappy.md.partial
    hourofcode/frozen.md.partial
    hourofcode/hourofcode.md.partial
    hourofcode/infinity.md.partial
    hourofcode/mc.md.partial
    hourofcode/playlab.md.partial
    hourofcode/starwars.md.partial
    hourofcode/unplugged-conditionals-with-cards.md.partial
    international/about.md.partial
    poetry.md.partial
    ../views/hoc2022_create_activities.md.partial
    ../views/hoc2022_play_activities.md.partial
    ../views/hoc2022_explore_activities.md.partial
  ]
  markdown_files_to_localize.each do |path|
    original_path = File.join('pegasus/sites.v3/code.org/public', path)
    original_path_exists = File.exist?(original_path)
    puts "#{original_path} does not exist" unless original_path_exists
    next unless original_path_exists
    # This reforms the `../` relative paths so they appear as though they are
    # within the `public` path. This is a legacy solution to keep things clean
    # when viewed by the translators in crowdin.
    path = path[3...] if path.start_with? "../"
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
