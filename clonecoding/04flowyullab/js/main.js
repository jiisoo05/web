//햄버거 메뉴
const header = document.querySelector('header');

document.getElementById('ham_menu').addEventListener('click', function () {
  header.classList.toggle('on');
  document.querySelector('html,body').classList.toggle('no-scroll');
});

document.querySelectorAll('header .container .all_con ul.list>li').forEach(function(li){
  const button = li.querySelector('button');

  //버튼이 없는 항목은 건너뜁니다
  if(!button) return;

  button.addEventListener('click',function(){
    //css의 미디어쿼리와 동일하게 1160px이하에서만 실행
    if(!window.matchMedia('(max-width:1160px)').matches) return;
    li.classList.toggle('on');
  });
})


let scrollLockY = 0;

const setScrollLocked = (isLocked) => {
  if (isLocked) {
    //지금 보고 있는 스크롤 위치를 기억합니다
    scrollLockY = window.scrollY;
  }
}
//직전 스크롤위치 - 지금 위치와 비교해서 사용자가 아래로 내리는지 위로 올리는지 판단
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
  //현재스크롤위치
  const currentScrollY = window.scrollY;
  // console.log(currentScrollY);

  //지금 위치가 직전 위치보다 크면 아래로 스크롤 중
  if (currentScrollY > lastScrollY) {
    header.style.top = '-100px'
  } else {
    header.style.top = 0;
  }
  //다음 스크롤때 비교할 수 있도록 지금 위치 저장
  lastScrollY = currentScrollY;

});


//메인 히어로
const mainSlide = new Swiper('.main_visual .swiper', {
  //마지막 슬라이드 다음에 다시 첫 슬라이드로 이어지게
  loop: true,
  //자동으로 다음 슬라이드로 넘어가게
  autoplay: {
    delay: 5500,
    disableOnInteraction: false,
  },
  //메인 비주얼 안에있는 이전/다음 버튼만 사용하게 정확히 범위를 잡습니다
  navigation: {
    nextEl: '.main_visual .right',
    prevEl: '.main_visual .left',
  },
});

//메인 슬라이드의 재생/일시정지 버튼
const toggleBtn = document.querySelector('.btn_box span');

toggleBtn.addEventListener('click', function () {
  if (mainSlide.autoplay.running) {
    //자동 재생 중이면 멈추고 아이콘을 재생 모양으로 바꿉니다
    mainSlide.autoplay.stop();
    this.innerText = 'play_arrow';
  } else {
    //멈춘 상태면 다시 재생하고 아이콘을 일시정지 모양으로 바꿉니다
    mainSlide.autoplay.start();
    this.innerText = 'pause';
  }
});

//현재 슬라이드 번호가 들어갈 자리
const numEl = document.querySelector('.main_visual .pager .txt_box .num');

//전체 슬라이드 개수가 들어갈 자리
const totalEl = document.querySelector('.main_visual .pager .txt_box span:last-of-type');

//swiper는 loop를 쓰면 복제 슬라이드를 만듭니다.
//그래서 복제본을 빼고 진자 슬라이드만 세어야 전체 개수가 맞습니다.
const getTotal = () => mainSlide.slidesEl.querySelectorAll('.swiper-slide:not(.swiper-slide-duplicate)').length;

//화면에 현재 번호와 전체 개수를 적어주는 함수
const setPager = () => {
  //realIndex는 0부터 시작하므로 화면에는 1을 더해서 보여줍니다
  const current = mainSlide.realIndex + 1;
  numEl.textContent = String(current);
  totalEl.textContent = String(getTotal());
}

//처음 페이지가 열렸을때 번호를 한번 적어줍니다
setPager();

//슬라이드가 바뀔때마다 번호도 다시 바꿉니다
mainSlide.on('slideChange', setPager);

//공지 영역의 세로 슬라이드
const infoSlide = new Swiper('.article_top .slide .swiper', {
  direction: 'vertical',
  //마지막 슬라이드 다음에 다시 첫 슬라이드로 이어지게
  loop: true,
  //자동으로 다음 슬라이드로 넘어가게
  autoplay: {
    delay: 2500,
    disableOnInteraction: false,
  },
});

//contents 영역의 가로 자동 슬라이드
const contentsSlide = new Swiper('.contents .swiper', {
  //카드 너비는 css에 맡기고 보이는 만큼 자동으로 보여줌
  slidesPerView: 'auto',
  spaceBetween: 30,

  loop: true,
  loopAdditionalSlides: 5,
  speed: 9000,
  autoplay: {
    delay: 0,
    disableOnInteraction: false,
  },
  //화면 크기별로 카드 사이 간격과 흐르는 속도를 바꿉니다
  breakpoints: {
    0: {
      speed: 6500,
      spaceBetween: 16,
    },
    501: {
      speed: 7200,
      spaceBetween: 20,
    },
    769: {
      speed: 8200,
      spaceBetween: 24,
    },
    1161: {
      speed: 9000,
      spaceBetween: 30,
    },
  },
  on: {
    //계속 같은 속도로 흐르게 linear를 적용
    init: function () {
      this.wrapperEl.style.transitionTimingFunction = 'linear';
    },
    slideChangeTransitionStart: function () {
      this.wrapperEl.style.transitionTimingFunction = 'linear';
    },
  },
});

//blog 영역의 가로 자동 슬라이드
const blogSlide = new Swiper('.blog .swiper', {
  //카드 너비는 css에 맡기고 보이는 만큼 자동으로 보여줌
  slidesPerView: 'auto',
  spaceBetween: 30,

  loop: true,
  loopAdditionalSlides: 5,
  speed: 12000,
  autoplay: {
    delay: 0,
    disableOnInteraction: false,
  },
  breakpoints: {
    0: {
      speed: 8000,
      spaceBetween: 16,
    },
    501: {
      speed: 9000,
      spaceBetween: 20,
    },
    769: {
      speed: 10500,
      spaceBetween: 24,
    },
    1161: {
      speed: 12000,
      spaceBetween: 30,
    },
  },
  on: {
    //계속 같은 속도로 흐르게 linear를 적용
    init: function () {
      this.wrapperEl.style.transitionTimingFunction = 'linear';
    },
    slideChangeTransitionStart: function () {
      this.wrapperEl.style.transitionTimingFunction = 'linear';
    },
  },
});

//화면 크기가 바뀌면 카드 너비와 슬라이드 위치가 달라집니다
//그래서 Swiper에게 '다시 계산해'라고 알려주는 함수
const updateResponsiveSlides = () =>{
  [mainSlide,infoSlide,contentsSlide,blogSlide].forEach((slide)=>{
    slide.update();
  })
}

//리사이즈 중에는 계산을 계속하지 않고, 잠깐 멈춘 뒤 한번만 계산합니다
let resizeTimer;
window.addEventListener('resize',()=>{
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(updateResponsiveSlides,120);
});




document.querySelector('.select_box button').addEventListener('click', () => {
  document.querySelector('.select_box').classList.toggle('on');
});