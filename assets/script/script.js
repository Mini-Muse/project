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

    if (pathname.includes('actor-flow') || pathname.includes('article-inquiry')){
        footer_url = '../assets/content/footer.html';
    }

    fetch(footer_url)
        .then(response => response.text())
        .then(text => footer.innerHTML = text)
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function access_window(){
    const access_content = '../assets/content/access.html';
    let access_the_window = document.getElementById('access_window');
    const coockie_name = 'access'

    if (!getCookie(coockie_name)) {

        fetch(access_content)
            .then(response => response.text())
            .then(text => {
                access_the_window.innerHTML = text
                access_the_window.style.opacity = '1'

                const loginForm = document.getElementById('loginForm');
                loginForm.addEventListener('submit', (event) => {
                    event.preventDefault();

                    user = document.getElementById('username').value;
                    pass = document.getElementById('password').value;

                    load_data()
                })

                close_buttons()
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    }
    else {
        credentials = getCookie('access').split(',')

        user = credentials [0]
        pass = credentials [1]

        load_data()
    }
}

function remove_modal(psw){
    // console.log(psw)
    const access_the_window_ = document.getElementById('access_window');

    if (psw == true){
        access_the_window_.remove()
    }
    else {
        const result_box = document.getElementById('result_box')
        result_box.innerHTML = 'The credentials are incorrect'

        // access_the_window_.remove()
    }
}

function close_buttons(){
    const close_modal = document.getElementById('close_modal');
    const cancel_button = document.getElementById('cancel');
    const access_the_window_ = document.getElementById('access_window');
    
    close_modal.addEventListener('click', () => {
        // remove_modal(false)
        access_the_window_.remove()
    });

    cancel_button.addEventListener('click', () => {
        // remove_modal(false)
        access_the_window_.remove()
    });

    // document.onkeydown = function(evt) {
    //     if (evt.key === "Escape" || evt.key === "Esc"){
    //         remove_modal(false)
    //     }
    // }
}


function set_coockie(coockie_name,credential) {
    document.cookie = coockie_name + '=' +  credential + '; path=/'
}

function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
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

    document.getElementById('filter_sort_options').innerHTML = ''
    document.getElementById('data_recap').innerHTML = ''
    document.getElementById('timeline_recap').innerHTML = ''

    let output = ''
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

function getRandom(min, max) {
    random = Math.random() * (max - min) + min
    result = Math.floor(random)

    if (result < 10) {
        result = '0' + result
    } 

    return result;
}

document.addEventListener("DOMContentLoaded", function(){

    load_footer()

});
