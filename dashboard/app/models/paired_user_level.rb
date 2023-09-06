# == Schema Information
#
# Table name: paired_user_levels
#
#  id                      :integer          not null, primary key
#  driver_user_level_id    :bigint           unsigned
#  navigator_user_level_id :bigint           unsigned
#  created_at              :datetime         not null
#  updated_at              :datetime         not null
#
# Indexes
#
#  index_paired_user_levels_on_driver_user_level_id     (driver_user_level_id)
#  index_paired_user_levels_on_navigator_user_level_id  (navigator_user_level_id)
#

class PairedUserLevel < ApplicationRecord
  belongs_to :navigator_user_level, class_name: 'UserLevel', optional: true
  belongs_to :driver_user_level, class_name: 'UserLevel', optional: true

  # These associations return the User object representing the driver and
  # navigator. Note that these associations join across the user_levels and
  # users tables and will return nil if the associated user_level or user
  # row was deleted.
  has_one :driver, through: :driver_user_level, source: :user
  has_one :navigator, through: :navigator_user_level, source: :user

  # @param user_level_ids (Array) an array of user_level_ids.
  # @return (Array) a subarray of user_level_ids containing those IDs associated
  #   with pair programming (as driver or navigator)
  def self.pairs(user_level_ids)
    drivers = PairedUserLevel.
              where(driver_user_level_id: user_level_ids).
              pluck(:driver_user_level_id)
    navigators = PairedUserLevel.
                 where(navigator_user_level_id: user_level_ids).
                 pluck(:navigator_user_level_id)
    return drivers | navigators
  end

  # With just a pair (ha!) of queries, retrieve the set of paired UserLevel ids
  # for a group of users of arbitrary size.
  # @param [Enumerable<User>] users
  # @return [Hash<Integer, Set<Integer>>] Map of User ids to sets of UserLevel ids
  # Example response, given 1, 2, 3 are user ids and 101, 102, 103 are userlevel ids:
  # {
  #   1 => Set[101, 102],
  #   2 => Set[102],
  #   3 => Set[]
  # }
  def self.pairs_by_user(users)
    initial_hash = Hash[users.map {|user| [user.id, Set.new]}]
    user_ids = users.map(&:id)
    drivers = PairedUserLevel.
              joins(:driver_user_level).
              where(user_levels: {user_id: user_ids}).
              pluck('user_levels.user_id', 'user_levels.id')
    navigators = PairedUserLevel.
                 joins(:navigator_user_level).
                 where(user_levels: {user_id: user_ids}).
                 pluck('user_levels.user_id', 'user_levels.id')
    drivers.
      concat(navigators).
      inject(initial_hash) do |memo, (user_id, user_level_id)|
        memo[user_id] ||= Set.new
        memo[user_id].add user_level_id
        memo
      end
  end

  # Returns the level_source_id from the driver's user_level. Note that this
  # returns nil if the driver's progress was deleted.
  def driver_level_source_id
    driver_user_level&.level_source_id
  end

  # Returns the display names of the navigators in the pairing group that
  # includes this pairing record. Note that the number of names returned may
  # be less than the value returned by navigator_count if some navigator user
  # accounts or progress was deleted.
  def navigators_names(exclude_self: false)
    excluded_navigator_user_level_ids =
      exclude_self ? [navigator_user_level_id] : []

    PairedUserLevel.
      joins(:navigator).
      where(driver_user_level_id: driver_user_level_id).
      where.not(navigator_user_level_id: excluded_navigator_user_level_ids).
      order('paired_user_levels.id DESC').
      pluck('users.name')
  end

  # Returns the number of navigators in the pairing group that includes this
  # pairing record.
  def navigator_count
    PairedUserLevel.
      where(driver_user_level_id: driver_user_level_id).
      count
  end
end
