const margin = [10,10,10,10]
const timeline_margin = [10,10,10,10]
const tick_size_large = 100;
const tick_size_small = 100;

let parseDate = d3.timeParse("%Y-%m-%d"); // %Y

let year_a = 1900;
let year_b = 1900;

const shift = 2;

const action_width_large = 10;
const action_width_small = action_width_large/3*2;
const action_width_very_small = action_width_large/3;

// const colors = [
//     '#F0E3CB',
//     '#C9DFE5',
//     '#E0BBB6',
//     '#BAB7DE',
//     '#C1DDAB'
// ] 

function get_color(value){

    const categoryColors = {
        'decide': '#C9DFE5',
        'get': '#FFB6C1',
        'influence': '#40E0D0',
        'make': '#E0BBB6',
        'manage': '#FFDAB9',
        'movement': '#b1dbee',
        'pursuit' : '#FF7F50',
        'react': '#E6E6FA',
        'state': '#efd295',
        'transform': '#FFD700'
    };

    let color = '#C0C0C0' // // #7fbbdb "#000000";
    if (categoryColors.hasOwnProperty(value)) {
        color = categoryColors[value];
    }
    return color 
}

function action_full_name(action_category){
    let full_name = ''

    if (action_category == 'decide'){
        full_name = 'decide something'
    }
    else if (action_category == 'get'){
        full_name = 'get something'
    }
    else if (action_category == 'influence'){
        full_name = 'influence something'
    }
    else if (action_category == 'make'){
        full_name = 'make something'
    }
    else if (action_category == 'manage'){
        full_name = 'manage something'
    }
    else if (action_category == 'movement'){
        full_name = 'movement towards something'
    }
    else if (action_category == 'pursuit'){
        full_name = 'pursuit something'
    }
    else if (action_category == 'react'){
        full_name = 'react to something'
    }
    else if (action_category == 'state'){
        full_name = 'state something'
    }
    else if (action_category == 'transform'){
        full_name = 'transform something'
    }
    else {
        full_name = ''
    }

    return full_name
}

function get_action_category(action){
    let category = ''

    decice_list = [
        'abgelehnt',
        'ablehnte',
        'abzulehnen',
        'accepter'
    ]

    get_list = [
        'abnahm',
        'verliert',
        'gewonnen',
        'brauchten',
        'erreichte'
    ]

    influence_list = [
        'kämpften',
        'drängten'
    ]

    make_list = [
        'schrieb',
        'verfasst',
        'formulieren',
        'aufführen'
    ]

    manage_list = [
        'abzuschliessen',
        'vorzulegen',
        'analysierte'
    ]

    movement_list = [
        'belassen',
        'blieb',
        'brachte',
        'fortfuhren',
        'gingen',
        'ging',
        'preschte'
    ]

    react_list = [
        'agierte'
    ]

    state_list = [
        'affirme',
        'argumentierte',
        'betont',
        'betonte',
        'bezeichnete',
        'fragte',
        'nannte',
        'nennt',
        'stellte',
        'zitiert',
        'zitierte',
        'begründete',
        'erklärte'
    ]

    if (decice_list.includes(action)) {
        category = 'decide';
    } 
    else if (get_list.includes(action)) {
        category = 'get';
    } 
    else if (influence_list.includes(action)) {
        category = 'influence';
    } 
    else if (make_list.includes(action)) {
        category = 'make';
    } 
    else if (manage_list.includes(action)) {
        category = 'manage';
    } 
    else if (movement_list.includes(action)) {
        category = 'movement';
    } 
    else if (react_list.includes(action)) {
        category = 'react';
    } 
    else if (state_list.includes(action)) {
        category = 'state';
    } 

    return category
}

