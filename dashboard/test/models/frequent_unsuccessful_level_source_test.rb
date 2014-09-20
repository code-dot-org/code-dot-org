require 'test_helper'

class FrequentUnsuccessfulLevelSourceTest < ActiveSupport::TestCase

  def setup_activities(level_source, result, count)
    count.times do
      create :activity, level_id: level_source.level_id,
             level_source_id: level_source.id,
             test_result: result
    end
  end

  setup do
    @game1 = create :game
    @game2 = create :game

    @game1level1 = create :level, game_id: @game1.id
    @game1level2 = create :level, game_id: @game1.id
    @game2level1 = create :level, game_id: @game2.id
    @game2level2 = create :level, game_id: @game2.id

    @level_sources_data = [
        { :level => @game1level1, :passing => 3, :failing => 5,
          :hints => FrequentUnsuccessfulLevelSource::MAXIMUM_ACTIVE_HINT_COUNT },
        { :level => @game1level2, :passing => 6, :failing => 2 },
        { :level => @game2level1, :passing => 0, :failing => 10,
          :hints => FrequentUnsuccessfulLevelSource::MAXIMUM_ACTIVE_HINT_COUNT + 1 },
        { :level => @game2level2, :passing => 0, :failing => 11 }
    ]
    @level_sources = @level_sources_data.map { |x|
      level_source = create :level_source, level_id: x[:level].id
      setup_activities(level_source,
                       Activity::MAXIMUM_NONOPTIMAL_RESULT, x[:failing])
      setup_activities(level_source,
                       Activity::BEST_PASS_RESULT, x[:passing])
      if x[:hints]
        x[:hints].times do
          create :level_source_hint, level_source_id: level_source.id,
                 source: LevelSourceHint::CROWDSOURCED
        end
      end
      level_source
    }
  end

  # This should only insert @level_sources[0] because it is the only level
  # source with the appropriate game name and a frequency count >= 5.
  test "should populate game1 with freq cutoff of 5" do
    FrequentUnsuccessfulLevelSource.populate(5, @game1.name)
    assert_equal 1, FrequentUnsuccessfulLevelSource.count
    fuls = FrequentUnsuccessfulLevelSource.first
    assert_equal @level_sources[0], fuls.level_source
    assert_equal @level_sources_data[0][:level], fuls.level
    assert_equal @level_sources_data[0][:failing], fuls.num_of_attempts
    assert fuls.active
  end

  # This should insert @level_sources[0] and @level_sources[1] because they are
  # the only level sources with the appropriate game name and both have a
  # frequency count >= 2.
  test "should populate game1 with freq cutoff of 2" do
    FrequentUnsuccessfulLevelSource.populate(2, @game1.name)
    assert_equal 2, FrequentUnsuccessfulLevelSource.count

    fuls1 = FrequentUnsuccessfulLevelSource.where(:level_id => @game1level1.id).
        first
    assert_not_nil fuls1
    assert_equal @level_sources_data[0][:level], fuls1.level
    assert_equal @level_sources_data[0][:failing], fuls1.num_of_attempts
    assert fuls1.active  # More hints should be solicited.

    fuls2 = FrequentUnsuccessfulLevelSource.where(:level_id => @game1level2.id).
        first
    assert_not_nil fuls2
    assert_equal @level_sources_data[1][:level], fuls2.level
    assert_equal @level_sources_data[1][:failing], fuls2.num_of_attempts
    assert fuls1.active  # More hints should be solicited.
  end

  # This should insert @level_sources[2] and @level_sources[3] because they're
  # the only levels with frequency count >= 10.
  test "should populate both games with freq cutoff of 10" do
    FrequentUnsuccessfulLevelSource.populate(10, nil) # all games
    assert_equal 2, FrequentUnsuccessfulLevelSource.count

    fuls1 = FrequentUnsuccessfulLevelSource.where(:level_id => @game2level1).
        first
    assert_equal @level_sources[2], fuls1.level_source
    assert_equal @level_sources_data[2][:level], fuls1.level
    assert_equal @level_sources_data[2][:failing], fuls1.num_of_attempts
    assert !fuls1.active  # No more hints should be solicited.

    fuls2 = FrequentUnsuccessfulLevelSource.where(:level_id => @game2level2).
        first
    assert_equal @level_sources[3], fuls2.level_source
    assert_equal @level_sources_data[3][:level], fuls2.level
    assert_equal @level_sources_data[3][:failing], fuls2.num_of_attempts
    assert fuls2.active  # More hints should be solicited.
  end

  # Rerun previous test, mutating one level-source to be non-standardized
  # (having an xmlns attribute), which should cause it to be ignored.
  test "should ignore non-standardized level sources" do
    # Mutate level_sources[3] to have non-standardized data.
    # This should prevent it from ever being added.
    @level_sources[3].update(data: "foo #{LevelSource::XMLNS_STRING} bar")
    FrequentUnsuccessfulLevelSource.populate(10, nil) # all games
    assert_equal 1, FrequentUnsuccessfulLevelSource.count
    assert_equal @level_sources[2], FrequentUnsuccessfulLevelSource.first.level_source
  end

  # This changes the hints from having source CROWDSOURCED and ensures
  # that any FrequentUnsuccessfulLevelSources are active.
  test "should mark active if existing hints not crowdsourced" do
    LevelSourceHint.update_all(source: LevelSourceHint::STANFORD)
    FrequentUnsuccessfulLevelSource.populate(1, nil)
    # All level_sources should match, since freq_cutoff is 1.
    assert_equal @level_sources.size,  FrequentUnsuccessfulLevelSource.count
    # All of these should be active.
    assert_equal 0, FrequentUnsuccessfulLevelSource.where(:active => false).
        count
  end
end
