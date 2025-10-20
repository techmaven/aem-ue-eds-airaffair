import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

/* eslint-disable no-console, no-plusplus */
export default function decorate(block) {
  console.log('[BOOKS DEBUG] Starting books block decoration');
  console.log('[BOOKS DEBUG] Block element:', block);
  console.log('[BOOKS DEBUG] Block children count:', block.children.length);
  console.log('[BOOKS DEBUG] Block innerHTML:', block.innerHTML);

  /* change to ul, li */
  const ul = document.createElement('ul');
  console.log('[BOOKS DEBUG] Created ul element:', ul);

  [...block.children].forEach((row, rowIndex) => {
    console.log(`[BOOKS DEBUG] Processing row ${rowIndex}:`, row);
    console.log(`[BOOKS DEBUG] Row ${rowIndex} children count:`, row.children.length);
    console.log(`[BOOKS DEBUG] Row ${rowIndex} innerHTML:`, row.innerHTML);

    const li = document.createElement('li');
    console.log(`[BOOKS DEBUG] Created li element for row ${rowIndex}:`, li);

    console.log(`[BOOKS DEBUG] Moving instrumentation from row ${rowIndex} to li`);
    moveInstrumentation(row, li);

    console.log(`[BOOKS DEBUG] Moving child elements from row ${rowIndex} to li`);
    let childMoveCount = 0;
    while (row.firstElementChild) {
      console.log(`[BOOKS DEBUG] Moving child ${childMoveCount} from row ${rowIndex}:`, row.firstElementChild);
      li.append(row.firstElementChild);
      childMoveCount += 1;
    }
    console.log(`[BOOKS DEBUG] Moved ${childMoveCount} children from row ${rowIndex} to li`);

    console.log(`[BOOKS DEBUG] Processing li children for row ${rowIndex}, count:`, li.children.length);
    [...li.children].forEach((div, divIndex) => {
      console.log(`[BOOKS DEBUG] Processing div ${divIndex} in row ${rowIndex}:`, div);
      console.log(`[BOOKS DEBUG] Div ${divIndex} children count:`, div.children.length);
      console.log(`[BOOKS DEBUG] Div ${divIndex} has picture:`, !!div.querySelector('picture'));

      if (div.children.length === 1 && div.querySelector('picture')) {
        console.log(`[BOOKS DEBUG] Assigning 'books-book-cover' class to div ${divIndex} in row ${rowIndex}`);
        div.className = 'books-book-cover';
      } else {
        console.log(`[BOOKS DEBUG] Assigning 'books-book-body' class to div ${divIndex} in row ${rowIndex}`);
        div.className = 'books-book-body';
      }
      console.log(`[BOOKS DEBUG] Div ${divIndex} final className:`, div.className);
    });

    console.log(`[BOOKS DEBUG] Appending li for row ${rowIndex} to ul`);
    ul.append(li);
  });

  console.log('[BOOKS DEBUG] Finished processing all rows');
  console.log('[BOOKS DEBUG] Final ul structure:', ul);
  console.log('[BOOKS DEBUG] Final ul innerHTML:', ul.innerHTML);

  const images = ul.querySelectorAll('picture > img');
  console.log('[BOOKS DEBUG] Found images to optimize:', images.length);

  images.forEach((img, imgIndex) => {
    console.log(`[BOOKS DEBUG] Processing image ${imgIndex}:`, img);
    console.log(`[BOOKS DEBUG] Image ${imgIndex} src:`, img.src);
    console.log(`[BOOKS DEBUG] Image ${imgIndex} alt:`, img.alt);

    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    console.log(`[BOOKS DEBUG] Created optimized picture for image ${imgIndex}:`, optimizedPic);

    console.log(`[BOOKS DEBUG] Moving instrumentation from original img ${imgIndex} to optimized img`);
    moveInstrumentation(img, optimizedPic.querySelector('img'));

    const originalPicture = img.closest('picture');
    console.log(`[BOOKS DEBUG] Replacing original picture for image ${imgIndex}:`, originalPicture);
    originalPicture.replaceWith(optimizedPic);
    console.log(`[BOOKS DEBUG] Successfully replaced picture for image ${imgIndex}`);
  });

  console.log('[BOOKS DEBUG] Finished optimizing images');
  console.log('[BOOKS DEBUG] Clearing block textContent and appending ul');
  console.log('[BOOKS DEBUG] Block before clearing:', block.innerHTML);

  block.textContent = '';
  block.append(ul);

  console.log('[BOOKS DEBUG] Block decoration complete');
  console.log('[BOOKS DEBUG] Final block innerHTML:', block.innerHTML);
  console.log('[BOOKS DEBUG] Final block structure:', block);
}
