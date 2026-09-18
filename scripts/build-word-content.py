#!/usr/bin/env python3
import ast, json, math, random, re, hashlib
from pathlib import Path
from collections import defaultdict, Counter

ROOT=Path(__file__).resolve().parents[1]
APP=(ROOT/'app.js').read_text()

def parse_base_words():
    m=re.search(r"const WORDS = \[(.*?)\n  \];",APP,re.S)
    if not m: return []
    return [w.upper() for w in ast.literal_eval('['+m.group(1)+']') if w.isalpha()]

# Shared editorial vocabulary. Single-token entries keep all word games offline/simple.
THEMES = {
'Animals':['TIGER','HORSE','SHEEP','MOUSE','WHALE','SHARK','EAGLE','OTTER','PANDA','ZEBRA'],
'Birds':['ROBIN','EAGLE','RAVEN','HERON','FINCH','CRANE','GOOSE','SWAN','LARK','OWL'],
'Ocean':['CORAL','SHARK','WHALE','SQUID','REEF','TIDES','SHELL','WAVES','KELP','SEAL'],
'Forest':['CEDAR','MAPLE','PINE','BIRCH','MOSS','FERN','TRAIL','GROVE','ACORN','OWL'],
'Flowers':['ROSE','TULIP','DAISY','IRIS','LILAC','LOTUS','ASTER','POPPY','VIOLET','BLOOM'],
'Weather':['RAIN','CLOUD','STORM','WIND','HAIL','FROST','SNOW','MIST','THUNDER','BREEZE'],
'Space':['ORBIT','COMET','VENUS','LUNAR','SOLAR','MARS','NOVA','STAR','MOON','METEOR'],
'Planets':['EARTH','VENUS','MARS','SATURN','URANUS','NEPTUNE','MERCURY','JUPITER'],
'Night Sky':['COMET','STARS','LUNAR','MOON','ORBIT','NOVA','METEOR','VENUS','SPACE','DUSK'],
'Kitchen':['PLATE','SPOON','KNIFE','OVEN','PAN','CUP','FORK','BOWL','WHISK','APRON'],
'Baking':['FLOUR','YEAST','SUGAR','DOUGH','OVEN','WHISK','BREAD','CAKE','TART','MIXER'],
'Fruit':['APPLE','GRAPE','MANGO','LEMON','PEACH','MELON','BERRY','PLUM','PEAR','LIME'],
'Vegetables':['ONION','CARROT','BEANS','PEAS','CELERY','RADISH','TURNIP','KALE','CORN','LEEK'],
'Breakfast':['TOAST','EGGS','CEREAL','BACON','JUICE','COFFEE','WAFFLE','BAGEL','FRUIT','MILK'],
'Desserts':['CAKE','TART','PIE','COOKIE','MOUSSE','FUDGE','DONUT','CREAM','CANDY','BROWNIE'],
'Music':['PIANO','DRUM','VOICE','CHORD','BEAT','SONG','NOTE','BASS','TEMPO','FLUTE'],
'Instruments':['PIANO','FLUTE','DRUM','CELLO','VIOLA','HARP','BANJO','TRUMPET','GUITAR','OBOE'],
'Theater':['STAGE','ACTOR','SCENE','SCRIPT','DRAMA','LIGHT','PROPS','CAST','AISLE','CURTAIN'],
'Art':['PAINT','BRUSH','CANVAS','FRAME','COLOR','SKETCH','MURAL','INK','CLAY','EASEL'],
'Books':['NOVEL','POEM','STORY','TITLE','PAGE','INDEX','COVER','SPINE','CHAPTER','PROSE'],
'School':['CLASS','DESK','PAPER','PENCIL','STUDY','BOOK','GRADE','TEACH','BOARD','RULER'],
'Office':['DESK','CHAIR','PAPER','FILE','STAMP','PHONE','EMAIL','NOTES','CLIP','FOLDER'],
'Technology':['ROBOT','LASER','CABLE','MOUSE','PIXEL','SCREEN','CHIP','CODE','DATA','CLOUD'],
'Internet':['BROWSER','SEARCH','LINK','TAB','EMAIL','CLOUD','CACHE','SERVER','LOGIN','PAGE'],
'Coding':['ARRAY','LOOP','CLASS','INPUT','DEBUG','STACK','QUEUE','CACHE','SCRIPT','LOGIC'],
'Tools':['DRILL','HAMMER','SAW','LEVEL','CLAMP','FILE','WRENCH','PLIERS','SCREW','CHISEL'],
'Workshop':['BENCH','DRILL','CLAMP','TOOLS','SCREW','NAILS','LEVEL','SAW','LATHE','VICE'],
'Garden':['PLANT','SEEDS','SOIL','SPADE','HOSE','RAKE','BLOOM','HERBS','WEEDS','PATIO'],
'Farm':['FIELD','TRACTOR','BARN','WHEAT','HORSE','SHEEP','CORN','FENCE','PLOW','GRAIN'],
'City':['STREET','TOWER','PLAZA','HOTEL','TRAIN','BRIDGE','PARK','BLOCK','METRO','CAFE'],
'Travel':['TRAIN','HOTEL','PLANE','TICKET','MAP','PORT','ROUTE','TRIP','BAG','GUIDE'],
'Airport':['PLANE','GATE','TICKET','PILOT','CABIN','BAG','FLIGHT','RUNWAY','SEAT','RADAR'],
'Road Trip':['ROUTE','MOTEL','RADIO','DRIVE','MAP','TRUNK','SNACK','MILES','TIRE','FUEL'],
'Camping':['TENT','TRAIL','FIRE','CAMP','ROPE','BOOTS','TORCH','MAP','FLASK','WOODS'],
'Hiking':['TRAIL','BOOTS','RIDGE','CLIMB','PACK','MAP','CREEK','ROCK','SUMMIT','PATH'],
'Beach':['SAND','SHELL','WAVES','TOWEL','OCEAN','SURF','SUN','CHAIR','DUNE','COAST'],
'Winter':['SNOW','FROST','SCARF','COAT','SLEET','SLED','GLOVE','BOOTS','ICE','CHILL'],
'Summer':['SUNNY','BEACH','PICNIC','MELON','SWIM','SHADE','TRAVEL','HEAT','POOL','JUICE'],
'Sports':['TENNIS','SOCCER','RUGBY','GOLF','BOXING','HOCKEY','SKI','RACE','BALL','TRACK'],
'Baseball':['PITCH','BAT','BASE','CATCH','FIELD','GLOVE','SWING','RUN','TEAM','COACH'],
'Soccer':['GOAL','PITCH','BALL','PASS','TEAM','COACH','MATCH','FIELD','KICK','SCORE'],
'Tennis':['SERVE','COURT','RALLY','BALL','MATCH','RACKET','NET','SET','POINT','ACE'],
'Fitness':['SQUAT','BENCH','PRESS','LUNGE','ROW','RUN','PLANK','CYCLE','LIFT','REST'],
'Science':['ATOM','CELL','LIGHT','FORCE','MASS','WAVE','SPACE','FIELD','LASER','ENERGY'],
'Physics':['FORCE','MASS','SPEED','LIGHT','WAVE','FIELD','ENERGY','MOTION','SPACE','POWER'],
'Biology':['CELL','GENE','BLOOD','HEART','BRAIN','NERVE','TISSUE','PLANT','ORGAN','BONE'],
'Chemistry':['ATOM','MOLE','ACID','BASE','ION','METAL','GAS','BOND','SALT','FLASK'],
'Math':['ANGLE','PRIME','RATIO','CURVE','PROOF','GRAPH','LOGIC','VALUE','UNION','ARRAY'],
'Geometry':['ANGLE','CURVE','POINT','PLANE','SOLID','SHAPE','LINE','CIRCLE','RADIUS','AREA'],
'Numbers':['THREE','SEVEN','EIGHT','FORTY','FIFTY','SIXTY','FIRST','THIRD','FIFTH','SIXTH'],
'Home':['HOUSE','ROOM','CHAIR','TABLE','SHELF','LIGHT','FLOOR','DOOR','COUCH','CLOCK'],
'Bedroom':['BED','PILLOW','SHEET','LAMP','CLOCK','DRESSER','BLANKET','CLOSET','MIRROR','RUG'],
'Living Room':['COUCH','CHAIR','TABLE','LAMP','RUG','SHELF','CLOCK','PHOTO','PLANT','FRAME'],
'Bathroom':['SOAP','TOWEL','BRUSH','SINK','SHOWER','MIRROR','COMB','TUB','TAP','ROBE'],
'Clothing':['SHIRT','SKIRT','PANTS','SOCKS','COAT','DRESS','SHOES','BELT','HAT','GLOVE'],
'Colors':['BLACK','WHITE','GREEN','BROWN','PURPLE','ORANGE','CORAL','AMBER','VIOLET','CREAM'],
'Shapes':['ROUND','OVAL','CUBE','CONE','ANGLE','CURVE','SOLID','PLANE','POINT','LINE'],
'Emotions':['HAPPY','ANGER','PRIDE','WORRY','PEACE','DOUBT','GRIEF','JOY','FEAR','CALM'],
'Senses':['SIGHT','SOUND','TASTE','TOUCH','SMELL','VOICE','LIGHT','NOISE','SWEET','SHARP'],
'Body':['HEART','BRAIN','CHEST','TEETH','MOUTH','BLOOD','NERVE','BONE','KNEE','HAND'],
'Health':['SLEEP','WATER','HEART','NURSE','MEDIC','PULSE','BLOOD','REST','VITAL','HEALTH'],
'Time':['TODAY','MONTH','DAILY','EARLY','LATER','NIGHT','CLOCK','HOUR','WEEK','YEAR'],
'Calendar':['MONTH','WEEK','DAILY','DATE','YEAR','APRIL','MARCH','JUNE','JULY','MAY'],
'Finance':['MONEY','PRICE','ASSET','AUDIT','TAXES','LEASE','VALUE','TRADE','BANK','CASH'],
'Market':['PRICE','TRADE','BUYER','ASSET','MONEY','STOCK','VALUE','SELL','DEAL','CASH'],
'Law':['LEGAL','COURT','JUDGE','CLAIM','RULE','TRIAL','PROOF','RIGHT','CASE','LAW'],
'News':['MEDIA','PRESS','STORY','RADIO','VIDEO','TITLE','REPORT','DAILY','PHOTO','EDITOR'],
'Film':['MOVIE','ACTOR','SCENE','DRAMA','CAST','FRAME','VIDEO','SOUND','SCRIPT','CAMERA'],
'Photography':['PHOTO','IMAGE','FRAME','LIGHT','FOCUS','FLASH','LENS','CAMERA','ANGLE','ZOOM'],
'Games':['SCORE','LEVEL','PLAYER','BOARD','ROUND','MATCH','QUEST','TOKEN','DICE','CARD'],
'Chess':['QUEEN','KING','ROOK','PAWN','BISHOP','KNIGHT','BOARD','CHECK','MATE','CASTLE'],
'Cards':['HEART','SPADE','CLUB','DEUCE','ACE','QUEEN','KING','JOKER','DECK','HAND'],
'Puzzles':['LOGIC','CLUE','SOLVE','GRID','WORDS','NUMBER','PIECE','TRAIL','HINT','PROOF'],
'Coffee':['BEANS','ROAST','LATTE','MOCHA','CREAM','MUG','BREW','ESPRESSO','AROMA','STEAM'],
'Tea':['LEMON','HONEY','MINT','GREEN','BLACK','HERBAL','CUP','BREW','LEAF','STEAM'],
'Weather Gear':['COAT','BOOTS','SCARF','GLOVE','UMBRELLA','HOOD','HAT','JACKET','PARKA','VEST'],
'Mountains':['RIDGE','PEAK','CLIMB','ROCK','TRAIL','SUMMIT','SLOPE','VALLEY','CLIFF','SNOW'],
'Rivers':['WATER','BANK','DELTA','STREAM','RAPID','MOUTH','CREEK','BRIDGE','FLOW','FLOOD'],
'Architecture':['BRICK','STONE','TOWER','ARCH','FLOOR','WALL','ROOF','BEAM','GLASS','FRAME'],
'Transport':['TRAIN','TRUCK','PLANE','FERRY','METRO','CAR','BUS','BIKE','TAXI','BOAT'],
'Vehicles':['TRUCK','CAR','TRAIN','PLANE','BOAT','BIKE','VAN','TAXI','FERRY','BUS'],
'Library':['BOOK','SHELF','INDEX','TITLE','NOVEL','AUTHOR','PAGE','STUDY','QUIET','LOAN'],
'Writing':['WRITE','DRAFT','PROSE','STORY','TITLE','PAPER','EDIT','STYLE','VOICE','NOTES'],
'Language':['WORDS','VOICE','SPEAK','WRITE','READ','PHRASE','VERB','NOUN','LETTER','SOUND'],
'Measurement':['SCALE','METER','LITER','OUNCE','POUND','MILES','RULER','DEPTH','RATIO','LEVEL'],
}

