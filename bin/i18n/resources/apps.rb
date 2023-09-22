Dir[File.expand_path('../apps/**/*.rb', __FILE__)].sort.each {|file| require file}

module I18n
  module Resources
    module Apps
      def self.sync_in
        Animations.sync_in
        ExternalSources.sync_in
        Labs.sync_in
      end

      def self.sync_out
        Animations.sync_out
        ExternalSources.sync_out
        Labs.sync_out
      end
    end
  end
end
