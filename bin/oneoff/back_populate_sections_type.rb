#!/usr/bin/env ruby

# This script partially populates the type column of the dashboard sections
# table.

require File.expand_path('../../../pegasus/src/env', __FILE__)
require src_dir 'database'

# As of July 2016, there are approximately 2.4K ProfessionalDevelopmentWorkshop
# forms. Thus, we don't worry about pagination, transactions, or DB load.
DB[:forms].where(kind: 'ProfessionalDevelopmentWorkshop').each do |pd_form|
  data = JSON.parse(pd_form[:data]) rescue {}
  section_id = data['section_id_s']
  next if section_id.nil?

  DASHBOARD_DB[:sections].where(id: section_id).update_all(kind: Section::SECTION_TYPES[:k5_affiliate])
end
