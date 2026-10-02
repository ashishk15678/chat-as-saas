export const runtime = "edge";

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Cross-Origin-Resource-Policy": "cross-origin",
    },
  });
}

export function GET() {
  const script = `(function () {
  'use strict';

  // Guard: only run once per page load even if the script tag appears twice
  if (window.__chatlineLoaded) return;
  window.__chatlineLoaded = true;

  var script = document.currentScript ||
    document.querySelector('script[data-chatline-id]');
  if (!script) return;

  var botId  = script.getAttribute('data-chatline-id');
  var origin = script.src.replace(/\\/widget\\.js.*$/, '');
  if (!botId) return;

  // ── Styles (injected once into <head>, never removed) ──────────────────
  if (!document.getElementById('chatline-styles')) {
    var style = document.createElement('style');
    style.id = 'chatline-styles';
    style.textContent = [
      '#chatline-bubble{',
      '  position:fixed;bottom:24px;right:24px;',
      '  z-index:2147483647;',
      '  display:flex;flex-direction:column;align-items:flex-end;gap:10px;',
      '  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;',
      '}',
      '#chatline-btn{',
      '  width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;',
      '  background:#111110;color:#fff;',
      '  display:flex;align-items:center;justify-content:center;',
      '  box-shadow:0 4px 18px rgba(0,0,0,.25);',
      '  transition:transform .18s cubic-bezier(.32,.72,0,1),box-shadow .18s ease;',
      '  flex-shrink:0;',
      '}',
      '#chatline-btn:hover{transform:scale(1.06);box-shadow:0 6px 24px rgba(0,0,0,.32)}',
      '#chatline-btn:active{transform:scale(0.96)}',
      '#chatline-btn svg{width:22px;height:22px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}',
      '#chatline-label{font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:rgba(15,15,14,.45);pointer-events:none;}',
      '#chatline-frame-wrap{',
      '  position:absolute;bottom:70px;right:0;',
      '  width:380px;max-width:calc(100vw - 32px);',
      '  height:560px;max-height:calc(100vh - 100px);',
      '  border-radius:16px;overflow:hidden;',
      '  box-shadow:0 8px 40px rgba(0,0,0,.18),0 1px 0 rgba(0,0,0,.08);',
      '  transform-origin:bottom right;',
      '  transform:scale(0) translateY(12px);opacity:0;',
      '  transition:transform .22s cubic-bezier(.32,.72,0,1),opacity .18s ease;',
      '  pointer-events:none;',
      '}',
      '#chatline-frame-wrap.open{transform:scale(1) translateY(0);opacity:1;pointer-events:auto;}',
      '#chatline-frame-wrap iframe{width:100%;height:100%;border:0;display:block;}',
      '@media(max-width:480px){',
      '  #chatline-frame-wrap{',
      '    position:fixed;bottom:0;right:0;left:0;width:100%;max-width:100%;max-height:85vh;',
      '    border-radius:18px 18px 0 0;transform-origin:bottom center;',
      '  }',
      '}',
    ].join('');
    document.head.appendChild(style);
  }

  // ── Build the bubble DOM ────────────────────────────────────────────────
  var bubble = document.createElement('div');
  bubble.id  = 'chatline-bubble';

  var frameWrap = document.createElement('div');
  frameWrap.id  = 'chatline-frame-wrap';

  var iframe = document.createElement('iframe');
  iframe.title = 'Chatline support chat';
  iframe.setAttribute('allow', 'microphone');
  frameWrap.appendChild(iframe);

  var btn = document.createElement('button');
  btn.id  = 'chatline-btn';
  btn.setAttribute('aria-label', 'Open chat');
  btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';

  var label = document.createElement('span');
  label.id  = 'chatline-label';
  label.textContent = 'Powered by Chatline';

  bubble.appendChild(frameWrap);
  bubble.appendChild(btn);
  bubble.appendChild(label);

  // State shared across re-mounts
  var open   = false;
  var loaded = false;

  function toggle() {
    open = !open;
    btn.setAttribute('aria-label', open ? 'Close chat' : 'Open chat');
    btn.innerHTML = open
      ? '<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
      : '<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
    if (open && !loaded) {
      iframe.src = origin + '/embed/' + botId;
      loaded = true;
    }
    frameWrap.classList.toggle('open', open);
  }

  btn.addEventListener('click', toggle);

  window.addEventListener('message', function (e) {
    if (e.data && e.data.type === 'chatline:close' && open) toggle();
  });

  // ── Mount + survive Next.js client-side navigation ──────────────────────
  // Next.js App Router replaces <body> children on navigation, wiping any
  // DOM nodes appended outside React's tree. The MutationObserver watches
  // document.body and re-appends the bubble whenever it disappears.

  function mount() {
    if (!document.getElementById('chatline-bubble')) {
      document.body.appendChild(bubble);
    }
  }

  mount();

  var observer = new MutationObserver(function () {
    if (!document.getElementById('chatline-bubble')) {
      mount();
    }
  });

  // Watch for child list changes on <body> (covers Next.js route transitions)
  observer.observe(document.body, { childList: true, subtree: false });

  // Also re-mount on Next.js soft navigations via popstate / pushState
  window.addEventListener('popstate', mount);
  (function () {
    var orig = history.pushState;
    history.pushState = function () {
      orig.apply(this, arguments);
      mount();
    };
  })();

})();
`;

  return new Response(script, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Cross-Origin-Resource-Policy": "cross-origin",
      // Short cache so fixes roll out quickly; CDN can still serve stale
      "Cache-Control": "public, max-age=60, stale-while-revalidate=300",
    },
  });
}
