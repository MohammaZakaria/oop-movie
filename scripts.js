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
// setInterval(() => {
//     const images = document.querySelectorAll('.slide')
//     images.forEach((img, index) => {
//         const imagesCount = images.length - 1
//         let tracker = 0
//         console.log(img.classList.contains('fade-in-image'));
//         if (img.classList.contains('fade-in-image')) {
//             if (index < imagesCount) {
//                 console.log(img, index + ' out of ' + imagesCount)
//                 tracker = index + 1
//                 img.classList.remove('fade-in-image')
//                 images[tracker].classList.add('fade-in-image')
//             } else if (index >= imagesCount) {
//                 img.classList.remove('fade-in-image')
//                 images[0].classList.add('fade-in-image')
//             }
//         }
//     })
// }, 3000);

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