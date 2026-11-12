'use strict';

// 소개 화면은 실제 HTML로 유지합니다. ESC 또는 돌아가기 버튼으로 닫힙니다.
const hero = document.querySelector('.hero');
const about = document.querySelector('#about');
const meet = document.querySelector('#meet');
const motionButton = document.querySelector('#motion');
const ring = document.querySelector('.pointer-ring');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let motionEnabled = !reducedMotion.matches;
let clearWater = () => {};
let refreshScene = () => {};
// 버튼을 누르면 수면이 위로 올라오고 화면은 아래로 잠기는 전환입니다.
const diveCurtain=document.querySelector('.dive-transition');
let diveInProgress=false,diveSequence=0;
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function finishDive(){
  diveInProgress=false;
  document.body.classList.remove('is-diving');
  diveCurtain.classList.remove('is-active','is-fading');
  about.classList.remove('from-dive');
  hero.inert=false;hero.removeAttribute('aria-busy');meet.disabled=false;
}
meet.addEventListener('click',async()=>{
  if(diveInProgress||about.open)return;
  clearWater();ring.classList.remove('visible');
  if(reducedMotion.matches){about.showModal();return;}
  const sequence=++diveSequence;
  diveInProgress=true;meet.disabled=true;hero.inert=true;hero.setAttribute('aria-busy','true');
  document.body.classList.add('is-diving');diveCurtain.classList.add('is-active');
  await pause(850);
  if(sequence!==diveSequence)return;
  about.classList.add('from-dive');about.showModal();
  await pause(350);
  if(sequence!==diveSequence)return;
  diveCurtain.classList.add('is-fading');
  await pause(600);
  if(sequence===diveSequence)finishDive();
});
document.querySelector('#close').addEventListener('click',()=>about.close());
about.addEventListener('close',()=>{++diveSequence;finishDive();clearWater();meet.focus();});
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&diveInProgress&&!about.open){++diveSequence;finishDive();meet.focus();}
});
function updateMotionButton() {
  motionButton.setAttribute('aria-pressed', String(!motionEnabled));
  motionButton.setAttribute('aria-label', motionEnabled ? '물결 효과 끄기' : '물결 효과 켜기');
  motionButton.querySelector('span').textContent = motionEnabled ? 'Water on' : 'Water off';
  refreshScene();
}
motionButton.addEventListener('click', () => { motionEnabled = !motionEnabled; clearWater(); updateMotionButton(); });
reducedMotion.addEventListener('change', event => { motionEnabled = !event.matches; clearWater(); updateMotionButton(); });
updateMotionButton();

/*
 * 물의 높이를 작은 격자로 계산합니다.
 * 포인터로 누른 곳의 높이가 변하고, 그 변화가 이웃 칸으로 전달되어 파동이 됩니다.
 * 배경 + Hurricane 제목 + 로고 + 버튼을 한 장으로 합성해 모두 같은 파동으로 굴절합니다.
 * 원래 HTML은 투명한 상태로 남아 클릭, 키보드, 스크린리더 기능을 유지합니다.
 */
