import { showSlide } from '../blocks/carousel/carousel.js';
import {
  decorateBlock,
  decorateBlocks,
  decorateButtons,
  decorateIcons,
  decorateSections,
  loadBlock,
  loadScript,
  loadSections,
} from './aem.js';
import { decorateRichtext } from './editor-support-rte.js';
import { decorateMain } from './scripts.js';

/**
 *
 * @param {Element} block
 * @param {HTMLElement} block
 * Use this function to trigger a mutation for the UI editor overlay when you
 * have a scrollable block
 */
function createMutation(block) {
  block.setAttribute('xwalk-scroll-mutation', 'true');
  block.querySelector('.carousel-slides').onscrollend = () => {
    block.removeAttribute('xwalk-scroll-mutation');
  };
}

function getState(block) {
  if (block.matches('.accordion')) {
    return [...block.querySelectorAll('details[open]')].map(
      (details) => details.dataset.aueResource,
    );
  }
  if (block.matches('.carousel')) {
    return block.dataset.activeSlide;
  }
  return null;
}

function setState(block, state) {
  if (block.matches('.accordion')) {
    block.querySelectorAll('details').forEach((details) => {
      details.open = state.includes(details.dataset.aueResource);
    });
  }
  if (block.matches('.carousel')) {
    block.style.display = null;
    createMutation(block);
    showSlide(block, state);
  }
}

