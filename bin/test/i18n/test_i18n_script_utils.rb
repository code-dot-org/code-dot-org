require_relative '../test_helper'
require_relative '../../i18n/i18n_script_utils'

class I18nScriptUtilsTest < Minitest::Test
  def test_to_crowdin_yaml
    assert_equal "---\n:en:\n  test: \"#example\"\n  'yes': 'y'\n", I18nScriptUtils.to_crowdin_yaml({en: {'test' => '#example', 'yes' => 'y'}})
  end
end
