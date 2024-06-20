const documents_API = 'https://minimuse.nlp.idsia.ch/documents'
const actors_API = '../assets/data/data_.json'

let documents_data;
let actor_data;
let reply_data;

let count_prompts = 0;

async function load_data(){

    const title_box = document.getElementById('articles_box');
    const articles_count_box = document.getElementById('articles_count');
    const articles_actions_box = document.getElementById('articles_actions');
    let output = ''
    let the_data;

    let data;

    // documents
    await fetch(documents_API)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json(); 
    })
    .then(json => {
        documents_data = json
        // console.log(raw_data)
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });

    // actors
    await fetch(actors_API)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json(); 
    })
    .then(json => {
        actor_data = json
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });

    // group objects by actor name
    const actionflows = actor_data.reduce((acc, obj) => {
        const actorName = obj.actor.name;
        if (!acc[actorName]) {
            acc[actorName] = [];
        }
        acc[actorName].push(obj);
        return acc;
    }, []);
    const actionflows_array = Object.values(actionflows);

    list_articles(documents_data)
    get_statistics(actionflows_array)   
    load_article_info(documents_data)

    chat_with_NLP()
}

function list_articles(data, sort){
    articles_box = document.getElementById('articles_box')

    let sorted_data

    const sort_date = (a, b) => {
        const dateA = new Date(a.year);
        const dateB = new Date(b.year);

        return dateA - dateB;
    };

    const sort_author = (a, b) => { // to be changed
        const nameA = a.issue; //a[0].actor.name.toUpperCase();
        const nameB = b.issue; //b[0].actor.name.toUpperCase();

        if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }
        return 0;
    };

    if (sort == 'date'){
        sorted_data = data.sort(sort_date);
    }
    else {
        sorted_data = data.sort(sort_author);
    }

    articles_box.innerHTML = ''

    let output = ''
    sorted_data.forEach(item => {
        output += '<div class="article_box" data-id="' + item.document_id + '">'
        output += '<span class="article_title">' + item.title + '</span><br/>'
        output += '<span class="article_author">by ' + 'author' + ', </span>'
        output += '<span class="article_date">' + item.year + '</span>'
        output += '</div>'
    })

    articles_box.innerHTML = output

    load_article_info(data)
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
            const actorName = action.actor.actor_id;
            actorCount[actorName] = (actorCount[actorName] || 0) + 1;
        })
    });
    actors = Object.keys(actorCount).length;


    // get number of articles ---------------
    data.forEach(item => {
        item.forEach(action => {
            const actorName = action.document.document_id;
            articleCount[actorName] = (articleCount[actorName] || 0) + 1;
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
    let startDate = fix_date(data[0][0].date.value);
    let endDate = startDate 

    data.forEach(item => {
        item.forEach(event => {
            date = event.date.value
            if (fix_date(date) < startDate ) {
                startDate = date;
            }
            if (fix_date(date) > endDate ) {
                endDate = date;
            }
        })
    });

    year_a = parseInt(startDate.toString().slice(0, 4)) 
    year_b = parseInt(endDate.toString().slice(0, 4))
    years = year_b - year_a
    // console.log(year_a,year_b)

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

function load_article_info(data){
    // console.log(data)

    let id = data[0].document_id
    
    const article_item = document.querySelectorAll('.article_box')
    const article_info_box = document.getElementById('article_info_box')

    article_item.forEach(item => {
        item.addEventListener('click', function() {
            document_id = parseInt(item.getAttribute('data-id'))

            display_info(document_id)

            count_prompts = 0;
            chat_with_NLP()
        })
    })

    function display_info(id){
        // console.log(actor_data)

        let output = ''

        article_item.forEach(item => {
            item.classList.remove('selected');

            if (item.getAttribute('data-id') == id){
               item.classList.add('selected') 
            }
        })

        const all_act_doc = actor_data.filter((item) => item.document.document_id === id)
        const actors = all_act_doc.map(item => item.actor);
        const list_actors = Array.from(new Set(actors.map(a => a.actor_id))).map(id => actors.find(a => a.actor_id === id));

        list_actors.sort((a, b) => {
            let nameA = a.name;
            let nameB = b.name;
            return nameA.localeCompare(nameB);
        });
        // console.log(list_actors)

        let the_other_actors = ''
        for (let i = 0; i < list_actors.length; i++) {
            actor = list_actors[i].name
            the_other_actors += '<span class="actor_chips">' + actor + '</span>'
        }

        data.forEach(item => {
            if (item.document_id == id){

                output += '<div id="the_title">' + item.title + '</div>'

                output += '<div id="the_info">'
                output += '<span>by author, </span>'
                output += '<span>' + item.year + ', </span>'
                output += '<span>' + item.issue + ', </span>'
                output += '<span>' + item.volume + '</span>'
                output += '</div>'

                output += '<div id="the_abstract" class="info_box">'
                output += '<h2>Abstract</h2>'
                output += '<p>Abstract lorem ipsum ...</p>'
                output += '</div>'

                output += '<div class="meta" style="margin-top: 2rem;">'
                if (list_actors.length > 0){
                    output += '<p style="margin-bottom: .5rem;">actors</p>'
                    output += '<div class="other_actors_container">'
                    output += the_other_actors
                    output += '</div>'
                }
                else {
                    output += '<p>no actors detected</p>'
                }
                output += '</div>'


                output += '</div>'

                link = 'https://www.e-periodica.ch/digbib/view?pid=szg-006%3A2023%3A73%3A%3A4#4'
                output += '<div id="read" class="info_box"><a href="' + link + '" target="blank">Read the article</a></div>'
                // &#128279;
                // &#x1F517;
                article_info_box.innerHTML = output
            }
        })

        article_info_box.setAttribute('data-document',id)
    }
    display_info(id)
}

function chat_with_NLP(){

    let box_id = '';

    const send_button = document.getElementById('send_button')
    const chat = document.getElementById('chat')

    document_id = document.getElementById('article_info_box').getAttribute('data-document')
    chat.setAttribute("data-document", document_id);

    chat.innerHTML = ''
    // console.log(document_id)

    document.addEventListener('keypress',  function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            send_prompt()
        }
    })
    send_button.addEventListener('click', send_prompt)

    function send_prompt(){
        const input = document.getElementById('chat_input');
        const message = input.value.trim();
        
        if (message) {
            addMessageToChatBox(message);
            input.value = '';
        }
    }

    function addMessageToChatBox(message) {
        
        count_prompts += 1
        let output = ''
        
        box_id = 'msg_' + count_prompts
        const messageSent = document.createElement('div');
        messageSent.className = 'message_sent';
        messageSent.id = box_id

        output += '<div class="chat_question">' + message +  '</div>'
        // output += '<div class="chat_reply" id="reply_' + count_prompts + '"></div>'

        messageSent.innerHTML = output

        chat.appendChild(messageSent);
        chat.scrollTop = chat.scrollHeight;  // Scroll to the bottom
        //'reply_' + count_prompts.toString()

        // setTimeout(load_NLP_reply(box_id),100)
        waitAndRun(load_NLP_reply, box_id, message)
            // .then(function() {
            //     console.log(box_id);
            // });
    }

    function waitAndRun(func, argument_a, argument_b) {
        return new Promise(function(resolve) {
            setTimeout(resolve, 1000);
        }).then(function() {
            func(argument_a, argument_b);
        });
    }


    function load_NLP_reply(box_id, message) {
        // box = document.getElementById(box_id)
        // id = box_id.replace('reply_','')

        // prepare data to be sent to the server
        documentId = document.getElementById('chat').getAttribute('data-document')
        query = message

        const messageReceived = document.createElement('div');
        messageReceived.className = 'chat_reply';
        messageReceived.textContent = 'question ' + count_prompts + ' about document ' + documentId + ' ...';

        the_messageSent = document.getElementById(box_id)
        the_messageSent.appendChild(messageReceived)

        get_NLP_reply(documentId,query)

        async function get_NLP_reply(documentId,query){
            url = 'https://minimuse.nlp.idsia.ch/api/chat-document?documentId=' + documentId +'&query=' + query 

            await fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); 
            })
            .then(json => {
                reply_data = json
                console.log(reply_data)
            })
            .catch(error => {
                console.error('There was a problem with the prompt fetch operation:', error);
            });
        }
    }
}

function sort_data(){
    
    const the_sort = document.getElementById('the_sort')
    const article_list = document.getElementById('articles_box')

    the_sort.addEventListener('change', (event) => {
        const sort = event.target.value;

        article_list.innerHTML = ''

        list_articles(documents_data, sort)
    });
}

document.addEventListener('DOMContentLoaded', function() {

    load_data()

    sort_data()

});