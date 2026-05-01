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
    fontSize: '0.95rem',
    color: 'rgba(255,255,255,0.5)',
    marginTop: 'auto',
  },
};

const TutorSummaryBox: FC = () => (
  <div style={styles.container}>
    <h2 style={styles.heading}>
      Nice session. Here&apos;s where you ended up.
    </h2>
    <p style={styles.footer}>
      Next time: you still have more objectives to explore.
    </p>
  </div>
);

export default TutorSummaryBox;
