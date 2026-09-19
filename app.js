(() => {
  'use strict';

  const APP_VERSION = '1.2.0';
  const BUILD_PHASE = 'Accessibility, Controls & Device Polish';
  const DB_NAME = 'puzzle-arcade';
  const DB_VERSION = 1;
  const MAX_SHARED_SEED_LENGTH = 96;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const main = $('#main');
  const overlayRoot = $('#overlay-root');
  const toastRoot = $('#toast-root');
  const routeStatus = $('#route-status');

  const CATEGORIES = {
    word: { label: 'Word', accent: 'word' },
    number: { label: 'Number', accent: 'number' },
    logic: { label: 'Logic', accent: 'logic' },
    spatial: { label: 'Spatial', accent: 'spatial' },
  };

  const ALL_GAMES = [
    ['five-letters','Five Letters','word','Guess a hidden five-letter word.'],
    ['groups','Groups','word','Sort words into four related groups.'],
    ['word-ladder','Word Ladder','word','Change one letter at a time.'],
    ['anagrams','Anagrams','word','Rearrange letters into words.'],
    ['letter-hive','Letter Hive','word','Build words around a required center letter.'],
    ['word-grid','Word Grid','word','Trace words through neighboring letters.'],
    ['theme-trail','Theme Trail','word','Discover themed words hidden in a grid.'],
    ['word-pieces','Word Pieces','word','Combine chunks into complete words.'],
    ['mini-crossword','Mini Crossword','word','A compact clue-and-crossing puzzle.'],
    ['cryptogram','Cryptogram','word','Decode a substitution cipher.'],
    ['word-search','Word Search','word','Find themed words hidden in a grid.'],
    ['sudoku','Sudoku','number','Fill rows, columns, and boxes with 1–9.'],
    ['killer-sudoku','Killer Sudoku','number','Sudoku with arithmetic cages.'],
    ['kakuro','Kakuro','number','Crossing number runs with sum clues.'],
    ['unequal','Unequal','number','A Latin square with inequality clues.'],
    ['arithmetic-cages','Arithmetic Cages','number','Latin-square arithmetic regions.'],
    ['make-24','Make 24','number','Use four numbers to make exactly 24.'],
    ['mines','Mines','logic','Reveal safe cells using number clues.'],
    ['nonogram','Nonogram','logic','Use line clues to reveal a pixel image.'],
    ['loop','Loop','logic','Draw one continuous clue-guided loop.'],
    ['bridges','Bridges','logic','Connect numbered islands without crossings.'],
    ['light-up','Light Up','logic','Place lamps to illuminate every cell.'],
    ['islands','Islands','logic','Grow numbered islands inside one connected sea.'],
    ['hitori','Hitori','logic','Shade duplicate numbers while preserving connectivity.'],
    ['binary','Binary','logic','Fill a balanced two-state logic grid.'],
    ['queens','Queens','logic','Place one queen in every row, column, and region.'],
    ['number-path','Number Path','logic','Trace one path through every cell in order.'],
    ['tents','Tents','logic','Place tents beside trees using row and column counts.'],
    ['rectangles','Rectangles','logic','Partition the board into clue-sized rectangles.'],
    ['dominoes','Dominoes','logic','Reconstruct hidden domino pairings.'],
    ['towers','Towers','logic','Use visibility clues to place tower heights.'],
    ['fillomino','Fillomino','logic','Build numbered regions of matching size.'],
    ['network','Network','spatial','Rotate tiles into one connected network.'],
    ['sliding-tiles','Sliding Tiles','spatial','Reorder numbered tiles by sliding into the gap.'],
    ['lights-out','Lights Out','spatial','Toggle neighboring lights until all are off.'],
    ['untangle','Untangle','spatial','Move graph nodes until no edges cross.'],
  ].map(([id,name,category,description]) => ({ id,name,category,description,status:'planned' }));

  const byId = Object.fromEntries(ALL_GAMES.map(g => [g.id, g]));
  const WORD_CONTENT = window.PA_WORD_CONTENT || {};
  let acceptedWordCache=null;
  const acceptedWordsByLength=new Map(),anagramDictionaryCache=new Map(),hiveDictionaryCache=new Map(),acceptedLadderGraphCache=new Map();
  function acceptedWordSet(){
    if(acceptedWordCache)return acceptedWordCache;
    const raw=typeof window.PA_ACCEPTED_WORDS==='string'?window.PA_ACCEPTED_WORDS:'';
    acceptedWordCache=new Set(raw.split(/\s+/).map(w=>w.toLowerCase()).filter(Boolean));
    for(const w of WORD_CONTENT.lexicon||[])acceptedWordCache.add(String(w).toLowerCase());
    return acceptedWordCache;
  }
  function isAcceptedWord(word){return acceptedWordSet().has(String(word||'').toLowerCase());}
  function acceptedWordsOfLength(len){if(!acceptedWordsByLength.has(len))acceptedWordsByLength.set(len,[...acceptedWordSet()].filter(w=>w.length===len));return acceptedWordsByLength.get(len);}
  function wordSignature(word){return [...String(word).toLowerCase()].sort().join('');}
  function acceptedAnagrams(letters){const sig=wordSignature(letters),key=`${String(letters).length}:${sig}`;if(!anagramDictionaryCache.has(key))anagramDictionaryCache.set(key,acceptedWordsOfLength(String(letters).length).filter(w=>wordSignature(w)===sig).map(w=>w.toUpperCase()));return anagramDictionaryCache.get(key);}
  function wordUsesOnlyLetters(word,letters){const allowed=new Set(letters.map(x=>String(x).toUpperCase()));return [...String(word).toUpperCase()].every(c=>allowed.has(c));}
  function hiveDictionaryWords(center,letters){const key=`${String(center).toUpperCase()}:${[...letters].map(x=>String(x).toUpperCase()).sort().join('')}`;if(!hiveDictionaryCache.has(key)){const C=String(center).toUpperCase(),L=letters.map(x=>String(x).toUpperCase());hiveDictionaryCache.set(key,[...acceptedWordSet()].filter(w=>w.length>=4&&w.toUpperCase().includes(C)&&wordUsesOnlyLetters(w,L)).map(w=>w.toUpperCase()));}return hiveDictionaryCache.get(key);}

  const WORDS = [
    'about','above','abuse','actor','acute','admit','adopt','adult','after','again','agent','agree','ahead','alarm','album','alert','alien','align','alike','alive','allow','alone','along','alter','among','anger','angle','angry','apart','apple','apply','arena','argue','arise','array','aside','asset','audio','audit','avoid','award','aware','badly','baker','bases','basic','beach','began','begin','being','below','bench','billy','birth','black','blame','blind','block','blood','board','boost','booth','bound','brain','brand','bread','break','brief','bring','broad','broke','brown','build','built','buyer','cable','calif','carry','catch','cause','chain','chair','chart','chase','cheap','check','chest','chief','child','china','chose','civil','claim','class','clean','clear','click','clock','close','coach','coast','could','count','court','cover','craft','crash','cream','crime','cross','crowd','crown','curve','cycle','daily','dance','dated','dealt','death','debut','delay','depth','doing','doubt','dozen','draft','drama','drawn','dream','dress','drill','drink','drive','drove','dying','eager','early','earth','eight','elite','empty','enemy','enjoy','enter','entry','equal','error','event','every','exact','exist','extra','faith','false','fault','fiber','field','fifth','fifty','fight','final','first','fixed','flash','fleet','floor','fluid','focus','force','forth','forty','forum','found','frame','frank','fraud','fresh','front','fruit','fully','funny','giant','given','glass','globe','going','grace','grade','grand','grant','grass','great','green','gross','group','grown','guard','guess','guest','guide','happy','heart','heavy','hence','henry','horse','hotel','house','human','ideal','image','index','inner','input','issue','japan','joint','jones','judge','known','label','large','laser','later','laugh','layer','learn','lease','least','leave','legal','level','light','limit','links','lives','local','logic','loose','lower','lucky','lunch','major','maker','march','match','maybe','mayor','media','metal','might','minor','minus','mixed','model','money','month','moral','motor','mount','mouse','mouth','movie','music','needs','never','newly','night','noise','north','noted','novel','nurse','occur','ocean','offer','often','order','other','ought','paint','panel','paper','party','peace','peter','phase','phone','photo','piece','pilot','pitch','place','plain','plane','plant','plate','point','pound','power','press','price','pride','prime','print','prior','prize','proof','proud','prove','queen','quick','quiet','quite','radio','raise','range','rapid','ratio','reach','ready','refer','right','rival','river','robot','rough','round','route','royal','rural','scale','scene','scope','score','sense','serve','seven','shall','shape','share','sharp','sheet','shelf','shell','shift','shirt','shock','shoot','short','shown','sight','since','sixth','sixty','sized','skill','sleep','small','smart','smile','smith','solid','solve','sorry','sound','south','space','spare','speak','speed','spend','spent','split','spoke','sport','staff','stage','stake','stand','start','state','steam','steel','stick','still','stock','stone','stood','store','storm','story','strip','study','style','sugar','suite','super','sweet','table','taken','taste','taxes','teach','teeth','terry','texas','thank','theft','their','theme','there','these','thick','thing','think','third','those','three','threw','throw','tight','times','tired','title','today','topic','total','touch','tough','tower','track','trade','train','treat','trend','trial','tried','tries','truck','truly','trust','truth','twice','under','union','unity','until','upper','urban','usage','usual','valid','value','video','virus','visit','vital','voice','waste','watch','water','wheel','where','which','while','white','whole','whose','woman','women','world','worry','worse','worst','worth','would','write','wrong','wrote','young','youth'
  ];

  const WORD_SEARCH_THEMES = [
    { name:'Space', words:['ORBIT','COMET','VENUS','LUNAR','SOLAR','MARS','NOVA','STAR'] },
    { name:'Kitchen', words:['PLATE','SPOON','KNIFE','OVEN','PAN','CUP','FORK','BOWL'] },
    { name:'Nature', words:['RIVER','FOREST','STONE','CLOUD','GRASS','OCEAN','LEAF','HILL'] },
    { name:'Music', words:['PIANO','DRUM','VOICE','CHORD','BEAT','SONG','NOTE','BASS'] },
    { name:'Travel', words:['TRAIN','HOTEL','PLANE','TICKET','MAP','PORT','ROUTE','TRIP'] },
    { name:'Science', words:['ATOM','CELL','LIGHT','FORCE','MASS','WAVE','SPACE','FIELD'] },
  ];


  const ANAGRAM_BANK = {
    Easy: ['STARE','PLANT','WATER','LIGHT','TRAIN','HOUSE','GREEN','SMILE','BRAIN','CLOUD','STONE','MUSIC','BEACH','CHAIR','WORLD','SWEET','FRAME','SHAPE','MOUSE','RIVER'],
    Medium: ['ORANGE','PLANET','GARDEN','STREAM','POCKET','BRIDGE','CASTLE','CAMERA','FRIEND','MARKET','SUMMER','WINTER','PURPLE','BUTTON','CANDLE','FOREST','BOTTLE','SILVER','FLOWER','TRAVEL'],
    Hard: ['JOURNEY','PICTURE','THUNDER','CAPTAIN','MORNING','DIAMOND','FREEDOM','LIBRARY','BALANCE','CHAPTER','MACHINE','VILLAGE','COUNTRY','NETWORK','ELEPHANT','MOUNTAIN','NOTEBOOK','SUNLIGHT','KEYBOARD','AIRPLANE','BUILDING','TREASURE','LANGUAGE'],
  };

  const HIVE_BOARDS = [
    {difficulty:'Easy',letters:'AELPRST',center:'E',answers:['EARS','EAST','EASE','EATER','EATERS','LATE','LATER','LEAP','LEAPS','PLEA','PLEAS','PLEASE','PEAR','PEARS','RATE','RATES','REAL','REALS','REST','SALE','SEAL','SEAT','STARE','STEAL','TALE','TEAR','TEARS','TEASE','TREAT','TREATS','PLASTER','RESTART']},
    {difficulty:'Easy',letters:'AEGINRT',center:'A',answers:['ANGER','GAIN','GAIT','GEAR','GIANT','GRAIN','GRANT','GREAT','IRATE','NEAR','RAIN','RANGE','RATE','RATING','TANG','TEAR','TRAIN','TRAINER','TRAIT','GARNET','GRANITE']},
    {difficulty:'Medium',letters:'DEILNRT',center:'I',answers:['DINE','DINER','DIRT','EDIT','IDLE','LIED','LIEN','LINE','LINER','LINT','RIDE','RIND','TIDE','TIED','TIER','TILED','TIRED','TRIED','TILDE','TINDER','TENDRIL','RELIT','INLET','DINED']},
    {difficulty:'Medium',letters:'ACEIMRT',center:'A',answers:['ACME','CAMERA','CARE','CART','CATER','CRATE','CREAM','MATE','MEAT','RACE','RATE','REACT','TAME','TEAM','TRACE','TRACT','MARITIME']},
    {difficulty:'Hard',letters:'ACDENOR',center:'O',answers:['ACORN','CANOE','CODA','COCOA','CORD','CORE','CORN','DECOR','DONE','DOOR','DRONE','OCEAN','ONCE','ROAD','ROAN','RODE','RACCOON','CORONER']},
  ];

  const WORD_GRID_BOARDS = [
    {difficulty:'Easy',grid:'STARTONERAINMOON',answers:['STAR','STONE','TONE','RAIN','MOON','TRAIN','MAIN','ROAM','NEAR','TAR','ART','ONE','TON','OAT','RAN','MAN']},
    {difficulty:'Easy',grid:'CAREOVERDEARSEAT',answers:['CARE','OVER','DEAR','SEAT','COVER','CAVE','EAT','SEA','CAR','EAR','ARE','OAR','CODE']},
    {difficulty:'Medium',grid:'PLAYLINEAREANOTE',answers:['PLAY','LINE','AREA','NOTE','PLANE','PLAN','LANE','ARE','NAIL','RAIN']},
    {difficulty:'Hard',grid:'FIREWINDTREEHOME',answers:['FIRE','WIND','TREE','HOME','FINE','FIND','WIRE','TIRE','THREE','MORE']},
  ];

  const THEME_TRAILS = [
    {difficulty:'Easy',theme:'Animals',words:['CAT','HORSE','TIGER','SNAKE','BEAR','OWL']},
    {difficulty:'Easy',theme:'Space',words:['MARS','COMET','LUNAR','STAR','MOON','SUN']},
    {difficulty:'Medium',theme:'Kitchen',words:['PLATE','SPOON','KNIFE','CUP','PAN','BOWL']},
    {difficulty:'Hard',theme:'Travel',words:['TRAIN','PLANE','HOTEL','MAP','PORT','BUS']},
  ];

  const WORD_PIECES_BOARDS = [
    {difficulty:'Easy',pieces:['PUZ','ZLE','AR','CADE','SUN','FLOW','ER','NOTE','BOOK','RAIN','BOW','STAR'],answers:['PUZZLE','ARCADE','SUNFLOWER','NOTEBOOK','RAINBOW','STAR']},
    {difficulty:'Easy',pieces:['HEAD','PHONE','KEY','BOARD','AIR','PORT','NEWS','PAPER','DAY','LIGHT','SEA','SHELL'],answers:['HEADPHONE','KEYBOARD','AIRPORT','NEWSPAPER','DAYLIGHT','SEASHELL']},
    {difficulty:'Medium',pieces:['BOOK','SHELF','FIRE','WORK','FOOT','BALL','TOOTH','BRUSH','SUN','SET','PAN','CAKE'],answers:['BOOKSHELF','FIREWORK','FOOTBALL','TOOTHBRUSH','SUNSET','PANCAKE']},
    {difficulty:'Hard',pieces:['RAIN','COAT','BED','ROOM','CLASS','ROOM','SNOW','MAN','DOOR','BELL','CUP','CAKE'],answers:['RAINCOAT','BEDROOM','CLASSROOM','SNOWMAN','DOORBELL','CUPCAKE']},
  ];

  const MINI_CROSSWORDS = [
    {difficulty:'Easy',words:['OTHER','THERE','HEART','ERROR','RETRO'],across:['Different from this one','In that place','Organ that pumps blood','A mistake','Styled after the recent past'],down:['Alternative one','At that location','Center of emotion, figuratively','Something incorrect','Throwback in style']},
    {difficulty:'Easy',words:['THESE','HAVEN','EVENT','SENSE','ENTER'],across:['The ones here','Safe place','Something that happens','Meaning or perception','Go in'],down:['Plural of this','Refuge','Scheduled occurrence','One of the five faculties','Press the return key, often']},
    {difficulty:'Medium',words:['GLASS','LIGHT','AGREE','SHEEP','STEPS'],across:['Window material','Not heavy','Share the same opinion','Woolly farm animals','Stair parts'],down:['A drinking vessel material','Visible illumination','Say yes to a proposal','A flock animal','Actions in a sequence']},
    {difficulty:'Hard',words:['LEAST','EARTH','ARDOR','STONE','THREE'],across:['Smallest amount','Our planet','Strong enthusiasm','Rock material','One more than two'],down:['Minimum','Ground beneath us','Passion','A small rock','Number of primary colors in many models']},
  ];

  const CRYPTO_QUOTES = [
    {difficulty:'Easy',text:'PATIENCE MAKES HARD PUZZLES SMALLER.'},
    {difficulty:'Easy',text:'GOOD QUESTIONS OFTEN LEAD TO SIMPLE ANSWERS.'},
    {difficulty:'Easy',text:'SMALL STEPS CAN SOLVE A LARGE PROBLEM.'},
    {difficulty:'Medium',text:'A CLEAR PLAN TURNS CONFUSION INTO USEFUL CHOICES.'},
    {difficulty:'Medium',text:'THE BEST CLUE IS OFTEN THE ONE YOU ALMOST IGNORED.'},
    {difficulty:'Medium',text:'LOGIC GROWS STRONGER WHEN EVERY ASSUMPTION IS TESTED.'},
    {difficulty:'Hard',text:'WHEN A PROBLEM REFUSES TO MOVE, CHANGE THE WAY YOU ARE LOOKING AT IT.'},
    {difficulty:'Hard',text:'PATTERNS BECOME VISIBLE AFTER YOU STOP GUESSING AND START COMPARING.'},
    {difficulty:'Hard',text:'THE SHORTEST PATH IS NOT ALWAYS THE FIRST ONE THAT LOOKS PROMISING.'},
  ];

  const GROUPS_PUZZLES = [
    [
      ['Inner planets',['MERCURY','VENUS','EARTH','MARS']],
      ['Stone fruits',['PEACH','PLUM','CHERRY','APRICOT']],
      ['Keyboard keys',['SHIFT','ENTER','SPACE','TAB']],
      ['Can follow “black”',['BOARD','BIRD','JACK','HOLE']],
    ],
    [
      ['Trees',['OAK','PINE','MAPLE','CEDAR']],
      ['Card suits',['HEARTS','CLUBS','SPADES','DIAMONDS']],
      ['Things you can break',['RULE','RECORD','PROMISE','SILENCE']],
      ['Parts of a book',['COVER','PAGE','SPINE','INDEX']],
    ],
    [
      ['Weather',['RAIN','SNOW','HAIL','FOG']],
      ['Track events',['SPRINT','RELAY','HURDLES','MARATHON']],
      ['Browser features',['TAB','BOOKMARK','HISTORY','DOWNLOAD']],
      ['Can follow “night”',['OWL','SHIFT','SKY','LIGHT']],
    ],
    [
      ['Greek letters',['ALPHA','BETA','GAMMA','DELTA']],
      ['Chess pieces',['KING','QUEEN','ROOK','BISHOP']],
      ['Coffee drinks',['LATTE','MOCHA','ESPRESSO','AMERICANO']],
      ['Things with keys',['PIANO','KEYBOARD','LOCK','CAR']],
    ],
    [
      ['Bodies of water',['SEA','LAKE','RIVER','OCEAN']],
      ['Parts of a shirt',['COLLAR','CUFF','SLEEVE','BUTTON']],
      ['Things with a pitch',['ROOF','MUSIC','BASEBALL','SALES']],
      ['Can be “paper”',['CLIP','BACK','WORK','TRAIL']],
    ],
    [
      ['Precious stones',['RUBY','OPAL','JADE','PEARL']],
      ['Ways to cook',['BAKE','ROAST','STEAM','GRILL']],
      ['Computer storage',['DISK','DRIVE','CACHE','MEMORY']],
      ['Can follow “blue”',['BIRD','MOON','BELL','PRINT']],
    ],
    [
      ['Dance styles',['SALSA','TANGO','WALTZ','SWING']],
      ['Things at a station',['TRAIN','PLATFORM','TICKET','TRACK']],
      ['Can be “high”',['SCHOOL','SCORE','TIDE','CHAIR']],
      ['Parts of a face',['NOSE','MOUTH','CHIN','BROW']],
    ],
    [
      ['Shapes',['CIRCLE','SQUARE','TRIANGLE','OVAL']],
      ['Things with a shell',['TURTLE','EGG','NUT','SNAIL']],
      ['Newspaper sections',['SPORTS','BUSINESS','OPINION','COMICS']],
      ['Can follow “first”',['AID','CLASS','PLACE','NAME']],
    ],
  ];

  const LADDER_WORDS = `bald ball band bank bark barn base bath beat bell belt bend best bike bill bird bite boat bold book boot bore born both bowl bulk burn bush cake call calm card care cart case cash cast cave cell chat chip chop city clay clip club coat cold cook cool cord core cost cove crop dark date dawn deal dear deck deer diet dish door down draw drop dust east face fact fail fair fall fame farm fast fate fear feed feel feet fell felt file fill film find fine fire firm fish fist five flat flow foam fold food fool foot form four game gate gave gear goad goal goat gold good grow hail hair half hall hand hang hard harm head heal hear heat hell help hero hide hike hill hole home hope host hour join jump keep kill kind king kiss lake lane last late lead leaf lean left lend less life lift like line link live load loan lock long look lord lose loss love luck made mail main make male mall many mark mass mate math meal mean meat meet melt mile milk mill mind mine miss mode moon more most move near neck need nest news nice note page paid pain pair park part pass path pear peel peer pile pine plan play plot plug pool poor port post pull pure race rain rate read real rear rest ride ring road rock role room root rose sail sale same sand sane save seal seat seed seek seem seen sell sent ship shop shot show shut side sign sing sink site snow soap soft soil sold song soon soot sore sort soup sour spin star stay step stop tall talk task team tear tell tend tent test text thin this time tire tone tool tour town tree trip turn walk wall ward warm wash wave weak wear week well west wide wife wild will wind wine wing wish wood wool word wore work worm yard year yell zero`.split(/\s+/);
  const LADDER_SET = new Set(LADDER_WORDS);

  const NONOGRAM_PATTERNS = {
    Easy: [
      ['Heart',['01110','11111','11111','01110','00100']],
      ['Diamond',['00100','01110','11111','01110','00100']],
      ['Arrow',['00100','01100','11111','01100','00100']],
      ['Cup',['10001','10001','10001','01110','00100']],
      ['Cross',['00100','00100','11111','00100','00100']],
      ['Smile',['10001','10001','00000','10001','01110']],
    ],
    Medium: [
      ['Heart',['01100110','11111111','11111111','11111111','01111110','00111100','00011000','00000000']],
      ['Diamond',['00011000','00111100','01111110','11111111','11111111','01111110','00111100','00011000']],
      ['Tree',['00011000','00111100','01111110','11111111','00111100','00111100','00011000','00011000']],
      ['Cup',['10000010','10000010','10000010','10000010','10000010','01111100','00111000','00010000']],
      ['House',['00011000','00111100','01111110','11111111','11000011','11011011','11011011','11111111']],
    ],
    Hard: [
      ['Heart',['0011001100','0111111110','1111111111','1111111111','1111111111','0111111110','0011111100','0001111000','0000110000','0000000000']],
      ['Diamond',['0000110000','0001111000','0011111100','0111111110','1111111111','1111111111','0111111110','0011111100','0001111000','0000110000']],
      ['Tree',['0000110000','0001111000','0011111100','0111111110','1111111111','0001111000','0011111100','0000110000','0000110000','0000110000']],
      ['House',['0000110000','0001111000','0011111100','0111111110','1111111111','1100000011','1101111011','1101001011','1101111011','1111111111']],
    ],
  };

  const QUEEN_BASES = {
    6: [
      {q:[5,2,4,1,3,0],r:[1,1,1,1,1,0,1,1,1,2,2,2,1,1,2,2,2,2,1,3,4,2,2,2,3,3,4,4,4,4,5,3,4,4,4,4]},
      {q:[4,2,0,5,1,3],r:[1,1,1,1,0,3,1,1,1,1,1,3,2,1,1,3,3,3,4,4,1,5,3,3,4,4,5,5,3,3,5,5,5,5,5,5]},
      {q:[0,3,5,2,4,1],r:[0,1,1,1,1,1,2,1,1,1,2,2,2,2,2,2,2,2,3,3,3,3,4,4,3,3,3,4,4,4,5,5,3,3,4,4]},
      {q:[3,1,4,0,2,5],r:[1,1,1,0,0,0,1,1,1,1,1,1,3,1,1,1,2,1,3,3,1,1,2,2,3,3,4,4,5,2,3,4,4,4,5,5]},
      {q:[2,0,4,1,5,3],r:[1,0,0,0,0,0,1,1,1,1,1,4,1,3,3,3,2,4,3,3,3,4,4,4,3,3,4,4,4,4,3,4,4,5,4,4]},
      {q:[3,5,2,0,4,1],r:[2,2,2,0,1,1,3,3,2,0,1,1,3,2,2,2,2,2,3,3,3,2,2,4,3,5,5,4,4,4,5,5,5,4,4,4]},
    ],
    7: [
      {q:[2,0,3,5,1,4,6],r:[1,0,0,2,2,2,2,1,1,2,2,2,2,2,4,4,4,2,2,3,3,4,4,4,4,3,3,3,4,4,4,4,3,5,5,4,4,4,5,5,5,5,4,5,5,5,5,5,6]},
      {q:[6,4,1,3,5,2,0],r:[2,2,2,2,3,3,0,2,2,2,3,1,3,0,2,2,2,3,3,3,4,3,3,3,3,3,3,4,5,5,5,3,4,4,4,5,5,5,3,4,4,4,6,6,5,4,4,4,4]},
      {q:[6,2,4,0,3,5,1],r:[1,1,2,2,0,0,0,1,1,1,2,2,2,0,1,1,2,2,2,2,0,3,1,2,2,2,2,2,3,3,5,4,2,2,2,6,3,5,5,5,5,2,6,6,5,5,5,5,5]},
      {q:[2,5,3,0,4,6,1],r:[3,0,0,1,1,1,1,3,2,2,1,1,1,1,3,2,2,2,1,1,1,3,4,2,2,1,1,1,3,4,4,4,4,4,4,6,4,4,4,4,4,5,6,6,4,4,4,4,5]},
      {q:[3,6,2,4,1,5,0],r:[2,0,0,0,3,1,1,2,2,2,0,3,3,1,2,2,2,3,3,3,1,4,4,3,3,3,3,3,4,4,3,3,3,3,3,4,4,4,4,3,5,5,6,4,4,4,3,3,5]},
      {q:[3,6,4,1,5,0,2],r:[3,3,3,0,0,1,1,3,3,3,3,0,1,1,3,3,3,3,2,2,2,3,3,3,4,4,4,4,3,3,4,4,4,4,4,5,5,4,4,4,4,4,6,6,6,6,4,4,4]},
    ],
    8: [
      {q:[1,6,3,5,7,4,2,0],r:[0,0,0,2,2,1,1,1,5,5,0,2,3,1,1,1,5,5,5,2,3,3,4,1,5,5,5,5,3,3,4,1,5,5,5,5,5,3,4,4,5,5,5,5,5,5,5,4,5,6,6,5,5,5,5,5,7,7,6,6,5,5,5,5]},
      {q:[7,5,3,1,6,4,0,2],r:[2,2,2,2,1,1,1,0,3,2,2,2,5,1,1,1,3,2,2,2,5,5,4,1,3,3,3,2,5,4,4,4,3,7,7,5,5,5,4,4,6,7,7,7,5,5,5,4,6,7,7,7,7,7,5,5,7,7,7,7,7,7,7,7]},
      {q:[0,2,5,1,7,3,6,4],r:[0,1,1,1,1,2,2,2,1,1,1,1,1,2,2,2,1,1,1,1,2,2,2,6,3,3,1,2,2,2,6,6,3,3,3,5,2,6,6,4,3,3,3,5,5,6,6,6,3,3,6,6,6,6,6,6,3,6,6,6,7,6,6,6]},
      {q:[7,5,1,6,4,2,0,3],r:[2,2,2,2,1,1,1,0,2,2,2,2,2,1,1,1,2,2,2,2,4,4,1,1,2,2,4,2,4,4,3,3,2,2,4,4,4,4,4,3,6,6,5,4,4,4,4,4,6,6,6,7,7,4,4,4,6,6,7,7,7,4,4,4]},
      {q:[6,4,7,3,1,5,0,2],r:[4,3,3,3,3,0,0,2,4,3,3,3,1,0,2,2,4,4,3,3,3,5,2,2,4,4,4,3,5,5,5,5,4,4,4,5,5,5,5,5,6,4,4,5,5,5,5,5,6,6,7,7,7,5,5,5,7,7,7,7,5,5,5,5]},
      {q:[0,2,4,1,5,7,3,6],r:[0,1,1,1,1,4,4,4,1,1,1,1,1,2,4,4,3,3,1,2,2,2,4,4,3,3,3,3,2,4,4,4,3,3,3,3,2,4,4,5,3,3,3,3,6,6,5,5,3,6,3,6,6,6,5,5,3,6,6,6,6,6,7,5]},
    ],
  };

  const playableIds = ['five-letters','groups','word-ladder','anagrams','letter-hive','word-grid','theme-trail','word-pieces','mini-crossword','cryptogram','sudoku','killer-sudoku','kakuro','unequal','arithmetic-cages','make-24','mines','nonogram','binary','queens','loop','bridges','light-up','islands','hitori','number-path','tents','rectangles','dominoes','towers','fillomino','network','sliding-tiles','lights-out','untangle','word-search'];
  playableIds.forEach(id => byId[id].status = 'available');

  const db = {
    _db: null,
    _opening: null,
    _epoch: 0,
    async open() {
      if (this._db) return this._db;
      if (this._opening) return this._opening;
      if (!window.indexedDB) return null;
      const epoch = this._epoch;
      this._opening = new Promise(resolve => {
        let settled = false;
        const finish = value => {
          if (settled) { if (value) value.close(); return; }
          settled = true; clearTimeout(timeout);
          if (epoch !== this._epoch) { value?.close(); resolve(null); return; }
          this._db = value; resolve(value);
        };
        const timeout = setTimeout(() => finish(null), 3500);
        try {
          const req = indexedDB.open(DB_NAME, DB_VERSION);
          req.onupgradeneeded = () => {
            const d = req.result;
            if (!d.objectStoreNames.contains('kv')) d.createObjectStore('kv');
            if (!d.objectStoreNames.contains('active')) d.createObjectStore('active', {keyPath:'gameId'});
            if (!d.objectStoreNames.contains('history')) d.createObjectStore('history', {keyPath:'id'});
          };
          req.onsuccess = () => {
            const d = req.result;
            d.onversionchange = () => { d.close(); if (this._db === d) this._db = null; };
            finish(d);
          };
          req.onerror = req.onblocked = () => finish(null);
        } catch { finish(null); }
      });
      try { return await this._opening; } finally { this._opening = null; }
    },

    async get(store, key) {
      const d = await this.open();
      if (!d) {
        try { return JSON.parse(localStorage.getItem(`pa:${store}:${key}`)); } catch { return null; }
      }
      return new Promise((resolve) => {
        try {
          const tx = d.transaction(store, 'readonly');
          const req = tx.objectStore(store).get(key);
          req.onsuccess = () => resolve(req.result ?? null);
          req.onerror = () => resolve(null);
        } catch { resolve(null); }
      });
    },
    _writeWarningShown: false,
    warnWrite(error) {
      if (!this._writeWarningShown) {
        this._writeWarningShown = true;
        setTimeout(() => toast('Storage is unavailable. You can keep playing, but recent progress may not persist.'), 0);
      }
    },
    async put(store, value, key) {
      const epoch = this._epoch;
      let snapshot;
      try { snapshot = structuredClone(value); }
      catch (error) { this.warnWrite(error); return false; }
      const d = await this.open();
      if (epoch !== this._epoch) return false;
      if (!d) {
        const k = key ?? snapshot.gameId ?? snapshot.id;
        try { localStorage.setItem(`pa:${store}:${k}`, JSON.stringify(snapshot)); return true; }
        catch (error) { this.warnWrite(error); return false; }
      }
      return new Promise(resolve => {
        let settled = false;
        const finish = (ok, error) => { if (settled) return; settled = true; if (!ok) this.warnWrite(error); resolve(ok); };
        try {
          const tx = d.transaction(store, 'readwrite');
          const req = key === undefined ? tx.objectStore(store).put(snapshot) : tx.objectStore(store).put(snapshot, key);
          tx.oncomplete = () => finish(true);
          tx.onabort = tx.onerror = () => finish(false, tx.error);
          req.onerror = () => finish(false, req.error);
        } catch (error) { finish(false, error); }
      });
    },

    async del(store, key) {
      const d = await this.open();
      if (!d) { try { localStorage.removeItem(`pa:${store}:${key}`); } catch {} return; }
      return new Promise((resolve) => {
        try {
          const tx = d.transaction(store,'readwrite');
          tx.objectStore(store).delete(key);
          tx.oncomplete = () => resolve(); tx.onerror = () => resolve(); tx.onabort=()=>resolve();
        } catch { resolve(); }
      });
    },
    async all(store) {
      const d = await this.open();
      if (!d) {
        const prefix = `pa:${store}:`;
        try { return Object.keys(localStorage).filter(k=>k.startsWith(prefix)).map(k=>{
          try { return JSON.parse(localStorage.getItem(k)); } catch { return null; }
        }).filter(Boolean); } catch { return []; }
      }
      return new Promise(resolve => {
        try {
          const tx = d.transaction(store,'readonly');
          const req = tx.objectStore(store).getAll();
          req.onsuccess = () => resolve(req.result || []); req.onerror = () => resolve([]);
        } catch { resolve([]); }
      });
    },
    async resetAll() {
      ++this._epoch;
      if(this._opening)await this._opening;
      const d = await this.open();
      let cleared = true;
      if (d) {
        cleared = await new Promise(resolve => {
          try {
            const tx = d.transaction(['kv','active','history'], 'readwrite');
            for (const name of ['kv','active','history']) tx.objectStore(name).clear();
            tx.oncomplete = () => resolve(true);
            tx.onerror = tx.onabort = () => resolve(false);
          } catch { resolve(false); }
        });
      }
      try { Object.keys(localStorage).filter(k => k.startsWith('pa:')).forEach(k => localStorage.removeItem(k)); }
      catch { if (!d) cleared = false; }
      this._writeWarningShown = false;
      return cleared;
    }
  };

  const state = {
    settings: { theme:'system', playMode:'relaxed', motion:'system', contrast:'system', controls:'standard' },
    favorites: [],
    active: [],
    history: [],
    category:'all',
    currentGame:null,
    currentActive:null,
    timer:null,
  };

  let routeGeneration = 0;
  let saveClock = 0;
  const retiredActives = new WeakSet();
  const replayingActives = new WeakSet();
  const themeMedia = window.matchMedia('(prefers-color-scheme: dark)');
  function routeIsCurrent(ticket) { return ticket == null || ticket === routeGeneration; }

  function seedString() {
    const arr = new Uint32Array(3);
    crypto.getRandomValues(arr);
    return [...arr].map(n=>n.toString(36)).join('-');
  }
  function xmur3(str) {
    let h = 1779033703 ^ str.length;
    for (let i=0;i<str.length;i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = h << 13 | h >>> 19; }
    return () => { h = Math.imul(h ^ (h >>> 16), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return (h ^= h >>> 16) >>> 0; };
  }
  function mulberry32(a) { return () => { let t = a += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function rng(seed) { return mulberry32(xmur3(seed)()); }
  function pick(arr, r=Math.random) { return arr[Math.floor(r()*arr.length)]; }
  function shuffle(arr, r=Math.random) { const a=[...arr]; for(let i=a.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
  function clamp(n,a,b){return Math.max(a,Math.min(b,n));}
  function uid(prefix='id'){ return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`; }
  function formatTime(ms=0) { const s=Math.floor(ms/1000), m=Math.floor(s/60), r=s%60; return `${String(m).padStart(2,'0')}:${String(r).padStart(2,'0')}`; }
  function esc(s=''){ return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }

  function toast(msg) {
    if(state.currentActive&&/^Hint [1-4]\/4 · /.test(String(msg))&&state.currentActive.state._proofHintView){playSession(state.currentActive).feedback='';return;}
    if(state.currentActive)gameFeedback(msg);
    const el=document.createElement('div'); el.className='toast'; el.textContent=msg;
    if(state.currentActive)el.setAttribute('aria-hidden','true');
    toastRoot.appendChild(el);
    setTimeout(()=>el.remove(),2200);
  }

  function syncThemeChrome() {
    const dark = state.settings.theme === 'dark' || (state.settings.theme === 'system' && themeMedia.matches);
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.content = dark ? '#171715' : '#f5f2ea';
  }
  function setTheme(theme, persist=true) {
    state.settings.theme = ['system','light','dark'].includes(theme) ? theme : 'system';
    document.documentElement.dataset.theme = state.settings.theme;
    syncThemeChrome();
    if (persist) {
      try { localStorage.setItem('pa:bootstrap-theme', state.settings.theme); } catch {}
      void db.put('kv', state.settings, 'settings');
    }
  }
  themeMedia.addEventListener?.('change', syncThemeChrome);

  function applyAccessibilitySettings(persist=true) {
    const motion=['system','reduced'].includes(state.settings.motion)?state.settings.motion:'system';
    const contrast=['system','high'].includes(state.settings.contrast)?state.settings.contrast:'system';
    const controls=['standard','large'].includes(state.settings.controls)?state.settings.controls:'standard';
    state.settings.motion=motion;state.settings.contrast=contrast;state.settings.controls=controls;
    document.documentElement.dataset.motion=motion;
    document.documentElement.dataset.contrast=contrast;
    document.documentElement.dataset.controls=controls;
    if(persist)void db.put('kv',state.settings,'settings');
  }
  function announceRoute(label) {
    if(!routeStatus)return;
    routeStatus.textContent='';
    requestAnimationFrame(()=>{routeStatus.textContent=label;});
  }

  function parseHash() {
    const raw=location.hash.replace(/^#\/?/,'') || 'home';
    if(raw.length>512) return {parts:['home'],params:new URLSearchParams()};
    const [path,query=''] = raw.split('?');
    const parts=path.split('/').filter(Boolean);
    return { parts, params:new URLSearchParams(query) };
  }

  function go(hash) {
    const target = hash.startsWith('#') ? hash : `#/${hash}`;
    if (location.hash === target) void renderRoute(); else location.hash = target;
  }
  function sanitizeSharedSeed(value){
    if(typeof value!=='string')return null; const seed=value.trim();
    return seed.length>0&&seed.length<=MAX_SHARED_SEED_LENGTH&&/^[A-Za-z0-9._~-]+$/.test(seed)?seed:null;
  }
  function normalizeDifficulty(game,value){
    const allowed=game.difficulties||[game.defaultDifficulty||'Standard'];
    return typeof value==='string'&&allowed.includes(value)?value:(game.defaultDifficulty||allowed[0]||'Standard');
  }

  function updateNav(route) {
    $('.nav-link').forEach(b=>{
      const active=b.dataset.route===route;
      b.classList.toggle('is-active',active);
      if(active)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');
    });
  }

  function cardPreview(id) {
    if(id==='five-letters') return `<div class="preview-grid preview-grid--word"><span>S</span><span>T</span><span>A</span><span>R</span><span>E</span></div>`;
    if(id==='groups') return `<div class="preview-groups"><span>PEAR</span><span>MARS</span><span>TAB</span><span>PLUM</span></div>`;
    if(id==='word-ladder') return `<div class="preview-ladder"><span>COLD</span><i>↓</i><span>CORD</span><i>↓</i><span>CARD</span></div>`;
    if(id==='nonogram') return `<div class="preview-nonogram">${['','x','','x','','x','x','x','','','x','x','x','','','','x','',''].slice(0,16).map(x=>`<span class="${x?'on':''}"></span>`).join('')}</div>`;
    if(id==='binary') return `<div class="preview-binary">${['0','1','0','1','1','0','1','0','0'].map(x=>`<span>${x}</span>`).join('')}</div>`;
    if(id==='queens') return `<div class="preview-queens">${['','Q','','','', '', '', 'Q',''].map(x=>`<span>${x}</span>`).join('')}</div>`;
    if(id==='anagrams') return `<div class="preview-anagram"><span>R</span><span>A</span><span>T</span><span>S</span><i>↻</i></div>`;
    if(id==='letter-hive') return `<div class="preview-hive"><span>A</span><span>L</span><span>P</span><b>E</b><span>R</span><span>S</span><span>T</span></div>`;
    if(id==='word-grid') return `<div class="preview-search">${'STARTONERAINMOON'.split('').map((x,i)=>`<span class="${[0,1,2,3].includes(i)?'hit':''}">${x}</span>`).join('')}</div>`;
    if(id==='theme-trail') return `<div class="preview-theme"><strong>SPACE</strong><span>MARS · COMET · MOON</span></div>`;
    if(id==='word-pieces') return `<div class="preview-pieces"><span>SUN</span><span>FLOW</span><span>ER</span><b>→</b></div>`;
    if(id==='mini-crossword') return `<div class="preview-crossword">${'OTHERTHEREHEARTERRORRETRO'.slice(0,25).split('').map(x=>`<span>${x}</span>`).join('')}</div>`;
    if(id==='cryptogram') return `<div class="preview-crypt"><span>Q → T</span><span>F → H</span><span>M → E</span></div>`;
    if(id==='unequal') return `<div class="preview-unequal">${['1','','3','','2','','3','','1'].map(x=>`<span>${x}</span>`).join('')}</div>`;
    if(id==='arithmetic-cages') return `<div class="preview-arith"><span>6+</span><span>2</span><span>3</span><span>1</span><span>4×</span><span>2</span><span>3</span><span>1</span><span>2</span></div>`;
    if(id==='islands') return `<div class="preview-islands"><span>3</span><span class="sea"></span><span></span><span></span><span class="sea"></span><span>2</span><span class="sea"></span><span></span><span class="sea"></span></div>`;
    if(id==='hitori') return `<div class="preview-hitori"><span>2</span><span class="black">2</span><span>3</span><span>1</span><span>3</span><span>2</span><span>3</span><span>1</span><span>2</span></div>`;
    if(id==='dominoes') return `<div class="preview-dominoes"><span class="pair">2</span><span class="pair">4</span><span>1</span><span>0</span><span class="pair">3</span><span class="pair">3</span><span>4</span><span>2</span><span>0</span></div>`;
    if(id==='fillomino') return `<div class="preview-fillomino"><span class="r">3</span><span class="r">3</span><span>2</span><span class="r">3</span><span>1</span><span>2</span><span>4</span><span>4</span><span>4</span></div>`;
    if(id==='untangle') return `<div class="preview-untangle"><span></span><span></span><span></span><span></span></div>`;
    if(id==='sudoku') return `<div class="preview-grid preview-grid--sudoku">${['7','','2','','4','','1','','9'].map(x=>`<span>${x}</span>`).join('')}</div>`;
    if(id==='kakuro') return `<div class="preview-kakuro"><span>↘</span><span>↓10</span><span>↓7</span><span>→11</span><b>8</b><b>1</b><span>→10</span><b>6</b><b>3</b></div>`;
    if(id==='killer-sudoku') return `<div class="preview-killer"><span>12</span><b>7</b><i></i><b>4</b><span>9</span><i></i><b>2</b><i></i><b>8</b></div>`;
    if(id==='light-up') return `<div class="preview-lightup"><span></span><b>2</b><i></i><i class="lit"></i><span></span><i></i><b>1</b><i class="lit"></i><span></span></div>`;
    if(id==='tents') return `<div class="preview-tents"><i></i><b></b><span></span><span></span><i></i><b></b><b></b><span></span><i></i></div>`;
    if(id==='rectangles') return `<div class="preview-rects"><span>6</span><i></i><i></i><i></i><span>4</span><i></i><i></i><i></i><span>2</span></div>`;
    if(id==='towers') return `<div class="preview-towers"><small>3</small><span>2</span><span>4</span><span>1</span><span>3</span><small>2</small></div>`;
    if(id==='network') return `<div class="preview-network"><span>└</span><span>─</span><span>┐</span><span>┌</span><span>┼</span><span>┘</span><span>└</span><span>─</span><span>┘</span></div>`;
    if(id==='loop') return `<div class="preview-loop"><span>•━━•</span><span>┃2 ┃</span><span>•━━•</span></div>`;
    if(id==='bridges') return `<div class="preview-bridges"><span>2━━3</span><span>┃  ┃</span><span>2━━3</span></div>`;
    if(id==='number-path') return `<div class="preview-path"><b>1</b><i></i><b>2</b><i></i><b>3</b></div>`;
    if(id==='mines') return `<div class="preview-mine">${['','1','1','','','1','◆','2','1','','1','2','◆','1','','','','1','1',''].map(x=>`<span>${x}</span>`).join('')}</div>`;
    if(id==='lights-out') return `<div class="preview-lights">${Array.from({length:16},(_,i)=>`<span class="${[1,2,4,7,10,13].includes(i)?'on':''}"></span>`).join('')}</div>`;
    if(id==='sliding-tiles') return `<div class="preview-slide">${['1','2','3','4','5','6','7','','8'].map(x=>`<span>${x}</span>`).join('')}</div>`;
    if(id==='make-24') return `<div class="preview-math">3·4·6·8</div>`;
    if(id==='word-search') { const letters='STARXORBITQCOMETVENU'; return `<div class="preview-search">${letters.slice(0,20).split('').map((x,i)=>`<span class="${i<4?'hit':''}">${x}</span>`).join('')}</div>`; }
    return `<div class="preview-grid preview-grid--sudoku">${Array.from({length:9},()=>'<span></span>').join('')}</div>`;
  }

  function gameCard(g) {
    const fav=state.favorites.includes(g.id);
    return `<article class="game-card" data-game="${g.id}" data-category="${g.category}">
      <button class="game-card__open" data-game-open="${g.id}" aria-label="Open ${esc(g.name)}"></button>
      <button class="game-card__star ${fav?'is-on':''}" data-favorite="${g.id}" aria-label="${fav?'Remove':'Add'} ${esc(g.name)} ${fav?'from':'to'} favorites">${fav?'★':'☆'}</button>
      <div class="game-card__preview">${cardPreview(g.id)}</div>
      <div class="game-card__title">${esc(g.name)}</div>
      <p class="game-card__description">${esc(g.description)}</p><div class="game-card__meta">${CATEGORIES[g.category].label} · ${state.active.some(a=>a.gameId===g.id)?'Continue puzzle':'Play now'}</div>
    </article>`;
  }

  function sanitizeSettings(value) {
    const v=value&&typeof value==='object'?value:{};
    return {
      theme:['system','light','dark'].includes(v.theme)?v.theme:'system',
      playMode:['relaxed','challenge'].includes(v.playMode)?v.playMode:'relaxed',
      motion:['system','reduced'].includes(v.motion)?v.motion:'system',
      contrast:['system','high'].includes(v.contrast)?v.contrast:'system',
      controls:['standard','large'].includes(v.controls)?v.controls:'standard',
      difficulties:Object.fromEntries(Object.entries(v.difficulties&&typeof v.difficulties==='object'?v.difficulties:{}).filter(([id,d])=>Object.hasOwn(GAMES,id)&&typeof d==='string').map(([id,d])=>[id,normalizeDifficulty(GAMES[id],d)])),
    };
  }
  function sanitizeFavorites(value) {
    if(!Array.isArray(value)) return [];
    return [...new Set(value.filter(id=>typeof id==='string'&&byId[id]?.status==='available'))].slice(0,ALL_GAMES.length);
  }
  function sanitizeHistory(value) {
    if (!Array.isArray(value)) return [];
    return value.filter(h => h && typeof h === 'object' && typeof h.id === 'string' &&
      typeof h.gameId === 'string' && byId[h.gameId]?.status === 'available' &&
      Number.isFinite(h.endedAt) && h.endedAt >= 0 && h.endedAt <= 8640000000000000 &&
      Number.isFinite(h.durationMs) && h.durationMs >= 0 &&
      ['completed','failed','abandoned'].includes(h.outcome))
      .map(h => ({...h, difficulty:normalizeDifficulty(GAMES[h.gameId], h.difficulty)}));
  }
  function sanitizeActiveList(value) {
    if (!Array.isArray(value)) return [];
    return value.filter(a => {
      const g = a && typeof a.gameId === 'string' ? GAMES[a.gameId] : null;
      return !!(g && !a.completed && activeRecordLooksUsable(g, a));
    });
  }
  function readCheckpoint(id) {
    try { return JSON.parse(localStorage.getItem(`pa:checkpoint:${id}`)); } catch { return null; }
  }
  function newestActive(stored, checkpoint) {
    return checkpoint && (!stored || (checkpoint.updatedAt || 0) > (stored.updatedAt || 0)) ? checkpoint : stored;
  }
  async function activeRecords() {
    const records = new Map((await db.all('active')).filter(a => a && typeof a.gameId === 'string').map(a => [a.gameId,a]));
    for (const id of playableIds) {
      const candidate = newestActive(records.get(id), readCheckpoint(id));
      if (candidate) records.set(id, candidate);
    }
    return [...records.values()];
  }

  async function refreshData() {
    state.settings = sanitizeSettings(await db.get('kv','settings'));
    state.favorites = sanitizeFavorites(await db.get('kv','favorites'));
    state.active = sanitizeActiveList(await activeRecords());
    state.history = sanitizeHistory(await db.all('history')).sort((a,b)=>b.endedAt-a.endedAt);
    setTheme(state.settings.theme, false);
    applyAccessibilitySettings(false);
  }

  async function renderHome(ticket=routeGeneration){
    stopTimer();state.currentGame=null;state.currentActive=null;updateNav('home');document.title='Puzzle Arcade';
    state.active=sanitizeActiveList(await activeRecords());if(!routeIsCurrent(ticket))return;
    const available=ALL_GAMES.filter(g=>g.status==='available'),activeSorted=[...state.active].sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0)).slice(0,4);
    const filtered=available.filter(g=>state.category==='all'||(state.category==='favorites'?state.favorites.includes(g.id):g.category===state.category));
    main.innerHTML=`<div class="page play-library"><section class="hero-row"><div><p class="page-kicker">Your puzzle arcade</p><h1 class="hero-title">Pick a puzzle.<br>Keep going.</h1><p class="hero-copy">36 games. Unlimited puzzles. No accounts, lives, or daily lockouts.</p></div><button class="random-button" data-action="random">↻ Surprise me</button></section>
      ${activeSorted.length?`<section class="section"><div class="section-head"><div><h2>Pick up where you left off</h2></div></div><div class="continue-row">${activeSorted.map(a=>`<button class="continue-card" data-game="${a.gameId}"><strong>${esc(byId[a.gameId].name)}</strong><span>${esc(a.difficulty)} · ${esc(safeProgressLabel(a))}</span></button>`).join('')}</div></section>`:''}
      <section class="section"><div class="library-search-row"><h2>Find your next puzzle</h2><label class="library-search"><span class="sr-only">Search games</span><input type="search" data-library-search placeholder="Search games or skills…" value="${esc(state.libraryQuery||'')}" autocomplete="off"></label></div>
      <div class="filterbar" aria-label="Game categories">${['all','word','number','logic','spatial','favorites'].map(c=>{const count=c==='all'?available.length:c==='favorites'?state.favorites.length:available.filter(g=>g.category===c).length;return `<button class="filter ${state.category===c?'is-active':''}" data-category-filter="${c}" aria-pressed="${state.category===c}">${c==='all'?'All':c==='favorites'?'Favorites':CATEGORIES[c].label} <span>${count}</span></button>`;}).join('')}</div>
      <p class="library-count" data-catalog-count aria-live="polite"></p><div class="game-grid" data-catalog-grid>${filtered.map(gameCard).join('')}</div><p class="library-empty" data-library-empty hidden>No games match this search. Try a shorter name or another category.</p></section></div>`;
    bindCommon();const search=$('[data-library-search]');const filter=()=>{state.libraryQuery=search.value;const q=search.value.trim().toLowerCase();let count=0;$$('[data-catalog-grid] .game-card').forEach(el=>{const g=byId[el.dataset.game],show=!q||`${g.name} ${g.description} ${CATEGORIES[g.category].label}`.toLowerCase().includes(q);el.hidden=!show;if(show)count++;});$('[data-catalog-count]').textContent=`${count} ${count===1?'game':'games'}`;$('[data-library-empty]').hidden=count>0;};search.oninput=filter;filter();
  }

  function safeProgressLabel(a){ try { return progressLabel(a); } catch { return 'In progress'; } }

  function progressLabel(a){
    if(a.gameId==='five-letters') return `${a.state?.guesses?.length||0}/6 guesses`;
    if(a.gameId==='groups') return `${a.state?.solved?.length||0}/4 groups solved`;
    if(a.gameId==='word-ladder') return `${Math.max(0,(a.state?.chain?.length||1)-1)} moves`;
    if(a.gameId==='nonogram') return `${a.state?.cells?.filter(x=>x===1).length||0} cells filled`;
    if(a.gameId==='binary') return `${a.state?.board?.filter(x=>x!==null&&x!==undefined).length||0}/${a.puzzle?.size*a.puzzle?.size||0} filled`;
    if(a.gameId==='queens') return `${a.state?.cells?.filter(x=>x===2).length||0}/${a.puzzle?.size||0} queens`;
    if(a.gameId==='loop') return `${(a.state?.h||[]).filter(x=>x===1).length+(a.state?.v||[]).filter(x=>x===1).length} loop edges`;
    if(a.gameId==='bridges') return `${(a.state?.counts||[]).filter(Boolean).length} connections`;
    if(a.gameId==='number-path') return `${a.state?.path?.length||1}/${(a.puzzle?.size||1)**2} cells`;
    if(a.gameId==='anagrams') return `${a.state?.selected?.length||0}/${a.puzzle?.letters?.length||0} letters placed`;
    if(a.gameId==='letter-hive') return `${a.state?.found?.length||0}/${a.puzzle?.target||0} words toward goal`;
    if(a.gameId==='word-grid') return `${a.state?.found?.length||0}/${a.puzzle?.target||0} words toward goal`;
    if(a.gameId==='theme-trail') return `${a.state?.found?.length||0}/${a.puzzle?.words?.length||0} theme words`;
    if(a.gameId==='word-pieces') return `${a.state?.found?.length||0}/${a.puzzle?.answers?.length||0} words found`;
    if(a.gameId==='mini-crossword') return `${a.state?.board?.filter((v,i)=>v&&a.puzzle.grid[i]!=='#').length||0}/${a.puzzle?.grid?.filter(v=>v!=='#').length||0} letters filled`;
    if(a.gameId==='cryptogram') return `${Object.keys(a.state?.mapping||{}).length} mappings set`;
    if(a.gameId==='unequal') return `${a.state?.board?.filter(v=>v!=null).length||0}/${(a.puzzle?.n||0)**2} filled`;
    if(a.gameId==='arithmetic-cages') return `${a.state?.board?.filter(v=>v!=null).length||0}/${(a.puzzle?.n||0)**2} filled`;
    if(a.gameId==='islands') return `${a.state?.cells?.filter(Boolean).length||0}/${(a.puzzle?.n||0)**2} classified`;
    if(a.gameId==='hitori') return `${a.state?.cells?.filter(Boolean).length||0}/${(a.puzzle?.n||0)**2} marked`;
    if(a.gameId==='dominoes') return `${Math.floor((a.state?.partner||[]).filter(v=>v>=0).length/2)}/${((a.puzzle?.max||0)+1)*((a.puzzle?.max||0)+2)/2} dominoes`;
    if(a.gameId==='fillomino') return `${a.state?.board?.filter(v=>v!=null).length||0}/${(a.puzzle?.n||0)**2} filled`;
    if(a.gameId==='untangle') return `${untangleCrossings(a.puzzle?.edges||[],a.state?.positions||[])} crossings`;
    if(a.gameId==='sudoku') return `${a.state?.board?.filter(Boolean).length||0}/81 filled`;
    if(a.gameId==='killer-sudoku') return `${a.state?.board?.filter(Boolean).length||0}/81 filled`;
    if(a.gameId==='light-up') return `${a.state?.cells?.filter(x=>x===1).length||0} lamps placed`;
    if(a.gameId==='tents') return `${a.state?.cells?.filter(x=>x===1).length||0}/${a.puzzle?.trees?.length||0} tents`;
    if(a.gameId==='rectangles') return `${(a.state?.rects||[]).reduce((s,x)=>s+x.h*x.w,0)}/${(a.puzzle?.n||0)**2} cells partitioned`;
    if(a.gameId==='towers') return `${a.state?.board?.filter(Boolean).length||0}/${(a.puzzle?.n||0)**2} filled`;
    if(a.gameId==='network') return `${a.state?.moves||0} rotations`;
    if(a.gameId==='kakuro') return `${a.state?.board?.filter((v,i)=>v&&a.puzzle.white?.[i]).length||0}/${a.puzzle?.white?.filter(Boolean).length||0} filled`;
    if(a.gameId==='mines') return `${a.state?.revealed?.filter(Boolean).length||0} cells revealed`;
    if(a.gameId==='lights-out') return `${a.state?.board?.filter(Boolean).length||0} lights on`;
    if(a.gameId==='sliding-tiles') return `${a.state?.moves||0} moves`;
    if(a.gameId==='make-24') return `${a.state?.values?.length||4} values remaining`;
    if(a.gameId==='word-search') return `${a.state?.found?.length||0}/${a.puzzle?.words?.length||0} words found`;
    return 'In progress';
  }

  async function renderStats(ticket=routeGeneration){
    stopTimer(); state.currentGame=null; state.currentActive=null; updateNav('stats'); document.title='Statistics — Puzzle Arcade';
    state.history=sanitizeHistory(await db.all('history')).sort((a,b)=>b.endedAt-a.endedAt);
    if (!routeIsCurrent(ticket)) return;
    const completed=state.history.filter(h=>h.outcome==='completed');
    const totalTime=completed.reduce((s,h)=>s+(h.durationMs||0),0);
    let streak=0; for(const h of state.history){ if(h.outcome==='completed') streak++; else break; }
    let best=0,cur=0; [...state.history].reverse().forEach(h=>{ if(h.outcome==='completed'){cur++;best=Math.max(best,cur)} else cur=0; });
    main.innerHTML=`<div class="page"><div class="page-head"><div><p class="page-kicker">Local statistics</p><h1>Your puzzles</h1><p class="subtle">Everything here stays on this device.</p></div></div>
      ${state.history.length?`<div class="stats-grid">
        <div class="stat-block"><strong>${completed.length}</strong><span>Solved</span></div>
        <div class="stat-block"><strong>${formatTime(totalTime)}</strong><span>Play time</span></div>
        <div class="stat-block"><strong>${streak}</strong><span>Solve streak</span></div>
        <div class="stat-block"><strong>${best}</strong><span>Best streak</span></div>
      </div>
      <section class="section"><div class="section-head"><div><h2>Recent</h2></div></div><div class="recent-list">${state.history.slice(0,30).map(h=>`<div class="recent-row"><strong>${esc(byId[h.gameId]?.name||h.gameId)}</strong><span>${h.outcome==='completed'?'Solved':'Ended'}</span><span>${formatTime(h.durationMs||0)} · ${new Date(h.endedAt).toLocaleDateString()}</span></div>`).join('')}</div></section>`:`<div class="empty"><h2>No puzzles solved yet.</h2><p>Pick a game and your results will appear here.</p><button class="primary-button" data-action="home">Choose a puzzle</button></div>`}
    </div>`;
    bindCommon();
  }

  async function renderSettings(){
    stopTimer(); state.currentGame=null; state.currentActive=null; updateNav('settings'); document.title='Settings — Puzzle Arcade';
    main.innerHTML=`<div class="page"><div class="page-head"><div><p class="page-kicker">Preferences</p><h1>Settings</h1></div></div>
      <section class="settings-group"><h2>Appearance</h2><p class="subtle">Use your system theme or choose one explicitly.</p><div class="segmented">${['system','light','dark'].map(t=>`<button data-theme-choice="${t}" class="${state.settings.theme===t?'is-active':''}">${t[0].toUpperCase()+t.slice(1)}</button>`).join('')}</div></section>
      <section class="settings-group"><h2>Play mode</h2><p class="subtle">Relaxed keeps pressure low. Challenge emphasizes time and mistakes.</p><div class="segmented">${['relaxed','challenge'].map(t=>`<button data-mode-choice="${t}" class="${state.settings.playMode===t?'is-active':''}">${t[0].toUpperCase()+t.slice(1)}</button>`).join('')}</div></section>
      <section class="settings-group"><h2>Local data</h2><p class="subtle">Progress, favorites, and statistics are stored locally on this device.</p><button class="danger-button" data-action="clear-data">Reset local puzzle data</button></section>
      <section class="settings-group"><h2>Privacy & notices</h2><p class="subtle">No account or analytics are required. Shared puzzle links contain only the game, seed, and difficulty.</p><div class="result-actions"><button class="secondary-button" data-action="privacy-info">Privacy</button><button class="secondary-button" data-action="license-info">Licenses & notices</button></div></section>
      <section class="settings-group"><h2>About this build</h2><p class="subtle">Puzzle Arcade ${APP_VERSION} · ${BUILD_PHASE} · ${playableIds.length}/${ALL_GAMES.length} playable games · local-first PWA.</p></section>
    </div>`;
    $$('[data-theme-choice]').forEach(b=>b.onclick=()=>{setTheme(b.dataset.themeChoice);renderSettings()});
    $$('[data-mode-choice]').forEach(b=>b.onclick=async()=>{state.settings.playMode=b.dataset.modeChoice;await db.put('kv',state.settings,'settings');renderSettings()});
    bindCommon();
  }

  let overlayReturnFocus=null;
  function trapOverlayFocus(e){
    e.stopPropagation();
    if(e.key==='Escape'){e.preventDefault();closeOverlay();return;}
    if(e.key!=='Tab')return;
    const focusable=$$('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])',overlayRoot).filter(el=>!el.disabled&&!el.hidden);
    if(!focusable.length)return; const first=focusable[0],last=focusable.at(-1);
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  }
  function showSearch(){
    overlayReturnFocus=document.activeElement;
    main.inert=true; $('.topbar').inert=true;
    overlayRoot.innerHTML=`<div class="search-panel"><div class="search-wrap" role="dialog" aria-modal="true" aria-label="Search puzzles"><div class="search-row"><input class="search-input" aria-label="Search puzzles" placeholder="Search puzzles…" autofocus><button class="icon-button" data-search-close aria-label="Close search">×</button></div><div class="search-results"></div></div></div>`;
    const input=$('.search-input',overlayRoot), results=$('.search-results',overlayRoot);
    const update=()=>{
      const q=input.value.trim().toLowerCase();
      const games=ALL_GAMES.filter(g=>g.status==='available' && (!q || `${g.name} ${g.category} ${g.description}`.toLowerCase().includes(q)));
      results.innerHTML=games.map(g=>`<button class="search-result" data-game="${g.id}"><strong>${esc(g.name)}</strong><span>${CATEGORIES[g.category].label}</span></button>`).join('') || `<div class="empty">No puzzles found.</div>`;
      $$('.search-result',results).forEach(b=>b.onclick=()=>{closeOverlay();openGame(b.dataset.game)});
    };
    input.addEventListener('input',update); update();
    $('[data-search-close]',overlayRoot).onclick=closeOverlay;
    overlayRoot.onkeydown=trapOverlayFocus;
    setTimeout(()=>input.focus(),0);
  }
  function closeOverlay(){
    overlayRoot.innerHTML=''; overlayRoot.onkeydown=null;
    main.inert=false; $('.topbar').inert=false;
    const el=overlayReturnFocus; overlayReturnFocus=null;
    if(el?.isConnected) el.focus({preventScroll:true});
  }

  async function toggleFavorite(id){
    const i=state.favorites.indexOf(id); if(i>=0) state.favorites.splice(i,1); else state.favorites.push(id);
    await db.put('kv',state.favorites,'favorites');
    const route=parseHash().parts[0]||'home'; if(route==='home') renderHome();
  }

  async function clearData(){
    showModal('Reset local puzzle data', `<p>This removes active puzzles, statistics, favorites, and preferences from this browser.</p>`, [
      {label:'Cancel',kind:'secondary',action:closeOverlay},
      {label:'Reset all',kind:'danger',action:async()=>{
        stopTimer();
        if(state.currentActive) retiredActives.add(state.currentActive);
        ++routeGeneration;
        const deleted=await db.resetAll();
        state.settings={theme:'system',playMode:'relaxed',motion:'system',contrast:'system',controls:'standard'};state.favorites=[];state.history=[];state.active=[];state.currentGame=null;state.currentActive=null;closeOverlay();setTheme('system',false);applyAccessibilitySettings(false);renderSettings();toast(deleted?'Local data reset':'Local data cleared where possible. Close other Puzzle Arcade tabs to finish the reset.');
      }}
    ]);
  }

  function showModal(title, body, actions=[{label:'Close',kind:'secondary',action:closeOverlay}]){
    overlayReturnFocus=document.activeElement;
    main.inert=true; $('.topbar').inert=true;
    overlayRoot.innerHTML=`<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-head"><h2 id="modal-title">${esc(title)}</h2><button class="modal-close" data-modal-close aria-label="Close">×</button></div><div>${body}</div><div class="result-actions" style="margin-top:20px">${actions.map((a,i)=>`<button class="${a.kind==='primary'?'primary-button':a.kind==='danger'?'danger-button':'secondary-button'}" data-modal-action="${i}">${esc(a.label)}</button>`).join('')}</div></section></div>`;
    $('[data-modal-close]',overlayRoot).onclick=closeOverlay;
    actions.forEach((a,i)=>$(`[data-modal-action="${i}"]`,overlayRoot).onclick=a.action);
    $('.modal-backdrop',overlayRoot).addEventListener('click',e=>{if(e.target===e.currentTarget)closeOverlay()});
    overlayRoot.onkeydown=trapOverlayFocus;
    setTimeout(()=>$('[data-modal-close]',overlayRoot)?.focus(),0);
  }

  function showPrivacyInfo(){
    showModal('Privacy', `<p>Puzzle Arcade does not require an account and does not include analytics or advertising trackers.</p><p>Progress, favorites, settings, and statistics are stored in this browser. The hosting provider still receives ordinary network requests needed to load the application files.</p><p>Shared puzzle links contain only the game ID, deterministic puzzle seed, and difficulty. They do not include your history, statistics, favorites, or device identifiers.</p>`);
  }
  function showLicenseInfo(){
    showModal('Licenses & notices', `<p>Puzzle Arcade has no third-party runtime JavaScript, CSS, font, analytics, or API dependencies.</p><p>The broad accepted-word dictionary is derived from the English Speller Database (ESDB/SCOWL), Copyright 2000–2026 Kevin Atkinson, under its permissive redistribution terms. Full attribution is in THIRD_PARTY_NOTICES.md.</p><p>Puzzle targets, clues, interface assets, and game implementations remain maintained in-project.</p>`);
  }

  function bindCommon(){
    $$('[data-action="home"]').forEach(b=>b.onclick=()=>go('home'));
    $$('[data-route]').forEach(b=>b.onclick=()=>go(b.dataset.route));
    $$('[data-action="random"]').forEach(b=>b.onclick=randomGame);
    $$('[data-action="search"]').forEach(b=>b.onclick=showSearch);
    $$('[data-action="clear-data"]').forEach(b=>b.onclick=clearData);
    $$('[data-action="privacy-info"]').forEach(b=>b.onclick=showPrivacyInfo);
    $$('[data-action="license-info"]').forEach(b=>b.onclick=showLicenseInfo);
    $$('[data-category-filter]').forEach(b=>b.onclick=()=>{state.category=b.dataset.categoryFilter;renderHome()});
    $$('[data-favorite]').forEach(b=>b.onclick=e=>{e.stopPropagation();toggleFavorite(b.dataset.favorite)});
    $$('.game-card__open,.continue-card').forEach(el => {
      el.onclick=()=>openGame(el.dataset.gameOpen || el.dataset.game);
    });
  }

  async function randomGame(){
    const avail=ALL_GAMES.filter(g=>g.status==='available'&&(state.category==='all'||(state.category==='favorites'?state.favorites.includes(g.id):g.category===state.category)));
    if(!avail.length) return;
    const recent=state.history.slice(0,2).map(h=>h.gameId);
    const options=avail.filter(g=>!recent.includes(g.id));
    const g=pick(options.length?options:avail);
    openGame(g.id, false);
  }

  function routeToGame(id, seed, difficulty){
    const q=new URLSearchParams(); if(seed)q.set('seed',seed); if(difficulty)q.set('difficulty',difficulty);
    go(`game/${id}${q.toString()?`?${q}`:''}`);
  }
  function openGame(id, forceNew=false){
    const g=byId[id]; if(!g||g.status!=='available'){ toast('That puzzle is not playable in this build yet.'); return; }
    routeToGame(id, forceNew?seedString():null, null);
  }

  function stopTimer(){ if(state.timer != null){clearInterval(state.timer);state.timer=null;} }
  function activeDuration(active) {
    if (active.completed) return Math.max(0, active.durationMs || 0);
    const elapsed = Number.isFinite(active.elapsedMs) ? Math.max(0,active.elapsedMs) : 0;
    return elapsed + (Number.isFinite(active.startedAt) && active.startedAt > 0 ? Math.max(0,Date.now()-active.startedAt) : 0);
  }
  function checkpointTime(active, pause=false) {
    if (!active || active.completed) return;
    active.elapsedMs = activeDuration(active);
    active.startedAt = pause ? null : (active.startedAt ? Date.now() : null);
  }
  function startTimer(active) {
    stopTimer();
    const draw=()=>{ const el=$('[data-timer]'); if(el)el.textContent=formatTime(activeDuration(active)); };
    draw();
    if (active.completed || document.hidden || retiredActives.has(active) || playSession(active).paused) return;
    if (!active.startedAt) active.startedAt=Date.now();
    state.timer=setInterval(draw,500);
  }
  function journalActive(active) {
    try { localStorage.setItem(`pa:checkpoint:${active.gameId}`,JSON.stringify(active)); return true; }
    catch { return false; }
  }
  async function saveActive(active) {
    if (!active || retiredActives.has(active)) return false;
    if (state.currentActive === active) checkpointTime(active);
    active.updatedAt=saveClock=Math.max(Date.now(), saveClock+1);
    const version=active.updatedAt;
    journalActive(active);
    const ok=await db.put('active',active);
    if (ok) {
      const checkpoint=readCheckpoint(active.gameId);
      if (checkpoint && checkpoint.updatedAt <= version) {
        try { localStorage.removeItem(`pa:checkpoint:${active.gameId}`); } catch {}
      }
    }
    return ok;
  }
  async function finishActive(active, metrics={}, outcome='completed') {
    if (!active || active.completed || retiredActives.has(active)) return;
    const epoch=db._epoch;
    const durationMs=activeDuration(active);
    active.completed=true; active.outcome=outcome; active.durationMs=durationMs; active.startedAt=null;
    const entry={id:uid('result'),gameId:active.gameId,puzzleIdentity:`${active.gameId}:${active.difficulty}:${active.seed}`,
      outcome,difficulty:active.difficulty,durationMs,metrics:{...metrics,hintsUsed:active.hintsUsed||0},endedAt:Date.now()};
    active.result=entry;
    if(state.currentActive===active)stopTimer();
    await saveActive(active);
    if(epoch!==db._epoch)return;
    await db.put('history',entry);
    if(epoch!==db._epoch)return;
    if(!state.history.some(h=>h.id===entry.id))state.history.unshift(entry);
  }

  function proofHintContent(view){if(!view)return '';const items=view.stages.slice(0,view.level+1).map((text,i)=>`<li><span>${esc(view.labels[i])}</span><p>${esc(text)}</p></li>`).join('');return `<div class="proof-hint-head"><strong>Hint ${view.level+1}/4 · ${esc(view.labels[view.level])}</strong><small>${view.level<3?'Press Hint again for the next layer.':'Full deduction revealed.'}</small></div><ol>${items}</ol>`;}
  function proofHintPanel(active){const h=active.state?._proofHint;if(h?.stateSig&&h.stateSig!==hintStateFingerprint(active)){delete active.state._proofHint;delete active.state._proofHintView;}const v=active.state?._proofHintView;return `<div class="proof-hint" data-proof-hint role="status" aria-live="polite" ${v?'':'hidden'}>${v?proofHintContent(v):''}</div>`;}
  function refreshProofHintPanel(active){const el=$('[data-proof-hint]');if(!el)return;const v=active.state?._proofHintView;el.hidden=!v;el.innerHTML=v?proofHintContent(v):'';}

  // Play experience: shared controls with game-specific coaching; no answer peeking.
  const PLAY_GUIDES = {
    'five-letters':['Start with five different, common letters. Use the feedback before spending your next guess.','Type letters; Enter submits; Backspace removes a letter.','Repeated letters matter: a muted copy does not rule out a second, marked copy.'],
    groups:['Look for four words that share one precise connection, not just a loose association.','Select four tiles, then Submit group. Shuffle changes only their display order.','A word may fit several ideas. Check the remaining words before committing.'],
    'word-ladder':['Compare the current word with the target. Change one position while keeping a real word.','Type the next word and press Enter. Undo takes back your last step.','You may need to move away from the target temporarily. The displayed par uses the accepted dictionary.'],
    anagrams:['Look for a familiar ending or a consonant pair, then try the remaining letters around it.','Type or tap tiles. Enter submits; Backspace removes the last tile.','Every tile must be used once. Repeated letters need separate tiles; alternate valid anagrams count.'],
    'letter-hive':['Build a short word around the center letter, then try longer forms using the same letters.','Type or tap letters; Enter submits; Backspace deletes. Letters can be reused.','Every word needs the center letter and at least four letters. A found word counts only once.'],
    'word-grid':['Scan for short words, then extend their paths through neighboring letters.','Drag to submit, or tap a path and press Submit. Backspace shortens your path.','Diagonals are allowed, but a cell cannot appear twice in the same word.'],
    'theme-trail':['Use the theme to predict a word, then look for its first letters around the board.','Trace neighboring letters; drag to submit or use Submit after tapping.','Solved words lock their cells. The remaining paths must cover every unused cell.'],
    'word-pieces':['Read the chunks as beginnings and endings. Try a familiar compound before a long combination.','Tap chunks in order; Remove last revises your choice; Submit checks it.','A tile can be used only once per word, but returns for your next word.'],
    'mini-crossword':['Solve the clearest clue first, then use those crossing letters in the other direction.','Tap a clue or square; tap a crossing again to switch direction. Type or use the letter keys.','A plausible answer must also fit every crossing. Recheck the clue rather than forcing a letter.'],
    cryptogram:['Look for one-letter words, repeated letter patterns, and short words that occur often.','Choose a cipher letter, then assign a letter using the keyboard or letter buttons.','A substitution applies everywhere. Two cipher letters cannot share a plaintext letter.'],
    'word-search':['Scan for the first and last letters of a target, then check the straight line between them.','Select the first and last letter of a word, or drag along its letters.','Words may run backward or diagonally. Each word follows one straight line.'],
    sudoku:['Start with the row, column, or box with the most givens. Look for a number with one possible square.','Select a square and enter 1–9. N toggles notes; C fills candidates; Delete clears.','Notes are possibilities, not answers. Remove candidates when a peer receives that number.'],
    'killer-sudoku':['Start with small cages and sums that have only a few distinct digit combinations.','Select a square and enter a digit. Use the cage information together with its row, column, and box.','Digits cannot repeat in a cage even when its squares are in different rows or boxes.'],
    kakuro:['Look for short runs with extreme sums, then intersect their possible digits with crossing runs.','Select a white square and enter 1–9; arrows move between white squares.','A run sum alone is not enough: every digit in that run must also be different.'],
    unequal:['Follow a chain of inequalities first. A long increasing chain leaves little room for its endpoints.','Select a square and enter a number; arrows move; Delete clears.','The pointed end of an inequality faces the smaller number. Rows and columns cannot repeat.'],
    'arithmetic-cages':['Start with single-cell cages and cages with very few arithmetic combinations.','Select a square, enter a value, and inspect its cage operation.','Subtraction and division can be read in either order. Row and column uniqueness still applies.'],
    'make-24':['Look for useful intermediate pairs such as 6 and 4, or 8 and 3. Fractions may unlock the solution.','Choose a value, an operation, and another value. Undo restores the previous pair.','You must use all four starting numbers exactly once. A dead end is a reason to undo, not restart the puzzle.'],
    mines:['Your first reveal is safe. Use each number with the covered squares and flags that surround it.','Choose Reveal or Flag; right-click or long-press flags. Tap a satisfied number to chord.','A flag is your assumption, not a confirmed mine. Wrong flags can make a chord unsafe.'],
    nonogram:['Compare the total clue lengths and required gaps with the line length. Start with overlapping blocks.','Drag to fill or mark. Right-click marks; arrows move; Space paints; X selects marks; F selects fill.','Separate consecutive filled runs with at least one empty square. A crossed square is not a filled square.'],
    loop:['Start around 0 clues, then inspect 3 clues and corners with very few remaining edge choices.','Tap an edge to cycle line, cross, and empty; drag to paint matching edge states.','Every used vertex has exactly two loop edges. Do not close a small loop before the rest is connected.'],
    bridges:['Start with islands whose required bridge count nearly uses all their available directions.','Tap a possible connection to cycle zero, one, and two bridges.','Satisfying each number is not enough: all islands must form one connected network.'],
    'light-up':['Use numbered walls with few available neighbors, then inspect dark cells that have only one light source.','Tap a white cell to change its state; use the lamp and mark controls for explicit placement.','Lamps illuminate entire unobstructed rows and columns, and two lamps must never see each other.'],
    islands:['An island labeled 1 is already complete. Its orthogonal neighbors must be sea.','Select a square and choose Sea, Island, or Clear.','Each island has exactly one clue; the sea is connected and may never contain a solid 2×2 block.'],
    hitori:['Find repeated numbers in rows and columns. Use adjacency and connectivity to decide which copy remains.','Select a square and choose its shaded, unshaded, or unknown state.','Shaded cells cannot touch by an edge. Never disconnect the remaining white area.'],
    binary:['Look for two equal neighboring digits or a pair with one gap between them.','Select a square and enter 0 or 1; clear a square to reconsider it.','Each row and column has equal counts of 0 and 1. Completed rows and columns must be distinct.'],
    queens:['Start with a region that has very few available squares. Compare it with its rows and columns.','Tap cells to mark or place queens; use the explicit queen and mark controls.','There is one queen in each row, column, and region. Queens must not touch diagonally.'],
    'number-path':['Plan around corners and narrow passages before extending the current endpoint.','Drag through adjacent cells. Drag backward or use Undo to revise the path.','Every cell must be visited once, with checkpoints in order. Do not isolate an unvisited pocket.'],
    tents:['Start with zero-count lines and trees that have only one possible tent neighbor.','Select a square and place a tent, mark grass, or clear it.','Tents cannot touch even diagonally. Each tent must pair with a different adjacent tree.'],
    rectangles:['Start with clues whose factor pairs allow very few rectangles in their part of the board.','Select opposite corners to place a rectangle. Select a placed rectangle to remove it.','A rectangle needs exactly one clue, with area equal to that clue, and cannot overlap another rectangle.'],
    dominoes:['Use the remaining pair inventory to find number pairs with only one available location.','Select a cell and an orthogonal neighbor to pair them; Clear removes a selected pairing.','A 2–4 domino is the same pair as 4–2. Each unordered pair appears exactly once.'],
    towers:['A visibility clue of 1 forces the tallest tower at that edge; a clue of N forces an increasing line.','Select a square and enter its height; compare the clues at both ends of the line.','A tall tower hides every shorter tower behind it, not just its immediate neighbor.'],
    fillomino:['Grow small given regions first. Count how many cells each number still needs.','Select a square and enter a region size. Given numbers cannot change.','Touching equal numbers merge into one region. That merged region must have exactly the indicated size.'],
    network:['Start along the border: no connector may point outside the board. Then work inward.','Tap a tile to rotate clockwise; right-click rotates counter-clockwise.','Locally matching connectors are not enough. Every tile must belong to the same network.'],
    'sliding-tiles':['Build the top row and then the left column, leaving room to maneuver the final tiles.','Tap a tile next to the gap, or use the arrow keys. Undo reverses one slide.','A useful move can temporarily displace a correct tile. Avoid moving the same tile back and forth.'],
    'lights-out':['Treat each press as a cross-shaped toggle. Work systematically rather than chasing isolated lights.','Tap a light to toggle it and its orthogonal neighbors; Undo reverses a press.','Press order does not matter, and pressing a square twice cancels itself.'],
    untangle:['Move a node involved in several crossings toward open space, then refine its neighbors.','Drag nodes; focus a node and use arrows for small moves, or Shift+arrows for larger moves.','Edges sharing an endpoint may meet there. Only crossings between unrelated edges must disappear.']
  };
  const playSessions=new WeakMap();
  function playSession(a){if(!playSessions.has(a))playSessions.set(a,{guide:false,paused:false,redo:[],restoring:false,busy:false,signature:null,feedback:'',order:[]});return playSessions.get(a);}
  function canUndoGame(game,a){return !a.completed&&!playSession(a).paused&&typeof game.undo==='function'&&(game.id==='word-ladder'?a.state.chain.length>1:!!a.state.history?.length);}
  function playSignature(a){return hintStateFingerprint(a)+JSON.stringify(a.state.notes||[]);}
  function playGuide(game,a){const [start,controls,tip]=PLAY_GUIDES[game.id];return `<section class="play-guide" id="play-guide" ${playSession(a).guide?'':'hidden'} aria-label="${esc(game.name)} playing guide"><div><h2>Find your first move</h2><p>${esc(start)}</p></div><div><h3>Controls</h3><p>${esc(controls)}</p></div><div><h3>Watch for this</h3><p>${esc(tip)}</p></div><button class="small-button" data-game-rules>Full rules</button></section>`;}
  function pauseGame(game,a){if(a.completed)return;const ui=playSession(a);ui.paused=!ui.paused;if(ui.paused){checkpointTime(a,true);stopTimer();}else a.startedAt=document.hidden?null:Date.now();void saveActive(a);game.render(a);$('[data-game-pause]')?.focus({preventScroll:true});}
  async function redoGame(game,a){const ui=playSession(a);if(a.completed||ui.paused||ui.restoring||!ui.redo.length)return;ui.restoring=true;try{a.state=structuredClone(ui.redo.pop());await saveActive(a);game.render(a);}finally{ui.restoring=false;}}
  function gameFeedback(message,a=state.currentActive){if(!a)return;playSession(a).feedback=String(message).slice(0,600);const el=$('[data-play-feedback]');if(el){el.textContent=playSession(a).feedback;el.hidden=false;}}
  function dismissGameHint(a){delete a.state._proofHintView;playSession(a).feedback='';state.currentGame.render(a);}
  async function requestGameHint(game,a){const ui=playSession(a);if(a.completed||ui.paused||ui.busy)return;ui.busy=true;const button=$('[data-game-hint]');if(button){button.disabled=true;button.textContent='Thinking…';}await new Promise(resolve=>requestAnimationFrame(()=>setTimeout(resolve,0)));if(state.currentActive!==a||a.completed||ui.paused){ui.busy=false;return;}const old=a.state._proofHintView?JSON.stringify(a.state._proofHintView):'',before=ui.feedback;try{await game.hint(a);if((a.state._proofHintView&&JSON.stringify(a.state._proofHintView)!==old)||ui.feedback!==before){a.hintsUsed=Math.min(100000,(a.hintsUsed||0)+1);await saveActive(a);}}catch(error){gameFeedback('A hint could not be calculated. Try again, or undo your last move.',a);}finally{ui.busy=false;if(state.currentActive===a){game.render(a);$('[data-game-hint]')?.focus({preventScroll:true});}}}
  function isWordOnGrid(word,grid,n){word=String(word).toUpperCase();if(word.length>grid.length)return false;const used=new Set();function walk(i,k){if(grid[i]!==word[k]||used.has(i))return false;if(k===word.length-1)return true;used.add(i);const r=Math.floor(i/n),c=i%n;for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){if(!dr&&!dc)continue;const rr=r+dr,cc=c+dc;if(rr>=0&&rr<n&&cc>=0&&cc<n&&walk(rr*n+cc,k+1)){used.delete(i);return true;}}used.delete(i);return false;}return grid.some((_,i)=>walk(i,0));}
  function rememberDifficulty(game,difficulty){state.settings.difficulties=state.settings.difficulties||{};state.settings.difficulties[game.id]=normalizeDifficulty(game,difficulty);void db.put('kv',state.settings,'settings');}
  function setupPlayExperience(game,a){
    const ui=playSession(a),signature=playSignature(a);if(ui.signature!==null&&ui.signature!==signature&&!ui.restoring){ui.redo=[];ui.feedback='';const feedback=$('[data-play-feedback]');if(feedback){feedback.textContent='';feedback.hidden=true;}}ui.signature=signature;
    if(ui.paused){checkpointTime(a,true);stopTimer();$('.game-stage')?.setAttribute('inert','');}
    const undo=$('[data-play-undo]'),redo=$('[data-play-redo]');if(undo)undo.disabled=!canUndoGame(game,a);if(redo)redo.disabled=a.completed||ui.paused||!ui.redo.length;
    $$('button',main).filter(el=>el.textContent.trim()==='Undo'&&!el.hasAttribute('data-play-undo')).forEach(el=>{el.disabled=!canUndoGame(game,a);el.classList.add('legacy-undo');});
    const oldKeys=window.onkeydown;
    window.onkeydown=e=>{if(ui.paused)return;if((e.ctrlKey||e.metaKey)&&!e.altKey&&!e.target?.closest?.('input,textarea,select,[contenteditable="true"]')){if(e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?redoGame(game,a):canUndoGame(game,a)&&game.undo(a);return;}if(e.key.toLowerCase()==='y'){e.preventDefault();redoGame(game,a);return;}}oldKeys?.(e);};
    if(a.completed){$('.result-panel')?.setAttribute('tabindex','-1');if(!ui.announced){ui.announced=true;gameFeedback(a.outcome==='failed'?'Puzzle ended. Review the answer, or start a fresh puzzle.':'Puzzle solved. Your result has been saved.',a);}}
    if(game.id==='five-letters'){$('.wordle-board')?.insertAdjacentHTML('afterend','<div class="feedback-key" aria-label="Tile feedback"><span><i class="correct"></i>Right place</span><span><i class="present"></i>Elsewhere</span><span><i class="absent"></i>Not this copy</span></div>');if(a.outcome==='failed')$('.result-panel h2')?.insertAdjacentHTML('afterend',`<p class="revealed-answer">The answer was <strong>${esc(a.puzzle.answer)}</strong>.</p>`);}
    if(['groups','anagrams','letter-hive'].includes(game.id)&&!a.completed){const selector={groups:'[data-group-tile]',anagrams:'[data-anagram-tile]','letter-hive':'[data-hive-letter]'}[game.id];const nodes=$$(selector);if(nodes.length){const parent=nodes[0].parentElement;if(game.id!=='letter-hive'){if(!ui.order.length)ui.order=nodes.map(n=>n.getAttribute(selector.slice(1,-1)));for(const node of nodes){node.style.order=String(ui.order.indexOf(node.getAttribute(selector.slice(1,-1))));}const shuffleButton=document.createElement('button');shuffleButton.className='small-button play-shuffle';shuffleButton.textContent='Shuffle tiles';shuffleButton.dataset.playShuffle='';shuffleButton.onclick=()=>{ui.order=shuffle(ui.order);game.render(a);$('[data-play-shuffle]')?.focus({preventScroll:true});};parent.insertAdjacentElement('afterend',shuffleButton);}}}
    if(game.id==='sudoku'&&!a.completed){const selected=a.state.board[a.state.selected];$$('[data-cell]').forEach(el=>{const i=+el.dataset.cell;el.classList.toggle('same-value',!!selected&&i!==a.state.selected&&a.state.board[i]===selected);});$$('[data-num]').forEach(el=>{const v=+el.dataset.num;if(!v)return;const count=a.state.board.filter(x=>x===v).length;el.setAttribute('aria-label',`${v}, ${Math.max(0,9-count)} remaining`);el.classList.toggle('digit-complete',count===9);});}
    if(game.id==='cryptogram'){const counts={};for(const c of a.puzzle.cipher)if(/[A-Z]/.test(c))counts[c]=(counts[c]||0)+1;const items=Object.entries(counts).sort((a,b)=>b[1]-a[1]);$('.game-board-wrap')?.insertAdjacentHTML('beforeend',`<details class="cipher-frequency"><summary>Letter frequency · ${items.length} symbols</summary><div>${items.map(([c,n])=>`<span>${c} <b>${n}</b></span>`).join('')}</div></details>`);}
  }
  function installPlayExperience(){
    for(const game of Object.values(GAMES))if(typeof game.undo==='function'){const undo=game.undo;game.undo=async function(a){const ui=playSession(a);if(!canUndoGame(game,a)||ui.restoring)return;const snapshot=structuredClone(a.state),signature=playSignature(a);ui.restoring=true;try{await undo.call(this,a);if(playSignature(a)!==signature){ui.redo.push(snapshot);if(ui.redo.length>24)ui.redo.shift();}}finally{ui.restoring=false;if(state.currentActive===a)game.render(a);}};}
    const wordleKey=fiveLetters.key;fiveLetters.key=function(a,key){if(key==='ENTER'&&a.state.guesses.some(g=>g.word===a.state.current)){toast('You already tried that word. Use the feedback to try a different guess.');return;}return wordleKey.call(this,a,key);};
    const groupsSubmit=groupsGame.submit;groupsGame.submit=async function(a){if(a.state.selected.length!==4)return;const key=[...a.state.selected].sort().join('|');a.triedGroups=a.triedGroups||[];if(a.triedGroups.includes(key)){toast('You already tried this combination. No extra mistake counted.');return;}a.triedGroups.push(key);if(a.triedGroups.length>200)a.triedGroups.shift();const picked=a.state.selected.map(id=>a.puzzle.tiles.find(t=>t.id===id)),counts={};for(const t of picked)counts[t.groupId]=(counts[t.groupId]||0)+1;await groupsSubmit.call(this,a);if(Math.max(...Object.values(counts))===3)toast('One away: three of those words share a group.');await saveActive(a);};
    const ladderCreate=wordLadder.create;wordLadder.create=async function(seed,difficulty){const a=await ladderCreate.call(this,seed,difficulty),path=acceptedLadderPath(a.puzzle.start,a.puzzle.target);if(path)a.puzzle.optimal=path.length-1;return a;};
    const nonogramBind=nonogramGame.bind;nonogramGame.bind=function(a){nonogramBind.call(this,a);const ui=playSession(a),n=a.puzzle.size;ui.cursor=clamp(ui.cursor||0,0,n*n-1);const paint=async(i,tool)=>{if(a.completed||ui.paused)return;const old=[...a.state.cells];a.state.cells[i]=a.state.cells[i]===tool?0:tool;a.state.history.push(old);if(a.puzzle.solution.every((v,k)=>!!v===(a.state.cells[k]===1)))await finishActive(a,{size:n,image:a.puzzle.name});else await saveActive(a);this.render(a);};$$('[data-nono]').forEach(el=>{el.onfocus=()=>{ui.cursor=+el.dataset.nono;};el.oncontextmenu=e=>{e.preventDefault();ui.cursor=+el.dataset.nono;paint(ui.cursor,2);};});window.onkeydown=e=>{let i=ui.cursor,r=Math.floor(i/n),c=i%n;if(e.key==='ArrowUp')r=Math.max(0,r-1);else if(e.key==='ArrowDown')r=Math.min(n-1,r+1);else if(e.key==='ArrowLeft')c=Math.max(0,c-1);else if(e.key==='ArrowRight')c=Math.min(n-1,c+1);else if(e.key.toLowerCase()==='x'||e.key.toLowerCase()==='f'){e.preventDefault();a.state.tool=e.key.toLowerCase()==='x'?2:1;this.render(a);return;}else if(e.key===' '||e.key==='Enter'){e.preventDefault();paint(i,a.state.tool);return;}else return;e.preventDefault();ui.cursor=r*n+c;$(`[data-nono="${ui.cursor}"]`)?.focus({preventScroll:true});};};
  }

  function baseGameShell(g, active, boardHtml, extraHtml=''){
    const game=GAMES[g.id],ui=playSession(active),favorite=state.favorites.includes(g.id),difficulties=game.difficulties||['Standard'];
    return `<div class="game-page" data-play-game="${g.id}" data-play-seed="${esc(active.seed)}" data-play-category="${g.category}">
      <div class="game-top"><button class="game-back" data-game-back aria-label="Back to puzzles">←</button><div class="game-title"><small>${esc(CATEGORIES[g.category].label)} puzzles</small><h1>${esc(g.name)}</h1></div><button class="game-menu" data-game-menu aria-label="Game menu">•••</button></div>
      <p class="game-objective">${esc(game.rules.objective)}</p>
      <div class="play-commandbar" role="group" aria-label="Puzzle controls">
        <label class="play-difficulty"><span>Difficulty</span><select data-play-difficulty aria-label="Difficulty for a new puzzle" title="Changing difficulty starts a new puzzle">${difficulties.map(d=>`<option ${active.difficulty===d?'selected':''}>${esc(d)}</option>`).join('')}</select></label>
        ${typeof game.undo==='function'?`<div class="play-history"><button data-play-undo aria-label="Undo" title="Undo (Ctrl/⌘ Z)" ${canUndoGame(game,active)?'':'disabled'}>↶ <span>Undo</span></button><button data-play-redo aria-label="Redo" title="Redo (Ctrl/⌘ Shift Z)" ${!active.completed&&ui.redo.length?'':'disabled'}>↷ <span>Redo</span></button></div>`:''}
        <button class="play-hint-button" data-game-hint ${active.completed||ui.paused||ui.busy?'disabled':''}>${ui.busy?'Thinking…':'Hint'}</button>
        <button data-play-guide aria-expanded="${ui.guide}" aria-controls="play-guide">Guide</button>
        <button data-game-pause ${active.completed?'disabled':''}>${ui.paused?'Resume':'Pause'}</button>
      </div>
      ${playGuide(game,active)}
      <div class="play-feedback" data-play-feedback role="status" aria-live="polite" ${ui.feedback?'':'hidden'}>${esc(ui.feedback)}</div>
      <div class="play-hint-zone">${proofHintPanel(active)}${active.state._proofHintView?'<button class="hint-dismiss" data-hint-dismiss aria-label="Hide hint">Hide hint</button>':''}</div>
      <div class="game-layout"><section class="game-stage ${ui.paused?'is-paused':''}" ${ui.paused?'inert':''}><div class="game-board-wrap">${boardHtml}</div>${extraHtml}</section>
        <aside class="game-side"><div class="play-session-summary"><div class="side-stat"><label>${ui.paused?'Paused':'Time'}</label><div class="timer" data-timer>${formatTime(activeDuration(active))}</div></div><div class="side-stat play-progress"><label>Progress</label><strong>${esc(safeProgressLabel(active))}</strong></div></div>
          <p class="play-start-tip">${esc(PLAY_GUIDES[g.id][0])}</p><button class="small-button" data-game-rules>Full rules</button><button class="small-button" data-game-favorite aria-pressed="${favorite}">${favorite?'★ Favorite':'☆ Favorite'}</button>
          <p class="play-save-note">${state.settings.playMode==='challenge'?'Challenge mode':'Relaxed mode'} · Autosaved locally</p>
        </aside>
        ${ui.paused?'<div class="pause-cover" role="region" aria-label="Puzzle paused"><strong>Take your time.</strong><p>The clock is paused and your progress is saved.</p><button class="primary-button" data-resume-puzzle>Resume puzzle</button></div>':''}
      </div></div>`;
  }
  function bindGameShell(game,active){
    $('[data-game-back]').onclick=()=>go('home');$('[data-game-menu]').onclick=()=>gameMenu(game,active);
    $$('[data-game-rules]').forEach(b=>b.onclick=()=>showRules(game));
    $('[data-game-hint]').onclick=()=>requestGameHint(game,active);
    $('[data-game-favorite]').onclick=()=>{toggleFavorite(game.id);const b=$('[data-game-favorite]');if(b){const on=state.favorites.includes(game.id);b.textContent=on?'★ Favorite':'☆ Favorite';b.setAttribute('aria-pressed',String(on));}};
    $('[data-play-difficulty]').onchange=e=>newGame(game.id,e.target.value);
    $('[data-play-guide]').onclick=()=>{playSession(active).guide=!playSession(active).guide;game.render(active);$('[data-play-guide]')?.focus({preventScroll:true});};
    $('[data-game-pause]').onclick=()=>pauseGame(game,active);const resume=$('[data-resume-puzzle]');if(resume)resume.onclick=()=>pauseGame(game,active);
    const undo=$('[data-play-undo]'),redo=$('[data-play-redo]');if(undo)undo.onclick=()=>game.undo(active);if(redo)redo.onclick=()=>redoGame(game,active);
    const dismiss=$('[data-hint-dismiss]');if(dismiss)dismiss.onclick=()=>dismissGameHint(active);
    startTimer(active);
  }

  function gameMenu(game, active){
    const difficulties=game.difficulties||['Standard'];
    showModal(game.name, `<p>${esc(game.description)}</p><p class="subtle">Difficulty</p><div class="segmented">${difficulties.map(d=>`<button data-diff="${esc(d)}" class="${active.difficulty===d?'is-active':''}">${esc(d)}</button>`).join('')}</div>`, [
      {label:'Close',kind:'secondary',action:closeOverlay},
      {label:'New Puzzle',kind:'primary',action:async()=>{ closeOverlay(); await newGame(game.id, active.difficulty); }},
    ]);
    $$('[data-diff]',overlayRoot).forEach(b=>b.onclick=async()=>{const d=b.dataset.diff;closeOverlay();await newGame(game.id,d);});
  }

  function showRules(game){
    showModal(`${game.name} — Rules`, `<p>${esc(game.rules.objective)}</p><ol class="rule-list">${game.rules.items.map(x=>`<li>${esc(x)}</li>`).join('')}</ol>`);
  }

  async function newGame(id,difficulty){
    const game=GAMES[id]; if(!game)return;
    rememberDifficulty(game,difficulty);routeToGame(id,seedString(),normalizeDifficulty(game,difficulty));
  }

  function boundedSaveData(value) {
    let nodes=0;
    function valid(v,depth) {
      if(++nodes>100000||depth>16)return false;
      if(v==null||typeof v==='boolean')return true;
      if(typeof v==='number')return Number.isFinite(v);
      if(typeof v==='string')return v.length<=4000&&!/[<>]/.test(v);
      if(typeof v!=='object')return false;
      if(Array.isArray(v))return v.length<=5000&&v.every(x=>valid(x,depth+1));
      const keys=Object.keys(v);
      return keys.length<=5000&&keys.every(k=>!['__proto__','constructor','prototype'].includes(k)&&(k.startsWith('_proofHint')||valid(v[k],depth+1)));
    }
    return valid(value,0);
  }
  function repairSavedActive(game,raw,fresh) {
    const p=fresh.puzzle,initial=fresh.state,source=raw.state;
    const integer=(v,min,max)=>Number.isInteger(v)&&v>=min&&v<=max;
    const arr=(v,n,check)=>Array.isArray(v)&&(n==null||v.length===n)&&v.every(check);
    const index=(v,n)=>integer(v,0,n-1);
    const unique=v=>new Set(v).size===v.length;
    const alpha=v=>typeof v==='string'&&/^[A-Z]*$/.test(v);
    const n=p.cols||p.n||p.size||9,N=initial.board?.length||initial.cells?.length||initial.rotations?.length||initial.partner?.length||p.rows*p.cols||n*n;
    if(game.id==='mines'&&raw.puzzle.mines!=null) {
      const m=raw.puzzle.mines,nums=raw.puzzle.nums,total=p.rows*p.cols;
      if(!arr(m,total,v=>typeof v==='boolean')||m.filter(Boolean).length!==p.count||!arr(nums,total,v=>integer(v,0,8))||nums.some((v,i)=>v!==(m[i]?0:mineNeighborsRaw(i,p.rows,p.cols).filter(j=>m[j]).length)))return null;
      p.mines=[...m];p.nums=[...nums];p.logicalCertified=raw.puzzle.logicalCertified===true;
      if(Number.isFinite(raw.puzzle.difficultyScore))p.difficultyScore=raw.puzzle.difficultyScore;
      if(boundedSaveData(raw.puzzle.difficultyMetrics))p.difficultyMetrics=raw.puzzle.difficultyMetrics;
    }
    const boardValue=v=>game.id==='lights-out'?(typeof v==='boolean'||v===0||v===1):game.id==='mini-crossword'?typeof v==='string'&&/^(#|[A-Z]?)$/.test(v):
      game.id==='binary'?v===null||v===0||v===1:
      game.id==='sliding-tiles'?integer(v,0,N-1):
      v===null||integer(v,0,game.id==='fillomino'?p.maxValue:['unequal','arithmetic-cages','towers'].includes(game.id)?p.n:game.id==='lights-out'?1:9);
    const rect=v=>v&&['r','c','h','w'].every(k=>Number.isInteger(v[k]))&&v.r>=0&&v.c>=0&&v.h>0&&v.w>0&&v.r+v.h<=n&&v.c+v.w<=n;
    const position=v=>v&&Number.isFinite(v.x)&&Number.isFinite(v.y)&&v.x>=0&&v.x<=1&&v.y>=0&&v.y<=1;
    const fraction=v=>v&&Number.isSafeInteger(v.n)&&Number.isSafeInteger(v.d)&&v.d>0&&typeof v.id==='string'&&/^[A-Za-z0-9-]+$/.test(v.id)&&typeof v.label==='string'&&/^[0-9()+×÷*/. −-]+$/.test(v.label);
    const allowedWords=p.answers||p.words||[];
    const wordArray=v=>arr(v,null,w=>alpha(w)&&(allowedWords.includes(w)||(game.id==='letter-hive'&&w.length>=4&&isAcceptedWord(w)&&w.includes(p.center)&&wordUsesOnlyLetters(w,p.letters))||(game.id==='word-grid'&&w.length>=3&&isAcceptedWord(w)&&isWordOnGrid(w,p.grid,p.n))))&&unique(v);
    const selectedArray=v=>game.id==='groups'?arr(v,null,x=>p.tiles.some(t=>t.id===x))&&unique(v)&&v.length<=4:
      arr(v,null,i=>index(i,(p.letters||p.pieces||[]).length))&&unique(v);
    const stateChecks={
      board:v=>arr(v,initial.board.length,boardValue)&&(!(game.id==='sliding-tiles')||unique(v)),
      cells:v=>arr(v,initial.cells.length,x=>integer(x,0,2)),
      h:v=>arr(v,initial.h.length,x=>integer(x,0,2)),v:v=>arr(v,initial.v.length,x=>integer(x,0,2)),
      counts:v=>arr(v,initial.counts.length,x=>integer(x,0,2)),
      rotations:v=>arr(v,initial.rotations.length,x=>integer(x,0,3)),
      partner:v=>arr(v,initial.partner.length,x=>integer(x,-1,N-1))&&v.every((j,i)=>j===-1||(j!==i&&v[j]===i&&Math.abs(Math.floor(j/n)-Math.floor(i/n))+Math.abs(j%n-i%n)===1)),
      revealed:v=>arr(v,initial.revealed.length,x=>typeof x==='boolean'),flags:v=>arr(v,initial.flags.length,x=>typeof x==='boolean'),
      positions:v=>arr(v,initial.positions.length,position),
      notes:v=>arr(v,81,row=>arr(row,null,x=>integer(x,1,9))&&unique(row)),
      noteMode:v=>typeof v==='boolean',tool:v=>v===1||v===2,
      direction:v=>['across','down'].includes(v),status:v=>['playing','won','lost'].includes(v),
      current:v=>alpha(v)&&v.length<=(game.id==='five-letters'?5:50),input:v=>typeof v==='string'&&/^[A-Za-z]*$/.test(v)&&v.length<=(p.length||20),
      found:wordArray,
      solved:v=>arr(v,null,x=>p.groups.some(g=>g.id===x))&&unique(v),
      chain:v=>arr(v,null,x=>typeof x==='string'&&/^[a-z]+$/.test(x)&&x.length===p.length&&(isAcceptedWord(x)||x===p.start))&&v.length>0&&unique(v)&&v[0]===p.start&&v.every((x,i)=>i===0||oneLetterDiff(v[i-1],x)),
      path:v=>arr(v,null,i=>index(i,n*n))&&unique(v)&&v.length<=n*n&&v.every((i,k)=>k===0||((game.id==='number-path'?Math.abs(Math.floor(i/n)-Math.floor(v[k-1]/n))+Math.abs(i%n-v[k-1]%n):Math.max(Math.abs(Math.floor(i/n)-Math.floor(v[k-1]/n)),Math.abs(i%n-v[k-1]%n)))===1))&&(game.id!=='number-path'||v[0]===p.start),
      rects:v=>arr(v,null,rect)&&v.length<=n*n,
      mapping:v=>v&&typeof v==='object'&&!Array.isArray(v)&&Object.entries(v).every(([k,x])=>/^[A-Z]$/.test(k)&&/^[A-Z]$/.test(x))&&unique(Object.values(v)),
      guesses:v=>arr(v,null,x=>x&&/^[A-Z]{5}$/.test(x.word)&&arr(x.states,5,k=>['correct','present','absent'].includes(k)))&&v.length<=6,
      keyStates:v=>v&&typeof v==='object'&&!Array.isArray(v)&&Object.entries(v).every(([k,x])=>/^[A-Z]$/.test(k)&&['correct','present','absent'].includes(x)),
      values:v=>arr(v,null,fraction)&&v.length>=1&&v.length<=4&&unique(v.map(x=>x.id)),
      op:v=>v===null||['+','-','×','÷'].includes(v),first:v=>v===null||typeof v==='string',
      selected:v=>Array.isArray(initial.selected)?selectedArray(v):typeof initial.selected==='string'?/^[A-Z]$/.test(v):integer(v,0,game.id==='untangle'?p.n-1:N-1),
      anchor:v=>v===null||integer(v,-1,N-1),start:v=>v===null||index(v,N),hover:v=>v===null||index(v,N),
      moves:v=>integer(v,0,1e9),mistakes:v=>integer(v,0,1e9),attempts:v=>integer(v,0,1e9),score:v=>integer(v,0,1e9),bestCrossings:v=>integer(v,0,1e9)
    };
    const repaired={};let changed=false,progressDamaged=false;
    for(const [key,fallback] of Object.entries(initial)) {
      if(key==='history')continue;
      const value=source[key],check=stateChecks[key];
      if(check&&check(value))repaired[key]=structuredClone(value);
      else {repaired[key]=structuredClone(fallback);changed=true;if(['board','cells','h','v','counts','partner','rotations','revealed','positions','rects','path','values','chain','guesses','found','solved','mapping'].includes(key))progressDamaged=true;}
    }
    const tupleHistory=h=>{
      if(['lights-out','sliding-tiles'].includes(game.id))return index(h,N);
      if(!Array.isArray(h))return false;
      if(game.id==='loop')return h.length===3&&['h','v'].includes(h[0])&&index(h[1],initial[h[0]].length)&&integer(h[2],0,2);
      if(game.id==='cryptogram')return h.length===2&&/^[A-Z]$/.test(h[0])&&(h[1]===null||/^[A-Z]$/.test(h[1]));
      if(game.id==='untangle')return h.length===2&&index(h[0],p.n)&&position(h[1]);
      if(['nonogram','number-path','rectangles','dominoes'].includes(game.id)){const key={nonogram:'cells','number-path':'path',rectangles:'rects',dominoes:'partner'}[game.id];return stateChecks[key](h);}
      if(['anagrams'].includes(game.id))return selectedArray(h);
      if(h.length!==2||!index(h[0],N))return false;
      return 'board' in initial?boardValue(h[1]):integer(h[1],0,game.id==='network'?3:2);
    };
    if('history' in initial) {
      const history=source.history;
      const check=game.id==='sudoku'?h=>h&&stateChecks.board(h.board)&&stateChecks.notes(h.notes):game.id==='make-24'?h=>h&&arr(h.values,null,fraction)&&typeof h.text==='string':tupleHistory;
      repaired.history=arr(history,null,check)&&history.length<=2000?structuredClone(history):[];
      if(!repaired.history.length&&history?.length)changed=true;
    }
    if(repaired.board){
      if(p.givens)p.givens.forEach((v,i)=>{if(v!=null&&(game.id==='binary'||v!==0))repaired.board[i]=v;});
      if(game.id==='mini-crossword')p.grid.forEach((v,i)=>{if(v==='#')repaired.board[i]='#';else if(repaired.board[i]==='#')repaired.board[i]='';});
      if(game.id==='kakuro')p.white.forEach((v,i)=>{if(!v)repaired.board[i]=initial.board[i];});
    }
    if(game.id==='islands')Object.keys(p.clues).forEach(k=>repaired.cells[+k]=2);
    if(game.id==='letter-hive')repaired.score=repaired.found.reduce((sum,w)=>sum+game.points(w),0);
    if(game.id==='make-24'&&!repaired.values.some(v=>v.id===repaired.first))repaired.first=null;
    if(game.id==='mines'&&!p.mines&&(repaired.revealed.some(Boolean)||raw.completed))return null;
    const out={...fresh,state:repaired,startedAt:null};
    if(Number.isInteger(raw.hintsUsed)&&raw.hintsUsed>=0&&raw.hintsUsed<=100000)out.hintsUsed=raw.hintsUsed;
    if(game.id==='groups'&&Array.isArray(raw.triedGroups))out.triedGroups=raw.triedGroups.filter(x=>typeof x==='string'&&x.length<=500).slice(-200);
    for(const key of ['createdAt','updatedAt','elapsedMs','durationMs'])if(Number.isFinite(raw[key])&&raw[key]>=0)out[key]=raw[key];
    if(raw.completed===true&&!progressDamaged){out.completed=true;out.outcome=raw.outcome==='failed'?'failed':'completed';out.durationMs=out.durationMs||out.elapsedMs||0;if(sanitizeHistory([raw.result]).length&&raw.result.gameId===game.id&&raw.result.difficulty===fresh.difficulty&&raw.result.puzzleIdentity===`${game.id}:${fresh.difficulty}:${fresh.seed}`)out.result=raw.result;}
    if(changed)out._recoveredFields=true;
    return out;
  }
  function activeRecordLooksUsable(game,active){
    return !!(active && typeof active==='object' && active.gameId===game.id && sanitizeSharedSeed(active.seed)===active.seed &&
      typeof active.difficulty==='string' && normalizeDifficulty(game,active.difficulty)===active.difficulty &&
      active.puzzle && typeof active.puzzle==='object' && active.state && typeof active.state==='object' && boundedSaveData(active));
  }
  async function getOrCreateActive(game, params, ticket=null){
    const rawSeed=params.get('seed'), rawDiff=params.get('difficulty');
    const requestedSeed=sanitizeSharedSeed(rawSeed), requestedDiff=normalizeDifficulty(game,rawDiff||state.settings.difficulties?.[game.id]);
    if((rawSeed&&!requestedSeed)||(rawDiff&&requestedDiff!==rawDiff)) setTimeout(()=>{if(routeIsCurrent(ticket))toast('Ignored invalid shared-puzzle parameters.');},0);
    let active=newestActive(await db.get('active',game.id),readCheckpoint(game.id));
    if(!routeIsCurrent(ticket))return null;
    const damaged=active&&!activeRecordLooksUsable(game,active);
    const outdated=active&&game.generatorVersion&&active.puzzle?.generatorVersion!==game.generatorVersion;
    const different=active&&((requestedSeed&&active.seed!==requestedSeed)||(rawDiff&&active.difficulty!==requestedDiff));
    if(!active||damaged||outdated||different){
      const seed=requestedSeed||sanitizeSharedSeed(active?.seed)||seedString();
      const difficulty=rawDiff?requestedDiff:normalizeDifficulty(game,active?.difficulty||requestedDiff);
      active=await game.create(seed,difficulty); active.startedAt=null;
      if(!routeIsCurrent(ticket))return null;
      await saveActive(active);
      if(damaged&&routeIsCurrent(ticket))toast('Recovered a damaged saved puzzle; other progress was kept.');
    }
    else {
      const fresh=await game.create(active.seed,active.difficulty);fresh.startedAt=null;
      if(!routeIsCurrent(ticket))return null;
      const repaired=repairSavedActive(game,active,fresh);
      active=repaired||fresh;
      if(!repaired||active._recoveredFields){delete active._recoveredFields;toast('Repaired damaged save fields; valid progress in other games was kept.');}
      await saveActive(active);
    }
    if(!routeIsCurrent(ticket))return null;
    if(active.completed&&active.result&&sanitizeHistory([active.result]).length)await db.put('history',active.result);
    return routeIsCurrent(ticket)?active:null;
  }

  function resultPanel(active, game, metricsHtml=''){
    return `<div class="result-panel" role="region" aria-label="Puzzle result"><h2>${active.outcome==='failed'||active.state.status==='lost'?'Puzzle ended':'Solved'}</h2><div class="result-metrics"><div><strong>${formatTime(active.durationMs||0)}</strong><span>Time</span></div>${metricsHtml}<div><strong>${active.hintsUsed||0}</strong><span>Hint steps</span></div></div><p class="result-next-copy">${active.outcome==='failed'?'A fresh puzzle is ready when you are.':active.hintsUsed?'Solved with assistance. Try the next puzzle using what you learned.':'Puzzle complete. Keep this difficulty or choose a different challenge.'}</p><div class="result-actions"><button class="primary-button" data-next-puzzle>Next Puzzle</button><button class="secondary-button" data-share-puzzle>Share</button><button class="secondary-button" data-replay-puzzle>Replay</button></div></div>`;
  }
  function bindResult(active, game){
    const next=$('[data-next-puzzle]'); if(next) next.onclick=()=>newGame(game.id,active.difficulty);
    const replay=$('[data-replay-puzzle]'); if(replay) replay.onclick=async()=>{
      if(replayingActives.has(active))return;
      replayingActives.add(active); replay.disabled=true;
      const ticket=routeGeneration;
      try {
        const fresh=await game.create(active.seed,active.difficulty); fresh.startedAt=null;
        if(!routeIsCurrent(ticket)||state.currentActive!==active)return;
        retiredActives.add(active); state.currentActive=fresh;
        await saveActive(fresh);
        if(!routeIsCurrent(ticket)||state.currentActive!==fresh)return;
        fresh.startedAt=document.hidden?null:Date.now();game.render(fresh);
      } finally { replayingActives.delete(active); }
    };
    const share=$('[data-share-puzzle]'); if(share) share.onclick=()=>sharePuzzle(active,game);
  }
  async function copyTextFallback(text){
    if(navigator.clipboard?.writeText){try{await navigator.clipboard.writeText(text);return true;}catch{}}
    const el=document.createElement('textarea');el.value=text;el.setAttribute('readonly','');el.style.position='fixed';el.style.opacity='0';document.body.appendChild(el);el.select();
    let ok=false;try{ok=document.execCommand('copy');}catch{}el.remove();return ok;
  }
  async function sharePuzzle(active,game){
    const url=new URL(location.href); url.hash=`#/game/${game.id}?seed=${encodeURIComponent(active.seed)}&difficulty=${encodeURIComponent(active.difficulty)}`;
    try {
      if(navigator.share) await navigator.share({title:`${game.name} puzzle`,text:`Play this ${game.name} puzzle`,url:url.toString()});
      else if(await copyTextFallback(url.toString())) toast('Puzzle link copied');
      else toast('Could not copy this puzzle link');
    } catch(e){ if(e?.name!=='AbortError') toast('Could not share this puzzle'); }
  }

  // ---------- Five Letters ----------
  // ---------- Wave 3: measured difficulty calibration ----------
  let fiveLetterPoolsCache=null;
  function fiveLetterProfile(word){
    const freq={};let total=0;for(const w of WORDS)if(w.length===5)for(const c of w.toUpperCase()){freq[c]=(freq[c]||0)+1;total++;}
    const W=word.toUpperCase(),unique=new Set(W).size,repeats=5-unique,rare=[...W].filter(c=>'JQXZVKWY'.includes(c)).length,vowels=[...W].filter(c=>'AEIOU'.includes(c)).length;
    const rarity=[...W].reduce((sum,c)=>sum+-Math.log((freq[c]||1)/total),0)/5;
    const score=rarity*2.35+repeats*2.4+rare*1.15+(vowels===0||vowels>=4?1.25:0)+(new Set(W).size===5?0:.35);
    return {score,rarity,repeats,rare,vowels};
  }
  function fiveLetterPools(){
    if(fiveLetterPoolsCache)return fiveLetterPoolsCache;
    const entries=WORDS.filter(w=>w.length===5).map(word=>({word,profile:fiveLetterProfile(word)})).sort((a,b)=>a.profile.score-b.profile.score),n=entries.length;let a=Math.floor(n/3),b=Math.floor(2*n/3);while(a<n&&entries[a-1]?.profile.score===entries[a]?.profile.score)a++;while(b<n&&entries[b-1]?.profile.score===entries[b]?.profile.score)b++;
    return fiveLetterPoolsCache={Easy:entries.slice(0,a),Medium:entries.slice(a,b),Hard:entries.slice(b)};
  }
  const fiveLetters = {
    id:'five-letters', name:'Five Letters', generatorVersion:3, description:byId['five-letters'].description,
    defaultDifficulty:'Medium', difficulties:['Easy','Medium','Hard'],
    rules:{objective:'Guess the hidden five-letter word in six attempts.',items:['Each guess must be a valid five-letter English word from the broad accepted-word dictionary.','Puzzle answers stay in a curated familiar-word pool even though many more guesses are accepted.','A solid tile means the letter is correct and in the correct position.','A marked tile means the letter is in the word but belongs elsewhere.','A muted tile means that copy of the letter is not in the answer.']},
    async create(seed,difficulty='Medium'){
      const r=rng(`${seed}:five-letters:v3`), entry=pick(fiveLetterPools()[difficulty]||fiveLetterPools().Medium,r), answer=entry.word.toUpperCase(),m=entry.profile;
      return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle:{answer,difficultyScore:+m.score.toFixed(3),difficultyMetrics:{rarity:+m.rarity.toFixed(3),repeatedLetters:m.repeats,rareLetters:m.rare,vowels:m.vowels},generatorVersion:3},state:{guesses:[],current:'',keyStates:{},status:'playing'}};
    },
    async save(a){return saveActive(a);},
    evaluateGuess(answer,guess){
      const res=Array(5).fill('absent'), counts={};
      for(let i=0;i<5;i++){ if(answer[i]===guess[i]) res[i]='correct'; else counts[answer[i]]=(counts[answer[i]]||0)+1; }
      for(let i=0;i<5;i++){ if(res[i]==='correct')continue; const c=guess[i]; if(counts[c]>0){res[i]='present';counts[c]--;} }
      return res;
    },
    render(a){
      const rows=[...a.state.guesses.map(g=>({word:g.word,states:g.states}))];
      if(a.state.status==='playing') rows.push({word:a.state.current,states:[]}); while(rows.length<6)rows.push({word:'',states:[]});
      const board=`<div class="wordle-wrap"><div class="wordle-board">${rows.slice(0,6).map(row=>`<div class="wordle-row">${Array.from({length:5},(_,i)=>`<div class="wordle-tile ${row.states[i]||''}">${row.word[i]||''}</div>`).join('')}</div>`).join('')}</div>${letterKeyboard(a.state.keyStates)}</div>`;
      const result=a.completed?resultPanel(a,this,`<div><strong>${a.state.guesses.length}</strong><span>Guesses</span></div>`):'';
      main.innerHTML=baseGameShell(byId[this.id],a,board,`${result}`); bindGameShell(this,a); this.bind(a); if(a.completed)bindResult(a,this);
    },
    bind(a){
      $$('.key').forEach(k=>k.onclick=()=>this.key(a,k.dataset.key));
      const h=e=>{if(!state.currentGame||state.currentGame.id!==this.id||a.completed||overlayRoot.innerHTML)return; const k=e.key.toUpperCase(); if(/^[A-Z]$/.test(k)||k==='ENTER'||k==='BACKSPACE'){e.preventDefault();this.key(a,k)}};
      window.onkeydown=h;
    },
    async key(a,key){
      if(a.state.status!=='playing')return;
      if(key==='BACKSPACE'){a.state.current=a.state.current.slice(0,-1);}
      else if(key==='ENTER'){
        if(a.state.current.length!==5){toast('Enter five letters');return;}
        const word=a.state.current.toLowerCase(); if(!isAcceptedWord(word)){toast('Not in the accepted English dictionary');return;}
        const guess=a.state.current,states=this.evaluateGuess(a.puzzle.answer,guess);a.state.guesses.push({word:guess,states});a.state.current='';
        const rank={absent:1,present:2,correct:3}; states.forEach((s,i)=>{const c=guess[i];if(!a.state.keyStates[c]||rank[s]>rank[a.state.keyStates[c]])a.state.keyStates[c]=s});
        if(guess===a.puzzle.answer){a.state.status='won';await finishActive(a,{guesses:a.state.guesses.length});}
        else if(a.state.guesses.length>=6){a.state.status='lost';await finishActive(a,{guesses:6},'failed');toast(`Answer: ${a.puzzle.answer}`);}
      } else if(/^[A-Z]$/.test(key)&&a.state.current.length<5){a.state.current+=key;}
      await saveActive(a); this.render(a);
    },
    hint(a){
      if(a.completed)return;
      const known=new Set(a.state.guesses.flatMap(g=>g.word.split(''))); const options=a.puzzle.answer.split('').map((c,i)=>({c,i})).filter(x=>!known.has(x.c));
      if(!options.length){toast('You have already seen every answer letter.');return;}
      const h=pick(options); toast(`Hint: the word contains ${h.c}.`);
    }
  };
  function letterKeyboard(states){
    const rows=['QWERTYUIOP','ASDFGHJKL','ZXCVBNM'];
    return `<div class="letter-keyboard">${rows.map((r,i)=>`<div class="key-row">${i===2?'<button class="key wide" data-key="ENTER">Enter</button>':''}${r.split('').map(c=>`<button class="key ${states[c]||''}" data-key="${c}">${c}</button>`).join('')}${i===2?'<button class="key wide" data-key="BACKSPACE">⌫</button>':''}</div>`).join('')}</div>`;
  }

  // ---------- Wave 2: proof-based progressive hints ----------
  function hintStateFingerprint(a){const s=a.state||{};return JSON.stringify([s.board||null,s.cells||null,s.counts||null,s.partner||null,s.h||null,s.v||null,s.path||null,s.rects||null,s.guesses||null,s.current||null,s.found||null,s.solved||null,s.chain||null,s.mapping||null,s.rotations||null,s.values||null,s.positions||null,s.revealed||null,s.flags||null]);}
  function deliverProofHint(a,d){
    if(!d){toast('Hint: no forced deduction was found from the current state. Check for contradictions, then inspect the most constrained area.');return 0;}
    const stateSig=hintStateFingerprint(a),sig=`${d.token||d.reveal}|${stateSig}`,prev=a.state._proofHint,level=prev&&prev.sig===sig?Math.min(3,(prev.level||0)+1):0;
    const labels=['Focus','Rule','Deduction','Reveal'],stages=[d.focus,d.rule,d.deduction,d.reveal];a.state._proofHint={sig,stateSig,level};a.state._proofHintView={level,labels,stages};a.state.hintRequests=(a.state.hintRequests||0)+1;if(level===3&&(!prev||prev.level!==3))a.state.hintReveals=(a.state.hintReveals||0)+1;if(Number.isInteger(d.index)&&'selected' in a.state)a.state.selected=d.index;
    refreshProofHintPanel(a);toast(`Hint ${level+1}/4 · ${labels[level]}`);saveActive(a).catch(()=>{});return level;
  }
  function coord(i,n){return `row ${Math.floor(i/n)+1}, column ${i%n+1}`;}
  function lineHasDuplicate(vals){const seen=new Set();for(const v of vals)if(v){if(seen.has(v))return v;seen.add(v)}return null;}
  function sudokuStateValid(board){if(!Array.isArray(board)||board.length!==81||!board.every(v=>Number.isInteger(v)&&v>=0&&v<=9))return false;for(let r=0;r<9;r++)if(lineHasDuplicate(board.slice(r*9,r*9+9)))return false;for(let c=0;c<9;c++)if(lineHasDuplicate(Array.from({length:9},(_,r)=>board[r*9+c])))return false;for(let br=0;br<3;br++)for(let bc=0;bc<3;bc++){const vals=[];for(let r=0;r<3;r++)for(let c=0;c<3;c++)vals.push(board[(br*3+r)*9+bc*3+c]);if(lineHasDuplicate(vals))return false;}return true;}
  function sudokuCandidates(board,i){if(board[i])return [board[i]];const r=Math.floor(i/9),c=i%9,used=new Set();for(let k=0;k<9;k++){if(board[r*9+k])used.add(board[r*9+k]);if(board[k*9+c])used.add(board[k*9+c]);}const br=Math.floor(r/3)*3,bc=Math.floor(c/3)*3;for(let rr=0;rr<3;rr++)for(let cc=0;cc<3;cc++)if(board[(br+rr)*9+bc+cc])used.add(board[(br+rr)*9+bc+cc]);return [1,2,3,4,5,6,7,8,9].filter(v=>!used.has(v));}
  function sudokuHasCompletion(board){return sudokuStateValid(board)&&countSudokuSolutions([...board],1)>0;}
  function sudokuProof(a){const b=a.state.board,g=a.puzzle.givens;
    if(!sudokuStateValid(b)){for(let i=0;i<81;i++)if(b[i]&&!g[i]){const t=[...b];t[i]=0;if(sudokuHasCompletion(t))return {token:`sdk-bad-${i}`,index:i,focus:`Inspect ${coord(i,9)}.`,rule:'Every row, column, and 3×3 box must contain each digit at most once.',deduction:`The current ${b[i]} prevents any valid completion, while clearing this entry restores at least one completion.`,reveal:`Reconsider the ${b[i]} in ${coord(i,9)}.`};}}
    for(let i=0;i<81;i++)if(!b[i]){const opts=sudokuCandidates(b,i);if(opts.length===1)return {token:`sdk-naked-${i}-${opts[0]}`,index:i,focus:`Look at ${coord(i,9)}.`,rule:'A cell may use only digits missing from its row, column, and box.',deduction:`All candidates except ${opts[0]} are already excluded by those three units.`,reveal:`${coord(i,9)} must be ${opts[0]}.`};}
    const units=[];for(let r=0;r<9;r++)units.push({name:`row ${r+1}`,cells:Array.from({length:9},(_,c)=>r*9+c)});for(let c=0;c<9;c++)units.push({name:`column ${c+1}`,cells:Array.from({length:9},(_,r)=>r*9+c)});for(let br=0;br<3;br++)for(let bc=0;bc<3;bc++)units.push({name:`box ${br*3+bc+1}`,cells:Array.from({length:9},(_,k)=>(br*3+Math.floor(k/3))*9+bc*3+k%3)});
    for(const u of units)for(let v=1;v<=9;v++){if(u.cells.some(i=>b[i]===v))continue;const spots=u.cells.filter(i=>!b[i]&&sudokuCandidates(b,i).includes(v));if(spots.length===1){const i=spots[0];return {token:`sdk-hidden-${i}-${v}`,index:i,focus:`Inspect ${u.name}.`,rule:`Digit ${v} must appear exactly once in ${u.name}.`,deduction:`Every other empty cell in ${u.name} excludes ${v}, leaving only ${coord(i,9)}.`,reveal:`Place ${v} in ${coord(i,9)}.`};}}
    for(let i=0;i<81;i++)if(!b[i]){const opts=sudokuCandidates(b,i),viable=opts.filter(v=>{const t=[...b];t[i]=v;return sudokuHasCompletion(t)});if(viable.length===1)return {token:`sdk-proof-${i}-${viable[0]}`,index:i,focus:`Test the candidates in ${coord(i,9)}.`,rule:'A candidate is impossible if it makes the puzzle inconsistent with all Sudoku constraints.',deduction:`Every candidate except ${viable[0]} leads to a contradiction under exact completion checking.`,reveal:`${coord(i,9)} must be ${viable[0]}.`};}
    return null;
  }
  function killerCageFeasible(p,b,cageIndex){const cage=p.cages[cageIndex],vals=cage.cells.map(i=>b[i]).filter(Boolean);if(new Set(vals).size!==vals.length)return false;const sum=vals.reduce((x,y)=>x+y,0),rem=cage.cells.length-vals.length;if(sum>cage.sum)return false;if(!rem)return sum===cage.sum;const avail=[1,2,3,4,5,6,7,8,9].filter(v=>!vals.includes(v));if(avail.length<rem)return false;avail.sort((x,y)=>x-y);const min=avail.slice(0,rem).reduce((x,y)=>x+y,0),max=avail.slice(-rem).reduce((x,y)=>x+y,0);return sum+min<=cage.sum&&sum+max>=cage.sum;}
  function killerCandidates(p,b,i){if(b[i])return [b[i]];return sudokuCandidates(b,i).filter(v=>{const t=[...b];t[i]=v;return killerCageFeasible(p,t,p.cageOf[i]);});}
  function countKillerStateSolutions(p,b,limit=2){if(!sudokuStateValid(b))return 0;for(let ci=0;ci<p.cages.length;ci++)if(!killerCageFeasible(p,b,ci))return 0;const x=[...b];let count=0;function rec(){if(count>=limit)return;let bi=-1,opts=null;for(let i=0;i<81;i++)if(!x[i]){const o=killerCandidates(p,x,i);if(!o.length)return;if(!opts||o.length<opts.length){bi=i;opts=o;if(o.length===1)break;}}if(bi<0){count++;return;}for(const v of opts){x[bi]=v;rec();x[bi]=0;if(count>=limit)return;}}rec();return count;}
  function killerProof(a){const b=a.state.board,p=a.puzzle;if(countKillerStateSolutions(p,b,1)===0){for(let i=0;i<81;i++)if(b[i]&&!p.givens[i]){const t=[...b];t[i]=0;if(countKillerStateSolutions(p,t,1)>0)return {token:`killer-bad-${i}`,index:i,focus:`Recheck ${coord(i,9)}.`,rule:'Rows, columns, boxes, cage sums, and cage no-repeat constraints must all remain satisfiable.',deduction:`The current ${b[i]} leaves no complete solution, while clearing this entry restores one.`,reveal:`Reconsider the ${b[i]} in ${coord(i,9)}.`};}return {token:'killer-contradiction',focus:'Recheck your most recent entries.',rule:'Every entry must preserve both Sudoku and cage constraints.',deduction:'The current position has no valid completion.',reveal:'Undo a recent entry before asking for a forward deduction.'};}for(let i=0;i<81;i++)if(!b[i]){const o=killerCandidates(p,b,i);if(o.length===1){const cage=p.cages[p.cageOf[i]];return {token:`killer-${i}-${o[0]}`,index:i,focus:`Inspect ${coord(i,9)} and its ${cage.sum}-sum cage.`,rule:'The cell must satisfy its row, column, box, cage sum, and no-repeat cage constraint.',deduction:`Those constraints leave only ${o[0]} as a legal candidate.`,reveal:`Place ${o[0]} in ${coord(i,9)}.`};}}
    for(let i=0;i<81;i++)if(!b[i]){const o=killerCandidates(p,b,i),v=o.filter(x=>{const t=[...b];t[i]=x;return countKillerStateSolutions(p,t,1)>0});if(v.length===1){const cage=p.cages[p.cageOf[i]];return {token:`killer-exact-${i}-${v[0]}`,index:i,focus:`Focus on ${coord(i,9)} in the ${cage.sum}-sum cage.`,rule:'A candidate must permit a complete Sudoku that also satisfies every cage.',deduction:`Exact constraint checking rejects every candidate here except ${v[0]}.`,reveal:`${coord(i,9)} must be ${v[0]}.`};}}return null;}
  function kakuroRunFeasible(vals,target){const fixed=vals.filter(Boolean);if(new Set(fixed).size!==fixed.length)return false;const sum=fixed.reduce((a,b)=>a+b,0),rem=vals.filter(v=>!v).length;if(sum>target)return false;if(!rem)return sum===target;const avail=[1,2,3,4,5,6,7,8,9].filter(v=>!fixed.includes(v));if(avail.length<rem)return false;avail.sort((a,b)=>a-b);return sum+avail.slice(0,rem).reduce((a,b)=>a+b,0)<=target&&sum+avail.slice(-rem).reduce((a,b)=>a+b,0)>=target;}
  function kakuroCandidates(a,i){const b=a.state.board,r=Math.floor(i/3),c=i%3;if(b[i])return [b[i]];const out=[];for(let v=1;v<=9;v++){const t=[...b];t[i]=v;if(kakuroRunFeasible(t.slice(r*3,r*3+3),a.puzzle.rowSums[r])&&kakuroRunFeasible([t[c],t[3+c],t[6+c]],a.puzzle.colSums[c]))out.push(v);}return out;}
  function countKakuroStateSolutions(a,board,limit=2){const old=a.state.board,a2={...a,state:{...a.state,board:[...board]}},b=a2.state.board;let count=0;function rec(){if(count>=limit)return;let bi=-1,opts=null;for(let i=0;i<9;i++)if(!b[i]){const o=kakuroCandidates(a2,i);if(!o.length)return;if(!opts||o.length<opts.length){bi=i;opts=o;}}if(bi<0){if(kakuroValid(b,a.puzzle.rowSums,a.puzzle.colSums))count++;return;}for(const v of opts){b[bi]=v;rec();b[bi]=0;if(count>=limit)return;}}rec();a.state.board=old;return count;}
  function kakuroProof(a){if(countKakuroStateSolutions(a,a.state.board,1)===0){for(let i=0;i<9;i++)if(a.state.board[i]){const t=[...a.state.board];t[i]=0;if(countKakuroStateSolutions(a,t,1)>0)return {token:`kak-bad-${i}`,index:i,focus:`Recheck ${coord(i,3)}.`,rule:'Each crossing run must use distinct digits and reach its exact sum.',deduction:`The current ${a.state.board[i]} makes at least one crossing run impossible; clearing it restores a completion.`,reveal:`Reconsider ${a.state.board[i]} in ${coord(i,3)}.`};}return {token:'kak-contradiction',focus:'Recheck your latest entries.',rule:'Every row and column run must remain completable to its printed sum without repeated digits.',deduction:'The current grid has no valid completion.',reveal:'Undo a recent entry before continuing.'};}for(let i=0;i<9;i++)if(!a.state.board[i]){const o=kakuroCandidates(a,i);if(o.length===1){const r=Math.floor(i/3),c=i%3;return {token:`kak-${i}-${o[0]}`,index:i,focus:`Inspect ${coord(i,3)} at the intersection of row sum ${a.puzzle.rowSums[r]} and column sum ${a.puzzle.colSums[c]}.`,rule:'Digits cannot repeat in either run, and both runs must reach their exact sums.',deduction:`Only ${o[0]} keeps both crossing runs feasible.`,reveal:`${coord(i,3)} must be ${o[0]}.`};}const viable=o.filter(v=>{const t=[...a.state.board];t[i]=v;return countKakuroStateSolutions(a,t,1)>0});if(viable.length===1){return {token:`kak-ex-${i}-${viable[0]}`,index:i,focus:`Test ${coord(i,3)} against both crossing sums.`,rule:'A candidate is valid only if all remaining runs can still be completed without repeats.',deduction:`All candidates except ${viable[0]} make at least one run impossible.`,reveal:`Use ${viable[0]} in ${coord(i,3)}.`};}}return null;}
  function binaryProof(a){const b=a.state.board,n=a.puzzle.size,half=n/2;if(countBinarySolutions(b,n,1)===0){for(let i=0;i<b.length;i++)if(b[i]!==null&&a.puzzle.givens[i]===null){const t=[...b];t[i]=null;if(countBinarySolutions(t,n,1)>0)return {token:`bin-bad-${i}`,index:i,focus:`Recheck ${coord(i,n)}.`,rule:'Balance, no-three-in-a-row, and row/column uniqueness must all remain satisfiable.',deduction:`The current ${b[i]} leaves no valid completion; clearing it restores one.`,reveal:`Reconsider the ${b[i]} at ${coord(i,n)}.`};}return {token:'bin-contradiction',focus:'Recheck the most recent entries.',rule:'Every partial row and column must still be extendable to a valid unique binary line.',deduction:'The current position has no complete solution.',reveal:'Undo a recent entry before requesting a forward hint.'};}for(let i=0;i<b.length;i++)if(b[i]===null){const r=Math.floor(i/n),c=i%n,row=b.slice(r*n,r*n+n),col=Array.from({length:n},(_,rr)=>b[rr*n+c]);for(const [name,line,pos] of [[`row ${r+1}`,row,c],[`column ${c+1}`,col,r]]){const z=line.filter(v=>v===0).length,o=line.filter(v=>v===1).length;if(z===half||o===half){const v=z===half?1:0;return {token:`bin-bal-${i}-${v}`,index:i,focus:`Inspect ${name}.`,rule:`Each completed line contains exactly ${half} zeros and ${half} ones.`,deduction:`${name} already contains all ${z===half?'zeros':'ones'} it may use, so every remaining blank must be ${v}.`,reveal:`Set ${coord(i,n)} to ${v}.`};}for(let k=Math.max(0,pos-2);k<=Math.min(n-3,pos);k++){const seg=line.slice(k,k+3);if(seg.filter(v=>v===null).length===1){const vals=seg.filter(v=>v!==null);if(vals.length===2&&vals[0]===vals[1]){const v=1-vals[0];return {token:`bin-trip-${i}-${v}`,index:i,focus:`Inspect the three-cell window in ${name} containing ${coord(i,n)}.`,rule:'Three identical values may never appear consecutively.',deduction:`The other two cells in this three-cell window are both ${vals[0]}, forcing the blank to the opposite value.`,reveal:`Set ${coord(i,n)} to ${v}.`};}}}}
      const viable=[0,1].filter(v=>{const t=[...b];t[i]=v;return !binaryViolation(t,n,i)&&countBinarySolutions(t,n,1)>0});if(viable.length===1)return {token:`bin-ex-${i}-${viable[0]}`,index:i,focus:`Test both values at ${coord(i,n)}.`,rule:'The choice must preserve balance, no triples, unique rows/columns, and at least one full completion.',deduction:`Only ${viable[0]} survives exact constraint checking.`,reveal:`Set ${coord(i,n)} to ${viable[0]}.`};}return null;}
  function countQueensStateSolutions(p,cells,limit=2,solutions=null){const n=p.size;if(!Array.isArray(cells)||cells.length!==n*n||!cells.every(v=>v===0||v===1||v===2))return 0;const forcedRow=Array(n).fill(-1);for(let i=0;i<cells.length;i++)if(cells[i]===2){const r=Math.floor(i/n),c=i%n;if(forcedRow[r]>=0&&forcedRow[r]!==c)return 0;forcedRow[r]=c;}let count=0;const cols=new Set(),regs=new Set(),placed=[];function rec(r){if(count>=limit)return;if(r===n){count++;if(solutions)solutions.push(placed.map(([,c])=>c));return;}const choices=forcedRow[r]>=0?[forcedRow[r]]:Array.from({length:n},(_,c)=>c).filter(c=>cells[r*n+c]!==1);for(const c of choices){const i=r*n+c,reg=p.regions[i];if(cols.has(c)||regs.has(reg))continue;let bad=false;for(const [rr,cc] of placed)if(Math.abs(rr-r)===1&&Math.abs(cc-c)===1){bad=true;break;}if(bad)continue;cols.add(c);regs.add(reg);placed.push([r,c]);rec(r+1);placed.pop();regs.delete(reg);cols.delete(c);if(count>=limit)return;}}rec(0);return count;}
  function queensProof(a){
    const p=a.puzzle,c=a.state.cells,n=p.size;
    if(countQueensStateSolutions(p,c,1)===0){
      for(let i=0;i<c.length;i++)if(c[i]){
        const t=[...c];t[i]=0;
        if(countQueensStateSolutions(p,t,1)>0)return {token:`q-bad-${i}`,index:i,focus:`Recheck ${coord(i,n)}.`,rule:'Rows, columns, regions and non-touching constraints must remain satisfiable.',deduction:'Clearing this mark restores at least one valid completion.',reveal:`Reconsider the ${c[i]===2?'queen':'X mark'} at ${coord(i,n)}.`};
      }
      return {token:'q-contradiction',focus:'Recheck your recent queens and X marks.',rule:'A forward deduction requires a board that still has a valid completion.',deduction:'This position has no valid completion, and clearing one mark is not enough.',reveal:'Undo multiple recent marks before asking for a forward hint.'};
    }
    for(let i=0;i<c.length;i++)if(c[i]===0){
      const t=[...c];t[i]=1;
      if(countQueensStateSolutions(p,t,1)===0)return {token:`q-force-${i}`,index:i,focus:`Inspect ${coord(i,n)} in region ${p.regions[i]+1}.`,rule:'Each row, column and region needs exactly one queen, and queens may not touch diagonally.',deduction:'Excluding this cell removes every valid completion.',reveal:`A queen is forced at ${coord(i,n)}.`};
    }
    return null;
  }
  function loopEdgeInfo(a,r,c){const w=a.puzzle.cols;return [{kind:'h',idx:r*w+c,name:'top'},{kind:'h',idx:(r+1)*w+c,name:'bottom'},{kind:'v',idx:r*(w+1)+c,name:'left'},{kind:'v',idx:r*(w+1)+c+1,name:'right'}];}
  function loopEdgeState(a,e){return a.state[e.kind][e.idx];}
  function loopProof(a){const {rows:h,cols:w,clues}=a.puzzle;for(let r=0;r<h;r++)for(let c=0;c<w;c++){const es=loopEdgeInfo(a,r,c),lines=es.filter(e=>loopEdgeState(a,e)===1),unknown=es.filter(e=>loopEdgeState(a,e)===0),clue=clues[r*w+c];if(lines.length>clue)return {token:`loop-over-${r}-${c}`,focus:`Inspect clue ${clue} at row ${r+1}, column ${c+1}.`,rule:`Exactly ${clue} of its four surrounding edges may be lines.`,deduction:`It already has ${lines.length} lines, so the current state is contradictory.`,reveal:'Remove at least one surrounding line before continuing.'};if(lines.length+unknown.length<clue)return {token:`loop-under-${r}-${c}`,focus:`Inspect clue ${clue} at row ${r+1}, column ${c+1}.`,rule:`Exactly ${clue} surrounding edges must remain possible.`,deduction:`Only ${lines.length+unknown.length} line-capable edges remain, so too many edges have been blocked.`,reveal:'Clear at least one surrounding × mark.'};if(unknown.length&&lines.length===clue){const e=unknown[0];return {token:`loop-x-${e.kind}-${e.idx}`,focus:`Inspect clue ${clue} at row ${r+1}, column ${c+1}.`,rule:`Once a clue already has all ${clue} required lines, every other surrounding edge must be blocked.`,deduction:`The clue is satisfied, so its remaining unknown ${e.name} edge cannot be part of the loop.`,reveal:`Mark the ${e.name} edge of row ${r+1}, column ${c+1} with ×.`};}if(unknown.length&&lines.length+unknown.length===clue){const e=unknown[0];return {token:`loop-line-${e.kind}-${e.idx}`,focus:`Inspect clue ${clue} at row ${r+1}, column ${c+1}.`,rule:`The clue needs exactly ${clue} lines.`,deduction:`There are ${lines.length} confirmed lines and exactly ${unknown.length} unknown edges left, so every unknown edge is required.`,reveal:`Draw the ${e.name} edge of row ${r+1}, column ${c+1}.`};}}return {token:'loop-global',focus:'Inspect vertices where one line enters but only one other edge remains undecided.',rule:'Every used loop vertex has degree exactly two, and the final loop must be one connected cycle.',deduction:'A vertex with one existing line and only one available continuation forces that continuation.',reveal:'Use vertex-degree logic before guessing; avoid closing a smaller loop early.'};}
  function bridgesProof(a){const p=a.puzzle,deg=bridgeDegrees(p,a.state.counts);for(let ni=0;ni<p.nodes.length;ni++){const rem=p.clues[ni]-deg[ni],inc=p.edges.map((e,i)=>e.a===ni||e.b===ni?i:-1).filter(i=>i>=0);if(rem<0){const N=p.nodes[ni];return {token:`br-over-${ni}`,focus:`Inspect the ${p.clues[ni]} island at (${N.r+1},${N.c+1}).`,rule:`An island must have exactly its printed number of bridges.`,deduction:`It currently has ${deg[ni]}, which is already too many.`,reveal:'Reduce one of the bridges touching this island.'};}const caps=inc.map(i=>{if(p.edges.some((_,j)=>a.state.counts[j]>0&&bridgeEdgesCross(p.nodes,p.edges[i],p.edges[j])))return [i,0];return [i,2-a.state.counts[i]];}).filter(x=>x[1]>0);const total=caps.reduce((s,x)=>s+x[1],0),N=p.nodes[ni];if(rem>total)return {token:`br-short-${ni}`,focus:`Inspect the ${p.clues[ni]} island at (${N.r+1},${N.c+1}).`,rule:'Its unmet degree must fit within the remaining non-crossing bridge capacity.',deduction:`It still needs ${rem} bridge units, but only ${total} capacity remains.`,reveal:'Reduce a conflicting bridge or restore capacity to this island.'};if(rem===0&&caps.length)return {token:`br-done-${ni}`,focus:`Inspect the ${p.clues[ni]} island at (${N.r+1},${N.c+1}).`,rule:'A satisfied island cannot receive any additional bridges.',deduction:`Its current degree is already exactly ${p.clues[ni]}.`,reveal:'Do not increase any remaining connection from this island.'};if(rem>0&&caps.length===1&&rem<=caps[0][1]){const ei=caps[0][0],e=p.edges[ei],O=p.nodes[e.a===ni?e.b:e.a],final=a.state.counts[ei]+rem;return {token:`br-one-${ni}-${ei}-${final}`,focus:`Inspect the ${p.clues[ni]} island at (${N.r+1},${N.c+1}).`,rule:'Its remaining bridge requirement must be supplied by visible non-crossing neighbors.',deduction:`Only the island at (${O.r+1},${O.c+1}) can still supply the remaining ${rem}.`,reveal:`Set that connection to ${final} bridge${final===1?'':'s'}.`};}if(rem>0&&total===rem&&caps.length){const [ei,cap]=caps[0],e=p.edges[ei],O=p.nodes[e.a===ni?e.b:e.a],final=a.state.counts[ei]+cap;return {token:`br-cap-${ni}-${ei}-${final}`,focus:`Inspect the remaining connections from the ${p.clues[ni]} island at (${N.r+1},${N.c+1}).`,rule:'The sum of all remaining connection capacities must cover the island’s unmet degree exactly.',deduction:`The island needs ${rem}, and the available connections have total capacity ${total}; therefore every remaining capacity is required.`,reveal:`The connection to (${O.r+1},${O.c+1}) must reach ${final}.`};}}return {token:'br-connect',focus:'Inspect whether any group of islands is becoming isolated.',rule:'All islands must end in one connected network, even after every number is satisfied.',deduction:'A connection that is the only way to join two components cannot be zero.',reveal:'Use connectivity together with island-degree arithmetic; do not guess from the stored solution.'};}
  function lightVisibleCells(p,i){const n=p.n,walls=new Set(p.walls),out=[i],r=Math.floor(i/n),c=i%n;for(const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]]){let rr=r+dr,cc=c+dc;while(rr>=0&&cc>=0&&rr<n&&cc<n){const j=rr*n+cc;if(walls.has(j))break;out.push(j);rr+=dr;cc+=dc;}}return out;}
  function lightProof(a){const p=a.puzzle,n=p.n,walls=new Set(p.walls),lit=lightLitSet(p,a.state.cells);for(let i=0;i<a.state.cells.length;i++)if(a.state.cells[i]===1&&lightConflict(p,a.state.cells,i))return {token:`light-conflict-${i}`,index:i,focus:`Recheck the lamp at ${coord(i,n)}.`,rule:'Two lamps may never see each other along an unobstructed row or column.',deduction:'This lamp has direct line of sight to another lamp, so the current state is contradictory.',reveal:`Remove or relocate the lamp at ${coord(i,n)}.`};for(const [wk,clue] of Object.entries(p.clues)){const w=+wk,r=Math.floor(w/n),c=w%n,adj=[[r-1,c],[r+1,c],[r,c-1],[r,c+1]].filter(([rr,cc])=>rr>=0&&cc>=0&&rr<n&&cc<n).map(([rr,cc])=>rr*n+cc).filter(i=>!walls.has(i)),lamps=adj.filter(i=>a.state.cells[i]===1),unk=adj.filter(i=>a.state.cells[i]===0);if(lamps.length>clue)return {token:`light-over-${w}`,index:w,focus:`Inspect numbered wall ${clue} at ${coord(w,n)}.`,rule:`Exactly ${clue} adjacent cells may contain lamps.`,deduction:`It already touches ${lamps.length} lamps, which is too many.`,reveal:'Remove one adjacent lamp.'};if(unk.length&&lamps.length===clue){const i=unk[0];return {token:`light-x-${i}`,index:i,focus:`Inspect wall ${clue} at ${coord(w,n)}.`,rule:'Once a numbered wall has all required adjacent lamps, its other adjacent cells cannot be lamps.',deduction:`The wall already has ${clue} lamp${clue===1?'':'s'}.`,reveal:`Mark ${coord(i,n)} with ×.`};}if(unk.length&&lamps.length+unk.length===clue){const i=unk[0];return {token:`light-l-${i}`,index:i,focus:`Inspect wall ${clue} at ${coord(w,n)}.`,rule:'All remaining adjacent cells must be lamps when they are all needed to reach the clue.',deduction:`${lamps.length} lamps are placed and exactly ${unk.length} candidates remain for ${clue-lamps.length} required lamps.`,reveal:`Place a lamp at ${coord(i,n)}.`};}}
    for(let i=0;i<n*n;i++)if(!walls.has(i)&&a.state.cells[i]===0&&lit.has(i))return {token:`light-lit-${i}`,index:i,focus:`Inspect already illuminated ${coord(i,n)}.`,rule:'Two lamps may not see each other along an unobstructed row or column.',deduction:'This cell is already illuminated by an existing lamp, so putting another lamp here would create a conflict.',reveal:`Mark ${coord(i,n)} with ×.`};
    for(let i=0;i<n*n;i++)if(!walls.has(i)&&!lit.has(i)){const sources=lightVisibleCells(p,i).filter(j=>!walls.has(j)&&a.state.cells[j]!==2&&!lightVisibleCells(p,j).some(k=>k!==j&&a.state.cells[k]===1));if(sources.length===1){const j=sources[0];return {token:`light-only-${i}-${j}`,index:j,focus:`Inspect unlit ${coord(i,n)}.`,rule:'Every white cell must be illuminated by at least one lamp in its row or column.',deduction:`Only ${coord(j,n)} can still illuminate this cell without creating a lamp conflict.`,reveal:`Place a lamp at ${coord(j,n)}.`};}}return null;}
  function tentCandidateAllowed(a,i){const n=a.puzzle.n;if(a.puzzle.trees.includes(i)||a.state.cells[i]===2)return false;const r=Math.floor(i/n),c=i%n;for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){if(!dr&&!dc)continue;const rr=r+dr,cc=c+dc;if(rr>=0&&cc>=0&&rr<n&&cc<n&&a.state.cells[rr*n+cc]===1)return false;}return rcNeighbors(i,n).some(j=>a.puzzle.trees.includes(j));}
  function tentsProof(a){const n=a.puzzle.n,trees=new Set(a.puzzle.trees),rowPlaced=Array(n).fill(0),colPlaced=Array(n).fill(0);a.state.cells.forEach((v,i)=>{if(v===1){rowPlaced[Math.floor(i/n)]++;colPlaced[i%n]++;}});for(let r=0;r<n;r++)if(rowPlaced[r]>a.puzzle.row[r])return {token:`tent-rowover-${r}`,focus:`Recheck row ${r+1}.`,rule:`The row must contain exactly ${a.puzzle.row[r]} tents.`,deduction:`It currently contains ${rowPlaced[r]}, which is too many.`,reveal:'Remove a tent from this row.'};for(let c=0;c<n;c++)if(colPlaced[c]>a.puzzle.col[c])return {token:`tent-colover-${c}`,focus:`Recheck column ${c+1}.`,rule:`The column must contain exactly ${a.puzzle.col[c]} tents.`,deduction:`It currently contains ${colPlaced[c]}, which is too many.`,reveal:'Remove a tent from this column.'};for(let i=0;i<a.state.cells.length;i++)if(a.state.cells[i]===1){const r=Math.floor(i/n),c=i%n,nearTree=a.puzzle.trees.some(t=>Math.abs(Math.floor(t/n)-r)+Math.abs(t%n-c)===1);if(!nearTree)return {token:`tent-notree-${i}`,index:i,focus:`Recheck the tent at ${coord(i,n)}.`,rule:'Every tent must be orthogonally adjacent to at least one tree.',deduction:'This tent is not next to any tree.',reveal:`Remove the tent at ${coord(i,n)}.`};for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){if(!dr&&!dc)continue;const rr=r+dr,cc=c+dc,j=rr*n+cc;if(rr>=0&&cc>=0&&rr<n&&cc<n&&a.state.cells[j]===1)return {token:`tent-touch-${i}-${j}`,index:i,focus:`Recheck the tents around ${coord(i,n)}.`,rule:'Tents may not touch, even diagonally.',deduction:`The tent at ${coord(i,n)} touches another tent.`,reveal:'Remove one of the touching tents.'};}}for(let r=0;r<n;r++){const unk=Array.from({length:n},(_,c)=>r*n+c).filter(i=>!trees.has(i)&&a.state.cells[i]===0);if(unk.length&&rowPlaced[r]===a.puzzle.row[r]){const i=unk[0];return {token:`tent-rowgrass-${i}`,index:i,focus:`Inspect row ${r+1}.`,rule:`Row ${r+1} must contain exactly ${a.puzzle.row[r]} tents.`,deduction:'Its tent quota is already satisfied, so every other unknown cell in the row is grass.',reveal:`Mark ${coord(i,n)} as grass.`};}const cand=unk.filter(i=>tentCandidateAllowed(a,i));if(cand.length&&rowPlaced[r]+cand.length===a.puzzle.row[r]){const i=cand[0];return {token:`tent-rowfill-${i}`,index:i,focus:`Inspect row ${r+1}.`,rule:`The row still needs ${a.puzzle.row[r]-rowPlaced[r]} tent(s).`,deduction:'The number of legal tent candidates exactly equals the remaining quota, so all of them are tents.',reveal:`Place a tent at ${coord(i,n)}.`};}}
    for(let c=0;c<n;c++){const unk=Array.from({length:n},(_,r)=>r*n+c).filter(i=>!trees.has(i)&&a.state.cells[i]===0);if(unk.length&&colPlaced[c]===a.puzzle.col[c]){const i=unk[0];return {token:`tent-colgrass-${i}`,index:i,focus:`Inspect column ${c+1}.`,rule:`Column ${c+1} must contain exactly ${a.puzzle.col[c]} tents.`,deduction:'Its quota is already satisfied.',reveal:`Mark ${coord(i,n)} as grass.`};}}
    for(const t of a.puzzle.trees){const cand=rcNeighbors(t,n).filter(i=>tentCandidateAllowed(a,i));const existing=rcNeighbors(t,n).filter(i=>a.state.cells[i]===1);if(!existing.length&&cand.length===1){const i=cand[0];return {token:`tent-tree-${t}-${i}`,index:i,focus:`Inspect the tree at ${coord(t,n)}.`,rule:'Every tree must pair with exactly one orthogonally adjacent tent.',deduction:'All adjacent cells except one are unavailable for a tent.',reveal:`Place a tent at ${coord(i,n)}.`};}}return null;}
  const towerPermCache={};
  function permutationsN(n){if(towerPermCache[n])return towerPermCache[n];const out=[];function rec(arr,used){if(arr.length===n){out.push([...arr]);return;}for(let v=1;v<=n;v++)if(!used.has(v)){used.add(v);arr.push(v);rec(arr,used);arr.pop();used.delete(v);}}rec([],new Set());return towerPermCache[n]=out;}
  function countTowerStateSolutions(p,b,limit=2){const n=p.n,rowOpts=Array.from({length:n},(_,r)=>permutationsN(n).filter(q=>(!p.clues.left[r]||towerVisibility(q)===p.clues.left[r])&&(!p.clues.right[r]||towerVisibility([...q].reverse())===p.clues.right[r])&&q.every((v,c)=>!b[r*n+c]||b[r*n+c]===v)));let count=0,rows=[];function rec(r){if(count>=limit)return;if(r===n){for(let c=0;c<n;c++){const col=rows.map(x=>x[c]);if(p.clues.top[c]&&towerVisibility(col)!==p.clues.top[c])return;if(p.clues.bottom[c]&&towerVisibility([...col].reverse())!==p.clues.bottom[c])return;}count++;return;}for(const row of rowOpts[r]){let ok=true;for(let c=0;c<n;c++)for(let rr=0;rr<r;rr++)if(rows[rr][c]===row[c]){ok=false;break;}if(!ok)continue;rows.push(row);rec(r+1);rows.pop();if(count>=limit)return;}}rec(0);return count;}
  function towersProof(a){const p=a.puzzle,b=a.state.board,n=p.n;if(countTowerStateSolutions(p,b,1)===0){for(let i=0;i<b.length;i++)if(b[i]){const t=[...b];t[i]=0;if(countTowerStateSolutions(p,t,1)>0)return {token:`tower-bad-${i}`,index:i,focus:`Recheck ${coord(i,n)}.`,rule:'Rows/columns must be Latin permutations and all four visibility clues must remain attainable.',deduction:`The current height ${b[i]} makes the puzzle impossible; clearing it restores a valid completion.`,reveal:`Reconsider height ${b[i]} at ${coord(i,n)}.`};}}for(let i=0;i<b.length;i++)if(!b[i]){const viable=[];for(let v=1;v<=n;v++){const t=[...b];t[i]=v;if(countTowerStateSolutions(p,t,1)>0)viable.push(v);}if(viable.length===1){const r=Math.floor(i/n),c=i%n;return {token:`tower-${i}-${viable[0]}`,index:i,focus:`Inspect ${coord(i,n)} with row clues ${p.clues.left[r]||'–'}/${p.clues.right[r]||'–'} and column clues ${p.clues.top[c]||'–'}/${p.clues.bottom[c]||'–'}.`,rule:'The row and column must each contain 1–N once while matching both visibility directions.',deduction:`Exact permutation filtering leaves only height ${viable[0]} in this cell.`,reveal:`Set ${coord(i,n)} to ${viable[0]}.`};}}return null;}
  function unequalStateValid(p,b){const n=p.n;for(let r=0;r<n;r++){const vals=b.slice(r*n,r*n+n).filter(v=>v!=null);if(new Set(vals).size!==vals.length)return false;}for(let c=0;c<n;c++){const vals=Array.from({length:n},(_,r)=>b[r*n+c]).filter(v=>v!=null);if(new Set(vals).size!==vals.length)return false;}for(const rel of p.relations){const x=b[rel.a],y=b[rel.b];if(x!=null&&y!=null&&(rel.lt?!(x<y):!(x>y)))return false;}return true;}
  function unequalProof(a){const p=a.puzzle,b=a.state.board,n=p.n;if(!unequalStateValid(p,b)||countUnequalSolutions(b,n,p.relations,1)===0){for(let i=0;i<b.length;i++)if(b[i]!=null&&p.givens[i]==null){const t=[...b];t[i]=null;if(unequalStateValid(p,t)&&countUnequalSolutions(t,n,p.relations,1)>0)return {token:`uneq-bad-${i}`,index:i,focus:`Recheck ${coord(i,n)}.`,rule:'Every row/column must be a Latin permutation and every inequality must point from smaller to larger.',deduction:`The current ${b[i]} prevents any valid completion.`,reveal:`Clear or change ${coord(i,n)}.`};}}for(let i=0;i<b.length;i++)if(b[i]==null){const viable=[];for(let v=1;v<=n;v++)if(unequalCandidateOK(b,n,p.relations,i,v)){const t=[...b];t[i]=v;if(countUnequalSolutions(t,n,p.relations,1)>0)viable.push(v);}if(viable.length===1)return {token:`uneq-${i}-${viable[0]}`,index:i,focus:`Inspect ${coord(i,n)} and its row, column, and neighboring inequality signs.`,rule:'A value must be unused in its row/column and satisfy every adjacent inequality.',deduction:`Only ${viable[0]} survives those constraints and exact completion checking.`,reveal:`Set ${coord(i,n)} to ${viable[0]}.`};}return null;}
  function countArithmeticStateSolutions(p,start,limit=2){const {n,cages}=p,b=[...start],owner=Array(n*n);cages.forEach((g,gi)=>g.cells.forEach(i=>owner[i]=gi));for(let i=0;i<b.length;i++)if(b[i]!=null){const v=b[i];b[i]=null;let ok=true,r=Math.floor(i/n),c=i%n;for(let x=0;x<n;x++)if(b[r*n+x]===v||b[x*n+c]===v){ok=false;break;}b[i]=v;if(!ok||!cagePossible(cages[owner[i]],b,n))return 0;}let count=0;function rec(){if(count>=limit)return;let bi=-1,opts=null;for(let i=0;i<b.length;i++)if(b[i]==null){const r=Math.floor(i/n),c=i%n,o=[];for(let v=1;v<=n;v++){let ok=true;for(let x=0;x<n;x++)if(b[r*n+x]===v||b[x*n+c]===v){ok=false;break;}if(!ok)continue;b[i]=v;ok=cagePossible(cages[owner[i]],b,n);b[i]=null;if(ok)o.push(v);}if(!o.length)return;if(!opts||o.length<opts.length){bi=i;opts=o;if(o.length===1)break;}}if(bi<0){count++;return;}for(const v of opts){b[bi]=v;rec();b[bi]=null;if(count>=limit)return;}}rec();return count;}
  function arithmeticProof(a){const p=a.puzzle,b=a.state.board,n=p.n;if(countArithmeticStateSolutions(p,b,1)===0){for(let i=0;i<b.length;i++)if(b[i]!=null){const t=[...b];t[i]=null;if(countArithmeticStateSolutions(p,t,1)>0)return {token:`arith-bad-${i}`,index:i,focus:`Recheck ${coord(i,n)}.`,rule:'The value must satisfy both Latin-square uniqueness and its cage arithmetic.',deduction:`The current ${b[i]} makes the remaining puzzle impossible.`,reveal:`Clear or change ${coord(i,n)}.`};}}for(let i=0;i<b.length;i++)if(b[i]==null){const viable=[];for(let v=1;v<=n;v++){const t=[...b];t[i]=v;if(countArithmeticStateSolutions(p,t,1)>0)viable.push(v);}if(viable.length===1){const cage=p.cages.find(g=>g.cells.includes(i));return {token:`arith-${i}-${viable[0]}`,index:i,focus:`Inspect ${coord(i,n)} in cage ${cage.target}${cage.op}.`,rule:'The cell must keep its cage arithmetic possible while preserving unique values in its row and column.',deduction:`Only ${viable[0]} permits a complete solution from the current state.`,reveal:`Set ${coord(i,n)} to ${viable[0]}.`};}}return null;}
  function islandsProof(a){const p=a.puzzle,c=a.state.cells,n=p.n;for(let r=0;r<n-1;r++)for(let col=0;col<n-1;col++){const q=[r*n+col,r*n+col+1,(r+1)*n+col,(r+1)*n+col+1],sea=q.filter(i=>c[i]===1),unk=q.filter(i=>c[i]===0);if(sea.length===4)return {token:`isl-2x2bad-${r}-${col}`,focus:`Recheck the 2×2 block at rows ${r+1}–${r+2}, columns ${col+1}–${col+2}.`,rule:'The sea may never contain a solid 2×2 block.',deduction:'All four cells are marked sea, so the current state is contradictory.',reveal:'Change at least one of these four sea cells.'};if(sea.length===3&&unk.length===1){const i=unk[0];return {token:`isl-2x2-${i}`,index:i,focus:`Inspect the 2×2 block containing ${coord(i,n)}.`,rule:'The sea may never contain a solid 2×2 block.',deduction:'Three cells in this block are already sea, so the fourth cannot be sea.',reveal:`Mark ${coord(i,n)} as island.`};}}
    const whiteMask=c.map(v=>v===2?1:0),comps=orthComponents(whiteMask,n,v=>v===1);for(const comp of comps){const clues=comp.filter(i=>p.clues[i]!=null);if(clues.length!==1)continue;const root=clues[0],target=p.clues[root],front=[...new Set(comp.flatMap(i=>rcNeighbors(i,n)).filter(i=>c[i]===0))];if(comp.length>target)return {token:`isl-over-${root}`,index:root,focus:`Recheck the island containing clue ${target} at ${coord(root,n)}.`,rule:`That island must contain exactly ${target} cells.`,deduction:`It currently contains ${comp.length}, so it is already too large.`,reveal:'Change one of the added island cells back to unknown or sea.'};if(comp.length===target&&front.length){const i=front[0];return {token:`isl-done-${root}-${i}`,index:i,focus:`Inspect the island clue ${target} at ${coord(root,n)}.`,rule:`An island containing clue ${target} must have exactly ${target} white cells.`,deduction:'That island has reached its full size, so every orthogonally adjacent unknown cell must be sea.',reveal:`Mark ${coord(i,n)} as sea.`};}if(comp.length<target&&front.length===1){const i=front[0];return {token:`isl-grow-${root}-${i}`,index:i,focus:`Inspect the island clue ${target} at ${coord(root,n)}.`,rule:`The island must remain connected and grow to exactly ${target} cells.`,deduction:'It is not large enough yet and has only one available frontier cell.',reveal:`Mark ${coord(i,n)} as island.`};}}
    return {token:'isl-connect',focus:'Inspect narrow gaps in the sea and incomplete clue islands.',rule:'Every island has exactly one clue, islands stay separate, and all sea cells must remain connected.',deduction:'Use completed-island borders and 2×2-sea prevention before making speculative marks.',reveal:'No stored solution is being consulted; continue from the most constrained island or sea bottleneck.'};}
  function solveHitoriState(grid,n,cells,limit=2){const peers=hitoriDuplicatePeers(grid,n),solutions=[];const potential=st=>{const whites=st.map((v,i)=>v===2?i:-1).filter(i=>i>=0);if(whites.length<=1)return true;const seen=new Set([whites[0]]),q=[whites[0]];while(q.length){const x=q.pop();for(const y of rcNeighbors(x,n))if(st[y]!==1&&!seen.has(y)){seen.add(y);q.push(y);}}return whites.every(i=>seen.has(i));};function prop(st,q){while(q.length){const i=q.pop(),v=st[i];if(v===1){for(const j of rcNeighbors(i,n)){if(st[j]===1)return false;if(st[j]===0){st[j]=2;q.push(j);}}}else if(v===2){for(const j of peers[i]){if(st[j]===2)return false;if(st[j]===0){st[j]=1;q.push(j);}}}}return potential(st);}function rec(st){if(solutions.length>=limit)return;const q=[];for(let i=0;i<st.length;i++)if(st[i])q.push(i);if(!prop(st,q))return;const i=st.findIndex(v=>v===0);if(i<0){solutions.push([...st]);return;}for(const v of [1,2]){const t=[...st];t[i]=v;rec(t);if(solutions.length>=limit)return;}}rec([...cells]);return {count:solutions.length,solution:solutions[0]||null};}
  function hitoriProof(a){const p=a.puzzle,c=a.state.cells,n=p.n;if(solveHitoriState(p.grid,n,c,1).count===0){for(let i=0;i<c.length;i++)if(c[i]){const t=[...c];t[i]=0;if(solveHitoriState(p.grid,n,t,1).count>0)return {token:`hit-bad-${i}`,index:i,focus:`Recheck ${coord(i,n)}.`,rule:'Black cells cannot touch, visible numbers cannot repeat, and all white cells must stay connected.',deduction:'Keeping the current mark here makes the puzzle impossible.',reveal:`Clear or reverse the mark at ${coord(i,n)}.`};}}
    const peers=hitoriDuplicatePeers(p.grid,n);for(let i=0;i<c.length;i++)if(c[i]===1){for(const j of rcNeighbors(i,n))if(c[j]===0)return {token:`hit-white-${j}`,index:j,focus:`Inspect ${coord(j,n)} next to a shaded cell.`,rule:'Black cells may not touch orthogonally.',deduction:'Because its neighbor is black, this cell must remain white.',reveal:`Mark ${coord(j,n)} as Keep white.`};}for(let i=0;i<c.length;i++)if(c[i]===2)for(const j of peers[i])if(c[j]===0)return {token:`hit-black-${j}`,index:j,focus:`Inspect duplicate ${p.grid[i]} values in the same row/column.`,rule:'Two visible equal numbers may not remain in one row or column.',deduction:`${coord(i,n)} is confirmed white, so its duplicate at ${coord(j,n)} must be shaded.`,reveal:`Shade ${coord(j,n)}.`};
    for(let i=0;i<c.length;i++)if(c[i]===0){const black=[...c];black[i]=1;const white=[...c];white[i]=2;const cb=solveHitoriState(p.grid,n,black,1).count,cw=solveHitoriState(p.grid,n,white,1).count;if(cb>0&&!cw)return {token:`hit-forceb-${i}`,index:i,focus:`Test ${coord(i,n)}.`,rule:'A mark is forced when the opposite choice violates the Hitori constraints in every completion.',deduction:'Keeping this cell white leaves no valid completion.',reveal:`Shade ${coord(i,n)}.`};if(cw>0&&!cb)return {token:`hit-forcew-${i}`,index:i,focus:`Test ${coord(i,n)}.`,rule:'A mark is forced when the opposite choice violates the Hitori constraints in every completion.',deduction:'Shading this cell leaves no valid completion.',reveal:`Keep ${coord(i,n)} white.`};}return null;}
  function dominoStateCount(p,partner,limit=2,forced=null){const required=new Set(dominoKeys(p.max)),usedKeys=new Set(),used=Array(partner.length).fill(false);for(let i=0;i<partner.length;i++)if(partner[i]>=0){const j=partner[i];if(partner[j]!==i)return 0;if(i<j){const key=[p.grid[i],p.grid[j]].sort((a,b)=>a-b).join('-');if(usedKeys.has(key))return 0;usedKeys.add(key);used[i]=used[j]=true;}}if(forced){const [i,j]=forced;if(used[i]||used[j])return 0;const key=[p.grid[i],p.grid[j]].sort((a,b)=>a-b).join('-');if(usedKeys.has(key))return 0;usedKeys.add(key);used[i]=used[j]=true;}let count=0;function rec(){if(count>=limit)return;let i=used.findIndex(v=>!v);if(i<0){if(usedKeys.size===required.size)count++;return;}const r=Math.floor(i/p.cols),c=i%p.cols,opts=[];for(const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]]){const rr=r+dr,cc=c+dc;if(rr<0||cc<0||rr>=p.rows||cc>=p.cols)continue;const j=rr*p.cols+cc,key=[p.grid[i],p.grid[j]].sort((a,b)=>a-b).join('-');if(!used[j]&&!usedKeys.has(key)&&required.has(key))opts.push([j,key]);}if(!opts.length)return;used[i]=true;for(const [j,key] of opts){used[j]=true;usedKeys.add(key);rec();usedKeys.delete(key);used[j]=false;if(count>=limit)break;}used[i]=false;}rec();return count;}
  function dominoProof(a){const p=a.puzzle,pt=a.state.partner;if(dominoStateCount(p,pt,1)===0)return {token:'dom-bad',focus:'Inspect the most recent domino pairing.',rule:'Every unordered number pair must be used exactly once and every cell exactly once.',deduction:'The current set of pairings cannot be extended to a complete tiling.',reveal:'Undo a recent pairing and re-evaluate the remaining pair inventory.'};for(let i=0;i<pt.length;i++)if(pt[i]<0){const r=Math.floor(i/p.cols),c=i%p.cols,viable=[];for(const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]]){const rr=r+dr,cc=c+dc;if(rr<0||cc<0||rr>=p.rows||cc>=p.cols)continue;const j=rr*p.cols+cc;if(pt[j]>=0)continue;if(dominoStateCount(p,pt,1,[i,j])>0)viable.push(j);}if(viable.length===1){const j=viable[0];return {token:`dom-${i}-${j}`,index:i,focus:`Inspect ${p.grid[i]} at ${coord(i,p.cols)}.`,rule:'Each cell belongs to one adjacent domino, and each unordered number pair may appear exactly once.',deduction:`Every adjacent pairing except the ${p.grid[i]}–${p.grid[j]} pairing makes the remaining exact-cover problem impossible.`,reveal:`Pair ${coord(i,p.cols)} with ${coord(j,p.cols)}.`};}}return null;}
  function fillominoProof(a){const p=a.puzzle,b=a.state.board,n=p.n,seen=new Set();for(let i=0;i<b.length;i++){if(b[i]==null||seen.has(i))continue;const v=b[i],q=[i],comp=[];seen.add(i);while(q.length){const x=q.pop();comp.push(x);for(const y of rcNeighbors(x,n))if(!seen.has(y)&&b[y]===v){seen.add(y);q.push(y);}}const front=[...new Set(comp.flatMap(x=>rcNeighbors(x,n)).filter(j=>b[j]==null))];if(comp.length>v)return {token:`fill-over-${i}`,index:i,focus:`Inspect the connected ${v}-region containing ${coord(i,n)}.`,rule:`A region labeled ${v} must contain exactly ${v} cells.`,deduction:`This connected region already contains ${comp.length} cells, so it is too large.`,reveal:'Change one of the entries that merged into this oversized region.'};if(comp.length===v&&front.length){const j=front[0];return {token:`fill-done-${i}-${j}`,index:j,focus:`Inspect the completed ${v}-region containing ${coord(i,n)}.`,rule:`A completed region cannot grow beyond ${v} cells.`,deduction:`The region already has exactly ${v} cells, so adjacent unknown cells cannot also be ${v}.`,reveal:`${coord(j,n)} is not ${v}; use its other constraints to determine its value.`};}if(comp.length<v&&front.length===1){const j=front[0];return {token:`fill-grow-${i}-${j}`,index:j,focus:`Inspect the incomplete ${v}-region containing ${coord(i,n)}.`,rule:`The region must stay connected and reach exactly ${v} cells.`,deduction:`It has ${comp.length}/${v} cells and only one adjacent unknown frontier cell, so that frontier must join the region.`,reveal:`Set ${coord(j,n)} to ${v}.`};}}return {token:'fill-structure',focus:'Inspect the smallest incomplete numbered region first.',rule:'Equal adjacent numbers merge into one region, whose size must equal that number.',deduction:'Completed regions forbid growth; incomplete regions with a single frontier force growth.',reveal:'No hidden solution is being revealed; continue with region-size and frontier deductions.'};}
  // ---------- Sudoku ----------
  const sudoku = {
    id:'sudoku', name:'Sudoku', description:byId.sudoku.description, defaultDifficulty:'Medium', difficulties:['Easy','Medium','Hard'],
    rules:{objective:'Fill the 9×9 grid so every row, column, and 3×3 box contains 1–9 exactly once.',items:['Given numbers cannot be changed.','Each row contains 1–9 with no repeats.','Each column contains 1–9 with no repeats.','Each 3×3 box contains 1–9 with no repeats.']},
    async create(seed,difficulty='Medium'){
      const puzzle=generateSudoku(seed,difficulty); return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle,state:{board:[...puzzle.givens],selected:firstEmpty(puzzle.givens),mistakes:0}};
    },
    async save(a){return saveActive(a);},
    render(a){
      const s=a.state.selected; const sr=Math.floor(s/9),sc=s%9;
      const board=`<div class="sudoku-board" role="grid" aria-label="Sudoku board">${a.state.board.map((v,i)=>{const r=Math.floor(i/9),c=i%9;const given=!!a.puzzle.givens[i],sel=i===s,rel=r===sr||c===sc||(Math.floor(r/3)===Math.floor(sr/3)&&Math.floor(c/3)===Math.floor(sc/3));const wrong=v&&v!==a.puzzle.solution[i];return `<button class="sudoku-cell ${given?'given':''} ${sel?'selected':''} ${!sel&&rel?'related':''} ${state.settings.playMode==='challenge'&&wrong?'wrong':''}" data-cell="${i}" aria-label="Row ${r+1}, column ${c+1}, ${v?`value ${v}`:'empty'}${given?', given':''}">${v||''}</button>`}).join('')}</div>`;
      const pad=`<div class="number-pad">${[1,2,3,4,5,6,7,8,9].map(n=>`<button data-num="${n}">${n}</button>`).join('')}<button data-num="0">Clear</button></div>`;
      const result=a.completed?resultPanel(a,this,`<div><strong>${a.state.mistakes}</strong><span>Mistakes</span></div>`):'';
      main.innerHTML=baseGameShell(byId[this.id],a,board,`${pad}<div class="toolbar"><button data-sudoku-undo>Undo</button></div>${result}`);bindGameShell(this,a);this.bind(a);if(a.completed)bindResult(a,this);
    },
    bind(a){
      $$('.sudoku-cell').forEach(b=>b.onclick=()=>{a.state.selected=+b.dataset.cell;this.render(a)});
      $$('[data-num]').forEach(b=>b.onclick=()=>this.enter(a,+b.dataset.num));
      $('[data-sudoku-undo]').onclick=()=>this.undo(a);
      window.onkeydown=e=>{if(!state.currentGame||state.currentGame.id!==this.id||a.completed||overlayRoot.innerHTML)return;let s=a.state.selected,r=Math.floor(s/9),c=s%9;if(e.key==='ArrowUp')r=clamp(r-1,0,8);else if(e.key==='ArrowDown')r=clamp(r+1,0,8);else if(e.key==='ArrowLeft')c=clamp(c-1,0,8);else if(e.key==='ArrowRight')c=clamp(c+1,0,8);else if(/^[1-9]$/.test(e.key)){this.enter(a,+e.key);return}else if(e.key==='Backspace'||e.key==='Delete'){this.enter(a,0);return}else return;e.preventDefault();a.state.selected=r*9+c;this.render(a)};
    },
    async enter(a,n){ const i=a.state.selected;if(a.puzzle.givens[i])return; a.state.history=a.state.history||[];a.state.history.push([i,a.state.board[i]||0]);a.state.board[i]=n||0;if(n&&n!==a.puzzle.solution[i])a.state.mistakes++;
      if(a.state.board.every((v,i)=>v===a.puzzle.solution[i])) await finishActive(a,{mistakes:a.state.mistakes}); else await saveActive(a); this.render(a); },
    async undo(a){const h=a.state.history?.pop();if(!h)return;a.state.board[h[0]]=h[1];await saveActive(a);this.render(a)},
    hint(a){const d=sudokuProof(a);deliverProofHint(a,d);if(d?.index!=null)this.render(a);}
  };
  function firstEmpty(a){const i=a.findIndex(v=>!v);return i<0?0:i;}
  function generateSudoku(seed,difficulty){
    const r=rng(seed); const base=3,side=9; const pattern=(row,col)=>(base*(row%base)+Math.floor(row/base)+col)%side;
    const rBase=[0,1,2]; const rows=shuffle(rBase,r).flatMap(g=>shuffle(rBase,r).map(x=>g*base+x)); const cols=shuffle(rBase,r).flatMap(g=>shuffle(rBase,r).map(x=>g*base+x)); const nums=shuffle([1,2,3,4,5,6,7,8,9],r);
    const solution=[];rows.forEach(rr=>cols.forEach(cc=>solution.push(nums[pattern(rr,cc)])));
    const givens=[...solution];const target={Easy:40,Medium:34,Hard:29}[difficulty]||34;const pos=shuffle(Array.from({length:81},(_,i)=>i),r);
    for(const i of pos){if(givens.filter(Boolean).length<=target)break;const old=givens[i];givens[i]=0;if(countSudokuSolutions([...givens],2)!==1)givens[i]=old;}
    return {solution,givens};
  }
  function countSudokuSolutions(board,limit=2){let count=0;function valid(idx,n){const r=Math.floor(idx/9),c=idx%9;for(let k=0;k<9;k++){if(board[r*9+k]===n||board[k*9+c]===n)return false;}const br=Math.floor(r/3)*3,bc=Math.floor(c/3)*3;for(let rr=0;rr<3;rr++)for(let cc=0;cc<3;cc++)if(board[(br+rr)*9+bc+cc]===n)return false;return true;}function solve(){if(count>=limit)return;let idx=-1,best=null;for(let i=0;i<81;i++)if(!board[i]){const opts=[];for(let n=1;n<=9;n++)if(valid(i,n))opts.push(n);if(!opts.length)return;if(!best||opts.length<best.length){idx=i;best=opts;if(opts.length===1)break;}}if(idx<0){count++;return;}for(const n of best){board[idx]=n;solve();board[idx]=0;if(count>=limit)return;}}solve();return count;}

  // ---------- Mines ----------
  function mineNeighborsRaw(i,rows,cols){const r=Math.floor(i/cols),c=i%cols,out=[];for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){if(!dr&&!dc)continue;const rr=r+dr,cc=c+dc;if(rr>=0&&cc>=0&&rr<rows&&cc<cols)out.push(rr*cols+cc);}return out;}
  function makeMineLayout(rows,cols,count,banned,r){const candidates=shuffle(Array.from({length:rows*cols},(_,i)=>i).filter(i=>!banned.has(i)),r),mines=Array(rows*cols).fill(false);candidates.slice(0,count).forEach(i=>mines[i]=true);const nums=Array(rows*cols).fill(0);for(let i=0;i<nums.length;i++)if(!mines[i])nums[i]=mineNeighborsRaw(i,rows,cols).filter(j=>mines[j]).length;return {mines,nums};}
  function analyzeMineLayout(layout,rows,cols,first,count){const revealed=Array(rows*cols).fill(false),flags=Array(rows*cols).fill(false),safeTotal=rows*cols-count;const flood=start=>{const q=[start];while(q.length){const i=q.pop();if(revealed[i]||flags[i]||layout.mines[i])continue;revealed[i]=true;if(layout.nums[i]===0)for(const j of mineNeighborsRaw(i,rows,cols))if(!revealed[j]&&!layout.mines[j])q.push(j);}};flood(first);let rounds=0,maxTechnique=0,deductions=0,subsetUses=0;
    for(let guard=0;guard<rows*cols*3;guard++){let changed=false;rounds++;const constraints=[];for(let i=0;i<revealed.length;i++)if(revealed[i]&&layout.nums[i]>0){const ns=mineNeighborsRaw(i,rows,cols),unknown=ns.filter(j=>!revealed[j]&&!flags[j]),flagged=ns.filter(j=>flags[j]).length,need=layout.nums[i]-flagged;if(!unknown.length)continue;constraints.push({set:new Set(unknown),need});if(need===0){for(const j of unknown){flood(j);deductions++;changed=true;}maxTechnique=Math.max(maxTechnique,1);}else if(need===unknown.length){for(const j of unknown)if(!flags[j]){flags[j]=true;deductions++;changed=true;}maxTechnique=Math.max(maxTechnique,1);}}
      if(!changed){outer:for(let a=0;a<constraints.length;a++)for(let b=0;b<constraints.length;b++)if(a!==b){const A=constraints[a],B=constraints[b];if(A.set.size>=B.set.size||![...A.set].every(x=>B.set.has(x)))continue;const diff=[...B.set].filter(x=>!A.set.has(x)),need=B.need-A.need;if(!diff.length)continue;if(need===0){for(const j of diff){flood(j);deductions++;changed=true;}maxTechnique=2;subsetUses++;break outer;}if(need===diff.length){for(const j of diff)if(!flags[j]){flags[j]=true;deductions++;changed=true;}maxTechnique=2;subsetUses++;break outer;}}}
      if(!changed)break;
    }
    const safeRevealed=revealed.filter(Boolean).length,progress=safeRevealed/safeTotal,solved=safeRevealed===safeTotal,frontier=revealed.reduce((m,v,i)=>v?Math.max(m,mineNeighborsRaw(i,rows,cols).filter(j=>!revealed[j]&&!flags[j]).length):m,0),score=Math.log2(rows*cols)*5+(count/(rows*cols))*25+maxTechnique*8+Math.min(rounds,30)*.45+(1-progress)*12+frontier*.25;
    return {score,solved,progress,maxTechnique,rounds,subsetUses,deductions,frontier};}
  const mines = {
    id:'mines',name:'Mines',generatorVersion:3,description:byId.mines.description,defaultDifficulty:'Easy',difficulties:['Easy','Medium','Hard'],
    rules:{objective:'Reveal every safe cell without opening a mine.',items:['Numbers show how many mines touch that cell, including diagonally.','Tap a covered cell to reveal it.','Right-click or long-press to flag a suspected mine.','Your first reveal is always safe.']},
    configs:{Easy:[9,9,10],Medium:[16,16,40],Hard:[16,30,99]},
    async create(seed,difficulty='Easy'){const [rows,cols,count]=this.configs[difficulty];return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle:{rows,cols,count,mines:null,nums:null,generatorVersion:3},state:{revealed:Array(rows*cols).fill(false),flags:Array(rows*cols).fill(false),selected:0,status:'playing'}}},
    async save(a){return saveActive(a);},
    build(a,first){const {rows,cols,count}=a.puzzle,rr=Math.floor(first/cols),cc=first%cols,banned=new Set();for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){const r=rr+dr,c=cc+dc;if(r>=0&&c>=0&&r<rows&&c<cols)banned.add(r*cols+c);}const rgen=rng(`${a.seed}:${first}:mines:v3`),samples=[];for(let attempt=0;attempt<24;attempt++){const layout=makeMineLayout(rows,cols,count,banned,rgen),analysis=analyzeMineLayout(layout,rows,cols,first,count);samples.push({layout,analysis});}samples.sort((x,y)=>x.analysis.score-y.analysis.score);const q=a.difficulty==='Easy'?0:a.difficulty==='Hard'?1:.5,chosen=samples[Math.round((samples.length-1)*q)];a.puzzle.mines=chosen.layout.mines;a.puzzle.nums=chosen.layout.nums;a.puzzle.difficultyScore=+chosen.analysis.score.toFixed(2);a.puzzle.difficultyMetrics={logicalProgress:+chosen.analysis.progress.toFixed(3),logicalSolved:chosen.analysis.solved,maxTechnique:chosen.analysis.maxTechnique,subsetUses:chosen.analysis.subsetUses,rounds:chosen.analysis.rounds};a.puzzle.generatorVersion=3;},
    neighbors(i,rows,cols){const r=Math.floor(i/cols),c=i%cols,out=[];for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){if(!dr&&!dc)continue;const rr=r+dr,cc=c+dc;if(rr>=0&&cc>=0&&rr<rows&&cc<cols)out.push(rr*cols+cc)}return out;},
    render(a){const {rows,cols}=a.puzzle;const cells=Array.from({length:rows*cols},(_,i)=>{const rev=a.state.revealed[i],flag=a.state.flags[i],mine=a.puzzle.mines?.[i],n=a.puzzle.nums?.[i]||0;return `<button class="mine-cell ${rev?'revealed':''} ${flag?'flagged':''} ${i===a.state.selected?'selected':''} ${rev&&mine?'exploded mine':''}" data-mine-cell="${i}" data-n="${rev&&!mine&&n?n:''}" aria-label="Row ${Math.floor(i/cols)+1}, column ${i%cols+1}, ${flag?'flagged':rev?(mine?'mine':n?`${n} adjacent mines`:'empty'):'covered'}">${rev&&!mine&&n?n:''}</button>`}).join('');const board=`<div class="mines-board" style="grid-template-columns:repeat(${cols},1fr)">${cells}</div>`;const result=a.completed?resultPanel(a,this,`<div><strong>${a.puzzle.count}</strong><span>Mines</span></div>`):'';main.innerHTML=baseGameShell(byId[this.id],a,board,`${result}`);bindGameShell(this,a);this.bind(a);if(a.completed)bindResult(a,this);},
    bind(a){$$('[data-mine-cell]').forEach(b=>{let timer;b.onclick=()=>this.reveal(a,+b.dataset.mineCell);b.oncontextmenu=e=>{e.preventDefault();this.flag(a,+b.dataset.mineCell)};b.onpointerdown=e=>{if(e.pointerType==='touch')timer=setTimeout(()=>this.flag(a,+b.dataset.mineCell),500)};b.onpointerup=b.onpointercancel=()=>clearTimeout(timer)});window.onkeydown=e=>{if(!state.currentGame||state.currentGame.id!==this.id||a.completed||overlayRoot.innerHTML)return;const {rows,cols}=a.puzzle;let i=a.state.selected,r=Math.floor(i/cols),c=i%cols;if(e.key==='ArrowUp')r=clamp(r-1,0,rows-1);else if(e.key==='ArrowDown')r=clamp(r+1,0,rows-1);else if(e.key==='ArrowLeft')c=clamp(c-1,0,cols-1);else if(e.key==='ArrowRight')c=clamp(c+1,0,cols-1);else if(e.key==='Enter'||e.key===' '){this.reveal(a,i);return}else if(e.key.toLowerCase()==='f'){this.flag(a,i);return}else return;e.preventDefault();a.state.selected=r*cols+c;this.render(a)};},
    async flag(a,i){if(a.completed||a.state.revealed[i])return;a.state.flags[i]=!a.state.flags[i];await saveActive(a);this.render(a)},
    async reveal(a,i){if(a.completed||a.state.flags[i]||a.state.revealed[i])return;if(!a.puzzle.mines)this.build(a,i);if(a.puzzle.mines[i]){a.state.revealed[i]=true;a.state.status='lost';await finishActive(a,{mineHit:true},'failed');this.render(a);return;}const stack=[i];while(stack.length){const x=stack.pop();if(a.state.revealed[x]||a.state.flags[x])continue;a.state.revealed[x]=true;if(a.puzzle.nums[x]===0)this.neighbors(x,a.puzzle.rows,a.puzzle.cols).forEach(n=>{if(!a.puzzle.mines[n]&&!a.state.revealed[n])stack.push(n)});}const safe=a.puzzle.rows*a.puzzle.cols-a.puzzle.count;if(a.state.revealed.filter(Boolean).length===safe)await finishActive(a,{mines:a.puzzle.count});else await saveActive(a);this.render(a);},
    hint(a){if(!a.puzzle.mines){toast('Reveal any cell first — your first move is safe.');return;}const safe=a.state.revealed.map((v,i)=>!v&&!a.state.flags[i]&&!a.puzzle.mines[i]?i:-1).filter(i=>i>=0);if(!safe.length)return;const i=pick(safe);toast(`Hint: row ${Math.floor(i/a.puzzle.cols)+1}, column ${i%a.puzzle.cols+1} is safe.`);}
  };

  // ---------- Lights Out ----------
  function solveLightsOut(board,n){
    const m=n*n,A=Array.from({length:m},()=>new Uint8Array(m+1));
    for(let cell=0;cell<m;cell++){const r=Math.floor(cell/n),c=cell%n;for(const [dr,dc] of [[0,0],[-1,0],[1,0],[0,-1],[0,1]]){const rr=r+dr,cc=c+dc;if(rr>=0&&cc>=0&&rr<n&&cc<n)A[cell][rr*n+cc]=1;}A[cell][m]=board[cell]?1:0;}
    const pivotCols=[],pivotRows=[];let row=0;
    for(let col=0;col<m&&row<m;col++){let pr=row;while(pr<m&&!A[pr][col])pr++;if(pr===m)continue;[A[row],A[pr]]=[A[pr],A[row]];for(let rr=0;rr<m;rr++)if(rr!==row&&A[rr][col])for(let cc=col;cc<=m;cc++)A[rr][cc]^=A[row][cc];pivotCols.push(col);pivotRows.push(row);row++;}
    for(let rr=row;rr<m;rr++){let any=0;for(let c=0;c<m;c++)any|=A[rr][c];if(!any&&A[rr][m])return {solvable:false};}
    const free=[];for(let c=0;c<m;c++)if(!pivotCols.includes(c))free.push(c);const particular=Array(m).fill(0);for(let k=0;k<pivotCols.length;k++)particular[pivotCols[k]]=A[pivotRows[k]][m];const basis=[];
    for(const f of free){const v=Array(m).fill(0);v[f]=1;for(let k=0;k<pivotCols.length;k++)if(A[pivotRows[k]][f])v[pivotCols[k]]=1;basis.push(v);}
    let best=[...particular],bestW=best.reduce((a,b)=>a+b,0),solutionCount=2**free.length;
    if(free.length<=18){for(let mask=1;mask<solutionCount;mask++){const v=[...particular];for(let j=0;j<free.length;j++)if(mask>>j&1)for(let i=0;i<m;i++)v[i]^=basis[j][i];const w=v.reduce((a,b)=>a+b,0);if(w<bestW){bestW=w;best=v;}}}
    return {solvable:true,rank:pivotCols.length,nullity:free.length,solutionCount,minWeight:bestW,optimalPresses:best.map((v,i)=>v?i:-1).filter(i=>i>=0)};
  }
  function generateLightsOut(seed,difficulty,toggleRaw){
    const n={Easy:3,Medium:5,Hard:7}[difficulty]||5,r=rng(`${seed}:lights-out:v3`),ranges={Easy:[2,4],Medium:[6,11],Hard:[13,24]},[lo,hi]=ranges[difficulty]||ranges.Medium;let best=null,bestDist=Infinity;
    for(let attempt=0;attempt<80;attempt++){const board=Array(n*n).fill(false),presses=2+Math.floor(r()*Math.max(3,n*n*.75));for(let k=0;k<presses;k++)toggleRaw(board,n,Math.floor(r()*n*n));if(board.every(v=>!v))continue;const a=solveLightsOut(board,n);if(!a.solvable)continue;const dist=a.minWeight<lo?lo-a.minWeight:a.minWeight>hi?a.minWeight-hi:0;if(dist<bestDist){bestDist=dist;best={board,a};}if(!dist)break;}
    if(!best)throw new Error('Lights Out generation failed');return {n,initial:best.board,difficultyScore:best.a.minWeight,difficultyMetrics:{optimalPresses:best.a.minWeight,solutionCount:best.a.solutionCount,nullity:best.a.nullity},generatorVersion:3,optimalPresses:best.a.optimalPresses};
  }
  const lightsOut={
    id:'lights-out',name:'Lights Out',generatorVersion:3,description:byId['lights-out'].description,defaultDifficulty:'Medium',difficulties:['Easy','Medium','Hard'],
    rules:{objective:'Turn every light off.',items:['Pressing a cell toggles that cell and its orthogonal neighbors.','Corner and edge cells affect fewer neighbors.','The puzzle is solved when no lights remain on.']},
    sizes:{Easy:3,Medium:5,Hard:7},
    async create(seed,difficulty='Medium'){const puzzle=generateLightsOut(seed,difficulty,(b,n,i)=>this.toggleRaw(b,n,i));return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle,state:{board:[...puzzle.initial],moves:0,selected:0,history:[]}}},
    toggleRaw(board,n,i){const r=Math.floor(i/n),c=i%n;[[0,0],[-1,0],[1,0],[0,-1],[0,1]].forEach(([dr,dc])=>{const rr=r+dr,cc=c+dc;if(rr>=0&&cc>=0&&rr<n&&cc<n){const x=rr*n+cc;board[x]=!board[x]}})},
    async save(a){return saveActive(a);},
    render(a){const n=a.puzzle.n;const board=`<div class="lights-board" style="grid-template-columns:repeat(${n},1fr)">${a.state.board.map((v,i)=>`<button class="light-cell ${v?'on':''} ${i===a.state.selected?'selected':''}" data-light="${i}" aria-label="Row ${Math.floor(i/n)+1}, column ${i%n+1}, ${v?'on':'off'}"></button>`).join('')}</div>`;const result=a.completed?resultPanel(a,this,`<div><strong>${a.state.moves}</strong><span>Presses</span></div>`):'';main.innerHTML=baseGameShell(byId[this.id],a,board,`<div class="toolbar"><button data-light-undo>Undo</button></div>${result}`);bindGameShell(this,a);this.bind(a);if(a.completed)bindResult(a,this);},
    bind(a){$$('[data-light]').forEach(b=>b.onclick=()=>this.press(a,+b.dataset.light));$('[data-light-undo]').onclick=()=>this.undo(a);window.onkeydown=e=>{if(!state.currentGame||state.currentGame.id!==this.id||a.completed||overlayRoot.innerHTML)return;const n=a.puzzle.n;let i=a.state.selected,r=Math.floor(i/n),c=i%n;if(e.key==='ArrowUp')r=clamp(r-1,0,n-1);else if(e.key==='ArrowDown')r=clamp(r+1,0,n-1);else if(e.key==='ArrowLeft')c=clamp(c-1,0,n-1);else if(e.key==='ArrowRight')c=clamp(c+1,0,n-1);else if(e.key==='Enter'||e.key===' '){this.press(a,i);return}else return;e.preventDefault();a.state.selected=r*n+c;};},
    async press(a,i){a.state.history.push(i);this.toggleRaw(a.state.board,a.puzzle.n,i);a.state.moves++;if(a.state.board.every(v=>!v))await finishActive(a,{moves:a.state.moves});else await saveActive(a);this.render(a)},
    async undo(a){const i=a.state.history.pop();if(i===undefined)return;this.toggleRaw(a.state.board,a.puzzle.n,i);a.state.moves=Math.max(0,a.state.moves-1);await saveActive(a);this.render(a)},
    hint(a){const q=solveLightsOut(a.state.board,a.puzzle.n);if(!q.solvable||!q.optimalPresses.length)return;const i=q.optimalPresses[0];toast(`Optimal hint: press row ${Math.floor(i/a.puzzle.n)+1}, column ${i%a.puzzle.n+1}.`);}
  };

  // ---------- Sliding Tiles ----------
  function slidingManhattan(board,n){let s=0;for(let i=0;i<board.length;i++){const v=board[i];if(!v)continue;const goal=v-1;s+=Math.abs(Math.floor(i/n)-Math.floor(goal/n))+Math.abs(i%n-goal%n);}return s;}
  function slidingLinearConflict(board,n){let extra=0;for(let r=0;r<n;r++)for(let a=0;a<n;a++)for(let b=a+1;b<n;b++){const va=board[r*n+a],vb=board[r*n+b];if(!va||!vb)continue;const ga=va-1,gb=vb-1;if(Math.floor(ga/n)===r&&Math.floor(gb/n)===r&&ga%n>gb%n)extra+=2;}for(let c=0;c<n;c++)for(let a=0;a<n;a++)for(let b=a+1;b<n;b++){const va=board[a*n+c],vb=board[b*n+c];if(!va||!vb)continue;const ga=va-1,gb=vb-1;if(ga%n===c&&gb%n===c&&Math.floor(ga/n)>Math.floor(gb/n))extra+=2;}return extra;}
  function slidingLowerBound(board,n){return slidingManhattan(board,n)+slidingLinearConflict(board,n);}
  function slidingExactDistance3(start){const goal='1,2,3,4,5,6,7,8,0',key=start.join(',');if(key===goal)return 0;const neighbors=i=>{const r=Math.floor(i/3),c=i%3,o=[];if(r)o.push(i-3);if(r<2)o.push(i+3);if(c)o.push(i-1);if(c<2)o.push(i+1);return o;};let bound=slidingLowerBound(start,3),path=[...start];const search=(g,bound,lastBlank)=>{const h=slidingLowerBound(path,3),f=g+h;if(f>bound)return f;if(path.join(',')===goal)return true;let min=Infinity,blank=path.indexOf(0);for(const j of neighbors(blank)){if(j===lastBlank)continue;[path[blank],path[j]]=[path[j],path[blank]];const t=search(g+1,bound,blank);[path[blank],path[j]]=[path[j],path[blank]];if(t===true)return true;if(t<min)min=t;}return min;};for(;bound<=31;){const t=search(0,bound,-1);if(t===true)return bound;if(!Number.isFinite(t))break;bound=t;}return slidingLowerBound(start,3);}
  function generateSlidingBoard(seed,difficulty,neighbors){const n={Easy:3,Medium:4,Hard:5}[difficulty]||4,sol=Array.from({length:n*n-1},(_,i)=>i+1).concat(0),r=rng(`${seed}:sliding:v3`),ranges={Easy:[8,16],Medium:[18,30],Hard:[30,48]},[lo,hi]=ranges[difficulty]||ranges.Medium;let best=null,bestDist=Infinity;for(let attempt=0;attempt<32;attempt++){const board=[...sol];let blank=board.length-1,last=-1,steps={Easy:35,Medium:180,Hard:360}[difficulty];for(let k=0;k<steps;k++){const opts=neighbors(blank,n).filter(x=>x!==last),next=pick(opts,r);[board[blank],board[next]]=[board[next],board[blank]];last=blank;blank=next;}const estimate=n===3?slidingExactDistance3(board):slidingLowerBound(board,n),dist=estimate<lo?lo-estimate:estimate>hi?estimate-hi:0;if(dist<bestDist){bestDist=dist;best={board,estimate};}if(!dist)break;}return {n,solution:sol,initial:best.board,difficultyScore:best.estimate,difficultyMetrics:{distanceEstimate:best.estimate,estimateType:n===3?'exact':'manhattan+linear-conflict'},generatorVersion:3};}
  const slidingTiles={
    id:'sliding-tiles',name:'Sliding Tiles',generatorVersion:3,description:byId['sliding-tiles'].description,defaultDifficulty:'Medium',difficulties:['Easy','Medium','Hard'],sizes:{Easy:3,Medium:4,Hard:5},
    rules:{objective:'Slide the numbered tiles into ascending order.',items:['Only a tile next to the empty space can move.','Use every move to bring the board closer to 1, 2, 3… with the blank last.','Every generated board is solvable.']},
    async create(seed,difficulty='Medium'){const puzzle=generateSlidingBoard(seed,difficulty,(i,n)=>this.neighbors(i,n));return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle,state:{board:[...puzzle.initial],moves:0,history:[]}}},
    neighbors(i,n){const r=Math.floor(i/n),c=i%n,out=[];if(r>0)out.push(i-n);if(r<n-1)out.push(i+n);if(c>0)out.push(i-1);if(c<n-1)out.push(i+1);return out;},
    async save(a){return saveActive(a);},
    render(a){const n=a.puzzle.n;const board=`<div class="sliding-board" style="grid-template-columns:repeat(${n},1fr)">${a.state.board.map((v,i)=>`<button class="slide-tile ${v===0?'blank':''}" data-slide="${i}" aria-label="${v===0?'Blank space':`Tile ${v}`}" ${v===0?'disabled':''}>${v||''}</button>`).join('')}</div>`;const result=a.completed?resultPanel(a,this,`<div><strong>${a.state.moves}</strong><span>Moves</span></div>`):'';main.innerHTML=baseGameShell(byId[this.id],a,board,`<div class="toolbar"><button data-slide-undo>Undo</button></div>${result}`);bindGameShell(this,a);this.bind(a);if(a.completed)bindResult(a,this);},
    bind(a){$$('[data-slide]').forEach(b=>b.onclick=()=>this.move(a,+b.dataset.slide));$('[data-slide-undo]').onclick=()=>this.undo(a);window.onkeydown=e=>{if(!state.currentGame||state.currentGame.id!==this.id||a.completed||overlayRoot.innerHTML)return;const n=a.puzzle.n,blank=a.state.board.indexOf(0),r=Math.floor(blank/n),c=blank%n;let idx=null;if(e.key==='ArrowUp'&&r<n-1)idx=blank+n;if(e.key==='ArrowDown'&&r>0)idx=blank-n;if(e.key==='ArrowLeft'&&c<n-1)idx=blank+1;if(e.key==='ArrowRight'&&c>0)idx=blank-1;if(idx!==null){e.preventDefault();this.move(a,idx)}};},
    async move(a,i){const blank=a.state.board.indexOf(0);if(!this.neighbors(blank,a.puzzle.n).includes(i))return;a.state.history.push(i);[a.state.board[blank],a.state.board[i]]=[a.state.board[i],a.state.board[blank]];a.state.moves++;if(a.state.board.every((v,i)=>v===a.puzzle.solution[i]))await finishActive(a,{moves:a.state.moves});else await saveActive(a);this.render(a)},
    async undo(a){const prev=a.state.history.pop();if(prev===undefined)return;const blank=a.state.board.indexOf(0);if(!this.neighbors(blank,a.puzzle.n).includes(prev))return;[a.state.board[blank],a.state.board[prev]]=[a.state.board[prev],a.state.board[blank]];a.state.moves=Math.max(0,a.state.moves-1);await saveActive(a);this.render(a)},
    hint(a){const blank=a.state.board.indexOf(0),opts=this.neighbors(blank,a.puzzle.n);let best=opts[0],bestScore=Infinity;for(const i of opts){const b=[...a.state.board];[b[blank],b[i]]=[b[i],b[blank]];const score=b.reduce((s,v,k)=>v? s+Math.abs(Math.floor(k/a.puzzle.n)-Math.floor((v-1)/a.puzzle.n))+Math.abs(k%a.puzzle.n-(v-1)%a.puzzle.n):s,0);if(score<bestScore){bestScore=score;best=i}}toast(`Hint: move tile ${a.state.board[best]}.`);}
  };

  // ---------- Make 24 ----------
  function gcd(a,b){a=Math.abs(a);b=Math.abs(b);while(b){[a,b]=[b,a%b]}return a||1}
  function frac(n,d=1,label=null){const g=gcd(n,d);const sign=d<0?-1:1;return {n:n/g*sign,d:Math.abs(d/g),label:label??(d===1?String(n):`${n}/${d}`)}}
  function applyFrac(a,b,op){if(op==='+')return frac(a.n*b.d+b.n*a.d,a.d*b.d,`(${a.label}+${b.label})`);if(op==='-')return frac(a.n*b.d-b.n*a.d,a.d*b.d,`(${a.label}−${b.label})`);if(op==='×')return frac(a.n*b.n,a.d*b.d,`(${a.label}×${b.label})`);if(op==='÷'&&b.n!==0)return frac(a.n*b.d,a.d*b.n,`(${a.label}÷${b.label})`);return null;}
  function has24(vals){if(vals.length===1)return vals[0].n===24*vals[0].d;for(let i=0;i<vals.length;i++)for(let j=0;j<vals.length;j++){if(i===j)continue;const rest=vals.filter((_,k)=>k!==i&&k!==j);for(const op of ['+','-','×','÷']){if((op==='+'||op==='×')&&j<i)continue;const v=applyFrac(vals[i],vals[j],op);if(v&&has24([...rest,v]))return true;}}return false;}
  const make24AnalysisCache=new Map();let make24CatalogCache=null;
  function analyze24Numbers(nums){
    const cacheKey=[...nums].sort((a,b)=>a-b).join(',');if(make24AnalysisCache.has(cacheKey))return make24AnalysisCache.get(cacheKey);
    const solutions=new Map();
    function rec(vals,meta){
      if(vals.length===1){if(vals[0].n===24*vals[0].d){const key=vals[0].label.replace(/\s/g,'');const prev=solutions.get(key),data={division:meta.division,subtraction:meta.subtraction,fraction:meta.fraction,cost:meta.subtraction+meta.division*1.6+(meta.fraction?2.5:0)};if(!prev||data.cost<prev.cost)solutions.set(key,data);}return;}
      for(let i=0;i<vals.length;i++)for(let j=i+1;j<vals.length;j++){
        const rest=vals.filter((_,k)=>k!==i&&k!==j),a=vals[i],b=vals[j],ops=[['+',a,b],['×',a,b],['-',a,b],['-',b,a],['÷',a,b],['÷',b,a]];
        for(const [op,x,y] of ops){const v=applyFrac(x,y,op);if(!v)continue;rec([...rest,v],{division:meta.division+(op==='÷'),subtraction:meta.subtraction+(op==='-'),fraction:meta.fraction||v.d!==1});}
      }
    }
    rec(nums.map(n=>frac(n)),{division:0,subtraction:0,fraction:false});
    const arr=[...solutions.values()],solutionCount=arr.length,minCost=arr.length?Math.min(...arr.map(x=>x.cost)):Infinity,requiresDivision=arr.length?arr.every(x=>x.division>0):false,requiresFraction=arr.length?arr.every(x=>x.fraction):false;
    const score=arr.length?Math.max(0,14-Math.log2(solutionCount+1)*2+minCost+(requiresDivision?1.5:0)+(requiresFraction?2.5:0)):Infinity;
    const out={solutionCount,minCost,requiresDivision,requiresFraction,score};make24AnalysisCache.set(cacheKey,out);return out;
  }
  const MAKE24_TIER_NUMS={"Easy":[[1,1,3,8],[1,1,4,6],[1,2,6,8],[4,6,7,7],[2,2,4,6],[1,2,3,4],[3,4,4,8],[2,2,3,8],[2,4,6,8],[1,2,2,6],[4,6,8,8],[1,7,8,9],[3,5,5,8],[3,6,6,8],[3,3,4,6],[3,7,7,8],[3,8,9,9],[4,5,5,6],[4,6,9,9],[1,2,4,8],[1,6,8,9],[2,5,8,9],[3,6,7,8],[4,5,7,8],[2,3,4,9],[2,3,6,9],[3,4,8,9],[1,2,6,6],[2,3,4,6],[2,6,7,9],[4,6,6,8],[2,3,6,6],[1,6,9,9],[2,3,4,4],[2,6,8,9],[4,6,6,6],[3,8,8,8],[3,3,6,9],[3,3,3,8],[4,4,4,6],[2,4,4,8],[1,3,8,9],[1,2,3,6],[1,2,3,9],[3,4,5,7],[1,3,4,9],[3,5,7,9],[1,3,6,6],[5,6,6,7],[1,2,5,8],[1,2,4,4],[1,2,6,9],[3,6,6,9],[1,3,3,4],[1,3,5,9],[3,4,5,8],[1,1,4,8],[2,5,6,8],[4,5,6,9],[1,2,5,7],[1,3,4,4],[2,2,6,8],[2,4,8,8],[1,3,6,7],[1,1,3,6],[1,1,3,7],[1,1,3,9],[1,3,3,5],[1,4,4,7],[3,3,5,6],[4,4,7,9],[4,4,8,8],[1,3,6,8],[4,4,6,9],[1,4,7,8],[2,8,9,9],[1,1,4,5],[1,2,3,8],[1,2,8,8],[2,2,4,8],[1,7,9,9],[1,8,8,9],[1,1,2,8],[1,3,3,7],[1,4,4,5],[2,4,6,7],[1,4,6,8],[2,3,5,6],[2,4,5,8],[2,4,6,6],[3,5,6,9],[2,2,4,5],[2,4,5,6],[2,5,6,7],[2,6,8,8],[3,5,8,8],[1,2,6,7],[3,4,4,6],[1,3,4,5],[1,4,4,8],[2,3,5,7],[2,4,4,6],[2,7,7,8],[3,3,9,9],[1,3,3,9],[2,3,3,8],[1,1,4,7],[1,4,8,8],[2,3,7,8],[1,2,7,8],[1,5,9,9],[1,7,7,9],[1,7,8,8],[2,3,3,6],[2,3,3,9],[2,3,9,9],[2,4,9,9],[5,5,6,8],[5,5,7,7],[1,1,5,6],[1,5,8,8],[2,4,6,9],[3,4,7,7],[3,5,6,8],[4,6,8,9],[1,2,3,5],[1,2,3,7],[1,2,5,6],[1,2,7,9],[1,3,5,8],[1,8,8,8],[3,3,4,9],[3,4,5,5],[1,5,6,9],[3,6,7,9],[4,4,5,8],[4,6,7,8]],"Medium":[[1,2,4,9],[1,2,5,9],[1,3,4,8],[2,2,2,3],[2,2,2,8],[2,2,3,9],[2,4,7,9],[3,4,4,5],[1,2,8,9],[3,4,6,8],[3,6,8,9],[1,3,4,7],[1,4,8,9],[1,5,6,6],[2,3,5,9],[2,6,6,8],[3,3,4,8],[3,4,7,9],[3,4,9,9],[4,5,7,9],[4,6,6,7],[4,7,8,9],[5,6,7,8],[1,2,4,7],[2,2,4,7],[2,3,4,5],[2,3,4,7],[2,4,4,4],[3,4,6,6],[1,1,5,5],[1,2,4,6],[1,4,4,9],[2,3,5,5],[3,3,5,9],[3,5,6,7],[3,5,7,8],[3,7,8,8],[3,9,9,9],[5,6,8,9],[6,6,6,9],[2,2,2,4],[2,2,3,6],[2,2,6,6],[2,2,7,8],[2,6,6,6],[1,3,6,9],[2,2,8,8],[2,3,3,7],[2,3,4,8],[2,3,8,8],[3,6,6,6],[3,8,8,9],[4,4,5,6],[4,5,6,6],[6,7,9,9],[1,3,8,8],[2,3,6,8],[2,3,7,9],[3,3,6,7],[3,4,4,9],[5,5,6,7],[5,5,7,8],[1,1,2,6],[1,1,5,7],[1,3,3,6],[2,2,3,3],[2,3,5,8],[2,5,5,9],[3,3,3,6],[3,7,7,7],[3,3,7,9],[1,4,5,5],[1,5,8,9],[2,3,6,7],[2,4,5,7],[2,4,5,9],[3,6,9,9],[4,5,5,9],[5,5,8,9],[5,7,8,8],[5,7,8,9],[1,2,2,5],[1,3,5,6],[2,2,4,9],[5,5,5,9],[3,5,9,9],[1,2,4,5],[1,4,5,7],[1,5,6,7],[1,5,7,8],[2,3,8,9],[2,4,7,8],[2,7,8,8],[3,3,6,8],[3,4,6,9],[3,5,6,6],[3,5,8,9],[3,6,6,7],[3,6,8,8],[4,4,6,8],[4,4,7,8],[4,5,5,5],[4,5,6,7],[4,5,8,9],[4,7,8,8],[5,5,5,6],[6,6,7,9],[6,8,8,9],[1,1,3,4],[1,1,6,6],[1,2,2,4],[1,2,3,3],[2,2,3,7],[2,2,5,6],[2,3,7,7],[3,3,7,8],[6,6,6,6],[1,2,5,5],[1,4,6,7],[1,6,8,8],[2,2,8,9],[2,4,4,7],[2,6,7,8],[3,3,4,5],[3,3,4,7],[3,4,4,7],[3,4,5,9],[5,6,8,8],[1,2,2,7],[1,5,6,8],[1,6,6,9],[2,2,5,9],[2,8,8,8],[2,8,8,9],[3,3,8,9],[3,4,5,6],[3,7,8,9],[4,4,4,8],[4,4,5,5],[4,4,5,7],[4,5,6,8],[4,6,6,9],[4,8,8,9],[5,5,6,6],[6,6,6,8],[6,6,8,9]],"Hard":[[6,8,9,9],[1,2,2,9],[1,3,3,3],[1,4,4,4],[2,2,3,4],[2,2,5,5],[2,3,3,3],[2,5,5,7],[2,5,7,7],[4,4,4,4],[1,2,2,8],[1,3,5,7],[1,3,7,8],[1,4,5,8],[1,5,5,6],[2,4,4,5],[2,6,6,9],[2,6,9,9],[3,6,7,7],[3,7,9,9],[4,5,7,7],[4,7,7,8],[5,8,8,9],[4,8,8,8],[1,1,2,7],[1,1,3,5],[1,1,4,4],[2,2,4,4],[2,2,5,7],[2,2,6,7],[2,3,3,5],[3,3,3,4],[3,3,3,5],[3,3,4,4],[1,3,3,8],[1,4,4,6],[1,4,5,9],[1,4,6,6],[1,4,6,9],[2,2,7,7],[2,4,8,9],[2,5,6,6],[2,5,7,9],[3,3,3,7],[3,5,5,7],[4,4,4,7],[4,4,8,9],[5,6,9,9],[5,8,8,8],[1,1,4,9],[1,3,7,7],[1,4,7,9],[1,5,7,9],[1,3,7,9],[4,6,7,9],[2,6,6,7],[1,1,2,9],[1,1,5,8],[1,4,7,7],[1,5,5,9],[1,6,7,9],[2,2,6,9],[2,5,8,8],[3,4,7,8],[3,5,5,6],[4,4,4,9],[5,6,6,8],[5,6,7,9],[5,7,7,9],[6,8,8,8],[7,8,8,9],[1,1,6,8],[2,5,6,9],[1,1,1,8],[1,1,6,9],[1,1,8,8],[2,2,2,5],[2,2,2,9],[2,4,5,5],[1,3,9,9],[6,6,8,8],[6,7,8,9],[2,2,2,7],[2,2,3,5],[2,2,5,8],[2,4,7,7],[2,5,7,8],[2,7,8,9],[3,3,3,3],[3,3,5,7],[3,4,4,4],[5,6,6,9],[4,5,8,8],[1,6,6,6],[2,4,4,9],[3,5,5,9],[2,5,5,8],[3,3,6,6],[4,4,4,5],[4,5,9,9],[1,2,7,7],[3,3,3,9],[3,3,5,5],[3,7,7,9],[4,5,5,7],[4,5,5,8],[4,7,7,7],[4,7,9,9],[4,8,9,9],[5,5,5,5],[5,5,8,8],[5,5,9,9],[5,6,6,6],[5,6,7,7],[3,3,7,7],[1,5,5,5],[4,4,7,7],[1,4,5,6],[1,3,4,6],[1,6,6,8],[3,3,8,8]]};
  function make24Catalog(){if(make24CatalogCache)return make24CatalogCache;return make24CatalogCache=Object.fromEntries(Object.entries(MAKE24_TIER_NUMS).map(([k,arr])=>[k,arr.map(nums=>({nums,analysis:null}))]));}

  const make24={
    id:'make-24',name:'Make 24',generatorVersion:3,description:byId['make-24'].description,defaultDifficulty:'Medium',difficulties:['Easy','Medium','Hard'],
    rules:{objective:'Use all four numbers exactly once to make 24.',items:['Choose two values and an operation to combine them.','Use +, −, ×, and ÷.','Intermediate fractions are allowed.','When one value remains, it must equal exactly 24.']},
    async create(seed,difficulty='Medium'){const r=rng(`${seed}:make24:v3`),entry=pick(make24Catalog()[difficulty]||make24Catalog().Medium,r),nums=shuffle([...entry.nums],r),m=analyze24Numbers(entry.nums);return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle:{nums,difficultyScore:+m.score.toFixed(2),difficultyMetrics:{solutionCount:m.solutionCount,requiresDivision:m.requiresDivision,requiresFraction:m.requiresFraction,minComplexity:+m.minCost.toFixed(2)},generatorVersion:3},state:{values:nums.map((n,i)=>({...frac(n),id:`v${i}`})),first:null,op:null,history:[]}}},
    async save(a){return saveActive(a);},
    render(a){const values=`<div class="make24"><div class="make24-target">24</div><div class="value-row">${a.state.values.map(v=>`<button class="value-tile ${a.state.first===v.id?'selected':''}" data-value-id="${v.id}">${v.d===1?v.n:`${v.n}/${v.d}`}</button>`).join('')}</div><div class="op-row">${['+','-','×','÷'].map(o=>`<button class="op-button ${a.state.op===o?'selected':''}" data-op="${o}">${o}</button>`).join('')}</div><div class="history-list">${a.state.history.map(h=>`<div>${esc(h.text)}</div>`).join('')}</div></div>`;const result=a.completed?resultPanel(a,this,`<div><strong>${a.state.history.length}</strong><span>Steps</span></div>`):'';main.innerHTML=baseGameShell(byId[this.id],a,values,`<div class="toolbar"><button data-m24-undo>Undo</button><button data-m24-reset>Restart expression</button></div>${result}`);bindGameShell(this,a);this.bind(a);if(a.completed)bindResult(a,this);},
    bind(a){$$('[data-value-id]').forEach(b=>b.onclick=()=>this.value(a,b.dataset.valueId));$$('[data-op]').forEach(b=>b.onclick=()=>{a.state.op=b.dataset.op;this.render(a)});$('[data-m24-undo]').onclick=()=>this.undo(a);$('[data-m24-reset]').onclick=()=>this.reset(a);},
    async value(a,id){if(a.completed)return;if(!a.state.first){a.state.first=id;this.render(a);return;}if(a.state.first===id){a.state.first=null;this.render(a);return;}if(!a.state.op){a.state.first=id;this.render(a);return;}const av=a.state.values.find(v=>v.id===a.state.first),bv=a.state.values.find(v=>v.id===id);const out=applyFrac(av,bv,a.state.op);if(!out){toast('Division by zero is not allowed.');return;}a.state.history.push({values:JSON.parse(JSON.stringify(a.state.values)),text:`${av.d===1?av.n:`${av.n}/${av.d}`} ${a.state.op} ${bv.d===1?bv.n:`${bv.n}/${bv.d}`} = ${out.d===1?out.n:`${out.n}/${out.d}`}`});a.state.values=a.state.values.filter(v=>v.id!==av.id&&v.id!==bv.id);out.id=uid('v');a.state.values.push(out);a.state.first=null;a.state.op=null;if(a.state.values.length===1&&out.n===24*out.d)await finishActive(a,{steps:a.state.history.length});else await saveActive(a);this.render(a);},
    async undo(a){const h=a.state.history.pop();if(!h)return;a.state.values=h.values;a.state.first=null;a.state.op=null;await saveActive(a);this.render(a)},
    async reset(a){a.state.values=a.puzzle.nums.map((n,i)=>({...frac(n),id:`v${i}`}));a.state.history=[];a.state.first=null;a.state.op=null;await saveActive(a);this.render(a)},
    hint(a){toast('Hint: try combining a pair that makes 1, 2, 3, 4, 6, 8, or 12.');}
  };

  // ---------- Word Search ----------
  const wordSearch={
    id:'word-search',name:'Word Search',generatorVersion:4,description:byId['word-search'].description,defaultDifficulty:'Medium',difficulties:['Easy','Medium','Hard'],
    rules:{objective:'Find every listed word hidden in the letter grid.',items:['Words may run horizontally, vertically, or diagonally.','Harder puzzles may place words backwards.','Drag or select from one end of a word to the other.','Find every listed word to finish.']},
    async create(seed,difficulty='Medium'){const r=rng(`${seed}:word-search:v4`),size={Easy:8,Medium:10,Hard:12}[difficulty],tier={Easy:1,Medium:2,Hard:3}[difficulty]||2,source=WORD_CONTENT.wordSearchThemes?.length?WORD_CONTENT.wordSearchThemes:WORD_SEARCH_THEMES,pool=source.filter(t=>(t.difficulty||2)===tier&&t.words.filter(w=>w.length<=size).length>=(difficulty==='Easy'?6:difficulty==='Medium'?8:10)),theme=pick(pool.length?pool:source,r),count={Easy:6,Medium:8,Hard:10}[difficulty],words=shuffle(theme.words.filter(w=>w.length<=size),r).slice(0,count),puzzle=generateWordSearch(size,words,r,difficulty==='Hard');return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle:{size,theme:theme.name,contentId:theme.id||theme.name,words,grid:puzzle.grid,paths:puzzle.paths,generatorVersion:4},state:{found:[],start:null,hover:null}}},
    async save(a){return saveActive(a);},
    render(a){const n=a.puzzle.size,active=this.currentLine(a);const activeSet=new Set(active);const foundSet=new Set(a.state.found.flatMap(w=>a.puzzle.paths[w]||[]));const board=`<div><p style="text-align:center;margin:0 0 10px"><strong>${esc(a.puzzle.theme)}</strong></p><div class="word-list">${a.puzzle.words.map(w=>`<span class="word-chip ${a.state.found.includes(w)?'found':''}">${esc(w)}</span>`).join('')}</div><div class="wordsearch-board" style="grid-template-columns:repeat(${n},1fr)">${a.puzzle.grid.map((c,i)=>`<button class="ws-cell ${activeSet.has(i)?'active':''} ${foundSet.has(i)?'found':''}" data-ws="${i}" type="button" aria-label="Row ${Math.floor(i/n)+1}, column ${i%n+1}, letter ${c}">${c}</button>`).join('')}</div></div>`;const result=a.completed?resultPanel(a,this,`<div><strong>${a.state.found.length}</strong><span>Words</span></div>`):'';main.innerHTML=baseGameShell(byId[this.id],a,board,`${result}`);bindGameShell(this,a);this.bind(a);if(a.completed)bindResult(a,this);},
    currentLine(a){if(a.state.start===null||a.state.hover===null)return[];return lineBetween(a.state.start,a.state.hover,a.puzzle.size);},
    bind(a){
      let dragStart=null, moved=false;
      const paint=()=>{
        const active=new Set(this.currentLine(a));
        $$('[data-ws]').forEach(el=>el.classList.toggle('active',active.has(+el.dataset.ws)));
      };
      const move=e=>{
        if(dragStart===null)return;
        const el=document.elementFromPoint(e.clientX,e.clientY)?.closest?.('[data-ws]');
        if(!el)return;
        const i=+el.dataset.ws;
        if(i!==a.state.hover){a.state.hover=i;moved=true;paint();}
      };
      const up=async()=>{
        if(dragStart===null)return;
        document.removeEventListener('pointermove',move);document.removeEventListener('pointerup',up);
        if(moved && this.currentLine(a).length>1){await this.commit(a);}
        else { a.state.start=dragStart; a.state.hover=dragStart; paint(); }
        dragStart=null;moved=false;
      };
      $$('[data-ws]').forEach(cell=>{
        const i=+cell.dataset.ws;
        cell.onpointerdown=e=>{e.preventDefault();dragStart=i;moved=false;a.state.start=i;a.state.hover=i;paint();document.addEventListener('pointermove',move);document.addEventListener('pointerup',up,{once:true});};
        cell.onclick=e=>{
          if(e.detail===0){ // keyboard activation / accessible two-point selection
            if(a.state.start===null){a.state.start=i;a.state.hover=i;paint();} else {a.state.hover=i;this.commit(a);}
          }
        };
      });
    },
    async commit(a){const line=this.currentLine(a);if(line.length>1){const word=line.map(i=>a.puzzle.grid[i]).join('');const rev=[...word].reverse().join('');const target=a.puzzle.words.find(w=>(w===word||w===rev)&&!a.state.found.includes(w));if(target){a.state.found.push(target);toast(`${target} found`);if(a.state.found.length===a.puzzle.words.length)await finishActive(a,{words:a.state.found.length});else await saveActive(a);}}a.state.start=null;a.state.hover=null;this.render(a);},
    hint(a){const w=a.puzzle.words.find(w=>!a.state.found.includes(w));if(!w)return;const p=a.puzzle.paths[w];const i=p[0];toast(`Hint: ${w} starts at row ${Math.floor(i/a.puzzle.size)+1}, column ${i%a.puzzle.size+1}.`);}
  };
  function lineBetween(a,b,n){const ar=Math.floor(a/n),ac=a%n,br=Math.floor(b/n),bc=b%n;const dr=br-ar,dc=bc-ac;if(!(dr===0||dc===0||Math.abs(dr)===Math.abs(dc)))return[];const len=Math.max(Math.abs(dr),Math.abs(dc));const sr=Math.sign(dr),sc=Math.sign(dc);return Array.from({length:len+1},(_,k)=>(ar+sr*k)*n+(ac+sc*k));}
  function wordSearchOccurrences(grid,size,word){
    const dirs=[[0,1],[1,0],[1,1],[-1,1],[0,-1],[-1,0],[-1,-1],[1,-1]],seen=new Set();
    for(let sr=0;sr<size;sr++)for(let sc=0;sc<size;sc++)for(const [dr,dc] of dirs){const cells=[];let ok=true;for(let k=0;k<word.length;k++){const rr=sr+dr*k,cc=sc+dc*k;if(rr<0||cc<0||rr>=size||cc>=size||grid[rr*size+cc]!==word[k]){ok=false;break;}cells.push(rr*size+cc);}if(ok){const a=cells.join(','),b=[...cells].reverse().join(',');seen.add(a<b?a:b);}}
    return seen.size;
  }
  function generateWordSearch(size,words,r,reverse){
    const baseDirs=[[0,1],[1,0],[1,1],[-1,1]],dirs=reverse?baseDirs.concat([[0,-1],[-1,0],[-1,-1],[1,-1]]):baseDirs;
    for(let attempt=0;attempt<260;attempt++){
      const grid=Array(size*size).fill(''),paths={};let ok=true;
      for(const word of [...words].sort((a,b)=>b.length-a.length)){let placed=false;for(let t=0;t<260&&!placed;t++){const [dr,dc]=pick(dirs,r),sr=Math.floor(r()*size),sc=Math.floor(r()*size),cells=[];let valid=true;for(let k=0;k<word.length;k++){const rr=sr+dr*k,cc=sc+dc*k;if(rr<0||cc<0||rr>=size||cc>=size){valid=false;break;}const idx=rr*size+cc;if(grid[idx]&&grid[idx]!==word[k]){valid=false;break;}cells.push(idx);}if(valid){cells.forEach((idx,k)=>grid[idx]=word[k]);paths[word]=cells;placed=true;}}if(!placed){ok=false;break;}}
      if(!ok)continue;
      const letters='EEEEEEEEEEEEAAAAAAAAAIIIIIIIIOOOOOOOONNNNNNRRRRRRTTTTTTLLLLSSSSUUUUDDDDGGGBBCCMMPPFFHHVVWWYYKJXQZ';for(let i=0;i<grid.length;i++)if(!grid[i])grid[i]=letters[Math.floor(r()*letters.length)];
      if(words.every(w=>wordSearchOccurrences(grid,size,w)===1))return{grid,paths};
    }
    throw new Error('Word Search generation failed duplicate-occurrence certification');
  }


  // ---------- Groups ----------
  function groupCategoryPool(){
    if(WORD_CONTENT.groups?.length)return WORD_CONTENT.groups;
    return GROUPS_PUZZLES.flatMap((raw,pi)=>raw.map((g,gi)=>({id:`legacy-${pi}-${gi}`,label:g[0],members:g[1],kind:'concrete',difficulty:2,family:`legacy-${pi}`})));
  }
  function groupPartitionCount(words,categories,limit=2){
    const target=new Set(words),cands=categories.filter(c=>c.members?.length===4&&c.members.every(w=>target.has(w))),used=new Set();let count=0;
    function rec(){
      if(count>=limit)return;
      if(used.size===target.size){count++;return;}
      const first=words.find(w=>!used.has(w));
      for(const c of cands){if(!c.members.includes(first)||c.members.some(w=>used.has(w)))continue;c.members.forEach(w=>used.add(w));rec();c.members.forEach(w=>used.delete(w));if(count>=limit)return;}
    }
    rec();return count;
  }
  function buildGroupsContent(seed,difficulty){
    const r=rng(`${seed}:groups:v4`),all=groupCategoryPool(),want={Easy:1,Medium:2,Hard:3}[difficulty]||2;
    for(let attempt=0;attempt<500;attempt++){
      const ordered=shuffle(all,r).sort((a,b)=>Math.abs((a.difficulty||2)-want)-Math.abs((b.difficulty||2)-want)),chosen=[],used=new Set(),families=new Set();
      for(const cat of ordered){
        if(chosen.length>=4)break;
        if(cat.members.some(w=>used.has(w)))continue;
        if(difficulty==='Hard'&&chosen.length<2&&(cat.difficulty||1)<3)continue;
        if(difficulty==='Easy'&&(cat.difficulty||1)>2)continue;
        if(families.has(cat.family)&&ordered.length>12)continue;
        chosen.push(cat);cat.members.forEach(w=>used.add(w));families.add(cat.family);
      }
      if(chosen.length===4){const hard=chosen.filter(x=>(x.difficulty||1)>=3).length,words=chosen.flatMap(x=>x.members);if((difficulty!=='Hard'||hard>=2)&&groupPartitionCount(words,all,2)===1)return chosen;}
    }
    throw new Error('Groups content bank could not produce a unique four-group partition');
  }
  const groupsGame = {
    id:'groups', name:'Groups', generatorVersion:4, description:byId.groups.description, defaultDifficulty:'Medium', difficulties:['Easy','Medium','Hard'],
    rules:{objective:'Sort sixteen words into four groups of four related items.',items:['Select exactly four tiles and submit them as a group.','Every puzzle is certified to have one complete four-group partition against the editorial category bank.','A wrong submission leaves the tiles in play.','Solve all four groups to finish.']},
    async create(seed,difficulty='Medium'){
      const r=rng(`${seed}:groups:v4`),cats=buildGroupsContent(seed,difficulty),groups=cats.map((g,i)=>({id:`g${i}`,contentId:g.id,label:g.label,members:[...g.members],kind:g.kind||'concrete',difficulty:g.difficulty||2})),tiles=shuffle(groups.flatMap(g=>g.members.map(word=>({id:`${g.id}:${word}`,word,groupId:g.id}))),r),score=groups.reduce((n,g)=>n+g.difficulty+(g.kind==='wordplay'?1.5:(g.kind==='abstract'?.7:0)),0);
      return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle:{groups,tiles,contentIds:groups.map(g=>g.contentId),difficultyScore:+score.toFixed(2),difficultyMetrics:{hardGroups:groups.filter(g=>g.difficulty>=3).length,wordplayGroups:groups.filter(g=>g.kind==='wordplay').length},generatorVersion:4},state:{selected:[],solved:[],mistakes:0}};
    },
    async save(a){return saveActive(a);},
    render(a){const solvedHtml=a.state.solved.map(id=>{const g=a.puzzle.groups.find(x=>x.id===id);return `<div class="group-solved"><strong>${esc(g.label)}</strong><span>${g.members.map(esc).join(' · ')}</span></div>`}).join(''),remaining=a.puzzle.tiles.filter(t=>!a.state.solved.includes(t.groupId)),board=`<div class="groups-wrap">${solvedHtml}<div class="groups-grid">${remaining.map(t=>`<button class="group-tile ${a.state.selected.includes(t.id)?'selected':''}" data-group-tile="${esc(t.id)}">${esc(t.word)}</button>`).join('')}</div><div class="groups-status"><span>${a.state.selected.length}/4 selected</span><span>${a.state.mistakes} mistakes</span></div></div>`,controls=`<div class="toolbar"><button data-groups-clear>Deselect</button><button class="primary-button" data-groups-submit ${a.state.selected.length!==4?'disabled':''}>Submit group</button></div>${a.completed?resultPanel(a,this,`<div><strong>${a.state.mistakes}</strong><span>Mistakes</span></div>`):''}`;main.innerHTML=baseGameShell(byId[this.id],a,board,controls);bindGameShell(this,a);this.bind(a);if(a.completed)bindResult(a,this);},
    bind(a){$$('[data-group-tile]').forEach(b=>b.onclick=()=>{const id=b.dataset.groupTile;if(a.completed)return;const i=a.state.selected.indexOf(id);if(i>=0)a.state.selected.splice(i,1);else if(a.state.selected.length<4)a.state.selected.push(id);this.render(a)});$('[data-groups-clear]').onclick=()=>{a.state.selected=[];this.render(a)};$('[data-groups-submit]').onclick=()=>this.submit(a);window.onkeydown=e=>{if(e.key==='Escape'){a.state.selected=[];this.render(a)}};},
    async submit(a){if(a.state.selected.length!==4||a.completed)return;const picked=a.state.selected.map(id=>a.puzzle.tiles.find(t=>t.id===id)),group=a.puzzle.groups.find(g=>picked.every(t=>t.groupId===g.id));if(group&&!a.state.solved.includes(group.id)){a.state.solved.push(group.id);a.state.selected=[];toast(`${group.label} solved`);if(a.state.solved.length===4)await finishActive(a,{mistakes:a.state.mistakes});else await saveActive(a);}else{a.state.mistakes++;toast('Not a group');}this.render(a);},
    hint(a){const g=a.puzzle.groups.find(g=>!a.state.solved.includes(g.id));if(!g)return;toast(`Hint: ${g.members[0]} and ${g.members[1]} belong together.`);}
  };

  // ---------- Word Ladder ----------
  let ladderGraphCache=null, ladderPairsCache=null;
  function oneLetterDiff(a,b){if(a.length!==b.length)return false;let d=0;for(let i=0;i<a.length;i++)if(a[i]!==b[i]&&++d>1)return false;return d===1;}
  function ladderGraph(){
    if(ladderGraphCache)return ladderGraphCache;
    const m=new Map(LADDER_WORDS.map(w=>[w,[]]));
    for(let i=0;i<LADDER_WORDS.length;i++)for(let j=i+1;j<LADDER_WORDS.length;j++)if(oneLetterDiff(LADDER_WORDS[i],LADDER_WORDS[j])){m.get(LADDER_WORDS[i]).push(LADDER_WORDS[j]);m.get(LADDER_WORDS[j]).push(LADDER_WORDS[i]);}
    return ladderGraphCache=m;
  }
  function ladderPath(start,target){
    if(start===target)return [start]; const g=ladderGraph(),q=[start],prev=new Map([[start,null]]);
    for(let h=0;h<q.length;h++){const w=q[h];for(const n of g.get(w)||[]){if(prev.has(n))continue;prev.set(n,w);if(n===target){const p=[n];let x=w;while(x){p.push(x);x=prev.get(x);}return p.reverse();}q.push(n);}}
    return null;
  }
  function ladderPairs(){
    if(ladderPairsCache)return ladderPairsCache;
    const out={Easy:[],Medium:[],Hard:[]};
    for(let i=0;i<LADDER_WORDS.length;i++)for(let j=i+1;j<LADDER_WORDS.length;j++){
      const p=ladderPath(LADDER_WORDS[i],LADDER_WORDS[j]);if(!p)continue;const d=p.length-1;
      if(d>=3&&d<=4)out.Easy.push([LADDER_WORDS[i],LADDER_WORDS[j],d]);
      else if(d>=5&&d<=6)out.Medium.push([LADDER_WORDS[i],LADDER_WORDS[j],d]);
      else if(d>=7&&d<=10)out.Hard.push([LADDER_WORDS[i],LADDER_WORDS[j],d]);
    }
    return ladderPairsCache=out;
  }
  const wordLadder={
    id:'word-ladder',name:'Word Ladder',description:byId['word-ladder'].description,defaultDifficulty:'Medium',difficulties:['Easy','Medium','Hard'],
    rules:{objective:'Change the start word into the target word one letter at a time.',items:['Every step must be a valid four-letter word.','Change exactly one letter per move.','You may use any valid route, not only the shortest one.','Reach the target word to finish.']},
    async create(seed,difficulty='Medium'){const r=rng(seed),pairs=ladderPairs()[difficulty];const pair=pick(pairs.length?pairs:ladderPairs().Medium,r);return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle:{start:pair[0],target:pair[1],optimal:pair[2]},state:{chain:[pair[0]],input:''}};},
    async save(a){return saveActive(a);},
    render(a){const current=a.state.chain[a.state.chain.length-1];const chain=a.state.chain.map((w,i)=>{const prev=i?a.state.chain[i-1]:null;return `<div class="ladder-step"><span>${String(i).padStart(2,'0')}</span><strong>${w.toUpperCase()}</strong>${prev?`<small>${[0,1,2,3].map(k=>prev[k]!==w[k]?k+1:null).filter(Boolean).join('')}</small>`:''}</div>`}).join('');const board=`<div class="ladder-wrap"><div class="ladder-target"><span>Start</span><strong>${a.puzzle.start.toUpperCase()}</strong><i>→</i><span>Target</span><strong>${a.puzzle.target.toUpperCase()}</strong></div><div class="ladder-chain">${chain}</div>${!a.completed?`<form class="ladder-entry"><input maxlength="4" autocomplete="off" spellcheck="false" aria-label="Next four-letter word" placeholder="Next word" value="${esc(a.state.input||'')}"><button class="primary-button" type="submit">Add</button></form>`:''}</div>`;const result=a.completed?resultPanel(a,this,`<div><strong>${a.state.chain.length-1}</strong><span>Moves</span></div><div><strong>${a.puzzle.optimal}</strong><span>Optimal</span></div>`):'';main.innerHTML=baseGameShell(byId[this.id],a,board,`${!a.completed?`<div class="toolbar"><button data-ladder-undo ${a.state.chain.length<=1?'disabled':''}>Undo</button></div>`:''}${result}`);bindGameShell(this,a);this.bind(a);if(a.completed)bindResult(a,this);},
    bind(a){const form=$('.ladder-entry');if(form){const input=$('input',form);input.oninput=()=>a.state.input=input.value.toLowerCase().replace(/[^a-z]/g,'').slice(0,4);form.onsubmit=e=>{e.preventDefault();this.submit(a)};setTimeout(()=>input.focus(),0);}const u=$('[data-ladder-undo]');if(u)u.onclick=()=>this.undo(a);},
    async submit(a){const w=(a.state.input||'').toLowerCase(),cur=a.state.chain[a.state.chain.length-1];if(w.length!==4){toast('Enter four letters.');return;}if(!LADDER_SET.has(w)){toast('That word is not in this ladder dictionary.');return;}if(a.state.chain.includes(w)){toast('That word is already in the ladder.');return;}if(!oneLetterDiff(cur,w)){toast('Change exactly one letter.');return;}a.state.chain.push(w);a.state.input='';if(w===a.puzzle.target)await finishActive(a,{moves:a.state.chain.length-1,optimal:a.puzzle.optimal});else await saveActive(a);this.render(a);},
    async undo(a){if(a.state.chain.length<=1)return;a.state.chain.pop();a.state.input='';await saveActive(a);this.render(a);},
    hint(a){const cur=a.state.chain[a.state.chain.length-1],path=ladderPath(cur,a.puzzle.target);if(!path||path.length<2){toast('No hint available.');return;}const next=path[1],idx=[0,1,2,3].find(i=>cur[i]!==next[i]);toast(`Hint: a shortest route has ${path.length-1} moves left. Change letter ${idx+1}.`);}
  };

  // ---------- Binary ----------
  const binaryRowCache={};
  function validBinaryRows(n){
    if(binaryRowCache[n])return binaryRowCache[n];const out=[],half=n/2,total=1<<n;
    for(let mask=0;mask<total;mask++){const row=Array.from({length:n},(_,i)=>(mask>>(n-1-i))&1);if(row.reduce((a,b)=>a+b,0)!==half)continue;let ok=true;for(let i=0;i<n-2;i++)if(row[i]===row[i+1]&&row[i]===row[i+2]){ok=false;break;}if(ok)out.push(row);}
    return binaryRowCache[n]=out;
  }
  function generateBinarySolution(n,r){
    const rows=validBinaryRows(n),grid=[],used=new Set(),half=n/2;
    function rec(rr){if(rr===n){const cols=Array.from({length:n},(_,c)=>grid.map(row=>row[c]).join(''));return new Set(cols).size===n;}const opts=shuffle(rows,r);for(const row of opts){const key=row.join('');if(used.has(key))continue;let good=true;for(let c=0;c<n;c++){let ones=row[c],count=1;for(let k=0;k<rr;k++){ones+=grid[k][c];count++;}if(ones>half||count-ones>half){good=false;break;}if(rr>=2&&grid[rr-1][c]===row[c]&&grid[rr-2][c]===row[c]){good=false;break;}}if(!good)continue;grid.push(row);used.add(key);if(rec(rr+1))return true;used.delete(key);grid.pop();}return false;}if(!rec(0))throw new Error('Binary generation failed');return grid.flat();
  }
  function countBinarySolutions(flat,n,limit=2){
    const rows=validBinaryRows(n),half=n/2,rowCands=Array.from({length:n},(_,rr)=>rows.filter(row=>row.every((v,c)=>flat[rr*n+c]===null||flat[rr*n+c]===v))),grid=[],used=new Set();let count=0;
    function rec(rr){if(count>=limit)return;if(rr===n){const cols=Array.from({length:n},(_,c)=>grid.map(row=>row[c]).join(''));if(new Set(cols).size===n)count++;return;}for(const row of rowCands[rr]){const key=row.join('');if(used.has(key))continue;let good=true;for(let c=0;c<n;c++){let ones=row[c],cnt=1;for(let k=0;k<rr;k++){ones+=grid[k][c];cnt++;}if(ones>half||cnt-ones>half){good=false;break;}if(rr>=2&&grid[rr-1][c]===row[c]&&grid[rr-2][c]===row[c]){good=false;break;}}if(!good)continue;grid.push(row);used.add(key);rec(rr+1);used.delete(key);grid.pop();if(count>=limit)return;}}
    rec(0);return count;
  }
  function binaryViolation(board,n,i){const r=Math.floor(i/n),c=i%n,half=n/2;const row=board.slice(r*n,r*n+n),col=Array.from({length:n},(_,rr)=>board[rr*n+c]);for(const line of [row,col]){const vals=line.filter(v=>v!==null);if(vals.filter(v=>v===0).length>half||vals.filter(v=>v===1).length>half)return true;for(let k=0;k<n-2;k++)if(line[k]!==null&&line[k]===line[k+1]&&line[k]===line[k+2])return true;}if(row.every(v=>v!==null)){for(let rr=0;rr<n;rr++)if(rr!==r){const other=board.slice(rr*n,rr*n+n);if(other.every(v=>v!==null)&&other.every((v,k)=>v===row[k]))return true;}}if(col.every(v=>v!==null)){for(let cc=0;cc<n;cc++)if(cc!==c){const other=Array.from({length:n},(_,rr)=>board[rr*n+cc]);if(other.every(v=>v!==null)&&other.every((v,k)=>v===col[k]))return true;}}return false;}
  const binaryGame={
    id:'binary',name:'Binary',description:byId.binary.description,defaultDifficulty:'Medium',difficulties:['Easy','Medium','Hard'],sizes:{Easy:6,Medium:8,Hard:10},
    rules:{objective:'Fill the grid with 0s and 1s while satisfying every row and column.',items:['Each row and column contains equal numbers of 0 and 1.','Never place three identical values consecutively.','No two completed rows may be identical.','No two completed columns may be identical.']},
    async create(seed,difficulty='Medium'){const n=this.sizes[difficulty],r=rng(seed),solution=generateBinarySolution(n,r),givens=[...solution],cells=shuffle(Array.from({length:n*n},(_,i)=>i),r),target=Math.floor(n*n*({Easy:.38,Medium:.50,Hard:.56}[difficulty]));let removed=0;for(const i of cells){const old=givens[i];givens[i]=null;if(countBinarySolutions(givens,n,2)===1){removed++;if(removed>=target)break;}else givens[i]=old;}return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle:{size:n,solution,givens},state:{board:[...givens],selected:givens.findIndex(v=>v===null),history:[]}};},
    async save(a){return saveActive(a);},
    render(a){const n=a.puzzle.size;const cells=a.state.board.map((v,i)=>{const given=a.puzzle.givens[i]!==null,bad=v!==null&&binaryViolation(a.state.board,n,i);return `<button class="binary-cell ${given?'given':''} ${i===a.state.selected?'selected':''} ${bad?'wrong':''}" data-binary="${i}" aria-label="Row ${Math.floor(i/n)+1}, column ${i%n+1}, ${v===null?'empty':`value ${v}`}${given?', given':''}">${v===null?'':v}</button>`}).join('');const board=`<div class="binary-board" style="grid-template-columns:repeat(${n},1fr)">${cells}</div>`;const controls=`<div class="binary-pad"><button data-binary-value="0">0</button><button data-binary-value="1">1</button><button data-binary-value="clear">Clear</button><button data-binary-undo>Undo</button></div>${a.completed?resultPanel(a,this,`<div><strong>${n}×${n}</strong><span>Board</span></div>`):''}`;main.innerHTML=baseGameShell(byId[this.id],a,board,controls);bindGameShell(this,a);this.bind(a);if(a.completed)bindResult(a,this);},
    bind(a){$$('[data-binary]').forEach(b=>b.onclick=()=>{a.state.selected=+b.dataset.binary;this.render(a)});$$('[data-binary-value]').forEach(b=>b.onclick=()=>this.enter(a,b.dataset.binaryValue));$('[data-binary-undo]').onclick=()=>this.undo(a);window.onkeydown=e=>{if(!state.currentGame||state.currentGame.id!==this.id)return;const n=a.puzzle.size,s=a.state.selected;if(['0','1'].includes(e.key)){e.preventDefault();this.enter(a,e.key);}else if(e.key==='Backspace'||e.key==='Delete'){e.preventDefault();this.enter(a,'clear');}else if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();const r=Math.floor(s/n),c=s%n,nr=clamp(r+(e.key==='ArrowDown')-(e.key==='ArrowUp'),0,n-1),nc=clamp(c+(e.key==='ArrowRight')-(e.key==='ArrowLeft'),0,n-1);a.state.selected=nr*n+nc;this.render(a);}};},
    async enter(a,val){const i=a.state.selected;if(i<0||a.completed||a.puzzle.givens[i]!==null)return;const next=val==='clear'?null:+val;if(a.state.board[i]===next)return;a.state.history.push([i,a.state.board[i]]);a.state.board[i]=next;const full=a.state.board.every(v=>v!==null),correct=full&&a.state.board.every((v,k)=>v===a.puzzle.solution[k]);if(correct)await finishActive(a,{size:a.puzzle.size});else await saveActive(a);this.render(a);},
    async undo(a){const h=a.state.history.pop();if(!h)return;a.state.board[h[0]]=h[1];await saveActive(a);this.render(a);},
    hint(a){const d=binaryProof(a);deliverProofHint(a,d);if(d?.index!=null)this.render(a);}
  };

  // ---------- Queens ----------
  const queensGame={
    id:'queens',name:'Queens',description:byId.queens.description,defaultDifficulty:'Medium',difficulties:['Easy','Medium','Hard'],sizes:{Easy:6,Medium:7,Hard:8},
    rules:{objective:'Place exactly one queen in every row, column, and outlined region.',items:['Every row contains exactly one queen.','Every column contains exactly one queen.','Every outlined region contains exactly one queen.','Queens may not touch diagonally. Use X marks for impossible cells.']},
    async create(seed,difficulty='Medium'){const n=this.sizes[difficulty],r=rng(seed),bases=QUEEN_BASES[n],base=bases[Math.floor(r()*bases.length)];return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle:{size:n,solution:[...base.q],regions:[...base.r]},state:{cells:Array(n*n).fill(0),selected:0,history:[]}};},
    async save(a){return saveActive(a);},
    borderStyle(a,i){const n=a.puzzle.size,r=Math.floor(i/n),c=i%n,reg=a.puzzle.regions[i],s=[];if(r===0||a.puzzle.regions[(r-1)*n+c]!==reg)s.push('border-top-width:3px');if(c===0||a.puzzle.regions[r*n+c-1]!==reg)s.push('border-left-width:3px');if(r===n-1||a.puzzle.regions[(r+1)*n+c]!==reg)s.push('border-bottom-width:3px');if(c===n-1||a.puzzle.regions[r*n+c+1]!==reg)s.push('border-right-width:3px');return s.join(';');},
    contradiction(a,i){if(a.state.cells[i]!==2)return false;const n=a.puzzle.size,r=Math.floor(i/n),c=i%n,reg=a.puzzle.regions[i];for(let j=0;j<a.state.cells.length;j++)if(j!==i&&a.state.cells[j]===2){const rr=Math.floor(j/n),cc=j%n;if(rr===r||cc===c||a.puzzle.regions[j]===reg||Math.abs(rr-r)===1&&Math.abs(cc-c)===1)return true;}return false;},
    render(a){const n=a.puzzle.size;const board=`<div class="queens-board" style="grid-template-columns:repeat(${n},1fr)">${a.state.cells.map((v,i)=>`<button class="queen-cell ${i===a.state.selected?'selected':''} ${this.contradiction(a,i)?'wrong':''}" data-queen="${i}" style="${this.borderStyle(a,i)}" aria-label="Row ${Math.floor(i/n)+1}, column ${i%n+1}, region ${a.puzzle.regions[i]+1}, ${v===2?'queen':v===1?'marked impossible':'empty'}">${v===2?'♛':v===1?'×':''}</button>`).join('')}</div>`;const controls=`<div class="queen-pad"><button data-queen-value="x">× Mark</button><button data-queen-value="q">♛ Queen</button><button data-queen-value="clear">Clear</button><button data-queen-undo>Undo</button></div>${a.completed?resultPanel(a,this,`<div><strong>${n}</strong><span>Queens</span></div>`):''}`;main.innerHTML=baseGameShell(byId[this.id],a,board,controls);bindGameShell(this,a);this.bind(a);if(a.completed)bindResult(a,this);},
    bind(a){$$('[data-queen]').forEach(b=>b.onclick=()=>{a.state.selected=+b.dataset.queen;this.render(a)});$$('[data-queen-value]').forEach(b=>b.onclick=()=>this.enter(a,b.dataset.queenValue));$('[data-queen-undo]').onclick=()=>this.undo(a);window.onkeydown=e=>{const n=a.puzzle.size,s=a.state.selected;if(e.key.toLowerCase()==='q'||e.key==='Enter'){e.preventDefault();this.enter(a,'q');}else if(e.key.toLowerCase()==='x'||e.key===' '){e.preventDefault();this.enter(a,'x');}else if(e.key==='Backspace'||e.key==='Delete'){e.preventDefault();this.enter(a,'clear');}else if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();const r=Math.floor(s/n),c=s%n,nr=clamp(r+(e.key==='ArrowDown')-(e.key==='ArrowUp'),0,n-1),nc=clamp(c+(e.key==='ArrowRight')-(e.key==='ArrowLeft'),0,n-1);a.state.selected=nr*n+nc;this.render(a);}};},
    async enter(a,kind){const i=a.state.selected;if(a.completed)return;const next=kind==='q'?2:kind==='x'?1:0;if(a.state.cells[i]===next)return;a.state.history.push([i,a.state.cells[i]]);a.state.cells[i]=next;const qs=a.state.cells.map((v,i)=>v===2?i:-1).filter(i=>i>=0);if(qs.length===a.puzzle.size&&qs.every(i=>!this.contradiction(a,i))){await finishActive(a,{size:a.puzzle.size});}else await saveActive(a);this.render(a);},
    async undo(a){const h=a.state.history.pop();if(!h)return;a.state.cells[h[0]]=h[1];await saveActive(a);this.render(a);},
    hint(a){const d=queensProof(a);deliverProofHint(a,d);if(d?.index!=null)this.render(a);}
  };

  // ---------- Nonogram ----------
  function nonogramClues(bits){const out=[];let run=0;for(const b of bits){if(b)run++;else if(run){out.push(run);run=0;}}if(run)out.push(run);return out.length?out:[0];}
  const nonogramGame={
    id:'nonogram',name:'Nonogram',description:byId.nonogram.description,defaultDifficulty:'Medium',difficulties:['Easy','Medium','Hard'],
    rules:{objective:'Use the row and column clues to reveal the hidden pixel image.',items:['Each clue number describes a consecutive run of filled cells.','Multiple runs have at least one empty cell between them.','Mark known empty cells with X.','Fill every cell that belongs to the hidden image to finish.']},
    async create(seed,difficulty='Medium'){const r=rng(seed),set=NONOGRAM_PATTERNS[difficulty],entry=set[Math.floor(r()*set.length)],rows=entry[1],n=rows.length,solution=rows.flatMap(row=>[...row].map(x=>x==='1'));const rowClues=rows.map(row=>nonogramClues([...row].map(x=>x==='1'))),colClues=Array.from({length:n},(_,c)=>nonogramClues(rows.map(row=>row[c]==='1')));return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle:{name:entry[0],size:n,solution,rowClues,colClues},state:{cells:Array(n*n).fill(0),tool:1,history:[]}};},
    async save(a){return saveActive(a);},
    render(a){const n=a.puzzle.size,maxRow=Math.max(...a.puzzle.rowClues.map(x=>x.length)),maxCol=Math.max(...a.puzzle.colClues.map(x=>x.length));const clueHtml=cl=>cl.length===1&&cl[0]===0?'':cl.map(x=>`<span>${x}</span>`).join('');const cols=`<div class="nono-col-clues" style="grid-template-columns:repeat(${n},1fr)">${a.puzzle.colClues.map(cl=>`<div>${clueHtml(cl)}</div>`).join('')}</div>`;const rows=`<div class="nono-row-clues">${a.puzzle.rowClues.map(cl=>`<div>${clueHtml(cl)}</div>`).join('')}</div>`;const cells=`<div class="nonogram-board" style="grid-template-columns:repeat(${n},1fr)">${a.state.cells.map((v,i)=>`<button class="nono-cell ${v===1?'filled':v===2?'marked':''}" data-nono="${i}" aria-label="Row ${Math.floor(i/n)+1}, column ${i%n+1}, ${v===1?'filled':v===2?'marked empty':'unknown'}">${v===2?'×':''}</button>`).join('')}</div>`;const board=`<div class="nonogram-wrap"><div></div>${cols}${rows}${cells}</div>`;const controls=`<div class="nono-tools"><button class="${a.state.tool===1?'active':''}" data-nono-tool="1">Fill</button><button class="${a.state.tool===2?'active':''}" data-nono-tool="2">× Mark</button><button data-nono-undo>Undo</button></div>${a.completed?resultPanel(a,this,`<div><strong>${n}×${n}</strong><span>${esc(a.puzzle.name)}</span></div>`):''}`;main.innerHTML=baseGameShell(byId[this.id],a,board,controls);bindGameShell(this,a);this.bind(a);if(a.completed)bindResult(a,this);},
    bind(a){let dragging=false,painted=new Set(),changed=false;const apply=i=>{if(painted.has(i)||a.completed)return;painted.add(i);const old=a.state.cells[i],next=old===a.state.tool?0:a.state.tool;if(old===next)return;a.state.history.push([i,old]);a.state.cells[i]=next;changed=true;const el=$(`[data-nono="${i}"]`);if(el){el.classList.toggle('filled',next===1);el.classList.toggle('marked',next===2);el.textContent=next===2?'×':'';}};const end=async()=>{if(!dragging)return;dragging=false;painted.clear();if(!changed)return;changed=false;const ok=a.puzzle.solution.every((v,k)=>!v||a.state.cells[k]===1)&&a.state.cells.every((v,k)=>v!==1||a.puzzle.solution[k]);if(ok)await finishActive(a,{size:a.puzzle.size});else await saveActive(a);this.render(a);};$$('[data-nono]').forEach(b=>{const i=+b.dataset.nono;b.onpointerdown=e=>{e.preventDefault();dragging=true;painted=new Set();changed=false;apply(i);b.setPointerCapture?.(e.pointerId)};b.onpointerenter=()=>{if(dragging)apply(i)};});document.onpointerup=end;document.onpointercancel=end;$$('[data-nono-tool]').forEach(b=>b.onclick=()=>{a.state.tool=+b.dataset.nonoTool;this.render(a)});$('[data-nono-undo]').onclick=()=>this.undo(a);},
    async undo(a){const h=a.state.history.pop();if(!h)return;a.state.cells[h[0]]=h[1];await saveActive(a);this.render(a);},
    hint(a){const i=a.puzzle.solution.findIndex((v,k)=>v&&a.state.cells[k]!==1);if(i<0)return;const n=a.puzzle.size;toast(`Hint: row ${Math.floor(i/n)+1}, column ${i%n+1} is filled.`);}
  };

  // ---------- Kakuro ----------
  const KAKURO_BASES = [
    [[8,1,2],[6,3,1],[9,6,4]],
    [[2,1,4],[6,8,9],[1,3,7]],
  ];
  function transformSquareMatrix(matrix, transform){
    const n=matrix.length;
    const rot=(r,c,k)=>{ for(let i=0;i<k;i++) [r,c]=[c,n-1-r]; return [r,c]; };
    const out=Array.from({length:n},()=>Array(n).fill(0));
    for(let r=0;r<n;r++)for(let c=0;c<n;c++){
      let rr=r,cc=c;
      if(transform>=4) cc=n-1-cc;
      [rr,cc]=rot(rr,cc,transform%4);
      out[rr][cc]=matrix[r][c];
    }
    return out;
  }
  function kakuroValid(board,rowSums,colSums){
    for(let r=0;r<3;r++){
      const row=board.slice(r*3,r*3+3); if(row.some(v=>!v)||new Set(row).size!==3||row.reduce((a,b)=>a+b,0)!==rowSums[r]) return false;
    }
    for(let c=0;c<3;c++){
      const col=[board[c],board[3+c],board[6+c]]; if(col.some(v=>!v)||new Set(col).size!==3||col.reduce((a,b)=>a+b,0)!==colSums[c]) return false;
    }
    return true;
  }
  const kakuroGame={
    id:'kakuro',name:'Kakuro',description:byId.kakuro.description,defaultDifficulty:'Standard',difficulties:['Standard'],
    rules:{objective:'Fill the white cells so each run adds to its clue without repeating a digit.',items:['Use digits 1–9.','Digits may not repeat inside a horizontal or vertical run.','The arrow clue at the start of a row gives that row sum.','The arrow clue above a column gives that column sum.']},
    async create(seed,difficulty='Standard'){
      const r=rng(seed),base=KAKURO_BASES[Math.floor(r()*KAKURO_BASES.length)],matrix=transformSquareMatrix(base,Math.floor(r()*8));
      const solution=matrix.flat(),rowSums=matrix.map(row=>row.reduce((a,b)=>a+b,0)),colSums=Array.from({length:3},(_,c)=>matrix.reduce((s,row)=>s+row[c],0));
      return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle:{solution,rowSums,colSums},state:{board:Array(9).fill(0),selected:0,history:[]}};
    },
    async save(a){return saveActive(a);},
    render(a){
      let cells='<div class="kakuro-black"></div>';
      for(let c=0;c<3;c++) cells+=`<div class="kakuro-clue kakuro-clue--down"><span>↓</span><strong>${a.puzzle.colSums[c]}</strong></div>`;
      for(let r=0;r<3;r++){
        cells+=`<div class="kakuro-clue kakuro-clue--across"><span>→</span><strong>${a.puzzle.rowSums[r]}</strong></div>`;
        for(let c=0;c<3;c++){
          const i=r*3+c,v=a.state.board[i],wrong=state.settings.playMode==='challenge'&&v&&v!==a.puzzle.solution[i];
          cells+=`<button class="kakuro-cell ${i===a.state.selected?'selected':''} ${wrong?'wrong':''}" data-kakuro="${i}" aria-label="Row ${r+1}, column ${c+1}, ${v?`value ${v}`:'empty'}">${v||''}</button>`;
        }
      }
      const board=`<div class="kakuro-board">${cells}</div>`;
      const controls=`<div class="number-pad kakuro-pad">${[1,2,3,4,5,6,7,8,9].map(n=>`<button data-kakuro-num="${n}">${n}</button>`).join('')}<button data-kakuro-num="0">Clear</button><button data-kakuro-undo>Undo</button></div>${a.completed?resultPanel(a,this,`<div><strong>3×3</strong><span>Runs</span></div>`):''}`;
      main.innerHTML=baseGameShell(byId[this.id],a,board,controls);bindGameShell(this,a);this.bind(a);if(a.completed)bindResult(a,this);
    },
    bind(a){
      $$('[data-kakuro]').forEach(b=>b.onclick=()=>{a.state.selected=+b.dataset.kakuro;this.render(a)});
      $$('[data-kakuro-num]').forEach(b=>b.onclick=()=>this.enter(a,+b.dataset.kakuroNum));
      $('[data-kakuro-undo]').onclick=()=>this.undo(a);
      window.onkeydown=e=>{if(a.completed||overlayRoot.innerHTML)return;const i=a.state.selected,r=Math.floor(i/3),c=i%3;if(/^[1-9]$/.test(e.key)){e.preventDefault();this.enter(a,+e.key);}else if(e.key==='Backspace'||e.key==='Delete'){e.preventDefault();this.enter(a,0);}else if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();const nr=clamp(r+(e.key==='ArrowDown')-(e.key==='ArrowUp'),0,2),nc=clamp(c+(e.key==='ArrowRight')-(e.key==='ArrowLeft'),0,2);a.state.selected=nr*3+nc;this.render(a);}};
    },
    async enter(a,n){if(a.completed)return;const i=a.state.selected,old=a.state.board[i];if(old===n)return;a.state.history.push([i,old]);a.state.board[i]=n;if(kakuroValid(a.state.board,a.puzzle.rowSums,a.puzzle.colSums)){await finishActive(a,{size:'3x3'});}else await saveActive(a);this.render(a);},
    async undo(a){const h=a.state.history.pop();if(!h)return;a.state.board[h[0]]=h[1];await saveActive(a);this.render(a);},
    hint(a){const d=kakuroProof(a);deliverProofHint(a,d);if(d?.index!=null)this.render(a);}
  };

  // ---------- Loop ----------
  function loopSolutionFromRegion(region,h,w){
    const horiz=Array((h+1)*w).fill(false),vert=Array(h*(w+1)).fill(false);
    const inside=(r,c)=>r>=0&&r<h&&c>=0&&c<w&&region[r*w+c];
    for(let r=0;r<h;r++)for(let c=0;c<w;c++)if(region[r*w+c]){
      if(!inside(r-1,c))horiz[r*w+c]=true;
      if(!inside(r+1,c))horiz[(r+1)*w+c]=true;
      if(!inside(r,c-1))vert[r*(w+1)+c]=true;
      if(!inside(r,c+1))vert[r*(w+1)+c+1]=true;
    }
    const V=(h+1)*(w+1),adj=Array.from({length:V},()=>[]),deg=Array(V).fill(0);let edgeCount=0;
    const add=(a,b)=>{adj[a].push(b);adj[b].push(a);deg[a]++;deg[b]++;edgeCount++;};
    for(let r=0;r<=h;r++)for(let c=0;c<w;c++)if(horiz[r*w+c])add(r*(w+1)+c,r*(w+1)+c+1);
    for(let r=0;r<h;r++)for(let c=0;c<=w;c++)if(vert[r*(w+1)+c])add(r*(w+1)+c,(r+1)*(w+1)+c);
    const used=deg.map((d,i)=>d?i:-1).filter(i=>i>=0); if(!edgeCount||used.some(i=>deg[i]!==2))return null;
    const seen=new Set([used[0]]),stack=[used[0]];while(stack.length){const v=stack.pop();for(const n of adj[v])if(!seen.has(n)){seen.add(n);stack.push(n);}}
    if(seen.size!==used.length)return null;
    const clues=Array(h*w).fill(0);
    for(let r=0;r<h;r++)for(let c=0;c<w;c++)clues[r*w+c]=+(horiz[r*w+c])+ +(horiz[(r+1)*w+c])+ +(vert[r*(w+1)+c])+ +(vert[r*(w+1)+c+1]);
    return {horiz,vert,clues};
  }
  function loopDifficultyProfile(p){const counts=[0,0,0,0,0];for(const c of p.clues)counts[c]=(counts[c]||0)+1;const edgeCount=p.horiz.filter(Boolean).length+p.vert.filter(Boolean).length,strong=counts[0]+counts[3]+(counts[4]||0),ambiguous=counts[2],cells=p.rows*p.cols,strongRatio=strong/cells,ambiguousRatio=ambiguous/cells,edgeDensity=edgeCount/cells,score=p.rows*12+ambiguousRatio*18-strongRatio*8+edgeDensity*4;return {score,clueCounts:counts,edgeCount,strongClues:strong};}
  function generateLoopPuzzle(seed,difficulty){
    const sizes={Easy:4,Medium:5,Hard:6},n=sizes[difficulty]||5,r=rng(seed);
    for(let attempt=0;attempt<120;attempt++){
      const region=Array(n*n).fill(false),target=Math.max(4,Math.round(n*n*(difficulty==='Easy'?.42:difficulty==='Hard'?.62:.52)));
      const start=Math.floor(r()*n*n);region[start]=true;
      for(let count=1;count<target;count++){
        const frontier=[];
        for(let i=0;i<n*n;i++)if(!region[i]){const rr=Math.floor(i/n),cc=i%n;if([[rr-1,cc],[rr+1,cc],[rr,cc-1],[rr,cc+1]].some(([a,b])=>a>=0&&a<n&&b>=0&&b<n&&region[a*n+b]))frontier.push(i);}
        if(!frontier.length)break;region[frontier[Math.floor(r()*frontier.length)]]=true;
      }
      const sol=loopSolutionFromRegion(region,n,n);if(sol){const p={rows:n,cols:n,...sol};const m=loopDifficultyProfile(p);return {...p,difficultyScore:+m.score.toFixed(2),difficultyMetrics:{clueCounts:m.clueCounts,edgeCount:m.edgeCount,strongClues:m.strongClues},generatorVersion:3};}
    }
    const region=Array(n*n).fill(false);for(let rr=1;rr<n-1;rr++)for(let c=1;c<n-1;c++)region[rr*n+c]=true;
    const p={rows:n,cols:n,...loopSolutionFromRegion(region,n,n)},m=loopDifficultyProfile(p);return {...p,difficultyScore:+m.score.toFixed(2),difficultyMetrics:{clueCounts:m.clueCounts,edgeCount:m.edgeCount,strongClues:m.strongClues},generatorVersion:3};
  }
  function loopValidate(puzzle,state){
    const {rows:h,cols:w,clues}=puzzle,H=state.h,V=state.v;
    for(let r=0;r<h;r++)for(let c=0;c<w;c++){
      const count=(H[r*w+c]===1)+(H[(r+1)*w+c]===1)+(V[r*(w+1)+c]===1)+(V[r*(w+1)+c+1]===1);if(count!==clues[r*w+c])return false;
    }
    const vn=(h+1)*(w+1),adj=Array.from({length:vn},()=>[]),deg=Array(vn).fill(0);let ec=0;
    const add=(a,b)=>{adj[a].push(b);adj[b].push(a);deg[a]++;deg[b]++;ec++;};
    for(let r=0;r<=h;r++)for(let c=0;c<w;c++)if(H[r*w+c]===1)add(r*(w+1)+c,r*(w+1)+c+1);
    for(let r=0;r<h;r++)for(let c=0;c<=w;c++)if(V[r*(w+1)+c]===1)add(r*(w+1)+c,(r+1)*(w+1)+c);
    const used=deg.map((d,i)=>d?i:-1).filter(i=>i>=0);if(!ec||used.some(i=>deg[i]!==2))return false;
    const seen=new Set([used[0]]),stack=[used[0]];while(stack.length){const x=stack.pop();for(const y of adj[x])if(!seen.has(y)){seen.add(y);stack.push(y);}}
    return seen.size===used.length;
  }
  const loopGame={
    id:'loop',name:'Loop',generatorVersion:3,description:byId.loop.description,defaultDifficulty:'Medium',difficulties:['Easy','Medium','Hard'],
    rules:{objective:'Draw one single closed loop along the grid edges while satisfying every number clue.',items:['A clue tells how many of its four surrounding edges belong to the loop.','The loop may not branch.','The finished lines must form exactly one closed loop.','Mark unused edges with × when helpful.']},
    async create(seed,difficulty='Medium'){const puzzle=generateLoopPuzzle(seed,difficulty);return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle,state:{h:Array(puzzle.horiz.length).fill(0),v:Array(puzzle.vert.length).fill(0),history:[]}};},
    async save(a){return saveActive(a);},
    render(a){
      const h=a.puzzle.rows,w=a.puzzle.cols,items=[];
      for(let rr=0;rr<2*h+1;rr++)for(let cc=0;cc<2*w+1;cc++){
        if(rr%2===0&&cc%2===0)items.push('<span class="loop-vertex"></span>');
        else if(rr%2===0){const r=rr/2,c=(cc-1)/2,i=r*w+c,v=a.state.h[i];items.push(`<button class="loop-edge loop-edge--h ${v===1?'line':v===2?'blocked':''}" data-loop-edge="h:${i}" aria-label="Horizontal edge row ${r+1}, column ${c+1}, ${v===1?'line':v===2?'blocked':'unknown'}">${v===2?'×':''}</button>`);}
        else if(cc%2===0){const r=(rr-1)/2,c=cc/2,i=r*(w+1)+c,v=a.state.v[i];items.push(`<button class="loop-edge loop-edge--v ${v===1?'line':v===2?'blocked':''}" data-loop-edge="v:${i}" aria-label="Vertical edge row ${r+1}, column ${c+1}, ${v===1?'line':v===2?'blocked':'unknown'}">${v===2?'×':''}</button>`);}
        else {const r=(rr-1)/2,c=(cc-1)/2;items.push(`<span class="loop-clue">${a.puzzle.clues[r*w+c]}</span>`);}
      }
      const colTemplate=Array.from({length:2*w+1},(_,i)=>i%2?'minmax(32px,1fr)':'24px').join(' '),rowTemplate=Array.from({length:2*h+1},(_,i)=>i%2?'minmax(32px,1fr)':'24px').join(' ');const board=`<div class="loop-board" style="grid-template-columns:${colTemplate};grid-template-rows:${rowTemplate}">${items.join('')}</div>`;
      const controls=`<div class="toolbar"><button data-loop-undo>Undo</button></div>${a.completed?resultPanel(a,this,`<div><strong>${w}×${h}</strong><span>Grid</span></div>`):''}`;
      main.innerHTML=baseGameShell(byId[this.id],a,board,controls);bindGameShell(this,a);this.bind(a);if(a.completed)bindResult(a,this);
    },
    bind(a){
      let dragging=false,target=1,visited=new Set(),changed=false;
      const apply=el=>{if(!el||visited.has(el.dataset.loopEdge)||a.completed)return;visited.add(el.dataset.loopEdge);const [t,s]=el.dataset.loopEdge.split(':'),i=+s,arr=t==='h'?a.state.h:a.state.v,old=arr[i];if(old===target)return;a.state.history.push([t,i,old]);arr[i]=target;changed=true;};
      const end=async()=>{if(!dragging)return;dragging=false;visited.clear();if(!changed)return;changed=false;if(loopValidate(a.puzzle,a.state))await finishActive(a,{size:`${a.puzzle.cols}x${a.puzzle.rows}`});else await saveActive(a);this.render(a);};
      $$('[data-loop-edge]').forEach(el=>{el.onpointerdown=e=>{e.preventDefault();const [t,s]=el.dataset.loopEdge.split(':'),arr=t==='h'?a.state.h:a.state.v,old=arr[+s];target=old===0?1:old===1?2:0;dragging=true;visited=new Set();changed=false;apply(el);};el.onpointerenter=()=>{if(dragging)apply(el)};});
      document.onpointerup=end;document.onpointercancel=end;$('[data-loop-undo]').onclick=()=>this.undo(a);
    },
    async undo(a){const h=a.state.history.pop();if(!h)return;const arr=h[0]==='h'?a.state.h:a.state.v;arr[h[1]]=h[2];await saveActive(a);this.render(a);},
    hint(a){deliverProofHint(a,loopProof(a));}
  };

  // ---------- Bridges ----------
  function bridgeVisibilityEdges(nodes){
    const rows=new Map(),cols=new Map();
    nodes.forEach((node,i)=>{if(!rows.has(node.r))rows.set(node.r,[]);rows.get(node.r).push([node.c,i]);if(!cols.has(node.c))cols.set(node.c,[]);cols.get(node.c).push([node.r,i]);});
    const edges=[];
    for(const arr of rows.values()){arr.sort((a,b)=>a[0]-b[0]);for(let i=0;i<arr.length-1;i++)edges.push({a:arr[i][1],b:arr[i+1][1],orientation:'h'});}
    for(const arr of cols.values()){arr.sort((a,b)=>a[0]-b[0]);for(let i=0;i<arr.length-1;i++)edges.push({a:arr[i][1],b:arr[i+1][1],orientation:'v'});}
    return edges;
  }
  function bridgeEdgesCross(nodes,e1,e2){
    if(e1.orientation===e2.orientation||e1.a===e2.a||e1.a===e2.b||e1.b===e2.a||e1.b===e2.b)return false;
    let h=e1,v=e2;if(h.orientation==='v')[h,v]=[v,h];
    const A=nodes[h.a],B=nodes[h.b],C=nodes[v.a],D=nodes[v.b],minC=Math.min(A.c,B.c),maxC=Math.max(A.c,B.c),minR=Math.min(C.r,D.r),maxR=Math.max(C.r,D.r);
    return C.c>minC&&C.c<maxC&&A.r>minR&&A.r<maxR;
  }
  function bridgeGrowNodes(boardSize,count,r){
    const set=new Set([`${Math.floor(r()*boardSize)},${Math.floor(r()*boardSize)}`]);
    while(set.size<count){
      const candidates=[];
      for(const key of set){const [rr,c]=key.split(',').map(Number);for(const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]]){const r2=rr+dr,c2=c+dc,k=`${r2},${c2}`;if(r2>=0&&r2<boardSize&&c2>=0&&c2<boardSize&&!set.has(k))candidates.push(k);}}
      if(!candidates.length)break;set.add(pick(candidates,r));
    }
    return [...set].map(k=>{const [rr,c]=k.split(',').map(Number);return {r:rr,c};}).sort((a,b)=>a.r-b.r||a.c-b.c).map((x,id)=>({...x,id}));
  }
  function countBridgeSolutions(puzzle,limit=2){
    const {nodes,edges,clues}=puzzle,m=edges.length,inc=Array.from({length:nodes.length},()=>[]),cross=Array.from({length:m},()=>[]);
    edges.forEach((e,i)=>{inc[e.a].push(i);inc[e.b].push(i);});
    for(let i=0;i<m;i++)for(let j=i+1;j<m;j++)if(bridgeEdgesCross(nodes,edges[i],edges[j])){cross[i].push(j);cross[j].push(i);}
    const vals=Array(m).fill(-1),rem=[...clues];let count=0;
    const domain=ei=>{if(cross[ei].some(j=>vals[j]>0))return [0];const e=edges[ei],max=Math.min(2,rem[e.a],rem[e.b]);return max<0?[]:Array.from({length:max+1},(_,i)=>i);};
    function rec(){
      if(count>=limit)return;
      let best=-1,bestDomain=null,bestScore=Infinity;
      for(let node=0;node<nodes.length;node++){
        let min=0,max=0;
        for(const ei of inc[node])if(vals[ei]<0){const d=domain(ei);if(!d.length)return;min+=d[0];max+=d[d.length-1];}
        if(rem[node]<min||rem[node]>max)return;
      }
      for(let ei=0;ei<m;ei++)if(vals[ei]<0){const d=domain(ei);if(!d.length)return;const e=edges[ei],score=d.length*100+rem[e.a]+rem[e.b];if(score<bestScore){best=ei;bestDomain=d;bestScore=score;if(d.length===1)break;}}
      if(best<0){
        if(rem.some(x=>x!==0))return;
        const adj=Array.from({length:nodes.length},()=>[]);edges.forEach((e,i)=>{if(vals[i]>0){adj[e.a].push(e.b);adj[e.b].push(e.a);}});
        const seen=new Set([0]),stack=[0];while(stack.length){const x=stack.pop();for(const y of adj[x])if(!seen.has(y)){seen.add(y);stack.push(y);}}
        if(seen.size===nodes.length)count++;return;
      }
      const e=edges[best];
      for(const v of bestDomain){vals[best]=v;rem[e.a]-=v;rem[e.b]-=v;rec();rem[e.a]+=v;rem[e.b]+=v;vals[best]=-1;if(count>=limit)return;}
    }
    rec();return count;
  }
  function generateBridgesPuzzle(seed,difficulty){
    const cfg={Easy:[7,8,.10],Medium:[8,12,.14],Hard:[9,16,.18]}[difficulty]||[8,12,.14];
    for(let attempt=0;attempt<800;attempt++){
      const r=rng(`${seed}:bridges:v2:${attempt}`),boardSize=cfg[0],nodes=bridgeGrowNodes(boardSize,cfg[1],r);if(nodes.length!==cfg[1])continue;
      const edges=bridgeVisibilityEdges(nodes),parent=Array.from({length:nodes.length},(_,i)=>i),find=x=>parent[x]===x?x:(parent[x]=find(parent[x])),union=(a,b)=>{a=find(a);b=find(b);if(a===b)return false;parent[b]=a;return true;},solution=Array(edges.length).fill(0);
      const unit=shuffle(edges.map((e,i)=>[e,i]).filter(([e])=>Math.abs(nodes[e.a].r-nodes[e.b].r)+Math.abs(nodes[e.a].c-nodes[e.b].c)===1).map(x=>x[1]),r);
      for(const ei of unit){const e=edges[ei];if(union(e.a,e.b))solution[ei]=r()<(difficulty==='Hard'?.24:.15)?2:1;}
      if(new Set(nodes.map((_,i)=>find(i))).size!==1)continue;
      for(const ei of shuffle(edges.map((_,i)=>i),r)){if(solution[ei]||r()>cfg[2])continue;if(edges.some((_,j)=>solution[j]>0&&bridgeEdgesCross(nodes,edges[ei],edges[j])))continue;solution[ei]=r()<.22?2:1;}
      const clues=Array(nodes.length).fill(0);edges.forEach((e,i)=>{clues[e.a]+=solution[i];clues[e.b]+=solution[i];});
      const puzzle={size:boardSize,nodes,edges,solution,clues};if(countBridgeSolutions(puzzle,2)===1)return {...puzzle,certifiedUnique:true,generatorVersion:2};
    }
    throw new Error('Bridges generation failed uniqueness certification');
  }
  function bridgeDegrees(puzzle,counts){const d=Array(puzzle.nodes.length).fill(0);puzzle.edges.forEach((e,i)=>{d[e.a]+=counts[i];d[e.b]+=counts[i];});return d;}
  function bridgesComplete(puzzle,counts){
    if(!Array.isArray(counts)||counts.length!==puzzle.edges.length||!counts.every(v=>Number.isInteger(v)&&v>=0&&v<=2))return false;
    const deg=bridgeDegrees(puzzle,counts);if(deg.some((d,i)=>d!==puzzle.clues[i]))return false;
    for(let i=0;i<puzzle.edges.length;i++)if(counts[i]>0)for(let j=i+1;j<puzzle.edges.length;j++)if(counts[j]>0&&bridgeEdgesCross(puzzle.nodes,puzzle.edges[i],puzzle.edges[j]))return false;
    const adj=Array.from({length:puzzle.nodes.length},()=>[]);puzzle.edges.forEach((e,i)=>{if(counts[i]>0){adj[e.a].push(e.b);adj[e.b].push(e.a);}});
    const seen=new Set([0]),stack=[0];while(stack.length){const x=stack.pop();for(const y of adj[x])if(!seen.has(y)){seen.add(y);stack.push(y);}}return seen.size===puzzle.nodes.length;
  }
  const bridgesGame={
    id:'bridges',name:'Bridges',generatorVersion:2,description:byId.bridges.description,defaultDifficulty:'Medium',difficulties:['Easy','Medium','Hard'],
    rules:{objective:'Connect all numbered islands into one network using horizontal and vertical bridges.',items:['An island must have exactly the number of bridges printed on it.','A pair of visible islands may have zero, one, or two bridges.','All islands must belong to one connected network.','Bridges may not cross or pass through another island.']},
    async create(seed,difficulty='Medium'){const puzzle=generateBridgesPuzzle(seed,difficulty);return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle,state:{counts:Array(puzzle.edges.length).fill(0),history:[]}};},
    async save(a){return saveActive(a);},
    render(a){
      const size=a.puzzle.size,deg=bridgeDegrees(a.puzzle,a.state.counts),edgeSvg=a.puzzle.edges.map((e,i)=>{const A=a.puzzle.nodes[e.a],B=a.puzzle.nodes[e.b],x1=A.c+.5,y1=A.r+.5,x2=B.c+.5,y2=B.r+.5,count=a.state.counts[i],horizontal=A.r===B.r;let visible='';if(count===1)visible=`<line class="bridge-line" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;if(count===2){const o=.08;visible=horizontal?`<line class="bridge-line" x1="${x1}" y1="${y1-o}" x2="${x2}" y2="${y2-o}"/><line class="bridge-line" x1="${x1}" y1="${y1+o}" x2="${x2}" y2="${y2+o}"/>`:`<line class="bridge-line" x1="${x1-o}" y1="${y1}" x2="${x2-o}" y2="${y2}"/><line class="bridge-line" x1="${x1+o}" y1="${y1}" x2="${x2+o}" y2="${y2}"/>`;}
        return `<g class="bridge-edge" data-bridge="${i}" tabindex="0" role="button" aria-label="Bridge between island ${e.a+1} and ${e.b+1}, ${count} bridge${count===1?'':'s'}"><line class="bridge-guide" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>${visible}<line class="bridge-hit" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/></g>`;}).join('');
      const nodeSvg=a.puzzle.nodes.map((node,i)=>`<g class="bridge-island ${deg[i]===a.puzzle.clues[i]?'satisfied':''}"><circle cx="${node.c+.5}" cy="${node.r+.5}" r=".28"/><text x="${node.c+.5}" y="${node.r+.5}" text-anchor="middle" dominant-baseline="central">${a.puzzle.clues[i]}</text></g>`).join('');
      const board=`<svg class="bridges-board" viewBox="0 0 ${size} ${size}" aria-label="Bridges puzzle">${edgeSvg}${nodeSvg}</svg>`,controls=`<div class="toolbar"><button data-bridges-undo>Undo</button></div>${a.completed?resultPanel(a,this,`<div><strong>${a.puzzle.nodes.length}</strong><span>Islands</span></div>`):''}`;
      main.innerHTML=baseGameShell(byId[this.id],a,board,controls);bindGameShell(this,a);this.bind(a);if(a.completed)bindResult(a,this);
    },
    bind(a){$$('[data-bridge]').forEach(el=>{const act=()=>this.cycle(a,+el.dataset.bridge);el.onclick=act;el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();act();}}});$('[data-bridges-undo]').onclick=()=>this.undo(a);},
    async cycle(a,i){if(a.completed)return;const old=a.state.counts[i],next=(old+1)%3;a.state.history.push([i,old]);a.state.counts[i]=next;if(bridgesComplete(a.puzzle,a.state.counts))await finishActive(a,{islands:a.puzzle.nodes.length});else await saveActive(a);this.render(a);},
    async undo(a){const h=a.state.history.pop();if(!h)return;a.state.counts[h[0]]=h[1];await saveActive(a);this.render(a);},
    hint(a){deliverProofHint(a,bridgesProof(a));}
  };

  // ---------- Number Path ----------
  function rowSnakePath(n){const out=[];for(let r=0;r<n;r++){const cols=Array.from({length:n},(_,i)=>r%2?n-1-i:i);for(const c of cols)out.push([r,c]);}return out;}
  function colSnakePath(n){return rowSnakePath(n).map(([r,c])=>[c,r]);}
  function spiralPath(n){const out=[];let top=0,bottom=n-1,left=0,right=n-1;while(top<=bottom&&left<=right){for(let c=left;c<=right;c++)out.push([top,c]);top++;for(let r=top;r<=bottom;r++)out.push([r,right]);right--;if(top<=bottom){for(let c=right;c>=left;c--)out.push([bottom,c]);bottom--;}if(left<=right){for(let r=bottom;r>=top;r--)out.push([r,left]);left++;}}return out;}
  function transformPath(path,n,t){return path.map(([r,c])=>{if(t>=4)c=n-1-c;for(let i=0;i<t%4;i++)[r,c]=[c,n-1-r];return [r,c];});}
  function numberPathCheckpoints(path,n,positions){const checkpoints={};positions.forEach((p,i)=>{const [rr,c]=path[p];checkpoints[rr*n+c]=i+1;});return checkpoints;}
  function countNumberPathSolutions(puzzle,limit=2,nodeLimit=50000){
    const n=puzzle.size,total=n*n,visited=Array(total).fill(false),neighbors=Array.from({length:total},(_,i)=>rcNeighbors(i,n)),start=puzzle.start,end=puzzle.end;visited[start]=true;let count=0,nodes=0,aborted=false;
    const remainingConnected=cur=>{const targets=[];for(let i=0;i<total;i++)if(!visited[i])targets.push(i);if(!targets.length)return true;const seen=new Set([cur]),q=[cur];while(q.length){const x=q.pop();for(const y of neighbors[x])if((y===cur||!visited[y])&&!seen.has(y)){seen.add(y);q.push(y);}}return targets.every(i=>seen.has(i));};
    function rec(cur,depth,nextCp){
      if(count>=limit||aborted)return;if(++nodes>nodeLimit){aborted=true;return;}if(cur===end&&depth<total)return;
      if(depth===total){if(cur===end&&nextCp===puzzle.checkpointCount+1)count++;return;}
      if(depth%3===0&&!remainingConnected(cur))return;
      for(let i=0;i<total;i++)if(!visited[i]){let degree=0;for(const y of neighbors[i])if(!visited[y]||y===cur)degree++;if(i===end?degree<1:degree<2)return;}
      const opts=[];for(const y of neighbors[cur]){if(visited[y])continue;const cp=puzzle.checkpoints[y];if(cp&&cp!==nextCp)continue;if(y===end&&depth+1!==total)continue;opts.push(y);}opts.sort((a,b)=>neighbors[a].filter(x=>!visited[x]).length-neighbors[b].filter(x=>!visited[x]).length);
      for(const y of opts){const cp=puzzle.checkpoints[y];visited[y]=true;rec(y,depth+1,nextCp+(cp?1:0));visited[y]=false;if(count>=limit||aborted)return;}
    }
    rec(start,1,2);return {count,complete:!aborted,nodes};
  }
  function generateNumberPath(seed,difficulty){
    const sizes={Easy:5,Medium:6,Hard:7},initialCounts={Easy:9,Medium:7,Hard:5},n=sizes[difficulty]||6,r=rng(`${seed}:number-path:v3`),bases=[rowSnakePath(n),colSnakePath(n),spiralPath(n)],path=transformPath(bases[Math.floor(r()*bases.length)],n,Math.floor(r()*8)),L=path.length,k=initialCounts[difficulty]||7;
    const positions=[0];for(let i=1;i<k-1;i++){const ideal=i*(L-1)/(k-1),jitter=Math.floor(r()*5)-2,min=positions[positions.length-1]+2,max=L-2-(k-2-i)*2;positions.push(clamp(Math.round(ideal+jitter),min,max));}positions.push(L-1);
    positions.sort((a,b)=>a-b);
    for(let guard=0;guard<L;guard++){
      const checkpoints=numberPathCheckpoints(path,n,positions),puzzle={size:n,solution:path.map(([rr,c])=>rr*n+c),checkpoints,checkpointCount:positions.length,start:path[0][0]*n+path[0][1],end:path[L-1][0]*n+path[L-1][1]};
      const cert=countNumberPathSolutions(puzzle,2,50000);if(cert.complete&&cert.count===1){const gaps=positions.slice(1).map((x,i)=>x-positions[i]),maxGap=Math.max(...gaps),avgGap=gaps.reduce((x,y)=>x+y,0)/gaps.length,score=n*30+Math.log10(cert.nodes+1)*9+maxGap*1.25-positions.length*.25;return {...puzzle,certifiedUnique:true,generatorVersion:3,difficultyScore:+score.toFixed(2),difficultyMetrics:{solverNodes:cert.nodes,checkpoints:positions.length,maxGap,avgGap:+avgGap.toFixed(2)}};}
      const gaps=[];for(let i=0;i<positions.length-1;i++){const gap=positions[i+1]-positions[i];if(gap>1)gaps.push({gap,pos:Math.floor((positions[i]+positions[i+1])/2)});}gaps.sort((a,b)=>b.gap-a.gap);
      const addTarget=cert.complete?1:Math.min(3,gaps.length);let added=0;for(const g of gaps){if(!positions.includes(g.pos)){positions.push(g.pos);added++;if(added>=addTarget)break;}}
      if(!added)break;positions.sort((a,b)=>a-b);
    }
    throw new Error('Number Path generation failed uniqueness certification');
  }
  function pathLegalNeighbor(a,i){const n=a.puzzle.size,path=a.state.path,end=path[path.length-1],r=Math.floor(end/n),c=end%n,rr=Math.floor(i/n),cc=i%n;if(Math.abs(r-rr)+Math.abs(c-cc)!==1)return false;if(path.includes(i))return true;const cp=a.puzzle.checkpoints[i],visited=path.map(x=>a.puzzle.checkpoints[x]).filter(Boolean),next=(visited.length?Math.max(...visited):0)+1;if(cp&&cp!==next)return false;if(cp===a.puzzle.checkpointCount&&path.length+1!==n*n)return false;return true;}
  function numberPathComplete(a){if(!Array.isArray(a.state.path)||!a.state.path.every(i=>Number.isInteger(i)&&i>=0&&i<a.puzzle.size*a.puzzle.size)||a.state.path[0]!==a.puzzle.start)return false;const n=a.puzzle.size,path=a.state.path;if(path.length!==n*n||path[path.length-1]!==a.puzzle.end||new Set(path).size!==path.length)return false;let next=1;for(let k=0;k<path.length;k++){if(k&&Math.abs(Math.floor(path[k]/n)-Math.floor(path[k-1]/n))+Math.abs(path[k]%n-path[k-1]%n)!==1)return false;const cp=a.puzzle.checkpoints[path[k]];if(cp){if(cp!==next)return false;next++;}}return next===a.puzzle.checkpointCount+1;}
  const numberPathGame={
    id:'number-path',name:'Number Path',generatorVersion:3,description:byId['number-path'].description,defaultDifficulty:'Medium',difficulties:['Easy','Medium','Hard'],
    rules:{objective:'Draw one continuous path through every cell while visiting numbered checkpoints in order.',items:['Move only horizontally or vertically.','Every cell must be visited exactly once.','Numbered checkpoints must be visited in increasing order.','Every generated puzzle is uniqueness-certified; drag backward along your path to erase mistakes.']},
    async create(seed,difficulty='Medium'){const puzzle=generateNumberPath(seed,difficulty);return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle,state:{path:[puzzle.start],history:[]}};},
    async save(a){return saveActive(a);},
    render(a){const n=a.puzzle.size,pathSet=new Set(a.state.path),end=a.state.path[a.state.path.length-1];const board=`<div class="number-path-board" style="grid-template-columns:repeat(${n},1fr)">${Array.from({length:n*n},(_,i)=>{const cp=a.puzzle.checkpoints[i];return `<button class="number-path-cell ${pathSet.has(i)?'in-path':''} ${i===end?'endpoint':''} ${cp?'checkpoint':''}" data-path-cell="${i}" aria-label="Row ${Math.floor(i/n)+1}, column ${i%n+1}${cp?`, checkpoint ${cp}`:''}${pathSet.has(i)?', on path':''}">${cp?`<strong>${cp}</strong>`:''}</button>`}).join('')}</div>`;const controls=`<div class="path-status"><span>${a.state.path.length} / ${n*n} cells</span><button data-path-undo>Undo</button></div>${a.completed?resultPanel(a,this,`<div><strong>${n}×${n}</strong><span>Grid</span></div>`):''}`;main.innerHTML=baseGameShell(byId[this.id],a,board,controls);bindGameShell(this,a);this.bind(a);if(a.completed)bindResult(a,this);},
    bind(a){
      let dragging=false,startSnapshot=null,changed=false,activePointer=null;
      const sync=()=>{const set=new Set(a.state.path),end=a.state.path[a.state.path.length-1];$$('[data-path-cell]').forEach(el=>{const i=+el.dataset.pathCell;el.classList.toggle('in-path',set.has(i));el.classList.toggle('endpoint',i===end);});const s=$('.path-status span');if(s)s.textContent=`${a.state.path.length} / ${a.puzzle.size*a.puzzle.size} cells`;};
      const apply=i=>{if(a.completed)return false;const path=a.state.path,existing=path.indexOf(i);if(existing===path.length-1)return false;if(existing>=0){path.splice(existing+1);changed=true;sync();return true;}if(!pathLegalNeighbor(a,i))return false;path.push(i);changed=true;sync();return true;};
      $$('[data-path-cell]').forEach(el=>el.onpointerdown=e=>{if(a.completed)return;e.preventDefault();dragging=true;activePointer=e.pointerId;startSnapshot=[...a.state.path];changed=false;apply(+el.dataset.pathCell);});
      document.onpointermove=e=>{if(!dragging||e.pointerId!==activePointer)return;const el=document.elementFromPoint(e.clientX,e.clientY)?.closest?.('[data-path-cell]');if(el)apply(+el.dataset.pathCell);};
      const end=async e=>{if(!dragging||(e?.pointerId!==undefined&&e.pointerId!==activePointer))return;dragging=false;activePointer=null;if(!changed)return;if(startSnapshot)a.state.history.push(startSnapshot);if(numberPathComplete(a))await finishActive(a,{size:a.puzzle.size,checkpoints:a.puzzle.checkpointCount});else await saveActive(a);this.render(a);};document.onpointerup=end;const cancel=()=>{if(dragging&&startSnapshot){a.state.path=startSnapshot;dragging=false;activePointer=null;changed=false;}};pointerCleanup=cancel;document.onpointercancel=()=>{cancel();this.render(a);};$$('[data-path-cell]').forEach(el=>el.onclick=e=>{if(e.detail===0&&!a.completed){startSnapshot=[...a.state.path];dragging=true;activePointer=null;changed=false;apply(+el.dataset.pathCell);end();}});
      $('[data-path-undo]').onclick=()=>this.undo(a);
      window.onkeydown=e=>{if(a.completed||overlayRoot.innerHTML)return;const n=a.puzzle.size,endCell=a.state.path[a.state.path.length-1],r=Math.floor(endCell/n),c=endCell%n;if(e.key==='Backspace'||e.key==='Delete'){e.preventDefault();this.back(a);return;}const delta={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]}[e.key];if(!delta)return;e.preventDefault();const rr=r+delta[0],cc=c+delta[1];if(rr<0||rr>=n||cc<0||cc>=n)return;const before=[...a.state.path];if(apply(rr*n+cc)){a.state.history.push(before);if(numberPathComplete(a))finishActive(a,{size:n,checkpoints:a.puzzle.checkpointCount}).then(()=>this.render(a));else saveActive(a).then(()=>this.render(a));}};
    },
    async back(a){if(a.state.path.length<=1)return;a.state.history.push([...a.state.path]);a.state.path.pop();await saveActive(a);this.render(a);},
    async undo(a){const prev=a.state.history.pop();if(!prev)return;a.state.path=[...prev];await saveActive(a);this.render(a);},
    hint(a){const n=a.puzzle.size,end=a.state.path[a.state.path.length-1],r=Math.floor(end/n),c=end%n,candidates=[[r-1,c],[r+1,c],[r,c-1],[r,c+1]].filter(([rr,cc])=>rr>=0&&rr<n&&cc>=0&&cc<n).map(([rr,cc])=>rr*n+cc).filter(i=>pathLegalNeighbor(a,i)&&!a.state.path.includes(i));if(candidates.length===1){const i=candidates[0];toast(`Hint: only row ${Math.floor(i/n)+1}, column ${i%n+1} can extend the path from here.`);}else toast(`Hint: ${candidates.length} legal extensions remain from the current endpoint. Avoid cutting off unvisited cells.`);}
  };

  const LIGHT_UP_TEMPLATES={"Easy":[{"n":7,"walls":[3,11,14,15,17,22,26,31,32,34,36,37,40,41,44,47],"clues":{"17":0,"22":1,"32":1,"26":2,"31":1,"37":1,"11":1,"15":0,"3":1},"solution":[1,4,7,13,19,23,28,33,38,43,46,48]},{"n":7,"walls":[3,5,10,11,13,15,16,19,22,24,26,29,33,35,39],"clues":{"39":1,"15":1,"24":0,"16":0,"22":0,"10":0,"33":0,"29":0,"11":3},"solution":[0,4,6,8,12,18,38,41,44]},{"n":7,"walls":[2,12,14,18,20,21,27,30,36,39,40,42,43],"clues":{"12":3,"36":0,"2":0,"20":2,"27":1,"30":0,"14":2,"39":0},"solution":[5,7,13,15,19,24,28,34,44]},{"n":7,"walls":[2,3,4,13,14,18,28,30,31,35,36,41,42],"clues":{"30":1,"13":1,"31":0,"14":0,"18":1,"4":0,"41":1,"36":0,"2":0},"solution":[0,6,8,17,23,34,39,47]},{"n":7,"walls":[0,1,11,13,14,33,35,38,42,47],"clues":{"35":0,"33":1,"38":1,"42":0,"13":2,"11":0},"solution":[6,7,20,26,29,39,44]},{"n":7,"walls":[2,5,7,10,12,15,16,27,28,34,38,39,41,44,45,48],"clues":{"15":1,"12":0,"7":1,"39":2,"38":1,"34":0,"5":2,"28":0,"10":2},"solution":[1,4,6,9,14,17,37,40,43,46]}],"Medium":[{"n":8,"walls":[0,5,11,15,20,21,24,25,32,35,57,60,63],"clues":{"24":0,"0":1,"32":1,"25":0,"21":2,"35":0,"11":1,"5":2,"20":0},"solution":[3,6,8,13,18,29,39,40,49,59]},{"n":8,"walls":[0,1,4,8,12,13,16,20,23,27,33,34,36,52,53,56,57,59],"clues":{"36":2,"59":0,"53":0,"27":1,"20":0,"13":2,"23":0,"16":1,"4":2,"33":1},"solution":[3,5,10,14,17,29,32,35,44,50,63]},{"n":8,"walls":[4,6,12,15,17,23,27,28,40,42,45,47,48,50,53,60,62],"clues":{"17":2,"23":1,"53":1,"12":0,"62":2,"40":1,"45":1,"4":1,"48":1,"28":0,"6":1},"solution":[3,7,9,16,21,26,31,38,41,44,51,56,61,63]},{"n":8,"walls":[5,7,8,10,13,20,23,24,30,32,36,39,49],"clues":{"30":2,"8":0,"24":1,"49":0,"5":0,"36":2,"13":2,"32":0},"solution":[2,12,14,18,25,31,35,38,44,53,56]},{"n":8,"walls":[9,12,14,15,18,21,24,28,29,30,36,38,39,40,43,46,50,55,62],"clues":{"14":3,"50":2,"24":1,"21":3,"12":3,"46":3,"15":0,"43":1,"18":0,"36":0,"9":0},"solution":[6,11,13,16,20,22,31,33,42,45,47,48,54,58,63]},{"n":8,"walls":[4,11,14,17,21,22,30,38,40,42,45,49,55,56],"clues":{"21":0,"42":1,"49":2,"17":0,"11":0,"55":2,"56":2,"30":0},"solution":[2,5,8,28,33,43,47,48,54,57]}],"Hard":[{"n":9,"walls":[1,2,6,7,11,12,14,15,16,22,34,36,39,42,43,46,48,50,51,52,57,64,65,68,78],"clues":{"34":1,"15":0,"12":0,"14":0,"46":4,"51":0,"50":0,"6":0,"78":1,"16":0,"1":0,"68":1,"57":0,"48":1},"solution":[4,18,26,33,37,40,45,47,55,61,69,75]},{"n":9,"walls":[4,6,9,18,20,23,26,32,39,47,50,52,54,56,57,60,62,63,65,66,67,68,71,76,79,80],"clues":{"26":0,"32":2,"54":0,"20":3,"4":1,"62":1,"57":0,"9":0,"56":0,"76":1,"65":1,"66":0,"63":0,"6":2,"39":0},"solution":[1,5,7,11,21,29,33,36,41,49,53,59,70,74,77]},{"n":9,"walls":[2,3,7,12,16,22,36,38,39,40,47,50,54,62,68,69,72,73,76,79],"clues":{"16":2,"73":2,"7":0,"2":0,"22":2,"39":1,"72":0,"40":2,"69":1,"3":1,"79":0},"solution":[4,9,17,21,25,31,41,45,48,60,64,71,74,77]},{"n":9,"walls":[2,9,12,13,19,24,26,29,30,32,33,34,35,39,43,48,57,63,65,67,69,72,73,77,79,80],"clues":{"69":3,"26":1,"63":1,"13":1,"33":0,"73":0,"30":0,"43":1,"2":1,"72":0,"67":1,"57":0,"24":2,"35":1,"29":3},"solution":[1,4,15,20,25,28,38,40,44,51,54,68,70,75,78]},{"n":9,"walls":[3,7,8,9,10,12,13,15,26,27,31,32,39,44,46,48,51,54,55,57,61,63,65,70,74,75,76,78],"clues":{"76":1,"78":2,"12":0,"10":0,"26":1,"57":0,"46":1,"54":0,"44":1,"13":0,"32":0,"39":0,"65":1,"8":0,"15":1,"31":0},"solution":[0,5,16,18,28,35,36,42,47,49,64,69,72,77,80]},{"n":9,"walls":[2,5,9,14,15,16,19,20,30,34,37,39,44,45,47,55,61,72,73,76],"clues":{"19":0,"61":0,"20":1,"15":1,"34":2,"14":1,"45":3,"55":2,"5":1,"44":3,"73":1,"76":1,"2":1},"solution":[1,6,12,23,29,35,36,43,46,53,54,57,67,74,78]}]};
  const TENTS_TEMPLATES={"Easy":[{"n":6,"trees":[1,3,7,16,28,31],"row":[2,1,1,0,2,0],"col":[1,2,1,1,1,0],"solution":[0,2,10,13,25,27]},{"n":6,"trees":[6,9,13,17,27,31],"row":[1,2,1,0,1,1],"col":[3,0,1,0,1,1],"solution":[0,8,11,12,28,30]},{"n":6,"trees":[6,8,21,24,27,29],"row":[1,1,0,1,1,2],"col":[2,0,1,1,1,1],"solution":[0,9,22,26,30,35]},{"n":6,"trees":[4,15,19,23,24,26],"row":[1,0,1,1,1,2],"col":[1,1,1,1,0,2],"solution":[5,13,21,29,30,32]},{"n":6,"trees":[1,6,11,20,24,27],"row":[1,0,3,0,2,0],"col":[2,1,1,0,1,1],"solution":[0,12,14,17,25,28]}],"Medium":[{"n":7,"trees":[1,12,15,25,36,46,47],"row":[1,1,1,1,0,2,1],"col":[3,0,0,1,1,2,0],"solution":[0,11,14,26,35,40,45]},{"n":7,"trees":[15,17,22,26,31,44,48],"row":[0,2,1,2,0,2,0],"col":[1,1,1,2,0,1,1],"solution":[8,10,19,21,24,37,41]},{"n":7,"trees":[0,6,16,28,37,43,47],"row":[2,0,1,1,1,1,1],"col":[2,1,1,1,0,2,0],"solution":[1,5,17,21,30,40,42]},{"n":7,"trees":[8,16,26,33,42,43,46],"row":[0,1,2,0,1,1,2],"col":[2,0,1,1,1,2,0],"solution":[7,17,19,32,35,44,47]},{"n":7,"trees":[4,16,19,24,41,43,45],"row":[1,0,2,0,1,1,2],"col":[1,1,1,1,1,2,0],"solution":[5,15,18,31,40,42,44]}],"Hard":[{"n":8,"trees":[0,5,15,17,20,29,42,57,60],"row":[1,1,3,0,1,1,0,2],"col":[1,1,1,2,0,3,0,1],"solution":[1,13,16,19,23,37,43,58,61]},{"n":8,"trees":[1,12,14,15,24,30,42,51,60],"row":[2,2,0,1,1,1,0,2],"col":[1,1,0,3,0,2,1,1],"solution":[0,7,11,13,25,38,43,59,61]},{"n":8,"trees":[10,15,18,22,27,41,45,56,63],"row":[2,0,2,1,1,0,3,0],"col":[1,2,1,0,1,1,0,3],"solution":[2,7,17,23,28,33,48,53,55]},{"n":8,"trees":[9,15,22,25,37,49,56,59,63],"row":[2,0,0,2,0,1,3,1],"col":[1,1,2,0,1,1,1,2],"solution":[1,7,26,30,45,48,50,55,60]},{"n":8,"trees":[10,14,16,20,23,43,45,47,50],"row":[2,0,1,2,2,0,2,0],"col":[1,0,1,3,0,1,1,2],"solution":[2,6,19,24,31,35,37,51,55]}]};
  const TOWERS_TEMPLATES={"Easy":[{"n":4,"clues":{"left":[2,3,3,1],"right":[0,2,0,2],"top":[2,0,2,3],"bottom":[1,3,3,2]},"solution":[3,4,2,1,1,3,4,2,2,1,3,4,4,2,1,3]},{"n":4,"clues":{"left":[2,3,1,2],"right":[3,1,2,0],"top":[0,1,2,2],"bottom":[2,4,0,3]},"solution":[2,4,3,1,1,3,2,4,4,2,1,3,3,1,4,2]},{"n":4,"clues":{"left":[2,0,4,1],"right":[2,3,1,3],"top":[3,2,0,2],"bottom":[1,2,0,2]},"solution":[2,1,4,3,3,4,2,1,1,2,3,4,4,3,1,2]},{"n":4,"clues":{"left":[1,2,2,2],"right":[0,1,0,2],"top":[1,2,3,2],"bottom":[0,2,1,2]},"solution":[4,3,2,1,3,2,1,4,1,4,3,2,2,1,4,3]},{"n":4,"clues":{"left":[2,1,2,3],"right":[2,0,2,1],"top":[2,1,0,3],"bottom":[0,2,2,1]},"solution":[3,4,1,2,4,2,3,1,2,1,4,3,1,3,2,4]},{"n":4,"clues":{"left":[3,2,1,2],"right":[0,2,3,1],"top":[0,2,1,0],"bottom":[2,3,3,1]},"solution":[1,3,4,2,2,4,1,3,4,2,3,1,3,1,2,4]},{"n":4,"clues":{"left":[2,1,3,3],"right":[3,2,1,2],"top":[2,0,0,3],"bottom":[3,2,0,2]},"solution":[3,4,2,1,4,2,1,3,2,1,3,4,1,3,4,2]},{"n":4,"clues":{"left":[3,1,0,2],"right":[2,2,0,3],"top":[2,2,0,3],"bottom":[2,1,3,2]},"solution":[1,3,4,2,4,2,1,3,2,1,3,4,3,4,2,1]},{"n":4,"clues":{"left":[1,2,0,2],"right":[3,1,2,0],"top":[1,0,3,2],"bottom":[3,1,2,3]},"solution":[4,3,1,2,3,1,2,4,1,2,4,3,2,4,3,1]},{"n":4,"clues":{"left":[4,0,0,1],"right":[1,3,2,3],"top":[3,0,2,1],"bottom":[1,2,2,3]},"solution":[1,2,3,4,3,4,2,1,2,1,4,3,4,3,1,2]}],"Medium":[{"n":5,"clues":{"left":[4,1,2,3,0],"right":[1,3,2,2,2],"top":[0,0,0,3,0],"bottom":[4,1,3,2,0]},"solution":[1,3,4,2,5,5,1,3,4,2,4,2,5,1,3,3,4,2,5,1,2,5,1,3,4]},{"n":5,"clues":{"left":[0,0,3,0,1],"right":[4,0,2,0,2],"top":[0,1,2,2,3],"bottom":[1,4,3,3,2]},"solution":[3,5,4,2,1,4,2,5,1,3,1,4,3,5,2,2,3,1,4,5,5,1,2,3,4]},{"n":5,"clues":{"left":[3,2,3,3,1],"right":[3,0,1,2,4],"top":[3,2,0,0,0],"bottom":[0,4,2,0,3]},"solution":[1,2,5,4,3,4,5,3,2,1,3,4,2,1,5,2,3,1,5,4,5,1,4,3,2]},{"n":5,"clues":{"left":[1,3,2,3,3],"right":[3,3,0,0,2],"top":[0,0,2,0,4],"bottom":[4,2,0,1,2]},"solution":[5,2,3,4,1,1,4,5,3,2,4,5,2,1,3,3,1,4,2,5,2,3,1,5,4]},{"n":5,"clues":{"left":[5,3,2,2,0],"right":[0,0,3,2,0],"top":[4,3,2,2,0],"bottom":[0,2,2,4,3]},"solution":[1,2,3,4,5,2,4,1,5,3,4,5,2,3,1,3,1,5,2,4,5,3,4,1,2]},{"n":5,"clues":{"left":[3,1,0,2,0],"right":[3,4,2,0,1],"top":[0,2,1,3,4],"bottom":[3,0,4,0,1]},"solution":[3,4,5,2,1,5,1,4,3,2,2,5,3,1,4,4,2,1,5,3,1,3,2,4,5]},{"n":5,"clues":{"left":[4,1,4,0,0],"right":[2,3,0,3,3],"top":[0,0,3,1,2],"bottom":[2,1,2,0,2]},"solution":[1,2,3,5,4,5,1,2,4,3,2,3,4,1,5,3,4,5,2,1,4,5,1,3,2]},{"n":5,"clues":{"left":[3,1,2,2,3],"right":[0,5,0,2,1],"top":[0,3,3,0,0],"bottom":[3,0,2,3,1]},"solution":[1,3,2,5,4,5,4,3,2,1,3,5,1,4,2,4,2,5,1,3,2,1,4,3,5]},{"n":5,"clues":{"left":[0,1,2,3,4],"right":[0,0,0,1,2],"top":[2,3,0,3,2],"bottom":[3,3,2,0,2]},"solution":[3,1,5,2,4,5,2,1,4,3,4,5,3,1,2,1,4,2,3,5,2,3,4,5,1]},{"n":5,"clues":{"left":[2,2,5,1,0],"right":[2,2,1,3,3],"top":[0,0,4,2,2],"bottom":[2,0,0,0,3]},"solution":[3,5,2,1,4,4,3,1,5,2,1,2,3,4,5,5,1,4,2,3,2,4,5,3,1]}],"Hard":[{"n":5,"clues":{"left":[0,3,0,3,2],"right":[0,1,0,2,3],"top":[0,5,0,2,0],"bottom":[3,1,2,0,0]},"solution":[5,1,2,3,4,3,2,4,1,5,4,3,1,5,2,1,4,5,2,3,2,5,3,4,1]},{"n":5,"clues":{"left":[0,0,0,3,2],"right":[3,3,2,0,0],"top":[0,0,3,2,0],"bottom":[2,4,3,2,0]},"solution":[2,5,3,4,1,5,1,4,2,3,3,4,5,1,2,1,3,2,5,4,4,2,1,3,5]},{"n":5,"clues":{"left":[4,4,0,2,2],"right":[0,0,0,3,2],"top":[0,3,3,0,1],"bottom":[0,1,2,0,0]},"solution":[2,3,1,4,5,1,2,4,5,3,5,4,3,2,1,4,1,5,3,2,3,5,2,1,4]},{"n":5,"clues":{"left":[0,0,2,0,0],"right":[0,0,2,0,1],"top":[1,2,0,2,2],"bottom":[3,0,3,3,1]},"solution":[5,3,2,1,4,3,2,4,5,1,4,1,5,2,3,1,5,3,4,2,2,4,1,3,5]},{"n":5,"clues":{"left":[2,0,0,1,4],"right":[4,3,0,2,0],"top":[2,1,0,0,5],"bottom":[0,3,0,0,1]},"solution":[4,5,3,2,1,3,1,5,4,2,1,4,2,5,3,5,2,1,3,4,2,3,4,1,5]},{"n":5,"clues":{"left":[4,0,1,0,3],"right":[0,0,4,3,0],"top":[0,0,3,2,1],"bottom":[3,0,1,3,0]},"solution":[2,1,3,4,5,4,2,1,5,3,5,4,2,3,1,3,5,4,1,2,1,3,5,2,4]},{"n":5,"clues":{"left":[0,1,5,0,3],"right":[2,0,0,4,0],"top":[2,3,0,1,2],"bottom":[0,2,0,4,0]},"solution":[4,1,2,5,3,5,4,1,3,2,1,2,3,4,5,3,5,4,2,1,2,3,5,1,4]},{"n":5,"clues":{"left":[0,0,2,3,0],"right":[1,2,3,3,0],"top":[3,2,2,0,0],"bottom":[0,3,0,2,0]},"solution":[2,3,4,1,5,1,2,3,5,4,4,5,1,3,2,3,4,5,2,1,5,1,2,4,3]},{"n":5,"clues":{"left":[0,3,0,0,1],"right":[0,0,2,0,3],"top":[3,0,3,2,0],"bottom":[0,2,2,2,4]},"solution":[3,4,2,1,5,2,1,4,5,3,1,3,5,2,4,4,5,1,3,2,5,2,3,4,1]},{"n":5,"clues":{"left":[3,0,0,2,0],"right":[2,2,0,3,3],"top":[4,0,2,0,2],"bottom":[0,2,0,3,0]},"solution":[1,3,2,5,4,3,4,5,1,2,4,2,1,3,5,2,5,3,4,1,5,1,4,2,3]}]};

  // ---------- Puzzle Classics expansion ----------
  function killerNeighbors(i){const r=Math.floor(i/9),c=i%9,out=[];if(r>0)out.push(i-9);if(r<8)out.push(i+9);if(c>0)out.push(i-1);if(c<8)out.push(i+1);return out;}
  function generateKillerCages(solution,seed,difficulty){
    const r=rng(`${seed}:cages:${difficulty}`),unassigned=new Set(Array.from({length:81},(_,i)=>i)),cages=[];
    while(unassigned.size){
      const start=pick([...unassigned],r);unassigned.delete(start);const cells=[start],digits=new Set([solution[start]]),max={Easy:3,Medium:4,Hard:5}[difficulty]||4,target=2+Math.floor(r()*Math.max(1,max-1));
      while(cells.length<target){
        const frontier=[...new Set(cells.flatMap(k=>killerNeighbors(k)))].filter(k=>unassigned.has(k)&&!digits.has(solution[k]));
        if(!frontier.length)break;const next=pick(frontier,r);unassigned.delete(next);cells.push(next);digits.add(solution[next]);
      }
      cells.sort((a,b)=>a-b);cages.push({cells,sum:cells.reduce((s,i)=>s+solution[i],0)});
    }
    const cageOf=Array(81);cages.forEach((c,ci)=>c.cells.forEach(i=>cageOf[i]=ci));return {cages,cageOf};
  }
  function killerCellClasses(i,cageOf){const r=Math.floor(i/9),c=i%9,id=cageOf[i],a=[];if(r===0||cageOf[i-9]!==id)a.push('cage-top');if(r===8||cageOf[i+9]!==id)a.push('cage-bottom');if(c===0||cageOf[i-1]!==id)a.push('cage-left');if(c===8||cageOf[i+1]!==id)a.push('cage-right');return a.join(' ');}
  const killerSudoku={
    id:'killer-sudoku',name:'Killer Sudoku',description:byId['killer-sudoku'].description,defaultDifficulty:'Medium',difficulties:['Easy','Medium','Hard'],
    rules:{objective:'Complete the Sudoku while also making every dashed cage add to its target.',items:['Rows, columns, and 3×3 boxes contain 1–9 exactly once.','Digits do not repeat inside a cage.','The small number in a cage is the sum of its cells.','Given digits cannot be changed.']},
    async create(seed,difficulty='Medium'){const base=generateSudoku(`${seed}:killer`,difficulty),cg=generateKillerCages(base.solution,seed,difficulty);return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle:{...base,...cg},state:{board:[...base.givens],selected:firstEmpty(base.givens),history:[],mistakes:0}};},
    async save(a){return saveActive(a);},
    render(a){const s=a.state.selected,sr=Math.floor(s/9),sc=s%9;const first=new Map(a.puzzle.cages.map((c,i)=>[c.cells[0],{i,sum:c.sum}]));const board=`<div class="killer-board" role="grid" aria-label="Killer Sudoku board">${a.state.board.map((v,i)=>{const r=Math.floor(i/9),c=i%9,given=!!a.puzzle.givens[i],rel=r===sr||c===sc||(Math.floor(r/3)===Math.floor(sr/3)&&Math.floor(c/3)===Math.floor(sc/3)),wrong=v&&v!==a.puzzle.solution[i],cl=first.get(i);return `<button class="killer-cell ${killerCellClasses(i,a.puzzle.cageOf)} ${given?'given':''} ${i===s?'selected':''} ${i!==s&&rel?'related':''} ${state.settings.playMode==='challenge'&&wrong?'wrong':''}" data-killer-cell="${i}" aria-label="Row ${r+1}, column ${c+1}, ${v?`value ${v}`:'empty'}${cl?`, cage total ${cl.sum}`:''}">${cl?`<small>${cl.sum}</small>`:''}<strong>${v||''}</strong></button>`}).join('')}</div>`;const pad=`<div class="number-pad">${[1,2,3,4,5,6,7,8,9].map(n=>`<button data-killer-num="${n}">${n}</button>`).join('')}<button data-killer-num="0">Clear</button></div>`;const result=a.completed?resultPanel(a,this,`<div><strong>${a.puzzle.cages.length}</strong><span>Cages</span></div>`):'';main.innerHTML=baseGameShell(byId[this.id],a,board,`${pad}<div class="toolbar"><button data-killer-undo>Undo</button></div>${result}`);bindGameShell(this,a);this.bind(a);if(a.completed)bindResult(a,this);},
    bind(a){$$('[data-killer-cell]').forEach(b=>b.onclick=()=>{a.state.selected=+b.dataset.killerCell;this.render(a)});$$('[data-killer-num]').forEach(b=>b.onclick=()=>this.enter(a,+b.dataset.killerNum));$('[data-killer-undo]').onclick=()=>this.undo(a);window.onkeydown=e=>{if(a.completed||overlayRoot.innerHTML)return;let i=a.state.selected,r=Math.floor(i/9),c=i%9;if(e.key==='ArrowUp')r=clamp(r-1,0,8);else if(e.key==='ArrowDown')r=clamp(r+1,0,8);else if(e.key==='ArrowLeft')c=clamp(c-1,0,8);else if(e.key==='ArrowRight')c=clamp(c+1,0,8);else if(/^[1-9]$/.test(e.key)){this.enter(a,+e.key);return}else if(e.key==='Backspace'||e.key==='Delete'){this.enter(a,0);return}else return;e.preventDefault();a.state.selected=r*9+c;this.render(a)};},
    async enter(a,n){const i=a.state.selected;if(a.puzzle.givens[i])return;const old=a.state.board[i];if(old===n)return;a.state.history.push([i,old]);a.state.board[i]=n;if(n&&n!==a.puzzle.solution[i])a.state.mistakes++;if(a.state.board.every((v,j)=>v===a.puzzle.solution[j]))await finishActive(a,{cages:a.puzzle.cages.length,mistakes:a.state.mistakes});else await saveActive(a);this.render(a);},
    async undo(a){const h=a.state.history.pop();if(!h)return;a.state.board[h[0]]=h[1];await saveActive(a);this.render(a)},
    hint(a){const d=killerProof(a);deliverProofHint(a,d);if(d?.index!=null)this.render(a);}
  };

  function lightLitSet(puzzle,cells){const n=puzzle.n,walls=new Set(puzzle.walls),lit=new Set();for(let i=0;i<n*n;i++)if(cells[i]===1){lit.add(i);const r=Math.floor(i/n),c=i%n;for(const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]]){let rr=r+dr,cc=c+dc;while(rr>=0&&cc>=0&&rr<n&&cc<n){const j=rr*n+cc;if(walls.has(j))break;lit.add(j);rr+=dr;cc+=dc;}}}return lit;}
  function lightConflict(puzzle,cells,i){if(cells[i]!==1)return false;const n=puzzle.n,walls=new Set(puzzle.walls),r=Math.floor(i/n),c=i%n;for(const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]]){let rr=r+dr,cc=c+dc;while(rr>=0&&cc>=0&&rr<n&&cc<n){const j=rr*n+cc;if(walls.has(j))break;if(cells[j]===1)return true;rr+=dr;cc+=dc;}}return false;}
  function lightClueCount(puzzle,cells,w){const n=puzzle.n,r=Math.floor(w/n),c=w%n;let x=0;for(const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]]){const rr=r+dr,cc=c+dc;if(rr>=0&&cc>=0&&rr<n&&cc<n&&cells[rr*n+cc]===1)x++;}return x;}
  function lightComplete(a){if(!Array.isArray(a.state.cells)||a.state.cells.length!==a.puzzle.n*a.puzzle.n||!a.state.cells.every(v=>Number.isInteger(v)&&v>=0&&v<=2)||a.puzzle.walls.some(i=>a.state.cells[i]===1))return false;const lit=lightLitSet(a.puzzle,a.state.cells),walls=new Set(a.puzzle.walls);for(let i=0;i<a.puzzle.n*a.puzzle.n;i++)if(!walls.has(i)&&!lit.has(i))return false;for(let i=0;i<a.state.cells.length;i++)if(lightConflict(a.puzzle,a.state.cells,i))return false;for(const [k,v] of Object.entries(a.puzzle.clues))if(lightClueCount(a.puzzle,a.state.cells,+k)!==v)return false;return true;}
  const lightUp={
    id:'light-up',name:'Light Up',description:byId['light-up'].description,defaultDifficulty:'Medium',difficulties:['Easy','Medium','Hard'],
    rules:{objective:'Place lamps so every white cell is illuminated.',items:['Lamps shine horizontally and vertically until a black wall blocks the light.','Two lamps may not see each other.','A number on a black wall gives the exact number of adjacent lamps.','Mark cells with × when you know they cannot contain a lamp.']},
    async create(seed,difficulty='Medium'){const arr=LIGHT_UP_TEMPLATES[difficulty],t=arr[Math.floor(rng(seed)()*arr.length)],p=JSON.parse(JSON.stringify(t));p.clues=Object.fromEntries(Object.entries(p.clues).map(([k,v])=>[+k,v]));return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle:p,state:{cells:Array(p.n*p.n).fill(0),selected:0,history:[]}};},
    async save(a){return saveActive(a);},
    render(a){const n=a.puzzle.n,walls=new Set(a.puzzle.walls),lit=lightLitSet(a.puzzle,a.state.cells);const board=`<div class="light-board" style="grid-template-columns:repeat(${n},1fr)">${Array.from({length:n*n},(_,i)=>{if(walls.has(i)){const clue=Object.prototype.hasOwnProperty.call(a.puzzle.clues,i)?a.puzzle.clues[i]:'';return `<div class="light-wall ${clue!==''&&lightClueCount(a.puzzle,a.state.cells,i)===clue?'satisfied':''}" aria-label="Black wall${clue!==''?`, clue ${clue}`:''}">${clue}</div>`;}const v=a.state.cells[i],conf=lightConflict(a.puzzle,a.state.cells,i);return `<button class="light-cell ${lit.has(i)?'lit':''} ${v===1?'lamp':''} ${v===2?'marked':''} ${conf?'conflict':''} ${i===a.state.selected?'selected':''}" data-light-cell="${i}" aria-label="Row ${Math.floor(i/n)+1}, column ${i%n+1}, ${v===1?'lamp':v===2?'marked no lamp':lit.has(i)?'illuminated':'unlit'}">${v===1?'<i class="lamp-mark"></i>':v===2?'×':''}</button>`}).join('')}</div>`;const result=a.completed?resultPanel(a,this,`<div><strong>${a.state.cells.filter(x=>x===1).length}</strong><span>Lamps</span></div>`):'';main.innerHTML=baseGameShell(byId[this.id],a,board,`<div class="toolbar"><button data-light-lamp>Lamp</button><button data-light-x>× Mark</button><button data-light-clear>Clear</button><button data-light-undo>Undo</button></div>${result}`);bindGameShell(this,a);this.bind(a);if(a.completed)bindResult(a,this);},
    bind(a){$$('[data-light-cell]').forEach(b=>b.onclick=()=>{a.state.selected=+b.dataset.lightCell;this.cycle(a,a.state.selected)});$('[data-light-lamp]').onclick=()=>this.set(a,a.state.selected,1);$('[data-light-x]').onclick=()=>this.set(a,a.state.selected,2);$('[data-light-clear]').onclick=()=>this.set(a,a.state.selected,0);$('[data-light-undo]').onclick=()=>this.undo(a);window.onkeydown=e=>{if(a.completed||overlayRoot.innerHTML)return;const n=a.puzzle.n,walls=new Set(a.puzzle.walls);let i=a.state.selected,r=Math.floor(i/n),c=i%n;if(e.key==='ArrowUp')r=clamp(r-1,0,n-1);else if(e.key==='ArrowDown')r=clamp(r+1,0,n-1);else if(e.key==='ArrowLeft')c=clamp(c-1,0,n-1);else if(e.key==='ArrowRight')c=clamp(c+1,0,n-1);else if(e.key.toLowerCase()==='l'||e.key==='Enter'||e.key===' '){this.set(a,i,1);return}else if(e.key.toLowerCase()==='x'){this.set(a,i,2);return}else if(e.key==='Backspace'||e.key==='Delete'){this.set(a,i,0);return}else return;e.preventDefault();const j=r*n+c;if(!walls.has(j))a.state.selected=j;this.render(a)};},
    cycle(a,i){const walls=new Set(a.puzzle.walls);if(walls.has(i))return;this.set(a,i,(a.state.cells[i]+1)%3);},
    async set(a,i,v){if(a.completed||a.puzzle.walls.includes(i))return;const old=a.state.cells[i];if(old===v)return;a.state.history.push([i,old]);a.state.cells[i]=v;if(lightComplete(a))await finishActive(a,{lamps:a.state.cells.filter(x=>x===1).length});else await saveActive(a);this.render(a);},
    async undo(a){const h=a.state.history.pop();if(!h)return;a.state.cells[h[0]]=h[1];await saveActive(a);this.render(a)},
    hint(a){const d=lightProof(a);deliverProofHint(a,d);if(d?.index!=null)this.render(a);}
  };

  function tentsPerfectMatch(trees,tents,n){const match=new Map();function dfs(tree,seen){const r=Math.floor(tree/n),c=tree%n;for(const x of tents){const rr=Math.floor(x/n),cc=x%n;if(Math.abs(r-rr)+Math.abs(c-cc)!==1||seen.has(x))continue;seen.add(x);if(!match.has(x)||dfs(match.get(x),seen)){match.set(x,tree);return true;}}return false;}return trees.every(t=>dfs(t,new Set()));}
  function tentsComplete(a){if(!Array.isArray(a.state.cells)||a.state.cells.length!==a.puzzle.n*a.puzzle.n||!a.state.cells.every(v=>Number.isInteger(v)&&v>=0&&v<=2)||a.puzzle.trees.some(i=>a.state.cells[i]===1))return false;const n=a.puzzle.n,tents=a.state.cells.map((v,i)=>v===1?i:-1).filter(i=>i>=0);if(tents.length!==a.puzzle.trees.length)return false;const row=Array(n).fill(0),col=Array(n).fill(0),set=new Set(tents);for(const i of tents){const r=Math.floor(i/n),c=i%n;row[r]++;col[c]++;for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){if(!dr&&!dc)continue;const rr=r+dr,cc=c+dc,j=rr*n+cc;if(rr>=0&&cc>=0&&rr<n&&cc<n&&set.has(j))return false;}}if(row.some((x,i)=>x!==a.puzzle.row[i])||col.some((x,i)=>x!==a.puzzle.col[i]))return false;return tentsPerfectMatch(a.puzzle.trees,tents,n);}
  const tentsGame={
    id:'tents',name:'Tents',description:byId.tents.description,defaultDifficulty:'Medium',difficulties:['Easy','Medium','Hard'],
    rules:{objective:'Place one tent for every tree while matching the row and column counts.',items:['Every tent is horizontally or vertically adjacent to a tree.','Each tree pairs with exactly one tent.','Tents never touch, even diagonally.','Numbers outside the grid give the tents required in that row or column.']},
    async create(seed,difficulty='Medium'){const arr=TENTS_TEMPLATES[difficulty],p=JSON.parse(JSON.stringify(arr[Math.floor(rng(seed)()*arr.length)]));return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle:p,state:{cells:Array(p.n*p.n).fill(0),selected:0,history:[]}};},
    async save(a){return saveActive(a);},
    render(a){const n=a.puzzle.n,trees=new Set(a.puzzle.trees),tentCountsRow=Array(n).fill(0),tentCountsCol=Array(n).fill(0);a.state.cells.forEach((v,i)=>{if(v===1){tentCountsRow[Math.floor(i/n)]++;tentCountsCol[i%n]++;}});const board=`<div class="tents-wrap" style="--tents-n:${n}"><div></div><div class="tents-col-clues">${a.puzzle.col.map((x,i)=>`<span class="${tentCountsCol[i]===x?'done':''}">${x}</span>`).join('')}</div><div></div><div class="tents-board" style="grid-template-columns:repeat(${n},1fr)">${Array.from({length:n*n},(_,i)=>trees.has(i)?`<div class="tent-cell tree" aria-label="Tree, row ${Math.floor(i/n)+1}, column ${i%n+1}"><i class="tree-mark"></i></div>`:`<button class="tent-cell ${a.state.cells[i]===1?'tent':''} ${a.state.cells[i]===2?'grass':''} ${i===a.state.selected?'selected':''}" data-tent-cell="${i}" aria-label="Row ${Math.floor(i/n)+1}, column ${i%n+1}, ${a.state.cells[i]===1?'tent':a.state.cells[i]===2?'grass':'unknown'}">${a.state.cells[i]===1?'<i class="tent-mark"></i>':a.state.cells[i]===2?'·':''}</button>`).join('')}</div><div class="tents-row-clues">${a.puzzle.row.map((x,i)=>`<span class="${tentCountsRow[i]===x?'done':''}">${x}</span>`).join('')}</div></div>`;const result=a.completed?resultPanel(a,this,`<div><strong>${a.puzzle.trees.length}</strong><span>Tents</span></div>`):'';main.innerHTML=baseGameShell(byId[this.id],a,board,`<div class="toolbar"><button data-tent-t>Tent</button><button data-tent-g>Grass</button><button data-tent-clear>Clear</button><button data-tent-undo>Undo</button></div>${result}`);bindGameShell(this,a);this.bind(a);if(a.completed)bindResult(a,this);},
    bind(a){$$('[data-tent-cell]').forEach(b=>b.onclick=()=>{a.state.selected=+b.dataset.tentCell;this.cycle(a,a.state.selected)});$('[data-tent-t]').onclick=()=>this.set(a,a.state.selected,1);$('[data-tent-g]').onclick=()=>this.set(a,a.state.selected,2);$('[data-tent-clear]').onclick=()=>this.set(a,a.state.selected,0);$('[data-tent-undo]').onclick=()=>this.undo(a);window.onkeydown=e=>{if(a.completed||overlayRoot.innerHTML)return;const n=a.puzzle.n,trees=new Set(a.puzzle.trees);let i=a.state.selected,r=Math.floor(i/n),c=i%n;if(e.key==='ArrowUp')r=clamp(r-1,0,n-1);else if(e.key==='ArrowDown')r=clamp(r+1,0,n-1);else if(e.key==='ArrowLeft')c=clamp(c-1,0,n-1);else if(e.key==='ArrowRight')c=clamp(c+1,0,n-1);else if(e.key.toLowerCase()==='t'||e.key==='Enter'){this.set(a,i,1);return}else if(e.key.toLowerCase()==='g'||e.key===' '){this.set(a,i,2);return}else if(e.key==='Backspace'||e.key==='Delete'){this.set(a,i,0);return}else return;e.preventDefault();const j=r*n+c;if(!trees.has(j))a.state.selected=j;this.render(a)};},
    cycle(a,i){if(a.puzzle.trees.includes(i))return;this.set(a,i,(a.state.cells[i]+1)%3);},
    async set(a,i,v){if(a.completed||a.puzzle.trees.includes(i))return;const old=a.state.cells[i];if(old===v)return;a.state.history.push([i,old]);a.state.cells[i]=v;if(tentsComplete(a))await finishActive(a,{tents:a.puzzle.trees.length});else await saveActive(a);this.render(a);},
    async undo(a){const h=a.state.history.pop();if(!h)return;a.state.cells[h[0]]=h[1];await saveActive(a);this.render(a)},
    hint(a){const d=tentsProof(a);deliverProofHint(a,d);if(d?.index!=null)this.render(a);}
  };

  function splitRectangles(n,r,target){const rects=[{r:0,c:0,h:n,w:n}];while(rects.length<target){const opts=rects.map((x,i)=>({x,i})).filter(o=>o.x.h>1||o.x.w>1);if(!opts.length)break;const o=pick(opts,r),x=rects.splice(o.i,1)[0],dirs=[];if(x.h>1)dirs.push('h');if(x.w>1)dirs.push('v');const d=pick(dirs,r);if(d==='h'){const cut=1+Math.floor(r()*(x.h-1));rects.push({r:x.r,c:x.c,h:cut,w:x.w},{r:x.r+cut,c:x.c,h:x.h-cut,w:x.w});}else{const cut=1+Math.floor(r()*(x.w-1));rects.push({r:x.r,c:x.c,h:x.h,w:cut},{r:x.r,c:x.c+cut,h:x.h,w:x.w-cut});}}return rects;}
  function rectMask(n,r,c,h,w){let m=0n;for(let rr=r;rr<r+h;rr++)for(let cc=c;cc<c+w;cc++)m|=1n<<BigInt(rr*n+cc);return m;}
  function rectangleCandidates(n,clues){const clueCells=new Set(clues.map(x=>x.cell)),out=[];for(const q of clues){const cr=Math.floor(q.cell/n),cc=q.cell%n,arr=[];for(let h=1;h<=n;h++){if(q.area%h)continue;const w=q.area/h;if(w>n)continue;for(let r0=Math.max(0,cr-h+1);r0<=Math.min(cr,n-h);r0++)for(let c0=Math.max(0,cc-w+1);c0<=Math.min(cc,n-w);c0++){let ok=true;for(const x of clueCells)if(x!==q.cell){const rr=Math.floor(x/n),cx=x%n;if(rr>=r0&&rr<r0+h&&cx>=c0&&cx<c0+w){ok=false;break;}}if(ok)arr.push({r:r0,c:c0,h,w,mask:rectMask(n,r0,c0,h,w)});}}out.push(arr);}return out;}
  function countRectangleSolutions(n,clues,limit=2){const cands=rectangleCandidates(n,clues);if(cands.some(x=>!x.length))return 0;let count=0,used=0n,assigned=new Set();const full=(1n<<BigInt(n*n))-1n;function rec(){if(count>=limit)return;if(assigned.size===clues.length){if(used===full)count++;return;}let best=-1,opts=null;for(let i=0;i<clues.length;i++)if(!assigned.has(i)){const v=cands[i].filter(x=>(x.mask&used)===0n);if(!v.length)return;if(!opts||v.length<opts.length){best=i;opts=v;}}assigned.add(best);for(const x of opts){used|=x.mask;rec();used^=x.mask;if(count>=limit)break;}assigned.delete(best);}rec();return count;}
  function generateRectangles(seed,difficulty){const n={Easy:6,Medium:7,Hard:8}[difficulty]||7,target={Easy:8,Medium:10,Hard:12}[difficulty]||10,r=rng(`${seed}:rect`);for(let attempt=0;attempt<300;attempt++){const solution=splitRectangles(n,r,target);if(solution.filter(x=>x.h*x.w===1).length>1)continue;const clues=solution.map(x=>{const cells=[];for(let rr=x.r;rr<x.r+x.h;rr++)for(let cc=x.c;cc<x.c+x.w;cc++)cells.push(rr*n+cc);return {cell:pick(cells,r),area:x.h*x.w};});if(countRectangleSolutions(n,clues,2)===1)return {n,clues,solution};}throw new Error('Could not generate rectangle puzzle');}
  function sameRect(a,b){return a.r===b.r&&a.c===b.c&&a.h===b.h&&a.w===b.w;}
  const rectanglesGame={
    id:'rectangles',name:'Rectangles',description:byId.rectangles.description,defaultDifficulty:'Medium',difficulties:['Easy','Medium','Hard'],
    rules:{objective:'Partition every cell into rectangles whose areas match their clues.',items:['Every rectangle contains exactly one clue.','The rectangle area must equal that clue.','Rectangles cannot overlap.','Every board cell belongs to exactly one rectangle.']},
    async create(seed,difficulty='Medium'){const puzzle=generateRectangles(seed,difficulty);return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle,state:{rects:[],anchor:null,selected:0,history:[]}};},
    async save(a){return saveActive(a);},
    cellRect(a,i){const n=a.puzzle.n,r=Math.floor(i/n),c=i%n;return a.state.rects.find(x=>r>=x.r&&r<x.r+x.h&&c>=x.c&&c<x.c+x.w);},
    validRect(a,x){const n=a.puzzle.n;if(!x||!['r','c','h','w'].every(k=>Number.isInteger(x[k]))||x.r<0||x.c<0||x.h<1||x.w<1||x.r+x.h>n||x.c+x.w>n)return false;const clues=a.puzzle.clues.filter(q=>{const r=Math.floor(q.cell/n),c=q.cell%n;return r>=x.r&&r<x.r+x.h&&c>=x.c&&c<x.c+x.w;});if(clues.length!==1||clues[0].area!==x.h*x.w)return false;for(const y of a.state.rects){if(!(x.r+x.h<=y.r||y.r+y.h<=x.r||x.c+x.w<=y.c||y.c+y.w<=x.c))return false;}return true;},
    render(a){const n=a.puzzle.n,clueMap=Object.fromEntries(a.puzzle.clues.map(q=>[q.cell,q.area]));const board=`<div class="rect-board" style="grid-template-columns:repeat(${n},1fr)">${Array.from({length:n*n},(_,i)=>{const r=Math.floor(i/n),c=i%n,x=this.cellRect(a,i),classes=[];if(x){classes.push('placed');if(r===x.r)classes.push('r-top');if(r===x.r+x.h-1)classes.push('r-bottom');if(c===x.c)classes.push('r-left');if(c===x.c+x.w-1)classes.push('r-right');}if(i===a.state.anchor)classes.push('anchor');if(i===a.state.selected)classes.push('selected');return `<button class="rect-cell ${classes.join(' ')}" data-rect-cell="${i}" aria-label="Row ${r+1}, column ${c+1}${clueMap[i]?`, clue ${clueMap[i]}`:''}${x?', inside placed rectangle':''}">${clueMap[i]||''}</button>`}).join('')}</div>`;const covered=a.state.rects.reduce((s,x)=>s+x.h*x.w,0),result=a.completed?resultPanel(a,this,`<div><strong>${a.state.rects.length}</strong><span>Rectangles</span></div>`):'';main.innerHTML=baseGameShell(byId[this.id],a,board,`<div class="path-status"><span>${covered} / ${n*n} cells covered</span><button data-rect-undo>Undo</button></div>${result}`);bindGameShell(this,a);this.bind(a);if(a.completed)bindResult(a,this);},
    bind(a){$$('[data-rect-cell]').forEach(b=>b.onclick=()=>{a.state.selected=+b.dataset.rectCell;this.activate(a,a.state.selected)});$('[data-rect-undo]').onclick=()=>this.undo(a);window.onkeydown=e=>{if(a.completed||overlayRoot.innerHTML)return;const n=a.puzzle.n;let i=a.state.selected,r=Math.floor(i/n),c=i%n;if(e.key==='ArrowUp')r=clamp(r-1,0,n-1);else if(e.key==='ArrowDown')r=clamp(r+1,0,n-1);else if(e.key==='ArrowLeft')c=clamp(c-1,0,n-1);else if(e.key==='ArrowRight')c=clamp(c+1,0,n-1);else if(e.key==='Enter'||e.key===' '){this.activate(a,i);return}else return;e.preventDefault();a.state.selected=r*n+c;this.render(a)};},
    async activate(a,i){if(a.completed)return;const existing=this.cellRect(a,i);if(existing&&a.state.anchor===null){a.state.history.push(JSON.parse(JSON.stringify(a.state.rects)));a.state.rects=a.state.rects.filter(x=>x!==existing);await saveActive(a);this.render(a);return;}if(a.state.anchor===null){a.state.anchor=i;this.render(a);return;}const n=a.puzzle.n,r1=Math.floor(a.state.anchor/n),c1=a.state.anchor%n,r2=Math.floor(i/n),c2=i%n,x={r:Math.min(r1,r2),c:Math.min(c1,c2),h:Math.abs(r1-r2)+1,w:Math.abs(c1-c2)+1};a.state.anchor=null;if(!this.validRect(a,x)){toast('That rectangle must contain one matching area clue and may not overlap.');this.render(a);return;}a.state.history.push(JSON.parse(JSON.stringify(a.state.rects)));a.state.rects.push(x);if(a.state.rects.reduce((s,q)=>s+q.h*q.w,0)===n*n)await finishActive(a,{rectangles:a.state.rects.length});else await saveActive(a);this.render(a);},
    async undo(a){const prev=a.state.history.pop();if(!prev)return;a.state.rects=prev;a.state.anchor=null;await saveActive(a);this.render(a)},
    hint(a){const missing=a.puzzle.solution.find(x=>!a.state.rects.some(y=>sameRect(x,y)));if(!missing)return;const q=a.puzzle.clues.find(c=>{const r=Math.floor(c.cell/a.puzzle.n),col=c.cell%a.puzzle.n;return r>=missing.r&&r<missing.r+missing.h&&col>=missing.c&&col<missing.c+missing.w;});toast(`Hint: clue ${q.area} forms a ${missing.h}×${missing.w} rectangle.`);}
  };

  function towerVisibility(seq){let high=0,count=0;for(const x of seq)if(x>high){high=x;count++;}return count;}
  const towersGame={
    id:'towers',name:'Towers',description:byId.towers.description,defaultDifficulty:'Medium',difficulties:['Easy','Medium','Hard'],
    rules:{objective:'Fill the grid with tower heights so the outside visibility clues are satisfied.',items:['Each row and column contains every height 1–N exactly once.','A taller tower hides all shorter towers behind it.','An outside clue tells how many towers are visible from that direction.','Use the crossing row and column clues to eliminate candidates.']},
    async create(seed,difficulty='Medium'){const arr=TOWERS_TEMPLATES[difficulty],p=JSON.parse(JSON.stringify(arr[Math.floor(rng(seed)()*arr.length)]));return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle:p,state:{board:Array(p.n*p.n).fill(0),selected:0,history:[],mistakes:0}};},
    async save(a){return saveActive(a);},
    render(a){const n=a.puzzle.n,cl=a.puzzle.clues;const top=`<div class="tower-clues tower-clues--h">${cl.top.map(x=>`<span>${x||''}</span>`).join('')}</div>`,bottom=`<div class="tower-clues tower-clues--h">${cl.bottom.map(x=>`<span>${x||''}</span>`).join('')}</div>`,left=`<div class="tower-clues tower-clues--v">${cl.left.map(x=>`<span>${x||''}</span>`).join('')}</div>`,right=`<div class="tower-clues tower-clues--v">${cl.right.map(x=>`<span>${x||''}</span>`).join('')}</div>`;const grid=`<div class="towers-board" style="grid-template-columns:repeat(${n},1fr)">${a.state.board.map((v,i)=>`<button class="tower-cell ${i===a.state.selected?'selected':''} ${state.settings.playMode==='challenge'&&v&&v!==a.puzzle.solution[i]?'wrong':''}" data-tower-cell="${i}" aria-label="Row ${Math.floor(i/n)+1}, column ${i%n+1}, ${v?`height ${v}`:'empty'}">${v||''}</button>`).join('')}</div>`;const board=`<div class="towers-wrap" style="--tower-n:${n}"><div></div>${top}<div></div>${left}${grid}${right}<div></div>${bottom}<div></div></div>`;const pad=`<div class="number-pad tower-pad">${Array.from({length:n},(_,i)=>`<button data-tower-num="${i+1}">${i+1}</button>`).join('')}<button data-tower-num="0">Clear</button></div>`,result=a.completed?resultPanel(a,this,`<div><strong>${n}×${n}</strong><span>Grid</span></div>`):'';main.innerHTML=baseGameShell(byId[this.id],a,board,`${pad}<div class="toolbar"><button data-tower-undo>Undo</button></div>${result}`);bindGameShell(this,a);this.bind(a);if(a.completed)bindResult(a,this);},
    bind(a){$$('[data-tower-cell]').forEach(b=>b.onclick=()=>{a.state.selected=+b.dataset.towerCell;this.render(a)});$$('[data-tower-num]').forEach(b=>b.onclick=()=>this.enter(a,+b.dataset.towerNum));$('[data-tower-undo]').onclick=()=>this.undo(a);window.onkeydown=e=>{if(a.completed||overlayRoot.innerHTML)return;const n=a.puzzle.n;let i=a.state.selected,r=Math.floor(i/n),c=i%n;if(e.key==='ArrowUp')r=clamp(r-1,0,n-1);else if(e.key==='ArrowDown')r=clamp(r+1,0,n-1);else if(e.key==='ArrowLeft')c=clamp(c-1,0,n-1);else if(e.key==='ArrowRight')c=clamp(c+1,0,n-1);else if(new RegExp(`^[1-${n}]$`).test(e.key)){this.enter(a,+e.key);return}else if(e.key==='Backspace'||e.key==='Delete'){this.enter(a,0);return}else return;e.preventDefault();a.state.selected=r*n+c;this.render(a)};},
    async enter(a,v){const i=a.state.selected,old=a.state.board[i];if(old===v)return;a.state.history.push([i,old]);a.state.board[i]=v;if(v&&v!==a.puzzle.solution[i])a.state.mistakes++;if(a.state.board.every((x,j)=>x===a.puzzle.solution[j]))await finishActive(a,{size:a.puzzle.n,mistakes:a.state.mistakes});else await saveActive(a);this.render(a);},
    async undo(a){const h=a.state.history.pop();if(!h)return;a.state.board[h[0]]=h[1];await saveActive(a);this.render(a)},
    hint(a){const d=towersProof(a);deliverProofHint(a,d);if(d?.index!=null)this.render(a);}
  };

  const NET_N=1,NET_E=2,NET_S=4,NET_W=8;
  function rotateMask(mask,t=1){for(let k=0;k<((t%4)+4)%4;k++)mask=((mask<<1)&15)|((mask&8)?1:0);return mask;}
  function networkMaskOptions(mask){return [...new Set([0,1,2,3].map(k=>rotateMask(mask,k)))];}
  function networkMasksComplete(masks,n){if(!Array.isArray(masks)||masks.length!==n*n||!masks.every(v=>Number.isInteger(v)&&v>=1&&v<=15))return false;
    const bad=(i=>{const r=Math.floor(i/n),c=i%n,m=masks[i];for(const [bit,dr,dc,opp] of [[NET_N,-1,0,NET_S],[NET_E,0,1,NET_W],[NET_S,1,0,NET_N],[NET_W,0,-1,NET_E]])if(m&bit){const rr=r+dr,cc=c+dc;if(rr<0||cc<0||rr>=n||cc>=n||!(masks[rr*n+cc]&opp))return true;}return false;});if(masks.some((_,i)=>bad(i)))return false;
    const seen=new Set([0]),q=[0];while(q.length){const i=q.pop(),r=Math.floor(i/n),c=i%n,m=masks[i];for(const [bit,dr,dc] of [[NET_N,-1,0],[NET_E,0,1],[NET_S,1,0],[NET_W,0,-1]])if(m&bit){const j=(r+dr)*n+(c+dc);if(!seen.has(j)){seen.add(j);q.push(j);}}}return seen.size===n*n;
  }
  function countNetworkSolutions(solutionMasks,n,limit=2,stats=null){
    const neighbors=Array.from({length:n*n},(_,i)=>rcNeighbors(i,n)),compatible=(i,mi,j,mj)=>{const r=Math.floor(i/n),c=i%n,r2=Math.floor(j/n),c2=j%n;if(r2===r&&c2===c+1)return !!(mi&NET_E)===!!(mj&NET_W);if(r2===r&&c2===c-1)return !!(mi&NET_W)===!!(mj&NET_E);if(r2===r+1&&c2===c)return !!(mi&NET_S)===!!(mj&NET_N);return !!(mi&NET_N)===!!(mj&NET_S);};
    const domains=solutionMasks.map((m,i)=>{const r=Math.floor(i/n),c=i%n;return networkMaskOptions(m).filter(x=>!(r===0&&x&NET_N)&&!(r===n-1&&x&NET_S)&&!(c===0&&x&NET_W)&&!(c===n-1&&x&NET_E));});let count=0,nodes=0,propagations=0;
    function propagate(dom){let changed=true;while(changed){changed=false;propagations++;for(let i=0;i<dom.length;i++)for(const j of neighbors[i]){const next=dom[i].filter(mi=>dom[j].some(mj=>compatible(i,mi,j,mj)));if(!next.length)return false;if(next.length!==dom[i].length){dom[i]=next;changed=true;}}}return true;}
    function rec(dom){if(count>=limit)return;nodes++;dom=dom.map(x=>[...x]);if(!propagate(dom))return;let best=-1;for(let i=0;i<dom.length;i++)if(dom[i].length>1&&(best<0||dom[i].length<dom[best].length))best=i;if(best<0){const masks=dom.map(x=>x[0]);if(networkMasksComplete(masks,n))count++;return;}for(const m of dom[best]){const next=dom.map(x=>[...x]);next[best]=[m];rec(next);if(count>=limit)return;}}
    rec(domains);if(stats){stats.nodes=nodes;stats.propagations=propagations;stats.count=count;}return count;
  }
  function generateNetwork(seed,difficulty){
    const n={Easy:5,Medium:7,Hard:9}[difficulty]||7;
    for(let attempt=0;attempt<40;attempt++){
      const r=rng(`${seed}:network:v3:${attempt}`),masks=Array(n*n).fill(0),seen=new Set([Math.floor(r()*n*n)]),stack=[...seen],dirs=[[-1,0,NET_N,NET_S],[0,1,NET_E,NET_W],[1,0,NET_S,NET_N],[0,-1,NET_W,NET_E]];
      while(stack.length){const i=stack[stack.length-1],rr=Math.floor(i/n),cc=i%n,opts=dirs.map(d=>({d,rr:rr+d[0],cc:cc+d[1]})).filter(o=>o.rr>=0&&o.cc>=0&&o.rr<n&&o.cc<n&&!seen.has(o.rr*n+o.cc));if(!opts.length){stack.pop();continue;}const o=pick(opts,r),j=o.rr*n+o.cc;masks[i]|=o.d[2];masks[j]|=o.d[3];seen.add(j);stack.push(j);}
      const cert={};if(countNetworkSolutions(masks,n,2,cert)!==1)continue;
      const rotations=masks.map(m=>networkMaskOptions(m).length===1?0:Math.floor(r()*4));let current=masks.map((m,i)=>rotateMask(m,rotations[i]));if(networkMasksComplete(current,n)){const i=masks.findIndex(m=>networkMaskOptions(m).length>1);if(i>=0){rotations[i]=(rotations[i]+1)%4;current=masks.map((m,j)=>rotateMask(m,rotations[j]));}}
      if(networkMasksComplete(current,n))continue;const bitCount=m=>[NET_N,NET_E,NET_S,NET_W].filter(b=>m&b).length,branchTiles=masks.filter(m=>bitCount(m)>=3).length,cornerTiles=masks.filter(m=>bitCount(m)===2&&!((m===5)||(m===10))).length,leaves=masks.filter(m=>bitCount(m)===1).length,scrambleCost=masks.reduce((sum,m,i)=>{let best=4;for(let d=0;d<4;d++)if(rotateMask(m,(rotations[i]+d)%4)===m)best=Math.min(best,Math.min(d,4-d));return sum+best;},0),score=n*10+scrambleCost*.7+branchTiles*1.2+cornerTiles*.3+leaves*.12;return {n,solutionMasks:masks,initialRotations:rotations,certifiedUnique:true,generatorVersion:3,difficultyScore:+score.toFixed(2),difficultyMetrics:{solverNodes:cert.nodes,propagations:cert.propagations,scrambleCost,branchTiles,cornerTiles,leaves}};
    }
    throw new Error('Network generation failed uniqueness certification');
  }
  function networkCurrentMasks(a){return a.puzzle.solutionMasks.map((m,i)=>rotateMask(m,a.state.rotations[i]));}
  function networkBad(a,i,masks=networkCurrentMasks(a)){const n=a.puzzle.n,r=Math.floor(i/n),c=i%n,m=masks[i];for(const [bit,dr,dc,opp] of [[NET_N,-1,0,NET_S],[NET_E,0,1,NET_W],[NET_S,1,0,NET_N],[NET_W,0,-1,NET_E]])if(m&bit){const rr=r+dr,cc=c+dc;if(rr<0||cc<0||rr>=n||cc>=n||!(masks[rr*n+cc]&opp))return true;}return false;}
  function networkComplete(a){return networkMasksComplete(networkCurrentMasks(a),a.puzzle.n);}
  function networkTileHtml(mask){return `<span class="net-center"></span>${mask&NET_N?'<i class="net-arm n"></i>':''}${mask&NET_E?'<i class="net-arm e"></i>':''}${mask&NET_S?'<i class="net-arm s"></i>':''}${mask&NET_W?'<i class="net-arm w"></i>':''}`;}
  const networkGame={
    id:'network',name:'Network',generatorVersion:3,description:byId.network.description,defaultDifficulty:'Medium',difficulties:['Easy','Medium','Hard'],
    rules:{objective:'Rotate every tile until all connectors form one connected network.',items:['Every visible connector must meet another connector.','No connector may point outside the board.','The final network must connect every tile.','Every generated layout is uniqueness-certified. Tap to rotate clockwise; right-click rotates counter-clockwise.']},
    async create(seed,difficulty='Medium'){const puzzle=generateNetwork(seed,difficulty);return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle,state:{rotations:[...puzzle.initialRotations],selected:0,history:[],moves:0}};},
    async save(a){return saveActive(a);},
    render(a){const n=a.puzzle.n,masks=networkCurrentMasks(a);const board=`<div class="network-board" style="grid-template-columns:repeat(${n},1fr)">${masks.map((m,i)=>`<button class="network-cell ${networkBad(a,i,masks)?'bad':''} ${i===a.state.selected?'selected':''}" data-network-cell="${i}" aria-label="Network tile row ${Math.floor(i/n)+1}, column ${i%n+1}">${networkTileHtml(m)}</button>`).join('')}</div>`;const result=a.completed?resultPanel(a,this,`<div><strong>${a.state.moves}</strong><span>Rotations</span></div>`):'';main.innerHTML=baseGameShell(byId[this.id],a,board,`<div class="toolbar"><button data-network-ccw>Rotate left</button><button data-network-cw>Rotate right</button><button data-network-undo>Undo</button></div>${result}`);bindGameShell(this,a);this.bind(a);if(a.completed)bindResult(a,this);},
    bind(a){$$('[data-network-cell]').forEach(b=>{b.onclick=()=>{a.state.selected=+b.dataset.networkCell;this.rotate(a,a.state.selected,1)};b.oncontextmenu=e=>{e.preventDefault();a.state.selected=+b.dataset.networkCell;this.rotate(a,a.state.selected,-1)}});$('[data-network-ccw]').onclick=()=>this.rotate(a,a.state.selected,-1);$('[data-network-cw]').onclick=()=>this.rotate(a,a.state.selected,1);$('[data-network-undo]').onclick=()=>this.undo(a);window.onkeydown=e=>{if(a.completed||overlayRoot.innerHTML)return;const n=a.puzzle.n,i=a.state.selected,r=Math.floor(i/n),c=i%n;if(e.key==='Enter'||e.key===' '){e.preventDefault();this.rotate(a,i,1);return}if(e.key.toLowerCase()==='q'){e.preventDefault();this.rotate(a,i,-1);return}let rr=r,cc=c;if(e.key==='ArrowUp')rr=Math.max(0,r-1);else if(e.key==='ArrowDown')rr=Math.min(n-1,r+1);else if(e.key==='ArrowLeft')cc=Math.max(0,c-1);else if(e.key==='ArrowRight')cc=Math.min(n-1,c+1);else return;e.preventDefault();a.state.selected=rr*n+cc;this.render(a)};},
    async rotate(a,i,d){if(a.completed)return;const old=a.state.rotations[i];a.state.history.push([i,old]);a.state.rotations[i]=(old+d+4)%4;a.state.moves++;if(networkComplete(a))await finishActive(a,{size:a.puzzle.n,moves:a.state.moves});else await saveActive(a);this.render(a);},
    async undo(a){const h=a.state.history.pop();if(!h)return;a.state.rotations[h[0]]=h[1];a.state.moves=Math.max(0,a.state.moves-1);await saveActive(a);this.render(a);},
    hint(a){const masks=networkCurrentMasks(a);let i=masks.findIndex((m,j)=>m!==a.puzzle.solutionMasks[j]);if(i<0)i=masks.findIndex((_,j)=>networkBad(a,j,masks));if(i>=0){a.state.selected=i;toast(`Hint: inspect the tile at row ${Math.floor(i/a.puzzle.n)+1}, column ${i%a.puzzle.n+1}.`);this.render(a);}}
  };

  // ---------- Anagrams ----------
  function anagramPool(difficulty){const p=WORD_CONTENT.anagramSets?.filter(x=>x.difficulty===difficulty);if(p?.length)return p;return (ANAGRAM_BANK[difficulty]||ANAGRAM_BANK.Medium).map((w,i)=>({id:`legacy-ana-${i}`,letters:[...w].sort().join(''),answers:[w],difficulty}));}
  const anagramsGame={
    id:'anagrams',name:'Anagrams',generatorVersion:4,description:byId.anagrams.description,defaultDifficulty:'Medium',difficulties:['Easy','Medium','Hard'],
    rules:{objective:'Rearrange every letter to form any valid full anagram.',items:['Use every displayed tile exactly once.','Any dictionary-valid full anagram is accepted, not only the originally curated answer.','You can remove the last tile or clear the whole attempt.','Hints target the intended familiar answer while alternate valid anagrams still solve the puzzle.']},
    async create(seed,difficulty='Medium'){const r=rng(`${seed}:anagrams:v4`),entry=pick(anagramPool(difficulty),r),answers=[...entry.answers],answer=pick(answers,r),letters=shuffle(entry.letters.split(''),r);if(letters.join('')===answer&&letters.length>1)[letters[0],letters[1]]=[letters[1],letters[0]];return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle:{contentId:entry.id,answer,validAnswers:answers,letters,generatorVersion:4},state:{selected:[],history:[],attempts:0}};},
    async save(a){return saveActive(a);},current(a){return a.state.selected.map(i=>a.puzzle.letters[i]).join('');},answers(a){return [...new Set([...(a.puzzle.validAnswers||[]),...acceptedAnagrams(a.puzzle.letters.join(''))])];},
    render(a){const word=this.current(a),board=`<div class="anagram-wrap"><div class="anagram-answer">${Array.from({length:a.puzzle.letters.length},(_,i)=>`<span>${word[i]||''}</span>`).join('')}</div><div class="anagram-tiles">${a.puzzle.letters.map((c,i)=>`<button data-anagram-tile="${i}" class="${a.state.selected.includes(i)?'used':''}" aria-pressed="${a.state.selected.includes(i)}">${c}</button>`).join('')}</div>${this.answers(a).length>1?`<p class="subtle">${this.answers(a).length} complete dictionary anagrams are accepted.</p>`:''}</div>`,controls=`<div class="toolbar"><button data-anagram-back>Remove last</button><button data-anagram-clear>Clear</button><button data-anagram-submit ${a.state.selected.length===a.puzzle.letters.length?'':'disabled'}>Submit</button></div>${a.completed?resultPanel(a,this,`<div><strong>${a.state.attempts}</strong><span>Attempts</span></div>`):''}`;main.innerHTML=baseGameShell(byId[this.id],a,board,controls);bindGameShell(this,a);this.bind(a);if(a.completed)bindResult(a,this);},
    bind(a){$$('[data-anagram-tile]').forEach(b=>b.onclick=()=>this.tile(a,+b.dataset.anagramTile));$('[data-anagram-back]').onclick=()=>this.back(a);$('[data-anagram-clear]').onclick=()=>this.clear(a);$('[data-anagram-submit]').onclick=()=>this.submit(a);window.onkeydown=e=>{if(a.completed||overlayRoot.innerHTML)return;const k=e.key.toUpperCase();if(/^[A-Z]$/.test(k)){const i=a.puzzle.letters.findIndex((c,j)=>c===k&&!a.state.selected.includes(j));if(i>=0){e.preventDefault();this.tile(a,i);}}else if(e.key==='Backspace'){e.preventDefault();this.back(a)}else if(e.key==='Enter'){e.preventDefault();this.submit(a)}};},
    async tile(a,i){if(a.completed)return;const pos=a.state.selected.indexOf(i);if(pos>=0)a.state.selected.splice(pos,1);else a.state.selected.push(i);await saveActive(a);this.render(a);},async back(a){if(!a.state.selected.length)return;a.state.selected.pop();await saveActive(a);this.render(a);},async clear(a){a.state.selected=[];await saveActive(a);this.render(a);},
    async submit(a){if(a.state.selected.length!==a.puzzle.letters.length)return;const word=this.current(a),answers=this.answers(a);a.state.attempts++;if(answers.includes(word)){a.puzzle.answer=word;await finishActive(a,{attempts:a.state.attempts,length:word.length,acceptedAnswers:answers.length});}else{toast('Not a valid English anagram for these tiles.');a.state.selected=[];await saveActive(a);}this.render(a);},
    hint(a){const candidates=a.puzzle.validAnswers,answer=candidates[0];toast(candidates.length>1?`Hint: one accepted ${answer.length}-letter answer begins with ${answer[0]}.`:`Hint: the answer begins with ${answer[0]} and ends with ${answer.at(-1)}.`);}
  };

  // ---------- Letter Hive ----------
  function hivePool(difficulty){const p=WORD_CONTENT.hiveBoards?.filter(x=>x.difficulty===difficulty);if(p?.length)return p;return HIVE_BOARDS.filter(x=>x.difficulty===difficulty).map((x,i)=>({...x,id:`legacy-hive-${i}`}));}
  const letterHiveGame={
    id:'letter-hive',name:'Letter Hive',generatorVersion:4,description:byId['letter-hive'].description,defaultDifficulty:'Medium',difficulties:['Easy','Medium','Hard'],
    rules:{objective:'Find words of four or more letters using only the seven hive letters and always including the center letter.',items:['The center letter must appear in every word.','Displayed letters may be reused within a word.','Words must contain at least four letters.','Any word in the broad accepted English dictionary that fits the hive letters is valid.']},
    async create(seed,difficulty='Medium'){const r=rng(`${seed}:hive:v4`),src=pick(hivePool(difficulty),r),outer=shuffle(src.letters.split('').filter(x=>x!==src.center),r),ratio={Easy:.35,Medium:.50,Hard:.65}[difficulty]||.5,target=Math.max(6,Math.ceil(src.answers.length*ratio)),avg=src.avgLength||src.answers.reduce((n,w)=>n+w.length,0)/src.answers.length,long=src.answers.filter(w=>w.length>=7).length,score=avg*2.1-src.answers.length*.05+long*.25;return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle:{contentId:src.id,letters:[src.center,...outer],center:src.center,answers:[...src.answers],target,difficultyScore:+score.toFixed(2),difficultyMetrics:{avgWordLength:+avg.toFixed(2),answerCount:src.answers.length,longWords:long,completionRatio:ratio},generatorVersion:4},state:{current:'',found:[],score:0}};},
    async save(a){return saveActive(a);},points(w){return w.length===4?1:w.length;},
    render(a){const outer=a.puzzle.letters.slice(1),current=a.state.current,board=`<div class="hive-wrap"><div class="hive-current">${esc(current)||'<span>TYPE A WORD</span>'}</div><div class="hive-board"><button data-hive-letter="${outer[0]}">${outer[0]}</button><button data-hive-letter="${outer[1]}">${outer[1]}</button><button data-hive-letter="${outer[2]}">${outer[2]}</button><button class="center" data-hive-letter="${a.puzzle.center}">${a.puzzle.center}</button><button data-hive-letter="${outer[3]}">${outer[3]}</button><button data-hive-letter="${outer[4]}">${outer[4]}</button><button data-hive-letter="${outer[5]}">${outer[5]}</button></div><div class="hive-progress"><strong>${a.state.found.length}</strong><span> / ${a.puzzle.target} words to goal</span><small>${a.state.score} points · ${hiveDictionaryWords(a.puzzle.center,a.puzzle.letters).length} dictionary words possible</small></div><div class="found-words">${a.state.found.length?a.state.found.slice().sort().map(w=>`<span>${w}</span>`).join(''):'<em>Found words will appear here.</em>'}</div></div>`,controls=`<div class="toolbar"><button data-hive-shuffle>Shuffle outer letters</button><button data-hive-back>⌫</button><button data-hive-submit>Submit</button></div>${a.completed?resultPanel(a,this,`<div><strong>${a.state.found.length}</strong><span>Words</span></div><div><strong>${a.state.score}</strong><span>Points</span></div>`):''}`;main.innerHTML=baseGameShell(byId[this.id],a,board,controls);bindGameShell(this,a);this.bind(a);if(a.completed)bindResult(a,this);},
    bind(a){$$('[data-hive-letter]').forEach(b=>b.onclick=()=>this.letter(a,b.dataset.hiveLetter));$('[data-hive-shuffle]').onclick=()=>{const r=rng(`${a.seed}:${Date.now()}`);a.puzzle.letters=[a.puzzle.center,...shuffle(a.puzzle.letters.slice(1),r)];this.render(a)};$('[data-hive-back]').onclick=()=>this.back(a);$('[data-hive-submit]').onclick=()=>this.submit(a);window.onkeydown=e=>{if(a.completed||overlayRoot.innerHTML)return;const k=e.key.toUpperCase();if(/^[A-Z]$/.test(k)&&a.puzzle.letters.includes(k)){e.preventDefault();this.letter(a,k)}else if(e.key==='Backspace'){e.preventDefault();this.back(a)}else if(e.key==='Enter'){e.preventDefault();this.submit(a)}};},
    async letter(a,c){a.state.current+=c;await saveActive(a);this.render(a);},async back(a){a.state.current=a.state.current.slice(0,-1);await saveActive(a);this.render(a);},
    async submit(a){const w=a.state.current.toUpperCase();if(w.length<4){toast('Use at least four letters.');return;}if(!w.includes(a.puzzle.center)){toast(`Every word must include ${a.puzzle.center}.`);return;}if(a.state.found.includes(w)){toast('Already found.');a.state.current='';this.render(a);return;}if(!isAcceptedWord(w)||!wordUsesOnlyLetters(w,a.puzzle.letters)){toast('Not in the accepted English dictionary for this hive.');a.state.current='';await saveActive(a);this.render(a);return;}a.state.found.push(w);a.state.score+=this.points(w);a.state.current='';if(a.state.found.length>=a.puzzle.target)await finishActive(a,{words:a.state.found.length,score:a.state.score});else await saveActive(a);this.render(a);},
    hint(a){const missing=a.puzzle.answers.filter(w=>!a.state.found.includes(w)).sort((x,y)=>y.length-x.length);if(!missing.length)return;const w=missing[0];toast(`Hint: an unfound ${w.length}-letter word begins with ${w[0]}.`);}
  };

  // ---------- Word Grid ----------
  function wordGridPool(difficulty){const p=WORD_CONTENT.wordGridBoards?.filter(x=>x.difficulty===difficulty);if(p?.length)return p;return WORD_GRID_BOARDS.filter(x=>x.difficulty===difficulty).map((x,i)=>({...x,id:`legacy-grid-${i}`,grid:x.grid.split('')}));}
  const wordGridGame={
    id:'word-grid',name:'Word Grid',generatorVersion:4,description:byId['word-grid'].description,defaultDifficulty:'Medium',difficulties:['Easy','Medium','Hard'],
    rules:{objective:'Trace words through neighboring letters.',items:['Move horizontally, vertically, or diagonally.','A cell may be used only once in the same word.','Release to submit the traced word.','Any traced word of at least three letters in the broad accepted English dictionary counts.']},
    async create(seed,difficulty='Medium'){const r=rng(`${seed}:word-grid:v4`),src=pick(wordGridPool(difficulty),r),ratio={Easy:.35,Medium:.45,Hard:.55}[difficulty]||.45,target=Math.max(5,Math.ceil(src.answers.length*ratio)),avg=src.answers.reduce((n,w)=>n+w.length,0)/src.answers.length,long=src.answers.filter(w=>w.length>=5).length;return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle:{contentId:src.id,n:4,grid:Array.isArray(src.grid)?[...src.grid]:src.grid.split(''),answers:[...src.answers],target,difficultyScore:src.score||+(avg*2.2-long*.03).toFixed(2),difficultyMetrics:{avgWordLength:+avg.toFixed(2),answerCount:src.answers.length,longWords:long,completionRatio:ratio},generatorVersion:4},state:{found:[],path:[],selected:0}};},
    async save(a){return saveActive(a);},word(a){return a.state.path.map(i=>a.puzzle.grid[i]).join('');},
    render(a){const board=`<div class="word-grid-wrap"><div class="word-grid-current">${this.word(a)||'Trace a word'}</div><div class="word-grid-board">${a.puzzle.grid.map((c,i)=>`<button class="wg-cell ${a.state.path.includes(i)?'path':''} ${i===a.state.selected?'selected':''}" data-wg="${i}">${c}</button>`).join('')}</div><div class="hive-progress"><strong>${a.state.found.length}</strong><span> / ${a.puzzle.target} words to goal</span><small>${a.puzzle.answers.length} curated targets · extra dictionary words also count</small></div><div class="found-words">${a.state.found.length?a.state.found.slice().sort().map(w=>`<span>${w}</span>`).join(''):'<em>Found words will appear here.</em>'}</div></div>`,controls=`<div class="toolbar"><button data-wg-clear>Clear path</button><button data-wg-submit>Submit</button></div>${a.completed?resultPanel(a,this,`<div><strong>${a.state.found.length}</strong><span>Words</span></div>`):''}`;main.innerHTML=baseGameShell(byId[this.id],a,board,controls);bindGameShell(this,a);this.bind(a);if(a.completed)bindResult(a,this);},
    bind(a){let dragging=false;const n=a.puzzle.n,canAdd=i=>{if(!a.state.path.length)return true;const last=a.state.path[a.state.path.length-1];if(a.state.path.includes(i))return false;const [r,c]=[Math.floor(last/n),last%n],[rr,cc]=[Math.floor(i/n),i%n];return Math.max(Math.abs(r-rr),Math.abs(c-cc))===1;},paint=i=>{if(canAdd(i)){a.state.path.push(i);a.state.selected=i;$$('.wg-cell').forEach((el,j)=>el.classList.toggle('path',a.state.path.includes(j)));const cur=$('.word-grid-current');if(cur)cur.textContent=this.word(a);}};$$('[data-wg]').forEach(b=>{const i=+b.dataset.wg;b.onpointerdown=e=>{e.preventDefault();dragging=true;a.state.path=[];paint(i);b.setPointerCapture?.(e.pointerId)};b.onpointerenter=()=>{if(dragging)paint(i)};});document.onpointerup=async()=>{if(!dragging)return;dragging=false;await this.submit(a)};document.onpointercancel=()=>{dragging=false;a.state.path=[];this.render(a)};$('[data-wg-clear]').onclick=()=>{a.state.path=[];this.render(a)};$('[data-wg-submit]').onclick=()=>this.submit(a);window.onkeydown=e=>{if(a.completed||overlayRoot.innerHTML)return;const i=a.state.selected,r=Math.floor(i/n),c=i%n;let ni=null;if(e.key==='ArrowUp')ni=(r?i-n:null);else if(e.key==='ArrowDown')ni=(r<n-1?i+n:null);else if(e.key==='ArrowLeft')ni=(c?i-1:null);else if(e.key==='ArrowRight')ni=(c<n-1?i+1:null);else if(e.key==='Backspace'){e.preventDefault();a.state.path.pop();a.state.selected=a.state.path.at(-1)??a.state.selected;this.render(a);return}else if(e.key==='Enter'){e.preventDefault();this.submit(a);return}else return;if(ni!==null){e.preventDefault();if(!a.state.path.length)a.state.path=[i];if(canAdd(ni)){a.state.path.push(ni);a.state.selected=ni;}else a.state.selected=ni;this.render(a);}};},
    async submit(a){const w=this.word(a);if(w.length>=3&&isAcceptedWord(w)&&!a.state.found.includes(w)){a.state.found.push(w);toast(`${w} found`);}else if(w.length>=3&&a.state.found.includes(w))toast('Already found');else if(w.length>=3)toast('Not in the accepted English dictionary');a.state.path=[];if(a.state.found.length>=a.puzzle.target)await finishActive(a,{words:a.state.found.length});else await saveActive(a);this.render(a);},
    hint(a){const w=a.puzzle.answers.find(w=>!a.state.found.includes(w));if(w)toast(`Hint: look for a ${w.length}-letter word beginning with ${w[0]}.`);}
  };

  // ---------- Theme Trail ----------
  function buildThemeTrail(src){
    const n=5, order=[];
    for(let r=0;r<n;r++){const cols=[0,1,2,3,4];if(r%2)cols.reverse();for(const c of cols)order.push(r*n+c);}
    const letters=Array(n*n).fill(''),paths=[];let k=0;
    for(const word of src.words){const path=order.slice(k,k+word.length);if(path.length!==word.length)throw new Error('Legacy Theme Trail content does not cover the board');path.forEach((cell,j)=>letters[cell]=word[j]);paths.push(path);k+=word.length;}
    if(k!==n*n)throw new Error('Legacy Theme Trail must cover exactly 25 cells');
    return {n,theme:src.theme,words:[...src.words],grid:letters,paths,difficulty:src.difficulty};
  }

  function themeTrailPool(difficulty){const p=WORD_CONTENT.themeTrailBoards?.filter(x=>x.difficulty===difficulty);if(p?.length)return p;return THEME_TRAILS.filter(x=>x.difficulty===difficulty).map((x,i)=>({...buildThemeTrail(x),id:`legacy-trail-${i}`}));}
  const themeTrailGame={
    id:'theme-trail',name:'Theme Trail',generatorVersion:4,description:byId['theme-trail'].description,defaultDifficulty:'Medium',difficulties:['Easy','Medium','Hard'],rules:{objective:'Find every themed word by tracing adjacent letters.',items:['All answers belong to the displayed theme.','Trace neighboring cells without reusing a cell inside the same word.','Correct words lock into the board.','Every cell belongs to exactly one themed answer.']},
    async create(seed,difficulty='Medium'){const r=rng(`${seed}:theme-trail:v4`),src=pick(themeTrailPool(difficulty),r),puzzle={n:5,theme:src.theme,words:[...src.words],grid:[...src.grid],paths:src.paths.map(p=>[...p]),contentId:src.id,generatorVersion:4};return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle,state:{found:[],path:[],selected:0}};},
    async save(a){return saveActive(a);},word(a){return a.state.path.map(i=>a.puzzle.grid[i]).join('');},locked(a){const set=new Set();a.state.found.forEach(w=>{const j=a.puzzle.words.indexOf(w);if(j>=0)a.puzzle.paths[j].forEach(i=>set.add(i));});return set;},
    render(a){const locked=this.locked(a),board=`<div class="theme-trail-wrap"><div class="theme-banner"><span>Theme</span><strong>${esc(a.puzzle.theme)}</strong></div><div class="theme-trail-board">${a.puzzle.grid.map((c,i)=>`<button data-trail="${i}" class="trail-cell ${locked.has(i)?'locked':''} ${a.state.path.includes(i)?'path':''} ${i===a.state.selected?'selected':''}">${c}</button>`).join('')}</div><div class="theme-answers">${a.puzzle.words.map(w=>`<span class="${a.state.found.includes(w)?'found':''}">${a.state.found.includes(w)?w:`${w.length} letters`}</span>`).join('')}</div></div>`,controls=`<div class="toolbar"><button data-trail-clear>Clear path</button><button data-trail-submit>Submit</button></div>${a.completed?resultPanel(a,this,`<div><strong>${a.state.found.length}</strong><span>Words</span></div>`):''}`;main.innerHTML=baseGameShell(byId[this.id],a,board,controls);bindGameShell(this,a);this.bind(a);if(a.completed)bindResult(a,this);},
    bind(a){let dragging=false;const canAdd=i=>{const locked=this.locked(a);if(locked.has(i)&&!a.state.path.includes(i))return false;if(!a.state.path.length)return true;const last=a.state.path.at(-1);if(a.state.path.includes(i))return false;const r=Math.floor(last/5),c=last%5,rr=Math.floor(i/5),cc=i%5;return Math.max(Math.abs(r-rr),Math.abs(c-cc))===1;},add=i=>{if(canAdd(i)){a.state.path.push(i);a.state.selected=i;$$('.trail-cell').forEach((el,j)=>el.classList.toggle('path',a.state.path.includes(j)));}};$$('[data-trail]').forEach(b=>{const i=+b.dataset.trail;b.onpointerdown=e=>{e.preventDefault();dragging=true;a.state.path=[];add(i);b.setPointerCapture?.(e.pointerId)};b.onpointerenter=()=>{if(dragging)add(i)};});document.onpointerup=async()=>{if(!dragging)return;dragging=false;await this.submit(a)};document.onpointercancel=()=>{dragging=false;a.state.path=[];this.render(a)};$('[data-trail-clear]').onclick=()=>{a.state.path=[];this.render(a)};$('[data-trail-submit]').onclick=()=>this.submit(a);window.onkeydown=e=>{if(a.completed||overlayRoot.innerHTML)return;let i=a.state.selected,r=Math.floor(i/5),c=i%5,ni=null;if(e.key==='ArrowUp')ni=r?i-5:null;else if(e.key==='ArrowDown')ni=r<4?i+5:null;else if(e.key==='ArrowLeft')ni=c?i-1:null;else if(e.key==='ArrowRight')ni=c<4?i+1:null;else if(e.key==='Backspace'){e.preventDefault();a.state.path.pop();this.render(a);return}else if(e.key==='Enter'){e.preventDefault();this.submit(a);return}else return;if(ni!==null){e.preventDefault();if(canAdd(ni)){a.state.path.push(ni);a.state.selected=ni;}else a.state.selected=ni;this.render(a);}};},
    async submit(a){const w=this.word(a),rev=[...w].reverse().join(''),target=a.puzzle.words.find(x=>(x===w||x===rev)&&!a.state.found.includes(x));if(target){const j=a.puzzle.words.indexOf(target),path=a.puzzle.paths[j],same=a.state.path.length===path.length&&a.state.path.every((v,k)=>v===path[k]||v===path[path.length-1-k]);if(same){a.state.found.push(target);toast(`${target} found`);}}else if(w.length)toast('That path is not one of the themed answers.');a.state.path=[];if(a.state.found.length===a.puzzle.words.length)await finishActive(a,{theme:a.puzzle.theme,words:a.state.found.length});else await saveActive(a);this.render(a);},
    hint(a){const w=a.puzzle.words.find(w=>!a.state.found.includes(w));if(!w)return;const j=a.puzzle.words.indexOf(w),start=a.puzzle.paths[j][0];toast(`Hint: an unfound ${w.length}-letter word starts at row ${Math.floor(start/5)+1}, column ${start%5+1}.`);}
  };

  // ---------- Word Pieces ----------
  function piecesPool(difficulty){const p=WORD_CONTENT.wordPieceBoards?.filter(x=>x.difficulty===difficulty);if(p?.length)return p;return WORD_PIECES_BOARDS.filter(x=>x.difficulty===difficulty).map((x,i)=>({...x,id:`legacy-pieces-${i}`}));}
  const wordPiecesGame={
    id:'word-pieces',name:'Word Pieces',generatorVersion:4,description:byId['word-pieces'].description,defaultDifficulty:'Medium',difficulties:['Easy','Medium','Hard'],rules:{objective:'Combine chunks in order to build every constructible compound word on the board.',items:['Tap chunks in the order they appear in the word.','A chunk tile can be used once in a single submission.','The answer list is generated from the full curated compound lexicon for these pieces.','Find every accepted compound to finish.']},
    async create(seed,difficulty='Medium'){const r=rng(`${seed}:pieces:v4`),src=pick(piecesPool(difficulty),r);return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle:{contentId:src.id,pieces:[...src.pieces],answers:[...src.answers],generatorVersion:4},state:{selected:[],found:[]}};},
    async save(a){return saveActive(a);},current(a){return a.state.selected.map(i=>a.puzzle.pieces[i]).join('');},
    render(a){const board=`<div class="pieces-wrap"><div class="pieces-current">${this.current(a)||'Combine pieces'}</div><div class="pieces-grid">${a.puzzle.pieces.map((p,i)=>`<button data-piece="${i}" class="${a.state.selected.includes(i)?'selected':''}">${p}</button>`).join('')}</div><div class="piece-answers">${a.puzzle.answers.map(w=>`<span class="${a.state.found.includes(w)?'found':''}">${a.state.found.includes(w)?w:`${w.length} letters`}</span>`).join('')}</div></div>`,controls=`<div class="toolbar"><button data-piece-back>Remove last</button><button data-piece-clear>Clear</button><button data-piece-submit>Submit</button></div>${a.completed?resultPanel(a,this,`<div><strong>${a.state.found.length}</strong><span>Words</span></div>`):''}`;main.innerHTML=baseGameShell(byId[this.id],a,board,controls);bindGameShell(this,a);this.bind(a);if(a.completed)bindResult(a,this);},
    bind(a){$$('[data-piece]').forEach(b=>b.onclick=()=>this.tile(a,+b.dataset.piece));$('[data-piece-back]').onclick=()=>this.back(a);$('[data-piece-clear]').onclick=()=>this.clear(a);$('[data-piece-submit]').onclick=()=>this.submit(a);window.onkeydown=e=>{if(a.completed||overlayRoot.innerHTML)return;if(e.key==='Backspace'){e.preventDefault();this.back(a)}else if(e.key==='Enter'){e.preventDefault();this.submit(a)}};},async tile(a,i){if(a.state.selected.includes(i))a.state.selected=a.state.selected.filter(x=>x!==i);else a.state.selected.push(i);await saveActive(a);this.render(a);},async back(a){a.state.selected.pop();await saveActive(a);this.render(a);},async clear(a){a.state.selected=[];await saveActive(a);this.render(a);},
    async submit(a){const w=this.current(a);if(!w)return;if(a.puzzle.answers.includes(w)&&!a.state.found.includes(w)){a.state.found.push(w);toast(`${w} found`);}else if(a.state.found.includes(w))toast('Already found');else toast('Those pieces do not form an accepted compound.');a.state.selected=[];if(a.state.found.length===a.puzzle.answers.length)await finishActive(a,{words:a.state.found.length});else await saveActive(a);this.render(a);},
    hint(a){const w=a.puzzle.answers.find(w=>!a.state.found.includes(w));if(!w)return;const possible=a.puzzle.pieces.filter(p=>w.startsWith(p));toast(`Hint: ${w.length}-letter target begins with ${possible[0]||w.slice(0,2)}.`);}
  };

  // ---------- Mini Crossword ----------
  function crosswordEntry(a){const entries=a.puzzle.entries||[],matching=entries.filter(e=>e.cells.includes(a.state.selected));return matching.find(e=>e.direction===a.state.direction)||matching[0]||entries[0];}
  function crosswordNextOpen(p,start,dr,dc){let r=Math.floor(start/5),c=start%5;for(let step=0;step<5;step++){r+=dr;c+=dc;if(r<0||c<0||r>=5||c>=5)return start;const i=r*5+c;if(p.grid[i]!=='#')return i;}return start;}
  const miniCrosswordGame={
    id:'mini-crossword',name:'Mini Crossword',generatorVersion:4,description:byId['mini-crossword'].description,defaultDifficulty:'Medium',difficulties:['Easy','Medium','Hard'],
    rules:{objective:'Fill the blocked 5×5 crossword from its Across and Down clues.',items:['Black squares separate entries.','Every open square belongs to one or two clue answers.','Tap a crossing again to switch Across/Down.','Use arrows, clue lists, or the mobile keyboard to move efficiently.']},
    async create(seed,difficulty='Medium'){const r=rng(`${seed}:crossword:v4`),pool=WORD_CONTENT.miniCrosswords?.filter(x=>x.difficulty===difficulty)||[],src=pick(pool.length?pool:WORD_CONTENT.miniCrosswords,r);if(!src)throw new Error('Mini Crossword content pack missing');const solution=src.grid.map(x=>x==='#'?'#':x);return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle:{contentId:src.id,grid:[...src.grid],entries:src.entries.map(e=>({...e,cells:[...e.cells]})),numbers:{...src.numbers},solution,generatorVersion:4},state:{board:src.grid.map(x=>x==='#'?'#':''),selected:src.grid.findIndex(x=>x!=='#'),direction:'across',history:[],mistakes:0}};},
    async save(a){return saveActive(a);},
    render(a){const entry=crosswordEntry(a),board=`<div class="crossword-wrap"><div class="current-clue"><span>${entry.direction==='across'?'Across':'Down'} ${entry.number}</span><strong>${esc(entry.clue)}</strong></div><div class="crossword-board">${a.puzzle.grid.map((sol,i)=>sol==='#'?'<div class="cross-cell block" aria-hidden="true"></div>':`<button data-cross-cell="${i}" class="cross-cell ${i===a.state.selected?'selected':''}" aria-label="Crossword row ${Math.floor(i/5)+1}, column ${i%5+1}${a.puzzle.numbers[i]?`, clue ${a.puzzle.numbers[i]}`:''}, ${a.state.board[i]||'empty'}"><small>${a.puzzle.numbers[i]||''}</small><strong>${a.state.board[i]}</strong></button>`).join('')}</div><div class="cross-clues"><section><h3>Across</h3>${a.puzzle.entries.filter(e=>e.direction==='across').map(e=>`<button data-cross-clue="${e.start}:${e.direction}"><b>${e.number}</b>${esc(e.clue)}</button>`).join('')}</section><section><h3>Down</h3>${a.puzzle.entries.filter(e=>e.direction==='down').map(e=>`<button data-cross-clue="${e.start}:${e.direction}"><b>${e.number}</b>${esc(e.clue)}</button>`).join('')}</section></div></div>`,controls=`<div class="cross-keyboard">${letterKeyboard({})}</div><div class="toolbar"><button data-cross-toggle>${a.state.direction==='across'?'Across':'Down'}</button><button data-cross-undo>Undo</button></div>${a.completed?resultPanel(a,this,`<div><strong>${a.state.mistakes}</strong><span>Mistakes</span></div>`):''}`;main.innerHTML=baseGameShell(byId[this.id],a,board,controls);bindGameShell(this,a);this.bind(a);if(a.completed)bindResult(a,this);},
    bind(a){$$('[data-cross-cell]').forEach(b=>b.onclick=()=>{const i=+b.dataset.crossCell;if(i===a.state.selected){const dirs=a.puzzle.entries.filter(e=>e.cells.includes(i)).map(e=>e.direction);if(dirs.length>1)a.state.direction=a.state.direction==='across'?'down':'across';}else{a.state.selected=i;const dirs=a.puzzle.entries.filter(e=>e.cells.includes(i)).map(e=>e.direction);if(!dirs.includes(a.state.direction))a.state.direction=dirs[0]||'across';}this.render(a)});$$('[data-cross-clue]').forEach(b=>b.onclick=()=>{const [i,d]=b.dataset.crossClue.split(':');a.state.direction=d;a.state.selected=+i;this.render(a)});$$('.key').forEach(k=>k.onclick=()=>{const key=k.dataset.key;if(/^[A-Z]$/.test(key))this.enter(a,key);else if(key==='BACKSPACE')this.erase(a);else if(key==='ENTER'){a.state.direction=a.state.direction==='across'?'down':'across';this.render(a)}});$('[data-cross-toggle]').onclick=()=>{a.state.direction=a.state.direction==='across'?'down':'across';this.render(a)};$('[data-cross-undo]').onclick=()=>this.undo(a);window.onkeydown=e=>{if(a.completed||overlayRoot.innerHTML)return;const k=e.key.toUpperCase();if(/^[A-Z]$/.test(k)){e.preventDefault();this.enter(a,k);return}if(e.key==='Backspace'||e.key==='Delete'){e.preventDefault();this.erase(a);return}let ni=a.state.selected;if(e.key==='ArrowUp')ni=crosswordNextOpen(a.puzzle,ni,-1,0);else if(e.key==='ArrowDown')ni=crosswordNextOpen(a.puzzle,ni,1,0);else if(e.key==='ArrowLeft')ni=crosswordNextOpen(a.puzzle,ni,0,-1);else if(e.key==='ArrowRight')ni=crosswordNextOpen(a.puzzle,ni,0,1);else if(e.key===' '){e.preventDefault();a.state.direction=a.state.direction==='across'?'down':'across';this.render(a);return}else return;e.preventDefault();a.state.selected=ni;this.render(a)};},
    async enter(a,ch){const i=a.state.selected;if(a.puzzle.grid[i]==='#')return;const old=a.state.board[i];a.state.history.push([i,old]);a.state.board[i]=ch;if(state.settings.playMode==='challenge'&&ch!==a.puzzle.solution[i])a.state.mistakes++;const entry=crosswordEntry(a),pos=entry.cells.indexOf(i);if(pos>=0&&pos<entry.cells.length-1)a.state.selected=entry.cells[pos+1];if(a.state.board.every((v,j)=>a.puzzle.solution[j]==='#'||v===a.puzzle.solution[j]))await finishActive(a,{mistakes:a.state.mistakes,size:5});else await saveActive(a);this.render(a);},
    async erase(a){const i=a.state.selected,entry=crosswordEntry(a),pos=entry.cells.indexOf(i);if(a.state.board[i]){a.state.history.push([i,a.state.board[i]]);a.state.board[i]='';}else if(pos>0)a.state.selected=entry.cells[pos-1];await saveActive(a);this.render(a);},async undo(a){const h=a.state.history.pop();if(!h)return;a.state.board[h[0]]=h[1];a.state.selected=h[0];await saveActive(a);this.render(a);},
    async hint(a){const i=a.state.selected;if(a.puzzle.solution[i]==='#')return;a.state.board[i]=a.puzzle.solution[i];toast(`Hint: this square is ${a.puzzle.solution[i]}.`);if(a.state.board.every((v,j)=>a.puzzle.solution[j]==='#'||v===a.puzzle.solution[j]))await finishActive(a,{mistakes:a.state.mistakes,size:5});else await saveActive(a);this.render(a);}
  };

  function cryptoCipher(seed){const alpha='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),r=rng(`${seed}:cipher`),arr=shuffle(alpha,r);for(let shift=0;shift<26;shift++){const cand=arr.slice(shift).concat(arr.slice(0,shift));if(cand.every((x,i)=>x!==alpha[i]))return Object.fromEntries(alpha.map((x,i)=>[x,cand[i]]));}return Object.fromEntries(alpha.map((x,i)=>[x,alpha[(i+1)%26]]));}
  function cryptoEncode(text,map){return text.replace(/[A-Z]/g,c=>map[c]);}

  // ---------- Cryptogram ----------
  const cryptogramGame={
    id:'cryptogram',name:'Cryptogram',generatorVersion:4,description:byId.cryptogram.description,defaultDifficulty:'Medium',difficulties:['Easy','Medium','Hard'],rules:{objective:'Decode the substitution cipher by assigning plaintext letters to encrypted letters.',items:['Every encrypted letter always represents the same plaintext letter.','No two encrypted letters may map to the same plaintext letter.','Spaces and punctuation are unchanged.','Wave 4 uses a large corpus of original in-project texts rather than a tiny quote bank.']},
    async create(seed,difficulty='Medium'){const r=rng(`${seed}:quote:v4`),pool=WORD_CONTENT.cryptograms?.filter(x=>x.difficulty===difficulty)||[],src=pick(pool.length?pool:WORD_CONTENT.cryptograms,r);if(!src)throw new Error('Cryptogram content pack missing');const plain=src.text.toUpperCase(),plainToCipher=cryptoCipher(`${seed}:v4`),cipher=cryptoEncode(plain,plainToCipher),correct={};for(const [p,c] of Object.entries(plainToCipher))correct[c]=p;const first=[...cipher].find(c=>/[A-Z]/.test(c));return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle:{contentId:src.id,plain,cipher,correct,difficultyScore:src.score,generatorVersion:4},state:{mapping:{},selected:first||'A',history:[]}};},
    async save(a){return saveActive(a);},decoded(a){return a.puzzle.cipher.replace(/[A-Z]/g,c=>a.state.mapping[c]||'_');},
    render(a){const tokens=[...a.puzzle.cipher].map(c=>/[A-Z]/.test(c)?`<button class="crypto-letter ${a.state.selected===c?'selected':''}" data-crypto="${c}" aria-label="Cipher ${c}, mapped to ${a.state.mapping[c]||'unknown'}"><span>${c}</span><strong>${a.state.mapping[c]||'·'}</strong></button>`:`<span class="crypto-punct">${c===' '?'&nbsp;':esc(c)}</span>`).join(''),mappings='ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter(c=>a.puzzle.cipher.includes(c)).map(c=>`<button class="crypto-map ${a.state.selected===c?'selected':''}" data-crypto="${c}"><span>${c}</span><strong>${a.state.mapping[c]||'·'}</strong></button>`).join(''),board=`<div class="crypto-wrap"><div class="crypto-text">${tokens}</div><div class="crypto-mappings">${mappings}</div><div class="crypto-selected">Selected cipher letter: <strong>${a.state.selected}</strong></div><div class="letter-keyboard crypto-keyboard">${['QWERTYUIOP','ASDFGHJKL','ZXCVBNM'].map((r,i)=>`<div class="key-row">${r.split('').map(c=>`<button class="key" data-key="${c}">${c}</button>`).join('')}${i===2?'<button class="key wide" data-key="BACKSPACE">⌫</button>':''}</div>`).join('')}</div></div>`,controls=`<div class="toolbar"><button data-crypto-clear>Clear mapping</button><button data-crypto-undo>Undo</button></div>${a.completed?resultPanel(a,this,`<div><strong>${Object.keys(a.state.mapping).length}</strong><span>Mappings</span></div>`):''}`;main.innerHTML=baseGameShell(byId[this.id],a,board,controls);bindGameShell(this,a);this.bind(a);if(a.completed)bindResult(a,this);},
    bind(a){$$('[data-crypto]').forEach(b=>b.onclick=()=>{a.state.selected=b.dataset.crypto;this.render(a)});$$('.key').forEach(k=>k.onclick=()=>{const key=k.dataset.key;if(/^[A-Z]$/.test(key))this.assign(a,key);else if(key==='BACKSPACE')this.clear(a)});$('[data-crypto-clear]').onclick=()=>this.clear(a);$('[data-crypto-undo]').onclick=()=>this.undo(a);window.onkeydown=e=>{if(a.completed||overlayRoot.innerHTML)return;const k=e.key.toUpperCase();if(/^[A-Z]$/.test(k)){e.preventDefault();this.assign(a,k)}else if(e.key==='Backspace'||e.key==='Delete'){e.preventDefault();this.clear(a)}};},
    async assign(a,plain){const c=a.state.selected;if(!c)return;const owner=Object.keys(a.state.mapping).find(x=>x!==c&&a.state.mapping[x]===plain);if(owner){toast(`${plain} is already assigned to ${owner}.`);return;}a.state.history.push([c,a.state.mapping[c]||null]);a.state.mapping[c]=plain;const used=[...new Set(a.puzzle.cipher.match(/[A-Z]/g)||[])];if(used.every(x=>a.state.mapping[x]===a.puzzle.correct[x]))await finishActive(a,{mappings:used.length});else await saveActive(a);this.render(a);},async clear(a){const c=a.state.selected;if(!c||!a.state.mapping[c])return;a.state.history.push([c,a.state.mapping[c]]);delete a.state.mapping[c];await saveActive(a);this.render(a);},async undo(a){const h=a.state.history.pop();if(!h)return;if(h[1]===null)delete a.state.mapping[h[0]];else a.state.mapping[h[0]]=h[1];a.state.selected=h[0];await saveActive(a);this.render(a);},
    async hint(a){const unresolved=[...new Set(a.puzzle.cipher.match(/[A-Z]/g)||[])].filter(c=>a.state.mapping[c]!==a.puzzle.correct[c]);if(!unresolved.length)return;unresolved.sort((x,y)=>a.puzzle.cipher.split(y).length-a.puzzle.cipher.split(x).length);const c=unresolved[0],plain=a.puzzle.correct[c],owner=Object.keys(a.state.mapping).find(x=>x!==c&&a.state.mapping[x]===plain);if(owner)delete a.state.mapping[owner];a.state.selected=c;await this.assign(a,plain);toast(`Hint: ${c} stands for ${plain}.`);}
  };

  // ---------- Shared Latin-square helpers ----------
  function latinSolution(n,r){
    const rows=shuffle(Array.from({length:n},(_,i)=>i),r),cols=shuffle(Array.from({length:n},(_,i)=>i),r),symbols=shuffle(Array.from({length:n},(_,i)=>i+1),r);
    return Array.from({length:n*n},(_,i)=>symbols[(rows[Math.floor(i/n)]+cols[i%n])%n]);
  }
  function rcNeighbors(i,n){const r=Math.floor(i/n),c=i%n,out=[];if(r)out.push(i-n);if(r<n-1)out.push(i+n);if(c)out.push(i-1);if(c<n-1)out.push(i+1);return out;}
  function orthComponents(mask,n,accept){const seen=new Set(),out=[];for(let i=0;i<n*n;i++){if(seen.has(i)||!accept(mask[i],i))continue;const comp=[],q=[i];seen.add(i);while(q.length){const x=q.pop();comp.push(x);for(const y of rcNeighbors(x,n))if(!seen.has(y)&&accept(mask[y],y)){seen.add(y);q.push(y)}}out.push(comp)}return out;}

  // ---------- Unequal ----------
  function unequalRelations(solution,n,r,density){
    const pairs=[];for(let rr=0;rr<n;rr++)for(let c=0;c<n;c++){const i=rr*n+c;if(c<n-1)pairs.push([i,i+1]);if(rr<n-1)pairs.push([i,i+n]);}
    return shuffle(pairs,r).slice(0,Math.max(n,Math.round(pairs.length*density))).map(([a,b])=>({a,b,lt:solution[a]<solution[b]}));
  }
  function unequalCandidateOK(board,n,rels,i,v){const rr=Math.floor(i/n),cc=i%n;for(let c=0;c<n;c++)if(c!==cc&&board[rr*n+c]===v)return false;for(let r=0;r<n;r++)if(r!==rr&&board[r*n+cc]===v)return false;for(const rel of rels){if(rel.a!==i&&rel.b!==i)continue;const j=rel.a===i?rel.b:rel.a,w=board[j];if(w==null)continue;const lhs=rel.a===i?v:w,rhs=rel.b===i?v:w;if(rel.lt?!(lhs<rhs):!(lhs>rhs))return false;}return true;}
  function countUnequalSolutions(givens,n,rels,limit=2){const b=[...givens];let count=0;function rec(){if(count>=limit)return;let bi=-1,bopts=null;for(let i=0;i<b.length;i++)if(b[i]==null){const opts=[];for(let v=1;v<=n;v++)if(unequalCandidateOK(b,n,rels,i,v))opts.push(v);if(!opts.length)return;if(!bopts||opts.length<bopts.length){bi=i;bopts=opts;if(opts.length===1)break;}}if(bi<0){count++;return;}for(const v of bopts){b[bi]=v;rec();b[bi]=null;if(count>=limit)return;}}rec();return count;}
  function generateUnequal(seed,difficulty){const cfg={Easy:[4,.55,.62],Medium:[5,.42,.72],Hard:[6,.30,.78]}[difficulty]||[5,.42,.72],n=cfg[0],r=rng(`${seed}:unequal`),solution=latinSolution(n,r),relations=unequalRelations(solution,n,r,cfg[1]),givens=[...solution],order=shuffle(Array.from({length:n*n},(_,i)=>i),r),target=Math.round(n*n*cfg[2]);let removed=0;for(const i of order){const old=givens[i];givens[i]=null;if(countUnequalSolutions(givens,n,relations,2)===1){removed++;if(removed>=target)break;}else givens[i]=old;}return {n,solution,givens,relations};}
  function unequalComplete(p,b){if(!Array.isArray(b)||b.length!==p.n*p.n||!b.every(v=>Number.isInteger(v)&&v>=1&&v<=p.n)||!p.givens.every((v,i)=>v==null||b[i]===v))return false;if(b.some(v=>v==null))return false;for(let i=0;i<b.length;i++)if(!unequalCandidateOK(b,p.n,p.relations,i,b[i]))return false;return true;}
  const unequalGame={
    id:'unequal',name:'Unequal',description:byId.unequal.description,defaultDifficulty:'Medium',difficulties:['Easy','Medium','Hard'],
    rules:{objective:'Fill the Latin square while respecting every inequality.',items:['Each row and column contains every number from 1 to the board size exactly once.','A < B means the first neighboring cell must be smaller than the second.','Rotated inequality signs apply vertically.','Fill every cell to solve the puzzle.']},
    async create(seed,difficulty='Medium'){const puzzle=generateUnequal(seed,difficulty);return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle,state:{board:[...puzzle.givens],selected:puzzle.givens.findIndex(v=>v==null),history:[],mistakes:0}};},
    async save(a){return saveActive(a);},
    render(a){const {n,relations,givens,solution}=a.puzzle,relMap=new Map();for(const x of relations)relMap.set(`${x.a}:${x.b}`,x);const cells=a.state.board.map((v,i)=>{const r=Math.floor(i/n),c=i%n;let right='',down='';if(c<n-1){const rel=relMap.get(`${i}:${i+1}`);if(rel)right=rel.lt?'&lt;':'&gt;';}if(r<n-1){const rel=relMap.get(`${i}:${i+n}`);if(rel)down=rel.lt?'&lt;':'&gt;';}const given=givens[i]!=null,wrong=v!=null&&v!==solution[i]&&state.settings.playMode==='challenge';return `<button class="unequal-cell ${given?'given':''} ${i===a.state.selected?'selected':''} ${wrong?'wrong':''}" data-unequal="${i}" aria-label="Row ${r+1}, column ${c+1}, ${v==null?'empty':v}"><strong>${v??''}</strong>${right?`<i class="ineq-right">${right}</i>`:''}${down?`<i class="ineq-down">${down}</i>`:''}</button>`}).join('');const pad=Array.from({length:n},(_,k)=>`<button data-unequal-value="${k+1}">${k+1}</button>`).join('');main.innerHTML=baseGameShell(byId[this.id],a,`<div class="unequal-board" style="grid-template-columns:repeat(${n},1fr)">${cells}</div>`,`<div class="number-pad">${pad}<button data-unequal-value="clear">Clear</button><button data-unequal-undo>Undo</button></div>${a.completed?resultPanel(a,this,`<div><strong>${n}×${n}</strong><span>Board</span></div>`):''}`);bindGameShell(this,a);this.bind(a);if(a.completed)bindResult(a,this);},
    bind(a){$$('[data-unequal]').forEach(b=>b.onclick=()=>{a.state.selected=+b.dataset.unequal;this.render(a)});$$('[data-unequal-value]').forEach(b=>b.onclick=()=>this.enter(a,b.dataset.unequalValue));$('[data-unequal-undo]').onclick=()=>this.undo(a);window.onkeydown=e=>{if(a.completed||overlayRoot.innerHTML)return;const n=a.puzzle.n,i=a.state.selected,r=Math.floor(i/n),c=i%n;if(/^[1-9]$/.test(e.key)&&+e.key<=n){e.preventDefault();this.enter(a,e.key);return}if(e.key==='Backspace'||e.key==='Delete'){e.preventDefault();this.enter(a,'clear');return}let rr=r,cc=c;if(e.key==='ArrowUp')rr=Math.max(0,r-1);else if(e.key==='ArrowDown')rr=Math.min(n-1,r+1);else if(e.key==='ArrowLeft')cc=Math.max(0,c-1);else if(e.key==='ArrowRight')cc=Math.min(n-1,c+1);else return;e.preventDefault();a.state.selected=rr*n+cc;this.render(a)}} ,
    async enter(a,val){const i=a.state.selected;if(i<0||a.puzzle.givens[i]!=null)return;const old=a.state.board[i],v=val==='clear'?null:+val;if(old===v)return;a.state.history.push([i,old]);a.state.board[i]=v;if(v!=null&&v!==a.puzzle.solution[i]&&state.settings.playMode==='challenge')a.state.mistakes++;if(unequalComplete(a.puzzle,a.state.board))await finishActive(a,{size:a.puzzle.n,mistakes:a.state.mistakes});else await saveActive(a);this.render(a);},
    async undo(a){const h=a.state.history.pop();if(!h)return;a.state.board[h[0]]=h[1];a.state.selected=h[0];await saveActive(a);this.render(a);},
    hint(a){const d=unequalProof(a);deliverProofHint(a,d);if(d?.index!=null)this.render(a);}
  };

  // ---------- Arithmetic Cages ----------
  const cageTupleCache=new Map();
  function cageTarget(vals,op){if(op==='=')return vals[0];if(op==='+')return vals.reduce((a,b)=>a+b,0);if(op==='×')return vals.reduce((a,b)=>a*b,1);if(op==='−')return Math.abs(vals[0]-vals[1]);if(op==='÷')return Math.max(...vals)/Math.min(...vals);}
  function validCageTuples(n,size,op,target){const key=`${n}:${size}:${op}:${target}`;if(cageTupleCache.has(key))return cageTupleCache.get(key);const out=[],arr=Array(size).fill(1);function rec(k){if(k===size){if(cageTarget(arr,op)===target)out.push([...arr]);return;}for(let v=1;v<=n;v++){arr[k]=v;rec(k+1);}}rec(0);cageTupleCache.set(key,out);return out;}
  function chooseCageOp(vals,r){if(vals.length===1)return '=';if(vals.length===2){const a=Math.max(...vals),b=Math.min(...vals),ops=['+','×','−'];if(b&&a%b===0)ops.push('÷');return pick(ops,r);}return r()<.62?'+':'×';}
  function buildCages(solution,n,r,difficulty){const max={Easy:2,Medium:3,Hard:4}[difficulty]||3,un=new Set(Array.from({length:n*n},(_,i)=>i)),cages=[];while(un.size){const start=pick([...un],r);un.delete(start);const cells=[start],goal=1+Math.floor(r()*max);while(cells.length<goal){const frontier=[...new Set(cells.flatMap(i=>rcNeighbors(i,n)).filter(i=>un.has(i)))];if(!frontier.length)break;const x=pick(frontier,r);un.delete(x);cells.push(x);}const vals=cells.map(i=>solution[i]),op=chooseCageOp(vals,r),target=cageTarget(vals,op);cages.push({cells,op,target});}return cages;}
  function cagePossible(cage,board,n){const tuples=validCageTuples(n,cage.cells.length,cage.op,cage.target);return tuples.some(t=>cage.cells.every((idx,k)=>board[idx]==null||board[idx]===t[k]));}
  function countArithmeticSolutions(p,limit=2){const {n,cages}=p,b=Array(n*n).fill(null),owner=Array(n*n);cages.forEach((g,gi)=>g.cells.forEach(i=>owner[i]=gi));let count=0;function rec(){if(count>=limit)return;let bi=-1,bopts=null;for(let i=0;i<b.length;i++)if(b[i]==null){const rr=Math.floor(i/n),cc=i%n,opts=[];for(let v=1;v<=n;v++){let ok=true;for(let c=0;c<n;c++)if(b[rr*n+c]===v){ok=false;break;}if(ok)for(let r=0;r<n;r++)if(b[r*n+cc]===v){ok=false;break;}if(!ok)continue;b[i]=v;ok=cagePossible(cages[owner[i]],b,n);b[i]=null;if(ok)opts.push(v);}if(!opts.length)return;if(!bopts||opts.length<bopts.length){bi=i;bopts=opts;if(opts.length===1)break;}}if(bi<0){count++;return;}for(const v of bopts){b[bi]=v;rec();b[bi]=null;if(count>=limit)return;}}rec();return count;}
  function generateArithmetic(seed,difficulty){const cfg={Easy:4,Medium:5,Hard:6},n=cfg[difficulty]||5,r=rng(`${seed}:arith`),solution=latinSolution(n,r);let cages,tries=0;do{cages=buildCages(solution,n,r,difficulty);tries++;if(countArithmeticSolutions({n,cages},2)===1)break;if(tries>8){const big=cages.filter(c=>c.cells.length>1).sort((a,b)=>b.cells.length-a.cells.length)[0];if(big){const idx=cages.indexOf(big);cages.splice(idx,1,...big.cells.map(i=>({cells:[i],op:'=',target:solution[i]})));}}}while(countArithmeticSolutions({n,cages},2)!==1&&tries<24);while(countArithmeticSolutions({n,cages},2)!==1){const big=cages.find(c=>c.cells.length>1);if(!big)break;const idx=cages.indexOf(big);cages.splice(idx,1,...big.cells.map(i=>({cells:[i],op:'=',target:solution[i]})));}return {n,solution,cages};}
  function arithmeticComplete(p,b){if(!Array.isArray(b)||b.length!==p.n*p.n||!b.every(v=>Number.isInteger(v)&&v>=1&&v<=p.n))return false;if(b.some(v=>v==null))return false;const n=p.n;for(let r=0;r<n;r++)if(new Set(b.slice(r*n,r*n+n)).size!==n)return false;for(let c=0;c<n;c++)if(new Set(Array.from({length:n},(_,r)=>b[r*n+c])).size!==n)return false;return p.cages.every(g=>cageTarget(g.cells.map(i=>b[i]),g.op)===g.target);}
  const arithmeticCagesGame={
    id:'arithmetic-cages',name:'Arithmetic Cages',description:byId['arithmetic-cages'].description,defaultDifficulty:'Medium',difficulties:['Easy','Medium','Hard'],
    rules:{objective:'Fill the Latin square while satisfying every arithmetic cage.',items:['Each row and column contains every number from 1 to the board size exactly once.','The numbers in a cage must produce its target using the shown operator.','Subtraction and division cages contain two cells and are order-independent.','A cage with no operator is a fixed value.']},
    async create(seed,difficulty='Medium'){const puzzle=generateArithmetic(seed,difficulty);return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle,state:{board:Array(puzzle.n*puzzle.n).fill(null),selected:0,history:[],mistakes:0}};},
    async save(a){return saveActive(a);},
    render(a){const {n,cages,solution}=a.puzzle,owner=Array(n*n),labels={};cages.forEach((g,gi)=>{g.cells.forEach(i=>owner[i]=gi);labels[Math.min(...g.cells)]=`${g.target}${g.op==='='?'':g.op}`});const cells=a.state.board.map((v,i)=>{const gi=owner[i],g=cages[gi],r=Math.floor(i/n),c=i%n,same=x=>x>=0&&x<n*n&&owner[x]===gi,classes=[!same(i-n)?'cage-top':'',!same(i+n)?'cage-bottom':'',c===0||!same(i-1)?'cage-left':'',c===n-1||!same(i+1)?'cage-right':'',i===a.state.selected?'selected':'',v!=null&&v!==solution[i]&&state.settings.playMode==='challenge'?'wrong':''].join(' ');return `<button class="arith-cell ${classes}" data-arith="${i}" aria-label="Row ${r+1}, column ${c+1}, ${v??'empty'}${labels[i]?`, cage ${labels[i]}`:''}"><small>${labels[i]||''}</small><strong>${v??''}</strong></button>`}).join('');const pad=Array.from({length:n},(_,k)=>`<button data-arith-value="${k+1}">${k+1}</button>`).join('');main.innerHTML=baseGameShell(byId[this.id],a,`<div class="arith-board" style="grid-template-columns:repeat(${n},1fr)">${cells}</div>`,`<div class="number-pad">${pad}<button data-arith-value="clear">Clear</button><button data-arith-undo>Undo</button></div>${a.completed?resultPanel(a,this,`<div><strong>${n}×${n}</strong><span>Board</span></div>`):''}`);bindGameShell(this,a);this.bind(a);if(a.completed)bindResult(a,this);},
    bind(a){$$('[data-arith]').forEach(b=>b.onclick=()=>{a.state.selected=+b.dataset.arith;this.render(a)});$$('[data-arith-value]').forEach(b=>b.onclick=()=>this.enter(a,b.dataset.arithValue));$('[data-arith-undo]').onclick=()=>this.undo(a);window.onkeydown=e=>{if(a.completed||overlayRoot.innerHTML)return;const n=a.puzzle.n,i=a.state.selected,r=Math.floor(i/n),c=i%n;if(/^[1-9]$/.test(e.key)&&+e.key<=n){e.preventDefault();this.enter(a,e.key);return}if(e.key==='Backspace'||e.key==='Delete'){e.preventDefault();this.enter(a,'clear');return}let rr=r,cc=c;if(e.key==='ArrowUp')rr=Math.max(0,r-1);else if(e.key==='ArrowDown')rr=Math.min(n-1,r+1);else if(e.key==='ArrowLeft')cc=Math.max(0,c-1);else if(e.key==='ArrowRight')cc=Math.min(n-1,c+1);else return;e.preventDefault();a.state.selected=rr*n+cc;this.render(a)}} ,
    async enter(a,val){const i=a.state.selected,old=a.state.board[i],v=val==='clear'?null:+val;if(old===v)return;a.state.history.push([i,old]);a.state.board[i]=v;if(v!=null&&v!==a.puzzle.solution[i]&&state.settings.playMode==='challenge')a.state.mistakes++;if(arithmeticComplete(a.puzzle,a.state.board))await finishActive(a,{size:a.puzzle.n,mistakes:a.state.mistakes});else await saveActive(a);this.render(a);},
    async undo(a){const h=a.state.history.pop();if(!h)return;a.state.board[h[0]]=h[1];a.state.selected=h[0];await saveActive(a);this.render(a);},
    hint(a){const d=arithmeticProof(a);deliverProofHint(a,d);if(d?.index!=null)this.render(a);}
  };

  // ---------- Islands ----------
  function blackConnected(mask,n){const black=mask.map((v,i)=>v===0?i:-1).filter(i=>i>=0);if(!black.length)return false;const seen=new Set([black[0]]),q=[black[0]];while(q.length){const x=q.pop();for(const y of rcNeighbors(x,n))if(mask[y]===0&&!seen.has(y)){seen.add(y);q.push(y)}}return seen.size===black.length;}
  function noBlack2x2(mask,n){for(let r=0;r<n-1;r++)for(let c=0;c<n-1;c++){const i=r*n+c;if(mask[i]===0&&mask[i+1]===0&&mask[i+n]===0&&mask[i+n+1]===0)return false;}return true;}
  const ISLAND_CERTIFIED_BANK={"Easy":[{"n":5,"solution":"1101100001101000011110111","clues":{"1":2,"4":3,"10":1,"12":7,"20":1}},{"n":5,"solution":"1000000101101011000000101","clues":{"0":1,"7":2,"14":2,"15":2,"22":1,"24":1}},{"n":5,"solution":"1110111100001011000011011","clues":{"1":7,"4":1,"14":1,"15":3,"24":2}},{"n":5,"solution":"1011100111101000000111011","clues":{"0":1,"7":7,"10":1,"24":3,"20":2}},{"n":5,"solution":"1010110000001111001111011","clues":{"5":2,"2":1,"4":1,"13":7,"20":3}},{"n":5,"solution":"1101110000001011110011101","clues":{"5":3,"3":2,"20":7,"14":1,"24":1}},{"n":5,"solution":"0110100000011010000010110","clues":{"2":2,"4":1,"12":2,"14":1,"20":1,"23":2}},{"n":5,"solution":"1010110000001111001111011","clues":{"5":2,"2":1,"4":1,"18":7,"21":3}},{"n":5,"solution":"1011000000011010000001101","clues":{"0":1,"2":2,"11":2,"14":1,"22":2,"24":1}},{"n":5,"solution":"1011000000011010000001101","clues":{"0":1,"3":2,"11":2,"14":1,"21":2,"24":1}}],"Medium":[{"n":6,"solution":"000011011011100000001011010000011111","clues":{"5":4,"8":2,"12":1,"20":1,"22":2,"35":6}},{"n":6,"solution":"000000011010010000100110001010100001","clues":{"13":3,"10":1,"18":1,"21":3,"26":1,"30":1,"35":1}},{"n":6,"solution":"000011011011100000001011010000011111","clues":{"11":4,"8":2,"12":1,"20":1,"23":2,"35":6}},{"n":6,"solution":"000101011000010010000100010110000001","clues":{"3":1,"5":1,"8":3,"16":1,"27":3,"25":1,"35":1}},{"n":6,"solution":"000000010110000010011001010100100001","clues":{"7":1,"16":3,"19":3,"23":1,"27":1,"30":1,"35":1}},{"n":6,"solution":"111000100010010110000010101011101000","clues":{"6":4,"29":6,"13":1,"30":2,"32":2}},{"n":6,"solution":"001000010011010101000001110101110101","clues":{"2":1,"13":2,"35":6,"15":1,"31":4,"27":2}},{"n":6,"solution":"000100110010101010100000101011101011","clues":{"3":1,"30":6,"10":2,"14":1,"26":2,"29":4}},{"n":6,"solution":"110101110101000001010101010011001000","clues":{"0":4,"3":2,"5":6,"25":2,"21":1,"32":1}},{"n":6,"solution":"000011011011100000001011010000011111","clues":{"5":4,"7":2,"12":1,"20":1,"23":2,"35":6}}],"Hard":[{"n":7,"solution":"0100000001110110110001000010101101000110101000100","clues":{"1":1,"9":5,"13":1,"28":3,"40":3,"38":4,"42":1,"46":1}},{"n":7,"solution":"0011101100000001101100110110010000100011100100000","clues":{"2":3,"6":1,"7":1,"15":5,"26":4,"34":1,"38":3,"43":1}},{"n":7,"solution":"0110101010000000110101000100110110110000001101111","clues":{"1":3,"4":1,"6":1,"16":2,"19":1,"43":6,"25":3,"34":1,"46":4}},{"n":7,"solution":"1101111100000011011011000100001101001000000110101","clues":{"1":6,"6":4,"25":3,"20":1,"30":2,"33":1,"36":3,"46":1,"48":1}},{"n":7,"solution":"1010001100010010110011010100000010110100111111000","clues":{"7":4,"2":1,"6":1,"11":1,"17":3,"20":1,"32":2,"41":3,"35":6}},{"n":7,"solution":"1011100000000101101100110110100001001110000000010","clues":{"0":1,"2":3,"13":1,"22":4,"19":5,"28":1,"36":3,"47":1}},{"n":7,"solution":"0000010011100010000100110110011011000000011011100","clues":{"5":1,"10":3,"14":1,"33":5,"22":4,"41":1,"42":1,"44":3}},{"n":7,"solution":"0100000001110110110001000010101101000110101000100","clues":{"1":1,"9":5,"13":1,"21":3,"26":3,"38":4,"42":1,"46":1}},{"n":7,"solution":"0001111110010110100000010101100110100100011000101","clues":{"13":6,"7":3,"16":2,"31":3,"48":4,"28":1,"37":1,"42":1,"46":1}},{"n":7,"solution":"0110000001011010010001100010011011000001010110000","clues":{"9":3,"11":2,"14":5,"17":1,"33":4,"41":1,"43":2}}]};
  function transformGridIndex(i,n,t){let r=Math.floor(i/n),c=i%n;if(t>=4)c=n-1-c;for(let k=0;k<t%4;k++)[r,c]=[c,n-1-r];return r*n+c;}
  function generateIslands(seed,difficulty){const pool=ISLAND_CERTIFIED_BANK[difficulty]||ISLAND_CERTIFIED_BANK.Medium,r=rng(`${seed}:islands:certified-v2`),src=pick(pool,r),n=src.n,t=Math.floor(r()*8),solution=Array(n*n),clues={};[...src.solution].forEach((v,i)=>solution[transformGridIndex(i,n,t)]=+v);for(const [i,v] of Object.entries(src.clues))clues[transformGridIndex(+i,n,t)]=v;return {n,solution,clues,certifiedUnique:true,generatorVersion:2};}
  function islandsComplete(p,cells){if(!Array.isArray(cells)||cells.length!==p.n*p.n||!cells.every(v=>v===1||v===2)||!Object.keys(p.clues).every(k=>cells[k]===2))return false;if(cells.some(v=>v===0))return false;const n=p.n,whiteMask=cells.map(v=>v===2?1:0),white=orthComponents(whiteMask,n,v=>v===1);for(const comp of white){const clueCells=comp.filter(i=>p.clues[i]!=null);if(clueCells.length!==1||p.clues[clueCells[0]]!==comp.length)return false;}const blackMask=cells.map(v=>v===1?0:1);if(!cells.some(v=>v===1)||!blackConnected(blackMask,n))return false;for(let r=0;r<n-1;r++)for(let c=0;c<n-1;c++){const i=r*n+c;if([i,i+1,i+n,i+n+1].every(x=>cells[x]===1))return false;}return true;}
  function islandsBad(p,cells,i){const n=p.n;if(cells[i]===1){const r=Math.floor(i/n),c=i%n;for(let rr=Math.max(0,r-1);rr<=Math.min(n-2,r);rr++)for(let cc=Math.max(0,c-1);cc<=Math.min(n-2,c);cc++){const j=rr*n+cc;if([j,j+1,j+n,j+n+1].every(x=>cells[x]===1))return true;}}if(cells[i]===2){const comp=orthComponents(cells,n,(v,j)=>v===2).find(c=>c.includes(i));if(comp){const clues=comp.filter(j=>p.clues[j]!=null);if(clues.length>1)return true;if(clues.length===1&&comp.length>p.clues[clues[0]])return true;}}return false;}
  const islandsGame={
    id:'islands',name:'Islands',generatorVersion:2,description:byId.islands.description,defaultDifficulty:'Medium',difficulties:['Easy','Medium','Hard'],
    rules:{objective:'Separate numbered white islands with one connected black sea.',items:['Each number belongs to a white island whose size equals that number.','Each island contains exactly one number.','Different islands may not touch orthogonally.','All black cells form one connected sea, no 2×2 block may be entirely black, and every shipped puzzle is uniqueness-certified.']},
    async create(seed,difficulty='Medium'){const puzzle=generateIslands(seed,difficulty),cells=Array(puzzle.n*puzzle.n).fill(0);Object.keys(puzzle.clues).forEach(i=>cells[+i]=2);return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle,state:{cells,selected:0,history:[]}};},
    async save(a){return saveActive(a);},
    render(a){const n=a.puzzle.n,cells=a.state.cells.map((v,i)=>`<button class="island-cell ${v===1?'sea':''} ${v===2?'land':''} ${i===a.state.selected?'selected':''} ${islandsBad(a.puzzle,a.state.cells,i)?'wrong':''}" data-island="${i}" aria-label="Row ${Math.floor(i/n)+1}, column ${i%n+1}, ${a.puzzle.clues[i]!=null?`island clue ${a.puzzle.clues[i]}`:v===1?'sea':v===2?'island':'unknown'}" ${a.puzzle.clues[i]!=null?'disabled':''}>${a.puzzle.clues[i]??(v===2?'·':'')}</button>`).join('');main.innerHTML=baseGameShell(byId[this.id],a,`<div class="islands-board" style="grid-template-columns:repeat(${n},1fr)">${cells}</div>`,`<div class="state-pad"><button data-island-value="1">Sea</button><button data-island-value="2">Island</button><button data-island-value="0">Clear</button><button data-island-undo>Undo</button></div>${a.completed?resultPanel(a,this,`<div><strong>${n}×${n}</strong><span>Board</span></div>`):''}`);bindGameShell(this,a);this.bind(a);if(a.completed)bindResult(a,this);},
    bind(a){$$('[data-island]').forEach(b=>b.onclick=()=>{a.state.selected=+b.dataset.island;this.render(a)});$$('[data-island-value]').forEach(b=>b.onclick=()=>this.set(a,+b.dataset.islandValue));$('[data-island-undo]').onclick=()=>this.undo(a);window.onkeydown=e=>{if(a.completed||overlayRoot.innerHTML)return;const n=a.puzzle.n,i=a.state.selected,r=Math.floor(i/n),c=i%n;if(['b','B'].includes(e.key)){this.set(a,1);return}if(['w','W','i','I'].includes(e.key)){this.set(a,2);return}if(e.key==='Delete'||e.key==='Backspace'){this.set(a,0);return}let rr=r,cc=c;if(e.key==='ArrowUp')rr=Math.max(0,r-1);else if(e.key==='ArrowDown')rr=Math.min(n-1,r+1);else if(e.key==='ArrowLeft')cc=Math.max(0,c-1);else if(e.key==='ArrowRight')cc=Math.min(n-1,c+1);else return;e.preventDefault();a.state.selected=rr*n+cc;this.render(a)}},
    async set(a,v){const i=a.state.selected;if(a.puzzle.clues[i]!=null)return;const old=a.state.cells[i];if(old===v)return;a.state.history.push([i,old]);a.state.cells[i]=v;if(islandsComplete(a.puzzle,a.state.cells))await finishActive(a,{size:a.puzzle.n});else await saveActive(a);this.render(a);},
    async undo(a){const h=a.state.history.pop();if(!h)return;a.state.cells[h[0]]=h[1];a.state.selected=h[0];await saveActive(a);this.render(a);},
    hint(a){const d=islandsProof(a);deliverProofHint(a,d);if(d?.index!=null)this.render(a);}
  };

  // ---------- Hitori ----------
  function whiteConnectedFromBlack(black,n){const whites=black.map((v,i)=>!v?i:-1).filter(i=>i>=0);if(!whites.length)return false;const seen=new Set([whites[0]]),q=[whites[0]];while(q.length){const x=q.pop();for(const y of rcNeighbors(x,n))if(!black[y]&&!seen.has(y)){seen.add(y);q.push(y)}}return seen.size===whites.length;}
  function hitoriDuplicatePeers(grid,n){const peers=Array.from({length:grid.length},()=>new Set());for(let r=0;r<n;r++){const groups=new Map();for(let c=0;c<n;c++){const i=r*n+c,v=grid[i];if(!groups.has(v))groups.set(v,[]);groups.get(v).push(i);}for(const cells of groups.values())if(cells.length>1)for(const i of cells)for(const j of cells)if(i!==j)peers[i].add(j);}for(let c=0;c<n;c++){const groups=new Map();for(let r=0;r<n;r++){const i=r*n+c,v=grid[i];if(!groups.has(v))groups.set(v,[]);groups.get(v).push(i);}for(const cells of groups.values())if(cells.length>1)for(const i of cells)for(const j of cells)if(i!==j)peers[i].add(j);}return peers.map(x=>[...x]);}
  function solveHitori(grid,n,limit=2){
    const peers=hitoriDuplicatePeers(grid,n),solutions=[];
    const potentialWhiteConnected=st=>{const whites=st.map((v,i)=>v===2?i:-1).filter(i=>i>=0);if(whites.length<=1)return true;const seen=new Set([whites[0]]),q=[whites[0]];while(q.length){const x=q.pop();for(const y of rcNeighbors(x,n))if(st[y]!==1&&!seen.has(y)){seen.add(y);q.push(y);}}return whites.every(i=>seen.has(i));};
    function propagate(st,queue){while(queue.length){const i=queue.pop(),v=st[i];if(v===1){for(const j of rcNeighbors(i,n)){if(st[j]===1)return false;if(st[j]===0){st[j]=2;queue.push(j);}}}else{for(const j of peers[i]){if(st[j]===2)return false;if(st[j]===0){st[j]=1;queue.push(j);}}}}return potentialWhiteConnected(st);}
    function rec(st){if(solutions.length>=limit)return;const un=[];for(let i=0;i<st.length;i++)if(st[i]===0)un.push(i);if(!un.length){if(potentialWhiteConnected(st))solutions.push([...st]);return;}const i=un.reduce((best,x)=>{const score=peers[x].length*4+rcNeighbors(x,n).filter(j=>st[j]===0).length,bscore=peers[best].length*4+rcNeighbors(best,n).filter(j=>st[j]===0).length;return score>bscore?x:best;},un[0]);const order=peers[i].length?[1,2]:[2,1];for(const v of order){const next=[...st];next[i]=v;if(propagate(next,[i]))rec(next);if(solutions.length>=limit)return;}}
    rec(Array(n*n).fill(0));return {count:solutions.length,solution:solutions[0]||null};
  }
  function generateHitori(seed,difficulty){
    const n={Easy:5,Medium:6,Hard:7}[difficulty]||6,density={Easy:.23,Medium:.27,Hard:.30}[difficulty]||.27;
    for(let attempt=0;attempt<400;attempt++){
      const r=rng(`${seed}:hitori:v2:${attempt}`),base=latinSolution(n,r),black=Array(n*n).fill(false),order=shuffle(Array.from({length:n*n},(_,i)=>i),r),target=Math.round(n*n*density);
      for(const i of order){if(black.filter(Boolean).length>=target)break;if(rcNeighbors(i,n).some(j=>black[j]))continue;black[i]=true;if(!whiteConnectedFromBlack(black,n)){black[i]=false;continue;}}
      const grid=[...base];for(let i=0;i<grid.length;i++)if(black[i]){const rr=Math.floor(i/n),cc=i%n,cands=[];for(let c=0;c<n;c++){const j=rr*n+c;if(j!==i&&!black[j])cands.push(j);}for(let rr2=0;rr2<n;rr2++){const j=rr2*n+cc;if(j!==i&&!black[j])cands.push(j);}if(cands.length)grid[i]=base[pick(cands,r)];}
      const solved=solveHitori(grid,n,2);if(solved.count===1)return {n,grid,solutionBlack:solved.solution.map(v=>v===1),certifiedUnique:true,generatorVersion:2};
    }
    throw new Error('Hitori generation failed uniqueness certification');
  }
  function hitoriValid(p,cells){if(!Array.isArray(cells)||cells.length!==p.n*p.n||!cells.every(v=>Number.isInteger(v)&&v>=0&&v<=2))return false;const n=p.n,black=cells.map(v=>v===1);for(let i=0;i<black.length;i++)if(black[i]&&rcNeighbors(i,n).some(j=>black[j]))return false;if(!whiteConnectedFromBlack(black,n))return false;for(let r=0;r<n;r++){const seen=new Set();for(let c=0;c<n;c++){const i=r*n+c;if(black[i])continue;const v=p.grid[i];if(seen.has(v))return false;seen.add(v);}}for(let c=0;c<n;c++){const seen=new Set();for(let r=0;r<n;r++){const i=r*n+c;if(black[i])continue;const v=p.grid[i];if(seen.has(v))return false;seen.add(v);}}return true;}
  function hitoriBad(p,cells,i){const n=p.n;if(cells[i]===1&&rcNeighbors(i,n).some(j=>cells[j]===1))return true;return false;}
  const hitoriGame={
    id:'hitori',name:'Hitori',generatorVersion:2,description:byId.hitori.description,defaultDifficulty:'Medium',difficulties:['Easy','Medium','Hard'],
    rules:{objective:'Shade cells so no visible number repeats in a row or column.',items:['Unshaded numbers must be unique within each row and column.','Black cells may not touch orthogonally.','All unshaded cells must remain connected.','Every generated board is exact-solver uniqueness-certified; circle/confirm cells you know must stay white if that helps your reasoning.']},
    async create(seed,difficulty='Medium'){const puzzle=generateHitori(seed,difficulty);return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle,state:{cells:Array(puzzle.n*puzzle.n).fill(0),selected:0,history:[]}};},
    async save(a){return saveActive(a);},
    render(a){const n=a.puzzle.n,cells=a.puzzle.grid.map((v,i)=>`<button class="hitori-cell ${a.state.cells[i]===1?'black':''} ${a.state.cells[i]===2?'white':''} ${i===a.state.selected?'selected':''} ${hitoriBad(a.puzzle,a.state.cells,i)?'wrong':''}" data-hitori="${i}"><span>${v}</span></button>`).join('');main.innerHTML=baseGameShell(byId[this.id],a,`<div class="hitori-board" style="grid-template-columns:repeat(${n},1fr)">${cells}</div>`,`<div class="state-pad"><button data-hitori-value="1">Shade</button><button data-hitori-value="2">Keep white</button><button data-hitori-value="0">Clear</button><button data-hitori-undo>Undo</button></div>${a.completed?resultPanel(a,this,`<div><strong>${n}×${n}</strong><span>Board</span></div>`):''}`);bindGameShell(this,a);this.bind(a);if(a.completed)bindResult(a,this);},
    bind(a){$$('[data-hitori]').forEach(b=>b.onclick=()=>{a.state.selected=+b.dataset.hitori;this.render(a)});$$('[data-hitori-value]').forEach(b=>b.onclick=()=>this.set(a,+b.dataset.hitoriValue));$('[data-hitori-undo]').onclick=()=>this.undo(a);window.onkeydown=e=>{if(a.completed||overlayRoot.innerHTML)return;const n=a.puzzle.n,i=a.state.selected,r=Math.floor(i/n),c=i%n;if(e.key.toLowerCase()==='b'){this.set(a,1);return}if(e.key.toLowerCase()==='w'){this.set(a,2);return}if(e.key==='Delete'||e.key==='Backspace'){this.set(a,0);return}let rr=r,cc=c;if(e.key==='ArrowUp')rr=Math.max(0,r-1);else if(e.key==='ArrowDown')rr=Math.min(n-1,r+1);else if(e.key==='ArrowLeft')cc=Math.max(0,c-1);else if(e.key==='ArrowRight')cc=Math.min(n-1,c+1);else return;e.preventDefault();a.state.selected=rr*n+cc;this.render(a)}},
    async set(a,v){const i=a.state.selected,old=a.state.cells[i];if(old===v)return;a.state.history.push([i,old]);a.state.cells[i]=v;if(hitoriValid(a.puzzle,a.state.cells))await finishActive(a,{size:a.puzzle.n});else await saveActive(a);this.render(a);},
    async undo(a){const h=a.state.history.pop();if(!h)return;a.state.cells[h[0]]=h[1];a.state.selected=h[0];await saveActive(a);this.render(a);},
    hint(a){const d=hitoriProof(a);deliverProofHint(a,d);if(d?.index!=null)this.render(a);}
  };

  // ---------- Dominoes ----------
  function dominoKeys(max){const out=[];for(let a=0;a<=max;a++)for(let b=a;b<=max;b++)out.push(`${a}-${b}`);return out;}
  function dominoDims(max){const area=(max+1)*(max+2),root=Math.floor(Math.sqrt(area));for(let r=root;r>=2;r--)if(area%r===0){const c=area/r;if(r%2===0||c%2===0)return [r,c];}return [2,area/2];}
  function baseDominoTiling(rows,cols){const out=[];if(cols%2===0){for(let r=0;r<rows;r++)for(let c=0;c<cols;c+=2)out.push([r*cols+c,r*cols+c+1]);}else{for(let r=0;r<rows;r+=2)for(let c=0;c<cols;c++)out.push([r*cols+c,(r+1)*cols+c]);}return out;}
  function randomizeDominoTiling(rows,cols,pairs,r,steps=220){const p=Array(rows*cols).fill(-1);pairs.forEach(([a,b])=>{p[a]=b;p[b]=a});for(let k=0;k<steps;k++){const rr=Math.floor(r()*(rows-1)),c=Math.floor(r()*(cols-1)),a=rr*cols+c,b=a+1,d=a+cols,e=d+1;if(p[a]===b&&p[d]===e){p[a]=d;p[d]=a;p[b]=e;p[e]=b}else if(p[a]===d&&p[b]===e){p[a]=b;p[b]=a;p[d]=e;p[e]=d}}const out=[],seen=new Set();for(let i=0;i<p.length;i++)if(!seen.has(i)){out.push([i,p[i]]);seen.add(i);seen.add(p[i]);}return out;}
  function countDominoSolutions(rows,cols,grid,max,limit=2){const required=new Set(dominoKeys(max)),neigh=Array.from({length:grid.length},()=>[]);for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const i=r*cols+c;for(const [dr,dc] of [[1,0],[0,1]]){const rr=r+dr,cc=c+dc;if(rr>=rows||cc>=cols)continue;const j=rr*cols+cc,key=[grid[i],grid[j]].sort((a,b)=>a-b).join('-');if(required.has(key)){neigh[i].push([j,key]);neigh[j].push([i,key]);}}}const used=Array(grid.length).fill(false),usedKeys=new Set();let count=0;function rec(rem){if(count>=limit)return;if(rem===0){if(usedKeys.size===required.size)count++;return;}let bi=-1,bopts=null;for(let i=0;i<grid.length;i++)if(!used[i]){const opts=neigh[i].filter(([j,k])=>!used[j]&&!usedKeys.has(k));if(!opts.length)return;if(!bopts||opts.length<bopts.length){bi=i;bopts=opts;if(opts.length===1)break;}}used[bi]=true;for(const [j,k] of bopts){if(used[j]||usedKeys.has(k))continue;used[j]=true;usedKeys.add(k);rec(rem-2);usedKeys.delete(k);used[j]=false;if(count>=limit)break;}used[bi]=false;}rec(grid.length);return count;}
  function generateDominoes(seed,difficulty){const max={Easy:4,Medium:5,Hard:6}[difficulty]||5,[rows,cols]=dominoDims(max),r=rng(`${seed}:dominoes`),keys=dominoKeys(max).map(k=>k.split('-').map(Number));for(let attempt=0;attempt<3000;attempt++){const tiling=randomizeDominoTiling(rows,cols,baseDominoTiling(rows,cols),r,260),pairs=shuffle(keys,r),grid=Array(rows*cols);tiling.forEach(([i,j],k)=>{let [a,b]=pairs[k];if(r()<.5)[a,b]=[b,a];grid[i]=a;grid[j]=b;});if(countDominoSolutions(rows,cols,grid,max,2)===1)return {rows,cols,max,grid,solution:tiling};}throw new Error('Domino generation failed');}
  function dominoComplete(p,partner){if(!Array.isArray(partner)||partner.length!==p.rows*p.cols||!partner.every(v=>Number.isInteger(v)&&v>=0&&v<partner.length))return false;if(partner.some(x=>x<0))return false;const used=new Set();for(let i=0;i<partner.length;i++){const j=partner[i];if(j<0||partner[j]!==i)return false;const r1=Math.floor(i/p.cols),c1=i%p.cols,r2=Math.floor(j/p.cols),c2=j%p.cols;if(Math.abs(r1-r2)+Math.abs(c1-c2)!==1)return false;if(i<j){const key=[p.grid[i],p.grid[j]].sort((a,b)=>a-b).join('-');if(used.has(key))return false;used.add(key);}}return used.size===dominoKeys(p.max).length;}
  const dominoesGame={
    id:'dominoes',name:'Dominoes',description:byId.dominoes.description,defaultDifficulty:'Medium',difficulties:['Easy','Medium','Hard'],
    rules:{objective:'Pair neighboring cells to reconstruct one complete domino set.',items:['Every cell belongs to exactly one domino.','A domino joins two orthogonally adjacent cells.','Every unordered number pair from 0–N appears exactly once.','Select one cell, then a neighbor, to pair them.']},
    async create(seed,difficulty='Medium'){const puzzle=generateDominoes(seed,difficulty);return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle,state:{partner:Array(puzzle.grid.length).fill(-1),selected:0,anchor:-1,history:[]}};},
    async save(a){return saveActive(a);},
    render(a){const {rows,cols,grid}=a.puzzle,cells=grid.map((v,i)=>{const j=a.state.partner[i],paired=j>=0,dir=j===i+1?'right':j===i-1?'left':j===i+cols?'down':j===i-cols?'up':'';return `<button class="domino-cell ${paired?'paired':''} ${i===a.state.selected?'selected':''} ${i===a.state.anchor?'anchor':''}" data-domino="${i}"><strong>${v}</strong>${paired&&i<j?`<i class="domino-link ${dir}">${dir==='right'?'↔':'↕'}</i>`:''}</button>`}).join('');main.innerHTML=baseGameShell(byId[this.id],a,`<div class="domino-board" style="grid-template-columns:repeat(${cols},1fr);aspect-ratio:${cols}/${rows}">${cells}</div>`,`<div class="toolbar"><button data-domino-clear>Remove selected pair</button><button data-domino-undo>Undo</button></div>${a.completed?resultPanel(a,this,`<div><strong>0–${a.puzzle.max}</strong><span>Set</span></div>`):''}`);bindGameShell(this,a);this.bind(a);if(a.completed)bindResult(a,this);},
    bind(a){$$('[data-domino]').forEach(b=>b.onclick=()=>this.click(a,+b.dataset.domino));$('[data-domino-clear]').onclick=()=>this.clear(a);$('[data-domino-undo]').onclick=()=>this.undo(a);window.onkeydown=e=>{if(a.completed||overlayRoot.innerHTML)return;const i=a.state.selected,r=Math.floor(i/a.puzzle.cols),c=i%a.puzzle.cols;let rr=r,cc=c;if(e.key==='ArrowUp')rr=Math.max(0,r-1);else if(e.key==='ArrowDown')rr=Math.min(a.puzzle.rows-1,r+1);else if(e.key==='ArrowLeft')cc=Math.max(0,c-1);else if(e.key==='ArrowRight')cc=Math.min(a.puzzle.cols-1,c+1);else if(e.key==='Enter'||e.key===' '){e.preventDefault();this.click(a,i);return}else if(e.key==='Escape'){a.state.anchor=-1;this.render(a);return}else if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();this.clear(a);return}else return;e.preventDefault();a.state.selected=rr*a.puzzle.cols+cc;this.render(a)}} ,
    async click(a,i){a.state.selected=i;if(a.state.anchor<0){a.state.anchor=i;this.render(a);return;}if(a.state.anchor===i){a.state.anchor=-1;this.render(a);return;}const s=a.state.anchor,cols=a.puzzle.cols,r1=Math.floor(s/cols),c1=s%cols,r2=Math.floor(i/cols),c2=i%cols;if(Math.abs(r1-r2)+Math.abs(c1-c2)!==1){a.state.anchor=i;this.render(a);return;}a.state.history.push([...a.state.partner]);for(const x of [s,i]){const p=a.state.partner[x];if(p>=0){a.state.partner[p]=-1;a.state.partner[x]=-1;}}a.state.partner[s]=i;a.state.partner[i]=s;a.state.anchor=-1;if(dominoComplete(a.puzzle,a.state.partner))await finishActive(a,{set:a.puzzle.max});else await saveActive(a);this.render(a);},
    async clear(a){const i=a.state.selected;if(i<0)return;const j=a.state.partner[i];if(j<0)return;a.state.history.push([...a.state.partner]);a.state.partner[i]=a.state.partner[j]=-1;await saveActive(a);this.render(a);},
    async undo(a){const h=a.state.history.pop();if(!h)return;a.state.partner=h;a.state.anchor=-1;await saveActive(a);this.render(a);},
    hint(a){const d=dominoProof(a);deliverProofHint(a,d);if(d?.index!=null)this.render(a);}
  };

  // ---------- Fillomino ----------
  const FILLOMINO_CERTIFIED_BANK={"Easy":[{"n":6,"solution":[5,5,5,5,5,6,2,6,6,6,6,6,2,5,5,5,5,5,6,6,6,6,2,2,6,6,2,2,1,5,2,2,5,5,5,5],"givens":[5,5,5,5,5,null,null,6,6,6,6,6,2,null,5,5,5,5,6,6,6,6,2,2,6,6,2,null,1,5,2,2,5,5,5,5],"maxValue":6},{"n":6,"solution":[4,4,4,4,3,3,6,6,6,6,6,3,6,5,5,5,5,5,2,4,4,4,4,1,2,5,5,5,5,5,6,6,6,6,6,6],"givens":[4,4,4,4,3,3,6,6,6,6,6,3,6,null,5,5,5,5,null,4,4,4,null,1,2,5,5,5,5,null,6,6,6,6,6,6],"maxValue":6},{"n":6,"solution":[6,6,6,6,6,6,4,5,5,5,5,5,4,4,4,1,6,6,2,2,6,6,6,6,4,4,4,4,3,3,5,5,5,5,5,3],"givens":[6,6,6,6,6,6,null,5,5,5,5,5,4,4,4,1,6,6,2,2,6,6,6,null,null,4,4,4,3,3,5,5,5,5,5,null],"maxValue":6},{"n":6,"solution":[2,2,1,6,6,6,4,4,4,6,6,6,4,2,2,3,3,3,6,5,5,5,5,5,6,6,6,6,6,2,5,5,5,5,5,2],"givens":[null,2,1,6,6,6,4,4,4,6,6,6,4,null,2,3,3,null,6,5,5,5,5,5,6,6,6,6,6,2,5,5,5,5,null,2],"maxValue":6},{"n":6,"solution":[2,2,3,3,3,6,3,6,6,6,6,6,3,3,4,4,4,4,5,5,5,3,3,3,5,5,2,2,6,6,2,2,6,6,6,6],"givens":[2,2,3,3,3,null,null,6,6,6,6,6,3,3,4,4,4,4,5,5,5,3,3,3,5,5,2,null,6,6,2,2,null,6,6,6],"maxValue":6},{"n":6,"solution":[4,4,4,4,6,6,2,2,6,6,6,6,5,5,5,5,5,4,3,2,2,4,4,4,3,3,6,6,6,6,4,4,4,4,6,6],"givens":[4,4,4,4,6,6,2,null,6,6,6,6,5,5,5,5,5,null,null,2,2,4,4,4,3,3,6,6,6,6,null,4,4,4,6,6],"maxValue":6},{"n":6,"solution":[6,6,6,6,6,6,5,5,5,3,3,3,5,5,6,6,6,6,1,3,3,3,6,6,4,4,4,4,3,3,5,5,5,5,5,3],"givens":[6,6,6,6,6,6,5,5,5,3,3,null,null,5,6,6,6,6,1,3,3,3,6,6,4,4,4,4,null,3,null,5,5,5,5,3],"maxValue":6},{"n":6,"solution":[3,3,3,1,4,4,5,5,5,5,4,4,5,2,2,3,3,3,6,5,5,5,5,5,6,6,6,6,6,2,5,5,5,5,5,2],"givens":[null,3,3,1,4,4,5,5,5,5,4,4,5,2,2,3,3,3,6,null,5,5,5,5,6,6,6,6,6,null,5,5,5,5,null,2],"maxValue":6},{"n":6,"solution":[4,4,4,4,6,6,2,2,6,6,6,6,1,4,4,4,4,1,6,6,6,6,2,2,6,6,1,5,5,5,4,4,4,4,5,5],"givens":[null,4,4,4,6,6,2,2,6,6,6,6,1,4,4,4,4,1,null,6,6,6,null,2,6,6,1,5,5,5,4,4,4,null,5,5],"maxValue":6},{"n":6,"solution":[4,4,4,4,1,2,5,5,5,5,5,2,6,6,6,6,6,6,5,5,5,3,3,3,5,5,6,6,6,6,4,4,4,4,6,6],"givens":[4,4,4,null,1,null,5,5,5,5,null,2,6,6,6,6,6,6,5,5,5,3,3,3,5,5,null,6,6,6,4,4,4,4,6,6],"maxValue":6}],"Medium":[{"n":7,"solution":[5,5,5,5,5,4,4,6,6,3,3,3,4,4,6,6,6,6,1,2,2,3,5,5,5,5,5,1,3,3,2,2,4,4,4,6,6,6,6,6,6,4,5,5,5,5,5,2,2],"givens":[null,5,5,5,5,null,4,6,6,3,3,3,4,4,6,6,6,6,1,null,2,3,null,5,5,5,5,1,3,3,null,2,4,4,4,6,6,6,6,6,6,null,5,5,5,5,null,2,2],"maxValue":6},{"n":7,"solution":[5,5,5,5,5,3,3,6,6,6,6,6,6,3,2,2,3,3,3,4,4,6,6,6,6,6,4,4,6,1,2,2,3,3,3,3,3,3,4,4,4,4,6,6,6,6,6,6,1],"givens":[5,5,5,5,null,3,3,6,6,6,6,6,null,3,null,2,3,3,3,4,null,6,6,6,6,null,4,4,6,1,2,2,3,3,null,3,3,null,4,4,4,4,6,6,6,6,6,6,1],"maxValue":6},{"n":7,"solution":[5,5,5,5,5,1,6,4,4,6,6,6,6,6,4,4,2,2,3,3,3,6,6,6,4,4,4,4,6,6,6,3,3,3,2,2,2,1,2,2,1,2,1,6,6,6,6,6,6],"givens":[5,5,5,5,5,1,null,null,4,6,6,6,6,6,4,4,null,2,null,3,3,null,6,6,4,4,4,4,6,6,6,3,3,null,2,2,2,1,2,null,1,null,1,6,6,6,6,6,6],"maxValue":6},{"n":7,"solution":[2,2,4,4,4,4,2,6,6,6,6,6,6,2,2,2,1,4,4,4,4,5,5,5,5,2,2,1,5,6,6,6,6,6,6,4,4,4,3,3,3,1,4,6,6,6,6,6,6],"givens":[2,2,4,4,4,null,2,null,6,6,6,6,6,null,2,2,1,null,4,4,4,5,5,5,5,2,2,1,5,null,6,6,6,6,6,4,4,4,null,3,3,1,null,6,6,6,6,6,6],"maxValue":6},{"n":7,"solution":[5,5,5,5,5,2,2,3,3,3,4,4,4,4,1,6,6,6,6,6,6,3,3,5,5,5,5,5,3,6,6,6,6,6,6,2,2,3,3,3,2,2,6,6,6,6,6,6,1],"givens":[5,5,5,5,null,2,null,3,3,3,4,4,4,4,1,null,6,6,6,6,6,3,3,5,5,5,5,null,null,6,6,6,6,6,6,2,null,3,3,3,2,2,6,6,6,6,6,null,1],"maxValue":6},{"n":7,"solution":[2,2,3,3,3,2,2,4,4,5,5,5,5,5,4,4,6,6,6,6,6,3,5,5,5,5,5,6,3,3,4,4,4,4,5,6,6,1,5,5,5,5,6,6,6,6,3,3,3],"givens":[2,2,null,3,3,null,2,4,4,5,5,5,5,5,4,4,6,6,6,6,6,3,null,5,5,5,5,null,3,3,4,4,4,4,5,6,6,1,null,5,5,5,null,6,6,6,3,3,3],"maxValue":6},{"n":7,"solution":[6,6,6,6,6,6,2,5,5,5,3,3,3,2,5,5,1,5,5,5,5,1,2,2,3,3,3,5,4,4,4,4,1,6,6,3,3,3,6,6,6,6,2,2,5,5,5,5,5],"givens":[6,6,6,6,6,6,2,5,5,5,3,3,3,null,5,5,1,null,5,5,5,1,2,null,3,3,3,5,4,4,4,null,1,6,6,3,3,null,6,6,6,null,2,null,5,5,5,5,5],"maxValue":6},{"n":7,"solution":[6,6,6,6,6,6,3,5,5,5,2,2,3,3,5,5,3,3,3,1,2,6,6,6,6,6,6,2,3,3,3,1,2,2,3,5,5,5,5,5,3,3,1,6,6,6,6,6,6],"givens":[6,6,6,6,6,6,3,5,5,5,2,null,3,3,null,5,null,3,3,1,null,6,6,6,6,6,null,2,null,3,3,1,2,2,3,5,5,5,5,null,3,3,1,6,6,6,6,6,6],"maxValue":6},{"n":7,"solution":[4,4,4,4,3,3,3,6,6,6,6,6,6,1,4,4,4,4,2,2,3,2,1,2,2,1,3,3,2,6,6,6,6,6,6,4,4,4,3,3,3,1,4,6,6,6,6,6,6],"givens":[4,4,4,null,3,3,3,null,6,6,6,6,6,1,4,4,4,4,2,2,3,null,1,null,2,1,3,3,2,6,6,6,6,6,null,4,4,null,3,3,null,1,4,6,6,6,6,6,null],"maxValue":6},{"n":7,"solution":[4,4,4,4,6,6,6,6,6,6,1,6,6,6,6,6,6,4,4,4,4,3,3,5,5,5,5,5,3,6,6,6,6,6,6,5,5,5,5,3,3,3,5,6,6,6,6,6,6],"givens":[4,4,4,null,6,6,6,6,6,6,1,null,6,6,6,6,6,null,4,4,4,3,3,5,5,5,5,5,null,6,6,6,6,6,6,5,5,5,null,3,3,3,5,6,6,6,6,6,null],"maxValue":6}],"Hard":[{"n":8,"solution":[1,3,3,3,2,2,1,2,2,6,6,6,6,6,6,2,2,1,5,5,5,5,5,3,5,5,4,4,4,4,3,3,5,5,5,1,5,5,5,5,2,6,6,6,6,6,6,5,2,5,5,5,5,5,4,4,6,6,6,6,6,6,4,4],"givens":[1,3,3,null,2,null,1,2,2,6,6,6,6,6,6,null,2,1,5,5,5,5,5,3,5,5,null,4,4,4,null,3,5,5,5,1,5,5,5,5,2,6,6,6,6,6,null,5,2,null,5,5,5,5,4,4,null,6,6,6,6,6,null,4],"maxValue":6},{"n":8,"solution":[3,3,3,5,5,5,5,5,4,4,4,4,1,2,2,1,2,2,6,6,6,6,6,6,5,5,5,5,4,4,4,4,5,3,3,3,1,5,5,5,6,6,4,4,4,4,5,5,6,6,6,6,2,2,6,6,4,4,4,4,6,6,6,6],"givens":[null,3,3,5,5,5,5,null,4,4,4,4,1,2,2,1,2,null,6,6,6,6,6,null,5,5,5,null,4,4,4,4,5,3,3,3,1,null,5,5,6,6,4,4,4,4,5,5,6,6,6,6,null,2,null,6,null,4,4,4,6,6,6,6],"maxValue":6},{"n":8,"solution":[4,4,4,4,6,6,6,6,1,5,5,5,5,5,6,6,6,6,6,6,6,6,4,4,5,5,5,2,2,1,4,4,5,5,4,4,4,4,5,5,2,2,3,3,3,5,5,5,5,5,5,5,5,2,2,6,3,3,3,6,6,6,6,6],"givens":[4,4,4,null,6,6,6,6,1,5,5,5,5,5,6,null,null,6,6,6,6,6,4,4,5,5,5,2,2,1,4,4,null,5,4,4,4,4,5,5,2,null,3,3,null,5,5,5,5,5,5,5,5,2,null,6,null,3,3,6,6,6,6,6],"maxValue":6},{"n":8,"solution":[3,3,3,4,4,4,4,2,6,6,6,3,3,3,1,2,6,6,6,4,4,4,4,1,5,5,5,5,5,3,3,3,6,6,6,6,6,6,2,2,3,3,3,5,5,5,5,5,4,4,4,4,2,2,3,3,2,2,5,5,5,5,5,3],"givens":[null,3,3,4,4,4,4,2,6,6,6,3,3,3,1,null,6,null,6,4,4,4,4,1,5,5,5,5,null,3,3,3,6,6,6,6,6,6,2,2,3,3,null,5,5,5,5,null,4,4,4,4,null,2,null,3,null,2,5,5,5,5,5,3],"maxValue":6},{"n":8,"solution":[6,6,6,6,6,6,3,3,5,2,2,4,4,4,4,3,5,5,5,5,3,3,3,4,6,6,6,6,6,4,4,4,6,3,3,3,2,2,6,6,5,5,5,5,6,6,6,6,5,4,4,4,4,3,3,3,3,3,3,5,5,5,5,5],"givens":[6,6,6,6,6,6,3,3,5,2,2,4,4,4,null,3,5,5,5,5,null,3,3,4,6,6,6,6,6,null,4,4,6,3,3,null,2,2,null,6,5,5,5,5,6,6,6,6,null,4,4,4,4,3,3,3,3,3,null,5,5,5,5,null],"maxValue":6},{"n":8,"solution":[1,5,5,5,5,5,2,2,6,6,6,6,4,4,4,4,6,6,3,3,3,6,6,6,3,3,2,2,1,6,6,6,3,4,4,4,4,5,5,5,6,6,6,6,6,6,5,5,3,3,3,4,4,4,4,1,6,6,6,6,6,6,2,2],"givens":[1,null,5,5,5,5,null,2,null,6,6,6,4,4,4,4,6,6,3,3,3,6,6,null,3,3,null,2,1,6,6,6,3,4,4,4,4,5,5,null,6,6,6,6,6,6,5,5,null,3,3,4,4,4,null,1,6,6,6,6,6,6,2,null],"maxValue":6},{"n":8,"solution":[5,5,5,5,5,3,3,3,3,3,3,1,4,4,4,4,1,5,5,5,5,5,6,6,2,3,3,3,6,6,6,6,2,4,4,4,4,3,3,3,3,3,1,5,5,5,5,5,3,4,4,4,4,6,6,6,5,5,5,5,5,6,6,6],"givens":[null,5,5,5,5,3,3,3,3,3,3,1,null,4,4,4,1,5,5,5,5,5,6,null,2,3,3,null,6,6,6,6,null,4,4,4,null,3,3,3,3,null,1,5,5,5,5,5,3,4,4,4,null,6,null,6,5,5,5,5,5,6,6,6],"maxValue":6},{"n":8,"solution":[3,3,3,1,6,6,6,6,2,5,5,5,5,5,6,6,2,4,4,4,4,3,3,3,6,6,6,6,6,6,2,2,3,3,3,2,2,5,5,5,6,4,4,4,4,1,5,5,6,6,6,6,6,2,2,1,3,3,3,5,5,5,5,5],"givens":[3,3,null,1,6,6,6,6,null,5,5,5,5,5,null,6,2,null,4,4,4,null,3,3,6,6,6,6,6,6,2,2,3,3,3,2,2,5,5,5,6,null,4,4,4,1,5,5,6,6,6,6,6,null,2,1,null,3,3,5,5,5,5,null],"maxValue":6},{"n":8,"solution":[3,3,3,2,2,6,6,6,5,5,5,5,5,6,6,6,2,2,3,3,3,4,4,4,6,6,6,6,6,6,1,4,2,2,4,4,4,4,6,6,5,1,2,2,6,6,6,6,5,5,5,5,2,2,4,4,6,6,6,6,6,6,4,4],"givens":[3,3,3,null,2,6,6,6,5,5,5,5,5,null,6,6,null,2,3,3,null,4,4,4,6,6,6,6,6,6,1,null,2,2,4,4,4,4,6,6,5,1,null,2,null,6,6,6,5,5,5,5,2,2,4,4,null,6,6,6,6,6,4,null],"maxValue":6},{"n":8,"solution":[2,2,4,4,4,4,3,3,3,1,3,3,3,2,2,3,3,3,4,4,4,4,1,5,6,6,6,1,5,5,5,5,6,6,6,4,4,4,4,3,5,5,5,5,2,2,3,3,5,2,2,1,5,5,5,5,1,6,6,6,6,6,6,5],"givens":[2,2,4,4,4,null,3,3,3,1,3,3,null,2,null,3,3,3,null,4,4,4,1,null,6,null,6,1,5,5,5,5,6,6,6,null,4,4,4,null,5,5,5,5,2,null,3,3,5,2,2,1,5,5,5,5,1,null,6,6,6,6,6,5],"maxValue":6}]};
  function transformNumberGrid(values,n,t){const out=Array(n*n);values.forEach((v,i)=>out[transformGridIndex(i,n,t)]=v);return out;}
  function generateFillomino(seed,difficulty){const pool=FILLOMINO_CERTIFIED_BANK[difficulty]||FILLOMINO_CERTIFIED_BANK.Medium,r=rng(`${seed}:fillomino:certified-v2`),src=pick(pool,r),t=Math.floor(r()*8),solution=transformNumberGrid(src.solution,src.n,t),givens=transformNumberGrid(src.givens,src.n,t);return {n:src.n,solution,givens,maxValue:src.maxValue,certifiedUnique:true,generatorVersion:2};}
  function fillominoComplete(p,b){if(!Array.isArray(b)||b.length!==p.n*p.n)return false;if(b.some(v=>v==null))return false;const n=p.n,seen=new Set();for(let i=0;i<b.length;i++){if(seen.has(i))continue;const val=b[i];if(!Number.isInteger(val)||val<1||val>p.maxValue)return false;const q=[i],comp=[];seen.add(i);while(q.length){const x=q.pop();comp.push(x);for(const y of rcNeighbors(x,n))if(!seen.has(y)&&b[y]===val){seen.add(y);q.push(y)}}if(comp.length!==val)return false;}return p.givens.every((v,i)=>v==null||b[i]===v);}
  const fillominoGame={
    id:'fillomino',name:'Fillomino',generatorVersion:2,description:byId.fillomino.description,defaultDifficulty:'Medium',difficulties:['Easy','Medium','Hard'],
    rules:{objective:'Fill the board with numbers so each connected region has exactly that many cells.',items:['All orthogonally connected equal numbers form one region.','A region labeled N must contain exactly N cells.','Different regions with the same number may not touch orthogonally, because they would merge.','Wave 1 uses a conservative bank of independently uniqueness-certified puzzles; given numbers cannot be changed.']},
    async create(seed,difficulty='Medium'){const puzzle=generateFillomino(seed,difficulty);return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle,state:{board:[...puzzle.givens],selected:puzzle.givens.findIndex(v=>v==null),history:[],mistakes:0}};},
    async save(a){return saveActive(a);},
    render(a){const {n,givens,solution,maxValue}=a.puzzle,cells=a.state.board.map((v,i)=>`<button class="fill-cell ${givens[i]!=null?'given':''} ${i===a.state.selected?'selected':''} ${v!=null&&v!==solution[i]&&state.settings.playMode==='challenge'?'wrong':''}" data-fill="${i}" aria-label="Row ${Math.floor(i/n)+1}, column ${i%n+1}, ${v??'empty'}${givens[i]!=null?', given':''}">${v??''}</button>`).join(''),pad=Array.from({length:maxValue},(_,k)=>`<button data-fill-value="${k+1}">${k+1}</button>`).join('');main.innerHTML=baseGameShell(byId[this.id],a,`<div class="fill-board" style="grid-template-columns:repeat(${n},1fr)">${cells}</div>`,`<div class="number-pad">${pad}<button data-fill-value="clear">Clear</button><button data-fill-undo>Undo</button></div>${a.completed?resultPanel(a,this,`<div><strong>${n}×${n}</strong><span>Board</span></div>`):''}`);bindGameShell(this,a);this.bind(a);if(a.completed)bindResult(a,this);},
    bind(a){$$('[data-fill]').forEach(b=>b.onclick=()=>{a.state.selected=+b.dataset.fill;this.render(a)});$$('[data-fill-value]').forEach(b=>b.onclick=()=>this.enter(a,b.dataset.fillValue));$('[data-fill-undo]').onclick=()=>this.undo(a);window.onkeydown=e=>{if(a.completed||overlayRoot.innerHTML)return;const n=a.puzzle.n,i=a.state.selected,r=Math.floor(i/n),c=i%n;if(/^[1-9]$/.test(e.key)&&+e.key<=a.puzzle.maxValue){this.enter(a,e.key);return}if(e.key==='Delete'||e.key==='Backspace'){this.enter(a,'clear');return}let rr=r,cc=c;if(e.key==='ArrowUp')rr=Math.max(0,r-1);else if(e.key==='ArrowDown')rr=Math.min(n-1,r+1);else if(e.key==='ArrowLeft')cc=Math.max(0,c-1);else if(e.key==='ArrowRight')cc=Math.min(n-1,c+1);else return;e.preventDefault();a.state.selected=rr*n+cc;this.render(a)}},
    async enter(a,val){const i=a.state.selected;if(i<0||a.puzzle.givens[i]!=null)return;const old=a.state.board[i],v=val==='clear'?null:+val;if(old===v)return;a.state.history.push([i,old]);a.state.board[i]=v;if(v!=null&&v!==a.puzzle.solution[i]&&state.settings.playMode==='challenge')a.state.mistakes++;if(fillominoComplete(a.puzzle,a.state.board))await finishActive(a,{size:a.puzzle.n,mistakes:a.state.mistakes});else await saveActive(a);this.render(a);},
    async undo(a){const h=a.state.history.pop();if(!h)return;a.state.board[h[0]]=h[1];a.state.selected=h[0];await saveActive(a);this.render(a);},
    hint(a){const d=fillominoProof(a);deliverProofHint(a,d);if(d?.index!=null)this.render(a);}
  };

  // ---------- Untangle ----------
  function addEdgeSet(set,a,b){if(a===b)return;const x=Math.min(a,b),y=Math.max(a,b);set.add(`${x}-${y}`);}
  function generateUntangle(seed,difficulty){const n={Easy:8,Medium:12,Hard:16}[difficulty]||12,r=rng(`${seed}:untangle`),edges=new Set();for(let i=0;i<n;i++)addEdgeSet(edges,i,(i+1)%n);function triangulate(ids){if(ids.length<=3)return;const k=1+Math.floor(r()*(ids.length-2));addEdgeSet(edges,ids[0],ids[k]);addEdgeSet(edges,ids[k],ids[ids.length-1]);triangulate(ids.slice(0,k+1));triangulate(ids.slice(k));}triangulate(Array.from({length:n},(_,i)=>i));const solved=Array.from({length:n},(_,i)=>{const a=-Math.PI/2+2*Math.PI*i/n;return {x:.5+.40*Math.cos(a),y:.5+.40*Math.sin(a)}}),list=[...edges].map(s=>s.split('-').map(Number));let pos;for(let t=0;t<200;t++){const perm=shuffle(Array.from({length:n},(_,i)=>i),r);pos=perm.map(i=>({...solved[i]}));if(untangleCrossings(list,pos)>Math.max(2,n/3))break;}return {n,edges:list,initial:pos};}
  function orient(a,b,c){return (b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);}
  function pointOnSegment(p,a,b) {
    const e=1e-8;
    return Math.abs(orient(a,b,p))<=e && p.x>=Math.min(a.x,b.x)-e && p.x<=Math.max(a.x,b.x)+e && p.y>=Math.min(a.y,b.y)-e && p.y<=Math.max(a.y,b.y)+e;
  }
  function segmentsCross(a,b,c,d) {
    const e=1e-8,o1=orient(a,b,c),o2=orient(a,b,d),o3=orient(c,d,a),o4=orient(c,d,b);
    return (((o1>e&&o2<-e)||(o1<-e&&o2>e))&&((o3>e&&o4<-e)||(o3<-e&&o4>e))) ||
      pointOnSegment(c,a,b)||pointOnSegment(d,a,b)||pointOnSegment(a,c,d)||pointOnSegment(b,c,d);
  }
  function untangleCrossings(edges,pos) {
    let count=0;
    for(let i=0;i<pos.length;i++)for(let j=i+1;j<pos.length;j++)if(Math.hypot(pos[i].x-pos[j].x,pos[i].y-pos[j].y)<.012)count++;
    for(const [a,b] of edges)for(let i=0;i<pos.length;i++)if(i!==a&&i!==b&&pointOnSegment(pos[i],pos[a],pos[b]))count++;
    for(let i=0;i<edges.length;i++)for(let j=i+1;j<edges.length;j++){
      const [a,b]=edges[i],[c,d]=edges[j];if(a===c||a===d||b===c||b===d)continue;
      if(segmentsCross(pos[a],pos[b],pos[c],pos[d]))count++;
    }
    return count;
  }
  const untangleGame={
    id:'untangle',name:'Untangle',description:byId.untangle.description,defaultDifficulty:'Medium',difficulties:['Easy','Medium','Hard'],
    rules:{objective:'Move the graph nodes until no two unrelated edges cross.',items:['Drag any node to a new position.','Edges move with their endpoints.','Edges sharing a node may meet there; other crossings must be removed.','Any crossing-free arrangement is a valid solution.']},
    async create(seed,difficulty='Medium'){const puzzle=generateUntangle(seed,difficulty);return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle,state:{positions:puzzle.initial.map(p=>({...p})),selected:0,history:[],moves:0}};},
    async save(a){return saveActive(a);},
    svg(a){const crossPairs=new Set();for(let i=0;i<a.puzzle.edges.length;i++)for(let j=i+1;j<a.puzzle.edges.length;j++){const [x,y]=a.puzzle.edges[i],[u,v]=a.puzzle.edges[j];if(x===u||x===v||y===u||y===v)continue;if(segmentsCross(a.state.positions[x],a.state.positions[y],a.state.positions[u],a.state.positions[v])){crossPairs.add(i);crossPairs.add(j);}}const lines=a.puzzle.edges.map(([x,y],i)=>{const A=a.state.positions[x],B=a.state.positions[y];return `<line data-edge="${i}" class="${crossPairs.has(i)?'crossing':''}" x1="${A.x*100}" y1="${A.y*100}" x2="${B.x*100}" y2="${B.y*100}"/>`}).join('');const nodes=a.state.positions.map((p,i)=>`<g class="untangle-node ${i===a.state.selected?'selected':''}" data-node="${i}" tabindex="0" role="button" aria-label="Node ${i+1}"><circle cx="${p.x*100}" cy="${p.y*100}" r="3.2"/><text x="${p.x*100}" y="${p.y*100+.9}">${i+1}</text></g>`).join('');return `<svg class="untangle-svg" viewBox="0 0 100 100" aria-label="Untangle graph">${lines}${nodes}</svg>`;},
    render(a){const count=untangleCrossings(a.puzzle.edges,a.state.positions);main.innerHTML=baseGameShell(byId[this.id],a,`<div class="untangle-wrap">${this.svg(a)}<div class="crossing-count"><strong>${count}</strong><span> crossings / overlaps</span></div></div>`,`<div class="toolbar"><button data-untangle-undo>Undo move</button></div>${a.completed?resultPanel(a,this,`<div><strong>${a.state.moves}</strong><span>Moves</span></div>`):''}`);bindGameShell(this,a);this.bind(a);if(a.completed)bindResult(a,this);},
    bind(a){let drag=null,start=null;const svg=$('.untangle-svg');const local=e=>{const rect=svg.getBoundingClientRect();return {x:clamp((e.clientX-rect.left)/rect.width,.035,.965),y:clamp((e.clientY-rect.top)/rect.height,.035,.965)}};$$('[data-node]').forEach(g=>{g.onpointerdown=e=>{e.preventDefault();const i=+g.dataset.node;a.state.selected=i;drag=i;start={...a.state.positions[i]};g.setPointerCapture?.(e.pointerId)};g.onclick=()=>{a.state.selected=+g.dataset.node};});svg.onpointermove=e=>{if(drag==null)return;a.state.positions[drag]=local(e);this.updateDom(a)};const end=async()=>{if(drag==null)return;const i=drag;drag=null;if(start&&(Math.abs(start.x-a.state.positions[i].x)>.0001||Math.abs(start.y-a.state.positions[i].y)>.0001)){a.state.history.push([i,start]);a.state.moves++;if(untangleCrossings(a.puzzle.edges,a.state.positions)===0)await finishActive(a,{nodes:a.puzzle.n,moves:a.state.moves});else await saveActive(a);}start=null;this.render(a)};svg.onpointerup=end;const cancel=()=>{if(drag!=null&&start)a.state.positions[drag]=start;drag=null;start=null;};pointerCleanup=cancel;svg.onpointercancel=()=>{cancel();this.render(a)};$$('[data-node]').forEach(el=>{el.onfocus=()=>{a.state.selected=+el.dataset.node;$$('[data-node]').forEach(g=>g.classList.toggle('selected',g===el));};el.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();a.state.selected=+el.dataset.node;}};});$('[data-untangle-undo]').onclick=()=>this.undo(a);window.onkeydown=e=>{if(a.completed||overlayRoot.innerHTML)return;const i=a.state.selected,p=a.state.positions[i],step=e.shiftKey?.04:.018;let dx=0,dy=0;if(e.key==='ArrowUp')dy=-step;else if(e.key==='ArrowDown')dy=step;else if(e.key==='ArrowLeft')dx=-step;else if(e.key==='ArrowRight')dx=step;else return;e.preventDefault();a.state.history.push([i,{...p}]);a.state.positions[i]={x:clamp(p.x+dx,.035,.965),y:clamp(p.y+dy,.035,.965)};a.state.moves++;if(untangleCrossings(a.puzzle.edges,a.state.positions)===0)finishActive(a,{nodes:a.puzzle.n,moves:a.state.moves}).then(()=>this.render(a));else saveActive(a).then(()=>this.render(a));}} ,
    updateDom(a){const svg=$('.untangle-svg');if(!svg)return;a.puzzle.edges.forEach(([x,y],i)=>{const l=svg.querySelector(`[data-edge="${i}"]`),A=a.state.positions[x],B=a.state.positions[y];if(l){l.setAttribute('x1',A.x*100);l.setAttribute('y1',A.y*100);l.setAttribute('x2',B.x*100);l.setAttribute('y2',B.y*100);}});a.state.positions.forEach((p,i)=>{const g=svg.querySelector(`[data-node="${i}"]`);if(g){const c=g.querySelector('circle'),t=g.querySelector('text');c.setAttribute('cx',p.x*100);c.setAttribute('cy',p.y*100);t.setAttribute('x',p.x*100);t.setAttribute('y',p.y*100+.9);}});const count=untangleCrossings(a.puzzle.edges,a.state.positions);const el=$('.crossing-count strong');if(el)el.textContent=count;svg.querySelectorAll('[data-edge]').forEach((l,i)=>l.classList.remove('crossing'));for(let i=0;i<a.puzzle.edges.length;i++)for(let j=i+1;j<a.puzzle.edges.length;j++){const [x,y]=a.puzzle.edges[i],[u,v]=a.puzzle.edges[j];if(x===u||x===v||y===u||y===v)continue;if(segmentsCross(a.state.positions[x],a.state.positions[y],a.state.positions[u],a.state.positions[v])){svg.querySelector(`[data-edge="${i}"]`)?.classList.add('crossing');svg.querySelector(`[data-edge="${j}"]`)?.classList.add('crossing');}}},
    async undo(a){const h=a.state.history.pop();if(!h)return;a.state.positions[h[0]]=h[1];a.state.moves=Math.max(0,a.state.moves-1);await saveActive(a);this.render(a);},
    hint(a){const counts=Array(a.puzzle.n).fill(0);for(let i=0;i<a.puzzle.edges.length;i++)for(let j=i+1;j<a.puzzle.edges.length;j++){const [x,y]=a.puzzle.edges[i],[u,v]=a.puzzle.edges[j];if(x===u||x===v||y===u||y===v)continue;if(segmentsCross(a.state.positions[x],a.state.positions[y],a.state.positions[u],a.state.positions[v])){counts[x]++;counts[y]++;counts[u]++;counts[v]++;}}let best=counts.indexOf(Math.max(...counts));if(best<0||counts[best]===0)return toast('No crossings remain.');a.state.selected=best;toast(`Hint: node ${best+1} participates in ${counts[best]} crossing${counts[best]===1?'':'s'}. Try moving it into a clearer area.`);this.render(a);}
  };

  // ---------- Wave 5: Classic Game Depth ----------
  // Versioned procedural/certified engines for Kakuro, Killer Sudoku, Mines,
  // Nonogram, Towers, Tents, Queens, and Light Up.
  const W5_VERSION=5;

  // ----- Kakuro v5: connected certified run boards -----
  function w5KakBlockCount(matrix,limit=2){
    const row=matrix.map(x=>x.reduce((a,b)=>a+b,0)), col=Array.from({length:3},(_,c)=>matrix.reduce((s,x)=>s+x[c],0)), b=Array(9).fill(0);let count=0;
    const ok=(i,v)=>{const r=Math.floor(i/3),c=i%3;for(let x=0;x<3;x++){if(b[r*3+x]===v||b[x*3+c]===v)return false;}let rs=0,re=0,cs=0,ce=0;for(let x=0;x<3;x++){if(x!==c&&b[r*3+x])rs+=b[r*3+x];else if(x!==c)re++;if(x!==r&&b[x*3+c])cs+=b[x*3+c];else if(x!==r)ce++;}if(rs+v>=row[r]&&re)return false;if(rs+v!==row[r]&&!re)return false;if(cs+v>=col[c]&&ce)return false;if(cs+v!==col[c]&&!ce)return false;return true;};
    function rec(){if(count>=limit)return;let bi=-1,opts=null;for(let i=0;i<9;i++)if(!b[i]){const o=[];for(let v=1;v<=9;v++)if(ok(i,v))o.push(v);if(!o.length)return;if(!opts||o.length<opts.length){bi=i;opts=o;if(o.length===1)break;}}if(bi<0){count++;return;}for(const v of opts){b[bi]=v;rec();b[bi]=0;if(count>=limit)return;}}rec();return count;
  }
  const W5_KAK_BASES=[[[8,6,9],[6,1,2],[9,3,7]],[[3,6,1],[1,8,4],[6,9,2]],[[9,8,4],[3,6,1],[7,9,2]],[[2,4,9],[4,1,8],[1,3,6]],[[6,7,4],[1,4,2],[8,9,6]],[[4,1,6],[7,3,9],[9,6,8]],[[1,8,3],[2,3,1],[8,9,6]],[[1,4,2],[2,7,9],[4,9,8]],[[8,1,2],[6,3,1],[9,6,4]],[[2,1,4],[6,8,9],[1,3,7]]];
  const W5_KAK_CONNECTED={
    Medium:[
      {n:5,black:[2,10,13,14,22],matrix:[[9,7,5,3,8],[8,3,2,1,6],[6,1,4,7,9],[7,2,9,4,3],[3,4,8,5,1]]},
      {n:5,black:[2,7,10,14,22],matrix:[[1,6,5,8,7],[2,8,7,4,9],[3,4,9,6,5],[4,9,2,5,3],[8,7,1,9,2]]}
    ],
    Hard:[
      {n:5,black:[2,10,14,22],matrix:[[1,2,4,8,9],[6,5,7,4,2],[3,9,8,7,5],[7,1,5,2,3],[8,6,9,5,1]]}
    ]
  };
  function w5KakuroBlock(seed){const r=rng(seed);for(let tries=0;tries<W5_KAK_BASES.length*2;tries++){const base=pick(W5_KAK_BASES,r),m=transformSquareMatrix(base,Math.floor(r()*8));if(w5KakBlockCount(m,2)===1)return m;}throw new Error('Certified Kakuro base unavailable');}
  function w5KakTransformBase(base,t,complement=false){const n=base.n,mask=Array.from({length:n},(_,r)=>Array.from({length:n},(_,c)=>base.black.includes(r*n+c)?1:0)),tm=transformSquareMatrix(base.matrix,t),bm=transformSquareMatrix(mask,t);return {n,matrix:tm.map(row=>row.map(v=>complement?10-v:v)),black:bm.flatMap((row,r)=>row.map((v,c)=>v?r*n+c:-1)).filter(i=>i>=0)};}
  function w5KakuroFromConnected(base){const n=base.n,rows=n+1,cols=n+1,blackSet=new Set(base.black),white=Array(rows*cols).fill(false),solution=Array(rows*cols).fill(null),clues={},runs=[];for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(!blackSet.has(r*n+c)){const i=(r+1)*cols+c+1;white[i]=true;solution[i]=base.matrix[r][c];}
    const addRun=(start,cells,dir)=>{if(cells.length<2)return;const sum=cells.reduce((s,i)=>s+solution[i],0);runs.push({cells,sum,dir});clues[start]=clues[start]||{};clues[start][dir==='across'?'across':'down']=sum;};
    for(let fr=0;fr<rows;fr++)for(let fc=0;fc<cols;fc++){const start=fr*cols+fc;if(white[start])continue;const across=[];for(let c=fc+1;c<cols&&white[fr*cols+c];c++)across.push(fr*cols+c);addRun(start,across,'across');const down=[];for(let r=fr+1;r<rows&&white[r*cols+fc];r++)down.push(r*cols+fc);addRun(start,down,'down');}
    const runOf=Array.from({length:rows*cols},()=>[]);runs.forEach((run,ri)=>run.cells.forEach(i=>runOf[i].push(ri)));return {rows,cols,white,solution,clues,runs,runOf,blockCount:1,connected:true,certifiedUnique:true,generatorVersion:W5_VERSION,difficultyScore:white.filter(Boolean).length+runs.length*1.5};
  }
  function w5KakRunPossible(run,board){let sum=0,used=new Set(),empty=0;for(const i of run.cells){const v=board[i];if(v){if(used.has(v))return false;used.add(v);sum+=v;}else empty++;}if(sum>run.sum)return false;if(!empty)return sum===run.sum;const avail=[];for(let v=1;v<=9;v++)if(!used.has(v))avail.push(v);avail.sort((a,b)=>a-b);if(avail.length<empty)return false;const min=avail.slice(0,empty).reduce((a,b)=>a+b,0),max=avail.slice(-empty).reduce((a,b)=>a+b,0);return sum+min<=run.sum&&sum+max>=run.sum;}
  function w5CountKakuroPuzzle(p,limit=2){const b=p.white.map(w=>w?0:null);let count=0;function rec(){if(count>=limit)return;let bi=-1,opts=null;for(let i=0;i<b.length;i++)if(p.white[i]&&!b[i]){const o=[];for(let v=1;v<=9;v++){b[i]=v;if(p.runOf[i].every(ri=>w5KakRunPossible(p.runs[ri],b)))o.push(v);b[i]=0;}if(!o.length)return;if(!opts||o.length<opts.length){bi=i;opts=o;if(o.length===1)break;}}if(bi<0){if(p.runs.every(run=>w5KakRunPossible(run,b)))count++;return;}for(const v of opts){b[bi]=v;rec();b[bi]=0;if(count>=limit)return;}}rec();return count;}
  function w5BuildKakuro(seed,difficulty){const r=rng(`${seed}:kak5`);if(difficulty==='Easy'){const m=w5KakuroBlock(`${seed}:easy`),base={n:3,black:[],matrix:m};const p=w5KakuroFromConnected(base);p.difficultyScore=18;return p;}const pool=W5_KAK_CONNECTED[difficulty]||W5_KAK_CONNECTED.Medium,src=pick(pool,r),base=w5KakTransformBase(src,Math.floor(r()*8),r()>.5),p=w5KakuroFromConnected(base);if(w5CountKakuroPuzzle(p,2)!==1)throw new Error('Connected Kakuro uniqueness certification failed');return p;}
  function w5KakComplete(p,b){if(!Array.isArray(b)||b.length!==p.white.length||!p.white.every((w,i)=>!w||(Number.isInteger(b[i])&&b[i]>=1&&b[i]<=9)))return false;return p.white.every((w,i)=>!w||!!b[i])&&p.runs.every(run=>w5KakRunPossible(run,b));}
  function w5KakProof(a){const p=a.puzzle,b=a.state.board;for(let i=0;i<b.length;i++)if(p.white[i]&&!b[i]){const viable=[];for(let v=1;v<=9;v++){b[i]=v;if(p.runOf[i].every(ri=>w5KakRunPossible(p.runs[ri],b)))viable.push(v);b[i]=0;}if(viable.length===1){const runs=p.runOf[i].map(ri=>p.runs[ri]);return {token:`kak5-${i}-${viable[0]}`,index:i,focus:`Inspect row ${Math.floor(i/p.cols)+1}, column ${i%p.cols+1}.`,rule:'Digits cannot repeat in a run and each run must reach its printed sum exactly.',deduction:`Crossing run sums ${runs.map(x=>x.sum).join(' and ')} leave only ${viable[0]} locally feasible.`,reveal:`Enter ${viable[0]} here.`};}}return {token:'kak5-global',focus:'Inspect the run with the fewest empty cells.',rule:'A Kakuro run uses distinct digits that sum exactly to its clue.',deduction:'Compare the remaining sum against unused digits in the crossing run.',reveal:'Use the run-combination information rather than guessing.'};}
  kakuroGame.generatorVersion=W5_VERSION;kakuroGame.difficulties=['Easy','Medium','Hard'];kakuroGame.defaultDifficulty='Medium';
  kakuroGame.create=async function(seed,difficulty='Medium'){const puzzle=w5BuildKakuro(seed,difficulty),board=puzzle.white.map(w=>w?0:null),sel=puzzle.white.findIndex(Boolean);return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle,state:{board,selected:sel,history:[]}};};
  kakuroGame.render=function(a){const p=a.puzzle;let cells='';for(let i=0;i<p.rows*p.cols;i++){if(p.white[i]){const v=a.state.board[i],wrong=state.settings.playMode==='challenge'&&v&&v!==p.solution[i];cells+=`<button class="kakuro-cell ${i===a.state.selected?'selected':''} ${wrong?'wrong':''}" data-kakuro="${i}" aria-label="Row ${Math.floor(i/p.cols)+1}, column ${i%p.cols+1}, ${v?`value ${v}`:'empty'}">${v||''}</button>`;}else{const q=p.clues[i];cells+=q?`<div class="kakuro-clue"><span>${q.down?`↓${q.down}`:''}</span><strong>${q.across?`→${q.across}`:''}</strong></div>`:`<div class="kakuro-black"></div>`;}}
    const board=`<div class="kakuro-board kakuro-board--deep" style="grid-template-columns:repeat(${p.cols},minmax(0,1fr));grid-template-rows:repeat(${p.rows},minmax(0,1fr));--kak-cols:${p.cols}">${cells}</div>`,pad=`<div class="number-pad kakuro-pad">${[1,2,3,4,5,6,7,8,9].map(n=>`<button data-kakuro-num="${n}">${n}</button>`).join('')}<button data-kakuro-num="0">Clear</button><button data-kakuro-undo>Undo</button></div>`,res=a.completed?resultPanel(a,this,`<div><strong>${p.runs.length}</strong><span>Runs</span></div>`):'';main.innerHTML=baseGameShell(byId[this.id],a,board,`${pad}${res}`);bindGameShell(this,a);this.bind(a);if(a.completed)bindResult(a,this);};
  kakuroGame.bind=function(a){const p=a.puzzle;$$('[data-kakuro]').forEach(b=>b.onclick=()=>{a.state.selected=+b.dataset.kakuro;this.render(a)});$$('[data-kakuro-num]').forEach(b=>b.onclick=()=>this.enter(a,+b.dataset.kakuroNum));$('[data-kakuro-undo]').onclick=()=>this.undo(a);window.onkeydown=e=>{if(a.completed||overlayRoot.innerHTML)return;let i=a.state.selected,r=Math.floor(i/p.cols),c=i%p.cols;if(/^[1-9]$/.test(e.key)){e.preventDefault();this.enter(a,+e.key);return;}if(e.key==='Backspace'||e.key==='Delete'){e.preventDefault();this.enter(a,0);return;}const d={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]}[e.key];if(!d)return;e.preventDefault();for(let step=0;step<Math.max(p.rows,p.cols);step++){r=clamp(r+d[0],0,p.rows-1);c=clamp(c+d[1],0,p.cols-1);const j=r*p.cols+c;if(p.white[j]){a.state.selected=j;break;}if((r===0&&d[0]<0)||(r===p.rows-1&&d[0]>0)||(c===0&&d[1]<0)||(c===p.cols-1&&d[1]>0))break;}this.render(a);};};
  kakuroGame.enter=async function(a,n){const i=a.state.selected;if(!a.puzzle.white[i])return;const old=a.state.board[i];if(old===n)return;a.state.history.push([i,old]);a.state.board[i]=n;if(w5KakComplete(a.puzzle,a.state.board))await finishActive(a,{runs:a.puzzle.runs.length,blocks:a.puzzle.blockCount});else await saveActive(a);this.render(a);};
  kakuroGame.hint=function(a){deliverProofHint(a,w5KakProof(a));};
  // ----- Killer Sudoku v5: cage-driven, no ordinary givens -----
  function w5KillerCageFeasible(cage,b){const vals=cage.cells.map(i=>b[i]).filter(Boolean);if(new Set(vals).size!==vals.length)return false;const sum=vals.reduce((a,x)=>a+x,0),empty=cage.cells.length-vals.length;if(sum>cage.sum)return false;if(!empty)return sum===cage.sum;const avail=[1,2,3,4,5,6,7,8,9].filter(x=>!vals.includes(x));let possible=false;function rec(start,left,k){if(possible)return;if(k===0){if(left===0)possible=true;return;}for(let j=start;j<avail.length;j++){if(avail[j]>left)break;rec(j+1,left-avail[j],k-1);}}rec(0,cage.sum-sum,empty);return possible;}
  function w5CountKiller(p,start,limit=2,stats=null){const b=[...start],owner=p.cageOf;let count=0,nodes=0;function valid(i,v){const r=Math.floor(i/9),c=i%9;for(let x=0;x<9;x++)if(b[r*9+x]===v||b[x*9+c]===v)return false;const br=Math.floor(r/3)*3,bc=Math.floor(c/3)*3;for(let rr=0;rr<3;rr++)for(let cc=0;cc<3;cc++)if(b[(br+rr)*9+bc+cc]===v)return false;b[i]=v;const ok=w5KillerCageFeasible(p.cages[owner[i]],b);b[i]=0;return ok;}function rec(){if(count>=limit)return;nodes++;let bi=-1,opts=null;for(let i=0;i<81;i++)if(!b[i]){const o=[];for(let v=1;v<=9;v++)if(valid(i,v))o.push(v);if(!o.length)return;if(!opts||o.length<opts.length){bi=i;opts=o;if(o.length===1)break;}}if(bi<0){count++;return;}for(const v of opts){b[bi]=v;rec();b[bi]=0;if(count>=limit)return;}}rec();if(stats){stats.nodes=nodes;stats.count=count;}return count;}
  function w5SplitKillerCage(cages,solution,r){const candidates=cages.map((g,i)=>({g,i})).filter(x=>x.g.cells.length>=4);if(!candidates.length)return false;const {g,i}=pick(candidates,r),cells=[...g.cells],seed=pick(cells,r),part=new Set([seed]);while(part.size<Math.floor(cells.length/2)){const frontier=[...new Set([...part].flatMap(k=>killerNeighbors(k)))].filter(k=>cells.includes(k)&&!part.has(k));if(!frontier.length)break;part.add(pick(frontier,r));}if(part.size<2||part.size===cells.length)return false;const a=[...part],b=cells.filter(x=>!part.has(x));const connected=x=>{const S=new Set(x),seen=new Set([x[0]]),q=[x[0]];while(q.length){const z=q.pop();killerNeighbors(z).forEach(j=>{if(S.has(j)&&!seen.has(j)){seen.add(j);q.push(j);}})}return seen.size===x.length;};if(!connected(a)||!connected(b))return false;cages.splice(i,1,{cells:a.sort((x,y)=>x-y),sum:a.reduce((s,x)=>s+solution[x],0)},{cells:b.sort((x,y)=>x-y),sum:b.reduce((s,x)=>s+solution[x],0)});return true;}
  function w5KillerPartition(solution,seed,difficulty){const max={Easy:3,Medium:4,Hard:4}[difficulty]||4;for(let attempt=0;attempt<120;attempt++){const r=rng(`${seed}:part:${attempt}`),un=new Set(Array.from({length:81},(_,i)=>i)),cages=[];let failed=false;while(un.size){if(un.size===1){failed=true;break;}let start=-1,best=null;for(const i of un){const o=killerNeighbors(i).filter(j=>un.has(j)&&solution[j]!==solution[i]);if(start<0||o.length<best.length){start=i;best=o;}}if(!best.length){failed=true;break;}const cells=[start],digits=new Set([solution[start]]);un.delete(start);let target=2+Math.floor(r()*Math.max(1,max-1));if(un.size===2)target=3;if(un.size===1)target=2;while(cells.length<target){const frontier=[...new Set(cells.flatMap(k=>killerNeighbors(k)))].filter(j=>un.has(j)&&!digits.has(solution[j]));if(!frontier.length)break;const j=pick(frontier,r);cells.push(j);digits.add(solution[j]);un.delete(j);}if(cells.length<2){failed=true;break;}cages.push({cells:cells.sort((a,b)=>a-b),sum:cells.reduce((z,i)=>z+solution[i],0)});}if(!failed&&!un.size&&cages.every(g=>g.cells.length>=2))return cages;}throw new Error('Killer cage partition failed');}
  function w5KillerAnchor(cages,solution,r){const connected=cells=>{if(!cells.length)return false;const S=new Set(cells),seen=new Set([cells[0]]),q=[cells[0]];while(q.length){const z=q.pop();killerNeighbors(z).forEach(j=>{if(S.has(j)&&!seen.has(j)){seen.add(j);q.push(j);}})}return seen.size===cells.length;};const choices=[];cages.forEach((g,gi)=>{if(g.cells.length<3)return;for(const cell of g.cells){const rest=g.cells.filter(x=>x!==cell);if(connected(rest))choices.push([gi,cell]);}});if(!choices.length)return false;const [gi,cell]=pick(choices,r),g=cages[gi],rest=g.cells.filter(x=>x!==cell);cages.splice(gi,1,{cells:rest.sort((a,b)=>a-b),sum:rest.reduce((s,x)=>s+solution[x],0)},{cells:[cell],sum:solution[cell]});return true;}
  function w5GenerateKiller(seed,difficulty){const solution=generateSudoku(`${seed}:killer5:solution`,'Hard').solution,r=rng(`${seed}:killer5:cages`);for(let attempt=0;attempt<24;attempt++){
    let cages=w5KillerPartition(solution,`${seed}:killer5:${attempt}`,difficulty);const anchors={Easy:6,Medium:6,Hard:6}[difficulty];for(let k=0;k<anchors;k++)w5KillerAnchor(cages,solution,r);
    for(let split=0;split<12;split++){const cageOf=Array(81);cages.forEach((g,gi)=>g.cells.forEach(i=>cageOf[i]=gi));const p={solution,givens:Array(81).fill(0),cages,cageOf};const st={};const c=w5CountKiller(p,Array(81).fill(0),2,st);if(c===1){const singletonCount=cages.filter(g=>g.cells.length===1).length;return {...p,certifiedUnique:true,generatorVersion:W5_VERSION,difficultyScore:+(Math.log10(st.nodes+1)*20+cages.length*.25-singletonCount*.45).toFixed(2),solverNodes:st.nodes,singletonCages:singletonCount};}if(!w5SplitKillerCage(cages,solution,r))break;}}
    throw new Error('Killer Sudoku cage-driven generation failed uniqueness certification');}
  killerSudoku.generatorVersion=W5_VERSION;killerSudoku.rules.items=['Rows, columns, and 3×3 boxes contain 1–9 exactly once.','Digits do not repeat inside a cage.','The small number in a cage is the sum of its cells.','Normal puzzles are cage-driven: there are no ordinary starting digits.'];
  killerSudoku.create=async function(seed,difficulty='Medium'){const puzzle=w5GenerateKiller(seed,difficulty);return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle,state:{board:Array(81).fill(0),selected:0,history:[],mistakes:0}};};
  // ----- Wave 8: Killer Sudoku certified runtime bank -----
  const W8_KILLER_VERSION=8;
  const W8_KILLER_BANK={"Easy":[{"sourceSeed":"w8-killer-Easy-0","solution":[4,5,7,3,8,6,2,9,1,2,1,9,4,7,5,3,8,6,3,6,8,2,9,1,4,7,5,7,4,6,8,1,3,9,5,2,9,2,5,7,6,4,8,1,3,8,3,1,9,5,2,7,6,4,6,7,3,1,2,8,5,4,9,1,8,2,5,4,9,6,3,7,5,9,4,6,3,7,1,2,8],"cages":[{"cells":[0,1],"sum":9},{"cells":[2,3],"sum":10},{"cells":[4,13],"sum":15},{"cells":[5,14],"sum":11},{"cells":[6,7,15],"sum":14},{"cells":[16,17],"sum":14},{"cells":[8],"sum":1},{"cells":[9,18],"sum":5},{"cells":[10,11,20],"sum":18},{"cells":[12,21],"sum":6},{"cells":[30],"sum":8},{"cells":[19,28],"sum":10},{"cells":[27,36],"sum":16},{"cells":[29,38],"sum":11},{"cells":[37,46],"sum":5},{"cells":[45,54],"sum":14},{"cells":[55],"sum":7},{"cells":[22,31],"sum":10},{"cells":[23,24,33],"sum":14},{"cells":[32,41],"sum":7},{"cells":[25,26],"sum":12},{"cells":[34,35],"sum":7},{"cells":[43],"sum":1},{"cells":[42,51],"sum":15},{"cells":[44,53],"sum":7},{"cells":[52,61],"sum":10},{"cells":[62,71],"sum":16},{"cells":[79,80],"sum":10},{"cells":[69,70],"sum":9},{"cells":[59,60,68],"sum":22},{"cells":[49,50],"sum":7},{"cells":[39,40],"sum":13},{"cells":[76,77,78],"sum":11},{"cells":[47,56],"sum":4},{"cells":[65],"sum":2},{"cells":[48,57],"sum":10},{"cells":[58,67],"sum":6},{"cells":[66],"sum":5},{"cells":[74,75],"sum":10},{"cells":[63,72],"sum":6},{"cells":[64,73],"sum":17}],"difficultyScore":51.24,"solverNodes":152,"singletonCages":6},{"sourceSeed":"w8-killer-Easy-3","solution":[9,1,4,3,5,2,7,8,6,3,2,5,8,7,6,4,9,1,8,6,7,9,4,1,5,3,2,6,4,9,1,3,5,8,2,7,2,7,8,6,9,4,3,1,5,1,5,3,2,8,7,9,6,4,7,9,6,4,1,3,2,5,8,4,3,1,5,2,8,6,7,9,5,8,2,7,6,9,1,4,3],"cages":[{"cells":[0,1],"sum":10},{"cells":[2,3,11],"sum":12},{"cells":[4,5],"sum":7},{"cells":[7,16],"sum":17},{"cells":[6],"sum":7},{"cells":[8,17],"sum":7},{"cells":[9,10],"sum":5},{"cells":[12,13,22],"sum":19},{"cells":[14,15],"sum":10},{"cells":[18,19],"sum":14},{"cells":[29,38],"sum":17},{"cells":[20],"sum":7},{"cells":[21,30],"sum":10},{"cells":[23,31,32],"sum":9},{"cells":[24,33,42],"sum":16},{"cells":[25,34],"sum":5},{"cells":[26,35],"sum":9},{"cells":[27,36],"sum":8},{"cells":[45],"sum":1},{"cells":[28,37],"sum":11},{"cells":[46],"sum":5},{"cells":[39,40,48],"sum":17},{"cells":[41,50],"sum":11},{"cells":[51],"sum":9},{"cells":[55,56],"sum":15},{"cells":[47],"sum":3},{"cells":[49,57,58],"sum":13},{"cells":[54,63],"sum":11},{"cells":[64,72,73],"sum":16},{"cells":[43,44],"sum":6},{"cells":[52,61],"sum":11},{"cells":[53,62],"sum":12},{"cells":[59,60,68],"sum":13},{"cells":[65,66],"sum":6},{"cells":[67,76],"sum":8},{"cells":[74,75],"sum":9},{"cells":[77,78],"sum":10},{"cells":[69,70,71],"sum":22},{"cells":[79,80],"sum":7}],"difficultyScore":66.09,"solverNodes":894,"singletonCages":6},{"sourceSeed":"w8-killer-Easy-4","solution":[3,2,8,6,9,1,7,4,5,9,1,6,4,7,5,3,8,2,7,5,4,8,3,2,9,6,1,8,3,5,2,6,9,4,1,7,6,9,2,1,4,7,8,5,3,4,7,1,5,8,3,6,2,9,1,4,9,7,5,8,2,3,6,5,8,7,3,2,6,1,9,4,2,6,3,9,1,4,5,7,8],"cages":[{"cells":[0,1],"sum":5},{"cells":[9],"sum":9},{"cells":[2,11],"sum":14},{"cells":[19,20],"sum":9},{"cells":[10],"sum":1},{"cells":[18,27],"sum":15},{"cells":[3,4],"sum":15},{"cells":[5,6,7],"sum":12},{"cells":[8,17,26],"sum":8},{"cells":[12,13,21],"sum":19},{"cells":[14,15],"sum":8},{"cells":[16,25],"sum":14},{"cells":[22,31],"sum":9},{"cells":[40],"sum":4},{"cells":[23,32,41],"sum":18},{"cells":[24,33],"sum":13},{"cells":[28,29],"sum":8},{"cells":[30,39],"sum":3},{"cells":[48],"sum":5},{"cells":[34,42,43],"sum":14},{"cells":[35,44],"sum":10},{"cells":[36,37],"sum":15},{"cells":[38,47],"sum":3},{"cells":[45,46],"sum":11},{"cells":[54],"sum":1},{"cells":[49,57,58],"sum":20},{"cells":[50,59],"sum":11},{"cells":[51,60,61],"sum":11},{"cells":[52,53],"sum":11},{"cells":[62,71],"sum":10},{"cells":[78,79,80],"sum":20},{"cells":[68,69,70],"sum":16},{"cells":[75,76],"sum":10},{"cells":[77],"sum":4},{"cells":[66,67],"sum":5},{"cells":[55,56,65],"sum":20},{"cells":[73,74],"sum":9},{"cells":[63,64,72],"sum":15}],"difficultyScore":61.79,"solverNodes":561,"singletonCages":6},{"sourceSeed":"w8-killer-Easy-7","solution":[7,6,1,9,2,3,4,8,5,2,9,3,4,5,8,6,1,7,5,4,8,6,7,1,9,3,2,6,8,5,1,9,7,3,2,4,9,1,7,3,4,2,8,5,6,4,3,2,8,6,5,1,7,9,8,2,4,5,1,6,7,9,3,1,5,6,7,3,9,2,4,8,3,7,9,2,8,4,5,6,1],"cages":[{"cells":[0,1],"sum":13},{"cells":[2,11],"sum":4},{"cells":[3,4],"sum":11},{"cells":[6,7],"sum":12},{"cells":[5],"sum":3},{"cells":[8,17],"sum":12},{"cells":[9,10],"sum":11},{"cells":[12,13,21],"sum":15},{"cells":[14,15],"sum":14},{"cells":[16,25,26],"sum":6},{"cells":[18,27,36],"sum":20},{"cells":[19,20,29],"sum":17},{"cells":[28,37],"sum":9},{"cells":[22,23],"sum":8},{"cells":[31],"sum":9},{"cells":[24,33],"sum":12},{"cells":[42],"sum":8},{"cells":[30,39],"sum":4},{"cells":[32,41],"sum":9},{"cells":[38,47],"sum":9},{"cells":[46],"sum":3},{"cells":[40,49],"sum":10},{"cells":[45,54],"sum":12},{"cells":[48,57],"sum":13},{"cells":[56],"sum":4},{"cells":[55,64],"sum":7},{"cells":[63],"sum":1},{"cells":[72,73],"sum":10},{"cells":[34,35],"sum":6},{"cells":[43,44],"sum":11},{"cells":[50,51],"sum":6},{"cells":[52,53],"sum":16},{"cells":[58,67],"sum":4},{"cells":[59,60,68],"sum":22},{"cells":[61,62],"sum":12},{"cells":[65,66],"sum":13},{"cells":[74,75],"sum":11},{"cells":[76,77],"sum":12},{"cells":[69,70],"sum":6},{"cells":[71,80],"sum":9},{"cells":[78,79],"sum":11}],"difficultyScore":55.08,"solverNodes":237,"singletonCages":6}],"Medium":[{"sourceSeed":"w8-killer-Medium-2","solution":[2,8,7,6,5,3,4,1,9,1,4,9,8,2,7,6,5,3,5,6,3,4,1,9,8,2,7,4,7,2,3,8,5,9,6,1,6,9,1,7,4,2,3,8,5,8,3,5,9,6,1,7,4,2,7,5,8,1,3,6,2,9,4,3,1,6,2,9,4,5,7,8,9,2,4,5,7,8,1,3,6],"cages":[{"cells":[0,1,9],"sum":11},{"cells":[2,3,12],"sum":21},{"cells":[13],"sum":2},{"cells":[4,5,6,14],"sum":19},{"cells":[15,16,25],"sum":13},{"cells":[7],"sum":1},{"cells":[8,17],"sum":12},{"cells":[26,33,34,35],"sum":23},{"cells":[22,23],"sum":10},{"cells":[24],"sum":8},{"cells":[10,11],"sum":13},{"cells":[18,19,20,27],"sum":18},{"cells":[21,29,30,38],"sum":10},{"cells":[28,36,37],"sum":22},{"cells":[31,39,40],"sum":19},{"cells":[32,41,42],"sum":10},{"cells":[43,52],"sum":12},{"cells":[44,53],"sum":7},{"cells":[45,54],"sum":15},{"cells":[46,55,56],"sum":16},{"cells":[47,48,49,50],"sum":21},{"cells":[51,60],"sum":9},{"cells":[61],"sum":9},{"cells":[62],"sum":4},{"cells":[57,58,66],"sum":6},{"cells":[59,67,68,69],"sum":24},{"cells":[63,72],"sum":12},{"cells":[64,65],"sum":7},{"cells":[73,74,75],"sum":11},{"cells":[76,77],"sum":15},{"cells":[78,79],"sum":4},{"cells":[70,71],"sum":15},{"cells":[80],"sum":6}],"difficultyScore":65.48,"solverNodes":991,"singletonCages":6},{"sourceSeed":"w8-killer-Medium-6","solution":[5,3,9,1,6,4,7,8,2,8,2,7,9,3,5,1,4,6,4,6,1,7,2,8,9,5,3,7,5,3,6,4,9,2,1,8,1,8,2,3,5,7,6,9,4,9,4,6,2,8,1,3,7,5,6,1,8,5,7,2,4,3,9,2,7,5,4,9,3,8,6,1,3,9,4,8,1,6,5,2,7],"cages":[{"cells":[0,9,18,27],"sum":24},{"cells":[1,10],"sum":5},{"cells":[11],"sum":7},{"cells":[2,3,4],"sum":16},{"cells":[6,7,15],"sum":16},{"cells":[5],"sum":4},{"cells":[8,17],"sum":8},{"cells":[16],"sum":4},{"cells":[12,21],"sum":16},{"cells":[13,14],"sum":8},{"cells":[19,28,37],"sum":19},{"cells":[20],"sum":1},{"cells":[36,45,54,63],"sum":18},{"cells":[72,73],"sum":12},{"cells":[22,31],"sum":6},{"cells":[23,32,33],"sum":19},{"cells":[24,25],"sum":14},{"cells":[26,34,35],"sum":12},{"cells":[29,30],"sum":9},{"cells":[38,39],"sum":5},{"cells":[47],"sum":6},{"cells":[46,55],"sum":5},{"cells":[64,65,74],"sum":16},{"cells":[56,57],"sum":13},{"cells":[48,49],"sum":10},{"cells":[40,41,42,43],"sum":27},{"cells":[44,52,53],"sum":16},{"cells":[50,59],"sum":3},{"cells":[51,60,69,70],"sum":21},{"cells":[58,67,68],"sum":19},{"cells":[76],"sum":1},{"cells":[61,62],"sum":12},{"cells":[66,75],"sum":12},{"cells":[71,80],"sum":8},{"cells":[77,78,79],"sum":13}],"difficultyScore":63.3,"solverNodes":728,"singletonCages":6},{"sourceSeed":"w8-killer-Medium-7","solution":[8,3,2,4,1,7,5,6,9,1,4,7,6,5,9,8,3,2,5,6,9,3,8,2,1,4,7,4,7,8,9,6,1,3,2,5,3,2,5,7,4,8,6,9,1,6,9,1,2,3,5,4,7,8,2,5,6,8,7,3,9,1,4,7,8,3,1,9,4,2,5,6,9,1,4,5,2,6,7,8,3],"cages":[{"cells":[0,9],"sum":9},{"cells":[1,10,11],"sum":14},{"cells":[2,3,4],"sum":7},{"cells":[13],"sum":5},{"cells":[12,21,22,23],"sum":19},{"cells":[5,6,7],"sum":18},{"cells":[16,17],"sum":5},{"cells":[8],"sum":9},{"cells":[14,15],"sum":17},{"cells":[27,28],"sum":11},{"cells":[18],"sum":5},{"cells":[19,20,29,38],"sum":28},{"cells":[33,42],"sum":9},{"cells":[24],"sum":1},{"cells":[26,35],"sum":12},{"cells":[25],"sum":4},{"cells":[34,43,52],"sum":18},{"cells":[44,53,62],"sum":13},{"cells":[30,39],"sum":16},{"cells":[31,40],"sum":10},{"cells":[32,41,50,51],"sum":18},{"cells":[36,37,45,46],"sum":20},{"cells":[47,48,56,65],"sum":12},{"cells":[49,57,58],"sum":18},{"cells":[54,55,63,64],"sum":22},{"cells":[72,73,74],"sum":14},{"cells":[59,60,61],"sum":13},{"cells":[69],"sum":2},{"cells":[66,67,75,76],"sum":17},{"cells":[68,77,78,79],"sum":25},{"cells":[70,71,80],"sum":14}],"difficultyScore":74.83,"solverNodes":3082,"singletonCages":6},{"sourceSeed":"w8-killer-Medium-9","solution":[2,7,4,9,5,8,3,1,6,9,5,8,6,3,1,7,4,2,6,3,1,2,7,4,5,8,9,3,8,6,7,1,2,4,9,5,5,4,9,3,8,6,1,2,7,7,1,2,5,4,9,8,6,3,8,9,3,1,6,7,2,5,4,1,6,7,4,2,5,9,3,8,4,2,5,8,9,3,6,7,1],"cages":[{"cells":[9,18],"sum":15},{"cells":[0],"sum":2},{"cells":[1],"sum":7},{"cells":[2,10,11],"sum":17},{"cells":[12,13],"sum":9},{"cells":[3],"sum":9},{"cells":[4,5],"sum":13},{"cells":[6,7,16],"sum":8},{"cells":[15],"sum":7},{"cells":[8,17,26],"sum":17},{"cells":[14,22,23],"sum":12},{"cells":[19,20,28,29],"sum":18},{"cells":[21,30],"sum":9},{"cells":[27,36,37,46],"sum":13},{"cells":[45,54,63,64],"sum":22},{"cells":[55,56],"sum":12},{"cells":[72,73,74],"sum":11},{"cells":[66,67,75],"sum":14},{"cells":[65],"sum":7},{"cells":[76,77],"sum":12},{"cells":[24,25,33,42],"sum":18},{"cells":[31,40],"sum":9},{"cells":[32,41],"sum":8},{"cells":[34,35,43],"sum":16},{"cells":[44,52,53],"sum":16},{"cells":[38,39],"sum":12},{"cells":[47,48,49],"sum":11},{"cells":[50,57,58,59],"sum":23},{"cells":[51,60],"sum":10},{"cells":[68,69,70],"sum":17},{"cells":[62,71],"sum":12},{"cells":[61],"sum":5},{"cells":[78,79,80],"sum":14}],"difficultyScore":70.12,"solverNodes":1692,"singletonCages":6}],"Hard":[{"sourceSeed":"w8-killer-Hard-2","solution":[9,8,1,3,2,4,5,7,6,5,7,6,8,1,9,4,3,2,4,3,2,7,6,5,9,8,1,8,1,4,2,5,3,7,6,9,3,2,5,6,9,7,8,1,4,7,6,9,1,4,8,3,2,5,2,5,7,9,8,6,1,4,3,6,9,8,4,3,1,2,5,7,1,4,3,5,7,2,6,9,8],"cages":[{"cells":[0,1,2],"sum":18},{"cells":[3,4,12],"sum":13},{"cells":[5,6],"sum":9},{"cells":[7,8,16,17],"sum":18},{"cells":[9,18,19,20],"sum":14},{"cells":[10,11],"sum":13},{"cells":[13,21,22,31],"sum":19},{"cells":[14,15],"sum":13},{"cells":[23],"sum":5},{"cells":[25,26,34],"sum":15},{"cells":[24],"sum":9},{"cells":[35,44],"sum":13},{"cells":[27,36,37],"sum":13},{"cells":[28,29],"sum":5},{"cells":[30,38,39,47],"sum":22},{"cells":[32,33],"sum":10},{"cells":[40,49,58],"sum":21},{"cells":[41],"sum":7},{"cells":[48,56,57,65],"sum":25},{"cells":[42,43,51],"sum":12},{"cells":[50,59],"sum":14},{"cells":[68],"sum":1},{"cells":[45,46,54],"sum":15},{"cells":[55,63,64],"sum":20},{"cells":[72,73],"sum":5},{"cells":[74,75],"sum":8},{"cells":[66],"sum":4},{"cells":[67,76],"sum":10},{"cells":[77,78],"sum":8},{"cells":[52,61],"sum":6},{"cells":[53,62],"sum":8},{"cells":[60,69,70],"sum":8},{"cells":[79,80],"sum":17},{"cells":[71],"sum":7}],"difficultyScore":67.78,"solverNodes":1255,"singletonCages":6},{"sourceSeed":"w8-killer-Hard-3","solution":[7,2,3,5,8,9,1,6,4,4,6,1,3,7,2,5,9,8,8,9,5,1,4,6,3,2,7,6,3,4,7,2,5,8,1,9,2,5,7,8,9,1,4,3,6,9,1,8,4,6,3,7,5,2,5,8,2,9,1,4,6,7,3,3,7,6,2,5,8,9,4,1,1,4,9,6,3,7,2,8,5],"cages":[{"cells":[0,9],"sum":11},{"cells":[1,10],"sum":8},{"cells":[2,3,4,11],"sum":17},{"cells":[5,14],"sum":11},{"cells":[6,7],"sum":7},{"cells":[8,17],"sum":12},{"cells":[12,13,21],"sum":11},{"cells":[22],"sum":4},{"cells":[15,24],"sum":8},{"cells":[16,25,26],"sum":18},{"cells":[23,32,33],"sum":19},{"cells":[18,19],"sum":17},{"cells":[20,29],"sum":9},{"cells":[27,36],"sum":8},{"cells":[45],"sum":9},{"cells":[37,38],"sum":12},{"cells":[47],"sum":8},{"cells":[28],"sum":3},{"cells":[46,55,64],"sum":16},{"cells":[54,63,72],"sum":9},{"cells":[73,74],"sum":13},{"cells":[30,39],"sum":15},{"cells":[31,40,41,42],"sum":16},{"cells":[34,35],"sum":10},{"cells":[43,51,52],"sum":15},{"cells":[44,53,62],"sum":11},{"cells":[48,49,57],"sum":19},{"cells":[58],"sum":1},{"cells":[50,59],"sum":7},{"cells":[56,65],"sum":8},{"cells":[69,78,79],"sum":19},{"cells":[60],"sum":6},{"cells":[61,70,71,80],"sum":17},{"cells":[66,67,68,75],"sum":21},{"cells":[76,77],"sum":10}],"difficultyScore":75.55,"solverNodes":2986,"singletonCages":6},{"sourceSeed":"w8-killer-Hard-4","solution":[6,8,5,2,9,3,1,7,4,3,2,9,4,7,1,6,5,8,1,4,7,8,5,6,3,9,2,8,7,1,5,6,2,4,3,9,2,5,6,9,3,4,8,1,7,4,9,3,7,1,8,2,6,5,7,3,4,1,8,5,9,2,6,9,6,2,3,4,7,5,8,1,5,1,8,6,2,9,7,4,3],"cages":[{"cells":[0,1,2],"sum":19},{"cells":[3,12],"sum":6},{"cells":[4,13,14],"sum":17},{"cells":[5,6],"sum":4},{"cells":[7],"sum":7},{"cells":[8,16,17],"sum":17},{"cells":[15,24],"sum":9},{"cells":[25],"sum":9},{"cells":[26,35],"sum":11},{"cells":[9,10,11,19],"sum":18},{"cells":[18,27,28,36],"sum":18},{"cells":[20,21,22],"sum":20},{"cells":[29],"sum":1},{"cells":[41,42],"sum":12},{"cells":[23,32],"sum":8},{"cells":[33,34,43,44],"sum":15},{"cells":[30,31,40],"sum":14},{"cells":[37,38,46],"sum":20},{"cells":[39,48,57,58],"sum":25},{"cells":[45,54,63],"sum":20},{"cells":[47,56],"sum":7},{"cells":[49,50,51,60],"sum":20},{"cells":[55,64,65],"sum":11},{"cells":[67,68,76],"sum":13},{"cells":[59],"sum":5},{"cells":[66,75],"sum":9},{"cells":[74],"sum":8},{"cells":[72,73],"sum":6},{"cells":[77,78,79],"sum":20},{"cells":[52,61,70],"sum":16},{"cells":[69],"sum":5},{"cells":[53,62],"sum":11},{"cells":[71,80],"sum":4}],"difficultyScore":78.43,"solverNodes":4406,"singletonCages":6},{"sourceSeed":"w8-killer-Hard-5","solution":[3,2,5,1,4,9,7,6,8,6,8,7,5,3,2,1,4,9,4,9,1,7,6,8,5,3,2,7,6,2,9,5,3,8,1,4,5,3,9,8,1,4,2,7,6,1,4,8,2,7,6,9,5,3,8,1,6,3,2,7,4,9,5,9,5,4,6,8,1,3,2,7,2,7,3,4,9,5,6,8,1],"cages":[{"cells":[0,1,2,11],"sum":17},{"cells":[3,4],"sum":5},{"cells":[5,13,14,15],"sum":15},{"cells":[6,7],"sum":13},{"cells":[8,17,26],"sum":19},{"cells":[12,20,21,22],"sum":19},{"cells":[16,25],"sum":7},{"cells":[9,10,18,27],"sum":25},{"cells":[19,28],"sum":15},{"cells":[23,24,32,41],"sum":20},{"cells":[29,37,38,39],"sum":22},{"cells":[31,40,49],"sum":13},{"cells":[30],"sum":9},{"cells":[36,45,54],"sum":14},{"cells":[63],"sum":9},{"cells":[73,74],"sum":10},{"cells":[72],"sum":2},{"cells":[33,34,35,44],"sum":19},{"cells":[42,43],"sum":9},{"cells":[46,47],"sum":12},{"cells":[56,57],"sum":9},{"cells":[48],"sum":2},{"cells":[64,65],"sum":9},{"cells":[55],"sum":1},{"cells":[50,51],"sum":15},{"cells":[52,53,61],"sum":17},{"cells":[62,70,71],"sum":14},{"cells":[77,78,79,80],"sum":20},{"cells":[58,59,68],"sum":10},{"cells":[60,69],"sum":7},{"cells":[67,75,76],"sum":21},{"cells":[66],"sum":6}],"difficultyScore":82.01,"solverNodes":6849,"singletonCages":6}]};
  function w8KillerTransform(base,seed){
    // Killer cage geometry is meaningful: every cage must stay orthogonally
    // connected. Arbitrary Sudoku row/band and column/stack permutations do
    // not preserve cell adjacency, so use only square-grid dihedral symmetries.
    const r=rng(`${seed}:killer:v8:transform`),sym=Math.floor(r()*8),complement=r()<.5;
    const mapIndex=i=>{const row=Math.floor(i/9),col=i%9;let nr=row,nc=col;switch(sym){
      case 1:nr=col;nc=8-row;break;
      case 2:nr=8-row;nc=8-col;break;
      case 3:nr=8-col;nc=row;break;
      case 4:nr=row;nc=8-col;break;
      case 5:nr=8-row;nc=col;break;
      case 6:nr=col;nc=row;break;
      case 7:nr=8-col;nc=8-row;break;
    }return nr*9+nc;};
    const solution=Array(81);for(let i=0;i<81;i++)solution[mapIndex(i)]=complement?10-base.solution[i]:base.solution[i];
    const cages=base.cages.map(g=>({cells:g.cells.map(mapIndex).sort((a,b)=>a-b),sum:complement?g.cells.length*10-g.sum:g.sum})).sort((a,b)=>a.cells[0]-b.cells[0]);
    const cageOf=Array(81);cages.forEach((g,gi)=>g.cells.forEach(i=>cageOf[i]=gi));
    return {solution,givens:Array(81).fill(0),cages,cageOf,certifiedUnique:true,contentCertified:true,generatorVersion:W8_KILLER_VERSION,difficultyScore:base.difficultyScore,solverNodes:base.solverNodes,singletonCages:base.singletonCages,sourceSeed:base.sourceSeed,sourceBankSize:W8_KILLER_BANK.Easy.length+W8_KILLER_BANK.Medium.length+W8_KILLER_BANK.Hard.length};
  }
  killerSudoku.generatorVersion=W8_KILLER_VERSION;
  killerSudoku.create=async function(seed,difficulty='Medium'){const pool=W8_KILLER_BANK[difficulty]||W8_KILLER_BANK.Medium,r=rng(`${seed}:killer:v8:source`),base=pick(pool,r),puzzle=w8KillerTransform(base,seed);return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle,state:{board:Array(81).fill(0),selected:0,history:[],mistakes:0}};};

  function w5KillerCombos(cage,board){const used=cage.cells.map(i=>board[i]).filter(Boolean),left=cage.cells.filter(i=>!board[i]).length,target=cage.sum-used.reduce((a,b)=>a+b,0),avail=[1,2,3,4,5,6,7,8,9].filter(x=>!used.includes(x)),out=[];function rec(pos,k,sum,arr){if(k===0){if(sum===target)out.push(arr);return;}for(let j=pos;j<avail.length;j++){if(sum+avail[j]>target)break;rec(j+1,k-1,sum+avail[j],[...arr,avail[j]]);}}rec(0,left,0,[]);return out;}
  const w5KillerRender=killerSudoku.render.bind(killerSudoku);killerSudoku.render=function(a){w5KillerRender(a);const cage=a.puzzle.cages[a.puzzle.cageOf[a.state.selected]],combos=w5KillerCombos(cage,a.state.board).slice(0,12),target=$('.number-pad')?.parentElement;if(target){const box=document.createElement('div');box.className='killer-combos';box.innerHTML=`<strong>Cage ${cage.sum}</strong><span>${combos.length?combos.map(x=>x.join('·')).join(' · '):'No remaining combinations'}</span>`;target.insertBefore(box,target.firstChild);}};

  // ----- Mines v5: guaranteed no-guess Logical boards + chording -----
  mines.generatorVersion=W5_VERSION;mines.rules.items=['Numbers show how many mines touch that cell, including diagonally.','Every generated board is certified solvable by the built-in logical deduction engine from the first click.','Tap a revealed numbered cell again to chord when its adjacent flags match the number.','Right-click, long-press, or F to flag a suspected mine.'];
  mines.create=async function(seed,difficulty='Easy'){const [rows,cols,count]=this.configs[difficulty];return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle:{rows,cols,count,mines:null,nums:null,generatorVersion:W5_VERSION,logicalCertified:false},state:{revealed:Array(rows*cols).fill(false),flags:Array(rows*cols).fill(false),selected:0,status:'playing'}};};
  mines.build=function(a,first){const {rows,cols,count}=a.puzzle,rr=Math.floor(first/cols),cc=first%cols,banned=new Set();for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){const r=rr+dr,c=cc+dc;if(r>=0&&c>=0&&r<rows&&c<cols)banned.add(r*cols+c);}const rg=rng(`${a.seed}:${first}:mines:v5`),solved=[];const max=a.difficulty==='Hard'?320:a.difficulty==='Medium'?120:70;for(let attempt=0;attempt<max;attempt++){const layout=makeMineLayout(rows,cols,count,banned,rg),analysis=analyzeMineLayout(layout,rows,cols,first,count);if(analysis.solved)solved.push({layout,analysis});if(solved.length>=18)break;}if(!solved.length)throw new Error('No-guess Mines generation failed');solved.sort((x,y)=>x.analysis.score-y.analysis.score);const q=a.difficulty==='Easy'?0:a.difficulty==='Hard'?1:.55,chosen=solved[Math.round((solved.length-1)*q)];Object.assign(a.puzzle,{mines:chosen.layout.mines,nums:chosen.layout.nums,difficultyScore:+chosen.analysis.score.toFixed(2),difficultyMetrics:{logicalSolved:true,maxTechnique:chosen.analysis.maxTechnique,subsetUses:chosen.analysis.subsetUses,rounds:chosen.analysis.rounds,candidatesTested:solved.length},logicalCertified:true,generatorVersion:W5_VERSION});};
  mines.chord=async function(a,i){if(!a.state.revealed[i]||!a.puzzle.nums[i])return false;const ns=this.neighbors(i,a.puzzle.rows,a.puzzle.cols),flags=ns.filter(j=>a.state.flags[j]).length;if(flags!==a.puzzle.nums[i]){toast(`Chord needs ${a.puzzle.nums[i]} adjacent flag${a.puzzle.nums[i]===1?'':'s'}; ${flags} set.`);return true;}for(const j of ns)if(!a.state.flags[j]&&!a.state.revealed[j]){if(a.puzzle.mines[j]){await this.reveal(a,j);return true;}const stack=[j];while(stack.length){const x=stack.pop();if(a.state.revealed[x]||a.state.flags[x])continue;a.state.revealed[x]=true;if(a.puzzle.nums[x]===0)this.neighbors(x,a.puzzle.rows,a.puzzle.cols).forEach(n=>{if(!a.puzzle.mines[n]&&!a.state.revealed[n])stack.push(n)});}}const safe=a.puzzle.rows*a.puzzle.cols-a.puzzle.count;if(a.state.revealed.filter(Boolean).length===safe)await finishActive(a,{mines:a.puzzle.count,logical:true});else await saveActive(a);this.render(a);return true;};
  const w5MineReveal=mines.reveal.bind(mines);mines.reveal=async function(a,i){if(a.state.revealed[i]){await this.chord(a,i);return;}return w5MineReveal(a,i);};
  mines.hint=function(a){if(!a.puzzle.mines){toast('Reveal any cell first — that 3×3 opening zone is guaranteed safe.');return;}const {rows,cols}=a.puzzle;for(let i=0;i<a.state.revealed.length;i++)if(a.state.revealed[i]&&a.puzzle.nums[i]>=0){const ns=mineNeighborsRaw(i,rows,cols),unknown=ns.filter(j=>!a.state.revealed[j]&&!a.state.flags[j]),flags=ns.filter(j=>a.state.flags[j]).length,need=a.puzzle.nums[i]-flags;if(unknown.length&&need===0){const j=unknown[0];deliverProofHint(a,{token:`mine-safe-${i}-${j}`,index:j,focus:`Inspect the ${a.puzzle.nums[i]} at row ${Math.floor(i/cols)+1}, column ${i%cols+1}.`,rule:'Once all mines around a clue are flagged, every other covered neighbor is safe.',deduction:`Its ${a.puzzle.nums[i]} required mine${a.puzzle.nums[i]===1?'':'s'} are already flagged.`,reveal:`Reveal row ${Math.floor(j/cols)+1}, column ${j%cols+1}.`});return;}if(unknown.length&&need===unknown.length){const j=unknown[0];deliverProofHint(a,{token:`mine-flag-${i}-${j}`,index:j,focus:`Inspect the ${a.puzzle.nums[i]} at row ${Math.floor(i/cols)+1}, column ${i%cols+1}.`,rule:'If every remaining covered neighbor is needed to reach the clue, all of them are mines.',deduction:`${need} mines remain and exactly ${unknown.length} covered neighbors remain.`,reveal:`Flag row ${Math.floor(j/cols)+1}, column ${j%cols+1}.`});return;}}deliverProofHint(a,{token:'mine-subset',focus:'Compare overlapping numbered frontiers.',rule:'When one clue’s unknown-neighbor set is contained in another, subtract the two mine counts.',deduction:'The difference can reveal an entirely safe or entirely mined subset without guessing.',reveal:'Look for two adjacent clues sharing most of the same covered cells.'});};

  // ----- Nonogram v5: procedural image library + exact line-domain solver -----
  const w5NonoDomainCache=new Map();
  function w5NonoLineMasks(n,clues){const key=n+':'+clues.join(',');if(w5NonoDomainCache.has(key))return w5NonoDomainCache.get(key);if(clues.length===1&&clues[0]===0)return [0];const out=[];function rec(ci,pos,mask){if(ci===clues.length){out.push(mask);return;}const len=clues[ci],remaining=clues.slice(ci+1).reduce((a,b)=>a+b,0)+(clues.length-ci-1);for(let s=pos;s+len+remaining<=n;s++){let m=mask;for(let k=0;k<len;k++)m|=1<<(s+k);rec(ci+1,s+len+1,m);}}rec(0,0,0);w5NonoDomainCache.set(key,out);return out;}
  function w5CountNonogram(p,state=null,limit=2){const n=p.size,cells=state?[...state]:Array(n*n).fill(0),rows=p.rowClues.map(c=>[...w5NonoLineMasks(n,c)]),cols=p.colClues.map(c=>[...w5NonoLineMasks(n,c)]);let count=0,solution=null;
    function filterDomains(){let changed=true;while(changed){changed=false;for(let r=0;r<n;r++){const old=rows[r],next=old.filter(m=>{for(let c=0;c<n;c++){const v=cells[r*n+c],bit=(m>>c)&1;if(v===1&&!bit||v===2&&bit)return false;}return true;});if(!next.length)return false;if(next.length!==old.length){rows[r]=next;changed=true;}for(let c=0;c<n;c++)if(!cells[r*n+c]){const all1=next.every(m=>(m>>c)&1),all0=next.every(m=>!((m>>c)&1));if(all1){cells[r*n+c]=1;changed=true;}else if(all0){cells[r*n+c]=2;changed=true;}}}for(let c=0;c<n;c++){const old=cols[c],next=old.filter(m=>{for(let r=0;r<n;r++){const v=cells[r*n+c],bit=(m>>r)&1;if(v===1&&!bit||v===2&&bit)return false;}return true;});if(!next.length)return false;if(next.length!==old.length){cols[c]=next;changed=true;}for(let r=0;r<n;r++)if(!cells[r*n+c]){const all1=next.every(m=>(m>>r)&1),all0=next.every(m=>!((m>>r)&1));if(all1){cells[r*n+c]=1;changed=true;}else if(all0){cells[r*n+c]=2;changed=true;}}}}return true;}
    function rec(){if(count>=limit)return;const snapCells=[...cells],snapRows=rows.map(x=>[...x]),snapCols=cols.map(x=>[...x]);if(!filterDomains()){cells.splice(0,cells.length,...snapCells);rows.splice(0,n,...snapRows);cols.splice(0,n,...snapCols);return;}const i=cells.findIndex(v=>!v);if(i<0){count++;if(!solution)solution=cells.map(v=>v===1);cells.splice(0,cells.length,...snapCells);rows.splice(0,n,...snapRows);cols.splice(0,n,...snapCols);return;}for(const v of [1,2]){cells[i]=v;rec();cells.splice(0,cells.length,...snapCells);rows.splice(0,n,...snapRows);cols.splice(0,n,...snapCols);if(count>=limit)return;}}rec();return {count,solution};}
  const W5_NONO_SHAPES=[
    ['Diamond',(x,y)=>Math.abs(x)+Math.abs(y)<.72],['Heart',(x,y)=>((x*x+y*y-.52)**3-x*x*y*y*y)<0],['Cross',(x,y)=>Math.abs(x)<.22||Math.abs(y)<.22],['Ring',(x,y)=>{const d=x*x+y*y;return d<.72&&d>.25;}],['Hourglass',(x,y)=>Math.abs(x)<.65*Math.abs(y)+.12],['Arrow',(x,y)=>y<-.05?Math.abs(x)<.18:Math.abs(x)<.75*(.85-y)],['Tree',(x,y)=>y>.55?Math.abs(x)<.16:y>-.45?Math.abs(x)<(.58-(y+.45)*.32):Math.abs(x)<.17],['Crown',(x,y)=>y>.35?Math.abs(x)<.7:y>.0?(Math.abs(x)<.7&&(Math.cos((x+1)*10)>-.3||y>.18)):Math.abs(x)<.7&&y>.55*Math.abs(x)-.55],['Cup',(x,y)=>y<.45&&y>-.55&&((Math.abs(x)>.42&&Math.abs(x)<.65)||y>.28)],['Fish',(x,y)=>((x+.18)**2/.38+y*y/.18<1)||(x>.35&&Math.abs(y)<.65*(x-.25))],
    ['House',(x,y)=>y>.05?Math.abs(x)<.56:Math.abs(x)<(.72*(y+.9))],
    ['Boat',(x,y)=>(y>.18&&y<.5&&Math.abs(x)<.72*(.72-y))||(Math.abs(x)<.08&&y<.2)||(y<-.05&&y>-.12&&x>.02&&x<.58)],
    ['Key',(x,y)=>((x+.38)**2+y*y<.16&&((x+.38)**2+y*y>.045))||(Math.abs(y)<.11&&x>-.28&&x<.68)||(x>.42&&y>.02&&y<.28)],
    ['Mushroom',(x,y)=>(y<.08&&((x*x/.62)+(y+.12)*(y+.12)/.22<1))||(y>=.02&&y<.72&&Math.abs(x)<.18)],
    ['Shield',(x,y)=>y<-.55?Math.abs(x)<.52:y<.35?Math.abs(x)<.62-(y+.55)*.18:Math.abs(x)<.38*(.82-y)],
    ['Leaf',(x,y)=>{const u=(x+y)/1.414,v=(x-y)/1.414;return u*u/.66+v*v/.12<1;}],
    ['X',(x,y)=>Math.abs(x-y)<.2||Math.abs(x+y)<.2],
    ['Smile',(x,y)=>{const ring=Math.abs(Math.sqrt(x*x+y*y)-.62)<.13,eyes=(y<-.12&&((x-.25)**2+(y+.2)**2<.035||(x+.25)**2+(y+.2)**2<.035)),mouth=y>.08&&y<.45&&Math.abs(y-(.5*x*x+.18))<.09;return ring||eyes||mouth;}]
  ];
  function w5NonoShape(seed,difficulty){const n={Easy:5,Medium:10,Hard:15}[difficulty],r=rng(`${seed}:nono5`);for(let attempt=0;attempt<120;attempt++){const [name,fn]=W5_NONO_SHAPES[(Math.floor(r()*W5_NONO_SHAPES.length)+attempt)%W5_NONO_SHAPES.length],variant=r(),solution=[];for(let rr=0;rr<n;rr++)for(let c=0;c<n;c++){let x=(c-(n-1)/2)/((n-1)/2||1),y=(rr-(n-1)/2)/((n-1)/2||1);if(variant>.5)x=-x;if(variant>.75)[x,y]=[y,x];solution.push(!!fn(x,y));}const rowClues=Array.from({length:n},(_,rr)=>nonogramClues(solution.slice(rr*n,rr*n+n))),colClues=Array.from({length:n},(_,c)=>nonogramClues(Array.from({length:n},(_,rr)=>solution[rr*n+c]))),p={name,size:n,solution,rowClues,colClues};const cert=w5CountNonogram(p,null,2);if(cert.count===1)return {...p,certifiedUnique:true,generatorVersion:W5_VERSION,difficultyScore:n+rowClues.reduce((s,x)=>s+x.length,0)*.2};}throw new Error('Nonogram generation failed uniqueness certification');}
  nonogramGame.generatorVersion=W5_VERSION;nonogramGame.create=async function(seed,difficulty='Medium'){const puzzle=w5NonoShape(seed,difficulty);return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle,state:{cells:Array(puzzle.size*puzzle.size).fill(0),tool:1,history:[]}};};
  nonogramGame.hint=function(a){const p=a.puzzle,b=a.state.cells;for(let i=0;i<b.length;i++)if(!b[i]){const f=[...b],e=[...b];f[i]=1;e[i]=2;const fc=w5CountNonogram(p,f,1).count,ec=w5CountNonogram(p,e,1).count;if(fc&&!ec){deliverProofHint(a,{token:`nono-fill-${i}`,index:i,focus:`Inspect row ${Math.floor(i/p.size)+1}, column ${i%p.size+1}.`,rule:'Every row and column must match its run clues simultaneously.',deduction:'Marking this cell empty leaves no completion, so it is forced filled.',reveal:'Fill this cell.'});return;}if(!fc&&ec){deliverProofHint(a,{token:`nono-x-${i}`,index:i,focus:`Inspect row ${Math.floor(i/p.size)+1}, column ${i%p.size+1}.`,rule:'Every row and column must match its run clues simultaneously.',deduction:'Filling this cell leaves no completion, so it is forced empty.',reveal:'Mark this cell ×.'});return;}}deliverProofHint(a,{token:'nono-general',focus:'Compare the most constrained row and column.',rule:'Each clue sequence fixes both run lengths and the minimum gaps between runs.',deduction:'Use overlap and completed-run boundaries before testing uncertain cells.',reveal:'No single cell is currently forced by the exact line-domain check.'});};

  // ----- Towers v5: procedural Latin squares + uniqueness-preserving clue removal -----
  function w5TowerCount(p,b,limit=2){const n=p.n,rowOpts=Array.from({length:n},(_,r)=>permutationsN(n).filter(q=>(!p.clues.left[r]||towerVisibility(q)===p.clues.left[r])&&(!p.clues.right[r]||towerVisibility([...q].reverse())===p.clues.right[r])&&q.every((v,c)=>!b[r*n+c]||b[r*n+c]===v)));let count=0;const colMask=Array(n).fill(0),topHigh=Array(n).fill(0),topVis=Array(n).fill(0),rows=[];function rec(r){if(count>=limit)return;if(r===n){for(let c=0;c<n;c++){const col=rows.map(x=>x[c]);if(p.clues.bottom[c]&&towerVisibility([...col].reverse())!==p.clues.bottom[c])return;if(p.clues.top[c]&&topVis[c]!==p.clues.top[c])return;}count++;return;}for(const row of rowOpts[r]){let ok=true;const oldHigh=[...topHigh],oldVis=[...topVis];for(let c=0;c<n;c++){const bit=1<<row[c];if(colMask[c]&bit){ok=false;break;}const nv=topVis[c]+(row[c]>topHigh[c]?1:0),nh=Math.max(topHigh[c],row[c]),cl=p.clues.top[c];if(cl&&(nv>cl||nv+(n-r-1)<cl)){ok=false;break;}topVis[c]=nv;topHigh[c]=nh;}if(ok){for(let c=0;c<n;c++)colMask[c]|=1<<row[c];rows.push(row);rec(r+1);rows.pop();for(let c=0;c<n;c++)colMask[c]&=~(1<<row[c]);}for(let c=0;c<n;c++){topHigh[c]=oldHigh[c];topVis[c]=oldVis[c];}if(count>=limit)return;}}rec(0);return count;}
  countTowerStateSolutions=w5TowerCount;
  function w5LatinGrid(n,r){const row=shuffle(Array.from({length:n},(_,i)=>i),r),col=shuffle(Array.from({length:n},(_,i)=>i),r),sym=shuffle(Array.from({length:n},(_,i)=>i+1),r);return row.flatMap(rr=>col.map(cc=>sym[(rr+cc)%n]));}
  function w5TransformSquare(arr,n,t){const out=Array(n*n);for(let r=0;r<n;r++)for(let c=0;c<n;c++){let rr=r,cc=c;if(t===1){rr=c;cc=n-1-r;}else if(t===2){rr=n-1-r;cc=n-1-c;}else if(t===3){rr=n-1-c;cc=r;}else if(t===4){rr=r;cc=n-1-c;}else if(t===5){rr=n-1-r;cc=c;}else if(t===6){rr=c;cc=r;}else if(t===7){rr=n-1-c;cc=n-1-r;}out[rr*n+cc]=arr[r*n+c];}return out;}
  function w5TowerClues(solution,n){const clues={top:[],bottom:[],left:[],right:[]};for(let c=0;c<n;c++){const col=Array.from({length:n},(_,rr)=>solution[rr*n+c]);clues.top[c]=towerVisibility(col);clues.bottom[c]=towerVisibility([...col].reverse());}for(let rr=0;rr<n;rr++){const row=solution.slice(rr*n,rr*n+n);clues.left[rr]=towerVisibility(row);clues.right[rr]=towerVisibility([...row].reverse());}return clues;}
  function w5TowerPuzzle(seed,difficulty){const n={Easy:4,Medium:5,Hard:5}[difficulty],r=rng(`${seed}:tower5`);let solution=null,clues=null;for(let attempt=0;attempt<32;attempt++){const rr=rng(`${seed}:tower5:latin:${attempt}`),candidate=w5LatinGrid(n,rr),cc=w5TowerClues(candidate,n),p={n,solution:candidate,clues:cc};if(countTowerStateSolutions(p,Array(n*n).fill(0),2)===1){solution=candidate;clues=cc;break;}}if(!solution){const bank=TOWERS_TEMPLATES[difficulty],base=pick(bank,r);solution=w5TransformSquare(base.solution,n,Math.floor(r()*8));clues=w5TowerClues(solution,n);}const full={n,solution,clues};if(countTowerStateSolutions(full,Array(n*n).fill(0),2)!==1)throw new Error('Generated Towers full-clue grid is not unique');const refs=[];for(const side of ['top','bottom','left','right'])for(let i=0;i<n;i++)refs.push([side,i]);const target={Easy:12,Medium:11,Hard:8}[difficulty];for(const [side,i] of shuffle(refs,r)){const active=Object.values(clues).flat().filter(Boolean).length;if(active<=target)break;const old=clues[side][i];clues[side][i]=0;if(countTowerStateSolutions({n,solution,clues},Array(n*n).fill(0),2)!==1)clues[side][i]=old;}const activeClues=Object.values(clues).flat().filter(Boolean).length,p={n,solution,clues,certifiedUnique:true,generatorVersion:W5_VERSION,difficultyScore:n*10+(4*n-activeClues),proceduralSource:'latin-generated'};if(countTowerStateSolutions(p,Array(n*n).fill(0),2)!==1)throw new Error('Towers clue removal lost uniqueness');return p;}
  towersGame.generatorVersion=W5_VERSION;towersGame.create=async function(seed,difficulty='Medium'){const puzzle=w5TowerPuzzle(seed,difficulty);return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle,state:{board:Array(puzzle.n*puzzle.n).fill(0),selected:0,history:[],mistakes:0}};};

  // ----- Wave 8: Towers certified runtime bank -----
  const W8_TOWER_VERSION=8;
  const W8_TOWER_BANK={"Easy":[{"sourceSeed":"w8-tower-bank-Easy-0","n":4,"solution":[4,2,1,3,1,3,2,4,3,1,4,2,2,4,3,1],"clues":{"top":[0,3,3,2],"bottom":[3,1,2,0],"left":[1,3,2,2],"right":[2,1,0,0]},"difficultyScore":44},{"sourceSeed":"w8-tower-bank-Easy-1","n":4,"solution":[4,2,3,1,3,1,2,4,1,3,4,2,2,4,1,3],"clues":{"top":[1,3,2,2],"bottom":[0,1,0,2],"left":[0,2,3,2],"right":[3,0,2,2]},"difficultyScore":44},{"sourceSeed":"w8-tower-bank-Easy-2","n":4,"solution":[4,1,2,3,3,4,1,2,2,3,4,1,1,2,3,4],"clues":{"top":[0,2,2,2],"bottom":[4,0,2,1],"left":[1,0,0,4],"right":[2,2,2,1]},"difficultyScore":44},{"sourceSeed":"w8-tower-bank-Easy-3","n":4,"solution":[1,4,3,2,3,2,1,4,2,1,4,3,4,3,2,1],"clues":{"top":[3,1,2,2],"bottom":[1,2,2,3],"left":[2,0,2,1],"right":[0,0,0,4]},"difficultyScore":44},{"sourceSeed":"w8-tower-bank-Easy-4","n":4,"solution":[4,3,1,2,2,1,4,3,3,4,2,1,1,2,3,4],"clues":{"top":[0,0,2,3],"bottom":[3,2,2,1],"left":[0,2,2,4],"right":[3,0,3,1]},"difficultyScore":44},{"sourceSeed":"w8-tower-bank-Easy-5","n":4,"solution":[4,2,3,1,1,3,2,4,2,1,4,3,3,4,1,2],"clues":{"top":[1,0,2,2],"bottom":[2,1,2,0],"left":[1,3,0,2],"right":[0,1,2,2]},"difficultyScore":44},{"sourceSeed":"w8-tower-bank-Easy-6","n":4,"solution":[1,2,4,3,2,4,3,1,3,1,2,4,4,3,1,2],"clues":{"top":[0,2,1,2],"bottom":[1,0,4,2],"left":[3,0,2,1],"right":[2,3,0,3]},"difficultyScore":44},{"sourceSeed":"w8-tower-bank-Easy-7","n":4,"solution":[3,4,2,1,4,3,1,2,1,2,3,4,2,1,4,3],"clues":{"top":[2,1,0,3],"bottom":[0,4,1,0],"left":[2,1,4,2],"right":[3,3,0,2]},"difficultyScore":44}],"Medium":[{"sourceSeed":"w8-tower-bank-Medium-0","n":5,"solution":[1,4,5,3,2,3,2,1,4,5,5,3,2,1,4,2,1,4,5,3,4,5,3,2,1],"clues":{"top":[0,2,1,3,0],"bottom":[2,0,0,2,0],"left":[3,0,1,0,2],"right":[3,0,2,0,4]},"difficultyScore":59},{"sourceSeed":"w8-tower-bank-Medium-1","n":5,"solution":[4,1,5,2,3,3,4,2,1,5,1,2,3,5,4,5,3,1,4,2,2,5,4,3,1],"clues":{"top":[2,3,1,2,2],"bottom":[2,0,0,0,4],"left":[0,3,0,0,2],"right":[2,0,0,0,4]},"difficultyScore":59},{"sourceSeed":"w8-tower-bank-Medium-2","n":5,"solution":[3,1,2,5,4,4,2,5,3,1,5,4,1,2,3,2,3,4,1,5,1,5,3,4,2],"clues":{"top":[0,4,0,1,2],"bottom":[3,0,0,2,2],"left":[0,0,1,4,0],"right":[2,3,3,0,0]},"difficultyScore":59},{"sourceSeed":"w8-tower-bank-Medium-3","n":5,"solution":[3,4,5,2,1,1,3,2,4,5,2,5,3,1,4,4,2,1,5,3,5,1,4,3,2],"clues":{"top":[3,0,1,3,0],"bottom":[0,0,0,2,4],"left":[0,0,2,2,0],"right":[3,0,2,2,4]},"difficultyScore":59},{"sourceSeed":"w8-tower-bank-Medium-4","n":5,"solution":[5,3,1,2,4,3,1,2,4,5,2,4,5,3,1,1,2,4,5,3,4,5,3,1,2],"clues":{"top":[1,0,3,3,0],"bottom":[0,0,0,2,3],"left":[0,3,3,4,0],"right":[0,1,3,0,3]},"difficultyScore":59},{"sourceSeed":"w8-tower-bank-Medium-5","n":5,"solution":[1,2,4,5,3,3,4,5,1,2,5,3,2,4,1,4,1,3,2,5,2,5,1,3,4],"clues":{"top":[0,3,2,1,2],"bottom":[3,0,0,0,2],"left":[4,0,1,0,0],"right":[0,2,3,0,2]},"difficultyScore":59},{"sourceSeed":"w8-tower-bank-Medium-6","n":5,"solution":[1,2,3,4,5,3,1,4,5,2,4,3,5,2,1,2,5,1,3,4,5,4,2,1,3],"clues":{"top":[0,0,0,2,0],"bottom":[0,2,2,3,3],"left":[5,3,0,2,0],"right":[1,0,3,0,3]},"difficultyScore":59},{"sourceSeed":"w8-tower-bank-Medium-7","n":5,"solution":[4,5,1,2,3,1,2,3,4,5,3,4,5,1,2,5,1,2,3,4,2,3,4,5,1],"clues":{"top":[0,0,3,0,2],"bottom":[0,3,2,1,0],"left":[2,5,3,1,4],"right":[0,0,0,0,2]},"difficultyScore":59}],"Hard":[{"sourceSeed":"w8-tower-bank-Hard-0","n":5,"solution":[2,4,1,3,5,5,1,3,2,4,1,2,5,4,3,3,5,4,1,2,4,3,2,5,1],"clues":{"top":[0,0,0,3,0],"bottom":[2,0,3,0,5],"left":[0,1,3,0,0],"right":[0,2,0,3,0]},"difficultyScore":62},{"sourceSeed":"w8-tower-bank-Hard-1","n":5,"solution":[3,2,4,1,5,1,4,5,2,3,4,3,1,5,2,2,5,3,4,1,5,1,2,3,4],"clues":{"top":[0,0,0,3,0],"bottom":[1,0,3,0,2],"left":[3,3,0,0,0],"right":[0,2,2,0,0]},"difficultyScore":62},{"sourceSeed":"w8-tower-bank-Hard-2","n":5,"solution":[2,5,3,1,4,3,1,5,4,2,5,4,1,2,3,1,2,4,3,5,4,3,2,5,1],"clues":{"top":[3,0,0,3,2],"bottom":[0,3,3,0,2],"left":[0,0,1,4,0],"right":[0,0,0,0,0]},"difficultyScore":62},{"sourceSeed":"w8-tower-bank-Hard-3","n":5,"solution":[2,3,4,5,1,1,4,5,2,3,5,1,3,4,2,3,5,2,1,4,4,2,1,3,5],"clues":{"top":[2,0,0,0,4],"bottom":[2,2,4,0,0],"left":[4,0,0,2,0],"right":[0,0,0,2,0]},"difficultyScore":62},{"sourceSeed":"w8-tower-bank-Hard-4","n":5,"solution":[5,4,3,2,1,1,2,5,3,4,4,3,1,5,2,2,5,4,1,3,3,1,2,4,5],"clues":{"top":[0,0,0,3,3],"bottom":[0,2,3,0,1],"left":[1,0,0,0,3],"right":[5,0,0,0,0]},"difficultyScore":62},{"sourceSeed":"w8-tower-bank-Hard-5","n":5,"solution":[2,3,5,1,4,5,4,1,3,2,1,2,3,4,5,4,1,2,5,3,3,5,4,2,1],"clues":{"top":[0,0,0,0,2],"bottom":[0,0,2,2,0],"left":[3,0,5,2,0],"right":[0,4,1,0,0]},"difficultyScore":62},{"sourceSeed":"w8-tower-bank-Hard-6","n":5,"solution":[3,2,1,5,4,5,4,3,2,1,4,3,2,1,5,2,1,5,4,3,1,5,4,3,2],"clues":{"top":[0,0,3,0,2],"bottom":[4,0,0,0,3],"left":[2,0,0,0,0],"right":[0,0,1,3,4]},"difficultyScore":62},{"sourceSeed":"w8-tower-bank-Hard-7","n":5,"solution":[4,3,5,1,2,3,1,2,5,4,2,4,1,3,5,5,2,3,4,1,1,5,4,2,3],"clues":{"top":[0,0,1,0,3],"bottom":[0,0,0,3,0],"left":[2,2,0,0,2],"right":[2,0,1,0,3]},"difficultyScore":61}]};
  function w8TowerMapIndex(i,n,t){const r=Math.floor(i/n),c=i%n;let rr=r,cc=c;if(t===1){rr=c;cc=n-1-r;}else if(t===2){rr=n-1-r;cc=n-1-c;}else if(t===3){rr=n-1-c;cc=r;}else if(t===4){rr=r;cc=n-1-c;}else if(t===5){rr=n-1-r;cc=c;}else if(t===6){rr=c;cc=r;}else if(t===7){rr=n-1-c;cc=n-1-r;}return rr*n+cc;}
  function w8TowerTransform(base,seed){const n=base.n,r=rng(`${seed}:tower:v8`),t=Math.floor(r()*8),solution=w5TransformSquare(base.solution,n,t),clues={top:Array(n).fill(0),bottom:Array(n).fill(0),left:Array(n).fill(0),right:Array(n).fill(0)};const seq=(side,k)=>side==='top'?Array.from({length:n},(_,x)=>x*n+k):side==='bottom'?Array.from({length:n},(_,x)=>(n-1-x)*n+k):side==='left'?Array.from({length:n},(_,x)=>k*n+x):Array.from({length:n},(_,x)=>k*n+n-1-x);for(const side of ['top','bottom','left','right'])for(let k=0;k<n;k++){const val=base.clues[side][k];if(!val)continue;const z=seq(side,k).map(i=>w8TowerMapIndex(i,n,t)),a=z[0],b=z[1],ar=Math.floor(a/n),ac=a%n,br=Math.floor(b/n),bc=b%n;let ts,tk;if(ar===0&&br===1&&ac===bc){ts='top';tk=ac;}else if(ar===n-1&&br===n-2&&ac===bc){ts='bottom';tk=ac;}else if(ac===0&&bc===1&&ar===br){ts='left';tk=ar;}else if(ac===n-1&&bc===n-2&&ar===br){ts='right';tk=ar;}else throw new Error('Tower transform ray mapping failed');clues[ts][tk]=val;}return {n,solution,clues,certifiedUnique:true,contentCertified:true,generatorVersion:W8_TOWER_VERSION,difficultyScore:base.difficultyScore,proceduralSource:'certified-bank-transform',sourceSeed:base.sourceSeed,sourceBankSize:W8_TOWER_BANK.Easy.length+W8_TOWER_BANK.Medium.length+W8_TOWER_BANK.Hard.length};}
  towersGame.generatorVersion=W8_TOWER_VERSION;towersGame.create=async function(seed,difficulty='Medium'){const pool=W8_TOWER_BANK[difficulty]||W8_TOWER_BANK.Medium,r=rng(`${seed}:tower:v8:source`),puzzle=w8TowerTransform(pick(pool,r),seed);return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle,state:{board:Array(puzzle.n*puzzle.n).fill(0),selected:0,history:[],mistakes:0}};};

  // ----- Tents v5: procedural tree/tent matching with exact uniqueness -----
  function w5CountTents(p,limit=2){const n=p.n,trees=p.trees,rowNeed=p.row,colNeed=p.col,treeSet=new Set(trees),rowMasks=[];for(let r=0;r<n;r++){const cells=Array.from({length:n},(_,c)=>r*n+c),eligible=cells.map(i=>!treeSet.has(i)&&rcNeighbors(i,n).some(t=>treeSet.has(t)));const masks=[];for(let m=0;m<(1<<n);m++){if(m.toString(2).replace(/0/g,'').length!==rowNeed[r])continue;if(m&(m<<1))continue;let ok=true;for(let c=0;c<n;c++)if((m>>c)&1&&!eligible[c]){ok=false;break;}if(ok)masks.push(m);}rowMasks.push(masks);}let count=0,placed=[];const col=Array(n).fill(0);function rec(r,prev){if(count>=limit)return;if(r===n){if(col.some((x,i)=>x!==colNeed[i]))return;const tents=[];placed.forEach((m,rr)=>{for(let c=0;c<n;c++)if((m>>c)&1)tents.push(rr*n+c)});if(tentsPerfectMatch(trees,tents,n))count++;return;}for(const m of rowMasks[r]){if((m&prev)||(m&(prev<<1))||(m&(prev>>1)))continue;let ok=true;for(let c=0;c<n;c++)if((m>>c)&1&&++col[c]>colNeed[c])ok=false;if(ok){placed.push(m);rec(r+1,m);placed.pop();}for(let c=0;c<n;c++)if((m>>c)&1)col[c]--;if(count>=limit)return;}}rec(0,0);return count;}
  function w5GenerateTents(seed,difficulty){const n={Easy:6,Medium:7,Hard:8}[difficulty],k={Easy:6,Medium:7,Hard:9}[difficulty],r=rng(`${seed}:tents5`);for(let attempt=0;attempt<300;attempt++){const tents=[];for(const i of shuffle(Array.from({length:n*n},(_,i)=>i),r)){const rr=Math.floor(i/n),cc=i%n;if(tents.some(j=>Math.abs(Math.floor(j/n)-rr)<=1&&Math.abs(j%n-cc)<=1))continue;tents.push(i);if(tents.length===k)break;}if(tents.length<k)continue;const trees=[],used=new Set();let fail=false;for(const t of shuffle(tents,r)){const opts=shuffle(rcNeighbors(t,n).filter(x=>!tents.includes(x)&&!used.has(x)),r);if(!opts.length){fail=true;break;}const x=opts[0];trees.push(x);used.add(x);}if(fail)continue;const row=Array(n).fill(0),col=Array(n).fill(0);tents.forEach(i=>{row[Math.floor(i/n)]++;col[i%n]++;});const p={n,trees:trees.sort((a,b)=>a-b),row,col,solution:[...tents].sort((a,b)=>a-b),generatorVersion:W5_VERSION};if(w5CountTents(p,2)===1)return {...p,certifiedUnique:true,difficultyScore:n*10+k};}throw new Error('Tents generation failed');}
  tentsGame.generatorVersion=W5_VERSION;tentsGame.create=async function(seed,difficulty='Medium'){const puzzle=w5GenerateTents(seed,difficulty);return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle,state:{cells:Array(puzzle.n*puzzle.n).fill(0),selected:0,history:[]}};};

  // ----- Queens v5: procedural boundary mutation from certified unique seeds -----
  function w5RegionConnected(regions,n,id){const cells=regions.map((x,i)=>x===id?i:-1).filter(i=>i>=0);if(!cells.length)return false;const seen=new Set([cells[0]]),q=[cells[0]];while(q.length){const i=q.pop();for(const j of rcNeighbors(i,n))if(regions[j]===id&&!seen.has(j)){seen.add(j);q.push(j);}}return seen.size===cells.length;}
  function w5GenerateQueens(seed,difficulty){const n={Easy:6,Medium:7,Hard:8}[difficulty],r=rng(`${seed}:queens5`),bases=QUEEN_BASES[n],base=JSON.parse(JSON.stringify(pick(bases,r))),regions=[...base.r],queens=[...base.q],qSet=new Set(queens),target={Easy:8,Medium:16,Hard:28}[difficulty];let accepted=0;for(let step=0;step<target*12&&accepted<target;step++){const i=Math.floor(r()*n*n);if(qSet.has(i))continue;const from=regions[i],near=[...new Set(rcNeighbors(i,n).map(j=>regions[j]).filter(x=>x!==from))];if(!near.length)continue;const to=pick(near,r),old=regions[i];regions[i]=to;if(!w5RegionConnected(regions,n,old)||!w5RegionConnected(regions,n,to)){regions[i]=old;continue;}const p={size:n,regions,solution:queens};if(countQueensStateSolutions(p,Array(n*n).fill(0),2)!==1){regions[i]=old;continue;}accepted++;}
    const p={size:n,regions:[...regions],solution:queens,certifiedUnique:true,generatorVersion:W5_VERSION,difficultyScore:n*10+accepted};const solutions=[];if(countQueensStateSolutions(p,Array(n*n).fill(0),2,solutions)!==1)throw new Error('Queens mutation lost uniqueness');
    p.solution=solutions[0];return p;}
  queensGame.generatorVersion=W5_VERSION;queensGame.create=async function(seed,difficulty='Medium'){const puzzle=w5GenerateQueens(seed,difficulty);return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle,state:{cells:Array(puzzle.size*puzzle.size).fill(0),selected:0,history:[]}};};

  // ----- Light Up v5: full procedural exact-unique generation -----
  function w5SolveLight(p,start=null,limit=2){const n=p.n,walls=new Set(p.walls),whites=Array.from({length:n*n},(_,i)=>i).filter(i=>!walls.has(i)),cells=start?[...start]:Array(n*n).fill(-1);for(const w of walls)cells[w]=9;let count=0,solution=null;
    const sees=i=>lightVisibleCells(p,i).filter(j=>!walls.has(j));
    function litBy(i,st){return sees(i).some(j=>st[j]===1);}
    function prop(st){let changed=true;while(changed){changed=false;for(const i of whites)if(st[i]===1){for(const j of sees(i))if(j!==i){if(st[j]===1)return false;if(st[j]===-1){st[j]=0;changed=true;}}}for(const [wk,clue] of Object.entries(p.clues)){const w=+wk,adj=rcNeighbors(w,n).filter(i=>!walls.has(i)),lamps=adj.filter(i=>st[i]===1).length,unk=adj.filter(i=>st[i]===-1);if(lamps>clue||lamps+unk.length<clue)return false;if(lamps===clue)for(const i of unk){st[i]=0;changed=true;}else if(lamps+unk.length===clue)for(const i of unk){st[i]=1;changed=true;}}for(const i of whites)if(!litBy(i,st)){const candidates=sees(i).filter(j=>st[j]===-1);if(!candidates.length)return false;if(candidates.length===1){st[candidates[0]]=1;changed=true;}}}return true;}
    function rec(st){if(count>=limit)return;st=[...st];if(!prop(st))return;let bi=-1,best=null;for(const i of whites)if(!litBy(i,st)){const cand=sees(i).filter(j=>st[j]===-1);if(!best||cand.length<best.length){bi=i;best=cand;if(cand.length===1)break;}}if(bi<0){count++;if(!solution)solution=st.map(v=>v===1);return;}const j=best[0];for(const v of [1,0]){const next=[...st];next[j]=v;rec(next);if(count>=limit)return;}}rec(cells);return {count,solution};}
  function w5GenerateLight(seed,difficulty){const n={Easy:7,Medium:8,Hard:9}[difficulty],r=rng(`${seed}:light5`),density={Easy:.18,Medium:.20,Hard:.22}[difficulty],keep={Easy:.76,Medium:.58,Hard:.42}[difficulty];for(let attempt=0;attempt<140;attempt++){const walls=[];for(let i=0;i<n*n;i++)if(r()<density)walls.push(i);if(walls.length<5)continue;const base={n,walls,clues:{}};const solved=w5SolveLight(base,null,1);if(!solved.count)continue;const clues={};for(const w of walls)clues[w]=rcNeighbors(w,n).filter(i=>solved.solution[i]).length;let p={n,walls:[...walls],clues,solution:solved.solution.map((v,i)=>v?i:-1).filter(i=>i>=0)};if(w5SolveLight(p,null,2).count!==1)continue;const keys=shuffle([...walls],r);for(const w of keys){if(Object.keys(p.clues).length<=Math.ceil(walls.length*keep))break;const old=p.clues[w];delete p.clues[w];if(w5SolveLight(p,null,2).count!==1)p.clues[w]=old;}const cert=w5SolveLight(p,null,2);if(cert.count===1)return {...p,solution:cert.solution.map((v,i)=>v?i:-1).filter(i=>i>=0),certifiedUnique:true,generatorVersion:W5_VERSION,difficultyScore:n*10+(walls.length-Object.keys(p.clues).length)};}throw new Error('Light Up generation failed');}
  lightUp.generatorVersion=W5_VERSION;lightUp.create=async function(seed,difficulty='Medium'){const puzzle=w5GenerateLight(seed,difficulty);return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle,state:{cells:Array(puzzle.n*puzzle.n).fill(0),selected:Array.from({length:puzzle.n*puzzle.n},(_,i)=>i).find(i=>!puzzle.walls.includes(i)),history:[]}};};

  nonogramGame.bind=function(a){let dragging=false,painted=new Set(),snapshot=null,changed=false;const apply=i=>{if(painted.has(i)||a.completed)return;painted.add(i);const old=a.state.cells[i],next=old===a.state.tool?0:a.state.tool;if(old===next)return;a.state.cells[i]=next;changed=true;const el=$(`[data-nono="${i}"]`);if(el){el.classList.toggle('filled',next===1);el.classList.toggle('marked',next===2);el.textContent=next===2?'×':'';}};const end=async()=>{if(!dragging)return;dragging=false;painted.clear();if(!changed)return;if(snapshot)a.state.history.push(snapshot);snapshot=null;changed=false;const ok=a.puzzle.solution.every((v,k)=>!v||a.state.cells[k]===1)&&a.state.cells.every((v,k)=>v!==1||a.puzzle.solution[k]);if(ok)await finishActive(a,{size:a.puzzle.size,image:a.puzzle.name});else await saveActive(a);this.render(a);};$$('[data-nono]').forEach(b=>{const i=+b.dataset.nono;b.onpointerdown=e=>{e.preventDefault();dragging=true;painted=new Set();snapshot=[...a.state.cells];changed=false;apply(i);b.setPointerCapture?.(e.pointerId)};b.onpointerenter=()=>{if(dragging)apply(i)};});document.onpointerup=end;document.onpointercancel=end;$$('[data-nono-tool]').forEach(b=>b.onclick=()=>{a.state.tool=+b.dataset.nonoTool;this.render(a)});$('[data-nono-undo]').onclick=()=>this.undo(a);};
  nonogramGame.undo=async function(a){const h=a.state.history.pop();if(!h)return;if(Array.isArray(h)&&h.length===a.state.cells.length)a.state.cells=[...h];else if(Array.isArray(h)&&h.length===2)a.state.cells[h[0]]=h[1];await saveActive(a);this.render(a);};

  // Generator-version metadata is intentionally stored on the puzzle so stale Wave 4 sessions rebuild automatically.

  // ---------- Wave 6: Already-Strong Games -> Exceptional ----------
  // Versioned depth upgrades for Word Ladder, Sudoku, Make 24, Binary, Loop,
  // Rectangles, Unequal, Arithmetic Cages, Dominoes, and Untangle.
  const W6_VERSION=6;

  // ----- Word Ladder v6: 3/4/5-letter graph families, par and proof hints -----
  const w6LadderCache=new Map(),w6LadderPairCache=new Map();
  function w6LadderWords(len){
    const key=`words:${len}`;if(w6LadderCache.has(key))return w6LadderCache.get(key);
    const all=[...(WORD_CONTENT.lexicon||[]),...LADDER_WORDS].map(w=>String(w).toLowerCase()).filter(w=>/^[a-z]+$/.test(w)&&w.length===len);
    const words=[...new Set(all)].sort();w6LadderCache.set(key,words);return words;
  }
  function w6LadderGraph(len){
    const key=`graph:${len}`;if(w6LadderCache.has(key))return w6LadderCache.get(key);
    const words=w6LadderWords(len),g=new Map(words.map(w=>[w,[]])),buckets=new Map();
    for(const w of words)for(let i=0;i<len;i++){const p=w.slice(0,i)+'*'+w.slice(i+1);if(!buckets.has(p))buckets.set(p,[]);buckets.get(p).push(w);}
    for(const arr of buckets.values())for(let i=0;i<arr.length;i++)for(let j=i+1;j<arr.length;j++){g.get(arr[i]).push(arr[j]);g.get(arr[j]).push(arr[i]);}
    for(const [w,a] of g)a.sort();w6LadderCache.set(key,g);return g;
  }
  function w6LadderPath(start,target){
    if(start===target)return[start];const g=w6LadderGraph(start.length);if(!g.has(start)||!g.has(target))return null;const q=[start],prev=new Map([[start,null]]);
    for(let h=0;h<q.length;h++){const w=q[h];for(const nx of g.get(w)||[]){if(prev.has(nx))continue;prev.set(nx,w);if(nx===target){const p=[nx];let x=w;while(x){p.push(x);x=prev.get(x);}return p.reverse();}q.push(nx);}}return null;
  }
  function acceptedLadderGraph(len){
    if(acceptedLadderGraphCache.has(len))return acceptedLadderGraphCache.get(len);
    const words=acceptedWordsOfLength(len),g=new Map(words.map(w=>[w,[]])),buckets=new Map();
    for(const w of words)for(let i=0;i<len;i++){const p=w.slice(0,i)+'*'+w.slice(i+1);if(!buckets.has(p))buckets.set(p,[]);buckets.get(p).push(w);}
    for(const arr of buckets.values())for(let i=0;i<arr.length;i++)for(let j=i+1;j<arr.length;j++){g.get(arr[i]).push(arr[j]);g.get(arr[j]).push(arr[i]);}
    acceptedLadderGraphCache.set(len,g);return g;
  }
  function acceptedLadderPath(start,target,blocked=new Set()){
    if(start===target)return[start];const g=acceptedLadderGraph(start.length);if(!g.has(start)||!g.has(target))return null;const q=[start],prev=new Map([[start,null]]);
    for(let h=0;h<q.length;h++){const w=q[h];for(const nx of g.get(w)||[]){if(prev.has(nx)||blocked.has(nx))continue;prev.set(nx,w);if(nx===target){const p=[nx];let x=w;while(x){p.push(x);x=prev.get(x);}return p.reverse();}q.push(nx);}}return null;
  }
  function w6LadderPairs(difficulty){
    const cfg={Easy:[3,3,5],Medium:[4,4,7],Hard:[5,4,8]}[difficulty]||[4,4,7],key=cfg.join(':');if(w6LadderPairCache.has(key))return w6LadderPairCache.get(key);
    const [len,lo,hi]=cfg,words=w6LadderWords(len),g=w6LadderGraph(len),out=[];
    for(let si=0;si<words.length;si++){
      const s=words[si],q=[s],dist=new Map([[s,0]]);
      for(let h=0;h<q.length;h++){const w=q[h],d=dist.get(w);if(d>=hi)continue;for(const nx of g.get(w)||[])if(!dist.has(nx)){dist.set(nx,d+1);q.push(nx);}}
      for(let j=si+1;j<words.length;j++){const d=dist.get(words[j]);if(d>=lo&&d<=hi)out.push([s,words[j],d]);}
    }
    w6LadderPairCache.set(key,out);return out;
  }
  wordLadder.generatorVersion=W6_VERSION;
  wordLadder.rules={objective:'Change the start word into the target word one letter at a time.',items:['Every step must be a valid word of the displayed length.','Change exactly one letter per move.','Any valid route is accepted; the shortest route is shown as par.','Easy uses 3-letter ladders, Medium 4-letter, and Hard 5-letter ladders.']};
  wordLadder.create=async function(seed,difficulty='Medium'){
    const r=rng(`${seed}:ladder:v6`),pool=w6LadderPairs(difficulty);if(!pool.length)throw new Error(`No ${difficulty} ladder pairs`);const pair=pick(pool,r),len=pair[0].length;
    return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle:{start:pair[0],target:pair[1],optimal:pair[2],length:len,poolSize:pool.length,generatorVersion:W6_VERSION,difficultyScore:pair[2]*10+len},state:{chain:[pair[0]],input:''}};
  };
  wordLadder.render=function(a){const len=a.puzzle.length||a.puzzle.start.length,current=a.state.chain.at(-1);const chain=a.state.chain.map((w,i)=>{const prev=i?a.state.chain[i-1]:null,changed=prev?[...w].findIndex((c,k)=>c!==prev[k]):-1;return `<div class="ladder-step"><span>${String(i).padStart(2,'0')}</span><strong>${[...w].map((c,k)=>`<i class="${k===changed?'changed':''}">${c.toUpperCase()}</i>`).join('')}</strong>${prev?`<small>letter ${changed+1}</small>`:''}</div>`}).join('');const board=`<div class="ladder-wrap"><div class="ladder-target"><span>Start</span><strong>${a.puzzle.start.toUpperCase()}</strong><i>→</i><span>Target</span><strong>${a.puzzle.target.toUpperCase()}</strong></div><div class="w6-meta"><span>${len} letters</span><span>Par ${a.puzzle.optimal}</span><span>${a.puzzle.poolSize.toLocaleString()} certified pairs</span></div><div class="ladder-chain">${chain}</div>${!a.completed?`<form class="ladder-entry"><input maxlength="${len}" autocomplete="off" spellcheck="false" aria-label="Next ${len}-letter word" placeholder="Next word" value="${esc(a.state.input||'')}"><button class="primary-button" type="submit">Add</button></form>`:''}</div>`;const moves=a.state.chain.length-1,result=a.completed?resultPanel(a,this,`<div><strong>${moves}</strong><span>Moves</span></div><div><strong>${a.puzzle.optimal}</strong><span>Par</span></div><div><strong>${moves-a.puzzle.optimal>=0?'+'+(moves-a.puzzle.optimal):moves-a.puzzle.optimal}</strong><span>Over par</span></div>`):'';main.innerHTML=baseGameShell(byId[this.id],a,board,`${!a.completed?`<div class="toolbar"><button data-ladder-undo ${a.state.chain.length<=1?'disabled':''}>Undo</button></div>`:''}${result}`);bindGameShell(this,a);this.bind(a);if(a.completed)bindResult(a,this);};
  wordLadder.bind=function(a){const len=a.puzzle.length||a.puzzle.start.length,form=$('.ladder-entry');if(form){const input=$('input',form);input.oninput=()=>a.state.input=input.value.toLowerCase().replace(/[^a-z]/g,'').slice(0,len);form.onsubmit=e=>{e.preventDefault();this.submit(a)};setTimeout(()=>input.focus(),0);}const u=$('[data-ladder-undo]');if(u)u.onclick=()=>this.undo(a);};
  wordLadder.submit=async function(a){const len=a.puzzle.length||a.puzzle.start.length,w=(a.state.input||'').toLowerCase(),cur=a.state.chain.at(-1);if(w.length!==len)return toast(`Enter ${len} letters.`);if(!isAcceptedWord(w))return toast('That word is not in the accepted English dictionary.');if(a.state.chain.includes(w))return toast('That word is already in the ladder.');if(!oneLetterDiff(cur,w))return toast('Change exactly one letter.');a.state.chain.push(w);a.state.input='';if(w===a.puzzle.target)await finishActive(a,{moves:a.state.chain.length-1,optimal:a.puzzle.optimal,overPar:a.state.chain.length-1-a.puzzle.optimal});else await saveActive(a);this.render(a);};
  wordLadder.hint=function(a){const cur=a.state.chain.at(-1),path=acceptedLadderPath(cur,a.puzzle.target,new Set(a.state.chain.slice(0,-1)));if(!path||path.length<2)return toast('No route remains without revisiting a word. Undo a step and try another branch.');const nx=path[1],idx=[...cur].findIndex((c,i)=>c!==nx[i]),d={token:`ladder6-${cur}-${a.puzzle.target}`,focus:`A shortest route from ${cur.toUpperCase()} is ${path.length-1} move${path.length===2?'':'s'} long.`,rule:'Each move changes exactly one character and must remain a dictionary word.',deduction:`On one shortest route, the next change is at letter position ${idx+1}.`,reveal:`One valid next word is ${nx.toUpperCase()}.`};deliverProofHint(a,d);};

  // ----- Sudoku v6: candidate notes, note mode and technique profile -----
  function w6SudokuSearchStats(givens){const b=[...givens],stats={nodes:0,backtracks:0};function rec(){stats.nodes++;let bi=-1,opts=null;for(let i=0;i<81;i++)if(!b[i]){const o=sudokuCandidates(b,i);if(!o.length){stats.backtracks++;return false;}if(!opts||o.length<opts.length){bi=i;opts=o;if(o.length===1)break;}}if(bi<0)return true;for(const v of opts){b[bi]=v;if(rec())return true;b[bi]=0;}stats.backtracks++;return false;}rec();return stats;}
  function w6SudokuProfile(givens){const b=[...givens];let naked=0,hidden=0,rounds=0,changed=true;while(changed){changed=false;rounds++;for(let i=0;i<81;i++)if(!b[i]){const o=sudokuCandidates(b,i);if(o.length===1){b[i]=o[0];naked++;changed=true;}}if(changed)continue;const units=[];for(let r=0;r<9;r++)units.push(Array.from({length:9},(_,c)=>r*9+c));for(let c=0;c<9;c++)units.push(Array.from({length:9},(_,r)=>r*9+c));for(let br=0;br<3;br++)for(let bc=0;bc<3;bc++)units.push(Array.from({length:9},(_,k)=>(br*3+Math.floor(k/3))*9+bc*3+k%3));outer:for(const u of units)for(let v=1;v<=9;v++){if(u.some(i=>b[i]===v))continue;const spots=u.filter(i=>!b[i]&&sudokuCandidates(b,i).includes(v));if(spots.length===1){b[spots[0]]=v;hidden++;changed=true;break outer;}}}const unresolved=b.filter(v=>!v).length,search=w6SudokuSearchStats(givens),score=unresolved*4+hidden*.5+Math.log2(search.nodes+1)*3+(81-givens.filter(Boolean).length)*.18;return {score:+score.toFixed(2),naked,hidden,unresolved,logicalRounds:rounds,searchNodes:search.nodes,backtracks:search.backtracks};}
  function w6GenerateSudoku(seed,difficulty){const candidates=[];for(let k=0;k<7;k++){const p=generateSudoku(`${seed}:w6:${k}`,difficulty),m=w6SudokuProfile(p.givens);candidates.push({...p,metrics:m});}candidates.sort((a,b)=>a.metrics.score-b.metrics.score);const pickIndex=difficulty==='Easy'?0:difficulty==='Hard'?candidates.length-1:Math.floor(candidates.length/2),q=candidates[pickIndex];return {...q,generatorVersion:W6_VERSION,difficultyScore:q.metrics.score,difficultyMetrics:q.metrics};}
  function w6EnsureSudokuState(a){a.state.notes=a.state.notes||Array.from({length:81},()=>[]);a.state.noteMode=!!a.state.noteMode;a.state.history=a.state.history||[];}
  function w6SudokuPeerIndices(i){const r=Math.floor(i/9),c=i%9,s=new Set();for(let k=0;k<9;k++){s.add(r*9+k);s.add(k*9+c);}const br=Math.floor(r/3)*3,bc=Math.floor(c/3)*3;for(let rr=0;rr<3;rr++)for(let cc=0;cc<3;cc++)s.add((br+rr)*9+bc+cc);s.delete(i);return [...s];}
  sudoku.generatorVersion=W6_VERSION;
  sudoku.create=async function(seed,difficulty='Medium'){const puzzle=w6GenerateSudoku(seed,difficulty);return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle,state:{board:[...puzzle.givens],selected:firstEmpty(puzzle.givens),mistakes:0,notes:Array.from({length:81},()=>[]),noteMode:false,history:[]}};};
  sudoku.render=function(a){w6EnsureSudokuState(a);const s=a.state.selected,sr=Math.floor(s/9),sc=s%9;const board=`<div class="sudoku-board" role="grid" aria-label="Sudoku board">${a.state.board.map((v,i)=>{const r=Math.floor(i/9),c=i%9,given=!!a.puzzle.givens[i],sel=i===s,rel=r===sr||c===sc||(Math.floor(r/3)===Math.floor(sr/3)&&Math.floor(c/3)===Math.floor(sc/3)),wrong=v&&v!==a.puzzle.solution[i],notes=!v?(a.state.notes[i]||[]):[];return `<button class="sudoku-cell ${given?'given':''} ${sel?'selected':''} ${!sel&&rel?'related':''} ${state.settings.playMode==='challenge'&&wrong?'wrong':''}" data-cell="${i}" aria-label="Row ${r+1}, column ${c+1}, ${v?`value ${v}`:'empty'}${given?', given':''}">${v||`<span class="sudoku-notes">${Array.from({length:9},(_,k)=>`<i>${notes.includes(k+1)?k+1:''}</i>`).join('')}</span>`}</button>`}).join('')}</div>`;const pad=`<div class="number-pad">${[1,2,3,4,5,6,7,8,9].map(n=>`<button data-num="${n}">${n}</button>`).join('')}<button data-num="0">Clear</button></div>`;const meta=a.puzzle.difficultyMetrics||{},panel=`<div class="w6-meta"><span>${a.state.noteMode?'Notes ON':'Value mode'}</span><span>${81-a.puzzle.givens.filter(Boolean).length} blanks</span><span>${meta.unresolved?`${meta.unresolved} beyond singles`:`Singles-solvable`}</span></div>`;const result=a.completed?resultPanel(a,this,`<div><strong>${a.state.mistakes}</strong><span>Mistakes</span></div><div><strong>${meta.searchNodes||0}</strong><span>Profile nodes</span></div>`):'';main.innerHTML=baseGameShell(byId[this.id],a,`<div class="w6-board-stack">${panel}${board}</div>`,`${pad}<div class="toolbar"><button data-sudoku-notes class="${a.state.noteMode?'active':''}">Notes (N)</button><button data-sudoku-fill>Fill candidates (C)</button><button data-sudoku-undo>Undo</button></div>${result}`);bindGameShell(this,a);this.bind(a);if(a.completed)bindResult(a,this);};
  sudoku.bind=function(a){w6EnsureSudokuState(a);$$('.sudoku-cell').forEach(b=>b.onclick=()=>{a.state.selected=+b.dataset.cell;this.render(a)});$$('[data-num]').forEach(b=>b.onclick=()=>this.enter(a,+b.dataset.num));$('[data-sudoku-notes]').onclick=()=>{a.state.noteMode=!a.state.noteMode;this.render(a)};$('[data-sudoku-fill]').onclick=async()=>{const snap={board:[...a.state.board],notes:a.state.notes.map(x=>[...x])};a.state.history.push(snap);for(let i=0;i<81;i++)if(!a.state.board[i])a.state.notes[i]=sudokuCandidates(a.state.board,i);await saveActive(a);this.render(a)};$('[data-sudoku-undo]').onclick=()=>this.undo(a);window.onkeydown=e=>{if(!state.currentGame||state.currentGame.id!==this.id||a.completed||overlayRoot.innerHTML)return;let s=a.state.selected,r=Math.floor(s/9),c=s%9;if(e.key.toLowerCase()==='n'){a.state.noteMode=!a.state.noteMode;this.render(a);return}if(e.key.toLowerCase()==='c'){e.preventDefault();$('[data-sudoku-fill]')?.click();return}if(e.key==='ArrowUp')r=clamp(r-1,0,8);else if(e.key==='ArrowDown')r=clamp(r+1,0,8);else if(e.key==='ArrowLeft')c=clamp(c-1,0,8);else if(e.key==='ArrowRight')c=clamp(c+1,0,8);else if(/^[1-9]$/.test(e.key)){this.enter(a,+e.key);return}else if(e.key==='Backspace'||e.key==='Delete'){this.enter(a,0);return}else return;e.preventDefault();a.state.selected=r*9+c;this.render(a)};};
  sudoku.enter=async function(a,n){w6EnsureSudokuState(a);const i=a.state.selected;if(a.puzzle.givens[i])return;const snap={board:[...a.state.board],notes:a.state.notes.map(x=>[...x])};if(a.state.noteMode&&n){a.state.history.push(snap);const x=a.state.notes[i]||[],k=x.indexOf(n);if(k>=0)x.splice(k,1);else x.push(n);x.sort((x,y)=>x-y);await saveActive(a);this.render(a);return;}if((a.state.board[i]||0)===(n||0))return;a.state.history.push(snap);a.state.board[i]=n||0;a.state.notes[i]=[];if(n){for(const j of w6SudokuPeerIndices(i))a.state.notes[j]=(a.state.notes[j]||[]).filter(x=>x!==n);if(n!==a.puzzle.solution[i])a.state.mistakes++;}if(a.state.board.every((v,k)=>v===a.puzzle.solution[k]))await finishActive(a,{mistakes:a.state.mistakes,profile:a.puzzle.difficultyMetrics});else await saveActive(a);this.render(a);};
  sudoku.undo=async function(a){w6EnsureSudokuState(a);const h=a.state.history.pop();if(!h)return;if(Array.isArray(h)){a.state.board[h[0]]=h[1];}else{a.state.board=[...h.board];a.state.notes=h.notes.map(x=>[...x]);}await saveActive(a);this.render(a);};

  // ----- Make 24 v6: exact current-state route hints and solution-family feedback -----
  function w6FracKey(v){return `${v.n}/${v.d}`;}
  function w6Solve24Route(values){const seen=new Set();function rec(vals){const key=vals.map(w6FracKey).sort().join('|');if(seen.has(key))return null;seen.add(key);if(vals.length===1)return vals[0].n===24*vals[0].d?[]:null;for(let i=0;i<vals.length;i++)for(let j=i+1;j<vals.length;j++){const a=vals[i],b=vals[j],rest=vals.filter((_,k)=>k!==i&&k!==j),ops=[['+',a,b],['×',a,b],['-',a,b],['-',b,a],['÷',a,b],['÷',b,a]];for(const [op,x,y] of ops){const out=applyFrac(x,y,op);if(!out)continue;const tail=rec([...rest,out]);if(tail)return [{left:x.label,right:y.label,op,result:out.label},...tail];}}return null;}return rec(values.map(v=>({...v})));}
  function w6Make24SolutionExpressions(nums,limit=24){const out=new Set();function rec(vals){if(out.size>=limit)return;if(vals.length===1){if(vals[0].n===24*vals[0].d)out.add(vals[0].label);return;}for(let i=0;i<vals.length;i++)for(let j=i+1;j<vals.length;j++){const a=vals[i],b=vals[j],rest=vals.filter((_,k)=>k!==i&&k!==j);for(const [op,x,y] of [['+',a,b],['×',a,b],['-',a,b],['-',b,a],['÷',a,b],['÷',b,a]]){const v=applyFrac(x,y,op);if(v)rec([...rest,v]);}}}rec(nums.map(n=>frac(n)));return [...out];}
  make24.generatorVersion=W6_VERSION;
  const w6Make24OldCreate=make24.create.bind(make24),w6Make24OldRender=make24.render.bind(make24);
  make24.create=async function(seed,difficulty='Medium'){const a=await w6Make24OldCreate(seed,difficulty),expr=w6Make24SolutionExpressions(a.puzzle.nums,40);a.puzzle.generatorVersion=W6_VERSION;a.puzzle.solutionExamples=expr.slice(0,6);a.puzzle.solutionFamilyCount=Math.max(expr.length,a.puzzle.difficultyMetrics?.solutionCount||0);return a;};
  make24.render=function(a){w6Make24OldRender(a);const wrap=$('.make24');if(wrap){const route=w6Solve24Route(a.state.values),extra=document.createElement('div');extra.className='w6-meta';extra.innerHTML=`<span>${a.puzzle.solutionFamilyCount} solution form${a.puzzle.solutionFamilyCount===1?'':'s'}</span><span>${route?`${route.length} step${route.length===1?'':'s'} from here`:'Dead end'}</span><span>Exact fractions</span>`;wrap.prepend(extra);}if(a.completed&&a.puzzle.solutionExamples?.length){const panel=document.createElement('div');panel.className='w6-solution-panel';panel.innerHTML=`<strong>Other exact solution${a.puzzle.solutionExamples.length===1?'':'s'}</strong>${a.puzzle.solutionExamples.slice(0,3).map(x=>`<code>${esc(x)} = 24</code>`).join('')}`;$('.result-panel')?.before(panel);}};
  make24.hint=function(a){const route=w6Solve24Route(a.state.values);if(!route||!route.length)return deliverProofHint(a,{token:'m24-dead',focus:'This expression state has no route to 24.',rule:'All four original values must be used exactly once; fractions remain exact.',deduction:'At least one earlier combination led into a dead end.',reveal:'Undo one step and choose a different pair.'});const m=route[0],d={token:`m24-${a.state.values.map(w6FracKey).sort().join('_')}`,focus:`Focus on ${m.left} and ${m.right}.`,rule:'Combining two current values preserves the rule that every original number is used exactly once.',deduction:`On an exact route to 24, combine this pair with ${m.op}.`,reveal:`${m.left} ${m.op} ${m.right} = ${m.result}.`};deliverProofHint(a,d);};

  // ----- Binary v6: 12x12 Hard, certified removal, row/column diagnostics -----
  const W6_BINARY_HARD_BANK=[{"solution":[0,1,1,0,0,1,0,0,1,1,0,1,1,0,1,0,0,1,1,0,1,0,0,1,0,1,0,1,1,0,0,1,0,1,1,0,0,1,0,1,1,0,1,1,0,0,1,0,1,0,1,0,0,1,0,0,1,1,0,1,0,1,1,0,1,0,1,0,1,0,0,1,1,0,0,1,0,1,0,1,0,1,1,0,1,0,1,0,1,1,0,1,0,0,1,0,0,1,0,1,1,0,1,0,1,0,0,1,0,1,1,0,0,1,0,1,0,1,1,0,1,0,0,1,0,0,1,1,0,1,0,1,1,0,0,1,1,0,1,0,1,0,1,0],"givens":[0,1,1,0,null,null,0,null,1,1,0,1,1,0,1,null,0,1,1,null,1,null,0,1,null,1,null,1,1,0,null,1,0,1,1,null,0,null,null,1,1,0,1,1,null,null,1,0,null,null,null,null,null,1,0,0,1,null,0,null,0,null,1,0,1,0,null,0,1,0,0,1,1,null,0,null,0,null,0,null,0,1,1,0,1,0,1,0,1,1,0,null,null,0,null,0,null,1,null,1,1,null,1,0,1,0,null,1,null,null,1,0,null,null,0,1,null,1,null,null,1,0,null,1,0,0,1,null,0,null,0,null,1,0,0,null,1,0,null,0,1,0,null,0]},{"solution":[0,1,1,0,1,0,1,0,1,0,0,1,0,1,1,0,0,1,0,1,0,1,1,0,1,0,0,1,1,0,0,1,0,1,0,1,1,0,1,0,1,0,1,0,1,0,1,0,0,1,1,0,0,1,1,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,0,1,1,0,1,0,0,1,1,0,0,1,1,0,0,1,1,0,1,0,0,1,1,0,1,0,0,1,0,1,1,0,0,1,0,1,0,1,1,0,0,1,0,1,1,0,0,1,1,0,0,1,1,0,0,1,1,0,1,0,0,1,0,1,0,1,1,0,0,1,1,0],"givens":[0,null,1,0,1,0,1,null,1,0,null,1,0,null,1,0,0,1,0,null,0,1,1,null,1,null,null,1,null,0,0,null,null,null,null,null,null,null,null,0,1,0,1,0,1,0,null,0,0,1,1,0,0,1,1,0,1,0,1,0,1,0,0,null,0,1,0,null,null,1,0,1,0,1,null,0,null,0,null,null,null,0,0,null,null,0,0,null,null,0,null,null,0,null,1,0,1,null,0,null,null,1,1,null,null,null,null,1,null,1,null,0,null,1,null,1,1,0,null,1,1,0,0,1,1,0,0,1,1,0,1,0,0,1,null,1,0,1,null,0,0,1,null,0]},{"solution":[0,1,1,0,1,0,0,1,1,0,0,1,0,1,1,0,1,0,1,1,0,1,0,0,1,0,0,1,0,1,0,0,1,0,1,1,1,0,1,1,0,1,0,1,0,1,0,0,0,1,1,0,1,0,1,0,1,1,0,0,1,0,0,1,0,0,1,0,1,0,1,1,1,0,0,1,0,1,0,1,0,0,1,1,0,1,1,0,1,1,0,1,0,1,0,0,0,1,0,1,0,0,1,0,1,0,1,1,1,0,1,0,1,1,0,0,1,1,0,0,0,1,0,0,1,0,1,1,0,0,1,1,1,0,0,1,0,1,1,0,0,1,1,0],"givens":[null,1,1,null,1,null,null,1,1,null,0,null,null,1,1,null,1,0,1,1,0,1,0,0,null,0,null,1,null,null,0,0,1,null,1,1,null,0,null,1,0,1,0,1,null,null,0,null,null,null,1,null,1,0,1,0,1,1,0,0,null,null,0,null,0,0,1,0,1,null,1,1,null,null,0,1,0,null,0,null,0,null,1,1,0,1,1,0,null,1,null,null,0,null,0,0,0,1,null,1,null,0,1,null,1,0,1,null,null,0,1,null,null,1,0,null,1,1,null,0,0,null,0,0,1,0,1,1,0,null,1,1,null,0,0,null,null,1,1,0,0,1,1,0]},{"solution":[0,1,1,0,1,0,1,1,0,1,0,0,0,1,1,0,0,1,0,1,0,1,0,1,1,0,0,1,0,0,1,0,1,0,1,1,1,0,0,1,1,0,1,0,1,1,0,0,0,1,1,0,0,1,0,1,0,1,1,0,0,0,1,0,1,1,0,0,1,0,1,1,1,0,0,1,0,0,1,1,0,1,0,1,0,1,0,1,1,0,1,1,0,0,1,0,1,0,1,0,1,1,0,0,1,0,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,0,1,1,0,1,0,1,0,1,0,1,1,0,1,0,1,0,0,1,0,0,1],"givens":[0,1,1,0,1,null,1,null,0,1,0,null,0,1,null,null,0,1,0,null,0,null,null,null,1,null,0,1,0,0,1,0,null,0,null,1,1,0,null,null,1,null,null,0,null,1,0,0,0,1,1,0,null,1,0,null,0,null,1,0,0,0,1,null,1,1,null,null,1,null,null,null,1,0,0,1,null,0,null,null,0,null,0,1,null,null,null,1,1,0,1,1,0,null,1,0,1,0,null,0,null,1,0,0,null,0,1,0,1,null,1,null,0,1,0,1,0,1,0,1,0,1,0,1,null,0,null,0,1,0,1,0,null,null,0,null,0,1,0,null,null,null,0,null]},{"solution":[0,1,0,1,0,0,1,1,0,1,1,0,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,0,1,1,0,0,1,1,0,1,0,1,1,1,0,0,1,1,0,0,1,0,1,0,1,1,0,1,0,0,1,0,1,1,0,0,0,0,1,1,0,1,0,1,0,0,1,1,1,1,0,0,1,1,0,0,1,0,0,1,1,0,1,0,1,0,1,1,0,1,0,0,0,0,1,1,0,1,1,0,1,0,1,0,1,1,0,0,1,0,0,1,0,1,0,1,0,0,1,0,1,1,0,0,1,0,1,1],"givens":[null,1,0,null,0,0,1,null,0,null,1,0,0,1,null,0,1,0,null,1,null,1,1,0,null,0,0,null,0,null,null,null,null,0,0,null,null,0,1,1,0,0,1,1,0,1,null,1,1,1,0,0,1,1,null,0,null,0,1,0,1,null,null,1,0,0,1,0,1,null,0,0,0,0,null,1,0,null,0,1,0,0,null,1,1,null,null,0,1,null,null,0,null,null,0,1,null,null,1,0,null,null,1,null,0,1,0,0,null,0,1,1,0,1,1,0,null,0,null,0,1,1,null,null,null,0,0,1,0,null,0,1,null,null,1,null,null,1,null,0,1,0,null,1]},{"solution":[1,0,0,1,1,0,1,0,0,1,1,0,1,0,1,1,0,0,1,0,0,1,0,1,0,1,0,0,1,1,0,1,1,0,1,0,0,1,0,0,1,0,1,0,1,0,1,1,1,0,1,1,0,1,0,1,0,1,0,0,0,1,0,1,1,0,1,1,0,1,0,0,0,1,1,0,0,1,0,0,1,0,1,1,1,0,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,1,0,0,1,0,1,0,1,0,1,0,1,0,1,1,0,1,0,1,0,1,0,0,1,0,1,1,0,0,1],"givens":[1,null,null,1,1,0,null,0,0,1,1,null,1,null,1,1,0,0,null,0,0,1,0,1,0,1,null,0,1,1,null,null,null,null,1,0,0,1,0,null,null,null,1,0,1,null,1,null,1,null,1,null,0,1,0,1,0,1,0,0,0,1,0,null,null,null,null,null,null,1,0,null,null,1,null,null,0,1,0,0,null,0,1,1,null,null,1,null,1,null,0,1,0,null,1,0,1,0,0,null,0,1,null,0,1,null,0,1,0,null,1,0,1,0,1,null,null,1,0,null,null,1,0,1,0,1,0,null,null,null,1,0,null,0,1,0,0,null,0,1,1,0,null,1]},{"solution":[0,1,0,0,1,1,0,1,1,0,0,1,1,0,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,0,1,1,0,0,1,0,1,0,1,0,1,1,0,0,1,0,1,0,0,1,0,1,0,1,1,0,1,1,0,1,0,1,0,1,0,0,1,1,0,0,0,1,1,0,1,0,1,1,0,1,0,0,1,0,1,1,0,0,1,0,1,0,1,1,0,1,0,0,1,1,0,1,0,1,0,1,1,0,1,0,1,0,1,0,0,1,0,0,1,1,0,1,0,1,0,0,1,0,1,1,0,1,1,0,0,1,0,1,0,1,0],"givens":[null,1,null,0,1,null,0,null,1,null,0,1,null,0,0,1,1,0,null,0,0,null,0,null,null,null,1,null,null,1,0,1,0,1,1,null,0,null,0,null,null,1,0,1,1,0,null,null,null,null,0,0,1,0,1,0,1,1,0,null,1,0,1,0,1,0,1,0,0,null,1,null,null,0,1,1,0,1,0,null,null,0,1,0,null,1,0,1,1,null,0,1,null,1,null,1,null,0,1,null,0,null,1,0,null,0,1,0,1,null,0,1,0,1,0,null,0,0,1,0,0,null,1,0,null,0,null,0,null,null,null,null,1,null,1,null,0,null,1,0,null,0,1,0]},{"solution":[1,0,1,1,0,1,0,1,0,1,0,0,1,1,0,0,1,1,0,0,1,0,1,0,0,1,0,1,0,0,1,0,1,0,1,1,1,0,1,0,1,0,0,1,0,1,0,1,0,0,1,0,1,1,0,1,0,1,1,0,1,1,0,1,0,0,1,0,1,0,0,1,1,0,1,0,1,1,0,0,1,1,0,0,0,0,1,1,0,0,1,1,0,0,1,1,0,1,0,1,0,0,1,1,0,1,0,1,1,0,1,0,1,1,0,0,1,0,1,0,0,1,0,1,0,1,1,0,1,0,1,0,0,1,0,0,1,0,1,1,0,1,0,1],"givens":[null,0,1,1,0,1,0,1,null,1,null,null,1,1,null,null,1,null,null,null,1,0,1,0,0,1,0,null,0,null,null,0,1,null,null,1,1,0,null,0,1,0,0,null,0,null,0,1,0,0,1,0,1,null,0,null,0,null,null,0,1,null,0,1,0,0,1,0,1,0,null,1,null,null,1,0,null,1,0,0,null,1,null,0,0,null,1,1,0,0,null,1,0,0,1,1,0,null,0,1,null,null,1,null,0,null,null,1,null,null,null,null,1,1,0,0,1,0,1,null,0,1,null,1,null,1,1,null,1,null,1,0,0,1,null,null,1,0,1,null,0,1,0,1]},{"solution":[0,0,1,0,0,1,1,0,1,0,1,1,0,1,0,1,0,1,1,0,1,0,0,1,1,1,0,0,1,0,0,1,0,1,1,0,0,0,1,0,1,0,1,1,0,1,1,0,1,1,0,1,0,1,0,0,1,0,0,1,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,1,0,0,1,0,1,1,0,0,1,0,1,1,0,0,1,0,1,0,1,1,0,1,0,0,1,1,0,1,0,1,0,1,0,0,1,1,0,1,0,0,1,1,0,0,1,1,0,1,0,0,1,1,0,0,1,1,0,1,1,0,1,0,1,0,1,0,0],"givens":[null,0,1,null,0,1,1,0,1,0,1,null,0,1,null,null,null,1,1,null,1,0,0,null,null,1,null,0,1,0,0,1,null,1,null,0,null,0,null,null,1,0,1,1,0,1,1,null,null,null,0,1,null,1,0,null,1,null,0,1,1,null,0,null,0,1,null,0,1,0,null,1,null,null,1,null,null,null,0,1,0,null,null,0,0,1,0,1,1,null,0,null,0,1,0,null,null,null,1,0,0,null,null,0,1,0,null,0,1,0,0,1,1,null,1,0,0,1,1,0,0,null,1,0,1,0,0,1,null,0,0,1,1,null,null,null,0,1,null,1,0,null,0,0]},{"solution":[1,0,1,1,0,1,0,0,1,1,0,0,0,1,0,1,1,0,0,1,1,0,1,0,1,0,1,0,1,0,1,0,0,1,0,1,1,0,0,1,0,1,0,0,1,0,1,1,0,1,0,1,1,0,1,1,0,1,0,0,0,1,1,0,0,1,0,1,0,0,1,1,1,0,0,1,0,0,1,0,1,0,1,1,1,1,0,0,1,1,0,0,1,1,0,0,0,0,1,0,1,0,1,1,0,1,1,0,0,1,0,1,0,1,0,1,0,0,1,1,1,0,1,0,0,1,1,0,1,0,0,1,0,1,1,0,1,0,1,1,0,1,0,0],"givens":[1,0,1,null,null,null,null,0,null,null,null,null,null,null,0,1,1,0,null,null,1,null,1,0,1,null,1,null,1,null,null,0,0,1,0,1,null,null,null,null,0,1,null,null,1,0,null,null,0,1,0,1,null,0,1,1,0,1,0,0,0,1,1,0,0,1,0,1,0,0,null,null,1,null,0,null,0,0,null,0,1,0,1,null,1,null,null,null,1,1,0,0,1,null,0,0,0,null,1,0,null,0,null,1,0,1,1,0,null,1,null,1,0,null,0,1,null,0,1,null,null,0,1,null,0,1,1,0,1,0,0,1,0,1,1,0,1,null,1,1,null,1,0,0]}];
  function w6BinaryTransform(values,n,t,flip){const out=Array(n*n);values.forEach((v,i)=>{const j=transformGridIndex(i,n,t);out[j]=v==null?null:(flip?1-v:v);});return out;}
  function w6GenerateBinary(seed,difficulty){
    const n={Easy:6,Medium:8,Hard:12}[difficulty],r=rng(`${seed}:binary:v6`);
    if(difficulty==='Hard'){const src=pick(W6_BINARY_HARD_BANK,r),t=Math.floor(r()*8),flip=r()>.5,solution=w6BinaryTransform(src.solution,n,t,flip),givens=w6BinaryTransform(src.givens,n,t,flip),removed=givens.filter(v=>v==null).length;return {size:n,solution,givens,generatorVersion:W6_VERSION,certifiedUnique:true,contentCertified:true,difficultyScore:n*10+removed/n,difficultyMetrics:{removed,givens:n*n-removed,removalRatio:+(removed/(n*n)).toFixed(3),sourceBank:W6_BINARY_HARD_BANK.length}};}
    const solution=generateBinarySolution(n,r),givens=[...solution],cells=shuffle(Array.from({length:n*n},(_,i)=>i),r),ratio={Easy:.38,Medium:.50}[difficulty],target=Math.floor(n*n*ratio);let removed=0;for(const i of cells){const old=givens[i];givens[i]=null;if(countBinarySolutions(givens,n,2)===1){removed++;if(removed>=target)break;}else givens[i]=old;}return {size:n,solution,givens,generatorVersion:W6_VERSION,certifiedUnique:true,difficultyScore:n*10+removed/n,difficultyMetrics:{removed,givens:n*n-removed,removalRatio:+(removed/(n*n)).toFixed(3)}};
  }
  binaryGame.generatorVersion=W6_VERSION;binaryGame.sizes={Easy:6,Medium:8,Hard:12};
  binaryGame.create=async function(seed,difficulty='Medium'){const puzzle=w6GenerateBinary(seed,difficulty);return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle,state:{board:[...puzzle.givens],selected:puzzle.givens.findIndex(v=>v===null),history:[]}};};
  const w6BinaryOldRender=binaryGame.render.bind(binaryGame);
  binaryGame.render=function(a){w6BinaryOldRender(a);const n=a.puzzle.size,i=a.state.selected,r=Math.floor(i/n),c=i%n,row=a.state.board.slice(r*n,r*n+n),col=Array.from({length:n},(_,rr)=>a.state.board[rr*n+c]),fmt=x=>`${x.filter(v=>v===0).length} zero · ${x.filter(v=>v===1).length} one · ${x.filter(v=>v===null).length} open`;const panel=document.createElement('div');panel.className='w6-info-panel';panel.innerHTML=`<strong>${coord(i,n)}</strong><span>Row ${r+1}: ${fmt(row)}</span><span>Column ${c+1}: ${fmt(col)}</span><span>Target per line: ${n/2} / ${n/2}</span>`;$('.binary-board')?.after(panel);$('.game-board-wrap')?.classList.add('w6-stack-host');};

  // ----- Unequal v6: 7x7 Hard and live candidate/bounds panel -----
  function w6GenerateUnequal(seed,difficulty){const cfg={Easy:[4,.55,.60],Medium:[5,.42,.70],Hard:[7,.28,.70]}[difficulty],n=cfg[0],r=rng(`${seed}:unequal:v6`),solution=latinSolution(n,r),relations=unequalRelations(solution,n,r,cfg[1]),givens=[...solution],order=shuffle(Array.from({length:n*n},(_,i)=>i),r),target=Math.round(n*n*cfg[2]);let removed=0;for(const i of order){const old=givens[i];givens[i]=null;if(countUnequalSolutions(givens,n,relations,2)===1){removed++;if(removed>=target)break;}else givens[i]=old;}const relPerCell=relations.length/(n*n);return {n,solution,givens,relations,generatorVersion:W6_VERSION,certifiedUnique:true,difficultyScore:+(n*10+removed/n+relPerCell*3).toFixed(2),difficultyMetrics:{removed,relations:relations.length,relationDensity:+relPerCell.toFixed(2)}};}
  unequalGame.generatorVersion=W6_VERSION;
  unequalGame.create=async function(seed,difficulty='Medium'){const puzzle=w6GenerateUnequal(seed,difficulty);return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle,state:{board:[...puzzle.givens],selected:puzzle.givens.findIndex(v=>v==null),history:[],mistakes:0}};};
  const w6UnequalOldRender=unequalGame.render.bind(unequalGame);
  unequalGame.render=function(a){w6UnequalOldRender(a);const i=a.state.selected,p=a.puzzle,b=a.state.board,opts=[];if(i>=0&&p.givens[i]==null)for(let v=1;v<=p.n;v++)if(unequalCandidateOK(b,p.n,p.relations,i,v))opts.push(v);const panel=document.createElement('div');panel.className='w6-info-panel';panel.innerHTML=`<strong>${coord(i,p.n)}</strong><span>Local candidates: ${opts.length?opts.join(', '):'none'}</span><span>${p.relations.filter(x=>x.a===i||x.b===i).length} adjacent inequalities</span>`;$('.unequal-wrap')?.after(panel)||$('.unequal-board')?.after(panel);$('.game-board-wrap')?.classList.add('w6-stack-host');};

  // ----- Arithmetic Cages v6: 7x7 Hard, quality-selected cages and combinations -----
  function w6ArithmeticQuality(cages){const singles=cages.filter(c=>c.cells.length===1).length,ops=new Set(cages.map(c=>c.op)),large=cages.filter(c=>c.cells.length>=3).length;return singles*9-ops.size*3-large*1.5+cages.length*.08;}
  function w6GenerateArithmetic(seed,difficulty){const n={Easy:4,Medium:5,Hard:7}[difficulty],solution=latinSolution(n,rng(`${seed}:arith-sol:v6`)),candidates=[];for(let k=0;k<18;k++){const r=rng(`${seed}:arith-cage:v6:${k}`),cages=buildCages(solution,n,r,difficulty==='Hard'?'Hard':difficulty);const count=countArithmeticSolutions({n,cages},2);if(count===1)candidates.push({cages,q:w6ArithmeticQuality(cages)});}if(!candidates.length){const r=rng(`${seed}:arith-fallback:v6`),cages=buildCages(solution,n,r,difficulty);while(countArithmeticSolutions({n,cages},2)!==1){const big=cages.filter(c=>c.cells.length>1).sort((a,b)=>b.cells.length-a.cells.length)[0];if(!big)break;const ix=cages.indexOf(big);cages.splice(ix,1,...big.cells.map(i=>({cells:[i],op:'=',target:solution[i]})));}candidates.push({cages,q:w6ArithmeticQuality(cages)});}candidates.sort((a,b)=>a.q-b.q);const cages=candidates[0].cages,singles=cages.filter(c=>c.cells.length===1).length;return {n,solution,cages,generatorVersion:W6_VERSION,certifiedUnique:true,difficultyScore:+(n*10+cages.length*.2+singles).toFixed(2),difficultyMetrics:{cages:cages.length,singletons:singles,operatorMix:[...new Set(cages.map(c=>c.op))]}};}
  arithmeticCagesGame.generatorVersion=W6_VERSION;
  arithmeticCagesGame.create=async function(seed,difficulty='Medium'){const puzzle=w6GenerateArithmetic(seed,difficulty);return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle,state:{board:Array(puzzle.n*puzzle.n).fill(null),selected:0,history:[],mistakes:0}};};
  const w6ArithOldRender=arithmeticCagesGame.render.bind(arithmeticCagesGame);
  arithmeticCagesGame.render=function(a){w6ArithOldRender(a);const i=a.state.selected,cage=a.puzzle.cages.find(c=>c.cells.includes(i));if(!cage)return;const tuples=validCageTuples(a.puzzle.n,cage.cells.length,cage.op,cage.target).filter(t=>cage.cells.every((idx,k)=>a.state.board[idx]==null||a.state.board[idx]===t[k]));const unique=[...new Set(tuples.map(t=>[...t].sort((x,y)=>x-y).join(',')))];const panel=document.createElement('div');panel.className='w6-info-panel';panel.innerHTML=`<strong>Cage ${cage.target}${cage.op}</strong><span>${cage.cells.length} cells · ${tuples.length} ordered possibilities</span><span>${unique.slice(0,8).join(' · ')}${unique.length>8?' …':''}</span>`;$('.arith-board')?.after(panel)||$('.cage-board')?.after(panel);$('.game-board-wrap')?.classList.add('w6-stack-host');};

  // ----- Dominoes v6: Double-7 Hard and inventory panel -----
  function w6GenerateDominoes(seed,difficulty){const max={Easy:4,Medium:6,Hard:7}[difficulty],[rows,cols]=dominoDims(max),r=rng(`${seed}:dominoes:v6`),keys=dominoKeys(max).map(k=>k.split('-').map(Number));for(let attempt=0;attempt<4200;attempt++){const tiling=randomizeDominoTiling(rows,cols,baseDominoTiling(rows,cols),r,320),pairs=shuffle(keys,r),grid=Array(rows*cols);tiling.forEach(([i,j],k)=>{let [x,y]=pairs[k];if(r()<.5)[x,y]=[y,x];grid[i]=x;grid[j]=y;});if(countDominoSolutions(rows,cols,grid,max,2)===1)return {rows,cols,max,grid,solution:tiling,generatorVersion:W6_VERSION,certifiedUnique:true,difficultyScore:max*12+rows*cols/8,difficultyMetrics:{pairs:keys.length,area:rows*cols,attempts:attempt+1}};}throw new Error('Domino v6 generation failed');}
  dominoesGame.generatorVersion=W6_VERSION;
  dominoesGame.create=async function(seed,difficulty='Medium'){const puzzle=w6GenerateDominoes(seed,difficulty);return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle,state:{partner:Array(puzzle.grid.length).fill(-1),selected:0,anchor:-1,history:[]}};};
  dominoesGame.render=function(a){const {rows,cols,grid}=a.puzzle,cells=grid.map((v,i)=>{const j=a.state.partner[i],paired=j>=0,dir=j===i+1?'right':j===i-1?'left':j===i+cols?'down':j===i-cols?'up':'';return `<button class="domino-cell ${paired?'paired':''} ${i===a.state.selected?'selected':''} ${i===a.state.anchor?'anchor':''}" data-domino="${i}"><strong>${v}</strong>${paired&&i<j?`<i class="domino-link ${dir}">${dir==='right'?'↔':'↕'}</i>`:''}</button>`}).join('');const used=new Set();for(let i=0;i<a.state.partner.length;i++){const j=a.state.partner[i];if(j>i)used.add([grid[i],grid[j]].sort((x,y)=>x-y).join('-'));}const inv=`<div class="domino-inventory">${dominoKeys(a.puzzle.max).map(k=>`<span class="${used.has(k)?'used':''}">${k.replace('-', '·')}</span>`).join('')}</div>`;main.innerHTML=baseGameShell(byId[this.id],a,`<div class="w6-board-stack"><div class="domino-board" style="grid-template-columns:repeat(${cols},1fr);aspect-ratio:${cols}/${rows}">${cells}</div>${inv}</div>`,`<div class="w6-meta"><span>${used.size}/${dominoKeys(a.puzzle.max).length} pairs used</span><span>Double-${a.puzzle.max}</span></div><div class="toolbar"><button data-domino-clear>Remove selected pair</button><button data-domino-undo>Undo</button></div>${a.completed?resultPanel(a,this,`<div><strong>0–${a.puzzle.max}</strong><span>Set</span></div>`):''}`);bindGameShell(this,a);this.bind(a);if(a.completed)bindResult(a,this);};

  // ----- Rectangles v6: aesthetics-scored generation + state-derived hints -----
  function w6RectAesthetic(n,solution,clues){let skinny=0,single=0,aspect=0;for(const x of solution){const a=x.h*x.w;if(a===1)single++;if(Math.min(x.h,x.w)===1&&Math.max(x.h,x.w)>=5)skinny++;aspect+=Math.max(x.h/x.w,x.w/x.h);}const ambiguity=rectangleCandidates(n,clues).reduce((s,x)=>s+x.length,0);return single*30+skinny*9+aspect*.35+ambiguity*.12;}
  function w6GenerateRectangles(seed,difficulty){const n={Easy:6,Medium:7,Hard:8}[difficulty],target={Easy:8,Medium:10,Hard:12}[difficulty],r=rng(`${seed}:rect:v6`),pool=[];for(let attempt=0;attempt<360;attempt++){const solution=splitRectangles(n,r,target);if(solution.filter(x=>x.h*x.w===1).length>1)continue;const clues=solution.map(x=>{const cells=[];for(let rr=x.r;rr<x.r+x.h;rr++)for(let cc=x.c;cc<x.c+x.w;cc++)cells.push(rr*n+cc);return {cell:pick(cells,r),area:x.h*x.w};});if(countRectangleSolutions(n,clues,2)!==1)continue;pool.push({n,clues,solution,quality:w6RectAesthetic(n,solution,clues)});if(pool.length>=24)break;}if(!pool.length){const p=generateRectangles(`${seed}:fallback`,difficulty);pool.push({...p,quality:w6RectAesthetic(p.n,p.solution,p.clues)});}pool.sort((a,b)=>a.quality-b.quality);const q=difficulty==='Hard'?pool[Math.min(pool.length-1,Math.floor(pool.length*.55))]:pool[0];return {...q,generatorVersion:W6_VERSION,certifiedUnique:true,difficultyScore:+(n*10+q.quality).toFixed(2),difficultyMetrics:{candidateTotal:rectangleCandidates(n,q.clues).reduce((s,x)=>s+x.length,0),aestheticPenalty:+q.quality.toFixed(2),singletons:q.solution.filter(x=>x.h*x.w===1).length}};}
  function w6RectProof(a){const n=a.puzzle.n,cands=rectangleCandidates(n,a.puzzle.clues),placed=a.state.rects,used=placed.reduce((m,x)=>m|rectMask(n,x.r,x.c,x.h,x.w),0n),placedClues=new Set();for(const x of placed)for(let qi=0;qi<a.puzzle.clues.length;qi++){const q=a.puzzle.clues[qi],r=Math.floor(q.cell/n),c=q.cell%n;if(r>=x.r&&r<x.r+x.h&&c>=x.c&&c<x.c+x.w)placedClues.add(qi);}let best=null;for(let qi=0;qi<cands.length;qi++)if(!placedClues.has(qi)){const opts=cands[qi].filter(x=>(x.mask&used)===0n),q=a.puzzle.clues[qi];if(!opts.length)return {token:`rect-dead-${qi}`,focus:`Recheck clue ${q.area}.`,rule:'Every clue must fit one non-overlapping rectangle with exactly that area.',deduction:'No legal rectangle remains for this clue in the current partition.',reveal:'Undo a rectangle that blocks this clue.'};if(!best||opts.length<best.opts.length)best={qi,q,opts};}if(!best)return null;const dims=[...new Set(best.opts.map(x=>`${x.h}×${x.w}`))];const o=best.opts[0];return {token:`rect6-${best.qi}-${best.opts.length}`,focus:`Focus on clue ${best.q.area} at ${coord(best.q.cell,n)}.`,rule:`Its rectangle must have area ${best.q.area}, include this clue, include no other clue, and avoid placed rectangles.`,deduction:`Only ${best.opts.length} placement${best.opts.length===1?' remains':'s remain'} (${dims.join(', ')}).`,reveal:best.opts.length===1?`The forced rectangle spans rows ${o.r+1}–${o.r+o.h}, columns ${o.c+1}–${o.c+o.w}.`:`Start by testing the ${dims[0]} possibility around this clue.`};}
  rectanglesGame.generatorVersion=W6_VERSION;rectanglesGame.create=async function(seed,difficulty='Medium'){const puzzle=w6GenerateRectangles(seed,difficulty);return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle,state:{rects:[],anchor:null,selected:0,history:[]}};};rectanglesGame.hint=function(a){deliverProofHint(a,w6RectProof(a));};

  // ----- Loop v6: sparse clues, exact uniqueness and proof-based forced-edge hints -----
  function w6LoopData(p){const h=p.rows,w=p.cols,H=(h+1)*w,V=h*(w+1),E=H+V,edgeEnds=Array(E),cellEdges=Array.from({length:h*w},()=>[]),vertexEdges=Array.from({length:(h+1)*(w+1)},()=>[]);for(let r=0;r<=h;r++)for(let c=0;c<w;c++){const e=r*w+c,a=r*(w+1)+c,b=a+1;edgeEnds[e]=[a,b];vertexEdges[a].push(e);vertexEdges[b].push(e);if(r>0)cellEdges[(r-1)*w+c].push(e);if(r<h)cellEdges[r*w+c].push(e);}for(let r=0;r<h;r++)for(let c=0;c<=w;c++){const e=H+r*(w+1)+c,a=r*(w+1)+c,b=(r+1)*(w+1)+c;edgeEnds[e]=[a,b];vertexEdges[a].push(e);vertexEdges[b].push(e);if(c>0)cellEdges[r*w+c-1].push(e);if(c<w)cellEdges[r*w+c].push(e);}return {h,w,H,V,E,edgeEnds,cellEdges,vertexEdges};}
  function w6LoopSolve(p,limit=2,initial=null,nodeLimit=180000){const d=w6LoopData(p),x=initial?[...initial]:Array(d.E).fill(-1);let count=0,nodes=0,aborted=false;const assign=(e,v,q)=>{if(x[e]!==-1)return x[e]===v;x[e]=v;q.push(e);return true;};function prop(){let changed=true;while(changed){changed=false;for(let ci=0;ci<p.clues.length;ci++){const clue=p.clues[ci];if(clue==null)continue;const es=d.cellEdges[ci],line=es.filter(e=>x[e]===1).length,unk=es.filter(e=>x[e]===-1);if(line>clue||line+unk.length<clue)return false;if(line===clue)for(const e of unk){x[e]=0;changed=true;}else if(line+unk.length===clue)for(const e of unk){x[e]=1;changed=true;}}for(const es of d.vertexEdges){const line=es.filter(e=>x[e]===1).length,unk=es.filter(e=>x[e]===-1);if(line>2)return false;if(line===2){for(const e of unk){x[e]=0;changed=true;}}else if(line===1){if(!unk.length)return false;if(unk.length===1){x[unk[0]]=1;changed=true;}}else if(line===0&&unk.length===1){x[unk[0]]=0;changed=true;}}}return true;}function finalValid(){for(let ci=0;ci<p.clues.length;ci++){const clue=p.clues[ci];if(clue!=null&&d.cellEdges[ci].filter(e=>x[e]===1).length!==clue)return false;}const deg=Array(d.vertexEdges.length).fill(0),adj=Array.from({length:d.vertexEdges.length},()=>[]);let lines=0;for(let e=0;e<d.E;e++)if(x[e]===1){lines++;const [a,b]=d.edgeEnds[e];deg[a]++;deg[b]++;adj[a].push(b);adj[b].push(a);}const used=deg.map((v,i)=>v?i:-1).filter(i=>i>=0);if(!lines||used.some(i=>deg[i]!==2))return false;const seen=new Set([used[0]]),q=[used[0]];while(q.length){const v=q.pop();for(const n of adj[v])if(!seen.has(n)){seen.add(n);q.push(n);}}return seen.size===used.length;}function rec(){if(count>=limit||aborted)return;if(++nodes>nodeLimit){aborted=true;return;}const snap=[...x];if(!prop()){for(let i=0;i<x.length;i++)x[i]=snap[i];return;}let best=-1,score=-1;for(let e=0;e<d.E;e++)if(x[e]===-1){const [a,b]=d.edgeEnds[e],s=d.vertexEdges[a].filter(q=>x[q]===1).length+d.vertexEdges[b].filter(q=>x[q]===1).length+2*d.cellEdges.filter(es=>es.includes(e)).filter((_,ci)=>p.clues[ci]!=null).length;if(s>score){score=s;best=e;}}if(best<0){if(finalValid())count++;for(let i=0;i<x.length;i++)x[i]=snap[i];return;}for(const v of [1,0]){const before=[...x];x[best]=v;rec();for(let i=0;i<x.length;i++)x[i]=before[i];if(count>=limit||aborted)break;}for(let i=0;i<x.length;i++)x[i]=snap[i];}rec();return {count,nodes,aborted};}
  function w6GenerateLoop(seed,difficulty){let best=null;for(let base=0;base<3;base++){const full=generateLoopPuzzle(`${seed}:loop6:${base}`,difficulty),r=rng(`${seed}:loop6:remove:${base}`),clues=[...full.clues],order=shuffle(Array.from({length:clues.length},(_,i)=>i),r),ratio={Easy:.72,Medium:.55,Hard:.42}[difficulty],target=Math.ceil(clues.length*ratio);for(const i of order){if(clues.filter(x=>x!=null).length<=target)break;const old=clues[i];clues[i]=null;const cert=w6LoopSolve({...full,clues},2,null,90000);if(cert.count!==1||cert.aborted)clues[i]=old;}const p={...full,clues,generatorVersion:W6_VERSION,certifiedUnique:true},cert=w6LoopSolve(p,2,null,160000);if(cert.count===1&&!cert.aborted){p.difficultyMetrics={clues:clues.filter(x=>x!=null).length,totalClues:clues.length,solverNodes:cert.nodes};p.difficultyScore=+(p.rows*10+(1-p.difficultyMetrics.clues/p.difficultyMetrics.totalClues)*40+Math.log2(cert.nodes+1)*2).toFixed(2);if(!best||p.difficultyMetrics.clues<best.difficultyMetrics.clues)best=p;}}if(!best)throw new Error('Loop v6 sparse generation failed');return best;}
  function w6LoopValidate(p,state){if(!Array.isArray(state.h)||!Array.isArray(state.v)||state.h.length!==(p.rows+1)*p.cols||state.v.length!==p.rows*(p.cols+1)||![...state.h,...state.v].every(v=>Number.isInteger(v)&&v>=0&&v<=2))return false;const clues=p.clues,clone={...p,clues:clues.map(x=>x==null?null:x)};const old=clone.clues;for(let r=0;r<p.rows;r++)for(let c=0;c<p.cols;c++){const clue=old[r*p.cols+c];if(clue==null)continue;const count=(state.h[r*p.cols+c]===1)+(state.h[(r+1)*p.cols+c]===1)+(state.v[r*(p.cols+1)+c]===1)+(state.v[r*(p.cols+1)+c+1]===1);if(count!==clue)return false;}const p2={...p,clues:Array(p.rows*p.cols).fill(0)},h=p.rows,w=p.cols,H=state.h,V=state.v,vn=(h+1)*(w+1),adj=Array.from({length:vn},()=>[]),deg=Array(vn).fill(0);let ec=0;const add=(a,b)=>{adj[a].push(b);adj[b].push(a);deg[a]++;deg[b]++;ec++;};for(let r=0;r<=h;r++)for(let c=0;c<w;c++)if(H[r*w+c]===1)add(r*(w+1)+c,r*(w+1)+c+1);for(let r=0;r<h;r++)for(let c=0;c<=w;c++)if(V[r*(w+1)+c]===1)add(r*(w+1)+c,(r+1)*(w+1)+c);const used=deg.map((d,i)=>d?i:-1).filter(i=>i>=0);if(!ec||used.some(i=>deg[i]!==2))return false;const seen=new Set([used[0]]),q=[used[0]];while(q.length){const x=q.pop();for(const y of adj[x])if(!seen.has(y)){seen.add(y);q.push(y);}}return seen.size===used.length;}
  function w6LoopInitialFromState(a){const d=w6LoopData(a.puzzle),x=Array(d.E).fill(-1);a.state.h.forEach((v,i)=>x[i]=v===1?1:v===2?0:-1);a.state.v.forEach((v,i)=>x[d.H+i]=v===1?1:v===2?0:-1);return x;}
  function w6LoopProof(a){const p=a.puzzle,d=w6LoopData(p),x=w6LoopInitialFromState(a);for(let ci=0;ci<p.clues.length;ci++){const clue=p.clues[ci];if(clue==null)continue;const es=d.cellEdges[ci],line=es.filter(e=>x[e]===1).length,unk=es.filter(e=>x[e]===-1);if(line===clue&&unk.length){const e=unk[0];return {token:`loop6-block-${ci}`,focus:`Inspect clue ${clue} at ${coord(ci,p.cols)}.`,rule:`Exactly ${clue} surrounding edges belong to the loop.`,deduction:'Its required number of line edges is already present, so the remaining surrounding edges are blocked.',reveal:`Mark one remaining edge around this clue with ×.`};}if(line+unk.length===clue&&unk.length){return {token:`loop6-line-${ci}`,focus:`Inspect clue ${clue} at ${coord(ci,p.cols)}.`,rule:`Exactly ${clue} surrounding edges belong to the loop.`,deduction:'Every remaining unknown edge around this clue is required to reach the clue count.',reveal:'Draw a line on one of those remaining edges.'};}}for(let e=0;e<d.E;e++)if(x[e]===-1){const a0=[...x];a0[e]=0;const c0=w6LoopSolve(p,1,a0,45000),a1=[...x];a1[e]=1,c1=w6LoopSolve(p,1,a1,45000);if(!c0.aborted&&!c1.aborted&&c0.count!==c1.count){const forced=c1.count>0?1:0;return {token:`loop6-exact-${e}-${forced}`,focus:'Focus on an edge whose two possibilities can be tested against all current constraints.',rule:'A candidate edge state is impossible if it leaves no complete single-loop solution.',deduction:`Exact constraint checking eliminates ${forced?'blocking':'drawing'} this edge.`,reveal:`This edge must be ${forced?'a line':'blocked'}.`};}}return {token:'loop6-struct',focus:'Look for a numbered cell or vertex with only one undecided edge.',rule:'Clue counts and vertex degree 0-or-2 constraints create the strongest local deductions.',deduction:'No immediate local forced edge was found in the bounded proof pass.',reveal:'Continue from the most constrained clue rather than guessing.'};}
  loopGame.generatorVersion=W6_VERSION;loopGame.create=async function(seed,difficulty='Medium'){const puzzle=w6GenerateLoop(seed,difficulty);return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle,state:{h:Array(puzzle.horiz.length).fill(0),v:Array(puzzle.vert.length).fill(0),history:[]}};};
  loopGame.render=function(a){const h=a.puzzle.rows,w=a.puzzle.cols,items=[];for(let rr=0;rr<2*h+1;rr++)for(let cc=0;cc<2*w+1;cc++){if(rr%2===0&&cc%2===0)items.push('<span class="loop-vertex"></span>');else if(rr%2===0){const r=rr/2,c=(cc-1)/2,i=r*w+c,v=a.state.h[i];items.push(`<button class="loop-edge loop-edge--h ${v===1?'line':v===2?'blocked':''}" data-loop-edge="h:${i}" aria-label="Horizontal edge row ${r+1}, column ${c+1}">${v===2?'×':''}</button>`);}else if(cc%2===0){const r=(rr-1)/2,c=cc/2,i=r*(w+1)+c,v=a.state.v[i];items.push(`<button class="loop-edge loop-edge--v ${v===1?'line':v===2?'blocked':''}" data-loop-edge="v:${i}" aria-label="Vertical edge row ${r+1}, column ${c+1}">${v===2?'×':''}</button>`);}else{const r=(rr-1)/2,c=(cc-1)/2,v=a.puzzle.clues[r*w+c];items.push(`<span class="loop-clue ${v==null?'empty':''}">${v==null?'':v}</span>`);}}const colTemplate=Array.from({length:2*w+1},(_,i)=>i%2?'minmax(32px,1fr)':'24px').join(' '),rowTemplate=Array.from({length:2*h+1},(_,i)=>i%2?'minmax(32px,1fr)':'24px').join(' '),cl=a.puzzle.clues.filter(x=>x!=null).length,board=`<div class="w6-meta"><span>${cl}/${h*w} clues</span><span>Unique solution certified</span></div><div class="loop-board" style="grid-template-columns:${colTemplate};grid-template-rows:${rowTemplate}">${items.join('')}</div>`;main.innerHTML=baseGameShell(byId[this.id],a,`<div class="w6-board-stack">${board}</div>`,`<div class="toolbar"><button data-loop-undo>Undo</button></div>${a.completed?resultPanel(a,this,`<div><strong>${cl}</strong><span>Clues</span></div>`):''}`);bindGameShell(this,a);this.bind(a);if(a.completed)bindResult(a,this);};
  loopGame.bind=function(a){
    let dragging=false,target=1,visited=new Set(),changed=false;
    const apply=el=>{if(!el||visited.has(el.dataset.loopEdge)||a.completed)return;visited.add(el.dataset.loopEdge);const [t,s]=el.dataset.loopEdge.split(':'),i=+s,arr=t==='h'?a.state.h:a.state.v,old=arr[i];if(old===target)return;a.state.history.push([t,i,old]);arr[i]=target;changed=true;};
    const end=async()=>{if(!dragging)return;dragging=false;visited.clear();if(!changed)return;changed=false;if(w6LoopValidate(a.puzzle,a.state))await finishActive(a,{size:`${a.puzzle.cols}x${a.puzzle.rows}`,clues:a.puzzle.clues.filter(x=>x!=null).length});else await saveActive(a);this.render(a);};
    $$('[data-loop-edge]').forEach(el=>{el.onpointerdown=e=>{e.preventDefault();const [t,s]=el.dataset.loopEdge.split(':'),arr=t==='h'?a.state.h:a.state.v,old=arr[+s];target=old===0?1:old===1?2:0;dragging=true;visited=new Set();changed=false;apply(el);};el.onpointerenter=()=>{if(dragging)apply(el)};});
    document.onpointerup=end;document.onpointercancel=end;$('[data-loop-undo]').onclick=()=>this.undo(a);
  };
  loopGame.hint=function(a){deliverProofHint(a,w6LoopProof(a));};
  // Override completion call used by the inherited bind implementation.
  const w6LoopOldSave=loopGame.save.bind(loopGame);loopGame.save=w6LoopOldSave;

  // ----- Untangle v6: larger graphs, optimized scramble and structural guidance -----
  function w6NodeCrossingCounts(edges,pos){const counts=Array(pos.length).fill(0);for(let i=0;i<edges.length;i++)for(let j=i+1;j<edges.length;j++){const [a,b]=edges[i],[c,d]=edges[j];if(a===c||a===d||b===c||b===d)continue;if(segmentsCross(pos[a],pos[b],pos[c],pos[d])){counts[a]++;counts[b]++;counts[c]++;counts[d]++;}}return counts;}
  function w6GenerateUntangle(seed,difficulty){const n={Easy:10,Medium:16,Hard:22}[difficulty],r=rng(`${seed}:untangle:v6`),edges=new Set();for(let i=0;i<n;i++)addEdgeSet(edges,i,(i+1)%n);function tri(ids){if(ids.length<=3)return;const k=1+Math.floor(r()*(ids.length-2));addEdgeSet(edges,ids[0],ids[k]);addEdgeSet(edges,ids[k],ids.at(-1));tri(ids.slice(0,k+1));tri(ids.slice(k));}tri(Array.from({length:n},(_,i)=>i));const list=[...edges].map(s=>s.split('-').map(Number)),solved=Array.from({length:n},(_,i)=>{const a=-Math.PI/2+2*Math.PI*i/n,rad=.36+.055*Math.sin(i*2.399);return {x:.5+rad*Math.cos(a),y:.5+rad*Math.sin(a)}});let best=null;for(let t=0;t<140;t++){const perm=shuffle(Array.from({length:n},(_,i)=>i),r),pos=perm.map(i=>({...solved[i]})),cross=untangleCrossings(list,pos);if(!best||cross>best.cross)best={pos,cross};}return {n,edges:list,initial:best.pos,startCrossings:best.cross,generatorVersion:W6_VERSION,difficultyScore:+(n*4+best.cross*.7).toFixed(2),difficultyMetrics:{edges:list.length,startCrossings:best.cross,maxDegree:Math.max(...Array.from({length:n},(_,i)=>list.filter(e=>e.includes(i)).length))}};}
  untangleGame.generatorVersion=W6_VERSION;untangleGame.create=async function(seed,difficulty='Medium'){const puzzle=w6GenerateUntangle(seed,difficulty);return {gameId:this.id,seed,difficulty,createdAt:Date.now(),updatedAt:Date.now(),startedAt:Date.now(),elapsedMs:0,puzzle,state:{positions:puzzle.initial.map(p=>({...p})),selected:0,history:[],moves:0,bestCrossings:puzzle.startCrossings}};};
  const w6UntOldRender=untangleGame.render.bind(untangleGame),w6UntOldBind=untangleGame.bind.bind(untangleGame);
  untangleGame.render=function(a){a.state.bestCrossings??=untangleCrossings(a.puzzle.edges,a.state.positions);w6UntOldRender(a);const c=untangleCrossings(a.puzzle.edges,a.state.positions),panel=document.createElement('div');panel.className='w6-meta';panel.innerHTML=`<span>Started ${a.puzzle.startCrossings} crossings</span><span>Best ${a.state.bestCrossings}</span><span>${a.puzzle.edges.length} edges</span>`;$('.crossing-count')?.after(panel);};
  untangleGame.bind=function(a){w6UntOldBind(a);};
  untangleGame.updateDom=function(a){const svg=$('.untangle-svg');if(!svg)return;a.puzzle.edges.forEach(([x,y],i)=>{const l=svg.querySelector(`[data-edge="${i}"]`),A=a.state.positions[x],B=a.state.positions[y];if(l){l.setAttribute('x1',A.x*100);l.setAttribute('y1',A.y*100);l.setAttribute('x2',B.x*100);l.setAttribute('y2',B.y*100);}});a.state.positions.forEach((p,i)=>{const g=svg.querySelector(`[data-node="${i}"]`);if(g){const c=g.querySelector('circle'),t=g.querySelector('text');c.setAttribute('cx',p.x*100);c.setAttribute('cy',p.y*100);t.setAttribute('x',p.x*100);t.setAttribute('y',p.y*100+.9);}});const count=untangleCrossings(a.puzzle.edges,a.state.positions);a.state.bestCrossings=Math.min(a.state.bestCrossings??count,count);const el=$('.crossing-count strong');if(el)el.textContent=count;svg.querySelectorAll('[data-edge]').forEach(l=>l.classList.remove('crossing'));for(let i=0;i<a.puzzle.edges.length;i++)for(let j=i+1;j<a.puzzle.edges.length;j++){const [x,y]=a.puzzle.edges[i],[u,v]=a.puzzle.edges[j];if(x===u||x===v||y===u||y===v)continue;if(segmentsCross(a.state.positions[x],a.state.positions[y],a.state.positions[u],a.state.positions[v])){svg.querySelector(`[data-edge="${i}"]`)?.classList.add('crossing');svg.querySelector(`[data-edge="${j}"]`)?.classList.add('crossing');}}};
  untangleGame.hint=function(a){const counts=w6NodeCrossingCounts(a.puzzle.edges,a.state.positions),node=counts.indexOf(Math.max(...counts));if(node<0||counts[node]===0)return toast('No crossings remain.');const current=a.state.positions[node],candidates=[];for(let rr=1;rr<=4;rr++)for(let cc=1;cc<=4;cc++){const p={x:cc/5,y:rr/5},pos=a.state.positions.map(q=>({...q}));pos[node]=p;candidates.push({p,c:untangleCrossings(a.puzzle.edges,pos)});}candidates.sort((x,y)=>x.c-y.c);const best=candidates[0],dx=best.p.x-current.x,dy=best.p.y-current.y,horiz=Math.abs(dx)>.06?(dx>0?'right':'left'):'',vert=Math.abs(dy)>.06?(dy>0?'down':'up'):'',dir=[vert,horiz].filter(Boolean).join(' and ')||'into nearby open space';a.state.selected=node;deliverProofHint(a,{token:`unt6-${node}-${counts[node]}`,focus:`Node ${node+1} participates in ${counts[node]} current crossings.`,rule:'Moving a high-conflict node changes every edge attached to it at once.',deduction:`A coarse geometric search finds fewer crossings by moving this node ${dir}.`,reveal:`Try node ${node+1} around ${Math.round(best.p.x*100)}% across, ${Math.round(best.p.y*100)}% down; this is structural guidance, not a hidden target position.`});this.render(a);};


  // ---------- Wave 7: global S+ hint and interaction parity ----------
  // Final uniformity pass: every remaining legacy hint is progressive and either
  // derived from the current state or deliberately staged when editorial answer
  // knowledge is unavoidable (word/content games). No hint mutates the board.
  const W7_VERSION=7;

  function w7Progressive(a,d){return deliverProofHint(a,d);}
  function w7Quadrant(i,n){const r=Math.floor(i/n),c=i%n;return `${r<n/2?'upper':'lower'}-${c<n/2?'left':'right'}`;}

  fiveLetters.hint=function(a){
    if(a.completed)return;
    const answer=a.puzzle.answer,guesses=a.state.guesses||[],confirmed=Array(5).fill(false),seen=new Set();
    for(const g of guesses){g.word.split('').forEach((ch,i)=>{seen.add(ch);if(g.states?.[i]==='correct')confirmed[i]=true;});}
    let i=confirmed.findIndex(x=>!x);if(i<0)i=0;
    const unseen=[...answer].filter(ch=>!seen.has(ch)),letter=unseen[0]||answer[i];
    w7Progressive(a,{token:`w7-five-${guesses.length}-${i}-${letter}`,focus:`Review the ${5-confirmed.filter(Boolean).length} position${5-confirmed.filter(Boolean).length===1?'':'s'} that are not confirmed yet.`,rule:'Correct tiles fix a position; present tiles must move elsewhere; duplicate letters are counted only as many times as they occur in the answer.',deduction:unseen.length?`At least one answer letter has not appeared in any submitted guess yet.`:`All answer letters have appeared somewhere; position information is now more useful than introducing a new letter.`,reveal:`One useful fact: ${letter} belongs in the answer${answer[i]===letter?` at position ${i+1}`:''}.`});
  };

  groupsGame.hint=function(a){
    const g=a.puzzle.groups.find(x=>!a.state.solved.includes(x.id));if(!g)return;
    const remaining=g.members.filter(w=>!a.state.selected?.includes(w));
    w7Progressive(a,{token:`w7-groups-${g.id}`,focus:`Start with ${g.members[0]}. Look for words that share one precise relationship with it.`,rule:'A valid group contains exactly four items linked by the same category, phrase pattern, or wordplay rule.',deduction:`${g.members[1]} belongs with ${g.members[0]}; use that pair to test a common relationship.`,reveal:`Their group is “${g.label}”. The remaining members are ${g.members.slice(2).join(' and ')}.`});
  };

  wordSearch.hint=function(a){
    const w=a.puzzle.words.find(x=>!a.state.found.includes(x));if(!w)return;const path=a.puzzle.paths[w],start=path[0],n=a.puzzle.size;
    w7Progressive(a,{token:`w7-search-${w}`,focus:`Look for the unfound ${w.length}-letter word ${w}.`,rule:'Words run in a straight line horizontally, vertically, or diagonally; harder boards may also use reverse directions.',deduction:`Its first cell lies in the ${w7Quadrant(start,n)} area of the grid.`,reveal:`${w} starts at row ${Math.floor(start/n)+1}, column ${start%n+1}.`});
  };

  anagramsGame.hint=function(a){
    const answer=(a.puzzle.answer||anagramsGame.answers(a)[0]||'').toUpperCase();if(!answer)return;
    const current=anagramsGame.current(a),vowels=new Set(['A','E','I','O','U']),vowelPositions=[...answer].map((c,i)=>vowels.has(c)?i+1:null).filter(Boolean),pattern=[...answer].map(c=>vowels.has(c)?'V':'C').join(''),counts={};
    for(const c of answer)counts[c]=(counts[c]||0)+1;
    const repeats=Object.entries(counts).filter(([,n])=>n>1).map(([c,n])=>`${c}×${n}`),correct=[...current].filter((c,i)=>c===answer[i]).length,center=Math.floor((answer.length-1)/2);
    const anchor=[...answer].map((c,i)=>({c,i,score:(counts[c]===1?2:0)+('JQXZVKWY'.includes(c)?3:0)-Math.abs(i-center)*.1})).sort((x,y)=>y.score-x.score)[0],chunkLen=Math.min(3,answer.length),chunkStart=Math.max(0,Math.min(answer.length-chunkLen,anchor.i-1)),chunk=answer.slice(chunkStart,chunkStart+chunkLen);
    const repeatHint=repeats.length?` Repeated letters: ${repeats.join(', ')}.`:' It has no repeated letters.';
    const focus=current.length?`Of the ${current.length} letter${current.length===1?'':'s'} you have placed, ${correct} ${correct===1?'is':'are'} already in the intended position. The answer has ${vowelPositions.length} vowel${vowelPositions.length===1?'':'s'}.${repeatHint}`:`This ${answer.length}-letter answer has ${vowelPositions.length} vowel${vowelPositions.length===1?'':'s'} and ${answer.length-vowelPositions.length} consonant${answer.length-vowelPositions.length===1?'':'s'}.${repeatHint}`;
    w7Progressive(a,{token:`w8-ana-${a.puzzle.contentId}-${current}-${answer}`,focus,rule:`Its vowel/consonant pattern is ${pattern}. Vowels occupy position${vowelPositions.length===1?'':'s'} ${vowelPositions.join(', ')||'none'}.`,deduction:`A useful anchor: position ${anchor.i+1} is ${anchor.c}.`,reveal:`A contiguous ${chunkLen}-letter chunk is ${chunk} at positions ${chunkStart+1}–${chunkStart+chunkLen}.`});
  };

  letterHiveGame.hint=function(a){const missing=a.puzzle.answers.filter(w=>!a.state.found.includes(w)).sort((x,y)=>y.length-x.length);if(!missing.length)return;const w=missing[0];w7Progressive(a,{token:`w7-hive-${w}`,focus:`There is still an unfound ${w.length}-letter word.`,rule:`Every word must include the center letter ${a.puzzle.center}, may reuse letters, and may use no letters outside the hive.`,deduction:`This word begins with ${w[0]}.`,reveal:`Its opening is ${w.slice(0,Math.min(2,w.length))}.`});};

  wordGridGame.hint=function(a){const missing=a.puzzle.answers.filter(w=>!a.state.found.includes(w)).sort((x,y)=>y.length-x.length);if(!missing.length)return;const w=missing[0],path=a.puzzle.paths?.[w]||[];w7Progressive(a,{token:`w7-grid-${w}`,focus:`Look for an unfound ${w.length}-letter word.`,rule:'Each next letter must be in a neighboring cell, including diagonals, and a cell cannot be reused inside one word.',deduction:path.length?`Its path begins in the ${w7Quadrant(path[0],a.puzzle.size)} area.`:`It begins with ${w[0]}.`,reveal:path.length?`Start at row ${Math.floor(path[0]/a.puzzle.size)+1}, column ${path[0]%a.puzzle.size+1} (${w[0]}).`:`The word starts ${w.slice(0,2)}.`});};

  themeTrailGame.hint=function(a){const w=a.puzzle.words.find(x=>!a.state.found.includes(x));if(!w)return;const j=a.puzzle.words.indexOf(w),path=a.puzzle.paths[j],start=path[0];w7Progressive(a,{token:`w7-trail-${a.puzzle.contentId}-${j}`,focus:`One remaining answer has ${w.length} letters and belongs to the theme “${a.puzzle.theme}”.`,rule:'Every answer traces neighboring cells without reusing a cell, and together the answers cover the whole board.',deduction:`This trail begins in the ${w7Quadrant(start,5)} area with the letter ${w[0]}.`,reveal:`Start at row ${Math.floor(start/5)+1}, column ${start%5+1}.`});};

  wordPiecesGame.hint=function(a){const w=a.puzzle.answers.find(x=>!a.state.found.includes(x));if(!w)return;const pieces=a.puzzle.pieces.filter(p=>w.includes(p)),first=pieces.find(p=>w.startsWith(p))||w.slice(0,2);w7Progressive(a,{token:`w7-pieces-${w}`,focus:`One remaining compound has ${w.length} letters.`,rule:'Use distinct chunk tiles in the exact order they appear in the finished word.',deduction:`The word starts with the chunk ${first}.`,reveal:`A valid target is ${w}.`});};

  miniCrosswordGame.hint=function(a){const e=crosswordEntry(a);if(!e)return;const unsolved=e.cells.filter(i=>a.state.board[i]!==a.puzzle.solution[i]),i=unsolved[0]??e.cells[0],pos=e.cells.indexOf(i),letter=a.puzzle.solution[i];w7Progressive(a,{token:`w7-cross-${e.number}-${e.direction}-${i}`,focus:`Stay with ${e.direction} ${e.number}: “${e.clue}”.`,rule:'Crossing entries share letters, so already-correct crossings constrain the remaining squares.',deduction:`The unresolved square at position ${pos+1} of this answer is a useful next target.`,reveal:`That square is ${letter}.`});};

  cryptogramGame.hint=function(a){const unresolved=[...new Set(a.puzzle.cipher.match(/[A-Z]/g)||[])].filter(c=>a.state.mapping[c]!==a.puzzle.correct[c]);if(!unresolved.length)return;unresolved.sort((x,y)=>a.puzzle.cipher.split(y).length-a.puzzle.cipher.split(x).length);const c=unresolved[0],plain=a.puzzle.correct[c],freq=(a.puzzle.cipher.match(new RegExp(c,'g'))||[]).length;w7Progressive(a,{token:`w7-crypto-${c}`,focus:`Focus on cipher letter ${c}; it appears ${freq} time${freq===1?'':'s'}.`,rule:'A monoalphabetic substitution is one-to-one: each cipher letter maps to one plaintext letter, and no plaintext letter can belong to two cipher symbols.',deduction:'Use its repeated word patterns and your existing mappings to constrain this symbol before assigning another rare letter.',reveal:`${c} maps to ${plain}.`});};

  lightsOut.hint=function(a){const q=solveLightsOut(a.state.board,a.puzzle.n);if(!q.solvable)return w7Progressive(a,{token:'w7-light-dead',focus:'The current light pattern is inconsistent with the normal solution space.',rule:'Each press toggles one fixed cross-shaped set of cells, so the board is a linear system over parity.',deduction:'Undoing a recent move can restore a solvable state.',reveal:'Undo one move and request another hint.'});if(!q.optimalPresses.length)return toast('The board is already solved.');const i=q.optimalPresses[0],n=a.puzzle.n;w7Progressive(a,{token:`w7-light-${a.state.board.join('')}`,focus:`The current board has an optimal solution in ${q.optimalPresses.length} press${q.optimalPresses.length===1?'':'es'}.`,rule:'Only the parity of presses matters: pressing a cell twice cancels itself.',deduction:`One optimal solution includes a press in ${w7Quadrant(i,n)}.`,reveal:`Press row ${Math.floor(i/n)+1}, column ${i%n+1}.`});};

  function w7SlideHeuristic(board,n){let h=0;for(let i=0;i<board.length;i++){const v=board[i];if(!v)continue;const goal=v-1;h+=Math.abs(Math.floor(i/n)-Math.floor(goal/n))+Math.abs(i%n-goal%n);}return h;}
  function w7SlideExact3(board){const start=board.join(','),goal='1,2,3,4,5,6,7,8,0';if(start===goal)return null;const q=[board.slice()],seen=new Set([start]),first=new Map([[start,null]]);for(let h=0;h<q.length&&h<200000;h++){const b=q[h],blank=b.indexOf(0),r=Math.floor(blank/3),c=blank%3,ns=[];if(r)ns.push(blank-3);if(r<2)ns.push(blank+3);if(c)ns.push(blank-1);if(c<2)ns.push(blank+1);for(const i of ns){const x=b.slice();[x[blank],x[i]]=[x[i],x[blank]];const k=x.join(',');if(seen.has(k))continue;seen.add(k);first.set(k,first.get(b.join(','))??b[i]);if(k===goal)return first.get(k);q.push(x);}}return null;}
  slidingTiles.hint=function(a){const n=a.puzzle.n,blank=a.state.board.indexOf(0),opts=this.neighbors(blank,n);let tile=null,exact=false;if(n===3){tile=w7SlideExact3(a.state.board);exact=tile!=null;}if(tile==null){let best=Infinity;for(const i of opts){const b=[...a.state.board];[b[blank],b[i]]=[b[i],b[blank]];const h=w7SlideHeuristic(b,n);if(h<best){best=h;tile=a.state.board[i];}}}w7Progressive(a,{token:`w7-slide-${a.state.board.join('-')}`,focus:`The blank has ${opts.length} legal neighboring moves.`,rule:n===3?'For 3×3, the hint searches the exact shortest path to the solved state.':'For larger boards, preserve already-correct structure while reducing Manhattan displacement.',deduction:exact?'The exact shortest route begins with one specific neighboring tile.':`A locally strongest move reduces the board's distance estimate.`,reveal:`Move tile ${tile} into the blank.`});};

  numberPathGame.hint=function(a){const n=a.puzzle.size,end=a.state.path[a.state.path.length-1],r=Math.floor(end/n),c=end%n,candidates=[[r-1,c],[r+1,c],[r,c-1],[r,c+1]].filter(([rr,cc])=>rr>=0&&rr<n&&cc>=0&&cc<n).map(([rr,cc])=>rr*n+cc).filter(i=>pathLegalNeighbor(a,i)&&!a.state.path.includes(i));const forced=candidates.length===1?candidates[0]:null;w7Progressive(a,{token:`w7-path-${a.state.path.join('-')}`,focus:`The current endpoint has ${candidates.length} legal extension${candidates.length===1?'':'s'}.`,rule:'The path must visit every cell exactly once while reaching checkpoints in order; creating an isolated unvisited pocket is fatal.',deduction:forced!==null?`Only one neighboring cell can legally extend the path right now.`:'Before choosing, prefer a move that leaves every remaining unvisited region connected to the future path.',reveal:forced!==null?`Extend to row ${Math.floor(forced/n)+1}, column ${forced%n+1}.`:'No single move is locally forced; inspect which candidate would cut off the fewest unvisited cells.'});};

  function w7NetworkMismatch(a,i,masks){const n=a.puzzle.n,r=Math.floor(i/n),c=i%n,m=masks[i],out=[];for(const [bit,dr,dc,opp,name] of [[NET_N,-1,0,NET_S,'north'],[NET_E,0,1,NET_W,'east'],[NET_S,1,0,NET_N,'south'],[NET_W,0,-1,NET_E,'west']]){const rr=r+dr,cc=c+dc;if(m&bit){if(rr<0||cc<0||rr>=n||cc>=n)out.push(`${name} border leak`);else if(!(masks[rr*n+cc]&opp))out.push(`${name} connector mismatch`);}else if(rr>=0&&cc>=0&&rr<n&&cc<n&&(masks[rr*n+cc]&opp))out.push(`${name} neighbor points into this tile`);}return out;}
  networkGame.hint=function(a){const masks=networkCurrentMasks(a),n=a.puzzle.n;let i=-1,reason=[];for(let j=0;j<masks.length;j++){const m=w7NetworkMismatch(a,j,masks);if(m.length){i=j;reason=m;break;}}if(i>=0){a.state.selected=i;let best=null;for(let d=1;d<=3;d++){const trial=[...a.state.rotations];trial[i]=(trial[i]+d)%4;const tm=a.puzzle.solutionMasks.map((m,k)=>rotateMask(m,trial[k])),bad=w7NetworkMismatch({...a,state:{...a.state,rotations:trial}},i,tm).length;if(!best||bad<best.bad)best={d,bad};}w7Progressive(a,{token:`w7-net-local-${i}-${reason.join('|')}`,focus:`Inspect ${coord(i,n)}; it currently has ${reason.join(' and ')}.`,rule:'Every connector must meet an opposite connector on the adjacent tile, and no connector may point off the board.',deduction:`This tile violates ${reason.length} local connector constraint${reason.length===1?'':'s'}.`,reveal:best&&best.bad<reason.length?`Rotate this tile ${best.d===3?'left':`${best.d} quarter-turn${best.d===1?'':'s'} right`} to reduce the local conflict.`:'Reorient this tile or its neighbor until all touching connectors agree.'});this.render(a);return;}const seen=new Set([0]),q=[0];while(q.length){const x=q.pop(),rr=Math.floor(x/n),cc=x%n,m=masks[x];for(const [bit,dr,dc,opp] of [[NET_N,-1,0,NET_S],[NET_E,0,1,NET_W],[NET_S,1,0,NET_N],[NET_W,0,-1,NET_E]])if(m&bit){const r2=rr+dr,c2=cc+dc;if(r2>=0&&c2>=0&&r2<n&&c2<n){const y=r2*n+c2;if((masks[y]&opp)&&!seen.has(y)){seen.add(y);q.push(y);}}}}if(seen.size<n*n){const i=[...Array(n*n).keys()].find(x=>seen.has(x)&&rcNeighbors(x,n).some(y=>!seen.has(y)));if(i!=null)a.state.selected=i;w7Progressive(a,{token:`w7-net-connect-${seen.size}`,focus:`All local connectors match, but only ${seen.size}/${n*n} tiles are in one connected component.`,rule:'A solved Network must form one globally connected network, not several closed components.',deduction:'At least one boundary between the current component and the rest must be reoriented to create a connection.',reveal:i!=null?`Inspect ${coord(i,n)} and its neighbor outside the current component.`:'Open one component boundary without introducing a border leak.'});this.render(a);return;}toast('No network conflict remains.');};


  const GAMES={
    'five-letters':fiveLetters,
    'groups':groupsGame,
    'word-ladder':wordLadder,
    'anagrams':anagramsGame,
    'letter-hive':letterHiveGame,
    'word-grid':wordGridGame,
    'theme-trail':themeTrailGame,
    'word-pieces':wordPiecesGame,
    'mini-crossword':miniCrosswordGame,
    'cryptogram':cryptogramGame,
    'sudoku':sudoku,
    'killer-sudoku':killerSudoku,
    'kakuro':kakuroGame,
    'unequal':unequalGame,
    'arithmetic-cages':arithmeticCagesGame,
    'mines':mines,
    'nonogram':nonogramGame,
    'binary':binaryGame,
    'queens':queensGame,
    'loop':loopGame,
    'bridges':bridgesGame,
    'light-up':lightUp,
    'islands':islandsGame,
    'hitori':hitoriGame,
    'number-path':numberPathGame,
    'tents':tentsGame,
    'rectangles':rectanglesGame,
    'dominoes':dominoesGame,
    'towers':towersGame,
    'fillomino':fillominoGame,
    'lights-out':lightsOut,
    'network':networkGame,
    'sliding-tiles':slidingTiles,
    'untangle':untangleGame,
    'make-24':make24,
    'word-search':wordSearch,
  };

  // Input lifetimes are tied to a render, including pointer cancellation.
  let pointerCleanup=null;
  function clearGamePointerHandlers() {
    const cleanup=pointerCleanup;pointerCleanup=null;if(cleanup)cleanup();
    document.onpointermove=null;document.onpointerup=null;document.onpointercancel=null;
  }
  function bindTraceGame(game,a,attr) {
    const n=a.puzzle.n,selector=`[${attr}]`;
    let pointer=null,moved=false,prior=null;
    const valid=i=>{
      if(!Number.isInteger(i)||i<0||i>=n*n||a.state.path.includes(i))return false;
      if(game.locked?.(a).has(i))return false;
      const last=a.state.path.at(-1);
      return last==null||Math.max(Math.abs(Math.floor(last/n)-Math.floor(i/n)),Math.abs(last%n-i%n))===1;
    };
    const paint=()=>{
      $$(selector).forEach(el=>{const i=+el.getAttribute(attr);el.classList.toggle('path',a.state.path.includes(i));el.classList.toggle('selected',i===a.state.selected);el.setAttribute('aria-pressed',String(a.state.path.includes(i)));});
      const current=$('.word-grid-current');if(current)current.textContent=game.word(a)||'Trace a word';
    };
    const add=i=>{if(valid(i)){a.state.path.push(i);a.state.selected=i;paint();return true;}return false;};
    const cancel=()=>{if(pointer!==null){a.state.path=prior||[];pointer=null;paint();}};
    pointerCleanup=cancel;
    $$(selector).forEach(el=>{
      const i=+el.getAttribute(attr);
      el.onpointerdown=e=>{
        if(a.completed||pointer!==null||e.button>0)return;e.preventDefault();
        pointer=e.pointerId;moved=false;prior=[...a.state.path];a.state.path=[];add(i);
        el.setPointerCapture?.(e.pointerId);
      };
      el.onclick=e=>{if(e.detail===0){if(!add(i)){a.state.path=[];add(i);}paint();}};
    });
    document.onpointermove=e=>{
      if(pointer!==e.pointerId)return;
      const el=document.elementFromPoint(e.clientX,e.clientY)?.closest(selector);
      if(el&&+el.getAttribute(attr)!==a.state.path.at(-1)){moved=true;add(+el.getAttribute(attr));}
    };
    document.onpointerup=async e=>{
      if(pointer!==e.pointerId)return;pointer=null;
      if(moved){await game.submit(a);return;}
      const i=a.state.path[0];a.state.path=prior||[];
      if(i!=null&&!add(i)){a.state.path=[];add(i);}paint();
    };
    document.onpointercancel=e=>{if(pointer===e.pointerId)cancel();};
    const prefix=attr==='data-wg'?'wg':'trail';
    $(`[data-${prefix}-clear]`).onclick=()=>{a.state.path=[];game.render(a);};
    $(`[data-${prefix}-submit]`).onclick=()=>game.submit(a);
    window.onkeydown=e=>{
      if(e.key==='Backspace'){e.preventDefault();a.state.path.pop();paint();return;}
      const delta={ArrowUp:[-1,0],ArrowDown:[1,0],ArrowLeft:[0,-1],ArrowRight:[0,1]}[e.key];
      if(!delta)return;e.preventDefault();
      const i=a.state.selected,r=clamp(Math.floor(i/n)+delta[0],0,n-1),c=clamp(i%n+delta[1],0,n-1);
      a.state.selected=r*n+c;paint();$(`${selector}[${attr}="${a.state.selected}"]`)?.focus({preventScroll:true});
    };
  }
  wordGridGame.bind=function(a){bindTraceGame(this,a,'data-wg');};
  themeTrailGame.bind=function(a){bindTraceGame(this,a,'data-trail');};
  for(const game of [wordGridGame,themeTrailGame])game.rules.items.push('Keyboard: arrows move focus; Enter or Space adds the focused letter, Backspace removes it. Use Submit when the word is ready. Tap letters individually or drag through them.');

  nonogramGame.bind=function(a) {
    let pointer=null,snapshot=null,target=1,visited=new Set();
    const apply=i=>{
      if(visited.has(i)||a.completed)return;visited.add(i);a.state.cells[i]=target;
      const el=$(`[data-nono="${i}"]`);if(el){el.classList.toggle('filled',target===1);el.classList.toggle('marked',target===2);el.textContent=target===2?'×':'';el.setAttribute('aria-label',`${coord(i,a.puzzle.size)}, ${target===1?'filled':target===2?'crossed out':'unknown'}`);}
    };
    const begin=i=>{snapshot=[...a.state.cells];target=a.state.cells[i]===a.state.tool?0:a.state.tool;visited=new Set();apply(i);};
    const end=async()=>{
      if(!snapshot)return;const before=snapshot;snapshot=null;pointer=null;
      if(!before.some((v,i)=>v!==a.state.cells[i]))return;
      a.state.history.push(before);
      if(a.puzzle.solution.every((v,i)=>!!v===(a.state.cells[i]===1)))await finishActive(a,{size:a.puzzle.size,image:a.puzzle.name});
      else await saveActive(a);this.render(a);
    };
    const cancel=()=>{if(snapshot){a.state.cells=snapshot;snapshot=null;pointer=null;}};pointerCleanup=cancel;
    $$('[data-nono]').forEach(el=>{
      const i=+el.dataset.nono;
      el.onpointerdown=e=>{if(a.completed||pointer!==null||e.button>0)return;e.preventDefault();pointer=e.pointerId;begin(i);el.setPointerCapture?.(e.pointerId);};
      el.onclick=e=>{if(e.detail===0&&!a.completed){begin(i);end();}};
    });
    document.onpointermove=e=>{if(pointer!==e.pointerId)return;const el=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-nono]');if(el)apply(+el.dataset.nono);};
    document.onpointerup=e=>{if(pointer===e.pointerId)end();};
    document.onpointercancel=e=>{if(pointer===e.pointerId){cancel();this.render(a);}};
    $$('[data-nono-tool]').forEach(el=>el.onclick=()=>{a.state.tool=+el.dataset.nonoTool;this.render(a);});
    $('[data-nono-undo]').onclick=()=>this.undo(a);
    window.onkeydown=null;
  };
  loopGame.bind=function(a) {
    let pointer=null,snapshot=null,target=1,visited=new Set();
    const apply=el=>{
      if(!el||visited.has(el.dataset.loopEdge)||a.completed)return;visited.add(el.dataset.loopEdge);
      const [t,k]=el.dataset.loopEdge.split(':'),arr=a.state[t],i=+k;
      if(arr[i]===target)return;
      a.state.history.push([t,i,arr[i]]);arr[i]=target;
      el.classList.toggle('line',target===1);el.classList.toggle('blocked',target===2);el.textContent=target===2?'×':'';
    };
    const begin=el=>{snapshot={h:[...a.state.h],v:[...a.state.v],history:a.state.history.length};const [t,i]=el.dataset.loopEdge.split(':');target=(a.state[t][+i]+1)%3;visited=new Set();apply(el);};
    const end=async()=>{
      if(!snapshot)return;snapshot=null;pointer=null;
      if(w6LoopValidate(a.puzzle,a.state))await finishActive(a,{size:`${a.puzzle.cols}x${a.puzzle.rows}`});else await saveActive(a);this.render(a);
    };
    const cancel=()=>{if(snapshot){a.state.h=snapshot.h;a.state.v=snapshot.v;a.state.history.length=snapshot.history;snapshot=null;pointer=null;}};pointerCleanup=cancel;
    $$('[data-loop-edge]').forEach(el=>{
      el.onpointerdown=e=>{if(a.completed||pointer!==null||e.button>0)return;e.preventDefault();pointer=e.pointerId;begin(el);el.setPointerCapture?.(e.pointerId);};
      el.onclick=e=>{if(e.detail===0&&!a.completed){begin(el);end();}};
    });
    document.onpointermove=e=>{if(pointer!==e.pointerId)return;apply(document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-loop-edge]'));};
    document.onpointerup=e=>{if(pointer===e.pointerId)end();};
    document.onpointercancel=e=>{if(pointer===e.pointerId){cancel();this.render(a);}};
    $('[data-loop-undo]').onclick=()=>this.undo(a);window.onkeydown=null;
  };
  wordSearch.bind=function(a) {
    let pointer=null,first=null,moved=false,previous=null;
    const paint=()=>{const line=new Set(this.currentLine(a));$$('[data-ws]').forEach(el=>el.classList.toggle('active',line.has(+el.dataset.ws)));};
    const cancel=()=>{if(pointer!==null){a.state.start=previous;a.state.hover=previous;pointer=null;paint();}};pointerCleanup=cancel;
    const select=i=>{if(a.state.start==null){a.state.start=i;a.state.hover=i;paint();}else{a.state.hover=i;this.commit(a);}};
    $$('[data-ws]').forEach(el=>{
      const i=+el.dataset.ws;
      el.onpointerdown=e=>{if(a.completed||pointer!==null||e.button>0)return;e.preventDefault();pointer=e.pointerId;previous=a.state.start;first=i;moved=false;a.state.start=i;a.state.hover=i;paint();el.setPointerCapture?.(e.pointerId);};
      el.onclick=e=>{if(e.detail===0&&!a.completed)select(i);};
    });
    document.onpointermove=e=>{if(pointer!==e.pointerId)return;const el=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-ws]');if(el){const i=+el.dataset.ws;if(i!==first)moved=true;a.state.hover=i;paint();}};
    document.onpointerup=e=>{if(pointer!==e.pointerId)return;pointer=null;if(moved){this.commit(a);}else{a.state.start=previous;select(first);}};
    document.onpointercancel=e=>{if(pointer===e.pointerId)cancel();};window.onkeydown=null;
  };

  const boardViewState=new WeakMap();
  function rememberBoardView(active) {
    const memo=boardViewState.get(active);
    if(memo){const viewport=$('.dense-board-viewport');if(viewport)memo.left=viewport.scrollLeft;}
  }
  function enhanceDenseBoard(game,active) {
    const selector={mines:'.mines-board',nonogram:'.nonogram-wrap',loop:'.loop-board'}[game.id];
    if(!selector)return;
    const board=$(selector);if(!board)return;
    const cols=active.puzzle.cols||active.puzzle.size;
    const minimum=game.id==='loop'?cols*32+(cols+1)*24:cols*28+(game.id==='nonogram'?56:4);
    const available=Math.min(board.getBoundingClientRect().width,$('.game-stage').clientWidth);
    if(game.id!=='loop'&&available>=minimum&&!boardViewState.has(active))return;
    const memo=boardViewState.get(active)||{fit:false,left:0};boardViewState.set(active,memo);
    const frame=document.createElement('div');frame.className='dense-board-frame';
    const viewport=document.createElement('div');viewport.className='dense-board-viewport';
    viewport.setAttribute('role','region');viewport.setAttribute('aria-label',`${game.name} scrollable board`);
    board.replaceWith(frame);frame.append(viewport);viewport.append(board);
    const controls=document.createElement('div');controls.className='dense-board-controls';
    controls.innerHTML='<label>Board position<input data-board-position type="range" min="0" value="0" step="1" aria-label="Horizontal board position"></label><button data-board-fit type="button"></button>';
    frame.append(controls);
    const slider=$('[data-board-position]',controls),fit=$('[data-board-fit]',controls);
    function update(){
      const width=frame.clientWidth;
      board.style.width=(memo.fit?width:Math.max(width,minimum))+'px';board.style.maxWidth='none';
      if(game.id==='loop'){
        const edge=memo.fit?8:24;
        board.style.gridTemplateColumns=Array.from({length:cols*2+1},(_,i)=>i%2?'minmax(0,1fr)':edge+'px').join(' ');
        board.style.gridTemplateRows=Array.from({length:active.puzzle.rows*2+1},(_,i)=>i%2?'minmax(0,1fr)':edge+'px').join(' ');
        board.style.aspectRatio=`${cols*32+(cols+1)*edge}/${active.puzzle.rows*32+(active.puzzle.rows+1)*edge}`;
      }
      const max=Math.max(0,viewport.scrollWidth-viewport.clientWidth);slider.max=String(max);slider.disabled=max<1;
      viewport.scrollLeft=Math.min(memo.left,max);slider.value=String(viewport.scrollLeft);
      fit.textContent=memo.fit?'Enlarge cells':'Fit board';fit.setAttribute('aria-pressed',String(memo.fit));
      controls.hidden=width>=minimum&&!memo.fit;
    }
    slider.oninput=()=>{viewport.scrollLeft=+slider.value;memo.left=viewport.scrollLeft;};
    viewport.onscroll=()=>{memo.left=viewport.scrollLeft;slider.value=String(viewport.scrollLeft);};
    fit.onclick=()=>{memo.fit=!memo.fit;memo.left=0;update();};update();
    const observer=new ResizeObserver(update);observer.observe(frame);
    const cleanup=pointerCleanup;pointerCleanup=()=>{observer.disconnect();cleanup?.();};
  }
  const mineInputState=new WeakMap();
  const mineKeyboardBind=mines.bind;
  mines.bind=function(a){
    mineKeyboardBind.call(this,a);
    const mode=mineInputState.get(a)||{flag:false};mineInputState.set(a,mode);
    const controls=document.createElement('div');controls.className='toolbar mine-input-mode';
    controls.innerHTML=`<button data-mine-mode="reveal" aria-pressed="${!mode.flag}">Reveal</button><button data-mine-mode="flag" aria-pressed="${mode.flag}">Flag</button>`;
    $('.mines-board')?.after(controls);$('.game-board-wrap')?.classList.add('w6-stack-host');
    $$('[data-mine-mode]',controls).forEach(el=>el.onclick=()=>{mode.flag=el.dataset.mineMode==='flag';this.render(a);});
    const timers=new Set();
    pointerCleanup=()=>{timers.forEach(clearTimeout);timers.clear();};
    $$('[data-mine-cell]').forEach(el=>{
      let timer=null,origin=null,held=false;
      const cancel=()=>{if(timer!==null){clearTimeout(timer);timers.delete(timer);timer=null;}};
      el.onclick=()=>{cancel();if(held){held=false;return;}const i=+el.dataset.mineCell;a.state.selected=i;mode.flag?this.flag(a,i):this.reveal(a,i);};
      el.oncontextmenu=e=>{e.preventDefault();cancel();if(!held)this.flag(a,+el.dataset.mineCell);};
      el.onpointerdown=e=>{cancel();held=false;origin={x:e.clientX,y:e.clientY};if(e.pointerType==='touch'){
        timer=setTimeout(()=>{timers.delete(timer);timer=null;held=true;if(state.currentActive===a&&!a.completed)this.flag(a,+el.dataset.mineCell);},500);timers.add(timer);
      }};
      el.onpointermove=e=>{if(origin&&Math.hypot(e.clientX-origin.x,e.clientY-origin.y)>8)cancel();};
      el.onpointerup=el.onpointercancel=el.onpointerleave=cancel;
    });
  };
  mines.rules.items=mines.rules.items.map(x=>x.includes('long-press')?'Choose Reveal or Flag for tap input; right-click, long-press, or press F to flag.':x);

  function installGameLifecycle() {
    const mutators=['key','submit','enter','undo','tile','back','clear','letter','flag','reveal','chord','cycle','set','activate','click','press','rotate','move','value','reset','assign','erase','commit'];
    for(const game of Object.values(GAMES)) {
      game.save=saveActive;
      for(const name of mutators) {
        const method=game[name]; if(typeof method!=='function')continue;
        game[name]=function(active,...args){
          if(active?.completed||retiredActives.has(active)||playSession(active).paused)return;
          if(name==='enter'&&['sudoku','killer-sudoku','kakuro','unequal','arithmetic-cages','fillomino','towers','binary'].includes(game.id)) {
            const i=active?.state?.selected,board=active?.state?.board;
            if(!Array.isArray(board)||!Number.isInteger(i)||i<0||i>=board.length)return;
            const input=args[0],value=Number(input),max=game.id==='binary'?1:game.id==='fillomino'?active.puzzle.maxValue:['unequal','arithmetic-cages','towers'].includes(game.id)?active.puzzle.n:9;
            if(input!=='clear'&&(!Number.isInteger(value)||value<0||value>max))return;
          }
          return method.call(this,active,...args);
        };
      }
      const render=game.render;
      game.render=function(active){
        if(state.currentActive!==active||state.currentGame!==game||parseHash().parts[1]!==game.id)return;
        const focused=document.activeElement;
        const focusKey=focused?.closest('#main')?Object.entries(focused.dataset||{}).find(([key])=>key!=='n'):null;
        rememberBoardView(active);
        clearGamePointerHandlers();
        render.call(this,active);
        enhanceDenseBoard(game,active);
        setupPlayExperience(game,active);
        if(active.completed) {
          $$('.game-stage button,.game-stage input,.game-stage select').filter(el=>!el.closest('.result-panel,.dense-board-controls')).forEach(el=>el.disabled=true);
          $$('.game-board-wrap svg').forEach(el=>el.setAttribute('inert','')); 
          stopTimer();
        }
        const keyHandler=window.onkeydown;
        window.onkeydown=event=>{
          if(!keyHandler||event.defaultPrevented||event.ctrlKey||event.metaKey||event.altKey||overlayRoot.firstChild||active.completed||state.currentActive!==active)return;
          const target=event.target;
          if(target?.closest?.('input,textarea,select,[contenteditable="true"]'))return;
          if(target?.closest?.('button')&&['Enter',' '].includes(event.key))return;
          if(target?.closest?.('button,a')&&!target.closest('.game-board-wrap'))return;
          keyHandler(event);
          if(event.key.startsWith('Arrow'))requestAnimationFrame(()=>{if(state.currentActive===active&&!overlayRoot.firstChild)$('.game-board-wrap .selected')?.focus({preventScroll:true});});
        };
        if(focusKey&&!active.completed){
          const [key,oldValue]=focusKey,attr='data-'+key.replace(/[A-Z]/g,c=>'-'+c.toLowerCase());
          const value=typeof active.state.selected==='number'&&gridCellKey(key)&&/^\d+$/.test(oldValue)?String(active.state.selected):oldValue;
          $(`[${attr}="${CSS.escape(value)}"]`,main)?.focus({preventScroll:true});
        }
        enhanceBoardAccessibility(game,active);
        const undoKeys=window.onkeydown;window.onkeydown=e=>{if(!e.defaultPrevented&&!overlayRoot.firstChild&&!active.completed&&!playSession(active).paused&&(e.ctrlKey||e.metaKey)&&!e.altKey&&!e.target?.closest?.('input,textarea,select,[contenteditable="true"]')){const k=e.key.toLowerCase();if(k==='z'||k==='y'){e.preventDefault();if(k==='y'||e.shiftKey)redoGame(game,active);else if(canUndoGame(game,active))game.undo(active);return;}}undoKeys?.(e);};
      };
    }
  }
  function gridCellKey(key) {
    return /^(cell|killerCell|kakCell|binary|queen|wg|trail|crossCell|tentCell|rectCell|towerCell|netCell|networkCell|island|hitori|domino|dominoCell|fill|fillomino|unequal|arith|lightCell|mineCell|nono|searchCell|wsCell|ws|pathCell|slide|light|node)$/.test(key);
  }
  function enhanceBoardAccessibility(game,active) {
    const p=active.puzzle,n=p.cols||p.n||p.size||9;
    const board=$('.game-board-wrap');if(!board)return;
    $$('[role="grid"]',board).filter(el=>!$('[role="row"]',el)).forEach(el=>el.setAttribute('role','group'));
    $$('button',board).forEach((el,index)=>{
      const cell=Object.entries(el.dataset).find(([k,v])=>gridCellKey(k)&&/^\d+$/.test(v));
      if(cell&&typeof active.state.selected==='number') {
        el.addEventListener('focus',()=>{
          if(active.completed||state.currentActive!==active)return;
          active.state.selected=+cell[1];
          $$('button.selected',board).forEach(b=>b.classList.remove('selected'));el.classList.add('selected');
        });
      }
      if(el.hasAttribute('aria-label'))return;
      if(cell){const i=+cell[1];el.setAttribute('aria-label',`Row ${Math.floor(i/n)+1}, column ${i%n+1}: ${el.textContent.trim()||'empty'}`);}
      else if(!el.textContent.trim())el.setAttribute('aria-label',`${game.name} control ${index+1}`);
    });
  }
  installPlayExperience();
  installGameLifecycle();

  async function renderGame(id,params,ticket=routeGeneration){
    const game=GAMES[id],meta=byId[id];
    if(!game||!meta||meta.status!=='available'){
      if(!routeIsCurrent(ticket))return;
      main.innerHTML='<div class="page"><h1>Puzzle unavailable</h1><p>This puzzle does not exist.</p><button class="primary-button" data-action="home">Back to puzzles</button></div>';bindCommon();return;
    }
    const active=await getOrCreateActive(game,params,ticket);
    if(!active||!routeIsCurrent(ticket))return;
    active.startedAt=active.completed||document.hidden?null:Date.now();
    state.currentGame=game;state.currentActive=active;
    updateNav('');document.title=`${game.name} — Puzzle Arcade`;
    try { game.render(active); }
    catch(error){
      if(!routeIsCurrent(ticket))return;
      stopTimer();window.onkeydown=null;clearGamePointerHandlers();
      checkpointTime(active,true);await saveActive(active);
      if(!routeIsCurrent(ticket))return;
      main.innerHTML=`<div class="page"><h1>${esc(game.name)} could not be displayed</h1><p>Your saved progress has not been reset.</p><div class="toolbar"><button data-render-retry>Try again</button><button data-action="home">Back to puzzles</button></div></div>`;
      bindCommon();$('[data-render-retry]').onclick=()=>go(location.hash.slice(2));
    }
  }
  async function renderRoute(){
    const ticket=++routeGeneration,outgoing=state.currentActive;
    stopTimer();window.onkeydown=null;clearGamePointerHandlers();
    closeOverlay();toastRoot.innerHTML='';
    if(outgoing&&!retiredActives.has(outgoing)){
      checkpointTime(outgoing,true);
      const saving=saveActive(outgoing);retiredActives.add(outgoing);
      state.currentGame=null;state.currentActive=null;
      await saving;
      if(!routeIsCurrent(ticket))return;
    }
    const {parts,params}=parseHash(),route=parts[0]||'home';
    document.body.classList.toggle('in-game',route==='game');
    if(route==='home'||route==='games')return renderHome(ticket);
    if(route==='stats')return renderStats(ticket);
    if(route==='settings')return renderSettings();
    if(route==='game'&&parts[1])return renderGame(parts[1],params,ticket);
    main.innerHTML='<div class="page"><h1>Not found</h1><p class="subtle">That page does not exist.</p><button class="primary-button" data-action="home">Back to puzzles</button></div>';bindCommon();
  }

  document.addEventListener('click',e=>{
    if(e.target.closest('.skip-link')){e.preventDefault();main.focus({preventScroll:true});main.scrollIntoView({block:'start'});}
  });
  window.addEventListener('hashchange',()=>void renderRoute());
  function suspendCurrentGame(){
    const active=state.currentActive;
    if(!active||retiredActives.has(active))return;
    checkpointTime(active,true);stopTimer();
    active.updatedAt=saveClock=Math.max(Date.now(),saveClock+1);
    journalActive(active);void saveActive(active);
  }
  window.addEventListener('pagehide',suspendCurrentGame);
  window.addEventListener('beforeunload',suspendCurrentGame);
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){suspendCurrentGame();return;}
    const active=state.currentActive;
    if(active&&!active.completed&&!retiredActives.has(active)&&!playSession(active).paused){active.startedAt=Date.now();startTimer(active);}
  });

  if('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(()=>{});

  (async()=>{
    let bootTheme=null; try { bootTheme=localStorage.getItem('pa:bootstrap-theme'); } catch {} if(bootTheme) document.documentElement.dataset.theme=bootTheme;
    await refreshData(); if(!location.hash)location.hash='#/home'; else renderRoute();
  })();
})();
