/**
 * JSON-LD serializer for `<script type="application/ld+json" set:html={…}>`.
 * Escapes `<` so operator-authored strings can never terminate the script
 * element early (`</script>` breakout hardening).
 */
export function safeJsonLd(obj) {
  return JSON.stringify(obj).replace(/</g, '\\u003c');
}