# Wordplay / abstract categories for Groups. Exactly four members per category.
GROUP_SPECIAL = [
('Can follow BLACK',['BOARD','BIRD','JACK','HOLE'],'wordplay',3),
('Can follow NIGHT',['OWL','SHIFT','SKY','LIGHT'],'wordplay',3),
('Can follow HIGH',['SCHOOL','SPEED','TIDE','RISE'],'wordplay',3),
('Can follow PAPER',['CLIP','BACK','WORK','TRAIL'],'wordplay',3),
('Can follow BLUE',['BIRD','BERRY','PRINT','MOON'],'wordplay',3),
('Can follow BOOK',['MARK','CASE','SHELF','STORE'],'wordplay',3),
('Can follow SUN',['LIGHT','FLOWER','RISE','SET'],'wordplay',3),
('Can precede BALL',['BASE','BASKET','FOOT','SNOW'],'wordplay',3),
('Can precede BOARD',['KEY','SURF','DASH','SCORE'],'wordplay',3),
('Can precede ROOM',['BED','CLASS','BATH','SHOW'],'wordplay',3),
('Can precede LIGHT',['DAY','FLASH','MOON','SPOT'],'wordplay',3),
('Can precede LINE',['BASE','DEAD','SHORE','TIME'],'wordplay',3),
('Things with KEYS',['PIANO','CAR','LOCK','KEYBOARD'],'abstract',2),
('Things you can BREAK',['RULE','RECORD','PROMISE','SILENCE'],'abstract',3),
('Things you can DRAW',['CARD','BATH','BREATH','LINE'],'abstract',3),
('Things you can RUN',['RACE','ERRAND','CODE','WATER'],'abstract',3),
('Things you can RAISE',['HAND','MONEY','ROOF','ALARM'],'abstract',3),
('Things you can OPEN',['DOOR','FILE','STORE','ACCOUNT'],'abstract',2),
('Things with WINGS',['BIRD','PLANE','BEE','STAGE'],'abstract',3),
('Things with RINGS',['TREE','PHONE','SATURN','BELL'],'abstract',3),
('Things with BARS',['MUSIC','SOAP','SIGNAL','PRISON'],'abstract',3),
('Things with BANKS',['RIVER','MONEY','CLOUD','BLOOD'],'abstract',3),
('Things with CAPS',['BOTTLE','PEN','MUSHROOM','KNEE'],'abstract',3),
('Kinds of BREAK',['COFFEE','LUCKY','SPRING','DAY'],'abstract',3),
('Kinds of FIELD',['SPORT','DATA','MAGNET','WHEAT'],'abstract',3),
('Kinds of COURT',['TENNIS','FOOD','LAW','ROYAL'],'abstract',3),
('Kinds of CHIP',['POTATO','POKER','WOOD','COMPUTER'],'abstract',3),
('Kinds of TRACK',['RACE','MUSIC','TRAIN','DATA'],'abstract',3),
('Kinds of POINT',['POWER','MATCH','VIEW','BREAK'],'abstract',3),
('Kinds of WAVE',['SOUND','LIGHT','TIDAL','RADIO'],'abstract',3),
('Kinds of STAR',['MOVIE','SEA','NORTH','ROCK'],'abstract',3),
('Kinds of TABLE',['DINNER','DATA','PERIODIC','COFFEE'],'abstract',3),
('Kinds of SHELL',['SEA','EGG','COMMAND','OUTER'],'abstract',3),
('Kinds of SCALE',['MAP','MUSIC','WEIGHT','RATING'],'abstract',3),
]

