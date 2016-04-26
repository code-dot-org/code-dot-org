module Ark
  class WindowsOwner
    def initialize(resource)
      @resource = resource
    end

    attr_reader :resource

    def command
      "icacls \"#{resource.path}\\*\" /setowner \"#{resource.owner}\""
    end
  end
end
