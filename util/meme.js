// This file is under MIT LICENSE

const { get } = require('./get');
const shuffle = require('./shuffle-array');

var searchType = [
    'meme',
    'hot',
    'top',
    'rising'
];

var memeSubreddit = [
    'memes',
    'AdviceAnimals',
    'AdviceAnimals+funny+memes',
    'funny',
    'PrequelMemes',
    'SequelMemes',
    'MemeEconomy',
    'ComedyCemetery',
    'dankmemes',
    'terriblefacebookmemes',
    'shittyadviceanimals',
    'wholesomememes',
    'me_irl',
    '2meirl4meirl',
    'i_irl',
    'meirl',
    'BikiniBottomTwitter',
    'trippinthroughtime',
    'boottoobig',
    'HistoryMemes',
    'OTMemes',
    'starterpacks',
    'gifs',
    'rickandmorty',
    'FellowKids',
    'Memes_Of_The_Dank',
    'raimimemes',
    'comedyhomicide',
    'lotrmemes',
    'freefolk',
    'GameOfThronesMemes',
    'howyoudoin',
    'HolUp',
    'meme',
    'memeswithoutmods',
    'dankmeme',
    'suicidebywords',
    'puns',
    'PerfectTiming'
];

var wallpaperSubreddit = [
    'wallpaper',
    'wallpapers',
    'iWallpaper',
    'multiwall',
    'ImaginaryStarscapes',
    'ImaginaryLandscapes',
    'ImaginaryFuturism',
    'phonewallpapers',
    'MobileWallpaper',
    'iphonewallpapers',
    'iphonexwallpapers',
    'ImaginaryBestOf',
    'ReasonableFantasy',
    'BirdsForScale',
    'SympatheticMonsters',
    'EpicMounts',
    'ImaginaryBehemoths',
    'ImaginaryLeviathans',
    'ImaginaryColorscapes',
    'ImaginaryCityscapes',
    'ImaginaryMindscapes',
    'Cyberpunk',
    'ImaginaryCyberpunk',
    'ImaginaryFeels',
    'ImaginaryTechnology',
    'wallpaperengine'
];
var maxRetryLimit = 50;

/**
 * Fetch images.
 * 
 * @param {Object} options The default options for the instance
 * @return {Array} array of images
 */
 var randomNumber = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * Check if url is image url
 * 
 * @param {String} url
 * @param {boolean} includeGif | should include gif
 * @return {Boolean}
 */
var isImageUrl = (url, includeGif = true) => {
    if (includeGif) {
        return !(url.includes('.gifv')) && (url.includes('.jpg') || url.includes('.png') || url.includes('.gif') || url.includes('.jpeg'));
    } else {
        return !(url.includes('.gifv')) && (url.includes('.jpg') || url.includes('.png') || url.includes('.jpeg'));
    }
}

/**
 * Format the raw post
 * 
 * @param {Object} post
 * @param {string} type
 * @return {Object} formatted posts
 */
var formatPost = (post, type) => {
    return {
        id: typeof post.id !== 'undefined' ? post.id : null,
        type: type,
        title: typeof post.title !== 'undefined' ? post.title : null,
        postLink: typeof post.id !== 'undefined' ?  'https://redd.it/' + post.id : null,
        image: typeof post.url !== 'undefined' ? post.url : null,
        thumbnail: typeof post.thumbnail !== 'undefined' ? post.thumbnail : null,
        subreddit: typeof post.subreddit !== 'undefined' ? post.subreddit : null,
        NSFW: typeof post.over_18 !== 'undefined' ? post.over_18 : null,
        spoiler: typeof post.spoiler !== 'undefined' ? post.spoiler : null,
        createdUtc: typeof post.created_utc !== 'undefined' ? post.created_utc : null,
        upvotes: typeof post.ups !== 'undefined' ? post.ups : null,
        upvoteRatio: typeof post.upvote_ratio !== 'undefined' ? post.upvote_ratio : null,
    };
}
var type,
    subreddit,
    addSubreddit,
    removeSubreddit;
var mefetch = async (options = { type, subreddit, addSubreddit, removeSubreddit }) => {
    try {
        let searchLimit = 75;
        let total = 1;
        let shuftype = shuffle.pick(searchType, { 'picks': searchType.length })
        let retype = shuftype[Math.floor(Math.random() * shuftype.length)]
        let type = (options.type ? options.type : retype) || retype;
        let subreddit = (options.subreddit ? options.subreddit : memeSubreddit) || memeSubreddit;
        
        if (typeof options === "object" && typeof options.type !== 'undefined') {
            if (options.type === 'wallpaper') {
                type = 'wallpaper';
                subreddit = wallpaperSubreddit;
            } else if (options.type === 'custom') {
                type = 'custom';
                subreddit = [];
            }
        }

        if (typeof options === "object") {
            if (typeof options.total !== 'undefined') {
                if (options.total > 50) {
                    throw Error('max value of total is 50');
                } else if (options.total < 1) {
                    throw Error('min value of total is 1');
                } else {
                    total = options.total;
                }
            }

            if (typeof options.addSubreddit !== 'undefined') {
                subreddit = subreddit.concat(options.addSubreddit);
            }

            if (typeof options.removeSubreddit !== 'undefined') {
                options.removeSubreddit.forEach(element => {
                    let index = subreddit.indexOf(element);
                    if (index !== -1) subreddit.splice(index, 1);
                });
            }

            if (type === 'custom' && typeof options.subreddit !== 'undefined') {
                subreddit = options.subreddit;
            }
        }
        
        if (!subreddit.length) {
            throw Error('Can not fetch from empty subreddit library');
        }
        
        return await getRandomPosts(parseInt(total), type, subreddit, searchLimit);
    } catch (error) {
        console.error(error);
        return [];
    }
}

/**
 * Get n random posts where n = total
 * 
 * @param {number} total 
 * @param {String} type
 * @param {Array} subreddit 
 * @param {number} searchLimit 
 * @param {number} counter 
 * @param {Array} fetchedPost
 */
var getRandomPosts = async (total, type, subreddit, searchLimit, counter = 0, fetchedPost = []) => {
    //retry limit check
    counter++;

    if (counter == maxRetryLimit) {
        throw Error('Maximum retry limit exceeded');
    }

    let response;

    try {
        //get request
        let rand = randomNumber(0, subreddit.length);

        response = await get.json('https://api.reddit.com/r/' + subreddit[rand] + '/' + shuffle.pick(searchType, { 'picks': 1 }) + '?limit=' + searchLimit);
        
    } catch (error) {
        //retry if error occurs
        return await getRandomPosts(total, type, subreddit, searchLimit, counter);
    }

    //push image only post to post array
    let postArray = response.data.data.children;

    postArray.forEach(post => {
        let includeGif = true;

        if (type === 'wallpaper') {
            includeGif = false;
        }
            
        if (typeof post.data !== "undefined" && typeof post.data.url !== "undefined" && isImageUrl(post.data.url, includeGif)) {
            fetchedPost.push(formatPost(post.data, type));
        }
    });

    //if total is not reached, retry with already fetched data 
    if (fetchedPost.length < total)
        fetchedPost = await getRandomPosts(total, type, subreddit, searchLimit, counter, fetchedPost);

    //return result as array
    if (total === 1) {
        return [shuffle.pick(fetchedPost, { 'picks': total })];
        
    }

    return shuffle.pick(fetchedPost, { 'picks': total });
    
}

module.exports = mefetch;
exports.default = mefetch;