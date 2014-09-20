## What are we doing and why?

The old user model favored flexibility over making design
decisions. So we took teacher feedback, anticipated some needs they'll
have with their next batch of students, and created a subway-map-like
user-flow diagram to hone the UX. With that understood we were able to
come up with a rational set of constraints (i.e. decisions!) like
"students can't be their own teacher" and "anyone with students must
be a teacher" and "only teachers can own sections." All of that led us
to the following, surprisingly straightforward plan for migrating the
user data...

## We have to change 3 tables: Sections, Followers and Users

### Sections
#### new constraint
* user_id must be user_type = 'teacher'

#### new columns
* script_id (nullable)
* login method: secret picture | secret word | email/password
* grade (text, optional)
* admin code (for non-owners to import students from this section)

### Followers
#### new constraints
* section_id is not nullable
* user_id must be user_type = 'teacher'
* section.user_id must = user_id (I think this is true now)

### User
#### new constraints
* user_type is not nullable (default is student)
* username is deprecated (new users do not have username; old users can still use username to log in) (not editable)
* email (required for teachers) (user can change) (any user can add)
* password (required for teachers) (user can change) (only shown if email exists)
 
#### new columns
* secret picture id (owning teacher or self can reset) (may be hidden or shown as disabled if not in a secret picture login section)
* secret words (owning teacher or self can reset) (may be hidden or shown as disabled if not in a secret word login section)
* active (boolean) (false means can't log in)

(I haven’t mentioned the new multiple teacher stuff but that’s its own thing and all new tables/code so we don’t have to talk about it now)

## There are now 4 ways to log in
* section (where login method is secret picture) + (select from list by name) + secret picture (classroom student only)
* section (where login method is secret word) + (select from list by name) + secret word (classroom student only)
* email + password (teacher or independent student)
* username + password (legacy independent student accounts — no new users like this) 

## Ok 4 and a half
* oauth

## Informal constraints (should we formalize these?)
* student.name should be unique within section (if this constraint is not met students may be confused when logging in)
* if student does not have email (or legacy username), student must have at least one section (if this constraint is not met the student has no way to log in)

## Now here is the part you are waiting for, what do we have to do to the data?

### make user_type actually mean something
```
delete from followers where user_id = student_user_id # no more self-following
update users set user_type = 'teacher' where "user has students" # only teachers can have students
update users set user_type = 'student' where user_type != 'teacher' # it's nullable now but we don't want it to be
alter table users change column user_type not null
# there will still be teachers with teachers but I think that’s ok. this means we do not have to change anyone who is already user_type: teacher to user_type :student
```

### all students must be in a section
```
User.where(user_type: ’teacher').each do |teacher|
   teacher.students.each do |student|
    if student is not in a section
      find or create “default section” for the teacher
      add student to that section
    end
  end
end
alter table followers change column section_id not null
```

### add new columns to section

```
alter table sections add columns script_id, login method, grade, admin_code # maybe admin_code_expiration if we’re going to do that)
# existing sections’ login policy should be email/password (supports legacy username/password)
Section.all.update_attribute(login_policy: ‘email’)
# this means all existing users can still log in, teacher can change to secret word/picture later
# all existing sections’ course is k-8
Section.all.update_attribute(script_id: Script::TWENTY_HOUR_ID)
```

### add new columns to user
```
alter table user add columns secret_picture, secret_word
# also randomly generate the secret_(picture|word) unless we are lazy-creating it
```

## Whoa, is that it? that is not too bad...

## But wait, what happened to existing users?

* If you were following yourself you aren't anymore
* If you were using the teacher UI you should still have access to the teacher UI
* If you were ONLY following yourself AND you weren't a teacher you can't access the teacher UI anymore.
* If you had students that were not in a section you have a new "default section" with those students in it
* If you were logging in with username/password or email/password you should be able to do what you were doing

## What is going to be a little messy?

if we want to have existing students with only username/password
* still be able to log in
* still have teachers able to reset their password

... we have to keep the old username login and the old teacher reset
password (for email login method sections only). Teachers can
explicitly migrate to the new scheme if they like it better. I don't
think we want to do this automatically because it will effectively
change everyone's password.


[test if this works in github UI](account-management-api-v2.md)
