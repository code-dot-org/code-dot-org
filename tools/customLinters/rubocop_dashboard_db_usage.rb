module CustomCops
  # Custom cop that checks for use of DASHBOARD_DB outside of dashboard/ directory
  class DashboardDbUsage < RuboCop::Cop::Base
    MSG = 'Do not use DASHBOARD_DB outside of dashboard/ directory.'

    def_node_matcher :dashboard_db_usage?, <<-PATTERN
      (const nil? :DASHBOARD_DB)
    PATTERN

    def on_const(node)
      if dashboard_db_usage?(node)
        file_path = processed_source.buffer.name
        unless file_path.include?('/dashboard/') || file_path.include?('/bin/')
          add_offense(node, message: MSG)
        end
      end
    end
  end
end
