class Odometer < Widget

  before_validation do
    self.href = 'odometer/odometer.html'
  end
end
