const { get } = require("./get");
const { FLICKR_KEY } = require("./util");
const shuffle = require("./shuffle-array");

function create (group) {
  var maxItem = group.per_page;
  var maxPages = group.pages;
  const data = {
    method: 'flickr.groups.pools.getPhotos',
    api_key: FLICKR_KEY,
    group_id: group.id,
    media: 'photos',
    per_page: maxItem,
    page: Math.floor(Math.random() * maxPages) + 1,
    format: 'json',
    nojsoncallback: 1
  };
  const parameters = new URLSearchParams(data);
  const url = `https://api.flickr.com/services/rest/?${parameters}`;
  return url
};

function format (photo, size) {
    let url = `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}`;
    let owner = photo.owner;
    let avatar = `https://live.staticflickr.com/1919/buddyicons/${photo.owner}_r.jpg`;
    if (size) {
      url += `_${size}`;
    }
    url += '.jpg';
    return {
      image : url,
      avatar: avatar,
      author : owner
    }
};

async function flickr (options = {}) {
  var group;
  
  try {
   
  if (typeof options.group != "undefined") {
    if (options.group.length > 1) {
      group = shuffle.pick(options.group, { 'picks' : 1 })
    } else {
      group = options.group[0]
    }
  } else {
    throw Error("Group id is required")
  }
  
  const { data } = await get.json(create(group));
  const obj = data.photos.photo.map((photo) => {
      return format(photo, 'q');
  })
  const list = shuffle.pick(obj, { 'picks' : 1 });
  
  return list

 } catch (error) {
   console.error(error)
 }
}

module.exports = flickr;
exports.default = flickr;