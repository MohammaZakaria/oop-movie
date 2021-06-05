//the API documentation site https://developers.themoviedb.org/3/

class App {
    static async run() {
        const [items, pages] = await APIService.fetchMovies()
        const sideBarItems = await APIService.fetchGenres()
        HomePage.render(items);
        HomePage.renderPagination(pages);
        HomePage.renderSideBar(sideBarItems);
    }
}

class APIService {
    static TMDB_BASE_URL = 'https://api.themoviedb.org/3';
    static MOVIE_EDN_POINT = '&append_to_response='
    static GENRES_EDN_POINT = '&with_genres='
    static QUERY_EDN_POINT = '&query='
    static async fetchMovies(nextPrevPage = 1) {
        const type = document.querySelector('#movies-type').value
        const url = APIService._constructUrl(`movie/${type === '-' ? 'now_playing' : type}`)
        const response = await fetch(`${url}&page=${nextPrevPage}`)
        const data = await response.json()
        const page = new Page(data.page, data.total_pages, 'movie')
        const movies = data.results.map(movie => new Movie(movie))
        return [movies, page]
    }
    static async fetchMovie(movieId) {
        const url = APIService._constructUrl(`movie/${movieId}`)
        const response = await fetch(url + this.MOVIE_EDN_POINT + 'credits')
        const data = await response.json()
        return new Movie(data)
    }
    static async fetchActors(nextPrevPage = 1) {
        const url = APIService._constructUrl(`person/popular`)
        const response = await fetch(`${url}&page=${nextPrevPage}`)
        const data = await response.json()
        const page = new Page(data.page, data.total_pages, 'actor')
        const actors = data.results.map(actor => new Actor(actor))
        return [actors, page]
    }

    static async fetchActor(actorId) {
        const url = APIService._constructUrl(`person/${actorId}`)
        const response = await fetch(url + this.MOVIE_EDN_POINT + 'credits')
        const data = await response.json()
        return new Actor(data)
    }
    static async fetchGenres() {
        const url = APIService._constructUrl(`genre/movie/list`)
        const response = await fetch(url)
        const data = await response.json()
        return data.genres.map(genre => new Genre(genre))
    }
    // recommendations
    static async fetchGenreMovies(genreId) {
        const url = APIService._constructUrl(`genre/movie`)
        const response = await fetch(url + this.GENRES_EDN_POINT + genreId)
        const data = await response.json()
        return data.results.map(movie => new Movie(movie))
    }

    static async fetchGenre(genreId) {
        const url = APIService._constructUrl(`discover/movie`)
        const response = await fetch(url + genreId)
        const data = await response.json()
        return data.results.map(movie => new Movie(movie))
    }


    static async fetchVideo(movie_id) {
        const url = APIService._constructUrl(`movie/${movie_id}/videos`)
        const response = await fetch(url)
        const data = await response.json()
        return data.results
    }


    static async fetchSimilarMovies(movie_id) {
        const url = APIService._constructUrl(`/movie/${movie_id}/similar`)
        const response = await fetch(url)
        const data = await response.json()
        return data.results.map(movie => new Movie(movie))
    }

    static async search(term) {
        const treatedTerm = term.replace(' ', '+')
        const movieUrl = APIService._constructUrl(`search/movie`)
        const actorUrl = APIService._constructUrl(`search/person`)
        const moviesResponse = await fetch(movieUrl + this.QUERY_EDN_POINT + treatedTerm)
        const actorResponse = await fetch(actorUrl + this.QUERY_EDN_POINT + treatedTerm)
        const movieData = await moviesResponse.json()
        const actorData = await actorResponse.json()
        const movies = movieData.results.map(movie => new Movie(movie))
        const actors = actorData.results.map(actor => new Actor(actor))
        return [...movies, ...actors]
    }

    static _constructUrl(path) {
        return `${this.TMDB_BASE_URL}/${path}?api_key=${atob('NTQyMDAzOTE4NzY5ZGY1MDA4M2ExM2M0MTViYmM2MDI=')}`;
    }
}

