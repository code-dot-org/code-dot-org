Resetting passwords in the dashboard console (instead of via the reset password email)

You might want to do this for a couple reasons:

- your dev environment is not set up to send mail and you want to reset your password
- you're resolving a zendesk contact from someone who is not receiving the reset password mails
  - it is important that use caution in case someone's trying to gain access to someone else's account
  - in general, only send the reset password instructions to the exact email address they're requesting a reset password for (i.e. don't send foo@email.com a reset for bar@email.com)


````
$ bin/dashboard-console
> User.send_reset_password_instructions(email: 'teacher@example.com')
````

This will send the reset password email (if the env sends email) and
also print the email to stdout. You can copy the link (make sure the
url has the correct hostname, e.g. I noticed that levelbuilder is
sending emails with a staging url).

