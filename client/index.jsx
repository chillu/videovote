/* global Meteor, ReactMeteorData, Session, App, Videos, VideoForm, VideoListItem, React, UserItem, window, Ladda */

App = React.createClass({
  mixins: [ReactMeteorData],

  getMeteorData () {
    var subHandle = Meteor.subscribe('videos')

    return {
      videos: Videos.find({}, {sort: {votesCount: -1, title: 1}}).fetch(),
      videosLoading: !subHandle.ready(),
      user: Meteor.user()
    }
  },

  login () {
    Meteor.loginWithGithub({
      requestPermissions: ['user'],
      loginStyle: 'redirect'
    }, function (err) {
      if (err) {
        Session.set('errorMessage', err.reason || 'Unknown error')
      }
    })
  },

  render () {
    if (this.data.videosLoading) {
      return <LoadingSpinner />
    }

    return (
      <div className='container-fluid'>
        <header className='page-header'>
          <i className='logo fa fa-television'></i>
          <h1>Lunch &amp; Learn Videos</h1>
          <p className='lead'>
            Flux. Websockets. PHP7. Lean UX. So many new ideas, so little time!
            Use your lunch break as a mini-conference, and watch talks with your colleagues.
            Check video suggestions here, or login to vote and add your own video.
          </p>
        </header>
        <div className='row add-or-login'>
          <div className='col-md-12'>
            {this.data.user
              ? <VideoForm />
              : <p>
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
        </div>
        <VideoList videos={this.data.videos} user={this.data.user} />
        <footer>
          <small>
            Created with <a href="http://meteor.com">MeteorJS</a> |
            Check out the <a href="http://github.com/chillu/videovote">source code</a>
          </small>
        </footer>
      </div>
    )
  }
})

VideoForm = React.createClass({
  mixins: [ReactMeteorData],

  getMeteorData () {
    return {
      isSubmitting: Session.get('isSubmitting')
    }
  },

  handleSubmit (event) {
    var url = url = React.findDOMNode(this.refs.textInput).value.trim()
    var btn = React.findDOMNode(this.refs.submitButton)
    var ladda = Ladda.create(btn)

    event.preventDefault()
    Session.set('isSubmitting', true)

    ladda.start()

    Meteor.call('videos/add', url, (err, res) => {
      Session.set('isSubmitting', false)
      ladda.stop()
      if (err) {
        window.alert(err.error)
        return
      }
    })

    // Clear form
    React.findDOMNode(this.refs.textInput).value = ''
  },

  render () {
    return (
      <form className='new-video' onSubmit={this.handleSubmit} >
        <div className='input-group'>
          <input
            type='text'
            name='new-video-url'
            className='form-control'
            ref='textInput'
            required
            placeholder='Add a video URL (youtube or vimeo)' />
          <span className='input-group-btn'>
            <button
              type='submit'
              className='btn btn-primary ladda-button'
              ref='submitButton'
              data-style='expand-right'
              disabled={this.data.isSubmitting ? 'disabled' : ''}
            >
              Add
            </button>
          </span>
        </div>
      </form>
    )
  }
})

VideoList = React.createClass({
  propTypes: {
    videos: React.PropTypes.object.isRequired,
    user: React.PropTypes.object.isRequired
  },
  getInitialState () {
    return {sort: 'recent'}
  },
  handleSort (event) {
    event.preventDefault()

    this.setState({sort: event.target.value})
  },
  renderVideos () {
    var sort = this.state.sort

    return this.props.videos
      .sort((a, b) => {
        if (sort === 'recent') {
          return a.createdAt < b.createdAt ? 1 : -1
        } else {
          return a.votesCount < b.votesCount ? 1 : -1
        }
      })
      .map((video) => {
        return <VideoListItem key={video._id} video={video} user={this.props.user}/>
      })
  },
  render () {
    var btnTitleRecent = (this.state.sort === 'recent') ? <strong>recent</strong> : 'recent'
    var btnTitleVotes = (this.state.sort === 'votes') ? <strong>votes</strong> : 'votes'

    return (
      <div>
        <div className='row padding sort-holder'>
          <div className='col-md-12'>
            Sort by:
            &nbsp;
            <button value='recent' className='btn btn-xs btn-default' onClick={this.handleSort}>
              {btnTitleRecent}
            </button>
            &nbsp;|&nbsp;
            <button value='votes' className='btn btn-xs btn-default' onClick={this.handleSort}>
              {btnTitleVotes}
            </button>
          </div>
        </div>
        <div className='row padding'>
          <div className='col-md-12'>
            <ul className='media-list video-list'>
              {this.renderVideos()}
            </ul>
          </div>
        </div>
      </div>
    )
  }
})

VideoListItem = React.createClass({
  propTypes: {
    video: React.PropTypes.object.isRequired,
    user: React.PropTypes.object.isRequired
  },
  handleVote (event) {
    event.preventDefault()

    Meteor.call('videos/vote', this.props.video._id, (err, res) => {
      if (err) {
        window.alert(err.error)
        return
      }
    })
  },
  handleArchive (event) {
    event.preventDefault()

    Meteor.call('videos/archive', this.props.video._id, (err, res) => {
      if (err) {
        window.alert(err.error)
        return
      }
    })
  },
  renderVotes () {
    var votes = this.props.video.votes
    if (votes) {
      return votes.map((vote) => {
        return vote.userId ? <UserItem key={vote.userId} username={vote.username} /> : null
      })
    } else {
      return null
    }
  },
  render () {
    return (
      <li className='media media-video'>
        <div className='media-body'>
          <h4 className='media-heading'>
            <a href={this.props.video.url}>
              {this.props.video.title}
              &nbsp;({this.props.video.durationMins} mins)
            </a>
          </h4>
          <p>
            {this.props.video.description}
            <div className='votes'>
              {this.props.video.votes && this.props.video.votes.length ? 'Voted by: ' : ''}
              <span className='votes-list'>{this.props.video.votes && this.props.video.votes.length ? this.renderVotes() : ''}</span>
            </div>
          </p>
        </div>
        {this.props.user
          ? <form className='media-right' onSubmit={this.handleVote}>
            <button className='btn btn-primary' type='submit'>
              Vote <span className='badge'>{this.props.video.votes ? this.props.video.votes.length : 0}</span>
            </button>
          </form>
          : ''
        }
        {this.props.user && this.props.user.admin &&
          <button type='button' className='btn btn-warning btn-xs' onClick={this.handleArchive}>
            Archive
          </button>
        }
      </li>
    )
  }
})

UserItem = React.createClass({
  propTypes: {
    username: React.PropTypes.string.isRequired
  },
  getProfileUrl () {
    return 'https://github.com/' + this.props.username
  },
  render () {
    return (
      <span className='user'>
        <a href={this.getProfileUrl()}>
          {this.props.username}
        </a>
      </span>
    )
  }
})

LoadingSpinner = React.createClass({
  componentDidMount () {
    var l = new Spinner({
      scale: 3,
      color: '#fff'
    })
    l.spin(React.findDOMNode(this.refs.spinner))
  },

  render () {
    return (
      <div className='loading-spinner' ref='spinner' data-size='l'></div>
    )
  }
})

Session.setDefault('sort', 'createdAt')
Meteor.subscribe('userData')

Meteor.startup(function () {
  React.render(<App />, document.getElementById('app'))
})