COMPOUND_LINES = '''
sunflower|SUN|FLOWER
notebook|NOTE|BOOK
rainbow|RAIN|BOW
keyboard|KEY|BOARD
headphone|HEAD|PHONE
airport|AIR|PORT
newspaper|NEWS|PAPER
daylight|DAY|LIGHT
seashell|SEA|SHELL
bookshelf|BOOK|SHELF
firework|FIRE|WORK
football|FOOT|BALL
toothbrush|TOOTH|BRUSH
sunset|SUN|SET
pancake|PAN|CAKE
raincoat|RAIN|COAT
bedroom|BED|ROOM
classroom|CLASS|ROOM
snowman|SNOW|MAN
doorbell|DOOR|BELL
cupcake|CUP|CAKE
basketball|BASKET|BALL
baseball|BASE|BALL
moonlight|MOON|LIGHT
starlight|STAR|LIGHT
flashlight|FLASH|LIGHT
lighthouse|LIGHT|HOUSE
houseboat|HOUSE|BOAT
housework|HOUSE|WORK
homework|HOME|WORK
workshop|WORK|SHOP
workplace|WORK|PLACE
workbook|WORK|BOOK
bookcase|BOOK|CASE
bookmark|BOOK|MARK
bookstore|BOOK|STORE
bookworm|BOOK|WORM
backpack|BACK|PACK
backyard|BACK|YARD
background|BACK|GROUND
blackboard|BLACK|BOARD
whiteboard|WHITE|BOARD
skateboard|SKATE|BOARD
surfboard|SURF|BOARD
scoreboard|SCORE|BOARD
boardwalk|BOARD|WALK
walkway|WALK|WAY
hallway|HALL|WAY
doorway|DOOR|WAY
roadway|ROAD|WAY
railway|RAIL|WAY
runway|RUN|WAY
highway|HIGH|WAY
sidewalk|SIDE|WALK
moonwalk|MOON|WALK
crosswalk|CROSS|WALK
waterfall|WATER|FALL
watermelon|WATER|MELON
waterproof|WATER|PROOF
waterway|WATER|WAY
waterside|WATER|SIDE
waterline|WATER|LINE
seaside|SEA|SIDE
seashore|SEA|SHORE
seaport|SEA|PORT
seafood|SEA|FOOD
sunrise|SUN|RISE
sundown|SUN|DOWN
sunbeam|SUN|BEAM
sunroof|SUN|ROOF
starfish|STAR|FISH
starboard|STAR|BOARD
starship|STAR|SHIP
spaceship|SPACE|SHIP
shipyard|SHIP|YARD
shipwreck|SHIP|WRECK
shipmate|SHIP|MATE
airmail|AIR|MAIL
airline|AIR|LINE
airplane|AIR|PLANE
airfield|AIR|FIELD
airspace|AIR|SPACE
railroad|RAIL|ROAD
railcar|RAIL|CAR
roadside|ROAD|SIDE
roadblock|ROAD|BLOCK
roadmap|ROAD|MAP
roadwork|ROAD|WORK
motorbike|MOTOR|BIKE
motorboat|MOTOR|BOAT
racecar|RACE|CAR
raceway|RACE|WAY
racehorse|RACE|HORSE
playground|PLAY|GROUND
playbook|PLAY|BOOK
playtime|PLAY|TIME
playroom|PLAY|ROOM
downtown|DOWN|TOWN
uptown|UP|TOWN
hometown|HOME|TOWN
townhouse|TOWN|HOUSE
farmhouse|FARM|HOUSE
greenhouse|GREEN|HOUSE
warehouse|WARE|HOUSE
schoolhouse|SCHOOL|HOUSE
schoolwork|SCHOOL|WORK
schoolyard|SCHOOL|YARD
schoolbook|SCHOOL|BOOK
classmate|CLASS|MATE
roommate|ROOM|MATE
teammate|TEAM|MATE
teacup|TEA|CUP
teapot|TEA|POT
teaspoon|TEA|SPOON
tablespoon|TABLE|SPOON
tabletop|TABLE|TOP
timetable|TIME|TABLE
bedtime|BED|TIME
daytime|DAY|TIME
nighttime|NIGHT|TIME
lifetime|LIFE|TIME
mealtime|MEAL|TIME
timeline|TIME|LINE
deadline|DEAD|LINE
headline|HEAD|LINE
shoreline|SHORE|LINE
lifeline|LIFE|LINE
outline|OUT|LINE
pipeline|PIPE|LINE
mailbox|MAIL|BOX
lunchbox|LUNCH|BOX
toolbox|TOOL|BOX
sandbox|SAND|BOX
shoebox|SHOE|BOX
icebox|ICE|BOX
iceberg|ICE|BERG
snowball|SNOW|BALL
snowfall|SNOW|FALL
snowflake|SNOW|FLAKE
snowstorm|SNOW|STORM
rainfall|RAIN|FALL
raindrop|RAIN|DROP
rainstorm|RAIN|STORM
windmill|WIND|MILL
windshield|WIND|SHIELD
windsock|WIND|SOCK
windstorm|WIND|STORM
fireplace|FIRE|PLACE
firehouse|FIRE|HOUSE
firefly|FIRE|FLY
fireball|FIRE|BALL
fireproof|FIRE|PROOF
campfire|CAMP|FIRE
campground|CAMP|GROUND
campsite|CAMP|SITE
handbag|HAND|BAG
handbook|HAND|BOOK
handmade|HAND|MADE
handshake|HAND|SHAKE
handwriting|HAND|WRITING
headache|HEAD|ACHE
headband|HEAD|BAND
headlight|HEAD|LIGHT
headline|HEAD|LINE
headroom|HEAD|ROOM
haircut|HAIR|CUT
hairbrush|HAIR|BRUSH
hairline|HAIR|LINE
bathroom|BATH|ROOM
bathtub|BATH|TUB
bathrobe|BATH|ROBE
bathwater|BATH|WATER
birdhouse|BIRD|HOUSE
birdsong|BIRD|SONG
birdseed|BIRD|SEED
fishbowl|FISH|BOWL
fishhook|FISH|HOOK
fishnet|FISH|NET
fishbone|FISH|BONE
doghouse|DOG|HOUSE
dogwood|DOG|WOOD
catfish|CAT|FISH
catwalk|CAT|WALK
butterfly|BUTTER|FLY
dragonfly|DRAGON|FLY
ladybug|LADY|BUG
honeybee|HONEY|BEE
honeymoon|HONEY|MOON
honeycomb|HONEY|COMB
moonbeam|MOON|BEAM
moonstone|MOON|STONE
moonrise|MOON|RISE
moonshine|MOON|SHINE
stonewall|STONE|WALL
stonework|STONE|WORK
sandstone|SAND|STONE
sandcastle|SAND|CASTLE
sandpaper|SAND|PAPER
paperback|PAPER|BACK
paperclip|PAPER|CLIP
paperwork|PAPER|WORK
wallpaper|WALL|PAPER
wallboard|WALL|BOARD
wallflower|WALL|FLOWER
clockwork|CLOCK|WORK
clockwise|CLOCK|WISE
timepiece|TIME|PIECE
masterpiece|MASTER|PIECE
puzzlepiece|PUZZLE|PIECE
jigsaw|JIG|SAW
weekend|WEEK|END
yearbook|YEAR|BOOK
birthday|BIRTH|DAY
weekday|WEEK|DAY
holiday|HOLI|DAY
workday|WORK|DAY
payday|PAY|DAY
friendship|FRIEND|SHIP
leadership|LEADER|SHIP
ownership|OWNER|SHIP
membership|MEMBER|SHIP
'''


# Original in-project aphorism components. These are not quotations from external sources.
CRYPTO_START = [
'CLEAR THINKING','PATIENT WORK','CAREFUL READING','SMALL STEPS','GOOD QUESTIONS','QUIET FOCUS','HONEST CHECKING','STEADY PRACTICE','SIMPLE RULES','FRESH EYES','DEEP ATTENTION','A CLEAN START','A SOUND PLAN','CALM REASONING','STRONG HABITS','A USEFUL CLUE','ONE GOOD IDEA','A SMALL CHANGE','A CLEAR GOAL','A FAIR TEST']
CRYPTO_VERB = [
'CAN TURN','MAY TURN','CAN TRANSFORM','MAY TRANSFORM','CAN CHANGE','MAY CHANGE','CAN SHAPE','CAN CONVERT']
CRYPTO_END = [
'A HARD PUZZLE INTO A SIMPLE PATH','CONFUSION INTO A USEFUL CHOICE','A LARGE PROBLEM INTO SMALLER PARTS','A HIDDEN PATTERN INTO A VISIBLE ONE','A FALSE START INTO A BETTER ROUTE','A LONG SEARCH INTO A SHORTER ONE','GUESSING INTO REASONING','NOISE INTO SIGNAL','MISTAKES INTO INFORMATION','A BLOCKED IDEA INTO A NEW DIRECTION','AN UNCLEAR BOARD INTO A CLEANER PLAN','A WEAK ASSUMPTION INTO A TESTABLE CLAIM','A DIFFICULT GRID INTO A SERIES OF CHOICES','A RANDOM TRY INTO A DELIBERATE MOVE','AN OLD PROBLEM INTO A FRESH QUESTION']
CRYPTO_EXTRA = [
'THE BEST CLUE IS OFTEN THE ONE YOU ALMOST IGNORED.',
'COMPARE WHAT MUST BE TRUE BEFORE YOU GUESS WHAT MIGHT BE TRUE.',
'WHEN A PATH CLOSES TOO EARLY, LOOK FOR THE RULE YOU USED TOO SOON.',
'A PUZZLE BECOMES SMALLER EACH TIME ONE POSSIBILITY IS REMOVED.',
'GOOD REASONING LEAVES A TRAIL YOU CAN CHECK AGAIN.',
'IF TWO CHOICES LOOK EQUAL, SEARCH FOR THE CONSTRAINT THEY DO NOT SHARE.',
'A WRONG MOVE IS MOST USEFUL WHEN YOU CAN EXPLAIN WHY IT FAILED.',
'PATTERNS BECOME CLEARER WHEN YOU STOP CHANGING SEVERAL THINGS AT ONCE.',
'THE SHORTEST SOLUTION IS NOT ALWAYS THE EASIEST ONE TO NOTICE.',
'USE THE STRONGEST FACT FIRST AND LET THE WEAKER CLUES FOLLOW.',
'IF EVERY OPTION FAILS EXCEPT ONE, THE LAST OPTION IS NO LONGER A GUESS.',
'A CLEAN NOTATION SYSTEM CAN SAVE MORE TIME THAN A FAST GUESS.',
'CHECK THE EDGES OF A PUZZLE BEFORE YOU ASSUME THE CENTER IS HARDER.',
'LOCAL RULES OFTEN CREATE GLOBAL CONSEQUENCES.',
'A GOOD HINT CHANGES WHAT YOU NOTICE WITHOUT TAKING THE PUZZLE AWAY.',
'RESTARTING WITH BETTER INFORMATION IS NOT THE SAME AS STARTING OVER.',
'WHEN THE BOARD FEELS CROWDED, SEPARATE FACTS FROM ASSUMPTIONS.',
'CONSISTENT SMALL DEDUCTIONS CAN SOLVE A PROBLEM THAT RESISTS ONE BIG IDEA.',
'THE MOST USEFUL QUESTION IS OFTEN WHAT WOULD BECOME IMPOSSIBLE NEXT.',
'REASONING IMPROVES WHEN EACH STEP CAN BE EXPLAINED IN ONE SENTENCE.'
]

