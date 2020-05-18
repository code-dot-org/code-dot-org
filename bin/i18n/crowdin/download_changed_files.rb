#!/usr/bin/env ruby

require File.expand_path('../../../../pegasus/src/env', __FILE__)
require 'cdo/languages'
require 'json'

require_relative '../crowdin'

CHANGES_JSON = "/tmp/changes.json"

def download_changed_files
  api_key = YAML.load_file(File.join(File.dirname(__FILE__), "..", "codeorg_credentials.yml"))["api_key"]
  project = Crowdin.new("codeorg", api_key)

  changes = JSON.parse(File.read(CHANGES_JSON))
  changes.each do |crowdin_code, files|
    language = Languages.table.select.where("crowdin_code_s = #{crowdin_code.inspect}").first
    next unless language

    locale_dir = File.join(File.dirname(__FILE__), "..", "..", "..", "i18n", "locales", language[:crowdin_name_s])
    files.each do |file, _etag|
      response = project.export_file(file, crowdin_code)
      dest = File.join(locale_dir, file)
      FileUtils.mkdir_p(File.dirname(dest))
      File.write(dest, response.body)
    end
  end
end

download_changed_files if __FILE__ == $0
