H4.G.corridor={render:function(e){var t=this,o=H4.state;t.done=!1,t.lastMark=-1,t.keys={},t.seg=o.corridor.seg,t.p=o.corridor.p,t.passed=Object.assign({},o.corridor.passed),t.eventStarts={},t.stopTime={},t.dash=0,t.cool=0,t.hitUntil=0,t.lastT=0,t.lastStep=0,t.savedAt=0,t.atDoor=!1,t.looked=!!o.flags.lookedThisRun,t.facingBack=!1,t.soundPhase="front",t.hazards=2===o.cycle?[]:[.32,.72],t.quiet=2===o.cycle,t.image="",t.phase="",t.assetsReady=!1,t.prepareAssets(),e.innerHTML='<div class="page corridor-page"><img class="bg-img" id="corr-bg" alt="旧教学楼走廊"><p class="location-label" id="corr-location"></p><div class="corr-pace"><span id="corr-distance"></span><div class="corr-milestones" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><progress class="sr-only" id="corr-progress" max="1" value="0" aria-label="本段行进距离"></progress></div><div class="corr-info"><p id="corr-warning"></p><p id="dash-status"></p></div><button class="window-memory" id="window-memory">窗沿的一块擦痕</button><button class="back-door-hotspot" id="back-door-hotspot" hidden>查看封条后的门</button><div class="corr-door-mask" id="corr-door" hidden></div><div class="touch-controls"><button id="tc-left">回望</button><button id="tc-right">按住前进</button><button id="tc-dash">侧身</button></div><a class="scene-home" href="#/home">暂时回首页</a></div>',t.background(),H4.$("#window-memory").onclick=function(){2===o.cycle?H4.fragment("f1"):H4.modal({title:"窗沿",bodyHTML:"<p>这里比旁边干净，有一道很浅的铅笔印：“明年开花时再拍一张。”</p>"})};var i=function(){t.atDoor||(t.keys={},t.facingBack=!t.facingBack,t.facingBack?(!t.quiet&&1===t.seg&&t.p>=.54&&t.p<=.75&&(t.passed[1]=!0,t.saveProgress()),o.lookbacks++,o.flags.lookedThisRun=!0,t.looked=!0,H4.giveClue("clue_abnormal"),H4.save(),H4.A.stopLayer("hum"),H4.A.foley("door")):(H4.A.startLayer("hum"),H4.A.startLayer("rain")),H4.$("#back-door-hotspot").hidden=!t.facingBack,H4.$("#window-memory").hidden=t.facingBack||1!==t.seg)};H4.$("#back-door-hotspot").onclick=function(){H4.go("#/storage")},window.onkeydown=function(e){H4.$("#modal-root").children.length||H4.$(".stage-panel")?.hidden===!1||/INPUT|SELECT|TEXTAREA/.test(e.target.tagName)||(["ArrowLeft","ArrowRight","Shift"].includes(e.key)&&e.preventDefault(),"ArrowLeft"!==e.key||e.repeat||i(),"ArrowRight"===e.key&&(t.facingBack&&i(),t.keys.right=!0),"Shift"!==e.key&&" "!==e.key||e.repeat||/BUTTON|A/.test(e.target.tagName)||t.tryDash())},window.onkeyup=function(e){"ArrowLeft"===e.key&&(t.keys.left=!1),"ArrowRight"===e.key&&(t.keys.right=!1)},[["tc-left","left"],["tc-right","right"]].forEach(function(e){var o=H4.$("#"+e[0]);o.onpointerdown=function(s){s.preventDefault(),o.setPointerCapture(s.pointerId),"left"!==e[1]?(t.facingBack&&i(),t.keys[e[1]]=!0):i()},o.onpointerup=o.onpointercancel=o.onlostpointercapture=function(){t.keys[e[1]]=!1}}),H4.$("#tc-dash").onclick=function(){t.tryDash()},H4.$("#tc-left").onclick=function(e){0===e.detail&&i()},H4.$("#tc-right").onkeydown=function(e){" "!==e.key&&"Enter"!==e.key||(e.preventDefault(),t.facingBack&&i(),t.keys.right=!0)},H4.$("#tc-right").onkeyup=function(e){" "!==e.key&&"Enter"!==e.key||(e.preventDefault(),t.keys.right=!1)};var s=function(){t.keys={}};window.addEventListener("blur",s);var r=function(){document.hidden&&(t.keys={})};document.addEventListener("visibilitychange",r),H4.onLeave(function(){t.done=!0,t.assetRun=null,cancelAnimationFrame(t.raf),t.saveProgress(),window.removeEventListener("blur",s),document.removeEventListener("visibilitychange",r)}),t.p>=1&&t.door(),t.raf=requestAnimationFrame(function(e){t.loop(e)})},prepareAssets:function(){
  const run=this.assetRun=new Map();
  this.loadAssets().then(() => {
    if(this.assetRun===run)this.assetsReady=true;
  }, () => {
    if(this.assetRun===run)this.showAssetFailure(run);
  });
},loadAssets:function(retry=false){
  const urls=new Map(["corridor_1","corridor_2","corridor_3","corridor_reflection","corridor_closed","corridor_back"].map(name => {
    const src="assets/"+name+".webp";
    return [src,retry?H4.Stage.retryURL(src):src];
  }));
  return Promise.all(Array.from(urls.values(),src => new Promise((resolve,reject) => {
    const image=new Image();
    image.onload=resolve;
    image.onerror=reject;
    image.src=src;
  }))).then(() => urls);
},showAssetFailure:function(run){
  this.keys={};
  const exit=() => H4.go("#/home");
  const dialog=H4.modal({
    title:"走廊照片未读全",
    bodyHTML:'<p>行进已暂停，进度没有改变。</p><p class="corridor-retry-status" role="status"></p>',
    onClose:exit,
    buttons:[
      {label:"重新读取",keepOpen:true,onClick:async close => {
        const retry=dialog.querySelector(".xp-modal-buttons button");
        if(retry.getAttribute("aria-disabled")==="true")return;
        const status=dialog.querySelector(".corridor-retry-status");
        retry.setAttribute("aria-disabled","true");
        status.textContent="正在重新读取走廊照片……";
        const active=() => dialog.isConnected&&this.assetRun===run;
        let urls;
        try { urls=await this.loadAssets(true); }
        catch {
          if(!active())return;
          status.textContent="走廊照片仍未读到。可以再试一次，或返回目录。";
          retry.removeAttribute("aria-disabled");
          return;
        }
        if(!active())return;
        for(const [source,url] of urls)run.set(source,url);
        const source=this.image;
        this.image="";
        this.imageTo(source);
        this.assetsReady=true;
        close();
      }},
      {label:"返回目录",onClick:exit}
    ]
  });
},saveProgress:function(){H4.state.corridor={seg:this.seg,p:this.p,passed:Object.assign({},this.passed)},H4.save()},imageTo:function(e){this.image!==e&&(this.image=e,H4.Stage.setArt(H4.$("#corr-bg"),this.assetRun?.get(e)||e,
  e.includes("reflection")?"glass":e.includes("closed")?"door":e.includes("_back")?"back":"front"))},writeCue:function(selector,line){var node=H4.$(selector);if(node.textContent!==line)node.textContent=line},background:function(){var e=this;e.imageTo("assets/corridor_"+e.seg+".webp"),H4.$("#corr-location").textContent="旧四楼 / "+["窗上倒影","没有风的门","身后的脚步"][e.seg-1],H4.$("#corr-distance").textContent="第"+e.seg+"段 / 共3段",H4.$("#window-memory").hidden=1!==e.seg,H4.$("#tc-dash").hidden=1!==e.seg},tryDash:function(){var e=performance.now();this.facingBack||this.atDoor||this.done||H4.$("#modal-root").children.length||(1===this.seg?e<this.cool||(this.dash=e+800,this.cool=e+1550,H4.A.paper()):H4.notice(2===this.seg?"侧身推不开关上的门，等门打开再走。":"这里先松开前进键，听两声脚步过去。"))},loop:function(e){var t=this;if(!t.done){var o=Math.min(.5,(e-(t.lastT||e))/1e3),i=Math.min(.1,o);t.lastT=e;var s=!t.assetsReady||H4.$("#corr-bg")?.closest(".stage-art-missing")||document.hidden||H4.$("#modal-root").children.length||H4.$(".stage-panel")?.hidden===!1,r="",a="",n="assets/corridor_"+t.seg+".webp";
var forward=!s&&!t.atDoor&&!t.facingBack&&t.keys.right;
t.forwardTime=forward?Math.min(.6,(t.forwardTime||0)+i):0;
var pace=.82+t.forwardTime*.3;
H4.Stage.walking(forward);
if(!s&&!t.atDoor&&!t.facingBack){var c=t.hazards.findIndex(function(e,o){return!t.passed[o]&&t.p<=e+.025}),d=c>=0?t.hazards[c]:2,l=d-t.p,p=c>=0&&l<.18;if(1===t.seg&&(r="向右行走。窗上的倒影比你慢了一步。",a="方向键 → 前进 / ← 回望 / Shift 侧身。松开前进键即可停步。",p&&(n="assets/corridor_reflection.webp",r=1===c?"这一次，倒影没有跟着你侧身。它一直朝着你身后。":l<.07?"倒影贴近了窗框，肩膀几乎碰到玻璃。":"窗上多出一个倒影，它正靠近你。",1===c&&(a="它望着你刚刚走过的地方。")),e<t.hitUntil&&(r="你碰到了冰凉的窗框。退两步，看清它的位置。"),e>t.hitUntil&&(t.keys.right&&(t.p+=.11*i*pace),t.keys.left&&(t.p-=.065*i)),c>=0&&t.p>=d-.008&&t.p<=d+.025&&e>t.hitUntil&&(0===c&&e<t.dash?(t.passed[c]=!0,H4.A.paper()):(t.p=Math.max(0,d-.15),t.hitUntil=e+650,H4.A.thud(.12),1===c&&H4.notice("侧身后它还在。看看它一直朝着的方向。"))),e<t.dash?a="已经侧身，倒影从玻璃另一面过去。":e<t.cool&&(a="站稳之后，再侧身。")),2===t.seg){r="门没有被风吹动，仍在自己开合。",a="门合上时停在外面，打开后再走。侧身不能穿过关着的门。";var g=!1;if(p){void 0===t.eventStarts[c]&&(t.eventStarts[c]=e);var h=(e-t.eventStarts[c])%4200;1===c?((t.stopTime[c]||0)<.9&&(t.keys.right?t.stopTime[c]=0:t.stopTime[c]=(t.stopTime[c]||0)+o),g=(t.stopTime[c]||0)<.9):g=h<1700||h>3450,n=g?"assets/corridor_closed.webp":"assets/corridor_2.webp",r=g?1===c?"门上有一道掌印。你往前，它就合上。":"门合上了。先等一会儿。":"门开了一条缝。",a=g?1===c?"先松开前进键，等门后的插销退回。":"向前会被门挡住，不会丢失本段进度。":"门开着，继续向前。"}t.keys.right&&(t.p+=.12*i*pace),t.keys.left&&(t.p-=.065*i),c>=0&&t.p>=d-.015&&(g?t.p=Math.min(t.p,d-.016):(t.passed[c]=!0,H4.A.foley("door")))}3===t.seg&&(r="你停，身后的脚步却还会走几步。",a="松开前进键，等身后的两声脚步过去。也可以回头看。",p&&(void 0===t.eventStarts[c]&&(t.eventStarts[c]=e,t.stopTime[c]=0),t.keys.right||t.keys.left?t.stopTime[c]=0:t.stopTime[c]+=o,r=t.stopTime[c]>=1.3?"脚步已经从岔道过去。可以继续。":"身后还有脚步。先停住，听清再走。",a="已经站稳 "+Math.min(2,Math.floor(t.stopTime[c]/.65))+"/2 声",e-t.lastStep>650&&t.stopTime[c]<1.3&&(t.lastStep=e,H4.A.footstep({gain:.17,pan:-.55})),t.stopTime[c]>=1.3&&(t.passed[c]=!0,H4.A.paper())),t.keys.right&&(t.p+=.105*i*pace),t.keys.left&&(t.p-=.035*i),c>=0&&!t.passed[c]&&t.p>=d-.025&&(t.p=d-.026)),t.p=Math.max(0,Math.min(1,t.p)),3!==t.seg&&e-t.lastStep>1100&&(t.keys.right||t.keys.left)&&(t.lastStep=e,H4.A.footstep({gain:.1,pan:(t.p-.5)*.4})),e-t.savedAt>1e3&&(t.savedAt=e,t.saveProgress()),t.p>=1&&t.door()}t.atDoor||(t.assetsReady||(r="正在读取走廊照片。",a="照片就绪前，脚步会停在原处。"),t.quiet&&(r=["玻璃里只剩下你自己的影子。窗沿那块干净的地方还在。","门没有再合上，门里是一张空着的值班桌。","脚步到了岔口。你停下来，它也停了。"][t.seg-1],a="可以慢慢走，也可以随时回到已找到的房间。"),t.facingBack&&(n="assets/corridor_back.webp",r="封条仍贴在门上，纸后却有翻页的声音。",a="可以查看这道门，或向右转回走廊。"),t.imageTo(n),t.writeCue("#corr-warning",r||"门前很安静。"),t.writeCue("#dash-status",a)),H4.$("#corr-progress").value=t.p;var f=Math.min(20,Math.floor(20*t.p));f!==t.lastMark&&(t.lastMark=f,H4.$(".corr-milestones").querySelectorAll("i").forEach(function(e,t){e.classList.toggle("passed",t<f)})),H4.$("#corr-bg").style.setProperty("--walk-light",String(1-t.p*.08)),H4.$(".corr-pace").style.setProperty("--stage-pace",t.p*100+"%"),t.raf=requestAnimationFrame(function(e){t.loop(e)})}},door:function(){var e=this;e.atDoor=!0,e.facingBack=!1,H4.$("#back-door-hotspot").hidden=!0,e.p=1,e.keys={},e.saveProgress();var t=H4.$("#corr-door");t.hidden=!1,t.replaceChildren();var o=document.createElement("div");o.className="door-box",o.setAttribute("role","dialog"),o.setAttribute("aria-modal","true"),o.setAttribute("aria-labelledby","corr-door-heading"),o.innerHTML='<p class="eyebrow">脚步停在门外</p><h2 id="corr-door-heading">'+["教室的门没有锁","值班室里亮着台灯","楼梯口到了"][e.seg-1]+"</h2><p>"+(e.looked?"回头之后，那道贴着封条的门还在。":"你没有回头。等走到楼梯口，身后已经听不见脚步了。")+"</p>",t.appendChild(o),1===e.seg&&(H4.giveClue("clue_classroom"),o.appendChild(H4.btn("进教室，查看档案",function(){H4.go("#/archive")}))),2===e.seg&&(H4.giveClue("clue_duty"),o.appendChild(H4.btn("进入值班室",function(){H4.go("#/duty")}))),e.looked&&(H4.giveClue("clue_abnormal"),o.appendChild(H4.btn("推开多出来的门",function(){H4.go("#/storage")}))),o.appendChild(H4.btn(e.seg<3?"继续走下一段":"走向楼梯间",function(){e.seg<3?(e.seg++,e.p=0,e.passed={},e.stopTime={},e.eventStarts={},e.atDoor=!1,e.facingBack=!1,t.hidden=!0,H4.A.startLayer("hum"),H4.A.startLayer("rain"),e.background(),e.saveProgress(),H4.$("#tc-right").focus({preventScroll:true})):(H4.giveClue("clue_stairs_pass"),H4.state.flags.corridorDone=!0,H4.save(),H4.go("#/stairs"))})),o.querySelector("button")?.focus({preventScroll:true})}};
