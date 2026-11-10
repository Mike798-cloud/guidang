(() => {
  "use strict";

  const routes = {
    corridor: "stage", stairs: "stage", rooftop: "stage", basement: "stage",
    duty: "stage", warehouse: "stage", storage: "stage",
    archive: "stage", radio: "stage", footsteps: "stage",
    snapshot: "window", school: "window",
    boot: "doc", home: "doc", "about-me": "doc", album: "doc", essays: "doc",
    diary: "doc", broadcast: "doc", messages: "doc", friends: "doc",
    directory: "doc", item: "doc", versions: "doc", search: "doc", updates: "doc",
    about: "doc", profile: "doc", mail: "doc", personal: "doc", after: "doc",
    record: "doc", ending: "doc", missing: "doc", "scene-notes": "doc"
  };

  function scroll() {
    return H4.$(document.body.dataset.shell === "window" ? "#screen-wrap" : "#doc-scroll");
  }

  function mount(route) {
    const type = routes[route] || "doc";
    const screen = H4.$("#screen");
    const browser = H4.$("#viewport");
    const stage = H4.$("#stage-shell");
    const doc = H4.$("#doc-scroll");
    const windowBody = H4.$("#screen-wrap");
    const stageActive = type === "stage";
    const host = stageActive ? stage : type === "window" ? windowBody : doc;
    const previous = document.body.dataset.shell;
    const previousScene = screen.dataset.scene;
    document.body.dataset.stageEnter = stageActive && previous === "stage" && previousScene && previousScene !== route ? "black" : "";
    document.body.dataset.shell = type;
    document.body.dataset.shellFrom = previous && previous !== type ? previous : "";
    if (screen.parentElement !== host) host.append(screen);
    stage.hidden = !stageActive;
    browser.hidden = stageActive;
    doc.hidden = type !== "doc";
    windowBody.hidden = type !== "window";
    browser.classList.toggle("window-shell", type === "window");
    browser.classList.toggle("doc-shell", type === "doc");
    screen.dataset.shell = type;
    screen.removeAttribute("data-scene");
    if (stageActive) {
      doc.style.removeProperty("--stage-paper-x");
      doc.style.removeProperty("--stage-paper-y");
    } else host.scrollTop = 0;
  }

  H4.Shells = {mount, scroll, type: route => routes[route] || "doc"};

  function element(tag, className, label) {
    const node = document.createElement(tag);
    node.className = className;
    if (label) node.textContent = label;
    return node;
  }

  function button(label, action) {
    const node = element("button", "stage-action", label);
    node.type = "button";
    node.onclick = action;
    return node;
  }

  function hotspot(node, x, y, label, kind = "point") {
    if (!node) return;
    node.classList.add("stage-hot");
    node.style.setProperty("--spot-x", String(x / 100));
    node.style.setProperty("--spot-y", String(y / 100));
    node.dataset.spotLabel = label;
    node.dataset.hotKind = kind;
    node.setAttribute("aria-label", label);
    node.setAttribute("aria-pressed","false");
  }

  const imageGrade = {
    corridor_1:1.62, corridor_2:1.20, corridor_3:1.73,
    corridor_back:2.46, corridor_closed:1.09, corridor_reflection:2.28,
    stairs_2:1.25, stairs_3:1.13, stairs_4:1.20, classroom:1.28, classroom_chair:1.18,
    radio_room:1.65, storage_room:1.49, warehouse:1.77, basement:1.42,
    rooftop:2.57, duty_desk:1.02, locked_roof:0.95, attachment_envelope:0.77
  };
  const focusByScene = {
    corridor:.51, stairs:.52, duty:.34, radio:.62, basement:.52, warehouse:.50,
    storage:.45, archive:.50, rooftop:.50, footsteps:.50
  };
  const photoKey = src => src.split(/[?#]/)[0].split("/").pop().replace(/\.\w+$/, "");
  const paperImage = key => key === "locked_roof" || key === "attachment_envelope";
  const darkScenes = new Set(["archive","radio","basement","storage"]);
  const autoGrades = new Map();
  const targets = {lightbox:82,paper:150,monitor:96};
  const warnedFocus = new Set();
  const portrait = "(max-width: 900px) and (orientation: portrait)";

  function exposure(image, world) {
    const src = image.currentSrc || image.src || "";
    const key = photoKey(src);
    if (Object.hasOwn(imageGrade,key)) return imageGrade[key];
    if (!image.complete || !image.naturalWidth) return 1.3;
    const contrast = parseFloat(getComputedStyle(world).getPropertyValue?.("--grade-c")) || 1.25;
    const target = targets[world.dataset.mode] ?? targets.lightbox;
    const cacheKey = target + " " + contrast + " " + src;
    if (autoGrades.has(cacheKey)) return autoGrades.get(cacheKey);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 48;
      const context = canvas.getContext("2d");
      context.drawImage(image,0,0,48,48);
      const pixels = context.getImageData(0,0,48,48).data;
      const tones = [];
      let sum=0, squares=0;
      for (let i=0; i<pixels.length; i+=4) {
        if (!pixels[i+3]) continue;
        const luma = .2126*pixels[i] + .7152*pixels[i+1] + .0722*pixels[i+2];
        sum += luma;
        squares += luma*luma;
        tones.push(Math.max(0,Math.min(255,(luma-127.5)*contrast+127.5)));
      }
      if (!tones.length || squares/tones.length-(sum/tones.length)**2 < 4) return 1.3;
      let low=.5, high=3.8;
      for (let pass=0; pass<10; pass++) {
        const gain=(low+high)/2;
        const mean=tones.reduce((sum,tone)=>sum+Math.min(255,tone*gain),0)/tones.length;
        if (mean<target) low=gain;
        else high=gain;
      }
      const gain = (low+high)/2;
      autoGrades.set(cacheKey,gain);
      return gain;
    } catch {
      // A canvas can be unavailable or unreadable for a cross-origin photograph.
      return 1.3;
    }
  }

  function fitPicture(world, matte, image) {
    const key = photoKey(image.currentSrc || image.src || "");
    const scene = world.dataset.scene;
    const requestedFocus = focusByScene[scene] ?? .5;
    if ((requestedFocus < .3 || requestedFocus > .7 || !Number.isFinite(requestedFocus))
        && !warnedFocus.has(scene)) {
      warnedFocus.add(scene);
      console.warn("场景裁切焦点需复核", scene, requestedFocus);
    }
    const focus = Number.isFinite(requestedFocus) ? Math.max(.3,Math.min(.7,requestedFocus)) : .5;
    const focusY = key === "locked_roof" ? .38 : .5;
    const brightness = String(exposure(image,world));
    image.style.setProperty("--grade-l", brightness);
    world.style.setProperty("--grade-l", brightness);
    world.style.setProperty("--art-focus", focus * 100 + "%");
    world.style.setProperty("--art-focus-y", focusY * 100 + "%");
    world.classList.toggle("stage-paper-image",paperImage(key));
    const cover = world.dataset.mode !== "monitor" && matchMedia(portrait).matches;
    world.dataset.fit = cover ? "cover" : "contain";
    const width = image.naturalWidth || Number(image.getAttribute("width"));
    const height = image.naturalHeight || Number(image.getAttribute("height"));
    const fallback = world.dataset.mode === "monitor" ? 3/2 : 4/3;
    const ratio = width && height ? width / height : fallback;
    world.style.setProperty("--art-ar", String(ratio));
    const w = matte.clientWidth;
    const h = matte.clientHeight;
    if (!w || !h) return;
    // Use the browser's contain/cover geometry for the painted image and the controls on it.
    const artWidth = cover ? Math.max(w,h*ratio) : Math.min(w,h*ratio);
    const artHeight = artWidth/ratio;
    world.style.setProperty("--art-left", ((w-artWidth)*(cover?focus:.5)) + "px");
    world.style.setProperty("--art-top", ((h-artHeight)*(cover?focusY:.5)) + "px");
    world.style.setProperty("--art-width", artWidth + "px");
    world.style.setProperty("--art-height", artHeight + "px");
  }

  const artworkRequests = new WeakMap();
  let retrySerial = 0;
  function retryURL(src) {
    const [path, fragment] = src.split("#", 2);
    const [file, query] = path.split("?", 2);
    const params = new URLSearchParams(query);
    params.set("image-retry", Date.now() + "-" + ++retrySerial);
    return file + "?" + params + (fragment ? "#" + fragment : "");
  }

  function compose(root, page, spec) {
    const world = element("section", "stage-world");
    world.dataset.scene = spec.route;
    world.dataset.mode = spec.mode || "lightbox";
    if (darkScenes.has(spec.route)) world.classList.add("stage-low-light");
    const matte = element("div", "stage-matte");
    const picture = element("div", "stage-picture");
    const art = spec.art;
    const request = {source:art.getAttribute("src"), retries:new Map()};
    artworkRequests.set(art,request);
    art.classList.remove("bg-img");
    art.classList.add("stage-image");
    const shadow = element("div", "stage-shade");
    const air = element("div", "stage-air");
    const light = element("div", "stage-light");
    const texture = element("div", "stage-texture");
    air.append(light, texture);
    if (spec.weather) air.append(element("div", "stage-weather"));
    const spots = element("div", "stage-spots");
    const entities = element("div", "stage-entities");
    entities.append(...(spec.entities || []));
    spots.append(...(spec.spots || []));
    picture.append(art, shadow, air, entities, spots);
    const title = element("h1", "stage-title", spec.title);
    title.setAttribute("tabindex","-1");
    const artStatus = element("div", "stage-art-status");
    artStatus.id = "stage-art-status";
    const artMessage = element("p", "stage-art-message");
    artMessage.id = "stage-art-message";
    artMessage.setAttribute("role","status");
    const retry = button("重新读取", () => {
      if (artStatus.dataset.state !== "failed") return;
      const src = art.getAttribute("src");
      if (!src) return;
      artStatus.dataset.state = "loading";
      retry.setAttribute("aria-disabled","true");
      artMessage.textContent = "正在重新读取画面……";
      const retrySource = retryURL(src);
      request.retries.set(request.source,retrySource);
      art.src = retrySource;
    });
    retry.hidden = true;
    artStatus.append(artMessage, retry);
    matte.append(picture, artStatus);
    const refit = () => fitPicture(world, matte, art);
    const geometry = new ResizeObserver(refit);
    geometry.observe(matte);
    const failed = () => {
      if (artStatus.dataset.state === "failed") return;
      const retried = artStatus.dataset.state === "loading";
      picture.classList.add("stage-art-missing");
      artStatus.dataset.state = "failed";
      artMessage.textContent = retried ? "重新读取失败。可以再试一次，或返回。"
        : "“" + spec.title + "”的画面没能打开。可以重新读取，或返回。";
      title.setAttribute("aria-describedby",artMessage.id);
      retry.hidden = false;
      retry.removeAttribute("aria-disabled");
    };
    const loaded = () => {
      picture.classList.remove("stage-art-missing");
      artStatus.removeAttribute("data-state");
      artMessage.textContent = "";
      title.removeAttribute("aria-describedby");
      if (document.activeElement === retry) title.focus({preventScroll:true});
      retry.hidden = true;
      retry.removeAttribute("aria-disabled");
      refit();
    };
    art.addEventListener("error", failed);
    art.addEventListener("load", loaded);
    H4.onLeave(() => {
      geometry.disconnect();
      art.removeEventListener("error", failed);
      art.removeEventListener("load", loaded);
    });
    refit();

    const top = element("header", "stage-head");
    const skip = element("a","stage-skip","跳到场景");
    skip.href = "#stage-content";
    matte.id = "stage-content";
    matte.setAttribute("tabindex","-1");
    const previous = button("返回", () => {
      const back = H4.$("#menu-back");
      if (back && !back.disabled) back.click();
      else H4.go(spec.exit || "#/home");
    });
    const settings = button("设置", () => {
      H4.app.settings();
      if (!spec.setting) return;
      const sync = () => {
        toggle.textContent = spec.setting.textContent;
        toggle.setAttribute("aria-pressed", spec.setting.getAttribute("aria-pressed") || "false");
      };
      const toggle = button("", () => { spec.setting.click(); sync(); });
      toggle.className = "xp-btn stage-setting";
      sync();
      H4.$("#modal-root .xp-modal-body")?.append(toggle);
    });
    const notes = button("附记", () => {
      rememberOrigin(notes);
      H4.go("#/scene-notes?from=" + spec.route);
    });
    if (!spec.notes) notes.hidden = true;
    const available = spec.spots || [];
    const seen = new WeakSet();
    const objects = button("", () => showObjects());
    objects.classList.add("stage-object-count");
    objects.title = "找物件";
    function updateCount() {
      let count = 0;
      for (const spot of available) {
        spot.classList.toggle("stage-hot", !spot.hidden);
        if (spot.hidden) spot.setAttribute("aria-hidden", "true");
        else {
          spot.removeAttribute("aria-hidden");
          count++;
        }
      }
      objects.textContent = String(count);
      objects.setAttribute("aria-label", "找物件，共 " + count + " 处");
      objects.hidden = count === 0;
    }
    updateCount();
    const spotVisibility = new MutationObserver(updateCount);
    for (const spot of available) {
      spotVisibility.observe(spot,{attributes:true,attributeFilter:["hidden"]});
      spot.addEventListener("click", () => {
        seen.add(spot);
        spot.setAttribute("aria-pressed","true");
        spot.setAttribute("aria-label",spot.dataset.spotLabel+"，已看过");
      });
    }
    H4.onLeave(() => spotVisibility.disconnect());
    const tools = element("nav", "stage-tools");
    const journal = button("摘录夹", () => H4.app.notebook());
    tools.setAttribute("aria-label", "现场工具");
    tools.append(objects, notes, journal, settings);
    top.append(previous, title, tools);

    const hud = element("div", "stage-hud");
    const live = element("div", "stage-feedback");
    const actions = element("div", "stage-actions");
    live.setAttribute("aria-live","polite");
    live.setAttribute("aria-atomic","false");
    live.append(...(spec.feedback || []));
    actions.append(...(spec.actions || []));
    hud.append(actions);
    const side = element("aside", "stage-side");
    side.setAttribute("aria-hidden","true");
    side.append(element("span", "stage-side-site", "槐岭中学 · 旧楼"), element("b", "", spec.title));
    const sideSegment = element("span", "stage-side-segment");
    side.append(sideSegment);
    const segment = live.querySelector("#corr-distance") || live.querySelector("#floor-label");
    if (segment) {
      const update = () => { sideSegment.textContent = segment.textContent; };
      update();
      const observer = new MutationObserver(update);
      observer.observe(segment,{childList:true,subtree:true,characterData:true});
      H4.onLeave(() => observer.disconnect());
    }
    const eventLayer = element("div", "stage-event");
    eventLayer.append(...(spec.events || []));

    const panel = element("section", "stage-panel");
    panel.hidden = true;
    const modalPanel = world.dataset.mode !== "monitor";
    panel.setAttribute("aria-labelledby","stage-panel-heading");
    if (modalPanel) {
      panel.setAttribute("role","dialog");
      panel.setAttribute("aria-modal","true");
    }
    panel.id = "stage-inspector";
    const panelHead = element("header", "stage-panel-head");
    const panelTitle = element("h2", "stage-panel-title");
    panelTitle.id = "stage-panel-heading";
    const close = button("合上", () => hidePanel());
    const panelBody = element("div", "stage-panel-body");
    panelHead.append(panelTitle, close);
    panel.append(panelHead, panelBody);

    // Keep native controls mounted so their IDs, listeners and live state stay intact.
    const native = element("div", "stage-native");
    native.hidden = true;
    if (spec.intro) native.append(element("p","stage-panel-intro",spec.intro));
    if (spec.content) native.append(spec.content);
    panelBody.append(native);
    const temporary = element("div", "stage-inspection");
    panelBody.append(temporary);
    let returnFocus = null;
    // The monitor panel is non-modal, so its artwork status stays available to readers.
    const backgrounds = modalPanel ? [matte,hud,top,skip,live,eventLayer] : [picture,hud,live];

    function setBackground(open) {
      for (const part of backgrounds) {
        part.inert = open;
        if (open) {
          part.setAttribute("aria-hidden","true");
          part.setAttribute("inert","");
        } else {
          part.removeAttribute("aria-hidden");
          part.removeAttribute("inert");
        }
      }
    }

    skip.onclick = event => {
      event.preventDefault();
      const doorChoice = eventLayer.querySelector(".corr-door-mask:not([hidden]) button");
      const target = !panel.hidden ? close : doorChoice || available.find(spot => !spot.hidden) || matte;
      target.focus({preventScroll:true});
    };

    function openPanel(label, source, content) {
      returnFocus = source || returnFocus;
      panelTitle.textContent = label;
      panel.dataset.size = content ? "short" : (spec.panelSize || "medium");
      temporary.replaceChildren(...(content || []));
      temporary.hidden = !content;
      native.hidden = !!content;
      panel.hidden = false;
      world.dataset.panelOpen = "true";
      returnFocus?.setAttribute("aria-expanded","true");
      returnFocus?.setAttribute("aria-controls",panel.id);
      panelBody.scrollTop = 0;
      close.focus({preventScroll:true});
      setBackground(true);
    }

    function hidePanel() {
      panel.hidden = true;
      world.removeAttribute("data-panel-open");
      setBackground(false);
      returnFocus?.setAttribute("aria-expanded","false");
      returnFocus?.focus({preventScroll:true});
      returnFocus = null;
    }

    function showObjects() {
      const choices = element("div", "stage-object-index");
      for (const spot of spec.spots || []) {
        if (spot.hidden) continue;
        const choice = button(spot.dataset.spotLabel, () => {
          hidePanel();
          spot.click();
        });
        if (seen.has(spot)) {
          choice.classList.add("stage-inspected");
          choice.setAttribute("aria-label",spot.dataset.spotLabel + "，已查看");
        }
        choices.append(choice);
      }
      if (!choices.children.length) choices.append(element("p", "", "这个方向没有近处的物件。"));
      openPanel("眼前的物件", objects, [choices]);
    }

    const handleKey = event => {
      if (H4.$("#modal-root").children.length) return;
      const door = eventLayer.querySelector(".corr-door-mask:not([hidden]) .door-box");
      const dialog = panel.hidden ? door : modalPanel ? panel : null;
      if (event.key === "Escape" && !panel.hidden) {
        event.preventDefault();
        hidePanel();
      } else if (event.key === "Tab") {
        const active=document.activeElement;
        const region=dialog||world;
        if(!dialog&&active?.closest(".stage-world")!==world)return;
        const focusable = Array.from(region.querySelectorAll("button,a[href],input,select,textarea,summary,[tabindex]"))
          .filter(node => !node.disabled && node.getAttribute("tabindex") !== "-1"
            && !node.closest("[hidden],[inert]") && node.getClientRects().length
            && getComputedStyle(node).visibility !== "hidden");
        const edge = event.shiftKey ? focusable[0] : focusable[focusable.length-1];
        if (active === edge || (dialog && active?.closest('[role="dialog"]') !== dialog)) {
          event.preventDefault();
          const target = event.shiftKey ? focusable[focusable.length-1] : focusable[0];
          (target || close).focus({preventScroll:true});
        }
      }
    };
    window.addEventListener("keydown", handleKey);
    H4.onLeave(() => window.removeEventListener("keydown", handleKey));
    world.append(skip, top, matte, side, live, hud, eventLayer, panel);
    if (spec.setting) {
      spec.setting.hidden = true;
      world.append(spec.setting);
    }
    page.classList.remove("page", "simple-page");
    page.replaceChildren(world);
    root.replaceChildren(page);
    root.dataset.scene = spec.route;
    refit();
    // The request can finish before the stage is mounted, including a cached failure.
    if (art.getAttribute("src") && art.complete && art.naturalWidth === 0) failed();
    const focusFrame = requestAnimationFrame(() => {
      if (!world.isConnected || !panel.hidden || H4.$("#modal-root").children.length) return;
      const doorChoice = eventLayer.querySelector(".corr-door-mask:not([hidden]) button");
      (doorChoice || title).focus({preventScroll:true});
    });
    H4.onLeave(() => cancelAnimationFrame(focusFrame));
    return {world, openPanel, hidePanel};
  }

  function setArt(art, url, state = "") {
    const request = artworkRequests.get(art);
    if (request) {
      request.source = url;
      // A repaint must keep the URL that is being retried or has recovered.
      url = request.retries.get(url) || url;
    }
    const old = art.getAttribute("src");
    if (old === url) return;
    const picture = art.closest(".stage-picture");
    if (picture) {
      picture.dataset.imageState = state;
      picture.querySelector(".stage-echo")?.remove();
      if (old && art.complete && art.naturalWidth && !H4.motionReduced()) {
        const echo = element("img","stage-echo");
        echo.src = old;
        echo.alt = "";
        echo.style.setProperty("--grade-l",art.style.getPropertyValue("--grade-l"));
        echo.setAttribute("aria-hidden","true");
        echo.addEventListener("animationend",() => echo.remove(),{once:true});
        art.after(echo);
        H4.app.later(500,() => echo.remove());
      }
    }
    art.src = url;
  }

  function walking(active) {
    const picture = H4.$(".stage-picture");
    const moving = active ? "true" : "false";
    if (picture && picture.dataset.walking !== moving) picture.dataset.walking = moving;
  }

  function rememberOrigin(node) {
    const rect = node.getBoundingClientRect?.();
    if (!rect) return;
    const doc = H4.$("#doc-scroll");
    doc.style.setProperty("--stage-paper-x", (rect.left + rect.width / 2) + "px");
    doc.style.setProperty("--stage-paper-y", (rect.top + rect.height / 2) + "px");
  }

  H4.Stage = {compose, hotspot, button, setArt, retryURL, walking, rememberOrigin};
})();
