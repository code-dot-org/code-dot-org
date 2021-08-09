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
