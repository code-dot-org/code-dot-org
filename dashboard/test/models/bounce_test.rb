require 'test_helper'

class BounceTest < ActiveSupport::TestCase
  test 'only some skin/theme combinations are valid' do
    validations = Bounce.skins.product(Bounce.themes).map do |skin, theme|
      level = build :bounce, skin: skin, theme: theme
      level.valid?
    end

    expected = [
      true, true, true, false, false, false, true, true, true, false, false,
      false, true, false, true, true, true, true
    ]

    assert_equal expected, validations
  end
end
