document.addEventListener("DOMContentLoaded", (event) => {
  //플러그인 등록(ScrollTrigger 사용하려면 무조건 등록)
  gsap.registerPlugin(ScrollTrigger)

  //1. 기본 to /from / fromTo
  //1) to : 지금상태 -> 목표상태
  gsap.to('.box_to', {
    x: 200, //x축으로 200px 이동
    duration: 2, //2초동안 실행
    ease: "power2.out",
  });

  //2) from : 어디서 등장할래? (처음에 x:-200에 있다가 원래 자리로)
  gsap.from('.box_from', {
    x: -200,
    opacity: 0.2,
    duration: 1.5,
  })

  //3)fromTo : 출발 도착 둘다 내가 정함
  gsap.fromTo('.box_from_to', {
    scale: 0,
  }, {
    scale: 1.2,
    rotate: 360,
    duration: 1.5,
  })

  //2. 옵션 6총사 : 버튼 클릭 이벤트
  document.getElementById('btn_run').addEventListener('click', () => {
    gsap.to('.dot', {
      x: 400,
      duration: 2,
      delay: 0.2,  //0.2초 쉬고 출발
      repeat: 1, //1번 반복 (총 2번 실행) , 무한반복(-1), 반복없음(0) : 기본값
      yoyo: true,//animation-direction:alternate 처럼 되돌아오기
      ease: "bounce.out",//속도 곡선
    });
  });

  /* 3. stagger + ScrollTrigger */
  //같은 셀렉터로 여러 요소가 선택될때 (NodeList, HTMLCollection,배열형태)
  //stagger : 단일 요소에는 의미없음
  gsap.from('.chips li', {
    y: 50,
    opacity: 0,
    duration: 0.6,
    stagger: 0.15, //요소들이 0.15초 간격으로 순서대로 실행
    ease: "power3.out",
    scrollTrigger: {
      trigger: '.chips',
      start: 'top 50%', //화면의 50% 지점에서 시작
      //markers: true,
      toggleActions: 'play none none reverse',
      // 내려올 때 실행, 올라가면 반대로
      // toggleActions: "onEnter onLeave onEnterBack onLeaveBack"
      //트리거 요소가 아래에서 위로 들어올 때
      //트리거 요소가 스크롤 위로 지나가 화면에서 사라질 때
      //트리거 요소가 다시 아래로 내려오며 화면에 재진입할 때
      //트리거 요소가 다시 아래로 내려갔다가 화면에서 사라질 때
      //play(재생 시작), pause(멈춘 상태), resume(멈췄던 부분부터 다시 실행), restart(항상 처음부터 다시 실행), reverse(반대로 재생 (거꾸로)), reset(애니메이션을 0초 상태로 초기화), none(아무것도 안 함)
      toggleActions: 'restart none none none',
      //스크롤이 들어올 때 마다 항상 처음부터 다시 실행
    }
  });

  const timeline_card = gsap.timeline({
    scrollTrigger: {
      trigger: '.scene', //scene클래스가 화면에 들어오면 실행
      markers: true, //디버깅용 마커
      start: 'top 70%', //트리거 시작 지점
      toggleActions: 'play none none reverse',
    }
  });
  timeline_card.from('.card1', {
    y: 60,
    opacity: 0,
    duration: 0.6,
  }).from('.card2', {
    y: 80,
    opacity: 0,
    duration: 0.8,
  }, '<0.2')
    .from('.card3', {
      y: 80,
      opacity: 0,
      duration: 0.8,
    }, '>0.2');

  /*
    <	이전 애니메이션 시작 시점
    >	이전 애니메이션 끝 시점 
*/
  // 5. 스타일 변화
  gsap.to('.hero', {
    duration: 1.2,
    backgroundColor: '#4caf50',
    color: '#111',
    scale: 1.2,
    rotate: 10,
    borderRadius: '30px',
    repeat: -1,
    yoyo: true,
    ease: "power2.inOut",
  });

  //6.토글 애미메이션 (버튼이벤트)
  const panel_slide = gsap.to('.panel', {
    x: 240,
    duration: 0.5,
    paused: true,
  }).reverse();
  //애니메이션을 반대로 실행 - GSAP Tween/Timeline 객체 전용 - 시작부터 역재생 상태로 세팅

  document.getElementById('btn_toggle').addEventListener('click', () => {
    //지금 상태 확인 -> 지금 상태를 반대로 바꾸기
    panel_slide.reversed(!panel_slide.reversed());
  });
  
  //버튼 클릭할 때마다 true ↔ false로 바꿔주니까
  //정방향 ↔ 역방향 실행이 계속 토글됨

  /*
       my_tween.reversed();  GSAP Tween/Timeline 전용 메서드
       애니메이션 실행 방향 상태를 읽거나 바꾸기
       true 또는 false 반환
       true = 지금 "역재생 모드"
       false = 지금 "정방향 모드"
 
      my_tween.reversed(true);  // 강제로 역재생
      my_tween.reversed(false); // 강제로 정방향 실행
  */
});//end