require 'test_helper'

class ChildAccountHelperTest < ActionView::TestCase
  include ChildAccountHelper
  describe '.parental_permission_banner_data' do
    let(:user) {nil}
    let(:request) {ActionDispatch::Request.new({})}
  end
end
