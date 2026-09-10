# Persona study plan

14 scenarios across four audiences. Each persona navigates the docs site
(http://127.0.0.1:4321/) and, when the docs instruct, the product
(http://localhost-studio.code.org:3000) with a throwaway account.

---

## 01 — Young student joins a section

**Persona:** 9-year-old student, shared Chromebook at school, cannot spell well,
has never used CodeAI before. Teacher just wrote a six-letter code on the board.

**Starting state:** Signed out. No account. Knows only the code.

**Goal in the persona's words:** "My teacher said to go to code.org and type in
the code she gave us. I have ABCDEF."

**Pass condition:** The student lands on a page that tells them where to type
the code, and they can follow the instructions to reach the class join flow in
the product. They do not need to create an account first (picture-password
sections allow codeless join).

**Docs must answer:** Where do I type the code? Do I need an account? What if
the code doesn't work?

---

## 02 — Teenager forgot their password

**Persona:** 15-year-old high-school student, personal laptop, has used CodeAI
for two years, has an email-based account.

**Starting state:** Signed out. Has an account but cannot remember the password.

**Goal in the persona's words:** "I can't log in, I forgot my password and I
need to get into my class today."

**Pass condition:** The student finds password-reset instructions within three
clicks and understands what will happen (email, link, new password).

**Docs must answer:** How do I reset my password? What if I don't have access
to the email? What if my teacher set up my account (no email)?

---

## 03 — Student's App Lab button does nothing

**Persona:** 13-year-old student, school laptop, working on an App Lab project.
They added a button in design mode but when they click Run and then click the
button, nothing happens.

**Starting state:** Signed in, mid-project.

**Goal in the persona's words:** "I made a button in App Lab but it doesn't do
anything when I click it. What am I doing wrong?"

**Pass condition:** The student finds App Lab documentation that explains event
handlers or connecting design-mode elements to code, or troubleshooting for
"button does nothing."

**Docs must answer:** How do buttons work in App Lab? Do I need to write code
to make a button do something? Where is the event handler?

---

## 04 — Student wants to share a project

**Persona:** 14-year-old student, home computer, built a Game Lab game and
wants to show a friend who is not in their class.

**Starting state:** Signed in, has a finished project.

**Goal in the persona's words:** "I made this cool game and I want to send the
link to my friend. Can I do that? Is my friend allowed to see it?"

**Pass condition:** The student finds sharing/publishing docs, understands the
difference, and knows whether their friend (no account) can view it.

**Docs must answer:** How do I get a share link? Can someone without an account
see it? What is the difference between sharing and publishing? Are there
restrictions?

---

## 05 — Parent received a permission email

**Persona:** Parent of a 10-year-old, reading email on a phone. The school
sent a permission request from CodeAI. They have never heard of CodeAI.

**Starting state:** Has the permission email. Not signed in. No account.

**Goal in the persona's words:** "My kid's school sent me this email asking
permission for something called CodeAI. Is this legit? What are they asking
me to agree to? What data does it collect?"

**Pass condition:** The parent finds the parent-permission page and the
what-teachers-can-see page, and those pages answer their trust questions.

**Docs must answer:** What is CodeAI? What data is collected? What can the
teacher see? Can I say no? What happens if I don't respond?

---

## 06 — Teacher first day: create a section with picture passwords

**Persona:** Elementary-school teacher, laptop, first time using CodeAI. Has
30 second-graders who cannot type passwords.

**Starting state:** Has a teacher account (just created). Signed in.

**Goal in the persona's words:** "I need to set up my class so my kids can
sign in with pictures instead of passwords. Then I need to give them
something they can type in to get started."

**Pass condition:** The teacher finds docs that walk them through creating a
section with picture passwords, and understands how to get the section code
to share with students. Ideally they can do it in the product following
the docs.

**Docs must answer:** How do I create a section? What is a login type? Which
login type uses pictures? How do students join? What do I tell them to do?

---

## 07 — Teacher: student says "it won't let me in"

**Persona:** Middle-school teacher, mid-class, a student is stuck at the
sign-in screen. The teacher set up sections with word passwords.

**Starting state:** Signed in as a teacher. Has sections.

**Goal in the persona's words:** "One of my students says they can't log in.
They're typing the section code but it says invalid. What do I do?"

**Pass condition:** The teacher finds troubleshooting guidance for student
sign-in problems: wrong code, wrong login type, expired section, student
in wrong section.

**Docs must answer:** What are the common reasons a student can't sign in?
How do I check the section code? How do I reset a student's password?
Can I see what login type the section uses?

---

## 08 — Teacher wants to check progress on lesson 3

**Persona:** High-school CS teacher, experienced with CodeAI, laptop.
Teaching CSD Unit 3. Wants to see which students finished lesson 3 and
leave feedback on one student's work.

**Starting state:** Signed in. Has an active section with an assigned course.

**Goal in the persona's words:** "I want to see who finished lesson 3 and
leave a comment on one kid's project."

**Pass condition:** The teacher finds progress-tracking docs and feedback docs.
The docs explain how to view per-lesson completion and how to leave feedback.

**Docs must answer:** Where is the progress view? Can I filter by lesson?
How do I leave feedback on a specific student's work? What kinds of feedback
can I give?

---

## 09 — Teacher wants to know about AI grading

**Persona:** High-school teacher, heard a colleague mention AI grading, wants
to know if they have it and how to use it.

**Starting state:** Signed in. Has sections.

**Goal in the persona's words:** "I heard CodeAI can grade student work with AI
now. Do I have that? How does it work? Can I trust it?"

**Pass condition:** The teacher finds the AI evaluation page, understands which
courses/levels support it, and knows how to review AI evaluations.

**Docs must answer:** What is AI evaluation? Which courses have it? How do I
turn it on? How do I review what the AI said? Can I override it?

---

## 10 — District LMS administrator: connect Canvas

**Persona:** District technology coordinator, laptop, manages Canvas LMS for
the district. Principal asked them to set up CodeAI integration.

**Starting state:** Not signed in to CodeAI. Has Canvas admin access.

**Goal in the persona's words:** "I need to connect our Canvas to CodeAI so
teachers can assign CodeAI activities from Canvas. Where do I start?"

**Pass condition:** The administrator finds LMS integration docs and
understands the LTI setup process, what it provisions, and what it does
not do.

**Docs must answer:** Does CodeAI support Canvas? What protocol (LTI)?
What do I configure in Canvas? What do I configure in CodeAI? What do
teachers get after setup? What about student accounts?

---

## 11 — Principal asked to approve a teacher application

**Persona:** Elementary-school principal, phone, received an email asking them
to approve a teacher's professional-learning application.

**Starting state:** Has the approval email. Not signed in. No CodeAI account.

**Goal in the persona's words:** "I got this email saying I need to approve
Ms. Smith's application. What is this? What am I approving? How do I do it?"

**Pass condition:** The principal finds the approval page and understands the
process.

**Docs must answer:** What is this application for? What am I approving?
Where do I click to approve? Do I need an account?

---

## 12 — New engineer: run the app locally and create a test student

**Persona:** Junior engineer, first week at Code.org, macOS laptop, has the
repo cloned and set up per SETUP.md.

**Starting state:** Repo cloned, dependencies installed. Has never run the app.

**Goal in the persona's words:** "I need to run the app locally and create a
test student account so I can see what students see."

**Pass condition:** The engineer finds local-development docs and
test-api-local-accounts docs, and the instructions are clear enough to follow.

**Docs must answer:** How do I start the server? What URL do I go to? How do I
create a test account? What kinds of test accounts can I make?

---

## 13 — Engineer: ship a feature behind a flag

**Persona:** Mid-level engineer, has shipped features before, working on a new
teacher-facing feature.

**Starting state:** Has the repo. Knows Rails. New feature is coded.

**Goal in the persona's words:** "I need to put my new feature behind a
feature flag so we can turn it on for a few teachers first. How do feature
flags work here?"

**Pass condition:** The engineer finds flag/configuration docs, understands DCDO
vs Gatekeeper vs experiments, and knows the steps to gate a feature.

**Docs must answer:** What flag systems exist? Which one do I use? How do I
create a flag? How do I check it in code? How do I turn it on for specific
users?

---

## 14 — Engineer: red Drone build

**Persona:** Engineer, mid-PR, got a red Drone CI notification. The error is
in a test they did not write.

**Starting state:** Has the repo. PR is open. CI failed.

**Goal in the persona's words:** "My Drone build is red. The failing test is
not one I touched. How do I figure out if this is a flake or if I broke it?
What do I do?"

**Pass condition:** The engineer finds testing/CI docs, understands how to
check for flakes versus real failures, and knows the process.

**Docs must answer:** How do I see what failed? How do I tell a flake from a
real break? How do I rerun just the failing test? What do I do if it is a
known flake?
