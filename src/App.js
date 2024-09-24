import { useEffect, useState } from "react";


// Calcuate average function
const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

// key to use movi api
const Key="8920f4f0";

export default function App() {

// get the watched movie data from localstorage
  let watchedMovies=JSON.parse(localStorage.getItem("watched"));

  // if no data then intialize with empty array
  if(!watchedMovies)
    watchedMovies=[];
  
  // this is for the searched movies
  const [movies, setMovies] = useState([]);
  // this is for the search query of a movie
  const [query, setQuery] = useState("");
  // for loading the data
  const [isloading,setLoading]=useState(false);
  // for checking error
  const [errorMessage,setError]=useState("");
  // for a particular movie
  const [movieId,setMovieId]=useState("");
  // for the list of watched movies
  const [watched, setWatched] = useState(watchedMovies);


// Renders the data fetch from query
  useEffect(function()
{
  async function fetchData()
  {
    setLoading(true);
    setError("");
    try{

      if(query==="")
       {
         setError("🎬 Search Your Movie!");
       }

       else{
        const res=await fetch(`http://www.omdbapi.com/?apikey=${Key}&s=${query}`);
        const data=await res.json();
  
        if(data.Response==="False"){
         throw new Error("❌Movie not Found");
        }
        
        setMovies(data.Search);
       }

      }catch (err){
        setMovies([]);
       setError("❌Movie not Found");
    }
    finally{
      setLoading(false);
    }  
  }
  fetchData();
},[query]);

  return (
    <>
      <nav className="nav-bar">
        <Logo/>
        <SearchMovie query={query} setQuery={setQuery}/>
        <FoundMovies movieLength={movies.length}/>
      </nav>

      <main className="main">
        <Box>

          {/* if data is fetching  till then show loading */}
          {isloading&&<Loader/>}

          {/* if data is fetched and no error occurs then show data*/}
          {!isloading&&!errorMessage&&<MovieList movies={movies} setMovieId={setMovieId}/>}

          {/* if no movies found then show error */}
          {errorMessage&&<Error message={errorMessage}/>}
        </Box>

        <Box>
          {/* if there is movieId then show the details of that movie else just show the list watched movies */}
          {movieId?<MovieDescription movieId={movieId} setMovieId={setMovieId} watched={watched} setWatched={setWatched}/>:
          <WatchedMovies setMovieId={setMovieId} watched={watched} setWatched={setWatched}/>}
        </Box>
        
      </main>
    </>
  );
}



function Logo()
{
  return <div className="logo">
  <span role="img"><img src="movie.png" style={{width:40,height:40}}/></span>
  <h1>MoviezWeb</h1>
</div>
}

function SearchMovie({query,setQuery})
{
  return <input
  className="search"
  type="text"
  placeholder="Search movies..."
  value={query}
  onChange={(e) => setQuery(e.target.value)}
/>
}

function FoundMovies({movieLength})
{
  return <p className="num-results">
  Found <strong>{movieLength}</strong> results
  </p>
}

function Loader()
{
  return <h1 className="loader">🔄Loading...</h1>
}

function Error({message})
{
  return <h1 className="loader">{message}</h1>
}

function Box({children})
{
  const [isOpen, setIsOpen] = useState(true);
  return <div className="box">
  <ListShowButton isOpen={isOpen} setIsOpen={setIsOpen}/>
     {isOpen && children}
   </div>
}

function ListShowButton({isOpen,setIsOpen})
{
 return <button
  className="btn-toggle"
  onClick={() => setIsOpen((open) => !open)}>
  {isOpen ? "–" : "+"}
</button>
}

// display all the movies that are found
function MovieList({movies,setMovieId})
{
  return <ul className="list list-movies">
  {movies?.map((movie) => <Movie movie={movie} key={movie.imdbID} setMovieId={setMovieId}/>
)}
</ul>
}

// Display the movie
function Movie({movie,setMovieId})
{
  return <li onClick={()=>setMovieId(movie.imdbID)}>
  <img src={movie.Poster} alt={`${movie.Title} poster`} />
  <h3>{movie.Title}</h3>
  <div>
    <p>
      <span>🗓</span>
      <span>{movie.Year}</span>
    </p>
  </div>
</li>
}

