const menuToggle=document.querySelector('.menu-toggle');
const nav=document.querySelector('.nav');
menuToggle?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuToggle.setAttribute('aria-expanded',String(open));});
nav?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{nav.classList.remove('open');menuToggle?.setAttribute('aria-expanded','false');}));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&nav?.classList.contains('open')){nav.classList.remove('open');menuToggle?.setAttribute('aria-expanded','false');menuToggle?.focus();}});

if(window.matchMedia('(hover: hover) and (pointer: fine)').matches){
  document.querySelectorAll('.faq-list details').forEach(item=>{
    item.addEventListener('mouseenter',()=>{item.open=true;});
    item.addEventListener('mouseleave',()=>{item.open=false;});
  });
}

document.querySelectorAll('.class-tab').forEach(tab=>tab.addEventListener('click',()=>{
  document.querySelectorAll('.class-tab').forEach(item=>item.classList.toggle('active',item===tab));
  document.querySelectorAll('.class-feature').forEach(panel=>panel.classList.toggle('hidden',panel.dataset.panel!==tab.dataset.tab));
}));

const scheduleData={
  '周一':[['09:30','器械小班','基础力量 · 适合初学者','林予安'],['14:00','一对一私教','根据个人状态安排','陈知夏'],['19:00','垫上练习','呼吸与身体觉察','周以宁']],
  '周二':[['10:00','垫上练习','舒展流动 · 轻柔入门','周以宁'],['16:00','器械小班','稳定与身体控制','林予安'],['19:30','一对一私教','预约制个别指导','陈知夏']],
  '周三':[['09:30','一对一私教','根据个人目标安排','陈知夏'],['13:30','器械小班','基础力量 · 小班练习','林予安'],['18:30','垫上练习','呼吸与核心稳定','周以宁']],
  '周四':[['10:30','器械小班','稳定与身体控制','林予安'],['15:00','垫上练习','舒展流动 · 轻柔入门','周以宁'],['19:00','一对一私教','预约制个别指导','陈知夏']],
  '周五':[['09:30','垫上练习','呼吸与身体觉察','周以宁'],['14:30','一对一私教','根据个人状态安排','陈知夏'],['18:30','器械小班','基础力量 · 适合初学者','林予安']],
  '周末':[['09:00','器械小班','周末舒展练习','林予安'],['11:00','垫上练习','呼吸与身体觉察','周以宁'],['15:00','一对一私教','预约制个别指导','陈知夏']]
};
const scheduleList=document.querySelector('#schedule-list');
function renderSchedule(day){scheduleList.innerHTML=scheduleData[day].map(row=>`<article class="class-row"><time>${row[0]}</time><div><h4>${row[1]}</h4><p>${row[2]}</p></div><span class="teacher-name">${row[3]} 教练</span><a class="row-book" href="tel:19258021413">电话咨询 <span class="row-book-icon"></span></a></article>`).join('');}
renderSchedule('周一');
document.querySelectorAll('.schedule-tab').forEach(tab=>tab.addEventListener('click',()=>{document.querySelectorAll('.schedule-tab').forEach(item=>item.classList.toggle('active',item===tab));renderSchedule(tab.dataset.day);}));

