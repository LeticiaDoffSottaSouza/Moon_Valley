'use strict';
const furnitureCatalog={
 originalBed:{name:'Cama original',icon:'🛏',type:'bed',category:'bed',color:'#d1a6ce',price:0,w:46,h:59,where:['house']},
 lavenderBed:{name:'Cama Lavanda',icon:'🛏',type:'bed',category:'bed',color:'#b4a0d2',price:180,w:46,h:59,where:['house']},
 peachBed:{name:'Cama Pêssego',icon:'🛏',type:'bed',category:'bed',color:'#e2afa7',price:210,w:46,h:59,where:['house']},
 moonBed:{name:'Cama dos Sonhos',icon:'☾',type:'bed',category:'bed',color:'#8e9fce',exclusive:'Jardim lunar',w:46,h:59,where:['house']},
 sofa:{name:'Sofá de ameixa',icon:'🛋',type:'sofa',color:'#ac87ad',price:140,w:62,h:24,where:['house']},
 bench:{name:'Banco de jardim',icon:'🪑',type:'bench',color:'#c39a84',price:85,w:57,h:18,where:['world','house']},
 flowerpot:{name:'Vaso de flores',icon:'🌸',type:'plant',color:'#dda8c6',price:45,w:17,h:18,where:['world','house']},
 warmLamp:{name:'Poste acolhedor',icon:'🏮',type:'lamp',color:'#ffe5ad',price:95,w:10,h:10,where:['world','house']},
 roseRug:{name:'Tapete de rosas',icon:'✿',type:'rug',color:'#c59db7',price:70,w:55,h:34,solid:false,where:['house']},
 coralLamp:{name:'Luz das marés',icon:'🐚',type:'lamp',color:'#f1c4cf',exclusive:'Praia das Conchas',w:10,h:10,where:['world','house']},
 wheatBench:{name:'Banco de espigas',icon:'🌾',type:'bench',color:'#d9bc83',exclusive:'Campina do Feno',w:57,h:18,where:['world','house']},
 starRug:{name:'Tapete do observatório',icon:'✦',type:'rug',color:'#9c91ba',exclusive:'Ruínas do Observatório',w:55,h:34,solid:false,where:['house']},
 fernLamp:{name:'Lanterna do bosque',icon:'🌿',type:'lamp',color:'#c3deb4',exclusive:'Bosque das Lanternas',w:10,h:10,where:['world','house']},
 amethystLamp:{name:'Luz de ametista',icon:'💜',type:'lamp',color:'#d6c2ed',exclusive:'Gruta dos cristais',w:10,h:10,where:['world','house']}
};
const chestGifts={'tide-box':'coralLamp','hay-box':'wheatBench','ruins-box':'starRug','grove-box':'fernLamp','dream-box':'moonBed','crystal-box':'amethystLamp'};
let placement=null;
function normalizeDecor(s){s.version=7;s.ownedFurniture=s.ownedFurniture||{originalBed:1};s.ownedFurniture.originalBed=1;s.bedStyle=furnitureCatalog[s.bedStyle]?.category==='bed'?s.bedStyle:'originalBed';s.decorations=Array.isArray(s.decorations)?s.decorations.filter(d=>furnitureCatalog[d.item]&&['world','house'].includes(d.scene)&&Number.isFinite(d.x)&&Number.isFinite(d.y)):[];s.treasureGifts=s.treasureGifts||{};s.puzzles=s.puzzles||{};s.decorSerial=s.decorSerial||s.decorations.length;for(const [chest,item] of Object.entries(chestGifts))if(s.treasures[chest]&&!s.treasureGifts[chest]){s.ownedFurniture[item]=(s.ownedFurniture[item]||0)+1;s.treasureGifts[chest]=true;}return s;}
function grantChestGift(chest){const id=chestGifts[chest];if(!id||state.treasureGifts[chest])return '';state.ownedFurniture[id]=(state.ownedFurniture[id]||0)+1;state.treasureGifts[chest]=true;return ' · '+furnitureCatalog[id].name+' exclusivo';}
function decorObjects(scene){return scene==='world'?Valley.objects:Valley.interiors[scene].objects;}
function furnitureAvailable(id,except){return (state.ownedFurniture[id]||0)-state.decorations.filter(d=>d.item===id&&d.uid!==except).length;}
function purchaseFurniture(id){const f=furnitureCatalog[id];if(!f||f.exclusive||!f.price)return false;if(state.money<f.price){toast('Moedas insuficientes.');return false}state.money-=f.price;state.ownedFurniture[id]=(state.ownedFurniture[id]||0)+1;markNewFurniture(id);playPurchaseSound();save();updateHud();toast(f.name+' guardado na sua coleção.');return true;}
function equipBed(id){if(furnitureCatalog[id]?.category!=='bed'||!state.ownedFurniture[id])return false;state.bedStyle=id;delete state.newFurniture[id];rebuildDecor();save();toast('Cama trocada! A função de dormir continua disponível.');return true;}


