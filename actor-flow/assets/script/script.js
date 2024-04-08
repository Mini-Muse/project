colors = [
    '#F0E3CB',
    '#C9DFE5',
    '#E0BBB6',
    '#BAB7DE',
    '#C1DDAB'
] 

function get_color(value){
    const categoryColors = {
        "Protest": "#efd295",
        "Decide": "#C9DFE5",
        "Order": "#E0BBB6"
    };

    if (categoryColors.hasOwnProperty(value)) {
        return categoryColors[value];
    } else {
        return "#000000";
    }
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

function search_autocomplete(){
    const searchBox = document.getElementById('query_search');
    const autocompleteList = document.getElementById('autocomplete_list');

    const data = [
        "Albert Einstein",
        "Cleopatra VII",
        "Elizabeth I",
        "Genghis Khan",
        "Gustav Klimt",
        "Joan of Arc",
        "Julius Caesar",
        "Leonardo da Vinci",
        "Mahatma Gandhi",
        "Martin Luther King Jr.",
        "Napoleon Bonaparte"
    ]

    searchBox.addEventListener('input', handleInput);
    document.body.addEventListener("click", remove_list);

    function remove_list(){
        autocomplete_list.style.display = 'none';
    }

    function handleInput() {
        const searchTerm = searchBox.value.toLowerCase();
        const filteredData = data.filter(item => item.toLowerCase().includes(searchTerm));

        autocomplete_list.style.display = 'block';
        displayAutocompleteResults(filteredData);
    }

    function displayAutocompleteResults(results) {
      autocompleteList.innerHTML = '';

      results.forEach(result => {
        const listItem = document.createElement('li');
        listItem.textContent = result;
        listItem.addEventListener('click', () => {
            searchBox.value = result;
            autocompleteList.innerHTML = '';

            remove_list()
        });

        autocompleteList.appendChild(listItem);
      });
    }
}

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
            let art = this.getAttribute('data-art') 
            let act = this.getAttribute('data-act')

            let title = this.getAttribute('data-tit') 
            let date = this.getAttribute('data-dat') 
            let location = this.getAttribute('data-loc') 
            let extract = this.getAttribute('data-ext') 

            // print text
            empty_infobox()
            let the_info_box = document.getElementById('info_box_' + art);
            
            let output = '';
            output += '<span style="font-weight:bold;">' + date + '</span><br/>' + location + '<br/><br/>' 
            output += '<span class="action_cat" style="background-color:' + get_color(title) +'">' + title + '</span>'
            output += '<p>' + extract.slice(0, 20) + '</p>'

            
            the_info_box.innerHTML = output
            // console.log(per,art,act)

            // highlight element
            remove_highlights()
            this.classList.add('select_action')
            // this.style.backgroundColor = 'red'

        })
    }
}

function make_timeline(box,data,index){
    console.log(data[0].actions)

    // let selection = '#timeline_' + index
    // const timeline_box = document.getElementById('timeline_' + index)
    let box_w = box.offsetWidth;
    let box_h = box.offsetHeight;
    let margin = [10,10,10,10]

    let svg = d3.select(box)
        .append('svg')
        .attr("width", box_w) // box_w - (margin[0] + margin[3])
        .attr("height", box_h)
        .attr("transform","translate(0,0)") // " + margin[0] + "," + margin[1] + ")"  

    console.log(d3.select(box))

    let xScale = d3.scaleTime()
        .domain([new Date("1400-01-01"), new Date("2022-12-31")])
        .range([0, box_w])

    let xAxis = d3.axisBottom(xScale)
        .ticks(5)
        .tickFormat(d3.timeFormat("%Y"));

    svg.append("g")
        .attr("transform", "translate(0, 50)")
        .call(xAxis);

    svg.selectAll("circle")
        .data(data.actions)
        .enter()
        .append("circle")
        .attr("cx", function(d){
            console.log(d.date)
            // xScale(new Date(d.date))
            // console.log(d.date)
        })
        .attr("cy", 25)
        .attr("r", 5)
        .style("fill", "steelblue");

    // svg.selectAll("text")
    //     .data(data.actions)
    //     .enter().append("text")
    //     .attr("x", d => xScale(new Date(d.date)))
    //     .attr("y", 75)
    //     .text(d => d.name)
    //     .style("text-anchor", "middle")
    //     .style("font-size", "12px");
}