const courseViewport=document.querySelector('.course-viewport');
const courseTrack=document.querySelector('.course-track');
if(courseViewport&&courseTrack){
  const originalSlides=[...courseTrack.children];
  const courseCount=originalSlides.length;
  const lastClone=originalSlides[courseCount-1].cloneNode(true);
  const firstClone=originalSlides[0].cloneNode(true);
  lastClone.setAttribute('aria-hidden','true');firstClone.setAttribute('aria-hidden','true');
  courseTrack.prepend(lastClone);courseTrack.append(firstClone);
  let courseIndex=1;
  const prevButton=document.querySelector('#course-prev');
  const nextButton=document.querySelector('#course-next');
  const currentLabel=document.querySelector('#course-current');
  const progressFill=document.querySelector('#course-progress-fill');
  function moveToCourse(index,animate=true){
    courseIndex=index;
    courseTrack.style.transition=animate?'':'none';
    const slide=courseTrack.children[0];
    const stride=slide.getBoundingClientRect().width+(parseFloat(getComputedStyle(courseTrack).gap)||0);
    courseTrack.style.transform=`translate3d(${-courseIndex*stride}px,0,0)`;
    [...courseTrack.children].forEach((item,i)=>item.classList.toggle('is-active',i===courseIndex));
    const visible=((courseIndex-1+courseCount)%courseCount)+1;
    if(currentLabel)currentLabel.textContent=String(visible).padStart(2,'0');
    if(progressFill)progressFill.style.width=`${visible/courseCount*100}%`;
  }
  let autoplayTimer=null,resumeTimer=null,carouselVisible=false;
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function stopAutoplay(){clearInterval(autoplayTimer);clearTimeout(autoplayTimer);autoplayTimer=null;courseViewport.classList.remove('is-autoplaying');}
  function freezeCourse(){
    const computed=getComputedStyle(courseTrack).transform;
    if(computed==='none')return;
    const x=new DOMMatrixReadOnly(computed).m41;
    const stride=courseTrack.children[0].getBoundingClientRect().width+(parseFloat(getComputedStyle(courseTrack).gap)||0);
    let nearest=Math.round(-x/stride);
    if(nearest<=0)nearest=courseCount;
    if(nearest>=courseCount+1)nearest=1;
    courseTrack.style.transition='none';
    courseTrack.style.transform=`translate3d(${-nearest*stride}px,0,0)`;
    courseIndex=nearest;
    [...courseTrack.children].forEach((item,i)=>item.classList.toggle('is-active',i===courseIndex));
    const visible=courseIndex;
    if(currentLabel)currentLabel.textContent=String(visible).padStart(2,'0');
    if(progressFill)progressFill.style.width=`${visible/courseCount*100}%`;
  }
  function startAutoplay(){
    clearTimeout(resumeTimer);resumeTimer=null;stopAutoplay();
    if(reducedMotion||!carouselVisible||document.hidden)return;
    courseViewport.classList.add('is-autoplaying');
    autoplayTimer=setTimeout(()=>{
      moveToCourse(courseIndex+1);
      autoplayTimer=setInterval(()=>moveToCourse(courseIndex+1),6600);
    },700);
  }
  function pauseAutoplay(resumeAfter=4500){
    stopAutoplay();freezeCourse();clearTimeout(resumeTimer);resumeTimer=null;
    if(resumeAfter>0)resumeTimer=setTimeout(startAutoplay,resumeAfter);
  }
  function nextCourse(){pauseAutoplay();moveToCourse(courseIndex+1)}
  function previousCourse(){pauseAutoplay();moveToCourse(courseIndex-1)}
  nextButton?.addEventListener('click',nextCourse);prevButton?.addEventListener('click',previousCourse);
  courseTrack.addEventListener('transitionend',event=>{
    if(event.target!==courseTrack)return;
    if(courseIndex===0)moveToCourse(courseCount,false);
    else if(courseIndex===courseCount+1)moveToCourse(1,false);
  });
  requestAnimationFrame(()=>moveToCourse(1,false));
  if('IntersectionObserver'in window){
    const carouselObserver=new IntersectionObserver(entries=>{
      carouselVisible=entries.some(entry=>entry.isIntersecting);
      if(carouselVisible)startAutoplay();else{stopAutoplay();clearTimeout(resumeTimer);}
    },{threshold:.18});
    carouselObserver.observe(courseViewport);
  }else{carouselVisible=true;startAutoplay();}
  courseViewport.addEventListener('pointerenter',()=>{stopAutoplay();freezeCourse();clearTimeout(resumeTimer);});
  courseViewport.addEventListener('pointerleave',()=>pauseAutoplay(1200));
  courseViewport.addEventListener('focusin',()=>{stopAutoplay();freezeCourse();clearTimeout(resumeTimer);});
  courseViewport.addEventListener('focusout',()=>pauseAutoplay(1200));
  document.addEventListener('visibilitychange',()=>document.hidden?stopAutoplay():startAutoplay());
  window.addEventListener('resize',()=>moveToCourse(courseIndex,false));
  courseViewport.addEventListener('keydown',event=>{if(event.key==='ArrowRight'){event.preventDefault();nextCourse()}if(event.key==='ArrowLeft'){event.preventDefault();previousCourse()}});
  let startX=0,startY=0,lastX=0,dragging=false;
  courseViewport.addEventListener('pointerdown',event=>{
    if(event.target.closest('a,button'))return;
    stopAutoplay();clearTimeout(resumeTimer);dragging=true;startX=lastX=event.clientX;startY=event.clientY;courseViewport.classList.add('is-dragging');courseViewport.setPointerCapture(event.pointerId);
  });
  courseViewport.addEventListener('pointermove',event=>{
    if(!dragging)return;
    const dx=event.clientX-startX,dy=event.clientY-startY;
    if(Math.abs(dx)>Math.abs(dy)){event.preventDefault();const stride=courseTrack.children[0].getBoundingClientRect().width+(parseFloat(getComputedStyle(courseTrack).gap)||0);courseTrack.style.transition='none';courseTrack.style.transform=`translate3d(${-courseIndex*stride+dx}px,0,0)`;lastX=event.clientX;}
  });
  function endDrag(){
    if(!dragging)return;dragging=false;courseViewport.classList.remove('is-dragging');
    const dx=lastX-startX;stopAutoplay();clearTimeout(resumeTimer);
    if(Math.abs(dx)>55)moveToCourse(courseIndex+(dx<0?1:-1));else moveToCourse(courseIndex);
    resumeTimer=setTimeout(startAutoplay,4500);
  }
  courseViewport.addEventListener('pointerup',endDrag);courseViewport.addEventListener('pointercancel',endDrag);
}

