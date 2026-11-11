document.addEventListener('DOMContentLoaded',()=>{
  //DOMContentLoaded
  //html 구조(dom트리)가 완전히 렌더링 된 후 실행
  //css 이미지 등 외부 리소스 로드 완료는 기다리지 않음

  //키 버튼들을 담은 컨테이너 요소들
  const $keyContainers =document.querySelectorAll('.key_container');

  //키보드 이벤트 정보를 표시할 영역
  const $info = document.querySelector('.js-info');

  //초기화(리셋) 버튼
  const $refresh = document.querySelector('.js-refresh');

  //사용자 키 목록
  const keys = ['Q', 'W', 'E', 'R', 'A', 'S', 'D', 'F', 'Z', 'X', 'C', 'V'];

  //한줄에 배치할 키 개수
  const KEY_COUNT = 4;
});//end