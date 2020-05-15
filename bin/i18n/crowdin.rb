require 'httparty'

class Crowdin
  include HTTParty

  def initialize(project_id, api_key)
    self.class.base_uri("https://api.crowdin.com/api/project/#{project_id}")
    self.class.default_params key: api_key
  end

  def project_info
    self.class.post("/info")
  end

  def languages
    project_info["info"]["languages"]["item"]
  end

  def list_files
    files = project_info["info"]["files"]["item"]
    results = []
    each_file(files) do |file, path|
      results << File.join(path, file["name"])
    end
    results
  end

  def export_file(file, language, etag=nil)
    options = {
      query: {
        file: file,
        language: language
      }
    }

    unless etag.nil?
      options[:headers] = {
        "If-None-Match" => etag
      }
    end
    self.class.get("/export-file", options)
  end

  private

  def each_file(files, path="")
    files = [files] unless files.is_a? Array
    files.each do |file|
      case file["node_type"]
      when "directory"
        subfiles = file["files"]["item"]
        subpath = File.join(path, file["name"])
        each_file(subfiles, subpath) {|f, p| yield f, p}
      when "file"
        yield file, path
      else
        raise "Cannot process file of type #{file['node_type']}"
      end
    end
  end
end
