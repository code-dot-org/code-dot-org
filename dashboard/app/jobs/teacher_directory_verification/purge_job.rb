module TeacherDirectoryVerification
  class PurgeJob < ApplicationJob
    queue_as :low

    def perform(request_id)
      TeacherDirectoryVerificationRequest.where(id: request_id).where('purge_after <= ?', Time.current).delete_all
    end
  end
end
