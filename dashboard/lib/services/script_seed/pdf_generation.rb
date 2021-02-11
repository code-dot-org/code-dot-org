require 'pdf/conversion'

module Services
  module ScriptSeed
    # Contains all code related to the automatic generation of Lesson Plan PDFs
    # as part of the Script seeding process.
    module PdfGeneration
      # standard generic boilerplate code for prepending class methods
      def self.prepended(base)
        class << base
          prepend ClassMethods
        end
      end

      module ClassMethods
        # Wraps ScriptSeed.import_script with logic to (re-)generate a PDF for
        # the specified script after seeding.
        #
        # We specifically _wrap_ the method rather than simply extending it;
        # this is because we need to examine the state of the data prior to
        # seeding to determine whether or not we're going to want to generate a
        # pdf, but of course the generation itself should happen after seeding.
        def import_script(script_data)
          should_generate_pdfs = generate_pdfs?(script_data)
          result = super
          generate_pdfs(result) if should_generate_pdfs
          result
        end

        private

        # Whether or not we should generate PDFs. Specifically, this
        # encapsulates two concerns:
        #
        # 1. Is this code running on the staging server? We only want to do this
        #    as part of the staging build; the generated PDFs will be made
        #    available to other environments, so they don't need to run this
        #    process themselves.
        # 2. Is the script actually being updated? The overall seed process is
        #    indiscriminate, and will happily re-seed content even without
        #    changes. This is fine for database upserts, but we want to be more
        #    cautious with the more-expensive PDFs generation process.
        def generate_pdfs?(script_data)
          return false unless rack_env? :staging
          new_version = script_data["serialized_at"]
          existing_version = Script.find_by(name: script_data["name"]).seeded_at
          puts "generate_pdfs? #{new_version} != #{existing_version}"
          new_version != existing_version
        end

        def generate_pdfs(script)
          puts "regenerating PDFs for #{script.name}"

          # Individual Lesson PDFs
          script.lessons.each(&method(:generate_lesson_pdf))

          # TODO: Script Overview PDFs
          #
          # There are still some outstanding questions as to what exactly we
          # want to do here. We know we want to provide a single PDF containing
          # all lesson data (so users who want to print all lessons for a script
          # can do so in a single print job), but it sounds like we also want
          # some kind of script overview contenet and possibly also a "visual
          # map" of the lesson plans.
          #
          # Notably, we haven't yet moved over course and script overview
          # content from CurriculumBuilder nor built views for displaying that
          # content. Once we do, we will be better prepared to figure out what
          # kind of PDF to construct here.
        end

        def generate_lesson_pdf(lesson)
          url = Rails.application.routes.url_helpers.lesson_url(lesson)
          version_number = Time.parse(lesson.script.seeded_at).to_s(:number)
          filename = "#{lesson.script.name}.#{version_number}.#{lesson.key}.pdf"
          sanitized_filename = ActiveStorage::Filename.new(filename).sanitized

          PDF.generate_from_url(url, sanitized_filename, verbose: true)
        end
      end
    end
  end
end
