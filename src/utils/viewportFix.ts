/**
 * Mobile Safari viewport height fix
 * 
 * Safari on iOS changes the viewport height when the address bar appears/disappears.
 * This utility calculates the actual viewport height and sets a CSS custom property
 * that can be used instead of 100vh for more reliable full-height layouts.
 */

function setViewportHeight(): void {
  // Calculate the actual viewport height
  const vh = window.innerHeight * 0.01;

  // Set the --vh custom property to the root element
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

function initViewportFix(): void {
  // Set initial value
  setViewportHeight();

  // Update on resize (handles orientation changes and address bar changes)
  window.addEventListener('resize', setViewportHeight);

  // Handle orientation change specifically for mobile devices
  window.addEventListener('orientationchange', () => {
    // Use a timeout to ensure the new dimensions are available
    setTimeout(setViewportHeight, 100);
  });

  // Handle focus/blur events which can trigger address bar changes on mobile
  window.addEventListener('focus', setViewportHeight);
  window.addEventListener('blur', setViewportHeight);

  // Visual viewport API support for modern browsers
  if ('visualViewport' in window) {
    window.visualViewport?.addEventListener('resize', setViewportHeight);
  }
}

export { initViewportFix, setViewportHeight };