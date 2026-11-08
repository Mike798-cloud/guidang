(() => {
  "use strict";
  const esc = H4.esc;
  const notes = H4.EditionNotes;
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
  function registerPanel(title, intro, caption, headers, rows, paragraphs) {
    return box(title, '<p class="edition-provenance">' + esc(intro) + '</p>' +
      textTable(caption, headers, rows) + '<div class="edition-copy">' + prose(paragraphs) + '</div>',
      'edition-ledger');
  }

  const photoEntries = [
    ['site03_classroom.jpg', '旧楼教室的桌椅与窗户', '原站附图 / 教室', '#/school?section=building'],
    ['corridor_1.jpg', '旧四楼第一段走廊', '照片附页 / 四楼走廊', '#/corridor'],
    ['courtyard_memory.webp', '外婆家的院子', '同学主页 / 院子', '#/messages'],
    ['attachment_envelope.webp', '编号04的声音附件封袋', '附件封套 / 04号', '#/footsteps']
  ];
  function preview(entries) {
    return create("div", "edition-preview", entries.map(([file, alt, caption, href]) =>
      href ? '<a href="' + href + '">' + photo(file, alt, caption) + '</a>' : photo(file, alt, caption)
    ).join(''));
  }

  const coverRoutes = new Set(["home", "versions", "updates", "record", "messages", "about", "personal"]);

  function masthead(root, route) {
    const mast = root.querySelector(".archive-mast");
    if (!mast) return;
    const mark = mast.querySelector(".mast-mark");
    mark.replaceChildren(create("span", "edition-cd-icon"));
    mark.firstElementChild.setAttribute("aria-hidden", "true");
    const branding = mast.querySelector(".mast-mark + div");
    branding.querySelector("p")?.remove();
    const tagline = branding.querySelector("span");
    if (tagline) tagline.replaceWith(create("p", "edition-page-lead", esc(tagline.textContent)));
    const nav = root.querySelector(".archive-nav");
    if (!nav) return;
    nav.querySelector(".home-mobile-search")?.remove();
    nav.append(create("a", "", "原站快照"), create("a", "", "纸面原件"), create("a", "", "站内检索"));
    const extra = [...nav.children].slice(-3);
    extra.forEach((node, i) => { node.href = ["#/snapshot", "#/archive", "#/search"][i]; });
    nav.querySelectorAll("a").forEach(anchor => {
      if (anchor.getAttribute("href") === "#/" + route) anchor.setAttribute("aria-current", "page");
      else anchor.removeAttribute("aria-current");
    });
    const cover = coverRoutes.has(route);
    root.classList.add(cover ? "edition-opening-cover" : "edition-opening-compact");
    if (!cover) return;
    const [file, alt, caption, position] = cuts[route] || [
      "site03_banner.jpg", "槐岭中学教学楼外景", "旧四楼归档站 / 原站保存照片", "50% 52%"
    ];
    const ratio = ["home", "versions"].includes(route) ? "page-banner" : "scene-banner";
    const banner = create("div", "edition-scene-cut edition-mast-banner " + ratio, photo(file, alt, caption));
    banner.style.setProperty("--edition-crop", position);
    mast.after(banner);
    if (route === "home") {
      const text = "旧站快照：2003-11-14 23:47。　纸件收存：2004-01-06。　后来的信按落款日期另记。";
      const bulletin = create("div", "edition-notice-ticker",
        '<b>站务公告</b><div class="edition-notice-track"><span>' + esc(text) + '</span></div>');
      const pause = sceneButton("暂停", () => {
        const paused = bulletin.classList.toggle("is-paused");
        pause.textContent = paused ? "继续" : "暂停";
        pause.setAttribute("aria-pressed", String(paused));
      });
      pause.setAttribute("aria-pressed", "false");
      bulletin.append(pause);
      banner.append(bulletin);
    }
  }

  function home(root) {
    const hero = root.querySelector(".archive-home-hero");
    if (!hero) return;
    const rail = root.querySelector(".folio-home-rail");
    const right = root.querySelector(".folio-home-right");
    rail.firstElementChild.append(create("p", "", "这份目录整理于2004年1月6日。找纸件、录音或后来寄来的信，可从各自的索引进去。"));
    const notes = root.querySelector(".maintenance-list");
    const recent = H4.Portal.notes.slice(0, 7).map(n => ['#/item?id=' + n.id, n.title, n.date]);
    notes.replaceChildren(create("h3", "", '整理手记 <a href="#/directory?section=notes">更多 &gt;&gt;</a>'),
      create("div", "", links(recent)));
    right.prepend(box("镜像位置", table("光盘目录摘记", ["位置", "留存"], [
      [link("#/snapshot", "原站封面"), dateLabel("2003-11-14")],
      [link("#/directory", "纸面补录"), dateLabel("2004-01-06")],
      [link("#/updates", "往来登记"), "另记"]
    ])));
    hero.querySelector(".index-photo")?.remove();
    const center = root.querySelector(".folio-home-center");
    const preview = root.querySelector(".archive-preview");
    if (center && preview) center.prepend(preview);
    const outer = root.querySelector(".folio-home");
    if (outer && center) outer.prepend(center);
    const gallery = create("section", "edition-home-gallery",
      '<h2 class="edition-bar">镜像照片目录</h2><div class="edition-contact-strip">' +
      [
        ["corridor_1.jpg", "四楼第一段走廊", "01 / 四楼走廊", "#/corridor"],
        ["site03_classroom.jpg", "原站留存的教室", "02 / 原站教室", "#/school?section=building"],
        ["courtyard_memory.webp", "飞杳外婆家的院子", "03 / 院子 · 1999年春", "#/messages"],
        ["attachment_envelope.webp", "封套编号04", "04 / 声音附件封套", "#/footsteps"],
        ["archive_desk.jpg", "桌面上分开的纸件", "05 / 纸面原件", "#/archive"],
        ["site03_banner.jpg", "槐岭中学旧教学楼", "06 / 校内主页空间", "#/snapshot"]
      ].map(([file, alt, label, href]) => '<a href="' + href + '">' + photo(file, alt, label, true) + '</a>').join("") +
      '</div>');
    outer?.after(gallery);
  }

  function directory(root) {
    const aside = root.querySelector(".folio-directory > aside");
    if (!aside) return;
    const notes = H4.Portal.notes;
    const register = create("div", "edition-panel-groups edition-directory-register");
    register.append(
      box("机读统计", table("目录可查范围", ["类别", "数量"], [
        ["纸面原件", String(H4.data.ARCHIVE_FILES.length)],
        ["关联人", String(H4.data.NAMES.length)],
        ["整理手记", String(notes.length)],
        ["原站日常", link("#/directory?section=daily", "另册列目")]
      ])),
      box("最近补录", links(notes.slice(-4).reverse().map(n => ["#/item?id=" + n.id, n.title, n.date])))
    );
    (aside.querySelector(".folio-progress") || aside).append(register);
    root.querySelector(".catalog-columns > section:first-child")?.classList.add("edition-entry-directory");
    const paper = root.querySelector(".catalog-columns > section:nth-child(2)");
    if (paper) {
      paper.classList.add("edition-paper-directory");
      paper.parentElement.prepend(paper);
      const head = paper.querySelector("thead tr");
      head.append(create("th", "", "备注"));
      head.lastElementChild.setAttribute("scope", "col");
      paper.querySelectorAll("tbody tr").forEach(row => {
        const opener = row.querySelector("[data-catalog-source]");
        const file = H4.source(opener.dataset.catalogSource);
        if (file) opener.setAttribute("aria-label", "查看纸面原件：" + file.title);
        const raw = row.cells[2].textContent.trim();
        const stamp = /^\d{4}-\d{2}-\d{2}/.exec(raw)?.[0];
        const note = stamp ? raw.slice(stamp.length).replace(/^\s*\/\s*/, "").trim() : "";
        if (stamp) {
          row.cells[2].innerHTML = dateLabel(stamp);
          row.cells[2].classList.add("edition-primary-date");
        }
        const access = file?.locked && !H4.hasClue(file.locked) ? "封存" : "原件留存";
        row.append(create("td", "", esc(note && note !== "（封存）" ? access + " · " + note : access)));
      });
    }
    root.querySelectorAll(".folio-directory .folio-table tr").forEach(row => {
      const date = [...row.cells].find(cell => /^\d{4}-\d{2}-\d{2}$/.test(cell.textContent.trim()));
      date?.classList.add("edition-date");
    });
    aside.querySelector(".folio-photo").after(preview([photoEntries[3]]));
  }

  const noteImages = {
    photo: photoEntries[2], album: photoEntries[2], envelope: photoEntries[3],
    audio: ['radio_room.jpg', '旧广播室', '录音材料对应场所', '#/radio'],
    lights: photoEntries[0], link: photoEntries[0]
  };
  function item(root, params) {
    const article = root.querySelector(".maintenance-article");
    const aside = root.querySelector(".folio-article-index");
    const note = H4.Portal.notes.find(n => n.id === params.get("id"));
    if (!article || !aside || !note) return;
    const attachment = noteImages[note.id] || photoEntries[0];
    const grid = create("div", "edition-grid edition-item");
    article.before(grid);
    const source = box("出处登记", table("整理手记的收存字段", ["字段", "原样登记"], [
      ["收存日期", esc(note.date)],
      ["材料性质", "副本整理手记"],
      ["目录位置", link("#/directory?section=notes", "整理手记 / 附录")],
      ["原站留存", link("#/snapshot", "原站网页另列")]
    ]) + table("流转记录", ["登记日期", "归入位置"], [
      [dateLabel("2003-11-14") + " 23:47", link("#/snapshot", "原站网页另册截存")],
      [dateLabel("2004-01-06"), link("#/directory?section=notes", "补录目录接收副本说明")],
      [dateLabel(note.date), "手记沿用本条的登记日期"],
      ["当前副本", "附图依原栏目查对，纸件仍回原件目录"]
    ]) + '<p>这则说明随补录目录收存。所附图片用于查找对应页面，事件经过仍以纸面原件和原站登记分别核对。</p>');
    const strip = box("同目录附图", "");
    strip.append(preview([attachment, attachment === photoEntries[3] ? photoEntries[0] : photoEntries[3]]));
    const quotation = article.querySelector(".document-text");
    if (quotation) {
      const excerpt = create("blockquote", "edition-note-excerpt");
      quotation.before(excerpt);
      excerpt.append(quotation);
    }
    const related = H4.Portal.notes.filter(n => n !== note).slice(0, 3);
    grid.append(article, source);
    article.append(box("同册手记", links(
      related.map(n => ["#/item?id=" + n.id, n.title, n.date])
    ), "edition-item-related"));
    source.append(strip, aside, create("div", "edition-copy", prose([
      ["这张纸的用途", "这则手记收在补录目录，讲的是副本怎样保存旧页。手记下面的附图只能帮助找回栏目，若要核对原话或日期，仍须回到图上标的原件与对应的原页。"],
      ["查阅顺序", "先从同册题名辨出是哪一批，再沿页尾链接返回。原站的文件名不统一改写，后补的纸件仍按自己的落款登记，不能用光盘拷贝日期取代原来的日期。"]
    ])));
  }

  function versions(root) {
    const comparison = root.querySelector(".version-comparison");
    const ledger = root.querySelector(".version-ledger");
    if (!comparison || !ledger) return;
    const [original, supplement] = comparison.children;
    const row = (label, selector) => [label, ...[original, supplement].map(a => a.querySelector(selector).innerHTML)];
    const matrix = box("两次收存对照", table("时间取自各自的收存记录", ["项目", "原站快照", "校友补录"], [
      ["收存时间", dateLabel("2003-11-14") + " 23:47", dateLabel("2004-01-06")],
      row("内容范围", "p:nth-of-type(2)"),
      row("编排差异", "p:nth-of-type(3)"),
      ["查阅", link("#/snapshot", "查看原站快照"), link("#/directory", "查看补录目录")]
    ]), "edition-version");
    const separator = create("tr", "edition-date-break", '<td colspan="3"></td>');
    separator.setAttribute("aria-hidden", "true");
    matrix.querySelector("tbody tr").after(separator);
    comparison.replaceWith(matrix);
    const appendix = create("div", "edition-grid edition-version-appendix");
    ledger.before(appendix);
    ledger.querySelector("table").classList.add("edition-table");
    appendix.append(ledger, box("收存次序", '<ol class="edition-timeline">' +
      '<li><time>2003-11-14</time>原网页快照</li><li><time>2004-01-06</time>纸面材料并目录</li>' +
      '<li><time>依实际落款</time>来件另册</li></ol>'));
  }

  function search(root) {
    const results = root.querySelector(".search-results");
    if (!results || results.closest(".edition-search")) return;
    const count = root.querySelector(".search-count");
    const intro = root.querySelector(".catalog-intro");
    const columns = create("div", "edition-grid edition-search");
    results.before(columns);
    const filters = box("分目录查找", links([
      ["#/school?section=search", "原站通知与留言"], ["#/directory?section=notes", "整理手记"],
      ["#/directory?section=daily", "原站日常索引"], ["#/archive", "补录纸面原件"],
      ["#/updates", "后来寄来的信"]
    ]) + '<p>查校内日常可去原站。纸件、证言与往来在归档目录里分开列目，可用同一个词分别检索。</p>');
    const main = box("本机索引结果", "");
    if (!results.querySelector("table")) {
      const term = new URLSearchParams(location.hash.split("?")[1] || "").get("q")?.trim();
      main.append(create("div", "edition-search-state", textTable("检索窗口状态", ["索引", "当前范围"], [
        ["关键词", term || "尚未输入"],
        ["命中", term ? "本次未在可读索引中匹配" : "输入题名、姓名或原话后显示"],
        ["目录", "原站日常、纸件题名和已展开的附页"]
      ])));
    }
    const resultTable = results.querySelector(".folio-search-table table");
    if (resultTable) {
      const query = new URLSearchParams(location.hash.split("?")[1] || "").get("q")?.trim().slice(0,80).toLowerCase() || "";
      const entries = H4.Portal.index().filter(entry =>
        (entry.title + " " + entry.text + " " + entry.sub).toLowerCase().includes(query));
      const header = resultTable.querySelector("thead tr");
      ["命中位置", "相关度"].forEach(label => {
        const cell = create("th", "", label);
        cell.setAttribute("scope", "col");
        header.append(cell);
      });
      resultTable.querySelectorAll("tbody tr").forEach((row, i) => {
        const entry = entries[i];
        if (!entry) return;
        const title = entry.title.toLowerCase().includes(query);
        const body = entry.text.toLowerCase().includes(query);
        const fields = [title && "题名", body && "可读正文", entry.sub.toLowerCase().includes(query) && "来源"].filter(Boolean);
        const rank = title ? "题名命中" : body ? "正文命中" : fields.length ? "来源命中" : "合并索引";
        row.append(create("td", "edition-match", esc(fields.join("、") || "跨字段")),
          create("td", "edition-match-rank", rank));
      });
    }
    if (intro) main.append(intro);
    if (count) main.append(count);
    main.append(results);
    const terms = create("section", "edition-search-terms",
      '<h3 class="edition-subhead">常用检索词</h3>' + links(["旧楼", "借阅", "作息", "校服", "收据", "值日"].map(
        term => ["#/search?q=" + encodeURIComponent(term), term]
      )));
    terms.append(create("div", "edition-copy", prose([
      ["可以查到的条目", "搜“借阅”会碰到图书室登记和通知，也可能搜到后来补入的借阅附页。先看题名下那行出处，原站日常和纸件原件在结果里分别标明。"],
      ["只有题名的条目", "档案目录有时只给题名，原文仍在封套或尚未展开的证言页。查不到某句时，可以回原件目录逐件查看；索引只收录本机已经能展开的正文。"],
      ["无对应结果时", "原站页面保留了当年的词和编号。有些人名在原文里只写了称呼，试一下对应栏目或文件名，再根据原页的来源缩小范围。"]
    ])));
    filters.append(terms);
    columns.append(main, filters);
  }

  function updates(root) {
    const note = root.querySelector(".incoming-register-note");
    if (!note) return;
    const register = root.querySelector(".incoming-register");
    const dateRows = [...register.querySelectorAll("tbody tr:not(.incoming-blank)")];
    const months = new Set();
    dateRows.forEach(row => {
      const date = row.querySelector(".incoming-date");
      if (!date) return;
      const raw = date.getAttribute("aria-label") || date.textContent.trim();
      const iso = isoDate(raw).replace(/(\d{4}-\d{2}-)(\d{2})[—至](\d{1,2})日?/,
        (_, stem, first, last) => stem + first + " 至 " + stem + last.padStart(2, "0"));
      date.textContent = iso;
      date.classList.add("edition-date");
      const month = iso.match(/\d{4}-\d{2}/)?.[0] || "来件按原落款";
      if (!months.has(month)) {
        months.add(month);
        const band = create("tr", "edition-date-band", '<th colspan="' + row.cells.length +
          '" scope="row">' + esc(month) + '　实收往来</th>');
        row.before(band);
      }
      const saved = row.cells[row.cells.length - 1];
      if (saved && /待|新|未/.test(saved.textContent)) {
        saved.append(create("span", "edition-badge edition-new", "new"));
      }
    });
    register.append(create("div", "edition-copy", prose([
      ["一组来件为何合记", "同一次浏览留下的查证副本和短通告有各自的收件位置。收件人先看写来的信，再依落款列组。信里提到的一张旧纸仍归旧纸原册，回信只附在这次往来之后。"],
      ["空栏如何处理", "往来夹按实际收到的材料登记，没有寄出的回复不预填。原件目录所记的是文件自身日期；本页所记的是来件落款，二者可以互查，各自保存。"]
    ])));
    note.append(box("往来簿互见", links([
      ["#/versions", "两次收存日期"], ["#/directory", "纸面材料总目"],
      ["#/directory?section=notes", "整理手记登记"], ["#/mail", "补录信封"],
      ["#/record", "公开查证副本"], ["#/personal", "照片与作文留存"],
      ["#/snapshot", "原站只读快照"], ["#/about", "往来收存范围"]
    ]) + '<p>右列是可互相查阅的目录。左栏只登记实际收到的来件，尚未收到的回复留空。</p>'));
  }

  function about(root) {
    const article = root.querySelector(".maintenance-article");
    const qa = article?.querySelector(".folio-about-qa");
    if (!qa) return;
    const rows = [...qa.querySelectorAll("tbody tr")];
    const headings = ["01 / 缘起", "02 / 范围", "03 / 原则"];
    const sections = rows.reduce((groups, row, i) => {
      const index = i < 2 ? 1 : i < 4 ? 2 : 0;
      groups[index] += '<h3 class="edition-subhead">' + row.cells[0].innerHTML +
        '</h3><p>' + row.cells[1].innerHTML + '</p>';
      return groups;
    }, ["", "", ""]);
    qa.replaceWith(create("div", "edition-panel-groups", sections.map((content, i) =>
      '<section><h3 class="edition-subhead">' + esc(headings[i]) +
      '</h3><div class="edition-copy">' + content + '</div></section>').join("")));
  }

  function profile(root, params) {
    const layout = root.querySelector(".folio-profile");
    if (!layout) {
      const waiting = reframeWaiting(root, "profile", "姓名索引 / 待选择", "edition-duty-index");
      if (waiting) {
        waiting.next.append(registerPanel("十三人 / 关联登记", "姓名照共同说明列序，原证言分别登记。选择一份材料后，会显示它的直接出处。",
          "目录索引 / 选择姓名后查看原页", ["序", "关联人", "收存栏"],
          H4.data.NAMES.map((name, i) => [String(i + 1).padStart(2, "0"), name,
            H4.hasClue(H4.data.PROFILES[name].unlock) ? "可展开" : "原件待核"]), [
            ["原证言与补问", "同一位当事人的原证言和补问可能写在两份纸上。先读原证言，逐份记清出处；后来补过的说明仍保留它单独的落款。"],
            ["名字与责任", "签名栏可以核对纸是谁签的，名册可以核对写法。某人何时到了哪一处，要等有与地点、时刻直接相关的原话再放进复核页。"]
          ]));
      }
      return;
    }
    const name = params.get("n");
    const record = H4.data.PROFILES[name];
    const register = layout.querySelector(".folio-profile-register");
    const right = layout.querySelector(".folio-profile-links");
    const testimony = layout.querySelector(".testimony");
    const source = H4.app.profileGuide(name);
    const visible = H4.hasClue(record.unlock);
    layout.classList.add("edition-grid");
    layout.prepend(testimony);
    register.append(right);
    const body = register.querySelector("tbody");
    body?.insertAdjacentHTML("beforeend", '<tr><td>存放方式</td><td>原证言与补问分列</td></tr>');
    register.insertBefore(box("出处定位", '<p>' + esc(source.text) + ' 先核对原件的题名与记录位置；后续补问仍从本页查阅。</p>' +
      links([["#/" + source.route, source.label], ["#/directory", "查看题名与收存日期"]]) +
      '<p>' + (visible ? '左栏为已经展开的原证言。' : '目前只能查看出处。找到对应的原件后，就能读到证言。') + '</p>'), right);
    const [first, second, context] = notes.profileRefs[name];
    const sources = [first, second].map(id => {
      const file = H4.source(id);
      return ["#/archive?file=" + id, file.title, file.sub.slice(0, 10)];
    });
    const used = H4.data.CONTRADICTION_PAIRS.filter(proof =>
      proof.pair.includes("p_" + name) && H4.state.contradictions.includes(proof.id)
    );
    const opening = visible ? record.body.split("\n").find(line => line.trim()) : "";
    const excerpt = opening?.match(/^.*?[。！？][”’」』]?/u)?.[0] || opening;
    const related = H4.data.NAMES.filter(other => other !== name &&
      notes.profileRefs[other].slice(0, 2).some(id => id === first || id === second)).slice(0, 2);
    testimony.append(create("aside", "edition-profile-notes edition-panel-groups",
      '<section><h3 class="edition-subhead">关联名单 / 同批参阅</h3>' +
      '<p>先核对同一批收存纸件中的署名。下列姓名仍各有自己的证言与落款。</p>' +
      links(related.map(other => ["#/profile?n=" + encodeURIComponent(other), other])) +
      '</section><section><h3 class="edition-subhead">引述摘录</h3>' +
      (excerpt ? '<blockquote class="edition-note-excerpt">' + esc(excerpt) +
        '<cite>原证言首段 / 与上方原页同源</cite></blockquote>' :
        '<p>证言尚待直接出处。本栏预留原话及出处，题名和收存位置可先查阅。</p>' + links(sources)) +
      '</section>'));
    const audit = box("证言附录 / 本机核对", '<div class="edition-copy">' +
      prose([
        ["同批材料", context],
        ["处理经过", "原证言从关联处展开，补问另行登记。浏览时，先抄下这段话由谁说、在什么位置收存，再去找同批纸件；纸上写的是何时落款，跟这句话什么时候被抄进副本，是两回事。"],
        ["未采信的说法", used.length ?
          used.map(proof => proof.explain).join("") :
          "这份整理附录只登记可对照的出处。若只有同一份说法被转抄两遍，目录仍按一个出处记；姓名相同、在一张纸上签过字，都不能替缺少的经过补上一句。"]
      ]) + '</div>' + links(sources), "edition-profile-audit");
    testimony.append(audit);
    register.insertBefore(box("履历登记", table("只列副本中的人物材料", ["条目", "存档情况"], [
      ["姓名", esc(name)], ["登记关系", "共同说明关联人"],
      ["原证言", visible ? "本机已展开" : "等待直接出处"],
      ["补问", H4.data.INTERVIEWS[name]?.questions.length ? "另有续页" : "原目录未另列"]
    ]), "edition-person-register"), right);
  }

  function reframeWaiting(root, name, title, style) {
    const previous = root.querySelector(".waiting-" + name);
    if (!previous) return null;
    const object = previous.querySelector(".waiting-object");
    const caption = previous.querySelector(".waiting-caption");
    const next = create(name === "record" ? "section" : "article", "edition-wait " + style);
    const heading = create("h2", "edition-bar", esc(title));
    next.append(heading, object, caption);
    previous.replaceWith(next);
    return {next, object, caption};
  }

  function mail(root) {
    const workspace = root.querySelector(".mail-workspace");
    if (workspace) {
      const tabs = workspace.querySelector("#mail-tabs");
      const letter = workspace.querySelector("#mail-letter");
      const left = create("div", "edition-mail-letters");
      workspace.querySelector("header").after(left);
      left.append(preview([['envelope_front.webp', '补录封套正面', '收存封套 / 正面'],
        ['envelope_back.webp', '补录封套背面', '收存封套 / 背面']]), tabs, letter);
      return;
    }
    const view = reframeWaiting(root, "mail", "补录证据袋 / 封口登记", "edition-evidence-sleeve");
    if (view) view.caption.append(box("投递登记", table("补录封套外页", ["字段", "登记"], [
      ["收存日期", "2004-01-06"], ["附件", "照片与来信"],
      ["封套", "可查正背两面"], ["内件", "封存待展"]
    ]) + '<div class="edition-copy">' + prose([
      ["封口上的字", "补录封套照寄来时的样子留存。正面写收存题名，背面只记封口状态。封套号与纸件题名分开抄写，取出的每一页也保留原来的落款。"],
      ["内外分件", "照片、往来与家中写下的话，在目录里有不同的位置。浏览者可以翻看外封，再回到整理夹接续本次进度；外封的位置不会改变已经收好的日记。"],
      ["可核的出处", "旧站保存的是网页与照片索引，后寄材料在补录目录里另记。公开页编成以后，原件仍可按封套与题名回查，照片旁的话也留给编页者自行取舍。"],
      ["登记日期", "纸面目录按2004年1月6日收存。来件的落款等展页后按原样另记，未标出的日子不根据邮戳补写。"]
    ]) + '</div>'));
  }

  function personal(root) {
    const body = root.querySelector(".folio-published-prose");
    const waiting = body ? null : reframeWaiting(root, "personal", "留存索引卡 / 待编页", "edition-index-slip");
    const target = body || waiting?.next;
    if (!target) return;
    if (body) {
      const groups = create("div", "edition-panel-groups edition-personal-prose");
      const texts = [...body.children].filter(node =>
        node.matches(".published-essay,.published-excerpt,.published-envelope-note,.published-research"));
      if (texts.length) {
        texts[0].before(groups);
        groups.append(...texts);
      }
    }
    target.append(registerPanel("飞杳的物件 / 所见与收存", "只记本页可看到的物件和来源。下列去向指在副本里的位置。",
      "物件索引 / 未知栏照记", ["物件", "去向或留存", "出处"], notes.belongings.map(([name, destination, source], i) => i >= 10 && !body ?
        [name, "封套内容待核，目录先保留题名。", source] : [name, destination, source]), [
        ["院子与作业本", "照片是外婆家门口的那一张。作文本里写到门外的泥，也写到筛里的槐花。照片背面是她自己写的字。作文还夹在那本作业里，可以对照着看。"],
        ["名字写在哪里", "借书证上印错过一个字。她来改过两次，试广播时也特意教过陈楼怎么念。这里按她自己写的名字登记。"]
      ]));
    target.append(create("nav", "edition-personal-links", links([
      ["#/messages", "飞杳的留言页 / 原页"], ["#/mail", "照片与来信的收存封套"],
      ["#/updates", "留存后的往来"], ["#/versions", "原页与补录来源"]
    ])));
  }

  function after(root, params) {
    const register = root.querySelector(".folio-reply-register");
    const waiting = register ? null : reframeWaiting(root, "after", "挂号往来 / 收件凭条", "edition-posted-letter");
    const target = register?.closest(".after-correspondence") || waiting?.next;
    if (!target) return;
    const pack = register ? H4.Aftermath.pack(params.get("id")) : null;
    const patrolRead = H4.state.read.includes("a7");
    const reportRead = H4.hasClue("clue_report") && H4.state.read.includes("a11");
    const history = [
      ["现场联系", patrolRead ? "23:18，老周联系值班教师及急救。" : "到场与联系情况随巡逻记录另查。", "保安巡逻记录"],
      ["到场人员", "现存材料未列完整到场名单，登记空缺。", "巡逻记录 / 未见签到"],
      ["落款签发", reportRead ? "存根落款为11月18日，未列签字人姓名。" : "签发材料依封存件原页登记。", "事故调查存根"],
      ["原站截存", "镜像按11月14日23:47截存网页。", "原站地址栏"],
      ["纸面收存", "校友补录目录记2004年1月6日。", "补录目录"],
      ["本次收件", pack ? pack.date : "对应浏览尚无回信，落款留空。", "往来登记簿"]
    ];
    target.append(registerPanel("来件与事后手续", "公事手续、原始记录和家书分开收。缺的签名与到场时间仍留空。",
      "收件与经手附页", ["阶段", "可核的登记", "来源"], history, [
        ["经手的先后", "巡逻记录写下的是谁接到现场的声音、谁去联系其他人。后面的调查存根和校内证明各有形成日期。目录不从一张纸上的联系时刻推算另一张纸上的签发时间。"],
        ["原件落款", "纸页上有只写日期的，也有签名只留在附页的。登记单只抄纸上能辨的内容；邮戳、来信落款和本机收进往来夹的时间各自列目。"],
        ["回信归档", pack ? "这封往来是有人看见副本之后才收到的。拆开的信按原来的落款抄，回执按经手材料列；回信提到旧事，只能作为来信人的回应另附。" :
          "往来簿给收件日期和处理结果留了空栏。每次有回信，先抄落款，再留原信。旧站快照里没有这些往来，日后接到的说明也放在补录目录之后。"]
      ]));
    target.append(create("footer", "edition-archive-seal",
      '<b>归档封条</b><span>' + (pack ? "回信照原落款附于此册" : "收件落款暂留空") + '</span>'));
    if (!register) return;
    const timeline = [
      ["2003-11-14 23:47", "原站网页只读留存", "#/snapshot", "原站封面"],
      ["2004-01-06", "纸面材料另册收存", "#/directory", "补录目录"],
      ...pack.letters.map(letter => [letter.date, letter.from, "#edition-received", "本页原信"]),
      ["随本次浏览", "回信归入本机往来", "#/updates", "往来登记簿"],
      ["本机批注", pack.action, "#edition-action", "回复登记"]
    ];
    const received = root.querySelector(".folio-received-letters");
    const action = register.querySelector(".after-action");
    received.id = "edition-received";
    action.id = "edition-action";
    const index = box("来件沿革", '<ol class="edition-timeline">' + timeline.map(([date, title, href, label]) =>
      '<li><time>' + esc(date) + '</time><span>' + esc(title) + '</span>' +
      (href.startsWith("#/") ? link(href, label) : '<button type="button" data-edition-jump="' + href.slice(1) + '">' + label + '</button>') + '</li>'
    ).join("") + '</ol>');
    index.querySelectorAll("[data-edition-jump]").forEach(button => {
      button.onclick = () => {
        const target = document.getElementById(button.dataset.editionJump);
        if (!target) return;
        target.tabIndex = -1;
        target.focus({preventScroll: true});
        target.scrollIntoView({block: "start"});
      };
    });
    register.prepend(index);
  }

  function record(root) {
    const article = root.querySelector(".public-record");
    const waiting = article ? null : reframeWaiting(root, "record", "查证副本 / 附夹未合", "edition-pinboard");
    const target = article || waiting?.next;
    if (!target) return;
    const index = article?.querySelector(".folio-print-index");
    if (index) {
      index.open = true;
      const pages = article.querySelector(".folio-print-pages");
      const grid = create("div", "edition-grid edition-record");
      index.before(grid);
      grid.append(index, pages);
    }
    const slips = create("aside", "edition-sticky-stack", links([
      ["#/archive", "原件页 / 保留原样"], ["#/archive?tab=verify", "查证 / 圈出双方原话"],
      ["#/archive?tab=audit", "时间线 / 留出缺页"]
    ]));
    const shared = new Set(H4.data.CONTRADICTION_PAIRS.flatMap(proof => proof.pair));
    const rows = H4.data.ARCHIVE_FILES.map(file => [
      esc(file.sub), shared.has(file.id) ? link("#/archive?file=" + file.id, file.title) : esc(file.title),
      shared.has(file.id) && H4.state.read.includes(file.id) ?
        "本机已展开，原件另存" : "留存目录列目，正文在工作副本"
    ]);
    const ledger = box("纸件浏览记录", '<p>时间栏照录原件标注。结论来自查证栏，阅读标记只记本机进度。</p>' +
      table("十二件原件 / 查证副本所用的工作目录", ["材料时间", "原件", "浏览记录"], rows) +
      '<div class="edition-copy">' + prose([
        ["如何复查", "从题名可以回到纸面原件。每件先展开正文，再标出可对应的原话；没有在页面上展开的内容仍按目录题名收存，不能拿题名替代原话。"],
        ["保留缺页", "复核时遇到没有直接出处的时段，把它留在时间线上。转抄、补录和原站快照各有形成日期，浏览顺序按本机记录，纸件排序按原件日期。"]
      ]) + '</div>', "edition-record-ledger");
    target.append(slips, ledger);
  }

  function room(root, route) {
    const scene = root.querySelector(".room-" + route);
    const object = scene?.querySelector(".room-object");
    const paper = scene?.querySelector(".room-paper");
    if (!object || !paper) return;
    const caption = paper.querySelector(".room-caption");
    if (route === "duty") {
      const source = paper.querySelector("#room-sources");
      const ledger = box("钥匙借还", "");
      source.before(ledger);
      ledger.append(source);
      const handover = box("值班交接", '<p>' + esc(caption.textContent) + '</p>' +
        '<p>当班人员写在原站轮值登记上。桌上借还单是另一份纸件，按编号查阅。</p>' +
        links([["#/school?section=services&id=duty", "当日轮值登记"], ["#/stairs", "旧梯间检修路线"]]));
      caption.replaceWith(handover);
      object.append(create("section", "room-ledger-sheet", textTable(
        "值班借还单 / 栏式抄存，填写内容见原件", ["栏次", "登记项目"], [
          ["01", "借出时间"], ["02", "钥匙编号"], ["03", "借用人及事由"],
          ["04", "归还时间"], ["05", "交还人签认"], ["06", "交班清点备注"]
        ])));
      const dutyRows = H4.data.NAMES.map((name, i) => [
        String(i + 1).padStart(2, "0"), link("#/profile?n=" + encodeURIComponent(name), name),
        dateLabel("2003-11-14"), "星期五"
      ]);
      object.append(box("原站轮值人名索引", table("照当日轮值登记列序", ["序", "姓名", "值日", "星期"], dutyRows) +
        links([["#/school?section=services&id=duty", "查看完整原表与签认"]]), "edition-duty-names"));
      handover.append(create("div", "edition-copy", prose([
        ["轮值表和交班表", "一张表登记参加轮值的姓名，另一张按领用物件记借还。即便在轮值表上有签认，也得查交班表才能知道借走的是哪一把钥匙；两份表各保留自己的空栏。"],
        ["钥匙牌照实记", "桌面附图只用来找借还单。纸上有两个编号，抄录时分开留；对不上交还日期的那一栏，先按原件记空。"]
      ])));
      object.append(box("钥匙牌", table("门边登记索引", ["类别", "查阅位置"], [
        ["借出、归还", "值班桌借还单"], ["门牌与去向", "楼梯间检修路线"],
        ["当班人员", link("#/school?section=services&id=duty", "查看轮值登记姓名栏")]
      ])));
    }
    if (route === "warehouse") {
      const shelves = box("货架分区图", '<div class="edition-shelves" role="img" aria-label="进门方向的货架示意。过道左侧是灯具与锁件，右侧是栏杆与工具。">' +
        '<div class="edition-shelf-bank"><span>左侧</span><span>上层</span><span>灯具</span><span>近门</span><span>下层</span><span>锁件</span></div>' +
        '<b>过道</b><div class="edition-shelf-bank"><span>右侧</span><span>上层</span><span>栏杆</span><span>里侧</span><span>下层</span><span>工具</span></div></div>' +
        '<p>依据留存照片与交班材料绘制，方位以进门为准。</p>');
      const index = box("货架与纸件", table("本机盘点号 / 照片位置依进门方位", ["编号", "物件", "位置", "登记"], [
        ["库01", "锁芯", "近门货架", "检修用件，借还编号见值班桌"],
        ["库02", "灯泡", "交班材料所列", "照明检修与钥匙分别登记"],
        ["库03", "护栏零件", "工具一侧", "更换与交接照交班单"],
        ["库04", "交班单", "工具箱下", "签字原件另列"]
      ]) + '<p>货架记的是现场物件。钥匙的借还时间仍按值班桌上的纸单核对。</p>', "edition-stock-index");
      paper.querySelector("#room-sources").before(shelves, index);
      const annotation = scene.querySelector(".warehouse-note");
      const photoRegister = create("div", "edition-photo-register");
      object.before(photoRegister);
      annotation.append(create("dl", "edition-photo-fields",
        "<dt>照片编号</dt><dd>后勤附图 01</dd><dt>留存来源</dt><dd>本地旧楼照片</dd><dt>拍摄日期</dt><dd>原图未记</dd>"));
      photoRegister.append(object, annotation);
      annotation.append(create("div", "edition-panel-groups", '<section><h3 class="edition-subhead">本机定位</h3>' +
        '<p>图中近门处是货架，工具箱的交班单另列。需要查钥匙编号时，可回值班桌看借还单。</p>' +
        links([["#/duty", "值班桌 / 借还"], ["#/stairs", "旧梯间 / 检修路线"]]) + '</section>'));
      paper.append(create("div", "edition-copy", prose([
        ["拍进照片的范围", "近门货架和工具箱列在同一张图上，货架上较深的位置没有拍清。这里的盘点编号按本机目录排，交班纸上的维修编号另有一套，核对时不要混用。"],
        ["交班与借还", "交班人能核对的是他手边的物件和交接当时的登记。离开这一处的钥匙要查借还单，谁签过共同说明则要去纸面目录。库房附图不替两份原件代记，维修日期也按纸页自己的落款另查。工具箱只标位置，箱内没拍到的部分暂不登记。"]
      ])));
    }
    if (route === "storage") {
      scene.classList.add("edition-inventory");
      object.append(box("纸箱与抽屉", textTable("门内附页 / 按发现位置", ["留存物", "存放处"], [
        ["旧本子", "抽屉内侧"], ["借钥匙回执", "夹在旧本子里"], ["纸箱外侧", "照片未拍清箱面标签"]
      ]) + '<p>进门照片照旧收存，夹在旧本子里的纸和架上的箱子各归一项。</p>'));
      const drawer = paper.querySelector("#room-sources");
      drawer.before(box("借出登记", table("回执与借还单分存", ["核对项", "查阅处"], [
        ["借还时间", link("#/duty", "值班桌借还记录")], ["原页", "展开下列储物间附页"]
      ]) + '<div class="edition-copy">' + prose([
        ["回执所记", "签名在那张夹进旧本子的纸上。本机目录照发现的位置保存回执，签字照原页读；它和钥匙后来是否回到板上是两个需要分别核对的记载。"],
        ["照片为什么在目录外", "原站的照片索引从走廊正面排下去，封条后的门没有在其中单列。回身看到的照片与原索引先各存一处；只知道本机从哪里进入，原站没有记当时怎么拍到。"],
        ["原件怎样放回", "翻阅处把两份纸件分开。广播登记归原站附件，回执所关联的笔录归证言；查看其中一件以后仍可返回这里，照片和抽屉的位置照原页。"]
      ]) + '</div>'));
    }
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
      '<h3 class="edition-subhead">接收与收录</h3><p>原带声音可反复播放。频率刻度与下方波形的播放时标分开读。</p>');
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
      const key = sceneButton(label, () => control.setFreq(control.freq + delta));
      key.setAttribute("aria-label", (delta < 0 ? "降低" : "提高") + Math.abs(delta).toFixed(1) + "兆赫");
      dialKeys.append(key);
    }
    dial.after(dialKeys);
    tuning.querySelector("#radio-range").hidden = true;
    list.before(create("h3", "edition-bar edition-radio-index", "节目单 / 原带收录"));
    const player = create("div", "edition-radio-player");
    list.before(player);
    player.append(panel.querySelector(".tape-playback"), list);
    const fold = create("details", "edition-transcript", '<summary>当前段听写稿与朗读</summary>');
    const transcript = panel.querySelector("#tape-transcript");
    const aloud = panel.querySelector("#radio-read-aloud");
    transcript.before(fold);
    fold.append(transcript, aloud);
    panel.append(create("div", "edition-radio-note edition-copy", prose([
      ["原带、听写稿和节目单", "节目单登记的是整理时可以重播的片段。磁带上同时留着杂音、试音和当晚的录音，听写稿按段附在原带旁，没法辨认的部分仍按原样留着。"],
      ["播放位置", "刻度上的数是频率，波形下的数是本次重播走到的地方。它们都不等同于当晚钟表的时刻；停机的一段，也不能凭播放器走了多久补出来。"]
    ])));
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
    ]) + '<p>刻度显示播放位置，步数依原声或同步脚印。静音时也能反复核对。</p>' +
      '<div class="edition-copy">' + prose([
        ["封袋背面", "封袋正面只写了编号，背面留着一句话。它与走廊相片一同收在附件目录，既没有标出走动的人，也没有在照片上圈出可以指认的鞋印。"],
        ["从哪里开始记", "等声音起了再数，停顿中没有落地声时就留空。重复播放仍从同一处开始；不方便听声音时，可以勾选同步脚印，看同一段记录逐次出现。"],
        ["与纸件的关系", "数清脚步就能开封袋。里面的纸有自己的日期，取出后可以带回档案室对照其他材料。回来也能再读。"]
      ]) + '</div>'));
  }

  function messages(root) {
    const article = root.querySelector(".personal-page");
    const stream = article?.querySelector(".folio-messages");
    if (!stream) return;
    const lines = [...stream.querySelectorAll(".message-strip p")];
    const newBoard = create("section", "edition-board", table("飞杳的旧页留言 / 原页未逐条署日期",
      ["序号", "作者", "原文", "日期"], lines.map((line, i) => [
        String(i + 1).padStart(2, "0"), "飞杳", esc(line.textContent), "未记"
      ])));
    const finalRow = newBoard.querySelector("tbody tr:last-child");
    finalRow?.after(create("tr", "edition-board-reply",
      '<th scope="row">附</th><td colspan="3"><span>└</span>　留存附记　照片与背字保留在原来的附页。投稿入口随原站停用。</td>'));
    stream.replaceWith(newBoard);
    article.classList.add("edition-board-sheet");
    const photoAside = article.querySelector(".folio-message-photo");
    if (photoAside) {
      newBoard.after(photoAside);
      photoAside.append(create("p", "edition-provenance", "原页的八条留言沿旧网页顺序抄录。照片背面的字要翻面才看得见，和正文分别留存。随原站网页快照收入目录。"));
    }
  }

  function archiveRoom(root) {
    const workspace = root.querySelector(".archive-workspace");
    if (!workspace) return;
    const roomView = root.querySelector("#archive-room-view");
    const title = workspace.querySelector(".archive-heading h2");
    if (title) {
      const heading = create("h1", "edition-archive-title", esc(title.textContent));
      workspace.before(heading);
      title.remove();
    }
    const roomImage = roomView?.querySelector("#archive-room-photo");
    const caption = roomView?.querySelector("#archive-room-caption");
    if (roomImage && caption) {
      const registration = create("div", "edition-photo-register edition-archive-photo");
      const annotation = create("div", "edition-photo-notes",
        '<h3>档案室照片登记</h3><dl class="edition-photo-fields"><dt>编号</dt><dd>阅览附图 01</dd>' +
        '<dt>来源</dt><dd>本地旧楼照片</dd><dt>拍摄日期</dt><dd>原图未记</dd></dl>');
      roomImage.before(registration);
      annotation.append(caption);
      registration.append(roomImage, annotation);
    }
    const drawer = create("details", "edition-cabinet", '<summary>档案柜 / 主件借阅索引</summary>');
    const draw = () => {
      drawer.querySelector(".edition-drawer-content")?.remove();
      const rows = H4.data.ARCHIVE_FILES.map((file, i) => [
        '第' + (Math.floor(i / 4) + 1) + '格',
        link("#/archive?file=" + file.id, file.title),
        H4.state.read.includes(file.id) ? "已展开" : "待展开"
      ]);
      drawer.append(create("div", "edition-drawer-content", photo("archive_desk.jpg", "档案室里分开放置的纸件",
        "桌面留存图 / 正文按借阅目录翻阅") + table("本机借阅记录", ["柜位", "原件题名", "本机状态"], rows)));
    };
    drawer.addEventListener("toggle", () => { if (drawer.open) draw(); });
    const count = workspace.querySelector("#archive-count");
    const observer = new MutationObserver(() => { if (drawer.open) draw(); });
    observer.observe(count, {childList: true, characterData: true, subtree: true});
    H4.onLeave(() => observer.disconnect());
    workspace.querySelector("#archive-body").before(drawer);
    const referenceRows = ["a4", "a7", "a11"].map(id => {
      const source = H4.source(id);
      return [link("#/archive?file=" + id, source.title), esc(source.sub), source.locked && !H4.hasClue(source.locked) ? "封存" : "可查"];
    });
    const index = create("section", "edition-archive-register edition-panel-groups",
      '<h3 class="edition-bar">阅览索引</h3>' + table("三件常用原件", ["题名", "原件日期", "状态"], referenceRows));
    workspace.append(index);
    index.append(create("div", "edition-catalog-notes edition-copy", prose([
      ["主件与附页", "主件目录按纸面所标的日期排，补入的访谈和来信分开收。封袋即使未打开也可以列目；正文、摘条和原件签名保留在各自的阅读页。"],
      ["文件怎样归位", "按时间归档时以主件日期为准，按人物归档时可按当事人或收存者分卷。归档让原件容易找回，交叉核对仍要回到各自纸面上的原话。"],
      ["怎样复读", "借阅索引按原件题名定位，查证和事件复核另有入口。看过的主件仍可重复打开，本次浏览选定的归档方式也会留在副本里。"]
    ])));
  }

  function ending(root) {
    const page = root.querySelector(".page");
    const actions = page?.querySelector("#end-actions");
    if (!actions) return;
    page.classList.add("edition-ending");
    const name = H4.Endings.names[page.dataset.endingId];
    if (name && !page.querySelector("h1")) page.prepend(create("h1", "edition-ending-title", esc(name)));
    actions.after(create("footer", "edition-ending-credit", "<p>本页随浏览记录留存 · abc studio</p>"));
  }

  const archivePages = {
    home, directory, item, versions, search, updates, about, profile, mail, personal, after, record,
    duty: root => room(root, "duty"), warehouse: root => room(root, "warehouse"), storage: root => room(root, "storage"),
    radio, footsteps, messages, archive: archiveRoom, ending
  };

  const cuts = {
    home: ["site03_banner.jpg", "槐岭中学校舍外景", "槐岭中学 / 旧四楼归档站", "52% 52%"],
    messages: ["courtyard_memory.webp", "飞杳外婆家的院子", "飞杳的旧主页 / 留存照片", "50% 50%"],
    directory: ["corridor_1.jpg", "旧楼走廊窗框", "照片附页 / 四楼窗框 · 拍摄未落日", "23% 52%"],
    item: ["classroom.jpg", "空教室里的桌面与窗", "整理手记 / 旧楼教室附图", "61% 56%"],
    versions: ["site03_banner.jpg", "原站保存的槐岭中学校舍", "原站照片 / 随11月14日网页快照留存", "50% 38%"],
    updates: ["courtyard_memory.webp", "院门与院子的一角", "收存照片 / 外婆家 · 1999年春", "50% 50%"],
    about: ["bg_corridor.webp", "旧四楼的一段墙面", "保存说明附图 / 旧四楼", "50% 30%"],
    duty: ["duty_desk.webp", "灯旁的值班桌面", "值班照片 / 借还原件另列", "35% 57%"],
    warehouse: ["warehouse.jpg", "库房货架一侧", "后勤附图 / 进门后的货架", "24% 61%"],
    storage: ["storage_room.jpg", "储物间近门的木架", "目录外附图 / 储物间近门", "82% 59%"],
    radio: ["radio_room.jpg", "广播室设备与柜边", "设备附图 / 机内刻度见调频面板", "61% 53%"],
    footsteps: ["corridor_3.jpg", "走廊地面与墙脚", "声响附件配图 / 走廊地面，照片未辨出鞋印", "49% 96%"],
    profile: ["site03_classroom.jpg", "教室内靠窗的座位", "证言目录附图 / 校内照片", "28% 65%"],
    record: ["archive_desk.jpg", "档案桌边分开放置的纸页", "查证副本附图 / 原件按题名归卷", "50% 70%"]
  };

  function maintenance(root, route) {
    const shell = root.querySelector(".portal-page");
    if (!shell) return;
    const footer = shell.querySelector(".archive-colophon");
    if (!footer || footer.querySelector(".edition-maintenance")) return;
    const top = sceneButton("↑ 返回页首", () => {
      H4.$("#screen-wrap").scrollTop = 0;
      root.focus({preventScroll: true});
    });
    top.className = "edition-to-top";
    const line = create("p", "edition-maintenance", route === "messages" ?
      "飞杳原页 · 校友副本保留留言顺序" : "校友留存资料 · abc studio");
    line.append(top);
    footer.append(line);
    const friends = create("nav", "edition-footer-links", links([
      ["#/snapshot", "槐岭小站"], ["#/school?section=notices", "校务通知"],
      ["#/school?section=building", "旧楼照片"], ["#/messages", "飞杳主页"],
      ["#/directory?section=notes", "整理手记"], ["#/about", "保存说明"]
    ]));
    friends.setAttribute("aria-label", "镜像内友情链接");
    footer.prepend(friends);
    footer.append(create("p", "edition-visit-counter",
      '您是第 <b aria-label="二十八">' + [..."000028"].map(d => "<i>" + d + "</i>").join("") + '</b> 位访客'));
  }

  function themePlayer(root) {
    const banner = root.querySelector(".edition-mast-banner");
    if (!banner) return;
    const shell = create("div", "edition-theme",
      '<span>旧四楼.mid</span><span class="edition-theme-meter" aria-hidden="true">' +
      "<i></i>".repeat(8) + '</span><span class="edition-theme-state" role="status"></span>');
    const note = shell.querySelector(".edition-theme-state");
    let audio;
    let source;
    let attempt = 0;
    const stop = () => {
      attempt += 1;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      shell.classList.remove("is-playing");
      start.disabled = false;
      halt.disabled = true;
    };
    const start = sceneButton("▶ 播放", async () => {
      if (H4.state.muted) {
        note.textContent = "声音已关闭";
        return;
      }
      if (!audio) {
        audio = new Audio("assets/audio/archive_theme.mp3");
        audio.loop = true;
        audio.volume = .32;
        H4.A.init();
        if (H4.A.ctx && H4.A.master) {
          try {
            source = H4.A.ctx.createMediaElementSource(audio);
            source.connect(H4.A.master);
          } catch (_) {}
        }
      }
      const request = ++attempt;
      start.disabled = true;
      halt.disabled = false;
      note.textContent = "";
      try {
        await audio.play();
        if (request === attempt) shell.classList.add("is-playing");
      } catch (_) {
        if (request !== attempt) return;
        stop();
        note.textContent = "此处未能播放";
      }
    });
    const halt = sceneButton("■ 停止", () => { stop(); note.textContent = ""; });
    halt.disabled = true;
    shell.append(start, halt);
    banner.append(shell);
    const mute = H4.$("#mute-btn");
    const onMute = () => { if (H4.state.muted) stop(); };
    mute.addEventListener("click", onMute);
    H4.onLeave(() => {
      stop();
      source?.disconnect();
      mute.removeEventListener("click", onMute);
    });
  }

  function wrapOriginal(content, selector, title) {
    const node = content.querySelector(selector);
    if (!node) return;
    const section = box(title, "");
    node.before(section);
    section.append(node);
  }

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
    const side = site.querySelector(".s03-side");
    if (section === "home") {
      const photos = content.querySelector(".s03-photo-news");
      photos?.append(create("a", "edition-original-attachment", photo("attachment_envelope.webp", "编号04的封袋", "声音附件 / 单页留存")));
      if (photos) photos.lastElementChild.href = "#/footsteps";
      const first = content.querySelector(".s03-home-note p");
      first?.insertAdjacentText("beforeend", " 教师名录按接洽地点编排，常用表格可从右栏打开。照片仍留在旧楼栏目内。");
      originalDates(site);
      return;
    }
    const entries = {
      notices: [".s03-list", "通知目录 / 依发布日期"],
      news: [".s03-list", "近况索引 / 教研与活动"],
      staff: [".s03-table-scroll", "教师及窗口名录"],
      services: [".s03-docs", "可查阅的资料"],
      map: [".s03-docs", "站点栏目及用途"],
      building: [".s03-table", "旧教学楼 / 照片及附页"],
      links: [".s03-docs", "校外链接 / 只保留登记"]
    };
    if (entries[section]) wrapOriginal(content, ...entries[section]);
    const source = H4.Site03;
    if (section === "missing" || (section === "article" && !content.querySelector(".s03-article"))) {
      const kind = params.get("kind") === "news" ? "news" : "notices";
      const rows = source[kind].slice(0, 6).map(([id, date, title, summary]) => [
        dateLabel(date, "2003"),
        link(source.url("article", "kind=" + kind + "&id=" + id), title),
        esc(summary.split("。")[0] + "。")
      ]);
      content.append(create("section", "edition-original-recovery",
        '<h3>本栏目近期条目</h3>' + table("快照中仍可查阅的网页", ["日期", "题名", "内容摘记"], rows) +
        '<p>' + link(source.url(kind), "查看本栏目完整列表") + '</p>'));
    }
    if (section === "mailbox" || section === "links" || (section === "search" && !params.get("q")?.trim())) {
      const entries = section === "search" ? [
        ["notices", "通知目录", "校务通知、借阅与作息"],
        ["news", "校园近况", "校内教研、活动与照片"],
        ["board", "家校留言", "原留言与校方回复"]
      ] : [
        ["staff", "教师与服务窗口", "来访登记与接洽地点"],
        ["services", "常用资料", "轮值、登记和办事说明"],
        ["map", "站内导航", "按栏目查找随快照收存的页面"]
      ];
      content.append(create("section", "edition-original-recovery",
        '<h3>站内可查栏目</h3>' + table("小站本地留存", ["栏目", "可查内容"], entries.map(([key, title, detail]) =>
          [link(source.url(key), title), esc(detail)]))));
    }
    if (section === "notices") {
      const list = content.querySelector(".s03-list");
      const page = Math.min(Math.max(1, Math.floor(Number(params.get("page")) || 1)), Math.ceil(source.notices.length / 15));
      const rows = [...list.querySelectorAll("li")].map((item, i) => [
        String((page - 1) * 15 + i + 1).padStart(2, "0"), item.querySelector("a").outerHTML,
        '<time>' + esc(isoDate(item.querySelector("span").textContent, "2003")) + '</time>'
      ]);
      const formatted = create("div", "edition-original-notices", table("本学期通知", ["序", "通知标题", "发布日期"], rows));
      list.replaceWith(formatted);
    }
    if (section === "news") {
      const list = content.querySelector(".s03-list");
      const first = list.querySelector("li");
      if (first && (!params.get("page") || params.get("page") === "1")) {
        first.querySelector("a").after(create("span", "edition-badge edition-new", "new"));
      }
    }
    if (section === "staff") {
      const rows = [...content.querySelectorAll(".s03-table tbody tr")].map(row => {
        const [name, subject, role, office] = [...row.cells].map(cell => cell.textContent);
        return [name, [subject, role].filter(Boolean).join(" / "), office, "原页未单列"];
      });
      const old = content.querySelector(".s03-table");
      old.insertAdjacentHTML("afterend", textTable("本学期联系名录", ["姓名", "职务与分工", "接洽地点", "接待时间"], rows));
      old.remove();
    }
    if (section === "services" && !params.get("id")) {
      const list = content.querySelector(".s03-docs");
      const docs = [source.duty, source.roster, ...source.docs];
      const rows = docs.map(doc => {
        const href = source.url("services", "id=" + doc.id);
        const content = doc.body || doc.rows.map(row => row.join("　")).join("\n");
        const bytes = encodeURIComponent(content).replace(/%[\da-f]{2}/gi, "x").length;
        return ['<span class="edition-document-icon" aria-hidden="true"></span>' + link(href, doc.title),
          "HTML", bytes + " B", doc.id === "duty" ? "11-14" : "随快照收存"];
      });
      list.replaceWith(create("div", "edition-service-index", table("大小为可见正文的 UTF-8 字节", ["资料名", "格式", "大小", "日期"], rows)));
    }
    if (section === "map") {
      const list = content.querySelector(".s03-docs");
      const groups = [["旧楼", "building"], ["校园", "notices", "news", "board", "staff", "services"], ["站外及联系", "links", "mailbox"]];
      const columns = create("div", "edition-school-map");
      groups.forEach(([title, ...ids]) => {
        const group = box(title, '<ul class="edition-links"></ul>');
        const selected = [...list.children].filter(li =>
          ids.some(id => li.querySelector("a").href.includes("section=" + id)));
        group.querySelector("ul").append(...selected);
        columns.append(group);
      });
      list.closest(".edition-box").replaceWith(columns);
    }
    if (["building", "staff"].includes(section)) {
      const paragraphs = [...content.children].filter(node => node.matches("p:not(.s03-position,.s03-pages)"));
      if (paragraphs.length) {
        const notice = box(section === "staff" ? "来访登记" : "照片说明", "");
        paragraphs[0].before(notice);
        notice.append(...paragraphs);
      }
    }
    if (section === "building") {
      const strip = preview([
        [photoEntries[0][0], photoEntries[0][1], "教室 / 随11-14快照留存", photoEntries[0][3]],
        [photoEntries[1][0], photoEntries[1][1], "四楼走廊 / 拍摄日期未记", photoEntries[1][3]],
        [photoEntries[2][0], photoEntries[2][1], "外婆家 / 1999年春", photoEntries[2][3]]
      ]);
      content.querySelector("h2")?.after(strip);
    }
    if (section === "services" && !params.get("id")) {
      const docs = content.querySelector(".edition-service-index");
      const index = box("资料索引", table("资料与查询窗口", ["事项", "接洽位置"], [
        ["作息、轮值", "教务处"], ["借阅登记", "图书室"],
        ["收据及费用", "收费窗口"], ["来访登记", "传达室"]
      ]));
      docs?.closest(".edition-box")?.after(index);
    }
    if (section === "map") {
      content.append(box("页面间的来往", links([
        ["#/school?section=notices", "办事通知 → 常用资料"],
        ["#/school?section=staff", "教师与窗口 → 接洽名录"],
        ["#/school?section=building", "旧楼照片 → 同学主页与附页"],
        ["#/school?section=board", "站长信箱 → 家校留言"]
      ])));
    }
    if (section === "notices" || section === "news") {
      const companion = section === "notices" ?
        [["#/school?section=services", "常用资料与办事登记"], ["#/school?section=staff", "接洽地点名录"], ["#/school?section=board", "历次家长留言"]] :
        [["#/school?section=building", "校内随拍与旧楼照片"], ["#/school?section=notices", "活动相关通知"], ["#/school?section=map", "校园栏目导航"]];
      const list = box(section === "notices" ? "较早留存 / 往期通知" : "校园栏目附页", links(companion));
      if (section === "notices") {
        const earlier = source.notices.slice(15, 21).map(([id, date, title]) =>
          [source.url("article", "kind=notices&id=" + id), title, isoDate(date, "2003")]);
        list.append(create("div", "edition-previous-notices", links(earlier)));
      } else {
        list.append(preview([photoEntries[0]]));
      }
      content.append(list);
    }
    if (section === "staff") content.append(box("来访办理次序",
      '<ol><li>在传达室登记到校事由。</li><li>凭名录核对任课教师所在办公室。</li><li>需要查阅表格时到对应窗口领取。</li></ol>'));
    if (section === "board") {
      const posts = [...content.querySelectorAll(".s03-message")];
      if (posts.length) {
        const thread = box("家校留言留存", "");
        posts[0].before(thread);
        thread.append(...posts);
      }
    }
    if (section === "search") {
      const found = [...content.querySelectorAll(".s03-result")];
      if (found.length) {
        const index = box("检索所得条目", "");
        found[0].before(index);
        index.append(...found);
      }
    }
    if (side && section !== "building") side.append(preview([photoEntries[0]]));
    originalDates(site);
  }

  function sceneButton(label, action) {
    const button = create("button", "", esc(label));
    button.type = "button";
    button.onclick = action;
    return button;
  }

  function hotspot(button, x, y, label) {
    if (!button) return;
    button.classList.add("scene-hotspot");
    button.style.setProperty("--spot-x", x + "%");
    button.style.setProperty("--spot-y", y + "%");
    button.dataset.spotLabel = label;
  }

  function observation(label, text, follow = []) {
    const button = sceneButton(label, () => {
      const page = button.closest(".edition-scene");
      if (!page) return;
      const line = typeof text === "function" ? text() : text;
      showObservation(page, label, line, button, follow);
    });
    return button;
  }

  function showObservation(page, title, text, source, follow = []) {
    const pane = page.querySelector(".edition-observation");
    const titleNode = pane.querySelector("b");
    const line = pane.querySelector("p");
    const area = pane.querySelector(".edition-observation-actions");
    const sequence = String(Number(pane.dataset.sequence || 0) + 1);
    pane.dataset.sequence = sequence;
    pane.hidden = false;
    titleNode.textContent = title;
    line.textContent = text;
    const close = sceneButton("收起观察", () => {
      pane.hidden = true;
      source?.focus({preventScroll: true});
    });
    const wait = sceneButton("等一会儿", () => {
      wait.disabled = true;
      line.textContent = "你在原地等了一会儿。";
      H4.app.later(1600, () => {
        if (!pane.isConnected || pane.hidden || pane.dataset.sequence !== sequence) return;
        line.textContent = "没有新的动静，眼前还是刚才的样子。";
        wait.disabled = false;
      });
    });
    const inspect = sceneButton("翻看照片附记 ↓", () => {
      const journal = page.nextElementSibling;
      if (!journal?.classList.contains("edition-scene-ledger")) return;
      journal.focus({preventScroll: true});
      journal.scrollIntoView({block: "start"});
    });
    const next = follow.map(([label, line]) =>
      sceneButton(label, () => showObservation(page, label, line, source)));
    area.replaceChildren(...next, wait, inspect, close);
    close.focus({preventScroll: true});
  }

  function sceneBar(page, title) {
    const tag = page.closest("#screen")?.querySelector("h1") ? "b" : "h1";
    const bar = create("footer", "edition-scene-bar",
      '<span class="edition-view-icon" aria-hidden="true">04</span><div class="edition-scene-copy"><' + tag +
      ' class="edition-scene-name">' + esc(title) + '</' + tag + '></div><div class="edition-scene-actions"></div>' +
      '<section class="edition-observation" hidden><div role="status"><b></b><p></p></div>' +
      '<div class="edition-observation-actions"></div></section>');
    page.append(bar);
    const actions = bar.querySelector(".edition-scene-actions");
    const read = sceneButton("照片附记 ↓", () => {
      const journal = page.nextElementSibling;
      if (!journal?.classList.contains("edition-scene-ledger")) return;
      journal.focus({preventScroll: true});
      journal.scrollIntoView({block: "start"});
    });
    read.className = "edition-scene-journal-link";
    actions.append(read);
    return {copy: bar.querySelector(".edition-scene-copy"), actions};
  }

  function sceneContactPair(route, locked) {
    const entries = {
      corridor: [
        ["corridor_1.jpg", "走廊第一段的窗框", "01 / 走廊窗框"],
        ["site03_banner.jpg", "原站保存的教学楼外景", "02 / 原站楼影"]
      ],
      stairs: [
        ["stairs_4.webp", "梯间两扇门与栏杆", "01 / 梯间门牌"],
        ["corridor_1.jpg", "走廊第一段的窗框", "02 / 来路附图"]
      ],
      rooftop: [
        locked ? ["locked_roof.webp", "天台锁闭的铁门", "01 / 天台锁扣"] :
          ["rooftop.jpg", "雨中的天台一角", "01 / 天台门外"],
        ["stairs_4.webp", "梯间两扇门与栏杆", "02 / 梯间来路"]
      ]
    }[route];
    if (!entries) return null;
    const strip = create("div", "edition-scene-pair", entries.map(entry => photo(...entry)).join(""));
    strip.setAttribute("aria-label", "两张照片索引");
    return strip;
  }

  function sceneTree(branch, route, preview, journal) {
    const flags = H4.state.flags;
    const places = [
      ["corridor", "旧四楼 · 走廊", true],
      ["stairs", "旧楼 · 梯间", H4.hasClue("clue_stairs_pass")],
      ["basement", "负一楼 · 配电与储藏", flags.stairBelowSeen || H4.state.stairLoops >= 3 || H4.hasClue("clue_basement")],
      ["rooftop", "天台 · 水塔", H4.hasClue("clue_rooftop_key")],
      ["radio", "四楼 · 广播室", H4.hasClue("clue_radio_key")],
      ["warehouse", "后勤仓 · 旧课桌", H4.hasClue("clue_warehouse")]
    ];
    for (const [key, label, available] of places) {
      let entry;
      if (key === route) {
        entry = sceneButton(label, preview);
        entry.setAttribute("aria-current", "page");
      } else if (available) {
        entry = create("a", "", esc(label));
        entry.href = "#/" + key;
      } else {
        entry = create("span", "edition-tree-unavailable", esc(label) + " <small>待查</small>");
      }
      branch.append(entry);
    }
    branch.append(create("span", "edition-tree-unavailable", "回收站 <small>已清空</small>"),
      sceneButton("照片附记", journal));
  }

  function frameScene(page, route) {
    const title = page.querySelector(".edition-scene-name").textContent;
    const bar = page.querySelector(".edition-scene-bar");
    const desk = page.querySelector(".application-desk");
    const doors = page.querySelector(".edition-door-choices");
    const portrait = page.classList.contains("edition-closed-roof");
    const stage = create("div", portrait ? "edition-scene-stage edition-roof-photo" : "edition-scene-stage");
    stage.setAttribute("aria-label", "可操作现场照片");
    stage.tabIndex = -1;
    stage.append(...[...page.children].filter(node => node !== bar && node !== desk && node !== doors));
    const content = create("div", "edition-desk-content");
    content.id = "edition-desk-content";
    content.append(stage, bar);
    if (doors) content.append(doors);
    const menu = create("nav", "edition-desk-menu");
    menu.setAttribute("aria-label", "现场阅览程序菜单");
    const windowBar = create("header", "edition-desk-title");
    const tools = create("div", "edition-desk-window-buttons");
    const caption = create("b", "", "旧四楼浏览程序 v1.2 [只读]");
    const body = create("div", "edition-desk-body");
    const tree = create("aside", "edition-desk-tree",
      '<details><summary>旧四楼 / 本地光盘</summary><div class="edition-tree-branches"></div></details>');
    tree.firstElementChild.open = !matchMedia("(max-width: 720px)").matches;
    const branch = tree.querySelector(".edition-tree-branches");
    const journal = () => {
      const target = page.nextElementSibling;
      if (!target?.classList.contains("edition-scene-ledger")) return;
      target.focus({preventScroll: true});
      target.scrollIntoView({block: "start"});
    };
    const preview = () => {
      if (body.hidden) fold.click();
      stage.focus({preventScroll: true});
      stage.scrollIntoView({block: "nearest"});
    };
    sceneTree(branch, route, preview, journal);
    const exit = route === "corridor" ? "#/school?section=building" :
      route === "stairs" ? "#/corridor" : "#/stairs";
    const close = () => H4.go(exit);
    const help = () => H4.modal({
      title: "现场阅览程序说明",
      bodyHTML: "<p>目录树可以打开已查到的地点，也可以在现场照片与本页附记之间切换。照片里的方点可按键盘或触屏选中。</p>"
    });
    const file = sceneButton("文件 / 返回", close);
    const view = sceneButton("视图 / 照片", preview);
    const attach = sceneButton("工具 / 附记", journal);
    const support = sceneButton("帮助", help);
    menu.append(file, view, attach, support);
    const fold = sceneButton("−", () => {
      body.hidden = !body.hidden;
      fold.textContent = body.hidden ? "+" : "−";
      fold.setAttribute("aria-expanded", String(!body.hidden));
      fold.setAttribute("aria-label", body.hidden ? "展开现场照片" : "折叠现场照片");
    });
    fold.setAttribute("aria-controls", "edition-desk-body");
    fold.setAttribute("aria-label", "折叠现场照片");
    fold.setAttribute("aria-expanded", "true");
    const expand = sceneButton("□", () => {
      tree.hidden = !tree.hidden;
      body.classList.toggle("is-wide", tree.hidden);
      expand.setAttribute("aria-pressed", String(tree.hidden));
    });
    expand.setAttribute("aria-label", "放大预览或还原双栏");
    expand.setAttribute("aria-pressed", "false");
    const quit = sceneButton("×", close);
    quit.setAttribute("aria-label", "关闭现场阅览");
    tools.append(fold, expand, quit);
    windowBar.append(caption, tools);
    const pair = sceneContactPair(route, page.classList.contains("edition-closed-roof"));
    if (pair) {
      page.classList.add("edition-opening-paired");
      branch.before(pair);
    }
    const status = create("footer", "edition-desk-status",
      "<span>就绪</span><span>" + esc(title) + "</span><span>本地缓存</span>");
    body.id = "edition-desk-body";
    body.append(tree, content);
    page.prepend(windowBar, menu, body, status);
    if (desk) page.append(desk);
    page.classList.add("edition-desk");
    if (route === "rooftop") page.classList.add("edition-night-desk");
  }

  function corridorScene(page) {
    const windowMark = page.querySelector("#window-memory");
    const backDoor = page.querySelector("#back-door-hotspot");
    const light = observation("顶灯", "灯管只亮着半截，另一头映在玻璃里。");
    const floor = observation("地面", "地上有几张吸了水的纸屑，已看不出原先写过什么。");
    const farEnd = observation("走廊尽头", () =>
      page.querySelector("#corr-warning").textContent || "从这里望过去，下一处门框被阴影遮住了。");
    hotspot(windowMark, 32, 48, "窗沿");
    hotspot(backDoor, 38, 48, "封条后的门");
    hotspot(light, 55, 23, "顶灯");
    hotspot(floor, 49, 70, "地面");
    hotspot(farEnd, 70, 48, "朝尽头看");
    page.append(light, floor, farEnd);
    const bar = sceneBar(page, "旧四楼 · 走廊");
    bar.copy.append(page.querySelector("#corr-location"), page.querySelector(".corr-info"), page.querySelector(".corr-pace"));
    bar.actions.append(page.querySelector(".touch-controls"), page.querySelector(".scene-home"));
  }

  function stairsScene(page) {
    const doors = create("div", "edition-door-choices");
    doors.setAttribute("role", "group");
    doors.setAttribute("aria-label", "梯间两侧门牌");
    doors.append(page.querySelector("#door-left"), page.querySelector("#door-right"));
    page.append(doors);
    hotspot(page.querySelector("#route-note"), 77, 25, "检修路线");
    hotspot(page.querySelector("#handrail-inspect"), 49, 69, "扶手下面");
    const lamp = observation("梯间的灯", "灯光只照到门上半截。站在中间，扶手的影子正好压在两阶台阶上。", [
      ["看台阶", "踏面比立面亮一点。边沿让脚磨得发白，再往下便看不清了。"],
      ["看墙面", "最靠近灯的那一块墙还看得见漆色，转过去就是扶手投下来的影子。"]
    ]);
    hotspot(lamp, 52, 25, "梯间的灯");
    page.append(page.querySelector("#handrail-inspect"), lamp);
    const bar = sceneBar(page, "旧梯间 · 两道门");
    bar.copy.append(page.querySelector("#stairs-feedback"));
    bar.actions.append(page.querySelector(".stairs-tools"), page.querySelector(".scene-bottom"));
  }

  function closedRoof(root) {
    const waiting = root.querySelector(".waiting-roof");
    if (!waiting) return;
    const image = waiting.querySelector("img");
    const caption = waiting.querySelector(".waiting-caption");
    const page = create("div", "edition-scene edition-closed-roof");
    image.classList.add("bg-img");
    page.append(image);
    const lock = observation("锁扣", "锁扣还挂在原处。门内的雨声听得见。");
    const ledge = observation("门框", "灰从门框上剥下一小块，露出下面刷过的一层漆。");
    const step = observation("最上一阶", "台阶靠门的一侧是湿的，往下两阶便干了。");
    hotspot(lock, 58, 51, "锁扣");
    hotspot(ledge, 32, 37, "门框");
    hotspot(step, 49, 71, "最上一阶");
    page.append(lock, ledge, step);
    waiting.replaceWith(page);
    const bar = sceneBar(page, "天台门边 · 铁门锁着");
    bar.copy.append(...caption.querySelectorAll("p:not(.eyebrow)"));
    bar.actions.append(caption.querySelector(".page-links"));
    root.classList.add("edition-scene-frame");
    frameScene(page, "rooftop");
    sceneLedger(page, "rooftop", true);
  }

  function rooftopScene(page) {
    const puddle = observation("门边积水", "雨水顺着地砖的接缝往门口流。风一吹，浅水里的灯光散开了。");
    const railing = observation("围栏边", "栏杆湿透了。站在这里能看见对面楼里还有一扇窗亮着。");
    hotspot(page.querySelector("#roof-diary"), 70, 70, "门边纸页");
    hotspot(puddle, 48, 65, "门边积水");
    hotspot(railing, 31, 44, "围栏边");
    const farWindow = observation("对楼的灯", "对面只亮着一块窗。隔得太远，屋里有没有人看不清。");
    hotspot(farWindow, 65, 28, "对楼的灯");
    page.append(puddle, railing, farWindow);
    const bar = sceneBar(page, "天台 · 铁门已经打开");
    bar.copy.append(page.querySelector(".roof-words"));
    bar.actions.append(page.querySelector(".rooftop-btns"));
  }

  function basementScene(page) {
    const desk = page.querySelector(".application-desk");
    const paper = sceneButton("俯身翻看纸片", () => open(true));
    const light = observation("门廊顶灯", "灯泡隔着一层旧灰，光落下来刚够看清纸的边。");
    const doorway = observation("走廊尽头", "尽头的门没有动，楼梯上来的光只到这里。");
    hotspot(paper, 59, 70, "地上的纸片");
    hotspot(light, 53, 24, "顶灯");
    hotspot(doorway, 46, 47, "尽头的门");
    const close = sceneButton("收起纸片", () => open(false));
    close.className = "xp-btn edition-desk-close";
    desk.prepend(close);
    const wall = observation("墙脚", "墙脚的颜色比顶上深，地面反的那一点光也到这里断了。");
    hotspot(wall, 27, 58, "墙脚");
    page.append(paper, light, doorway, wall);
    const bar = sceneBar(page, "负一楼 · 裁开的纸页");
    const tag = create("p", "edition-stage-tag", "负一楼附图 / 门边有几片裁开的纸，几道接缝还对得上。");
    bar.copy.append(tag);
    const continueButton = sceneButton("翻看纸片", () => open(true));
    continueButton.className = "xp-btn";
    bar.actions.append(continueButton, page.querySelector(".scene-bottom"));
    function open(show) {
      desk.hidden = !show;
      page.classList.toggle("edition-desk-open", show);
      continueButton.setAttribute("aria-expanded", String(show));
      if (show) close.focus();
      else continueButton.focus();
    }
    desk.id = "edition-basement-desk";
    paper.setAttribute("aria-controls", desk.id);
    continueButton.setAttribute("aria-controls", desk.id);
    desk.hidden = !H4.state.flags.applicationUnderstood;
    continueButton.setAttribute("aria-expanded", String(!desk.hidden));
    page.classList.toggle("edition-desk-open", !desk.hidden);
  }

  function sceneLedger(page, route, locked = false) {
    const record = notes[route];
    const rows = locked ? record.rows.filter(row => row[2] !== "开门后附图").concat([
      ["铰接边", "门扇搭在门框内，里面未入镜。", "锁门照"],
      ["锁件旁", "门面只见漆色，没有落款。", "锁门照"],
      ["台阶下方", "画面到台阶边沿为止。", "锁门照"]
    ]) : record.rows;
    const indexed = route === "stairs" || route === "rooftop";
    const journal = registerPanel(record.title, record.source, "现场图页 / 原样留存",
      record.headers, rows, indexed ? [] : record.paragraphs);
    if (indexed) journal.querySelector(".edition-copy").remove();
    if (route === "stairs") {
      journal.append(create("ol", "edition-descent", record.paragraphs.map(([title, text]) =>
        "<li><b>" + esc(title) + "</b><p>" + esc(text) + "</p></li>").join("")));
    }
    if (route === "rooftop") {
      journal.append(create("ol", "edition-roof-quotes", record.paragraphs.map(([title, text], i) =>
        '<li><h3 class="edition-subhead">' + String(i + 1).padStart(2, "0") +
        ' / ' + esc(title) + '</h3><blockquote>' + esc(text) + '</blockquote></li>').join("")));
    }
    if (route === "basement") {
      const cabinet = create("div", "edition-cabinet-grid",
        '<section><h3>墙面痕迹</h3><p>现场登记表，按墙脚和地坪查对。</p></section>' +
        '<section><h3>纸件整理</h3><p>使用阅览器的「翻看纸片」打开拼合桌面。</p></section>' +
        '<section><h3>原目录</h3><a href="#/stairs">返回楼梯现场</a></section>');
      journal.querySelector(".edition-provenance").after(cabinet);
    }
    journal.classList.add("edition-scene-ledger", "edition-scene-ledger-" + route);
    journal.tabIndex = -1;
    if (route === "rooftop") {
      const patrol = H4.state.read.includes("a7");
      const keys = H4.state.read.includes("a4");
      const door = H4.state.read.includes("a3");
      journal.append(create("div", "edition-roof-register", textTable("四条相关时间 / 天气均未记载", ["时刻", "原件所载", "天气"], [
        [keys ? "2003-11-10" : "待阅", "天台门锁检修登记", "未记"],
        [keys ? "2003-11-14 19:40" : "待阅", "借用登记，未记实际登临时刻", "未记"],
        [patrol ? "2003-11-14 22:40" : "待阅", "旧梯口巡逻条目，未记天台停留", "未记"],
        [door ? "2003-11-14 23:08" : "待阅", "门口访谈，原话另列", "未记"]
      ])));
    }
    if (route === "basement") {
      journal.append(create("p", "edition-provenance", "经手：本机副本整理。纸片翻过后另记正背两面，照原纸保留批注位置和未填写的格。"));
    }
    journal.append(create("nav", "edition-scene-references", links(record.links)));
    page.after(journal);
  }

  const scenes = {corridor: corridorScene, stairs: stairsScene, rooftop: rooftopScene, basement: basementScene};
  H4.Edition2003 = {
    archive(root, route, params) {
      root.classList.add("edition-v12", "edition-v13");
      if (Object.hasOwn(archivePages, route)) archivePages[route](root, params);
      masthead(root, route);
      maintenance(root, route);
      if (route === "home") themePlayer(root);
      if (!root.querySelector(".portal-page,.archive-colophon")) {
        root.append(create("footer", "archive-colophon edition-standalone-colophon",
          '<span>旧四楼归档站</span><span>本地留存 · abc studio</span>'));
      }
      if (!Object.hasOwn(scenes, route)) return;
      const page = root.querySelector("." + route + "-page");
      if (!page) {
        if (route === "rooftop") closedRoof(root);
        return;
      }
      root.classList.add("edition-scene-frame");
      page.classList.add("edition-scene");
      scenes[route](page);
      frameScene(page, route);
      sceneLedger(page, route);
    },
    original
  };
})();
