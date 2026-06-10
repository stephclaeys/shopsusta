// ══════════════════════════════════════════
// PAGE ROUTING
// ══════════════════════════════════════════
function showPage(id) {
  if (typeof closeMega === 'function') closeMega();
  if (typeof closeBrandsDropdown === 'function') closeBrandsDropdown();
  if (typeof closeMobileDrawer === 'function') closeMobileDrawer();
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + id).classList.add('active');
  window.scrollTo(0, 0);
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (id === 'about') document.getElementById('navAbout').classList.add('active');
  if (id === 'brands') {
    document.getElementById('navBrands').classList.add('active');
    if (Object.keys(BRAND_REGISTRY).length === 0) {
      loadBrandRegistry().then(() => renderBrandBanners());
    } else {
      if (typeof renderBrandBanners === 'function') renderBrandBanners();
    }
  }
  if (id === 'shop' && !_productsLoaded) initShopCount();
  // Dynamic edit pages — key extracted from id like 'edit-bestdressed'
  if (id.startsWith('edit-')) {
    const key = id.replace('edit-', '');
    loadEditProducts(key);
  }
}

function goShop(cat) {
  if (typeof closeMega === 'function') closeMega();
  if (typeof closeBrandsDropdown === 'function') closeBrandsDropdown();
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-shop').classList.add('active');
  window.scrollTo(0, 0);
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  // Normalise category name
  const catMap = { pants:'bottoms', trousers:'bottoms' };
  const normCat = catMap[cat] || cat;
  shopSetCat(normCat);
  if (!_productsLoaded) initShopCount();
}

// ══════════════════════════════════════════
// MEGA MENU
// ══════════════════════════════════════════
let megaOpen = false;
let megaCloseTimer = null;

function openMega() {
  clearTimeout(megaCloseTimer);
  closeBrandsDropdown();
  document.getElementById('megaMenu').classList.add('open');
  document.getElementById('megaBackdrop').classList.add('open');
  megaOpen = true;
}

function closeMega() {
  document.getElementById('megaMenu').classList.remove('open');
  document.getElementById('megaBackdrop').classList.remove('open');
  megaOpen = false;
}

// ── Mega menu: trigger = navClothes, panel = megaMenu ──
(function() {
  const trigger = document.getElementById('navClothes');
  const panel   = document.getElementById('megaMenu');
  const delay   = 250;

  function enter() { clearTimeout(megaCloseTimer); openMega(); }
  function leave() { megaCloseTimer = setTimeout(closeMega, delay); }

  trigger.addEventListener('mouseenter', enter);
  trigger.addEventListener('mouseleave', leave);
  panel.addEventListener('mouseenter',   () => clearTimeout(megaCloseTimer));
  panel.addEventListener('mouseleave',   leave);
})();

// ══════════════════════════════════════════
// SHOP SIDEBAR FILTER
// ══════════════════════════════════════════
const SHOP_META = {
  all:         { title: 'Shop All',     sub: 'All curated pieces from 29 sustainable brands' },
  edits:       { title: 'Edits',        sub: 'Curated collections — more coming soon' },
  tops:        { title: 'Tops',         sub: 'Effortless layers from sustainable makers' },
  'tops:tank':         { title: 'Tank Tops',    sub: 'Effortless tank tops from sustainable makers' },
  'tops:short-sleeve': { title: 'Short Sleeves', sub: 'Short sleeve tops from sustainable makers' },
  'tops:long-sleeve':  { title: 'Long Sleeves',  sub: 'Long sleeve tops from sustainable makers' },
  'tops:knit':         { title: 'Knit Tops',     sub: 'Considered knitwear from sustainable makers' },
  dresses:     { title: 'Dresses',      sub: 'Midi, boho, knit — pieces you\'ll actually wear' },
  'dresses:mini': { title: 'Mini Dresses',  sub: 'Mini dresses from sustainable makers' },
  'dresses:midi': { title: 'Midi Dresses',  sub: 'Midi dresses from sustainable makers' },
  'dresses:long': { title: 'Long Dresses',  sub: 'Maxi and long dresses from sustainable makers' },
  bottoms:     { title: 'Bottoms',      sub: 'Trousers, shorts and more from sustainable makers' },
  'bottoms:shorts': { title: 'Shorts',   sub: 'Shorts from sustainable makers' },
  'bottoms:long':   { title: 'Trousers', sub: 'Trousers and wide-leg styles from sustainable makers' },
  denim:       { title: 'Denim',        sub: 'Circular, recycled, and made to last' },
  skirts:      { title: 'Skirts',       sub: 'From micro to maxi — sustainably made' },
  'skirts:mini': { title: 'Mini Skirts', sub: 'Mini skirts from sustainable makers' },
  'skirts:midi': { title: 'Midi Skirts', sub: 'Midi skirts from sustainable makers' },
  'skirts:long': { title: 'Long Skirts', sub: 'Maxi and long skirts from sustainable makers' },
  outerwear:   { title: 'Outerwear',    sub: 'More styles coming soon' },
  swim:        { title: 'Swim',         sub: 'Handmade and sustainably crafted swimwear' },
  'swim:bikini':    { title: 'Bikinis',    sub: 'Sustainably crafted bikinis' },
  'swim:one-piece': { title: 'One Pieces', sub: 'Sustainably crafted one piece swimwear' },
  shoes:       { title: 'Shoes',        sub: 'Vegan and plant-based footwear' },
  accessories: { title: 'Accessories',  sub: 'Jewellery and accessories handmade with care' },
  'accessories:necklaces': { title: 'Necklaces',  sub: 'Sustainably crafted necklaces' },
  'accessories:earrings':  { title: 'Earrings',   sub: 'Sustainably crafted earrings' },
  'accessories:rings':     { title: 'Rings',      sub: 'Sustainably crafted rings' },
  'accessories:bracelets': { title: 'Bracelets',  sub: 'Sustainably crafted bracelets' },
  'accessories:bags':      { title: 'Bags',       sub: 'Sustainably crafted bags' },
  'accessories:sunnies':   { title: 'Sunnies',    sub: 'Sustainably crafted sunglasses' },
  'accessories:hair':      { title: 'Hair',       sub: 'Sustainably crafted hair accessories' },
  'accessories:other':     { title: 'Accessories', sub: 'Other sustainably crafted accessories' },
};

const BRAND_META = {
  afends: 'Afends', agazi: 'Agazi', allblues: 'All Blues', anothertomorrow: 'Another Tomorrow',
  bastetnoir: 'Bastet Noir', borneo: 'Borneo Paris', charleeswim: 'Charlee Swim',
  christydawn: 'Christy Dawn', ftccashmere: 'FTC Cashmere', jiwya: 'Jiwya',
  lauralombardi: 'Laura Lombardi', mightygoodbasics: 'Mighty Good Basics',
  modallica: 'Modallica', mpdenmark: 'MP Denmark', mud: 'MUD Jeans',
  nudiejeans: 'Nudie Jeans', olistic: 'Olistic the Label', omnes: 'Omnes',
  outlanddenim: 'Outland Denim', redrew: 'Redrew', reformation: 'Reformation',
  sabinamotasem: 'Sabina Motasem', serpentandtheswan: 'Serpent & the Swan',
  silentwaveindigo: 'Silent Wave Indigo', souldaze: 'Souldaze', spell: 'Spell',
  teatumjones: 'Tea Tum Jones', theglade: 'The Glade', theknottyones: 'The Knotty Ones',
};

function toggleSub(id) {
  const sub = document.getElementById(id);
  if (!sub) return;
  const isOpen = sub.classList.contains('open');
  // close all subs first
  document.querySelectorAll('.sidebar-sub').forEach(s => s.classList.remove('open'));
  document.querySelectorAll('.sidebar-parent').forEach(s => s.classList.remove('open'));
  // open this one if it was closed
  if (!isOpen) {
    sub.classList.add('open');
    sub.previousElementSibling.classList.add('open');
  }
}

function sidebarFilter(cat, el) {
  // if products haven't loaded yet, queue the filter
  if (!_productsLoaded) {
    _pendingFilter = { cat, el };
    document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
    el.classList.add('active');
    return;
  }

  // update sidebar active state
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  el.classList.add('active');

  const isBrand = cat.startsWith('brand:');
  const isSubcat = !isBrand && cat.includes(':');
  const brandKey = isBrand ? cat.split(':')[1] : null;

  // for subcategories: parent category and sub-filter
  // e.g. 'dresses:midi' → parentCat='dresses', subFilter='midi'
  // sub-filter is stored in product's data-subcat attribute
  const [parentCat, subFilter] = isSubcat ? cat.split(':') : [cat, null];

  // filter cards
  const cards = document.querySelectorAll('.product-card');
  let visible = 0;
  cards.forEach(card => {
    let show;
    if (isBrand) {
      show = card.dataset.brand === brandKey;
    } else if (isSubcat) {
      // Primary: match parent category AND subcategory tag from DB
      const catMatch = card.dataset.cat === parentCat;
      const subcatMatch = card.dataset.subcat === subFilter;
      // Fallback: if subcat field is empty, try name/material keyword matching
      const subcatEmpty = !card.dataset.subcat;
      let keywordMatch = false;
      if (subcatEmpty) {
        const nameStr = (card.dataset.name + ' ' + card.dataset.material).toLowerCase();
        const SUBCAT_KEYWORDS = {
          'tank': ['tank', 'singlet', 'cami', 'camisole', 'vest top'],
          'short-sleeve': ['short sleeve', 'short-sleeve', 'tee', 't-shirt'],
          'long-sleeve': ['long sleeve', 'long-sleeve'],
          'knit': ['knit', 'sweater', 'jumper', 'cardigan', 'pullover'],
          'mini': ['mini'],
          'midi': ['midi'],
          'long': ['maxi', 'long', 'floor'],
          'shorts': ['short', 'shorts'],
          'bikini': ['bikini', 'two-piece'],
          'one-piece': ['one-piece', 'one piece', 'swimsuit', 'monokini'],
          'necklaces': ['necklace', 'pendant', 'chain'],
          'earrings': ['earring', 'ear ring', 'stud', 'hoop'],
          'rings': ['ring'],
          'bracelets': ['bracelet', 'bangle'],
          'bags': ['bag', 'tote', 'clutch', 'purse'],
          'sunnies': ['sunglass', 'sunnies'],
          'hair': ['hair', 'scrunchie', 'clip']
        };
        const keywords = SUBCAT_KEYWORDS[subFilter] || [subFilter];
        keywordMatch = keywords.some(kw => nameStr.includes(kw));
      }
      show = catMatch && (subcatMatch || keywordMatch);
    } else {
      // top-level: bottoms matches both 'bottoms' and old 'trousers' data
      if (cat === 'bottoms') {
        show = card.dataset.cat === 'bottoms' || card.dataset.cat === 'trousers';
      } else {
        show = cat === 'all' || cat === 'edits' || card.dataset.cat === cat;
      }
    }
    card.dataset.sidebarHidden = show ? 'false' : 'true';
    card.style.display = show ? '' : 'none';
    if (show) visible++;
  });

  // Re-apply any active dropdown filters on top of sidebar results
  const hasActiveFilters = _activeFilters && (
    _activeFilters.brand.size + _activeFilters.material.size + _activeFilters.color.size > 0);
  if (hasActiveFilters) { _applyActiveFilters(); return; }

  // update header
  if (isBrand) {
    const bName = BRAND_META[brandKey] || brandKey;
    document.getElementById('shopTitle').textContent = bName;
    document.getElementById('shopSub').textContent = 'All pieces from ' + bName;
  } else {
    const meta = SHOP_META[cat] || SHOP_META.all;
    document.getElementById('shopTitle').textContent = meta.title;
    document.getElementById('shopSub').textContent = meta.sub;
  }
  document.getElementById('noResults').style.display = visible === 0 ? 'block' : 'none';
  // re-apply like states after filtering
  renderLikeStates();
  // mobile: update label and close sidebar
  const mobileLabel = document.getElementById('mobileFilterActive');
  if (mobileLabel) {
    const activeEl = document.querySelector('.sidebar-link.active');
    mobileLabel.textContent = activeEl ? activeEl.textContent.trim() : '';
  }
  if (window.innerWidth <= 768) closeMobileSidebar();
}

// ── BRAND LABELS ──────────────────────────
const BRAND_LABELS = {"afends": "Afends", "agazi": "Agazi", "allblues": "All Blues", "anothertomorrow": "Another Tomorrow", "bastetnoir": "Bastet Noir", "borneo": "Borneo Paris", "charleeswim": "Charlee Swim", "christydawn": "Christy Dawn", "ftccashmere": "FTC Cashmere", "jiwya": "Jiwya", "lauralombardi": "Laura Lombardi", "mightygoodbasics": "Mighty Good Basics", "modallica": "Modallica", "mpdenmark": "MP Denmark", "mud": "MUD Jeans", "nudiejeans": "Nudie Jeans", "olistic": "Olistic the Label", "omnes": "Omnes", "outlanddenim": "Outland Denim", "redrew": "Redrew", "reformation": "Reformation", "sabinamotasem": "Sabina Motasem", "serpentandtheswan": "Serpent & the Swan", "silentwaveindigo": "Silent Wave Indigo", "souldaze": "Souldaze", "spell": "Spell", "teatumjones": "Tea Tum Jones", "theglade": "The Glade", "theknottyones": "The Knotty Ones", "nobodyschild": "Nobody's Child", "ninteypercent": "Ninety Percent", "reformation": "Reformation"};

