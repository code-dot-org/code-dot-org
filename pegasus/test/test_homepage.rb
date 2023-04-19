require_relative './test_helper'
require_relative '../src/homepage'
require 'cdo/rack/request'
require 'minitest/autorun'
require 'active_support/hash_with_indifferent_access'

class HomepageTest < Minitest::Test
  describe 'Homepage' do
    before do
      @request = Rack::Request.new({})
    end

    it 'banner with showInternationally false is seen only by users in the US and with unknown country' do
      Homepage.class_variable_set(:@@json_path, File.join("#{pegasus_dir}/test/fixtures/homepage", 'homepage_test_in_US_or_unknown_location_banner.json'))

      @request.stubs(:country).returns("US")
      banner = Homepage.get_announcement_for_page("homepage", @request)
      assert_equal("show-in-US-or-unknown-location", banner[:id])

      @request.stubs(:country).returns(nil)
      banner = Homepage.get_announcement_for_page("homepage", @request)
      assert_equal("show-in-US-or-unknown-location", banner[:id])

      @request.stubs(:country).returns("AF")
      banner = Homepage.get_announcement_for_page("homepage", @request)
      refute banner
    end

    it 'banner with showInternationally true is seen only by users we know are outside the US' do
      Homepage.class_variable_set(:@@json_path, File.join("#{pegasus_dir}/test/fixtures/homepage", 'homepage_test_outside_US_banner.json'))

      @request.stubs(:country).returns("US")
      banner = Homepage.get_announcement_for_page("homepage", @request)
      refute banner

      @request.stubs(:country).returns(nil)
      banner = Homepage.get_announcement_for_page("homepage", @request)
      refute banner

      @request.stubs(:country).returns("AF")
      banner = Homepage.get_announcement_for_page("homepage", @request)
      assert_equal("show-outside-US", banner[:id])
    end

    it 'banner without showInternationally flag is seen by everyone' do
      Homepage.class_variable_set(:@@json_path, File.join("#{pegasus_dir}/test/fixtures/homepage", 'homepage_test_everywhere_banner.json'))

      @request.stubs(:country).returns("US")
      banner = Homepage.get_announcement_for_page("homepage", @request)
      assert_equal("show-everywhere", banner[:id])

      @request.stubs(:country).returns(nil)
      banner = Homepage.get_announcement_for_page("homepage", @request)
      assert_equal("show-everywhere", banner[:id])

      @request.stubs(:country).returns("AF")
      banner = Homepage.get_announcement_for_page("homepage", @request)
      assert_equal("show-everywhere", banner[:id])
    end
  end
end
