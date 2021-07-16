module Models
  class UserProgress
    include UsersHelper

    def initialize(user)
      @user = user
    end

    def total_lines_of_code
      @user.total_lines
    end

    def levels_passed
      UserLevel.where(user_id: @user.id).passing.count
    end

    def level_progress(script_id:, level_id: nil)
      script = Script.get_from_cache(script_id)

      # TODO: Rewrite progress calculation functions instead of
      # calling "legacy" methods and converting the returned data.
      # Also, filtering on level_id is very wasteful.
      progress = script_progress_for_users([@user], script)[0][@user.id]
      progress = progress.select {|key| key == level_id.to_i} unless level_id.nil?
      progress.map do |level_id, level_progress|
        {
          level_id: level_id,
          status: level_progress[:status] || LEVEL_STATUS.not_tried,
          is_locked: !!level_progress[:locked],
          is_paired: !!level_progress[:paired]
        }
      end
    end
  end
end
