#!/usr/bin/env ruby

require_relative '../../../dashboard/config/environment'

ActiveRecord::Base.transaction do
  total_updated = 0
  errors = []
  puts "Backfilling :pay_fee question changes..."

  Pd::Application::PrincipalApprovalApplication.find_each do |application|
    print '.'
    pay_fee = application.form_data_hash["payFee"]

    if pay_fee == 'Yes, my school or teacher will be able to pay the full program fee.'
      new_pay_fee = 'Yes, my school will be able to pay the full program fee.'
    elsif pay_fee == 'No, my school or teacher will not be able to pay the program fee. We would like to be considered for a scholarship.'
      new_pay_fee = 'No, my school will not be able to pay the program fee. We would like to be considered for a scholarship.'
    else
      next
    end

    application.update_form_data_hash({"payFee": new_pay_fee})
    if application.save
      total_updated += 1
    else
      errors << "\nError: Principal Approval Application #{application.id} with value #{pay_fee.inspect} couldn't be updated"
    end
  end

  errors.each {|e| puts e}

  puts "\nSuccessfully updated pay_fee info for #{total_updated} principal approval applications, with #{errors.count} errors."

  # This script is a dry-run unless we comment out this last line
  raise ActiveRecord::Rollback.new, "Intentional rollback"
end
