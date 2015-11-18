module WorkshopConstants

  PROGRAM_TYPES = {
    1 => {id: 1, short_name: 'CS in Science', long_name: 'Computer Science in Science'},
    2 => {id: 2, short_name: 'CS in Algebra', long_name: 'Computer Science in Algebra'},
    3 => {id: 3, short_name: 'ECS', long_name: 'Exploring Computer Science'},
    4 => {id: 4, short_name: 'CSP', long_name: 'Computer Science Principles'},
    5 => {id: 5, short_name: 'K5', long_name: 'Computer Science in K5'},
    6 => {id: 6, short_name: 'C/A', long_name: 'Counselor/Adm PD'}
  }
  PHASES = {
    1 => {id: 1, short_name: 'Phase 1', long_name: 'Phase 1: Online Introduction'},
    2 => {id: 2, short_name: 'Phase 2', long_name: 'Phase 2: Blended Summer Study', prerequisite_phase: 1},
    3 => {id: 3, short_name: 'Phase 2 Online', long_name: 'Phase 2 Online: Blended Summer Study'},
    4 => {id: 4, short_name: 'Phase 3A', long_name: 'Phase 3: Part A'},
    5 => {id: 5, short_name: 'Phase 3B', long_name: 'Phase 3: Part B'},
    6 => {id: 6, short_name: 'Phase 3C', long_name: 'Phase 3: Part C'},
    7 => {id: 7, short_name: 'Phase 3D', long_name: 'Phase 3: Part D'},
    8 => {id: 8, short_name: 'Phase 4', long_name: 'Phase 4: Summer Wrap Up'}
  }

end
