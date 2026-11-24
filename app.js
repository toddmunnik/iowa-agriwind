/* ---------- ISU 2026 data: C2-10 cash rents and 2021-2025 yields; A1-20 budgets ---------- */
const DIST={
 1:{n:'Northwest',lat:43.2,lon:-95.8,pasture:91},2:{n:'North Central',lat:43.1,lon:-93.6,pasture:101},3:{n:'Northeast',lat:43.0,lon:-91.6,pasture:133},
 4:{n:'West Central',lat:41.9,lon:-95.6,pasture:109},5:{n:'Central',lat:41.9,lon:-93.5,pasture:104},6:{n:'East Central',lat:41.8,lon:-91.1,pasture:98},
 7:{n:'Southwest',lat:41.0,lon:-95.1,pasture:103},8:{n:'South Central',lat:40.9,lon:-93.4,pasture:87},9:{n:'Southeast',lat:41.0,lon:-91.6,pasture:96}};
const RAW={
 1:[["Buena Vista","Cherokee","Clay","Dickinson","Emmet","Lyon","O'Brien","Osceola","Palo Alto","Plymouth","Pocahontas","Sioux"],[292,306,273,257,248,331,308,281,280,292,284,332],[209,212,199,190,204,206,214,209,200,195,212,215],[61,63,58,55,59,63,63,60,58,57,61,67]],
 2:[["Butler","Cerro Gordo","Floyd","Franklin","Hancock","Humboldt","Kossuth","Mitchell","Winnebago","Worth","Wright"],[297,265,235,288,267,274,280,273,289,250,275],[203,207,207,210,209,205,204,208,206,205,203],[59,61,58,61,62,59,61,60,61,58,60]],
 3:[["Allamakee","Winneshiek","Black Hawk","Bremer","Buchanan","Chickasaw","Clayton","Delaware","Dubuque","Fayette","Howard"],[274,274,301,305,274,310,269,325,321,253,276],[209,209,202,208,211,211,215,221,219,209,212],[59,59,59,62,61,59,62,64,66,60,58]],
 4:[["Audubon","Calhoun","Carroll","Crawford","Greene","Guthrie","Harrison","Ida","Monona","Sac","Shelby","Woodbury"],[288,276,293,304,275,255,284,317,319,291,293,315],[217,216,220,216,219,213,194,224,189,223,218,196],[62,63,63,62,63,61,56,64,55,64,61,56]],
 5:[["Boone","Dallas","Grundy","Hamilton","Hardin","Jasper","Marshall","Polk","Poweshiek","Story","Tama","Webster"],[285,290,300,282,288,282,289,267,291,281,313,282],[218,212,223,215,213,223,225,210,211,213,218,214],[65,62,67,62,64,65,66,62,62,63,63,62]],
 6:[["Benton","Cedar","Clinton","Iowa","Jackson","Johnson","Jones","Linn","Muscatine","Scott"],[292,274,282,279,258,273,268,279,261,271],[218,224,222,216,213,214,216,209,218,227],[63,67,65,61,65,62,63,60,65,70]],
 7:[["Adair","Adams","Cass","Fremont","Mills","Montgomery","Page","Pottawattamie","Taylor"],[225,246,255,246,269,260,242,282,227],[195,195,207,209,207,209,203,209,187],[58,57,59,61,58,60,59,59,58]],
 8:[["Appanoose","Clarke","Decatur","Ringgold","Lucas","Madison","Marion","Monroe","Union","Warren","Wayne"],[219,207,201,201,187,220,235,233,231,242,173],[172,173,174,174,167,194,203,174,189,190,179],[50,50,51,51,51,59,60,54,57,56,53]],
 9:[["Davis","Des Moines","Henry","Jefferson","Keokuk","Lee","Louisa","Mahaska","Wapello","Van Buren","Washington"],[200,272,283,255,244,286,259,243,243,214,294],[172,213,194,187,197,193,204,198,198,168,207],[53,66,63,57,61,61,63,61,61,53,63]]
};
const SHARED=new Set(["Allamakee","Winneshiek","Decatur","Ringgold","Mahaska","Wapello"]);
const COUNTIES=[];
for(const d in RAW){const [n,r,c,s]=RAW[d];n.forEach((nm,i)=>COUNTIES.push({name:nm,d:+d,rent:r[i],corn:c[i],soy:s[i],shared:SHARED.has(nm)}));}
const RMIN=Math.min(...COUNTIES.map(c=>c.rent)),RMAX=Math.max(...COUNTIES.map(c=>c.rent));

