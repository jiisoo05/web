document.addEventListener("DOMContentLoaded", (event) => {
  gsap.registerPlugin(ScrollTrigger)
  function log(msg) {
    console.log(msg);
  }

  const tl1 = gsap.timeline({
    default: {
      duration: 0.8,
      ease: "power2.out",
    },
    scrollTrigger: {
      trigger: '.demo',//기준점
      start: 'top center',//트리거박스의 맨위(top) ===뷰포트 center(가운데) 만나면 시작
      end: 'bottom center',
      //요소의 bottom이 화면 중앙에 닿을때 끝
      // start/end 기본 문법 = "트리거요소 기준 위치 뷰포트 기준 위치"
      // - "top top"   → 요소의 윗변이 화면 윗변에 닿으면
      // - "top center"→ 요소의 윗변이 화면 중앙에 닿으면
      // - "top bottom"→ 요소의 윗변이 화면 아랫변에 닿으면
      // - "center center" → 요소의 중앙과 화면 중앙이 만날 때
      // - "bottom top" → 요소의 아랫변이 화면 윗변에 닿을 때
      scrub: true, //스크롤 움직임 <-> 애니메이션 위치를 동기화 (1,2 물 흐르듯이 // true 딱 분음)
      markers: true, //디버깅용 마커 (start end 빨간 초록선)
    },
    onUdate: () => log('진행률 : ' + tl1.progress().toFixed(2))
  })

  tl1.to('.b1', { x: 200, backgroundColor: '#555', })
    .add('label2')//이름표를 찍어줌 -> 나중에 점프 가능
    .to('.b2, .b3 ,.b4', { y: 100, opacity: 0.5, stagger: { each: 0.3, from: 'center', ease: "bounce.out", } })
    .add('label3')//또 다른 이름표
    .to('.b1, .b2 ,.b3 ,.b4', {
      x: 0, y: 0, opacity: 1,
      backgroundColor: '#222'
    })



});//end