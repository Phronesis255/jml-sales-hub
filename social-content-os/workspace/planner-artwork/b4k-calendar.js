// One record per post; filenames retain their original spelling and slide order.
// Unmatched creatives retain their original November 2026 placements.
const b4kPackages = [
  {key:'which-piece',day:4,title:'Which LEGO piece fits?',format:'Story',pillar:'Kid Creativity',message:'Which piece would you add? A or B?',images:['Stories-Which LEGO Piece Fits-Nov 4.png']},
  {key:'pegah-tip',day:5,title:'Pegah’s creative solutions tip',format:'Story',pillar:'Parent Trust',message:'Give children time to explore their own solutions before stepping in to help.',images:['Stories-Pegah’s Creative Solutions Tip-Nov05.png']},
  {key:'hidden-skills',day:6,title:'Your child sees bricks — here’s what you might be missing',format:'Carousel',pillar:'STEAM Learning',message:'Creativity, problem-solving, logical thinking and teamwork. Know a parent who would love this perspective? Pass it along!',images:Array.from({length:5},(_,i)=>`Carousel-Nov 6-0${i+1}.png`),alternates:Array.from({length:5},(_,i)=>`Carousel-Nov 6-0${i+1} (1).png`),note:'The (1) files are an alternate export of the same five-slide carousel, retained below the primary sequence.'},
  {key:'pause-let-them-try',day:6,title:'Pause. Let them try.',format:'Story',pillar:'Parent Trust',message:'Give children time to explore their own solutions before stepping in to help.',images:['Stories1-Pause. Let Them Try-Nov06.png','Stories2-Pause. Let Them Try-Nov06.png']},
  {key:'family-tower',day:8,title:'Weekend family LEGO tower challenge',format:'Story',pillar:'Kid Creativity',message:'10 bricks. 1 tower. How tall can you go? Build it together and show us your tower!',images:['Stories-Weekend Family LEGO Tower Challenge-Nov08.png']},
  {key:'spot-the-difference',day:9,title:'Spot the difference',format:'Story',pillar:'Kid Creativity',message:'Two builds. One tiny change. Which part changed? The second frame reveals the answer.',images:['Stories01-Spot the Difference-Nov 9.png','Stories02-Spot the Difference-Nov 9.png']},
  {key:'big-skills-poll',day:10,title:'Little builders, big skills poll',format:'Story',pillar:'STEAM Learning',message:'Which skill matters most to you? Creativity, problem-solving, logical thinking or teamwork?',images:['Stories-Little Builders, Big Skills Poll-Nov 10.png'],note:'Add the native poll sticker before publishing.'},
  {key:'idea-to-rocket',day:11,title:'From idea to rocket creation',format:'Photo',pillar:'STEAM Learning',message:'Imagine. Plan. Build. Improve. Pick an idea with your child and try bringing it to life in four steps.',images:['Post-From Idea to Rocket Creation-Nov 11.png']},
  {key:'small-bricks',day:11,title:'Big ideas start with small bricks',format:'Story',pillar:'Kid Creativity',message:'Every big creation starts with a little imagination.',images:['Stories-Big Ideas Start With Small BricksNov 11.png']},
  {key:'rocket-or-house',day:13,title:'What would you build — space rocket or dream house?',format:'Story',pillar:'Kid Creativity',message:'What would you build? Space rocket or dream house?',images:['Stories_What_Would_You_Build_Space_Rocket_or_Dream_House_13_Nov.png'],note:'Add the native poll sticker before publishing.'},
  {key:'little-inventors',day:17,title:'Meet the little inventors',format:'Story',pillar:'Kid Creativity',message:'Big ideas start with small bricks.',images:['Stories-Meet the Little Inventors-Nov 17.png'],note:'The supplied artwork still contains “Child’s own description goes here.” Replace that placeholder before publishing.'},
  {key:'new-planet',day:18,title:'Build a new planet',format:'Story',pillar:'Kid Creativity',message:'Imagine a whole new world with bricks. Build it. Name it. Share it!',images:['Stories-Build a New Planet in Bricks 4 Kidz Space-Nov 18.png']},
  {key:'guess-the-creation',day:19,title:'Can you guess the creation?',format:'Story',pillar:'Kid Creativity',message:'Can you guess what this is? Drop your guess!',images:['Can You Guess the Creation-Nov 19.png'],note:'Add the native question sticker before publishing.'},
  {key:'imagination-carousel',day:7,provisional:true,title:'Can you guess what they were imagining?',format:'Carousel',pillar:'Kid Creativity',message:'Four creations. Four big ideas. Swipe to guess: a spaceship delivering stars, a castle above the clouds, a garden helper from another planet and an underwater library.',images:['01.png','02.png','03.png','04.png','05.png']},
  {key:'meet-pegah',day:3,provisional:true,title:'Meet Pegah — Bricks 4 Kidz LA Valley',format:'Story',pillar:'Parent Trust',campaign:'Community',message:'Meet Pegah. Bricks 4 Kidz Los Angeles Valley.',images:['Meet Pegah_ Bricks 4 Kidz LA Valley (1).png']},
  {key:'what-children-do',day:12,provisional:true,title:'What would children do?',format:'Reel',pillar:'Parent Trust',message:'Parents usually ask me: what would children do?',images:['Parents usually ask me what would children do-Cover.png'],videos:['Parents Usually Ask Me What Would Children Do-04-1.mp4']},
  {key:'project-to-life',day:14,provisional:true,title:'Have you seen your child bring a project to life?',format:'Reel cover',pillar:'Parent Trust',message:'Have you seen your child bring a project to life?',images:['Reel-Cover-Have you ever seen your child doing a project-03.png'],note:'Cover supplied; the matching reel video is not in this folder.'},
  {key:'cant-do-it',day:16,provisional:true,title:'Does your child ever say “I can’t do it”?',format:'Reel cover',pillar:'Parent Trust',message:'Does your child ever say “I can’t do it”?',images:["Reel-Does Child ever say I can't do it-Cover.png"],note:'Cover supplied; the matching reel video is not in this folder.'},
  {key:'thanksgiving-story',day:2,provisional:true,title:'Thanksgiving camp — Story',format:'Video Story',pillar:'Programs',campaign:'Fall Enrollment',message:'Thanksgiving camp. November 25, 26 and 27. Call or text to register.',images:['Bricks-4-Kidz-Thanksgiving-Camp-Story.jpg'],videos:['Bricks-4-Kidz-Thanksgiving-Camp-Story-otion.mp4'],note:'Static and motion Story versions are kept together. The artwork states “Register by November 15”; this provisional placement is before that deadline.'},
  {key:'thanksgiving-reel',day:15,provisional:true,title:'Thanksgiving camp — let’s build!',format:'Reel',pillar:'Programs',campaign:'Fall Enrollment',message:'Thanksgiving camp. Let’s build! We learn. We build. We play.',images:['Thanksgiving Camp_ Let’s Build!.png'],videos:['Reel-Bricks-4-Kidz-Thanksgiving-Camp.mp4']},
  {key:'idea-stop-motion',day:20,provisional:true,title:'Watch an idea take shape',format:'Video Story',pillar:'Kid Creativity',message:'Watch an idea take shape.',images:[],videos:['Story-Watch an Idea Take Shape-Stop Motion.mp4']}
];
// Matched source rows are transcribed from the supplied internal calendar.
// Its displayed dates already include the one-week shift; do not shift them again.
const b4kCalendarRevision = 'b4k-internal-calendar-2026-v1';
const b4kCalendarMatches = {
  "which-piece": "W2-S06",
  "pegah-tip": "W2-S10",
  "hidden-skills": "W2-P3",
  "pause-let-them-try": "W2-S10",
  "family-tower": "W2-S13",
  "spot-the-difference": "W3-S02",
  "big-skills-poll": "W3-S04",
  "idea-to-rocket": "W3-P2",
  "small-bricks": "W3-S06",
  "rocket-or-house": "W3-S12",
  "little-inventors": "W4-S03",
  "new-planet": "W4-S05",
  "guess-the-creation": "W4-S08",
  "imagination-carousel": "W4-P3",
  "meet-pegah": "W1-S03",
  "idea-stop-motion": "W3-S13"
};
const b4kCalendarRecords = {
  "W1-S03": {
    "id": "W1-S03",
    "title": "Meet Pegah",
    "kind": "story",
    "format": "Story",
    "date": "2026-10-27",
    "time": "09:00",
    "description": "Short introduction to the owner.",
    "storyType": "Photo + text",
    "productionBrief": "Approved portrait of Pegah, name and role as a text block, link sticker to the Oct 26 reel.",
    "onScreenText": "Meet Pegah, local owner of Bricks 4 Kidz LA Valley",
    "assetsNeeded": "Pegah portrait (approved by her)",
    "cta": "Meet Pegah!",
    "briefProposed": true
  },
  "W2-P3": {
    "id": "W2-P3",
    "title": "4 Things Your Child Is Practicing Without Even Realizing It",
    "kind": "feed",
    "format": "Carousel",
    "date": "2026-11-06",
    "time": "19:00",
    "caption": "There's more happening between those bricks than meets the eye.\nA wild idea. A tricky piece. A clever solution. A shared creation.\nFour little moments. Four big skills.\nSwipe to discover what your child could be practicing while having fun!",
    "hashtags": "#Bricks4Kidz #LittleBuildersBigSkills #LearningThroughPlay #STEMForKids #LosAngelesValley",
    "hook": "Your Child Sees Bricks. Here's What You Might Be Missing.",
    "keyPoints": "Creativity: Turning an original idea into a unique creation.\nProblem-Solving: Finding new approaches when something doesn't work.\nLogical Thinking: Planning, organizing, and connecting pieces.\nTeamwork: Sharing ideas and collaborating on a common project.",
    "cta": "“Know a parent who would love this perspective? Pass it along!”",
    "dimensions": "5 slides, 1080 x 1350 each",
    "productionBrief": "Slide 1: hook as cover. Slides 2 to 5: one skill each, with a real photo and a one-line explanation. Keep the layout identical across the four skill slides so the swipe feels like one piece.",
    "onScreenText": "Cover: Your child sees bricks. Here's what you might be missing. / Slides: Creativity, Problem-Solving, Logical Thinking, Teamwork, each with its one-line definition",
    "assetsNeeded": "4 photos, one per skill (consent cleared), 4 icons",
    "briefNotes": "Share-focused CTA; design the cover to work as a standalone share."
  },
  "W2-S06": {
    "id": "W2-S06",
    "title": "A Little Challenge for Parents",
    "kind": "story",
    "format": "Story",
    "date": "2026-11-04",
    "time": "19:00",
    "description": "Which piece would you add?",
    "storyType": "Interactive sticker",
    "productionBrief": "An incomplete LEGO structure with two possible brick options and a poll sticker.",
    "onScreenText": "Which piece would you add? A / B",
    "assetsNeeded": "Incomplete structure photo, 2 brick options",
    "cta": "none listed",
    "briefProposed": false
  },
  "W2-S10": {
    "id": "W2-S10",
    "title": "A Tip from Pegah",
    "kind": "story",
    "format": "Story",
    "date": "2026-11-06",
    "time": "19:00",
    "description": "Give children time to explore their own solutions before stepping in to help.",
    "storyType": "Photo + text",
    "productionBrief": "Portrait of Pegah with the tip as a text block. Subject to her approval.\nNeeds Pegah's approval of both photo and wording.",
    "onScreenText": "“Give children time to explore their own solutions before stepping in to help.”",
    "assetsNeeded": "Pegah portrait",
    "cta": "none listed",
    "briefProposed": false
  },
  "W2-S13": {
    "id": "W2-S13",
    "title": "Weekend Family Challenge",
    "kind": "story",
    "format": "Story",
    "date": "2026-11-08",
    "time": "09:00",
    "description": "Can you build a tower using just 10 LEGO bricks?",
    "storyType": "Designed graphic",
    "productionBrief": "Colourful challenge poster with 10 bricks and a partially completed tower.",
    "onScreenText": "Weekend challenge: a tower from 10 bricks",
    "assetsNeeded": "Bricks and tower photo or illustration",
    "cta": "none listed",
    "briefProposed": false
  },
  "W3-P2": {
    "id": "W3-P2",
    "title": "How Does an Idea Become a Real Creation?",
    "kind": "feed",
    "format": "Infographic",
    "date": "2026-11-11",
    "time": "19:00",
    "caption": "It starts with a spark of imagination… then a plan, a few bricks, and a little experimenting. 🧱\n✨ Imagine it.\n✏️ Plan it.\n🔨 Build it.\n🚀 Make it better!\nAt Bricks 4 Kidz, we love exploring the possibilities that begin with a child's imagination.\nBecause the coolest creations don't just appear. They start with an idea!",
    "hashtags": "#Bricks4Kidz #BigIdeasStartSmall #CreativeKids #LearningThroughPlay #LosAngelesValley",
    "hook": "“Have you ever wondered how a simple idea in a child’s imagination turns into something they can actually build with their own hands?”",
    "keyPoints": "Imagine: Every creation begins with an idea, question, or inspiration.\nPlan: Children decide how to turn their ideas into something they can build.\nBuild: They bring their ideas to life by experimenting with bricks and structures.\nImprove: They can test, adjust, and add new details to their creations.",
    "cta": "“Pick an idea with your child and try bringing it to life in four steps.”",
    "dimensions": "Single image, 1080 x 1350",
    "productionBrief": "Four-step path (Imagine, Plan, Build, Improve) running top to bottom or as a loop, one icon and one line per step. This post bridges the two concepts, so it can use the new concept's colour or motif.",
    "onScreenText": "How does an idea become a real creation? / Imagine / Plan / Build / Improve",
    "assetsNeeded": "4 step icons, brick motif",
    "briefNotes": ""
  },
  "W3-S02": {
    "id": "W3-S02",
    "title": "Spot the Difference!",
    "kind": "story",
    "format": "Story",
    "date": "2026-11-09",
    "time": "19:00",
    "description": "Viewers identify what changed between the two models.",
    "storyType": "Interactive sticker",
    "productionBrief": "Two builds with a missing or changed brick. Include the answer or a small visual reveal in a follow-up frame.",
    "onScreenText": "Spot the difference",
    "assetsNeeded": "Same 2 builds, reveal frame",
    "cta": "none listed",
    "briefProposed": false
  },
  "W3-S04": {
    "id": "W3-S04",
    "title": "Which Skill Do You Value Most?",
    "kind": "story",
    "format": "Story",
    "date": "2026-11-10",
    "time": "19:00",
    "description": "Parents vote between two selected skills.",
    "storyType": "Interactive sticker",
    "productionBrief": "Colourful graphic of the four skills with a two-option poll sticker.",
    "onScreenText": "Which skill matters most to you?",
    "assetsNeeded": "4 skill icons",
    "cta": "none listed",
    "briefProposed": false
  },
  "W3-S06": {
    "id": "W3-S06",
    "title": "Coming Up Next",
    "kind": "story",
    "format": "Story",
    "date": "2026-11-11",
    "time": "19:00",
    "description": "Teaser for the next concept: Big Ideas Start with Small Bricks.",
    "storyType": "Photo + text",
    "productionBrief": "Creative photo or illustration of an intriguing LEGO structure with a teaser headline.",
    "onScreenText": "Coming up: Big Ideas Start with Small Bricks",
    "assetsNeeded": "Hero model photo",
    "cta": "none listed",
    "briefProposed": false
  },
  "W3-S12": {
    "id": "W3-S12",
    "title": "What Would You Build?",
    "kind": "story",
    "format": "Story",
    "date": "2026-11-14",
    "time": "19:00",
    "description": "Parents choose between two building themes.",
    "storyType": "Interactive sticker",
    "productionBrief": "Two colourful creation photos labelled Space Rocket and Dream House, with a poll sticker.",
    "onScreenText": "Space Rocket or Dream House?",
    "assetsNeeded": "2 themed build photos",
    "cta": "none listed",
    "briefProposed": false
  },
  "W3-S13": {
    "id": "W3-S13",
    "title": "Watch an Idea Take Shape",
    "kind": "story",
    "format": "Video Story",
    "date": "2026-11-15",
    "time": "09:00",
    "description": "Loose bricks become a completed structure.",
    "storyType": "Video clip",
    "productionBrief": "Authentic short video or timelapse of a model being assembled, 10 to 15 seconds.",
    "onScreenText": "Watch an idea take shape",
    "assetsNeeded": "Timelapse clip",
    "cta": "none listed",
    "briefProposed": false
  },
  "W4-P3": {
    "id": "W4-P3",
    "title": "Can You Guess the Idea Behind These LEGO Creations?",
    "kind": "feed",
    "format": "Carousel",
    "date": "2026-11-20",
    "time": "19:00",
    "caption": "A spaceship? A secret castle? A robot from another planet?\nLook a little closer… there might be an entire story hiding between those bricks.\nChildren don't always build what we expect. They invent characters, imaginary places, and surprising creations that make perfect sense in their own worlds. 🌎✨\nAt Bricks 4 Kidz, we love celebrating the imagination behind every unique design.\nSometimes, the most interesting part of a creation is the story you haven't heard yet.",
    "hashtags": "#Bricks4Kidz #BigIdeasStartSmall #CreativeKids #KidsImagination #LosAngelesValley",
    "hook": "“You Can See What They Built, But Can You Guess What They Were Imagining?”",
    "keyPoints": "A LEGO® creation can represent much more than what it looks like at first glance.\nChildren may give familiar objects entirely new meanings through imagination.\nThe inspiration behind a creation can be just as interesting as the finished structure.\nOne simple building model can become part of a larger imaginary story.\nEncouraging children to explain their creations gives parents a chance to discover their unique perspectives.",
    "cta": "“Curious which program fits your child? Send us their age and interests by DM, and we'll help you explore the options.”",
    "dimensions": "5 slides, 1080 x 1350 each",
    "productionBrief": "Slide 1: hook as cover. Slides 2 to 5: one creation each, photo first with 'Guess what this is', and the child's own explanation as a reveal line at the bottom (or on the next slide if there is room). Last slide carries the DM prompt.",
    "onScreenText": "Cover: You can see what they built. Can you guess what they were imagining? / Per slide: Guess, then the child's answer / Final: DM us your child's age and interests",
    "assetsNeeded": "4 creation photos with the children's explanations (consent cleared)",
    "briefNotes": "Only post in the month with a direct program-inquiry CTA; make sure DMs are monitored that evening."
  },
  "W4-S03": {
    "id": "W4-S03",
    "title": "Meet the Little Inventors",
    "kind": "story",
    "format": "Story",
    "date": "2026-11-17",
    "time": "09:00",
    "description": "An original creation from a real building activity.",
    "storyType": "Photo + text",
    "productionBrief": "Photo of a completed model with a one-line description of its idea.",
    "onScreenText": "Meet the little inventors",
    "assetsNeeded": "Model photo and the child's own description",
    "cta": "none listed",
    "briefProposed": false
  },
  "W4-S05": {
    "id": "W4-S05",
    "title": "Your Weekend Building Mission",
    "kind": "story",
    "format": "Story",
    "date": "2026-11-18",
    "time": "09:00",
    "description": "Families build something inspired by a theme, such as a new planet or fantasy creature.",
    "storyType": "Designed graphic",
    "productionBrief": "Playful illustrated poster with bricks, planets and fantasy structures.",
    "onScreenText": "Weekend mission: build a new planet",
    "assetsNeeded": "Illustration",
    "cta": "none listed",
    "briefProposed": false
  },
  "W4-S08": {
    "id": "W4-S08",
    "title": "Can You Guess the Creation?",
    "kind": "story",
    "format": "Story",
    "date": "2026-11-19",
    "time": "19:00",
    "description": "A cropped detail; viewers guess the full model.",
    "storyType": "Interactive sticker",
    "productionBrief": "Tight crop with a question sticker or two-option poll, then a reveal frame with the full model.",
    "onScreenText": "Can you guess what this is?",
    "assetsNeeded": "Same model, crop and full shot",
    "cta": "none listed",
    "briefProposed": false
  }
};
const b4kSourceUpdates = Object.fromEntries(b4kPackages.filter(item=>b4kCalendarMatches[item.key]).map(item=>{
  const record=b4kCalendarRecords[b4kCalendarMatches[item.key]],feed=record.kind==='feed';
  const alternative=record.id==='W2-S10';
  return ['b4k-prepared-'+item.key,{
    date:record.date,time:record.time,dateOrigin:'internal-calendar',dateStatus:'calendar',timeSource:'calendar',
    title:record.title+(alternative?(item.key==='pegah-tip'?' · Portrait version':' · Pause. Let them try.'):''),
    originalCreativeTitle:item.title,format:record.format,
    copy:feed?record.caption+'\n\n'+record.hashtags:record.description+'\n\nOn-screen copy:\n'+record.onScreenText,
    caption:record.caption||'',hashtags:record.hashtags||'',description:record.description||'',
    captionStatus:feed?'Caption and hashtags from the supplied calendar':'Story description and on-screen copy supplied; no separate caption',
    hook:record.hook||record.onScreenText,cta:record.cta==='none listed'?'Not listed in the supplied calendar':record.cta,
    keyPoints:record.keyPoints||'',productionBrief:record.productionBrief,onScreenText:record.onScreenText,
    assetsNeeded:record.assetsNeeded,dimensions:record.dimensions||'',storyType:record.storyType||'',
    briefNotes:record.briefNotes||'',briefProposed:!!record.briefProposed,
    productionNote:[item.note,alternative?'Alternative creative for W2-S10. The portrait and “Pause. Let them try.” entries share one calendar slot; choose one version.':''].filter(Boolean).join('\n\n'),
    sourceCalendarId:record.id,sourceKind:record.kind,sourceCalendarDate:record.date,sourceCalendarTime:record.time,
    sourceCalendarRevision:b4kCalendarRevision,
    source:`Matched to B4K Internal Content Calendar.html, ${record.id}. Dates and times are taken as displayed; the document already incorporates its one-week adjustment. America/Los_Angeles is retained from the existing plan; the source does not specify a timezone.`,
    captionPath:`B4K Internal Content Calendar.html — ${record.id}`,originalCalendarStatus:'Source status blank; imported as draft'
  }];
}));
// Apply the source correction once to previously saved imported posts. Preserve
// approvals, review history, owners, and subsequent user edits on future loads.
function b4kApplyCalendarMatches(records){
  let changed=0;
  records.forEach(post=>{
    const update=b4kSourceUpdates[post.id];
    if(post.brand_id!=='brand_b4k'||!update||post.sourceCalendarRevision===update.sourceCalendarRevision)return;
    Object.assign(post,update);
    changed++;
  });
  return changed;
}
const b4kAssetURL = name => 'B4K%20Creatives/' + encodeURIComponent(name);
const b4kPreparedPosts = b4kPackages.map(item => ({
  id:'b4k-prepared-'+item.key, brand_id:'brand_b4k', account:'Bricks 4 Kidz LA Valley',
  date:`2026-11-${String(item.day).padStart(2,'0')}`, dateStatus:item.provisional?'proposed':'filename',
  dateOrigin:item.provisional?'provisional':'filename', time:'09:00', timezone:'America/Los_Angeles',
  platform:'Instagram', title:item.title, format:item.format, pillar:item.pillar,
  campaign:item.campaign||'STEAM Stories', owner:'Maya', status:'draft', approval:'pending',
  copy:`On-artwork message: ${item.message}\n\nCaption not supplied.`, captionStatus:'Not supplied',
  asset:item.videos?.length?'video':'photo', assetStatus:item.format==='Reel cover'?'Cover only — matching video not supplied':'Prepared creative files',
  publishingStatus:'Draft — not scheduled or published', objective:'Review the creative, caption and calendar placement',
  audience:'Parents and families in Los Angeles Valley', hook:item.message, cta:'Review the supplied creative',
  source:`User-provided B4K Creatives folder. ${item.provisional?'No date in filename; provisional November placement assigned as requested.':'Month and day preserved from the filename; year aligned to the existing November 2026 calendar.'} Instagram and 09:00 Los Angeles time are planning defaults.`,
  assetPath:'B4K Creatives/'+(item.images[0]||item.videos[0]), captionPath:'Not supplied',
  originalCalendarStatus:'Imported as draft', importBatch:'b4k-creatives-2026-11', productionNote:item.note||'',
  ...(b4kSourceUpdates['b4k-prepared-'+item.key]||{})
}));
const b4kCreativeAssets = Object.fromEntries(b4kPackages.map(item => ['b4k-prepared-'+item.key,{
  slides:item.images.map(b4kAssetURL), paths:item.images.map(name=>'B4K Creatives/'+name),
  videos:(item.videos||[]).map(name=>({src:b4kAssetURL(name),path:'B4K Creatives/'+name})),
  variants:item.alternates?[{label:'Alternate carousel export (1)',slides:item.alternates.map(b4kAssetURL),paths:item.alternates.map(name=>'B4K Creatives/'+name)}]:[]
}]));