// ── BRAND CURRENCY SYMBOLS ─────────────────
const BRAND_CURRENCY = {
  afends: 'AUD', agazi: 'EUR', allblues: 'SEK', anothertomorrow: '$',
  bastetnoir: '£', borneo: '€', charleeswim: 'AUD', christydawn: '$',
  ftccashmere: '€', jiwya: '£', lauralombardi: '$', mightygoodbasics: '$',
  modallica: '€', mpdenmark: 'DKK', mud: '€', nudiejeans: '€',
  olistic: 'AUD', omnes: '£', outlanddenim: '$', redrew: 'AUD',
  reformation: '$', sabinamotasem: '£', serpentandtheswan: 'AUD',
  silentwaveindigo: '$', souldaze: '$', spell: 'AUD',
  teatumjones: '£', theglade: '$', theknottyones: '$',
  nobodyschild: '£', ninteypercent: '£'
};

// Prepend the right currency symbol to a price string
function formatPrice(priceRaw, brand) {
  if (!priceRaw) return '';
  const raw = String(priceRaw).trim();
  // Already has a currency symbol — return as-is
  if (/^[$£€¥₹A-Z]{1,4}[\s\d]/.test(raw) || /[£€$]/.test(raw)) return raw;
  const sym = BRAND_CURRENCY[brand] || '$';
  // Handle "From 95" → "From AUD 95" etc.
  if (/^from /i.test(raw)) return raw.replace(/^from /i, `From ${sym} `);
  return sym + raw;
}

