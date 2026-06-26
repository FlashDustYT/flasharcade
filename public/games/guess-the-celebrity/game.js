"use strict";

const CELEBRITIES = [
  {
    name: "Taylor Swift",
    aliases: ["taylor"],
    category: "Music",
    facts: [
      "Singer-songwriter who moved from country radio to global pop stadiums.",
      "Known for albums including Fearless, 1989, Folklore, and Midnights.",
      "Built a record-breaking tour around different eras of her career.",
      "Often hides clues and callbacks for fans inside lyrics, videos, and outfits.",
      "Rerecorded early albums and marked them with the phrase Taylor's Version.",
      "Started performing around Nashville as a teenager.",
      "Has a fan base commonly called Swifties.",
      "Wrote the hits Love Story, Blank Space, Anti-Hero, and Shake It Off."
    ]
  },
  {
    name: "Beyonce",
    aliases: ["queen bey", "bey"],
    category: "Music",
    facts: [
      "Houston-born singer who first became famous in Destiny's Child.",
      "Released solo albums including Dangerously in Love, Lemonade, and Renaissance.",
      "Known for precise stage shows, powerhouse vocals, and tight choreography.",
      "Often called Queen Bey by fans and pop culture writers.",
      "Played Deena Jones in the movie musical Dreamgirls.",
      "Headlined a famous Coachella set later released as Homecoming.",
      "Made the single Single Ladies a pop culture dance moment.",
      "Her visual albums often turn music releases into full cinematic events."
    ]
  },
  {
    name: "Rihanna",
    aliases: ["rihanna fenty", "rih"],
    category: "Music",
    facts: [
      "Barbados-born singer whose surname is Fenty.",
      "Built a beauty empire with Fenty Beauty.",
      "Released hits including Umbrella, Diamonds, Work, and We Found Love.",
      "Performed the Super Bowl halftime show while visibly pregnant.",
      "Her fashion line helped make inclusive shade ranges a beauty industry headline.",
      "Started releasing music as a teenager after being discovered in Barbados.",
      "Has a fan base often called the Navy.",
      "Played a hacker named Nine Ball in Ocean's 8."
    ]
  },
  {
    name: "Drake",
    aliases: ["aubrey graham"],
    category: "Music",
    facts: [
      "Canadian rapper and singer whose first name is Aubrey.",
      "Acted on Degrassi before becoming a global music star.",
      "Founded the OVO brand connected to an owl logo.",
      "Released songs including Hotline Bling, God's Plan, and One Dance.",
      "Frequently blends rap verses with melodic hooks.",
      "Often references Toronto and calls it the 6.",
      "Has broken many streaming and chart records.",
      "His music videos often become meme fuel almost immediately."
    ]
  },
  {
    name: "Kendrick Lamar",
    aliases: ["kendrick", "k dot"],
    category: "Music",
    facts: [
      "Compton rapper known for dense lyrics and concept albums.",
      "Won a Pulitzer Prize for the album DAMN.",
      "Released To Pimp a Butterfly and good kid, m.A.A.d city.",
      "Performed as part of the hip-hop Super Bowl halftime show in 2022.",
      "Often uses different voices and perspectives inside one song.",
      "Recorded the anthem HUMBLE.",
      "Worked on music for the Black Panther soundtrack.",
      "Frequently appears in greatest-rapper debates."
    ]
  },
  {
    name: "Lady Gaga",
    aliases: ["gaga", "stefani germanotta"],
    category: "Music",
    facts: [
      "Pop star and actor born Stefani Germanotta.",
      "Released the albums The Fame, Born This Way, and Chromatica.",
      "Won an Oscar for the song Shallow from A Star Is Born.",
      "Known for bold fashion, theatrical performances, and the phrase Little Monsters.",
      "Played Ally opposite Bradley Cooper in A Star Is Born.",
      "Recorded hits including Poker Face, Bad Romance, and Just Dance.",
      "Has performed at the Super Bowl halftime show.",
      "Often combines dance-pop with old Hollywood drama."
    ]
  },
  {
    name: "Ariana Grande",
    aliases: ["ariana"],
    category: "Music",
    facts: [
      "Singer and actor who started on Nickelodeon shows.",
      "Known for whistle tones and a high ponytail image.",
      "Released Thank U, Next, Positions, and Sweetener.",
      "Played Glinda in the film version of Wicked.",
      "Recorded hits including 7 Rings, Problem, and No Tears Left to Cry.",
      "Has a four-octave vocal range often praised by fans.",
      "Her fans are often called Arianators.",
      "Moved from sitcom fame into arena-level pop stardom."
    ]
  },
  {
    name: "Billie Eilish",
    aliases: ["billie"],
    category: "Music",
    facts: [
      "Singer-songwriter who often collaborates with her brother Finneas.",
      "Broke through with the song Ocean Eyes.",
      "Released Bad Guy and the album When We All Fall Asleep, Where Do We Go?",
      "Won major Grammy categories at a very young age.",
      "Known for intimate vocals, eerie production, and oversized fashion eras.",
      "Recorded the James Bond theme No Time to Die.",
      "Grew up in Los Angeles in a musical family.",
      "Frequently uses whispery delivery and unusual pop textures."
    ]
  },
  {
    name: "The Weeknd",
    aliases: ["abel tesfaye", "weeknd"],
    category: "Music",
    facts: [
      "Canadian singer whose birth name is Abel Tesfaye.",
      "Released the massive hit Blinding Lights.",
      "Known for dark R&B, synth-pop, and a cinematic red-suit era.",
      "Performed the Super Bowl halftime show in 2021.",
      "Released albums including Starboy, After Hours, and Dawn FM.",
      "First gained attention with mysterious mixtapes online.",
      "His falsetto is one of his signature sounds.",
      "Often builds album eras with recurring characters and visuals."
    ]
  },
  {
    name: "Ed Sheeran",
    aliases: ["ed"],
    category: "Music",
    facts: [
      "English singer-songwriter often seen with an acoustic guitar and loop pedal.",
      "Released hits including Shape of You, Thinking Out Loud, and Perfect.",
      "Names many albums after mathematical symbols.",
      "Wrote songs for himself and other major artists.",
      "Known for solo stadium shows built from live looping.",
      "Grew up in Suffolk, England.",
      "Appeared briefly in Game of Thrones.",
      "Often mixes folk-pop melodies with rap-influenced phrasing."
    ]
  },
  {
    name: "Dua Lipa",
    aliases: ["dua"],
    category: "Music",
    facts: [
      "British pop singer with Kosovo Albanian family roots.",
      "Released New Rules, Don't Start Now, and Levitating.",
      "Her album Future Nostalgia leaned into glossy disco-pop.",
      "Known for strong fashion visuals and dance-floor hooks.",
      "Started by posting cover songs online.",
      "Won Grammys for pop music releases.",
      "Has a deep, distinctive lower-register voice.",
      "Made the phrase 'new rules' part of a breakup anthem."
    ]
  },
  {
    name: "Harry Styles",
    aliases: ["harry"],
    category: "Music",
    facts: [
      "British singer who first became famous in One Direction.",
      "Released solo hits including Watermelon Sugar and As It Was.",
      "Known for playful fashion and gender-fluid style choices.",
      "Acted in Dunkirk and Don't Worry Darling.",
      "His solo debut included Sign of the Times.",
      "Often brings a classic rock influence into modern pop.",
      "Has hosted and performed on Saturday Night Live.",
      "His fan base treats concerts like a dress-up event."
    ]
  },
  {
    name: "Olivia Rodrigo",
    aliases: ["olivia"],
    category: "Music",
    facts: [
      "Singer and actor who broke through with Drivers License.",
      "Released the albums Sour and Guts.",
      "Started as a Disney Channel actor before becoming a pop star.",
      "Known for mixing piano ballads with pop-punk energy.",
      "Recorded the songs Good 4 U and Vampire.",
      "Won major Grammys early in her music career.",
      "Often writes about teenage heartbreak with sharp detail.",
      "Starred in High School Musical: The Musical: The Series."
    ]
  },
  {
    name: "Miley Cyrus",
    aliases: ["miley", "hannah montana"],
    category: "Music",
    facts: [
      "Singer and actor who played Hannah Montana.",
      "Released hits including Wrecking Ball, Party in the U.S.A., and Flowers.",
      "Comes from a country music family in Tennessee.",
      "Known for a raspy voice and frequent reinventions.",
      "Her father is Billy Ray Cyrus.",
      "Hosted New Year's Eve specials with famous guests.",
      "Moved from Disney fame into rock, pop, and country-influenced eras.",
      "Her song Flowers became a self-love anthem."
    ]
  },
  {
    name: "Adele",
    aliases: ["adele adkins"],
    category: "Music",
    facts: [
      "British singer known for powerful ballads and numbered album titles.",
      "Released 19, 21, 25, and 30.",
      "Recorded Hello, Rolling in the Deep, and Someone Like You.",
      "Her voice is often described as soulful and full-bodied.",
      "Won an Oscar for the James Bond song Skyfall.",
      "Often writes about heartbreak, regret, and growth.",
      "Has hosted a Las Vegas residency.",
      "Her album 21 became one of the defining pop albums of the 2010s."
    ]
  },
  {
    name: "Bruno Mars",
    aliases: ["bruno"],
    category: "Music",
    facts: [
      "Hawaii-born singer, songwriter, and performer.",
      "Released hits including Just the Way You Are, Locked Out of Heaven, and 24K Magic.",
      "Formed Silk Sonic with Anderson .Paak.",
      "Known for retro funk, polished choreography, and big live bands.",
      "Performed at the Super Bowl halftime show.",
      "Often channels Motown, funk, soul, and pop traditions.",
      "His birth name is Peter Gene Hernandez.",
      "Recorded Uptown Funk with Mark Ronson."
    ]
  },
  {
    name: "Justin Bieber",
    aliases: ["bieber"],
    category: "Music",
    facts: [
      "Canadian pop singer discovered from YouTube videos.",
      "Became a teen idol with the song Baby.",
      "Released Purpose and Justice.",
      "His fan base is known as Beliebers.",
      "Recorded hits including Sorry, Love Yourself, and Peaches.",
      "Worked with artists from pop, dance, R&B, and hip-hop.",
      "Was managed early by Scooter Braun.",
      "Has been famous since his early teens."
    ]
  },
  {
    name: "Selena Gomez",
    aliases: ["selena"],
    category: "Music",
    facts: [
      "Singer and actor who starred on Wizards of Waverly Place.",
      "Co-stars in Only Murders in the Building.",
      "Founded the beauty brand Rare Beauty.",
      "Released songs including Lose You to Love Me and Come & Get It.",
      "Was part of Selena Gomez & the Scene.",
      "Has been open about lupus and mental health advocacy.",
      "Started acting as a child on Barney & Friends.",
      "Balances music, acting, producing, and beauty entrepreneurship."
    ]
  },
  {
    name: "Katy Perry",
    aliases: ["katy"],
    category: "Music",
    facts: [
      "Pop singer behind Firework, Roar, and Teenage Dream.",
      "Served as a judge on American Idol.",
      "Known for bright candy-colored visuals and playful costumes.",
      "Performed at the Super Bowl halftime show with giant stage props.",
      "Released the album Prism.",
      "Her breakthrough included I Kissed a Girl and Hot N Cold.",
      "Has a powerful belting voice and theatrical pop style.",
      "Was born Katheryn Hudson."
    ]
  },
  {
    name: "Eminem",
    aliases: ["marshall mathers", "slim shady"],
    category: "Music",
    facts: [
      "Detroit rapper also known as Slim Shady.",
      "Starred in the film 8 Mile.",
      "Recorded Lose Yourself, Stan, and Without Me.",
      "Known for rapid-fire rhymes and alter egos.",
      "His real name is Marshall Mathers.",
      "Was mentored by Dr. Dre early in his mainstream career.",
      "Won an Oscar for Lose Yourself.",
      "Often mixes dark humor, battle rap, and personal storytelling."
    ]
  },
  {
    name: "Nicki Minaj",
    aliases: ["nicki", "onika"],
    category: "Music",
    facts: [
      "Rapper and singer whose fans are called Barbz.",
      "Released Pink Friday and Queen.",
      "Known for animated flows, alter egos, and sharp punchlines.",
      "Recorded Super Bass, Starships, and Anaconda.",
      "Born in Trinidad and raised in New York.",
      "Often shifts voices and characters within a verse.",
      "Collaborated with many major pop and hip-hop artists.",
      "Helped shape mainstream rap and pop in the 2010s."
    ]
  },
  {
    name: "SZA",
    aliases: ["solana rowe"],
    category: "Music",
    facts: [
      "R&B singer-songwriter born Solana Rowe.",
      "Released the acclaimed albums Ctrl and SOS.",
      "Recorded songs including Kill Bill, Good Days, and Snooze.",
      "Known for conversational lyrics and airy vocal runs.",
      "Signed with Top Dawg Entertainment.",
      "Often writes about insecurity, desire, and messy relationships.",
      "Collaborated with Kendrick Lamar on All the Stars.",
      "Her music blends R&B, pop, alternative, and hip-hop textures."
    ]
  },
  {
    name: "Doja Cat",
    aliases: ["doja"],
    category: "Music",
    facts: [
      "Rapper and singer known for viral internet instincts.",
      "Released Say So, Woman, and Paint the Town Red.",
      "Often moves between rap, pop, R&B, and oddball humor.",
      "First went viral with the playful song Mooo!",
      "Known for bold red-carpet looks and shape-shifting visuals.",
      "Her real name is Amala Dlamini.",
      "Has a flexible voice that switches from singing to rapping.",
      "Built a career partly through social media culture."
    ]
  },
  {
    name: "Bad Bunny",
    aliases: ["benito", "benito martinez"],
    category: "Music",
    facts: [
      "Puerto Rican superstar whose first name is Benito.",
      "Helped bring reggaeton and Latin trap to huge global audiences.",
      "Released Un Verano Sin Ti.",
      "Has appeared at WWE events.",
      "Known for fashion risks, sung-rap delivery, and genre blending.",
      "Recorded hits including Tití Me Pregunto and Moscow Mule.",
      "Often sings in Spanish while topping international charts.",
      "Has acted in films including Bullet Train."
    ]
  },
  {
    name: "Shakira",
    aliases: ["shakira ripoll"],
    category: "Music",
    facts: [
      "Colombian singer from Barranquilla.",
      "Recorded Hips Don't Lie, Whenever, Wherever, and Waka Waka.",
      "Known for belly-dance influenced movement and a distinctive voice.",
      "Performed a Super Bowl halftime show with Jennifer Lopez.",
      "Writes and sings in Spanish and English.",
      "Her album Laundry Service helped make her a global pop star.",
      "Has served as a coach on The Voice.",
      "Her music blends Latin pop, rock, dance, and world influences."
    ]
  },
  {
    name: "BTS",
    aliases: ["bangtan boys", "bangtan"],
    category: "Music",
    facts: [
      "Seven-member K-pop group from South Korea.",
      "Their fan base is called ARMY.",
      "Released English-language hits including Dynamite and Butter.",
      "Known for synchronized choreography and huge global fandom.",
      "Members include RM, Jin, Suga, J-Hope, Jimin, V, and Jung Kook.",
      "Began under Big Hit Entertainment.",
      "Often mixes pop, hip-hop, R&B, and introspective themes.",
      "Became one of the most globally recognized music groups of the 2010s and 2020s."
    ]
  },
  {
    name: "BLACKPINK",
    aliases: ["black pink"],
    category: "Music",
    facts: [
      "Four-member K-pop girl group from South Korea.",
      "Members are Jisoo, Jennie, Rose, and Lisa.",
      "Released songs including Ddu-Du Ddu-Du, Kill This Love, and How You Like That.",
      "Their fan base is called Blinks.",
      "Known for high-fashion visuals and punchy pop-rap hooks.",
      "Performed at Coachella.",
      "Debuted under YG Entertainment.",
      "Each member has also built a major solo profile."
    ]
  },
  {
    name: "Madonna",
    aliases: ["madonna ciccone"],
    category: "Music",
    facts: [
      "Pop icon often called the Queen of Pop.",
      "Released Like a Virgin, Vogue, and Like a Prayer.",
      "Known for reinvention across music, fashion, and performance.",
      "Starred as Eva Peron in Evita.",
      "Pushed music video and stage-tour spectacle forward in the 1980s and 1990s.",
      "Her full name includes Ciccone.",
      "Blended dance music, controversy, and pop hooks into a long career.",
      "Inspired generations of pop performers with bold image changes."
    ]
  },
  {
    name: "Prince",
    aliases: ["prince rogers nelson"],
    category: "Music",
    facts: [
      "Minneapolis musician known for Purple Rain.",
      "Played many instruments and produced much of his own work.",
      "At one point used an unpronounceable symbol as his name.",
      "Known for high vocals, guitar solos, funk, rock, and soul fusion.",
      "Recorded When Doves Cry, Kiss, and 1999.",
      "Built a creative home base at Paisley Park.",
      "Starred in the film Purple Rain.",
      "Was famous for guarding creative control over his music."
    ]
  },
  {
    name: "Michael Jackson",
    aliases: ["king of pop", "mj"],
    category: "Music",
    facts: [
      "Singer and dancer often called the King of Pop.",
      "Released Thriller, one of the most famous albums ever.",
      "Popularized the moonwalk on television.",
      "Started as a child star in the Jackson 5.",
      "Recorded Billie Jean, Beat It, and Smooth Criminal.",
      "His music videos turned pop singles into major visual events.",
      "Known for a single white glove and sharp dance moves.",
      "Worked with producer Quincy Jones on several classic albums."
    ]
  },
  {
    name: "Whitney Houston",
    aliases: ["whitney"],
    category: "Music",
    facts: [
      "Singer known for one of pop's most celebrated voices.",
      "Recorded I Will Always Love You for The Bodyguard.",
      "Starred in The Bodyguard opposite Kevin Costner.",
      "Released I Wanna Dance with Somebody.",
      "Often called The Voice by fans and media.",
      "Came from a musical family in New Jersey.",
      "Won many Grammys and other major awards.",
      "Her vocal runs influenced generations of singers."
    ]
  },
  {
    name: "Freddie Mercury",
    aliases: ["freddie", "farrokh bulsara"],
    category: "Music",
    facts: [
      "Lead singer of Queen with a legendary stage presence.",
      "Co-wrote Bohemian Rhapsody.",
      "Performed a famous Live Aid set at Wembley in 1985.",
      "Known for a powerful voice and flamboyant showmanship.",
      "Born Farrokh Bulsara.",
      "Recorded We Are the Champions and Somebody to Love with Queen.",
      "Often played piano while fronting arena rock anthems.",
      "Inspired the film Bohemian Rhapsody."
    ]
  },
  {
    name: "Elvis Presley",
    aliases: ["elvis", "king of rock"],
    category: "Music",
    facts: [
      "Singer often called the King of Rock and Roll.",
      "Lived at Graceland in Memphis.",
      "Recorded Hound Dog, Jailhouse Rock, and Suspicious Minds.",
      "Known for swiveling stage moves and a famous pompadour.",
      "Starred in many musical films.",
      "His early television appearances caused huge attention.",
      "Mixed country, blues, gospel, and rhythm and blues influences.",
      "Became one of the defining American stars of the 20th century."
    ]
  },
  {
    name: "Bob Marley",
    aliases: ["marley"],
    category: "Music",
    facts: [
      "Jamaican singer-songwriter who brought reggae to worldwide audiences.",
      "Recorded One Love, No Woman, No Cry, and Redemption Song.",
      "Fronted Bob Marley and the Wailers.",
      "Associated with Rastafari culture and messages of unity.",
      "His image often includes dreadlocks and a guitar.",
      "Born in Nine Mile, Jamaica.",
      "The album Legend introduced many listeners to his hits.",
      "His music remains central to reggae history."
    ]
  },
  {
    name: "Dolly Parton",
    aliases: ["dolly"],
    category: "Music",
    facts: [
      "Country music icon from Tennessee.",
      "Wrote Jolene and I Will Always Love You.",
      "Starred in the movie 9 to 5.",
      "Founded the Imagination Library book program.",
      "Known for big hair, sparkling outfits, and quick wit.",
      "Has a theme park connected to her name in Pigeon Forge.",
      "Bridges country songwriting, pop culture, and philanthropy.",
      "Often jokes about her image while keeping full control of it."
    ]
  },
  {
    name: "Leonardo DiCaprio",
    aliases: ["leo", "dicaprio"],
    category: "Movies",
    facts: [
      "Actor who became a global star with Titanic.",
      "Won an Oscar for The Revenant.",
      "Frequently collaborates with Martin Scorsese.",
      "Starred in Inception, The Wolf of Wall Street, and Catch Me If You Can.",
      "Known for environmental activism.",
      "Played Jack Dawson opposite Kate Winslet.",
      "Started acting on television before moving into major films.",
      "Often chooses intense roles in prestige dramas."
    ]
  },
  {
    name: "Dwayne Johnson",
    aliases: ["the rock", "dwayne the rock johnson"],
    category: "Movies",
    facts: [
      "Former pro wrestler known as The Rock.",
      "Moved from WWE fame into blockbuster movies.",
      "Starred in Jumanji, Moana, and Fast & Furious films.",
      "Known for a raised eyebrow and gym-heavy image.",
      "Played college football before wrestling.",
      "Voiced Maui in Moana.",
      "Often posts intense workout content.",
      "One of the most recognizable action-comedy stars of his era."
    ]
  },
  {
    name: "Tom Cruise",
    aliases: ["cruise"],
    category: "Movies",
    facts: [
      "Actor known for doing many of his own stunts.",
      "Stars as Ethan Hunt in the Mission: Impossible films.",
      "Played Maverick in Top Gun and Top Gun: Maverick.",
      "Ran through many famous action scenes on camera.",
      "Starred in Jerry Maguire, Rain Man, and A Few Good Men.",
      "Known for high-intensity action filmmaking.",
      "Became a major 1980s movie star with Risky Business.",
      "Often works with practical stunts and aircraft sequences."
    ]
  },
  {
    name: "Zendaya",
    aliases: ["zendaya coleman"],
    category: "Movies",
    facts: [
      "Actor and singer who started on Disney Channel.",
      "Won attention for playing Rue in Euphoria.",
      "Played MJ in the Spider-Man films with Tom Holland.",
      "Starred as Chani in Dune.",
      "Known for major red-carpet fashion moments.",
      "Her single name is also her stage name.",
      "Appeared in The Greatest Showman.",
      "Built a career across teen TV, prestige drama, and blockbusters."
    ]
  },
  {
    name: "Timothee Chalamet",
    aliases: ["timothee", "chalamet"],
    category: "Movies",
    facts: [
      "Actor known for Call Me by Your Name and Dune.",
      "Played Willy Wonka in Wonka.",
      "Often appears in fashion-forward red carpet looks.",
      "Starred as Paul Atreides in Dune.",
      "Worked with directors including Greta Gerwig and Denis Villeneuve.",
      "Appeared in Lady Bird and Little Women.",
      "Known for delicate, intense screen presence.",
      "Became one of the defining young movie stars of the late 2010s."
    ]
  },
  {
    name: "Margot Robbie",
    aliases: ["margot"],
    category: "Movies",
    facts: [
      "Australian actor who starred as Barbie.",
      "Played Harley Quinn in DC films.",
      "Starred in The Wolf of Wall Street and I, Tonya.",
      "Co-founded the production company LuckyChap.",
      "Produced films with strong female leads.",
      "Began on the Australian soap Neighbours.",
      "Earned major awards attention for I, Tonya.",
      "Known for balancing comedy, drama, and blockbuster roles."
    ]
  },
  {
    name: "Ryan Reynolds",
    aliases: ["reynolds"],
    category: "Movies",
    facts: [
      "Canadian actor known for fast, sarcastic delivery.",
      "Plays Deadpool in Marvel films.",
      "Co-owns Wrexham AFC with Rob McElhenney.",
      "Starred in Free Guy and The Proposal.",
      "Often uses self-aware humor in marketing.",
      "Married actor Blake Lively.",
      "Has been involved with brands including Aviation Gin.",
      "Turned a comic antihero into a signature movie role."
    ]
  },
  {
    name: "Emma Stone",
    aliases: ["emily stone"],
    category: "Movies",
    facts: [
      "Actor known for La La Land and Poor Things.",
      "Won an Oscar for playing Mia in La La Land.",
      "Starred in Easy A and The Help.",
      "Played Gwen Stacy in The Amazing Spider-Man films.",
      "Known for a husky voice and comic timing.",
      "Her birth name is Emily Stone.",
      "Frequently collaborates with director Yorgos Lanthimos.",
      "Moved from teen comedy into prestige film roles."
    ]
  },
  {
    name: "Jennifer Lawrence",
    aliases: ["j law", "lawrence"],
    category: "Movies",
    facts: [
      "Actor who played Katniss Everdeen in The Hunger Games.",
      "Won an Oscar for Silver Linings Playbook.",
      "Played Mystique in X-Men films.",
      "Known for blunt interviews and comic timing.",
      "Grew up in Kentucky.",
      "Starred in Winter's Bone as a breakout role.",
      "Frequently worked with director David O. Russell.",
      "Became one of the highest-profile movie stars of the 2010s."
    ]
  },
  {
    name: "Will Smith",
    aliases: ["fresh prince"],
    category: "Movies",
    facts: [
      "Actor and rapper who starred in The Fresh Prince of Bel-Air.",
      "Played Agent J in Men in Black.",
      "Won an Oscar for King Richard.",
      "Starred in Independence Day, Ali, and I Am Legend.",
      "Started as part of DJ Jazzy Jeff & The Fresh Prince.",
      "Known for a charismatic blockbuster persona.",
      "Recorded the theme song for The Fresh Prince.",
      "Played a tennis father and coach in King Richard."
    ]
  },
  {
    name: "Samuel L. Jackson",
    aliases: ["samuel jackson", "sam jackson"],
    category: "Movies",
    facts: [
      "Actor known for Pulp Fiction and many Quentin Tarantino films.",
      "Plays Nick Fury in Marvel movies.",
      "Has one of the most recognizable voices in film.",
      "Starred in Snakes on a Plane and Jackie Brown.",
      "Often brings sharp intensity and dry humor to roles.",
      "Appeared as Mace Windu in Star Wars prequels.",
      "Has been in an enormous number of films.",
      "His characters often become instantly quotable."
    ]
  },
  {
    name: "Morgan Freeman",
    aliases: ["freeman"],
    category: "Movies",
    facts: [
      "Actor famous for a calm, deep narration voice.",
      "Starred in The Shawshank Redemption.",
      "Won an Oscar for Million Dollar Baby.",
      "Played God in Bruce Almighty.",
      "Appeared in Driving Miss Daisy and Se7en.",
      "Often narrates documentaries and films.",
      "Played Lucius Fox in Christopher Nolan's Batman films.",
      "His voice is frequently used as shorthand for gravitas."
    ]
  },
  {
    name: "Scarlett Johansson",
    aliases: ["scarlett", "black widow"],
    category: "Movies",
    facts: [
      "Actor who plays Black Widow in Marvel films.",
      "Starred in Lost in Translation and Marriage Story.",
      "Known for a husky voice and old-Hollywood screen presence.",
      "Voiced an AI operating system in Her.",
      "Played Natasha Romanoff in The Avengers.",
      "Has balanced indie dramas with action blockbusters.",
      "Starred in Lucy and Jojo Rabbit.",
      "Received Oscar nominations in two acting categories in the same year."
    ]
  },
  {
    name: "Chris Hemsworth",
    aliases: ["hemsworth", "thor"],
    category: "Movies",
    facts: [
      "Australian actor best known as Thor.",
      "Wields a hammer in Marvel movies.",
      "Starred in Extraction and Rush.",
      "His brothers Liam and Luke are also actors.",
      "Known for action roles and comic timing.",
      "Started on the Australian soap Home and Away.",
      "Played a Norse god across many Marvel films.",
      "Often uses fitness and adventure as part of his public image."
    ]
  },
  {
    name: "Robert Downey Jr.",
    aliases: ["robert downey jr", "rdj", "iron man"],
    category: "Movies",
    facts: [
      "Actor who launched the Marvel movie era as Tony Stark.",
      "Played Iron Man across the Avengers films.",
      "Won an Oscar for Oppenheimer.",
      "Starred as Sherlock Holmes in action-comedy films.",
      "Known for rapid-fire wit and comeback career story.",
      "First appeared on screen as a child because of his filmmaker father.",
      "Played Charlie Chaplin in Chaplin.",
      "His character says 'I am Iron Man' in a key Marvel moment."
    ]
  },
  {
    name: "Keanu Reeves",
    aliases: ["keanu", "john wick", "neo"],
    category: "Movies",
    facts: [
      "Actor known for The Matrix and John Wick.",
      "Played Neo in a cyberpunk action franchise.",
      "Known for a gentle public image and action dedication.",
      "Starred in Speed and Bill & Ted's Excellent Adventure.",
      "Often trains heavily for fight scenes.",
      "Born in Beirut and raised partly in Canada.",
      "His John Wick character is tied to a stylish assassin world.",
      "Has become a beloved internet figure for his low-key kindness."
    ]
  },
  {
    name: "Jackie Chan",
    aliases: ["chan"],
    category: "Movies",
    facts: [
      "Hong Kong martial artist, actor, and stunt performer.",
      "Known for mixing action choreography with physical comedy.",
      "Starred in Rush Hour with Chris Tucker.",
      "Often performs dangerous stunts himself.",
      "Uses props and environments as part of fight scenes.",
      "Appeared in Drunken Master and Police Story.",
      "Has outtakes showing stunt mistakes and injuries.",
      "Became one of the world's most famous action stars."
    ]
  },
  {
    name: "Angelina Jolie",
    aliases: ["jolie"],
    category: "Movies",
    facts: [
      "Actor who played Lara Croft and Maleficent.",
      "Won an Oscar for Girl, Interrupted.",
      "Known for humanitarian work with refugees.",
      "Starred in Mr. & Mrs. Smith and Salt.",
      "Directed films as well as acting in them.",
      "Her father is actor Jon Voight.",
      "Played a winged Disney villain in live-action films.",
      "Often combines action roles with dramatic prestige projects."
    ]
  },
  {
    name: "Brad Pitt",
    aliases: ["pitt"],
    category: "Movies",
    facts: [
      "Actor who starred in Fight Club and Se7en.",
      "Won an acting Oscar for Once Upon a Time in Hollywood.",
      "Co-founded the production company Plan B.",
      "Starred in Ocean's Eleven and World War Z.",
      "Known for roles in both blockbusters and auteur films.",
      "Produced Oscar-winning films through Plan B.",
      "Played a stuntman named Cliff Booth.",
      "Often collaborates with directors like David Fincher and Quentin Tarantino."
    ]
  },
  {
    name: "Julia Roberts",
    aliases: ["julia"],
    category: "Movies",
    facts: [
      "Actor famous for Pretty Woman and a huge smile.",
      "Won an Oscar for Erin Brockovich.",
      "Starred in Notting Hill and My Best Friend's Wedding.",
      "Became one of the defining romantic-comedy stars of the 1990s.",
      "Played Tess Ocean in the Ocean's films.",
      "Her brother Eric Roberts is also an actor.",
      "Known for charm, warmth, and movie-star charisma.",
      "Starred opposite Richard Gere in Pretty Woman."
    ]
  },
  {
    name: "Meryl Streep",
    aliases: ["meryl"],
    category: "Movies",
    facts: [
      "Actor often described as one of the greatest of all time.",
      "Starred in The Devil Wears Prada and Sophie's Choice.",
      "Has received a record number of Oscar nominations for acting.",
      "Known for accents, transformations, and dramatic range.",
      "Played Margaret Thatcher in The Iron Lady.",
      "Appeared in Mamma Mia! as Donna.",
      "Frequently plays formidable, complicated women.",
      "Her name is shorthand for elite acting craft."
    ]
  },
  {
    name: "Tom Hanks",
    aliases: ["hanks"],
    category: "Movies",
    facts: [
      "Actor who starred in Forrest Gump, Cast Away, and Big.",
      "Voiced Woody in Toy Story.",
      "Won back-to-back Oscars in the 1990s.",
      "Played a stranded man who befriends a volleyball named Wilson.",
      "Often plays decent, everyman characters.",
      "Starred in Saving Private Ryan and Apollo 13.",
      "Worked often with director Steven Spielberg.",
      "Played Fred Rogers in A Beautiful Day in the Neighborhood."
    ]
  },
  {
    name: "Denzel Washington",
    aliases: ["denzel"],
    category: "Movies",
    facts: [
      "Actor known for Training Day, Malcolm X, and Glory.",
      "Won an Oscar for Training Day.",
      "Often plays commanding, morally complex characters.",
      "Worked with director Spike Lee on multiple films.",
      "Starred in The Equalizer films.",
      "Also directs and produces stage and screen projects.",
      "Played a high school football coach in Remember the Titans.",
      "Has a voice and presence that can dominate a scene."
    ]
  },
  {
    name: "Sandra Bullock",
    aliases: ["bullock"],
    category: "Movies",
    facts: [
      "Actor who starred in Speed, The Proposal, and Gravity.",
      "Won an Oscar for The Blind Side.",
      "Known for mixing comedy, drama, and action.",
      "Starred in Miss Congeniality as an undercover pageant contestant.",
      "Had a major hit with the space thriller Gravity.",
      "Played opposite Keanu Reeves in Speed.",
      "Often plays smart, flustered, resilient characters.",
      "Produced and starred in several of her films."
    ]
  },
  {
    name: "Harrison Ford",
    aliases: ["ford", "indiana jones", "han solo"],
    category: "Movies",
    facts: [
      "Actor famous for playing Han Solo and Indiana Jones.",
      "Starred in Star Wars and Raiders of the Lost Ark.",
      "Known for gruff charm and reluctant-hero roles.",
      "Played Rick Deckard in Blade Runner.",
      "Was a carpenter before becoming a major movie star.",
      "Often wears a fedora and carries a whip in one signature role.",
      "Starred in The Fugitive and Air Force One.",
      "Became one of the most iconic adventure actors in film."
    ]
  },
  {
    name: "Natalie Portman",
    aliases: ["portman"],
    category: "Movies",
    facts: [
      "Actor who won an Oscar for Black Swan.",
      "Played Padme Amidala in Star Wars prequels.",
      "Starred in V for Vendetta and Jackie.",
      "Graduated from Harvard while maintaining an acting career.",
      "Played Jane Foster in Marvel films.",
      "Started acting young in Leon: The Professional.",
      "Known for intense, intelligent performances.",
      "Has directed and produced films as well as acting."
    ]
  },
  {
    name: "Viola Davis",
    aliases: ["viola"],
    category: "Movies",
    facts: [
      "Actor known for Fences, The Help, and How to Get Away with Murder.",
      "Won an Oscar for Fences.",
      "Played Annalise Keating on television.",
      "Is one of the performers to achieve EGOT status.",
      "Known for emotional intensity and commanding monologues.",
      "Starred in The Woman King.",
      "Trained at Juilliard.",
      "Often speaks about opportunity and representation in Hollywood."
    ]
  },
  {
    name: "LeBron James",
    aliases: ["lebron", "king james"],
    category: "Sports",
    facts: [
      "Basketball superstar often called King James.",
      "Played for the Cavaliers, Heat, and Lakers.",
      "Became the NBA's all-time leading scorer.",
      "Won championships with three different franchises.",
      "Entered the NBA straight from high school.",
      "Starred in Space Jam: A New Legacy.",
      "Known for passing, power, longevity, and basketball IQ.",
      "Opened the I Promise School in Akron, Ohio."
    ]
  },
  {
    name: "Michael Jordan",
    aliases: ["mj", "jordan"],
    category: "Sports",
    facts: [
      "Basketball legend who won six championships with the Chicago Bulls.",
      "The Air Jordan sneaker line carries his name.",
      "Starred in the original Space Jam.",
      "Known for clutch shots, competitiveness, and a famous fadeaway.",
      "Won multiple NBA MVP awards.",
      "Briefly left basketball to play professional baseball.",
      "His number 23 became iconic.",
      "Central figure in the documentary The Last Dance."
    ]
  },
  {
    name: "Serena Williams",
    aliases: ["serena"],
    category: "Sports",
    facts: [
      "Tennis champion with 23 Grand Slam singles titles.",
      "Often discussed as one of the greatest athletes ever.",
      "Her sister Venus is also a tennis legend.",
      "Grew up training in Compton, California.",
      "Known for powerful serves and fierce baseline play.",
      "Won major titles across more than one decade.",
      "Expanded into fashion, business, and venture investing.",
      "Inspired the film King Richard about her family."
    ]
  },
  {
    name: "Cristiano Ronaldo",
    aliases: ["ronaldo", "cr7"],
    category: "Sports",
    facts: [
      "Portuguese football star known as CR7.",
      "Won multiple Ballon d'Or awards.",
      "Played for clubs including Manchester United, Real Madrid, and Juventus.",
      "Known for headers, goal scoring, and intense fitness.",
      "Captained Portugal to a European Championship win.",
      "His celebration includes a shouted jump landing.",
      "Has one of the largest social media followings in sports.",
      "Wears number 7 as a major part of his brand."
    ]
  },
  {
    name: "Lionel Messi",
    aliases: ["messi", "leo messi"],
    category: "Sports",
    facts: [
      "Argentine football star known for close control and playmaking.",
      "Won the 2022 FIFA World Cup with Argentina.",
      "Spent most of his club career at Barcelona.",
      "Won multiple Ballon d'Or awards.",
      "Known for left-footed dribbles and curling finishes.",
      "Often compared with Cristiano Ronaldo.",
      "Wore number 10 for club and country for many years.",
      "Became an icon of modern football creativity."
    ]
  },
  {
    name: "Simone Biles",
    aliases: ["biles"],
    category: "Sports",
    facts: [
      "American gymnast with many Olympic and world medals.",
      "Has several gymnastics skills named after her.",
      "Known for extraordinary difficulty and explosive tumbling.",
      "Helped make athlete mental health a wider sports conversation.",
      "Trained in Texas.",
      "Won Olympic all-around gold in 2016.",
      "Performed the Yurchenko double pike in competition.",
      "Often described as the greatest gymnast of all time."
    ]
  },
  {
    name: "Usain Bolt",
    aliases: ["bolt"],
    category: "Sports",
    facts: [
      "Jamaican sprinter known as the fastest man in history.",
      "Holds world records in the 100 meters and 200 meters.",
      "Famous for a lightning-bolt victory pose.",
      "Won Olympic sprint golds in 2008, 2012, and 2016.",
      "Known for relaxed confidence before races.",
      "Tall for a sprinter compared with many rivals.",
      "His last name perfectly matches his speed image.",
      "Helped turn track sprinting into a global spectacle."
    ]
  },
  {
    name: "Stephen Curry",
    aliases: ["steph curry", "curry"],
    category: "Sports",
    facts: [
      "NBA guard who transformed basketball with long three-point shooting.",
      "Plays for the Golden State Warriors.",
      "Won multiple NBA championships.",
      "Known for quick handles, deep range, and joyful celebrations.",
      "Played college basketball at Davidson.",
      "His father Dell Curry also played in the NBA.",
      "Won unanimous NBA MVP in 2016.",
      "Often chews on a mouthguard during games."
    ]
  },
  {
    name: "Naomi Osaka",
    aliases: ["osaka"],
    category: "Sports",
    facts: [
      "Tennis star with Japanese and Haitian heritage.",
      "Won Grand Slam singles titles on hard courts.",
      "Known for a powerful serve and calm baseline game.",
      "Has spoken openly about mental health in sports.",
      "Lit the Olympic cauldron in Tokyo in 2021.",
      "Defeated Serena Williams in a US Open final.",
      "Became one of the highest-profile athletes in tennis.",
      "Uses her platform for social causes and athlete wellness."
    ]
  },
  {
    name: "Tiger Woods",
    aliases: ["tiger", "woods"],
    category: "Sports",
    facts: [
      "Golf legend known for a red shirt on Sundays.",
      "Won the Masters multiple times.",
      "Became famous as a child golf prodigy.",
      "Dominated golf rankings for years.",
      "Made a celebrated comeback win at the 2019 Masters.",
      "His first name is a nickname.",
      "Known for intense focus and clutch putting.",
      "Helped make golf a mainstream global television event."
    ]
  },
  {
    name: "Kobe Bryant",
    aliases: ["kobe", "black mamba"],
    category: "Sports",
    facts: [
      "Los Angeles Lakers legend known as the Black Mamba.",
      "Won five NBA championships.",
      "Scored 81 points in a single NBA game.",
      "Won an Oscar for the short film Dear Basketball.",
      "Played his entire NBA career with the Lakers.",
      "Known for footwork, fadeaways, and relentless practice.",
      "Wore numbers 8 and 24.",
      "His Mamba Mentality phrase became a sports mantra."
    ]
  },
  {
    name: "Megan Rapinoe",
    aliases: ["rapinoe"],
    category: "Sports",
    facts: [
      "American soccer star known for the US Women's National Team.",
      "Won the FIFA Women's World Cup.",
      "Known for colorful hair and bold celebrations.",
      "Advocated for equal pay and LGBTQ rights.",
      "Won the Ballon d'Or Feminin in 2019.",
      "Played as a winger.",
      "Often crossed the ball with her left foot.",
      "Became one of the most visible voices in women's soccer."
    ]
  },
  {
    name: "Tom Brady",
    aliases: ["brady"],
    category: "Sports",
    facts: [
      "NFL quarterback with seven Super Bowl rings.",
      "Played most of his career with the New England Patriots.",
      "Also won a Super Bowl with Tampa Bay.",
      "Known for late-game comebacks and longevity.",
      "Was drafted in the sixth round.",
      "Worked for many years with coach Bill Belichick.",
      "Often appears in greatest-quarterback debates.",
      "Wore number 12 for most of his football career."
    ]
  },
  {
    name: "Patrick Mahomes",
    aliases: ["mahomes"],
    category: "Sports",
    facts: [
      "NFL quarterback for Kansas City.",
      "Known for no-look passes and creative arm angles.",
      "Won multiple Super Bowl MVP awards.",
      "His father played Major League Baseball.",
      "Played college football at Texas Tech.",
      "Often extends plays outside the pocket.",
      "Works closely with coach Andy Reid.",
      "Helped make Kansas City a modern NFL dynasty."
    ]
  },
  {
    name: "Shohei Ohtani",
    aliases: ["ohtani"],
    category: "Sports",
    facts: [
      "Japanese baseball star famous as both pitcher and hitter.",
      "Won multiple MLB MVP awards.",
      "Often compared with Babe Ruth because of his two-way role.",
      "Throws right-handed and bats left-handed.",
      "Started his pro career in Japan before moving to MLB.",
      "Known for huge home runs and high-velocity pitching.",
      "Became one of baseball's most marketable global stars.",
      "His rare skill set makes him both ace and slugger."
    ]
  },
  {
    name: "Oprah Winfrey",
    aliases: ["oprah"],
    category: "Icons",
    facts: [
      "Talk-show host whose first name became a global brand.",
      "Hosted The Oprah Winfrey Show for 25 seasons.",
      "Founded OWN, the Oprah Winfrey Network.",
      "Known for book club picks that can turn books into bestsellers.",
      "Acted in The Color Purple.",
      "Built Harpo Productions.",
      "Often interviews celebrities, authors, and public figures.",
      "Her giveaways and audience moments became television lore."
    ]
  },
  {
    name: "Kim Kardashian",
    aliases: ["kim", "kim k"],
    category: "Icons",
    facts: [
      "Reality TV star from Keeping Up with the Kardashians.",
      "Founded the shapewear brand SKIMS.",
      "Known for beauty, fashion, and social media influence.",
      "Studied law through a nontraditional path and advocates for justice reform.",
      "Her family built a large entertainment business around reality television.",
      "Has a mobile-game and beauty-brand history.",
      "Often sets internet conversation with magazine covers and red carpets.",
      "One of the most recognizable names in influencer culture."
    ]
  },
  {
    name: "Kylie Jenner",
    aliases: ["kylie"],
    category: "Icons",
    facts: [
      "Reality TV personality and beauty entrepreneur.",
      "Founded Kylie Cosmetics.",
      "Part of the Kardashian-Jenner family.",
      "Became famous on Keeping Up with the Kardashians.",
      "Known for lip kits and a huge social media following.",
      "Has a daughter named Stormi.",
      "Built a beauty brand around her personal image.",
      "Often appears in fashion campaigns and celebrity business headlines."
    ]
  },
  {
    name: "MrBeast",
    aliases: ["jimmy donaldson", "beast"],
    category: "Creators",
    facts: [
      "YouTube creator whose real name is Jimmy Donaldson.",
      "Known for huge challenge videos and large cash prizes.",
      "Built businesses including Feastables.",
      "Often funds philanthropy-style stunts and giveaways.",
      "Recreated Squid Game as a YouTube video challenge.",
      "Started making videos as a teenager in North Carolina.",
      "Known for fast pacing and enormous video budgets.",
      "One of the most subscribed individual creators on YouTube."
    ]
  },
  {
    name: "Charli D'Amelio",
    aliases: ["charli damelio", "charli"],
    category: "Creators",
    facts: [
      "Social media star who rose through TikTok dance videos.",
      "Became one of TikTok's earliest mega-creators.",
      "Starred in a family reality series.",
      "Known for short dance trends and mainstream brand deals.",
      "Her sister Dixie is also a creator and singer.",
      "Turned viral app fame into television and business opportunities.",
      "Built a massive audience while still a teenager.",
      "Helped define the TikTok celebrity wave."
    ]
  },
  {
    name: "Gordon Ramsay",
    aliases: ["ramsay"],
    category: "Icons",
    facts: [
      "Celebrity chef known for fiery critiques.",
      "Hosts Hell's Kitchen, Kitchen Nightmares, and MasterChef shows.",
      "Runs restaurants connected to Michelin stars.",
      "Known for shouting when food is badly cooked.",
      "Born in Scotland and built a career in Britain and beyond.",
      "Often tests chefs under pressure on television.",
      "Has a huge social media presence reacting to food videos.",
      "Balances high-end cooking with reality-TV drama."
    ]
  },
  {
    name: "David Beckham",
    aliases: ["beckham"],
    category: "Sports",
    facts: [
      "English football star known for free kicks and crossing.",
      "Played for Manchester United, Real Madrid, LA Galaxy, and England.",
      "Married Victoria Beckham from the Spice Girls.",
      "Became a fashion and advertising icon beyond football.",
      "Co-owns Inter Miami CF.",
      "Known for bending the ball around defensive walls.",
      "Wore number 7 for Manchester United.",
      "His name became part of the film title Bend It Like Beckham."
    ]
  },
  {
    name: "Elon Musk",
    aliases: ["musk"],
    category: "Icons",
    facts: [
      "Entrepreneur associated with Tesla and SpaceX.",
      "Helped popularize reusable rocket launches.",
      "Frequently posts on social media and moves markets with attention.",
      "Was involved with PayPal before his later companies.",
      "Promotes electric cars, rockets, and ambitious technology projects.",
      "Bought the social platform formerly known as Twitter.",
      "Often appears in business, tech, and culture headlines.",
      "Has a public image built around high-risk engineering goals."
    ]
  },
  {
    name: "Mark Zuckerberg",
    aliases: ["zuckerberg", "zuck"],
    category: "Icons",
    facts: [
      "Co-founder of Facebook.",
      "Built a company later renamed Meta.",
      "Was portrayed in the film The Social Network.",
      "Launched Facebook while a student at Harvard.",
      "Often associated with social media, virtual reality, and the metaverse.",
      "Known for hoodies in early Silicon Valley imagery.",
      "Has testified before Congress about technology issues.",
      "Helped shape how billions of people use social platforms."
    ]
  },
  {
    name: "Steve Jobs",
    aliases: ["jobs"],
    category: "Icons",
    facts: [
      "Apple co-founder known for product launches in a black turtleneck.",
      "Helped introduce the Macintosh, iPod, iPhone, and iPad.",
      "Co-founded Pixar before it became a movie powerhouse.",
      "Was forced out of Apple and later returned to lead it.",
      "Known for design obsession and dramatic keynote presentations.",
      "Worked closely with Steve Wozniak early in Apple history.",
      "Often said technology should meet the liberal arts.",
      "Became a symbol of consumer tech innovation."
    ]
  },
  {
    name: "Bill Gates",
    aliases: ["gates"],
    category: "Icons",
    facts: [
      "Microsoft co-founder and longtime software billionaire.",
      "Helped make Windows central to personal computing.",
      "Co-founded Microsoft with Paul Allen.",
      "Later focused heavily on philanthropy through a major foundation.",
      "Was once known for intense business competition in software.",
      "Dropped out of Harvard to build Microsoft.",
      "Often discusses global health, climate, and education issues.",
      "His name is tied to the rise of the PC era."
    ]
  },
  {
    name: "Michelle Obama",
    aliases: ["michelle"],
    category: "Icons",
    facts: [
      "Former First Lady of the United States.",
      "Wrote the bestselling memoir Becoming.",
      "Promoted health, education, and military family initiatives.",
      "Graduated from Princeton and Harvard Law School.",
      "Married Barack Obama.",
      "Known for speeches that mix warmth with directness.",
      "Hosted media projects after leaving the White House.",
      "Became one of the most admired public figures in America."
    ]
  },
  {
    name: "Barack Obama",
    aliases: ["obama"],
    category: "Icons",
    facts: [
      "44th president of the United States.",
      "Wrote Dreams from My Father and A Promised Land.",
      "Before the White House, served as a U.S. senator from Illinois.",
      "Known for the campaign slogan Yes We Can.",
      "Won the Nobel Peace Prize in 2009.",
      "Married Michelle Obama.",
      "Often releases annual music, book, and movie lists.",
      "Was the first Black president of the United States."
    ]
  }
];

