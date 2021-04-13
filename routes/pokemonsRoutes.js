const express = require('express');
const router = express.Router();
const pokemonsController = require('../controllers/pokemonsController');
const multer = require('multer')
var uniqid = require('uniqid');
// pokemonsController.parsePokemons();

router.param('id', pokemonsController.checkID);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/')
    },
    filename: async function (req, file, cb) {
        let extArray = file.mimetype.split("/");
        let extension = extArray[extArray.length - 1];
        cb(null, req.body.name + '_' + uniqid() + '.' + extension)
    }
})

const fileFilter = async (req, file, cb) => {
    const allowedTypes = ['png', 'jpg', 'gif', 'jpeg'];
    const type = file.mimetype.split('/')[1];
    if(allowedTypes.includes(type)){
        cb(null, true);
    }
    else{
        cb(new Error("No image"), false);
    }
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 10
    },
})

router.route('/')
    .get(pokemonsController.checkPokemonsCount, pokemonsController.getAllPokemons)
    .post(upload.single('pokemonPhoto'), pokemonsController.checkBody, pokemonsController.checkImage, pokemonsController.createPokemon)
    .delete(pokemonsController.deleteAllPokemons)
    .put(pokemonsController.putWithoutId);
router.route('/:id')
    .get(pokemonsController.getPokemonById)
    .delete(pokemonsController.deletePokemon)
    .put( upload.single('pokemonPhoto'), pokemonsController.checkBody, pokemonsController.changePokemon);

module.exports = router;