#!/usr/bin/env ruby

# Remove passwords for code studio admins

batch_number = 0
User.where(admin: true).where.not(encrypted_password: nil).find_in_batches(batch_size: 10) do |batch|
  puts "PROCESSING: #{batch_number}..."
  ActiveRecord::Base.transaction do
    batch.each do |user|
      user.update(encrypted_password: nil)
    end
  end
  puts "PROCESSED: #{batch_number}..."
  batch_number += 1
end