/* ---------- Wind data: capacity factor per county (share of full power a turbine delivers over a year, before wake and other losses) ---------- */
/* PLACEHOLDER district-level estimates. Replace by running county_wind.py on the Global Wind Atlas capacity-factor GeoTIFF
   and saving the result as iowa_wind.json next to index.html; the page loads that file automatically when it is present. */
const WIND_DIST_EST={1:0.50,2:0.48,3:0.43,4:0.48,5:0.46,6:0.43,7:0.46,8:0.42,9:0.40};
let WIND_REAL=false;
const WIND={};COUNTIES.forEach(c=>WIND[c.name]=WIND_DIST_EST[c.d]);
const cfOf=c=>WIND[c.name];

/* ---------- Crops and systems ---------- */
const SYSTEMS={
 row:{name:'Row crops',sub:'Farm right up to the tower pads',crops:['corn','soy']},
 graze:{name:'Grazing and hay',sub:'Sheep or hay around the turbines',crops:['sheep','hay']},
 hort:{name:'Horticulture and specialty crops',sub:'Berries and leafy greens (placeholders)',crops:['berry','greens']}};
const PH='Placeholder, replace with your own budget';
const CROPS={
 corn:{name:'Corn',yU:'bu/ac',pU:'$/bu',yF:c=>c.corn,price:4.20,cost:483.60,canopy:2.8,
  sY:'ISU 2026, county 5-year average',sP:'Example price from your brief',sC:'ISU 2026 budget, corn after soybeans, variable costs',
  note:'Turbines cast no meaningful shade on neighboring rows, so corn keeps its normal yield. What you lose is the land under the pads and access roads, plus some time working around the towers.'},
 soy:{name:'Soybeans',yU:'bu/ac',pU:'$/bu',yF:c=>c.soy,price:10.40,cost:290.21,canopy:1.0,
  sY:'ISU 2026, county 5-year average',sP:'Placeholder price, replace with current bids',sC:'ISU 2026 budget, soybeans after corn, variable costs',
  note:'Soybeans are farmed the same way as corn around the towers. The lease matters more here because soybean returns per acre are lower.'},
 sheep:{name:'Sheep grazing',yU:'season',pU:'$/ac',yF:()=>1,priceF:c=>DIST[c.d].pasture,cost:45.30,canopy:0.4,
  sY:'One grazing season per acre',sP:'ISU 2026 district rent, high-productivity pasture',sC:'ISU 2026 budget, maintaining grass-legume pasture, variable costs',
  note:'Sheep graze around the pads without trouble. Grazing income here is the ISU pasture rental value, which is modest, so the lease does most of the work.'},
 hay:{name:'Alfalfa hay',yU:'tons/ac',pU:'$/ton',yF:()=>4,price:170,cost:242.56,canopy:0.9,
  sY:'ISU 2026 budget, 4-ton scenario',sP:'Placeholder price, ISU reports cost not price',sC:'ISU 2026 budget, 4 tons, large round bales, variable costs',
  note:'Hay fields work well around towers. Hay price is a placeholder because ISU publishes production cost, not market price.'},
 berry:{name:'Berries (strawberries)',yU:'lb/ac',pU:'$/lb',yF:()=>8000,price:2.75,cost:15000,canopy:0.4,
  sY:PH,sP:PH,sC:PH,note:'Turbines add no shade, so light is not the limit here. Yield, price and cost are placeholders. ISU does not publish a berry budget in these files.'},
 greens:{name:'Leafy greens',yU:'lb/ac',pU:'$/lb',yF:()=>8000,price:2.20,cost:11500,canopy:0.4,
  sY:PH,sP:PH,sC:PH,note:'Yield, price and cost are placeholders for you to replace. Most of the farm income in this option comes from your own budget numbers.'}
};

