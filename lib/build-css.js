var fs = require("fs");
var path = require("path");
var handlebars = require("handlebars");
var util = require("./util");

module.exports = function (sprite, callback) {

    handlebars.registerHelper("url", function (filepath, relation) {
        var config = sprite.config;

        if (path.basename(relation).indexOf(".") > -1) {
            relation = path.dirname(relation);
        } else {
            relation = config.cssPath;
        }

        if (config.cssUrl){
            var filename = filepath.substring(filepath.lastIndexOf('/')+1);
            return config.cssUrl + '/' + filename;
        } else {
            return path.relative(relation, filepath).replace(/\\/g, "/");
        }
    });

    handlebars.registerHelper("unit", function (value, unit, baseFontSize, modifier) {
        if (typeof modifier === "number") {
            value *= modifier;
        }
        if (unit == "rem" || unit == "em") {
            value = value / baseFontSize;
        }
        return value + ((value === 0) ? "" : unit);
    });

    handlebars.registerHelper("prefix", function (items, prefix) {
        return prefix + items.map(function (item) {
            return item.className;
        }).join(", " + prefix);
    });

    handlebars.registerHelper("prefixAll", function (sizes, prefix) {
        return sizes.map(function (size) {
            return handlebars.helpers.prefix.apply(this, [size.items, prefix]);
        }.bind(this)).join(", ");
    });


    fs.readFile(sprite.config.template, "utf-8", function (err, template) {
        if (err) {
            throw err;
        }

        var compiler = handlebars.compile(template);
        var source = compiler(sprite);

        util.write(sprite.cssPath, source, callback);
    });

};
