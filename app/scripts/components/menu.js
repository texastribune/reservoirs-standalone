import $ from 'shoestring';

$.ready(() => {
  const menuButton = $('#menu-button');
  const menuNav = $('#menu-nav');

  menuButton.on('click', e => {
    e.preventDefault();

    if (menuNav.is('.menu-nav-open')) {
      menuNav.removeClass('menu-nav-open');
    } else {
      menuNav.addClass('menu-nav-open');
    }
  });
});
