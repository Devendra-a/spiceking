/**
 * SPICE KING FAMILY RESTAURANT & BANQUETS
 * Client-Side JavaScript
 * Highway NH-19, Haripur, Chandauli, UP
 * Contact: +91 62069 97192
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initLiveHoursStatus();
  initMobileNav();
  initMenuFilters();
  initCartAndOrdering();
  initReservationForm();
  initPhotoLightbox();
  initScrollSpy();
});

/* ==========================================================================
   0. THEME SWITCHER (DAY / NIGHT)
   ========================================================================== */
function initThemeToggle() {
  const toggleBtns = document.querySelectorAll('.theme-toggle-btn');
  const htmlRoot = document.documentElement;

  function getCurrentTheme() {
    return htmlRoot.getAttribute('data-theme') || localStorage.getItem('spice_king_theme') || 'dark';
  }

  function setTheme(theme) {
    htmlRoot.setAttribute('data-theme', theme);
    localStorage.setItem('spice_king_theme', theme);
    updateToggleButtons(theme);
  }

  function updateToggleButtons(theme) {
    toggleBtns.forEach(btn => {
      const isNight = (theme === 'dark');
      const tooltip = isNight ? 'Switch to Day Theme (दिन का थीम)' : 'Switch to Night Theme (रात का थीम)';
      btn.setAttribute('title', tooltip);
      btn.setAttribute('aria-label', tooltip);
    });
  }

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const current = getCurrentTheme();
      const nextTheme = (current === 'dark') ? 'light' : 'dark';
      setTheme(nextTheme);
    });
  });

  // Sync initial button states
  updateToggleButtons(getCurrentTheme());

  // Listen to OS system color changes if user hasn't manually set a preference
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
      if (!localStorage.getItem('spice_king_theme')) {
        setTheme(e.matches ? 'light' : 'dark');
      }
    });
  }
}

/* ==========================================================================
   1. LIVE RESTAURANT OPEN/CLOSED STATUS INDICATOR
   Hours: 8:00 AM to 12:15 AM
   ========================================================================== */
function initLiveHoursStatus() {
  const statusEl = document.getElementById('liveStatusText');
  const dotEl = document.getElementById('liveStatusDot');
  if (!statusEl) return;

  const now = new Date();
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();
  const currentTotalMin = currentHour * 60 + currentMin;

  // Open between 8:00 AM (480 min) and 12:15 AM (15 min next day)
  const isOpen = (currentTotalMin >= 8 * 60) || (currentTotalMin <= 15);

  if (isOpen) {
    statusEl.textContent = "Open Now | Closes at 12:15 AM";
    if (dotEl) {
      dotEl.style.backgroundColor = "var(--brand-green)";
      dotEl.style.boxShadow = "0 0 8px rgba(46, 204, 113, 0.6)";
    }
  } else {
    statusEl.textContent = "Closed Now | Opens at 8:00 AM";
    if (dotEl) {
      dotEl.style.backgroundColor = "var(--brand-red)";
      dotEl.style.boxShadow = "0 0 8px rgba(229, 57, 53, 0.6)";
    }
  }
}

/* ==========================================================================
   2. MOBILE NAVIGATION TOGGLE
   ========================================================================== */
function initMobileNav() {
  const navToggle = document.getElementById('mobileNavToggle');
  const navLinks = document.getElementById('navLinks');
  if (!navToggle || !navLinks) return;

  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const isOpen = navLinks.classList.contains('active');
    navToggle.setAttribute('aria-expanded', isOpen);
    navToggle.innerHTML = isOpen 
      ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>'
      : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
      navToggle.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
    });
  });
}

/* ==========================================================================
   3. MENU CATEGORY & DIETARY FILTERS
   ========================================================================== */
function initMenuFilters() {
  const catButtons = document.querySelectorAll('.cat-tab-btn');
  const dietButtons = document.querySelectorAll('.diet-btn');
  const menuCards = document.querySelectorAll('.menu-card');

  let activeCategory = 'all';
  let activeDiet = 'all';

  function applyFilters() {
    menuCards.forEach(card => {
      const cardCategory = card.dataset.category || 'all';
      const cardDiet = card.dataset.diet || 'all';

      const matchCat = (activeCategory === 'all' || cardCategory === activeCategory);
      const matchDiet = (activeDiet === 'all' || cardDiet === activeDiet);

      if (matchCat && matchDiet) {
        card.style.display = 'flex';
        setTimeout(() => { card.style.opacity = '1'; }, 10);
      } else {
        card.style.display = 'none';
        card.style.opacity = '0';
      }
    });
  }

  catButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      catButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.category;
      applyFilters();
    });
  });

  dietButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const diet = btn.dataset.diet;
      if (btn.classList.contains('active-veg') || btn.classList.contains('active-nonveg')) {
        btn.classList.remove('active-veg', 'active-nonveg');
        activeDiet = 'all';
      } else {
        dietButtons.forEach(b => b.classList.remove('active-veg', 'active-nonveg'));
        if (diet === 'veg') btn.classList.add('active-veg');
        if (diet === 'nonveg') btn.classList.add('active-nonveg');
        activeDiet = diet;
      }
      applyFilters();
    });
  });
}

