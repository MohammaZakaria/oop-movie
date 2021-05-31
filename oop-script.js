//the API documentation site https://developers.themoviedb.org/3/

class App {
    static async run() {
        const movies = await APIService.fetchMovies()
        HomePage.render(movies);
    }
}

class APIService {
    static TMDB_BASE_URL = 'https://api.themoviedb.org/3';
    static MOVIE_EDN_POINT = '&append_to_response=credits'
    static async fetchMovies() {
        const url = APIService._constructUrl(`movie/now_playing`)
        const response = await fetch(url)
        const data = await response.json()
        return data.results.map(movie => new Movie(movie))
    }
    static async fetchMovie(movieId) {
        const url = APIService._constructUrl(`movie/${movieId}`)
        const response = await fetch(url + this.MOVIE_EDN_POINT)
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
        const response = await fetch(url + this.MOVIE_EDN_POINT)
        const data = await response.json()
        return new Actor(data)
    }

    static _constructUrl(path) {
        return `${this.TMDB_BASE_URL}/${path}?api_key=${atob('NTQyMDAzOTE4NzY5ZGY1MDA4M2ExM2M0MTViYmM2MDI=')}`;
    }
}

class HomePage {
    static container = document.getElementById('container');
    static render(array) {
        this.container.innerHTML = ''
        array.forEach(object => {
            const mainDiv = document.createElement("div");
            mainDiv.className = 'item box col-lg-4 col-md-6';
            const movieDiv = document.createElement("div");
            movieDiv.className = 'thumbnail';
            const movieImage = document.createElement("img");
            movieImage.src = `${object.backdropUrl}`;
            const movieTitle = document.createElement("h3");
            movieTitle.textContent = `${object.type === 'movie' ? object.title : object.name}`;
            movieImage.addEventListener("click", function () {
                ItemsDetails.run(object);
            });

            mainDiv.appendChild(movieDiv)
            movieDiv.appendChild(movieImage);
            movieDiv.appendChild(movieTitle);
            this.container.appendChild(mainDiv);
        })
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

class ItemSection {
    static renderItem(item) {
        const info =
            `<p id="genres">
                ${item.type === 'movie' ?
                'Genre: ' + item.genres[0].name :
                item.type === 'actor' && item.gender === 2 ?
                    'Gender: ' + `<i class="fas fa-venus"></i>` :
                    'Gender: ' + `<i class="fas fa-mars"></i>
            </p>`}`

        ItemPage.container.innerHTML = `<div class="row" >
        <div class="col-md-4">
          <img id="movie-backdrop" src=${item.backdropUrl}> 
        </div>
        <div class="col-md-8">
          <h2 id="movie-title">${item.type === 'movie' ? item.title : item.name}</h2>
         ${info}
          <p id="movie-release-date">${item.type === 'movie' ? 'Release Date: ' + item.releaseDate : 'Birth Date: ' + item.birthday}</p>
          <p id="movie-runtime">${item.type === 'movie' ? 'Run Time: ' + item.runtime : 'Birth Place: ' + item.place_of_birth}</p>
          <p id="movie-runtime">${item.type === 'movie' ? 'imbd rate ' : 'Popularity: ' + item.popularity}</p>
          <h3>${item.type === 'movie' ? 'Overview' : "Biography"}:</h3>
          <p id="movie-overview">${item.type === 'movie' ? item.overview : item.biography}</p>
        </div>
      </div>
      <h3>${item.type === 'movie' ? 'Actors' : 'Actor\'s Movies'}:</h3>`;

        const rowDiv = document.createElement('div')
        rowDiv.className = 'row items-section'
        item.credits.cast.forEach(innerItem => {
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
                console.log(object);
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


document.addEventListener("DOMContentLoaded", App.run);

const filterButtons = document.querySelectorAll('#filter-movieActor button')
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(button => {
            button.classList.remove('active')
            button.addEventListener('click', async (e) => {
                e.target.classList.add('active')
                if (e.target.id === 'get-movies') {
                    const movies = await APIService.fetchMovies()
                    HomePage.render(movies);
                } else if (e.target.id === 'get-actors') {
                    const actors = await APIService.fetchActors()
                    HomePage.render(actors);
                }
            })
        })
    })
});