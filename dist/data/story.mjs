// 剧情、演绎角色与行动条件的唯一原件。真实材料的著录在 sources.mjs。
export const STORY_ID='wuhan-paper-world';
export const STORY_REVISION=2;
// 回声与存根共同读取这一个后果判定；它只描述演绎支线。
export function readerOutcome(state){
 if(!state.flags.handoff||state.flags.handoff==='self')return 'unconfirmed';
 if(state.flags.handoff==='clerk')return 'filed';
 return state.flags.permission&&state.draft.motif==='shared'&&state.draft.voice==='ask'?'shared':'disputed';
}
export const ACTS=[
 {id:1,title:'灯下受托',subtitle:'一封信，把你带到人群之中'},
 {id:2,title:'纸面之外',subtitle:'印出来，是否就算抵达'},
 {id:3,title:'把名字留下',subtitle:'让被讲述的人也开口'},
 {id:4,title:'行囊中的人',subtitle:'离开以后，谁来接住'},
 {id:5,title:'回声有来处',subtitle:'把经历交还给真实的纸页'}
];
export const SCENES={
 desk:{title:'灯下书桌',place:'一封来信前',image:'assets/scenes/desk-v2.png',sound:'rain',tone:'dark'},
 office:{title:'会务工作间',place:'武汉 · 共同工作的房间',image:'assets/scenes/office-v2.png',sound:'room',tone:'dark'},
 press:{title:'排印桌',place:'一间排印作坊 · 演绎场景',image:'assets/scenes/press-v2.png',sound:'press',tone:'dark'},
 window:{title:'临窗试读处',place:'雨后的窗边 · 演绎场景',image:'assets/scenes/window.png',sound:'rain',tone:'dark'},
 river:{title:'江上行囊',place:'离汉的历史背景 · 演绎场景',image:'assets/scenes/river.png',sound:'river',tone:'dark'},
 archive:{title:'今日档案桌',place:'今天 · 再次展开',image:'assets/scenes/archive.png',sound:'room',tone:'light'}
};
export const CHARACTERS={
 lin:{name:'林青',role:'会务助手',image:'assets/characters/lin.png',intro:'她记得每一份纸交给谁，也会忙到忘记给自己倒水。',fiction:true},
 chen:{name:'陈师傅',role:'排印工',image:'assets/characters/chen.png',intro:'在铅字和纸之间工作。他对漂亮的空话有一点不耐烦。',fiction:true},
 zhou:{name:'周禾',role:'参加试读的兵士',image:'assets/characters/zhou.png',intro:'识字，爱挑字眼。他愿意听，也希望有人听他说。',fiction:true}
};
export const DRAFT_OPTIONS={
 motif:{short:"开头",label:'从哪里讲起',options:{night:{title:'一段共同走过的夜路',text:'夜路上，前面的人把脚步放慢。后面的人跟上来，我们才又向前走。'},banner:{title:'一句共同的抗敌号召',text:'山河不能任人践踏。我们愿守住脚下的土地，和身边的人一道抗敌。'},shared:{title:'把彼此照应的那半句写回来',text:'夜路上，有人放慢脚步等一等，有人接过同伴的行李。我们走得不一样快，仍一起往前走。',when:s=>!!s.flags.permission}}},
 voice:{short:"口吻",label:'怎样称呼读者',options:{ask:{title:'把问句留给眼前的人',text:'你也走过这样的路吗？若你愿意，请把同行的人讲给我们听。'},declare:{title:'把坚定的话大声说出',text:'前线的将士奋勇向前，后方的同胞同心支援。每一份力量都在共同承担。'}}},
 ending:{short:"结尾",label:'最后留下什么',options:{reply:{title:'留一个可以回答的位置',text:'这页纸还有一处空白，留给你的话。'},pledge:{title:'留下一句盼望与约定',text:'待到山河无恙，我们再把今日的名字，一一念给后来的人听。'}}}
};
export const CLUES=Object.fromEntries([
 ['commission','一页读物的委托','演绎物件','试制、试读，再交到下一位接手的人那里。不是一份真实战时订单。',['letter','three']],
 ['plan','一个“拟”字','书信转引','信中写兵士读物拟座谈、制订计划、求款。筹画还需要后续的工作。',['letter']],
 ['care','工作之间的问候','书信转引','工作信也关切胡风的身体；人不是事务之外的附注。',['letter']],
 ['firstIssue','刊头上的共同署名','真实原刊','创刊号的协会名称、卷期和日期，让共同工作有了可以查阅的形状。',['issue1']],
 ['publicVoice','为大众的文化','真实原刊','原站第二幅图的文章题目把视线推向文艺要面对的人。',['issue1']],
 ['organization','把分散的人联系起来','研究依据','文协日常需要文书、会计、庶务和联络；不同背景的文化人士共同抗战。',['association','front']],
 ['types','退下来的铅字','演绎物件','陈师傅留下的旧字，提醒你版面上的每处位置都有人经手。',['art']],
 ['readerVoice','周禾没有说完的话','演绎人物经历','他提起夜路上等一等同伴，也希望自己的害怕与牵挂没有被改掉。',['art']],
 ['homeLetter','一封尚未寄出的家信','演绎物件','周禾不愿把收信地址交给陌生人。听取故事也需要取得同意。',['art']],
 ['proof','由你编排的试样','当代创作','它会被实际试读、讨论和修订。不是历史原刊，也不是老舍的作品。',['art','three']],
 ['consent','署名以前，先询问','演绎人物经历','周禾允许留下名字或匿名表达；不记录部队位置与私人地址。',['art']],
 ['handoff','谁来接下一页','演绎交接','交接对象与是否接受反馈，决定这段虚构支线后来的回声。',['art']],
 ['pressMark','作坊小笺上的“可取样”','演绎调查物件','陈师傅写的是可以取样，不是试读者已经同意定稿。折住的一行还写着送人试读。',['art']],
 ['readerReservation','周禾留下的保留意见','演绎调查物件','周禾愿意参加试读，也希望意见能进入修改；愿意读不等于对成稿已无异议。',['art']],
 ['map','河流与图幅的年代','真实地图','底本为 1927 年，当前图为后期修订版。可看三镇河流，不能补写 1938 年精确送稿路线。',['atlas']],
 ['records','行囊里的记录','研究依据','有关离汉行程的文章记述，同行携带文协文件、名册和账目。',['journey']],
 ['boat','尚未写定的船名','研究推测','龙安轮是研究者比较材料后的推测，不能变成本作亲见的当时明文。',['journey']],
 ['laterIssue','秋天仍有新的刊物','真实原刊','第二卷第六号，1938 年 10 月 15 日；目录列通俗文艺讨论、会务报告等。',['issue18']],
 ['differentVoices','同一旅程的不同感受','对读问题','当时文章与后来回忆写下的感受不同，不宜用一句话抹平。',['journey']],
 ['catalogue','书目没有替人写完结局','书目对读','馆藏范围与刊行历史描述不同，末期原件仍待查。',['catalogue']]
].map(([id,title,label,summary,sources])=>[id,{id,title,label,summary,sources}]));

