# == Schema Information
#
# Table name: lti_deployments
#
#  id                 :bigint           not null, primary key
#  deployment_id      :string(255)
#  lti_integration_id :bigint           not null
#  created_at         :datetime         not null
#  updated_at         :datetime         not null
#
# Indexes
#
#  index_lti_deployments_on_deployment_id       (deployment_id)
#  index_lti_deployments_on_lti_integration_id  (lti_integration_id)
#
class LtiDeployment < ApplicationRecord
  belongs_to :lti_integration
end
