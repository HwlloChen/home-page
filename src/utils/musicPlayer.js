import { ref } from "vue";
import { globalVars } from "./globalVars";
import { subtitle } from "@/components/AppBar.vue";
const navidrome = globalVars.navidrome

/**
 * 音乐播放器类，用于管理音频播放、播放列表和播放状态
 * Music player class for managing audio playback, playlists, and playback states
 * 
 * @class MusicPlayer
 * @property {Array} playlist - 播放列表数组 / Array of songs in the playlist
 * @property {number} currentTrackIndex - 当前播放歌曲的索引 / Index of the current playing track
 * @property {HTMLAudioElement} audio - 音频元素 / Audio element for playback
 * @property {Array} lastTracks - 用于随机播放模式下记录播放历史的数组 / Array for storing playback history in random mode
 * @property {boolean} playlistLoaded - 播放列表是否已加载 / Flag indicating if playlist is loaded
 * @property {Object} playingMusic - 当前播放音乐的信息 / Current playing music information
 * @property {number} playbackMode - 播放模式 (0: 顺序播放, 1: 随机播放, -1: 单曲循环) / Playback mode (0: sequential, 1: random, -1: single repeat)
 * 
 * @example
 * const player = new MusicPlayer();
 * player.init(audioElement);
 * player.loadPlaylist(songs);
 */


class MusicPlayer {
    constructor() {
        this.isSharePage = window.location.pathname.startsWith('/music/share/');
    }

    init(audioElement) {
        if (!audioElement) {
            console.warn('Audio element not provided to MusicPlayer.init()');
            return;
        }
        
        this.audio = audioElement;
        this.playlist = [];
        this.currentTrackIndex = 0;

        this.audio.addEventListener('ended', () => this.nextTrack());
        this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
        this.audio.addEventListener('timeupdate', () => this.updateNowTime());
    }

    playlistLoaded = false;
    firstLoad = true;

    // 加载播放列表
    loadPlaylist(songs) {
        this.playlist = songs;
        for (var i = 0; i < this.playlist.length; i++) {
            this.playlist[i].realId = "mediaFileId" in this.playlist[i] ? this.playlist[i].mediaFileId : this.playlist[i].id;
        }

        // 在分享页面不需要保存播放状态
        if (!this.isSharePage && localStorage.getItem("lastmusic") != null) {
            const storage = JSON.parse(localStorage.getItem("lastmusic"));
            var flag = false;
            this.playbackMode.value = storage.playbackMode;

            // 查找歌曲是否仍然存在
            for (const [index, music] of this.playlist.entries()) {
                if (music.realId === storage.id) {
                    flag = true;
                    this.loadTrack(index);
                    this.changeNowTime(storage.time);
                    this.pause();
                    break;
                }
            }
            if (!flag) {
                this.loadTrack(0);
            } else {
                this.lastTracks = storage.lastTracks;
            }
        } else {
            this.loadTrack(0);
        }
        this.playlistLoaded = true;
    }

    // 格式化时间为 mm:ss
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // 更新播放时间
    updateNowTime() {
        if (!this.audio) {
            console.warn('Audio element not initialized');
            return;
        }
        
        const nowTime = this.audio.currentTime;
        this.playingMusic.value.nowTime = Math.floor(nowTime);
        this.playingMusic.value.nowTimeString = this.formatTime(nowTime);
        if (this.firstLoad) { this.firstLoad = false; return; }
        this.updateLyric();
        // 在分享页面不需要保存播放进度
        if (!this.isSharePage) {
            localStorage.setItem("lastmusic", JSON.stringify({
                id: this.track.realId,
                time: nowTime,
                playbackMode: this.playbackMode.value,
                lastTracks: this.lastTracks,
            }));
        }
    }

    changeNowTime(nowTime) {
        if (!this.audio) {
            console.warn('Audio element not initialized');
            return;
        }
        this.audio.currentTime = nowTime;
    }

