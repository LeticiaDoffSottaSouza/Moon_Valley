/* Moon Valley: mapa, arte e colisões compartilham os mesmos objetos. */
'use strict';
const Valley=(()=>{
 const T=32,W=2048,H=1152,cols=W/T,rows=H/T;
 const palettes={grass:['#779b83','#80a489','#86aa8c','#739883'],path:['#c4a083','#cba98a','#d1af8e'],water:['#3e6c91','#426f99','#497aa2'],outline:'#372a4c'};
 const tiles=Array.from({length:rows},()=>Array(cols).fill('grass'));
 const objects=[],interiors={},cache={};let currentTime=0;
 const random=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)};
 const rect=(c,x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))};
 function ellipse(c,x,y,rx,ry,color){for(let yy=-ry;yy<=ry;yy+=2){const half=Math.sqrt(Math.max(0,1-(yy*yy)/(ry*ry)))*rx;rect(c,x-half,y+yy,half*2,2,color)}}
 function poly(c,pts,color){c.fillStyle=color;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill()}
 function fillTiles(x,y,w,h,type){for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)if(tiles[j]?.[i])tiles[j][i]=type}
 function road(x1,y1,x2,y2,width=2){if(x1===x2)fillTiles(x1-Math.floor(width/2),Math.min(y1,y2),width,Math.abs(y2-y1)+1,'path');else fillTiles(Math.min(x1,x2),y1-Math.floor(width/2),Math.abs(x2-x1)+1,width,'path')}
 function object(type,x,y,w,h,extra={}){const o={type,x,y,w,h,solid:true,...extra};objects.push(o);return o}
 // Water is blocked tile by tile. Bridges replace water tiles with walkable deck tiles.
 fillTiles(28,2,4,32,'water');fillTiles(27,4,1,5,'water');fillTiles(32,17,2,7,'water');fillTiles(19,28,10,5,'water');fillTiles(17,29,2,3,'water');fillTiles(21,27,7,1,'water');
 road(3,14,44,14);road(14,7,14,33);road(8,10,14,10);road(8,10,8,12);road(8,16,14,16);road(14,20,22,20);road(20,20,20,25);road(20,24,27,24);road(36,14,36,29);road(36,25,43,25);road(36,8,43,8);road(39,8,39,14);road(14,7,24,7);road(24,4,24,7);road(32,23,36,23);road(14,24,28,24);
 fillTiles(28,13,4,3,'bridge');fillTiles(28,23,4,2,'bridge');fillTiles(23,27,2,3,'pier');fillTiles(17,27,4,2,'path');
 // Foundations establish the sizes of buildings; their painted roof is a separate upper layer.
 object('house',160,192,192,112,{id:'home',name:'Sua casa',door:{x:256,y:310},roof:'#9c5268'});
 object('barn',1152,608,192,128,{id:'barn',name:'Celeiro',door:{x:1248,y:742},roof:'#70506d'});
 object('greenhouse',544,784,128,96,{id:'greenhouse',name:'Estufa',door:{x:608,y:887}});
 object('market',608,564,112,52,{name:'Feira',door:{x:664,y:630}});
 object('well',386,351,36,35,{name:'Poço',interact:'well',anchor:{x:404,y:395}});
 object('cave',716,80,112,88,{name:'Gruta',door:{x:772,y:177}});
 object('waterfall',896,88,128,67,{solid:false,depth:-3});
 [[864,80],[1030,84],[864,134],[1032,139]].forEach(([x,y])=>object('rock',x,y,23,22));
 [[1215,217],[1359,247],[1240,313],[1387,296]].forEach(([x,y],i)=>object('mushroom',x,y,16+i%2*5,18+i%2*4));
 object('portal',1270,208,70,74,{name:'Jardim dos sonhos',door:{x:1305,y:291}});
 function fence(x,y,len,vertical=false,gap=-1){for(let i=0;i<len;i++){if(gap>=0&&(i===gap||i===gap+1))continue;object(vertical?'fence-v':'fence',x+(vertical?0:i*32),y+(vertical?i*32:0),vertical?8:32,vertical?32:8)}}
 // Grazing enclosure: actual fence segments, a gate wide enough for all characters.
 fence(1120,784,9,false,3);fence(1120,976,9);fence(1120,784,6,true);fence(1408,784,6,true);
 fence(128,552,8,false,4);fence(128,384,4,true);fence(384,384,4,true);
 fence(544,900,5,false,1);
 // Trees have trunk hitboxes, not invisible rectangular canopies.
 function tree(x,y,pink=false,size=1){object('tree',x-9,y-12,18,16,{pink,size,depth:y+4,seed:x+y,visual:{x:x-50*size,y:y-100*size,w:100*size,h:108*size}})}
 for(let x=48;x<W-32;x+=64){tree(x,66,x%192===48,.9);tree(x,H-40,x%256===48,1)}
 for(let y=130;y<H-70;y+=68){tree(43,y,y%3===0,1);tree(W-45,y,y%4===0,1)}
 [[96,234],[116,337],[396,221],[554,274],[654,355],[766,360],[836,591],[1056,290],[1104,368],[1380,372],[1368,560],[1417,685],[1061,933],[1286,1061],[355,748],[86,666],[135,864],[515,999],[733,979],[817,888],[515,708],[981,1010],[571,124],[663,138],[842,211],[1172,181],[1420,191],[388,611]].forEach(([x,y],i)=>tree(x,y,i%3===0,1+(i%4)*.08));
 [[111,181],[372,346],[1104,560],[100,930],[542,935],[836,969],[1333,997],[1414,307],[698,380],[582,253],[410,799],[1070,226]].forEach(([x,y],i)=>object('bush',x,y,27,18,{pink:i%2===0,seed:i}));
 object('berry',348,323,30,20,{name:'Amoras',anchor:{x:363,y:356}});
 object('bench',170,682,57,18);object('bench',1296,365,57,18);object('bench',530,980,57,18);
 [[370,308],[556,453],[832,451],[1054,451],[1360,742],[561,897],[760,838],[1315,283]].forEach(([x,y])=>object('lamp',x,y,10,10,{depth:y+10}));
 [[477,336,'FAZENDA'],[550,548,'FEIRA'],[1087,568,'CELEIRO'],[708,186,'GRUTA'],[701,810,'LAGO']].forEach(([x,y,text])=>object('sign',x,y,24,10,{text}));
 // Interior sizes: house 12 × 9 tiles; barn 14 × 10; greenhouse 10 × 8.
 const room=(w,h,objects,exit)=>({w,h,objects,exit});
 interiors.house=room(320,240,[
 {type:'bed',x:38,y:64,w:46,h:59,solid:true,anchor:{x:61,y:137},interaction:'bed'},
 {type:'kitchen',x:191,y:48,w:88,h:30,solid:true},
 {type:'fireplace',x:120,y:43,w:48,h:34,solid:true},
 {type:'table',x:234,y:117,w:43,h:31,solid:true},
 {type:'chair',x:213,y:123,w:16,h:19,solid:true},
 {type:'chest',x:40,y:177,w:35,h:22,solid:true,anchor:{x:89,y:192},interaction:'chest'},
 {type:'plant',x:278,y:177,w:17,h:18,solid:true},
 {type:'plant',x:96,y:51,w:17,h:18,solid:true}
 ],{x:160,y:210});
 interiors.barn=room(384,288,[
 {type:'hay',x:43,y:65,w:40,h:32,solid:true},{type:'hay',x:300,y:65,w:40,h:32,solid:true},
 {type:'trough',x:108,y:71,w:56,h:19,solid:true,anchor:{x:136,y:107},interaction:'trough'},
 {type:'trough',x:220,y:71,w:56,h:19,solid:true,anchor:{x:248,y:107},interaction:'trough'},
 {type:'barrel',x:48,y:216,w:20,h:23,solid:true},
 {type:'fence',x:35,y:117,w:107,h:8,solid:true},{type:'fence',x:242,y:117,w:107,h:8,solid:true},
 {type:'plant',x:326,y:216,w:18,h:18,solid:true}
 ],{x:192,y:258});
 interiors.greenhouse=room(288,224,[{type:'planter',x:35,y:65,w:69,h:35,solid:true},{type:'planter',x:184,y:65,w:69,h:35,solid:true},{type:'seedbox',x:112,y:47,w:62,h:23,solid:true,anchor:{x:143,y:87},interaction:'greenhouse-gift'},{type:'planter',x:35,y:133,w:65,h:35,solid:true},{type:'planter',x:189,y:133,w:65,h:35,solid:true}],{x:144,y:193});
 interiors.cave=room(384,288,[{type:'crystal',x:65,y:71,w:37,h:35,solid:true},{type:'crystal',x:260,y:71,w:48,h:44,solid:true},{type:'crystal',x:164,y:62,w:50,h:37,solid:true,anchor:{x:189,y:115},interaction:'crystal'}],{x:192,y:258});
 interiors.dream=room(448,320,[{type:'tree',x:73,y:137,w:18,h:16,solid:true,pink:true,size:.75,depth:153},{type:'tree',x:359,y:143,w:18,h:16,solid:true,pink:true,size:.75,depth:159},{type:'star',x:210,y:80,w:26,h:20,solid:true,anchor:{x:223,y:115},interaction:'star'},{type:'mushroom',x:116,y:70,w:24,h:24,solid:true},{type:'mushroom',x:313,y:66,w:30,h:30,solid:true}],{x:224,y:290});
 const bounds=scene=>scene==='world'?{w:W,h:H}:{w:interiors[scene].w,h:interiors[scene].h};
 function inRect(x,y,r,pad=0){if(r.type==='pond')return ((x-r.x-r.w/2)/(r.w/2+pad+2))**2+((y-r.y-r.h/2)/(r.h/2+pad+2))**2<=1;return x>=r.x-pad&&x<=r.x+r.w+pad&&y>=r.y-pad&&y<=r.y+r.h+pad}
 function terrainAt(x,y){return tiles[Math.floor(y/T)]?.[Math.floor(x/T)]||'outside'}
 function footprint(x,y){return [{x:x-5,y:y-6},{x:x+5,y:y-6},{x:x-5,y:y},{x:x+5,y:y}]}
 function canStand(scene,x,y,extra=[],ignore=[]){const b=bounds(scene);if(x<22||y<32||x>b.w-22||y>b.h-22)return false;const body=footprint(x,y);
 if(scene==='world'){if(body.some(p=>['outside','water'].includes(terrainAt(p.x,p.y))))return false;if(objects.some(o=>o.solid&&!o.hidden&&!ignore.includes(o.type)&&body.some(p=>inRect(p.x,p.y,o))))return false;}
 else{if(y<48||x<30||x>b.w-30||y>b.h-26)return false;if(interiors[scene].objects.some(o=>o.solid&&!o.hidden&&!ignore.includes(o.type)&&body.some(p=>inRect(p.x,p.y,o))))return false}
 return !extra.some(o=>body.some(p=>inRect(p.x,p.y,o)));
 }
 function lineClear(scene,x1,y1,x2,y2){const count=Math.ceil(Math.hypot(x2-x1,y2-y1)/6);for(let i=1;i<count;i++){const t=i/count,x=x1+(x2-x1)*t,y=y1+(y2-y1)*t;if(scene==='world'&&terrainAt(x,y)==='water')return false;const list=scene==='world'?objects:interiors[scene].objects;if(list.some(o=>o.solid&&!o.hidden&&inRect(x,y,o,0)))return false}return true}
 function ground(c){rect(c,0,0,W,H,'#789c83');for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const type=tiles[y][x],n=x+y*cols,px=x*T,py=y*T;
 if(type==='grass'){rect(c,px,py,T,T,palettes.grass[Math.floor(random(n)*4)]);for(let k=0;k<6;k++){const xx=px+Math.floor(random(n*13+k)*29),yy=py+Math.floor(random(n*7+k+3)*29);rect(c,xx,yy,2,2,k%2?'#9cb791':'#658775');if(k%3===0)rect(c,xx+2,yy-2,1,2,'#a9c399')}}
 if(type==='path'){rect(c,px,py,T,T,palettes.path[Math.floor(random(n)*3)]);for(let k=0;k<4;k++)rect(c,px+Math.floor(random(n*7+k)*26)+2,py+Math.floor(random(n*17+k)*26)+2,2,1,'#ab8878');for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]])if(tiles[y+dy]?.[x+dx]==='grass'){if(dx)rect(c,px+(dx>0?30:0),py,2,32,'#a8ad85');else rect(c,px,py+(dy>0?30:0),32,2,'#a8ad85')}}
 if(type==='water'){rect(c,px,py,T,T,palettes.water[Math.floor(random(n)*3)]);for(let k=0;k<3;k++){const xx=px+Math.floor(random(n*7+k)*20),yy=py+5+k*9;rect(c,xx,yy,9,1,'#70a5b7');rect(c,xx+3,yy+1,9,1,'#598ea7')}for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]])if(tiles[y+dy]?.[x+dx]&&!['water','bridge','pier'].includes(tiles[y+dy][x+dx])){if(dx){rect(c,px+(dx>0?27:0),py,5,32,'#a3c5b1');rect(c,px+(dx>0?26:5),py,1,32,'#c8d7bf')}else{rect(c,px,py+(dy>0?27:0),32,5,'#a3c5b1');rect(c,px,py+(dy>0?26:5),32,1,'#c8d7bf')}}}
 if(type==='bridge'||type==='pier'){rect(c,px,py,T,T,'#735766');for(let k=0;k<8;k++){rect(c,px,py+k*4,T,3,k%2?'#b78669':'#c79675');rect(c,px+random(n+k)*24,py+k*4+1,6,1,'#8c665e')}if(type==='bridge'&&(y===13||y===24)){rect(c,px,py+(y===13?0:29),32,3,'#583c53');rect(c,px,py+(y===13?0:23),3,9,'#e2b08a')}}
 }
 // Floral borders around clearing edges; decorative plants are small ground details.
 for(let i=0;i<400;i++){const x=75+Math.floor(random(i+989)*1385),y=100+Math.floor(random(i+1976)*940);if(terrainAt(x,y)!=='grass'||objects.some(o=>inRect(x,y,o,15)))continue;flower(c,x,y,i%3===0?'#eab5d5':i%3===1?'#c9b7e8':'#efdc9f',i)}
 rect(c,140,380,236,165,'#b2a385');for(let i=0;i<90;i++)rect(c,146+random(i+190)*225,386+random(i+240)*153,2,1,'#c5af92');
 rect(c,1140,801,248,160,'#a29779');for(let i=0;i<70;i++)rect(c,1148+random(i+390)*234,810+random(i+440)*145,2,2,'#adb18b');
 // Rugs and flower beds are ground layer, never hidden static animals.
 }
 function flower(c,x,y,color,seed=0){rect(c,x,y-5,2,6,'#3d7062');rect(c,x-3,y-2,4,2,'#57986e');rect(c,x+2,y-4,3,2,'#57986e');rect(c,x-2,y-9,6,5,color);rect(c,x,y-10,2,7,color);rect(c,x,y-7,2,2,'#ffe4a6')}
 function treeArt(c,o){const s=o.size||1,cx=o.x+o.w/2,base=o.y+o.h,top=base-84*s;ellipse(c,cx,base,30*s,6,'#3c53544d');rect(c,cx-8*s,base-48*s,16*s,48*s,'#503a4b');rect(c,cx-5*s,base-48*s,6*s,45*s,'#916358');rect(c,cx-5*s,base-14*s,3*s,17*s,'#b48363');rect(c,cx-12*s,base-5*s,24*s,5*s,'#624a4a');const colors=o.variant==='gold'?['#70604f','#a18a60','#c1ad7c','#d9c58f','#efe0aa']:o.variant==='lilac'?['#5b5378','#86749f','#a393c0','#c2aed8','#decaec']:o.variant==='blue'?['#3c6577','#5e8d9c','#81adbd','#a5cddd','#c2e0e8']:o.pink?['#765071','#a66894','#c98bab','#e5aac8','#f0bdd5']:['#304a59','#3d6974','#4d8287','#6aa098','#8cbaaa'];const clusters=[[-20,19,27,21],[17,18,30,25],[-5,-1,31,27],[-29,-2,22,21],[24,-5,22,21],[-10,-23,25,21],[10,-23,23,20],[-33,29,18,17],[33,26,18,18],[0,33,33,19]];
 clusters.forEach(([dx,dy,rx,ry],i)=>{ellipse(c,cx+dx*s,top+dy*s,rx*s,ry*s,colors[0]);ellipse(c,cx+dx*s,top+dy*s-3*s,(rx-2)*s,(ry-3)*s,colors[1+i%3]);for(let k=0;k<9;k++){const xx=cx+(dx+(random(i*29+k+o.seed)*2-1)*(rx-8))*s,yy=top+(dy+(random(i*47+k)*2-1)*(ry-6))*s;rect(c,xx,yy,3*s,2*s,colors[2+k%3])}})}
 function windowArt(c,x,y,w=26,h=26){rect(c,x-3,y-3,w+6,h+6,'#433044');rect(c,x,y,w,h,'#bc8c71');rect(c,x+3,y+3,w-6,h-6,'#ffe4a1');rect(c,x+w/2-1,y,2,h,'#8d5d55');rect(c,x,y+h/2-1,w,2,'#8d5d55');rect(c,x-5,y+h+1,w+10,4,'#daae87')}
 function doorArt(c,x,y,w=28,h=38){rect(c,x-3,y-3,w+6,h+3,'#3b2b44');rect(c,x,y,w,h,'#8c5a63');rect(c,x+3,y+3,w-6,h-4,'#af7671');rect(c,x+5,y+7,w-10,15,'#8a535e');rect(c,x+w-7,y+25,3,3,'#ffe5a8');rect(c,x-5,y+h,w+10,5,'#d2a68a');rect(c,x-7,y+h+5,w+14,3,'#ad8b7b')}
 function houseArt(c,o){const {x,y,w,h}=o;ellipse(c,x+w/2,y+h+5,w*.55,8,'#30334942');rect(c,x-3,y-3,w+6,h+6,'#403046');rect(c,x,y,w,h,'#a97869');for(let yy=y+4;yy<y+h;yy+=9){rect(c,x,yy,w,2,'#815b5e');for(let xx=x+12;xx<x+w;xx+=40)rect(c,xx,yy+4,14,1,'#c9997f')}rect(c,x+6,y+2,5,h,'#dab08e');rect(c,x+w-11,y+2,5,h,'#dab08e');
 const roofTop=y-65;poly(c,[[x-13,y+14],[x+w/2,roofTop],[x+w+13,y+14]],'#3f2b46');poly(c,[[x-8,y+9],[x+w/2,roofTop+5],[x+w+8,y+9]],o.roof||'#91556d');for(let yy=roofTop+12;yy<y+8;yy+=8){const half=(yy-roofTop)/(y+14-roofTop)*(w/2+10);rect(c,x+w/2-half,yy,half*2,2,'#623c58');for(let xx=x+w/2-half+5;xx<x+w/2+half-5;xx+=16)rect(c,xx,yy-5,11,3,'#b87781')}rect(c,x-11,y+12,w+22,5,'#ce927d');if(o.type==='house'){rect(c,x+w-37,roofTop+10,19,36,'#82646b');rect(c,x+w-39,roofTop+7,23,6,'#ad8390');}
 if(o.type==='barn'){doorArt(c,x+w/2-23,y+h-53,46,53);rect(c,x+w/2,y+h-51,2,48,'#e4b3a3');poly(c,[[x+w/2-20,y+h-48],[x+w/2-17,y+h-49],[x+w/2+18,y+h-5],[x+w/2+15,y+h-3]],'#e4b3a3');if(typeof state!=='undefined'&&state&&state.minute<1080){rect(c,x+w/2-21,y+h-50,42,48,'#3c2d47');rect(c,x+w/2-34,y+h-51,11,49,'#ac7776');rect(c,x+w/2+23,y+h-51,11,49,'#ac7776');}windowArt(c,x+w/2-14,y+27,28,22);rect(c,x+20,y+h-31,28,24,'#cfaf66');for(let i=0;i<5;i++)rect(c,x+21+i*5,y+h-29,2,20,'#e9c78a');}
 else{windowArt(c,x+25,y+37);windowArt(c,x+w-51,y+37);doorArt(c,x+w/2-14,y+h-38);for(let i=0;i<4;i++){flower(c,x+12+i*12,y+h+1,'#dda5c8',i);flower(c,x+w-51+i*12,y+h+1,'#bbaee2',i+3)}rect(c,x+12,y+25,3,72,'#527765');for(let k=0;k<12;k++)rect(c,x+7+(k%2)*8,y+24+k*6,8,4,'#668f73')}
 }
 function greenhouseArt(c,o){const {x,y,w,h}=o;rect(c,x-3,y-3,w+6,h+6,'#44354f');rect(c,x,y,w,h,'#73969d');poly(c,[[x-6,y],[x+w/2,y-47],[x+w+6,y]],'#d1b2c6');poly(c,[[x+4,y-4],[x+w/2,y-40],[x+w-4,y-4]],'#8faec0');for(let xx=x+8;xx<x+w;xx+=22){rect(c,xx,y,16,h-10,'#a8c8c3');rect(c,xx,y+3,16,5,'#d5dfd0');rect(c,xx-3,y-18,3,h+18,'#d5afbf')}rect(c,x,y+39,w,4,'#d5afbf');rect(c,x-6,y,w+12,4,'#d5afbf');doorArt(c,x+w/2-12,y+h-36,24,36);for(let i=0;i<5;i++){flower(c,x+10+i*10,y+h-4,'#e2a6cb',i);flower(c,x+w-50+i*10,y+h-4,'#efdc9f',i)} }
 function bushArt(c,o){const x=o.x+o.w/2,y=o.y+o.h;ellipse(c,x,y,o.w*.6,4,'#3c535440');ellipse(c,x,y-8,o.w*.6,12,'#355d63');ellipse(c,x-5,y-12,12,10,'#608e7b');ellipse(c,x+7,y-10,12,10,'#779f87');for(let i=0;i<8;i++)rect(c,x-10+random(i+o.seed)*21,y-19+random(i*3+o.seed)*17,3,3,o.type==='berry'?'#a3a1d2':o.pink?'#e6b3ce':'#afc4a2')}
 function fenceArt(c,o){const {x,y,w,h}=o;if(o.type==='fence-v'){rect(c,x,y,7,h,'#533d50');rect(c,x+2,y,3,h,'#a88170');rect(c,x-3,y,13,12,'#6b4e5d');rect(c,x-1,y,9,9,'#c99b7f');return}rect(c,x,y+2,w,5,'#725263');rect(c,x,y-4,w,3,'#c09279');rect(c,x+1,y-12,7,22,'#5c4258');rect(c,x+2,y-12,5,19,'#c99b7f');rect(c,x+2,y-13,5,3,'#e4b28d');rect(c,x+w-7,y-12,6,21,'#a07869')}
 function objectArt(c,o,time=0){if(drawMoonObject(c,o,time))return;if(o.furnitureId){drawFurnitureArt(c,o,time);return;}if(['wardrobe','beach-chair','parasol','water-loot'].includes(o.type)){drawWardrobeObject(c,o,time);return;}if(o.challengeMarker){drawChallengeObject(c,o,time);return;}if(o.type==='forest-gate'||o.type==='fountain'){drawLayoutObject(c,o,time);return}if(o.specialChest){drawSpecialChest(c,o,time);return}if(o.furnitureId){drawFurnitureArt(c,o,time);return}if(['pond','logic-lamp'].includes(o.type)){drawDecorObject(c,o,time);return}const {x,y,w,h}=o;switch(o.type){case 'tree':treeArt(c,o);break;case 'house':case 'barn':houseArt(c,o);break;case 'greenhouse':greenhouseArt(c,o);break;case 'bush':case 'berry':bushArt(c,o);break;case 'fence':case 'fence-v':fenceArt(c,o);break;
 case 'sea':case 'dock':case 'mill':case 'beehive':case 'altar':case 'rune':case 'pillar':drawExpansionObject(c,o,time);break;case 'market':rect(c,x,y,w,h,'#755766');rect(c,x+4,y+3,w-8,h-7,'#b98871');for(let k=0;k<6;k++){rect(c,x+5+k*17,y+7,13,14,['#e7aa92','#cfbe7e','#aebf8e'][k%3]);rect(c,x+8+k*17,y+10,4,4,'#f6d7a1')}rect(c,x-3,y-38,w+6,35,'#dfacc5');for(let k=0;k<7;k++)rect(c,x-3+k*17,y-38,9,35,'#faf0d8');rect(c,x-5,y-40,w+10,4,'#68495f');rect(c,x+2,y-6,4,58,'#b38076');rect(c,x+w-6,y-6,4,58,'#b38076');break;
 case 'waterfall':rect(c,x,y,w,h,'#597eaa');for(let i=0;i<12;i++){const xx=x+3+i*10;rect(c,xx,y+((time/65+i*11)%18),3,h-22,i%2?'#b7d5dc':'#87b9cd')}ellipse(c,x+w/2,y+h,w/2+4,7,'#abcdd4');ellipse(c,x+w/2,y+h+3,w/2-2,4,'#7dabc2');break;
 case 'rock':ellipse(c,x+w/2,y+h/2,w/2,h/2,'#6b627f');ellipse(c,x+w/2-2,y+h/2-3,w/2-3,h/2-3,'#a69ab0');rect(c,x+4,y+6,w-10,2,'#c3b8c4');break;
 case 'well':ellipse(c,x+w/2,y+h/2+5,w/2,12,'#594755');ellipse(c,x+w/2,y+h/2,w/2,11,'#a391a2');ellipse(c,x+w/2,y+h/2,w/2-5,7,'#34435d');rect(c,x+2,y-19,4,38,'#795761');rect(c,x+w-6,y-19,4,38,'#795761');poly(c,[[x-6,y-14],[x+w/2,y-32],[x+w+6,y-14]],'#915569');break;
 case 'lamp':rect(c,x+3,y-32,4,41,'#5f4559');rect(c,x-1,y-37,12,12,'#63475f');rect(c,x+1,y-35,8,8,nightLevel()>0?'#ffe5ad':'#a4b0bd');poly(c,[[x-3,y-38],[x+5,y-45],[x+13,y-38]],'#77506a');if(time&&nightLevel()>0){c.globalAlpha=.10+Math.sin(time/600+x)*.025;ellipse(c,x+5,y-29,21,18,'#ffe7a8');c.globalAlpha=1}break;
 case 'sign':rect(c,x+10,y-11,4,27,'#916b6b');rect(c,x-3,y-27,w+6,18,'#543b55');rect(c,x-1,y-25,w+2,14,'#bc917b');c.fillStyle='#50384d';c.font='5px monospace';c.textAlign='center';c.fillText(o.text,x+w/2,y-15);c.textAlign='left';break;
 case 'bench':rect(c,x,y-12,w,12,'#8b686c');rect(c,x,y-10,w,2,'#d6ad87');rect(c,x,y+1,w,7,'#bb8c75');rect(c,x+5,y+5,4,13,'#654b59');rect(c,x+w-9,y+5,4,13,'#654b59');break;
 case 'cave':rect(c,x,y,w,h,'#645575');for(let j=0;j<4;j++)for(let i=0;i<5;i++)rect(c,x+i*23-((j%2)*9),y+j*20,21,18,['#82708e','#9c8b9e','#77677f'][(i+j)%3]);ellipse(c,x+w/2,y+h-27,26,33,'#342744');rect(c,x+w/2-23,y+h-23,46,23,'#29243d');rect(c,x+w/2-15,y+h-13,30,13,'#464161');rect(c,x-1,y+h-10,21,16,'#789979');rect(c,x+w-22,y+h-9,23,15,'#789979');break;
 case 'portal':rect(c,x,y-6,10,h+6,'#796786');rect(c,x+w-10,y-6,10,h+6,'#796786');rect(c,x,y-9,w,12,'#9f8bad');rect(c,x+13,y+4,w-26,h-9,o.variant==='blue'?'#547887':'#72518f');ellipse(c,x+w/2,y+36,20,27,'#ac87c4');ellipse(c,x+w/2,y+36,15,23,'#e0bde6');ellipse(c,x+w/2+7,y+31,15,23,'#72518f');flower(c,x+2,y+4,'#e2aed1');flower(c,x+w-5,y+13,'#e2aed1');break;
 case 'bed':rect(c,x-3,y-3,w+6,h+6,'#5b3c53');rect(c,x,y,w,h,'#a87774');rect(c,x+4,y+6,w-8,h-12,'#d1a6ce');rect(c,x+8,y+10,w-16,17,'#fff0df');rect(c,x+5,y+32,w-10,h-39,'#a385b8');for(let yy=y+38;yy<y+h-8;yy+=9)for(let xx=x+9;xx<x+w-6;xx+=10)rect(c,xx,yy,3,3,'#ecd9b5');rect(c,x-5,y-7,w+10,10,'#ae8170');break;
 case 'kitchen':rect(c,x,y,w,h,'#715360');rect(c,x-2,y-3,w+4,8,'#dcb8a0');for(let i=0;i<3;i++){rect(c,x+4+i*w/3,y+10,w/3-7,h-14,'#ae83a0');rect(c,x+14+i*w/3,y+15,2,2,'#ffe7ac')}rect(c,x+5,y-4,30,4,'#55435b');rect(c,x+9,y-3,9,2,'#b98393');rect(c,x+50,y-5,34,9,'#648088');break;
 case 'fireplace':
 rect(c,x-2,y+h-3,w+4,5,'#a18c96');rect(c,x,y,w,h,'#947e8c');
 for(let row=0;row<4;row++)for(let col=0;col<4;col++){const xx=x+2+col*12+(row%2?5:0);if(xx<x+w-4)rect(c,xx,y+5+row*7,Math.min(10,x+w-2-xx),5,row%2?'#af98a1':'#baa3aa');}
 rect(c,x-4,y-4,w+8,6,'#d6b5a0');rect(c,x-3,y+2,w+6,2,'#b18c83');
 rect(c,x+11,y+10,w-22,h-12,'#695063');rect(c,x+13,y+12,w-26,h-15,'#35283e');
 c.save();c.beginPath();c.rect(x+13,y+12,w-26,h-15);c.clip();
 rect(c,x+16,y+h-9,w-32,3,'#87624f');
 const fy=y+h-8,fx=x+w/2,flicker=Math.sin(time/220)*1;
 poly(c,[[fx-8,fy],[fx-5,fy-7],[fx-1,fy-4],[fx+2,fy-13+flicker],[fx+6,fy-7],[fx+8,fy]],'#f3a476');
 poly(c,[[fx-4,fy],[fx-2,fy-7],[fx+1,fy-10],[fx+4,fy]],'#ffe0a0');c.restore();
 rect(c,x+11,y+h-4,w-22,3,'#c6acaa');break;
 case 'table':ellipse(c,x+w/2,y+h+1,w*.5,5,'#281d3433');rect(c,x+5,y+10,5,h-9,'#654754');rect(c,x+w-10,y+10,5,h-9,'#654754');rect(c,x-2,y-2,w+4,h-5,'#745060');rect(c,x,y,w,h-9,'#c29a83');rect(c,x+5,y+5,w-10,14,'#e0b8c4');rect(c,x+26,y+7,5,6,'#8b749e');flower(c,x+28,y+7,'#eac6df');break;
 case 'chair':rect(c,x,y-8,w,h+8,'#775361');rect(c,x+2,y-6,w-4,8,'#c19b85');rect(c,x,y+7,w,5,'#c19b85');break;
 case 'chest':case 'seedbox':rect(c,x,y,w,h,'#674555');rect(c,x+2,y+2,w-4,h-4,'#b17d69');rect(c,x-2,y-3,w+4,9,'#d1a081');rect(c,x+6,y-2,3,h,'#76586b');rect(c,x+w-9,y-2,3,h,'#76586b');rect(c,x+w/2-3,y+7,6,7,'#f6d397');if(o.opened){rect(c,x-2,y-11,w+4,7,'#d1a081');rect(c,x+2,y+2,w-4,5,'#493746');}break;
 case 'plant':rect(c,x,y+5,w,13,'#a57879');rect(c,x+2,y+6,w-4,2,'#d4a594');for(let i=0;i<3;i++)flower(c,x+4+i*5,y+6,'#c5b7e7',i);break;
 case 'hay':rect(c,x,y,w,h,'#a7805c');rect(c,x+2,y+2,w-4,h-5,'#d8b777');for(let i=0;i<10;i++)rect(c,x+3+i*4,y+5,2,h-9,i%2?'#efd49a':'#bd975e');rect(c,x,y+h/2,w,3,'#a78473');break;
 case 'trough':rect(c,x,y,w,h,'#594454');rect(c,x+3,y+3,w-6,h-7,'#be9b68');for(let i=0;i<8;i++)rect(c,x+6+i*6,y+5,4,2,'#e3c98e');break;
 case 'barrel':ellipse(c,x+w/2,y+h/2,w/2,h/2,'#805865');rect(c,x+2,y+6,w-4,3,'#bc9c9d');rect(c,x+2,y+h-7,w-4,3,'#bc9c9d');break;
 case 'planter':rect(c,x,y,w,h,'#705062');rect(c,x+3,y+4,w-6,h-8,'#765450');if(o.greenIndex===undefined){for(let i=0;i<5;i++)flower(c,x+10+i*(w-17)/4,y+h-8,['#e1aad4','#ede0a7','#b8b6e7'][i%3],i);}else drawGreenPlot(c,o);rect(c,x,y+h-4,w,4,'#b08b78');break;
 case 'crystal':for(let i=0;i<3;i++){const xx=x+i*w/3,yy=y+Math.abs(1-i)*8;poly(c,[[xx,yy+h],[xx-5,yy+15],[xx+6,yy-5],[xx+15,yy+17],[xx+12,yy+h]],o.colors?.[0]||'#6f7fab');poly(c,[[xx+2,yy+17],[xx+6,yy-5],[xx+10,yy+17],[xx+8,yy+h]],o.colors?.[1]||'#c7c1ed')}break;
 case 'pickup':{const bob=Math.sin(time/600+x)*1.3;if(['hay','shell','seaweed','pearl'].includes(o.item)){drawExpansionPickup(c,o);}else if(o.item==='apple'){ellipse(c,x+8,y+7,5,5,'#d994ac');rect(c,x+7,y,2,4,'#74555c');rect(c,x+9,y+1,4,2,'#a9c597');rect(c,x+5,y+4,2,2,'#efc5cc');}else if(o.item==='wood'){rect(c,x,y+6,w,4,'#977b68');rect(c,x+3,y+2,3,6,'#b79577');}else if(o.item==='mushroom'){rect(c,x+6,y+5,4,8,'#edcedc');ellipse(c,x+8,y+4,7,4,'#b38cbf');rect(c,x+4,y+2,2,2,'#f4deec');}else flower(c,x+8,y+11,o.item==='moonflower'?'#d9c5f4':'#edb6ce',x);rect(c,x+3,y-3+bob,1,4,'#ffedb9');rect(c,x+2,y-2+bob,3,1,'#ffedb9');break;}case 'star':c.fillStyle='#ffe1a2';c.font='31px Georgia';c.fillText('✦',x,y+h);break;
 case 'mushroom':rect(c,x+w/2-4,y+9,8,h-6,'#e4c6e0');ellipse(c,x+w/2,y+6,w/2+4,Math.min(10,h*.42),o.color||'#b888c6');rect(c,x+5,y+3,4,3,'#f3dfeb');rect(c,x+w-9,y+1,4,3,'#f3dfeb');break;
 }}
 function roomGround(c,scene){if(scene==='sanctuary'){drawSanctuaryGround(c);return;}if(areaDefs[scene]){drawExpansionGround(c,scene);return}if(scene==='grove'){const r=interiors.grove;rect(c,0,0,r.w,r.h,'#352e49');rect(c,22,48,r.w-44,r.h-72,'#77988a');for(let i=0;i<190;i++)rect(c,30+random(i+42)*(r.w-60),55+random(i+82)*(r.h-90),2,2,i%2?'#99b398':'#688777');rect(c,219,176,42,150,'#c6aa94');ellipse(c,240,210,98,51,'#c6aa94');for(let i=0;i<40;i++)flower(c,42+random(i+111)*394,70+random(i+321)*230,['#d6b8e5','#efcbb1','#e8b8d3'][i%3]);rect(c,r.exit.x-17,r.h-27,34,12,'#e0bd9f');return}const r=interiors[scene],{w,h}=r;rect(c,0,0,w,h,'#271d36');const magic=['cave','dream'].includes(scene);rect(c,20,39,w-40,h-59,magic?(scene==='cave'?'#655571':'#8d77a0'):'#b68d79');for(let y=40;y<h-20;y+=16)for(let x=20;x<w-20;x+=48){rect(c,x,y,Math.min(47,w-20-x),Math.min(15,h-20-y),magic?(scene==='cave'?'#6b5b7a':'#9382a8'):['#b48a76','#bb927b','#b28a77'][Math.floor(random(x+y)*3)]);if(x+20<w-20&&y+11<h-20)rect(c,x+8,y+10,12,1,magic?'#aa95bf':'#c8a187')}
 rect(c,16,16,w-32,33,magic?'#4b3c62':'#7e5b68');rect(c,16,15,w-32,4,'#c09aa2');rect(c,16,49,w-32,4,'#5e435b');rect(c,16,16,6,h-29,'#614457');rect(c,w-22,16,6,h-29,'#614457');rect(c,16,h-24,w-32,8,'#6c4e61');rect(c,r.exit.x-17,h-26,34,10,'#d7b295');
 if(scene==='house'){windowArt(c,44,20,32,23);windowArt(c,w-76,20,32,23)}
 if(scene==='barn'){rect(c,148,54,88,198,'#c6a58b');for(let yy=62;yy<245;yy+=16)rect(c,154,yy,76,1,'#ddbea0');for(const xx of [36,245]){rect(c,xx,128,102,108,'#aa916e');for(let i=0;i<30;i++)rect(c,xx+7+random(i+31)*86,134+random(i+98)*92,6,1,'#d4b789');}windowArt(c,102,20,30,22);windowArt(c,w-142,20,30,22)}
 if(scene==='greenhouse'){for(let x=32;x<w-44;x+=32){rect(c,x,19,24,25,'#adcfcc');rect(c,x+8,20,2,23,'#d4b7c9')}rect(c,18,16,w-36,3,'#d9bccc')}
 if(scene==='dream'){for(let i=0;i<35;i++)flower(c,45+random(i+610)*350,80+random(i+713)*170,'#d7acd9',i)}
 }
 function invalidateGround(scene){delete cache[scene]}
 function getGround(scene){if(cache[scene])return cache[scene];const b=bounds(scene),off=document.createElement('canvas');off.width=b.w;off.height=b.h;const c=off.getContext('2d');c.imageSmoothingEnabled=false;if(scene==='world')ground(c);else roomGround(c,scene);cache[scene]=off;return off}
 function drawGround(c,scene,time){currentTime=time;c.drawImage(getGround(scene),0,0);if(scene==='world'){for(let i=0;i<32;i++){const x=910+random(i+53)*92,y=75+random(i+96)*910;if(terrainAt(x,y)!=='water')continue;rect(c,x+Math.sin(time/1400+i)*4,y,7,1,'#abd1d166')}for(let i=0;i<7;i++){const x=620+random(i+235)*220,y=920+random(i+365)*90;if(terrainAt(x,y)==='water'){ellipse(c,x,y,7,3,'#8ab295');rect(c,x+2,y-2,2,2,'#e4b6cd')}}}}
 function drawables(scene,time){return (scene==='world'?objects:interiors[scene].objects).filter(o=>!o.hidden).map(o=>({y:o.depth??o.y+o.h,draw:c=>{objectArt(c,o,time);if(o.damage){for(let i=0;i<o.damage+2;i++)rect(c,o.x+o.w/2+(i%2?2:0),o.y+3+i*3,2,4,'#51415f');}},object:o}))}
 const homeSpawn={x:160,y:157,dir:0},barnSpawn={x:192,y:230,dir:1};
 return {T,W,H,tiles,objects,interiors,bounds,canStand,lineClear,terrainAt,invalidateGround,drawGround,drawables,objectArt,homeSpawn,barnSpawn,rect,ellipse};
})();
