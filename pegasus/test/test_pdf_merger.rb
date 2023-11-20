# See docs/pdf-lesson-plan-generation.md for more information on running and testing

require_relative '../../lib/cdo/pegasus'
require_relative './test_helper'
require 'minitest/autorun'
require 'rubygems'
require 'pdf-reader'
require_relative '../src/env'
require 'pdf/collate'

class PDFMergerTest < Minitest::Test
  include PDF

  def setup
    @output = File.expand_path('../fixtures/output/out.pdf', __FILE__)
    @remote_collate_output_file = File.expand_path('../fixtures/output/remote_files.pdf', __FILE__)
    @local_collate_output_file =  File.expand_path('../fixtures/output/local_files.pdf', __FILE__)
    @numbered_collate_output_file =  File.expand_path('../fixtures/output/numbered_files.pdf', __FILE__)
    @temp_generated_unnumbered_pdf = "#{@numbered_collate_output_file}.not_numbered.pdf"
    @output_files = [
      @output,
      @remote_collate_output_file,
      @local_collate_output_file,
      @numbered_collate_output_file,
      @temp_generated_unnumbered_pdf
    ]

    delete_outfiles
    @local_pdf1 = File.expand_path('../fixtures/pdfs/1.pdf', __FILE__)
    @local_pdf2 = File.expand_path('../fixtures/pdfs/2.pdf', __FILE__)
    @remote_pdf1 = 'http://code.org/curriculum/docs/k-5/tableofcontents.pdf'
    @remote_pdf2 = 'https://code.org/curriculum/docs/k-5/tableofcontents.pdf'
    @remote_collate_file = File.expand_path('../fixtures/remote_files.collate', __FILE__)
    @local_collate_file =  File.expand_path('../fixtures/local_files.collate', __FILE__)
    @numbered_collate_file = File.expand_path('../fixtures/numbered_files.collate', __FILE__)
  end

  def assert_local_dependencies
    [
      {
        name: 'gs',
        url: 'https://www.ghostscript.com/',
        osx: 'brew install gs',
        ubuntu: 'sudo apt-get install ghostscript'
      },
      {
        name: 'pdftk',
        url: 'https://www.pdflabs.com/tools/pdftk-the-pdf-toolkit/',
        osx: 'brew install https://raw.github.com/quantiverge/homebrew-binary/pdftk/pdftk.rb',
        ubuntu: 'sudo apt-get install pdftk'
      },
      {
        name: 'enscript',
        url: 'https://www.gnu.org/software/enscript/',
        osx: 'brew install enscript',
        ubuntu: 'sudo apt-get install enscript'
      }
    ].each do |dependency|
      found = system 'which', dependency[:name], out: '/dev/null'
      missing_dependency_message = <<~MSG
        Expected '#{dependency[:name]}' to be installed.
            This test depends on #{dependency[:name]} (#{dependency[:url]})
            You should install it locally:
               OSX: #{dependency[:osx]}
            Ubuntu: #{dependency[:ubuntu]}
      MSG

      if RUBY_PLATFORM.include? 'linux'
        # Require dependencies on linux which our servers use
        assert found, missing_dependency_message
      else
        # Skip these tests if we are on OSX and missing dependencies;
        # There's a known problem installing pdftk on OSX right now (see SETUP.md)
        unless found
          puts missing_dependency_message
          skip missing_dependency_message
        end
      end
    end
  end

  def delete_outfiles
    @output_files.each do |output_filename|
      FileUtils.rm_f(output_filename)
    end
  end

  def test_reading_pdfs
    assert_local_dependencies
    assert_equal 14, PDF::Reader.new(@local_pdf1).pages.size
    assert_equal 14, PDF::Reader.new(@local_pdf2).pages.size
  end

  def test_merge_two_local_pdfs
    assert_local_dependencies
    refute File.exist?(@output), "Expected file #{@output} not to exist."
    PDF.merge_pdfs(@output, @local_pdf1, @local_pdf2)
    assert File.exist?(@output), "Expected file #{@output} to exist."
    assert_equal 28, PDF::Reader.new(@output).pages.size
  end

  def test_merge_two_remote_pdfs
    assert_local_dependencies
    VCR.use_cassette('pdf/merge_remote') do
      refute File.exist?(@output), "Expected file #{@output} not to exist."
      PDF.merge_pdfs(@output, @remote_pdf1, @remote_pdf2)
      assert File.exist?(@output), "Expected file #{@output} to exist."
      assert_equal 12, PDF::Reader.new(@output).pages.size
    end
  end

  def test_merge_from_file
    assert_local_dependencies
    VCR.use_cassette('pdf/merge_remote') do
      refute File.exist?(@remote_collate_output_file), "Expected file #{@remote_collate_output_file} not to exist."
      merge_file_pdfs(@remote_collate_file, @remote_collate_output_file)
      assert File.exist?(@remote_collate_output_file), "Expected file #{@remote_collate_output_file} to exist."
      assert_equal 12, PDF::Reader.new(@remote_collate_output_file).pages.size
    end
  end

  def test_merge_local_from_file
    assert_local_dependencies
    refute File.exist?(@local_collate_output_file), "Expected file #{@local_collate_output_file} not to exist."
    merge_file_pdfs(@local_collate_file, @local_collate_output_file)
    assert File.exist?(@local_collate_output_file), "Expected file #{@local_collate_output_file} to exist."
    assert_equal 28, PDF::Reader.new(@local_collate_output_file).pages.size
  end

  def test_merge_with_numbers
    assert_local_dependencies
    refute File.exist?(@numbered_collate_output_file), "Expected file #{@numbered_collate_output_file} not to exist."
    merge_file_pdfs(@numbered_collate_file, @temp_generated_unnumbered_pdf)
    PDF.number_pdf(@temp_generated_unnumbered_pdf, @numbered_collate_output_file)
    assert File.exist?(@numbered_collate_output_file), "Expected file #{@numbered_collate_output_file} to exist."
    pages = PDF::Reader.new(@numbered_collate_output_file).pages
    assert_equal 28, pages.size, "Has #{pages.size} pages, should have 28."
    assert_includes pages[27].text, '28'
  end

  def teardown
    delete_outfiles
  end

  private def merge_all_file_pdfs(glob)
    Dir.glob(glob).each do |file|
      merge_file_pdfs(file, file.sub('.collate', '.pdf'))
    end
  end

  private def merge_file_pdfs(collate_file, output_path)
    _, pdfs = PDF.parse_collate_file(collate_file)
    PDF.merge_pdfs(output_path, *pdfs)
  end
end
