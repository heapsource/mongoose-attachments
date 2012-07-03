// Copyright (c) 2011 Firebase.co - http://www.firebase.co
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

var attachments = require('../attachments');
var s3 = require('aws2js').load('s3');
var util = require('util');

function S3Storage(options) {
  attachments.StorageProvider.call(this, options);

  s3.setCredentials( options.key, options.secret );
  s3.setBucket( options.bucket );
  this.client = s3;
  this.endpoint = options.endpoint || ( 'https://' + options.bucket + '.s3.amazonaws.com' );
}
util.inherits(S3Storage, attachments.StorageProvider);

S3Storage.prototype.getUrl = function( path ){
  return this.endpoint + path;
};

S3Storage.prototype.createOrReplace = function(attachment, cb) {
  var self = this;
  this.client.putFile(attachment.path,attachment.filename, false,{},function(err, uploadRes) {
    if(err) return cb(err);
    attachment.defaultUrl = self.getUrl( attachment.path );
    cb(null, attachment);
  });
};

// register the S3 Storage Provider into the registry
attachments.registerStorageProvider('aws2js', S3Storage);

// export it just in case the user needs it
module.exports = S3Storage;
