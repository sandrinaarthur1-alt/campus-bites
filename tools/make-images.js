// Generates one unique SVG illustration per dish that has no photo.
// Photos in public/images/photos/<slug>.jpg always win (see server.js).
const fs = require("fs"), path = require("path");
const MENU = require("../menu.js");
const slugify = s => s.toLowerCase().replace(/&/g,"and").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
function hash(s){let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
function rng(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

const OUT = path.join(__dirname,"..","public","images","dishes");
const PHOTOS = path.join(__dirname,"..","public","images","photos");
fs.mkdirSync(OUT,{recursive:true});

function draw(name, category){
  const n = name.toLowerCase(), R = rng(hash(name)), has = (...w)=>w.some(x=>n.includes(x));
  const rr = (a,b)=>a+R()*(b-a), pick = a=>a[Math.floor(R()*a.length)];
  let s = "";
  const add = x => s += x;
  const ring = (cx,cy,r,fill,extra="")=>add(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" ${extra}/>`);
  const scatter = (count,rad,fn,cx=200,cy=150)=>{for(let i=0;i<count;i++){const a=R()*6.283,d=Math.sqrt(R())*rad;fn(cx+Math.cos(a)*d,cy+Math.sin(a)*d*.85,i)}};
  const plate = (r=112,col="#fbf8f2")=>{add(`<ellipse cx="200" cy="${158+r*.12}" rx="${r+6}" ry="${r*.9}" fill="#0002"/>`);ring(200,150,r,col);ring(200,150,r-12,"none",`stroke="#0001" stroke-width="3"`)};
  const bowl = (col="#f4eee4",inner="#d8d0c4")=>{add(`<path d="M80 135 Q80 245 200 245 Q320 245 320 135 Z" fill="${col}"/><path d="M95 205 Q200 262 305 205" fill="none" stroke="#0001" stroke-width="3"/><ellipse cx="200" cy="135" rx="120" ry="34" fill="${inner}"/>`)};
  const chilli = (x,y)=>add(`<ellipse cx="${x}" cy="${y}" rx="9" ry="3.2" fill="#3f9b3c" transform="rotate(${rr(0,180)} ${x} ${y})"/>`);
  const sesame = (x,y)=>add(`<ellipse cx="${x}" cy="${y}" rx="2.2" ry="1.3" fill="#fff6dd"/>`);
  const leaf = (x,y,c="#3f8f3d")=>add(`<ellipse cx="${x}" cy="${y}" rx="11" ry="5.5" fill="${c}" transform="rotate(${rr(0,180)} ${x} ${y})"/>`);
  const chickenCol = has("tandoori","tikka","achari")?"#c8552a":has("bbq")?"#6b3320":has("peri")?"#d1451f":has("lemon")?"#e8b13a":has("dragon","chilli","kung")?"#b8322a":has("65")?"#c7421f":"#d99a3c";
  const isChicken = has("chicken","drums","lollipop","wings");

  let bg = pick(["#f3e3cf","#efe5d3","#f0dfd0","#e9e2d2","#f2e8d8"]);
  const body = () => {
    // ---------- JUICE ----------
    if(has("juice")){
      const col = has("apple")?"#d9b441":has("muskmelon")?"#f2b36b":has("watermelon")?"#e5495b":has("orange")?"#f59a1a":"#8c1630";
      bg = "#efe6d6";
      add(`<ellipse cx="200" cy="250" rx="85" ry="14" fill="#0002"/><path d="M135 70 L265 70 L250 245 Q200 258 150 245 Z" fill="#fff" fill-opacity=".55" stroke="#cfc6b8" stroke-width="3"/><path d="M141 105 L259 105 L249 240 Q200 252 151 240 Z" fill="${col}"/><rect x="141" y="100" width="118" height="9" rx="4" fill="#fff" fill-opacity=".35"/><rect x="215" y="38" width="9" height="150" rx="4" fill="#e65c3d" transform="rotate(12 220 110)"/>`);
      if(has("apple")){ring(300,210,24,"#c9352b");add(`<path d="M300 186 q4-12 10-14" stroke="#4b7d2c" stroke-width="3" fill="none"/>`)}
      else if(has("muskmelon")){add(`<path d="M270 235 A45 45 0 0 1 340 235 Z" fill="#f3c28a"/><path d="M275 235 A40 40 0 0 1 335 235" fill="none" stroke="#8fb36d" stroke-width="5"/>`)}
      else if(has("watermelon")){add(`<path d="M268 238 A44 44 0 0 1 345 238 Z" fill="#e5495b"/><path d="M268 238 A44 44 0 0 0 345 238 Z" fill="#6aa84f"/>`);scatter(4,22,(x,y)=>ring(x+5,y+60,2,"#222"),306,185)}
      else if(has("orange")){ring(300,222,26,"#f59a1a");ring(300,222,19,"#ffc15c");for(let a=0;a<8;a++)add(`<line x1="300" y1="222" x2="${300+Math.cos(a*.785)*19}" y2="${222+Math.sin(a*.785)*19}" stroke="#f59a1a" stroke-width="1.5"/>`)}
      else {add(`<path d="M262 225 q40-35 72 0 q-10 30-36 30 q-26 0-36-30Z" fill="#b01e3c"/>`);scatter(9,20,(x,y)=>ring(x,y,3,"#ff7087"),298,232)}
      return;
    }
    // ---------- SOUP ----------
    if(has("soup")){
      const liq = has("tomato")?"#d8452b":has("manchow")?"#a8683a":"#f1cf62";
      bg = "#ead9c4"; bowl("#fbf8f2","#e5dccf");
      add(`<ellipse cx="200" cy="137" rx="104" ry="27" fill="${liq}"/>`);
      if(has("tomato")){add(`<path d="M150 135 q50 22 100 0" stroke="#f7e7d0" stroke-width="5" fill="none"/>`);for(let i=0;i<3;i++)leaf(170+i*30,132+(i%2)*6)}
      if(has("sweet corn")){scatter(26,85,(x,y)=>ring(x,y,3.4,"#f7b500"));add(`<path d="M130 138 q70 18 140-4" stroke="#fff3b0" stroke-width="3" fill="none" opacity=".9"/>`)}
      if(has("manchow")){for(let i=0;i<14;i++)add(`<path d="M${150+i*7} 120 q6 14 -4 30" stroke="#e9b04a" stroke-width="3" fill="none"/>`);scatter(10,70,(x,y)=>ring(x,y,3,"#5aa43f"))}
      if(has("chicken"))scatter(8,75,(x,y)=>add(`<rect x="${x}" y="${y}" width="13" height="9" rx="3" fill="#e9c88e"/>`));
      return;
    }
    // ---------- PIZZA ----------
    if(has("pizza")){
      bg = pick(["#e8d3b5","#ecdcc3","#e6cfae"]); add(`<ellipse cx="200" cy="262" rx="120" ry="14" fill="#0002"/>`);
      add(`<rect x="70" y="40" width="260" height="230" rx="18" fill="#b98a58" opacity=".5"/>`);
      ring(200,152,112,"#cf9a52");ring(200,152,98,has("margherita","tomato")?"#e5b04a":"#f2c35c");
      if(has("margherita"))ring(200,152,92,"none",`stroke="#d63b27" stroke-width="14" opacity=".35"`);
      if(has("bbq","pepper","tandoori","tikka","hot"))ring(200,152,86,"none",`stroke="${has("bbq")?"#7a3a1d":"#d9532b"}" stroke-width="10" opacity=".28"`);
      const tops = [];
      if(has("chicken","tikka")&&!has("paneer"))tops.push((x,y)=>add(`<rect x="${x}" y="${y}" width="17" height="13" rx="4" fill="${has("bbq")?"#7a4326":"#e6b97c"}" transform="rotate(${rr(0,90)} ${x} ${y})"/>`));
      if(has("paneer"))tops.push((x,y)=>add(`<rect x="${x}" y="${y}" width="15" height="15" rx="2" fill="#fff6e0" stroke="#e9d3a4"/>`));
      if(has("margherita"))tops.push((x,y)=>{ring(x,y,12,"#fff7e8");leaf(x,y)});
      if(has("pepper","hot"))tops.push((x,y)=>ring(x,y,3.5,"#2a2420"));
      if(has("garden","veg","grilled","mexican","tandoori","tikka","desi","spicy"))tops.push((x,y)=>add(`<circle cx="${x}" cy="${y}" r="7" fill="none" stroke="#3d9a3a" stroke-width="3"/>`));
      if(has("garden","mexican","tikka","desi","spicy","tandoori","peri"))tops.push((x,y)=>add(`<path d="M${x} ${y} q12 -8 22 4" stroke="#8a3f8f" stroke-width="3" fill="none"/>`));
      if(has("corn","mexican"))tops.push((x,y)=>ring(x,y,3.3,"#ffd21a"));
      if(has("garden","mexican","peri"))tops.push((x,y)=>ring(x,y,6,"#d63b27"));
      if(has("garlic","blast","cheese"))tops.push((x,y)=>{ring(x,y,5,"#fff3b8")});
      if(has("peri"))tops.push((x,y)=>add(`<ellipse cx="${x}" cy="${y}" rx="8" ry="3" fill="#d1451f"/>`));
      if(!tops.length)tops.push((x,y)=>ring(x,y,6,"#d63b27"));
      const total = has("blast","corn")?44:30; scatter(total,82,(x,y,i)=>tops[i%tops.length](x,y),200,152);
      for(let a=0;a<4;a++)add(`<line x1="200" y1="152" x2="${200+Math.cos(a*.785+.3)*108}" y2="${152+Math.sin(a*.785+.3)*108}" stroke="#7a4a1f" stroke-width="2" opacity=".5"/><line x1="200" y1="152" x2="${200-Math.cos(a*.785+.3)*108}" y2="${152-Math.sin(a*.785+.3)*108}" stroke="#7a4a1f" stroke-width="2" opacity=".5"/>`);
      return;
    }
    // ---------- BURGER ----------
    if(has("burger")){
      bg = "#e9dcc6"; add(`<ellipse cx="200" cy="262" rx="105" ry="12" fill="#0002"/>`);
      const patty = has("chicken")?(has("bbq")?"#6e3a22":has("chilli")?"#b8322a":"#d99a3c"):has("paneer")?"#f4e6c0":"#7a5230";
      add(`<path d="M105 235 Q200 270 295 235 L295 218 L105 218Z" fill="#e0a257"/>`);
      add(`<rect x="100" y="198" width="200" height="26" rx="13" fill="${patty}"/>`);
      if(has("cheese","juicy"))add(`<path d="M98 190 H302 L275 222 L250 196 L225 224 L200 196 L175 224 L150 196 L125 222Z" fill="#f6c628"/>`);
      if(has("bbq","chilli"))add(`<path d="M110 196 q40 14 90 0 t90 2" stroke="${has("bbq")?"#3b1a0e":"#c11"}" stroke-width="7" fill="none"/>`);
      add(`<path d="M98 178 q20 -12 40 0 t40 0 t40 0 t40 0 t44 0 v14 H98Z" fill="#59ad3e"/>`);
      ring(150,168,15,"#d83a2e");ring(250,168,15,"#d83a2e");
      if(has("paneer","grilled"))add(`<rect x="170" y="160" width="60" height="10" rx="4" fill="#f4e6c0"/>`);
      add(`<path d="M100 160 Q100 70 200 70 Q300 70 300 160Z" fill="#e8a24c"/>`);
      add(`<path d="M125 120 Q150 85 200 82" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="8" stroke-linecap="round"/>`);
      scatter(14,70,(x,y)=>{if(y<150&&y>82)sesame(x,y)},200,118);
      return;
    }
    // ---------- SANDWICH / TACO / WRAP ----------
    if(has("taco")){
      bg = "#efdcb8"; add(`<ellipse cx="200" cy="250" rx="115" ry="14" fill="#0002"/>`);
      add(`<path d="M85 205 Q200 40 315 205Z" fill="#c9922a"/>`);
      scatter(26,52,(x,y,i)=>ring(x,y-8,6.5,["#59ad3e","#d63b27","#f6c628"][i%3]),200,125);
      if(has("non"))scatter(12,45,(x,y)=>ring(x,y-4,6.5,"#8b5a2b"),200,128);
      add(`<path d="M80 215 Q200 120 320 215 Q200 250 80 215Z" fill="#e8b94d" stroke="#c9922a" stroke-width="4"/><path d="M110 212 Q200 150 290 212" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="6"/>`);
      return;
    }
    if(has("wrap")){
      bg = "#ecdcc4"; add(`<ellipse cx="200" cy="250" rx="120" ry="12" fill="#0002"/>`);
      add(`<g transform="rotate(-18 200 150)"><rect x="95" y="100" width="210" height="95" rx="46" fill="#e7c88e"/><rect x="170" y="108" width="140" height="80" rx="38" fill="#c9a769" opacity=".25"/>`);
      add(`<ellipse cx="300" cy="148" rx="26" ry="45" fill="#f4ddb0"/>`);
      scatter(10,22,(x,y,i)=>ring(x+100,y-2,5,has("chicken")?"#c98a45":has("egg")?"#ffd84a":has("paneer")?"#fff1cf":"#d9402f"),200,150);
      scatter(6,20,(x,y)=>ring(x+100,y,4,"#59ad3e"),200,150);
      add(`<path d="M95 150 H190 V195 H95Z" fill="${pick(["#c9402d","#d99a3c","#4b86c5","#7aa84a"])}" opacity=".85"/></g>`);
      return;
    }
    if(has("sandwich")){
      bg = "#eadcc5"; add(`<ellipse cx="200" cy="255" rx="118" ry="12" fill="#0002"/>`);
      const grilled = has("grilled","tex");
      [[110,0],[165,1]].forEach(([x,k])=>{add(`<path d="M${x} 225 L${x+85} 95 L${x+170} 225Z" fill="#e6bf80"/><path d="M${x+14} 218 L${x+85} 112 L${x+156} 218Z" fill="#f8e7c4"/>`);
        add(`<path d="M${x+22} 205 H${x+148}" stroke="${k?"#59ad3e":"#d63b27"}" stroke-width="8"/><path d="M${x+30} 196 H${x+140}" stroke="${has("paneer")?"#f4cf3f":has("cheese")?"#f6c628":"#9bd06a"}" stroke-width="6"/>`);
        if(grilled)for(let i=0;i<3;i++)add(`<line x1="${x+60+i*14}" y1="130" x2="${x+75+i*14}" y2="150" stroke="#8b5a2b" stroke-width="3"/>`)});
      if(has("tex"))scatter(8,40,(x,y)=>ring(x,y,3.5,"#d63b27"),200,165);
      if(has("club")){add(`<line x1="200" y1="60" x2="200" y2="190" stroke="#c9a15a" stroke-width="3"/><path d="M200 60 l26 8 l-26 8Z" fill="#d63b27"/><path d="M130 160 H270" stroke="#f6c628" stroke-width="7"/><path d="M140 172 H262" stroke="#d63b27" stroke-width="6"/>`)}
      return;
    }
    // ---------- MOMOS ----------
    if(has("momo")){
      bg = "#e9ddc9"; plate(110);
      const fried = has("crispy"), col = fried?"#d9953a":"#fdf6e8";
      const pts=[[200,110],[150,140],[250,140],[170,190],[230,190],[200,150],[120,175],[280,175]];
      pts.forEach(([x,y],i)=>{add(`<path d="M${x-30} ${y+12} Q${x} ${y-34} ${x+30} ${y+12} Q${x} ${y+22} ${x-30} ${y+12}Z" fill="${col}" stroke="${fried?"#a8661f":"#e1d4bb"}" stroke-width="2"/>`);
        for(let k=-2;k<=2;k++)add(`<line x1="${x+k*8}" y1="${y-14+Math.abs(k)*4}" x2="${x+k*8}" y2="${y+6}" stroke="${fried?"#a8661f":"#e1d4bb"}" stroke-width="1.6"/>`);
        if(has("cheese corn"))ring(x,y-4,3,"#ffd21a");if(has("chicken")&&i%3==0)ring(x+14,y+4,3,"#8b4b2b");if(has("tibetan")&&i%2==0)ring(x-12,y+2,3,"#6aa84f")});
      ring(200,240,16,"#fff","stroke=\"#0002\"");ring(200,240,10,has("cheese")?"#f6c628":"#d63b27");
      return;
    }
    // ---------- PASTA & BOWLS ----------
    if(has("pasta")){
      bg = "#eadccb"; bowl("#fbf8f2","#ddd4c7");
      const sauce = has("red")?"#d1432b":"#fbf0d4";
      add(`<ellipse cx="200" cy="132" rx="104" ry="28" fill="#f1d27e"/>`);
      for(let i=0;i<10;i++)add(`<path d="M${120+i*7} 135 q${rr(10,30)} -${rr(10,25)} ${rr(30,70)} ${rr(0,12)}" stroke="${i%2?"#e8c35a":"#f6dc8e"}" stroke-width="5" fill="none"/>`);
      add(`<ellipse cx="200" cy="128" rx="70" ry="18" fill="${sauce}" opacity=".9"/>`);
      if(has("chicken"))scatter(7,50,(x,y)=>add(`<rect x="${x}" y="${y}" width="14" height="10" rx="3" fill="#c98a45"/>`),200,128);else scatter(7,50,(x,y)=>ring(x,y,4,"#59ad3e"),200,128);
      leaf(200,118);leaf(215,124);return;
    }
    if(has("bowl")){
      bg = "#ecdcc7"; bowl("#2e3a46","#e8dfd1");
      const base = has("noodle")?"#f0c968":"#fbf6ea";
      add(`<ellipse cx="200" cy="133" rx="104" ry="28" fill="${base}"/>`);
      if(has("noodle"))for(let i=0;i<9;i++)add(`<path d="M${130+i*9} 120 q8 12 -4 24" stroke="#d9a63e" stroke-width="3" fill="none"/>`);
      if(has("mexican")){[[-50,0,"#d63b27"],[0,-6,"#3d9a3a"],[50,0,"#f6c628"],[-20,12,"#7a3a22"],[28,12,"#d63b27"]].forEach(([dx,dy,c])=>scatter(7,16,(x,y)=>ring(x,y,5,c),200+dx,133+dy))}
      else {scatter(9,52,(x,y)=>add(`<rect x="${x}" y="${y}" width="14" height="14" rx="3" fill="${has("paneer")?"#f7ead0":"#c98a45"}" stroke="#b8322a" stroke-width="3"/>`),200,130);scatter(6,50,(x,y)=>ring(x,y,5,"#59ad3e"),200,130);scatter(5,40,(x,y)=>chilli(x,y),200,130)}
      return;
    }
    // ---------- NOODLES / RICE ----------
    if(has("noodle")||has("hakka")){
      bg = "#ebdcc6"; plate(112);ring(200,150,86,"#f2c45a");
      for(let i=0;i<30;i++)add(`<path d="M${rr(125,235)} ${rr(95,200)} q${rr(20,60)} -${rr(10,40)} ${rr(30,70)} ${rr(0,30)}" stroke="${i%3?"#e9b542":"#f7d27a"}" stroke-width="5" fill="none" stroke-linecap="round"/>`);
      scatter(16,75,(x,y,i)=>ring(x,y,3.2,["#e87a24","#4aa23a","#6b2f7a"][i%3]),200,150);
      if(has("schezwan"))add(`<circle cx="200" cy="150" r="60" fill="#c1301f" opacity=".25"/>`);
      if(has("chicken"))scatter(6,60,(x,y)=>add(`<rect x="${x}" y="${y}" width="14" height="9" rx="3" fill="#c98a45"/>`),200,150);
      if(has("egg"))scatter(4,60,(x,y)=>ring(x,y,6,"#ffd84a"),200,150);
      return;
    }
    if(has("rice")){
      bg = "#e9dcc9"; plate(112);
      const rc = has("schezwan")||has("triple")?"#e0a05a":"#fbf4e3";
      add(`<path d="M105 170 Q110 78 200 78 Q290 78 295 170 Q200 205 105 170Z" fill="${rc}"/>`);
      scatter(90,88,(x,y)=>add(`<ellipse cx="${x}" cy="${y}" rx="5" ry="1.8" fill="#fff" transform="rotate(${rr(0,180)} ${x} ${y})" opacity=".8"/>`),200,130);
      scatter(18,80,(x,y,i)=>ring(x,y,3.3,["#e87a24","#4aa23a"][i%2]),200,130);
      if(has("schezwan","triple"))scatter(10,70,(x,y)=>ring(x,y,5,"#b8221a"),200,130);
      if(has("mushroom"))scatter(7,64,(x,y)=>add(`<path d="M${x-8} ${y+3} Q${x} ${y-10} ${x+8} ${y+3}Z" fill="#c8a57a"/>`),200,130);
      if(has("egg"))scatter(6,64,(x,y)=>{ring(x,y,6,"#fff");ring(x,y,3,"#ffbf1a")},200,130);
      if(has("chicken"))scatter(8,64,(x,y)=>add(`<rect x="${x}" y="${y}" width="14" height="9" rx="3" fill="#c98a45"/>`),200,130);
      if(has("triple"))add(`<ellipse cx="200" cy="205" rx="40" ry="10" fill="#b8221a" opacity=".7"/>`);
      return;
    }
    // ---------- SALAD ----------
    if(has("salad")){
      bg = "#e5ead4"; bowl("#fbf8f2","#d9e3c8");
      add(`<ellipse cx="200" cy="130" rx="104" ry="28" fill="#74b34a"/>`);
      scatter(18,80,(x,y)=>add(`<path d="M${x} ${y} q12 -14 22 0 q-8 10 -22 0Z" fill="${pick(["#5aa23a","#8cc760","#a8d67f"])}"/>`),200,128);
      scatter(7,64,(x,y)=>add(`<rect x="${x}" y="${y}" width="11" height="11" rx="2" fill="#e4b160"/>`),200,128);
      scatter(5,60,(x,y)=>ring(x,y,6,"#d63b27"),200,128);
      if(has("chicken"))scatter(6,60,(x,y)=>add(`<rect x="${x}" y="${y}" width="22" height="8" rx="4" fill="#d9a15f"/>`),200,128);
      scatter(6,70,(x,y)=>add(`<path d="M${x} ${y} l9 -3 l2 5Z" fill="#fff6d8"/>`),200,128);
      return;
    }
    // ---------- FRIES / NACHOS / WEDGES ----------
    if(has("nacho")){
      bg = "#efdfbf"; plate(112,"#3a3a3a");
      scatter(26,86,(x,y)=>add(`<path d="M${x} ${y} l30 6 l-18 28Z" fill="${pick(["#e8b94d","#f0c660","#d9a43a"])}" stroke="#b78825" stroke-width="1.5" transform="rotate(${rr(0,360)} ${x} ${y})"/>`),200,150);
      if(has("cheese"))add(`<path d="M120 120 q40 40 80 -5 t80 30 q-20 40 -80 36 t-80 -61Z" fill="#f6c628" opacity=".85"/>`);
      ring(200,150,16,"#d63b27");scatter(7,8,(x,y)=>ring(x,y,3,"#59ad3e"),200,150);return;
    }
    if(has("fries")||has("wedges")){
      bg = "#efdfbd"; add(`<path d="M120 150 L280 150 L260 262 L140 262Z" fill="${has("peri")?"#c93a2a":has("cheese")?"#f1b21d":"#c6382c"}"/><path d="M150 205 Q200 190 250 205" stroke="#fff" stroke-opacity=".5" stroke-width="10" fill="none"/>`);
      const w = has("wedges")?16:8;
      for(let i=0;i<(has("wedges")?14:22);i++){const x=rr(125,265),y=rr(60,140),a=rr(-24,24);add(`<rect x="${x}" y="${y}" width="${w}" height="${rr(70,100)}" rx="3" fill="${has("wedges")?"#e3a947":"#f3c75c"}" stroke="#c99a30" stroke-width="1.5" transform="rotate(${a} ${x} ${y})"/>`)}
      if(has("peri")){scatter(30,70,(x,y)=>ring(x,y,2,"#d1301e"),200,100)}
      if(has("cheese"))add(`<path d="M130 120 q30 30 60 0 t70 6 q-20 36 -70 22 t-60 -28Z" fill="#f6c628"/>`);
      if(has("wedges"))scatter(14,60,(x,y)=>leaf(x,y,"#5aa23a"),200,100);
      return;
    }
    // ---------- DOSA ----------
    if(has("dosa","ghee roast")){
      bg = "#e8e0c4"; add(`<ellipse cx="200" cy="170" rx="150" ry="95" fill="#4a8a4a" opacity=".35"/>`);
      const col = has("ghee")?"#c8751f":"#e7b45a";
      add(`<path d="M60 215 L330 98 Q352 95 345 118 L110 235Z" fill="${col}"/><path d="M85 212 L320 108" stroke="#fff" stroke-opacity=".3" stroke-width="7" stroke-linecap="round"/>`);
      if(has("ghee"))for(let i=0;i<6;i++)add(`<circle cx="${130+i*32}" cy="${196-i*14}" r="5" fill="#8a4a10" opacity=".5"/>`);
      ring(115,95,28,"#fff");ring(115,95,22,"#f6f1e4");ring(285,230,28,"#fff");ring(285,230,22,"#c95b2a");
      if(!has("plain"))add(`<ellipse cx="150" cy="215" rx="22" ry="12" fill="#e2a94a"/>`);
      return;
    }
    // ---------- INDIAN GRILL (tikka / tandoori) ----------
    if(has("tandoori chicken full")||has("tandoori chicken half")||has("tandoori special")){
      bg = "#2f2b28"; add(`<ellipse cx="200" cy="252" rx="130" ry="14" fill="#0006"/>`);
      const pieces = has("full")?2:has("half")?1:3;
      for(let i=0;i<pieces;i++){const x=pieces==1?200:pieces==2?140+i*120:110+i*90;add(`<ellipse cx="${x}" cy="150" rx="${pieces==1?80:52}" ry="${pieces==1?60:48}" fill="#c8431f" transform="rotate(${i*14-10} ${x} 150)"/><ellipse cx="${x-8}" cy="140" rx="${pieces==1?55:32}" ry="${pieces==1?36:28}" fill="#e0612c" opacity=".7"/>`);scatter(7,30,(a,b)=>ring(a,b,4,"#3b1608"),x,150)}
      ring(60,225,22,"#f4e9a8");ring(335,225,18,"#7d3d99");leaf(300,95);leaf(95,90);return;
    }
    if(has("tikka")){
      bg = "#efdcc1"; add(`<ellipse cx="200" cy="250" rx="125" ry="12" fill="#0002"/>`);
      [105,150,195].forEach(y=>{add(`<line x1="60" y1="${y}" x2="340" y2="${y-14}" stroke="#9aa0a6" stroke-width="5" stroke-linecap="round"/>`);
        for(let i=0;i<5;i++){const x=95+i*52;add(`<rect x="${x}" y="${y-30-i*3}" width="40" height="36" rx="9" fill="${has("paneer")?"#f3e3bd":has("achari")?"#c7771f":"#cf5a2a"}" stroke="${has("paneer")?"#d8a84a":"#8a3414"}" stroke-width="2"/>`);if(i%2==0)add(`<ellipse cx="${x+14}" cy="${y-18-i*3}" rx="8" ry="4" fill="#2a1408" opacity=".5"/>`);if(has("paneer")&&i%2==1)add(`<rect x="${x+8}" y="${y-22-i*3}" width="22" height="12" fill="#5aa23a" opacity=".8"/>`)}});
      ring(325,230,18,"#f4e9a8");return;
    }
    // ---------- CHICKEN ----------
    if(isChicken){
      bg = "#eadcc7"; plate(110,has("bbq","dragon","kung")?"#37332f":"#fbf8f2");
      const col = chickenCol;
      if(has("popcorn")||has("nugget")){const k=has("popcorn");scatter(k?24:9,80,(x,y)=>add(k?`<circle cx="${x}" cy="${y}" r="${rr(8,13)}" fill="${col}" stroke="#8a4a14" stroke-width="2"/>`:`<rect x="${x-16}" y="${y-12}" width="${rr(30,38)}" height="${rr(22,28)}" rx="10" fill="#e4a444" stroke="#a8661f" stroke-width="2" transform="rotate(${rr(-30,30)} ${x} ${y})"/>`),200,150);ring(300,235,15,"#fff","stroke=\"#0002\"");ring(300,235,9,"#d63b27");return}
      if(has("drums","lollipop","wings","crispy")){
        const cnt = has("wings")?5:has("lollipop")?4:3;
        for(let i=0;i<cnt;i++){const a=(-30+i*(60/Math.max(cnt-1,1)))*Math.PI/180, x=200+Math.sin(a)*70, y=140;
          add(`<g transform="rotate(${-20+i*(40/Math.max(cnt-1,1))} ${x} ${y})"><rect x="${x-4}" y="${y+10}" width="8" height="${has("lollipop")?58:46}" rx="4" fill="#f1e6d2"/><ellipse cx="${x}" cy="${y}" rx="${has("wings")?26:22}" ry="${has("wings")?34:32}" fill="${col}" stroke="#7b3a14" stroke-width="2"/><ellipse cx="${x-6}" cy="${y-10}" rx="9" ry="14" fill="#fff" opacity=".18"/></g>`)}
        if(has("lollipop"))scatter(3,40,(x,y)=>ring(x,y,7,"#fff6d8"),200,215);
        if(has("drums"))add(`<path d="M120 215 q80 -24 160 0" stroke="#e3513a" stroke-width="7" fill="none" opacity=".7"/>`);
        ring(330,235,15,"#fff","stroke=\"#0002\"");ring(330,235,9,"#d63b27");return}
      // generic chicken chunks (65, dragon, kung fu, lemon...)
      scatter(11,78,(x,y)=>add(`<rect x="${x-14}" y="${y-11}" width="${rr(26,34)}" height="${rr(20,26)}" rx="8" fill="${col}" stroke="#7b3a14" stroke-width="2" transform="rotate(${rr(0,90)} ${x} ${y})"/>`),200,150);
      if(has("lemon")){scatter(4,60,(x,y)=>{ring(x,y,12,"#f4dc4a");ring(x,y,8,"#fff4a0")},200,150)}
      if(has("dragon","kung","65")){scatter(8,70,(x,y)=>chilli(x,y),200,150);scatter(10,70,(x,y)=>sesame(x,y),200,150);if(has("dragon","kung"))scatter(8,62,(x,y)=>ring(x,y,4,"#f0a321"),200,150)}
      if(has("65"))scatter(6,70,(x,y)=>leaf(x,y,"#2e7d32"),200,150);
      return;
    }
    // ---------- STARTERS (manchurian, paneer, mushroom, potato, corn, gobi) ----------
    bg = "#ebdcc8"; plate(112);
    const sauceCol = has("honey")?"#d9892a":has("pepper")?"#9a8a68":"#a9331f";
    add(`<ellipse cx="200" cy="160" rx="86" ry="52" fill="${sauceCol}" opacity=".35"/>`);
    if(has("potato")){for(let i=0;i<16;i++){const x=rr(120,270),y=rr(90,180);add(`<rect x="${x}" y="${y}" width="9" height="${rr(40,62)}" rx="3" fill="#e8b54a" stroke="#b8802a" stroke-width="1.5" transform="rotate(${rr(-60,60)} ${x} ${y})"/>`)}scatter(20,80,(x,y)=>sesame(x,y));scatter(5,70,(x,y)=>chilli(x,y));return}
    if(has("nugget")||has("finger")){const f=has("finger");scatter(f?9:11,76,(x,y)=>add(f?`<rect x="${x-26}" y="${y-8}" width="52" height="18" rx="9" fill="#e4a444" stroke="#a8661f" stroke-width="2" transform="rotate(${rr(0,160)} ${x} ${y})"/>`:`<circle cx="${x}" cy="${y}" r="15" fill="#e4a444" stroke="#a8661f" stroke-width="2"/><circle cx="${x}" cy="${y}" r="6" fill="#f6c628"/>`),200,150);ring(300,235,15,"#fff","stroke=\"#0002\"");ring(300,235,9,"#d63b27");return}
    if(has("mushroom")){scatter(9,72,(x,y)=>add(`<path d="M${x-20} ${y+8} Q${x} ${y-28} ${x+20} ${y+8}Z" fill="${has("pepper")?"#8a6a48":"#b8322a"}"/><rect x="${x-5}" y="${y+6}" width="10" height="12" rx="3" fill="#f3e8d2"/>`),200,150);scatter(10,76,(x,y)=>chilli(x,y),200,150);if(has("pepper"))scatter(30,76,(x,y)=>ring(x,y,1.8,"#111"),200,150);return}
    if(has("paneer")){scatter(9,74,(x,y)=>add(`<rect x="${x-14}" y="${y-14}" width="28" height="28" rx="4" fill="#fff3d6" stroke="#b8322a" stroke-width="3"/>`),200,150);scatter(6,70,(x,y)=>add(`<rect x="${x}" y="${y}" width="16" height="16" rx="2" fill="#4aa23a" opacity=".9"/>`),200,150);scatter(6,70,(x,y)=>ring(x,y,6,"#d63b27"),200,150);return}
    if(has("gobi")){scatter(10,72,(x,y)=>{ring(x,y,17,"#d2823a");ring(x-6,y-5,9,"#e6a050");ring(x+7,y+4,8,"#c26f2c")},200,150);scatter(9,76,(x,y)=>chilli(x,y),200,150);scatter(12,76,(x,y)=>ring(x,y,2,"#5aa23a"),200,150);return}
    if(has("baby corn")){scatter(9,70,(x,y)=>add(`<rect x="${x-28}" y="${y-7}" width="56" height="15" rx="7" fill="#f0c94a" stroke="#a8331f" stroke-width="4" transform="rotate(${rr(0,160)} ${x} ${y})"/>`),200,150);scatter(14,76,(x,y)=>ring(x,y,3,"#5aa23a"),200,150);return}
    // manchurian balls
    scatter(has("chicken")?9:12,76,(x,y)=>{ring(x,y,16,has("chicken")?"#6e3a22":"#7a4a2b");add(`<ellipse cx="${x-5}" cy="${y-6}" rx="6" ry="4" fill="#fff" opacity=".2"/>`)},200,150);
    scatter(14,80,(x,y)=>ring(x,y,3.2,"#4aa23a"),200,150);
    if(has("gobi")==false&&has("veg")||has("chicken"))scatter(5,70,(x,y)=>add(`<rect x="${x}" y="${y}" width="11" height="11" rx="2" fill="#3d9a3a"/>`),200,150);
  };
  body();
  const defs = `<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg}"/><stop offset="1" stop-color="#d9c6a8"/></linearGradient>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><defs>${defs}</defs><rect width="400" height="300" fill="url(#g)"/>${s}</svg>`;
}

const have = new Set(fs.readdirSync(PHOTOS).map(f=>f.replace(/\.(jpe?g|png|webp)$/,"")));
let made = 0, photo = 0; const seen = new Map();
for(const o of Object.values(MENU)) for(const [cat,items] of Object.entries(o.categories)) for(const [name] of items){
  const slug = slugify(name);
  if(have.has(slug)){photo++;continue}
  const f = path.join(OUT,slug+".svg");
  if(fs.existsSync(f)&&seen.has(slug))continue;
  const svg = draw(name,cat); fs.writeFileSync(f,svg); seen.set(slug,svg); made++;
}
const dup = [...seen.values()].length - new Set(seen.values()).size;
console.log(`illustrations: ${made}, photos: ${photo}, duplicate svgs: ${dup}`);
