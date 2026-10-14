'use strict';
// Additional systems share the existing terrain, objects, inventory and saved game.
const cropDefs={
 turnip:{name:'Nabo',icon:'🥕',seed:'seeds',item:'turnip',days:3,qty:2,color:'#ecd4df',price:20},
 carrot:{name:'Cenoura',icon:'🥕',seed:'carrotSeeds',item:'carrot',days:2,qty:2,color:'#e6a170',price:25},
 pumpkin:{name:'Abóbora',icon:'🎃',seed:'pumpkinSeeds',item:'pumpkin',days:4,qty:1,color:'#e6b06f',price:35},
 strawberry:{name:'Morango',icon:'🍓',seed:'strawberrySeeds',item:'strawberry',days:3,qty:3,color:'#d787a5',price:30},
 sunflower:{name:'Girassol',icon:'🌻',seed:'sunflowerSeeds',item:'sunflower',days:2,qty:2,color:'#edd58e',price:25}
};
const extraItemInfo={carrotSeeds:['🌱','Sementes de cenoura'],pumpkinSeeds:['🌱','Sementes de abóbora'],strawberrySeeds:['🌱','Sementes de morango'],sunflowerSeeds:['🌱','Sementes de girassol'],carrot:['🥕','Cenouras'],pumpkin:['🎃','Abóboras'],strawberry:['🍓','Morangos'],sunflower:['🌻','Girassóis'],apple:['🍎','Maçãs do bosque'],compost:['🍂','Adubo'],roseQuartz:['💗','Quartzo rosa'],aquamarine:['💠','Água-marinha'],emerald:['💚','Esmeralda'],sunstone:['🟡','Pedra do sol']};
const mineralDefs={crystal:{name:'Ametista',rarity:'Comum',colors:['#77618e','#cbb2ed'],qty:3},roseQuartz:{name:'Quartzo rosa',rarity:'Comum',colors:['#a06786','#f1b9d6'],qty:3},aquamarine:{name:'Água-marinha',rarity:'Incomum',colors:['#447b96','#a5dce8'],qty:2},emerald:{name:'Esmeralda',rarity:'Rara',colors:['#447766','#a2d9ae'],qty:1},sunstone:{name:'Pedra do sol',rarity:'Muito rara',colors:['#aa864b','#ffe9a4'],qty:1}};
const missionDefs=[
 {title:'Um buquê para o vale',text:'Colete 5 itens naturais pelo mapa.',stat:'gather',goal:5,where:'Flores, cogumelos, gravetos e maçãs.'},
 {title:'Um rebanho bem cuidado',text:'Alimente 4 animais diferentes.',stat:'feed',goal:4,where:'Use ração ou os comedouros do celeiro.'},
 {title:'Luzes sob a montanha',text:'Termine de minerar 2 jazidas.',stat:'mine',goal:2,where:'Use a picareta (2) na gruta.'},
 {title:'A primeira cesta',text:'Colha 4 produtos dos seus canteiros.',stat:'harvest',goal:4,where:'A fazenda e a estufa contam para a missão.'},
 {title:'Uma manhã de pescaria',text:'Pesque 2 peixes lunares.',stat:'fish',goal:2,where:'Pesque no píer ou na ponte.'}
];
function cropOf(p){return cropDefs[p.crop]||cropDefs.turnip;}
function cropReady(p){return p.planted&&p.growth>=cropOf(p).days;}
function ensureDaily(){if(!state.daily||state.daily.day!==state.day)state.daily={day:state.day,index:(state.day-1)%missionDefs.length,stats:{gather:0,feed:0,mine:0,harvest:0,fish:0},claimed:false};return state.daily;}
function recordTask(stat,n=1){if(!state)return;const daily=ensureDaily();daily.stats[stat]=(daily.stats[stat]||0)+n;state.missionTotals=state.missionTotals||{};state.missionTotals[stat]=(state.missionTotals[stat]||0)+n;checkMissionBoard();}
function dailyProgress(){const d=ensureDaily(),m=missionDefs[d.index];return {d,m,count:Math.min(m.goal,d.stats[m.stat]||0)};}
function openMission(){openMissionBoard();}
function openSeeds(){if(scene==='greenhouse'&&!cropDefs[state.selectedCrop]?.flower)state.selectedCrop='sunflower';info('O que vamos plantar?',`<p>Escolha uma cultura. Depois use <b>E</b> no canteiro preparado. Na estufa, a terra já está pronta e recebe apenas flores.</p><div class="seed-grid">${Object.entries(cropDefs).filter(([,c])=>scene!=='greenhouse'||c.flower).map(([id,c])=>`<button class="seed-card ${state.selectedCrop===id?'chosen':''}" id="seed-${id}">${productImage(c.seed)}<strong>${c.name}</strong><span>${state.inventory[c.seed]} sementes<br>${c.days} dias regados · colheita × ${c.qty}</span></button>`).join('')}</div><p>Encontre sementes comuns na feira; as flores exclusivas são presentes dos segredos do vale.</p>`);Object.keys(cropDefs).filter(id=>scene!=='greenhouse'||cropDefs[id].flower).forEach(id=>{$('seed-'+id).onclick=()=>{state.selectedCrop=id;slot=3;save();updateHud();$('info-modal').close();toast('Selecionado: '+cropDefs[id].name+'. Use E para plantar.')}});}
function usePlot(p,tool){const crop=cropOf(p),selected=cropDefs[state.selectedCrop]||cropDefs.turnip;
 if(tool==='hoe'){if(p.planted)toast('Esse canteiro já tem '+crop.name.toLowerCase()+'.');else if(p.tilled)toast('Terra preparada. Escolha sua semente (4).');else if(spend(2)){playSound('hoe');p.tilled=true;toast('Terra preparada! Escolha uma cultura com o botão Sementes.');}}
 else if(tool==='seeds'){if(!p.tilled)toast('Prepare a terra com a enxada primeiro.');else if(p.planted)toast('Já existe uma planta neste canteiro.');else if(state.greenPlots.includes(p)&&!selected.flower)toast('A estufa é um jardim de flores. Escolha uma semente de flor.');else if(state.inventory[selected.seed]<1)toast('Sem sementes de '+selected.name.toLowerCase()+'. Compre na feira.');else if(spend(2)){playSound('plant');p.planted=true;p.crop=state.selectedCrop;p.growth=0;p.watered=false;state.inventory[selected.seed]--;toast(selected.name+' plantado! Agora use o regador.');}}
 else if(tool==='water'){if(!p.planted)toast('Plante uma semente primeiro.');else if(p.watered)toast('Já regado hoje.');else if(spend(1)){playSound('water');p.watered=true;toast(crop.name+' regado! '+Math.min(p.growth,crop.days)+'/'+crop.days+' dias de crescimento.');}}
 else if(tool==='harvest'){if(!cropReady(p))toast(p.planted?crop.name+' está crescendo: '+p.growth+'/'+crop.days+' dias regados.':'Este canteiro está vazio.');else if(spend(1)){playSound('gather');state.inventory[crop.item]+=crop.qty;recordTask('harvest',crop.qty);Object.assign(p,{planted:false,watered:false,growth:0});toast('Colheita! +'+crop.qty+' '+itemInfo[crop.item][1]+' na mochila.');}}
 else toast(p.planted?crop.name+' · '+p.growth+'/'+crop.days+' dias · '+(p.watered?'regado hoje':'precisa de água'):'Selecione sementes (4) para escolher o que plantar.');
}
function growPlot(p){if(p.planted&&p.watered)p.growth=Math.min(cropOf(p).days,p.growth+1);p.watered=false;}
function basePaintCrop(c,x,y,p,size=1){const crop=cropOf(p),g=p.growth,ready=cropReady(p),r=(xx,yy,w,h,color)=>Valley.rect(c,x+xx*size,y+yy*size,w*size,h*size,color);
 r(0,-8-g*2,2,10+g*2,'#3e715e');r(-4,-6-g*2,5,3,'#9abd8d');r(2,-9-g*2,5,3,'#b6cf9c');if(!ready)return;
 if(p.crop==='sunflower'||p.crop==='moonbloom'){Valley.ellipse(c,x+size,y-14*size,5*size,5*size,crop.color);r(-1,-16,4,4,'#9a7657');}
 else if(p.crop==='strawberry'){r(-4,-4,5,5,crop.color);r(3,-9,5,5,crop.color);r(-3,-3,1,1,'#f4dba3');r(4,-8,1,1,'#f4dba3');}
 else if(p.crop==='pumpkin'){Valley.ellipse(c,x+size,y,6*size,4*size,crop.color);r(-2,-3,1,7,'#bd895c');r(3,-3,1,7,'#bd895c');}
 else{r(-2,0,7,5,crop.color);r(-1,4,5,2,crop.color);}
}
function drawGreenPlot(c,o){const p=state?.greenPlots?.[o.greenIndex];if(!p)return;for(let i=0;i<3;i++)if(p.planted)paintCrop(c,o.x+11+i*(o.w-22)/2,o.y+o.h-10,p,.85);if(p.watered)Valley.rect(c,o.x+o.w-8,o.y+6,2,4,'#abd8e6');}
function openGreenhouse(){info('Cultivar na estufa',`<p>Aqui há <b>4 canteiros prontos para flores</b>. Escolha sua semente de flor, plante, regue e colha com as mesmas ferramentas da fazenda.</p><div class="garden-status">${state.greenPlots.map((p,i)=>`<div><b>Canteiro ${i+1}</b><br>${p.planted?cropOf(p).icon+' '+cropOf(p).name+' · '+p.growth+'/'+cropOf(p).days+' dias<br>'+(cropReady(p)?'Colheita pronta':p.watered?'Regado hoje':'Precisa de água'):'Livre para plantar'}</div>`).join('')}</div><button class="primary" id="green-seeds">Escolher sementes</button><button class="primary" id="gift-seed">Pegar 3 sementes grátis</button><button class="primary" id="water-green">Regar os canteiros</button><button class="primary" id="compost-green">Adubar uma planta · 1 adubo</button><p>Adubo: ${state.inventory.compost}. Limpar o celeiro fornece adubo. Cada planta pode receber uma dose por dia.</p>`);
 $('green-seeds').onclick=()=>{$('info-modal').close();openSeeds()};
 $('gift-seed').onclick=()=>{if(state.greenhouseDay===state.day)toast('Você já recebeu sementes hoje.');else{state.greenhouseDay=state.day;state.inventory.sunflowerSeeds+=3;toast('+3 sementes de girassol.');}save();updateHud();$('info-modal').close();openGreenhouse()};
 $('water-green').onclick=()=>{const list=state.greenPlots.filter(p=>p.planted&&!p.watered);if(!list.length)toast('Todos estão regados, ou ainda vazios.');else if(spend(list.length)){playSound('water');list.forEach(p=>p.watered=true);toast(list.length+' canteiros regados.');}save();updateHud();$('info-modal').close();openGreenhouse()};
 $('compost-green').onclick=()=>{const p=state.greenPlots.find(p=>p.planted&&!cropReady(p)&&p.fertilizedDay!==state.day);if(!p)toast('Nenhuma planta precisa de adubo agora.');else if(!state.inventory.compost)toast('Limpe o celeiro para conseguir adubo.');else if(spend(1)){state.inventory.compost--;p.growth=Math.min(cropOf(p).days,p.growth+1);p.fertilizedDay=state.day;toast('Planta adubada! +1 etapa de crescimento.');}save();updateHud();$('info-modal').close();openGreenhouse()};
}
function barnPanel(){const list=sceneAnimals().filter(a=>a.kind),fed=list.filter(a=>state.care[a.uid]?.fed===state.day).length,pet=list.filter(a=>state.care[a.uid]?.pet===state.day).length,produce=list.reduce((sum,a)=>sum+(state.care[a.uid]?.produce||0),0);info('Rotina do celeiro',`<p><b>${list.length} animais de produção aqui agora</b> · ${fed} alimentados · ${pet} receberam carinho · ${produce} produtos disponíveis.</p><p>Às 18h o rebanho do pasto se junta aos moradores do celeiro.</p><div class="barn-list">${list.map(a=>`<div>${a.name}<small>${state.care[a.uid]?.fed===state.day?'🌾 alimentado':'aguarda ração'} · ${state.care[a.uid]?.pet===state.day?'♥ carinho em dia':'aguarda carinho'} · ${state.care[a.uid]?.produce||0} ${itemInfo[a.kind][1]}</small></div>`).join('')}</div><button class="primary" id="barn-pet">Fazer carinho nos moradores</button><button class="primary" id="barn-feed">Alimentar os moradores</button><button class="primary" id="barn-collect">Recolher produção disponível</button><button class="primary" id="barn-clean">${state.barnCleanDay===state.day?'Celeiro limpo hoje':'Limpar as baias · +2 adubos'}</button><p>Ração: ${state.inventory.feed} · limpeza custa 5 de energia. O adubo ajuda a estufa.</p>`);
 const refresh=()=>{save();updateHud();$('info-modal').close();barnPanel()};
 $('barn-pet').onclick=()=>{const need=list.filter(a=>state.care[a.uid]?.pet!==state.day);if(need.length&&!spend(need.length)){updateHud();return}playSound('pet');list.forEach(a=>{const c=state.care[a.uid]||(state.care[a.uid]={pet:0,fed:0,produce:0});c.pet=state.day});toast('Carinho em dia! ♥');refresh()};
 $('barn-feed').onclick=()=>{if(state.energy<1){spend(1);updateHud();return}let n=0;list.forEach(a=>{const c=state.care[a.uid]||(state.care[a.uid]={pet:0,fed:0,produce:0});if(c.fed!==state.day&&state.inventory.feed>0&&state.energy>=1){spend(1);playSound('feed');state.inventory.feed--;c.fed=state.day;n++;}});recordTask('feed',n);toast(n?n+' animais alimentados.':'Já comeram hoje ou a ração acabou.');refresh()};
 $('barn-collect').onclick=()=>{if(state.energy<1){spend(1);updateHud();return}let n=0;list.forEach(a=>{const c=state.care[a.uid];if(c?.produce&&state.energy>=1){spend(1);playSound('gather');state.inventory[a.kind]+=c.produce;n+=c.produce;c.produce=0;}});toast(n?'+'+n+' produtos na mochila.':'Nenhuma produção disponível. Carinho + ração hoje = produção amanhã.');refresh()};
 $('barn-clean').onclick=()=>{if(state.barnCleanDay===state.day)toast('As baias já estão limpas. Volte amanhã.');else if(spend(5)){playSound('hoe');state.barnCleanDay=state.day;state.inventory.compost+=2;toast('Celeiro limpo! +2 adubos para a estufa.');}refresh()};
}
function openRest(){if(state.picnicDay===state.day){toast('Você já descansou no bosque hoje.');return}state.picnicDay=state.day;state.energy=Math.min(100,state.energy+12);toast('Uma pausa entre as árvores. +12 energia.');save();updateHud();}
function advanceClock(dt){daySeconds+=dt;const steps=Math.floor(daySeconds);if(!steps)return;daySeconds-=steps;state.minute+=steps*2;if(state.minute>=1440){scene='house';player={...Valley.homeSpawn};sleep();resize();toast('O vale adormeceu. Você descansou em casa e um novo dia começou.');}updateHud();nightNotices();}
function dayPhase(){return state.minute<720?'☀ Manhã':state.minute<1080?'☀ Tarde':'☾ Noite';}
let miniMapStamp=-1;
const mapLandmarks=[{id:'house',name:'Casa',x:256,y:310},{id:'barn',name:'Celeiro',x:1248,y:742},{id:'greenhouse',name:'Estufa',x:608,y:887},{id:'shop',name:'Feira / missões',x:664,y:630},{id:'fish',name:'Píer',x:752,y:928},{id:'cave',name:'Gruta',x:772,y:177},{id:'dream',name:'Jardim lunar',x:1305,y:291},{id:'grove',name:'Bosque',x:563,y:228}];
function mapPosition(){return scene==='world'?player:mapLandmarks.find(m=>m.id===scene)||mapLandmarks[0];}
function paintMap(c,w,h,labels=false,time=0){const pad=labels?30:5,s=Math.min((w-pad*2)/Valley.W,(h-pad*2)/Valley.H),ox=(w-Valley.W*s)/2,oy=(h-Valley.H*s)/2;c.clearRect(0,0,w,h);c.fillStyle='#241c36';c.fillRect(0,0,w,h);c.save();c.translate(ox,oy);c.scale(s,s);for(let y=0;y<Valley.tiles.length;y++)for(let x=0;x<Valley.tiles[y].length;x++){const t=Valley.tiles[y][x];c.fillStyle=({grass:'#7c9d88',path:'#cfb08b',water:'#517ca1',bridge:'#dab796',pier:'#dab796'})[t];c.fillRect(x*32,y*32,33,33);}for(const o of Valley.objects){if(o.type==='tree'){c.fillStyle=o.pink?'#c293b4':'#526f74';c.fillRect(o.x-9,o.y-14,36,28);}if(['house','barn','greenhouse','market','cave','portal'].includes(o.type)){c.fillStyle=o.type==='portal'?'#b996d1':'#725768';c.fillRect(o.x,o.y,o.w,o.h);}}c.restore();
 if(labels){c.font='12px Georgia';c.textAlign='center';for(const m of mapLandmarks){const x=ox+m.x*s,y=oy+m.y*s;c.fillStyle='#fff0cf';c.fillRect(x-3,y-3,6,6);c.fillStyle='#241b37';const tw=c.measureText(m.name).width;c.fillRect(x-tw/2-4,y+5,tw+8,18);c.fillStyle='#fff0db';c.fillText(m.name,x,y+18);}c.textAlign='left';}
 const p=mapPosition(),px=ox+p.x*s,py=oy+p.y*s;c.fillStyle='#40264e';c.beginPath();c.arc(px,py,labels?8:5,0,Math.PI*2);c.fill();c.fillStyle='#ffe6ab';c.beginPath();c.arc(px,py,labels?4:2.5,0,Math.PI*2);c.fill();
}
function drawMiniMap(time){if(!running||time-miniMapStamp<160)return;miniMapStamp=time;const el=$('minimap');paintMap(el.getContext('2d'),el.width,el.height,false,time);$('map-location').textContent=scene==='world'?'✦ Você está aqui':$('location').textContent;}
function openMap(){info('Encontre seu caminho',`<p>O ponto dourado mostra sua posição${scene!=='world'?' na entrada de '+$('location').textContent.toLowerCase():''}. Pontes atravessam o rio; a água continua bloqueada.</p><canvas id="large-map" width="690" height="518" aria-label="Mapa do vale com sua posição e destinos"></canvas><div class="map-legend"><span>✦ Sua posição</span><span>Azul · água</span><span>Bege · caminhos e pontes</span></div><p>O Bosque das Lanternas fica entre a casa e a gruta. A feira também tem um quadro de missões.</p>`);const el=$('large-map');paintMap(el.getContext('2d'),el.width,el.height,true);}
function configureNewContent(){
 // Keep all original content. Only move the lamp that narrows the house exit route.
 const lamp=Valley.objects.find(o=>o.type==='lamp'&&o.x===370&&o.y===308);if(lamp){lamp.x=410;lamp.y=301;lamp.depth=311;}
 Valley.objects.push({type:'portal',x:528,y:168,w:70,h:60,solid:true,name:'Bosque das Lanternas',next:'grove',door:{x:563,y:228},variant:'blue'});
 Valley.objects.push({type:'sign',x:557,y:595,w:30,h:16,solid:true,text:'PEDIDOS',interaction:'missions',anchor:{x:572,y:628}});
 const room=Valley.interiors.greenhouse;room.objects.filter(o=>o.type==='planter').forEach((o,i)=>{o.greenIndex=i;o.interaction='greenplot';o.anchor={x:o.x+o.w/2,y:o.y+o.h+13};});
 const barn=Valley.interiors.barn;const barrel=barn.objects.find(o=>o.type==='barrel');Object.assign(barrel,{interaction:'barn-care',anchor:{x:82,y:240}});barn.objects.filter(o=>o.type==='hay').forEach(o=>Object.assign(o,{interaction:'hay-supply',anchor:{x:o.x+o.w/2,y:o.y+o.h+12}}));
 Valley.interiors.grove={w:480,h:352,exit:{x:240,y:322},objects:[
 {type:'tree',x:66,y:122,w:18,h:16,solid:true,size:.8,variant:'gold',depth:138,seed:21},
 {type:'tree',x:386,y:120,w:18,h:16,solid:true,size:.8,variant:'lilac',depth:136,seed:26},
 {type:'tree',x:83,y:244,w:18,h:16,solid:true,size:.8,pink:true,depth:260,seed:9},
 {type:'tree',x:385,y:246,w:18,h:16,solid:true,size:.8,variant:'gold',depth:262,seed:13},
 {type:'tree',x:238,y:78,w:18,h:16,solid:true,size:.65,pink:true,depth:94,seed:40},
 {type:'bench',x:202,y:153,w:66,h:18,solid:true,interaction:'picnic',anchor:{x:235,y:187}},
 {type:'lamp',x:132,y:149,w:10,h:10,solid:true},{type:'lamp',x:337,y:149,w:10,h:10,solid:true},
 {type:'lamp',x:148,y:272,w:10,h:10,solid:true},{type:'lamp',x:327,y:272,w:10,h:10,solid:true},
 {type:'sign',x:216,y:109,w:30,h:10,solid:true,text:'POMAR'},
 {type:'bush',x:166,y:85,w:25,h:17,solid:true,pink:true,seed:11},{type:'bush',x:300,y:85,w:25,h:17,solid:true,pink:true,seed:12}
 ]};
 [[111,113],[372,109],[110,265],[363,271],[268,113]].forEach(([x,y])=>resource('grove','apple',x,y));
 [[159,212],[310,211],[194,281],[278,278],[61,195],[420,192]].forEach(([x,y])=>resource('grove','flower',x,y));
 [[130,311],[340,313],[325,115]].forEach(([x,y])=>resource('grove','wood',x,y));
 [[154,180],[306,244]].forEach(([x,y])=>resource('grove','mushroom',x,y));
 [['coelho','Coelho Canela',183,235,19],['esquilo','Esquilo Pêssego',330,187,20],['cervo','Cervo Lanterninha',280,129,29]].forEach(([id,name,x,y,size],i)=>farmAnimals.push({id,uid:'grove-'+i,name,x,y,size,home:'grove',bounds:{x:x-15,y:y-12,w:30,h:24}}));
}
function updateMinerals(){const common=['crystal','roseQuartz','aquamarine'];const nodes=resourceNodes.filter(n=>n.scene==='cave'&&n.type==='crystal');nodes.forEach((n,i)=>{const pick=i===nodes.length-1?(state.day%4===0?'sunstone':state.day%2===1?'emerald':'aquamarine'):common[(i+state.day-1)%3],m=mineralDefs[pick];n.item=pick;n.colors=m.colors;n.qty=m.qty;n.rarity=m.rarity;});}
function newContentInteract(t,tool){
 if(t.type==='greenplot'){usePlot(state.greenPlots[t.object.greenIndex],tool);return true}
 if(t.type==='greenhouse-gift'){openGreenhouse();return true}
 if(t.type==='missions'){openMission();return true}
 if(t.type==='barn-care'){barnPanel();return true}
 if(t.type==='picnic'){openRest();return true}
 if(t.type==='hay-supply'){if(state.hayDay===state.day)toast('Você já separou ração hoje. Volte amanhã.');else{state.hayDay=state.day;state.inventory.feed+=3;state.inventory.hay+=2;toast('+3 rações e +2 fenos do estoque.');}return true}
 return false;
}

function drawStationHints(time){const list=scene==='world'?Valley.objects:Valley.interiors[scene].objects;const labels={'furniture-shop':'ATELIÊ','greenhouse-gift':'CULTIVAR','barn-care':'ROTINA','hay-supply':'RAÇÃO',missions:'MISSÕES',mill:'RAÇÃO',hive:'MEL','ruins-puzzle':'INSCRIÇÕES'};ctx.save();ctx.font='5px monospace';ctx.textAlign='center';for(const o of list){if(o.type==='market'){drawMarketCanopy(ctx,o);continue;}const label=o.challengeMarker?null:labels[o.interaction];if(!label)continue;const x=o.x+o.w/2,y=o.y-7;const w=ctx.measureText(label).width+8;ctx.fillStyle='#30233ddd';ctx.fillRect(x-w/2,y-6,w,10);ctx.fillStyle='#ffe2ad';ctx.fillText(label,x,y+1);}ctx.restore();}
