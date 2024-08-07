require 'test_helper'

module CAP
  module Cpa
    class LockoutTest < ActionDispatch::IntegrationTest
      include Minitest::RSpecMocks

      describe 'locking out' do
        let(:student) {create(:cpa_non_compliant_student)}

        let(:current_date) {DateTime.now}
        let(:new_user_lockout_date) {DateTime.parse('2023-07-01T00:00:00MDT')}
        let(:all_user_lockout_date) {DateTime.parse('2024-07-01T00:00:00MDT')}
        let(:grace_period_duration) {14.days}

        around do |test|
          Timecop.freeze(current_date) {test.call}
        end

        before do
          allow(DCDO).to receive(:get).and_call_original

          allow(DCDO).to receive(:get).with('cpa_schedule', anything).and_return(
            'cpa_new_user_lockout' => new_user_lockout_date.iso8601,
            'cpa_all_user_lockout' => all_user_lockout_date.iso8601,
          )

          sign_in student
        end

        describe 'policy is not yet in effect' do
          let(:current_date) {new_user_lockout_date.ago(1.second)}

          it 'student should not be locked out' do
            assert_student_is_not_locked_out
          end

          it 'student should be redirected away from the lockout page' do
            assert_student_is_redirected_away_from_lockout
          end
        end

        describe 'new user lockout phase' do
          let(:current_date) {new_user_lockout_date.since(1.day)}

          it 'student should be locked out immediately until permission is granted' do
            assert_student_is_locked_out_until_permission_granted
          end

          context 'when student was create before policy took effect' do
            let(:student) {create(:cpa_non_compliant_student, :predates_policy)}

            it 'student should not be locked out yet' do
              assert_student_is_not_locked_out
            end

            it 'student should be redirected away from the lockout page' do
              assert_student_is_redirected_away_from_lockout
            end
          end

          context 'when student provider is Google' do
            before do
              create(:google_authentication_option, user: student)
            end

            it 'student should not be locked out yet' do
              assert_student_is_not_locked_out
            end

            it 'student should be redirected away from the lockout page' do
              assert_student_is_redirected_away_from_lockout
            end
          end

          context 'when student is CAP compliant' do
            let(:student) {create(:student, :not_U13)}

            it 'student should not be locked out' do
              assert_student_is_not_locked_out
            end

            it 'student should be redirected away from the lockout page' do
              assert_student_is_redirected_away_from_lockout
            end
          end
        end

        describe 'all user lockout phase' do
          let(:current_date) {all_user_lockout_date}

          it 'student should be locked out immediately until permission is granted' do
            assert_student_is_locked_out_until_permission_granted
          end

          context 'when student was created before policy took effect' do
            let(:student) {create(:cpa_non_compliant_student, :predates_policy)}

            it 'student should be locked out after their grace period has ended' do
              assert_enqueued_with job: CAP::LockoutJob, args: [user_id: student.id, reschedules: 1], at: grace_period_duration.from_now.since(1.minute) do
                assert_student_in_grace_period
              end

              assert_latest_student_cap_event(
                CAP::UserEvent::GRACE_PERIOD_START,
                nil,
                Policies::ChildAccount::ComplianceState::GRACE_PERIOD
              )

              # A new lockout job is not scheduled during the grace period.
              assert_no_enqueued_jobs only: CAP::LockoutJob do
                assert_student_in_grace_period
              end

              # No new CAP user events have been logged
              assert_no_difference -> {CAP::UserEvent.where(user: student).count} do
                assert_student_in_grace_period
              end

              # Lock out students after the 14-day grace period
              Timecop.freeze(grace_period_duration.from_now) do
                assert_student_is_locked_out_until_permission_granted
              end
            end

            it 'student should be redirected away from the lockout page' do
              assert_student_is_redirected_away_from_lockout
            end

            context 'when student provider is Clever' do
              let(:student) {create(:cpa_non_compliant_student, :predates_policy, :clever_sso_provider, :migrated_imported_from_clever)}

              it 'student should be neither transitioned to grace period state nor locked out' do
                assert_student_is_not_locked_out
                refute Policies::ChildAccount::ComplianceState.grace_period?(student.reload)
              end

              it 'student should be redirected away from the lockout page' do
                assert_student_is_redirected_away_from_lockout
              end
            end

            context 'when student provider is LTI' do
              let(:student) {create(:cpa_non_compliant_student, :predates_policy, :qwiklabs_sso_provider, :with_lti_auth)}

              it 'student should be neither transitioned to grace period state nor locked out' do
                assert_student_is_not_locked_out
                refute Policies::ChildAccount::ComplianceState.grace_period?(student.reload)
              end

              it 'student should be redirected away from the lockout page' do
                assert_student_is_redirected_away_from_lockout
              end
            end
          end

          context 'when student became compliant during their grace period' do
            let(:student) {create(:cpa_non_compliant_student, :predates_policy, :in_grace_period)}

            before do
              Timecop.travel(grace_period_duration.from_now)
              student.update_attribute(:age, 13) # bypass validation
            end

            it 'student should not be locked out' do
              assert_changes -> {Policies::ChildAccount::ComplianceState.grace_period?(student.reload)}, from: true, to: false do
                assert_student_is_not_locked_out

                assert_latest_student_cap_event(
                  CAP::UserEvent::COMPLIANCE_REMOVING,
                  Policies::ChildAccount::ComplianceState::GRACE_PERIOD,
                  nil,
                )
              end
            end

            it 'student should be redirected away from the lockout page' do
              assert_student_is_redirected_away_from_lockout
            end
          end

          context 'when student provider is Google' do
            before do
              create(:google_authentication_option, user: student)
            end

            context 'if account is created right before the phase has started' do
              let(:student) {create(:cpa_non_compliant_student, created_at: all_user_lockout_date.ago(1.second))}

              it 'student should be transited to grace period state' do
                assert_student_in_grace_period
              end

              it 'student should be redirected away from the lockout page' do
                assert_student_is_redirected_away_from_lockout
              end
            end

            context 'if account is created right after the phase has started' do
              let(:student) {create(:cpa_non_compliant_student, created_at: all_user_lockout_date)}

              it 'student should be locked out immediately until permission is granted' do
                assert_student_is_locked_out_until_permission_granted
              end
            end
          end
        end

        private def assert_student_is_not_locked_out
          get home_path

          assert_equal 200, status
          assert_equal home_path, path

          refute Policies::ChildAccount::ComplianceState.locked_out?(student.reload)
        end

        private def assert_latest_student_cap_event(event_name, state_before, state_after)
          latest_cap_user_event = CAP::UserEvent.where(user: student).last

          refute_nil latest_cap_user_event

          assert_attributes latest_cap_user_event, {
            policy: CAP::UserEvent.policies.key('CPA'),
            name: event_name,
            state_before: state_before,
            state_after: state_after,
          }
        end

        private def assert_student_in_grace_period
          get home_path

          assert_equal 200, status
          assert_equal home_path, path

          assert_attributes student.reload, {
            cap_state: Policies::ChildAccount::ComplianceState::GRACE_PERIOD,
            cap_state_date: DateTime.now,
          }
        end

        private def assert_student_is_redirected_away_from_lockout
          get lockout_path
          follow_redirect!

          assert_equal 200, status
          assert_equal home_path, path
        end

        private def assert_student_is_locked_out_until_permission_granted
          initial_cap_compliance_state = student.cap_state

          get home_path

          follow_redirect!
          assert_equal 200, status
          assert_equal lockout_path, path

          assert_attributes student.reload, {
            cap_state: Policies::ChildAccount::ComplianceState::LOCKED_OUT,
            cap_state_date: DateTime.now,
          }

          assert_latest_student_cap_event(
            CAP::UserEvent::ACCOUNT_LOCKING,
            initial_cap_compliance_state,
            Policies::ChildAccount::ComplianceState::LOCKED_OUT,
          )

          student_parental_permission_request = create(:parental_permission_request, user: student)
          Services::ChildAccount.grant_permission_request!(student_parental_permission_request)

          get home_path

          assert_equal 200, status
          assert_equal home_path, path

          assert_attributes student.reload, {
            cap_state: Policies::ChildAccount::ComplianceState::PERMISSION_GRANTED,
            cap_state_date: DateTime.now,
          }

          assert_latest_student_cap_event(
            CAP::UserEvent::PERMISSION_GRANTING,
            Policies::ChildAccount::ComplianceState::LOCKED_OUT,
            Policies::ChildAccount::ComplianceState::PERMISSION_GRANTED,
          )
        end
      end
    end
  end
end
