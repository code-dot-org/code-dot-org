Before('@as_student') do
  steps 'Given I create a student named "TestStudent"'
end

After('@as_student') do
  steps 'When I sign out'
end

Before('@as_taught_student') do
  steps 'Given I create a teacher-associated student named "TestTaughtStudent"'
end

After('@as_taught_student') do
  steps 'When I sign out'
end

Before('@as_authorized_taught_student') do
  steps 'Given I create an authorized teacher-associated student named "TestTaughtStudent"'
end

After('@as_authorized_taught_student') do
  steps 'When I sign out'
end