/* ==========================================================================
   4. CART & WHATSAPP ORDERING SYSTEM (CLEAN & PROFESSIONAL FORMATTING)
   ========================================================================== */
let cart = [];

function initCartAndOrdering() {
  const cartToggleBtn = document.getElementById('cartToggleBtn');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const cartBackdrop = document.getElementById('cartDrawerBackdrop');
  const cartDrawer = document.getElementById('cartDrawer');
  const cartCountBadge = document.getElementById('cartCountBadge');
  const cartItemsList = document.getElementById('cartItemsList');
  const cartTotalPrice = document.getElementById('cartTotalPrice');
  const sendWhatsAppOrderBtn = document.getElementById('sendWhatsAppOrderBtn');
  const orderTypeButtons = document.querySelectorAll('.order-type-btn');

  let selectedOrderType = "Dine-in (Restaurant Table)";

  orderTypeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      orderTypeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedOrderType = btn.dataset.type;
    });
  });

  function toggleCart(open) {
    if (!cartDrawer || !cartBackdrop) return;
    if (open) {
      cartDrawer.classList.add('active');
      cartBackdrop.classList.add('active');
    } else {
      cartDrawer.classList.remove('active');
      cartBackdrop.classList.remove('active');
    }
  }

  if (cartToggleBtn) cartToggleBtn.addEventListener('click', () => toggleCart(true));
  if (closeCartBtn) closeCartBtn.addEventListener('click', () => toggleCart(false));
  if (cartBackdrop) cartBackdrop.addEventListener('click', () => toggleCart(false));

  document.querySelectorAll('.add-order-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.menu-card');
      const id = card.dataset.id || Math.random().toString();
      const title = card.querySelector('.item-title').textContent.trim();
      const priceText = card.querySelector('.item-price').textContent.replace(/[^0-9]/g, '');
      const price = parseInt(priceText, 10) || 0;
      const diet = card.dataset.diet || 'veg';

      const existing = cart.find(item => item.title === title);
      if (existing) {
        existing.qty += 1;
      } else {
        cart.push({ id, title, price, diet, qty: 1 });
      }

      const originalHtml = btn.innerHTML;
      btn.classList.add('added');
      btn.innerHTML = 'Added';
      setTimeout(() => {
        btn.classList.remove('added');
        btn.innerHTML = originalHtml;
      }, 1200);

      renderCart();
    });
  });

  function renderCart() {
    if (!cartItemsList || !cartCountBadge || !cartTotalPrice) return;

    const totalCount = cart.reduce((acc, item) => acc + item.qty, 0);
    cartCountBadge.textContent = totalCount;

    if (cart.length === 0) {
      cartItemsList.innerHTML = `
        <div class="cart-empty-message">
          <svg style="width:40px;height:40px;margin:0 auto 1rem;stroke:var(--text-dim);" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
          <p style="font-weight:600; color:#fff;">Your order plate is empty</p>
          <span style="font-size:0.8rem;color:var(--text-dim);">Select items from the menu to proceed with your order.</span>
        </div>
      `;
      cartTotalPrice.textContent = '₹0';
      return;
    }

    let total = 0;
    cartItemsList.innerHTML = '';

    cart.forEach(item => {
      const itemSubtotal = item.price * item.qty;
      total += itemSubtotal;

      const badgeHtml = item.diet === 'veg' 
        ? '<span class="veg-badge" style="margin-right:6px;"></span>' 
        : '<span class="nonveg-badge" style="margin-right:6px;"></span>';

      const itemRow = document.createElement('div');
      itemRow.className = 'cart-item-row';
      itemRow.innerHTML = `
        <div class="cart-item-info">
          <h5 style="display:flex; align-items:center;">${badgeHtml} ${item.title}</h5>
          <span>₹${item.price} x ${item.qty} = ₹${itemSubtotal}</span>
        </div>
        <div class="cart-qty-ctrl">
          <button class="qty-btn" data-action="decrease" data-title="${item.title}">−</button>
          <span class="qty-number">${item.qty}</span>
          <button class="qty-btn" data-action="increase" data-title="${item.title}">+</button>
        </div>
      `;
      cartItemsList.appendChild(itemRow);
    });

    cartTotalPrice.textContent = `₹${total}`;

    cartItemsList.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        const title = btn.dataset.title;
        const target = cart.find(i => i.title === title);
        if (!target) return;

        if (action === 'increase') {
          target.qty += 1;
        } else if (action === 'decrease') {
          target.qty -= 1;
          if (target.qty <= 0) {
            cart = cart.filter(i => i.title !== title);
          }
        }
        renderCart();
      });
    });
  }

  if (sendWhatsAppOrderBtn) {
    sendWhatsAppOrderBtn.addEventListener('click', () => {
      if (cart.length === 0) {
        alert("Please add at least one dish to your order plate.");
        return;
      }

      const guestNote = document.getElementById('orderNotes')?.value.trim() || 'None';
      const guestLocation = document.getElementById('orderLocationInfo')?.value.trim() || 'Direct Diner';

      let total = 0;
      let itemsListStr = "";
      cart.forEach((item, idx) => {
        const sub = item.price * item.qty;
        total += sub;
        itemsListStr += `${idx + 1}. ${item.title} [${item.diet.toUpperCase()}] x ${item.qty} = Rs. ${sub}\n`;
      });

      const message = 
`ORDER REQUEST - SPICE KING FAMILY RESTAURANT
Location: NH-19, Haripur, Chandauli, UP
----------------------------------------
Order Type: ${selectedOrderType}
Table / Vehicle / Contact: ${guestLocation}
Special Instructions: ${guestNote}
----------------------------------------
ORDERED ITEMS:
${itemsListStr}----------------------------------------
ESTIMATED TOTAL: Rs. ${total}

Kindly confirm availability and estimated preparation time.`;

      const encodedMsg = encodeURIComponent(message);
      const waUrl = `https://wa.me/916206997192?text=${encodedMsg}`;
      window.open(waUrl, '_blank');
    });
  }
}

