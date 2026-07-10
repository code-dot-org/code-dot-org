import {
  positionTextLayout,
  resolveNameLayout,
  resolveTemplateLayout,
  resolveTitleLayouts,
  type PositionedTextLayout,
} from '@/layout';
import type {CertificateCourseInfo, CertificateParams} from '@/lib/types';

export interface CertificateRenderableText extends PositionedTextLayout {
  id: string;
  notranslate: boolean;
  text: string;
}

export function formatCertificateDuration(durationHours: number): string {
  return `${durationHours}`.replace(/\.0$/, '');
}

function buildRenderableText(
  id: string,
  text: string | undefined,
  layout?: PositionedTextLayout,
  notranslate = false,
): CertificateRenderableText | null {
  if (!text || !layout) {
    return null;
  }

  return {
    ...layout,
    id,
    notranslate,
    text,
  };
}

export function resolveCertificateRenderableTexts(
  courseInfo: CertificateCourseInfo,
  params: CertificateParams,
): CertificateRenderableText[] {
  const templateLayout = resolveTemplateLayout(courseInfo.templateFilename);
  const titleLayouts = resolveTitleLayouts(courseInfo);
  const renderableTexts: Array<CertificateRenderableText | null> = [];
  const showTwoTitles =
    !!courseInfo.unitGroupTitle &&
    !!titleLayouts.twoTitles &&
    templateLayout.kind !== 'prefilled';

  renderableTexts.push(
    buildRenderableText(
      'name',
      params.name,
      positionTextLayout(
        courseInfo.templateFilename,
        resolveNameLayout(courseInfo.templateFilename, params),
      ),
      true,
    ),
  );

  if (!courseInfo.prefilledTitle && !showTwoTitles && titleLayouts.oneTitle) {
    renderableTexts.push(
      buildRenderableText(
        'title',
        courseInfo.localizedTitle,
        positionTextLayout(courseInfo.templateFilename, titleLayouts.oneTitle),
      ),
    );
  }

  if (!courseInfo.prefilledTitle && showTwoTitles && titleLayouts.twoTitles) {
    renderableTexts.push(
      buildRenderableText(
        'unit-group-title',
        courseInfo.unitGroupTitle || undefined,
        positionTextLayout(courseInfo.templateFilename, {
          boxHeight: titleLayouts.twoTitles.unitGroupHeight,
          boxWidth: titleLayouts.twoTitles.courseTitleWidth,
          color: 'rgb(29,173,186)',
          fontSize: titleLayouts.twoTitles.unitGroupFontSize,
          xOffset: titleLayouts.twoTitles.unitGroupXOffset,
          yOffset: titleLayouts.twoTitles.unitGroupYOffset,
        }),
      ),
      buildRenderableText(
        'unit-title',
        courseInfo.localizedTitle,
        positionTextLayout(courseInfo.templateFilename, {
          boxHeight: titleLayouts.twoTitles.unitHeight,
          boxWidth: titleLayouts.twoTitles.courseTitleWidth,
          color: 'rgb(29,173,186)',
          fontSize: titleLayouts.twoTitles.unitFontSize,
          xOffset: titleLayouts.twoTitles.unitXOffset,
          yOffset: titleLayouts.twoTitles.unitYOffset,
        }),
      ),
    );
  }

  if (templateLayout.hours && courseInfo.durationHours) {
    renderableTexts.push(
      buildRenderableText(
        'duration-hours',
        formatCertificateDuration(courseInfo.durationHours),
        positionTextLayout(courseInfo.templateFilename, templateLayout.hours),
      ),
    );
  }

  return renderableTexts.filter(
    (renderableText): renderableText is CertificateRenderableText =>
      !!renderableText,
  );
}
