module DataRetention
  class Status < ApplicationRecord
    belongs_to :user
  end
end
