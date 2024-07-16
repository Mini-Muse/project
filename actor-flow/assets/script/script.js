// const API_actionflow = 'https://minimuse.nlp.idsia.ch/actionflows'
const API_actionflow = 'https://minimuse.nlp.idsia.ch/api/actionflows?skip=0&limit=1000' // 50 100 400 1000
// const API_actionflow = '../assets/data/data_.json'

const API_document = 'https://minimuse.nlp.idsia.ch/api/documents'

let raw_data
let actionflows_array
let actor_per_article

let startDate
let endDate

async function load_data(){

    // const title_box = document.getElementById('articles_box');
    const actors_box = document.getElementById('actors_box');
    const articles_count_box = document.getElementById('articles_count');
    const articles_actions_box = document.getElementById('articles_actions');
    let output = ''
    let the_data;

    let data;

    const headers = new Headers();
    headers.set('Authorization', 'Basic ' + btoa(user + ':' + pass));

    // await fetch(API_actionflow)
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
        data = json
        raw_data = json
        console.log(data)

        // group objects by actor name
        const actionflows = data.reduce((acc, obj) => {
            const actorName = obj.result.actor.Name
            if (!acc[actorName]) {
                acc[actorName] = [];
            }
            acc[actorName].push(obj);
            return acc;
        }, []);
        actionflows_array = Object.values(actionflows);

        // actionflows_array.filter(item => event.result.date.Name > 1600)

        // fix null date
        actionflows_array.forEach(item => {
            item.forEach(event => {

                // if (event.result.date.Name){
                //     console.log(event.result.date.Name)
                // }

                // console.log(event.result.date.Name)
                if (!event.result.date) {

                    let date_ = event.result.actor.Name
                    if (date_.includes('1939')){
                        date = '1939-01-01'
                        event.result.null_date = false
                    }
                    else if (date_.includes('1890')){
                        date = '1890-01-01'
                        event.result.null_date = false
                    }
                    else {
                        date = random_date()
                        event.result.null_date = true
                    }
                    
                    event.result.date = date
                }
            })
        })

        display_timeline(actionflows_array,'actors_box','all','name')

        filter_data()
        sort_data()
    })
    .catch(error => {
        console.error('There was a problem with the fetch operation:', error);

        remove_modal(false)

        result_box = document.getElementById('result_box')
        result_box.innerHTML = 'The credentials are incorrect'

        error_message(actors_box)
    });
}