const reviewColumns=[...document.querySelectorAll('.review-column')];
const mobileReviewCards=reviewColumns.flatMap(column=>[...column.children].filter(card=>!card.classList.contains('review-author-card')));
const reviewColumnsContainer=reviewColumns[0]?.parentElement;
let mobileReviewViewport=null;
let mobileReviewTrack=null;
if(reviewColumnsContainer&&mobileReviewCards.length){
  mobileReviewViewport=document.createElement('div');
  mobileReviewViewport.className='review-mobile-viewport';
  mobileReviewViewport.setAttribute('role','region');
  mobileReviewViewport.setAttribute('aria-label','会员评价，可左右滑动');
  mobileReviewViewport.tabIndex=0;
  mobileReviewTrack=document.createElement('div');
  mobileReviewTrack.className='review-mobile-track';
  mobileReviewCards.forEach(card=>{
    const copy=card.cloneNode(true);
    copy.classList.add('review-mobile-card');
    mobileReviewTrack.append(copy);
  });
  mobileReviewCards.forEach(card=>{
    const copy=card.cloneNode(true);
    copy.classList.add('review-mobile-card');
    copy.setAttribute('aria-hidden','true');
    mobileReviewTrack.append(copy);
  });
  mobileReviewViewport.append(mobileReviewTrack);
  reviewColumnsContainer.append(mobileReviewViewport);
  const mobileReviewHint=document.createElement('p');
  mobileReviewHint.className='review-mobile-hint';
  mobileReviewHint.textContent='左右滑动查看更多 · 自动缓慢切换';
  reviewColumnsContainer.append(mobileReviewHint);
}
reviewColumns.forEach((column,index)=>{
  const items=[...column.children];
  const track=document.createElement('div');track.className='review-marquee';
  const firstSet=document.createElement('div');firstSet.className='review-set';
  items.forEach(item=>firstSet.append(item));
  const secondSet=firstSet.cloneNode(true);secondSet.setAttribute('aria-hidden','true');
  track.append(firstSet,secondSet);column.replaceChildren(track);
  const gap=parseFloat(getComputedStyle(firstSet).rowGap)||28;
  track.style.setProperty('--loop-distance',`${firstSet.getBoundingClientRect().height+gap}px`);
  track.style.setProperty('--marquee-duration',`${Math.max(34,Math.round((firstSet.getBoundingClientRect().height+gap)/11))}s`);
  column.classList.add(index%2===0?'moves-up':'moves-down');
  column.addEventListener('pointerenter',()=>column.classList.add('motion-paused'));
  column.addEventListener('pointerleave',()=>column.classList.remove('motion-paused'));
  column.addEventListener('focusin',()=>column.classList.add('motion-paused'));
  column.addEventListener('focusout',()=>column.classList.remove('motion-paused'));
  let touchResume;column.addEventListener('touchstart',()=>column.classList.add('motion-paused'),{passive:true});
  column.addEventListener('touchend',()=>{clearTimeout(touchResume);touchResume=setTimeout(()=>column.classList.remove('motion-paused'),2800);},{passive:true});
});

