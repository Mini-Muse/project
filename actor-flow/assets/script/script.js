function menu(){
    const menuToggle = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.menu');

    menuToggle.addEventListener('click', function() {
        menu.classList.toggle('active');
        const expanded = menu.getAttribute('aria-expanded') === 'true' || false;
        menu.setAttribute('aria-expanded', !expanded);
    });

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

function load_data(){

    const title_box = document.getElementById('articles_box');
    let output = ''

    fetch('assets/data/data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); 
        })
        .then(data => {

            data.forEach((item,i) => {

                let title = item.title;
                let author = item.author;
                let date = item.publication_date;
                let bg = ''

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

                output += '<div class="timeline item">...</div>'
                output += '<div class="info item">info</div>'
                output += '<div class="link item"><a href="#">link</a></div>'

                output += '</div>'
                output += '</li>'

            });

            title_box.innerHTML = output
            
            console.log(data);
        
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}


document.addEventListener('DOMContentLoaded', function() {
    menu();
    search_autocomplete();

    load_data();
});