/* ==========================================================================
   5. TABLE & BANQUET RESERVATION FORM
   ========================================================================== */
function initReservationForm() {
  const form = document.getElementById('tableBookingForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('bookName').value.trim();
    const phone = document.getElementById('bookPhone').value.trim();
    const guests = document.getElementById('bookGuests').value;
    const date = document.getElementById('bookDate').value;
    const time = document.getElementById('bookTime').value;
    const occasion = document.getElementById('bookOccasion').value;
    const seating = document.getElementById('bookSeating').value;
    const notes = document.getElementById('bookNotes').value.trim() || 'None';

    const message = 
`TABLE / BANQUET RESERVATION INQUIRY
Spice King Family Restaurant & Banquets
----------------------------------------
Guest Name: ${name}
Phone: ${phone}
Number of Guests: ${guests}
Date: ${date}
Time: ${time}
Occasion: ${occasion}
Seating Preference: ${seating}
Special Requirements: ${notes}
----------------------------------------
Kindly verify table availability and confirm our reservation.`;

    const encoded = encodeURIComponent(message);
    const waUrl = `https://wa.me/916206997192?text=${encoded}`;
    window.open(waUrl, '_blank');
  });
}

/* ==========================================================================
   6. REAL RESTAURANT PHOTO LIGHTBOX
   ========================================================================== */
function initPhotoLightbox() {
  const lightbox = document.getElementById('photoLightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxDesc = document.getElementById('lightboxDesc');
  const closeBtn = document.getElementById('closeLightboxBtn');

  if (!lightbox) return;

  document.querySelectorAll('.gallery-card').forEach(card => {
    card.addEventListener('click', () => {
      const img = card.querySelector('img');
      const title = card.querySelector('h4')?.textContent || 'Spice King Venue Photo';
      const desc = card.querySelector('p')?.textContent || '';

      if (img && lightboxImg) {
        lightboxImg.src = img.src;
        if (lightboxTitle) lightboxTitle.textContent = title;
        if (lightboxDesc) lightboxDesc.textContent = desc;
        lightbox.classList.add('active');
      }
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => lightbox.classList.remove('active'));
  }

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) lightbox.classList.remove('active');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      lightbox.classList.remove('active');
    }
  });
}

/* ==========================================================================
   7. SCROLL SPY & NAVBAR ACTIVE STATE
   ========================================================================== */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.scrollY + 120;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}