if(mobileReviewViewport&&mobileReviewTrack){
  const mobileReviewCount=mobileReviewCards.length;
  const mobileReviewMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobileReviewBreakpoint=window.matchMedia('(max-width:760px)');
  let mobileReviewsVisible=false;
  let mobileReviewsInteracting=false;
  let mobileReviewIndex=0;
  let mobileReviewTimer=null;
  let mobileReviewSettleTimer=null;
  let mobileReviewResumeTimer=null;
  function mobileReviewStride(){
    const card=mobileReviewTrack.querySelector('.review-mobile-card');
    return card?card.getBoundingClientRect().width+(parseFloat(getComputedStyle(mobileReviewTrack).gap)||0):0;
  }
  function setMobileReviewScroll(left){
    const scrollBehavior=mobileReviewViewport.style.scrollBehavior;
    mobileReviewViewport.style.scrollBehavior='auto';
    mobileReviewViewport.scrollLeft=left;
    mobileReviewViewport.style.scrollBehavior=scrollBehavior;
  }
  function stopMobileReviews(){clearTimeout(mobileReviewTimer);mobileReviewTimer=null;}
  function startMobileReviews(delay=4600){
    stopMobileReviews();
    if(mobileReviewMotion.matches||!mobileReviewBreakpoint.matches||!mobileReviewsVisible||mobileReviewsInteracting||document.hidden)return;
    mobileReviewTimer=setTimeout(()=>{
      const stride=mobileReviewStride();
      if(!stride)return;
      const current=Math.round(mobileReviewViewport.scrollLeft/stride)%mobileReviewCount;
      mobileReviewViewport.scrollTo({left:(current+1)*stride,behavior:'smooth'});
      startMobileReviews(4800);
    },delay);
  }
  function pauseMobileReviews(){
    mobileReviewsInteracting=true;
    stopMobileReviews();
    clearTimeout(mobileReviewResumeTimer);
  }
  function resumeMobileReviews(){
    clearTimeout(mobileReviewResumeTimer);
    mobileReviewResumeTimer=setTimeout(()=>{
      mobileReviewsInteracting=false;
      startMobileReviews(1200);
    },2600);
  }
  mobileReviewViewport.addEventListener('scroll',()=>{
    clearTimeout(mobileReviewSettleTimer);
    mobileReviewSettleTimer=setTimeout(()=>{
      const stride=mobileReviewStride();
      if(!stride)return;
      const index=Math.round(mobileReviewViewport.scrollLeft/stride);
      if(index>=mobileReviewCount){
        mobileReviewIndex=index%mobileReviewCount;
        setMobileReviewScroll(mobileReviewIndex*stride);
      }else mobileReviewIndex=index;
      if(!mobileReviewsInteracting)startMobileReviews(4800);
    },140);
  },{passive:true});
  mobileReviewViewport.addEventListener('pointerdown',pauseMobileReviews);
  mobileReviewViewport.addEventListener('pointerup',resumeMobileReviews);
  mobileReviewViewport.addEventListener('pointercancel',resumeMobileReviews);
  mobileReviewViewport.addEventListener('focusin',pauseMobileReviews);
  mobileReviewViewport.addEventListener('focusout',resumeMobileReviews);
  window.addEventListener('resize',()=>{
    requestAnimationFrame(()=>setMobileReviewScroll(mobileReviewIndex*mobileReviewStride()));
    startMobileReviews();
  });
  document.addEventListener('visibilitychange',()=>document.hidden?stopMobileReviews():startMobileReviews());
  if('IntersectionObserver'in window){
    const mobileReviewObserver=new IntersectionObserver(entries=>{
      mobileReviewsVisible=entries.some(entry=>entry.isIntersecting);
      if(mobileReviewsVisible)startMobileReviews();else stopMobileReviews();
    },{threshold:.15});
    mobileReviewObserver.observe(mobileReviewViewport);
  }else{
    mobileReviewsVisible=true;
    startMobileReviews();
  }
}

