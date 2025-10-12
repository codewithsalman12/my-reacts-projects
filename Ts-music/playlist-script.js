/** ------------------------------
 * PlaylistManager Class
 * ------------------------------ */
class PlaylistManager {
  constructor() {
    this.STORAGE_KEY = 'vibeWavePlaylists';
    this.playlists = this.loadPlaylists();
  }

  loadPlaylists() {
    const data = localStorage.getItem(this.STORAGE_KEY);
    const parsed = data ? JSON.parse(data) : [];
    // Normalize songIds to strings so comparisons are consistent
    parsed.forEach(p => {
      if (!p.songIds) p.songIds = [];
      if (Array.isArray(p.songIds)) p.songIds = p.songIds.map(id => String(id));
      else p.songIds = [];
    });
    return parsed;
  }

  savePlaylists() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.playlists));
  }

  createPlaylist(name, description = '') {
    const newPlaylist = {
      id: Date.now().toString(),
      name,
      description,
      songIds: [],
      createdAt: new Date().toISOString(),
    };
    this.playlists.push(newPlaylist);
    this.savePlaylists();
    return newPlaylist;
  }

  getPlaylist(id) {
    return this.playlists.find(p => p.id === id);
  }

  addSongToPlaylist(playlistId, songId) {
    const playlist = this.getPlaylist(playlistId);
    const sid = String(songId);
    if (playlist && !playlist.songIds.includes(sid)) {
      playlist.songIds.push(sid);
      this.savePlaylists();
      return true;
    }
    return false;
  }

  removeSongFromPlaylist(playlistId, songId) {
    const playlist = this.getPlaylist(playlistId);
    if (playlist) {
      const initialLength = playlist.songIds.length;
      const sid = String(songId);
      playlist.songIds = playlist.songIds.filter(id => id !== sid);
      if (playlist.songIds.length < initialLength) {
        this.savePlaylists();
        return true;
      }
    }
    return false;
  }

  deletePlaylist(playlistId) {
    const initialLength = this.playlists.length;
    this.playlists = this.playlists.filter(p => p.id !== playlistId);
    if (this.playlists.length < initialLength) {
      this.savePlaylists();
      return true;
    }
    return false;
  }
}

/** ------------------------------
 * SongAPI Class
 * ------------------------------ */
class SongAPI {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
    this.allSongs = [];
    this.isLoaded = false;
  }

  async fetchAllSongs() {
    if (this.isLoaded) return this.allSongs;

    try {
      const response = await fetch(this.apiUrl);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      const songs = Array.isArray(data) ? data : data.songs || [];

      // IMPORTANT: map API fields to what the UI expects
      this.allSongs = songs.map((song, index) => ({
        // coerce id to string so comparisons are consistent
        id: String(song.id ?? `song-${index}`),
        title: song.title ?? "Unknown Title",
        artist: song.artist ?? "Unknown Artist",
        cover: song.cover ?? "",
        // The API uses "src" for the audio file — map it to url
        url: song.src ?? song.url ?? song.audio ?? "",
      }));

      this.isLoaded = true;
      return this.allSongs;
    } catch (error) {
      console.error("Could not fetch songs from API:", error);
      return [];
    }
  }

  getSongById(id) {
    const sid = String(id);
    return this.allSongs.find(song => String(song.id) === sid);
  }

  searchSongs(query) {
    const lower = query.toLowerCase();
    return this.allSongs.filter(
      song =>
        (song.title && song.title.toLowerCase().includes(lower)) ||
        (song.artist && song.artist.toLowerCase().includes(lower))
    );
  }
}

/** ------------------------------
 * UIManager Class
 * ------------------------------ */
