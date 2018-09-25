# == Schema Information
#
# Table name: pd_application_emails
#
#  id                 :integer          not null, primary key
#  pd_application_id  :integer          not null
#  application_status :string(255)      not null
#  email_type         :string(255)      not null
#  to                 :string(255)      not null
#  created_at         :datetime         not null
#  sent_at            :datetime
#
# Indexes
#
#  index_pd_application_emails_on_pd_application_id  (pd_application_id)
#

module Pd::Application
  class Email < ActiveRecord::Base
    self.table_name = 'pd_application_emails'
  end
end
