def dashboard_admin?
  return false unless dashboard_user
  dashboard_user[:admin]
end

def can_see_pd_workshop_dashboard?
  return false unless dashboard_user

  dashboard_admin? ||
    have_permission?('workshop_organizer') ||
    have_permission?('facilitator') ||
    have_permission?('district_contact')
end
