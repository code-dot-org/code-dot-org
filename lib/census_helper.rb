def current_census_year
  today = Date.today
  month = today.month
  year = today.year
  (month > 6) ? year : (year - 1)
end