/* ---------- State ---------- */
const S={county:COUNTIES.find(c=>c.name==='Story'),system:'row',crop:'corn',target:90,lease:4000,acres:640,mw:3,sx:5,sy:8,mode:'auto',ov:{},ret:1.0,fp:1.5,oth:0.07};
const $=id=>document.getElementById(id);
const ACRE=4046.86,SP=250,HOURS=8760;
const money=v=>(v<0?'−':'')+'$'+Math.round(Math.abs(v)).toLocaleString('en-US');
const num=(v,d=0)=>Number(v).toLocaleString('en-US',{minimumFractionDigits:d,maximumFractionDigits:d});
const cr=()=>CROPS[S.crop];
function val(k){const o=S.ov[S.crop]||{};if(k in o)return o[k];const c=cr();
 if(k==='yield')return c.yF(S.county);if(k==='price')return c.priceF?c.priceF(S.county):c.price;if(k==='cost')return c.cost;}
const cssVar=n=>getComputedStyle(document.documentElement).getPropertyValue(n).trim();

/* ---------- Turbine and spacing model ---------- */
/* Rotor diameter from rating at a fixed 250 W per square meter of swept area; hub height about 0.73 rotor diameters. */
const rotorD=mw=>Math.sqrt(4*mw*1e6/(Math.PI*SP));
const hubH=D=>0.73*D;
/* Simple wake rule: about 8% loss at 5 x 8 rotor diameters, rising as the grid gets denser, capped at 35%. */
const wakeLoss=(sx,sy)=>Math.min(0.35,0.08*Math.pow(40/(sx*sy),1.5));
const areaAc=(mw,sx,sy)=>{const D=rotorD(mw);return sx*sy*D*D/ACRE;};
function search(){
 const target=S.target/100;let best=null,fall=null,tested=0;
 for(let sx=3;sx<=8.001;sx+=0.5)for(let sy=5;sy<=12.001;sy+=0.5){
  if(sy/sx<1.2||sy/sx>2.2)continue; /* rule of thumb: turbine grids are usually 1.2 to 2.2 times longer along the wind */
  tested++;const eff=1-wakeLoss(sx,sy),dens=1/(sx*sy),mwhRel=dens*eff,cand={sx,sy,eff,mwhRel};
  if(eff>=target-1e-9&&(!best||mwhRel>best.mwhRel+1e-9))best=cand;
  if(!fall||eff>fall.eff+1e-9)fall=cand;
 }
 return {pick:best||fall,met:!!best,tested};
}
function evaluate(){
 const D=rotorD(S.mw),hub=hubH(D),tip=hub+D/2,A=areaAc(S.mw,S.sx,S.sy),mwAc=S.mw/A,acPerMW=A/S.mw;
 const loss=wakeLoss(S.sx,S.sy),eff=1-loss,cf=cfOf(S.county);
 const farmable=Math.max(0,1-S.fp*S.mw/A);
 const mwh=mwAc*cf*HOURS*eff*(1-S.oth);
 return {D,hub,tip,A,mwAc,acPerMW,loss,eff,cf,farmable,mwh,sxm:S.sx*D,sym:S.sy*D};
}
let M=null;