# Compact clue bank used by the build-time 5x5 crossword generator.
CROSSWORD_CLUES = {
# 3 letters
'ACE':'Top playing card','AIR':'What we breathe','ANT':'Tiny colony insect','APE':'Primate with no tail','ARC':'Part of a circle','ARM':'Sleeve filler','ART':'Creative work','ASH':'Fireplace residue','BAD':'Not good','BAG':'Container with handles','BAR':'Counter for drinks','BAT':'Flying mammal or club','BAY':'Coastal inlet','BED':'Place to sleep','BEE':'Honey-making insect','BOW':'Front of a ship, sometimes','BOX':'Square container','BUS':'City transit vehicle','CAN':'Metal container','CAP':'Hat with a brim','CAR':'Road vehicle','CAT':'Purring pet','COW':'Farm animal that gives milk','CUP':'Small drinking vessel','DAY':'Opposite of night','DEN':'Animal shelter','DOG':'Barking pet','DRY':'Not wet','EAR':'Organ for hearing','EEL':'Long slippery fish','EGG':'Breakfast item with a shell','ELK':'Large antlered animal','END':'Final part','EYE':'Organ for sight','FAN':'Device that moves air','FAR':'Not near','FIN':'Fish appendage','FIT':'In good shape','FLY':'Travel through the air','FOX':'Clever wild canine','FUN':'Enjoyment','GAS':'Fuel at many stations','GEM':'Precious stone','GYM':'Place for exercise','HAM':'Meat from a pig','HAT':'Headwear','HEN':'Egg-laying bird','HOT':'Opposite of cold','ICE':'Frozen water','INK':'Pen fluid','JAR':'Glass container','JOB':'Paid work','KEY':'Opens a lock','LAP':'One circuit of a track','LAW':'Rule enforced by government','LEG':'Lower limb','LID':'Container cover','LOG':'Cut tree section','MAP':'Guide to places','MUD':'Wet soil','NET':'Mesh used in sports','OAR':'Boat propeller by hand','OIL':'Liquid used for cooking or engines','OWL':'Nocturnal bird','PAN':'Flat cooking vessel','PEN':'Writing tool','PIE':'Baked dish with a crust','PIG':'Farm animal with a snout','PIN':'Small fastening point','POT':'Cooking container','RAM':'Male sheep','RED':'Color of many stop signs','RUG':'Small floor covering','RUN':'Move quickly on foot','SEA':'Large body of salt water','SKY':'What clouds cross','SUN':'Star at the center of our system','TEA':'Drink made by steeping leaves','TOE':'Digit on a foot','TOP':'Highest part','TOY':'Child plaything','VAN':'Road vehicle larger than a car','WEB':'Spider construction','YAK':'Long-haired bovine','ZIP':'Close with interlocking teeth',
# 5 letters
'ABOUT':'Approximately','ABOVE':'Higher than','ACTOR':'Stage performer','ADMIT':'Confess or allow in','AFTER':'Later than','AGENT':'Representative','AGREE':'Share the same opinion','ALARM':'Warning signal','ALBUM':'Collection of songs or photos','ALERT':'Watchful and ready','ALIEN':'Being from another world','ALIGN':'Put in a straight line','ALIVE':'Not dead','ALLOW':'Permit','ALONE':'Without company','ALTER':'Change','AMONG':'In the middle of','ANGER':'Strong displeasure','ANGLE':'Figure made by two rays','APPLE':'Fruit that can be red or green','ARENA':'Place for contests','ARGUE':'Disagree in words','ARISE':'Get up','ARRAY':'Ordered collection','ASIDE':'To one side','ASSET':'Thing of value','AUDIO':'Sound recording or signal','AUDIT':'Formal examination of accounts','AVOID':'Keep away from','AWARD':'Prize for achievement','AWARE':'Knowing about something','BASIC':'Fundamental','BEACH':'Sandy shore','BEGIN':'Start','BELOW':'Lower than','BENCH':'Long seat','BIRTH':'Beginning of life','BLACK':'Darkest common color','BLIND':'Unable to see','BLOCK':'Solid piece or obstruction','BLOOD':'Red fluid in the body','BOARD':'Flat panel','BRAIN':'Organ used for thought','BRAND':'Product name or mark','BREAD':'Baked staple food','BREAK':'Separate into pieces','BRIEF':'Short in duration','BRING':'Carry toward here','BROAD':'Wide','BROWN':'Earthy color','BUILD':'Construct','CABLE':'Thick wire or connection','CARRY':'Hold and move','CATCH':'Grab something moving','CAUSE':'Reason something happens','CHAIN':'Series of linked rings','CHAIR':'Seat for one person','CHART':'Graphic display of information','CHASE':'Run after','CHEAP':'Low in price','CHECK':'Examine for correctness','CHEST':'Upper front of the torso','CHIEF':'Leader or most important','CHILD':'Young person','CIVIL':'Polite or relating to citizens','CLAIM':'State as true','CLASS':'Group of students','CLEAN':'Free from dirt','CLEAR':'Easy to understand','CLICK':'Press a mouse button','CLOCK':'Device that tells time','CLOSE':'Shut','COACH':'Team instructor','COAST':'Land beside the sea','COULD':'Past or conditional form of can','COUNT':'Determine how many','COURT':'Place for a trial or a game','COVER':'Put something over','CRAFT':'Skillful making','CRASH':'Sudden violent collision','CREAM':'Rich dairy product','CRIME':'Illegal act','CROSS':'Go from one side to another','CROWD':'Large group of people','CROWN':'Royal headpiece','CURVE':'Bent line','CYCLE':'Repeat in a sequence','DAILY':'Happening every day','DANCE':'Move rhythmically to music','DEATH':'End of life','DELAY':'Make something late','DEPTH':'Distance from top to bottom','DOUBT':'Uncertainty','DOZEN':'Twelve','DRAFT':'Early written version','DRAMA':'Serious play or conflict','DREAM':'Images during sleep','DRESS':'One-piece garment','DRILL':'Tool for making holes','DRINK':'Take liquid by mouth','DRIVE':'Operate a vehicle','EAGER':'Very keen','EARLY':'Before expected time','EARTH':'Our planet','EIGHT':'Number after seven','ELITE':'Best or most skilled group','EMPTY':'Containing nothing','ENEMY':'Opponent or foe','ENJOY':'Take pleasure in','ENTER':'Go in','ENTRY':'Way in or an item in a list','EQUAL':'The same in value','ERROR':'Mistake','EVENT':'Something that happens','EVERY':'Each one without exception','EXACT':'Completely precise','EXIST':'Be real','EXTRA':'More than usual','FAITH':'Strong trust or belief','FALSE':'Not true','FAULT':'Defect or responsibility for error','FIELD':'Open land or area of study','FIFTH':'Position after fourth','FIGHT':'Physical or verbal conflict','FINAL':'Last','FIRST':'Before all others','FIXED':'Repaired or unmoving','FLASH':'Brief burst of light','FLEET':'Group of ships','FLOOR':'Surface you walk on indoors','FLUID':'Substance that flows','FOCUS':'Center of attention','FORCE':'Push or pull','FORTH':'Forward or onward','FORTY':'Four tens','FOUND':'Discovered','FRAME':'Border around a picture','FRESH':'Recently made or not stale','FRONT':'Forward-facing part','FRUIT':'Seed-bearing food','GIANT':'Very large being','GIVEN':'Provided','GLASS':'Transparent window material','GLOBE':'Spherical model of Earth','GRACE':'Elegance of movement','GRADE':'Mark of quality or school level','GRAND':'Large or impressive','GRANT':'Give or award','GRASS':'Green lawn plant','GREAT':'Very good or large','GREEN':'Color of healthy leaves','GROUP':'Collection of things','GUARD':'Protect or watch','GUESS':'Answer without full certainty','GUEST':'Invited visitor','GUIDE':'Person or thing that directs','HAPPY':'Feeling pleasure','HEART':'Organ that pumps blood','HEAVY':'Not light in weight','HORSE':'Large riding animal','HOTEL':'Place to stay overnight','HOUSE':'Building used as a home','HUMAN':'Person','IDEAL':'Perfect example','IMAGE':'Picture or visual representation','INDEX':'Alphabetical reference list','INNER':'On the inside','INPUT':'Data entered into a system','ISSUE':'Topic or problem','JOINT':'Place where two parts meet','JUDGE':'Decide in court or competition','KNOWN':'Recognized or understood','LABEL':'Tag with information','LARGE':'Big','LASER':'Focused beam of light','LATER':'Afterward','LAUGH':'Sound of amusement','LAYER':'One thickness over another','LEARN':'Gain knowledge','LEASE':'Rental agreement','LEAST':'Smallest amount','LEAVE':'Go away','LEGAL':'Allowed by law','LEVEL':'Flat or a stage of progress','LIGHT':'Visible illumination','LIMIT':'Maximum boundary','LOCAL':'Nearby','LOGIC':'Reasoning by rules','LOWER':'Move down or less high','LUCKY':'Having good fortune','LUNCH':'Midday meal','MAJOR':'Important or primary','MAKER':'One who creates','MARCH':'Walk in steady steps','MATCH':'Contest or equal pair','MAYOR':'City leader','MEDIA':'Means of communication','METAL':'Hard conductive material','MINOR':'Less important','MODEL':'Representation or example','MONEY':'Currency','MONTH':'Calendar period','MORAL':'Lesson about right and wrong','MOTOR':'Machine that produces motion','MOUNT':'Climb or attach','MOUSE':'Small rodent or computer device','MOUTH':'Opening used to eat and speak','MOVIE':'Film','MUSIC':'Organized sound','NEVER':'At no time','NIGHT':'Dark part of the day','NOISE':'Unwanted sound','NORTH':'Compass direction opposite south','NOVEL':'Book-length work of fiction','NURSE':'Medical caregiver','OCEAN':'Vast body of salt water','OFFER':'Present for acceptance','OFTEN':'Frequently','ORDER':'Arrangement or command','OTHER':'Different one','PAINT':'Colored coating','PANEL':'Flat section or group of judges','PAPER':'Thin writing material','PARTY':'Social gathering','PEACE':'Freedom from conflict','PHASE':'Stage in a process','PHONE':'Device for calls','PHOTO':'Photograph','PIECE':'Part of a whole','PILOT':'Person who flies an aircraft','PITCH':'Throw or musical tone','PLACE':'Location','PLAIN':'Simple or level land','PLANE':'Aircraft or flat surface','PLANT':'Living organism that usually grows in soil','PLATE':'Flat dish','POINT':'Sharp tip or exact location','POWER':'Ability or energy','PRESS':'Push or news media','PRICE':'Cost','PRIDE':'Satisfaction in achievement','PRIME':'First in importance or divisible only by itself and one','PRINT':'Produce text on paper','PRIOR':'Earlier','PRIZE':'Reward','PROOF':'Evidence showing truth','PROUD':'Feeling satisfaction','QUEEN':'Female monarch or chess piece','QUICK':'Fast','QUIET':'Making little sound','RADIO':'Broadcast receiver','RAISE':'Lift upward','RANGE':'Span between limits','RAPID':'Fast-moving','RATIO':'Relationship between quantities','REACH':'Extend far enough to touch','READY':'Prepared','REFER':'Direct attention to','RIGHT':'Correct or opposite of left','RIVAL':'Competitor','RIVER':'Large natural stream','ROBOT':'Programmable machine','ROUGH':'Not smooth','ROUND':'Circular or one stage of a contest','ROUTE':'Path between places','ROYAL':'Relating to a king or queen','RURAL':'Relating to the countryside','SCALE':'Measuring system or relative size','SCENE':'Part of a play or visible setting','SCOPE':'Range or extent','SCORE':'Points in a game','SENSE':'Meaning or a faculty like sight','SERVE':'Provide or deliver','SEVEN':'Number after six','SHAPE':'Form or outline','SHARE':'Use or own together','SHARP':'Having a fine edge','SHEET':'Large thin piece or bed linen','SHELF':'Horizontal storage surface','SHELL':'Hard outer covering','SHIFT':'Move position or work period','SHIRT':'Upper-body garment','SHOCK':'Sudden surprise or electric jolt','SHORT':'Not long','SIGHT':'Ability to see','SINCE':'From a past time until now','SIXTH':'Position after fifth','SKILL':'Learned ability','SLEEP':'Natural state of rest','SMALL':'Little in size','SMART':'Clever','SMILE':'Happy facial expression','SOLID':'Firm and not liquid','SOLVE':'Find the answer','SOUND':'Something heard','SOUTH':'Compass direction opposite north','SPACE':'Area or outer universe','SPARE':'Extra','SPEAK':'Talk','SPEED':'Rate of motion','SPEND':'Use money or time','SPORT':'Athletic activity','STAGE':'Platform for performers or phase','STAKE':'Post or something at risk','STAND':'Be upright','START':'Begin','STATE':'Condition or political region','STEAM':'Water vapor','STEEL':'Strong metal alloy','STICK':'Thin piece of wood','STILL':'Not moving','STOCK':'Supply or company shares','STONE':'Rock material','STORE':'Shop or keep for later','STORM':'Severe weather','STORY':'Narrative','STRIP':'Long narrow piece','STUDY':'Learn carefully','STYLE':'Distinctive manner','SUGAR':'Sweet crystals','SUPER':'Excellent or above','SWEET':'Sugary tasting','TABLE':'Furniture with a flat top','TASTE':'Flavor sense','TEACH':'Help someone learn','TEETH':'Plural of tooth','THEIR':'Belonging to them','THEME':'Central subject','THERE':'In that place','THICK':'Not thin','THING':'Object or matter','THINK':'Use the mind','THIRD':'Position after second','THREE':'Number after two','THROW':'Send through the air','TIGHT':'Not loose','TITLE':'Name of a work','TODAY':'This day','TOPIC':'Subject','TOTAL':'Complete amount','TOUCH':'Make physical contact','TOUGH':'Strong or difficult','TOWER':'Tall narrow structure','TRACK':'Path or recorded sequence','TRADE':'Exchange goods','TRAIN':'Rail vehicle or practice','TREAT':'Act toward or special food','TREND':'General direction of change','TRIAL':'Test or court proceeding','TRUCK':'Large road vehicle','TRUST':'Confidence in reliability','TRUTH':'What is true','TWICE':'Two times','UNDER':'Below','UNION':'Joining together','UNITY':'State of being one','UNTIL':'Up to a time','UPPER':'Higher','URBAN':'Relating to a city','USAGE':'Way something is used','USUAL':'Normal','VALID':'Logically or legally sound','VALUE':'Worth','VIDEO':'Moving-picture recording','VISIT':'Go to see','VITAL':'Essential','VOICE':'Sound made in speaking','WASTE':'Use carelessly','WATCH':'Look at or a wrist timepiece','WATER':'Clear liquid essential to life','WHEEL':'Circular rotating part','WHERE':'At what place','WHICH':'What one or ones','WHITE':'Lightest common color','WHOLE':'Complete','WOMAN':'Adult female person','WORLD':'Earth and its people','WORRY':'Feel anxious','WORSE':'More bad','WORTH':'Value','WOULD':'Conditional form of will','WRITE':'Put words on a surface','WRONG':'Not correct','YOUNG':'Not old','YOUTH':'Young people or early life',
}


