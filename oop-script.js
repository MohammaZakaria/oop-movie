//the API documentation site https://developers.themoviedb.org/3/

class App {
    static async run() {
        const movies = await APIService.fetchMovies()
        HomePage.renderMovies(movies);
    }
}

class APIService {
    static TMDB_BASE_URL = 'https://api.themoviedb.org/3';
    static async fetchMovies() {
        const url = APIService._constructUrl(`movie/now_playing`)
        const response = await fetch(url)
        const data = await response.json()
        return data.results.map(movie => new Movie(movie))
    }
    static async fetchMovie(movieId) {
        const url = APIService._constructUrl(`movie/${movieId}`)
        const response = await fetch(`${url}&append_to_response=credits`)
        const data = await response.json()
        return new Movie(data)
    }
    static async fetchActors(movieId) {
        // &append_to_response=
        const url = APIService._constructUrl(`person/popular`)
        const response = await fetch(url)
        const data = await response.json()
        return data.results.map(actor => new Actor(actor))
    }
    static _constructUrl(path) {
        return `${this.TMDB_BASE_URL}/${path}?api_key=${atob('NTQyMDAzOTE4NzY5ZGY1MDA4M2ExM2M0MTViYmM2MDI=')}`;
    }
}

class HomePage {
    static container = document.getElementById('container');
    static renderMovies(movies) {
        this.container.innerHTML = ''
        movies.forEach(movie => {
            const mainDiv = document.createElement("div");
            mainDiv.className = 'item box col-lg-4 col-md-6';
            const movieDiv = document.createElement("div");
            movieDiv.className = 'thumbnail';
            const movieImage = document.createElement("img");
            movieImage.src = `${movie.backdropUrl}`;
            const movieTitle = document.createElement("h3");
            movieTitle.textContent = `${movie.title}`;
            movieImage.addEventListener("click", function () {
                Movies.run(movie);
            });

            mainDiv.appendChild(movieDiv)
            movieDiv.appendChild(movieTitle);
            movieDiv.appendChild(movieImage);
            this.container.appendChild(mainDiv);
        })
    }

    static renderActors(actors) {
        this.container.innerHTML = ''
        actors.forEach(actor => {
            const mainDiv = document.createElement("div");
            mainDiv.className = 'item box col-lg-4 col-md-6';
            const movieDiv = document.createElement("div");
            movieDiv.className = 'thumbnail';
            const movieImage = document.createElement("img");
            movieImage.src = `${actor.backdropUrl ? actor.backdropUrl : './assets/imgs/no-image.svg'}`;
            const movieTitle = document.createElement("h3");
            movieTitle.textContent = `${actor.name}`;
            movieImage.addEventListener("click", function () {
                Movies.run(movie);
            });

            mainDiv.appendChild(movieDiv)
            movieDiv.appendChild(movieTitle);
            movieDiv.appendChild(movieImage);
            this.container.appendChild(mainDiv);
        })
    }

}


class Movies {
    static async run(movie) {
        const movieData = await APIService.fetchMovie(movie.id)
        // const actors = await APIService.fetchActors(movie.id)
        MoviePage.renderMovieSection(movieData);
    }
}

class MoviePage {
    static container = document.getElementById('container');
    static renderMovieSection(movie) {
        MovieSection.renderMovie(movie);
    }
}

class MovieSection {
    static renderMovie(movie) {
        MoviePage.container.innerHTML = `
      <div class="row">
        <div class="col-md-4">
          <img id="movie-backdrop" src=${movie.backdropUrl}> 
        </div>
        <div class="col-md-8">
          <h2 id="movie-title">${movie.title}</h2>
          <p id="genres">${movie.genres}</p>
          <p id="movie-release-date">${movie.releaseDate}</p>
          <p id="movie-runtime">${movie.runtime}</p>
          <h3>Overview:</h3>
          <p id="movie-overview">${movie.overview}</p>
        </div>
      </div>
      <h3>Actors:</h3>`;
        const rowDiv = document.createElement('div')
        rowDiv.className = 'row actors-section'
        movie.credits.cast.forEach(actor => {
            const innerDiv = document.createElement('div')
            innerDiv.className = 'col-lg-2 col-md-4 col-sm-6 col-xs-12'
            innerDiv.innerHTML = `
              <img class="actor-profile" alt="${actor.name}" src=${actor.profile_path ? `http://image.tmdb.org/t/p/w92${actor.profile_path}` : "./assets/imgs/no-image.svg"}> 
              <h4 class="actor-name">${actor.name}</h4>
              <h4 class="actor-character">${actor.character}</h4>
          `;
            rowDiv.appendChild(innerDiv)
        })
        MoviePage.container.appendChild(rowDiv)
    }
}

class Movie {
    static BACKDROP_BASE_URL = 'http://image.tmdb.org/t/p/w780';

    constructor(json) {
        this.id = json.id;
        this.title = json.title;
        this.releaseDate = json.release_date;
        this.runtime = json.runtime + " minutes";
        this.overview = json.overview;
        this.credits = json.credits;
        this.backdropPath = json.backdrop_path;
    }

    get backdropUrl() {
        return this.backdropPath ? Movie.BACKDROP_BASE_URL + this.backdropPath : "";
    }
}

class Actor {
    static BACKDROP_BASE_URL = 'http://image.tmdb.org/t/p/w92';
    constructor(json) {
        this.id = json.cast_id;
        this.character = json.character;
        this.name = json.name;
        this.backdropPath = json.profile_path;
    }

    get backdropUrl() {
        return this.backdropPath ? Actor.BACKDROP_BASE_URL + this.backdropPath : "";
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
                    HomePage.renderMovies(movies);
                } else if (e.target.id === 'get-actors') {
                    const actors = await APIService.fetchActors()
                    HomePage.renderActors(actors);
                }
            })
        })
    })
});