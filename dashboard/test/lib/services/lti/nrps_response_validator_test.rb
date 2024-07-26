require 'test_helper'

class Services::Lti::NRPSResponseValidatorTest < ActiveSupport::TestCase
  setup do
    @nrps_response = {
      members: [
        message: [
          Policies::Lti::LTI_CUSTOM_CLAIMS.to_sym => {
            section_ids: [1],
            section_names: ['expected_section'],
          }
        ]
      ]
    }
  end

  test 'does not return any errors when all required fields are present' do
    assert_empty Services::Lti::NRPSResponseValidator.call(@nrps_response)
  end

  test 'returns errors when required "section_ids" field is missing' do
    @nrps_response.dig(:members, 0, :message, 0, Policies::Lti::LTI_CUSTOM_CLAIMS.to_sym).delete(:section_ids)

    assert_equal ['Your LTI Tool configuration is missing the required "custom_fields[section_ids]" field'],
                 Services::Lti::NRPSResponseValidator.call(@nrps_response)
  end

  test 'returns errors when required "section_names" field is missing' do
    @nrps_response.dig(:members, 0, :message, 0, Policies::Lti::LTI_CUSTOM_CLAIMS.to_sym).delete(:section_names)

    assert_equal ['Your LTI Tool configuration is missing the required "custom_fields[section_names]" field'],
                 Services::Lti::NRPSResponseValidator.call(@nrps_response)
  end
end
