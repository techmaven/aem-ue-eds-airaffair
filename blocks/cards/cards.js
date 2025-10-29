import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);

  // add classes to the parent element based on the text content of the child p element
  // This can be added to scripts.js if it's needed for other components
  block.querySelectorAll('div > p').forEach((p) => {
    if (p.textContent.trim().startsWith('card,')) {
      const parts = p.textContent.split(',').map((s) => s.trim());
      if (parts.length === 2) {
        const div = p.parentElement;
        const parent = div.parentElement;
        if (div && parent) {
          div.parentElement.classList.add(parts[1]);
        }
      }
      // Always remove the div if the name of the block is present in the text content
      const div = p.parentElement;
      if (div) div.remove();
    }
  });
}
