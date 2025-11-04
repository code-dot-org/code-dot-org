# Constants for use in the music generation and validation scripts

# Bucket locations
BUCKET_NAME = 'cdo-curriculum'
BUCKET_PATH = 'media/musiclab/generate/music'

# The default music lab library and version
LIBRARY='launch2024'
LIBRARY_VERSION='launch2024-3'

# Derived URL
LIBRARY_URL="https://curriculum.code.org/media/musiclab/music-library-#{LIBRARY}.json?version=#{LIBRARY_VERSION}"

# Default Model to use
MODEL='gemini-2.5-flash'

# Temperature in our system is between 0 and 1 (and will be proportionally altered to reflect the model)
# For Gemini, this gets multiplied by 2, for instance.
TEMPERATURE=0.7

# Default layer types (adlib_text:sound_type)
LAYERS=%w[beats:beat bass:bass leads:lead vocals:vocal]

# Moods
MOODS=%w[simple creative wild]

# Drums (limits the drum choices to the given packs where 'original' is the source artist pack)
DRUMS=%w[original electro groove indie pop hiphop rock]

# The system prompt
PROMPT=File.read(File.join(File.dirname(__FILE__), 'music_prompt.txt'))
PROMPT_MOOD=File.read(File.join(File.dirname(__FILE__), 'music_prompt_mood.txt'))

# The user prompt
MESSAGE=File.read(File.join(File.dirname(__FILE__), 'music_message.txt'))

# The number of different options to produce
VARIANTS=3

# The name of the adlib option (usually always 'complex')
ADLIB_OPTION='complex'

# The default list of possible lengths
LENGTHS=[10, 15, 20]
LENGTH_WORD_AMOUNTS=[10, 20, 30]
LENGTH_WORDS=%w[short medium long]