/* eslint-disable no-console */
async function applyChanges(event) {
  console.log('[EDITOR BLOCK CREATION] Starting applyChanges');
  console.log('[EDITOR BLOCK CREATION] Event:', event);

  // redecorate default content and blocks on patches (in the properties rail)
  const { detail } = event;
  console.log('[EDITOR BLOCK CREATION] Event detail:', detail);

  const resource = detail?.request?.target?.resource // update, patch components
    || detail?.request?.target?.container?.resource // update, patch, add to sections
    || detail?.request?.to?.container?.resource; // move in sections
  console.log('[EDITOR BLOCK CREATION] Resource:', resource);

  if (!resource) {
    console.log('[EDITOR BLOCK CREATION] No resource found, returning false');
    return false;
  }

  const updates = detail?.response?.updates;
  console.log('[EDITOR BLOCK CREATION] Updates:', updates);
  console.log('[EDITOR BLOCK CREATION] Updates length:', updates?.length);

  if (!updates.length) {
    console.log('[EDITOR BLOCK CREATION] No updates found, returning false');
    return false;
  }

  const { content } = updates[0];
  console.log('[EDITOR BLOCK CREATION] Content:', content);

  if (!content) {
    console.log('[EDITOR BLOCK CREATION] No content found, returning false');
    return false;
  }

  console.log('[EDITOR BLOCK CREATION] Loading DOMPurify...');
  // load dompurify
  await loadScript(`${window.hlx.codeBasePath}/scripts/dompurify.min.js`);

  console.log('[EDITOR BLOCK CREATION] Sanitizing content...');
  const sanitizedContent = window.DOMPurify.sanitize(content, { USE_PROFILES: { html: true } });
  console.log('[EDITOR BLOCK CREATION] Sanitized content:', sanitizedContent);

  console.log('[EDITOR BLOCK CREATION] Parsing updated content...');
  const parsedUpdate = new DOMParser().parseFromString(sanitizedContent, 'text/html');
  console.log('[EDITOR BLOCK CREATION] Parsed update:', parsedUpdate);

  const element = document.querySelector(`[data-aue-resource="${resource}"]`);
  console.log('[EDITOR BLOCK CREATION] Target element:', element);

  if (element) {
    console.log('[EDITOR BLOCK CREATION] Element found, processing...');

    if (element.matches('main')) {
      console.log('[EDITOR BLOCK CREATION] Processing main element update');
      const newMain = parsedUpdate.querySelector(`[data-aue-resource="${resource}"]`);
      console.log('[EDITOR BLOCK CREATION] New main element:', newMain);

      newMain.style.display = 'none';
      element.insertAdjacentElement('afterend', newMain);

      console.log('[EDITOR BLOCK CREATION] Decorating new main...');
      decorateMain(newMain);
      decorateRichtext(newMain);
      await loadSections(newMain);

      console.log('[EDITOR BLOCK CREATION] Removing old main and showing new one');
      element.remove();
      newMain.style.display = null;

      // eslint-disable-next-line no-use-before-define
      attachEventListners(newMain);
      console.log('[EDITOR BLOCK CREATION] Main update completed');
      return true;
    }

    const block = element.parentElement?.closest('.block[data-aue-resource]') || element?.closest('.block[data-aue-resource]');
    console.log('[EDITOR BLOCK CREATION] Block element:', block);

    if (block) {
      console.log('[EDITOR BLOCK CREATION] Processing block update/creation');
      const blockResource = block.getAttribute('data-aue-resource');
      console.log('[EDITOR BLOCK CREATION] Block resource:', blockResource);

      const newBlock = parsedUpdate.querySelector(`[data-aue-resource="${blockResource}"]`);
      console.log('[EDITOR BLOCK CREATION] New block element:', newBlock);

      if (newBlock) {
        console.log('[EDITOR BLOCK CREATION] New block found, proceeding with replacement');
        console.log('[EDITOR BLOCK CREATION] New block classes:', Array.from(newBlock.classList));
        console.log('[EDITOR BLOCK CREATION] New block innerHTML:', newBlock.innerHTML);

        console.log('[EDITOR BLOCK CREATION] Getting current block state');
        const state = getState(block);
        console.log('[EDITOR BLOCK CREATION] Current block state:', state);

        console.log('[EDITOR BLOCK CREATION] Hiding new block and inserting');
        newBlock.style.display = 'none';
        block.insertAdjacentElement('afterend', newBlock);

        console.log('[EDITOR BLOCK CREATION] Decorating new block...');
        decorateButtons(newBlock);
        decorateIcons(newBlock);
        decorateBlock(newBlock);
        decorateRichtext(newBlock);

        console.log('[EDITOR BLOCK CREATION] Loading new block...');
        await loadBlock(newBlock);

        console.log('[EDITOR BLOCK CREATION] Removing old block');
        block.remove();

        console.log('[EDITOR BLOCK CREATION] Restoring block state');
        setState(newBlock, state);

        console.log('[EDITOR BLOCK CREATION] Showing new block');
        newBlock.style.display = null;

        console.log('[EDITOR BLOCK CREATION] Block replacement completed');
        console.log('[EDITOR BLOCK CREATION] Final new block state:');
        console.log('[EDITOR BLOCK CREATION] - Classes:', Array.from(newBlock.classList));
        console.log('[EDITOR BLOCK CREATION] - Dataset:', newBlock.dataset);
        console.log('[EDITOR BLOCK CREATION] - innerHTML:', newBlock.innerHTML);

        return true;
      }
      console.log('[EDITOR BLOCK CREATION] No new block found in parsed content');
    } else {
      console.log('[EDITOR BLOCK CREATION] Processing sections and default content');
      // sections and default content, may be multiple in the case of richtext
      const newElements = parsedUpdate.querySelectorAll(`[data-aue-resource="${resource}"],[data-richtext-resource="${resource}"]`);
      console.log('[EDITOR BLOCK CREATION] New elements found:', newElements.length);

      if (newElements.length) {
        const { parentElement } = element;
        console.log('[EDITOR BLOCK CREATION] Parent element:', parentElement);

        if (element.matches('.section')) {
          console.log('[EDITOR BLOCK CREATION] Processing section update');
          const [newSection] = newElements;
          console.log('[EDITOR BLOCK CREATION] New section:', newSection);

          newSection.style.display = 'none';
          element.insertAdjacentElement('afterend', newSection);

          console.log('[EDITOR BLOCK CREATION] Decorating new section...');
          decorateButtons(newSection);
          decorateIcons(newSection);
          decorateRichtext(newSection);
          decorateSections(parentElement);
          decorateBlocks(parentElement);
          await loadSections(parentElement);

          console.log('[EDITOR BLOCK CREATION] Removing old section and showing new one');
          element.remove();
          newSection.style.display = null;
          console.log('[EDITOR BLOCK CREATION] Section update completed');
        } else {
          console.log('[EDITOR BLOCK CREATION] Processing element replacement');
          element.replaceWith(...newElements);
          decorateButtons(parentElement);
          decorateIcons(parentElement);
          decorateRichtext(parentElement);
          console.log('[EDITOR BLOCK CREATION] Element replacement completed');
        }
        return true;
      }
      console.log('[EDITOR BLOCK CREATION] No new elements found');
    }
  } else {
    console.log('[EDITOR BLOCK CREATION] Target element not found');
  }

  console.log('[EDITOR BLOCK CREATION] applyChanges completed with no changes applied');
  return false;
}

function attachEventListners(main) {
  [
    'aue:content-patch',
    'aue:content-update',
    'aue:content-add',
    'aue:content-move',
    'aue:content-remove',
    'aue:content-copy',
  ].forEach((eventType) => main?.addEventListener(eventType, async (event) => {
    event.stopPropagation();
    const applied = await applyChanges(event);
    if (!applied) window.location.reload();
  }));
}

attachEventListners(document.querySelector('main'));
