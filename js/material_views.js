(() => {
  "use strict";
  var e=H4.Portal,t=H4.esc,r={"张耀主":"他在《共同说明》上签了名。先去教室翻那份纸，再来看他怎么说。","小子":"检讨书上也写着「小子」。先去教室看看那份检讨书。","清东":"他提到了钥匙编号。先去教室整理那十二份材料，借还单也在里面。","刘楼":"先把教室里的十二份材料整理好，再来看他在楼梯口见过什么。","萧神":"点歌登记在教室里。先整理那十二份材料，回来就能看他怎么解释。","王京":"从楼梯间能到后勤仓库。先去找王京的交班单，再来看他说的门锁。","张耀兰":"封条后面的门还没看过。回走廊找那页签字，借还登记要留着一同核对。","张纪兰":"先整理教室里的十二份材料，再来看她记得的那本作业本。","于祯":"先整理教室里的十二份材料，再对照他签过的那张纸和他后来讲的话。","张耀王":"他说四楼还有一道门。回四楼走廊，回头看看。","豆庵":"广播的频率记在点歌本上。先收好六段录音，再来对照他记得的声音。","张锦兰":"04号封袋里还有一份写到护栏的材料。先去听录音、拆开封袋。","陈楼":"陈楼也在那张名单上。这是他自己说的。点歌本上记了六个频率。收齐那六段录音，再来看陈楼怎么说。"};H4.app.profileGuide=function(e){var t=H4.data.PROFILES[e].unlock,o="archive",a="去教室翻原件";if("clue_testimony"===t&&(a="回教室整理材料"),"clue_warehouse"===t&&(o="stairs",a="回楼梯间，找后勤仓库"),"clue_storage"!==t&&"clue_abnormal"!==t||(o="corridor",a="clue_storage"===t?"回走廊找封条后的门":"回走廊换个方向看"),"clue_audio"===t){var n=H4.hasClue("clue_radio_key")||H4.state.radio.length;o=n?"radio":"stairs",a=n?"回广播室收好片段":"回楼梯间，找广播室"}return"clue_report"===t&&(o="footsteps",a="去听04号录音"),{text:r[e],route:o,label:a}};
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
        "选一个名字","点名字看他怎么说。有的要先找到相应的材料。",[["archive","教室里的纸"],["messages","回留言本"]]);
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
      if (note) note.textContent = "陈楼记，2004年1月6日。后来问的几句也抄在下面。";
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
