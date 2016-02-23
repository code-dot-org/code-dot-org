require_relative '../../lib/cdo/pegasus'
require 'minitest/autorun'

class CSVTest < Minitest::Test
  def test_cdo_donors_csv
    donors_csv = CSV.read('./data/cdo-donors.csv')
    max_donor_weight = donors_csv.last[4]
    assert_equal max_donor_weight.to_f, 1.0
  end

  def test_cdo_donors_db
    donors_with_max_weight = DB[:cdo_donors].where(weight_f: 1.0)
    assert_equal donors_with_max_weight.count, 1
  end
end