// ── RENDER PRODUCT CARD ────────────────────
function escAttr(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function renderCard(p) {
  const brandLabel = BRAND_LABELS[p.brand] || p.brand;
  const tagClass = p.tag_type === 'eco' ? 'eco' : 'standard';
  const displayPrice = formatPrice(p.price, p.brand);
  const imgHtml = p.image_url
    ? `<img src="${escAttr(p.image_url)}" alt="${escAttr(p.name)}" loading="lazy" onerror="this.parentElement.classList.add('img-missing')">`
    : '';
  return `
    <div class="product-card" data-id="${escAttr(p.id)}" data-cat="${escAttr(p.category)}" data-brand="${escAttr(p.brand)}"
         data-name="${escAttr(p.name)}" data-brandlabel="${escAttr(brandLabel)}"
         data-price="${escAttr(displayPrice)}" data-material="${escAttr(p.material || '')}"
         data-img="${escAttr(p.image_url || '')}" data-url="${escAttr(p.shop_url)}"
         data-subcat="${escAttr(p.subcategory || '')}" data-occasion="${escAttr(p.occasion || '')}" data-color="${escAttr(p.color || '')}">
      <div class="product-img">
        ${imgHtml}
        <div class="product-img-overlay"></div>
        ${p.tag ? `<span class="product-tag ${tagClass}">${p.tag}</span>` : ''}
        <a href="${p.shop_url}" target="_blank" class="quick-shop" onclick="trackClick(${p.id})">Shop on ${brandLabel} →</a>
        <button class="like-btn" onclick="toggleLike(event,this)" aria-label="Like">
          <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
        <button class="flag-btn" onclick="toggleFlag(event,this)" aria-label="Flag unavailable" title="Flag as unavailable">
          <svg viewBox="0 0 24 24"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
        </button>
      </div>
      <div class="product-info">
        <p class="product-brand-lbl" onclick="event.stopPropagation();showBrandDetail('${p.brand}')" style="cursor:pointer;" title="View ${brandLabel}">${brandLabel}</p>
        <p class="product-name">${p.name}</p>
        <p class="product-material">${p.material || ''}</p>
        <p class="product-price">${displayPrice}</p>
      </div>
    </div>`;
}

// ── LOAD ALL PRODUCTS FROM SUPABASE ───────
let _productsLoaded = false;
let _pendingFilter = null;

async function initShopCount() {
  if (_productsLoaded) return;
  const grid = document.getElementById('productGrid');
  grid.innerHTML = '<p style="padding:40px;color:var(--taupe);font-size:12px;letter-spacing:0.08em">Loading…</p>';

  try {
    // Always query by id — reliable fallback, click_count column may not exist yet
    let data = null;
    try {
      const r1 = await sb.from('products').select('*').or('visible.is.null,visible.eq.true').order('click_count', { ascending: false });
      if (!r1.error && r1.data) data = r1.data;
    } catch(e) {}

    // Fallback to ordering by id if click_count failed or returned nothing
    if (!data) {
      try {
        const r2 = await sb.from('products').select('*').or('visible.is.null,visible.eq.true').order('id');
        if (!r2.error && r2.data) data = r2.data;
      } catch(e) {}
    }

    if (!data) {
      grid.innerHTML = '<p style="padding:40px;color:var(--taupe)">Could not connect to database. Please try again.</p>';
      return;
    }

    if (data.length === 0) {
      grid.innerHTML = '<p style="padding:40px;color:var(--taupe)">No products in database yet.</p>';
      return;
    }

    // Tag each card with load order for sort-by-recommended
    _allProducts = data;
    grid.innerHTML = data.map(renderCard).join('');
    grid.querySelectorAll('.product-card').forEach((card, i) => {
      card.dataset.loadorder = i;
    });
    _productsLoaded = true;
    renderLikeStates();

    // Run the combined filter now that products are loaded
    runCombinedFilter();
    document.getElementById('shopSub').textContent = 'All curated pieces from ' + Object.keys(BRAND_LABELS).length + ' sustainable brands';
    const noRes = document.getElementById('noResults');
    if (noRes) noRes.style.display = 'none';
  } catch(e) {
    grid.innerHTML = '<p style="padding:40px;color:var(--taupe)">Could not load products. Please try refreshing the page.</p>';
  }
}


// ══════════════════════════════════════════
// ══════════════════════════════════════════
// HOME DUO — Just In + New Brand
// ══════════════════════════════════════════
let _newBrandKey = null;

async function initHomeDuo() {
  // Fetch newest 20 products ordered by id descending
  const { data: newest } = await sb
    .from('products')
    .select('*')
    .or('visible.is.null,visible.eq.true')
    .order('id', { ascending: false })
    .limit(50);

  if (!newest || !newest.length) return;

  // ── Left: Just In — most recently added product with an image ──
  const justIn = newest.find(p => p.image_url) || newest[0];
  const justInWrap = document.getElementById('homeDuoJustInImg');
  if (justIn.image_url) {
    const img = new Image();
    img.src = justIn.image_url;
    img.alt = justIn.name;
    img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;';
    justInWrap.innerHTML = '';
    justInWrap.appendChild(img);
  }

  // ── Right: New Brand — find the newest brand not in the oldest products ──
  // Get the most recently added brand by finding the brand of the newest product
  // that differs from the very newest product's brand
  const newestBrand = newest[0].brand;

  // Find a product from a *different* brand that still appears early in newest list
  // = the second most recently introduced brand
  const seen = new Set([newestBrand]);
  let newBrandProduct = null;
  for (const p of newest) {
    if (!seen.has(p.brand) && p.image_url) {
      newBrandProduct = p;
      _newBrandKey = p.brand;
      break;
    }
    seen.add(p.brand);
  }
  // Fallback: just use a product from the newest brand
  if (!newBrandProduct) {
    newBrandProduct = newest.find(p => p.image_url) || newest[0];
    _newBrandKey = newBrandProduct.brand;
  }

  const brandLabel = BRAND_LABELS[newBrandProduct.brand] || newBrandProduct.brand;
  const newBrandWrap = document.getElementById('homeDuoNewBrandImg');
  if (newBrandProduct.image_url) {
    const img2 = new Image();
    img2.src = newBrandProduct.image_url;
    img2.alt = newBrandProduct.name;
    img2.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;';
    newBrandWrap.innerHTML = '';
    newBrandWrap.appendChild(img2);
  }

}

function goShopNewest() {
  goShop('all');
  // After products load, sort by newest
  setTimeout(() => {
    const sortEl = document.querySelector('[data-sort="newest"]');
    if (sortEl) sortEl.click();
  }, 800);
}

function goShopNewBrand() {
  if (_newBrandKey) {
    goShop('all');
    // After products load, filter to the new brand via sidebar
    const applyBrand = () => {
      _sidebarBrands.clear();
      _sidebarBrands.add(_newBrandKey);
      // Check the matching checkbox
      const cb = document.querySelector(`#sidebarBrandList input[value="${_newBrandKey}"]`);
      if (cb) cb.checked = true;
      updateSidebarTags(); runCombinedFilter();
    };
    if (_productsLoaded) applyBrand();
    else setTimeout(applyBrand, 1200);
  } else {
    goShop('all');
  }
}

// ══════════════════════════════════════════
// EDITS — dynamic from Supabase
// ══════════════════════════════════════════
let _edits = [];         // cache of active edits ordered by sort_order
let _editLoaded = {};    // { [editKey]: true } — prevents double-loading

async function loadEdits() {
  const { data, error } = await sb
    .from('edits')
    .select('*')
    .eq('active', true)
    .order('sort_order');
  if (error || !data) return;
  _edits = data;
  buildHomeSlider();
  buildMegaMenuEdits();
  buildEditPages();
  buildSidebarEdits();
}

function buildSidebarEdits() {
  const section = document.getElementById('sidebarEditsSection');
  const links   = document.getElementById('sidebarEditLinks');
  if (!section || !links) return;
  if (!_edits.length) { section.style.display = 'none'; return; }
  links.innerHTML = _edits.map(edit =>
    `<span class="sidebar-link" onclick="showEditPage('${edit.key}')">${edit.name}</span>`
  ).join('');
  section.style.display = '';
}

// ── Home slider ───────────────────────────
function buildHomeSlider() {
  const slider   = document.getElementById('heroSlider');
  const dotsWrap = document.getElementById('sliderDots');
  if (!slider || !_edits.length) return;

  // Build and inject slides before the dots container
  const slidesHtml = _edits.map((edit, i) => {
    const mediaHtml = edit.hero_video_url
      ? `<div class="slide-video-wrap">
           <video autoplay muted loop playsinline>
             <source src="${edit.hero_video_url}" type="video/mp4">
           </video>
         </div>`
      : `<div class="slide-video-wrap" style="background:#1a1210;">
           <img src="${edit.hero_image_url || ''}" style="width:100%;height:100%;object-fit:cover;" alt="${edit.name}">
         </div>`;
    return `
      <div class="slide slide-edit${i === 0 ? ' active' : ''}" onclick="showEditPage('${edit.key}')">
        ${mediaHtml}
        <div class="slide-video-overlay">
          <span class="slide-eyebrow">The Edit</span>
          <h2 class="slide-headline">${edit.name}</h2>
        </div>
      </div>`;
  }).join('');

  dotsWrap.insertAdjacentHTML('beforebegin', slidesHtml);

  // Inject nav arrows before the dots
  dotsWrap.insertAdjacentHTML('beforebegin', `
    <button class="slider-arrow slider-prev" onclick="slideBy(-1);event.stopPropagation()">
      <svg viewBox="0 0 24 24"><polyline points="15,18 9,12 15,6"/></svg>
    </button>
    <button class="slider-arrow slider-next" onclick="slideBy(1);event.stopPropagation()">
      <svg viewBox="0 0 24 24"><polyline points="9,18 15,12 9,6"/></svg>
    </button>`);

  // Build dots
  dotsWrap.innerHTML = _edits.map((_, i) =>
    `<button class="slider-dot${i === 0 ? ' active' : ''}" onclick="goToSlide(${i})"></button>`
  ).join('');

  initSlider();
}

// ── Mega menu edits column ────────────────
function buildMegaMenuEdits() {
  const col = document.getElementById('megaEditsList');
  if (!col) return;
  col.innerHTML = _edits.map(edit => `
    <div class="edit-item" onclick="closeMega();showEditPage('${edit.key}')">
      <p class="edit-item-title">${edit.name}</p>
      <p class="edit-item-sub">${edit.description || ''}</p>
    </div>`).join('');
}

// ── Edit pages — create them dynamically ──
function buildEditPages() {
  document.querySelectorAll('.page[data-dynamic-edit]').forEach(p => p.remove());

  _edits.forEach(edit => {
    const page = document.createElement('div');
    page.className = 'page';
    page.id = 'page-edit-' + edit.key;
    page.dataset.dynamicEdit = '1';

    const k = edit.key;
    const mediaHtml = edit.hero_video_url
      ? `<video autoplay muted loop playsinline style="width:100%;height:100%;object-fit:cover;"><source src="${edit.hero_video_url}" type="video/mp4"></video>`
      : `<img src="${edit.hero_image_url || ''}" style="width:100%;height:100%;object-fit:cover;" alt="${edit.name}">`;

    const occasions = ['Weekend Wear','Formal','Beach Ready','Office Attire','Night Out','Off-Duty'];
    const occHtml = occasions.map(o =>
      `<label class="sidebar-check"><input type="checkbox" class="edit-occ-${k}" value="${o}" onchange="runEditFilter('${k}')"><span class="s-check-box"></span><span>${o}</span></label>`
    ).join('');

    // Build list of other edits for sidebar nav
    const otherEditsHtml = _edits.map(e =>
      `<span class="sidebar-link${e.key === k ? ' active' : ''}" onclick="showEditPage('${e.key}')">${e.name}</span>`
    ).join('');

    page.innerHTML = `
      <div class="edit-layout">

        <aside class="edit-sidebar" id="editSidebar-${k}">
          <div class="sidebar-drawer-header">
            <span class="sidebar-drawer-title">Filters</span>
            <button class="sidebar-drawer-close" onclick="closeMobileEditSidebar('${k}')">
              Close <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <!-- Other edits nav in sidebar -->
          <div class="sidebar-section" style="padding:16px 28px 8px;">
            <p class="sidebar-title">Edits</p>
            ${otherEditsHtml}
          </div>
          <div class="sidebar-divider"></div>

          <div>
            <div class="filter-section-header" onclick="toggleSidebarSection(this)">
              <span class="filter-section-label">Occasion</span>
              <svg class="filter-section-arrow" viewBox="0 0 24 24"><polyline points="6,9 12,15 18,9"/></svg>
            </div>
            <div class="filter-section-body" style="max-height:300px">
              <div class="sidebar-check-list">${occHtml}</div>
            </div>
          </div>

          <div>
            <div class="filter-section-header" onclick="toggleSidebarSection(this)">
              <span class="filter-section-label">Colour</span>
              <svg class="filter-section-arrow" viewBox="0 0 24 24"><polyline points="6,9 12,15 18,9"/></svg>
            </div>
            <div class="filter-section-body" style="max-height:220px">
              <div class="sidebar-colour-grid" id="editSwatches-${k}"></div>
            </div>
          </div>

          <div>
            <div class="filter-section-header" onclick="toggleSidebarSection(this)">
              <span class="filter-section-label">Price</span>
              <svg class="filter-section-arrow" viewBox="0 0 24 24"><polyline points="6,9 12,15 18,9"/></svg>
            </div>
            <div class="filter-section-body" style="max-height:100px">
              <div class="price-range-labels">
                <span id="editPriceMinLbl-${k}">$0</span>
                <span id="editPriceMaxLbl-${k}">$1000+</span>
              </div>
              <div class="price-track">
                <div class="price-fill" id="editPriceFill-${k}"></div>
                <input type="range" class="price-slider price-slider-min" id="editSliderMin-${k}" min="0" max="1000" value="0" oninput="onEditPriceChange('${k}')">
                <input type="range" class="price-slider price-slider-max" id="editSliderMax-${k}" min="0" max="1000" value="1000" oninput="onEditPriceChange('${k}')">
              </div>
            </div>
          </div>

          <div>
            <div class="filter-section-header" onclick="toggleSidebarSection(this)">
              <span class="filter-section-label">Brand</span>
              <svg class="filter-section-arrow" viewBox="0 0 24 24"><polyline points="6,9 12,15 18,9"/></svg>
            </div>
            <div class="filter-section-body" style="max-height:300px">
              <div class="sidebar-check-list" id="editBrandList-${k}"></div>
            </div>
          </div>
        </aside>

        <div class="edit-main">
          <div class="edit-cat-bar mobile-only">
            <button class="cat-bar-filter-btn" onclick="toggleMobileEditSidebar('${k}')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="12" y1="18" x2="20" y2="18"/></svg>
              Filter
            </button>
          </div>
          <!-- Slim banner — sits only above products, sidebar runs alongside it -->
          <div class="edit-hero-slim">
            <div class="edit-hero-slim-media">${mediaHtml}</div>
            <div class="edit-hero-slim-content">
              <div>
                <p class="edit-hero-slim-eyebrow">The Edit</p>
                <h1 class="edit-hero-slim-title">${edit.name}</h1>
              </div>
              ${edit.description ? `<div class="edit-hero-slim-sep"></div><p class="edit-hero-slim-desc">${edit.description}</p>` : ''}
            </div>
          </div>
          <div class="edit-body">
            <div class="edit-body-header">
              <div>
                <h2 class="edit-body-title">${edit.name}</h2>
                <span class="edit-body-count" id="editCount-${k}"></span>
              </div>
              <div class="sort-bar" style="margin-bottom:0;">
                <span class="sort-label">Sort by</span>
                <div class="sort-dropdown-wrap">
                  <button class="sort-trigger" id="editSortTrigger-${k}" onclick="toggleEditSortMenu('${k}')">
                    <span id="editSortLabel-${k}">Recommended</span>
                    <svg viewBox="0 0 24 24"><polyline points="6,9 12,15 18,9"/></svg>
                  </button>
                  <div class="sort-menu" id="editSortMenu-${k}">
                    <button class="sort-option active" onclick="sortEditProducts('${k}','recommended',this)">Recommended</button>
                    <button class="sort-option" onclick="sortEditProducts('${k}','low',this)">Price: Low to High</button>
                    <button class="sort-option" onclick="sortEditProducts('${k}','high',this)">Price: High to Low</button>
                  </div>
                </div>
              </div>
            </div>
            <div class="edit-grid" id="editGrid-${k}">
              <p class="edit-loading">Loading…</p>
            </div>
          </div>
        </div>

      </div>
      <footer>
        <div class="footer-grid">
          <div class="footer-brand">
            <span class="footer-brand-logo">SUSTA</span>
            <p>A curated edit of women's fashion from brands that care about quality, craft, and longevity.</p>
          </div>
          <div class="footer-col">
            <h4>Shop</h4>
            <ul>
              <li onclick="goShop('all')">Shop All</li>
              <li onclick="goShop('dresses')">Dresses</li>
              <li onclick="goShop('tops')">Tops</li>
              <li onclick="goShop('denim')">Denim</li>
              <li onclick="goShop('shoes')">Shoes</li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>About</h4>
            <ul>
              <li onclick="showPage('about')">Our Story</li>
              <li onclick="showPage('about')">How We Curate</li>
              <li>Journal</li>
              <li>Contact</li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Follow</h4>
            <ul>
              <li><a href="https://www.instagram.com/shopsusta/" target="_blank" style="color:inherit;text-decoration:none;">Instagram</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <p>© 2025 SUSTA. All rights reserved.</p>
          <p>Affiliate links — we may earn a commission at no cost to you.</p>
        </div>
      </footer>`;

    document.body.appendChild(page);
  });
}

// ── Show an edit page and load its products ──
function showEditPage(key) {
  if (!document.getElementById('page-edit-' + key)) {
    const poll = setInterval(() => {
      if (document.getElementById('page-edit-' + key)) {
        clearInterval(poll);
        showPage('edit-' + key);
      }
    }, 100);
    return;
  }
  showPage('edit-' + key);
}

async function loadEditProducts(key) {
  if (_editLoaded[key]) return;
  const edit = _edits.find(e => e.key === key);
  if (!edit) return;

  const grid    = document.getElementById('editGrid-' + key);
  const countEl = document.getElementById('editCount-' + key);
  if (!grid) return;

  grid.innerHTML = '<p class="edit-loading">Loading…</p>';

  // Step 1: fetch ordered product IDs for this edit
  const { data: epRows, error: epErr } = await sb
    .from('edit_products')
    .select('product_id, sort_order')
    .eq('edit_id', edit.id)
    .order('sort_order');

  if (epErr || !epRows || !epRows.length) {
    grid.innerHTML = '<p class="edit-loading">No products in this edit yet.</p>';
    return;
  }

  // Step 2: fetch full product rows by ID
  const productIds = epRows.map(r => r.product_id);
  const { data: products, error: pErr } = await sb
    .from('products')
    .select('*')
    .or('visible.is.null,visible.eq.true')
    .in('id', productIds);

  if (pErr || !products || !products.length) {
    grid.innerHTML = '<p class="edit-loading">Could not load products.</p>';
    return;
  }

  // Preserve the sort_order from edit_products
  const orderMap = Object.fromEntries(epRows.map(r => [r.product_id, r.sort_order]));
  products.sort((a, b) => (orderMap[a.id] ?? 999) - (orderMap[b.id] ?? 999));

  grid.innerHTML = products.map(p => renderEditCard(p)).join('');
  countEl.textContent = products.length + ' piece' + (products.length !== 1 ? 's' : '');
  _editLoaded[key] = true;
  buildEditSidebarControls(key, products);
  renderLikeStates();
}

function renderEditCard(p) {
  const brandLabel = BRAND_LABELS[p.brand] || p.brand;
  const displayPrice = formatPrice(p.price, p.brand);
  const imgHtml = p.image_url
    ? `<img src="${escAttr(p.image_url)}" alt="${escAttr(p.name)}" loading="lazy" onerror="this.parentElement.classList.add('img-missing')">`
    : '';
  return `
    <div class="product-card" data-id="${escAttr(p.id)}" data-cat="${escAttr(p.category)}" data-brand="${escAttr(p.brand)}"
         data-name="${escAttr(p.name)}" data-brandlabel="${escAttr(brandLabel)}"
         data-price="${escAttr(displayPrice)}" data-material="${escAttr(p.material || '')}"
         data-img="${escAttr(p.image_url || '')}" data-url="${escAttr(p.shop_url)}">
      <div class="product-img">
        ${imgHtml}
        <div class="product-img-overlay"></div>
        <a href="${p.shop_url}" target="_blank" class="quick-shop">Shop on ${brandLabel} →</a>
        <button class="like-btn" onclick="toggleLike(event,this)" aria-label="Like">
          <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
      </div>
      <div class="product-info">
        <p class="product-brand-lbl" onclick="event.stopPropagation();showBrandDetail('${p.brand}')" style="cursor:pointer">${brandLabel}</p>
        <p class="product-name">${p.name}</p>
        <p class="product-material">${p.material || ''}</p>
        <p class="product-price">${displayPrice}</p>
      </div>
    </div>`;
}

// ══════════════════════════════════════════
// SLIDER
// ══════════════════════════════════════════
let currentSlide = 0;
let _slides = [];
let _dots = [];
let slideTimer = null;

function initSlider() {
  clearInterval(slideTimer);
  currentSlide = 0;
  _slides = Array.from(document.querySelectorAll('#heroSlider .slide'));
  _dots   = Array.from(document.querySelectorAll('#sliderDots .slider-dot'));
  if (!_slides.length) return;
  slideTimer = setInterval(() => slideBy(1), 5000);
}

function goToSlide(n) {
  if (!_slides.length) return;
  _slides[currentSlide].classList.remove('active');
  if (_dots[currentSlide]) _dots[currentSlide].classList.remove('active');
  currentSlide = (n + _slides.length) % _slides.length;
  _slides[currentSlide].classList.add('active');
  if (_dots[currentSlide]) _dots[currentSlide].classList.add('active');
}
function slideBy(dir) {
  clearInterval(slideTimer);
  goToSlide(currentSlide + dir);
  slideTimer = setInterval(() => slideBy(1), 5000);
}

// ══════════════════════════════════════════
// SUPABASE — replace YOUR_URL and YOUR_ANON_KEY
// ══════════════════════════════════════════
const SUPABASE_URL  = 'https://yhpqdtrfkriwaiqfyhzk.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlocHFkdHJma3Jpd2FpcWZ5aHprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0ODg5ODUsImV4cCI6MjA5NTA2NDk4NX0.nHu5BDCPXfhQx6hRrtCW9cb2j36H1BkghbOZ6igou9M';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

let currentUser = null;  // { id, email, name }
let _likes = [];         // local cache of liked product IDs (as strings)

// ── AUTH ──
async function doSignIn() {
  const email = document.getElementById('psiEmail').value.trim().toLowerCase();
  const pass  = document.getElementById('psiPass').value;
  const errEl = document.getElementById('psiError');
  const btn   = document.getElementById('psiSubmitBtn');
  errEl.classList.remove('visible');
  btn.textContent = 'Signing in…'; btn.disabled = true;
  try {
    const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;
    await _onSignIn(data.user);
    closeAllPanels(); openProfilePanel();
  } catch(err) {
    errEl.textContent = err.message || 'Sign in failed. Please try again.';
    errEl.classList.add('visible');
  }
  btn.textContent = 'Sign In'; btn.disabled = false;
}

async function doCreate() {
  const name  = document.getElementById('pcaName').value.trim();
  const email = document.getElementById('pcaEmail').value.trim().toLowerCase();
  const pass  = document.getElementById('pcaPass').value;
  const errEl = document.getElementById('pcaError');
  const okEl  = document.getElementById('pcaSuccess');
  const btn   = document.getElementById('pcaSubmitBtn');
  errEl.classList.remove('visible'); okEl.classList.remove('visible');
  if (!name || !email || !pass) { errEl.textContent = 'Please fill in all fields.'; errEl.classList.add('visible'); return; }
  if (pass.length < 6) { errEl.textContent = 'Password must be at least 6 characters.'; errEl.classList.add('visible'); return; }
  btn.textContent = 'Creating…'; btn.disabled = true;
  try {
    const { data, error } = await sb.auth.signUp({ email, password: pass, options: { data: { name } } });
    if (error) throw error;
    console.log('signUp response:', JSON.stringify({ user: data.user?.id, session: !!data.session }));
    if (data.session) {
      // Email confirmation is OFF — logged in immediately
      okEl.textContent = 'Account created! Welcome to SUSTA.'; okEl.classList.add('visible');
      setTimeout(async () => { await _onSignIn(data.user); closeAllPanels(); openProfilePanel(); }, 700);
    } else if (data.user) {
      // Email confirmation is ON — user created, needs to confirm
      okEl.textContent = '✓ Almost there! Check your email and click the confirmation link, then sign in.';
      okEl.classList.add('visible');
      setTimeout(() => switchPTab('si'), 3000);
    } else {
      errEl.textContent = 'Something went wrong. Please try again.'; errEl.classList.add('visible');
    }
  } catch(err) {
    errEl.textContent = err.message || 'Could not create account. Please try again.';
    errEl.classList.add('visible');
  }
  btn.textContent = 'Create Account'; btn.disabled = false;
}

async function _onSignIn(user) {
  const name = user.user_metadata?.name || user.email.split('@')[0];
  currentUser = { id: user.id, email: user.email, name };
  await _loadLikes();
  renderLikeStates(); updateLikesBadge();
}

async function doSignOut() {
  if (!confirm('Sign out of SUSTA?')) return;
  await sb.auth.signOut();
  currentUser = null; _likes = [];
  renderLikeStates(); updateLikesBadge(); openProfilePanel();
}

// ── LIKES (Supabase) ──
async function _loadLikes() {
  if (!currentUser) { _likes = []; return; }
  const { data } = await sb.from('likes').select('product_id').eq('user_id', currentUser.id);
  _likes = data ? data.map(r => String(r.product_id)) : [];
}

function getLikes() { return _likes; }

// ══════════════════════════════════════════
// BRAND REGISTRY
// ══════════════════════════════════════════
// GOY score values: 'Great' | 'Good' | "It's a Start" | null (unknown/not confirmed)
// ⚠️ Brands marked ⚠️ UNCONFIRMED need GOY ratings verified at directory.goodonyou.eco
// Logo URLs: direct CDN links where found — ⚠️ PLACEHOLDER where not confirmed

// BRAND_REGISTRY — loaded from Supabase brands table
let BRAND_REGISTRY = {};

async function loadBrandRegistry() {
  const { data, error } = await sb.from('brands').select('*');
  if (error || !data) return;
  data.forEach(b => {
    BRAND_REGISTRY[b.key] = {
      label:      b.label,
      origin:     b.origin,
      website:    b.website,
      logo:       b.logo,
      about:      b.about,
      goy: {
        overall: b.goy_overall,
        planet:  b.goy_planet,
        people:  b.goy_people,
        animals: b.goy_animals,
        url:     b.goy_url,
      },
      goyFlag: null,
    };
  });
}

const GOY_SCORE_MAP = {
  'Great': { cls: 'goy-great', barCls: 'fill-great', pct: '100%' },
  'Good':  { cls: 'goy-good',  barCls: 'fill-good',  pct: '75%'  },
  "It's a Start": { cls: 'goy-start', barCls: 'fill-start', pct: '45%' },
};

// ══════════════════════════════════════════
// BRANDS DROPDOWN
// ══════════════════════════════════════════
let brandsDropOpen = false;
let brandsDropTimer = null;

function openBrandsDropdown() {
  clearTimeout(brandsDropTimer);
  closeMega();
  if (!_productsLoaded) {
    initShopCount().then(() => {
      populateBrandsDropdown();
      document.getElementById('brandsDropdown').classList.add('open');
      brandsDropOpen = true;
    });
    return;
  }
  populateBrandsDropdown();
  document.getElementById('brandsDropdown').classList.add('open');
  brandsDropOpen = true;
}

function closeBrandsDropdown() {
  document.getElementById('brandsDropdown').classList.remove('open');
  brandsDropOpen = false;
}

// ── Brands dropdown: trigger = navBrands, panel = brandsDropdown ──
(function() {
  const trigger = document.getElementById('navBrands');
  const panel   = document.getElementById('brandsDropdown');
  const delay   = 250;

  function enter() { clearTimeout(brandsDropTimer); openBrandsDropdown(); }
  function leave() { brandsDropTimer = setTimeout(closeBrandsDropdown, delay); }

  trigger.addEventListener('mouseenter', enter);
  trigger.addEventListener('mouseleave', leave);
  panel.addEventListener('mouseenter',   () => clearTimeout(brandsDropTimer));
  panel.addEventListener('mouseleave',   leave);
})();

function populateBrandsDropdown() {
  const cards = document.querySelectorAll('.product-card');
  const counts = {};
  cards.forEach(c => {
    const b = c.dataset.brand;
    counts[b] = (counts[b] || 0) + 1;
  });

  // Top 5 by product count
  const top5 = Object.entries(counts).sort((a,b) => b[1]-a[1]).slice(0,5);
  const topEl = document.getElementById('bdTopBrands');
  topEl.innerHTML = top5.map(([key, count]) => {
    const info = BRAND_REGISTRY[key];
    const label = info ? info.label : (BRAND_LABELS[key] || key);
    return `<div class="bd-brand-row" onclick="closeBrandsDropdown();showBrandDetail('${key}')">
      <span class="bd-brand-name">${label}</span>
    </div>`;
  }).join('');

  // 3 newest brands (last 3 unique brands added to DB by id order)
  const brandOrder = [];
  const seen = new Set();
  Array.from(cards).reverse().forEach(c => {
    const b = c.dataset.brand;
    if (!seen.has(b)) { seen.add(b); brandOrder.push(b); }
  });
  const newest3 = brandOrder.slice(0,3);
  const newEl = document.getElementById('bdNewBrands');
  newEl.innerHTML = newest3.map(key => {
    const info = BRAND_REGISTRY[key];
    const label = info ? info.label : (BRAND_LABELS[key] || key);
    return `<div class="bd-brand-row" onclick="closeBrandsDropdown();showBrandDetail('${key}')">
      <span class="bd-brand-name">${label}</span>
    </div>`;
  }).join('');
}

// ══════════════════════════════════════════
// BRANDS PAGE — BANNER LIST
// ══════════════════════════════════════════
function renderBrandBanners() {
  const container = document.getElementById('brandBannerList');
  if (!container) return;

  // Count products per brand
  const cards = document.querySelectorAll('.product-card');
  const counts = {};
  cards.forEach(c => { const b = c.dataset.brand; counts[b] = (counts[b] || 0) + 1; });

  // All known brands alphabetically
  const allKeys = Object.keys(BRAND_REGISTRY).sort((a,b) =>
    BRAND_REGISTRY[a].label.localeCompare(BRAND_REGISTRY[b].label)
  );

  container.innerHTML = allKeys.map(key => {
    const info = BRAND_REGISTRY[key];
    const goy = info.goy;
    const overall = goy.overall;

    // Stars: Great = 5 filled, Good = 4 filled, else blank
    let starsHtml = '';
    if (overall === 'Great' || overall === 'Good') {
      const filled = overall === 'Great' ? 5 : 4;
      const starSvg = (cls) => `<svg viewBox="0 0 24 24" class="${cls}"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>`;
      starsHtml = `<div class="brand-banner-stars">${Array.from({length:5},(_,i) => starSvg(i < filled ? 'star-filled' : 'star-outline')).join('')}</div>`;
    }

    return `<div class="brand-banner" onclick="showBrandDetail('${key}')">
      <div class="brand-banner-info">
        <p class="brand-banner-name">${info.label}</p>
        ${info.origin ? `<p class="brand-banner-origin">${info.origin}</p>` : ''}
      </div>
      <div class="brand-banner-goy">
        ${starsHtml}
        ${counts[key] ? `<span style="font-size:10px;color:var(--taupe)">${counts[key]} piece${counts[key]!==1?'s':''}</span>` : ''}
      </div>
      <span class="brand-banner-arrow">→</span>
    </div>`;
  }).join('');
}

// ══════════════════════════════════════════
// BRAND DETAIL VIEW
// ══════════════════════════════════════════
function showBrandList() {
  document.getElementById('brandsListView').style.display = '';
  document.getElementById('brandDetailView').classList.remove('active');
  window.scrollTo(0,0);
}

function showBrandDetail(brandKey) {
  const info = BRAND_REGISTRY[brandKey];
  if (!info) { showPage('brands'); return; }

  // Switch to brands page if not already there
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-brands').classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('navBrands').classList.add('active');

  // Hide list, show detail
  document.getElementById('brandsListView').style.display = 'none';
  document.getElementById('brandDetailView').classList.add('active');

  // Logo
  const logoEl = document.getElementById('bdLogo');
  if (info.logo) {
    logoEl.innerHTML = `<img class="brand-detail-logo" src="${info.logo}" alt="${info.label}" onerror="this.outerHTML='<p class=\'brand-detail-logo-text\'>${info.label}</p>'">`;
  } else {
    logoEl.innerHTML = `<p class="brand-detail-logo-text">${info.label}</p>`;
  }

  // Text fields
  document.getElementById('bdName').textContent = info.label;
  document.getElementById('bdOrigin').textContent = info.origin || '';
  document.getElementById('bdAbout').textContent = info.about;
  const siteLink = document.getElementById('bdSiteLink');
  siteLink.href = info.website;
  siteLink.textContent = `Visit ${info.label} →`;

  // GOY rating
  const goy = info.goy;
  const overall = goy.overall;
  const scoreInfo = overall ? GOY_SCORE_MAP[overall] : null;
  document.getElementById('bdGoyOverall').textContent = overall || 'Not yet rated';
  document.getElementById('bdGoyOverallLabel').textContent = overall
    ? 'Overall Good On You rating'
    : 'We\'re working on confirming this rating';

  ['Planet','People','Animals'].forEach(pillar => {
    const key = pillar.toLowerCase();
    const score = goy[key];
    const si = score ? GOY_SCORE_MAP[score] : null;
    document.getElementById(`bd${pillar}Bar`).className = 'goy-pillar-fill ' + (si ? si.barCls : 'fill-unknown');
    document.getElementById(`bd${pillar}Bar`).style.width = si ? si.pct : '0%';
    document.getElementById(`bd${pillar}Score`).textContent = score || '—';
  });

  const goyLink = document.getElementById('bdGoyLink');
  goyLink.href = goy.url;
  goyLink.textContent = overall
    ? `View full ${info.label} rating on Good On You →`
    : 'Search Good On You directory →';

  const flagEl = document.getElementById('bdGoyFlag');
  flagEl.textContent = info.goyFlag || '';
  flagEl.style.display = info.goyFlag ? 'block' : 'none';

  // Products
  const grid = document.getElementById('bdProductGrid');
  document.getElementById('bdProductsHeading').textContent = `Pieces from ${info.label}`;
  document.getElementById('bdProductsSub').textContent = '';
  grid.innerHTML = '<p style="padding:32px 0;color:var(--taupe);font-size:12px;letter-spacing:0.08em">Loading…</p>';
  document.getElementById('bdNoResults').style.display = 'none';

  // Reset sidebar cat filter
  _bdCurrentCat = 'all';
  _bdCurrentSort = 'recommended';
  document.querySelectorAll('#brandShopSidebar .sidebar-link').forEach(l => l.classList.remove('active'));
  const allLink = document.getElementById('bsb-all');
  if (allLink) allLink.classList.add('active');
  const bdSortLabel = document.getElementById('bdSortTriggerLabel');
  if (bdSortLabel) bdSortLabel.textContent = 'Recommended';
  document.querySelectorAll('#bdSortMenu .sort-option').forEach((b,i) => b.classList.toggle('active', i===0));

  // Query Supabase directly — avoids dataset encoding issues entirely
  sb.from('products').select('*').or('visible.is.null,visible.eq.true').eq('brand', brandKey).order('click_count', { ascending: false })
    .then(({ data: products, error }) => {
      if (error || !products) {
        grid.innerHTML = '';
        document.getElementById('bdNoResults').style.display = 'block';
        return;
      }
      if (products.length === 0) {
        grid.innerHTML = '';
        document.getElementById('bdNoResults').style.display = 'block';
        document.getElementById('bdProductsSub').textContent = '';
        return;
      }
      document.getElementById('bdProductsSub').textContent =
        `${products.length} piece${products.length !== 1 ? 's' : ''} from ${info.label} on SUSTA`;
      grid.innerHTML = products.map(renderCard).join('');
      document.getElementById('bdNoResults').style.display = 'none';
      renderLikeStates();

      // Show/hide sidebar category links based on which cats this brand has
      const cats = new Set(products.map(p => p.category));
      const catMap = { tops:'bsb-tops', dresses:'bsb-dresses', bottoms:'bsb-bottoms', denim:'bsb-denim', skirts:'bsb-skirts', outerwear:'bsb-outerwear', swim:'bsb-swim', shoes:'bsb-shoes', accessories:'bsb-accessories' };
      Object.entries(catMap).forEach(([cat, id]) => {
        const el = document.getElementById(id);
        if (el) el.style.display = cats.has(cat) ? '' : 'none';
      });
    });

  window.scrollTo(0,0);
}


// ══════════════════════════════════════════
// SEARCH
// ══════════════════════════════════════════
let _allProducts = []; // cache of all loaded product data

function openSearch() {
  document.getElementById('searchOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('searchInput').focus(), 50);
}

function closeSearch() {
  document.getElementById('searchOverlay').classList.remove('open');
  document.body.style.overflow = '';
  document.getElementById('searchInput').value = '';
  document.getElementById('searchResults').innerHTML = '<p class="search-hint">Start typing to search all products</p>';
}

function handleSearchOverlayClick(e) {
  if (e.target === document.getElementById('searchOverlay')) closeSearch();
}

function handleSearchKey(e) {
  if (e.key === 'Escape') closeSearch();
}

function handleSearch(query) {
  const resultsEl = document.getElementById('searchResults');
  const q = query.trim().toLowerCase();
  if (!q) {
    resultsEl.innerHTML = '<p class="search-hint">Start typing to search all products</p>';
    return;
  }
  const matches = _allProducts.filter(p =>
    p.name.toLowerCase().includes(q) ||
    (BRAND_LABELS[p.brand] || p.brand).toLowerCase().includes(q) ||
    (p.material || '').toLowerCase().includes(q) ||
    (p.category || '').toLowerCase().includes(q)
  ).slice(0, 12);

  if (!matches.length) {
    resultsEl.innerHTML = '<p class="search-no-results">No products found for "' + escAttr(query) + '"</p>';
    return;
  }

  resultsEl.innerHTML = matches.map(p => {
    const brandLabel = BRAND_LABELS[p.brand] || p.brand;
    const imgHtml = p.image_url
      ? `<img class="search-result-img" src="${escAttr(p.image_url)}" alt="${escAttr(p.name)}" onerror="this.style.display='none'">`
      : `<div class="search-result-img"></div>`;
    return `<div class="search-result-item" onclick="searchGoToProduct('${escAttr(p.brand)}','${escAttr(p.shop_url)}')">
      ${imgHtml}
      <div class="search-result-info">
        <p class="search-result-brand">${brandLabel}</p>
        <p class="search-result-name">${p.name}</p>
        <p class="search-result-price">${formatPrice(p.price, p.brand)}</p>
      </div>
    </div>`;
  }).join('');
}

function searchGoToProduct(brand, url) {
  closeSearch();
  // Navigate to shop filtered by brand, then open product link
  showBrandDetail(brand);
  window.open(url, '_blank');
}

// ══════════════════════════════════════════
// SORT
// ══════════════════════════════════════════
let _currentSort = 'recommended';

function toggleSortMenu() {
  const menu = document.getElementById('sortMenu');
  const trigger = document.getElementById('sortTrigger');
  if (!menu) return;
  const isOpen = menu.classList.contains('open');
  menu.classList.toggle('open', !isOpen);
  trigger.classList.toggle('open', !isOpen);
}

function closeSortMenu() {
  const menu = document.getElementById('sortMenu');
  const trigger = document.getElementById('sortTrigger');
  if (menu) menu.classList.remove('open');
  if (trigger) trigger.classList.remove('open');
}

function sortProducts(mode, btn) {
  _currentSort = mode;
  document.querySelectorAll('.sort-option').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const labels = { recommended:'Recommended', newest:'Recently Added', low:'Price: Low to High', high:'Price: High to Low' };
  const labelEl = document.getElementById('sortTriggerLabel');
  if (labelEl) labelEl.textContent = labels[mode] || 'Recommended';
  closeSortMenu();

  const grid = document.getElementById('productGrid');
  const cards = Array.from(grid.querySelectorAll('.product-card'));
  const visible = cards.filter(c => c.style.display !== 'none');
  const hidden  = cards.filter(c => c.style.display === 'none');

  function cardPrice(card) {
    const num = parseFloat((card.dataset.price || '').replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
  }

  visible.sort((a, b) => {
    if (mode === 'low')    return cardPrice(a) - cardPrice(b);
    if (mode === 'high')   return cardPrice(b) - cardPrice(a);
    if (mode === 'newest') return parseInt(b.dataset.id||0) - parseInt(a.dataset.id||0);
    return parseInt(a.dataset.loadorder||0) - parseInt(b.dataset.loadorder||0);
  });

  visible.forEach(c => grid.appendChild(c));
  hidden.forEach(c => grid.appendChild(c));
}

// ── BRAND DETAIL — category filter & sort ──────────────────────
let _bdCurrentCat = 'all';
let _bdCurrentSort = 'recommended';

function brandSetCat(cat, el) {
  _bdCurrentCat = cat;
  document.querySelectorAll('#brandShopSidebar .sidebar-link').forEach(l => l.classList.remove('active'));
  if (el) el.classList.add('active');

  const grid = document.getElementById('bdProductGrid');
  const noResults = document.getElementById('bdNoResults');
  const cards = Array.from(grid.querySelectorAll('.product-card'));
  let visible = 0;
  cards.forEach(card => {
    const show = cat === 'all' || card.dataset.cat === cat;
    card.style.display = show ? '' : 'none';
    if (show) visible++;
  });
  noResults.style.display = visible === 0 ? 'block' : 'none';
  const subEl = document.getElementById('bdProductsSub');
  if (subEl) subEl.textContent = visible + ' piece' + (visible !== 1 ? 's' : '');
}

function toggleBdSortMenu() {
  const menu = document.getElementById('bdSortMenu');
  const trigger = document.getElementById('bdSortTrigger');
  if (!menu) return;
  const isOpen = menu.classList.contains('open');
  menu.classList.toggle('open', !isOpen);
  trigger.classList.toggle('open', !isOpen);
  // close main shop sort if open
  closeSortMenu();
}

function sortBrandProducts(mode, btn) {
  _bdCurrentSort = mode;
  const menu = document.getElementById('bdSortMenu');
  const trigger = document.getElementById('bdSortTrigger');
  if (menu) menu.classList.remove('open');
  if (trigger) trigger.classList.remove('open');
  document.querySelectorAll('#bdSortMenu .sort-option').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const labels = { recommended:'Recommended', low:'Price: Low to High', high:'Price: High to Low' };
  const labelEl = document.getElementById('bdSortTriggerLabel');
  if (labelEl) labelEl.textContent = labels[mode] || 'Recommended';

  const grid = document.getElementById('bdProductGrid');
  const cards = Array.from(grid.querySelectorAll('.product-card'));
  const visible = cards.filter(c => c.style.display !== 'none');
  const hidden  = cards.filter(c => c.style.display === 'none');

  function cardPrice(card) {
    const num = parseFloat((card.dataset.price || '').replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
  }

  visible.sort((a, b) => {
    if (mode === 'low')  return cardPrice(a) - cardPrice(b);
    if (mode === 'high') return cardPrice(b) - cardPrice(a);
    return parseInt(a.dataset.id||0) - parseInt(b.dataset.id||0);
  });

  visible.forEach(c => grid.appendChild(c));
  hidden.forEach(c => grid.appendChild(c));
}

// ── EDIT — sort ────────────────────────────
function toggleEditSortMenu(key) {
  const menu = document.getElementById('editSortMenu-' + key);
  const trigger = document.getElementById('editSortTrigger-' + key);
  if (!menu) return;
  const isOpen = menu.classList.contains('open');
  // close all other sort menus
  document.querySelectorAll('.sort-menu').forEach(m => m.classList.remove('open'));
  document.querySelectorAll('.sort-trigger').forEach(t => t.classList.remove('open'));
  if (!isOpen) {
    menu.classList.add('open');
    trigger.classList.add('open');
  }
}

function sortEditProducts(key, mode, btn) {
  const menu = document.getElementById('editSortMenu-' + key);
  const trigger = document.getElementById('editSortTrigger-' + key);
  if (menu) menu.classList.remove('open');
  if (trigger) trigger.classList.remove('open');
  const menuEl = document.getElementById('editSortMenu-' + key);
  if (menuEl) menuEl.querySelectorAll('.sort-option').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  const labels = { recommended:'Recommended', low:'Price: Low to High', high:'Price: High to Low' };
  const labelEl = document.getElementById('editSortLabel-' + key);
  if (labelEl) labelEl.textContent = labels[mode] || 'Recommended';

  const grid = document.getElementById('editGrid-' + key);
  if (!grid) return;
  const cards = Array.from(grid.querySelectorAll('.product-card'));
  const visible = cards.filter(c => c.style.display !== 'none');
  const hidden  = cards.filter(c => c.style.display === 'none');

  function cardPrice(card) {
    const num = parseFloat((card.dataset.price || '').replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num;
  }

  visible.sort((a, b) => {
    if (mode === 'low')  return cardPrice(a) - cardPrice(b);
    if (mode === 'high') return cardPrice(b) - cardPrice(a);
    return parseInt(a.dataset.id||0) - parseInt(b.dataset.id||0);
  });

  visible.forEach(c => grid.appendChild(c));
  hidden.forEach(c => grid.appendChild(c));
}


// ══════════════════════════════════════════
// FILTER PANEL — legacy stubs

// ══════════════════════════════════════════
// FILTER PANEL — legacy (removed from UI, kept for COLOR_BUCKETS reference)
// ══════════════════════════════════════════
let _activeFilters = { brand: new Set(), material: new Set(), color: new Set() };

// COLOR_BUCKETS used by runCombinedFilter for keyword colour matching
const COLOR_BUCKETS = [
  { key: 'black',     label: 'Black',     words: ['black','noir','onyx','jet','ebony','carbon'] },
  { key: 'white',     label: 'White',     words: ['white','ivory','cream','ecru','off-white','offwhite','chalk','snow','vanilla'] },
  { key: 'grey',      label: 'Grey',      words: ['grey','gray','slate','charcoal','silver','ash','smoke','stone','mist'] },
  { key: 'tan',       label: 'Tan',       words: ['tan','sand','beige','camel','nude','natural','oat','biscuit','wheat','buff','linen','taupe','truffle','dune','fawn'] },
  { key: 'red',       label: 'Red',       words: ['red','crimson','scarlet','burgundy','wine','bordeaux','cherry','raspberry','rust','terracotta','auburn','sienna','brick','maroon'] },
  { key: 'pink',      label: 'Pink',      words: ['pink','blush','rose','coral','salmon','peach','mauve','dusty rose','ballet','candy','flamingo','magenta','fuchsia'] },
  { key: 'orange',    label: 'Orange',    words: ['orange','burnt','apricot','amber','ginger','pumpkin','paprika','copper','bronze','cognac'] },
  { key: 'yellow',    label: 'Yellow',    words: ['yellow','mustard','gold','lemon','butter','sunshine','honey','saffron','chartreuse'] },
  { key: 'green',     label: 'Green',     words: ['green','sage','olive','khaki','forest','emerald','mint','jade','hunter','army','lime','grass','moss','teal','pine','basil'] },
  { key: 'blue',      label: 'Blue',      words: ['blue','navy','cobalt','royal','cerulean','sky','denim','indigo','marine','ocean','midnight','azure','sapphire'] },
  { key: 'purple',    label: 'Purple',    words: ['purple','violet','lilac','lavender','plum','grape','orchid','amethyst','mulberry','wisteria','heather'] },
];

function clearAllFilters() { clearSidebarFilters(); }

// ══════════════════════════════════════════
// FLAG — unavailable product
// ══════════════════════════════════════════
let _flagged = new Set(); // local session cache

// Generate or retrieve a persistent anonymous session ID
function getSessionId() {
  let sid = sessionStorage.getItem('susta_sid');
  if (!sid) {
    sid = 'anon_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    sessionStorage.setItem('susta_sid', sid);
  }
  return sid;
}

async function toggleFlag(e, btn) {
  e.stopPropagation();
  const card = btn.closest('.product-card');
  const id = card.dataset.id;
  if (_flagged.has(id)) {
    // un-flag (just remove from local UI — row stays in DB for your records)
    _flagged.delete(id);
    btn.classList.remove('flagged');
    btn.title = 'Flag as unavailable';
  } else {
    // flag
    _flagged.add(id);
    btn.classList.add('flagged');
    btn.title = 'Flagged — thank you!';
    // Save to Supabase — insert a new row (anyone can flag, no login needed)
    try {
      await sb.from('product_flags').insert({
        product_id: parseInt(id),
        session_id: getSessionId(),
        flagged_at: new Date().toISOString()
      });
    } catch(err) {}
  }
}

// ── CONTACT FORM ──────────────────────────
async function submitContactForm() {
  const name    = document.getElementById('cfName').value.trim();
  const email   = document.getElementById('cfEmail').value.trim();
  const brand   = document.getElementById('cfBrand').value.trim();
  const message = document.getElementById('cfMessage').value.trim();
  const type    = document.querySelector('input[name="cfType"]:checked')?.value || 'suggestion';
  const errEl   = document.getElementById('cfError');
  const okEl    = document.getElementById('cfSuccess');

  errEl.style.display = 'none';
  okEl.style.display  = 'none';

  if (!name)    { errEl.textContent = 'Please enter your name.';  errEl.style.display = 'block'; return; }
  if (!email)   { errEl.textContent = 'Please enter your email.'; errEl.style.display = 'block'; return; }
  if (!message) { errEl.textContent = 'Please add a message.';    errEl.style.display = 'block'; return; }

  const btn = document.querySelector('#contactForm button');
  btn.textContent = 'Sending…'; btn.disabled = true;

  try {
    const { error } = await sb.from('contact_submissions').insert({
      name, email, type, brand: brand || null, message
    });
    if (error) throw error;
    okEl.style.display = 'block';
    document.getElementById('cfName').value    = '';
    document.getElementById('cfEmail').value   = '';
    document.getElementById('cfBrand').value   = '';
    document.getElementById('cfMessage').value = '';
  } catch(err) {
    errEl.textContent = 'Something went wrong — please try again shortly.';
    errEl.style.display = 'block';
  }

  btn.textContent = 'Send it our way →'; btn.disabled = false;
}

async function submitContactFormHome() {
  const name    = document.getElementById('cfNameH').value.trim();
  const email   = document.getElementById('cfEmailH').value.trim();
  const brand   = document.getElementById('cfBrandH').value.trim();
  const message = document.getElementById('cfMessageH').value.trim();
  const type    = document.querySelector('input[name="cfTypeH"]:checked')?.value || 'suggestion';
  const errEl   = document.getElementById('cfErrorH');
  const okEl    = document.getElementById('cfSuccessH');

  errEl.style.display = 'none';
  okEl.style.display  = 'none';

  if (!name)    { errEl.textContent = 'Please enter your name.';  errEl.style.display = 'block'; return; }
  if (!email)   { errEl.textContent = 'Please enter your email.'; errEl.style.display = 'block'; return; }
  if (!message) { errEl.textContent = 'Please add a message.';    errEl.style.display = 'block'; return; }

  const btn = document.querySelector('#contactFormHome button');
  btn.textContent = 'Sending…'; btn.disabled = true;

  try {
    const { error } = await sb.from('contact_submissions').insert({
      name, email, type, brand: brand || null, message
    });
    if (error) throw error;
    okEl.style.display = 'block';
    document.getElementById('cfNameH').value    = '';
    document.getElementById('cfEmailH').value   = '';
    document.getElementById('cfBrandH').value   = '';
    document.getElementById('cfMessageH').value = '';
  } catch(err) {
    errEl.textContent = 'Something went wrong — please try again shortly.';
    errEl.style.display = 'block';
  }

  btn.textContent = 'Send it our way →'; btn.disabled = false;
}

// ── CLICK TRACKING ────────────────────────
async function trackClick(productId) {
  // Fire-and-forget — doesn't block navigation
  sb.rpc('increment_click', { product_id: productId }).catch(() => {});
}

async function toggleLike(e, btn) {
  e.stopPropagation();
  if (!currentUser) { openProfilePanel(); return; }
  const id = btn.closest('.product-card').dataset.id;
  const numId = parseInt(id, 10);
  const idx = _likes.indexOf(id);
  if (idx === -1) {
    _likes.push(id);
    btn.classList.add('liked');
    await sb.from('likes').insert({ user_id: currentUser.id, product_id: numId });
  } else {
    _likes.splice(idx, 1);
    btn.classList.remove('liked');
    await sb.from('likes').delete().eq('user_id', currentUser.id).eq('product_id', numId);
  }
  updateLikesBadge();
  if (openPanel === 'likesPanel') renderLikesPanel();
  if (openPanel === 'profilePanel') renderProfilePanel();
}

async function removeLike(id) {
  _likes = _likes.filter(l => l !== id);
  const btn = document.querySelector(`.product-card[data-id="${id}"] .like-btn`);
  if (btn) btn.classList.remove('liked');
  await sb.from('likes').delete().eq('user_id', currentUser.id).eq('product_id', parseInt(id, 10));
  updateLikesBadge(); renderLikesPanel();
  if (openPanel === 'profilePanel') renderProfilePanel();
}

function renderLikeStates() {
  const likes = getLikes();
  document.querySelectorAll('.product-card').forEach(c => {
    c.querySelector('.like-btn').classList.toggle('liked', likes.includes(c.dataset.id));
  });
}

function updateLikesBadge() {
  const badge = document.getElementById('likesBadge');
  const n = getLikes().length;
  if (n > 0) { badge.textContent = n; badge.classList.add('visible'); }
  else badge.classList.remove('visible');
}

// ══════════════════════════════════════════
// PANELS
// ══════════════════════════════════════════
let openPanel = null;
function closeAllPanels() {
  ['profilePanel','likesPanel'].forEach(id => document.getElementById(id).classList.remove('open'));
  document.getElementById('panelBackdrop').classList.remove('open');
  openPanel = null;
}
function _openPanel(id) { closeAllPanels(); document.getElementById(id).classList.add('open'); document.getElementById('panelBackdrop').classList.add('open'); openPanel = id; }
function openProfilePanel() { renderProfilePanel(); _openPanel('profilePanel'); }
function openLikesPanel() { renderLikesPanel(); _openPanel('likesPanel'); }

function renderProfilePanel() {
  const body = document.getElementById('profilePanelBody');
  if (!currentUser) {
    body.innerHTML = `
      <div class="profile-signed-out">
        <h3>Your Susta profile</h3>
        <p>Sign in to save pieces you love and revisit them anytime.</p>
        <div class="profile-tabs" style="width:100%">
          <button class="profile-tab active" id="ptSI" onclick="switchPTab('si')">Sign In</button>
          <button class="profile-tab" id="ptCA" onclick="switchPTab('ca')">Create Account</button>
        </div>
        <div id="pfSI" class="profile-form" style="width:100%">
          <input type="email" id="psiEmail" placeholder="Email address"/>
          <input type="password" id="psiPass" placeholder="Password"/>
          <p class="profile-msg error" id="psiError"></p>
          <button class="forgot-link" onclick="showForgotPassword()">Forgot password?</button>
          <button class="profile-submit" id="psiSubmitBtn" onclick="doSignIn()">Sign In</button>
        </div>
        <div id="pfFP" class="profile-form" style="display:none;width:100%">
          <p style="font-size:12px;color:var(--taupe);line-height:1.8;margin-bottom:4px;">Enter your email and we'll send you a reset link.</p>
          <input type="email" id="fpEmail" placeholder="Email address"/>
          <p class="profile-msg error" id="fpError"></p>
          <p class="profile-msg success" id="fpSuccess"></p>
          <button class="profile-submit" id="fpSubmitBtn" onclick="doResetPassword()">Send Reset Link</button>
          <button class="profile-reset-back" onclick="showSignIn()">← Back to sign in</button>
        </div>
        <div id="pfCA" class="profile-form" style="display:none;width:100%">
          <input type="text" id="pcaName" placeholder="Your name"/>
          <input type="email" id="pcaEmail" placeholder="Email address"/>
          <input type="password" id="pcaPass" placeholder="Password (min 6 chars)"/>
          <p class="profile-msg error" id="pcaError"></p>
          <p class="profile-msg success" id="pcaSuccess">Account created! Welcome to SUSTA.</p>
          <button class="profile-submit" id="pcaSubmitBtn" onclick="doCreate()">Create Account</button>
        </div>
      </div>`;
  } else {
    const likes = getLikes();
    body.innerHTML = `
      <div class="profile-signed-in">
        <div class="profile-user-row">
          <div class="profile-user-info"><h3>${currentUser.name}</h3><p>${currentUser.email}</p></div>
        </div>
        <div class="profile-stat-row">
          <div class="profile-stat"><span class="profile-stat-num">${likes.length}</span><span class="profile-stat-label">Liked pieces</span></div>
          <div class="profile-stat"><span class="profile-stat-num">4</span><span class="profile-stat-label">Brands</span></div>
        </div>
        ${likes.length ? `<button class="profile-view-likes" onclick="closeAllPanels();openLikesPanel()">View liked pieces</button>` : `<p style="font-size:12px;color:var(--taupe);margin-bottom:20px;line-height:1.8">No liked pieces yet — tap ♡ on any item to save it.</p>`}
        <button class="profile-sign-out" onclick="doSignOut()">Sign Out</button>
      </div>`;
  }
}

function switchPTab(t) {
  document.getElementById('ptSI').classList.toggle('active', t==='si');
  document.getElementById('ptCA').classList.toggle('active', t==='ca');
  document.getElementById('pfSI').style.display = t==='si' ? 'flex' : 'none';
  document.getElementById('pfCA').style.display = t==='ca' ? 'flex' : 'none';
  const fp = document.getElementById('pfFP');
  if (fp) fp.style.display = 'none';
}

function showForgotPassword() {
  document.getElementById('pfSI').style.display = 'none';
  document.getElementById('pfCA').style.display = 'none';
  document.getElementById('pfFP').style.display = 'flex';
  document.getElementById('ptSI').classList.remove('active');
  document.getElementById('ptCA').classList.remove('active');
}

function showSignIn() {
  document.getElementById('pfFP').style.display = 'none';
  document.getElementById('pfSI').style.display = 'flex';
  document.getElementById('ptSI').classList.add('active');
  document.getElementById('ptCA').classList.remove('active');
}

async function doResetPassword() {
  const email = document.getElementById('fpEmail').value.trim().toLowerCase();
  const errEl = document.getElementById('fpError');
  const okEl  = document.getElementById('fpSuccess');
  const btn   = document.getElementById('fpSubmitBtn');
  errEl.classList.remove('visible'); okEl.classList.remove('visible');
  if (!email) { errEl.textContent = 'Please enter your email address.'; errEl.classList.add('visible'); return; }
  btn.textContent = 'Sending…'; btn.disabled = true;
  try {
    const { error } = await sb.auth.resetPasswordForEmail(email);
    if (error) throw error;
    okEl.textContent = '✓ Reset link sent! Check your inbox.';
    okEl.classList.add('visible');
    btn.style.display = 'none';
  } catch(err) {
    errEl.textContent = err.message || 'Could not send reset email. Please try again.';
    errEl.classList.add('visible');
    btn.textContent = 'Send Reset Link'; btn.disabled = false;
  }
}

function renderLikesPanel(activeTab) {
  const tab = activeTab || 'products';
  const body = document.getElementById('likesPanelBody');
  if (!currentUser) {
    body.innerHTML = `<div class="likes-prompt"><p>Sign in to see your likes</p><button onclick="closeAllPanels();openProfilePanel()">Sign In / Create Account</button></div>`;
    return;
  }
  const likes = getLikes();

  // Tab bar always visible
  const tabBar = `
    <div class="likes-panel-tabs">
      <button class="likes-panel-tab ${tab==='products'?'active':''}" onclick="renderLikesPanel('products')">Products</button>
      <button class="likes-panel-tab ${tab==='brands'?'active':''}" onclick="renderLikesPanel('brands')">Brands</button>
    </div>`;

  if (tab === 'products') {
    if (!likes.length) {
      body.innerHTML = tabBar + `<div class="likes-empty"><svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg><p>Nothing liked yet</p><span>Tap the heart on any piece to save it here</span></div>`;
      return;
    }
    // Get liked cards sorted by most recently liked (likes array is ordered chronologically, newest at end)
    const likedCards = [...likes].reverse().map(id => document.querySelector(`.product-card[data-id="${id}"]`)).filter(Boolean);
    const shopAllBtn = `<button class="likes-shop-all-btn" onclick="closeAllPanels();openLikedProductsPage()">Shop All Liked (${likes.length}) →</button>`;
    const grid = `<div class="liked-grid">${likedCards.map(c=>`
      <div class="liked-card">
        <div class="liked-card-img"><img src="${c.dataset.img}" alt="${c.dataset.name}" onerror="this.style.display='none'"></div>
        <button class="liked-card-remove" onclick="removeLike('${c.dataset.id}')"><svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
        <div class="liked-card-info">
          <p class="liked-card-brand">${c.dataset.brandlabel}</p>
          <p class="liked-card-name">${c.dataset.name}</p>
          <p class="liked-card-material">${c.dataset.material}</p>
          <p class="liked-card-price">${c.dataset.price}</p>
        </div>
        <a href="${c.dataset.url}" target="_blank" class="liked-card-shop">Shop now →</a>
      </div>`).join('')}</div>`;
    body.innerHTML = tabBar + shopAllBtn + grid;

  } else {
    // Brands tab — unique brands from liked products
    if (!likes.length) {
      body.innerHTML = tabBar + `<div class="likes-empty"><svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg><p>Nothing liked yet</p><span>Like some products to see your favourite brands here</span></div>`;
      return;
    }
    const likedCards = [...likes].map(id => document.querySelector(`.product-card[data-id="${id}"]`)).filter(Boolean);
    // Unique brands preserving order of first encounter
    const seen = new Set();
    const brandList = [];
    likedCards.forEach(c => {
      if (!seen.has(c.dataset.brand)) {
        seen.add(c.dataset.brand);
        brandList.push({ key: c.dataset.brand, label: c.dataset.brandlabel });
      }
    });
    const shopAllBtn = `<button class="likes-shop-all-btn" onclick="closeAllPanels();openLikedBrandsPage()">Shop All Liked Brands →</button>`;
    const list = `<div class="likes-brand-list">${brandList.map(b=>`
      <div class="likes-brand-row" onclick="closeAllPanels();showBrandDetail('${b.key}')">
        <span class="likes-brand-name">${b.label}</span>
        <span class="likes-brand-arrow">→</span>
      </div>`).join('')}</div>`;
    body.innerHTML = tabBar + shopAllBtn + list;
  }
}

// Open a "Liked Products" page — filters shop to only liked items
function openLikedProductsPage() {
  // Make sure shop is loaded first
  goShop('all');
  // Then filter to liked items only
  setTimeout(() => {
    const likes = getLikes();
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    const cards = grid.querySelectorAll('.product-card');
    let visible = 0;
    cards.forEach(c => {
      const show = likes.includes(c.dataset.id);
      c.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    document.getElementById('shopTitle').textContent = 'My Liked Pieces';
    document.getElementById('shopSub').textContent = '';
    const countEl = document.getElementById('shopCount');
    if (countEl) countEl.textContent = visible + ' piece' + (visible !== 1 ? 's' : '');
    document.getElementById('noResults').style.display = visible === 0 ? 'block' : 'none';
  }, _productsLoaded ? 0 : 900);
}

// Open a shop page filtered to all liked brands
function openLikedBrandsPage() {
  const likes = getLikes();
  if (!likes.length) { goShop('all'); return; }
  const likedCards = likes.map(id => document.querySelector(`.product-card[data-id="${id}"]`)).filter(Boolean);
  const likedBrands = new Set(likedCards.map(c => c.dataset.brand));

  goShop('all');
  setTimeout(() => {
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    const cards = grid.querySelectorAll('.product-card');
    let visible = 0;
    cards.forEach(c => {
      const show = likedBrands.has(c.dataset.brand);
      c.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    document.getElementById('shopTitle').textContent = 'My Liked Brands';
    document.getElementById('shopSub').textContent = '';
    const countEl = document.getElementById('shopCount');
    if (countEl) countEl.textContent = visible + ' piece' + (visible !== 1 ? 's' : '');
    document.getElementById('noResults').style.display = visible === 0 ? 'block' : 'none';
    renderLikeStates();
  }, _productsLoaded ? 0 : 900);
}


// ══════════════════════════════════════════
// CATEGORY TABS
// ══════════════════════════════════════════
let _activeCat = 'all';
let _activeSub = null;

const STYLE_OPTIONS = {
  dresses:    ['Mini', 'Midi', 'Maxi'],
  tops:       ['Tank', 'Short Sleeve', 'Long Sleeve', 'Sleeveless'],
  bottoms:    ['Long', 'Shorts'],
  skirts:     ['Mini', 'Midi', 'Maxi'],
  denim:      ['Long', 'Shorts'],
  swim:       ['Bikini', 'One Piece'],
  outerwear:  ['Jackets', 'Hoodies', 'Sweaters'],
  shoes:      ['Sandal', 'Ballet Flat', 'Loafer', 'Boot', 'Sneaker'],
  accessories:['Necklace', 'Earrings', 'Ring', 'Bracelet', 'Bag', 'Sunglasses', 'Hair', 'Other'],
};

// Style keyword matching — maps each style option to product name/material keywords
const STYLE_KEYWORDS = {
  'Mini':        ['mini'],
  'Midi':        ['midi'],
  'Maxi':        ['maxi','long','floor'],
  'Tank':        ['tank','singlet','cami','camisole'],
  'Short Sleeve':['short sleeve','short-sleeve','tee','t-shirt'],
  'Long Sleeve': ['long sleeve','long-sleeve'],
  'Sleeveless':  ['sleeveless','strappy','spaghetti','off-shoulder','off shoulder','bardot','strapless'],
  'Long':        ['trouser','straight leg','wide leg','flare','slim','skinny','cropped','ankle','full length','long'],
  'Shorts':      ['short','shorts'],
  'Bikini':      ['bikini','two-piece'],
  'One Piece':   ['one-piece','one piece','swimsuit','swimwear','monokini'],
  'Jackets':     ['jacket','blazer','denim jacket','leather','puffer'],
  'Hoodies':     ['hoodie','hooded','sweatshirt'],
  'Sweaters':    ['sweater','jumper','knit','cardigan','pullover'],
  'Sandal':      ['sandal'],
  'Ballet Flat': ['ballet','flat'],
  'Loafer':      ['loafer'],
  'Boot':        ['boot'],
  'Sneaker':     ['sneaker','trainer'],
  'Necklace':    ['necklace','pendant','chain'],
  'Earrings':    ['earring','stud','hoop'],
  'Ring':        ['ring'],
  'Bracelet':    ['bracelet','bangle','cuff'],
  'Bag':         ['bag','tote','clutch','purse'],
  'Sunglasses':  ['sunglass','sunnies'],
  'Hair':        ['hair','scrunchie','clip','barrette'],
  'Other':       [],
};

let _activeStyles = new Set(); // multi-select style filter

function shopSetCat(cat) {
  _activeCat = cat;
  _activeSub = null;
  _activeStyles = new Set();
  updateCatTabs();
  updateStyleSection();
  runCombinedFilter();
  const meta = SHOP_META[cat] || SHOP_META.all;
  document.getElementById('shopTitle').textContent = meta.title;
  document.getElementById('shopSub').textContent = meta.sub;
}

function shopSetCatSub(cat, sub) {
  _activeCat = cat;
  _activeSub = sub;
  _activeStyles = new Set();
  updateCatTabs();
  updateStyleSection();
  runCombinedFilter();
  const subKey = cat + ':' + sub;
  const meta = SHOP_META[subKey] || SHOP_META[cat] || SHOP_META.all;
  document.getElementById('shopTitle').textContent = meta.title;
  document.getElementById('shopSub').textContent = meta.sub;
}

function updateCatTabs() {
  document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
  const tab = document.getElementById('cattab-' + _activeCat);
  if (tab) tab.classList.add('active');
  document.querySelectorAll('.cat-tab-dropdown a').forEach(a => a.classList.remove('sub-active'));
  if (_activeSub) {
    document.querySelectorAll('.cat-tab-dropdown a').forEach(a => {
      if (a.getAttribute('onclick') && a.getAttribute('onclick').includes("'" + _activeSub + "'")) {
        a.classList.add('sub-active');
      }
    });
  }
}

function updateStyleSection() {
  const section = document.getElementById('sidebarStyleSection');
  const list    = document.getElementById('sidebarStyleList');
  if (!section || !list) return;

  const options = STYLE_OPTIONS[_activeCat];
  if (!options) {
    section.style.display = 'none';
    _activeStyles = new Set();
    return;
  }

  section.style.display = '';
  list.innerHTML = options.map(s => `
    <label class="sidebar-check">
      <input type="checkbox" value="${s}" onchange="onStyleChange('${s}', this)">
      <span class="s-check-box"></span>
      <span>${s}</span>
    </label>`).join('');
}

function onStyleChange(style, input) {
  if (input.checked) {
    _activeStyles.add(style);
  } else {
    _activeStyles.delete(style);
  }
  updateSidebarTags();
  runCombinedFilter();
}

// ══════════════════════════════════════════
// SIDEBAR FILTER STATE + FUNCTIONS
// ══════════════════════════════════════════
const PRICE_MAX = 1000;
const SIDEBAR_OCCASIONS = ['Weekend Wear','Formal','Beach Ready','Office Attire','Night Out','Off-Duty'];
const SIDEBAR_COLOURS = [
  { key:'black',  label:'Black',  hex:'#1a1a1a' },
  { key:'white',  label:'White',  hex:'#ffffff' },
  { key:'grey',   label:'Grey',   hex:'#9e9e9e' },
  { key:'tan',    label:'Tan',    hex:'#c8a882' },
  { key:'red',    label:'Red',    hex:'#c1302a' },
  { key:'pink',   label:'Pink',   hex:'#e8748a' },
  { key:'orange', label:'Orange', hex:'#e07830' },
  { key:'yellow', label:'Yellow', hex:'#e8c840' },
  { key:'green',  label:'Green',  hex:'#4a7a4a' },
  { key:'blue',   label:'Blue',   hex:'#3a6fad' },
  { key:'purple', label:'Purple', hex:'#7a4a8a' },
];

let _sidebarBrands  = new Set();
let _sidebarColours = new Set();
let _sidebarOccasions = new Set();
let _sidebarPriceMin = 0;
let _sidebarPriceMax = PRICE_MAX;

function buildSidebarBrands() {
  const list = document.getElementById('sidebarBrandList');
  if (!list) return;
  list.innerHTML = Object.entries(BRAND_LABELS)
    .sort((a,b) => a[1].localeCompare(b[1]))
    .map(([key, label]) => `
      <label class="sidebar-check">
        <input type="checkbox" value="${key}" onchange="onSidebarBrandChange('${key}')">
        <span class="s-check-box"></span><span>${label}</span>
      </label>`).join('');
}

function buildSidebarSwatches() {
  const grid = document.getElementById('sidebarSwatches');
  if (!grid) return;
  grid.innerHTML = SIDEBAR_COLOURS.map(c => `
    <button class="sidebar-colour-swatch" title="${c.label}"
            style="background:${c.hex}"
            onclick="onSidebarColourClick('${c.key}',this)"></button>`).join('');
}

function toggleSidebarSection(headerEl) {
  headerEl.classList.toggle('collapsed');
  headerEl.nextElementSibling.classList.toggle('collapsed');
}

function onSidebarBrandChange(key) {
  _sidebarBrands.has(key) ? _sidebarBrands.delete(key) : _sidebarBrands.add(key);
  updateSidebarTags(); runCombinedFilter();
}

function onSidebarColourClick(key, el) {
  if (_sidebarColours.has(key)) { _sidebarColours.delete(key); el.classList.remove('active'); }
  else { _sidebarColours.add(key); el.classList.add('active'); }
  updateSidebarTags(); runCombinedFilter();
}

function onSidebarFilterChange() {
  // Occasions — re-read all checked boxes
  _sidebarOccasions.clear();
  document.querySelectorAll('.sidebar-check input:checked').forEach(inp => {
    if (SIDEBAR_OCCASIONS.includes(inp.value)) _sidebarOccasions.add(inp.value);
  });
  updateSidebarTags(); runCombinedFilter();
}

function onPriceChange() {
  let min = parseInt(document.getElementById('sliderMin').value);
  let max = parseInt(document.getElementById('sliderMax').value);
  if (min > max) { const t = min; min = max; max = t; }
  _sidebarPriceMin = min;
  _sidebarPriceMax = max;
  document.getElementById('priceMinLabel').textContent = '$' + min;
  document.getElementById('priceMaxLabel').textContent = max >= PRICE_MAX ? '$1000+' : '$' + max;
  updatePriceFill();
  updateSidebarTags(); runCombinedFilter();
}

function updatePriceFill() {
  const min = parseInt(document.getElementById('sliderMin')?.value || 0);
  const max = parseInt(document.getElementById('sliderMax')?.value || PRICE_MAX);
  const fill = document.getElementById('priceFill');
  if (fill) {
    fill.style.left  = (min / PRICE_MAX * 100) + '%';
    fill.style.width = ((max - min) / PRICE_MAX * 100) + '%';
  }
}

function clearSidebarFilters() {
  _sidebarBrands.clear();
  _sidebarColours.clear();
  _sidebarOccasions.clear();
  _activeStyles = new Set();
  _sidebarPriceMin = 0;
  _sidebarPriceMax = PRICE_MAX;
  // Reset UI
  document.querySelectorAll('.sidebar-check input').forEach(i => i.checked = false);
  document.querySelectorAll('#sidebarStyleList input').forEach(i => i.checked = false);
  document.querySelectorAll('.sidebar-colour-swatch').forEach(s => s.classList.remove('active'));
  const sMin = document.getElementById('sliderMin');
  const sMax = document.getElementById('sliderMax');
  if (sMin) sMin.value = 0;
  if (sMax) sMax.value = PRICE_MAX;
  document.getElementById('priceMinLabel').textContent = '$0';
  document.getElementById('priceMaxLabel').textContent = '$1000+';
  updatePriceFill();
  updateSidebarTags(); runCombinedFilter();
}

function updateSidebarTags() {
  const container = document.getElementById('sidebarActiveTags');
  const clearBtn  = document.getElementById('sidebarClearBtn');
  if (!container) return;
  const tags = [];
  _activeStyles.forEach(s => tags.push({ label: s, remove: () => { _activeStyles.delete(s); document.querySelectorAll('#sidebarStyleList input').forEach(i => { if(i.value===s) i.checked=false; }); updateSidebarTags(); runCombinedFilter(); } }));
  _sidebarBrands.forEach(k   => tags.push({ label: BRAND_LABELS[k] || k,  remove: () => { _sidebarBrands.delete(k); document.querySelector(`.sidebar-check input[value="${k}"]`).checked=false; updateSidebarTags(); runCombinedFilter(); } }));
  _sidebarOccasions.forEach(o => tags.push({ label: o, remove: () => { _sidebarOccasions.delete(o); document.querySelectorAll('.sidebar-check input').forEach(i=>{if(i.value===o)i.checked=false;}); updateSidebarTags(); runCombinedFilter(); } }));
  _sidebarColours.forEach(c  => {
    const col = SIDEBAR_COLOURS.find(x=>x.key===c);
    tags.push({ label: col ? col.label : c, remove: () => { _sidebarColours.delete(c); document.querySelectorAll('.sidebar-colour-swatch').forEach(s=>{if(s.title===(col?col.label:c))s.classList.remove('active');}); updateSidebarTags(); runCombinedFilter(); } });
  });
  if (_sidebarPriceMin > 0 || _sidebarPriceMax < PRICE_MAX) {
    const label = `$${_sidebarPriceMin}–${_sidebarPriceMax >= PRICE_MAX ? '1000+' : '$'+_sidebarPriceMax}`;
    tags.push({ label, remove: () => { _sidebarPriceMin=0; _sidebarPriceMax=PRICE_MAX; document.getElementById('sliderMin').value=0; document.getElementById('sliderMax').value=PRICE_MAX; document.getElementById('priceMinLabel').textContent='$0'; document.getElementById('priceMaxLabel').textContent='$1000+'; updatePriceFill(); updateSidebarTags(); runCombinedFilter(); } });
  }
  window._sidebarTagRemovers = tags.map(t => t.remove);
  container.innerHTML = tags.map((t,i) => `
    <span class="sidebar-filter-tag" onclick="window._sidebarTagRemovers[${i}]()">
      ${t.label}
      <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </span>`).join('');
  clearBtn.classList.toggle('visible', tags.length > 0);
}

// ══════════════════════════════════════════
// COMBINED FILTER — category + sidebar
// ══════════════════════════════════════════
function parsePrice(str) {
  const m = String(str || '').replace(/,/g,'').match(/\d+/);
  return m ? parseInt(m[0]) : 0;
}

function runCombinedFilter() {
  if (!_productsLoaded) return;

  const hasBrand    = _sidebarBrands.size > 0;
  const hasColour   = _sidebarColours.size > 0;
  const hasOccasion = _sidebarOccasions.size > 0;
  const hasPriceMin = _sidebarPriceMin > 0;
  const hasPriceMax = _sidebarPriceMax < PRICE_MAX;

  // Pre-build colour keywords from COLOR_BUCKETS (reuse existing data)
  let colourKeywords = [];
  if (hasColour) {
    _sidebarColours.forEach(key => {
      const bucket = COLOR_BUCKETS.find(b => b.key === key);
      if (bucket) colourKeywords.push(...bucket.words);
    });
  }

  let visible = 0;
  document.querySelectorAll('.product-card').forEach(card => {
    let show = true;

    // Category tab
    if (_activeCat !== 'all') {
      if (_activeCat === 'bottoms') {
        if (card.dataset.cat !== 'bottoms' && card.dataset.cat !== 'trousers') show = false;
      } else if (card.dataset.cat !== _activeCat) {
        show = false;
      }
    }

    // Subcategory
    if (show && _activeSub) {
      const catMatch = card.dataset.cat === _activeCat || (_activeCat === 'bottoms' && (card.dataset.cat === 'bottoms' || card.dataset.cat === 'trousers'));
      const subcatMatch = card.dataset.subcat === _activeSub;
      const subcatEmpty = !card.dataset.subcat;
      let kwMatch = false;
      if (subcatEmpty) {
        const hay = (card.dataset.name + ' ' + card.dataset.material).toLowerCase();
        const SUBCAT_KW = {
          tank:['tank','singlet','cami','camisole'],'short-sleeve':['short sleeve','tee','t-shirt'],
          'long-sleeve':['long sleeve'],knit:['knit','sweater','jumper','cardigan'],
          mini:['mini'],midi:['midi'],long:['maxi','long','floor'],
          shorts:['short','shorts'],bikini:['bikini','two-piece'],'one-piece':['one-piece','one piece','swimsuit'],
          necklaces:['necklace','pendant','chain'],earrings:['earring','stud','hoop'],
          rings:['ring'],bracelets:['bracelet','bangle'],bags:['bag','tote','clutch'],
          sunnies:['sunglass','sunnies'],hair:['hair','scrunchie','clip']
        };
        const kws = SUBCAT_KW[_activeSub] || [_activeSub];
        kwMatch = kws.some(kw => hay.includes(kw));
      }
      if (!catMatch || !(subcatMatch || kwMatch)) show = false;
    }

    // Style filter — multi-select, product must match at least one selected style
    if (show && _activeStyles.size > 0) {
      const hay = (card.dataset.name + ' ' + card.dataset.material).toLowerCase();
      const matched = [..._activeStyles].some(style => {
        const kws = STYLE_KEYWORDS[style] || [style.toLowerCase()];
        if (style === 'Other') {
          const allKws = (STYLE_OPTIONS[_activeCat] || [])
            .filter(s => s !== 'Other')
            .flatMap(s => STYLE_KEYWORDS[s] || []);
          return !allKws.some(kw => hay.includes(kw));
        }
        return kws.some(kw => hay.includes(kw));
      });
      if (!matched) show = false;
    }

    // Brand filter
    if (show && hasBrand && !_sidebarBrands.has(card.dataset.brand)) show = false;

    // Colour filter — use data-color field from DB, fall back to keyword scan of name
    if (show && hasColour) {
      const cardColor = (card.dataset.color || '').toLowerCase();
      if (cardColor) {
        // Direct match against the color field stored in DB
        if (!_sidebarColours.has(cardColor)) show = false;
      } else {
        // Fallback: keyword scan of product name (for older products without color set)
        const hay = (card.dataset.name || '').toLowerCase();
        if (!colourKeywords.some(kw => hay.includes(kw))) show = false;
      }
    }

    // Occasion filter (uses data-occasion if available)
    if (show && hasOccasion) {
      const occ = (card.dataset.occasion || '').toLowerCase();
      const match = [..._sidebarOccasions].some(o => occ.includes(o.toLowerCase()));
      if (!match) show = false;
    }

    // Price
    if (show) {
      const price = parsePrice(card.dataset.price);
      if (price > 0) {
        if (price < _sidebarPriceMin) show = false;
        else if (hasPriceMax && price > _sidebarPriceMax) show = false;
      }
    }

    card.style.display = show ? '' : 'none';
    if (show) visible++;
  });

  document.getElementById('noResults').style.display = visible === 0 ? 'block' : 'none';
  renderLikeStates();
  // Re-apply current sort order after filtering
  if (_currentSort && _currentSort !== 'recommended') {
    sortProducts(_currentSort, null);
  }
}


// ══════════════════════════════════════════
// EDIT PAGE — sidebar filter functions
// ══════════════════════════════════════════
function buildEditSidebarControls(key, products) {
  // Colour swatches
  const swatchEl = document.getElementById('editSwatches-' + key);
  if (swatchEl) {
    swatchEl.innerHTML = SIDEBAR_COLOURS.map(c =>
      `<button class="sidebar-colour-swatch edit-swatch-${key}" title="${c.label}"
               data-key="${c.key}" style="background:${c.hex}"
               onclick="toggleEditColour('${key}','${c.key}',this)"></button>`
    ).join('');
  }
  // Brand list — only brands present in this edit
  const brandEl = document.getElementById('editBrandList-' + key);
  if (brandEl) {
    const brands = [...new Set(products.map(p => p.brand))].sort();
    brandEl.innerHTML = brands.map(b =>
      `<label class="sidebar-check">
        <input type="checkbox" class="edit-brand-${key}" value="${b}" onchange="runEditFilter('${key}')">
        <span class="s-check-box"></span><span>${BRAND_LABELS[b] || b}</span>
      </label>`
    ).join('');
  }
}

function toggleEditColour(key, colorKey, el) {
  el.classList.toggle('active');
  runEditFilter(key);
}

function onEditPriceChange(key) {
  const minEl = document.getElementById('editSliderMin-' + key);
  const maxEl = document.getElementById('editSliderMax-' + key);
  if (!minEl || !maxEl) return;
  let min = parseInt(minEl.value), max = parseInt(maxEl.value);
  if (min > max) { [min, max] = [max, min]; minEl.value = min; maxEl.value = max; }
  const minLbl = document.getElementById('editPriceMinLbl-' + key);
  const maxLbl = document.getElementById('editPriceMaxLbl-' + key);
  if (minLbl) minLbl.textContent = '$' + min;
  if (maxLbl) maxLbl.textContent = max >= 1000 ? '$1000+' : '$' + max;
  const fill = document.getElementById('editPriceFill-' + key);
  if (fill) { fill.style.left = (min/10)+'%'; fill.style.width = ((max-min)/10)+'%'; }
  runEditFilter(key);
}

function runEditFilter(key) {
  const page = document.getElementById('page-edit-' + key);
  if (!page) return;

  const selOcc    = new Set(Array.from(page.querySelectorAll(`.edit-occ-${key}:checked`)).map(e => e.value.toLowerCase()));
  const selColour = new Set(Array.from(page.querySelectorAll(`.edit-swatch-${key}.active`)).map(e => e.dataset.key));
  const selBrand  = new Set(Array.from(page.querySelectorAll(`.edit-brand-${key}:checked`)).map(e => e.value));
  const priceMin  = parseInt(document.getElementById('editSliderMin-' + key)?.value || 0);
  const priceMax  = parseInt(document.getElementById('editSliderMax-' + key)?.value || 1000);

  const hasOcc    = selOcc.size > 0;
  const hasColour = selColour.size > 0;
  const hasBrand  = selBrand.size > 0;
  const hasPrMin  = priceMin > 0;
  const hasPrMax  = priceMax < 1000;

  let visible = 0;
  page.querySelectorAll('.product-card').forEach(card => {
    let show = true;
    if (hasBrand  && !selBrand.has(card.dataset.brand)) show = false;
    if (show && hasColour) {
      const c = (card.dataset.color || '').toLowerCase();
      if (!c || !selColour.has(c)) show = false;
    }
    if (show && hasOcc) {
      const occ = (card.dataset.occasion || '').toLowerCase();
      if (![...selOcc].some(o => occ.includes(o))) show = false;
    }
    if (show && (hasPrMin || hasPrMax)) {
      const price = parsePrice(card.dataset.price);
      if (price > 0 && hasPrMin && price < priceMin) show = false;
      if (price > 0 && hasPrMax && price > priceMax) show = false;
    }
    card.style.display = show ? '' : 'none';
    if (show) visible++;
  });

  const countEl = document.getElementById('editCount-' + key);
  if (countEl) countEl.textContent = visible + ' piece' + (visible !== 1 ? 's' : '');
  renderLikeStates();
}

function toggleMobileEditSidebar(key) {
  const sidebar   = document.getElementById('editSidebar-' + key);
  const backdrop  = document.getElementById('shopSidebarBackdrop');
  if (!sidebar) return;
  const isOpen = sidebar.classList.contains('mobile-open');
  if (isOpen) { closeMobileEditSidebar(key); }
  else {
    sidebar.classList.add('mobile-open');
    if (backdrop) backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeMobileEditSidebar(key) {
  const sidebar  = document.getElementById('editSidebar-' + key);
  const backdrop = document.getElementById('shopSidebarBackdrop');
  if (sidebar)   sidebar.classList.remove('mobile-open');
  if (backdrop)  backdrop.classList.remove('open');
  document.body.style.overflow = '';
}

// ══════════════════════════════════════════
// INIT — restore session from Supabase
// ══════════════════════════════════════════
(async () => {
  // Wrap entire init in try/catch — Supabase can throw uncloneable errors
  // in sandboxed or local-file contexts
  try {
    const { data } = await sb.auth.getSession().catch(() => ({ data: {} }));
    const session = data?.session;
    if (session?.user) {
      try { await _onSignIn(session.user); } catch(e) {}
    }
  } catch(e) {}

  // Load brand registry first, then products and edits
  await loadBrandRegistry();
  buildSidebarBrands();
  buildSidebarSwatches();
  updatePriceFill();
  initShopCount();
  initHomeDuo();
  await loadEdits();

  // Keep session in sync
  try {
    sb.auth.onAuthStateChange(async (event, session) => {
      try {
        if (event === 'SIGNED_IN' && session?.user) {
          await _onSignIn(session.user);
        } else if (event === 'SIGNED_OUT') {
          currentUser = null; _likes = [];
          renderLikeStates(); updateLikesBadge();
        }
      } catch(e) {}
    });
  } catch(e) {}
})();

// ══════════════════════════════════════════
// MOBILE NAV DRAWER
// ══════════════════════════════════════════
function openMobileDrawer() {
  document.getElementById('mobileDrawer').classList.add('open');
  document.getElementById('mobileDrawerBackdrop').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeMobileDrawer() {
  document.getElementById('mobileDrawer').classList.remove('open');
  document.getElementById('mobileDrawerBackdrop').classList.remove('open');
  document.body.style.overflow = '';
}

// ══════════════════════════════════════════
// MOBILE SHOP SIDEBAR
// ══════════════════════════════════════════
function toggleMobileSidebar() {
  const sidebar = document.querySelector('.shop-sidebar');
  const backdrop = document.getElementById('shopSidebarBackdrop');
  const isOpen = sidebar.classList.contains('mobile-open');
  if (isOpen) {
    closeMobileSidebar();
  } else {
    sidebar.classList.add('mobile-open');
    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}
function closeMobileSidebar() {
  const sidebar = document.querySelector('.shop-sidebar');
  const backdrop = document.getElementById('shopSidebarBackdrop');
  sidebar.classList.remove('mobile-open');
  backdrop.classList.remove('open');
  document.body.style.overflow = '';
}

// Mobile sidebar closes on filter selection — handled inside sidebarFilter()

// Close drawers on resize to desktop
window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    closeMobileDrawer();
    closeMobileSidebar();
    document.body.style.overflow = '';
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeSearch();
    closeSortMenu();
    closeMobileDrawer();
    closeMobileSidebar();
  }
});

document.addEventListener('click', e => {
  // Close main shop sort menu
  const sortWrap = document.getElementById('sortMenu')?.closest('.sort-dropdown-wrap');
  if (sortWrap && !sortWrap.contains(e.target)) closeSortMenu();

  // Close brand sort menu
  const bdSortWrap = document.getElementById('bdSortMenu')?.closest('.sort-dropdown-wrap');
  if (bdSortWrap && !bdSortWrap.contains(e.target)) {
    document.getElementById('bdSortMenu')?.classList.remove('open');
    document.getElementById('bdSortTrigger')?.classList.remove('open');
  }

  // Close all edit sort menus
  document.querySelectorAll('[id^="editSortMenu-"]').forEach(menu => {
    const wrap = menu.closest('.sort-dropdown-wrap');
    if (wrap && !wrap.contains(e.target)) {
      menu.classList.remove('open');
      menu.closest('.sort-dropdown-wrap')?.querySelector('.sort-trigger')?.classList.remove('open');
    }
  });
});