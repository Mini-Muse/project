function home_timeline(){

    the_container = 'home_timeline'
    startDate = '1916-01-21'
    endDate = '1924-12-01'
    tick_size = 100
    action_width = 10

    individual_timeline_data = [
        {
            "action_relation_id": 2,
            "actor": {
                "actor_id": 2,
                "name": "Albert Smith",
                "role": "Editor"
            },
            "document": {
                "document_id": 1
            },
            "location": {
                "location_id": 1,
                "name": "New York City",
                "country": "USA"
            },
            "date": {
                "date_id": 1,
                "name": "Publication Date",
                "value": "1916-04-15"
            },
            "action": {
                "action_id": 2,
                "name": "Edited"
            },
            "extract": "abc"
        },
        {
            "action_relation_id": 4,
            "actor": {
                "actor_id": 2,
                "name": "Albert Smith",
                "role": "Editor"
            },
            "document": {
                "document_id": 1
            },
            "location": {
                "location_id": 2,
                "name": "London",
                "country": "UK"
            },
            "date": {
                "date_id": 2,
                "name": "Publication Date",
                "value": "1921-05-20"
            },
            "action": {
                "action_id": 2,
                "name": "Edited"
            },
            "extract": "abc"
        },
        {
            "action_relation_id": 7,
            "actor": {
                "actor_id": 2,
                "name": "Albert Smith",
                "role": "Editor"
            },
            "document": {
                "document_id": 2
            },
            "location": {
                "location_id": 1,
                "name": "New York City",
                "country": "USA"
            },
            "date": {
                "date_id": 1,
                "name": "Publication Date",
                "value": "1919-10-15"
            },
            "action": {
                "action_id": 2,
                "name": "Edited"
            }
        },
        {
            "action_relation_id": 8,
            "actor": {
                "actor_id": 2,
                "name": "Albert Smith",
                "role": "Editor"
            },
            "document": {
                "document_id": 2,
                "title": "Historical Magazine Title 3",
                "volume": "Volume 3",
                "issue": "Issue 3",
                "type": "Magazine",
                "publisher": "Historical Society Publications",
                "year": 1922
            },
            "location": {
                "location_id": 2,
                "name": "London",
                "country": "UK"
            },
            "date": {
                "date_id": 2,
                "name": "Publication Date",
                "value": "1923-12-20"
            },
            "action": {
                "action_id": 2,
                "name": "Wrote"
            },
            "extract": "abc"
        },
        {
            "action_relation_id": 9,
            "actor": {
                "actor_id": 2,
                "name": "Albert Smith",
                "role": "Editor"
            },
            "document": {
                "document_id": 2,
                "title": "Historical Magazine Title 3",
                "volume": "Volume 3",
                "issue": "Issue 3",
                "type": "Magazine",
                "publisher": "Historical Society Publications",
                "year": 1922
            },
            "location": {
                "location_id": 2,
                "name": "London",
                "country": "UK"
            },
            "date": {
                "date_id": 2,
                "name": "Publication Date",
                "value": "1923-06-21"
            },
            "action": {
                "action_id": 8,
                "name": "Wrote"
            },
            "extract": "abc"
        },
        {
            "action_relation_id": 10,
            "actor": {
                "actor_id": 2,
                "name": "Albert Smith",
                "role": "Editor"
            },
            "document": {
                "document_id": 2,
                "title": "Historical Magazine Title 3",
                "volume": "Volume 3",
                "issue": "Issue 3",
                "type": "Magazine",
                "publisher": "Historical Society Publications",
                "year": 1922
            },
            "location": {
                "location_id": 2,
                "name": "London",
                "country": "UK"
            },
            "date": {
                "date_id": 2,
                "name": "Publication Date",
                "value": "1922-01-21"
            },
            "action": {
                "action_id": 8,
                "name": "Wrote"
            },
            "extract": "abc"
        },
        {
            "action_relation_id": 11,
            "actor": {
                "actor_id": 2,
                "name": "Albert Smith",
                "role": "Editor"
            },
            "document": {
                "document_id": 2,
                "title": "Historical Magazine Title 3",
                "volume": "Volume 3",
                "issue": "Issue 3",
                "type": "Magazine",
                "publisher": "Historical Society Publications",
                "year": 1922
            },
            "location": {
                "location_id": 2,
                "name": "London",
                "country": "UK"
            },
            "date": {
                "date_id": 2,
                "name": "Publication Date",
                "value": "1918-06-21"
            },
            "action": {
                "action_id": 8,
                "name": "Wrote"
            },
            "extract": "abc"
        }
    ]

    make_timeline(individual_timeline_data,the_container,startDate,endDate,tick_size,action_width)

}


document.addEventListener("DOMContentLoaded", function(){

    home_timeline()

});