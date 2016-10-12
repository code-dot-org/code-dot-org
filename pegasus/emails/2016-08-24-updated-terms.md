---
from: 'Hadi Partovi <hadi_partovi@code.org>'
subject: "An important change in how we support student privacy"
---

In preparation for the new school year, we’ve made  a number of changes to the Code.org [Terms of Service](http://code.org/tos) and [Privacy Policy](http://code.org/privacy).  The changes are effective as of today, August 24.  

### Taking an unusual step to delete data to protect privacy

We’ve designed [Code Studio](http://studio.code.org) to enable students to use their email to login without ever sending student email addresses to our servers. This is the approach we previously took for students under 13 years of age, and we’re expanding this approach to all our students, even if they’re adults. We have over 10 million student accounts on our system, and we have deleted any email addresses associated with these accounts.

**We did this because the privacy and safety of student data is more important to us than the ability to contact our users. We hope other education web sites consider the same approach.**

At a time when digital privacy makes headlines and data breaches have become commonplace, we prefer not to even have student-identifying email addresses. Just as every other Web startup would tell you, our engineers do a fantastic job of protecting the secure data we store on our servers. But any CEO who says their Web servers will never suffer a breach is misrepresenting today’s sad reality.

**Code.org has deleted and stopped receiving emails for Code Studio student accounts. The data we don’t store cannot be stolen from us. Knowing this, I can sleep much easier at night, and so can you.**

We still allow students to login using their email address and password. But as soon as a student enters this information, it’s scrambled using a “[one way hash function](http://www.aspencrypt.com/crypto101_hash.html),” so what we save isn’t the original email address or password, but rather the scrambled version. This is the standard method for keeping passwords out of the hands of hackers. We’re now applying the same protection to student email addresses.

**To learn more about how this encryption method works, check out [a blog article we posted to explain our login approach](http://blog.code.org/post/147756946588/).**

This means we permanently lose the ability to email students based on their Code Studio accounts. This was not an easy trade-off. But because we store account information for over 10 million students, I felt it was the right tradeoff to take extra caution to preserve their privacy.

We’ll continue to maintain email addresses for you, our Code Studio teachers, and we rely more than ever on you to keep students engaged on our platform and in our courses. 

### Our new App Lab and upcoming Game Lab tools

In addition to the above, the other big change is to reflect that our Code Studio platform will now allow students to use our new [App Lab](https://code.org/educate/applab) tool and our upcoming Game Lab tool to create and share apps and games and projects, and that we store the data, code, and uploaded media files for these projects. 

This works similarly to other educational coding platforms such as MIT’s Scratch or App Inventor. Because of Code Studio’s popularity, we are taking extra precaution: for students under the age of 13, we will only allow them access to these new capabilities if they are part of a classroom with a teacher who explicitly accepts our new terms of service and privacy policy.

### A summary of the other changes to our policies and terms

Some other changes are:

* We will survey Code Studio teachers, and students over the age of 13, to tell us their demographic information (gender, race, or teacher background). Providing this information is **always optional**, and helps us build an aggregate picture to advance our goal of increasing diversity in computer science.
* We collect additional information on how students are solving puzzles (e.g. by using hints) in order to help us improve our course effectiveness. Our new Privacy Policy reflects that we will store attendance, participation, and progress information for teachers attending our professional learning workshops or taking our professional learning online courses. 
* Twilio, the third party provider of our “send to phone” feature for sending student apps to phones (via text message) will no longer store phone numbers. Again, data that isn’t stored can’t be stolen.

**I welcome you to review our new Terms of Service and Privacy Policy.** I personally review every change, to make sure our policy is easy to read and not full of vague assurances or complex or confusing legalese. We’ve also updated our course handouts for parents to explain this as well. (See parent handouts for [CS Fundamentals](https://code.org/curriculum/docs/k-5/parent-handout), [CS Principles](https://code.org/curriculum/docs/csp/parent-handout), and [CS in Algebra](https://code.org/curriculum/docs/algebra/parent-handout)). 


<br/>
Hadi Partovi<br />
Founder, Code.org
<br />

<hr>

<small>You’re receiving this email because you're a Code Studio teacher. We'll only send you rare, but important updates. Code.org is a 501c3 non-profit. Our address is 1501 4th Avenue, Suite 900, Seattle, WA 98101.</small> <br />
<small><strong>Don't want these emails? <a href="<%= unsubscribe_link %>">Unsubscribe here</a>.</strong></small></p>
<p><small>Stay in touch with us. Follow Code.org on
<a href="https://www.facebook.com/Code.org">Facebook</a>, <a href="https://twitter.com/codeorg">Twitter</a>, <a href="https://instagram.com/codeorg">Instagram</a>.
</small></p>

![](<%= tracking_pixel %>)