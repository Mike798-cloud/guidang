(() => {
  "use strict";
  const e = H4.esc;
  const schoolRoot = "http://www.huailing-middle.edu.cn/space/old4/";
  const t = key => {
    try { return localStorage.getItem(key); } catch (_) { return null; }
  };
  const a = (key, value) => {
    try { localStorage.setItem(key, value); }
    catch (_) { H4.notice("本机无法保存设置，本次浏览仍可使用。"); }
  };
  const link = (href, text) => '<a href="' + e(href) + '">' + e(text) + '</a>';
  const text = body => body.split("\n\n").map(p => "<p>" + e(p) + "</p>").join("");
  const notes = [
    ["disk", "这些网页是怎么留下的", "这些网页是去年秋天留下的。后来找到几页，我放在后头，写了收到的日子，原来的字没改。\n\n校里的信箱已经不收信了。想找借书和作息，去校园网的常用资料那页。"],
    ["names", "文件名照旧", "有的照片写着名字，有的只写了号码。我照原来的叫法放。同名的翻开比过，内容一样的只留一张。"],
    ["photo", "相片的边", "几张相片在相册里压久了，边上发白。我没裁掉。背面有字的另拍一张，别把那行铅笔字印在人脸上。"],
    ["link", "打不开的网址", "有几个网址还能从旧网页里抄下来，点进去却没了。地址我留着，免得以后再看到，还以为少抄了一个字。"],
    ["clock", "日子照纸上写的", "往光盘里拷一遍，电脑就把几个文件都记成同一天了。纸上有日期的照纸抄；没有日期的，我只写哪天拿到。"],
    ["print", "打印时记得看右边", "我用教室的打印机试过，借还表最后一格容易切掉。印那张表的时候把纸横过来。"],
    ["audio", "带盒上的字", "带盒磨掉了一块。我听了两遍还是没认出是谁在说话，先空着。录音里那点杂音也还在。"],
    ["width", "字太小的时候", "有些旧页在学校的电脑上正好能看，回家就得拉滚动条。字太小可以去设置里调。图片上的字看不清，旁边有照着抄的一份。"],
    ["album", "相册第三袋", "春游照片那袋脱胶了，换了一只纸袋，旧封面还夹在里头。合照背面只写着‘操场’，我也记不准是哪一年。"],
    ["borrow", "借来的扫描仪", "扫描仪下周得还。玻璃上有一道划痕，竖着扫时正好穿过正文。今天把纸转过来重扫了一张，原纸上没有那一笔。"],
    ["address", "旧地址簿", "以前抄的网址打不开了，地址簿还夹在光盘袋里。同一个地址现在有人在用，也不是以前那个网页了。"],
    ["envelope", "信和信封", "信和信封放在一起。邮戳能看清就抄下来，糊了就只记月份。写给家里看的那几句话，我没有搬到首页。"],
    ["book", "一本没有书皮的练习册", "第一页写着一串答案，最后一页画了两只鞋。封面没找到，还没问出是谁的。"],
    ["copy", "给以后拷走这些网页的人", "拷图片的时候，把图片底下那几行字也带走。哪一页没有找到就空着，以后要是找到了，再把它放回去。"],
    ["reply", "留言还看得见", "以前写的留言都还在，这里已经不能再发了。后来有人回信，我把它放到来信那一页，没改旧帖的日期。"],
    ["lights", "底片袋上写着阴天", "底片袋上写着‘阴天，没开闪光’。洗出来的几张都暗，倒是靠窗的桌面白了一块。等另外那卷洗出来再挑。"]
  ].map(([id,title,body]) => ({id,title,body,date:"2004-01-06"}));

  function paginate(items, size, params) {
    const pages = Math.max(1, Math.ceil(items.length / size));
    const value = Number(params.get("page"));
    const page = Number.isSafeInteger(value) ? Math.min(pages, Math.max(1, value)) : 1;
    return {items:items.slice((page - 1) * size, page * size), page, pages};
  }
  function pager({page, pages}, href) {
    if (pages === 1) return "";
    return '<nav class="plain-pager" aria-label="翻页">' +
      (page > 1 ? link(href(page - 1), "上一页") : "<span>上一页</span>") +
      '<span>第 ' + page + ' / ' + pages + ' 页</span>' +
      (page < pages ? link(href(page + 1), "下一页") : "<span>下一页</span>") + "</nav>";
  }
  function listTable(rows) {
    return '<table class="campus-list"><thead><tr><th scope="col">日期</th><th scope="col">内容</th></tr></thead><tbody>' +
      rows.map(([date, href, label]) => '<tr><td>' + e(date) + '</td><td>' + link(href,label) + '</td></tr>').join("") +
      '</tbody></table>';
  }
  const n = H4.Portal = {
    schoolRoot,
    paths: {
      "scene-notes":"views/notes.htm",
      directory:"photos/list.htm", item:"notes/read.htm", versions:"notes/dates.htm",
      search:"search/all.htm", updates:"letters/list.htm", about:"notes/about.htm",
      corridor:"building/corridor.htm", stairs:"building/stairs.htm", basement:"building/b1.htm",
      rooftop:"building/roof.htm", archive:"classroom/papers.htm", duty:"building/duty.htm",
      warehouse:"building/store.htm", storage:"building/extra.htm", radio:"radio/tape.htm",
      footsteps:"radio/04.htm", profile:"classroom/people.htm", mail:"letters/envelope.htm",
      personal:"users/feiyao-later.htm", after:"letters/reply.htm", record:"classroom/account.htm",
      ending:"visit/end.htm", thanks:"visit/thanks.htm", missing:"missing.htm"
    },
    labels: {
      "scene-notes":"现场附记",
      directory:"旧楼照片", item:"陈楼的手记", versions:"网站说明", snapshot:"校园网 2003",
      school:"槐岭中学校园网", search:"站内搜索", updates:"后来寄来的信", about:"关于本站",
      corridor:"四楼走廊", stairs:"楼梯间", basement:"地下室", rooftop:"天台门边",
      archive:"教室里的纸", duty:"值班室", warehouse:"后勤仓库", storage:"储物间",
      radio:"广播室那盘旧录音", footsteps:"门外的录音（04）", profile:"一起值日的同学后来怎么说",
      mail:"后来寄来的信", personal:"后来放回来的照片和作文", after:"后来收到的回信",
      record:"查证说明", ending:"本次浏览", thanks:"作者附页", missing:"页面没有找到"
    },
    notes,
    addr(route, params) {
      return schoolRoot + (n.paths[route] || n.paths.missing) + (params?.size ? "?" + params.toString() : "");
    },
    nav() {
      return '<nav class="campus-return" aria-label="页面导航">' + link("#/home","返回首页") +
        '<button type="button" data-return>返回上一页</button></nav>';
    },
    footer() {
      return '<footer class="campus-footer">' + link("#/about","关于本站") +
        '<span>槐岭中学校园网　2003</span></footer>';
    },
    header(title) {
      return '<header class="campus-heading"><h1>' + e(title || "槐岭中学校园网") + '</h1></header>';
    },
    shell(title, content) {
      return '<div class="portal-page campus-web">' + n.nav() + n.header(title) +
        '<div class="portal-content">' + content + '</div>' + n.footer() + '</div>';
    },
    wire(root) {
      root.querySelectorAll("[data-return]").forEach(button => {
        button.onclick = () => {
          if (H4.app.history.length) H4.$("#menu-back").click();
          else H4.go("#/home");
        };
      });
      const form = root.querySelector(".site-search");
      if (form) form.onsubmit = event => {
        event.preventDefault();
        const query = form.querySelector("input").value.trim();
        H4.go("#/search" + (query ? "?q=" + encodeURIComponent(query) : ""));
      };
    },
    directory(root, params) {
      const section = params.get("section");
      if (section === "notes") {
        const listing = paginate(notes, 8, params);
        root.innerHTML = n.shell("陈楼的手记", "<p>照片、录音和后来找到的几页纸，我另写了几行来历。</p>" +
          listTable(listing.items.map(note => [note.date, "#/item?id=" + note.id, note.title])) +
          pager(listing, page => "#/directory?section=notes&page=" + page));
      } else if (section === "daily") {
        root.innerHTML = n.shell("学校日常", "<p>作息、校服和借书的事，去学校各栏看。</p><ul>" +
          [["notices","办事通知"],["news","校园近况"],["board","家校留言"],["services","常用资料"]].map(([key,title]) =>
            '<li>' + link("#/school?section=" + key,title) + '</li>').join("") + "</ul>");
      } else {
        const photos = [
          ["2003年秋","#/school?section=building","旧教学楼，教室和过道"],
          ["2003年11月","#/corridor","四楼走廊"],
          ["2003年11月","#/album","林杳相册里的楼顶照片"],
          ["1999年春","#/album","外婆家的院子"]
        ];
        if (H4.hasClue("clue_storage")) photos.push(["日期未记","#/storage","贴着封条的那道门"]);
        root.innerHTML = n.shell("旧楼照片", "<p>旧教学楼这几张，按相册上的日期放。走廊的原图有好几张，可以接着看。</p>" +
          listTable(photos) + '<p class="campus-related">' + link("#/archive","教室里的纸") + '　' +
          link("#/directory?section=notes","陈楼的手记") + '　' + link("#/search","站内搜索") + '</p>');
      }
      n.wire(root);
    },
    item(root, params) {
      const index = notes.findIndex(note => note.id === params.get("id"));
      if (index < 0) return n.missing(root);
      const note = notes[index];
      root.innerHTML = n.shell("陈楼的手记", '<article class="maintenance-article"><h2>' + e(note.title) +
        '</h2><p class="campus-date">陈楼　' + note.date + '</p>' + text(note.body) +
        '<p class="campus-related">' +
        [notes[index - 1], notes[index + 1]].map((next, i) => next ?
          link("#/item?id=" + next.id,(i ? "下一篇：" : "上一篇：") + next.title) : "").filter(Boolean).join("　") +
        '　' + link("#/directory?section=notes","全部手记") + '</p></article>');
      n.wire(root);
    },
    index() {
      const read = H4.state.read;
      const entries = notes.map(note => ({title:note.title,text:note.body,sub:"陈楼　" + note.date,url:"#/item?id=" + note.id}));
      for (const file of H4.data.ARCHIVE_FILES) {
        const visible = read.includes(file.id) && (!file.locked || H4.hasClue(file.locked));
        entries.push({title:file.title,text:visible ? file.content : "",sub:file.sub,url:"#/archive?file=" + file.id});
      }
      for (const name of H4.data.NAMES) {
        const id = "p_" + name;
        entries.push({title:name + "说的话",text:read.includes(id) && H4.hasClue(H4.data.PROFILES[name].unlock) ?
          H4.source(id).content : "",sub:"一起值日的同学",url:"#/profile?n=" + encodeURIComponent(name)});
      }
      for (const id of read.filter(value => /^(i_|m[12]$|b1$|tape_note_)/.test(value))) {
        const source = H4.source(id);
        if (source) entries.push({title:source.title,text:source.content,sub:source.sub || "教室里的纸",source:id});
      }
      entries.push({title:"四楼走廊",text:"旧教学楼四楼 走廊 楼梯 照片",sub:"旧楼照片",url:"#/corridor"},
        {title:"楼梯间",text:"旧楼楼梯口 门牌 检修路线",sub:"旧楼照片",url:"#/stairs"},
        {title:"林杳的留言",text:H4.data.MESSAGES.join(" "),sub:"林杳同学",url:"#/messages?entry=old"});
      return entries;
    },
    search(root, params, unavailable = false) {
      const query = (params.get("q") || "").trim().slice(0,80);
      // Keep terms from the earlier pages searchable after updating the displayed copy.
      const key = query.toLowerCase()
        .replace(/旧四楼/g, "四楼")
        .replace(/旧梯口/g, "楼梯口")
        .replace(/旧梯间/g, "楼梯间");
      const found = key ? n.index().filter(row => (row.title + " " + row.text + " " + row.sub).toLowerCase().includes(key)) : [];
      const listing = paginate(found, 8, params);
      const results = listing.items.map(row => {
        const index = row.text.toLowerCase().indexOf(key);
        const excerpt = index < 0 ? "" : row.text.slice(Math.max(0,index - 22), index + 47);
        return '<li>' + (row.source ? '<button type="button" class="plain-link" data-search-source="' + e(row.source) +
          '">' + e(row.title) + '</button>' : link(row.url,row.title)) +
          '<span class="campus-date">　' + e(row.sub) + '</span>' + (excerpt ? '<p>' + e(excerpt) + '</p>' : "") + '</li>';
      }).join("");
      root.innerHTML = n.shell("站内搜索", '<form class="site-search" action="#/search"><label for="site-query">搜索本站</label> ' +
        '<input id="site-query" name="q" maxlength="80" placeholder="姓名、题名或记得的一句话"> <button type="submit">搜索</button></form>' +
        (unavailable ? "<p>学校栏目暂时读不到，以下是本站结果。</p>" : "") +
        '<div class="search-results">' + (key ? '<p>找到 ' + found.length + ' 条。</p>' +
          (results ? '<ol class="campus-results">' + results + '</ol>' : "<p>没找到。可以换个短些的词试试。</p>") +
          pager(listing, page => "#/search?q=" + encodeURIComponent(query) + "&page=" + page) :
          '<p>可以搜“借阅”或人名，也可以直接看' + link("#/school?section=notices","学校通知") + '。</p>') + '</div>');
      root.querySelector("#site-query").value = query;
      root.querySelectorAll("[data-search-source]").forEach(button => {
        button.onclick = () => H4.openSource(button.dataset.searchSource);
      });
      n.wire(root);
    },
    updates(root) {
      const visited = H4.state.endingsSeen.filter(id => ["e2","e3","e4","e5"].includes(id));
      const rows = visited.map(id => {
        const pack = H4.Aftermath.pack(id);
        return [pack.date.split(" / ")[0],"#/after?id=" + id,pack.title];
      });
      root.innerHTML = n.shell("后来寄来的信", "<p>照片放回去以后，又有几个人写了信。我照着信上写的日期排在这里。——陈楼</p>" +
        (rows.length ? listTable(rows) : "<p>暂时没有新来信。</p>") +
        (H4.state.cycle === 2 && H4.state.fragments.length === 7 ?
          '<p>' + link("#/mail","和照片一起寄来的两封信") + '</p>' : ""));
      n.wire(root);
    },
    about(root) {
      root.innerHTML = n.shell("关于本站", '<article class="maintenance-article"><p>这些网页是2003年秋天留下的。后来找到的几页，我加在后面，标了拿到的日子。原来的字没有改。</p>' +
        '<p>有几张纸能对得上，也有几个人说的不一样。那天夜里最后几分钟的事，这几张纸都没写清。有人后来改了说法，我把两次的话都放上来了。</p>' +
        '<p class="campus-date">陈楼　2004-01-06</p><p>' + link("#/directory?section=notes","我写的几条手记") + '　' +
        link("#/snapshot","校园网 2003") + '</p><p class="campus-date">虚构作品 · abc studio</p></article>');
      n.wire(root);
    },
    missing(root) {
      root.innerHTML = n.shell("页面没有找到", '<p>这个地址已经打不开了。可以从' +
        link("#/snapshot","校园网首页") + '重新找，也可以回' + link("#/home","林杳同学") + '。</p>');
      n.wire(root);
    },
    decorate(root, route, params) {
      H4.$("#address").value = n.addr(route, params);
      H4.$("#title-text").textContent = (n.labels[route] || n.labels.missing) + " — 槐岭中学校园网";
      root.dataset.route = route;
      root.tabIndex = -1;
      if (!root.querySelector(".portal-page")) root.insertAdjacentHTML("afterbegin", n.nav());
      if (route === "archive" && params.has("file")) {
        const file = H4.data.ARCHIVE_FILES.find(entry => entry.id === params.get("file"));
        if (file) {
          H4.G.archive.selected = file.id;
          H4.G.archive.read(file);
        }
      }
      n.wire(root);
      n.layout();
      H4.$("#route-announcement").textContent = n.labels[route] || n.labels.missing;
      if (!H4.$("#modal-root").children.length && !(route === "archive" && H4.G.archive.looking)) {
        root.focus({preventScroll:true});
      }
    },
    layout() {
      const saved = n.readingSize || Number(t("h4_reading_size"));
      const scale = [100,115,130].includes(saved) ? saved : 100;
      document.documentElement.style.setProperty("--reading", String(scale / 100));
      document.documentElement.style.setProperty("--original-reading", t("h4_original_scale") === "1" ? String(scale / 100) : "1");
      H4.$("#xp-sizer").style.cssText = "";
      H4.$("#xp-win").style.transform = "none";
    },
    routes:{}
  };
  for (const route of ["directory","item","search","updates","about"]) n.routes[route] = n[route];
  n.routes.versions = n.about;
var r={c1:{options:["共同说明中的离楼时间与巡逻记录相冲突","巡逻记录足以排除其余十人后来返回","记录确认三人22:40还在四楼，坠落时谁在场仍不清楚","共同说明整份作废，其中每件事都不再需要核对"],answers:[0,2]},c2:{options:["K4的借用人就是事故发生时的最后持有人","交班清点与张耀兰所称的归还时间冲突","L4已经归还，足以证明K4也在值班室","K4最终交给谁，仍缺直接交接记录"],answers:[1,3]},c3:{options:["现有材料排除了证明所称的正常转学","证明比那天的网页晚，仅凭这一点就能确认伪造人","槐川中学没接收过她，可以据此认定十三人共同伪造","这些材料仍不能确认是谁作出了转学处理"],answers:[0,3]},c4:{options:["于祯的说法足以确认张耀主是最后接触者","两份具名说法对张耀主是否进过天台直接冲突","谁在坠落前最后几分钟仍在场，尚不能确认","一人的否认有矛盾，可以直接认定另一人的全部回忆"],answers:[1,2]},c5:{options:["现场补记写了护栏缺口，与对外所说的“护栏完整”有出入","未找到翻越痕迹，足以排除一切意外可能","护栏有缺口，足以确认坠落发生在缺口处","实际坠落方式与最后接触者仍待核实"],answers:[0,3]}};H4.data.CONTRADICTION_PAIRS.forEach(function(e){e.scope=r[e.id]});var o=H4.app.settings;H4.app.settings=function(){o();var e=H4.$(".xp-modal-body"),r=document.createElement("p");r.innerHTML='<label for="reading-size">阅读字号</label> <select id="reading-size"><option value="100">标准</option><option value="115">加大 115%</option><option value="130">更大 130%</option></select>',e.appendChild(r);var i=document.createElement("p");i.className="reading-scope-note",i.innerHTML='字号会应用到本站页面和听写稿。原站默认用原来的字号。<br><label><input type="checkbox" id="original-reading-scale"> 原站也采用阅读字号</label>',e.appendChild(i);var s=i.querySelector("input");s.checked="1"===t("h4_original_scale"),s.onchange=function(){a("h4_original_scale",s.checked?"1":"0"),n.layout()};var l=r.querySelector("select");l.value=t("h4_reading_size")||"100",l.onchange=function(){n.readingSize=Number(l.value),a("h4_reading_size",l.value),n.layout()};};n.installArchiveHooks=function(){
  const archive=H4.G.archive;
  const read=archive.read;
  archive.read=function(file){
    read.call(this,file);
    const reader=H4.$("#paper-reader");
    if(!reader)return;
    if(!file.locked||H4.hasClue(file.locked)){
      const provenance=document.createElement("p");
      provenance.className="reader-provenance";
      provenance.textContent="教室里的纸 / 2004年1月6日放回 · 日期照纸上所写";
      reader.prepend(provenance);
    }
    reader.dataset.paper=file.id;
    const index=H4.data.ARCHIVE_FILES.findIndex(entry=>entry.id===file.id);
    const next=H4.data.ARCHIVE_FILES[index+1];
    const turn=document.createElement("button");
    turn.className="paper-turn";
    turn.type="button";
    turn.textContent=next?"翻到下一份 →":"已到末件 · 返回目录";
    turn.setAttribute("aria-label",next?"翻到下一份原件："+next.title:"返回原件目录");
    turn.onclick=()=>{
      if(!next){H4.$("#file-tree").querySelector("button").focus();return;}
      archive.selected=next.id;
      archive.read(next);
      reader.scrollTop=0;
      reader.focus({preventScroll:true});
    };
    reader.appendChild(turn);
    reader.setAttribute("tabindex","-1");
  };
},n.waiting=function(t,a,r,o){t.innerHTML=n.shell("这页还没写好",'<article class="waiting-record"><p class="eyebrow">照片和作文还在原来的页上。</p><h2>'+e(a)+"</h2><p>"+e(r)+'</p><div class="page-links">'+o.map(function(t){return'<a href="#/'+t[0]+'">'+e(t[1])+"</a>"}).join("")+"</div></article>"),n.wire(t)};var l=H4.Endings.choose;H4.Endings.choose=function(e){if("stay"===e&&(2!==H4.state.cycle||7!==H4.state.fragments.length||5!==H4.state.contradictions.length))return["a2","a6"].every(function(e){return H4.state.read.includes(e)})?void H4.Endings.start("e4"):void H4.modal({title:"先认识照片里的她",bodyHTML:"<p>图书室借阅单与《槐花》作业里，留着她自己想做的事。先去读读，再回来留下这句话。</p>",buttons:[{label:"回教室看材料",onClick:function(){H4.go("#/archive")}},{label:"暂时收好"}]});l.call(this,e)};var c=H4.Endings.library;H4.Endings.library=function(){c.call(this);var e=H4.$("#ending-records");e.className="ending-grid",e.querySelectorAll("button").forEach(function(e,t){e.disabled&&(e.textContent="？ / "+["结束这次浏览","留下可复核的原件","留下简要的公开说明","记住她的日常","把照片和来信放在一起"][t])})},window.addEventListener("DOMContentLoaded",function(){var a=document.createElement("span");a.id="route-announcement",a.className="sr-only",a.setAttribute("aria-live","polite"),document.body.appendChild(a);H4.$("#btn-max").textContent="字",H4.$("#btn-max").title="调整阅读字号",H4.$("#btn-max").setAttribute("aria-label","调整阅读字号"),H4.$("#btn-max").onclick=H4.app.settings;var o=document.createElement("button");o.id="menu-source",o.textContent="来源",o.onclick=function(){H4.go("#/versions")},H4.$("#menubar").insertBefore(o,H4.$("#menu-settings"));var i=document.createElement("button");i.textContent="源文件",i.id="menu-page-source",i.onclick=function(){H4.$("#screen").dataset.route;var t=H4.$("#screen").cloneNode(!0);t.querySelectorAll("input,textarea").forEach(function(e){e.removeAttribute("value"),e.textContent=""});var a="\x3c!-- 当前页的 HTML，仅供查看网页结构。 --\x3e\n\x3c!-- 来源日期请见各原件；本窗口不增加线索。 --\x3e\n"+t.innerHTML;H4.modal({title:"当前网页的源代码",bodyHTML:'<pre class="source-code">'+e(a)+"</pre>"})},H4.$("#menubar").insertBefore(i,H4.$("#menu-settings"))})})();
