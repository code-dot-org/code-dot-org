require 'json'
require 'parallel'

module Crowdin
  class Utils
    # @param [Crowdin::Project] project
    def initialize(project, options={})
      @project = project
      @etags_json = options.fetch(:etags_json, File.join(File.dirname(__FILE__), "#{project.id}_etags.json"))
      @changes_json = options.fetch(:changes_json, "/tmp/#{project.id}_changes.json")
      @locales_dir = options.fetch(:locales_dir, File.join(File.dirname(__FILE__), "..", "..", "..", "i18n", "locales"))
    end

    # Fetch from Crowdin a list of files changed since the last sync. Uses
    # etags sourced from the @etags_json file to define what we mean by "since
    # the last sync," and writes the results out to @changes_json.
    def fetch_changes
      etags = File.exist?(@etags_json) ? JSON.parse(File.read(@etags_json)) : {}
      changes = {}

      languages = @project.languages
      languages.each_with_index do |language, i|
        code = language["code"]
        puts "#{language['name']} (#{code}): #{i}/#{languages.length}"
        etags[code] ||= {}
        files = @project.list_files

        results = Parallel.map(files) do |file|
          etag = etags[code].fetch(file, nil)
          response = @project.export_file(file, code, etag)
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
        File.write(@etags_json, JSON.pretty_generate(etags))
        File.write(@changes_json, JSON.pretty_generate(changes))
      end
    end

    # Downloades all files referenced in @changes_json, as determined by
    # self.fetch_changes
    def download_changed_files
      changes = JSON.parse(File.read(@changes_json))
      projects.languages.each do |language|
        files = changes.fetch(language["code"], nil)
        next unless files.present?

        locale_dir = File.join(@locales_dir, language["name"])
        Parallel.each(files) do |file, _etag|
          response = @project.export_file(file, crowdin_code)
          dest = File.join(locale_dir, file)
          FileUtils.mkdir_p(File.dirname(dest))
          File.write(dest, response.body)
        end
      end
    end
  end
end
