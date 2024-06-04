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

    get_statistics(actionflows_array)   
       
}

document.addEventListener('DOMContentLoaded', function() {

    load_data();

});