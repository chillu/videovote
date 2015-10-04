App = React.createClass({
  mixins: [ReactMeteorData],

  getMeteorData() {
    var subHandle = Meteor.subscribe('videos');

    return {
      videos: Videos.find({}).fetch(),
      videosLoading: ! subHandle.ready(),
      user: Meteor.user()
    }
  },

  login() {
    Meteor.loginWithGithub({
        requestPermissions: ['user'],
        loginStyle: "redirect"
    }, function (err) {
          if (err)
            Session.set('errorMessage', err.reason || 'Unknown error');
    });
  },

  renderVideos() {
    return this.data.videos.map((video) => {
      return <VideoItem key={video._id} video={video} user={this.data.user}/>
    })
  },

  render() {
    return (
      <div className='container'>
        <div className='row'>
          <header className='page-header'>
            <h1>Videos</h1>
          </header>
        </div>
        <div className='row'>
          {this.data.user ?
            <VideoForm />
            :
            <p>
              <a
                className='btn btn-block btn-github'
                onClick={this.login}
              >
                <i className='fa fa-github'></i>
                &nbsp;Login with Github
              </a>
            </p>
          }
        </div>
        <div className='row panel panel-default'>
          <div className='panel-body'>
            <ul className='media-list'>
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
      <form className='new-video form-inline' onSubmit={this.handleSubmit} >
        <input
          type='text'
          className='form-control'
          ref='textInput'
          required
          placeholder='Add a video URL' />
        <button
          type='submit'
          className='btn btn-primary'
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
    video: React.PropTypes.object.isRequired,
    user: React.PropTypes.object.isRequired
  },
  handleVote(event) {
    event.preventDefault()

    Meteor.call('videos/vote', this.props.video._id, (err, res) => {
      if(err) {
        alert(err.error)
        return
      }
    })
  },
  render() {
    return (
      <li className='media'>
        <div className='media-left'>
          <a href=''>
            <img src={this.props.video.thumbnailUrl} alt={this.props.video.title} className='media-object' />
          </a>
        </div>
        <div className='media-body'>
          <h4 className='media-heading'><a href={this.props.video.url}>{this.props.video.title}</a></h4>
          <p>{this.props.video.description}</p>
          {this.props.user ?
            <form onSubmit={this.handleVote}>
              <button className='btn btn-primary' type='submit'>
                Vote <span className='badge'>{this.props.video.votes ? this.props.video.votes.length : 0}</span>
              </button>
            </form>
            :
            ''
          }
        </div>
      </li>
    )
  }
})

Meteor.startup(function () {
  React.render(<App />, document.getElementById("app"))
})
