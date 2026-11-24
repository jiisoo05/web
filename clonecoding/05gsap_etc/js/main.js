document.addEventListener("DOMContentLoaded", (event) => {
  gsap.registerPlugin(ScrollTrigger);

  //Lenis는 마우스 휠 스크롤을 부드럽게 만들어 준다
  //GSAP ScrollTigger와 같이쓰면 스크롤 애니메이션도 더 자연스럽게 붙는다
  const lenis = new Lenis({
    //자동실행 대신 우리가 직접 프레임을 돌리게 한다
    autoRaf: false,
    //스크롤이 살짝 따라오는 시간을 정한다
    duration: 0.8,
    //들어온 값을 그대로 써서 일정한 속도감을 만든다
    easing: (t) => t,
    //마우스 휠 스크롤을 부드럽게 만든다
    smoothWheel: true,
    //터치 스크롤도 lenis흐름과 맞춘다
    syncTouch: true,
  });

  // 매 프레임마다 lenis와 scrolltrigger를 같이 업데이트 해야 스크롤 애니메이션이 어긋나지 않음
  function raf(time) {
    //지금 프레임의 시간을 lenis에게 알려준다
    lenis.raf(time);
    //ScrollTrigger가 현재 스크롤 위치를 다시 계산하게 한다
    ScrollTrigger.update();
    //다음 화면 프레임에서도 같은일을 반복한다
    requestAnimationFrame(raf);
  }
  //브라우저 애니메이션 프레임 루프를 시작한다
  requestAnimationFrame(raf);

  const siteHeader = document.getElementById('site_header');
  const menuToggle = document.getElementById('menu_toggle');
  const mobilePanel = document.querySelector('.mobile_panel');
  const navLinks = document.querySelectorAll('.mobile_nav a, .primary_nav a');

  //직전 스크롤 위치를 저장해서 방향을 비교한다
  let lastY = 0;
  lenis.on('scroll', ({ scroll }) => {
    //해더가 없으면 더 진행하지 않는다
    if (!siteHeader) return;

    //lenis가 알려준 현재 스크롤 위치를 짧은 이름으로 담는다
    const y = scroll;

    //아래로 충분히 내렸고 첫 화면을 지난 상태면 헤더를 위로 숨긴다
    if (y > lastY + 4 && y > 120) {
      siteHeader.style.transform = 'translateY(-100%)'
    } else if (y < lastY - 4) {
      //원래 자리로 되돌린다
      siteHeader.style.transform = 'translateY(0)'
    }
    //다음 비교를 위해 현재 위치를 저장
    lastY = y;

    //스크롤이 움직였으니 현재 섹션메뉴 표시도 다시 맞춘다
    updateActiveFromViewport();
  });

  //모바일 메뉴 버튼을 누르면 메뉴 패널이 열리고 닫힌다
  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener('click', () => {
      //is_open 클래스를 켜거나 끄고 , 결과를 true,false로 받는다
      const isOpen = mobilePanel.classList.toggle('is_open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    })
  }
  //메뉴 링크를 누를 뒤에는 모바일 메뉴를 닫아 화면을 다시 넓게 보여줌
  function closeMobileMenu() {
    if (!menuToggle || !mobilePanel) return;
    mobilePanel.classList.remove('is_open');
    menuToggle.setAttribute('aria-expanded', 'false');
  }
  const sectionMap = [
    '#hero',
    '#projects',
    '#info',
    '#showcase',
    '#gallery',
    '#stats',
    '#contact',
  ]

  //화면의 42%지점에 가장 가까운 섹션을 현재 섹션으로 판단한다
  //맨아래 근처에는 contact 메뉴가 끝까지 active로 보이게 따로 처리한다
  function updateActiveFromViewport() {
    //문서 맨 아래에 가까운지 확인
    const isNearBottom = window.screenY + window.innerHeight >= document.documentElement.scrollHeight - 80;
    //맨 아래라면 마지막 contact 메뉴를 켠다
    if (isNearBottom) {
      setActiveByHref('#contact');
      return;
    }
    //화면 위에서 42% 내려온 지점을 현재 섹션 판단 기준으로 쓴다
    const checkPoint = window.innerHeight * 0.42;
    //아직 못찾았을 때 기본 active는 hero로 둔다
    let activeHref = '#hero';
    //가장 가까운 섹션을 찾기 위해 큰 숫자로 시작한다
    let actvieDistance = Infinity;
    //섹션 목록을 하나씩 돌면서 기준점과의 거리를 비교한다
    sectionMap.forEach((id) => {
      const section = document.querySelector(id);
      //섹션이 없으면 이번 항목을 건너뛴다
      if (!section) return;

      //화면 안에서 섹션의 현재 위치를 가져온다
      const rect = section.getBoundingClientRect();
      //기준점이 섹션안에 들어와 있는지 확인한다
      const isInside = rect.top <= checkPoint && rect.bottom >= checkPoint;
      //섹션 안이면 거리0, 밖이면 위/아래 경계중 더 가까운 거리로 계산
      const distance = isInside ? 0 : Math.min(Math.abs(rect.top - checkPoint), Math.abs(rect.bottom - checkPoint));

      //이번 섹션이 지금싸지 본 섹션보다 기준점에 더 가까우면 교체
      if (distance < actvieDistance) {
        //가장 가까운 거리 값을 갱신
        actvieDistance = distance;
        //active 로 켤 href도 이번 섹션 id로 바꾼다
        activeHref = id;
      }
      setActiveByHref(activeHref);
    });

  }

  function setActiveByHref(href) {
    //모든 메뉴 링크를 하나씩 확인한다
    navLinks.forEach((link) => {
      //현재 링크의 href가 켜야할 섹션 href와 같은지 비교
      const isSameLick = link.getAttribute('href') === href;
      //같은 링크면 active를 켜고 아니면 끈다
      link.classList.toggle('is_active', isSameLick);
    })
  }
  setActiveByHref('#hero');

  gsap.timeline({ default: { duration: 0.8, ease: 'power2.out' } })
    .to('.hero_title', { y: 0, opacity: 1 })
    .to('.hero_sub', { y: 0, opacity: 1 }, '<0.12')
    .to('.hero_cta', { y: 0, opacity: 1 }, '<0.12');




  document.querySelectorAll('.magnet_zone').forEach((zone) => {
    const btn = zone.querySelector('.cta_btn');
    //버튼이 없으면 자석 효과를 줄 대상도 없으니 멈춘다
    if (!btn) return;
    zone.addEventListener('mousemove', (e) => {
      //zone의 화면 위치와 크기를 가져온다
      const rect = zone.getBoundingClientRect();
      //마우스가 zone 중앙에서 가로로 얼마나 떨어졌는지 계산
      const x = e.clientX - (rect.left + rect.width / 2);
      //마우스가 zone 중앙에서 세로로 얼마나 떨어졌는지 계산
      const y = e.clientY - (rect.top + rect.height / 2);
      //계산한 거리의 10%만큼만 버튼을 움직여 과하지 않게 만든다
      btn.style.transform = `translate(${x * 0.1}px,${y * 0.1}px)`
    });

    zone.addEventListener('mouseleave', () => {
      btn.style.transform = `translate(0,0)`;
    })
  });


  //maquee는 같은 글자 줄을 여러개 복사해서 끝없이 흐르는 것 처럼 보이게 한다
  function marquee() {
    document.querySelectorAll('.maquee_wrap').forEach((wrap) => {
      const row = wrap.querySelector('.marquee_row');
      //기준 줄이 없으면 복사할 것도 없으니 건너띈다
      if (!row) return;

      //한 줄의 실제 가로 길이 저장
      const rowWidth = row.scrollWidth;

      for (let i = 1; i < 10; i += 1) {
        //기준 줄을 복사해서 wrapper 안에 추가
        wrap.appendChild(row.cloneNode(true));
      }
      const rows = wrap.querySelectorAll('.marquee_row');
      //현재 가로 이동 위치 저장
      let x = 0;

      //한 프레임마다 글자 줄을 조금씩 이동시키는 함수
      function step() {
        //reverse 클래스가 있으면 오른쪽, 없으면 왼쪽으로 움직임
        const dir = wrap.classList.contains('reverse') ? -1 : 1;
        //방향에 맞춰 현재 위치를 1px 씩 움직임
        x += dir;

        //모든 복제 줄의 위치를 각각 다시 계산
        rows.forEach((item, index) => {
          //현재 줄은 기본 위치에 자기순서만큼 rowWidth를 더해 배치
          let offset = x + index * rowWidth;
          //왼쪽으로 나가서 완전히 사라진 줄은 맨 오른쪽 뒤로 보낸다
          if (dir === -1 && offset <= -rowWidth) {
            offset += rowWidth * rows.length;
          } else if (dir === 1 && offset >= rowWidth) {
            //오른쪽으로 나가서 완전히 사라진 줄은 맨 왼쪽 앞으로 보낸다
            offset -= rowWidth * rows.length;
          }
          //계산한 위치를 실제 화면 이동으로 적용
          item.style.transform = `translateX(${offset}px)`;
        });

        //다음 프레임에서도 계속 움직이게 예약
        requestAnimationFrame(step);
      }
      //이 marquee 줄의 애니메이션을 시작
      requestAnimationFrame(step);
    });
  }
  //페이지에 있는 marquee들 실제로 실행
  marquee();
});//end