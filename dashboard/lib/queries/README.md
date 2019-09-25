# Query Objects

This directory is meant to contain Plain Old Ruby Objects (POROs) that
encapsulate business logic which _retrieves something_. This is as opposed to
other categories of POROs like Service Objects which _do something_ or Policy
Objects which _tell you about something_).

Query Objects declared in this directory should all be declared under the
`Queries` namespace and should contain non-Rails-specific business logic that
can be used by our Rails app.


## Example

Query Objects can define basic class methods which capture complex query logic.
For example:

```ruby
class Queries::UserSchoolInfo
  def self.last_complete(user)
    user.
      user_school_infos.
      includes(:school_info).
      select {|usi| usi.school_info.complete?}.
      sort_by(&:created_at).
      last
  end
end
```

## Advanced Example: Scoping

A more advanced use of Query Objects could define a constructor which accepts
an ActiveRecord::Relation scope object as the first argument, and which
provides a reasonable default. For example:

```ruby
class Queries::User
  def initialize(scope = User.all)
    @scope = scope
  end
end
```

Your Query Object should then define instance methods which use the scope to
construct queries:

```ruby
class Queries::User
  # ...

  def recently_signed_in
    @scope.where("last_sign_in_at > ?", 1.week.ago) 
  end
end
```

In this way, you can easily apply the query to any relevant subset of records,
or chain queries on the fly.

```ruby
all_recent_users = Queries::User.new.recently_signed_in

my_students = current_user.students
my_active_students = Queries::User.new(my_students).recently_signed_in
my_active_young_students = my_active_students.where("age < ?", 13)
```

Your Query Object can also define factory methods for constructing
commonly-used scopes

```ruby
class Queries::User
  # ...

  def self.by_school(school)
    teachers = school.all_teachers
    students = school.all_students
    new(teachers.merge(students))
  end
end

# ...

my_active_peers = Queries::User.by_school(current_user.school).recently_signed_in
```

## More Info

See the [original pull request][original PR] for more info and discussion about
this pattern. Of particular interest in that pull request are [this
article][refactor article] detailing a philosophy of categorizing different
kinds of POROs and [this article][lib article] providing some context for why
this code belongs in `lib` and not `app`.


[original PR]: https://github.com/code-dot-org/code-dot-org/pull/30444
[refactor article]: https://codeclimate.com/blog/7-ways-to-decompose-fat-activerecord-models/
[lib article]: https://medium.com/extreme-programming/what-goes-in-rails-lib-92c74dfd955e
