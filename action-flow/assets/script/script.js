// const API_actionflow = 'https://minimuse.nlp.idsia.ch/actionflows'
const API_actionflow = 'https://minimuse.nlp.idsia.ch/api/actionflows?skip=0&limit=1500' // 50 100 400 1000
// const API_actionflow = '../assets/data/data_.json'

const API_document = 'https://minimuse.nlp.idsia.ch/api/documents'

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

    waiting_message('actors_box')

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

        data = filter_raw_actions(data)
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
        // console.log(actionflows)

        // gather the completeness of the results
        // -----------------------------------------------

        let total_completeness = {};
        let total_actions = {};
        actionflows_array.forEach(subArray => {
            let actions = 0

            subArray.forEach(item => {
                actions++

                let result = item.result
                // let articleID = result.articleID
                let actor_id = result.actor.Name
                let complete = completeness(result)
                
                if (total_actions[actor_id]) {
                    total_actions[actor_id] += actions;
                } else {
                    total_actions[actor_id] = actions;
                }

                if (total_completeness[actor_id]) {
                    total_completeness[actor_id] += complete
                } else {
                    total_completeness[actor_id] = complete
                }
            })
        })

        actionflows_array.forEach(subArray => {
            subArray.forEach(item => {
                // let comp = completeness(item.result)
                let articleID = item.result.articleID
                let actor_id = item.result.actor.Name
                let the_completeness = total_completeness[actor_id] * 100 / (total_actions[actor_id] * 2)
                // console.log(the_completeness)
                // console.log(item.result.actor.Name, total_actions[actor_id] * 2, total_completeness[actor_id])

                item.result.completeness = the_completeness
            })
        });
        // console.log(actionflows_array)

        display_timeline(actionflows_array,'actors_box','all','name')
        filter_data()
        sort_data()

        // get the list of actors for the search bar, and remove duplicates
        const actors_list_ = actionflows_array.flatMap(innerArray => innerArray.map(item => item.result.actor?.Name)).filter(name => name);
        const actors_list = [...new Set(actors_list_)]
        
        search_box(actionflows_array,actors_list)
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

    // remove placeholders
    document.getElementById(container).innerHTML = ''

    let filteredArray
    if (filter == 'all') {
        filteredArray = data
    }
    else {
        if (filter == 'PER'){
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

    // sort 
    // ---------------------------------
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

    // sort by date
    function parseDate(date_value) {
        date = null

        if (date_value.Name){
            let dx = small_fix_date(date_value.Name)
            
            if (containsOnlyDigits(dx) == true) { // )

                // remove outliers 
                if (dx < 2050 && dx.includes(' ') == false) {
                    d1 = parseInt(dx)

                    date_ = fix_date(d1)
                    date = new Date(date_)
                }
            }
            else {
                if (dx.includes('/') == true){
                    date_ = dx.split('/')[0]
                    date = new Date(date_)
                }
                else if (dx.includes('-') == true){
                    date_ = dx.split('-')[0]
                    date = new Date(date_)
                }
                else if (dx.includes(' ') == true){
                    date_ = dx.split(' ')[0]
                    date = new Date(date_)
                }
            }
        }
        return date;
    }

    const sort_date = (a, b) => {
        const dateA = parseDate(a[0].result.date)
        const dateB = parseDate(b[0].result.date)
        return dateB - dateA;
    };

    const sort_action = (a, b) => {
        return b.length - a.length;
    }

    const sort_completness = (a, b) => {
        return b[0].result.completeness - a[0].result.completeness;
    }

    if (sort == 'name'){
        sorted_filtered_data = filteredArray.sort(sort_authors);
    }
    else if (sort == 'actions'){ // number of action
        sorted_filtered_data = filteredArray.sort(sort_action);
    }
    else if (sort == 'completness'){ // completness of the results
        sorted_filtered_data = filteredArray.sort(sort_completness);
    }
    else if (sort == 'date') {
        sorted_filtered_data = filteredArray.sort(sort_date);
    }

    get_statistics(sorted_filtered_data) 
    overall_timeline('overall_timeline',get_timespan(filteredArray)[0],get_timespan(filteredArray)[1])
    // console.log(get_timespan(filteredArray)[0],get_timespan(filteredArray)[1])
    
    startDate = get_timespan(data)[0]
    endDate = get_timespan(data)[1]

    let box_w;
    let box_h;
    let xScale; 

    // display some data in the console
    // ----------------------------------------------

    let count_actions = {}
    sorted_filtered_data.forEach(item => {
        item.forEach(event => {
            let actor_name = event.result.actor.Name
            let action = event.result.action.Name
            let category = get_action_category(action)
            let completeness = event.result.completeness
            // console.log(fix_date(event.result.date.Name), actor_name)
        })
    })

    // display data
    sorted_filtered_data.forEach((item,i) => {

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
                let role_ = item[0].result.actorType
                let role = actor_type(role_)
                return role
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
                id = name.replace(' ','_')

                return "open_box_" + id
            })
            .attr("class","open_box")
            .attr("data-open","false")
            .attr("data-actor", function(d){
                let name = item[0].result.actor.Name
                let actor_name = name.replace(' ','_')
                return name
            })
            .append("p")
            .attr("id", function (d) {
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

        const uniqueDocumentIds = [...new Set(documentsRelatedToActorId)];

        async function callApisAndGetJson(uniqueDocumentIds) {
            // console.log(uniqueDocumentIds)

            const doc_id_ = uniqueDocumentIds.map(result => result.result.articleID);
            const actor_id = uniqueDocumentIds.map(result => result.result.actor.Name);

            const API_document_id = API_document 

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
                console.log(all_documents)

                const single_document = all_documents.filter(article => {
                    return doc_id_.includes(article.article.CId)
                });
                show_articles(single_document,actor_id[0])
            }) 
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            })
        }
        callApisAndGetJson(uniqueDocumentIds)
    }
}

