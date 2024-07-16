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

    the_date = new_date.replace('Dezember ','')
        .replace('15 ','')
        .replace('April ','')
        .replace('August ','')
        .replace('Februar ','')
        .replace('Januar ','')
        .replace('May ','')
        .replace('November ','')
        .replace('Oktober ','')
        .replace('September ','')
        .replace('StGB erst ','')

    return the_date
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

function get_statistics(data){
    // console.log(data)

    let actors = 0;
    let articles = 0;
    let actions = 0;
    let years = 0;

    const actorCount = {};
    const articleCount = {};

    // get number of actors ---------------
    data.forEach(item => {
        item.forEach(action => {
            // console.log(action.result)
            // const actorName = action.actor.actor_id;
            const actorName = action.result.actor.Name
            actorCount[actorName] = (actorCount[actorName] || 0) + 1;
        })
    });
    actors = Object.keys(actorCount).length;


    // get number of articles ---------------
    data.forEach(item => {
        item.forEach(action => {
            // console.log(action.result.articleID)
            // const actorName = action.result.actor.Id
            const documentID = action.result.articleID
            articleCount[documentID] = (articleCount[documentID] || 0) + 1;
        })
    });
    articles = Object.keys(articleCount).length;


    // get number of actions ---------------
    data.forEach((item,i) => {
        item.forEach((action,a) => {
            actions += 1
        })
    })

    // get number of years ---------------
    // get number of years ---------------
    // console.log(data[0][0].result)
    let startDate = fix_date('1800-01-01') // fix_date(data[0][0].result.date.Name); // fix_date(data[0][0].result.date.Name);
    let endDate = fix_date('1990-01-01') //startDate 
    // console.log(startDate)

    data.forEach(item => {
        item.forEach(event => {

            if (event.result.date.Name){
                date_ = event.result.date.Name
                date = fix_date(date_.replace('von ',''))

                if (isNaN(date)){
                    date = 0
                }
            }
            else {
                date = fix_date(event.result.date)
            }
            
            if (fix_date(date) < startDate ) {
                startDate = fix_date(date);
                // console.log(date)
            }
            if (fix_date(date) > endDate ) {
                endDate = fix_date(date);
            }
        })
    });

    year_a = parseInt(startDate.toString().slice(0, 4)) 
    year_b = parseInt(endDate.toString().slice(0, 4))
    years = 1982 - 1500 // year_b - year_a
    // console.log(year_a,year_b,endDate)

    // get containers ---------------
    const actor_count = document.getElementById('actor_count');
    const articles_actions = document.getElementById('articles_actions');
    const total_actions = document.getElementById('total_actions');
    const timespan_actions = document.getElementById('timespan_actions');

    // display statistics ---------------
    actor_count.innerHTML = actors;
    articles_actions.innerHTML = articles;
    total_actions.innerHTML = actions;
    timespan_actions.innerHTML = years;
}

function random_date(){
    year = getRandom(1890, 1930)
    mont = getRandom(1, 12)
    day_ = getRandom(1, 27)
    date = year //+ '-' + mont + '-' + day_

    return date
}

document.addEventListener("DOMContentLoaded", function(){

    load_footer()

});
