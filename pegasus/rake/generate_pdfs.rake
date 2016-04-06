require_relative '../../deployment'
require 'cdo/hip_chat'
require 'cdo/rake_utils'
require 'cdo/db'

PDFConversionInfo = Struct.new(:url_path, :src_files, :output_pdf_path)

def pdf_conversions_for_files(file_pattern, url_extension)
  [].tap do |conversion_infos|
    Dir.glob(file_pattern).each do |file|
      file_path_without_makepdf_extension = File.join(File.dirname(file), File.basename(file, '.makepdf'))
      file_path_without_extension = File.join(File.dirname(file), File.basename(File.basename(file, '.makepdf'), '.*'))
      url_path_from_public_without_extension = file_path_without_extension.match(/public(.*)/)[1]
      url_path = url_path_from_public_without_extension + url_extension + '?pdf_version=true'
      conversion_infos << PDFConversionInfo.new(url_path, [file_path_without_makepdf_extension], file_path_without_extension + '.pdf')
    end
  end
end

def pdf_conversions_for_state_pages(state_codes)
  state_codes.map do |state_code|
    file_path_without_extension = sites_v3_dir('code.org/public/advocacy/state-facts/') + state_code
    url_path_from_public_without_extension = file_path_without_extension.match(/public(.*)/)[1]
    url_path = url_path_from_public_without_extension + '?pdf_version=true'
    PDFConversionInfo.new(url_path, [file_path_without_extension], file_path_without_extension + '.pdf')
  end
end

base_url = ENV['base_url']

def generate_pdf_file(base_url, pdf_conversion_info, fetchfile_for_pdf)
  require 'pdf/conversion'
  url = "#{base_url}#{pdf_conversion_info.url_path}"

  PDF.generate_from_url(url, pdf_conversion_info.output_pdf_path, verbose: true)

  # Since these pdfs take about 10 minutes to generate, the server might not be available the whole time. For example,
  # "CA.pdf" does not exist has appeared on staging if it's between builds. This check prevents these errors.
  # The next time the cronjob runs, all the necessary pdfs will still be generated.
  if File.exist?(pdf_conversion_info.output_pdf_path)
    fetchable_url = RakeUtils.replace_file_with_s3_backed_fetch_file(pdf_conversion_info.output_pdf_path, fetchfile_for_pdf, bucket: 'cdo-fetch')
    HipChat.log "Created <b>#{pdf_conversion_info.output_pdf_path}</b> and moved to <a href='#{fetchable_url}'>#{fetchable_url}</a></b>."
  end
end

desc 'Generate PDFs for *.makepdf files and all state-facts pages.'
task :generate_pdfs do
  require_relative '../../pegasus/src/env'
  all_outfiles = [].tap do |all_outfiles|
    # Generate pdf for files that are appended with .makepdf
    pdf_conversions_for_files(sites_v3_dir('code.org/**/[^_]*.makepdf'), '').each do |pdf_conversion_info|
      fetchfile_for_pdf = "#{pdf_conversion_info.output_pdf_path}.fetch"

      file fetchfile_for_pdf => pdf_conversion_info.src_files do
        generate_pdf_file(base_url, pdf_conversion_info, fetchfile_for_pdf)
      end

      all_outfiles << fetchfile_for_pdf
    end

    # Generate pdf for each state using code.org/public/advocacy/state-facts/splat.haml
    states = []
    PEGASUS_DB[:cdo_state_promote].each do |state_row|
      states << state_row[:state_code_s]
    end
    pdf_conversions_for_state_pages(states).each do |pdf_info|
      fetchfile_for_pdf = "#{pdf_info.output_pdf_path}.fetch"

      file fetchfile_for_pdf => [sites_v3_dir('code.org/public/advocacy/state-facts/splat.haml'), pegasus_dir('/data/cdo-state-promote.csv')] do
        generate_pdf_file(base_url, pdf_info, fetchfile_for_pdf)
      end

      all_outfiles << fetchfile_for_pdf
    end
  end
  all_outfiles.each do |outfile|
    Rake::Task[outfile].invoke
  end
end
