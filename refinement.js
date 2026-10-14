'use strict';
function normalizeRefinement(s){s.benchRestDays=s.benchRestDays||{};if(s.waypoint==='atelier')s.waypoint='shop';const t=s.orchardTrial;if(t&&(!Number.isFinite(t.remaining)||!Array.isArray(t.fruits)||t.day!==s.day))s.orchardTrial=null;if(s.orchardTrial&&!s.orchardTrial.completed)s.orchardTrial.remaining=Math.min(30,s.orchardTrial.remaining);return s;}
function relocateObject(o,x,y){const dx=x-o.x,dy=y-o.y;o.x=x;o.y=y;o.depth=y+o.h;if(o.anchor)o.anchor={x:o.anchor.x+dx,y:o.anchor.y+dy};if(o.door)o.door={x:o.door.x+dx,y:o.door.y+dy};}
function configureRefinement(){
 const ruins=Valley.objects.find(o=>o.next==='ruins');relocateObject(ruins,1228,145);Object.assign(areaDefs.ruins,{entrance:{...ruins.door},outside:[ruins.door.x,ruins.door.y+16]});Object.assign(mapLandmarks.find(m=>m.id==='ruins'),ruins.door);
 for(const o of Valley.objects.filter(o=>o.type==='tree'&&!o.hidden&&o.x>1190&&o.x<1320&&o.y>100&&o.y<250))relocateObject(o,o.x+85,o.y-30);
 const mushrooms=Valley.objects.filter(o=>o.type==='mushroom');for(const [i,o] of mushrooms.entries()){const [x,y,w,h,color]=[[1320,470,18,18,'#b2a3d0'],[1447,483,22,23,'#d69caf'],[1327,510,12,14,'#d2b3a0'],[1453,519,14,16,'#a4bca5']][i%4];Object.assign(o,{x,y,w,h,color,depth:y+h});}
 for(let y=6;y<=9;y++)for(let x=48;x<55;x++)Valley.tiles[y][x]='grass';
 const gate=Valley.objects.find(o=>o.type==='forest-gate');Object.assign(gate,{x:1497,y:224,w:31,h:112,depth:336});
 Valley.objects.push({type:'sign',x:1440,y:347,w:22,h:18,solid:true,text:'✿',interaction:'forest-gate-sign',anchor:{x:1451,y:379},depth:365});
 const tree=Valley.objects.find(o=>o.type==='tree'&&o.x>1360&&o.x<1470&&o.y>80&&o.y<240&&!o.hidden);if(tree)relocateObject(tree,1580,190);
 const season=Valley.objects.find(o=>o.puzzle==='seasons');relocateObject(season,1609,650);season.anchor={x:1626,y:686};
 for(const [x,y,variant,size] of [[1720,163,'lilac',.72],[1925,155,'gold',.7],[1960,442,'blue',.65],[1778,643,'lilac',.65],[1930,738,'gold',.65],[1683,973,'blue',.64]])Valley.objects.push({type:'tree',x,y,w:18,h:16,solid:true,size,variant,depth:y+16,seed:x+y});
 Valley.objects.push({type:'seedbox',x:1858,y:189,w:26,h:18,solid:true,interaction:'orchard-trial',anchor:{x:1871,y:223},depth:207});
 for(const o of Valley.objects.filter(o=>o.type==='bench'&&!o.hidden)){if(!Valley.canStand('world',o.x+o.w/2,o.y+o.h+12))relocateObject(o,o.x-80,o.y);}
 const balance=Valley.objects.find(o=>o.puzzle==='balance');if(balance){relocateObject(balance,1905,890);balance.anchor={x:1917,y:921};}
 configurePolish();addRefinementFurniture();mapArtwork=null;Valley.invalidateGround('world');
}
function nearest(){let best=layoutNearest();if(state?.swimming)return wardrobeNearest(best);const list=scene==='world'?Valley.objects:Valley.interiors[scene].objects;const add=(o,type,label,x,y,limit=30)=>{const d=Math.hypot(player.x-x,player.y-y);if(d<=limit&&(!best||d<best.d)&&Valley.lineClear(scene,player.x,player.y,x,y))best={type,label,object:o,x,y,d};};for(const o of list.filter(o=>!o.hidden)){if(o.type==='bench'){const x=Math.max(o.x+5,Math.min(player.x,o.x+o.w-5)),y=o.y+o.h+10;add(o,'bench-rest','E · Descansar',x,y);if(best?.object===o){best.type='bench-rest';best.label='E · Descansar';}}if(o.interaction==='forest-gate'){const x=player.x<o.x?o.x-10:o.x+o.w+10,y=Math.max(o.y,Math.min(player.y,o.y+o.h));add(o,'forest-gate','E · Examinar o portão',x,y,32);}if(o.interaction==='forest-gate-sign'&&best?.object===o)best.label='E · Ler o desafio do portão';if(o.interaction==='orchard-trial'&&best?.object===o)best.label='E · Desafio da cesta de frutos';}return livingNearest(moonNearest(wardrobeNearest(best)));}
function refinementInteract(t){if(t.type==='forest-gate'){if(state.puzzles.forestGateSolved)toast('O portão está aberto. Pode entrar!');else info('O bosque está protegido','<p>Conclua o desafio da placa ao lado para abrir o portão.</p>');return true;}if(t.type==='forest-gate-sign')return layoutInteract({...t,type:'forest-gate',object:Valley.objects.find(o=>o.type==='forest-gate')});if(t.type==='bench-rest'){const o=t.object,key=o.furnitureUid||scene+':'+o.x+':'+o.y;if(state.benchRestDays[key]===state.day){toast('Você já fez uma pausa neste banco hoje.');return true;}state.benchRestDays[key]=state.day;state.energy=Math.min(100,state.energy+12);playSound('pet');toast('Uma pausa tranquila. +12 energia.');return true;}if(t.type==='orchard-trial'){openOrchardTrial();return true;}return false;}
function claimOrchardReward(){const t=state.orchardTrial;if(!t||t.day!==state.day||!t.completed||t.claimed)return false;t.claimed=true;state.puzzles.basketSolved=true;state.money+=120;state.inventory.star+=1;state.inventory.seeds+=5;sparkMagic(scene,player.x,player.y);screenCelebration=performance.now();updateOrchardHud();save();updateHud();toast('Cesta completa! +120 moedas, +1 estrela e +5 sementes.');return true;}
function openOrchardTrial(){const t=state.orchardTrial;if(t?.day===state.day&&t.completed){if(!t.claimed){claimOrchardReward();return;}toast('Você já recebeu o prêmio da cesta de hoje. Volte amanhã!');return;}if(t?.day===state.day&&t.remaining>0){info('A cesta de frutos',`<p>Faltam ${Math.ceil(t.remaining)} segundos. Colha nas árvores: ${['apple','peach','berry'].filter(f=>!t.fruits.includes(f)).map(f=>itemInfo[f][1]).join(', ')}.</p>`);return;}const available=['apple','peach','berry'].every(f=>Valley.objects.some(o=>o.fruit===f&&state.gathered[o.fruitId]!==state.day));info('Corrida da cesta','<p>Colha uma maçã, um pêssego e uma amora nas árvores do bosque em <b>30 segundos</b>. Ao completar, você recebe automaticamente <b>120 moedas, 1 estrela e 5 sementes</b>. O tempo pausa nos menus.</p>'+(!available?'<p>Algumas árvores já foram colhidas hoje. Volte amanhã para tentar.</p>':'<button id="orchard-start" class="primary">Começar o desafio</button>'));if(available)$('orchard-start').onclick=()=>{state.orchardTrial={day:state.day,remaining:30,fruits:[],completed:false,claimed:false};$('info-modal').close();updateOrchardHud();save();};}
function recordOrchardFruit(f){const t=state.orchardTrial;if(!t||t.day!==state.day||t.remaining<=0||t.completed)return;if(!t.fruits.includes(f))t.fruits.push(f);if(['apple','peach','berry'].every(f=>t.fruits.includes(f))){t.completed=true;claimOrchardReward();}updateOrchardHud();}

