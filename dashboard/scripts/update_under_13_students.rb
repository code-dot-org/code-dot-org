#!/usr/bin/env ruby
# Update all students under age 13, or with age not set, to have sharing_disabled = true.
# sharing_disabled is contained in properties of the User model
require_relative('../config/environment')

CDO.log.info "Starting to batch update all students under 13"
number_under_13 = 0

User.find_in_batches do |users_batch|
  ActiveRecord::Base.transaction do
    users_batch.each do |user|
      next unless user.under_13?
      user.sharing_disabled = true
      save_result = user.save
      number_under_13 += 1
      raise "ERROR: ID #{user.id}." unless save_result
    end
  end
end

# How many total students were updated.
CDO.log.info "Finished updating #{number_under_13} students."
