require_relative '../../../test_helper'
require_relative '../../../../i18n/resources/pegasus/hourofcode'

class I18n::Resources::Pegasus::HourOfCodeTest < Minitest::Test
  class I18n::Resources::Pegasus::HourOfCode::Documents; end

  def setup
    I18n::Resources::Pegasus::HourOfCode::Documents.stubs(new: stub(helpers: stub))
  end

  def test_sync_in
    exec_seq = sequence('execution')

    expected_i18n_source_dir = CDO.dir('i18n/locales/source/hourofcode')

    FileUtils.expects(:mkdir_p).with(expected_i18n_source_dir).in_sequence(exec_seq)
    FileUtils.expects(:cp).with(CDO.dir('pegasus/sites.v3/hourofcode.com/i18n/en.yml'), expected_i18n_source_dir).in_sequence(exec_seq)

    Dir.expects(:[]).with(CDO.dir('pegasus/sites.v3/hourofcode.com/public/**/*.{md,md.partial}')).returns(
      [
        CDO.dir('pegasus/sites.v3/hourofcode.com/public/expected1.md'),
        CDO.dir('pegasus/sites.v3/hourofcode.com/public/expected2.md.partial')
      ]
    ).in_sequence(exec_seq)

    expected_i18n_source_file1_path = CDO.dir('i18n/locales/source/hourofcode/expected1.md')
    FileUtils.expects(:mkdir_p).with(expected_i18n_source_dir).in_sequence(exec_seq)
    FileUtils.expects(:cp).with(CDO.dir('pegasus/sites.v3/hourofcode.com/public/expected1.md'), expected_i18n_source_file1_path).in_sequence(exec_seq)
    I18n::Resources::Pegasus::HourOfCode::Documents.new.helpers.expects(:parse_yaml_header).with(expected_i18n_source_file1_path).returns(%w[expected_header expected_content expected_line]).in_sequence(exec_seq)
    I18nScriptUtils.expects(:sanitize_header!).with('expected_header').in_sequence(exec_seq)
    I18nScriptUtils.expects(:write_markdown_with_header).with('expected_content', 'expected_header', expected_i18n_source_file1_path).in_sequence(exec_seq)

    expected_i18n_source_file2_path = CDO.dir('i18n/locales/source/hourofcode/expected2.md')
    FileUtils.expects(:mkdir_p).with(expected_i18n_source_dir).in_sequence(exec_seq)
    FileUtils.expects(:cp).with(CDO.dir('pegasus/sites.v3/hourofcode.com/public/expected2.md.partial'), expected_i18n_source_file2_path).in_sequence(exec_seq)
    I18n::Resources::Pegasus::HourOfCode::Documents.new.helpers.expects(:parse_yaml_header).with(expected_i18n_source_file2_path).returns(%w[expected_header expected_content expected_line]).in_sequence(exec_seq)
    I18nScriptUtils.expects(:sanitize_header!).with('expected_header').in_sequence(exec_seq)
    I18nScriptUtils.expects(:write_markdown_with_header).with('expected_content', 'expected_header', expected_i18n_source_file2_path).in_sequence(exec_seq)

    I18n::Resources::Pegasus::HourOfCode.sync_in
  end
end
