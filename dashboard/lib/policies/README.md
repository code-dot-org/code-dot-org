# Policy Objects

This directory is meant to contain Plain Old Ruby Objects (POROs) that
encapsulate business logic which _tells you about something_. This is as
opposed to other categories of POROs like Service Objects which _do something_
or Query Objects which _retrieve something_).

Policy Objects declared in this directory should all be declared under the
`Policies` namespace and should contain non-Rails-specific business logic that
can be used by our Rails app. In particular, this is a great place to put code
that would otherwise end up on our Rails models or controllers but which
doesn't necessarily _need_ to be declared there.

## More Info

See the [original pull request][original PR] for more info and discussion about
this pattern. Of particular interest in that pull request are [this
article][refactor article] detailing a philosophy of categorizing different
kinds of POROs and [this article][lib article] providing some context for why
this code belongs in `lib` and not `app`.


[original PR]: https://github.com/code-dot-org/code-dot-org/pull/30444
[refactor article]: https://codeclimate.com/blog/7-ways-to-decompose-fat-activerecord-models/
[lib article]: https://medium.com/extreme-programming/what-goes-in-rails-lib-92c74dfd955e
