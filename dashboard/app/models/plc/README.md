# Explanation of the PLC models
Here's an overview of the different object types for PLC work and details on their relationships.
 
**User** - For PLC, a teacher taking the professional learning class. We will use the existing User object and do not need to add anything to this (yet)

**Professional Learning Course** - A course that the teacher is taking to build their skills. Ex: Teaching Computer Science Principles. A user may be enrolled in multiple courses.
 
**Course Unit** - Corresponds to a `Script` in our regular curriculum structure.  Units belong to courses, modules belong to units.
 
**Learning Module** - A component of a course, like "Internet Safety" or "What are loops?"  Modules are part of units, are part of courses.

**User Course Enrollment** - Maps a user to a course they are enrolled in.

**Enrollment Module Assignment** - Maps a course enrollment to all the modules that they have to complete in order to complete the course.
