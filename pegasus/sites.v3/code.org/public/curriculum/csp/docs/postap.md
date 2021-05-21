---
title: Post-AP Material
video_player: true
---

# Post-AP Material - App Lab Database Tools

* <a href="https://docs.google.com/document/d/1K5BE3odBGkcPIOrV38fOqQZD59v30_d_D530Uh8LFDY/edit?usp=sharing" target="_blank">Post-AP Teacher Overview Document

The following table is intended to outline the main programming topics for the post-AP material in Code Studio, so that teachers may familiarize themselves with the material and feel more comfortable assisting students.

In Code Studio, there is a <a href="https://studio.code.org/s/cspunit6/" target="_blank">collection of levels</a> that are intended to familiarize students with the different components of creating data-driven apps in App Lab. These stages will take several (approximately 4) weeks to complete, and students should work through the material at their own pace. Stage 8 includes examples of apps that can be made using the data tools, which students can use as inspiration for their final projects. The final stage contains a single level, in which students may build their final projects.

For more information about how to teach this material, please refer to this <a href="https://docs.google.com/document/d/1K5BE3odBGkcPIOrV38fOqQZD59v30_d_D530Uh8LFDY/edit?usp=sharing" target="_blank">teacher document</a>.

**NOTE:** This material was not designed to be a formal set of lessons, but rather a set of skill-building resources that you may use however you see fit.

