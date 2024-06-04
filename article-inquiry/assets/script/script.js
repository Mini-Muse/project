let documents_data;
let actor_data;
let reply_data;

async function load_data(){

    const title_box = document.getElementById('articles_box');
    const articles_count_box = document.getElementById('articles_count');
    const articles_actions_box = document.getElementById('articles_actions');
    let output = ''
    let the_data;

    let data;

    // documents
    await fetch('https://minimuse.nlp.idsia.ch/documents')
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
    await fetch('assets/data/data_.json')
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

function list_articles(data){
    articles_box = document.getElementById('articles_box')

    let output = ''
    data.forEach(item => {
        output += '<div class="article_box" data-id="' + item.document_id + '">'
        output += '<span class="article_title">' + item.title + '</span><br/>'
        output += '<span class="article_author">by ' + 'author' + ', </span>'
        output += '<span class="article_date">' + item.year + '</span>'
        output += '</div>'
    })

    articles_box.innerHTML = output
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
    console.log(data)

    let id = data[0].document_id
    
    const article_item = document.querySelectorAll('.article_box')
    const article_info_box = document.getElementById('article_info_box')

    article_item.forEach(item => {
        item.addEventListener('click', function() {
            document_id = parseInt(item.getAttribute('data-id'))
            display_info(document_id)

            chat_with_NLP()
        })
    })

    function display_info(id){
        let output = ''

        article_item.forEach(item => {
            item.classList.remove('selected');

            if (item.getAttribute('data-id') == id){
               item.classList.add('selected') 
            }
        })

        data.forEach(item => {
            if (item.document_id == id){

                output += '<div id="the_title">' + item.title + '</div>'

                output += '<div id="the_info">'
                output += '<span>by author, </span>'
                output += '<span>' + item.year + ', </span>'
                output += '<span>' + item.issue + ', </span>'
                output += '<span>' + item.volume + '</span>'
                output += '</div>'

                output += '<div id="the_abstract">'
                output += '<h2>Abstract</h2>'
                output += '<p>Abstract lorem ipsum ...</p>'
                output += '</div>'

                output += '<div id="the_actors">'
                output += '<h2>Actors</h2>'
                output += '<ul>'
                output += '<li>...</li>'
                output += '<li>...</li>'
                output += '</ul>'
                output += '</div>'

                article_info_box.innerHTML = output
            }
        })

        article_info_box.setAttribute('data-document',id)
    }
    display_info(id)
}

function chat_with_NLP(){

    let count = 0
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
        
        count += 1
        let output = ''
        
        const messageSent = document.createElement('div');
        messageSent.className = 'message_sent';

        output += '<div class="chat_question" id="msg_' + count + '">' + message +  '</div>'
        output += '<div class="chat_reply" id="reply_' + count + '"></div>'

        messageSent.innerHTML = output

        chat.appendChild(messageSent);
        chat.scrollTop = chat.scrollHeight;  // Scroll to the bottom
        box_id = 'reply_' + count.toString()

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
        box = document.getElementById(box_id)
        id = box_id.replace('reply_','')

        // prepare data to be sent to the server
        documentId = id
        query = message

        box.innerHTML = 'question ' + id +' received ...'

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

document.addEventListener('DOMContentLoaded', function() {

    load_data()

});