import React, {useMemo} from 'react';

import TeacherPanel from '@cdo/apps/code-studio/components/progress/teacherPanel/TeacherPanel';

import styles from './teacher-panel-screen.module.scss';

// TeacherPanel's pageType prop only accepts these three values.
type TeacherPanelPageType = 'level' | 'script_overview' | 'lesson_extras';
const VALID_PAGE_TYPES = new Set<string>([
  'level',
  'script_overview',
  'lesson_extras',
]);

interface TeacherPanelDataAttr {
  script_id: number;
  script_name: string;
  page_type: string;
  is_instructor: boolean;
}

function readTeacherPanelData(): TeacherPanelDataAttr | null {
  const el = document.querySelector<HTMLScriptElement>(
    'script[data-teacherpanel]'
  );
  if (!el?.dataset.teacherpanel) return null;
  try {
    return JSON.parse(el.dataset.teacherpanel) as TeacherPanelDataAttr;
  } catch {
    return null;
  }
}

// Safe to render TeacherPanel fresh here because _teacher_panel.js skips its
// own renderTeacherPanel when ta-teacher-panel is active, so this is the only
// instance. No duplicate SET_SECTIONS dispatch.
const TeacherPanelScreen: React.FC = () => {
  const data = useMemo(() => readTeacherPanelData(), []);

  if (!data) return null;

  const pageType = VALID_PAGE_TYPES.has(data.page_type)
    ? (data.page_type as TeacherPanelPageType)
    : undefined;

  return (
    <div className={styles.wrapper}>
      <TeacherPanel
        scriptId={data.script_id}
        unitName={data.script_name}
        pageType={pageType}
      />
    </div>
  );
};

export default TeacherPanelScreen;
