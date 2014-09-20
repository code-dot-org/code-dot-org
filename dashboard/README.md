# Dashboard: [learn.code.org](http://learn.code.org)

<img src="http://i.imgur.com/b8UllKd.png" width=400/>

## Background

We are building drag-drop programming tutorials to allow a beginner to learn very basic programming concepts (sequencing, if-then statements, for loops, variables, functions), but using drag-drop programming.
The visual language we're using is based on Blockly (and open-source drag-drop language that spits out XML or JavaScript or Python).

The end-product is a 1-hour tutorial to be used during the Hour of Code campaign, for anybody to get a basic intro to Computer Science, AND a 20-hour follow-on tutorial and teacher-dashboard, meant for use in K-8 (elementary and middle school) classrooms.

For the 1-hour tutorial, we'd like to localize for international use (although we aren't going to get to bi-di support anytime soon). For the 20-hour curriculum, we'd like to have international support too, eventually.
The 1-hour tutorial should work on any browser (including tablets, smartphones), and require no sign-in. The 20-hour tutorial is optimized for desktops and tablets, and requires a login to save state.

The learn.code.org code is segmented into three parts:

1. **Blockly Core** is the visual programming language platform used for the interactive tutorials.
2.  **Blockly** includes *apps*—blockly puzzles built based on Blockly Core. It includes all of the apps used in the dashboard's 1-Hour and a 20-Hour curricula.
3.  **Dashboard** (this repository), is the tutorial platform which organizes blockly levels into tutorials, and includes support for teachers to track student progress.

## Setting up for development

See the main website-ci/README for server install and running instructions.

### Adding an Admin Account

1. Create a first user which will be your admin
2. `bundle exec rails c`
3. `User.first.update(admin: true)`

### Testing teacher accounts

While testing the teacher dashboard currently requires access to private code repositories, you can still use teacher accounts with your local build.

When you login as a teacher, ignore the invalid page redirect and navigate back to your build's root page. The rest of the teacher account functionality should work fine.

If you'd like to disable the redirect locally, comment out lines 91-93 in `application_helper.rb`.
