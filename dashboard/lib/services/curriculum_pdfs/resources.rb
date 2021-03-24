require 'active_support/concern'
require 'cdo/google/drive'
require 'pdf/collate'
require 'pdf/conversion'

module Services
  module CurriculumPdfs
    module LessonPlans
      extend ActiveSupport::Concern
      class_methods do
        def google_drive_sesson
          @session ||= GoogleDrive::Session.from_service_account_key(
            StringIO.new(CDO.gdrive_export_secret.to_json)
          )
        end

        def generate_script_resources_pdf(script, directory="/tmp/")
          tmpdir = Dir.mktmpdir(__method__.to_s)
          pdfs = []
          script.lessons.each do |lesson|
            title_page = "<h1>#{script.name}<h1><h2>#{lesson.name}</h2><h3>Resources</h3>"
            title_page_filename = ActiveStorage::Filename.new("lesson.#{lesson.key}.title.pdf").sanitized
            title_page_path = File.join(tmpdir, title_page_filename)
            PDF.generate_from_html(title_page, title_page_path)
            pdfs << title_page_path

            lesson.resources.each do |resource|
              file = google_drive_session.file_by_url(resource.url)
              raise "could not find google doc for: #{resource.url.inspect}" unless file.present?
              resource_filename = ActiveStorage::Filename.new("resource.#{resource.key}.pdf").sanitized
              resource_path = File.join(tmpdir, resource_filename)
              file.export_as_file(resource_path)
              pdfs << resource_path
            end
          end

          filename = ActiveStorage::Filename.new(script.name + ".pdf").sanitized
          destination = File.join(directory, filename)
          PDF.merge_pdfs(destination, *pdfs)
          FileUtils.remove_entry_secure(tmpdir)
          return destination
        end

        #def generate_rollup_pdf_for_lesson(lesson)
        #  dir = Dir.mktmpdir("generate_rollup_pdf_for_lesson")
        #  pdfs = []
        #  lesson.resources.each do |resource|
        #    file = google_drive_session.file_by_url(resource.url)
        #    unless file.present?
        #      puts "could not find google doc for: #{resource.url.inspect}"
        #    else
        #      title_page = "<h1>Unit X Lesson Y<h1><h2>#{lesson.name}</h2><h3>Resources</h3>"
        #      title_pdf_name = File.join(dir, resource.key + ".title.pdf")
        #      PDF.generate_from_html(title_page, title_pdf_name)
        #      pdfs << title_pdf_name

        #      resource_pdf_name = File.join(dir, resource.key + ".pdf")
        #      file.export_as_file(resource_pdf_name)
        #      pdfs << resource_pdf_name
        #    end
        #  end

        #  PDF.merge_pdfs("/tmp/result.pdf", *pdfs)
        #end
      end
    end
  end
end
