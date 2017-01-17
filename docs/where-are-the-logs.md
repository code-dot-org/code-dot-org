# Where are the logs??

<img src="https://s3.amazonaws.com/uploads.hipchat.com/65395/678893/4WEuCy7El54KBk1/upload.png"/>

Table below is horizontally scrollable, even if github's markdown renderer doesn't make that obvious

| ENV         | build                                                                                             | ui tests                                                                                                                             | pegasus server                                                           | dashboard server                                                                 |
|-------------|---------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------|----------------------------------------------------------------------------------|
| development |                                                                                                   | `code-dot-org/dashboard/test/ui/*.log`                                                                                               | in the console window where you ran `./up`                               | `code-dot-org/dashboard/log/development.log`                                           |
| staging     | email<br/> To: `dev+build@code.org` <br/>Subject: `/home/ubuntu/staging/aws/build_and_mail_log websites`    |                                                                                                                                      | `ssh ubuntu@staging.code.org` `~/staging/code-dot-org/pegasus/log/*.log` | `ssh ubuntu@staging.code.org` `~/staging/code-dot-org/dashboard/log/staging.log` |
| test        | email <br/> To: `dev+build@code.org` <br/> Subject: `/home/ubuntu/test/aws/build_and_mail_log test-websites`  | `ssh ubuntu@test.code.org`<br/>`~/test/code-dot-org/dashboard/test/ui/*.log`<br/>also on Sauce Labs at https://saucelabs.com/beta/dashboard/tests | `ssh ubuntu@test.code.org`<br/> `~/test/code-dot-org/pegasus/log/*.log`       | `ssh ubuntu@test.code.org` <br/>`~/test/code-dot-org/dashboard/log/test.log`          |
| production  | email <br/>To: `dev+build@code.org` <br/>Subject: `/home/ubuntu/production/aws/build_and_mail_log websites` |                                                                                                                                      | on logentries: https://logentries.com                                    | on logentries: https://logentries.com                                            |

## What about my adhoc server?

Output from the adhoc setup process can be found on the new machine at `/var/log/chef-bootstrap.log`.
