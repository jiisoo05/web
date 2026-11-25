document.addEventListener('DOMContentLoaded', () => {

  // 카드가 화면에 들어올 때마다 페이드 인하고, 화면을 벗어나면 초기화
  const scrollCards = document.querySelectorAll('.our_business .list ul li, .instagram h3, .instagram .list ul li, main [data-text-reveal]');
  if ('IntersectionObserver' in window) {
    const scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.01) {
          entry.target.classList.remove('is-visible');
        } else if (entry.intersectionRatio >= 0.2) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: [0.01, 0.2] });

    scrollCards.forEach((card) => {
      card.classList.add('scroll-reveal');
      scrollObserver.observe(card);
    });
  } else {
    scrollCards.forEach((card) => card.classList.add('is-visible'));
  }

  const textDurations = [650, 820, 560, 740, 910, 610, 780];
  document.querySelectorAll('[data-text-reveal]').forEach((text, index) => {
    text.style.setProperty('--text-fade-duration', textDurations[index % textDurations.length] + 'ms');
  });

  //  AOS 초기화 (스크롤 애니메이션)
  window.AOS?.init({
    disable: false,                //  AOS 끄지 않기! → 애니메이션 작동하게 두기
    startEvent: 'DOMContentLoaded', //  HTML이 다 불러와지면 바로 AOS 시작!
    initClassName: 'aos-init',      //  AOS가 준비됐다는 표시 클래스 (자동 붙음)
    animatedClassName: 'aos-animate', //  애니메이션이 실행될 때 붙는 클래스 이름
    useClassNames: false,           //  HTML에 data-aos 값 그대로 클래스 안 붙이기
    disableMutationObserver: false, //  새로 생긴 요소도 자동 감시해서 애니메이션 적용
    debounceDelay: 50,              //  창 크기 바꿀 때 0.05초 기다렸다 계산 (너무 자주 안 하게)
    throttleDelay: 99               //  스크롤할 때 0.099초마다 한 번씩 체크 (성능 좋게!)
  });

  //햄버거 메뉴 클릭시 header에 on클래스 토글
  const $ham = document.querySelector('.ham');
  const $header = document.querySelector('header');
  $ham.addEventListener('click', () => {
    $header.classList.toggle('on');
    document.body.classList.toggle('rock');
  });

  //메뉴 li들에 순차적 delay 주기
  const gnbItems = document.querySelectorAll('header .fix .gnb>ul>li');
  gnbItems.forEach((li, index) => {
    li.style.transitionDelay = `${0.2 * (index + 1)}s`
  });
});//end