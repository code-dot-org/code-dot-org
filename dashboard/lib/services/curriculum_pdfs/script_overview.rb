require 'active_support/concern'
require 'cdo/chat_client'
require 'pdf/collate'
require 'pdf/conversion'

module Services
  module CurriculumPdfs
    module ScriptOverview
      extend ActiveSupport::Concern
      class_methods do
        def get_script_overview_pathname(script)
          return nil unless script&.seeded_from
          version_number = Time.parse(script.seeded_from).to_s(:number)
          filename = ActiveStorage::Filename.new(script.localized_title + ".pdf").sanitized
          return Pathname.new(File.join(script.name, version_number, filename))
        end

        def get_script_overview_url(script)
          pathname = get_script_overview_pathname(script)
          return nil unless pathname.present?
          File.join(get_base_url, pathname)
        end

        def script_overview_pdf_exists_for?(script)
          AWS::S3.cached_exists_in_bucket?(
            S3_BUCKET,
            get_script_overview_pathname(script).to_s
          )
        end

        def generate_script_overview_pdf(script, directory="/tmp/")
          ChatClient.log("Generating script overview PDF for #{script.name.inspect}")
          pdfs_dir = Dir.mktmpdir(__method__.to_s)
          pdfs = []

          # Include a PDF of the /s/script.name page itself
          script_filename = ActiveStorage::Filename.new("script.#{script.name}.pdf").sanitized
          script_path = File.join(pdfs_dir, script_filename)
          # Make sure to specify
          # 1. 'no_redirect' so we're guaranteed to get the actual script we want
          # 2. 'view as teacher' so we don't get the default student view
          url = Rails.application.routes.url_helpers.script_url(script) + "?no_redirect=true&viewAs=Teacher"
          PDF.generate_from_url(url, script_path)
          pdfs << script_path

          # Include PDF for the lesson in our set of PDFs to merge.
          script.lessons.each do |lesson|
            ChatClient.log("Finding/generating PDF for #{lesson.key.inspect}") if DEBUG
            # 1. If we already have a version of the PDF on the local
            #    filesystem, grab it from there.
            # 2. Otherwise, if we already have a version of the PDF on S3, grab
            #    it from there.
            # 3. If we don't already have a version anywhere, generate one.
            lesson_pathname = get_lesson_plan_pathname(lesson)
            if File.exist?(File.join(directory, lesson_pathname))
              ChatClient.log("existing PDF found at #{File.join(directory, lesson_pathname).inspect}") if DEBUG
              pdfs << File.join(directory, lesson_pathname)
            elsif false && lesson_plan_pdf_exists_for?(lesson)
              ChatClient.log("existing PDF found at #{get_lesson_plan_pathname(lesson).inspect}") if DEBUG
              # TODO: get pdf from s3
            else
              ChatClient.log("no existing PDF found; generating one at #{File.join(directory, lesson_pathname).inspect}") if DEBUG
              generate_lesson_pdf(lesson, directory)
              pdfs << File.join(directory, lesson_pathname)
            end
          end

          # Merge all included PDFs
          pathname = get_script_overview_pathname(script)
          destination = File.join(directory, pathname)
          FileUtils.mkdir_p(File.dirname(destination))
          PDF.merge_local_pdfs(destination, *pdfs)
          FileUtils.remove_entry_secure(pdfs_dir)

          return destination
        end
      end
    end
  end
end
