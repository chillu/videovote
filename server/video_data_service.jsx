/* global Meteor, Async, moment, VideoDataServiceFactory, Math */

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

class VimeoVideoDataService extends VideoDataService {
  constructor () {
    super()
    var Vimeo = Meteor.npmRequire('vimeo').Vimeo
    this._api = new Vimeo(
      Meteor.settings.public.vimeo.clientId,
      Meteor.settings.vimeo.secret,
      Meteor.settings.vimeo.accessToken
    )
  }
  getDuration (id) {
    var api = this._api
    var response = Async.runSync(function (done) {
      api.request(
        {path: '/videos/' + id},
        (err, data, status) => {
          done(err, data)
        }
      )
    })

    if (response.error) {
      throw new Meteor.Error('No video found')
    }
    return Math.round(response.result.duration / 60)
  }
}

VideoDataServiceFactory = {
  services: {
    YouTube: YoutubeVideoDataService,
    Vimeo: VimeoVideoDataService
  },
  /**
   * @param {String}
   * @return {VideoDataService}
   */
  createFromProviderName (name) {
    var Service = this.services[name]
    return Service ? new Service() : null
  }
}
