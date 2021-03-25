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
            title_page = "<h1>#{script.name}<h1><h2>#{lesson.name}</h2><h3>Resources</h3>"
            title_page_filename = ActiveStorage::Filename.new(
              "lesson.#{lesson.key}.title.pdf"
            ).sanitized
            title_page_path = File.join(directory, title_page_filename)
            PDF.generate_from_html(title_page, title_page_path)
            pdfs << title_page_path

            lesson.resources.each do |resource|
              resource_path = fetch_resource_pdf(resource, directory)
              pdfs << resource_path if resource_path
            end
          end

          filename = ActiveStorage::Filename.new(script.name + ".pdf").sanitized
          destination = File.join(directory, filename)
          PDF.merge_local_pdfs(destination, *pdfs)
          return destination
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
