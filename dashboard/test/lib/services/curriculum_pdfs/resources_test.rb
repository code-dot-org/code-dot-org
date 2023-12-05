require 'test_helper'

require 'cdo/google/drive'
require 'open-uri'
require 'pdf/collate'
require 'pdf/conversion'

require 'uri'
require 'google/apis/drive_v3'
require 'google/api_client/client_secrets'
require 'googleauth'
require 'googleauth/stores/file_token_store'

class Services::CurriculumPdfs::ResourcesTest < ActiveSupport::TestCase
  setup do
    PDF.stubs(:invoke_generation_script)
    PDF.stubs(:merge_local_pdfs)

    @fake_google_drive_file = mock
    @fake_google_drive_file.stubs(:get_file)
    @fake_google_drive_file.stubs(:export_links).returns(["pdf-fffff"])
    Services::CurriculumPdfs.stubs(:google_drive_file_by_url).returns(@fake_google_drive_file)

    # @fake_service = mock('DriveService')
    # Drive::DriveService.stubs(:new).returns(@fake_service)
    # @fake_service.stubs(:authorization=)
    # @fake_service.stubs(:export_file)

    # We have some custom logic in the title page generation which aggressively
    # checks for the actual existence of the file on the filesystem and raises
    # an exception if it doesn't find it; we don't actually want to create any
    # files on the filesystem as part of our test, so we stub that method
    Services::CurriculumPdfs.stubs(:generate_lesson_resources_title_page)

    # mock some file operations for the 'download PDF from url' case
    IO.stubs(:copy_stream)
    URI.stubs(:parse)
  end

  test 'script resources PDF includes resources from all lessons' do
    script = create(:script, seeded_from: Time.now)
    lesson_group = create(:lesson_group, script: script)
    FileUtils.stubs(:cp)

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
    FileUtils.stubs(:cp)

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
    # set-up service
    fake_service = mock('DriveService')
    Google::Apis::DriveV3::DriveService.stubs(:new).returns(fake_service)
    fake_service.stubs(:authorization=)
    fake_service.stubs(:export_file)

    # test google doc file that can be exported as PDF
    docs_path = '/tmp/resource.fake_name.pdf'
    docs_file_id = 'example'
    docs_url = "https://docs.google.com/document/d/" + docs_file_id
    google_docs_resource = create(:resource, url: docs_url)
    Services::CurriculumPdfs.expects(:url_to_id).with(google_docs_resource.url).returns(docs_file_id)
    Services::CurriculumPdfs.fetch_resource_pdf(google_docs_resource)
    fake_service.expects(:export_file).with(docs_file_id, 'application/pdf', download_dest: docs_path)
    assert_equal docs_path, Services::CurriculumPdfs.fetch_url_to_path(docs_url, docs_path)

    # test google drive file that can be exported as PDF
    drive_path = "/tmp/example.pdf"
    drive_file_id = "your_drive_file_id"
    drive_url = "https://drive.google.com/" + drive_file_id
    google_drive_resource = create(:resource, url: drive_url)

    fake_file = OpenStruct.new
    fake_file.export_links = {"application/pdf" => "fake_export_link_to_pdf"}
    fake_service.stubs(:getFile).returns(fake_file)
    fake_service.expects(:export_file).with(drive_file_id, 'application/pdf', download_dest: drive_path)
    Services::CurriculumPdfs.expects(:url_to_id).with(google_drive_resource.url).returns(drive_file_id)
    Services::CurriculumPdfs.fetch_resource_pdf(google_drive_resource)
    assert_equal drive_path, Services::CurriculumPdfs.fetch_url_to_path(drive_url, drive_path)
  end

  test 'resources that are google forms will be ignored' do
    fake_service = mock('DriveService')
    Google::Apis::DriveV3::DriveService.stubs(:new).returns(fake_service)
    fake_service.stubs(:authorization=)
    fake_service.stubs(:export_file)

    resource = create(:resource, url: "https://docs.google.com/forms/d/1OKy2U3F37NSgCBUez9XMi0UJtlHKPXIe3_rxy0l_KEOg/view", name: "fake_form")
    fake_service.expects(:export_file).never
    assert_nil Services::CurriculumPdfs.fetch_resource_pdf(resource)
  end

  test 'resources that are externally-hosted PDFs can be downloaded' do
    resource = create(:resource, url: "https://example.com/test.pdf", include_in_pdf: true)
    Dir.mktmpdir('curriculum_pdfs_script_overview_test') do |tmpdir|
      URI.expects(:parse).with("https://example.com/test.pdf")
      assert Services::CurriculumPdfs.fetch_resource_pdf(resource, tmpdir)
    end
  end
end
