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
        data = json
        // console.log(raw_data)
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });

    // group objects by actor name
    const actionflows = data.reduce((acc, obj) => {
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
       
}

function list_articles(data){
    articles_box = document.getElementById('articles_box')

    console.log(data)

    let output = ''

    data.forEach(item => {
        output += '<div class="article_box">'
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

function chat_with_NLP(){
    const chatBox = document.getElementById('question_chat_box');
    const theNLPBox = document.getElementById('reply_chat_box');

    document.getElementById('send_button').addEventListener('click', function() {
        const input = document.getElementById('chat_input');
        const message = input.value.trim();
        
        if (message) {
            addMessageToChatBox(message);
            input.value = '';
        }
    });

    function addMessageToChatBox(message) {
        
        const messageElement = document.createElement('div');
        messageElement.className = 'my_chat_message';
        messageElement.textContent = message;
        
        chatBox.innerHTML = '';
        chatBox.appendChild(messageElement);
        chatBox.scrollTop = chatBox.scrollHeight;  // Scroll to the bottom

        theNLPBox.innerHTML = ''
        setTimeout(load_NLP_reply,1000)
    }

    function load_NLP_reply() {
        

        theNLPBox.innerHTML = 'message received ...'
    }

}

document.addEventListener('DOMContentLoaded', function() {

    load_data()
    chat_with_NLP()

});