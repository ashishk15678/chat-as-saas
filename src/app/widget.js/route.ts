/**
 * GET /widget.js
 *
 * Serves the Chatline embed loader script. Customers paste one <script> tag;
 * this file creates an iframe pointing at /embed/:id and injects a floating
 * bubble launcher into their page.
 */
export const runtime = "edge";

export function GET() {
  const script = `(function () {
  'use strict';

  var script = document.currentScript ||
    document.querySelector('script[data-chatline-id]');
  if (!script) return;

  var botId  = script.getAttribute('data-chatline-id');
  var origin = script.src.replace(/\\/widget\\.js.*$/, '');
  if (!botId) return;

  // ── Styles ──────────────────────────────────────────────────────────────
  var style = document.createElement('style');
  style.textContent = [
    '#chatline-bubble{',
    '  position:fixed;',
    '  bottom:24px;right:24px;',
    '  z-index:2147483647;',
    '  display:flex;flex-direction:column;align-items:flex-end;gap:10px;',
    '  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;',
    '}',
    '#chatline-btn{',
    '  width:56px;height:56px;',
    '  border-radius:50%;border:none;cursor:pointer;',
    '  background:#111110;color:#fff;',
    '  display:flex;align-items:center;justify-content:center;',
    '  box-shadow:0 4px 18px rgba(0,0,0,.25);',
    '  transition:transform .18s cubic-bezier(.32,.72,0,1),box-shadow .18s ease;',
    '  flex-shrink:0;',
    '}',
    '#chatline-btn:hover{transform:scale(1.06);box-shadow:0 6px 24px rgba(0,0,0,.32)}',
    '#chatline-btn:active{transform:scale(0.96)}',
    '#chatline-btn svg{width:22px;height:22px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}',
    '#chatline-label{',
    '  font-size:10px;letter-spacing:.06em;text-transform:uppercase;',
    '  color:rgba(15,15,14,.45);pointer-events:none;',
    '}',
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
    '#chatline-frame-wrap.open{',
    '  transform:scale(1) translateY(0);opacity:1;pointer-events:auto;',
    '}',
    '#chatline-frame-wrap iframe{width:100%;height:100%;border:0;display:block;}',
    '@media(max-width:480px){',
    '  #chatline-frame-wrap{',
    '    position:fixed;bottom:0;right:0;left:0;',
    '    width:100%;max-width:100%;max-height:85vh;',
    '    border-radius:18px 18px 0 0;',
    '    transform-origin:bottom center;',
    '  }',
    '}',
  ].join('');
  document.head.appendChild(style);

  // ── DOM ──────────────────────────────────────────────────────────────────
  var bubble  = document.createElement('div');
  bubble.id   = 'chatline-bubble';

  var frameWrap = document.createElement('div');
  frameWrap.id  = 'chatline-frame-wrap';

  var iframe    = document.createElement('iframe');
  iframe.title  = 'Chatline support chat';
  iframe.setAttribute('allow', 'microphone');
  // Lazy-load the iframe src — only set it on first open
  var loaded = false;

  var btn = document.createElement('button');
  btn.id  = 'chatline-btn';
  btn.setAttribute('aria-label', 'Open chat');
  btn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';

  var label = document.createElement('span');
  label.id  = 'chatline-label';
  label.textContent = 'Powered by Chatline';

  var open = false;

  function toggle() {
    open = !open;
    btn.setAttribute('aria-label', open ? 'Close chat' : 'Open chat');
    btn.innerHTML = open
      ? '<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
      : '<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';

    if (open && !loaded) {
      iframe.src = origin + '/embed/' + botId;
      frameWrap.appendChild(iframe);
      loaded = true;
    }
    frameWrap.classList.toggle('open', open);
  }

  btn.addEventListener('click', toggle);

  // Close when the embed page sends a close message
  window.addEventListener('message', function (e) {
    if (e.data && e.data.type === 'chatline:close') {
      if (open) toggle();
    }
  });

  frameWrap.appendChild(iframe);
  bubble.appendChild(frameWrap);
  bubble.appendChild(btn);
  bubble.appendChild(label);
  document.body.appendChild(bubble);
})();
`;

  return new Response(script, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
    },
  });
}