<table cellpadding="10">
  <colgroup>
    <col width="25%" style="border:1px solid #999999;">
    <col width="40%" style="border:1px solid #999999;">
    <col width="35%" style="border:1px solid #999999;">
  </colgroup>
  <thead>
    <tr>
      <th class="centertext">Stage</th>
      <th class="centertext">Description</th>
      <th class="centertext">Additional Resources</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        Stage 1 - Creating JavaScript Objects<br><br>
        <a href="https://studio.code.org/s/cspunit6/lessons/1/levels/1" target="_blank">Code Studio</a>
      </td>
      <td>
        In this stage, students learn about <strong>JavaScript objects</strong>, which are collections of related properties with assigned values. Students learn the <strong>dot notation</strong> used to access and manipulate individual object properties. Finally, students begin developing a <strong>Contacts App</strong>, which will be built upon in the next several stages.
      </td>
      <td>
        <ul>
          <li>Intro to Objects - COMING SOON</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>
        Stage 2 - Permanent Data Storage<br><br>
        <a href="https://studio.code.org/s/cspunit6/lessons/2/levels/1" target="_blank">Code Studio</a>
      </td>
      <td>
        In this stage, students are introduced to the idea of “<strong>remote databases</strong>,” which allow apps to store data even after the app is restarted. Students are introduced to the <code>createRecord</code> command, which allows them to add rows to tables in a database. They are also introduced to the App Lab <strong>Data Viewer</strong>, which allows them to view and manually manipulate the data stored in the database. Students build on the <strong>Contacts App</strong> by using <code>createRecord</code> to store newly created contacts in the database.<br><br>

        After this stage, students know enough material to create apps that store information in a database. For example, a student could now develop a survey app that stores submitted responses, which he or she could then view in the Data Viewer and process by hand.
      </td>
      <td>
        <ul>
          <li>Intro to Databases - Part 1 - Creating and Storing Records<iframe width="100%" src="https://www.youtube.com/embed/d8ByCh-BouQ" frameborder="0" allowfullscreen></iframe></li>
          <li>Intro to Databases - Part 2 - Data Viewer<iframe width="100%" src="https://www.youtube.com/embed/RZlHfbtO2C4" frameborder="0" allowfullscreen></iframe></li>
          <li>
            <a href="https://code.org/applab/docs/tabledatastorage" target="_blank">App Lab Docs: Table Data Storage Overview</a>
          </li>
          <li>
            <a href="https://code.org/applab/docs/createRecord" target="_blank">App Lab Docs: createRecord</a>
          </li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>
        Stage 3 - Reading Records<br><br>
        <a href="https://studio.code.org/s/cspunit6/lessons/3/levels/1" target="_blank">Code Studio</a>
      </td>
      <td>
        In this stage, students learn how to use <code>readRecords</code> to load information stored in the database back into an app. Students are introduced to <strong>callback functions</strong> and the idea of <strong>asynchronous commands</strong>. Students build on the <strong>Contacts App</strong> by using <code>readRecords</code> to load the contacts from the database into the app when it first runs. Students are also introduced to the idea of <strong>local</strong> versus <strong>remote</strong> data storage.<br><br>

        After this stage, students know enough material to create apps that display data from a database. For example, a student could now create a Truth or Dare generator that asks the user to choose “Truth” or “Dare” and then displays a question/message from the corresponding category by choosing a records from the database.
      </td>
      <td>
        <ul>
          <li>
            <a href="https://code.org/applab/docs/readRecords" target="_blank">App Lab Docs: readRecords</a>
          </li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>
        Stage 4 - Deleting Records<br><br>
        <a href="https://studio.code.org/s/cspunit6/lessons/4/levels/1" target="_blank">Code Studio</a>
      </td>
      <td>
        In this stage, students learn how to use <code>deleteRecord</code> to remove rows from the database. Students build on the <strong>Contacts App</strong> by creating a “Delete” button and then using <code>deleteRecord</code> to remove the current contact from the database.<br><br>

        After this stage, students know enough material to create apps that remove data from a database. For example, a student could now create a “to do” list, which stores a table of tasks that need to be completed and allows users to “check off” completed tasks and delete them from the database.
      </td>
      <td>
        <ul>
          <li>
            <a href="https://code.org/applab/docs/deleteRecord" target="_blank">App Lab Docs: deleteRecord</a>
          </li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>
        Stage 5 - Updating Records<br><br>
        <a href="https://studio.code.org/s/cspunit6/lessons/5/levels/1" target="_blank">Code Studio</a>
      </td>
      <td>
        In this stage, students learn how to use <code>updateRecord</code> to edit rows in the database. Students finish building on the <strong>Contacts App</strong> by creating an “Edit” button and using <code>updateRecord</code> to save a user’s changes to a contact to the database.<br><br>

        After this stage, students know enough material to create a fully-functioning database application, in which users can create, read, update, and delete records. (These four functions together are called <strong>CRUD</strong> operations.) For example, a student could now create a movie rating application, where users can submit, edit, or remove movie reviews.
      </td>
      <td>
        <ul>
          <li>
            <a href="https://code.org/applab/docs/updateRecord" target="_blank">App Lab Docs: updateRecord</a>
          </li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>
        Stage 6 - Importing and Exporting Data<br><br>
        <a href="https://studio.code.org/s/cspunit6/lessons/6/levels/1" target="_blank">Code Studio</a>
      </td>
      <td>       
        In this stage, students learn how to “<strong>Remix</strong>” projects and that an app’s data does not transfer when it is remixed. Students learn how to use the <strong>import</strong> and <strong>export</strong> tools in the Data Viewer to transfer data between apps.
      </td>
      <td>
      </td>
    </tr>
    <tr>
      <td>
        Stage 7 - Visualizing Data<br><br>
        <a href="https://studio.code.org/s/cspunit6/lessons/7/levels/1" target="_blank">Code Studio</a>
      </td>
      <td>
        In this stage, students learn how to use <code>drawChartFromRecords</code> to create visualizations from within their apps, using the information stored in the database. Students use pre-populated databases to create a <strong>scatter chart</strong>, create a <strong>line chart</strong>, and <strong>customize a chart’s appearance</strong>.<br><br>

        After this stage, students know enough material to add visualizations that use the information from the database to their apps. For example, a student could now create a survey app that displays a scatter plot showing the correlation between two columns from the database.
      </td>
      <td>
        <ul>
          <li>
            <a href="https://code.org/applab/docs/drawChartFromRecords" target="_blank">App Lab Docs: drawChartFromRecords</a>
          </li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>
        Stage 8 - Sample Apps<br><br>
        <a href="https://studio.code.org/s/cspunit6/lessons/8/levels/1" target="_blank">Code Studio</a>
      </td>
      <td>
        Students don’t learn any new concepts in this stage. This stage is composed of a series of sample apps, which demonstrate ways in which the Data Tools may be used in projects. Students are meant to look through these projects to gain inspiration and ideas for their own final projects.<br><br>

        <strong>NOTE:</strong> Be aware that students WILL be able to see the code for these projects. There is much that students can learn by reverse-engineering an application, but the expectation is that if students are creating a similar project to one of the sample apps, the student’s final submission should make a considerable addition to the original app, not just recreate its functionality.
      </td>
      <td>
        <ul>
          <li>
            <a href="https://docs.google.com/document/d/1Zel8Ywoj470x_54bbkwM4XYqSxaA0J7IsqNHzCBD5-w/edit?usp=sharing" target="_blank">Activity Guide - Sample Apps Overview</a>
          </li>
        </ul>
      </td>
    </tr>
    <tr>
      <td>
        Stage 9 - Final Project<br><br>
        <a href="https://studio.code.org/s/cspunit6/lessons/9/levels/1" target="_blank">Code Studio</a>
      </td>
      <td>
        This stage contains a single level, in which students can build their final projects. Alternatively, if students want to remix a previous project and make alterations and improvements, they can submit the "Share" link for their final project by pasting the link into a comment in this level.
      </td>
      <td>
        <ul>
          <li>
            <a href="https://docs.google.com/document/d/1ppeLDnI6FP8FDErzj6uLfCB8x689Tv9lc4IAOJvCI4E/edit?usp=sharing" target="_blank">Activity Guide - Final Project Planning Guide</a>
          </li>
        </ul>
      </td>
    </tr>
  </tbody>
</table>