## For Creating a Single Spritesheet

### Requirements

- Python: An ability to run scripts locally
- Pillow: IDE Extension, [documentation here](https://pillow.readthedocs.io/en/stable/)
- Tab Save: [Chrome extension here](https://chrome.google.com/webstore/detail/tab-save/lkngoeaeclaebmpkgapchgjdbaekacki?hl=en), or any other site for downloading images from urls in bulk

### Steps

- Within [neighborhood sprites google sheet](https://docs.google.com/spreadsheets/d/1j6r9cWArsQJF8j9sm-87kOXs6oLh7xceHdH86vglBr0/edit#gid=0), filter by category (i.e. vehicles, other, etc)
- Utilize browser extension from above to download images locally
- Rename images as necessary to reorder them within your folder (the script sorts them by name)
- Run singlesheetgenerator.py to create spritesheet
- If images are in new positions, update neighborhoodSprites.json accordingly
- If images have been resized, update squareSize accordingly in skins.js
