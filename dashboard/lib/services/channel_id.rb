module Services
  class ChannelId
    UUID_REGEX = /\A[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\z/i

    class NotFoundError < StandardError; end

    class << self
      def storage_and_project_id_from_token(channel_id)
        if uuid?(channel_id)
          project = Projects.table.where(uuid: channel_id).first || Project.find_by(uuid: channel_id)
          raise NotFoundError, "No project found with uuid #{channel_id}" unless project

          [project[:storage_id] || project.storage_id, project[:id] || project.id]
        else
          storage_decrypt_channel_id(channel_id)
        end
      end

      def channel_id_for(storage_id:, project_id:)
        project = Projects.table.where(id: project_id).first || Project.find_by(id: project_id)
        uuid = project&.[](:uuid) || project&.uuid
        return uuid if uuid

        storage_encrypt_channel_id(storage_id, project_id)
      end

      def project_from_channel_id!(channel_id)
        _, project_id = storage_and_project_id_from_token(channel_id)
        Project.find(project_id)
      rescue ArgumentError, OpenSSL::Cipher::CipherError, ActiveRecord::RecordNotFound, NotFoundError
        raise ActiveRecord::RecordNotFound.new("Invalid channel_id: #{channel_id}")
      end

      def uuid?(channel_id)
        UUID_REGEX.match?(channel_id.to_s)
      end
    end
  end
end
