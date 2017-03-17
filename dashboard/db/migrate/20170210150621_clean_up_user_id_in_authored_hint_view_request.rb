class CleanUpUserIdInAuthoredHintViewRequest < ActiveRecord::Migration[5.0]
  def change
    # As this instantiates every such AuthoredHintViewRequest, this should only
    # be run if there are relatively few of them. In particular, before running
    # this in production, the plan is to run
    #   AuthoredHintViewRequest.where(user_id: nil).delete_all
    # from dashboard-console.
    AuthoredHintViewRequest.where(user_id: nil).destroy_all

    change_column_null :authored_hint_view_requests, :user_id, false
  end
end