const studioGalleryTrack=document.querySelector('.studio-gallery-track');
const studioGallerySequence=studioGalleryTrack?.querySelector('.studio-gallery-sequence');
if(studioGalleryTrack&&studioGallerySequence){
  const duplicate=studioGallerySequence.cloneNode(true);
  duplicate.setAttribute('aria-hidden','true');
  duplicate.querySelectorAll('img').forEach(image=>{image.alt='';});
  studioGalleryTrack.append(duplicate);

  const galleryViewport=studioGalleryTrack.closest('.studio-gallery-viewport');
  let activePointer=null;
  let dragStartX=0;
  let dragStartOffset=0;
  let activeAnimation=null;
  let animationDuration=0;
  const wrapOffset=(offset,width)=>-(((-offset%width)+width)%width);
  const readTrackOffset=()=>new DOMMatrixReadOnly(getComputedStyle(studioGalleryTrack).transform).m41;

  galleryViewport.addEventListener('pointerdown',event=>{
    if(!event.isPrimary||(event.pointerType==='mouse'&&event.button!==0))return;
    activePointer=event.pointerId;
    dragStartX=event.clientX;
    activeAnimation=studioGalleryTrack.getAnimations().find(animation=>animation.animationName==='studio-gallery-glide')||null;
    if(activeAnimation){
      activeAnimation.pause();
      animationDuration=activeAnimation.effect.getComputedTiming().duration;
      dragStartOffset=readTrackOffset();
    }else{
      dragStartOffset=galleryViewport.scrollLeft;
    }
    galleryViewport.classList.add('is-dragging');
    galleryViewport.setPointerCapture(event.pointerId);
  });
  galleryViewport.addEventListener('pointermove',event=>{
    if(event.pointerId!==activePointer)return;
    const distance=event.clientX-dragStartX;
    if(Math.abs(distance)<2)return;
    if(activeAnimation){
      const width=studioGallerySequence.getBoundingClientRect().width;
      const offset=wrapOffset(dragStartOffset+distance,width);
      activeAnimation.currentTime=(-offset/width)*animationDuration;
    }else{
      galleryViewport.scrollLeft=dragStartOffset-distance;
    }
  });
  const finishGalleryDrag=event=>{
    if(event.pointerId!==activePointer)return;
    activePointer=null;
    galleryViewport.classList.remove('is-dragging');
    if(galleryViewport.hasPointerCapture(event.pointerId))galleryViewport.releasePointerCapture(event.pointerId);
    activeAnimation?.play();
    activeAnimation=null;
  };
  galleryViewport.addEventListener('pointerup',finishGalleryDrag);
  galleryViewport.addEventListener('pointercancel',finishGalleryDrag);
}

if('IntersectionObserver'in window){
  const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target);}}),{threshold:.1});
  document.querySelectorAll('.hero-image,.intro-image,.course-image,.teacher-card,.studio-gallery-viewport,.brand-story-visual,.faq-list details').forEach((item,index)=>{item.classList.add('flow-reveal');item.style.transitionDelay=`${(index%3)*110}ms`;revealObserver.observe(item);});
  const motionObserver=new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle('image-moving',entry.isIntersecting)),{rootMargin:'80px 0px'});
  document.querySelectorAll('.hero-image,.intro-image,.class-photo,.course-image,.teacher-photo,.contact-image,.review-image').forEach(image=>motionObserver.observe(image));
  const marqueeObserver=new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle('marquee-active',entry.isIntersecting)),{threshold:.04});
  document.querySelectorAll('.review-column').forEach(column=>marqueeObserver.observe(column));
}

