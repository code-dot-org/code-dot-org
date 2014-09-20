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
    @remote_collate_output_file =  File.expand_path('../fixtures/remote_files.pdf', __FILE__)
    @local_collate_output_file =  File.expand_path('../fixtures/local_files.pdf', __FILE__)
    delete_outfiles
    @local_pdf1 = File.expand_path('../fixtures/pdfs/1.pdf', __FILE__)
    @local_pdf2 = File.expand_path('../fixtures/pdfs/2.pdf', __FILE__)
    @remote_pdf1 = 'http://learn.code.org/unplugged/unplug3.pdf'
    @remote_pdf2 = 'http://learn.code.org/unplugged/unplug3-es-ES.pdf'
    @remote_collate_file =  File.expand_path('../fixtures/remote_files.collate', __FILE__)
    @local_collate_file =  File.expand_path('../fixtures/local_files.collate', __FILE__)
  end

  def delete_outfiles
    File.delete(@output) if File.exists?(@output)
    File.delete(@remote_collate_output_file) if File.exists?(@remote_collate_output_file)
    File.delete(@local_collate_output_file) if File.exists?(@local_collate_output_file)
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
    PDF.merge_file_pdfs(@remote_collate_file, @remote_collate_output_file)
    assert(File.exists?(@remote_collate_output_file))
    assert_equal(28, PDF::Reader.new(@remote_collate_output_file).pages.size)
  end

  def test_merge_local_from_file
    assert(!File.exists?(@local_collate_output_file))
    PDF.merge_file_pdfs(@local_collate_file, @local_collate_output_file)
    assert(File.exists?(@local_collate_output_file))
    assert_equal(31, PDF::Reader.new(@local_collate_output_file).pages.size)
  end

  def test_merge_all_files
    assert(!File.exists?(@local_collate_output_file))
    assert(!File.exists?(@remote_collate_output_file))
    PDF.merge_all_file_pdfs(pegasus_dir('test', 'fixtures', '*.collate'))
    assert(File.exists?(@local_collate_output_file))
    assert(File.exists?(@remote_collate_output_file))
    assert_equal(31, PDF::Reader.new(@local_collate_output_file).pages.size)
    assert_equal(28, PDF::Reader.new(@remote_collate_output_file).pages.size)
  end

  def teardown
    delete_outfiles
  end
end
