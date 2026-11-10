(() => {
  "use strict";
  const esc = H4.esc;
  const create = (tag, className, content = "") => {
    const node = document.createElement(tag);
    node.className = className;
    node.innerHTML = content;
    return node;
  };
  const link = (href, label) => '<a href="' + esc(href) + '">' + esc(label) + '</a>';
  function isoDate(value, year) {
    return value.replace(/(\d{4})[年/-](\d{1,2})[月/-](\d{1,2})(?:日)?/g,
      (_, y, m, d) => [y, m.padStart(2, "0"), d.padStart(2, "0")].join("-"))
      .replace(/^([0-1]?\d)[/-]([0-3]?\d)$/, (match, m, d) =>
        year ? [year, m.padStart(2, "0"), d.padStart(2, "0")].join("-") : match);
  }
  const dateLabel = (value, year) => '<time class="edition-date">' + esc(isoDate(value, year)) + '</time>';
  const links = (entries) => '<ul class="edition-links">' + entries.map(([href, title, date]) =>
    '<li>' + link(href, title) + (date ? dateLabel(date) : '') + '</li>'
  ).join('') + '</ul>';
  const box = (title, content, extra = "") => create("section", "edition-box " + extra,
    '<h2 class="edition-bar">' + esc(title) + '</h2>' + content);
  const photo = (file, alt, label, lazy = false) => {
    const image = '<img src="assets/' + file + '" alt="' + esc(alt) + '" decoding="async"' +
      (lazy ? ' loading="lazy"' : '') + '>';
    const surface = file === "envelope_back.webp" ? '<div class="edition-paper-image">' + image + '</div>' : image;
    return '<figure class="folio-photo">' + surface + '<figcaption>' + esc(label) + '</figcaption></figure>';
  };
  const table = (caption, headers, rows) => '<table class="edition-table"><caption>' + esc(caption) +
    '</caption><thead><tr>' + headers.map(h => '<th scope="col">' + esc(h) + '</th>').join('') +
    '</tr></thead><tbody>' + rows.map(row => '<tr>' + row.map((cell, i) =>
      i ? '<td>' + cell + '</td>' : '<th scope="row">' + cell + '</th>'
    ).join('') + '</tr>').join('') + '</tbody></table>';

  const textTable = (caption, headers, rows) => table(caption, headers, rows.map(row => row.map(esc)));
  const prose = (paragraphs) => paragraphs.map(([title, text]) =>
    '<h3 class="edition-subhead">' + esc(title) + '</h3><p>' + esc(text) + '</p>'
  ).join("");
  const photoEntries = [
    ['site03_classroom.webp', '旧楼教室的桌椅与窗户', '原站附图 / 教室', '#/school?section=building'],
    ['corridor_1.webp', '旧四楼第一段走廊', '照片附页 / 四楼走廊', '#/corridor'],
    ['courtyard_memory.webp', '外婆家的院子', '同学主页 / 院子', '#/album'],
    ['attachment_envelope.webp', '编号04的声音附件封袋', '附件信封 / 04号', '#/footsteps']
  ];
  function preview(entries) {
    return create("div", "edition-preview", entries.map(([file, alt, caption, href]) =>
      href ? '<a href="' + href + '">' + photo(file, alt, caption) + '</a>' : photo(file, alt, caption)
    ).join(''));
  }

  function radio(root) {
    const panel = root.querySelector(".radio-panel");
    if (!panel) return;
    const label = root.querySelector(".radio-page > .location-label");
    if (label) label.classList.add("edition-radio-location");
    const list = panel.querySelector("#radio-list");
    const receiver = panel.querySelector(".folio-radio-object");
    const tuning = panel.querySelector(".folio-radio-tuning");
    const photoRegister = create("div", "edition-photo-register edition-receiver");
    receiver.before(photoRegister);
    receiver.append(create("p", "edition-photo-fields", "广播室附图 01 · 原照片未落日"));
    const reception = create("aside", "edition-reception",
      '<h3 class="edition-subhead">接收频率</h3><p>原带声音可反复播放。频率刻度与下方波形的播放时标分开读。</p>');
    reception.append(tuning.querySelector("#radio-signal"), panel.querySelector(".recording-source"));
    photoRegister.append(receiver, tuning, reception);
    const dial = tuning.querySelector(".radio-dial");
    const dialKeys = create("div", "edition-dial-keys");
    const control = H4.G.radio;
    dial.tabIndex = 0;
    dial.setAttribute("role", "slider");
    dial.setAttribute("aria-label", "广播频率");
    dial.setAttribute("aria-valuemin", "88");
    dial.setAttribute("aria-valuemax", "108");
    dial.setAttribute("aria-valuenow", String(control.freq));
    dial.onkeydown = event => {
      const delta = {ArrowLeft: -.1, ArrowDown: -.1, ArrowRight: .1, ArrowUp: .1,
        PageDown: -1, PageUp: 1}[event.key];
      if (!delta && event.key !== "Home" && event.key !== "End") return;
      event.preventDefault();
      control.setFreq(event.key === "Home" ? 88 : event.key === "End" ? 108 : control.freq + delta);
    };
    for (const [label, delta] of [["−1.0", -1], ["−0.1", -.1], ["+0.1", .1], ["+1.0", 1]]) {
      const key = H4.Stage.button(label, () => control.setFreq(control.freq + delta));
      key.setAttribute("aria-label", (delta < 0 ? "降低" : "提高") + Math.abs(delta).toFixed(1) + "兆赫");
      dialKeys.append(key);
    }
    dial.after(dialKeys);
    tuning.querySelector("#radio-range").hidden = true;
    const player = create("div", "edition-radio-player");
    list.before(player);
    const waveform = create("details", "stage-radio-wave", "<summary>播放波形</summary>");
    const recordings = create("details", "stage-radio-recordings", "<summary>节目单和录音</summary>");
    waveform.append(panel.querySelector(".tape-playback"));
    recordings.append(list);
    player.append(waveform, recordings);
    const fold = create("details", "edition-transcript", '<summary>当前段听写稿与朗读</summary>');
    const transcript = panel.querySelector("#tape-transcript");
    const aloud = panel.querySelector("#radio-read-aloud");
    transcript.before(fold);
    fold.append(transcript, aloud);
    panel.append(create("p", "edition-radio-note edition-copy",
      "波形下是这次重播的秒数。原带停机那段缺了多久，听写稿上没记。"));
  }

  function footsteps(root) {
    const controls = root.querySelector(".folio-attachment-controls");
    if (!controls) return;
    const visual = controls.querySelector("#foot-visual");
    visual.classList.add("edition-foot-sequence");
    visual.setAttribute("aria-label", "横向脚印记录");
    const track = create("div", "edition-foot-track",
      '<span>前段 0–3 秒</span><span>中段 3–6 秒</span><span>末段 6–9 秒</span>');
    track.setAttribute("aria-hidden", "true");
    visual.before(track);
    const meter = create("progress", "edition-foot-progress");
    meter.id = "edition-foot-progress";
    meter.max = 9100;
    meter.value = 0;
    meter.setAttribute("aria-label", "脚步音轨播放位置");
    visual.before(meter);
    controls.append(box("播放位置", textTable("声音分段 / 不预填步数", ["段", "记录"], [
      ["前段", "门外出现第一组脚步，听完再填。"],
      ["中段", "声音有停顿，折返仍按每次落地记。"],
      ["末段", "最后一次脚步过后，才开放核对。"]
    ]) + '<p>进度条走到的是播放位置。每次脚落地算一步；静音时可开同步脚印。封袋拆开后，纸件会放回教室那页。</p>'));
  }

  function archiveRoom(root) {
    const workspace = root.querySelector(".archive-workspace");
    if (!workspace) return;
    const roomView = root.querySelector("#archive-room-view");
    const title = workspace.querySelector(".archive-heading h2");
    if (title) {
      const heading = create("h1", "edition-archive-title", "教室里的纸");
      workspace.before(heading);
      title.remove();
    }
    if (!roomView) return;
    const cabinet = create("section","stage-cabinet",'<h3>档案柜</h3>');
    const drawers = [];
    for (let index = 0; index < 4; index++) {
      const drawer = create("details","stage-drawer",'<summary>第 ' + (index + 1) + ' 格</summary>');
      drawers.push(drawer);
      cabinet.append(drawer);
    }
    function draw() {
      drawers.forEach((drawer,index) => {
        drawer.querySelector("ul")?.remove();
        const files = H4.data.ARCHIVE_FILES.slice(index*3,index*3+3);
        const entries = create("ul","stage-drawer-files");
        files.forEach(file => {
          const locked = file.locked && !H4.hasClue(file.locked);
          const label = file.title + (locked ? "（还没打开）" : H4.state.read.includes(file.id) ? "（已读）" : "");
          const row = create("li","");
          row.append(H4.Stage.button(label, () => {
            const reader = H4.G.archive;
            reader.sitDown();
            reader.selected = file.id;
            reader.tab = "read";
            reader.paint();
            H4.$("#paper-reader").focus({preventScroll:true});
          }));
          entries.append(row);
        });
        drawer.append(entries);
      });
    }
    draw();
    const count = workspace.querySelector("#archive-count");
    const observer = new MutationObserver(draw);
    observer.observe(count,{childList:true,characterData:true,subtree:true});
    H4.onLeave(() => observer.disconnect());
    workspace.querySelector("#archive-body").before(cabinet);
  }

  function ending(root) {
    const page = root.querySelector(".page");
    const actions = page?.querySelector("#end-actions");
    if (!actions) return;
    page.classList.add("edition-ending");
    const name = H4.Endings.names[page.dataset.endingId];
    if (name && !page.querySelector("h1")) page.prepend(create("h1", "edition-ending-title", esc(name)));
    actions.after(create("footer", "edition-ending-credit", "<p>本次浏览 · abc studio</p>"));
  }

  const archivePages = {radio, footsteps, archive: archiveRoom, ending};

  function originalDates(site) {
    site.querySelectorAll(".s03-list li > span, .s03-photo-news time, .edition-links time").forEach(node => {
      const raw = node.textContent.trim();
      const formatted = isoDate(raw, "2003");
      if (formatted !== raw) node.textContent = formatted;
      if (/^\d{4}-\d{2}-\d{2}$/.test(formatted)) node.classList.add("edition-date");
    });
  }

  function original(root, section, params) {
    const site = root.querySelector(".site03");
    const content = root.querySelector(".s03-content");
    if (!site || !content) return;
    site.dataset.editionSection = section;
    const source = H4.Site03;
    if (section === "home") {
      originalDates(site);
      return;
    }
    if (section === "building") {
      const strip = preview(photoEntries.slice(0,3));
      content.querySelector("h2").after(strip);
    }
    if (section === "services" && !params.get("id")) {
      const list = content.querySelector(".s03-docs");
      const docs = [source.duty, source.roster, ...source.docs];
      const topics = ["当日轮值","学生名册","教务处","图书室","收费窗口"];
      const rows = docs.map((doc,index) => [link(source.url("services","id=" + doc.id),doc.title),topics[index]]);
      list.replaceWith(create("div","edition-service-index",table("常用资料",["资料","查阅处"],rows)));
    }
    if (section === "missing" || (section === "article" && !content.querySelector(".s03-article"))) {
      const kind = params.get("kind") === "news" ? "news" : "notices";
      const rows = source[kind].slice(0,6).map(([id,date,title]) => [
        dateLabel(date,"2003"),link(source.url("article","kind=" + kind + "&id=" + id),title)
      ]);
      content.append(create("section","edition-original-recovery",table("近期栏目内容",["日期","标题"],rows) +
        '<p>' + link(source.url(kind),"查看完整列表") + '</p>'));
    }
    if (section === "mailbox" || section === "links" || (section === "search" && !params.get("q")?.trim())) {
      content.append(create("section","edition-original-recovery",'<h3>也可以去看看</h3>' +
        links([["#/school?section=notices","办事通知"],["#/school?section=board","家校留言"],["#/school?section=services","常用资料"]])));
    }
    originalDates(site);
  }

  function noteUrl(route) {
    return "#/scene-notes?from=" + route;
  }

  function observation(label, text, route, x, y, kind = "quiet") {
    const spot = H4.Stage.button(label, () => {
      const line = typeof text === "function" ? text() : text;
      const buttons = ["corridor","stairs","rooftop","basement"].includes(route)
        ? [{label:"读现场附记", onClick:() => { H4.Stage.rememberOrigin(spot); H4.go(noteUrl(route)); }}, {label:"合上"}]
        : [{label:"合上"}];
      H4.modal({title:label, bodyHTML:"<p>" + esc(line) + "</p>", buttons});
    });
    H4.Stage.hotspot(spot, x, y, label, kind);
    return spot;
  }

  function marked(page, id, x, y, label, kind) {
    const spot = page.querySelector(id);
    H4.Stage.hotspot(spot, x, y, label, kind);
    return spot;
  }

  const core = {
    corridor(root, page) {
      const window = marked(page, "#window-memory", 77, 41, "窗沿");
      const door = marked(page, "#back-door-hotspot", 38, 44, "封条后的门", "edge");
      const lamp = observation("顶灯", "靠近的那根灯管只亮着半截，另一头映在玻璃里。", "corridor", 52, 19);
      const floor = observation("纸屑", "纸被鞋底踩湿了，字已经看不出来。", "corridor", 64, 80, "point");
      const warning = page.querySelector("#corr-warning");
      const controls = page.querySelector(".touch-controls");
      const stage = H4.Stage.compose(root,page,{
        route:"corridor", title:"四楼走廊", notes:true, weather:true, art:page.querySelector(".bg-img"),
        feedback:[page.querySelector("#corr-location"), warning, page.querySelector("#dash-status"), page.querySelector(".corr-pace")],
        spots:[window,door,lamp,floor],
        actions:[controls], events:[page.querySelector("#corr-door")]
      });
      const help = create("p","stage-idle","方向键或下方按钮可前进、回望。");
      help.hidden = !!H4.G.corridor.introSeen;
      H4.G.corridor.introSeen = true;
      stage.world.querySelector(".stage-feedback").append(help);
      const markUsed = () => { help.hidden = true; };
      stage.world.addEventListener("pointerdown",markUsed);
      const handleKey = event => {
        if (["ArrowRight","ArrowLeft","Shift","Enter"," "].includes(event.key)) markUsed();
      };
      windowEvent(handleKey);
      H4.app.later(3000, markUsed);
    },
    stairs(root, page) {
      const left = marked(page,"#door-left",32,52,"看左边门牌","edge");
      const right = marked(page,"#door-right",69,52,"看右边门牌","edge");
      const sheet = marked(page,"#route-note",81,31,"检修路线");
      const rail = marked(page,"#handrail-inspect",48,72,"扶手下面","edge");
      const lamp = observation("梯间的灯","灯光只照到门的上半截。扶手影子压在台阶上。","stairs",53,18);
      const options = page.querySelector(".stairs-tools");
      const reset = page.querySelector("#floor-reset");
      const setting = options.querySelector("#stair-description");
      setting.remove();
      const routeList = page.querySelector("#stairs-known");
      const label = page.querySelector("#floor-label");
      const feedback = page.querySelector("#stairs-feedback");
      options.append(reset);
      H4.Stage.compose(root,page,{
        route:"stairs",title:"楼梯间",notes:true,exit:"#/corridor",art:page.querySelector(".bg-img"),
        spots:[left,right,sheet,rail,lamp],feedback:[label,feedback],events:[page.querySelector("#stair-dark")],
        actions:[options,routeList],setting
      });
    },
    rooftop(root, page) {
      const paper = marked(page,"#roof-diary",70,78,"门边压着的纸页");
      const puddle = observation("门边积水","风一吹，砖缝里那一点灯光就散开了。","rooftop",54,79);
      const rail = observation("围栏边","栏杆摸着全是水，对面楼还有一扇窗亮着。","rooftop",30,40,"edge");
      const window = observation("对楼的灯","隔得远，只能看见一格亮窗。","rooftop",80,32);
      const portrait = page.querySelector(".rooftop-side");
      const text = page.querySelector(".roof-words");
      const actions = page.querySelector(".rooftop-btns");
      H4.Stage.compose(root,page,{
        route:"rooftop",title:"天台",notes:true,weather:true,exit:"#/stairs",
        art:page.querySelector(".bg-img"),spots:[paper,puddle,rail,window],
        entities:[portrait],feedback:[text],actions:[actions]
      });
    },
    basement(root, page) {
      const desk = page.querySelector(".application-desk");
      const open = H4.Stage.button("翻看纸片", () => stage.openPanel("门边的纸片",open));
      const paper = H4.Stage.button("地上的纸片", () => stage.openPanel("门边的纸片",paper));
      H4.Stage.hotspot(paper,59,78,"地上的纸片");
      const lamp = observation("门廊顶灯","灯泡蒙了灰，只照得到纸片边上。","basement",52,19);
      const door = observation("尽头的门","从楼梯带下来的光到这道门前就没了。","basement",47,46,"edge");
      const wall = observation("墙脚","墙脚颜色深，地面上反着一点蓝光。","basement",27,58);
      desk.hidden = false;
      const stage = H4.Stage.compose(root,page,{
        route:"basement",title:"地下室",notes:true,exit:"#/stairs",art:page.querySelector(".bg-img"),
        spots:[paper,lamp,door,wall],actions:[open],content:desk,panelSize:"long",
        feedback:[create("p","stage-line","灯泡在门廊里嗡嗡响，地上几张纸还没湿透。")],
        intro:"门边这几片纸，能拼回那张没交上去的换班申请。"
      });
    }
  };

  function windowEvent(handler) {
    globalThis.addEventListener("keydown",handler);
    H4.onLeave(() => globalThis.removeEventListener("keydown",handler));
  }

  function closedRoof(root, waiting) {
    const page = create("div","closed-roof-page");
    const image = waiting.querySelector("img");
    image.setAttribute("width","1448");
    image.setAttribute("height","1086");
    const caption = waiting.querySelector(".waiting-caption");
    const spots = [
      observation("锁扣","锁扣还挂在门上，雨声从门那头传过来。","rooftop",66,51,"point"),
      observation("门框","门框上剥掉一层漆，露出旧底色。","rooftop",31,32,"edge"),
      observation("门槛边","水从门缝底下渗进来，往下两级台阶就是干的。","rooftop",50,93,"edge")
    ];
    const exits = caption.querySelector(".page-links");
    const stairs = exits.querySelector('a[href="#/stairs"]');
    if (stairs) stairs.textContent = "下楼";
    else exits.prepend(H4.Stage.button("下楼", () => H4.go("#/stairs")));
    H4.Stage.compose(root,page,{
      route:"rooftop",mode:"paper",title:"天台门边",notes:true,weather:true,exit:"#/stairs",
      art:image,spots,actions:[exits],
      feedback:[create("p","stage-line","铁门锁着。检修单和借还记录还在楼下。")]
    });
  }

  const roomObjects = {
    duty: ["值班室","桌上的借还单","借还单",61,61],
    warehouse: ["后勤仓库","工具箱下的交班单","交班单",62,67],
    storage: ["储物间","旧本子里的回执","回执",39,53]
  };

  function roomScene(root, route) {
    const page = root.querySelector(".room-" + route);
    const [title,label,sign,x,y] = roomObjects[route];
    const paper = create("span","stage-paper-mark",esc(sign));
    paper.style.setProperty("--spot-x",String(x / 100));
    paper.style.setProperty("--spot-y",String(y / 100));
    paper.setAttribute("aria-hidden","true");
    const inspect = H4.Stage.button(label, () => stage.openPanel(label,inspect));
    const spot = H4.Stage.button(label, () => stage.openPanel(label,spot));
    H4.Stage.hotspot(spot,x,y,label);
    const details = {
      duty:["台灯","灯照在桌角，借还单就在光下。",22,40],
      warehouse:["货架","货架上还放着没领走的零件。",26,46],
      storage:["架上的旧物","架子里的东西已经很久没人动过了。",70,45]
    };
    const [object,line,ox,oy] = details[route];
    const look = observation(object,line,route,ox,oy,"edge");
    const stage = H4.Stage.compose(root,page,{
      route,title,exit:"#/corridor",art:page.querySelector(".room-object img"),
      spots:[spot,look],entities:[paper],actions:[inspect],content:page.querySelector(".room-paper"),
      feedback:route === "warehouse" ? [create("p","stage-line","灯下那只工具箱开着，货架最里面看不清。")] : [],
      panelSize:route === "storage" ? "short" : "medium"
    });
  }

  function toolScene(root, route) {
    const configs = {
      archive: {page:".archive-page", art:"#archive-room-photo", content:".archive-workspace",
        title:"教室里的纸", label:"翻开档案柜", exit:"#/corridor", x:44, y:73},
      radio: {page:".radio-page", art:".bg-img", content:".radio-panel",
        title:"广播室", label:"调收音机", exit:"#/stairs", x:55, y:64},
      footsteps: {page:".footsteps-page", art:".attachment-object img", content:".folio-attachment-controls",
        title:"04号声音附件", label:"听门外的脚步", exit:"#/archive", x:51, y:49}
    };
    const spec = configs[route];
    const page = root.querySelector(spec.page);
    const art = page.querySelector(spec.art);
    const native = page.querySelector(spec.content);
    if (route === "archive") {
      // The room image remains live as the old reader switches between the empty room and its chair.
      native.append(page.querySelector("#archive-room-view"));
    }
    if (route === "radio") native.querySelector(".folio-radio-object")?.remove();
    const inspect = source => {
      const reader = H4.G.archive;
      if (route === "archive" && reader.looking) reader.sitDown();
      stage.openPanel(spec.label,source);
    };
    const action = H4.Stage.button(spec.label, () => inspect(action));
    const spot = H4.Stage.button(spec.label, () => inspect(spot));
    H4.Stage.hotspot(spot,spec.x,spec.y,spec.label);
    const extraLabel = {archive:"桌上的原件",radio:"录音节目单",footsteps:"录音进度"}[route];
    const extra = H4.Stage.button(extraLabel, () => {
      inspect(extra);
      if (route === "radio") native.querySelector(".stage-radio-recordings").open = true;
      if (route === "archive") native.querySelector("#tab-read").click();
    });
    H4.Stage.hotspot(extra,75,route === "footsteps" ? 57 : 49,extraLabel,"edge");
    const stage = H4.Stage.compose(root,page,{
      route,title:spec.title,exit:spec.exit,art,spots:[spot,extra],actions:[action],content:native,
      feedback:route === "archive" ? [create("p","stage-line","黑板没擦干净，靠窗的桌上还摞着几张纸。")] : [],
      mode:route === "footsteps" ? "monitor" : "lightbox",panelSize:route === "footsteps" ? "medium" : "long"
    });
    if (route === "archive") {
      native.querySelector("#archive-lookup").addEventListener("click", () => stage.hidePanel());
    }
    if (route === "footsteps") stage.openPanel(spec.label,action);
  }

  function sceneNotes(root, params) {
    const route = params.get("from");
    const notes = H4.EditionNotes;
    const record = notes && Object.hasOwn(notes,route) ? notes[route] : null;
    if (!record) {
      root.innerHTML = '<article class="field-notes"><h1>现场附记</h1><p>这里没有对应的照片。<a href="#/home">回首页</a></p></article>';
      return;
    }
    const titles = {corridor:"四楼走廊",stairs:"楼梯间",rooftop:"天台门边",basement:"地下室"};
    const locked = route === "rooftop" && !H4.hasClue("clue_rooftop_key");
    const photos = {
      corridor:["corridor_1.webp","第一扇窗和四楼过道"],
      stairs:["stairs_4.webp","原图里的梯间"],
      rooftop:locked?["locked_roof.webp","门外所见"]:["rooftop.webp","天台砖面的积水"],
      basement:["basement.webp","楼梯下面的门廊"]
    };
    const [image,caption] = photos[route];
    const content = (locked ? "<p>这一张只拍到门和台阶。锁扣还挂在原处。</p>" : prose(record.paragraphs.slice(0,1))) +
      photo(image,caption,caption,true) + (locked ? "" : prose(record.paragraphs.slice(1)));
    root.innerHTML = '<article class="field-notes"><p class="field-notes-mast">陈楼 · 旧教学楼照片附记</p><h1>' +
      titles[route] + '</h1>' + content + '<nav aria-label="相关材料">' + links(record.links) +
      '<p class="field-notes-back">' + link("#/" + route,"回到现场") + '</p></nav></article>';
    const back = root.querySelector(".field-notes-back a");
    back.onclick = event => {
      if (H4.app.history[H4.app.history.length-1] !== "#/" + route) return;
      event.preventDefault();
      H4.$("#menu-back").click();
    };
  }

  H4.Edition2003 = {
    archive(root, route, params) {
      if (H4.Shells.type(route) !== "stage") root.classList.add("edition-v12","edition-v13");
      if (Object.hasOwn(archivePages, route)) archivePages[route](root, params);
      if (Object.hasOwn(core,route)) {
        const page = root.querySelector("." + route + "-page");
        if (page) core[route](root,page);
        else if (route === "rooftop") {
          const waiting = root.querySelector(".waiting-roof");
          if (waiting) closedRoof(root,waiting);
        }
      } else if (Object.hasOwn(roomObjects,route)) {
        roomScene(root,route);
      } else if (["archive","radio","footsteps"].includes(route)) {
        toolScene(root,route);
      }
    },
    original,
    sceneNotes
  };
})();
