const colors = [
    '#F0E3CB',
    '#C9DFE5',
    '#E0BBB6',
    '#BAB7DE',
    '#C1DDAB'
] 

const margin = [10,10,10,10]

const action_width = 10;

let raw_data;

let year_a = 1900;
let year_b = 1900;

const shift = 2;
// function date_years(date,n,count) {
//     let output;
//     if (count == 'minus'){
//         output = new Date(date.setFullYear(date.getFullYear() - n)); 
//     }
//     else {
//         output = new Date(date.setFullYear(date.getFullYear() + n)); 
//     }
//     return output
// }
// date = new Date(1990,10,2,'minus')
// console.log(date_years(date,2))

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

}
// function search_autocomplete(){
//     const searchBox = document.getElementById('query_search');
//     const autocompleteList = document.getElementById('autocomplete_list');

//     const data = [
//         "Albert Einstein",
//         "Cleopatra VII",
//         "Elizabeth I",
//         "Genghis Khan",
//         "Gustav Klimt",
//         "Joan of Arc",
//         "Julius Caesar",
//         "Leonardo da Vinci",
//         "Mahatma Gandhi",
//         "Martin Luther King Jr.",
//         "Napoleon Bonaparte"
//     ]

//     searchBox.addEventListener('input', handleInput);
//     document.body.addEventListener("click", remove_list);

//     function remove_list(){
//         autocomplete_list.style.display = 'none';
//     }

//     function handleInput() {
//         const searchTerm = searchBox.value.toLowerCase();
//         const filteredData = data.filter(item => item.toLowerCase().includes(searchTerm));

//         autocomplete_list.style.display = 'block';
//         displayAutocompleteResults(filteredData);
//     }

//     function displayAutocompleteResults(results) {
//       autocompleteList.innerHTML = '';

//       results.forEach(result => {
//         const listItem = document.createElement('li');
//         listItem.textContent = result;
//         listItem.addEventListener('click', () => {
//             searchBox.value = result;
//             autocompleteList.innerHTML = '';

//             remove_list()
//         });

//         autocompleteList.appendChild(listItem);
//       });
//     }
// }

function timeline_labels() {
    let labels = document.getElementsByClassName('act');
    let info_boxes = document.getElementsByClassName('info_box');
    let acts = document.getElementsByClassName('act');

    function empty_infobox(){
        for (let i = 0; i < info_boxes.length; i++) {
            info_boxes[i].innerHTML = ''
        }
    }

    function remove_highlights(){
        for (let i = 0; i < acts.length; i++) {
            acts[i].classList.remove('select_action')
        }
    }

    for (let item = 0; item < labels.length; item++) {
        labels[item].addEventListener("mouseover",function(e) {

            let per = this.getAttribute('data-per') 
            // let art = this.getAttribute('data-art') 
            let act = this.getAttribute('data-act')

            let title = this.getAttribute('data-tit') 
            let date = this.getAttribute('data-dat') 
            let location = this.getAttribute('data-loc') 
            let extract = this.getAttribute('data-ext') 

            // print text
            empty_infobox()
            let the_info_box = document.getElementById('info_box_' + act);
            
            let output = '';
            output += '<span style="font-weight:bold;">' + date + '</span><br/>' + location + '<br/><br/>' 
            output += '<span class="action_cat" style="background-color:' + get_color(title) +'">' + title + '</span>'
            output += '<p>' + extract.slice(0, 20) + '</p>'

            the_info_box.innerHTML = output
            // console.log(per,act)

            // highlight element
            remove_highlights()
            this.classList.add('select_action')
            // this.style.backgroundColor = 'red'

        })
    }
}

// function make_timeline(box,data,index){
//     // console.log(data[0].actions)

//     // let selection = '#timeline_' + index
//     // const timeline_box = document.getElementById('timeline_' + index)
//     let box_w = box.offsetWidth;
//     let box_h = box.offsetHeight;

