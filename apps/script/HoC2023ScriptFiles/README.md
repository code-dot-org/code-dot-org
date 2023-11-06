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
autumn | autumn | Autumn  
black and white | rave | Black and White  
green blue | cool | Cool  
electronic | electronic | Electronic  
grayscale | grayscale | Grayscale  
creamy pastel | iceCream | Ice Cream  
rainbow pastel | default | Light  
neon | neon | Neon  
blue | ocean | Ocean  
bright rainbow | rainbow | Rainbow  
roses | roses | Roses  
pink blue | sky | Sky  
green | spring | Spring  
flower | summer | Summer  
coral | sunrise | Sunrise  
purple | sunset | Sunset  
sweet candy rainbow | tropical | Tropical  
orange | twinkling | Twinkling  
retro | vintage | Vintage  
red orange | warm | Warm  
icy blue | winter | Winter  

BACKGROUND_EFFECTS  
model_descriptive_name | blockly_id | blockly_user_facing_name  
moving shapes | quads | Angles  
flower petals | blooming_petals | Blooming Petals  
pulse | circles | Circles  
clouds | clouds | Clouds  
solid colors | color_cycle | Colors  
diamonds | diamonds | Diamonds  
disco | disco_ball | Disco Ball  
firework | fireworks | Fireworks  
flowers | flowers | Flowers  
light grid | frosted_grid | Frosted Grid  
stars | growing_stars | Growing Stars  
groovy shapes | higher_power | Higher Power  
swirl | swirl | Hypno  
kaleidoscope | kaleidoscope | Kaleidoscope  
laser beam | lasers | Laser Dance Floor  
paint splatter | splatter | Paint Splatter  
rainbow | rainbow | Rainbow  
dots | ripples_random | Random Ripples  
circles | ripples | Ripples  
snow fall | snowflakes | Snow  
words | text | Song Names  
galaxy | galaxy | Space  
sparkles | sparkles | Sparkles  
spiral | spiral | Spiral  
squares | disco | Squares  
squiggles | squiggles | Squiggles  
starburst | starburst | Starburst  
twinkle | stars | Stars  
sound wave | music_wave | Waves  

FOREGROUND_EFFECTS  
model_descriptive_name | blockly_id | blockly_user_facing_name  
bubbles | bubbles | Bubbles  
hearts | hearts_colorful | Colorful Hearts  
confetti | confetti | Confetti  
emojis | emojis | Emojis  
heart | hearts_red | Hearts  
music notes | music_notes | Music Notes  
rainbow paint | paint_drip | Paint Drip  
pineapple | pineapples | Pineapples  
pizza | pizzas | Pizzas  
poop | smiling_poop | Poop  
rain | rain | Rain  
rainbow | floating_rainbows | Rainbows  
smily face | smile_face | Smiles  
spotlight | spotlight | Spotlight  
stage lights | color_lights | Stage Lights  
stars | exploding_stars | Starburst  
taco | raining_tacos | Tacos  