function load_data(){

    const title_box = document.getElementById('articles_box');
    const articles_count_box = document.getElementById('articles_count');
    const articles_actions_box = document.getElementById('articles_actions');
    let output = ''
    let the_data;

    let parseDate = d3.timeParse("%Y-%m-%d");
    let margin = [10,20,10,20]

    // fetch('https://minimuse.nlp.idsia.ch/actionflows/1',{ // ../../dummy-data/mini-muse-dummy-data.py
    //     method: 'GET',
    //     // mode: 'no-cors',
    //     headers: {
    //         'Content-Type': 'application/json'
    //         }
    //     })
    //     .then(data => {
    //         console.log(data)
    //     })

    fetch('assets/data/data_.json') // assets/data/data.json
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); 
        })
        .then(data => {
            // console.log(data)

            // sort
            data.sort((a, b) => {
                return a.year - b.year;
            });

            // filter
            let searchString = ''
            filtered_data = data[0].documents // data.filter(a => a.author.includes(searchString));
            console.log(filtered_data)

            const articles = filtered_data.length
            let all_actions = 0


            // const actor_name_a = document.getElementById('actor_name_a');
            // const actor_name_b = document.getElementById('actor_name_b');

            // actor = data[0].actor.name;
            // actor_name_a.innerHTML = actor;
            // actor_name_b.innerHTML = actor;
            
            // start and end date
            startDate = fix_date(filtered_data[0].actions[0].date.value);
            endDate = fix_date(filtered_data[0].actions[0].date.value); 
            // console.log(filtered_data[0].actions[0]) // .date.value

            filtered_data.forEach(event => {
                actions = event.actions

                actions.forEach(action => { 
                    // console.log(action)

                    all_actions += 1

                    if (fix_date(action.date.value) < startDate ) {
                        startDate = action.date.value;
                    }
                    if (fix_date(action.date.value) > endDate ) {
                        endDate = action.date.value;
                    }
                })
            });
            // console.log(startDate,endDate)

            // loop data
            filtered_data.forEach((item,i) => {
                // console.log(item)

                let container = d3.select('#articles_box')

                // list background
                let list_item = container.append('li')
                    .attr('class',function (d) {
                        bg = ''
                        if (i % 2 == 0) {
                            bg = 'bg'
                        }
                        return bg
                    })

                // article ---------------

                let article_box = list_item.append('div')
                    .attr('class','article item')

                let article_title = article_box.append('div')
                    .attr('id','article_title')
                    .append('a')
                    .attr('href',item.link)
                    .append('text')
                    .text(function(d){
                        return item.title
                    })
                
                let article_author = article_box.append('div')
                    .attr('id','article_author')
                    .append('text')
                    .text(function(d){
                        return 'by ' + item.author
                    })

                let article_date = article_box.append('div')
                    .attr('id','article_date')
                    .append('text')
                    .text(function(d){
                        return item.year
                    })

                // timeline ---------------

                let timeline_box = list_item.append('div')
                    .attr('id',function(d){
                        return 'timeline_' + i 
                    })
                    .attr('class','article_timeline')

                t_box = document.getElementById('timeline_' + i )

                let box_w = t_box.offsetWidth;
                let box_h = 120 // t_box.offsetHeight;

                // timeline_container
                let timeline_container = timeline_box.append('svg')
                    .attr("width", box_w)
                    .attr("height", box_h)

                let plot = timeline_container.append('g')
                    .attr("transform","translate(" + 0 + "," + margin[0] + ")") 

                let actions_box = plot.selectAll("g")
                    .data(item.actions)
                    .enter()
                    .append("g")

                let xScale = d3.scaleTime()
                    .domain([parseDate(startDate), parseDate(endDate)]) // "1750-01-01"
                    .range([0, box_w - margin[1] - margin[3]] )

                let action_items = actions_box.append("rect")
                    .attr("class", "act")
                    .attr("x", function(d){
                        return xScale(parseDate(fix_date(d.date.value)))
                    })
                    .attr("y",0)
                    .attr("width",7)
                    .attr("height",box_h - margin[0] -  5) //  - margin[0] - margin[3]
                    .attr("r", 5)
                    .attr("data-date", function(d){
                        let date = xScale(new Date(fix_date(d.date.value))) 
                        return date
                    })
                    .attr("fill",function(d){
                        // randomColor = colors[Math.floor(Math.random() * colors.length)]; 
                        // return randomColor
                        // console.log(get_color(d.name))
                        return get_color(d.name)
                    })
                    .attr("data-per",1)
                    .attr("data-art",i)
                    .attr("data-act", function(d,index){
                        return index
                    })
                    .attr("data-tit", function(d){
                        return d.name
                    })
                    .attr("data-dat", function(d){
                        return d.date.value
                    })
                    .attr("data-loc", function(d){
                        return d.location.name
                    })
                    .attr("data-ext", function(d){
                        return d.extract.value
                    })

                // xAxis

                // let xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y"));
                // plot.append("g")
                //     .attr("transform", 'translate(' + margin[0] +',80)')
                //     .attr("class","the_axis")
                //     .call(xAxis)

                // infobox  ---------------

                let action_box = list_item.append("div")
                    .attr("id", "info_box_" + i)
                    .attr("class","info_box")

            });
            
            let overall_timeline = document.getElementById('overall_timeline')
            w_ = overall_timeline.offsetWidth;
            h_ = overall_timeline.offsetHeight;

            let overall_axis = d3.select("#overall_timeline")
                .append('svg')
                .attr("width",w_)
                .attr("height",h_ - 1) 

            let plot = overall_axis.append("g")

            let xScale = d3.scaleTime()
                // .domain([parseDate("1750-01-01"), parseDate("1890-12-31")])
                .domain([parseDate(startDate), parseDate(endDate)])
                .range([0, w_ - margin[1] - margin[3]] )

            let xAxis = d3.axisTop(xScale).tickFormat(d3.timeFormat("%Y"));
                plot.append("g")
                    .attr("transform", 'translate(' + margin[0] +',20)')
                    .attr("class","the_axis")
                    .call(xAxis)

            articles_count_box.innerHTML = articles
            articles_actions_box.innerHTML = all_actions

            timeline_labels();

        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}


document.addEventListener('DOMContentLoaded', function() {
    search_autocomplete();

    load_data();
    
});