class UIManager {
  constructor(playlistManager, songAPI) {
    this.playlistManager = playlistManager;
    this.songAPI = songAPI;

    // DOM Elements (playlist UI)
    this.playlistGrid = document.getElementById('playlistGrid');
    this.addPlaylistBtn = document.getElementById('addPlaylistBtn');
    this.noPlaylistsMessage = document.getElementById('noPlaylistsMessage');

    // Playlist Modal
    this.playlistModal = new bootstrap.Modal(document.getElementById('playlistModal'));
    this.playlistModalLabel = document.getElementById('playlistModalLabel');
    this.playlistForm = document.getElementById('playlistForm');
    this.playlistNameInput = document.getElementById('playlistNameInput');
    this.playlistDescriptionInput = document.getElementById('playlistDescriptionInput');
    this.savePlaylistBtn = document.getElementById('savePlaylistBtn');

    // View Playlist Modal
    this.viewPlaylistModal = new bootstrap.Modal(document.getElementById('viewPlaylistModal'));
    this.viewPlaylistName = document.getElementById('viewPlaylistName');
    this.viewPlaylistDescription = document.getElementById('viewPlaylistDescription');
    this.viewPlaylistSongCount = document.getElementById('viewPlaylistSongCount');
    this.viewPlaylistSongsList = document.getElementById('viewPlaylistSongsList');
    this.noSongsInPlaylist = document.getElementById('noSongsInPlaylist');
    this.addSongInput = document.getElementById('addSongInput');
    this.searchSongsBtn = document.getElementById('searchSongsBtn');
    this.addSongResults = document.getElementById('addSongResults');
    this.deletePlaylistBtn = document.getElementById('deletePlaylistBtn');

    // Global player elements
    this.audio = document.getElementById('audio');
    this.playerCover = document.getElementById('playerCover');
    this.playerTitle = document.getElementById('playerTitle');
    this.playerArtist = document.getElementById('playerArtist');
    this.btnPlayPause = document.getElementById('btnPlayPause');
    this.btnNext = document.getElementById('btnNext');
    this.btnPrev = document.getElementById('btnPrev');
    this.seekBar = document.getElementById('seekBar');
    this.currentTime = document.getElementById('currentTime');
    this.totalTime = document.getElementById('totalTime');
    this.volumeRange = document.getElementById('volumeRange');
    this.btnMute = document.getElementById('btnMute');
    this.volumeIcon = document.getElementById('volumeIcon');

    this.currentPlaylistId = null;
    this.currentPlayingSongId = null; // track which song (by id) is playing

    // sensible defaults
    this.audio.volume = (this.volumeRange && this.volumeRange.value ? this.volumeRange.value / 100 : 0.8);

    this.initEventListeners();
    this.setupAudioHandlers();
  }