CROSSWORD_CLUES.update({
'ACT':'Something done or a stage performance','ADD':'Combine numbers','AGE':'How old someone is','AID':'Help','AIM':'Target or purpose','ALE':'Type of beer','ALL':'Every one','AND':'Basic joining word','ANY':'One or some without restriction','APT':'Suitable or fitting','AWE':'Feeling of wonder','AXE':'Tool for chopping wood','BIT':'Small piece','BOA':'Large constricting snake','BOG':'Wet spongy ground','BOY':'Young male person','BUN':'Small bread roll','BUY':'Purchase','CAB':'Taxi','COD':'Common food fish','COT':'Small simple bed','CUT':'Slice with a sharp tool','DAM':'Barrier across water','DIP':'Brief downward movement','DOT':'Small round mark','DUO':'Pair of performers','DYE':'Substance used to color','EAT':'Consume food','EGO':'Sense of self','ELF':'Small mythical being','ELM':'Type of tree','ERA':'Historical period','EVE':'Day or evening before an event','EWE':'Female sheep','FIG':'Sweet soft fruit','FIR':'Evergreen tree','FOG':'Low cloud near the ground','FRY':'Cook in hot oil','GAP':'Opening or space between','GEL':'Jellylike substance','GIN':'Clear spirit flavored with juniper','GUM':'Chewy candy or tissue around teeth','GUN':'Weapon that fires projectiles','GUY':'Informal term for a man','HIP':'Joint beside the pelvis','HIT':'Strike','HOE':'Garden tool with a flat blade','HOP':'Small jump','HUB':'Central connection point','HUG':'Embrace','HUT':'Small simple shelter','INN':'Small lodging house','ION':'Charged atom or molecule','IVY':'Climbing evergreen plant','JAM':'Fruit spread or traffic blockage','JET':'Fast aircraft','JOY':'Great happiness','KID':'Child','KIT':'Set of tools or equipment','LAB':'Room for scientific work','LIP':'Edge of the mouth','LOT':'Large amount or parcel of land','LOW':'Not high','MAD':'Angry or wildly unreasonable','MAN':'Adult male person','MAT':'Small floor covering','MIX':'Combine together','NAP':'Short sleep','NEW':'Not old','NOD':'Move the head up and down','NOR':'Negative conjunction','OAK':'Strong hardwood tree','ODD':'Not even or unusual','OLD':'Not new','ONE':'First counting number','ORE':'Rock containing useful metal','PAD':'Cushion or writing tablet','PEA':'Small green vegetable seed','PET':'Animal kept for companionship','POD':'Seed case','POP':'Short sharp sound','RAT':'Long-tailed rodent','RAW':'Uncooked','RAY':'Narrow beam of light','RIB':'Curved bone in the chest','RIM':'Outer edge of a circle','ROW':'Line of things or propel a boat','RUB':'Move against with pressure','SAP':'Fluid circulating in a plant','SAW':'Tool with a toothed blade','SAY':'Speak words','SET':'Put in place or a collection','SEW':'Join with needle and thread','SHY':'Reserved around others','SIT':'Rest on a seat','SKI':'Long runner used on snow','SON':'Male child','SOW':'Plant seeds','SPY':'Secret observer','TAN':'Light brown color','TAP':'Light touch or faucet','TIE':'Fasten together or equal score','TIN':'Silvery metal or metal container','TIP':'Pointed end or small piece of advice','VET':'Animal doctor','WAX':'Substance used in candles','WET':'Covered with water','WIN':'Finish first','WIT':'Mental sharpness or humor','YES':'Word of agreement','ZOO':'Place where animals are exhibited','ABS':'Abdominal muscles, informally','ADO':'Fuss or commotion','AGO':'Before the present time','AIL':'Be unwell','AIR':'What we breathe','AMP':'Unit of electric current, informally','ANN':'A woman’s name, sometimes','ARK':'Large biblical vessel','ATE':'Consumed food','AUK':'Northern seabird','AVE':'Street abbreviation, sometimes','BIB':'Cloth worn under a baby’s chin','BIN':'Storage container','BUD':'Unopened flower','BUG':'Small insect or software flaw','CAM':'Rotating machine part','COP':'Police officer, informally','CUE':'Signal to act','DAB':'Small amount applied lightly','DOE':'Female deer','DON':'Put on clothing','EMU':'Large flightless bird','FAD':'Short-lived fashion','FEE':'Charge for a service','FIB':'Small lie','FOE':'Enemy','GAG':'Joke or device that blocks speech','HAY':'Dried grass for animals','HEX':'Six-sided spell or curse, informally','JOG':'Run slowly','KEG':'Small barrel','LAG':'Fall behind','LED':'Guided in the past tense','LOT':'Parcel or large amount','MOP':'Cleaning tool with an absorbent head','MUG':'Large cup','NUT':'Hard-shelled seed','OAT':'Cereal grain','ORB':'Sphere','PAL':'Friend','PIT':'Deep hole','RAG':'Old cloth','RAP':'Quick knock or rhythmic music','ROD':'Straight thin bar','ROT':'Decay','RUE':'Regret','RYE':'Cereal grain','SIN':'Wrongdoing','SIP':'Drink a small amount','SOD':'Piece of grass-covered soil','SUM':'Total','TAG':'Small label','TAR':'Dark road-surfacing material','URN':'Vase-shaped container','WIG':'Artificial hairpiece','YAM':'Starchy root vegetable','YEN':'Japanese currency','ZAP':'Strike suddenly with energy'
})

