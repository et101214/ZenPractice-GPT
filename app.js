const asset=name=>window.ZEN_ASSETS[name];
document.querySelectorAll("[data-asset]").forEach(img=>img.src=asset(img.dataset.asset));

const store={
 get:(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}},
 set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))
};
const screens=[...document.querySelectorAll(".screen")],dev=[...document.querySelectorAll(".dev button")];
const toast=document.getElementById("toast");
function msg(t){toast.textContent=t;toast.classList.add("show");clearTimeout(window._t);window._t=setTimeout(()=>toast.classList.remove("show"),1300)}
function go(id){screens.forEach(s=>s.classList.toggle("active",s.id===id));dev.forEach(b=>b.classList.toggle("active",b.dataset.go===id));if(id==="copy")setTimeout(resize,40);if(id==="library")renderLibrary()}
document.addEventListener("click",e=>{const g=e.target.closest("[data-go]");if(g)go(g.dataset.go)});
function updateDaylight(){const h=new Date().getHours(),el=document.getElementById("daylight");el.className="daylight "+(h<8?"morning":h<17?"afternoon":h<21?"evening":"night")}
updateDaylight();setInterval(updateDaylight,60000);
const hm=document.getElementById("homeMonk"),hmi=document.getElementById("homeMonkImg"),hs=document.getElementById("homeStatus");
const acts={sweep:{x:"26%",y:"55%",img:asset("monk_sweep"),text:"正在中庭掃地。"},bow:{x:"49%",y:"39%",img:asset("monk_bow"),text:"正在佛前禮佛。"},write:{x:"72%",y:"53%",img:asset("monk_write"),text:"正在抄經桌抄經。"},meditate:{x:"49%",y:"48%",img:asset("monk_meditate"),text:"正在大殿中打坐。"},dine:{x:"69%",y:"59%",img:asset("monk_dine"),text:"正在齋堂用膳。"},sleep:{x:"68%",y:"60%",img:asset("monk_sleep"),text:"已回禪房休息。"}};
let busy=false;
function activity(name){if(busy)return;busy=true;const a=acts[name];hm.classList.add("walking");hmi.src=asset("monk_walk");hs.innerHTML="<b>明心</b> 正前往目的地。";hm.style.left=a.x;hm.style.top=a.y;setTimeout(()=>{hm.classList.remove("walking");hmi.src=a.img;hs.innerHTML="<b>明心</b> "+a.text;busy=false},2450)}
document.querySelectorAll("[data-action]").forEach(b=>b.onclick=()=>activity(b.dataset.action));
function scheduledAction(){const h=new Date().getHours();if(h>=22||h<5)return "sleep";if(h<8)return "bow";if(h<11)return "sweep";if(h<13)return "dine";if(h<17)return "write";if(h<20)return "meditate";return "bow"}
setTimeout(()=>activity(scheduledAction()),1200);
setInterval(()=>{if(!busy&&store.get("settings",{schedule:true}).schedule!==false)activity(scheduledAction())},18000);
function progress(){const copied=store.get("copyCount",0),chant=store.get("chantCount",0);const pct=Math.min(100,Math.round(copied*20+chant*10));document.getElementById("homeProgress").style.width=pct+"%";document.getElementById("progressText").textContent=pct+"%"}
progress();
const c=document.getElementById("draw"),ctx=c.getContext("2d");let down=false,last=null,tool="brush",canvasReady=false;
function resize(){const r=c.getBoundingClientRect();if(!r.width||!r.height)return;const d=devicePixelRatio||1,old=canvasReady?c.toDataURL():store.get("copyImage",null);canvasReady=true;c.width=r.width*d;c.height=r.height*d;ctx.setTransform(d,0,0,d,0,0);ctx.lineCap="round";ctx.lineJoin="round";if(old){const img=new Image();img.onload=()=>ctx.drawImage(img,0,0,r.width,r.height);img.src=old}}
addEventListener("resize",resize);
document.querySelectorAll("[data-tool]").forEach(b=>b.onclick=()=>{tool=b.dataset.tool;document.querySelectorAll("[data-tool]").forEach(x=>x.classList.toggle("active",x===b))});
function pos(e){const r=c.getBoundingClientRect();return[e.clientX-r.left,e.clientY-r.top]}
c.onpointerdown=e=>{down=true;last=pos(e);c.setPointerCapture(e.pointerId)};
c.onpointermove=e=>{if(!down)return;const p=pos(e);ctx.globalCompositeOperation=tool==="eraser"?"destination-out":"source-over";ctx.strokeStyle="#42200e";ctx.lineWidth=tool==="brush"?4:2;ctx.beginPath();ctx.moveTo(...last);ctx.lineTo(...p);ctx.stroke();last=p};
c.onpointerup=c.onpointercancel=()=>down=false;
document.getElementById("clear").onclick=()=>ctx.clearRect(0,0,c.width,c.height);
document.getElementById("save").onclick=()=>{store.set("copyImage",c.toDataURL());store.set("copyCount",store.get("copyCount",0)+1);msg("手抄內容已儲存");progress();renderLibrary()};
const fontMenu=document.getElementById("fontMenu");
document.getElementById("fontBtn").onclick=()=>fontMenu.classList.toggle("show");
fontMenu.querySelectorAll("button").forEach(b=>b.onclick=()=>{document.querySelector(".canvas-wrap").style.fontFamily=b.dataset.font;fontMenu.classList.remove("show");msg("已切換字體")});
const lines=["觀自在菩薩，行深般若波羅蜜多時。","照見五蘊皆空，度一切苦厄。","舍利子，色不異空，空不異色。","色即是空，空即是色。","受想行識，亦復如是。"];
let settings=store.get("settings",{music:true,woodfish:true,schedule:true,autosave:true});
let li=0,playing=false,timer=null,voiceOn=true,woodfishOn=settings.woodfish!==false,speed=1;const line=document.getElementById("chantLine");
document.getElementById("woodfish").textContent="木魚："+(woodfishOn?"開":"關");
function render(){line.textContent=lines[li];if(voiceOn&&playing&&"speechSynthesis"in window){speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(lines[li]);u.lang="zh-TW";u.rate=.8*speed;speechSynthesis.speak(u)}}
function tick(){li=(li+1)%lines.length;render();if(woodfishOn)beep()}
function beep(){try{const ac=new(window.AudioContext||window.webkitAudioContext)(),o=ac.createOscillator(),g=ac.createGain();o.type="sine";o.frequency.value=180;g.gain.setValueAtTime(.08,ac.currentTime);g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+.12);o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+.12)}catch{}}
document.getElementById("prev").onclick=()=>{li=(li-1+lines.length)%lines.length;render()};
document.getElementById("next").onclick=()=>{li=(li+1)%lines.length;render()};
document.getElementById("play").onclick=()=>{playing=!playing;document.getElementById("play").textContent=playing?"Ⅱ":"▶";clearInterval(timer);if(playing){msg("小沙彌陪你誦經中");render();timer=setInterval(tick,2600/speed)}else{speechSynthesis?.cancel?.();store.set("chantCount",store.get("chantCount",0)+1);progress();renderLibrary();msg("誦經已暫停")}};
document.getElementById("voice").onclick=()=>{voiceOn=!voiceOn;document.getElementById("voice").textContent="語音："+(voiceOn?"開":"關")};
document.getElementById("woodfish").onclick=()=>{woodfishOn=!woodfishOn;settings.woodfish=woodfishOn;store.set("settings",settings);document.querySelector('[data-setting="woodfish"]').classList.toggle("on",woodfishOn);document.getElementById("woodfish").textContent="木魚："+(woodfishOn?"開":"關")};
document.getElementById("speed").onclick=()=>{speed=speed===1?1.25:speed===1.25?.75:1;document.getElementById("speed").textContent="速度 "+speed+"×";if(playing){clearInterval(timer);timer=setInterval(tick,2600/speed)}};
const books=[{name:"心經",need:0},{name:"金剛經",need:3},{name:"阿彌陀經",need:6},{name:"藥師經",need:10},{name:"地藏經",need:20}];
function renderLibrary(){const count=store.get("copyCount",0),box=document.getElementById("libraryList");box.innerHTML="";books.forEach(b=>{const unlocked=count>=b.need,row=document.createElement("div");row.className="library-row "+(unlocked?"":"locked");row.innerHTML=`<span>${unlocked?"📖":"🔒"} ${b.name}${b.need?`（抄經 ${b.need} 次解鎖）`:""}</span><button ${unlocked?"":"disabled"} data-book="${b.name}" data-mode="copy">抄經</button><button ${unlocked?"":"disabled"} data-book="${b.name}" data-mode="chant">誦經</button>`;box.appendChild(row)});box.querySelectorAll("button:not([disabled])").forEach(b=>b.onclick=()=>{msg(`已選擇《${b.dataset.book}》`);go(b.dataset.mode==="copy"?"copy":"chant")})}
renderLibrary();
document.querySelectorAll(".toggle").forEach(t=>{const k=t.dataset.setting;t.classList.toggle("on",settings[k]!==false);t.onclick=()=>{settings[k]=!(settings[k]!==false);t.classList.toggle("on",settings[k]);if(k==="woodfish"){woodfishOn=settings[k];document.getElementById("woodfish").textContent="木魚："+(woodfishOn?"開":"關")}store.set("settings",settings);msg("設定已更新")}});
function dayKey(d=new Date()){return[d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-")}
function addHistory(type,detail){const history=store.get("history",[]);history.unshift({type,detail,time:new Date().toISOString()});store.set("history",history.slice(0,30));renderHistory()}
function renderHistory(){const box=document.getElementById("historyList");if(!box)return;const history=store.get("history",[]);box.innerHTML=history.length?"":'<div class="history-row"><span>尚無紀錄</span><span>—</span></div>';history.slice(0,8).forEach(item=>{const d=new Date(item.time),row=document.createElement("div");row.className="history-row";row.innerHTML=`<span>${item.type}・${item.detail}</span><span>${d.toLocaleString("zh-TW",{month:"numeric",day:"numeric",hour:"2-digit",minute:"2-digit"})}</span>`;box.appendChild(row)})}
function updateStreak(){const today=dayKey(),last=store.get("lastPracticeDay",null);let streak=store.get("streak",0);if(!last){streak=1;store.set("lastPracticeDay",today)}else if(last!==today){const diff=Math.round((new Date(today)-new Date(last))/86400000);streak=diff===1?streak+1:1;store.set("lastPracticeDay",today)}store.set("streak",streak);document.getElementById("streak").textContent=`連續修行 ${streak} 天`}
function returnGreeting(){const now=Date.now(),last=store.get("lastVisit",now),mins=Math.max(0,Math.floor((now-last)/60000));store.set("lastVisit",now);const card=document.getElementById("returnCard");if(mins<2)return;document.getElementById("returnTitle").textContent=mins>1440?"明心一直在寺院等你。":"歡迎回到寺院。";document.getElementById("returnText").textContent=mins>1440?`你離開了約 ${Math.floor(mins/1440)} 天。明心已完成日常灑掃，今天一起抄一頁經吧。`:`你離開了約 ${mins} 分鐘。明心仍在依照時辰修行。`;card.classList.add("show")}
document.getElementById("returnClose").onclick=()=>document.getElementById("returnCard").classList.remove("show");
updateStreak();returnGreeting();renderHistory();
const originalSave=document.getElementById("save").onclick;
document.getElementById("save").onclick=()=>{originalSave?.();addHistory("抄經","完成一頁");updateStreak()};
const originalPlay=document.getElementById("play").onclick;
document.getElementById("play").onclick=()=>{const wasPlaying=playing;originalPlay?.();if(wasPlaying&&!playing){addHistory("誦經","完成一次");updateStreak()}};
document.querySelectorAll("[data-action]").forEach(btn=>{const old=btn.onclick;btn.onclick=()=>{old?.();addHistory("寺院修行",btn.dataset.action)}});
let deferredPrompt=null;
window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e;document.getElementById("installBtn").classList.add("show")});
document.getElementById("installBtn").onclick=async()=>{if(!deferredPrompt)return;deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null;document.getElementById("installBtn").classList.remove("show")};
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./service-worker.js"));
