Meteor.publish('videos', function() {
  return Videos.find({}, {sort: ['voteCount', 'desc']});
});

Meteor.startup(function() {
  ServiceConfiguration.configurations.remove({
      service: "github"
  });
  ServiceConfiguration.configurations.insert({
      service: "github",
      clientId: Meteor.settings.public.github.clientId,
      secret: Meteor.settings.github.secret
  });
})
