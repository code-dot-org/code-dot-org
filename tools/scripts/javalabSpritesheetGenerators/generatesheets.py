import csv
import json
from PIL import Image
import requests
import os, math, time

spritedata = {}
# These are the different sheets that will be generated (buildings.png, vehicles.png, etc.)
sheetdata = {'buildings': [], 'vehicles': [], 'wall': [], 'other': [], 'sidewalk': []}

    # Open a csv reader for the csv sprites.csv
    # This csv should be in the format id,name,link,sheet where id is the asset id,
    # name is the asset name, link is the url the asset can be downloaded from, and sheet
    # is which spritesheet this asset should go into without the file type extension
with open("sprites.csv", encoding='utf-8') as csvf:
    csvReader = csv.DictReader(csvf)
    # Convert each row into a dictionary
    # and add it to the sprite and sheet data
    for rows in csvReader:
        key = rows['id']
        spritedata[key] = {'link': rows['link'], 'name': rows['name'], 'sheet': rows['sheet']}
        sheetdata[rows['sheet']].append(rows['id'])

    for key in sheetdata:
        #make a spritesheet
        max_frames_row = 10.0
        frames = []
        tile_width = 0
        tile_height = 0

        spritesheet_width = 0
        spritesheet_height = 0

        for current_file_id in sheetdata[key]:
            try:
                # Download the image from the link
                im = Image.open(requests.get(spritedata[current_file_id]['link'], stream=True).raw)
                frames.append(im.getdata())
            except:
                print(current_file_id + " is not a valid image")

        tile_width = frames[0].size[0]
        tile_height = frames[0].size[1]

        # Figure out how many rows you'll need
        if len(frames) > max_frames_row :
            spritesheet_width = tile_width * max_frames_row
            required_rows = math.ceil(len(frames)/max_frames_row)
            spritesheet_height = tile_height * required_rows
        else:
            spritesheet_width = tile_width*len(frames)
            spritesheet_height = tile_height

        spritesheet = Image.new("RGBA",(int(spritesheet_width), int(spritesheet_height)))

        for i, current_frame in enumerate(frames) :
            top = tile_height * math.floor((frames.index(current_frame))/max_frames_row)
            left = tile_width * (frames.index(current_frame) % max_frames_row)
            bottom = top + tile_height
            right = left + tile_width

            box = (left,top,right,bottom)
            box = [int(i) for i in box]
            cut_frame = current_frame.crop((0,0,tile_width,tile_height))

            spritesheet.paste(cut_frame, box)
            thisSpriteId = sheetdata[key][i]

            # Set the row and column data and what file the sprite is stored in
            # Also remove the now unnecessary link field
            spritedata[thisSpriteId]['row'] = math.floor((frames.index(current_frame))/max_frames_row)
            spritedata[thisSpriteId]['column'] = math.floor(frames.index(current_frame) % max_frames_row)
            spritedata[thisSpriteId]['sheet'] = spritedata[thisSpriteId]['sheet']+'.png'
            spritedata[thisSpriteId].pop('link', None)

        spritesheet.save(key + ".png", "PNG")

# Output the sprite data to a json file
with open('sprites.json', 'w', encoding='utf-8') as jsonf:
    jsonf.write(json.dumps(spritedata, indent=4))
