const documents_API = 'https://minimuse.nlp.idsia.ch/api/documents' // ?limit=50
// const API_actionflow = 'https://minimuse.nlp.idsia.ch/actionflows'
const API_actionflow = 'https://minimuse.nlp.idsia.ch/api/actionflows?skip=0&limit=200' // 1000 200
// const API_actionflow =  '../assets/data/data_.json'

const NLP_algorithm = 'https://minimuse.nlp.idsia.ch/api/chat-document?documentId='

let documents_data; 
let documentflows_array;
let actor_data;
let reply_data;
let container;

let articles_box;

let count_prompts = 0;

let date_a
let date_b 
let startDate
let endDate

async function load_data(){

    const title_box = document.getElementById('articles_box');
    const articles_count_box = document.getElementById('articles_count');
    const articles_actions_box = document.getElementById('articles_actions');

    let output = ''
    let the_data;

    let data;

    const headers = new Headers();
    headers.set('Authorization', 'Basic ' + btoa(user + ':' + pass));

    // documents
    await fetch(documents_API, {
        method: 'GET',
        withCredentials: true,
        headers: headers
        // credentials: 'include'
    }) 
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        if (response.status == 200) {
            credentials = user + ',' + pass
            set_coockie('access',credentials)
            // remove_modal(true)
        }

        return response.json(); 
    })
    .then(json => {
        documents_data = json
    })
    .catch(error => {
        console.error('There was a problem with the document fetch operation:', error);

        error_message(main)
    });

    // actors
    await fetch(API_actionflow, {
        method: 'GET',
        withCredentials: true,
        headers: headers
        // credentials: 'include'
    }) 
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        if (response.status == 200) {
            credentials = user + ',' + pass
            set_coockie('access',credentials)
            remove_modal(true)
        }

        return response.json(); 
    })
    .then(json => {
        actor_data = json
        // console.log(actor_data)

        // group objects by actor name
        const actionflows = actor_data.reduce((acc, obj) => {
            const actorName = obj.result.actor.Name
            // console.log(obj.result)
            if (!acc[actorName]) {
                acc[actorName] = [];
            }
            acc[actorName].push(obj);
            return acc;
        }, []);
        actionflows_array = Object.values(actionflows);
        // console.log(actionflows_array)

        // // fix null date
        actionflows_array.forEach(item => {
            item.forEach(event => {
                // console.log(event.result.date)
                if (!event.result.date) {
                    year = getRandom(1900, 1980)
                    mont = getRandom(1, 12)
                    day_ = getRandom(1, 27)

                    event.result.date = year + '-' + mont + '-' + day_
                    date = year + '-' + mont + '-' + day_

                    event.result.null_date = true
                }
            })
        })

        // group objects by document id
        const documentflows = actor_data.reduce((acc, obj) => {
            const documentId = obj.result.articleID;
            if (!acc[documentId]) {
                acc[documentId] = [];
            }
            acc[documentId].push(obj);
            return acc;
        }, []);
        documentflows_array = Object.values(documentflows);
        // console.log(documentflows_array)

        build_page()

        list_articles(documents_data, documentflows_array, 'date')
        load_article_info(documents_data)
        get_statistics(actionflows_array)   

        chat_with_NLP()
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);

        // result_box = document.getElementById('result_box')
        // result_box.innerHTML = 'The credentials are incorrect'

        // error_message(actors_box)
    });
}

function build_page(){

    container = document.getElementById('main');

    // column articles
    // --------------------
    articles_box = document.createElement("div");
    articles_box.id = 'articles_box';
    container.appendChild(articles_box)

    // column single article
    // --------------------

    // selected article
    const article_box = document.createElement("div");
    article_box.id = 'the_article_box';

    const article_info_box = document.createElement("div");
    article_info_box.id = 'article_info_box';

    article_box.appendChild(article_info_box)
    container.appendChild(article_box)

    // prompt
    const prompt_box = document.createElement("div");
    prompt_box.id = 'chat';

    const input_box = document.createElement("div");
    input_box.id = 'input_box';

    let output = ''
    const input = '<input type="text" id="chat_input" placeholder="Ask a question about the selected article ..." /><button id="send_button">➔</button>'

    article_box.appendChild(prompt_box)

    article_box.appendChild(input_box)
    input_box.innerHTML = input
}

function list_articles(article_data, documentflows_array, sort){
    console.log(article_data)
    console.log(documentflows_array)

    let sorted_article_data

    const sort_date = (a, b) => {
        const dateA = new Date(parseInt(a.article.VolumeYearOfPublication));
        const dateB = new Date(parseInt(b.article.VolumeYearOfPublication));

        return dateB - dateA;
    };

    const sort_author = (a, b) => {
        const nameA = a.article.Author;
        const nameB = b.article.Author;

        if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }
        return 0;
    };

    if (sort == 'date'){
        sorted_article_data = article_data.sort(sort_date);
    }
    else {
        sorted_article_data = article_data.sort(sort_author);
    }

    articles_box.innerHTML = ''

    let output = ''

    // for (let x = 0; x <= 100; x++){
    sorted_article_data.forEach((item,i) => {
        // console.log(item)

        const article = item.article
        const document_id = article.Id //.DocumentId

        output += '<div class="article_box" data-id="' + i + '"data-doc="' + document_id + '">'
        
        output += '<div class="the_meta">'
            output += '<div>'
            output += '<span class="article_title">' + article.title + '</span><br/>'
            output += '<span class="article_author">by ' + article.Author + ', </span>'
            output += '<span class="article_date">' + article.VolumeYearOfPublication + '</span>'
            output += '</div>'
        output += '</div>'

        output += '<div class="the_timeline">'
            output += '<div id="the_timeline_' + document_id + '"></div>'
        output += '</div>'

        output += '<div class="the_arrow">'
        output += '&rarr;'
        output += '</div>'

        output += '</div>'  
    })
    // }

    articles_box.innerHTML = output

    let startDate = fix_date(documentflows_array[0][0].result.date) 
    let endDate = startDate 
    // console.log(startDate)

    year_a = parseInt(startDate.toString().slice(0, 4)) 
    year_b = parseInt(endDate.toString().slice(0, 4))

    date_a = (year_a - shift).toString() + '-01-01'
    date_b = (year_b + shift).toString() + '-01-01'

    documentflows_array.forEach(item => {
        item.forEach(event => {
            date = event.result.date
            // console.log(date)

            if (fix_date(date) < startDate ) {
                startDate = date;
            }
            if (fix_date(date) > endDate ) {
                endDate = date;
            }
        })
    });
    // console.log(startDate,endDate)

    sorted_article_data.forEach(item => {
        // console.log(documentflows_array)
        const document_id = item.article.Id //DocumentId
        
        let filteredArray = documentflows_array.flatMap(innerArray =>
            innerArray.filter(item => item.result.articleID === document_id)
        );
        // console.log(filteredArray)
 
        make_timeline(filteredArray,'the_timeline_' + document_id,startDate,endDate,tick_size_large,action_width_very_small)
    })

    load_article_info(sorted_article_data)
    overall_timeline('overall_timeline',startDate,endDate)
}

