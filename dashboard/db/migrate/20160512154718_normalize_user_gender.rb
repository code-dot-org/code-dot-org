# Normalize all genders in the users table to be null, 'f', or 'm', in
# preparation for allowing additional (meaningful) responses.

class NormalizeUserGender < ActiveRecord::Migration
  def change
    reversible do |direction|
      direction.up do
        User.with_deleted.
            where('gender IS NOT NULL').
            where('gender <> "f" AND gender <> "m"').
            find_each do |user|
          user.update!(gender: nil)
        end
      end
    end
  end
end