function overlap(a,b,pad=0){return a.x<b.x+b.w+pad&&a.x+a.w>b.x-pad&&a.y<b.y+b.h+pad&&a.y+a.h>b.y-pad;}
function floorPlacementValid(id,where,x,y,moving,rotation=0){const f={...furnitureCatalog[id],...furnitureFootprint(id,rotation)},box={x,y,w:f.w,h:f.h},b=Valley.bounds(where);if(!f.where.includes(where)||(f.category==='bed'&&moving!=='bed-slot')||x<30||y<43||x+f.w>b.w-30||y+f.h>b.h-30)return false;const list=decorObjects(where).filter(o=>(!moving||o.furnitureUid!==moving)&&!o.hidden);if(f.solid!==false&&list.some(o=>o.solid&&overlap(box,o,3)))return false;const anchors=where==='world'?[...list.filter(o=>o.door||o.anchor).map(o=>o.door||o.anchor),...plots.map(p=>({x:p.x+p.w/2,y:p.y+p.h/2})),{x:752,y:928},{x:944,y:497}]:[Valley.interiors.house.exit,...list.filter(o=>o.anchor).map(o=>o.anchor)];if(f.solid!==false&&anchors.some(a=>overlap(box,{x:a.x-12,y:a.y-12,w:24,h:24})))return false;if(where==='world'){if(plots.some(p=>overlap(box,p,8)))return false;for(let xx=x;xx<=x+f.w;xx+=6)for(let yy=y;yy<=y+f.h;yy+=6)if(Valley.terrainAt(xx,yy)!=='grass')return false;}if(f.solid!==false&&scene===where&&overlap(box,{x:player.x-7,y:player.y-10,w:14,h:12}))return false;const animals=farmAnimals.filter(a=>animalHome(a)===where),npc=npcs.filter(n=>n.scene===where&&n.character!==state.character);if(f.solid!==false&&[...animals,...npc].some(a=>overlap(box,{x:a.x-9,y:a.y-13,w:18,h:18},5)))return false;
 if(where==='house'&&f.solid!==false){const goals=[Valley.homeSpawn,Valley.interiors.house.exit,...list.filter(o=>o.anchor).map(o=>o.anchor),...(f.category==='bed'?[bedInteractionAt({x,y,w:f.w,h:f.h,rotation})]:f.anchor?[{x:x+f.anchor.x,y:y+f.anchor.y}]:[])],queue=[[160,198]],seen=new Set(['160,198']);const stand=(xx,yy)=>{const candidate=decorObjects('house').find(o=>moving&&o.furnitureUid===moving),hidden=candidate?.hidden;if(candidate)candidate.hidden=true;const result=Valley.canStand('house',xx,yy,[box]);if(candidate)candidate.hidden=hidden;return result;};for(let i=0;i<queue.length;i++){for(const [dx,dy] of [[4,0],[-4,0],[0,4],[0,-4]]){const xx=queue[i][0]+dx,yy=queue[i][1]+dy,k=xx+','+yy;if(seen.has(k)||!stand(xx,yy))continue;seen.add(k);queue.push([xx,yy]);}}if(goals.some(g=>!queue.some(([xx,yy])=>Math.hypot(xx-g.x,yy-g.y)<19)))return false;}return true;}
