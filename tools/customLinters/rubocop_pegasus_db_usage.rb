module CustomCops
  # Custom cop that checks for use of PEGASUS_DB outside of pegasus/ directory
  class PegasusDbUsage < RuboCop::Cop::Base
    MSG = 'Do not use PEGASUS_DB outside of pegasus/ directory.'

    def_node_matcher :pegasus_db_usage?, <<-PATTERN
      (const nil? :PEGASUS_DB)
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