const mapDialog=document.querySelector('#map-dialog');
if(mapDialog){
  const mapOptions=[...mapDialog.querySelectorAll('[data-map-app]')];
  const destination='星沙深业睿城写字楼 G03 栋 18 楼（电梯 17A）';
  const encodedDestination=encodeURIComponent(destination);
  const appleMapsUrl=`https://maps.apple.com/?daddr=${encodedDestination}&dirflg=d`;
  const isIOS=/iPhone|iPad|iPod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  const isAndroid=/Android/i.test(navigator.userAgent);
  const mapUrls={
    system:isIOS?appleMapsUrl:`geo:0,0?q=${encodedDestination}`,
    amap:`https://uri.amap.com/search?keyword=${encodedDestination}&callnative=1&src=${encodeURIComponent('元悠女子运动塑形')}`,
    baidu:`https://map.baidu.com/search/${encodedDestination}`,
    apple:appleMapsUrl
  };
  const mapOrder=isIOS?['apple','amap','baidu']:isAndroid?['system','amap','baidu']:['amap','baidu','apple'];
  mapOptions.forEach(option=>{
    const app=option.dataset.mapApp;
    option.href=mapUrls[app];
    option.hidden=(app==='system'&&!isAndroid)||(app==='apple'&&isAndroid);
  });
  mapOrder.forEach(app=>{
    const option=mapOptions.find(item=>item.dataset.mapApp===app);
    if(option)mapDialog.querySelector('.map-options').append(option);
  });
  document.querySelectorAll('[data-open-map]').forEach(button=>button.addEventListener('click',()=>mapDialog.showModal()));
  mapDialog.querySelector('[data-close-map]')?.addEventListener('click',()=>mapDialog.close());
  mapDialog.addEventListener('click',event=>{if(event.target===mapDialog)mapDialog.close();});
  mapOptions.forEach(option=>option.addEventListener('click',()=>mapDialog.close()));
}

const iconShapes={
  calendar:['M8 3v3','M16 3v3','M4 8h16v13H4z','M4 11h16'],
  classes:['M4 4h6v6H4z','M14 4h6v6h-6z','M4 14h6v6H4z','M14 14h6v6h-6z'],
  person:['M20 21a8 8 0 0 0-16 0','M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8'],
  building:['M4 21V5l8-3 8 3v16','M2 21h20','M9 8h.01','M15 8h.01','M9 12h.01','M15 12h.01','M10 21v-5h4v5'],
  chat:['M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 20l1.2-4.2A8.4 8.4 0 1 1 21 11.5z'],
  phone:['M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 2.7a2 2 0 0 1-.6 1.8L7.7 9.5a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 1.8-.6l2.7.5a2 2 0 0 1 1.7 1.8z'],
  map:['M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0z','M12 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z'],
  home:['M3 10.5 12 3l9 7.5','M5 9v12h14V9','M9 21v-7h6v7']
};
function createActionIcon(name){
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox','0 0 24 24');
  svg.setAttribute('aria-hidden','true');
  svg.setAttribute('focusable','false');
  svg.classList.add('action-icon');
  iconShapes[name].forEach(shape=>{
    const path=document.createElementNS('http://www.w3.org/2000/svg','path');
    path.setAttribute('d',shape);
    svg.append(path);
  });
  return svg;
}
function setActionIcon(element,name){element.replaceChildren(createActionIcon(name));}
document.querySelectorAll('.announcement a i,.header-cta span').forEach(element=>setActionIcon(element,'calendar'));
document.querySelectorAll('.hero-actions .button.dark span').forEach(element=>setActionIcon(element,'classes'));
document.querySelectorAll('.hero-actions .text-link span').forEach(element=>setActionIcon(element,'person'));
document.querySelectorAll('.under-link span').forEach(element=>{
  const label=element.closest('a').textContent;
  const name=label.includes('教练')?'chat':label.includes('联系我们')?'phone':'building';
  setActionIcon(element,name);
});
document.querySelectorAll('.course-caption a b').forEach(element=>setActionIcon(element,'calendar'));
document.querySelectorAll('.teacher-meta span:last-child').forEach(element=>element.remove());
document.querySelectorAll('.row-book-icon').forEach(element=>setActionIcon(element,'phone'));
document.querySelectorAll('.contact-map-button span,.map-option i').forEach(element=>setActionIcon(element,'map'));
document.querySelectorAll('.back-top span').forEach(element=>setActionIcon(element,'home'));

