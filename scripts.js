window.onscroll = function () { myFunction() };

var navbar = document.getElementById("navbar");
var sticky = navbar.offsetTop;
function myFunction() {
    if (window.pageYOffset > 0) {
        navbar.classList.add("sticky")
    } else {
        navbar.classList.remove("sticky");
    }
}


// const buttons = document.querySelectorAll('#filter-movieActor button')

// buttons.forEach(button => {
//     button.addEventListener('click', () => {
//         buttons.forEach(button => {
//             button.classList.remove('active')
//             button.addEventListener('click', (e) => {
//                 e.target.classList.add('active')
//             })
//         })
//     })
// });