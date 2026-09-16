# Phase 2 payload: a real model write through Devise and validations.
# Run via `rails runner`; verify.sh greps the marker for the id.
u = User.create!(
  user_type: 'teacher',
  name: 'Verify Teacher',
  email: 'verify@example.com',
  password: 'Verify-Passw0rd!',
  password_confirmation: 'Verify-Passw0rd!',
  age: '21+',
  terms_of_service_version: 1
)
puts "USER-CREATED id=#{u.id}"
