import { fetchPokemonSprite, getUniqueRandomId } from './app.js';

const MAX_POKEMON = 898; 

document.addEventListener('DOMContentLoaded', () => {
  const wrappers = Array.from(document.querySelectorAll('.pokeball-wrapper'));
  if (!wrappers.length) return;

  const usedIds = new Set();

  wrappers.forEach(async (wrapper, index) => {
    // create shadow
    const shadow = document.createElement('div');
    shadow.className = 'pokeball-shadow';
    wrapper.appendChild(shadow);

    // create main pokeball 
    const pokeball = document.createElement('div');
    pokeball.className = 'pokeball';
    pokeball.setAttribute('role', 'button');
    pokeball.setAttribute('aria-label', 'Reveal starter');
    wrapper.appendChild(pokeball);

    // create container for the pokemon sprite behind the pokeball
    const behindContainer = document.createElement('div');
    behindContainer.className = 'pokemon-behind';
    wrapper.appendChild(behindContainer);

    // generate a unique poke id and fetch the sprite
    let pokeId;
    try {
      pokeId = getUniqueRandomId(usedIds, MAX_POKEMON);
    } catch (err) {
      console.warn('starterPicker: no unique ids left', err);
      pokeId = Math.floor(Math.random() * MAX_POKEMON) + 1;
    }

    let spriteUrl = null;
    try {
      spriteUrl = await fetchPokemonSprite(pokeId, { timeout: 7000 });
    } catch (err) {
      console.warn('starterPicker: fetch error for id', pokeId, err);
    }

    const img = document.createElement('img');
    if (spriteUrl) {
      img.src = spriteUrl;
      img.alt = `Pokemon ${pokeId}`;
    } else {
      // fallback: small placeholder 
      img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
      img.alt = 'No sprite';
      img.style.opacity = '0.6';
    }
    behindContainer.appendChild(img);

    // entrance animation
    if (window.gsap) {
      gsap.from(wrapper, { y: -40, duration: 0.5, ease: 'bounce.out', delay: index * 0.12 });
      gsap.fromTo(shadow, { y: 0 }, { y: 6, duration: 0.6, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    }

    // hover effects
    pokeball.addEventListener('mouseenter', () => {
      if (!window.gsap) return;
      gsap.fromTo(pokeball, { rotation: -5, scale: 1 }, { rotation: 5, scale: 1.06, duration: 0.12, repeat: 4, yoyo: true });
    });

    // click reveal !!!!!
    const clickHandler = () => {
      // disable future clicks on this wrapper
      wrapper.removeEventListener('click', clickHandler);
      pokeball.setAttribute('aria-disabled', 'true');

      // animate the pokeball 
      if (window.gsap) {
        gsap.to(pokeball, {
          rotation: 360,
          scale: 0,
          duration: 0.7,
          ease: 'back.in(1.7)',
          onComplete: () => {
            pokeball.style.display = 'none';
            behindContainer.style.opacity = '1';
            gsap.from(behindContainer, { scale: 0.6, duration: 0.5, ease: 'elastic.out(1,0.6)' });
          }
        });
      } else {
        
        pokeball.style.display = 'none';
        behindContainer.style.opacity = '1';
      }
    };

    wrapper.addEventListener('click', clickHandler);
  });
});


const root = "..";
const TCG_PATH = `${root}/Pokemon Card Page/index.html`;
const POKEDEX_PATH = `${root}/Pokedex Page/index.html`;

document.addEventListener('DOMContentLoaded', () => {
  const tcgBtn = document.getElementById('TCGbinderBtn');
  const pDexBtn = document.getElementById('starterPickerBtn');

  if (tcgBtn) {
    tcgBtn.addEventListener('click', (e) => {
      if (e.ctrlKey || e.metaKey || e.button === 1) {
        window.open(TCG_PATH, '_blank');
        return;
      }
      window.location.href = TCG_PATH;
    });

    tcgBtn.setAttribute('role', 'link');
    tcgBtn.setAttribute('aria-label', 'Open TCG Binder');
  }

  if (pDexBtn) {
    pDexBtn.addEventListener('click', (e) => {
      if (e.ctrlKey || e.metaKey || e.button === 1) {
        window.open(POKEDEX_PATH, '_blank');
        return;
      }
      window.location.href = POKEDEX_PATH;
    });

    pDexBtn.setAttribute('role', 'link');
    pDexBtn.setAttribute('aria-label', 'Open Pokédex');
  }

});
