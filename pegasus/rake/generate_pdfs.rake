require_relative '../src/env'
require 'cdo/hip_chat'
require 'cdo/rake_utils'
require 'cdo/tempfile'
require 'pdf/conversion'
require 'cdo/properties'

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
  [].tap do |state_conversion_infos|
    state_codes.each do |state_code|
      file_path_without_makepdf_extension = sites_v3_dir('code.org/public/advocacy/state-facts/') + state_code
      file_path_without_extension = file_path_without_makepdf_extension
      url_path_from_public_without_extension = file_path_without_extension.match(/public(.*)/)[1]
      url_path = url_path_from_public_without_extension + '?pdf_version=true'
      state_conversion_infos << PDFConversionInfo.new(url_path, [file_path_without_makepdf_extension], file_path_without_extension + '.pdf')
    end
  end
end

base_url = ENV['base_url']

def generate_pdf_files(base_url, pdf_conversion_info, fetchfile_for_pdf)
  url = "#{base_url}#{pdf_conversion_info.url_path}"

  PDF.generate_from_url(url, pdf_conversion_info.output_pdf_path, verbose: true)

  fetchable_url = RakeUtils.replace_file_with_s3_backed_fetch_file(pdf_conversion_info.output_pdf_path, fetchfile_for_pdf, bucket: 'cdo-fetch')

  HipChat.log "Created <b>#{pdf_conversion_info.output_pdf_path}</b> and moved to <a href='#{fetchable_url}'>#{fetchable_url}</a></b>."
end

all_outfiles = [].tap do |all_outfiles|
  # Generate pdf for files that are appended with .makepdf
  pdf_conversions_for_files(sites_v3_dir('code.org/**/[^_]*.makepdf'), '').each do |pdf_conversion_info|
    fetchfile_for_pdf = "#{pdf_conversion_info.output_pdf_path}.fetch"

    file fetchfile_for_pdf => pdf_conversion_info.src_files do
      generate_pdf_files(base_url, pdf_conversion_info, fetchfile_for_pdf)
    end

    all_outfiles << fetchfile_for_pdf
  end

  # Generate pdf for each state using code.org/public/advocacy/state-facts/splat.haml
  [].tap do |states|
    DB[:cdo_state_promote].each do |state_row|
      states << state_row[:state_code_s]
    end

    pdf_conversions_for_state_pages(states).each do |pdf_info|
      fetchfile_for_pdf = "#{pdf_info.output_pdf_path}.fetch"

      file fetchfile_for_pdf do
        generate_pdf_files(base_url, pdf_info, fetchfile_for_pdf)
      end

      all_outfiles << fetchfile_for_pdf
    end
  end
end

task :default => all_outfiles
