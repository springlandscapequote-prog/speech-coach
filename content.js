/* Coaching text from Fernando's speech plan.
   Markup: **bold / stress**, ~italics or stage directions~, {/} short pause, {//} longer pause.
   Pause tokens are only used in practice scripts and the EDDM script, where the document uses / and //. */
window.SPEECH_CONTENT = {
  title: "Fernando - Speech, Articulation & Charisma Training",
  subtitle: "A 4-week practice plan for Fernando Rubio — Spring Landscape, Winter Bright & Spring Clean",
  version: "1.0.0",

  howTo: {
    heading: "1. How to Use This",
    paragraphs: [
      "This plan is built for a busy owner. You don't need a studio or a coach — just your phone, a quiet spot (the truck works), and **15–20 minutes a day**."
    ],
    routineLead: "Your daily routine (15–20 min):",
    routine: [
      "**10 minutes:** the Daily Articulation Drill (Section 2). Same drill every day — repetition is what changes your mouth habits.",
      "**5–10 minutes:** one charisma lesson (Section 3) — read the key idea, say the practice script out loud, do the 5-minute exercise."
    ],
    planLead: "The 4-week plan:",
    rulesLead: "Simple rules:",
    rules: [
      "**Say everything out loud.** Reading silently does not train your mouth.",
      "**Record often.** Your phone is your coach. You will hear things you never notice while talking.",
      "**Spanish is a strength, not a problem.** The goal is not to lose your accent. The goal is to be **clear, calm, and easy to follow**. Customers trust an owner who speaks with confidence — accent included.",
      "**Small wins count.** If you miss a day, just pick it up the next day. Don't restart.",
      "**Fill in the Weekly Self-Score (Section 5)** every Sunday."
    ]
  },

  weeks: [
    {
      week: 1,
      focus: "Clear sounds + strong first impression",
      lessonsLabel: "1, 2, 3",
      lessonIds: [1, 2, 3],
      extra: "Record yourself reading the EDDM script once (baseline)"
    },
    {
      week: 2,
      focus: "Presence + stories",
      lessonsLabel: "4, 5, 6",
      lessonIds: [4, 5, 6],
      extra: "Practice the EDDM script 3x this week"
    },
    {
      week: 3,
      focus: "Reading people + hard conversations",
      lessonsLabel: "7, 8, 9",
      lessonIds: [7, 8, 9],
      extra: "Use one technique on a real call or site visit every day"
    },
    {
      week: 4,
      focus: "Boundaries + polish",
      lessonsLabel: "10, 11, review all",
      lessonIds: [10, 11],
      extra: "Record the final EDDM video (Section 4)"
    }
  ],

  /* Day index 0–6 inside each week. Number = that lesson. "review" = the week's lessons. "all" = review all (week 4). */
  rotation: {
    1: [1, 2, 3, 1, 2, 3, "review"],
    2: [4, 5, 6, 4, 5, 6, "review"],
    3: [7, 8, 9, 7, 8, 9, "review"],
    4: [10, 11, "all", 10, 11, "all", "all"]
  },

  drill: {
    heading: "2. Daily 10-Minute Articulation Drill",
    intro: "Do these in order. Use a timer.",
    steps: [
      {
        id: "warmup",
        title: "Step 1 — Warm-Up",
        minutesLabel: "2 minutes",
        seconds: 120,
        parts: [
          {
            label: "Belly breathing",
            seconds: 30,
            text: "Hand on your stomach. Breathe in through your nose for 4 counts — your stomach moves out, not your shoulders. Breathe out slowly for 6 counts. Repeat 3 times."
          },
          {
            label: "Lip trills",
            seconds: 30,
            text: "Blow air through closed, relaxed lips so they buzz like a motor (\"brrrrr\"). Slide your voice low to high and back."
          },
          {
            label: "Jaw release",
            seconds: 30,
            text: "Open your mouth wide like a big yawn, hold 2 seconds, close. Then move your jaw gently side to side. Massage the muscles in front of your ears."
          },
          {
            label: "Tongue stretch",
            seconds: 30,
            text: "Stick your tongue out and down, hold. Then touch the roof of your mouth behind your top teeth. Then sweep it around the inside of your lips 5 times each way."
          }
        ]
      },
      {
        id: "overart",
        title: "Step 2 — Over-Articulation Reading",
        minutesLabel: "2 minutes",
        seconds: 120,
        paragraphs: [
          "Read the paragraph below **slowly and with exaggerated mouth movement** — like you're talking to someone across a noisy job site who reads lips. Open your mouth more than feels normal. Hit every last sound of every word."
        ],
        quote: "Thank you for calling Spring Landscape. This is Fernando. We take care of lawns, beds, and shrubs across Auburn and the nearby cities. We trimmed and pruned the hedges this past month, and we cleaned up the beds before the rain. I'd be glad to stop by, walk the property with you, and give you a clear price.",
        after: "Then read it again at **normal speed**, keeping the same clean endings. You'll notice the second read sounds sharper."
      },
      {
        id: "twisters",
        title: "Step 3 — Tongue Twisters for Spanish-Speaker Sounds",
        minutesLabel: "3 minutes",
        seconds: 180,
        intro: "Pick **3–4 sets per day** and rotate. Say each line 3 times: slow, medium, then natural speed. Accuracy first, speed later.",
        sets: [
          {
            title: "TH (soft \"th\" in ~think~ and voiced \"th\" in ~this~)",
            how: "Put the tip of your tongue lightly **between your teeth** and blow air. Not \"t\" or \"d,\" not \"s\" or \"z.\"",
            lines: [
              "**Th**ree **th**ousand **th**in **th**orns **th**rough **th**e hedge.",
              "**Th**is is **th**e **th**ird **th**ing **th**at **th**ey **th**ought about."
            ],
            business: "**Th**ank you — I **th**ink **th**at's **th**e best option for **th**e property."
          },
          {
            title: "V vs. B",
            how: "**V** = top teeth gently touch your bottom lip and the sound buzzes. **B** = both lips press together and pop.",
            lines: [
              "**V**ery **b**ig **v**ans **b**ring **v**aluable **b**ark.",
              "The **b**est **v**iew is **b**ehind the **v**ine."
            ],
            business: "We pro**v**ide a **v**isit e**v**ery week — **b**ushes, **b**eds, and **v**alue."
          },
          {
            title: "Short I (~sit~) vs. Long EE (~seat~)",
            how: "Short **i** is relaxed and quick, mouth barely open. Long **ee** is a big smile, longer sound.",
            lines: [
              "sit / seat — fill / feel — ship / sheep — live / leave — hill / heal",
              "T**i**m w**i**ll f**i**ll the b**i**n — then l**ea**ve the **ea**st f**ie**ld cl**ea**n."
            ],
            lineLabels: ["Pairs:", ""],
            business: "**I**t's a b**i**g h**i**ll, but we'll k**ee**p it gr**ee**n and cl**ea**n."
          },
          {
            title: "Final consonants (don't drop the last sound)",
            how: "Finish every word. The last sound is short but **clear** — t, d, k, p, s, st.",
            lines: [
              "We trim**med** the ol**d** ben**t** plan**ts** las**t** wee**k**.",
              "The bes**t** fron**t** yar**d** nex**t** stree**t**."
            ],
            business: "The firs**t** visi**t** is jus**t** a walk and a tal**k**."
          },
          {
            title: "-ED endings (three sounds: t / d / id)",
            howParagraphs: [
              "After sounds like p, k, s, sh, ch, f → **\"t\"**: ~raked~ = \"raykt,\" ~fixed~ = \"fikst,\" ~washed~ = \"washt.\"",
              "After voiced sounds (b, g, v, z, m, n, l, r, vowels) → **\"d\"**: ~trimmed~ = \"trimd,\" ~cleaned~ = \"kleend,\" ~hired~ = \"hyrd.\"",
              "After t or d → **\"id\"** (extra syllable): ~planted~ = \"plan-tid,\" ~needed~ = \"nee-did,\" ~started~ = \"star-tid.\""
            ],
            lines: [
              "We **raked**, **trimmed**, and **planted** — then we **washed** the walks and **started** the next yard.",
              "We **hired** two drivers, **trained** them, and **added** two routes."
            ]
          },
          {
            title: "SH vs. CH",
            how: "**SH** is soft, continuous air (\"shhh\" like asking for quiet). **CH** starts with a little stop (\"t\" + \"sh\").",
            lines: [
              "**Sh**e **ch**ose **sh**ort **ch**ips for the **sh**ady **ch**urch.",
              "**Ch**eck the **sh**rubs, then **ch**op the **sh**oots."
            ],
            business: "I'll **sh**ow you the **ch**anges and **sh**are the **ch**oices."
          },
          {
            title: "Z (buzzing \"z\")",
            how: "Same mouth as \"s,\" but turn your voice **on** — you should feel a buzz in your throat. Many words spelled with \"s\" are actually \"z\": ~is, was, has, trees, homes, shrubs~.",
            lines: [
              "**Z**ack's **z**ebra **z**ig**z**ags in the **z**one.",
              "The tree**s** i**s** ea**s**y — the home**s** need the**s**e."
            ],
            lineNotes: ["", "(all **z** sounds)"],
            business: "Our crew**s** care for home**s**, tree**s**, and shrub**s**.",
            businessNote: "(crews = \"krooz,\" homes = \"homz,\" trees = \"treez\")"
          }
        ]
      },
      {
        id: "pace",
        title: "Step 4 — Pace Control",
        minutesLabel: "1.5 minutes",
        seconds: 90,
        paragraphs: [
          "**Target pace: about 140–160 words per minute.** That's calm, clear, and easy for customers to follow.",
          "**How to check:** Read the EDDM script (Section 4) out loud with a timer. Count the words you finished in one minute. Too fast? Add more pauses. Too slow? Shorten the pauses, don't rush the words.",
          "**Tip:** When you're nervous, you speed up. Slow down **on purpose** for prices, dates, and anything important."
        ]
      },
      {
        id: "fillers",
        title: "Step 5 — Pause Instead of Filler Words",
        minutesLabel: "1 minute",
        seconds: 60,
        paragraphs: [
          "Filler words — \"um,\" \"eh,\" \"like,\" \"you know,\" \"o sea,\" \"este\" — make you sound unsure. A **silent pause** makes you sound thoughtful and in control.",
          "**Drill:** Talk for 60 seconds about \"what we do on a typical maintenance visit.\" Every time you feel a filler coming, **close your mouth and pause** for one second instead.",
          "**Rule:** Pause **before** a key point and **after** a price. Silence is not awkward — it's power."
        ]
      },
      {
        id: "record",
        title: "Step 6 — Record & Review Checklist",
        minutesLabel: "30 seconds to record, review later",
        seconds: 30,
        paragraphs: [
          "Record one 30-second clip a day (a business line, the over-articulation paragraph, or part of the EDDM script). Listen once and check:"
        ],
        checks: [
          "Could a stranger understand every word?",
          "Did I finish my word endings (t, d, s, -ed)?",
          "Did I hit my target sounds (th, v, z, short i)?",
          "Was my pace calm (not rushing)?",
          "How many filler words? (Goal: fewer every week.)",
          "Did my voice go **down** at the end of sentences (confident) instead of **up** (sounds like a question)?",
          "Did I sound warm — like I'd want to hire this guy?"
        ]
      }
    ]
  },

  lessonsIntro: {
    heading: "3. Eleven Charisma Lessons (\"Unlock Your Charisma\")",
    text: "Do one lesson per practice day (see the 4-week plan). Each lesson has: a key idea, techniques, a practice script from your real business, and a 5-minute exercise."
  },

  marks: {
    lead: "How to read the marks:",
    items: [
      { mark: "/", label: "short pause (half a second)" },
      { mark: "//", label: "longer pause (one full second — breathe)" },
      { mark: "Bold", label: "stress this word (a little louder, a little slower)" }
    ]
  },

  lessons: [
    {
      id: 1,
      title: "First Impressions",
      keyIdea: "People decide fast whether they like and trust you — usually before you talk about price or services. Your first few seconds (face, handshake, voice, the first sentence) set the tone for the whole visit. Make the first moment about **them**, not about selling.",
      techniques: [
        "**Arrive \"on\":** Before you get out of the truck, take one slow breath, relax your shoulders, and smile. Start the visit already calm.",
        "**Name + smile + eye contact:** Use the customer's name in your first sentence. Look them in the eye for a full second.",
        "**Open with a question about them,** not a pitch about you.",
        "**Use a warm, lower voice** — not loud, not rushed."
      ],
      scriptTitle: "Practice script — opening a site visit:",
      script: "Hi, Mrs. Johnson? {/} I'm **Fernando**, {/} owner of Spring Landscape. {/} **Thank** you for having me out. {/} Before I look at anything, {/} tell me — {/} what's **bothering** you most about the yard right now? {/} And what would make it feel **right** to you?",
      exercise: "Stand in front of a mirror (or a phone on video). Say the opening script 5 times. Each time, change one thing: smile bigger, slower first sentence, stronger eye contact, lower voice, longer pause after their name. Pick the version you like best and use it on your next real visit."
    },
    {
      id: 2,
      title: "Build Trust with Your Voice",
      keyIdea: "Customers judge your honesty by **how** you sound, not only what you say. A steady, warm voice with clear endings sounds trustworthy; a fast, rising, or quiet voice sounds unsure. Your voice should say: \"I know what I'm doing, and I care.\"",
      techniques: [
        "**Downward endings:** End statements with your voice going **down**. Going up makes a fact sound like a question.",
        "**Slow down on important words:** prices, dates, what's included.",
        "**Speak from your belly:** use the breathing from your warm-up so your voice is full, not thin.",
        "**Warmth in the voice:** a slight smile while you talk — people can hear it, even on the phone."
      ],
      scriptTitle: "Practice script — explaining what the property needs:",
      script: "Here's what I'm **seeing**. {/} Your laurel hedge is getting **too tall** {/} and it's shading the lawn. {/} If we prune it at the **right time**, {/} it comes back **thicker** {/} and the grass gets more **light**. {/} That's what I'd **recommend**.",
      exercise: "Record the script twice: once with your voice going **up** at the end of every sentence, once going **down**. Listen to both. Notice which one you would trust. Then record it a third time, the trustworthy way, and save it as your example."
    },
    {
      id: 3,
      title: "Confidence to Win",
      keyIdea: "Confidence is not \"being sure you'll win\" — it's being calm about your value. When you state a price, the customer watches your face and listens to your voice. If you flinch, apologize, or rush, they think the price is soft. Say it once, clearly, then **stop talking**.",
      techniques: [
        "**State, don't ask:** \"The price is…\" — not \"Would it be okay if…\"",
        "**No apology words:** drop \"just,\" \"only,\" \"sorry, but,\" \"I know it's a lot.\"",
        "**Price → pause → value (only if asked).** After the number, count to three in your head in silence.",
        "**Strong posture:** feet planted, shoulders back, hands still."
      ],
      scriptTitle: "Practice script — stating a maintenance price without flinching:",
      script: "For weekly maintenance — {/} mowing, edging, blowing, {/} and keeping the beds **clean** — {/} your price is **$___ per visit**. {/} ~[pause — count to 3 silently]~ {/} That includes **seasonal** pruning at the **right** times {/} and me checking in on what the property **needs**.",
      note: "(Fill in the real number before practicing. Practice saying the number itself 10 times — calm and flat, no smile-apology.)",
      exercise: "Write 5 real prices you quote often. Say each one out loud 5 times, each time followed by 3 seconds of silence. Record one round. Listen for: Did I rush the number? Did my voice drop at the end? Did I fill the silence?"
    },
    {
      id: 4,
      title: "Speak in Front of Any Room",
      keyIdea: "Whether it's a crew meeting at 7 a.m., an HOA board, or a camera, the same rules work: know your **first line** and **last line** by heart, slow down, and talk to one person at a time. Nerves are normal — they're energy you can use.",
      techniques: [
        "**Memorize the first and last sentence.** The middle can be notes.",
        "**One person, one thought:** look at one person while you finish a sentence, then move to the next person.",
        "**Three-point rule:** keep any talk to three main points.",
        "**Breathe before you start:** 4 in, 6 out — then begin."
      ],
      scriptTitle: "Practice script — Monday crew meeting:",
      script: "Good morning, team. {/} **Three** things today. {/} **One** — {/} safety glasses on, every stop. {/} **Two** — {/} clean edges on every walk. That's what customers **notice**. {/} **Three** — {/} if a customer asks you something you're not sure about, {/} be polite and **call me**. {/} Let's have a **great** week.",
      exercise: "Stand up. Place three objects around the room (a cup, a hat, a chair) — they are your \"audience.\" Give the crew-meeting script while looking at a different object for each sentence. Do it 3 times. On the last round, add one sentence of your own."
    },
    {
      id: 5,
      title: "Storytelling Secrets",
      keyIdea: "People forget lists of services but remember stories. A simple story has a **before**, a **problem**, what **you did**, and the **after**. Stories make customers see themselves in your work — and they're perfect for your EDDM video.",
      techniques: [
        "**Before → Problem → Action → After.** Keep it to 4–6 sentences.",
        "**Use one specific detail** (a hedge, a slope, a front walk) — details make it real.",
        "**Show the feeling:** how the customer felt before and after.",
        "**End with a simple point:** what it means for the listener."
      ],
      scriptTitle: "Practice script — a customer story for a site visit:",
      script: "We had a homeowner {/} whose yard was **overgrown** — {/} shrubs covering the windows, {/} beds full of weeds. {/} She was **embarrassed** to have people over. {/} We cleaned it up, {/} pruned everything at the **right** time, {/} and now we keep it **consistent** every visit. {/} She told me she finally **enjoys** coming home. {/} That's what we want for **your** place too.",
      note: "(Use a real customer story from your own experience, and keep their name private.)",
      exercise: "Write one real story from your business in 4–6 short lines using Before → Problem → Action → After. Tell it out loud 3 times without reading. Record the last one. Check: Did it have one clear detail? Was it under one minute?"
    },
    {
      id: 6,
      title: "Body Language",
      keyIdea: "Your body talks before your mouth does. Open, relaxed, steady body language says \"trustworthy and in charge.\" Closed or nervous body language (crossed arms, looking down, fidgeting) can undo good words.",
      techniques: [
        "**Open posture:** arms uncrossed, hands visible, chest open.",
        "**Stand at an angle** next to the customer while looking at the yard together — it feels like a partnership, not a sales pitch.",
        "**Point with an open hand,** not one finger.",
        "**Still hands while talking money.** Fidgeting during price sounds like doubt.",
        "**Nod slowly** when they speak — it shows you're listening."
      ],
      scriptTitle: "Practice script — walking the property side by side:",
      script: "Let's walk it **together**. {/} ~[open hand toward the beds]~ {/} Over here, {/} the beds need a good **cleanup** and fresh edges. {/} ~[open hand toward the hedge]~ {/} This hedge needs **pruning** before spring. {/} ~[turn to face them, hands still]~ {/} Here's what I **recommend**.",
      exercise: "Record a video of yourself (phone propped up) doing the script while walking around a room. Watch it with the **sound off.** Ask: Do I look calm? Are my hands open? Do I look like someone I'd hire? Fix one thing and record again."
    },
    {
      id: 7,
      title: "Read People Professionally",
      keyIdea: "Good salespeople and managers listen with their eyes as well as their ears. Notice how a customer or crew member is feeling — rushed, worried, price-focused, detail-focused — and adjust how you talk. This is not mind-reading; it's paying attention and asking.",
      techniques: [
        "**Watch for signs:** checking the phone or looking at the door = rushed (keep it short). Lots of questions = detail person (give more detail). Arms crossed + \"how much?\" early = price-focused (get to the number, then value).",
        "**Match their pace:** fast talker → be a little quicker and direct. Slow talker → slow down.",
        "**Ask, don't assume:** \"Do you want the short version or the full walk-through?\"",
        "**Listen for the real worry** behind the question."
      ],
      scriptTitle: "Practice script — checking what the customer wants:",
      script: "I can see you're **busy**, {/} so let me ask — {/} do you want the **quick** version {/} or should we **walk** the whole property? {/} … {/} Got it. {/} What matters **most** to you: {/} the **price**, {/} how it **looks**, {/} or not having to **think** about it?",
      exercise: "Think of your last 3 customer conversations. For each, write one line: ~What were they feeling? What did they care about most? What would I say differently now?~ Then say the practice script out loud twice, once fast and short, once slow and detailed."
    },
    {
      id: 8,
      title: "Deliver Hard Feedback Quickly",
      keyIdea: "Hard feedback works best when it's **fast, specific, and private**. Don't wait, don't make it a long speech, and don't attack the person — talk about the work. Then show the right way and move on.",
      techniques: [
        "**Same day, in private.** Not in front of the customer or the whole crew.",
        "**Fact → Impact → Fix:** what happened, why it matters, what to do next time.",
        "**Short:** under one minute.",
        "**End with confidence in them:** \"I know you can do this.\""
      ],
      scriptTitle: "Practice script — correcting a crew member:",
      script: "Hey, {/} quick thing. {/} At the last stop, {/} the edges along the driveway were **skipped**. {/} The customer **notices** that first. {/} Next time, {/} edge **every** walk and driveway {/} before you blow. {/} You do good work — {/} I just need it **every** time. {/} **Thanks**.",
      exercise: "Pick one real issue with a crew member (past or present). Write it in Fact → Impact → Fix form, 3–4 sentences. Say it out loud 3 times, under 45 seconds, calm voice. If you plan to say it in Spanish to the crew, practice it in both languages."
    },
    {
      id: 9,
      title: "Handle Difficult People Intelligently",
      keyIdea: "Upset or difficult people want to feel **heard** first. If you argue right away, they push harder. Stay calm, slow down your voice, repeat back what they said, then move to facts and a clear next step. For unpaid invoices: friendly, firm, and specific.",
      techniques: [
        "**Lower and slower:** when they get louder, you get calmer.",
        "**Name it:** \"I hear you — that's frustrating.\"",
        "**Facts, not feelings:** dates, amounts, what was done.",
        "**Give a clear next step with a date.**",
        "**Don't take it personally.** It's business."
      ],
      scriptTitle: "Practice script — customer with an overdue invoice:",
      script: "Hi Mr. Davis, {/} it's **Fernando** from Spring Landscape. {/} I'm calling about the invoice from **[month]** — {/} it's **$___** {/} and it's now **past due**. {/} I know things get busy. {/} Can we get that taken care of {/} by **[day]**? {/} … {/} ~[if they push back]~ {/} I understand. {/} The work was done on **[date]**, {/} and I want to keep your service going **without interruption**. {/} What day **works** for you to pay it?",
      exercise: "Have someone (family member or friend) play an annoyed customer. Run the script twice. Your only goals: keep your voice low and slow, don't interrupt, and end with a specific date. If no partner, record yourself playing both sides."
    },
    {
      id: 10,
      title: "Say No Without Being Unpleasant",
      keyIdea: "Saying no protects your prices, your crews, and your schedule. A good \"no\" is short, kind, and gives a reason or an alternative — no long excuses. You can be warm **and** firm at the same time.",
      techniques: [
        "**Thank → No → Why (short) → Option.**",
        "**Don't over-explain.** Long explanations sound like guilt and invite bargaining.",
        "**Offer what you ~can~ do** (a smaller scope, a different schedule) — never a lower price for the same work.",
        "**Same calm voice as when you state a price.**"
      ],
      scriptTitle: "Practice script — saying no to a discount:",
      script: "I **appreciate** you asking. {/} I'm not able to **lower** the price for the same service — {/} that price is what lets me keep the work **consistent** {/} and do it **right**. {/} What I **can** do {/} is adjust what's included, {/} so it fits your **budget**. {/} Would you like me to show you that option?",
      exercise: "Write down 3 things people ask you for that you want to say no to (a discount, a last-minute job, \"just one extra thing for free\"). For each, write a Thank → No → Why → Option answer in 3 sentences. Say each out loud 3 times. Record the hardest one."
    },
    {
      id: 11,
      title: "Interrupt Gracefully",
      keyIdea: "As an owner, your time is valuable. Some callers talk for a long time without getting to the point. Interrupting politely is a skill: use their name, appreciate what they said, then steer to the next step. It's respectful to both of you.",
      techniques: [
        "**Use their name** — it gets attention gently.",
        "**Bridge words:** \"Let me jump in for a second…\" / \"That's helpful — so…\"",
        "**Summarize** what they said in one sentence so they feel heard.",
        "**Steer to an action:** a visit, a time, a decision."
      ],
      scriptTitle: "Practice script — cutting off a rambling caller:",
      script: "Mrs. Garcia — {/} let me jump in for **one** second. {/} That's really **helpful**. {/} So it sounds like {/} the **back** yard is the biggest concern {/} and you'd like it **cleaned up** before the holidays. {/} The best next step {/} is for me to come **see** it. {/} Does **Tuesday** or **Thursday** work better for you?",
      exercise: "Play a 2-minute podcast or YouTube video of someone talking. At random moments, pause it and practice your interruption out loud: name → bridge → one-sentence summary → next step. Do it 5 times."
    }
  ],

  eddm: {
    heading: "4. EDDM Intro Video Script (60–90 seconds)",
    timing: "About 160 words — at 140–160 words per minute plus the pauses, this runs about 65–80 seconds.",
    lines: [
      "Hi, {/} I'm **Fernando Rubio**, {/} owner of **Spring Landscape** {/} here in **Auburn**. {//}",
      "This year {/} we **grew**. {/} Mid-year, {/} we hired **two experienced drivers** {/} and trained them **our way**. {//}",
      "Now we have the **equipment** {/} and the **people** {/} for **two more routes** — {/} which means we have room {/} for about **one hundred new homes** {/} in your neighborhood. {//}",
      "We have a place for **all property types**. {/} Some of our customers {/} get **full service** — {/} about **two hours** on site, {/} taking care of **everything**. {/} Others need a **quick** visit — {/} about **twenty minutes** {/} to keep things **sharp**. {/} **Both** get the same care. {//}",
      "We **trim** and **prune** {/} at the **right times** of the year. {/} And we don't just do the work — {/} we **advise** you {/} on what your property **needs**. {//}",
      "Our crews are **predictable**, {/} **consistent**, {/} and **knowledgeable**. {/} You'll know **who's** coming {/} and **what** to expect. {//}",
      "If you got our **postcard**, {/} I'd love to hear from you. {/} Let's take **care** {/} of your home. {//}",
      "**Thank you.**"
    ],
    note: "Note: Before recording, make sure every line matches what you actually offer — the 2-hours and 20-minutes examples are the only visit times in the script, and they are examples of customer types, not promises. If \"You'll know who's coming\" isn't always true, change it to \"You'll know what to expect.\"",
    rehearsal: {
      heading: "Rehearsal Routine",
      beforeLead: "Days before recording (Week 4):",
      before: [
        "**Read it 3 times out loud** with the pause and stress marks. Don't worry about memorizing.",
        "**Mark your trouble words** — likely ones: ~three/through, experienced, trained, routes, property, predictable, consistent, knowledgeable, thank~. Say each one slowly 5 times.",
        "**Learn the first and last lines by heart.** The middle can be read from a phone or a cue card just below the camera."
      ],
      dayLead: "Recording day:",
      day: [
        "**Warm up** (Step 1 of the daily drill — 2 minutes).",
        "**Set up:** camera at eye level, light in front of you (face a window), quiet spot, phone horizontal or vertical depending on the landing page.",
        "**Record 3 takes:**",
        "**Take 1 — Natural:** just get through it.",
        "**Take 2 — Slower:** add a little more pause at every **//**.",
        "**Take 3 — Warmest:** smile through it, as if talking to one neighbor."
      ],
      reviewLead: "Review each take with this checklist:",
      review: [
        "Time is between 60 and 90 seconds",
        "Every word is clear — especially ~Auburn, experienced, routes, prune, knowledgeable~",
        "Final sounds are clean (-ed in ~hired, trained~; final ~s/z~ in ~routes, homes, types~)",
        "No filler words",
        "Voice goes **down** at the end of sentences",
        "Eyes on the camera lens, not the screen",
        "Shoulders relaxed, face friendly",
        "The ending feels warm, not rushed"
      ],
      close: "**Pick the best take.** If none is good enough, rest 10 minutes and record 3 more. Usually take 4–6 is the winner."
    }
  },

  score: {
    heading: "5. Weekly Self-Score Checklist",
    intro: "Every Sunday, score yourself **1–5** (1 = needs a lot of work, 5 = strong). Be honest — this is just for you. Listen to one recording from the week before scoring.",
    scale: "1 = needs a lot of work, 5 = strong. Total is out of 75.",
    skills: [
      "Did the daily drill (days out of 7)",
      "TH sounds clear",
      "V vs. B clear",
      "Short i vs. long ee",
      "Final consonants and -ed endings",
      "SH / CH and Z sounds",
      "Pace (calm, ~140–160 wpm)",
      "Pauses instead of filler words",
      "Confident voice (endings go down)",
      "First impression on site visits",
      "Stating prices without flinching",
      "Body language (open, calm hands)",
      "Hard conversations (crew, invoices, \"no\")",
      "Interrupting politely",
      "EDDM script delivery"
    ],
    totalLabel: "Total (out of 75)",
    winLabel: "One win this week:",
    nextLabel: "One thing to focus on next week:",
    close: "Keep going. Clear, calm, and warm beats perfect every time."
  }
};
