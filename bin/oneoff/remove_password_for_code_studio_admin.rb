#!/usr/bin/env ruby

require_relative '../../dashboard/config/environment'

# Remove passwords for code studio admins

DRY_RUN = true

puts "Processing..."

ADMIN_IDS = %w(
  15070302
  15084110
  15348912
  15437387
  15470769
  15554753
  15604082
  15702112
  16532443
  18053401
  23624602
  24432280
  24687228
  25080412
  25310339
  25418463
  27010007
  27121109
  27217051
  28368788
  29732128
  32880983
  36384494
  37473524
  37747709
  38092662
  39189246
  40170179
  41485544
  42398690
  43722276
  43727430
  45912497
  46367906
  47013496
  47020903
  47154935
  47175440
  47179671
  47512616
  48724514
  49828038
  50079182
  51052116
  54352426
  54649591
  56232731
  56493556
).map(&:to_i).freeze

ADMIN_IDS.each do |admin_id|
  ActiveRecord::Base.transaction do
    User.
      find(admin_id).
      tap {|user| raise "User #{user.id} is not an admin" unless user.admin?}.
      update!(encrypted_password: nil)

    raise ActiveRecord::Rollback.new, "Intentional rollback" if DRY_RUN
    puts "Admin password updated - #{admin_id}"
  end
rescue StandardError => error
  puts "Error, admin password is not updated - #{admin_id} / #{error.message}"
end
