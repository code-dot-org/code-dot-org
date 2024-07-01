import colors from '@ml/oceans/styles/colors';

const styles = {
  body: {
    position: 'relative',
    width: '100%',
    paddingTop: '56.25%' // for 16:9
  },
  content: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%'
  },
  // Note that button fontSize and padding are currently set by surrounding HTML for
  // responsiveness.
  button: {
    cursor: 'pointer',
    backgroundColor: colors.white,
    color: colors.grey,
    fontSize: '100%',
    borderRadius: 8,
    minWidth: '15%',
    outline: 'none',
    border: 'none',
    whiteSpace: 'nowrap',
    lineHeight: 1.3
  },
  continueButton: {
    position: 'absolute',
    bottom: '2%',
    right: '1.2%',
    backgroundColor: colors.orange,
    color: colors.white
  },
  finishButton: {
    backgroundColor: colors.orange,
    color: colors.white,
    position: 'absolute',
    bottom: '2%',
    right: '1.2%'
  },
  playAgainButton: {
    backgroundColor: colors.yellowGreen,
    color: colors.white,
    position: 'absolute',
    bottom: '13.5%',
    right: '1.2%'
  },
  backButton: {
    position: 'absolute',
    bottom: '2%',
    left: '1.2%'
  },
  button2col: {
    width: '20%',
    marginLeft: '14%',
    marginRight: '14%',
    marginTop: '2%'
  },
  button3col: {
    width: '20%',
    marginLeft: '6%',
    marginRight: '6%',
    marginTop: '2%'
  },
  confirmationDialogBackground: {
    backgroundColor: colors.transparentBlack,
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: 10,
    zPosition: 1
  },
  confirmationDialog: {
    position: 'absolute',
    backgroundColor: colors.white,
    color: colors.darkGrey,
    transform: 'translate(-50%, -50%)',
    top: '50%',
    bottom: 'initial',
    left: '50%',
    padding: '2%',
    borderRadius: 8
  },
  confirmationDialogContent: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  confirmationDialogImg: {
    position: 'absolute',
    bottom: '-46%',
    left: '-41%',
    height: '100%'
  },
  confirmationHeader: {
    fontSize: '220%',
    color: colors.darkGrey,
    paddingBottom: '5%',
    textAlign: 'center'
  },
  confirmationText: {
    textAlign: 'center',
    backgroundColor: colors.lightGrey,
    padding: '5%',
    borderRadius: 5
  },
  confirmationButtons: {
    paddingTop: '5%',
    clear: 'both'
  },
  confirmationYesButton: {
    backgroundColor: colors.red,
    color: colors.white,
    left: '5%',
    padding: '3.5% 8%',
    width: '35%'
  },
  confirmationNoButton: {
    backgroundColor: colors.orange,
    color: colors.white,
    float: 'right',
    right: '5%',
    padding: '3.5% 8%',
    width: '35%'
  },
  loading: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    top: '50%',
    left: '50%',
    maxWidth: '30%'
  },
  activityIntroText: {
    position: 'absolute',
    fontSize: '120%',
    top: '20%',
    left: '50%',
    width: '80%',
    transform: 'translateX(-50%)',
    textAlign: 'center'
  },
  trainingIntroBot: {
    position: 'absolute',
    transform: 'translateX(-50%)',
    top: '30%',
    left: '50%'
  },
  activityIntroBot: {
    position: 'absolute',
    transform: 'translateX(-50%)',
    top: '50%',
    left: '50%'
  },
  wordsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: '120%',
    color: colors.white
  },
  wordButton: {
    ':hover': {
      backgroundColor: colors.orange,
      color: colors.white
    },
    ':focus': {
      backgroundColor: colors.orange,
      color: colors.white
    }
  },
  trainQuestionText: {
    position: 'absolute',
    top: '15%',
    left: '50%',
    transform: 'translateX(-50%)',
    fontSize: '180%',
    color: colors.white,
    whiteSpace: 'nowrap'
  },
  trainButtons: {
    position: 'absolute',
    top: '83%',
    width: '100%',
    display: 'flex',
    justifyContent: 'center'
  },
  trainButtonYes: {
    marginLeft: 10,
    ':hover': {
      backgroundColor: colors.green,
      color: colors.white
    }
  },
  trainButtonNo: {
    ':hover': {
      backgroundColor: colors.red,
      color: colors.white
    }
  },
  trainBot: {
    position: 'absolute',
    top: '30%',
    right: '-2%',
    width: '30%',
    direction: 'ltr'
  },
  trainBotHead: {
    transition: 'transform 500ms',
    left: '3%',
    width: '43%',
    top: '0%',
    position: 'absolute',
    direction: 'ltr'
  },
  trainBotOpen: {
    transform: 'rotate(90deg)',
    transformOrigin: 'bottom right',
    direction: 'ltr'
  },
  trainBotBody: {
    width: '49%',
    marginTop: '30%',
    direction: 'ltr'
  },
  counter: {
    position: 'absolute',
    top: '2%',
    right: '7%',
    backgroundColor: colors.transparentBlack,
    color: colors.neonBlue,
    borderRadius: 33,
    textAlign: 'right',
    minWidth: '7%',
    height: '5%',
    padding: '1% 2.5%'
  },
  counterImg: {
    float: 'left',
    height: '100%'
  },
  counterNum: {
    fontSize: '90%'
  },
  eraseButtonContainer: {
    position: 'absolute',
    top: '2%',
    right: '1.2%',
    cursor: 'pointer',
    borderRadius: 50,
    padding: '0.75% 1.2%',
    fontSize: '120%',
    backgroundColor: colors.white,
    color: colors.grey,
    height: '6%',
    width: '2.4%',
    ':hover': {
      backgroundColor: colors.red,
      color: colors.white
    },
    ':focus': {
      backgroundColor: colors.red,
      color: colors.white
    }
  },
  eraseButton: {
    display: 'block',
    margin: 'auto',
    height: '100%'
  },
  mediaControls: {
    position: 'absolute',
    width: '100%',
    bottom: '3.5%',
    display: 'flex',
    justifyContent: 'center',
    direction: 'ltr'
  },
  mediaControl: {
    cursor: 'pointer',
    margin: '0 20px',
    fontSize: '180%',
    color: colors.white,
    display: 'flex',
    alignItems: 'center',
    ':hover': {
      color: colors.orange
    },
    ':active': {
      color: colors.orange
    }
  },
  selectedControl: {
    color: colors.orange
  },
  timeScale: {
    width: 40,
    fontSize: '80%',
    textAlign: 'center'
  },
  predictSpeech: {
    top: '88%',
    left: '12%',
    width: '65%',
    height: 38
  },
  pondSurface: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0
  },
  pondFishDetails: {
    position: 'absolute',
    backgroundColor: colors.transparentWhite,
    padding: '2%',
    borderRadius: 5,
    color: colors.black
  },
  pondBot: {
    position: 'absolute',
    height: '27%',
    top: '59%',
    left: '50%',
    bottom: 0,
    transform: 'translateX(-45%)',
    pointerEvents: 'none'
  },
  pondPanelButton: {
    position: 'absolute',
    top: 24,
    left: 22,
    cursor: 'pointer'
  },
  pondPanelLeft: {
    position: 'absolute',
    width: '30%',
    backgroundColor: colors.transparentBlack,
    color: colors.white,
    borderRadius: 10,
    left: '3%',
    top: '16%',
    padding: '2%',
    pointerEvents: 'none'
  },
  pondPanelRight: {
    position: 'absolute',
    width: '30%',
    backgroundColor: colors.transparentBlack,
    color: colors.white,
    borderRadius: 10,
    right: '3%',
    top: '16%',
    padding: '2%',
    pointerEvents: 'none'
  },
  pondPanelPreText: {
    marginBottom: '5%'
  },
  pondPanelRow: {
    position: 'relative',
    marginBottom: '7%'
  },
  pondPanelGeneralBar: {
    position: 'absolute',
    top: 0,
    left: '0%',
    height: '150%',
    backgroundColor: colors.teal
  },
  pondPanelGeneralBarText: {
    position: 'absolute',
    top: '30%',
    left: '3%',
    textAlign: 'right'
  },
  pondPanelGreenBar: {
    position: 'absolute',
    top: 0,
    left: '50%',
    height: '150%',
    backgroundColor: colors.green
  },
  pondPanelGreenBarText: {
    position: 'absolute',
    top: '30%',
    left: '53%'
  },
  pondPanelRedBar: {
    position: 'absolute',
    top: 0,
    right: '50%',
    height: '150%',
    backgroundColor: colors.red
  },
  pondPanelRedBarText: {
    position: 'absolute',
    top: '30%',
    width: '47%',
    textAlign: 'right'
  },
  pondPanelPostText: {
    marginTop: '3%'
  },
  recallIcons: {
    position: 'absolute',
    top: '2%',
    right: '7%',
    backgroundColor: colors.white,
    color: colors.grey,
    height: '8.5%',
    width: '9.5%',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    direction: 'ltr'
  },
  recallIcon: {
    cursor: 'pointer',
    padding: '0 15%',
    height: '100%'
  },
  infoIconContainer: {
    position: 'absolute',
    top: '2%',
    right: '1.2%',
    cursor: 'pointer',
    borderRadius: 50,
    padding: '0.75% 1.2%',
    fontSize: '120%',
    backgroundColor: colors.white,
    color: colors.grey,
    height: '6%',
    width: '2.5%',
    ':hover': {
      backgroundColor: colors.teal,
      color: colors.white
    },
    ':focus': {
      backgroundColor: colors.teal,
      color: colors.white
    }
  },
  infoIcon: {
    display: 'block',
    margin: 'auto',
    height: '100%'
  },
  bgTeal: {
    backgroundColor: colors.teal,
    color: colors.white
  },
  bgRed: {
    backgroundColor: colors.red,
    color: colors.white
  },
  bgGreen: {
    backgroundColor: colors.green,
    color: colors.white
  },
  count: {
    position: 'absolute',
    top: '3%'
  },
  noCount: {
    right: '9%'
  },
  yesCount: {
    right: 0
  },
  guide: {
    position: 'absolute',
    backgroundColor: colors.transparentBlack,
    color: colors.white,
    borderRadius: 5,
    maxWidth: '80%',
    bottom: '2%',
    left: '50%',
    transform: 'translateX(-50%)'
  },
  guideImage: {
    position: 'absolute',
    bottom: '1%',
    left: '15%',
    zIndex: 2,
    maxHeight: '45%',
    maxWidth: '35%'
  },
  guideHeading: {
    fontSize: '220%',
    color: colors.darkGrey,
    paddingBottom: '5%',
    textAlign: 'center'
  },
  guideTypingText: {
    position: 'absolute',
    padding: 20
  },
  guideFinalTextContainer: {},
  guideFinalTextInfoContainer: {
    backgroundColor: colors.lightGrey,
    borderRadius: 10
  },
  guideFinalText: {
    padding: 20,
    opacity: 0
  },
  guideBackground: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: 10
  },
  guideBackgroundHidden: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none'
  },
  guideArrow: {
    position: 'absolute',
    width: '8%'
  },
  guideInfo: {
    backgroundColor: colors.white,
    color: colors.darkGrey,
    transform: 'translate(-50%, -50%)',
    top: '50%',
    bottom: 'initial',
    left: '50%',
    padding: '2%'
  },
  guideCenter: {
    top: '50%',
    left: '50%',
    bottom: 'initial',
    maxWidth: '47%',
    transform: 'translate(-50%, -50%)'
  },
  infoGuideButton: {
    backgroundColor: colors.orange,
    color: colors.white,
    transform: 'translate(-50%)',
    marginLeft: '50%',
    marginTop: '2%',
    padding: '3% 7%'
  },
  arrowBotRight: {
    top: '15%',
    right: '12.5%',
    transform: 'translateX(-50%)'
  },
  arrowLowerLeft: {
    bottom: '17%',
    left: '8.5%',
    transform: 'translateX(-50%)'
  },
  arrowLowerRight: {
    bottom: '17%',
    right: '0.75%',
    transform: 'translateX(-50%)'
  },
  arrowLowishRight: {
    bottom: '28%',
    right: '0.75%',
    transform: 'translateX(-50%)'
  },
  arrowLowerCenter: {
    bottom: '22%',
    left: '50.5%',
    transform: 'translateX(-50%)'
  },
  arrowUpperRight: {
    top: '13%',
    right: '-2%',
    transform: 'translateX(-50%) rotate(180deg)'
  },
  arrowUpperFarRight: {
    top: '15%',
    right: '-4.6%',
    transform: 'translateX(-50%) rotate(180deg)'
  }
};

export default styles;
