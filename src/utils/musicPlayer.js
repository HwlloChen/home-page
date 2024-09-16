import { ref } from "vue";
import { globalVars } from "./globalVars";
const navidrome = globalVars.navidrome

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

    // 加载播放列表
    loadPlaylist(songs) {
        this.playlist = songs;
        // 尝试恢复原有进度
        if(localStorage.getItem("lastmusic") != null) {
            const storage = JSON.parse(localStorage.getItem("lastmusic"))
            var flag = false
            // 查找歌曲是否仍然存在
            for (const [index, music] of this.playlist.entries()) {
                if(music.id === storage.id) {
                    flag = true
                    this.loadTrack(index)
                    this.changeNowTime(storage.time)
                    this.pause()
                    break;
                }
            }
            if(!flag) this.loadTrack(0)
        }
        else this.loadTrack(0);
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
            id: this.track.id,
            time: nowTime,
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
        const streamUrl = await this.getSubsonicStreamUrl(this.track.id);
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
        if (this.currentTrackIndex < this.playlist.length - 1) {
            this.loadTrack(this.currentTrackIndex + 1);
            this.play();
        }
    }

    prevTrack() {
        if (this.currentTrackIndex > 0) {
            this.loadTrack(this.currentTrackIndex - 1);
            this.play();
        }
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
}

export { MusicPlayer }