function display_timeline(data, container, filter, sort){
    // console.log(filter,sort)

    let filteredArray
    if (filter == 'all') {
        filteredArray = data
    }
    else {
        if (filter == 'MISC'){
            filteredArray = data.map(subArray => subArray
                .filter(obj => obj.result.actorType[0] === "MISC")
            )
            .filter(subArray => subArray.length > 0)
        }
        else if (filter == 'PER'){
            filteredArray = data.map(subArray => subArray
                .filter(obj => obj.result.actorType[0] === "PER")
            )
            .filter(subArray => subArray.length > 0)
        }
        else if (filter == 'ORG'){
            filteredArray = data.map(subArray => subArray
                .filter(obj => obj.result.actorType[0] === "ORG")
            )
            .filter(subArray => subArray.length > 0)
        }
        else if (filter == 'DATE'){
            filteredArray = data.map(subArray => subArray
                .filter(obj => obj.result.actorType[0] === "DATE")
            )
            .filter(subArray => subArray.length > 0)
        }
        else if (filter == 'LOC'){
            filteredArray = data.map(subArray => subArray
                .filter(obj => obj.result.actorType[0] === "LOC")
            )
            .filter(subArray => subArray.length > 0)
        }
    }
    // console.log(filteredArray)

    // display some data in the console
    // ----------------------------------------------
    let count_actions = {}
    filteredArray.forEach(item => {
        item.forEach(event => {
            let action = event.result.action.Name
            let category = get_action_category(action)

            if (category == ''){
                if (count_actions[action]) {
                    count_actions[action]++;
                } 
                else {
                    count_actions[action] = 1;
                }
                // console.log(action, ' > ',category)
            }
        })
    })
    // console.log(count_actions)

    // sort 
    const sort_authors = (a, b) => {
        const nameA = a[0].result.actor.Name.toUpperCase();
        const nameB = b[0].result.actor.Name.toUpperCase();

        if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }
        return 0;
    };

    const sort_date = (a, b) => {
        // console.log(a[0].result.date)

        const dateA = new Date(a[0].result.date);
        const dateB = new Date(b[0].result.date);

        return dateA - dateB;
    };

    const sort_action = (a, b) => {
        return b.length - a.length;
    }

    if (sort == 'name'){
        data = filteredArray.sort(sort_authors);
    }
    else if (sort == 'actions'){ // number of action
        data = filteredArray.sort(sort_action);
    }
    else {
        data = filteredArray.sort(sort_date);
    }

    get_statistics(filteredArray) 

    let all_actions = 0

    let box_w;
    let box_h; 

    // get start and end date ---------------
    startDate = fix_date('1800-01-01') //fix_date(data[0][0].date.value);
    endDate = startDate 

    // set an array of actors per article
    // actor_per_article = get_actors_per_article(data)

    filteredArray.forEach(item => {

        item.forEach(event => {

            all_actions += 1
            date = event.result.date

            if (event.result.date.Name) {
                if (fix_date(event.result.date.Name) < startDate ) {
                    startDate = fix_date(event.result.date.Name);
                }
                if (fix_date(event.result.date.Name) > endDate ) {
                    endDate = fix_date(event.result.date.Name);
                }  
                // console.log(startDate,endDate)
            }

            if (!event.result.date.Name){
                if (fix_date(date) < startDate ) {
                    startDate = fix_date(date);
                }
                if (fix_date(date) > endDate ) {
                    endDate = fix_date(date);
                }  
            }
        })
    });
    // console.log(startDate,endDate)
    // console.log(filteredArray)

    let xScale; 

    // display data
    filteredArray.forEach((item,i) => {

        let the_container = d3.select('#' + container)

        // list background
        let list_item = the_container.append('li')
            .attr('id',function (d,i) {
                let name_ = item[0].result.actor.Name
                let name = name_.replace(' ','_')
                return 'actor_id_' + name
            })
            .attr('class',function (d,i) {
                bg = ''
                if (i % 2 == 0) {
                    bg = 'bg'
                }
                return bg
            })

        // actor box ---------------

        let article_box = list_item.append('div')
            .attr('class','actor_row')

        let actor_name_box = article_box.append('div')
            .attr('id','actor_name_box')
            .append('div')
            
        let actor_name =  actor_name_box.append('p')
            .text(function(d){
                return item[0].result.actor.Name
            })
            .attr('class','actor_name')
            
        let actor_role = actor_name_box.append('p')
            .text(function(d){
                return item[0].result.actorType // '<actor role>' //
            })
            .attr('class','actor_name_role')

        // timeline box ---------------
        
        let timeline_box_ = article_box.append('div')
            .attr('id',function(d){
                return 'timeline_' + i
            })
            .attr('class','actor_timeline')

        // timeline ---------------

        // console.log(i)
        make_timeline(item,'timeline_' + i,startDate,endDate,tick_size_large,action_width_large)

        // details ---------------

        let action_box = article_box.append("div")
            .attr("id", function(d){
                let name = item[0].result.actor.Name
                let actor_name = name.replace(' ','_')

                id = actor_name // item[0].result.actor.Id //action.Id
                return "info_box_" + id
            }) 
            .attr("class","info_box")

        let open_box = article_box.append("div")
            .attr("id", function (d) {
                name = item[0].result.actor.Name
                // id_ = item[0].result.actor.Id
                id = name.replace(' ','_')

                return "open_box_" + id
            })
            .attr("class","open_box")
            .attr("data-open","false")
            .attr("data-actor", function(d){
                // actor = item[0].result.actor.Name
                let name = item[0].result.actor.Name
                let actor_name = name.replace(' ','_')

                return name
            })
            .append("p")
            .attr("id", function (d) {
                // id = item[0].result.actor.Id
                let name = item[0].result.actor.Name
                let actor_name = name.replace(' ','_')

                return 'open_box_icon_' + actor_name
            })
            .attr("class","arrow_box")
            .text("↓")
    });

    overall_timeline('overall_timeline',startDate,endDate)

    timeline_labels();
    get_articles(data);
}

