require 'test_helper'

require 'cdo/google/drive'
require 'pdf/collate'
require 'pdf/conversion'
require 'uri'

class Services::CurriculumPdfs::ResourcesTest < ActiveSupport::TestCase
  setup do
    PDF.stubs(:invoke_generation_script)
    PDF.stubs(:merge_local_pdfs)

    # Note that this mimics opening a file in the Google Drive web viewer
    # Example: https://drive.google.com/file/d/1KHy848u_buBdM0IvNl65Xd5hGDOIlm7L/view
    @drive_path = "/tmp/example.pdf"
    @drive_file_id = "your_drive_file_id"
    @drive_url = "https://drive.google.com/file/d/" + @drive_file_id + "/view"
    @google_drive_resource = create(:resource, url: @drive_url)

    # This is the more common type of document uploaded as a resource
    @docs_path = '/tmp/resource.fake_name.pdf'
    @docs_file_id = 'example'
    @docs_url = "https://docs.google.com/document/d/" + @docs_file_id
    @google_docs_resource = create(:resource, url: @docs_url)

    @fake_service = mock('DriveService')
    Google::Apis::DriveV3::DriveService.stubs(:new).returns(@fake_service)
    @fake_service.stubs(:authorization=)
    @fake_service.stubs(:export_file)

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

  test 'url_to_id works for google docs' do
    mock_uri = mock('URI')
    URI.expects(:parse).with(@docs_url).returns(mock_uri)
    mock_uri.stubs(:host).returns('docs.google.com')
    mock_uri.stubs(:path).returns('/document/d/' + @docs_file_id)
    assert_equal @docs_file_id, Services::CurriculumPdfs.url_to_id(@docs_url)
  end

  test 'url_to_id works for google drive resources' do
    mock_uri = mock('URI')
    URI.expects(:parse).with(@drive_url).returns(mock_uri)
    mock_uri.stubs(:host).returns('drive.google.com')
    mock_uri.stubs(:path).returns("/file/d/" + @drive_file_id + "/view")
    assert_equal @drive_file_id, Services::CurriculumPdfs.url_to_id(@drive_url)
  end

  test 'resources that are google forms will be ignored' do
    resource = create(:resource, url: "https://docs.google.com/forms/d/1OKy2U3F37NSgCBUez9XMi0UJtlHKPXIe3_rxy0l_KEOg/view", name: "fake_form")
    @fake_service.expects(:export_file).never
    assert_nil Services::CurriculumPdfs.fetch_resource_pdf(resource)
  end

  test 'resources that are externally-hosted PDFs can be downloaded' do
    resource = create(:resource, url: "https://example.com/test.pdf", include_in_pdf: true)
    Dir.mktmpdir('curriculum_pdfs_script_overview_test') do |tmpdir|
      URI.expects(:parse).with("https://example.com/test.pdf")
      assert Services::CurriculumPdfs.fetch_resource_pdf(resource, tmpdir)
    end
  end

  test 'fetch_url_to_path works for google docs' do
    Services::CurriculumPdfs.expects(:url_to_id).with(@google_docs_resource.url).returns(@docs_file_id)
    @fake_service.expects(:export_file).with(@docs_file_id, 'application/pdf', download_dest: @docs_path)
    assert_equal @docs_path, Services::CurriculumPdfs.fetch_url_to_path(@docs_url, @docs_path)
  end

  test 'fetch_url_to_path works for google drive resources that can be exported as pdfs' do
    fake_file = OpenStruct.new
    fake_file.export_links = {"application/pdf" => "fake_export_link_to_pdf"}
    Services::CurriculumPdfs.expects(:url_to_id).with(@google_drive_resource.url).returns(@drive_file_id)
    @fake_service.stubs(:getFile).returns(fake_file)
    @fake_service.expects(:export_file).with(@drive_file_id, 'application/pdf', download_dest: @drive_path)
    assert_equal @drive_path, Services::CurriculumPdfs.fetch_url_to_path(@drive_url, @drive_path)
  end

  test 'fetch_url_to_path returns nil if google doc cannot be exported as PDF' do
    fake_file = OpenStruct.new
    fake_file.export_links = {}
    Services::CurriculumPdfs.expects(:url_to_id).with(@google_drive_resource.url).returns(@drive_file_id)
    @fake_service.stubs(:getFile).returns(fake_file)
    @fake_service.expects(:export_file).never
    assert_nil Services::CurriculumPdfs.fetch_url_to_path(@drive_url, @drive_path)
  end
end
