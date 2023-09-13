require_relative '../../../test_helper'
require_relative '../../../../i18n/resources/pegasus/markdown'

class I18n::Resources::Pegasus::MarkdownTest < Minitest::Test
  class I18n::Resources::Pegasus::Markdown::Documents; end

  def setup
    I18n::Resources::Pegasus::Markdown::Documents.stubs(new: stub(helpers: stub))
  end

  def test_sync_in
    exec_seq = sequence('execution')

    expected_sync_in_file_paths.each do |expected_original_file_path, expected_i18n_source_path|
      FileUtils.expects(:mkdir_p).with(File.dirname(expected_i18n_source_path)).in_sequence(exec_seq)
      FileUtils.expects(:cp).with(expected_original_file_path, expected_i18n_source_path).in_sequence(exec_seq)

      I18n::Resources::Pegasus::Markdown::Documents.new.helpers.expects(:parse_yaml_header).with(expected_i18n_source_path).returns(%w[expected_header expected_content expected_line]).in_sequence(exec_seq)

      I18nScriptUtils.expects(:sanitize_markdown_header).with('expected_header').returns('sanitized_header').in_sequence(exec_seq)
      I18nScriptUtils.expects(:write_markdown_with_header).with('expected_content', 'sanitized_header', expected_i18n_source_path).in_sequence(exec_seq)
    end

    I18n::Resources::Pegasus::Markdown.sync_in
  end

  private

  def expected_sync_in_file_paths
    [
      [
        CDO.dir('pegasus/sites.v3/code.org/public/athome.md.partial'),
        CDO.dir('i18n/locales/source/markdown/public/athome.md')
      ],
      [
        CDO.dir('pegasus/sites.v3/code.org/public/break.md.partial'),
        CDO.dir('i18n/locales/source/markdown/public/break.md')
      ],
      [
        CDO.dir('pegasus/sites.v3/code.org/public/coldplay.md.partial'),
        CDO.dir('i18n/locales/source/markdown/public/coldplay.md')
      ],
      [
        CDO.dir('pegasus/sites.v3/code.org/public/curriculum/unplugged.md.partial'),
        CDO.dir('i18n/locales/source/markdown/public/curriculum/unplugged.md')
      ],
      [
        CDO.dir('pegasus/sites.v3/code.org/public/educate/curriculum/csf-transition-guide.md'),
        CDO.dir('i18n/locales/source/markdown/public/educate/curriculum/csf-transition-guide.md')
      ],
      [
        CDO.dir('pegasus/sites.v3/code.org/public/educate/it.md'),
        CDO.dir('i18n/locales/source/markdown/public/educate/it.md')
      ],
      [
        CDO.dir('pegasus/sites.v3/code.org/public/helloworld.md.partial'),
        CDO.dir('i18n/locales/source/markdown/public/helloworld.md')
      ],
      [
        CDO.dir('pegasus/sites.v3/code.org/public/international/about.md.partial'),
        CDO.dir('i18n/locales/source/markdown/public/international/about.md')
      ],
      [
        CDO.dir('pegasus/sites.v3/code.org/public/poetry.md.partial'),
        CDO.dir('i18n/locales/source/markdown/public/poetry.md')
      ],
      [
        CDO.dir('pegasus/sites.v3/code.org/views/hoc2022_create_activities.md.partial'),
        CDO.dir('i18n/locales/source/markdown/public/views/hoc2022_create_activities.md')
      ],
      [
        CDO.dir('pegasus/sites.v3/code.org/views/hoc2022_play_activities.md.partial'),
        CDO.dir('i18n/locales/source/markdown/public/views/hoc2022_play_activities.md')
      ],
      [
        CDO.dir('pegasus/sites.v3/code.org/views/hoc2022_explore_activities.md.partial'),
        CDO.dir('i18n/locales/source/markdown/public/views/hoc2022_explore_activities.md')
      ],
    ]
  end
end
