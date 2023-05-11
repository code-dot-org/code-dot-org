require lib_dir 'cdo/data/logging/rake_task_event_logger'
include TimedTaskWithLogging

namespace :curriculum_pdfs do
  desc 'Identify all content for which we expect to have a generated PDF, but don\'t.'
  timed_task_with_logging identify_missing_pdfs: :environment do
    any_missing_pdfs_found = false
    Services::CurriculumPdfs.get_pdf_enabled_scripts.each do |script|
      pdfless_lessons = Services::CurriculumPdfs.get_pdfless_lessons(script)
      script_overview_exists = Services::CurriculumPdfs.script_overview_pdf_exists_for?(script)
      script_resources_exists = Services::CurriculumPdfs.script_resources_pdf_exists_for?(script)
      no_missing_pdfs = pdfless_lessons.empty? && script_overview_exists && script_resources_exists
      next if no_missing_pdfs

      any_missing_pdfs_found = true
      puts "Script #{script.name.inspect} is missing PDFs for:"
      pdfless_lessons.each do |lesson|
        puts "  #{lesson.name.inspect} (#{lesson.key})"
      end
      puts "  Script Overview" unless script_overview_exists
      puts "  Script Resources" unless script_resources_exists
    end

    puts "No missing PDFs found" unless any_missing_pdfs_found
  end

  # In order to run this in development, you may first need to install puppeteer via:
  #   cd bin/generate-pdf
  #   yarn install
  # on the staging machine, this is taken care of in cookbooks/cdo-apps/recipes/generate_pdf.rb
  desc 'Generate any curriculum PDFs that have not yet been generated.'
  timed_task_with_logging generate_missing_pdfs: :environment do
    exception_cb = proc do
      ChatClient.log "PDF generation failed. retrying..."
    end

    Retryable.retryable(on: StandardError, tries: 2, exception_cb: exception_cb) do
      Services::CurriculumPdfs.generate_missing_pdfs
    end

    puts "Finished generating missing PDFs"
  end
end