  initEventListeners() {
    this.addPlaylistBtn.addEventListener('click', () => this.openAddPlaylistModal());
    this.playlistForm.addEventListener('submit', e => this.handleSavePlaylist(e));
    this.searchSongsBtn.addEventListener('click', () => this.handleSongSearch());
    this.addSongInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.handleSongSearch();
      }
    });
    this.deletePlaylistBtn.addEventListener('click', () => this.handleDeletePlaylist());
    document.getElementById('viewPlaylistModal').addEventListener('hidden.bs.modal', () => {
      this.addSongResults.innerHTML = '';
      this.addSongInput.value = '';
    });

    // Global player controls
    this.btnPlayPause.addEventListener('click', () => {
      if (!this.audio.src) {
        // If no song loaded, try to play first song of current playlist
        if (this.currentPlaylistId) {
          const playlist = this.playlistManager.getPlaylist(this.currentPlaylistId);
          if (playlist && playlist.songIds.length) {
            this.playSongById(playlist.songIds[0]);
          }
        }
        return;
      }
      if (this.audio.paused) this.audio.play();
      else this.audio.pause();
    });

    if (this.btnNext) {
      this.btnNext.addEventListener('click', () => this.playNext());
    }
    if (this.btnPrev) {
      this.btnPrev.addEventListener('click', () => this.playPrev());
    }

    if (this.seekBar) {
      this.seekBar.addEventListener('input', () => {
        // allow immediate seeking while dragging
        if (!isNaN(parseFloat(this.seekBar.value))) {
          this.audio.currentTime = parseFloat(this.seekBar.value);
        }
      });
    }

    if (this.volumeRange) {
      this.volumeRange.addEventListener('input', () => {
        this.audio.volume = this.volumeRange.value / 100;
        this.audio.muted = false;
        this.updateVolumeIcon();
      });
    }

    if (this.btnMute) {
      this.btnMute.addEventListener('click', () => {
        this.audio.muted = !this.audio.muted;
        this.updateVolumeIcon();
      });
    }
  }

  setupAudioHandlers() {
    // Attach audio handlers only once
    this.audio.addEventListener('loadedmetadata', () => {
      if (!isNaN(this.audio.duration)) {
        this.totalTime.textContent = this.formatTime(this.audio.duration);
        this.seekBar.max = this.audio.duration;
      }
    });

    this.audio.addEventListener('timeupdate', () => {
      if (!isNaN(this.audio.currentTime)) {
        this.seekBar.value = this.audio.currentTime;
        this.currentTime.textContent = this.formatTime(this.audio.currentTime);
      }
    });

    this.audio.addEventListener('play', () => {
      this.btnPlayPause.innerHTML = '<i class="bi bi-pause-fill"></i>';
      this.updatePlaylistPlayButtons();
    });

    this.audio.addEventListener('pause', () => {
      this.btnPlayPause.innerHTML = '<i class="bi bi-play-fill"></i>';
      this.updatePlaylistPlayButtons();
    });

    this.audio.addEventListener('ended', () => {
      // When a song ends, clear the playing id and update UI
      this.currentPlayingSongId = null;
      this.btnPlayPause.innerHTML = '<i class="bi bi-play-fill"></i>';
      this.updatePlaylistPlayButtons();
    });

    // initial volume icon
    this.updateVolumeIcon();
  }

  updateVolumeIcon() {
    if (!this.volumeIcon) return;
    if (this.audio.muted || this.audio.volume === 0) {
      this.volumeIcon.className = 'bi bi-volume-mute';
    } else if (this.audio.volume < 0.5) {
      this.volumeIcon.className = 'bi bi-volume-down';
    } else {
      this.volumeIcon.className = 'bi bi-volume-up';
    }
  }

  formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  renderPlaylists() {
    this.playlistGrid.innerHTML = '';
    const playlists = this.playlistManager.loadPlaylists();
    if (playlists.length === 0) {
      this.noPlaylistsMessage.style.display = 'block';
    } else {
      this.noPlaylistsMessage.style.display = 'none';
      playlists.forEach(p => this.playlistGrid.appendChild(this.createPlaylistCard(p)));
    }
  }

  createPlaylistCard(playlist) {
    const col = document.createElement('div');
    col.className = 'col-6 col-sm-4 col-md-3 col-xl-2';

    const firstSongId = playlist.songIds[0];
    const firstSong = firstSongId ? this.songAPI.getSongById(firstSongId) : null;
    const coverImage = firstSong?.cover || '';

    col.innerHTML = `
      <div class="playlist-card" data-playlist-id="${playlist.id}">
        <div class="playlist-cover-placeholder">
          ${coverImage ? `<img src="${coverImage}" alt="Cover">` : `<i class="bi bi-journal-album"></i>`}
        </div>
        <div class="playlist-card-content">
          <h6 class="playlist-title text-truncate">${playlist.name}</h6>
          <p class="playlist-song-count text-truncate">
            <i class="bi bi-music-note-beamed"></i> ${playlist.songIds.length} songs
          </p>
        </div>
      </div>
    `;

    col.querySelector('.playlist-card').addEventListener('click', () => {
      this.openViewPlaylistModal(playlist.id);
    });

    return col;
  }

  openAddPlaylistModal() {
    this.playlistModalLabel.textContent = 'Create Playlist';
    this.playlistNameInput.value = '';
    this.playlistDescriptionInput.value = '';
    this.savePlaylistBtn.dataset.mode = 'create';
    this.playlistModal.show();
  }

  openViewPlaylistModal(playlistId) {
    const playlist = this.playlistManager.getPlaylist(playlistId);
    if (!playlist) return;

    this.currentPlaylistId = playlistId;
    this.viewPlaylistName.textContent = playlist.name;
    this.viewPlaylistDescription.textContent = playlist.description || 'No description';
    this.viewPlaylistSongCount.textContent = `${playlist.songIds.length} songs`;

    this.renderPlaylistSongs(playlistId);
    this.viewPlaylistModal.show();
  }

  async handleSongSearch() {
    const query = this.addSongInput.value.trim();
    if (!query) return;

    this.addSongResults.innerHTML = '<p class="text-muted">Searching...</p>';
    await this.songAPI.fetchAllSongs(); // ensure songs loaded
    const results = this.songAPI.searchSongs(query);

    if (results.length === 0) {
      this.addSongResults.innerHTML = '<p class="text-muted">No songs found.</p>';
      return;
    }

    this.addSongResults.innerHTML = '';
    results.forEach(song => {
      const div = document.createElement('div');
      div.className = 'song-result d-flex align-items-center justify-content-between border-bottom py-2';
      div.innerHTML = `
        <div>
          <strong>${song.title}</strong><br>
          <small>${song.artist}</small>
        </div>
        <button class="btn btn-sm btn-success" data-song-id="${song.id}">
          <i class="bi bi-plus-lg"></i>
        </button>
      `;
      div.querySelector('button').addEventListener('click', () => {
        this.handleAddSongToPlaylist(song.id);
      });
      this.addSongResults.appendChild(div);
    });
  }

  handleAddSongToPlaylist(songId) {
    if (!this.currentPlaylistId) return;
    const added = this.playlistManager.addSongToPlaylist(this.currentPlaylistId, songId);
    if (added) {
      this.renderPlaylistSongs(this.currentPlaylistId);
      this.renderPlaylists(); // update grid counts/cover
    } else {
      alert('This song is already in the playlist.');
    }
  }

  /**
   * Play a song by id (centralized)
   */
  playSongById(songId) {
    const sid = String(songId);
    const song = this.songAPI.getSongById(sid);
    if (!song || !song.url) {
      alert('Song URL not available.');
      return;
    }

    // set player info
    this.playerCover.src = song.cover || '';
    this.playerTitle.textContent = song.title;
    this.playerArtist.textContent = song.artist;

    // set current id and load/play
    this.currentPlayingSongId = sid;

    // encode URI in case filenames contain spaces
    try {
      this.audio.src = encodeURI(song.url);
    } catch (e) {
      this.audio.src = song.url;
    }

    const playPromise = this.audio.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(err => {
        // autoplay might be blocked by browser - ignore
        // console.warn('Playback prevented:', err);
      });
    }

    // update UI
    this.btnPlayPause.innerHTML = '<i class="bi bi-pause-fill"></i>';
    this.updatePlaylistPlayButtons();
  }

  /**
   * Update each playlist row play button so only the playing song shows pause
   */
  updatePlaylistPlayButtons() {
    const btns = this.viewPlaylistSongsList.querySelectorAll('.play-song-btn');
    btns.forEach(btn => {
      const id = String(btn.dataset.songId);
      if (id === String(this.currentPlayingSongId) && !this.audio.paused && this.audio.src) {
        btn.innerHTML = '<i class="bi bi-pause-fill"></i>';
      } else {
        btn.innerHTML = '<i class="bi bi-play-fill"></i>';
      }
    });
  }

  /**
   * Play next song in the current playlist (wraps)
   */
  playNext() {
    if (!this.currentPlaylistId) return;
    const playlist = this.playlistManager.getPlaylist(this.currentPlaylistId);
    if (!playlist || !playlist.songIds.length) return;

    if (!this.currentPlayingSongId) {
      this.playSongById(playlist.songIds[0]);
      return;
    }

    const idx = playlist.songIds.indexOf(String(this.currentPlayingSongId));
    const nextIdx = (idx === -1 || idx === playlist.songIds.length - 1) ? 0 : idx + 1;
    this.playSongById(playlist.songIds[nextIdx]);
  }

  /**
   * Play previous: if > 3s into track, restart; otherwise go previous
   */
  playPrev() {
    if (!this.currentPlaylistId) return;
    const playlist = this.playlistManager.getPlaylist(this.currentPlaylistId);
    if (!playlist || !playlist.songIds.length) return;

    if (!this.currentPlayingSongId) {
      this.playSongById(playlist.songIds[0]);
      return;
    }

    if (this.audio.currentTime > 3) {
      this.audio.currentTime = 0;
      return;
    }

    const idx = playlist.songIds.indexOf(String(this.currentPlayingSongId));
    const prevIdx = (idx <= 0) ? playlist.songIds.length - 1 : idx - 1;
    this.playSongById(playlist.songIds[prevIdx]);
  }

  /** ------------------------------
   * UPDATED renderPlaylistSongs() with Play & Pause (fixed)
   * ------------------------------ */
  renderPlaylistSongs(playlistId) {
    const playlist = this.playlistManager.getPlaylist(playlistId);
    this.viewPlaylistSongsList.innerHTML = '';

    if (!playlist || playlist.songIds.length === 0) {
      this.noSongsInPlaylist.style.display = 'block';
      return;
    }

    this.noSongsInPlaylist.style.display = 'none';

    // create list items
    playlist.songIds.forEach(songId => {
      const song = this.songAPI.getSongById(songId);
      if (!song) return;

      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center gap-3';

      li.innerHTML = `
        <div class="d-flex align-items-center gap-3 flex-grow-1">
          <img src="${song.cover || 'https://via.placeholder.com/50'}" alt="${song.title}" class="rounded" style="width:50px;height:50px;object-fit:cover;">
          <div class="flex-grow-1">
            <strong>${song.title}</strong><br>
            <small class="text-muted">${song.artist}</small>
          </div>
        </div>
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-sm btn-primary play-song-btn" data-song-id="${song.id}">
            <i class="bi bi-play-fill"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger remove-song-btn" data-song-id="${song.id}">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
      `;

      // play/pause button
      const playBtn = li.querySelector('.play-song-btn');
      playBtn.addEventListener('click', () => {
        // if this song is already current playing song
        if (String(this.currentPlayingSongId) === String(song.id)) {
          // toggle pause/play
          if (this.audio.paused) this.audio.play();
          else this.audio.pause();
        } else {
          // play the selected song
          this.playSongById(song.id);
        }
      });

      // remove
      li.querySelector('.remove-song-btn').addEventListener('click', () => {
        this.playlistManager.removeSongFromPlaylist(playlistId, song.id);
        // if the removed song is currently playing, stop it
        if (String(this.currentPlayingSongId) === String(song.id)) {
          this.audio.pause();
          this.audio.removeAttribute('src');
          this.audio.load();
          this.currentPlayingSongId = null;
          this.btnPlayPause.innerHTML = '<i class="bi bi-play-fill"></i>';
        }
        this.renderPlaylistSongs(playlistId);
        this.renderPlaylists();
      });

      this.viewPlaylistSongsList.appendChild(li);
    });

    // ensure play buttons reflect current state
    this.updatePlaylistPlayButtons();
  }

  handleSavePlaylist(e) {
    e.preventDefault();
    const name = this.playlistNameInput.value.trim();
    const description = this.playlistDescriptionInput.value.trim();
    if (!name) return alert('Playlist name required.');

    if (this.savePlaylistBtn.dataset.mode === 'create') {
      this.playlistManager.createPlaylist(name, description);
    } else if (this.currentPlaylistId) {
      const playlist = this.playlistManager.getPlaylist(this.currentPlaylistId);
      playlist.name = name;
      playlist.description = description;
      this.playlistManager.savePlaylists();
    }

    this.playlistModal.hide();
    this.renderPlaylists();
  }

  handleDeletePlaylist() {
    if (!this.currentPlaylistId) return;
    if (confirm('Delete this playlist?')) {
      // if deleting playlist that contains currently playing song, stop it
      const playlist = this.playlistManager.getPlaylist(this.currentPlaylistId);
      if (playlist && this.currentPlayingSongId && playlist.songIds.includes(this.currentPlayingSongId)) {
        this.audio.pause();
        this.audio.removeAttribute('src');
        this.audio.load();
        this.currentPlayingSongId = null;
      }
      this.playlistManager.deletePlaylist(this.currentPlaylistId);
      this.viewPlaylistModal.hide();
      this.renderPlaylists();
    }
  }
}

/** ------------------------------
 * Initialize app
 * ------------------------------ */
document.addEventListener('DOMContentLoaded', async () => {
  const playlistManager = new PlaylistManager();
  // the API url you provided
  const songAPI = new SongAPI('https://raw.githubusercontent.com/mrtariq00/api-s/refs/heads/main/songsApi.json');
  const uiManager = new UIManager(playlistManager, songAPI);
  await songAPI.fetchAllSongs(); // make sure songs are loaded (maps src -> url & string ids)
  uiManager.renderPlaylists();
});