function get_articles(data){
    // console.log(data)

    open_boxes = document.getElementsByClassName("open_box");

    // open lists
    for (let item = 0; item < open_boxes.length; item++) {
        open_boxes[item].addEventListener("click",function(e) {
            // console.log(open_boxes[item])

            open = open_boxes[item].getAttribute('data-open')
            the_actor_name = open_boxes[item].getAttribute('data-actor')

            the_id = open_boxes[item].id
            id = the_id.replace('open_box_','')
            the_actor_id = the_id.replace('open_box_','')

            if (open == 'false'){
                if (document.getElementById('the_box_' + id)){
                    the_box = document.getElementById('the_box_' + id)
                    the_box.style.display = 'block'
                }

                display_articles(the_actor_id)

                open_boxes[item].setAttribute('data-open','true')
                // console.log(the_actor_id)

                switch_arrow(id,'true')
            }
            else {
                if (document.getElementById('the_box_' + id)){
                    the_box = document.getElementById('the_box_' + id)
                    the_box.style.display = 'none'
                }
                open_boxes[item].setAttribute('data-open','false')

                switch_arrow(id,'false')
            }
        })
    }

    function switch_arrow(id,open){
        my_arrow = document.getElementById('open_box_icon_' + id)

        if (open == 'false'){
            my_arrow.innerHTML = '&darr;'
        }
        else {
            my_arrow.innerHTML = '&uarr;'
        }
    }

    function display_articles(actor_id){
        // console.log(actor_id)
        // console.log(data)

        // actor_id = actor_id //parseInt(actor_id)

        // filter articles by actor id
        const documentsRelatedToActorId = data.flatMap(innerList => 
            innerList.filter(obj => {
                let check_name_ = obj.result.actor.Name
                let check_name = check_name_.replace(' ', '_')
                // console.log(check_name, actor_id)

                return check_name.toLowerCase() == actor_id.toLowerCase()
            }) // actor_id
        );
        // console.log(documentsRelatedToActorId)

        // get documents id and filter out duplicate documents
        // const documentsData = documentsRelatedToActorId.map(item => {
        //     return data.filter(subArray => 
        //         subArray.some(item => item.result.articleID === actor_id)
        //     );
        // });
        const uniqueDocumentIds = [...new Set(documentsRelatedToActorId)];
        // console.log(documentsData)

        // const all_actors = data
        //     // .filter(item => item.actor.actor_id != actor_id) // filter out actor with actor_id == something
        //     .map(item => item.actor) // extract actor objects
        //     .filter((actor, index, self) => self.findIndex(a => a.actor_id === actor.actor_id) === index); // Filter unique actors based on actor_id
        // // console.log(all_actors)

        async function callApisAndGetJson(uniqueDocumentIds) {
            // console.log(uniqueDocumentIds)

            const doc_id = uniqueDocumentIds.map(result => result.result.articleID);
            const actor_id = uniqueDocumentIds.map(result => result.result.actor.Name);
            // console.log(actor_id)

            const API_document_id = API_document // + doc_id

            const headers = new Headers();
            headers.set('Authorization', 'Basic ' + btoa(user + ':' + pass));

            let single_document
            let results 

            await fetch(API_document_id, {
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
                all_documents = json
                // console.log(all_documents)

                const single_document = all_documents.filter(article => {
                    // console.log(doc_id, article.article.Id)
                    return doc_id.includes(article.article.Id)
                });
                single_document[0].actors = actor_id
                // console.log(single_document)

                show_articles(single_document,actor_id)
            }) 
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            })
        }

        callApisAndGetJson(uniqueDocumentIds)
    }
}

