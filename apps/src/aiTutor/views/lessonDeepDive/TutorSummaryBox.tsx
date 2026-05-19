import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import React, {FC} from 'react';

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
    color: '#fff',
  },
  heading: {
    fontFamily: 'var(--font-family-barlow-semi-condensed-semibold)',
    fontSize: 'clamp(2rem, 8vw, 4rem)',
    fontWeight: 800,
    lineHeight: 1.05,
    color: '#fff',
    margin: 0,
    maxWidth: '560px',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: 'auto',
  },
  continueButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    border: 'none',
    borderRadius: '4px',
    background: '#9657c7',
    color: '#fff',
    fontSize: '1.25rem',
    fontWeight: 600,
    cursor: 'pointer',
    textDecoration: 'none',
  },
};

interface TutorSummaryBoxProps {
  nextLessonUrl: string | null;
}

const TutorSummaryBox: FC<TutorSummaryBoxProps> = ({nextLessonUrl}) => (
  <div style={styles.container}>
    <h2 style={styles.heading}>Awesome session. 🎉</h2>
    {nextLessonUrl && (
      <div style={styles.footer}>
        <a href={nextLessonUrl} style={styles.continueButton}>
          Next lesson
          <FontAwesomeV6Icon iconName="arrow-right" />
        </a>
      </div>
    )}
  </div>
);

export default TutorSummaryBox;