function baseFurnitureArt(c,o,time){const f=furnitureCatalog[o.furnitureId],{x,y,w,h}=o,r=Valley.rect,e=Valley.ellipse;if(!f)return;if(drawPolishedFurniture(c,o,f,time))return;if(drawRefinementFurniture(c,o,f,time)||drawLayoutFurniture(c,o,f,time))return;if(o.furnitureId==='originalRug'){r(c,x,y,w,h,'#94749e');r(c,x+5,y+5,w-10,h-10,'#b295ba');r(c,x+11,y+11,w-22,h-22,'#c9adcc');for(let i=0;i<4;i++)r(c,x+19+i*11,y+22,4,4,'#edd7b7');return}if(o.furnitureId==='originalBed'){const base={...o};delete base.furnitureId;Valley.objectArt(c,base,time);return}if(f.category==='bed'){r(c,x-3,y-3,w+6,h+6,'#634d61');r(c,x,y,w,h,'#b49185');r(c,x+4,y+5,w-8,h-10,f.color);r(c,x+8,y+9,w-16,16,'#f5e8db');r(c,x-5,y-7,w+10,8,'#bc9b8b');r(c,x+8,y+31,w-16,2,'#ded2e6');for(let i=0;i<5;i++){r(c,x+8+i*6,y+42,2,2,'#eee0b5');if(o.furnitureId==='moonBed')r(c,x+11+i*6,y+49,2,2,'#b8dce6');}}else if(f.type==='sofa'){r(c,x-2,y-7,w+4,h+7,'#695369');r(c,x,y-5,w,h+3,f.color);r(c,x+4,y+8,w-8,8,f.color);r(c,x+w/2,y-3,2,h-2,'#967496');r(c,x-3,y+1,8,h,'#bea0bd');r(c,x+w-5,y+1,8,h,'#bea0bd');r(c,x+5,y+h,4,5,'#6c5363');r(c,x+w-9,y+h,4,5,'#6c5363');}else if(f.type==='rug'){r(c,x,y,w,h,'#7b617e');r(c,x+2,y+2,w-4,h-4,f.color);r(c,x+5,y+5,w-10,h-10,'#b5a5c5');if(['roseRug','creamRug'].includes(o.furnitureId))drawRoses(c,x,y,w,h);else if(o.furnitureId==='originalRug'){for(let i=0;i<4;i++)r(c,x+19+i*11,y+22,4,4,'#edd7b7');}else for(let i=0;i<4;i++)drawRuneSymbol(c,x+10+i*11,y+h/2,2,'#e7d0b3','#b5a5c5',.4);}else{const base={...o};delete base.furnitureId;Valley.objectArt(c,base,time);if(f.type==='lamp')r(c,x+1,y-35,8,8,f.color);if(f.type==='bench')r(c,x+2,y-10,w-4,3,f.color);}}
function configureDecorContent(){
 mapLandmarks.push({id:'atelier',name:'Ateliê',icon:'🪑',x:740,y:610});
 const barn=Valley.interiors.barn,hay=barn.objects.filter(o=>o.type==='hay'),trough=barn.objects.filter(o=>o.type==='trough');hay.forEach((o,i)=>Object.assign(o,{x:153+i*44,y:58,w:33,h:26,anchor:{x:169+i*44,y:98}}));trough.forEach((o,i)=>Object.assign(o,{x:i?266:53,y:75,w:66,h:19,anchor:{x:i?299:86,y:109}}));Object.assign(barn.objects.find(o=>o.type==='barrel'),{x:43,y:246,w:24,h:17,anchor:{x:82,y:255}});Object.assign(barn.objects.find(o=>o.type==='plant'),{x:330,y:246});
 const residents=[[59,141],[326,182],[107,224],[278,224]];farmAnimals.filter(a=>a.home==='barn').forEach((a,i)=>{const [x,y]=residents[i];Object.assign(a,{x,y,bounds:{x:x-10,y:y-6,w:20,h:12}})});const spots=[[106,141],[278,141],[326,141],[59,182],[106,182],[278,182],[59,224],[326,224],[326,182]];farmAnimals.filter(a=>a.home==='world'&&a.kind).forEach((a,i)=>a.barnSpot={x:spots[i][0],y:spots[i][1]});
 const add=(scene,o)=>decorObjectsFor(scene).push(o),treasure=(scene,id,x,y,loot,requires)=>{const o={type:'chest',x,y,w:25,h:17,solid:true,treasureId:id,loot,requires,interaction:'treasure',anchor:{x:x+12,y:y+30},hidden:!!requires};add(scene,o);hiddenChests.push(o)};
 treasure('world','farm-hollow',302,610,{money:80,hay:4,seeds:5});treasure('world','forest-nook',1390,388,{money:95,mushroom:3,wood:4});treasure('grove','fern-hollow',60,245,{money:65,flower:3});treasure('dream','dream-box',399,80,{money:120,star:2});treasure('cave','crystal-box',304,205,{money:120,crystal:2});treasure('world','lantern-box',634,389,{money:120,star:1},'lanternSolved');
 furnitureCatalog.harmonyLamp={name:'Lanterna da harmonia',icon:'✧',type:'lamp',color:'#cbe8eb',exclusive:'Enigma das lanternas',w:10,h:10,where:['world','house']};chestGifts['lantern-box']='harmonyLamp';
 add('world',{type:'bench',x:712,y:576,w:57,h:18,solid:true,interaction:'furniture-shop',anchor:{x:740,y:610}});
 [512,568,624].forEach((x,i)=>add('world',{type:'logic-lamp',x,y:362,w:10,h:10,solid:true,interaction:'logic-lamp',index:i,anchor:{x:x+5,y:386}}));add('world',{type:'seedbox',x:564,y:405,w:24,h:12,solid:true,interaction:'logic-clue',anchor:{x:576,y:436}});
 const beach=Valley.interiors.beach;const pondRock=beach.objects.find(o=>o.type==='rock'&&o.x===405);if(pondRock)Object.assign(pondRock,{x:507,y:75});beach.objects.push({type:'pond',x:355,y:114,w:116,h:72,solid:true,depth:114});const turtle=farmAnimals.find(a=>a.uid==='expansion-1');Object.assign(turtle,{x:487,y:194,bounds:{x:480,y:190,w:32,h:25}});const duck=farmAnimals.find(a=>a.uid==='expansion-0');Object.assign(duck,{x:337,y:117,bounds:{x:320,y:98,w:25,h:28}});const shell=resourceNodes.find(n=>n.scene==='beach'&&n.anchor.x===452);if(shell)Object.assign(shell,{x:492,y:205,anchor:{x:500,y:217}});
 [['pato','Pato Laguna',493,151,21,'egg'],['sapo','Sapo Vitória',400,208,20],['sapo','Sapo Lótus',495,232,20]].forEach(([id,name,x,y,size,kind],i)=>farmAnimals.push({id,uid:'pond-'+i,name,x,y,size,kind,home:'beach',bounds:{x:x-10,y:y-7,w:20,h:14}}));
}
function decorObjectsFor(scene){return scene==='world'?Valley.objects:Valley.interiors[scene].objects;}
function refreshLanterns(){if(!Array.isArray(state.puzzles.lanterns)||state.puzzles.lanterns.length!==3)state.puzzles.lanterns=[false,true,false];for(const o of Valley.objects){if(o.type==='logic-lamp')o.lit=state.puzzles.lanternSolved||state.puzzles.lanterns[o.index];if(o.requires)o.hidden=!!state.treasures[o.treasureId]||!state.puzzles[o.requires];}for(const o of hiddenChests)if(o.requires)o.hidden=!!state.treasures[o.treasureId]||!state.puzzles[o.requires];}
function decorInteract(t){if(t.type==='furniture-shop'){openFurnitureShop();return true}if(t.type==='logic-clue'){info('O jardim das lanternas',`<p>Cada poste muda sua própria luz e a dos seus vizinhos imediatos. Acenda as três lanternas ao mesmo tempo.</p><p>Aproxime-se dos postes e use E. As lanternas das pontas têm só um vizinho. Ao resolver, um baú aparece no jardim com um móvel exclusivo.</p><p>${state.puzzles.lanternSolved?'Você já trouxe harmonia ao jardim!':'Observe quais luzes mudam a cada toque.'}</p>`);return true}if(t.type==='logic-lamp'){if(state.puzzles.lanternSolved){toast('O jardim está em harmonia. Procure o baú revelado!');return true}const i=t.object.index;for(let j=Math.max(0,i-1);j<=Math.min(2,i+1);j++)state.puzzles.lanterns[j]=!state.puzzles.lanterns[j];if(state.puzzles.lanterns.every(Boolean)){state.puzzles.lanternSolved=true;mapArtwork=null;sparkMagic('world',568,350);toast('As três luzes brilharam! Um baú apareceu no jardim.');}else toast('As luzes mudaram… '+state.puzzles.lanterns.filter(Boolean).length+'/3 acesas.');refreshLanterns();return true}return false;}
function drawDecorObject(c,o,time){const r=Valley.rect,e=Valley.ellipse,{x,y,w,h}=o;if(o.type==='logic-lamp'){Valley.objectArt(c,{...o,type:'lamp'},time);r(c,x+1,y-35,8,8,o.lit?'#ffe6aa':'#6b5c7e');if(o.lit&&nightLevel()>0){c.globalAlpha=.15;e(c,x+5,y-31,16,16,'#ffe6aa');c.globalAlpha=1;}return}e(c,x+w/2,y+h/2,w/2+4,h/2+4,'#929b86');e(c,x+w/2,y+h/2,w/2+2,h/2+2,'#c6c2a0');e(c,x+w/2,y+h/2,w/2,h/2,'#6a99aa');c.save();c.beginPath();c.ellipse(x+w/2,y+h/2,w/2,h/2,0,0,Math.PI*2);c.clip();for(let yy=6;yy<h;yy+=13)for(let xx=7;xx<w-15;xx+=27)r(c,x+xx+Math.sin(time/1500+yy)*2,y+yy,13,1,'#afcdd0');for(const [xx,yy] of [[15,13],[87,48],[57,57]]){e(c,x+xx,y+yy,6,3,'#8bb798');r(c,x+xx+2,y+yy-3,3,3,'#ebc1d5');}for(let i=0;i<2;i++){const xx=x+35+i*37+Math.sin(time/2100+i)*8,yy=y+24+i*12;e(c,xx,yy,3,1.4,'#b8d2c4');r(c,xx-5,yy-1,2,2,'#b8d2c4');}c.restore();}

