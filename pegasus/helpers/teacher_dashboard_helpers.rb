require 'active_support/core_ext/object/try'

def dashboard_admin?
  dashboard_user.try {|u| u[:admin]}
end

def can_see_pd_workshop_dashboard?
  return false unless dashboard_user

  dashboard_admin? ||
    have_permission?('workshop_organizer') ||
    have_permission?('program_manager') ||
    have_permission?('workshop_admin') ||
    have_permission?('facilitator') ||
    have_permission?('district_contact')
end