class HomePage {
    static container = document.getElementById('container');
    static sideBar = document.getElementById('filter-genre');
    static pagesContainer = document.getElementById('pages');

    static render(array) {
        this.container.innerHTML = ''
        array.forEach(async (object) => {

            const movie = object.type === "movie" ? await APIService.fetchMovie(object.id) : []
            const { genres } = movie
            const mainDiv = document.createElement("div");
            mainDiv.className = 'item box col-lg-4 col-md-6';
            const div = document.createElement("div");
            div.className = 'thumbnail';
            const image = document.createElement("img");
            image.src = `${object.backdropUrl}`;
            const title = document.createElement("h3");

            const infoDiv = document.createElement("div");
            infoDiv.className = 'info';
            title.textContent = `${object.type === 'movie' ? object.title : object.name}`;

            const infoText = document.createElement("span");
            infoText.innerText = `${object.type === 'movie' ? genres[0].name : "Popularity: " + object.popularity}`
            const popularityText = document.createElement("span");
            popularityText.innerText = `${object.type === 'movie' ? object.popularity : ""}`
            image.addEventListener("click", function () {
                ItemsDetails.run(object);
            });
            // infoDiv.appendChild(visit)

            mainDiv.appendChild(div)
            div.appendChild(image);
            div.appendChild(title);
            infoDiv.appendChild(infoText)
            infoDiv.appendChild(popularityText)
            div.appendChild(infoDiv)
            this.container.appendChild(mainDiv);
        })
    }
    static renderSideBar(array) {
        this.sideBar.innerHTML = ''
        array.forEach(object => {
            const btn = document.createElement("button");
            btn.className = 'btn filter-button-genres';
            btn.id = object.id;
            btn.innerText = object.name;
            btn.addEventListener("click", function () {
                FilterItems.run(object);
                Toggle.filterButtons(btn)
            });
            this.sideBar.appendChild(btn);
        })
    }

    static renderPagination(page) {
        document.querySelector('#pages').classList.remove('hide-section');
        const current = page.current_page
        const type = page.object_type
        const total = page.total_pages
        this.pagesContainer.innerHTML = ''
        const paginationButtons = document.createElement('div')
        for (let index = 1; index <= total; index++) {
            const button = document.createElement('button')
            button.className = `${index === current ? 'current' : ''}`
            button.innerText = index
            button.addEventListener('click', async () => {
                const [items, pages] = type === 'movie' ? await APIService.fetchMovies(index) : await APIService.fetchActors(index)
                CardsWithPages.run(items, pages)
            })
            paginationButtons.appendChild(button);
        }
        this.pagesContainer.appendChild(paginationButtons);
    }
}

class CardsWithPages {
    static async run(items, pages) {
        HomePage.render(items);
        HomePage.renderPagination(pages);
    }
}


class FilterItems {
    static async run(object) {
        document.querySelector('#pages').classList.remove('hide-section');
        const items = await APIService.fetchGenreMovies(object.id)
        HomePage.render(items);
    }
}

class ItemsDetails {
    static async run(object) {
        const details = object.type === 'movie' ?
            await APIService.fetchMovie(object.id) :
            await APIService.fetchActor(object.id)
        ItemPage.renderItemSection(details);
    }
}

class ItemPage {
    static container = document.getElementById('container');
    static renderItemSection(item) {
        ItemSection.renderItem(item);
    }
}


// `${item.languages[1] ? `, ${item.languages[1].name} ` : ''}
// ${item.languages[2] ? `, ${item.languages[2].name} ` 

