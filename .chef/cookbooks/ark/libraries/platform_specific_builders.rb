module Ark
  module PlatformSpecificBuilders
    def generates_archive_commands_for(_name, options)
      condition = options[:when_the]
      builder = options[:with_klass]
      archive_command_generators.push [condition, builder]
    end

    def archive_command_generators
      @archive_command_generators ||= []
    end

    def generates_owner_commands_for(_name, options)
      condition = options[:when_the]
      builder = options[:with_klass]
      owner_command_generators.push [condition, builder]
    end

    def owner_command_generators
      @owner_command_generators ||= []
    end
  end
end
