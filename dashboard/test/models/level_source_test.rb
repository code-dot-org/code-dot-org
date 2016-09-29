require 'test_helper'

class LevelSourceTest < ActiveSupport::TestCase
  setup do
    @level = create :level
    @level_source = create(:level_source, level_id: @level.id, data: 'data')

    # Set up standardized and variant level_sources.
    @standard_data = 'dummy data'
    @variant_data =
      LevelSource::XMLNS_STRING + @standard_data + LevelSource::XMLNS_STRING
    @ls1_standard = create(:level_source,
      level_id: @level.id, data: @standard_data)
    @ls1_variant = create(:level_source,
      level_id: @level.id, data: @variant_data)
    assert_equal @ls1_standard.level_id, @ls1_variant.level_id

    level2_id = create(:level).id
    @ls2_standard =
      create(:level_source, level_id: level2_id, data: @standard_data)
    @ls2_variant =
      create(:level_source, level_id: level2_id, data: @variant_data)
    level3_id = create(:level).id
    @ls3_variant =
      create(:level_source, level_id: level3_id, data: @variant_data)
  end

  test "should not create level source with utf8mb8" do
    program = "<xml>#{panda_panda}</xml>"
    level_source = LevelSource.find_identical_or_create(@level, program)
    assert !level_source.valid?
    assert_equal ['Data is invalid'], level_source.errors.full_messages
  end

  test "should validate level_source factory for md5" do
    data = 'foo'
    level_source = create(:level_source, data: data)
    assert_equal(Digest::MD5.hexdigest(data), level_source.md5)
  end

  test "should recognize standardized level sources" do
    assert @ls1_standard.standardized?
    assert !@ls1_variant.standardized?
    assert @ls2_standard.standardized?
    assert !@ls2_variant.standardized?
    assert !@ls3_variant.standardized?
  end

  test "should find standardized version when standardized" do
    assert_equal @ls1_standard.id, @ls1_standard.get_standardized_id
    assert_equal @ls2_standard.id, @ls2_standard.get_standardized_id
  end

  test "should find standardized version when not standardized" do
    assert_equal @ls1_standard.id, @ls1_variant.get_standardized_id
    assert_equal @ls2_standard.id, @ls2_variant.get_standardized_id
    ls3_standard = LevelSource.find(@ls3_variant.get_standardized_id)
    assert_equal @ls3_variant.level_id, ls3_standard.level_id
    assert_equal @ls1_standard.data, ls3_standard.data
  end
end
