(() => {
  "use strict";

  const key = "linyao_support_v1";
  const qrPath = "assets/abc-support-qr.png";
  const stores = ["localStorage", "sessionStorage"];
  const noteMark = `<svg class="author-mark" viewBox="0 0 64 48" aria-hidden="true" focusable="false" shape-rendering="crispEdges">
    <path fill="#354735" d="M4 7h51v33H4z"/>
    <path fill="#e9e6cf" d="M6 9h47v29H6z"/>
    <path fill="#7b8c67" d="M6 9h47v6H6z"/>
    <path fill="#f4f0db" d="M8 11h2v2H8zm4 0h2v2h-2zm4 0h2v2h-2z"/>
    <path fill="#a0aa86" d="M10 19h16v14H10z"/>
    <path fill="#4b694b" d="M12 29h2v-3h2v-3h2v3h2v2h2v-2h2v5H12z"/>
    <path fill="#899575" d="M30 20h16v2H30zm0 5h12v2H30zm0 5h15v2H30z"/>
    <path fill="#9b6a43" d="M44 32h15v11H44z"/>
    <path fill="#f2ddb3" d="M46 34h11v7H46z"/>
    <path fill="#9b6a43" d="M46 34h2v2h-2zm2 2h2v2h-2zm2 2h3v2h-3zm3-2h2v2h-2zm2-2h2v2h-2z"/>
  </svg>`;

  let remembered = 0;
  let autoTimer = null;

  function status() {
    let value = remembered;
    for (const store of stores) {
      try { value = Math.max(value, Number(window[store].getItem(key)) || 0); } catch (_) {}
    }
    try {
      const cookie = document.cookie.match(/(?:^|;\s*)linyao_support_v1=([12])(?:;|$)/);
      if (cookie) value = Math.max(value, Number(cookie[1]));
    } catch (_) {}
    return value;
  }

  function remember(value) {
    remembered = Math.max(value, status());
    for (const store of stores) {
      try { window[store].setItem(key, String(remembered)); } catch (_) {}
    }
    try { document.cookie = key + "=" + remembered + ";max-age=31536000;SameSite=Lax"; } catch (_) {}
  }

  function show() {
    if (H4.$(".author-support-modal")) return;
    if (status() >= 2) {
      H4.notice("谢谢你惦记着这部游戏 (*´▽｀*)");
      return;
    }
    const dialog = H4.modal({
      title: "给作者留 1 元",
      bodyHTML: `<div class="author-support-layout">
        <div class="author-support-copy">
          <div class="author-byline">${noteMark}<span>abc studio · 作者留言</span></div>
          <p>我是 abc，如果你喜欢《林杳同学》，可以扫码留一块钱，算是支持我接着做网页游戏。</p>
          <p>想接着翻网页，关掉这个窗口就好 (´ ▽ \`)ﾉ</p>
        </div>
        <figure class="author-qr">
          <img src="${qrPath}" alt="abc studio 的 1 元支持收款码" width="940" height="1128">
          <figcaption>自愿扫码支持 1 元</figcaption>
          <p class="author-qr-error" role="status" hidden>收款码没打开，关掉窗口后可以再试一次。</p>
        </figure>
      </div>`,
      buttons: [
        {label: "继续游玩"},
        {label: "我已扫码支持", onClick: () => {
          remember(2);
          H4.notice("谢谢你愿意支持我，接着玩吧 (´ ▽ `)ﾉ");
        }}
      ]
    });
    dialog.classList.add("author-support-modal");
    const buttons = dialog.querySelectorAll(".xp-modal-buttons button");
    dialog.onclick = event => { if (event.target === dialog) buttons[0].click(); };
    const image = dialog.querySelector(".author-qr img");
    const error = dialog.querySelector(".author-qr-error");
    const markReady = ready => {
      buttons[1].disabled = !ready;
      error.hidden = ready;
      image.hidden = !ready;
    };
    buttons[1].disabled = true;
    image.onload = () => markReady(true);
    image.onerror = () => markReady(false);
    if (image.complete) markReady(image.naturalWidth > 0);
    remember(1);
  }

  function queue(sourceId) {
    if (status()) return;
    const route = H4.app.curRoute;
    if (autoTimer === null) H4.onLeave(() => {
      clearTimeout(autoTimer);
      autoTimer = null;
    });
    clearTimeout(autoTimer);
    const tryOpen = () => {
      autoTimer = null;
      const archive = H4.G.archive;
      if (status() || H4.app.curRoute !== route || archive.tab !== "read" || archive.selected !== sourceId) return;
      if (H4.$("#stage-inspector")?.hidden !== false ||
          H4.$("#stage-inspector .stage-native")?.hidden !== false) return;
      if (document.hidden || H4.$("#modal-root").children.length || window.getSelection?.()?.toString()) {
        autoTimer = setTimeout(tryOpen, 900 * H4.TS());
        return;
      }
      show();
    };
    autoTimer = setTimeout(tryOpen, 4800 * H4.TS());
  }

  function thanks(root, params) {
    const id = params.get("ending");
    const hasEnding = Object.hasOwn(H4.Endings.names, id) && H4.state.endingsSeen.includes(id);
    const back = hasEnding ? "#/ending?id=" + id : "#/ending";
    root.innerHTML = `<article class="author-thanks">
      <header class="author-letter-head">
        <span>abc studio / 作者附页</span>
        ${noteMark}
      </header>
      <div class="author-letter-body">
        <h1>谢谢你来玩《林杳同学》</h1>
        <p>以前逛同学的个人主页，走前我总要在留言本里写一句「来过了」。后来给林杳做主页，我也替她留了这么一本。</p>
        <p>谢谢你点开她的主页，也谢谢你肯在这儿待一会儿，今天换我给你留个名 (´ ▽ \`)ﾉ</p>
        <p class="author-signature">abc</p>
      </div>
      <nav class="author-letter-links" aria-label="离开作者附页">
        <a href="${back}">${hasEnding ? "回到刚才的结局" : "浏览记录"}</a>
        <a href="#/home">回林杳的主页</a>
        <button type="button" class="text-button" id="thanks-support">支持作者</button>
      </nav>
    </article>`;
    root.querySelector("#thanks-support").onclick = show;
  }

  H4.Support = {show, queue};
  H4.Portal.routes.thanks = thanks;
})();
