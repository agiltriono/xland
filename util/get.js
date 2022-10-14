// Shortcut variable options for axios
// with different functionality for specific promises.

const axios = require("axios");

var to_json,
    to_arraybuffer,
    to_document,
    to_text,
    to_stream,
    responseType;
    
var options = {
  to_json : {
    responseType : 'json'
  },
  to_arraybuffer : {
    responseType : 'arraybuffer'
  },
  to_document : {
    responseType : 'document'
  },
  to_text : {
    responseType : 'text'
  },
  to_stream : {
    responseType : 'stream'
  }
}

var get = {
  crud : async (opt) => {
    try{
      return axios(opt)
    } catch (error) {
      console.error(error)
    }
  },
  json : async (url) => {
    try {
      return axios.get(url, options.to_json)
    } catch (error) {
      console.error(error)
    }
  },
  buffer : async (url) => {
    try {
      return axios.get(url, options.to_arraybuffer)
    } catch (error) {
      console.error(error)
    }
  },
  document : async (url) => {
    try {
      return axios.get(url, options.to_document)
    } catch (error) {
      console.error(error)
    }
  },
  text : async (url) => {
    try {
      return axios.get(url, options.to_text)
    } catch (error) {
      console.error(error)
    }
  },
  stream : async (url) => {
    try {
      return axios.get(url, options.to_stream)
    } catch (error) {
      console.error(error)
    }
  }
}
function PUT(data, url) {
 get.crud({
   method: 'put',
   url: url,
   headers: {
     'content-Type': 'application/json'
   },
   data: JSON.stringify(data)
 }).then(() => {
   //console.log("Data uploaded successfuly...")
 }).catch(err => {
   console.log("error uploading data")
 })
}
function POST(data, url) {
 get.crud({
   method: 'post',
   url: url,
   headers: {
     'content-Type': 'application/json'
   },
   data: JSON.stringify(data)
 }).then(() => {
   //console.log("Data uploaded successfuly...")
 }).catch(err => {
   console.log("error uploading data")
 })
}
function DELETE(data, url) {
 get.crud({
   method: 'delete',
   url: url,
   headers: {
     'content-Type': 'application/json'
   },
   data: data
 }).then(() => {
   //console.log("Data uploaded successfuly...")
 }).catch(err => {
   console.log("error deleting data")
 })
}
module.exports = {
  DELETE,
  POST,
  PUT
}
module.exports.get = get;
exports.default = get;