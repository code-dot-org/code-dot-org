require 'test_helper'

class LevelSourceTest < ActiveSupport::TestCase
  def setup_helper(level_source_id, source, selected_message, experiment_messages)
    LevelSourceHint.create!(
        level_source_id: level_source_id,
        hint: selected_message,
        status: LevelSourceHint::STATUS_SELECTED,
        source: source)
     experiment_messages.each do |message|
      LevelSourceHint.create!(level_source_id: level_source_id,
                              hint: message,
                              status: LevelSourceHint::STATUS_EXPERIMENT,
                              source: source)
    end
  end

  setup do
    @level = create :level
    @level_source = create(:level_source, level_id: @level[:id], data: 'data')

    # Set up crowdsourced hints.
    @selected_crowdsourced_message = 'selected crowdsourced hint'

    @experimental_crowdsourced_messages = [ 'experiment crowdsourced 1',
                                            'experiment crowdsourced 2' ]
    setup_helper(@level_source[:id],
                 LevelSourceHint::CROWDSOURCED,
                 @selected_crowdsourced_message,
                 @experimental_crowdsourced_messages)

    # Set up external (Stanford) hints.
    @selected_stanford_message = 'selected stanford hint'
    @experimental_stanford_messages = ['stanford exp1', 'stanford exp2' ]
    setup_helper(@level_source[:id],
                 LevelSourceHint::STANFORD,
                 @selected_stanford_message,
                 @experimental_stanford_messages)

    # Set up standardized and variant level_sources.
    @standard_data = 'dummy data'
    @variant_data =
        LevelSource::XMLNS_STRING + @standard_data + LevelSource::XMLNS_STRING
    @ls1_standard = create(:level_source,
        level_id: @level[:id], data: @standard_data)
    @ls1_variant = create(:level_source,
        level_id: @level[:id], data: @variant_data)
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

  test "should validate level_source factory for md5" do
    data = 'foo'
    level_source = create(:level_source, data: data)
    assert_equal(Digest::MD5.hexdigest(data), level_source.md5)
  end

  test "should get selected crowdsourced hint" do
    assert_equal @selected_crowdsourced_message,
                 @level_source.get_crowdsourced_hint.hint
  end

  test "should get selected Stanford hint" do
    assert_equal @selected_stanford_message,
                 @level_source.get_hint_from_source(LevelSourceHint::STANFORD).hint
  end

  test "should get selected external hint" do
    assert_equal @selected_stanford_message,
                 @level_source.get_external_hint.hint
  end

  def inactivate_selected_hint(source)
    hints = @level_source.level_source_hints.
      where(source: source, status: LevelSourceHint::STATUS_SELECTED)
    assert_equal 1, hints.to_a.count,
                 "Wrong number of selected hints with source #{source}"
    hints.first.update(status: LevelSourceHint::STATUS_INACTIVE)
  end

  test "should get experimental crowdsourced hint" do
    # Inactivate active hint so that an experimental one will be chosen.
    inactivate_selected_hint(LevelSourceHint::CROWDSOURCED)

    # If we do 50 iterations, it would be very surprising for any
    # hint never to be chosen.
    counts = @experimental_crowdsourced_messages.map {0}
    50.times do
      hint = @level_source.get_crowdsourced_hint
      assert_not_nil hint
      assert @experimental_crowdsourced_messages.include?(hint.hint),
             "Did not expect hint #{hint.hint}"
      index = @experimental_crowdsourced_messages.index(hint.hint)
      counts[index] += 1
    end
    counts.each { |count| assert_not_equal 0, count }
  end

  test "should get selected stanford hint" do
    hint = @level_source.get_external_hint
    assert_not_nil hint
    assert_equal @selected_stanford_message, hint.hint
  end

  test "should get experimental stanford hint" do
    # Inactivate active hint so that an experimental one will be chosen.
    inactivate_selected_hint(LevelSourceHint::STANFORD)

    hint = @level_source.get_external_hint
    assert_not_nil hint
    assert @experimental_stanford_messages.include? hint.hint
  end

  test "should not get hint when source nil" do
    assert_nil @level_source.get_hint_from_source nil
  end

  test "should get hint when source unspecified" do
    assert_not_nil @level_source.get_hint_from_any_source
  end

  test "should not get hint when source not present" do
    assert_nil @level_source.get_hint_from_source "no such source"
  end

  test "should raise ArgumentError on too many keys" do
    assert_raise(ArgumentError) {
      @level_source.get_hint_from_source_internal(including: 'foo', excluding: 'bar')
    }
  end

  test "should raise ArgumentError on illegal key" do
    assert_raise(ArgumentError) {
      @level_source.get_hint_from_source_internal(foo: 'bar')
    }
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
