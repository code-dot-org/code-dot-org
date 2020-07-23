require_relative '../test_helper'
require 'cdo/lazy'

class LazyTest < Minitest::Test
  def test_lazy
    loaded = false
    lazy = Cdo.lazy {loaded = true; 'Lazy'}
    refute loaded
    assert_equal 'Lazy', lazy
    assert loaded
  end

  def test_nil
    lazy = Cdo.lazy {nil}
    assert_nil lazy
  end

  def test_class
    lazy = Cdo.lazy {'test'}
    assert_instance_of String, lazy
    assert_instance_of Cdo::Lazy, lazy
    assert_kind_of String, lazy
    assert_kind_of Cdo::Lazy, lazy
    assert_equal String, lazy.class
  end
end