    updateDuration() {
        if (!this.audio) {
            console.warn('Audio element not initialized');
            return;
        }
        
        const duration = this.audio.duration;
        this.playingMusic.value.maxTime = Math.floor(duration);
        this.playingMusic.value.maxTimeString = this.formatTime(duration);
    }

    // 获取 Subsonic 音频流 URL
    async getSubsonicStreamUrl(trackId) {
        const { server, user, login, clientName } = navidrome;
        const streamUrl = `${server}/rest/stream?u=${user}&t=${login.subsonicToken}&s=${login.subsonicSalt}&f=json&v=1.8.0&c=${clientName}&id=${trackId}&_=${new Date().getTime()}`;
        return streamUrl;
    }

    // 加载指定索引的歌曲并获取流 URL
    async loadTrack(index) {
        if (!this.audio) {
            console.warn('Audio element not initialized, cannot load track');
            return;
        }
        
        this.currentTrackIndex = index;
        this.track = this.playlist[index];
        const { server, user, login, clientName } = navidrome;
        this.playingMusic.value.cover = `${server}/rest/getCoverArt?u=${user}&t=${login.subsonicToken}&s=${login.subsonicSalt}&f=json&v=1.8.0&c=${clientName}&id=al-${this.track.albumId}&size=2048`;
        this.playingMusic.value.title = this.track.title;
        this.playingMusic.value.information = `${this.track.artist} - ${this.track.album}`;
        this.playingMusic.value.index = index;
        this.playingMusic.value.trackId = this.track.realId;

        const parsedLyrics = JSON.parse(this.track.lyrics)
        if (parsedLyrics.length) {
            this.playingMusic.value.lyrics = parsedLyrics[0].line;
        } else {
            this.playingMusic.value.lyrics = [{ start: 1000, value: "纯音乐, 请欣赏~" }];
        }

        this.currentLyricTimeshift = 0;

        // 获取音频流的 URL
        const streamUrl = await this.getSubsonicStreamUrl(this.track.realId);
        this.audio.src = streamUrl;
        this.audio.load();

        // 更新 MediaSession
        this.updateMediaSession(this.track);

        // 广播播放更新
        window.dispatchEvent(new CustomEvent('playing-music-changed'))

        // 只在非分享页面且存在播放列表时执行滚动
        if (!this.isSharePage) {
            setTimeout(() => {
                const musicList = document.querySelector(".music-list");
                if (musicList && musicList.children[index]) {
                    musicList.children[index].scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }, 200);
        }
    }

    updateLyric() {
        if (!this.audio) {
            return;
        }
        
        // 获取当前播放时间，单位毫秒
        const now = Math.floor(this.audio.currentTime * 1000) + 110; // 加110毫秒以避免歌词过慢显示
        const lyrics = this.playingMusic.value.lyrics;
        if (!Array.isArray(lyrics) || lyrics.length === 0) return;

        // 二分查找当前时间应该显示的歌词索引
        let left = 0, right = lyrics.length - 1, currentIndex = 0;
        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            if (lyrics[mid].start <= now) {
                currentIndex = mid;
                left = mid + 1;
            } else {
                right = mid - 1;
            }
        }
        const currentLyricStart = lyrics[currentIndex].start;
        const nextLyricStart = (lyrics[currentIndex + 1] ? lyrics[currentIndex + 1].start : Infinity);

        // 检查当前时间是否在当前歌词的时间范围内
        if (this.currentLyricTimeshift === currentLyricStart) {
            return;
        }

        // 否则，更新 currentLyricTimeshift，并留给你处理歌词显示
        this.currentLyricTimeshift = currentLyricStart;
        var interval = currentIndex < lyrics.length - 1 ? (lyrics[currentIndex + 1].start - now) : 4000;
        interval *= 0.8;
        interval -= 400;
        interval = Math.max(interval, 50);
        // 设置最长持续时间为字符数量*1300ms
        interval = Math.min(interval, lyrics[currentIndex].value.length * 1300);
        subtitle.text(lyrics[currentIndex].value, 400, interval);
    }

