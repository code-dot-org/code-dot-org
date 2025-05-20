import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['@statsig/statsig-node-core'],
  cacheMaxMemorySize: 0, // disable default in-memory caching
  redirects: async function () {
    return [
      {
        source: '/about/unifying',
        destination: '/about/unifying-approach',
        permanent: false,
      },
      {
        source: '/professional-learning/international',
        destination: 'https://global.code.org/pd',
        permanent: false,
      },
      {
        source: '/professional-learning/international-partners',
        destination: 'https://global.code.org/pd',
        permanent: false,
      },
      {
        source: '/international/apply',
        destination: 'https://global.code.org/pd',
        permanent: false,
      },
      {
        source: '/educate/regional-partner/playbook',
        destination:
          'https://studio.code.org/professional-learning/regional-partner/playbook',
        permanent: false,
      },
      {
        source: '/educate/facilitator-landing/CSP',
        destination:
          'https://studio.code.org/professional-learning/facilitator/computer-science-principles',
        permanent: false,
      },
      {
        source: '/educate/facilitator-landing/CSF',
        destination:
          'https://studio.code.org/professional-learning/facilitator/computer-science-fundamentals',
        permanent: false,
      },
      {
        source: '/educate/facilitator-landing/CSD',
        destination:
          'https://studio.code.org/professional-learning/facilitator/computer-science-discoveries',
        permanent: false,
      },
      {
        source: '/educate/facilitator-landing/CSA',
        destination:
          'https://studio.code.org/professional-learning/facilitator/computer-science-a',
        permanent: false,
      },
      {
        source: '/curriculum/unplugged',
        destination: 'https://studio.code.org/s/k5-unplugged',
        permanent: false,
      },
      {
        source: '/girlscouts/HappyMaps/ActivityVideo',
        destination: 'https://youtu.be/hrnhiKAQ1_k',
        permanent: false,
      },
      {
        source: '/girlscouts/GraphPaperProgramming/OverviewVideo',
        destination: 'https://www.youtube.com/watch?v=Yy1zbkfRtIg',
        permanent: false,
      },
      {
        source: '/girlscouts/GraphPaperProgramming/ActivityVideo',
        destination:
          'https://www.youtube.com/watch?v=Y_paSrH2ffw&feature=youtu.be',
        permanent: false,
      },
      {
        source: '/girlscouts/TangramAlgorithms/ActivityVideo',
        destination: 'https://www.youtube.com/watch?v=xZlKyTwQZv8',
        permanent: false,
      },
      {
        source: '/girlscouts/FunctionalSuncatchers/OverviewVideo',
        destination: 'https://www.youtube.com/watch?v=VmIcnmPjNgw',
        permanent: false,
      },
      {
        source: '/girlscouts/MoveItMoveIt/ActivityVideo',
        destination:
          'https://www.youtube.com/watch?v=VGi2bnRFqzM&feature=youtu.be',
        permanent: false,
      },
      {
        source: '/girlscouts/GraphPaperProgramming/DemoVideo',
        destination:
          'https://www.youtube.com/watch?v=vBUtejDNvrs&feature=youtu.be',
        permanent: false,
      },
      {
        source: '/girlscouts/ComputationalThinking/ActivityVideo',
        destination:
          'https://www.youtube.com/watch?v=TlAaklrolA0&feature=youtu.be',
        permanent: false,
      },
      {
        source: '/girlscouts/MadGlibs/ActivityVideo',
        destination:
          'https://www.youtube.com/watch?v=TctGRrUdkcc&feature=youtu.be',
        permanent: false,
      },
      {
        source: '/girlscouts/FunctionalSuncatchers/DemoVideo',
        destination:
          'https://www.youtube.com/watch?v=Rb5DNYhLb7I&feature=youtu.be',
        permanent: false,
      },
      {
        source: '/girlscouts/RelayPaperProgramming/ActivityVideo',
        destination:
          'https://www.youtube.com/watch?v=l5MKkXbzOsk&feature=youtu.be',
        permanent: false,
      },
      {
        source: '/girlscouts/FunctionalSuncatchers/ActivityVideo',
        destination: 'https://www.youtube.com/watch?v=l5MKkXbzOsk',
        permanent: false,
      },
      {
        source: '/girlscouts/BuildingaFoundation/NeverGiveUpVideo',
        destination: 'https://www.youtube.com/watch?v=jyfyVen4Bdw',
        permanent: false,
      },
      {
        source: '/girlscouts/BuildingaFoundation/OverviewVideo',
        destination:
          'https://www.youtube.com/watch?v=J7y0o6VxMXQ&feature=youtu.be&list=PL2DhNKNdmOtqBgWyF5kmy2oPh0U-Zfv2G',
        permanent: false,
      },
      {
        source: '/girlscouts/ComputationalThinkingwithMonsters/ActivityVideo',
        destination:
          'https://www.youtube.com/watch?v=injJWiSA0pw&feature=youtu.be',
        permanent: false,
      },
      {
        source: '/girlscouts/PlantaSeed/OverviewVideo',
        destination: 'https://www.youtube.com/watch?v=icVRxFr39AU',
        permanent: false,
      },
      {
        source: '/girlscouts/RelayPaperProgramming/OverviewVideo',
        destination: 'https://www.youtube.com/watch?v=fvpFCI8yoeA',
        permanent: false,
      },
      {
        source: '/girlscouts/PlantaSeed/ActivityVideo',
        destination: 'https://www.youtube.com/watch?v=FHsuEh1kJ18',
        permanent: false,
      },
      {
        source: '/girlscouts/HappyMaps/OverviewVideo',
        destination: 'https://www.youtube.com/watch?v=En6Bshuqljg',
        permanent: false,
      },
      {
        source: '/girlscouts/ComputationalThinking/DemoVideo',
        destination: 'https://www.youtube.com/watch?v=b4a7Ty1TpKU',
        permanent: false,
      },
      {
        source: '/girlscouts/MoveItMoveIt/OverviewVideo',
        destination: 'https://www.youtube.com/watch?v=aV4rqNUG-Jw',
        permanent: false,
      },
      {
        source: '/girlscouts/TangramAlgorithms/OverviewVideo',
        destination: 'https://www.youtube.com/watch?v=9K4JAdvwdVM',
        permanent: false,
      },
      {
        source: '/girlscouts/BuildingaFoundation/DemoVideo',
        destination:
          'https://www.youtube.com/watch?v=90cSld-If04&feature=youtu.be',
        permanent: false,
      },
      {
        source: '/girlscouts/ComputationalThinking/OverviewVideo',
        destination: 'https://www.youtube.com/watch?v=7sHTZsGMQuQ',
        permanent: false,
      },
      {
        source: '/girlscouts/MadGlibs/OverviewVideo',
        destination: 'https://www.youtube.com/watch?v=16erXD_PVPg',
        permanent: false,
      },
      {
        source: '/dataportal/index',
        destination:
          'https://us-east-1.online.tableau.com/#/site/codeorg/views/DashboardPortal2_0/DataPortalHome',
        permanent: false,
      },
      {
        source: '/educate/curriculum/csf-transition-guide',
        destination:
          'https://support.code.org/hc/en-us/articles/26001058366093-Teaching-Computer-Science-Fundamentals-Courses-A-F',
        permanent: false,
      },
      {
        source: '/verified',
        destination:
          'https://support.code.org/hc/en-us/articles/115001550131-Becoming-a-verified-teacher-CS-Principles-and-CS-Discoveries-only-',
        permanent: false,
      },
      {
        source: '/support',
        destination: 'https://support.code.org/',
        permanent: false,
      },
      {
        source: '/questions',
        destination: 'https://support.code.org/',
        permanent: false,
      },
      {
        source: '/faq',
        destination: 'https://support.code.org/',
        permanent: false,
      },
      {
        source: '/yourschool/thankyou',
        destination: 'https://studio.code.org/your-school',
        permanent: false,
      },
      {
        source: '/yourschool',
        destination: 'https://studio.code.org/your-school',
        permanent: false,
      },
      {
        source: '/schools/new',
        destination: 'https://studio.code.org/your-school',
        permanent: false,
      },
      {
        source: '/schools',
        destination: 'https://studio.code.org/your-school',
        permanent: false,
      },
      {
        source: '/learn/local',
        destination: 'https://studio.code.org/your-school',
        permanent: false,
      },
      {
        source: '/learn/beyond',
        destination: 'https://studio.code.org/users/sign_up',
        permanent: false,
      },
      {
        source: '/vigenere',
        destination: 'https://studio.code.org/s/vigenere',
        permanent: false,
      },
      {
        source: '/textcompression',
        destination: 'https://studio.code.org/s/text-compression/',
        permanent: false,
      },
      {
        source: '/hourofcode/starwars',
        destination: 'https://studio.code.org/s/starwars/lessons/1',
        permanent: false,
      },
      {
        source: '/hourofcode/star-wars',
        destination: 'https://studio.code.org/s/starwars/lessons/1',
        permanent: false,
      },
      {
        source: '/pwc',
        destination: 'https://studio.code.org/s/pwc',
        permanent: false,
      },
      {
        source: '/publickey',
        destination: 'https://studio.code.org/s/public-key-cryptography',
        permanent: false,
      },
      {
        source: '/prereader',
        destination: 'https://studio.code.org/s/pre-express',
        permanent: false,
      },
      {
        source: '/studio',
        destination: 'https://studio.code.org/s/playlab/lessons/1/levels/10',
        permanent: false,
      },
      {
        source: '/hourofcode/playlab',
        destination: 'https://studio.code.org/s/playlab/lessons/1',
        permanent: false,
      },
      {
        source: '/pixelation',
        destination: 'https://studio.code.org/s/pixelation',
        permanent: false,
      },
      {
        source: '/outbreak',
        destination: 'https://studio.code.org/s/outbreak/lessons/1/levels/1',
        permanent: false,
      },
      {
        source: '/odometer',
        destination: 'https://studio.code.org/s/odometer',
        permanent: false,
      },
      {
        source: '/oceans',
        destination: 'https://studio.code.org/s/oceans/lessons/1/levels/1',
        permanent: false,
      },
      {
        source: '/ocean',
        destination: 'https://studio.code.org/s/oceans/lessons/1/levels/1',
        permanent: false,
      },
      {
        source: '/netsim',
        destination: 'https://studio.code.org/s/netsim',
        permanent: false,
      },
      {
        source: '/internetsimulator',
        destination: 'https://studio.code.org/s/netsim',
        permanent: false,
      },
      {
        source: '/hourofcode/minecraft',
        destination: 'https://studio.code.org/s/mc/lessons/1',
        permanent: false,
      },
      {
        source: '/hourofcode/mc',
        destination: 'https://studio.code.org/s/mc/lessons/1',
        permanent: false,
      },
      {
        source: '/hourofcode/infinity',
        destination: 'https://studio.code.org/s/infinity/lessons/1',
        permanent: false,
      },
      {
        source: '/hourofcode/hourofcode',
        destination: 'https://studio.code.org/s/hourofcode/lessons/1',
        permanent: false,
      },
      {
        source: '/hourofcode/hour-of-code',
        destination: 'https://studio.code.org/s/hourofcode/lessons/1',
        permanent: false,
      },
      {
        source: '/frozen',
        destination: 'https://studio.code.org/s/frozen/reset',
        permanent: false,
      },
      {
        source: '/hourofcode/frozen',
        destination: 'https://studio.code.org/s/frozen/lessons/1',
        permanent: false,
      },
      {
        source: '/frequency',
        destination: 'https://studio.code.org/s/frequency_analysis',
        permanent: false,
      },
      {
        source: '/flappybird',
        destination: 'https://studio.code.org/s/flappy/reset',
        permanent: false,
      },
      {
        source: '/flappy',
        destination: 'https://studio.code.org/s/flappy/reset',
        permanent: false,
      },
      {
        source: '/hourofcode/flappy',
        destination: 'https://studio.code.org/s/flappy/lessons/1',
        permanent: false,
      },
      {
        source: '/express',
        destination: 'https://studio.code.org/s/express',
        permanent: false,
      },
      {
        source: '/educate/curriculum/express-course',
        destination: 'https://studio.code.org/s/express',
        permanent: false,
      },
      {
        source: '/bounce',
        destination: 'https://studio.code.org/s/events/lessons/1/levels/1',
        permanent: false,
      },
      {
        source: '/hourofcode/unplugged-conditionals-with-cards',
        destination: 'https://studio.code.org/s/coursed-2023/lessons/12',
        permanent: false,
      },
      {
        source: '/break',
        destination: 'https://studio.code.org/s/code-break',
        permanent: false,
      },
      {
        source: '/hourofcode/artist',
        destination: 'https://studio.code.org/s/artist/lessons/1',
        permanent: false,
      },
      {
        source: '/report_abuse',
        destination: 'https://studio.code.org/report_abuse',
        permanent: false,
      },
      {
        source: '/playlab',
        destination: 'https://studio.code.org/projects/playlab/new',
        permanent: false,
      },
      {
        source: '/bingo',
        destination:
          'https://studio.code.org/projects/applab/6TipwPgb_eTv52oYL6bS4A',
        permanent: false,
      },
      {
        source: '/professional-learning/middle-high',
        destination: 'https://studio.code.org/professional-learning/workshops',
        permanent: false,
      },
      {
        source: '/professional-learning/elementary',
        destination: 'https://studio.code.org/professional-learning/workshops',
        permanent: false,
      },
      {
        source: '/professional-development-workshops',
        destination: 'https://studio.code.org/professional-learning/workshops',
        permanent: false,
      },
      {
        source: '/professional-development-deep-dive',
        destination: 'https://studio.code.org/professional-learning/workshops',
        permanent: false,
      },
      {
        source:
          '/educate/professional-learning/professional-development-deep-dive',
        destination: 'https://studio.code.org/professional-learning/workshops',
        permanent: false,
      },
      {
        source: '/educate/professional-learning/middle-high',
        destination: 'https://studio.code.org/professional-learning/workshops',
        permanent: false,
      },
      {
        source: '/educate/professional-learning/cs-fundamentals-resources',
        destination: 'https://studio.code.org/professional-learning/workshops',
        permanent: false,
      },
      {
        source: '/csp/pd',
        destination: 'https://studio.code.org/professional-learning/workshops',
        permanent: false,
      },
      {
        source: '/Apply',
        destination: 'https://studio.code.org/professional-learning/workshops',
        permanent: false,
      },
      {
        source: '/apply',
        destination: 'https://studio.code.org/professional-learning/workshops',
        permanent: false,
      },
      {
        source: '/professional-learning/contact-regional-partner',
        destination:
          'https://studio.code.org/professional-learning/contact-regional-partner',
        permanent: false,
      },
      {
        source: '/educate/professional-learning/contact-regional-partner',
        destination:
          'https://studio.code.org/professional-learning/contact-regional-partner',
        permanent: false,
      },
      {
        source: '/csp-pre-survey',
        destination: 'https://studio.code.org/pd/workshop_pre_survey',
        permanent: false,
      },
      {
        source: '/csd-pre-survey',
        destination: 'https://studio.code.org/pd/workshop_pre_survey',
        permanent: false,
      },
      {
        source: '/globalpd',
        destination: 'https://studio.code.org/pd/international_workshop',
        permanent: false,
      },
      {
        source: '/maker/setup',
        destination: 'https://studio.code.org/maker/setup',
        permanent: false,
      },
      {
        source: '/join',
        destination: 'https://studio.code.org/join',
        permanent: false,
      },
      {
        source: '/starwars-download',
        destination: 'https://studio.code.org/download/starwars',
        permanent: false,
      },
      {
        source: '/applab/docs/tabledatastorage',
        destination: 'https://studio.code.org/docs/concepts/tableDataStorage/',
        permanent: false,
      },
      {
        source: '/applab/docs/import',
        destination:
          'https://studio.code.org/docs/concepts/app-lab/design-mode/importing-screens/',
        permanent: false,
      },
      {
        source: '/sharecertificate',
        destination: 'https://studio.code.org/certificates/blank',
        permanent: false,
      },
      {
        source: '/certificates/blank',
        destination: 'https://studio.code.org/certificates/blank',
        permanent: false,
      },
      {
        source: '/certificates',
        destination: 'https://studio.code.org/certificates/batch',
        permanent: false,
      },
      {
        source: '/certificate',
        destination: 'https://studio.code.org/certificates/batch',
        permanent: false,
      },
      {
        source: '/sports',
        destination: 'https://studio.code.org/catalog',
        permanent: false,
      },
      {
        source: '/lesson_plans',
        destination: 'https://studio.code.org/catalog',
        permanent: false,
      },
      {
        source: '/educate/curriculum',
        destination: 'https://studio.code.org/catalog',
        permanent: false,
      },
      {
        source: '/curriculum',
        destination: 'https://studio.code.org/catalog',
        permanent: false,
      },
      {
        source: '/athletes',
        destination: 'https://studio.code.org/catalog',
        permanent: false,
      },
      {
        source: '/amazon-future-engineer',
        destination: 'https://studio.code.org/amazon-future-engineer',
        permanent: false,
      },
      {
        source: '/afe/success',
        destination: 'https://studio.code.org/amazon-future-engineer',
        permanent: false,
      },
      {
        source: '/afe/start-codeorg',
        destination: 'https://studio.code.org/amazon-future-engineer',
        permanent: false,
      },
      {
        source: '/afe/india',
        destination: 'https://studio.code.org/amazon-future-engineer',
        permanent: false,
      },
      {
        source: '/afe',
        destination: 'https://studio.code.org/amazon-future-engineer',
        permanent: false,
      },
      {
        source: '/shop',
        destination: 'https://store.code.org/',
        permanent: false,
      },
      {
        source: '/learn2',
        destination: 'https://hourofcode.com/learn',
        permanent: false,
      },
      {
        source: '/learn/scratch',
        destination: 'https://hourofcode.com/learn',
        permanent: false,
      },
      {
        source: '/learn/robotics',
        destination: 'https://hourofcode.com/learn',
        permanent: false,
      },
      {
        source: '/learn/legacy',
        destination: 'https://hourofcode.com/learn',
        permanent: false,
      },
      {
        source: '/learn/khan-academy',
        destination: 'https://hourofcode.com/learn',
        permanent: false,
      },
      {
        source: '/learn/index',
        destination: 'https://hourofcode.com/learn',
        permanent: false,
      },
      {
        source: '/learn/codehs',
        destination: 'https://hourofcode.com/learn',
        permanent: false,
      },
      {
        source: '/learn/codecademy',
        destination: 'https://hourofcode.com/learn',
        permanent: false,
      },
      {
        source: '/educate/allhourofcode',
        destination: 'https://hourofcode.com/learn',
        permanent: false,
      },
      {
        source: '/envivo',
        destination: 'https://hourofcode.com/envivo',
        permanent: false,
      },
      {
        source: '/international/index',
        destination: 'https://global.code.org',
        permanent: false,
      },
      {
        source: '/educate/community',
        destination: 'https://forum.code.org',
        permanent: false,
      },
      {
        source: '/community',
        destination: 'https://forum.code.org',
        permanent: false,
      },
      {
        source: '/youngwomen',
        destination: 'https://csiseverything.org/',
        permanent: false,
      },
      {
        source: '/girls',
        destination: 'https://csiseverything.org/',
        permanent: false,
      },
      {
        source: '/contact',
        destination: 'https://codeorg.zendesk.com/hc/en-us/requests/new',
        permanent: false,
      },
      {
        source: '/farsi',
        destination: 'https://codeinfarsi.org/',
        permanent: false,
      },
      {
        source: '/weblab',
        destination: '/tools/web-lab',
        permanent: false,
      },
      {
        source: '/educate/weblab',
        destination: '/tools/web-lab',
        permanent: false,
      },
      {
        source: '/spritelab',
        destination: '/tools/sprite-lab',
        permanent: false,
      },
      {
        source: '/educate/spritelab',
        destination: '/tools/sprite-lab',
        permanent: false,
      },
      {
        source: '/tools/musiclab',
        destination: '/tools/music-lab',
        permanent: false,
      },
      {
        source: '/musiclab',
        destination: '/tools/music-lab',
        permanent: false,
      },
      {
        source: '/gamelab',
        destination: '/tools/game-lab',
        permanent: false,
      },
      {
        source: '/educate/gamelab',
        destination: '/tools/game-lab',
        permanent: false,
      },
      {
        source: '/tools/applab',
        destination: '/tools/app-lab',
        permanent: false,
      },
      {
        source: '/educate/applab',
        destination: '/tools/app-lab',
        permanent: false,
      },
      {
        source: '/applab',
        destination: '/tools/app-lab',
        permanent: false,
      },
      {
        source: '/widgets',
        destination: '/tools',
        permanent: false,
      },
      {
        source: '/project-ideas',
        destination: '/tools',
        permanent: false,
      },
      {
        source: '/educate/csp/widgets',
        destination: '/tools',
        permanent: false,
      },
      {
        source: '/tos',
        destination: '/terms-of-service',
        permanent: false,
      },
      {
        source: '/teach',
        destination: '/teachers',
        permanent: false,
      },
      {
        source: '/educate/resources/index',
        destination: '/teachers',
        permanent: false,
      },
      {
        source: '/educate/curriculum/values',
        destination: '/teachers',
        permanent: false,
      },
      {
        source: '/curriculum/values',
        destination: '/teachers',
        permanent: false,
      },
      {
        source: '/circuitplayground',
        destination: '/teachers',
        permanent: false,
      },
      {
        source: '/beyond/scholarships',
        destination: '/students/scholarships',
        permanent: false,
      },
      {
        source: '/pluralsight',
        destination: '/students/online-courses',
        permanent: false,
      },
      {
        source: '/educate/curriculum/3rd-party',
        destination: '/students/online-courses',
        permanent: false,
      },
      {
        source: '/curriculum/3rd-party',
        destination: '/students/online-courses',
        permanent: false,
      },
      {
        source: '/beyond/mentors-and-community',
        destination: '/students/mentorships',
        permanent: false,
      },
      {
        source: '/beyond/internships',
        destination: '/students/internships-and-apprenticeships',
        permanent: false,
      },
      {
        source: '/beyond/extracurricular',
        destination: '/students/extracurricular-opportunities',
        permanent: false,
      },
      {
        source: '/student/elementary',
        destination: '/students/elementary',
        permanent: false,
      },
      {
        source: '/student/university',
        destination: '/students/careers-in-computer-science',
        permanent: false,
      },
      {
        source: '/student/hsgrads',
        destination: '/students/careers-in-computer-science',
        permanent: false,
      },
      {
        source: '/student/beyondk12',
        destination: '/students/careers-in-computer-science',
        permanent: false,
      },
      {
        source: '/csjourneys/pastchats',
        destination: '/students/careers-in-computer-science',
        permanent: false,
      },
      {
        source: '/csjourneys/nextsteps',
        destination: '/students/careers-in-computer-science',
        permanent: false,
      },
      {
        source: '/csjourneys/myjourneychats',
        destination: '/students/careers-in-computer-science',
        permanent: false,
      },
      {
        source: '/csjourneys/index',
        destination: '/students/careers-in-computer-science',
        permanent: false,
      },
      {
        source: '/csjourneys/engage-parents',
        destination: '/students/careers-in-computer-science',
        permanent: false,
      },
      {
        source: '/csjourneys/csadventures',
        destination: '/students/careers-in-computer-science',
        permanent: false,
      },
      {
        source: '/csjourneys/cs-in-college',
        destination: '/students/careers-in-computer-science',
        permanent: false,
      },
      {
        source: '/careers-with-cs/k5',
        destination: '/students/careers-in-computer-science',
        permanent: false,
      },
      {
        source: '/careers-with-cs/index',
        destination: '/students/careers-in-computer-science',
        permanent: false,
      },
      {
        source: '/careers',
        destination: '/students/careers-in-computer-science',
        permanent: false,
      },
      {
        source: '/beyond/extended-learning',
        destination: '/students/careers-in-computer-science',
        permanent: false,
      },
      {
        source: '/beyond/',
        destination: '/students/careers-in-computer-science',
        permanent: false,
      },
      {
        source: '/videos',
        destination: '/resources/videos',
        permanent: false,
      },
      {
        source: '/educate/resources/videos',
        destination: '/resources/videos',
        permanent: false,
      },
      {
        source: '/quotes',
        destination: '/resources/classroom-posters',
        permanent: false,
      },
      {
        source: '/educate/resources/posters',
        destination: '/resources/classroom-posters',
        permanent: false,
      },
      {
        source: '/stats',
        destination: '/promote-computer-science',
        permanent: false,
      },
      {
        source: '/statistics',
        destination: '/promote-computer-science',
        permanent: false,
      },
      {
        source: '/promote/thanks',
        destination: '/promote-computer-science',
        permanent: false,
      },
      {
        source: '/promote/morestats',
        destination: '/promote-computer-science',
        permanent: false,
      },
      {
        source: '/promote',
        destination: '/promote-computer-science',
        permanent: false,
      },
      {
        source: '/professional-learning/self-paced',
        destination: '/professional-learning/self-paced-courses',
        permanent: false,
      },
      {
        source: '/online-pl',
        destination: '/professional-learning/self-paced-courses',
        permanent: false,
      },
      {
        source: '/educate/professional-development-online',
        destination: '/professional-learning/self-paced-courses',
        permanent: false,
      },
      {
        source: '/educate/regional-partner/partners',
        destination: '/professional-learning/regional-partner-program',
        permanent: false,
      },
      {
        source: '/educate/regional-partner/index',
        destination: '/professional-learning/regional-partner-program',
        permanent: false,
      },
      {
        source: '/educate/professional-learning/about-partners',
        destination: '/professional-learning/regional-partner-program',
        permanent: false,
      },
      {
        source: '/educate/professional-learning-partner',
        destination: '/professional-learning/regional-partner-program',
        permanent: false,
      },
      {
        source: '/ai101',
        destination: '/professional-learning/artificial-intelligence-101',
        permanent: false,
      },
      {
        source: '/ai/pl/101',
        destination: '/professional-learning/artificial-intelligence-101',
        permanent: false,
      },
      {
        source: '/professional-learning/values',
        destination: '/professional-learning',
        permanent: false,
      },
      {
        source: '/professional-learning/facilitator',
        destination: '/professional-learning',
        permanent: false,
      },
      {
        source: '/pd',
        destination: '/professional-learning',
        permanent: false,
      },
      {
        source: '/educate/professional-learning/values',
        destination: '/professional-learning',
        permanent: false,
      },
      {
        source: '/educate/professional-learning/program-information',
        destination: '/professional-learning',
        permanent: false,
      },
      {
        source: '/educate/professional-learning/facilitator',
        destination: '/professional-learning',
        permanent: false,
      },
      {
        source: '/educate/professional-learning/cs-fundamentals-facilitator',
        destination: '/professional-learning',
        permanent: false,
      },
      {
        source: '/educate/professional-learning',
        destination: '/professional-learning',
        permanent: false,
      },
      {
        source: '/educate/professional-development-philosophy',
        destination: '/professional-learning',
        permanent: false,
      },
      {
        source: '/educate/professional-development',
        destination: '/professional-learning',
        permanent: false,
      },
      {
        source: '/educate/pd',
        destination: '/professional-learning',
        permanent: false,
      },
      {
        source: '/privacy/dpa/ny',
        destination: '/privacy/data-privacy-addendum-new-york',
        permanent: false,
      },
      {
        source: '/dpa-ny',
        destination: '/privacy/data-privacy-addendum-new-york',
        permanent: false,
      },
      {
        source: '/privacy/dpa/mt',
        destination: '/privacy/data-privacy-addendum-montana',
        permanent: false,
      },
      {
        source: '/dpa-mt',
        destination: '/privacy/data-privacy-addendum-montana',
        permanent: false,
      },
      {
        source: '/privacy/dpa/il',
        destination: '/privacy/data-privacy-addendum-illinois',
        permanent: false,
      },
      {
        source: '/dpa-il',
        destination: '/privacy/data-privacy-addendum-illinois',
        permanent: false,
      },
      {
        source: '/privacy/dpa',
        destination: '/privacy/data-privacy-addendum',
        permanent: false,
      },
      {
        source: '/educate/district/agreement',
        destination: '/privacy/data-privacy-addendum',
        permanent: false,
      },
      {
        source: '/dpa',
        destination: '/privacy/data-privacy-addendum',
        permanent: false,
      },
      {
        source: '/cookies',
        destination: '/privacy/cookies',
        permanent: false,
      },
      {
        source: '/privacy/student-privacy-csp',
        destination: '/privacy',
        permanent: false,
      },
      {
        source: '/privacy/student-privacy-csd',
        destination: '/privacy',
        permanent: false,
      },
      {
        source: '/privacy/student-privacy',
        destination: '/privacy',
        permanent: false,
      },
      {
        source: '/privacy/sept2020',
        destination: '/privacy',
        permanent: false,
      },
      {
        source: '/privacy/oct2022',
        destination: '/privacy',
        permanent: false,
      },
      {
        source: '/privacy/nov2021',
        destination: '/privacy',
        permanent: false,
      },
      {
        source: '/privacy/may2018',
        destination: '/privacy',
        permanent: false,
      },
      {
        source: '/privacy/mar2021',
        destination: '/privacy',
        permanent: false,
      },
      {
        source: '/privacy/jun2023',
        destination: '/privacy',
        permanent: false,
      },
      {
        source: '/privacy/jul2021',
        destination: '/privacy',
        permanent: false,
      },
      {
        source: '/privacy/dec2022',
        destination: '/privacy',
        permanent: false,
      },
      {
        source: '/privacy/dec2014',
        destination: '/privacy',
        permanent: false,
      },
      {
        source: '/privacy/apr2018',
        destination: '/privacy',
        permanent: false,
      },
      {
        source: '/privacy/apr2016',
        destination: '/privacy',
        permanent: false,
      },
      {
        source: '/privacy-sep2020',
        destination: '/privacy',
        permanent: false,
      },
      {
        source: '/privacy-oct2022',
        destination: '/privacy',
        permanent: false,
      },
      {
        source: '/privacy-nov2021',
        destination: '/privacy',
        permanent: false,
      },
      {
        source: '/privacy-may2018',
        destination: '/privacy',
        permanent: false,
      },
      {
        source: '/privacy-mar2021',
        destination: '/privacy',
        permanent: false,
      },
      {
        source: '/privacy-letter',
        destination: '/privacy',
        permanent: false,
      },
      {
        source: '/privacy-jun2023',
        destination: '/privacy',
        permanent: false,
      },
      {
        source: '/privacy-jul2021',
        destination: '/privacy',
        permanent: false,
      },
      {
        source: '/privacy-dec2022',
        destination: '/privacy',
        permanent: false,
      },
      {
        source: '/privacy_letter',
        destination: '/privacy',
        permanent: false,
      },
      {
        source: '/emailprivacy',
        destination: '/privacy',
        permanent: false,
      },
      {
        source: '/athome',
        destination: '/parents',
        permanent: false,
      },
      {
        source: '/alternative-classrooms',
        destination: '/parents',
        permanent: false,
      },
      {
        source: '/naipi',
        destination: '/native-american-and-indigenous-peoples-initiative',
        permanent: false,
      },
      {
        source: '/student/middle-high',
        destination: '/middle-and-high-school-students',
        permanent: false,
      },
      {
        source: '/lms',
        destination: '/learning-management-systems',
        permanent: false,
      },
      {
        source: '/lms/schoology',
        destination: '/integration-with-schoology',
        permanent: false,
      },
      {
        source: '/lms/canvas',
        destination: '/integration-with-canvas',
        permanent: false,
      },
      {
        source: '/transformersone',
        destination: '/hour-of-code/transformersone',
        permanent: false,
      },
      {
        source: '/starwars',
        destination: '/hour-of-code/starwars',
        permanent: false,
      },
      {
        source: '/star-wars-announcement',
        destination: '/hour-of-code/starwars',
        permanent: false,
      },
      {
        source: '/star',
        destination: '/hour-of-code/starwars',
        permanent: false,
      },
      {
        source: '/poetry',
        destination: '/hour-of-code/poetry',
        permanent: false,
      },
      {
        source: '/music',
        destination: '/hour-of-code/music',
        permanent: false,
      },
      {
        source: '/Minecraft',
        destination: '/hour-of-code/minecraft',
        permanent: false,
      },
      {
        source: '/minecraft',
        destination: '/hour-of-code/minecraft',
        permanent: false,
      },
      {
        source: '/mc',
        destination: '/hour-of-code/minecraft',
        permanent: false,
      },
      {
        source: '/helloworld',
        destination: '/hour-of-code/helloworld',
        permanent: false,
      },
      {
        source: '/dance',
        destination: '/hour-of-code/dance',
        permanent: false,
      },
      {
        source: '/Dance',
        destination: '/hour-of-code/dance',
        permanent: false,
      },
      {
        source: '/hourofcode2022',
        destination: '/hour-of-code/',
        permanent: false,
      },
      {
        source: '/hourofcode',
        destination: '/hour-of-code/',
        permanent: false,
      },
      {
        source: '/codebytes',
        destination: '/hour-of-code/',
        permanent: false,
      },
      {
        source: '/startrek',
        destination: '/donate',
        permanent: false,
      },
      {
        source: '/matching-gifts',
        destination: '/donate',
        permanent: false,
      },
      {
        source: '/help',
        destination: '/donate',
        permanent: false,
      },
      {
        source: '/donate/amazon',
        destination: '/donate',
        permanent: false,
      },
      {
        source: '/educate/district/terms',
        destination: '/districts',
        permanent: false,
      },
      {
        source: '/educate/district/qualify',
        destination: '/districts',
        permanent: false,
      },
      {
        source: '/educate/district/k5-partnership',
        destination: '/districts',
        permanent: false,
      },
      {
        source: '/educate/district/interest-form',
        destination: '/districts',
        permanent: false,
      },
      {
        source: '/district-partner',
        destination: '/districts',
        permanent: false,
      },
      {
        source: '/district',
        destination: '/districts',
        permanent: false,
      },
      {
        source: '/educate/district/partners',
        destination: '/districts/partners',
        permanent: false,
      },
      {
        source: '/educate/curriculum/middle-school',
        destination: '/curriculum/middle-school',
        permanent: false,
      },
      {
        source: '/maker/pick-a-device',
        destination: '/curriculum/maker',
        permanent: false,
      },
      {
        source: '/maker/microbit',
        destination: '/curriculum/maker',
        permanent: false,
      },
      {
        source: '/maker/csf-microbit',
        destination: '/curriculum/maker',
        permanent: false,
      },
      {
        source: '/maker/circuitplayground',
        destination: '/curriculum/maker',
        permanent: false,
      },
      {
        source: '/maker',
        destination: '/curriculum/maker',
        permanent: false,
      },
      {
        source: '/curriculum/how-ai-works',
        destination: '/curriculum/how-artificial-intelligence-works',
        permanent: false,
      },
      {
        source: '/ai/how-ai-works',
        destination: '/curriculum/how-artificial-intelligence-works',
        permanent: false,
      },
      {
        source: '/highschool',
        destination: '/curriculum/high-school',
        permanent: false,
      },
      {
        source: '/educate/curriculum/high-school',
        destination: '/curriculum/high-school',
        permanent: false,
      },
      {
        source: '/curriculum/generative-ai',
        destination: '/curriculum/exploring-generative-artificial-intelligence',
        permanent: false,
      },
      {
        source: '/k5',
        destination: '/curriculum/elementary-school',
        permanent: false,
      },
      {
        source: '/educate/curriculum/elementary-school',
        destination: '/curriculum/elementary-school',
        permanent: false,
      },
      {
        source: '/educate/curriculum/cs-fundamentals-international',
        destination: '/curriculum/elementary-school',
        permanent: false,
      },
      {
        source: '/educate/csp/unit6',
        destination: '/curriculum/computer-science-principles',
        permanent: false,
      },
      {
        source: '/educate/csp/unit5',
        destination: '/curriculum/computer-science-principles',
        permanent: false,
      },
      {
        source: '/educate/csp/unit4',
        destination: '/curriculum/computer-science-principles',
        permanent: false,
      },
      {
        source: '/educate/csp/unit3',
        destination: '/curriculum/computer-science-principles',
        permanent: false,
      },
      {
        source: '/educate/csp/unit2',
        destination: '/curriculum/computer-science-principles',
        permanent: false,
      },
      {
        source: '/educate/csp/unit1',
        destination: '/curriculum/computer-science-principles',
        permanent: false,
      },
      {
        source: '/educate/csp',
        destination: '/curriculum/computer-science-principles',
        permanent: false,
      },
      {
        source: '/curriculum/csp',
        destination: '/curriculum/computer-science-principles',
        permanent: false,
      },
      {
        source: '/csp',
        destination: '/curriculum/computer-science-principles',
        permanent: false,
      },
      {
        source: '/cps',
        destination: '/curriculum/computer-science-principles',
        permanent: false,
      },
      {
        source: '/educate/curriculum/csf',
        destination: '/curriculum/computer-science-fundamentals',
        permanent: false,
      },
      {
        source: '/educate/csf',
        destination: '/curriculum/computer-science-fundamentals',
        permanent: false,
      },
      {
        source: '/curriculum/csf',
        destination: '/curriculum/computer-science-fundamentals',
        permanent: false,
      },
      {
        source: '/csf',
        destination: '/curriculum/computer-science-fundamentals',
        permanent: false,
      },
      {
        source: '/educate/csd/index',
        destination: '/curriculum/computer-science-discoveries',
        permanent: false,
      },
      {
        source: '/curriculum/csd',
        destination: '/curriculum/computer-science-discoveries',
        permanent: false,
      },
      {
        source: '/csd',
        destination: '/curriculum/computer-science-discoveries',
        permanent: false,
      },
      {
        source: '/educate/csc',
        destination: '/curriculum/computer-science-connections',
        permanent: false,
      },
      {
        source: '/curriculum/csc',
        destination: '/curriculum/computer-science-connections',
        permanent: false,
      },
      {
        source: '/csc',
        destination: '/curriculum/computer-science-connections',
        permanent: false,
      },
      {
        source: '/educate/curriculum/apcsa',
        destination: '/curriculum/computer-science-a',
        permanent: false,
      },
      {
        source: '/educate/curriculum/3rd-party/apcsa',
        destination: '/curriculum/computer-science-a',
        permanent: false,
      },
      {
        source: '/educate/csa',
        destination: '/curriculum/computer-science-a',
        permanent: false,
      },
      {
        source: '/curriculum/csa',
        destination: '/curriculum/computer-science-a',
        permanent: false,
      },
      {
        source: '/csa',
        destination: '/curriculum/computer-science-a',
        permanent: false,
      },
      {
        source: '/curriculum/coding-with-ai',
        destination: '/curriculum/coding-with-artificial-intelligence',
        permanent: false,
      },
      {
        source: '/blockchain',
        destination: '/curriculum/blockchain',
        permanent: false,
      },
      {
        source: '/curriculum/cs-ai-foundations',
        destination: '/curriculum/artifical-intelligence-foundations',
        permanent: false,
      },
      {
        source: '/promote/ap',
        destination: '/computer-science-advanced-placement-data',
        permanent: false,
      },
      {
        source: '/ap',
        destination: '/computer-science-advanced-placement-data',
        permanent: false,
      },
      {
        source: '/advocacy/state-of-cs/2023_state_of_cs.pdf',
        destination: '/assets/advocacy/stateofcs/2023_state_of_cs.pdf',
        permanent: false,
      },
      {
        source: '/ai/teaching-assistant',
        destination: '/artificial-intelligence/teaching-assistant',
        permanent: false,
      },
      {
        source: '/ai-ta',
        destination: '/artificial-intelligence/teaching-assistant',
        permanent: false,
      },
      {
        source: '/aivideos',
        destination: '/artifical-intelligencei',
        permanent: false,
      },
      {
        source: '/ethical-ai-panel',
        destination: '/artifical-intelligence',
        permanent: false,
      },
      {
        source: '/ai',
        destination: '/artifical-intelligence',
        permanent: false,
      },
      {
        source: '/educate/partner/district-partners',
        destination: '/administrators',
        permanent: false,
      },
      {
        source: '/partners',
        destination: '/about/partners',
        permanent: false,
      },
      {
        source: '/educate/it',
        destination: '/about/it-requirements',
        permanent: false,
      },
      {
        source: '/about/hear-from-us',
        destination: '/about/hear-from-code',
        permanent: false,
      },
      {
        source: '/promote/diversitydata',
        destination: '/about/diversity',
        permanent: false,
      },
      {
        source: '/diversity',
        destination: '/about/diversity',
        permanent: false,
      },
      {
        source: '/blackhistorymonth',
        destination: '/about/diversity',
        permanent: false,
      },
      {
        source: '/commitment',
        destination: '/about/code-org-free-curriculum-commitment',
        permanent: false,
      },
      {
        source: '/about/jobs',
        destination: '/about/careers',
        permanent: false,
      },
      {
        source: '/accessibility',
        destination: '/about/accessibility',
        permanent: false,
      },
      {
        source: '/international/about',
        destination: 'https://global.code.org',
        permanent: false,
      },
      {
        source: '/about/index',
        destination: '/about',
        permanent: false,
      },
      {
        source: '/mobile',
        destination: '/',
        permanent: false,
      },
      {
        source: '/https/mixed-content',
        destination: '/',
        permanent: false,
      },
      {
        source: '/donate/crypto',
        destination: 'https://bitpay.com/909718/donate',
        permanent: false,
      },
      {
        source: '/advocacy/state-facts/index',
        destination: 'https://advocacy.code.org/stateofcs/',
        permanent: false,
      },
      {
        source: '/yourschool/accessreport',
        destination: 'https://advocacy.code.org/report-data/',
        permanent: false,
      },
      {
        source: '/advocacy/',
        destination: 'https://advocacy.code.org',
        permanent: false,
      },
      {
        source: '/action/make-cs-count',
        destination: 'https://advocacy.code.org',
        permanent: false,
      },
      {
        source: '/about/geocode_test',
        destination: '/',
        permanent: false,
      },
      {
        source: '/about/evaluation/summary',
        destination: '/about',
        permanent: false,
      },
      {
        source: '/about/evaluation/proficiency2016',
        destination: '/about',
        permanent: false,
      },
      {
        source: '/about/evaluation/proficiency',
        destination: '/about',
        permanent: false,
      },
      {
        source: '/about/evaluation/pd',
        destination: '/about',
        permanent: false,
      },
      {
        source: '/about/evaluation/partners',
        destination: '/about',
        permanent: false,
      },
      {
        source: '/about/evaluation/outcomes',
        destination: '/about',
        permanent: false,
      },
      {
        source: '/about/evaluation/learning',
        destination: '/about',
        permanent: false,
      },
      {
        source: '/about/evaluation/hourofcode',
        destination: '/about',
        permanent: false,
      },
      {
        source: '/about/evaluation/costs',
        destination: '/about',
        permanent: false,
      },
      {
        source: '/about/evaluation',
        destination: '/about',
        permanent: false,
      },
      {
        source: '/about/education-leadership-council',
        destination: '/about/leadership',
        permanent: false,
      },
      {
        source: '/about/donors',
        destination: '/about/supporters',
        permanent: false,
      },
      {
        source: '/about/donation-policy',
        destination: '/donate/policy',
        permanent: false,
      },
      {
        source: '/about/2023',
        destination: '/about/annual-report',
        permanent: false,
      },
      {
        source: '/about/2022',
        destination: '/about/annual-report',
        permanent: false,
      },
      {
        source: '/about/2021',
        destination: '/about/annual-report',
        permanent: false,
      },
      {
        source: '/about/2020',
        destination: '/about/annual-report',
        permanent: false,
      },
      {
        source: '/about/2019',
        destination: '/about/annual-report',
        permanent: false,
      },
      {
        source: '/about/2018',
        destination: '/about/annual-report',
        permanent: false,
      },
      {
        source: '/about/2017',
        destination: '/about/annual-report',
        permanent: false,
      },
      {
        source: '/about/2016',
        destination: '/about/annual-report',
        permanent: false,
      },
      {
        source: '/about/2015',
        destination: '/about/annual-report',
        permanent: false,
      },
      {
        source: '/about/2014',
        destination: '/about/annual-report',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
