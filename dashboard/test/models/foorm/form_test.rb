require 'test_helper'

class Foorm::FormTest < ActiveSupport::TestCase
  test 'get latest form and version gets correct form' do
    form1 = create :foorm_form
    form2 = create :foorm_form, name: form1.name, version: form1.version + 1

    form, version = Foorm::Form.get_form_and_latest_version_for_name(form1.name)
    assert_equal form2.name, form.name
    assert_equal form2.version, version
  end
end
