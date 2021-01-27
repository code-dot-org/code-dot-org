require 'test_helper'

class PaletteCategoryTest < ActiveSupport::TestCase
  test "can create category" do
    lab = create :lab, name: 'my-lab'
    category = create :palette_category, name: 'my-category', lab: lab
    assert_equal category.name, 'my-category'
  end
end
