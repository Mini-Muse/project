function menu(){
    const menuToggle = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.menu');

    let active = false

    menuToggle.addEventListener('click', function() {
        menu.classList.toggle('active');
        const expanded = menu.getAttribute('aria-expanded') === 'true' || false;
        menu.setAttribute('aria-expanded', !expanded);

        if (active == false) {
            active = true

            menuToggle.innerHTML = 'X'
        }
        else {
            active = false

            menuToggle.innerHTML = 'menu'
        }
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

function error_message(container){

    const quotes = [
        {
            "name": "Winston Churchill",
            "quote": "History is written by the victors."
        },
        {
            "name": "William Shakespeare",
            "quote": "There is a history in all men's lives."
        },
        {
            "name": "Marshall McLuhan",
            "quote": "Only the vanquished remember history."
        },
        {
            "name": "Martin Luther King, Jr.",
            "quote": "We are not makers of history. We are made by history."
        },
        {
            "name": "Napoleon Bonaparte",
            "quote": "History is a set of lies agreed upon."
        },
        {
            "name": "Pearl S. Buck",
            "quote": "If you want to understand today you have to search yesterday."
        },
        {
            "name": "Herman Hesse",
            "quote": "To study history means submitting yourself to chaos, but nevertheless retaining your faith in order and meaning."
        }
    ]

    const error_message = 'So sorry, we couldn\'t find what you were looking for. <br/>Please try again later.'
    const randomIndex = Math.floor(Math.random() * quotes.length);

    let output = ''

    // error
    output += '<div id="error_quote">'

    output += '<div class="error_box">'
    output += error_message
    output += '</div>'

    // quote
    output += '<div class="quote_box">'
    output += '<div class="quote">' + quotes[randomIndex].quote + '</div>'
    output += '<div>' + quotes[randomIndex].name + '</div>'
    output += '</div>'

    output += '</div>'

    container.innerHTML = output
    
}

document.addEventListener("DOMContentLoaded", function(){

    load_footer()

});
