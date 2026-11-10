//노드를 선택하는 여러가지 메서드

//document.getElementById()
document.getElementById('example_id').style.color = 'red';

//document.getElementsByClassName()[i]
document.getElementsByClassName('example_class')[0].style.color = 'blue';
document.getElementsByClassName('example_class')[1].style.color = 'purple';

//document.getElementsByClassName()[i] 속성 추가
document.getElementsByClassName('example_class')[1].setAttribute('data-id','text_data');

//document.getElementsByTagName()[i] 스타일, 속성, 클래스 추가
document.getElementsByTagName('p')[0].style.backgroundColor ='pink';
document.getElementsByTagName('p')[1].setAttribute('data-id','text_data');
document.getElementsByTagName('p')[1].classList.add('test_color');

//document.querySelector()
document.querySelector('.test_class').removeAttribute('type');
document.querySelector('.test_class').setAttribute('id','data-id');

//document.querySelector('[data-id="test"]').style.backgroundColor ='pink';

document.querySelectorAll('[data-id="test"]')[1].setAttribute('id','yul');

document.querySelectorAll('[data-id="test"]').forEach((e,i)=>{
  if(i ==0 ){
    e.classList.add('test');
  }
  e.style.color = 'red';
})

//노드를 생성하고 조작하는 메서드
//<span class="color_purple">안녕하세요</span>
const $spanTag = document.createElement('span');