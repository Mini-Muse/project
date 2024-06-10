const API_actionflow = 'assets/data/data_.json' // 'https://minimuse.nlp.idsia.ch/actionflows' 'assets/data/data.json'

const colors = [
    '#F0E3CB',
    '#C9DFE5',
    '#E0BBB6',
    '#BAB7DE',
    '#C1DDAB'
] 

const margin = [10,10,10,10]
const timeline_margin = [10,10,10,10]

const action_width = 10;

let raw_data;
let actionflows_array;

const tick_size_large = 120;
const tick_size_small = 60;

let parseDate = d3.timeParse("%Y-%m-%d"); // %Y

let year_a = 1900;
let year_b = 1900;

const shift = 2;

function get_color(value){
    const categoryColors = {
        "Wrote": "#efd295",
        "Edited": "#C9DFE5",
        "Order": "#E0BBB6"
    };

    if (categoryColors.hasOwnProperty(value)) {
        return categoryColors[value];
    } else {
        return "#000000";
    }
}

async function load_data(){

    const title_box = document.getElementById('articles_box');
    const articles_count_box = document.getElementById('articles_count');
    const articles_actions_box = document.getElementById('articles_actions');
    let output = ''
    let the_data;

    let data;

    await fetch(API_actionflow) 
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json(); 
    })
    .then(json => {
        data = json
        raw_data = json
        console.log(raw_data)
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
    actionflows_array = Object.values(actionflows);
    // console.log(actionflows_array)
    // sort
    // data.sort((a, b) => {
    //     return new Date(a.date.value) - new Date(b.date.value);
    // });
    // console.log(data)

    // actionflows_array.forEach(subArray => {
    //     subArray.sort((a, b) => a.actor.name.localeCompare(b.actor.name))  
    // })

    get_statistics(actionflows_array)   
    display_timeline(actionflows_array,'actors_box','name')

}

function display_timeline(data, container, sort){
    // console.log(data,container,sort)

    const sort_authors = (a, b) => {
        const nameA = a[0].actor.name.toUpperCase();
        const nameB = b[0].actor.name.toUpperCase();

        if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }
        return 0;
    };

    const sort_date = (a, b) => {
        const dateA = new Date(a[0].date.value);
        const dateB = new Date(b[0].date.value);

        return dateA - dateB;
    };

    if (sort == 'name'){
        data.sort(sort_authors);
    }
    else {
        data.sort(sort_date);
    }

    let all_actions = 0

    let box_w;
    let box_h; 

    // get start and end date ---------------
    let startDate = fix_date(data[0][0].date.value);
    let endDate = startDate 

    data.forEach(item => {
        item.forEach(event => {
            date = event.date.value

            all_actions += 1

            if (fix_date(date) < startDate ) {
                startDate = date;
            }
            if (fix_date(date) > endDate ) {
                endDate = date;
            }
        })
    });
    // console.log(startDate,endDate)

    let xScale; 

    // display data
    data.forEach((item,i) => {
        // console.log(item)

        let the_container = d3.select('#' + container)

        // list background
        let list_item = the_container.append('li')
            .attr('id',function (d,i) {
                return 'actor_id_' + item[0].actor.actor_id
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

        // let article_item = article_box.append('div')
        //     .attr('class','actor item')

        let actor_name_box = article_box.append('div')
            .attr('id','actor_name_box')
            .append('div')
            
        let actor_name =  actor_name_box.append('p')
            .text(function(d){
                return item[0].actor.name
            })
            .attr('class','actor_name')
            
        let actor_role = actor_name_box.append('p')
            .text(function(d){
                return item[0].actor.role
            })
            .attr('class','actor_name_role')

        // timeline box ---------------
        
        let timeline_box_ = article_box.append('div')
            .attr('id',function(d){
                return 'timeline_' + i
            })
            .attr('class','actor_timeline')

        // timeline ---------------

        make_timeline(item,'timeline_' + i,tick_size_large)

        // details ---------------

        let action_box = article_box.append("div")
            .attr("id", function(d){
                id = item[0].actor.actor_id
                return "info_box_" + id
            }) 
            .attr("class","info_box")

        let open_box = article_box.append("div")
            .attr("id", function (d) {
                id = item[0].actor.actor_id
                return "open_box_" + id
            })
            .attr("class","open_box")
            .attr("data-open","false")
            .append("p")
            .attr("id", function (d) {
                id = item[0].actor.actor_id
                return 'open_box_icon_' + id
            })
            .attr("class","arrow_box")
            .text("↓")

    });
    
    // overall timeline ---------------

    let overall_timeline = document.getElementById('overall_timeline')
    w_ = overall_timeline.offsetWidth;
    h_ = overall_timeline.offsetHeight;

    let overall_axis = d3.select("#overall_timeline")
        .append('svg')
        .attr("width",w_)
        .attr("height",h_ - 1) 

    let plot = overall_axis.append("g")

    let date_a = (year_a - shift).toString() + '-01-01'
    let date_b = (year_b + shift).toString() + '-01-01'
    // console.log(year_a,year_b)

    xScale = d3.scaleTime()
        .domain([parseDate(date_a), parseDate(date_b)]) // 1920 // "1750-01-01"
        .range([0, w_ - timeline_margin[1] - timeline_margin[3]] )

    let xAxis = d3.axisTop(xScale)
        .tickFormat(d3.timeFormat("%Y"))
        .ticks(10)
    
    let the_xAxis = plot.append("g")
        .attr("transform", 'translate(' + margin[0] +',20)')
        .attr("class","the_axis")
        .call(xAxis)

    timeline_labels();
    get_articles(raw_data);
}

function get_articles(data){
    // console.log(data)
    open_boxes = document.getElementsByClassName("open_box");

    // open lists
    for (let item = 0; item < open_boxes.length; item++) {
        open_boxes[item].addEventListener("click",function(e) {

            open = open_boxes[item].getAttribute('data-open')

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
        // console.log('open_box_icon_' + id)
        // console.log(my_arrow,id,open)

        if (open == 'false'){
            my_arrow.innerHTML = '&darr;'
        }
        else {
            my_arrow.innerHTML = '&uarr;'
        }
    }

    function display_articles(id){

        // filter articles by actor id
        const documentsRelatedToActorId = data.filter(item => {
            return item.actor.actor_id == id
        })

        const actorsInSameDocument = data
            .filter(item => item.actor.actor_id != id) // Filter out actor with actor_id 1
            .map(item => item.actor) // Extract actor objects
            .filter((actor, index, self) => self.findIndex(a => a.actor_id === actor.actor_id) === index); // Filter unique actors based on actor_id

        const documentsData = documentsRelatedToActorId.map(item => item.document);

        // Filter out duplicate objects based on document_id
        const uniqueDocumentIds = new Set();
        const uniqueDocuments = documentsData.filter(item => {
            if (uniqueDocumentIds.has(item.document_id)) {
                return false;
            } else {
                uniqueDocumentIds.add(item.document_id);
                return true;
            }
        });

        // display articles  ---------------

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

        for (let item = 0; item < uniqueDocuments.length; item++) {
            // console.log(item)

            let title = uniqueDocuments[item].title
            let link = '#'
            let author = 'author name' //uniqueDocuments[item].author
            let date = 0
            let year = uniqueDocuments[item].year
            let issue = uniqueDocuments[item].issue
            let doc_id = uniqueDocuments[item].document_id

            output += '<div class="article_row">'

            output += '<div class="article_info">'
                output += '<p><a href="' + link + '">' + title + '</a></p>'
                output += '<p>by ' + author + '</p>'
                output += '<p>' + year + ', ' + issue + '</p>'
                output += '<p>other actors: ' + '...' + '</p>'
            output += '</div>'

            output += '<div class="article_timeline" id="article_timeline_' + id + '_' + doc_id + '"></div>'
            
            output += '<div></div>'
            output += '<div class="go_to_article"><a href="' + link + '" style="color: gray">&rarr;</a></div>'

            output += '</div>'

            new_html.innerHTML = output
            actor_line.append(new_html)

        }

        // await the timeline box loading
        for (let item = 0; item < uniqueDocuments.length; item++) {

            let doc_id = uniqueDocuments[item].document_id
            const filtered_data = raw_data.filter(item => item.actor.actor_id == id && item.document.document_id === doc_id);
            const the_container = 'article_timeline_' + id + '_' + doc_id
            // console.log(filtered_data,the_container)

            make_timeline(filtered_data,the_container,tick_size_small)

        }
    }
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

function sort_data(){
    const selectElement = document.getElementById('the_sort');
    timelines = document.getElementById('actors_box')
    ov_timeline = document.getElementById('overall_timeline')

    selectElement.addEventListener('change', (event) => {
        const sort = event.target.value;

        timelines.innerHTML = ''
        ov_timeline.innerHTML = ''

        display_timeline(actionflows_array,'actors_box',sort)
    });
}


document.addEventListener('DOMContentLoaded', function() {

    load_data();
    sort_data();

});