/* ---------- UI: county tiles and benchmark ---------- */
function buildTiles(){
 const host=$('districts');host.innerHTML='';
 for(let d=1;d<=9;d++){
  const box=document.createElement('div');box.className='dist';
  box.innerHTML='<div class="dist-t">'+DIST[d].n+'</div><div class="tiles"></div>';
  const tiles=box.querySelector('.tiles');
  COUNTIES.filter(c=>c.d===d).sort((a,b)=>a.name.localeCompare(b.name)).forEach(c=>{
   const b=document.createElement('button');b.type='button';b.className='tile';b.dataset.name=c.name;
   const p=10+(c.rent-RMIN)/(RMAX-RMIN)*45;
   b.style.background=`color-mix(in srgb,var(--crop) calc(${(p/56).toFixed(3)} * var(--tile-max)),var(--surface))`;
   b.innerHTML=c.name+(c.shared?'†':'')+'<b>$'+c.rent+'</b>';if(c.name.length>8)b.classList.add('long');
   b.title=c.name+' County: $'+c.rent+' per acre average cash rent';
   b.setAttribute('aria-pressed',c===S.county);
   b.addEventListener('click',()=>setCounty(c));
   tiles.appendChild(b);
  });
  host.appendChild(box);
 }
}
function markTiles(){document.querySelectorAll('.tile').forEach(t=>t.setAttribute('aria-pressed',t.dataset.name===S.county.name));}
function renderBench(){
 const c=S.county,D=DIST[c.d],cf=cfOf(c);
 $('bench').innerHTML=
 `<div class="src"><h3>${c.name} County · ISU Extension <span class="badge ok">2026 data</span></h3>
  <div class="kv"><span>Average cash rent</span><b>${money(c.rent)}/ac</b></div>
  <div class="kv"><span>Corn yield, 5-year avg</span><b>${c.corn} bu/ac</b></div>
  <div class="kv"><span>Soybean yield, 5-year avg</span><b>${c.soy} bu/ac</b></div>
  <div class="kv"><span>${D.n} pasture rent</span><b>${money(D.pasture)}/ac</b></div>
  <div class="kv"><span>Budget costs: corn, soybeans</span><b>$484, $290/ac</b></div></div>
  <div class="src"><h3>Wind at ${c.name} County's center <span class="badge ${WIND_REAL?'ok':'est'}">${WIND_REAL?'Measured':'Estimate'}</span></h3>
  <div class="kv"><span>Turbine output: share of full power over a year</span><b>${num(cf*100)}%</b></div>
  <div class="kv"><span>Electricity a year per MW of turbines</span><b>${num(cf*HOURS)} MWh</b></div>
  <p class="small">${WIND_REAL?'Output is the long-term average for a modern turbine at the county\'s center point, before turbines in the same field slow each other\'s wind.':'These are regional estimates until the county wind data file is added. Output is the share of a turbine\'s full rating it delivers on average, before turbines in the same field slow each other\'s wind.'}</p></div>`;
}
/* ---------- UI: system and crop ---------- */
function renderSystems(){
 $('systems').innerHTML='';
 for(const k in SYSTEMS){const b=document.createElement('button');b.type='button';b.className='opt';b.setAttribute('aria-pressed',k===S.system);
  b.innerHTML='<b>'+SYSTEMS[k].name+'</b><span>'+SYSTEMS[k].sub+'</span>';
  b.addEventListener('click',()=>{S.system=k;S.crop=SYSTEMS[k].crops[0];renderSystems();renderCrops();onCropChange();});$('systems').appendChild(b);}
}
function renderCrops(){
 $('crops').innerHTML='';
 SYSTEMS[S.system].crops.forEach(k=>{const b=document.createElement('button');b.type='button';b.className='pill';b.textContent=CROPS[k].name;b.setAttribute('aria-pressed',k===S.crop);
  b.addEventListener('click',()=>{S.crop=k;renderCrops();onCropChange();});$('crops').appendChild(b);});
 $('cropnote').textContent=cr().note;
}
function onCropChange(){$('cropnote').textContent=cr().note;buildAssump();render();}
function setCounty(c){S.county=c;for(const k in S.ov)delete S.ov[k].yield,delete S.ov[k].price;markTiles();renderBench();buildAssump();render();}

