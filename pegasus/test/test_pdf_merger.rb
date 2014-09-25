require_relative '../../lib/cdo/pegasus'
require 'minitest/autorun'
require 'rubygems'
require 'pdf-reader'
require_relative '../src/env'
require 'pdf/collate'

class PDFMergerTest < Minitest::Unit::TestCase
  include PDF

  def setup
    @output = File.expand_path('../fixtures/output/out.pdf', __FILE__)
    @remote_collate_output_file =  File.expand_path('../fixtures/output/remote_files.pdf', __FILE__)
    @local_collate_output_file =  File.expand_path('../fixtures/output/local_files.pdf', __FILE__)
    @numbered_collate_output_file =  File.expand_path('../fixtures/output/numbered_files.pdf', __FILE__)
    @temp_generated_unnumbered_pdf = "#{@numbered_collate_output_file}.not_numbered.pdf"
    @output_files = [@output, @remote_collate_output_file, @local_collate_output_file, @numbered_collate_output_file, @temp_generated_unnumbered_pdf]

    delete_outfiles
    @local_pdf1 = File.expand_path('../fixtures/pdfs/1.pdf', __FILE__)
    @local_pdf2 = File.expand_path('../fixtures/pdfs/2.pdf', __FILE__)
    @remote_pdf1 = 'http://learn.code.org/unplugged/unplug3.pdf'
    @remote_pdf2 = 'http://learn.code.org/unplugged/unplug3-es-ES.pdf'
    @remote_collate_file =  File.expand_path('../fixtures/remote_files.collate', __FILE__)
    @local_collate_file =  File.expand_path('../fixtures/local_files.collate', __FILE__)
    @numbered_collate_file = File.expand_path('../fixtures/numbered_files.collate', __FILE__)
  end

  def delete_outfiles
    @output_files.each do |output_filename|
      File.delete(output_filename) if File.exists?(output_filename)
    end
  end

  def test_reading_pdfs
    assert_equal(14, PDF::Reader.new(@local_pdf1).pages.size)
    assert_equal(14, PDF::Reader.new(@local_pdf2).pages.size)
  end

  def test_merge_two_local_pdfs
    assert(!File.exists?(@output))
    PDF.merge_pdfs(@output, @local_pdf1, @local_pdf2)
    assert(File.exists?(@output))
    assert_equal(28, PDF::Reader.new(@output).pages.size)
  end

  def test_merge_two_remote_pdfs
    assert(!File.exists?(@output))
    PDF.merge_pdfs(@output, @remote_pdf1, @remote_pdf2)
    assert(File.exists?(@output))
    assert_equal(28, PDF::Reader.new(@output).pages.size)
  end

  def test_merge_from_file
    assert(!File.exists?(@remote_collate_output_file))
    merge_file_pdfs(@remote_collate_file, @remote_collate_output_file)
    assert(File.exists?(@remote_collate_output_file))
    assert_equal(28, PDF::Reader.new(@remote_collate_output_file).pages.size)
  end

  def test_merge_local_from_file
    assert(!File.exists?(@local_collate_output_file))
    merge_file_pdfs(@local_collate_file, @local_collate_output_file)
    assert(File.exists?(@local_collate_output_file))
    assert_equal(31, PDF::Reader.new(@local_collate_output_file).pages.size)
  end

  def test_merge_with_numbers
    assert(!File.exists?(@numbered_collate_output_file))
    merge_file_pdfs(@numbered_collate_file, @temp_generated_unnumbered_pdf)
    PDF.number_pdf(@temp_generated_unnumbered_pdf, @numbered_collate_output_file)
    assert(File.exists?(@numbered_collate_output_file))
    pages = PDF::Reader.new(@numbered_collate_output_file).pages
    assert_equal(31, pages.size)
    pages.each_with_index { |p, i| assert(p.text.include?("#{i + 1}")) }
  end

  def teardown
    delete_outfiles
  end

  private
  def merge_all_file_pdfs(glob)
    Dir.glob(glob).each do |file|
      merge_file_pdfs(file, file.sub('.collate', '.pdf'))
    end
  end

  def merge_file_pdfs(collate_file, output_path)
    _, pdfs = PDF.parse_collate_file(collate_file)
    PDF.merge_pdfs(output_path, *pdfs)
  end
end
