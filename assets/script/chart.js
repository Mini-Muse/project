const margin = [10,10,10,10]
const timeline_margin = [10,10,10,10]
const tick_size_large = 120;
const tick_size_small = 100;

let parseDate = d3.timeParse("%Y-%m-%d"); // %Y

let year_a = 1900;
let year_b = 1900;

const shift = 2;

const action_width_large = 10;
const action_width_small = 4;

const colors = [
    '#F0E3CB',
    '#C9DFE5',
    '#E0BBB6',
    '#BAB7DE',
    '#C1DDAB'
] 

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

function get_actors_per_article(data){
    const grouped = {};

    data.forEach(item => {

        item.forEach(obj => {
            const docId = obj.document.document_id;
            const actorName = obj.actor.name;
            // console.log(docId,actorName)

            if (!grouped[docId]) {
                grouped[docId] = new Set();
            }

            grouped[docId].add(actorName);
        })
    });
    // console.log(grouped)
    //return Object.values(grouped);
    return Object.values(grouped).map(set => Array.from(set));
}

function make_timeline(individual_timeline_data,the_container,startDate,endDate,tick_size,action_width){
    // console.log(startDate,endDate)
    
    timeline_box = document.getElementById(the_container) //  'timeline_' + id )

    box_w = timeline_box.offsetWidth;
    box_h = tick_size // t_box.offsetHeight;

    // years ---------------

    let my_data = individual_timeline_data
    // console.log(my_data[0].date.value)

    xScale = d3.scaleTime()
        .domain([parseDate(startDate), parseDate(endDate)]) // 1920 // "1750-01-01"
        .range([0, box_w - timeline_margin[1] - timeline_margin[3]] )
        // console.log(startDate,endDate)

    // timeline_container
    let timeline_container = d3.select(timeline_box).append('svg')
        .attr("width", box_w)
        .attr("height", box_h)

    let plot = timeline_container.append('g')
        .attr("transform","translate(" + timeline_margin[1] + "," + timeline_margin[0] + ")") 

    let actions_box = plot.selectAll("g")
        .data(my_data)
        .enter()

    let action_items = actions_box.append("rect")
        .attr("class", "act")
        .attr("x", function(d){
            let the_date = new Date(fix_date(d.date.value))
            let x_pos = xScale(the_date) - (action_width/2) // + (action_width/1)
            return x_pos
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

function overall_timeline(container,startDate,endDate){
    // console.log(startDate,endDate)

    let overall_timeline = document.getElementById(container)
    w_ = overall_timeline.offsetWidth;
    h_ = overall_timeline.offsetHeight;

    overall_timeline.innerHTML = ''

    let overall_axis = d3.select('#' + container)
        .append('svg')
        .attr("width",w_)
        .attr("height", 20) // h_ - 1 

    let plot = overall_axis.append("g")
        .attr("transform", 'translate(' + margin[0] + ',' + 20 + ')')

    xScale = d3.scaleTime()
        .domain([parseDate(startDate), parseDate(endDate)]) // 1920 // "1750-01-01"
        .range([0, w_ - timeline_margin[1] - timeline_margin[0]] )

    let tick_count = 10
    if (w_ < 300) {
        tick_count = 5
    }

    let xAxis = d3.axisTop(xScale)
        .tickFormat(d3.timeFormat("%Y"))
        .ticks(tick_count)
    
    let the_xAxis = plot.append("g")
        .attr("class","the_axis")
        .call(xAxis)
}
