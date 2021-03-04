require 'test_helper'
require 'pdf/conversion'

class Services::LessonPlanPdfsTest < ActiveSupport::TestCase
  setup do
    PDF.stubs(:generate_from_url)
  end

  test 'wraps ScriptSeed with PDF generation logic' do
    CDO.stubs(:rack_env).returns(:staging)
    script = create(:script, is_migrated: true, hidden: true)
    seed_hash = JSON.parse(Services::ScriptSeed.serialize_seeding_json(script))

    # Generate PDFs on first seed
    Services::LessonPlanPdfs.expects(:generate_pdfs).once
    Services::ScriptSeed.seed_from_hash(seed_hash)

    # Don't regenerate on a non-update seed
    Services::LessonPlanPdfs.expects(:generate_pdfs).never
    Services::ScriptSeed.seed_from_hash(seed_hash)

    # Do regenerate on an update seed
    seed_hash['script']['serialized_at'] =
      Time.parse(seed_hash['script']['serialized_at']) + 1.hour
    Services::LessonPlanPdfs.expects(:generate_pdfs).once
    Services::ScriptSeed.seed_from_hash(seed_hash)
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
    refute Services::LessonPlanPdfs.generate_pdfs?(script_data)
  end

  test 'timestamp equality can compare Times and Strings' do
    assert Services::LessonPlanPdfs.timestamps_equal(
      Time.new(2007, 1, 29, 12, 34, 56),
      "2007-01-29 12:34:56"
    )

    refute Services::LessonPlanPdfs.timestamps_equal(
      Time.new(2007, 1, 29, 12, 34),
      "2007-01-29 12:34:56"
    )

    assert Services::LessonPlanPdfs.timestamps_equal(
      "20070129123456",
      "2007-01-29 12:34:56"
    )

    assert Services::LessonPlanPdfs.timestamps_equal(
      "20070129123456",
      Time.parse("2007-01-29 12:34:56")
    )
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

    assert Services::LessonPlanPdfs.generate_pdfs?(script_data)
    script.update!(seeded_from: script_data['serialized_at'])
    refute Services::LessonPlanPdfs.generate_pdfs?(script_data)
  end

  test 'PDF paths (and urls) are versioned' do
    script = create(:script, seeded_from: Time.at(123_456_789))
    lesson = create(:lesson, script: script)
    original_pathname = Services::LessonPlanPdfs.get_pathname(lesson)
    unmodified_pathname = Services::LessonPlanPdfs.get_pathname(lesson)
    assert_equal original_pathname, unmodified_pathname

    script.update!(seeded_from: Time.at(234_567_890))
    new_pathname = Services::LessonPlanPdfs.get_pathname(lesson)
    refute_equal original_pathname, new_pathname
  end

  test 'Lesson PDFs are generated into the given directory' do
    script = create(:script, seeded_from: Time.now)
    lesson = create(:lesson, script: script)
    Dir.mktmpdir('lesson_plan_pdfs_test') do |tmpdir|
      assert Dir.glob(File.join(tmpdir, '**/*.pdf')).empty?
      url = Rails.application.routes.url_helpers.script_lesson_url(script, lesson)
      filename = File.join(tmpdir, Services::LessonPlanPdfs.get_pathname(lesson))
      PDF.expects(:generate_from_url).with(url, filename)
      Services::LessonPlanPdfs.generate_lesson_pdf(lesson, tmpdir)
    end
  end

  test 'All PDFs in the given directory are uploaded to S3' do
    Dir.mktmpdir('lesson_plan_pdfs_test') do |tmpdir|
      FileUtils.touch(File.join(tmpdir, 'file.txt'))
      FileUtils.touch(File.join(tmpdir, 'file.pdf'))
      FileUtils.mkdir_p(File.join(tmpdir, 'deeply', 'nested'))
      FileUtils.touch(File.join(tmpdir, 'deeply', 'nested', 'file.txt'))
      FileUtils.touch(File.join(tmpdir, 'deeply', 'nested', 'file.pdf'))

      AWS::S3.expects(:upload_to_bucket).with(
        Services::LessonPlanPdfs::S3_BUCKET,
        "file.pdf",
        "",
        no_random: true
      )
      AWS::S3.expects(:upload_to_bucket).with(
        Services::LessonPlanPdfs::S3_BUCKET,
        "deeply/nested/file.pdf",
        "",
        no_random: true
      )

      Services::LessonPlanPdfs.upload_generated_pdfs_to_s3(tmpdir)
    end
  end
end
