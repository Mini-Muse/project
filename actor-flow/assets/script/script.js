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
document.addEventListener('DOMContentLoaded', function() {
    menu();
    search_autocomplete();
});

