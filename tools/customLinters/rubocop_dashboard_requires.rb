module CustomCops
  # Custom cop that checks for require_relative references into the dashboard/ directory
  # from outside of dashboard/ directory
  class DashboardRequires < RuboCop::Cop::Base
    MSG = 'Do not require dashboard code from outside of dashboard/ directory.'

    def_node_matcher :require_relative_with_string?, <<-PATTERN
      (send nil? :require_relative (str $_))
    PATTERN

    def on_send(node)
      return unless require_relative_with_string?(node) do |path|
        violation?(path, node)
      end
    end

    private

    def violation?(path, node)
      # Check if the path points to something inside 'dashboard/'
      if path.include?('../dashboard/')
        file_path = processed_source.buffer.name

        # Add an offense if the file itself is not in 'dashboard/' or 'bin/'
        unless file_path.include?('/dashboard/') || file_path.include?('/bin/')
          add_offense(node, message: MSG)
        end
      end
    end
  end
end
