require 'test_helper'

require 'cdo/google/drive'
require 'open-uri'
require 'pdf/collate'
require 'pdf/conversion'

class Services::CurriculumPdfs::ResourcesTest < ActiveSupport::TestCase
  setup do
    PDF.stubs(:invoke_generation_script)
    PDF.stubs(:merge_local_pdfs)
    Services::CurriculumPdfs.stubs(:export_from_google)

    # mock some file operations for the 'download PDF from url' case
    IO.stubs(:copy_stream)
    URI.stubs(:open).returns(StringIO.new)
  end

  test 'script resources PDF includes resources from all lessons' do
    script = create(:script, seeded_from: Time.now)
    lesson_group = create(:lesson_group, script: script)

    Dir.mktmpdir('script resources pdf test') do |tmpdir|
      PDF.expects(:merge_local_pdfs).with {|_output, *input| input.empty?}
      Services::CurriculumPdfs.generate_script_resources_pdf(script, tmpdir)

      first_lesson = create(:lesson, script: script)
      first_lesson.resources << create(:resource, url: "test.pdf")
      lesson_group.lessons << first_lesson
      script.reload
      PDF.expects(:merge_local_pdfs).with {|_output, *input| input.length == 2}
      Services::CurriculumPdfs.generate_script_resources_pdf(script, tmpdir)

      first_lesson = create(:lesson, script: script)
      first_lesson.resources << create(:resource, url: "test.pdf")
      lesson_group.lessons << first_lesson
      script.reload
      PDF.expects(:merge_local_pdfs).with {|_output, *input| input.length == 4}
      Services::CurriculumPdfs.generate_script_resources_pdf(script, tmpdir)
    end
  end

  test 'resources that are on google docs or drive can be retrieved as PDFs' do
    resource = create(:resource, url: "https://docs.google.com/example")
    Dir.mktmpdir('curriculum_pdfs_script_overview_test') do |tmpdir|
      path = File.join(tmpdir, "resource.fake_name.pdf")
      Services::CurriculumPdfs.expects(:export_from_google).with("https://docs.google.com/example", path)
      assert Services::CurriculumPdfs.fetch_resource_pdf(resource, tmpdir)
    end
  end

  test 'resources that are externally-hosted PDFs can be downloaded' do
    resource = create(:resource, url: "https://example.com/test.pdf")
    Dir.mktmpdir('curriculum_pdfs_script_overview_test') do |tmpdir|
      URI.expects(:open).with("https://example.com/test.pdf")
      assert Services::CurriculumPdfs.fetch_resource_pdf(resource, tmpdir)
    end
  end
end
