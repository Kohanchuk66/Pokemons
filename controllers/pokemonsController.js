const axios = require('axios');
const Pokemon = require('../models/pokemonModel');
/*
 exports.parsePokemons = async (req, res) => {
     try {
         for (let i = 1; i <= 10; i++) {
             const pokemon = await axios.get('https://pokeapi.co/api/v2/pokemon/' + i);
             const newPokemon = new Pokemon({
                 name: pokemon.data.name
             })
             for (let statNumber in pokemon.data.stats) {
                 newPokemon[pokemon.data.stats[statNumber].stat.name] = pokemon.data.stats[statNumber].base_stat;
             }

             for (let typeNumber in pokemon.data.types) {
                 newPokemon.types.push(pokemon.data.types[typeNumber].type.name);
             }

             await newPokemon.save();

         }
     } catch (err) {
     }
 }
*/

exports.checkImage = (err, req, res, next) => {
        return res.status(400).json({
            status : 'failed',
            message: 'bad request'
        });
}

exports.checkBody = (req, res, next) =>{
    if  (Object.keys(req.body).length === 0){
        return res.status(400).json({
            status : 'failed',
            message: 'bad request'
        });
    }
    next();
}

exports.changeImageName = async (req, res, next) => {
    let extArray = await req.file.mimetype.split("/");
    let extension = extArray[extArray.length - 1];
    req.file.originalname = req.body.name + '.' + extension;
    next()
}

exports.checkPokemonsCount = async (req, res, next) =>{
    const pokemons = await Pokemon.find({});
    if (pokemons.length === 0){
        return res.status(404).json({
            status : 'failed',
            message: 'Pokemons don`t find'
        })
    }
    next();
}

exports.checkID = async (req, res, next, val) =>  {
    let pokemon = [];
    try{
        pokemon = await Pokemon.find({id: req.params.id});
    }
    catch (err){
        return res.status(404).json({
            status : 'failed',
            message: 'It isn`t id'
        });
    }

    if (pokemon.length === 0){
        return res.status(404).json({
            status : 'failed',
            message: 'No pokemon by this id'
        });
    }
    next();
}

exports.getAllPokemons = async (req, res) =>{
    try {
        let allowedParametres = ['id', 'name', 'hp', 'attack', 'defence', 'specialAttack', 'specialDefense', 'speed'];
        let sortParametr = allowedParametres.includes( req.query.sortParametr ) ? req.query.sortParametr : 'id';
        sortParametr = +req.query.sortOrder === -1 || req.query.sortOrder === 'desc' ? '-' + sortParametr : sortParametr;
        const filterOptions = req.query.filterOptions === undefined ? [] : req.query.filterOptions;

        let filter = {};

        for(let option in filterOptions){
            if (option === 'name'){
                filter.name = {"$regex" : filterOptions.name.replace(+g, " "), "$options" : "i"};
                continue;
            }
            filter[filterOptions[option].stat] = {
                    $gte: filterOptions[option].from ? +filterOptions[option].from : 0,
                    $lte: filterOptions[option].to ? +filterOptions[option].to : 1000
                }
            }


        const pokemons = await Pokemon.find(filter)
            .limit(!!req.query.limit ? +req.query.limit : 10)
            .skip(+req.query.offset)
            .sort(sortParametr);

        if (pokemons.length === 0){
            return res.status(404).json({
                status : 'failed',
                message: 'Pokemons don`t find'
            })
        }

        res.status(200).json({
            success: true,
            data: pokemons
        })

    }catch (e) {
        return res.status(404).json({
            status : 'failed',
            message: 'Invalid parameters'
        })
    }

}

exports.putWithoutId = (req, res) =>{
    return res.status(404).json({
        status : 'failed',
        message: 'It isn`t id'
    });
}

module.exports.createPokemon = async (req, res) =>{
    const pokemons = await Pokemon.find({}).sort('id');
    const pokemonWithSameName = await Pokemon.find({ name: req.body.name });
    if (pokemonWithSameName.length !== 0){
        return res.status(400).json({
            status : 'failed',
            message: 'Pokemon with this name is exists'
        });
    }
    let newId;
    try {
        const apiPokemon = await axios.get('https://pokeapi.co/api/v2/pokemon/' + req.body.name);

        newId = apiPokemon.data.id;
    }
    catch (err){
        const pokemonsData = await axios.get('https://pokeapi.co/api/v2/pokemon/');
        newId = pokemons.length !== 0 ? pokemons[pokemons.length - 1].id + 1 : 1;
        if (pokemonsData.data.count >= newId){
            newId = pokemonsData.data.count + 1;
        }
    }
    const image =  req.file.filename.split('_');
    const imageId = image[image.length - 1].split('.')[0];
    const newPokemon = new Pokemon({
        id: newId,
        name: req.body.name,
        hp: req.body.hp,
        attack: req.body.attack,
        defense: req.body.defense,
        specialAttack: req.body.specialAttack,
        specialDefense: req.body.specialDefense,
        speed: req.body.speed,
        types: req.body.types,
        imageId: imageId
    })
    await newPokemon.save();
    res.status(201).json({
        status: 'success',
        data:{
            newPokemon
        }
    })

}

exports.getPokemonById = async (req, res) =>{
    const pokemon = await Pokemon.find({'id' : req.params.id });
    res.status(200).json({
        success: true,
        data: pokemon
    })
}

exports.deletePokemon = async (req, res) =>{
    await Pokemon.deleteOne({ id: req.params.id });
    const pokemons = await Pokemon.find({});
    res.status(204).json(
        {
            status: 'success',
            data: pokemons
        });
}

exports.deleteAllPokemons = async (req, res) =>{
    await Pokemon.deleteMany({});
    res.status(204).json(
        {
            status: 'success',
            data: 'Delete successfully'
        });
}

module.exports.changePokemon = async (req, res) =>{
    const pokemonStats = await Pokemon.find({ id : req.params.id });
    const pokemon = pokemonStats[0];
    const allowedStats = ['name', 'hp', 'attack', 'defense', 'specialAttack', 'specialDefense', 'speed', 'types']
    for (stat in req.body){
        if (!allowedStats.includes(stat)){
            return res.status(404).json({
                status : 'failed',
                message: 'Invalid parameters'
            })
        }
    }
    await Pokemon.updateOne(
        { id : req.params.id },
        {
            name: req.body.name === undefined ? pokemon.name: req.body.name ,
            hp: req.body.hp === undefined ? pokemon.hp: req.body.hp ,
            attack: req.body.attack === undefined ? pokemon.attack: req.body.attack ,
            defense: req.body.defense === undefined ? pokemon.defense: req.body.defense ,
            specialAttack: req.body.specialAttack === undefined ? pokemon.specialAttack: req.body.specialAttack ,
            specialDefense: req.body.specialDefense === undefined ? pokemon.specialDefense: req.body.specialDefense ,
            speed: req.body.speed === undefined ? pokemon.speed: req.body.speed ,
            types: req.body.types === undefined ? pokemon.types: req.body.types
        }

    );
    res.status(200).json({
        status: 'success',
        data: 'Update 1 pokemon'
    })
}