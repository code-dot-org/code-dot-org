#!/usr/bin/env ruby

# Remove passwords for code studio admins

User.where(admin: true).where.not(encrypted_password: nil).each do |admin|
  puts "PROCESSING: #{batch_number}..."
  ActiveRecord::Base.transaction do
    admin.update!(encrypted_password: nil)
  end
  puts "PROCESSED: #{batch_number}..."
end
