require 'cdo/activity_constants'

FactoryBot.define do
  factory :user do
    birthday {Time.zone.today - 21.years}
    email {("#{user_type}_#{SecureRandom.uuid}@code.org")}
    password {"00secret"}
    locale {'en-US'}
    sequence(:name) {|n| "User#{n} Codeberg"}
    user_type {User::TYPE_STUDENT}

    # Used to test specific interactions for older (unmigrated) users. This
    # trait and associated tests can be removed when the work to migrate all
    # users has been completed.
    # TODO elijah
    trait :demigrated do
      after(:create, &:demigrate_from_multi_auth)
    end

    factory :teacher do
      user_type {User::TYPE_TEACHER}
      birthday {Date.new(1980, 3, 14)}
      factory :admin do
        google_sso_provider
        password {nil}
        after(:create) {|user| user.update(admin: true)}
      end
      trait :with_school_info do
        school_info
      end
      trait :with_terms_of_service do
        terms_of_service_version {1}
      end
      trait :not_first_sign_in do
        sign_in_count {2}
      end
      factory :terms_of_service_teacher do
        with_terms_of_service
      end
      factory :levelbuilder do
        after(:create) do |levelbuilder|
          levelbuilder.permission = UserPermission::LEVELBUILDER
          levelbuilder.save
        end
      end
      factory :project_validator do
        after(:create) do |project_validator|
          project_validator.permission = UserPermission::PROJECT_VALIDATOR
          project_validator.save
        end
      end
      factory :authorized_teacher do
        after(:create) do |authorized_teacher|
          authorized_teacher.permission = UserPermission::AUTHORIZED_TEACHER
          authorized_teacher.save
        end
      end
      factory :facilitator do
        transient do
          course {nil}
        end

        sequence(:name) {|n| "Facilitator Person #{n}"}
        email {"Facilitator_#{SecureRandom.uuid}@code.org"}

        after(:create) do |facilitator, evaluator|
          facilitator.permission = UserPermission::FACILITATOR

          if evaluator.course
            create :pd_course_facilitator, facilitator: facilitator, course: evaluator.course
          end
        end
      end
      factory :workshop_admin do
        name {'Workshop Admin'}
        after(:create) do |user|
          user.permission = UserPermission::WORKSHOP_ADMIN
        end
      end
      factory :workshop_organizer do
        sequence(:name) {|n| "Workshop Organizer Person #{n}"}
        email {"WorkshopOrganizer_#{SecureRandom.uuid}@code.org"}
        after(:create) do |workshop_organizer|
          workshop_organizer.permission = UserPermission::WORKSHOP_ORGANIZER
        end

        trait :as_regional_partner_program_manager do
          after(:create) do |workshop_organizer|
            create :regional_partner_program_manager, program_manager: workshop_organizer
          end
        end
      end

      factory :program_manager do
        transient do
          regional_partner {build :regional_partner}
        end
        after(:create) do |user, evaluator|
          create :regional_partner_program_manager, program_manager: user, regional_partner: evaluator.regional_partner
        end
      end

      factory :plc_reviewer do
        sequence(:name) {|n| "Plc Reviewer #{n}"}
        sequence(:email) {|n| "test_plc_reviewer_#{n}@example.com.xx"}
        after(:create) do |plc_reviewer|
          plc_reviewer.permission = UserPermission::PLC_REVIEWER
        end
      end

      factory :universal_instructor do
        sequence(:name) {|n| "Universal Instructor #{n}"}
        sequence(:email) {|n| "test_universal_instructor_#{n}@example.com.xx"}
        after(:create) do |universal_instructor|
          universal_instructor.permission = UserPermission::UNIVERSAL_INSTRUCTOR
        end
      end

      factory :district_contact do
        name {'District Contact Person'}
        ops_first_name {'District'}
        ops_last_name {'Person'}
      end

      transient {pilot_experiment {nil}}
      after(:create) do |teacher, evaluator|
        if evaluator.pilot_experiment
          create :single_user_experiment, min_user_id: teacher.id, name: evaluator.pilot_experiment
        end
      end
      transient {editor_experiment {nil}}
      after(:create) do |teacher, evaluator|
        if evaluator.editor_experiment
          create :single_user_experiment, min_user_id: teacher.id, name: evaluator.editor_experiment
        end
      end
      factory :platformization_partner do
        editor_experiment {'platformization-partners'}
      end

      # We have some teacher records in our system that do not pass validation because they have
      # no email address.  Sometimes we want to test against this case because we still want features
      # to work for these teachers.
      trait :without_email do
        after(:create) do |user|
          user.update_primary_contact_info new_email: '', new_hashed_email: ''
          user.save validate: false
        end
      end

      # We added validation to user accounts and some time which required
      # teacher accounts to have emails. However, there were already existing
      # teacher accounts which didn't have an email. Some of these have not yet
      # been updated, so we need to make sure our system can handle them
      # gracefully.
      # FND-1130: This trait will no longer be required
      trait :before_email_validation do
        after(:create) do |user|
          # Account created one day before the requirements were added.
          user.created_at = User::DATE_TEACHER_EMAIL_REQUIREMENT_ADDED - 1
          user.save validate: false
        end
      end
    end

    factory :student do
      user_type {User::TYPE_STUDENT}
      birthday {Time.zone.today - 17.years}

      factory :young_student do
        birthday {Time.zone.today - 10.years}

        factory :young_student_with_tos_teacher do
          after(:create) do |user|
            section = create(:section, user: create(:terms_of_service_teacher))
            create(:follower, section: section, student_user: user)
          end
        end

        factory :young_student_with_teacher do
          after(:create) do |user|
            section = create(:section, user: create(:teacher))
            create(:follower, section: section, student_user: user)
          end
        end

        factory :parent_managed_student do
          sequence(:parent_email) {|n| "testparent#{n}@example.com.xx"}
          email {nil}
          hashed_email {nil}
          provider {nil}
        end
      end

      factory :manual_username_password_student do
        email {nil}
        hashed_email {nil}
        provider {User::PROVIDER_MANUAL}
      end

      factory :student_in_word_section do
        encrypted_password {nil}
        provider {'sponsored'}

        after(:create) do |user|
          word_section = create(:section, login_type: Section::LOGIN_TYPE_WORD)
          create(:follower, student_user: user, section: word_section)
          user.reload
        end
      end

      factory :student_in_picture_section do
        encrypted_password {nil}
        provider {'sponsored'}
        in_picture_section
      end

      factory :old_student do
        birthday {Time.zone.today - 30.years}
      end

      trait :in_picture_section do
        after(:create) do |user|
          picture_section = create(:section, login_type: Section::LOGIN_TYPE_PICTURE)
          create(:follower, student_user: user, section: picture_section)
          user.reload
        end
      end

      trait :in_email_section do
        after(:create) do |user|
          section = create :section, login_type: Section::LOGIN_TYPE_EMAIL
          create :follower, student_user: user, section: section
          user.reload
        end
      end

      trait :migrated_imported_from_google_classroom do
        google_sso_provider
        without_email
        after(:create) do |user|
          section = create :section, login_type: Section::LOGIN_TYPE_GOOGLE_CLASSROOM
          create :follower, student_user: user, section: section
          user.reload
        end
      end

      trait :migrated_imported_from_clever do
        clever_sso_provider
        without_email
        after(:create) do |user|
          section = create :section, login_type: Section::LOGIN_TYPE_CLEVER
          create :follower, student_user: user, section: section
          user.reload
        end
      end

      trait :without_email do
        email {''}
        hashed_email {nil}
      end
    end

    # We have some tests which want to create student accounts which don't have any authentication setup.
    # Using this will put the user into an invalid state.
    trait :without_encrypted_password do
      after(:create) do |user|
        user.encrypted_password = nil
        user.password = nil
        user.save validate: false
      end
    end

    trait :sso_provider do
      encrypted_password {nil}
      provider {%w(facebook windowslive clever).sample}
      sequence(:uid) {|n| n}
    end

    trait :sso_provider_with_token do
      sso_provider
      oauth_token {'fake-oauth-token'}
      oauth_token_expiration {'fake-oauth-token-expiration'}
    end

    trait :untrusted_email_sso_provider do
      sso_provider_with_token
      after(:create) do |user|
        if user.student?
          user.hashed_email = nil
          user.save!
        end
      end
    end

    trait :clever_sso_provider do
      untrusted_email_sso_provider
      provider {'clever'}
    end

    trait :facebook_sso_provider do
      sso_provider_with_token
      provider {'facebook'}
    end

    trait :google_sso_provider do
      sso_provider_with_token
      provider {'google_oauth2'}
      oauth_refresh_token {'fake-oauth-refresh-token'}
    end

    trait :microsoft_v2_sso_provider do
      sso_provider_with_token
      provider {'microsoft_v2_auth'}
    end

    trait :powerschool_sso_provider do
      untrusted_email_sso_provider
      provider {'powerschool'}
    end

    trait :the_school_project_sso_provider do
      sso_provider
      provider {'the_school_project'}
    end

    trait :twitter_sso_provider do
      sso_provider
      provider {'twitter'}
    end

    trait :qwiklabs_sso_provider do
      sso_provider
      provider {'lti_lti_prod_kids.qwikcamps.com'}
    end

    trait :windowslive_sso_provider do
      sso_provider_with_token
      provider {'windowslive'}
    end

    trait :with_google_authentication_option do
      after(:create) do |user|
        create(:authentication_option,
               user: user,
               email: user.email,
               hashed_email: user.hashed_email,
               credential_type: AuthenticationOption::GOOGLE,
               authentication_id: SecureRandom.uuid,
               data: {
                 oauth_token: 'some-google-token',
                 oauth_refresh_token: 'some-google-refresh-token',
                 oauth_token_expiration: '999999'
               }.to_json
        )
      end
    end

    trait :with_clever_authentication_option do
      after(:create) do |user|
        create(:authentication_option,
               user: user,
               email: user.email,
               hashed_email: user.hashed_email,
               credential_type: AuthenticationOption::CLEVER,
               authentication_id: SecureRandom.uuid,
               data: {
                 oauth_token: 'some-clever-token'
               }.to_json
        )
      end
    end

    trait :with_puzzles do
      transient do
        num_puzzles {1}
        puzzle_result {ActivityConstants::MINIMUM_PASS_RESULT}
      end
      after(:create) do |user, evaluator|
        evaluator.num_puzzles.times do
          create :user_level, user: user, best_result: evaluator.puzzle_result
        end
      end
    end

    trait :deleted do
      after(:create) do |user|
        user.destroy!
        user.reload
      end
    end

    trait :within_united_states do
      after(:create) do |user|
        create :user_geo, :seattle, user: user
      end
    end

    trait :outside_united_states do
      after(:create) do |user|
        create :user_geo, :sydney, user: user
      end
    end
  end
end
