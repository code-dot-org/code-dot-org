import {
  certificateTemplateLayouts,
  positionTextLayout,
  resolveNameLayout,
} from '../layout';

it('contains every currently emitted template filename', () => {
  expect(Object.keys(certificateTemplateLayouts).sort()).toEqual([
    'MC_Hour_Of_AI_Certificate_First_Night.png',
    'MC_Hour_Of_Code_Certificate.png',
    'MC_Hour_Of_Code_Certificate_Aquatic.png',
    'MC_Hour_Of_Code_Certificate_Generation_Ai.png',
    'MC_Hour_Of_Code_Certificate_Hero.png',
    'MC_Hour_Of_Code_Certificate_Show.png',
    'MC_Hour_Of_Code_Certificate_mee.png',
    'MC_Hour_Of_Code_Certificate_mee_empathy.png',
    'MC_Hour_Of_Code_Certificate_mee_estate.png',
    'MC_Hour_Of_Code_Certificate_mee_timecraft.png',
    'blank_certificate.png',
    'hour_of_ai_certificate.png',
    'mix_move_hour_of_ai_certificate.png',
    'music_hoc_certificate.png',
    'oceans_hoc_certificate.png',
    'self_paced_pl_certificate.png',
  ]);
});

it('transcribes the blank certificate constants', () => {
  expect(certificateTemplateLayouts['blank_certificate.png']).toMatchObject({
    kind: 'blank',
    name: {
      boxHeight: 80,
      boxWidth: 900,
      fontSize: 75,
      xOffset: 0,
      yOffset: -135,
    },
    nativeHeight: 1240,
    nativeWidth: 1754,
    oneTitle: {
      boxHeight: 60,
      boxWidth: 1754,
      fontSize: 47,
      xOffset: 0,
      yOffset: 15,
    },
  });
});

it('applies the 20-hour prefilled title offset override', () => {
  expect(
    resolveNameLayout('hour_of_ai_certificate.png', {course: '20-hour'})
      .yOffset,
  ).toBe(-125);
  expect(
    resolveNameLayout('hour_of_ai_certificate.png', {course: 'oceans'}).yOffset,
  ).toBe(-120);
});

it('positions offsets relative to the image center', () => {
  expect(
    positionTextLayout('hour_of_ai_certificate.png', {
      boxHeight: 80,
      boxWidth: 900,
      color: '#575757',
      fontSize: 68,
      xOffset: 0,
      yOffset: -125,
    }),
  ).toMatchObject({
    centerX: 877,
    centerY: 492.5,
    left: 427,
    top: 452.5,
  });
});