const a=(id,label,to,extra={})=>({id,label,to,...extra});
const n=(id,act,scene,kind,title,paragraphs,choices=[],extra={})=>({id,act,scene,kind,title,paragraphs,choices,...extra});
const hub=(id,label,x,y,to,extra={})=>a(id,label,to,{spot:{x,y},...extra});
const backOffice=()=>a('back-office','回到工作间 →','office');
const backPress=()=>a('back-press','回到排印桌 →','pressHub');
const ready=s=>Object.keys(DRAFT_OPTIONS).every(key=>s.draft[key])?'':'先为三处稿片各选一种写法，再取出试样。';
const script=[
 n('threshold',1,'desk','cover','山河有信',[
  '有些纸，曾经要赶在离别之前，交到另一个人的手里。',
  '你将从一封信出发，走进一段关于写作、倾听与接力的纸上经历。'
 ],[a('open-letter','展开灯下的信 →','letter')],{subtitle:'纸上的人，还在等一声回应',kicker:'一段文艺抗战的文字冒险'}),
 n('letter',1,'desk','letter','灯下，先有一声问候',[
  '你读到的不是一纸命令。写信的人一边惦记朋友的身体，一边筹画通知、会刊与写给兵士的读物。',
  '油灯轻轻晃了一下。信纸的折痕向远处伸开，那里是一张围着许多椅子的工作桌。'
 ],[a('take-commission','循着这封信，走进纸上的房间 →','commission'),a('notice-plan','停在那个“拟”字上','letterPlan'),a('read-care','把问候再读一遍','letterCare')],{sources:['letter'],quotes:[{text:'尊体欠安，甚为系念！'},{before:'为此事',token:'拟',after:'召集座谈会……',choice:'notice-plan'}],quoteLabel:'老舍致胡风信 · 研究转引摘句，现代排印'}),
 n('letterPlan',1,'desk','letter','事情还没有做完',[
  '“拟”字没有被抹去。它留下的是一个准备开始的工作：召集人、商量怎样写、再去寻找让计划落地的条件。',
  '信纸上没有写出所有结果。你决定走到做事的人身边，再看看。'
 ],[a('take-commission','去看看谁在接这件工作 →','commission')],{sources:['letter'],enter:{add:['plan']},quotes:[{text:'为兵士写读物，事在必办。'}],quoteLabel:'原信转引 · 现代排印'}),
 n('letterCare',1,'desk','letter','问候没有另起一页',[
  '你在事务之间停了一会儿。写信的人关心胡风的病情，也提到自己的不适。',
  '纸上不是一群永远不知疲倦的人。你想记住这一点，再去见他们。'
 ],[a('take-commission','带着这声问候，走进去 →','commission')],{sources:['letter'],enter:{add:['care']}}),
 n('commission',1,'office','dialogue','她递给你一张空纸',[
  '“来帮个忙吧。先做一页试样，拿给人读。若有不妥，就带回来改。别急着把字排满。”',
  '她叫林青，正把几摞散纸分给不同的人。门外有人喊了一声，她应着，却先把一支铅笔递到你手里。',
  '“还有，回来告诉我，最后是谁接了它。不能只写一个‘已办’。”'
 ],[a('accept-work','接过铅笔与这份委托 →','office',{effect:{flags:{commission:true},add:['commission']}})],{character:'lin',sources:['letter','three'],kicker:'进入演绎 · 人物与这份委托为虚构'}),
 n('office',1,'office','scene','一张桌上，不止一种工作',[
  '1938 年武汉，中共代表周恩来等推动文化人士团结，不同背景的人在文协共同抗敌。',
  '林青在查交接，会报摊在桌上。排印作坊等着试样，周禾还在窗边。'
 ],[hub('visit-clerk','林青 · 问问这份工作',71,36,'linIntro'),hub('inspect-circular','桌上的会报',35,53,'circular'),hub('visit-press','去排印作坊',15,31,'pressHub'),hub('visit-reader','去临窗试读处',87,51,'readerHub'),a('unfold-city','先展开城市与河流','cityMap')],{sources:['association','front'],hint:'点画面里的纸与去处，也可以用 Tab 找到它们。'}),
 n('linIntro',1,'office','dialogue','“别把已发，写成已达。”',[
  '林青在一个人名旁画了很小的记号。你问是不是办完了。',
  '“是我把信发出去了。对方有没有收到，还得等回音。总不能我这边一合账，就当另一头的人也点了头。”',
  '她把名册转向你。“做读物也是。你先听谁的？写的人，印的人，还是看的人？”'
 ],[a('ask-plan','把信中那个“拟”字指给她','planInquiry'),a('ask-care','问她为什么把问候留下','careInquiry'),a('ask-missing-name','留意那个还没画记号的名字','missingColleague'),a('inspect-circular','把会报拿来对照','circular'),backOffice()],{character:'lin',sources:['letter','association']}),
 n('planInquiry',1,'office','dialogue','计划还要经过许多双手',[
  '“筹画，和做成，中间隔着好些事。”她没有把那张空纸收回去。',
  '“先别答应能给所有人写。去找一个愿意试读的人，问清楚这一页到了他手里要怎样用。也听听陈师傅，他比我懂纸。”'
 ],[a('visit-reader','先去见读者 →','readerHub'),a('visit-press','先去找陈师傅 →','pressHub'),backOffice()],{character:'lin',sources:['letter','three'],enter:{add:['plan']}}),
 n('careInquiry',1,'office','dialogue','杯里的水已经凉了',[
  '“你还读到了那句问候。”她停笔，才想起杯子一直放在手边。',
  '“他病着，手里的活我们得接。回信时，也该问上一声，今天好些没有。”她摸了摸杯沿，才喝了一口。',
  '你把杯子往她近处推了一点。她笑笑，没再解释。'
 ],[a('offer-to-check','答应回来时也问问人的消息','personalPromise',{effect:{flags:{carePromise:true},add:['care']}}),backOffice()],{character:'lin',sources:['letter']}),
 n('personalPromise',1,'office','dialogue','“那就等你回来。”',[
  '她把你刚才说的话记在纸角，没有记在工作清单里。',
  '门外又有人喊她。这回她把冷茶喝了，才起身去应。'
 ],[backOffice(),a('visit-reader','去找试读的人 →','readerHub')],{character:'lin'}),
 n('missingColleague',1,'office','dialogue','留给一个人的空位',[
  '“这个名字先别划掉。还没回信，不是这个人就不在了。”',
  '门边有一把空椅子，椅背搭着件旧衣。林青只说那是另一位帮手常坐的位置，没有把他的去处讲给你。',
  '你原想追问，后来把名册往回推了推。有些事情需要查，有些需要先得到允许。'
 ],[a('ask-about-work','问那份工作如今由谁接手','sharedWork'),backOffice()],{character:'lin'}),
 n('sharedWork',1,'office','dialogue','空位旁边，又添了一张纸',[
  '“我们分着接。有人会写文章，有人愿意抄地址，有人只在散场后帮着搬椅子。总不能说后面这些都不算。”',
  '她把一份信放到另一摞上。那张空椅子还在，但桌上的工作没有停下来。'
 ],[a('look-organization','沿着这张桌，读一读组织的背景','organization'),backOffice()],{character:'lin',sources:['association','front'],enter:{add:['organization']}}),
 n('circular',1,'office','document','先让原刊自己说话',[
  '刊名上方，是“中华全国文艺界抗敌协会会报”。卷期和日期安静地印在旁边。',
  '你手里的试样还没有开始，而这份刊物已由许多人共同做出来。你把它展开，让它占据整张桌。'
 ],[a('read-public-voice','翻到“为大众的文化” →','publicPage'),a('pair-letter','把来信放在刊物旁边','comparison'),backOffice()],{artifact:'issue1',sources:['issue1'],enter:{add:['firstIssue']}}),
 n('publicPage',1,'office','document','标题把目光引向了谁',[
  '原站第二幅图上，适夷的文章题为《纪念“五四”——为大众的文化而战斗》。',
  '“大众”不是你可以替他们一次说尽的人群。你的眼前，现在至少有一个愿意听读的人。'
 ],[a('visit-reader','合上刊物，去听他开口 →','readerHub'),a('pair-letter','再与来信对照','comparison'),backOffice()],{artifact:'issue1',imagePage:1,sources:['issue1'],enter:{add:['publicVoice']}}),
 n('comparison',1,'office','compare','一封信，一份会报',[
  '信里说筹画，会报上已留下出版日期。但你还不能把两份材料之间所有的空白填满：刊物出现，不等于那份兵士读物计划的每一个环节都已完成。',
  '你把它们并排，继续找纸背后具体的人与工作。'
 ],[a('notice-division','沿着会务分工查下去','organization'),a('visit-press','带着这个问题去排印桌 →','pressHub'),backOffice()],{artifact:'issue1',sources:['letter','issue1']}),
 n('organization',1,'office','document','人们为什么来到同一张桌前',[
  '相关研究记述了周恩来推动文化人士团结、老舍等人筹备文协的工作。1938 年 3 月，文协在武汉成立，文化人士在民族危机中联系起来。',
  '联络、文书、会计、庶务，会刊的筹画与创作，各有日常分工。不同来处的人共同抗战，团结还要靠这些具体工作一天天维持。',
  '你再看那张空白试样，知道它接着的不是某一个人的独角戏。'
 ],[a('inspect-group','看看历史留下的合影','groupPhoto'),a('visit-press','去找下一双经手的手 →','pressHub'),backOffice()],{sources:['association','front','letter'],enter:{add:['organization']}}),
 n('groupPhoto',1,'office','document','一张合影，许多个名字',[
  '这张照片由《光明日报》报道的转刊配图标为文协成立时的合影。你能看见一群人，但不能只凭模糊面孔把每一个名字认定。',
  '在熟悉的作家之外，仍有许多不容易被记住的劳动。你把照片和文字出处一起留下。'
 ],[backOffice(),a('visit-reader','去见眼前一个具体的人 →','readerHub')],{artifact:'group',sources:['group','association']}),
 n('cityMap',1,'archive','map','河流之间，还有人的往来',[
  '你暂时回到今日的档案桌，想看看那间纸上房间所在的城市。翻开地图，先看年代：这份图使用 1927 年底本，却经过后期修订。',
  '三镇与河流的关系可以帮助你理解空间；确切会址和投递路线，还不能由这张图替你决定。你没有把想象中的路线画成史实。'
 ],[a('read-map-note','把这处疑问夹进手记','mapMargin'),backOffice()],{kicker:'暂离演绎 · 今日的空间对读',sources:['atlas'],enter:{add:['map']}}),
 n('mapMargin',1,'office','narration','把问题留在图边',[
  '纸上有几种年代，事情也有几种进度。你把地图折回去，记下以后还需要寻找的地址材料。',
  '眼下的工作仍在等你。地图没有给出捷径，但它让你知道什么还不该写定。'
 ],[a('visit-press','去排印作坊 →','pressHub'),a('visit-reader','先去临窗处 →','readerHub'),backOffice()],{sources:['atlas']}),

 // 第二折：先排版还是先倾听，将被人物记住。
 n('pressHub',2,'press','scene','铅字已经排开，内容还没有',s=>[
  s.flags.listened?'你带着刚听到的话走进来。机器没有立刻开动，陈师傅先抬头看了看你。':s.flags.firstVisit==='reader'?'你从临窗处转到作坊。手里的纸还空着，陈师傅擦净一小块台面，让你坐下。':'你先来到了作坊。铁架、字盘和晾纸绳挤在光里，陈师傅正在擦掉上一张试印留下的墨。',
  '空白试样压在右边，几粒旧字单独留在字盘里。'
 ],[hub('greet-printer','陈师傅 · 先说说话',20,40,'chenIntro'),hub('inspect-type','一格退下来的铅字',47,49,'typeDrawer'),hub('inspect-proof','空白试样 · 开始排印',73,44,'proofBrief'),a('visit-reader','先去听读者的意见','readerHub'),a('back-office','回会务工作间','office')],{enter:{defaults:{firstVisit:'press'}},hint:'试样在工作台右侧。也可以先停下来听听陈师傅。'}),
 n('chenIntro',2,'press','dialogue','“纸上准备放谁？”',s=>[
  s.flags.listened?'“林青说来了个帮手。我还以为你先来催我开机。”他看见你手里的笔记，把墨辊搁下。“说吧，那个人讲了什么？”':'“又是一张要赶的纸？”他摸了摸纸边。“版面我能给你匀出来。内容呢，你准备放谁？”',
  '你说，是写给兵士看的。',
  '“我问的是纸上放谁。写给人看，跟把人写进去，可不是一回事。”'
 ],[a('ask-why-blank','问他为什么宁可先空着','blankType'),a('inspect-type','看看那几粒没有归位的字','typeDrawer'),a('inspect-proof','先做一张试样给人看 →','proofBrief'),a('visit-reader','那就先去听人说话','readerHub')],{character:'chen',sources:['three']}),
 n('blankType',2,'press','dialogue','墨可以擦掉，话不容易收回',[
  '“去问了再印。”他见你盯着空版，以为你在催工。“这点墨费不了多少。总比给人说错话了，再往回追省事。”',
  '他试了试纸边的湿度，换一张干净的递过来。'
 ],[a('ask-his-paper','问他有没有不愿洗掉的字','chenPast'),a('inspect-proof','从一张试样开始 →','proofBrief'),backPress()],{character:'chen'}),
 n('typeDrawer',2,'press','detail','字盘里，一格没有归位的字',[
  '字粒太小，你没有急着拿起来。陈师傅用镊子指了指：有磨损的，也有暂时用不上的。',
  '“退下来，不等于没用过。归到错格里，下次来找的人就要多翻半天。”',
  '他将字粒翻面，用小刷把缝里的暗墨清出来。窗边的光挪了一寸，他仍没把那粒字放回去。'
 ],[a('ask-his-paper','问问他从前印过什么','chenPast'),backPress()],{character:'chen',enter:{add:['types']}}),
 n('chenPast',2,'press','dialogue','他指了一格旧字',[
  '“喜帖，账单，学校的讲义，都印过。赶开学那一回，孩子在门外等，我在里面排，错一字还得挨先生说。”',
  '他笑着指了一格旧字：“那个‘归’，喜帖上用过。如今有人给家里写信，也会用。”',
  '他把字归好，往旁边挪了一点，将擦净的地方留给你。'
 ],[a('keep-his-place','记住这双手的工作','chenTrust',{effect:{flags:{heardChen:true}}}),backPress()],{character:'chen'}),
 n('chenTrust',2,'press','dialogue','下次，知道该来找谁',[
  '“别光记我。”他把纸往你面前推了推。“你找过的人，以后得认得回来。”',
  '你答应改完试样再来。他点头，将那格字盘轻轻推回去。'
 ],[a('inspect-proof','现在开始试排 →','proofBrief'),backPress()],{character:'chen'}),
 n('proofBrief',2,'press','dialogue','先做试样，先别定稿',[
  '“一页就够。开头从什么地方讲，怎样对人说，末尾又留什么，你自己试。”',
  '陈师傅把三处空位划出来。“有号召的写法，也有从小事讲起的写法。没有一种能替你省掉试读。印出来，拿去听听反应。”'
 ],[a('begin-setting','把稿片放上排印桌 →','compose'),a('visit-reader','我想先问问他','readerHub'),backPress()],{character:'chen',sources:['three']}),
 n('compose',2,'press','compose','这一页，先由你来试',[
  '在纸旁为三处空位选择稿片。纸面会即时换成你的编排。',
  '这些文字是今天为互动创作的试样，不引用或仿冒历史作品。取样以后，需要让一个具体的人来读。'
 ],[a('pull-proof','落墨，取出这张试样 →','proofPulled',{requires:ready,effect:{flags:{hasProof:true},add:['proof']}}),backPress()],{workbench:true,sources:['three','art']}),
 n('proofPulled',2,'press','proof','墨还没有干',[
  '纸从印面上揭起，刚才还可以轻易挪动的几行话，有了自己的重量。',
  '陈师傅没有说好坏。他让你拿住两边：“先别蹭着。带回来改，也别把人家的话弄丢了。”'
 ],[a('fold-proof','试试它怎样被带走 →','folding')],{character:'chen',sources:['art']}),
 n('folding',2,'press','fold','一张纸，怎样到人手里',[
  '你可以折成随身的小页，让对方带走；也可以先作一次口述，再把文字交给他核看。',
  '周禾识字，选择口述也不意味着他读不了。方式要适合眼前的场合，最终仍要听他自己说。'
 ],[a('fold-booklet','沿折痕合成随身页','readyToRead',{effect:{flags:{format:'booklet'}}}),a('prepare-oral','先把它准备成一段口述','readyToRead',{effect:{flags:{format:'oral'}}})],{sources:['three']}),
 n('readyToRead',2,'press','proof','还有一个人没有开口',s=>[
  s.flags.format==='oral'?'你将试样翻到背面，给停顿处留了几个记号。你要先讲，再让对方核看文字。':'你沿着折痕把试样合起。最外面那一句，如今成了读者第一眼会看到的话。',
  '陈师傅抬了抬下巴，示意你去窗边。机器的声音在背后停了一下。'
 ],[a('walk-to-reader','带着试样，去找周禾 →','readerHub')],{character:'chen'}),
 n('readerHub',2,'window','scene','窗边的人把信收了起来',s=>[
  s.flags.hasProof?'你带着试样来到窗边，周禾把凳子朝你挪了挪。他手里的信折了一半，仍没有放进信封。':'一个年轻人坐在窗边，正将同一行字看了又看。听见脚步，他先把收信地址折到了里面。',
  '他给你让了一半凳子。'
 ],[hub('greet-reader','周禾 · 先认识一下',32,38,'zhouIntro'),hub('inspect-home-letter','他手边折起的家信',53,50,'homeLetter'),hub('present-proof','递出你的试样',73,48,'trialEntry',{when:s=>!!s.flags.hasProof}),a('go-press','回排印作坊','pressHub'),a('back-office','回工作间','office')],{enter:{defaults:{firstVisit:'reader'}},hint:'先认识周禾。拿到试样以后，再把它递给他。'}),
 n('zhouIntro',2,'window','dialogue','“你想听好话，还是听实话？”',[
  '“林青说会有人来。”他把自己的名字告诉你：周禾。',
  '你解释想做一页写给兵士的读物。他没有立刻点头：“你想听我说什么？好话我也会说。可你若要拿回去改，最好先说清楚。”'
 ],[a('listen-first','先请他说一件自己想留下的事','readerStory'),a('explain-task','先说明你希望传达的抗敌号召','readerDuty'),a('present-proof','先把已做好的试样给他看','trialEntry',{when:s=>!!s.flags.hasProof}),a('inspect-home-letter','问问那封折起的信','homeLetter')],{character:'zhou'}),
 n('readerStory',2,'window','dialogue','一段走得很慢的夜路',[
  '“夜里赶路，前面有个人总是走两步停一下。我以为他在等命令，后来才看见，他是在等后面腿脚不便的人。”',
  '“他不大说话。到了能歇的地方，也没提。可我一直记着。”',
  '你拿起笔，周禾却先按住了纸。“别写成只有他一个人撑着。后来大家都走慢了些。”'
 ],[a('take-story','记下这句话，带去排印桌 →','pressHub',{effect:{flags:{listened:true},add:['readerVoice']}}),a('ask-about-fear','问他，那时候怕不怕','readerFear'),a('ask-permission-early','问这件事能不能写','earlyConsent')],{character:'zhou'}),
 n('readerFear',2,'window','dialogue','他说“怕”，没有压低声音',[
  '“怕。”他答得很快。“不怕还要互相等什么。”',
  '窗外有人在收晾着的衣服。周禾看了一会儿，又说：“可若只写怕，也不是全了。那天我们还是一起走到了。”',
  '你没有急着把这两个意思压成一句漂亮话。'
 ],[a('take-story','把这些都记下 →','pressHub',{effect:{flags:{listened:true,heardFear:true},add:['readerVoice']}}),a('ask-permission-early','问他愿意留下哪些部分','earlyConsent')],{character:'zhou'}),
 n('earlyConsent',2,'window','dialogue','“写完，先让我看一眼。”',[
  '“可以写。地方别写，同行的人也别替他们报名字。写完先让我看一眼。”',
  '你将刚才记下的字推到他面前。他先圈掉了地名，再把纸转回来。'
 ],[a('take-story','答应给他复看，再去排印 →','pressHub',{effect:{flags:{listened:true,earlyConsent:true},add:['readerVoice']}})],{character:'zhou'}),
 n('readerDuty',2,'window','dialogue','他把让出的半张凳子收回一点',[
  '你说起团结、抗敌和鼓舞士气。他认真听着，听完却问：“这些我晓得。你还想听我说什么？”',
  '你忽然不知道该从哪一句问起。他没有赶你，只把自己的信压在手掌下面。'
 ],[a('listen-first','停下来，先听他想说的事','readerStory'),a('go-press','先把这一版试样做出来','pressHub',{effect:{flags:{announced:true}}})],{character:'zhou'}),
 n('homeLetter',2,'window','dialogue','折起来的，是收信地址',[
  '“不是不能给你看。”他把信翻到背面。“只是这头还没决定好，怎么给那头说。”',
  '信是他自己的事。他没有把原文念给你，你也没有伸手把地址翻出来。',
  '过了一会儿，他问：“你们写给兵士的东西，会让家里的人也看懂吗？”'
 ],[a('ask-home-question','问他最想让家里知道什么','homeQuestion'),a('respect-letter','把信留给他，回到窗边','readerHub',{effect:{flags:{respectedLetter:true},add:['homeLetter']}})],{character:'zhou'}),
 n('homeQuestion',2,'window','dialogue','有一句话还没有寄出',[
  '“想说我好。可若只写这两个字，又好像一天都没过。”',
  '“也想问家里好不好。问多了，怕他们又只回这两个字。”他笑了一下，才把笔重新拿起来。',
  '你意识到，字写得简单，未必就是话说得少。'
 ],[a('leave-him-space','不替他写完，把这个问题记住','readerHub',{effect:{flags:{respectedLetter:true,heardHome:true},add:['homeLetter']}})],{character:'zhou'}),
 n('trialEntry',2,'window','proof','先让他看到你写下的东西',s=>[
  s.flags.format==='oral'?'你先把稿纸放在他看得见的地方，照着自己的编排讲起来。周禾没有插话。':'周禾从你手里接过折页，先看封面，再把里面展开。他的拇指停在第二段开头。',
  '这一次，你需要等他把话说完。'
 ],[a('start-reading','等他读完，听他的回应 →','trialResponse')],{character:'zhou'}),
 n('trialResponse',2,'window','dialogue','“这里面，有我吗？”',s=>[
  s.draft.motif==='night'?(s.flags.listened?'他先指着夜路那一句：“你听进去了。可这里说前面的人等，后面的人就只管被等着吗？”':'“夜路，我倒真走过。”他指着那一句。“可这里前面的人等，后面的人就只管被等着吗？”'):'他把那句号召重新读了一遍：“我愿意抗敌。可你写我们总是奋勇向前，停下来等人的那些时候，又放在哪里？”',
  s.draft.voice==='ask'?'他在问句后面点了一下：“这个我可以答。答了以后，你还会改吗？”':'“我知道你不是坏意思。”他把纸放平。“只是你还没问我，就已经替我把话说满了。”',
  '你准备解释，他却没有把纸还回来。原来，他还愿意把这页读完。'
 ],[a('ask-whats-missing','先问他：你想留下哪一句？','critique'),a('defend-version','说明这一版希望鼓舞更多人的用意','distance'),a('ask-another-listener','带着分歧去问林青','linTrial')],{character:'zhou',enter:{flags:{trialDone:true}}}),
 // 第三折：不是再答一次题，而是为自己的版本承担一次真实的回应。
 n('critique',3,'window','dialogue','他在空白处加了一笔',[
  '“后面的人也在照应前面。有时递水，有时把别人的东西多背一段。谁也不是一直只等人照顾。”',
  '他用指尖在纸上划了一道，不是删句子，是给你留一个能添进去的位置。',
  '“这话你若肯改，我愿意再看。若只让我点头，那我这回已经点过了。”'
 ],[a('invite-own-words','把铅笔递给他，请他留下自己的说法','ownedWords'),a('only-change-format','先保留原文，试着改换传达方式','formatChoice')],{character:'zhou',enter:{flags:{heardCritique:true},add:['readerVoice']}}),
 n('ownedWords',3,'window','dialogue','铅笔到了另一只手里',[
  '他先写下“我们”，又停了停：“也别把每个人写成一样。有人走得快，有人那天实在走不动。一起走，得是这许多人凑在一起。”',
  '你看着他写。他的字没有你刚排的整齐，却把你那句话里没有的人带了进来。',
  '“可以用。改完让我看一眼。”他把铅笔还给你。'
 ],[a('revise-together','带着他的意见回排印桌 →','revisionHub'),a('ask-about-signature','先问这段话怎样署名','creditConsent')],{character:'zhou',enter:{add:['consent'],flags:{permission:true}}}),
 n('distance',3,'window','dialogue','他听完你的解释，把纸放回桌上',[
  '“鼓舞人是好事。”他说。“可若我讲了，纸上还是原来那些话，那你来问这一回，和没来又有什么不同？”',
  '你觉得自己并非毫无道理，却也发现，解释没有让眼前的人靠近这页纸。',
  '他没有把路堵死：“也许换个讲法，我能听得进去。你还试吗？”'
 ],[a('try-another-form','换一种传达方式，再试一次','formatChoice'),a('return-and-listen','先收起解释，重新听他的意见','critique')],{character:'zhou',enter:{flags:{defended:true}}}),
 n('linTrial',3,'office','dialogue','“他为什么还没把纸还给你？”',[
  '你向林青复述刚才的分歧，想听听她站在哪一边。',
  '她没有接这个问题：“你说他挑了一段，又问你肯不肯改。那说明他还把这件事当成自己的事。你若只带回来一个‘不满意’，就把他后面的话丢了。”',
  '她把铅笔递回给你。这一次，没有替你再派一件工作。'
 ],[a('return-and-listen','回去把他的话听完 →','critique'),a('try-another-form','先试另一种形式','formatChoice')],{character:'lin',sources:['association']}),
 n('revisionHub',3,'press','scene','这回不是空着手回来',[
  '有批注的试样又铺回原处。陈师傅推来一格字。周禾愿意留下的那半句，现在也在桌上。'
 ],[hub('revise-text','有批注的试样 · 动手修订',66,48,'reviseCompose'),hub('ask-chen-again','陈师傅 · 他怎么看',25,36,'chenRevision'),a('keep-layout','暂且保留这一版，先商量署名','creditConsent')],{hint:'修订会留下一次新的试读；第一次回应仍保存在手记里。'}),
 n('chenRevision',3,'press','dialogue','“终于有改稿的了。”',s=>[
  s.flags.heardChen?'他认出你没有丢掉那张试样，往前让了一点：“你上回说改完来找我。现在认得地方了。”':'“别看我。”他把镊子给你。“是人家指出了哪里没写进去。改字归我，决定写什么还得你来。”',
  '“不是每次改都会更好。至少得知道，为什么要动这几个字。”'
 ],[a('revise-text','坐到试样前 →','reviseCompose'),a('keep-layout','先保留文字，去商量署名','creditConsent')],{character:'chen'}),
 n('reviseCompose',3,'press','compose','把听见的话写回来',[
  '旧版仍留在试读记录里。桌上添了一张新的稿片，把周禾愿意留下的那半句也带了回来。',
  '换一个开头，换一种对读者说话的方式，也可以保留你认为有用的句子。改完以后，还要带回给周禾。'
 ],[a('pull-revision','取出修订后的试样 →','revisionRead',{requires:ready,effect:{flags:{revised:true}}}),a('back-revision','暂时搁下，回到桌边','revisionHub')],{workbench:true,sources:['art','three']}),
 n('revisionRead',3,'press','proof','另一张纸，接着同一件事',[
  '陈师傅把两张纸错开压住，保留了上一次的痕迹。新的墨色比旧的一张更深。',
  '你记得周禾说过：改完，让他再看一眼。'
 ],[a('bring-revision','把新的一张带回窗边 →','secondTrial')],{character:'chen'}),
 n('secondTrial',3,'window','dialogue','他又读了一遍，没有替你鼓掌',s=>[
  s.draft.motif==='shared'&&s.draft.voice==='ask'?'“这回我能接着说。”他把问句念出来，慢慢在后面补了自己的那段。“也不用写我多了不起。写大家那天没有把人落下。”':'他从头读了一遍：“这一处我还是想再讲。你先别急着把它当成定稿。”',
  s.draft.ending==='reply'?'他把末尾的空白留住，没有帮你补成另一句口号。':'他指着那句盼望：“这个我愿意留着。还得在那天之前，好好把身边的人记住。”',
  '他又读了一遍，才把被翻卷的边角压平。'
 ],[a('ask-name','问他：这段话要怎样署名？ →','creditConsent'),a('revise-again','还有想改的，回去再试一次','reviseCompose')],{character:'zhou',enter:{flags:{secondRead:true}}}),
 n('formatChoice',3,'window','dialogue','读与听，是不同的相遇',[
  '周禾说：“我能读。可有时几个人围着，一人念，别人还会插话。也有时候想自己收着，等安静了再看。”',
  '他不愿替所有人选一种。你决定这一次怎样把试样留下。'
 ],[a('use-booklet','留一份可以展开的小页','creditConsent',{effect:{flags:{format:'booklet'}}}),a('use-oral','先口述，附一张可以核看的文字','creditConsent',{effect:{flags:{format:'oral'}}}),a('return-and-listen','先继续听他的意见','critique')],{character:'zhou',sources:['three']}),
 n('creditConsent',3,'window','dialogue','名字不是最后随手加上的字',[
  '“我叫周禾，你知道的。可别替别的人报名字，也别把部队的位置和家里的地址印出来。”',
  '他看了看署名的空位：“这一次，可以写我，也可以写成‘一个参加试读的人’。但得让后来的人知道，有个人确实提过这些话。”',
  '你把决定告诉他，让他听见。'
 ],[a('name-person','经他同意，写下“周禾参与试读”','signedProof',{effect:{flags:{credit:'named'},add:['consent']}}),a('keep-anonymous','留下匿名说明，保留他的意见','anonymousProof',{effect:{flags:{credit:'anonymous'},add:['consent']}})],{character:'zhou'}),
 n('signedProof',3,'window','proof','他把自己的名字看了一遍',[
  '“禾，不是和。”他笑了一下，指给你看。你把那个字重新认了一遍。',
  '你将参与说明写在下面，原来那段意见仍夹在纸后。周禾又看了一遍，确认没有带上地址。',
  '你答应把最终交给谁也记清楚。他把纸交回给你。'
 ],[a('return-workroom','带回试样，去办交接 →','returnOffice')],{character:'zhou'}),
 n('anonymousProof',3,'window','proof','纸上没有他的名字，意见还在',[
  '他确认你保留了那处说明。“行。别人不认得我，也能知道这不是一个人闷头写完的。”',
  '他在说明下面点了一下，将笔递回来。你照着约定记好，合起纸页。'
 ],[a('return-workroom','带回试样，去办交接 →','returnOffice')],{character:'zhou'}),
 n('returnOffice',3,'office','scene','门还是那扇门，你带回了别人的话',s=>[
  s.flags.carePromise?'林青看见你进门，先问：“窗边那位，今天还好？”你记起答应过，不只回来报一件工作。':'桌上的纸换了一摞。林青接过试样，先找背面的记录：“这一回，谁看过？”',
  '你可以再和他们说几句话，然后决定接下来由谁接这页纸。'
 ],[hub('visit-lin-again','林青 · 交回这次经历',72,35,'linReturn'),hub('seek-chen','门边的陈师傅',18,36,'chenReturn'),hub('make-handoff','桌上的交接笺',43,53,'transferSlip')],{hint:'先把试读经历说清楚，再决定由谁接下一页。'}),
 n('linReturn',3,'office','dialogue','她先听人，再看那句“已办”',s=>[
  s.flags.carePromise?'你先说周禾的近况，也说起他还没寄出的信。林青放下笔，听完才把试样翻过来。“你记着回来问一声了。”':'你说了试读的经过。她追问的不是有几个人满意，而是“他在哪一句停了下来，你后来怎么办”。',
  s.flags.secondRead?'她看见第二张试样，也看见第一张留下的批注：“那这张旧的也别扔。后来的人才知道，事情不是一开始就会做。”':'她把原样和你的说明一起夹好：“分歧也要写下来。写个‘顺利’，下一位来接，就不知道还该问什么。”'
 ],[a('ask-unity','问她不同意见怎样一起做事','tableDebate'),a('return-handoff','回到交接桌 →','transferSlip'),a('back-workroom','再看看工作间','returnOffice')],{character:'lin',sources:['association']}),
 n('tableDebate',3,'office','dialogue','同一张桌，不必同一种说法',[
  '“有人愿意写新诗，有人熟悉鼓词；有人先问怎么写，有人先问送到哪里。要坐在一张桌前，就得商量。”',
  '“可共同抗敌这件事，不能因为彼此有争论就放下。也不能谁声音大，就当别人没有做过事。”',
  '她把试样与来信并排。纸的大小不同，都留了下来。'
 ],[a('return-handoff','把分歧也写进交接 →','transferSlip'),a('read-unity-background','展开相关组织背景','unityBackground')],{character:'lin',sources:['front','association','three']}),
 n('unityBackground',3,'office','document','把演绎放回历史背景',[
  '中共推动抗日文化统一战线的工作，为文化人士共同抗战提供了重要背景。文协成员来自不同文学与社会背景，不能把所有人的身份写成一致。',
  '文艺形式和创作理论也存在讨论与争论。眼前人物的对白是演绎，不是老舍、胡风等人的真实发言。相关研究的原文可在这页来处继续阅读。'
 ],[a('return-handoff','回到具体的交接工作 →','transferSlip')],{sources:['front','association','three']}),
 n('chenReturn',3,'office','dialogue','他来取回第一张试样',s=>[
  s.flags.heardChen?'“你还认得这张旧纸吧。”他把第一次的版面夹了回来。“说好再来找我，后来又忙到这儿。我替你拿来了。”':s.flags.revised?'陈师傅把第一张试样送过来：“别只留后来那张。墨色不同，过些时候就分不清怎么改的。”':'陈师傅把送样小笺夹回来：“试读意见也留着，不用等有了第二张才记。”',
  '他在背面补了排印和修改的经过，没提自己的名字。你拿起笔，想把这一双手也记进去。'
 ],[a('thank-chen','把排印人的工作也记进交接','transferSlip',{effect:{flags:{creditedChen:true}}}),a('back-workroom','再看看工作间','returnOffice')],{character:'chen'}),
 n('transferSlip',3,'office','slip','交接笺上，多出了两个字',[
  '你正准备写接手人，看见“试读后”旁边圈着两个字：可用。',
  '你没有说过这两个字。周禾也没有。那张纸却已经压在待交的试样上，仿佛所有人都点过头了。',
  '林青在找另一份来信，还没注意到你停了下来。'
 ],[a('trace-handoff','先不交出去，查清“可用”从哪里来 →','slipInquiry'),a('mark-provisional','先改为待复核，保留分歧再交接','provisionalRecord')],{slip:'ledger',sources:['art']}),
 n('slipInquiry',3,'office','scene','同一张纸，谁以为谁已点头',[
  '“可取样”“愿意读”，怎样成了“可用”？去找经手人，带回原话。交接笺先压在这里。'
 ],[hub('ask-lin-slip','林青 · 谁记了“可用”',72,35,'linSlip'),hub('ask-chen-slip','陈师傅 · 谁送来试样',20,38,'chenSlip'),hub('ask-zhou-slip','回窗边 · 再问周禾',87,53,'zhouSlip'),a('compare-handoff','把作坊小笺与读者意见并排 →','slipWorkbench',{requires:s=>s.clues.includes('pressMark')&&s.clues.includes('readerReservation')?'':'先带回作坊小笺与读者的保留意见。'}),a('mark-provisional','暂记待复核，不把分歧写成同意','provisionalRecord')],{hint:'陈师傅有随样小笺；周禾能确认自己究竟同意了什么。把两条带回再对读。'}),
 n('linSlip',3,'office','dialogue','“那两个字，是我添的。”',[
  '林青接过交接笺，先承认是自己的笔迹。',
  '“那边传来话说能取样了，你又已经拿去读过。我想两头都接上，就写了可用。”她把笔停在纸上。“你们后来怎么说的，我还没听完。”',
  '她没有替自己辩解，也没有催你赶紧交。“把原来那张小笺和他的意见给我看看。”'
 ],[a('show-both-notes','将两处原话放到她面前 →','slipMeeting',{requires:s=>s.clues.includes('pressMark')&&s.clues.includes('readerReservation')?'':'还需拿到作坊小笺与周禾的保留意见。'}),a('back-inquiry','继续顺着经手的人追问','slipInquiry')],{character:'lin',presents:{pressMark:s=>s.clues.includes('readerReservation')?'slipMeeting':'linNeedsReader',readerReservation:s=>s.clues.includes('pressMark')?'slipMeeting':'linNeedsPress'}}),
 n('linNeedsReader',3,'office','dialogue','只问印的人，还不够',[
  '“可取样。我认得这几个字。”她又看了看自己的“可用”。“中间还有周禾那一次。得让他自己说，试读之后同意了什么。”'
 ],[a('back-inquiry','再去问读者 →','slipInquiry')],{character:'lin'}),
 n('linNeedsPress',3,'office','dialogue','意见听见了，传话还差一截',[
  '“他有保留，不能写成可用了。”林青先把那两个字圈起。“可我还想看一眼，作坊那边原来写的究竟是什么，免得下回又接错。”'
 ],[a('back-inquiry','再去找作坊的小笺 →','slipInquiry')],{character:'lin'}),
 n('chenSlip',3,'press','dialogue','“我是说，能取样了。”',[
  '陈师傅找了找，从压纸板下抽出一张折起的小笺。上面是他送样时写的几行字。',
  '“可取样，是叫你拿去试读。我若知道人家读完都怎么说，还用等你回来？”',
  '他看见小笺末尾被折在里面，顿了一下。“我也图省事。几行话折成这么小，传一手就少看半句。”'
 ],[a('take-press-note','带上小笺，回去查下一处 →','slipInquiry')],{character:'chen',enter:{add:['pressMark']}}),
 n('zhouSlip',3,'window','dialogue','“愿意读，不是没有意见。”',[
  '周禾听完，先问：“那张纸是不是把我说可以试试，也算在里面了？”',
  '你点点头。他把试样背面的保留意见又指给你看：“这里我不是写了吗？我愿意读，也愿意再说。怎么到了那头，倒成没话了。”',
  '他有一点不快，但没有把纸抽走。“带回去。说我还等着看下一版。”'
 ],[a('take-reader-note','带上他明确留下的意见 →','slipInquiry')],{character:'zhou',enter:{add:['readerReservation']}}),
 n('slipWorkbench',3,'office','slip','折住的那一行，还在',[
  '你把作坊小笺放在左边，把周禾的保留意见放在右边。',
  '“可取样”露在最外面，末尾的一行仍折在里面。试样被送去试读，这件事从未等于试读已无异议。'
 ],[a('unfold-slip','用手展开小笺被折住的一行 →','slipUnfolded')],{slip:'folded'}),
 n('slipUnfolded',3,'office','slip','“送试读，有意见再改。”',[
  '折痕下面，陈师傅原来还写了一行：送试读，有意见再改。',
  '一边是允许取样，一边是愿意试读，中间又添了一次推想，最后却变成了“可用”。',
  '没有谁说过“全部同意”。纸上多出的这句话，需要由经手的人一起改回来。'
 ],[a('bring-both-notes','把原话与保留意见带给林青 →','slipMeeting')],{slip:'unfolded',enter:{flags:{unfoldedSlip:true}}}),
 n('slipMeeting',3,'office','dialogue','她划掉“可用”，没有划掉自己的名字',[
  '“是我把两件事接成了一件。”林青先说。“谁做到了哪一步，就记到哪一步。不能因为想赶快办完，就替人答应。”',
  '她重新写：已取样；已试读；尚有意见。然后把自己的经手名留下，没有让你替她悄悄改掉。',
  '你将两张小笺夹在后面。那处错误没有被藏起来，下一位接手的人也能知道为什么改。'
 ],[a('correct-notation','留下修订依据，再办交接 →','handoffDesk',{effect:{flags:{recordCorrected:true}}})],{character:'lin'}),
 n('provisionalRecord',3,'office','dialogue','先把“还不知道”写清楚',[
  '你告诉林青，眼下不能确认“可用”。至少周禾的意见还没有被完整带回来。',
  '她将那两个字圈掉，改记“已试读，仍待复核”，在后面留出待联系的名字。',
  '“先这样交，也得把这个一并交。不能到下一双手里，又变成一句办好了。”'
 ],[a('continue-handoff','带着待核说明，继续交接 →','handoffDesk',{effect:{flags:{recordProvisional:true}}}),a('trace-handoff','我想现在把经手的话问清楚','slipInquiry')],{character:'lin'}),
 n('handoffDesk',3,'office','handoff','下一双手，是谁的',[
  '交接笺没有写“已完成”。它留着接手的人、接手的内容，还有没有解决的问题。',
  '周禾愿意再与同伴试读；林青能留下工作记录并联系下一位；你也可以自己带着走，但暂时没有人在另一头等你。'
 ],[a('handoff-reader','请周禾继续试读，约定再收意见','handshakeReader',{effect:{flags:{handoff:'reader'},add:['handoff']}}),a('handoff-clerk','交林青登记，由她联系下一位接手者','handshakeClerk',{effect:{flags:{handoff:'clerk'},add:['handoff']}}),a('handoff-self','由自己带着，暂不确定下一位接手者','handshakeSelf',{effect:{flags:{handoff:'self'},add:['handoff']}})],{sources:['art']}),
 n('handshakeReader',3,'window','record','“读完，我把他们的话带回来。”',s=>[
  s.flags.permission?'周禾接过试样，先确认了你们改过的那一处。“他们要是还有不同说法，我一并带着，不给你挑好听的。”':'周禾没有立即收进衣袋：“我可以带去问。可有人说不出你纸上那些话，也得让他开口。这个你答应吗？”',
  '你在纸背记下约定：不同意见也带回来。周禾将折页放进衣袋，按了按，怕被风掀走。'
 ],[a('seal-handoff','把接手与反馈约定一起记下 →','workDayEnds')],{character:'zhou'}),
 n('handshakeClerk',3,'office','record','记录不等于替人点头',[
  '林青将试样与试读意见放在一起，把“尚待继续试读”写在旁边。',
  '“我来联系。但这边收下了，不等于那边已经读过。以后有消息，我再续上。”',
  '她把同一份交接抄给你。你终于明白，记录也可以把未完成的部分留下。'
 ],[a('seal-handoff','带走抄件，留下待续的位置 →','workDayEnds')],{character:'lin'}),
 n('handshakeSelf',3,'office','record','纸留在自己手里，路还没有接上',[
  '“也好，先带着。”林青没有劝你马上交出去。“只是以后谁来接，你还得再问。”',
  '她在收件人一栏留白。你把纸折起时，那个空格恰好露在外面。'
 ],[a('seal-handoff','记下尚未落实的交接 →','workDayEnds')],{character:'lin'}),
 n('workDayEnds',3,'office','interlude','灯熄以前，还有一声道别',[
  '最后一张纸被压好，门外的声音渐渐稀了。你把铅笔还到原来的地方。',
  '这一天没有一份宣布一切顺利的结案书。有人提出了意见，有人愿意继续问，也有一处还空着。',
  '你从那张桌旁起身，纸上的时间开始向前。'
 ],[a('close-day','把这一日合起，走向后来 →','summerTransit'),a('one-more-question','离开前，再问陈师傅一句','afterHours')]),
 n('afterHours',3,'press','dialogue','“明天还印吗？”',[
  '你问明天是否还要来。他正在把字归回格里，答得很平常：“有该印的就印。有得改的就改。”',
  '你原想听一句更大的话。他却怕你站在门口着凉，将门推得小了一点。',
  '后来，你记住的恰是这句平常话。'
 ],[a('close-day','道别，走向后来 →','summerTransit')],{character:'chen'}),

 // 第四折：历史行程为背景，玩家不改写组织和真实人物的结局。
 n('summerTransit',4,'river','interlude','纸上的夏天，水在向前',[
  '时间越过最初的试读，来到武汉战事日益紧迫的夏天。',
  '相关研究记述：1938 年 7 月 30 日，老舍与何容、老向、萧伯青离汉，携带文协文件、名册、账目，经宜昌赴重庆。人物行程与组织整体迁移，不是同一个日期。',
  '接下来，江上行囊承接的是你参与的演绎支线。真实旅程仍在它自己的材料里。'
 ],[a('step-on-deck','走到纸上的甲板 →','riverHub'),a('read-journey-first','先读这段行程的依据','journeyDocument')],{sources:['journey','three'],kicker:'第四折 · 历史背景与演绎在此分开'}),
 n('riverHub',4,'river','scene','行囊里，装得下谁',[
  '江风掀起纸角。抄页和试样还没收好，另有一页想写给人的话。先把它们放进行囊。'
 ],[hub('inspect-trunk','打开纸上行囊',25,56,'packing'),hub('find-lin','林青留下的交接提醒',75,49,'linRiver'),hub('look-water','向江面看一会儿',53,31,'riverLook'),a('read-travel-account','展开真实行程的材料','journeyDocument')],{hint:'在行囊里留下试样与工作抄页，再写明你还想交给谁。'}),
 n('packing',4,'river','packing','先把散开的纸收好',[
  '你将布包铺开，用旧纸垫住里面的一角。抄页的边磨卷了，试样上还有铅笔留下的圈点。',
  '先翻看工作抄页与自己的试样，把它们收妥。然后，给这份交接留一个朝向。'
 ],[a('wrap-ledger','翻看工作抄页，包好','ledgerFold',{effect:{flags:{packedLedger:true},add:['records']}}),a('wrap-proof','翻看自己的试样，包好','proofFold',{effect:{flags:{packedProof:true}}}),a('wrap-letter','看看留给家里的一页','letterFold',{effect:{flags:{packedLetter:true}}}),a('make-address','合起行囊，写下一位收件人 →','addressing',{requires:s=>s.flags.packedLedger&&s.flags.packedProof?'':'先将工作抄页与自己的试样收妥。'}),a('back-deck','暂时合上，回到甲板','riverHub')]),
 n('ledgerFold',4,'river','detail','名单并不是一串数字',[
  '抄页上先记了谁看过试样，下面是没有续完的意见，以及还要联系的人。林青自己的经手名也留在上面。',
  '你将纸折到记录的背面，想到真实行程中那些被一起带走的文件、名册与账目。'
 ],[a('back-to-trunk','将抄页收入布包 →','packing')],{sources:['journey','association']}),
 n('proofFold',4,'river','proof','纸上，还留着那次停顿',s=>[
  s.flags.format==='oral'?'背面还有你准备口述时记下的停顿。周禾后来在那一句提出了意见，你没有将记号擦掉。':'你沿原来的折痕展开小页。被圈住的位置还看得出铅笔的痕迹，周禾那次停住的地方仍在。',
  s.flags.handoff==='reader'?'交接笺写着，周禾将继续问同伴。你带的是抄样，也带着等待反馈的责任。':s.flags.handoff==='clerk'?'林青留下正式交接，你带着抄样。下一位读者的回应还没有被填进来。':'纸还在自己手里。接手一栏仍然空着。'
 ],[a('back-to-trunk','将试样收入布包 →','packing')]),
 n('letterFold',4,'river','letter','“我好”，然后呢',s=>[
  s.flags.heardHome?'你想起周禾说，若只写“我好”，好像一天都没过。问家里好不好，又怕也只收到这两个字。':'你在空白纸前停了一会儿。交代工作有许多具体的词，写给挂念的人，却不容易起头。',
  '这一次，你不用替别人修改。你把纸放平，笔尖悬了一会儿，先写给一个自己惦记的人。'
 ],[a('back-to-trunk','把这页留在行囊里 →','packing')],{note:'opening'}),
 n('linRiver',4,'river','dialogue','“别只把纸带走。”',s=>[
  s.flags.carePromise?'纸中传来林青熟悉的声音：“你说过还要问问人。到了下一处，也别忘了。”':'你翻到林青留下的提醒：“到下一处，先让对方知道从哪里接。别只把纸带走。”',
  s.flags.handoff==='self'?'接手一栏仍空着。她没有替你填上，只在旁边留了一个问号。':'她把你们约定的接手人圈了一下。一个名字，使这一页有了下一步。'
 ],[a('inspect-trunk','回去收好交接抄件 →','packing'),a('back-deck','再向江面看看','riverHub')],{character:'lin'}),
 n('riverLook',4,'river','interlude','这里不是一句整齐的离别',[
  '你把手从纸上松开，听一会儿江风。城的轮廓渐渐退远，眼前的人却还得吃饭、等船、照应彼此。',
  '有关这段旅程，当时文章与后来回忆留下了不同感受：困顿和批判，也有同舟之间的小小温情。它们并不自动互相取消。'
 ],[a('compare-voices','把不同的记述放在一起读','voicesOnRiver'),a('back-deck','回到自己的行囊 →','riverHub')],{sources:['journey']}),
 n('journeyDocument',4,'river','document','让行程留在有据的文字里',[
  '《船上的老舍》引述并讨论了老舍《船上——自汉口到宜昌》及萧伯青的回忆。',
  '出发、滞留与发表是不同事件。老舍的文章发表于 1938 年 10 月 16 日《宇宙风》第 77 期，不能把发表日当成出发日。',
  '文中的具体船名属于研究者比较材料后的推测。你可以留下这个问题，也可以暂时不填。'
 ],[a('ask-boat-name','看看船名为什么仍有问号','boatName'),a('compare-voices','再读同舟者不同的感受','voicesOnRiver'),a('back-deck','带着依据回到甲板 →','riverHub')],{sources:['journey'],enter:{add:['records']}}),
 n('boatName',4,'river','document','一处问号，不妨留着',[
  '研究者将船只资料、行驶区域与原文描述对照，推测为龙安轮。眼前没有一份由本作核到、明确写出这艘船名的当时凭据。',
  '你没有给眼前的演绎甲板贴上这个名字。留下一处问号，不会让他们携带的工作与离别失去重量。'
 ],[a('back-deck','把问号留在手记，回甲板 →','riverHub')],{sources:['journey'],enter:{add:['boat']}}),
 n('voicesOnRiver',4,'river','compare','同一段江面，不同的笔',[
  '当时的文章注视船上残破设施、服务困境与国耻；萧伯青后来回忆中也出现同舟闲谈、分享食物的温情。',
  '写作的时刻、位置与关注点不同，人的感受并不只剩一种。你保留材料的作者与时间，让读者能回到各自上下文。'
 ],[a('back-deck','收好两种声音，回到行囊 →','riverHub')],{sources:['journey'],enter:{add:['differentVoices']}}),
 n('addressing',4,'river','letter','收件人这一栏，不能由纸自己填',[
  '包里的纸已经收妥。你在外面另夹一页，不抄真实私人地址，只写这段经历还想交给谁。',
  '寄给周禾，意味着还愿意听他和同伴的意见；寄给林青，意味着让工作与未完成处继续可查；也可以留给还不认识的人。'
 ],[a('write-to-reader','写给周禾：还想听你继续说','riverFarewell',{effect:{flags:{recipient:'reader'}}}),a('write-to-clerk','写给林青：接下去的事，仍需有人记得','riverFarewell',{effect:{flags:{recipient:'clerk'}}}),a('leave-recipient-open','写给后来接起这页的人','riverFarewell',{effect:{flags:{recipient:'later'}}})]),
 n('riverFarewell',4,'river','interlude','下一声回应，还没有来到',s=>[
  s.flags.recipient==='reader'?'你写下周禾的名字，记得那个“禾”字。窗边的谈话已被留在身后，但你没有把问题也留在身后。':s.flags.recipient==='clerk'?'你写下林青的名字，记得她先问人的消息，再翻试样的那一刻。':'你没有填一个熟悉的名字。那一栏留给后来的人，也把问题交给了自己。',
  s.flags.handoff==='self'?'可是你发现：想写给谁，与已经交给谁，还不是一回事。收件人的愿望不能替你补出一次真实交接。':'你已留下具体接手与反馈的约定。此后能有怎样的回应，仍要等另一头的人开口。'
 ],[a('hear-farewell','再听听那张桌旁的声音 →',s=>s.flags.handoff==='self'?'unsettledHandoff':'travellingNote')]),
 n('unsettledHandoff',4,'river','dialogue','那处空白，又一次回到眼前',[
  '林青留下的那句提醒忽然变得清楚：只有“我带走了”，还没有“谁接到了”。',
  '你可以补上一份在演绎支线中的交接约定，请她联系后续试读；也可以如实带着未落实的问题继续，不给自己补写回执。'
 ],[a('entrust-now','补记委托，请林青接续联系','travellingNote',{effect:{flags:{handoff:'clerk',lateHandoff:true}}}),a('carry-uncertainty','保留没有确认交接的空白 →','travellingNote',{effect:{flags:{unconfirmed:true}}})],{character:'lin'}),
 n('travellingNote',4,'river','letter','江水往前，纸上留下了人',s=>[
  s.flags.handoff==='reader'?'周禾接过的不是一份“只能同意”的成品。你曾允许他继续问，也承诺不把不同意见挑掉。':s.flags.handoff==='clerk'?'林青留下的不是一个完成符号。它记着经手的试样、谁看过，还有需要再问的地方。':'你保留了那一栏空白。没有确认的事，没有被漂亮的结尾替你确认。',
  s.flags.creditedChen?'陈师傅的名字也在经手记录里。一页纸走到这里，原来经过了这么多双手。':'你想起排印桌上的墨辊。还有许多没有被你逐个写出名字的手，曾让一页纸继续。',
  '甲板渐渐隐入纸纹。翻过这一折，来到后来留下的材料。'
 ],[a('turn-october','翻到后来的一期刊物 →','octoberIssue')]),

 // 第五折：演绎回声不冒充档案回执，真实刊物承担历史的继续。
 n('octoberIssue',5,'archive','document','秋天，还有新的一期',[
  '《抗战文艺》第二卷第六号，日期为 1938 年 10 月 15 日。原站的目录列着《制作通俗文艺的苦痛》、会务报告与文艺简报等内容。',
  '纸上的讨论并没有被一次试样解决。面对群众怎样写、怎样做，仍有人继续工作。',
  '你把自己的两张试样收在旁边，给这份真实原刊腾出位置。'
 ],[a('find-work-continued','沿着目录，看看工作如何继续 →','workContinues'),a('read-later-pages','把这一期再展开一些','laterPages')],{artifact:'issue18',sources:['issue18'],enter:{add:['laterIssue']}}),
 n('laterPages',5,'archive','document','翻页时，让原件保留自己的声音',[
  '这期原站清单有十六幅图，当前使用公开预览规格。你可以打开原页阅览器继续换页。',
  '目录、扫描图序与文章页码不是同一个编号。未逐字核过的全文，不替它编造转录。'
 ],[a('find-work-continued','带着原页，继续 →','workContinues')],{artifact:'issue18',imagePage:1,sources:['issue18']}),
 n('workContinues',5,'archive','narration','原来，苦痛也写进了刊物',[
  '你记起那次试读。眼前目录中的“苦痛”二字，不再只是一个学术题目。',
  '抗战中的通俗文艺有鼓词、小册、街头剧等多种实践。选择形式、理解读者、组织工作，都需要尝试和争论。',
  '你经历的是一段今天的演绎；这些真实材料，让演绎不至于只剩气氛。'
 ],[a('open-return','再展开你留下的那份交接 →','returnEnvelope'),a('read-practice','读一读通俗文艺实践的依据','practiceRecord')],{sources:['issue18','three','association']}),
 n('practiceRecord',5,'archive','document','形式的背后，是要面对的人',[
  '老舍、老向、何容，相关研究常将他们并称“三老”。创作之外，他们也编辑、改稿，采用不同形式面对兵士与乡村群众。',
  '你认出这类日常工作的名字：上一张纸还没改好，下一张已经在等。有共同的抗敌目的，也有各种需要慢慢解决的具体问题。'
 ],[a('open-return','回到自己的交接 →','returnEnvelope')],{sources:['three','association']}),
 n('returnEnvelope',5,'archive','interlude','这里有几种可能的回声',s=>[
  s.flags.handoff==='reader'?'你把下一次试读交给周禾。接下来的演绎回声，回应你当时留下的版本与约定。':s.flags.handoff==='clerk'?'你把工作交给林青登记。接下来首先看见的，是被保存的试样与尚待续上的意见。':'你没有确认下一位接手者。这里不会凭空出现一张宣告送达的回执。',
  '这些后续由你的选择写成，属于作品演绎。历史材料没有为林青、陈师傅、周禾这三位虚构人物作证。',
  '先听一声回应，再把他们的纸放回原来的来处。'
 ],[a('read-reader','听听周禾会怎样接这页 →','readerEcho'),a('read-printer','再看陈师傅留下的改稿','printerEcho'),a('read-clerk','翻看林青保存的记录','clerkEcho')],{kicker:'演绎回声 · 行动的后果'}),
 n('readerEcho',5,'archive','dialogue','这一次，他没有只说“很好”',s=>{
  if(readerOutcome(s)==='unconfirmed')return ['没有一份确认到达的回信。你想起周禾最后把纸放在桌上的样子，却不能用想象替他报一个平安。','你仍然可以把自己的试样和未完成的交接留下。以后若有人接起它，至少知道还需要问谁、问什么。'];
  if(readerOutcome(s)==='filed')return ['工作记录保留着周禾提过的意见，但这一条交接首先落实在林青那里。眼前没有周禾后一次试读的反馈。','若你愿意继续联系，就仍需再问。你没有把“有人收存”写成“所有人都已经读过”。'];
  if(readerOutcome(s)==='shared')return [s.flags.format==='oral'?'“我先念给他们听。到你留下的问句，别人真插进来讲了。有个人说，等人的时候他也帮着背过东西。”':'“他们在折页空白处添了一句：路难走的时候，不只前面的人要回头，后面的人也会往前递一把手。”',s.flags.credit==='named'?'“你把禾字写对了。旁边的人也说，下次有他们愿意留下的话，先让他们看过再写。”':'“没有我的名字，也有人知道是听过人说话才改的。先别替所有人都写完。”','这不是一次结束。你留下的问句，使下一次讲述有了位置。'];
  return [s.draft.motif==='banner'?'“我带去问了。有人愿意听那句号召，也有人觉得，自己的话还没放进去。”':'“我带去问了。有人认得那段夜路，也有人说，自己的经历还没放进去。”','“我没有把你那一版当成所有人的话。等你再来，我们还可以改。你既然来问过，就再听完这一回。”','演绎中的交接发生了，但你与读者的分歧仍在。它没有被一个完成标记盖住。'];
 },[a('back-to-archive','把这一声回应放在档案桌上 →','archiveSpread')],{character:'zhou',kicker:'演绎回声 · 周禾'}),
 n('printerEcho',5,'archive','dialogue','留在排印桌上的纸',s=>[
  s.flags.revised?'陈师傅把两次取样的纸错开排着：“为什么改，为什么留，下一个人接手总得知道。”':'陈师傅保留了第一次试样，也保留了周禾提出的意见：“没改的地方，也得知道不是没人说过。”',
  s.flags.format==='oral'?'“要念给人听，停在哪儿也得试。字没多几个，工夫一样省不了。”':'“折得再小，展开时也得让人读得清楚。别为了装得下，把人家的话挤没了。”',
  s.flags.creditedChen?'你在经手记录中写下了排印人的工作。他没有说什么，只把那格字重新归好了。':'你记起还有一双手的工作没有被你详细写下。这也是以后可以补上的一笔。'
 ],[a('back-to-archive','把改稿一起留在桌上 →','archiveSpread')],{character:'chen',kicker:'演绎回声 · 陈师傅'}),
 n('clerkEcho',5,'archive','dialogue','“我替你留了未办完的地方。”',s=>[
  s.flags.recordCorrected?'“那回我图快，写了‘可用’。还好你带着原话回来问。”林青把改过的交接笺留在最上面，自己的经手名也还在。':s.flags.handoff==='clerk'?'林青的记录里，有你的委托，也有经手的试样。她没有把“继续联系试读”改成一个完成的勾。':'林青留下的是经手关系与待续的问题。她没有因为你离开，就替另一头的人补一声“收到”。',
  s.flags.carePromise?'“你后来记着回来问人的消息。我也记着。工作单上写不下这些，就另留一页。”':'记录旁有一页不属于工作单的问候。你现在才更清楚地看到它。',
  '“以后有人来找，就从这里接。不要让他又从头猜一次。”'
 ],[a('back-to-archive','让后来的人可以接着查 →','archiveSpread')],{character:'lin',kicker:'演绎回声 · 林青'}),
 n('archiveSpread',5,'archive','scene','把纸摊开，把来处也留下',[
  '真实原刊和你的试样分开摊着。三个人的回声，都还可以再听。你也能留一页自己的话。'
 ],[hub('read-reader','周禾的回声',26,40,'readerEcho'),hub('read-printer','两张试样',64,47,'printerEcho'),hub('read-clerk','林青的交接记录',82,39,'clerkEcho'),a('inspect-catalogue','再查馆藏与刊行的差别','catalogueGap'),a('look-photo','看一张真实武汉照片','wartimePhoto'),a('write-ending','留给后来人的一页 →','seal')],{hint:'回声属于演绎；编号可回到每份真实材料。'}),
 n('catalogueGap',5,'archive','document','没有找到，不等于没有发生',[
  '平台选刊书目著录到 1946 年 4 月，研究文章另述最后一期为 1946 年 5 月 4 日。两种记录所指对象不同，末期原件仍需继续寻找。',
  '你没有把馆藏最晚的一页当作全部历史的终点。眼前的不完整，也可以成为后来继续查阅的起点。'
 ],[a('back-to-archive','把这一处缺口写进来处 →','archiveSpread')],{sources:['catalogue'],enter:{add:['catalogue']}}),
 n('wartimePhoto',5,'archive','document','在演绎画面之外，看见真实的人',[
  '这幅照片在杜鲁门图书馆的著录题为“汉口难民快照”，日期列为 1938 年，描述为等待继续迁移的人。',
  '馆方没有将他们认作本作人物，也没有给出你在故事里走过的地点。请让照片保留自己的题名、编号与处境。'
 ],[a('back-to-archive','连同题名与出处一起收好 →','archiveSpread')],{artifact:'refugees',sources:['refugees']}),
 n('seal',5,'archive','seal','你愿意把哪一句，交给后来的人',[
  '不必替这段历史写一段完整的感想。可以留下一个还想追问的人、一处未解决的事，或一句愿意继续做的承诺。',
  '你写下的文字只保存在当前浏览器，也可以连同资料来处带走。'
 ],[a('leave-letter','收好这一页 →','ending',{effect:{flags:{finished:true}}}),a('back-to-archive','我还想再看看那张桌','archiveSpread')],{note:'closing'}),
 n('ending',5,'archive','ending','山河有信，等你续上一行',[
  '信纸、校样、名册抄页，重新摊在你的桌上。某一句被圈过，某个人的名字被改正，也有一处仍等着回音。',
  '你把自己的回应夹在后面。真实原刊与资料来处仍可打开，后来的人可以从这里继续。'
 ],[a('return-to-archive','回到档案桌，继续查阅 →','archiveSpread')],{sources:['letter','issue1','issue18','front','journey']}),
 n('aside',1,'office','dialogue','你把线索放到对方面前',[],[a('return-to-conversation','收起这条线索，继续刚才的事 →',s=>s.returnNode)],{aside:true})
];
export const NODES=Object.fromEntries(script.map(page=>[page.id,page]));

