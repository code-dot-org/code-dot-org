require 'phantomjs'
require 'cdo/tempfile'
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
    array.reject {|string| string_is_url(string)}
  end

  def self.existing_files(paths)
    paths.select {|f| File.exist?(f)}
  end

  def self.get_local_markdown_paths(collate_file)
    existing_files get_local_pdf_paths(collate_file).map {|f| f.sub('.pdf', '.md')}
  end

  def self.string_is_url(filename)
    ['http', 'https'].include?(URI.parse(filename).scheme)
  end

  # Reads collate file, outputs array of fully qualified PDF paths and URLs
  def self.parse_collate_file(collate_file)
    options, body = YAML.parse_yaml_header(IO.read(collate_file))
    all_paths = body.each_line.map(&:strip).
      reject {|s| s.nil? || s == ''}.
      map do |filename|
        next filename if string_is_url(filename)
        File.expand_path(filename, File.dirname(collate_file))
      end
    return [options, all_paths]
  end

  def self.merge_pdfs(output_file, *filenames)
    temp_file_handles = []

    filenames.map! do |filename|
      next filename unless string_is_url(filename)
      begin
        local_file = Tempfile.from_url(filename)
      rescue Exception => msg
        puts "Error downloading PDF file #{filename} for output file #{output_file}. Aborting"
        puts "Error message: #{msg}"
        raise
      end
      temp_file_handles << local_file
      local_file.path
    end

    merge_local_pdfs(output_file, *filenames)

    temp_file_handles.each(&:unlink)
  end

  def self.merge_local_pdfs(output_file, *filenames)
    escaped_filenames = filenames.map {|f| Shellwords.escape(f)}
    gs_command = "gs -q -dNOPAUSE -dBATCH -sDEVICE=pdfwrite -sOutputFile=#{Shellwords.escape(output_file)} #{escaped_filenames.join(' ')}"

    output = `#{gs_command}`
    status = $?.exitstatus

    unless status == 0
      puts output
      raise "Ghostscript error: non-zero status of #{status}"
    end
  end

  # Numbers PDFs using
  #   1. pdftk to get a page count
  #   2. enscript and ps2pdf to generate and place a page count header
  # Based off of response from http://stackoverflow.com/a/9033109/136134
  # "Center bottom" of page margin differs slightly between OS X and Ubuntu.
  #    OS X:   --margin=0:298:800:0
  #    Ubuntu: --margin=0:298:750:0
  def self.number_pdf(input, output)
    margin = RUBY_PLATFORM.include?('linux') ? '0:298:750:0' : '0:298:800:0'
    page_count = `pdftk "#{input}" dump_data | grep "NumberOfPages" | cut -d":" -f2`.strip
    bash "enscript --quiet -L1 --margin=#{margin} --header-font \"Helvetica@15\" --header='|| $%' --output - < <(for i in $(seq \"#{page_count}\"); do echo; done) | ps2pdf - | pdftk \"#{input}\" multistamp - output #{output}"
  end
end
