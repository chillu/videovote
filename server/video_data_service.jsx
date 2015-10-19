/* global Meteor, Async, moment, VideoDataServiceFactory */

class VideoDataService {
  /**
   * @return {Number} Duration in minutes
   */
  getDuration () {
    throw new Error('Not implemented')
  }
  /**
   * @param {String}
   * @return {String}
   */
  getIdFromUrl (url) {
    throw new Error('Not implemented')
  }
}

class YoutubeVideoDataService extends VideoDataService {
  constructor () {
    super()
    this._api = Meteor.npmRequire('googleapis')
    this._apiKey = Meteor.settings.google.apiKey
  }
  getDuration (id) {
    var api = this._api
    var apiKey = this._apiKey
    var response = Async.runSync(function (done) {
      api.youtube('v3').videos.list(
        {
          auth: apiKey,
          part: 'contentDetails',
          maxResults: 1,
          id: id
        },
        function (err, data) {
          done(err, data)
        }
      )
    })
    if (response.error) {
      throw new Meteor.Error('No video found')
    }
    return moment.duration(response.result.items[0].contentDetails.duration).minutes()
  }
  getIdFromUrl (url) {
    return url.match(/.*\/(.*)/)[1]
  }
}

VideoDataServiceFactory = {
  services: {
    YouTube: YoutubeVideoDataService
  },
  /**
   * @param {String}
   * @return {VideoDataService}
   */
  createFromProviderName (name) {
    var Service = this.services[name]
    return Service ? new Service : null
  }
}
