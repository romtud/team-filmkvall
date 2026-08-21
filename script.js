const STORAGE_KEY = "filmkvall_movies";

const movieForm = document.getElementById("movieForm");
const movieInput = document.getElementById("movieInput");
const movieList = document.getElementById("movieList");
const movieCount = document.getElementById("movieCount");
const emptyState = document.getElementById("emptyState");
const formMessage = document.getElementById("formMessage");

const randomButton = document.getElementById("randomButton");
const randomResult = document.getElementById("randomResult");
const randomMovieTitle = document.getElementById("randomMovieTitle");

const favoriteContent = document.getElementById("favoriteContent");

let movies = loadMovies();

renderMovies();
renderFavorite();

/**
 * Läser filmer från localStorage.
 */
function loadMovies() {
  try {
    const savedMovies = localStorage.getItem(STORAGE_KEY);

    if (!savedMovies) {
      return [];
    }

    const parsedMovies = JSON.parse(savedMovies);

    return Array.isArray(parsedMovies) ? parsedMovies : [];
  } catch (error) {
    console.error("Kunde inte läsa sparade filmer:", error);
    return [];
  }
}

/**
 * Sparar filmer till localStorage.
 */
function saveMovies() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(movies));
}

/**
 * Lägger till en ny film.
 */
movieForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = movieInput.value.trim();

  if (!title) {
    showMessage("Skriv in en filmtitel.");
    movieInput.focus();
    return;
  }

  const alreadyExists = movies.some(
    (movie) => movie.title.toLowerCase() === title.toLowerCase(),
  );

  if (alreadyExists) {
    showMessage("Den filmen finns redan.");
    movieInput.focus();
    return;
  }

  movies.push({
    id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
    title,
    votes: 0,
  });

  saveMovies();
  renderMovies();
  renderFavorite();

  movieInput.value = "";
  formMessage.textContent = "";
  movieInput.focus();
});

/**
 * Renderar alla filmer.
 */
function renderMovies() {
  movieList.innerHTML = "";

  updateMovieCount();

  if (movies.length === 0) {
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";

  movies.forEach((movie, index) => {
    const card = createMovieCard(movie, index);
    movieList.appendChild(card);
  });
}

/**
 * Skapar ett filmkort.
 */
function createMovieCard(movie, index) {
  const card = document.createElement("article");
  card.className = "movie-card";

  const number = document.createElement("div");
  number.className = "movie-number";
  number.textContent = index + 1;

  const info = document.createElement("div");
  info.className = "movie-info";

  const title = document.createElement("div");
  title.className = "movie-title";
  title.textContent = movie.title;

  const votes = document.createElement("div");
  votes.className = "movie-votes";
  votes.textContent = `${movie.votes} ${movie.votes === 1 ? "röst" : "röster"}`;

  info.append(title, votes);

  const actions = document.createElement("div");
  actions.className = "movie-actions";

  const voteButton = document.createElement("button");
  voteButton.className = "vote-button";
  voteButton.type = "button";
  voteButton.textContent = "👍 Rösta";
  voteButton.setAttribute("aria-label", `Rösta på ${movie.title}`);

  voteButton.addEventListener("click", () => {
    voteForMovie(movie.id);
  });

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-button";
  deleteButton.type = "button";
  deleteButton.textContent = "✕";
  deleteButton.setAttribute("aria-label", `Ta bort ${movie.title}`);

  deleteButton.addEventListener("click", () => {
    deleteMovie(movie.id);
  });

  actions.append(voteButton, deleteButton);
  card.append(number, info, actions);

  return card;
}

/**
 * Röstar på en film.
 */
function voteForMovie(id) {
  const movie = movies.find((item) => item.id === id);

  if (!movie) {
    return;
  }

  movie.votes += 1;

  saveMovies();
  renderMovies();
  renderFavorite();
}

/**
 * Tar bort en film.
 */
function deleteMovie(id) {
  const movie = movies.find((item) => item.id === id);

  if (!movie) {
    return;
  }

  const confirmed = confirm(`Ta bort "${movie.title}"?`);

  if (!confirmed) {
    return;
  }

  movies = movies.filter((item) => item.id !== id);

  saveMovies();
  renderMovies();
  renderFavorite();

  randomResult.classList.add("hidden");
}

/**
 * Slumpar fram en film.
 */
randomButton.addEventListener("click", () => {
  if (movies.length === 0) {
    showMessage("Lägg till minst en film först.");
    movieInput.focus();
    return;
  }

  const randomIndex = Math.floor(Math.random() * movies.length);
  const selectedMovie = movies[randomIndex];

  randomMovieTitle.textContent = selectedMovie.title;

  randomResult.classList.remove("hidden");

  randomResult.scrollIntoView({
    behavior: "smooth",
    block: "nearest",
  });
});

/**
 * Visar filmen med flest röster.
 */
function renderFavorite() {
  if (movies.length === 0) {
    favoriteContent.innerHTML = `
            <p>Rösta på era filmer för att utse en favorit.</p>
        `;

    return;
  }

  const highestVotes = Math.max(...movies.map((movie) => movie.votes));

  if (highestVotes === 0) {
    favoriteContent.innerHTML = `
            <p>Ingen favorit ännu – dags att börja rösta!</p>
        `;

    return;
  }

  const favorites = movies.filter((movie) => movie.votes === highestVotes);

  if (favorites.length === 1) {
    const favorite = favorites[0];

    favoriteContent.innerHTML = `
            <div class="favorite-movie">
                <span class="favorite-title"></span>
                <span class="favorite-votes"></span>
            </div>
        `;

    favoriteContent.querySelector(".favorite-title").textContent =
      favorite.title;

    favoriteContent.querySelector(".favorite-votes").textContent =
      `🏆 ${favorite.votes} ${favorite.votes === 1 ? "röst" : "röster"}`;

    return;
  }

  favoriteContent.innerHTML = `
        <div class="favorite-movie">
            <span class="favorite-title"></span>
            <span class="favorite-votes"></span>
        </div>
    `;

  const titleElement = favoriteContent.querySelector(".favorite-title");

  const votesElement = favoriteContent.querySelector(".favorite-votes");

  titleElement.textContent = favorites.map((movie) => movie.title).join(" • ");

  votesElement.textContent = `🏆 ${highestVotes} röster`;
}

/**
 * Uppdaterar filmräknaren.
 */
function updateMovieCount() {
  const count = movies.length;

  movieCount.textContent = `${count} ${count === 1 ? "film" : "filmer"}`;
}

/**
 * Visar ett meddelande under inputfältet.
 */
function showMessage(message) {
  formMessage.textContent = message;

  setTimeout(() => {
    formMessage.textContent = "";
  }, 3000);
}
