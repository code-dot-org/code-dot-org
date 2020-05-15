#!/usr/bin/env ruby

require 'json'
require 'parallel'
require 'yaml'

require_relative '../crowdin'

ETAG_JSON = File.join(File.dirname(__FILE__), "etags.json")
CHANGES_JSON = "/tmp/changes.json"

def fetch_changes
  api_key = YAML.load_file(File.join(File.dirname(__FILE__), "..", "codeorg_credentials.yml"))["api_key"]
  project = Crowdin.new("codeorg", api_key)
  languages = project.languages
  etags = JSON.parse(File.read(ETAG_JSON))
  changes = {}

  languages.each_with_index do |language, i|
    code = language["code"]
    puts "#{language['name']} (#{code}): #{i}/#{languages.length}"
    etags[code] ||= {}
    files = project.list_files

    results = Parallel.map(files) do |file|
      etag = etags[code].fetch(file, nil)
      response = project.export_file(file, code, etag)
      case response.code
      when 200
        [file, response.headers["etag"]]
      when 304
        nil
      else
        raise "cannot handle response code #{response.code}"
      end
    end.compact

    next if results.empty?

    changes[code] = results.to_h
    etags[code].merge!(changes[code])
    File.write(ETAG_JSON, JSON.pretty_generate(etags))
    File.write(CHANGES_JSON, JSON.pretty_generate(changes))
  end
end

fetch_changes if __FILE__ == $0
