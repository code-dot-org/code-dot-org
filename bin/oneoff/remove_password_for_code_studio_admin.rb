#!/usr/bin/env ruby

# Remove passwords for code studio admins

DRY_RUN = true

User.where(admin: true).where.not(encrypted_password: nil).each do |admin|
  ActiveRecord::Base.transaction do
    admin.update!(encrypted_password: nil)

    raise ActiveRecord::Rollback.new, "Intentional rollback" if DRY_RUN
    puts "Admin password updated - #{admin}"
  end
rescue StandardError => error
  puts "Error deleting admin's password - #{admin} / #{error.message}"
end
