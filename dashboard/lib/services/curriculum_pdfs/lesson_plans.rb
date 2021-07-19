require 'active_support/concern'
require 'cdo/chat_client'
require 'pdf/conversion'

module Services
  module CurriculumPdfs
    module LessonPlans
      extend ActiveSupport::Concern
      class_methods do
        # Build the full path of the lesson plan or student lesson plan
        # PDF for the given lesson. This will be based on not only the
        # lesson's script but also the current version of the script in the environment.
        #
        # Expect this to look something like this for teacher lesson plans
        # <Pathname:csp1-2021/20210216001309/teacher-lesson-plans/Welcome to CSP.pdf>
        # and this for student lesson plans
        # <Pathname:csp1-2021/20210216001309/student-lesson-plans/Welcome to CSP.pdf>
        def get_lesson_plan_pathname(lesson, student_facing = false, as_url = false)
          return nil unless lesson&.script&.seeded_from
          version_number = Time.parse(lesson.script.seeded_from).to_s(:number)
          filename = ActiveStorage::Filename.new(lesson.key + ".pdf").sanitized
          filename = CGI.escape(filename) if as_url
          subdir = student_facing ? "student-lesson-plans" : "teacher-lesson-plans"
          return Pathname.new(File.join(lesson.script.name, version_number, subdir, filename))
        end

        def get_lesson_plan_url(lesson, student_facing=false)
          pathname = get_lesson_plan_pathname(lesson, student_facing, true)
          return nil unless pathname.present?

          File.join(get_base_url, pathname)
        end

        def lesson_plan_pdf_exists_for?(lesson, student_facing=false)
          pathname = get_lesson_plan_pathname(lesson, student_facing)
          AWS::S3.cached_exists_in_bucket?(S3_BUCKET, pathname.to_s)
        end

        def generate_lesson_pdf(lesson, directory="/tmp/", student_facing=false)
          url = student_facing ? Rails.application.routes.url_helpers.script_lesson_student_url(lesson.script, lesson) : Rails.application.routes.url_helpers.script_lesson_url(lesson.script, lesson)
          pathname = get_lesson_plan_pathname(lesson, student_facing)

          ChatClient.log "Generating #{pathname.to_s.inspect} from #{url.inspect}" if DEBUG

          FileUtils.mkdir_p(File.join(directory, pathname.dirname))
          PDF.generate_from_url(url, File.join(directory, pathname))
        end
      end
    end
  end
end
