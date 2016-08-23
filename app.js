const json2csv = require('json2csv');
const fs = require('fs');
const dookie = require('dookie');
//need working DB URI
const DB_URI = 'mongodb://user:password@ds025685-a0.mlab.com:25685/heroku_j2wnvln4'
var fields, fieldNames, opts, data;

dookie
.pull(DB_URI)
.then(json => {
  for (var key in json) {
    data = json[key].map(el => flatten(el))

    //adjust date format
    data.forEach(el => {
      if (el.hasOwnProperty('dateCreated')) {
          el['dateCreated'] = new Date(el['dateCreated']).toLocaleDateString('en-US')
      }
    })

    fields = Object.keys(data[0]);
    fieldNames = Object.assign([],fields);

    //modify field names, if necessary
    fieldNames[fieldNames.indexOf('_id')] = 'mongoId'

    opts = {
      data,
      fields,
      fieldNames,
      defaultValue: 'NULL'
    }
    console.log(`saving export-${key}.csv...`)
    fs.writeFile(`./export-${key}.csv`, json2csv(opts), err => {
      if (err) throw err;
      console.log(`file saved!`)
    })
  }
})

function flatten(data) {
    var result = {};
    function recurse (cur, prop) {
        if (Object(cur) !== cur) {
            result[prop] = cur;
        } else if (Array.isArray(cur)) {
             for(var i=0, l=cur.length; i<l; i++)
                 recurse(cur[i], prop + "[" + i + "]");
            if (l == 0)
                result[prop] = [];
        } else {
            var isEmpty = true;
            for (var p in cur) {
                isEmpty = false;
                recurse(cur[p], prop ? prop+"."+p : p);
            }
            if (isEmpty && prop)
                result[prop] = {};
        }
    }
    recurse(data, "");
    return result;
}
