#!/usr/bin/env ruby

require_relative '../../dashboard/config/environment'

# This sets 44 emails to resend.  They had failed to send between 01 Oct 2018 and
# 21 June 2019.  We determined this list mostly from direct enumeration by regional
# managers, while two of them came from deeper investigation in the
# unsent_pl_emails_enumerate.rb script.

poste_ids_to_resend = %w(
  36075759
  35972819
  36144472
  36144501
  36132929
  36154842
  36144509
  36144510
  36146951
  36144500
  36144524
  36101970
  36101971
  36091682
  36104485
  36104490
  36104748
  36146739
  36148838
  36148839
  36148843
  36148844
  36148845
  36148847
  36148852
  36121519
  36144564
  36136925
  36104532
  36114532
  36114533
  36114541
  36142715
  36132928
  36027982
  36016466
  35938205
  36071087
  35940278
  36154841
  35905521
  36066805
  36146749
  36121521
)

ActiveRecord::Base.transaction do
  POSTE_DB[:poste_deliveries].where({id: poste_ids_to_resend, sent_at: 0}).update_all(sent_at: nil)

  # This script is a dry-run unless we comment out this last line
  raise ActiveRecord::Rollback.new, "Intentional rollback"
end
