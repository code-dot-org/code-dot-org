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
        def get_script_resources_pathname(script)
          filename = ActiveStorage::Filename.new(script.localized_title + " - Resources.pdf").sanitized
          script_overview_pathname = get_script_overview_pathname(script)
          return nil unless script_overview_pathname
          subdirectory = File.dirname(script_overview_pathname)
          return Pathname.new(File.join(subdirectory, filename))
        end

        def get_script_resources_url(script)
          pathname = get_script_resources_pathname(script)
          return nil unless pathname.present?
          File.join(get_base_url, pathname)
        end

        def generate_script_resources_pdf(script, directory="/tmp/")
          ChatClient.log("Generating script resources PDF for #{script.name.inspect}")
          pdfs_dir = Dir.mktmpdir(__method__.to_s)
          pdfs = []

          # Gather together PDFs of all resources in all lessons, grouped by
          # lesson with a title page.
          script.lessons.each do |lesson|
            ChatClient.log("Gathering resources for #{lesson.key.inspect}") if DEBUG
            lesson_pdfs = lesson.resources.map do |resource|
              fetch_resource_pdf(resource, pdfs_dir) if resource.should_include_in_pdf?
            end.compact

            next if lesson_pdfs.empty?

            pdfs.push(generate_lesson_resources_title_page(lesson, pdfs_dir))
            pdfs.push(*lesson_pdfs)
          end

          # Merge all gathered PDFs
          destination = File.join(directory, get_script_resources_pdf_pathname(script))
          FileUtils.mkdir_p(File.dirname(destination))
          # We've been having an intermittent issue where this step will fail
          # with a ghostscript error. The only way I've been able to reproduce
          # this error locally is by deleting one of the PDFs out from under
          # the generation process prior to the merge attempt, and I'm a bit
          # skeptical that that explains what's going on in the actual staging
          # environment.
          #
          # So, in an effort to better understand what's actually happening,
          # I'm adding some explicit logging.
          begin
            PDF.merge_local_pdfs(destination, *pdfs)
          rescue Exception => e
            ChatClient.log(
              "Error when trying to merge resource PDFs for #{script.name}: #{e}",
              color: 'red'
            )
            ChatClient.log(
              "destination: #{destination.inspect}",
              color: 'red'
            )
            ChatClient.log(
              "pdfs: #{pdfs.inspect}",
              color: 'red'
            )
            ChatClient.log(
              "temporary directory contents: #{Dir.entries(pdfs_dir).inspect}",
              color: 'red'
            )
            raise e
          end
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

        def google_drive_file_by_url(url)
          @google_drive_session ||= GoogleDrive::Session.from_service_account_key(
            StringIO.new(CDO.gdrive_export_secret&.to_json || "")
          )
          return @google_drive_session.file_by_url(url)
        end

        def fetch_url_to_path(url, path)
          if url.start_with?("https://docs.google.com/document/d/")
            file = google_drive_file_by_url(url)
            file.export_as_file(path, "application/pdf")
            return path
          elsif url.start_with?("https://drive.google.com/")
            file = google_drive_file_by_url(url)
            return nil unless file.available_content_types.include? "application/pdf"
            file.download_to_file(path)
            return path
          elsif url.end_with?(".pdf")
            IO.copy_stream(URI.open(url), path)
            return path
          end
        rescue Google::Apis::ClientError, Google::Apis::ServerError, GoogleDrive::Error => e
          ChatClient.log(
            "Google error when trying to fetch PDF from #{url.inspect} to #{path.inspect}: #{e}",
            color: 'yellow'
          )
          return nil
        rescue URI::InvalidURIError, OpenURI::HTTPError => e
          ChatClient.log(
            "URI error when trying to fetch PDF from #{url.inspect} to #{path.inspect}: #{e}",
            color: 'yellow'
          )
          return nil
        end

        def fetch_resource_pdf(resource, directory="/tmp/")
          filename = ActiveStorage::Filename.new("resource.#{resource.key}.pdf").sanitized
          path = File.join(directory, filename)
          return path if File.exist?(path)
          return fetch_url_to_path(resource.url, path)
        end
      end
    end
  end
end
