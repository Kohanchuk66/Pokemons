const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');

const app = express();
const port = process.env.PORT || 3000;
require('dotenv').config({ path: './config.env' });
const pokemonRouter = require('./routes/pokemonsRoutes');

app.use(bodyParser.json());
app.use('/pokemons/', pokemonRouter);
app.use(express.urlencoded({extended: false }))
app.use('/uploads', express.static('uploads'))

// const storage = multer.diskStorage({
//     destination: function(req, file, cb) {
//         cb(null, 'uploads/');
//     },
//
//     filename: function(req, file, cb) {
//         cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
//     }
// });

// app.post('/upload-profile-pic', async(req, res) => {
//
//     let upload =await multer({ storage: storage, fileFilter: helpers.imageFilter }).single('profile_pic');
//     console.log(req.body.file)
//     upload(req, res, function(err) {
//
//         if (req.fileValidationError) {
//             return res.send(req.fileValidationError);
//         }
//         else if (!req.file) {
//             return res.send('Please select an image to upload');
//         }
//         else if (err instanceof multer.MulterError) {
//             return res.send(err);
//         }
//         else if (err) {
//             return res.send(err);
//         }
//
//         res.send(`You have uploaded this image: <hr/><img src="${req.file.path}" width="500"><hr /><a href="./">Upload another image</a>`);
//     });
// });

app.listen(port, () => {
    console.log('app running');
})
