/* global Meteor, ServiceConfiguration, Videos */

Meteor.publish('videos', function () {
  return Videos.find({}, {sort: ['voteCount', 'desc']})
})

Meteor.publish('userData', function () {
  return Meteor.users.find({}, {fields: {_id: 1, 'services.github.username': 1}})
})

Meteor.startup(function () {
  ServiceConfiguration.configurations.remove({
    service: 'github'
  })
  ServiceConfiguration.configurations.insert({
    service: 'github',
    clientId: Meteor.settings.public.github.clientId,
    secret: Meteor.settings.github.secret
  })
})
