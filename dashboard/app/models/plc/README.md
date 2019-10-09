# Explanation of the PLC models
Here's an overview of the different object types for PLC work and details on their relationships.
 
**User** - For PLC, a teacher taking the professional learning class. We will use the existing User object and do not need to add anything to this (yet)

**Professional Learning Course** - A course that the teacher is taking to build their skills. Ex: Teaching Computer Science Principles. A user may be enrolled in multiple courses.
 
**Course Unit** - Corresponds to a `Script` in our regular curriculum structure.  Units belong to courses, modules belong to units.
 
**Learning Module** - A component of a course, like "Internet Safety" or "What are loops?"  Modules are part of units, are part of courses.

**Task** - A thing that someone who is trying to complete a module must do. Ex: a written lesson plan, completing a given script. A module will have one or more task to complete. Every task belongs to exactly one module. Some examples of task types are
- Script Completion Tasks - completed when a user finishes a given script in code studio
- Written Assignment Tasks - completed when a user submits some writing
  - Some of these will be reviewed by instructors, some of these will be reviewed by peers
- Learning Resources - Although these are not tasks, it makes sense to model them as such. These are links to external sites or videos that a user may find useful. There's no concept of "completing" these (yet) but they should show up as items a user should do
 
**User Course Enrollment** - Maps a user to a course they are enrolled in.

**Enrollment Module Assignment** - Maps a course enrollment to all the modules that they have to complete in order to complete the course.
