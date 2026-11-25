# Seeds Build Your Own workshops for trying the workshop catalog
# (/professional-learning/workshops) locally. Rerunning replaces the
# workshops from the previous run.
#
#   ZIP=16502 bin/rake seed:sample_workshops
#
# or from dashboard-console:
#
#   require Rails.root.join('lib/devtools/sample_workshops').to_s
#   SampleWorkshops.seed(zip: '16502')
#   SampleWorkshops.clean
class SampleWorkshops
  extend FactoryBot::Syntax::Methods

  DEFAULT_ZIP = '98101'.freeze
  NAME_PREFIX = '[sample]'.freeze
  PARTNER_NAME = 'Sample Regional Partner'.freeze
  PROGRAM_MANAGER_EMAIL = 'sample_workshops_pm@example.com'.freeze
  ORGANIZER_EMAIL = 'sample_workshops_organizer@example.com'.freeze
  COURSE_OFFERING_KEY = 'sample-workshops-offering'.freeze

  def self.environment_check!
    raise "Should not be run outside of adhoc or development" unless [:adhoc, :development].include?(CDO.rack_env)
  end

  def self.seed(zip: DEFAULT_ZIP)
    environment_check!
    zip = zip.to_s.strip
    raise ArgumentError, "Not a 5-digit US ZIP code: #{zip.inspect}" unless /\A\d{5}\z/.match?(zip)

    ActiveRecord::Base.transaction do
      clean
      partner = find_or_create_partner(zip)
      program_manager = User.find_by(email: PROGRAM_MANAGER_EMAIL) ||
        create(:program_manager, regional_partner: partner, email: PROGRAM_MANAGER_EMAIL, name: 'Sample Program Manager')
      organizer = User.find_by(email: ORGANIZER_EMAIL) ||
        create(:workshop_organizer, email: ORGANIZER_EMAIL, name: 'Sample National Organizer')
      offering = CourseOffering.find_or_create_by!(key: COURSE_OFFERING_KEY) do |co|
        co.display_name = 'Sample Workshop Course'
        co.assignable = false
      end

      # Shown only for the seeded ZIP.
      create_workshop(program_manager, offering, 'Regional', 'Intro to AI for Middle School',
        days_from_now: 10, num_sessions: 3, grades: %w(6 7 8), location_name: 'Public Library',
        capacity: 25, enrolled: 5, fee: '$50'
      )
      create_workshop(program_manager, offering, 'Regional', 'Teaching Python (virtual)',
        days_from_now: 20, virtual: true, grades: %w(9 10 11 12), capacity: 30, prereq: 'Complete CSP Unit 1'
      )
      create_workshop(program_manager, offering, 'Regional', 'Full regional workshop',
        days_from_now: 15, grades: %w(3 4 5), location_name: 'High School', capacity: 2, enrolled: 2
      )

      # Shown for every ZIP, and with none.
      create_workshop(organizer, offering, 'National', 'National: AI Foundations (virtual)',
        days_from_now: 5, virtual: true, grades: %w(K 1 2 3 4 5), capacity: 100, enrolled: 12
      )
      create_workshop(organizer, offering, 'National', 'National: CS Principles Kickoff (virtual)',
        days_from_now: 30, num_sessions: 2, virtual: true, grades: %w(9 10 11 12), capacity: 60
      )

      # Matches both the regional and the national query; must be listed once.
      create_workshop(program_manager, offering, 'National', 'National run by the local partner (virtual)',
        days_from_now: 12, virtual: true, grades: %w(6 7 8), capacity: 40, enrolled: 3
      )

      # Must not be listed.
      create_workshop(organizer, offering, 'National', 'Hidden national (should not appear)',
        days_from_now: 8, virtual: true, hidden: true
      )
      create_workshop(organizer, offering, 'National', 'Past national (should not appear)',
        days_from_now: -3, virtual: true
      )

      puts "#{partner.name} (id #{partner.id}) serves ZIP #{zip}"
      workshops.includes(:sessions).sort_by {|ws| ws.sessions.first.start}.each do |ws|
        puts "  #{ws.id.to_s.ljust(6)} #{ws.participant_group_type.ljust(9)} #{ws.name.ljust(60)} #{ws.sessions.first.start.to_date}"
      end
    end
  end

  # Hard-deletes the sample workshops and their sessions and enrollments. The
  # partner, users and course offering are kept for reuse.
  def self.clean
    environment_check!
    workshops.with_deleted.find_each(&:really_destroy!)
  end

  def self.workshops
    Pd::Workshop.where('name LIKE ?', "#{NAME_PREFIX}%")
  end

  def self.find_or_create_partner(zip)
    partner = RegionalPartner.find_by(name: PARTNER_NAME) ||
      create(:regional_partner, name: PARTNER_NAME, additional_program_information: 'Seeded locally by SampleWorkshops.')
    owner = RegionalPartner.find_by_region(zip, nil)
    if owner && owner != partner
      raise ArgumentError, "ZIP #{zip} already belongs to regional partner #{owner.name.inspect} (id #{owner.id}); choose another ZIP."
    end
    partner.mappings.where.not(zip_code: zip).destroy_all
    partner.mappings.find_or_create_by!(zip_code: zip)
    partner
  end

  def self.create_workshop(organizer, offering, group, name, days_from_now:, enrolled: 0, **attrs)
    workshop = create(:byo_workshop,
      organizer: organizer,
      participant_group_type: group,
      name: "#{NAME_PREFIX} #{name}",
      course_offerings: [offering],
      sessions_from: Time.zone.today + days_from_now.days + 9.hours,
      **attrs
    )
    # The factory's num_enrollments gives each enrollment its own SchoolInfo, which clean would leave behind.
    create_list(:pd_enrollment, enrolled, workshop: workshop, school_info: nil)
    workshop
  end
end
