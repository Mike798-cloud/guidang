(() => {
  "use strict";
  const portal = H4.Portal;
  const schoolPages = {
    home:"index.htm", building:"building/index.htm", notices:"notice/list.htm",
    news:"news/list.htm", article:"read.htm", board:"board/index.htm",
    staff:"office/list.htm", services:"service/index.htm", search:"search.htm",
    map:"map.htm", links:"links.htm", missing:"error.htm", mailbox:"mail.htm"
  };
  const oldPages = {
    "index.htm":"home", "catalog.htm":"directory", "read.htm":"item", "capture.htm":"versions",
    "20031114/index.htm":"snapshot", "search.htm":"search", "updates.htm":"updates", "about.htm":"about",
    "papers/index.htm":"archive", "tapes/index.htm":"radio", "attachments/04.htm":"footsteps",
    "users/feiyao.htm":"messages", "interviews/read.htm":"profile", "incoming/envelope.htm":"mail",
    "retained/linyao.htm":"personal", "incoming/reply.htm":"after", "public/record.htm":"record",
    "session/end.htm":"ending"
  };
  const originalSource = H4.source;
  H4.source = id => {
    if (id !== "o_duty" && id !== "o_roster") return originalSource(id);
    const table = H4.Site03?.[id.slice(2)];
    if (!table) {
      const saved = H4.state.flags.originalSources?.[id];
      return typeof saved?.content === "string" ? {...saved,sub:"校园网 · 2003-11-14"} : null;
    }
    return {
      id, title:table.title, sub:"校园网 · 2003-11-14",
      content:table.meta + "\n" + table.head.join("　") + "\n" +
        table.rows.map(row => row.map(value => value || "（空白）").join("　")).join("\n") +
        "\n\n" + table.note
    };
  };
  const mainAddress = portal.addr;
  portal.addr = (route, params) => {
    if (route !== "snapshot" && route !== "school") return mainAddress(route, params);
    const section = route === "snapshot" ? "home" : params.get("section") || "home";
    const query = new URLSearchParams(params);
    query.delete("section");
    const file = Object.hasOwn(schoolPages, section) ? schoolPages[section] : schoolPages.missing;
    return portal.schoolRoot + file + (query.size ? "?" + query.toString() : "");
  };
  function resolve(input) {
    const question = input.trim().indexOf("?");
    const raw = question < 0 ? input.trim() : input.trim().slice(0,question);
    const query = question < 0 ? "" : input.trim().slice(question + 1);
    const host = portal.schoolRoot.replace(/^https?:\/\//, "");
    const path = raw.replace(/^https?:\/\//i,"");
    const truth = file => Object.keys(portal.paths).find(key => portal.paths[key] === file);
    const hash = route => "#/" + route + (query ? "?" + query : "");
    if (path === host.slice(0,-1) || path === host) return hash("snapshot");
    if (path.startsWith(host)) {
      const file = path.slice(host.length);
      const route = truth(file);
      if (route) return hash(route);
      const section = Object.keys(schoolPages).find(key => schoolPages[key] === file) || "missing";
      if (section === "home") return hash("snapshot");
      const params = new URLSearchParams(query);
      params.set("section", section);
      return "#/school?" + params.toString();
    }
    // Older bookmarks are accepted, but the address bar displays only the current school address.
    const legacyScene = raw.match(/^file:\/\/\/C:\/old4\/views\/(corridor|stairs|rooftop|basement)\.htm$/i);
    if (legacyScene) return hash(legacyScene[1].toLowerCase());
    const oldPath = path.replace(/^archive\.local\//i,"");
    if (oldPath === "connect.htm" || oldPath === "/connect.htm") return hash("boot");
    if (/^\/?old4\//.test(oldPath)) {
      const file = oldPath.replace(/^\/?old4\//,"");
      return hash((Object.hasOwn(oldPages,file) && oldPages[file]) || truth(file) || "missing");
    }
    return "#/missing";
  }
  portal.updateAddress = () => {
    const address = new URL(H4.$("#address").value);
    H4.$("#address-host").textContent = address.host;
    H4.$("#address-path").textContent = address.pathname + address.search;
    document.body.classList.remove("editing-address");
    const button = H4.$("#address-edit");
    button.setAttribute("aria-expanded","false");
    button.textContent = "编辑";
  };

  portal.loadOriginal = () => {
    if (H4.Site03) return Promise.resolve();
    if (!portal._originalLoading) portal._originalLoading = new Promise((done, fail) => {
      const script = document.createElement("script");
      script.src = "js/site2003.js?v=35.0.0";
      const failed = () => {
        script.remove();
        fail(new Error("校园网页没加载完"));
      };
      script.onload = () => H4.Site03 ? done() : failed();
      script.onerror = failed;
      document.head.append(script);
    }).catch(error => {
      portal._originalLoading = null;
      throw error;
    });
    return portal._originalLoading;
  };
  function schoolStyle() {
    if (H4.$("#site03-css")) return portal._schoolStyle;
    portal._schoolStyle = new Promise((done, fail) => {
      const style = document.createElement("link");
      style.id = "site03-css";
      style.rel = "stylesheet";
      style.href = "css/site2003.css?v=9.0.0";
      style.onload = done;
      style.onerror = () => {
        style.remove();
        fail(new Error("校园网页样式没加载完"));
      };
      document.head.insertBefore(style,H4.$("#era2003-style"));
    });
    return portal._schoolStyle;
  }
  function showSchool(root, params, isHome) {
    const hash = location.hash;
    root.innerHTML = '<div class="original-loading"><h1>正在打开校园网…</h1><a href="#/home">返回首页</a></div>';
    Promise.all([portal.loadOriginal(),schoolStyle()]).then(() => {
      if (location.hash !== hash) return;
      H4.$("#site03-css").disabled = false;
      H4.Site03.render(root,params,isHome);
    }).catch(() => {
      if (location.hash !== hash) return;
      root.innerHTML = '<div class="original-loading"><h1>校园网页没加载完</h1><p>可以重试，或返回首页。</p>' +
        '<button type="button" class="xp-btn" id="original-retry">重新读取</button> <a href="#/home">返回首页</a></div>';
      H4.$("#original-retry").onclick = () => showSchool(root,params,isHome);
    });
  }
  portal.routes.snapshot = (root,params) => showSchool(root,params,true);
  portal.routes.school = (root,params) => showSchool(root,params,false);

  portal.bindTools = root => root.querySelectorAll("[data-local-tool]").forEach(button => {
    const actions = {notebook:() => H4.app.notebook(), endings:() => H4.Endings.library(),
      source:() => H4.$("#menu-page-source").click()};
    button.type = "button";
    button.onclick = actions[button.dataset.localTool];
  });
  const index = portal.index;
  portal.index = () => index().concat((H4.Site03?.records() || []).filter(row => !row.originalOnly).map(row =>
    ({title:row.title,text:row.text,sub:"校园网 / " + row.kind + " / " + row.date,url:row.url})));
  portal.routes.search = (root, params) => {
    if (H4.Site03 || !params.get("q")?.trim()) return portal.search(root,params);
    const hash = location.hash;
    root.innerHTML = portal.shell("站内搜索", "<p>正在打开学校栏目…</p>");
    const render = unavailable => {
      if (location.hash !== hash) return;
      portal.search(root,params,unavailable);
      portal.decorate(root,"search",params);
    };
    portal.loadOriginal().then(() => render(false),() => render(true));
  };

  const decorate = portal.decorate;
  portal.decorate = (root,route,params) => {
    const school = route === "snapshot" || route === "school";
    H4.Shells.scroll().scrollTop = 0;
    document.body.classList.toggle("view-original",school);
    const style = H4.$("#site03-css");
    if (style) style.disabled = !school;
    if (school) {
      root.dataset.route = route;
      H4.$("#address").value = portal.addr(route,params);
      H4.$("#title-text").textContent = "槐岭中学校园网";
    } else {
      decorate(root,route,params);
    }
    portal.updateAddress();
    portal.bindTools(root);
  };

  H4.app.status = () => {
    H4.$("#status").textContent = H4.storageFailed ? "此浏览器无法保存进度" : "完毕";
    H4.app.updateAudioStatus();
    H4.Homepage.status();
  };
  const layout = portal.layout;
  portal.layout = () => {
    layout();
    const scale = document.documentElement.style.getPropertyValue("--reading");
    document.documentElement.dataset.readingSize = String(Math.round(100 * Number(scale)) || 100);
  };
  window.addEventListener("DOMContentLoaded", () => {
    const tools = H4.$("#menu-tools");
    const summary = tools.querySelector("summary");
    H4.$("#tool-page-source").onclick = () => {
      tools.open = false;
      summary.focus();
      H4.$("#menu-page-source").onclick();
    };
    tools.onkeydown = event => {
      if (event.key !== "Escape" || !tools.open) return;
      event.preventDefault();
      event.stopPropagation();
      tools.open = false;
      summary.focus();
    };
    document.addEventListener("click", event => {
      if (tools.open && !event.target.closest?.("#menu-tools")) tools.open = false;
    });
    window.addEventListener("hashchange", () => { tools.open = false; });
    H4.$("#menu-source").hidden = true;
    H4.$("#menu-page-source").hidden = true;
    H4.$("#status").setAttribute("aria-live","polite");
    const address = H4.$("#address");
    address.onkeydown = event => {
      if (event.key === "Enter") H4.go(resolve(address.value));
    };
    H4.$("#address-edit").onclick = function() {
      const editing = !document.body.classList.contains("editing-address");
      document.body.classList.toggle("editing-address", editing);
      this.setAttribute("aria-expanded",String(editing));
      this.textContent = editing ? "收起" : "编辑";
      if (editing) {
        address.focus();
        address.select();
      } else address.blur();
    };
    portal.updateAddress();
  });
})();
!function(){"use strict";window.addEventListener("DOMContentLoaded",function(){var e=H4.Portal,t=H4.$("#titlebar"),n=(H4.$("#menubar"),document.createElement("details"));n.id="mobile-more",n.innerHTML='<summary aria-label="本机浏览菜单">⋯</summary><div id="mobile-tools-menu"></div>',t.append(n);var o=n.querySelector("div"),a=["menu-back","menu-home","menu-settings"].map(function(e){var t=H4.$("#"+e),n=document.createComment(e);return t.before(n),{node:t,anchor:n}});o.insertAdjacentHTML("beforeend",'<button data-local-tool="notebook">摘录夹</button><button data-local-tool="endings">浏览记录</button><a href="#/about">关于本站</a><button data-window-action="cover">返回封面</button><button data-window-action="close">结束本次浏览</button>'),e.bindTools(o),o.querySelector('[data-window-action="cover"]').onclick=function(){H4.$("#btn-min").onclick()},o.querySelector('[data-window-action="close"]').onclick=function(){H4.$("#btn-close").onclick()};var r=matchMedia("(max-width:720px)"),i=function(){a.forEach(function(e){r.matches?"menu-back"===e.node.id?(t.prepend(e.node),e.node.textContent="←",e.node.setAttribute("aria-label","返回上一页")):o.prepend(e.node):(e.anchor.after(e.node),"menu-back"===e.node.id&&(e.node.textContent="返回",e.node.removeAttribute("aria-label")))}),r.matches||(n.open=!1)};i(),r.addEventListener("change",i),window.addEventListener("hashchange",function(){n.open=!1});var s=document.createElement("span");s.id="reading-position",s.hidden=!0,s.setAttribute("aria-live","off"),H4.$("#statusbar").insertBefore(s,H4.$(".browser-audio"));var d=H4.$("#screen-wrap"),doc=H4.$("#doc-scroll"),l=H4.$("#screen"),c=0,u=function(){c=0;var d=H4.Shells.scroll(),e=d.clientHeight,t=d.scrollHeight;if(e&&(s.hidden=t<=2*e,!s.hidden)){var n=Math.ceil(t/e),o=Math.min(n,Math.floor(d.scrollTop/e)+1);t-e-d.scrollTop<4&&(o=n),s.textContent=o+" / "+n,s.setAttribute("aria-label","当前约第"+o+"屏，共"+n+"屏")}},m=function(){c||(c=requestAnimationFrame(u))};[d,doc].forEach(function(view){view.addEventListener("scroll",m,{passive:!0}),new ResizeObserver(m).observe(view)}),new ResizeObserver(m).observe(l),document.fonts.ready.then(m),m()})}(),function(){var e=H4.app.notebook;H4.app.notebook=function(){e();var t=H4.$(".notebook"),n=H4.state.flags.originalNotes;if(t&&n){var o=["roster","duty"].filter(function(e){return"string"==typeof n[e]&&n[e].trim()});if(o.length){var a=document.createElement("section");a.className="reader-notes",a.innerHTML="<h3>页边笔记</h3><p>这些是你记的笔记，原表照旧。</p>"+o.map(function(e){return"<h4>"+H4.esc("roster"===e?"旧楼值日组名册":"当日轮值登记")+'</h4><p class="document-text">'+H4.esc(n[e])+"</p>"}).join(""),t.append(a)}}}}(),function(){
  "use strict";
  const portal=H4.Portal;
  const renderRoute=H4.app.route;
  const requests=new Map();
  const scripts=new Map();
  let styleRequest;
  let routeRequest=0;
  const ready=new Set();
  const photos=new Set();
  const controllers={corridor:"corridor",stairs:"stairs",basement:"stairs",
    archive:"archive",radio:"radio",footsteps:"footsteps"};
  const aftermathRoutes = new Set(["after","ending","personal","record","updates"]);
  const schoolRoutes=/^(snapshot|school|notices|news|article|board|staff|services|links|map|building|mailbox|read\.htm|search\.htm)$/;

  function script(url, verify) {
    if(scripts.has(url))return scripts.get(url);
    const request=new Promise((resolve,reject)=>{
      const node=document.createElement("script");
      node.src=url;
      const fail=()=>{node.remove();reject(new Error("这页没加载完"));};
      node.onload=()=>{if(verify())resolve();else fail();};
      node.onerror=fail;
      document.head.append(node);
    }).catch(error=>{scripts.delete(url);throw error;});
    scripts.set(url,request);
    return request;
  }

  function loadController(id) {
    if(ready.has(id))return Promise.resolve();
    if(requests.has(id))return requests.get(id);
    const loading=script("js/g_"+id+".js?v=35.0.0",()=>!!H4.G[id]).then(()=>{
      if(id==="archive")portal.installArchiveHooks();
      ready.add(id);
    }).finally(()=>requests.delete(id));
    requests.set(id,loading);
    return loading;
  }

  function preloadPhoto(route) {
    let file;
    if(route==="corridor")file="assets/corridor_"+H4.state.corridor.seg+".webp";
    else if(route==="stairs")file=H4.data.STAIR_FLOORS[H4.state.floor]?.image;
    else if(route==="rooftop")file=H4.hasClue("clue_rooftop_key")?"assets/rooftop.webp":"assets/locked_roof.webp";
    if(!file||photos.has(file))return;
    photos.add(file);
    const hint=document.createElement("link");
    hint.rel="preload";hint.as="image";hint.href=file;
    document.head.append(hint);
  }

  function loadMaterialStyle(){
    if(portal.materialStyleReady)return Promise.resolve();
    if(styleRequest)return styleRequest;
    styleRequest=new Promise((resolve,reject)=>{
      const node=document.createElement("link");
      node.id="material-view-style";node.rel="stylesheet";node.href="css/material_views.css?v=7.0.0";
      node.onload=()=>{portal.materialStyleReady=true;resolve();};
      node.onerror=()=>{node.remove();reject(new Error("这页没加载完"));};
      document.head.insertBefore(node,H4.$("#era2003-style"));
    }).finally(()=>{styleRequest=null;});
    return styleRequest;
  }

  portal.loadMaterials=function(){
    if(portal.materialsReady)return Promise.resolve();
    if(portal.materialsLoading)return portal.materialsLoading;
    const content=H4.MaterialViewsLoaded?Promise.resolve():
      (H4.app.renderPersonal?Promise.resolve():script("js/personal.js?v=35.0.0",()=>!!H4.app.renderPersonal))
        .then(()=>script("js/material_views.js?v=35.0.0",()=>!!H4.MaterialViewsLoaded));
    portal.materialsLoading=Promise.all([content,loadMaterialStyle()]).then(()=>{
      portal.materialsReady=true;
    }).finally(()=>{portal.materialsLoading=null;});
    return portal.materialsLoading;
  };

  H4.app.route=function(){
    const request=++routeRequest;
    const hash=location.hash||"#/boot";
    const isCurrent=()=>routeRequest===request&&(location.hash||"#/boot")===hash;
    const route=hash.split("?")[0].slice(2);
    const materialNeeded=!H4.Homepage.has(route)&&!schoolRoutes.test(route)&&!portal.materialsReady;
    const id=controllers[route];
    const controllerNeeded=Object.hasOwn(controllers,route)&&!ready.has(id);
    const notesNeeded=route==="scene-notes"&&!H4.EditionNotes;
    const aftermathNeeded=aftermathRoutes.has(route)&&!H4.Aftermath;
    const editionNeeded=!H4.Homepage.has(route)&&!H4.Edition2003;
    preloadPhoto(route);
    if(!materialNeeded&&!controllerNeeded&&!notesNeeded&&!aftermathNeeded&&!editionNeeded){renderRoute.call(this);return;}
    this.clear();
    H4.$("#loader-mask").classList.add("show");
    Promise.all([
      materialNeeded?portal.loadMaterials():null,
      controllerNeeded?loadController(id):null,
      notesNeeded?script("js/edition_notes.js?v=35.0.0",()=>!!H4.EditionNotes):null,
      aftermathNeeded?script("js/aftermath.js?v=35.0.0",()=>!!H4.Aftermath):null,
      editionNeeded?script("js/edition2003.js?v=35.0.0",()=>!!H4.Edition2003):null
    ]).then(()=>{
      if(isCurrent())renderRoute.call(this);
    }).catch(()=>{
      if(!isCurrent())return;
      H4.$("#loader-mask").classList.remove("show");
      H4.Shells.mount("missing");
      H4.$("#screen").innerHTML='<div class="recovery"><h2>这页没加载完</h2><p>本机进度仍在，可以重新读取。</p><button class="xp-btn" id="material-retry">重新读取</button><a href="#/boot">返回封面</a></div>';
      const retry=H4.$("#material-retry");
      retry.onclick=()=>this.route();
      retry.focus();
    });
  };
}();
