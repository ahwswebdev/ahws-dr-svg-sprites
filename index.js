/*
 * dr-svg-sprites
 *
 *
 * Copyright (c) 2014 drdk
 * Licensed under the MIT license.
 */

"use strict";

module.exports = function (config, callback) {

	var path = require("path");
	var async = require("async");
	var vfs = require("vinyl-fs");
	var through = require("through2");
	var svgutil = require("./lib/svgutil");
	var Sprite = require("./lib/Sprite");
	var buildCSS = require("./lib/build-css");
	var buildSVG = require("./lib/build-svg");
	var buildPNG = require("./lib/build-png");
	var buildPreview = require("./lib/build-preview");

	var sprite = new Sprite(config);

	vfs.src(sprite.config.spriteElementPath).pipe(build(sprite));

	function build (sprite) {

		return through.obj(function (file, encoding, callback) {
			svgutil.parse(file.contents.toString(), sprite.config.svgo, function (err, data) {
				sprite.addItem(file.path, data.source, data.namespaces, data.width, data.height);
				callback(null);
			});
		}, function () {

			sprite.prepare();

			var tasks = {};

			tasks.images = function (callback) {
				buildSVG(sprite, function (err, file) {
					buildPNG(sprite, function (err, files) {
						callback(null, [file].concat(files));
					});
				});
			};
			
			if (sprite.cssPath) {
				tasks.css = function (callback) {
					buildCSS(sprite, callback);
				};
			}
			
			if (sprite.previewPath) {
				tasks.preview = function (callback) {
					buildPreview(sprite, callback);
				};
			}

			async.parallel(
				tasks,
				function (err, result) {
					if (typeof callback == "function") {
						callback(null, result);
					}
				}
			);
			
		});
		
	}

};
