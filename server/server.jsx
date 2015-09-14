Meteor.publish('videos', function() {
  return Videos.find();
});