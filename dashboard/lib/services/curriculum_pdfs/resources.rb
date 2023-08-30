require 'active_support/concern'
require 'cdo/chat_client'
require 'cdo/google/drive'
require 'open-uri'
require 'pdf/collate'
require 'pdf/conversion'

module Services
  module CurriculumPdfs
    # Contains all code related to generating rollup PDFs containing all
    # resources within a given script.
    module Resources
      extend ActiveSupport::Concern
      class_methods do
        # Build the full path of the resource PDF for the given script. This
        # will be based not only on the name of the script but also the current
        # version of the script in the environment.
        #
        # For example: <Pathname:csp1-2021/20210909014219/Digital+Information+('21-'22)+-+Resources.pdf>
        def get_script_resources_pathname(script, versioned: true)
          filename = ActiveStorage::Filename.new(script.localized_title.parameterize(preserve_case: true) + "-Resources.pdf").to_s
          script_overview_pathname = get_script_overview_pathname(script, versioned: versioned)
          return nil unless script_overview_pathname
          subdirectory = File.dirname(script_overview_pathname)
          return Pathname.new(File.join(subdirectory, filename))
        end

        # Build the full user-facing url where a Resource Rollup PDF can be
        # found for the given script.
        #
        # For example: https://lesson-plans.code.org/csp1-2021/20210909014219/Digital+Information+%28%2721-%2722%29+-+Resources.pdf
        def get_unit_resources_url(script)
          return nil unless Services::CurriculumPdfs.should_generate_resource_pdf?(script)
          versioned = script_resources_pdf_exists_for?(script)
          pathname = get_script_resources_pathname(script, versioned: versioned)
          return nil if pathname.blank?
          File.join(get_base_url, pathname)
        end

        # Generate a PDF containing a rollup of all Resources in the given
        # Unit, grouped by Lesson
        def generate_script_resources_pdf(script, directory="/tmp/")
          ChatClient.log("Generating script resources PDF for #{script.name.inspect}")
          pdfs_dir = Dir.mktmpdir(__method__.to_s)
          pdfs = []

          # Gather together PDFs of all resources in all lessons, grouped by
          # lesson with a title page.
          script.lessons.each do |lesson|
            ChatClient.log("Gathering resources for #{lesson.key.inspect}") if DEBUG
            lesson_pdfs = lesson.resources.filter_map do |resource|
              fetch_resource_pdf(resource, pdfs_dir) if resource.should_include_in_pdf?
            end

            next if lesson_pdfs.empty?

            pdfs.push(generate_lesson_resources_title_page(lesson, pdfs_dir))
            pdfs.push(*lesson_pdfs)
          end

          # Merge all gathered PDFs
          destination = File.join(directory, get_script_resources_pathname(script))
          fallback_destination = File.join(directory, get_script_resources_pathname(script, versioned: false))
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
          rescue Exception => exception
            ChatClient.log(
              "Error when trying to merge resource PDFs for #{script.name}: #{exception}",
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
            raise exception
          end
          FileUtils.remove_entry_secure(pdfs_dir)

          FileUtils.mkdir_p(File.dirname(fallback_destination))
          FileUtils.cp(destination, fallback_destination)

          return destination
        end

        # Check s3 to see if we've already generated a resource rollup PDF for
        # the given script
        def script_resources_pdf_exists_for?(script)
          pathname = get_script_resources_pathname(script).to_s
          return pdf_exists_at?(pathname)
        end

        # Generates a title page for the given lesson; this is used in the
        # final PDF rollup to group the resources by the lesson in which they
        # appear.
        def generate_lesson_resources_title_page(lesson, directory="/tmp/")
          @lesson_resources_title_page_template ||= File.read(
            File.join(File.dirname(__FILE__), 'lesson_resources_title_page.html.haml')
          )

          page_content = ApplicationController.render(
            inline: @lesson_resources_title_page_template,
            locals: {lesson: lesson},
            type: :haml
          )

          filename = ActiveStorage::Filename.new("lesson.#{lesson.key.parameterize}.title.pdf").to_s
          path = File.join(directory, filename)

          PDF.generate_from_html(page_content, path)

          # we've been having some issues with these title page PDFs not
          # existing on the filesystem when it comes time to make the rollup.
          #
          # It's not yet clear whether that's because this step is failing to
          # generate or because the file is getting vanished after generation,
          # but logging that we added in the past indicates that the problem is
          # mostly likely that this step is failing to generate.
          #
          # Because it's not yet clear *why* this step is failing to generate,
          # we add some retries as a band-aid.
          total_retries = 3
          total_retries.times do |current_retry|
            break if File.exist?(path)
            ChatClient.log(
              "File #{path.inspect} does not exist after generation; retrying (#{current_retry + 1}/#{total_retries})",
              color: 'red'
            )
            PDF.generate_from_html(page_content, path)
          end
          raise "File #{path.inspect} does not exist after generation" unless File.exist?(path)

          return path
        end

        # Given a Resource object, persist a PDF of that Resource (with a name
        # based on the key of that Resource) to the given directory.
        def fetch_resource_pdf(resource, directory="/tmp/")
          filename = ActiveStorage::Filename.new("resource.#{resource.key.parameterize}.pdf").to_s
          path = File.join(directory, filename)
          return path if File.exist?(path)
          return fetch_url_to_path(resource.url, path)
        end

        # Given a URL representing a Resource, persist a PDF of that resource
        # to the given path. Supports Google Docs, PDFs hosted on Google Drive,
        # and arbitrary URLs that end in ".pdf"
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
            IO.copy_stream(URI.parse(url)&.open, path)
            return path
          end
        rescue Google::Apis::ClientError, Google::Apis::ServerError, GoogleDrive::Error => exception
          ChatClient.log(
            "Google error when trying to fetch PDF from #{url.inspect} to #{path.inspect}: #{exception}",
            color: 'yellow'
          )
          return nil
        rescue URI::InvalidURIError, OpenURI::HTTPError => exception
          ChatClient.log(
            "URI error when trying to fetch PDF from #{url.inspect} to #{path.inspect}: #{exception}",
            color: 'yellow'
          )
          return nil
        end

        # Returns a GoogleDrive::File object for the given url
        #
        # @see https://www.rubydoc.info/gems/google_drive/GoogleDrive/File
        def google_drive_file_by_url(url)
          @google_drive_session ||= GoogleDrive::Session.from_service_account_key(
            StringIO.new(CDO.gdrive_export_secret&.to_json || "")
          )
          return @google_drive_session.file_by_url(url)
        end
      end
    end
  end
end
