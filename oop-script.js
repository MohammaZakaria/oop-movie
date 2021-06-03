//the API documentation site https://developers.themoviedb.org/3/

class App {
    static async run() {
        const items = await APIService.fetchMovies()
        const sideBarItems = await APIService.fetchGenres()
        HomePage.render(items);
        HomePage.renderSideBar(sideBarItems);
    }
}

class APIService {
    static TMDB_BASE_URL = 'https://api.themoviedb.org/3';
    static MOVIE_EDN_POINT = '&append_to_response='
    static GENRES_EDN_POINT = '&with_genres='
    static QUERY_EDN_POINT = '&query='
    static async fetchMovies() {
        const type = document.querySelector('#movies-type').value
        const url = APIService._constructUrl(`movie/${type === '-' ? 'now_playing' : type}`)
        const response = await fetch(url)
        const data = await response.json()
        return data.results.map(movie => new Movie(movie))
    }
    static async fetchMovie(movieId) {
        const url = APIService._constructUrl(`movie/${movieId}`)
        const response = await fetch(url + this.MOVIE_EDN_POINT + 'credits')
        const data = await response.json()
        return new Movie(data)
    }
    static async fetchActors() {
        const url = APIService._constructUrl(`person/popular`)
        const response = await fetch(url)
        const data = await response.json()
        return data.results.map(actor => new Actor(actor))
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
        // const main = [...movies, ...actors]
        // const result = []
        // main.forEach((item, index) => {
        //     result.push(actors[index], movies[index])
        // })
        return [...movies, ...actors]
    }

    static _constructUrl(path) {
        return `${this.TMDB_BASE_URL}/${path}?api_key=${atob('NTQyMDAzOTE4NzY5ZGY1MDA4M2ExM2M0MTViYmM2MDI=')}`;
    }
}

class HomePage {
    static container = document.getElementById('container');
    static sideBar = document.getElementById('filter-genre');
    static render(array) {
        this.container.innerHTML = ''
        array.forEach(async (object) => {

            const movie = object.type === "movie" ? await APIService.fetchMovie(object.id) : []
            console.log('movie :', movie);
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
            const infoText = document.createElement("span");
            infoText.innerText = `${object.type === 'movie' ? genres[0].name : "Popularity: " + object.popularity}`
            title.textContent = `${object.type === 'movie' ? object.title : object.name}`;
            image.addEventListener("click", function () {
                ItemsDetails.run(object);
            });
            // infoDiv.appendChild(visit)

            mainDiv.appendChild(div)
            div.appendChild(image);
            div.appendChild(title);
            infoDiv.appendChild(infoText)
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
}

class FilterItems {
    static async run(object) {
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
    static renderItem(item) {
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
        const info =
            `<p id="genres">
                ${item.type === 'movie' ? `Genre:  ${item.genres[0].name} ${item.genres[1] ? `/ ${item.genres[1].name} ` : ''}
                ${item.genres[2] ? `/ ${item.genres[2].name} ` : ''} ` :
                item.type === 'actor' && item.gender === 2 ?
                    'Gender: ' + `<i class="fas fa-venus"></i>` :
                    'Gender: ' + `<i class="fas fa-mars"></i>
            </p>`}`

        ItemPage.container.innerHTML = `<div class="row" >
        <div class="col-lg-12 mtb-40">
            <button onclick="getBack()" id="back">
                <i class="fas fa-arrow-left"></i>
                Back To Movies
            </button>
          </div>
        <div class="col-md-4">
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
          <p id="movie-runtime">${item.type === 'movie' ? 'imbd rate ' : 'Popularity: '
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
        </div >
      </div >
            <h3>${item.type === 'movie' ? 'Actors' : 'Actor\'s Movies'}:</h3>`;

        const rowDiv = document.createElement('div')
        rowDiv.className = 'row col-lg-12 items-section'
        item.credits.cast.slice(0, 6).forEach(innerItem => {
            const object = item.type === 'actor' ? new Movie(innerItem) : new Actor(innerItem)
            const innerDiv = document.createElement('div')
            innerDiv.className = 'col-lg-2 col-md-4 col-sm-6 col-xs-12'
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


document.addEventListener("DOMContentLoaded", () => {
    const filterButtons = document.querySelectorAll('#filter-movieActor button')
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(button => {
                button.classList.remove('active')
                button.addEventListener('click', async (e) => {
                    e.target.classList.add('active')
                    if (e.target.id === 'get-movies') {
                        const displayOnMovies = document.querySelectorAll('.on-movies')
                        displayOnMovies.forEach(element => {
                            element.style.display = 'block'
                        })
                        const movies = await APIService.fetchMovies()
                        HomePage.render(movies);
                    } else if (e.target.id === 'get-actors') {
                        const hideOnMovies = document.querySelectorAll('.on-movies')
                        hideOnMovies.forEach(element => {
                            element.style.display = 'none'
                        })
                        const actors = await APIService.fetchActors()
                        HomePage.render(actors);
                    }
                })
            })
        })
    });
})


const getBack = async () => {
    const movies = await APIService.fetchMovies()
    const sideBarItems = await APIService.fetchGenres()
    HomePage.render(movies);
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
    const term = document.querySelector('#term')
    const items = term.value ? await APIService.search(term.value) : null
    items ? HomePage.render(items) : null;
})
const input = document.querySelector('.search-bar-nav input')
input.addEventListener('keyup', async (e) => {
    if (e.keyCode === 13) {
        const term = document.querySelector('#term')
        const items = term.value ? await APIService.search(term.value) : null
        items ? HomePage.render(items) : null;
    }
})

const filterByType = async () => {
    const items = await APIService.fetchMovies()
    HomePage.render(items);
}