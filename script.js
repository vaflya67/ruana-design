/* NAV */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 30);
});

/* MOBILE MENU */
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');

burger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});

document.querySelectorAll('.mobile-panel__link').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

/* REVEAL */
const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const siblings = [...entry.target.parentElement.querySelectorAll('.reveal:not(.visible)')];
      const idx = siblings.indexOf(entry.target);
      setTimeout(() => entry.target.classList.add('visible'), idx * 70);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

reveals.forEach(el => revealObserver.observe(el));

/* SERVICE FOLDER TABS */
const serviceFolder = document.getElementById('service-folder');
const serviceTabs = document.querySelectorAll('.svc-tab');
const servicePanes = document.querySelectorAll('.svc-pane');
function getServiceScrollTop() {
  if (!serviceFolder) return 0;
  const tabs = serviceFolder.querySelector('.svc-tabs');
  const anchor = tabs || serviceFolder;
  const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 68;
  const gap = 20;
  return anchor.getBoundingClientRect().top + window.scrollY - navH - gap;
}

function switchService(serviceId, scroll = false) {
  const tabIndex = [...serviceTabs].findIndex(tab => tab.dataset.service === serviceId);
  if (tabIndex < 0) return;

  serviceTabs.forEach(tab => {
    const active = tab.dataset.service === serviceId;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
  });

  servicePanes.forEach(pane => {
    const active = pane.dataset.service === serviceId;
    pane.classList.toggle('is-active', active);
    pane.hidden = !active;
  });

  if (serviceFolder) {
    serviceFolder.dataset.active = String(tabIndex);
  }

  if (scroll && serviceFolder) {
    requestAnimationFrame(() => {
      window.scrollTo({ top: Math.max(0, getServiceScrollTop()), behavior: 'smooth' });
    });
  }
}

serviceTabs.forEach(tab => {
  tab.addEventListener('click', () => switchService(tab.dataset.service));
});

document.querySelectorAll('.chip[data-service]').forEach(tag => {
  tag.addEventListener('click', (e) => {
    e.preventDefault();
    switchService(tag.dataset.service, true);
  });
});

/* FORM */
const contactForm = document.getElementById('contactForm');
const sendBtn = document.getElementById('sendBtn');
const formNote = document.getElementById('formNote');

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('clientName').value.trim();
  const contact = document.getElementById('clientContact').value.trim();
  const message = document.getElementById('clientMessage').value.trim();
  const inputs = contactForm.querySelectorAll('.form-input');

  let filled = true;
  inputs.forEach(inp => {
    if (!inp.value.trim()) {
      filled = false;
      inp.style.borderColor = '#FF76B7';
    } else {
      inp.style.borderColor = '';
    }
  });

  if (!filled) {
    formNote.textContent = 'Будь ласка, заповніть усі поля.';
    formNote.className = 'form-note form-note--error';
    return;
  }

  sendBtn.disabled = true;
  sendBtn.textContent = 'Надсилаю...';
  formNote.textContent = '';
  formNote.className = 'form-note';

  if (window.location.protocol === 'file:') {
    formNote.textContent = 'Форма працює лише на опублікованому сайті (Netlify). Поки що напишіть на 06614051a@gmail.com';
    sendBtn.textContent = 'Надіслати заявку';
    sendBtn.disabled = false;
    return;
  }

  try {
    const response = await fetch('https://formsubmit.co/ajax/06614051a@gmail.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        name,
        contact,
        message,
        _subject: 'Нова заявка — сайт Анни Русіної',
        _template: 'table',
        _captcha: 'false',
      }),
    });

    const data = await response.json().catch(() => ({}));
    const msg = (data.message || '').toLowerCase();
    const isActivation = /activ|confirm|check your email|verify|confirmation/.test(msg);
    const isSuccess = data.success === true || data.success === 'true' || response.ok && isActivation;

    if (isActivation) {
      formNote.textContent = '✓ Майже готово! Анні надіслали лист для активації форми — потрібно натиснути посилання в Gmail.';
      contactForm.reset();
      return;
    }

    if (!isSuccess && (data.success === false || data.success === 'false' || !response.ok)) {
      throw new Error(data.message || 'send failed');
    }

    formNote.textContent = '✓ Дякуємо! Анна зв\'яжеться з вами протягом дня';
    contactForm.reset();
  } catch (err) {
    formNote.textContent = 'Не вдалося надіслати. Напишіть напряму на 06614051a@gmail.com';
    formNote.className = 'form-note form-note--error';
  } finally {
    sendBtn.textContent = 'Надіслати заявку';
    sendBtn.disabled = false;
  }
});

/* SMOOTH SCROLL */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    if (a.dataset.service) return;
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 68;
      window.scrollTo({ top, behavior: 'smooth' });
      mobileMenu.classList.remove('open');
    }
  });
});
