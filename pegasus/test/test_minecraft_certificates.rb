require_relative './test_helper'
# rubocop:disable CustomCops/DashboardRequires
require_relative '../../dashboard/lib/script_constants'
# rubocop:enable CustomCops/DashboardRequires
require 'minitest/autorun'

class MinecraftCertificatesTest < Minitest::Test
  def setup
    @minecraft_certificates = ['mee', 'mee_empathy', 'mee_timecraft', 'mee_estate'] << ScriptConstants::CATEGORIES[:minecraft]
    @minecraft_certificates.flatten!
    tutorials_csv = CSV.read('./data/cdo-tutorials.csv', headers: true)
    @tutorials = tutorials_csv['code_s']
  end

  def test_minecraft_certificates_present_in_csv
    missing_tutorials = @minecraft_certificates.reject {|tutorial| @tutorials.include?(tutorial)}
    assert_empty missing_tutorials
  end

  def test_missing_minecraft_certificates
    missing_test_tutorials = ["test-tutorial1"]
    missing_tutorials = missing_test_tutorials.reject {|tutorial| @tutorials.include?(tutorial)}
    refute_empty missing_tutorials
  end
end
