import Mohill from '../..';

(function () {
  Array.prototype.slice.call(document.getElementsByClassName('close'))
    .forEach(el => {
      el.addEventListener('click', () => {
        mohill.close();
      });
    });

  const mohill = new Mohill({
    target: document.getElementById('app'),
    data: {
      style: {
        coverBackgroundColor: 'rgba(0,0,0,.4)'
      }
    }
  });

  document.getElementById('button1').addEventListener('click', () => {
    mohill.setStyle({backgroundColor: '#0d5661'});
    mohill.open('foo');
  });
  document.getElementById('button2').addEventListener('click', () => {
    mohill.setStyle({backgroundColor: '#6d2e5b'});
    mohill.open('bar');
  });
})();
