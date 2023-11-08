require('dotenv/config')

const App = require('./app')

const app = new App(process.env.PORT)
app.setup().then(() => app.listen())