function load_article_info(data){
    // console.log(data)

    let id = data[0].document_id

    const article_item = document.querySelectorAll('.article_box')

    article_item.forEach(item => {
        item.addEventListener('click', function() {
            document_id = item.getAttribute('data-doc')

            display_info(document_id)

            count_prompts = 0;
            chat_with_NLP()
        })
    })

    function display_info(id){
        // console.log(id)

        let output = ''

        article_item.forEach(item => {
            item.classList.remove('selected');
            if (item.getAttribute('data-doc') == id){
               item.classList.add('selected') 
            }
        })

        // list all actors in the same article id
        const all_act_doc = actor_data.filter((item) => item.result.articleID === id)

        // list unique actors
        const list_actors = all_act_doc.map(item => item.result.actor.Name);
        const unique_actors = [...new Set(list_actors)];
        // console.log(unique_actors)

        unique_actors.sort((a, b) => {
            return a.localeCompare(b);
        });

        let all_actors = ''
        for (let i = 0; i < unique_actors.length; i++) {
            actor = unique_actors[i]
            all_actors += '<span class="actor_chips">' + actor + '</span>'
        }

        documents_data.forEach(item => {
            let article = item.article
            // console.log(item)

            if (article.Id === id){

                output += '<div id="the_title">' + article.title + '</div>'

                output += '<div id="the_info">'
                output += '<span data-meta="author_name">'  + article.Author + '</span>, '
                output += '<span data-meta="publication_year">' + article.VolumeYearOfPublication + '</span><br/>'
                output += '<span data-meta="issue">issue ' + article.IssueNumber + '</span>'
                output += '</div>'

                output += '<div id="the_abstract" class="info_box">'
                output += '<h2>Abstract</h2>'
                output += '<p data-meta="summary">' + article.Summary + '</p>'
                output += '</div>'

                output += '<div class="meta" style="margin-top: 2rem;">'
                if (list_actors.length > 0){
                    output += '<p style="font-weight:bold;">Actors</strong></p>'
                    output += '<div class="all_actors_container">'
                    output += all_actors
                    output += '</div>'
                }
                else {
                    output += '<p>No actors detected</p>'
                }
                output += '</div>'

                output += '</div>'

                link = 'https://www.e-periodica.ch/digbib/view?pid=szg-006%3A2021%3A71%3A%3A273'
                output += '<div id="read" class="info_box"><a href="' + link + '" target="blank">Read the article ...</a></div>'
                // &#128279;
                // &#x1F517;

                document.getElementById('article_info_box').innerHTML = output
            }
        })

        document.getElementById('article_info_box').setAttribute('data-document',id)
    }

    let first_id = documents_data[0].article.Id
    display_info(first_id)
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

        // console.log(box_id, message)
        load_NLP_reply(box_id, message)
        // setTimeout(load_NLP_reply(box_id),100)
        // waitAndRun(load_NLP_reply, box_id, message)
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
        // messageReceived.textContent = 'question ' + count_prompts + ' about document ' + documentId + ' ...';

        the_messageSent = document.getElementById(box_id)
        the_messageSent.appendChild(messageReceived)

        const headers = new Headers();
        headers.set('Authorization', 'Basic ' + btoa(user + ':' + pass));
        
        let doc_id = 1 // documentId 
        get_NLP_reply(doc_id,query)

        async function get_NLP_reply(documentId,query){
            query_url = NLP_algorithm + documentId +'&query=' + query 

            await fetch(query_url, {
                method: 'GET',
                withCredentials: true,
                headers: headers
                // credentials: 'include'
            }) 
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json(); 
            })
            .then(json => {
                reply_data = json
                console.log(reply_data)

                response_message = reply_data.query

                messageReceived.textContent = response_message
            })
            .catch(error => {
                console.error('There was a problem with the prompt fetch operation:', error);

                messageReceived.textContent = 'Something was wrong. Please, try again later.'
            });
        }
    }
}

function sort_data(){
    
    const the_sort = document.getElementById('the_sort')

    the_sort.addEventListener('change', (event) => {
        const article_list = document.getElementById('articles_box')
        const sort = event.target.value;
        // console.log(sort)

        article_list.innerHTML = ''

        list_articles(documents_data, documentflows_array, sort)
    });
}

document.addEventListener('DOMContentLoaded', function() {

    // load_data()
    sort_data()

    menu()
    access_window()
    
});