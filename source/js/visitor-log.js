(function () {
  'use strict';

  var script = document.currentScript || document.querySelector('[data-visitor-log-endpoint]');
  var endpoint = script && script.dataset ? script.dataset.visitorLogEndpoint : '';
  var hostname = window.location.hostname.toLowerCase();

  if (!endpoint || !/^(?:www\.)?caoyueyang\.org$/.test(hostname)) {
    return;
  }

  var payload = JSON.stringify({
    path: window.location.pathname,
    referrer: document.referrer,
    title: document.title,
    language: document.documentElement.lang || ''
  });
  var beaconBody = new Blob([payload], { type: 'text/plain;charset=UTF-8' });

  if (navigator.sendBeacon && navigator.sendBeacon(endpoint, beaconBody)) {
    return;
  }

  // Keep a fetch fallback for browsers that reject sendBeacon or have it
  // disabled. `keepalive` allows the request to finish during page unload.
  window.fetch(endpoint, {
    method: 'POST',
    body: payload,
    headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
    keepalive: true,
    mode: 'cors',
    credentials: 'omit'
  }).catch(function () {
    // Logging must never affect page rendering or navigation.
  });
}());
