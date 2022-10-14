const { TENOR_KEY, GIPHY_KEY, IMGUR_ID } = require("./util");
const shuffle = require("./shuffle-array");
const { get } = require("./get");
var source,
    query,
    term,
    limit;
const gfetch = async (options = { source, term, limit }) => {
  if (typeof options.source != 'undefined') {
    source = options.source;
  }
  if (typeof options.limit != 'undefined') {
    limit = options.limit
  }
  if (typeof options.term != 'undefined') {
    term = options.term
  }
  switch (term.toLowerCase()) {
    case 'slap':
      query = ["anime-slap","anime-girl-slap"];
      break;
    case 'hug':
      query = ["anime-hug","anime-hugging","anime-cuddle","anime-girl-cuddle"];
      break;
    case 'kiss':
      query = ["anime-kiss","anime-girl-kissing"];
      break;
    case 'cry':
      query = ["anime-crying","anime-girl-crying","anime-sad"];
      break;
    case 'love':
      query = ["anime-dating","anime-lover","anime-couple-sleep"];
      break;
    case 'angry':
      query = ["anime-angry","anime-girl-angry"];
      break;
    case 'smart':
      query = ["anime-smart","anime-girl-smart"];
      break;
    case 'clap':
      query = ["anime-clap","anime-girl-clap"];
      break;
    case 'cat':
      query = ["cat","cute-cat"]
      break;
    case 'dog':
      query = ["dog","cute-dog"]
      break;
    case 'frog':
      query = ["frog","green-frog"]
      break;
    case 'butterfly':
      query = ["butterfly","cute-butterfly"]
      break;
    case 'fox':
      query = ["fox","cute-fox"]
      break;
    case 'lion':
      query = ["lion","cute-lion"]
      break;
    default:
      throw Error("Search term required")
  }
  
  var search_term = shuffle.pick(query, { 'picks' : 1 });
    
  switch (source.toUpperCase()) {
    case 'TENOR':
      let tenorUri = await get.json(`https://g.tenor.com/v1/search?q=${search_term}&key=${TENOR_KEY}&limit=${limit}`);
      let tresult = shuffle.pick(tenorUri.data.results, { 'picks':1});
      return tresult.media[0].mediumgif.url
      break;
    case 'GIPHY':
      let giphyUri = await get.json(`https://api.giphy.com/v1/gifs/search?q=${search_term}&api_key=${GIPHY_KEY}&limit=${limit}`);
      let gresult = shuffle.pick(giphyUri.data.data, { 'picks' : 1 });
      return gresult.images.downsized_medium.url
      break;
    case 'IMGUR':
      let imgurUri = await get.crud({
        method: "get",
        url: `https://api.imgur.com/3/gallery/search?q=${search_term}&q_type=gif`,
        headers: {
          'content-type': 'application/json',
          'Authorization': `Client-ID ${IMGUR_ID}`}
      });
      let iresult = shuffle.pick(imgurUri.data.data, { 'picks' : 1 });
      return iresult.images[0].link
      break;
    default:
      throw Error("No source specified")
  }
  
}

module.exports = gfetch;
exports.default = gfetch;