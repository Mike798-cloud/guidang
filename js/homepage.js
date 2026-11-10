(() => {
  "use strict";

  const esc = H4.esc;
  const siteName = "林杳同学";
  const windowTitle = siteName + " — Microsoft Internet Explorer";
  const addressRoot = "http://home.huailing.edu.cn/feiyao/";
  const sections = {
    home: ["首页", "index.htm"],
    "about-me": ["关于我", "me.htm"],
    album: ["我的相册", "album.htm"],
    essays: ["我的作文", "writing.htm"],
    diary: ["我的日记", "diary.htm"],
    broadcast: ["广播", "radio.htm"],
    messages: ["留言本", "guestbook.htm"],
    friends: ["友情链接", "links.htm"]
  };
  const link = (href, title) => '<a href="' + esc(href) + '">' + esc(title) + "</a>";
  const para = text => "<p>" + esc(text) + "</p>";
  const block = text => text.split(/\n\n/).map(para).join("");
  const clue = key => H4.hasClue("clue_" + key);
  const seen = id => H4.state.read.includes(id);
  const laterVisit = () => H4.state.cycle === 2;
  const published = () => H4.state.flags.personalPagePublished || H4.state.endingsSeen.includes("e5");
  const roomPhoto = (file, alt) => '<img src="assets/' + file + '" alt="' + esc(alt) +
    '" decoding="async" loading="lazy">';
  const title = (label, subtitle = "") => '<h2 class="student-subtitle">' + esc(label) + '</h2>' +
    (subtitle ? '<p class="student-caption">' + esc(subtitle) + "</p>" : "");

  const photos = [
    ["courtyard_memory.webp", "外婆家的院子", "1999年春", "我那双鞋还搁在门口。作文里写的就是这个院子。", ""],
    ["school_opening_2003.webp", "开学那天", "2003年9月", "校园网上发的。我站在第二排，隔着两个人，只看得见一点蓝袖子。", "#/snapshot"],
    ["site03_classroom.webp", "教室", "2003年秋", "教室朝窗户这边拍。下雨的时候，我就在最后一排抄借来的书。", ""],
    ["corridor_1.webp", "四楼走廊", "2003年11月", "值日最后才扫到窗边。玻璃擦干净了，晚上照出来的还是里头的灯。", "#/corridor"],
    ["radio_room.webp", "广播室", "2003年10月", "陈楼借我话筒试了一遍。下次他再念错我的名字，稿子让他自己改。", "#/broadcast"],
    ["rooftop.webp", "楼顶", "2003年11月", "洗出来才发现对面楼还亮着灯。这张有点暗，先放上来，回头再洗一张。", ""]
  ];

  const posts = [
    ["2003-11-18", "杨芸", "来看看你。星期五我去还书，阿姨问起你上回要留的那本。"],
    ["2003-11-14", "陈楼", "稿子搁广播室，星期一我帮你带上去。你回家晚的话就不用来拿了。"],
    ["2003-11-10", "清东", "星期五值日表改过了，在门口贴着。上回发给你的那张别抄了。"],
    ["2003-11-06", "于祯", "今天雨大，我把伞放门房了。你下楼顺手拿，蓝的那把。"],
    ["2003-11-02", "杨芸", "你这页图怎么那么大，我家拨号要开半天。外婆家的那张我看见了。"],
    ["2003-10-28", "周茜", "《槐花》那篇能借我看看吗？老师让我写我奶奶，我写了半页就没话了。"],
    ["2003-10-23", "豆庵", "下午那首没排上。我星期五值班，再帮你去问一下。"],
    ["2003-10-19", "小田", "我们班也有人做主页，我把你的地址抄给她了。她家得等晚上才能上网。"],
    ["2003-10-12", "周茜", "你说图书室那本在靠门的架子上，我找到了，谢谢。"],
    ["2003-10-08", "陈楼", "下午念的时候没卡壳。你替我画的那几道线，我没擦。"],
    ["2003-10-05", "林杳", H4.data.MESSAGES[0]],
    ["2003-10-02", "小田", "替你试了，点相片能打开。我那页还只有一行字，你下次教我怎么贴图。"],
    ["2003-09-26", "周茜", "我妈给我买了一个新本子，和你那个封皮一样。星期一拿给你看。"],
    ["2003-09-20", "杨芸", "找到了！你写给我的地址少抄了一个点，难怪一直打不开。"],
    ["2003-09-14", "林杳", "还在学怎么排版。要是有图打不开，写在这里就行。"]
  ];
  const latePosts = [
    ["2004-01-06", "陈楼", "……你在吗？上次写完我没发。教室里那几页纸我留着了，你要是回来看，别看我那天签的那一份就算了。"],
    ["2003-11-21", "杨芸", "昨天还有人说你换学校了。借书那本还留在柜台下面，阿姨不知道该放回哪儿。"]
  ];

  function startPage() {
    const updates = [
      ["2003-11-13", "#/album", "相册里补了几张学校的相片"],
      ["2003-10-23", "#/broadcast", "十月点歌，顺手把登记抄下来了"],
      ["2003-09-05", "#/essays", "作文《槐花》"]
    ];
    let content = '<div class="student-home"><figure class="student-home-portrait"><a href="#/album" aria-label="打开我的相册">' +
      '<img src="assets/linyao_doorway.webp" alt="林杳站在外婆家门边，手里夹着一本蓝色作文本" width="1152" height="864" fetchpriority="high">' +
      '</a><figcaption>外婆喊我回头，说还有一张没拍。<br><span>2003年春 · 外婆家</span></figcaption></figure>' +
      '<article class="student-home-letter"><p class="student-stationery">槐岭中学 · 高三（2）班</p>' +
      title("我是林杳") + para("这里放我写过的作文、拍糊了也舍不得扔的照片，还有替广播站抄的稿子。我们班的同学来过的话，记得在留言本写个名字。") +
      '<p class="student-sign">杳是树下面一个日。借书证上印成杏，我跑了两回才改好。</p>' +
      '<p class="student-home-shortcuts">' + link("#/messages", "翻留言本") + "　" +
      link("#/snapshot", "槐岭中学校园网") + '</p></article></div>' +
      '<div class="student-home-bottom"><section class="student-home-updates">' + title("最近更新") +
      '<ul class="student-updates">' + updates.map(([date, href, label], index) =>
        '<li><time datetime="' + date + '">' + date + '</time> ' + link(href, label) +
        (index === 0 ? ' <b class="student-new">NEW</b>' : '') + '</li>').join("") + '</ul></section>' +
      '<p class="student-home-borrow"><span>图书室</span>' +
      link("#/school?section=services&id=borrow", "星期五只还书") +
      '。上回白跑了一趟，这次记在这儿。</p></div>';
    if (published()) {
      content += '<p class="student-later"><button id="student-name-note" type="button">杳，不是杏。</button> ' +
        link("#/personal", "后来放回来的照片和作文") + "</p>";
    }
    return content;
  }

  function aboutMe() {
    return title("关于我") + '<div class="student-bio"><img src="assets/id_photo.webp" alt="林杳的学生照" width="116" height="148">' +
      '<dl><dt>名字</dt><dd>林杳</dd><dt>班级</dt><dd>槐岭中学 高三（2）班</dd>' +
      '<dt>常去的地方</dt><dd>图书室。星期五中午去还书，晚一点就得等下周了。</dd>' +
      '<dt>平时做什么</dt><dd>在文学社抄稿子，广播站要是忙不过来，也喊我帮忙。</dd></dl></div>' +
      title("借书证上的字") + para("借书证上印成了“林杏”。我去了两回，第二回带了张纸，把“杳”写大一点给阿姨看。") +
      '<details class="student-fold"><summary>入学时的登记</summary><dl>' +
      '<dt>入学日期</dt><dd>2001年9月1日</dd><dt>学籍登记号</dt><dd>HL01-047</dd>' +
      '<dt>班主任初评</dt><dd>语文较好，喜欢写东西。</dd></dl>' +
      '<p>学校那边还留着' + link("#/school?section=services&id=roster", "旧楼值日组的名单") + "。</p></details>" +
      (clue("classroom") ? '<p>' + link("#/archive?file=a1", "教室里那张有背字的学籍卡") + '</p>' : "");
  }

  function album() {
    const late = laterVisit();
    const pictures = photos.map(([file, name, date, caption, href], i) => {
      const image = roomPhoto(file, name);
      return '<figure class="student-photo' + (i === 0 ? " student-photo-feature" : "") + '"><div class="student-photo-image">' +
        (href ? '<a href="' + href + '">' + image + '</a>' : image) + '</div><figcaption><b>' + name +
        '</b> <span>' + date + '</span><p>' + caption + '</p>' +
        (i === 0 ? '<button id="photo-back" type="button">翻看照片背面</button>' :
          href ? link(href, ["", "去校园网", "", "打开走廊的几张大图", "到广播那页"][i]) : "") + '</figcaption></figure>';
    });
    pictures.push('<figure class="student-photo"><div class="student-photo-image ' + (late ? "student-photo-dark" : "student-photo-missing") +
      '" role="img" aria-label="' + (late ? "楼顶照片黑了一半" : "第七张照片没有显示") + '">' +
      (late ? roomPhoto("rooftop.webp", "") : '<span aria-hidden="true">×</span>') +
      '</div><figcaption><b>最后一张</b> <span>2003年11月14日</span><p>' +
      (late ? '这张只剩下一半。背面铅笔写了日期，谁拍的没写。' : '这张传了两次也没传上来，等我下回再试。') +
      '</p>' + (late ? link("#/messages?page=1", "同一天的留言") : "") + '</figcaption></figure>');
    const continuation = [
      ["classroom", "#/archive", "教室桌上的纸"], ["duty", "#/duty", "值班室"],
      ["stairs_pass", "#/stairs", "楼梯那几张"], ["rooftop_key", "#/rooftop", "楼顶门边"]
    ].filter(([key]) => clue(key)).map(([, href, name]) => link(href, name));
    return title("我的相册", "照片洗出来才挑了几张传上来。点学校和走廊的照片，可以接着翻。") +
      '<div class="student-album">' + pictures.join("") + '</div>' +
      '<p class="student-album-home">' + link("#/home", "门口那张在首页") + '</p>' +
      (continuation.length ? '<div class="student-related">' + continuation.join("　") +
        (H4.state.flags.corridorDone ? '<p><button id="student-corridor-restart" type="button">从第一张走廊照片重看</button></p>' : "") +
        '</div>' : "");
  }

  function essays() {
    const source = H4.source("a6").content;
    const [essay, annotations] = source.split("作文《槐花》\n\n")[1].split("\n\n老师批语：");
    const grade = annotations.split("\n\n").slice(0, 2);
    return title("我的作文", "分数折在纸背面，还是被我妈翻到了。") +
      '<div class="student-writing"><article class="student-exercise">' +
      '<div class="student-exercise-mast"><span>槐岭中学　高三（2）班</span><span>作文练习</span></div>' +
      '<h3>槐花</h3><p class="student-date">2003年9月5日　林杳</p>' + block(essay) +
      '<details class="student-fold student-correction"><summary>翻开折角，看老师的批语</summary>' +
      para("老师批语：" + grade[0]) + para(grade[1]) + '</details></article>' +
      '<figure class="student-exercise-photo"><a href="#/album">' + roomPhoto("courtyard_memory.webp", "作文本里夹着的那张院子照片") +
      '</a><figcaption>文里写的院子。<br>' + link("#/album", "去相册翻照片背面") + '</figcaption></figure></div>' +
      (clue("classroom") ? '<p>' + link("#/archive?file=a6", "看看教室留下的作文本") + '</p>' : "");
  }

  function diary() {
    const entry = (date, year, day, content) => '<article class="student-diary-entry"><header><time datetime="' +
      date + '"><small>' + year + '</small><b>' + day + '</b></time></header><div>' + content + '</div></article>';
    let content = title("我的日记", "好久才写一次，记得哪天就写哪天。") + '<div class="student-diary">' +
      entry("2003-10-23", "2003 / 10", "23", '<h3>星期四</h3>' +
        para("妈妈回来问广播里有没有我的稿子。我说我给她点的那首还没播，她说她问的是稿子。我想起稿子还在陈楼手上，忘了跟他要。") +
        '<p>' + link("#/broadcast", "十月的点歌") + '</p>') +
      entry("2003-09-01", "2003 / 09", "01", '<h3>星期一</h3>' +
        para("座位还是靠窗，暑假前夹在窗缝里的那截粉笔还在。我擦窗台的时候把它弄掉了，楼下没人，应该没砸着谁。"));
    if (seen("a12")) {
      const [, letter] = H4.source("a12").content.split("妈：");
      content += '<section class="student-diary-extra"><h3>后来夹进来的信</h3><p class="student-date">2003年11月21日，妈妈在作文本里找到这封信。</p>' +
        block(("妈：" + letter).split("【关于这封信】")[0].trim()) + '</section>';
    }
    if (laterVisit() && H4.state.fragments.length) {
      content += '<section class="student-diary-extra"><h3>从纸背找回的几页</h3>' +
        H4.state.fragments.filter(id => Object.hasOwn(H4.data.FRAGMENTS,id)).map(id => {
          const f = H4.data.FRAGMENTS[id];
          return '<details class="student-fold"><summary>' + esc(f.date) + '</summary>' + para(f.text) + '</details>';
        }).join("") + (H4.state.fragments.length === 7 ? '<p>' + link("#/mail", "与照片放在一起的两封信") + '</p>' : "") +
        '</section>';
    }
    return content + '</div>';
  }

  function broadcast() {
    const record = H4.data.RADIO_FRAGMENTS.find(clip => clip.id === "r6");
    const lines = H4.source("a8").content.split("\n").filter(line => /^10月\d+日/.test(line));
    const rows = lines.map(line => {
      const [date, author, song, ...notes] = line.split("　");
      return '<tr><th scope="row">' + esc(date) + '</th><td>' + esc(author) + '</td><td>' + esc(song) +
        '</td><td>' + esc(notes.join("　")) + '</td></tr>';
    }).join("");
    return title("广播") + '<div class="student-radio-mast"><span class="student-radio-lamp" aria-hidden="true"></span>' +
      '<b>槐岭中学广播站</b><span>林杳抄存 · 2003年10月</span></div>' +
      '<div class="student-radio-ledger"><table><caption>十月的点歌本</caption><thead><tr>' +
      '<th scope="col">日期</th><th scope="col">登记</th><th scope="col">曲目</th><th scope="col">备注</th>' +
      '</tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '<article class="student-radio-script"><h3>我替陈楼抄的稿子</h3>' +
      '<p>下午的广播到这里。<br><span class="student-script-pencil">文学社的借阅本放在图书室</span>，借走请写名字。</p>' +
      '<details class="student-fold"><summary>试话筒时多录了一句</summary>' +
      para(record.say) + '</details></article>' +
      (clue("radio_key") || H4.state.radio.length ? '<p>' + link("#/radio", "广播室那盘旧录音") + '</p>' :
        '<p>' + link("#/album", "广播室的相片") + '</p>');
  }

  function guestbook(params) {
    const list = laterVisit() ? [...latePosts, ...posts] : posts;
    const oldPage = params.get("entry") === "old";
    const size = 5;
    const total = Math.ceil(list.length / size);
    const requested = Number(params.get("page"));
    const page = Number.isInteger(requested) ? Math.min(total, Math.max(1, requested)) : 1;
    const rows = list.slice((page - 1) * size, page * size);
    return title("留言本", "认识我的请写名字，免得我猜上半天。") + '<ol class="student-posts">' +
      rows.map(([date, name, message], i) => {
        const number = (page - 1) * size + i;
        return '<li><span class="student-post-avatar avatar-' + number % 4 + '" aria-hidden="true">' + esc(name[0]) + '</span>' +
          '<div><b>' + esc(name) + '</b> <time datetime="' + date + '">' + date +
          '</time><small>来自 61.' + (number % 2 ? "144" : "153") + '.xx.xx</small>' + para(message) + '</div></li>';
      }).join("") + '</ol><nav class="student-pagination" aria-label="留言本翻页">' +
      (page === 1 ? '<span>◀ 上一页</span>' : link("#/messages?page=" + (page - 1), "◀ 上一页")) +
      '<span>第 ' + page + ' / ' + total + ' 页</span>' +
      (page === total ? '<span>下一页 ▶</span>' : link("#/messages?page=" + (page + 1), "下一页 ▶")) +
      '</nav><p class="student-caption">留言暂时只能看。</p>' +
      (page === 1 ? '<p>' + link("#/school?section=services&id=duty", "学校那边的值日表") + '　' +
        link("#/album", "翻回相册") + '</p>' : "") +
      (laterVisit() && page === 1 ? '<p>' + link("#/album", "11月14日那张照片") + '</p>' : "") +
      (clue("classroom") || oldPage ? '<details class="student-fold"' + (oldPage ? " open" : "") + '><summary>林杳旧页上的几行字</summary>' +
        H4.data.MESSAGES.slice(1).map(para).join("") +
        '<p>' + link("#/profile", "一起值日的同学后来怎么说") + '</p></details>' : "");
  }

  function friends() {
    return title("友情链接") + '<ul class="student-friends">' +
      '<li>' + link("#/snapshot", "槐岭中学校园网") + para("通知、家长留言和学校照片都在这里。我总记不住借阅时间，找不到就去看左边那栏。") + '</li>' +
      '<li>' + link("#/school?section=services&id=borrow", "学校图书室") + para("借书和还书的日子不一样，星期五只能还书。") + '</li>' +
      '<li>' + link("#/school?section=board", "学校的家校留言") + para("问校服和饭卡可以去这里，老师会回。") + '</li></ul>';
  }

  const pages = {
    home: startPage, "about-me": aboutMe, album, essays, diary, broadcast, messages: guestbook, friends
  };

  function appendix() {
    const entries = [];
    if (clue("classroom")) entries.push(["#/archive", "教室里的纸"], ["#/profile", "同学后来怎么说"],
      ["#/directory?section=notes", "陈楼的手记"], ["#/search", "站内搜索"]);
    if (clue("classroom") || clue("report")) entries.push(["#/footsteps", "门外的录音（04）"]);
    if (clue("radio_key")) entries.push(["#/radio", "广播室的录音"]);
    if (H4.state.endingsSeen.some(id => id !== "e1")) entries.push(["#/updates", "后来寄来的信"]);
    if (laterVisit() && H4.state.fragments.length === 7) entries.push(["#/mail", "与照片放在一起的两封信"]);
    if (!entries.length) return "";
    return '<aside class="student-appendix"><h3>陈楼后来加的几条链接</h3>' +
      entries.map(([href, name]) => link(href, name)).join("　") + '</aside>';
  }

  function render(root, route, params) {
    if (route === "boot") {
      boot(root);
      return;
    }
    const isHome = route === "home";
    const number = laterVisit() ? "000029" : "000028";
    const ticker = laterVisit() ? "11月14日传的相片还在。留言本最上面，多了两行字。" :
      "欢迎来我的主页！《槐花》已经传上来了，认识我的同学记得留个名。";
    root.innerHTML = '<div class="student-page"><header class="student-header">' +
      '<div class="student-banner"><span aria-hidden="true">✦</span><h1 aria-label="林杳同学"><span>林</span><span>杳</span><span>同</span><span>学</span></h1><span aria-hidden="true">✦</span></div>' +
      '<div class="student-ticker"><div class="student-ticker-window"><span>' + esc(ticker) +
      '</span></div><button id="student-ticker-toggle" type="button" aria-pressed="false">暂停</button></div>' +
      '<div class="student-visit">您是第 <span class="student-counter">' +
      Array.from(number, n => "<b>" + n + "</b>").join("") + '</span> 位访客</div>' +
      '<nav class="student-nav" aria-label="林杳的主页栏目">' + Object.entries(sections).map(([key,[label]]) =>
        '<a href="#/' + key + '"' + (key === route ? ' aria-current="page"' : "") + ">" + label + "</a>").join("") +
      '</nav></header><div class="student-content">' + pages[route](params) +
      (isHome || route === "diary" ? appendix() : "") +
      '</div><footer class="student-footer"><span>本页最后更新：2003-11-13</span><span>建议使用 Internet Explorer 浏览</span></footer></div>';

    if (isHome && H4.state.flags.proofsRevised) {
      H4.state.flags.proofsRevised = false;
      H4.save();
      H4.notice("原来的纸和日记还在。有几处说法需要重新核对。");
    }
    const toggle = root.querySelector("#student-ticker-toggle");
    toggle.onclick = () => {
      const paused = toggle.getAttribute("aria-pressed") !== "true";
      toggle.parentElement.classList.toggle("student-ticker-paused", paused);
      toggle.setAttribute("aria-pressed", String(paused));
      toggle.textContent = paused ? "继续" : "暂停";
    };
    const photo = root.querySelector("#photo-back");
    if (photo) photo.onclick = () => {
      if (laterVisit()) H4.fragment("f6");
      else H4.modal({title: "照片背面", bodyHTML: '<div class="student-photo-reverse"><p>周六记得带面回去，外婆留了花。</p></div>'});
    };
    const restart = root.querySelector("#student-corridor-restart");
    if (restart) restart.onclick = () => {
      H4.state.corridor = {seg:1,p:0};
      H4.state.flags.corridorDone = false;
      H4.state.flags.lookedThisRun = false;
      H4.save();
      H4.go("#/corridor");
    };
    const name = root.querySelector("#student-name-note");
    if (name) name.onclick = () => H4.modal({title:"林杳的名字",bodyHTML:"<p>试广播那回，她说：“杳是树下面一个日。”</p>"});
  }

  function boot(root) {
    root.innerHTML = '<section class="student-dial"><h1>林杳同学</h1><h2>拨号连接</h2><div id="boot-lines" aria-live="polite"></div>' +
      '<p class="student-caption">虚构作品，含校园欺凌与死亡主题。可以静音游玩。</p><div id="boot-actions"></div>' +
      '<p class="student-dial-credit">abc studio</p></section>';
    const log = root.querySelector("#boot-lines");
    const lines = ["正在连接 16300 …", "正在验证用户名和密码…", "正在打开个人主页…"];
    const reduced = H4.motionReduced();
    lines.forEach((line, index) => {
      if (reduced) log.insertAdjacentHTML("beforeend", para(line));
      else H4.app.later(index * 240, () => log.insertAdjacentHTML("beforeend", para(line)));
    });
    root.querySelector("#boot-actions").append(H4.btn("打开主页", () => H4.go("#/home")));
  }

  let music;
  let playing = false;
  let sequence = 0;
  function musicLabel(text) {
    const button = H4.$("#student-music");
    if (button) button.textContent = text;
  }
  function stopMusic() {
    sequence++;
    if (music) music.pause();
    playing = false;
    musicLabel("播放音乐");
    H4.app.updateAudioStatus();
  }
  async function toggleMusic() {
    if (playing) {
      stopMusic();
      return;
    }
    if (H4.state.muted) {
      H4.notice("声音关着。打开声音后可以播放音乐。");
      return;
    }
    if (!music) {
      music = new Audio("assets/audio/archive_theme.mp3");
      music.loop = true;
      music.volume = .26;
    }
    H4.A.init();
    const request = ++sequence;
    playing = true;
    musicLabel("停止音乐");
    H4.app.updateAudioStatus();
    try {
      await music.play();
    } catch (_) {
      if (request !== sequence) return;
      stopMusic();
      H4.notice("这段音乐暂时播不了。");
    }
  }

  function routeFromAddress(input) {
    const address = input.trim().replace(/^https?:\/\//i, "");
    if (!address.startsWith("home.huailing.edu.cn/feiyao/")) return "";
    const [file, query] = address.slice("home.huailing.edu.cn/feiyao/".length).split("?");
    const route = !file ? "home" : Object.keys(sections).find(key => sections[key][1] === file);
    return "#/" + (route || "missing") + (route && query ? "?" + query : "");
  }

  H4.Homepage = {
    has: route => route === "boot" || Object.hasOwn(sections, route),
    render,
    musicPlaying: () => playing,
    frame(root, route, params) {
      document.body.classList.remove("view-original","view-scene");
      const schoolStyle = H4.$("#site03-css");
      if (schoolStyle) schoolStyle.disabled = true;
      H4.Shells.scroll().scrollTop = 0;
      root.dataset.route = route;
      root.setAttribute("tabindex", "-1");
      H4.$("#title-text").textContent = windowTitle;
      H4.$("#address-title").textContent = "地址";
      H4.$("#address-room").textContent = "";
      const addressParams = new URLSearchParams();
      if (route === "messages") {
        if (params.has("page")) addressParams.set("page", params.get("page"));
        if (params.get("entry") === "old") addressParams.set("entry", "old");
      }
      const query = addressParams.size ? "?" + addressParams.toString() : "";
      const path = (sections[route]?.[1] || "index.htm") + query;
      H4.$("#address").value = addressRoot + path;
      H4.Portal.updateAddress();
      H4.$("#route-announcement").textContent = sections[route]?.[0] || siteName;
      document.title = route === "home" || route === "boot" ? windowTitle : sections[route][0] + " · " + siteName;
      H4.Portal.layout();
      root.focus({preventScroll:true});
    },
    setSurface(route) {
      const active = this.has(route);
      document.body.classList.toggle("student-surface", active);
      document.body.classList.toggle("student-dial-surface", route === "boot");
      if (!active || route === "boot") stopMusic();
      if (active) {
        document.body.classList.remove("view-original","view-scene");
        H4.$("#title-text").textContent = windowTitle;
      }
    },
    status() {
      if (H4.state.muted && playing) stopMusic();
      const investigating = clue("classroom") || H4.state.endingsSeen.length > 0;
      document.body.classList.toggle("student-investigating", investigating);
    },
    bind() {
      H4.$("#student-music").onclick = toggleMusic;
      const address = H4.$("#address");
      const original = address.onkeydown;
      address.onkeydown = function(event) {
        const route = event.key === "Enter" && routeFromAddress(this.value);
        if (route) H4.go(route);
        else if (original) original.call(this,event);
      };
      window.addEventListener("pagehide", stopMusic);
    }
  };
  window.addEventListener("DOMContentLoaded", () => H4.Homepage.bind());
})();
