function menu(){
    const menuToggle = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.menu');

    menuToggle.addEventListener('click', function() {
        menu.classList.toggle('active');
        const expanded = menu.getAttribute('aria-expanded') === 'true' || false;
        menu.setAttribute('aria-expanded', !expanded);
    });

}

function load_footer(){
    const footer_box = document.getElementById('footer');
    let footer_url = 'assets/content/footer.html';

    const url = window.location.href;
    const host = window.location.host;
    const pathname = window.location.pathname;
    const search = window.location.search;
    const hash = window.location.hash;
    // console.log(pathname)

    if (pathname.includes('actor-flow') || pathname.includes('article-inquiry')){
        footer_url = '../assets/content/footer.html';
    }

    fetch(footer_url)
        .then(response => response.text())
        .then(text => footer.innerHTML = text);
}

function fix_date(date){
    let new_date;

    if (date.length == 4){
        new_date = String(date) + '-01-01'
    }
    else {
        new_date = String(date)
    }    
    return new_date
}

document.addEventListener("DOMContentLoaded", function(){
    load_footer()
    menu()
});
