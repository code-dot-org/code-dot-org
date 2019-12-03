#!/usr/bin/env ruby

# Remove passwords for code studio admins

batch_number = 0
User.where(admin: true).where.not(encrypted_password: nil).each do |admin|
  puts "PROCESSING: #{batch_number}..."
  ActiveRecord::Base.transaction do
    admin.update!(encrypted_password: nil)
  end
  puts "PROCESSED: #{batch_number}..."
  batch_number += 1
end