function get_actors_per_article(data){
    const grouped = {};

    data.forEach(item => {

        item.forEach(obj => {
            const docId = obj.document_id;
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
    // console.log(individual_timeline_data,the_container)
    
    timeline_box = document.getElementById(the_container)

    box_w = timeline_box.offsetWidth;
    box_h = tick_size // t_box.offsetHeight;

    // years ---------------

    let my_data = individual_timeline_data

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

    // console.log(my_data[0].result.actor.Id, my_data[0].result.actor.Name)

    let action_items = actions_box.append("rect")
        .attr("class", "act")
        .attr("x", function(d){
            let the_date = new Date(fix_date(d.result.date))
            let x_pos = xScale(the_date) - (action_width/2) // + (action_width/1)
            return x_pos
        })
        .attr("y",0)
        .attr("width",action_width)
        .attr("height",box_h - margin[0] -  5) //  - margin[0] - margin[3]
        .attr("r", 5)
        .attr("data-date", function(d){
            let date = xScale(new Date(fix_date(d.result.date))) 
            return date
        })
        .attr("fill",function(d){
            let action = d.result.action.Name
            let category = get_action_category(action)
            let color = get_color(category)
            // console.log(category, color)
            return color
        })
        .attr("stroke",function(d){
            return '#838383'
        })
        .attr("stroke-dasharray",function(d){
            if (d.result.null_date == true) {
                return '3'
            }
        })
        .attr("data-per",1)
        .attr("data-nullDate", function(d){
            return d.result.null_date
        })
        .attr("data-art", function(d){
            return d.result.articleID
        })
        .attr("data-act", function(d,index){ // actor
            let name = d.result.actor.Name
            let actor_name = name.replace(' ','_')
            return actor_name
        })
        .attr("data-tit", function(d){
            return d.result.action.Name
        })
        .attr("data-dat", function(d){
            return d.result.date
        })
        .attr("data-loc", function(d){
            return d.result.location
        })
        .attr("data-ext", function(d){
            let output = ''
            if (d.result.actionDetails.length > 0){
                let array = d.result.actionDetails

                array.forEach(item => {
                    let text = item.Name
                    output += text
                })
                
                return output
            }
            else {
                return 'no keywords available'
            }
        })
        // .on('mouseover', function (d, i) {
        //     d3.select(this).transition()
        //         .duration('50')
        //         .attr('opacity', '.5')
        // })
        // .on('mouseout', function (d, i) {
        //     d3.select(this).transition()
        //         .duration('50')
        //         .attr('opacity', '1');
        // })

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

    // show highlights
    for (let item = 0; item < labels.length; item++) {
        labels[item].addEventListener("mouseover",function(e) {

            // let art = this.getAttribute('data-art') 
            let per = this.getAttribute('data-per') 
            let act = this.getAttribute('data-act')

            let title = this.getAttribute('data-tit') 
            let date_ = this.getAttribute('data-dat') 
            let location = this.getAttribute('data-loc') 
            let extract = this.getAttribute('data-ext') 

            // this.style.

            // print text
            empty_infobox()

            if (document.getElementById('info_box_' + act)){
                
                let the_info_box = document.getElementById('info_box_' + act);
                // console.log(act)

                let action_category = ''
                if (get_action_category(title) != ''){
                    action_category = action_full_name(get_action_category(title)) + ': '
                }
                
                let date = date_
                if (this.getAttribute('data-nullDate') == 'true'){
                    date = date_ + '?'
                }

                let output = '';
                output += '<span style="font-weight:bold;">' + date + '</span>, <span>location: ' + location + '</span><br/>' 
                output += '<span class="action_cat" style="background-color:' + get_color(get_action_category(title)) +'">' + action_category + '' + title + '</span>'
                output += '<p>' + extract + '</p>' // .slice(0, 20)

                the_info_box.innerHTML = output
                // console.log(date, location, title)

                // highlight element
                remove_highlights()
                this.classList.add('select_action')
            }

        })
    }
}

function getDaysDifference(date1, date2) {
    // Convert strings to Date objects
    const dateObj1 = new Date(date1);
    const dateObj2 = new Date(date2);

    // Ensure date1 is not before date2 (for positive difference)
    // if (dateObj1 < dateObj2) {
    //     [dateObj1, dateObj2] = [dateObj2, dateObj1]; // Swap dates if needed
    // }

    // Calculate the difference in milliseconds
    const timeDifference = dateObj2.getTime() - dateObj1.getTime();

    // Convert milliseconds to days and round down to the nearest whole day
    const dayDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

    // Format the difference as YYYY-MM-DD
    // const formattedDifference = new Date(dayDifference).toISOString().slice(0, 10);

    return dayDifference;
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


    let timeFormat = d3.timeFormat("%Y")
    let difference = getDaysDifference(startDate, endDate)
    // console.log(startDate, endDate,difference)

    if (difference < (365*5)) {
        timeFormat = d3.timeFormat("%Y.%m")
    }

    let tick_count = 10
    if (w_ < 550) {
        tick_count = 5 // d3.timeYear.every(2) //5
    }

    let xAxis = d3.axisTop(xScale)
        .tickFormat(timeFormat)
        .ticks(tick_count)
    
    let the_xAxis = plot.append("g")
        .attr("class","the_axis")
        .call(xAxis)
}
