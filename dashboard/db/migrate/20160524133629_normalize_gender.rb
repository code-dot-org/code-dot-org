# This script normalizes values in the `gender` column of the `users` table to
# be one of NULL (unspecified), "-" (decline to answer), "f" (female), or "m"
# (male). Any existing value that is not one of these four is set to NULL.
#
# As of 2016-05-23, there were approximately 727886 such users in production.
# As of submission of this PR, there are 0 such users in production.
#
# These were normalized via the script at bin/oneoff/normalize_gender so as to
# be able to control the timing of its execution in production, followed by this
# migration so as to assure good data in all envinronments.

class NormalizeGender < ActiveRecord::Migration
  def up
    User.with_deleted.
      where('gender IS NOT NULL').
      where('gender != "-" AND gender != "f" AND gender != "m"').
      update_all(gender: nil) 
  end
end
