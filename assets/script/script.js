function load_footer(){
    const footer_box = document.getElementById('footer');
    let footer_url = 'assets/content/footer.html';

    const url = window.location.href;
    const host = window.location.host;
    const pathname = window.location.pathname;
    const search = window.location.search;
    const hash = window.location.hash;
    // console.log(pathname)

    if (pathname.includes('actor-flow')){
        footer_url = '../assets/content/footer.html';
    }

    fetch(footer_url)
        .then(response => response.text())
        .then(text => footer.innerHTML = text);
}

document.addEventListener("DOMContentLoaded", function(){
    load_footer()
});