    play() {
        if (!this.audio) {
            console.warn('Audio element not initialized');
            return;
        }
        
        this.playingMusic.value.pause = false
        setTimeout(() => {
            this.audio.play().catch(error => {
                console.warn('Audio play failed:', error);
            });
        }, 100);
    }

    pause() {
        if (!this.audio) {
            console.warn('Audio element not initialized');
            return;
        }
        
        this.playingMusic.value.pause = true
        setTimeout(() => {
            this.audio.pause();
        }, 100);
    }

    negative() {
        if (this.playingMusic.value.pause) {
            this.play()
        } else {
            this.pause()
        }
    }

    nextTrack() {
        if (this.isSharePage) {
            // 在分享页面，单曲循环
            this.loadTrack(0);
        } else {
            switch (this.playbackMode.value) {
                case 0:
                    if (this.currentTrackIndex < this.playlist.length - 1) {
                        this.loadTrack(this.currentTrackIndex + 1);
                    }
                    break;
                case 1:
                    if (this.lastTracks.length > 128) this.lastTracks.shift();
                    this.lastTracks.push(this.currentTrackIndex);
                    const randomTrack = Math.floor(Math.random() * (this.playlist.length));
                    this.loadTrack(randomTrack);
                    break;
                case -1:
                    this.loadTrack(this.currentTrackIndex);
                    break;
                default:
                    if (this.currentTrackIndex < this.playlist.length - 1) {
                        this.loadTrack(this.currentTrackIndex + 1);
                    }
                    break;
            }
        }
        this.play();
    }

    prevTrack() {
        if (this.isSharePage) {
            // 在分享页面，单曲循环
            this.loadTrack(0);
        } else {
            switch (this.playbackMode.value) {
                case 0:
                    if (this.currentTrackIndex > 0) {
                        this.loadTrack(this.currentTrackIndex - 1);
                    }
                    break;
                case 1:
                    const lastTrack = this.lastTracks.pop();
                    if (lastTrack === undefined) {
                        this.nextTrack();
                        return;
                    } else {
                        this.loadTrack(lastTrack);
                    }
                    break;
                case -1:
                    this.loadTrack(this.currentTrackIndex);
                    break;
                default:
                    if (this.currentTrackIndex > 0) {
                        this.loadTrack(this.currentTrackIndex - 1);
                    }
                    break;
            }
        }
        this.play();
    }

    updateMediaSession(track) {
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: track.title,
                artist: track.artist,
                album: track.album,
                artwork: [{ src: this.playingMusic.value.cover, sizes: '2048x2048', type: 'image/png' }]
            });

            navigator.mediaSession.setActionHandler('play', () => this.play());
            navigator.mediaSession.setActionHandler('pause', () => this.pause());
            navigator.mediaSession.setActionHandler('previoustrack', () => this.prevTrack());
            navigator.mediaSession.setActionHandler('nexttrack', () => this.nextTrack());
        }
    }

    lastTracks = [];

    changePlayBackMode() {
        if (this.isSharePage) return; // 在分享页面禁用播放模式切换

        if (this.playbackMode.value === 1) {
            this.playbackMode.value = -1;
            this.lastTracks = [];
        } else {
            this.playbackMode.value += 1;
        }

        const storage = JSON.parse(localStorage.getItem("lastmusic"));
        localStorage.setItem("lastmusic", JSON.stringify({
            id: storage.id,
            time: storage.time,
            playbackMode: this.playbackMode.value,
            lastTracks: this.lastTracks,
        }));
    }

    playingMusic = ref({
        title: "ChenServer Music",
        information: "Enjoy Music.",
        cover: "https://v4.etaris.moe:11450/covers/navidrome.png",
        index: -1,
        nowTime: 0,
        maxTime: 0,
        nowTimeString: "0:00",
        maxTimeString: "0:00",
        pause: true,
    });

    playbackMode = ref(0);

    currentLyricTimeshift = 0;
}

export { MusicPlayer };