class ItemSection {
    static async renderItem(item) {
        const videos = item.type === 'movie' ? await APIService.fetchVideo(item.id) : null
        const similar = item.type === 'movie' ? await APIService.fetchSimilarMovies(item.id) : []
        document.querySelector('#pages').classList.add('hide-section');

        const mainFlat = document.querySelector('.main');
        mainFlat.querySelector('#sidebar').classList.add('hidden')
        const mainView = mainFlat.querySelector('.cards')
        mainView.classList.remove('col-lg-9')
        mainView.classList.add('col-lg-12')
        const [language1, language2, language3] = item.languages ? item.languages : [{ name: 'Language is not defined' }]
        const director = item.type === 'movie' ? item.credits.crew.filter(person => {
            if (person.job === 'Director') {
                person.name
                return person.name
            }
        }) : []
        let companyName = 'Not Found'
        let logo_url = './assets/imgs/no-logo.png'
        if (item.type === "movie" && item.companies.length > 0) {
            companyName = item.companies[0].name
            if (item.companies[0].logo_path) {
                logo_url = `http://image.tmdb.org/t/p/w780${item.companies[0].logo_path}`
            }
        }


        const YouTubeVideo = videos !== null && videos.length > 0 ? `
        <iframe 
        class="iframe"
            height="300" 
            src="https://www.youtube.com/embed/${videos[0].key}" 
            title="${videos[0].name}" 
            frameborder="0"
            allow="accelerometer; 
            autoplay; 
            clipboard-write; 
            encrypted-media; 
            gyroscope; picture-in-picture" 
            allowfullscreen>
        </iframe>
        ` : ''
        const info =
            `<p id="genres">
                ${item.type === 'movie' ? `Genre:  ${item.genres[0].name} ${item.genres[1] ? `/ ${item.genres[1].name} ` : ''}
                ${item.genres[2] ? `/ ${item.genres[2].name} ` : ''} ` :
                item.type === 'actor' && item.gender === 2 ?
                    'Gender: ' + `<i class="fas fa-venus"></i>` :
                    'Gender: ' + `<i class="fas fa-mars"></i>
            </p>`}`

        ItemPage.container.innerHTML = `<div class="row">
        <div class="col-lg-12 mtb-40">
            <button onclick="getBack()" id="back">
                <i class="fas fa-arrow-left"></i>
                Back To Movies
            </button>
          </div>
        <div class=" col-lg-4 col-md-4 col-xs-12 col-sm-12">
          <img id="movie-backdrop" src=${item.backdropUrl}> 
          ${item.type === 'movie' ?
                `<p class="mt-40">Production Company: ${companyName}</p>
                <img class="movie-company-logo" src=${logo_url}> `
                : ''}
          </div>
          <div class="col-md-8">
          <h2 id="movie-title">${item.type === 'movie' ? item.title : item.name}</h2>
          ${info}
          <p id="movie-release-date">${item.type === 'movie' ? 'Release Date: '
                + item.releaseDate : 'Birth Date: '
            + item.birthday}</p>
          <p id="movie-runtime">${item.type === 'movie' ? 'Run Time: '
                + item.runtime : 'Birth Place: '
            + item.place_of_birth}</p>
          <p id="movie-runtime">${item.type === 'movie' ? 'Popularity: '
                + item.popularity : 'Popularity: '
            + item.popularity}</p>
          <p id="movie-runtime">
          ${item.type === 'movie' ? `Languages:  
          ${language1.name} ${language2 ? ', '
                    + language2.name : ''} ${language3 ? ', '
                        + language3.name : ''}` : ''}
          </p >
          <p id="movie-runtime">
          ${director.length > 0 ? `Director:  ${director[0].name}` : ''}
          </p >

          
        <h3>${item.type === 'movie' ? 'Overview' : "Biography"}:</h3>
          <p id="movie-overview">${item.type === 'movie' ? item.overview : item.biography}</p>

          <div>
          ${YouTubeVideo}
          </div>
        </div >
      </div >
            <h3>${item.type === 'movie' ? 'Actors' : 'Actor\'s Movies'}:</h3>`;

        const rowDiv = document.createElement('div')
        rowDiv.className = 'row col-lg-12 items-section'
        item.credits.cast.slice(0, 6).forEach(innerItem => {
            const object = item.type === 'actor' ? new Movie(innerItem) : new Actor(innerItem)
            const innerDiv = document.createElement('div')
            innerDiv.className = 'col-lg-2 col-md-4 col-sm-6 col-xs-12 scale-on-hover'
            innerDiv.innerHTML = `
                    <img class="actor-profile"
            alt="${item.type === 'actor' ? object.title : object.name}"
            src=${item.type === 'actor' ? object.backdropUrl : object.backdropProfileUrl}> 
                <h4 class="actor-name">
                    ${item.type === 'actor' ?
                    object.title : object.name}
                </h4>
                  <h4 class="actor-character">${item.type === 'actor' ? '' : object.character}</h4>`;
            innerDiv.addEventListener("click", function () {
                ItemsDetails.run(object);
            });
            rowDiv.appendChild(innerDiv)
        })

        ItemPage.container.appendChild(rowDiv)


        const mainDiv = document.createElement('div')
        mainDiv.className = `row col-lg-12 ${item.type === 'movie' ? '' : 'hide-section'} `
        mainDiv.innerHTML = `<h3>${item.type === 'movie' ? 'Similar Movies:' : ''}</h3>`
        const similarRowDiv = document.createElement('div')
        similarRowDiv.className = `row col-lg-12 items-section`
        similar.slice(0, 6).forEach(innerItem => {
            const object = innerItem
            const innerDiv = document.createElement('div')
            innerDiv.className = 'col-lg-2 col-md-4 col-sm-6 col-xs-12 scale-on-hover'
            innerDiv.innerHTML = `
                    <img class="actor-profile"
            alt="${item.type === 'movie' ? object.title : ''}"
            src=${item.type === 'movie' ? object.backdropUrl : ''}> 
                <h4 class="actor-name">
                    ${item.type === 'movie' ?
                    object.title : ''}
                </h4>`;
            innerDiv.addEventListener("click", function () {
                ItemsDetails.run(object);
            });
            similarRowDiv.appendChild(innerDiv)
            mainDiv.appendChild(similarRowDiv)
        })

        ItemPage.container.appendChild(mainDiv)
    }
}

