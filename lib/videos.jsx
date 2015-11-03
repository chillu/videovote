/* global Meteor, Async, Videos, VideoDataServiceFactory */

Videos = new Mongo.Collection('videos')

Meteor.methods({
  'videos/add': (url) => {
    var response
    var embedData
    var video
    var videoId
    var oembedService
    var videoDataService
    var durationMins

    // oEmbed needs to run on server
    if (!Meteor.isServer) {
      return
    }

    if (!Meteor.user()) {
      throw new Meteor.Error('Requires user login')
    }

    oembedService = Meteor.npmRequire('oembed-node').init()
    response = Async.runSync((done) => {
      oembedService.get({url: url}, (err, data) => {
        done(err, data)
      })
    })

    if (response.error) {
      throw new Meteor.Error('No video found')
    }

    embedData = response.result

    // Check for duplicates
    if (Videos.findOne({url: embedData.video_url})) {
      throw new Meteor.Error('Video already exists')
    }

    // Grab video metadata
    videoDataService = VideoDataServiceFactory
      .createFromProviderName(embedData.provider_name)

    if (!videoDataService) {
      throw new Meteor.Error('Video cannot be processed')
    }

    if (embedData.video_id) {
      videoId = embedData.video_id
    } else {
      videoId = videoDataService.getIdFromUrl(embedData.video_url)
    }

    durationMins = videoDataService.getDuration(videoId)

    // Insert video
    video = {
      createdAt: Date.now(),
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
          username: Meteor.user().services.github.username
        }
      ],
      votesCount: 1
    }
    return Videos.insert(video)
  },
  'videos/vote': (id) => {
    var video = Videos.findOne({_id: id})

    if (!video) {
      throw new Meteor.Error('Video not found')
    }

    if (!Meteor.user()) {
      throw new Meteor.Error('Requires user login')
    }

    if (video.votes && video.votes.filter((vote) => vote.userId === Meteor.userId()).length) {
      // Remove vote
      Videos.update(id, {
        $inc: {
          votesCount: -1
        },
        $pull: {votes: {
          userId: Meteor.userId()
        }}
      })
    } else {
      // Add vote
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
  },
  'videos/archive': (id) => {
    var video = Videos.findOne({_id: id})

    if (!video) {
      throw new Meteor.Error('Video not found')
    }

    var user = Meteor.user()
    if (!user || !user.admin) {
      throw new Meteor.Error('Requires admin login')
    }

    Videos.update(id, {
      $set: {
        archived: true
      }
    })
  }
})