// One painter serves both placed furniture and shop thumbnails.
function furnitureTint(hex,amount){const n=parseInt(hex.slice(1),16),target=amount<0?0:255,t=Math.abs(amount);return '#'+[n>>16,(n>>8)&255,n&255].map(v=>Math.round(v+(target-v)*t).toString(16).padStart(2,'0')).join('');}
function drawPolishedFurniture(c,o,f,time){const r=Valley.rect,e=Valley.ellipse,{x,y,w,h}=o,color=f.color||'#bba0b9',light=furnitureTint(color,.28),dark=furnitureTint(color,-.20);
 if(f.category==='bed'){
 e(c,x+w/2,y+h+2,w/2,3,'#49334624');r(c,x-3,y-4,w+6,h+7,'#71525f');r(c,x,y-2,w,h+3,'#be9680');
 r(c,x-5,y-8,w+10,7,'#936f68');r(c,x-3,y-7,w+6,3,'#dab69a');r(c,x+3,y-4,w-6,2,'#c9a38d');
 r(c,x+4,y+4,w-8,h-9,color);r(c,x+6,y+6,w-12,18,'#efe1d8');r(c,x+9,y+8,w-18,12,'#fff1e4');r(c,x+10,y+18,w-20,2,'#d7c2c6');
 r(c,x+5,y+26,w-10,h-32,dark);r(c,x+7,y+27,w-14,h-34,color);r(c,x+7,y+27,w-14,3,light);
 for(let yy=34;yy<h-7;yy+=10)for(let xx=11;xx<w-8;xx+=10){r(c,x+xx,y+yy,3,1,'#f7e4c6');r(c,x+xx+1,y+yy-1,1,3,'#f7e4c6');}
 r(c,x-3,y+h-4,w+6,5,'#987164');r(c,x-1,y+h-3,w+2,2,'#d0aa8c');r(c,x+1,y+h+1,4,3,'#71525f');r(c,x+w-5,y+h+1,4,3,'#71525f');return true;
 }
 if(f.type==='sofa'){
 e(c,x+w/2,y+h+4,w/2,3,'#49334625');r(c,x-2,y-7,w+4,h+8,'#6c5063');r(c,x,y-6,w,h+5,dark);r(c,x+2,y-5,w-4,13,color);r(c,x+4,y-4,w-8,2,light);
 const half=Math.floor((w-12)/2);for(let i=0;i<2;i++){r(c,x+5+i*(half+2),y-1,half,7,color);r(c,x+5+i*(half+2),y+9,half,7,light);r(c,x+5+i*(half+2),y+16,half,2,color);}
 r(c,x-3,y+1,8,h-1,dark);r(c,x-2,y+1,6,h-3,color);r(c,x-2,y+1,6,3,light);r(c,x+w-5,y+1,8,h-1,dark);r(c,x+w-4,y+1,6,h-3,color);r(c,x+w-4,y+1,6,3,light);
 r(c,x+9,y+2,8,7,'#efc7cc');r(c,x+10,y+3,6,4,'#f6dddd');r(c,x+5,y+h,4,4,'#76545c');r(c,x+w-9,y+h,4,4,'#76545c');return true;
 }
 if(f.type==='plant'&&o.furnitureId==='flowerpot'){
 e(c,x+w/2,y+h,8,2,'#49334624');r(c,x+2,y+h-9,w-4,9,'#b7828d');r(c,x+3,y+h-7,w-6,6,'#d5a4a4');r(c,x,y+h-11,w,3,'#ebc5b4');
 for(let i=0;i<3;i++){const xx=x+4+i*4,yy=y-5+(i%2)*3;r(c,xx,yy,1,15,'#7c9e7f');e(c,xx-2,yy+7,3,2,'#a3bc8c');for(let k=0;k<5;k++)e(c,xx+Math.cos(k*1.257)*3,yy+Math.sin(k*1.257)*3,2,2,color);e(c,xx,yy,1.5,1.5,'#f9e4ad');}return true;
 }
 if(f.type==='cushion'){
 r(c,x+1,y,w-2,h,'#7d5e74');r(c,x,y+2,w,h-4,dark);r(c,x+2,y+2,w-4,h-4,color);r(c,x+3,y+2,w-6,2,light);r(c,x+4,y+4,w-8,h-8,light);e(c,x+w/2,y+h/2,1,1,'#f5dfc4');return true;
 }
 if(f.type==='table'){
 e(c,x+w/2,y+h+1,w/2,3,'#49334622');r(c,x+4,y+10,4,h-8,'#765665');r(c,x+w-8,y+10,4,h-8,'#765665');r(c,x-2,y-2,w+4,h-7,'#785767');r(c,x,y-1,w,h-9,color);r(c,x+2,y,w-4,2,light);r(c,x+3,y+4,w-6,1,light);
 e(c,x+w/2,y+8,6,3,'#e9d8c8');r(c,x+w/2-2,y+2,5,6,'#f5e6d5');r(c,x+w/2+3,y+3,2,3,'#cfacb5');r(c,x+w/2-1,y+2,3,1,'#8d6372');return true;
 }
 if(f.type==='rug'&&!['originalRug','moonRug','leafRug'].includes(o.furnitureId)){
 r(c,x,y,w,h,dark);r(c,x+2,y+2,w-4,h-4,color);r(c,x+4,y+4,w-8,h-8,light);r(c,x+6,y+6,w-12,h-12,color);
 for(let xx=4;xx<w-3;xx+=5){r(c,x+xx,y-1,2,2,'#e4cfbd');r(c,x+xx,y+h-1,2,2,'#e4cfbd');}
 if(['roseRug','creamRug'].includes(o.furnitureId))drawRoses(c,x,y,w,h);else for(let i=0;i<3;i++)drawRuneSymbol(c,x+12+i*15,y+h/2,2,'#f3dfbc',color,.5);return true;
 }
 if(f.type==='lamp'){
 r(c,x+3,y-31,4,40,'#796275');r(c,x+4,y-29,1,36,'#b495a3');r(c,x-2,y-37,14,13,'#795a73');r(c,x,y-35,10,9,nightLevel()>0?color:furnitureTint(color,-.18));r(c,x+2,y-34,2,7,nightLevel()>0?light:furnitureTint(color,.08));r(c,x-3,y-39,16,3,'#b39499');r(c,x+3,y-43,4,4,'#b39499');r(c,x+1,y-25,8,2,'#c4a4a5');r(c,x+1,y+7,8,3,'#795a73');return true;
 }
 if(f.type==='bookshelf'){
 r(c,x-2,y-22,w+4,h+24,'#715666');r(c,x,y-21,w,h+21,color);r(c,x-3,y-24,w+6,4,light);
 for(let row=0;row<2;row++){const yy=y-16+row*19;r(c,x+3,yy,w-6,14,dark);for(let i=0;i<6;i++){const bh=8+(i%3)*2,xx=x+5+i*5;r(c,xx,yy+13-bh,3,bh,['#aac7b1','#d6aec6','#d7c390','#aba8ce'][i%4]);r(c,xx,yy+14-bh,3,1,'#f5dfc3');}r(c,x+2,yy+14,w-4,3,light);}
 r(c,x,y+h-1,w,3,dark);return true;
 }
 return false;
}
