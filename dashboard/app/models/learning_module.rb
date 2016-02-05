require 'securerandom'
# == Schema Information
#
# Table name: learning_modules
#
#  id                   :integer          not null, primary key
#  name                 :string(255)
#  learning_module_type :string(255)
#  created_at           :datetime         not null
#  updated_at           :datetime         not null
#
# This class represents a learning module that has one or more associated required artifacts, and many be associated
# with one or more modules. For more details about PLC class structure, visit
# http://wiki.code.org/display/Operations/Explanation+of+PLC+Model

class LearningModule < ActiveRecord::Base
  has_many :artifacts, class_name: 'Artifact', dependent: :destroy
  belongs_to :professional_learning_course
end
