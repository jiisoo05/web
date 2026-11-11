document.addEventListener('DOMContentLoaded', () => {
  //DOMContentLoaded
  //html 구조(dom트리)가 완전히 렌더링 된 후 실행
  //css 이미지 등 외부 리소스 로드 완료는 기다리지 않음

  //키 버튼들을 담은 컨테이너 요소들
  const $keyContainers = document.querySelectorAll('.key_container');

  //키보드 이벤트 정보를 표시할 영역
  const $info = document.querySelector('.js-info');

  //초기화(리셋) 버튼
  const $refresh = document.querySelector('.js-refresh');

  //사용자 키 목록
  const keys = ['Q', 'W', 'E', 'R', 'A', 'S', 'D', 'F', 'Z', 'X', 'C', 'V'];

  //한줄에 배치할 키 개수
  const KEY_COUNT = 4;
  $keyContainers.forEach((container, containerIndex) => {
    for (let i = 0; i < KEY_COUNT; i++) {
      const keyIndex = containerIndex * KEY_COUNT + i;
      if (keyIndex < keys.length) {
        const key = keys[keyIndex];
        const $button = document.createElement('button');
        $button.textContent = key;
        $button.setAttribute('type', 'button');
        $button.dataset.key = key.toLowerCase();
        //dataset 속성으로 키값 저장(소문자)
        container.appendChild($button);
      }
    }
  });

  const handleKeyboardEvent = (e) => {
    const allowKeys = [...document.querySelectorAll(`[data-type="${e.type}"] button`)].map(
      (key) => key.dataset.key
    );

    //허용되지 않은 키면 무시
    if (!allowKeys.includes(e.key)) {
      return;
    }

    //현재 이벤트 타입과 눌린 키 정보 출력
    $info.textContent = `type = ${e.type}, key = ${e.key}`;

    //해당 키 버튼에 pressed 클래스 추가
    const $target = document.querySelector(`[data-key="${e.key}"]`);
    $target.classList.add('pressed');
  }

  //키보드 키 누름(keydown 이벤트)
  document.addEventListener('keydown',handleKeyboardEvent)

  //키보드 키 누름 (keyup 이벤트)
  document.addEventListener('keypress',handleKeyboardEvent)

  //키보드에서 손을 뗄 때(keyup 이벤트)
  document.addEventListener('keyup',handleKeyboardEvent)



  //새로고침(리셋) 버튼 - 모든 pressed 클래스 제거 + 출력영역 초기화
  $refresh.addEventListener('click', () => {
    $info.textContent = '-';
    [...document.querySelectorAll('[data-key]')].forEach((key) => {
      key.classList.remove('pressed')
    })
  })


});//end