const ROUND_STYLES = 24;
const MAX_LIVES = 3;
const STARTING_SKIPS = 3;
const CHILL_SECONDS = 30;
const BLITZ_SECONDS = 15;
const STORAGE_KEY = "guessCelebrityStats";

const dom = {
  categoryPill: document.getElementById("categoryPill"),
  roundCounter: document.getElementById("roundCounter"),
  timerFill: document.getElementById("timerFill"),
  timerText: document.getElementById("timerText"),
  hintList: document.getElementById("hintList"),
  guessForm: document.getElementById("guessForm"),
  guessInput: document.getElementById("guessInput"),
  submitButton: document.getElementById("submitButton"),
  choiceGrid: document.getElementById("choiceGrid"),
  feedbackText: document.getElementById("feedbackText"),
  skipButton: document.getElementById("skipButton"),
  scoreText: document.getElementById("scoreText"),
  streakText: document.getElementById("streakText"),
  livesText: document.getElementById("livesText"),
  bestText: document.getElementById("bestText"),
  chillMode: document.getElementById("chillMode"),
  blitzMode: document.getElementById("blitzMode"),
  dailyButton: document.getElementById("dailyButton"),
  shuffleButton: document.getElementById("shuffleButton"),
  accuracyText: document.getElementById("accuracyText"),
  accuracyFill: document.getElementById("accuracyFill"),
  poolText: document.getElementById("poolText"),
  skipText: document.getElementById("skipText"),
  soundToggle: document.getElementById("soundToggle"),
  newGameButton: document.getElementById("newGameButton"),
  confettiCanvas: document.getElementById("confettiCanvas")
};

