import React, { useRef, useState } from "react";
import {
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
  FaCog,
  FaStepBackward,
  FaStepForward,
} from "react-icons/fa";
import PropTypes from "prop-types";
import "./custom-video-player.css";

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
};

const CustomVideoPlayer = ({ src, poster }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(videoRef.current.duration);
  };

  const handleSeek = (e) => {
    const seekTime = (e.target.value / 100) * duration;
    videoRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value;
    setVolume(newVolume);
    videoRef.current.volume = newVolume;
    setIsMuted(newVolume === "0");
  };

  const handleMute = () => {
    setIsMuted((prev) => {
      videoRef.current.muted = !prev;
      return !prev;
    });
  };

  const handleBackward = () => {
    videoRef.current.currentTime = Math.max(
      0,
      videoRef.current.currentTime - 10
    );
  };

  const handleForward = () => {
    videoRef.current.currentTime = Math.min(
      duration,
      videoRef.current.currentTime + 10
    );
  };

  return (
    <div className="custom-video-player w-full">
      <div className="video-wrapper">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onClick={handlePlayPause}
          className="video-element aspect-video"
          playsInline // Better mobile experience
        />
        {!isPlaying && (
          <button className="play-overlay" onClick={handlePlayPause}>
            <FaPlay size={32} className="sm:hidden" />
            <FaPlay size={48} className="hidden sm:block" />
          </button>
        )}
      </div>
      <div className="controls">
        <input
          type="range"
          min="0"
          max="100"
          value={duration ? (currentTime / duration) * 100 : 0}
          onChange={handleSeek}
          className="seek-bar"
          aria-label="Seek video"
        />
        <button onClick={handleBackward} aria-label="Skip backward">
          <FaStepBackward />
        </button>
        <button
          onClick={handlePlayPause}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <FaPause /> : <FaPlay />}
        </button>
        <button onClick={handleForward} aria-label="Skip forward">
          <FaStepForward />
        </button>
        <span className="time">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
        <button onClick={handleMute} aria-label={isMuted ? "Unmute" : "Mute"}>
          {isMuted || volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          className="volume-bar"
          aria-label="Volume control"
        />
        <button aria-label="Settings">
          <FaCog />
        </button>
      </div>
    </div>
  );
};

CustomVideoPlayer.propTypes = {
  src: PropTypes.string.isRequired,
  poster: PropTypes.string,
};

export default CustomVideoPlayer;
