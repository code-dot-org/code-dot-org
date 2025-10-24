import {studio} from '@cdo/apps/lib/util/urlHelpers';

export const AI_TUTOR_LEGACY_LABS = ['applab', 'gamelab', 'weblab'];

export const PROJECT_EXAMPLES: Record<string, string[]> = {
  applab: [
    `[Choose Your Adventure](${studio(
      '/projects/applab/nI9iumSHbTn5mHBXl-wxMw/remix'
    )})`,
    `[Landmark Flashcards](${studio(
      '/projects/applab/sNZOTB_PiXAHt3Q5h_aRgQ/remix'
    )})`,
    `[Pensive Painter](${studio(
      '/projects/applab/IAK_Qyc23QrkAB61KGvn1g/remix'
    )})`,
    `[Pet Poll](${studio('/projects/applab/TjHfwdUd3ENlyImb7VX5Cg/remix')})`,
    `[Poke the Pig](${studio(
      '/projects/applab/r469vc1FFSOxOlUruTFlUA/remix'
    )})`,
    `[Slider Sketch](${studio(
      '/projects/applab/JNbplBXMisx2aMefUkh39g/remix'
    )})`,
  ],
  gamelab: [
    `[Bounce](${studio('/projects/gamelab/J2R-PHcvE4Wgb2xO2bjk0Q/remix')})`,
    `[Make Your Own Character](${studio(
      '/projects/gamelab/XVEFITms8-c7_F-ND-FKL8w3A-oEpFD_GKAJCB2VPCQ/remix'
    )})`,
    `[Sunset Shapes](${studio(
      '/projects/gamelab/Z9QRSmJBfNY25T3ViLp0MTy4uAuXNNXpZrmhPsUdEro/remix'
    )})`,
  ],
  weblab: [
    `[Catering website](${studio(
      '/projects/weblab/Z3m2fWClc10iTgxiLnOfTqZHApYrFXgx8YqgCwAvXvs/view'
    )})`,
    `[Photo Gallery](${studio(
      '/projects/weblab/kkb1upGQja7Hy4NAa72uQxwu87jDa_DO1aiav2Qhzk8/view'
    )})`,
  ],
};
