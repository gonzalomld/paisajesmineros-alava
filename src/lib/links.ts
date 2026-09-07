/**
 * links.ts — enlaces externos.
 *
 * La pieza es una sola página: los enlaces que antes iban a /contacto y
 * /descubrir apuntan ahora a la web oficial, asfaltokia.eus. Se abren en
 * una pestaña nueva para no cortar el recorrido, y el nombre accesible lo
 * dice, que es lo que espera quien navega con lector de pantalla.
 */
export interface ExternalAttrs {
  target?: '_blank';
  rel?: string;
}

/** ¿El enlace sale del sitio? (tel: y mailto: no cuentan) */
export function isExternal(href: string | undefined): boolean {
  return !!href && /^https?:\/\//.test(href);
}

/** target y rel para un enlace externo; nada para uno interno. */
export function externalAttrs(href: string | undefined): ExternalAttrs {
  return isExternal(href) ? { target: '_blank', rel: 'noopener' } : {};
}

/** Etiqueta accesible: avisa de la pestaña nueva solo si la hay. */
export function linkLabel(label: string, href: string | undefined): string {
  return isExternal(href) ? `${label}, se abre en una pestaña nueva` : label;
}
