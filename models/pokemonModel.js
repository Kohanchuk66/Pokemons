
const mongoose = require('mongoose');

mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(con => {
    console.log('connect successful');
})

pokemonSchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true
    },
    name: String,
    hp: Number,
    attack: Number,
    defense: Number,
    specialAttack: Number,
    specialDefense: Number,
    speed: Number,
    types: Array,
    imageId: String
});

module.exports = new mongoose.model('Pokemon', pokemonSchema);
