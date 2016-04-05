module.exports = {
  // Media queries to resize editor-column
  // Split out into width and height since non-applab apps use only width
  editorColumnMedia: {
    width: {
      left: 400,
      '@media screen and (min-width: 1101px) and (max-width: 1150px)': {
        left: 350
      },
      '@media screen and (min-width: 1051px) and (max-width: 1100px)': {
        left: 300
      },
      '@media screen and (min-width: 1001px) and (max-width: 1050px)': {
        left: 250
      },
      '@media screen and (max-width: 1000px)': {
        left: 200
      }
    },
    height: {
      left: 400,
      '@media screen and (min-height: 551px) and (max-height: 600px)': {
        left: 350
      },
      '@media screen and (min-height: 501px) and (max-height: 550px)': {
        left: 300
      },
      '@media screen and (min-height: 451px) and (max-height: 500px)': {
        left: 250
      },
      '@media screen and (max-height: 450px)': {
        left: 200
      }
    }
  }
};
