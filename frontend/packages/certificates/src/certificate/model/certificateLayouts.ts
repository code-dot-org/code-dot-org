import type {
  CertificateCourseInfo,
  CertificateParams,
} from './certificateTypes';

export interface CertificateTextLayout {
  boxHeight: number;
  boxWidth: number;
  color: string;
  fontSize: number;
  xOffset: number;
  yOffset: number;
}

export interface CertificateTwoTitleLayout {
  courseTitleWidth: number;
  unitFontSize: number;
  unitGroupFontSize: number;
  unitGroupHeight: number;
  unitGroupWidth?: number;
  unitGroupXOffset: number;
  unitGroupYOffset: number;
  unitHeight: number;
  unitWidth?: number;
  unitXOffset: number;
  unitYOffset: number;
}

export interface CertificateTemplateLayout {
  donorTextYOffset?: number;
  hours?: CertificateTextLayout;
  kind: 'blank' | 'prefilled' | 'pl';
  name: CertificateTextLayout;
  nativeHeight: number;
  nativeWidth: number;
  oneTitle?: CertificateTextLayout;
  prefilledCourseNameYOffset?: number;
  twoTitles?: CertificateTwoTitleLayout;
}

const prefilledTemplateLayout: CertificateTemplateLayout = {
  kind: 'prefilled',
  name: {
    boxHeight: 80,
    boxWidth: 900,
    color: '#575757',
    // certificate_image.rb:27 pointsize
    fontSize: 68,
    xOffset: 0,
    yOffset: -120,
  },
  nativeHeight: 1235,
  nativeWidth: 1754,
  prefilledCourseNameYOffset: -125,
};

export const certificateTemplateLayouts: Record<
  string,
  CertificateTemplateLayout
> = {
  'MC_Hour_Of_AI_Certificate_First_Night.png': prefilledTemplateLayout,
  'MC_Hour_Of_Code_Certificate.png': prefilledTemplateLayout,
  'MC_Hour_Of_Code_Certificate_Aquatic.png': prefilledTemplateLayout,
  'MC_Hour_Of_Code_Certificate_Generation_Ai.png': prefilledTemplateLayout,
  'MC_Hour_Of_Code_Certificate_Hero.png': prefilledTemplateLayout,
  'MC_Hour_Of_Code_Certificate_Show.png': prefilledTemplateLayout,
  'MC_Hour_Of_Code_Certificate_mee.png': prefilledTemplateLayout,
  'MC_Hour_Of_Code_Certificate_mee_empathy.png': prefilledTemplateLayout,
  'MC_Hour_Of_Code_Certificate_mee_estate.png': prefilledTemplateLayout,
  'MC_Hour_Of_Code_Certificate_mee_timecraft.png': prefilledTemplateLayout,
  'blank_certificate.png': {
    donorTextYOffset: 447,
    kind: 'blank',
    name: {
      boxHeight: 80,
      boxWidth: 900,
      color: 'rgb(118,101,160)',
      fontSize: 75,
      xOffset: 0,
      yOffset: -135,
    },
    nativeHeight: 1240,
    nativeWidth: 1754,
    oneTitle: {
      boxHeight: 60,
      boxWidth: 1754,
      color: 'rgb(29,173,186)',
      fontSize: 47,
      xOffset: 0,
      yOffset: 15,
    },
    twoTitles: {
      courseTitleWidth: 1754,
      unitFontSize: 32,
      unitGroupFontSize: 40,
      unitGroupHeight: 50,
      unitGroupWidth: 1000,
      unitGroupXOffset: 0,
      unitGroupYOffset: 0,
      unitHeight: 40,
      unitWidth: 800,
      unitXOffset: 0,
      unitYOffset: 47,
    },
  },
  'hour_of_ai_certificate.png': prefilledTemplateLayout,
  'mix_move_hour_of_ai_certificate.png': prefilledTemplateLayout,
  'music_hoc_certificate.png': prefilledTemplateLayout,
  'oceans_hoc_certificate.png': prefilledTemplateLayout,
  'self_paced_pl_certificate.png': {
    donorTextYOffset: 611,
    hours: {
      boxHeight: 30,
      boxWidth: 80,
      color: 'rgb(87,87,87)',
      fontSize: 30,
      xOffset: -248,
      yOffset: 124,
    },
    kind: 'pl',
    name: {
      boxHeight: 70,
      boxWidth: 900,
      color: 'rgb(118,101,160)',
      fontSize: 62,
      xOffset: 0,
      yOffset: -248,
    },
    nativeHeight: 1786,
    nativeWidth: 2526,
    oneTitle: {
      boxHeight: 171,
      boxWidth: 1400,
      color: 'rgb(29,173,186)',
      fontSize: 62,
      xOffset: 0,
      yOffset: 0,
    },
    twoTitles: {
      courseTitleWidth: 1400,
      unitFontSize: 57,
      unitGroupFontSize: 62,
      unitGroupHeight: 85,
      unitGroupXOffset: 0,
      unitGroupYOffset: -57,
      unitHeight: 71,
      unitXOffset: 0,
      unitYOffset: 36,
    },
  },
};

export interface PositionedTextLayout extends CertificateTextLayout {
  centerX: number;
  centerY: number;
  top: number;
  left: number;
}

export function resolveTemplateLayout(
  templateFilename: string,
): CertificateTemplateLayout {
  const layout = certificateTemplateLayouts[templateFilename];

  if (!layout) {
    throw new Error(`No certificate layout for template ${templateFilename}`);
  }

  return layout;
}

export function resolveNameLayout(
  templateFilename: string,
  params: Pick<CertificateParams, 'course'>,
): CertificateTextLayout {
  const layout = resolveTemplateLayout(templateFilename);

  if (
    layout.kind === 'prefilled' &&
    params.course === '20-hour' &&
    layout.prefilledCourseNameYOffset !== undefined
  ) {
    return {...layout.name, yOffset: layout.prefilledCourseNameYOffset};
  }

  return layout.name;
}

export function resolveTitleLayouts(courseInfo: CertificateCourseInfo): {
  oneTitle?: CertificateTextLayout;
  twoTitles?: CertificateTwoTitleLayout;
} {
  const layout = resolveTemplateLayout(courseInfo.templateFilename);

  return {
    oneTitle: layout.oneTitle,
    twoTitles: layout.twoTitles,
  };
}

export function positionTextLayout(
  templateFilename: string,
  textLayout: CertificateTextLayout,
): PositionedTextLayout {
  const templateLayout = resolveTemplateLayout(templateFilename);
  const centerX = templateLayout.nativeWidth / 2 + textLayout.xOffset;
  const centerY = templateLayout.nativeHeight / 2 + textLayout.yOffset;

  return {
    ...textLayout,
    centerX,
    centerY,
    left: centerX - textLayout.boxWidth / 2,
    top: centerY - textLayout.boxHeight / 2,
  };
}
