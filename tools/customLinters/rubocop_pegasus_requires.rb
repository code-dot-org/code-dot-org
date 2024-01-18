module CustomCops
  # Custom cop that checks for require_relative references into the pegasus/ directory
  # from outside of pegasus/ directory
  class PegasusRequires < RuboCop::Cop::Base
    MSG = 'Do not require pegasus code from outside of pegasus/ directory.'

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
      # Check if the path points to something inside 'pegasus/'
      if path.include?('../pegasus/')
        file_path = processed_source.buffer.name

        # Add an offense if the file itself is not in 'pegasus/' or 'bin/'
        unless file_path.include?('/pegasus/') || file_path.include?('/bin/')
          add_offense(node, message: MSG)
        end
      end
    end
  end
end
