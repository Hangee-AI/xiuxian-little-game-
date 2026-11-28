(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))l(a);new MutationObserver(a=>{for(const s of a)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&l(o)}).observe(document,{childList:!0,subtree:!0});function t(a){const s={};return a.integrity&&(s.integrity=a.integrity),a.referrerPolicy&&(s.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?s.credentials="include":a.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function l(a){if(a.ep)return;a.ep=!0;const s=t(a);fetch(a.href,s)}})();const q="lingxu.save.v1",O="lingxu.settings.v1",T={sound:!0,bgm:!0,volume:70,textScale:"normal"},A={small:"小",normal:"常",large:"大"},k=["练气","筑基","金丹","元婴","化神"],i=document.getElementById("panel-root"),f=document.getElementById("intro");let p=null;function h({title:n,body:e,mount:t,wide:l,cls:a}){B(),i.innerHTML=`
    <div class="backdrop"></div>
    <section class="panel${l?" wide":""}${a?` ${a}`:""}">
      <button class="panel-close" aria-label="关闭">×</button>
      <h2 class="panel-title">${n}</h2>
      <div class="panel-body">${e}</div>
    </section>`,requestAnimationFrame(()=>i.classList.add("open")),i.querySelector(".panel-close").addEventListener("click",w),i.querySelector(".backdrop").addEventListener("click",w);const s=t==null?void 0:t(i.querySelector(".panel-body"));p=typeof s=="function"?s:null}function B(){p&&(p(),p=null),i.classList.remove("open"),i.innerHTML=""}let M=null;function w(){!i.classList.contains("open")&&!i.innerHTML||(i.classList.remove("open"),p&&(p(),p=null),clearTimeout(M),M=setTimeout(()=>{i.classList.contains("open")||(i.innerHTML="")},320))}document.addEventListener("keydown",n=>{if(n.key!=="Escape")return;const e=document.getElementById("title-confirm");if(e&&!e.hidden){e.hidden=!0,n.preventDefault();return}w()});function m(n){const e=document.createElement("div");e.className="toast",e.textContent=n,document.getElementById("app").appendChild(e),requestAnimationFrame(()=>e.classList.add("show")),setTimeout(()=>{e.classList.remove("show"),setTimeout(()=>e.remove(),400)},1800)}function b(){try{const n=JSON.parse(localStorage.getItem(O)||"{}");return{...T,...n&&typeof n=="object"?n:{}}}catch{return{...T}}}function x(n){try{localStorage.setItem(O,JSON.stringify(n))}catch{}}function j(n){const e=n==="small"?.92:n==="large"?1.08:1;document.documentElement.style.setProperty("--panel-fs",String(e))}function E(){try{const n=JSON.parse(localStorage.getItem(q)||"null");return n&&typeof n=="object"?n:null}catch{return null}}function C(n){if(!n)return null;const e=n.life&&typeof n.life=="object"?n.life:null,t=n.spirit&&typeof n.spirit=="object"&&n.spirit.purity!=null?n.spirit:null;return e||t?{raw:n,life:e,spirit:t}:null}function I(n){const e=C(n);if(!e)return null;const{life:t,spirit:l}=e,a=[];if(t&&(a.push(`第 ${Math.max(0,Number(t.year)||0)} 年`),t.gender&&t.gender!=="未定"&&a.push(String(t.gender))),l!=null&&l.rootName&&a.push(`灵根 ${l.rootName}`),t){const s=Math.max(0,Number(t.span)||0);s&&a.push(`寿元 ${s}`);const o=Array.isArray(t.chronicle)?t.chronicle.length:0;o&&a.push(`账上 ${o} 行`)}return{raw:e.raw,life:t,spirit:l,bits:a}}function S(n){return String(n).replace(/[&<>"]/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[e])}function $(n){const e=n!=="import",t=e?E():null,l=t?JSON.stringify(t):"";if(e&&!l){m("此簿尚白，没有可带走的东西");return}const a=t&&t.life?Math.max(0,Number(t.life.year)||0):0;h({title:e?"带走命簿":"接回命簿",cls:"ledger-panel",body:`
      <p class="panel-text">${e?"这一段 JSON 就是你的命簿。存成文件，或粘到另一台机器上「接回命簿」。":"把之前带走的 JSON 粘进来，或从文件读入，这一世就接上了。"}</p>
      <textarea class="transfer-box" id="transfer-box" ${e?"readonly":""} placeholder="粘贴命簿 JSON…">${e?S(l):""}</textarea>
      <div class="panel-acts">
        ${e?'<button class="btn gold" id="transfer-copy" type="button">复制 JSON</button><button class="btn ghost" id="transfer-download" type="button">下载 .json</button>':'<button class="btn gold" id="transfer-load" type="button">接回这一世</button><label class="btn ghost" style="cursor:pointer">从文件读入<input type="file" id="transfer-file" accept=".json,application/json" style="display:none"></label>'}
      </div>`,mount(s){var u,g,v,y;const o=s.querySelector("#transfer-box"),r=c=>{try{const d=JSON.parse(String(c||"").replace(/^\uFEFF/,""));if(!d||typeof d!="object"||!d.life&&!d.spirit)throw new Error("empty");localStorage.setItem(q,JSON.stringify(d)),m("命簿接上了"),setTimeout(()=>location.reload(),420)}catch{m("这段读不出来，确认是完整的命簿 JSON")}};e?((u=s.querySelector("#transfer-copy"))==null||u.addEventListener("click",async()=>{o.select();try{await navigator.clipboard.writeText(l),m("命簿已复制")}catch{try{document.execCommand("copy"),m("已选中，按 Ctrl+C 复制")}catch{m("请手动复制")}}}),(g=s.querySelector("#transfer-download"))==null||g.addEventListener("click",()=>{const c=document.createElement("a");c.href=URL.createObjectURL(new Blob([l],{type:"application/json"})),c.download=`灵墟-命簿-${a}岁.json`,c.click(),setTimeout(()=>URL.revokeObjectURL(c.href),2e3),m("已导出这一世。")})):((v=s.querySelector("#transfer-load"))==null||v.addEventListener("click",()=>r(o.value)),(y=s.querySelector("#transfer-file"))==null||y.addEventListener("change",c=>{const d=c.target.files&&c.target.files[0];if(!d)return;const L=new FileReader;L.onload=()=>r(L.result),L.readAsText(d)}))}})}function F(){const n=I(E());if(!n){h({title:"命簿",cls:"ledger-panel",body:`
        <div class="ledger-empty">
          <div class="le-seal">白</div>
          <p class="le-title">此簿尚白</p>
          <p class="le-words">命簿不替你写。新开一世，从测灵根那一笔起，才算有了字。</p>
        </div>
        <div class="panel-acts"><button class="btn ghost" id="ledger-import" type="button">接回命簿</button></div>`,mount(o){var r;(r=o.querySelector("#ledger-import"))==null||r.addEventListener("click",()=>$("import"))}});return}const{life:e,spirit:t}=n,l=[];if(e){l.push(["年岁",`第 ${Math.max(0,Number(e.year)||0)} 年 · 寿元 ${Math.max(0,Number(e.span)||0)}`]);const o=Math.max(0,Math.min(k.length-1,Number(e.realm)||0));l.push(["境界",k[o]])}if(l.push(["灵根",t!=null&&t.rootName?`${S(t.rootName)}${t.gradeName?` · ${S(t.gradeName)}`:""}`:"未测"]),e){const o=Array.isArray(e.chronicle)?e.chronicle.length:0;l.push(["命簿",o?`账上 ${o} 行`:"还没落笔"]);const r=e.dungeon&&Number(e.dungeon.runs)>0?e.dungeon:null;r&&l.push(["剑狱",`${Number(r.runs)||0} 趟${r.deepest?` · 最深第 ${Number(r.deepest)||0} 层`:""}${r.cleared?" · 走到底了":""}`])}const a=e&&Array.isArray(e.chronicle)?e.chronicle.slice(-3):[],s=a.length?a.map(o=>`<span class="lq-line"><b>第 ${Math.max(0,Number(o.year)||0)} 年</b>${S(o.text)}</span>`).join(""):'<span class="lq-line empty">此世刚起笔，墨迹还没干。</span>';h({title:"命簿",cls:"ledger-panel",body:`
      <div class="ledger">
        <div class="ledger-side">命 簿</div>
        <div class="ledger-head">
          <span class="lg-seal">灵墟</span>
          <div class="lg-meta">
            <b>此世记事</b>
            <span>${new Date().toLocaleDateString("zh-CN")} 翻</span>
          </div>
        </div>
        <dl class="ledger-rows">
          ${l.map(([o,r])=>`<div><dt>${o}</dt><dd>${r}</dd></div>`).join("")}
        </dl>
        <p class="ledger-quote">${s}</p>
      </div>
      <div class="panel-acts">
        <button class="btn ghost" id="ledger-export" type="button">带走命簿</button>
        <button class="btn ghost" id="ledger-import" type="button">接回命簿</button>
      </div>`,mount(o){var r,u;(r=o.querySelector("#ledger-export"))==null||r.addEventListener("click",()=>$("export")),(u=o.querySelector("#ledger-import"))==null||u.addEventListener("click",()=>$("import"))}})}function J(){const n=b(),e=(t,l)=>`<button class="btn ${l?"gold":"ghost"} set-toggle" data-toggle="${t}" type="button">${l?"开":"关"}</button>`;h({title:"设置",body:`
      <div class="set-rows">
        <div class="set-row">
          <div><span class="sr-name">音效</span><span class="sr-note">面板、结算与剑狱的合成音</span></div>
          ${e("sound",n.sound)}
        </div>
        <div class="set-row">
          <div><span class="sr-name">背景音乐</span><span class="sr-note">舆图与秘境里的古风配乐</span></div>
          ${e("bgm",n.bgm)}
        </div>
        <div class="set-row">
          <div><span class="sr-name">音量 · ${n.volume}%</span><span class="sr-note">拖动即时生效</span></div>
          <input class="set-range" type="range" min="0" max="100" step="5" value="${Number(n.volume)||0}" id="set-volume" />
        </div>
        <div class="set-row">
          <div><span class="sr-name">字号</span><span class="sr-note">命簿正文、选项与结算的大小</span></div>
          <div class="seg" id="set-scale">
            ${["small","normal","large"].map(t=>`<button type="button" data-scale="${t}" class="${n.textScale===t?"on":""}">${A[t]}</button>`).join("")}
          </div>
        </div>
        <div class="set-row">
          <div><span class="sr-name">全屏</span><span class="sr-note">沉浸模式，按 F11 亦可</span></div>
          <button class="btn ghost" id="set-full" type="button">${document.fullscreenElement?"退出全屏":"进入全屏"}</button>
        </div>
      </div>
      <p class="set-note">设置与主体共用一份，存在本机浏览器。</p>`,mount(t){var a;t.querySelectorAll("[data-toggle]").forEach(s=>{s.addEventListener("click",()=>{const o=b(),r=s.dataset.toggle;o[r]=!o[r],x(o),s.classList.toggle("gold",o[r]),s.classList.toggle("ghost",!o[r]),s.textContent=o[r]?"开":"关"})});const l=t.querySelector("#set-volume");l==null||l.addEventListener("input",()=>{var r;const s=b();s.volume=Math.max(0,Math.min(100,Number(l.value)||0)),x(s);const o=(r=l.closest(".set-row"))==null?void 0:r.querySelector(".sr-name");o&&(o.textContent=`音量 · ${s.volume}%`)}),t.querySelectorAll("[data-scale]").forEach(s=>{s.addEventListener("click",()=>{const o=b();o.textScale=s.dataset.scale,x(o),j(o.textScale),t.querySelectorAll("[data-scale]").forEach(r=>r.classList.toggle("on",r===s))})}),(a=t.querySelector("#set-full"))==null||a.addEventListener("click",async s=>{try{document.fullscreenElement?await document.exitFullscreen():await document.documentElement.requestFullscreen()}catch{m("浏览器没允许全屏，可用 F11")}s.currentTarget.textContent=document.fullscreenElement?"退出全屏":"进入全屏"})}})}function P(){h({title:"制作名单",cls:"credits-panel",body:`
      <div class="credits">
        <div class="cr-mark">灵墟</div>
        <p class="cr-sub">一世一簿 · 因果自记</p>
        <div class="cr-rows">
          <div><span>制作</span><b>灵墟项目组</b></div>
          <div><span>引擎</span><b>原生 JS · three.js（后山、剑狱）</b></div>
          <div><span>场景</span><b>山门 · 舆图 · 后山秘境 · 心渊 · 剑狱</b></div>
          <div><span>鸣谢</span><b>每一个入墟的人</b></div>
        </div>
        <p class="cr-note">存档只写在本机浏览器，不上传服务器。<br />把这一世讲给朋友听，就是最好的谢礼。</p>
      </div>`})}function N(){document.body.classList.remove("title-mode"),f==null||f.classList.add("gone"),window.setTimeout(()=>{location.href="./panorama.html"},380)}function R(){var o,r,u,g,v,y;j(b().textScale);const n=I(E()),e=document.getElementById("menu-continue"),t=document.getElementById("menu-new"),l=document.getElementById("title-save-text"),a=document.getElementById("title-confirm");n?(e.disabled=!1,e.classList.add("primary"),t.classList.remove("primary"),l&&(l.textContent=n.bits.join(" · "))):(e.disabled=!0,t.classList.add("primary")),e==null||e.addEventListener("click",N),t==null||t.addEventListener("click",()=>{const c=I(E());if(!c){N();return}const d=document.getElementById("confirm-text");d&&(d.textContent=`旧命簿（${c.bits.join(" · ")}）会就此合上，这一世从头开始。若只是看看，选「留下这一世」。`),a&&(a.hidden=!1)}),(o=document.getElementById("confirm-cancel"))==null||o.addEventListener("click",()=>{a&&(a.hidden=!0)}),(r=document.getElementById("confirm-new"))==null||r.addEventListener("click",()=>{try{localStorage.removeItem(q)}catch{}try{sessionStorage.setItem("lingxu.autostart","1")}catch{}location.reload()}),(u=document.getElementById("menu-dungeon"))==null||u.addEventListener("click",()=>{f==null||f.classList.add("gone"),window.setTimeout(()=>{location.href="./dungeon.html?from=index"},380)}),(g=document.getElementById("menu-ledger"))==null||g.addEventListener("click",F),(v=document.getElementById("menu-settings"))==null||v.addEventListener("click",J),(y=document.getElementById("menu-credits"))==null||y.addEventListener("click",P);let s=!1;try{s=sessionStorage.getItem("lingxu.autostart")==="1",s&&sessionStorage.removeItem("lingxu.autostart")}catch{}(s||location.hash.includes("auto"))&&setTimeout(N,60)}R();
