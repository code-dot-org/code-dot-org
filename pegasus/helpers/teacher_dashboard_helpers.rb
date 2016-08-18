# When adding a new version, append to the end of the array
# using the next increasing natural number.
# Also update in dashboard/app/models/user.rb.
TERMS_OF_SERVICE_VERSIONS = [
  1  # (July 2016) Teachers can grant access to labs for U13 students.
]

def dashboard_admin?
  dashboard_user.try{|u| u[:admin]}
end

def can_see_pd_workshop_dashboard?
  return false unless dashboard_user

  dashboard_admin? ||
    have_permission?('workshop_organizer') ||
    have_permission?('facilitator') ||
    have_permission?('district_contact')
end

# Returns whether the user has accepted the latest major version of the Terms of Service
def accepted_latest_terms?
  dashboard_user[:terms_of_service_version] == TERMS_OF_SERVICE_VERSIONS.last
end
