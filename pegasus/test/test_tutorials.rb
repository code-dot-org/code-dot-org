require_relative '../../deployment'
require_relative '../src/database'
require 'minitest/autorun'

class TutorialsTest < Minitest::Test
  def test_tutorials_contents_immutable
    Tutorials.new(:tutorials) # Warm cache

    tutorial = Tutorials.new(:tutorials).contents('code.org').first
    tutorial[:image] = 'xyz'
    refute_equal Tutorials.new(:tutorials).contents('code.org').first[:image], tutorial[:image]
  end

  def test_sort_by_popularity_code_org
    code_org = "code.org"

    assert Tutorials.sort_by_popularity?(code_org, "post-hoc")
    assert Tutorials.sort_by_popularity?(code_org, "pre-hoc")
    assert Tutorials.sort_by_popularity?(code_org, false)

    refute Tutorials.sort_by_popularity?(code_org, "bad data")
    refute Tutorials.sort_by_popularity?(code_org, "soon-hoc")
    refute Tutorials.sort_by_popularity?(code_org, "actual-hoc")
  end

  def test_sort_by_popularity_hour_of_code_com
    hour_of_code = "hourofcode.com"

    assert Tutorials.sort_by_popularity?(hour_of_code, "post-hoc")

    refute Tutorials.sort_by_popularity?(hour_of_code, "pre-hoc")
    refute Tutorials.sort_by_popularity?(hour_of_code, "actual-hoc")
    refute Tutorials.sort_by_popularity?(hour_of_code, false)
    refute Tutorials.sort_by_popularity?(hour_of_code, "not a value")
  end

  def test_sort_by_popularity_cs_ed_week_org
    cs_ed_week = "csedweek.org"

    assert Tutorials.sort_by_popularity?(cs_ed_week, "post-hoc")

    refute Tutorials.sort_by_popularity?(cs_ed_week, "pre-hoc")
    refute Tutorials.sort_by_popularity?(cs_ed_week, "soon-hoc")
    refute Tutorials.sort_by_popularity?(cs_ed_week, false)
    refute Tutorials.sort_by_popularity?(cs_ed_week, "unexpected")
  end
end
