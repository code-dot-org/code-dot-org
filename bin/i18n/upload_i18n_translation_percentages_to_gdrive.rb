#!/usr/bin/env ruby
require_relative('../../dashboard/config/environment')
require 'cdo/languages'
require 'cdo/google_drive'
require 'csv'

def try_parse_json(data)
  return JSON.parse(data)
rescue JSON::ParserError
  return data
rescue TypeError
  return data
end

def get_english_field_data(level, field)
  field_json = level.try(field)
  field_data = try_parse_json(field_json)

  return if field_data.nil?

  if field == "callout_json"
    return field_data.reduce({}) do |result, callout|
      result.update(callout["localization_key"] => callout["callout_text"])
    end
  elsif field == "authored_hints"
    return field_data.reduce({}) do |result, hint|
      result.update(hint["hint_id"] => hint["hint_markdown"])
    end
  end

  field_data
end

def get_locale_field_data(level, field)
  if field == "callout_json"
    return get_english_field_data(level, field).keys.reduce({}) do |result, key|
      result.update(key => I18n.t("data.callouts.#{key}"))
    end
  elsif field == "authored_hints"
    hints = level.try(:localized_authored_hints)
    return nil if hints.nil?
    return JSON.parse(hints).reduce({}) do |result, hint|
      result.update(hint["hint_id"] => hint["hint_markdown"])
    end
  end

  localized_json = level.try("localized_#{field}")
  try_parse_json(localized_json)
end

def upload_i18n_stats
  fields = %w(
    authored_hints
    callout_json
    instructions
    markdown_instructions
  )

  scripts = [
    ScriptConstants::COURSEA_NAME,
    ScriptConstants::COURSEB_NAME,
    ScriptConstants::COURSEC_NAME,
    ScriptConstants::COURSED_NAME,
    ScriptConstants::COURSEE_NAME,
    ScriptConstants::COURSEF_NAME,
    ScriptConstants::COURSE1_NAME,
    ScriptConstants::COURSE2_NAME,
    ScriptConstants::COURSE3_NAME,
    ScriptConstants::COURSE4_NAME,
  ].map do |name|
    Script.find_by(name: name)
  end

  Tempfile.open(["i18n_counts", ".csv"]) do |file|
    CSV.open(file.path, "wb") do |csv|
      headers = ["lang"]
      english_data = {}
      scripts.each do |script|
        english_data[script.name] = {}
        fields.each do |field|
          english_data[script.name][field] = 0
          headers << "#{script.name} #{field} total"
          headers << "#{script.name} #{field} translated"
        end

        script.levels.each do |level|
          fields.each do |field|
            field_json = level.try(field)
            next if field_json.nil?

            field_data = try_parse_json(field_json)

            if field_data.is_a?(Hash) || field_data.is_a?(Array)
              english_data[script.name][field] += field_data.length
            elsif field_data.is_a?(String)
              english_data[script.name][field] += 1
            end
          end
        end
      end

      csv << headers

      Languages.get_locale.each do |prop|
        locale = prop[:locale_s]
        next if locale == "en-US"
        I18n.locale = locale
        row = [locale]
        locale_data = {}

        scripts.each do |script|
          locale_data[script.name] = {}
          fields.each do |field|
            locale_data[script.name][field] = 0
          end

          script.levels.each do |level|
            fields.each do |field|
              english = get_english_field_data(level, field)
              next if english.nil?
              locale = get_locale_field_data(level, field)

              if english.is_a?(Hash)
                english.keys.each do |key|
                  locale_data[script.name][field] += 1 if english[key] != locale[key]
                end
              elsif english.is_a?(String)
                locale_data[script.name][field] += 1 if english != locale
              else
                raise "don't know how to count #{english}"
              end
            end
          end

          fields.each do |field|
            row << english_data[script.name][field]
            row << locale_data[script.name][field]
          end
        end

        csv << row
      end
    end

    Google::Drive.new.upload_file_to_folder(file.path, "Data/i18n counts")
  end
end

upload_i18n_stats if __FILE__ == $0
