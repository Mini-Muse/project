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
                let actions_count = item.actions.length

                if (i % 2 == 0) {
                    bg = 'bg'
                }

                output += '<li class="' + bg + '"">';
                output += '<div class="article item">'

                    output += '<div id="article_title">'
                    output += title
                    output += '</div>'

                    output += '<div id="article_author">'
                    output += 'by ' + author
                    output += '</div>'

                    output += '<div id="article_date">'
                    output += date
                    output += '</div>'

                output += '</div>'

                output += '<div class="article_timeline item" style="display: flex;">'
                colors = [
                    '#F0E3CB',
                    '#C9DFE5',
                    '#E0BBB6',
                    '#BAB7DE',
                    '#C1DDAB'
                ] 

                // let random = 
                for (let i = 0; i < Math.floor(Math.random(5)*7 + 1); i++) {

                    randomColor = colors[Math.floor(Math.random() * colors.length)];  
                    output += '<div style="background-color:'+ randomColor +'; width: 5px; height: 100%; margin-left:' +  ((Math.random(10)*20) + 3)  +'%' + ';"></div>'
                    // console.log(randomColor)
                }

                // if (actions_count > 0) {
                //     output += actions_count + ' actions'

                //     all_actions += actions_count
                // }
                output += '</div>'

                output += '<div class="info item">info</div>'
                output += '<div class="link item"><a href="#">link</a></div>'

                output += '</div>'
                output += '</li>'

            });

            articles_count_box.innerHTML = articles
            title_box.innerHTML = output
            articles_actions_box.innerHTML = all_actions
                
            // console.log(data);
        
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}


document.addEventListener('DOMContentLoaded', function() {
    search_autocomplete();

    load_data();
});

