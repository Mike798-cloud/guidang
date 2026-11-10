(() => {
  "use strict";
  var e=H4.Portal,t=H4.esc,r={"张耀主":"他的名字在共同说明里。先翻教室留下的那摞纸，再对照这份说法。","小子":"检讨书上也用了这个称呼。教室里那份检讨与共同说明，是这页的起头。","清东":"他写在纸上的编号，需要同借还登记并读。先在档案室的“整理纸张”里把十二件主件归好。","刘楼":"先到教室档案室，把十二张纸按顺序摆好。回来再看他在旧梯口见过什么。","萧神":"节目安排也在教室那批纸中。把十二件主件按日期或人物归好，再读他的解释。","王京":"旧梯间还能通向后勤仓库。先去找交班材料，再来看这份关于门锁的说法。","张耀兰":"封条后面的门还没看过。回走廊找那页签字，借还登记要留着一同核对。","张纪兰":"先把档案室的十二张纸摆好，再回来读她对作业本的说法。","于祯":"先把共同说明和其他主件一起摆好。十二件都归位以后，再来对照他的签名与口述。","张耀王":"这页提到了四楼的另一道门。走廊上的照片还可以换个方向看，先回原处走走。","豆庵":"广播的频率记在点歌本上。先收好六段录音，再来对照他记得的声音。","张锦兰":"关于护栏的说法还缺04号封袋里的材料。先打开声音附件，再把两边的原话放在一起。","陈楼":"陈楼也在那张名单上。这是他自己说的。点歌本上记了六个频率。收齐那六段录音，再来看陈楼怎么说。"};H4.app.profileGuide=function(e){var t=H4.data.PROFILES[e].unlock,o="archive",a="去教室翻原件";if("clue_testimony"===t&&(a="回档案室整理主件"),"clue_warehouse"===t&&(o="stairs",a="回旧梯间找后勤仓库"),"clue_storage"!==t&&"clue_abnormal"!==t||(o="corridor",a="clue_storage"===t?"回走廊找封条后的门":"回走廊换个方向看"),"clue_audio"===t){var n=H4.hasClue("clue_radio_key")||H4.state.radio.length;o=n?"radio":"stairs",a=n?"回广播室收好片段":"回旧梯间找广播室"}return"clue_report"===t&&(o="footsteps",a="打开04号声音附件"),{text:r[e],route:o,label:a}};
  const roomRoutes = new Set(["duty","warehouse","storage"]);
  const wrappedRoutes = new Set(["profile","mail","after","record","radio","footsteps",...roomRoutes]);
  const make = (tag,className,html = "") => {
    const node = document.createElement(tag);
    node.className = className;
    node.innerHTML = html;
    return node;
  };
  const link = (href,label) => '<a href="' + t(href) + '">' + t(label) + '</a>';
  const links = items => '<p class="campus-related">' + items.map(([route,label]) => link("#/" + route,label)).join("　") + '</p>';
  const photo = (src,alt,caption) => '<figure class="folio-photo"><img src="assets/' + src + '" alt="' + t(alt) +
    '" loading="lazy"><figcaption>' + t(caption) + '</figcaption></figure>';
  function pending(root,title,kind,object,heading,body,related) {
    root.innerHTML = e.shell(title,'<article class="waiting-record object-waiting waiting-' + kind +
      '"><div class="waiting-object">' + object + '</div><section class="waiting-caption"><h2>' + t(heading) +
      '</h2><p>' + t(body) + '</p><div class="page-links">' + links(related) + '</div></section></article>');
    e.wire(root);
  }
  e.waiting = (root,heading,body,related) => {
    const route = H4.app.curRoute.split("?")[0].slice(2);
    if (route === "rooftop") {
      pending(root,e.labels.rooftop,"roof",photo("locked_roof.webp","挂着锁的天台铁门","门还没有打开。"),heading,body,related);
    } else if (route === "profile") {
      const names = H4.data.NAMES.map(name => '<option>' + t(name) + '</option>').join("");
      pending(root,e.labels.profile,"profile",'<label for="waiting-person">同学名单</label> ' +
        '<select id="waiting-person"><option value="">请选择姓名</option>' + names +
        '</select> <button type="button" class="xp-btn" id="waiting-person-open">打开</button>',
        "选一个名字","纸上对得上的话放在姓名下面，还有些要先去找出处。",[["archive","教室里的纸"],["messages","回留言本"]]);
      root.querySelector("#waiting-person-open").onclick = () => {
        const name = root.querySelector("#waiting-person").value;
        if (H4.data.NAMES.includes(name)) H4.go("#/profile?n=" + encodeURIComponent(name));
        else H4.notice("先选一个名字。");
      };
    } else {
      pending(root,e.labels[route] || heading,"generic","",heading,body,related);
    }
  };

  const personal = H4.app.renderPersonal;
  H4.app.renderPersonal = root => {
    if (H4.state.flags.personalPagePublished) personal(root);
    else pending(root,e.labels.personal,"personal",
      photo("courtyard_memory.webp","外婆家的院子","照片还夹在作文本里。"),
      "这页还没写好","照片和作文暂时各放在原来的地方。",
      [["essays","看《槐花》"],["album","去相册"]]);
  };

  const mail = H4.app.renderMail;
  H4.app.renderMail = root => {
    if (H4.state.cycle === 2 && H4.state.fragments.length >= 7) return mail(root);
    const envelope = '<button type="button" class="sealed-envelope" id="sealed-envelope" aria-label="翻看信封背面" aria-pressed="false">' +
      '<span class="envelope-address">给林杳同学<br><b>照片和信</b></span><span class="envelope-stamp">2004-01-06<br>收到</span>' +
      '<span class="envelope-back-note">封口还粘着。</span></button>';
    pending(root,e.labels.mail,"mail",envelope,"信封还没打开",
      "等七页日记都找回来，再拆信。已找到 " + H4.state.fragments.length + " / 7 页。",
      [["diary","回日记"],["album","回相册"]]);
    const button = root.querySelector("#sealed-envelope");
    button.onclick = () => {
      const back = button.classList.toggle("is-back");
      button.setAttribute("aria-pressed",String(back));
      button.setAttribute("aria-label",back ? "翻回信封正面" : "翻看信封背面");
    };
  };

  function room(root, route) {
    const page = root.querySelector(".room-" + route);
    const image = page.querySelector(".bg-img");
    const object = make("figure","room-object");
    image.classList.remove("bg-img");
    object.append(image);
    page.prepend(object);
    const content = page.querySelector(".room-paper");
    const entries = route === "duty" ?
      [["school?section=services&id=duty","学校的当日轮值表"],["stairs","楼梯检修路线"]] :
      route === "warehouse" ? [["duty","值班桌上的借还单"],["stairs","楼梯间"]] : [["duty","值班桌上的借还单"]];
    content.insertAdjacentHTML("beforeend",links(entries));
  }
  function shape(root,route) {
    if (roomRoutes.has(route) && root.querySelector(".room-" + route)) room(root,route);
    if (route === "profile") {
      const note = root.querySelector(".testimony .source-note");
      if (note) note.textContent = "陈楼记于2004年1月6日。后来问到的话另写在下面，原话照录。";
    }
    if (route === "record") {
      const pages = root.querySelectorAll(".record-original");
      for (const page of pages) {
        const heading = page.querySelector("h2");
        if (!heading) continue;
        const details = make("details","campus-paper-fold","<summary>" + t(heading.textContent) + "</summary>");
        page.before(details);
        details.append(page);
        heading.remove();
      }
    }
    if (route === "radio") {
      const panel = root.querySelector(".radio-panel");
      if (panel) {
        panel.querySelector("header").insertAdjacentHTML("afterend",'<div class="folio-radio-object">' +
          photo("radio_room.webp","广播室的收音机","广播室的收音机") + '</div>');
        const tuning = make("section","folio-radio-tuning");
        panel.querySelector(".folio-radio-object").after(tuning);
        for (const selector of [".radio-dial","#radio-range",".radio-controls","#radio-signal"]) {
          const control = panel.querySelector(selector);
          if (control) tuning.append(control);
        }
      }
    }
    if (route === "footsteps") {
      const page = root.querySelector(".footsteps-page");
      if (page) {
        const controls = make("div","folio-attachment-controls");
        controls.append(...Array.from(page.children).filter(node => !node.matches(".scene-bottom")));
        page.insertAdjacentHTML("afterbegin",photo("attachment_envelope.webp","04号录音的信封","04号录音"));
        page.firstElementChild.classList.add("attachment-object");
        page.append(controls);
      }
    }
  }

  const decorate = e.decorate;
  e.decorate = (root,route,params) => {
    decorate(root,route,params);
    const school = route === "school" || route === "snapshot";
    const scene = H4.Shells.type(route) === "stage";
    document.body.classList.toggle("view-scene",scene);
    if (school) return;
    if (root.firstElementChild?.dataset.campusPage === location.hash) return;
    root.classList.add("folio-route");

    if (!scene && wrappedRoutes.has(route) && !root.querySelector(".portal-page")) {
      const content = [...root.children].filter(node => !node.matches(".campus-return"));
      root.innerHTML = e.shell(e.labels[route],"");
      const panel = root.querySelector(".portal-content");
      panel.append(...content);
      for (const heading of panel.querySelectorAll("h1")) {
        heading.replaceWith(make("h2",heading.className,t(heading.textContent)));
      }
    }
    shape(root,route);
    H4.Edition2003.archive(root,route,params);
    e.wire(root);
    if (root.firstElementChild) root.firstElementChild.dataset.campusPage = location.hash;
  };
  H4.MaterialViewsLoaded = true;
})();
