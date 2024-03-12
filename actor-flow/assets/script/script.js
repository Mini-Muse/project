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

function make_timeline(data,index){

    let selection = '#timeline_' + index
    const timeline_box = document.getElementById('timeline_' + index)
    let box_w = timeline_box.offsetWidth;
    let box_h = timeline_box.offsetHeight;

    let svg = d3.select(selection)
        .append('svg')
        .attr("width", box_w)
        .attr("height", box_h);

    let xScale = d3.scaleTime()
        .domain([new Date("2022-01-01"), new Date("2022-12-31")])
        .range([50, 350]);


}

function load_data(){

    const title_box = document.getElementById('articles_box');
    const articles_count_box = document.getElementById('articles_count');
    const articles_actions_box = document.getElementById('articles_actions');
    let output = ''

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

                let bg = ''
                let title = item.title;
                let author = item.author;
                let date = item.publication_date;
                let actions = item.actions
                let actions_count = item.actions.length
                let link = '#'
                let actor_id = 1

                if (i % 2 == 0) {
                    bg = 'bg'
                }

                output += '<li class="' + bg + '"">';
                output += '<div class="article item">'

                    output += '<div id="article_title">'
                    output += '<a href="' + link + '">'
                    output += title
                    output += '</a>'
                    output += '</div>'

                    output += '<div id="article_author">'
                    output += 'by ' + author
                    output += '</div>'

                    output += '<div id="article_date">'
                    output += date
                    output += '</div>'

                output += '</div>'

                actions.sort((a, b) => {
                    return a.date - b.date;
                });

                // timeline
                output += '<div id="timeline_' + i + '"class="article_timeline item" style="display: flex;">'
                

                // colors = [
                //     '#F0E3CB',
                //     '#C9DFE5',
                //     '#E0BBB6',
                //     '#BAB7DE',
                //     '#C1DDAB'
                // ] 

                
                // for (let a = 0; a < actions.length; a++) {

                //     all_actions += a

                //     randomColor = colors[Math.floor(Math.random() * colors.length)];  
                //     metadata = 'data-per="' + actor_id + '" data-art="' + i + '"' + 'data-act="' + a + '" '
                //     metadata += 'data-tit="' + actions[a].title + '"'
                //     metadata += 'data-dat="' + actions[a].date + '"'
                //     metadata += 'data-loc="' + actions[a].location + '"'
                
                //     output += '<div class="act" ' + metadata + 'style="background-color:'+ randomColor +'; margin-left:' +  ((Math.random(10)*15) + 3)  +'%' + ';"></div>'
                //     // console.log(randomColor)
                // }

                output += '</div>'


                output += '<div class="info_box item" id="info_box_' + i + '"></div>'

                output += '</div>'
                output += '</li>'

            });

            // timeline
            // filtered_data.forEach((item,i) => {
            //     make_timelines(data,i)
            // })

            articles_count_box.innerHTML = articles
            title_box.innerHTML = output
            articles_actions_box.innerHTML = all_actions

            // make timeline
            timeline_boxes = document.getElementsByClassName('article_timeline');
            for (let i = 0; i < timeline_boxes.length; i++) {
                make_timeline(data,i)
            }    
            // console.log(data);
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

