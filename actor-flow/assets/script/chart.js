function make_timeline(individual_timeline_data,the_container,tick_size){
    timeline_box = document.getElementById(the_container) //  'timeline_' + id )
    // console.log(the_container)

    box_w = timeline_box.offsetWidth;
    box_h = tick_size // t_box.offsetHeight;

    let date_a = (year_a - shift).toString() + '-01-01'
    let date_b = (year_b + shift).toString() + '-01-01'
    // console.log(year_a,year_b)

    xScale = d3.scaleTime()
        .domain([parseDate(date_a), parseDate(date_b)]) // 1920 // "1750-01-01"
        .range([0, box_w - timeline_margin[1] - timeline_margin[3]] )

    // timeline_container
    let timeline_container = d3.select(timeline_box).append('svg')
        .attr("width", box_w)
        .attr("height", box_h)

    let plot = timeline_container.append('g')
        .attr("transform","translate(" + timeline_margin[1] + "," + timeline_margin[0] + ")") 

    let actions_box = plot.selectAll("g")
        .data(individual_timeline_data)
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
