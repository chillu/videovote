Videos = new Mongo.Collection('videos');

Meteor.methods({
  'videos/add': (url) => {
    var response, embedData, video, oembedService, googleService, existing;

    // oEmbed needs to run on server
    if(!Meteor.isServer) {
      return
    }

    if(!Meteor.user()) {
      throw new Meteor.Error('Requires user login')
    }

    oembedService = Meteor.npmRequire('oembed-node').init();
    response = Async.runSync(function(done) {
      oembedService.get({url: url}, function(err, data) {
        done(err, data)
      })
    })

    if(response.error) {
      throw new Meteor.Error('No video found')
    }

    embedData = response.result;

    // Check for duplicates
    if(Videos.findOne({url: embedData.video_url})) {
      throw new Meteor.Error('Video already exists')
    }

    // Grab video metadata
    // TODO Support different services
    videoId = embedData.video_url.match(/.*\/(.*)/)[1]
    googleService = Meteor.npmRequire('googleapis')
    googleResponse = Async.runSync(function(done) {
      googleService.youtube('v3').videos.list(
        {
          auth: Meteor.settings.google.apiKey,
          part: 'contentDetails',
          maxResults: 1,
          id: videoId
        },
        function(err, data) {
          done(err, data)
        }
      )
    })
    if(googleResponse.error) {
      throw new Meteor.Error('No video found')
    }
    var durationMins = moment.duration(googleResponse.result.items[0].contentDetails.duration).minutes()

    // Insert video
    video = {
      url: embedData.video_url,
      thumbnailUrl: embedData.thumbnail_url,
      thumbnailWidth: embedData.thumbnail_width,
      thumbnailHeight: embedData.thumbnail_height,
      title: embedData.title,
      html: embedData.html,
      durationMins: durationMins,
      description: embedData.description,
      userId: Meteor.userId(),
      votes: [
        {
          // A user should really vote for their own addition
          userId: Meteor.userId(),
          // TODO Figure out how to retrieve "protected" values from user objects on client
          username: Meteor.user().services.github.username
        }
      ]
    }
    id = Videos.insert(video)

    return id;
  },
  'videos/vote': (id) => {
    var video = Videos.findOne({_id: id})

    if(!video) {
      throw new Meteor.Error('Video not found')
    }

    if(!Meteor.user()) {
      throw new Meteor.Error('Requires user login')
    }

    if(video.votes && video.votes.filter((vote) => vote.userId === Meteor.userId())) {
      return
    }

    Videos.update(id, {
      $inc: {
        votesCount: 1
      },
      $addToSet: {votes: {
        // Automatically deduplicates
        userId: Meteor.userId(),
        username: Meteor.user().services.github.username
      }}
    })
  }
})
