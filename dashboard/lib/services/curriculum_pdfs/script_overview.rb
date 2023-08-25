require 'active_support/concern'
require 'cdo/chat_client'
require 'pdf/collate'
require 'pdf/conversion'

module Services
  module CurriculumPdfs
    # Contains all code related to generating "overview" PDFs containing all
    # Lessons in a given Unit.
    module ScriptOverview
      extend ActiveSupport::Concern
      class_methods do
        # Build the full path of the overview PDF for the given script. This
        # will be based not only on the name of the script but also the current
        # version
        #
        # For example: <Pathname:csp1-2021/20210909014219/Digital+Information+%28%2721-%2722%29.pdf>
        def get_script_overview_pathname(script, versioned: true)
          return nil unless script&.seeded_from
          version_number = versioned ? Time.parse(script.seeded_from).to_s(:number) : 'fallback'
          filename = ActiveStorage::Filename.new(script.localized_title.parameterize(preserve_case: true) + ".pdf").to_s
          return Pathname.new(File.join(script.name, version_number, filename))
        end

        # Build the full user-facing url where an Overview PDF can be found for
        # the given script.
        #
        # For example: https://lesson-plans.code.org/csp1-2021/20210909014219/Digital+Information+%28%2721-%2722%29.pdf
        def get_script_overview_url(script)
          return nil unless Services::CurriculumPdfs.should_generate_overview_pdf?(script)
          versioned = script_overview_pdf_exists_for?(script)
          pathname = get_script_overview_pathname(script, versioned: versioned)
          return nil if pathname.blank?
          File.join(get_base_url, pathname)
        end

        # Check S3 to see if we've already generated an overview PDF for the
        # given script
        def script_overview_pdf_exists_for?(script)
          pathname = get_script_overview_pathname(script).to_s
          cache_key = "CurriculumPdfs/ScriptOverview/pdf_exists/#{pathname}"
          return CDO.shared_cache.read(cache_key) if CDO.shared_cache.exist?(cache_key)

          result = AWS::S3.exists_in_bucket(S3_BUCKET, pathname)
          CDO.shared_cache.write(cache_key, result)
          return result
        end

        # Generate a PDF containing not only the Unit page itself but also
        # all Lesson Plans within the script.
        def generate_script_overview_pdf(script, directory="/tmp/")
          ChatClient.log("Generating script overview PDF for #{script.name.inspect}")
          pdfs_dir = Dir.mktmpdir(__method__.to_s)
          pdfs = []

          # Include a PDF of the /s/script.name page itself
          script_filename = ActiveStorage::Filename.new("script.#{script.name.parameterize}.pdf").to_s
          script_path = File.join(pdfs_dir, script_filename)
          # Make sure to specify
          # 1. 'no_redirect' so we're guaranteed to get the actual script we want
          # 2. 'view as teacher' so we don't get the default student view
          url = Rails.application.routes.url_helpers.script_url(script) + "?no_redirect=true&viewAs=Instructor"
          PDF.generate_from_url(url, script_path)
          pdfs << script_path

          # Include PDF for the lesson in our set of PDFs to merge.
          script.lessons.select(&:has_lesson_plan).each do |lesson|
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
          fallback_pathname = get_script_overview_pathname(script, versioned: false)
          destination = File.join(directory, pathname)
          fallback_destination = File.join(directory, fallback_pathname)
          FileUtils.mkdir_p(File.dirname(destination))
          PDF.merge_local_pdfs(destination, *pdfs)
          FileUtils.remove_entry_secure(pdfs_dir)

          FileUtils.mkdir_p(File.dirname(fallback_destination))
          FileUtils.cp(destination, fallback_destination)

          return destination
        end
      end
    end
  end
end