function advanceOrchardTrial(dt){const t=state.orchardTrial;if(!t)return;if(t.day!==state.day){state.orchardTrial=null;updateOrchardHud();return;}if(!t.completed&&t.remaining>0){t.remaining=Math.max(0,t.remaining-dt);if(!t.remaining)toast('O tempo da cesta acabou. Você pode tentar novamente.');}updateOrchardHud();}
function updateOrchardHud(){const t=state.orchardTrial,visible=t?.day===state.day&&!t.claimed&&(t.completed||t.remaining>0);$('orchard-trial').classList.toggle('hidden',!visible);if(visible)$('orchard-trial').textContent=t.completed?'✧ Cesta completa · volte para receber':`Cesta · ${Math.ceil(t.remaining)}s · ${t.fruits.includes('apple')?'✓':'○'} maçã · ${t.fruits.includes('peach')?'✓':'○'} pêssego · ${t.fruits.includes('berry')?'✓':'○'} amora`;}
function addRefinementFurniture(){for(const [id,base,name,color] of [['skySofa','sofa','Sofá azul-sereno','#91baca'],['skyBed','lavenderBed','Cama Céu','#91baca'],['mintShelf','bookshelf','Estante de menta','#95b6a4'],['peachShelf','bookshelf','Estante de pêssego','#d9ac9a'],['mintTable','teaTable','Mesinha de menta','#95b6a4'],['lavenderTable','teaTable','Mesinha de lavanda','#b6a2cd'],['mintLamp','warmLamp','Luz de menta','#b9dccc'],['lavenderLamp','warmLamp','Luz de lavanda','#d2bce8']])furnitureCatalog[id]={...furnitureCatalog[base],name,color};furnitureCatalog.cushion={name:'Almofada rosinha',type:'cushion',color:'#dcadc7',icon:'✿',price:35,w:18,h:15,solid:false,where:['house']};furnitureCatalog.mintCushion={...furnitureCatalog.cushion,name:'Almofada de menta',color:'#a4c3ae'};furnitureCatalog.lavenderCushion={...furnitureCatalog.cushion,name:'Almofada de lavanda',color:'#b7aad6'};}
function drawRefinementFurniture(c,o,f,time){const {x,y,w,h}=o,r=Valley.rect,e=Valley.ellipse;if(f.type==='cushion'){r(c,x,y,w,h,'#786078');r(c,x+2,y+2,w-4,h-4,f.color);r(c,x+4,y+4,w-8,2,'#f3dfde');e(c,x+w/2,y+h/2,2,2,'#eddbb9');return true;}if(f.type==='table'&&o.furnitureId!=='teaTable'){r(c,x+4,y+10,4,h-8,'#705665');r(c,x+w-8,y+10,4,h-8,'#705665');r(c,x-2,y-2,w+4,h-7,'#705665');r(c,x,y,w,h-9,f.color);e(c,x+w/2,y+7,5,3,'#f1e4d0');r(c,x+w/2-2,y+2,5,5,'#f1e4d0');return true;}return false;}
function configurePolish(){
 const sign=Valley.objects.find(o=>o.interaction==='forest-gate-sign');relocateObject(sign,1446,233);sign.anchor={x:1457,y:264};const entryLamp=Valley.objects.find(o=>o.type==='lamp'&&o.x===1315&&o.y===283);if(entryLamp)relocateObject(entryLamp,1315,238);sign.text='✿';sign.gateClue=true;
 const bench=Valley.objects.find(o=>o.interaction==='furniture-shop');relocateObject(bench,802,594);delete bench.interaction;delete bench.anchor;
 for(let i=Valley.objects.length-1;i>=0;i--)if(Valley.objects[i].interaction==='missions'&&Valley.objects[i].type==='sign')Valley.objects.splice(i,1);
 Object.assign(mapLandmarks.find(m=>m.id==='atelier'),{x:664,y:630});
 const nearChest=(id,x,y)=>{const o=hiddenChests.find(o=>o.treasureId===id);if(!o)return;relocateObject(o,x,y);o.anchor={x:x+o.w/2,y:y+o.h+14};};
 nearChest('forest-seasons-box',1657,614);nearChest('tide-puzzle-box',389,92);nearChest('lantern-box',629,404);
 // Both independent discoveries retain their original rewards, now beside their objects.
 
 
 mapArtwork=null;
}
function clearArrivedWaypoint(){if(!state?.waypoint)return false;const m=mapLandmarks.find(m=>m.id===state.waypoint);const matches={house:'house',barn:'barn',greenhouse:'greenhouse',cave:'cave',dream:'dream',ruins:'ruins',beach:'beach',meadow:'meadow'};if((scene===matches[state.waypoint])||(scene==='world'&&!state.swimming&&m&&Math.hypot(player.x-m.x,player.y-m.y)<=27)){state.waypoint=null;miniMapStamp=0;save();return true;}return false;}
function drawMarketCanopy(c,o){const r=Valley.rect,x=o.x+o.w/2;r(c,o.x+5,o.y-34,o.w-10,27,'#4c3659');c.fillStyle='#fff0c7';c.font='6px monospace';c.textAlign='center';c.fillText('FEIRA · MISSÕES',x,o.y-24);c.fillStyle='#eac5e5';c.fillText('ATELIÊ',x,o.y-12);}
function drawMarketAtlasLabel(c,ox,oy,s){const market=Valley.objects.find(o=>o.type==='market');const x=ox+(market.x+market.w/2)*s,y=oy+(market.y-28)*s;c.font='9px Georgia';c.textAlign='center';c.fillStyle='#f6e7cf';c.fillRect(x-41,y-11,82,27);c.strokeStyle='#9d758e';c.strokeRect(x-41,y-11,82,27);c.fillStyle='#513850';c.fillText('Feira / missões',x,y-1);c.fillText('Ateliê',x,y+10);}
let screenCelebration=-10000;
function configureBalance(){
 // Repaint roads only inside the blue trace. Water and bridge tiles retain their collision semantics.
 for(const row of Valley.tiles)for(let x=0;x<row.length;x++)if(row[x]==='path')row[x]='grass';
 const trace=(x1,y1,x2,y2,width=2)=>{const a=Math.floor(x1/32),b=Math.floor(y1/32),d=Math.floor(x2/32),e=Math.floor(y2/32);for(let y=Math.min(b,e);y<=Math.max(b,e);y++)for(let x=Math.min(a,d);x<=Math.max(a,d);x++)for(let k=0;k<width;k++){const xx=a===d?x-1+k:x,yy=a===d?y:y-1+k;if(Valley.tiles[yy]?.[xx]==='grass')Valley.tiles[yy][xx]='path';}};
 for(const v of [[256,320,448,320],[448,224,448,960],[448,224,772,224],[772,192,772,224],[448,448,1248,448],[1248,256,1248,448],[1248,288,1504,288],[1152,448,1152,768],[448,768,1248,768],[448,672,664,672],[664,640,664,768],[448,928,608,928]])trace(...v);
 // v15: the upper crossing is two rows high, aligned with the lower road.
 for(let x=28;x<32;x++)Valley.tiles[15][x]='water';
 // Only the vertical approach remains below the market; shift it one tile east.
 for(let y=20;y<=22;y++)for(let x=14;x<=20;x++)if(x>=15&&Valley.tiles[y][x]==='path')Valley.tiles[y][x]='grass';
 for(let y=20;y<=22;y++)for(let x=20;x<=21;x++)Valley.tiles[y][x]='path';
 for(let x=13;x<=14;x++)if(Valley.tiles[30][x]==='path')Valley.tiles[30][x]='grass';
 const roadTree=Valley.objects.find(o=>o.type==='tree'&&o.x===1371&&o.y===360);if(roadTree)relocateObject(roadTree,1371,390);
 const ruins=Valley.objects.find(o=>o.next==='ruins');relocateObject(ruins,1320,92);Object.assign(areaDefs.ruins,{entrance:{...ruins.door},outside:[ruins.door.x,ruins.door.y+16]});Object.assign(mapLandmarks.find(m=>m.id==='ruins'),ruins.door);
 for(const o of Valley.objects.filter(o=>o.type==='tree'&&!o.hidden&&o.x>1300&&o.x<1410&&o.y>70&&o.y<205))relocateObject(o,1430,160);
 // Staggered orchard clearings. No extra inner wall, and each tree keeps its daily fruit identity.
 const orchard=Valley.objects.filter(o=>o.type==='tree'&&o.x>=1540&&o.x<1965&&o.y>110&&o.y<1050&&!o.hidden);
 const spots=[[1593,245],[1710,158],[1870,184],[1940,315],[1635,424],[1780,360],[1886,499],[1690,577],[1835,661],[1940,746],[1660,844],[1790,943],[1920,1000],[1595,1020],[1775,786],[1705,742],[1942,569],[1805,503],[1670,950],[1920,410],[1578,825],[1855,860]];
 orchard.forEach((o,i)=>{const [x,y]=spots[i%spots.length];relocateObject(o,x,y);o.size=.62+(i%3)*.06;if(o.fruit)o.anchor={x:x+9,y:y+31};});
 // Move the original outer eastern row slightly apart rather than adding another dense row.
 for(const o of Valley.objects.filter(o=>o.type==='tree'&&o.x>=1965&&o.y>110&&o.y<1040&&!o.hidden)){if(o.x<1990)o.hidden=true;}
 const season=Valley.objects.find(o=>o.puzzle==='seasons');const seasonChest=hiddenChests.find(o=>o.requires==='seasonsSolved');relocateObject(seasonChest,1556,698);seasonChest.anchor={x:1569,y:731};
 for(const where of ['world',...Object.keys(Valley.interiors)])for(const o of decorObjectsFor(where)){if(o.puzzle||['forest-gate-sign','logic-clue','orchard-trial','ruins-puzzle'].includes(o.interaction)){o.challengeMarker=true;o.challengeScene=where;o.text='✧';}}
 const regional=new Set(['tide-box','hay-box','ruins-box','grove-box','dream-box','crystal-box']);for(const where of ['world',...Object.keys(Valley.interiors)])for(const o of decorObjectsFor(where).filter(o=>o.type==='chest'&&o.treasureId)){o.chestColor=({'tide-box':'#82afb9','hay-box':'#b5ad7a','ruins-box':'#b097ce','grove-box':'#8cb697','dream-box':'#b49bd3','crystal-box':'#a590d2'})[o.treasureId];o.specialChest=o.requires?'puzzle':regional.has(o.treasureId)?({ 'tide-box':'tide','hay-box':'harvest','ruins-box':'moon','grove-box':'forest','dream-box':'moon','crystal-box':'crystal'})[o.treasureId]:null;}
 const atelier=mapLandmarks.find(m=>m.id==='atelier');if(atelier)mapLandmarks.splice(mapLandmarks.indexOf(atelier),1);Object.assign(mapLandmarks.find(m=>m.id==='shop'),{name:'Feira / Ateliê',icon:'🪑'});
 mapLandmarks.push({id:'lagoon',name:'Lago dos sapos',icon:'🐸',x:249,y:766});
 const order=['house','cave','shop','greenhouse','lagoon','beach','fish','barn','dream','ruins','forest','meadow'];
 mapLandmarks.sort((a,b)=>order.indexOf(a.id)-order.indexOf(b.id));
 // 12 destinations: existing farm garden, not a new region or a revealed puzzle marker.
 for(const a of farmAnimals.filter(a=>a.forestAnimal)){if(!Valley.canStand('world',a.x,a.y)){for(let n=1;n<25;n++){const x=a.x+Math.cos(n*2.4)*n*4,y=a.y+Math.sin(n*2.4)*n*4;if(Valley.canStand('world',x,y)){a.x=x;a.y=y;break;}}}a.bounds={x:a.x-8,y:a.y-6,w:16,h:12};}
 mapArtwork=null;Valley.invalidateGround('world');
}
function paintCharacter(im,f,id,x,y,dir,scale=1){paintHumanPose(im,f,id,x,y,dir,'walk',0,im===images[id+'-outfit-walk']?1:0,scale);}
// Standing heights retain the established character tiers. Action frames use
// measured crown widths, keeping crouches and waterlines from changing scale.
const humanHeadFractions={
 original:{walk:{leticia:[.48,.50,.46,.46],natalia:[.44,.44,.44,.44],alice:[.43,.43,.43,.43],robson:[.43,.43,.43,.43],reenye:[.42,.42,.42,.42],wellifabio:[.48,.48,.48,.48]},
 jump:{leticia:[.54,.45,.45,.54],natalia:[.49,.45,.45,.49],alice:[.48,.43,.43,.48],robson:[.45,.42,.42,.45],reenye:[.46,.43,.43,.46],wellifabio:[.52,.48,.48,.52]},
 swim:{leticia:.73,natalia:.76,alice:.74,robson:.73,reenye:.74,wellifabio:.76},idle:{leticia:.78,natalia:.80,alice:.78,robson:.78,reenye:.78,wellifabio:.78}},
 alternate:{walk:{leticia:[.47,.47,.47,.47],natalia:[.45,.45,.45,.45],alice:[.44,.44,.44,.44],robson:[.43,.43,.43,.43],reenye:[.44,.44,.44,.44],wellifabio:[.48,.48,.48,.48]},
 jump:{leticia:[.55,.45,.47,.55],natalia:[.51,.45,.47,.51],alice:[.53,.45,.47,.53],robson:[.50,.44,.46,.50],reenye:[.51,.44,.46,.51],wellifabio:[.55,.48,.50,.55]},
 swim:{leticia:.77,natalia:.79,alice:.77,robson:.77,reenye:.78,wellifabio:.78},idle:{leticia:.80,natalia:.82,alice:.80,robson:.80,reenye:.80,wellifabio:.80}}
};
function humanPoseSize(f,id,dir,kind,frame,outfit=0,scale=1){
 const [, ,sw,sh]=f,sc=(characterScales[id]||1)*scale,profile=humanHeadFractions[outfit?'alternate':'original'];
 const walkFrames=outfit?outfitFrames[id+'-outfit-walk']:(id==='leticia'?actionFrames['leticia-corrected']:spriteFrames[id]);
 const reference=walkFrames[dir*4],widths=poseCrownWidths[id+':'+outfit+':'+kind],referenceCrown=poseCrownWidths[id+':'+outfit+':walk'][dir*4];
 const index=kind==='idle'?dir:dir*4+frame,crown=widths[index]||referenceCrown;
 const headHeight=15.5*sc,headSource=sh*profile.walk[id][dir];
 if(kind==='walk'){const factor=headHeight/headSource;return {headSource,headHeight,width:sw*factor,height:36*sc,factor,crown:crown*factor};}
 // Keep the same anatomical scale in every animation cell, without stretching
 // a crouch or enlarging the swimmer to fill a standing character's rectangle.
 const targetCrown=referenceCrown*headHeight/(reference[3]*profile.walk[id][dir]);
 const factor=targetCrown/crown;
 return {headSource:headHeight/factor,headHeight,width:sw*factor,height:sh*factor,factor,crown:targetCrown};
}
function paintHumanPose(im,f,id,x,y,dir,kind,frame=0,outfit=0,scale=1){const [sx,sy,sw,sh]=f,m=humanPoseSize(f,id,dir,kind,frame,outfit,scale),width=Math.round(m.width),height=Math.round(m.height),left=Math.round(x-width/2),top=Math.round(y-height);if(kind==='walk'){const cut=Math.round(m.headSource),head=Math.round(m.headHeight);ctx.drawImage(im,sx,sy,sw,cut,left,top,width,head);ctx.drawImage(im,sx,sy+cut,sw,sh-cut,left,top+head,width,height-head);}else{ctx.drawImage(im,sx,sy,sw,sh,left,top,width,height);}}
function drawChallengeObject(c,o,time){
 const r=Valley.rect,e=Valley.ellipse,x=o.x+o.w/2,y=o.y;
 if(!['sign','seedbox'].includes(o.type)){Valley.objectArt(c,{...o,challengeMarker:false},time);drawChallengeSpark(c,x,y-24,time);return;}
 // An enamel moon plaque: warm wood, cream edging and a blue engraved emblem.
 e(c,x,y+o.h,11,3,'#273b4530');r(c,x-2,y-10,4,o.h+10,'#795463');r(c,x-1,y-10,1,o.h+9,'#c39884');
 r(c,x-13,y-28,26,20,'#5b425d');r(c,x-15,y-25,30,14,'#5b425d');
 r(c,x-12,y-27,24,18,'#e8d1bc');r(c,x-14,y-24,28,12,'#e8d1bc');
 r(c,x-10,y-25,20,14,'#739eaf');r(c,x-12,y-22,24,8,'#739eaf');
 e(c,x,y-18,5,5,'#c5e6e9');e(c,x+2,y-20,4,4,'#739eaf');
 r(c,x+7,y-18,3,1,'#c5e6e9');r(c,x+8,y-19,1,3,'#c5e6e9');
 r(c,x-11,y-19,2,2,'#f0ddb9');r(c,x+10,y-19,2,2,'#f0ddb9');
 drawChallengeSpark(c,x,y-39,time);
}
function drawChallengeSpark(c,x,y,time){const r=Valley.rect;c.save();c.globalAlpha=.65+.25*Math.sin(time/650);Valley.ellipse(c,x,y,6,5,'#b4e5ee22');r(c,x-3,y,7,1,'#b7e8f7');r(c,x,y-3,1,7,'#e4f6ff');r(c,x+7,y+5,2,1,'#b7e8f7');c.restore();}

