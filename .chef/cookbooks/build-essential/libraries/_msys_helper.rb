module BuildEssential
  module MsysHelper
    #
    # This function returns a struct representing an
    # msys package. It has two fields: url and checksum
    #
    # @return [OpenStruct]
    #
    def msys_p(url, checksum)
      OpenStruct.new(url: url, checksum: checksum)
    end
  end
end

Chef::Recipe.send(:include, BuildEssential::MsysHelper)
