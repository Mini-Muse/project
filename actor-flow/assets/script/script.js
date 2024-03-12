colors = [
    '#F0E3CB',
    '#C9DFE5',
    '#E0BBB6',
    '#BAB7DE',
    '#C1DDAB'
] 

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

            // print text
            empty_infobox()
            let the_info_box = document.getElementById('info_box_' + art);
            the_info_box.innerHTML = title + '<br/>' + date + '<br/>' + location
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

    fetch('assets/data/data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); 
        })
        .then(data => {

            // sort
            data.sort((a, b) => {
                return a.publication_date - b.publication_date;
            });

            // filter
            let searchString = ''
            filtered_data = data.filter(a => a.author.includes(searchString));
            // filtered_data = data

            const articles = filtered_data.length
            let all_actions = 0

            // loop data
            filtered_data.forEach((item,i) => {

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
                        return item.publication_date
                    })

                // timeline ---------------

                let parseDate = d3.timeParse("%Y-%m-%d");

                let margin = [10,20,10,20]


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
                    .domain([parseDate("1750-01-01"), parseDate("1890-12-31")])
                    .range([0, box_w - margin[1] - margin[3]] )

                let action_items = actions_box.append("rect")
                    .attr("class", "timeline-point")
                    .attr("x", function(d){

                        if (d.date.length == 4){
                            date_ = String(d.date) + '-01-01'
                        }
                        else {
                            date_ = String(d.date)
                        }                        
                        return xScale(parseDate(date_))

                    })
                    .attr("y",0)
                    .attr("width",7)
                    .attr("height",box_h - margin[0]) //  - margin[0] - margin[3]
                    .attr("r", 5)
                    .attr("data-date", function(d){
                        let date_ = String(d.date)
                        let date = xScale(new Date(date_)) //new Date() 
                        
                        return date_
                    })
                    .attr("fill",function(d){
                        randomColor = colors[Math.floor(Math.random() * colors.length)]; 
                        return randomColor
                    })

                let xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y"));
                plot.append("g")
                    .attr("transform", 'translate(' + margin[0] +',80)')
                    .attr("class","the_axis")
                    .call(xAxis);

            });

            articles_count_box.innerHTML = articles
            articles_actions_box.innerHTML = all_actions

            // timeline_labels();
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}


document.addEventListener('DOMContentLoaded', function() {
    search_autocomplete();

    load_data();
    
});

