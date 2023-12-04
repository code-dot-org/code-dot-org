# HoC 2023 Script Files

Run the `HoC2023AiGenerateWeights.py` to generate the associated output weights contained in files like cached_background_effects_map.json that are used to calculate final effects output for the HoC 2023 activity.

Before running the script, you must assign the openai.api_key with your Open AI API key
the in Hoc2023AiHelperFunctions.py file.
Run `HoC2023AiGenerateWeights.py` from the code-dot-org root directory using the following command:
`python apps/script/HoC2023ScriptFiles/HoC2023AiGenerateWeights.py`

Note that the script generates/updates 3 files in apps/static/dance/ai/model:
- cached_background_effects_map.json
- cached_foreground_effects_map.json
- cached_palettes_map.json

These files store association values measuring the similarity between an emoji and each output.
Embeddings from Open AI's Ada model are used to compute these values.
An embedding is a vector (list) of floating point numbers, and embeddings are used to
measure the relatedness of text strings. The distance between two vectors measures
their relatedness. https://platform.openai.com/docs/guides/embeddings
We also store embeddings in caches files as as pickle files, python's native way to serialize data.

Below are palettes, background effects, and foreground effects in the order that they appear in the dropdowns. When this file is run and the three cached data files are replaced in apps/static/dance/ai/model, please update the lists below with the output from this script.

PALETTES  
model_descriptive_name | blockly_id | blockly_user_facing_name  
fall leaves | autumn | Autumn  
black and white | rave | Black and White  
cool | cool | Cool  
electronic | electronic | Electronic  
black and white grayscale | grayscale | Grayscale  
ice cream pastel | iceCream | Ice Cream  
rainbow pastel | default | Light  
neon | neon | Neon  
ocean water | ocean | Ocean  
rainbow stripes | rainbow | Rainbow  
roses romantic warm | roses | Roses  
sky sunrise | sky | Sky  
spring green plants | spring | Spring  
summer flower | summer | Summer  
sunrise cozy | sunrise | Sunrise  
sunset cozy | sunset | Sunset  
sweet candy | tropical | Tropical  
fire warm | twinkling | Twinkling  
groovy | vintage | Vintage  
warm hot red orange | warm | Warm  
winter icy blue | winter | Winter  
BACKGROUND_EFFECTS  
model_descriptive_name | blockly_id | blockly_user_facing_name  
geometric shapes | quads | Angles  
flower petals | blooming_petals | Blooming Petals  
round circle geometric | circles | Circles  
clouds | clouds | Clouds  
simple | color_cycle | Colors  
diamonds | diamonds | Diamonds  
disco | disco_ball | Disco Ball  
explosion celebration | fireworks | Fireworks  
flowers plants | flowers | Flowers  
light grid | frosted_grid | Frosted Grid  
stars | growing_stars | Growing Stars  
groovy | higher_power | Higher Power  
swirl twist | swirl | Hypno  
kaleidoscope | kaleidoscope | Kaleidoscope  
electronic | lasers | Laser Dance Floor  
paint splatter | splatter | Paint Splatter  
rainbow stripes | rainbow | Rainbow  
dots geometric pattern | ripples_random | Random Ripples  
round shapes geometric | ripples | Ripples  
snow | snowflakes | Snow  
words song music | text | Song Names  
galaxy space | galaxy | Space  
bright | sparkles | Sparkles  
spiral twisty | spiral | Spiral  
grid geometric | disco | Squares  
squiggles | squiggles | Squiggles  
starburst | starburst | Starburst  
twinkle | stars | Stars  
music wave geometric | music_wave | Waves  
FOREGROUND_EFFECTS  
model_descriptive_name | blockly_id | blockly_user_facing_name  
bubbles | bubbles | Bubbles  
hearts | hearts_colorful | Colorful Hearts  
party confetti | confetti | Confetti  
happy silly faces emojis | emojis | Emojis  
red hearts | hearts_red | Hearts  
music notes sound | music_notes | Music Notes  
rainbow lines | paint_drip | Paint Drip  
pineapple sweet food | pineapples | Pineapples  
pizza food | pizzas | Pizzas  
poop stinky | smiling_poop | Poop  
rain water | rain | Rain  
happy | floating_rainbows | Rainbows  
happy emojis faces | smile_face | Smiles  
spot light focus | spotlight | Spotlight  
stage lights | color_lights | Stage Lights  
stars | exploding_stars | Starburst  
taco food | raining_tacos | Tacos  
