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

  test 'resources that are google forms will be ignored' do
    resource = create(:resource, url: "https://docs.google.com/forms/d/1OKy2U3F37NSgCBUez9XMi0UJtlHKPXIe_rxy0l_KEOg/view")
    Services::CurriculumPdfs.expects(:export_from_google).never
    assert_nil Services::CurriculumPdfs.fetch_resource_pdf(resource)
  end

  test 'resources that are externally-hosted PDFs can be downloaded' do
    resource = create(:resource, url: "https://example.com/test.pdf")
    Dir.mktmpdir('curriculum_pdfs_script_overview_test') do |tmpdir|
      URI.expects(:open).with("https://example.com/test.pdf")
      assert Services::CurriculumPdfs.fetch_resource_pdf(resource, tmpdir)
    end
  end

  test 'export_from_google will download or export file, as appropriate' do
    # setup
    Services::CurriculumPdfs.unstub(:export_from_google)
    fake_drive_session = mock
    GoogleDrive::Session.stubs(:from_service_account_key).returns(fake_drive_session)

    # test downloading
    mock_pdf_file = OpenStruct.new(
      available_content_types: ["application/pdf"],
      download_to_file: true
    )
    fake_drive_session.stubs(:file_by_url).returns(mock_pdf_file)
    mock_pdf_file.expects(:download_to_file).with("foo.pdf")
    Services::CurriculumPdfs.export_from_google("", "foo.pdf")

    # test exporting
    mock_other_file = OpenStruct.new(
      available_content_types: [],
      id: "id"
    )
    fake_drive_session.stubs(:file_by_url).returns(mock_other_file)
    URI.expects(:open).with("https://docs.google.com/document/d/id/export?format=pdf")
    Services::CurriculumPdfs.export_from_google("", "foo.pdf")

    # teardown
    Services::CurriculumPdfs.stubs(:export_from_google)
  end
end
