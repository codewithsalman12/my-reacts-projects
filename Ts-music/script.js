document.addEventListener('DOMContentLoaded', () => {
  // ====== Playlist Data from API ======
  let playlist = []; // This will always hold the full, unfiltered list

  fetch('https://raw.githubusercontent.com/mrtariq00/api-s/refs/heads/main/songsApi.json')
    .then(res => {
      if (!res.ok) throw new Error('Could not fetch songs API');
      return res.json();
    })
    .then(data => {
      playlist = data.songs || [];
      renderTrackList(playlist); // Render initial full list
      renderAlbums(playlist);    // Render initial full list
      if (playlist.length > 0) {
        loadTrack(0, false);
      }
    })
    .catch(err => {
      console.error('Error loading playlist:', err);
    });

  // ====== DOM Elements ======
  const sidebarList = document.getElementById('trackList');
  const albumsGrid = document.getElementById('albumsGrid');
  const audio = document.getElementById('audio');

  const playerCover = document.getElementById('playerCover');
  const playerTitle = document.getElementById('playerTitle');
  const playerArtist = document.getElementById('playerArtist');

  const btnPlayPause = document.getElementById('btnPlayPause');
  const btnNext = document.getElementById('btnNext');
  const btnPrev = document.getElementById('btnPrev');
  const btnShuffle = document.getElementById('btnShuffle');
  const btnRepeat = document.getElementById('btnRepeat');

  const seekBar = document.getElementById('seekBar');
  const currentTimeEl = document.getElementById('currentTime');
  const totalTimeEl = document.getElementById('totalTime');

  const volumeRange = document.getElementById('volumeRange');
  const btnMute = document.getElementById('btnMute');
  const volumeIcon = document.getElementById('volumeIcon');

  const searchInput = document.getElementById('searchInput');

  // ====== State ======
  const state = {
    index: 0, // This should always be the index in the original 'playlist' array
    isPlaying: false,
    shuffle: false,
    repeat: false
  };

  // ====== Render UI ======
  // Modified renderTrackList to use 'originalIndex'
  function renderTrackList(listToRender) { // Accepts a list, which might be filtered
    sidebarList.innerHTML = '';
    listToRender.forEach((track) => {
      // Find the original index of this track in the full playlist
      const originalIndex = playlist.findIndex(pTrack => pTrack.title === track.title && pTrack.artist === track.artist);
      if (originalIndex === -1) return; // Should not happen if tracks are unique enough

      const li = document.createElement('li');
      li.className = 'track-item';
      li.innerHTML = `
        <img class="track-thumb" src="${track.cover}" alt="Cover: ${track.title}">
        <div class="track-info">
          <div class="track-title text-truncate">${track.title.replaceAll('_',' ')}</div>
          <div class="track-artist text-truncate">${track.artist}</div>
        </div>
        <button class="sidebar-play-btn" data-original-index="${originalIndex}" aria-label="Play ${track.title} by ${track.artist}">
          <i class="bi bi-play-fill"></i>
        </button>
      `;
      sidebarList.appendChild(li);
    });

    sidebarList.querySelectorAll('.sidebar-play-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const originalIdx = Number(btn.dataset.originalIndex); // Use original index
        if (originalIdx === state.index && state.isPlaying) {
          pause();
        } else {
          loadTrack(originalIdx, true);
        }
      });
    });

    sidebarList.querySelectorAll('.track-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (!e.target.classList.contains('sidebar-play-btn') && !e.target.closest('.sidebar-play-btn')) {
                const originalIdx = Number(item.querySelector('.sidebar-play-btn').dataset.originalIndex); // Use original index
                loadTrack(originalIdx, true);
            }
        });
    });
  }

  // Modified renderAlbums to use 'originalIndex'
  function renderAlbums(listToRender) { // Accepts a list, which might be filtered
    albumsGrid.innerHTML = '';
    listToRender.forEach((track) => {
        // Find the original index of this track in the full playlist
        const originalIndex = playlist.findIndex(pTrack => pTrack.title === track.title && pTrack.artist === track.artist);
        if (originalIndex === -1) return; // Should not happen

      const col = document.createElement('div');
      col.className = 'col-6 col-sm-4 col-md-3 col-xl-2';
      col.innerHTML = `
        <div class="album-card" data-original-index="${originalIndex}">
          <div class="album-art">
            <img src="${track.cover}" alt="Album cover of ${track.title}">
            <button class="play-on-card" aria-label="Play ${track.title}">
              <i class="bi bi-play-fill"></i>
            </button>
          </div>
          <div class="album-meta">
            <h6 class="album-title text-truncate">${track.title.replaceAll('_',' ')}</h6>
            <p class="album-artist text-truncate mb-0">${track.artist}</p>
          </div>
        </div>
      `;
      albumsGrid.appendChild(col);
    });

    albumsGrid.querySelectorAll('.album-card').forEach(card => {
      card.addEventListener('click', () => {
        const originalIdx = Number(card.dataset.originalIndex); // Use original index
        loadTrack(originalIdx, true);
      });
      const btn = card.querySelector('.play-on-card');
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const originalIdx = Number(card.dataset.originalIndex); // Use original index
        if (originalIdx === state.index && state.isPlaying) {
          pause();
        } else {
          loadTrack(originalIdx, true);
        }
      });
    });
  }

  // ====== Helpers ======
  function setActiveUI(index) { // 'index' here is always the original playlist index
    // Update sidebar track list UI
    sidebarList.querySelectorAll('.track-item').forEach(item => {
      item.classList.remove('active');
      const btnIcon = item.querySelector('.sidebar-play-btn i');
      if (btnIcon) btnIcon.className = 'bi bi-play-fill';
    });

    // Find the item corresponding to the active index in the currently displayed (potentially filtered) list
    const activeSidebarItem = sidebarList.querySelector(`.track-item .sidebar-play-btn[data-original-index="${index}"]`)?.closest('.track-item');
    if (activeSidebarItem) {
      activeSidebarItem.classList.add('active');
      const btnIcon = activeSidebarItem.querySelector('.sidebar-play-btn i');
      if (btnIcon) btnIcon.className = state.isPlaying ? 'bi bi-pause-fill' : 'bi bi-play-fill';
    }


    // Update album grid UI
    albumsGrid.querySelectorAll('.album-card .play-on-card i').forEach(i => i.className = 'bi bi-play-fill');
    // Find the card corresponding to the active index in the currently displayed (potentially filtered) list
    const activeCardBtnIcon = albumsGrid.querySelector(`.album-card[data-original-index="${index}"] .play-on-card i`);
    if (activeCardBtnIcon) {
      activeCardBtnIcon.className = state.isPlaying ? 'bi bi-pause-fill' : 'bi bi-play-fill';
    }
  }


  function updatePlayButton() {
    const icon = btnPlayPause.querySelector('i');
    icon.className = state.isPlaying ? 'bi bi-pause-fill' : 'bi bi-play-fill';
    setActiveUI(state.index); // Make sure this updates all play buttons
  }

  function formatTime(sec) {
    if (!isFinite(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  function setSeekbarBackground(el, percent) {
    el.style.background = `linear-gradient(90deg, var(--accent) ${percent}%, rgba(255,255,255,.17) ${percent}%)`;
  }

  function updateVolumeIcon(vol) {
    if (audio.muted || vol === 0) {
      volumeIcon.className = 'bi bi-volume-mute';
    } else if (vol < 50) {
      volumeIcon.className = 'bi bi-volume-down';
    } else {
      volumeIcon.className = 'bi bi-volume-up';
    }
  }

  // ====== Core Player Logic ======
  function loadTrack(index, autoplay = false) { // 'index' here is always the original playlist index
    state.index = index; // Update state with the original index
    const track = playlist[index]; // Get track from the FULL playlist
    if (!track) return;

    audio.src = track.src;
    audio.load();

    playerCover.src = track.cover;
    playerTitle.textContent = track.title.replaceAll('_',' ');
    playerArtist.textContent = track.artist;

    totalTimeEl.textContent = '0:00';
    currentTimeEl.textContent = '0:00';
    seekBar.value = 0;
    setSeekbarBackground(seekBar, 0);

    if (autoplay) play();
    else pause();

    setActiveUI(index);
  }

  function play() {
    audio.play().then(() => {
      state.isPlaying = true;
      updatePlayButton();
    }).catch(err => {
      console.warn('Play failed:', err);
      state.isPlaying = false;
      updatePlayButton();
    });
  }

  function pause() {
    audio.pause();
    state.isPlaying = false;
    updatePlayButton();
  }

  function nextTrack() {
    if (state.shuffle) {
      let next = Math.floor(Math.random() * playlist.length);
      if (playlist.length > 1) {
        while (next === state.index) { // Ensure different track if possible
          next = Math.floor(Math.random() * playlist.length);
        }
      }
      loadTrack(next, true);
    } else {
      const next = (state.index + 1) % playlist.length;
      loadTrack(next, true);
    }
  }

  function prevTrack() {
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    const prev = (state.index - 1 + playlist.length) % playlist.length;
    loadTrack(prev, true);
  }

  // ====== Event Listeners ======
  btnPlayPause.addEventListener('click', () => {
    state.isPlaying ? pause() : play();
  });
  btnNext.addEventListener('click', nextTrack);
  btnPrev.addEventListener('click', prevTrack);

  btnShuffle.addEventListener('click', () => {
    state.shuffle = !state.shuffle;
    btnShuffle.classList.toggle('active', state.shuffle);
  });
  btnRepeat.addEventListener('click', () => {
    state.repeat = !state.repeat;
    btnRepeat.classList.toggle('active', state.repeat);
  });

  // Keyboard
  window.addEventListener('keydown', e => {
    if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      e.preventDefault();
      state.isPlaying ? pause() : play();
    }
    if (e.code === 'ArrowRight') {
      audio.currentTime = Math.min(audio.currentTime + 5, audio.duration || audio.currentTime);
    }
    if (e.code === 'ArrowLeft') {
      audio.currentTime = Math.max(audio.currentTime - 5, 0);
    }
  });

  // Seekbar control
  seekBar.addEventListener('input', () => {
    const pct = Number(seekBar.value);
    setSeekbarBackground(seekBar, pct);
    if (isFinite(audio.duration)) {
      const newTime = (pct / 100) * audio.duration;
      audio.currentTime = newTime;
      currentTimeEl.textContent = formatTime(newTime);
    }
  });

  // Volume & mute
  audio.volume = 0.8;
  volumeRange.value = 80;
  setSeekbarBackground(volumeRange, 80);
  updateVolumeIcon(80);

  volumeRange.addEventListener('input', () => {
    const vol = Number(volumeRange.value);
    audio.volume = vol / 100;
    setSeekbarBackground(volumeRange, vol);
    updateVolumeIcon(vol);
    if (vol > 0 && audio.muted) audio.muted = false;
  });
  btnMute.addEventListener('click', () => {
    audio.muted = !audio.muted;
    updateVolumeIcon(audio.muted ? 0 : volumeRange.value);
  });

  // Audio events
  audio.addEventListener('loadedmetadata', () => {
    totalTimeEl.textContent = formatTime(audio.duration);
  });

  audio.addEventListener('timeupdate', () => {
    if (!isFinite(audio.duration)) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    seekBar.value = pct;
    setSeekbarBackground(seekBar, pct);
    currentTimeEl.textContent = formatTime(audio.currentTime);
  });

  audio.addEventListener('ended', () => {
    if (state.repeat) {
      loadTrack(state.index, true); // Repeat the same track
    } else {
      nextTrack(); // Go to the next track
    }
  });


  // Search filter
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.toLowerCase();
    const filtered = playlist.filter(track =>
      track.title.toLowerCase().includes(q) ||
      track.artist.toLowerCase().includes(q)
    );
    renderTrackList(filtered); // Pass the filtered list
    renderAlbums(filtered);     // Pass the filtered list
  });
});

const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");

menuToggle.addEventListener("click", () => {
  sidebar.classList.toggle("active");
});