//     let svg = d3.select(box)
//         .append('svg')
//         .attr("width", box_w) // box_w - (margin[0] + margin[3])
//         .attr("height", box_h)
//         .attr("transform","translate(0,0)") // " + margin[0] + "," + margin[1] + ")"  

//     console.log(d3.select(box))

//     let xScale = d3.scaleTime()
//         .domain([new Date("1400-01-01"), new Date("2022-12-31")])
//         .range([0, box_w])

//     let xAxis = d3.axisBottom(xScale)
//         .ticks(5)
//         .tickFormat(d3.timeFormat("%Y"));

//     svg.append("g")
//         .attr("transform", "translate(0, 50)")
//         .call(xAxis);

//     svg.selectAll("circle")
//         .data(data.actions)
//         .enter()
//         .append("circle")
//         .attr("cx", function(d){
//             console.log(d.date)
//             // xScale(new Date(d.date))
//             // console.log(d.date)
//         })
//         .attr("cy", 25)
//         .attr("r", 5)
//         .style("fill", "steelblue");

//     // svg.selectAll("text")
//     //     .data(data.actions)
//     //     .enter().append("text")
//     //     .attr("x", d => xScale(new Date(d.date)))
//     //     .attr("y", 75)
//     //     .text(d => d.name)
//     //     .style("text-anchor", "middle")
//     //     .style("font-size", "12px");
// }

async function load_data(){

    const title_box = document.getElementById('articles_box');
    const articles_count_box = document.getElementById('articles_count');
    const articles_actions_box = document.getElementById('articles_actions');
    let output = ''
    let the_data;

    let data;

    await fetch('assets/data/data_.json') // assets/data/data.json 
    // await fetch('https://minimuse.nlp.idsia.ch/actionflows') 
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
    const actionflows_array = Object.values(actionflows);

    // sort
    // data.sort((a, b) => {
    //     return new Date(a.date.value) - new Date(b.date.value);
    // });
    // console.log(data)

    get_statistics(actionflows_array)   
    display_data(actionflows_array)
       
}

