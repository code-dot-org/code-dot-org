require_relative '../../src/env'
require src_dir 'course'
require 'pdf/collate'
require 'cdo/rake_utils'
require 'cdo/yaml'

# Given a .collate file with lines representing
def collate_to_pdf_to_fetch_file(collate_file)
  source_paths = PDF.get_local_markdown_paths(collate_file) +
      PDF.get_local_pdf_paths(collate_file)
  output_filename = collate_file.sub('.collate', '.pdf')
  v3_path = Course.virtual_to_v3_path(output_filename)
  fetchfile_path = "#{v3_path}.fetch"
  file fetchfile_path => ([collate_file] + source_paths) do
    # Convert all local PDF paths to URLs (since some may be non-local .fetch files)
    options, pdf_paths = PDF.parse_collate_file(collate_file)
    pdf_paths.map! do |pdf_path|
      pdf_path.sub(sites_dir('virtual/curriculum-'), "#{ENV['base_url']}curriculum/")
    end

    PDF.merge_pdfs(output_filename, *pdf_paths)

    if options['number']
      temp_filename = "#{output_filename}.not_numbered"
      FileUtils.mv(output_filename, temp_filename)
      PDF.number_pdf(temp_filename, output_filename)
      FileUtils.rm(temp_filename)
    end

    new_remote_url = RakeUtils.replace_file_with_s3_backed_fetch_file(output_filename, fetchfile_path, bucket: 'cdo-fetch')
    HipChat.log "<b>#{output_filename}</b> generated from <b>#{collate_file}</b>, now at <a href='#{new_remote_url}'>#{new_remote_url}</a>."
  end
  fetchfile_path
end

all_output_files = []

Dir.glob(pegasus_dir('sites/**/*.collate')).each do |collate_file|
  begin
    all_output_files << collate_to_pdf_to_fetch_file(collate_file)
  rescue Exception => e
    HipChat.log "PDF generation failure for #{collate_file}"
    HipChat.log "/quote #{e.message}\n#{CDO.backtrace e}", message_format: 'text'
    raise
  end
end

task default: all_output_files
