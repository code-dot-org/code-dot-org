require_relative '../../src/env'
require 'cdo/hip_chat'
require 'cdo/rake_utils'
require 'cdo/tempfile'
require 'pdf/conversion'
require src_dir 'course'

PDFConversionInfo = Struct.new(:url_path, :src_files, :output_pdf_path)

def pdf_conversions_for_files(file_pattern, url_extension)
  [].tap do |conversion_infos|
    Dir.glob(file_pattern).each do |file|
      extname = File.extname(file)
      file_path_without_extension = file[0...-(extname.length)]
      url_path_from_curriculum_without_extension = file_path_without_extension.match(/curriculum-(.*)/)[1]
      url_path = 'curriculum/' + url_path_from_curriculum_without_extension + url_extension
      conversion_infos << PDFConversionInfo.new(url_path, [file], file_path_without_extension + '.pdf')
    end
  end
end

base_url = ENV['base_url']

all_outfiles = [].tap do |all_outfiles|
  (
    pdf_conversions_for_files(sites_dir("virtual/curriculum-{#{Course::COURSES_WITH_PDF_GENERATION.join(',')}}/[0-9]*/*.md"), '') +
    pdf_conversions_for_files(sites_dir("virtual/curriculum-{#{Course::COURSES_WITH_PDF_GENERATION.join(',')}}/[0-9]*/*.html"), '.html') +
    pdf_conversions_for_files(sites_dir("virtual/curriculum-{#{Course::COURSES_WITH_PDF_GENERATION.join(',')}}/docs/*.md"), '') +
    pdf_conversions_for_files(sites_dir('virtual/curriculum-docs/**/*.md'), '')
  ).each do |pdf_conversion_info|

    pdf_v3_path = Course.virtual_to_v3_path(pdf_conversion_info.output_pdf_path)
    fetchfile_for_pdf = "#{pdf_v3_path}.fetch"

    file fetchfile_for_pdf => pdf_conversion_info.src_files do
      url = "#{base_url}#{pdf_conversion_info.url_path}"

      PDF.generate_from_url(url, pdf_conversion_info.output_pdf_path, verbose:rack_env?(:development))

      fetchable_url = RakeUtils.replace_file_with_s3_backed_fetch_file(pdf_conversion_info.output_pdf_path, fetchfile_for_pdf, bucket: 'cdo-fetch')

      HipChat.log "Created <b>#{pdf_conversion_info.output_pdf_path}</b> and moved to <a href='#{fetchable_url}'>#{fetchable_url}</a></b>."
    end

    all_outfiles << fetchfile_for_pdf
  end
end

task :default => all_outfiles
