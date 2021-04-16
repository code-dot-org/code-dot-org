require 'active_support/concern'
require 'cdo/chat_client'
require 'cdo/google/drive'
require 'open-uri'
require 'pdf/collate'
require 'pdf/conversion'

module Services
  module CurriculumPdfs
    module Resources
      extend ActiveSupport::Concern
      class_methods do
        def generate_script_resources_pdf(script, directory="/tmp/")
          ChatClient.log("Generating script resources PDF for #{script.name.inspect}")
          pdfs_dir = Dir.mktmpdir(__method__.to_s)
          pdfs = []

          # Gather together PDFs of all resources in all lessons, grouped by
          # lesson with a title page.
          script.lessons.each do |lesson|
            ChatClient.log("Gathering resources for #{lesson.key.inspect}") if DEBUG
            lesson_pdfs = lesson.resources.map do |resource|
              fetch_resource_pdf(resource, pdfs_dir)
            end.compact

            next if lesson_pdfs.empty?

            pdfs.push(generate_lesson_resources_title_page(lesson, pdfs_dir))
            pdfs.push(*lesson_pdfs)
          end

          # Merge all gathered PDFs
          destination = File.join(directory, get_script_resources_pdf_pathname(script))
          FileUtils.mkdir_p(File.dirname(destination))
          PDF.merge_local_pdfs(destination, *pdfs)
          FileUtils.remove_entry_secure(pdfs_dir)

          return destination
        end

        def get_script_resources_pdf_pathname(script)
          filename = ActiveStorage::Filename.new(script.localized_title + " - Resources.pdf").sanitized
          subdirectory = File.dirname(get_script_overview_pathname(script))
          return Pathname.new(File.join(subdirectory, filename))
        end

        def script_resources_pdf_exists_for?(script)
          AWS::S3.cached_exists_in_bucket?(
            S3_BUCKET,
            get_script_resources_pdf_pathname(script).to_s
          )
        end

        def generate_lesson_resources_title_page(lesson, directory="/tmp/")
          @lesson_resources_title_page_template ||= File.read(
            File.join(File.dirname(__FILE__), 'lesson_resources_title_page.html.haml')
          )

          page_content = ApplicationController.render(
            inline: @lesson_resources_title_page_template,
            locals: {lesson: lesson},
            type: :haml
          )

          filename = ActiveStorage::Filename.new("lesson.#{lesson.key}.title.pdf").sanitized
          path = File.join(directory, filename)

          PDF.generate_from_html(page_content, path)
          return path
        end

        def export_from_google(url, path)
          @google_drive_session ||= GoogleDrive::Session.from_service_account_key(
            StringIO.new(CDO.gdrive_export_secret&.to_json || "")
          )
          file = @google_drive_session.file_by_url(url)

          # If file is already a PDF, we can just download it; otherwise, we
          # need to export to convert it.
          if file.available_content_types.include? "appliction/pdf"
            file.download_to_file(path)
          else
            # The intuitive option here would be to use
            # file.export_as_file(path, "application/pdf"); unfortunately, that
            # method applies some restrictive file size limits that for
            # whatever reason hitting the URI directly does not.
            IO.copy_stream(URI.open("https://docs.google.com/document/d/#{file.id}/export?format=pdf"), path)
          end
        end

        def fetch_resource_pdf(resource, directory="/tmp/")
          filename = ActiveStorage::Filename.new("resource.#{resource.key}.pdf").sanitized
          path = File.join(directory, filename)
          return path if File.exist?(path)

          if resource.url.start_with?("https://docs.google.com/", "https://drive.google.com/")
            # We don't want to export forms
            return nil if resource.url.start_with?("https://docs.google.com/forms")
            begin
              export_from_google(resource.url, path)
              return path
            rescue Google::Apis::ClientError, Google::Apis::ServerError, GoogleDrive::Error, URI::InvalidURIError => e
              ChatClient.log(
                "error from Google when trying to fetch PDF for resource #{resource.key.inspect}: #{e}",
                color: 'red'
              )
              return nil
            end
          elsif resource.url.end_with?(".pdf")
            IO.copy_stream(URI.open(resource.url), path)
            return path
          end
        end
      end
    end
  end
end
