// ========================
// DATE SETUP
// ========================
const startInput = document.getElementById('startDate');
const endInput   = document.getElementById('endDate');
setupDateInputs(startInput, endInput);

// ========================
// RANDOM SPACE FACT (LevelUp)
// ========================
const SPACE_FACTS = [
  "A day on Venus is longer than a year on Venus — it takes 243 Earth days to rotate once but only 225 Earth days to orbit the Sun.",
  "Neutron stars are so dense that a teaspoon of their material would weigh about 10 million tons on Earth.",
  "The Milky Way galaxy is on a collision course with the Andromeda galaxy — but don't worry, it won't happen for about 4.5 billion years.",
  "There are more stars in the observable universe than grains of sand on all of Earth's beaches.",
  "Light from the Sun takes about 8 minutes and 20 seconds to reach Earth.",
  "The largest known star, UY Scuti, is about 1,700 times the radius of our Sun.",
  "Saturn's rings are mostly made of ice and rock, and they are only about 30 feet thick on average despite spanning 175,000 miles.",
  "A year on Mercury is just 88 Earth days long.",
  "The footprints left by Apollo astronauts on the Moon will likely remain there for millions of years — there is no wind to erode them.",
  "Jupiter's Great Red Spot is a storm that has been raging for at least 350 years.",
  "NASA's Voyager 1 is the most distant human-made object — it left our solar system in 2012.",
  "The Hubble Space Telescope travels at about 17,000 mph and completes an orbit of Earth every 95 minutes.",
  "There is a giant cloud of alcohol floating in space — it spans 288 billion miles.",
  "On Mars, sunsets appear blue due to the way dust in the atmosphere scatters light.",
  "The Sun accounts for 99.86% of the total mass of our entire solar system."
];

function loadSpaceFact() {
  const fact = SPACE_FACTS[Math.floor(Math.random() * SPACE_FACTS.length)];
  document.getElementById('factText').textContent = fact;
}

loadSpaceFact();

// ========================
// NASA API
// ========================
const API_KEY = 'AacYcWcfPluzjFcIOY7vfOvi4rqVQFL7o71tmAJ9';

document.getElementById('fetchBtn').addEventListener('click', fetchImages);

async function fetchImages() {
  const start = startInput.value;
  const end   = endInput.value;

  if (!start || !end) {
    alert('Please select both a start and end date.');
    return;
  }

  // show loading, hide gallery
  document.getElementById('loading').classList.add('show');
  document.getElementById('gallery').style.display = 'none';

  try {
    const url = `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&start_date=${start}&end_date=${end}`;
    const res  = await fetch(url);
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    const data = await res.json();
    renderGallery(Array.isArray(data) ? data : [data]);
  } catch (err) {
    console.error(err);
    document.getElementById('gallery').innerHTML = `
      <div class="placeholder">
        <div class="placeholder-icon">⚠️</div>
        <p>Something went wrong contacting NASA. Please try again.</p>
      </div>`;
    document.getElementById('gallery').style.display = 'flex';
  } finally {
    document.getElementById('loading').classList.remove('show');
  }
}

// ========================
// GALLERY RENDER
// ========================
function renderGallery(items) {
  const gallery = document.getElementById('gallery');
  gallery.innerHTML = '';
  gallery.style.display = 'flex';

  items.forEach((item, i) => {
    const el = document.createElement('div');
    el.className = 'gallery-item';
    el.style.animationDelay = (i * 0.05) + 's';

    const isVideo = item.media_type === 'video';

    if (isVideo) {
      // LevelUp: handle video entries
      const videoId = getYouTubeId(item.url);
      el.innerHTML = `
        <div class="gallery-item-inner">
          <div class="gallery-video-thumb">
            <span class="play-icon">▶</span>
            <span>Watch Video</span>
          </div>
        </div>
        <div class="gallery-item-info">
          <div class="gallery-item-date">${formatDate(item.date)}</div>
          <div class="gallery-item-title">${item.title}</div>
        </div>`;
    } else {
      el.innerHTML = `
        <div class="gallery-item-inner">
          <img src="${item.url}" alt="${item.title}" loading="lazy" />
        </div>
        <div class="gallery-item-info">
          <div class="gallery-item-date">${formatDate(item.date)}</div>
          <div class="gallery-item-title">${item.title}</div>
        </div>`;
    }

    el.addEventListener('click', () => openModal(item));
    gallery.appendChild(el);
  });
}

// ========================
// MODAL
// ========================
function openModal(item) {
  const isVideo = item.media_type === 'video';
  const mediaEl = document.getElementById('modalMedia');

  if (isVideo) {
    const videoId = getYouTubeId(item.url);
    if (videoId) {
      mediaEl.innerHTML = `<iframe class="modal-video" src="https://www.youtube.com/embed/${videoId}" allowfullscreen></iframe>`;
    } else {
      mediaEl.innerHTML = `<div style="padding:20px;text-align:center;">
        <a href="${item.url}" target="_blank" style="color:#0B3D91;font-size:15px;">Watch on external site &rarr;</a>
      </div>`;
    }
  } else {
    mediaEl.innerHTML = `<img src="${item.hdurl || item.url}" alt="${item.title}" />`;
  }

  document.getElementById('modalDate').textContent        = formatDate(item.date);
  document.getElementById('modalTitle').textContent       = item.title;
  document.getElementById('modalExplanation').textContent = item.explanation;
  document.getElementById('modalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(e) {
  if (e.target === document.getElementById('modalOverlay')) closeModalBtn();
}

function closeModalBtn() {
  document.getElementById('modalOverlay').classList.remove('open');
  document.getElementById('modalMedia').innerHTML = '';
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModalBtn();
});

// ========================
// HELPERS
// ========================
function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(m,10)-1]} ${parseInt(d,10)}, ${y}`;
}

function getYouTubeId(url) {
  const match = url.match(/(?:youtube\.com\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}