function show_articles(data,actor) {
    // console.log(data,actor)
    
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

    // display aticle data
    // ----------------------------------
    for (let item = 0; item < data.length; item++) {
        let article = data[item].article
        console.log(article)

        the_doc_id = article.CId
        
        // get all actors
        let all_actors = sorted_filtered_data.map(subArray => subArray
            .filter(obj => obj.result.articleID === the_doc_id)
        )
        all_actors = all_actors.filter(element => element.length > 0)
        // console.log(all_actors)

        // get unique actors
        let unique_actors__ = all_actors
            .map(element => element[0].result.actor.Name)
            .filter(name => name) 
            .reduce((uniqueNames, name) => {
                uniqueNames.add(name);
                return uniqueNames;
            }, new Set());

        unique_actors_ = Array.from(unique_actors__)

        // remove the selected actor
        unique_actors = unique_actors_.filter(item => item !== actor)

        // add chips
        the_actors = ''
        for (let i = 0; i < unique_actors.length; i++) {
            the_actors += '<span class="actor_chips">' + unique_actors[i] + '</span>'
        }
        
        let title = article.Title
        let link = '#'
        let author = article.Author
        let date = 0
        let year = article.VolumeYearOfPublication
        let issue = article.IssueNumber
        let doc_id = article.CId
        // console.log(data[item])

        output += '<div class="article_row">'

        output += '<div class="article_info">'
            output += '<div class="meta">'
            output += '<p><a href="' + link + '">' + title + '</a></p> '
            output += '<p>'
                output += '<span>by ' + author.replace(',',' ') + '</span>, '
                output += '<span>' + year + ', issue n. ' + issue + '</span>'
            output += '</p>'
            output += '</div>'
            
            output += '<div class="meta">'
            // console.log(all_actors)
            if (all_actors.length > 1){
                output += '<p class="small_label">other historical entities</p>'

                output += '<div class="other_actors_container">'
                output += the_actors
                output += '</div>'
            }
            output += '</div>'

        output += '</div>'

        output += '<div class="article_timeline" id="article_timeline_' + id + '_' + doc_id.replace('"','_x_') + '"></div>'
        
        output += '<div class="all_actions_row" id="detail_timeline_' + id + '_' + doc_id.replace('"','_x_') + '"></div>'
        //output += '<div class="go_to_article"></div>' //<a href="' + link + '" style="color: gray">&rarr;</a></div>'

        output += '</div>'

        new_html.innerHTML = output
        actor_line.append(new_html)
    }
    // console.log(other_actors)

    // await the timeline box loading
    for (let item = 0; item < data.length; item++) {
        // console.log(data[item])

        let doc_id = data[item].article.CId
        const the_container = 'article_timeline_' + id + '_' + doc_id.replace('"','_x_')
        // console.log(doc_id)

        const individual_timeline_data = actionflows_array.map(innerArray => {
            return innerArray.filter(item => item.result.articleID == doc_id && item.result.actor.Name == actor)
        })
        .filter(innerArray => innerArray.length > 0)
        // console.log(individual_timeline_data)

        let actions_box = document.getElementById('detail_timeline_' + id + '_' + doc_id.replace('"','_x_') )
        console.log(doc_id.replace('"','_x_'))

        // display all actor action in an article
        output_actions = ''
        for (let i = 0; i < individual_timeline_data.length; i++) {
            let actions = individual_timeline_data[i]

            output_actions = '<p class="small_label all_actions">' + actor + ': actions</p>'

            for (let i = 0; i < actions.length; i++) {
                let action = actions[i].result
                // console.log(action)

                let act_color = get_color(get_action_category(action.action.Name))
                let the_action = '<span class="action_cat" style="background-color:' + act_color + '">' + action.action.Name + '</span>'
                
                let date = '<tr><td>date</td><td>' + action.date.Name + '</td></tr>'

                if (action.location && action.location.Name){
                    loc = '<tr><td>location</td><td>' + action.location.Name + '</td></tr>'
                }
                else {
                    loc = '<tr><td>location</td><td>' + '-' + '</td></tr>'
                }

                let key = '<tr><td>keywords</td>'
                if (action.actionDetails.length > 0 ){
                    let keys = action.actionDetails
                    let count  = 0 

                    key += '<td>'
                    keys.forEach(item => {

                        if (keys.length-1 != count){
                            key += item.Name  + ' | '
                        }
                        else {
                            key += item.Name
                        }
                        count++
                    })
                    key += '</td></tr>'
                }
                else {
                    key += '<td>' + '-' + '</td></tr>'
                }

                output_actions += '<div class="single_action_row">'
                output_actions += the_action

                output_actions += '<table class="action_metadata">'
                output_actions += date
                output_actions += loc
                output_actions += key
                output_actions += '</table>'

                output_actions += '</div>'
            }
        }

        actions_box.innerHTML = output_actions

        make_timeline(individual_timeline_data[0],the_container,startDate,endDate,tick_size_small,action_width_large)
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
}

function search_box(actionflows_array,actors_list){
    // console.log(actors_list)

    const search_input = document.getElementById('search_input')
    const autocompleteList = document.getElementById('autocomplete_list');
    const search_button = document.getElementById('search_button')

    // autocomplete search
    search_input.addEventListener('input', function() {

        const query = this.value.toLowerCase();
        
        // Clear previous autocomplete items
        autocompleteList.innerHTML = '';

        if (query) {
            const filteredData = actors_list.filter(item => item.toLowerCase().includes(query));
            
            if (filteredData.length) {
                filteredData.forEach(item => {
                    const itemDiv = document.createElement('div');
                    itemDiv.textContent = item;
                    
                    // Add click event to select the item
                    itemDiv.addEventListener('click', function() {
                        search_input.value = item;
                        autocompleteList.innerHTML = '';  // Clear the list
                    });

                    autocompleteList.appendChild(itemDiv);
                });
            }
        }
    });

    // search button
    search_button.addEventListener('click', function() {
        if (search_input.value != '') {

            const query = search_input.value.toLowerCase();

            const action_flow = actionflows_array.filter(element => {
                const result = element[0]?.result;
                return result?.actor?.Name.toLowerCase() === query;
            });

            display_timeline(action_flow,'actors_box','all','name')
        }
        else {
            display_timeline(actionflows_array,'actors_box','all','name')
        }
    })

    // Close the autocomplete list if the user clicks outside of it
    document.addEventListener('click', function(e) {
        const autocompleteList = document.getElementById('autocomplete_list');
        if (e.target !== document.getElementById('search_input')) {
            autocompleteList.innerHTML = '';
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {

    access_window()

    menu()

});
