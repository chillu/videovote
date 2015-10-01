App = React.createClass({
  mixins: [ReactMeteorData],

  getMeteorData() {
    var subHandle = Meteor.subscribe('videos');

    return {
      videos: Videos.find({}).fetch(),
      videosLoading: ! subHandle.ready()
    }
  },

  renderVideos() {
    return this.data.videos.map((video) => {
      return <VideoItem key={video._id} video={video} />
    })
  },

  render() {
    return (
      <div className="container">
        <div className="row">
          <header className="page-header">
            <h1>Videos</h1>
          </header>
        </div>
        <div className="row">
          <VideoForm />
        </div>
        <div className="row panel panel-default">
          <div className="panel-body">
            <ul className="media-list">
              {this.renderVideos()}
            </ul>
          </div>
        </div>
      </div>
    )
  }
})

VideoForm = React.createClass({
  mixins: [ReactMeteorData],

  getMeteorData() {
    return {
      isSubmitting: Session.get('isSubmitting')
    }
  },

  handleSubmit(event) {
    var url;

    event.preventDefault()
    Session.set('isSubmitting', true)

    url = React.findDOMNode(this.refs.textInput).value.trim()
    Meteor.call('videos/add', url, (err, res) => {
      Session.set('isSubmitting', false)
      if(err) {
        alert(err.error)
        return
      }
    })

    // Clear form
    React.findDOMNode(this.refs.textInput).value = ""
  },

  render() {
    return (
      <form className="new-video form-inline" onSubmit={this.handleSubmit} >
        <input
          type="text"
          className="form-control"
          ref="textInput"
          required
          placeholder="Add a video URL" />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={this.data.isSubmitting ? 'disabled' : ''}
        >
          Add
        </button>
      </form>
    )
  }
})

VideoItem = React.createClass({
  propTypes: {
    // This component gets the video to display through a React prop.
    // We can use propTypes to indicate it is required
    video: React.PropTypes.object.isRequired
  },
  handleVote(event) {
    Meteor.call('videos/vote', this.props.video._id, (err, res) => {
      if(err) {
        alert(err.error)
        return
      }
    })
  },
  render() {
    return (
      <li className="media">
        <div className="media-left">
          <a href="">
            <img src={this.props.video.thumbnailUrl} alt={this.props.video.title} className="media-object" />
          </a>
        </div>
        <div className="media-body">
          <h4 className="media-heading"><a href={this.props.video.url}>{this.props.video.title}</a></h4>
          <p>{this.props.video.description}</p>
          <form onSubmit={this.handleVote}>
            <button className="btn btn-primary" type="button">
              Vote <span className="badge">{this.props.video.votes}</span>
            </button>
          </form>
        </div>
      </li>
    )
  }
})

Meteor.startup(function () {
  // Use Meteor.startup to render the component after the page is ready
  React.render(<App />, document.getElementById("app"))
})
