require 'cdo/chat_client'
require 'dynamic_config/dcdo'

module Services
  # Contains all code related to the generation, storage, and
  # retrieval of Curriculum PDFs.
  #
  # Also see curriculum_pdfs.rake for some associated logic
  module CurriculumPdfs
    include LessonPlans
    include Utils

    DEBUG = false
    S3_BUCKET = "cdo-lesson-plans#{'-dev' if DEBUG}".freeze

    # Whether or not we should generate PDFs. Specifically, this
    # encapsulates three concerns:
    #
    # 1. Is this code running on the staging server? We only want to do this
    #    as part of the staging build; the generated PDFs will be made
    #    available to other environments, so they don't need to run this
    #    process themselves.
    # 2. Is the script one for which we care about PDFs? Right now, we only
    #    want to generate PDFs for "migrated" scripts.
    # 3. Is the script actually being updated? The overall seed process is
    #    indiscriminate, and will happily re-seed content even without
    #    changes. This is fine for database upserts, but we want to be more
    #    cautious with the more-expensive PDFs generation process.
    #
    # In addition, we support manually disabling this feature with DCDO
    def self.generate_pdfs?(script_data)
      return true if DEBUG

      return false unless rack_env?(:staging)
      return false unless script_data['properties'].fetch('is_migrated', false)
      return false if DCDO.get('disable_curriculum_pdf_generation', false)

      script = Script.find_by(name: script_data['name'])
      return false unless script.present?

      new_timestamp = script_data['serialized_at']
      existing_timestamp = script.seeded_from
      !timestamps_equal(new_timestamp, existing_timestamp)
    end

    def self.generate_pdfs(script)
      ChatClient.log "Generating PDFs for #{script.name}"

      pdf_dir = Dir.mktmpdir("pdf_generation")

      # Individual Lesson Plan and Student Lesson Plan PDFs
      script.lessons.select(&:has_lesson_plan).each do |lesson|
        generate_lesson_pdf(lesson, pdf_dir)
        generate_lesson_pdf(lesson, pdf_dir, true) if script.include_student_lesson_plans
      end

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
      upload_generated_pdfs_to_s3(pdf_dir)

      FileUtils.remove_entry_secure(pdf_dir) unless DEBUG
    end

    def self.upload_generated_pdfs_to_s3(directory)
      ChatClient.log "Uploading all generated PDFs to S3"
      ChatClient.log "from local temporary directory #{directory.inspect}" if DEBUG
      Dir.glob(File.join(directory, '**/*.pdf')).each do |filepath|
        # Note that this "filename" includes subdirectories; this is fine
        # only because we're uploading to S3.
        data = File.read(filepath)
        filename = filepath.delete_prefix(directory).delete_prefix('/')
        AWS::S3.upload_to_bucket(S3_BUCKET, filename, data, no_random: true)
      end
    end
  end
end