// 按人物回应持有的材料。出示不替代试读、修订和交接这些必要行动。
export function responseFor(state,character,clue){
 const title=CLUES[clue].title;
 if(character==='lin'){
  if(clue==='plan')return ['“你又带着那个‘拟’字来了。”林青把它放在交接笺旁。“拟，是筹画。让它继续往下走，要有接手的人，不能只靠把字写重。”','“你现在做的这件事，谁接着？”'];
  if(clue==='care'||clue==='homeLetter')return ['“事情要追，人也得问。”她认出你带来的不是一张进度单。','“只是旁人的家信，愿意给你看多少，就留下多少。别让问候成了追问。”'];
  if(clue==='handoff'||clue==='records')return ['她在接手一栏停了一下：“谁拿走了，谁还在等，哪里要再联系，都记清楚。有人收下，不等于事情全办完。”'];
  return ['她看了看“'+title+'”，没有替你另开一条捷径。','“把这条来处留着。眼下先把刚才那件事接好，我这里也还在等你。”'];
 }
 if(character==='chen'){
  if(clue==='types')return ['“还记得这格字？”他点点头。“下回归错地方，来找的人就得多翻半天。纸背后的手，也得有人想着。”'];
  if(clue==='readerVoice'||clue==='consent')return ['“这是人家愿意让你用的话？”他先问了一句。','“那就别只改字号。哪一句该留，先想清楚。试样的位子还在。”'];
  if(clue==='proof')return ['“纸我认得。你先说，这次带回来，是哪一句需要动？”他把旧样压在旁边，没有替你宣布它已经定稿。'];
  return ['陈师傅把“'+title+'”挪到干净的一边。“来处别弄脏。可这条材料不能替你回答，眼前的人究竟怎样读这页纸。”'];
 }
 if(clue==='homeLetter')return ['“地址就别翻了。”周禾把折角压好，语气不重。','“你若想问我愿意留下什么，可以继续问。”'];
 if(clue==='readerVoice'||clue==='consent')return ['他把自己说过的那句话又看一遍：“没说完的那半句，也别忘。若改成另一个意思，先让我知道。”'];
 if(clue==='proof')return ['“你带的是这一版。”周禾认出折痕。“要我看看，就让我把话说完。别等着我替你说个‘好’字。”'];
 return ['周禾听你说完“'+title+'”。“这事你还可以去查。可我的话，我还是想自己说。我们接着刚才那句吧。”'];
}
