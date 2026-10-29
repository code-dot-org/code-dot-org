**Technical Design Proposal: Survey Summary Pipeline**

Created: April 18, 2019\
Last updated: April 23, 2019


- [1. Summary](#1-summary)
- [2. Problem](#2-problem)
- [3. Motivation](#3-motivation)
- [4. Options](#4-options)
  - [4.1. Update current pipeline to support 2019 surveys](#41-update-current-pipeline-to-support-2019-surveys)
  - [4.2. Create survey report in JotForm](#42-create-survey-report-in-jotform)
  - [4.3. Build generic survey pipeline](#43-build-generic-survey-pipeline)
    - [A. Overview](#a-overview)
    - [B. Detail design](#b-detail-design)
    - [C. Start with a hybrid solution](#c-start-with-a-hybrid-solution)
- [5. Recommendation](#5-recommendation)
  - [5.1. Rollout plan](#51-rollout-plan)
  - [5.2 Five components to build first](#52-five-components-to-build-first)
  - [5.3. Supporting new survey in the new pipeline](#53-supporting-new-survey-in-the-new-pipeline)
- [6. Appendix](#6-appendix)


# 1. Summary
This technical design doc explores 3 options we have to create and present summaries of JotForm surveys in workshop dashboard. Its purposes are
1. To get the team on the same page on the problem space
2. To gather feedbacks to decide what is the best option for us to invest in.

What it is not:
- The design is at architectural level, not at component level. It aims to provide enough data to make decision, not yet enough to implement immediately.
- This design is not about embedding JotForm survey in our site or preparing survey data for analysis in Tableau.


# 2. Problem
Currently it takes quite a lot of work to calculate summary for new JotForm survey and present results in our workshop dashboard. Specifically, we want to add 2 new CSF 201 (Deep Dive) surveys and 1 CSF 101 (Intro) survey this summer.

The difficulty is that components in the current survey summary pipeline are tightly coupled together. The data models, controller actions, helpers and views are built for a few specific type of workshop surveys such as local-summer-workshop and post-course surveys. Adding support for a new survey means creating new model, controller, view, and a lot of tests.

In the case of new CSF 201 surveys (pre and post-workshop), we try to reuse data model and UI view from local summer workshop, which already has pre-workshop, daily and post-workshop surveys. However, we cannot directly reuse the logic to create survey summary because of its tight coupling to summer workshop context. We have 2 approaches to solve this issue and will discuss them in section 4.1. Both approaches are not cheap and not sustainable if we want to support more JotForm surveys in the future.


# 3. Motivation
- Can we support several order of magnitude number of JotForm surveys? (Which in turn will help us make more data-driven decisions.)
- Can we build a generic pipeline that can support any new survey (from ingesting survey submissions, summarizing them, and presenting the result in workshop dashboard)?
- How much of the pipeline we build will still be relevant if we decide to switch to a different survey platform (Qualtrics, SurveyMonkey etc.)?


# 4. Options
We have 3 following options to calculate and present JotForm survey summaries in workshop dashboard.

## 4.1. Update current pipeline to support 2019 surveys
We will reuse the current pipeline as much as possible to support 3 new CSF surveys in 2019.

This option is based on `local_workshop_daily_survey_report` pipeline. We reuse its data model `WorkshopDailySurvey` and UI view `local_summer_workshop_daily_survey/results.jsx`. We will modify the parts that retrieve and summarize survey results, which are currently tightly coupled to summer workshop context. This logic lives in `WorkshopSurveyReportController` and `WorkshopSurveyResultsHelper`.

2 approaches:
- Modify this logic to make it more generic with the risk of introducing regression (the code is complex).
- Create a new path separate from the existing one, which means adding substantial duplicated code.

**Pros:** Risk is small (if creating a new path). Amount of new code is not small but manageable. We do just enough to support 3 new surveys in 2019.

**Cons:** Not scalable when we have more surveys. Could become thrown-away work if we decide to move to a generic pipeline later.

**Estimated Cost:** 5 ± 1 days.

## 4.2. Create survey report in JotForm
JotForm support creating [Visual Report](https://www.jotform.com/help/187-How-to-Create-a-Visual-Report-with-Your-Form-Submissions) ([example](https://www.jotform.com/report/91067837377065)). We can then embed this report as an iframe into workshop dashboard. Authentication and authorization before showing report will be handled by our side.

**Pros:** The cheapest option in term of engineering cost to enable. Survey owners can create report themselves. Report is automatically updated (don't need to download data locally and upload to Tableau).

**Cons:** Only suited for very basic reporting with simple calculation and visualization (not the same level as Tableau or PowerBI). User can not interact with the report. Cannot pass parameters to personalize the report. Cannot support complex scenarios such as showing facilitators their averages scores across all workshops they've facilitated.

**Estimated Cost:** 3 ± 1 days.

## 4.3. Build generic survey pipeline
### A. Overview
Creating a generic pipeline that starts from ingesting survey data, making data searchable, summarizing data, to presenting result in our site.\
Key features of the new pipeline is the decoupling of code from specific survey or workshop context, and modular design that allows more flexibility to adapt to future requirements.

**Pros:** Minimize work to support future surveys. Open for extensions, flexible for changes such as adding/removing/updating components. Enable new scenarios such as A/B testing in Survey.

**Cons:** Expensive. (This could be mitigated by building a hybrid solution first as presented in section C.)

**Estimated Cost:** 3-4 weeks for the complete pipeline. 5 ± 1 days for the hybrid solution.

### B. Detail design
The pipeline has 4 main actions
1. Ingest: Download data from JotForm server to CDO database.
2. Query: Find survey data that matches lookup conditions.
3. Summarize: Aggregate survey data.
4. Present: Display survey summaries in dashboard.

![Diagram](survey-summary-diagram.png)

Some patterns this design follows
- _Open-Closed Principle_\
  The pipeline is open for extension such as adding new components or adding different implementation of a component. However, it avoids, as best as it could, modifying existing code which could introduce regression. Following Single Responsibility principle will help with this.
- _Single Responsibility Principle_\
  Each method, class, module should have only 1 clear purpose. In a stronger statement, each should have only one reason to change.
- _Dependency Inversion Principle_\
  High-level modules (complex logic) should not depend on low-level modules (primary operations). Both should depend on abstractions. This allows high-level modules to easily switch to different low-level modules implementation.
- _Template Method Pattern_\
  Define the skeleton of an algorithm, deferring some steps to other components. E.g. Query module (step 2) could use different implementations of Parser, Indexer and Filter depends on how data is stored in database. The specific implementations of those child components will be send to Query component as input parameters (dependency injection). Strategy pattern enables switching among implementations of the same component.
- _Strategy Pattern_\
  Define an interface common to a family of algorithms, e.g. survey result reducers, and make them interchangeable. This lets the algorithm vary independently from clients that use it.

### C. Start with a hybrid solution
We can create a hybrid solution, combining existing pipeline and necessary new components, to quickly support 2019 surveys first. We will focus on step 3 (Summarize) and skip components in step 1, 2, and the last part of step 4. Components in step 3 will read from the current data models and return results to the current UI view.


# 5. Recommendation
Option 3. Build a new generic survey pipeline starting from step 3 (Summarize module)and connect it to existing pipeline. This approach allows us to support 2019 CSF surveys sooner by taking advantage of the existing work. Then, gradually build out the rest of the pipeline later. Eventually retire the current pipeline.

## 5.1. Rollout plan
1. Build 5 components just enough to support 2019 surveys
* The 5: Retriever (for current db), Transformer, Mapper, Reducer and Decorator (for current UI view). They are components in step 3 and 4 of the above diagram. The path to process 2019 surveys is a hybrid of older and newer pipelines.

2. Build Fetcher (step 1) to download survey submissions from JotForm to our database.
3. Build Parser, Indexer and Filter (step 4) to allow quick submission search.
4. Build another implementation of Retriever (in step 3) which will read from the new db created in step 2 & 3.
5. Build Presenter (in step 4) that can display result from a single query (e.g. summary results of 1 JotForm survey of a specific workshop)
6. Build another implementation of Decorator (in step 4) to provide enough information for the Presenter built in step 5.
7. Switch 2019 surveys to use the new pipeline. It should then be completely independent from the older pipeline.

8. All new surveys will use the new pipeline form this point forward.

9.  Migrate surveys using older pipeline to the newer one when we think it's worth to do so.

## 5.2 Five components to build first
This is step 1 in the rollout plan.\
Estimated Cost: 4.5 ± 1 days.\
(This estimation is for features with basic unit and integration tests. Thorough testing will take longer.)

1. Retriever
  - Retrieve survey data from existing tables (`SurveyQuestion, WorkshopDailySurvey`) and convert data to `submission_content_array` format.
  - Estimate: 2d
2. Transformer
  - Convert survey data from submission centric to question centric. At high level: {submission_id, submission_data} --> {question_name, question_and_answer_data}.
  - Estimate: 0.5d
3. Mapper
  - Go through question data, send it to suited Reducer based on question name and type. E.g. text -> text collector, number -> histogram/count/avg reducers.
  - Estimate: 0.5d
4. Reducer(s)
  - Produce a summary result from list of input question data. E.g. text collector, histogram, avg, count, distribution reducers.
  - Estimate: 0.5d
5. Decorator
  - Compile minimum information needed for the current UI view (`local_summer_workshop_daily_survey/results.jsx`) to display summary results.
  - Estimate: 1d

Note, we skip Modifier component because it's an optional feature.

## 5.3. Supporting new survey in the new pipeline
This is step 7 in the rollout plan.\
What we have to do to support new survey once the pipeline is completed:
* Add survey JotForm id to a config file used by the Fetcher. It will automatically download new submissions daily for that form id.

* Update the controller that handle all survey summary requests so it knows what requests will need results from this survey. We should be able to see new survey summaries on workshop dashboard after this point.

* Optional: select one of the existing Presenter(s). If none is selected, it will use a generic Presenter which simply displays questions in alphabetical order with their aggregation results. Can also create a new Presenter if needed.

* Optional: create specific Decorator if needed, e.g. to categorize and order questions in specific way.


# 6. Appendix

**Modifier component**
- Responsibility: Modifying question and answer data to make them uniform and aggregatable. It is **optional**, used only when needed. The pipeline should still run successfully without it.

- Examples
  - We have 2 questions with different unique names (maybe from a different version of the same survey, or from different surveys) and we want to consider them as one question for summarization purpose. The modifier will change 1 question name.
  - We have a multiple choice question with text answers, e.g. Disagree/Agree/Strongly Agree, but we want to convert them to numbers to calculate average. The modifier will map text answers to numbers.

- How it works (early design)
  - A General Modifier component is actually a collection of many very survey-specific modifier sub-components that perform the actual job.
  - General Modifier receive a list of specific modifiers to run from a parent component, which is the controller that receives and processes summary requests from clients. The controller understands context of a query and applies special rules when processing it.
  - Specific Modifier only processes input data that matches its precondition, e.g. data is from a specific JotForm id, and rejects everything else. Example for JotForm id 1024, changes unique name from "OverallFeeling" to "OverallHappiness".

- How a specific modifier is written
  - Survey owners understand the nuances in a specific survey and tell engineers what specific changes they want in the final result of survey summarization.
  - Engineers create a specific modifier for that survey. Then create a configuration in survey report controller to apply the modifier when right context occurs.