function show_articles(data,actor_id) {
    // console.log(data,actor_id)
    
    article_boxes = document.querySelectorAll(".article_boxes");

    if (article_boxes){
        article_boxes.forEach(div => {
            if (div.id == 'the_box_' + id) {
                div.remove()
            }
        });
    }

    let output = ''
    let new_html = document.createElement('div');
    new_html.id = 'the_box_' + id;
    new_html.classList.add('article_boxes');
    
    const actor_line = document.getElementById('actor_id_' + id);

    // console.log(actor_per_article)
    for (let item = 0; item < data.length; item++) {
        let article = data[item].article
        // console.log(article)
        
        the_other_actors = ''

        const list_actors_ = data[item].actors
        const list_actors = [...new Set(list_actors_)];
        // console.log(data[item])
        // list_actors = data[item].filter((obj) => {
        //     // console.log(obj)
        //     // the_actor.actor_id != actor_id
        // })
        // console.log(list_actors)

        // add commas
        for (let i = 0; i < list_actors.length; i++) {
            the_other_actors += '<span class="actor_chips">' + list_actors[i] + '</span>'
        }
        
        let title = article.title
        let link = '#'
        let author = article.Author
        let date = 0
        let year = article.VolumeYearOfPublication
        let issue = article.IssueNumber
        let doc_id = article.DocumentId
        // console.log(data[item])

        output += '<div class="article_row">'

        output += '<div class="article_info">'
            output += '<div class="meta">'
            output += '<p><a href="' + link + '">' + title + '</a></p> '
            output += '<p>'
                output += '<span>by ' + author.replace(',',' ') + '</span>, '
                output += '<span>' + year + ', issue ' + issue + '</span>'
            output += '</p>'
            output += '</div>'
            
            output += '<div class="meta">'
            if (list_actors.length > 0){
                output += '<p>actors</p>'

                output += '<div class="other_actors_container">'
                output += the_other_actors
                output += '</div>'
            }
            output += '</div>'

        output += '</div>'

        output += '<div class="article_timeline" id="article_timeline_' + id + '_' + doc_id + '"></div>'
        
        output += '<div class="empty_article_row"></div>'
        //output += '<div class="go_to_article"></div>' //<a href="' + link + '" style="color: gray">&rarr;</a></div>'

        output += '</div>'

        new_html.innerHTML = output
        actor_line.append(new_html)
    }
    // console.log(other_actors)

    // await the timeline box loading
    for (let item = 0; item < data.length; item++) {
        // console.log(data[item])

        let doc_id = data[item].article.DocumentId
        const the_container = 'article_timeline_' + id + '_' + doc_id
        
        let id_ = id.toLowerCase()

        let individual_timeline_data = actionflows_array.filter(item => {
            console.log(item)
            return item.result.articleID == doc_id && item.result.actor.Name.toLowerCase() == id_
        }); // item.result.actor.Name.toLowerCase() === id_
        console.log(individual_timeline_data)

        // let individual_timeline_data = actionflows_array.filter(subArray => {
        //     // console.log()
        //     subArray.filter(obj => {
        //         console.log(obj)
        //         return obj.result
        //     //     return /*item.result.actor && item.result.actor.Name == id_ && */ item.result.articleID == doc_id
        //     })
        // });


        // const individual_timeline_data = actionflows_array.filter(inner => {
        // actionflows_array.map(item => console.log(item.result)) 
        //     inner.filter(obj => obj.result.actor.Name.toLowerCase() == 'abstimmungstexte')
        //     console.log(id_)
        //     // inner.filter(obj => {
        //     //     name_ = obj.result.actor.Name.toLowerCase()
        //     //     console.log(obj)
        //     //     // console.log(name_, id_)
                
        //     //     return name_ === id_ // && obj.result.articleID === doc_id
        //     // })

        // })

        make_timeline(individual_timeline_data,the_container,startDate,endDate,tick_size_small,action_width_large)

        // (individual_timeline_data,the_container,startDate,endDate,tick_size,action_width)

    }
}

function sort_data(){
    const the_sort = document.getElementById('the_sort');
    const the_filter = document.getElementById('the_filter'); //.options[e.selectedIndex].text;
    
    timelines = document.getElementById('actors_box')
    ov_timeline = document.getElementById('overall_timeline')

    the_sort.addEventListener('change', (event) => {
        const sort = event.target.value;
        filter = the_filter.value

        timelines.innerHTML = ''
        ov_timeline.innerHTML = ''

        display_timeline(actionflows_array,'actors_box',filter,sort)
        // console.log(sort,filter)
    });
}

function filter_data(){
    const the_sort = document.getElementById('the_sort');
    const the_filter = document.getElementById('the_filter');


    timelines = document.getElementById('actors_box')
    ov_timeline = document.getElementById('overall_timeline')

    the_filter.addEventListener('change', (event) => {
        const filter = event.target.value;
        sort = the_sort.value

        timelines.innerHTML = ''
        ov_timeline.innerHTML = ''
        
        display_timeline(actionflows_array,'actors_box',filter,sort)
        // console.log(sort,filter)
    })

}

async function fetch_credentials(){

    await fetch(API_actionflow, {
        method: 'GET',
        withCredentials: true,
        headers: headers
        // credentials: 'include',
    }) 
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json(); 
    })
    .then(json => {
        console.log(json)
    })

    // load_data()
}

document.addEventListener('DOMContentLoaded', function() {

    access_window()

    menu()

});
