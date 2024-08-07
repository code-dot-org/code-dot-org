Dir[File.expand_path('../apps/**/*.rb', __FILE__)].sort.each {|file| require file}

module I18n
  module Resources
    module Apps
      def self.sync_in
        Animations.sync_in
        MusiclabLibraries.sync_in
        ExternalSources.sync_in
        Labs.sync_in
      end

      def self.sync_up(**opts)
        Animations.sync_up(**opts)
        MusiclabLibraries.sync_up(**opts)
        ExternalSources.sync_up(**opts)
        Labs.sync_up(**opts)
      end

      def self.sync_down(**opts)
        Animations.sync_down(**opts)
        MusiclabLibraries.sync_down(**opts)
        ExternalSources.sync_down(**opts)
        Labs.sync_down(**opts)
      end

      def self.sync_out(**opts)
        Animations.sync_out(**opts)
        MusiclabLibraries.sync_out(**opts)
        ExternalSources.sync_out
        Labs.sync_out

        # Should be called when Labs have been synced-out
        TextToSpeech.sync_out
      end
    end
  end
end
