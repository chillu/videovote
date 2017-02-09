# A Simple Video Voting App

This app allows users to suggest videos by pasting in their URLs.
The application will automatically retrieve and list details on the video
via the oEmbed protocol. By authenticating via Github, users can also vote on videos.

The use case for this app is company-internal "lunch and learn" sessions,
where a group of devs get together to watch interesting conference talks.

See it in action on [http://videovote.chillu.com](http://videovote.chillu.com).

## Installation

The app requires the [MeteorJS](https://www.meteor.com/) framework. Install it with:

```
curl https://install.meteor.com/ | sh
```

Then navigate to the application folder and run it:

```
meteor --settings settings.json
```

## Configuration

Create a `settings.json` file with the following content:

```json
{
  "public": {
    "github": {
      "clientId": ""
    },
    "vimeo": {
      "clientId": ""
    }
  },
  "github": {
    "secret": ""
  },
  "vimeo": {
    "secret": "",
    "accessToken": ""
  },
  "google": {
    "apiKey": ""
  }
}
```

 * Create a new [Github Developer Application](https://github.com/settings/developers)
   and fill in the `public.github.clientId` and `github.secret` values. Use the base URL of your application
   as the callback URL.
 * Create a [Google Developer API Key](https://developers.google.com/youtube/registering_an_application#Create_API_Keys)
    as a "server key" with access to the Youtube API
 * Create a [Vimeo Developer API Key](https://developer.vimeo.com/apps)

## License

The MIT License (MIT)

Copyright (c) 2015 Ingo Schommer

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