function drawScreenCelebration(time){const age=time-screenCelebration;if(!running||age<0||age>2200)return;ctx.save();ctx.setTransform(1,0,0,1,0,0);for(let i=0;i<24;i++){const x=(.08+(i*37%83)/100)*viewW,y=(.12+(i*23%71)/100)*viewH-age/110;ctx.globalAlpha=Math.sin(Math.min(1,age/2200)*Math.PI)*(.5+(i%3)*.2);Valley.rect(ctx,x-4,y,9,2,i%2?'#fff0b7':'#c9e9ff');Valley.rect(ctx,x,y-4,2,9,'#fff7d5');}ctx.restore();}
function pondFrogPose(time){const p=Valley.objects.find(o=>o.type==='pond');const pads=[[p.x+p.w*.28,p.y+p.h*.40],[p.x+p.w*.69,p.y+p.h*.67]],phase=(time%5200)/5200,side=Math.floor(time/5200)%2;const from=pads[side],to=pads[1-side],t=phase<.78?0:(phase-.78)/.22;return {pads,x:from[0]+(to[0]-from[0])*t,y:from[1]+(to[1]-from[1])*t-Math.sin(t*Math.PI)*16,jumping:t>0,dir:side?2:3};}
function drawPondFrog(time){const p=pondFrogPose(time);for(const [x,y] of p.pads){Valley.ellipse(ctx,x,y,12,5,'#679b83');Valley.rect(ctx,x+2,y-2,8,2,'#a5c59b');}if(images.sapo){const f=spriteFrames.sapo[p.jumping?p.dir:0];paintSpriteFrame(images.sapo,f,p.x,p.y,20/spriteFrames.sapo[0][3]);}}
