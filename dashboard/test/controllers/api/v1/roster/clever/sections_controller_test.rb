require 'test_helper'

class Api::V1::Roster::Clever::SectionsControllerTest < ActionDispatch::IntegrationTest
  shared_examples_for 'user authentication' do
    context 'when no user signed in' do
      before do
        sign_out :user
      end

      it 'unauthorizes request' do
        subject
        must_respond_with :unauthorized
      end
    end
  end

  shared_examples_for 'teacher authorization' do
    context 'when current user is not teacher' do
      let(:user) {create(:student)}

      before do
        sign_in user
      end

      it 'forbids request' do
        subject
        must_respond_with :forbidden
      end
    end
  end

  describe 'POST /api/v1/roster/clever/sections/sync' do
    subject(:post_clever_roster_sections_sync) {post '/api/v1/roster/clever/sections/sync'}

    let(:user) {create(:teacher)}

    before do
      sign_in user
    end

    it_behaves_like 'user authentication'
    it_behaves_like 'teacher authorization'

    it 'enqueues sync job' do
      assert_enqueued_with job: Roster::Clever::SyncSectionsJob, args: [teacher_id: user.id] do
        post_clever_roster_sections_sync
      end
    end

    it 'renders acknowledgement message' do
      post_clever_roster_sections_sync
      must_respond_with :ok
      _(response.body).must_equal '{"message":"Sync started. It will complete in a few minutes"}'
    end

    context 'when teacher has already enqueued Roster::Clever::SyncSectionsJob' do
      before do
        ActiveJob::QueueAdapters::DelayedJobAdapter.new.enqueue(
          Roster::Clever::SyncSectionsJob.new(teacher_id: user.id)
        )
      end

      it 'does not enqueue another sync job' do
        assert_no_enqueued_jobs only: Roster::Clever::SyncSectionsJob do
          post_clever_roster_sections_sync
        end
      end

      it 'renders acknowledgement message' do
        post_clever_roster_sections_sync
        must_respond_with :ok
        _(response.body).must_equal '{"message":"Sync in progress. Please wait a few minutes"}'
      end
    end
  end
end