function display_data(data){
    // console.log(data)

     // // filter
    // let searchString = ''
    // filtered_data = data[0].documents // data.filter(a => a.author.includes(searchString));
    // console.log(filtered_data)

    // const articles = filtered_data.length
    let all_actions = 0
    
    let parseDate = d3.timeParse("%Y-%m-%d"); // %Y
    let timeline_margin = [10,10,10,10]

    let box_w;
    let box_h; 

    // get start and end date ---------------
    let startDate = fix_date(data[0][0].date.value);
    let endDate = startDate 
    // console.log(startDate,endDate)

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


    let xScale; // = d3.scaleTime()
    //     .domain([parseDate(startDate), parseDate(endDate)]) // 1920 // "1750-01-01"
    //     .range([0, box_w - margin[1] - margin[3]] )

    // display data
    data.forEach((item,i) => {
        // console.log(item)

        let container = d3.select('#actors_box')

        // list background
        let list_item = container.append('li')
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
        
        let timeline_box = article_box.append('div')
            .attr('id',function(d){
                return 'timeline_' + i
            })
            .attr('class','article_timeline')

        // let article_author = article_box.append('div')
        //     .attr('id','article_author')
        //     .append('text')
        //     .text(function(d){
        //         return 'by ' + item.author
        //     })

        // let article_date = article_box.append('div')
        //     .attr('id','article_date')
        //     .append('text')
        //     .text(function(d){
        //         return item.year
        //     })

        // timeline ---------------

        // item.forEach((action,a) => {
        //     console.log(action)
        // })

        t_box = document.getElementById('timeline_' + i )

        box_w = t_box.offsetWidth;
        box_h = 120 // t_box.offsetHeight;

        let date_a = (year_a - shift).toString() + '-01-01'
        let date_b = (year_b + shift).toString() + '-01-01'
        // console.log(year_a,year_b)

        xScale = d3.scaleTime()
            .domain([parseDate(date_a), parseDate(date_b)]) // 1920 // "1750-01-01"
            .range([0, box_w - timeline_margin[1] - timeline_margin[3]] )

        // timeline_container
        let timeline_container = timeline_box.append('svg')
            .attr("width", box_w)
            .attr("height", box_h)

        let plot = timeline_container.append('g')
            .attr("transform","translate(" + timeline_margin[1] + "," + timeline_margin[0] + ")") 

        let actions_box = plot.selectAll("g")
            .data(item)
            .enter()
            .append("g")

        let action_items = actions_box.append("rect")
            .attr("class", "act")
            .attr("x", function(d){
                let the_date = new Date(fix_date(d.date.value)) // parseDate(fix_date(d.date.value)))
                return xScale(the_date)  + (action_width/1)
            })
            .attr("y",0)
            .attr("width",action_width)
            .attr("height",box_h - margin[0] -  5) //  - margin[0] - margin[3]
            .attr("r", 5)
            .attr("data-date", function(d){
                let date = xScale(new Date(fix_date(d.date.value))) 
                return date
            })
            .attr("fill",function(d){
                return get_color(d.action.name)
            })
            .attr("data-per",1)
            .attr("data-art", function(d){
                return d.document.document_id
            })
            .attr("data-act", function(d,index){
                return d.actor.actor_id
            })
            .attr("data-tit", function(d){
                return d.action.name
            })
            .attr("data-dat", function(d){
                return d.date.value
            })
            .attr("data-loc", function(d){
                return d.location.name
            })
            .attr("data-ext", function(d){
                return d.extract
            })

        // xAxis  ---------------
        // let xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y"));
        // plot.append("g")
        //     .attr("transform", 'translate(' + margin[0] +',80)')
        //     .attr("class","the_axis")
        //     .call(xAxis)

        // infobox  ---------------

        // item.forEach((action,i) => {
        //     console.log(action)

        // })

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
            .attr("id","open_box_icon_" + id)
            .attr("class","arrow_box")
            .text("↓")
    });
    
    let overall_timeline = document.getElementById('overall_timeline')
    w_ = overall_timeline.offsetWidth;
    h_ = overall_timeline.offsetHeight;

    let overall_axis = d3.select("#overall_timeline")
        .append('svg')
        .attr("width",w_)
        .attr("height",h_ - 1) 

    let plot = overall_axis.append("g")

    // xScale = d3.scaleTime()
    //         .domain([parseDate(startDate), parseDate(endDate)]) // 1920 // "1750-01-01"
    //         .range([0, box_w - margin[1] - margin[3]] )

    // xScale = d3.scaleTime()
    //     // .domain([parseDate("1750-01-01"), parseDate("1890-12-31")])
    //     .domain([parseDate(startDate), parseDate(endDate)])
    //     // .range([0, w_]) // w_ - margin[1] - margin[3]] 
    //     .range([0, box_w - margin[1] - margin[3]] )


        // .attr("transform","translate(" + timeline_margin[1] + "," + timeline_margin[0] + ")") 

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
        my_arrow = document.getElementById("open_box_icon_" + id)

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

            let title = uniqueDocuments[item].title
            let link = '#'
            let author = 'author name' //uniqueDocuments[item].author
            let date = 0
            let year = uniqueDocuments[item].year
            let issue = uniqueDocuments[item].issue

            output += '<div class="row_article">'
            output += '<p><a href="' + link + '">' + title + '</a></p>'
            output += '<p>by ' + author + '</p>'
            output += '<p>' + year + ', ' + issue + '</p><br/>'
            output += '<p>other actors: ' + '...' + '</p>'
            output += '</div>'

            new_html.innerHTML = output
            actor_line.append(new_html)
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // search_autocomplete();

    load_data();
    
});
