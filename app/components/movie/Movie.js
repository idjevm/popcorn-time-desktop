/**
 * Movie component that is responsible for playing movie
 *
 * @todo: Remove state mutation, migrate to Redux reducers
 * @todo: Refactor to be more adapter-like
 */

import React, { Component, PropTypes } from 'react';
import Butter from '../../api/Butter';
// import TorrentStream from 'torrent-stream';
import peerflix from 'peerflix';
import plyr from 'plyr';
import { Link } from 'react-router';


export default class Movie extends Component {

  static propTypes = {
    movieId: PropTypes.string.isRequired
  };

  static defaultProps = {
    movieId: '',
  };

  constructor(props) {
    super(props);
    this.butter = new Butter();
    this.getMovie(this.props.movieId);
    this.getTorrent(this.props.movieId);

    this.state = {
      movie: {
        images: {
          fanart: ''
        }
      },
      torrent: {
        '1080p': {
          quality: ''
        },
        '720p': {
          quality: ''
        }
      }
    };
  }

  /**
   * Get the details of a movie using the butter api
   */
  async getMovie(imdbId) {
    const movie = await this.butter.getMovie(imdbId);
    this.setState({ movie });
  }

  async getTorrent(imdbId) {
    const torrent = await this.butter.getTorrent(imdbId);
    this.setState({ torrent });
  }

  startTorrent(magnetURI) {
    console.log('starting torrent...');

    const engine = peerflix(magnetURI);

    engine.server.on('listening', () => {
      const servingUrl = `http://localhost:${engine.server.address().port}/`;
      console.log({ servingUrl });
      this.setState({ servingUrl });
    });

    // const engine = TorrentStream(magnetURI);
    //
    // engine.on('ready', () => {
    //   for (const file of engine.files) {
    //     console.log(file);
    //     if (this.isVideo(file.name)) {
    //       file.select();
    //
    //       break;
    //     }
    //   }
    // });
  }

  isVideo(filename) {
    const filetypes = ['mp4'];

    for (const filetype of filetypes) {
      if (filename.includes(filetype)) {
        return true;
      }
    }

    return false;
  }

  stopTorrent() {
    this.client.destroy(() => {
      console.log('client destroyed');
    });
  }

  render() {
    return (
      <div className="container">
        <div className="col-xs-12">
          <div className="Movie">
            <Link to="/">
              <button className="ion-android-arrow-back">Back</button>
            </Link>
            <button onClick={this.stopTorrent.bind(this)}>
              Stop
            </button>

            {this.state.torrent['1080p'].magnet ?
              <button onClick={this.startTorrent.bind(this, this.state.torrent['1080p'].magnet)}>
                Start 1080p
              </button>
              :
              <div>There is no banner!</div>
            }

            <h1>
              {this.state.movie.title}
            </h1>
            <h5>
              Rating: {this.state.movie.rating}
            </h5>
            <h5>
              Year: {this.state.movie.year}
            </h5>
            <h6>
              {this.state.movie.overview}
            </h6>
            <video
              className="Movie--poster-image"
              poster={this.state.movie.images.fanart.full}
              src={this.state.servingUrl}
            />
          </div>
        </div>
      </div>
    );
  }
}
