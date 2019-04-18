# Survey Summary Technical Design Proposal

- [Survey Summary Technical Design Proposal](#survey-summary-technical-design-proposal)
  - [What/What not](#whatwhat-not)
  - [Why/Motivation](#whymotivation)
  - [Options](#options)
    - [Create JotForm report and embed into our site](#create-jotform-report-and-embed-into-our-site)
    - [Adapt current pipeline to just support new surveys in 2019](#adapt-current-pipeline-to-just-support-new-surveys-in-2019)
    - [Build a new generic survey pipeline](#build-a-new-generic-survey-pipeline)
  - [Recommendation](#recommendation)


## What/What not
A pipeline to ingest survey results from JotForm, summarize them, and display summaries in workshop dashboard.
This doc is to gather feedbacks on the options we can take to improve this pipeline.

This design is not about embedding JotForm survey in our site nor prepare data to do analysis in Tableau

## Why/Motivation
Currently it is not a trivial task to support displaying summary for a new survey in our workshop dashboard.
The reason is the current data model, controller action and view are very specific to certain type of workshop surveys such as local summer workshop and post-course surveys.

- Want to reduce the cost of processing new survey. We will have more surveys in the future, 3 in 2019: CSF 201 pre/post workshop, CSF 101. What if we have 100 type of surveys and updated versions of them year over year.

## Options
### Create JotForm report and embed into our site
- Can create [Visual Report](https://www.jotform.com/help/187-How-to-Create-a-Visual-Report-with-Your-Form-Submissions) in JotForm. [Example](https://www.jotform.com/report/91067837377065)
- Pros: Survey owners can create report themselves. Can embed iframe into our site. Data is automatically updated, don't need to download data locally and upload to Tableau. Authentication and authorization before showing report will be handled in controller.
- Cons: Can only do basic calculation and visualization (not level of Tableau or PowerBI). Can not interact with the report after it is created (e.g. filtering)

### Adapt current pipeline to just support new surveys in 2019
- Pros: Cheapest to support 3 new surveys in 2019
- Cons: Throw away work

### Build a new generic survey pipeline
- What
  - High level explanation\
    ![Diagram](survey_summary_diagram.png)
- Pros: Minimize work in the future. Enable new scenario. Open for extensions.
- Cons: Costly

- Want to enable new scenario.
  - What if we can shorten the round trip from creating a survey, publishing it, and immediately have results updated in our view daily. What scenario it will enable. Will we use survey more to make business decision?
  - A/B testing questions in a survey? A/B testing survey (2 surveys with the same purpose but substantially different)?
  - Use JotForm outside of workshop context?

- Want to resilient against big change. How much we have to rebuild if we switch from JotForm to a different provider in the future (e.g. SurveyMonkey, Qualtrics)? Lowering this cost enable us to switch to better tool.


**TODO**:
Example scenarios. What is required to enable new survey for workshop x? want to combine overall feedback across all survey? Do organizer survey view.
Create UI mockup for view (plant uml)

## Recommendation
Build a new generic survey pipeline, but build module at the end of the pipeline first and adapter to plug it in the current pipeline.