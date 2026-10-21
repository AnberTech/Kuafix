(function(){
  var D=document, W=window;
  var reduce=W.matchMedia&&W.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine=W.matchMedia&&W.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---- intro: the app's loader, then an iris opening onto the salon ---- */
  var intro=null;
  if(D.querySelector('.hero')&&!reduce){
    intro=D.createElement('div'); intro.className='intro'; intro.setAttribute('aria-hidden','true');
    var h='<div class="loader">'; for(var n=1;n<=8;n++) h+='<span class="ti t'+n+'" style="--k:'+(n-1)+'"></span>'; intro.innerHTML=h+'</div>';
    D.body.appendChild(intro);
  }
  if(intro){
    {
      var done=false;
      function open(){
        if(done) return; done=true; intro.classList.add('out');
        setTimeout(function(){ if(intro.parentNode) intro.remove(); },800);
      }
      intro.addEventListener('click',open);
      setTimeout(open,1600);
    }
  }

  /* ---- dil menüsü: dışarı tıklayınca veya Esc ile kapanır ---- */
  var lm=D.querySelector('.lang-menu');
  if(lm){D.addEventListener('click',function(e){if(lm.open&&!lm.contains(e.target))lm.open=false});
    D.addEventListener('keydown',function(e){if(e.key==='Escape'&&lm.open){lm.open=false;lm.querySelector('summary').focus()}})}

  /* ---- progress bar ---- */
  var bar=D.querySelector('.progress'), ticking=false, scrollFns=[];
  function prog(){var h=D.documentElement.scrollHeight-innerHeight,y=W.scrollY||0;if(bar)bar.style.transform='scaleX('+(h>0?Math.min(1,y/h):0)+')';}
  scrollFns.push(prog);
  W.addEventListener('scroll',function(){ if(ticking) return; ticking=true; requestAnimationFrame(function(){ticking=false; scrollFns.forEach(function(f){f()});}); },{passive:true});
  prog();

  /* ---- neon spotlight: follows the cursor, wanders on touch screens ---- */
  var hero=D.querySelector('.hero'), lit=D.querySelector('.neon.lit');
  if(hero&&lit){
    var sx=.5, sy=.42;
    function setSpot(x,y){lit.style.setProperty('--x',(x*100)+'%');lit.style.setProperty('--y',(y*100)+'%');}
    if(fine){ var pend=null; hero.addEventListener('pointermove',function(e){var r=hero.getBoundingClientRect(); var x=(e.clientX-r.left)/r.width, y=(e.clientY-r.top)/r.height;
      if(pend) return; pend=requestAnimationFrame(function(){pend=null;setSpot(x,y);}); }); }
    setSpot(sx,sy);
  }

  /* ---- neon sign: letters switch on one by one ---- */
  var ls=[].slice.call(D.querySelectorAll('.sign .l'));
  var base=intro&&!reduce?2.1:.3;
  ls.forEach(function(l,i){l.style.animationDelay=(base+i*.055)+'s'; if(i===9) l.classList.add('buzz');});

  /* ---- scissors cutting along the line as you scroll ---- */
  var cut=D.querySelector('.cut'), lastP=-1, stopT;
  function cutting(){
    if(!cut) return; var r=cut.getBoundingClientRect(), vh=innerHeight;
    if(r.bottom<-50||r.top>vh+50) return;
    var p=Math.max(0,Math.min(1,(vh-r.top)/(vh+r.height)));
    cut.style.setProperty('--k',p); cut.style.setProperty('--px',(p*r.width)+'px');
    if(Math.abs(p-lastP)>.0005){cut.classList.add('moving');clearTimeout(stopT);stopT=setTimeout(function(){cut.classList.remove('moving')},140);}
    lastP=p;
  }
  scrollFns.push(cutting); cutting();

  /* ---- 3D ring ---- */
  var scene=D.getElementById('scene');
  if(scene){
    var ring=scene.querySelector('.ring'), cards=[].slice.call(ring.children), N=cards.length;
    var angle=0, vel=0, dragging=false, lastX=0, moved=0, target=null, hovering=false, radius=0;
    function layout(){
      var w=scene.clientWidth, cw=Math.max(128,Math.min(214,w*(w<640?.42:.17)));
      radius=(cw/2)/Math.tan(Math.PI/N)*1.1;
      scene.style.setProperty('--ring-h',(cw*2.17+96)+'px');
      ring.style.transform='translateZ('+(-radius)+'px)';
      cards.forEach(function(c,i){c.style.width=cw+'px';c.style.marginLeft=(-cw/2)+'px';c.style.top='22px';c.dataset.a=i*360/N;});
      place();
    }
    function place(){
      cards.forEach(function(c){
        var a=+c.dataset.a+angle, d=Math.cos(a*Math.PI/180), k=(d+1)/2;
        c.style.transform='rotateY('+a+'deg) translateZ('+radius+'px)';
        c.style.opacity=(.35+.65*k).toFixed(3);
        c.style.setProperty('--dim',((1-k)*.5).toFixed(3));
        c.style.zIndex=100+Math.round(d*100);
        c.classList.toggle('front',d>.92);
      });
    }
    var visible=true, lastAngle=null;
    if('IntersectionObserver' in W){ new IntersectionObserver(function(es){ visible=es[0].isIntersecting; },{rootMargin:'100px'}).observe(scene); }
    function frame(){
      requestAnimationFrame(frame);
      if(!visible||D.hidden) return;
      if(!dragging){
        if(target!==null){angle+=(target-angle)*.09;if(Math.abs(target-angle)<.05){angle=target;target=null;}}
        else if(Math.abs(vel)>.02){angle+=vel;vel*=.94;}
        else if(!hovering&&!reduce){angle+=.08;}
      }
      if(angle!==lastAngle){ place(); lastAngle=angle; }
    }
    scene.addEventListener('pointerdown',function(e){dragging=true;lastX=e.clientX;moved=0;target=null;scene.classList.add('drag');try{scene.setPointerCapture(e.pointerId)}catch(_){}});
    scene.addEventListener('pointermove',function(e){if(!dragging)return;var dx=e.clientX-lastX;lastX=e.clientX;moved+=Math.abs(dx);angle+=dx*.32;vel=dx*.32;});
    ['pointerup','pointercancel'].forEach(function(ev){scene.addEventListener(ev,function(){dragging=false;scene.classList.remove('drag')})});
    scene.addEventListener('mouseenter',function(){hovering=true});
    scene.addEventListener('mouseleave',function(){hovering=false;dragging=false;scene.classList.remove('drag')});
    cards.forEach(function(c){c.addEventListener('click',function(){
      if(moved>6)return; var t=-(+c.dataset.a),cur=angle; while(t-cur>180)t-=360; while(cur-t>180)t+=360; target=t; vel=0;
    })});
    W.addEventListener('resize',layout);
    var imgs=ring.querySelectorAll('img'),left=imgs.length;
    [].forEach.call(imgs,function(im){if(im.complete){if(!--left)layout()}else im.addEventListener('load',function(){if(!--left)layout()})});
    layout(); requestAnimationFrame(frame);
  }

  /* ---- appointment slots: fill width ---- */
  D.querySelectorAll('.track').forEach(function(t){var b=t.innerHTML,g=0;while(t.scrollWidth<innerWidth*2.2&&g++<8)t.innerHTML+=b;t.innerHTML+=t.innerHTML;});

  /* ---- salon board ---- */
  function countUp(root){
    if(reduce) return;
    var els=[].slice.call(root.querySelectorAll('[data-n]')), t0=performance.now();
    (function tick(t){var k=Math.min(1,(t-t0)/1300),e=1-Math.pow(1-k,3);
      els.forEach(function(el){el.textContent=(el.dataset.p||'')+Math.round(+el.dataset.n*e).toLocaleString(D.documentElement.lang||'tr');});
      if(k<1)requestAnimationFrame(tick);})(t0);
  }
  if('IntersectionObserver' in W){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;io.unobserve(e.target);e.target.classList.add('go');countUp(e.target);})},{threshold:.3});
    D.querySelectorAll('.heat,.fin').forEach(function(el){io.observe(el)});
  }
})();

