# Where is the output of UI Tests?

On the `test.code.org` box in the `website-ci/dashboard/test/ui` directory

# How do I make my user an admin?

````
% cd website-ci/dashboard
% ./bin rails c
Loading development environment (Rails 4.0.3)
irb(main):001:0> User.find_by_email('YOUR EMAIL').update_attribute(:admin, true)
````

In all non-prod environments, users with code.org email addresses will automatically be made admins.
