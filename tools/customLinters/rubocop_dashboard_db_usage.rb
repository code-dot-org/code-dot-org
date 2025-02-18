module CustomCops
  # Custom cop that checks for use of dashboard DB outside of dashboard/ directory
  class DashboardDbUsage < RuboCop::Cop::Base
    MSG = 'Do not access dashboard DB from outside of top-level dashboard/ directory. For details, see: https://github.com/code-dot-org/code-dot-org/pull/55417'

    # Match DASHBOARD_DB or Dashboard::User
    def_node_matcher :dashboard_db_const?, <<-PATTERN
      {
        (const nil? :DASHBOARD_DB)
        (const (const nil? :Dashboard) :User)
      }
    PATTERN

    def on_const(node)
      if dashboard_db_const?(node)
        file_path = processed_source.buffer.name
        unless file_path.include?('/dashboard/') || file_path.include?('/bin/')
          add_offense(node, message: MSG)
        end
      end
    end

    # Match dashboard_user_helper, dashboard_user, current_user, or Dashboard.db
    def_node_matcher :dashboard_db_method?, <<-PATTERN
      {
        (send nil? {:dashboard_user_helper :dashboard_user :current_user})
        (send (const nil? :Dashboard) :db)
      }
    PATTERN

    def on_send(node)
      if dashboard_db_method?(node)
        file_path = processed_source.buffer.name
        unless file_path.include?('/dashboard/') || file_path.include?('/bin/')
          add_offense(node, message: MSG)
        end
      end
    end
  end
end