const state = {
  rng: mulberry32(Date.now()),
  mode: "chill",
  current: null,
  currentHints: [],
  score: 0,
  streak: 0,
  lives: MAX_LIVES,
  skips: STARTING_SKIPS,
  round: 0,
  correct: 0,
  attempts: 0,
  secondsLeft: CHILL_SECONDS,
  maxSeconds: CHILL_SECONDS,
  locked: false,
  timerId: null,
  soundOn: true,
  audio: null,
  stats: loadStats()
};

function loadStats() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { best: 0, bestStreak: 0, played: 0, won: 0 };
  } catch {
    return { best: 0, bestStreak: 0, played: 0, won: 0 };
  }
}

function saveStats() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.stats));
}

function mulberry32(seed) {
  let value = seed >>> 0;
  return function random() {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(text) {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function choose(array) {
  return array[Math.floor(state.rng() * array.length)];
}

function shuffle(array) {
  const copy = [...array];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(state.rng() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function sample(array, count) {
  return shuffle(array).slice(0, count);
}

function combinationCount(total, chooseCount) {
  if (chooseCount > total) return 0;
  let numerator = 1;
  let denominator = 1;
  for (let i = 1; i <= chooseCount; i += 1) {
    numerator *= total - (chooseCount - i);
    denominator *= i;
  }
  return Math.round(numerator / denominator);
}

function cluePoolCount() {
  const raw = CELEBRITIES.reduce((sum, celeb) => sum + combinationCount(celeb.facts.length, 3), 0);
  return raw * ROUND_STYLES;
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value);
}

function startTimer() {
  clearInterval(state.timerId);
  state.maxSeconds = state.mode === "blitz" ? BLITZ_SECONDS : CHILL_SECONDS;
  state.secondsLeft = state.maxSeconds;
  renderTimer();
  state.timerId = setInterval(() => {
    if (state.locked) return;
    state.secondsLeft -= 1;
    renderTimer();
    if (state.secondsLeft <= 0) {
      handleTimeout();
    }
  }, 1000);
}

function renderTimer() {
  const pct = Math.max(0, state.secondsLeft / state.maxSeconds) * 100;
  dom.timerFill.style.width = `${pct}%`;
  dom.timerText.textContent = `${Math.max(0, state.secondsLeft)}s`;
}

function nextRound(message = "New celebrity. Read the clues.") {
  state.locked = false;
  state.round += 1;
  state.current = choose(CELEBRITIES);
  state.currentHints = sample(state.current.facts, 3);
  renderRound();
  setFeedback(message);
  startTimer();
  dom.guessInput.value = "";
  dom.guessInput.focus();
}

function renderRound() {
  dom.categoryPill.textContent = state.current.category;
  dom.roundCounter.textContent = `Round ${state.round}`;
  dom.hintList.innerHTML = "";
  state.currentHints.forEach((hint, index) => {
    const card = document.createElement("article");
    card.className = "hint-card";
    card.dataset.number = String(index + 1);
    const text = document.createElement("p");
    text.textContent = hint;
    card.append(text);
    dom.hintList.append(card);
  });
  renderChoices();
  renderStats();
}

function renderChoices() {
  const sameCategory = CELEBRITIES.filter(
    (celeb) => celeb.category === state.current.category && celeb.name !== state.current.name
  );
  const others = CELEBRITIES.filter((celeb) => celeb.name !== state.current.name);
  const decoys = sample(sameCategory.length >= 3 ? sameCategory : others, 3);
  const options = shuffle([state.current, ...decoys]);
  dom.choiceGrid.innerHTML = "";
  options.forEach((option) => {
    const button = document.createElement("button");
    button.className = "choice-button";
    button.type = "button";
    button.textContent = option.name;
    button.addEventListener("click", () => submitGuess(option.name, button));
    dom.choiceGrid.append(button);
  });
}

function renderStats() {
  dom.scoreText.textContent = formatNumber(state.score);
  dom.streakText.textContent = state.streak;
  dom.livesText.textContent = state.lives;
  dom.bestText.textContent = formatNumber(Math.max(state.stats.best, state.score));
  const total = state.correct + state.attempts;
  const accuracy = total ? Math.round((state.correct / total) * 100) : 0;
  dom.accuracyText.textContent = `${accuracy}%`;
  dom.accuracyFill.style.width = `${accuracy}%`;
  dom.skipText.textContent = `${state.skips} ${state.skips === 1 ? "skip" : "skips"} left`;
  dom.poolText.textContent = `${formatNumber(cluePoolCount())}+ clue mixes`;
  dom.soundToggle.classList.toggle("active", state.soundOn);
  dom.soundToggle.querySelector("span").textContent = state.soundOn ? "Sound" : "Muted";
  dom.chillMode.classList.toggle("active", state.mode === "chill");
  dom.blitzMode.classList.toggle("active", state.mode === "blitz");
}

function submitGuess(rawGuess, sourceButton = null) {
  if (state.locked) return;
  const guess = normalize(rawGuess);
  if (!guess) {
    pulseInput();
    setFeedback("Type a name first, then take your shot.");
    playSound("wrong");
    return;
  }

  const accepted = [state.current.name, ...state.current.aliases].map(normalize);
  const exact = accepted.includes(guess);
  const closeAlias = accepted.some((answer) => guess.length >= 4 && answer.includes(guess));

  if (exact || closeAlias) {
    if (sourceButton) sourceButton.classList.add("correct");
    handleCorrect();
  } else {
    if (sourceButton) sourceButton.classList.add("wrong");
    handleWrong("Nope. That name is not under these lights.");
  }
}

function handleCorrect() {
  state.locked = true;
  clearInterval(state.timerId);
  const timeBonus = Math.max(0, state.secondsLeft) * (state.mode === "blitz" ? 8 : 4);
  const streakBonus = Math.min(160, state.streak * 20);
  const points = 120 + timeBonus + streakBonus;
  state.score += points;
  state.streak += 1;
  state.correct += 1;
  state.stats.played += 1;
  state.stats.won += 1;
  state.stats.best = Math.max(state.stats.best, state.score);
  state.stats.bestStreak = Math.max(state.stats.bestStreak, state.streak);
  saveStats();
  setFeedback(`Correct: ${state.current.name}. +${points} points.`);
  playSound("correct");
  burstConfetti();
  renderStats();
  setTimeout(() => nextRound("Nice. Keep the streak alive."), 1100);
}

function handleWrong(message) {
  if (state.locked) return;
  state.attempts += 1;
  state.lives -= 1;
  state.streak = 0;
  playSound("wrong");
  pulseInput();

  if (state.lives <= 0) {
    state.locked = true;
    clearInterval(state.timerId);
    state.stats.best = Math.max(state.stats.best, state.score);
    saveStats();
    revealAnswer(`Game over. It was ${state.current.name}. Hit New to run it back.`);
  } else {
    setFeedback(`${message} ${state.lives} ${state.lives === 1 ? "life" : "lives"} left.`);
  }
  renderStats();
}

function handleTimeout() {
  if (state.locked) return;
  state.locked = true;
  clearInterval(state.timerId);
  state.attempts += 1;
  state.lives -= 1;
  state.streak = 0;
  playSound("wrong");

  if (state.lives <= 0) {
    state.stats.best = Math.max(state.stats.best, state.score);
    saveStats();
    revealAnswer(`Game over. Time ran out on ${state.current.name}. Hit New to run it back.`);
  } else {
    revealAnswer(`Time is up. That was ${state.current.name}.`);
    setTimeout(() => nextRound("The next spotlight is already moving."), 1200);
  }
  renderStats();
}

function revealAnswer(message) {
  [...dom.choiceGrid.children].forEach((button) => {
    if (normalize(button.textContent) === normalize(state.current.name)) {
      button.classList.add("correct");
    }
    button.disabled = true;
  });
  setFeedback(message);
}

function skipRound() {
  if (state.locked || state.skips <= 0) {
    playSound("wrong");
    setFeedback("No skips left. Time to trust your pop-culture instincts.");
    return;
  }
  state.skips -= 1;
  state.streak = 0;
  state.stats.played += 1;
  playSound("skip");
  revealAnswer(`Skipped. That was ${state.current.name}.`);
  renderStats();
  state.locked = true;
  clearInterval(state.timerId);
  setTimeout(() => nextRound("Fresh clues are on deck."), 950);
}

function setFeedback(message) {
  dom.feedbackText.textContent = message;
}

function pulseInput() {
  dom.guessInput.classList.remove("shake");
  requestAnimationFrame(() => dom.guessInput.classList.add("shake"));
}

function newGame(seed = Date.now(), mode = state.mode) {
  state.rng = mulberry32(seed);
  state.mode = mode;
  state.score = 0;
  state.streak = 0;
  state.lives = MAX_LIVES;
  state.skips = STARTING_SKIPS;
  state.round = 0;
  state.correct = 0;
  state.attempts = 0;
  state.locked = false;
  clearInterval(state.timerId);
  renderStats();
  nextRound("The spotlight is warm. First name?");
}

function dailySeed() {
  const now = new Date();
  const stamp = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  return hashString(`guess-celebrity-${stamp}`);
}

function initAudio() {
  if (!state.audio) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    state.audio = AudioContext ? new AudioContext() : null;
  }
  if (state.audio?.state === "suspended") {
    state.audio.resume();
  }
}

function playSound(type) {
  if (!state.soundOn) return;
  initAudio();
  if (!state.audio) return;

  const notes = {
    tap: [320, 0.035, "triangle", 0.025],
    correct: [660, 0.12, "sine", 0.055],
    wrong: [130, 0.16, "sawtooth", 0.04],
    skip: [250, 0.09, "square", 0.03]
  };
  const [frequency, duration, wave, volume] = notes[type] || notes.tap;
  const now = state.audio.currentTime;
  const oscillator = state.audio.createOscillator();
  const gain = state.audio.createGain();
  oscillator.type = wave;
  oscillator.frequency.setValueAtTime(frequency, now);
  if (type === "correct") {
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.5, now + duration);
  }
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(volume, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  oscillator.connect(gain);
  gain.connect(state.audio.destination);
  oscillator.start(now);
  oscillator.stop(now + duration + 0.02);
}

function resizeCanvas() {
  const ratio = window.devicePixelRatio || 1;
  dom.confettiCanvas.width = Math.floor(window.innerWidth * ratio);
  dom.confettiCanvas.height = Math.floor(window.innerHeight * ratio);
  dom.confettiCanvas.style.width = `${window.innerWidth}px`;
  dom.confettiCanvas.style.height = `${window.innerHeight}px`;
}

function burstConfetti() {
  const context = dom.confettiCanvas.getContext("2d");
  const ratio = window.devicePixelRatio || 1;
  const pieces = Array.from({ length: 44 }, () => ({
    x: (window.innerWidth / 2 + (state.rng() - 0.5) * 160) * ratio,
    y: (window.innerHeight * 0.24 + (state.rng() - 0.5) * 70) * ratio,
    vx: (state.rng() - 0.5) * 9 * ratio,
    vy: (-5 - state.rng() * 8) * ratio,
    size: (5 + state.rng() * 7) * ratio,
    color: choose(["#ff4f9f", "#2de2e6", "#ffe66d", "#7ee787", "#f27a54"]),
    spin: state.rng() * Math.PI,
    life: 70 + Math.floor(state.rng() * 25)
  }));

  function draw() {
    context.clearRect(0, 0, dom.confettiCanvas.width, dom.confettiCanvas.height);
    pieces.forEach((piece) => {
      piece.x += piece.vx;
      piece.y += piece.vy;
      piece.vy += 0.22 * ratio;
      piece.spin += 0.16;
      piece.life -= 1;
      context.save();
      context.translate(piece.x, piece.y);
      context.rotate(piece.spin);
      context.fillStyle = piece.color;
      context.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.62);
      context.restore();
    });
    if (pieces.some((piece) => piece.life > 0)) {
      requestAnimationFrame(draw);
    } else {
      context.clearRect(0, 0, dom.confettiCanvas.width, dom.confettiCanvas.height);
    }
  }

  draw();
}

dom.guessForm.addEventListener("submit", (event) => {
  event.preventDefault();
  submitGuess(dom.guessInput.value);
});

dom.skipButton.addEventListener("click", skipRound);
dom.shuffleButton.addEventListener("click", () => {
  playSound("skip");
  nextRound("Shuffled. New clues, same pressure.");
});
dom.dailyButton.addEventListener("click", () => {
  playSound("tap");
  newGame(dailySeed(), state.mode);
  setFeedback("Daily Mix loaded. Everyone gets this same seeded run today.");
});
dom.newGameButton.addEventListener("click", () => {
  playSound("tap");
  newGame(Date.now(), state.mode);
});
dom.soundToggle.addEventListener("click", () => {
  state.soundOn = !state.soundOn;
  playSound("tap");
  renderStats();
});
dom.chillMode.addEventListener("click", () => {
  if (state.mode !== "chill") {
    playSound("tap");
    newGame(Date.now(), "chill");
  }
});
dom.blitzMode.addEventListener("click", () => {
  if (state.mode !== "blitz") {
    playSound("tap");
    newGame(Date.now(), "blitz");
  }
});

document.addEventListener("pointerdown", (event) => {
  if (event.target.closest("button")) {
    playSound("tap");
  }
});

window.addEventListener("resize", resizeCanvas);

resizeCanvas();
renderStats();
newGame();
