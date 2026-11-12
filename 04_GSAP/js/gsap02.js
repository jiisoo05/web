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


});//end