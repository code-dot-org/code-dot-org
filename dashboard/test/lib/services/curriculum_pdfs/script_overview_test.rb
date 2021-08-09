require 'test_helper'
require 'pdf/conversion'
require 'pdf/collate'
require 'fileutils'

class Services::CurriculumPdfs::ScriptOverviewTest < ActiveSupport::TestCase
  setup do
    PDF.stubs(:invoke_generation_script)
    PDF.stubs(:merge_local_pdfs)
  end

  test 'PDF paths (and urls) are versioned' do
    script = create(:script, seeded_from: Time.at(1), name: "test-pdf-path")
    assert_equal "test-pdf-path/19700101000001/test-pdf-path.pdf",
      Services::CurriculumPdfs.get_script_overview_pathname(script).to_s
    script.update!(seeded_from: Time.at(2))
    assert_equal "test-pdf-path/19700101000002/test-pdf-path.pdf",
      Services::CurriculumPdfs.get_script_overview_pathname(script).to_s
  end

  test 'Script Overview PDFs are generated into the given directory' do
    script = create(:script, seeded_from: Time.now)
    Dir.mktmpdir('curriculum_pdfs_script_overview_test') do |tmpdir|
      assert Dir.glob(File.join(tmpdir, '**/*.pdf')).empty?
      PDF.expects(:generate_from_url).with do |url, _outpath|
        url == Rails.application.routes.url_helpers.script_url(script) + "?no_redirect=true&viewAs=Teacher"
      end
      Services::CurriculumPdfs.generate_script_overview_pdf(script, tmpdir)
    end
  end

  test 'Script Overview PDF includes Lesson Plan PDFs' do
    script = create(:script, seeded_from: Time.now)
    lesson_group = create(:lesson_group, script: script)

    Dir.mktmpdir('curriculum_pdfs_script_overview_test') do |tmpdir|
      PDF.expects(:merge_local_pdfs).with {|_output, *input| input.length == 1}
      Services::CurriculumPdfs.generate_script_overview_pdf(script, tmpdir)

      lesson_group.lessons << create(:lesson, script: script)
      script.reload
      PDF.expects(:merge_local_pdfs).with {|_output, *input| input.length == 2}
      Services::CurriculumPdfs.generate_script_overview_pdf(script, tmpdir)

      lesson_group.lessons << create(:lesson, script: script)
      script.reload
      PDF.expects(:merge_local_pdfs).with {|_output, *input| input.length == 3}
      Services::CurriculumPdfs.generate_script_overview_pdf(script, tmpdir)
    end
  end
end
