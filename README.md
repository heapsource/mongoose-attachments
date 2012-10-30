## What's mongoose-attachments?

Mongoose-Attachments is an attachments plugin for [Mongoose.js](http://mongoosejs.com/). Supports [Amazon S3](http://aws.amazon.com/es/s3/) out-of-the-box and ImageMagick transformations styles.

### Installation

    $ npm install mongoose-attachments

### Usage

The following example extens the 'Post' model to use attachments with a property called 'image' and three different styles.

    var mongoose = require('mongoose');
    var attachments = require('mongoose-attachments');
    var PostSchema = new mongoose.Schema({
      title: String,
      description: String
    });
    
    PostSchema.plugin(attachments, {
      directory: 'achievements',
        storage: {
          providerName: 's3',
          options: {
          key: '<key>',
          secret: '<secret>',
          bucket: '<bucket>'
        }
      },
      properties: {
        image: {
          styles: {
            original: {
              // keep the original file
            },
            small: {
              resize: '150x150'
            },
            medium: {
              resize: '120x120'
            },
            medium_jpg: {
              '$format': 'jpg' // this one changes the format of the image to jpg
            }
          }
        }
      }
    });
	
    var Post = mongoose.model('Post', PostSchema);

#### Using with Express.js uploads

Assuming that the HTML form sent a file in a field called 'image':

    app.post('/upload', function(req, res, next) {
      var post = new mongoose.model('Post')();
      post.title = req.body.title;
      post.description = req.body.description;
      post.attach('image', req.files.image, function(err) {	
        if(err) return next(err);
        post.save(function(err) {
          if(err) return next(err);
          res.send('Post has been saved with file!');
        });
      })	
    });

#### Using with an stand-alone app files
 
  
    var post = new mongoose.model('Post')();
    post.title = 'Title of the Post';
    post.description = 'Description of the Post';
    post.attach('image', {
        path: '/path/to/the/file.png'
      }, function(err) {	
        if(err) return next(err);
        post.save(function(err) {
          if(err) return next(err);
          console.log('Post has been Saved with file');
        });
    })	

#### Using Local Storage

    // further up: var path = require('path');
    
    MySchema.plugin(attachments, {
      directory: '/absolute/path/to/public/images',
      storage : {
        providerName: 'fs'
      },
      properties: {
        image: {
          styles: {
            original: {
              // keep the original file
            },
            thumb: {
              thumbnail: '100x100^',
              gravity: 'center',
              extent: '100x100',
              '$format': 'jpg'
            },
            detail: {
              resize: '400x400>',
              '$format': 'jpg'
            }
          }
        }
      }
    });
    MySchema.virtual('detail_img').get(function() {
      return path.join('detail', path.basename(this.image.detail.path));
    });
    MySchema.virtual('thumb_img').get(function() {
      return path.join('thumb', path.basename(this.image.thumb.path));
    });

The URL to the images would then be `http://<your host>/<mount path>/images` prepended to the value of `MyModel.detail_img` and `MyModel.thumb_img`.

### Metadata

When mongoose-attachments is used with images, it can provide basic information for each one of the specified styles:

Example:


    {
      "dims" : {
        "w" : 120,
        "h" : 103
      },
      "depth" : 8,
      "format" : "PNG",
      "oname" : "dragon.png",
      "mtime" : ISODate("2012-05-22T06:21:53Z"),
      "ctime" : ISODate("2012-05-22T06:21:53Z"),
      "size" : 26887,
      "path" : "/achievements/4fbaaa31db8cec0923000019-medium.png",
      "defaultUrl" : "http://gamygame-dev.s3.amazonaws.com/achievements/4fbaaa31db8cec0923000019-medium.png"
    }

### Styles and ImageMagick Transformations

Transformations are achieved by invoking the **convert** command from ImageMagick and passing all the properties of the style as arguments.

For more information about convert, take a look at http://www.imagemagick.org/script/command-line-options.php

Example in convert command:

    convert source.png -resize '50%' output.png

Example in plugin options:

    styles: {
      small: {
        resize: '50%'
      }
    }

#### Keeping the Original File

    styles: {
      original: {
        // no transformations
      }
    }

#### Multiples Transformations

Use another properties under the style to provide more transformations

    styles: {
      small: {
        crop: '120x120',
        blur: '5x10' //radius x stigma
      }
    }

More information about 'blur' at the [ImageMagick website] http://www.imagemagick.org/script/command-line-options.php#blur

#### Changing the Destination Format

You can change the destination format by using the special transformation '$format' with a known file extension like *png*, *jpg*, *gif*, etc.

Example:

    styles: {
      as_jpeg: {
        '$format': 'jpg'
      }
    }

Note: **DO NOT** include the dot in the extension.

#### Supported Formats

There are two possibilities to define which file formats should be supported:

1. white list (default)
2. formats listed with certain flags by `convert -list format`

##### White List

The default white list contains:

* PNG
* GIF
* TIFF
* JPEG

To add a format call the following method before using the plugin in the mongoose schema:

    attachments.registerDecodingFormat('BMP');

##### Formats Provided by ImageMagick

ImageMagick (or GraphicsMagick) list the supported formats when calling `convert -list format` (or `identify`).
The formats are flagged to show which operations are supported with each:

* `*` native blob support (only ImageMagick, not GraphicsMagick)
* `r` read support
* `w` write support
* `+` support for multiple images

You can register the formats that are supported for read operation like so:

    attachments.registerImageMagickDecodingFormats();

To register formats supporting different operations there is a more general function. Specifying certain operations will select only those formats that support all of them. Formats supporting only a subset won't be included. The following call yields the list of formats that support `read`,`write`,`multi`:

    attachments.registerImageMagickFormats({ read: true, write: true, multi: true });

If you want to use the output list that was generated for your own benefit you can specify a callback as second argument to that above method. Note, however, that in that case the supported decoding formats won't be changed on the plugin.

You could use that callback to assure that the formats you want your client to support are indeed supported by the backing ImageMagick (or GraphicsMagick) installation. For example, checking TIFF support:

    attachments.registerImageMagickFormats({ read: true }, function(error, formats) {
      if (error) throw new Error(error);
      else if (formats && formats.length > 0) {
        if (formats.indexOf('TIFF') < 0) {
          throw new Error('No TIFF support!');
        }
      } else {
        throw new Error("No formats supported for decoding!");
      }
    });

### Contributors

* [Johan Hernandez](https://github.com/thepumpkin1979)
* [Chantal Ackermann](https://github.com/nuarhu)

## License (MIT)

Copyright (c) 2011 Firebase.co - http://firebase.co

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

