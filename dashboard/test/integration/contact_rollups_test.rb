require 'test_helper'
require 'cdo/contact_rollups'

class ContactRollupsTest < ActiveSupport::TestCase
  self.use_transactional_test_case = true
  def test_build_contact_rollups
    ContactRollups.build_contact_rollups
  end
end
