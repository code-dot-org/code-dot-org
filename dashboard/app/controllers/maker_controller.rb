class MakerController < ApplicationController
  before_action :authenticate_user!, only: :discountcode

  def setup
  end

  def discountcode
  end
end
