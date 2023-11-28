require_relative '../../test_helper'
require_relative '../../../i18n/utils/pegasus_email'

describe I18n::Utils::PegasusEmail do
  describe '.sanitize_header' do
    subject {I18n::Utils::PegasusEmail.sanitize_header(markdown_header)}

    let(:markdown_header) {{'subject' => 'Expects only subject', 'title' => 'Unexpected header', 'invalid' => 'Unexpected header'}}

    it 'returns hash with only the `subject` key' do
      assert_equal({'subject' => 'Expects only subject'}, subject)
    end
  end
end
