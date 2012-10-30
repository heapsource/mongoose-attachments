// Copyright (c) 2012 IT Agenten - http://www.it-agenten.com
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.


// This 'provider' stores the images created via mongoose-attachments in the
// local file system.
// It requires that the option 'directory' points to the absolute path of
// the directory where it will create subfolders per image type.
//
// Example:
// type is 'thumb'
// and 'directory' points to /path/to/public/images/
// When storing data into the schema, the thumbnail created by mongoose-attachemnts
// is stored as /path/to/public/images/thumb/<ObjectID>-thumb.<format>
//
// The absolute path to the image is stored in Model.image.<type>.path

var attachments = require('mongoose-attachments');
var fs = require('fs');
var path = require('path');
var util = require('util');

function FsStorage(options) {
	attachments.StorageProvider.call(this, options);
}
util.inherits(FsStorage, attachments.StorageProvider);

/*
 * Returns the file system path (absolute)
 * and not the actual URL.
 */
FsStorage.prototype.getUrl = function( path ){
	return path;
};

FsStorage.prototype.createOrReplace = function(attachment, callback) {
	var self = this;
	var dirname = path.join(path.dirname(attachment.path), attachment.style.name);
	if (!fs.existsSync(dirname)) {
		var pathParts = dirname.split(path.sep);
		var p = "/";
		for (var i=0; i<pathParts.length; i++) {
			p = path.join(p, pathParts[i]);
			if (!fs.existsSync(p)) {
				fs.mkdirSync(p, '0750');
			}
		}
	}

	var basename = path.basename(attachment.path);
	if (path.extname(basename).length == 0) {
		basename = basename + "." + attachment.model.extension;
	}
	attachment.path = path.join(dirname, basename);
	fs.rename(attachment.filename, attachment.path, function(error) {
		if (error) {
			callback(error);
		} else {
			attachment.defaultUrl = self.getUrl( attachment.path );
			callback(null, attachment);
		}
	});
};

// register the File System Storage Provider into the registry
attachments.registerStorageProvider('fs', FsStorage);

// export it just in case the user needs it
module.exports = FsStorage;