/* ---------- Layout checks and metrics ---------- */
function renderMetrics(){
 $('metrics').innerHTML=
  `<div class="m"><span class="v">${num(M.acPerMW,1)}</span><span class="l">Acres per MW of turbines</span></div>
   <div class="m"><span class="v">${num(M.farmable*100,1)}%</span><span class="l">Land still farmed</span></div>
   <div class="m"><span class="v">${num(M.eff*100)}%</span><span class="l">Wind output kept after turbines slow each other</span></div>
   <div class="m"><span class="v">${num(M.mwh,0)}</span><span class="l">Electricity made per acre, MWh a year</span></div>`;
 const hit=M.eff>=S.target/100-1e-9,ok=S.sx>=3&&S.sy>=5,row=(cls,tag,txt)=>`<div class="check ${cls}"><i>${tag}</i><span>${txt}</span></div>`;
 $('checks').innerHTML=
  row(hit?'pass':'fail',hit?'PASS':'FAIL',`Wind output kept: ${num(M.eff*100)}% against your ${S.target}% goal.`)+
  row(ok?'pass':'fail',ok?'PASS':'FAIL',`Spacing: ${num(S.sx,1)} × ${num(S.sy,1)} rotor diameters (${num(M.sxm)} m across, ${num(M.sym)} m along the wind). A common rule of thumb is at least 3 across and 5 along.`)+
  row('info','INFO',`Tip height ${num(M.tip)} m (${num(M.tip*3.281)} ft). Structures over 200 ft need FAA notice.`)+
  row('info','INFO',`Farm equipment drives freely between towers. Pads and roads take about ${num(S.fp*S.mw,1)} acres per turbine, so ${num(M.farmable*100,1)}% of the land stays in crops.`);
}
/* ---------- Side view: one tower, to scale ---------- */
function drawSection(){
 const c=cr(),VW=720,VH=380,gy=VH-40,top=26,sc=(gy-top)/M.tip,cx=VW/2,hy=gy-M.hub*sc,R=M.D/2*sc;
 const ink2=cssVar('--ink2'),ink3=cssVar('--ink3'),wind=cssVar('--wind'),crop=cssVar('--crop'),ok=cssVar('--ok');
 let s=`<svg viewBox="0 0 ${VW} ${VH}" role="img" aria-label="Side view of one wind turbine beside a tractor, drawn to scale">`;
 s+=`<rect x="0" y="${gy-Math.max(3,c.canopy*sc)}" width="${VW}" height="${Math.max(3,c.canopy*sc)}" fill="${crop}" opacity=".35"/>`;
 s+=`<line x1="0" x2="${VW}" y1="${gy}" y2="${gy}" stroke="${ink2}"/>`;
 s+=`<circle cx="${cx}" cy="${hy}" r="${R}" fill="none" stroke="${wind}" stroke-dasharray="5 4" opacity=".6"/>`;
 s+=`<polygon points="${cx-3},${gy} ${cx+3},${gy} ${cx+1.6},${hy} ${cx-1.6},${hy}" fill="${ink3}"/>`;
 for(const a of [-90,30,150]){const r=a*Math.PI/180;s+=`<line x1="${cx}" y1="${hy}" x2="${cx+R*Math.cos(r)}" y2="${hy+R*Math.sin(r)}" stroke="${wind}" stroke-width="3" stroke-linecap="round"/>`;}
 s+=`<circle cx="${cx}" cy="${hy}" r="4.5" fill="${ink2}"/>`;
 const tw=6*sc,th=3.2*sc,tx=cx+R+70;
 s+=`<rect x="${tx}" y="${gy-th}" width="${Math.max(tw,9)}" height="${Math.max(th,5)}" fill="${ok}"/>`;
 s+=`<text class="xt" x="${tx+Math.max(tw,9)/2}" y="${gy-th-6}" text-anchor="middle" style="fill:${ok}">tractor, 3.2 m</text>`;
 s+=`<text class="xt" x="${VW-4}" y="${gy-Math.max(3,c.canopy*sc)-5}" text-anchor="end" style="fill:${crop}">crop canopy ${c.canopy} m</text>`;
 const dim=(x,y1,y2,t,anchor)=>`<line x1="${x}" x2="${x}" y1="${y1}" y2="${y2}" stroke="${ink2}"/><line x1="${x-4}" x2="${x+4}" y1="${y1}" y2="${y1}" stroke="${ink2}"/><line x1="${x-4}" x2="${x+4}" y1="${y2}" y2="${y2}" stroke="${ink2}"/><text class="xt" x="${x+(anchor==='end'?-8:8)}" y="${(y1+y2)/2+4}" text-anchor="${anchor||'start'}">${t}</text>`;
 s+=dim(cx-R-40,gy,hy,'hub '+num(M.hub)+' m','end');
 s+=dim(cx+R+40,gy,gy-M.tip*sc,'tip '+num(M.tip)+' m ('+num(M.tip*3.281)+' ft)');
 s+=`<line x1="${cx-R}" x2="${cx+R}" y1="${hy+R+14}" y2="${hy+R+14}" stroke="${ink2}"/><text class="xt" x="${cx}" y="${hy+R+28}" text-anchor="middle">rotor ${num(M.D)} m across</text>`;
 s+=`</svg>`;$('xsec').innerHTML=s;
}
/* ---------- Plan view ---------- */
function drawPlan(){
 const cv=$('plan'),ctx=cv.getContext('2d'),Wm=3*M.sym,Hm=3*M.sxm;
 cv.width=640;cv.height=Math.max(260,Math.min(520,Math.round(640*Hm/Wm)));
 const Wd=cv.width,Hd=cv.height,sc=Math.min(Wd/Wm,Hd/Hm),ox=(Wd-Wm*sc)/2,oy=(Hd-Hm*sc)/2;
 const wind=cssVar('--wind'),crop=cssVar('--crop'),ink=cssVar('--ink'),dual=cssVar('--dual'),bg=cssVar('--surface2');
 ctx.fillStyle=bg;ctx.fillRect(0,0,Wd,Hd);ctx.globalAlpha=.28;ctx.fillStyle=crop;ctx.fillRect(ox,oy,Wm*sc,Hm*sc);ctx.globalAlpha=1;
 const pts=[];for(let i=0;i<3;i++)for(let j=0;j<3;j++)pts.push([ox+(i+.5)*M.sym*sc,oy+(j+.5)*M.sxm*sc]);
 for(const [x,y] of pts){
  const g=ctx.createLinearGradient(x,0,x+M.sym*sc*0.95,0);g.addColorStop(0,wind);g.addColorStop(1,'rgba(0,0,0,0)');
  ctx.globalAlpha=.3;ctx.fillStyle=g;ctx.fillRect(x,y-M.D/2*sc,M.sym*sc*0.95,M.D*sc);ctx.globalAlpha=1;
 }
 const padR=Math.sqrt(S.fp*S.mw*ACRE/Math.PI)*sc;
 for(const [x,y] of pts){
  ctx.strokeStyle=dual;ctx.setLineDash([4,3]);ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(x,y,Math.max(5,padR),0,7);ctx.stroke();ctx.setLineDash([]);
  ctx.strokeStyle=wind;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(x,y-M.D/2*sc);ctx.lineTo(x,y+M.D/2*sc);ctx.stroke();
  ctx.fillStyle=ink;ctx.beginPath();ctx.arc(x,y,2.5,0,7);ctx.fill();
 }
 const [ax,ay]=pts[0],[bx]=pts[3],[,cy]=pts[1];
 ctx.strokeStyle=ink;ctx.fillStyle=ink;ctx.lineWidth=1;ctx.font='500 12px IBM Plex Mono, monospace';
 const yl=pts[0][1]-M.D/2*sc-10;
 ctx.beginPath();ctx.moveTo(ax,yl);ctx.lineTo(bx,yl);ctx.stroke();ctx.textAlign='center';ctx.fillText(num(S.sy,1)+' D = '+num(M.sym)+' m along the wind',(ax+bx)/2,Math.max(12,yl-5));
 const xl=ax-14;ctx.beginPath();ctx.moveTo(xl,ay);ctx.lineTo(xl,cy);ctx.stroke();ctx.save();ctx.translate(xl-6,(ay+cy)/2);ctx.rotate(-Math.PI/2);ctx.fillText(num(S.sx,1)+' D = '+num(M.sxm)+' m across',0,0);ctx.restore();
 ctx.textAlign='left';ctx.fillText('wind →',ox+6,Hd-8);
 const bar=500*sc;ctx.textAlign='right';ctx.fillRect(Wd-bar-10,Hd-14,bar,3);ctx.fillText('500 m',Wd-10,Hd-20);
 $('planNote').textContent=`Each turbine is a dark dot with its rotor drawn edge-on. The shaded strip downwind is the area where wind is slowed. The dashed circle is the land taken by the pad and its share of roads (${num(S.fp*S.mw,1)} acres), the only land lost to crops.`;
}
function tableView(){
 let r='<tr><th>Spacing across the wind</th><th>Wind output kept</th><th>Acres per MW</th><th>MWh per acre a year</th></tr>';
 for(let sx=3;sx<=8;sx+=1){const e=1-wakeLoss(sx,S.sy),a=areaAc(S.mw,sx,S.sy)/S.mw;r+=`<tr><td>${sx} D (${num(sx*M.D)} m)${sx===S.sx?' ← current':''}</td><td>${num(e*100)}%</td><td>${num(a,1)}</td><td>${num(cfOf(S.county)*HOURS*e*(1-S.oth)/a,0)}</td></tr>`;}
 $('ptable').innerHTML=r;
}

