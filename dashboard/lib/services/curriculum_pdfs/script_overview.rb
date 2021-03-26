module Services
  module CurriculumPdfs
    module ScriptOverview
      extend ActiveSupport::Concern
      class_methods do
        def get_script_pathname(script)
          return nil unless script&.seeded_from
          version_number = Time.parse(script.seeded_from).to_s(:number)
          filename = ActiveStorage::Filename.new(script.localized_title + ".pdf").sanitized
          return Pathname.new(File.join(script.name, version_number, filename))
        end

        def get_script_url(script)
          pathname = get_script_pathname(script)
          return nil unless pathname.present?
          File.join(get_base_url, pathname)
        end

        def generate_script_overview_pdf(script, directory="/tmp/")
          pdfs = []

          url = Rails.application.routes.url_helpers.script_url(script)
          script_filename = ActiveStorage::Filename.new("script.#{script.name}.pdf").sanitized
          script_path = File.join(directory, script_filename)
          PDF.generate_from_url(url, script_path)
          pdfs << script_path

          script.lessons.each do |lesson|
            if false && lesson_plan_pdf_exists_for?(lesson)
              # TODO: get pdf from s3
            else
              generate_lesson_pdf(lesson, directory)
              pdfs << File.join(directory, get_lesson_plan_pathname(lesson))
            end
          end

          pathname = get_script_pathname(script)
          destination = File.join(directory, pathname)
          PDF.merge_local_pdfs(destination, *pdfs)
          return destination
        end
      end
    end
  end
end
