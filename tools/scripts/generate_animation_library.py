import csv
import os
import sys
# This is meant to be used to add new animations/sprites to SpriteLab and GameLab. 
# Given a csv of new animations, it will generate the metadata files for those new animations.
# Context on this being used: https://codedotorg.atlassian.net/browse/STAR-1319
if len(sys.argv) < 3:
    print("Please provide 2 arguments. The first should be the csv input file and the second should be the new library's location")
    sys.exit(2)
inputCSV = sys.argv[1]
newLibraryDir = sys.argv[2]

with open(inputCSV) as csv_file:
    csv_reader = csv.reader(csv_file, delimiter=',')
    line_count = 0
    for row in csv_reader:
        if len(row)<4:
            print("The CSV should be in this order: Name, Path to file, Search Terms/Aliases, Category")
            print('Example row: background_underwater_05.png,Backgrounds/Underwater/BG-Underwater-05.png,"landscape,background,blue,sea,ocean,ship,treasure,anchor,underwater",backgrounds')
            sys.exit(2)
        else:
            name = row[0]
            relativeFileLocation = row[1]
            aliases = row[2]
            category = row[3]
            newFileLocation = newLibraryDir + "category_"+category+"/"+name
            theMove = "cp "+relativeFileLocation + " " + newFileLocation
            os.system(theMove)
            whatToRun = "bundle exec ./generateSingleFrameAnimationMetadata.rb " + newFileLocation + " --categories "+row[3] + " --aliases "+row[2]
            os.system(whatToRun)
            line_count += 1
    print('Processed: '+str(line_count))