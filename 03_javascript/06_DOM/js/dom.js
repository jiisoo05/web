//노드를 선택하는 여러가지 메서드

//document.getElementById()
document.getElementById('example_id').style.color = 'red';

//document.getElementsByClassName()[i]
document.getElementsByClassName('example_class')[0].style.color = 'blue';
document.getElementsByClassName('example_class')[1].style.color = 'purple';

//document.getElementsByClassName()[i] 속성 추가
document.getElementsByClassName('example_class')[1].setAttribute('data-id', 'text_data');

//document.getElementsByTagName()[i] 스타일, 속성, 클래스 추가
document.getElementsByTagName('p')[0].style.backgroundColor = 'pink';
document.getElementsByTagName('p')[1].setAttribute('data-id', 'text_data');
document.getElementsByTagName('p')[1].classList.add('test_color');

//document.querySelector()
document.querySelector('.test_class').removeAttribute('type');
document.querySelector('.test_class').setAttribute('id', 'data-id');

//document.querySelector('[data-id="test"]').style.backgroundColor ='pink';

document.querySelectorAll('[data-id="test"]')[1].setAttribute('id', 'yul');

document.querySelectorAll('[data-id="test"]').forEach((e, i) => {
  if (i == 0) {
    e.classList.add('test');
  }
  e.style.color = 'red';
})

//노드를 생성하고 조작하는 메서드
//<span class="color_purple">안녕하세요</span>
const $spanTag = document.createElement('span');
$spanTag.classList.add('color_purple');
$spanTag.innerText = '안녕하세요';
document.querySelector('.node_manipulation .create_element').append($spanTag);

//<div><span class="color_purple">네, 안녕하세요</span></div>
const $divTag = document.createElement('div');
$divTag.innerHTML = `<span class="color_purple">네, 안녕하세요</span>`;
document.querySelector('.appendchild').appendChild($divTag);

//자식 노드 삭제
const $childTag = document.querySelector('.removechild span');
document.querySelector('.removechild').removeChild($childTag);

//removeAttribute - 속성삭제
document.getElementsByClassName('remove_attribute')[0].removeAttribute('data-id');

//createTextNode 텍스트 노드 생성
const textNode = document.createTextNode('안녕하십니까?');
//브라우가 제공하는 가벼운 dom 컨테이너 객체 - 실제 문서트리에 직접 붙지 않고 메모리 상에서만 존재
const $fragment = document.createDocumentFragment();
$fragment.appendChild(textNode);
document.querySelector('.create_textnode').appendChild($fragment);

//cloneNode 노드복사
const $originNode = document.querySelector('.clone_node');
const $copyTag = $originNode.cloneNode(true);
//원본 노드를 복사해서 새로운 노드를 만듦
//true : 자식(내용)까지 복사
//false : 태그만 복사
$originNode.appendChild($copyTag);

//근처 노드에 접근하는 메서드
const $childchildEl = document.getElementById('child_child');
const $parentEl = $childchildEl.parentElement;
const $parentParentEl = $childchildEl.parentNode.parentNode;

$parentEl.setAttribute('data-traversing', 'true');
$parentParentEl.setAttribute('data-traversing', 'true');

const $current = document.querySelector('.current');
console.log($current.previousSibling);
console.warn($current.previousElementSibling);
console.log($current.nextElementSibling);

//첫번째 노드와 마지막 노드 선택하기
const $first_last = document.querySelector('.first_last');
console.log($first_last.firstChild);
$first_last.firstElementChild.style.color = 'red';
$first_last.lastElementChild.style.color = 'blue';

// 텍스트 노드를 조작하는 메서드
const contentsText = `<div>
                        <span style="color: red;">innerText</span>
                      </div>`;
const contentsHTML = `<div>
                        <span style="color: blue;">innerHTML</span>
                      </div>
                      `;
const contentsTextContent = `<div>
                                <span style="color: purple;">textContent</span>
                              </div>`;

//innerText : 화면에 실제로 보이는 텍스트만 가져오거나 바꿀 때 사용 - 줄바꿈,레이아웃 반영해서 반환
//textContent : 요소 내부의 모든 텍스트를 가져오거나 바꿀때 사용 - 줄바꿈 공백도 있는 그대로 반환  

document.querySelector('.inner_text div').innerText = contentsText;
document.querySelector('.inner_html div').innerHTML = contentsHTML;
document.querySelector('.text_content div').textContent = contentsTextContent;


/* 요소의 위치와 크기를 알아내는 메서드 */
//getBoundingClientRect -dom요소의 위치와 크기 정보를 뷰포트(현재 보이는 화면) 기준으로 반환하는 메서드 : 단위 픽셀

const $position_width = document.querySelector('.position_width');
const positionWidth = $position_width.getBoundingClientRect();
console.log(positionWidth);
console.log(positionWidth.left);
console.log(positionWidth.top);

const $jsPosition = $position_width.querySelector('.js_position');
const $temp = document.createElement('div');

$temp.innerHTML =
  `<div>
  $jsPosition.offsetLeft : ${$jsPosition.offsetLeft},
  $jsPosition.offsetTop : ${$jsPosition.offsetTop},
</div>
<div>
 $jsPosition.clientLeft : ${$jsPosition.clientLeft},
 $jsPosition.clientTop : ${$jsPosition.clientTop},
</div>
`;

$jsPosition.appendChild($temp);

const $jsSize = $position_width.querySelector('.js_size');
const $temp2 = document.createElement('div');

$temp2.innerHTML =
  `<div>
        $jsSize.offsetWidth : ${$jsSize.offsetWidth},
        $jsSize.offsetHeight : ${$jsSize.offsetHeight},
    </div>
    <div>
        $jsSize.clientWidth :${$jsSize.clientWidth},
        $jsSize.clientHeight : ${$jsSize.clientHeight},
    </div>
`;
$jsSize.appendChild($temp2);