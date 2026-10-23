import type { Mission, Scene, Step } from "./types.ts";

const scene = (
  title: string,
  setting: string,
  partner: string,
  prompts: Scene["prompts"],
): Scene => ({ title, setting, partner, prompts });
const step = (
  cue: string,
  example: string,
  alternatives: string[] = [],
  choices?: Step["choices"],
): Step => ({ cue, example, alternatives, ...(choices ? { choices } : {}) });

// Both lives exercise the same skill. The final turn changes the situation and
// removes choices: recognising an answer is not treated as independent use.
export const missions: Mission[] = [
  {
    id: "first-hello",
    stage: 0,
    skill: "あいさつする",
    icon: "sunny-outline",
    minutes: 5,
    baby: scene(
      "Hello, little world",
      "朝の光。目を開けると、Mia が笑いかけています。",
      "Mia",
      [
        "Hello!",
        "Are you happy?",
        "I gave you a little teddy bear. What do you say?",
        "Dad is leaving for work. Say goodbye to him.",
      ],
    ),
    real: scene(
      "Your first hello",
      "新しい街のカフェ。隣の人に話しかけられました。",
      "Mia",
      [
        "Hello!",
        "Are you happy to be here?",
        "Here is your coffee. What do you say?",
        "Your new friend is leaving. Say goodbye.",
      ],
    ),
    steps: [
      step(
        "あいさつを返す",
        "Hello!",
        ["Hi!", "Hey!"],
        ["Hello!", "Blue.", "Three."],
      ),
      step(
        "うれしいと伝える",
        "Yes, I am.",
        ["Yes!", "I am happy."],
        ["No, a book.", "Yes, I am.", "Goodbye."],
      ),
      step("お礼を言う", "Thank you.", ["Thanks!", "Thank you very much."]),
      step("別れのあいさつ", "Goodbye!", [
        "Bye!",
        "See you!",
        "See you later.",
      ]),
    ],
  },
  {
    id: "ask-for-water",
    stage: 0,
    skill: "ほしいものを伝える",
    icon: "water-outline",
    minutes: 5,
    baby: scene(
      "A little thirsty",
      "遊んでいたら、のどがかわきました。Mia に伝えてみましょう。",
      "Mia",
      [
        "What do you want?",
        "Water or milk?",
        "Ask me for water politely.",
        "Dad has the milk now. Ask him for milk.",
      ],
    ),
    real: scene(
      "At the counter",
      "カフェで飲み物を注文。小さな一言から始めます。",
      "Barista",
      [
        "What do you want?",
        "Water or milk?",
        "Ask me for water politely.",
        "You are at another shop. Ask for milk politely.",
      ],
    ),
    steps: [
      step(
        "水がほしい",
        "Water, please.",
        ["I want water."],
        ["Water, please.", "Hello.", "Two."],
      ),
      step(
        "水を選ぶ",
        "Water.",
        ["Water, please."],
        ["Milk.", "Water.", "Bye."],
      ),
      step("水を丁寧に頼む", "Can I have water, please?", [
        "Water, please.",
        "Could I have some water, please?",
        "Can I have some water?",
      ]),
      step("今度は牛乳を頼む", "Can I have milk, please?", [
        "Milk, please.",
        "Could I have some milk, please?",
        "Can I have some milk?",
      ]),
    ],
  },
  {
    id: "choose-and-count",
    stage: 0,
    skill: "色と数で選ぶ",
    icon: "color-palette-outline",
    minutes: 5,
    baby: scene(
      "The little red ball",
      "おもちゃ箱を開けました。どれで遊びたい？",
      "Mia",
      [
        "A red ball or a blue ball?",
        "One ball or two balls?",
        "Tell me you want two red balls.",
        "Now we are picking apples. Ask for three green apples.",
      ],
    ),
    real: scene(
      "At the market",
      "市場で色と数を使って買い物をします。",
      "Shopkeeper",
      [
        "A red ball or a blue ball?",
        "One ball or two balls?",
        "Tell me you want two red balls.",
        "At the fruit stand, ask for three green apples.",
      ],
    ),
    steps: [
      step(
        "赤を選ぶ",
        "Red.",
        ["The red ball.", "A red ball."],
        ["Red.", "Hello.", "Milk."],
      ),
      step("2つ選ぶ", "Two.", ["Two balls."], ["One.", "Two.", "Blue."]),
      step("赤いボールを2つ頼む", "Two red balls, please.", [
        "I want two red balls.",
        "Can I have two red balls?",
      ]),
      step("緑のりんごを3つ頼む", "Three green apples, please.", [
        "I want three green apples.",
        "Can I have three green apples?",
      ]),
    ],
  },
  {
    id: "say-how-you-feel",
    stage: 1,
    skill: "気持ちや状態を話す",
    icon: "happy-outline",
    minutes: 6,
    baby: scene(
      "A very big day",
      "公園でたくさん遊びました。今の気持ちを伝えます。",
      "Mia",
      [
        "How do you feel?",
        "Are you hungry?",
        "Tell me you are tired and want to rest.",
        "Your friend looks worried. Ask how they feel.",
      ],
    ),
    real: scene(
      "After a long day",
      "仕事帰りに友人と会いました。お互いの調子を話します。",
      "Sam",
      [
        "How do you feel?",
        "Are you hungry?",
        "Tell me you are tired and want to rest.",
        "Your colleague looks worried. Ask how they feel.",
      ],
    ),
    steps: [
      step(
        "疲れている",
        "I am tired.",
        ["I'm tired."],
        ["I am tired.", "It is blue.", "Three apples."],
      ),
      step(
        "おなかがすいた",
        "Yes, I am hungry.",
        ["Yes, I'm hungry.", "Yes, I am."],
        ["No, a book.", "Yes, I am hungry.", "See you."],
      ),
      step("疲れたので休みたい", "I am tired. I want to rest.", [
        "I'm tired and I want to rest.",
        "I am tired, so I want to rest.",
      ]),
      step("相手の気持ちを尋ねる", "How do you feel?", [
        "How are you feeling?",
        "Are you okay?",
      ]),
    ],
  },
  {
    id: "find-your-things",
    stage: 1,
    skill: "場所を尋ねる",
    icon: "search-outline",
    minutes: 6,
    baby: scene(
      "Where is teddy?",
      "大切なくまが見つかりません。一緒に探しましょう。",
      "Mia",
      [
        "The teddy is on the bed. Where is it?",
        "Is the teddy under the chair?",
        "You cannot find your book. Ask me where it is.",
        "You are at the station. Ask where the bathroom is.",
      ],
    ),
    real: scene(
      "Find your way",
      "出かける前に忘れ物を確認。次は駅で道を尋ねます。",
      "Sam",
      [
        "Your bag is on the bed. Where is it?",
        "Is your bag under the chair?",
        "You cannot find your book. Ask me where it is.",
        "At the station, ask where the bathroom is.",
      ],
    ),
    steps: [
      step(
        "ベッドの上",
        "It is on the bed.",
        ["It's on the bed.", "On the bed."],
        ["Under the table.", "It is on the bed.", "In the park."],
      ),
      step(
        "違うと答える",
        "No, it is not.",
        ["No, it isn't.", "No."],
        ["Yes.", "No, it is not.", "Tomorrow."],
      ),
      step("本の場所を尋ねる", "Where is my book?", [
        "Where's my book?",
        "Do you know where my book is?",
      ]),
      step("トイレの場所を尋ねる", "Where is the bathroom?", [
        "Where is the restroom?",
        "Could you tell me where the bathroom is?",
      ]),
    ],
  },
  {
    id: "likes-and-routines",
    stage: 1,
    skill: "好きなことを話す",
    icon: "heart-outline",
    minutes: 6,
    baby: scene(
      "My favorite little things",
      "おやつとお絵描きの時間。好きなものを話します。",
      "Mia",
      [
        "Do you like apples?",
        "What do you do every morning?",
        "Tell me you like reading books.",
        "You meet a new friend. Ask what they like to do.",
      ],
    ),
    real: scene(
      "Getting to know you",
      "新しい友人と、趣味やいつもの生活を話します。",
      "Sam",
      [
        "Do you like apples?",
        "What do you do every morning?",
        "Tell me you like reading books.",
        "You meet a new colleague. Ask what they like to do.",
      ],
    ),
    steps: [
      step(
        "りんごが好き",
        "Yes, I like apples.",
        ["Yes, I do."],
        ["Yes, I like apples.", "Yesterday.", "On the bed."],
      ),
      step(
        "毎朝コーヒーを飲む",
        "I drink coffee every morning.",
        ["Every morning, I drink coffee."],
        [
          "I drank coffee yesterday.",
          "I drink coffee every morning.",
          "I will drink coffee tomorrow.",
        ],
      ),
      step("読書が好き", "I like reading books.", [
        "I like to read books.",
        "I enjoy reading books.",
      ]),
      step("趣味を尋ねる", "What do you like to do?", [
        "What do you enjoy doing?",
        "What are your hobbies?",
      ]),
    ],
  },
  {
    id: "tell-me-yesterday",
    stage: 2,
    skill: "過去の出来事を話す",
    icon: "time-outline",
    minutes: 7,
    baby: scene(
      "Yesterday at the park",
      "昨日の冒険を、家族に話してみましょう。",
      "Dad",
      [
        "Where did you go yesterday?",
        "Did you have fun?",
        "Tell me you went to the park and played with a friend.",
        "Your friend came back from a trip. Ask what they did yesterday.",
      ],
    ),
    real: scene(
      "How was your weekend?",
      "月曜日の朝。昨日の出来事を短く共有します。",
      "Colleague",
      [
        "Where did you go yesterday?",
        "Did you have fun?",
        "Tell me you went to the park and played with a friend.",
        "A colleague returns from a trip. Ask what they did yesterday.",
      ],
    ),
    steps: [
      step("昨日公園に行った", "I went to the park yesterday.", [
        "Yesterday, I went to the park.",
      ]),
      step("楽しかった", "Yes, I had fun.", ["Yes, I did.", "It was fun."]),
      step(
        "公園で友人と遊んだ",
        "I went to the park and played with a friend.",
        ["Yesterday I went to the park and played with my friend."],
      ),
      step("昨日したことを尋ねる", "What did you do yesterday?", [
        "What did you do yesterday afternoon?",
      ]),
    ],
  },
  {
    id: "make-a-plan",
    stage: 2,
    skill: "予定を決める",
    icon: "calendar-outline",
    minutes: 7,
    baby: scene(
      "Our next adventure",
      "明日はどこへ行こう？家族で計画を立てます。",
      "Mia",
      [
        "What are you going to do tomorrow?",
        "When should we meet?",
        "Suggest meeting at the park at ten.",
        "The park is closed. Suggest going to the library instead.",
      ],
    ),
    real: scene(
      "See you tomorrow",
      "友人との約束を決め、予定変更にも対応します。",
      "Sam",
      [
        "What are you going to do tomorrow?",
        "When should we meet?",
        "Suggest meeting at the park at ten.",
        "The park is closed. Suggest going to the library instead.",
      ],
    ),
    steps: [
      step("明日友人に会う予定", "I am going to meet a friend tomorrow.", [
        "I'm going to meet a friend tomorrow.",
        "I will meet a friend tomorrow.",
      ]),
      step("10時を提案", "At ten.", [
        "At ten o'clock.",
        "Let us meet at ten.",
        "Let's meet at ten.",
      ]),
      step("公園に10時集合", "Let's meet at the park at ten.", [
        "Let us meet at the park at ten.",
        "How about meeting at the park at ten?",
      ]),
      step("代わりに図書館を提案", "Let's go to the library instead.", [
        "How about going to the library instead?",
        "We could go to the library instead.",
      ]),
    ],
  },
  {
    id: "ask-again",
    stage: 2,
    skill: "聞き返して会話を続ける",
    icon: "ear-outline",
    minutes: 7,
    baby: scene(
      "One more time?",
      "知らない言葉が出てきました。分かるまで聞いて大丈夫。",
      "Teacher",
      [
        "Please put it beside the cabinet.",
        "Beside means next to.",
        "I spoke too fast. Ask me to speak more slowly.",
        "You hear a new word: appointment. Ask what it means.",
      ],
    ),
    real: scene(
      "Keep the conversation going",
      "会議や道案内で、聞き取れなかったときの一言を練習します。",
      "Colleague",
      [
        "Please put it beside the cabinet.",
        "Beside means next to.",
        "I spoke too fast. Ask me to speak more slowly.",
        "You hear a new word: appointment. Ask what it means.",
      ],
    ),
    steps: [
      step("もう一度お願いする", "Could you say that again, please?", [
        "Can you repeat that, please?",
        "Could you repeat that?",
        "Sorry, could you say that again?",
      ]),
      step("理解したと伝える", "I understand now. Thank you.", [
        "I see. Thank you.",
        "Now I understand. Thanks.",
      ]),
      step("ゆっくり話してもらう", "Could you speak more slowly, please?", [
        "Can you speak more slowly?",
        "Please speak more slowly.",
      ]),
      step("appointment の意味を聞く", "What does appointment mean?", [
        "What does the word appointment mean?",
        "Could you explain what appointment means?",
      ]),
    ],
  },
  {
    id: "describe-a-person",
    stage: 3,
    skill: "人や物を説明する",
    icon: "person-outline",
    minutes: 8,
    baby: scene(
      "A new friend",
      "新しくできた友人を、家族に紹介します。",
      "Dad",
      [
        "What is your friend like?",
        "What does your friend enjoy?",
        "Describe a friend who is kind and likes music.",
        "Someone lost a small red bag. Describe it to the teacher.",
      ],
    ),
    real: scene(
      "Let me introduce someone",
      "同僚のことを紹介し、特徴を具体的に説明します。",
      "Colleague",
      [
        "What is your friend like?",
        "What does your friend enjoy?",
        "Describe a friend who is kind and likes music.",
        "Someone lost a small red bag. Describe it to the staff.",
      ],
    ),
    steps: [
      step("親切な人", "My friend is kind.", [
        "My friend is very kind.",
        "They are kind.",
      ]),
      step("音楽が好き", "My friend likes music.", [
        "They like music.",
        "My friend enjoys music.",
      ]),
      step("特徴をつなげて話す", "My friend is kind and likes music.", [
        "My friend is very kind and enjoys music.",
      ]),
      step("小さな赤いかばん", "It is a small red bag.", [
        "It's a small red bag.",
        "The bag is small and red.",
      ]),
    ],
  },
  {
    id: "give-an-update",
    stage: 3,
    skill: "進捗を伝える",
    icon: "checkmark-circle-outline",
    minutes: 8,
    baby: scene(
      "Building something together",
      "工作の時間。できたことと、助けてほしいことを伝えます。",
      "Teacher",
      [
        "Have you finished the first part?",
        "What will you do next?",
        "Explain that you finished the first part but need more time.",
        "Your teammate needs an update. Say you will finish it tomorrow.",
      ],
    ),
    real: scene(
      "A small work update",
      "短い進捗共有。完了・次の作業・期限を伝えます。",
      "Team lead",
      [
        "Have you finished the first part?",
        "What will you do next?",
        "Explain that you finished the first part but need more time.",
        "Your teammate needs an update. Say you will finish it tomorrow.",
      ],
    ),
    steps: [
      step("最初の部分は完了", "I have finished the first part.", [
        "I've finished the first part.",
        "I finished the first part.",
      ]),
      step("次は結果を確認", "I will check the results next.", [
        "I'll check the results next.",
        "Next, I will check the results.",
      ]),
      step(
        "完了したが時間が必要",
        "I finished the first part, but I need more time.",
        ["I have finished the first part, but I need more time."],
      ),
      step("明日完了すると伝える", "I will finish it tomorrow.", [
        "I'll finish it tomorrow.",
        "I am going to finish it tomorrow.",
      ]),
    ],
  },
  {
    id: "invite-a-friend",
    stage: 3,
    skill: "誘う・丁寧に断る",
    icon: "people-outline",
    minutes: 8,
    baby: scene(
      "Come and play",
      "友人を遊びに誘います。都合が悪いときは別の日を提案。",
      "Sam",
      [
        "Would you like to play on Saturday?",
        "What time works for you?",
        "Invite me to have lunch on Sunday.",
        "You are busy on Sunday. Decline politely and suggest Monday.",
      ],
    ),
    real: scene(
      "Make time for a friend",
      "ランチに誘い、無理のない予定をすり合わせます。",
      "Sam",
      [
        "Would you like to meet on Saturday?",
        "What time works for you?",
        "Invite me to have lunch on Sunday.",
        "You are busy on Sunday. Decline politely and suggest Monday.",
      ],
    ),
    steps: [
      step("喜んで承諾", "Yes, I would love to.", [
        "Yes, I'd love to.",
        "That sounds great.",
      ]),
      step("正午を提案", "How about noon?", ["Noon works for me.", "At noon."]),
      step("日曜のランチに誘う", "Would you like to have lunch on Sunday?", [
        "Do you want to have lunch on Sunday?",
        "How about lunch on Sunday?",
      ]),
      step(
        "断り、月曜を提案",
        "Sorry, I am busy on Sunday. How about Monday?",
        [
          "Sorry, I'm busy on Sunday. How about Monday?",
          "I cannot make it on Sunday. Could we meet on Monday?",
        ],
      ),
    ],
  },
  {
    id: "explain-a-problem",
    stage: 4,
    skill: "困りごとを説明する",
    icon: "construct-outline",
    minutes: 8,
    baby: scene(
      "It will not work",
      "作ったロボットが動きません。問題を伝えて助けを求めます。",
      "Teacher",
      [
        "What is the problem?",
        "When did it stop working?",
        "Tell me it stopped working this morning and ask for help.",
        "Your train ticket does not work. Ask the staff for help.",
      ],
    ),
    real: scene(
      "Something is not working",
      "機器のトラブルを説明し、必要な助けを頼みます。",
      "Support",
      [
        "What is the problem?",
        "When did it stop working?",
        "Tell me it stopped working this morning and ask for help.",
        "Your train ticket does not work. Ask the staff for help.",
      ],
    ),
    steps: [
      step("動かない", "It is not working.", [
        "It isn't working.",
        "It does not work.",
      ]),
      step("今朝から", "It stopped working this morning.", ["This morning."]),
      step(
        "状況と依頼をまとめる",
        "It stopped working this morning. Could you help me?",
        ["It stopped working this morning. Can you help me, please?"],
      ),
      step("切符の問題を説明", "My ticket is not working. Could you help me?", [
        "My ticket isn't working. Could you help me?",
        "My ticket does not work. Can you help me?",
      ]),
    ],
  },
  {
    id: "give-a-reason",
    stage: 4,
    skill: "意見と理由を話す",
    icon: "chatbubbles-outline",
    minutes: 8,
    baby: scene(
      "What do you think?",
      "週末の過ごし方を相談。自分の意見に理由を添えます。",
      "Mia",
      [
        "Should we go to the park or stay home?",
        "Why do you prefer the park?",
        "Explain why you think we should go outside.",
        "Your team is choosing an online meeting. Explain why it saves time.",
      ],
    ),
    real: scene(
      "Say what you think",
      "友人やチームとの相談で、理由のある意見を伝えます。",
      "Sam",
      [
        "Should we go to the park or stay home?",
        "Why do you prefer the park?",
        "Explain why you think we should go outside.",
        "Your team is choosing an online meeting. Explain why it saves time.",
      ],
    ),
    steps: [
      step("公園がよいと思う", "I think we should go to the park.", [
        "I would prefer to go to the park.",
      ]),
      step("天気がよいから", "Because the weather is nice.", [
        "The weather is nice.",
      ]),
      step(
        "理由をつなぐ",
        "I think we should go outside because the weather is nice.",
        ["We should go outside because the weather is nice."],
      ),
      step(
        "オンライン会議は時間を節約",
        "I think we should meet online because it saves time.",
        ["We should have an online meeting because it saves time."],
      ),
    ],
  },
  {
    id: "compare-options",
    stage: 4,
    skill: "比較して選ぶ",
    icon: "git-compare-outline",
    minutes: 8,
    baby: scene(
      "Two ways to get there",
      "バスと電車。違いを比べて決めましょう。",
      "Dad",
      [
        "The train takes ten minutes. The bus takes twenty. Which is faster?",
        "The bus costs less. Which is cheaper?",
        "Choose the train and explain why.",
        "Two hotels cost the same, but one is closer. Explain your choice.",
      ],
    ),
    real: scene(
      "Find the better option",
      "移動手段や宿泊先を、条件を比べて選びます。",
      "Sam",
      [
        "The train takes ten minutes. The bus takes twenty. Which is faster?",
        "The bus costs less. Which is cheaper?",
        "Choose the train and explain why.",
        "Two hotels cost the same, but one is closer. Explain your choice.",
      ],
    ),
    steps: [
      step("電車のほうが速い", "The train is faster.", [
        "The train is faster than the bus.",
      ]),
      step("バスのほうが安い", "The bus is cheaper.", [
        "The bus is cheaper than the train.",
      ]),
      step(
        "速さを理由に選ぶ",
        "I would choose the train because it is faster.",
        [
          "I'd choose the train because it's faster.",
          "I prefer the train because it is faster.",
        ],
      ),
      step(
        "近いホテルを選ぶ",
        "I would choose the closer hotel because it is more convenient.",
        [
          "I'd choose the closer hotel because it's more convenient.",
          "I prefer the closer hotel because it is more convenient.",
        ],
      ),
    ],
  },
  {
    id: "tell-a-story",
    stage: 5,
    skill: "出来事を順序立てて話す",
    icon: "book-outline",
    minutes: 10,
    baby: scene(
      "A story of your own",
      "思い出をひとつ。最初・次・最後の順で語ります。",
      "Mia",
      [
        "How did your day start?",
        "What happened next?",
        "Tell the story: you missed the bus, walked, and arrived on time.",
        "Explain a work process: check the data, write a report, share it.",
      ],
    ),
    real: scene(
      "Tell a clear story",
      "出来事や仕事の流れを、聞き手が追える順序で伝えます。",
      "Sam",
      [
        "How did your day start?",
        "What happened next?",
        "Tell the story: you missed the bus, walked, and arrived on time.",
        "Explain a work process: check the data, write a report, share it.",
      ],
    ),
    steps: [
      step("最初にバスを逃した", "First, I missed the bus.", [
        "I missed the bus first.",
      ]),
      step("次に歩いた", "Then, I walked.", ["Then I decided to walk."]),
      step(
        "順序立てて話す",
        "First, I missed the bus. Then I walked. Finally, I arrived on time.",
        ["I missed the bus, so I walked. In the end, I arrived on time."],
      ),
      step(
        "作業手順を説明",
        "First, I check the data. Then I write a report. Finally, I share it.",
        ["First check the data, then write a report, and finally share it."],
      ),
    ],
  },
  {
    id: "find-a-compromise",
    stage: 5,
    skill: "相談して折り合いをつける",
    icon: "swap-horizontal-outline",
    minutes: 10,
    baby: scene(
      "Let us decide together",
      "友人と意見が違います。相手を尊重しながら提案します。",
      "Sam",
      [
        "I want to meet early, but you prefer the afternoon.",
        "I can meet at one. Does that work?",
        "Acknowledge my idea and suggest meeting at one instead.",
        "You cannot finish a task today. Ask whether tomorrow would work.",
      ],
    ),
    real: scene(
      "Find a way forward",
      "時間や期限の相談で、お互いにできる形を探します。",
      "Colleague",
      [
        "I want to meet early, but you prefer the afternoon.",
        "I can meet at one. Does that work?",
        "Acknowledge my idea and suggest meeting at one instead.",
        "You cannot finish a task today. Ask whether tomorrow would work.",
      ],
    ),
    steps: [
      step("午後の希望を伝える", "I would prefer to meet in the afternoon.", [
        "I'd prefer to meet in the afternoon.",
      ]),
      step("1時で了承", "Yes, one works for me.", [
        "Yes, one o'clock works for me.",
        "That works for me.",
      ]),
      step("受け止めて代案", "I understand. Could we meet at one instead?", [
        "I see your point. How about meeting at one instead?",
      ]),
      step("期限の相談", "I cannot finish it today. Would tomorrow work?", [
        "I can't finish it today. Would tomorrow work?",
        "I need more time. Could I finish it tomorrow?",
      ]),
    ],
  },
  {
    id: "keep-talking",
    stage: 5,
    skill: "話を広げる",
    icon: "sparkles-outline",
    minutes: 10,
    baby: scene(
      "Your world is growing",
      "知らない話にも興味を持って、会話を広げてみましょう。",
      "Mia",
      [
        "I started learning to cook last week.",
        "I like it because I can make food for my friends.",
        "Ask me to tell you more about what I enjoy.",
        "A colleague says they are working on a new project. Ask about the hardest part.",
      ],
    ),
    real: scene(
      "A conversation of your own",
      "相手の話を受け止め、自分から次の質問をします。",
      "Sam",
      [
        "I started learning to cook last week.",
        "I like it because I can make food for my friends.",
        "Ask me to tell you more about what I enjoy.",
        "A colleague says they are working on a new project. Ask about the hardest part.",
      ],
    ),
    steps: [
      step(
        "興味を示す",
        "That sounds interesting. What do you like about it?",
        ["That sounds fun. What do you enjoy about it?"],
      ),
      step("共感を伝える", "That is a great reason.", [
        "That's a great reason.",
        "That sounds wonderful.",
      ]),
      step("詳しく聞く", "Could you tell me more about what you enjoy?", [
        "Can you tell me more about it?",
        "What do you enjoy the most?",
      ]),
      step("難しいところを尋ねる", "What is the hardest part of the project?", [
        "What is the most challenging part of the project?",
        "What do you find most difficult about the project?",
      ]),
    ],
  },
];

export const stageNames = [
  "First words",
  "Little discoveries",
  "Out into the world",
  "Finding your voice",
  "Making connections",
  "Your own story",
];
export const getMission = (id: string) =>
  missions.find((mission) => mission.id === id);
export const placementQuestions = [
  {
    prompt: "You want water. What do you say?",
    options: ["Water, please.", "Water yesterday.", "Water is two."],
    answer: 0,
  },
  {
    prompt: "Where is the book?",
    options: ["It is on the table.", "I am a book.", "Yes, I do."],
    answer: 0,
  },
  {
    prompt: "What did you do yesterday?",
    options: ["I go tomorrow.", "I went to the park.", "I going park."],
    answer: 1,
  },
  {
    prompt: "Someone speaks too fast. What do you say?",
    options: [
      "You are fast.",
      "I speak tomorrow.",
      "Could you speak more slowly?",
    ],
    answer: 2,
  },
  {
    prompt: "Why would you choose the train?",
    options: ["Because it is faster.", "Yes, I train.", "It was choose."],
    answer: 0,
  },
];
