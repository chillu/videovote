Videos = new Mongo.Collection('videos');

Meteor.methods({
  'videos/add': (url) => {
    var response, embedData, video, service, existing;

    // oEmbed needs to run on server
    if(!Meteor.isServer) {
      return
    }

    service = Meteor.npmRequire('oembed-node').init();
    response = Async.runSync(function(done) {
      service.get({url: url}, function(err, data) {
        done(err, data)
      })
    })

    if(response.error) {
      throw new Meteor.Error('No video found')
    }

    embedData = response.result;

    // Check for dupllicates
    console.log(embedData)
    if(Videos.findOne({url: embedData.video_url})) {
      throw new Meteor.Error('Video already exists')
    }

    // Insert video
    video = {
      url: embedData.video_url,
      thumbnailUrl: embedData.thumbnail_url,
      thumbnailWidth: embedData.thumbnail_width,
      thumbnailHeight: embedData.thumbnail_height,
      title: embedData.title,
      html: embedData.html,
      duration: embedData.duration,
      description: embedData.description
    }
    id = Videos.insert(video)

    return id;
  },
  'videos/vote': (id) => {
    var video = Videos.findOne({_id: id})

    if(!video) {
      throw new Meteor.Error('Video not found')
    }

    Videos.update(id, {
      $addToSet: {votes: [{userId: '123'}]}
    })
  }
})
