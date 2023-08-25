require 'active_support/concern'
require 'cdo/chat_client'
require 'pdf/conversion'

module Services
  module CurriculumPdfs
    # Contains all code related to generating PDFs of Lesson Plan content (ie,
    # content served from routes like /s/csp1-2021/lessons/1)
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
        def get_lesson_plan_pathname(lesson, student_facing = false, versioned: true)
          return nil unless lesson&.script&.seeded_from
          version_number = versioned ? Time.parse(lesson.script.seeded_from).to_s(:number) : 'fallback'
          suffix = student_facing ? '-Student' : ''
          filename = ActiveStorage::Filename.new(lesson.localized_name.parameterize(preserve_case: true) + suffix + ".pdf").to_s
          subdir = student_facing ? "student-lesson-plans" : "teacher-lesson-plans"
          return Pathname.new(File.join(lesson.script.name, version_number, subdir, filename))
        end

        # Build the full user-facing url where a PDF can be found for the given lesson.
        #
        # Expect this to look something like this: "https://lesson-plans.code.org/csp1-2021/20210909014219/teacher-lesson-plans/Welcome+to+CSP.pdf"
        def get_lesson_plan_url(lesson, student_facing=false)
          versioned = lesson_plan_pdf_exists_for?(lesson, student_facing)
          pathname = get_lesson_plan_pathname(lesson, student_facing, versioned: versioned)
          return nil if pathname.blank?

          File.join(get_base_url, pathname)
        end

        # Check S3 to see if we've already generated a PDF for the given lesson.
        def lesson_plan_pdf_exists_for?(lesson, student_facing=false)
          pathname = get_lesson_plan_pathname(lesson, student_facing).to_s
          Rails.cache.fetch("CurriculumPdfs/LessonPlans/pdf_exists/#{pathname}") do
            AWS::S3.exists_in_bucket(S3_BUCKET, pathname)
          end
        end

        # Generate the PDF for the given lesson into the given directory. Can
        # provide either a teacher- or a student-facing version of the content.
        def generate_lesson_pdf(lesson, directory="/tmp/", student_facing=false)
          url = student_facing ? Rails.application.routes.url_helpers.script_lesson_student_url(lesson.script, lesson) : Rails.application.routes.url_helpers.script_lesson_url(lesson.script, lesson)
          pathname = get_lesson_plan_pathname(lesson, student_facing)
          fallback_pathname = get_lesson_plan_pathname(lesson, student_facing, versioned: false)

          ChatClient.log "Generating #{pathname.to_s.inspect} from #{url.inspect}" if DEBUG

          FileUtils.mkdir_p(File.join(directory, pathname.dirname))
          PDF.generate_from_url(url, File.join(directory, pathname))

          FileUtils.mkdir_p(File.join(directory, fallback_pathname.dirname))
          FileUtils.cp(File.join(directory, pathname), File.join(directory, fallback_pathname))
        end
      end
    end
  end
end