class Movie {
    static BACKDROP_BASE_URL = 'http://image.tmdb.org/t/p/w780';

    // TODO add type to class
    constructor(json) {
        this.type = 'movie';
        this.id = json.id;
        this.title = json.title;
        this.genres = json.genres;
        this.popularity = json.popularity;
        this.releaseDate = json.release_date;
        this.runtime = json.runtime + " minutes";
        this.languages = json.spoken_languages;
        this.companies = json.production_companies;
        this.overview = json.overview;
        this.credits = json.credits;
        this.backdropPath = json.backdrop_path;
    }

    get backdropUrl() {
        return this.backdropPath ? Movie.BACKDROP_BASE_URL + this.backdropPath : "./assets/imgs/no-poster.jpg";
    }
}

class Actor {
    static BACKDROP_BASE_URL = 'http://image.tmdb.org/t/p/w780';
    static BACKDROP_BASE_URL_PROFILE = 'http://image.tmdb.org/t/p/w92';
    constructor(json) {
        this.type = 'actor';
        this.id = json.id;
        this.gender = json.gender;
        this.character = json.character;
        this.name = json.name;
        this.credits = json.credits;
        this.popularity = json.popularity;
        this.birthday = json.birthday;
        this.biography = json.biography;
        this.place_of_birth = json.place_of_birth;
        this.backdropPath = json.profile_path;
    }
    get backdropProfileUrl() {
        return this.backdropPath ? Actor.BACKDROP_BASE_URL_PROFILE + this.backdropPath : "./assets/imgs/no-image.svg";
    }
    get backdropUrl() {
        return this.backdropPath ? Actor.BACKDROP_BASE_URL + this.backdropPath : "./assets/imgs/no-image.svg";
    }
}


