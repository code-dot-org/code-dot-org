module WorkshopConstants

  CS_IN_S = 'CS in Science'
  CS_IN_A = 'CS in Algebra'
  ECS = 'ECS'
  CSP = 'CSP'
  K5 = 'K5'
  CA = 'C/A'

  PHASE_1 = 'Phase 1'
  PHASE_2 = 'Phase 2'
  PHASE_2_ONLINE = 'Phase 2 Online'
  PHASE_3A = 'Phase 3A'
  PHASE_3B = 'Phase 3B'
  PHASE_3C = 'Phase 3C'
  PHASE_3D = 'Phase 3D'
  PHASE_4 = 'Phase 4'

  PROGRAM_TYPES = {
    1 => {id: 1, short_name: CS_IN_S, long_name: 'Computer Science in Science'},
    2 => {id: 2, short_name: CS_IN_A, long_name: 'Computer Science in Algebra'},
    3 => {id: 3, short_name: ECS, long_name: 'Exploring Computer Science'},
    4 => {id: 4, short_name: CSP, long_name: 'Computer Science Principles'},
    5 => {id: 5, short_name: K5, long_name: 'Computer Science in K5'},
    6 => {id: 6, short_name: CA, long_name: 'Counselor/Adm PD'}
  }
  PHASES = {
    1 => {id: 1, short_name: PHASE_1, long_name: 'Phase 1: Online Introduction'},
    2 => {id: 2, short_name: PHASE_2, long_name: 'Phase 2: Blended Summer Study', prerequisite_phase: 1},
    3 => {id: 3, short_name: PHASE_2_ONLINE, long_name: 'Phase 2 Online: Blended Summer Study'},
    4 => {id: 4, short_name: PHASE_3A, long_name: 'Phase 3: Part A'},
    5 => {id: 5, short_name: PHASE_3B, long_name: 'Phase 3: Part B'},
    6 => {id: 6, short_name: PHASE_3C, long_name: 'Phase 3: Part C'},
    7 => {id: 7, short_name: PHASE_3D, long_name: 'Phase 3: Part D'},
    8 => {id: 8, short_name: PHASE_4, long_name: 'Phase 4: Summer Wrap Up'}
  }

  EXIT_SURVEY_IDS = {
    CS_IN_S => {
      PHASE_2 => '1QG9eCbKJD26UNvTC0C9ZZyrp63WjzQSK5gQPP4lsZ2c',
      PHASE_3A => '106j69amXoeZkBEXfNszLUpIx3FfyVcOEdo5Ce6oKMA4',
      PHASE_3B => '1V4sm9cPvABp4ipo4MIMUq9cf-aa-sFWafI5qjrlSV8M'
    },
    CS_IN_A => {
      PHASE_2 => '1kEkyOk-Y4MsWVVjmkaw-UDfCE4Wl2Ol3MTrCw4IW8vw',
      PHASE_3A => '1oBYFuv1xlInKD7asJ7gR4GA1xbsdKDjG1PI4tvgdwWc',
      PHASE_3B => '12koHnpyF2azrNNsEgvy66_dqXXmWeRmEJ9ICJA-gT-M'
    },
    ECS => {
      PHASE_2 => '12-HzFgPn6vP-D5P1XCkYxg_Dv3_DWM0B-xh1VDBuhNo',
      PHASE_3A => '19Cfv0tzvBh7JOUWhFWv5phDvcDkxYWm1nBLKXESVyB4',
      PHASE_3B => '1U92feb_2lJ8lg2uU4dLeabK9zbmznkNogYtEP-N5IH4',
      PHASE_3C => '156hOBI42fcQx6rYsuMmdMH5NqElbAsCTd5MXDs70_Vc',
      PHASE_4 => '1KygTcSauHkt5AA_RF_PM5OIYVpvXPLOlG8O79yVRi48'
    },
    CSP => {
      PHASE_2 => '1lvvH5JCh6L40pFDqT9UaibyNtYUIwAEJQg2ulXIv6WQ',
      PHASE_3A => '13-2OlU3d0-Byy3wSCbFdSzEFwG-HAuRJoV_nyPAXWJs',
      PHASE_3B => '1IoJ_Kh6zOZzNvAfwgjRfniY3zvkmZgtdduT4PV5X1Ww',
      PHASE_3C => '10g9Qi022xIzJ86EhY89FD2EFqiXCsH_uZ2KgbJAAOUM',
      PHASE_3D => '1dZdKQTLPsjoXEz5taXU2k9q4pe9XBvQcdGazeuL6QLY',
      PHASE_4 => '1aMKclWosHmvn5GH0KaVxBGvxh7KeLYQTtKiHf-lC0X0'
    }
  }

end
