require 'active_support/concern'
require 'cdo/google/drive'
require 'open-uri'
require 'pdf/collate'
require 'pdf/conversion'
require 'securerandom'

module Services
  module CurriculumPdfs
    module Resources
      extend ActiveSupport::Concern
      class_methods do
        def google_drive_session
          @session ||= GoogleDrive::Session.from_service_account_key(
            StringIO.new(CDO.gdrive_export_secret.to_json)
          )
        end

        def generate_script_resources_pdf(script, directory="/tmp/")
          pdfs = []
          script.lessons.each do |lesson|
            lesson_pdfs = lesson.resources.map do |resource|
              fetch_resource_pdf(resource, directory)
            end.compact

            next if lesson_pdfs.empty?

            pdfs.push(generate_lesson_resources_title_page(lesson, directory))
            pdfs.push(*lesson_pdfs)
          end

          filename = ActiveStorage::Filename.new(script.name + ".pdf").sanitized
          destination = File.join(directory, filename)
          PDF.merge_local_pdfs(destination, *pdfs)
          return destination
        end

        def generate_lesson_resources_title_page(lesson, directory="/tmp/")
          @lesson_resources_title_page_template ||= File.read(
            File.join(
              File.dirname(__FILE__), 'lesson_resources_title_page.html.haml'
            )
          )

          page_content = ApplicationController.render(
            inline: @lesson_resources_title_page_template,
            locals: {lesson: lesson},
            type: :haml
          )

          filename = ActiveStorage::Filename.new(
            "lesson.#{lesson.key}.title.pdf"
          ).sanitized
          path = File.join(directory, filename)

          PDF.generate_from_html(page_content, path)
          return path
        end

        def fetch_resource_pdf(resource, directory="/tmp/")
          filename = ActiveStorage::Filename.new(
            #"resource.#{resource.key}.#{SecureRandom.hex(8)}.pdf"
            "resource.#{resource.key}.pdf"
          ).sanitized
          path = File.join(directory, filename)
          return path if File.exist?(path)

          if resource.url.start_with?("https://docs.google.com/", "https://drive.google.com/")
            begin
              file = google_drive_session.file_by_url(resource.url)
              file.export_as_file(path)
              return path
            rescue Google::Apis::ClientError
              # TODO: what to do here?
              return nil
            rescue Google::Apis::ServerError
              # TODO: what to do here?
              return nil
            rescue GoogleDrive::Error
              # TODO: what to do here?
              return nil
            end
          elsif resource.url.end_with?(".pdf")
            IO.copy_stream(open(resource.url), path)
            return path
          end
        end
      end
    end
  end
end