# Additional common three-letter crossword fill with original clue text. These
# intentionally favor ordinary words over abbreviation-heavy crosswordese.
CROSSWORD_CLUES.update({
'ACE':'Top playing card or a highly skilled person','ANT':'Small social insect','APE':'Large primate','ARC':'Part of a curve','ARE':'Present plural form of be','ARM':'Upper limb','ART':'Creative expression','ASH':'Powder left after burning','ASK':'Request information','BAD':'Not good','BAG':'Flexible container','BAR':'Long narrow piece or serving counter','BAT':'Flying mammal or sports implement','BAY':'Broad coastal inlet','BEE':'Pollinating insect','BET':'Wager','BID':'Offer a price','BIG':'Large in size','BOX':'Container with flat sides','BUS':'Public road vehicle','CAN':'Metal container or be able to','CAP':'Head covering','CAR':'Road vehicle','CAT':'Small domestic feline','CRY':'Shed tears or call loudly','CUP':'Small drinking vessel','DAY':'Twenty-four-hour period','DEN':'Animal shelter or private room','DIE':'Singular form of dice','DIG':'Break up earth or excavate','DOG':'Domestic canine','DRY':'Not wet','EEL':'Long snake-shaped fish','END':'Final part','EYE':'Organ of sight','FAN':'Device that moves air or devoted admirer','FAR':'At a great distance','FAT':'Body tissue that stores energy','FIN':'Fish appendage','FIT':'Suitable or physically healthy','FIX':'Repair','FLY':'Travel through air or winged insect','FOR':'Intended to benefit','FOX':'Wild canine','FUN':'Enjoyment','GAS':'Fuel in gaseous form','GEM':'Precious stone','GET':'Receive or obtain','GYM':'Place for exercise','HAM':'Cured pork','HAT':'Head covering','HEN':'Female chicken','HER':'Female object or possessive pronoun','HIM':'Male object pronoun','HOT':'High in temperature','ICE':'Frozen water','INK':'Fluid used for writing','JAR':'Wide-mouthed container','JOB':'Paid work','KEY':'Object used to open a lock','LAP':'One circuit of a course','LAW':'Rule enforced by authority','LEG':'Lower limb','LET':'Allow','LID':'Removable cover','LOG':'Written record or cut tree section','MAP':'Diagram of an area','MEN':'Plural of man','MUD':'Wet earth','NET':'Open mesh of cord','NOT':'Word of negation','OFF':'Not operating or away from','OIL':'Slippery liquid used as fuel or lubricant','PAN':'Shallow cooking vessel','PEN':'Writing instrument or animal enclosure','PIE':'Baked dish with a crust','PIG':'Farm animal with a snout','PIN':'Small pointed fastener','POT':'Deep cooking container','RED':'Color of a ripe tomato','RID':'Free from something unwanted','RIP':'Tear apart','RUG':'Small floor covering','RUN':'Move quickly on foot','SAD':'Unhappy','SEA':'Large body of salt water','SEE':'Perceive with the eyes','SHE':'Female subject pronoun','SIX':'Number after five','SKY':'Expanse above the earth','SUN':'Star at the center of our solar system','TEN':'Number after nine','TOP':'Highest part','TOY':'Object for play','TRY':'Make an attempt','TWO':'Number after one','USE':'Employ for a purpose','VAN':'Enclosed road vehicle','WAR':'Armed conflict','WEB':'Network of threads or linked pages','WHO':'Question word asking about a person','YOU':'Person being addressed','ZIP':'Fastener with interlocking teeth'
})


# More common words for lexical procedural games. Kept curated rather than importing a huge noisy dictionary.
EXTRA_LEXICON = '''
ABLE ACHE ACID ACORN ACTS ADDED ADORE AERIAL AFTERNOON AGILE AHEAD AIDED AISLE ALMOND AMBER AMPLE ANGEL ANKLE APRIL ARCHER ARROW AWAKE BAGEL BALCONY BANANA BANDAGE BANKER BARREL BASIN BASKET BATTERY BEANS BEARD BEAST BELLY BERRY BIBLE BIRTHDAY BISCUIT BLANKET BLOOM BLOSSOM BLUEBERRY BOAT BORDER BOTTLE BOTTOM BOUNCE BOWL BRANCH BRAVE BREEZE BRICK BRIDE BROOK BROOM BRUSH BUCKET BUDDY BUGLE BUTTER BUTTON CABIN CACTUS CAFE CAMEL CAMERA CAMP CANDLE CANDY CANOE CAPTAIN CARPET CARROT CARTON CASTLE CEDAR CELLO CEREAL CHALK CHAPTER CHEESE CHERRY CHICKEN CHISEL CHOCOLATE CIRCLE CLIFF CLOSET CLOWN COCOA COFFEE COIN COMB CORAL CORN COTTAGE COUCH CRANE CREEK CRISP CUBE CURTAIN DAISY DELTA DICE DINNER DOOR DONUT DOUGH DRAGON DUNE ECHO EDITOR ELBOW ELEPHANT ENGINE FAIRY FENCE FERRY FINCH FIRE FLAKE FLASK FLOWER FLUTE FOLDER FOREST FORK FROST FUDGE GARDEN GARLIC GLOVE GOAT GOOSE GRAPE GROVE GUITAR HAMMER HARBOR HERON HONEY HOOD HOOK HURDLE ICEBERG IRIS ISLAND JACKET JOKER JUICE JUMP KETTLE KICK KNIFE KNIGHT LADDER LADYBUG LAMP LEMON LENS LILAC LIME LITER LOBSTER LOCK LOTUS MAIL MAPLE MARBLE MARINE MARKET MEDIC MELON METRO MINT MIRROR MIST MOCHA MOON MORNING MOSS MOTEL MOUNTAIN MUG MURAL MUSHROOM NEPTUNE NOODLE NOTE OAK OATMEAL OBOE OLIVE ONION ORANGE OUNCE OUTER OVAL OVEN PANDA PARK PASTA PATIO PAWN PEACH PEAR PENCIL PEPPER PICNIC PIG PINE PIZZA PLAZA PLUM POEM POND POPPY PORT POTATO PULSE PUMPKIN RADAR RADISH RAIN RAVEN REEF RIDGE ROAST ROBE ROOF ROPE ROSE RULER SALAD SAND SATURN SAUCE SCARF SCHOOL SCREW SCRIPT SEAL SEAT SEED SHADOW SHARK SHIELD SHOE SHORE SHOWER SINK SKATE SKETCH SKY SLOPE SNACK SNOW SOAP SOCCER SOIL SOUP SPADE SPADE? SPINE SPOON SPRING SQUID STAMP STAR STREAM SURF SWAN SWIM TART TAXI TEAPOT TEMPO TENT TIGER TISSUE TOAST TOMATO TOOL TORCH TOWEL TRACTOR TRAIL TRUMPET TUB TULIP TURNIP UMBRELLA VALLEY VAN VEST VIOLET WAFFLE WALL WAVE WHEAT WHISK WINDOW WRENCH YAK YEAST ZEBRA
ABILITY ABSENT ACCEPT ACROSS ACTION ACTIVE ACTUAL ADVICE ALMOST ANCIENT ANSWER ANYONE APPEAR APPLYING AROUND ARRIVE AUTHOR AUTUMN BALANCE BEAUTY BEFORE BEHIND BELIEVE BETTER BICYCLE BOTTLE BRIGHT BROTHER CAMERA CAREFUL CENTER CHANCE CHANGE CHOICE CHOOSE COMMON CORNER CREATE CURRENT DANGER DECIDE DESIGN DIFFERENT DINNER DIRECT DISTANT DOCTOR EASILY EFFECT EFFORT EITHER ENERGY ENOUGH EXAMPLE FAMILY FAMOUS FASTER FATHER FEATURE FEELING FIGURE FINISH FOLLOW FUTURE GENTLE GROUND HANDLE HELPFUL HISTORY HONEST HUNGRY IMPORTANT INSIDE ISLAND KITCHEN LANGUAGE LARGER LEADER LETTER LITTLE MACHINE MATTER MEMBER MEMORY MINUTE MOMENT MORNING MOTHER NATURE NEARLY NOTICE NUMBER OBJECT OFFICE PEOPLE PERFECT PERSON PICTURE PLAYER POSSIBLE PRESENT PROBLEM PROCESS PROJECT QUESTION REASON RESULT RETURN SAFETY SIMPLE SINGLE SLOWLY SPECIAL STREET STRONG SYSTEM TEACHER TOGETHER TRAVEL USEFUL WINDOW WINTER WITHOUT WONDER WORKING WRITER
'''.replace('?','')


def norm_words(seq):
    out=[]
    for w in seq:
        w=re.sub('[^A-Z]','',w.upper())
        if 3<=len(w)<=12: out.append(w)
    return out

BASE_WORDS=parse_base_words()
theme_words=[w for vals in THEMES.values() for w in vals]
compound_rows=[]
for line in COMPOUND_LINES.strip().splitlines():
    word,a,b=[x.strip().upper() for x in line.split('|')]
    compound_rows.append({'word':word,'pieces':[a,b]})
compound_words=[r['word'] for r in compound_rows]
extra=EXTRA_LEXICON.split()
crypto_words=' '.join(CRYPTO_START+CRYPTO_VERB+CRYPTO_END+CRYPTO_EXTRA).replace('.','').split()
clue_words=list(CROSSWORD_CLUES)
LEXICON=sorted(set(norm_words(BASE_WORDS+theme_words+compound_words+extra+crypto_words+clue_words)))
# Avoid a few contextually awkward artifacts in open-ended word games.
BLOCK={'CALIF','HENRY','JONES','PETER','SMITH','TERRY','TEXAS','CHINA','JAPAN'}
LEXICON=[w for w in LEXICON if w not in BLOCK]

# ---------- Groups ----------
group_categories=[]
family_cycle=['nature','food','arts','places','objects','science','activity','general']
for idx,(label,vals) in enumerate(THEMES.items()):
    vals=[] if not vals else vals
    uniq=[]
    for w in vals:
        if w not in uniq: uniq.append(w)
    if len(uniq)>=4:
        group_categories.append({'id':f'theme-{idx:03d}','label':label,'members':uniq[:4],'kind':'concrete','difficulty':1+(idx%2),'family':family_cycle[idx%len(family_cycle)]})
