import { ref } from "vue";
import { globalVars } from "./globalVars";
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

    }

    init(audioElement) {
        this.audio = audioElement;
        this.playlist = [];
        this.currentTrackIndex = 0;

        this.audio.addEventListener('ended', () => this.nextTrack());
        this.audio.addEventListener('loadedmetadata', () => this.updateDuration());
        this.audio.addEventListener('timeupdate', () => this.updateNowTime());
    }

    playlistLoaded = false;

    // 加载播放列表
    loadPlaylist(songs) {
        this.playlist = songs;
        for (var i = 0; i < this.playlist.length; i++) this.playlist[i].realId = "mediaFileId" in this.playlist[i] ? this.playlist[i].mediaFileId : this.playlist[i].id // 规避不同歌单返回id不同问题
        // 尝试恢复原有状态
        if (localStorage.getItem("lastmusic") != null) {
            const storage = JSON.parse(localStorage.getItem("lastmusic"))
            var flag = false
            this.playbackMode.value = storage.playbackMode
            // 查找歌曲是否仍然存在
            for (const [index, music] of this.playlist.entries()) {
                if (music.realId === storage.id) {
                    flag = true
                    this.loadTrack(index)
                    this.changeNowTime(storage.time)
                    this.pause()
                    break;
                }
            }
            if (!flag) this.loadTrack(0)
            else this.lastTracks = storage.lastTracks
        }
        else this.loadTrack(0);
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
        const nowTime = this.audio.currentTime;
        this.playingMusic.value.nowTime = Math.floor(nowTime);
        this.playingMusic.value.nowTimeString = this.formatTime(nowTime)

        // 更新播放进度
        localStorage.setItem("lastmusic", JSON.stringify({
            id: this.track.realId,
            time: nowTime,
            playbackMode: this.playbackMode.value,
            lastTracks: this.lastTracks,
        }))
    }
    changeNowTime(nowTime) {
        this.audio.currentTime = nowTime
    }
    updateDuration() {
        const duration = this.audio.duration;
        this.playingMusic.value.maxTime = Math.floor(duration); // 设置滑动条的最大值为音频总时长
        this.playingMusic.value.maxTimeString = this.formatTime(duration);
    }

    // 获取 Subsonic 音频流 URL 和 专辑图
    async getSubsonicStreamUrl(trackId) {
        const { server, user, login, clientName } = navidrome;
        const streamUrl = `${server}/rest/stream?u=${user}&t=${login.subsonicToken}&s=${login.subsonicSalt}&f=json&v=1.8.0&c=${clientName}&id=${trackId}&_=${new Date().getTime()}`;
        return streamUrl;
    }

    // 加载指定索引的歌曲并获取流 URL
    async loadTrack(index) {
        this.currentTrackIndex = index;
        this.track = this.playlist[index];
        const { server, user, login, clientName } = navidrome;
        this.playingMusic.value.cover = `${server}/rest/getCoverArt?u=${user}&t=${login.subsonicToken}&s=${login.subsonicSalt}&f=json&v=1.8.0&c=${clientName}&id=al-${this.track.albumId}&size=2048`
        this.playingMusic.value.title = this.track.title
        this.playingMusic.value.information = `${this.track.artist} - ${this.track.album}`
        this.playingMusic.value.index = index

        // 获取音频流的 URL
        const streamUrl = await this.getSubsonicStreamUrl(this.track.realId);
        this.audio.src = streamUrl;
        this.audio.load();

        // 更新相关组件
        this.updateMediaSession(this.track);

        setTimeout(() => {
            // 平滑滚动到指定元素
            const targets = document.querySelector(".music-list").children;
            targets[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 200);
    }

    play() {
        this.playingMusic.value.pause = false
        setTimeout(() => {
            this.audio.play();
        }, 100);
    }

    pause() {
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
        switch (this.playbackMode.value) {
            case 0:
                if (this.currentTrackIndex < this.playlist.length - 1) {
                    this.loadTrack(this.currentTrackIndex + 1); // 取下一首
                }
                break;

            case 1:
                if (this.lastTracks.length > 128) this.lastTracks.shift()
                this.lastTracks.push(this.currentTrackIndex)
                const randomTrack = Math.floor(Math.random() * (this.playlist.length)) // 取一个0～max-1之间的随机整数
                this.loadTrack(randomTrack)
                break;

            case -1:
                this.loadTrack(this.currentTrackIndex); // 取本首
                break;

            default:
                if (this.currentTrackIndex < this.playlist.length - 1) {
                    this.loadTrack(this.currentTrackIndex + 1);
                }
                break;
        }
        this.play();
    }

    prevTrack() {
        switch (this.playbackMode.value) {
            case 0:
                if (this.currentTrackIndex > 0) {
                    this.loadTrack(this.currentTrackIndex - 1); // 取上一首
                }
                break;

            case 1:
                const lastTrack = this.lastTracks.pop()
                if (lastTrack === undefined) { this.nextTrack(); return; }
                else this.loadTrack(lastTrack)
                break;

            case -1:
                this.loadTrack(this.currentTrackIndex); // 取本首
                break;

            default:
                if (this.currentTrackIndex > 0) {
                    this.loadTrack(this.currentTrackIndex - 1);
                }
                break;
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

    lastTracks = [] // 使用一个栈记录上一曲信息，仅适用于随机播放，最大长度128

    changePlayBackMode() {
        if (this.playbackMode.value === 1) {
            this.playbackMode.value = -1
            this.lastTracks = [] // 不再是随机播放，清空上一曲信息
        }
        else this.playbackMode.value += 1

        const storage = JSON.parse(localStorage.getItem("lastmusic"))
        localStorage.setItem("lastmusic", JSON.stringify({
            id: storage.id,
            time: storage.time,
            playbackMode: this.playbackMode.value,
            lastTracks: this.lastTracks,
        }))
    }

    playingMusic = ref({
        title: "ChenServer Music",
        information: "Enjoy Music.",
        cover: "https://v4.chenserver.top:11450/covers/navidrome.png",
        index: -1,
        nowTime: 0,
        maxTime: 0,
        nowTimeString: "0:00",
        maxTimeString: "0:00",
        pause: true,
    })

    playbackMode = ref(0) // 0: 顺序播放, 1: 随机播放, -1: 单曲循环
}

export { MusicPlayer }