---
title: Research at Code.org
nav: educate_nav
rightbar: blank
theme: responsive
social:
  "og:description": "How students solve puzzles"
  "og:image": "/images/research.png"
  "og:image:width": 968
  "og:image:height": 577
  "og:video": ""
  "og:video:width": ""
  "og:video:height": ""
  "og:video:type": ""
---
# Research at Code.org

Code.org partners with researchers for a variety of types of studies.  Researchers also conduct conduct their own work using data provided by Code.org (see below) or just on their own using Code.org materials.

## Research, Papers and Reports about Code.org Materials and Programs

[Estimating the Causal Effect of Code.org Teacher Training Program on Advanced Placement Outcomes](http://www.westcoastanalytics.com/uploads/6/9/6/7/69675515/wca_code_final_report_2018.pdf)

* This study employs a potential outcomes modeling approach to estimate the causal effect
of Code.org’s Professional Learning Program on Advanced Placement (AP) Computer
Science Principles test taking and qualifying scores.
* Results indicate substantial and significant
increases in both Computer Science AP test taking and qualifying score earning for all students.
* In addition, the significant effects were even greater for Computer Science AP test taking and
qualifying score earned by female and minority students when impact ratios are analyzed
separately.



[Computational Thinking in Italian Schools: Quantitative Data and Teachers’ Sentiment Analysis after Two Years of "Programma il Futuro" Project -- July, 2017 (ACM Digital Library)](http://dl.acm.org/citation.cfm?id=3059040)

* In two years more than one million [Italian] students have been engaged and have completed a total of 10 million hours of informatics using Code.org materials in schools.  A detailed analysis of quantitative and qualitative data about the project is presented and areas for improvement are identified. One of the most interesting observations appears to corroborate the hypothesis that an exposure to informatics since the early age is important to attract students independently from their gender.

[Hour of Code impact study 2016 (PDF)](/files/HourOfCodeImpactStudy_Jan2017.pdf) 

* Findings show that after completing one Hour of Code activity students report liking computer science more, feel that they are better able to learn computer science, and are better at computer science than their peers.


Other reports

- [Code.org Evaluation Report 2015-16 (PDF)](/files/EvaluationReport2015-16.pdf)
- [Hour of Code impact report and teacher survey 2015](/about/evaluation/hourofcode)
- [Code.org Evaluation Report 2014-15](/about/evaluation/summary)


## Research Partnerships


* Dr. Briana Morrison - University of Nebraska at Omaha - [Subgoal Labels Study in CSP Unit 3](/research/subgoal-labels-study)
* Dr. Rene Kizilcec - Stanford University - Social Belonging in Computer Science Classrooms
* Dr. Justin Reich & Kevin Robinson - MIT Teaching Systems Lab - Unconscious Bias in Computer Science classrooms
* Dr. Chris Piech - Stanford University - Zero Shot Learning for Code Education: Rubric Sampling with Deep Learning Inference

***

## Anonymized data for research purposes

Numerous academic organizations have asked to access anonymized course-progress data from our [Code Studio](http://studio.code.org) tutorials in order to research the student learning process and ideas for improving on it.

As explained in our [privacy policy](/privacy), when students solve coding puzzles on our platform, we save the number of tries a student takes to solve a puzzle, including the code they submit. This is how we generate progress reports for students and teachers. This same data can also help identify how to improve our tutorials.

We're interested in exploring ways to share just the machine-level data (with no student identifying information) to allow 3rd party researchers to help us improve our service, without any risk of impact on student privacy.

## If you want to help
We'd love to do a lot more in this space, and we're limited by our own staff's ability to support third parties. We recently hired a data engineer to help us perform our own analysis and also to support academic efforts using the same data. We're hoping to open up more data soon.

In the meantime, we've done one experiment with researchers at Stanford University as explained below.

We'd like to take this further and look at what factors influence learning. For example, how do different puzzle types promote learning? How well do students transfer learning from one type of puzzle to another? How can we give students the right type of hints at the right time? What can we do to help students persist through hard problems instead of giving up? How do external factors (gender, age, class size, geography, etc.) impact student learning and what can we do to support diverse classes?

If you're interested in working with us on these questions (and more), email research@code.org.

## Data from 2 puzzles from Hour of Code 2013

Our first foray in this space has been a partnership with a Stanford University research team led by [Mehran Sahami](http://robotics.stanford.edu/users/sahami/bio.html). Stanford researcher [Chris Piech](http://stanford.edu/~cpiech/bio/index.html) evaluated the various computer programs that students submitted to two computer programming puzzles from our popular Hour of Code tutorial. The dataset below was generated for the paper [Autonomously Generating Hints by Inferring Problem Solving Policies](http://stanford.edu/~cpiech/bio/papers/inferringProblemSolvingPolicies.pdf) by Piech, C. Mehran S. Huang J and Guibas L.

[<img src="/images/fit-600/research.png" style="max-width: 100%">](http://stanford.edu/~cpiech/demos/research/blossoms.html)

[<button>See the visualization</button>](http://stanford.edu/~cpiech/demos/research/blossoms.html)

The link below is a dataset of anonymized, aggregated data of student attempts to solve these two puzzles, as explained in the readme.txt file and below. Please contact <piech@cs.stanford.edu> if you have questions.

[<button>Download data (ZIP)</button>](/files/anonymizeddata.zip)

## A note on privacy

The dataset is FERPA compliant.  It does not contain any identifiable information such as database IDs, timestamps, gender, age, or location data. Absolutely no information is included in the dataset which could be used to identify a student. For more information on how we protect private information, see our [terms of service](/tos) and [privacy policy](/privacy).

## Explanation of the dataset

This is a dataset of aggregate user interaction data for logged-in users working on two computer programming challenges, [Hoc4](http://studio.code.org/hoc/4) and [Hoc18](http://studio.code.org/hoc/18) from December 2013 to March 2014. The solution to Hoc4 requires students to string together a series of moves and turns. The solution to Hoc18 requires an if/else condition inside a for loop. Submissions are collected each time a logged in user executed their code.

### Description of the puzzles
Schematic of the maze and example solution for [Hoc4](http://studio.code.org/hoc/4) (left) and [Hoc18](http://studio.code.org/hoc/18) (right). The arrow is the agent and the heart is the goal.

<img src="/images/challengeSchematic.png"/ width="600" style="max-width: 100%">

### Usage statistics on the puzzles:

| Statistic | [Hoc4](http://studio.code.org/hoc/4) | [Hoc18](http://studio.code.org/hoc/18) |
|-----|-----|---|
| Unique Students 		|	509,405 	| 	263,569 |
| Code Submissions		|	1,138,506	| 	1,263,360 |
| Unique Submissions 	|	10,293		|	79,553 |
| Pass Rate				|	97.8%		| 	81.0% |


### The data for each problem is split into different directories, as follows

### ASTs
The Abstract Syntax Trees of all the unique programs. Each file is an AST in json format where each node has a "block type", a nodeId and a list of children. The name of the file is the corresponding astId. AstIds are ordered by popularity: 0.json is the most common submission, followed by 1.json etc. The file asts/counts.txt has corresponding submission counts and asts/unitTestResults.txt has the code.org unit test scores.

### Graphs
Graphs/roadMap.txt stores the edges of the legal move transitions between astIds as allowed by the code.org interface.

### GroundTruth
A dataset gathered by Piech et Al to capture teacher knowledge of "if a student had just submitted astId X, which adjacent astId Y would I suggest they work towards."

### Trajectories
Each file represents a series of asts (denoted using their astIds) that one or more students went through when solving the challenge. File names are the trajectoryIds. The file trajectories/counts.txt contains the number of students who generated each unique trajectory. The file trajectories/idMap.txt maps "secret" (eg anonymized) studentIds to their corresponding trajectories.

### Interpolated
We interpolate student trajectories over the roadMap graph, so that for each student we attempt to calculate the Maximum A Posteriori path of single block changes that each student went through. The file interpolated/idMap.txt contains the mapping between interpolated trajectory Ids and trajectory Ids.

### NextProblem
The students who attempted and completed the subsequent challenges (Hoc5 and Hoc19 respectively). The file nextProblem/attemptSet.txt is the list of "secret" (eg anonymized) studentIds of users who tried the next problem. The file nextProblem/perfectSet.txt is the list of "secret" (eg anonymized) studentIds of users who successfully completed the next problem.

### Unseen
Some ASTs do not compile in the interface and are thus not captured. This dir contains a list ASTs that do not compile but are still relevant for understanding user transitions.
