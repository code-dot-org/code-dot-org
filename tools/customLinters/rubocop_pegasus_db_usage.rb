module CustomCops
  # Custom cop that checks for use of pegasus DB outside of pegasus/ directory
  class PegasusDbUsage < RuboCop::Cop::Base
    MSG = 'Do not access pegasus DB from outside of the top-level pegasus/ directory. For details, see: https://github.com/code-dot-org/code-dot-org/pull/55417'

    def_node_matcher :pegasus_db_usage?, <<-PATTERN
      (const nil? {:PEGASUS_DB :POSTE_DB})
    PATTERN

    def on_const(node)
      if pegasus_db_usage?(node)
        file_path = processed_source.buffer.name
        unless file_path.include?('/pegasus/') || file_path.include?('/bin/')
          add_offense(node, message: MSG)
        end
      end
    end
  end
end
