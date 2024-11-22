const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'moviesData.db')
let db = null
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log('Server is running at http://localhost:3000')
    })
  } catch (e) {
    console.log(`DB ERROR: ${e.message}`)
    process.exit(1)
  }
}
initializeDbAndServer()

// API-1
app.get('/movies/', async (request, response) => {
  const getAllMovies = `SELECT * FROM movie ORDER BY movie_id`
  const allMovies = await db.all(getAllMovies)
  response.send(allMovies.map(eachItem => ({movieName: eachItem.movie_name})))
})

//API-2
app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const postMovie = `INSERT INTO movie (director_id,movie_name,lead_actor) VALUES (${directorId},'${movieName}','${leadActor}')`
  await db.run(postMovie)
  response.send('Movie Successfully Added')
})

//API-3
app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getOneMovie = `SELECT * FROM movie WHERE movie_id=${movieId}`
  const getQuery = await db.get(getOneMovie)
  response.send({
    movieId: getQuery.movie_id,
    directorId: getQuery.director_id,
    movieName: getQuery.movie_name,
    leadActor: getQuery.lead_actor,
  })
})

//API-4
app.put('/movies/:movieId/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const {movieId} = request.params
  const updateQuery = `UPDATE movie SET director_id=${directorId}, movie_name='${movieName}',lead_actor='${leadActor}' WHERE movie_id=${movieId}`
  await db.run(updateQuery)
  response.send('Movie Details Updated')
})

//API-5
app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteQuery = `DELETE FROM movie WHERE movie_id=${movieId}`
  await db.run(deleteQuery)
  response.send('Movie Removed')
})

//API-6
app.get('/directors/', async (request, response) => {
  const getAllDirectors = `SELECT * FROM director`
  const allDirectors = await db.all(getAllDirectors)
  response.send(
    allDirectors.map(eachItem => ({
      directorId: eachItem.director_id,
      directorName: eachItem.director_name,
    })),
  )
})

//API-7
app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getDirector = `SELECT movie_name FROM movie WHERE director_id=${directorId}`
  const getResult = await db.all(getDirector)
  response.send(
    getResult.map(each => ({
      movieName: each.movie_name,
    })),
  )
})
module.exports = app
