document.addEventListener("DOMContentLoaded", (event) => {
  gsap.registerPlugin(ScrollTrigger)

  //기준 시작 시간 - 버튼 클릭할때 설정됨
  let start_time = null;

  //로그 찍는 헬퍼 함수 (몇초 지났는지 알려줌)
  function log(msg) {
    // performance.now() 지금 시각(밀리초, ms 단위)을 가져옴
    // start_time  버튼 눌렀을 때 기록해둔 시각
    // (performance.now() - start_time)  "지금 - 시작" = 얼마나 시간이 흘렀는지 (ms)
    // / 1000  밀리초(ms)를 초(s) 단위로 바꿔주기
    // toFixed(3)  소수점 셋째자리까지 딱 잘라서 보기 좋게 (예: 0.123초)
    const elapsed = ((performance.now() - start_time) / 1000).toFixed(3);
    console.log(`${elapsed} => ${msg}`);
  }

  //1. add /call/ addPause 실험
  const tl1 = gsap.timeline({ paused: true }); //일단 멈춘 상태로 준비

  tl1.set('.bar', { //바 크기랑 색상 세팅
    width: 40,
    backgroundColor: '#ccc',
  })
    .add(() => log('[add] 1단계 시작')) //0초에 1단계 시작 찍기
    .to('.bar', { //0.6초동안 바 길게 늘리기
      width: 200,
      duration: 0.6,
    })
    .addPause() //0.6초 지점에서 멈춤
    .add(() => log('[add] 0.6초 이후 실행')) //0.6초 지점 멈춘 자리에서 실행된 함수
    .to('.bar', {
      backgroundColor: '#4f7',
      duration: 0.4,
    }).call(() => log('[call] 2단계 시작')) //끝나고 바로 실행되는 함수
    .addPause(); //또 멈춤

  document.getElementById('btn_next').addEventListener('click', () => {
    if (start_time === null) {
      start_time = performance.now();
    }
    tl1.play();//멈춘 곳에서 부터 이어서 진행
  });

  const tl2 = gsap.timeline({ paused: true }).to('.panel', {
    x: 200,
    duration: 2,
    ease: "sine.out",
  }).to('.panel', {
    rotate: 15,
    scale: 1.2,
    duration: 0.6
  }, '<0.1')
    .to('.panel', { backgroundColor: '#47f', color: '#111', duration: 0.5 });

  document.querySelector('.ctrls').addEventListener('click', (e) => {
    const act = e.target.dataset.act;
    console.log(act);
    if (!act) return;
    if (act === 'play') tl2.play(); //재생
    if (act === 'pause') tl2.pause(); //멈춤
    if (act === 'rev') tl2.reverse(); //역재생
    if (act === 'fast') tl2.timeScale(2).play(); //두배 빠르게 재생
    if (act === 'seek1') tl2.seek(1); //1초 지점으로 점프
    if (act === 'half') tl2.progress(0.5); //절반 지점으로 이동
  });

  //3.스크롤로 애니메이션 실행
  const tl3 = gsap.timeline({
    scrollTrigger: {
      trigger: '.repeat_area', //이요소가 들어오면 실행
      start: 'top center', //내가 잡은 요소(트리거)의 맨 위(top)이 브라우저 화면(viewport)의 70% 지점 닿을때 시작
      //end: 'center 90%',
      toggleActions: 'play none noe reverse',
    },
    repeat: 2, //2번 반복
    yoyo: true, //왕복
    repeatDelay: 0.3, //반복할때 잠깐 쉬었다가 0.3초후 다시 실행
    onStart() { console.log('요요시작') },
    onComplete() { console.log('요요 끝') },
  });
  tl3.to('.ball', { x: 300, duration: 0.8, }).to('.ball', { y: 120, duration: 0.5 });

  //4.카드 하나씩 튀어나오는 효과
  function popCard(target) {
    const t = gsap.timeline();
    return t.from(target, { y: 40, opacity: 0, scale: 0.8, duration: 0.4 }).to(target, {
      rotate: 5, yoyo: true, repeat: 1, duration: 0.2
    }, '>'); //살짝 까딱
  }

  const master = gsap.timeline({
    scrollTrigger: {
      trigger: '.row2',
      start: 'top 80%',
      toggleActions: 'play none none reverse',
    }
  });
  master.add(popCard('.c1'))
    .add(popCard('.c2'), '<0.15')
    .add(popCard('.c3'), '<0.15');

  //5. 기본 옵션(defaults) + 끝났을때 이벤트 (eventCallback)
  const tl4 = gsap.timeline({
    defaults: { duration: 0.45, ease: "expo.out", }, //기본설정
    scrollTrigger: {
      trigger: '.chips2',
      start: 'top 80%',
      markers: true,
      toggleActions: 'play none none reverse',
    }
  });
  tl4.from('.chips2 span', { y: 30, opacity: 0, stagger: 0.08 })
  .eventCallback('onComplete',()=>{console.log('칩애니 완료')}); //다끝나고 콘솔로그

  //6.메뉴 열고 닫기
  const openTl = gsap.timeline({paused:true})
  .to('.menu',{x:260, duration:0.5});
  openTl.reverse();
  document.getElementById('toggle2').addEventListener('click',()=>{
    openTl.reversed(!openTl.reversed());
  });
});//end