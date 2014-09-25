require 'phantomjs'
require 'open-uri'
require 'cdo/tempfile'
require 'cdo/hip_chat'
require 'cdo/yaml'
require 'shellwords'

def bash(command)
  system 'bash', '-c', command
end

module PDF

  def self.get_local_pdf_paths(collate_file)
    _, paths = parse_collate_file(collate_file)
    existing_files remove_urls paths
  end

  def self.remove_urls(array)
    array.reject{|f| URI.parse(f).scheme == 'http'}
  end

  def self.existing_files(paths)
    paths.select{|f| File.exists?(f)}
  end

  def self.get_local_markdown_paths(collate_file)
    existing_files get_local_pdf_paths(collate_file).map{|f|f.sub('.pdf', '.md')}
  end

  # Reads collate file, outputs array of fully qualified PDF paths and URLs
  def self.parse_collate_file(collate_file)
    options, body = YAML.parse_yaml_header(IO.read(collate_file))
    all_paths = body.each_line.map(&:strip)
      .reject { |s| s.nil? || s == '' }
      .map do |filename|
        next filename if URI.parse(filename).scheme == 'http'
        File.expand_path(filename, File.dirname(collate_file))
      end
    return [options, all_paths]
  end

  def self.merge_pdfs(output_file, *filenames)
    temp_file_handles = []

    filenames.map! do |filename|
      next filename unless URI.parse(filename).scheme == 'http'
      begin
        local_file = Tempfile.from_url(filename)
      rescue Exception => msg
        puts "Error downloading PDF file #{filename} for output file #{output_file}. Aborting"
        puts "Error message: #{msg}"
        exit 1
      end
      temp_file_handles << local_file
      local_file.path
    end

    gs_command = "gs -q -dNOPAUSE -dBATCH -sDEVICE=pdfwrite -sOutputFile=#{output_file} #{filenames.join(' ')}"

    output = `#{gs_command}`
    status = $?.exitstatus

    unless status == 0
      puts output
      exit status
    end

    temp_file_handles.each(&:unlink)
  end

  # Numbers PDFs using
  #   1. pdftk to get a page count
  #   2. enscript and ps2pdf to generate a page count header
  # Based off of response from http://stackoverflow.com/a/9033109/136134
  def self.number_pdf(input, output)
    page_count = `pdftk "#{input}" dump_data | grep "NumberOfPages" | cut -d":" -f2`.strip
    bash "enscript --quiet -L1 --margin=0:298:800:0 --header-font \"Helvetica@15\" --header='|| $%' --output - < <(for i in $(seq \"#{page_count}\"); do echo; done) | ps2pdf - | pdftk \"#{input}\" multistamp - output #{output}"
  end
end