/* ---------- Ledger ---------- */
function renderLedger(){
 const Y=val('yield'),Pr=val('price'),C=val('cost'),f=M.farmable,R=S.ret;
 const leaseAc=S.lease*M.mwAc,farm=Y*Pr-C,dual=leaseAc+f*(Y*R*Pr-C);
 $('ledTitle').textContent=S.county.name+' County, '+cr().name.toLowerCase();
 $('nFarm').textContent=money(farm);$('nWind').textContent=money(leaseAc);$('nDual').textContent=money(dual);
 const mx=Math.max(Math.abs(farm),Math.abs(leaseAc),Math.abs(dual),1);
 $('bFarm').style.width=Math.max(1,Math.abs(farm)/mx*100)+'%';$('bWind').style.width=Math.max(1,Math.abs(leaseAc)/mx*100)+'%';$('bDual').style.width=Math.max(1,Math.abs(dual)/mx*100)+'%';
 $('leaseMult').textContent=`${num(leaseAc/S.county.rent,2)} times the county's ${money(S.county.rent)} cash rent`;
 const d=dual-farm,dd=$('dDual');dd.className='delta '+(d>=0?'up':'down');
 dd.textContent=(d>=0?'+':'−')+money(Math.abs(d)).replace('−','')+' per acre compared with farming alone';
 const u=cr().yU==='season'?'':' '+cr().yU.replace('/ac',''),pf=cr().pU==='$/ac'?money(Pr):'$'+num(Pr,2);
 $('formula').innerHTML=`${money(S.lease)} per MW × ${num(M.mwAc,4)} MW per acre = ${money(leaseAc)} lease<br>${money(leaseAc)} + ${num(f*100,1)}% farmed × (${num(Y,Y%1?1:0)}${u} × ${num(R*100)}% × ${pf} − ${money(C)} inputs) = ${money(dual)}<br>Farm only: ${num(Y,Y%1?1:0)}${u} × ${pf} − ${money(C)} inputs = ${money(farm)}`;
 const turb=S.acres/M.A,mwTot=turb*S.mw,small=turb<1,lo=Math.floor(turb),hi=Math.ceil(turb);
 const count=small?'less than one turbine':(lo===hi?`room for ${lo} turbines`:`room for about ${num(turb,1)} turbines (plan on ${lo} or ${hi})`);
 $('parcel').innerHTML=`<h3>Your ${num(S.acres)} acres, per year</h3>
  <div class="kv"><span>Turbines</span><b>${small?'under 1':num(turb,1)}</b></div>
  <div class="kv"><span>Turbine capacity</span><b>${num(mwTot,1)} MW</b></div>
  <div class="kv"><span>Wind lease income</span><b>${money(S.lease*mwTot)}</b></div>
  <div class="kv"><span>Farming alone</span><b>${money(farm*S.acres)}</b></div>
  <div class="kv"><span>Wind lease plus crop</span><b>${money(dual*S.acres)}</b></div>
  <div class="kv"><span>Electricity made</span><b>${num(M.mwh*S.acres/1000,1)} GWh</b></div>
  <p class="small">At ${num(S.sx,1)} × ${num(S.sy,1)} rotor widths each ${S.mw} MW turbine needs about ${num(M.A)} acres, so this parcel has ${count}.</p>
  ${small?`<p class="warn">This parcel is smaller than the ${num(M.A)} acres one turbine needs at this spacing. Whether a turbine can sit here depends on neighboring land, setbacks and the project layout, so treat these totals as rough.</p>`:''}`;
 $('leaseV').textContent=money(S.lease);$('acresV').textContent=num(S.acres);
 $('leaseAc').textContent=`At this spacing that is ${money(leaseAc)} per acre per year across the whole leased area.`;
}
/* ---------- Inputs table ---------- */
function buildAssump(){
 const c=cr(),f=(id,v,st)=>`<input id="${id}" type="number" step="${st}" value="${v}">`;
 $('assump').innerHTML=`<tr><th>Input</th><th>Value</th><th>Source</th></tr>
 <tr><td>Yield, ${c.yU}</td><td>${f('aY',val('yield'),'any')}</td><td>${c.sY}</td></tr>
 <tr><td>Price, ${c.pU}</td><td>${f('aP',+val('price').toFixed(2),'any')}</td><td>${c.sP}</td></tr>
 <tr><td>Input costs, $/ac</td><td>${f('aC',val('cost'),'any')}</td><td>${c.sC}</td></tr>
 <tr><td>Yield on farmed land beside turbines, %</td><td>${f('aR',Math.round(S.ret*100),1)}</td><td>Placeholder. Lower it if you expect crop losses near towers</td></tr>
 <tr><td>Land taken per MW (pads and roads), acres</td><td>${f('aF',S.fp,0.1)}</td><td>NREL range about 0.7 to 2.5 acres per MW</td></tr>
 <tr><td>Other energy losses (downtime, electrical), %</td><td>${f('aO',Math.round(S.oth*100),1)}</td><td>Estimate</td></tr>
 <tr><td>Rotor size 250 W per m², wake rule 8% loss at 5 × 8 diameters</td><td colspan="2">Fixed assumptions. A simple spacing rule, not a wind-farm engineering study</td></tr>`;
 const bind=(id,fn)=>$(id).addEventListener('input',e=>{const v=parseFloat(e.target.value);if(!isFinite(v))return;fn(v);render();});
 const ov=()=>(S.ov[S.crop]=S.ov[S.crop]||{});
 bind('aY',v=>ov().yield=v);bind('aP',v=>ov().price=v);bind('aC',v=>ov().cost=v);
 bind('aR',v=>S.ret=Math.min(1.2,Math.max(0,v/100)));bind('aF',v=>S.fp=Math.max(0,v));bind('aO',v=>S.oth=Math.min(.5,Math.max(0,v/100)));
}
/* ---------- Orchestration ---------- */
function syncSliders(){
 $('target').value=S.target;$('mwSl').value=S.mw;$('sxSl').value=S.sx;$('sySl').value=S.sy;
 $('targetV').textContent=S.target+'%';$('mwV').textContent=num(S.mw,1)+' MW';$('sxV').textContent=num(S.sx,1)+' D';$('syV').textContent=num(S.sy,1)+' D';
 $('lease').value=S.lease;$('acres').value=S.acres;
}
function render(){M=evaluate();syncSliders();renderMetrics();drawSection();drawPlan();tableView();renderLedger();}
function runAuto(){
 const t0=performance.now(),r=search();S.sx=r.pick.sx;S.sy=r.pick.sy;S.mode='auto';render();
 $('genNote').textContent=(r.met?'':`No spacing reaches ${S.target}%, showing the closest. `)+`Tested ${r.tested.toLocaleString('en-US')} layouts.`;
}
function manual(){S.mode='manual';$('genNote').textContent='Custom layout. Press Generate to return to the best fit.';render();}
$('target').addEventListener('input',e=>{S.target=+e.target.value;runAuto();});
$('mwSl').addEventListener('input',e=>{S.mw=+e.target.value;S.mode==='auto'?runAuto():manual();});
$('sxSl').addEventListener('input',e=>{S.sx=+e.target.value;manual();});
$('sySl').addEventListener('input',e=>{S.sy=+e.target.value;manual();});
$('gen').addEventListener('click',runAuto);
$('useStd').addEventListener('click',()=>{S.sx=5;S.sy=8;manual();});
$('lease').addEventListener('input',e=>{S.lease=+e.target.value;renderLedger();});
$('acres').addEventListener('input',e=>{S.acres=+e.target.value;renderLedger();});
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{drawSection();drawPlan();});
new MutationObserver(()=>{drawSection();drawPlan();}).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});

buildTiles();renderBench();renderSystems();renderCrops();buildAssump();runAuto();
/* Use real county wind data when iowa_wind.json sits beside this page (made by county_wind.py). Needs a web server, such as GitHub Pages. */
if(location.protocol.startsWith('http'))fetch('iowa_wind.json').then(r=>r.ok?r.json():null).then(j=>{
 if(!j||Object.keys(j).length<90)return;
 COUNTIES.forEach(c=>{if(typeof j[c.name]==='number')WIND[c.name]=j[c.name];});
 WIND_REAL=true;renderBench();render();
}).catch(()=>{});
