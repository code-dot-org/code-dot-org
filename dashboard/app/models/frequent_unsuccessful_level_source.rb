# == Schema Information
#
# Table name: frequent_unsuccessful_level_sources
#
#  id              :integer          not null, primary key
#  level_source_id :integer          not null
#  active          :boolean          default(FALSE), not null
#  level_id        :integer          not null
#  num_of_attempts :integer
#  created_at      :datetime
#  updated_at      :datetime
#

# Collects all LevelSources with large number of attempts, for entry into the crowdsourced hints system
class FrequentUnsuccessfulLevelSource < ActiveRecord::Base
  belongs_to :level_source
  belongs_to :level
  has_many :level_source_hints, through: :level_source

  # The active field is true if there are no more than this many corresponding
  # level_source_hints.  More should be solicited.
  MAXIMUM_ACTIVE_HINT_COUNT = 3

  # Populate frequent_unsuccessful_level_source with level_sources that
  # occurred at least freq_cutoff times.  If game_name is provided, only
  # level_sources for that game are inserted.
  def self.populate(freq_cutoff, game_name)
    # Create a query to determine level_source_ids that have occurred at
    # least freq_cutoff times with non-optimal test results.  If game_name
    # was specified, limit the query to the named game.
    game_id = game_name && Game.where('name = ?', game_name).first.id
    if game_id
      query = "select a.level_source_id, a.level_id, count(*) as num_of_attempts
         from activities a, levels l
         where a.level_id = l.id and l.game_id = #{game_id}
            and a.test_result <= #{Activity::MAXIMUM_NONOPTIMAL_RESULT}
         group by a.level_source_id
         having num_of_attempts >= #{freq_cutoff}
         order by num_of_attempts DESC"
    else
      query = "select level_source_id, level_id, count(*) as num_of_attempts
         from activities
         where test_result <= #{Activity::MAXIMUM_NONOPTIMAL_RESULT}
         group by level_source_id
         having num_of_attempts >= #{freq_cutoff}
         order by num_of_attempts DESC"
    end

    # Execute the query, adding level_sources to the model if they are
    # standardized (do not contain an xmlns attribute).  The active column
    # is set to indicate whether more crowdsourced hints are needed.
    Activity.connection.execute(query).each do |level_source_id, level_id, count|
      next unless level_source_id && level_id
      level_source = LevelSource.find(level_source_id)
      # Note that this ignores counts from non-standardized level sources.
      # Should we move this check into the above queries, which would
      # increase complexity and violate abstraction but improve efficiency?
      next unless level_source.standardized?
      unsuccessful_level_source = FrequentUnsuccessfulLevelSource.where(
          level_source_id: level_source_id,
          level_id: level_id).first_or_create
      unsuccessful_level_source.num_of_attempts = count
      # Make active if there are not enough crowdsourced hints yet.
      unsuccessful_level_source.active =
        LevelSourceHint.where(level_source_id: level_source_id,
                              source: LevelSourceHint::CROWDSOURCED).
            size <= MAXIMUM_ACTIVE_HINT_COUNT
      unsuccessful_level_source.save!
    end
  end
end
