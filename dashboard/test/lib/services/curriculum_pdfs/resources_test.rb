require 'test_helper'

require 'cdo/google/drive'
require 'open-uri'
require 'pdf/collate'
require 'pdf/conversion'

class Services::CurriculumPdfs::ResourcesTest < ActiveSupport::TestCase
  setup do
    PDF.stubs(:invoke_generation_script)
    PDF.stubs(:merge_local_pdfs)

    @fake_google_drive_file = mock
    @fake_google_drive_file.stubs(:export_as_file)
    @fake_google_drive_file.stubs(:download_to_file)
    @fake_google_drive_file.stubs(:available_content_types).returns([])
    @fake_google_drive_file.stubs(:id).returns("google-drive-file-id")
    Services::CurriculumPdfs.stubs(:google_drive_file_by_url).returns(@fake_google_drive_file)

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
      first_lesson.resources << create(:resource, url: "test.pdf", include_in_pdf: true)
      lesson_group.lessons << first_lesson
      script.reload
      PDF.expects(:merge_local_pdfs).with {|_output, *input| input.length == 2}
      Services::CurriculumPdfs.generate_script_resources_pdf(script, tmpdir)

      first_lesson = create(:lesson, script: script)
      first_lesson.resources << create(:resource, url: "test.pdf", include_in_pdf: true)
      lesson_group.lessons << first_lesson
      script.reload
      PDF.expects(:merge_local_pdfs).with {|_output, *input| input.length == 4}
      Services::CurriculumPdfs.generate_script_resources_pdf(script, tmpdir)
    end
  end

  test 'script resources PDF skips resources where should_include_in_pdf is falsy' do
    script = create(:script, seeded_from: Time.now)
    lesson_group = create(:lesson_group, script: script)
    lesson = create(:lesson, script: script)
    resource = create(:resource, url: "test.pdf", include_in_pdf: false)
    verified_teacher_resource = create(:resource, url: "verified-teacher-test.pdf", include_in_pdf: true, audience: 'Verified Teacher')

    lesson.resources << resource
    lesson.resources << verified_teacher_resource
    lesson_group.lessons << lesson
    script.reload

    Dir.mktmpdir('script resources pdf test') do |tmpdir|
      PDF.expects(:merge_local_pdfs).with {|_output, *input| input.empty?}
      Services::CurriculumPdfs.generate_script_resources_pdf(script, tmpdir)

      resource.include_in_pdf = true
      resource.save
      script.reload
      PDF.expects(:merge_local_pdfs).with {|_output, *input| input.length == 2}
      Services::CurriculumPdfs.generate_script_resources_pdf(script, tmpdir)
    end
  end

  test 'resources that are on google docs or drive can be retrieved as PDFs' do
    google_docs_resource = create(:resource, url: "https://docs.google.com/document/d/example")
    Services::CurriculumPdfs.expects(:google_drive_file_by_url).with(google_docs_resource.url).returns(@fake_google_drive_file)
    Services::CurriculumPdfs.fetch_resource_pdf(google_docs_resource)

    google_drive_resource = create(:resource, url: "https://drive.google.com/example")
    Services::CurriculumPdfs.expects(:google_drive_file_by_url).with(google_drive_resource.url).returns(@fake_google_drive_file)
    Services::CurriculumPdfs.fetch_resource_pdf(google_drive_resource)
  end

  test 'resources that are google forms will be ignored' do
    resource = create(:resource, url: "https://docs.google.com/forms/d/1OKy2U3F37NSgCBUez9XMi0UJtlHKPXIe_rxy0l_KEOg/view")
    Services::CurriculumPdfs.expects(:google_drive_file_by_url).never
    assert_nil Services::CurriculumPdfs.fetch_resource_pdf(resource)
  end

  test 'resources that are externally-hosted PDFs can be downloaded' do
    resource = create(:resource, url: "https://example.com/test.pdf", include_in_pdf: true)
    Dir.mktmpdir('curriculum_pdfs_script_overview_test') do |tmpdir|
      URI.expects(:open).with("https://example.com/test.pdf")
      assert Services::CurriculumPdfs.fetch_resource_pdf(resource, tmpdir)
    end
  end

  test 'fetch_url_to_path will download or export google file, as appropriate' do
    # test exporting
    @fake_google_drive_file.expects(:export_as_file).with("foo.pdf", "application/pdf")
    Services::CurriculumPdfs.fetch_url_to_path("https://docs.google.com/document/d/", "foo.pdf")

    # test downloading
    @fake_google_drive_file.stubs(:available_content_types).returns(["application/pdf"])
    @fake_google_drive_file.expects(:download_to_file).with("foo.pdf")
    Services::CurriculumPdfs.fetch_url_to_path("https://drive.google.com/", "foo.pdf")
  end
end