for idx,(label,members,kind,diff) in enumerate(GROUP_SPECIAL):
    group_categories.append({'id':f'special-{idx:03d}','label':label,'members':members,'kind':kind,'difficulty':diff,'family':'wordplay' if kind=='wordplay' else 'abstract'})

# ---------- Word Search themes ----------
word_search=[]
for i,(name,vals) in enumerate(THEMES.items()):
    words=[]
    for w in vals:
        w=re.sub('[^A-Z]','',w.upper())
        if 3<=len(w)<=12 and w not in words: words.append(w)
    if len(words)>=8:
        word_search.append({'id':f'ws-{i:03d}','name':name,'words':words,'difficulty':1+(i%3)})

# ---------- Theme Trail prebuild ----------
def snake(n=5):
    return [r*n+c for r in range(n) for c in (range(n) if r%2==0 else range(n-1,-1,-1))]

def random_hamiltonian(seed,n=5):
    rnd=random.Random(seed)
    def neighbors(i,used):
        r,c=divmod(i,n);out=[]
        for dr,dc in ((1,0),(-1,0),(0,1),(0,-1)):
            rr,cc=r+dr,c+dc
            if 0<=rr<n and 0<=cc<n:
                j=rr*n+cc
                if j not in used:out.append(j)
        rnd.shuffle(out)
        # Warnsdorff-style ordering avoids dead ends while retaining seeded variety.
        out.sort(key=lambda j:sum(1 for z in ((j//n+1,j%n),(j//n-1,j%n),(j//n,j%n+1),(j//n,j%n-1)) if 0<=z[0]<n and 0<=z[1]<n and z[0]*n+z[1] not in used))
        return out
    def search(start):
        path=[start];used={start}
        def rec(cur):
            if len(path)==n*n:return True
            for nxt in neighbors(cur,used):
                used.add(nxt);path.append(nxt)
                if rec(nxt):return True
                path.pop();used.remove(nxt)
            return False
        return path if rec(start) else None
    starts=list(range(n*n));rnd.shuffle(starts)
    for start in starts:
        out=search(start)
        if out:return out
    return snake(n)

def transform_idx(i,mode,n=5):
    r,c=divmod(i,n)
    if mode==0: rr,cc=r,c
    elif mode==1: rr,cc=c,n-1-r
    elif mode==2: rr,cc=n-1-r,n-1-c
    elif mode==3: rr,cc=n-1-c,r
    elif mode==4: rr,cc=r,n-1-c
    elif mode==5: rr,cc=n-1-r,c
    elif mode==6: rr,cc=c,r
    else: rr,cc=n-1-c,n-1-r
    return rr*n+cc

def trail_subsets(words):
    words=list(dict.fromkeys(words))
    out=[]
    def rec(start,chosen,total):
        if total==25:
            if 4<=len(chosen)<=7: out.append(tuple(chosen))
            return
        if total>25 or len(chosen)>=7: return
        for j in range(start,len(words)):
            rec(j+1,chosen+[words[j]],total+len(words[j]))
    rec(0,[],0)
    return out

trail_boards=[]
for ti,(name,vals) in enumerate(THEMES.items()):
    candidates=[re.sub('[^A-Z]','',w.upper()) for w in vals if 3<=len(re.sub('[^A-Z]','',w.upper()))<=8]
    combos=trail_subsets(candidates)
    if not combos: continue
    for vi,combo in enumerate(combos[:4]):
        rnd=random.Random(f'trail:{ti}:{vi}')
        words=list(combo);rnd.shuffle(words)
        order=random_hamiltonian(f'trail-path:{ti}:{vi}',5)
        mode=(ti+vi)%8
        order=[transform_idx(i,mode) for i in order]
        if (ti+vi)%2: order=list(reversed(order))
        grid=['']*25;paths=[];k=0
        for w in words:
            path=order[k:k+len(w)];k+=len(w)
            for p,ch in zip(path,w):grid[p]=ch
            paths.append(path)
        if all(grid):
            trail_boards.append({'id':f'trail-{ti:03d}-{vi}','theme':name,'words':words,'grid':grid,'paths':paths,'difficulty':['Easy','Medium','Hard'][(len(words)+ti+vi)%3]})

# ---------- Word Pieces prebuild ----------
compound_map={r['word']:r['pieces'] for r in compound_rows}
def can_construct(pieces,target):
    target=target.upper(); used=[False]*len(pieces)
    memo=set()
    def rec(pos):
        if pos==len(target): return True
        key=(pos,tuple(used))
        if key in memo:return False
        memo.add(key)
        for i,p in enumerate(pieces):
            if not used[i] and target.startswith(p,pos):
                used[i]=True
                if rec(pos+len(p)):return True
                used[i]=False
        return False
    return rec(0)

piece_boards=[]
compounds=list(compound_map)
for bi in range(360):
    rnd=random.Random(f'pieces:{bi}')
    chosen=rnd.sample(compounds,6)
    pieces=[]
    for w in chosen: pieces.extend(compound_map[w])
    rnd.shuffle(pieces)
    answers=[w for w in compounds if can_construct(pieces,w)]
    # ensure target words plus limited useful bonus combinations
    if len(answers)<6: continue
    difficulty=['Easy','Medium','Hard'][bi%3]
    piece_boards.append({'id':f'pieces-{bi:03d}','pieces':pieces,'answers':answers[:12],'difficulty':difficulty})

# ---------- Anagrams ----------
ana=defaultdict(list)
for w in LEXICON:
    if 4<=len(w)<=9:
        ana[''.join(sorted(w))].append(w)
anagram_sets=[]
for sig,words in ana.items():
    words=sorted(set(words))
    # all signatures are valid; multiple-answer signatures are especially valuable.
    length=len(words[0]);diff='Easy' if length<=5 else 'Medium' if length<=6 else 'Hard'
    anagram_sets.append({'id':'ana-'+hashlib.sha1(sig.encode()).hexdigest()[:10],'letters':sig,'answers':words,'difficulty':diff,'length':length})
anagram_sets.sort(key=lambda x:(x['difficulty'],x['length'],x['letters']))

# ---------- Letter Hive candidates ----------
hive_candidates=[]
word_letter_sets={w:set(w) for w in LEXICON if 4<=len(w)<=10}
def letter_mask(chars):
    m=0
    for ch in chars:m|=1<<(ord(ch)-65)
    return m
word_masks={w:letter_mask(chars) for w,chars in word_letter_sets.items()}
# Candidate alphabets come both from seven-unique-letter anchors and unions of
# ordinary words. The resulting pool is deterministically sampled before the
# more expensive answer enumeration, keeping the content build fast.
candidate_sets=set()
for chars in word_letter_sets.values():
    if len(chars)==7:candidate_sets.add(''.join(sorted(chars)))
union_words=[frozenset(chars) for chars in word_letter_sets.values() if 3<=len(chars)<=7]
for i,a in enumerate(union_words):
    for b in union_words[i+1:]:
        u=a|b
        if len(u)==7:candidate_sets.add(''.join(sorted(u)))
candidate_sets=sorted(candidate_sets)
rnd_hive=random.Random('wave4-hive-candidates');rnd_hive.shuffle(candidate_sets)
# Roughly one in five candidate alphabets meets the content quality threshold;
# 8k candidates provides a large reserve for the final 600 boards.
for letters in candidate_sets[:8000]:
    allowed_mask=letter_mask(letters)
    eligible=[w for w,m in word_masks.items() if m & ~allowed_mask == 0]
    for center in letters:
        bit=1<<(ord(center)-65)
        answers=[w for w in eligible if word_masks[w]&bit]
        answers=sorted(set(answers),key=lambda w:(-len(w),w))
        if 12<=len(answers)<=90 and any(len(w)>=7 for w in answers):
            avg=sum(map(len,answers))/len(answers);longc=sum(len(w)>=7 for w in answers)
            quality=len(answers)+longc*2+avg
            hive_candidates.append({'id':f'hive-{letters}-{center}','letters':letters,'center':center,'answers':answers,'answerCount':len(answers),'avgLength':round(avg,2),'quality':round(quality,2)})
hive_candidates.sort(key=lambda x:(x['quality'],x['avgLength'],x['id']))
# Keep 600 evenly distributed boards from the quality spectrum so difficulty
# bands retain variety rather than just selecting the densest letter sets.
if len(hive_candidates)>600:
    step=len(hive_candidates)/600
    hive_candidates=[hive_candidates[min(len(hive_candidates)-1,int(i*step))] for i in range(600)]
for i,h in enumerate(hive_candidates):
    q=i/max(1,len(hive_candidates)-1)
    h['difficulty']='Easy' if q<.34 else 'Medium' if q<.67 else 'Hard'

# ---------- Word Grid prebuild ----------
lex_grid=[w for w in LEXICON if 3<=len(w)<=8]
trie={}
for w in lex_grid:
    node=trie
    for ch in w: node=node.setdefault(ch,{})
    node['$']=w

def enum_grid(grid,n=4):
    found=set()
    def dfs(i,node,used):
        ch=grid[i]
        if ch not in node:return
        nxt=node[ch]
        if '$' in nxt:found.add(nxt['$'])
        r,c=divmod(i,n)
        for dr in (-1,0,1):
            for dc in (-1,0,1):
                if not dr and not dc:continue
                rr,cc=r+dr,c+dc
                j=rr*n+cc
                if 0<=rr<n and 0<=cc<n and j not in used:
                    dfs(j,nxt,used|{j})
    for i in range(n*n):dfs(i,trie,{i})
    return sorted(found,key=lambda w:(-len(w),w))

def random_path(n,length,rnd):
    for _ in range(100):
        start=rnd.randrange(n*n);path=[start];used={start}
        while len(path)<length:
            i=path[-1];rr,cc=divmod(i,n)
            opts=[]
            for dr in (-1,0,1):
                for dc in (-1,0,1):
                    if not dr and not dc:continue
                    r2,c2=rr+dr,cc+dc;j=r2*n+c2
                    if 0<=r2<n and 0<=c2<n and j not in used:opts.append(j)
            if not opts:break
            j=rnd.choice(opts);path.append(j);used.add(j)
        if len(path)==length:return path
    return None

weighted='EEEEEEEEEEEEAAAAAAAAAIIIIIIIIOOOOOOOONNNNNNRRRRRRTTTTTTLLLLSSSSUUUUDDDDGGGBBCCMMPPFFHHVVWWYYKJXQZ'
long_words=[w for w in lex_grid if 5<=len(w)<=8]
word_grid_boards=[]
seen_grids=set()
for bi in range(18000):
    if len(word_grid_boards)>=600:break
    rnd=random.Random(f'grid:{bi}')
    grid=['']*16
    planted=[]
    for w in rnd.sample(long_words,min(5,len(long_words))):
        p=random_path(4,len(w),rnd)
        if not p:continue
        ok=all(not grid[i] or grid[i]==ch for i,ch in zip(p,w))
        if not ok:continue
        for i,ch in zip(p,w):grid[i]=ch
        planted.append(w)
        if len(planted)>=2:break
    for i in range(16):
        if not grid[i]:grid[i]=rnd.choice(weighted)
    key=''.join(grid)
    if key in seen_grids:continue
    answers=enum_grid(grid)
    quality=[w for w in answers if w in LEXICON]
    longc=sum(len(w)>=5 for w in quality)
    if len(quality)<12 or longc<3:continue
    seen_grids.add(key)
    score=(sum(map(len,quality))/len(quality))*2.2 - min(len(quality),45)*.04 + longc*.22
    word_grid_boards.append({'id':f'grid-{len(word_grid_boards):03d}','grid':grid,'answers':quality[:80],'score':round(score,2),'answerCount':len(quality),'longWords':longc})
word_grid_boards.sort(key=lambda x:x['score'])
for i,b in enumerate(word_grid_boards):
    q=i/max(1,len(word_grid_boards)-1);b['difficulty']='Easy' if q<.34 else 'Medium' if q<.67 else 'Hard'

# ---------- Cryptograms ----------
crypto=[]
seen=set()
for s in CRYPTO_EXTRA:
    s=' '.join(s.upper().split())
    if s not in seen:seen.add(s);crypto.append(s)
for a in CRYPTO_START:
    for v in CRYPTO_VERB:
        for e in CRYPTO_END:
            s=f'{a} {v} {e}.'
            if s not in seen:
                seen.add(s);crypto.append(s)
            if len(crypto)>=1000:break
        if len(crypto)>=1000:break
    if len(crypto)>=1000:break
crypto_entries=[]
for i,s in enumerate(crypto):
    letters=len(set(re.sub('[^A-Z]','',s)))
    score=len(s)+letters*2
    crypto_entries.append({'id':f'crypto-{i:04d}','text':s,'score':score})
crypto_entries.sort(key=lambda x:x['score'])
for i,q in enumerate(crypto_entries):
    p=i/max(1,len(crypto_entries)-1);q['difficulty']='Easy' if p<.34 else 'Medium' if p<.67 else 'Hard'

# ---------- Mini Crossword build ----------
# A compact connected blocked 5x5 pattern: 8 three-letter entries + 2 five-letter entries.
pattern=['...##','...##','.....','##...','##...']
entries=[]
for direction in ('across','down'):
    if direction=='across':
        for r in range(5):
            c=0
            while c<5:
                if pattern[r][c]=='#': c+=1; continue
                cells=[]
                while c<5 and pattern[r][c]=='.': cells.append(r*5+c); c+=1
                if len(cells)>=3: entries.append((direction,cells))
    else:
        for c in range(5):
            r=0
            while r<5:
                if pattern[r][c]=='#': r+=1; continue
                cells=[]
                while r<5 and pattern[r][c]=='.': cells.append(r*5+c); r+=1
                if len(cells)>=3: entries.append((direction,cells))
words_by_len=defaultdict(list)
for w in CROSSWORD_CLUES:
    if len(w) in (3,5): words_by_len[len(w)].append(w)
words3=sorted(set(words_by_len[3])); words5=sorted(set(words_by_len[5]))
prefix2=defaultdict(list); suffix2=defaultdict(list)
for w in words3:
    prefix2[w[:2]].append(w); suffix2[w[1:]].append(w)

# The fixed blocked pattern can be decomposed into two small 3x3 crossing
# structures joined by one horizontal and one vertical five-letter entry.
# Precomputing those halves makes hundreds of clean fills essentially instant.
left_index=defaultdict(list)
for a0 in words3:
    for a1 in words3:
        if a0==a1: continue
        for d0 in prefix2.get(a0[0]+a1[0],[]):
            for d1 in prefix2.get(a0[1]+a1[1],[]):
                vals=(a0,a1,d0,d1)
                if len(set(vals))<4: continue
                key=(d0[2],d1[2],a0[2],a1[2])  # H5[0:2], V5[0:2]
                if len(left_index[key])<40:left_index[key].append(vals)
right_index=defaultdict(list)
for a3 in words3:
    for a4 in words3:
        if a3==a4: continue
        for d3 in suffix2.get(a3[1]+a4[1],[]):
            for d4 in suffix2.get(a3[2]+a4[2],[]):
                vals=(a3,a4,d3,d4)
                if len(set(vals))<4: continue
                key=(d3[0],d4[0],a3[0],a4[0])  # H5[3:5], V5[3:5]
                if len(right_index[key])<40:right_index[key].append(vals)

def crossword_from_words(a0,a1,h5,a3,a4):
    grid=list(a0)+['#','#']+list(a1)+['#','#']+list(h5)+['#','#']+list(a3)+['#','#']+list(a4)
    start_nums={};num=0
    starts=set(cells[0] for _,cells in entries)
    for i in range(25):
        if grid[i]!='#' and i in starts:num+=1;start_nums[i]=num
    out=[]
    for direction,cells in entries:
        ans=''.join(grid[i] for i in cells)
        if ans not in CROSSWORD_CLUES:return None
        out.append({'direction':direction,'cells':cells,'answer':ans,'clue':CROSSWORD_CLUES[ans],'number':start_nums[cells[0]],'start':cells[0]})
    if len({e['answer'] for e in out})!=len(out):return None
    return {'grid':grid,'entries':out,'numbers':start_nums}

crosswords=[];seen_cross=set()
for hi,h5 in enumerate(words5):
    for vi,v5 in enumerate(words5):
        if h5==v5 or h5[2]!=v5[2]:continue
        lk=(h5[0],h5[1],v5[0],v5[1]);rk=(h5[3],h5[4],v5[3],v5[4])
        lefts=left_index.get(lk,[]);rights=right_index.get(rk,[])
        if not lefts or not rights:continue
        rnd=random.Random(f'cross-fast:{h5}:{v5}')
        li=list(lefts);ri=list(rights);rnd.shuffle(li);rnd.shuffle(ri)
        made=0
        for l in li[:16]:
            for r in ri[:16]:
                a0,a1,d0,d1=l;a3,a4,d3,d4=r
                all_words=(a0,a1,h5,a3,a4,d0,d1,v5,d3,d4)
                if len(set(all_words))<10:continue
                cw=crossword_from_words(a0,a1,h5,a3,a4)
                if not cw:continue
                key=''.join(cw['grid'])
                if key in seen_cross:continue
                seen_cross.add(key)
                clue_chars=sum(len(e['clue']) for e in cw['entries'])
                diff=['Easy','Medium','Hard'][(hi+vi+clue_chars//40)%3]
                cw.update({'id':f'cross-{len(crosswords):03d}','difficulty':diff})
                crosswords.append(cw);made+=1
                if len(crosswords)>=500:break
                if made>=3:break
            if len(crosswords)>=500 or made>=3:break
        if len(crosswords)>=500:break
    if len(crosswords)>=500:break

# ---------- Content pack ----------
pack={
'version':4,
'lexicon':LEXICON,
'groups':group_categories,
'wordSearchThemes':word_search,
'themeTrailBoards':trail_boards,
'wordPieceBoards':piece_boards,
'compoundLexicon':compound_rows,
'anagramSets':anagram_sets,
'hiveBoards':hive_candidates,
'wordGridBoards':word_grid_boards,
'cryptograms':crypto_entries,
'miniCrosswords':crosswords,
}
# Stable hashes used in docs / future migrations.
raw=json.dumps(pack,sort_keys=True,separators=(',',':')).encode()
sha=hashlib.sha256(raw).hexdigest()
manifest={
'version':4,'sha256':sha,
'counts':{k:len(v) for k,v in pack.items() if isinstance(v,list)},
'notes':{
'groups':'Category bank combined deterministically into 4-group puzzles at runtime.',
'wordSearchThemes':'Theme vocabulary; runtime generator rejects accidental target duplicates.',
'themeTrailBoards':'Prevalidated 5x5 full-coverage themed boards.',
'wordPieceBoards':'Boards generated from curated compound splits; runtime accepts every constructible compound in the pack.',
'anagramSets':'Full-anagram signatures; every listed answer for a signature is accepted.',
'hiveBoards':'Lexicon-enumerated seven-letter hives.',
'wordGridBoards':'Build-time generated grids with trie-enumerated answer sets.',
'cryptograms':'Original in-project sentence corpus; no external quotations.',
'miniCrosswords':'Build-time filled blocked 5x5 crosswords with original clue text.'
}}
(ROOT/'word-content.js').write_text('window.PA_WORD_CONTENT='+json.dumps(pack,separators=(',',':'))+';\n')
(ROOT/'content'/'word-content-source.json').write_text(json.dumps({'themes':THEMES,'groupsSpecial':GROUP_SPECIAL,'compounds':compound_rows,'crosswordClues':CROSSWORD_CLUES},indent=2))
(ROOT/'docs'/'WAVE4_CONTENT_MANIFEST.json').write_text(json.dumps(manifest,indent=2))
print(json.dumps(manifest,indent=2))
