Description
-----------
This module adds a webform content type to your Drupal site.
A webform can be a questionnaire, contact or request form. These can be used 
by visitor to make contact or to enable a more complex survey than polls
provide. Submissions from a webform are saved in a database table and 
can optionally be mailed to e-mail addresses upon submission.

Requirements
------------
Drupal 7.x

Installation
------------
1. Copy the entire webform directory the Drupal sites/all/modules directory.

2. Login as an administrator. Enable the module in the "Administer" -> "Modules"

3. (Optional) Edit the settings under "Administer" -> "Configuration" ->
   "Content authoring" -> "Webform settings"

4. Create a webform node at node/add/webform.

Upgrading from previous versions
--------------------------------
Note that if you are upgrading from a Drupal 6 installation of Webform, you MUST
have been running Webform 3.x on your Drupal 6 site before upgrading to Drupal
7 and Webform 3.x. You cannot upgrade directly from Webform 6.x-2.x to Webform
7.x-3.x.

1. Copy the entire webform directory the Drupal modules directory.

2. Login as the FIRST user or change the $access_check in update.php to FALSE

3. Run update.php (at http://www.example.com/update.php)

Support
-------
Please use the issue queue for filing bugs with this module at
http://drupal.org/project/issues/webform

