require 'phantomjs'
require 'open-uri'
require 'cdo/tempfile'
require 'cdo/hip_chat'

module PDF

  def self.merge_all_file_pdfs(glob)
    Dir.glob(glob).each do |file|
      self.merge_file_pdfs(file, file.sub('.collate', '.pdf'))
    end
  end

  def self.merge_file_pdfs(collate_file, output_path)
    self.merge_pdfs(output_path, *parse_collate_file(collate_file))
  end

  def self.get_local_pdf_paths(collate_file)
    existing_files remove_urls parse_collate_file(collate_file)
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
    File.open(collate_file)
      .map(&:strip)
      .reject { |s| s.nil? || s == '' }
      .map do |filename|
        next filename if URI.parse(filename).scheme == 'http'
        File.expand_path(filename, File.dirname(collate_file))
      end
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
end