class Page {
    constructor(page, total_pages, object_type) {
        this.type = 'page';
        this.object_type = object_type;
        this.current_page = page;
        this.total_pages = total_pages;
    }
}



class Genre {
    constructor(json) {
        this.type = 'genre';
        this.id = json.id;
        this.name = json.name;
    }
}


document.addEventListener("DOMContentLoaded", App.run);



class Toggle {
    static filterButtons(button) {
        const buttons = document.querySelectorAll('#filter-genre button')
        buttons.forEach(btn => {
            btn.classList.remove('active')
        })
        button.classList.add('active')
    };
}


// document.addEventListener("DOMContentLoaded", () => {
//     const filterButtons = document.querySelectorAll('#filter-movieActor button')
//     filterButtons.forEach(button => {
//         button.addEventListener('click', () => {
//             filterButtons.forEach(button => {
//                 button.classList.remove('active')
//                 button.addEventListener('click', async (e) => {
//                     e.target.classList.add('active')
//                     if (e.target.id === 'get-movies') {
//                         const displayOnMovies = document.querySelectorAll('.on-movies')
//                         displayOnMovies.forEach(element => {
//                             element.style.display = 'block'
//                         })
//                         const [items, pages] = await APIService.fetchMovies()
//                         CardsWithPages.run(items, pages)
//                     } else if (e.target.id === 'get-actors') {
//                         const hideOnMovies = document.querySelectorAll('.on-movies')
//                         hideOnMovies.forEach(element => {
//                             element.style.display = 'none'
//                         })
//                         const [items, pages] = await APIService.fetchActors()
//                         CardsWithPages.run(items, pages)
//                     }
//                 })
//             })
//         })
//     });
// })


const getMoviesBtn = document.querySelector('#get-movies')
const getActorsBtn = document.querySelector('#get-actors')
getMoviesBtn.classList.add('active')

getMoviesBtn.addEventListener('click', async () => {
    getActorsBtn.classList.remove('active');
    getMoviesBtn.classList.add('active')
    const displayOnMovies = document.querySelectorAll('.on-movies')
    displayOnMovies.forEach(element => {
        element.style.display = 'block'
    })
    const [items, pages] = await APIService.fetchMovies()
    CardsWithPages.run(items, pages)
})
getActorsBtn.addEventListener('click', async () => {
    getMoviesBtn.classList.remove('active');
    getActorsBtn.classList.add('active')
    const hideOnMovies = document.querySelectorAll('.on-movies')
    hideOnMovies.forEach(element => {
        element.style.display = 'none'
    })
    const [items, pages] = await APIService.fetchActors()
    CardsWithPages.run(items, pages)
})

const getBack = async () => {
    const [items, pages] = await APIService.fetchMovies()
    const sideBarItems = await APIService.fetchGenres()
    CardsWithPages.run(items, pages)
    HomePage.renderSideBar(sideBarItems);
    setTimeout(() => {
        const mainFlat = document.querySelector('.main');
        const sidebar = document.querySelector('#sidebar')
        sidebar.classList.remove('hidden')
        const mainView = mainFlat.querySelector('.cards')
        mainView.classList.remove('col-lg-12')
        mainView.classList.add('col-lg-9')
    }, 80);
}

const searchButton = document.querySelector('#search-btn')
searchButton.addEventListener('click', async (e) => {
    document.querySelector('#pages').classList.add('hide-section');
    const term = document.querySelector('#term')
    const items = term.value ? await APIService.search(term.value) : null
    items ? HomePage.render(items) : null;
})
const input = document.querySelector('.search-bar-nav input')
input.addEventListener('keyup', async (e) => {
    document.querySelector('#pages').classList.add('hide-section');

    if (e.keyCode === 13) {
        const term = document.querySelector('#term')
        const items = term.value ? await APIService.search(term.value) : null
        items ? HomePage.render(items) : null;
    }
})

const filterByType = async () => {
    const [items, pages] = await APIService.fetchMovies()
    CardsWithPages.run(items, pages)
}