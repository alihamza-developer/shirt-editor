// Shirt Data
const SHIRT_DATA = {
    width: 978,
    height: 1200,
    colors: {
        "#ffffff": {
            name: "White",
            src: "white.jpg"
        },
        "#c1bec1": {
            name: "Grey",
            src: "grey.jpg"
        },
        "#042b72": {
            name: "Navy Blue",
            src: "navy_blue.jpg"
        },
        "#8b0820": {
            name: "Bordeaux Red",
            src: "bordeaux_red.jpg"
        },
        "#000": {
            name: "Black",
            src: "black.jpg"
        },
        "#2f2f2f": {
            name: "Black mottled",
            src: "black_mottled.jpg"
        },
        "#e8e5ec": {
            name: "White mottled",
            src: "white_mottled.jpg"
        },
        "#085b51": {
            name: "Pine green",
            src: "pine_green.jpg"
        },

    },

    EXPORT_SCALE: 6,
    printArea: {
        top: 160,
        left: 226,
        width: 530,
        height: 569
    }
};

// Fonts
const FONTS = {
    'The Bold Font': 'the-bold-font.ttf',
    'Soccer League': 'soccer-league.ttf',
    'ScolaCursive': 'scolacursive.ttf',
    'Odin': 'odin.ttf',
    'Norwester': 'norwester.ttf',
    'North black': 'north-black.ttf',
    'Moon': 'moon.ttf',
    'Lumios': 'lumios.ttf',
    'Lulu': 'lulu.ttf',
    'Learning Curve': 'learning-curve.ttf',
    'Kardenio': 'kardenio.ttf',
    'Ikaros Sans Regular': 'ikaros-sans-regular.ttf',
    'HWT Artz': 'hwt-artz.ttf',
    'Helvetica': 'helvetica.ttf',
    'Gunnar': 'gunnar.ttf',
    'GaveCool': 'gavecool.ttf',
    'Garage Gothic': 'garage-gothic.ttf',
    'Fulbo Argenta': 'fulbo-argenta.ttf',
    'Fredoka One': 'fredoka-one.ttf',
    'Eastside Texture': 'eastside-texture.ttf',
    'Cooper Black': 'cooper-black.ttf',
    'Cookie': 'cookie.ttf',
    'Chloe': 'chloe.ttf',
    'Century Gothic': 'century-gothic.ttf',
    'Budidaya': 'budidaya.ttf',
    'Besom': 'besom.ttf',
    'Batwan MTS': 'batwan-mts.ttf',
    'Baskerville': 'baskerville.ttf',
    'Anthology Regular': 'anthology-regular.ttf',
    'Arial-Rounded': 'arialrounded.ttf',
    'Amatic': 'amatic.ttf',
};


// Design Popup
const DESIGNS = [
    {
        icon: 'aperitif.png',
        title: "Aperitif",
        color: "#f0d8dd",
        items: [
            "beer-pong.png",
            "mojito.png",
            "pint-of-beer.png",
            "pints-of-beer.png",
            "champagne.png",
            "heart-wine-glass.png",
            "ricou-51.png",
            "tchin-tchin.png",
            "bottle-of-wine.png",
            "pint.png",
            "cocktail.png",
            "coconut.png"
        ]
    },
    {
        icon: "sports.png",
        title: "Sports",
        color: "#daf0f4",
        items: [
            "surf.png",
            "skate.png",
            "roller.png",
            "kimono.png",
            "boxing.png",
            "zizou.png",
            "diver.png",
            "soccer-ball.png",
            "rugby-ball.png",
            "basketball.png",
            "pulpy-fiction.png",
            "petanque-balls.png",
            "worn.png",
            "skate-broke.png",
            "skier.png",
            "sneakers.png",
            "longboard.png",
            "tennis-ball.png",
            "heart-bike.png",
            "tricolor-bike.png",
            "sailboat.png",
            "ping-pong.png",
            "mask.png"
        ]
    },
    {
        title: "Animals",
        icon: "animals.png",
        color: "#d9f4e4",
        items: [
            "rabbit.png",
            "unicorn.png",
            "seagull.png",
            "mouse.png",
            "mickey.png",
            "pig.png",
            "cat.png",
            "dragon.png",
            "diplodocus.png",
            "octopus.png",
            "frog.png",
            "snake.png",
            "swallow.png",
            "sea-turtle.png",
            "fish.png",
            "bulldog.png",
            "yellow-duck.png",
            "cat-black.png",
            "rooster.png",
            "pink-dolphin.png",
            "lobster.png",
            "koala.png",
            "shark.png",
            "lion-rock.png",
            "panda.png",
            "clown-fish.png",
            "raccoon.png",
            "fox.png",
            "lion.png",
            "shark-fin.png",
            "cat-s-head.png",
            "toucan.png",
            "hen.png",
            "pink-flamingo.png",
            "giraffe.png",
            "t-rex.png",
            "otter.png",
            "wolf.png",
            "rabbits.png",
            "bear.png",
            "dog.png",
            "whale.png",
            "lama.png",
            "monkey.png",
            "piggy.png",
            "bee.png",
            "parrot.png",
            "shiba.png",
            "rooster2.png"
        ]
    },
    {
        icon: "emojis.png",
        title: "Emojis",
        color: "#f2e5d7",
        items: [
            "lovers.png",
            "in-love.png",
            "mdr.png",
            "shy.png",
            "sad.png",
            "disco.png",
            "light.png",
            "prayer.png",
            "pawn.png",
            "hourglass.png",
            "stars.png",
            "yellow-heart.png",
            "orange-heart.png",
            "red-heart.png",
            "pink-heart.png",
            "purple-heart.png",
            "blue-heart.png",
            "green-heart.png",
            "black-heart.png",
            "white-heart.png",
            "red-mouth.png",
            "coffee.png",
            "coffee-fag-and-poop.png",
            "heart.png",
            "cross-your-fingers.png",
            "djoul.png",
            "duo-heart-mrs.png",
            "duo-heart-mr.png",
            "fire.png",
            "fuck.png",
            "high-five.png",
            "like.png",
            "fishing.png",
            "perfect.png",
            "sun.png",
            "fist.png",
            "pointing.png",
            "poop.png",
            "thumb-up.png",
            "smiley-heart.png",
            "angel.png",
            "demon.png",
            "heart-ii.png",
            "little-heart.png"
        ]
    }
];

const IS_MOBILE = window.innerWidth <= 786;