// Give movie description
function MovieDescription({movieId,setMovieId,watched,setWatched})
{
   
  const [movie,setMovie]=useState({});
  
  const {
    Title:title,
    Year: year,
    Poster:poster,
    Runtime:runtime,
    imdbRating:imdbRating,
    Plot:plot,
    Released:released,
    Actors:actors,
    Director:director,
    Genre:genre
  }=movie;

  // fetch the movie details 
  useEffect(function()
{
  async function getMovieDetails() {
    
  const res=await fetch(`http://www.omdbapi.com/?apikey=${Key}&i=${movieId}`);
  const data=await res.json();
  setMovie(data);
  }
  getMovieDetails();
},[movieId]);


// update the title of page from moviezweb to the name that movie when the click happens on the movie
useEffect(function()
{
  document.title=`Movie | ${title}`;

  return function()
  {
    document.title="MoviezWeb";
  }
},[title]);

// Add movies into the watched list
function addToWatchedList()
{
  const checkMovie=watched.find((movie)=>movie.imdbID===movieId);
  
  if(!checkMovie)
  {
    const newWatchedMovie={
      imdbID:movieId,
      poster,
      title,
      year,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0))
    };
  
     setWatched([...watched,newWatchedMovie]);

    // Add to local storage
    let watchedMovies=[...watched,newWatchedMovie];
    localStorage.setItem("watched",JSON.stringify(watchedMovies));
    

    alert(`${title} movie added to your list!`);
  }

  else{
    alert("Already in the watched list!");
  }
 
  // after adding movie to watched list close the details of that movie
  closeMovie();
  
}



function closeMovie()
{
  setMovieId("");
}



 return <div className="details">
    <header>
    <button className="btn-back" onClick={closeMovie}>&larr;</button>
    <img src={poster} alt={`Poster of ${movie}`}/>
    <div className="details-overview">
      <h2>{title}</h2>
      <p>
        {released} &bull; {runtime}
      </p>
      <p>{genre}</p>
      <p>⭐{imdbRating} IMDb rating</p>
      <button className="btn-add" onClick={addToWatchedList}>Add to Watched List</button>
    </div>
    
    </header>
    
    <section>
      <p><em>{plot}</em></p>
      <p>Starring : {actors}</p>
      <p>Directed by : {director}</p>
    </section>

  </div>
}


function WatchedMovies({setMovieId,watched,setWatched})
{
  return <>
  <WatchedMovieSummary watched={watched}/>
  <WatchedMovieList setMovieId={setMovieId} watched={watched} setWatched={setWatched}/>
  </>
}

function WatchedMovieSummary({watched})
{
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return <div className="summary">
  <h2><span>💟</span>Your Favourite Movies</h2>
  <div>
    <p>
      <span>🎭</span>
      <span>{watched.length} movies</span>
    </p>
    <p>
      <span>⭐️{avgImdbRating.toFixed(2)}</span>
    </p>
    
    <p>
      <span>⏳{avgRuntime.toFixed(2)} min</span>
    </p>
  </div>
</div>
}

function WatchedMovieList({setMovieId,watched,setWatched})
{

  function deleteWatchedMovie(movieId)
{
  const newWatchedMovies=watched.filter((movie)=>movie.imdbID!==movieId);
  alert("Deleted successfully!");
  setWatched(newWatchedMovies);

  // Deleting from local storage and resassigning the data
  localStorage.clear();
  localStorage.setItem("watched",JSON.stringify(newWatchedMovies));
}
    
  return <ul className="list list-movies">
  {watched.map((movie) => (
    <li key={movie.imdbID} >
      <img src={movie.poster} alt={`${movie.title} poster`} onClick={()=>setMovieId(movie.imdbID)}/>
      <h3 onClick={()=>setMovieId(movie.imdbID)}>{movie.title}</h3>
      <div onClick={()=>setMovieId(movie.imdbID)}>
        <p>
          <span>⭐️{movie.imdbRating}</span>
        </p>
        <p>
          <span>⏳{movie.runtime} min</span>
        </p>
      </div>
      <button className="btn-delete" onClick={()=>deleteWatchedMovie(movie.imdbID)}>X</button>
    </li>
  ))}
</ul>
}

