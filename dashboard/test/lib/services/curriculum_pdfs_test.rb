require 'test_helper'
require 'pdf/conversion'

module Services
  class CurriculumPdfsTest < ActiveSupport::TestCase
    include Curriculum::SharedCourseConstants

    setup do
      PDF.stubs(:generate_from_url)
    end

    test 'get_pdfless_lessons will only include lessons not present in S3' do
      unit_with_lesson_pdfs = create :script, :with_lessons, seeded_from: Time.now
      AWS::S3.stubs(:exists_in_bucket).with do |_bucket, key|
        key.include?(unit_with_lesson_pdfs.name)
      end.returns(true)

      unit_without_lesson_pdfs = create :script, :with_lessons, seeded_from: Time.now
      AWS::S3.stubs(:exists_in_bucket).with do |_bucket, key|
        key.include?(unit_without_lesson_pdfs.name)
      end.returns(false)

      assert_equal 0, Services::CurriculumPdfs.get_pdfless_lessons(unit_with_lesson_pdfs).count
      assert_equal 2, Services::CurriculumPdfs.get_pdfless_lessons(unit_without_lesson_pdfs).count
    end

    test 'get_pdfless_lessons excludes lessons without lesson plans' do
      AWS::S3.stubs(:exists_in_bucket).returns(false)
      unit_with_lesson_plans = create :script, :with_lessons, seeded_from: Time.now
      unit_without_lesson_plans = create :script, :with_lessons, seeded_from: Time.now
      unit_without_lesson_plans.lessons.each do |lesson|
        lesson.update!(has_lesson_plan: false)
      end

      assert_equal 2, Services::CurriculumPdfs.get_pdfless_lessons(unit_with_lesson_plans).count
      assert_equal 0, Services::CurriculumPdfs.get_pdfless_lessons(unit_without_lesson_plans).count
    end

    test 'get_pdf_enabled_scripts excludes unit in development published state' do
      in_development = create :script, published_state: PUBLISHED_STATE.in_development, seeded_from: true
      pilot = create :script, published_state: PUBLISHED_STATE.pilot, seeded_from: true
      beta = create :script, published_state: PUBLISHED_STATE.beta, seeded_from: true
      preview = create :script, published_state: PUBLISHED_STATE.preview, seeded_from: true
      stable = create :script, published_state: PUBLISHED_STATE.stable, seeded_from: true

      script_names = Services::CurriculumPdfs.get_pdf_enabled_scripts.map(&:name)

      refute_includes(script_names, in_development.name)
      refute_includes(script_names, pilot.name)
      assert_includes(script_names, beta.name)
      assert_includes(script_names, preview.name)
      assert_includes(script_names, stable.name)
    end

    test 'will not generate a overview PDF when unit does not have lesson plans' do
      CDO.stubs(:rack_env).returns(:staging)
      unit_with_lesson_plans = create(:script, is_migrated: true, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta)
      lg_with_lps = create(:lesson_group, script: unit_with_lesson_plans)
      create(:lesson, script: unit_with_lesson_plans, lesson_group: lg_with_lps, has_lesson_plan: true)

      unit_without_lesson_plans = create(:script, is_migrated: true, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta)
      lg_without_lps = create(:lesson_group, script: unit_with_lesson_plans)
      create(:lesson, script: unit_without_lesson_plans, lesson_group: lg_without_lps, has_lesson_plan: false)

      assert Services::CurriculumPdfs.should_generate_overview_pdf?(unit_with_lesson_plans)
      refute Services::CurriculumPdfs.should_generate_overview_pdf?(unit_without_lesson_plans)
    end

    test 'will only generate a resources PDF when unit has lesson plans' do
      CDO.stubs(:rack_env).returns(:staging)

      unit_without_lesson_plans = create(:script, is_migrated: true, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta)
      lg = create(:lesson_group, script: unit_without_lesson_plans)
      create(:lesson, script: unit_without_lesson_plans, lesson_group: lg, has_lesson_plan: false)

      unit_with_lesson_plans = create(:script, is_migrated: true, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta)
      lg = create(:lesson_group, script: unit_with_lesson_plans)
      create(:lesson, script: unit_with_lesson_plans, lesson_group: lg, has_lesson_plan: true)

      unit_with_lesson_resources = create(:script, is_migrated: true, published_state: Curriculum::SharedCourseConstants::PUBLISHED_STATE.beta)
      lg = create(:lesson_group, script: unit_with_lesson_resources)
      lesson = create(:lesson, script: unit_with_lesson_resources, lesson_group: lg, has_lesson_plan: true)
      lesson.resources = [create(:resource)]

      refute Services::CurriculumPdfs.should_generate_resource_pdf?(unit_without_lesson_plans)
      refute Services::CurriculumPdfs.should_generate_resource_pdf?(unit_with_lesson_plans)
      assert Services::CurriculumPdfs.should_generate_resource_pdf?(unit_with_lesson_resources)
    end

    test 'All PDFs in the given directory are uploaded to S3' do
      Dir.mktmpdir('curriculum_pdfs_test') do |tmpdir|
        FileUtils.touch(File.join(tmpdir, 'file.txt'))
        FileUtils.touch(File.join(tmpdir, 'file.pdf'))
        FileUtils.mkdir_p(File.join(tmpdir, 'deeply', 'nested'))
        FileUtils.touch(File.join(tmpdir, 'deeply', 'nested', 'file.txt'))
        FileUtils.touch(File.join(tmpdir, 'deeply', 'nested', 'file.pdf'))

        AWS::S3.expects(:upload_to_bucket).with(
          Services::CurriculumPdfs::S3_BUCKET,
          "file.pdf",
          "",
          no_random: true
        )
        AWS::S3.expects(:upload_to_bucket).with(
          Services::CurriculumPdfs::S3_BUCKET,
          "deeply/nested/file.pdf",
          "",
          no_random: true
        )

        Services::CurriculumPdfs.upload_generated_pdfs_to_s3(tmpdir)
      end
    end
  end
end
