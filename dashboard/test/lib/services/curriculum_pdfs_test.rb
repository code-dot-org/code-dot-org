require 'test_helper'
require 'pdf/conversion'

module Services
  class CurriculumPdfsTest < ActiveSupport::TestCase
    setup do
      PDF.stubs(:generate_from_url)
    end

    test 'gracefully handles nonexistent scripts' do
      # right now, we just handle nonexistent scripts by doing nothing. This
      # means that after a script gets added, it will need to be updated in some
      # way to trigger PDF generation. We could probably instead be more
      # proactive about generating PDFs for newly created scripts, but since this
      # feature is still brand new I think it makes sense to be conservative.
      script_data = {
        'properties' => {
          'is_migrated' => true
        },
        'serialized_at' => Time.now.getutc,
        'name' => "Some Script That Doesn't Exist (#{Time.now.to_i})"
      }
      assert_nil Script.find_by(name: script_data['name'])
      refute Services::CurriculumPdfs.generate_pdfs?(script_data)
    end

    test 'will only generate a PDF when content is updated' do
      CDO.stubs(:rack_env).returns(:staging)
      script = create(:script)
      script_data = {
        'properties' => {
          'is_migrated' => true
        },
        'serialized_at' => Time.now.getutc,
        'name' => script.name
      }

      script_data = JSON.parse(script_data.to_json)

      assert Services::CurriculumPdfs.generate_pdfs?(script_data)
      script.update!(seeded_from: script_data['serialized_at'])
      refute Services::CurriculumPdfs.generate_pdfs?(script_data)
    end

    test 'will not generate a PDF if using legacy lesson plans' do
      CDO.stubs(:rack_env).returns(:staging)
      script = create(:script)
      script_data = {
        'properties' => {
          'is_migrated' => true,
        },
        'serialized_at' => Time.now.getutc,
        'name' => script.name
      }

      script_data = JSON.parse(script_data.to_json)

      assert Services::CurriculumPdfs.generate_pdfs?(script_data)
      script_data['properties']['use_legacy_lesson_plans'] = true
      refute Services::CurriculumPdfs.generate_pdfs?(script_data)
    end

    test 'will not generate a overview PDF when unit does not have lesson plans' do
      CDO.stubs(:rack_env).returns(:staging)
      unit_with_lesson_plans = create(:script, is_migrated: true, published_state: SharedCourseConstants::PUBLISHED_STATE.beta)
      lg_with_lps = create(:lesson_group, script: unit_with_lesson_plans)
      create(:lesson, script: unit_with_lesson_plans, lesson_group: lg_with_lps, has_lesson_plan: true)

      unit_without_lesson_plans = create(:script, is_migrated: true, published_state: SharedCourseConstants::PUBLISHED_STATE.beta)
      lg_without_lps = create(:lesson_group, script: unit_with_lesson_plans)
      create(:lesson, script: unit_without_lesson_plans, lesson_group: lg_without_lps, has_lesson_plan: false)

      assert Services::CurriculumPdfs.should_generate_overview_pdf?(unit_with_lesson_plans)
      refute Services::CurriculumPdfs.should_generate_overview_pdf?(unit_without_lesson_plans)
    end

    test 'will not generate a overview PDF when unit is in pilot or in-development published state' do
      CDO.stubs(:rack_env).returns(:staging)
      pilot_unit = create(:script, is_migrated: true, published_state: SharedCourseConstants::PUBLISHED_STATE.pilot)
      pilot_lg = create(:lesson_group, script: pilot_unit)
      create(:lesson, script: pilot_unit, lesson_group: pilot_lg, has_lesson_plan: true)

      in_development_unit = create(:script, is_migrated: true, published_state: SharedCourseConstants::PUBLISHED_STATE.in_development)
      in_development_lg = create(:lesson_group, script: in_development_unit)
      create(:lesson, script: in_development_unit, lesson_group: in_development_lg, has_lesson_plan: true)

      beta_unit = create(:script, is_migrated: true, published_state: SharedCourseConstants::PUBLISHED_STATE.beta)
      beta_lg = create(:lesson_group, script: beta_unit)
      create(:lesson, script: beta_unit, lesson_group: beta_lg, has_lesson_plan: true)

      preview_unit = create(:script, is_migrated: true, published_state: SharedCourseConstants::PUBLISHED_STATE.preview)
      preview_lg = create(:lesson_group, script: preview_unit)
      create(:lesson, script: preview_unit, lesson_group: preview_lg, has_lesson_plan: true)

      stable_unit = create(:script, is_migrated: true, published_state: SharedCourseConstants::PUBLISHED_STATE.stable)
      stable_lg = create(:lesson_group, script: stable_unit)
      create(:lesson, script: stable_unit, lesson_group: stable_lg, has_lesson_plan: true)

      refute Services::CurriculumPdfs.should_generate_overview_pdf?(pilot_unit)
      refute Services::CurriculumPdfs.should_generate_overview_pdf?(in_development_unit)
      assert Services::CurriculumPdfs.should_generate_overview_pdf?(beta_unit)
      assert Services::CurriculumPdfs.should_generate_overview_pdf?(preview_unit)
      assert Services::CurriculumPdfs.should_generate_overview_pdf?(stable_unit)
    end

    test 'will only generate a resources PDF when unit has lesson plans' do
      CDO.stubs(:rack_env).returns(:staging)
      unit_with_lesson_plans = create(:script, is_migrated: true, published_state: SharedCourseConstants::PUBLISHED_STATE.beta)
      lg_with_lps = create(:lesson_group, script: unit_with_lesson_plans)
      create(:lesson, script: unit_with_lesson_plans, lesson_group: lg_with_lps, has_lesson_plan: true)

      unit_without_lesson_plans = create(:script, is_migrated: true, published_state: SharedCourseConstants::PUBLISHED_STATE.beta)
      lg_without_lps = create(:lesson_group, script: unit_with_lesson_plans)
      create(:lesson, script: unit_without_lesson_plans, lesson_group: lg_without_lps, has_lesson_plan: false)

      assert Services::CurriculumPdfs.should_generate_resource_pdf?(unit_with_lesson_plans)
      refute Services::CurriculumPdfs.should_generate_resource_pdf?(unit_without_lesson_plans)
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