async function createWater() {
  const canvas = document.querySelector('#water');
  const scene = document.createElement('canvas');
  const sceneContext = scene.getContext('2d', { willReadFrequently: true });
  const gridW = 210;
  let gridH = 130;
  let current, previous, next, displacement;
  let width = 0, height = 0, cssWidth = 0, cssHeight = 0;
  let lastPoint = null, lastPointTime = 0, pointerDown = false;
  let cpuPixels = null, cpuFrame = null;
  let textureNeedsUpdate = true;
  let affected = null;
  let hover = false;
  let brandHover = false, titleHover = false, buttonFocus = false;
  let brandBlend = 0, titleBlend = 0, buttonBlend = 0;
  let animationTime = 0;
  // 이동하는 카메라와 서로 다른 깊이의 전경 레이어입니다.
  const camera={x:0,y:0,targetX:0,targetY:0};
  const revealOrigins={brand:{x:.5,y:.5},title:{x:.5,y:.5}};
  function setRevealOrigin(key,element,event){
    const r=element.getBoundingClientRect();
    revealOrigins[key]={x:Math.max(0,Math.min(1,(event.clientX-r.left)/r.width)),y:Math.max(0,Math.min(1,(event.clientY-r.top)/r.height))};
  }
  const brandText=document.querySelector('.brand span');
  const titleText=document.querySelector('h1');
  const buttonLabel=meet.querySelector('.button-label');
  const buttonArrow=meet.querySelector('.button-arrow');
  let dirty = false;
  let resizeTimer;
  const background = new Image();
  background.src = 'assets/spring-water.png';
  await background.decode();
  await document.fonts.load('120px Hurricane');
  await document.fonts.load('40px Barlow');
  await document.fonts.ready;
  const brandSvg = document.querySelector('.brand svg');
  const serialized = new XMLSerializer().serializeToString(brandSvg);
  const mark = new Image();
  mark.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(serialized.includes('xmlns=') ? serialized : serialized.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '));
  await mark.decode();
  async function svgImage(element) {
    const copy=element.cloneNode(true), style=getComputedStyle(element);
    copy.setAttribute('xmlns','http://www.w3.org/2000/svg');
    copy.setAttribute('style',`color:${style.color};fill:${style.fill};stroke:${style.stroke};stroke-width:${style.strokeWidth};stroke-linecap:${style.strokeLinecap}`);
    const image=new Image();
    image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(new XMLSerializer().serializeToString(copy).replaceAll('var(--icon-cutout)','#f8f8ed'));
    await image.decode(); return {element,image};
  }
  const icons=await Promise.all([...document.querySelectorAll('.socials svg,.motion-control svg')].map(svgImage));
  refreshScene=()=>{dirty=true;};

  let gl = null;
  try { gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power' }); } catch (_) {}
  let context, output, program, uniforms, imageTexture, fieldTexture;
  if (gl) {
    const vertexSource = `attribute vec2 a_position;varying vec2 v_uv;void main(){v_uv=a_position*.5+.5;gl_Position=vec4(a_position,0.,1.);}`;
    const fragmentSource = `
      precision mediump float;
      varying vec2 v_uv;
      uniform sampler2D u_scene;
      uniform sampler2D u_field;
      uniform vec2 u_resolution;
      uniform float u_enabled;
      void main(){
        vec2 uv=v_uv;
        vec2 slope=(texture2D(u_field,uv).rg*255.-128.)/4.;
        vec2 shift=slope*vec2(1.,-1.)/u_resolution*u_enabled;
        vec2 p=clamp(uv+shift,vec2(.0001),vec2(.9999));
        vec3 color=texture2D(u_scene,p).rgb;
        // 잔잔한 빛의 테두리만 더하고 강한 발광은 피합니다.
        color+=clamp(slope.x+slope.y,-4.,4.)*.0016*u_enabled;
        gl_FragColor=vec4(color,1.);
      }`;
    function compile(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source); gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
      return shader;
    }
    program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Water shader link failed');
    gl.useProgram(program);
    const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
    const attr = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(attr); gl.vertexAttribPointer(attr, 2, gl.FLOAT, false, 0, 0);
    uniforms = Object.fromEntries(['u_scene','u_field','u_resolution','u_enabled'].map(name => [name,gl.getUniformLocation(program,name)]));
    function texture(unit) {
      const result = gl.createTexture(); gl.activeTexture(gl.TEXTURE0+unit); gl.bindTexture(gl.TEXTURE_2D,result);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      return result;
    }
    imageTexture=texture(0); fieldTexture=texture(1);
    gl.uniform1i(uniforms.u_scene,0); gl.uniform1i(uniforms.u_field,1);
  } else {
    context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Canvas is unavailable');
  }

  function rect(element) {
    const r=element.getBoundingClientRect(), root=hero.getBoundingClientRect();
    const scaleX=root.width/hero.clientWidth,scaleY=root.height/hero.clientHeight;
    return {x:(r.left-root.left)/scaleX,y:(r.top-root.top)/scaleY,w:r.width/scaleX,h:r.height/scaleY};
  }
  function text(element, content, position, paint = {}) {
    const style=getComputedStyle(element), r=position||rect(element);
    sceneContext.font=`${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    sceneContext.fillStyle=paint.color||style.color;
    const raised=paint.raised!==false;
    const size=parseFloat(style.fontSize);
    sceneContext.shadowColor=raised?'rgba(30,48,28,.23)':'transparent';
    sceneContext.shadowBlur=raised?Math.min(18,size*.16):0;
    sceneContext.shadowOffsetX=raised?2-camera.x*3:0;
    sceneContext.shadowOffsetY=raised?Math.min(7,size*.05+1)-camera.y*2:0;
    sceneContext.textAlign='center'; sceneContext.textBaseline='middle';
    // HTML과 같은 글자 간격을 사용합니다(지원 브라우저).
    if ('letterSpacing' in sceneContext) sceneContext.letterSpacing=style.letterSpacing==='normal'?'0px':style.letterSpacing;
    const tx=r.x+r.w/2,ty=r.y+r.h/2+1;
    if(raised&&size>30){
      const front=sceneContext.fillStyle;
      sceneContext.fillStyle='rgba(46,64,35,.23)';
      for(let depth=3;depth>=1;depth--)sceneContext.fillText(content,tx+depth*.45,ty+depth*.65);
      sceneContext.fillStyle=front;
      sceneContext.shadowColor='transparent';sceneContext.shadowBlur=0;
    }
    sceneContext.fillText(content,tx,ty);
    if ('letterSpacing' in sceneContext) sceneContext.letterSpacing='0px';
    sceneContext.shadowColor='transparent';sceneContext.shadowBlur=0;sceneContext.shadowOffsetY=0;sceneContext.shadowOffsetX=0;
  }
  // 포인터가 닿은 위치에서 녹색 물결의 경계가 글자 안으로 번집니다.
  function waterText(element,content,progress,key,baseColor){
    text(element,content,null,{color:baseColor});
    if(progress<=0)return;
    const r=rect(element),origin=revealOrigins[key];
    const ox=r.x+origin.x*r.w,oy=r.y+origin.y*r.h;
    // 전체 단어를 덮지 않고 커서 주변 약 40~80px에만 색이 번집니다.
    const limit=key==='title'?Math.min(82,Math.max(50,r.w*.15)):Math.min(42,Math.max(28,r.w*.25));
    const radius=progress*limit;
    const clip=new Path2D();
    for(let i=0;i<=100;i++){
      const theta=i/100*Math.PI*2;
      const ripple=Math.sin(theta*6-animationTime*.005)*3+Math.sin(theta*11+animationTime*.003);
      const distance=Math.max(0,radius+ripple*Math.sin(progress*Math.PI));
      const x=ox+Math.cos(theta)*distance,y=oy+Math.sin(theta)*distance;
      if(i===0)clip.moveTo(x,y);else clip.lineTo(x,y);
    }
    clip.closePath();
    sceneContext.save();sceneContext.clip(clip);
    text(element,content,null,{color:'#E4F9CD'});
    sceneContext.restore();
  }
  function drawScene() {
    if (!width) return;
    const ratio=width/cssWidth;
    sceneContext.setTransform(1,0,0,1,0,0);
    sceneContext.clearRect(0,0,width,height);
    const scale=Math.max(width/background.width,height/background.height)*1.065;
    const cropW=width/scale,cropH=height/scale;
    const cropX=(background.width-cropW)*(cssWidth<=650?.43:.5),cropY=(background.height-cropH)/2;
    // 행마다 깊이를 보간하여 가까운 수면은 크게, 먼 벽은 작게 이동합니다.
    if(Math.abs(camera.x)+Math.abs(camera.y)<.002){
      sceneContext.drawImage(background,cropX,cropY,cropW,cropH,0,0,width,height);
    }else{
      const band=3;
      for(let y=0;y<height;y+=band){
        const t=Math.max(0,Math.min(1,(y/height-.48)/.52));
        const depth=t*t*(3-2*t);
        const dx=camera.x*(7+depth*21)*ratio;
        const dy=camera.y*(5+depth*12)*ratio;
        const h=Math.min(band,height-y);
        sceneContext.drawImage(background,cropX+dx/width*cropW,cropY+(y+dy)/height*cropH,cropW,h/height*cropH,0,y,width,h);
      }
    }
    sceneContext.setTransform(ratio,0,0,ratio,0,0);
    const logoRect=rect(brandSvg);
    sceneContext.save();sceneContext.shadowColor='rgba(32,50,27,.22)';
    sceneContext.shadowBlur=12;sceneContext.shadowOffsetX=2-camera.x*3;sceneContext.shadowOffsetY=5;
    sceneContext.drawImage(mark,logoRect.x,logoRect.y,logoRect.w,logoRect.h);sceneContext.restore();
    // 타이포그래피를 배경 위 전경처럼 그리되, 최종 물결 굴절은 함께 적용합니다.
    waterText(brandText,'STELLIVE',brandBlend,'brand','#172216');
    waterText(titleText,'Yuzuha Riko',titleBlend,'title','#080d08');
    const buttonRect=rect(meet);
    const buttonClip=new Path2D();
    buttonClip.roundRect(buttonRect.x,buttonRect.y,buttonRect.w,buttonRect.h,buttonRect.h/2);
    sceneContext.save();sceneContext.shadowColor='rgba(25,43,24,.18)';sceneContext.shadowBlur=16;sceneContext.shadowOffsetX=3-camera.x*3;sceneContext.shadowOffsetY=7;
    sceneContext.fillStyle='#ffffff';sceneContext.fill(buttonClip);sceneContext.restore();
    sceneContext.save();sceneContext.clip(buttonClip);
    sceneContext.fillStyle='#ffffff';sceneContext.fillRect(buttonRect.x,buttonRect.y,buttonRect.w,buttonRect.h);
    // 위에서 아래로 내려오는 물결의 경계. 마지막에는 완전한 검정 버튼이 됩니다.
    const liquid=new Path2D();
    const edge=buttonRect.y-buttonRect.h*.35+buttonBlend*buttonRect.h*1.7;
    const amplitude=6*Math.sin(Math.PI*buttonBlend);
    liquid.moveTo(buttonRect.x-2,buttonRect.y-25);
    liquid.lineTo(buttonRect.x+buttonRect.w+2,buttonRect.y-25);
    for(let x=buttonRect.w+2;x>=-2;x-=3){
      const phase=x/buttonRect.w*Math.PI*2.2+animationTime*.0024;
      liquid.lineTo(buttonRect.x+x,edge+Math.sin(phase)*amplitude);
    }
    liquid.closePath();
    sceneContext.fillStyle='#080808';sceneContext.fill(liquid);
    text(buttonLabel,'Discover Riko',null,{color:'#172216'});
    text(buttonArrow,'↘',null,{color:'#172216'});
    // 검은 물결이 내려온 부분의 글자만 흰색으로 바꿉니다.
    sceneContext.save();sceneContext.clip(liquid);
    text(buttonLabel,'Discover Riko',null,{color:'#ffffff'});
    text(buttonArrow,'↘',null,{color:'#ffffff'});
    sceneContext.restore();sceneContext.restore();
    if(meet.matches(':focus-visible')) {
      sceneContext.strokeStyle='#506841';sceneContext.lineWidth=2;
      sceneContext.beginPath();sceneContext.roundRect(buttonRect.x-5,buttonRect.y-5,buttonRect.w+10,buttonRect.h+10,buttonRect.h/2+5);sceneContext.stroke();
    }
    const controlRect=rect(motionButton);
    sceneContext.fillStyle='#ffffffb3';sceneContext.beginPath();
    sceneContext.roundRect(controlRect.x,controlRect.y,controlRect.w,controlRect.h,controlRect.h/2);sceneContext.fill();
    for(const icon of icons){
      const r=rect(icon.element);sceneContext.save();
      if(icon.element.closest('.socials')){
        // 아이콘을 밝은 배경에서 떼어주는 은은한 흰색 후광입니다.
        const glow=sceneContext.createRadialGradient(r.x+r.w/2,r.y+r.h/2,2,r.x+r.w/2,r.y+r.h/2,27);
        glow.addColorStop(0,'rgba(255,255,255,.58)');glow.addColorStop(1,'rgba(255,255,255,0)');
        sceneContext.fillStyle=glow;sceneContext.fillRect(r.x-14,r.y-14,r.w+28,r.h+28);
        sceneContext.shadowColor='rgba(255,255,255,.88)';sceneContext.shadowBlur=13;sceneContext.shadowOffsetY=2;
      }else{
        sceneContext.shadowColor='rgba(30,50,25,.2)';sceneContext.shadowBlur=7;sceneContext.shadowOffsetY=3;
      }
      sceneContext.drawImage(icon.image,r.x,r.y,r.w,r.h);sceneContext.restore();
    }
    text(motionButton.querySelector('span'),motionEnabled?'Water on':'Water off');
    const hint=document.querySelector('.water-hint');
    if(getComputedStyle(hint).display!=='none')text(hint,hint.textContent);
    const note=document.querySelector('.hero-footer small');text(note,note.textContent);
    sceneContext.setTransform(1,0,0,1,0,0);
    textureNeedsUpdate=true;
    if (context) {
      cpuPixels=sceneContext.getImageData(0,0,width,height).data;
      if(!cpuFrame||cpuFrame.width!==width||cpuFrame.height!==height)cpuFrame=context.createImageData(width,height);
    }
    dirty=false;
  }
  function resize() {
    cssWidth=hero.clientWidth; cssHeight=hero.clientHeight;
    // GPU: 고해상도, CPU 대체 경로: 화면 비율을 유지하며 적절한 해상도 사용
    const scale=gl?Math.min(devicePixelRatio||1,1.5):Math.min(devicePixelRatio||1,1.25,1600/cssWidth);
    width=canvas.width=scene.width=Math.round(cssWidth*scale);
    height=canvas.height=scene.height=Math.round(cssHeight*scale);
    gridH=Math.max(60,Math.round(gridW*cssHeight/cssWidth));
    current=new Float32Array(gridW*gridH); previous=new Float32Array(current.length); next=new Float32Array(current.length);
    displacement=new Uint8Array(gridW*gridH*4);
    if(gl){gl.viewport(0,0,width,height);gl.uniform2f(uniforms.u_resolution,width,height);}
    lastPoint=null;
    drawScene();
  }
  clearWater=() => { current?.fill(0); previous?.fill(0); next?.fill(0); lastPoint=null; };
  function disturb(nx,ny,force=1) {
    if (!motionEnabled||about.open) return;
    const cx=nx*(gridW-1),cy=ny*(gridH-1),radius=2.4;
    for(let y=Math.max(1,Math.floor(cy-radius));y<=Math.min(gridH-2,Math.ceil(cy+radius));y++) {
      for(let x=Math.max(1,Math.floor(cx-radius));x<=Math.min(gridW-2,Math.ceil(cx+radius));x++) {
        const d=Math.hypot(x-cx,y-cy)/radius;
        if(d<1) current[y*gridW+x]-=(1+Math.cos(d*Math.PI))*.42*force;
      }
    }
  }
  function touch(event, click=false) {
    if(about.open||!motionEnabled) return;
    const bounds=hero.getBoundingClientRect();
    const p={x:(event.clientX-bounds.left)/bounds.width,y:(event.clientY-bounds.top)/bounds.height};
    const now=performance.now();
    if(click){disturb(p.x,p.y,1.9);}
    else if(lastPoint&&now-lastPointTime<120){
      const dx=p.x-lastPoint.x,dy=p.y-lastPoint.y;
      const length=Math.hypot(dx*gridW,dy*gridH);
      const steps=Math.min(20,Math.max(1,Math.ceil(length/1.3)));
      const force=Math.min(1.1,.22+length*.025)*(pointerDown?1.35:1);
      for(let i=1;i<=steps;i++) disturb(lastPoint.x+dx*i/steps,lastPoint.y+dy*i/steps,force);
    }else{disturb(p.x,p.y,.55);}
    lastPoint=p;lastPointTime=now;
  }
  hero.addEventListener('pointermove',event=>{
    touch(event);
    if(event.pointerType==='mouse'&&!reducedMotion.matches&&!about.open){
      const bounds=hero.getBoundingClientRect();
      camera.targetX=Math.max(-1,Math.min(1,(event.clientX-bounds.left)/bounds.width*2-1));
      camera.targetY=Math.max(-1,Math.min(1,(event.clientY-bounds.top)/bounds.height*2-1));
    }
    if(event.pointerType==='mouse'&&!reducedMotion.matches){
      ring.style.transform=`translate(${event.clientX-7}px,${event.clientY-7}px)`;
      ring.classList.add('visible');
    }
  });
  hero.addEventListener('pointerdown',event=>{pointerDown=true;touch(event,true);});
  window.addEventListener('pointerup',()=>{pointerDown=false;});
  hero.addEventListener('pointerleave',()=>{lastPoint=null;camera.targetX=0;camera.targetY=0;hover=false;brandHover=false;titleHover=false;ring.classList.remove('visible');dirty=true;});
  meet.addEventListener('pointerenter',()=>{hover=true;dirty=true;});
  meet.addEventListener('pointerleave',()=>{hover=false;dirty=true;});
  meet.addEventListener('focus',()=>{buttonFocus=meet.matches(':focus-visible');dirty=true;});
  meet.addEventListener('blur',()=>{buttonFocus=false;dirty=true;});
  document.querySelector('.brand').addEventListener('pointerenter',event=>{brandHover=true;setRevealOrigin('brand',brandText,event);dirty=true;});
  document.querySelector('.brand').addEventListener('pointermove',event=>{setRevealOrigin('brand',brandText,event);dirty=true;});
  document.querySelector('.brand').addEventListener('pointerleave',()=>{brandHover=false;dirty=true;});
  titleText.addEventListener('pointerenter',event=>{titleHover=true;setRevealOrigin('title',titleText,event);dirty=true;});
  titleText.addEventListener('pointermove',event=>{setRevealOrigin('title',titleText,event);dirty=true;});
  titleText.addEventListener('pointerleave',()=>{titleHover=false;dirty=true;});
  window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(resize,100);});

  function simulate() {
    for(let y=1;y<gridH-1;y++){
      const row=y*gridW;
      for(let x=1;x<gridW-1;x++){
        const i=row+x;
        next[i]=((current[i-1]+current[i+1]+current[i-gridW]+current[i+gridW])*.5-previous[i])*.976;
      }
    }
    const spare=previous;previous=current;current=next;next=spare;
  }
  function buildField() {
    // R/G에는 표면의 X/Y 기울기, 즉 굴절 방향을 저장합니다.
    displacement.fill(128);
    let minX=gridW,minY=gridH,maxX=-1,maxY=-1;
    for(let y=1;y<gridH-1;y++){
      for(let x=1;x<gridW-1;x++){
        const i=y*gridW+x,j=i*4;
        displacement[j]=Math.max(0,Math.min(255,Math.round(128+(current[i-1]-current[i+1])*33)));
        displacement[j+1]=Math.max(0,Math.min(255,Math.round(128+(current[i-gridW]-current[i+gridW])*33)));
        displacement[j+2]=128;displacement[j+3]=255;
        if(displacement[j]!==128||displacement[j+1]!==128){minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);}
      }
    }
    affected=maxX<0?null:{x0:Math.max(0,Math.floor((minX-1)/gridW*width)),y0:Math.max(0,Math.floor((minY-1)/gridH*height)),x1:Math.min(width,Math.ceil((maxX+2)/gridW*width)),y1:Math.min(height,Math.ceil((maxY+2)/gridH*height))};
  }
  function renderCPU() {
    if(!motionEnabled||about.open){context.drawImage(scene,0,0);return;}
    context.drawImage(scene,0,0);
    if(!affected)return;
    const src=cpuPixels,dst=cpuFrame.data;
    const gxScale=(gridW-1)/width,gyScale=(gridH-1)/height;
    // 작은 물 높이 격자를 보간해서 한 픽셀씩 재배치합니다. 큰 네모 타일을 쓰지 않습니다.
    for(let y=affected.y0;y<affected.y1;y++){
      const gy=y*gyScale,y0=Math.floor(gy),fy=gy-y0;
      const row0=y0*gridW,row1=Math.min(gridH-1,y0+1)*gridW;
      for(let x=affected.x0;x<affected.x1;x++){
        const gx=x*gxScale,x0=Math.floor(gx),fx=gx-x0,x1=Math.min(gridW-1,x0+1);
        const a=(row0+x0)*4,b=(row0+x1)*4,c=(row1+x0)*4,d=(row1+x1)*4;
        const dx=((displacement[a]*(1-fx)+displacement[b]*fx)*(1-fy)+(displacement[c]*(1-fx)+displacement[d]*fx)*fy-128)/4;
        const dy=((displacement[a+1]*(1-fx)+displacement[b+1]*fx)*(1-fy)+(displacement[c+1]*(1-fx)+displacement[d+1]*fx)*fy-128)/4;
        const sx=Math.max(0,Math.min(width-1,x+dx)),sy=Math.max(0,Math.min(height-1,y+dy));
        const ix=Math.floor(sx),iy=Math.floor(sy),tx=sx-ix,ty=sy-iy;
        const ia=(iy*width+ix)*4,ib=(iy*width+Math.min(width-1,ix+1))*4;
        const ic=(Math.min(height-1,iy+1)*width+ix)*4,id=(Math.min(height-1,iy+1)*width+Math.min(width-1,ix+1))*4;
        const out=(y*width+x)*4;
        for(let k=0;k<3;k++) dst[out+k]=(src[ia+k]*(1-tx)+src[ib+k]*tx)*(1-ty)+(src[ic+k]*(1-tx)+src[id+k]*tx)*ty;
        dst[out+3]=255;
      }
    }
    context.putImageData(cpuFrame,0,0,affected.x0,affected.y0,affected.x1-affected.x0,affected.y1-affected.y0);
  }
  resize();
  hero.classList.add('ripple-ready');
  canvas.classList.add('ready');
  let lastFrame=0,lastSimulation=0;
  let energeticUntil=0;
  hero.addEventListener('pointermove',()=>{energeticUntil=performance.now()+3500;});
  hero.addEventListener('pointerdown',()=>{energeticUntil=performance.now()+3500;});
  function render(now){
    requestAnimationFrame(render);
    if(document.hidden||diveInProgress)return;
    if(now-lastFrame<(gl?16:40)) return;
    const dt=Math.min(64,now-lastFrame||16);
    lastFrame=now;animationTime=now;
    function approach(value,target,duration){
      if(reducedMotion.matches)return target;
      if(Math.abs(value-target)<.002)return target;
      return value+(target-value)*(1-Math.exp(-dt/duration));
    }
    const oldBrand=brandBlend,oldTitle=titleBlend,oldButton=buttonBlend;
    brandBlend=approach(brandBlend,brandHover?1:0,180);
    titleBlend=approach(titleBlend,titleHover?1:0,180);
    buttonBlend=approach(buttonBlend,(hover||buttonFocus)?1:0,130);
    if(oldBrand!==brandBlend||oldTitle!==titleBlend||oldButton!==buttonBlend||brandHover||titleHover)dirty=true;
    const oldCameraX=camera.x,oldCameraY=camera.y;
    const targetX=reducedMotion.matches||about.open?0:camera.targetX;
    const targetY=reducedMotion.matches||about.open?0:camera.targetY;
    camera.x=approach(camera.x,targetX,170);camera.y=approach(camera.y,targetY,170);
    if(oldCameraX!==camera.x||oldCameraY!==camera.y){
      hero.style.setProperty('--title-x',`${-camera.x*22}px`);
      hero.style.setProperty('--title-y',`${-camera.y*15}px`);
      hero.style.setProperty('--nav-x',`${-camera.x*12}px`);
      hero.style.setProperty('--nav-y',`${-camera.y*8}px`);
      hero.style.setProperty('--footer-x',`${-camera.x*17}px`);
      hero.style.setProperty('--footer-y',`${-camera.y*10}px`);
      hero.dataset.camera=`${camera.x.toFixed(3)},${camera.y.toFixed(3)}`;
      dirty=true;
    }
    if(dirty)drawScene();
    const active=motionEnabled&&!about.open;
    if(active){
      const steps=Math.min(3,Math.max(1,Math.round((now-lastSimulation)/16.67)));
      for(let i=0;i<steps;i++)simulate();
    }
    lastSimulation=now;
    buildField();
    if(gl){
      gl.useProgram(program);
      gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,imageTexture);
      if(textureNeedsUpdate){
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
        gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,scene);
        textureNeedsUpdate=false;
      }
      gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,fieldTexture);
      // Typed-array uploads are stored top to bottom; the shader reads them with flipped UV below.
      const flipped=new Uint8Array(displacement.length);
      for(let y=0;y<gridH;y++)flipped.set(displacement.subarray(y*gridW*4,(y+1)*gridW*4),(gridH-1-y)*gridW*4);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gridW,gridH,0,gl.RGBA,gl.UNSIGNED_BYTE,flipped);
      gl.uniform1f(uniforms.u_enabled,active?1:0);gl.drawArrays(gl.TRIANGLES,0,6);
    }else{
      // 정지 상태에는 원본만 표시해 CPU 사용량을 낮춥니다.
      if(now<energeticUntil&&active)renderCPU();else context.drawImage(scene,0,0);
    }
  }
  requestAnimationFrame(render);
  canvas.addEventListener('webglcontextlost',event=>{
    event.preventDefault();hero.classList.remove('ripple-ready');canvas.classList.remove('ready');
    motionButton.disabled=true;motionButton.querySelector('span').textContent='Still water';
  });
}
createWater().catch(error=>{
  console.warn('물결을 초기화하지 못했습니다.',error);
  hero.classList.remove('ripple-ready');
  document.querySelector('#water').classList.remove('ready');
  motionButton.disabled=true;motionButton.querySelector('span').textContent='Still water';
});
